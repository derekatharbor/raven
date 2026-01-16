// src/app/(dashboard)/workspace/page.tsx

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/layout/Sidebar'
import DocumentPane from '@/components/workspace/DocumentPane'
import EditorTabs from '@/components/workspace/EditorTabs'
import Editor, { EditorRef } from '@/components/workspace/Editor'
import TrackClaimModal from '@/components/workspace/TrackClaimModal'
import VerificationMargin from '@/components/workspace/VerificationMargin'
import ChatPanel from '@/components/workspace/ChatPanel'
import EditorStatusBar from '@/components/workspace/EditorStatusBar'
import EditorCanvas from '@/components/workspace/EditorCanvas'
import { useSources } from '@/hooks/useSources'
import { Check, AlertTriangle, X, Clock, ChevronLeft } from 'lucide-react'

// Types
interface Document {
  id: string
  name: string
  alerts: number
  updatedAt: string
  wordCount: number
}

interface Workspace {
  name: string
  documents: Document[]
}

interface TrackedClaim {
  id: string
  text: string
  status: 'pending' | 'verified' | 'stale' | 'contradiction'
  source: string
  lastChecked: string
  documentId: string
}

interface Tab {
  id: string
  name: string
  hasChanges: boolean
}

// Mock workspace data
const INITIAL_WORKSPACES: Record<string, Workspace> = {
  w1: {
    name: 'Acme Corp DD',
    documents: [
      { id: 'd1', name: 'Taiwan Strait Analysis', alerts: 2, updatedAt: 'today', wordCount: 847 },
      { id: 'd2', name: 'Supply Chain Risk', alerts: 0, updatedAt: 'today', wordCount: 234 },
      { id: 'd3', name: 'Q4 Revenue Model', alerts: 1, updatedAt: 'yesterday', wordCount: 512 },
    ],
  },
  w2: {
    name: 'Nordic Telecoms',
    documents: [
      { id: 'd4', name: 'Market Entry Memo', alerts: 0, updatedAt: 'today', wordCount: 389 },
    ],
  },
}

// Claim ID generator
let claimCounter = 0
function generateClaimId() {
  claimCounter++
  return `RAV-${String(claimCounter).padStart(3, '0')}`
}

// Document ID generator
let docCounter = 100
function generateDocId() {
  docCounter++
  return `d${docCounter}`
}

