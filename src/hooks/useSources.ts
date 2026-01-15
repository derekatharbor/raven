// src/hooks/useSources.ts

'use client'

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react'
import { sourceRegistry } from '@/lib/sources/registry'
import type {
  SourceType,
  SourceMeta,
  ConnectedSource,
  SourceConfig,
  SourceQuery,
  SourceResult,
  SourceDocument,
} from '@/lib/sources/types'

/**
 * React hook for managing and querying sources.
 * 
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const { 
 *     availableSources,
 *     connectedSources,
 *     connect,
 *     disconnect,
 *     search,
 *   } = useSources()
 * 
 *   // Connect to SEC EDGAR
 *   await connect({ type: 'sec-edgar', config: { userAgent: '...' } })
 * 
 *   // Search for NVIDIA filings
 *   const results = await search('sec-edgar', { 
 *     query: 'revenue', 
 *     filters: { ticker: 'NVDA' } 
 *   })
 * }
 * ```
 */

// Cache for stable references
let cachedConnectedSources: ConnectedSource[] = []

function getConnectedSourcesSnapshot(): ConnectedSource[] {
  const current = sourceRegistry.getConnectedSources()
  // Only update cache if contents changed
  if (
    current.length !== cachedConnectedSources.length ||
    current.some((s, i) => 
      s.type !== cachedConnectedSources[i]?.type || 
      s.status !== cachedConnectedSources[i]?.status
    )
  ) {
    cachedConnectedSources = current
  }
  return cachedConnectedSources
}

export function useSources() {
  // Subscribe to registry changes
  const connectedSources = useSyncExternalStore(
    useCallback((cb) => sourceRegistry.subscribe(cb), []),
    getConnectedSourcesSnapshot,
    getConnectedSourcesSnapshot
  )

  const availableSources = sourceRegistry.getAvailableSources()

  const connect = useCallback(async (config: SourceConfig) => {
    return sourceRegistry.connect(config)
  }, [])

  const disconnect = useCallback((type: SourceType) => {
    sourceRegistry.disconnect(type)
  }, [])

  const isConnected = useCallback((type: SourceType) => {
    return sourceRegistry.isConnected(type)
  }, [])

  const search = useCallback(async (type: SourceType, query: SourceQuery) => {
    return sourceRegistry.search(type, query)
  }, [])

  const searchAll = useCallback(async (query: SourceQuery) => {
    return sourceRegistry.searchAll(query)
  }, [])

  const getSuggestions = useCallback(async (type: SourceType, partial: string) => {
    return sourceRegistry.getSuggestions(type, partial)
  }, [])

  const getAllSuggestions = useCallback(async (partial: string) => {
    return sourceRegistry.getAllSuggestions(partial)
  }, [])

  return {
    // State
    availableSources,
    connectedSources,
    
    // Connection management
    connect,
    disconnect,
    isConnected,
    
    // Querying
    search,
    searchAll,
    
    // @ mention suggestions
    getSuggestions,
    getAllSuggestions,
  }
}

/**
 * Hook for searching a specific source with loading state.
 */
export function useSourceSearch(sourceType: SourceType) {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<SourceResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (query: SourceQuery) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await sourceRegistry.search(sourceType, query)
      setResults(result)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed'
      setError(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [sourceType])

  const clear = useCallback(() => {
    setResults(null)
    setError(null)
  }, [])

  return {
    isLoading,
    results,
    error,
    search,
    clear,
  }
}

/**
 * Hook for @ mention autocomplete.
 */
export function useSourceSuggestions() {
  const [suggestions, setSuggestions] = useState<Array<{
    source: SourceType
    sourceMeta: SourceMeta
    suggestions: string[]
  }>>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchSuggestions = useCallback(async (partial: string) => {
    if (partial.length < 1) {
      setSuggestions([])
      return
    }

    setIsLoading(true)

    try {
      const results = await sourceRegistry.getAllSuggestions(partial)
      const enriched = results.map(r => ({
        ...r,
        sourceMeta: sourceRegistry.getSourceMeta(r.source)!,
      }))
      setSuggestions(enriched)
    } catch (err) {
      console.error('Suggestions error:', err)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clear = useCallback(() => {
    setSuggestions([])
  }, [])

  return {
    suggestions,
    isLoading,
    fetchSuggestions,
    clear,
  }
}

// Re-export types for convenience
export type {
  SourceType,
  SourceMeta,
  ConnectedSource,
  SourceConfig,
  SourceQuery,
  SourceResult,
  SourceDocument,
}