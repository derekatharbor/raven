// src/components/canvas/BlockCanvas.tsx
//
// Raven "Quiet" Workspace - Cursor for Documents
// Clean canvas, AI-integrated research, no visual clutter

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { 
  GripVertical, Plus, MoreHorizontal, Trash2, Copy, 
  X, Bold, Italic, Underline as UnderlineIcon,
  Atom, FileText, Send, Sparkles
} from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

interface Block {
  id: string
  content: string
}

interface Tab {
  id: string
  name: string
  hasChanges: boolean
  blocks: Block[]
  title: string
}

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
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6B7280', flexShrink: 0 }} />
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
// SELECTION TOOLBAR - Minimal: Format + Research (AI)
// ============================================================================

function SelectionToolbar({ position, isVisible, editor, selectedText, onResearch }: {
  position: { top: number; left: number } | null
  isVisible: boolean
  editor: any
  selectedText: string
  onResearch: (text: string) => void
}) {
  if (!isVisible || !position || !editor) return null

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  return (
    <div
      onMouseDown={handleMouseDown}
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
        background: '#1a1a1a',
        border: '1px solid #333',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
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
          background: editor.isActive('bold') ? 'rgba(255,255,255,0.15)' : 'transparent',
          color: editor.isActive('bold') ? '#fff' : '#999',
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
          background: editor.isActive('italic') ? 'rgba(255,255,255,0.15)' : 'transparent',
          color: editor.isActive('italic') ? '#fff' : '#999',
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
          background: editor.isActive('underline') ? 'rgba(255,255,255,0.15)' : 'transparent',
          color: editor.isActive('underline') ? '#fff' : '#999',
          cursor: 'pointer',
        }}
      >
        <UnderlineIcon className="w-4 h-4" />
      </button>

      <div style={{ width: 1, height: 20, background: '#444', margin: '0 6px' }} />

      <button
        onClick={() => onResearch(selectedText)}
        className="toolbar-research-btn"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 10px',
          borderRadius: 4,
          border: 'none',
          background: 'rgba(255,255,255,0.1)',
          color: '#fff',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        <Atom className="w-3.5 h-3.5" />
        Research
      </button>
    </div>
  )
}

// ============================================================================
// AI RESEARCH PANEL - Cursor-style chat interface
// ============================================================================

