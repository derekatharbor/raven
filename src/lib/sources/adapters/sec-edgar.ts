// src/lib/sources/adapters/sec-edgar.ts

import type {
  SourceAdapter,
  SourceMeta,
  SourceQuery,
  SourceResult,
  SourceDocument,
  VerificationResult,
  SECEdgarConfig,
} from '../types'

/**
 * SEC EDGAR Adapter
 * 
 * Connects to SEC's EDGAR database for company filings (10-K, 10-Q, 8-K, etc.)
 * 
 * API Docs: https://www.sec.gov/search-filings/edgar-search-assistance
 * Rate Limit: 10 requests/second (we stay well under)
 * Auth: None required, but must include User-Agent with contact info
 */

const SEC_BASE_URL = 'https://data.sec.gov'
const SEC_SEARCH_URL = 'https://efts.sec.gov/LATEST/search-index'
const SEC_ARCHIVES_URL = 'https://www.sec.gov/Archives/edgar/data'

// Common ticker to CIK mappings (we'll fetch dynamically, but cache common ones)
const TICKER_CIK_CACHE: Record<string, string> = {
  'AAPL': '0000320193',
  'MSFT': '0000789019',
  'GOOGL': '0001652044',
  'AMZN': '0001018724',
  'NVDA': '0001045810',
  'META': '0001326801',
  'TSLA': '0001318605',
}

export class SECEdgarAdapter implements SourceAdapter {
  meta: SourceMeta = {
    id: 'sec-edgar',
    name: 'SEC EDGAR',
    description: 'SEC filings including 10-K, 10-Q, 8-K, and more',
    icon: 'Building2',
    color: '#0A3161',
    requiresAuth: false,
    authType: 'none',
  }

  private userAgent: string

  constructor(config: SECEdgarConfig) {
    // SEC requires User-Agent with company name and contact email
    this.userAgent = config.userAgent || 'Raven/1.0 (contact@tryraven.io)'
  }

