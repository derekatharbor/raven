// src/components/workspace/PagedEditor.tsx

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
} from 'react'

// ============================================================
// CONSTANTS - Page dimensions (US Letter)
// ============================================================
const PAGE_WIDTH_IN = 8.5
const PAGE_HEIGHT_IN = 11
const DPI = 96
const PAGE_WIDTH = PAGE_WIDTH_IN * DPI  // 816px
const PAGE_HEIGHT = PAGE_HEIGHT_IN * DPI // 1056px
const PAGE_MARGIN = DPI // 1 inch margins
const CONTENT_WIDTH = PAGE_WIDTH - (PAGE_MARGIN * 2)  // 624px
const CONTENT_HEIGHT = PAGE_HEIGHT - (PAGE_MARGIN * 2) // 864px

// Scale for screen display
const SCALE = 0.75
const SCALED_WIDTH = PAGE_WIDTH * SCALE   // 612px
const SCALED_HEIGHT = PAGE_HEIGHT * SCALE // 792px

// ============================================================
// EXTENSIONS
// ============================================================

const TrackedClaim = Mark.create({
  name: 'trackedClaim',
  addAttributes() {
    return {
      claimId: {
        default: null,
        parseHTML: el => el.getAttribute('data-claim-id'),
        renderHTML: attrs => attrs.claimId ? { 'data-claim-id': attrs.claimId } : {},
      },
      source: {
        default: null,
        parseHTML: el => el.getAttribute('data-source'),
        renderHTML: attrs => attrs.source ? { 'data-source': attrs.source } : {},
      },
      cadence: {
        default: null,
        parseHTML: el => el.getAttribute('data-cadence'),
        renderHTML: attrs => attrs.cadence ? { 'data-cadence': attrs.cadence } : {},
      },
      category: {
        default: null,
        parseHTML: el => el.getAttribute('data-category'),
        renderHTML: attrs => attrs.category ? { 'data-category': attrs.category } : {},
      },
    }
  },
  parseHTML() { return [{ tag: 'span[data-claim-id]' }] },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { class: 'tracked-claim' }), 0]
  },
})

const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,
  parseHTML() { return [{ tag: 'div[data-page-break]' }] },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-page-break': '', class: 'manual-page-break' })]
  },
  addCommands() {
    return {
      setPageBreak: () => ({ commands }) => commands.insertContent({ type: 'pageBreak' }),
    }
  },
  addKeyboardShortcuts() {
    return { 'Mod-Enter': () => this.editor.commands.setPageBreak() }
  },
})

// ============================================================
// TYPES
// ============================================================

interface PagedEditorProps {
  content?: string | object
  darkMode?: boolean
  onTrackSelection?: (text: string, from: number, to: number, context: string) => void
  onAddToChat?: (text: string, from: number, to: number, context: string) => void
  onClaimClick?: (claimId: string) => void
  onClaimHover?: (claimId: string | null) => void
  onContentChange?: (content: any) => void
}

export interface PagedEditorRef {
  applyTrackedMark: (from: number, to: number, claimId: string, config?: { source?: string; cadence?: string; category?: string }) => void
  getContent: () => any
  insertPageBreak: () => void
  getPageCount: () => number
}

// ============================================================
// COMPONENT
// ============================================================

