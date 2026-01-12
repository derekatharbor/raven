// Route: src/components/workspace/DocumentPanel.tsx

'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Filter, SlidersHorizontal } from 'lucide-react'

// Mock data with domain for Brandfetch logos
const MOCK_DOCUMENTS = [
  {
    id: '1',
    name: 'Q4 Market Analysis',
    subtitle: 'Gartner Research Report',
    domain: 'gartner.com',
    status: { label: 'TAM updated to $14.2B', color: '#F97316', bg: '#F7E3C9' },
    group: 'recently_added',
  },
  {
    id: '2', 
    name: 'Competitor Landscape',
    subtitle: 'Internal Strategy Doc',
    domain: 'notion.so',
    status: { label: '3 claims need review', color: '#EF4444', bg: '#FBD9D4' },
    group: 'recently_added',
  },
  {
    id: '3',
    name: 'Series B Financials',
    subtitle: 'PitchBook Export',
    domain: 'pitchbook.com',
    status: { label: 'All claims verified', color: '#22C55E', bg: '#CFDFD5' },
    group: 'recently_added',
  },
  {
    id: '4',
    name: 'Due Diligence Memo',
    subtitle: 'Deal Team Notes',
    domain: 'google.com',
    status: { label: 'Source data changed', color: '#F97316', bg: '#F7E3C9' },
    group: 'needs_attention',
  },
  {
    id: '5',
    name: 'Investment Committee Deck',
    subtitle: 'Q3 Review Materials',
    domain: 'dropbox.com',
    status: { label: '2 contradictions found', color: '#EF4444', bg: '#FBD9D4' },
    group: 'needs_attention',
  },
]

interface DocumentPanelProps {
  activeDocumentId?: string | null
  onDocumentSelect?: (docId: string) => void
  width?: number
}

