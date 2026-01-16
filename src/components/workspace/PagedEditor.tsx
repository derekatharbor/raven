// src/components/workspace/PagedEditor.tsx
//
// A real paginated document editor with:
// - Fixed page dimensions (US Letter)
// - Visual page separation (stacked white pages with shadows)
// - Single TipTap editor instance (editable everywhere)
// - Content flows naturally across pages
// - Manual page breaks
// - Proper printing support

'use client'

import { 
  useEditor, 
  EditorContent,
} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Mark, Node, mergeAttributes } from '@tiptap/core'
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
  Plus,
} from 'lucide-react'
import { 
  useState, 
  useCallback, 
  useRef, 
  forwardRef, 
  useImperativeHandle,
  useEffect,
  useLayoutEffect,
} from 'react'

// ============================================================================
// CONSTANTS
// ============================================================================

// US Letter dimensions at 96 DPI
const PAGE_WIDTH_INCHES = 8.5
const PAGE_HEIGHT_INCHES = 11
const DPI = 96

// Full size (for print)
const PAGE_WIDTH_FULL = PAGE_WIDTH_INCHES * DPI   // 816px
const PAGE_HEIGHT_FULL = PAGE_HEIGHT_INCHES * DPI // 1056px

// Margins (1 inch = 96px)
const PAGE_MARGIN = 96

// Content area
const CONTENT_WIDTH = PAGE_WIDTH_FULL - (PAGE_MARGIN * 2)   // 624px
const CONTENT_HEIGHT = PAGE_HEIGHT_FULL - (PAGE_MARGIN * 2) // 864px

// Screen scale (pages would be too large at 100%)
const SCALE = 0.8

// Scaled dimensions for screen display
const PAGE_WIDTH = PAGE_WIDTH_FULL * SCALE     // 652.8px
const PAGE_HEIGHT = PAGE_HEIGHT_FULL * SCALE   // 844.8px
const MARGIN_SCALED = PAGE_MARGIN * SCALE      // 76.8px

// Gap between pages
const PAGE_GAP = 24

// ============================================================================
// TIPTAP EXTENSIONS
// ============================================================================

// Tracked Claim Mark - for verified/pending/stale claims
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
      status: {
        default: 'pending',
        parseHTML: element => element.getAttribute('data-status'),
        renderHTML: attributes => {
          return { 'data-status': attributes.status || 'pending' }
        },
      },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-claim-id]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { class: 'tracked-claim' }), 0]
  },
})

// Page Break Node - forces content to next page
const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,
  draggable: false,
  selectable: true,

  parseHTML() {
    return [{ tag: 'div[data-page-break]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 
      'data-page-break': 'true',
      'class': 'page-break-node',
    })]
  },

  addCommands() {
    return {
      setPageBreak: () => ({ commands }) => {
        return commands.insertContent({ type: this.name })
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () => this.editor.commands.setPageBreak(),
    }
  },
})

// ============================================================================
// TYPES
// ============================================================================

interface PagedEditorProps {
  content?: string | object
  darkMode?: boolean
  onTrackSelection?: (text: string, from: number, to: number, context: string) => void
  onAddToChat?: (text: string, from: number, to: number, context: string) => void
  onClaimClick?: (claimId: string) => void
  onClaimHover?: (claimId: string | null) => void
  onContentChange?: (content: any) => void
  onWordCountChange?: (count: number) => void
}

export interface PagedEditorRef {
  applyTrackedMark: (
    from: number, 
    to: number, 
    claimId: string, 
    config?: { source?: string; cadence?: string; category?: string; status?: string }
  ) => void
  getContent: () => any
  getHTML: () => string
  getText: () => string
  insertPageBreak: () => void
  getPageCount: () => number
  getWordCount: () => number
  focus: () => void
}

// ============================================================================
// COMPONENT
// ============================================================================

