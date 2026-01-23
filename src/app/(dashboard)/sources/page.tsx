// src/app/(dashboard)/sources/page.tsx

'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import { useSources } from '@/hooks/useSources'
import type { SourceType, ConnectedSource } from '@/lib/sources/types'
import {
  Check,
  Loader2,
  AlertCircle,
  Plus,
  ChevronDown,
  Lock,
  ExternalLink,
  Globe,
  FileText,
  Building2,
  Search,
  Filter,
  MoreHorizontal,
} from 'lucide-react'

// Brandfetch logo URL helper (consistent with rest of app)
const getBrandfetchLogo = (domain: string) =>
  `https://cdn.brandfetch.io/${domain}?c=1id1Fyz-h7an5-5KR_y`

/**
 * Source configuration
 */
interface SourceConfig {
  id: string
  name: string
  description: string
  domain?: string
  fallbackIcon?: React.ComponentType<{ className?: string }>
  requiresAuth: boolean
  authType?: 'api-key' | 'oauth' | 'none'
  category: 'cloud' | 'financial' | 'research' | 'collaboration'
  status: 'available' | 'coming-soon' | 'enterprise'
}

const SOURCES: SourceConfig[] = [
  // Cloud Storage
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Import documents from your Google Drive',
    domain: 'google.com',
    requiresAuth: true,
    authType: 'oauth',
    category: 'cloud',
    status: 'available',
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    description: 'Connect to Microsoft OneDrive and SharePoint',
    domain: 'microsoft.com',
    requiresAuth: true,
    authType: 'oauth',
    category: 'cloud',
    status: 'coming-soon',
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Import files from Dropbox',
    domain: 'dropbox.com',
    requiresAuth: true,
    authType: 'oauth',
    category: 'cloud',
    status: 'coming-soon',
  },
  {
    id: 'box',
    name: 'Box',
    description: 'Enterprise content from Box',
    domain: 'box.com',
    requiresAuth: true,
    authType: 'oauth',
    category: 'cloud',
    status: 'coming-soon',
  },

  // Financial Data
  {
    id: 'sec-edgar',
    name: 'SEC EDGAR',
    description: '10-K, 10-Q, 8-K, proxy statements',
    domain: 'sec.gov',
    requiresAuth: false,
    authType: 'none',
    category: 'financial',
    status: 'available',
  },
  {
    id: 'pitchbook',
    name: 'PitchBook',
    description: 'Private market data and deal flow',
    domain: 'pitchbook.com',
    requiresAuth: true,
    authType: 'api-key',
    category: 'financial',
    status: 'enterprise',
  },
  {
    id: 'bloomberg',
    name: 'Bloomberg',
    description: 'Market data and financial news',
    domain: 'bloomberg.com',
    requiresAuth: true,
    authType: 'api-key',
    category: 'financial',
    status: 'enterprise',
  },
  {
    id: 'capitaliq',
    name: 'Capital IQ',
    description: 'S&P Global financial intelligence',
    domain: 'spglobal.com',
    requiresAuth: true,
    authType: 'api-key',
    category: 'financial',
    status: 'enterprise',
  },
  {
    id: 'refinitiv',
    name: 'Refinitiv',
    description: 'LSEG market data platform',
    domain: 'refinitiv.com',
    requiresAuth: true,
    authType: 'api-key',
    category: 'financial',
    status: 'enterprise',
  },
  {
    id: 'factset',
    name: 'FactSet',
    description: 'Financial data and analytics',
    domain: 'factset.com',
    requiresAuth: true,
    authType: 'api-key',
    category: 'financial',
    status: 'enterprise',
  },

  // Research
  {
    id: 'arxiv',
    name: 'arXiv',
    description: 'Academic papers and preprints',
    domain: 'arxiv.org',
    requiresAuth: false,
    authType: 'none',
    category: 'research',
    status: 'coming-soon',
  },
  {
    id: 'pubmed',
    name: 'PubMed',
    description: 'Biomedical and life sciences',
    domain: 'nih.gov',
    requiresAuth: false,
    authType: 'none',
    category: 'research',
    status: 'coming-soon',
  },
  {
    id: 'patents',
    name: 'USPTO Patents',
    description: 'US patent database',
    domain: 'uspto.gov',
    requiresAuth: false,
    authType: 'none',
    category: 'research',
    status: 'coming-soon',
  },

  // Collaboration
  {
    id: 'notion',
    name: 'Notion',
    description: 'Import from Notion workspace',
    domain: 'notion.so',
    requiresAuth: true,
    authType: 'oauth',
    category: 'collaboration',
    status: 'coming-soon',
  },
  {
    id: 'confluence',
    name: 'Confluence',
    description: 'Atlassian wiki and docs',
    domain: 'atlassian.com',
    requiresAuth: true,
    authType: 'oauth',
    category: 'collaboration',
    status: 'coming-soon',
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Search messages and files',
    domain: 'slack.com',
    requiresAuth: true,
    authType: 'oauth',
    category: 'collaboration',
    status: 'coming-soon',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Search email threads',
    domain: 'gmail.com',
    requiresAuth: true,
    authType: 'oauth',
    category: 'collaboration',
    status: 'coming-soon',
  },
]

