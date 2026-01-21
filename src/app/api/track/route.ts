// src/app/api/track/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Available sources configuration
export const AVAILABLE_SOURCES = [
  { id: 'sec', name: 'SEC EDGAR', domain: 'sec.gov' },
  { id: 'reuters', name: 'Reuters', domain: 'reuters.com' },
  { id: 'bloomberg', name: 'Bloomberg', domain: 'bloomberg.com' },
  { id: 'wsj', name: 'Wall Street Journal', domain: 'wsj.com' },
  { id: 'ft', name: 'Financial Times', domain: 'ft.com' },
  { id: 'nytimes', name: 'New York Times', domain: 'nytimes.com' },
  { id: 'economist', name: 'The Economist', domain: 'economist.com' },
  { id: 'cnbc', name: 'CNBC', domain: 'cnbc.com' },
  { id: 'techcrunch', name: 'TechCrunch', domain: 'techcrunch.com' },
  { id: 'arxiv', name: 'arXiv', domain: 'arxiv.org' },
]

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

// GET - List all tracked topics for user
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          cookie: cookieStore.toString(),
        },
      },
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get topics with recent findings
    const { data: topics, error } = await supabase
      .from('tracked_topics')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching topics:', error)
      return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 })
    }

    // Get findings for each topic (last 10)
    const topicsWithFindings = await Promise.all(
      (topics || []).map(async (topic) => {
        const { data: findings } = await supabase
          .from('track_findings')
          .select('*')
          .eq('topic_id', topic.id)
          .order('created_at', { ascending: false })
          .limit(10)

        return {
          ...topic,
          findings: findings || [],
        }
      })
    )

    return NextResponse.json({ topics: topicsWithFindings, sources: AVAILABLE_SOURCES })
  } catch (error) {
    console.error('Track API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new tracked topic
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          cookie: cookieStore.toString(),
        },
      },
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { query, topic, sourceIds, cadence } = body

    // Validation
    if (!query || !query.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    if (!sourceIds || sourceIds.length === 0) {
      return NextResponse.json({ error: 'At least one source is required' }, { status: 400 })
    }

    const validCadences = ['hourly', '6h', 'daily', 'weekly']
    if (!validCadences.includes(cadence)) {
      return NextResponse.json({ error: 'Invalid cadence' }, { status: 400 })
    }

    // Create the topic
    const { data: newTopic, error } = await supabase
      .from('tracked_topics')
      .insert({
        user_id: user.id,
        query: query.trim(),
        topic: topic || 'General',
        source_ids: sourceIds,
        cadence,
        status: 'active',
        next_run_at: calculateNextRun(cadence),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating topic:', error)
      return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 })
    }

    return NextResponse.json({ topic: { ...newTopic, findings: [] } }, { status: 201 })
  } catch (error) {
    console.error('Track API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