const PagedEditor = forwardRef<PagedEditorRef, PagedEditorProps>(({
  content,
  darkMode = false,
  onTrackSelection,
  onAddToChat,
  onClaimClick,
  onClaimHover,
  onContentChange,
  onWordCountChange,
}, ref) => {
  // State
  const [pageCount, setPageCount] = useState(1)
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

  // Refs
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const editorWrapperRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  // Initialize TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
      TrackedClaim,
      PageBreak,
    ],
    content: content || '<p></p>',
    editorProps: {
      attributes: {
        class: 'paged-editor-content',
        spellcheck: 'true',
      },
      handleClick: (view, pos, event) => {
        const target = event.target as HTMLElement
        
        // Handle click on tracked claim
        if (target.classList.contains('tracked-claim')) {
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
          if (target.classList.contains('tracked-claim')) {
            const rect = target.getBoundingClientRect()
            const claimId = target.getAttribute('data-claim-id') || ''
            const source = target.getAttribute('data-source') || ''
            const cadence = target.getAttribute('data-cadence') || ''
            const text = target.textContent || ''
            
            setTooltip({
              visible: true,
              x: rect.left + rect.width / 2,
              y: rect.top - 8,
              claimId,
              text,
              source,
              cadence,
            })
            onClaimHover?.(claimId)
          }
          return false
        },
        mouseout: (view, event) => {
          const target = event.target as HTMLElement
          if (target.classList.contains('tracked-claim')) {
            setTooltip(null)
            onClaimHover?.(null)
          }
          return false
        },
      },
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection
      const selectedText = editor.state.doc.textBetween(from, to, ' ')
      
      if (selectedText.trim().length > 0) {
        const { view } = editor
        const startCoords = view.coordsAtPos(from)
        const endCoords = view.coordsAtPos(to)
        
        setSelectionPos({
          top: startCoords.top - 50,
          left: (startCoords.left + endCoords.left) / 2,
        })
        setHasSelection(true)
      } else {
        setHasSelection(false)
      }
    },
    onUpdate: ({ editor }) => {
      // Notify parent of content change
      onContentChange?.(editor.getJSON())
      
      // Update word count
      const text = editor.state.doc.textContent
      const words = text.trim() ? text.trim().split(/\s+/).length : 0
      onWordCountChange?.(words)
      
      // Recalculate page count
      requestAnimationFrame(calculatePageCount)
    },
    onBlur: ({ event }) => {
      // Delay hiding toolbar to allow clicking toolbar buttons
      setTimeout(() => {
        if (!toolbarRef.current?.contains(document.activeElement)) {
          setHasSelection(false)
        }
      }, 150)
    },
  })

  // Calculate number of pages based on content height
  const calculatePageCount = useCallback(() => {
    if (!editorWrapperRef.current) return
    
    const contentHeight = editorWrapperRef.current.scrollHeight
    // Each page has CONTENT_HEIGHT of usable space (scaled)
    const scaledContentHeight = CONTENT_HEIGHT * SCALE
    const pages = Math.max(1, Math.ceil(contentHeight / scaledContentHeight))
    
    if (pages !== pageCount) {
      setPageCount(pages)
    }
  }, [pageCount])

  // Set up ResizeObserver to recalculate pages on content resize
  useEffect(() => {
    if (!editorWrapperRef.current) return
    
    resizeObserverRef.current = new ResizeObserver(() => {
      calculatePageCount()
    })
    
    resizeObserverRef.current.observe(editorWrapperRef.current)
    
    return () => {
      resizeObserverRef.current?.disconnect()
    }
  }, [calculatePageCount])

  // Initial page count calculation
  useEffect(() => {
    const timer = setTimeout(calculatePageCount, 100)
    return () => clearTimeout(timer)
  }, [calculatePageCount, content])

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    applyTrackedMark: (from, to, claimId, config) => {
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
          status: config?.status || 'pending',
        })
        .run()
      
      setHasSelection(false)
    },
    
    getContent: () => editor?.getJSON() || null,
    
    getHTML: () => editor?.getHTML() || '',
    
    getText: () => editor?.state.doc.textContent || '',
    
    insertPageBreak: () => {
      if (!editor) return
      editor
        .chain()
        .focus()
        .setPageBreak()
        .insertContent('<p></p>')
        .focus()
        .run()
    },
    
    getPageCount: () => pageCount,
    
    getWordCount: () => {
      if (!editor) return 0
      const text = editor.state.doc.textContent
      return text.trim() ? text.trim().split(/\s+/).length : 0
    },
    
    focus: () => {
      editor?.commands.focus()
    },
  }))

  // ========================================
  // HANDLERS
  // ========================================

  const handleTrack = useCallback(() => {
    if (!editor) return
    
    const { from, to } = editor.state.selection
    const text = editor.state.doc.textBetween(from, to, ' ')
    
    if (text.trim()) {
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

  const handleAddPage = useCallback(() => {
    if (!editor) return
    
    // Move cursor to end and insert page break
    const endPos = editor.state.doc.content.size
    editor
      .chain()
      .focus()
      .setTextSelection(endPos)
      .setPageBreak()
      .insertContent('<p></p>')
      .focus()
      .run()
  }, [editor])

  // ========================================
  // RENDER
  // ========================================

  if (!editor) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-400">Loading editor...</div>
      </div>
    )
  }

  // Generate array of page numbers for rendering backgrounds
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1)
  
  // Total height needed for all pages
  const totalPagesHeight = pageCount * (PAGE_HEIGHT + PAGE_GAP) + PAGE_GAP

  return (
    <>
      {/* ============================================ */}
      {/* STYLES */}
      {/* ============================================ */}
      <style jsx global>{`
        /* ------------------------------------------ */
        /* Scroll Container */
        /* ------------------------------------------ */
        .paged-editor-scroll {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          position: relative;
          background: ${darkMode ? '#1a1a1a' : '#525659'};
        }

        /* ------------------------------------------ */
        /* Canvas - holds pages and content */
        /* ------------------------------------------ */
        .paged-editor-canvas {
          position: relative;
          min-height: ${totalPagesHeight}px;
          padding: ${PAGE_GAP}px 0;
        }

        /* ------------------------------------------ */
        /* Page Backgrounds */
        /* ------------------------------------------ */
        .page-backgrounds {
          position: absolute;
          top: ${PAGE_GAP}px;
          left: 50%;
          transform: translateX(-50%);
          pointer-events: none;
        }

        .page-bg {
          width: ${PAGE_WIDTH}px;
          height: ${PAGE_HEIGHT}px;
          background: ${darkMode ? '#2a2a2a' : 'white'};
          box-shadow: ${darkMode 
            ? '0 2px 8px rgba(0, 0, 0, 0.5)' 
            : '0 1px 4px rgba(0, 0, 0, 0.1), 0 0 1px rgba(0, 0, 0, 0.1)'};
          margin-bottom: ${PAGE_GAP}px;
          border-radius: 2px;
          position: relative;
        }

        .page-bg:last-child {
          margin-bottom: 0;
        }

        .page-number {
          position: absolute;
          bottom: ${12 * SCALE}px;
          left: 50%;
          transform: translateX(-50%);
          font-size: ${11 * SCALE}px;
          color: ${darkMode ? '#6b7280' : '#9ca3af'};
          font-family: system-ui, -apple-system, sans-serif;
        }

        /* ------------------------------------------ */
        /* Editor Wrapper */
        /* ------------------------------------------ */
        .editor-wrapper {
          position: relative;
          width: ${PAGE_WIDTH}px;
          margin: 0 auto;
          padding: ${MARGIN_SCALED}px;
          box-sizing: border-box;
          z-index: 1;
        }

        /* ------------------------------------------ */
        /* Editor Content Area */
        /* ------------------------------------------ */
        .paged-editor-content {
          outline: none;
          min-height: ${CONTENT_HEIGHT * SCALE}px;
          width: ${CONTENT_WIDTH * SCALE}px;
          font-family: 'Georgia', 'Times New Roman', serif;
          caret-color: ${darkMode ? '#60a5fa' : '#3b82f6'};
        }

        .paged-editor-content:focus {
          outline: none;
        }

        /* ------------------------------------------ */
        /* Typography */
        /* ------------------------------------------ */
        .paged-editor-content h1 {
          font-size: ${24 * SCALE}px;
          font-weight: 700;
          color: ${darkMode ? '#f3f4f6' : '#111827'};
          margin: 0 0 ${16 * SCALE}px 0;
          line-height: 1.2;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .paged-editor-content h2 {
          font-size: ${18 * SCALE}px;
          font-weight: 600;
          color: ${darkMode ? '#e5e7eb' : '#1f2937'};
          margin: ${24 * SCALE}px 0 ${12 * SCALE}px 0;
          line-height: 1.3;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .paged-editor-content h3 {
          font-size: ${15 * SCALE}px;
          font-weight: 600;
          color: ${darkMode ? '#d1d5db' : '#374151'};
          margin: ${20 * SCALE}px 0 ${8 * SCALE}px 0;
          line-height: 1.4;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .paged-editor-content p {
          font-size: ${13 * SCALE}px;
          color: ${darkMode ? '#d1d5db' : '#374151'};
          line-height: 1.7;
          margin: 0 0 ${12 * SCALE}px 0;
        }

        .paged-editor-content ul,
        .paged-editor-content ol {
          margin: 0 0 ${12 * SCALE}px 0;
          padding-left: ${24 * SCALE}px;
        }

        .paged-editor-content li {
          font-size: ${13 * SCALE}px;
          color: ${darkMode ? '#d1d5db' : '#374151'};
          line-height: 1.6;
          margin-bottom: ${4 * SCALE}px;
        }

        .paged-editor-content li p {
          margin: 0;
        }

        .paged-editor-content blockquote {
          border-left: ${3 * SCALE}px solid ${darkMode ? '#4b5563' : '#d1d5db'};
          margin: ${16 * SCALE}px 0;
          padding-left: ${16 * SCALE}px;
          color: ${darkMode ? '#9ca3af' : '#6b7280'};
          font-style: italic;
        }

        .paged-editor-content code {
          background: ${darkMode ? '#374151' : '#f3f4f6'};
          color: ${darkMode ? '#fbbf24' : '#dc2626'};
          padding: ${2 * SCALE}px ${4 * SCALE}px;
          border-radius: ${3 * SCALE}px;
          font-size: ${12 * SCALE}px;
          font-family: 'SF Mono', Monaco, 'Courier New', monospace;
        }

        .paged-editor-content pre {
          background: ${darkMode ? '#1f2937' : '#1f2937'};
          color: #e5e7eb;
          padding: ${16 * SCALE}px;
          border-radius: ${6 * SCALE}px;
          overflow-x: auto;
          margin: ${16 * SCALE}px 0;
        }

        .paged-editor-content pre code {
          background: none;
          color: inherit;
          padding: 0;
        }

        .paged-editor-content hr {
          border: none;
          border-top: 1px solid ${darkMode ? '#374151' : '#e5e7eb'};
          margin: ${24 * SCALE}px 0;
        }

        .paged-editor-content .editor-link {
          color: ${darkMode ? '#60a5fa' : '#2563eb'};
          text-decoration: underline;
          cursor: pointer;
        }

        .paged-editor-content .editor-link:hover {
          color: ${darkMode ? '#93c5fd' : '#1d4ed8'};
        }

        /* ------------------------------------------ */
        /* Placeholder */
        /* ------------------------------------------ */
        .paged-editor-content p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: ${darkMode ? '#6b7280' : '#9ca3af'};
          float: left;
          height: 0;
          pointer-events: none;
        }

        /* ------------------------------------------ */
        /* Tracked Claims */
        /* ------------------------------------------ */
        .tracked-claim {
          background: ${darkMode ? 'rgba(34, 197, 94, 0.15)' : '#f0fdf4'};
          border: 1px solid ${darkMode ? 'rgba(34, 197, 94, 0.3)' : '#bbf7d0'};
          border-radius: ${3 * SCALE}px;
          padding: 0 ${4 * SCALE}px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .tracked-claim:hover {
          background: ${darkMode ? 'rgba(34, 197, 94, 0.25)' : '#dcfce7'};
          border-color: ${darkMode ? 'rgba(34, 197, 94, 0.5)' : '#86efac'};
        }

        .tracked-claim[data-status="verified"] {
          background: ${darkMode ? 'rgba(34, 197, 94, 0.15)' : '#f0fdf4'};
          border-color: ${darkMode ? 'rgba(34, 197, 94, 0.3)' : '#86efac'};
        }

        .tracked-claim[data-status="pending"] {
          background: ${darkMode ? 'rgba(156, 163, 175, 0.15)' : '#f9fafb'};
          border-color: ${darkMode ? 'rgba(156, 163, 175, 0.3)' : '#d1d5db'};
        }

        .tracked-claim[data-status="stale"] {
          background: ${darkMode ? 'rgba(251, 191, 36, 0.15)' : '#fffbeb'};
          border-color: ${darkMode ? 'rgba(251, 191, 36, 0.3)' : '#fde68a'};
        }

        .tracked-claim[data-status="contradiction"] {
          background: ${darkMode ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2'};
          border-color: ${darkMode ? 'rgba(239, 68, 68, 0.3)' : '#fecaca'};
        }

        /* ------------------------------------------ */
        /* Page Break */
        /* ------------------------------------------ */
        .page-break-node {
          height: ${40 * SCALE}px;
          margin: ${20 * SCALE}px 0;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .page-break-node::before {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          height: 1px;
          background: repeating-linear-gradient(
            90deg,
            ${darkMode ? '#4b5563' : '#d1d5db'} 0px,
            ${darkMode ? '#4b5563' : '#d1d5db'} 4px,
            transparent 4px,
            transparent 8px
          );
        }

        .page-break-node::after {
          content: 'PAGE BREAK';
          position: relative;
          padding: ${4 * SCALE}px ${12 * SCALE}px;
          font-size: ${9 * SCALE}px;
          font-weight: 500;
          letter-spacing: 0.05em;
          color: ${darkMode ? '#6b7280' : '#9ca3af'};
          background: ${darkMode ? '#2a2a2a' : 'white'};
          font-family: system-ui, -apple-system, sans-serif;
        }

        .page-break-node.ProseMirror-selectednode::before {
          background: repeating-linear-gradient(
            90deg,
            #3b82f6 0px,
            #3b82f6 4px,
            transparent 4px,
            transparent 8px
          );
        }

        .page-break-node.ProseMirror-selectednode::after {
          color: #3b82f6;
        }

        /* ------------------------------------------ */
        /* Add Page Button */
        /* ------------------------------------------ */
        .add-page-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${PAGE_WIDTH}px;
          height: 48px;
          margin: ${PAGE_GAP}px auto;
          border: 2px dashed ${darkMode ? '#4b5563' : '#9ca3af'};
          border-radius: 8px;
          color: ${darkMode ? '#6b7280' : '#9ca3af'};
          background: transparent;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .add-page-button:hover {
          border-color: ${darkMode ? '#6b7280' : '#6b7280'};
          color: ${darkMode ? '#9ca3af' : '#6b7280'};
          background: ${darkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'};
        }

        /* ------------------------------------------ */
        /* Selection */
        /* ------------------------------------------ */
        .paged-editor-content ::selection {
          background: ${darkMode ? 'rgba(96, 165, 250, 0.4)' : 'rgba(59, 130, 246, 0.3)'};
        }

        /* ------------------------------------------ */
        /* Print Styles */
        /* ------------------------------------------ */
        @media print {
          .paged-editor-scroll {
            background: white !important;
            overflow: visible !important;
          }

          .page-backgrounds {
            display: none;
          }

          .add-page-button {
            display: none;
          }

          .editor-wrapper {
            width: ${PAGE_WIDTH_FULL}px !important;
            padding: ${PAGE_MARGIN}px !important;
          }

          .paged-editor-content {
            width: ${CONTENT_WIDTH}px !important;
          }

          .page-break-node {
            height: 0 !important;
            margin: 0 !important;
            page-break-after: always;
            break-after: page;
          }

          .page-break-node::before,
          .page-break-node::after {
            display: none;
          }
        }
      `}</style>

      {/* ============================================ */}
      {/* MAIN CONTAINER */}
      {/* ============================================ */}
      <div className="paged-editor-scroll" ref={scrollContainerRef}>
        <div className="paged-editor-canvas">
          {/* Page backgrounds - purely visual */}
          <div className="page-backgrounds">
            {pages.map((pageNum) => (
              <div key={pageNum} className="page-bg">
                <div className="page-number">{pageNum}</div>
              </div>
            ))}
          </div>

          {/* Editor - single instance, editable everywhere */}
          <div className="editor-wrapper" ref={editorWrapperRef}>
            <EditorContent editor={editor} />
          </div>

          {/* Add page button */}
          <button className="add-page-button" onClick={handleAddPage} type="button">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ============================================ */}
      {/* FLOATING TOOLBAR */}
      {/* ============================================ */}
      {hasSelection && selectionPos && (
        <div
          ref={toolbarRef}
          className="fixed z-50 flex items-center gap-0.5 px-1.5 py-1.5 rounded-lg border border-gray-200"
          style={{
            top: selectionPos.top,
            left: selectionPos.left,
            transform: 'translateX(-50%)',
            backgroundColor: '#FBF9F7',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), 0 0 1px rgba(0, 0, 0, 0.1)',
          }}
        >
          {isLinkInputOpen ? (
            <div className="flex items-center gap-1 px-2">
              <input
                type="url"
                placeholder="Enter URL..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSetLink()
                  if (e.key === 'Escape') setIsLinkInputOpen(false)
                }}
                className="bg-transparent text-gray-900 text-sm outline-none w-48 placeholder-gray-400"
                autoFocus
              />
              <button
                onClick={handleSetLink}
                className="p-1 text-gray-500 hover:text-gray-900 cursor-pointer"
                type="button"
              >
                <LinkIcon className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setIsLinkInputOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-900 cursor-pointer"
                type="button"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <>
              {/* Text style dropdown */}
              <button
                className="px-2 py-1.5 text-sm text-gray-500 hover:text-gray-900 cursor-pointer flex items-center gap-1 rounded hover:bg-white/50"
                type="button"
              >
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
                  editor.isActive('bold')
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                }`}
                type="button"
              >
                <Bold className="w-4 h-4" strokeWidth={2} />
              </button>

              {/* Italic */}
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded cursor-pointer transition-colors ${
                  editor.isActive('italic')
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                }`}
                type="button"
              >
                <Italic className="w-4 h-4" strokeWidth={2} />
              </button>

              {/* Strikethrough */}
              <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`p-1.5 rounded cursor-pointer transition-colors ${
                  editor.isActive('strike')
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                }`}
                type="button"
              >
                <Strikethrough className="w-4 h-4" strokeWidth={2} />
              </button>

              {/* Underline */}
              <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-1.5 rounded cursor-pointer transition-colors ${
                  editor.isActive('underline')
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                }`}
                type="button"
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
                  editor.isActive('link')
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                }`}
                type="button"
              >
                <LinkIcon className="w-4 h-4" strokeWidth={2} />
              </button>

              {/* Blockquote */}
              <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-1.5 rounded cursor-pointer transition-colors ${
                  editor.isActive('blockquote')
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                }`}
                type="button"
              >
                <Quote className="w-4 h-4" strokeWidth={2} />
              </button>

              {/* Code */}
              <button
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={`p-1.5 rounded cursor-pointer transition-colors ${
                  editor.isActive('code')
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                }`}
                type="button"
              >
                <Code className="w-4 h-4" strokeWidth={2} />
              </button>

              <div className="w-px h-5 bg-gray-300 mx-1" />

              {/* Add to Chat */}
              <button
                onClick={handleAddToChat}
                className="px-2.5 py-1.5 rounded cursor-pointer transition-colors text-gray-600 hover:text-gray-900 hover:bg-white/50 text-sm font-medium"
                type="button"
              >
                Add to Chat
              </button>

              {/* Track */}
              <button
                onClick={handleTrack}
                className="px-2.5 py-1.5 rounded cursor-pointer transition-colors bg-gray-900 text-white hover:bg-gray-800 text-sm font-medium"
                type="button"
              >
                Track
              </button>
            </>
          )}
        </div>
      )}

      {/* ============================================ */}
      {/* CLAIM TOOLTIP */}
      {/* ============================================ */}
      {tooltip?.visible && (
        <div
          className="fixed z-[100] pointer-events-none"
          style={{
            top: tooltip.y,
            left: tooltip.x,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div
            className="rounded-lg border border-gray-200 p-3 min-w-[200px] max-w-[300px]"
            style={{
              backgroundColor: '#FBF9F7',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="text-xs text-gray-400 font-mono mb-1">{tooltip.claimId}</div>
            <p className="text-sm text-gray-900 mb-3 line-clamp-2">{tooltip.text}</p>
            <div className="border-t border-gray-200 pt-2 flex items-center gap-3">
              {tooltip.source && (
                <span className="text-xs text-gray-600 capitalize">{tooltip.source}</span>
              )}
              {tooltip.cadence && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-400" strokeWidth={2} />
                  <span className="text-xs text-gray-500 capitalize">{tooltip.cadence}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
})

PagedEditor.displayName = 'PagedEditor'

export default PagedEditor