// Path: src/components/analytics/AnalyticsDashboard.tsx
'use client'

import { useState, useEffect } from 'react'
import { 
  Eye, Users, Clock, TrendingUp, ChevronDown, 
  BarChart3, MousePointer, RefreshCw, ExternalLink,
  Copy, Check, Mail, Globe
} from 'lucide-react'

interface AnalyticsDashboardProps {
  documentId: string
}

interface BlockMetric {
  block_id: string
  block_index: number
  block_preview: string
  avg_dwell_ms: number
  enter_count: number
  reread_count: number
  drop_off_count: number
  engagement_score: number
}

interface ViewerSession {
  id: string
  viewer_email: string | null
  device_type: string
  browser: string
  country: string | null
  started_at: string
  completion_rate: number
  total_dwell_ms: number
}

interface DashboardData {
  published: boolean
  url?: string
  slug?: string
  stats?: {
    total_views: number
    unique_viewers: number
    avg_completion: number
    avg_read_time_ms: number
  }
  block_metrics?: BlockMetric[]
  recent_sessions?: ViewerSession[]
  current_version?: {
    version_number: number
    published_at: string
  }
}

export default function AnalyticsDashboard({ documentId }: AnalyticsDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'blocks' | 'viewers'>('overview')

  useEffect(() => {
    fetchAnalytics()
  }, [documentId])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?document_id=${documentId}`)
      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  const copyLink = () => {
    if (data?.url) {
      navigator.clipboard.writeText(data.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return '<1s'
    if (ms < 60000) return `${Math.round(ms / 1000)}s`
    return `${Math.round(ms / 60000)}m`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!data?.published) {
    return (
      <div className="p-6 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Globe className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">Not Published</h3>
        <p className="text-xs text-gray-500 mb-4">
          Publish this document to start tracking views and engagement.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Analytics</h3>
          <span className="text-xs text-gray-500">
            v{data.current_version?.version_number || 1}
          </span>
        </div>
        
        {/* Link */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-xs">
            <span className="text-gray-400 truncate">{data.url}</span>
          </div>
          <button 
            onClick={copyLink}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400" />
            )}
          </button>
          <a 
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </a>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 p-4 border-b border-gray-200">
        <StatCard
          icon={Eye}
          label="Total Views"
          value={data.stats?.total_views || 0}
        />
        <StatCard
          icon={Users}
          label="Unique Viewers"
          value={data.stats?.unique_viewers || 0}
        />
        <StatCard
          icon={TrendingUp}
          label="Avg. Completion"
          value={`${Math.round((data.stats?.avg_completion || 0) * 100)}%`}
        />
        <StatCard
          icon={Clock}
          label="Avg. Read Time"
          value={formatDuration(data.stats?.avg_read_time_ms || 0)}
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {(['overview', 'blocks', 'viewers'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 text-xs font-medium capitalize transition-colors
              ${activeTab === tab 
                ? 'text-gray-900 border-b-2 border-gray-900' 
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'overview' && (
          <OverviewTab data={data} formatDuration={formatDuration} />
        )}
        
        {activeTab === 'blocks' && (
          <BlocksTab 
            blocks={data.block_metrics || []} 
            formatDuration={formatDuration}
          />
        )}
        
        {activeTab === 'viewers' && (
          <ViewersTab 
            sessions={data.recent_sessions || []}
            formatDate={formatDate}
            formatDuration={formatDuration}
          />
        )}
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ icon: Icon, label, value }: { 
  icon: typeof Eye
  label: string
  value: string | number 
}) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <div className="text-lg font-semibold text-gray-900">{value}</div>
    </div>
  )
}

// Overview Tab
function OverviewTab({ data, formatDuration }: { 
  data: DashboardData
  formatDuration: (ms: number) => string 
}) {
  // Find hotspots and drop-off points
  const hotspots = data.block_metrics
    ?.filter(b => b.engagement_score > 70)
    .slice(0, 3) || []
  
  const dropOffs = data.block_metrics
    ?.filter(b => b.drop_off_count > 0)
    .sort((a, b) => b.drop_off_count - a.drop_off_count)
    .slice(0, 3) || []

  return (
    <div className="space-y-6">
      {/* Engagement Heatmap Preview */}
      <div>
        <h4 className="text-xs font-medium text-gray-700 mb-3">Engagement Heatmap</h4>
        <div className="flex gap-1">
          {data.block_metrics?.slice(0, 20).map((block, i) => {
            const intensity = Math.min(block.engagement_score / 100, 1)
            return (
              <div
                key={i}
                className="flex-1 h-8 rounded"
                style={{
                  backgroundColor: `rgba(16, 185, 129, ${intensity})`,
                }}
                title={`Block ${block.block_index + 1}: ${block.engagement_score}% engagement`}
              />
            )
          })}
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-gray-400">
          <span>Start</span>
          <span>End</span>
        </div>
      </div>

      {/* Hotspots */}
      {hotspots.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-700 mb-2">🔥 Hotspots</h4>
          <div className="space-y-2">
            {hotspots.map((block, i) => (
              <div key={i} className="flex items-center gap-3 text-xs">
                <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded flex items-center justify-center font-medium">
                  {block.block_index + 1}
                </span>
                <span className="flex-1 truncate text-gray-600">
                  {block.block_preview}
                </span>
                <span className="text-emerald-600 font-medium">
                  {formatDuration(block.avg_dwell_ms)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drop-off Points */}
      {dropOffs.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-700 mb-2">📉 Drop-off Points</h4>
          <div className="space-y-2">
            {dropOffs.map((block, i) => (
              <div key={i} className="flex items-center gap-3 text-xs">
                <span className="w-6 h-6 bg-amber-100 text-amber-700 rounded flex items-center justify-center font-medium">
                  {block.block_index + 1}
                </span>
                <span className="flex-1 truncate text-gray-600">
                  {block.block_preview}
                </span>
                <span className="text-amber-600 font-medium">
                  {block.drop_off_count} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Blocks Tab
function BlocksTab({ blocks, formatDuration }: { 
  blocks: BlockMetric[]
  formatDuration: (ms: number) => string 
}) {
  return (
    <div className="space-y-2">
      {blocks.map((block, i) => {
        const intensity = Math.min(block.engagement_score / 100, 1)
        
        return (
          <div 
            key={i}
            className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
            style={{
              borderLeftWidth: 3,
              borderLeftColor: `rgba(16, 185, 129, ${intensity})`,
            }}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-xs text-gray-500">Block {block.block_index + 1}</span>
              <span className="text-xs font-medium text-emerald-600">
                {block.engagement_score}%
              </span>
            </div>
            <p className="text-xs text-gray-700 truncate mb-2">
              {block.block_preview}
            </p>
            <div className="flex items-center gap-4 text-[10px] text-gray-400">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {block.enter_count}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(block.avg_dwell_ms)}
              </span>
              {block.reread_count > 0 && (
                <span className="flex items-center gap-1 text-amber-500">
                  <RefreshCw className="w-3 h-3" />
                  {block.reread_count}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Viewers Tab  
function ViewersTab({ sessions, formatDate, formatDuration }: {
  sessions: ViewerSession[]
  formatDate: (date: string) => string
  formatDuration: (ms: number) => string
}) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-xs text-gray-500">No viewers yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {sessions.map((session, i) => (
        <div 
          key={i}
          className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {session.viewer_email ? (
                <>
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-900">
                    {session.viewer_email}
                  </span>
                </>
              ) : (
                <span className="text-xs text-gray-500">Anonymous</span>
              )}
            </div>
            <span className="text-[10px] text-gray-400">
              {formatDate(session.started_at)}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-[10px] text-gray-400">
            <span>{session.device_type}</span>
            <span>{session.browser}</span>
            {session.country && <span>{session.country}</span>}
            <span className="ml-auto text-emerald-600 font-medium">
              {Math.round(session.completion_rate * 100)}% read
            </span>
          </div>

          {/* Completion bar */}
          <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${session.completion_rate * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
