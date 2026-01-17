// Path: src/lib/hooks/useDocument.ts
// Route: src/lib/hooks/useDocument.ts

'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'

export interface Document {
  id: string
  user_id: string
  title: string
  content: any // Tiptap JSON
  status: 'active' | 'archived'
  claims_count: number
  active_contradictions: number
  created_at: string
  updated_at: string
}

export interface Claim {
  id: string
  document_id: string
  user_id: string
  claim_id: string // HAR-XXX format
  text: string
  context: string | null
  start_offset: number | null
  end_offset: number | null
  source: string
  cadence: string
  category: string
  status: 'active' | 'paused' | 'resolved'
  current_status: 'ok' | 'contradiction' | 'uncertain' | 'error' | 'pending'
  last_checked_at: string | null
  created_at: string
}

// Helper to transform DB row to Document type
function toDocument(row: any): Document {
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title || 'Untitled',
    content: row.content || {},
    status: row.status || 'active',
    claims_count: row.claims_count || 0,
    active_contradictions: row.active_contradictions || 0,
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString(),
  }
}

// Helper to transform DB row to Claim type
function toClaim(row: any): Claim {
  return {
    id: row.id,
    document_id: row.document_id,
    user_id: row.user_id,
    claim_id: row.claim_id || row.id,
    text: row.text || '',
    context: row.context || null,
    start_offset: row.start_offset || null,
    end_offset: row.end_offset || null,
    source: row.source || 'web',
    cadence: row.cadence || 'daily',
    category: row.category || 'general',
    status: row.status || 'active',
    current_status: row.current_status || 'pending',
    last_checked_at: row.last_checked_at || null,
    created_at: row.created_at || new Date().toISOString(),
  }
}

// Hook for single document with its claims
export function useDocument(documentId: string | null) {
  const [document, setDocument] = useState<Document | null>(null)
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [saving, setSaving] = useState(false)
  
  const supabase = createClient()
  const { user } = useAuth()

  // Fetch document and claims
  const fetchDocument = useCallback(async () => {
    if (!documentId || !user) {
      setDocument(null)
      setClaims([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // Fetch document
      const { data: doc, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single()
      
      if (docError) throw docError
      setDocument(toDocument(doc))

      // Fetch claims for this document
      const { data: claimsData, error: claimsError } = await supabase
        .from('claims')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false })
      
      if (claimsError) throw claimsError
      setClaims((claimsData || []).map(toClaim))

    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [documentId, user, supabase])

  useEffect(() => {
    fetchDocument()
  }, [fetchDocument])

  // Update document content (debounced save)
  const updateContent = useCallback(async (content: any) => {
    if (!documentId || !user) return

    try {
      setSaving(true)
      const { error } = await supabase
        .from('documents')
        .update({ 
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId)
      
      if (error) throw error
      
      setDocument(prev => prev ? { ...prev, content } : null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setSaving(false)
    }
  }, [documentId, user, supabase])

  // Update document title
  const updateTitle = useCallback(async (title: string) => {
    if (!documentId || !user) return

    try {
      setSaving(true)
      const { error } = await supabase
        .from('documents')
        .update({ 
          title,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId)
      
      if (error) throw error
      
      setDocument(prev => prev ? { ...prev, title } : null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setSaving(false)
    }
  }, [documentId, user, supabase])

  // Add a tracked claim
  const addClaim = useCallback(async (claimData: {
    claimId: string
    text: string
    context?: string
    startOffset?: number
    endOffset?: number
    source: string
    cadence: string
    category: string
  }) => {
    if (!documentId || !user) return null

    try {
      const { data, error } = await supabase
        .from('claims')
        .insert({
          document_id: documentId,
          user_id: user.id,
          claim_id: claimData.claimId,
          text: claimData.text,
          context: claimData.context || null,
          start_offset: claimData.startOffset || null,
          end_offset: claimData.endOffset || null,
          source: claimData.source,
          cadence: claimData.cadence,
          category: claimData.category,
          status: 'active',
          current_status: 'pending',
        })
        .select()
        .single()
      
      if (error) throw error
      
      const newClaim = toClaim(data)
      setClaims(prev => [newClaim, ...prev])
      
      return newClaim
    } catch (err) {
      setError(err as Error)
      return null
    }
  }, [documentId, user, supabase])

  // Update a claim
  const updateClaim = useCallback(async (claimId: string, updates: Partial<Claim>) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('claims')
        .update(updates)
        .eq('id', claimId)
      
      if (error) throw error
      
      setClaims(prev => prev.map(c => 
        c.id === claimId ? { ...c, ...updates } : c
      ))
    } catch (err) {
      setError(err as Error)
    }
  }, [user, supabase])

  // Delete a claim
  const deleteClaim = useCallback(async (claimId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('claims')
        .delete()
        .eq('id', claimId)
      
      if (error) throw error
      
      setClaims(prev => prev.filter(c => c.id !== claimId))
    } catch (err) {
      setError(err as Error)
    }
  }, [user, supabase])

  return {
    document,
    claims,
    loading,
    saving,
    error,
    updateContent,
    updateTitle,
    addClaim,
    updateClaim,
    deleteClaim,
    refresh: fetchDocument,
  }
}

// Hook for listing all documents
export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [hasFetched, setHasFetched] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const supabase = createClient()
  const { user } = useAuth()

  const fetchDocuments = useCallback(async () => {
    if (!user) {
      setDocuments([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
      
      if (error) throw error
      
      // Set both at once to avoid race condition
      const docs = (data || []).map(toDocument)
      setDocuments(docs)
      setHasFetched(true)
    } catch (err) {
      setError(err as Error)
      setHasFetched(true) // Still mark as fetched even on error
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  // Create new document
  const createDocument = useCallback(async (title?: string) => {
    if (!user) return null

    // Use empty string if not provided, not "Untitled"
    const docTitle = title ?? ''

    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          title: docTitle,
          content: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: []
              }
            ]
          }
        })
        .select()
        .single()
      
      if (error) throw error
      
      const newDoc = toDocument(data)
      setDocuments(prev => [newDoc, ...prev])
      return newDoc
    } catch (err) {
      setError(err as Error)
      return null
    }
  }, [user, supabase])

  // Delete document
  const deleteDocument = useCallback(async (documentId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('documents')
        .update({ status: 'archived' })
        .eq('id', documentId)
      
      if (error) throw error
      
      setDocuments(prev => prev.filter(d => d.id !== documentId))
    } catch (err) {
      setError(err as Error)
    }
  }, [user, supabase])

  return {
    documents,
    loading,
    hasFetched,
    error,
    createDocument,
    deleteDocument,
    refresh: fetchDocuments,
  }
}