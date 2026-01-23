// app/api/raven-links/route.ts
// Create and manage Raven Links - shareable interactive documents

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase-server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - List user's raven links
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('document_id')

    let query = supabase
      .from('raven_links')
      .select(`
        *,
        documents (
          id,
          title,
          word_count
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (documentId) {
      query = query.eq('document_id', documentId)
    }

    const { data: links, error } = await query

    if (error) {
      console.error('Error fetching raven links:', error)
      return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 })
    }

    return NextResponse.json({ links })

  } catch (error) {
    console.error('Raven links GET error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// POST - Create a new raven link
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      documentId,
      title,
      description,
      allowQuestions = true,
      allowHighlights = true,
      requiresEmail = false,
      password,
      expiresIn,  // hours, null for never
      sourceScope,  // array of source_document_ids, null for all
      trackReadingTime = true,
      trackScrollDepth = true,
      notifyOnView = false,
    } = body

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId is required' },
        { status: 400 }
      )
    }

    // Verify user owns this document
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('id, user_id, title')
      .eq('id', documentId)
      .single()

    if (docError || !doc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    if (doc.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not own this document' },
        { status: 403 }
      )
    }

    // Hash password if provided
    let passwordHash = null
    if (password) {
      const bcrypt = await import('bcryptjs')
      passwordHash = await bcrypt.hash(password, 10)
    }

    // Calculate expiration
    let expiresAt = null
    if (expiresIn) {
      expiresAt = new Date(Date.now() + expiresIn * 60 * 60 * 1000).toISOString()
    }

    // Create the raven link
    const { data: link, error: createError } = await supabase
      .from('raven_links')
      .insert({
        document_id: documentId,
        user_id: user.id,
        title: title || doc.title,
        description,
        allow_questions: allowQuestions,
        allow_highlights: allowHighlights,
        requires_email: requiresEmail,
        password_hash: passwordHash,
        expires_at: expiresAt,
        source_scope: sourceScope,
        track_reading_time: trackReadingTime,
        track_scroll_depth: trackScrollDepth,
        notify_on_view: notifyOnView,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating raven link:', createError)
      return NextResponse.json(
        { error: 'Failed to create link' },
        { status: 500 }
      )
    }

    // Update document to mark it has a raven link
    await supabase
      .from('documents')
      .update({ has_raven_link: true })
      .eq('id', documentId)

    // Build the shareable URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ravenai.com'
    const shareUrl = `${baseUrl}/r/${link.share_token}`

    return NextResponse.json({
      link: {
        ...link,
        share_url: shareUrl,
      },
    })

  } catch (error) {
    console.error('Raven links POST error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// PATCH - Update a raven link
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { linkId, ...updates } = body

    if (!linkId) {
      return NextResponse.json(
        { error: 'linkId is required' },
        { status: 400 }
      )
    }

    // Handle password update
    if (updates.password !== undefined) {
      if (updates.password) {
        const bcrypt = await import('bcryptjs')
        updates.password_hash = await bcrypt.hash(updates.password, 10)
      } else {
        updates.password_hash = null
      }
      delete updates.password
    }

    // Handle expiration update
    if (updates.expiresIn !== undefined) {
      if (updates.expiresIn) {
        updates.expires_at = new Date(Date.now() + updates.expiresIn * 60 * 60 * 1000).toISOString()
      } else {
        updates.expires_at = null
      }
      delete updates.expiresIn
    }

    const { data: link, error: updateError } = await supabase
      .from('raven_links')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', linkId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating raven link:', updateError)
      return NextResponse.json(
        { error: 'Failed to update link' },
        { status: 500 }
      )
    }

    return NextResponse.json({ link })

  } catch (error) {
    console.error('Raven links PATCH error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// DELETE - Delete a raven link
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const linkId = searchParams.get('id')

    if (!linkId) {
      return NextResponse.json(
        { error: 'Link ID is required' },
        { status: 400 }
      )
    }

    // Get the link to find the document
    const { data: link } = await supabase
      .from('raven_links')
      .select('document_id')
      .eq('id', linkId)
      .eq('user_id', user.id)
      .single()

    const { error: deleteError } = await supabase
      .from('raven_links')
      .delete()
      .eq('id', linkId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting raven link:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete link' },
        { status: 500 }
      )
    }

    // Check if document has any remaining links
    if (link) {
      const { count } = await supabase
        .from('raven_links')
        .select('*', { count: 'exact', head: true })
        .eq('document_id', link.document_id)

      if (count === 0) {
        await supabase
          .from('documents')
          .update({ has_raven_link: false })
          .eq('id', link.document_id)
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Raven links DELETE error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
