// app/api/r/[token]/ask/route.ts
// Reader Q&A - Source-scoped answers for shared documents
// This is the core of "your readers get answers from YOUR sources"

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

interface SourceChunk {
  chunk_id: string
  source_document_id: string
  source_document_name: string
  content: string
  chunk_index: number
  metadata: Record<string, any>
  similarity: number
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()
    const {
      question,
      sessionId,
      targetClaimId,  // Optional: if asking about a specific claim
      targetText,     // Optional: highlighted text context
    } = body

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    // 1. Verify the link exists, is active, and allows questions
    const { data: link, error: linkError } = await supabase
      .from('raven_links')
      .select(`
        id,
        document_id,
        allow_questions,
        source_scope,
        is_active,
        expires_at,
        documents (
          id,
          title,
          content,
          user_id
        )
      `)
      .eq('share_token', token)
      .single()

    if (linkError || !link) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      )
    }

    if (!link.is_active) {
      return NextResponse.json(
        { error: 'This link is no longer active' },
        { status: 410 }
      )
    }

    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This link has expired' },
        { status: 410 }
      )
    }

    if (!link.allow_questions) {
      return NextResponse.json(
        { error: 'Questions are not enabled for this document' },
        { status: 403 }
      )
    }

    // 2. Get connected sources for this document
    let sourceDocumentIds: string[] = []

    if (link.source_scope && link.source_scope.length > 0) {
      // Use scoped sources if specified
      sourceDocumentIds = link.source_scope
    } else {
      // Get all connected sources
      const { data: sources } = await supabase
        .from('document_sources')
        .select('source_document_id')
        .eq('document_id', link.document_id)

      sourceDocumentIds = sources?.map(s => s.source_document_id) || []
    }

    // 3. Build search query (include context if provided)
    const searchQuery = targetText 
      ? `${targetText}\n\nQuestion: ${question}`
      : question

    // 4. Search for relevant source chunks
    let relevantChunks: SourceChunk[] = []

    if (sourceDocumentIds.length > 0) {
      const embedding = await getEmbedding(searchQuery)

      const { data: chunks, error: searchError } = await supabase
        .rpc('search_document_chunks', {
          query_embedding: embedding,
          match_threshold: 0.6,
          match_count: 8,
          filter_document_ids: sourceDocumentIds,
        })

      if (!searchError && chunks) {
        relevantChunks = chunks as SourceChunk[]
      }
    }

    // 5. Also search the document content itself
    const documentContent = typeof link.documents.content === 'string' 
      ? link.documents.content 
      : JSON.stringify(link.documents.content)

    // 6. Generate answer with Claude
    const answer = await generateAnswer(
      question,
      targetText,
      documentContent,
      relevantChunks,
      link.documents.title
    )

    // 7. Record the interaction
    const { data: interaction } = await supabase
      .from('reader_interactions')
      .insert({
        raven_link_id: link.id,
        session_id: sessionId,
        interaction_type: 'question',
        target_claim_id: targetClaimId,
        target_text: targetText,
        question_text: question,
        ai_response: answer.text,
        source_chunks_used: answer.sourceChunkIds,
      })
      .select('id')
      .single()

    // 8. Return the answer
    return NextResponse.json({
      answer: answer.text,
      sources: answer.sources,
      confidence: answer.confidence,
      interactionId: interaction?.id,
    })

  } catch (error) {
    console.error('Reader ask error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

interface Answer {
  text: string
  sources: Array<{
    documentName: string
    snippet: string
    confidence: number
  }>
  sourceChunkIds: string[]
  confidence: 'high' | 'medium' | 'low' | 'none'
}

async function generateAnswer(
  question: string,
  targetText: string | undefined,
  documentContent: string,
  chunks: SourceChunk[],
  documentTitle: string
): Promise<Answer> {
  
  // Build context from sources
  const sourceContext = chunks.length > 0
    ? chunks.map((chunk, i) => 
        `[SOURCE ${i + 1}: ${chunk.source_document_name}]\n${chunk.content}\n[/SOURCE ${i + 1}]`
      ).join('\n\n')
    : ''

  // Truncate document content for context window
  const truncatedDoc = documentContent.slice(0, 8000)

  const systemPrompt = `You are an AI assistant helping a reader understand a shared document titled "${documentTitle}".

CRITICAL RULES:
1. You can ONLY answer based on the document content and attached source materials provided below
2. If the answer is not in these materials, say "I don't have enough information in the attached sources to answer that"
3. NEVER make up information or use knowledge from outside these sources
4. When you use information from a source, cite it as [SOURCE N]
5. Be concise and direct
6. If the reader highlighted specific text to ask about, focus your answer on that context

THE SHARED DOCUMENT:
${truncatedDoc}

${sourceContext ? `ATTACHED SOURCE MATERIALS:\n${sourceContext}` : 'No additional source materials are attached to this document.'}

Remember: You are scoped to ONLY these materials. This is a key security and trust feature.`

  const userPrompt = targetText
    ? `The reader highlighted this text:\n"${targetText}"\n\nAnd asked: ${question}`
    : question

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 800,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userPrompt }
    ],
  })

  const answerText = response.content[0].type === 'text' 
    ? response.content[0].text 
    : ''

  // Parse which sources were cited
  const citedSources: Answer['sources'] = []
  const sourceChunkIds: string[] = []
  const citationRegex = /\[SOURCE (\d+)\]/g
  const seen = new Set<number>()
  
  let match
  while ((match = citationRegex.exec(answerText)) !== null) {
    const sourceNum = parseInt(match[1], 10)
    if (!seen.has(sourceNum) && sourceNum > 0 && sourceNum <= chunks.length) {
      seen.add(sourceNum)
      const chunk = chunks[sourceNum - 1]
      citedSources.push({
        documentName: chunk.source_document_name,
        snippet: chunk.content.slice(0, 150) + '...',
        confidence: chunk.similarity,
      })
      sourceChunkIds.push(chunk.chunk_id)
    }
  }

  // Determine confidence level
  let confidence: Answer['confidence'] = 'none'
  if (citedSources.length > 0) {
    const avgSimilarity = citedSources.reduce((sum, s) => sum + s.confidence, 0) / citedSources.length
    if (avgSimilarity > 0.8) confidence = 'high'
    else if (avgSimilarity > 0.7) confidence = 'medium'
    else confidence = 'low'
  } else if (answerText.toLowerCase().includes("don't have enough information")) {
    confidence = 'none'
  } else {
    // Answer came from document content itself
    confidence = 'medium'
  }

  return {
    text: answerText,
    sources: citedSources,
    sourceChunkIds,
    confidence,
  }
}
