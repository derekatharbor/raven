// src/components/canvas/BlockCanvas.tsx
//
// Raven "Quiet" Workspace - Cursor for Documents
// Clean canvas, hover-triggered integrity rail, no inline clutter

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Image from 'next/image'
import { 
  GripVertical, Plus, MoreHorizontal, Trash2, Copy, 
  ArrowRightLeft, ChevronRight, ChevronLeft,
  X, Bold, Italic, Underline as UnderlineIcon,
  MessageSquare, Crosshair, ChevronDown,
  DollarSign, Target, BookOpen, Search, Link2
} from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

type BlockStatus = 'default' | 'synced' | 'drifted' | 'signal'

interface Block {
  id: string
  content: string
  status: BlockStatus
  sourceId?: string
  sourceName?: string
}

interface Tab {
  id: string
  name: string
  hasChanges: boolean
}

// Integrity Rail colors (only visible on hover)
// Green = synced, Amber = drift, Blue = signal
const RAIL_COLORS: Record<BlockStatus, string> = {
  default: 'transparent',
  synced: '#4B9E7E',   // Green - variable synced with source
  drifted: '#D4915D',  // Amber - value mismatch
  signal: '#5C6AC4',   // Blue - narrative signal attached
}

// Signal options for research flow
const SIGNAL_OPTIONS = [
  { id: 'financial', label: 'Financial', description: 'Revenue, margins, valuations', icon: DollarSign },
  { id: 'strategic', label: 'Strategic', description: 'Market position, moats, risks', icon: Target },
  { id: 'narrative', label: 'Narrative', description: 'Story, sentiment, messaging', icon: BookOpen },
  { id: 'competitive', label: 'Competitive', description: 'Peers, market share, trends', icon: Search },
]

// ============================================================================
// TABS WITH RAVEN FAVICON
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
            gap: 8,
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
            maxWidth: 200,
          }}
        >
          {/* Raven favicon inside each tab */}
          <img 
            src="/images/raven-logo.png" 
            alt="" 
            style={{ 
              width: 16, 
              height: 16, 
              objectFit: 'contain',
              opacity: activeTabId === tab.id ? 1 : 0.6,
              flexShrink: 0,
            }} 
          />
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
  )
}

