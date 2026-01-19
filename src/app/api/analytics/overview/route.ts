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

    // Get all user's documents that have been published
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select(`
        id,
        title,
        published_links (
          id,
          slug,
          is_active,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .not('published_links', 'is', null)

    if (docsError) {
      console.error('Error fetching documents:', docsError)
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tryraven.io'
    
    // Filter to only published docs and build response
    const publishedDocs = (documents || []).filter(
      (doc: any) => doc.published_links && doc.published_links.length > 0
    )

    // Fetch stats for each published doc
    const docsWithStats = await Promise.all(
      publishedDocs.map(async (doc: any) => {
        const link = doc.published_links[0]
        
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

        // Get questions for this link
        const { data: questions } = await supabase
          .from('document_questions')
          .select('topic, created_at')
          .eq('link_id', link.id)
          .order('created_at', { ascending: false })

        const allQuestions = questions || []
        
        // Aggregate by topic
        const topicCounts = new Map<string, number>()
        allQuestions.forEach((q: any) => {
          const topic = q.topic || 'General'
          topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1)
        })
        
        const questionTopics = Array.from(topicCounts.entries())
          .map(([topic, count]) => ({ topic, count }))
          .sort((a, b) => b.count - a.count)

        // Get current version
        const { data: version } = await supabase
          .from('published_versions')
          .select('version_number, published_at')
          .eq('document_id', doc.id)
          .order('version_number', { ascending: false })
          .limit(1)
          .single()

        return {
          id: link.id,
          document_id: doc.id,
          title: doc.title || 'Untitled',
          slug: link.slug,
          url: `${baseUrl}/d/${link.slug}`,
          published_at: version?.published_at || link.created_at,
          version_number: version?.version_number || 1,
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
