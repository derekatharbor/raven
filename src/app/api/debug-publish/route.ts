// Path: src/app/api/debug-publish/route.ts
// Debug endpoint - check publish tables exist and have data
// DELETE THIS FILE AFTER DEBUGGING

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const results: Record<string, any> = {}
  
  // Check env vars
  results.env = {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    serviceRolePrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...',
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ 
      error: 'Missing env vars', 
      results 
    })
  }
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  
  // Check published_links table
  const { data: links, error: linksError } = await supabase
    .from('published_links')
    .select('id, slug, document_id, is_active, created_at')
    .limit(5)
  
  results.published_links = {
    count: links?.length || 0,
    data: links,
    error: linksError?.message || null,
    code: linksError?.code || null,
  }
  
  // Check document_versions table
  const { data: versions, error: versionsError } = await supabase
    .from('document_versions')
    .select('id, document_id, version_number, title_snapshot, created_at')
    .limit(5)
  
  results.document_versions = {
    count: versions?.length || 0,
    data: versions,
    error: versionsError?.message || null,
    code: versionsError?.code || null,
  }
  
  // Check documents table (should exist)
  const { data: docs, error: docsError } = await supabase
    .from('documents')
    .select('id, title')
    .limit(3)
  
  results.documents = {
    count: docs?.length || 0,
    data: docs,
    error: docsError?.message || null,
  }
  
  return NextResponse.json(results, { status: 200 })
}
