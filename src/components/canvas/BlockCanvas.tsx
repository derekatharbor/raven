// src/components/canvas/BlockCanvas.tsx
//
// Ghost Block Architecture:
// - Blocks are invisible — zero margins, continuous flow
// - Metadata lives in the Integrity Rail (left gutter)
// - Claims tracking in the right Proof Pane
// - Premium serif typography for document content

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { 
  GripVertical, Plus, MoreHorizontal, Trash2, Copy, 
  ArrowRightLeft, Type, Radio, Calculator, Link2, 
  TrendingUp, Sparkles
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
  formula?: string
  currentValue?: string
  previousValue?: string
  changePercent?: number
}

// Rail colors - muted, professional
const RAIL_COLORS: Record<BlockType, string> = {
  static: 'transparent',
  live: '#3B82F6',
  derived: '#8B5CF6',
  synced: '#14B8A6',
  delta: '#10B981',
  summary: '#8B5CF6',
}

const STATUS_COLORS: Record<BlockStatus, string> = {
  default: 'transparent',
  verified: '#10B981',
  drifted: '#F59E0B',
  stale: '#9CA3AF',
}

// ============================================================================
// SINGLE BLOCK COMPONENT
// ============================================================================

interface BlockEditorProps {
  block: Block
  isFirst: boolean
  isFocused: boolean
  onFocus: () => void
  onUpdate: (content: string) => void
  onDelete: () => void
  onDuplicate: () => void
  onChangeType: (type: BlockType) => void
  onAddBlockAfter: () => void
  onOpenBlockPalette: () => void
  onSelectBlock: () => void
}

function BlockEditor({ 
  block, 
  isFirst,
  isFocused,
  onFocus,
  onUpdate, 
  onDelete, 
  onDuplicate,
  onChangeType,
  onAddBlockAfter,
  onOpenBlockPalette,
  onSelectBlock,
}: BlockEditorProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Placeholder.configure({
        placeholder: isFirst ? 'Start writing...' : '',
        showOnlyWhenEditable: true,
        showOnlyCurrent: true,
      }),
    ],
    content: block.content,
    editorProps: {
      attributes: { class: 'ghost-block-content' },
    },
    onUpdate: ({ editor }) => onUpdate(editor.getHTML()),
    onFocus: () => onFocus(),
  })

  useEffect(() => {
    if (!editor) return
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/' && editor.isEmpty) {
        event.preventDefault()
        onOpenBlockPalette()
      }
      if (event.key === 'Backspace' && editor.isEmpty) {
        event.preventDefault()
        onDelete()
      }
      if (event.key === 'Enter' && !event.shiftKey && editor.isEmpty) {
        event.preventDefault()
        onAddBlockAfter()
      }
    }

    const element = editor.view.dom
    element.addEventListener('keydown', handleKeyDown)
    return () => element.removeEventListener('keydown', handleKeyDown)
  }, [editor, onOpenBlockPalette, onDelete, onAddBlockAfter])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const railColor = block.status !== 'default' 
    ? STATUS_COLORS[block.status] 
    : RAIL_COLORS[block.type]
  
  const showRail = block.type !== 'static' || block.status !== 'default'

  return (
    <div
      className="ghost-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'stretch',
      }}
    >
      {/* Left gutter */}
      <div style={{
        width: 48,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        paddingRight: 8,
        paddingTop: 4,
        gap: 2,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.1s',
        }}>
          <button
            onClick={onAddBlockAfter}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 18,
              height: 18,
              borderRadius: 4,
              border: 'none',
              background: 'transparent',
              color: '#9CA3AF',
              cursor: 'pointer',
            }}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 18,
              height: 18,
              borderRadius: 4,
              border: 'none',
              background: 'transparent',
              color: '#9CA3AF',
              cursor: 'grab',
            }}
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Integrity Rail */}
      <div 
        onClick={onSelectBlock}
        style={{
          width: 3,
          flexShrink: 0,
          marginRight: 12,
          borderRadius: 2,
          background: showRail ? railColor : 'transparent',
          cursor: showRail ? 'pointer' : 'default',
          transition: 'background 0.15s',
          minHeight: 24,
        }}
        title={showRail ? `${block.type} block${block.sourceName ? ` • ${block.sourceName}` : ''}` : undefined}
      />

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <EditorContent editor={editor} />
      </div>

      {/* Right menu */}
      <div style={{
        width: 32,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 4,
        position: 'relative',
      }}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 20,
            height: 20,
            borderRadius: 4,
            border: 'none',
            background: 'transparent',
            color: '#9CA3AF',
            cursor: 'pointer',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.1s',
          }}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {showMenu && (
          <div
            ref={menuRef}
            style={{
              position: 'absolute',
              top: 24,
              right: 0,
              width: 180,
              background: 'white',
              borderRadius: 8,
              boxShadow: '0 4px 16px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)',
              zIndex: 100,
              padding: '4px 0',
            }}
          >
            <button
              onClick={() => { onDuplicate(); setShowMenu(false); }}
              className="menu-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 13,
                color: '#374151',
                textAlign: 'left',
              }}
            >
              <Copy className="w-4 h-4 text-gray-400" />
              Duplicate
            </button>
            <button
              onClick={() => { onOpenBlockPalette(); setShowMenu(false); }}
              className="menu-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 13,
                color: '#374151',
                textAlign: 'left',
              }}
            >
              <ArrowRightLeft className="w-4 h-4 text-gray-400" />
              Change type
            </button>
            <div style={{ height: 1, background: '#E5E7EB', margin: '4px 0' }} />
            <button
              onClick={() => { onDelete(); setShowMenu(false); }}
              className="menu-item-danger"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 13,
                color: '#EF4444',
                textAlign: 'left',
              }}
            >
              <Trash2 className="w-4 h-4" />
              Delete
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

