// app/api/r/[token]/route.ts
// Public API for readers to access Raven Links
// No auth required - this is what makes documents "shareable"

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch a shared document
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // 1. Find the raven link
    const { data: link, error: linkError } = await supabase
      .from('raven_links')
      .select(`
        *,
        documents (
          id,
          title,
          content,
          word_count,
          created_at,
          updated_at
        )
      `)
      .eq('share_token', token)
      .eq('is_active', true)
      .single()

    if (linkError || !link) {
      return NextResponse.json(
        { error: 'Link not found or inactive' },
        { status: 404 }
      )
    }

    // 2. Check expiration
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This link has expired' },
        { status: 410 }
      )
    }

    // 3. Check if password required (don't return document content yet)
    if (link.password_hash) {
      const { searchParams } = new URL(request.url)
      const password = searchParams.get('password')
      
      if (!password) {
        return NextResponse.json({
          requiresPassword: true,
          title: link.title,
          description: link.description,
        })
      }

      const bcrypt = await import('bcryptjs')
      const valid = await bcrypt.compare(password, link.password_hash)
      
      if (!valid) {
        return NextResponse.json(
          { error: 'Incorrect password' },
          { status: 401 }
        )
      }
    }

    // 4. Check if email required
    if (link.requires_email) {
      const { searchParams } = new URL(request.url)
      const email = searchParams.get('email')
      
      if (!email) {
        return NextResponse.json({
          requiresEmail: true,
          title: link.title,
          description: link.description,
        })
      }
    }

    // 5. Get connected sources (for display, not full content)
    const { data: sources } = await supabase
      .from('document_sources')
      .select(`
        source_documents (
          id,
          name,
          type,
          source
        )
      `)
      .eq('document_id', link.document_id)

    // 6. Get citations for this document
    const { data: citations } = await supabase
      .from('document_citations')
      .select(`
        id,
        claim_id,
        source_document_id,
        snippet,
        confidence,
        start_offset,
        end_offset,
        source_documents (
          name,
          type
        )
      `)
      .eq('document_id', link.document_id)

    // 7. Create reader session
    const userAgent = request.headers.get('user-agent') || ''
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
    
    // Simple hash of IP for privacy
    const ipHash = await hashString(ip)
    
    const { data: session } = await supabase
      .from('reader_sessions')
      .insert({
        raven_link_id: link.id,
        reader_email: request.nextUrl.searchParams.get('email'),
        user_agent: userAgent,
        ip_hash: ipHash,
        referrer: request.headers.get('referer'),
      })
      .select('id, anonymous_id')
      .single()

    // 8. Return the document
    return NextResponse.json({
      document: {
        id: link.documents.id,
        title: link.title || link.documents.title,
        description: link.description,
        content: link.documents.content,
        wordCount: link.documents.word_count,
        createdAt: link.documents.created_at,
        updatedAt: link.documents.updated_at,
      },
      settings: {
        allowQuestions: link.allow_questions,
        allowHighlights: link.allow_highlights,
      },
      sources: sources?.map(s => s.source_documents).filter(Boolean) || [],
      citations: citations || [],
      session: session ? {
        id: session.id,
        anonymousId: session.anonymous_id,
      } : null,
    })

  } catch (error) {
    console.error('Reader GET error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// POST - Record reader interaction
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()
    const {
      sessionId,
      interactionType,  // 'highlight', 'time_on_section', 'copy', 'click_citation'
      targetClaimId,
      targetSection,
      targetText,
      startOffset,
      endOffset,
      durationSeconds,
      metadata,
    } = body

    // Verify the link exists and is active
    const { data: link } = await supabase
      .from('raven_links')
      .select('id, is_active')
      .eq('share_token', token)
      .single()

    if (!link || !link.is_active) {
      return NextResponse.json(
        { error: 'Link not found or inactive' },
        { status: 404 }
      )
    }

    // Record the interaction
    const { data: interaction, error } = await supabase
      .from('reader_interactions')
      .insert({
        raven_link_id: link.id,
        session_id: sessionId,
        interaction_type: interactionType,
        target_claim_id: targetClaimId,
        target_section: targetSection,
        target_text: targetText,
        start_offset: startOffset,
        end_offset: endOffset,
        duration_seconds: durationSeconds,
        metadata,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error recording interaction:', error)
      return NextResponse.json(
        { error: 'Failed to record interaction' },
        { status: 500 }
      )
    }

    return NextResponse.json({ interactionId: interaction?.id })

  } catch (error) {
    console.error('Reader POST error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// PATCH - Update session (e.g., end session, update scroll depth)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()
    const {
      sessionId,
      totalTimeSeconds,
      maxScrollDepth,
      ended,
    } = body

    // Verify the link exists
    const { data: link } = await supabase
      .from('raven_links')
      .select('id')
      .eq('share_token', token)
      .single()

    if (!link) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      )
    }

    const updates: Record<string, any> = {}
    if (totalTimeSeconds !== undefined) updates.total_time_seconds = totalTimeSeconds
    if (maxScrollDepth !== undefined) updates.max_scroll_depth = maxScrollDepth
    if (ended) updates.ended_at = new Date().toISOString()

    const { error } = await supabase
      .from('reader_sessions')
      .update(updates)
      .eq('id', sessionId)
      .eq('raven_link_id', link.id)

    if (error) {
      console.error('Error updating session:', error)
      return NextResponse.json(
        { error: 'Failed to update session' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Reader PATCH error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16)
}