  private async fetchSEC(url: string): Promise<Response> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`SEC API error: ${response.status} ${response.statusText}`)
    }
    
    return response
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Test with a simple company lookup
      const response = await this.fetchSEC(`${SEC_BASE_URL}/submissions/CIK0000320193.json`)
      const data = await response.json()
      
      if (data.cik) {
        return { success: true }
      }
      return { success: false, error: 'Invalid response from SEC' }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection failed' 
      }
    }
  }

  async search(query: SourceQuery): Promise<SourceResult> {
    const documents: SourceDocument[] = []
    const executedAt = new Date().toISOString()

    try {
      // If we have a ticker filter, get company filings directly
      if (query.filters?.ticker) {
        const filings = await this.getCompanyFilings(
          query.filters.ticker,
          query.filters?.documentTypes,
          query.filters?.limit || 10
        )
        documents.push(...filings)
      } else {
        // Use full-text search
        const searchResults = await this.fullTextSearch(
          query.query,
          query.filters?.documentTypes,
          query.filters?.limit || 10
        )
        documents.push(...searchResults)
      }

      return {
        source: 'sec-edgar',
        documents,
        query,
        executedAt,
        cached: false,
      }
    } catch (error) {
      console.error('SEC search error:', error)
      return {
        source: 'sec-edgar',
        documents: [],
        query,
        executedAt,
        cached: false,
      }
    }
  }

  private async getCompanyFilings(
    ticker: string,
    formTypes?: string[],
    limit: number = 10
  ): Promise<SourceDocument[]> {
    // Get CIK from ticker
    const cik = await this.tickerToCIK(ticker)
    if (!cik) {
      return []
    }

    // Fetch company submission history
    const response = await this.fetchSEC(`${SEC_BASE_URL}/submissions/CIK${cik}.json`)
    const data = await response.json()

    const documents: SourceDocument[] = []
    const filings = data.filings?.recent

    if (!filings) return []

    // Iterate through recent filings
    const count = Math.min(filings.accessionNumber?.length || 0, limit * 3) // Fetch extra in case we filter
    
    for (let i = 0; i < count && documents.length < limit; i++) {
      const form = filings.form?.[i]
      const accession = filings.accessionNumber?.[i]
      const filingDate = filings.filingDate?.[i]
      const primaryDoc = filings.primaryDocument?.[i]

      // Filter by form type if specified
      if (formTypes && formTypes.length > 0) {
        if (!formTypes.includes(form)) continue
      }

      // Build document URL
      const accessionNoDash = accession?.replace(/-/g, '')
      const docUrl = `${SEC_ARCHIVES_URL}/${cik}/${accessionNoDash}/${primaryDoc}`

      documents.push({
        id: `sec-${cik}-${accession}`,
        sourceType: 'sec-edgar',
        title: `${ticker} ${form} - ${filingDate}`,
        content: `${data.name} filed ${form} on ${filingDate}`, // Summary - full content fetched on demand
        url: docUrl,
        publishedAt: filingDate,
        metadata: {
          cik,
          ticker,
          form,
          accessionNumber: accession,
          companyName: data.name,
          primaryDocument: primaryDoc,
        },
      })
    }

    return documents
  }

  private async fullTextSearch(
    queryText: string,
    formTypes?: string[],
    limit: number = 10
  ): Promise<SourceDocument[]> {
    // SEC full-text search API
    const params = new URLSearchParams({
      q: queryText,
      dateRange: 'custom',
      startdt: '2020-01-01',
      enddt: new Date().toISOString().split('T')[0],
    })

    if (formTypes && formTypes.length > 0) {
      params.set('forms', formTypes.join(','))
    }

    const response = await this.fetchSEC(`${SEC_SEARCH_URL}?${params}`)
    const data = await response.json()

    const documents: SourceDocument[] = []
    const hits = data.hits?.hits || []

    for (const hit of hits.slice(0, limit)) {
      const source = hit._source
      documents.push({
        id: `sec-search-${hit._id}`,
        sourceType: 'sec-edgar',
        title: `${source.display_names?.[0] || 'Unknown'} ${source.form} - ${source.file_date}`,
        content: source.text_content?.substring(0, 500) || '',
        url: source.file_url,
        publishedAt: source.file_date,
        metadata: {
          form: source.form,
          cik: source.ciks?.[0],
          companyName: source.display_names?.[0],
        },
      })
    }

    return documents
  }

  private async tickerToCIK(ticker: string): Promise<string | null> {
    const upperTicker = ticker.toUpperCase()
    
    // Check cache first
    if (TICKER_CIK_CACHE[upperTicker]) {
      return TICKER_CIK_CACHE[upperTicker]
    }

    try {
      // Fetch company tickers mapping from SEC
      const response = await this.fetchSEC(`${SEC_BASE_URL}/files/company_tickers.json`)
      const data = await response.json()

      // Search for ticker
      for (const key of Object.keys(data)) {
        const company = data[key]
        if (company.ticker?.toUpperCase() === upperTicker) {
          const cik = String(company.cik_str).padStart(10, '0')
          TICKER_CIK_CACHE[upperTicker] = cik
          return cik
        }
      }

      return null
    } catch (error) {
      console.error('Ticker lookup error:', error)
      return null
    }
  }

  async getDocument(documentId: string): Promise<SourceDocument | null> {
    // Document IDs are formatted as: sec-{cik}-{accession}
    const parts = documentId.split('-')
    if (parts.length < 3 || parts[0] !== 'sec') {
      return null
    }

    const cik = parts[1]
    const accession = parts.slice(2).join('-')

    try {
      // Fetch the filing index to get document details
      const accessionNoDash = accession.replace(/-/g, '')
      const indexUrl = `${SEC_ARCHIVES_URL}/${cik}/${accessionNoDash}/index.json`
      
      const response = await this.fetchSEC(indexUrl)
      const data = await response.json()

      // Find the primary document
      const primaryDoc = data.directory?.item?.find((item: { type: string }) => 
        item.type === 'primary_doc' || item.type?.includes('htm')
      )

      if (!primaryDoc) return null

      // Fetch the actual document content
      const docUrl = `${SEC_ARCHIVES_URL}/${cik}/${accessionNoDash}/${primaryDoc.name}`
      const docResponse = await this.fetchSEC(docUrl)
      const content = await docResponse.text()

      // Strip HTML tags for plain text (basic)
      const plainContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

      return {
        id: documentId,
        sourceType: 'sec-edgar',
        title: `${data.companyName || 'SEC Filing'} - ${accession}`,
        content: plainContent.substring(0, 10000), // Limit content size
        url: docUrl,
        publishedAt: data.filingDate,
        metadata: {
          cik,
          accessionNumber: accession,
          form: data.form,
        },
      }
    } catch (error) {
      console.error('Get document error:', error)
      return null
    }
  }

  async verifyClaim(claimText: string, context?: string): Promise<VerificationResult> {
    // Extract potential tickers and search terms from claim
    const tickerMatch = claimText.match(/\b([A-Z]{2,5})\b/)
    const ticker = tickerMatch?.[1]

    // Search for relevant filings
    const searchResult = await this.search({
      query: claimText,
      filters: {
        ticker: ticker,
        documentTypes: ['10-K', '10-Q', '8-K'],
        limit: 5,
      },
    })

    // If no documents found, claim is unverifiable from this source
    if (searchResult.documents.length === 0) {
      return {
        claimId: '', // Will be set by caller
        claimText,
        status: 'unverifiable',
        confidence: 0,
        sourceType: 'sec-edgar',
        supportingDocs: [],
        verifiedAt: new Date().toISOString(),
      }
    }

    // For now, return documents found - actual LLM verification happens in the verification engine
    // This is just the "gather evidence" step
    return {
      claimId: '',
      claimText,
      status: 'pending', // Needs LLM evaluation
      confidence: 0.5,
      sourceType: 'sec-edgar',
      supportingDocs: searchResult.documents,
      verifiedAt: new Date().toISOString(),
    }
  }

  async getSuggestions(partial: string): Promise<string[]> {
    const suggestions: string[] = []
    const upperPartial = partial.toUpperCase()

    // Suggest common filing types
    const filingTypes = ['10-K', '10-Q', '8-K', '13F', 'DEF 14A', 'S-1', '424B']
    for (const type of filingTypes) {
      if (type.includes(upperPartial)) {
        suggestions.push(`${type} filings`)
      }
    }

    // Suggest common tickers
    const commonTickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA']
    for (const ticker of commonTickers) {
      if (ticker.startsWith(upperPartial)) {
        suggestions.push(`${ticker} latest 10-K`)
        suggestions.push(`${ticker} quarterly revenue`)
      }
    }

    // Suggest query patterns
    if (partial.length > 2) {
      suggestions.push(`"${partial}" in recent filings`)
    }

    return suggestions.slice(0, 8)
  }
}

// Factory function
export function createSECEdgarAdapter(config?: Partial<SECEdgarConfig>): SECEdgarAdapter {
  return new SECEdgarAdapter({
    userAgent: config?.userAgent || 'Raven/1.0 (contact@tryraven.io)',
  })
}
