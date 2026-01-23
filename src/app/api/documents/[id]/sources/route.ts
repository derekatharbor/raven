// app/api/documents/[id]/sources/route.ts
// Manage which source documents are connected to an editor document
// This is what makes "your research travels with you"

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

// GET - List connected sources for a document
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params
    const supabase = await createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user owns this document
    const { data: doc } = await supabase
      .from('documents')
      .select('user_id')
      .eq('id', documentId)
      .single()

    if (!doc || doc.user_id !== user.id) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Get connected sources with details
    const { data: connections, error } = await supabase
      .from('document_sources')
      .select(`
        id,
        connected_at,
        connected_by,
        citation_count,
        last_cited_at,
        source_documents (
          id,
          name,
          type,
          source,
          source_url,
          domain,
          metadata,
          created_at
        )
      `)
      .eq('document_id', documentId)
      .order('connected_at', { ascending: false })

    if (error) {
      console.error('Error fetching document sources:', error)
      return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 })
    }

    // Get citation counts per source
    const { data: citations } = await supabase
      .from('document_citations')
      .select('source_document_id')
      .eq('document_id', documentId)

    const citationCounts: Record<string, number> = {}
    citations?.forEach(c => {
      citationCounts[c.source_document_id] = (citationCounts[c.source_document_id] || 0) + 1
    })

    // Enrich response with citation counts
    const sources = connections?.map(conn => ({
      ...conn,
      source: conn.source_documents,
      citationCount: citationCounts[conn.source_documents?.id] || 0,
    })) || []

    return NextResponse.json({ sources })

  } catch (error) {
    console.error('Document sources GET error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// POST - Connect a source to a document
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params
    const supabase = await createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sourceDocumentId, sourceDocumentIds } = body

    // Handle both single and bulk connections
    const idsToConnect = sourceDocumentIds || (sourceDocumentId ? [sourceDocumentId] : [])

    if (idsToConnect.length === 0) {
      return NextResponse.json(
        { error: 'sourceDocumentId or sourceDocumentIds required' },
        { status: 400 }
      )
    }

    // Verify user owns the document
    const { data: doc } = await supabase
      .from('documents')
      .select('user_id')
      .eq('id', documentId)
      .single()

    if (!doc || doc.user_id !== user.id) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Verify user owns all the source documents
    const { data: sources } = await supabase
      .from('source_documents')
      .select('id')
      .in('id', idsToConnect)
      .eq('user_id', user.id)

    const ownedIds = new Set(sources?.map(s => s.id) || [])
    const unauthorized = idsToConnect.filter((id: string) => !ownedIds.has(id))

    if (unauthorized.length > 0) {
      return NextResponse.json(
        { error: 'Some source documents not found or not owned', unauthorized },
        { status: 403 }
      )
    }

    // Insert connections (ignore duplicates)
    const connections = idsToConnect.map((sourceId: string) => ({
      document_id: documentId,
      source_document_id: sourceId,
      connected_by: 'user',
    }))

    const { data: created, error: insertError } = await supabase
      .from('document_sources')
      .upsert(connections, { 
        onConflict: 'document_id,source_document_id',
        ignoreDuplicates: true 
      })
      .select()

    if (insertError) {
      console.error('Error connecting sources:', insertError)
      return NextResponse.json({ error: 'Failed to connect sources' }, { status: 500 })
    }

    // Update document's connected sources count
    const { count } = await supabase
      .from('document_sources')
      .select('*', { count: 'exact', head: true })
      .eq('document_id', documentId)

    await supabase
      .from('documents')
      .update({ connected_sources_count: count || 0 })
      .eq('id', documentId)

    return NextResponse.json({ 
      connected: created?.length || 0,
      totalConnected: count || 0,
    })

  } catch (error) {
    console.error('Document sources POST error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// DELETE - Disconnect a source from a document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params
    const supabase = await createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sourceDocumentId = searchParams.get('source_id')

    if (!sourceDocumentId) {
      return NextResponse.json(
        { error: 'source_id is required' },
        { status: 400 }
      )
    }

    // Verify user owns the document
    const { data: doc } = await supabase
      .from('documents')
      .select('user_id')
      .eq('id', documentId)
      .single()

    if (!doc || doc.user_id !== user.id) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Delete the connection
    const { error: deleteError } = await supabase
      .from('document_sources')
      .delete()
      .eq('document_id', documentId)
      .eq('source_document_id', sourceDocumentId)

    if (deleteError) {
      console.error('Error disconnecting source:', deleteError)
      return NextResponse.json({ error: 'Failed to disconnect source' }, { status: 500 })
    }

    // Also remove citations from this source
    await supabase
      .from('document_citations')
      .delete()
      .eq('document_id', documentId)
      .eq('source_document_id', sourceDocumentId)

    // Update document's connected sources count
    const { count } = await supabase
      .from('document_sources')
      .select('*', { count: 'exact', head: true })
      .eq('document_id', documentId)

    await supabase
      .from('documents')
      .update({ connected_sources_count: count || 0 })
      .eq('id', documentId)

    return NextResponse.json({ 
      disconnected: true,
      totalConnected: count || 0,
    })

  } catch (error) {
    console.error('Document sources DELETE error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
