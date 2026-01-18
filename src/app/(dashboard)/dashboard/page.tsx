// Path: src/app/(dashboard)/dashboard/page.tsx
// src/app/(dashboard)/dashboard/page.tsx
// Dashboard - Home view with document preview cards

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Clock, FileText } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useDocuments } from '@/lib/hooks/useDocument'
import Sidebar from '@/components/layout/Sidebar'

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

// Document Preview Card with gradient overlay
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
        width: 300,
        height: 360,
        background: '#18181B',
        borderRadius: 20,
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Document Preview Window - positioned at bottom */}
      <div style={{
        position: 'absolute',
        bottom: -20,
        left: 20,
        right: 20,
        height: 260,
      }}>
        {/* Shadow layer behind */}
        <div style={{
          position: 'absolute',
          top: 14,
          left: 8,
          right: 8,
          bottom: 8,
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 12,
        }} />
        
        {/* Main document preview */}
        <div style={{
          position: 'relative',
          background: 'white',
          borderRadius: 12,
          padding: 18,
          height: '100%',
          boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
          overflow: 'hidden',
        }}>
          {/* Document content preview */}
          <div style={{
            fontSize: 15,
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
            lineHeight: 1.7,
            display: '-webkit-box',
            WebkitLineClamp: 7,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {displayBody}
          </div>
          
          {/* Fade gradient at bottom of document */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)',
          }} />
        </div>
      </div>

      {/* Top gradient overlay for text readability */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 180,
        background: 'linear-gradient(180deg, #18181B 0%, #18181B 50%, rgba(24,24,27,0) 100%)',
        borderRadius: '20px 20px 0 0',
        pointerEvents: 'none',
        zIndex: 5,
      }} />

      {/* Title & Timestamp */}
      <div style={{ position: 'relative', zIndex: 10, padding: '22px 22px' }}>
        <h3 style={{
          color: 'white',
          fontSize: 18,
          fontWeight: 600,
          lineHeight: 1.35,
          marginBottom: 8,
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
        width: 300,
        height: 360,
        background: 'transparent',
        borderRadius: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        flexShrink: 0,
        border: '1px dashed #27272A',
        transition: 'border-color 0.2s ease, background 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#3F3F46'
        e.currentTarget.style.background = 'rgba(39,39,42,0.3)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#27272A'
        e.currentTarget.style.background = 'transparent'
      }}
    >
      <div style={{
        width: 52,
        height: 52,
        borderRadius: 14,
        background: '#27272A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Plus className="w-6 h-6 text-zinc-500" />
      </div>
      <span style={{ color: '#52525B', fontSize: 14, fontWeight: 500 }}>
        New Document
      </span>
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
  ).slice(0, 11) // Show up to 11 + 1 new = 12 cards (4 rows of 3 or 3 rows of 4)

  return (
    <div className="h-screen flex bg-[#09090B]">
      <Sidebar 
        activeWorkspaceId="ws-1"
        onWorkspaceSelect={() => {}}
        connectedSourceCount={3}
      />
      
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Main Content */}
        <div style={{ padding: '48px 48px 80px' }}>
          {/* Greeting */}
          <h1 style={{
            color: 'white',
            fontSize: 36,
            fontWeight: 600,
            marginBottom: 48,
            letterSpacing: '-0.02em',
          }}>
            {greeting}
          </h1>

          {/* Recently Edited */}
          <div>
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
              flexWrap: 'wrap',
              gap: 20, 
              paddingTop: 8,
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
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <h3 style={{ color: 'white', fontSize: 18, fontWeight: 500, marginBottom: 8 }}>
                No documents yet
              </h3>
              <p style={{ fontSize: 14, marginBottom: 24 }}>
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
    </div>
  )
}