// src/app/api/autocomplete/route.ts
// Inline autocomplete API - generates next sentence suggestion from sources

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { textBefore, fullDocument, recentResearch, connectedSources } = await request.json()

    if (!textBefore) {
      return NextResponse.json({ suggestion: null })
    }

    // Get last ~500 chars for context
    const context = textBefore.slice(-500)
    
    // Build context about available sources
    let sourceContext = ''
    if (recentResearch && recentResearch.length > 0) {
      sourceContext = `\n\nRECENT RESEARCH RESULTS:\n${recentResearch.map((r: any) => 
        `[${r.source}]: ${r.text}`
      ).join('\n')}`
    }

    const systemPrompt = `You are an autocomplete assistant for professional report writing. Your job is to suggest the NEXT SENTENCE that would logically follow the user's text.

RULES:
1. Suggest ONLY ONE sentence (max 30 words)
2. The sentence must flow naturally from what came before
3. If research results are provided, prefer using facts from them
4. Be specific and substantive, not generic filler
5. Match the tone and style of the existing text
6. If you can't make a good suggestion, return empty string

${sourceContext ? `Use facts from the research results when relevant. Include the source name in brackets at the end if you use a specific fact.` : ''}

Respond with ONLY the suggested sentence, nothing else. No quotes, no explanation.`

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001', // Fast + cheap for autocomplete
      max_tokens: 100,
      system: systemPrompt,
      messages: [
        { 
          role: 'user', 
          content: `Continue this text with one sentence:\n\n${context}${sourceContext}`
        }
      ],
    })

    const textContent = response.content.find(block => block.type === 'text')
    let suggestion = textContent?.type === 'text' ? textContent.text.trim() : ''
    
    // Extract source if present (e.g., "Some fact [Reuters]" -> { text: "Some fact", source: "Reuters" })
    let source: string | null = null
    const sourceMatch = suggestion.match(/\[([^\]]+)\]\s*$/)
    if (sourceMatch) {
      source = sourceMatch[1]
      suggestion = suggestion.replace(/\s*\[[^\]]+\]\s*$/, '').trim()
    }

    // Add space prefix if suggestion doesn't start with one and context doesn't end with one
    if (suggestion && !suggestion.startsWith(' ') && !context.endsWith(' ') && !context.endsWith('\n')) {
      suggestion = ' ' + suggestion
    }

    return NextResponse.json({
      suggestion: suggestion || null,
      source,
    })

  } catch (error) {
    console.error('Autocomplete error:', error)
    return NextResponse.json({ suggestion: null })
  }
}