const PagedEditor = forwardRef<PagedEditorRef, PagedEditorProps>(({ 
  content, 
  darkMode = false,
  onTrackSelection, 
  onAddToChat, 
  onClaimClick, 
  onClaimHover, 
  onContentChange 
}, ref) => {
  const [pageCount, setPageCount] = useState(1)
  const [isLinkInputOpen, setIsLinkInputOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [selectionPos, setSelectionPos] = useState<{ top: number; left: number } | null>(null)
  const [hasSelection, setHasSelection] = useState(false)
  const [tooltip, setTooltip] = useState<{
    visible: boolean; x: number; y: number
    claimId: string; text: string; source: string; cadence: string
  } | null>(null)
  
  const toolbarRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'editor-link' },
      }),
      Placeholder.configure({ placeholder: 'Start writing...' }),
      TrackedClaim,
      PageBreak,
    ],
    content: content || '<p></p>',
    editorProps: {
      attributes: { class: 'page-editor-content' },
      handleClick: (view, pos, event) => {
        const target = event.target as HTMLElement
        if (target.classList.contains('tracked-claim')) {
          const claimId = target.getAttribute('data-claim-id')
          if (claimId) { onClaimClick?.(claimId); return true }
        }
        return false
      },
      handleDOMEvents: {
        mouseover: (view, event) => {
          const target = event.target as HTMLElement
          if (target.classList.contains('tracked-claim')) {
            const rect = target.getBoundingClientRect()
            setTooltip({
              visible: true,
              x: rect.left + rect.width / 2,
              y: rect.top - 8,
              claimId: target.getAttribute('data-claim-id') || '',
              text: target.textContent || '',
              source: target.getAttribute('data-source') || '',
              cadence: target.getAttribute('data-cadence') || '',
            })
            onClaimHover?.(target.getAttribute('data-claim-id') || '')
          }
          return false
        },
        mouseout: (view, event) => {
          if ((event.target as HTMLElement).classList.contains('tracked-claim')) {
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
        setSelectionPos({ top: start.top - 50, left: (start.left + end.left) / 2 })
        setHasSelection(true)
      } else {
        setHasSelection(false)
      }
    },
    onUpdate: ({ editor }) => {
      onContentChange?.(editor.getJSON())
      requestAnimationFrame(calculatePages)
    },
    onBlur: () => {
      setTimeout(() => {
        if (!toolbarRef.current?.contains(document.activeElement)) setHasSelection(false)
      }, 150)
    },
  })

  // Calculate pages based on content height
  const calculatePages = useCallback(() => {
    if (!measureRef.current) return
    const h = measureRef.current.scrollHeight
    const pages = Math.max(1, Math.ceil(h / CONTENT_HEIGHT))
    setPageCount(pages)
  }, [])

  useEffect(() => {
    const t = setTimeout(calculatePages, 50)
    return () => clearTimeout(t)
  }, [calculatePages, content])

  // Expose ref methods
  useImperativeHandle(ref, () => ({
    applyTrackedMark: (from, to, claimId, config) => {
      if (!editor) return
      editor.chain().focus().setTextSelection({ from, to })
        .setMark('trackedClaim', { claimId, source: config?.source, cadence: config?.cadence, category: config?.category })
        .run()
      setHasSelection(false)
    },
    getContent: () => editor?.getJSON() || null,
    insertPageBreak: () => {
      editor?.chain().focus().setPageBreak().insertContent('<p></p>').focus().run()
    },
    getPageCount: () => pageCount,
  }))

  // Handlers
  const handleTrack = useCallback(() => {
    if (!editor) return
    const { from, to } = editor.state.selection
    const text = editor.state.doc.textBetween(from, to, ' ')
    if (text.trim()) {
      const docSize = editor.state.doc.content.size
      const context = editor.state.doc.textBetween(Math.max(0, from - 100), Math.min(docSize, to + 100), ' ')
      onTrackSelection?.(text, from, to, context)
    }
  }, [editor, onTrackSelection])

  const handleAddToChat = useCallback(() => {
    if (!editor) return
    const { from, to } = editor.state.selection
    const text = editor.state.doc.textBetween(from, to, ' ')
    if (text.trim()) {
      const docSize = editor.state.doc.content.size
      const context = editor.state.doc.textBetween(Math.max(0, from - 100), Math.min(docSize, to + 100), ' ')
      onAddToChat?.(text, from, to, context)
    }
  }, [editor, onAddToChat])

  const handleSetLink = useCallback(() => {
    if (!editor || !linkUrl) return
    editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
    setLinkUrl('')
    setIsLinkInputOpen(false)
  }, [editor, linkUrl])

  const handleRemoveLink = useCallback(() => { editor?.chain().focus().unsetLink().run() }, [editor])

  const handleAddPage = useCallback(() => {
    if (!editor) return
    const endPos = editor.state.doc.content.size
    editor.chain().focus().setTextSelection(endPos).setPageBreak().insertContent('<p></p>').focus().run()
  }, [editor])

  if (!editor) return null

  return (
    <div className={`paged-editor ${darkMode ? 'dark-mode' : ''}`}>
      <style jsx global>{`
        .paged-editor {
          flex: 1;
          overflow: auto;
          background: #525659;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 32px 24px;
          gap: 24px;
        }
        
        .paged-editor.dark-mode {
          background: #1a1a1a;
        }
        
        /* Individual page */
        .doc-page {
          width: ${SCALED_WIDTH}px;
          height: ${SCALED_HEIGHT}px;
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }
        
        .paged-editor.dark-mode .doc-page {
          background: #2a2a2a;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        }
        
        /* Content wrapper - scales the content */
        .page-scale-wrapper {
          width: ${PAGE_WIDTH}px;
          height: ${PAGE_HEIGHT}px;
          transform: scale(${SCALE});
          transform-origin: top left;
          overflow: hidden;
        }
        
        /* Content area with margins */
        .page-content-area {
          width: ${PAGE_WIDTH}px;
          padding: ${PAGE_MARGIN}px;
          box-sizing: border-box;
        }
        
        /* Editor content */
        .page-editor-content {
          width: ${CONTENT_WIDTH}px;
          outline: none;
          min-height: ${CONTENT_HEIGHT}px;
        }
        
        /* Typography */
        .page-editor-content h1 {
          font-size: 28px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 16px 0;
          line-height: 1.2;
        }
        
        .page-editor-content h2 {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin: 24px 0 12px 0;
          line-height: 1.3;
        }
        
        .page-editor-content h3 {
          font-size: 16px;
          font-weight: 600;
          color: #374151;
          margin: 20px 0 8px 0;
        }
        
        .page-editor-content p {
          font-size: 14px;
          color: #374151;
          line-height: 1.7;
          margin: 0 0 12px 0;
        }
        
        .page-editor-content ul,
        .page-editor-content ol {
          margin: 0 0 12px 0;
          padding-left: 24px;
          font-size: 14px;
          color: #374151;
        }
        
        .page-editor-content li {
          line-height: 1.6;
          margin-bottom: 4px;
        }
        
        .page-editor-content blockquote {
          border-left: 3px solid #d1d5db;
          margin: 16px 0;
          padding-left: 16px;
          color: #6b7280;
          font-style: italic;
        }
        
        .page-editor-content code {
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 13px;
          font-family: 'SF Mono', Monaco, monospace;
        }
        
        .page-editor-content .editor-link {
          color: #2563eb;
          text-decoration: underline;
          cursor: pointer;
        }
        
        /* Dark mode typography */
        .paged-editor.dark-mode .page-editor-content h1 { color: #f3f4f6; }
        .paged-editor.dark-mode .page-editor-content h2 { color: #e5e7eb; }
        .paged-editor.dark-mode .page-editor-content h3 { color: #d1d5db; }
        .paged-editor.dark-mode .page-editor-content p,
        .paged-editor.dark-mode .page-editor-content ul,
        .paged-editor.dark-mode .page-editor-content ol,
        .paged-editor.dark-mode .page-editor-content li { color: #d1d5db; }
        .paged-editor.dark-mode .page-editor-content blockquote {
          border-left-color: #4b5563;
          color: #9ca3af;
        }
        .paged-editor.dark-mode .page-editor-content code {
          background: #374151;
          color: #fbbf24;
        }
        .paged-editor.dark-mode .page-editor-content .editor-link {
          color: #60a5fa;
        }
        
        /* Placeholder */
        .page-editor-content p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #9ca3af;
          float: left;
          height: 0;
          pointer-events: none;
        }
        
        .paged-editor.dark-mode .page-editor-content p.is-editor-empty:first-child::before {
          color: #6b7280;
        }
        
        /* Tracked claims */
        .tracked-claim {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 3px;
          padding: 0 4px;
          cursor: pointer;
        }
        
        .tracked-claim:hover {
          background: #dcfce7;
          border-color: #86efac;
        }
        
        .paged-editor.dark-mode .tracked-claim {
          background: rgba(34, 197, 94, 0.15);
          border-color: rgba(34, 197, 94, 0.3);
        }
        
        /* Page break */
        .manual-page-break {
          height: 0;
          page-break-after: always;
          break-after: page;
        }
        
        /* Page number */
        .page-number {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 11px;
          color: #9ca3af;
        }
        
        .paged-editor.dark-mode .page-number {
          color: #6b7280;
        }
        
        /* Add page button */
        .add-page-btn {
          width: ${SCALED_WIDTH}px;
          height: 48px;
          border: 2px dashed #6b7280;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
          background: transparent;
          flex-shrink: 0;
        }
        
        .add-page-btn:hover {
          border-color: #9ca3af;
          color: #9ca3af;
          background: rgba(255,255,255,0.03);
        }
        
        /* Print */
        @media print {
          .paged-editor { background: white; padding: 0; gap: 0; }
          .doc-page { box-shadow: none; page-break-after: always; }
          .doc-page:last-of-type { page-break-after: auto; }
          .add-page-btn { display: none; }
        }
      `}</style>

      {/* Main page with editor */}
      <div className="doc-page">
        <div className="page-scale-wrapper">
          <div className="page-content-area" ref={measureRef}>
            <EditorContent editor={editor} />
          </div>
        </div>
        <div className="page-number">1</div>
      </div>
      
      {/* Additional pages (overflow content shown via CSS clip) */}
      {Array.from({ length: pageCount - 1 }, (_, i) => (
        <div key={i + 2} className="doc-page">
          <div className="page-scale-wrapper">
            <div 
              className="page-content-area"
              style={{ marginTop: -(CONTENT_HEIGHT * (i + 1)) }}
              dangerouslySetInnerHTML={{ __html: editor?.getHTML() || '' }}
            />
          </div>
          <div className="page-number">{i + 2}</div>
        </div>
      ))}
      
      {/* Add page button */}
      <button className="add-page-btn" onClick={handleAddPage}>
        <Plus className="w-5 h-5" />
      </button>

      {/* Floating Toolbar */}
      {hasSelection && selectionPos && (
        <div 
          ref={toolbarRef}
          className="fixed z-50 flex items-center gap-0.5 px-1.5 py-1.5 rounded-lg border border-gray-200"
          style={{
            top: selectionPos.top,
            left: selectionPos.left,
            transform: 'translateX(-50%)',
            backgroundColor: '#FBF9F7',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
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
              <button onClick={handleSetLink} className="p-1 text-gray-500 hover:text-gray-900 cursor-pointer">
                <LinkIcon className="w-4 h-4" />
              </button>
              <button onClick={() => setIsLinkInputOpen(false)} className="p-1 text-gray-500 hover:text-gray-900 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <button className="px-2 py-1.5 text-sm text-gray-500 hover:text-gray-900 cursor-pointer flex items-center gap-1 rounded hover:bg-white/50">
                Aa
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="w-px h-5 bg-gray-300 mx-1" />
              <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1.5 rounded cursor-pointer ${editor.isActive('bold') ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}>
                <Bold className="w-4 h-4" />
              </button>
              <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1.5 rounded cursor-pointer ${editor.isActive('italic') ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}>
                <Italic className="w-4 h-4" />
              </button>
              <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`p-1.5 rounded cursor-pointer ${editor.isActive('strike') ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}>
                <Strikethrough className="w-4 h-4" />
              </button>
              <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-1.5 rounded cursor-pointer ${editor.isActive('underline') ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}>
                <UnderlineIcon className="w-4 h-4" />
              </button>
              <button onClick={() => editor.isActive('link') ? handleRemoveLink() : setIsLinkInputOpen(true)} className={`p-1.5 rounded cursor-pointer ${editor.isActive('link') ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}>
                <LinkIcon className="w-4 h-4" />
              </button>
              <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-1.5 rounded cursor-pointer ${editor.isActive('blockquote') ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}>
                <Quote className="w-4 h-4" />
              </button>
              <button onClick={() => editor.chain().focus().toggleCode().run()} className={`p-1.5 rounded cursor-pointer ${editor.isActive('code') ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}>
                <Code className="w-4 h-4" />
              </button>
              <div className="w-px h-5 bg-gray-300 mx-1" />
              <button onClick={handleAddToChat} className="px-2.5 py-1.5 rounded cursor-pointer text-gray-600 hover:text-gray-900 hover:bg-white/50 text-sm font-medium">
                Add to Chat
              </button>
              <button onClick={handleTrack} className="px-2.5 py-1.5 rounded cursor-pointer bg-gray-900 text-white hover:bg-gray-800 text-sm font-medium">
                Track
              </button>
            </>
          )}
        </div>
      )}

      {/* Tooltip */}
      {tooltip?.visible && (
        <div className="fixed z-[100] pointer-events-none" style={{ top: tooltip.y, left: tooltip.x, transform: 'translate(-50%, -100%)' }}>
          <div className="rounded-lg border border-gray-200 p-3 min-w-[200px] max-w-[280px]" style={{ backgroundColor: '#FBF9F7', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div className="text-xs text-gray-400 font-mono mb-1">{tooltip.claimId}</div>
            <p className="text-sm text-gray-900 mb-3 line-clamp-2">{tooltip.text}</p>
            <div className="border-t border-gray-200 pt-2 flex items-center gap-3">
              <span className="text-xs text-gray-600 capitalize">{tooltip.source}</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500 capitalize">{tooltip.cadence}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

PagedEditor.displayName = 'PagedEditor'

export default PagedEditor
