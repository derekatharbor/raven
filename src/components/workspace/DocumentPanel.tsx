// Route: src/components/workspace/DocumentPanel.tsx

'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Filter, FileText, FileSpreadsheet, File } from 'lucide-react'

// Mock data for now
const MOCK_DOCUMENTS = [
  {
    id: '1',
    name: 'Q4 Market Analysis',
    subtitle: 'Gartner Research Report',
    type: 'pdf' as const,
    status: { label: 'TAM updated to $14.2B', color: '#F97316', bg: '#FFF7ED' },
    group: 'recently_added',
  },
  {
    id: '2', 
    name: 'Competitor Landscape',
    subtitle: 'Internal Strategy Doc',
    type: 'docx' as const,
    status: { label: '3 claims need review', color: '#EF4444', bg: '#FEF2F2' },
    group: 'recently_added',
  },
  {
    id: '3',
    name: 'Series B Financials',
    subtitle: 'PitchBook Export',
    type: 'xlsx' as const,
    status: { label: 'All claims verified', color: '#22C55E', bg: '#F0FDF4' },
    group: 'recently_added',
  },
  {
    id: '4',
    name: 'Due Diligence Memo',
    subtitle: 'Deal Team Notes',
    type: 'pdf' as const,
    status: { label: 'Source data changed', color: '#F97316', bg: '#FFF7ED' },
    group: 'needs_attention',
  },
  {
    id: '5',
    name: 'Investment Committee Deck',
    subtitle: 'Q3 Review Materials',
    type: 'pdf' as const,
    status: { label: '2 contradictions found', color: '#EF4444', bg: '#FEF2F2' },
    group: 'needs_attention',
  },
]

const FILE_TYPE_CONFIG = {
  pdf: { color: '#DC2626', bg: '#FEF2F2', icon: FileText },
  docx: { color: '#2563EB', bg: '#EFF6FF', icon: FileText },
  xlsx: { color: '#16A34A', bg: '#F0FDF4', icon: FileSpreadsheet },
  csv: { color: '#16A34A', bg: '#F0FDF4', icon: FileSpreadsheet },
  txt: { color: '#71717A', bg: '#F4F4F5', icon: File },
  md: { color: '#71717A', bg: '#F4F4F5', icon: File },
}

interface DocumentPanelProps {
  activeDocumentId?: string | null
  onDocumentSelect?: (docId: string) => void
}

export default function DocumentPanel({
  activeDocumentId,
  onDocumentSelect,
}: DocumentPanelProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'tracking'>('all')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['recently_added', 'needs_attention']))
  const [groupBy, setGroupBy] = useState('Recency')
  const [sortBy, setSortBy] = useState('Date added')

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

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gray-900 flex items-center justify-center">
            <FileText className="w-3 h-3 text-white" strokeWidth={2} />
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
      <div className="px-4 py-2.5 border-b border-gray-200 flex items-center gap-2">
        <button 
          className="flex items-center gap-1.5 text-[12px] text-gray-600 hover:text-gray-900 px-2.5 py-1.5 rounded-md bg-white cursor-pointer transition-all border border-gray-200"
          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
        >
          <span className="text-gray-400">Group by:</span>
          <span className="font-medium text-gray-700">{groupBy}</span>
          <ChevronDown className="w-3 h-3 text-gray-400" strokeWidth={2} />
        </button>
        
        <button 
          className="flex items-center gap-1.5 text-[12px] text-gray-600 hover:text-gray-900 px-2.5 py-1.5 rounded-md bg-white cursor-pointer transition-all border border-gray-200"
          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
        >
          <span className="text-gray-400">Sort by:</span>
          <span className="font-medium text-gray-700">{sortBy}</span>
          <ChevronDown className="w-3 h-3 text-gray-400" strokeWidth={2} />
        </button>

        <button 
          className="flex items-center gap-1.5 text-[12px] text-gray-600 hover:text-gray-900 px-2.5 py-1.5 rounded-md bg-white cursor-pointer transition-all border border-gray-200"
          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
        >
          <Filter className="w-3 h-3 text-gray-400" strokeWidth={2} />
          <span className="font-medium text-gray-700">Filter</span>
        </button>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto py-2 px-1">
        {/* Recently Added Group */}
        <div className="mb-2">
          <button
            onClick={() => toggleGroup('recently_added')}
            className="w-[calc(100%-4px)] flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-colors hover:opacity-80 mx-0.5"
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
            className="w-[calc(100%-4px)] flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-colors hover:opacity-80 mx-0.5"
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
  const config = FILE_TYPE_CONFIG[doc.type]
  const Icon = config.icon

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
      
      {/* File type icon */}
      <div 
        className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: config.bg }}
      >
        <Icon className="w-4 h-4" style={{ color: config.color }} strokeWidth={1.5} />
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

      {/* Status badge */}
      <div 
        className="flex items-center gap-1.5 flex-shrink-0 px-2 py-1 border"
        style={{ 
          backgroundColor: 'white', 
          borderColor: '#F3F3F3',
          borderRadius: '4px',
          minWidth: '115px',
          height: '20px',
        }}
      >
        <div 
          style={{ 
            backgroundColor: doc.status.color,
            borderRadius: '4px',
            width: '12px',
            height: '12px',
            flexShrink: 0,
          }}
        />
        <span 
          className="font-medium text-black truncate"
          style={{ 
            fontFamily: 'Inter, sans-serif',
            fontSize: '10px',
            lineHeight: '12px',
          }}
        >
          {doc.status.label}
        </span>
      </div>
    </button>
  )
}