function ResearchPanel({ selectedText, onClose, isOpen }: {
  selectedText: string
  onClose: () => void
  isOpen: boolean
}) {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; context?: string }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = () => {
    if (!query.trim() && !selectedText) return

    const userMessage = {
      role: 'user' as const,
      content: query || 'Find sources for this claim',
      context: selectedText || undefined,
    }
    setMessages(prev => [...prev, userMessage])
    setQuery('')
    setIsLoading(true)

    // Mock AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Based on my search of connected sources:\n\n**SEC EDGAR (NVDA 10-Q, Q3 2024)**\nNVIDIA reported data center revenue of $14.51 billion, representing a 279% year-over-year increase.\n\n**Bloomberg Terminal**\nConfirms the $14.51B figure with additional context on AI chip demand driving growth.\n\nWould you like me to insert a citation or explore related metrics?`,
      }])
      setIsLoading(false)
    }, 1200)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const truncate = (text: string, max: number = 40) => 
    text.length <= max ? text : text.substring(0, max) + '...'

  return (
    <div 
      style={{
        width: 380,
        flexShrink: 0,
        borderLeft: '1px solid #E5E7EB',
        background: '#FAFAFA',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Atom className="w-4 h-4" style={{ color: '#6B7280' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Research</span>
        </div>
        <button
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            borderRadius: 4,
            border: 'none',
            background: 'transparent',
            color: '#6B7280',
            cursor: 'pointer',
          }}
          className="panel-close-btn"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF', fontSize: 13, lineHeight: 1.6 }}>
            <Sparkles className="w-8 h-8 mx-auto mb-3" style={{ color: '#D1D5DB' }} />
            Ask about your selection or<br />search connected sources
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map((msg, i) => (
              <div key={i}>
                {msg.context && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: 6, 
                      padding: '4px 8px', 
                      background: '#F3F4F6', 
                      borderRadius: 4,
                      fontSize: 12,
                      color: '#6B7280',
                    }}>
                      <FileText className="w-3 h-3" />
                      <span style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {truncate(msg.context, 30)}
                      </span>
                    </div>
                  </div>
                )}
                <div style={{ 
                  padding: '10px 12px', 
                  borderRadius: 8,
                  background: msg.role === 'user' ? '#111' : 'white',
                  color: msg.role === 'user' ? 'white' : '#111',
                  fontSize: 13,
                  lineHeight: 1.6,
                  border: msg.role === 'assistant' ? '1px solid #E5E7EB' : 'none',
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ 
                padding: '10px 12px', 
                borderRadius: 8, 
                background: 'white', 
                border: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <div className="loading-dots" style={{ display: 'flex', gap: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#9CA3AF', animation: 'pulse 1s infinite' }} />
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#9CA3AF', animation: 'pulse 1s infinite 0.2s' }} />
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#9CA3AF', animation: 'pulse 1s infinite 0.4s' }} />
                </div>
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>Searching sources...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #E5E7EB' }}>
        <div style={{ 
          background: 'white', 
          border: '1px solid #E5E7EB', 
          borderRadius: 8,
          overflow: 'hidden',
        }}>
          {/* Context badge */}
          {selectedText && messages.length === 0 && (
            <div style={{ padding: '8px 12px 0' }}>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 6, 
                padding: '4px 8px', 
                background: '#F3F4F6', 
                borderRadius: 4,
                fontSize: 12,
                color: '#374151',
              }}>
                <FileText className="w-3 h-3" style={{ color: '#6B7280' }} />
                <span style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {truncate(selectedText)}
                </span>
              </div>
            </div>
          )}
          
          <div style={{ display: 'flex', alignItems: 'flex-end', padding: '8px 12px', gap: 8 }}>
            <textarea
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your selection..."
              rows={2}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontSize: 13,
                lineHeight: 1.5,
                color: '#111',
                background: 'transparent',
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={!query.trim() && !selectedText}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 6,
                border: 'none',
                background: (query.trim() || selectedText) ? '#111' : '#E5E7EB',
                color: (query.trim() || selectedText) ? 'white' : '#9CA3AF',
                cursor: (query.trim() || selectedText) ? 'pointer' : 'default',
                flexShrink: 0,
              }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// BLOCK EDITOR - Clean, no rails
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
  onSelectionChange: (visible: boolean, pos: { top: number; left: number } | null, editor: any, text?: string) => void
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
        onSelectionChange(true, { top: start.top - 48, left: (start.left + end.left) / 2 }, editor, text.trim())
      } else {
        onSelectionChange(false, null, null, '')
      }
    },
    onBlur: () => setTimeout(() => onSelectionChange(false, null, null, ''), 150),
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
    <div 
      className="ghost-block" 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)} 
      style={{ position: 'relative', display: 'flex', alignItems: 'stretch' }}
    >
      {/* Left gutter */}
      <div style={{ width: 52, flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', paddingRight: 8, paddingTop: 4, gap: 2 }}>
        <button onClick={onAddBlockAfter} className="gutter-btn" style={gutterBtnStyle}>
          <Plus className="w-4 h-4" />
        </button>
        <button className="gutter-btn" style={{ ...gutterBtnStyle, cursor: 'grab' }}>
          <GripVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, paddingLeft: 12 }}>
        <EditorContent editor={editor} />
      </div>

      {/* Right menu */}
      <div style={{ width: 32, flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 4, position: 'relative' }}>
        <button onClick={() => setShowMenu(!showMenu)} className="gutter-btn" style={gutterBtnStyle}>
          <MoreHorizontal className="w-4 h-4" />
        </button>
        {showMenu && (
          <div ref={menuRef} style={{ position: 'absolute', top: 24, right: 0, width: 160, background: 'white', borderRadius: 8, border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', zIndex: 100, padding: '4px 0' }}>
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
// MAIN CANVAS
// ============================================================================

interface BlockCanvasProps {
  documentId: string
  documentTitle?: string
  initialTabs?: Tab[]
  onBlocksChange?: (blocks: Block[]) => void
}

const DEFAULT_TABS: Tab[] = [
  { 
    id: 'doc-1', 
    name: 'Q4 2024 Analysis', 
    hasChanges: false,
    title: 'Q4 2024 Investment Analysis',
    blocks: [
      { id: '1', content: '<p>Apple Inc. reported revenue of $119.6 billion for Q4 2024, representing a 6% increase year-over-year.</p>' },
      { id: '2', content: '<h2>Key Findings</h2>' },
      { id: '3', content: '<p>iPhone revenue reached $69.7 billion, up 5% from the prior year period. Services revenue grew to $23.1 billion, a 14% increase.</p>' },
      { id: '4', content: '<p>The company maintained healthy gross margins of 45.2% despite macroeconomic headwinds.</p>' },
      { id: '5', content: '' },
    ]
  },
  { 
    id: 'doc-2', 
    name: 'Due Diligence Report', 
    hasChanges: true,
    title: 'Series B Due Diligence',
    blocks: [
      { id: '1', content: '<h2>Executive Summary</h2>' },
      { id: '2', content: '<p>This report presents findings from our comprehensive due diligence review of the target company.</p>' },
      { id: '3', content: '<p>Key areas of focus include financial performance, market position, and technology assessment.</p>' },
      { id: '4', content: '' },
    ]
  },
]

export default function BlockCanvas({ 
  documentId, 
  documentTitle = '',
  initialTabs,
  onBlocksChange,
}: BlockCanvasProps) {
  const [tabs, setTabs] = useState<Tab[]>(initialTabs || DEFAULT_TABS)
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id || 'doc-1')
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null)
  
  // Toolbar state
  const [toolbarState, setToolbarState] = useState<{ 
    visible: boolean
    position: { top: number; left: number } | null
    editor: any
    selectedText: string
  }>({ visible: false, position: null, editor: null, selectedText: '' })
  
  // Research panel state
  const [researchOpen, setResearchOpen] = useState(false)
  const [researchText, setResearchText] = useState('')

  // Get active tab data
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0]
  const blocks = activeTab?.blocks || []
  const title = activeTab?.title || ''

  const generateId = () => Math.random().toString(36).substring(2, 9)

  // Tab handlers
  const handleTabSelect = useCallback((id: string) => {
    setActiveTabId(id)
    setResearchOpen(false)
    setToolbarState({ visible: false, position: null, editor: null, selectedText: '' })
  }, [])

  const handleNewTab = useCallback(() => {
    const newTab: Tab = {
      id: `doc-${Date.now()}`,
      name: 'Untitled',
      hasChanges: false,
      title: '',
      blocks: [{ id: generateId(), content: '' }],
    }
    setTabs(prev => [...prev, newTab])
    setActiveTabId(newTab.id)
  }, [])

  const handleCloseTab = useCallback((id: string) => {
    if (tabs.length === 1) return
    const newTabs = tabs.filter(t => t.id !== id)
    setTabs(newTabs)
    if (activeTabId === id) setActiveTabId(newTabs[0].id)
  }, [tabs, activeTabId])

  // Block handlers
  const updateBlocks = useCallback((newBlocks: Block[]) => {
    setTabs(prev => prev.map(t => 
      t.id === activeTabId ? { ...t, blocks: newBlocks, hasChanges: true } : t
    ))
  }, [activeTabId])

  const updateTitle = useCallback((newTitle: string) => {
    setTabs(prev => prev.map(t => 
      t.id === activeTabId ? { ...t, title: newTitle, name: newTitle || 'Untitled' } : t
    ))
  }, [activeTabId])

  const addBlock = useCallback((afterId?: string) => {
    const newBlock: Block = { id: generateId(), content: '' }
    const newBlocks = afterId 
      ? blocks.flatMap(b => b.id === afterId ? [b, newBlock] : [b])
      : [...blocks, newBlock]
    updateBlocks(newBlocks)
    setTimeout(() => setFocusedBlockId(newBlock.id), 50)
  }, [blocks, updateBlocks])

  const updateBlock = useCallback((id: string, content: string) => {
    updateBlocks(blocks.map(b => b.id === id ? { ...b, content } : b))
  }, [blocks, updateBlocks])

  const deleteBlock = useCallback((id: string) => {
    if (blocks.length === 1) {
      updateBlocks([{ ...blocks[0], content: '' }])
    } else {
      updateBlocks(blocks.filter(b => b.id !== id))
    }
  }, [blocks, updateBlocks])

  const focusPreviousBlock = useCallback((currentId: string) => {
    const index = blocks.findIndex(b => b.id === currentId)
    if (index > 0) setFocusedBlockId(blocks[index - 1].id)
  }, [blocks])

  const duplicateBlock = useCallback((id: string) => {
    const index = blocks.findIndex(b => b.id === id)
    const newBlock = { ...blocks[index], id: generateId() }
    const newBlocks = [...blocks]
    newBlocks.splice(index + 1, 0, newBlock)
    updateBlocks(newBlocks)
  }, [blocks, updateBlocks])

  // Research handler
  const handleResearch = useCallback((text: string) => {
    setResearchText(text)
    setResearchOpen(true)
    setToolbarState(prev => ({ ...prev, visible: false }))
  }, [])

  useEffect(() => { onBlocksChange?.(blocks) }, [blocks, onBlocksChange])

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'white' }}>
      <style>{`
        .ghost-block-content { 
          outline: none; 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          font-size: 15px; 
          line-height: 1.7; 
          color: #1a1a1a; 
        }
        .ghost-block-content:focus { outline: none; }
        .ghost-block-content p { margin: 0; }
        .ghost-block-content h1 { font-size: 28px; font-weight: 600; margin: 0 0 12px 0; line-height: 1.3; color: #111; }
        .ghost-block-content h2 { font-size: 20px; font-weight: 600; margin: 20px 0 8px 0; line-height: 1.35; color: #111; }
        .ghost-block-content h3 { font-size: 16px; font-weight: 600; margin: 16px 0 6px 0; line-height: 1.4; color: #222; }
        .ghost-block-content p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #B0B0B0; float: left; height: 0; pointer-events: none; }
        .ghost-block-content ul, .ghost-block-content ol { margin: 0; padding-left: 24px; }
        .ghost-block-content li { margin: 4px 0; }
        .ghost-block-content blockquote { border-left: 2px solid #E0E0E0; margin: 12px 0; padding-left: 16px; color: #555; font-style: italic; }
        .ghost-block-content strong { font-weight: 600; }
        .ghost-block-content code { background: #F5F5F5; padding: 2px 5px; border-radius: 3px; font-size: 13px; font-family: 'SF Mono', Monaco, monospace; color: #333; }
        
        .gutter-btn:hover { background: #F3F4F6 !important; color: #374151 !important; }
        .toolbar-btn:hover { background: rgba(255,255,255,0.2) !important; color: #fff !important; }
        .toolbar-research-btn:hover { background: rgba(255,255,255,0.2) !important; }
        .menu-item:hover { background: #F5F5F5; }
        .menu-item-danger:hover { background: #FEF2F2; }
        .panel-close-btn:hover { background: #F3F4F6; }
        .tab-close-btn:hover { background: rgba(0,0,0,0.08); color: #374151; }
        .tab-add-btn:hover { background: rgba(0,0,0,0.05); color: #6B7280; }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        
        @media print {
          .gutter-btn, .tab-close-btn, .tab-add-btn { display: none !important; }
          .ghost-block > div:first-child { display: none !important; }
        }
      `}</style>

      <EditorTabs 
        tabs={tabs} 
        activeTabId={activeTabId} 
        onTabSelect={handleTabSelect}
        onTabClose={handleCloseTab}
        onNewTab={handleNewTab}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Main editor area */}
        <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 32px 120px' }}>
            {/* Document title */}
            <div style={{ marginBottom: 32, paddingLeft: 64 }}>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => updateTitle(e.target.value)} 
                placeholder="Untitled" 
                style={{ 
                  width: '100%', 
                  fontSize: 32, 
                  fontWeight: 600, 
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
                  color: '#111', 
                  border: 'none', 
                  outline: 'none', 
                  background: 'transparent',
                  letterSpacing: '-0.02em',
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
                  onSelectionChange={(visible, pos, editor, text) => setToolbarState({ visible, position: pos, editor, selectedText: text || '' })} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* Research Panel */}
        {researchOpen && (
          <ResearchPanel
            selectedText={researchText}
            onClose={() => setResearchOpen(false)}
            isOpen={researchOpen}
          />
        )}

        {/* Selection Toolbar */}
        <SelectionToolbar 
          position={toolbarState.position} 
          isVisible={toolbarState.visible} 
          editor={toolbarState.editor}
          selectedText={toolbarState.selectedText}
          onResearch={handleResearch}
        />
      </div>
    </div>
  )
}