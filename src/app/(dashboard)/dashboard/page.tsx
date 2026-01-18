// Path: src/app/(dashboard)/dashboard/page.tsx
// src/app/(dashboard)/page.tsx
// Dashboard - Home view with document preview cards

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Clock, TrendingUp, FileText, Eye } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useDocuments } from '@/lib/hooks/useDocument'

// Get time-based greeting
function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

// Format relative time
function formatRelativeTime(date: string) {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  const diffWeeks = Math.floor(diffDays / 7)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return `${diffWeeks}w ago`
}

// Extract preview text from TipTap content
function extractPreview(content: any): { title: string; body: string } {
  if (!content?.content) return { title: '', body: '' }
  
  let title = ''
  let body = ''
  
  for (const node of content.content) {
    const text = node.content?.map((c: any) => c.text || '').join('') || ''
    
    if (!title && node.type === 'heading') {
      title = text
    } else if (text) {
      body += text + ' '
      if (body.length > 150) break
    }
  }
  
  return { title, body: body.trim() }
}

// Document Preview Card
function DocumentCard({ 
  document, 
  onClick 
}: { 
  document: { id: string; title: string; content: any; updated_at: string }
  onClick: () => void 
}) {
  const preview = extractPreview(document.content)
  const displayTitle = document.title || preview.title || 'Untitled'
  const displayBody = preview.body || 'Start writing...'

  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer"
      style={{
        width: 280,
        height: 340,
        background: '#18181B',
        borderRadius: 20,
        padding: 20,
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Title & Timestamp */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <h3 style={{
          color: 'white',
          fontSize: 18,
          fontWeight: 600,
          lineHeight: 1.3,
          marginBottom: 6,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {displayTitle}
        </h3>
        <span style={{
          color: '#71717A',
          fontSize: 13,
          fontWeight: 400,
        }}>
          {formatRelativeTime(document.updated_at)}
        </span>
      </div>

      {/* Document Preview Window */}
      <div style={{
        position: 'absolute',
        bottom: -20,
        left: 20,
        right: 20,
        height: 220,
      }}>
        {/* Shadow layer */}
        <div style={{
          position: 'absolute',
          top: 20,
          left: 10,
          right: 10,
          bottom: 0,
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 12,
        }} />
        
        {/* Main document preview */}
        <div style={{
          position: 'relative',
          background: 'white',
          borderRadius: 12,
          padding: 16,
          height: '100%',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          overflow: 'hidden',
        }}>
          {/* Document content preview */}
          <div style={{
            fontSize: 14,
            fontWeight: 600,
            color: '#18181B',
            marginBottom: 8,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {displayTitle}
          </div>
          <div style={{
            fontSize: 12,
            color: '#71717A',
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 5,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {displayBody}
          </div>
          
          {/* Fade gradient at bottom */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)',
          }} />
        </div>
      </div>

      {/* Top gradient for text readability */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 120,
        background: 'linear-gradient(180deg, #18181B 0%, rgba(24,24,27,0.8) 60%, rgba(24,24,27,0) 100%)',
        borderRadius: '20px 20px 0 0',
        pointerEvents: 'none',
      }} />
    </div>
  )
}

// New Document Card
function NewDocumentCard({ onClick }: { onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="cursor-pointer"
      style={{
        width: 280,
        height: 340,
        background: '#18181B',
        borderRadius: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        flexShrink: 0,
        border: '2px dashed #27272A',
        transition: 'border-color 0.2s ease, background 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#3F3F46'
        e.currentTarget.style.background = '#1F1F23'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#27272A'
        e.currentTarget.style.background = '#18181B'
      }}
    >
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: '#27272A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Plus className="w-6 h-6 text-zinc-400" />
      </div>
      <span style={{ color: '#71717A', fontSize: 14, fontWeight: 500 }}>
        New Document
      </span>
    </div>
  )
}

// Quick Stats Card
function StatCard({ 
  icon: Icon, 
  label, 
  value 
}: { 
  icon: any
  label: string
  value: string | number 
}) {
  return (
    <div style={{
      background: '#18181B',
      borderRadius: 12,
      padding: 16,
      flex: 1,
      minWidth: 140,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Icon className="w-4 h-4 text-zinc-500" />
        <span style={{ color: '#71717A', fontSize: 12 }}>{label}</span>
      </div>
      <div style={{ color: 'white', fontSize: 24, fontWeight: 600 }}>{value}</div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { documents, loading: docsLoading, createDocument } = useDocuments()
  const [greeting] = useState(getGreeting())

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const handleNewDocument = async () => {
    const doc = await createDocument('')
    if (doc) {
      router.push('/workspace')
    }
  }

  const handleOpenDocument = (docId: string) => {
    // TODO: Pass docId to workspace
    router.push('/workspace')
  }

  // Loading state
  if (authLoading || docsLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#09090B]">
        <div className="flex items-center gap-3 text-zinc-500">
          <div className="w-5 h-5 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) return null

  // Sort documents by updated_at
  const recentDocs = [...documents].sort((a, b) => 
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  ).slice(0, 6)

  // Calculate stats
  const totalDocs = documents.length
  const thisWeekDocs = documents.filter(d => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    return new Date(d.updated_at).getTime() > weekAgo
  }).length

  return (
    <div className="min-h-screen bg-[#09090B]">
      {/* Top Navigation */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 48px',
        borderBottom: '1px solid #27272A',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img 
              src="/images/raven-logo.png" 
              alt="Raven" 
              style={{ width: 24, height: 24, filter: 'brightness(0) invert(1)' }} 
            />
            <span style={{ color: 'white', fontSize: 16, fontWeight: 600 }}>Raven</span>
          </div>
          
          {/* Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: 'none',
                background: '#27272A',
                color: 'white',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Home
            </button>
            <button
              onClick={() => router.push('/workspace')}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: 'none',
                background: 'transparent',
                color: '#71717A',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Workspace
            </button>
            <button
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: 'none',
                background: 'transparent',
                color: '#71717A',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Analytics
            </button>
          </div>
        </div>
        
        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={handleNewDocument}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              border: 'none',
              background: 'white',
              color: '#09090B',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <Plus className="w-4 h-4" />
            New
          </button>
        </div>
      </nav>
      
      {/* Main Content */}
      <div style={{ padding: '48px 48px', maxWidth: 1400, margin: '0 auto' }}>
        {/* Greeting */}
        <h1 style={{
          color: 'white',
          fontSize: 40,
          fontWeight: 600,
          marginBottom: 48,
          letterSpacing: '-0.02em',
        }}>
          {greeting}
        </h1>

        {/* Quick Stats */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 48, maxWidth: 500 }}>
          <StatCard icon={FileText} label="Documents" value={totalDocs} />
          <StatCard icon={TrendingUp} label="Active this week" value={thisWeekDocs} />
          <StatCard icon={Eye} label="Total views" value="—" />
        </div>

        {/* Recently Visited */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8, 
            marginBottom: 20,
            color: '#71717A',
            fontSize: 13,
            fontWeight: 500,
          }}>
            <Clock className="w-4 h-4" />
            <span>Recently edited</span>
          </div>

          <div style={{ 
            display: 'flex', 
            gap: 20, 
            overflowX: 'auto',
            paddingBottom: 12,
          }}>
            <NewDocumentCard onClick={handleNewDocument} />
            
            {recentDocs.map(doc => (
              <DocumentCard 
                key={doc.id}
                document={doc}
                onClick={() => handleOpenDocument(doc.id)}
              />
            ))}
          </div>
        </div>

        {/* Empty state if no documents */}
        {documents.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            color: '#71717A',
          }}>
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 style={{ color: 'white', fontSize: 18, fontWeight: 500, marginBottom: 8 }}>
              No documents yet
            </h3>
            <p style={{ fontSize: 14, marginBottom: 20 }}>
              Create your first document to get started
            </p>
            <button
              onClick={handleNewDocument}
              style={{
                background: 'white',
                color: '#09090B',
                padding: '10px 20px',
                borderRadius: 8,
                border: 'none',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Create Document
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
