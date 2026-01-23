// src/app/api/ranger/documents/route.ts
// Document management for Ranger - upload, import from EDGAR, list
// NOW WITH REAL PERSISTENCE + EMBEDDINGS

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { storeDocument, listDocuments, deleteDocument } from '@/lib/embeddings/vector-store'
import { createSECEdgarAdapter } from '@/lib/sources/adapters/sec-edgar'

// Get authenticated Supabase client
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

// SEC EDGAR adapter
const secAdapter = createSECEdgarAdapter()

// POST - Upload or import documents
export async function POST(request: NextRequest) {
  try {
    const supabase = await getClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const contentType = request.headers.get('content-type') || ''
    
    // Handle JSON requests (SEC import, URL fetch)
    if (contentType.includes('application/json')) {
      const body = await request.json()
      
      // SEC EDGAR import
      if (body.source === 'sec-edgar') {
        const { ticker, formTypes, limit = 5 } = body
        
        if (!ticker) {
          return NextResponse.json(
            { error: 'Ticker required for SEC import' },
            { status: 400 }
          )
        }
        
        // Fetch filings from SEC
        const result = await secAdapter.search({
          query: ticker,
          filters: {
            ticker,
            documentTypes: formTypes || ['10-K', '10-Q'],
            limit,
          },
        })
        
        const importedDocs: Array<{
          id: string
          name: string
          type: string
          source: string
          createdAt: string
          contentLength: number
        }> = []
        
        for (const doc of result.documents) {
          // Fetch full document content
          const fullDoc = await secAdapter.getDocument(doc.id)
          
          if (fullDoc) {
            // Store with embeddings
            const storedDoc = await storeDocument(
              user.id,
              doc.title,
              fullDoc.content,
              {
                projectId: body.projectId,
                type: doc.metadata?.form as string || 'SEC Filing',
                source: 'sec-edgar',
                sourceUrl: doc.url,
                metadata: doc.metadata,
                isSECFiling: true,
              }
            )
            
            importedDocs.push({
              id: storedDoc.id,
              name: storedDoc.name,
              type: storedDoc.type,
              source: storedDoc.source,
              createdAt: storedDoc.createdAt,
              contentLength: fullDoc.content.length,
            })
          }
        }
        
        return NextResponse.json({
          success: true,
          imported: importedDocs.length,
          documents: importedDocs,
        })
      }
      
      // Direct document creation (for testing or programmatic uploads)
      if (body.documents && Array.isArray(body.documents)) {
        const createdDocs: Array<{
          id: string
          name: string
          type: string
        }> = []
        
        for (const doc of body.documents) {
          const storedDoc = await storeDocument(
            user.id,
            doc.name,
            doc.content,
            {
              projectId: body.projectId,
              type: doc.type || 'Document',
              source: 'upload',
              metadata: doc.metadata,
            }
          )
          
          createdDocs.push({
            id: storedDoc.id,
            name: storedDoc.name,
            type: storedDoc.type,
          })
        }
        
        return NextResponse.json({
          success: true,
          created: createdDocs.length,
          documents: createdDocs,
        })
      }
      
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }
    
    // Handle multipart form data (file uploads)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const files = formData.getAll('files')
      const projectId = formData.get('projectId') as string | null
      
      const uploadedDocs: Array<{
        id: string
        name: string
        type: string
        contentLength: number
      }> = []
      
      for (const file of files) {
        if (file instanceof File) {
          const content = await file.text()
          
          // Determine type from filename
          let type = 'Document'
          const ext = file.name.split('.').pop()?.toLowerCase()
          if (ext === 'pdf') type = 'PDF'
          else if (ext === 'txt') type = 'Text'
          else if (ext === 'md') type = 'Markdown'
          else if (ext === 'html' || ext === 'htm') type = 'HTML'
          else if (ext === 'docx') type = 'Word Document'
          
          // Store with embeddings
          const storedDoc = await storeDocument(
            user.id,
            file.name,
            content,
            {
              projectId: projectId || undefined,
              type,
              source: 'upload',
            }
          )
          
          uploadedDocs.push({
            id: storedDoc.id,
            name: storedDoc.name,
            type: storedDoc.type,
            contentLength: content.length,
          })
        }
      }
      
      return NextResponse.json({
        success: true,
        uploaded: uploadedDocs.length,
        documents: uploadedDocs,
      })
    }
    
    return NextResponse.json(
      { error: 'Unsupported content type' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Document API error:', error)
    return NextResponse.json(
      { error: 'Failed to process documents' },
      { status: 500 }
    )
  }
}

// GET - List documents
export async function GET(request: NextRequest) {
  try {
    const supabase = await getClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId') || undefined
    
    const documents = await listDocuments(user.id, projectId)
    
    return NextResponse.json({
      documents: documents.map(d => ({
        id: d.id,
        name: d.name,
        type: d.type,
        source: d.source,
        sourceUrl: d.sourceUrl,
        createdAt: d.createdAt,
        metadata: d.metadata,
      })),
      total: documents.length,
    })
  } catch (error) {
    console.error('List documents error:', error)
    return NextResponse.json(
      { error: 'Failed to list documents' },
      { status: 500 }
    )
  }
}

// DELETE - Remove a document
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await getClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const docId = searchParams.get('id')
    
    if (!docId) {
      return NextResponse.json(
        { error: 'Document ID required' },
        { status: 400 }
      )
    }
    
    const deleted = await deleteDocument(docId)
    
    return NextResponse.json({
      success: deleted,
      message: deleted ? 'Document deleted' : 'Document not found',
    })
  } catch (error) {
    console.error('Delete document error:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}