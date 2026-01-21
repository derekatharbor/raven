// src/app/api/analytics/overview/route.ts
// Fetches all published documents with their analytics for the overview page

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

async function getAuthClient() {
  const cookieStore = await cookies()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          cookie: cookieStore.toString(),
        },
      },
    }
  )
  return supabase
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await getAuthClient()
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's documents first
    const { data: userDocs, error: docsError } = await supabase
      .from('documents')
      .select('id, title')
      .eq('user_id', user.id)

    if (docsError) {
      console.error('Error fetching documents:', docsError)
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }

    if (!userDocs || userDocs.length === 0) {
      return NextResponse.json({
        overview: { total_published: 0, total_views: 0, total_unique_viewers: 0, avg_completion: 0, total_questions: 0 },
        documents: [],
      })
    }

    const docIds = userDocs.map(d => d.id)
    const docMap = new Map(userDocs.map(d => [d.id, d]))

    // Get published links for user's documents
    // Include links where is_active is true OR null (for backwards compatibility)
    const { data: links, error: linksError } = await supabase
      .from('published_links')
      .select('id, document_id, slug, is_active, created_at')
      .in('document_id', docIds)
      .or('is_active.eq.true,is_active.is.null')

    if (linksError) {
      console.error('Error fetching links:', linksError)
    }

    if (!links || links.length === 0) {
      return NextResponse.json({
        overview: { total_published: 0, total_views: 0, total_unique_viewers: 0, avg_completion: 0, total_questions: 0 },
        documents: [],
      })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tryraven.io'

    // Fetch stats for each published doc
    const docsWithStats = await Promise.all(
      links.map(async (link: any) => {
        const doc = docMap.get(link.document_id)
        
        // Get sessions for this link
        const { data: sessions } = await supabase
          .from('view_sessions')
          .select('id, viewer_id, completion_rate, total_dwell_ms')
          .eq('link_id', link.id)

        const allSessions = sessions || []
        const totalViews = allSessions.length
        const uniqueViewers = new Set(allSessions.map((s: any) => s.viewer_id).filter(Boolean)).size
        const avgCompletion = totalViews > 0
          ? allSessions.reduce((sum: number, s: any) => sum + (s.completion_rate || 0), 0) / totalViews
          : 0
        const avgReadTime = totalViews > 0
          ? allSessions.reduce((sum: number, s: any) => sum + (s.total_dwell_ms || 0), 0) / totalViews
          : 0

        // Get questions for this link (gracefully handle if table doesn't exist)
        let allQuestions: any[] = []
        let questionTopics: { topic: string; count: number }[] = []
        try {
          const { data: questions } = await supabase
            .from('document_questions')
            .select('topic, created_at')
            .eq('link_id', link.id)
            .order('created_at', { ascending: false })

          allQuestions = questions || []
          
          // Aggregate by topic
          const topicCounts = new Map<string, number>()
          allQuestions.forEach((q: any) => {
            const topic = q.topic || 'General'
            topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1)
          })
          
          questionTopics = Array.from(topicCounts.entries())
            .map(([topic, count]) => ({ topic, count }))
            .sort((a, b) => b.count - a.count)
        } catch {
          // Table might not exist yet
        }

        // Get current version
        let versionNumber = 1
        let publishedAt = link.created_at
        try {
          const { data: version } = await supabase
            .from('published_versions')
            .select('version_number, published_at')
            .eq('document_id', link.document_id)
            .order('version_number', { ascending: false })
            .limit(1)
            .single()
          
          if (version) {
            versionNumber = version.version_number
            publishedAt = version.published_at
          }
        } catch {
          // Use defaults
        }

        return {
          id: link.id,
          document_id: link.document_id,
          title: doc?.title || 'Untitled',
          slug: link.slug,
          url: `${baseUrl}/d/${link.slug}`,
          published_at: publishedAt,
          version_number: versionNumber,
          stats: {
            total_views: totalViews,
            unique_viewers: uniqueViewers,
            avg_completion: avgCompletion,
            avg_read_time_ms: Math.round(avgReadTime),
            questions_asked: allQuestions.length,
          },
          question_topics: questionTopics,
        }
      })
    )

    // Calculate overview stats
    const overview = {
      total_published: docsWithStats.length,
      total_views: docsWithStats.reduce((sum, d) => sum + d.stats.total_views, 0),
      total_unique_viewers: docsWithStats.reduce((sum, d) => sum + d.stats.unique_viewers, 0),
      avg_completion: docsWithStats.length > 0
        ? docsWithStats.reduce((sum, d) => sum + d.stats.avg_completion, 0) / docsWithStats.length
        : 0,
      total_questions: docsWithStats.reduce((sum, d) => sum + d.stats.questions_asked, 0),
    }

    return NextResponse.json({
      overview,
      documents: docsWithStats.sort((a, b) => 
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      ),
    })

  } catch (error) {
    console.error('[Analytics Overview API] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}