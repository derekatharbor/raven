// src/app/api/ranger/route.ts
// Core search & extraction API for Ranger
// Powers: matrix extraction, chat queries, cross-document search

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// Voyage AI for embeddings
async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'voyage-2',
      input: text,
    }),
  })
  
  const data = await response.json()
  return data.data[0].embedding
}

interface DocumentInput {
  id: string
  name: string
  content?: string
}

interface Cell {
  id: string
  value: string
  status: 'complete' | 'loading' | 'empty' | 'error'
  sourceDocId: string
  sourceLocation?: string
  sourceSnippet?: string
  reasoning?: string
  confidence?: number
}

interface SourceReference {
  cellId: string
  label: string
}

interface SearchResult {
  summary: string
  sources: SourceReference[]
  cells: Record<string, Cell>
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, documents, mode = 'search' } = body as {
      query: string
      documents: DocumentInput[]
      mode?: 'search' | 'extract'
    }

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const documentIds = documents?.map(d => d.id).filter(Boolean) || []

    // 1. Embed the query
    const queryEmbedding = await getEmbedding(query)

    // 2. Search for relevant chunks across documents
    const { data: chunks, error: searchError } = await supabase.rpc('search_document_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: 0.6,
      match_count: 20,
      filter_document_ids: documentIds.length > 0 ? documentIds : null,
    })

    if (searchError) {
      console.error('Search error:', searchError)
      return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }

    // 3. Get document names for the chunks
    const docIds = [...new Set((chunks || []).map((c: any) => c.document_id))]
    const { data: docMeta } = await supabase
      .from('source_documents')
      .select('id, name')
      .in('id', docIds)

    const docNameMap: Record<string, string> = {}
    docMeta?.forEach(d => { docNameMap[d.id] = d.name })

    // 4. Group chunks by document
    const chunksByDoc: Record<string, Array<{
      content: string
      chunk_index: number
      similarity: number
      metadata: any
    }>> = {}

    for (const chunk of (chunks || [])) {
      const docId = chunk.document_id
      if (!chunksByDoc[docId]) {
        chunksByDoc[docId] = []
      }
      chunksByDoc[docId].push({
        content: chunk.content,
        chunk_index: chunk.chunk_index,
        similarity: chunk.similarity,
        metadata: chunk.metadata || {},
      })
    }

    // 5. For each document with relevant chunks, extract an answer
    const cells: Record<string, Cell> = {}
    const allSources: SourceReference[] = []
    let sourceIndex = 1

    for (const docId of Object.keys(chunksByDoc)) {
      const docChunks = chunksByDoc[docId]
      const docName = docNameMap[docId] || 'Unknown Document'
      
      // Build context from chunks
      const context = docChunks
        .sort((a, b) => a.chunk_index - b.chunk_index)
        .map(c => c.content)
        .join('\n\n')

      // Use Claude to extract answer with reasoning
      const extractionResponse = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `You are an analyst extracting specific information from documents. 
Given a question and document content, extract the relevant answer.

IMPORTANT:
1. If the information exists, provide a clear, concise answer
2. Quote the specific text that supports your answer
3. Explain your reasoning for why this answers the question
4. Rate your confidence from 0 to 1 (1 = certain, 0 = guessing)
5. If the information is NOT in the document, say so clearly

Respond in JSON format:
{
  "found": true/false,
  "answer": "The extracted answer",
  "snippet": "Exact quote from the document",
  "location": "Best guess at location (e.g., 'Section 3' or 'Risk Factors')",
  "reasoning": "Why this answers the question",
  "confidence": 0.85
}`,
        messages: [{
          role: 'user',
          content: `Question: ${query}

Document: ${docName}

Content:
${context.slice(0, 8000)}

Extract the answer to this question from the document content.`
        }],
      })

      // Parse the response
      const responseText = extractionResponse.content[0].type === 'text' 
        ? extractionResponse.content[0].text 
        : ''

      let extraction: {
        found: boolean
        answer: string
        snippet?: string
        location?: string
        reasoning?: string
        confidence?: number
      }

      try {
        // Try to parse JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        extraction = jsonMatch ? JSON.parse(jsonMatch[0]) : { found: false, answer: '' }
      } catch {
        // If JSON parsing fails, treat whole response as answer
        extraction = {
          found: true,
          answer: responseText,
          confidence: 0.5,
        }
      }

      const cellId = `cell-${docId}-${Date.now()}`
      
      if (extraction.found && extraction.answer) {
        cells[docId] = {
          id: cellId,
          value: extraction.answer,
          status: 'complete',
          sourceDocId: docId,
          sourceLocation: extraction.location,
          sourceSnippet: extraction.snippet,
          reasoning: extraction.reasoning,
          confidence: extraction.confidence || docChunks[0]?.similarity || 0.7,
        }

        allSources.push({
          cellId,
          label: `[${sourceIndex}]`,
        })
        sourceIndex++
      } else {
        cells[docId] = {
          id: cellId,
          value: 'Not found in document',
          status: 'empty',
          sourceDocId: docId,
          reasoning: extraction.reasoning || `Searched for "${query}" but no relevant content found.`,
          confidence: extraction.confidence || 0.8,
        }
      }
    }

    // 6. Generate summary if we have results
    let summary = ''
    const foundCells = Object.values(cells).filter(c => c.status === 'complete')
    
    if (foundCells.length > 0) {
      const summaryResponse = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `Synthesize these findings into a brief summary (2-3 sentences):

Question: ${query}

Findings:
${foundCells.map((c, i) => `[${i + 1}] ${c.value}`).join('\n\n')}

Be direct and cite using [1], [2], etc.`
        }],
      })

      summary = summaryResponse.content[0].type === 'text'
        ? summaryResponse.content[0].text
        : 'Analysis complete.'
    } else {
      summary = `I searched ${Object.keys(chunksByDoc).length} document(s) but couldn't find information directly answering "${query}".`
    }

    const result: SearchResult = {
      summary,
      sources: allSources,
      cells,
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Ranger API error:', error)
    return NextResponse.json(
      { error: 'Failed to process query' },
      { status: 500 }
    )
  }
}