export default function WorkspacePage() {
  // Workspace & document state
  const [workspaces, setWorkspaces] = useState(INITIAL_WORKSPACES)
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('w1')
  const [activeDocumentId, setActiveDocumentId] = useState('d1')
  const [openTabs, setOpenTabs] = useState<Tab[]>([
    { id: 'd1', name: 'Taiwan Strait Analysis', hasChanges: false },
  ])
  
  // UI state
  const [marginCollapsed, setMarginCollapsed] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatContext, setChatContext] = useState<{ text: string } | null>(null)
  const [trackModalOpen, setTrackModalOpen] = useState(false)
  const [pendingTrackText, setPendingTrackText] = useState('')
  const [pendingTrackRange, setPendingTrackRange] = useState<{ from: number; to: number } | null>(null)
  const [docPaneCollapsed, setDocPaneCollapsed] = useState(false)
  
  // Claims state
  const [claims, setClaims] = useState<TrackedClaim[]>([])
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null)
  const [hoveredClaimId, setHoveredClaimId] = useState<string | null>(null)
  
  // Editor state
  const [editorMode, setEditorMode] = useState<'write' | 'review' | 'verify'>('write')
  const [darkMode, setDarkMode] = useState(false)

  const { connectedSources, connect } = useSources()
  const connectedCount = connectedSources.filter(s => s.status === 'connected').length

  const editorRef = useRef<EditorRef>(null)
  
  // Derived state
  const workspace = workspaces[activeWorkspaceId]
  const activeDocument = workspace?.documents.find(d => d.id === activeDocumentId)
  const documentClaims = claims.filter(c => c.documentId === activeDocumentId)
  
  const claimSummary = {
    verified: documentClaims.filter(c => c.status === 'verified').length,
    pending: documentClaims.filter(c => c.status === 'pending').length,
    stale: documentClaims.filter(c => c.status === 'stale').length,
    contradiction: documentClaims.filter(c => c.status === 'contradiction').length,
  }

  // Auto-connect to SEC EDGAR on mount
  useEffect(() => {
    const autoConnect = async () => {
      const isSecConnected = connectedSources.some(s => s.type === 'sec-edgar' && s.status === 'connected')
      if (!isSecConnected) {
        await connect({ type: 'sec-edgar', config: { userAgent: 'Raven/1.0 (contact@tryraven.io)' } })
      }
    }
    autoConnect()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Handlers
  const handleWorkspaceSelect = (id: string) => {
    setActiveWorkspaceId(id)
    const ws = workspaces[id]
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

  const handleNewDocument = useCallback(() => {
    const newId = generateDocId()
    const newDoc: Document = {
      id: newId,
      name: 'Untitled',
      alerts: 0,
      updatedAt: 'today',
      wordCount: 0,
    }
    
    // Add to workspace
    setWorkspaces(prev => ({
      ...prev,
      [activeWorkspaceId]: {
        ...prev[activeWorkspaceId],
        documents: [newDoc, ...prev[activeWorkspaceId].documents],
      },
    }))
    
    // Open in tab
    setOpenTabs(prev => [...prev, { id: newId, name: 'Untitled', hasChanges: true }])
    setActiveDocumentId(newId)
  }, [activeWorkspaceId])

  const handleDocumentDelete = useCallback((docId: string) => {
    // Remove from workspace
    setWorkspaces(prev => ({
      ...prev,
      [activeWorkspaceId]: {
        ...prev[activeWorkspaceId],
        documents: prev[activeWorkspaceId].documents.filter(d => d.id !== docId),
      },
    }))
    
    // Close tab if open
    handleTabClose(docId)
  }, [activeWorkspaceId])

  const handleTrackSelection = useCallback((text: string, from: number, to: number) => {
    setPendingTrackText(text)
    setPendingTrackRange({ from, to })
    setTrackModalOpen(true)
  }, [])

  const handleAddToChat = useCallback((text: string) => {
    setChatContext({ text })
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
      source: config.source,
      lastChecked: 'Just now',
      documentId: activeDocumentId,
    }, ...prev])
    setTrackModalOpen(false)
    setPendingTrackText('')
    setPendingTrackRange(null)
    setSelectedClaimId(claimId)
    if (marginCollapsed) setMarginCollapsed(false)
    if (chatOpen) setChatOpen(false)
  }, [pendingTrackText, pendingTrackRange, marginCollapsed, chatOpen, activeDocumentId])

  return (
    <div className={`h-screen flex ${darkMode ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
      <Sidebar 
        activeWorkspaceId={activeWorkspaceId} 
        onWorkspaceSelect={handleWorkspaceSelect}
        connectedSourceCount={connectedCount}
      />
      
      {workspace && (
        <DocumentPane
          workspaceName={workspace.name}
          documents={workspace.documents}
          activeDocumentId={activeDocumentId}
          onDocumentSelect={handleDocumentSelect}
          onDocumentCreate={handleNewDocument}
          onDocumentDelete={handleDocumentDelete}
          collapsed={docPaneCollapsed}
          onCollapsedChange={setDocPaneCollapsed}
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
          <EditorCanvas darkMode={darkMode} pageWidth="medium">
            <Editor 
              ref={editorRef}
              onTrackSelection={handleTrackSelection}
              onAddToChat={handleAddToChat}
              onClaimClick={setSelectedClaimId}
              onClaimHover={setHoveredClaimId}
            />
          </EditorCanvas>

          {chatOpen ? (
            <ChatPanel 
              onClose={() => { setChatOpen(false); setChatContext(null) }}
              initialContext={chatContext}
            />
          ) : (
            <div className={`flex-shrink-0 transition-all duration-200 overflow-hidden ${marginCollapsed ? 'w-10' : 'w-[200px]'}`}>
              {marginCollapsed ? (
                <div className={`h-full flex flex-col border-l ${darkMode ? 'bg-[#232323] border-[#333]' : 'bg-[#FBF9F7] border-gray-200'}`}>
                  <button 
                    onClick={() => setMarginCollapsed(false)} 
                    className={`p-2.5 border-b cursor-pointer ${darkMode ? 'border-[#333] hover:bg-white/5' : 'border-gray-200 hover:bg-black/5'}`}
                  >
                    <ChevronLeft className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  </button>
                  {documentClaims.length > 0 && (
                    <div className="flex-1 flex flex-col items-center py-3 gap-2">
                      {documentClaims.some(c => c.status === 'verified') && <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                      {documentClaims.some(c => c.status === 'pending') && <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center"><Clock className="w-3 h-3 text-white" /></div>}
                      {documentClaims.some(c => c.status === 'stale') && <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center"><AlertTriangle className="w-3 h-3 text-white" /></div>}
                      {documentClaims.some(c => c.status === 'contradiction') && <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"><X className="w-3 h-3 text-white" /></div>}
                    </div>
                  )}
                </div>
              ) : (
                <VerificationMargin
                  claims={documentClaims}
                  selectedClaimId={selectedClaimId}
                  hoveredClaimId={hoveredClaimId}
                  onClaimClick={setSelectedClaimId}
                  onClaimHover={setHoveredClaimId}
                  onCollapse={() => setMarginCollapsed(true)}
                  darkMode={darkMode}
                />
              )}
            </div>
          )}
        </div>

        {/* Status Bar */}
        <EditorStatusBar
          wordCount={activeDocument?.wordCount || 0}
          claimSummary={claimSummary}
          connectedSources={connectedCount}
          mode={editorMode}
          onModeChange={setEditorMode}
          darkMode={darkMode}
          onDarkModeToggle={() => setDarkMode(!darkMode)}
          onExport={() => console.log('Export')}
          onShare={() => console.log('Share')}
          onCommandPalette={() => console.log('Command palette')}
        />
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