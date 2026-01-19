// src/app/api/published/[linkId]/versions/route.ts
// Fetch version history for a published document

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const { linkId } = await params

    // Get the link to find the document
    const { data: link, error: linkError } = await supabase
      .from('published_links')
      .select('document_id')
      .eq('id', linkId)
      .single()

    if (linkError || !link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    // Get all versions for this document, ordered by version number descending
    const { data: versions, error: versionsError } = await supabase
      .from('published_versions')
      .select('version_number, published_at, note')
      .eq('document_id', link.document_id)
      .order('version_number', { ascending: false })

    if (versionsError) {
      console.error('Error fetching versions:', versionsError)
      return NextResponse.json({ error: 'Failed to fetch versions' }, { status: 500 })
    }

    return NextResponse.json({ versions: versions || [] })

  } catch (error) {
    console.error('Version history error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
