// Path: src/components/published/PublishedDocument.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import { RavenTracker, generateFingerprint } from '@/lib/tracking/tracker'
import type { Block, StartSessionResponse } from '@/types/tracking'
import { Clock, Eye } from 'lucide-react'

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [showEmailGate, setShowEmailGate] = useState(requireEmail)
  const [document, setDocument] = useState<{ title: string; blocks: Block[] } | null>(
    initialVersion || null
  )
  const [readProgress, setReadProgress] = useState(0)
  const trackerRef = useRef<RavenTracker | null>(null)

  // Calculate estimated read time (avg 200 words/min)
  const estimateReadTime = (blocks: Block[]) => {
    const text = blocks.map(b => b.content).join(' ')
    const words = text.split(/\s+/).length
    const minutes = Math.ceil(words / 200)
    return minutes
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

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to start session')
      }

      const data: StartSessionResponse = await response.json()
      
      setDocument({
        title: data.version.title_snapshot || 'Untitled',
        blocks: data.blocks,
      })

      // Initialize tracker
      trackerRef.current = new RavenTracker(
        data.session_id,
        data.blocks.length
      )

      setLoading(false)
      setShowEmailGate(false)

      // Init tracker after DOM renders
      setTimeout(() => {
        trackerRef.current?.init()
      }, 100)

    } catch (err) {
      console.error('Session start error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load document')
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!requireEmail) {
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

  const readTime = document ? estimateReadTime(document.blocks) : 0

  // Document view
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-gray-200 z-50">
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
              {document?.title}
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
                <span>Updated {formatRelativeTime(updatedAt)}</span>
              </>
            )}
            {versionNumber > 1 && (
              <>
                <span className="text-gray-300">·</span>
                <span className="font-mono">v{versionNumber}</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Document content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <article>
          {document?.blocks.map((block, index) => (
            <TrackedBlock 
              key={block.id} 
              block={block} 
              index={index}
            />
          ))}
        </article>
      </main>

      {/* Raven badge - floating bottom right */}
      <a
        href="https://tryraven.io?ref=shared"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm text-xs text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors cursor-pointer"
      >
        <img src="/images/raven-logo.png" alt="" className="w-3.5 h-3.5" />
        <span>Shared via <span className="font-medium text-gray-700">Raven</span></span>
      </a>
    </div>
  )
}

// Individual tracked block component
function TrackedBlock({ block, index }: { block: Block; index: number }) {
  const renderContent = () => {
    switch (block.type) {
      case 'heading1':
        return (
          <h1 className="text-2xl font-semibold text-gray-900 mb-4 mt-10 first:mt-0 leading-tight">
            {block.content}
          </h1>
        )
      
      case 'heading2':
        return (
          <h2 className="text-lg font-semibold text-gray-900 mb-3 mt-8 leading-snug">
            {block.content}
          </h2>
        )
      
      case 'paragraph':
        return (
          <p 
            className="text-[15px] text-gray-600 leading-relaxed mb-4"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        )
      
      case 'bulletList':
        return (
          <ul className="list-disc list-outside ml-5 text-[15px] text-gray-600 mb-4 space-y-1.5">
            {block.content.split('\n').filter(Boolean).map((item, i) => (
              <li key={i} className="leading-relaxed">{item}</li>
            ))}
          </ul>
        )
      
      case 'quote':
        return (
          <blockquote className="border-l-2 border-gray-300 pl-4 my-6 text-[15px] text-gray-500 italic">
            {block.content}
          </blockquote>
        )
      
      case 'divider':
        return <hr className="my-8 border-gray-200" />
      
      case 'callout':
        return (
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-4">
            <p className="text-[14px] text-amber-800">{block.content}</p>
          </div>
        )
      
      case 'variable':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-sm font-mono border border-emerald-100">
            {block.content}
          </span>
        )
      
      default:
        return (
          <p className="text-[15px] text-gray-600 leading-relaxed mb-4">{block.content}</p>
        )
    }
  }

  return (
    <div 
      data-block-id={block.id}
      data-block-index={index}
      data-block-type={block.type}
    >
      {renderContent()}
    </div>
  )
}