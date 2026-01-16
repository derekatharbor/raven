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
  darkMode?: boolean
}

const STATUS = {
  verified: { icon: Check, bg: 'bg-green-500/10', darkBg: 'bg-green-500/20', border: 'border-green-500/20', iconBg: 'bg-green-600', iconColor: 'text-white' },
  pending: { icon: Clock, bg: 'bg-gray-100', darkBg: 'bg-gray-700/50', border: 'border-gray-200 dark:border-gray-600', iconBg: 'bg-gray-400', iconColor: 'text-white' },
  stale: { icon: AlertTriangle, bg: 'bg-amber-500/10', darkBg: 'bg-amber-500/20', border: 'border-amber-500/20', iconBg: 'bg-amber-500', iconColor: 'text-white' },
  contradiction: { icon: X, bg: 'bg-red-500/10', darkBg: 'bg-red-500/20', border: 'border-red-500/20', iconBg: 'bg-red-500', iconColor: 'text-white' },
}

export default function VerificationMargin({ claims, selectedClaimId, hoveredClaimId, onClaimClick, onClaimHover, onCollapse, darkMode = false }: VerificationMarginProps) {
  const counts = {
    verified: claims.filter(c => c.status === 'verified').length,
    pending: claims.filter(c => c.status === 'pending').length,
    stale: claims.filter(c => c.status === 'stale').length,
    contradiction: claims.filter(c => c.status === 'contradiction').length,
  }

  return (
    <div className={`h-full flex flex-col border-l ${darkMode ? 'bg-[#232323] border-[#333]' : 'bg-[#FBF9F7] border-gray-200'}`}>
      {/* Header */}
      <div className={`h-9 px-3 border-b flex items-center justify-between flex-shrink-0 ${darkMode ? 'border-[#333]' : 'border-gray-200'}`}>
        <span className={`text-[11px] font-medium uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Claims ({claims.length})
        </span>
        <button
          onClick={onCollapse}
          className={`p-1 rounded cursor-pointer ${darkMode ? 'hover:bg-white/5 text-gray-500 hover:text-gray-300' : 'hover:bg-black/5 text-gray-400 hover:text-gray-600'}`}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Status bar */}
      {claims.length > 0 && (
        <div className={`px-3 py-2 border-b flex gap-3 flex-shrink-0 ${darkMode ? 'border-[#333]' : 'border-gray-200'}`}>
          {counts.verified > 0 && <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /><span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{counts.verified}</span></div>}
          {counts.pending > 0 && <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-400" /><span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{counts.pending}</span></div>}
          {counts.stale > 0 && <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" /><span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{counts.stale}</span></div>}
          {counts.contradiction > 0 && <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /><span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{counts.contradiction}</span></div>}
        </div>
      )}

      {/* Claims list */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {claims.length === 0 ? (
          <div className="p-4 text-center">
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No tracked claims</p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Select text → Track</p>
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
                  className={`w-full text-left p-2 rounded-lg border cursor-pointer transition-all ${darkMode ? s.darkBg : s.bg} ${s.border} ${isActive ? 'ring-1 ring-blue-500' : ''}`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className={`w-4 h-4 rounded flex items-center justify-center ${s.iconBg}`}>
                      <Icon className={`w-2.5 h-2.5 ${s.iconColor}`} />
                    </div>
                    <span className={`text-[10px] font-mono ml-auto ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{claim.id}</span>
                  </div>
                  <p className={`text-[11px] line-clamp-2 leading-snug ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{claim.text}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[9px] uppercase ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{claim.source}</span>
                    <span className={`text-[9px] ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>•</span>
                    <span className={`text-[9px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{claim.lastChecked}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Refresh */}
      {claims.length > 0 && (
        <div className={`p-2 border-t flex-shrink-0 ${darkMode ? 'border-[#333]' : 'border-gray-200'}`}>
          <button className={`w-full flex items-center justify-center gap-1.5 py-1.5 text-xs rounded cursor-pointer ${darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5' : 'text-gray-500 hover:text-gray-700 hover:bg-black/5'}`}>
            <RefreshCw className="w-3 h-3" />
            Check all
          </button>
        </div>
      )}
    </div>
  )
}