// src/app/(dashboard)/sources/page.tsx

'use client'

import { useState } from 'react'
import { useSources } from '@/hooks/useSources'
import type { SourceType, SourceMeta, ConnectedSource } from '@/lib/sources/types'
import {
  Building2,
  Database,
  Globe,
  HardDrive,
  FileText,
  Check,
  Loader2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Lock,
  Zap,
  RefreshCw,
  Settings,
  ChevronRight,
} from 'lucide-react'

// Icon mapping
const SOURCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  Database,
  Globe,
  HardDrive,
  FileText,
}

// Source categories
const EXTERNAL_SOURCES: SourceMeta[] = [
  {
    id: 'sec-edgar',
    name: 'SEC EDGAR',
    description: 'Public company filings, 10-K, 10-Q, 8-K, and more',
    icon: 'Building2',
    color: '#0A3161',
    requiresAuth: false,
  },
  {
    id: 'pitchbook' as SourceType,
    name: 'PitchBook',
    description: 'Private market data, valuations, and deal flow',
    icon: 'Database',
    color: '#1E3A5F',
    requiresAuth: true,
    authType: 'api-key',
  },
  {
    id: 'bloomberg' as SourceType,
    name: 'Bloomberg',
    description: 'Real-time market data and news',
    icon: 'Zap',
    color: '#FF6600',
    requiresAuth: true,
    authType: 'api-key',
  },
  {
    id: 'web' as SourceType,
    name: 'Web Search',
    description: 'Search the public web for current information',
    icon: 'Globe',
    color: '#4285F4',
    requiresAuth: false,
  },
]

const INTERNAL_SOURCES: SourceMeta[] = [
  {
    id: 'google-drive' as SourceType,
    name: 'Google Drive',
    description: 'Connect your Google Drive folders',
    icon: 'HardDrive',
    color: '#34A853',
    requiresAuth: true,
    authType: 'oauth',
  },
  {
    id: 'internal' as SourceType,
    name: 'Internal Documents',
    description: 'Upload and index your own documents',
    icon: 'FileText',
    color: '#6366F1',
    requiresAuth: false,
  },
]

interface SourceCardProps {
  meta: SourceMeta
  connection?: ConnectedSource
  onConnect: () => void
  onDisconnect: () => void
  onSettings?: () => void
  comingSoon?: boolean
}

