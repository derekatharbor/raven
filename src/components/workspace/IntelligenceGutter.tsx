// Route: src/components/workspace/IntelligenceGutter.tsx

'use client'

import { useEffect, useRef, forwardRef } from 'react'
import { AlertTriangle, CheckCircle, Clock, RefreshCw, ExternalLink, Copy } from 'lucide-react'
import type { Claim } from '@/app/(dashboard)/workspace/page'

interface IntelligenceGutterProps {
  claims: Claim[]
  contradictionClaims: Claim[]
  visibleClaimIds: Set<string>
  activeClaimId: string | null
  onClaimClick: (claimId: string) => void
  onClaimHover: (claimId: string | null) => void
}

export default function IntelligenceGutter({
  claims,
  contradictionClaims,
  visibleClaimIds,
  activeClaimId,
  onClaimClick,
  onClaimHover,
}: IntelligenceGutterProps) {
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  
  // Auto-scroll to active card
  useEffect(() => {
    if (activeClaimId) {
      const card = cardRefs.current.get(activeClaimId)
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [activeClaimId])
  
  const getCardState = (claim: Claim): 'active' | 'idle' | 'alert' => {
    if (claim.status === 'contradiction') return 'alert'
    if (claim.id === activeClaimId || visibleClaimIds.has(claim.id)) return 'active'
    return 'idle'
  }
  
  const getStatusIcon = (status: Claim['status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-500" strokeWidth={1.5} />
      case 'contradiction':
        return <AlertTriangle className="w-4 h-4 text-red-500" strokeWidth={1.5} />
      case 'pending':
        return <Clock className="w-4 h-4 text-blue-500" strokeWidth={1.5} />
      case 'stale':
        return <RefreshCw className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
    }
  }
  
  const getStatusBadge = (status: Claim['status']) => {
    const config = {
      verified: { text: 'Verified', bg: '#DCFCE7', color: '#16A34A' },
      contradiction: { text: 'Contradiction', bg: '#FEE2E2', color: '#DC2626' },
      pending: { text: 'Pending', bg: '#DBEAFE', color: '#2563EB' },
      stale: { text: 'Stale', bg: '#FEF3C7', color: '#D97706' },
    }
    const c = config[status]
    return (
      <span 
        className="text-[10px] font-medium px-1.5 py-0.5 rounded"
        style={{ backgroundColor: c.bg, color: c.color }}
      >
        {c.text}
      </span>
    )
  }

  // Empty state
  if (claims.length === 0) {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="px-3 py-2 border-b border-gray-100">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Sources
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-gray-400 text-center">
            No claims in this section
          </p>
        </div>
      </div>
    )
  }

  // Separate pinned (contradiction) and regular claims
  const pinnedClaims = contradictionClaims
  const regularClaims = claims.filter(c => c.status !== 'contradiction')

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Sources
        </span>
        {contradictionClaims.length > 0 && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-100 text-red-600">
            {contradictionClaims.length} alert{contradictionClaims.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Pinned Contradiction Cards - Always at top */}
        {pinnedClaims.length > 0 && (
          <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
            <div className="px-2 py-2 space-y-2">
              {pinnedClaims.map(claim => (
                <SourceCard
                  key={claim.id}
                  claim={claim}
                  state="alert"
                  isActive={claim.id === activeClaimId}
                  onClick={() => onClaimClick(claim.id)}
                  onHover={onClaimHover}
                  ref={(el) => {
                    if (el) cardRefs.current.set(claim.id, el)
                  }}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Regular Cards */}
        <div className="px-2 py-2 space-y-2">
          {regularClaims.map(claim => {
            const state = getCardState(claim)
            
            return (
              <SourceCard
                key={claim.id}
                claim={claim}
                state={state}
                isActive={claim.id === activeClaimId}
                onClick={() => onClaimClick(claim.id)}
                onHover={onClaimHover}
                ref={(el) => {
                  if (el) cardRefs.current.set(claim.id, el)
                }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Separate SourceCard component
interface SourceCardProps {
  claim: Claim
  state: 'active' | 'idle' | 'alert'
  isActive: boolean
  onClick: () => void
  onHover: (claimId: string | null) => void
}

const SourceCard = forwardRef<HTMLDivElement, SourceCardProps>(({
  claim,
  state,
  isActive,
  onClick,
  onHover,
}, ref) => {
  const getCardStyles = () => {
    const base = 'rounded-lg border p-3 transition-all duration-150 cursor-pointer'
    
    switch (state) {
      case 'alert':
        return `${base} border-red-200 bg-red-50/50 shadow-sm`
      case 'active':
        return `${base} border-gray-200 bg-white shadow-sm ${isActive ? 'ring-2 ring-blue-500/20' : ''}`
      case 'idle':
        return `${base} border-gray-100 bg-gray-50/50 opacity-60`
    }
  }
  
  const getStatusBadge = (status: Claim['status']) => {
    const config = {
      verified: { text: 'Verified', bg: '#DCFCE7', color: '#16A34A' },
      contradiction: { text: 'Contradiction', bg: '#FEE2E2', color: '#DC2626' },
      pending: { text: 'Pending', bg: '#DBEAFE', color: '#2563EB' },
      stale: { text: 'Stale', bg: '#FEF3C7', color: '#D97706' },
    }
    const c = config[status]
    return (
      <span 
        className="text-[10px] font-medium px-1.5 py-0.5 rounded"
        style={{ backgroundColor: c.bg, color: c.color }}
      >
        {c.text}
      </span>
    )
  }

  return (
    <div
      ref={ref}
      className={getCardStyles()}
      onClick={onClick}
      onMouseEnter={() => onHover(claim.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Source header */}
      <div className="flex items-start gap-2 mb-2">
        {claim.source.logo ? (
          <img 
            src={claim.source.logo} 
            alt={claim.source.name}
            className="w-5 h-5 rounded object-contain"
          />
        ) : (
          <div className="w-5 h-5 rounded bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
            {claim.source.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-gray-900 truncate">
              {claim.source.name}
            </span>
            {getStatusBadge(claim.status)}
          </div>
          {claim.source.forecast && (
            <p className="text-[11px] text-gray-500 truncate mt-0.5">
              {claim.source.forecast}
            </p>
          )}
        </div>
      </div>
      
      {/* Claim text preview */}
      <p className="text-[12px] text-gray-600 mb-2 line-clamp-2">
        &ldquo;{claim.text}&rdquo;
      </p>
      
      {/* Key data point */}
      {claim.source.keyDataPoint && (
        <div className="mb-2">
          <span className="text-[10px] text-gray-400 uppercase tracking-wide">Key Data</span>
          <p className="text-[13px] font-medium text-gray-900">{claim.source.keyDataPoint}</p>
        </div>
      )}
      
      {/* Metadata row */}
      <div className="flex items-center gap-3 text-[10px] text-gray-400">
        {claim.source.confidence && (
          <span>{claim.source.confidence}% confidence</span>
        )}
        {claim.source.lastChecked && (
          <span>Checked {claim.source.lastChecked}</span>
        )}
      </div>
      
      {/* Actions - only show when active */}
      {(state === 'active' || state === 'alert') && (
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
          <button className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700 cursor-pointer">
            <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
            View Original
          </button>
          <button className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700 cursor-pointer">
            <Copy className="w-3 h-3" strokeWidth={1.5} />
            Copy Citation
          </button>
        </div>
      )}
    </div>
  )
})

SourceCard.displayName = 'SourceCard'
