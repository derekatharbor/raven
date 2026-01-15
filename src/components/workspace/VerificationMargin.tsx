// src/components/workspace/VerificationMargin.tsx

'use client'

import { Check, AlertTriangle, X, Clock, ChevronRight, RefreshCw } from 'lucide-react'

interface Claim {
  id: string
  text: string
  status: 'pending' | 'verified' | 'stale' | 'contradiction'
  source: string
  cadence: string
  category: string
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

const STATUS_CONFIG = {
  verified: {
    icon: Check,
    label: 'Verified',
    bg: 'bg-green-50',
    border: 'border-green-200',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    textColor: 'text-green-700',
  },
  pending: {
    icon: Clock,
    label: 'Pending',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-500',
    textColor: 'text-gray-600',
  },
  stale: {
    icon: AlertTriangle,
    label: 'Stale',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    textColor: 'text-amber-700',
  },
  contradiction: {
    icon: X,
    label: 'Issue',
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    textColor: 'text-red-700',
  },
}

export default function VerificationMargin({
  claims,
  selectedClaimId,
  hoveredClaimId,
  onClaimClick,
  onClaimHover,
  onCollapse,
}: VerificationMarginProps) {
  // Count by status
  const statusCounts = {
    verified: claims.filter(c => c.status === 'verified').length,
    pending: claims.filter(c => c.status === 'pending').length,
    stale: claims.filter(c => c.status === 'stale').length,
    contradiction: claims.filter(c => c.status === 'contradiction').length,
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-gray-200 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Claims ({claims.length})
        </span>
        <button
          onClick={onCollapse}
          className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
          title="Collapse panel"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Status summary bar */}
      {claims.length > 0 && (
        <div className="px-3 py-2 border-b border-gray-100 flex gap-3">
          {statusCounts.verified > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-gray-600">{statusCounts.verified}</span>
            </div>
          )}
          {statusCounts.pending > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <span className="text-xs text-gray-600">{statusCounts.pending}</span>
            </div>
          )}
          {statusCounts.stale > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-xs text-gray-600">{statusCounts.stale}</span>
            </div>
          )}
          {statusCounts.contradiction > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs text-gray-600">{statusCounts.contradiction}</span>
            </div>
          )}
        </div>
      )}

      {/* Claims list */}
      <div className="flex-1 overflow-y-auto">
        {claims.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-xs text-gray-400">No tracked claims yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Highlight text and click the shield icon to track
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1.5">
            {claims.map(claim => {
              const config = STATUS_CONFIG[claim.status]
              const StatusIcon = config.icon
              const isSelected = selectedClaimId === claim.id
              const isHovered = hoveredClaimId === claim.id

              return (
                <button
                  key={claim.id}
                  onClick={() => onClaimClick(claim.id)}
                  onMouseEnter={() => onClaimHover(claim.id)}
                  onMouseLeave={() => onClaimHover(null)}
                  className={`
                    w-full text-left p-2 rounded-lg border transition-all
                    ${config.bg} ${config.border}
                    ${isSelected || isHovered ? 'ring-1 ring-gray-400' : ''}
                  `}
                >
                  {/* Status + ID row */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className={`w-4 h-4 rounded flex items-center justify-center ${config.iconBg}`}>
                      <StatusIcon className={`w-2.5 h-2.5 ${config.iconColor}`} />
                    </div>
                    <span className={`text-[10px] font-medium ${config.textColor}`}>
                      {config.label}
                    </span>
                    <span className="text-[10px] text-gray-400 ml-auto">
                      {claim.id}
                    </span>
                  </div>

                  {/* Claim text */}
                  <p className="text-[11px] text-gray-700 line-clamp-2 leading-snug">
                    {claim.text}
                  </p>

                  {/* Source + time */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[9px] text-gray-400 uppercase">
                      {claim.source}
                    </span>
                    <span className="text-[9px] text-gray-300">•</span>
                    <span className="text-[9px] text-gray-400">
                      {claim.lastChecked}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Refresh all button */}
      {claims.length > 0 && (
        <div className="p-2 border-t border-gray-100">
          <button className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors">
            <RefreshCw className="w-3 h-3" />
            Check all
          </button>
        </div>
      )}
    </div>
  )
}
