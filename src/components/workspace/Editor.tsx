// src/components/workspace/Editor.tsx

'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Mark, mergeAttributes } from '@tiptap/core'
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Underline as UnderlineIcon, 
  Link as LinkIcon, 
  Quote, 
  Code,
  X,
  Clock,
} from 'lucide-react'
import { useState, useCallback, useRef, forwardRef, useImperativeHandle } from 'react'

// TrackedClaim Mark Extension - inline with Linear style
const TrackedClaim = Mark.create({
  name: 'trackedClaim',

  addAttributes() {
    return {
      claimId: {
        default: null,
        parseHTML: element => element.getAttribute('data-claim-id'),
        renderHTML: attributes => {
          if (!attributes.claimId) return {}
          return { 'data-claim-id': attributes.claimId }
        },
      },
      source: {
        default: null,
        parseHTML: element => element.getAttribute('data-source'),
        renderHTML: attributes => {
          if (!attributes.source) return {}
          return { 'data-source': attributes.source }
        },
      },
      cadence: {
        default: null,
        parseHTML: element => element.getAttribute('data-cadence'),
        renderHTML: attributes => {
          if (!attributes.cadence) return {}
          return { 'data-cadence': attributes.cadence }
        },
      },
      category: {
        default: null,
        parseHTML: element => element.getAttribute('data-category'),
        renderHTML: attributes => {
          if (!attributes.category) return {}
          return { 'data-category': attributes.category }
        },
      },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-claim-id]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        class: 'tracked-claim-wrapper',
      }),
      0,
    ]
  },
})

interface EditorProps {
  content?: string | object
  onTrackSelection?: (text: string, from: number, to: number, context: string) => void
  onAddToChat?: (text: string, from: number, to: number, context: string) => void
  onClaimClick?: (claimId: string) => void
  onClaimHover?: (claimId: string | null) => void
  onContentChange?: (content: any) => void
}

export interface EditorRef {
  applyTrackedMark: (from: number, to: number, claimId: string, config?: { source?: string; cadence?: string; category?: string }) => void
  getContent: () => any
}

