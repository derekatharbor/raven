// src/components/published/PublishedDocument.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import { RavenTracker, generateFingerprint } from '@/lib/tracking/tracker'
import { Clock, Eye, MessageCircle, Send, ChevronDown, History } from 'lucide-react'

interface Block {
  id: string
  content: string
  type?: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface VersionHistoryItem {
  version_number: number
  published_at: string
  note?: string
}

interface PublishedDocumentProps {
  slug: string
  linkId: string
  requireEmail: boolean
  initialVersion?: {
    title: string
    blocks: Block[]
  }
  versionNumber?: number
  updatedAt?: string
}

export default function PublishedDocument({ 
  slug, 
  linkId, 
  requireEmail,
  initialVersion,
  versionNumber = 1,
  updatedAt,
}: PublishedDocumentProps) {
  const [loading, setLoading] = useState(!initialVersion)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [showEmailGate, setShowEmailGate] = useState(requireEmail)
  const [document, setDocument] = useState<{ title: string; blocks: Block[] } | null>(
    initialVersion || null
  )
  const [readProgress, setReadProgress] = useState(0)
  const [sessionStarted, setSessionStarted] = useState(false)
  const trackerRef = useRef<RavenTracker | null>(null)
  
  // Chat state
  const [chatOpen, setChatOpen] = useState(false)
  const [chatQuestion, setChatQuestion] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const chatInputRef = useRef<HTMLInputElement>(null)
  const chatMessagesRef = useRef<HTMLDivElement>(null)
  
  // Version history state
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [versionHistory, setVersionHistory] = useState<VersionHistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const versionDropdownRef = useRef<HTMLDivElement>(null)

  // Calculate estimated read time (avg 200 words/min)
  const estimateReadTime = (blocks: Block[]) => {
    const text = blocks.map(b => {
      // Strip HTML tags to get plain text
      const div = typeof window !== 'undefined' ? window.document.createElement('div') : null
      if (div) {
        div.innerHTML = b.content
        return div.textContent || div.innerText || ''
      }
      return b.content.replace(/<[^>]*>/g, ' ')
    }).join(' ')
    const words = text.split(/\s+/).filter(Boolean).length
    const minutes = Math.ceil(words / 200)
    return Math.max(1, minutes)
  }

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = window.document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setReadProgress(Math.min(100, Math.max(0, progress)))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Start tracking session
  const startSession = async (viewerEmail?: string) => {
    if (sessionStarted) return
    
    try {
      const response = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          link_id: linkId,
          fingerprint: generateFingerprint(),
          email: viewerEmail,
          user_agent: navigator.userAgent,
        }),
      })

      // Try to parse response, handle empty/malformed gracefully
      let data: any = {}
      try {
        const text = await response.text()
        if (text) {
          data = JSON.parse(text)
        }
      } catch {
        // Response body empty or malformed - continue anyway
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start session')
      }
      
      // If we have initial version from SSR, use that. Otherwise use API response.
      if (!document && data.blocks) {
        setDocument({
          title: data.version?.title_snapshot || 'Untitled',
          blocks: data.blocks,
        })
      }

      // Initialize tracker
      const blockCount = document?.blocks?.length || data.blocks?.length || 0
      trackerRef.current = new RavenTracker(data.session_id, blockCount)
      
      setSessionStarted(true)
      setLoading(false)
      setShowEmailGate(false)

      // Init tracker after DOM renders
      setTimeout(() => {
        trackerRef.current?.init()
      }, 100)

    } catch (err) {
      console.error('Session start error:', err)
      // Don't show error for tracking failure - document is still viewable
      setLoading(false)
      setShowEmailGate(false)
    }
  }

  useEffect(() => {
    // If we have initial version from SSR and don't require email, start session immediately
    if (initialVersion && !requireEmail) {
      setLoading(false)
      startSession()
    } else if (!requireEmail) {
      startSession()
    } else {
      setLoading(false)
    }

    return () => {
      trackerRef.current?.destroy()
    }
  }, [])

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setLoading(true)
      startSession(email.trim())
    }
  }

  const formatRelativeTime = (dateStr?: string) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  // Extract plain text from document for chat context
  const getDocumentText = () => {
    if (!document) return ''
    return document.blocks.map(b => {
      const div = typeof window !== 'undefined' ? window.document.createElement('div') : null
      if (div) {
        div.innerHTML = b.content
        return div.textContent || div.innerText || ''
      }
      return b.content.replace(/<[^>]*>/g, ' ')
    }).join('\n\n')
  }

  // Handle chat submission
  const handleChatSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!chatQuestion.trim() || chatLoading) return

    const question = chatQuestion.trim()
    setChatQuestion('')
    setChatMessages(prev => [...prev, { role: 'user', content: question }])
    setChatLoading(true)
    setChatOpen(true)

    try {
      const response = await fetch('/api/document-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          documentContent: getDocumentText(),
          documentTitle: document?.title,
          linkId,
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.answer }])
      } else {
        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Sorry, I had trouble processing that question. Please try again.' 
        }])
      }
    } catch (error) {
      console.error('Chat error:', error)
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, something went wrong. Please try again.' 
      }])
    } finally {
      setChatLoading(false)
    }
  }

  // Scroll chat to bottom on new messages
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
    }
  }, [chatMessages])

  // Fetch version history when dropdown opens
  const handleVersionHistoryClick = async () => {
    if (showVersionHistory) {
      setShowVersionHistory(false)
      return
    }
    
    setShowVersionHistory(true)
    
    // Only fetch if we haven't already
    if (versionHistory.length === 0) {
      setHistoryLoading(true)
      try {
        const response = await fetch(`/api/published/${linkId}/versions`)
        if (response.ok) {
          const data = await response.json()
          setVersionHistory(data.versions || [])
        }
      } catch (error) {
        console.error('Failed to fetch version history:', error)
        // Fallback: show current version only
        setVersionHistory([{ 
          version_number: versionNumber, 
          published_at: updatedAt || new Date().toISOString() 
        }])
      } finally {
        setHistoryLoading(false)
      }
    }
  }

  // Close version dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (versionDropdownRef.current && !versionDropdownRef.current.contains(e.target as Node)) {
        setShowVersionHistory(false)
      }
    }
    window.document.addEventListener('mousedown', handleClickOutside)
    return () => window.document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Email gate
  if (showEmailGate) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full border border-gray-100">
          <div className="text-center mb-6">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Eye className="w-5 h-5 text-gray-600" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Enter your email to view</h1>
            <p className="text-gray-500 mt-1 text-sm">The author will know you viewed this document.</p>
          </div>
          
          <form onSubmit={handleEmailSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 cursor-pointer transition-colors"
            >
              {loading ? 'Loading...' : 'Continue'}
            </button>
          </form>
          
          <div className="flex items-center justify-center gap-1.5 mt-6 text-xs text-gray-400">
            <img src="/images/raven-logo.png" alt="Raven" className="w-3.5 h-3.5 opacity-50" />
            <span>Shared via Raven</span>
          </div>
        </div>
      </div>
    )
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-400">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full text-center border border-gray-100">
          <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Unable to load</h1>
          <p className="text-gray-500 mt-1 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  // No document
  if (!document) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <div className="text-gray-500">Document not found</div>
      </div>
    )
  }

  const readTime = estimateReadTime(document.blocks)

  // Document view
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-gray-200 z-50">
        <div 
          className="h-full bg-gray-900 transition-all duration-150"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-sm font-medium text-gray-900 truncate">
              {document.title || 'Untitled'}
            </h1>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400 flex-shrink-0">
            {readTime > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {readTime} min read
              </span>
            )}
            {updatedAt && (
              <>
                <span className="text-gray-300">·</span>
                <div className="relative" ref={versionDropdownRef}>
                  <button
                    onClick={handleVersionHistoryClick}
                    className="flex items-center gap-1 hover:text-gray-600 transition-colors"
                  >
                    <span>Updated {formatRelativeTime(updatedAt)}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${showVersionHistory ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Version History Dropdown */}
                  {showVersionHistory && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                      <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                          <History className="w-3 h-3" />
                          Version History
                        </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {historyLoading ? (
                          <div className="px-3 py-4 text-center text-gray-400 text-xs">
                            Loading...
                          </div>
                        ) : versionHistory.length > 0 ? (
                          versionHistory.map((v, i) => (
                            <div 
                              key={v.version_number}
                              className={`px-3 py-2.5 border-b border-gray-50 last:border-0 ${i === 0 ? 'bg-green-50' : ''}`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`text-xs font-medium ${i === 0 ? 'text-green-700' : 'text-gray-700'}`}>
                                  Version {v.version_number}
                                  {i === 0 && <span className="ml-1.5 text-[10px] text-green-600">(Current)</span>}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {formatRelativeTime(v.published_at)}
                                </span>
                              </div>
                              {v.note && (
                                <p className="text-[11px] text-gray-500 mt-1">{v.note}</p>
                              )}
                            </div>
                          ))
                        ) : (
                          <div 
                            className="px-3 py-2.5 bg-green-50"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-green-700">
                                Version {versionNumber}
                                <span className="ml-1.5 text-[10px] text-green-600">(Current)</span>
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {formatRelativeTime(updatedAt)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Document content */}
      <main className="max-w-2xl mx-auto px-6 pt-12 pb-28">
        <article className="published-content">
          {document.blocks.map((block, index) => (
            <TrackedBlock 
              key={block.id} 
              block={block} 
              index={index}
            />
          ))}
        </article>
      </main>

      {/* Chat widget - floating bottom */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4">
        {/* Expanded chat panel */}
        {chatOpen && chatMessages.length > 0 && (
          <div className="mb-3 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Chat header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Ask this document</span>
              </div>
              <button 
                onClick={() => setChatOpen(false)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            
            {/* Messages */}
            <div 
              ref={chatMessagesRef}
              className="max-h-64 overflow-y-auto p-4 space-y-3"
            >
              {chatMessages.map((msg, i) => (
                <div 
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                      msg.role === 'user' 
                        ? 'bg-gray-900 text-white' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                    style={{ lineHeight: 1.5 }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-3 py-2 rounded-lg">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Input bar */}
        <form 
          onSubmit={handleChatSubmit}
          className="bg-white rounded-full shadow-lg border border-gray-200 flex items-center gap-2 px-4 py-2 hover:border-gray-300 transition-colors"
        >
          <MessageCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            ref={chatInputRef}
            type="text"
            value={chatQuestion}
            onChange={(e) => setChatQuestion(e.target.value)}
            onFocus={() => chatMessages.length > 0 && setChatOpen(true)}
            placeholder="Ask this document anything..."
            className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
          />
          <button
            type="submit"
            disabled={!chatQuestion.trim() || chatLoading}
            className={`p-1.5 rounded-full transition-colors ${
              chatQuestion.trim() && !chatLoading
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Powered by Raven */}
        <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-gray-400">
          <img src="/images/raven-logo.png" alt="" className="w-3 h-3 opacity-50" />
          <span>Powered by <a href="https://tryraven.io?ref=doc-chat" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">Raven</a></span>
        </div>
      </div>

      {/* Styles for rendered HTML content */}
      <style dangerouslySetInnerHTML={{ __html: `
        .published-content p { 
          font-size: 15px; 
          line-height: 1.7; 
          color: #4B5563; 
          margin-bottom: 1rem; 
        }
        .published-content h1 { 
          font-size: 28px; 
          font-weight: 600; 
          color: #111; 
          margin: 2rem 0 1rem 0; 
          line-height: 1.3;
        }
        .published-content h1:first-child { margin-top: 0; }
        .published-content h2 { 
          font-size: 20px; 
          font-weight: 600; 
          color: #111; 
          margin: 1.5rem 0 0.75rem 0; 
          line-height: 1.4;
        }
        .published-content h3 { 
          font-size: 16px; 
          font-weight: 600; 
          color: #222; 
          margin: 1.25rem 0 0.5rem 0; 
        }
        .published-content ul, .published-content ol { 
          margin: 0 0 1rem 0; 
          padding-left: 1.5rem; 
          color: #4B5563;
        }
        .published-content li { 
          margin: 0.25rem 0; 
          line-height: 1.6;
        }
        .published-content blockquote { 
          border-left: 3px solid #E5E7EB; 
          margin: 1.5rem 0; 
          padding-left: 1rem; 
          color: #6B7280; 
          font-style: italic;
        }
        .published-content strong { font-weight: 600; }
        .published-content code { 
          background: #F3F4F6; 
          padding: 2px 6px; 
          border-radius: 4px; 
          font-size: 13px; 
          font-family: 'SF Mono', Monaco, monospace;
        }
        .published-content a { 
          color: #2563EB; 
          text-decoration: underline;
        }
        .published-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1rem 0;
        }
      `}} />
    </div>
  )
}

// Individual tracked block component - renders HTML content
function TrackedBlock({ block, index }: { block: Block; index: number }) {
  return (
    <div 
      data-block-id={block.id}
      data-block-index={index}
      dangerouslySetInnerHTML={{ __html: block.content }}
    />
  )
}