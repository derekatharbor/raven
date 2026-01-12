// Route: src/components/workspace/SourcesPanel.tsx

'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Filter, Database, Plus, FileText, Mic, BarChart3, FileCheck, Radio } from 'lucide-react'

// Document type config
const DOC_TYPES = {
  earnings_call: { label: 'Earnings Call', color: '#8B5CF6' },
  marketing: { label: 'Marketing Material', color: '#EC4899' },
  public_report: { label: 'Public Report', color: '#3B82F6' },
  intel_report: { label: 'Intel Report', color: '#EF4444' },
  sec_filing: { label: 'SEC Filing', color: '#F59E0B' },
  internal: { label: 'Internal Doc', color: '#6B7280' },
}

// Mock data
const MOCK_SOURCES = [
  {
    id: '1',
    name: 'NVDA Q4 2024 Earnings Call',
    subtitle: 'Transcript - Jan 2025',
    domain: 'nvidia.com',
    docType: 'earnings_call',
    group: 'connected',
  },
  {
    id: '2', 
    name: 'Semiconductor Market Report',
    subtitle: 'Gartner Research',
    domain: 'gartner.com',
    docType: 'public_report',
    group: 'connected',
  },
  {
    id: '3',
    name: 'NVDA 10-K Filing',
    subtitle: 'SEC EDGAR - FY2024',
    domain: 'sec.gov',
    docType: 'sec_filing',
    group: 'connected',
  },
  {
    id: '4',
    name: 'Competitor Analysis',
    subtitle: 'Internal Strategy',
    domain: 'notion.so',
    docType: 'intel_report',
    group: 'uploaded',
  },
  {
    id: '5',
    name: 'Product Launch Brief',
    subtitle: 'Marketing Team',
    domain: 'google.com',
    docType: 'marketing',
    group: 'uploaded',
  },
]

interface SourcesPanelProps {
  activeSourceId?: string | null
  onSourceSelect?: (sourceId: string) => void
  width?: number
}

export default function SourcesPanel({
  activeSourceId,
  onSourceSelect,
  width = 280,
}: SourcesPanelProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['connected', 'uploaded']))

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(group)) next.delete(group)
      else next.add(group)
      return next
    })
  }

  const connected = MOCK_SOURCES.filter(s => s.group === 'connected')
  const uploaded = MOCK_SOURCES.filter(s => s.group === 'uploaded')

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-gray-700" strokeWidth={1.5} />
            <span className="text-sm font-semibold text-gray-900">Sources</span>
          </div>
          <button className="p-1 rounded hover:bg-gray-100 cursor-pointer transition-colors">
            <Plus className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Source List */}
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {/* Connected Sources */}
        <div className="mb-2">
          <button
            onClick={() => toggleGroup('connected')}
            className="w-full flex items-center gap-2 px-2 py-2 rounded cursor-pointer transition-colors hover:bg-gray-50"
          >
            {expandedGroups.has('connected') ? (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
            )}
            <Radio className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />
            <span className="text-xs font-medium text-gray-600">Connected</span>
            <span className="text-xs text-gray-400">{connected.length}</span>
          </button>
          
          {expandedGroups.has('connected') && (
            <div className="mt-1 space-y-0.5">
              {connected.map(source => (
                <SourceRow
                  key={source.id}
                  source={source}
                  isActive={source.id === activeSourceId}
                  onClick={() => onSourceSelect?.(source.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Uploaded Sources */}
        <div className="mb-2">
          <button
            onClick={() => toggleGroup('uploaded')}
            className="w-full flex items-center gap-2 px-2 py-2 rounded cursor-pointer transition-colors hover:bg-gray-50"
          >
            {expandedGroups.has('uploaded') ? (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
            )}
            <FileText className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
            <span className="text-xs font-medium text-gray-600">Uploaded</span>
            <span className="text-xs text-gray-400">{uploaded.length}</span>
          </button>
          
          {expandedGroups.has('uploaded') && (
            <div className="mt-1 space-y-0.5">
              {uploaded.map(source => (
                <SourceRow
                  key={source.id}
                  source={source}
                  isActive={source.id === activeSourceId}
                  onClick={() => onSourceSelect?.(source.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface SourceRowProps {
  source: typeof MOCK_SOURCES[0]
  isActive: boolean
  onClick: () => void
}

function SourceRow({ source, isActive, onClick }: SourceRowProps) {
  const docType = DOC_TYPES[source.docType as keyof typeof DOC_TYPES]
  
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-2.5 px-2 py-2 text-left cursor-pointer transition-colors rounded-md
        ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}
      `}
    >
      {/* Logo */}
      <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-100">
        <img 
          src={`https://cdn.brandfetch.io/${source.domain}?c=1id1Fyz-h7an5-5KR_y`}
          alt=""
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-gray-900 truncate">
          {source.name}
        </div>
        <div className="text-[10px] text-gray-500 truncate">
          {source.subtitle}
        </div>
      </div>

      {/* Document type badge */}
      <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded border border-gray-200 bg-white flex-shrink-0">
        <div 
          className="w-2 h-2 rounded-sm"
          style={{ backgroundColor: docType.color }}
        />
        <span className="text-[10px] text-gray-600 whitespace-nowrap">
          {docType.label}
        </span>
      </div>
    </button>
  )
}
