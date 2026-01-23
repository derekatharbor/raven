// app/api/raven-links/[id]/analytics/route.ts
// Analytics for document owners - "know what your readers actually need"

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: linkId } = await params
    const supabase = await createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user owns this link
    const { data: link, error: linkError } = await supabase
      .from('raven_links')
      .select('id, document_id, user_id, view_count, unique_viewers, question_count, created_at')
      .eq('id', linkId)
      .single()

    if (linkError || !link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    if (link.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('range') || '7d'  // 7d, 30d, 90d, all

    // Calculate date filter
    let dateFilter = null
    if (timeRange !== 'all') {
      const days = parseInt(timeRange.replace('d', ''), 10)
      dateFilter = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    }

    // 1. Get sessions with optional date filter
    let sessionsQuery = supabase
      .from('reader_sessions')
      .select('*')
      .eq('raven_link_id', linkId)
      .order('started_at', { ascending: false })

    if (dateFilter) {
      sessionsQuery = sessionsQuery.gte('started_at', dateFilter)
    }

    const { data: sessions } = await sessionsQuery

    // 2. Get interactions with optional date filter
    let interactionsQuery = supabase
      .from('reader_interactions')
      .select(`
        *,
        claims (
          text
        )
      `)
      .eq('raven_link_id', linkId)
      .order('created_at', { ascending: false })

    if (dateFilter) {
      interactionsQuery = interactionsQuery.gte('created_at', dateFilter)
    }

    const { data: interactions } = await interactionsQuery

    // 3. Calculate metrics
    const totalSessions = sessions?.length || 0
    const uniqueReaders = new Set(sessions?.map(s => s.reader_email || s.anonymous_id)).size
    
    const totalTimeSeconds = sessions?.reduce((sum, s) => sum + (s.total_time_seconds || 0), 0) || 0
    const avgTimeSeconds = totalSessions > 0 ? Math.round(totalTimeSeconds / totalSessions) : 0
    
    const avgScrollDepth = totalSessions > 0
      ? Math.round((sessions?.reduce((sum, s) => sum + (s.max_scroll_depth || 0), 0) || 0) / totalSessions * 100)
      : 0

    // 4. Group interactions by type
    const interactionsByType: Record<string, number> = {}
    interactions?.forEach(i => {
      interactionsByType[i.interaction_type] = (interactionsByType[i.interaction_type] || 0) + 1
    })

    // 5. Get questions asked
    const questions = interactions
      ?.filter(i => i.interaction_type === 'question' && i.question_text)
      .map(i => ({
        question: i.question_text,
        answer: i.ai_response?.slice(0, 200) + (i.ai_response?.length > 200 ? '...' : ''),
        helpful: i.response_helpful,
        targetText: i.target_text,
        askedAt: i.created_at,
      })) || []

    // 6. Find most scrutinized claims
    const claimScrutiny: Record<string, { claimId: string, text: string, count: number }> = {}
    interactions?.forEach(i => {
      if (i.target_claim_id) {
        const key = i.target_claim_id
        if (!claimScrutiny[key]) {
          claimScrutiny[key] = {
            claimId: i.target_claim_id,
            text: i.claims?.text || i.target_text || 'Unknown claim',
            count: 0,
          }
        }
        claimScrutiny[key].count++
      }
    })
    const mostScrutinizedClaims = Object.values(claimScrutiny)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // 7. Views over time (daily)
    const viewsByDay: Record<string, number> = {}
    sessions?.forEach(s => {
      const day = s.started_at.split('T')[0]
      viewsByDay[day] = (viewsByDay[day] || 0) + 1
    })
    const viewsTimeline = Object.entries(viewsByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // 8. Reader breakdown (if emails captured)
    const readerBreakdown = sessions
      ?.filter(s => s.reader_email)
      .reduce((acc, s) => {
        const email = s.reader_email!
        if (!acc[email]) {
          acc[email] = {
            email,
            visits: 0,
            totalTime: 0,
            lastVisit: s.started_at,
          }
        }
        acc[email].visits++
        acc[email].totalTime += s.total_time_seconds || 0
        if (s.started_at > acc[email].lastVisit) {
          acc[email].lastVisit = s.started_at
        }
        return acc
      }, {} as Record<string, { email: string, visits: number, totalTime: number, lastVisit: string }>)

    const topReaders = Object.values(readerBreakdown || {})
      .sort((a, b) => b.totalTime - a.totalTime)
      .slice(0, 10)

    // 9. Section engagement (if sections are tracked)
    const sectionEngagement: Record<string, { section: string, timeSpent: number, interactions: number }> = {}
    interactions?.forEach(i => {
      if (i.target_section) {
        const section = i.target_section
        if (!sectionEngagement[section]) {
          sectionEngagement[section] = { section, timeSpent: 0, interactions: 0 }
        }
        sectionEngagement[section].interactions++
        if (i.duration_seconds) {
          sectionEngagement[section].timeSpent += i.duration_seconds
        }
      }
    })
    const topSections = Object.values(sectionEngagement)
      .sort((a, b) => b.interactions - a.interactions)
      .slice(0, 10)

    return NextResponse.json({
      overview: {
        totalViews: link.view_count,
        uniqueReaders,
        totalQuestions: questions.length,
        avgTimeSeconds,
        avgScrollDepth,
        linkCreatedAt: link.created_at,
      },
      engagement: {
        interactionsByType,
        viewsTimeline,
      },
      questions: {
        total: questions.length,
        recent: questions.slice(0, 20),
      },
      scrutiny: {
        mostScrutinizedClaims,
      },
      readers: {
        topReaders,
        anonymous: totalSessions - topReaders.length,
      },
      sections: {
        topSections,
      },
      raw: {
        sessions: sessions?.slice(0, 50),
        interactions: interactions?.slice(0, 100),
      },
    })

  } catch (error) {
    console.error('Analytics GET error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
