// Route: src/app/(dashboard)/documents/page.tsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, FileText, MoreHorizontal, Trash2 } from 'lucide-react'

interface Document {
  id: string
  title: string
  claims_count: number
  active_contradictions: number
  updated_at: string
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents')
      if (res.ok) {
        const data = await res.json()
        setDocuments(data)
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const createDocument = async () => {
    setCreating(true)
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled Document' }),
      })
      if (res.ok) {
        const doc = await res.json()
        window.location.href = `/documents/${doc.id}`
      }
    } catch (error) {
      console.error('Failed to create document:', error)
    } finally {
      setCreating(false)
    }
  }

  const deleteDocument = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this document?')) return
    
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setDocuments(documents.filter(d => d.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete document:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600 mt-1">Create and manage your living reports</p>
        </div>
        <button
          onClick={createDocument}
          disabled={creating}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <Plus size={20} />
          {creating ? 'Creating...' : 'New Document'}
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
          <p className="text-gray-500 mb-6">Create your first document to start tracking claims</p>
          <button
            onClick={createDocument}
            disabled={creating}
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Plus size={20} />
            {creating ? 'Creating...' : 'New Document'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <Link
              key={doc.id}
              href={`/documents/${doc.id}`}
              className="group bg-white p-5 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <FileText size={24} className="text-gray-400" />
                <button
                  onClick={(e) => deleteDocument(doc.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <h3 className="font-medium text-gray-900 mb-1 truncate">{doc.title}</h3>
              <p className="text-sm text-gray-500 mb-3">Updated {formatDate(doc.updated_at)}</p>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-gray-500">
                  {doc.claims_count} claim{doc.claims_count !== 1 ? 's' : ''}
                </span>
                {doc.active_contradictions > 0 && (
                  <span className="text-yellow-600 font-medium">
                    {doc.active_contradictions} contradiction{doc.active_contradictions !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
