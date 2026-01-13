// Route: src/app/(dashboard)/workspace/[id]/page.tsx
// This is the actual document editing page with persistence

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import SourcesPanel from '@/components/workspace/SourcesPanel'
import Editor, { EditorRef } from '@/components/workspace/Editor'
import ClaimsPanel from '@/components/workspace/ClaimsPanel'
import { ChevronRight, Database, Loader2 } from 'lucide-react'
import { useDocument } from '@/lib/hooks/useDocument'
import { useDebouncedCallback } from 'use-debounce'

// Generate unique claim IDs
let claimCounter = 0

function generateClaimId() {
  claimCounter++
  return `HAR-${String(claimCounter).padStart(3, '0')}`
}

// Collapsed sources pane
function CollapsedSourcesPane({ onExpand }: { onExpand: () => void }) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div className="h-full border-r border-gray-200 flex flex-col">
      <div className="px-3 py-3 border-b border-gray-200">
        <button
          onClick={onExpand}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 cursor-pointer transition-colors"
        >
          {isHovered ? (
            <ChevronRight className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
          ) : (
            <Database className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
          )}
        </button>
      </div>
    </div>
  )
}

// Track claim modal
function TrackClaimModal({ 
  text, 
  onConfirm, 
  onCancel 
}: { 
  text: string
  onConfirm: (config: { source: string; cadence: string; category: string }) => void
  onCancel: () => void
}) {
  const [source, setSource] = useState('pitchbook')
  const [cadence, setCadence] = useState('daily')
  const [category, setCategory] = useState('financial')

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-[400px] overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Track Selection</h3>
          <p className="text-sm text-gray-500 mt-1">Configure monitoring for this claim</p>
        </div>

        <div className="px-5 py-4">
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Selected text</div>
            <p className="text-sm text-gray-900">"{text}"</p>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Data Source</label>
            <select 
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="pitchbook">PitchBook</option>
              <option value="sec">SEC EDGAR</option>
              <option value="bloomberg">Bloomberg</option>
              <option value="reuters">Reuters</option>
              <option value="web">Web Search</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Check Cadence</label>
            <select 
              value={cadence}
              onChange={(e) => setCadence(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="realtime">Real-time</option>
              <option value="hourly">Every hour</option>
              <option value="4hours">Every 4 hours</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Category</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="financial">Financial Metric</option>
              <option value="personnel">Personnel</option>
              <option value="market">Market Data</option>
              <option value="competitive">Competitive Intel</option>
              <option value="regulatory">Regulatory</option>
            </select>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onConfirm({ source, cadence, category })}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
          >
            Start Tracking
          </button>
        </div>
      </div>
    </div>
  )
}

