// Route: src/app/(dashboard)/workspace/page.tsx

'use client'

import { useState, useCallback, useRef } from 'react'
import Editor, { EditorRef } from '@/components/workspace/Editor'
import TrackClaimModal from '@/components/workspace/TrackClaimModal'
import VerificationMargin from '@/components/workspace/VerificationMargin'
import { Check, AlertTriangle, X, Clock, ChevronLeft } from 'lucide-react'

// Claim ID generator
let claimCounter = 0
function generateClaimId() {
  claimCounter++
  return `RAV-${String(claimCounter).padStart(3, '0')}`
}

// Claim type
interface TrackedClaim {
  id: string
  text: string
  status: 'pending' | 'verified' | 'stale' | 'contradiction'
  source: string
  cadence: string
  category: string
  lastChecked: string
}

export default function WorkspacePage() {
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null)
  const [hoveredClaimId, setHoveredClaimId] = useState<string | null>(null)
  const [marginCollapsed, setMarginCollapsed] = useState(false)
  
  // Track modal state
  const [trackModalOpen, setTrackModalOpen] = useState(false)
  const [pendingTrackText, setPendingTrackText] = useState('')
  const [pendingTrackRange, setPendingTrackRange] = useState<{ from: number; to: number } | null>(null)

  // Tracked claims
  const [claims, setClaims] = useState<TrackedClaim[]>([])

  // Editor ref
  const editorRef = useRef<EditorRef>(null)

  // Handle track selection from editor
  const handleTrackSelection = useCallback((text: string, from: number, to: number, context: string) => {
    setPendingTrackText(text)
    setPendingTrackRange({ from, to })
    setTrackModalOpen(true)
  }, [])

  // Handle track confirmation
  const handleTrackConfirm = useCallback((config: { source: string; cadence: string; category: string }) => {
    if (!pendingTrackRange) return
    
    const claimId = generateClaimId()
    
    // Apply mark to editor
    editorRef.current?.applyTrackedMark(
      pendingTrackRange.from, 
      pendingTrackRange.to, 
      claimId,
      config
    )
    
    // Add to claims list
    const newClaim: TrackedClaim = {
      id: claimId,
      text: pendingTrackText,
      status: 'pending',
      source: config.source,
      cadence: config.cadence,
      category: config.category,
      lastChecked: 'Just now',
    }
    setClaims(prev => [newClaim, ...prev])
    
    // Reset modal state
    setTrackModalOpen(false)
    setPendingTrackText('')
    setPendingTrackRange(null)
    setSelectedClaimId(claimId)
    
    // Expand margin if collapsed
    if (marginCollapsed) setMarginCollapsed(false)
  }, [pendingTrackText, pendingTrackRange, marginCollapsed])

  // Handle claim interactions
  const handleClaimClick = useCallback((claimId: string) => {
    setSelectedClaimId(claimId)
  }, [])

  const handleClaimHover = useCallback((claimId: string | null) => {
    setHoveredClaimId(claimId)
  }, [])

  return (
    <div className="h-full flex">
      {/* Editor - takes most of the space */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex-1 overflow-hidden">
          <Editor 
            ref={editorRef}
            onTrackSelection={handleTrackSelection}
            onClaimClick={handleClaimClick}
            onClaimHover={handleClaimHover}
          />
        </div>
      </div>

      {/* Verification margin - slim right panel */}
      <div 
        className={`
          flex-shrink-0 border-l border-gray-200 bg-gray-50/50 
          transition-all duration-200 ease-in-out overflow-hidden
          ${marginCollapsed ? 'w-10' : 'w-[200px]'}
        `}
      >
        {marginCollapsed ? (
          <div className="h-full flex flex-col">
            <button
              onClick={() => setMarginCollapsed(false)}
              className="p-2.5 border-b border-gray-200 hover:bg-gray-100 transition-colors"
              title="Expand verification panel"
            >
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
            
            {/* Status summary when collapsed */}
            {claims.length > 0 && (
              <div className="flex-1 flex flex-col items-center py-3 gap-2">
                {claims.filter(c => c.status === 'verified').length > 0 && (
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center" title="Verified">
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  </div>
                )}
                {claims.filter(c => c.status === 'pending').length > 0 && (
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center" title="Pending">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                )}
                {claims.filter(c => c.status === 'stale').length > 0 && (
                  <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center" title="Stale">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                )}
                {claims.filter(c => c.status === 'contradiction').length > 0 && (
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center" title="Contradiction">
                    <X className="w-3.5 h-3.5 text-red-600" />
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <VerificationMargin
            claims={claims}
            selectedClaimId={selectedClaimId}
            hoveredClaimId={hoveredClaimId}
            onClaimClick={handleClaimClick}
            onClaimHover={handleClaimHover}
            onCollapse={() => setMarginCollapsed(true)}
          />
        )}
      </div>

      {/* Track modal */}
      {trackModalOpen && (
        <TrackClaimModal
          text={pendingTrackText}
          onConfirm={handleTrackConfirm}
          onCancel={() => {
            setTrackModalOpen(false)
            setPendingTrackText('')
            setPendingTrackRange(null)
          }}
        />
      )}
    </div>
  )
}