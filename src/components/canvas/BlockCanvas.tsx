// src/components/canvas/BlockCanvas.tsx
//
// Notion-style block canvas with intelligent block types
// Each block is an independent unit with its own behavior and data connections

'use client'

import { useState, useCallback, useRef, useEffect, KeyboardEvent } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { 
  GripVertical, Plus, MoreHorizontal, Type, Radio, 
  GitBranch, Link2, TrendingUp, Sparkles, Trash2,
  Copy, ArrowRightLeft, Check, AlertTriangle, RefreshCw
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
  // Live block properties
  sourceId?: string
  sourceName?: string
  lastChecked?: string
  // Derived block properties
  formula?: string
  // Delta block properties
  previousValue?: string
  currentValue?: string
  changePercent?: number
  // Synced block properties
  syncedFrom?: string
}

interface BlockTypeOption {
  type: BlockType
  label: string
  description: string
  icon: React.ReactNode
  color: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const BLOCK_TYPES: BlockTypeOption[] = [
  { 
    type: 'static', 
    label: 'Static', 
    description: 'Standard text block',
    icon: <Type className="w-4 h-4" />,
    color: 'transparent'
  },
  { 
    type: 'live', 
    label: 'Live', 
    description: 'Connected to external data source',
    icon: <Radio className="w-4 h-4" />,
    color: '#3B82F6' // blue
  },
  { 
    type: 'derived', 
    label: 'Derived', 
    description: 'Calculated from other blocks',
    icon: <GitBranch className="w-4 h-4" />,
    color: '#8B5CF6' // purple
  },
  { 
    type: 'synced', 
    label: 'Synced', 
    description: 'Linked across documents',
    icon: <Link2 className="w-4 h-4" />,
    color: '#14B8A6' // teal
  },
  { 
    type: 'delta', 
    label: 'Delta', 
    description: 'Shows value changes',
    icon: <TrendingUp className="w-4 h-4" />,
    color: '#10B981' // green (changes based on direction)
  },
  { 
    type: 'summary', 
    label: 'Summary', 
    description: 'AI-generated from document',
    icon: <Sparkles className="w-4 h-4" />,
    color: 'linear-gradient(135deg, #3B82F6, #8B5CF6)'
  },
]

const getBlockColor = (block: Block): string => {
  if (block.status === 'drifted') return '#F59E0B' // amber
  if (block.status === 'stale') return '#9CA3AF' // gray
  
  if (block.type === 'delta') {
    if (block.changePercent && block.changePercent > 0) return '#10B981' // green
    if (block.changePercent && block.changePercent < 0) return '#EF4444' // red
    return '#9CA3AF'
  }
  
  const blockType = BLOCK_TYPES.find(t => t.type === block.type)
  return blockType?.color || 'transparent'
}

// ============================================================================
// SINGLE BLOCK COMPONENT
// ============================================================================

interface BlockEditorProps {
  block: Block
  isActive: boolean
  onActivate: () => void
  onUpdate: (content: string) => void
  onDelete: () => void
  onDuplicate: () => void
  onChangeType: (type: BlockType) => void
  onAddBlockAfter: () => void
}

function BlockEditor({ 
  block, 
  isActive, 
  onActivate,
  onUpdate, 
  onDelete, 
  onDuplicate,
  onChangeType,
  onAddBlockAfter,
}: BlockEditorProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showTypeSelector, setShowTypeSelector] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const typeSelectorRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: block.type === 'static' 
          ? "Type '/' for commands..." 
          : `${BLOCK_TYPES.find(t => t.type === block.type)?.label} block...`,
      }),
    ],
    content: block.content,
    editorProps: {
      attributes: {
        class: 'block-editor-content',
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML())
    },
    onFocus: () => {
      onActivate()
    },
  })

  // Handle "/" command
  useEffect(() => {
    if (!editor) return
    
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === '/' && editor.isEmpty) {
        event.preventDefault()
        setShowTypeSelector(true)
      }
      if (event.key === 'Enter' && !event.shiftKey && editor.isEmpty) {
        event.preventDefault()
        onAddBlockAfter()
      }
    }

    const element = editor.view.dom
    element.addEventListener('keydown', handleKeyDown)
    return () => element.removeEventListener('keydown', handleKeyDown)
  }, [editor, onAddBlockAfter])

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (typeSelectorRef.current && !typeSelectorRef.current.contains(e.target as Node)) {
        setShowTypeSelector(false)
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const indicatorColor = getBlockColor(block)
  const isGradient = indicatorColor.includes('gradient')

  return (
    <div
      className="block-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        padding: '4px 0',
        borderRadius: 4,
      }}
    >
      {/* Left controls - drag handle */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.15s',
          paddingTop: 4,
        }}
      >
        <button
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
            cursor: 'grab',
          }}
        >
          <GripVertical className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => onAddBlockAfter()}
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
          }}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Block type indicator */}
      <div style={{ position: 'relative', paddingTop: 4 }}>
        <button
          onClick={() => setShowTypeSelector(!showTypeSelector)}
          style={{
            width: 4,
            height: 24,
            borderRadius: 2,
            border: 'none',
            background: isGradient ? indicatorColor : indicatorColor,
            cursor: block.type !== 'static' ? 'pointer' : 'default',
            opacity: block.type === 'static' ? 0.3 : 1,
            transition: 'all 0.15s',
          }}
          title={`${BLOCK_TYPES.find(t => t.type === block.type)?.label} block - click to change`}
        />
        
        {/* Status indicator */}
        {block.status === 'verified' && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: -2,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Check className="w-2 h-2 text-white" strokeWidth={3} />
          </div>
        )}
        
        {block.status === 'drifted' && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: -2,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#F59E0B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <AlertTriangle className="w-2 h-2 text-white" strokeWidth={3} />
          </div>
        )}
        
        {block.status === 'stale' && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: -2,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#9CA3AF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <RefreshCw className="w-2 h-2 text-white" strokeWidth={3} />
          </div>
        )}

        {/* Type selector dropdown */}
        {showTypeSelector && (
          <div
            ref={typeSelectorRef}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 4,
              width: 240,
              background: 'white',
              borderRadius: 8,
              boxShadow: '0 4px 16px rgba(0,0,0,0.12), 0 0 1px rgba(0,0,0,0.1)',
              zIndex: 100,
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '8px 0' }}>
              <div style={{ padding: '4px 12px 8px', fontSize: 11, fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase' }}>
                Block Type
              </div>
              {BLOCK_TYPES.map((type) => (
                <button
                  key={type.type}
                  onClick={() => {
                    onChangeType(type.type)
                    setShowTypeSelector(false)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    background: block.type === type.type ? '#F3F4F6' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: type.color === 'transparent' ? '#F3F4F6' : type.color.includes('gradient') ? type.color : `${type.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: type.color === 'transparent' ? '#6B7280' : type.color.includes('gradient') ? '#8B5CF6' : type.color,
                  }}>
                    {type.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{type.label}</div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>{type.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content area */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Delta block special display */}
        {block.type === 'delta' && block.currentValue && (
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 8,
            marginBottom: 4,
          }}>
            <span style={{ fontSize: 24, fontWeight: 600, color: '#111827' }}>
              {block.currentValue}
            </span>
            {block.changePercent !== undefined && (
              <span style={{
                fontSize: 14,
                fontWeight: 500,
                color: block.changePercent > 0 ? '#10B981' : block.changePercent < 0 ? '#EF4444' : '#6B7280',
              }}>
                {block.changePercent > 0 ? '▲' : block.changePercent < 0 ? '▼' : '–'} {Math.abs(block.changePercent)}%
              </span>
            )}
          </div>
        )}
        
        {/* Live block source badge */}
        {block.type === 'live' && block.sourceName && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 8px',
            background: '#EFF6FF',
            borderRadius: 4,
            marginBottom: 4,
            fontSize: 11,
            color: '#3B82F6',
            fontWeight: 500,
          }}>
            <Radio className="w-3 h-3" />
            {block.sourceName}
            {block.lastChecked && (
              <span style={{ color: '#93C5FD' }}>• {block.lastChecked}</span>
            )}
          </div>
        )}
        
        {/* Summary block badge */}
        {block.type === 'summary' && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 8px',
            background: 'linear-gradient(135deg, #EFF6FF, #F3E8FF)',
            borderRadius: 4,
            marginBottom: 4,
            fontSize: 11,
            color: '#7C3AED',
            fontWeight: 500,
          }}>
            <Sparkles className="w-3 h-3" />
            AI Summary
          </div>
        )}

        {/* Editor */}
        <EditorContent editor={editor} />
        
        {/* Drift indicator - Grammarly style */}
        {block.status === 'drifted' && (
          <div style={{
            marginTop: 4,
            padding: '6px 10px',
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: 6,
            fontSize: 12,
            color: '#92400E',
          }}>
            <strong>Drift detected:</strong> Source value has changed
          </div>
        )}
      </div>

      {/* Right menu */}
      <div 
        style={{
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.15s',
          paddingTop: 4,
          position: 'relative',
        }}
      >
        <button
          onClick={() => setShowMenu(!showMenu)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            borderRadius: 4,
            border: 'none',
            background: 'transparent',
            color: '#9CA3AF',
            cursor: 'pointer',
          }}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {showMenu && (
          <div
            ref={menuRef}
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 4,
              width: 180,
              background: 'white',
              borderRadius: 8,
              boxShadow: '0 4px 16px rgba(0,0,0,0.12), 0 0 1px rgba(0,0,0,0.1)',
              zIndex: 100,
              overflow: 'hidden',
              padding: '4px 0',
            }}
          >
            <button
              onClick={() => { onDuplicate(); setShowMenu(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 14,
                color: '#374151',
              }}
            >
              <Copy className="w-4 h-4" />
              Duplicate
            </button>
            <button
              onClick={() => { setShowTypeSelector(true); setShowMenu(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 14,
                color: '#374151',
              }}
            >
              <ArrowRightLeft className="w-4 h-4" />
              Change type
            </button>
            <div style={{ height: 1, background: '#E5E7EB', margin: '4px 0' }} />
            <button
              onClick={() => { onDelete(); setShowMenu(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 14,
                color: '#EF4444',
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
// MAIN CANVAS COMPONENT
// ============================================================================

interface BlockCanvasProps {
  documentId: string
  initialBlocks?: Block[]
  onBlocksChange?: (blocks: Block[]) => void
}

export default function BlockCanvas({ 
  documentId, 
  initialBlocks,
  onBlocksChange,
}: BlockCanvasProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks || [
    { id: '1', type: 'static', content: '', status: 'default' }
  ])
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null)
  const [showNewBlockSelector, setShowNewBlockSelector] = useState(false)
  const [newBlockPosition, setNewBlockPosition] = useState<{ x: number; y: number } | null>(null)

  const generateId = () => Math.random().toString(36).substring(2, 9)

  const addBlock = useCallback((afterId?: string, type: BlockType = 'static') => {
    const newBlock: Block = {
      id: generateId(),
      type,
      content: '',
      status: 'default',
    }

    setBlocks(prev => {
      if (!afterId) {
        return [...prev, newBlock]
      }
      const index = prev.findIndex(b => b.id === afterId)
      const newBlocks = [...prev]
      newBlocks.splice(index + 1, 0, newBlock)
      return newBlocks
    })

    // Focus new block after render
    setTimeout(() => setActiveBlockId(newBlock.id), 50)
  }, [])

  const updateBlock = useCallback((id: string, content: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b))
  }, [])

  const deleteBlock = useCallback((id: string) => {
    setBlocks(prev => {
      if (prev.length === 1) {
        // Don't delete last block, just clear it
        return [{ ...prev[0], content: '' }]
      }
      return prev.filter(b => b.id !== id)
    })
  }, [])

  const duplicateBlock = useCallback((id: string) => {
    setBlocks(prev => {
      const index = prev.findIndex(b => b.id === id)
      const block = prev[index]
      const newBlock: Block = {
        ...block,
        id: generateId(),
      }
      const newBlocks = [...prev]
      newBlocks.splice(index + 1, 0, newBlock)
      return newBlocks
    })
  }, [])

  const changeBlockType = useCallback((id: string, type: BlockType) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, type } : b))
  }, [])

  // Notify parent of changes
  useEffect(() => {
    onBlocksChange?.(blocks)
  }, [blocks, onBlocksChange])

  return (
    <div style={{
      flex: 1,
      overflow: 'auto',
      background: '#FFFFFF',
    }}>
      {/* Styles */}
      <style>{`
        .block-editor-content {
          outline: none;
          font-size: 15px;
          line-height: 1.6;
          color: #374151;
        }
        
        .block-editor-content:focus {
          outline: none;
        }
        
        .block-editor-content p {
          margin: 0;
        }
        
        .block-editor-content h1 {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 4px 0;
          color: #111827;
        }
        
        .block-editor-content h2 {
          font-size: 22px;
          font-weight: 600;
          margin: 0 0 4px 0;
          color: #1F2937;
        }
        
        .block-editor-content h3 {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 4px 0;
          color: #374151;
        }
        
        .block-editor-content p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          float: left;
          height: 0;
          pointer-events: none;
        }
        
        .block-editor-content ul,
        .block-editor-content ol {
          margin: 0;
          padding-left: 24px;
        }
        
        .block-editor-content li {
          margin: 2px 0;
        }
        
        .block-editor-content blockquote {
          border-left: 3px solid #E5E7EB;
          margin: 0;
          padding-left: 16px;
          color: #6B7280;
        }
        
        .block-editor-content code {
          background: #F3F4F6;
          padding: 2px 4px;
          border-radius: 4px;
          font-size: 14px;
          font-family: 'SF Mono', Monaco, monospace;
        }
        
        .block-wrapper:hover {
          background: #FAFAFA;
        }
      `}</style>

      {/* Canvas content */}
      <div style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '48px 64px',
      }}>
        {/* Document title placeholder */}
        <div style={{
          marginBottom: 32,
          paddingBottom: 16,
          borderBottom: '1px solid #E5E7EB',
        }}>
          <input
            type="text"
            placeholder="Untitled Document"
            style={{
              width: '100%',
              fontSize: 36,
              fontWeight: 700,
              color: '#111827',
              border: 'none',
              outline: 'none',
              background: 'transparent',
            }}
          />
        </div>

        {/* Blocks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {blocks.map((block) => (
            <BlockEditor
              key={block.id}
              block={block}
              isActive={activeBlockId === block.id}
              onActivate={() => setActiveBlockId(block.id)}
              onUpdate={(content) => updateBlock(block.id, content)}
              onDelete={() => deleteBlock(block.id)}
              onDuplicate={() => duplicateBlock(block.id)}
              onChangeType={(type) => changeBlockType(block.id, type)}
              onAddBlockAfter={() => addBlock(block.id)}
            />
          ))}
        </div>

        {/* Add block hint at bottom */}
        <div 
          style={{
            marginTop: 16,
            padding: '8px 0',
            opacity: 0.5,
            cursor: 'pointer',
            fontSize: 14,
            color: '#9CA3AF',
          }}
          onClick={() => addBlock()}
        >
          Click to add a block, or press "/" for commands
        </div>
      </div>
    </div>
  )
}
