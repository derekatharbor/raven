import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const documentId = searchParams.get('document_id')
  const status = searchParams.get('status')

  let query = supabase
    .from('claims')
    .select('*, prompts(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (documentId) {
    query = query.eq('document_id', documentId)
  }

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  
  // Create the claim
  const { data: claim, error: claimError } = await supabase
    .from('claims')
    .insert({
      user_id: user.id,
      document_id: body.document_id || null,
      source_url: body.source_url || null,
      source_title: body.source_title || null,
      text: body.text,
      context: body.context || null,
      start_offset: body.start_offset,
      end_offset: body.end_offset,
      cadence: body.cadence || 'daily',
      track_until: body.track_until || null,
      sources: body.sources || [],
    })
    .select()
    .single()

  if (claimError) {
    return NextResponse.json({ error: claimError.message }, { status: 500 })
  }

  // Create prompts if provided
  if (body.prompts && body.prompts.length > 0) {
    const promptsToInsert = body.prompts.map((prompt: string) => ({
      claim_id: claim.id,
      prompt_text: prompt,
    }))

    const { error: promptsError } = await supabase
      .from('prompts')
      .insert(promptsToInsert)

    if (promptsError) {
      console.error('Error creating prompts:', promptsError)
    }
  }

  // Fetch claim with prompts
  const { data, error } = await supabase
    .from('claims')
    .select('*, prompts(*)')
    .eq('id', claim.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
