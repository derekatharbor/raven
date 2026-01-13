// Route: src/app/(dashboard)/sources/page.tsx

'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Search, 
  Check, 
  Plus, 
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

// =============================================================================
// TYPES
// =============================================================================

interface Source {
  id: string
  name: string
  description: string
  domain: string
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
// SHIELD ICON COMPONENT
// =============================================================================

function ShieldIcon({ connected, size = 18 }: { connected: boolean; size?: number }) {
  const color = connected ? '#22c55e' : '#6b7280'
  
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
        fill={connected ? color : 'transparent'}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path 
        d="M9 12l2 2 4-4" 
        stroke={connected ? '#fff' : color}
        strokeWidth="1.5"
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
      description: 'Public company filings and disclosures',
      domain: 'sec.gov',
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
      description: 'Daily journal of the U.S. Government',
      domain: 'federalregister.gov',
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
      description: 'Patent grants and applications',
      domain: 'uspto.gov',
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
      description: 'Global company registry data',
      domain: 'opencorporates.com',
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
      description: 'Real-time news and web content',
      domain: 'google.com',
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
      description: 'Financial data and market analytics',
      domain: 'bloomberg.com',
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
      description: 'Financial data and analytics platform',
      domain: 'factset.com',
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
      description: 'Private market data and intelligence',
      domain: 'pitchbook.com',
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
      description: 'Investment research and fund data',
      domain: 'morningstar.com',
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
      description: 'Industry research and market reports',
      domain: 'ibisworld.com',
      connected: false,
      requiresKey: true,
      category: 'market',
      overview: 'IBISWorld provides comprehensive industry research reports covering market size, growth trends, competitive landscape, and key success factors for thousands of industries.',
      verifies: ['Industry size', 'Growth rates', 'Market share', 'Industry structure', 'Key success factors'],
      useCases: ['Industry analysis', 'Business planning', 'Market entry strategy', 'Competitive positioning'],
    },
  ],
  legal: [
    {
      id: 'lexisnexis',
      name: 'LexisNexis',
      description: 'Case law, statutes, and legal analytics',
      domain: 'lexisnexis.com',
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
      description: 'Legal research and court documents',
      domain: 'thomsonreuters.com',
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
      description: 'Federal court records and filings',
      domain: 'pacer.uscourts.gov',
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
      description: 'Verify against your spreadsheet data',
      domain: 'google.com',
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
      description: 'Connect your Airtable bases',
      domain: 'airtable.com',
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
      description: 'Sync your Notion workspace',
      domain: 'notion.so',
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
      description: 'CRM data and customer records',
      domain: 'salesforce.com',
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
      description: 'Marketing and sales platform',
      domain: 'hubspot.com',
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
      description: 'Data warehouse integration',
      domain: 'snowflake.com',
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
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 1200))
    onConnect(source.id, apiKey || undefined)
    setIsConnecting(false)
    onClose()
  }

  const handleOAuthConnect = async () => {
    setIsConnecting(true)
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 1500))
    onConnect(source.id)
    setIsConnecting(false)
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#161718] border border-white/[0.06] rounded-xl w-full max-w-lg shadow-[0_4px_18px_rgba(0,0,0,0.22)] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#111213] rounded-lg flex items-center justify-center border border-white/[0.06]">
                <ShieldIcon connected={source.connected} size={20} />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {source.name}
                </h2>
                <p className="text-white/50 text-sm">{source.domain}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white/40 hover:text-white/70 transition-colors p-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Overview */}
          <div>
            <h3 className="text-white/70 text-xs font-medium uppercase tracking-wider mb-2">Overview</h3>
            <p className="text-white/80 text-sm leading-relaxed">{source.overview}</p>
          </div>

          {/* What we verify */}
          <div>
            <h3 className="text-white/70 text-xs font-medium uppercase tracking-wider mb-2">What Harbor Verifies</h3>
            <div className="flex flex-wrap gap-2">
              {source.verifies.map((item, idx) => (
                <span 
                  key={idx}
                  className="px-2.5 py-1 bg-white/[0.04] border border-white/[0.06] rounded text-white/70 text-xs"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <div>
            <h3 className="text-white/70 text-xs font-medium uppercase tracking-wider mb-2">Use Cases</h3>
            <ul className="space-y-1.5">
              {source.useCases.map((useCase, idx) => (
                <li key={idx} className="flex items-center gap-2 text-white/70 text-sm">
                  <ChevronRight size={12} className="text-white/30" />
                  {useCase}
                </li>
              ))}
            </ul>
          </div>

          {/* API Key Input (for requiresKey sources) */}
          {source.requiresKey && !source.connected && showApiInput && (
            <div className="pt-2">
              <label className="text-white/70 text-xs font-medium uppercase tracking-wider mb-2 block">
                API Key
              </label>
              <div className="relative">
                <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                  className="w-full bg-[#111213] border border-white/[0.06] rounded-lg pl-9 pr-4 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>
              <p className="text-white/40 text-xs mt-2">
                Your API key is encrypted and stored securely.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.06] bg-[#111213]/50">
          {source.comingSoon ? (
            <button
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-lg text-white/70 text-sm font-medium hover:bg-white/[0.06] transition-colors"
            >
              <Bell size={14} />
              Notify me when available
            </button>
          ) : source.connected ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-500 text-sm">
                <ShieldIcon connected={true} size={16} />
                <span>{source.free ? 'Active' : 'Connected'}</span>
              </div>
              {!source.free && (
                <button className="text-white/50 text-sm hover:text-white/70 transition-colors">
                  Disconnect
                </button>
              )}
            </div>
          ) : source.oauth ? (
            <button
              onClick={handleOAuthConnect}
              disabled={isConnecting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-[#111213] rounded-lg text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {isConnecting ? (
                <span className="inline-block w-4 h-4 border-2 border-[#111213]/20 border-t-[#111213] rounded-full animate-spin" />
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
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-[#111213] rounded-lg text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                {isConnecting ? (
                  <span className="inline-block w-4 h-4 border-2 border-[#111213]/20 border-t-[#111213] rounded-full animate-spin" />
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
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-sm font-medium hover:bg-white/[0.08] transition-colors"
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
            className="flex items-center justify-center gap-1.5 text-white/40 text-xs mt-3 hover:text-white/60 transition-colors"
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
// SOURCE ROW COMPONENT
// =============================================================================

interface SourceRowProps {
  source: Source
  onClick: () => void
}

function SourceRow({ source, onClick }: SourceRowProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-white/[0.02] transition-colors text-left group"
    >
      {/* Shield Icon */}
      <ShieldIcon connected={source.connected} size={18} />
      
      {/* Name & Description */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium">{source.name}</span>
          {source.free && source.autoEnabled && (
            <span className="px-1.5 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded text-white/40 text-[10px] uppercase tracking-wide">
              Auto
            </span>
          )}
        </div>
        <span className="text-white/50 text-xs truncate block">{source.description}</span>
      </div>

      {/* Status / Action hint */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-white/40 text-xs">
          {source.comingSoon ? 'Coming soon' : source.connected ? 'View details' : 'Connect'}
        </span>
        <ChevronRight size={14} className="text-white/30" />
      </div>
    </button>
  )
}

// =============================================================================
// MAIN SOURCES PAGE
// =============================================================================

export default function SourcesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('essentials')
  const [selectedSource, setSelectedSource] = useState<Source | null>(null)
  const [sources, setSources] = useState<SourcesData>(sourcesData)
  
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const mainContentRef = useRef<HTMLDivElement>(null)

  // Scroll spy effect
  useEffect(() => {
    const handleScroll = () => {
      if (!mainContentRef.current) return
      
      const scrollTop = mainContentRef.current.scrollTop
      const offset = 100

      for (const category of categories) {
        const section = sectionRefs.current[category.id]
        if (section) {
          const sectionTop = section.offsetTop - offset
          const sectionBottom = sectionTop + section.offsetHeight
          
          if (scrollTop >= sectionTop && scrollTop < sectionBottom) {
            setActiveCategory(category.id)
            break
          }
        }
      }
    }

    const mainContent = mainContentRef.current
    mainContent?.addEventListener('scroll', handleScroll)
    return () => mainContent?.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll to section
  const scrollToSection = (categoryId: string) => {
    const section = sectionRefs.current[categoryId]
    if (section && mainContentRef.current) {
      mainContentRef.current.scrollTo({
        top: section.offsetTop - 20,
        behavior: 'smooth'
      })
    }
  }

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

  // Count connected sources per category
  const getConnectedCount = (categoryId: string) => {
    const categorySources = sources[categoryId as keyof SourcesData] || []
    return categorySources.filter(s => s.connected).length
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
    <div className="flex h-full bg-[#0B0B0C]">
      {/* Left Sidebar */}
      <div className="w-56 flex-shrink-0 border-r border-white/[0.06] p-4 flex flex-col">
        {/* Title */}
        <div className="mb-6">
          <h1 
            className="text-white text-lg font-semibold"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Sources
          </h1>
          <p className="text-white/50 text-xs mt-1">
            {totalConnected} sources active
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sources..."
            className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg pl-9 pr-3 py-2 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
          />
        </div>

        {/* Category Navigation */}
        <nav className="space-y-1 flex-1">
          {categories.map(category => {
            const Icon = category.icon
            const connectedCount = getConnectedCount(category.id)
            const isActive = activeCategory === category.id
            
            return (
              <button
                key={category.id}
                onClick={() => scrollToSection(category.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  isActive 
                    ? 'bg-white/[0.06] text-white' 
                    : 'text-white/60 hover:bg-white/[0.03] hover:text-white/80'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-white/70' : 'text-white/40'} />
                <span className="text-sm flex-1">{category.label}</span>
                {connectedCount > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-green-500/20 text-green-400' : 'bg-white/[0.06] text-white/50'
                  }`}>
                    {connectedCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div 
        ref={mainContentRef}
        className="flex-1 overflow-y-auto p-6"
      >
        <div className="max-w-2xl">
          {categories.map(category => {
            const categorySources = filterSources(sources[category.id as keyof SourcesData] || [])
            if (categorySources.length === 0 && searchQuery) return null

            return (
              <div
                key={category.id}
                ref={el => { sectionRefs.current[category.id] = el }}
                className="mb-8"
              >
                {/* Section Header */}
                <div className="mb-3">
                  <h2 
                    className="text-white text-sm font-semibold"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {category.label}
                  </h2>
                  <p className="text-white/40 text-xs mt-0.5">{category.description}</p>
                </div>

                {/* Source Rows */}
                <div className="bg-[#111213] border border-white/[0.06] rounded-xl overflow-hidden divide-y divide-white/[0.04]">
                  {categorySources.map(source => (
                    <SourceRow
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