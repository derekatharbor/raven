// src/components/canvas/BlockCanvas.tsx
//
// Ghost Block Architecture - Raven Intelligence Canvas
// Three flows: BUILD (blocks) → TRACK (accuracy) → SIGNAL (research)

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
  MessageSquare, Crosshair, ChevronDown,
  DollarSign, Target, BookOpen, Search
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

// Block configuration with inline labels for clarity (no legend needed)
const BLOCK_CONFIG: Record<BlockType, { color: string; label: string; description: string }> = {
  static: { color: 'transparent', label: '', description: 'Plain text' },
  live: { color: '#5C6AC4', label: 'LIVE', description: 'Connected to source' },
  derived: { color: '#7C6BBB', label: 'CALC', description: 'Calculated value' },
  synced: { color: '#5C6AC4', label: 'SYNC', description: 'Linked across docs' },
  delta: { color: '#4B9E7E', label: 'Δ', description: 'Change tracking' },
  summary: { color: '#7C6BBB', label: 'AI', description: 'Generated content' },
}

const STATUS_COLORS: Record<BlockStatus, string> = {
  default: 'transparent',
  verified: '#4B9E7E',
  drifted: '#D4915D',
  stale: '#8B8B8B',
}

// Signal options for research flow
const SIGNAL_OPTIONS = [
  { id: 'financial', label: 'Financial', description: 'Revenue, margins, valuations', icon: DollarSign },
  { id: 'strategic', label: 'Strategic', description: 'Market position, moats, risks', icon: Target },
  { id: 'narrative', label: 'Narrative', description: 'Story, sentiment, messaging', icon: BookOpen },
  { id: 'competitive', label: 'Competitive', description: 'Peers, market share, trends', icon: Search },
]

// ============================================================================
// RAVEN LOGO
// ============================================================================

function RavenLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#111" />
      <path d="M16 6L22 12L16 18L10 12L16 6Z" fill="white" />
      <path d="M16 14L22 20L16 26L10 20L16 14Z" fill="white" fillOpacity="0.5" />
    </svg>
  )
}

// ============================================================================
// TABS WITH RAVEN LOGO ANCHOR
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
    }}>
      {/* Raven logo anchor - prevents tab collapse, acts as divider */}
      <div style={{
        width: 48,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRight: '1px solid #E5E7EB',
        flexShrink: 0,
      }}>
        <RavenLogo size={22} />
      </div>

      {/* Tabs container */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        flex: 1,
        overflow: 'hidden',
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
              flexShrink: 0,
              maxWidth: 180,
            }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {tab.name || 'Untitled'}
            </span>
            {tab.hasChanges && (
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#5C6AC4', flexShrink: 0 }} />
            )}
            {tabs.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); onTabClose(tab.id); }}
                className="tab-close-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  border: 'none',
                  background: 'transparent',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={onNewTab}
          className="tab-add-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: 6,
            border: 'none',
            background: 'transparent',
            color: '#9CA3AF',
            cursor: 'pointer',
            marginLeft: 4,
            flexShrink: 0,
          }}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// SELECTION TOOLBAR - Matches Sidebar bg (#FBF9F7) with Signal submenu
// ============================================================================

