// src/components/workspace/VerificationMargin.tsx

'use client'

import { Check, AlertTriangle, X, Clock, ChevronRight, RefreshCw } from 'lucide-react'

interface Claim {
  id: string
  text: string
  status: 'pending' | 'verified' | 'stale' | 'contradiction'
  source: string
  lastChecked: string
}

interface VerificationMarginProps {
  claims: Claim[]
  selectedClaimId: string | null
  hoveredClaimId: string | null
  onClaimClick: (claimId: string) => void
  onClaimHover: (claimId: string | null) => void
  onCollapse: () => void
}

const STATUS = {
  verified: { icon: Check, bg: 'bg-[#5F6AD2]/10', border: 'border-[#5F6AD2]/20', iconBg: 'bg-[#5F6AD2]', iconColor: 'text-white' },
  pending: { icon: Clock, bg: 'bg-gray-100', border: 'border-gray-200', iconBg: 'bg-gray-300', iconColor: 'text-gray-600' },
  stale: { icon: AlertTriangle, bg: 'bg-[#F3C94D]/10', border: 'border-[#F3C94D]/30', iconBg: 'bg-[#F3C94D]', iconColor: 'text-white' },
  contradiction: { icon: X, bg: 'bg-[#FD7941]/10', border: 'border-[#FD7941]/20', iconBg: 'bg-[#FD7941]', iconColor: 'text-white' },
}

export default function VerificationMargin({ claims, selectedClaimId, hoveredClaimId, onClaimClick, onClaimHover, onCollapse }: VerificationMarginProps) {
  const counts = {
    verified: claims.filter(c => c.status === 'verified').length,
    pending: claims.filter(c => c.status === 'pending').length,
    stale: claims.filter(c => c.status === 'stale').length,
    contradiction: claims.filter(c => c.status === 'contradiction').length,
  }

  return (
    <div className="h-full flex flex-col bg-[#FBF9F7] border-l border-gray-200">
      {/* Header */}
      <div className="h-9 px-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
          Claims ({claims.length})
        </span>
        <button
          onClick={onCollapse}
          className="p-1 rounded hover:bg-black/5 text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Status bar */}
      {claims.length > 0 && (
        <div className="px-3 py-2 border-b border-gray-200 flex gap-3 flex-shrink-0">
          {counts.verified > 0 && <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#5F6AD2]" /><span className="text-xs text-gray-600">{counts.verified}</span></div>}
          {counts.pending > 0 && <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-400" /><span className="text-xs text-gray-600">{counts.pending}</span></div>}
          {counts.stale > 0 && <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#F3C94D]" /><span className="text-xs text-gray-600">{counts.stale}</span></div>}
          {counts.contradiction > 0 && <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#FD7941]" /><span className="text-xs text-gray-600">{counts.contradiction}</span></div>}
        </div>
      )}

      {/* Claims list */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {claims.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-xs text-gray-400">No tracked claims</p>
            <p className="text-xs text-gray-400 mt-1">Select text → Track</p>
          </div>
        ) : (
          <div className="p-2 space-y-1.5">
            {claims.map(claim => {
              const s = STATUS[claim.status]
              const Icon = s.icon
              const isActive = selectedClaimId === claim.id || hoveredClaimId === claim.id

              return (
                <button
                  key={claim.id}
                  onClick={() => onClaimClick(claim.id)}
                  onMouseEnter={() => onClaimHover(claim.id)}
                  onMouseLeave={() => onClaimHover(null)}
                  className={`w-full text-left p-2 rounded-lg border cursor-pointer transition-all ${s.bg} ${s.border} ${isActive ? 'ring-1 ring-[#5F6AD2]' : ''}`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className={`w-4 h-4 rounded flex items-center justify-center ${s.iconBg}`}>
                      <Icon className={`w-2.5 h-2.5 ${s.iconColor}`} />
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 ml-auto">{claim.id}</span>
                  </div>
                  <p className="text-[11px] text-gray-700 line-clamp-2 leading-snug">{claim.text}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[9px] text-gray-400 uppercase">{claim.source}</span>
                    <span className="text-[9px] text-gray-300">•</span>
                    <span className="text-[9px] text-gray-400">{claim.lastChecked}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Refresh */}
      {claims.length > 0 && (
        <div className="p-2 border-t border-gray-200 flex-shrink-0">
          <button className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-black/5 rounded cursor-pointer">
            <RefreshCw className="w-3 h-3" />
            Check all
          </button>
        </div>
      )}
    </div>
  )
}