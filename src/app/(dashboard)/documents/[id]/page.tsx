// Route: src/app/(dashboard)/documents/[id]/page.tsx

'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { SourcesPanel } from '@/components/sources/SourcesPanel'

interface Document {
  id: string
  title: string
  content: any
  claims_count: number
  active_contradictions: number
  claims?: Claim[]
}

interface Claim {
  id: string
  text: string
  status: string
  current_status: string
}

export default function DocumentEditorPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params)
  const router = useRouter()
  
  const [document, setDocument] = useState<Document | null>(null)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedClaimId, setSelectedClaimId] = useState<string | undefined>()

  useEffect(() => {
    fetchDocument()
  }, [id])

  const fetchDocument = async () => {
    try {
      const res = await fetch(`/api/documents/${id}`)
      if (res.ok) {
        const data = await res.json()
        setDocument(data)
        setTitle(data.title)
      } else {
        router.push('/documents')
      }
    } catch (error) {
      console.error('Failed to fetch document:', error)
      router.push('/documents')
    } finally {
      setLoading(false)
    }
  }

  const saveDocument = async () => {
    if (!document) return
    
    setSaving(true)
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: document.content,
        }),
      })
      if (res.ok) {
        const updated = await res.json()
        setDocument(updated)
      }
    } catch (error) {
      console.error('Failed to save document:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!document) {
    return null
  }

  // Mock sources for now - will be populated from actual claim data
  const mockSources = selectedClaimId ? [
    {
      id: '1',
      name: 'gartner',
      forecast: 'Autonomous Drone Security, Worldwide, 2024-2028',
      analyst: 'M. Fasciani',
      publishedDate: 'Sept 2025',
      status: 'verified' as const,
      lastChecked: '4 mins ago',
      keyDataPoint: '$14.2B TAM by 2028',
      confidence: 98,
      confidenceLabel: 'Primary Source',
      originalUrl: 'https://gartner.com/report/123',
    }
  ] : []

  return (
    <div className="flex h-screen">
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-4">
            <Link 
              href="/documents"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0"
              placeholder="Untitled Document"
            />
          </div>
          <button
            onClick={saveDocument}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </header>

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-4xl mx-auto py-12 px-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px] p-8">
              {/* Placeholder for Tiptap editor */}
              <div className="prose max-w-none">
                <p className="text-gray-400 italic">
                  Editor will be integrated here. For now, this is a placeholder.
                </p>
                <p className="text-gray-400 italic mt-4">
                  Highlight text to start tracking claims.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sources Panel */}
      <SourcesPanel
        sources={mockSources}
        selectedSourceId={selectedClaimId ? '1' : undefined}
        onRefresh={(sourceId) => console.log('Refresh:', sourceId)}
        onCopyCitation={(source) => {
          navigator.clipboard.writeText(`${source.keyDataPoint} (${source.name})`)
        }}
        showAllSources={false}
        onToggleShowAll={() => {}}
      />
    </div>
  )
}
