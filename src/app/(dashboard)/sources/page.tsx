// src/app/(dashboard)/sources/page.tsx

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Sidebar from '@/components/layout/Sidebar'
import { useSources } from '@/hooks/useSources'
import type { SourceType, ConnectedSource } from '@/lib/sources/types'
import {
  Check,
  Loader2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Lock,
  ChevronRight,
  Globe,
  FileText,
  HardDrive,
} from 'lucide-react'

/**
 * Source configuration with Brandfetch logos
 */
interface SourceConfig {
  id: SourceType | string
  name: string
  description: string
  brandDomain?: string  // For Brandfetch API
  fallbackIcon?: React.ComponentType<{ className?: string }>
  requiresAuth: boolean
  authType?: 'api-key' | 'oauth' | 'none'
  category: 'financial' | 'research' | 'internal'
  comingSoon?: boolean
}

const SOURCES: SourceConfig[] = [
  // Financial Data
  {
    id: 'sec-edgar',
    name: 'SEC EDGAR',
    description: 'Public company filings — 10-K, 10-Q, 8-K, proxies',
    brandDomain: 'sec.gov',
    requiresAuth: false,
    category: 'financial',
  },
  {
    id: 'pitchbook',
    name: 'PitchBook',
    description: 'Private market data, valuations, deal flow',
    brandDomain: 'pitchbook.com',
    requiresAuth: true,
    authType: 'api-key',
    category: 'financial',
    comingSoon: true,
  },
  {
    id: 'bloomberg',
    name: 'Bloomberg',
    description: 'Real-time market data and financial news',
    brandDomain: 'bloomberg.com',
    requiresAuth: true,
    authType: 'api-key',
    category: 'financial',
    comingSoon: true,
  },
  {
    id: 'factset',
    name: 'FactSet',
    description: 'Financial data and analytics platform',
    brandDomain: 'factset.com',
    requiresAuth: true,
    authType: 'api-key',
    category: 'financial',
    comingSoon: true,
  },
  // Research
  {
    id: 'reuters',
    name: 'Reuters',
    description: 'Global news and market intelligence',
    brandDomain: 'reuters.com',
    requiresAuth: true,
    authType: 'api-key',
    category: 'research',
    comingSoon: true,
  },
  {
    id: 'lexisnexis',
    name: 'LexisNexis',
    description: 'Legal research and public records',
    brandDomain: 'lexisnexis.com',
    requiresAuth: true,
    authType: 'api-key',
    category: 'research',
    comingSoon: true,
  },
  {
    id: 'web',
    name: 'Web Search',
    description: 'Search the public web',
    fallbackIcon: Globe,
    requiresAuth: false,
    category: 'research',
    comingSoon: true,
  },
  // Internal
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Connect folders from your Drive',
    brandDomain: 'drive.google.com',
    requiresAuth: true,
    authType: 'oauth',
    category: 'internal',
    comingSoon: true,
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Import from your Notion workspace',
    brandDomain: 'notion.so',
    requiresAuth: true,
    authType: 'oauth',
    category: 'internal',
    comingSoon: true,
  },
  {
    id: 'uploads',
    name: 'Uploaded Documents',
    description: 'PDFs, Word docs, and other files you upload',
    fallbackIcon: FileText,
    requiresAuth: false,
    category: 'internal',
    comingSoon: true,
  },
]

/**
 * Brandfetch logo component
 */
function BrandLogo({ 
  domain, 
  fallbackIcon: FallbackIcon, 
  name,
  size = 40,
}: { 
  domain?: string
  fallbackIcon?: React.ComponentType<{ className?: string }>
  name: string
  size?: number
}) {
  const [error, setError] = useState(false)

  // Brandfetch CDN format that works: https://cdn.brandfetch.io/domain.com?c=1id1Fyz-h7an5-5KR_y
  const logoUrl = domain ? `https://cdn.brandfetch.io/${domain}?c=1id1Fyz-h7an5-5KR_y` : null

  if (error || !logoUrl) {
    if (FallbackIcon) {
      return (
        <div 
          className="flex items-center justify-center bg-gray-100 rounded-lg"
          style={{ width: size, height: size }}
        >
          <FallbackIcon className="w-5 h-5 text-gray-400" />
        </div>
      )
    }
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-lg text-gray-400 font-semibold text-sm"
        style={{ width: size, height: size }}
      >
        {name.charAt(0)}
      </div>
    )
  }

  return (
    <div 
      className="flex items-center justify-center bg-white rounded-lg border border-gray-100 overflow-hidden"
      style={{ width: size, height: size }}
    >
      <img
        src={logoUrl}
        alt={`${name} logo`}
        className="w-full h-full object-contain p-1.5"
        onError={() => setError(true)}
      />
    </div>
  )
}

/**
 * Source card component
 */
