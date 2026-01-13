// Route: src/app/(dashboard)/sources/page.tsx

'use client'

import { useState } from 'react'
import { 
  Search, 
  Check, 
  Plus, 
  X, 
  Lock, 
  Unlock,
  ExternalLink,
  ChevronRight,
} from 'lucide-react'

// Source data organized by category
const sourcesData = {
  government: [
    {
      id: 'sec-edgar',
      name: 'SEC EDGAR',
      description: 'Public company filings, financials, and disclosures',
      domain: 'sec.gov',
      connected: true,
      free: true,
      autoEnabled: true,
    },
    {
      id: 'fda',
      name: 'FDA',
      description: 'Drug approvals, recalls, and clinical trial data',
      domain: 'fda.gov',
      connected: true,
      free: true,
      autoEnabled: true,
    },
    {
      id: 'uspto',
      name: 'USPTO',
      description: 'Patents, trademarks, and intellectual property filings',
      domain: 'uspto.gov',
      connected: true,
      free: true,
      autoEnabled: true,
    },
    {
      id: 'bls',
      name: 'Bureau of Labor Statistics',
      description: 'Employment, wages, and labor market data',
      domain: 'bls.gov',
      connected: true,
      free: true,
      autoEnabled: true,
    },
    {
      id: 'opencorporates',
      name: 'OpenCorporates',
      description: '200M+ companies, directors, and corporate filings',
      domain: 'opencorporates.com',
      connected: true,
      free: true,
      autoEnabled: true,
    },
    {
      id: 'clinicaltrials',
      name: 'ClinicalTrials.gov',
      description: 'Clinical study registrations and results',
      domain: 'clinicaltrials.gov',
      connected: true,
      free: true,
      autoEnabled: true,
    },
  ],
  financial: [
    {
      id: 'crunchbase',
      name: 'Crunchbase',
      description: 'Private company funding, firmographics, and insights',
      domain: 'crunchbase.com',
      connected: false,
      free: false,
      requiresKey: true,
    },
    {
      id: 'pitchbook',
      name: 'PitchBook',
      description: 'VC/PE deals, valuations, and investor data',
      domain: 'pitchbook.com',
      connected: false,
      free: false,
      requiresKey: true,
    },
    {
      id: 'factset',
      name: 'FactSet',
      description: 'Financial data, analytics, and M&A intelligence',
      domain: 'factset.com',
      connected: false,
      free: false,
      requiresKey: true,
    },
    {
      id: 'capitaliq',
      name: 'S&P Capital IQ',
      description: 'Company intelligence and financial research',
      domain: 'spglobal.com',
      connected: false,
      free: false,
      requiresKey: true,
    },
  ],
  research: [
    {
      id: 'statista',
      name: 'Statista',
      description: 'Market research, statistics, and industry reports',
      domain: 'statista.com',
      connected: false,
      free: false,
      requiresKey: true,
    },
    {
      id: 'gartner',
      name: 'Gartner',
      description: 'Technology research and advisory insights',
      domain: 'gartner.com',
      connected: false,
      free: false,
      requiresKey: true,
    },
    {
      id: 'ibisworld',
      name: 'IBISWorld',
      description: 'Industry research and market analysis reports',
      domain: 'ibisworld.com',
      connected: false,
      free: false,
      requiresKey: true,
    },
  ],
  news: [
    {
      id: 'web-search',
      name: 'Web Search',
      description: 'Real-time news and web content verification',
      domain: 'google.com',
      connected: true,
      free: true,
      autoEnabled: true,
    },
    {
      id: 'newsapi',
      name: 'News API',
      description: 'Breaking news and headlines from global sources',
      domain: 'newsapi.org',
      connected: false,
      free: false,
      requiresKey: true,
    },
  ],
}

const categories = [
  { id: 'all', label: 'All Sources' },
  { id: 'government', label: 'Government & Public' },
  { id: 'financial', label: 'Financial Intelligence' },
  { id: 'research', label: 'Research & Analysis' },
  { id: 'news', label: 'News & Events' },
]

