// Path: src/components/canvas/BlockCanvas.tsx
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
import Image from '@tiptap/extension-image'
import ReactMarkdown from 'react-markdown'
import { 
  GripVertical, Plus, MoreHorizontal, Trash2, Copy, 
  X, Bold, Italic, Underline as UnderlineIcon,
  Atom, ArrowUp, Type, Heading1, Heading2, List, Quote,
  Eye, Table, BarChart3, Link2, Variable, Radio, ImageIcon,
  Search, PenLine, Radar, ChevronDown, ChevronRight, ChevronLeft,
  Folder, FolderOpen, FileText, Database, Check, AlertTriangle, XCircle,
  RefreshCw, Wifi, WifiOff, Globe, PanelRightClose, PanelRight, Share2
} from 'lucide-react'
import { createPortal } from 'react-dom'
import PublishModal from '@/components/publish/PublishModal'
import { uploadImage } from '@/lib/storage/upload'

// ============================================================================
// RAVEN SPINNER - Logo rotates 90 degrees at a time
// ============================================================================

function RavenSpinner({ size = 32 }: { size?: number }) {
  const [rotation, setRotation] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => prev + 90)
    }, 300)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <img 
      src="/images/raven-logo.png" 
      alt="Loading" 
      style={{ 
        width: size, 
        height: size, 
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 0.3s ease',
      }} 
    />
  )
}

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
// INSERTABLE FINDING - hover to reveal insert button
// ============================================================================

// Helper to extract text from React children
function extractTextFromChildren(children: React.ReactNode): string {
  if (typeof children === 'string') return children
  if (typeof children === 'number') return String(children)
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join('')
  }
  // Handle React elements
  if (children && typeof children === 'object') {
    const element = children as { props?: { children?: React.ReactNode } }
    if (element.props?.children) {
      return extractTextFromChildren(element.props.children)
    }
  }
  return ''
}

function InsertableFinding({ children, text, onInsert }: { 
  children: React.ReactNode
  text: string
  onInsert: () => void 
}) {
  const [isHovered, setIsHovered] = useState(false)
  
  // Don't show insert for very short text
  if (text.trim().length < 10) {
    return <>{children}</>
  }
  
  return (
    <div 
      style={{ position: 'relative' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{
        background: isHovered ? 'rgba(34, 197, 94, 0.06)' : 'transparent',
        borderRadius: 4,
        margin: '-2px -4px',
        padding: '2px 4px',
        transition: 'background 0.15s ease',
      }}>
        {children}
      </div>
      
      {isHovered && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onInsert()
          }}
          style={{
            position: 'absolute',
            right: -28,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 22,
            height: 22,
            borderRadius: 4,
            border: '1px solid #D1D5DB',
            background: 'white',
            color: '#22C55E',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'all 0.1s ease',
          }}
          className="finding-insert-btn"
          title="Insert into document (Tab to accept)"
        >
          <Plus className="w-3 h-3" />
        </button>
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
  name: string // Display name (can be custom or inherited from title)
  hasCustomName?: boolean // True if user manually renamed the tab
  hasChanges: boolean
  blocks: Block[]
  title: string // Document title (saved to DB)
}

// ============================================================================
// TABS WITH RAVEN FAVICON
// ============================================================================

function EditorTabs({ tabs, activeTabId, onTabSelect, onTabClose, onNewTab, onShare, onTabRename }: {
  tabs: Tab[]
  activeTabId: string
  onTabSelect: (id: string) => void
  onTabClose: (id: string) => void
  onNewTab: () => void
  onShare: () => void
  onTabRename?: (id: string, name: string) => void
}) {
  const [editingTabId, setEditingTabId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDoubleClick = (tab: Tab) => {
    setEditingTabId(tab.id)
    setEditValue(tab.name || 'Untitled')
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const handleRenameSubmit = (tabId: string) => {
    if (editValue.trim() && onTabRename) {
      onTabRename(tabId, editValue.trim())
    }
    setEditingTabId(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent, tabId: string) => {
    if (e.key === 'Enter') {
      handleRenameSubmit(tabId)
    } else if (e.key === 'Escape') {
      setEditingTabId(null)
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      height: 44,
      borderBottom: '1px solid #E5E7EB',
      background: '#FBF9F7',
      paddingLeft: 8,
      paddingRight: 8,
      gap: 1,
    }}>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => editingTabId !== tab.id && onTabSelect(tab.id)}
          onDoubleClick={() => handleDoubleClick(tab)}
          className="editor-tab"
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
            transition: 'background 0.15s ease',
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
          {editingTabId === tab.id ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => handleRenameSubmit(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 13,
                fontWeight: 500,
                color: '#111',
                width: `${Math.max(editValue.length, 6)}ch`,
                minWidth: '6ch',
                maxWidth: 150,
              }}
              autoFocus
            />
          ) : (
            <span style={{ 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              color: tab.name ? undefined : '#9CA3AF', // Faded grey for untitled
              fontStyle: tab.name ? undefined : 'italic',
            }}>
              {tab.name || 'Untitled'}
            </span>
          )}
          {tab.hasChanges && editingTabId !== tab.id && (
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6B7280', flexShrink: 0 }} />
          )}
          {tabs.length > 1 && editingTabId !== tab.id && (
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
                transition: 'background 0.15s ease, color 0.15s ease',
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
          transition: 'background 0.15s ease, color 0.15s ease',
        }}
      >
        <Plus className="w-4 h-4" />
      </button>
      
      {/* Spacer */}
      <div style={{ flex: 1 }} />
      
      {/* Share Button */}
      <button
        onClick={onShare}
        className="share-btn"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 14px',
          borderRadius: 6,
          border: 'none',
          background: '#111',
          color: 'white',
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 500,
          transition: 'background 0.15s ease',
        }}
      >
        <Share2 className="w-3.5 h-3.5" />
        Share
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