export default function DocumentPanel({
  activeDocumentId,
  onDocumentSelect,
  width = 320,
}: DocumentPanelProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'tracking'>('all')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['recently_added', 'needs_attention']))
  const [groupBy, setGroupBy] = useState('Recency')
  const [sortBy, setSortBy] = useState('Date added')

  const isCollapsed = width < 200

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(group)) {
        next.delete(group)
      } else {
        next.add(group)
      }
      return next
    })
  }

  const recentlyAdded = MOCK_DOCUMENTS.filter(d => d.group === 'recently_added')
  const needsAttention = MOCK_DOCUMENTS.filter(d => d.group === 'needs_attention')

  // Collapsed view - just show logos
  if (isCollapsed) {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="px-2 py-3 border-b border-gray-200">
          <div className="w-6 h-6 rounded bg-gray-900 flex items-center justify-center mx-auto">
            <SlidersHorizontal className="w-3 h-3 text-white" strokeWidth={2} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {MOCK_DOCUMENTS.map(doc => (
            <button
              key={doc.id}
              onClick={() => onDocumentSelect?.(doc.id)}
              className={`
                w-full flex items-center justify-center p-2 cursor-pointer transition-colors
                ${doc.id === activeDocumentId ? 'bg-gray-100' : 'hover:bg-gray-50'}
              `}
            >
              <img 
                src={`https://cdn.brandfetch.io/${doc.domain}?c=1id1Fyz-h7an5-5KR_y`}
                alt=""
                className="w-6 h-6 rounded object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gray-900 flex items-center justify-center">
            <SlidersHorizontal className="w-3 h-3 text-white" strokeWidth={2} />
          </div>
          <span className="text-[14px] font-semibold text-gray-900">Documents</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-2 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`text-[13px] font-medium cursor-pointer transition-colors ${
              activeTab === 'all' 
                ? 'text-gray-900' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All documents
            <span className={`ml-1.5 text-[12px] px-1.5 py-0.5 rounded ${
              activeTab === 'all' ? 'bg-gray-100 text-gray-600' : 'text-gray-400'
            }`}>
              {MOCK_DOCUMENTS.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`text-[13px] font-medium cursor-pointer transition-colors ${
              activeTab === 'tracking' 
                ? 'text-gray-900' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Tracking
            <span className={`ml-1.5 text-[12px] px-1.5 py-0.5 rounded ${
              activeTab === 'tracking' ? 'bg-gray-100 text-gray-600' : 'text-gray-400'
            }`}>
              3
            </span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-3 py-2.5 border-b border-gray-200 flex items-center gap-1.5 flex-wrap">
        <button 
          className="flex items-center gap-1 text-[11px] text-gray-600 hover:text-gray-900 px-2 py-1.5 rounded bg-white cursor-pointer transition-all border border-gray-200 whitespace-nowrap"
          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
        >
          <span className="text-gray-400">Group:</span>
          <span className="font-medium text-gray-700">{groupBy}</span>
          <ChevronDown className="w-3 h-3 text-gray-400" strokeWidth={2} />
        </button>
        
        <button 
          className="flex items-center gap-1 text-[11px] text-gray-600 hover:text-gray-900 px-2 py-1.5 rounded bg-white cursor-pointer transition-all border border-gray-200 whitespace-nowrap"
          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
        >
          <span className="text-gray-400">Sort:</span>
          <span className="font-medium text-gray-700">{sortBy}</span>
          <ChevronDown className="w-3 h-3 text-gray-400" strokeWidth={2} />
        </button>

        <button 
          className="flex items-center gap-1 text-[11px] text-gray-600 hover:text-gray-900 px-2 py-1.5 rounded bg-white cursor-pointer transition-all border border-gray-200 whitespace-nowrap"
          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
        >
          <Filter className="w-3 h-3 text-gray-400" strokeWidth={2} />
          <span className="font-medium text-gray-700">Filter</span>
        </button>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto py-2 px-1.5">
        {/* Recently Added Group */}
        <div className="mb-2">
          <button
            onClick={() => toggleGroup('recently_added')}
            className="w-[calc(100%-6px)] flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-colors hover:opacity-80 mx-[3px]"
            style={{ backgroundColor: '#FBF9F7' }}
          >
            {expandedGroups.has('recently_added') ? (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
            )}
            <span className="text-[12px] font-medium text-gray-600">Recently added</span>
            <span className="text-[11px] text-gray-400">{recentlyAdded.length}</span>
          </button>
          
          {expandedGroups.has('recently_added') && (
            <div className="mt-1">
              {recentlyAdded.map(doc => (
                <DocumentRow
                  key={doc.id}
                  doc={doc}
                  isActive={doc.id === activeDocumentId}
                  onClick={() => onDocumentSelect?.(doc.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Needs Attention Group */}
        <div className="mb-2">
          <button
            onClick={() => toggleGroup('needs_attention')}
            className="w-[calc(100%-6px)] flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-colors hover:opacity-80 mx-[3px]"
            style={{ backgroundColor: '#FBF9F7' }}
          >
            {expandedGroups.has('needs_attention') ? (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
            )}
            <span className="text-[12px] font-medium text-gray-600">Needs attention</span>
            <span className="text-[11px] text-gray-400">{needsAttention.length}</span>
          </button>
          
          {expandedGroups.has('needs_attention') && (
            <div className="mt-1">
              {needsAttention.map(doc => (
                <DocumentRow
                  key={doc.id}
                  doc={doc}
                  isActive={doc.id === activeDocumentId}
                  onClick={() => onDocumentSelect?.(doc.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface DocumentRowProps {
  doc: typeof MOCK_DOCUMENTS[0]
  isActive: boolean
  onClick: () => void
}

function DocumentRow({ doc, isActive, onClick }: DocumentRowProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 text-left cursor-pointer transition-colors rounded-md
        ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}
      `}
    >
      {/* Checkbox placeholder */}
      <div className="w-4 h-4 rounded border border-gray-300 flex-shrink-0" />
      
      {/* Platform logo via Brandfetch */}
      <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
        <img 
          src={`https://cdn.brandfetch.io/${doc.domain}?c=1id1Fyz-h7an5-5KR_y`}
          alt=""
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to first letter if logo fails
            e.currentTarget.style.display = 'none'
            e.currentTarget.parentElement!.innerHTML = `<span class="text-[11px] font-semibold text-gray-400">${doc.name.charAt(0)}</span>`
          }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-gray-900 truncate">
          {doc.name}
        </div>
        <div className="text-[11px] text-gray-500 truncate">
          {doc.subtitle}
        </div>
      </div>

      {/* Status badge - white with colored square */}
      <div 
        className="flex items-center gap-2 flex-shrink-0 px-2 py-1.5 border"
        style={{ 
          backgroundColor: 'white', 
          borderColor: '#E5E5E5',
          borderRadius: '6px',
        }}
      >
        <div 
          style={{ 
            backgroundColor: doc.status.bg,
            borderRadius: '4px',
            width: '14px',
            height: '14px',
            flexShrink: 0,
          }}
        />
        <span 
          className="font-medium text-gray-700 truncate"
          style={{ 
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '11px',
            lineHeight: '14px',
            maxWidth: '110px',
          }}
        >
          {doc.status.label}
        </span>
      </div>
    </button>
  )
}