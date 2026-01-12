// Route: src/app/(dashboard)/workspace/page.tsx

'use client'

import { useState, useCallback } from 'react'
import SourcesPanel from '@/components/workspace/SourcesPanel'
import Editor from '@/components/workspace/Editor'
import ClaimsPanel from '@/components/workspace/ClaimsPanel'
import { GripVertical, ChevronLeft, ChevronRight } from 'lucide-react'

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
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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
  
  // Panel visibility
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  
  // Track modal state
  const [trackModalOpen, setTrackModalOpen] = useState(false)
  const [pendingTrackText, setPendingTrackText] = useState('')
  const [pendingTrackRange, setPendingTrackRange] = useState<{ from: number; to: number } | null>(null)

  // Handle track selection from editor
  const handleTrackSelection = useCallback((text: string, from: number, to: number) => {
    setPendingTrackText(text)
    setPendingTrackRange({ from, to })
    setTrackModalOpen(true)
  }, [])

  // Handle track confirmation
  const handleTrackConfirm = useCallback((config: { source: string; cadence: string; category: string }) => {
    // Here you would:
    // 1. Create the claim in the database
    // 2. Apply the TrackedClaim mark to the editor
    // 3. Update the claims panel
    console.log('Creating tracked claim:', { text: pendingTrackText, range: pendingTrackRange, config })
    
    setTrackModalOpen(false)
    setPendingTrackText('')
    setPendingTrackRange(null)
    
    // Open right panel to show the new claim
    setRightPanelOpen(true)
  }, [pendingTrackText, pendingTrackRange])

  // Handle claim click from editor
  const handleClaimClick = useCallback((claimId: string) => {
    setSelectedClaimId(claimId)
    setRightPanelOpen(true)
  }, [])

  return (
    <div className="h-full flex">
      {/* Left Panel - Sources */}
      {leftPanelOpen ? (
        <div className="w-[280px] flex-shrink-0 relative">
          <SourcesPanel 
            activeSourceId={activeSourceId}
            onSourceSelect={setActiveSourceId}
          />
          {/* Collapse button */}
          <button 
            onClick={() => setLeftPanelOpen(false)}
            className="absolute top-3 -right-3 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 cursor-pointer z-10"
          >
            <ChevronLeft className="w-3 h-3 text-gray-500" strokeWidth={2} />
          </button>
        </div>
      ) : (
        <button 
          onClick={() => setLeftPanelOpen(true)}
          className="w-8 flex-shrink-0 flex items-center justify-center border-r border-gray-200 hover:bg-gray-50 cursor-pointer"
        >
          <ChevronRight className="w-4 h-4 text-gray-400" strokeWidth={2} />
        </button>
      )}

      {/* Center - Editor */}
      <div className="flex-1 min-w-0 border-x border-gray-200">
        <Editor 
          onTrackSelection={handleTrackSelection}
          onClaimClick={handleClaimClick}
        />
      </div>

      {/* Right Panel - Claims */}
      {rightPanelOpen ? (
        <div className="w-[300px] flex-shrink-0 relative">
          {/* Collapse button */}
          <button 
            onClick={() => setRightPanelOpen(false)}
            className="absolute top-3 -left-3 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 cursor-pointer z-10"
          >
            <ChevronRight className="w-3 h-3 text-gray-500" strokeWidth={2} />
          </button>
          <ClaimsPanel 
            selectedClaimId={selectedClaimId}
            onClaimSelect={setSelectedClaimId}
          />
        </div>
      ) : (
        <button 
          onClick={() => setRightPanelOpen(true)}
          className="w-8 flex-shrink-0 flex items-center justify-center border-l border-gray-200 hover:bg-gray-50 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 text-gray-400" strokeWidth={2} />
        </button>
      )}

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
    </div>
  )
}