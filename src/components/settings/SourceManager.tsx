// src/components/settings/SourceManager.tsx

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
  X,
  Loader2,
  AlertCircle,
  Plus,
  Settings,
  ExternalLink,
  RefreshCw,
} from 'lucide-react'

/**
 * Source Manager
 * 
 * Settings panel for managing connected data sources.
 * Users can connect/disconnect sources like SEC EDGAR, PitchBook, etc.
 */

// Icon mapping
const SOURCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  Database,
  Globe,
  HardDrive,
  FileText,
}

interface SourceCardProps {
  meta: SourceMeta
  connection?: ConnectedSource
  onConnect: () => void
  onDisconnect: () => void
  onConfigure?: () => void
}

function SourceCard({ meta, connection, onConnect, onDisconnect, onConfigure }: SourceCardProps) {
  const Icon = SOURCE_ICONS[meta.icon] || Database
  const isConnected = connection?.status === 'connected'
  const isConnecting = connection?.status === 'connecting'
  const hasError = connection?.status === 'error'

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${meta.color}15`, color: meta.color }}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{meta.name}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{meta.description}</p>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          {isConnected && (
            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <Check className="w-3 h-3" />
              Connected
            </span>
          )}
          {isConnecting && (
            <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              <Loader2 className="w-3 h-3 animate-spin" />
              Connecting
            </span>
          )}
          {hasError && (
            <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
              <AlertCircle className="w-3 h-3" />
              Error
            </span>
          )}
        </div>
      </div>

      {/* Error message */}
      {hasError && connection?.error && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
          {connection.error}
        </div>
      )}

      {/* Connection info */}
      {isConnected && connection?.connectedAt && (
        <div className="mt-3 text-xs text-gray-400">
          Connected {new Date(connection.connectedAt).toLocaleDateString()}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2">
        {isConnected ? (
          <>
            {onConfigure && (
              <button
                onClick={onConfigure}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              >
                <Settings className="w-4 h-4" />
                Configure
              </button>
            )}
            <button
              onClick={onDisconnect}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
            >
              <X className="w-4 h-4" />
              Disconnect
            </button>
          </>
        ) : (
          <button
            onClick={onConnect}
            disabled={isConnecting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white rounded transition-colors disabled:opacity-50"
            style={{ backgroundColor: meta.color }}
          >
            {isConnecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Connect
          </button>
        )}
      </div>
    </div>
  )
}

interface SourceManagerProps {
  onClose?: () => void
}

export default function SourceManager({ onClose }: SourceManagerProps) {
  const { availableSources, connectedSources, connect, disconnect } = useSources()
  const [configuring, setConfiguring] = useState<SourceType | null>(null)

  const getConnection = (type: SourceType): ConnectedSource | undefined => {
    return connectedSources.find(s => s.type === type)
  }

  const handleConnect = async (type: SourceType) => {
    // For sources that don't require auth, connect immediately
    const meta = availableSources.find(s => s.id === type)
    if (!meta?.requiresAuth) {
      await connect({ type, config: {} } as any)
    } else {
      // Open configuration modal
      setConfiguring(type)
    }
  }

  const handleDisconnect = (type: SourceType) => {
    disconnect(type)
  }

  const connectedCount = connectedSources.filter(s => s.status === 'connected').length

  return (
    <div className="bg-[#FBF9F7] h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">Data Sources</h2>
          <p className="text-sm text-gray-500">
            {connectedCount} of {availableSources.length} connected
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-black/5 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Source list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {availableSources.map(meta => (
          <SourceCard
            key={meta.id}
            meta={meta}
            connection={getConnection(meta.id)}
            onConnect={() => handleConnect(meta.id)}
            onDisconnect={() => handleDisconnect(meta.id)}
          />
        ))}

        {/* Coming soon placeholder */}
        <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Plus className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-500">More sources coming soon</h3>
              <p className="text-sm text-gray-400">
                PitchBook, Bloomberg, Google Drive, and more
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 bg-white">
        <a
          href="https://docs.tryraven.io/sources"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ExternalLink className="w-4 h-4" />
          View documentation
        </a>
      </div>

      {/* Configuration modal (for sources requiring auth) */}
      {configuring && (
        <ConfigureSourceModal
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

interface ConfigureSourceModalProps {
  sourceType: SourceType
  onClose: () => void
  onConnect: (config: any) => Promise<void>
}

function ConfigureSourceModal({ sourceType, onClose, onConnect }: ConfigureSourceModalProps) {
  const [apiKey, setApiKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onConnect({
        type: sourceType,
        config: { apiKey },
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Configure {sourceType}</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!apiKey || isLoading}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
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