// src/app/(dashboard)/dashboard/page.tsx
// Dashboard - Home view with document preview cards

'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Clock, FileText, MoreHorizontal, Trash2, X } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useDocuments } from '@/lib/hooks/useDocument'
import Sidebar from '@/components/layout/Sidebar'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

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
  document: doc, 
  onClick,
  onDelete,
}: { 
  document: { id: string; title: string; content: any; updated_at: string }
  onClick: () => void
  onDelete: () => void
}) {
  const preview = extractPreview(doc.content)
  const displayTitle = doc.title || preview.title || 'Untitled'
  const displayBody = preview.body || 'Start writing...'
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      window.addEventListener('mousedown', handleClickOutside)
    }
    return () => window.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer"
      style={{
        width: 300,
        height: 360,
        background: 'white',
        borderRadius: 16,
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        border: '1px solid #E5E5E5',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Three-dot menu */}
      <div 
        ref={menuRef}
        className="absolute top-3 right-3 z-20"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-1.5 rounded-lg bg-white/80 hover:bg-white border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          <MoreHorizontal className="w-4 h-4 text-gray-500" />
        </button>
        
        {menuOpen && (
          <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px]">
            <button
              onClick={() => {
                setMenuOpen(false)
                onDelete()
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>

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
          background: 'rgba(0,0,0,0.02)',
          borderRadius: 10,
        }} />
        
        {/* Main document preview */}
        <div style={{
          position: 'relative',
          background: '#FAFAFA',
          borderRadius: 10,
          padding: 18,
          height: '100%',
          border: '1px solid #E5E5E5',
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
            background: 'linear-gradient(180deg, rgba(250,250,250,0) 0%, rgba(250,250,250,1) 100%)',
          }} />
        </div>
      </div>

      {/* Top gradient overlay for text readability */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 160,
        background: 'linear-gradient(180deg, white 0%, white 50%, rgba(255,255,255,0) 100%)',
        borderRadius: '16px 16px 0 0',
        pointerEvents: 'none',
        zIndex: 5,
      }} />

      {/* Title & Timestamp */}
      <div style={{ position: 'relative', zIndex: 10, padding: '22px 22px' }}>
        <h3 style={{
          color: '#18181B',
          fontSize: 18,
          fontWeight: 600,
          lineHeight: 1.35,
          marginBottom: 8,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          paddingRight: 32, // Make room for menu button
        }}>
          {displayTitle}
        </h3>
        <span style={{
          color: '#71717A',
          fontSize: 13,
          fontWeight: 400,
        }}>
          {formatRelativeTime(doc.updated_at)}
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
        borderRadius: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        flexShrink: 0,
        border: '1px dashed #D4D4D8',
        transition: 'border-color 0.2s ease, background 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#A1A1AA'
        e.currentTarget.style.background = 'rgba(0,0,0,0.02)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#D4D4D8'
        e.currentTarget.style.background = 'transparent'
      }}
    >
      <div style={{
        width: 52,
        height: 52,
        borderRadius: 14,
        background: '#F4F4F5',
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

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { documents, loading: docsLoading, createDocument, deleteDocument } = useDocuments()
  const [greeting] = useState(getGreeting())
  const [deleteModal, setDeleteModal] = useState<{ id: string; title: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

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
    router.push(`/workspace?doc=${docId}`)
  }

  const handleDeleteDocument = async () => {
    if (!deleteModal) return
    setDeleting(true)
    await deleteDocument(deleteModal.id)
    setDeleting(false)
    setDeleteModal(null)
  }

  // Loading state
  if (authLoading || docsLoading) {
    return <LoadingSpinner fullScreen light message="Loading documents..." />
  }

  if (!user) return null

  // Sort documents by updated_at
  const recentDocs = [...documents].sort((a, b) => 
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  ).slice(0, 11) // Show up to 11 + 1 new = 12 cards (4 rows of 3 or 3 rows of 4)

  return (
    <div className="h-screen flex bg-[#FBF9F7]">
      <Sidebar connectedSourceCount={3} />
      
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Main Content */}
        <div style={{ padding: '48px 48px 80px' }}>
          {/* Greeting */}
          <h1 style={{
            color: '#18181B',
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
                  onDelete={() => setDeleteModal({ id: doc.id, title: doc.title || 'Untitled' })}
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
              <h3 style={{ color: '#18181B', fontSize: 18, fontWeight: 500, marginBottom: 8 }}>
                No documents yet
              </h3>
              <p style={{ fontSize: 14, marginBottom: 24 }}>
                Create your first document to get started
              </p>
              <button
                onClick={handleNewDocument}
                className="cursor-pointer"
                style={{
                  background: '#18181B',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                Create Document
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => !deleting && setDeleteModal(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Delete document?</h3>
                <button 
                  onClick={() => !deleting && setDeleteModal(null)}
                  className="p-1 hover:bg-gray-100 rounded-lg cursor-pointer"
                  disabled={deleting}
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete "<span className="font-medium">{deleteModal.title}</span>"? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setDeleteModal(null)}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteDocument}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}