// ============================================================================
// SELECTION TOOLBAR - #FBF9F7 bg with Signal dropdown
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

  useEffect(() => {
    if (!isVisible) setShowSignalMenu(false)
  }, [isVisible])

  if (!isVisible || !position || !editor) return null

  return (
    <>
      <div
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

        {/* Connect Variable button */}
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
          <Link2 className="w-3.5 h-3.5" />
          Connect
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
                <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#9CA3AF' }} />
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
// BLOCK EDITOR - Hover-triggered integrity rail, no inline labels
// ============================================================================

function BlockEditor({ block, isFirst, onFocus, onUpdate, onDelete, onDuplicate, onAddBlockAfter, onFocusPrevious, onSelectionChange }: {
  block: Block
  isFirst: boolean
  onFocus: () => void
  onUpdate: (content: string) => void
  onDelete: () => void
  onDuplicate: () => void
  onAddBlockAfter: () => void
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
      if (event.key === 'Backspace' && editor.isEmpty) { event.preventDefault(); onFocusPrevious(); onDelete() }
      if (event.key === 'Enter' && !event.shiftKey && editor.isEmpty) { event.preventDefault(); onAddBlockAfter() }
    }
    const el = editor.view.dom
    el.addEventListener('keydown', handleKeyDown)
    return () => el.removeEventListener('keydown', handleKeyDown)
  }, [editor, onDelete, onAddBlockAfter, onFocusPrevious])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false) }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const railColor = RAIL_COLORS[block.status]
  const hasRail = block.status !== 'default'

  return (
    <div 
      className="ghost-block" 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)} 
      style={{ position: 'relative', display: 'flex', alignItems: 'stretch' }}
    >
      {/* Left gutter with hover-triggered buttons */}
      <div style={{ width: 52, flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', paddingRight: 8, paddingTop: 4, gap: 2 }}>
        <button 
          onClick={onAddBlockAfter} 
          className="gutter-btn" 
          style={{
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
          }}
        >
          <Plus className="w-4 h-4" />
        </button>
        <button 
          className="gutter-btn" 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 20,
            height: 20,
            borderRadius: 4,
            border: 'none',
            background: 'transparent',
            color: '#B0B0B0',
            cursor: 'grab',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.1s',
          }}
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Integrity Rail - INVISIBLE by default, visible on hover */}
      <div 
        style={{ 
          width: 3, 
          flexShrink: 0, 
          marginRight: 14, 
          borderRadius: 2, 
          background: hasRail && isHovered ? railColor : 'transparent',
          cursor: hasRail ? 'pointer' : 'default', 
          transition: 'background 0.15s', 
          minHeight: 24,
        }} 
        title={hasRail ? `${block.status}${block.sourceName ? ` • ${block.sourceName}` : ''}` : undefined} 
      />

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <EditorContent editor={editor} />
      </div>

      {/* Right menu - hover triggered */}
      <div style={{ width: 32, flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 4, position: 'relative' }}>
        <button 
          onClick={() => setShowMenu(!showMenu)} 
          className="gutter-btn" 
          style={{
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
          }}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
        {showMenu && (
          <div ref={menuRef} style={{ position: 'absolute', top: 24, right: 0, width: 180, background: 'white', borderRadius: 8, border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', zIndex: 100, padding: '4px 0' }}>
            <button onClick={() => { onDuplicate(); setShowMenu(false) }} className="menu-item" style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#374151', textAlign: 'left' }}>
              <Copy className="w-4 h-4" style={{ color: '#9CA3AF' }} />Duplicate
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
// CLAIMS PANE (Right Sidebar - The "Linter")
// ============================================================================

function ClaimsPane({ blocks, isCollapsed, onToggleCollapse }: { 
  blocks: Block[]
  isCollapsed: boolean
  onToggleCollapse: () => void 
}) {
  const trackedBlocks = blocks.filter(b => b.status !== 'default')
  const driftedCount = blocks.filter(b => b.status === 'drifted').length

  if (isCollapsed) {
    return (
      <div style={{ width: 40, flexShrink: 0, borderLeft: '1px solid #E5E7EB', background: '#FAFAFA', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 12 }}>
        <button onClick={onToggleCollapse} className="pane-toggle-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: '#6B7280', cursor: 'pointer' }}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        {driftedCount > 0 && (
          <div style={{ marginTop: 12, width: 20, height: 20, borderRadius: '50%', background: '#D4915D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'white' }}>
            {driftedCount}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ width: 280, flexShrink: 0, borderLeft: '1px solid #E5E7EB', background: '#FAFAFA', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Claims</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 1 }}>
            {trackedBlocks.length} tracked{driftedCount > 0 && ` • ${driftedCount} drifted`}
          </div>
        </div>
        <button onClick={onToggleCollapse} className="pane-toggle-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: '#6B7280', cursor: 'pointer' }}>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {trackedBlocks.length === 0 ? (
          <div style={{ padding: 20, fontSize: 13, color: '#9CA3AF', textAlign: 'center', lineHeight: 1.5 }}>
            No tracked claims.<br />Select text and click Connect.
          </div>
        ) : (
          trackedBlocks.map((block) => (
            <div key={block.id} className="claim-item" style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: RAIL_COLORS[block.status] }} />
                <span style={{ fontSize: 11, fontWeight: 500, color: '#6B7280', textTransform: 'capitalize' }}>{block.status}</span>
                {block.sourceName && <span style={{ fontSize: 11, color: '#9CA3AF' }}>• {block.sourceName}</span>}
              </div>
              <div style={{ fontSize: 13, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {block.content.replace(/<[^>]*>/g, '').substring(0, 50) || 'Empty'}
              </div>
              {block.status === 'drifted' && (
                <div style={{ marginTop: 6, fontSize: 11, color: '#D4915D', fontWeight: 500 }}>Source value changed</div>
              )}
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
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks || [{ id: '1', content: '', status: 'default' }])
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null)
  const [title, setTitle] = useState(documentTitle)
  const [claimsPaneCollapsed, setClaimsPaneCollapsed] = useState(false)
  const [toolbarState, setToolbarState] = useState<{ visible: boolean; position: { top: number; left: number } | null; editor: any }>({ visible: false, position: null, editor: null })

  const generateId = () => Math.random().toString(36).substring(2, 9)

  const addBlock = useCallback((afterId?: string) => {
    const newBlock: Block = { id: generateId(), content: '', status: 'default' }
    setBlocks(prev => {
      if (!afterId) return [...prev, newBlock]
      const index = prev.findIndex(b => b.id === afterId)
      const newBlocks = [...prev]
      newBlocks.splice(index + 1, 0, newBlock)
      return newBlocks
    })
    setTimeout(() => setFocusedBlockId(newBlock.id), 50)
  }, [])

  const updateBlock = useCallback((id: string, content: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b))
  }, [])

  const deleteBlock = useCallback((id: string) => {
    setBlocks(prev => prev.length === 1 ? [{ ...prev[0], content: '' }] : prev.filter(b => b.id !== id))
  }, [])

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

  // Toolbar action handlers
  const handleConnect = useCallback(() => {
    console.log('Connect variable action')
    setToolbarState({ visible: false, position: null, editor: null })
  }, [])

  const handleSignal = useCallback((signalType: string) => {
    console.log('Signal action:', signalType)
    setToolbarState({ visible: false, position: null, editor: null })
  }, [])

  const handleAddToChat = useCallback(() => {
    console.log('Add to chat action')
    setToolbarState({ visible: false, position: null, editor: null })
  }, [])

  useEffect(() => { onBlocksChange?.(blocks) }, [blocks, onBlocksChange])

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'white' }}>
      <style>{`
        .ghost-block-content { 
          outline: none; 
          font-family: 'EB Garamond', Georgia, 'Times New Roman', serif; 
          font-size: 16px; 
          line-height: 1.7; 
          color: #1a1a1a; 
        }
        .ghost-block-content:focus { outline: none; }
        .ghost-block-content p { margin: 0; }
        .ghost-block-content h1 { font-size: 32px; font-weight: 500; margin: 0 0 12px 0; line-height: 1.3; color: #111; }
        .ghost-block-content h2 { font-size: 24px; font-weight: 500; margin: 24px 0 8px 0; line-height: 1.35; color: #111; }
        .ghost-block-content h3 { font-size: 18px; font-weight: 500; margin: 20px 0 6px 0; line-height: 1.4; color: #222; }
        .ghost-block-content p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #B0B0B0; float: left; height: 0; pointer-events: none; }
        .ghost-block-content ul, .ghost-block-content ol { margin: 0; padding-left: 24px; }
        .ghost-block-content li { margin: 4px 0; }
        .ghost-block-content blockquote { border-left: 2px solid #E0E0E0; margin: 12px 0; padding-left: 16px; color: #555; font-style: italic; }
        .ghost-block-content strong { font-weight: 600; }
        .ghost-block-content code { background: #F5F5F5; padding: 2px 5px; border-radius: 3px; font-size: 14px; font-family: 'SF Mono', Monaco, monospace; color: #333; }
        
        .gutter-btn:hover { background: #F3F4F6 !important; color: #374151 !important; }
        .toolbar-btn:hover { background: rgba(0,0,0,0.08) !important; color: #111 !important; }
        .toolbar-track-btn:hover { background: #333 !important; }
        .signal-option:hover { background: rgba(0,0,0,0.05) !important; }
        .menu-item:hover { background: #F5F5F5; }
        .menu-item-danger:hover { background: #FEF2F2; }
        .claim-item:hover { background: #F5F5F5; }
        .pane-toggle-btn:hover { background: rgba(0,0,0,0.05); }
        .tab-close-btn:hover { background: rgba(0,0,0,0.08); color: #374151; }
        .tab-add-btn:hover { background: rgba(0,0,0,0.05); color: #6B7280; }
        
        @media print {
          .gutter-btn, .pane-toggle-btn, .tab-close-btn, .tab-add-btn { display: none !important; }
          .ghost-block > div:first-child { display: none !important; }
          .ghost-block > div:nth-child(2) { display: none !important; }
        }
      `}</style>

      <EditorTabs 
        tabs={tabs} 
        activeTabId={activeTabId} 
        onTabSelect={onTabSelect || (() => {})} 
        onTabClose={onTabClose || (() => {})} 
        onNewTab={onNewTab || (() => {})} 
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Main editor area */}
        <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 32px 120px' }}>
            {/* Document title */}
            <div style={{ marginBottom: 32, paddingLeft: 69 }}>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Untitled" 
                style={{ 
                  width: '100%', 
                  fontSize: 36, 
                  fontWeight: 500, 
                  fontFamily: "'EB Garamond', Georgia, serif", 
                  color: '#111', 
                  border: 'none', 
                  outline: 'none', 
                  background: 'transparent',
                }} 
              />
            </div>

            {/* Blocks */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {blocks.map((block, index) => (
                <BlockEditor 
                  key={block.id} 
                  block={block} 
                  isFirst={index === 0 && !title} 
                  onFocus={() => setFocusedBlockId(block.id)} 
                  onUpdate={(content) => updateBlock(block.id, content)} 
                  onDelete={() => deleteBlock(block.id)} 
                  onDuplicate={() => duplicateBlock(block.id)} 
                  onAddBlockAfter={() => addBlock(block.id)} 
                  onFocusPrevious={() => focusPreviousBlock(block.id)} 
                  onSelectionChange={(visible, pos, editor) => setToolbarState({ visible, position: pos, editor })} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* Claims Pane (Right Sidebar - The Linter) */}
        <ClaimsPane 
          blocks={blocks} 
          isCollapsed={claimsPaneCollapsed} 
          onToggleCollapse={() => setClaimsPaneCollapsed(!claimsPaneCollapsed)} 
        />

        {/* Selection Toolbar */}
        <SelectionToolbar 
          position={toolbarState.position} 
          isVisible={toolbarState.visible} 
          editor={toolbarState.editor} 
          onTrack={handleConnect} 
          onSignal={handleSignal}
          onAddToChat={handleAddToChat} 
        />
      </div>
    </div>
  )
}