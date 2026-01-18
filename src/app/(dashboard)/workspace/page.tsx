// Path: src/app/(dashboard)/workspace/page.tsx
// src/app/(dashboard)/workspace/page.tsx

'use client'

import { Suspense, useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import BlockCanvas from '@/components/canvas/BlockCanvas'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/lib/hooks/useAuth'
import { useDocuments, useDocument } from '@/lib/hooks/useDocument'

function WorkspaceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const docIdFromUrl = searchParams.get('doc')
  
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

  // Set active doc from URL param, or first document, or create one
  useEffect(() => {
    // Wait until we've actually fetched from DB AND finished loading
    if (!hasFetched || docsLoading || !user || creatingDocRef.current) return
    
    if (documents.length > 0) {
      // If URL has doc param and it exists, use it
      if (docIdFromUrl && documents.find(d => d.id === docIdFromUrl)) {
        setActiveDocId(docIdFromUrl)
      } else {
        // Otherwise use first document
        setActiveDocId(prev => {
          if (!prev || !documents.find(d => d.id === prev)) {
            return documents[0].id
          }
          return prev
        })
      }
    } else {
      // No documents in DB - create first one (only once)
      creatingDocRef.current = true
      createDocument('').then(doc => {
        if (doc) setActiveDocId(doc.id)
      })
    }
  }, [hasFetched, docsLoading, documents, user, docIdFromUrl])

  // Handle creating new document
  const handleNewDocument = useCallback(async () => {
    const doc = await createDocument('')
    if (doc) {
      setActiveDocId(doc.id)
    }
  }, [createDocument])

  // Loading state - wait for doc creation
  if (authLoading || docsLoading || !activeDocId) {
    return <LoadingSpinner fullScreen light message="Loading workspace..." />
  }

  // Not authenticated
  if (!user) {
    return null
  }

  return (
    <div className="h-screen flex bg-white">
      <Sidebar connectedSourceCount={3} />
      
      <BlockCanvas 
        documentId={activeDocId} 
        documents={documents}
        onDocumentSelect={setActiveDocId}
        onNewDocument={handleNewDocument}
      />
    </div>
  )
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen light message="Loading workspace..." />}>
      <WorkspaceContent />
    </Suspense>
  )
}