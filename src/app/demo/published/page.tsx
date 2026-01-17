'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

// Mock document data
const mockDocument = {
  title: 'Q3 2024 Investment Analysis',
  blocks: [
    { id: 'b1', type: 'heading1', content: 'Q3 2024 Investment Analysis' },
    { id: 'b2', type: 'paragraph', content: 'Apple Inc. reported revenue of $119.6 billion for Q4 2024, representing a 6% increase year-over-year. This marks the company\'s strongest quarter in its history, driven by robust iPhone sales and continued growth in services.' },
    { id: 'b3', type: 'heading2', content: 'Key Findings' },
    { id: 'b4', type: 'paragraph', content: 'iPhone revenue reached $69.7 billion, up 5% from the prior year period. Services revenue grew to $23.1 billion, a 14% increase. The company maintained healthy gross margins of 45.2% despite macroeconomic headwinds.' },
    { id: 'b5', type: 'heading2', content: 'Market Position' },
    { id: 'b6', type: 'paragraph', content: 'Apple continues to dominate the premium smartphone segment with over 50% market share in devices priced above $800. The services ecosystem now boasts over 1 billion paid subscriptions, creating significant recurring revenue.' },
    { id: 'b7', type: 'quote', content: 'We are incredibly proud of our record-breaking quarter. Our commitment to innovation continues to resonate with customers worldwide. — Tim Cook, CEO' },
    { id: 'b8', type: 'heading2', content: 'Risk Factors' },
    { id: 'b9', type: 'paragraph', content: 'Key risks include ongoing regulatory scrutiny of the App Store, supply chain dependencies in China, and potential weakness in consumer spending. The company faces antitrust investigations in multiple jurisdictions.' },
    { id: 'b10', type: 'callout', content: 'Important: Forward-looking statements are subject to risks and uncertainties that could cause actual results to differ materially.' },
    { id: 'b11', type: 'heading2', content: 'Recommendation' },
    { id: 'b12', type: 'paragraph', content: 'We maintain our <strong>Strong Buy</strong> rating with a price target of $250, representing 20% upside from current levels. The combination of hardware innovation, services growth, and capital returns makes Apple a compelling long-term investment.' },
  ],
  versionNumber: 3,
  updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
}

export default function PublishedDocDemoPage() {
  const [readProgress, setReadProgress] = useState(0)

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setReadProgress(Math.min(100, Math.max(0, progress)))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const formatRelativeTime = (dateStr: string) => {
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

  const estimateReadTime = () => {
    const text = mockDocument.blocks.map(b => b.content).join(' ')
    const words = text.split(/\s+/).length
    return Math.ceil(words / 200)
  }

  const renderBlock = (block: { id: string; type: string; content: string }, index: number) => {
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
      case 'quote':
        return (
          <blockquote className="border-l-2 border-gray-300 pl-4 my-6 text-[15px] text-gray-500 italic">
            {block.content}
          </blockquote>
        )
      case 'callout':
        return (
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-4">
            <p className="text-[14px] text-amber-800">{block.content}</p>
          </div>
        )
      default:
        return (
          <p className="text-[15px] text-gray-600 leading-relaxed mb-4">{block.content}</p>
        )
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-gray-100 z-50">
        <div 
          className="h-full transition-all duration-150"
          style={{ 
            width: `${readProgress}%`,
            backgroundImage: 'url(/images/progress-gradient.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'left center',
          }}
        />
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-sm font-medium text-gray-900 truncate">
              {mockDocument.title}
            </h1>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400 flex-shrink-0">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {estimateReadTime()} min read
            </span>
            <span className="text-gray-300">·</span>
            <span>Updated {formatRelativeTime(mockDocument.updatedAt)}</span>
            <span className="text-gray-300">·</span>
            <span className="font-mono">v{mockDocument.versionNumber}</span>
          </div>
        </div>
      </header>

      {/* Document content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <article>
          {mockDocument.blocks.map((block, index) => (
            <div 
              key={block.id}
              data-block-id={block.id}
              data-block-index={index}
            >
              {renderBlock(block, index)}
            </div>
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