const CATEGORIES = [
  { id: 'all', label: 'All Sources', icon: Filter },
  { id: 'cloud', label: 'Cloud Storage', icon: FileText },
  { id: 'financial', label: 'Financial Data', icon: Building2 },
  { id: 'research', label: 'Research', icon: Search },
  { id: 'collaboration', label: 'Collaboration', icon: Globe },
]

/**
 * Status badge colors matching Search page style
 */
function StatusBadge({ status }: { status: SourceConfig['status'] }) {
  if (status === 'available') return null
  
  const styles = {
    'coming-soon': 'bg-amber-50 text-amber-600 border-amber-200',
    'enterprise': 'bg-purple-50 text-purple-600 border-purple-200',
  }
  
  const labels = {
    'coming-soon': 'Soon',
    'enterprise': 'Enterprise',
  }

  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

/**
 * Sources Page - matches Search page styling
 */
export default function SourcesPage() {
  const { connectedSources, connect, disconnect } = useSources()
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [configuring, setConfiguring] = useState<SourceConfig | null>(null)

  const getConnection = (id: string): ConnectedSource | undefined => {
    return connectedSources.find(s => s.type === id)
  }

  const handleConnect = async (source: SourceConfig) => {
    if (source.status !== 'available') return
    
    if (source.authType === 'oauth') {
      // Redirect to OAuth flow
      window.location.href = `/api/sources/${source.id}/connect`
    } else if (source.authType === 'api-key') {
      setConfiguring(source)
    } else {
      // No auth required
      await connect({ type: source.id as SourceType, config: {} } as any)
    }
  }

  const filteredSources = SOURCES.filter(s => {
    const matchesCategory = activeCategory === 'all' || s.category === activeCategory
    const matchesSearch = !searchQuery || 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const connectedCount = connectedSources.filter(s => s.status === 'connected').length

  return (
    <div className="h-screen flex bg-white">
      <Sidebar connectedSourceCount={connectedCount} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - matches Search page */}
        <div className="flex items-center justify-between px-4 h-12 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-900">Data Sources</span>
            <span className="text-xs text-gray-400">{connectedCount} connected</span>
          </div>
          <div className="flex items-center gap-2">
            <a 
              href="https://docs.tryraven.io/sources" 
              target="_blank"
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Docs
            </a>
          </div>
        </div>

        {/* Toolbar - matches Search page */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-white border border-gray-300 text-gray-900 font-medium shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <cat.icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent w-48"
            />
          </div>
        </div>

        {/* Table - matches Search page matrix style */}
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white sticky top-0 z-10">
                <th className="w-12 px-3 py-3 text-left border-b border-r border-gray-200 bg-white">
                  <input type="checkbox" className="rounded border-gray-300 cursor-pointer" disabled />
                </th>
                <th className="min-w-[280px] px-3 py-3 text-left border-b border-r border-gray-200 bg-white">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                    <Building2 className="w-3.5 h-3.5" />
                    Source
                  </div>
                </th>
                <th className="w-32 px-3 py-3 text-left border-b border-r border-gray-200 bg-white">
                  <div className="text-xs font-medium text-gray-500">Category</div>
                </th>
                <th className="w-28 px-3 py-3 text-left border-b border-r border-gray-200 bg-white">
                  <div className="text-xs font-medium text-gray-500">Auth</div>
                </th>
                <th className="w-32 px-3 py-3 text-left border-b border-r border-gray-200 bg-white">
                  <div className="text-xs font-medium text-gray-500">Status</div>
                </th>
                <th className="w-32 px-3 py-3 text-left border-b border-gray-200 bg-white">
                  <div className="text-xs font-medium text-gray-500">Action</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSources.map((source) => {
                const connection = getConnection(source.id)
                const isConnected = connection?.status === 'connected'
                const isConnecting = connection?.status === 'connecting'
                const isDisabled = source.status !== 'available'

                return (
                  <tr 
                    key={source.id} 
                    className={`group ${isDisabled ? 'opacity-50' : 'hover:bg-gray-50'}`}
                  >
                    {/* Checkbox */}
                    <td className="px-3 py-3 border-b border-r border-gray-200">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 cursor-pointer" 
                        disabled={isDisabled}
                        checked={isConnected}
                        readOnly
                      />
                    </td>

                    {/* Source with logo */}
                    <td className="px-3 py-3 border-b border-r border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {source.domain ? (
                            <img
                              src={getBrandfetchLogo(source.domain)}
                              alt=""
                              className="w-6 h-6 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                target.parentElement!.innerHTML = `<span class="text-xs font-medium text-gray-400">${source.name[0]}</span>`
                              }}
                            />
                          ) : source.fallbackIcon ? (
                            <source.fallbackIcon className="w-4 h-4 text-gray-400" />
                          ) : (
                            <span className="text-xs font-medium text-gray-400">{source.name[0]}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">{source.name}</span>
                            <StatusBadge status={source.status} />
                          </div>
                          <p className="text-xs text-gray-500 truncate">{source.description}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-3 py-3 border-b border-r border-gray-200">
                      <span className="text-xs text-gray-600 capitalize">{source.category}</span>
                    </td>

                    {/* Auth type */}
                    <td className="px-3 py-3 border-b border-r border-gray-200">
                      <span className={`inline-flex items-center gap-1 text-xs ${
                        source.authType === 'none' ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {source.authType === 'oauth' && <Lock className="w-3 h-3" />}
                        {source.authType === 'api-key' && <Lock className="w-3 h-3" />}
                        {source.authType === 'none' ? 'Public' : source.authType === 'oauth' ? 'OAuth' : 'API Key'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3 border-b border-r border-gray-200">
                      {isConnected ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <Check className="w-3.5 h-3.5" />
                          Connected
                        </span>
                      ) : isConnecting ? (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Connecting
                        </span>
                      ) : connection?.status === 'error' ? (
                        <span className="inline-flex items-center gap-1 text-xs text-red-500">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Error
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Not connected</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-3 py-3 border-b border-gray-200">
                      {isConnected ? (
                        <button
                          onClick={() => disconnect(source.id as SourceType)}
                          className="text-xs text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          Disconnect
                        </button>
                      ) : (
                        <button
                          onClick={() => handleConnect(source)}
                          disabled={isDisabled || isConnecting}
                          className={`flex items-center gap-1 text-xs font-medium transition-colors cursor-pointer ${
                            isDisabled 
                              ? 'text-gray-300 cursor-not-allowed' 
                              : 'text-gray-700 hover:text-gray-900'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Connect
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filteredSources.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No sources found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
          <span className="text-xs text-gray-500">
            {filteredSources.length} sources • {filteredSources.filter(s => s.status === 'available').length} available
          </span>
          <a 
            href="mailto:sources@tryraven.io"
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Request a source →
          </a>
        </div>
      </div>

      {/* API Key Modal */}
      {configuring && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm">
            <div className="flex items-center gap-3 p-4 border-b border-gray-200">
              <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                {configuring.domain && (
                  <img
                    src={getBrandfetchLogo(configuring.domain)}
                    alt=""
                    className="w-5 h-5 object-contain"
                  />
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Connect {configuring.name}</h3>
                <p className="text-xs text-gray-500">Enter your API key to connect</p>
              </div>
            </div>

            <form 
              onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const apiKey = formData.get('apiKey') as string
                await connect({ 
                  type: configuring.id as SourceType, 
                  config: { apiKey } 
                } as any)
                setConfiguring(null)
              }} 
              className="p-4 space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  API Key
                </label>
                <input
                  type="password"
                  name="apiKey"
                  placeholder="Enter your API key"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  autoFocus
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfiguring(null)}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 cursor-pointer"
                >
                  Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}