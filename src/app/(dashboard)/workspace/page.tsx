// Route: src/app/(dashboard)/workspace/page.tsx

'use client'

import { useState, useCallback, useRef } from 'react'
import SourcesPanel from '@/components/workspace/SourcesPanel'
import Editor, { EditorRef } from '@/components/workspace/Editor'
import ClaimsPanel from '@/components/workspace/ClaimsPanel'
import SignalModal from '@/components/workspace/SignalModal'
import { ChevronRight, Database } from 'lucide-react'

// Collapsed sources pane - shows icon, expands on hover/click
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

// Generate unique claim IDs
let claimCounter = 5 // Start after mock data

function generateClaimId() {
  claimCounter++
  return `HAR-${String(claimCounter).padStart(3, '0')}`
}

// Track claim modal for when user clicks Track in bubble menu
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
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Track Selection</h3>
          <p className="text-sm text-gray-500 mt-1">Configure monitoring for this claim</p>
        </div>

        {/* Content */}
        <div className="px-5 py-4">
          {/* Selected text preview */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Selected text</div>
            <p className="text-sm text-gray-900">"{text}"</p>
          </div>

          {/* Source selection */}
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

          {/* Cadence selection */}
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

          {/* Category selection */}
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

        {/* Footer */}
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

export default function WorkspacePage() {
  const [activeSourceId, setActiveSourceId] = useState<string | null>(null)
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null)
  const [hoveredClaimId, setHoveredClaimId] = useState<string | null>(null)
  
  // Panel visibility - only left panel is collapsible
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)
  
  // Track modal state (for verification)
  const [trackModalOpen, setTrackModalOpen] = useState(false)
  const [pendingTrackText, setPendingTrackText] = useState('')
  const [pendingTrackRange, setPendingTrackRange] = useState<{ from: number; to: number } | null>(null)

  // Signal modal state
  const [signalModalOpen, setSignalModalOpen] = useState(false)
  const [pendingSignalText, setPendingSignalText] = useState('')
  const [pendingSignalRange, setPendingSignalRange] = useState<{ from: number; to: number } | null>(null)

  // Tracked claims state (supports both verify and signal types)
  const [trackedClaims, setTrackedClaims] = useState<Array<{
    id: string
    text: string
    status: 'pending' | 'verified' | 'stale' | 'attention'
    type: 'verify' | 'signal' | 'both'
    source: string
    cadence: string
    category: string
    lastChecked: string
    signal?: { name: string; categoryId: string }
  }>>([])

  // Editor ref for applying marks
  const editorRef = useRef<EditorRef>(null)

  // Handle track selection from editor
  const handleTrackSelection = useCallback((text: string, from: number, to: number, context: string) => {
    setPendingTrackText(text)
    setPendingTrackRange({ from, to })
    setTrackModalOpen(true)
  }, [])

  // Handle track confirmation (verification)
  const handleTrackConfirm = useCallback((config: { source: string; cadence: string; category: string }) => {
    if (!pendingTrackRange) return
    
    // Generate a new claim ID
    const claimId = generateClaimId()
    
    // Apply the tracked mark to the editor with all config data
    editorRef.current?.applyTrackedMark(
      pendingTrackRange.from, 
      pendingTrackRange.to, 
      claimId,
      config
    )
    
    // Add to tracked claims list
    const newClaim = {
      id: claimId,
      text: pendingTrackText,
      status: 'pending' as const,
      type: 'verify' as const,
      source: config.source,
      cadence: config.cadence,
      category: config.category,
      lastChecked: 'Just now',
    }
    setTrackedClaims(prev => [newClaim, ...prev])
    
    console.log('Created tracked claim:', newClaim)
    
    setTrackModalOpen(false)
    setPendingTrackText('')
    setPendingTrackRange(null)
    
    // Select the new claim in the panel
    setSelectedClaimId(claimId)
  }, [pendingTrackText, pendingTrackRange])

  // Handle signal selection from editor
  const handleSignalSelection = useCallback((text: string, from: number, to: number, context: string) => {
    setPendingSignalText(text)
    setPendingSignalRange({ from, to })
    setSignalModalOpen(true)
  }, [])

  // Handle signal confirmation
  const handleSignalConfirm = useCallback((signal: { categoryId: string; signalId: string; signalName: string }) => {
    if (!pendingSignalRange) return
    
    // Generate a new claim ID
    const claimId = generateClaimId()
    
    // Apply the tracked mark to the editor
    editorRef.current?.applyTrackedMark(
      pendingSignalRange.from, 
      pendingSignalRange.to, 
      claimId,
      { category: signal.categoryId }
    )
    
    // Add to tracked claims list as a signal type
    const newClaim = {
      id: claimId,
      text: pendingSignalText,
      status: 'pending' as const,
      type: 'signal' as const,
      source: 'web',
      cadence: 'daily',
      category: signal.categoryId,
      lastChecked: 'Just now',
      signal: { name: signal.signalName, categoryId: signal.categoryId },
    }
    setTrackedClaims(prev => [newClaim, ...prev])
    
    console.log('Created signal:', newClaim)
    
    setSignalModalOpen(false)
    setPendingSignalText('')
    setPendingSignalRange(null)
    
    // Select the new claim in the panel
    setSelectedClaimId(claimId)
  }, [pendingSignalText, pendingSignalRange])

  // Handle claim click from editor
  const handleClaimClick = useCallback((claimId: string) => {
    setSelectedClaimId(claimId)
  }, [])

  // Handle claim hover from editor
  const handleClaimHover = useCallback((claimId: string | null) => {
    setHoveredClaimId(claimId)
  }, [])

  return (
    <div className="h-full flex">
      {/* Left Panel - Sources (collapsible with smooth transition) */}
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
          onTrackSelection={handleTrackSelection}
          onSignalSelection={handleSignalSelection}
          onClaimClick={handleClaimClick}
          onClaimHover={handleClaimHover}
        />
      </div>

      {/* Right Panel - Claims (always visible) */}
      <div className="w-[300px] flex-shrink-0">
        <ClaimsPanel 
          claims={trackedClaims}
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
          }}
        />
      )}

      {/* Signal Modal */}
      {signalModalOpen && (
        <SignalModal
          text={pendingSignalText}
          onConfirm={handleSignalConfirm}
          onCancel={() => {
            setSignalModalOpen(false)
            setPendingSignalText('')
            setPendingSignalRange(null)
          }}
        />
      )}
    </div>
  )
}