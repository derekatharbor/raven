// Route: src/components/workspace/ClaimTooltip.tsx

'use client'

import { CheckCircle2, Clock, AlertCircle, Circle, BarChart3 } from 'lucide-react'

interface ClaimTooltipProps {
  claimId: string
  text: string
  status: 'verified' | 'stale' | 'attention' | 'pending'
  source?: string
  lastChecked?: string
  category?: string
}

export default function ClaimTooltip({
  claimId,
  text,
  status,
  source,
  lastChecked,
  category,
}: ClaimTooltipProps) {
  const statusConfig = {
    verified: { icon: CheckCircle2, color: 'text-emerald-500', label: 'Verified' },
    stale: { icon: Clock, color: 'text-amber-500', label: 'Stale' },
    attention: { icon: AlertCircle, color: 'text-red-500', label: 'Attention' },
    pending: { icon: Circle, color: 'text-gray-400', label: 'Pending' },
  }[status]
  
  const StatusIcon = statusConfig.icon

  return (
    <div className="bg-gray-900 text-white rounded-lg shadow-xl p-3 min-w-[200px] max-w-[280px]">
      {/* Header: ID */}
      <div className="text-xs text-gray-400 font-mono mb-1">{claimId}</div>
      
      {/* Claim text */}
      <p className="text-sm text-white mb-3 line-clamp-2">"{text}"</p>
      
      {/* Status row */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <StatusIcon className={`w-3.5 h-3.5 ${statusConfig.color}`} strokeWidth={2} />
          <span className="text-gray-300">{statusConfig.label}</span>
        </div>
        
        {source && (
          <>
            <div className="flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-gray-500" strokeWidth={1.5} />
              <span className="text-gray-400">{source}</span>
            </div>
          </>
        )}
      </div>
      
      {/* Last checked */}
      {lastChecked && (
        <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-500">
          Last checked: {lastChecked}
        </div>
      )}
    </div>
  )
}

// CSS for the tooltip arrow (add to global styles):
/*
.claim-tooltip::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px 6px 0;
  border-style: solid;
  border-color: #111827 transparent transparent;
}
*/
