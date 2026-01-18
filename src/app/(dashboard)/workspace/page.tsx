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
  
  const OPEN_TABS_KEY = 'raven_open_tabs'
  
  // Get open tabs from localStorage
  const getOpenTabs = (): string[] => {
    try {
      return JSON.parse(localStorage.getItem(OPEN_TABS_KEY) || '[]')
    } catch { return [] }
  }
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Set active doc from URL param, or first OPEN tab, or first document
  useEffect(() => {
    // Wait until we've actually fetched from DB AND finished loading
    if (!hasFetched || docsLoading || !user || creatingDocRef.current) return
    
    if (documents.length > 0) {
      // If URL has doc param and it exists, use it
      if (docIdFromUrl && documents.find(d => d.id === docIdFromUrl)) {
        setActiveDocId(docIdFromUrl)
      } else {
        // No URL param - check localStorage for open tabs
        const openTabs = getOpenTabs()
        const firstOpenTab = openTabs.find(id => documents.some(d => d.id === id))
        
        if (firstOpenTab) {
          setActiveDocId(firstOpenTab)
          router.replace(`/workspace?doc=${firstOpenTab}`, { scroll: false })
        } else {
          // No open tabs - use first document
          const firstDocId = documents[0].id
          setActiveDocId(firstDocId)
          router.replace(`/workspace?doc=${firstDocId}`, { scroll: false })
        }
      }
    } else {
      // No documents in DB - create first one (only once)
      creatingDocRef.current = true
      createDocument('').then(doc => {
        if (doc) {
          setActiveDocId(doc.id)
          router.replace(`/workspace?doc=${doc.id}`, { scroll: false })
        }
      })
    }
  }, [hasFetched, docsLoading, documents, user, docIdFromUrl, router])

  // Handle creating new document
  const handleNewDocument = useCallback(async () => {
    const doc = await createDocument('')
    if (doc) {
      setActiveDocId(doc.id)
      router.replace(`/workspace?doc=${doc.id}`, { scroll: false })
    }
  }, [createDocument, router])

  // Handle document selection (from tab switch or close)
  const handleDocumentSelect = useCallback((docId: string) => {
    setActiveDocId(docId)
    router.replace(`/workspace?doc=${docId}`, { scroll: false })
  }, [router])

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
        onDocumentSelect={handleDocumentSelect}
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