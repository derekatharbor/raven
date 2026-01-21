// src/lib/embeddings/types.ts
// Types for embedding providers

export type EmbeddingDomain = 'finance' | 'legal' | 'general'

export interface EmbeddingResult {
  embedding: number[]
  tokens: number
  model: string
}

export interface EmbeddingBatchResult {
  embeddings: number[][]
  totalTokens: number
  model: string
}

export interface EmbeddingProvider {
  name: string
  supportedDomains: EmbeddingDomain[]
  
  // Embed single text
  embed(text: string, domain?: EmbeddingDomain): Promise<EmbeddingResult>
  
  // Embed multiple texts (more efficient)
  embedBatch(texts: string[], domain?: EmbeddingDomain): Promise<EmbeddingBatchResult>
  
  // Get embedding dimension for this provider/domain
  getDimension(domain?: EmbeddingDomain): number
}

export interface ChunkOptions {
  maxTokens?: number      // Max tokens per chunk (default 500)
  overlap?: number        // Overlap between chunks (default 50)
  minTokens?: number      // Min tokens to create a chunk (default 100)
}

export interface DocumentChunk {
  id: string
  documentId: string
  content: string
  index: number           // Position in document
  tokens: number
  metadata?: {
    page?: number
    section?: string
    heading?: string
  }
}

export interface EmbeddedChunk extends DocumentChunk {
  embedding: number[]
  embeddingModel: string
  domain: EmbeddingDomain
}
