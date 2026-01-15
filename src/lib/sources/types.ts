// src/lib/sources/types.ts

/**
 * Core types for Raven's source adapter system.
 * Every source (SEC, PitchBook, Drive, etc.) implements SourceAdapter.
 */

// ============================================================================
// SOURCE IDENTITY
// ============================================================================

export type SourceType = 
  | 'sec-edgar'      // SEC EDGAR filings
  | 'pitchbook'      // PitchBook data (future)
  | 'bloomberg'      // Bloomberg terminal (future)
  | 'google-drive'   // Google Drive docs (future)
  | 'web'            // General web search (future)
  | 'internal'       // User-uploaded docs (future)

export interface SourceMeta {
  id: SourceType
  name: string
  description: string
  icon: string              // Lucide icon name
  color: string             // Brand color hex
  requiresAuth: boolean
  authType?: 'api-key' | 'oauth' | 'none'
}

// ============================================================================
// CONNECTION STATE
// ============================================================================

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface ConnectedSource {
  type: SourceType
  status: ConnectionStatus
  connectedAt?: string
  lastSyncedAt?: string
  error?: string
  config?: Record<string, unknown>  // Source-specific config
}

// ============================================================================
// QUERY & RESULTS
// ============================================================================

export interface SourceQuery {
  query: string                     // Natural language or structured query
  filters?: {
    ticker?: string                 // e.g., "NVDA"
    dateRange?: {
      start: string                 // ISO date
      end: string
    }
    documentTypes?: string[]        // e.g., ["10-K", "10-Q"]
    limit?: number
  }
}

export interface SourceDocument {
  id: string                        // Unique ID within source
  sourceType: SourceType
  title: string
  content: string                   // Full text or relevant excerpt
  url?: string                      // Link to original
  publishedAt?: string
  metadata: Record<string, unknown> // Source-specific metadata
}

export interface SourceResult {
  source: SourceType
  documents: SourceDocument[]
  query: SourceQuery
  executedAt: string
  cached: boolean
}

// ============================================================================
// VERIFICATION
// ============================================================================

export type VerificationStatus = 'pending' | 'verified' | 'stale' | 'contradiction' | 'unverifiable'

export interface VerificationResult {
  claimId: string
  claimText: string
  status: VerificationStatus
  confidence: number                // 0-1
  sourceType: SourceType
  supportingDocs: SourceDocument[]
  contradiction?: {
    documentId: string
    excerpt: string
    explanation: string
  }
  verifiedAt: string
}

// ============================================================================
// ADAPTER INTERFACE
// ============================================================================

export interface SourceAdapter {
  /** Source metadata */
  meta: SourceMeta
  
  /** Test connection / validate credentials */
  testConnection(): Promise<{ success: boolean; error?: string }>
  
  /** Search the source for relevant documents */
  search(query: SourceQuery): Promise<SourceResult>
  
  /** Get a specific document by ID */
  getDocument(documentId: string): Promise<SourceDocument | null>
  
  /** Verify a claim against this source */
  verifyClaim(claimText: string, context?: string): Promise<VerificationResult>
  
  /** Get suggested queries for @ mention autocomplete */
  getSuggestions(partial: string): Promise<string[]>
}

// ============================================================================
// ADAPTER CONFIG (for instantiation)
// ============================================================================

export interface SECEdgarConfig {
  userAgent: string                 // Required by SEC: "Company contact@email.com"
}

export interface PitchBookConfig {
  apiKey: string
}

export interface GoogleDriveConfig {
  accessToken: string
  refreshToken: string
}

export type SourceConfig = 
  | { type: 'sec-edgar'; config: SECEdgarConfig }
  | { type: 'pitchbook'; config: PitchBookConfig }
  | { type: 'google-drive'; config: GoogleDriveConfig }
  | { type: 'web'; config: Record<string, never> }