const Editor = forwardRef<EditorRef, EditorProps>(({ content, onTrackSelection, onAddToChat, onClaimClick, onClaimHover, onContentChange }, ref) => {
  const [isLinkInputOpen, setIsLinkInputOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [selectionPos, setSelectionPos] = useState<{ top: number; left: number } | null>(null)
  const [hasSelection, setHasSelection] = useState(false)
  const [tooltip, setTooltip] = useState<{
    visible: boolean
    x: number
    y: number
    claimId: string
    text: string
    source: string
    cadence: string
  } | null>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your report...',
      }),
      TrackedClaim,
    ],
    content: content || `
      <h1>Q4 2024 Investment Memo</h1>
      <p>This document outlines our analysis of NVIDIA Corporation (NVDA) for the Q4 2024 investment committee review.</p>
      
      <h2>Executive Summary</h2>
      <p>NVIDIA continues to dominate the AI accelerator market with an estimated market share of 80%. The company's data center revenue reached $14.5B in Q3, representing 279% year-over-year growth.</p>
      
      <h2>Key Metrics</h2>
      <p>Current market capitalization stands at $1.2 trillion, with a forward P/E ratio of 45x. Gross margins have expanded to 74%, driven by strong demand for H100 GPUs.</p>
      
      <h2>Risk Factors</h2>
      <p>Primary concerns include increasing competition from AMD and Intel, potential supply chain disruptions from TSMC, and regulatory scrutiny in China which accounts for approximately 20% of revenue.</p>
      
      <h2>Recommendation</h2>
      <p>We maintain our OVERWEIGHT rating with a 12-month price target of $650, implying 25% upside from current levels.</p>
    `,
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-full px-12 py-8',
      },
      handleClick: (view, pos, event) => {
        // Check if clicked on a tracked claim
        const target = event.target as HTMLElement
        if (target.classList.contains('tracked-claim-wrapper')) {
          const claimId = target.getAttribute('data-claim-id')
          if (claimId) {
            onClaimClick?.(claimId)
            return true
          }
        }
        return false
      },
      handleDOMEvents: {
        mouseover: (view, event) => {
          const target = event.target as HTMLElement
          if (target.classList.contains('tracked-claim-wrapper')) {
            const rect = target.getBoundingClientRect()
            const claimId = target.getAttribute('data-claim-id') || ''
            const source = target.getAttribute('data-source') || ''
            const cadence = target.getAttribute('data-cadence') || ''
            const text = target.textContent?.replace(/○\s*HAR-\d+\s*/, '') || ''
            
            setTooltip({
              visible: true,
              x: rect.left + rect.width / 2,
              y: rect.top - 8,
              claimId,
              text,
              source,
              cadence,
            })
            
            // Notify parent to highlight corresponding card
            onClaimHover?.(claimId)
          }
          return false
        },
        mouseout: (view, event) => {
          const target = event.target as HTMLElement
          if (target.classList.contains('tracked-claim-wrapper')) {
            setTooltip(null)
            onClaimHover?.(null)
          }
          return false
        },
      },
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection
      const text = editor.state.doc.textBetween(from, to, ' ')
      
      if (text.trim().length > 0) {
        const { view } = editor
        const start = view.coordsAtPos(from)
        const end = view.coordsAtPos(to)
        
        const left = (start.left + end.left) / 2
        const top = start.top - 50
        
        setSelectionPos({ top, left })
        setHasSelection(true)
      } else {
        setHasSelection(false)
      }
    },
    onUpdate: ({ editor }) => {
      // Notify parent of content changes for auto-save
      onContentChange?.(editor.getJSON())
    },
    onBlur: () => {
      setTimeout(() => {
        if (!toolbarRef.current?.contains(document.activeElement)) {
          setHasSelection(false)
        }
      }, 150)
    },
  })

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    applyTrackedMark: (from: number, to: number, claimId: string, config?: { source?: string; cadence?: string; category?: string }) => {
      if (!editor) return
      editor
        .chain()
        .focus()
        .setTextSelection({ from, to })
        .setMark('trackedClaim', { 
          claimId,
          source: config?.source,
          cadence: config?.cadence,
          category: config?.category,
        })
        .run()
      setHasSelection(false)
    },
    getContent: () => {
      return editor?.getJSON() || null
    },
  }))

  const handleTrack = useCallback(() => {
    if (!editor) return
    
    const { from, to } = editor.state.selection
    const text = editor.state.doc.textBetween(from, to, ' ')
    
    if (text.trim()) {
      // Capture surrounding context (±100 chars)
      const docSize = editor.state.doc.content.size
      const contextStart = Math.max(0, from - 100)
      const contextEnd = Math.min(docSize, to + 100)
      const context = editor.state.doc.textBetween(contextStart, contextEnd, ' ')
      
      onTrackSelection?.(text, from, to, context)
    }
  }, [editor, onTrackSelection])

  const handleAddToChat = useCallback(() => {
    if (!editor) return
    
    const { from, to } = editor.state.selection
    const text = editor.state.doc.textBetween(from, to, ' ')
    
    if (text.trim()) {
      // Capture surrounding context (±100 chars)
      const docSize = editor.state.doc.content.size
      const contextStart = Math.max(0, from - 100)
      const contextEnd = Math.min(docSize, to + 100)
      const context = editor.state.doc.textBetween(contextStart, contextEnd, ' ')
      
      onAddToChat?.(text, from, to, context)
    }
  }, [editor, onAddToChat])

  const handleSetLink = useCallback(() => {
    if (!editor || !linkUrl) return
    
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: linkUrl })
      .run()
    
    setLinkUrl('')
    setIsLinkInputOpen(false)
  }, [editor, linkUrl])

  const handleRemoveLink = useCallback(() => {
    if (!editor) return
    editor.chain().focus().unsetLink().run()
  }, [editor])

  if (!editor) return null

  return (
    <div className="h-full flex flex-col bg-white relative" ref={editorContainerRef}>
      {/* Global styles for editor */}
      <style jsx global>{`
        .ProseMirror h1 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 1rem;
          line-height: 1.2;
        }
        .ProseMirror h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          line-height: 1.3;
        }
        .ProseMirror p {
          font-size: 0.9375rem;
          color: #374151;
          line-height: 1.7;
          margin-bottom: 1rem;
        }
        .ProseMirror .tracked-claim-wrapper {
          position: relative;
          display: inline;
          background-color: #F9FAFB;
          border: 1px solid #E5E7EB;
          border-radius: 4px;
          padding: 2px 6px;
          color: #4B5563;
          cursor: pointer;
          transition: all 0.15s ease;
          text-decoration: none;
        }
        .ProseMirror .tracked-claim-wrapper:hover {
          background-color: #F3F4F6;
          border-color: #D1D5DB;
          color: #374151;
        }
        .ProseMirror .tracked-claim-wrapper::before {
          content: '○ ' attr(data-claim-id) ' ';
          font-size: 0.85em;
          color: #9CA3AF;
          font-family: ui-monospace, SFMono-Regular, monospace;
        }
        .ProseMirror .tracked-claim-wrapper:hover::before {
          color: #6B7280;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #9ca3af;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>

      {/* Floating Toolbar - off-white to match sidebar */}
      {hasSelection && selectionPos && (
        <div 
          ref={toolbarRef}
          className="fixed z-50 flex items-center gap-0.5 px-1.5 py-1.5 rounded-lg border border-gray-200"
          style={{
            top: selectionPos.top,
            left: selectionPos.left,
            transform: 'translateX(-50%)',
            backgroundColor: '#FBF9F7',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          }}
        >
          {isLinkInputOpen ? (
            <div className="flex items-center gap-1 px-2">
              <input
                type="url"
                placeholder="Enter URL..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSetLink()}
                className="bg-transparent text-gray-900 text-sm outline-none w-48 placeholder-gray-400"
                autoFocus
              />
              <button 
                onClick={handleSetLink}
                className="p-1 text-gray-500 hover:text-gray-900 cursor-pointer"
              >
                <LinkIcon className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <button 
                onClick={() => setIsLinkInputOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-900 cursor-pointer"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <>
              {/* Text style dropdown placeholder */}
              <button className="px-2 py-1.5 text-sm text-gray-500 hover:text-gray-900 cursor-pointer flex items-center gap-1 rounded hover:bg-white/50">
                Aa
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className="w-px h-5 bg-gray-300 mx-1" />
              
              {/* Bold */}
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1.5 rounded cursor-pointer transition-colors ${
                  editor.isActive('bold') ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <Bold className="w-4 h-4" strokeWidth={2} />
              </button>
              
              {/* Italic */}
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded cursor-pointer transition-colors ${
                  editor.isActive('italic') ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <Italic className="w-4 h-4" strokeWidth={2} />
              </button>
              
              {/* Strikethrough */}
              <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`p-1.5 rounded cursor-pointer transition-colors ${
                  editor.isActive('strike') ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <Strikethrough className="w-4 h-4" strokeWidth={2} />
              </button>
              
              {/* Underline */}
              <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-1.5 rounded cursor-pointer transition-colors ${
                  editor.isActive('underline') ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <UnderlineIcon className="w-4 h-4" strokeWidth={2} />
              </button>
              
              {/* Link */}
              <button
                onClick={() => {
                  if (editor.isActive('link')) {
                    handleRemoveLink()
                  } else {
                    setIsLinkInputOpen(true)
                  }
                }}
                className={`p-1.5 rounded cursor-pointer transition-colors ${
                  editor.isActive('link') ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <LinkIcon className="w-4 h-4" strokeWidth={2} />
              </button>
              
              {/* Quote */}
              <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-1.5 rounded cursor-pointer transition-colors ${
                  editor.isActive('blockquote') ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <Quote className="w-4 h-4" strokeWidth={2} />
              </button>
              
              {/* Code */}
              <button
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={`p-1.5 rounded cursor-pointer transition-colors ${
                  editor.isActive('code') ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <Code className="w-4 h-4" strokeWidth={2} />
              </button>
              
              <div className="w-px h-5 bg-gray-300 mx-1" />
              
              {/* Add to Chat */}
              <button
                onClick={handleAddToChat}
                className="px-2.5 py-1.5 rounded cursor-pointer transition-colors text-gray-600 hover:text-gray-900 hover:bg-white/50 text-sm font-medium"
              >
                Add to Chat
              </button>
              
              {/* Track */}
              <button
                onClick={handleTrack}
                className="px-2.5 py-1.5 rounded cursor-pointer transition-colors bg-gray-900 text-white hover:bg-gray-800 text-sm font-medium"
              >
                Track
              </button>
            </>
          )}
        </div>
      )}

      {/* Claim Tooltip */}
      {tooltip && tooltip.visible && (
        <div 
          className="fixed z-[100] pointer-events-none"
          style={{
            top: tooltip.y,
            left: tooltip.x,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div 
            className="rounded-lg border border-gray-200 p-3 min-w-[200px] max-w-[280px]"
            style={{
              backgroundColor: '#FBF9F7',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Claim ID */}
            <div className="text-xs text-gray-400 font-mono mb-1">{tooltip.claimId}</div>
            
            {/* Claim text */}
            <p className="text-sm text-gray-900 mb-3 line-clamp-2">{tooltip.text}</p>
            
            {/* Divider */}
            <div className="border-t border-gray-200 pt-2 flex items-center gap-3">
              {/* Source with logo */}
              <div className="flex items-center gap-1.5">
                <img 
                  src={`https://cdn.brandfetch.io/${tooltip.source.toLowerCase()}.com?c=1id1Fyz-h7an5-5KR_y`}
                  alt=""
                  className="w-4 h-4 rounded object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <span className="text-xs text-gray-600 capitalize">{tooltip.source}</span>
              </div>
              
              {/* Cadence */}
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-400" strokeWidth={2} />
                <span className="text-xs text-gray-500 capitalize">{tooltip.cadence}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

Editor.displayName = 'Editor'

export default Editor