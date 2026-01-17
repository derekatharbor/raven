// Path: src/app/d/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import PublishedDocument from '@/components/published/PublishedDocument'

// Use service role to fetch public documents
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PublishedDocumentPage({ params }: PageProps) {
  const { slug } = await params

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

  if (error || !link) {
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