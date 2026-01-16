// src/components/workspace/PagedEditor.tsx
// 
// Multi-page document editor with:
// - Real page dimensions (US Letter)
// - Visual page separation
// - Single editable TipTap instance
// - Content flows across pages naturally
// - Click/edit anywhere
// - Manual page breaks
// - Print support

'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Mark, Node, mergeAttributes } from '@tiptap/core'
import { 
  Bold, Italic, Strikethrough, Underline as UnderlineIcon, 
  Link as LinkIcon, Quote, Code, X, Clock, Plus 
} from 'lucide-react'
import { 
  useState, useCallback, useRef, forwardRef, 
  useImperativeHandle, useEffect 
} from 'react'

// ============================================================================
// CONSTANTS
// ============================================================================

// US Letter at 96 DPI, scaled to 80% for screen
const SCALE = 0.8
const PAGE_WIDTH = Math.round(816 * SCALE)   // 653px
const PAGE_HEIGHT = Math.round(1056 * SCALE) // 845px  
const PAGE_MARGIN = Math.round(96 * SCALE)   // 77px
const CONTENT_WIDTH = PAGE_WIDTH - (PAGE_MARGIN * 2)  // 499px
const CONTENT_HEIGHT = PAGE_HEIGHT - (PAGE_MARGIN * 2) // 691px
const PAGE_GAP = 24

// ============================================================================
// EXTENSIONS
// ============================================================================

const TrackedClaim = Mark.create({
  name: 'trackedClaim',
  addAttributes() {
    return {
      claimId: { default: null, parseHTML: el => el.getAttribute('data-claim-id'), renderHTML: a => a.claimId ? { 'data-claim-id': a.claimId } : {} },
      source: { default: null, parseHTML: el => el.getAttribute('data-source'), renderHTML: a => a.source ? { 'data-source': a.source } : {} },
      cadence: { default: null, parseHTML: el => el.getAttribute('data-cadence'), renderHTML: a => a.cadence ? { 'data-cadence': a.cadence } : {} },
      category: { default: null, parseHTML: el => el.getAttribute('data-category'), renderHTML: a => a.category ? { 'data-category': a.category } : {} },
      status: { default: 'pending', parseHTML: el => el.getAttribute('data-status'), renderHTML: a => ({ 'data-status': a.status || 'pending' }) },
    }
  },
  parseHTML() { return [{ tag: 'span[data-claim-id]' }] },
  renderHTML({ HTMLAttributes }) { return ['span', mergeAttributes(HTMLAttributes, { class: 'tracked-claim' }), 0] },
})

