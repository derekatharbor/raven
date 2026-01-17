// Path: src/app/(dashboard)/workspace/page.tsx
// src/app/(dashboard)/workspace/page.tsx

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import BlockCanvas from '@/components/canvas/BlockCanvas'
import { useAuth } from '@/lib/hooks/useAuth'
import { useDocuments, useDocument } from '@/lib/hooks/useDocument'

export default function WorkspacePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { documents, loading: docsLoading, createDocument } = useDocuments()
  const [activeDocId, setActiveDocId] = useState<string | null>(null)
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Set active doc to first document or create one if none exist
  useEffect(() => {
    if (!docsLoading && user) {
      if (documents.length > 0 && !activeDocId) {
        setActiveDocId(documents[0].id)
      } else if (documents.length === 0 && !activeDocId) {
        // Auto-create first document
        createDocument('Untitled').then(doc => {
          if (doc) setActiveDocId(doc.id)
        })
      }
    }
  }, [documents, docsLoading, activeDocId, user, createDocument])

  // Handle creating new document
  const handleNewDocument = useCallback(async () => {
    const doc = await createDocument('Untitled')
    if (doc) {
      setActiveDocId(doc.id)
    }
  }, [createDocument])

  // Loading state - wait for doc creation
  if (authLoading || docsLoading || !activeDocId) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return null
  }

  return (
    <div className="h-screen flex bg-white">
      <Sidebar 
        activeWorkspaceId="ws-1"
        onWorkspaceSelect={() => {}}
        connectedSourceCount={3}
      />
      
      <BlockCanvas 
        documentId={activeDocId} 
        documents={documents}
        onDocumentSelect={setActiveDocId}
        onNewDocument={handleNewDocument}
      />
    </div>
  )
}