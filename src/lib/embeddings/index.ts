// src/lib/embeddings/index.ts
// Main embedding service - routes to appropriate provider by domain

import type { 
  EmbeddingDomain, 
  EmbeddingResult, 
  EmbeddingBatchResult,
  EmbeddingProvider,
  DocumentChunk,
  EmbeddedChunk,
  ChunkOptions,
} from './types'
import { VoyageEmbeddingProvider, createVoyageProvider } from './providers/voyage'
import { OpenAIEmbeddingProvider, createOpenAIProvider } from './providers/openai'
import { chunkDocument, chunkSECFiling } from './chunker'

export * from './types'
export { chunkDocument, chunkSECFiling }

// Domain detection keywords
const DOMAIN_KEYWORDS: Record<EmbeddingDomain, string[]> = {
  finance: [
    'revenue', 'ebitda', 'earnings', 'quarterly', 'fiscal', '10-k', '10-q',
    'balance sheet', 'cash flow', 'securities', 'dividend', 'shareholder',
    'market cap', 'eps', 'p/e ratio', 'sec filing', 'investor', 'stock'
  ],
  legal: [
    'hereby', 'whereas', 'pursuant', 'jurisdiction', 'plaintiff', 'defendant',
    'contract', 'agreement', 'liability', 'indemnify', 'arbitration', 'clause',
    'statute', 'regulation', 'compliance', 'attorney', 'counsel', 'court'
  ],
  general: [], // Default fallback
}

// Detect domain from content
export function detectDomain(content: string): EmbeddingDomain {
  const lowerContent = content.toLowerCase()
  const scores: Record<EmbeddingDomain, number> = {
    finance: 0,
    legal: 0,
    general: 0,
  }
  
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      const matches = lowerContent.match(regex)
      if (matches) {
        scores[domain as EmbeddingDomain] += matches.length
      }
    }
  }
  
  // Find highest scoring domain
  let maxDomain: EmbeddingDomain = 'general'
  let maxScore = 0
  
  for (const [domain, score] of Object.entries(scores)) {
    if (score > maxScore && domain !== 'general') {
      maxScore = score
      maxDomain = domain as EmbeddingDomain
    }
  }
  
  // Require minimum threshold to classify as specialized
  return maxScore >= 5 ? maxDomain : 'general'
}

export class EmbeddingService {
  private providers: Map<string, EmbeddingProvider> = new Map()
  private defaultProvider: EmbeddingProvider
  
  constructor() {
    // Initialize providers based on available API keys
    if (process.env.VOYAGE_API_KEY) {
      const voyage = createVoyageProvider()
      this.providers.set('voyage', voyage)
      this.defaultProvider = voyage
    }
    
    if (process.env.OPENAI_API_KEY) {
      const openai = createOpenAIProvider()
      this.providers.set('openai', openai)
      
      // Use OpenAI as default if Voyage not available
      if (!this.defaultProvider) {
        this.defaultProvider = openai
      }
    }
    
    if (!this.defaultProvider) {
      throw new Error('No embedding provider configured. Set VOYAGE_API_KEY or OPENAI_API_KEY.')
    }
  }
  
  // Get the best provider for a domain
  private getProvider(domain: EmbeddingDomain): EmbeddingProvider {
    // Voyage is preferred for specialized domains
    if (domain !== 'general' && this.providers.has('voyage')) {
      return this.providers.get('voyage')!
    }
    
    return this.defaultProvider
  }
  
  // Embed single text
  async embed(text: string, domain?: EmbeddingDomain): Promise<EmbeddingResult> {
    const effectiveDomain = domain || detectDomain(text)
    const provider = this.getProvider(effectiveDomain)
    return provider.embed(text, effectiveDomain)
  }
  
  // Embed multiple texts
  async embedBatch(texts: string[], domain?: EmbeddingDomain): Promise<EmbeddingBatchResult> {
    // Detect domain from first text if not specified
    const effectiveDomain = domain || detectDomain(texts[0] || '')
    const provider = this.getProvider(effectiveDomain)
    return provider.embedBatch(texts, effectiveDomain)
  }
  
  // Embed a search query (optimized for retrieval)
  async embedQuery(query: string, domain?: EmbeddingDomain): Promise<EmbeddingResult> {
    const effectiveDomain = domain || detectDomain(query)
    const provider = this.getProvider(effectiveDomain)
    
    // Voyage has special query embedding
    if (provider instanceof VoyageEmbeddingProvider) {
      return provider.embedQuery(query, effectiveDomain)
    }
    
    return provider.embed(query, effectiveDomain)
  }
  
  // Chunk and embed a document
  async embedDocument(
    documentId: string,
    content: string,
    options: ChunkOptions & { domain?: EmbeddingDomain; isSECFiling?: boolean } = {}
  ): Promise<EmbeddedChunk[]> {
    const { domain, isSECFiling, ...chunkOptions } = options
    
    // Detect domain if not specified
    const effectiveDomain = domain || detectDomain(content)
    
    // Chunk the document
    const chunks = isSECFiling 
      ? chunkSECFiling(documentId, content, chunkOptions)
      : chunkDocument(documentId, content, chunkOptions)
    
    if (chunks.length === 0) {
      return []
    }
    
    // Embed all chunks in batch
    const texts = chunks.map(c => c.content)
    const result = await this.embedBatch(texts, effectiveDomain)
    
    // Combine chunks with embeddings
    const embeddedChunks: EmbeddedChunk[] = chunks.map((chunk, i) => ({
      ...chunk,
      embedding: result.embeddings[i],
      embeddingModel: result.model,
      domain: effectiveDomain,
    }))
    
    return embeddedChunks
  }
  
  // Get embedding dimension for a domain
  getDimension(domain: EmbeddingDomain = 'general'): number {
    const provider = this.getProvider(domain)
    return provider.getDimension(domain)
  }
  
  // Get info about available providers
  getProviderInfo(): { name: string; domains: EmbeddingDomain[] }[] {
    return Array.from(this.providers.entries()).map(([name, provider]) => ({
      name,
      domains: provider.supportedDomains,
    }))
  }
}

// Singleton instance
let embeddingService: EmbeddingService | null = null

export function getEmbeddingService(): EmbeddingService {
  if (!embeddingService) {
    embeddingService = new EmbeddingService()
  }
  return embeddingService
}

// Convenience functions
export async function embedText(text: string, domain?: EmbeddingDomain): Promise<EmbeddingResult> {
  return getEmbeddingService().embed(text, domain)
}

export async function embedQuery(query: string, domain?: EmbeddingDomain): Promise<EmbeddingResult> {
  return getEmbeddingService().embedQuery(query, domain)
}

export async function embedDocument(
  documentId: string,
  content: string,
  options?: ChunkOptions & { domain?: EmbeddingDomain; isSECFiling?: boolean }
): Promise<EmbeddedChunk[]> {
  return getEmbeddingService().embedDocument(documentId, content, options)
}
