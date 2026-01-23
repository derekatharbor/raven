// app/api/editor/grounded-complete/route.ts
// Grounded autocomplete - completions based on user's connected sources
// This is the core of "AI-native" - not generic LLM, but source-grounded intelligence

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

// Voyage AI for embeddings (or use OpenAI)
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

interface SourceChunk {
  chunk_id: string
  source_document_id: string
  source_document_name: string
  content: string
  chunk_index: number
  metadata: Record<string, any>
  similarity: number
}

interface Citation {
  chunkId: string
  documentId: string
  documentName: string
  snippet: string
  confidence: number
}

interface GroundedCompletion {
  text: string
  citations: Citation[]
  groundedIn: number  // Number of source chunks used
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      documentId,
      context,           // Text before cursor
      suffix,            // Text after cursor (optional)
      instruction,       // What kind of completion (continue, elaborate, cite)
      maxTokens = 500,
      userId,            // For auth
    } = body

    if (!documentId || !context) {
      return NextResponse.json(
        { error: 'documentId and context are required' },
        { status: 400 }
      )
    }

    // 1. Get the user's connected sources for this document
    const { data: connectedSources, error: sourcesError } = await supabase
      .from('document_sources')
      .select('source_document_id')
      .eq('document_id', documentId)

    if (sourcesError) {
      console.error('Error fetching connected sources:', sourcesError)
      return NextResponse.json(
        { error: 'Failed to fetch connected sources' },
        { status: 500 }
      )
    }

    // If no sources connected, fall back to ungrounded completion
    if (!connectedSources || connectedSources.length === 0) {
      return await ungroundedCompletion(context, suffix, instruction, maxTokens)
    }

    const sourceDocumentIds = connectedSources.map(s => s.source_document_id)

    // 2. Embed the context to find relevant source chunks
    const queryText = context.slice(-2000)  // Last ~2000 chars for embedding
    const embedding = await getEmbedding(queryText)

    // 3. Search for relevant chunks in connected sources
    const { data: relevantChunks, error: searchError } = await supabase
      .rpc('search_document_chunks', {
        query_embedding: embedding,
        match_threshold: 0.65,
        match_count: 10,
        filter_document_ids: sourceDocumentIds,
      })

    if (searchError) {
      console.error('Error searching chunks:', searchError)
      // Fall back to ungrounded if search fails
      return await ungroundedCompletion(context, suffix, instruction, maxTokens)
    }

    const chunks = (relevantChunks || []) as SourceChunk[]

    // 4. Build the grounded prompt
    const groundingContext = chunks.length > 0 
      ? buildGroundingContext(chunks)
      : null

    // 5. Generate completion with Claude
    const completion = await generateGroundedCompletion(
      context,
      suffix,
      instruction,
      groundingContext,
      chunks,
      maxTokens
    )

    // 6. Store citations in the database
    if (completion.citations.length > 0 && documentId) {
      await storeCitations(documentId, completion.citations)
    }

    return NextResponse.json(completion)

  } catch (error) {
    console.error('Grounded completion error:', error)
    return NextResponse.json(
      { error: 'Failed to generate completion' },
      { status: 500 }
    )
  }
}

function buildGroundingContext(chunks: SourceChunk[]): string {
  return chunks.map((chunk, i) => 
    `[SOURCE ${i + 1}: ${chunk.source_document_name}]\n${chunk.content}\n[/SOURCE ${i + 1}]`
  ).join('\n\n')
}

