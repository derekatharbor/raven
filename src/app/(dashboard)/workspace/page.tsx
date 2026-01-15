// src/app/(dashboard)/workspace/page.tsx

'use client'

import { useState, useCallback, useRef } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import DocumentPane from '@/components/workspace/DocumentPane'
import EditorTabs from '@/components/workspace/EditorTabs'
import Editor, { EditorRef } from '@/components/workspace/Editor'
import TrackClaimModal from '@/components/workspace/TrackClaimModal'
import VerificationMargin from '@/components/workspace/VerificationMargin'
import ChatPanel from '@/components/workspace/ChatPanel'
import { Check, AlertTriangle, X, Clock, ChevronLeft } from 'lucide-react'

// Mock data
const WORKSPACES: Record<string, { name: string; documents: Array<{ id: string; name: string; alerts: number; updatedAt: string }> }> = {
  w1: {
    name: 'Acme Corp DD',
    documents: [
      { id: 'd1', name: 'Taiwan Strait Analysis', alerts: 2, updatedAt: 'today' },
      { id: 'd2', name: 'Supply Chain Risk', alerts: 0, updatedAt: 'today' },
      { id: 'd3', name: 'Q4 Revenue Model', alerts: 1, updatedAt: 'yesterday' },
    ],
  },
  w2: {
    name: 'Nordic Telecoms',
    documents: [
      { id: 'd4', name: 'Market Entry Memo', alerts: 0, updatedAt: 'today' },
    ],
  },
}

// Types
interface TrackedClaim {
  id: string
  text: string
  status: 'pending' | 'verified' | 'stale' | 'contradiction'
  source: string
  cadence: string
  category: string
  lastChecked: string
}

interface Tab {
  id: string
  name: string
  hasChanges: boolean
}

// Claim ID generator
let claimCounter = 0
function generateClaimId() {
  claimCounter++
  return `RAV-${String(claimCounter).padStart(3, '0')}`
}

