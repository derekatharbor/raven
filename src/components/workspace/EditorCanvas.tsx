// Route: src/components/workspace/EditorCanvas.tsx

'use client'

import { forwardRef, useEffect, useRef, useCallback } from 'react'
import { X, FileText } from 'lucide-react'
import type { UploadedDocument, Claim } from '@/app/(dashboard)/workspace/page'

interface EditorCanvasProps {
  document: UploadedDocument | undefined
  claims: Claim[]
  openTabs: string[]
  activeTab: string | null
  documents: UploadedDocument[]
  activeClaimId: string | null
  onTabSelect: (docId: string) => void
  onTabClose: (docId: string) => void
  onClaimVisibilityChange: (claimId: string, isVisible: boolean) => void
  onClaimHover: (claimId: string | null) => void
}

const EditorCanvas = forwardRef<HTMLDivElement, EditorCanvasProps>(({
  document,
  claims,
  openTabs,
  activeTab,
  documents,
  activeClaimId,
  onTabSelect,
  onTabClose,
  onClaimVisibilityChange,
  onClaimHover,
}, ref) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  
  // Set up Intersection Observer for claim visibility
  useEffect(() => {
    if (!contentRef.current) return
    
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect()
    }
    
    // Create new observer - triggers when claim enters upper 30% of viewport
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const claimId = entry.target.getAttribute('data-claim-id')
          if (claimId) {
            onClaimVisibilityChange(claimId, entry.isIntersecting)
          }
        })
      },
      {
        root: contentRef.current,
        rootMargin: '-0% 0px -70% 0px', // Upper 30% of viewport
        threshold: 0,
      }
    )
    
    // Observe all claim elements
    const claimElements = contentRef.current.querySelectorAll('[data-claim-id]')
    claimElements.forEach(el => observerRef.current?.observe(el))
    
    return () => {
      observerRef.current?.disconnect()
    }
  }, [document, claims, onClaimVisibilityChange])
  
  const getStatusColor = (status: Claim['status']) => {
    switch (status) {
      case 'verified': return { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgb(34, 197, 94)' }
      case 'contradiction': return { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgb(239, 68, 68)' }
      case 'pending': return { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgb(59, 130, 246)' }
      case 'stale': return { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgb(245, 158, 11)' }
    }
  }

  // Empty state - no document selected
  if (!document) {
    return (
      <div className="h-full flex flex-col">
        {/* Empty tabs bar */}
        <div className="h-9 border-b border-gray-200 bg-gray-50/50" />
        
        {/* Empty state */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-gray-400">Select a document to start editing</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={ref} className="h-full flex flex-col">
      {/* Tabs Bar - Bottom style like Excel */}
      <div className="flex-1 overflow-hidden" ref={contentRef}>
        {/* Document content area */}
        <div className="h-full overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            {/* Document title */}
            <h1 className="text-xl font-semibold text-gray-900 mb-6">
              {document.name}
            </h1>
            
            {/* Placeholder content with sample claims */}
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                This is placeholder content for the document. In production, this would be 
                the actual parsed content from the uploaded file.
              </p>
              
              {/* Sample claim highlights */}
              {claims.map(claim => {
                const colors = getStatusColor(claim.status)
                const isActive = claim.id === activeClaimId
                
                return (
                  <span
                    key={claim.id}
                    data-claim-id={claim.id}
                    className={`
                      inline cursor-pointer transition-all duration-150
                      ${isActive ? 'ring-2 ring-offset-1' : ''}
                    `}
                    style={{
                      backgroundColor: colors.bg,
                      borderBottom: `2px solid ${colors.border}`,
                      ringColor: isActive ? colors.border : undefined,
                      padding: '1px 2px',
                      borderRadius: '2px',
                    }}
                    onMouseEnter={() => onClaimHover(claim.id)}
                    onMouseLeave={() => onClaimHover(null)}
                  >
                    {claim.text}
                  </span>
                )
              })}
              
              <p className="text-gray-700 leading-relaxed mb-4 mt-4">
                Additional document content would appear here. The editor will support 
                rich text editing, highlighting, and claim extraction.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Tabs - Excel style */}
      <div className="h-8 border-t border-gray-200 bg-gray-50 flex items-center px-1 gap-0.5 overflow-x-auto">
        {openTabs.map(tabId => {
          const doc = documents.find(d => d.id === tabId)
          if (!doc) return null
          
          const isActive = tabId === activeTab
          
          return (
            <div
              key={tabId}
              className={`
                group flex items-center gap-1.5 px-3 py-1 text-[12px] cursor-pointer
                border-t-2 transition-colors rounded-t-sm
                ${isActive 
                  ? 'bg-white border-blue-500 text-gray-900' 
                  : 'bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200'
                }
              `}
              onClick={() => onTabSelect(tabId)}
            >
              <FileText className="w-3 h-3" strokeWidth={1.5} />
              <span className="truncate max-w-[120px]">{doc.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onTabClose(tabId)
                }}
                className={`
                  p-0.5 rounded transition-colors cursor-pointer
                  ${isActive 
                    ? 'hover:bg-gray-200 text-gray-400 hover:text-gray-600' 
                    : 'opacity-0 group-hover:opacity-100 hover:bg-gray-300 text-gray-400'
                  }
                `}
              >
                <X className="w-3 h-3" strokeWidth={2} />
              </button>
            </div>
          )
        })}
        
        {/* Add tab button placeholder */}
        {openTabs.length > 0 && (
          <div className="px-2 py-1 text-gray-400 text-[12px]">
            +
          </div>
        )}
      </div>
    </div>
  )
})

EditorCanvas.displayName = 'EditorCanvas'

export default EditorCanvas