function SourceCard({ meta, connection, onConnect, onDisconnect, onSettings, comingSoon }: SourceCardProps) {
  const Icon = SOURCE_ICONS[meta.icon] || Database
  const isConnected = connection?.status === 'connected'
  const isConnecting = connection?.status === 'connecting'
  const hasError = connection?.status === 'error'

  return (
    <div 
      className={`
        relative bg-white rounded-xl border transition-all duration-200
        ${isConnected 
          ? 'border-green-200 shadow-sm' 
          : comingSoon 
            ? 'border-gray-100 opacity-60' 
            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }
      `}
    >
      {/* Coming soon badge */}
      {comingSoon && (
        <div className="absolute -top-2 -right-2 bg-gray-100 text-gray-500 text-[10px] font-medium px-2 py-0.5 rounded-full">
          Coming Soon
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${meta.color}10`, color: meta.color }}
          >
            <Icon className="w-6 h-6" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{meta.name}</h3>
              {isConnected && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  <Check className="w-3 h-3" />
                  Connected
                </span>
              )}
              {isConnecting && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Connecting
                </span>
              )}
              {hasError && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                  <AlertCircle className="w-3 h-3" />
                  Error
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">{meta.description}</p>

            {/* Auth type indicator */}
            {meta.requiresAuth && !isConnected && (
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                <Lock className="w-3 h-3" />
                <span>Requires {meta.authType === 'oauth' ? 'sign-in' : 'API key'}</span>
              </div>
            )}

            {/* Connection info */}
            {isConnected && connection?.connectedAt && (
              <p className="text-xs text-gray-400 mt-2">
                Connected {new Date(connection.connectedAt).toLocaleDateString()}
              </p>
            )}

            {/* Error message */}
            {hasError && connection?.error && (
              <p className="text-xs text-red-500 mt-2">{connection.error}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        {!comingSoon && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            {isConnected ? (
              <>
                {onSettings && (
                  <button
                    onClick={onSettings}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                )}
                <button
                  onClick={onDisconnect}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors ml-auto"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={onConnect}
                disabled={isConnecting}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ml-auto"
                style={{ backgroundColor: meta.color }}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Connect
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SourcesPage() {
  const { connectedSources, connect, disconnect } = useSources()
  const [configuring, setConfiguring] = useState<SourceType | null>(null)

  const getConnection = (type: SourceType): ConnectedSource | undefined => {
    return connectedSources.find(s => s.type === type)
  }

  const handleConnect = async (meta: SourceMeta) => {
    if (!meta.requiresAuth) {
      await connect({ type: meta.id, config: {} } as any)
    } else {
      setConfiguring(meta.id)
    }
  }

  const externalConnected = EXTERNAL_SOURCES.filter(s => 
    connectedSources.some(c => c.type === s.id && c.status === 'connected')
  ).length

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Data Sources</h1>
              <p className="text-gray-500 mt-1">
                Connect your data sources to enable @mentions and verification across all documents.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-gray-600">
                <strong>{externalConnected}</strong> sources active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-10">
        {/* How it works */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            How Sources Work
          </h2>
          <div className="mt-3 grid grid-cols-3 gap-4">
            <div className="text-sm">
              <div className="font-medium text-gray-900">1. Connect once</div>
              <p className="text-gray-600 mt-0.5">Link your subscriptions and data sources here.</p>
            </div>
            <div className="text-sm">
              <div className="font-medium text-gray-900">2. Available everywhere</div>
              <p className="text-gray-600 mt-0.5">Sources are accessible in all your documents.</p>
            </div>
            <div className="text-sm">
              <div className="font-medium text-gray-900">3. Use with @</div>
              <p className="text-gray-600 mt-0.5">Type @SEC or @PitchBook to pull data inline.</p>
            </div>
          </div>
        </div>

        {/* External Sources */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">External Sources</h2>
              <p className="text-sm text-gray-500">Financial data, filings, and market intelligence</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {EXTERNAL_SOURCES.map(source => (
              <SourceCard
                key={source.id}
                meta={source}
                connection={getConnection(source.id)}
                onConnect={() => handleConnect(source)}
                onDisconnect={() => disconnect(source.id)}
                comingSoon={source.id !== 'sec-edgar' && source.id !== 'web'}
              />
            ))}
          </div>
        </section>

        {/* Internal Sources */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Internal Sources</h2>
              <p className="text-sm text-gray-500">Your documents, drives, and databases</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {INTERNAL_SOURCES.map(source => (
              <SourceCard
                key={source.id}
                meta={source}
                connection={getConnection(source.id)}
                onConnect={() => handleConnect(source)}
                onDisconnect={() => disconnect(source.id)}
                comingSoon
              />
            ))}
          </div>
        </section>

        {/* Need more? */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-gray-600">
            Need a source we don't support yet?{' '}
            <a href="mailto:sources@tryraven.io" className="text-blue-600 hover:underline">
              Let us know →
            </a>
          </p>
        </div>
      </div>

      {/* Configuration Modal */}
      {configuring && (
        <ConfigModal
          sourceType={configuring}
          onClose={() => setConfiguring(null)}
          onConnect={async (config) => {
            await connect(config)
            setConfiguring(null)
          }}
        />
      )}
    </div>
  )
}

interface ConfigModalProps {
  sourceType: SourceType
  onClose: () => void
  onConnect: (config: any) => Promise<void>
}

function ConfigModal({ sourceType, onClose, onConnect }: ConfigModalProps) {
  const [apiKey, setApiKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onConnect({ type: sourceType, config: { apiKey } })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Connect {sourceType}</h3>
          <p className="text-sm text-gray-500 mt-0.5">Enter your API key to connect</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              autoFocus
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Your API key is encrypted and stored securely.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!apiKey || isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Connect'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}