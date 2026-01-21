// src/app/api/track/cron/route.ts
// This endpoint is called by GitHub Actions on a schedule
// Protected by CRON_SECRET header

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { runTopicSearch } from '@/lib/track/runner'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const maxDuration = 300 // 5 minutes max for Vercel

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = request.headers.get('x-cron-secret')
    if (cronSecret !== process.env.CRON_SECRET) {
      console.error('Invalid cron secret')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service role to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get all active topics due for running
    const now = new Date().toISOString()
    const { data: topics, error } = await supabase
      .from('tracked_topics')
      .select('*')
      .eq('status', 'active')
      .lte('next_run_at', now)
      .order('next_run_at', { ascending: true })
      .limit(50) // Process max 50 per run to avoid timeouts

    if (error) {
      console.error('Error fetching topics:', error)
      return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 })
    }

    if (!topics || topics.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No topics due for processing',
        processed: 0 
      })
    }

    console.log(`Processing ${topics.length} topics`)

    // Process topics in parallel with concurrency limit
    const CONCURRENCY = 5
    const results: { topicId: string; success: boolean; newFindings: number; error?: string }[] = []

    for (let i = 0; i < topics.length; i += CONCURRENCY) {
      const batch = topics.slice(i, i + CONCURRENCY)
      const batchResults = await Promise.all(
        batch.map(async (topic) => {
          try {
            const result = await runTopicSearch(topic, topic.user_id)
            return { 
              topicId: topic.id, 
              success: true, 
              newFindings: result.newFindings 
            }
          } catch (err) {
            console.error(`Error processing topic ${topic.id}:`, err)
            return { 
              topicId: topic.id, 
              success: false, 
              newFindings: 0,
              error: err instanceof Error ? err.message : 'Unknown error'
            }
          }
        })
      )
      results.push(...batchResults)
    }

    const successCount = results.filter(r => r.success).length
    const totalNewFindings = results.reduce((sum, r) => sum + r.newFindings, 0)

    return NextResponse.json({ 
      success: true,
      processed: topics.length,
      succeeded: successCount,
      failed: topics.length - successCount,
      totalNewFindings,
      results,
    })
  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Also support GET for easy testing (still requires secret)
export async function GET(request: NextRequest) {
  return POST(request)
}
