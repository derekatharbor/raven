// src/app/api/document-chat/route.ts
// Document-scoped chat API - answers questions ONLY from document content
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Extract a generic topic from a question (privacy-conscious)
function extractTopic(question: string): string {
  const q = question.toLowerCase()
  
  // Common topic patterns
  if (q.includes('revenue') || q.includes('sales') || q.includes('earnings')) return 'Revenue & Sales'
  if (q.includes('cost') || q.includes('expense') || q.includes('spending')) return 'Costs & Expenses'
  if (q.includes('profit') || q.includes('margin')) return 'Profitability'
  if (q.includes('growth') || q.includes('increase') || q.includes('trend')) return 'Growth & Trends'
  if (q.includes('risk') || q.includes('challenge') || q.includes('threat')) return 'Risks & Challenges'
  if (q.includes('competitor') || q.includes('market share') || q.includes('competition')) return 'Competition'
  if (q.includes('strategy') || q.includes('plan') || q.includes('goal')) return 'Strategy & Goals'
  if (q.includes('timeline') || q.includes('when') || q.includes('date')) return 'Timeline & Dates'
  if (q.includes('team') || q.includes('employee') || q.includes('hire')) return 'Team & Hiring'
  if (q.includes('product') || q.includes('feature') || q.includes('launch')) return 'Product & Features'
  if (q.includes('customer') || q.includes('client') || q.includes('user')) return 'Customers & Users'
  if (q.includes('price') || q.includes('pricing') || q.includes('cost')) return 'Pricing'
  if (q.includes('who') || q.includes('name')) return 'People & Entities'
  if (q.includes('how') || q.includes('process') || q.includes('method')) return 'Process & Methods'
  if (q.includes('why') || q.includes('reason') || q.includes('because')) return 'Rationale'
  if (q.includes('what') && q.includes('next')) return 'Next Steps'
  if (q.includes('summary') || q.includes('overview') || q.includes('main point')) return 'Summary'
  
  return 'General'
}

export async function POST(request: NextRequest) {
  try {
    const { question, documentContent, documentTitle, linkId } = await request.json()

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

    // Log question to analytics (topic only for privacy)
    if (linkId) {
      const topic = extractTopic(question)
      try {
        await supabase
          .from('document_questions')
          .insert({
            link_id: linkId,
            topic,
            created_at: new Date().toISOString(),
          })
      } catch (err) {
        // Don't fail the request if logging fails
        console.error('Failed to log question:', err)
      }
    }

    return NextResponse.json({
      answer,
    })

  } catch (error) {
    console.error('Document chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 }
    )
  }
}