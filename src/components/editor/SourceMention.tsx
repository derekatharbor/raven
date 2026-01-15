// src/components/editor/SourceMention.tsx

'use client'

import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react'
import { useSources, useSourceSuggestions } from '@/hooks/useSources'
import type { SourceType, SourceMeta } from '@/lib/sources/types'
import {
  Building2,
  Database,
  Globe,
  HardDrive,
  FileText,
  Search,
  Loader2,
  ChevronRight,
} from 'lucide-react'

/**
 * Source Mention Component
 * 
 * Appears when user types @ in the editor.
 * Shows connected sources and query suggestions.
 * 
 * Two modes:
 * 1. Source selection: "@" shows list of connected sources
 * 2. Query input: "@SEC " shows suggestions for that source
 */

// Icon mapping
const SOURCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  Database,
  Globe,
  HardDrive,
  FileText,
}

export interface SourceMentionRef {
  onKeyDown: (event: KeyboardEvent) => boolean
}

interface SourceMentionProps {
  query: string  // Text after @, e.g., "SEC nvda" or just ""
  onSelect: (item: { source: SourceType; query?: string }) => void
  onClose: () => void
}

interface MentionItem {
  id: string
  type: 'source' | 'suggestion'
  source: SourceType
  sourceMeta: SourceMeta
  label: string
  query?: string
}

const SourceMention = forwardRef<SourceMentionRef, SourceMentionProps>(
  ({ query, onSelect, onClose }, ref) => {
    const { connectedSources, availableSources } = useSources()
    const { suggestions, isLoading, fetchSuggestions } = useSourceSuggestions()
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [items, setItems] = useState<MentionItem[]>([])

    // Parse the query to determine mode
    // "@" or "@S" = source selection mode
    // "@SEC " or "@SEC nvda" = query mode for SEC source
    const parseQuery = useCallback((q: string) => {
      const parts = q.trim().split(/\s+/)
      const sourceKey = parts[0]?.toUpperCase()
      const queryPart = parts.slice(1).join(' ')

      // Check if first word matches a connected source
      const matchedSource = connectedSources.find(s => 
        s.type.toUpperCase().replace('-', '').includes(sourceKey.replace('-', '')) ||
        availableSources.find(m => m.id === s.type)?.name.toUpperCase().includes(sourceKey)
      )

      if (matchedSource && parts.length > 1) {
        return { mode: 'query' as const, source: matchedSource.type, queryText: queryPart }
      }

      return { mode: 'source' as const, filter: q }
    }, [connectedSources, availableSources])

    // Build items list based on mode
    useEffect(() => {
      const { mode, source, queryText, filter } = parseQuery(query)

      if (mode === 'query' && source) {
        // Fetch suggestions for this source
        fetchSuggestions(queryText || '')
      } else {
        // Show connected sources filtered by input
        const filtered = connectedSources
          .filter(s => s.status === 'connected')
          .filter(s => {
            if (!filter) return true
            const meta = availableSources.find(m => m.id === s.type)
            const name = meta?.name || s.type
            return name.toLowerCase().includes(filter.toLowerCase())
          })
          .map(s => {
            const meta = availableSources.find(m => m.id === s.type)!
            return {
              id: s.type,
              type: 'source' as const,
              source: s.type,
              sourceMeta: meta,
              label: meta.name,
            }
          })

        setItems(filtered)
        setSelectedIndex(0)
      }
    }, [query, parseQuery, connectedSources, availableSources, fetchSuggestions])

    // Update items when suggestions change
    useEffect(() => {
      const { mode, source } = parseQuery(query)

      if (mode === 'query' && source && suggestions.length > 0) {
        const meta = availableSources.find(m => m.id === source)!
        const suggestionItems: MentionItem[] = suggestions
          .flatMap(s => s.suggestions)
          .map((suggestion, i) => ({
            id: `${source}-${i}`,
            type: 'suggestion' as const,
            source: source,
            sourceMeta: meta,
            label: suggestion,
            query: suggestion,
          }))

        setItems(suggestionItems)
        setSelectedIndex(0)
      }
    }, [suggestions, query, parseQuery, availableSources])

    // Keyboard navigation
    useImperativeHandle(ref, () => ({
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key === 'ArrowDown') {
          setSelectedIndex(prev => (prev + 1) % items.length)
          return true
        }
        if (event.key === 'ArrowUp') {
          setSelectedIndex(prev => (prev - 1 + items.length) % items.length)
          return true
        }
        if (event.key === 'Enter' || event.key === 'Tab') {
          const item = items[selectedIndex]
          if (item) {
            onSelect({ source: item.source, query: item.query })
          }
          return true
        }
        if (event.key === 'Escape') {
          onClose()
          return true
        }
        return false
      },
    }))

    const handleItemClick = (item: MentionItem) => {
      onSelect({ source: item.source, query: item.query })
    }

    if (items.length === 0 && !isLoading) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden w-64">
          <div className="px-3 py-4 text-center text-gray-500 text-sm">
            {connectedSources.length === 0 ? (
              <>
                <Database className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No sources connected</p>
                <p className="text-xs mt-1">Connect sources in Settings</p>
              </>
            ) : (
              <>
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No matches found</p>
              </>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden w-72">
        {/* Header */}
        <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="font-mono bg-gray-200 px-1.5 py-0.5 rounded">@</span>
            <span>Select a source</span>
          </div>
        </div>

        {/* Items */}
        <div className="max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="px-3 py-4 flex items-center justify-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading suggestions...</span>
            </div>
          ) : (
            items.map((item, index) => {
              const Icon = SOURCE_ICONS[item.sourceMeta.icon] || Database
              const isSelected = index === selectedIndex

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 text-left transition-colors
                    ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                  `}
                >
                  <div
                    className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${item.sourceMeta.color}15` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: item.sourceMeta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900 truncate">{item.label}</div>
                    {item.type === 'source' && (
                      <div className="text-xs text-gray-500 truncate">
                        Type to search {item.sourceMeta.name}
                      </div>
                    )}
                  </div>
                  {item.type === 'source' && (
                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  )}
                </button>
              )
            })
          )}
        </div>

        {/* Footer hint */}
        <div className="px-3 py-1.5 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3 text-[10px] text-gray-400">
            <span><kbd className="px-1 py-0.5 bg-gray-200 rounded">↑↓</kbd> navigate</span>
            <span><kbd className="px-1 py-0.5 bg-gray-200 rounded">↵</kbd> select</span>
            <span><kbd className="px-1 py-0.5 bg-gray-200 rounded">esc</kbd> close</span>
          </div>
        </div>
      </div>
    )
  }
)

