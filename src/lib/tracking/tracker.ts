// Path: src/lib/tracking/tracker.ts
// Raven Document Tracker
// Block-level analytics like Hotjar for documents

import type { TrackEventsPayload, TrackingState, TrackingEvent } from '@/types/tracking'

const FLUSH_INTERVAL = 3000 // Send events every 3 seconds
const INTERSECTION_THRESHOLD = 0.5 // 50% visible = "seen"
const REREAD_THRESHOLD = 2000 // If they come back after 2s, it's a re-read

export class RavenTracker {
  private state: TrackingState
  private observer: IntersectionObserver | null = null
  private flushInterval: NodeJS.Timeout | null = null
  private scrollTimeout: NodeJS.Timeout | null = null
  private apiEndpoint: string
  
  constructor(sessionId: string, totalBlocks: number, apiEndpoint = '/api/track') {
    this.apiEndpoint = apiEndpoint
    this.state = {
      session_id: sessionId,
      blocks_in_view: new Set(),
      block_enter_times: new Map(),
      block_dwell_totals: new Map(),
      furthest_index: -1,
      total_blocks: totalBlocks,
      event_buffer: [],
      last_scroll_y: 0,
      last_scroll_time: Date.now(),
      is_visible: true,
    }
  }

  init() {
    if (typeof window === 'undefined') return

    // Set up IntersectionObserver for block visibility
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      { threshold: INTERSECTION_THRESHOLD }
    )

    // Observe all tracked blocks
    document.querySelectorAll('[data-block-id]').forEach(el => {
      this.observer?.observe(el)
    })

