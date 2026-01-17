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
  Atom, ArrowUp, Type, Heading1, Heading2, List, Quote,
  Eye, Table, BarChart3, Link2, Variable, Radio,
  Search, PenLine, Radar, ChevronDown, MessageSquare, Sparkles, Bug
} from 'lucide-react'
import { createPortal } from 'react-dom'

// ============================================================================
// TOOLTIP COMPONENT - renders via portal to escape overflow:hidden
// ============================================================================

function Tooltip({ children, label }: { children: React.ReactNode; label: string }) {
  const [show, setShow] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({ top: rect.top - 36, left: rect.left + rect.width / 2 })
      setShow(true)
    }
  }

  return (
    <div 
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShow(false)}
      style={{ display: 'inline-flex' }}
    >
      {children}
      {show && typeof document !== 'undefined' && createPortal(
        <div style={{
          position: 'fixed',
          top: position.top,
          left: position.left,
          transform: 'translateX(-50%)',
          padding: '6px 10px',
          background: '#1a1a1a',
          color: 'white',
          fontSize: 11,
          fontWeight: 500,
          borderRadius: 6,
          whiteSpace: 'nowrap',
          zIndex: 9999,
          pointerEvents: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>
          {label}
        </div>,
        document.body
      )}
    </div>
  )
}

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
// AI RESEARCH PANEL - Input at top, always accessible
// ============================================================================

function ResearchPanel({ selectedText, onClose }: {
  selectedText: string
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; context?: string }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<'ask' | 'agent' | 'plan' | 'verify'>('ask')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const modes = {
    ask: { label: 'Ask', icon: MessageSquare, color: '#22C55E', desc: 'Ask questions' },
    agent: { label: 'Agent', icon: Sparkles, color: '#8B5CF6', desc: 'Deploy agent' },
    plan: { label: 'Plan', icon: List, color: '#3B82F6', desc: 'Plan steps' },
    verify: { label: 'Verify', icon: Bug, color: '#F59E0B', desc: 'Check claims' },
  }

  const currentMode = modes[mode]

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

    const responses: Record<string, string> = {
      ask: `Based on my search of connected sources:\n\n**SEC EDGAR (NVDA 10-Q, Q3 2024)**\nNVIDIA reported data center revenue of $14.51 billion, representing a 279% year-over-year increase.\n\n**Bloomberg Terminal**\nConfirms the $14.51B figure with additional context on AI chip demand driving growth.`,
      agent: `**Agent deployed** - searching 3 connected sources...\n\n✓ SEC EDGAR - Found 2 relevant filings\n✓ Bloomberg - 4 matching articles\n✓ Internal docs - 1 related memo\n\nCompiling findings into a structured summary...`,
      plan: `**Verification Plan:**\n\n1. Cross-reference revenue figure with 10-Q filing\n2. Check Bloomberg for analyst consensus\n3. Compare with previous quarter guidance\n4. Flag any discrepancies for review\n\nReady to execute? Type "go" to proceed.`,
      verify: `**Verification Results:**\n\n✓ **$14.51B revenue** - Matches SEC filing (NVDA 10-Q, pg 23)\n⚠️ **279% YoY growth** - Source says 279%, claim says 280%\n✓ **Data center segment** - Correctly attributed\n\n1 discrepancy found. Would you like to update?`,
    }

    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: responses[mode],
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

  const truncate = (text: string, max: number = 35) => 
    text.length <= max ? text : text.substring(0, max) + '...'

  return (
    <div 
      style={{
        width: 340,
        flexShrink: 0,
        borderLeft: '1px solid #E5E7EB',
        background: '#FAFAFA',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Mode Tabs - Figma style */}
      <div style={{ 
        display: 'flex',
        borderBottom: '1px solid #E5E7EB',
        background: 'white',
      }}>
        {Object.entries(modes).map(([key, m]) => {
          const Icon = m.icon
          const isActive = mode === key
          return (
            <button
              key={key}
              onClick={() => setMode(key as typeof mode)}
              className="mode-tab-btn"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '12px 8px',
                border: 'none',
                background: 'transparent',
                color: isActive ? m.color : '#9CA3AF',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 500,
                borderBottom: isActive ? `2px solid ${m.color}` : '2px solid transparent',
                marginBottom: -1,
                transition: 'all 0.15s ease',
              }}
            >
              <Icon className="w-4 h-4" />
              {m.label}
            </button>
          )
        })}
      </div>

      {/* Sources section */}
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid #E5E7EB',
        background: 'white',
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Connected Sources
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {['SEC EDGAR', 'Bloomberg Terminal', 'Internal Docs'].map((source, i) => (
            <div key={i} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8,
              padding: '6px 8px',
              background: '#F5F5F5',
              borderRadius: 6,
              fontSize: 12,
              color: '#374151',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
              {source}
            </div>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB' }}>
        {/* Context badge */}
        {selectedText && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 6, 
              padding: '4px 10px', 
              background: '#DCFCE7',
              borderRadius: 999,
              fontSize: 11,
              color: '#166534',
              fontWeight: 500,
            }}>
              <Atom className="w-3 h-3" style={{ color: '#22C55E' }} />
              <span style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {truncate(selectedText, 30)}
              </span>
              <button
                onClick={onClose}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: 14, 
                  height: 14, 
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(0,0,0,0.1)',
                  color: '#166534',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        )}
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-end', 
          gap: 8,
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: 8,
          padding: '10px 12px',
        }}>
          <textarea
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`${currentMode.desc}...`}
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
            className="send-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 6,
              border: 'none',
              background: (query.trim() || selectedText) ? currentMode.color : '#E5E7EB',
              color: (query.trim() || selectedText) ? 'white' : '#9CA3AF',
              cursor: (query.trim() || selectedText) ? 'pointer' : 'default',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages / History */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF', fontSize: 13, lineHeight: 1.6 }}>
            {mode === 'ask' && 'Ask questions about your connected sources'}
            {mode === 'agent' && 'Deploy an agent to research across sources'}
            {mode === 'plan' && 'Create a verification plan for your claims'}
            {mode === 'verify' && 'Verify specific claims against sources'}
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
                      padding: '4px 10px', 
                      background: '#DCFCE7',
                      borderRadius: 999,
                      fontSize: 11,
                      color: '#166534',
                      fontWeight: 500,
                    }}>
                      <Atom className="w-3 h-3" style={{ color: '#22C55E' }} />
                      <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {truncate(msg.context, 25)}
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
    </div>
  )
}

