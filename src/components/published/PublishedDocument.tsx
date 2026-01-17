// Path: src/components/published/PublishedDocument.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import { RavenTracker, generateFingerprint } from '@/lib/tracking/tracker'
import type { Block, StartSessionResponse } from '@/types/tracking'

interface PublishedDocumentProps {
  slug: string
  linkId: string
  requireEmail: boolean
  initialVersion?: {
    title: string
    blocks: Block[]
  }
}

export default function PublishedDocument({ 
  slug, 
  linkId, 
  requireEmail,
  initialVersion 
}: PublishedDocumentProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [showEmailGate, setShowEmailGate] = useState(requireEmail)
  const [document, setDocument] = useState<{ title: string; blocks: Block[] } | null>(
    initialVersion || null
  )
  const trackerRef = useRef<RavenTracker | null>(null)

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

  // Email gate
  if (showEmailGate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Enter your email to view</h1>
            <p className="text-gray-500 mt-2 text-sm">The document owner will be notified of your view.</p>
          </div>
          
          <form onSubmit={handleEmailSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'View Document'}
            </button>
          </form>
          
          <p className="text-xs text-gray-400 text-center mt-4">
            Powered by Raven
          </p>
        </div>
      </div>
    )
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading document...</div>
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Unable to load</h1>
          <p className="text-gray-500 mt-2">{error}</p>
        </div>
      </div>
    )
  }

  // Document view
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900 truncate">
            {document?.title}
          </h1>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Live
            </span>
          </div>
        </div>
      </header>

      {/* Document content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {document?.blocks.map((block, index) => (
            <TrackedBlock 
              key={block.id} 
              block={block} 
              index={index}
            />
          ))}
        </article>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-gray-400">
        Shared via <span className="font-medium">Raven</span>
      </footer>
    </div>
  )
}

// Individual tracked block component
function TrackedBlock({ block, index }: { block: Block; index: number }) {
  const renderContent = () => {
    switch (block.type) {
      case 'heading1':
        return (
          <h1 className="text-2xl font-bold text-gray-900 mb-4 mt-8 first:mt-0">
            {block.content}
          </h1>
        )
      
      case 'heading2':
        return (
          <h2 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
            {block.content}
          </h2>
        )
      
      case 'paragraph':
        return (
          <p 
            className="text-gray-700 leading-relaxed mb-4"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        )
      
      case 'bulletList':
        return (
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
            {block.content.split('\n').map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )
      
      case 'quote':
        return (
          <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-4">
            {block.content}
          </blockquote>
        )
      
      case 'divider':
        return <hr className="my-8 border-gray-200" />
      
      case 'callout':
        return (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <p className="text-amber-800">{block.content}</p>
          </div>
        )
      
      case 'variable':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-sm font-mono">
            {block.content}
          </span>
        )
      
      default:
        return (
          <p className="text-gray-700 mb-4">{block.content}</p>
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
