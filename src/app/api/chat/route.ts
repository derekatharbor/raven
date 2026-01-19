// Path: src/app/api/chat/route.ts
// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  context?: string
}

interface ChatRequest {
  messages: ChatMessage[]
  mode: 'ask' | 'verify'
  webEnabled: boolean
  documentContext?: string
}

// Tavily search function
async function searchWeb(query: string): Promise<{ title: string; url: string; content: string }[]> {
  if (!process.env.TAVILY_API_KEY) {
    console.warn('TAVILY_API_KEY not set, skipping web search')
    return []
  }

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query,
        search_depth: 'basic',
        max_results: 5,
        include_answer: false,
        include_raw_content: false,
      }),
    })

    if (!response.ok) {
      console.error('Tavily search failed:', response.status)
      return []
    }

    const data = await response.json()
    return data.results?.map((r: any) => ({
      title: r.title,
      url: r.url,
      content: r.content,
    })) || []
  } catch (error) {
    console.error('Tavily search error:', error)
    return []
  }
}

// Format search results for Claude
function formatSearchResults(results: { title: string; url: string; content: string }[]): string {
  if (results.length === 0) return ''
  
  return results.map((r, i) => 
    `[Source ${i + 1}] ${r.title}\nURL: ${r.url}\n${r.content}`
  ).join('\n\n')
}

// Extract primary source from search results
function extractPrimarySource(results: { title: string; url: string; content: string }[]): string | undefined {
  if (results.length === 0) return undefined
  return results[0].url
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { messages, mode, webEnabled, documentContext } = body

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      )
    }

    // Get the latest user message
    const latestMessage = messages[messages.length - 1]
    const userQuery = latestMessage.content
    const selectedText = latestMessage.context

    // Build context from web search if enabled
    let webContext = ''
    let searchResults: { title: string; url: string; content: string }[] = []
    if (webEnabled) {
      const searchQuery = selectedText 
        ? `${userQuery} ${selectedText}`.slice(0, 200)
        : userQuery
      searchResults = await searchWeb(searchQuery)
      webContext = formatSearchResults(searchResults)
    }

    // Build system prompt based on mode
    let systemPrompt = `You are Raven, an AI research assistant for document intelligence. You help users research, verify, and understand information.

Your responses should be:
- Concise and well-structured
- Cite sources when available (use [Source X] format)
- Use markdown formatting for clarity
- Be direct and helpful

IMPORTANT: At the very end of your response, include a KEY_FACT line with the single most important atomic fact that directly answers the user's question. This should be a brief, insertable snippet (under 50 words) that a writer could drop into their document.

Format: KEY_FACT: <the atomic fact>

Example: If asked about NVIDIA's market cap, end with:
KEY_FACT: $3.2 trillion (as of January 2025)`

    if (mode === 'verify') {
      systemPrompt += `

You are in VERIFY mode. Your job is to:
- Check if claims are accurate based on available sources
- Identify any discrepancies or inconsistencies
- Note what can be verified vs what needs more research
- Use ✓ for verified, ⚠️ for issues, and ? for unverified

For KEY_FACT in verify mode, provide the corrected/verified version of the claim.`
    }

    // Build the user message with context
    let fullUserMessage = userQuery

    if (selectedText) {
      fullUserMessage = `The user has selected this text from their document:\n"${selectedText}"\n\nTheir question: ${userQuery}`
    }

    if (documentContext) {
      fullUserMessage += `\n\nDocument context:\n${documentContext}`
    }

    if (webContext) {
      fullUserMessage += `\n\nWeb search results:\n${webContext}`
    }

    // Convert messages to Anthropic format
    const anthropicMessages = messages.slice(0, -1).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    // Add the enhanced user message
    anthropicMessages.push({
      role: 'user',
      content: fullUserMessage,
    })

    // Call Claude
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: anthropicMessages,
    })

    // Extract text from response
    let assistantMessage = response.content
      .filter(block => block.type === 'text')
      .map(block => (block as { type: 'text'; text: string }).text)
      .join('')

    // Extract KEY_FACT from response
    let keyFact: string | undefined
    const keyFactMatch = assistantMessage.match(/KEY_FACT:\s*(.+?)(?:\n|$)/i)
    if (keyFactMatch) {
      keyFact = keyFactMatch[1].trim()
      // Remove KEY_FACT line from the displayed message
      assistantMessage = assistantMessage.replace(/\n?KEY_FACT:\s*.+?(?:\n|$)/i, '').trim()
    }

    return NextResponse.json({
      message: assistantMessage,
      keyFact,
      source: extractPrimarySource(searchResults),
      webSearched: webEnabled && webContext.length > 0,
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}