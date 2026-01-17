// Path: src/app/(dashboard)/workspace/page.tsx
// src/app/(dashboard)/workspace/page.tsx

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import BlockCanvas from '@/components/canvas/BlockCanvas'
import { useAuth } from '@/lib/hooks/useAuth'
import { useDocuments, useDocument } from '@/lib/hooks/useDocument'

export default function WorkspacePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { documents, loading: docsLoading, hasFetched, createDocument } = useDocuments()
  const [activeDocId, setActiveDocId] = useState<string | null>(null)
  const creatingDocRef = useRef(false)
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Set active doc to first document or create one if none exist
  useEffect(() => {
    // Wait until we've actually fetched from DB AND finished loading
    if (!hasFetched || docsLoading || !user || creatingDocRef.current) return
    
    if (documents.length > 0) {
      // Use existing document - set first one if no active doc
      setActiveDocId(prev => {
        if (!prev || !documents.find(d => d.id === prev)) {
          return documents[0].id
        }
        return prev
      })
    } else {
      // No documents in DB - create first one (only once)
      creatingDocRef.current = true
      createDocument('').then(doc => {
        if (doc) setActiveDocId(doc.id)
      })
    }
  }, [hasFetched, docsLoading, documents, user]) // Check all conditions

  // Handle creating new document
  const handleNewDocument = useCallback(async () => {
    const doc = await createDocument('')
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