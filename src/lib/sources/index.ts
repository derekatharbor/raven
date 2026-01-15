// src/lib/sources/index.ts

/**
 * Raven Source System
 * 
 * This module provides the infrastructure for connecting to and querying
 * data sources like SEC EDGAR, PitchBook, Bloomberg, etc.
 * 
 * Usage:
 * ```tsx
 * import { sourceRegistry, useSources } from '@/lib/sources'
 * 
 * // In a component
 * const { connect, search, connectedSources } = useSources()
 * 
 * // Connect to SEC EDGAR
 * await connect({ type: 'sec-edgar', config: { userAgent: '...' } })
 * 
 * // Search for documents
 * const results = await search('sec-edgar', { query: 'NVDA revenue' })
 * ```
 */

// Types
export * from './types'

// Registry (singleton)
export { sourceRegistry, SourceRegistry } from './registry'

// Adapters
export { SECEdgarAdapter, createSECEdgarAdapter } from './adapters/sec-edgar'