const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,
  parseHTML() { return [{ tag: 'div[data-page-break]' }] },
  renderHTML({ HTMLAttributes }) { return ['div', mergeAttributes(HTMLAttributes, { 'data-page-break': 'true', class: 'page-break-node' })] },
  addCommands() { return { setPageBreak: () => ({ commands }) => commands.insertContent({ type: this.name }) } },
  addKeyboardShortcuts() { return { 'Mod-Enter': () => this.editor.commands.setPageBreak() } },
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
  applyTrackedMark: (from: number, to: number, claimId: string, config?: { source?: string; cadence?: string; category?: string; status?: string }) => void
  getContent: () => any
  getHTML: () => string
  insertPageBreak: () => void
  getPageCount: () => number
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
  const [pageCount, setPageCount] = useState(1)
  const [isLinkInputOpen, setIsLinkInputOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [selectionPos, setSelectionPos] = useState<{ top: number; left: number } | null>(null)
  const [hasSelection, setHasSelection] = useState(false)
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; claimId: string; text: string; source: string; cadence: string } | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const editorWrapperRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'editor-link' } }),
      Placeholder.configure({ placeholder: 'Start writing...' }),
      TrackedClaim,
      PageBreak,
    ],
    content: content || '<p></p>',
    editorProps: {
      attributes: { class: 'paged-editor-content', spellcheck: 'true' },
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
      const text = editor.state.doc.textContent
      onWordCountChange?.(text.trim() ? text.trim().split(/\s+/).length : 0)
      requestAnimationFrame(calculatePageCount)
    },
    onBlur: () => {
      setTimeout(() => {
        if (!toolbarRef.current?.contains(document.activeElement)) setHasSelection(false)
      }, 150)
    },
  })

  const calculatePageCount = useCallback(() => {
    if (!editorWrapperRef.current) return
    const h = editorWrapperRef.current.scrollHeight
    const pages = Math.max(1, Math.ceil(h / CONTENT_HEIGHT))
    if (pages !== pageCount) setPageCount(pages)
  }, [pageCount])

  useEffect(() => {
    const timer = setTimeout(calculatePageCount, 100)
    return () => clearTimeout(timer)
  }, [calculatePageCount, content])

  useEffect(() => {
    if (!editorWrapperRef.current) return
    const observer = new ResizeObserver(calculatePageCount)
    observer.observe(editorWrapperRef.current)
    return () => observer.disconnect()
  }, [calculatePageCount])

  useImperativeHandle(ref, () => ({
    applyTrackedMark: (from, to, claimId, config) => {
      if (!editor) return
      editor.chain().focus().setTextSelection({ from, to }).setMark('trackedClaim', { claimId, source: config?.source, cadence: config?.cadence, category: config?.category, status: config?.status || 'pending' }).run()
      setHasSelection(false)
    },
    getContent: () => editor?.getJSON() || null,
    getHTML: () => editor?.getHTML() || '',
    insertPageBreak: () => { editor?.chain().focus().setPageBreak().insertContent('<p></p>').focus().run() },
    getPageCount: () => pageCount,
    focus: () => { editor?.commands.focus() },
  }))

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

  if (!editor) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>Loading...</div>

  const totalHeight = pageCount * PAGE_HEIGHT + (pageCount - 1) * PAGE_GAP + PAGE_GAP * 2

  return (
    <>
      {/* Static styles */}
      <style>{`
        .paged-editor-content { outline: none; }
        .paged-editor-content:focus { outline: none; }
        
        .paged-editor-content h1 { font-size: 19px; font-weight: 700; margin: 0 0 13px 0; line-height: 1.2; font-family: system-ui, -apple-system, sans-serif; }
        .paged-editor-content h2 { font-size: 14px; font-weight: 600; margin: 19px 0 10px 0; line-height: 1.3; font-family: system-ui, -apple-system, sans-serif; }
        .paged-editor-content h3 { font-size: 12px; font-weight: 600; margin: 16px 0 6px 0; line-height: 1.4; font-family: system-ui, -apple-system, sans-serif; }
        .paged-editor-content p { font-size: 10px; line-height: 1.7; margin: 0 0 10px 0; }
        .paged-editor-content ul, .paged-editor-content ol { margin: 0 0 10px 0; padding-left: 19px; font-size: 10px; }
        .paged-editor-content li { line-height: 1.6; margin-bottom: 3px; }
        .paged-editor-content li p { margin: 0; }
        .paged-editor-content blockquote { border-left: 2px solid #d1d5db; margin: 13px 0; padding-left: 13px; font-style: italic; }
        .paged-editor-content code { padding: 2px 3px; border-radius: 2px; font-size: 10px; font-family: 'SF Mono', Monaco, monospace; }
        .paged-editor-content .editor-link { text-decoration: underline; cursor: pointer; }
        .paged-editor-content p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; height: 0; pointer-events: none; }
        
        .tracked-claim { border-radius: 2px; padding: 0 3px; cursor: pointer; transition: all 0.15s; }
        .tracked-claim:hover { filter: brightness(0.95); }
        
        .page-break-node { height: 32px; margin: 16px 0; position: relative; display: flex; align-items: center; justify-content: center; }
        .page-break-node::before { content: ''; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: repeating-linear-gradient(90deg, #d1d5db 0px, #d1d5db 4px, transparent 4px, transparent 8px); }
        .page-break-node::after { content: 'PAGE BREAK'; position: relative; padding: 3px 10px; font-size: 7px; font-weight: 500; letter-spacing: 0.05em; font-family: system-ui, sans-serif; }
        .page-break-node.ProseMirror-selectednode::before { background: repeating-linear-gradient(90deg, #3b82f6 0px, #3b82f6 4px, transparent 4px, transparent 8px); }
        .page-break-node.ProseMirror-selectednode::after { color: #3b82f6; }
        
        @media print {
          .paged-editor-scroll { background: white !important; overflow: visible !important; }
          .page-bg-container { display: none !important; }
          .add-page-btn { display: none !important; }
          .page-break-node { height: 0 !important; margin: 0 !important; page-break-after: always; }
          .page-break-node::before, .page-break-node::after { display: none; }
        }
      `}</style>

      {/* Main scroll container */}
      <div
        ref={scrollRef}
        className="paged-editor-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative',
          background: darkMode ? '#1a1a1a' : '#525659',
        }}
      >
        {/* Canvas with all pages */}
        <div style={{ position: 'relative', minHeight: totalHeight, paddingTop: PAGE_GAP, paddingBottom: PAGE_GAP }}>
          
          {/* Page backgrounds - absolutely positioned, pointer-events none */}
          <div
            className="page-bg-container"
            style={{
              position: 'absolute',
              top: PAGE_GAP,
              left: '50%',
              transform: 'translateX(-50%)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          >
            {Array.from({ length: pageCount }, (_, i) => (
              <div
                key={i}
                style={{
                  width: PAGE_WIDTH,
                  height: PAGE_HEIGHT,
                  background: darkMode ? '#2a2a2a' : 'white',
                  boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.5)' : '0 1px 4px rgba(0,0,0,0.1)',
                  marginBottom: i < pageCount - 1 ? PAGE_GAP : 0,
                  borderRadius: 2,
                  position: 'relative',
                }}
              >
                <div style={{
                  position: 'absolute',
                  bottom: 10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 9,
                  color: darkMode ? '#6b7280' : '#9ca3af',
                  fontFamily: 'system-ui, sans-serif',
                }}>
                  {i + 1}
                </div>
              </div>
            ))}
          </div>

          {/* Editor wrapper - positioned on top */}
          <div
            ref={editorWrapperRef}
            style={{
              position: 'relative',
              width: PAGE_WIDTH,
              margin: '0 auto',
              padding: PAGE_MARGIN,
              boxSizing: 'border-box',
              zIndex: 1,
              color: darkMode ? '#d1d5db' : '#374151',
            }}
          >
            <div style={{ width: CONTENT_WIDTH }}>
              <EditorContent 
                editor={editor} 
                style={{
                  minHeight: CONTENT_HEIGHT,
                  caretColor: darkMode ? '#60a5fa' : '#3b82f6',
                }}
              />
            </div>
          </div>

          {/* Add page button */}
          <button
            className="add-page-btn"
            onClick={handleAddPage}
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: PAGE_WIDTH,
              height: 48,
              margin: `${PAGE_GAP}px auto 0`,
              border: `2px dashed ${darkMode ? '#4b5563' : '#9ca3af'}`,
              borderRadius: 8,
              color: darkMode ? '#6b7280' : '#9ca3af',
              background: 'transparent',
              cursor: 'pointer',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Plus style={{ width: 20, height: 20 }} />
          </button>
        </div>
      </div>

      {/* Floating toolbar */}
      {hasSelection && selectionPos && (
        <div
          ref={toolbarRef}
          style={{
            position: 'fixed',
            top: selectionPos.top,
            left: selectionPos.left,
            transform: 'translateX(-50%)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            padding: '6px',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            backgroundColor: '#FBF9F7',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          {isLinkInputOpen ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px' }}>
              <input
                type="url"
                placeholder="Enter URL..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSetLink(); if (e.key === 'Escape') setIsLinkInputOpen(false); }}
                style={{ background: 'transparent', color: '#111827', fontSize: 14, outline: 'none', width: 192, border: 'none' }}
                autoFocus
              />
              <button onClick={handleSetLink} style={{ padding: 4, color: '#6b7280', cursor: 'pointer', background: 'none', border: 'none' }}><LinkIcon style={{ width: 16, height: 16 }} /></button>
              <button onClick={() => setIsLinkInputOpen(false)} style={{ padding: 4, color: '#6b7280', cursor: 'pointer', background: 'none', border: 'none' }}><X style={{ width: 16, height: 16 }} /></button>
            </div>
          ) : (
            <>
              <button style={{ padding: '6px 8px', fontSize: 14, color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, borderRadius: 4, background: 'none', border: 'none' }}>
                Aa
                <svg style={{ width: 12, height: 12 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div style={{ width: 1, height: 20, background: '#d1d5db', margin: '0 4px' }} />
              <button onClick={() => editor.chain().focus().toggleBold().run()} style={{ padding: 6, borderRadius: 4, cursor: 'pointer', background: editor.isActive('bold') ? 'white' : 'none', boxShadow: editor.isActive('bold') ? '0 1px 2px rgba(0,0,0,0.1)' : 'none', color: editor.isActive('bold') ? '#111827' : '#6b7280', border: 'none' }}><Bold style={{ width: 16, height: 16 }} /></button>
              <button onClick={() => editor.chain().focus().toggleItalic().run()} style={{ padding: 6, borderRadius: 4, cursor: 'pointer', background: editor.isActive('italic') ? 'white' : 'none', boxShadow: editor.isActive('italic') ? '0 1px 2px rgba(0,0,0,0.1)' : 'none', color: editor.isActive('italic') ? '#111827' : '#6b7280', border: 'none' }}><Italic style={{ width: 16, height: 16 }} /></button>
              <button onClick={() => editor.chain().focus().toggleStrike().run()} style={{ padding: 6, borderRadius: 4, cursor: 'pointer', background: editor.isActive('strike') ? 'white' : 'none', boxShadow: editor.isActive('strike') ? '0 1px 2px rgba(0,0,0,0.1)' : 'none', color: editor.isActive('strike') ? '#111827' : '#6b7280', border: 'none' }}><Strikethrough style={{ width: 16, height: 16 }} /></button>
              <button onClick={() => editor.chain().focus().toggleUnderline().run()} style={{ padding: 6, borderRadius: 4, cursor: 'pointer', background: editor.isActive('underline') ? 'white' : 'none', boxShadow: editor.isActive('underline') ? '0 1px 2px rgba(0,0,0,0.1)' : 'none', color: editor.isActive('underline') ? '#111827' : '#6b7280', border: 'none' }}><UnderlineIcon style={{ width: 16, height: 16 }} /></button>
              <button onClick={() => editor.isActive('link') ? handleRemoveLink() : setIsLinkInputOpen(true)} style={{ padding: 6, borderRadius: 4, cursor: 'pointer', background: editor.isActive('link') ? 'white' : 'none', boxShadow: editor.isActive('link') ? '0 1px 2px rgba(0,0,0,0.1)' : 'none', color: editor.isActive('link') ? '#111827' : '#6b7280', border: 'none' }}><LinkIcon style={{ width: 16, height: 16 }} /></button>
              <button onClick={() => editor.chain().focus().toggleBlockquote().run()} style={{ padding: 6, borderRadius: 4, cursor: 'pointer', background: editor.isActive('blockquote') ? 'white' : 'none', boxShadow: editor.isActive('blockquote') ? '0 1px 2px rgba(0,0,0,0.1)' : 'none', color: editor.isActive('blockquote') ? '#111827' : '#6b7280', border: 'none' }}><Quote style={{ width: 16, height: 16 }} /></button>
              <button onClick={() => editor.chain().focus().toggleCode().run()} style={{ padding: 6, borderRadius: 4, cursor: 'pointer', background: editor.isActive('code') ? 'white' : 'none', boxShadow: editor.isActive('code') ? '0 1px 2px rgba(0,0,0,0.1)' : 'none', color: editor.isActive('code') ? '#111827' : '#6b7280', border: 'none' }}><Code style={{ width: 16, height: 16 }} /></button>
              <div style={{ width: 1, height: 20, background: '#d1d5db', margin: '0 4px' }} />
              <button onClick={handleAddToChat} style={{ padding: '6px 10px', borderRadius: 4, cursor: 'pointer', color: '#4b5563', fontSize: 14, fontWeight: 500, background: 'none', border: 'none' }}>Add to Chat</button>
              <button onClick={handleTrack} style={{ padding: '6px 10px', borderRadius: 4, cursor: 'pointer', background: '#111827', color: 'white', fontSize: 14, fontWeight: 500, border: 'none' }}>Track</button>
            </>
          )}
        </div>
      )}

      {/* Tooltip */}
      {tooltip?.visible && (
        <div style={{ position: 'fixed', top: tooltip.y, left: tooltip.x, transform: 'translate(-50%, -100%)', zIndex: 100, pointerEvents: 'none' }}>
          <div style={{ borderRadius: 8, border: '1px solid #e5e7eb', padding: 12, minWidth: 200, maxWidth: 300, backgroundColor: '#FBF9F7', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'monospace', marginBottom: 4 }}>{tooltip.claimId}</div>
            <p style={{ fontSize: 14, color: '#111827', marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>{tooltip.text}</p>
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
              {tooltip.source && <span style={{ fontSize: 12, color: '#4b5563', textTransform: 'capitalize' }}>{tooltip.source}</span>}
              {tooltip.cadence && <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock style={{ width: 12, height: 12, color: '#9ca3af' }} /><span style={{ fontSize: 12, color: '#6b7280', textTransform: 'capitalize' }}>{tooltip.cadence}</span></div>}
            </div>
          </div>
        </div>
      )}
    </>
  )
})

PagedEditor.displayName = 'PagedEditor'
export default PagedEditor