// Modal for API key input
function ApiKeyModal({ 
  source, 
  onClose, 
  onConnect 
}: { 
  source: any
  onClose: () => void
  onConnect: (id: string, key: string) => void 
}) {
  const [apiKey, setApiKey] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    onConnect(source.id, apiKey)
    setIsConnecting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              <img 
                src={`https://cdn.brandfetch.io/${source.domain}?c=1id1Fyz-h7an5-5KR_y`}
                alt={source.name}
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Connect {source.name}
              </h3>
              <p className="text-xs text-gray-500">Enter your API key to enable</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
          </button>
        </div>

        {/* Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key..."
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
          />
          <p className="text-xs text-gray-500 mt-2">
            Your key is encrypted and stored securely. Harbor only uses it to query on your behalf.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConnect}
            disabled={!apiKey || isConnecting}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isConnecting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" strokeWidth={1.5} />
                Connect
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Source card component
function SourceCard({ 
  source, 
  onConnect, 
  onDisconnect 
}: { 
  source: any
  onConnect: (source: any) => void
  onDisconnect: (id: string) => void
}) {
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col h-full hover:shadow-md transition-shadow"
      style={{ boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
            <img 
              src={`https://cdn.brandfetch.io/${source.domain}?c=1id1Fyz-h7an5-5KR_y`}
              alt={source.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
          
          {/* Status badge */}
          {source.connected ? (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 border border-emerald-100">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-emerald-700 text-[10px] font-medium uppercase tracking-wide">
                Connected
              </span>
            </div>
          ) : source.requiresKey ? (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50 border border-gray-200">
              <Lock className="w-3 h-3 text-gray-400" strokeWidth={1.5} />
              <span className="text-gray-500 text-[10px] font-medium uppercase tracking-wide">
                BYOK
              </span>
            </div>
          ) : null}
        </div>

        {/* Free label */}
        {source.free && (
          <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
            Free
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-base font-medium text-gray-900 mb-1">
          {source.name}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          {source.description}
        </p>
      </div>

      {/* Action footer */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        {source.autoEnabled ? (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Always enabled</span>
            <div className="flex items-center gap-1.5 text-gray-400">
              <Unlock className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span className="text-xs">Public API</span>
            </div>
          </div>
        ) : source.connected ? (
          <div className="flex items-center justify-between">
            <button
              onClick={() => onDisconnect(source.id)}
              className="text-xs text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
            >
              Disconnect
            </button>
            <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
              <span className="text-xs">Manage</span>
              <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onConnect(source)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-sm font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            Add API Key
          </button>
        )}
      </div>
    </div>
  )
}

// Main Sources page
export default function SourcesPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sources, setSources] = useState(sourcesData)
  const [modalSource, setModalSource] = useState<any>(null)

  // Get filtered sources
  const getFilteredSources = () => {
    let filtered: any[] = []
    
    if (activeTab === 'all') {
      filtered = Object.values(sources).flat()
    } else {
      filtered = sources[activeTab as keyof typeof sources] || []
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (source: any) =>
          source.name.toLowerCase().includes(query) ||
          source.description.toLowerCase().includes(query)
      )
    }

    return filtered
  }

  const handleConnect = (sourceId: string, apiKey: string) => {
    const newSources = { ...sources }
    Object.keys(newSources).forEach(category => {
      newSources[category as keyof typeof newSources] = newSources[category as keyof typeof newSources].map(source =>
        source.id === sourceId ? { ...source, connected: true } : source
      )
    })
    setSources(newSources)
  }

  const handleDisconnect = (sourceId: string) => {
    const newSources = { ...sources }
    Object.keys(newSources).forEach(category => {
      newSources[category as keyof typeof newSources] = newSources[category as keyof typeof newSources].map(source =>
        source.id === sourceId ? { ...source, connected: false } : source
      )
    })
    setSources(newSources)
  }

  const filteredSources = getFilteredSources()
  const connectedCount = Object.values(sources).flat().filter((s: any) => s.connected).length
  const totalCount = Object.values(sources).flat().length

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="px-8 pt-8 pb-4">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            Sources
          </h1>
          <p className="text-gray-500 text-sm">
            Connect data sources for claim verification. {connectedCount} of {totalCount} sources active.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-gray-200">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`
                pb-3 text-sm font-medium border-b-2 -mb-px cursor-pointer transition-colors
                ${activeTab === cat.id 
                  ? 'border-gray-900 text-gray-900' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }
              `}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search bar */}
      <div className="px-8 py-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.5} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sources..."
            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
          />
        </div>
      </div>

      {/* Source grid */}
      <div className="px-8 pb-8">
        {filteredSources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSources.map((source: any) => (
              <SourceCard
                key={source.id}
                source={source}
                onConnect={setModalSource}
                onDisconnect={handleDisconnect}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Search className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            </div>
            <p className="text-gray-500 text-sm">No sources found matching "{searchQuery}"</p>
          </div>
        )}
      </div>

      {/* API Key Modal */}
      {modalSource && (
        <ApiKeyModal
          source={modalSource}
          onClose={() => setModalSource(null)}
          onConnect={handleConnect}
        />
      )}
    </div>
  )
}