async function generateGroundedCompletion(
  context: string,
  suffix: string | undefined,
  instruction: string | undefined,
  groundingContext: string | null,
  chunks: SourceChunk[],
  maxTokens: number
): Promise<GroundedCompletion> {
  
  const systemPrompt = groundingContext 
    ? `You are an AI writing assistant helping complete a professional document. You have access to the following source materials that the user has connected to this document:

${groundingContext}

CRITICAL INSTRUCTIONS:
1. When continuing the user's writing, draw from these sources when relevant
2. If you use information from a source, cite it using [SOURCE N] format
3. Stay factually grounded - do not invent information not in the sources
4. Match the user's writing style and tone
5. If the sources don't contain relevant information, you may still complete the text but DO NOT cite
6. Be concise - this is autocomplete, not an essay

You are helping complete professional analyst work. Accuracy and traceability matter.`
    : `You are an AI writing assistant helping complete a professional document. 

CRITICAL INSTRUCTIONS:
1. Continue the user's writing naturally
2. Match their style and tone
3. Be concise - this is autocomplete, not an essay
4. Since no sources are connected, do not make specific factual claims that would require citation`

  const userPrompt = instruction 
    ? `${instruction}\n\nText to continue:\n${context}${suffix ? `\n\n[Text after cursor]: ${suffix}` : ''}`
    : `Continue this text naturally:\n\n${context}${suffix ? `\n\n[Text that comes after - write to connect to this]: ${suffix}` : ''}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userPrompt }
    ],
  })

  const completionText = response.content[0].type === 'text' 
    ? response.content[0].text 
    : ''

  // Parse citations from the response
  const citations = parseCitations(completionText, chunks)
  
  // Clean the completion text (remove citation markers for display, or keep them)
  const cleanedText = cleanCompletionText(completionText)

  return {
    text: cleanedText,
    citations,
    groundedIn: chunks.length,
  }
}

function parseCitations(text: string, chunks: SourceChunk[]): Citation[] {
  const citations: Citation[] = []
  const citationRegex = /\[SOURCE (\d+)\]/g
  const seen = new Set<number>()
  
  let match
  while ((match = citationRegex.exec(text)) !== null) {
    const sourceNum = parseInt(match[1], 10)
    if (!seen.has(sourceNum) && sourceNum > 0 && sourceNum <= chunks.length) {
      seen.add(sourceNum)
      const chunk = chunks[sourceNum - 1]
      citations.push({
        chunkId: chunk.chunk_id,
        documentId: chunk.source_document_id,
        documentName: chunk.source_document_name,
        snippet: chunk.content.slice(0, 200) + (chunk.content.length > 200 ? '...' : ''),
        confidence: chunk.similarity,
      })
    }
  }
  
  return citations
}

function cleanCompletionText(text: string): string {
  // Option 1: Remove citation markers entirely
  // return text.replace(/\[SOURCE \d+\]/g, '')
  
  // Option 2: Convert to superscript-style markers (keep for now)
  return text.replace(/\[SOURCE (\d+)\]/g, '[$1]')
}

async function storeCitations(documentId: string, citations: Citation[]) {
  for (const citation of citations) {
    await supabase.from('document_citations').insert({
      document_id: documentId,
      source_document_id: citation.documentId,
      source_chunk_id: citation.chunkId,
      citation_type: 'auto',
      confidence: citation.confidence,
      snippet: citation.snippet,
      created_by: 'ai',
    })
  }
}

async function ungroundedCompletion(
  context: string,
  suffix: string | undefined,
  instruction: string | undefined,
  maxTokens: number
): Promise<NextResponse> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    system: `You are an AI writing assistant. Continue the user's text naturally and concisely. Match their style. This is autocomplete, not an essay.

IMPORTANT: No sources are connected to this document. Avoid making specific factual claims that would require citation. Focus on structure, transitions, and general content.`,
    messages: [
      { 
        role: 'user', 
        content: instruction 
          ? `${instruction}\n\nText to continue:\n${context}`
          : `Continue this text naturally:\n\n${context}`
      }
    ],
  })

  const text = response.content[0].type === 'text' 
    ? response.content[0].text 
    : ''

  return NextResponse.json({
    text,
    citations: [],
    groundedIn: 0,
    warning: 'No sources connected. Connect sources for grounded completions.',
  })
}
