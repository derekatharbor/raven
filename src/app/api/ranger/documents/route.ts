// src/app/api/ranger/documents/route.ts
// Document management for Ranger - upload, import from EDGAR, list

import { NextRequest, NextResponse } from 'next/server'
import { createSECEdgarAdapter } from '@/lib/sources/adapters/sec-edgar'

// Document structure stored in memory for now (will move to Supabase)
interface StoredDocument {
  id: string
  name: string
  content: string
  type: string
  source: 'upload' | 'sec-edgar' | 'web'
  metadata?: Record<string, unknown>
  createdAt: string
  projectId?: string
}

// In-memory store (replace with Supabase)
const documentStore: Map<string, StoredDocument> = new Map()

// SEC EDGAR adapter
const secAdapter = createSECEdgarAdapter()

// POST - Upload or import documents
export async function POST(request: NextRequest) {
  try {
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
        
        const importedDocs: StoredDocument[] = []
        
        for (const doc of result.documents) {
          // Fetch full document content
          const fullDoc = await secAdapter.getDocument(doc.id)
          
          if (fullDoc) {
            const storedDoc: StoredDocument = {
              id: doc.id,
              name: doc.title,
              content: fullDoc.content,
              type: doc.metadata?.form as string || 'SEC Filing',
              source: 'sec-edgar',
              metadata: doc.metadata,
              createdAt: new Date().toISOString(),
              projectId: body.projectId,
            }
            
            documentStore.set(doc.id, storedDoc)
            importedDocs.push(storedDoc)
          }
        }
        
        return NextResponse.json({
          success: true,
          imported: importedDocs.length,
          documents: importedDocs.map(d => ({
            id: d.id,
            name: d.name,
            type: d.type,
            content: d.content,  // Include content for extraction
            source: d.source,
            createdAt: d.createdAt,
            contentLength: d.content.length,
          })),
        })
      }
      
      // Direct document creation (for testing)
      if (body.documents && Array.isArray(body.documents)) {
        const createdDocs: StoredDocument[] = []
        
        for (const doc of body.documents) {
          const storedDoc: StoredDocument = {
            id: doc.id || `doc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            name: doc.name,
            content: doc.content,
            type: doc.type || 'Document',
            source: 'upload',
            metadata: doc.metadata,
            createdAt: new Date().toISOString(),
            projectId: body.projectId,
          }
          
          documentStore.set(storedDoc.id, storedDoc)
          createdDocs.push(storedDoc)
        }
        
        return NextResponse.json({
          success: true,
          created: createdDocs.length,
          documents: createdDocs.map(d => ({
            id: d.id,
            name: d.name,
            type: d.type,
          })),
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
      
      const uploadedDocs: StoredDocument[] = []
      
      for (const file of files) {
        if (file instanceof File) {
          const content = await file.text()
          const docId = `doc-${Date.now()}-${Math.random().toString(36).slice(2)}`
          
          // Determine type from filename
          let type = 'Document'
          const ext = file.name.split('.').pop()?.toLowerCase()
          if (ext === 'pdf') type = 'PDF'
          else if (ext === 'txt') type = 'Text'
          else if (ext === 'md') type = 'Markdown'
          else if (ext === 'html' || ext === 'htm') type = 'HTML'
          
          const storedDoc: StoredDocument = {
            id: docId,
            name: file.name,
            content,
            type,
            source: 'upload',
            createdAt: new Date().toISOString(),
            projectId: projectId || undefined,
          }
          
          documentStore.set(docId, storedDoc)
          uploadedDocs.push(storedDoc)
        }
      }
      
      return NextResponse.json({
        success: true,
        uploaded: uploadedDocs.length,
        documents: uploadedDocs.map(d => ({
          id: d.id,
          name: d.name,
          type: d.type,
          content: d.content,  // Include content for extraction
          contentLength: d.content.length,
        })),
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
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  
  let documents = Array.from(documentStore.values())
  
  // Filter by project if specified
  if (projectId) {
    documents = documents.filter(d => d.projectId === projectId)
  }
  
  return NextResponse.json({
    documents: documents.map(d => ({
      id: d.id,
      name: d.name,
      type: d.type,
      source: d.source,
      createdAt: d.createdAt,
      contentLength: d.content.length,
      metadata: d.metadata,
    })),
    total: documents.length,
  })
}

// DELETE - Remove a document
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const docId = searchParams.get('id')
  
  if (!docId) {
    return NextResponse.json(
      { error: 'Document ID required' },
      { status: 400 }
    )
  }
  
  const deleted = documentStore.delete(docId)
  
  return NextResponse.json({
    success: deleted,
    message: deleted ? 'Document deleted' : 'Document not found',
  })
}