interface BlockPaletteProps {
  isOpen: boolean
  onClose: () => void
  onSelectType: (type: BlockType) => void
}

const BLOCK_OPTIONS: { type: BlockType; label: string; description: string; icon: React.ReactNode }[] = [
  { type: 'static', label: 'Text', description: 'Plain text block', icon: <Type className="w-4 h-4" /> },
  { type: 'live', label: 'Live Data', description: 'Connected to external source', icon: <Radio className="w-4 h-4" /> },
  { type: 'derived', label: 'Derived', description: 'Calculated from other blocks', icon: <Calculator className="w-4 h-4" /> },
  { type: 'synced', label: 'Synced', description: 'Linked across documents', icon: <Link2 className="w-4 h-4" /> },
  { type: 'delta', label: 'Delta', description: 'Shows value changes', icon: <TrendingUp className="w-4 h-4" /> },
  { type: 'summary', label: 'AI Summary', description: 'Generated from document', icon: <Sparkles className="w-4 h-4" /> },
]

function BlockPalette({ isOpen, onClose, onSelectType }: BlockPaletteProps) {
  const paletteRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={paletteRef}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 260,
        background: '#FAFAFA',
        borderRight: '1px solid #E5E7EB',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{
        padding: '16px 16px 12px',
        borderBottom: '1px solid #E5E7EB',
      }}>
        <div style={{ 
          fontSize: 11, 
          fontWeight: 600, 
          color: '#6B7280', 
          textTransform: 'uppercase', 
          letterSpacing: '0.05em',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          Insert Block
        </div>
      </div>
      
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
        {BLOCK_OPTIONS.map((option) => (
          <button
            key={option.type}
            onClick={() => { onSelectType(option.type); onClose(); }}
            className="palette-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              width: '100%',
              padding: '10px 16px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ color: '#6B7280' }}>
              {option.icon}
            </div>
            <div>
              <div style={{ 
                fontSize: 14, 
                fontWeight: 500, 
                color: '#111827',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}>
                {option.label}
              </div>
              <div style={{ 
                fontSize: 12, 
                color: '#6B7280',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}>
                {option.description}
              </div>
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

interface ProofPaneProps {
  blocks: Block[]
}

function ProofPane({ blocks }: ProofPaneProps) {
  const trackedBlocks = blocks.filter(b => b.type !== 'static')
  const driftedCount = blocks.filter(b => b.status === 'drifted').length

  return (
    <div style={{
      width: 280,
      flexShrink: 0,
      borderLeft: '1px solid #E5E7EB',
      background: '#FAFAFA',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #E5E7EB',
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
          Claims
        </div>
        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
          {trackedBlocks.length} tracked{driftedCount > 0 && ` • ${driftedCount} drifted`}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {trackedBlocks.length === 0 ? (
          <div style={{ padding: 16, fontSize: 13, color: '#9CA3AF', textAlign: 'center' }}>
            No tracked blocks yet.
          </div>
        ) : (
          trackedBlocks.map((block) => (
            <div
              key={block.id}
              className="proof-item"
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #E5E7EB',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: block.status === 'drifted' ? '#F59E0B' : 
                             block.status === 'verified' ? '#10B981' : '#D1D5DB',
                }} />
                <span style={{ 
                  fontSize: 11, 
                  fontWeight: 500, 
                  color: '#6B7280', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                }}>
                  {block.type}
                </span>
                {block.sourceName && (
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                    • {block.sourceName}
                  </span>
                )}
              </div>
              <div style={{
                fontSize: 13,
                color: '#374151',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {block.content.replace(/<[^>]*>/g, '').substring(0, 50) || 'Empty block'}
              </div>
              {block.status === 'drifted' && (
                <div style={{
                  marginTop: 6,
                  fontSize: 11,
                  color: '#F59E0B',
                  fontWeight: 500,
                }}>
                  Source value changed
                </div>
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
  onBlocksChange?: (blocks: Block[]) => void
  showProofPane?: boolean
}

export default function BlockCanvas({ 
  documentId, 
  documentTitle = '',
  initialBlocks,
  onBlocksChange,
  showProofPane = true,
}: BlockCanvasProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks || [
    { id: '1', type: 'static', content: '', status: 'default' }
  ])
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [showPalette, setShowPalette] = useState(false)
  const [title, setTitle] = useState(documentTitle)

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

  const updateBlock = useCallback((id: string, content: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b))
  }, [])

  const deleteBlock = useCallback((id: string) => {
    setBlocks(prev => {
      if (prev.length === 1) return [{ ...prev[0], content: '' }]
      const index = prev.findIndex(b => b.id === id)
      const newBlocks = prev.filter(b => b.id !== id)
      if (index > 0) setTimeout(() => setFocusedBlockId(newBlocks[index - 1].id), 50)
      return newBlocks
    })
  }, [])

  const duplicateBlock = useCallback((id: string) => {
    setBlocks(prev => {
      const index = prev.findIndex(b => b.id === id)
      const block = prev[index]
      const newBlock: Block = { ...block, id: generateId() }
      const newBlocks = [...prev]
      newBlocks.splice(index + 1, 0, newBlock)
      return newBlocks
    })
  }, [])

  const changeBlockType = useCallback((id: string, type: BlockType) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, type } : b))
    setShowPalette(false)
  }, [])

  useEffect(() => { onBlocksChange?.(blocks) }, [blocks, onBlocksChange])

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden', background: 'white' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@400;500;600&display=swap');
        
        .ghost-block-content {
          outline: none;
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 17px;
          line-height: 1.7;
          color: #1a1a1a;
        }
        
        .ghost-block-content:focus { outline: none; }
        .ghost-block-content p { margin: 0; }
        
        .ghost-block-content h1 {
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 32px;
          font-weight: 600;
          margin: 0 0 8px 0;
          line-height: 1.3;
          color: #111;
        }
        
        .ghost-block-content h2 {
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 24px;
          font-weight: 600;
          margin: 24px 0 8px 0;
          line-height: 1.35;
          color: #111;
        }
        
        .ghost-block-content h3 {
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 20px;
          font-weight: 600;
          margin: 20px 0 6px 0;
          line-height: 1.4;
          color: #222;
        }
        
        .ghost-block-content p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #BCBCBC;
          float: left;
          height: 0;
          pointer-events: none;
          font-style: italic;
        }
        
        .ghost-block-content ul, .ghost-block-content ol {
          margin: 0;
          padding-left: 28px;
        }
        
        .ghost-block-content li { margin: 4px 0; }
        
        .ghost-block-content blockquote {
          border-left: 2px solid #E5E7EB;
          margin: 8px 0;
          padding-left: 20px;
          color: #6B7280;
          font-style: italic;
        }
        
        .ghost-block-content strong { font-weight: 600; }
        .ghost-block-content em { font-style: italic; }
        
        .ghost-block-content code {
          background: #F3F4F6;
          padding: 2px 5px;
          border-radius: 3px;
          font-size: 15px;
          font-family: 'SF Mono', Monaco, monospace;
        }
        
        .menu-item:hover { background: #F3F4F6; }
        .menu-item-danger:hover { background: #FEF2F2; }
        .palette-item:hover { background: #F3F4F6; }
        .proof-item:hover { background: #F3F4F6; }
      `}</style>

      {/* Block Palette */}
      <BlockPalette
        isOpen={showPalette}
        onClose={() => setShowPalette(false)}
        onSelectType={(type) => {
          if (focusedBlockId) changeBlockType(focusedBlockId, type)
          else addBlock(undefined, type)
        }}
      />

      {/* Canvas */}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 32px 120px' }}>
          {/* Title */}
          <div style={{ marginBottom: 32, paddingLeft: 63 }}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled"
              style={{
                width: '100%',
                fontSize: 38,
                fontWeight: 600,
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
                isFocused={focusedBlockId === block.id}
                onFocus={() => setFocusedBlockId(block.id)}
                onUpdate={(content) => updateBlock(block.id, content)}
                onDelete={() => deleteBlock(block.id)}
                onDuplicate={() => duplicateBlock(block.id)}
                onChangeType={(type) => changeBlockType(block.id, type)}
                onAddBlockAfter={() => addBlock(block.id)}
                onOpenBlockPalette={() => { setFocusedBlockId(block.id); setShowPalette(true); }}
                onSelectBlock={() => setSelectedBlockId(block.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Proof Pane */}
      {showProofPane && <ProofPane blocks={blocks} />}
    </div>
  )
}