// Path: src/types/tracking.ts
// Document Tracking Types
// Hotjar-style analytics for published documents

export interface DocumentVersion {
  id: string
  document_id: string
  version_number: number
  blocks_snapshot: Block[]
  title_snapshot: string | null
  commit_message: string | null
  published_at: string
  created_by: string | null
}

export interface PublishedLink {
  id: string
  document_id: string
  slug: string
  password_hash: string | null
  require_email: boolean
  expires_at: string | null
  notify_on_view: boolean
  current_version_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface DocumentViewer {
  id: string
  email: string | null
  name: string | null
  company: string | null
  fingerprint: string | null
  first_seen_at: string
  last_seen_at: string
}

export interface ViewSession {
  id: string
  link_id: string
  viewer_id: string | null
  version_id: string | null
  started_at: string
  ended_at: string | null
  user_agent: string | null
  device_type: 'desktop' | 'mobile' | 'tablet' | null
  browser: string | null
  os: string | null
  country: string | null
  city: string | null
  total_dwell_ms: number
  completion_rate: number
  blocks_viewed: number
  total_blocks: number
  furthest_block_index: number
  had_interaction: boolean
  had_reread: boolean
  tab_switches: number
}

export interface BlockEvent {
  id?: string
  session_id: string
  block_id: string
  block_index: number
  event_type: 'enter' | 'exit' | 'reread' | 'interact' | 'copy'
  timestamp: string
  dwell_ms?: number
  scroll_velocity?: number
  viewport_percent?: number
  interaction_type?: 'copy' | 'click' | 'highlight'
  interaction_data?: Record<string, unknown>
}

// Block type from existing system
export interface Block {
  id: string
  type: 'paragraph' | 'heading1' | 'heading2' | 'bulletList' | 'quote' | 
        'divider' | 'table' | 'chart' | 'callout' | 'variable' | 'signal'
  content: string
  meta?: Record<string, unknown>
}

// Analytics aggregates for dashboard
export interface DocumentAnalytics {
  document_id: string
  total_views: number
  unique_viewers: number
  avg_completion_rate: number
  avg_read_time_ms: number
  total_interactions: number
  
  // Block-level metrics
  block_metrics: BlockMetrics[]
  
  // Time-series data
  views_by_day: { date: string; views: number }[]
  
  // Top viewers
  top_viewers: ViewerSummary[]
  
  // Version comparison
  version_stats: VersionStats[]
}

export interface BlockMetrics {
  block_id: string
  block_index: number
  block_type: string
  block_preview: string // First 50 chars of content
  
  // Engagement metrics
  total_enters: number
  avg_dwell_ms: number
  reread_count: number
  interaction_count: number
  drop_off_count: number // People who left here
  
  // Computed scores
  engagement_score: number // 0-100
  is_hotspot: boolean
  is_dropoff_point: boolean
}

export interface ViewerSummary {
  viewer_id: string
  email: string | null
  name: string | null
  company: string | null
  total_sessions: number
  total_time_ms: number
  last_viewed: string
  avg_completion: number
}

export interface VersionStats {
  version_id: string
  version_number: number
  commit_message: string | null
  published_at: string
  total_views: number
  avg_completion: number
  avg_read_time_ms: number
}

// Real-time tracking state (client-side)
export interface TrackingState {
  session_id: string
  blocks_in_view: Set<string>
  block_enter_times: Map<string, number>
  block_dwell_totals: Map<string, number>
  furthest_index: number
  total_blocks: number
  event_buffer: TrackingEvent[]
  last_scroll_y: number
  last_scroll_time: number
  is_visible: boolean
}

// Event as stored in buffer (without session_id - added on flush)
export interface TrackingEvent {
  block_id: string
  block_index: number
  event_type: 'enter' | 'exit' | 'reread' | 'interact' | 'copy'
  timestamp: string
  dwell_ms?: number
  scroll_velocity?: number
  viewport_percent?: number
  interaction_type?: 'copy' | 'click' | 'highlight'
  interaction_data?: Record<string, unknown>
}

// API payloads
export interface StartSessionPayload {
  link_id: string
  fingerprint: string
  email?: string
  user_agent: string
}

export interface StartSessionResponse {
  session_id: string
  version: DocumentVersion
  blocks: Block[]
}

export interface TrackEventsPayload {
  session_id: string
  events: Omit<BlockEvent, 'id' | 'session_id'>[]
  session_update?: Partial<Pick<ViewSession, 
    'total_dwell_ms' | 'completion_rate' | 'blocks_viewed' | 
    'furthest_block_index' | 'had_interaction' | 'had_reread' | 'tab_switches'
  >>
}

export interface EndSessionPayload {
  session_id: string
  ended_at: string
  final_metrics: {
    total_dwell_ms: number
    completion_rate: number
    blocks_viewed: number
    furthest_block_index: number
  }
}
