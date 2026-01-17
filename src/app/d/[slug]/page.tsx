// Path: src/app/d/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import PublishedDocument from '@/components/published/PublishedDocument'

// Use service role to fetch public documents (bypasses RLS)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

// Only create client if we have the required env vars
const supabase = supabaseUrl && serviceRoleKey 
  ? createClient(supabaseUrl, serviceRoleKey)
  : null

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PublishedDocumentPage({ params }: PageProps) {
  const { slug } = await params

  // Check if supabase client is configured
  if (!supabase) {
    console.error('[Published Page] Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-xl font-semibold text-gray-900">Configuration Error</h1>
          <p className="text-gray-500 mt-2">Server is not properly configured to serve published documents.</p>
        </div>
      </div>
    )
  }

  console.log('[Published Page] Looking for slug:', slug)

  // Fetch the published link
  const { data: link, error } = await supabase
    .from('published_links')
    .select(`
      id,
      document_id,
      require_email,
      expires_at,
      is_active,
      updated_at,
      current_version:document_versions(
        id,
        version_number,
        title_snapshot,
        blocks_snapshot,
        created_at
      )
    `)
    .eq('slug', slug)
    .single()

  console.log('[Published Page] Query result:', { hasLink: !!link, error: error?.message })

  if (error || !link) {
    console.log('[Published Page] Not found - error:', error?.message, error?.code)
    notFound()
  }

  // Check if link is active
  if (!link.is_active) {
    notFound()
  }

  // Check expiry
  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Link Expired</h1>
          <p className="text-gray-500 mt-2">This document link is no longer available.</p>
        </div>
      </div>
    )
  }

  const version = (link.current_version as unknown) as {
    id: string
    version_number: number
    title_snapshot: string
    blocks_snapshot: unknown[]
    created_at: string
  } | null

  return (
    <PublishedDocument
      slug={slug}
      linkId={link.id}
      requireEmail={link.require_email}
      initialVersion={version ? {
        title: version.title_snapshot || 'Untitled',
        blocks: version.blocks_snapshot as any[],
      } : undefined}
      versionNumber={version?.version_number}
      updatedAt={version?.created_at || link.updated_at}
    />
  )
}

// Generate metadata
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params

  if (!supabase) {
    return {
      title: 'Document | Raven',
      description: 'Shared document via Raven',
    }
  }

  const { data: link } = await supabase
    .from('published_links')
    .select(`
      current_version:document_versions(title_snapshot)
    `)
    .eq('slug', slug)
    .single()

  const version = (link?.current_version as unknown) as { title_snapshot: string } | null
  const title = version?.title_snapshot || 'Document'

  return {
    title: `${title} | Raven`,
    description: 'Shared document via Raven',
    robots: {
      index: false, // Don't index published documents by default
      follow: false,
    },
  }
}