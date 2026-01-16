// src/components/canvas/BlockCanvas.tsx
//
// Ghost Block Architecture with Cursor/Linear aesthetic

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { 
  GripVertical, Plus, MoreHorizontal, Trash2, Copy, 
  ArrowRightLeft, Type, Radio, Calculator, Link2, 
  TrendingUp, Sparkles, ChevronRight, ChevronLeft,
  X, Bold, Italic, Underline as UnderlineIcon,
  MessageSquare, Crosshair
} from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

type BlockType = 'static' | 'live' | 'derived' | 'synced' | 'delta' | 'summary'
type BlockStatus = 'default' | 'verified' | 'drifted' | 'stale'

interface Block {
  id: string
  type: BlockType
  content: string
  status: BlockStatus
  sourceId?: string
  sourceName?: string
  lastChecked?: string
}

interface Tab {
  id: string
  name: string
  hasChanges: boolean
}

// Cursor/Linear palette - muted, professional
const RAIL_COLORS: Record<BlockType, string> = {
  static: 'transparent',
  live: '#5C6AC4',
  derived: '#7C6BBB',
  synced: '#5C6AC4',
  delta: '#4B9E7E',
  summary: '#7C6BBB',
}

const STATUS_COLORS: Record<BlockStatus, string> = {
  default: 'transparent',
  verified: '#4B9E7E',
  drifted: '#D4915D',
  stale: '#8B8B8B',
}

// ============================================================================
// TABS
// ============================================================================

function EditorTabs({ tabs, activeTabId, onTabSelect, onTabClose, onNewTab }: {
  tabs: Tab[]
  activeTabId: string
  onTabSelect: (id: string) => void
  onTabClose: (id: string) => void
  onNewTab: () => void
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      height: 40,
      borderBottom: '1px solid #E5E7EB',
      background: '#FAFAFA',
      paddingLeft: 8,
      gap: 1,
    }}>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => onTabSelect(tab.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            fontSize: 13,
            color: activeTabId === tab.id ? '#111' : '#6B7280',
            background: activeTabId === tab.id ? 'white' : 'transparent',
            borderRadius: '6px 6px 0 0',
            cursor: 'pointer',
            borderBottom: activeTabId === tab.id ? '1px solid white' : 'none',
            marginBottom: -1,
            fontWeight: activeTabId === tab.id ? 500 : 400,
          }}
        >
          <span style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {tab.name || 'Untitled'}
          </span>
          {tab.hasChanges && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#5C6AC4' }} />}
          {tabs.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); onTabClose(tab.id); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: 4, border: 'none', background: 'transparent', color: '#9CA3AF', cursor: 'pointer', opacity: 0.6 }}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
      <button onClick={onNewTab} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: '#9CA3AF', cursor: 'pointer', marginLeft: 4 }}>
        <Plus className="w-4 h-4" />
      </button>
    </div>
  )
}

// ============================================================================
// FLOATING TOOLBAR
// ============================================================================

function FloatingToolbar({ position, isVisible, editor, onTrack, onAddToChat }: {
  position: { top: number; left: number } | null
  isVisible: boolean
  editor: any
  onTrack: () => void
  onAddToChat: () => void
}) {
  if (!isVisible || !position || !editor) return null

  const btnStyle = (active: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 4,
    border: 'none',
    background: active ? '#F3F4F6' : 'transparent',
    color: active ? '#111' : '#6B7280',
    cursor: 'pointer',
  })

  return (
    <div style={{
      position: 'fixed',
      top: position.top,
      left: position.left,
      transform: 'translateX(-50%)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      padding: '4px 6px',
      borderRadius: 8,
      background: 'white',
      border: '1px solid #E5E7EB',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    }}>
      <button onClick={() => editor.chain().focus().toggleBold().run()} style={btnStyle(editor.isActive('bold'))}><Bold className="w-4 h-4" /></button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} style={btnStyle(editor.isActive('italic'))}><Italic className="w-4 h-4" /></button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} style={btnStyle(editor.isActive('underline'))}><UnderlineIcon className="w-4 h-4" /></button>
      
      <div style={{ width: 1, height: 20, background: '#E5E7EB', margin: '0 4px' }} />
      
      <button onClick={onAddToChat} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', borderRadius: 4, border: 'none', background: 'transparent', color: '#6B7280', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
        <MessageSquare className="w-3.5 h-3.5" />Chat
      </button>
      
      <button onClick={onTrack} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 4, border: 'none', background: '#111', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
        <Crosshair className="w-3.5 h-3.5" />Track
      </button>
    </div>
  )
}