export default function WorkspaceDocumentPage() {
  const params = useParams()
  const router = useRouter()
  const documentId = params.id as string
  
  // Fetch document and claims from Supabase
  const { 
    document, 
    claims, 
    loading, 
    saving,
    error,
    updateContent,
    addClaim,
  } = useDocument(documentId)

  const [activeSourceId, setActiveSourceId] = useState<string | null>(null)
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null)
  const [hoveredClaimId, setHoveredClaimId] = useState<string | null>(null)
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)
  
  // Track modal state
  const [trackModalOpen, setTrackModalOpen] = useState(false)
  const [pendingTrackText, setPendingTrackText] = useState('')
  const [pendingTrackRange, setPendingTrackRange] = useState<{ from: number; to: number } | null>(null)
  const [pendingTrackContext, setPendingTrackContext] = useState('')

  const editorRef = useRef<EditorRef>(null)

  // Debounced content save (auto-save every 1s after changes stop)
  const debouncedSave = useDebouncedCallback(
    (content: any) => {
      updateContent(content)
    },
    1000
  )

  // Handle editor content change
  const handleContentChange = useCallback((content: any) => {
    debouncedSave(content)
  }, [debouncedSave])

  // Handle track selection from editor
  const handleTrackSelection = useCallback((text: string, from: number, to: number, context: string) => {
    setPendingTrackText(text)
    setPendingTrackRange({ from, to })
    setPendingTrackContext(context)
    setTrackModalOpen(true)
  }, [])

  // Handle track confirmation
  const handleTrackConfirm = useCallback(async (config: { source: string; cadence: string; category: string }) => {
    if (!pendingTrackRange) return
    
    const claimId = generateClaimId()
    
    // Apply mark to editor
    editorRef.current?.applyTrackedMark(
      pendingTrackRange.from, 
      pendingTrackRange.to, 
      claimId,
      config
    )
    
    // Save to database
    await addClaim({
      claimId,
      text: pendingTrackText,
      context: pendingTrackContext,
      startOffset: pendingTrackRange.from,
      endOffset: pendingTrackRange.to,
      source: config.source,
      cadence: config.cadence,
      category: config.category,
    })
    
    setTrackModalOpen(false)
    setPendingTrackText('')
    setPendingTrackRange(null)
    setPendingTrackContext('')
    setSelectedClaimId(claimId)
  }, [pendingTrackText, pendingTrackRange, pendingTrackContext, addClaim])

  const handleClaimClick = useCallback((claimId: string) => {
    setSelectedClaimId(claimId)
  }, [])

  const handleClaimHover = useCallback((claimId: string | null) => {
    setHoveredClaimId(claimId)
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading document</p>
          <button 
            onClick={() => router.push('/workspace')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Back to documents
          </button>
        </div>
      </div>
    )
  }

  // Not found
  if (!document) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-2">Document not found</p>
          <button 
            onClick={() => router.push('/workspace')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Back to documents
          </button>
        </div>
      </div>
    )
  }

  // Transform claims to the format ClaimsPanel expects
  const transformedClaims = claims.map(c => ({
    id: c.claim_id,
    text: c.text,
    status: c.current_status === 'ok' ? 'verified' as const : 
           c.current_status === 'contradiction' ? 'contradiction' as const :
           c.current_status === 'pending' ? 'pending' as const : 'stale' as const,
    type: 'verify' as const, // Default to verify for DB claims
    source: c.source,
    cadence: c.cadence,
    category: c.category,
    lastChecked: c.last_checked_at ? new Date(c.last_checked_at).toRelativeString() : 'Never',
  }))

  return (
    <div className="h-full flex">
      {/* Saving indicator */}
      {saving && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-full">
          <Loader2 className="w-3 h-3 animate-spin" />
          Saving...
        </div>
      )}

      {/* Left Panel - Sources */}
      <div 
        className="flex-shrink-0 transition-all duration-200 ease-in-out overflow-hidden"
        style={{ width: leftPanelOpen ? 280 : 48 }}
      >
        {leftPanelOpen ? (
          <SourcesPanel 
            activeSourceId={activeSourceId}
            onSourceSelect={setActiveSourceId}
            onCollapse={() => setLeftPanelOpen(false)}
          />
        ) : (
          <CollapsedSourcesPane onExpand={() => setLeftPanelOpen(true)} />
        )}
      </div>

      {/* Center - Editor */}
      <div className="flex-1 min-w-0 border-r border-gray-200">
        <Editor 
          ref={editorRef}
          content={document.content}
          onContentChange={handleContentChange}
          onTrackSelection={handleTrackSelection}
          onClaimClick={handleClaimClick}
          onClaimHover={handleClaimHover}
        />
      </div>

      {/* Right Panel - Claims */}
      <div className="w-[300px] flex-shrink-0">
        <ClaimsPanel 
          claims={transformedClaims}
          selectedClaimId={selectedClaimId}
          hoveredClaimId={hoveredClaimId}
          onClaimSelect={setSelectedClaimId}
        />
      </div>

      {/* Track Modal */}
      {trackModalOpen && (
        <TrackClaimModal
          text={pendingTrackText}
          onConfirm={handleTrackConfirm}
          onCancel={() => {
            setTrackModalOpen(false)
            setPendingTrackText('')
            setPendingTrackRange(null)
            setPendingTrackContext('')
          }}
        />
      )}
    </div>
  )
}

// Helper to format relative time (would normally use a library)
declare global {
  interface Date {
    toRelativeString(): string
  }
}

Date.prototype.toRelativeString = function() {
  const now = new Date()
  const diff = now.getTime() - this.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return this.toLocaleDateString()
}