SourceMention.displayName = 'SourceMention'

export default SourceMention

/**
 * TipTap Extension Configuration
 * 
 * To use with TipTap, create a Mention extension:
 * 
 * ```tsx
 * import Mention from '@tiptap/extension-mention'
 * import { ReactRenderer } from '@tiptap/react'
 * import tippy from 'tippy.js'
 * import SourceMention from './SourceMention'
 * 
 * const mentionExtension = Mention.configure({
 *   HTMLAttributes: { class: 'source-mention' },
 *   suggestion: {
 *     char: '@',
 *     items: ({ query }) => [], // We handle this in the component
 *     render: () => {
 *       let component: ReactRenderer
 *       let popup: any
 * 
 *       return {
 *         onStart: (props) => {
 *           component = new ReactRenderer(SourceMention, {
 *             props: { query: props.query, onSelect: ..., onClose: ... },
 *             editor: props.editor,
 *           })
 *           popup = tippy('body', {
 *             getReferenceClientRect: props.clientRect,
 *             content: component.element,
 *             ...
 *           })
 *         },
 *         onUpdate: (props) => { ... },
 *         onKeyDown: (props) => component.ref?.onKeyDown(props.event),
 *         onExit: () => { popup.destroy(); component.destroy() },
 *       }
 *     },
 *   },
 * })
 * ```
 */
