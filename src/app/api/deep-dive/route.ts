// src/app/api/deep-dive/route.ts
// Multi-agent Deep Dive with SSE streaming

import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Source adapters
async function searchWeb(query: string): Promise<{ title: string; url: string; content: string; domain: string }[]> {
  if (!process.env.TAVILY_API_KEY) return []

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query,
        search_depth: 'advanced',
        max_results: 5,
        include_answer: false,
        include_raw_content: false,
      }),
    })

    if (!response.ok) return []
    const data = await response.json()
    
    return data.results?.map((r: any) => ({
      title: r.title,
      url: r.url,
      content: r.content,
      domain: new URL(r.url).hostname.replace('www.', ''),
    })) || []
  } catch (error) {
    console.error('Tavily error:', error)
    return []
  }
}

async function searchSEC(query: string, ticker?: string): Promise<{ title: string; url: string; content: string; domain: string }[]> {
  const SEC_BASE_URL = 'https://data.sec.gov'
  const userAgent = 'Raven/1.0 (contact@tryraven.io)'

  try {
    // If ticker provided, get company filings
    if (ticker) {
      // First get CIK
      const tickersRes = await fetch(`${SEC_BASE_URL}/files/company_tickers.json`, {
        headers: { 'User-Agent': userAgent, 'Accept': 'application/json' },
      })
      const tickersData = await tickersRes.json()
      
      let cik: string | null = null
      for (const key of Object.keys(tickersData)) {
        if (tickersData[key].ticker?.toUpperCase() === ticker.toUpperCase()) {
          cik = String(tickersData[key].cik_str).padStart(10, '0')
          break
        }
      }

      if (!cik) return []

      // Get company submissions
      const subRes = await fetch(`${SEC_BASE_URL}/submissions/CIK${cik}.json`, {
        headers: { 'User-Agent': userAgent, 'Accept': 'application/json' },
      })
      const subData = await subRes.json()

      const results: { title: string; url: string; content: string; domain: string }[] = []
      const filings = subData.filings?.recent

      if (filings) {
        const count = Math.min(filings.accessionNumber?.length || 0, 5)
        for (let i = 0; i < count; i++) {
          const form = filings.form?.[i]
          const accession = filings.accessionNumber?.[i]
          const filingDate = filings.filingDate?.[i]
          const desc = filings.primaryDocDescription?.[i] || ''

          // Only include substantive filings
          if (['10-K', '10-Q', '8-K', 'DEF 14A'].includes(form)) {
            results.push({
              title: `${subData.name} ${form} - ${filingDate}`,
              url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${cik}&type=${form}`,
              content: `${subData.name} filed ${form} on ${filingDate}. ${desc}`,
              domain: 'sec.gov',
            })
          }
        }
      }

      return results
    }

    // Full-text search (fallback)
    return []
  } catch (error) {
    console.error('SEC error:', error)
    return []
  }
}

// Extract ticker from query
function extractTicker(text: string): string | null {
  const tickerPatterns = [
    /\b(AAPL|MSFT|GOOGL|GOOG|AMZN|NVDA|META|TSLA|AMD|INTC|CRM|ORCL|IBM|NFLX|DIS|BA|GS|JPM|BAC|WFC|V|MA|PYPL|SQ|COIN)\b/i,
    /\$([A-Z]{1,5})\b/,
    /\b([A-Z]{2,5})\s+(?:stock|shares|company|corp|inc)/i,
  ]

  for (const pattern of tickerPatterns) {
    const match = text.match(pattern)
    if (match) return (match[1] || match[0]).toUpperCase()
  }
  return null
}

// SSE helper
function createSSEStream() {
  const encoder = new TextEncoder()
  let controller: ReadableStreamDefaultController<Uint8Array>

  const stream = new ReadableStream({
    start(c) {
      controller = c
    },
  })

  const send = (event: string, data: any) => {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
    controller.enqueue(encoder.encode(message))
  }

  const close = () => {
    controller.close()
  }

  return { stream, send, close }
}

interface DeepDiveRequest {
  query: string
  sources: string[] // ['web', 'sec', 'internal']
  context?: string
}

export async function POST(request: NextRequest) {
  const body: DeepDiveRequest = await request.json()
  const { query, sources, context } = body

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500 })
  }

  const { stream, send, close } = createSSEStream()

  // Run the deep dive in background
  ;(async () => {
    try {
      // STEP 1: Orchestrator decomposes the query
      send('step', { id: 'decompose', label: 'Analyzing query', status: 'running' })

      const ticker = extractTicker(query)
      
      const orchestratorResponse = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: `You are a research orchestrator. Break down complex queries into 3-5 specific, searchable sub-tasks.

Output JSON only:
{
  "entities": ["list of key entities/companies/people"],
  "subtasks": [
    { "id": "task1", "query": "specific search query", "purpose": "what this finds" },
    ...
  ]
}

Keep queries concise and searchable. Focus on finding factual, verifiable information.`,
        messages: [{ role: 'user', content: query }],
      })

      const orchestratorText = orchestratorResponse.content
        .filter(b => b.type === 'text')
        .map(b => (b as { type: 'text'; text: string }).text)
        .join('')

      let plan: { entities: string[]; subtasks: { id: string; query: string; purpose: string }[] }
      try {
        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = orchestratorText.match(/\{[\s\S]*\}/)
        plan = JSON.parse(jsonMatch?.[0] || orchestratorText)
      } catch {
        plan = {
          entities: ticker ? [ticker] : [],
          subtasks: [
            { id: 'main', query: query, purpose: 'Primary research' },
          ],
        }
      }

      send('step', { id: 'decompose', label: 'Analyzing query', status: 'complete', result: `${plan.subtasks.length} research tasks` })
      send('plan', plan)

      // STEP 2: Execute sub-tasks in parallel
      send('step', { id: 'search', label: 'Searching sources', status: 'running' })

      const searchPromises = plan.subtasks.map(async (task) => {
        const results: { title: string; url: string; content: string; domain: string }[] = []

        // Search enabled sources
        if (sources.includes('web')) {
          const webResults = await searchWeb(task.query)
          results.push(...webResults)
        }

        if (sources.includes('sec')) {
          const taskTicker = extractTicker(task.query) || ticker
          if (taskTicker) {
            const secResults = await searchSEC(task.query, taskTicker)
            results.push(...secResults)
          }
        }

        return { taskId: task.id, query: task.query, results }
      })

      const searchResults = await Promise.all(searchPromises)
      const allResults = searchResults.flatMap(r => r.results)

      send('step', { id: 'search', label: 'Searching sources', status: 'complete', result: `${allResults.length} sources found` })

      // STEP 3: Analyze findings with Haiku (parallel)
      send('step', { id: 'analyze', label: 'Analyzing findings', status: 'running' })

      const analysisPromises = searchResults.map(async ({ taskId, query: taskQuery, results }) => {
        if (results.length === 0) return { taskId, findings: [] }

        const sourceContext = results.map((r, i) => 
          `[Source ${i + 1}] ${r.title}\nURL: ${r.url}\n${r.content}`
        ).join('\n\n')

        const analysisResponse = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514', // Using Sonnet for better extraction
          max_tokens: 1024,
          system: `Extract key facts from the sources that answer the research question.

Output JSON array only:
[
  { "text": "specific fact or finding", "source": "source name", "sourceUrl": "url", "confidence": 0.0-1.0 },
  ...
]

Rules:
- Each fact should be a complete, insertable sentence
- Be specific with numbers, dates, names
- Only include facts supported by the sources
- Max 3 facts per analysis`,
          messages: [{
            role: 'user',
            content: `Research question: ${taskQuery}\n\nSources:\n${sourceContext}`,
          }],
        })

        const analysisText = analysisResponse.content
          .filter(b => b.type === 'text')
          .map(b => (b as { type: 'text'; text: string }).text)
          .join('')

        try {
          const jsonMatch = analysisText.match(/\[[\s\S]*\]/)
          const findings = JSON.parse(jsonMatch?.[0] || '[]')
          return { taskId, findings }
        } catch {
          return { taskId, findings: [] }
        }
      })

      const analysisResults = await Promise.all(analysisPromises)
      const allFindings = analysisResults.flatMap(r => r.findings)

      send('step', { id: 'analyze', label: 'Analyzing findings', status: 'complete', result: `${allFindings.length} key facts` })

      // Send findings as they're ready
      for (const finding of allFindings) {
        send('finding', finding)
      }

      // STEP 4: Synthesize (if we have multiple findings)
      if (allFindings.length > 1) {
        send('step', { id: 'synthesize', label: 'Synthesizing insights', status: 'running' })

        const synthesisResponse = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 512,
          system: `Write a brief 2-3 sentence synthesis of the key findings. Be direct and actionable.`,
          messages: [{
            role: 'user',
            content: `Original question: ${query}\n\nKey findings:\n${allFindings.map(f => `- ${f.text} [${f.source}]`).join('\n')}`,
          }],
        })

        const synthesis = synthesisResponse.content
          .filter(b => b.type === 'text')
          .map(b => (b as { type: 'text'; text: string }).text)
          .join('')

        send('step', { id: 'synthesize', label: 'Synthesizing insights', status: 'complete' })
        send('synthesis', { text: synthesis })
      } else {
        send('step', { id: 'synthesize', label: 'Synthesizing insights', status: 'complete' })
      }

      // Done
      send('complete', { 
        totalFindings: allFindings.length,
        sourcesSearched: sources,
        entities: plan.entities,
      })

    } catch (error) {
      console.error('Deep dive error:', error)
      send('error', { message: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      close()
    }
  })()

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
