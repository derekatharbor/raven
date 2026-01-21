// src/app/api/analytics/route.ts
// Fetches detailed analytics for a single document

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const documentId = searchParams.get('document_id')
    const range = searchParams.get('range') || '30d'

    if (!documentId) {
      return NextResponse.json({ error: 'document_id required' }, { status: 400 })
    }

    // Verify user owns this document
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('id, title, user_id')
      .eq('id', documentId)
      .single()

    if (docError || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    if (doc.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get published link (include null is_active for backwards compatibility)
    const { data: link } = await supabase
      .from('published_links')
      .select('id, slug')
      .eq('document_id', documentId)
      .or('is_active.eq.true,is_active.is.null')
      .single()

    if (!link) {
      return NextResponse.json({ 
        published: false,
        stats: null,
        block_metrics: [],
        recent_sessions: [],
        questions: [],
        question_topics: [],
      })
    }

    // Calculate date filter
    const now = new Date()
    let startDate: Date
    switch (range) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default: // 30d
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Fetch sessions
    const { data: sessions } = await supabase
      .from('view_sessions')
      .select('*')
      .eq('link_id', link.id)
      .gte('started_at', startDate.toISOString())
      .order('started_at', { ascending: false })

    const allSessions = sessions || []

    // Calculate stats
    const totalViews = allSessions.length
    const uniqueViewerIds = new Set(allSessions.map((s: any) => s.viewer_id).filter(Boolean))
    const uniqueViewers = uniqueViewerIds.size || totalViews // Fallback to total if no viewer tracking
    
    const avgCompletion = totalViews > 0
      ? allSessions.reduce((sum: number, s: any) => sum + (s.completion_rate || 0), 0) / totalViews
      : 0
    
    const avgReadTime = totalViews > 0
      ? allSessions.reduce((sum: number, s: any) => sum + (s.total_dwell_ms || 0), 0) / totalViews
      : 0

    // Bounce rate: sessions with < 10s dwell or < 10% completion
    const bounces = allSessions.filter((s: any) => 
      (s.total_dwell_ms || 0) < 10000 || (s.completion_rate || 0) < 0.1
    ).length
    const bounceRate = totalViews > 0 ? bounces / totalViews : 0

    // Fetch block metrics
    const { data: blockMetrics } = await supabase
      .from('block_metrics')
      .select('*')
      .eq('link_id', link.id)
      .order('block_index', { ascending: true })

    // Format block metrics
    const formattedBlocks = (blockMetrics || []).map((b: any) => ({
      block_id: b.block_id,
      block_index: b.block_index,
      block_preview: b.block_preview || `Block ${b.block_index + 1}`,
      block_type: b.block_type || 'paragraph',
      avg_dwell_ms: b.avg_dwell_ms || 0,
      enter_count: b.enter_count || 0,
      reread_count: b.reread_count || 0,
      drop_off_count: b.drop_off_count || 0,
      engagement_score: b.engagement_score || 0,
      scroll_depth: b.scroll_depth || 0,
    }))

    // If no block metrics yet, generate placeholder from document content
    if (formattedBlocks.length === 0) {
      // Get document content
      const { data: docContent } = await supabase
        .from('documents')
        .select('content')
        .eq('id', documentId)
        .single()

      if (docContent?.content) {
        try {
          const content = typeof docContent.content === 'string' 
            ? JSON.parse(docContent.content) 
            : docContent.content
          
          const blocks = content?.content || []
          blocks.forEach((block: any, index: number) => {
            const text = extractTextFromBlock(block)
            if (text) {
              formattedBlocks.push({
                block_id: `block-${index}`,
                block_index: index,
                block_preview: text.slice(0, 100),
                block_type: block.type || 'paragraph',
                avg_dwell_ms: 0,
                enter_count: 0,
                reread_count: 0,
                drop_off_count: 0,
                engagement_score: 0,
                scroll_depth: 0,
              })
            }
          })
        } catch (e) {
          // Parsing error, leave empty
        }
      }
    }

    // Format sessions for response
    const formattedSessions = allSessions.slice(0, 50).map((s: any) => {
      // Determine scroll pattern based on metrics
      let scrollPattern: 'linear' | 'jumping' | 'skimming' = 'linear'
      const dwellMs = s.total_dwell_ms || 0
      const completion = s.completion_rate || 0
      
      if (dwellMs < 30000 && completion > 0.5) {
        scrollPattern = 'skimming'
      } else if (s.jump_count && s.jump_count > 3) {
        scrollPattern = 'jumping'
      }

      return {
        id: s.id,
        viewer_email: s.viewer_email || null,
        device_type: s.device_type || 'Desktop',
        browser: s.browser || 'Unknown',
        country: s.country || null,
        started_at: s.started_at,
        completion_rate: s.completion_rate || 0,
        total_dwell_ms: s.total_dwell_ms || 0,
        scroll_pattern: scrollPattern,
      }
    })

    // Fetch questions
    let questions: any[] = []
    let questionTopics: { topic: string; count: number }[] = []
    
    try {
      const { data: questionData } = await supabase
        .from('document_questions')
        .select('id, question, block_index, topic, created_at')
        .eq('link_id', link.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(100)

      questions = (questionData || []).map((q: any) => ({
        id: q.id,
        question: q.question,
        block_index: q.block_index,
        asked_at: q.created_at,
        topic: q.topic || 'General',
      }))

      // Aggregate topics
      const topicCounts = new Map<string, number>()
      questions.forEach((q: any) => {
        topicCounts.set(q.topic, (topicCounts.get(q.topic) || 0) + 1)
      })
      
      questionTopics = Array.from(topicCounts.entries())
        .map(([topic, count]) => ({ topic, count }))
        .sort((a, b) => b.count - a.count)
    } catch {
      // Questions table might not exist
    }

    return NextResponse.json({
      published: true,
      stats: {
        total_views: totalViews,
        unique_viewers: uniqueViewers,
        avg_completion: avgCompletion,
        avg_read_time_ms: Math.round(avgReadTime),
        questions_asked: questions.length,
        bounce_rate: bounceRate,
      },
      block_metrics: formattedBlocks,
      recent_sessions: formattedSessions,
      questions,
      question_topics: questionTopics,
    })

  } catch (error) {
    console.error('[Analytics API] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// Helper to extract text from TipTap block
function extractTextFromBlock(block: any): string {
  if (!block) return ''
  
  if (block.text) return block.text
  
  if (block.content && Array.isArray(block.content)) {
    return block.content.map(extractTextFromBlock).join(' ')
  }
  
  return ''
}