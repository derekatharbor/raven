// src/components/workspace/EditorGutter.tsx

'use client'

import { useMemo } from 'react'
import { CheckCircle2, AlertTriangle, Clock, Zap, MessageSquare } from 'lucide-react'

type ClaimStatus = 'verified' | 'pending' | 'stale' | 'contradiction'

interface GutterClaim {
  id: string
  paragraph: number
  status: ClaimStatus
}

interface GutterComment {
  paragraph: number
  count: number
}

interface EditorGutterProps {
  paragraphCount: number
  claims: GutterClaim[]
  comments?: GutterComment[]
  activeParagraph?: number
  onParagraphClick?: (paragraph: number) => void
  onClaimClick?: (claimId: string) => void
  showParagraphNumbers?: boolean
}

const STATUS_CONFIG: Record<ClaimStatus, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  verified: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
  pending: { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-100' },
  stale: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-100' },
  contradiction: { icon: Zap, color: 'text-red-500', bg: 'bg-red-100' },
}

export default function EditorGutter({
  paragraphCount,
  claims,
  comments = [],
  activeParagraph,
  onParagraphClick,
  onClaimClick,
  showParagraphNumbers = false,
}: EditorGutterProps) {
  // Group claims by paragraph
  const claimsByParagraph = useMemo(() => {
    const map = new Map<number, GutterClaim[]>()
    claims.forEach(claim => {
      const existing = map.get(claim.paragraph) || []
      existing.push(claim)
      map.set(claim.paragraph, existing)
    })
    return map
  }, [claims])

  // Group comments by paragraph
  const commentsByParagraph = useMemo(() => {
    const map = new Map<number, number>()
    comments.forEach(c => map.set(c.paragraph, c.count))
    return map
  }, [comments])

  // Generate paragraph rows
  const rows = useMemo(() => {
    return Array.from({ length: paragraphCount }, (_, i) => i + 1)
  }, [paragraphCount])

  return (
    <div className="w-12 flex-shrink-0 bg-[#FAFAF9] border-r border-gray-100 select-none">
      {rows.map(paragraph => {
        const paragraphClaims = claimsByParagraph.get(paragraph) || []
        const commentCount = commentsByParagraph.get(paragraph) || 0
        const isActive = paragraph === activeParagraph
        
        // Get highest priority claim status for this paragraph
        const priorityClaim = paragraphClaims.reduce<GutterClaim | null>((highest, claim) => {
          const priority = ['contradiction', 'stale', 'pending', 'verified']
          if (!highest) return claim
          return priority.indexOf(claim.status) < priority.indexOf(highest.status) ? claim : highest
        }, null)

        return (
          <div
            key={paragraph}
            onClick={() => onParagraphClick?.(paragraph)}
            className={`
              h-6 flex items-center justify-end pr-2 gap-1 text-xs transition-colors
              ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}
              ${onParagraphClick ? 'cursor-pointer' : ''}
            `}
          >
            {/* Comment indicator */}
            {commentCount > 0 && (
              <div className="flex items-center text-blue-400" title={`${commentCount} comment${commentCount > 1 ? 's' : ''}`}>
                <MessageSquare className="w-3 h-3" />
              </div>
            )}

            {/* Claim indicator */}
            {priorityClaim && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onClaimClick?.(priorityClaim.id)
                }}
                className={`
                  w-4 h-4 rounded-full flex items-center justify-center
                  ${STATUS_CONFIG[priorityClaim.status].bg}
                  hover:ring-2 hover:ring-offset-1 hover:ring-gray-300
                  transition-all
                `}
                title={`${paragraphClaims.length} claim${paragraphClaims.length > 1 ? 's' : ''}`}
              >
                {(() => {
                  const Icon = STATUS_CONFIG[priorityClaim.status].icon
                  return <Icon className={`w-2.5 h-2.5 ${STATUS_CONFIG[priorityClaim.status].color}`} />
                })()}
              </button>
            )}

            {/* Paragraph number (optional) */}
            {showParagraphNumbers && (
              <span className={`
                w-4 text-right tabular-nums
                ${isActive ? 'text-blue-600 font-medium' : 'text-gray-300'}
              `}>
                {paragraph}
              </span>
            )}

            {/* Empty state - subtle dot for visual rhythm */}
            {!priorityClaim && !commentCount && !showParagraphNumbers && (
              <span className="w-1 h-1 rounded-full bg-gray-200" />
            )}
          </div>
        )
      })}
    </div>
  )
}

/**
 * Alternative: Minimal gutter with just claim status bars
 * 
 * Instead of icons, shows thin vertical bars for claim density:
 * - Green bar = verified claims in this section
 * - Yellow bar = stale claims
 * - Red bar = contradictions
 * 
 * This is less busy but still communicates document health at a glance.
 */
export function MinimalGutter({
  paragraphCount,
  claims,
  activeParagraph,
}: Pick<EditorGutterProps, 'paragraphCount' | 'claims' | 'activeParagraph'>) {
  const claimsByParagraph = useMemo(() => {
    const map = new Map<number, ClaimStatus>()
    claims.forEach(claim => {
      const existing = map.get(claim.paragraph)
      const priority = ['contradiction', 'stale', 'pending', 'verified']
      if (!existing || priority.indexOf(claim.status) < priority.indexOf(existing)) {
        map.set(claim.paragraph, claim.status)
      }
    })
    return map
  }, [claims])

  const rows = Array.from({ length: paragraphCount }, (_, i) => i + 1)

  const statusColors: Record<ClaimStatus, string> = {
    verified: 'bg-green-400',
    pending: 'bg-gray-300',
    stale: 'bg-amber-400',
    contradiction: 'bg-red-400',
  }

  return (
    <div className="w-2 flex-shrink-0 bg-[#FAFAF9]">
      {rows.map(paragraph => {
        const status = claimsByParagraph.get(paragraph)
        const isActive = paragraph === activeParagraph
        
        return (
          <div
            key={paragraph}
            className={`h-6 flex items-center justify-center ${isActive ? 'bg-blue-50' : ''}`}
          >
            {status && (
              <div className={`w-1 h-4 rounded-full ${statusColors[status]}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
