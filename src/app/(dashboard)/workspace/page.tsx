// Route: src/app/(dashboard)/workspace/page.tsx

'use client'

import { useState, useRef, useCallback } from 'react'
import DocumentPanel from '@/components/workspace/DocumentPanel'
import EditorCanvas from '@/components/workspace/EditorCanvas'
import IntelligenceGutter from '@/components/workspace/IntelligenceGutter'

export interface UploadedDocument {
  id: string
  name: string
  type: 'pdf' | 'docx' | 'xlsx' | 'csv' | 'txt' | 'md'
  uploadedAt: string
  uploadedBy?: string
  content?: string
}

export interface Claim {
  id: string
  documentId: string
  text: string
  startOffset: number
  endOffset: number
  status: 'verified' | 'contradiction' | 'pending' | 'stale'
  source: {
    name: string
    logo?: string
    forecast?: string
    analyst?: string
    publishedDate?: string
    keyDataPoint?: string
    confidence?: number
    lastChecked?: string
  }
}

export default function WorkspacePage() {
  // Pane widths
  const [leftWidth, setLeftWidth] = useState(240)
  const [rightWidth, setRightWidth] = useState(320)
  
  // Documents state
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [openTabs, setOpenTabs] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<string | null>(null)
  
  // Claims state
  const [claims, setClaims] = useState<Claim[]>([])
  const [activeClaimId, setActiveClaimId] = useState<string | null>(null)
  const [visibleClaimIds, setVisibleClaimIds] = useState<Set<string>>(new Set())
  
  // Refs for bidirectional scroll sync
  const editorRef = useRef<HTMLDivElement>(null)
  
  // Resizing logic
  const [isResizingLeft, setIsResizingLeft] = useState(false)
  const [isResizingRight, setIsResizingRight] = useState(false)
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isResizingLeft) {
      const newWidth = Math.max(180, Math.min(400, e.clientX - 68)) // 68 = sidebar width + gap
      setLeftWidth(newWidth)
    }
    if (isResizingRight) {
      const newWidth = Math.max(280, Math.min(500, window.innerWidth - e.clientX))
      setRightWidth(newWidth)
    }
  }, [isResizingLeft, isResizingRight])
  
  const handleMouseUp = useCallback(() => {
    setIsResizingLeft(false)
    setIsResizingRight(false)
  }, [])
  
  // Document handlers
  const handleDocumentUpload = (files: File[]) => {
    const newDocs: UploadedDocument[] = files.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      type: getFileType(file.name),
      uploadedAt: new Date().toISOString(),
    }))
    setDocuments(prev => [...prev, ...newDocs])
    
    // Auto-open first uploaded doc
    if (newDocs.length > 0 && openTabs.length === 0) {
      setOpenTabs([newDocs[0].id])
      setActiveTab(newDocs[0].id)
    }
  }
  
  const handleDocumentSelect = (docId: string) => {
    if (!openTabs.includes(docId)) {
      setOpenTabs(prev => [...prev, docId])
    }
    setActiveTab(docId)
  }
  
  const handleTabClose = (docId: string) => {
    setOpenTabs(prev => prev.filter(id => id !== docId))
    if (activeTab === docId) {
      const remaining = openTabs.filter(id => id !== docId)
      setActiveTab(remaining.length > 0 ? remaining[remaining.length - 1] : null)
    }
  }
  
  // Claim handlers
  const handleClaimVisibilityChange = (claimId: string, isVisible: boolean) => {
    setVisibleClaimIds(prev => {
      const next = new Set(prev)
      if (isVisible) {
        next.add(claimId)
      } else {
        next.delete(claimId)
      }
      return next
    })
  }
  
  const handleClaimClick = (claimId: string) => {
    setActiveClaimId(claimId)
    // Scroll to claim in editor
    const element = document.querySelector(`[data-claim-id="${claimId}"]`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }
  
  const handleClaimHover = (claimId: string | null) => {
    setActiveClaimId(claimId)
  }
  
  const activeDocument = documents.find(d => d.id === activeTab)
  const documentClaims = claims.filter(c => c.documentId === activeTab)
  
  // Separate claims by status for smart stacking
  const contradictionClaims = documentClaims.filter(c => c.status === 'contradiction')
  const otherClaims = documentClaims.filter(c => c.status !== 'contradiction')

  return (
    <div 
      className="h-[calc(100vh-24px)] flex overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Left Pane - Document Panel */}
      <div 
        className="flex-shrink-0 border-r border-gray-200 overflow-hidden"
        style={{ width: leftWidth }}
      >
        <DocumentPanel
          activeDocumentId={activeTab}
          onDocumentSelect={handleDocumentSelect}
        />
      </div>
      
      {/* Left Resize Handle */}
      <div
        className="w-1 hover:bg-blue-500/20 cursor-col-resize flex-shrink-0 transition-colors"
        onMouseDown={() => setIsResizingLeft(true)}
      />
      
      {/* Center Pane - Editor Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <EditorCanvas
          ref={editorRef}
          document={activeDocument}
          claims={documentClaims}
          openTabs={openTabs}
          activeTab={activeTab}
          documents={documents}
          activeClaimId={activeClaimId}
          onTabSelect={setActiveTab}
          onTabClose={handleTabClose}
          onClaimVisibilityChange={handleClaimVisibilityChange}
          onClaimHover={handleClaimHover}
        />
      </div>
      
      {/* Right Resize Handle */}
      <div
        className="w-1 hover:bg-blue-500/20 cursor-col-resize flex-shrink-0 transition-colors"
        onMouseDown={() => setIsResizingRight(true)}
      />
      
      {/* Right Pane - Intelligence Gutter */}
      <div 
        className="flex-shrink-0 border-l border-gray-200 overflow-hidden"
        style={{ width: rightWidth }}
      >
        <IntelligenceGutter
          claims={documentClaims}
          contradictionClaims={contradictionClaims}
          visibleClaimIds={visibleClaimIds}
          activeClaimId={activeClaimId}
          onClaimClick={handleClaimClick}
          onClaimHover={handleClaimHover}
        />
      </div>
    </div>
  )
}

function getFileType(filename: string): UploadedDocument['type'] {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'pdf': return 'pdf'
    case 'docx':
    case 'doc': return 'docx'
    case 'xlsx':
    case 'xls': return 'xlsx'
    case 'csv': return 'csv'
    case 'md': return 'md'
    default: return 'txt'
  }
}