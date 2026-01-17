// Path: src/app/api/publish/route.ts
// Publish API Endpoint
// Creates or updates published versions of documents

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Create authenticated client (without strict types for new tables)
async function getClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch { /* Server Component */ }
        },
      },
    }
  )
}

export async function POST(req: NextRequest) {
  console.log('[Publish API] POST request received')
  
  try {
    const supabase = await getClient()
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('[Publish API] Auth check:', { userId: user?.id, error: authError?.message })
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { 
      document_id, 
      blocks, 
      title,
      commit_message,
      require_email = false,
      notify_on_view = true,
      expires_in_days,
    } = body
    
    console.log('[Publish API] Request body:', { document_id, title, blocksCount: blocks?.length })

    // Verify document ownership
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('id, user_id')
      .eq('id', document_id)
      .eq('user_id', user.id)
      .single()

    console.log('[Publish API] Doc check:', { doc, error: docError?.message })

    if (docError || !doc) {
      return NextResponse.json({ error: 'Document not found', details: docError?.message }, { status: 404 })
    }

    // Get current version number
    const { data: latestVersion, error: latestError } = await (supabase
      .from('document_versions' as any)
      .select('version_number')
      .eq('document_id', document_id)
      .order('version_number', { ascending: false })
      .limit(1)
      .single() as any)

    console.log('[Publish API] Latest version:', { latestVersion, error: latestError?.message })

    const newVersionNumber = ((latestVersion as any)?.version_number || 0) + 1
    console.log('[Publish API] New version number:', newVersionNumber)

    // Create new version
    const { data: version, error: versionError } = await (supabase
      .from('document_versions' as any)
      .insert({
        document_id,
        version_number: newVersionNumber,
        blocks_snapshot: blocks,
        title_snapshot: title,
        commit_message: commit_message || `Version ${newVersionNumber}`,
        created_by: user.id,
      })
      .select('id')
      .single() as any)

    console.log('[Publish API] Version created:', { version, error: versionError?.message, code: versionError?.code })

    if (versionError) {
      console.error('[Publish API] Version creation error:', versionError)
      return NextResponse.json({ error: 'Failed to create version', details: versionError.message }, { status: 500 })
    }

    // Check for existing published link
    const { data: existingLink } = await (supabase
      .from('published_links' as any)
      .select('id, slug')
      .eq('document_id', document_id)
      .single() as any)

    console.log('[Publish API] Existing link check:', { existingLink })

    let link
    
    if (existingLink) {
      // Update existing link
      const { data: updatedLink, error: updateError } = await (supabase
        .from('published_links' as any)
        .update({
          current_version_id: version.id,
          require_email,
          notify_on_view,
          expires_at: expires_in_days 
            ? new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000).toISOString()
            : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingLink.id)
        .select('id, slug')
        .single() as any)

      console.log('[Publish API] Link update:', { updatedLink, error: updateError?.message })

      if (updateError) {
        return NextResponse.json({ error: 'Failed to update link', details: updateError.message }, { status: 500 })
      }
      
      link = updatedLink
    } else {
      // Create new published link
      const slug = generateSlug()
      console.log('[Publish API] Creating new link with slug:', slug)
      
      const { data: newLink, error: linkError } = await (supabase
        .from('published_links' as any)
        .insert({
          document_id,
          slug,
          current_version_id: version.id,
          require_email,
          notify_on_view,
          expires_at: expires_in_days 
            ? new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000).toISOString()
            : null,
          created_by: user.id,
        })
        .select('id, slug')
        .single() as any)

      console.log('[Publish API] Link creation:', { newLink, error: linkError?.message, code: linkError?.code })

      if (linkError) {
        console.error('[Publish API] Link creation error:', linkError)
        return NextResponse.json({ error: 'Failed to create link', details: linkError.message }, { status: 500 })
      }
      
      link = newLink
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tryraven.io'
    const responseData = {
      success: true,
      version_id: version.id,
      version_number: newVersionNumber,
      link_id: link.id,
      slug: link.slug,
      url: `${baseUrl}/d/${link.slug}`,
      is_update: !!existingLink,
    }
    
    console.log('[Publish API] Success response:', responseData)
    
    return NextResponse.json(responseData)

  } catch (error) {
    console.error('[Publish API] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// Get published link status for a document
export async function GET(req: NextRequest) {
  try {
    const supabase = await getClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const document_id = req.nextUrl.searchParams.get('document_id')
    if (!document_id) {
      return NextResponse.json({ error: 'document_id required' }, { status: 400 })
    }

    // Get link with version info
    const { data: link, error } = await (supabase
      .from('published_links' as any)
      .select(`
        id,
        slug,
        is_active,
        require_email,
        notify_on_view,
        expires_at,
        created_at,
        updated_at,
        current_version:document_versions(
          version_number,
          commit_message,
          published_at
        )
      `)
      .eq('document_id', document_id)
      .single() as any)

    if (error || !link) {
      return NextResponse.json({ published: false })
    }

    // Get all versions
    const { data: versions } = await (supabase
      .from('document_versions' as any)
      .select('id, version_number, commit_message, published_at')
      .eq('document_id', document_id)
      .order('version_number', { ascending: false }) as any)

    // Get view stats
    const { count: totalViews } = await (supabase
      .from('view_sessions' as any)
      .select('*', { count: 'exact', head: true })
      .eq('link_id', link.id) as any)

    const { data: uniqueViewers } = await (supabase
      .from('view_sessions' as any)
      .select('viewer_id')
      .eq('link_id', link.id)
      .not('viewer_id', 'is', null) as any)

    const uniqueViewerCount = new Set(uniqueViewers?.map((v: { viewer_id: string }) => v.viewer_id)).size

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tryraven.io'

    return NextResponse.json({
      published: true,
      link_id: link.id,
      slug: link.slug,
      url: `${baseUrl}/d/${link.slug}`,
      is_active: link.is_active,
      require_email: link.require_email,
      notify_on_view: link.notify_on_view,
      expires_at: link.expires_at,
      current_version: link.current_version,
      versions: versions || [],
      stats: {
        total_views: totalViews || 0,
        unique_viewers: uniqueViewerCount,
      },
    })

  } catch (error) {
    console.error('[Publish API] GET Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

function generateSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}