// src/app/api/document-chat/route.ts
// Document-scoped chat API - answers questions ONLY from document content
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { question, documentContent, documentTitle, sessionId } = await request.json()

    if (!question || !documentContent) {
      return NextResponse.json(
        { error: 'Question and document content are required' },
        { status: 400 }
      )
    }

    const systemPrompt = `You are a helpful assistant that answers questions ONLY based on the provided document. 

CRITICAL RULES:
1. ONLY use information from the document provided below to answer questions
2. If the answer is not in the document, say "I couldn't find that information in this document."
3. Be concise and direct - readers want quick answers
4. When possible, quote or reference specific parts of the document
5. Never make up information or use external knowledge
6. If asked about topics outside the document, politely redirect: "This document doesn't cover that topic. Is there something else about [document topic] I can help with?"

DOCUMENT TITLE: ${documentTitle || 'Untitled'}

DOCUMENT CONTENT:
${documentContent}

---
Answer the reader's question based ONLY on the above document.`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        { role: 'user', content: question }
      ],
    })

    const textContent = response.content.find(block => block.type === 'text')
    const answer = textContent?.type === 'text' ? textContent.text : 'Unable to generate response'

    // TODO: Log question to analytics for author insights
    // This would be: INSERT INTO document_questions (session_id, question, answer) VALUES (...)

    return NextResponse.json({
      answer,
      sessionId,
    })

  } catch (error) {
    console.error('Document chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 }
    )
  }
}
