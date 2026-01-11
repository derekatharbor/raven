// Route: src/components/sources/SourcesPanel.tsx

'use client'

import { useState } from 'react'
import { MoreHorizontal, RefreshCw, Copy, ExternalLink } from 'lucide-react'

type SourceStatus = 'verified' | 'outdated' | 'error' | 'pending'

interface Source {
  id: string
  name: string
  icon?: string
  forecast?: string
  analyst?: string
  publishedDate?: string
  status: SourceStatus
  lastChecked?: string
  keyDataPoint?: string
  confidence?: number
  confidenceLabel?: string
  originalUrl?: string
}

interface SourcesPanelProps {
  sources: Source[]
  selectedSourceId?: string
  onRefresh?: (sourceId: string) => void
  onCopyCitation?: (source: Source) => void
  showAllSources?: boolean
  onToggleShowAll?: () => void
}

const STATUS_STYLES: Record<SourceStatus, { bg: string; text: string; label: string }> = {
  verified: { bg: 'bg-green-100', text: 'text-green-700', label: 'Verified' },
  outdated: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Outdated' },
  error: { bg: 'bg-red-100', text: 'text-red-700', label: 'Error' },
  pending: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Pending' },
}

export function SourcesPanel({
  sources,
  selectedSourceId,
  onRefresh,
  onCopyCitation,
  showAllSources = false,
  onToggleShowAll,
}: SourcesPanelProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (source: Source) => {
    onCopyCitation?.(source)
    setCopiedId(source.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const displayedSources = showAllSources 
    ? sources 
    : sources.filter(s => s.id === selectedSourceId).slice(0, 2)

  return (
    <div className="w-[453px] h-full bg-white shadow-[-4px_0px_10px_5px_rgba(177,177,177,0.25)] flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <h2 className="text-[24px] font-medium text-black font-['Inter']">Sources</h2>
        </div>
        <button 
          onClick={onToggleShowAll}
          className="p-2 bg-white rounded-[10px] border border-[#E4E4E7] hover:bg-gray-50 transition-colors"
        >
          <MoreHorizontal size={20} className="text-black" />
        </button>
      </div>

      {/* Toggle */}
      {onToggleShowAll && (
        <div className="px-5 py-2 border-b border-gray-100">
          <button
            onClick={onToggleShowAll}
            className="text-[13px] font-medium text-[#5BDFFA] hover:underline font-['Source_Sans_3']"
          >
            {showAllSources ? 'Show Selected Only' : 'View All Sources'}
          </button>
        </div>
      )}

      {/* Sources List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {displayedSources.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#787878" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <p className="text-[#787878] text-[15px] font-medium font-['Source_Sans_3']">
              Select a citation to view sources
            </p>
          </div>
        ) : (
          displayedSources.map((source) => (
            <SourceCard
              key={source.id}
              source={source}
              onRefresh={() => onRefresh?.(source.id)}
              onCopy={() => handleCopy(source)}
              isCopied={copiedId === source.id}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface SourceCardProps {
  source: Source
  onRefresh: () => void
  onCopy: () => void
  isCopied: boolean
}

function SourceCard({ source, onRefresh, onCopy, isCopied }: SourceCardProps) {
  const statusStyle = STATUS_STYLES[source.status]

  return (
    <div className="bg-[#F9F9F9] rounded-[10px] p-4">
      {/* Source Header */}
      <div className="flex items-center gap-2 mb-3">
        {source.icon ? (
          <img 
            src={source.icon} 
            alt={source.name} 
            className="w-5 h-5 rounded-full object-cover"
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-[10px] font-bold text-white">
            {source.name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-[#787878] text-[15px] font-medium font-['Source_Code_Pro']">
          {source.name}
        </span>
      </div>

      {/* Source Details */}
      <div className="space-y-2 text-[12px] font-['Source_Code_Pro']">
        {source.forecast && (
          <p>
            <span className="font-bold text-black">Forecast:</span>{' '}
            <span className="text-black font-medium">
              {source.forecast}
              {source.analyst && `Analyst: ${source.analyst}`}
              {source.publishedDate && ` | Published: ${source.publishedDate}`}
            </span>
          </p>
        )}

        <p className="flex items-center gap-2">
          <span className="font-bold text-black">Status:</span>{' '}
          <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${statusStyle.bg} ${statusStyle.text}`}>
            {statusStyle.label}
          </span>
          {source.lastChecked && (
            <span className="text-black font-medium">(Last checked: {source.lastChecked})</span>
          )}
        </p>

        {source.keyDataPoint && (
          <p>
            <span className="font-bold text-black">Key Data Point:</span>{' '}
            <span className="text-black font-medium">{source.keyDataPoint}</span>
          </p>
        )}

        {source.confidence !== undefined && (
          <p>
            <span className="font-bold text-black">Confidence:</span>{' '}
            <span className="text-black font-medium">
              {source.confidence}%{source.confidenceLabel && ` (${source.confidenceLabel})`}
            </span>
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded border border-[#F7F7F7] text-black text-[12px] font-medium font-['Source_Sans_3'] hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
        
        {source.originalUrl && (
          <a
            href={source.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded border border-[#F7F7F7] text-black text-[12px] font-medium font-['Source_Sans_3'] hover:bg-gray-50 transition-colors"
          >
            <ExternalLink size={14} />
            Original
          </a>
        )}

        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-black rounded border border-black text-white text-[13px] font-medium font-['Source_Sans_3'] hover:bg-gray-800 transition-colors ml-auto"
        >
          <Copy size={14} />
          {isCopied ? 'Copied!' : 'Copy Citation'}
        </button>
      </div>
    </div>
  )
}
