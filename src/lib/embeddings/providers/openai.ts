// src/lib/embeddings/providers/openai.ts
// OpenAI embedding provider - general purpose fallback

import type { 
  EmbeddingProvider, 
  EmbeddingResult, 
  EmbeddingBatchResult,
  EmbeddingDomain 
} from '../types'

const OPENAI_API_URL = 'https://api.openai.com/v1/embeddings'

// OpenAI models (same model for all domains - general purpose)
const MODELS = {
  small: 'text-embedding-3-small',
  large: 'text-embedding-3-large',
}

const MODEL_DIMENSIONS: Record<string, number> = {
  'text-embedding-3-small': 1536,
  'text-embedding-3-large': 3072,
}

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  name = 'openai'
  supportedDomains: EmbeddingDomain[] = ['general'] // OpenAI is general-purpose
  
  private apiKey: string
  private model: string
  
  constructor(apiKey?: string, useLargeModel: boolean = false) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || ''
    this.model = useLargeModel ? MODELS.large : MODELS.small
    
    if (!this.apiKey) {
      console.warn('OPENAI_API_KEY not set - OpenAI embeddings will fail')
    }
  }
  
  getDimension(_domain?: EmbeddingDomain): number {
    return MODEL_DIMENSIONS[this.model]
  }
  
  async embed(text: string, _domain?: EmbeddingDomain): Promise<EmbeddingResult> {
    const result = await this.embedBatch([text])
    return {
      embedding: result.embeddings[0],
      tokens: result.totalTokens,
      model: result.model,
    }
  }
  
  async embedBatch(texts: string[], _domain?: EmbeddingDomain): Promise<EmbeddingBatchResult> {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: texts,
      }),
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenAI API error: ${response.status} - ${error}`)
    }
    
    const data = await response.json()
    
    // Sort by index to maintain order
    const sorted = data.data.sort((a: { index: number }, b: { index: number }) => a.index - b.index)
    
    return {
      embeddings: sorted.map((item: { embedding: number[] }) => item.embedding),
      totalTokens: data.usage?.total_tokens || 0,
      model: this.model,
    }
  }
}

export function createOpenAIProvider(apiKey?: string, useLargeModel: boolean = false): OpenAIEmbeddingProvider {
  return new OpenAIEmbeddingProvider(apiKey, useLargeModel)
}
