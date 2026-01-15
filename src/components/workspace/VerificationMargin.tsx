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

interface Props {
  claims: Claim[]
  selectedClaimId: string | null
  hoveredClaimId: string | null
  onClaimClick: (id: string) => void
  onClaimHover: (id: string | null) => void
  onCollapse: () => void
}

const STATUS = {
  verified: { icon: Check, label: 'Verified', bg: 'bg-green-50', border: 'border-green-200', iconBg: 'bg-green-100', iconColor: 'text-green-600' },
  pending: { icon: Clock, label: 'Pending', bg: 'bg-gray-50', border: 'border-gray-200', iconBg: 'bg-gray-100', iconColor: 'text-gray-500' },
  stale: { icon: AlertTriangle, label: 'Stale', bg: 'bg-amber-50', border: 'border-amber-200', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  contradiction: { icon: X, label: 'Issue', bg: 'bg-red-50', border: 'border-red-200', iconBg: 'bg-red-100', iconColor: 'text-red-600' },
}

export default function VerificationMargin({ claims, selectedClaimId, hoveredClaimId, onClaimClick, onClaimHover, onCollapse }: Props) {
  const counts = { verified: 0, pending: 0, stale: 0, contradiction: 0 }
  claims.forEach(c => counts[c.status]++)

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200 w-[220px]">
      <div className="h-12 flex items-center justify-between px-3 border-b border-gray-200">
        <span className="text-sm font-medium text-gray-900">Claims ({claims.length})</span>
        <button onClick={onCollapse} className="p-1 rounded hover:bg-gray-100 cursor-pointer"><ChevronRight className="w-4 h-4 text-gray-500" /></button>
      </div>

      {claims.length > 0 && (
        <div className="px-3 py-2 border-b border-gray-100 flex gap-3">
          {counts.verified > 0 && <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-xs text-gray-600">{counts.verified}</span></div>}
          {counts.pending > 0 && <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-400" /><span className="text-xs text-gray-600">{counts.pending}</span></div>}
          {counts.stale > 0 && <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-xs text-gray-600">{counts.stale}</span></div>}
          {counts.contradiction > 0 && <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-xs text-gray-600">{counts.contradiction}</span></div>}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2">
        {claims.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-gray-400">No tracked claims</p>
            <p className="text-xs text-gray-400 mt-1">Select text → Track</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {claims.map(claim => {
              const s = STATUS[claim.status]
              const Icon = s.icon
              const active = selectedClaimId === claim.id || hoveredClaimId === claim.id
              return (
                <button
                  key={claim.id}
                  onClick={() => onClaimClick(claim.id)}
                  onMouseEnter={() => onClaimHover(claim.id)}
                  onMouseLeave={() => onClaimHover(null)}
                  className={`w-full text-left p-2 rounded-lg border cursor-pointer transition-all ${s.bg} ${s.border} ${active ? 'ring-1 ring-gray-400' : ''}`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className={`w-4 h-4 rounded flex items-center justify-center ${s.iconBg}`}><Icon className={`w-2.5 h-2.5 ${s.iconColor}`} /></div>
                    <span className="text-[10px] font-medium text-gray-500">{s.label}</span>
                    <span className="text-[10px] text-gray-400 ml-auto">{claim.id}</span>
                  </div>
                  <p className="text-[11px] text-gray-700 line-clamp-2 leading-snug">{claim.text}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
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

      {claims.length > 0 && (
        <div className="p-2 border-t border-gray-100">
          <button className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
            <RefreshCw className="w-3 h-3" />Check all
          </button>
        </div>
      )}
    </div>
  )
}