// ============================================================================
// INTELLIGENCE HUB - Collapsible side panel with AI Research + Audit + Sources
// ============================================================================

function IntelligenceHub({ 
  selectedText, 
  onClearSelection, 
  auditMode, 
  isCollapsed, 
  onToggleCollapse,
  onInsertText,
  onTrackClaim,
}: {
  selectedText: string
  onClearSelection: () => void
  auditMode: boolean
  isCollapsed: boolean
  onToggleCollapse: () => void
  onInsertText: (text: string) => void
  onTrackClaim: (claim: string, source?: string) => void
}) {
  const [activeTab, setActiveTab] = useState<'research' | 'audit' | 'sources'>('research')
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; context?: string; sources?: string[] }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<'ask' | 'verify'>('ask')
  const [webEnabled, setWebEnabled] = useState(false)
  const [showModeDropdown, setShowModeDropdown] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const modeDropdownRef = useRef<HTMLDivElement>(null)

  const tabs = [
    { id: 'research' as const, icon: Atom, label: 'Research' },
    { id: 'audit' as const, icon: BarChart3, label: 'Audit' },
    { id: 'sources' as const, icon: Folder, label: 'Sources' },
  ]

  const modes = {
    ask: { label: 'Ask', color: '#10B981', desc: 'Research' },
    verify: { label: 'Verify', color: '#F59E0B', desc: 'Check claims' },
  }

  const currentMode = modes[mode]

  // Mock data
  const sources = [
    { id: 'sec-edgar', name: 'SEC EDGAR', status: 'connected' as const, count: 3 },
    { id: 'bloomberg', name: 'Bloomberg', status: 'connected' as const, count: 2 },
    { id: 'internal', name: 'Internal Docs', status: 'syncing' as const, count: 1 },
  ]

  const integrityCards = [
    { id: 'ic-1', claim: 'Data center revenue of $14.51B', source: 'NVDA 10-Q', status: 'verified' as const },
    { id: 'ic-2', claim: '279% YoY increase', source: 'NVDA 10-Q', status: 'drift' as const, note: 'Doc says 280%' },
    { id: 'ic-3', claim: 'AI chip demand driving growth', source: 'Bloomberg', status: 'monitoring' as const },
  ]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(e.target as Node)) {
        setShowModeDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = async () => {
    if (!query.trim() && !selectedText) return

    const userMessage = { role: 'user' as const, content: query || 'Analyze this text', context: selectedText || undefined }
    setMessages(prev => [...prev, userMessage])
    setQuery('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          mode,
          webEnabled,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '⚠️ Sorry, I encountered an error. Please check that the API keys are configured correctly.' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  // Single container with animated width
  return (
    <div style={{
      width: isCollapsed ? 48 : 340,
      flexShrink: 0,
      borderLeft: '1px solid #E5E7EB',
      background: 'white',
      display: 'flex',
      transition: 'width 0.2s ease',
      overflow: 'hidden',
    }}>
      {/* Vertical Icon Strip - always visible */}
      <div style={{
        width: 48,
        minWidth: 48,
        borderRight: isCollapsed ? 'none' : '1px solid #F3F4F6',
        background: '#FAFAFA',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 8,
        gap: 4,
      }}>
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => isCollapsed ? onToggleCollapse() : setActiveTab(tab.id)}
              className="side-tab-btn"
              style={{
                width: 36, height: 36, borderRadius: 8, border: 'none',
                background: isActive ? 'white' : 'transparent',
                color: isActive ? '#111' : '#6B7280',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <Icon className="w-[18px] h-[18px]" />
            </button>
          )
        })}
        
        {/* Collapse/Expand button at bottom */}
        <div style={{ flex: 1 }} />
        <button
          onClick={onToggleCollapse}
          className="side-tab-btn"
          style={{
            width: 36, height: 36, borderRadius: 8, border: 'none',
            background: 'transparent', color: '#9CA3AF', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 8,
          }}
        >
          {isCollapsed ? <PanelRight className="w-[18px] h-[18px]" /> : <PanelRightClose className="w-[18px] h-[18px]" />}
        </button>
      </div>

      {/* Tab Content - hidden when collapsed */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        opacity: isCollapsed ? 0 : 1,
        transition: 'opacity 0.15s ease',
      }}>
        
        {/* RESEARCH TAB - AI Chat */}
        {activeTab === 'research' && (
          <>
            {/* Input area at TOP */}
            <div style={{ padding: '12px', borderBottom: '1px solid #F3F4F6' }}>
              {/* Context badge */}
              {selectedText && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: 6, 
                    padding: '4px 10px', background: '#DCFCE7', borderRadius: 999,
                    fontSize: 11, color: '#166534', fontWeight: 500,
                  }}>
                    <Atom className="w-3 h-3" style={{ color: '#22C55E' }} />
                    <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {selectedText.length > 30 ? selectedText.slice(0, 30) + '...' : selectedText}
                    </span>
                    <button onClick={onClearSelection} style={{ 
                      width: 14, height: 14, borderRadius: '50%', border: 'none',
                      background: 'rgba(0,0,0,0.1)', color: '#166534', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                    }}>
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Input container */}
              <div style={{ background: '#F5F5F5', borderRadius: 8, padding: '10px 12px' }}>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                  placeholder="Research anything..."
                  rows={2}
                  style={{
                    width: '100%', border: 'none', outline: 'none', resize: 'none',
                    fontSize: 13, lineHeight: 1.5, color: '#111', background: 'transparent',
                  }}
                />
                
                {/* Bottom row: Mode selector + Globe + Send */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  {/* Mode dropdown */}
                  <div style={{ position: 'relative' }} ref={modeDropdownRef}>
                    <button
                      onClick={() => setShowModeDropdown(!showModeDropdown)}
                      className="mode-selector-btn"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '4px 8px', borderRadius: 4, border: 'none',
                        background: 'white', color: '#374151', cursor: 'pointer',
                        fontSize: 12, fontWeight: 500,
                      }}
                    >
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: currentMode.color }} />
                      {currentMode.label}
                      <ChevronDown className="w-3 h-3" style={{ color: '#9CA3AF' }} />
                    </button>

                    {showModeDropdown && (
                      <div style={{
                        position: 'absolute', bottom: '100%', left: 0, marginBottom: 4,
                        background: 'white', border: '1px solid #E5E7EB', borderRadius: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden', minWidth: 140, zIndex: 100,
                      }}>
                        {Object.entries(modes).map(([key, m]) => (
                          <button
                            key={key}
                            onClick={() => { setMode(key as typeof mode); setShowModeDropdown(false); }}
                            className="mode-option"
                            style={{
                              display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                              padding: '8px 12px', border: 'none',
                              background: mode === key ? '#F5F5F5' : 'transparent',
                              cursor: 'pointer', textAlign: 'left',
                            }}
                          >
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: m.color }} />
                            <span style={{ fontSize: 12, color: '#111' }}>{m.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Web toggle */}
                  <Tooltip label={webEnabled ? 'Web search ON' : 'Enable web search'}>
                    <button
                      onClick={() => setWebEnabled(!webEnabled)}
                      className="web-toggle-btn"
                      style={{
                        width: 28, height: 28, borderRadius: 4, border: 'none',
                        background: webEnabled ? '#DBEAFE' : 'white',
                        color: webEnabled ? '#3B82F6' : '#9CA3AF',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Globe className="w-4 h-4" />
                    </button>
                  </Tooltip>

                  <div style={{ flex: 1 }} />

                  {/* Send button */}
                  <button
                    onClick={handleSubmit}
                    disabled={!query.trim() && !selectedText}
                    className="send-btn"
                    style={{
                      width: 28, height: 28, borderRadius: 6, border: 'none',
                      background: (query.trim() || selectedText) ? currentMode.color : '#E5E7EB',
                      color: (query.trim() || selectedText) ? 'white' : '#9CA3AF',
                      cursor: (query.trim() || selectedText) ? 'pointer' : 'default',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: '#9CA3AF', fontSize: 13 }}>
                  Research the web or your connected sources
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {messages.map((msg, i) => (
                    <div key={i}>
                      {msg.context && (
                        <div style={{ marginBottom: 6 }}>
                          <span style={{ fontSize: 11, color: '#22C55E', fontWeight: 500 }}>
                            Re: "{msg.context.slice(0, 25)}..."
                          </span>
                        </div>
                      )}
                      <div style={{ 
                        padding: '10px 12px', borderRadius: 8,
                        background: msg.role === 'user' ? '#111' : '#F5F5F5',
                        color: msg.role === 'user' ? 'white' : '#111',
                        fontSize: 13, lineHeight: 1.6,
                      }}>
                        {msg.role === 'user' ? (
                          msg.content
                        ) : (
                          <div className="markdown-response">
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => {
                                  const text = extractTextFromChildren(children)
                                  return (
                                    <InsertableFinding 
                                      text={text} 
                                      onInsert={() => onInsertText(text)}
                                    >
                                      <p style={{ margin: '0 0 8px 0', lineHeight: 1.6 }}>{children}</p>
                                    </InsertableFinding>
                                  )
                                },
                                strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
                                ul: ({ children }) => <ul style={{ margin: '8px 0', paddingLeft: 20 }}>{children}</ul>,
                                ol: ({ children }) => <ol style={{ margin: '8px 0', paddingLeft: 20 }}>{children}</ol>,
                                li: ({ children }) => {
                                  const text = extractTextFromChildren(children)
                                  return (
                                    <InsertableFinding 
                                      text={text} 
                                      onInsert={() => onInsertText(text)}
                                    >
                                      <li style={{ margin: '4px 0' }}>{children}</li>
                                    </InsertableFinding>
                                  )
                                },
                                a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#3B82F6', textDecoration: 'underline' }}>{children}</a>,
                                code: ({ children }) => <code style={{ background: '#E5E7EB', padding: '2px 4px', borderRadius: 4, fontSize: 12 }}>{children}</code>,
                                h1: ({ children }) => <h1 style={{ fontSize: 16, fontWeight: 600, margin: '12px 0 8px' }}>{children}</h1>,
                                h2: ({ children }) => <h2 style={{ fontSize: 14, fontWeight: 600, margin: '10px 0 6px' }}>{children}</h2>,
                                h3: ({ children }) => <h3 style={{ fontSize: 13, fontWeight: 600, margin: '8px 0 4px' }}>{children}</h3>,
                                blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid #E5E7EB', paddingLeft: 12, margin: '8px 0', color: '#6B7280', fontStyle: 'italic' }}>{children}</blockquote>,
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                      
                      {/* Quick actions for whole message */}
                      {msg.role === 'assistant' && (
                        <div style={{ 
                          display: 'flex', 
                          gap: 6, 
                          marginTop: 8,
                          paddingLeft: 4,
                        }}>
                          <button
                            onClick={() => {
                              // Extract first sentence or key finding for tracking
                              const firstSentence = msg.content.split(/[.!?]/)[0]?.trim() || msg.content.slice(0, 100)
                              const cleanClaim = firstSentence
                                .replace(/\*\*/g, '')
                                .replace(/^#+\s*/gm, '')
                                .trim()
                              onTrackClaim(cleanClaim)
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '4px 8px',
                              borderRadius: 4,
                              border: '1px solid #E5E7EB',
                              background: 'white',
                              color: '#374151',
                              fontSize: 11,
                              fontWeight: 500,
                              cursor: 'pointer',
                            }}
                            className="action-btn"
                          >
                            <Radio className="w-3 h-3" />
                            Track
                          </button>
                          
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(msg.content)
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '4px 8px',
                              borderRadius: 4,
                              border: '1px solid #E5E7EB',
                              background: 'white',
                              color: '#374151',
                              fontSize: 11,
                              fontWeight: 500,
                              cursor: 'pointer',
                            }}
                            className="action-btn"
                          >
                            <Copy className="w-3 h-3" />
                            Copy
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center',
                      padding: '24px 12px', 
                      gap: 12,
                    }}>
                      <RavenSpinner size={28} />
                      <span style={{ fontSize: 12, color: '#9CA3AF' }}>Researching...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </>
        )}

        {/* AUDIT TAB */}
        {activeTab === 'audit' && (
          <>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#111', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Integrity
              </span>
              <span style={{ fontSize: 11, color: auditMode ? '#22C55E' : '#9CA3AF', fontWeight: 500 }}>
                {auditMode ? '● Active' : '○ Off'}
              </span>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
              {integrityCards.map(card => (
                <div key={card.id} className="integrity-card" style={{
                  padding: '10px 12px', marginBottom: 8, background: '#FAFAFA',
                  borderRadius: 8, border: '1px solid #E5E7EB',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    {card.status === 'verified' && <Check className="w-3 h-3" style={{ color: '#22C55E' }} />}
                    {card.status === 'drift' && <AlertTriangle className="w-3 h-3" style={{ color: '#F59E0B' }} />}
                    {card.status === 'monitoring' && <Radio className="w-3 h-3" style={{ color: '#3B82F6' }} />}
                    <span style={{ fontSize: 11, fontWeight: 600, color: 
                      card.status === 'verified' ? '#22C55E' : 
                      card.status === 'drift' ? '#F59E0B' : '#3B82F6',
                      textTransform: 'uppercase',
                    }}>
                      {card.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#111', marginBottom: 4 }}>
                    "{card.claim}"
                  </div>
                  <div style={{ fontSize: 11, color: '#6B7280' }}>
                    {card.source}
                  </div>
                  {card.note && (
                    <div style={{ fontSize: 11, color: '#F59E0B', marginTop: 6 }}>⚠ {card.note}</div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* SOURCES TAB */}
        {activeTab === 'sources' && (
          <>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#111', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Connected Sources
              </span>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
              {sources.map(source => (
                <div key={source.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', marginBottom: 6, background: '#FAFAFA',
                  borderRadius: 8, border: '1px solid #E5E7EB',
                }}>
                  <Database className="w-4 h-4" style={{ color: '#6B7280' }} />
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#111' }}>{source.name}</span>
                  <span style={{ fontSize: 11, color: '#6B7280' }}>{source.count} docs</span>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: source.status === 'connected' ? '#22C55E' : '#F59E0B' }} />
                </div>
              ))}
              <button className="add-source-btn" style={{
                width: '100%', padding: '10px', border: '1px dashed #D1D5DB',
                borderRadius: 8, background: 'transparent', color: '#6B7280',
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <Plus className="w-4 h-4" /> Add Source
              </button>
            </div>
          </>
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
        { id: 'image', label: 'Image', icon: ImageIcon, description: 'Upload an image' },
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

function BlockEditor({ 
  block, 
  isFirst, 
  isFocused, 
  onFocus, 
  onUpdate, 
  onDelete, 
  onDuplicate, 
  onAddBlockAfter, 
  onSelectionChange,
  ghostText,
  onAcceptGhost,
  onRejectGhost,
}: {
  block: Block
  isFirst: boolean
  isFocused: boolean
  onFocus: () => void
  onUpdate: (content: string) => void
  onDelete: () => void
  onDuplicate: () => void
  onAddBlockAfter: (type?: string) => void
  onSelectionChange: (visible: boolean, pos: { top: number; left: number } | null, editor: any, text?: string) => void
  ghostText?: string
  onAcceptGhost?: () => void
  onRejectGhost?: () => void
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
      Image.configure({
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
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

  // Handle Tab/Escape for ghost text
  useEffect(() => {
    if (!ghostText) return
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab' && !event.shiftKey) {
        event.preventDefault()
        onAcceptGhost?.()
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        onRejectGhost?.()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [ghostText, onAcceptGhost, onRejectGhost])

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
        
        {/* Ghost text - Tab to accept, Escape to dismiss */}
        {ghostText && (
          <div 
            style={{ 
              position: 'relative',
              marginTop: 4,
            }}
          >
            <div 
              style={{ 
                color: '#9CA3AF',
                opacity: 0.7,
                fontSize: 15,
                lineHeight: 1.7,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                padding: '8px 12px',
                background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.08) 0%, rgba(34, 197, 94, 0.03) 100%)',
                borderLeft: '2px solid #22C55E',
                borderRadius: '0 4px 4px 0',
              }}
            >
              {ghostText}
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8, 
              marginTop: 8,
              fontSize: 11,
              color: '#6B7280',
            }}>
              <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 4,
                padding: '2px 6px',
                background: '#F3F4F6',
                borderRadius: 4,
                fontFamily: 'monospace',
              }}>
                Tab
              </span>
              <span>to accept</span>
              <span style={{ color: '#D1D5DB' }}>•</span>
              <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 4,
                padding: '2px 6px',
                background: '#F3F4F6',
                borderRadius: 4,
                fontFamily: 'monospace',
              }}>
                Esc
              </span>
              <span>to dismiss</span>
            </div>
          </div>
        )}
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

import { useDocument, useDocuments, Document } from '@/lib/hooks/useDocument'
import { useAuth } from '@/lib/hooks/useAuth'

interface BlockCanvasProps {
  documentId: string
  documents?: Document[]
  onDocumentSelect?: (id: string) => void
  onNewDocument?: () => void
}

// Default blocks for new documents
const DEFAULT_BLOCKS: Block[] = [
  { id: 'new-1', content: '' },
]

export default function BlockCanvas({ 
  documentId, 
  documents = [],
  onDocumentSelect,
  onNewDocument,
}: BlockCanvasProps) {
  // Auth
  const { user } = useAuth()
  
  // Document data from DB
  const { 
    document: currentDoc, 
    loading: docLoading,
    saving,
    updateContent, 
    updateTitle,
    addClaim,
  } = useDocument(documentId !== 'new' ? documentId : null)
  
  // Local state for tabs (combines DB docs with local edits)
  const [tabs, setTabs] = useState<Tab[]>([])
  const [activeTabId, setActiveTabId] = useState<string>(documentId)
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasInitialized = useRef(false)
  
  const OPEN_TABS_KEY = 'raven_open_tabs'
  
  // Helper to read/write localStorage
  const getStoredTabs = (): string[] => {
    try {
      return JSON.parse(localStorage.getItem(OPEN_TABS_KEY) || '[]')
    } catch { return [] }
  }
  
  const setStoredTabs = (ids: string[]) => {
    localStorage.setItem(OPEN_TABS_KEY, JSON.stringify(ids))
  }
  
  // Build a tab object from a document
  const docToTab = useCallback((doc: { id: string; title: string; content: any }): Tab => ({
    id: doc.id,
    name: doc.title || '',
    hasCustomName: false,
    hasChanges: false,
    title: doc.title || '',
    blocks: contentToBlocks(doc.content),
  }), [])
  
  // ONE-TIME initialization when documents first load
  useEffect(() => {
    if (hasInitialized.current || documents.length === 0) return
    hasInitialized.current = true
    
    // Get stored tab IDs
    let storedIds = getStoredTabs()
    
    // Add current documentId if not already there
    if (documentId && !storedIds.includes(documentId)) {
      storedIds = [...storedIds, documentId]
      setStoredTabs(storedIds)
    }
    
    // Filter to valid docs and build tabs
    const validTabs: Tab[] = []
    const validIds: string[] = []
    
    for (const id of storedIds) {
      const doc = documents.find(d => d.id === id)
      if (doc) {
        validTabs.push(docToTab(doc))
        validIds.push(id)
      }
    }
    
    // Clean up localStorage if we removed any
    if (validIds.length !== storedIds.length) {
      setStoredTabs(validIds)
    }
    
    // Set tabs and active
    if (validTabs.length > 0) {
      setTabs(validTabs)
      setActiveTabId(documentId && validIds.includes(documentId) ? documentId : validIds[0])
    }
  }, [documents, documentId, docToTab])
  
  // Add tab when documentId changes AFTER initialization
  useEffect(() => {
    if (!hasInitialized.current || !documentId) return
    
    // Check if already have this tab using current localStorage (source of truth)
    const storedIds = getStoredTabs()
    if (storedIds.includes(documentId)) {
      setActiveTabId(documentId)
      return
    }
    
    // New doc - add as tab
    const doc = documents.find(d => d.id === documentId)
    if (doc) {
      const newTab = docToTab(doc)
      setTabs(prev => [...prev, newTab])
      setStoredTabs([...storedIds, documentId])
      setActiveTabId(documentId)
    }
  }, [documentId, documents, docToTab])

  // Update tab when currentDoc loads - ONLY if tab hasn't been modified
  // This prevents overwriting user edits when the hook re-renders
  const loadedDocIds = useRef<Set<string>>(new Set())
  
  useEffect(() => {
    if (!currentDoc || docLoading) return
    
    // Only load from DB once per document
    if (loadedDocIds.current.has(currentDoc.id)) return
    loadedDocIds.current.add(currentDoc.id)
    
    setTabs(prev => prev.map(tab => 
      tab.id === currentDoc.id 
        ? {
            ...tab,
            title: currentDoc.title,
            blocks: contentToBlocks(currentDoc.content),
          }
        : tab
    ))
  }, [currentDoc, docLoading])

  // Convert DB content to our block format
  // Handles both old TipTap JSON format and new html-blocks format
  function contentToBlocks(content: any): Block[] {
    if (!content) {
      return DEFAULT_BLOCKS
    }
    
    // New format: html-blocks
    if (content.format === 'html-blocks' && content.blocks) {
      return content.blocks.map((block: any, index: number) => ({
        id: block.id || `block-${index}`,
        content: block.html || '',
      }))
    }
    
    // Legacy format: TipTap JSON
    if (!content.content) {
      return DEFAULT_BLOCKS
    }
    
    return content.content.map((node: any, index: number) => {
      // Convert TipTap node to HTML preserving formatting
      const html = tiptapNodeToHtml(node)
      
      return {
        id: `block-${index}`,
        content: html,
      }
    })
  }
  
  // Convert a TipTap node to HTML, preserving marks (bold, italic, etc.)
  function tiptapNodeToHtml(node: any): string {
    if (!node) return ''
    
    // Handle text nodes with marks
    if (node.type === 'text') {
      let text = node.text || ''
      // Apply marks in order
      if (node.marks) {
        for (const mark of node.marks) {
          if (mark.type === 'bold') text = `<strong>${text}</strong>`
          else if (mark.type === 'italic') text = `<em>${text}</em>`
          else if (mark.type === 'underline') text = `<u>${text}</u>`
          else if (mark.type === 'strike') text = `<s>${text}</s>`
          else if (mark.type === 'code') text = `<code>${text}</code>`
          else if (mark.type === 'link') text = `<a href="${mark.attrs?.href || ''}">${text}</a>`
        }
      }
      return text
    }
    
    // Recursively convert children
    const children = node.content?.map((child: any) => tiptapNodeToHtml(child)).join('') || ''
    
    // Wrap in appropriate tag
    switch (node.type) {
      case 'heading':
        const level = node.attrs?.level || 1
        return `<h${level}>${children}</h${level}>`
      case 'paragraph':
        return `<p>${children}</p>`
      case 'bulletList':
        return `<ul>${children}</ul>`
      case 'orderedList':
        return `<ol>${children}</ol>`
      case 'listItem':
        return `<li>${children}</li>`
      case 'blockquote':
        return `<blockquote>${children}</blockquote>`
      case 'codeBlock':
        return `<pre><code>${children}</code></pre>`
      case 'horizontalRule':
        return '<hr>'
      case 'image':
        return `<img src="${node.attrs?.src || ''}" alt="${node.attrs?.alt || ''}" />`
      case 'hardBreak':
        return '<br>'
      default:
        return children
    }
  }

  // Convert our blocks back to content for saving
  // Store as a simple format that preserves all HTML
  function blocksToContent(blocks: Block[]): any {
    return {
      type: 'doc',
      format: 'html-blocks',
      blocks: blocks.map(block => ({
        id: block.id,
        html: block.content,
      }))
    }
  }

  // Auto-save with debounce
  const triggerSave = useCallback((blocks: Block[], title: string) => {
    if (!user || documentId === 'new') return
    
    setHasUnsavedChanges(true)
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    // Set new timeout for save
    saveTimeoutRef.current = setTimeout(async () => {
      const content = blocksToContent(blocks)
      await updateContent(content)
      setHasUnsavedChanges(false)
      
      // Update tab to show saved
      setTabs(prev => prev.map(tab => 
        tab.id === documentId ? { ...tab, hasChanges: false } : tab
      ))
    }, 1500) // 1.5 second debounce
  }, [user, documentId, updateContent])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])
  
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
  
  // Panel collapsed state
  const [panelCollapsed, setPanelCollapsed] = useState(false)
  
  // Publish modal state
  const [showPublishModal, setShowPublishModal] = useState(false)
  
  // Block tray state
  const [showBlockTray, setShowBlockTray] = useState(false)

  // Image upload state
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [imageInsertAfterId, setImageInsertAfterId] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Ghost text state (for Tab to accept research findings)
  const [pendingGhostText, setPendingGhostText] = useState<{
    text: string
    blockId: string | null
    source?: string
  } | null>(null)

  // Get active tab data
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0]
  const blocks = activeTab?.blocks || []
  const title = activeTab?.title || ''
  const titleRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize title on change
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto'
      titleRef.current.style.height = titleRef.current.scrollHeight + 'px'
    }
  }, [title])

  // Word count (strips HTML tags)
  const wordCount = blocks.reduce((count, block) => {
    const text = block.content.replace(/<[^>]*>/g, ' ').trim()
    return count + (text ? text.split(/\s+/).filter(Boolean).length : 0)
  }, 0)

  const generateId = () => Math.random().toString(36).substring(2, 9)

  // Tab handlers
  const handleTabSelect = useCallback((id: string) => {
    setActiveTabId(id)
    onDocumentSelect?.(id)
    setToolbarState({ visible: false, position: null, editor: null, selectedText: '' })
  }, [])

  const handleNewTab = useCallback(async () => {
    // Create a new document in the database
    if (onNewDocument) {
      onNewDocument()
    }
  }, [onNewDocument])

  const handleCloseTab = useCallback((id: string) => {
    if (tabs.length === 1) return // Don't close last tab
    
    const newTabs = tabs.filter(t => t.id !== id)
    setTabs(newTabs)
    setStoredTabs(newTabs.map(t => t.id))
    
    // If closing active tab, switch to first remaining tab
    if (activeTabId === id) {
      const newActiveId = newTabs[0].id
      setActiveTabId(newActiveId)
      // Update parent's documentId so URL changes and effect doesn't re-add
      onDocumentSelect?.(newActiveId)
    }
  }, [tabs, activeTabId, onDocumentSelect])

  const handleTabRename = useCallback((id: string, newName: string) => {
    // Update both tab name AND document title (they stay in sync)
    setTabs(prev => prev.map(t => 
      t.id === id ? { ...t, name: newName, title: newName, hasCustomName: true } : t
    ))
    // Save to DB if it's a real document
    if (user && id !== 'new' && id === documentId) {
      updateTitle(newName)
    }
  }, [user, documentId, updateTitle])

  // Block handlers
  const updateBlocks = useCallback((newBlocks: Block[]) => {
    setTabs(prev => prev.map(t => 
      t.id === activeTabId ? { ...t, blocks: newBlocks, hasChanges: true } : t
    ))
    // Trigger auto-save
    const currentTab = tabs.find(t => t.id === activeTabId)
    if (currentTab) {
      triggerSave(newBlocks, currentTab.title)
    }
  }, [activeTabId, tabs, triggerSave])

  const handleTitleUpdate = useCallback((newTitle: string) => {
    // Update both title AND tab name (they stay in sync)
    setTabs(prev => prev.map(t => 
      t.id === activeTabId ? { ...t, title: newTitle, name: newTitle, hasChanges: true } : t
    ))
    // Trigger title save to DB
    if (user && documentId !== 'new') {
      updateTitle(newTitle)
    }
  }, [activeTabId, user, documentId, updateTitle])

  const addBlock = useCallback((afterId?: string, blockType?: string) => {
    // Handle image upload specially
    if (blockType === 'image') {
      setImageInsertAfterId(afterId || blocks[blocks.length - 1]?.id || null)
      imageInputRef.current?.click()
      return
    }
    
    // Default block creation
    const newBlock: Block = { id: generateId(), content: '' }
    const newBlocks = afterId 
      ? blocks.flatMap(b => b.id === afterId ? [b, newBlock] : [b])
      : [...blocks, newBlock]
    updateBlocks(newBlocks)
    setTimeout(() => setFocusedBlockId(newBlock.id), 50)
  }, [blocks, updateBlocks])

  // Handle image file selection
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    
    setUploadingImage(true)
    try {
      const result = await uploadImage(file, user.id, documentId)
      
      // Create image block
      const imageContent = `<img src="${result.url}" alt="${file.name}" class="editor-image" />`
      const newBlock: Block = { id: generateId(), content: imageContent }
      
      // Insert after the specified block
      const newBlocks = imageInsertAfterId
        ? blocks.flatMap(b => b.id === imageInsertAfterId ? [b, newBlock] : [b])
        : [...blocks, newBlock]
      
      updateBlocks(newBlocks)
    } catch (err) {
      console.error('Image upload failed:', err)
      // Could add toast notification here
    } finally {
      setUploadingImage(false)
      setImageInsertAfterId(null)
      // Reset input
      if (imageInputRef.current) {
        imageInputRef.current.value = ''
      }
    }
  }, [user, documentId, blocks, imageInsertAfterId, updateBlocks])

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

  // Research handler - opens panel and sets selected text
  const handleResearch = useCallback((text: string) => {
    setResearchText(text)
    setPanelCollapsed(false) // Auto-open the Intelligence Hub
    setToolbarState(prev => ({ ...prev, visible: false }))
  }, [])

  // Insert text from research into document (shows as ghost first)
  const handleInsertText = useCallback((text: string, source?: string) => {
    // Show as ghost text first - user presses Tab to accept
    setPendingGhostText({
      text,
      blockId: focusedBlockId,
      source,
    })
  }, [focusedBlockId])

  // Accept ghost text - insert into document + auto-track
  const handleAcceptGhost = useCallback(async () => {
    if (!pendingGhostText) return
    
    const { text, blockId, source } = pendingGhostText
    
    if (blockId) {
      const targetBlock = blocks.find(b => b.id === blockId)
      if (targetBlock) {
        // Append text to the focused block
        const newContent = targetBlock.content + `<p>${text}</p>`
        updateBlock(blockId, newContent)
      }
    } else {
      // No focused block - add as new block at the end
      const newBlock: Block = {
        id: `block-${Date.now()}`,
        content: `<p>${text}</p>`,
      }
      updateBlocks([...blocks, newBlock])
    }
    
    // Auto-track the inserted text as a verified claim
    if (documentId && documentId !== 'new') {
      const claimId = `RAV-${Date.now().toString(36).toUpperCase()}`
      // Extract first sentence for claim text
      const claimText = text.split(/[.!?]/)[0]?.trim() || text.slice(0, 100)
      
      await addClaim({
        claimId,
        text: claimText,
        source: source || 'web',
        cadence: 'daily',
        category: 'general',
      })
    }
    
    setPendingGhostText(null)
  }, [pendingGhostText, blocks, updateBlock, updateBlocks, documentId, addClaim])

  // Reject ghost text
  const handleRejectGhost = useCallback(() => {
    setPendingGhostText(null)
  }, [])

  // Global keyboard handler for ghost text (when no block has focus)
  useEffect(() => {
    if (!pendingGhostText || pendingGhostText.blockId) return
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab' && !event.shiftKey) {
        event.preventDefault()
        handleAcceptGhost()
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        handleRejectGhost()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [pendingGhostText, handleAcceptGhost, handleRejectGhost])

  // Track a claim from research
  const handleTrackClaim = useCallback(async (claim: string, source?: string) => {
    if (!documentId || documentId === 'new') {
      alert('Please save the document first before tracking claims')
      return
    }
    
    // Generate a claim ID
    const claimId = `RAV-${Date.now().toString(36).toUpperCase()}`
    
    const result = await addClaim({
      claimId,
      text: claim,
      source: source || 'web',
      cadence: 'daily',
      category: 'general',
    })
    
    if (result) {
      // Show success feedback
      alert(`✓ Claim tracked: "${claim.slice(0, 50)}${claim.length > 50 ? '...' : ''}"`)
    }
  }, [documentId, addClaim])

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'white' }}>
      <style>{`
        .doc-title-input::placeholder { color: #C0C0C0; font-style: normal; }
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
        .ghost-block-content img.editor-image { max-width: 100%; height: auto; border-radius: 8px; margin: 12px 0; cursor: pointer; }
        .ghost-block-content img.editor-image:hover { opacity: 0.95; }
        .ghost-block-content img.editor-image.ProseMirror-selectednode { outline: 2px solid #3B82F6; outline-offset: 2px; }
        
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
        .dock-mode-btn:hover { background: rgba(0,0,0,0.04) !important; }
        .action-btn:hover { background: #F3F4F6 !important; border-color: #D1D5DB !important; }
        .finding-insert-btn:hover { background: #DCFCE7 !important; border-color: #22C55E !important; }
        .mode-tab-btn:hover { background: #F5F5F5 !important; }
        .side-tab-btn:hover { background: #F3F4F6 !important; }
        .folder-btn:hover { background: #F5F5F5 !important; }
        .file-btn:hover { background: #F5F5F5 !important; }
        .integrity-card:hover { border-color: #D1D5DB !important; }
        .action-btn:hover { background: #F5F5F5 !important; }
        .action-btn-primary:hover { background: #333 !important; }
        .add-source-btn:hover { background: #F5F5F5 !important; border-color: #9CA3AF !important; }
        .dock-btn:hover { background: #F3F4F6 !important; color: #111 !important; }
        .web-toggle-btn:hover { background: #E5E7EB !important; }
        
        /* Tab row hover states */
        .editor-tab:hover { background: #F3F4F6 !important; }
        .editor-tab:hover .tab-close-btn { color: #6B7280 !important; }
        .tab-close-btn:hover { background: #E5E7EB !important; color: #374151 !important; }
        .tab-add-btn:hover { background: #F3F4F6 !important; color: #374151 !important; }
        .share-btn:hover { background: #333 !important; }
        
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
        
        .markdown-response p:last-child { margin-bottom: 0 !important; }
        .markdown-response ul:last-child, .markdown-response ol:last-child { margin-bottom: 0 !important; }
        
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
        onShare={() => setShowPublishModal(true)}
        onTabRename={handleTabRename}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Main editor area */}
        <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 32px 120px' }}>
            {/* Document title */}
            <div style={{ marginBottom: 32, paddingLeft: 64 }}>
              <textarea 
                ref={titleRef}
                value={title} 
                onChange={(e) => {
                  handleTitleUpdate(e.target.value)
                  // Auto-resize
                  e.target.style.height = 'auto'
                  e.target.style.height = e.target.scrollHeight + 'px'
                }} 
                onInput={(e) => {
                  // Auto-resize on input too
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height = target.scrollHeight + 'px'
                }}
                placeholder="Untitled" 
                className="doc-title-input"
                rows={1}
                style={{ 
                  width: '100%', 
                  fontSize: 32, 
                  fontWeight: 600, 
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
                  color: title ? '#111' : '#9CA3AF', 
                  border: 'none', 
                  outline: 'none', 
                  background: 'transparent',
                  letterSpacing: '-0.02em',
                  resize: 'none',
                  overflow: 'hidden',
                  lineHeight: 1.2,
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
                  ghostText={pendingGhostText?.blockId === block.id ? pendingGhostText.text : undefined}
                  onAcceptGhost={handleAcceptGhost}
                  onRejectGhost={handleRejectGhost}
                />
              ))}
            </div>

            {/* Ghost text preview when no specific block is focused */}
            {pendingGhostText && !pendingGhostText.blockId && (
              <div style={{ marginLeft: 64, marginTop: 16 }}>
                <div 
                  style={{ 
                    color: '#9CA3AF',
                    opacity: 0.7,
                    fontSize: 15,
                    lineHeight: 1.7,
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    padding: '8px 12px',
                    background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.08) 0%, rgba(34, 197, 94, 0.03) 100%)',
                    borderLeft: '2px solid #22C55E',
                    borderRadius: '0 4px 4px 0',
                  }}
                >
                  {pendingGhostText.text}
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  marginTop: 8,
                  fontSize: 11,
                  color: '#6B7280',
                }}>
                  <span style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: 4,
                    padding: '2px 6px',
                    background: '#F3F4F6',
                    borderRadius: 4,
                    fontFamily: 'monospace',
                  }}>
                    Tab
                  </span>
                  <span>to accept</span>
                  <span style={{ color: '#D1D5DB' }}>•</span>
                  <span style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: 4,
                    padding: '2px 6px',
                    background: '#F3F4F6',
                    borderRadius: 4,
                    fontFamily: 'monospace',
                  }}>
                    Esc
                  </span>
                  <span>to dismiss</span>
                </div>
              </div>
            )}

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

        {/* Intelligence Hub - Collapsible */}
        <IntelligenceHub
          selectedText={researchText}
          onClearSelection={() => setResearchText('')}
          auditMode={auditMode}
          isCollapsed={panelCollapsed}
          onToggleCollapse={() => setPanelCollapsed(!panelCollapsed)}
          onInsertText={handleInsertText}
          onTrackClaim={handleTrackClaim}
        />

        {/* Floating Dock - Figma-style */}
        <div style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: 10,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)',
        }}>
          {/* Left section - Tools */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '6px 8px' }}>
            <Tooltip label="Insert Block (+)">
              <button
                onClick={() => setShowBlockTray(!showBlockTray)}
                className="dock-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  border: 'none',
                  background: showBlockTray ? '#F3F4F6' : 'transparent',
                  color: showBlockTray ? '#111' : '#6B7280',
                  cursor: 'pointer',
                }}
              >
                <Plus className="w-[18px] h-[18px]" />
              </button>
            </Tooltip>
            
            <Tooltip label="Research (⌘K)">
              <button
                onClick={() => setPanelCollapsed(false)}
                className="dock-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  border: 'none',
                  background: !panelCollapsed ? '#DCFCE7' : 'transparent',
                  color: !panelCollapsed ? '#22C55E' : '#6B7280',
                  cursor: 'pointer',
                }}
              >
                <Atom className="w-[18px] h-[18px]" />
              </button>
            </Tooltip>
          </div>
          
          {/* Separator */}
          <div style={{ width: 1, height: 24, background: 'rgba(0,0,0,0.08)' }} />
          
          {/* Center - Word count & Save status */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12,
            padding: '6px 16px',
            fontSize: 12,
            color: '#6B7280',
          }}>
            <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
          </div>
          
          {/* Separator */}
          <div style={{ width: 1, height: 24, background: 'rgba(0,0,0,0.08)' }} />
          
          {/* Right section - Mode Switcher */}
          <div style={{ padding: '6px 8px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#F3F4F6',
              borderRadius: 6,
              padding: 2,
            }}>
              <button
                onClick={() => setAuditMode(false)}
                className={!auditMode ? '' : 'dock-mode-btn'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 10px',
                  borderRadius: 4,
                  border: 'none',
                  background: !auditMode ? 'white' : 'transparent',
                  color: !auditMode ? '#111' : '#6B7280',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 500,
                  boxShadow: !auditMode ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.12s ease',
                }}
              >
                <PenLine className="w-3.5 h-3.5" />
                Drafting
              </button>
              <button
                onClick={() => setAuditMode(true)}
                className={auditMode ? '' : 'dock-mode-btn'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 10px',
                  borderRadius: 4,
                  border: 'none',
                  background: auditMode ? 'white' : 'transparent',
                  color: auditMode ? '#111' : '#6B7280',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 500,
                  boxShadow: auditMode ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.12s ease',
                }}
              >
                <Eye className="w-3.5 h-3.5" />
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
      
      {/* Publish Modal */}
      <PublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        documentId={activeTab?.id || ''}
        documentTitle={title || 'Untitled'}
        blocks={blocks}
      />

      {/* Hidden file input for image uploads */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />
    </div>
  )
}