// ============================================================================
// BLOCK SELECTOR MODAL - Notion-style block type picker
// ============================================================================

function BlockSelectorModal({ position, onSelect, onClose }: {
  position: { top?: number; bottom?: number; left: number }
  onSelect: (type: string) => void
  onClose: () => void
}) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const sections = [
    {
      title: 'Suggested',
      items: [
        { id: 'ai-research', label: 'AI Research', icon: Atom, description: 'Search sources with AI', color: '#22C55E' },
      ]
    },
    {
      title: 'Basic blocks',
      items: [
        { id: 'text', label: 'Text', icon: Type, description: 'Plain text block' },
        { id: 'h1', label: 'Heading 1', icon: Heading1, description: 'Large section heading' },
        { id: 'h2', label: 'Heading 2', icon: Heading2, description: 'Medium section heading' },
        { id: 'list', label: 'Bullet List', icon: List, description: 'Simple bullet list' },
        { id: 'quote', label: 'Quote', icon: Quote, description: 'Quoted text' },
        { id: 'table', label: 'Table', icon: Table, description: 'Add a table' },
      ]
    },
    {
      title: 'Smart blocks',
      items: [
        { id: 'exec-summary', label: 'AI Executive Summary', icon: Atom, description: 'Auto-generated from document', color: '#22C55E' },
        { id: 'citation', label: 'Citation', icon: Link2, description: 'Formatted source reference' },
        { id: 'data-variable', label: 'Data Variable', icon: Variable, description: 'Live value from source' },
        { id: 'signal-monitor', label: 'Signal Monitor', icon: Radio, description: 'Track external changes' },
        { id: 'chart', label: 'Chart', icon: BarChart3, description: 'Visualize data' },
      ]
    },
  ]

  return (
    <div
      ref={modalRef}
      style={{
        position: 'fixed',
        top: position.top,
        bottom: position.bottom,
        left: position.left,
        width: 320,
        maxHeight: 400,
        background: 'white',
        borderRadius: 12,
        border: '1px solid #E5E7EB',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        zIndex: 1100,
      }}
    >
      {/* Search input */}
      <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid #F3F4F6' }}>
        <input
          type="text"
          placeholder="Search blocks..."
          autoFocus
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: 13,
            color: '#111',
            border: '1px solid #E5E7EB',
            borderRadius: 6,
            outline: 'none',
            background: 'white',
          }}
        />
      </div>

      {/* Block options */}
      <div style={{ maxHeight: 320, overflow: 'auto', padding: '8px 0' }}>
        {sections.map((section) => (
          <div key={section.title}>
            <div style={{ 
              padding: '8px 16px 4px', 
              fontSize: 11, 
              fontWeight: 600, 
              color: '#9CA3AF',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {section.title}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => { onSelect(item.id); onClose() }}
                  className="block-option"
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
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: item.color ? `${item.color}15` : '#F3F4F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon className="w-5 h-5" style={{ color: item.color || '#6B7280' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#111' }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 1 }}>{item.description}</div>
                  </div>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

function BlockEditor({ block, isFirst, isFocused, onFocus, onUpdate, onDelete, onDuplicate, onAddBlockAfter, onSelectionChange }: {
  block: Block
  isFirst: boolean
  isFocused: boolean
  onFocus: () => void
  onUpdate: (content: string) => void
  onDelete: () => void
  onDuplicate: () => void
  onAddBlockAfter: (type?: string) => void
  onSelectionChange: (visible: boolean, pos: { top: number; left: number } | null, editor: any, text?: string) => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showBlockSelector, setShowBlockSelector] = useState(false)
  const [selectorPosition, setSelectorPosition] = useState({ top: 0, left: 0 })
  const menuRef = useRef<HTMLDivElement>(null)
  const plusBtnRef = useRef<HTMLButtonElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Placeholder.configure({ 
        placeholder: "Write, press 'space' for AI, '/' for commands...", 
        showOnlyWhenEditable: true, 
        showOnlyCurrent: true 
      }),
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
  }, []) // Empty deps - editor created once per mount

  // Sync editor content when block.content changes from external source (tab switch)
  useEffect(() => {
    if (editor && block.content !== editor.getHTML()) {
      editor.commands.setContent(block.content)
    }
  }, [block.content, editor])

  // Focus this editor when isFocused becomes true
  useEffect(() => {
    if (isFocused && editor) {
      // Small delay to ensure React render is complete
      const timer = setTimeout(() => {
        editor.commands.focus('end')
      }, 10)
      return () => clearTimeout(timer)
    }
  }, [isFocused, editor])

  const handlePlusClick = () => {
    if (plusBtnRef.current) {
      const rect = plusBtnRef.current.getBoundingClientRect()
      setSelectorPosition({ top: rect.bottom + 8, left: rect.left })
      setShowBlockSelector(true)
    }
  }

  const handleBlockSelect = (type: string) => {
    onAddBlockAfter(type)
    setShowBlockSelector(false)
  }

  useEffect(() => {
    if (!editor) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Backspace' && editor.isEmpty) { 
        event.preventDefault()
        onDelete() // deleteBlock now handles focus
      }
      if (event.key === 'Enter' && !event.shiftKey && editor.isEmpty) { 
        event.preventDefault()
        onAddBlockAfter() 
      }
    }
    const el = editor.view.dom
    el.addEventListener('keydown', handleKeyDown)
    return () => el.removeEventListener('keydown', handleKeyDown)
  }, [editor, onDelete, onAddBlockAfter])

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
        <button ref={plusBtnRef} onClick={handlePlusClick} className="gutter-btn" style={gutterBtnStyle}>
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

      {/* Block Selector Modal */}
      {showBlockSelector && (
        <BlockSelectorModal
          position={selectorPosition}
          onSelect={handleBlockSelect}
          onClose={() => setShowBlockSelector(false)}
        />
      )}
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
      { id: 'd1-1', content: '<p>Apple Inc. reported revenue of $119.6 billion for Q4 2024, representing a 6% increase year-over-year.</p>' },
      { id: 'd1-2', content: '<h2>Key Findings</h2>' },
      { id: 'd1-3', content: '<p>iPhone revenue reached $69.7 billion, up 5% from the prior year period. Services revenue grew to $23.1 billion, a 14% increase.</p>' },
      { id: 'd1-4', content: '<p>The company maintained healthy gross margins of 45.2% despite macroeconomic headwinds.</p>' },
      { id: 'd1-5', content: '' },
    ]
  },
  { 
    id: 'doc-2', 
    name: 'Due Diligence Report', 
    hasChanges: true,
    title: 'Series B Due Diligence',
    blocks: [
      { id: 'd2-1', content: '<h2>Executive Summary</h2>' },
      { id: 'd2-2', content: '<p>This report presents findings from our comprehensive due diligence review of the target company.</p>' },
      { id: 'd2-3', content: '<p>Key areas of focus include financial performance, market position, and technology assessment.</p>' },
      { id: 'd2-4', content: '' },
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
  const [researchText, setResearchText] = useState('')
  
  // Audit mode state
  const [auditMode, setAuditMode] = useState(false)
  
  // Block tray state
  const [showBlockTray, setShowBlockTray] = useState(false)

  // Get active tab data
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0]
  const blocks = activeTab?.blocks || []
  const title = activeTab?.title || ''

  const generateId = () => Math.random().toString(36).substring(2, 9)

  // Tab handlers
  const handleTabSelect = useCallback((id: string) => {
    setActiveTabId(id)
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

  const addBlock = useCallback((afterId?: string, blockType?: string) => {
    // TODO: Handle different block types
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
      // Can't delete last block, just clear it
      updateBlocks([{ ...blocks[0], content: '' }])
      setFocusedBlockId(blocks[0].id)
    } else {
      // Find the index of block being deleted
      const index = blocks.findIndex(b => b.id === id)
      // Focus the previous block (or first if deleting first)
      const focusIndex = index > 0 ? index - 1 : 0
      const focusId = blocks[focusIndex]?.id
      if (focusId && focusId !== id) {
        setFocusedBlockId(focusId)
      }
      updateBlocks(blocks.filter(b => b.id !== id))
    }
  }, [blocks, updateBlocks])

  const focusPreviousBlock = useCallback((currentId: string) => {
    const index = blocks.findIndex(b => b.id === currentId)
    if (index > 0) {
      setFocusedBlockId(blocks[index - 1].id)
    }
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
        .floating-toolbar-btn:hover { background: #F3F4F6 !important; }
        .block-option:hover { background: #F5F5F5 !important; }
        .panel-close-btn:hover { background: #F3F4F6 !important; color: #374151 !important; }
        .sources-dropdown-btn:hover { background: #F3F4F6 !important; border-color: #D1D5DB !important; }
        .send-btn:hover { opacity: 0.9; }
        .mode-selector-btn:hover { background: #F3F4F6 !important; }
        .mode-option:hover { background: #F5F5F5 !important; }
        .dock-mode-btn:hover { background: rgba(0,0,0,0.08) !important; }
        .mode-tab-btn:hover { background: #F5F5F5 !important; }
        
        /* Audit Mode - Signal Highlights (Grammarly-style: faint bg + underline) */
        .signal-blue { 
          background: rgba(96, 165, 250, 0.12); 
          border-bottom: 2px solid #3B82F6;
          transition: background 0.15s ease;
        }
        .signal-blue:hover { 
          background: rgba(96, 165, 250, 0.25); 
          cursor: pointer;
        }
        .signal-amber { 
          background: rgba(251, 191, 36, 0.12); 
          border-bottom: 2px solid #F59E0B;
          transition: background 0.15s ease;
        }
        .signal-amber:hover { 
          background: rgba(251, 191, 36, 0.25); 
          cursor: pointer;
        }
        .signal-red { 
          background: rgba(248, 113, 113, 0.12); 
          border-bottom: 2px solid #EF4444;
          transition: background 0.15s ease;
        }
        .signal-red:hover { 
          background: rgba(248, 113, 113, 0.25); 
          cursor: pointer;
        }
        
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
                  key={`${activeTabId}-${block.id}`} 
                  block={block} 
                  isFirst={index === 0 && !title}
                  isFocused={focusedBlockId === block.id}
                  onFocus={() => setFocusedBlockId(block.id)} 
                  onUpdate={(content) => updateBlock(block.id, content)} 
                  onDelete={() => deleteBlock(block.id)} 
                  onDuplicate={() => duplicateBlock(block.id)} 
                  onAddBlockAfter={() => addBlock(block.id)} 
                  onSelectionChange={(visible, pos, editor, text) => setToolbarState({ visible, position: pos, editor, selectedText: text || '' })} 
                />
              ))}
            </div>

            {/* Clickable empty space to add block - only if last block has content */}
            <div 
              onClick={() => {
                const lastBlock = blocks[blocks.length - 1]
                // Check if last block has actual content (not empty or just empty paragraph tag)
                const hasContent = lastBlock?.content && 
                  lastBlock.content !== '' && 
                  lastBlock.content !== '<p></p>' &&
                  lastBlock.content.replace(/<[^>]*>/g, '').trim() !== ''
                if (hasContent) {
                  addBlock(lastBlock.id)
                }
              }}
              style={{ 
                minHeight: 200, 
                cursor: 'text',
                marginLeft: 64,
              }}
            />
          </div>
        </div>

        {/* Right Side Panel - ALWAYS visible like Figma */}
        <ResearchPanel
          selectedText={researchText}
          onClose={() => setResearchText('')}
        />

        {/* Floating Dock - Glassmorphism */}
        <div style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: 12,
          boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)',
        }}>
          {/* Left section - Tools */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px' }}>
            {/* Block Tray */}
            <Tooltip label="Insert Block">
            <button
              onClick={() => setShowBlockTray(!showBlockTray)}
              className="floating-toolbar-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 8,
                border: 'none',
                background: showBlockTray ? '#E5E7EB' : 'transparent',
                color: showBlockTray ? '#111' : '#6B7280',
                cursor: 'pointer',
              }}
            >
              <Plus className="w-5 h-5" />
            </button>
            </Tooltip>
            
            {/* Active Signals */}
            <Tooltip label="Active Signals">
            <button
              className="floating-toolbar-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 8,
                border: 'none',
                background: 'transparent',
                color: '#6B7280',
                cursor: 'pointer',
              }}
            >
              <Radar className="w-5 h-5" />
            </button>
            </Tooltip>
          </div>
          
          {/* Separator */}
          <div style={{ width: 1, height: 28, background: 'rgba(0,0,0,0.1)' }} />
          
          {/* Right section - Mode Switcher (Segmented Control) */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '6px 10px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(0,0,0,0.06)',
              borderRadius: 8,
              padding: 2,
            }}>
              <button
                onClick={() => setAuditMode(false)}
                className={!auditMode ? '' : 'dock-mode-btn'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: !auditMode ? 'white' : 'transparent',
                  color: !auditMode ? '#111' : '#6B7280',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                  boxShadow: !auditMode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <PenLine className="w-4 h-4" />
                Drafting
              </button>
              <button
                onClick={() => setAuditMode(true)}
                className={auditMode ? '' : 'dock-mode-btn'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: auditMode ? 'white' : 'transparent',
                  color: auditMode ? '#111' : '#6B7280',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                  boxShadow: auditMode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <Eye className="w-4 h-4" />
                Audit
              </button>
            </div>
          </div>
        </div>

        {/* Block Tray Modal - opens ABOVE dock */}
        {showBlockTray && (
          <BlockSelectorModal
            position={{ bottom: 80, left: window.innerWidth / 2 - 160 }}
            onSelect={(type) => {
              addBlock(blocks[blocks.length - 1]?.id, type)
              setShowBlockTray(false)
            }}
            onClose={() => setShowBlockTray(false)}
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