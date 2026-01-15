// src/app/(dashboard)/workspace/page.tsx

'use client'

import { useState, useCallback, useRef } from 'react'
import Editor, { EditorRef } from '@/components/workspace/Editor'
import TrackClaimModal from '@/components/workspace/TrackClaimModal'
import VerificationMargin from '@/components/workspace/VerificationMargin'
import { Check, AlertTriangle, X, Clock, ChevronLeft, MessageSquare } from 'lucide-react'

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

// Chat message type
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  context?: string
}

export default function WorkspacePage() {
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null)
  const [hoveredClaimId, setHoveredClaimId] = useState<string | null>(null)
  const [marginCollapsed, setMarginCollapsed] = useState(false)
  
  // Track modal state
  const [trackModalOpen, setTrackModalOpen] = useState(false)
  const [pendingTrackText, setPendingTrackText] = useState('')
  const [pendingTrackRange, setPendingTrackRange] = useState<{ from: number; to: number } | null>(null)

  // Chat state
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatContext, setChatContext] = useState<string | null>(null)

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

  // Handle add to chat from editor
  const handleAddToChat = useCallback((text: string, from: number, to: number, context: string) => {
    setChatContext(text)
    setChatOpen(true)
    // Pre-populate with the selected text as context
    setChatMessages([{
      id: '1',
      role: 'user',
      content: `Regarding: "${text}"`,
      context: context,
    }])
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
            onAddToChat={handleAddToChat}
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
              className="p-2.5 border-b border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
              title="Expand verification panel"
            >
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
            
            {/* Status summary when collapsed */}
            {claims.length > 0 && (
              <div className="flex-1 flex flex-col items-center py-3 gap-2">
                {claims.filter(c => c.status === 'verified').length > 0 && (
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center cursor-pointer" title="Verified">
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  </div>
                )}
                {claims.filter(c => c.status === 'pending').length > 0 && (
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer" title="Pending">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                )}
                {claims.filter(c => c.status === 'stale').length > 0 && (
                  <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center cursor-pointer" title="Stale">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                )}
                {claims.filter(c => c.status === 'contradiction').length > 0 && (
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center cursor-pointer" title="Contradiction">
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

      {/* Chat panel - slides in from right */}
      {chatOpen && (
        <div className="w-[350px] flex-shrink-0 border-l border-gray-200 bg-white flex flex-col">
          {/* Chat header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-900">Chat</span>
            </div>
            <button 
              onClick={() => setChatOpen(false)}
              className="p-1 rounded hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map(msg => (
              <div key={msg.id} className={`${msg.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block px-3 py-2 rounded-lg text-sm max-w-[90%] ${
                  msg.role === 'user' 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {chatMessages.length === 1 && (
              <div className="text-center py-4">
                <p className="text-xs text-gray-400">Ask a question about the selected text</p>
                <div className="mt-3 space-y-2">
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                    Find sources that verify this
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                    Red team this paragraph
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                    Check if this is still accurate
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Chat input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about this selection..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 cursor-pointer">
                Send
              </button>
            </div>
          </div>
        </div>
      )}

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