// ============================================================================
// BLOCK EDITOR
// ============================================================================

function BlockEditor({ block, isFirst, onFocus, onUpdate, onDelete, onDuplicate, onChangeType, onAddBlockAfter, onOpenBlockPalette, onFocusPrevious, onSelectionChange }: {
  block: Block
  isFirst: boolean
  onFocus: () => void
  onUpdate: (content: string) => void
  onDelete: () => void
  onDuplicate: () => void
  onChangeType: (type: BlockType) => void
  onAddBlockAfter: () => void
  onOpenBlockPalette: () => void
  onFocusPrevious: () => void
  onSelectionChange: (visible: boolean, pos: { top: number; left: number } | null, editor: any) => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Placeholder.configure({ placeholder: isFirst ? 'Start writing...' : '', showOnlyWhenEditable: true, showOnlyCurrent: true }),
    ],
    content: block.content,
    editorProps: { attributes: { class: 'ghost-block-content' } },
    onUpdate: ({ editor }) => onUpdate(editor.getHTML()),
    onFocus: () => onFocus(),
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection
      const text = editor.state.doc.textBetween(from, to, ' ')
      if (text.trim().length > 0) {
        const start = editor.view.coordsAtPos(from)
        const end = editor.view.coordsAtPos(to)
        onSelectionChange(true, { top: start.top - 48, left: (start.left + end.left) / 2 }, editor)
      } else {
        onSelectionChange(false, null, null)
      }
    },
    onBlur: () => setTimeout(() => onSelectionChange(false, null, null), 150),
  })

  useEffect(() => {
    if (!editor) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/' && editor.isEmpty) { event.preventDefault(); onOpenBlockPalette() }
      if (event.key === 'Backspace' && editor.isEmpty) { event.preventDefault(); onFocusPrevious(); onDelete() }
      if (event.key === 'Enter' && !event.shiftKey && editor.isEmpty) { event.preventDefault(); onAddBlockAfter() }
    }
    const el = editor.view.dom
    el.addEventListener('keydown', handleKeyDown)
    return () => el.removeEventListener('keydown', handleKeyDown)
  }, [editor, onOpenBlockPalette, onDelete, onAddBlockAfter, onFocusPrevious])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false) }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const railColor = block.status !== 'default' ? STATUS_COLORS[block.status] : RAIL_COLORS[block.type]
  const showRail = block.type !== 'static' || block.status !== 'default'

  const gutterBtnStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    borderRadius: 4,
    border: 'none',
    background: 'transparent',
    color: '#B0B0B0',
    cursor: 'pointer',
    opacity: isHovered ? 1 : 0,
    transition: 'opacity 0.1s',
  }

  return (
    <div className="ghost-block" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} style={{ position: 'relative', display: 'flex', alignItems: 'stretch' }}>
      {/* Left gutter */}
      <div style={{ width: 52, flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', paddingRight: 8, paddingTop: 4, gap: 2 }}>
        <button onClick={onAddBlockAfter} className="gutter-btn" style={gutterBtnStyle}><Plus className="w-4 h-4" /></button>
        <button className="gutter-btn" style={{ ...gutterBtnStyle, cursor: 'grab' }}><GripVertical className="w-4 h-4" /></button>
      </div>

      {/* Integrity Rail */}
      <div style={{ width: 3, flexShrink: 0, marginRight: 14, borderRadius: 2, background: showRail ? railColor : 'transparent', cursor: showRail ? 'pointer' : 'default', transition: 'background 0.15s', minHeight: 24 }} title={showRail ? `${block.type}${block.sourceName ? ` • ${block.sourceName}` : ''}` : undefined} />

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}><EditorContent editor={editor} /></div>

      {/* Right menu */}
      <div style={{ width: 32, flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 4, position: 'relative' }}>
        <button onClick={() => setShowMenu(!showMenu)} className="gutter-btn" style={gutterBtnStyle}><MoreHorizontal className="w-4 h-4" /></button>
        {showMenu && (
          <div ref={menuRef} style={{ position: 'absolute', top: 24, right: 0, width: 180, background: 'white', borderRadius: 8, border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', zIndex: 100, padding: '4px 0' }}>
            <button onClick={() => { onDuplicate(); setShowMenu(false) }} className="menu-item" style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#374151', textAlign: 'left' }}>
              <Copy className="w-4 h-4" style={{ color: '#9CA3AF' }} />Duplicate
            </button>
            <button onClick={() => { onOpenBlockPalette(); setShowMenu(false) }} className="menu-item" style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#374151', textAlign: 'left' }}>
              <ArrowRightLeft className="w-4 h-4" style={{ color: '#9CA3AF' }} />Change type
            </button>
            <div style={{ height: 1, background: '#F3F4F6', margin: '4px 0' }} />
            <button onClick={() => { onDelete(); setShowMenu(false) }} className="menu-item-danger" style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#DC2626', textAlign: 'left' }}>
              <Trash2 className="w-4 h-4" />Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// BLOCK PALETTE
// ============================================================================

const BLOCK_OPTIONS: { type: BlockType; label: string; description: string; icon: React.ReactNode }[] = [
  { type: 'static', label: 'Text', description: 'Plain text block', icon: <Type className="w-4 h-4" /> },
  { type: 'live', label: 'Live Data', description: 'Connected to external source', icon: <Radio className="w-4 h-4" /> },
  { type: 'derived', label: 'Derived', description: 'Calculated from other blocks', icon: <Calculator className="w-4 h-4" /> },
  { type: 'synced', label: 'Synced', description: 'Linked across documents', icon: <Link2 className="w-4 h-4" /> },
  { type: 'delta', label: 'Delta', description: 'Shows value changes', icon: <TrendingUp className="w-4 h-4" /> },
  { type: 'summary', label: 'AI Summary', description: 'Generated from document', icon: <Sparkles className="w-4 h-4" /> },
]

function BlockPalette({ isOpen, onClose, onSelectType }: { isOpen: boolean; onClose: () => void; onSelectType: (type: BlockType) => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose() }
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }
    return () => { document.removeEventListener('mousedown', handleClickOutside); document.removeEventListener('keydown', handleEscape) }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div ref={ref} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 260, background: '#FAFAFA', borderRight: '1px solid #E5E7EB', zIndex: 200, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Insert Block</div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '4px 0' }}>
        {BLOCK_OPTIONS.map((option) => (
          <button key={option.type} onClick={() => { onSelectType(option.type); onClose() }} className="palette-item" style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ color: '#6B7280' }}>{option.icon}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{option.label}</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>{option.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// PROOF PANE
// ============================================================================

function ProofPane({ blocks, isCollapsed, onToggleCollapse }: { blocks: Block[]; isCollapsed: boolean; onToggleCollapse: () => void }) {
  const trackedBlocks = blocks.filter(b => b.type !== 'static')
  const driftedCount = blocks.filter(b => b.status === 'drifted').length

  if (isCollapsed) {
    return (
      <div style={{ width: 40, flexShrink: 0, borderLeft: '1px solid #E5E7EB', background: '#FAFAFA', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 12 }}>
        <button onClick={onToggleCollapse} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: '#6B7280', cursor: 'pointer' }}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        {driftedCount > 0 && <div style={{ marginTop: 12, width: 20, height: 20, borderRadius: '50%', background: '#D4915D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'white' }}>{driftedCount}</div>}
      </div>
    )
  }

  return (
    <div style={{ width: 280, flexShrink: 0, borderLeft: '1px solid #E5E7EB', background: '#FAFAFA', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Claims</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 1 }}>{trackedBlocks.length} tracked{driftedCount > 0 && ` • ${driftedCount} drifted`}</div>
        </div>
        <button onClick={onToggleCollapse} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: '#6B7280', cursor: 'pointer' }}>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {trackedBlocks.length === 0 ? (
          <div style={{ padding: 20, fontSize: 13, color: '#9CA3AF', textAlign: 'center', lineHeight: 1.5 }}>No tracked blocks yet.<br />Select text and click Track.</div>
        ) : (
          trackedBlocks.map((block) => (
            <div key={block.id} className="proof-item" style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: block.status === 'drifted' ? '#D4915D' : block.status === 'verified' ? '#4B9E7E' : '#D1D5DB' }} />
                <span style={{ fontSize: 11, fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{block.type}</span>
                {block.sourceName && <span style={{ fontSize: 11, color: '#9CA3AF' }}>• {block.sourceName}</span>}
              </div>
              <div style={{ fontSize: 13, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{block.content.replace(/<[^>]*>/g, '').substring(0, 50) || 'Empty'}</div>
              {block.status === 'drifted' && <div style={{ marginTop: 6, fontSize: 11, color: '#D4915D', fontWeight: 500 }}>Source value changed</div>}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ============================================================================
// MAIN CANVAS
// ============================================================================

interface BlockCanvasProps {
  documentId: string
  documentTitle?: string
  initialBlocks?: Block[]
  tabs?: Tab[]
  activeTabId?: string
  onTabSelect?: (id: string) => void
  onTabClose?: (id: string) => void
  onNewTab?: () => void
  onBlocksChange?: (blocks: Block[]) => void
}

export default function BlockCanvas({ 
  documentId, 
  documentTitle = '',
  initialBlocks,
  tabs = [{ id: 'doc-1', name: 'Q4 2024 Analysis', hasChanges: false }],
  activeTabId = 'doc-1',
  onTabSelect,
  onTabClose,
  onNewTab,
  onBlocksChange,
}: BlockCanvasProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks || [{ id: '1', type: 'static', content: '', status: 'default' }])
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null)
  const [showPalette, setShowPalette] = useState(false)
  const [title, setTitle] = useState(documentTitle)
  const [proofPaneCollapsed, setProofPaneCollapsed] = useState(false)
  const [toolbarState, setToolbarState] = useState<{ visible: boolean; position: { top: number; left: number } | null; editor: any }>({ visible: false, position: null, editor: null })

  const generateId = () => Math.random().toString(36).substring(2, 9)

  const addBlock = useCallback((afterId?: string, type: BlockType = 'static') => {
    const newBlock: Block = { id: generateId(), type, content: '', status: 'default' }
    setBlocks(prev => {
      if (!afterId) return [...prev, newBlock]
      const index = prev.findIndex(b => b.id === afterId)
      const newBlocks = [...prev]
      newBlocks.splice(index + 1, 0, newBlock)
      return newBlocks
    })
    setTimeout(() => setFocusedBlockId(newBlock.id), 50)
  }, [])

  const updateBlock = useCallback((id: string, content: string) => setBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b)), [])
  const deleteBlock = useCallback((id: string) => setBlocks(prev => prev.length === 1 ? [{ ...prev[0], content: '' }] : prev.filter(b => b.id !== id)), [])
  const focusPreviousBlock = useCallback((currentId: string) => {
    const index = blocks.findIndex(b => b.id === currentId)
    if (index > 0) setFocusedBlockId(blocks[index - 1].id)
  }, [blocks])
  const duplicateBlock = useCallback((id: string) => {
    setBlocks(prev => {
      const index = prev.findIndex(b => b.id === id)
      const newBlocks = [...prev]
      newBlocks.splice(index + 1, 0, { ...prev[index], id: generateId() })
      return newBlocks
    })
  }, [])
  const changeBlockType = useCallback((id: string, type: BlockType) => { setBlocks(prev => prev.map(b => b.id === id ? { ...b, type } : b)); setShowPalette(false) }, [])

  useEffect(() => { onBlocksChange?.(blocks) }, [blocks, onBlocksChange])

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'white' }}>
      <style>{`
        .ghost-block-content { outline: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.65; color: #1a1a1a; }
        .ghost-block-content:focus { outline: none; }
        .ghost-block-content p { margin: 0; }
        .ghost-block-content h1 { font-size: 28px; font-weight: 600; margin: 0 0 8px 0; line-height: 1.3; color: #111; letter-spacing: -0.02em; }
        .ghost-block-content h2 { font-size: 20px; font-weight: 600; margin: 20px 0 6px 0; line-height: 1.35; color: #111; letter-spacing: -0.01em; }
        .ghost-block-content h3 { font-size: 16px; font-weight: 600; margin: 16px 0 4px 0; line-height: 1.4; color: #222; }
        .ghost-block-content p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #B0B0B0; float: left; height: 0; pointer-events: none; }
        .ghost-block-content ul, .ghost-block-content ol { margin: 0; padding-left: 24px; }
        .ghost-block-content li { margin: 3px 0; }
        .ghost-block-content blockquote { border-left: 2px solid #E0E0E0; margin: 8px 0; padding-left: 16px; color: #666; }
        .ghost-block-content strong { font-weight: 600; }
        .ghost-block-content code { background: #F5F5F5; padding: 2px 5px; border-radius: 3px; font-size: 13px; font-family: 'SF Mono', Monaco, monospace; color: #333; }
        .gutter-btn:hover { background: #F3F4F6 !important; color: #374151 !important; }
        .menu-item:hover { background: #F5F5F5; }
        .menu-item-danger:hover { background: #FEF2F2; }
        .palette-item:hover { background: #F0F0F0; }
        .proof-item:hover { background: #F5F5F5; }
      `}</style>

      <EditorTabs tabs={tabs} activeTabId={activeTabId} onTabSelect={onTabSelect || (() => {})} onTabClose={onTabClose || (() => {})} onNewTab={onNewTab || (() => {})} />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        <BlockPalette isOpen={showPalette} onClose={() => setShowPalette(false)} onSelectType={(type) => { if (focusedBlockId) changeBlockType(focusedBlockId, type); else addBlock(undefined, type) }} />

        <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 32px 120px' }}>
            <div style={{ marginBottom: 24, paddingLeft: 69 }}>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Untitled" style={{ width: '100%', fontSize: 32, fontWeight: 600, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: '#111', border: 'none', outline: 'none', background: 'transparent', letterSpacing: '-0.02em' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {blocks.map((block, index) => (
                <BlockEditor key={block.id} block={block} isFirst={index === 0 && !title} onFocus={() => setFocusedBlockId(block.id)} onUpdate={(content) => updateBlock(block.id, content)} onDelete={() => deleteBlock(block.id)} onDuplicate={() => duplicateBlock(block.id)} onChangeType={(type) => changeBlockType(block.id, type)} onAddBlockAfter={() => addBlock(block.id)} onOpenBlockPalette={() => { setFocusedBlockId(block.id); setShowPalette(true) }} onFocusPrevious={() => focusPreviousBlock(block.id)} onSelectionChange={(visible, pos, editor) => setToolbarState({ visible, position: pos, editor })} />
              ))}
            </div>
          </div>
        </div>

        <ProofPane blocks={blocks} isCollapsed={proofPaneCollapsed} onToggleCollapse={() => setProofPaneCollapsed(!proofPaneCollapsed)} />
        <FloatingToolbar position={toolbarState.position} isVisible={toolbarState.visible} editor={toolbarState.editor} onTrack={() => setToolbarState({ visible: false, position: null, editor: null })} onAddToChat={() => setToolbarState({ visible: false, position: null, editor: null })} />
      </div>
    </div>
  )
}