function SourceCard({ 
  source, 
  connection, 
  onConnect, 
  onDisconnect,
}: { 
  source: SourceConfig
  connection?: ConnectedSource
  onConnect: () => void
  onDisconnect: () => void
}) {
  const isConnected = connection?.status === 'connected'
  const isConnecting = connection?.status === 'connecting'
  const hasError = connection?.status === 'error'

  return (
    <div 
      className={`
        group relative bg-white rounded-lg border transition-all duration-150
        ${isConnected 
          ? 'border-gray-200 ring-1 ring-green-500/20' 
          : source.comingSoon 
            ? 'border-gray-100 opacity-50' 
            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }
      `}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Logo */}
          <BrandLogo 
            domain={source.brandDomain} 
            fallbackIcon={source.fallbackIcon}
            name={source.name}
            size={40}
          />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900 text-sm">{source.name}</h3>
              {isConnected && (
                <Check className="w-4 h-4 text-green-600" />
              )}
              {isConnecting && (
                <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
              )}
              {hasError && (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              {source.comingSoon && (
                <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  Soon
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
              {source.description}
            </p>

            {/* Error message */}
            {hasError && connection?.error && (
              <p className="text-xs text-red-500 mt-1">{connection.error}</p>
            )}
          </div>

          {/* Action */}
          {!source.comingSoon && (
            <div className="flex-shrink-0">
              {isConnected ? (
                <button
                  onClick={onDisconnect}
                  className="text-xs text-gray-400 hover:text-red-600 transition-colors"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={onConnect}
                  disabled={isConnecting}
                  className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                >
                  {source.requiresAuth && <Lock className="w-3 h-3" />}
                  Connect
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Sources Page
 */
export default function SourcesPage() {
  const { connectedSources, connect, disconnect } = useSources()
  const [configuring, setConfiguring] = useState<SourceConfig | null>(null)

  const getConnection = (id: string): ConnectedSource | undefined => {
    return connectedSources.find(s => s.type === id)
  }

  const handleConnect = async (source: SourceConfig) => {
    if (!source.requiresAuth) {
      await connect({ type: source.id as SourceType, config: {} } as any)
    } else {
      setConfiguring(source)
    }
  }

  const financialSources = SOURCES.filter(s => s.category === 'financial')
  const researchSources = SOURCES.filter(s => s.category === 'research')
  const internalSources = SOURCES.filter(s => s.category === 'internal')

  const connectedCount = connectedSources.filter(s => s.status === 'connected').length

  return (
    <div className="h-screen flex bg-[#FAFAF9]">
      {/* Persistent Sidebar */}
      <Sidebar connectedSourceCount={connectedCount} />

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-8 py-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-xl font-semibold text-gray-900">Data Sources</h1>
            <p className="text-sm text-gray-500 mt-1">
              Connect once, reference everywhere with <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">@mentions</code>
            </p>
          </div>

          {/* How it works - minimal */}
          <div className="flex items-center gap-6 mb-8 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px] font-medium">1</span>
              <span>Connect your sources</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px] font-medium">2</span>
              <span>Type @ in any document</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px] font-medium">3</span>
              <span>Pull data inline</span>
            </div>
          </div>

          {/* Financial Data */}
          <section className="mb-8">
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
              Financial Data
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {financialSources.map(source => (
                <SourceCard
                  key={source.id}
                  source={source}
                  connection={getConnection(source.id)}
                  onConnect={() => handleConnect(source)}
                  onDisconnect={() => disconnect(source.id as SourceType)}
                />
              ))}
            </div>
          </section>

          {/* Research & News */}
          <section className="mb-8">
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
              Research & News
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {researchSources.map(source => (
                <SourceCard
                  key={source.id}
                  source={source}
                  connection={getConnection(source.id)}
                  onConnect={() => handleConnect(source)}
                  onDisconnect={() => disconnect(source.id as SourceType)}
                />
              ))}
            </div>
          </section>

          {/* Internal Sources */}
          <section className="mb-8">
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
              Internal Sources
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {internalSources.map(source => (
                <SourceCard
                  key={source.id}
                  source={source}
                  connection={getConnection(source.id)}
                  onConnect={() => handleConnect(source)}
                  onDisconnect={() => disconnect(source.id as SourceType)}
                />
              ))}
            </div>
          </section>

          {/* Request source */}
          <div className="text-center py-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need a source we don't support?{' '}
              <a 
                href="mailto:sources@tryraven.io" 
                className="text-gray-900 hover:underline"
              >
                Let us know
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* API Key Modal */}
      {configuring && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <BrandLogo 
                  domain={configuring.brandDomain}
                  fallbackIcon={configuring.fallbackIcon}
                  name={configuring.name}
                  size={32}
                />
                <div>
                  <h3 className="font-medium text-gray-900">Connect {configuring.name}</h3>
                  <p className="text-xs text-gray-500">
                    {configuring.authType === 'oauth' ? 'Sign in to connect' : 'Enter your API key'}
                  </p>
                </div>
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
              className="p-5 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
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

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfiguring(null)}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800"
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