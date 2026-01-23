// types/ai-native.ts
// Type definitions for Raven's AI-native architecture

// ============================================================================
// CITATION GRAPH
// ============================================================================

export interface DocumentCitation {
  id: string
  document_id: string
  claim_id: string | null
  source_document_id: string
  source_chunk_id: string | null
  citation_type: 'inline' | 'footnote' | 'smart_block' | 'auto'
  confidence: number | null
  snippet: string | null
  start_offset: number | null
  end_offset: number | null
  created_at: string
  created_by: 'ai' | 'user_manual' | 'import'
}

export interface DocumentCitationWithSource extends DocumentCitation {
  source_documents?: {
    id: string
    name: string
    type: string
    source: string
  }
}

// ============================================================================
// RAVEN LINKS
// ============================================================================

export interface RavenLink {
  id: string
  document_id: string
  user_id: string
  share_token: string
  is_active: boolean
  requires_email: boolean
  password_hash: string | null
  allow_questions: boolean
  allow_highlights: boolean
  source_scope: string[] | null
  title: string | null
  description: string | null
  track_reading_time: boolean
  track_scroll_depth: boolean
  notify_on_view: boolean
  created_at: string
  updated_at: string
  expires_at: string | null
  view_count: number
  unique_viewers: number
  question_count: number
}

export interface RavenLinkWithDocument extends RavenLink {
  documents?: {
    id: string
    title: string
    content: any
    word_count: number | null
  }
  share_url?: string
}

export interface CreateRavenLinkInput {
  documentId: string
  title?: string
  description?: string
  allowQuestions?: boolean
  allowHighlights?: boolean
  requiresEmail?: boolean
  password?: string
  expiresIn?: number  // hours
  sourceScope?: string[]
  trackReadingTime?: boolean
  trackScrollDepth?: boolean
  notifyOnView?: boolean
}

// ============================================================================
// READER SESSIONS & INTERACTIONS
// ============================================================================

export interface ReaderSession {
  id: string
  raven_link_id: string
  reader_email: string | null
  reader_name: string | null
  anonymous_id: string
  user_agent: string | null
  ip_hash: string | null
  referrer: string | null
  started_at: string
  ended_at: string | null
  total_time_seconds: number
  max_scroll_depth: number
  is_bot: boolean
}

export type InteractionType = 
  | 'question'
  | 'highlight'
  | 'time_on_section'
  | 'copy'
  | 'click_citation'

export interface ReaderInteraction {
  id: string
  raven_link_id: string
  session_id: string | null
  interaction_type: InteractionType
  target_claim_id: string | null
  target_section: string | null
  target_text: string | null
  start_offset: number | null
  end_offset: number | null
  question_text: string | null
  ai_response: string | null
  source_chunks_used: string[] | null
  response_helpful: boolean | null
  duration_seconds: number | null
  created_at: string
  metadata: Record<string, any>
}

// ============================================================================
// DOCUMENT SOURCES
// ============================================================================

export interface DocumentSource {
  id: string
  document_id: string
  source_document_id: string
  connected_at: string
  connected_by: 'user' | 'auto_suggested' | 'import'
  citation_count: number
  last_cited_at: string | null
}

export interface DocumentSourceWithDetails extends DocumentSource {
  source_documents?: {
    id: string
    name: string
    type: string
    source: string
    source_url: string | null
    domain: string
    metadata: Record<string, any>
    created_at: string
  }
}

// ============================================================================
// GROUNDED COMPLETION
// ============================================================================

export interface GroundedCompletionInput {
  documentId: string
  context: string
  suffix?: string
  instruction?: string
  maxTokens?: number
  userId?: string
}

export interface GroundedCompletionCitation {
  chunkId: string
  documentId: string
  documentName: string
  snippet: string
  confidence: number
}

export interface GroundedCompletionOutput {
  text: string
  citations: GroundedCompletionCitation[]
  groundedIn: number
  warning?: string
}

// ============================================================================
// READER Q&A
// ============================================================================

export interface ReaderQuestionInput {
  question: string
  sessionId?: string
  targetClaimId?: string
  targetText?: string
}

export interface ReaderAnswerSource {
  documentName: string
  snippet: string
  confidence: number
}

export interface ReaderAnswerOutput {
  answer: string
  sources: ReaderAnswerSource[]
  confidence: 'high' | 'medium' | 'low' | 'none'
  interactionId?: string
}

// ============================================================================
// ANALYTICS
// ============================================================================

export interface RavenLinkAnalytics {
  overview: {
    totalViews: number
    uniqueReaders: number
    totalQuestions: number
    avgTimeSeconds: number
    avgScrollDepth: number
    linkCreatedAt: string
  }
  engagement: {
    interactionsByType: Record<InteractionType, number>
    viewsTimeline: Array<{ date: string; count: number }>
  }
  questions: {
    total: number
    recent: Array<{
      question: string
      answer: string
      helpful: boolean | null
      targetText: string | null
      askedAt: string
    }>
  }
  scrutiny: {
    mostScrutinizedClaims: Array<{
      claimId: string
      text: string
      count: number
    }>
  }
  readers: {
    topReaders: Array<{
      email: string
      visits: number
      totalTime: number
      lastVisit: string
    }>
    anonymous: number
  }
  sections: {
    topSections: Array<{
      section: string
      timeSpent: number
      interactions: number
    }>
  }
}

// ============================================================================
// SHARED DOCUMENT VIEW (for readers)
// ============================================================================

export interface SharedDocumentView {
  document: {
    id: string
    title: string
    description: string | null
    content: any
    wordCount: number | null
    createdAt: string
    updatedAt: string
  }
  settings: {
    allowQuestions: boolean
    allowHighlights: boolean
  }
  sources: Array<{
    id: string
    name: string
    type: string
    source: string
  }>
  citations: DocumentCitationWithSource[]
  session: {
    id: string
    anonymousId: string
  } | null
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface SourceChunk {
  chunk_id: string
  source_document_id: string
  source_document_name: string
  content: string
  chunk_index: number
  metadata: Record<string, any>
  similarity: number
}