export default function WorkspacePage() {
  // State
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('w1')
  const [activeDocumentId, setActiveDocumentId] = useState('d1')
  const [openTabs, setOpenTabs] = useState<Tab[]>([
    { id: 'd1', name: 'Taiwan Strait Analysis', hasChanges: false },
  ])
  const [marginCollapsed, setMarginCollapsed] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatContext, setChatContext] = useState<{ text: string; type: 'selection' } | null>(null)
  const [trackModalOpen, setTrackModalOpen] = useState(false)
  const [pendingTrackText, setPendingTrackText] = useState('')
  const [pendingTrackRange, setPendingTrackRange] = useState<{ from: number; to: number } | null>(null)
  const [claims, setClaims] = useState<TrackedClaim[]>([])
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null)
  const [hoveredClaimId, setHoveredClaimId] = useState<string | null>(null)

  const editorRef = useRef<EditorRef>(null)
  const workspace = WORKSPACES[activeWorkspaceId]

  // Handlers
  const handleWorkspaceSelect = (id: string) => {
    setActiveWorkspaceId(id)
    const ws = WORKSPACES[id]
    if (ws?.documents.length) {
      const doc = ws.documents[0]
      setActiveDocumentId(doc.id)
      setOpenTabs([{ id: doc.id, name: doc.name, hasChanges: false }])
    }
  }

  const handleDocumentSelect = (docId: string) => {
    setActiveDocumentId(docId)
    const doc = workspace?.documents.find(d => d.id === docId)
    if (doc && !openTabs.find(t => t.id === docId)) {
      setOpenTabs(prev => [...prev, { id: doc.id, name: doc.name, hasChanges: false }])
    }
  }

  const handleTabClose = (tabId: string) => {
    setOpenTabs(prev => {
      const newTabs = prev.filter(t => t.id !== tabId)
      if (tabId === activeDocumentId && newTabs.length > 0) {
        setActiveDocumentId(newTabs[newTabs.length - 1].id)
      }
      return newTabs
    })
  }

  const handleNewDocument = () => {
    const newId = `d${Date.now()}`
    setOpenTabs(prev => [...prev, { id: newId, name: 'Untitled', hasChanges: true }])
    setActiveDocumentId(newId)
  }

  const handleTrackSelection = useCallback((text: string, from: number, to: number) => {
    setPendingTrackText(text)
    setPendingTrackRange({ from, to })
    setTrackModalOpen(true)
  }, [])

  const handleAddToChat = useCallback((text: string) => {
    setChatContext({ text, type: 'selection' })
    setChatOpen(true)
    setMarginCollapsed(true)
  }, [])

  const handleTrackConfirm = useCallback((config: { source: string; cadence: string; category: string }) => {
    if (!pendingTrackRange) return
    const claimId = generateClaimId()
    editorRef.current?.applyTrackedMark(pendingTrackRange.from, pendingTrackRange.to, claimId, config)
    setClaims(prev => [{
      id: claimId,
      text: pendingTrackText,
      status: 'pending',
      ...config,
      lastChecked: 'Just now',
    }, ...prev])
    setTrackModalOpen(false)
    setPendingTrackText('')
    setPendingTrackRange(null)
    setSelectedClaimId(claimId)
    if (marginCollapsed) setMarginCollapsed(false)
    if (chatOpen) setChatOpen(false)
  }, [pendingTrackText, pendingTrackRange, marginCollapsed, chatOpen])

  return (
    <div className="h-screen flex bg-white">
      <Sidebar activeWorkspaceId={activeWorkspaceId} onWorkspaceSelect={handleWorkspaceSelect} />
      
      {workspace && (
        <DocumentPane
          workspaceName={workspace.name}
          documents={workspace.documents}
          activeDocumentId={activeDocumentId}
          onDocumentSelect={handleDocumentSelect}
          onDocumentCreate={handleNewDocument}
          onDocumentDelete={handleTabClose}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <EditorTabs
          tabs={openTabs}
          activeTabId={activeDocumentId}
          onTabSelect={setActiveDocumentId}
          onTabClose={handleTabClose}
          onNewTab={handleNewDocument}
        />

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 min-w-0">
            <Editor 
              ref={editorRef}
              onTrackSelection={handleTrackSelection}
              onAddToChat={handleAddToChat}
              onClaimClick={setSelectedClaimId}
              onClaimHover={setHoveredClaimId}
            />
          </div>

          {chatOpen ? (
            <ChatPanel 
              onClose={() => { setChatOpen(false); setChatContext(null) }}
              initialContext={chatContext}
            />
          ) : (
            <div className={`flex-shrink-0 border-l border-gray-200 bg-gray-50/50 transition-all duration-200 ${marginCollapsed ? 'w-10' : 'w-[200px]'}`}>
              {marginCollapsed ? (
                <div className="h-full flex flex-col">
                  <button onClick={() => setMarginCollapsed(false)} className="p-2.5 border-b border-gray-200 hover:bg-gray-100 cursor-pointer">
                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                  </button>
                  {claims.length > 0 && (
                    <div className="flex-1 flex flex-col items-center py-3 gap-2">
                      {claims.some(c => c.status === 'verified') && <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center"><Check className="w-3.5 h-3.5 text-green-600" /></div>}
                      {claims.some(c => c.status === 'pending') && <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center"><Clock className="w-3.5 h-3.5 text-gray-500" /></div>}
                      {claims.some(c => c.status === 'stale') && <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center"><AlertTriangle className="w-3.5 h-3.5 text-amber-600" /></div>}
                      {claims.some(c => c.status === 'contradiction') && <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center"><X className="w-3.5 h-3.5 text-red-600" /></div>}
                    </div>
                  )}
                </div>
              ) : (
                <VerificationMargin
                  claims={claims}
                  selectedClaimId={selectedClaimId}
                  hoveredClaimId={hoveredClaimId}
                  onClaimClick={setSelectedClaimId}
                  onClaimHover={setHoveredClaimId}
                  onCollapse={() => setMarginCollapsed(true)}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {trackModalOpen && (
        <TrackClaimModal
          text={pendingTrackText}
          onConfirm={handleTrackConfirm}
          onCancel={() => { setTrackModalOpen(false); setPendingTrackText(''); setPendingTrackRange(null) }}
        />
      )}
    </div>
  )
}