function SelectionToolbar({ position, isVisible, editor, onTrack, onSignal, onAddToChat }: {
  position: { top: number; left: number } | null
  isVisible: boolean
  editor: any
  onTrack: () => void
  onSignal: (type: string) => void
  onAddToChat: () => void
}) {
  const [showSignalMenu, setShowSignalMenu] = useState(false)
  const toolbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isVisible) setShowSignalMenu(false)
  }, [isVisible])

  if (!isVisible || !position || !editor) return null

  return (
    <>
      <div
        ref={toolbarRef}
        style={{
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
          background: '#FBF9F7',
          border: '1px solid #E5E7EB',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}
      >
        {/* Format buttons */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="toolbar-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: 4,
            border: 'none',
            background: editor.isActive('bold') ? 'rgba(0,0,0,0.08)' : 'transparent',
            color: editor.isActive('bold') ? '#111' : '#6B7280',
            cursor: 'pointer',
          }}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="toolbar-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: 4,
            border: 'none',
            background: editor.isActive('italic') ? 'rgba(0,0,0,0.08)' : 'transparent',
            color: editor.isActive('italic') ? '#111' : '#6B7280',
            cursor: 'pointer',
          }}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className="toolbar-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: 4,
            border: 'none',
            background: editor.isActive('underline') ? 'rgba(0,0,0,0.08)' : 'transparent',
            color: editor.isActive('underline') ? '#111' : '#6B7280',
            cursor: 'pointer',
          }}
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>

        <div style={{ width: 1, height: 20, background: '#E5E7EB', margin: '0 4px' }} />

        {/* Signal dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowSignalMenu(!showSignalMenu)}
            className="toolbar-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              borderRadius: 4,
              border: 'none',
              background: showSignalMenu ? 'rgba(0,0,0,0.08)' : 'transparent',
              color: '#6B7280',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <Search className="w-3.5 h-3.5" />
            Signal
            <ChevronDown 
              className="w-3 h-3" 
              style={{ 
                transform: showSignalMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s',
              }} 
            />
          </button>
        </div>

        <div style={{ width: 1, height: 20, background: '#E5E7EB', margin: '0 4px' }} />

        {/* Chat button */}
        <button
          onClick={onAddToChat}
          className="toolbar-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '4px 8px',
            borderRadius: 4,
            border: 'none',
            background: 'transparent',
            color: '#6B7280',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Chat
        </button>

        {/* Track button - primary action */}
        <button
          onClick={onTrack}
          className="toolbar-track-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '4px 10px',
            borderRadius: 4,
            border: 'none',
            background: '#111',
            color: 'white',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          <Crosshair className="w-3.5 h-3.5" />
          Track
        </button>
      </div>

      {/* Signal submenu */}
      {showSignalMenu && (
        <div
          style={{
            position: 'fixed',
            top: position.top + 44,
            left: position.left,
            transform: 'translateX(-50%)',
            zIndex: 1001,
            width: 240,
            padding: '4px',
            borderRadius: 8,
            background: '#FBF9F7',
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          }}
        >
          {SIGNAL_OPTIONS.map((option) => {
            const Icon = option.icon
            return (
              <button
                key={option.id}
                onClick={() => {
                  onSignal(option.id)
                  setShowSignalMenu(false)
                }}
                className="signal-option"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 6,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" style={{ color: '#9CA3AF' }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{option.label}</div>
                  <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>{option.description}</div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </>
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

  const config = BLOCK_CONFIG[block.type]
  const railColor = block.status !== 'default' ? STATUS_COLORS[block.status] : config.color
  const showRail = block.type !== 'static' || block.status !== 'default'
  const showLabel = block.type !== 'static' && config.label

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

      {/* Integrity Rail with inline label */}
      <div style={{ width: 3, flexShrink: 0, marginRight: 14, position: 'relative' }}>
        {/* Rail */}
        <div 
          style={{ 
            width: 3, 
            height: '100%', 
            borderRadius: 2, 
            background: showRail ? railColor : 'transparent', 
            cursor: showRail ? 'pointer' : 'default', 
            transition: 'background 0.15s', 
            minHeight: 24 
          }} 
          title={showRail ? `${config.description}${block.sourceName ? ` • ${block.sourceName}` : ''}` : undefined} 
        />
        {/* Inline label above rail */}
        {showLabel && (
          <div 
            style={{ 
              position: 'absolute',
              top: -14,
              left: -4,
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: '0.04em',
              color: config.color,
              whiteSpace: 'nowrap',
            }}
            title={config.description}
          >
            {config.label}
          </div>
        )}
        {/* Drift indicator */}
        {block.status === 'drifted' && (
          <div 
            style={{ 
              position: 'absolute',
              bottom: -12,
              left: -8,
              fontSize: 9,
              fontWeight: 600,
              color: '#D4915D',
              whiteSpace: 'nowrap',
            }}
          >
            DRIFT
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, paddingTop: showLabel ? 2 : 0 }}><EditorContent editor={editor} /></div>

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

const BLOCK_OPTIONS: { type: BlockType; label: string; description: string; icon: React.ReactNode; color: string }[] = [
  { type: 'static', label: 'Text', description: 'Plain text block', icon: <Type className="w-4 h-4" />, color: '#6B7280' },
  { type: 'live', label: 'Live Data', description: 'Connected to external source', icon: <Radio className="w-4 h-4" />, color: '#5C6AC4' },
  { type: 'derived', label: 'Calculated', description: 'Derived from other blocks', icon: <Calculator className="w-4 h-4" />, color: '#7C6BBB' },
  { type: 'synced', label: 'Synced', description: 'Linked across documents', icon: <Link2 className="w-4 h-4" />, color: '#5C6AC4' },
  { type: 'delta', label: 'Delta', description: 'Shows value changes', icon: <TrendingUp className="w-4 h-4" />, color: '#4B9E7E' },
  { type: 'summary', label: 'AI Summary', description: 'Generated from document', icon: <Sparkles className="w-4 h-4" />, color: '#7C6BBB' },
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
            <div style={{ color: option.color }}>{option.icon}</div>
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
        <button onClick={onToggleCollapse} className="pane-toggle-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: '#6B7280', cursor: 'pointer' }}>
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
        <button onClick={onToggleCollapse} className="pane-toggle-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: '#6B7280', cursor: 'pointer' }}>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {trackedBlocks.length === 0 ? (
          <div style={{ padding: 20, fontSize: 13, color: '#9CA3AF', textAlign: 'center', lineHeight: 1.5 }}>No tracked claims yet.<br />Select text and click Track.</div>
        ) : (
          trackedBlocks.map((block) => {
            const config = BLOCK_CONFIG[block.type]
            return (
              <div key={block.id} className="proof-item" style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: block.status === 'drifted' ? '#D4915D' : block.status === 'verified' ? '#4B9E7E' : '#D1D5DB' }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: config.color, letterSpacing: '0.04em' }}>{config.label}</span>
                  {block.sourceName && <span style={{ fontSize: 11, color: '#9CA3AF' }}>• {block.sourceName}</span>}
                </div>
                <div style={{ fontSize: 13, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{block.content.replace(/<[^>]*>/g, '').substring(0, 50) || 'Empty'}</div>
                {block.status === 'drifted' && <div style={{ marginTop: 6, fontSize: 11, color: '#D4915D', fontWeight: 500 }}>Source value changed</div>}
              </div>
            )
          })
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

  // Handlers for toolbar actions
  const handleTrack = useCallback(() => {
    // TODO: Open track claim modal or create tracked claim
    console.log('Track action')
    setToolbarState({ visible: false, position: null, editor: null })
  }, [])

  const handleSignal = useCallback((signalType: string) => {
    // TODO: Trigger signal analysis
    console.log('Signal action:', signalType)
    setToolbarState({ visible: false, position: null, editor: null })
  }, [])

  const handleAddToChat = useCallback(() => {
    // TODO: Add to chat panel
    console.log('Add to chat action')
    setToolbarState({ visible: false, position: null, editor: null })
  }, [])

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
        .toolbar-btn:hover { background: rgba(0,0,0,0.08) !important; color: #111 !important; }
        .toolbar-track-btn:hover { background: #333 !important; }
        .signal-option:hover { background: rgba(0,0,0,0.05) !important; }
        .menu-item:hover { background: #F5F5F5; }
        .menu-item-danger:hover { background: #FEF2F2; }
        .palette-item:hover { background: #F0F0F0; }
        .proof-item:hover { background: #F5F5F5; }
        .pane-toggle-btn:hover { background: rgba(0,0,0,0.05); }
        .tab-close-btn:hover { background: rgba(0,0,0,0.08); color: #374151; }
        .tab-add-btn:hover { background: rgba(0,0,0,0.05); color: #6B7280; }
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
        <SelectionToolbar 
          position={toolbarState.position} 
          isVisible={toolbarState.visible} 
          editor={toolbarState.editor} 
          onTrack={handleTrack} 
          onSignal={handleSignal}
          onAddToChat={handleAddToChat} 
        />
      </div>
    </div>
  )
}