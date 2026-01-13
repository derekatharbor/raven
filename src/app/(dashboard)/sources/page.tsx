// Route: src/app/(dashboard)/sources/page.tsx

'use client'

import { useState } from 'react'
import { 
  Search, 
  Check, 
  X, 
  ChevronRight,
  ExternalLink,
  Zap,
  TrendingUp,
  Scale,
  Database,
  Sparkles,
  Bell,
  Key,
  Link2,
} from 'lucide-react'
import Image from 'next/image'

// =============================================================================
// TYPES
// =============================================================================

interface Source {
  id: string
  name: string
  description: string
  domain: string
  logo: string
  connected: boolean
  free?: boolean
  autoEnabled?: boolean
  requiresKey?: boolean
  oauth?: boolean
  comingSoon?: boolean
  category: 'essentials' | 'market' | 'legal' | 'systems' | 'comingSoon'
  overview: string
  verifies: string[]
  useCases: string[]
}

interface SourcesData {
  essentials: Source[]
  market: Source[]
  legal: Source[]
  systems: Source[]
  comingSoon: Source[]
}

// =============================================================================
// SMALL SHIELD STATUS ICON
// =============================================================================

function ShieldStatus({ connected, size = 14 }: { connected: boolean; size?: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none"
      className="flex-shrink-0"
    >
      <path 
        d="M12 2L4 6v6c0 5.25 3.4 10.15 8 11.25 4.6-1.1 8-6 8-11.25V6l-8-4z" 
        fill={connected ? '#22c55e' : '#9ca3af'}
        stroke={connected ? '#22c55e' : '#9ca3af'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path 
        d="M9 12l2 2 4-4" 
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// =============================================================================
// CATEGORY METADATA
// =============================================================================

const categories = [
  { 
    id: 'essentials', 
    label: 'Essentials', 
    description: 'Free sources included with every Harbor account',
    icon: Zap,
  },
  { 
    id: 'market', 
    label: 'Market Intelligence', 
    description: 'Connect your existing subscriptions for deeper coverage',
    icon: TrendingUp,
  },
  { 
    id: 'legal', 
    label: 'Legal & Regulatory', 
    description: 'Case law, compliance data, and regulatory updates',
    icon: Scale,
  },
  { 
    id: 'systems', 
    label: 'Your Systems', 
    description: 'Verify claims against your internal data',
    icon: Database,
  },
  { 
    id: 'comingSoon', 
    label: 'Coming Soon', 
    description: 'More integrations on the way',
    icon: Sparkles,
  },
]

// =============================================================================
// SOURCE DATA
// =============================================================================

const sourcesData: SourcesData = {
  essentials: [
    {
      id: 'sec-edgar',
      name: 'SEC EDGAR',
      description: 'Public company filings including 10-Ks, 10-Qs, 8-Ks, and proxy statements',
      domain: 'sec.gov',
      logo: '/logos/sec.svg',
      connected: true,
      free: true,
      autoEnabled: true,
      category: 'essentials',
      overview: 'The SEC EDGAR database provides free public access to corporate filings including 10-Ks, 10-Qs, 8-Ks, proxy statements, and more. Harbor continuously monitors these filings to verify claims about public companies.',
      verifies: ['Revenue figures', 'Executive compensation', 'Risk factors', 'Material events', 'Shareholder information'],
      useCases: ['Financial due diligence', 'Competitive analysis', 'Investment research', 'Regulatory compliance'],
    },
    {
      id: 'federal-register',
      name: 'Federal Register',
      description: 'Daily journal of the U.S. Government with rules and notices',
      domain: 'federalregister.gov',
      logo: '/logos/federal-register.svg',
      connected: true,
      free: true,
      autoEnabled: true,
      category: 'essentials',
      overview: 'The Federal Register is the official daily publication for rules, proposed rules, and notices of Federal agencies. Harbor monitors regulatory changes that could impact your business.',
      verifies: ['Regulatory requirements', 'Proposed rules', 'Agency notices', 'Executive orders'],
      useCases: ['Regulatory monitoring', 'Compliance tracking', 'Policy analysis', 'Government affairs'],
    },
    {
      id: 'patents-uspo',
      name: 'USPTO Patents',
      description: 'Patent grants, applications, and intellectual property records',
      domain: 'uspto.gov',
      logo: '/logos/uspto.svg',
      connected: true,
      free: true,
      autoEnabled: true,
      category: 'essentials',
      overview: 'The United States Patent and Trademark Office database contains all U.S. patents and patent applications. Harbor uses this to verify intellectual property claims and track competitive innovation.',
      verifies: ['Patent ownership', 'Filing dates', 'Claims scope', 'Prior art', 'Patent status'],
      useCases: ['IP due diligence', 'Competitive intelligence', 'Freedom to operate', 'Technology scouting'],
    },
    {
      id: 'opencorporates',
      name: 'OpenCorporates',
      description: 'Global company registry data from 140+ jurisdictions',
      domain: 'opencorporates.com',
      logo: '/logos/opencorporates.svg',
      connected: true,
      free: true,
      autoEnabled: true,
      category: 'essentials',
      overview: 'OpenCorporates is the largest open database of companies in the world, with data from over 140 jurisdictions. Harbor uses this to verify corporate structure and registration claims.',
      verifies: ['Company registration', 'Incorporation date', 'Registered address', 'Officer names', 'Company status'],
      useCases: ['KYC verification', 'Vendor due diligence', 'Corporate structure analysis', 'Entity verification'],
    },
    {
      id: 'web-search',
      name: 'Web Search',
      description: 'Real-time news, press releases, and web content monitoring',
      domain: 'google.com',
      logo: '/logos/google.svg',
      connected: true,
      free: true,
      autoEnabled: true,
      category: 'essentials',
      overview: 'Harbor continuously monitors web content and news sources to verify claims and detect contradictions in real-time. This includes press releases, news articles, and company announcements.',
      verifies: ['News accuracy', 'Press releases', 'Company announcements', 'Executive statements', 'Market events'],
      useCases: ['Media monitoring', 'Reputation tracking', 'Event detection', 'Fact checking'],
    },
  ],
  market: [
    {
      id: 'bloomberg',
      name: 'Bloomberg',
      description: 'Financial data, market analytics, and real-time pricing',
      domain: 'bloomberg.com',
      logo: '/logos/bloomberg.svg',
      connected: false,
      requiresKey: true,
      category: 'market',
      overview: 'Bloomberg provides comprehensive financial data, analytics, and news. Connect your Bloomberg terminal credentials to verify market data, company financials, and analyst estimates.',
      verifies: ['Stock prices', 'Financial metrics', 'Analyst ratings', 'Market cap', 'Trading volumes'],
      useCases: ['Investment research', 'Market analysis', 'Portfolio monitoring', 'Trading decisions'],
    },
    {
      id: 'factset',
      name: 'FactSet',
      description: 'Financial data and analytics for investment professionals',
      domain: 'factset.com',
      logo: '/logos/factset.svg',
      connected: false,
      requiresKey: true,
      category: 'market',
      overview: 'FactSet delivers integrated financial information and analytical applications. Your firm may already have a FactSet license. Connect to verify financial data at scale.',
      verifies: ['Company financials', 'Estimates', 'Ownership data', 'Supply chain', 'Geographic revenue'],
      useCases: ['Equity research', 'Portfolio analytics', 'Risk management', 'M&A analysis'],
    },
    {
      id: 'pitchbook',
      name: 'PitchBook',
      description: 'Private market data, VC, PE, and M&A intelligence',
      domain: 'pitchbook.com',
      logo: '/logos/pitchbook.svg',
      connected: false,
      requiresKey: true,
      category: 'market',
      overview: 'PitchBook provides comprehensive data on the private capital markets, including venture capital, private equity, and M&A transactions.',
      verifies: ['Funding rounds', 'Valuations', 'Investor details', 'Deal terms', 'Company profiles'],
      useCases: ['Deal sourcing', 'Competitive intelligence', 'Market sizing', 'LP reporting'],
    },
    {
      id: 'morningstar',
      name: 'Morningstar',
      description: 'Investment research, fund ratings, and portfolio tools',
      domain: 'morningstar.com',
      logo: '/logos/morningstar.svg',
      connected: false,
      requiresKey: true,
      category: 'market',
      overview: 'Morningstar provides independent investment research including fund ratings, analyst reports, and portfolio analysis tools. Many advisory firms have existing licenses.',
      verifies: ['Fund ratings', 'Expense ratios', 'Holdings data', 'Performance metrics', 'Risk scores'],
      useCases: ['Fund selection', 'Portfolio construction', 'Client reporting', 'Due diligence'],
    },
    {
      id: 'ibisworld',
      name: 'IBISWorld',
      description: 'Industry research reports and market analysis',
      domain: 'ibisworld.com',
      logo: '/logos/ibisworld.svg',
      connected: false,
      requiresKey: true,
      category: 'market',
      overview: 'IBISWorld provides comprehensive industry research reports covering market size, growth trends, competitive landscape, and key success factors for thousands of industries.',
      verifies: ['Industry size', 'Growth rates', 'Market share', 'Industry structure', 'Key success factors'],
      useCases: ['Industry analysis', 'Business planning', 'Market entry strategy', 'Competitive positioning'],
    },
    {
      id: 'newsapi',
      name: 'News API',
      description: 'Global news aggregation from 80,000+ sources',
      domain: 'newsapi.org',
      logo: '/logos/newsapi.svg',
      connected: false,
      requiresKey: true,
      category: 'market',
      overview: 'News API provides access to headlines and articles from news sources and blogs across the web in real-time.',
      verifies: ['Breaking news', 'Press coverage', 'Media mentions', 'Sentiment'],
      useCases: ['Media monitoring', 'Reputation tracking', 'Event detection', 'Trend analysis'],
    },
  ],
  legal: [
    {
      id: 'lexisnexis',
      name: 'LexisNexis',
      description: 'Case law, statutes, regulations, and legal analytics',
      domain: 'lexisnexis.com',
      logo: '/logos/lexisnexis.svg',
      connected: false,
      requiresKey: true,
      category: 'legal',
      overview: 'LexisNexis provides comprehensive legal research including case law, statutes, regulations, and legal news from jurisdictions worldwide. Connect your existing subscription to verify legal claims.',
      verifies: ['Case citations', 'Statutory status', 'Regulatory text', 'Legal precedents', 'Court decisions'],
      useCases: ['Legal research', 'Compliance verification', 'Litigation support', 'Regulatory analysis'],
    },
    {
      id: 'westlaw',
      name: 'Westlaw',
      description: 'Legal research, court documents, and practice tools',
      domain: 'thomsonreuters.com',
      logo: '/logos/westlaw.svg',
      connected: false,
      requiresKey: true,
      category: 'legal',
      overview: 'Westlaw delivers legal research including cases, statutes, regulations, secondary sources, and practice tools. Many law firms and legal departments have existing access.',
      verifies: ['Case law', 'Regulatory status', 'Legal treatises', 'Court filings', 'Docket information'],
      useCases: ['Legal due diligence', 'Regulatory research', 'Case analysis', 'Contract review'],
    },
    {
      id: 'pacer',
      name: 'PACER',
      description: 'Federal court records, filings, and docket information',
      domain: 'pacer.uscourts.gov',
      logo: '/logos/pacer.svg',
      connected: false,
      requiresKey: true,
      category: 'legal',
      overview: 'Public Access to Court Electronic Records (PACER) provides access to federal court documents. Harbor monitors case filings and docket entries relevant to your tracked entities.',
      verifies: ['Case filings', 'Docket entries', 'Court orders', 'Judgment status', 'Party information'],
      useCases: ['Litigation monitoring', 'Bankruptcy tracking', 'Due diligence', 'Competitive intelligence'],
    },
  ],
  systems: [
    {
      id: 'google-sheets',
      name: 'Google Sheets',
      description: 'Verify claims against your own spreadsheet data',
      domain: 'google.com',
      logo: '/logos/google-sheets.svg',
      connected: false,
      oauth: true,
      category: 'systems',
      overview: 'Connect your Google Sheets to verify claims against your own data. Harbor can cross-reference AI-generated content with your internal metrics, KPIs, and tracking data.',
      verifies: ['Internal metrics', 'KPIs', 'Custom data', 'Historical records', 'Team data'],
      useCases: ['Internal fact-checking', 'Data validation', 'Report verification', 'Custom tracking'],
    },
    {
      id: 'airtable',
      name: 'Airtable',
      description: 'Connect your Airtable bases for verification',
      domain: 'airtable.com',
      logo: '/logos/airtable.svg',
      connected: false,
      oauth: true,
      category: 'systems',
      overview: 'Airtable integration allows Harbor to verify claims against your structured data. Perfect for teams using Airtable for CRM, project tracking, or content management.',
      verifies: ['Project status', 'Client data', 'Content records', 'Team information', 'Custom fields'],
      useCases: ['Project verification', 'CRM validation', 'Content fact-checking', 'Workflow automation'],
    },
    {
      id: 'notion',
      name: 'Notion',
      description: 'Sync your Notion workspace and knowledge base',
      domain: 'notion.so',
      logo: '/logos/notion.svg',
      connected: false,
      oauth: true,
      category: 'systems',
      overview: 'Connect Notion to verify claims against your team\'s knowledge base, documentation, and project data. Harbor respects your workspace permissions.',
      verifies: ['Documentation', 'Project details', 'Team wiki', 'Meeting notes', 'Process documentation'],
      useCases: ['Knowledge verification', 'Documentation sync', 'Project tracking', 'Internal references'],
    },
  ],
  comingSoon: [
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'CRM data, customer records, and pipeline metrics',
      domain: 'salesforce.com',
      logo: '/logos/salesforce.svg',
      connected: false,
      comingSoon: true,
      category: 'comingSoon',
      overview: 'Salesforce integration will allow Harbor to verify claims against your CRM data, including customer information, deal status, and pipeline metrics.',
      verifies: ['Customer data', 'Deal status', 'Pipeline metrics', 'Account information'],
      useCases: ['Sales verification', 'Customer references', 'Pipeline accuracy', 'Revenue validation'],
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'Marketing automation and sales platform data',
      domain: 'hubspot.com',
      logo: '/logos/hubspot.svg',
      connected: false,
      comingSoon: true,
      category: 'comingSoon',
      overview: 'HubSpot integration will connect your marketing automation, CRM, and sales data for comprehensive verification of customer and campaign claims.',
      verifies: ['Contact data', 'Campaign metrics', 'Deal information', 'Marketing performance'],
      useCases: ['Marketing verification', 'Lead validation', 'Campaign analysis', 'Sales tracking'],
    },
    {
      id: 'snowflake',
      name: 'Snowflake',
      description: 'Data warehouse integration for enterprise verification',
      domain: 'snowflake.com',
      logo: '/logos/snowflake.svg',
      connected: false,
      comingSoon: true,
      category: 'comingSoon',
      overview: 'Snowflake integration will allow Harbor to query your data warehouse directly, enabling verification against your complete analytical dataset.',
      verifies: ['Business metrics', 'Custom analytics', 'Historical data', 'Cross-system data'],
      useCases: ['Enterprise verification', 'Data validation', 'Custom queries', 'Advanced analytics'],
    },
  ],
}

// =============================================================================
// SOURCE DETAIL MODAL
// =============================================================================

interface SourceDetailModalProps {
  source: Source
  onClose: () => void
  onConnect: (sourceId: string, apiKey?: string) => void
}

function SourceDetailModal({ source, onClose, onConnect }: SourceDetailModalProps) {
  const [apiKey, setApiKey] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [showApiInput, setShowApiInput] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    await new Promise(resolve => setTimeout(resolve, 1200))
    onConnect(source.id, apiKey || undefined)
    setIsConnecting(false)
    onClose()
  }

  const handleOAuthConnect = async () => {
    setIsConnecting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    onConnect(source.id)
    setIsConnecting(false)
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white border border-[#E6E6E7] rounded-xl w-full max-w-lg shadow-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#E6E6E7]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#F7F7F8] rounded-lg flex items-center justify-center border border-[#E6E6E7] overflow-hidden">
                <Image
                  src={source.logo}
                  alt={source.name}
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[#1C1C1E] font-semibold text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {source.name}
                  </h2>
                  <ShieldStatus connected={source.connected} size={14} />
                </div>
                <p className="text-[#6b7280] text-sm">{source.domain}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-[#9ca3af] hover:text-[#6b7280] transition-colors p-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Overview */}
          <div>
            <h3 className="text-[#6b7280] text-xs font-medium uppercase tracking-wider mb-2">Overview</h3>
            <p className="text-[#2A2A2C] text-sm leading-relaxed">{source.overview}</p>
          </div>

          {/* What we verify */}
          <div>
            <h3 className="text-[#6b7280] text-xs font-medium uppercase tracking-wider mb-2">What Harbor Verifies</h3>
            <div className="flex flex-wrap gap-2">
              {source.verifies.map((item, idx) => (
                <span 
                  key={idx}
                  className="px-2.5 py-1 bg-[#F7F7F8] border border-[#E6E6E7] rounded text-[#2A2A2C] text-xs"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <div>
            <h3 className="text-[#6b7280] text-xs font-medium uppercase tracking-wider mb-2">Use Cases</h3>
            <ul className="space-y-1.5">
              {source.useCases.map((useCase, idx) => (
                <li key={idx} className="flex items-center gap-2 text-[#2A2A2C] text-sm">
                  <ChevronRight size={12} className="text-[#9ca3af]" />
                  {useCase}
                </li>
              ))}
            </ul>
          </div>

          {/* API Key Input */}
          {source.requiresKey && !source.connected && showApiInput && (
            <div className="pt-2">
              <label className="text-[#6b7280] text-xs font-medium uppercase tracking-wider mb-2 block">
                API Key
              </label>
              <div className="relative">
                <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                  className="w-full bg-[#F7F7F8] border border-[#E6E6E7] rounded-lg pl-9 pr-4 py-2.5 text-[#1C1C1E] text-sm placeholder:text-[#9ca3af] focus:outline-none focus:border-[#9ca3af] transition-colors"
                />
              </div>
              <p className="text-[#9ca3af] text-xs mt-2">
                Your API key is encrypted and stored securely.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E6E6E7] bg-[#F7F7F8]">
          {source.comingSoon ? (
            <button
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#E6E6E7] rounded-lg text-[#2A2A2C] text-sm font-medium hover:bg-[#EFEFF0] transition-colors"
            >
              <Bell size={14} />
              Notify me when available
            </button>
          ) : source.connected ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <ShieldStatus connected={true} size={14} />
                <span>{source.free ? 'Active' : 'Connected'}</span>
              </div>
              {!source.free && (
                <button className="text-[#6b7280] text-sm hover:text-[#2A2A2C] transition-colors">
                  Disconnect
                </button>
              )}
            </div>
          ) : source.oauth ? (
            <button
              onClick={handleOAuthConnect}
              disabled={isConnecting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1C1C1E] text-white rounded-lg text-sm font-medium hover:bg-[#2A2A2C] transition-colors disabled:opacity-50"
            >
              {isConnecting ? (
                <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Link2 size={14} />
                  Connect with OAuth
                </>
              )}
            </button>
          ) : source.requiresKey ? (
            showApiInput ? (
              <button
                onClick={handleConnect}
                disabled={isConnecting || !apiKey}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1C1C1E] text-white rounded-lg text-sm font-medium hover:bg-[#2A2A2C] transition-colors disabled:opacity-50"
              >
                {isConnecting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Check size={14} />
                    Connect Source
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => setShowApiInput(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1C1C1E] text-white rounded-lg text-sm font-medium hover:bg-[#2A2A2C] transition-colors"
              >
                <Key size={14} />
                Add API Key
              </button>
            )
          ) : null}
          
          {/* External link */}
          <a 
            href={`https://${source.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-[#9ca3af] text-xs mt-3 hover:text-[#6b7280] transition-colors"
          >
            Visit {source.domain}
            <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// SOURCE CARD COMPONENT (Linear-style)
// =============================================================================

interface SourceCardProps {
  source: Source
  onClick: () => void
}

function SourceCard({ source, onClick }: SourceCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-[#E6E6E7] rounded-xl p-4 hover:border-[#d1d5db] hover:shadow-sm transition-all group"
    >
      {/* Logo + Name Row */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-[#F7F7F8] rounded-lg flex items-center justify-center border border-[#E6E6E7] overflow-hidden flex-shrink-0">
          <Image
            src={source.logo}
            alt={source.name}
            width={24}
            height={24}
            className="object-contain"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[#1C1C1E] text-sm font-medium truncate">{source.name}</span>
            <ShieldStatus connected={source.connected} size={12} />
          </div>
          <span className="text-[#9ca3af] text-xs">{source.domain}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-[#6b7280] text-sm leading-relaxed line-clamp-2">
        {source.description}
      </p>
    </button>
  )
}

// =============================================================================
// MAIN SOURCES PAGE
// =============================================================================

export default function SourcesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSource, setSelectedSource] = useState<Source | null>(null)
  const [sources, setSources] = useState<SourcesData>(sourcesData)

  // Handle source connection
  const handleConnect = (sourceId: string, apiKey?: string) => {
    setSources(prev => {
      const newSources = { ...prev }
      for (const category of Object.keys(newSources) as (keyof SourcesData)[]) {
        newSources[category] = newSources[category].map(s => 
          s.id === sourceId ? { ...s, connected: true } : s
        )
      }
      return newSources
    })
  }

  // Total connected count
  const totalConnected = Object.values(sources).flat().filter(s => s.connected).length

  // Filter sources by search
  const filterSources = (categorySources: Source[]) => {
    if (!searchQuery) return categorySources
    const query = searchQuery.toLowerCase()
    return categorySources.filter(s => 
      s.name.toLowerCase().includes(query) || 
      s.description.toLowerCase().includes(query) ||
      s.domain.toLowerCase().includes(query)
    )
  }

  return (
    <div className="min-h-full bg-[#F7F7F8]">
      {/* Page Header */}
      <div className="bg-white border-b border-[#E6E6E7]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 
                className="text-[#1C1C1E] text-2xl font-semibold"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Sources
              </h1>
              <p className="text-[#6b7280] text-sm mt-1">
                {totalConnected} sources active
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sources..."
              className="w-full bg-[#F7F7F8] border border-[#E6E6E7] rounded-lg pl-10 pr-4 py-2.5 text-[#1C1C1E] text-sm placeholder:text-[#9ca3af] focus:outline-none focus:border-[#9ca3af] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {categories.map(category => {
          const categorySources = filterSources(sources[category.id as keyof SourcesData] || [])
          if (categorySources.length === 0 && searchQuery) return null

          return (
            <div key={category.id} className="mb-10">
              {/* Section Header */}
              <div className="mb-4">
                <h2 
                  className="text-[#1C1C1E] text-lg font-semibold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {category.label}
                </h2>
                <p className="text-[#6b7280] text-sm mt-0.5">{category.description}</p>
              </div>

              {/* Card Grid - 3 columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorySources.map(source => (
                  <SourceCard
                    key={source.id}
                    source={source}
                    onClick={() => setSelectedSource(source)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Source Detail Modal */}
      {selectedSource && (
        <SourceDetailModal
          source={selectedSource}
          onClose={() => setSelectedSource(null)}
          onConnect={handleConnect}
        />
      )}
    </div>
  )
}