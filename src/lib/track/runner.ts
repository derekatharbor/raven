// src/lib/track/runner.ts
// Core logic for running tracked topic searches

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface TrackedTopic {
  id: string
  user_id: string
  query: string
  topic: string
  source_ids: string[]
  cadence: string
  status: string
  last_run_at: string | null
  next_run_at: string
  new_findings_count: number
  total_findings_count: number
}

interface SearchResult {
  source_id: string
  title: string
  snippet: string
  url: string
  published_at?: string
  raw_data?: any
}

function calculateNextRun(cadence: string): string {
  const now = new Date()
  switch (cadence) {
    case 'hourly':
      return new Date(now.getTime() + 60 * 60 * 1000).toISOString()
    case '6h':
      return new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString()
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
  }
}

// Search using Tavily for web/news sources
async function searchTavily(query: string, sourceIds: string[]): Promise<SearchResult[]> {
  if (!process.env.TAVILY_API_KEY) {
    console.warn('TAVILY_API_KEY not set, skipping web search')
    return []
  }

  // Map source IDs to search parameters
  const isNewsOnly = sourceIds.every(id => 
    ['reuters', 'bloomberg', 'wsj', 'ft', 'nytimes', 'economist', 'cnbc', 'techcrunch'].includes(id)
  )

  // Build domain filter for specific news sources
  const domainMap: Record<string, string> = {
    'reuters': 'reuters.com',
    'bloomberg': 'bloomberg.com',
    'wsj': 'wsj.com',
    'ft': 'ft.com',
    'nytimes': 'nytimes.com',
    'economist': 'economist.com',
    'cnbc': 'cnbc.com',
    'techcrunch': 'techcrunch.com',
  }

  const includeDomains = sourceIds
    .filter(id => domainMap[id])
    .map(id => domainMap[id])

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query,
        search_depth: 'advanced',
        max_results: 10,
        include_domains: includeDomains.length > 0 ? includeDomains : undefined,
        include_answer: false,
        include_raw_content: false,
      }),
    })

    if (!response.ok) {
      console.error('Tavily search failed:', response.status)
      return []
    }

    const data = await response.json()
    
    return (data.results || []).map((r: any) => {
      // Try to match result to a source
      const matchedSource = Object.entries(domainMap).find(([id, domain]) => 
        r.url?.includes(domain)
      )
      
      return {
        source_id: matchedSource ? matchedSource[0] : 'web',
        title: r.title || 'Untitled',
        snippet: r.content?.substring(0, 500) || '',
        url: r.url,
        published_at: r.published_date || null,
        raw_data: r,
      }
    })
  } catch (error) {
    console.error('Tavily search error:', error)
    return []
  }
}

// Search SEC EDGAR
async function searchSEC(query: string): Promise<SearchResult[]> {
  const SEC_BASE_URL = 'https://efts.sec.gov/LATEST/search-index'
  
  try {
    const params = new URLSearchParams({
      q: query,
      dateRange: 'custom',
      startdt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
      enddt: new Date().toISOString().split('T')[0],
    })

    const response = await fetch(`${SEC_BASE_URL}?${params}`, {
      headers: {
        'User-Agent': 'Raven/1.0 (contact@tryraven.io)',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('SEC search failed:', response.status)
      return []
    }

    const data = await response.json()
    const hits = data.hits?.hits || []

    return hits.slice(0, 10).map((hit: any) => {
      const source = hit._source
      return {
        source_id: 'sec',
        title: `${source.display_names?.[0] || 'Unknown'} ${source.form} - ${source.file_date}`,
        snippet: source.text_content?.substring(0, 500) || '',
        url: source.file_url || `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${source.ciks?.[0]}`,
        published_at: source.file_date,
        raw_data: source,
      }
    })
  } catch (error) {
    console.error('SEC search error:', error)
    return []
  }
}

// Main runner function
export async function runTopicSearch(
  topic: TrackedTopic,
  userId: string
): Promise<{ newFindings: number; totalProcessed: number }> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  const results: SearchResult[] = []
  const sourceIds = topic.source_ids || []

  // Run web/news search if any relevant sources
  const webSources = sourceIds.filter(id => 
    ['reuters', 'bloomberg', 'wsj', 'ft', 'nytimes', 'economist', 'cnbc', 'techcrunch', 'arxiv'].includes(id)
  )
  if (webSources.length > 0) {
    const webResults = await searchTavily(topic.query, webSources)
    results.push(...webResults)
  }

  // Run SEC search if enabled
  if (sourceIds.includes('sec')) {
    const secResults = await searchSEC(topic.query)
    results.push(...secResults)
  }

  // Get existing findings to check for duplicates
  const { data: existingFindings } = await supabase
    .from('track_findings')
    .select('url')
    .eq('topic_id', topic.id)

  const existingUrls = new Set((existingFindings || []).map(f => f.url))

  // Filter out duplicates
  const newResults = results.filter(r => r.url && !existingUrls.has(r.url))

  // Insert new findings
  if (newResults.length > 0) {
    const { error: insertError } = await supabase
      .from('track_findings')
      .insert(
        newResults.map(r => ({
          topic_id: topic.id,
          user_id: userId,
          source_id: r.source_id,
          title: r.title,
          snippet: r.snippet,
          url: r.url,
          published_at: r.published_at,
          is_new: true,
          raw_data: r.raw_data,
        }))
      )

    if (insertError) {
      console.error('Error inserting findings:', insertError)
    }
  }

  // Mark previous "new" findings as not new
  await supabase
    .from('track_findings')
    .update({ is_new: false })
    .eq('topic_id', topic.id)
    .eq('is_new', true)
    .lt('created_at', new Date().toISOString())

  // Update topic counters and next run
  const { error: updateError } = await supabase
    .from('tracked_topics')
    .update({
      last_run_at: new Date().toISOString(),
      next_run_at: calculateNextRun(topic.cadence),
      new_findings_count: newResults.length,
      total_findings_count: topic.total_findings_count + newResults.length,
    })
    .eq('id', topic.id)

  if (updateError) {
    console.error('Error updating topic:', updateError)
  }

  return {
    newFindings: newResults.length,
    totalProcessed: results.length,
  }
}