    // Track scroll velocity
    window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true })

    // Track tab visibility (did they switch away?)
    document.addEventListener('visibilitychange', this.handleVisibility.bind(this))

    // Track copy events
    document.addEventListener('copy', this.handleCopy.bind(this))

    // Periodic flush
    this.flushInterval = setInterval(() => this.flush(), FLUSH_INTERVAL)

    // Flush on page unload
    window.addEventListener('beforeunload', () => this.flush(true))
    window.addEventListener('pagehide', () => this.flush(true))

    console.log('[RavenTracker] Initialized with', this.state.total_blocks, 'blocks')
  }

  destroy() {
    this.observer?.disconnect()
    if (this.flushInterval) clearInterval(this.flushInterval)
    if (this.scrollTimeout) clearTimeout(this.scrollTimeout)
    window.removeEventListener('scroll', this.handleScroll.bind(this))
    document.removeEventListener('visibilitychange', this.handleVisibility.bind(this))
    document.removeEventListener('copy', this.handleCopy.bind(this))
    
    // Final flush
    this.flush(true)
  }

  private handleIntersection(entries: IntersectionObserverEntry[]) {
    const now = Date.now()

    entries.forEach(entry => {
      const blockId = (entry.target as HTMLElement).dataset.blockId
      const blockIndex = parseInt((entry.target as HTMLElement).dataset.blockIndex || '0')
      
      if (!blockId) return

      if (entry.isIntersecting) {
        // Block entered viewport
        const wasInView = this.state.blocks_in_view.has(blockId)
        const previousDwell = this.state.block_dwell_totals.get(blockId) || 0
        
        this.state.blocks_in_view.add(blockId)
        this.state.block_enter_times.set(blockId, now)
        
        // Update furthest block
        if (blockIndex > this.state.furthest_index) {
          this.state.furthest_index = blockIndex
        }

        // Is this a re-read? (came back after being away)
        const isReread = wasInView && previousDwell > REREAD_THRESHOLD

        this.emit({
          block_id: blockId,
          block_index: blockIndex,
          event_type: isReread ? 'reread' : 'enter',
          timestamp: new Date().toISOString(),
          viewport_percent: entry.intersectionRatio,
        })

      } else {
        // Block left viewport
        if (this.state.block_enter_times.has(blockId)) {
          const enterTime = this.state.block_enter_times.get(blockId)!
          const dwell = now - enterTime
          
          // Accumulate total dwell time for this block
          const previousDwell = this.state.block_dwell_totals.get(blockId) || 0
          this.state.block_dwell_totals.set(blockId, previousDwell + dwell)
          
          this.state.blocks_in_view.delete(blockId)
          
          this.emit({
            block_id: blockId,
            block_index: blockIndex,
            event_type: 'exit',
            timestamp: new Date().toISOString(),
            dwell_ms: dwell,
            viewport_percent: entry.intersectionRatio,
          })
        }
      }
    })
  }

  private handleScroll() {
    const now = Date.now()
    const currentY = window.scrollY
    const timeDelta = now - this.state.last_scroll_time
    const distanceDelta = Math.abs(currentY - this.state.last_scroll_y)
    
    // Calculate velocity (pixels per second)
    const velocity = timeDelta > 0 ? (distanceDelta / timeDelta) * 1000 : 0
    
    // Update state for next calculation
    this.state.last_scroll_y = currentY
    this.state.last_scroll_time = now

    // We'll attach velocity to exit events rather than creating separate scroll events
    // This keeps event volume manageable
  }

  private handleVisibility() {
    const wasVisible = this.state.is_visible
    this.state.is_visible = document.visibilityState === 'visible'

    if (wasVisible && !this.state.is_visible) {
      // User switched tabs - record dwell for all blocks in view
      this.recordCurrentDwells()
    }
  }

  private handleCopy(e: ClipboardEvent) {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const container = range.commonAncestorContainer

    // Find the block element
    let blockEl: HTMLElement | null = null
    if (container instanceof HTMLElement) {
      blockEl = container.closest('[data-block-id]')
    } else if (container.parentElement) {
      blockEl = container.parentElement.closest('[data-block-id]')
    }

    if (blockEl) {
      const blockId = blockEl.dataset.blockId
      const blockIndex = parseInt(blockEl.dataset.blockIndex || '0')

      if (blockId) {
        this.emit({
          block_id: blockId,
          block_index: blockIndex,
          event_type: 'interact',
          timestamp: new Date().toISOString(),
          interaction_type: 'copy',
          interaction_data: {
            copied_length: selection.toString().length,
          },
        })
      }
    }
  }

  private recordCurrentDwells() {
    const now = Date.now()
    
    this.state.blocks_in_view.forEach(blockId => {
      const enterTime = this.state.block_enter_times.get(blockId)
      if (enterTime) {
        const dwell = now - enterTime
        const previousDwell = this.state.block_dwell_totals.get(blockId) || 0
        this.state.block_dwell_totals.set(blockId, previousDwell + dwell)
        // Reset enter time for fresh measurement when they return
        this.state.block_enter_times.set(blockId, now)
      }
    })
  }

  private emit(event: TrackingEvent) {
    this.state.event_buffer.push(event)
  }

  private async flush(beacon = false) {
    if (this.state.event_buffer.length === 0) return

    // Record current dwells before sending
    this.recordCurrentDwells()

    // Calculate session metrics
    const totalDwell = Array.from(this.state.block_dwell_totals.values())
      .reduce((sum, d) => sum + d, 0)
    
    const blocksViewed = this.state.block_dwell_totals.size
    const completionRate = this.state.total_blocks > 0 
      ? (this.state.furthest_index + 1) / this.state.total_blocks 
      : 0

    const payload: TrackEventsPayload = {
      session_id: this.state.session_id,
      events: [...this.state.event_buffer],
      session_update: {
        total_dwell_ms: totalDwell,
        completion_rate: completionRate,
        blocks_viewed: blocksViewed,
        furthest_block_index: this.state.furthest_index,
        had_interaction: this.state.event_buffer.some(e => e.event_type === 'interact'),
        had_reread: this.state.event_buffer.some(e => e.event_type === 'reread'),
      },
    }

    // Clear buffer
    this.state.event_buffer = []

    const body = JSON.stringify(payload)

    if (beacon && navigator.sendBeacon) {
      // Use sendBeacon for unload - more reliable
      navigator.sendBeacon(this.apiEndpoint, body)
    } else {
      try {
        await fetch(this.apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true, // Important for unload
        })
      } catch (err) {
        console.error('[RavenTracker] Failed to send events:', err)
      }
    }
  }

  // Manual tracking methods for custom interactions
  trackInteraction(blockId: string, blockIndex: number, type: string, data?: Record<string, unknown>) {
    this.state.event_buffer.push({
      block_id: blockId,
      block_index: blockIndex,
      event_type: 'interact',
      timestamp: new Date().toISOString(),
      interaction_type: type as 'copy' | 'click' | 'highlight',
      interaction_data: data,
    })
  }

  // Get current metrics (for real-time display if needed)
  getMetrics() {
    const totalDwell = Array.from(this.state.block_dwell_totals.values())
      .reduce((sum, d) => sum + d, 0)
    
    return {
      blocks_viewed: this.state.block_dwell_totals.size,
      total_dwell_ms: totalDwell,
      completion_rate: this.state.total_blocks > 0 
        ? (this.state.furthest_index + 1) / this.state.total_blocks 
        : 0,
      furthest_index: this.state.furthest_index,
    }
  }
}

// Fingerprinting for anonymous viewers
export function generateFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 'unknown',
  ]
  
  // Simple hash function
  const str = components.join('|')
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  
  return 'fp_' + Math.abs(hash).toString(36)
}

// Parse user agent for device info
export function parseUserAgent(ua: string) {
  const isMobile = /Mobile|Android|iPhone|iPad/.test(ua)
  const isTablet = /iPad|Tablet/.test(ua)
  
  let browser = 'Unknown'
  if (ua.includes('Chrome')) browser = 'Chrome'
  else if (ua.includes('Safari')) browser = 'Safari'
  else if (ua.includes('Firefox')) browser = 'Firefox'
  else if (ua.includes('Edge')) browser = 'Edge'
  
  let os = 'Unknown'
  if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Mac')) os = 'macOS'
  else if (ua.includes('Linux')) os = 'Linux'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'
  
  return {
    device_type: isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop',
    browser,
    os,
  }
}
