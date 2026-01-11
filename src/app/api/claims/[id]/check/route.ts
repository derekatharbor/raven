import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get the claim with prompts
  const { data: claim, error: claimError } = await supabase
    .from('claims')
    .select('*, prompts(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (claimError || !claim) {
    return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
  }

  const startTime = Date.now()

  // TODO: Implement actual source querying and LLM evaluation
  // For now, return a placeholder check
  
  const { data: check, error: checkError } = await supabase
    .from('checks')
    .insert({
      claim_id: id,
      status: 'ok',
      confidence: 0.85,
      findings: {
        summary: 'No contradictions found',
        details: ['Claim appears to be current based on available sources'],
        sources_used: ['web_search'],
      },
      sources_queried: ['brave_search'],
      triggered_by: 'manual',
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startTime,
    })
    .select()
    .single()

  if (checkError) {
    return NextResponse.json({ error: checkError.message }, { status: 500 })
  }

  return NextResponse.json(check)
}
