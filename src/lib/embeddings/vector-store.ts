// src/lib/embeddings/vector-store.ts
// Vector store using Supabase pgvector

import { createClient } from '@supabase/supabase-js'
import type { EmbeddingDomain, EmbeddedChunk } from './types'
import { embedQuery, embedDocument, detectDomain } from './index'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export interface StoredDocument {
  id: string
  userId: string
  projectId?: string
  name: string
  content?: string
  type: string
  source: 'upload' | 'sec-edgar' | 'web'
  sourceUrl?: string
  domain: EmbeddingDomain
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface SearchResult {
  chunkId: string
  documentId: string
  content: string
  chunkIndex: number
  metadata: Record<string, unknown>
  similarity: number
}

export interface DocumentWithChunks extends StoredDocument {
  chunks: EmbeddedChunk[]
}

// Store a document and its embeddings
export async function storeDocument(
  userId: string,
  name: string,
  content: string,
  options: {
    projectId?: string
    type?: string
    source?: 'upload' | 'sec-edgar' | 'web'
    sourceUrl?: string
    domain?: EmbeddingDomain
    metadata?: Record<string, unknown>
    isSECFiling?: boolean
  } = {}
): Promise<StoredDocument> {
  const { 
    projectId, 
    type = 'Document', 
    source = 'upload',
    sourceUrl,
    domain,
    metadata = {},
    isSECFiling = false,
  } = options
  
  // Detect domain if not specified
  const effectiveDomain = domain || detectDomain(content)
  
  // Insert document into source_documents table
  const { data: doc, error: docError } = await supabase
    .from('source_documents')
    .insert({
      user_id: userId,
      project_id: projectId,
      name,
      content,
      type,
      source,
      source_url: sourceUrl,
      domain: effectiveDomain,
      metadata,
    })
    .select()
    .single()
  
  if (docError) {
    throw new Error(`Failed to store document: ${docError.message}`)
  }
  
  // Chunk and embed the document
  const embeddedChunks = await embedDocument(doc.id, content, {
    domain: effectiveDomain,
    isSECFiling,
  })
  
  // Store chunks with embeddings
  if (embeddedChunks.length > 0) {
    const chunkRows = embeddedChunks.map(chunk => ({
      document_id: doc.id,
      content: chunk.content,
      chunk_index: chunk.index,
      tokens: chunk.tokens,
      embedding: chunk.embedding,
      embedding_model: chunk.embeddingModel,
      domain: chunk.domain,
      metadata: chunk.metadata || {},
    }))
    
    const { error: chunkError } = await supabase
      .from('document_chunks')
      .insert(chunkRows)
    
    if (chunkError) {
      console.error('Failed to store chunks:', chunkError)
      // Don't throw - document is stored, chunks can be retried
    }
  }
  
  return {
    id: doc.id,
    userId: doc.user_id,
    projectId: doc.project_id,
    name: doc.name,
    type: doc.type,
    source: doc.source,
    sourceUrl: doc.source_url,
    domain: doc.domain,
    metadata: doc.metadata,
    createdAt: doc.created_at,
    updatedAt: doc.updated_at,
  }
}

// Search for relevant chunks across documents
export async function searchChunks(
  query: string,
  options: {
    documentIds?: string[]
    projectId?: string
    domain?: EmbeddingDomain
    threshold?: number
    limit?: number
  } = {}
): Promise<SearchResult[]> {
  const {
    documentIds,
    projectId,
    domain,
    threshold = 0.7,
    limit = 10,
  } = options
  
  // Embed the query
  const effectiveDomain = domain || detectDomain(query)
  const queryEmbedding = await embedQuery(query, effectiveDomain)
  
  // Search using pgvector
  const { data, error } = await supabase.rpc('search_document_chunks', {
    query_embedding: queryEmbedding.embedding,
    match_threshold: threshold,
    match_count: limit,
    filter_document_ids: documentIds || null,
    filter_project_id: projectId || null,
  })
  
  if (error) {
    throw new Error(`Search failed: ${error.message}`)
  }
  
  return (data || []).map((row: {
    id: string
    document_id: string
    content: string
    chunk_index: number
    metadata: Record<string, unknown>
    similarity: number
  }) => ({
    chunkId: row.id,
    documentId: row.document_id,
    content: row.content,
    chunkIndex: row.chunk_index,
    metadata: row.metadata,
    similarity: row.similarity,
  }))
}

// Get document by ID
export async function getDocument(documentId: string): Promise<StoredDocument | null> {
  const { data, error } = await supabase
    .from('source_documents')
    .select('*')
    .eq('id', documentId)
    .single()
  
  if (error || !data) {
    return null
  }
  
  return {
    id: data.id,
    userId: data.user_id,
    projectId: data.project_id,
    name: data.name,
    content: data.content,
    type: data.type,
    source: data.source,
    sourceUrl: data.source_url,
    domain: data.domain,
    metadata: data.metadata,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

// List documents for a user/project
export async function listDocuments(
  userId: string,
  projectId?: string
): Promise<StoredDocument[]> {
  let query = supabase
    .from('source_documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (projectId) {
    query = query.eq('project_id', projectId)
  }
  
  const { data, error } = await query
  
  if (error) {
    throw new Error(`Failed to list documents: ${error.message}`)
  }
  
  return (data || []).map(doc => ({
    id: doc.id,
    userId: doc.user_id,
    projectId: doc.project_id,
    name: doc.name,
    type: doc.type,
    source: doc.source,
    sourceUrl: doc.source_url,
    domain: doc.domain,
    metadata: doc.metadata,
    createdAt: doc.created_at,
    updatedAt: doc.updated_at,
  }))
}

// Delete document and its chunks
export async function deleteDocument(documentId: string): Promise<boolean> {
  // Chunks are deleted automatically via CASCADE
  const { error } = await supabase
    .from('source_documents')
    .delete()
    .eq('id', documentId)
  
  return !error
}

// Re-embed a document (useful if switching domains or updating embeddings)
export async function reembedDocument(
  documentId: string,
  domain?: EmbeddingDomain
): Promise<void> {
  // Get document
  const doc = await getDocument(documentId)
  if (!doc || !doc.content) {
    throw new Error('Document not found or has no content')
  }
  
  // Delete existing chunks
  await supabase
    .from('document_chunks')
    .delete()
    .eq('document_id', documentId)
  
  // Re-embed
  const effectiveDomain = domain || doc.domain
  const embeddedChunks = await embedDocument(documentId, doc.content, {
    domain: effectiveDomain,
    isSECFiling: doc.source === 'sec-edgar',
  })
  
  // Store new chunks
  if (embeddedChunks.length > 0) {
    const chunkRows = embeddedChunks.map(chunk => ({
      document_id: documentId,
      content: chunk.content,
      chunk_index: chunk.index,
      tokens: chunk.tokens,
      embedding: chunk.embedding,
      embedding_model: chunk.embeddingModel,
      domain: chunk.domain,
      metadata: chunk.metadata || {},
    }))
    
    await supabase
      .from('document_chunks')
      .insert(chunkRows)
  }
  
  // Update document domain
  await supabase
    .from('source_documents')
    .update({ domain: effectiveDomain })
    .eq('id', documentId)
}
