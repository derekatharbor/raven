// src/lib/embeddings/providers/voyage.ts
// Voyage AI embedding provider - specialized models for finance, legal

import type { 
  EmbeddingProvider, 
  EmbeddingResult, 
  EmbeddingBatchResult,
  EmbeddingDomain 
} from '../types'

const VOYAGE_API_URL = 'https://api.voyageai.com/v1/embeddings'

// Model mapping by domain
const DOMAIN_MODELS: Record<EmbeddingDomain, string> = {
  finance: 'voyage-finance-2',
  legal: 'voyage-law-2',
  general: 'voyage-3',
}

// Embedding dimensions by model
const MODEL_DIMENSIONS: Record<string, number> = {
  'voyage-finance-2': 1024,
  'voyage-law-2': 1024,
  'voyage-3': 1024,
  'voyage-3-lite': 512,
}

export class VoyageEmbeddingProvider implements EmbeddingProvider {
  name = 'voyage'
  supportedDomains: EmbeddingDomain[] = ['finance', 'legal', 'general']
  
  private apiKey: string
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.VOYAGE_API_KEY || ''
    
    if (!this.apiKey) {
      console.warn('VOYAGE_API_KEY not set - Voyage embeddings will fail')
    }
  }
  
  private getModel(domain: EmbeddingDomain = 'general'): string {
    return DOMAIN_MODELS[domain]
  }
  
  getDimension(domain: EmbeddingDomain = 'general'): number {
    const model = this.getModel(domain)
    return MODEL_DIMENSIONS[model] || 1024
  }
  
  async embed(text: string, domain: EmbeddingDomain = 'general'): Promise<EmbeddingResult> {
    const result = await this.embedBatch([text], domain)
    return {
      embedding: result.embeddings[0],
      tokens: result.totalTokens,
      model: result.model,
    }
  }
  
  async embedBatch(texts: string[], domain: EmbeddingDomain = 'general'): Promise<EmbeddingBatchResult> {
    const model = this.getModel(domain)
    
    const response = await fetch(VOYAGE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: texts,
        input_type: 'document', // or 'query' for search queries
      }),
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Voyage API error: ${response.status} - ${error}`)
    }
    
    const data = await response.json()
    
    return {
      embeddings: data.data.map((item: { embedding: number[] }) => item.embedding),
      totalTokens: data.usage?.total_tokens || 0,
      model,
    }
  }
  
  // Embed a query (uses different input_type for better retrieval)
  async embedQuery(text: string, domain: EmbeddingDomain = 'general'): Promise<EmbeddingResult> {
    const model = this.getModel(domain)
    
    const response = await fetch(VOYAGE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: [text],
        input_type: 'query', // Optimized for search queries
      }),
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Voyage API error: ${response.status} - ${error}`)
    }
    
    const data = await response.json()
    
    return {
      embedding: data.data[0].embedding,
      tokens: data.usage?.total_tokens || 0,
      model,
    }
  }
}

export function createVoyageProvider(apiKey?: string): VoyageEmbeddingProvider {
  return new VoyageEmbeddingProvider(apiKey)
}
