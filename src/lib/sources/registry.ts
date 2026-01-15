// src/lib/sources/registry.ts

import type {
  SourceType,
  SourceMeta,
  SourceAdapter,
  ConnectedSource,
  SourceConfig,
  SourceQuery,
  SourceResult,
} from './types'
import { createSECEdgarAdapter } from './adapters/sec-edgar'

/**
 * Source Registry
 * 
 * Central manager for all source adapters. Handles:
 * - Available sources (what can be connected)
 * - Connected sources (what is currently active)
 * - Routing queries to appropriate adapters
 */

class SourceRegistry {
  private adapters: Map<SourceType, SourceAdapter> = new Map()
  private connectedSources: Map<SourceType, ConnectedSource> = new Map()
  private listeners: Set<() => void> = new Set()

  constructor() {
    // Register available adapters (but don't connect them yet)
    this.registerAvailableAdapters()
  }

  private registerAvailableAdapters() {
    // SEC EDGAR - always available (no auth required)
    const secAdapter = createSECEdgarAdapter()
    this.adapters.set('sec-edgar', secAdapter)

    // Future adapters will be registered here:
    // this.adapters.set('pitchbook', createPitchBookAdapter())
    // this.adapters.set('google-drive', createGoogleDriveAdapter())
  }

  // ============================================================================
  // AVAILABLE SOURCES
  // ============================================================================

  getAvailableSources(): SourceMeta[] {
    return Array.from(this.adapters.values()).map(a => a.meta)
  }

  getSourceMeta(type: SourceType): SourceMeta | undefined {
    return this.adapters.get(type)?.meta
  }

  // ============================================================================
  // CONNECTION MANAGEMENT
  // ============================================================================

  async connect(config: SourceConfig): Promise<{ success: boolean; error?: string }> {
    const adapter = this.adapters.get(config.type)
    if (!adapter) {
      return { success: false, error: `Unknown source type: ${config.type}` }
    }

    // Update state to connecting
    this.connectedSources.set(config.type, {
      type: config.type,
      status: 'connecting',
      config: config.config,
    })
    this.notifyListeners()

    // Test the connection
    const result = await adapter.testConnection()

    if (result.success) {
      this.connectedSources.set(config.type, {
        type: config.type,
        status: 'connected',
        connectedAt: new Date().toISOString(),
        config: config.config,
      })
    } else {
      this.connectedSources.set(config.type, {
        type: config.type,
        status: 'error',
        error: result.error,
        config: config.config,
      })
    }

    this.notifyListeners()
    return result
  }

  disconnect(type: SourceType): void {
    this.connectedSources.delete(type)
    this.notifyListeners()
  }

  isConnected(type: SourceType): boolean {
    return this.connectedSources.get(type)?.status === 'connected'
  }

  getConnectedSources(): ConnectedSource[] {
    return Array.from(this.connectedSources.values())
  }

  getConnectionStatus(type: SourceType): ConnectedSource | undefined {
    return this.connectedSources.get(type)
  }

  // ============================================================================
  // QUERYING
  // ============================================================================

  async search(type: SourceType, query: SourceQuery): Promise<SourceResult | null> {
    const adapter = this.adapters.get(type)
    if (!adapter) {
      console.error(`No adapter found for source: ${type}`)
      return null
    }

    if (!this.isConnected(type)) {
      console.error(`Source not connected: ${type}`)
      return null
    }

    try {
      return await adapter.search(query)
    } catch (error) {
      console.error(`Search error for ${type}:`, error)
      return null
    }
  }

  async searchAll(query: SourceQuery): Promise<SourceResult[]> {
    const results: SourceResult[] = []
    const connected = this.getConnectedSources()

    await Promise.all(
      connected
        .filter(s => s.status === 'connected')
        .map(async (source) => {
          const result = await this.search(source.type, query)
          if (result && result.documents.length > 0) {
            results.push(result)
          }
        })
    )

    return results
  }

  getAdapter(type: SourceType): SourceAdapter | undefined {
    return this.adapters.get(type)
  }

  // ============================================================================
  // SUGGESTIONS (for @ mentions)
  // ============================================================================

  async getSuggestions(type: SourceType, partial: string): Promise<string[]> {
    const adapter = this.adapters.get(type)
    if (!adapter || !this.isConnected(type)) {
      return []
    }

    return adapter.getSuggestions(partial)
  }

  async getAllSuggestions(partial: string): Promise<Array<{ source: SourceType; suggestions: string[] }>> {
    const results: Array<{ source: SourceType; suggestions: string[] }> = []
    const connected = this.getConnectedSources()

    await Promise.all(
      connected
        .filter(s => s.status === 'connected')
        .map(async (source) => {
          const suggestions = await this.getSuggestions(source.type, partial)
          if (suggestions.length > 0) {
            results.push({ source: source.type, suggestions })
          }
        })
    )

    return results
  }

  // ============================================================================
  // SUBSCRIPTIONS
  // ============================================================================

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener())
  }

  // ============================================================================
  // PERSISTENCE
  // ============================================================================

  toJSON(): Array<{ type: SourceType; config?: unknown }> {
    return Array.from(this.connectedSources.entries()).map(([type, source]) => ({
      type,
      config: source.config,
    }))
  }

  async restoreConnections(
    saved: Array<{ type: SourceType; config?: unknown }>
  ): Promise<void> {
    for (const { type, config } of saved) {
      // Reconstruct the config based on type
      await this.connect({ type, config } as SourceConfig)
    }
  }
}

// Singleton instance
export const sourceRegistry = new SourceRegistry()

// Export for testing
export { SourceRegistry }