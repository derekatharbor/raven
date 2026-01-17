'use client'

import { useState } from 'react'
import { 
  Eye, Users, Clock, TrendingUp, 
  BarChart3, RefreshCw, ExternalLink,
  Copy, Check, Mail, ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

// Mock data for demo
const mockData = {
  published: true,
  url: 'https://raven.app/d/abc123xy',
  slug: 'abc123xy',
  current_version: {
    version_number: 3,
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  stats: {
    total_views: 47,
    unique_viewers: 23,
    avg_completion: 0.72,
    avg_read_time_ms: 245000,
  },
  block_metrics: [
    { block_id: 'b1', block_index: 0, block_preview: 'Q3 2024 Investment Analysis', avg_dwell_ms: 3200, enter_count: 47, reread_count: 2, drop_off_count: 0, engagement_score: 65 },
    { block_id: 'b2', block_index: 1, block_preview: 'Executive Summary: This quarter showed exceptional growth...', avg_dwell_ms: 8500, enter_count: 47, reread_count: 8, drop_off_count: 2, engagement_score: 89 },
    { block_id: 'b3', block_index: 2, block_preview: 'Market conditions remained favorable despite headwinds...', avg_dwell_ms: 12400, enter_count: 45, reread_count: 15, drop_off_count: 1, engagement_score: 95 },
    { block_id: 'b4', block_index: 3, block_preview: 'Revenue breakdown by segment shows data center leading...', avg_dwell_ms: 18200, enter_count: 44, reread_count: 22, drop_off_count: 0, engagement_score: 98 },
    { block_id: 'b5', block_index: 4, block_preview: 'Key risks include supply chain constraints and...', avg_dwell_ms: 6100, enter_count: 44, reread_count: 5, drop_off_count: 3, engagement_score: 72 },
    { block_id: 'b6', block_index: 5, block_preview: 'Competitive landscape analysis indicates strong moat...', avg_dwell_ms: 9800, enter_count: 41, reread_count: 11, drop_off_count: 2, engagement_score: 85 },
    { block_id: 'b7', block_index: 6, block_preview: 'Financial projections for Q4 and FY2025...', avg_dwell_ms: 14500, enter_count: 39, reread_count: 18, drop_off_count: 1, engagement_score: 92 },
    { block_id: 'b8', block_index: 7, block_preview: 'Recommendation: Strong Buy with price target of...', avg_dwell_ms: 11200, enter_count: 38, reread_count: 24, drop_off_count: 4, engagement_score: 88 },
    { block_id: 'b9', block_index: 8, block_preview: 'Appendix A: Detailed financial statements...', avg_dwell_ms: 2100, enter_count: 34, reread_count: 1, drop_off_count: 8, engagement_score: 35 },
    { block_id: 'b10', block_index: 9, block_preview: 'Appendix B: Methodology and data sources...', avg_dwell_ms: 1400, enter_count: 26, reread_count: 0, drop_off_count: 12, engagement_score: 22 },
  ],
  recent_sessions: [
    { id: 's1', viewer_email: 'sarah.chen@sequoia.com', device_type: 'desktop', browser: 'Chrome', country: 'US', started_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(), completion_rate: 1.0, total_dwell_ms: 384000 },
    { id: 's2', viewer_email: 'mike.ross@goldmansachs.com', device_type: 'desktop', browser: 'Safari', country: 'US', started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), completion_rate: 0.9, total_dwell_ms: 312000 },
    { id: 's3', viewer_email: null, device_type: 'mobile', browser: 'Safari', country: 'UK', started_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), completion_rate: 0.4, total_dwell_ms: 95000 },
    { id: 's4', viewer_email: 'jennifer.liu@a]6z.com', device_type: 'desktop', browser: 'Chrome', country: 'US', started_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), completion_rate: 1.0, total_dwell_ms: 425000 },
    { id: 's5', viewer_email: 'david.park@bridgewater.com', device_type: 'tablet', browser: 'Safari', country: 'US', started_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), completion_rate: 0.8, total_dwell_ms: 278000 },
    { id: 's6', viewer_email: null, device_type: 'desktop', browser: 'Firefox', country: 'DE', started_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), completion_rate: 0.3, total_dwell_ms: 67000 },
    { id: 's7', viewer_email: 'amanda.wright@tiger.com', device_type: 'desktop', browser: 'Chrome', country: 'US', started_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), completion_rate: 1.0, total_dwell_ms: 398000 },
  ],
}

export default function AnalyticsDemoPage() {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'blocks' | 'viewers'>('overview')

  const copyLink = () => {
    navigator.clipboard.writeText(mockData.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return '<1s'
    if (ms < 60000) return `${Math.round(ms / 1000)}s`
    return `${Math.round(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const hotspots = mockData.block_metrics.filter(b => b.engagement_score > 85).slice(0, 3)
  const dropOffs = mockData.block_metrics.filter(b => b.drop_off_count > 3).slice(0, 3)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Q3 2024 Investment Analysis</h1>
              <p className="text-sm text-gray-500">Document Analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
              v{mockData.current_version.version_number}
            </span>
            <span className="text-xs text-gray-400">
              Published {formatDate(mockData.current_version.published_at)}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Link bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex items-center gap-3">
          <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600 font-mono">{mockData.url}</span>
          </div>
          <button 
            onClick={copyLink}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy Link'}
          </button>
          <a 
            href={mockData.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View
          </a>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Eye}
            label="Total Views"
            value={mockData.stats.total_views}
            trend="+12 this week"
            trendUp
          />
          <StatCard
            icon={Users}
            label="Unique Viewers"
            value={mockData.stats.unique_viewers}
            trend="+5 this week"
            trendUp
          />
          <StatCard
            icon={TrendingUp}
            label="Avg. Completion"
            value={`${Math.round(mockData.stats.avg_completion * 100)}%`}
            trend="+8% vs last version"
            trendUp
          />
          <StatCard
            icon={Clock}
            label="Avg. Read Time"
            value={formatDuration(mockData.stats.avg_read_time_ms)}
            trend="4m 5s"
            trendUp={false}
            trendLabel="vs expected"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Engagement Heatmap & Insights */}
          <div className="col-span-2 space-y-6">
            {/* Engagement Heatmap */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Engagement Heatmap</h3>
              <div className="space-y-2">
                {mockData.block_metrics.map((block, i) => {
                  const intensity = block.engagement_score / 100
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-6 text-xs text-gray-400 text-right">{i + 1}</span>
                      <div className="flex-1 h-8 rounded-lg overflow-hidden bg-gray-100 relative">
                        <div 
                          className="absolute inset-y-0 left-0 rounded-lg"
                          style={{
                            width: `${block.engagement_score}%`,
                            backgroundColor: `rgba(16, 185, 129, ${0.3 + intensity * 0.7})`,
                          }}
                        />
                        <span className="absolute inset-0 flex items-center px-3 text-xs text-gray-700 truncate">
                          {block.block_preview}
                        </span>
                      </div>
                      <span className="w-12 text-xs text-right font-medium" style={{
                        color: block.engagement_score > 80 ? '#059669' : 
                               block.engagement_score > 50 ? '#D97706' : '#DC2626'
                      }}>
                        {block.engagement_score}%
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Insights Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Hotspots */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-lg">🔥</span> Hotspots
                </h4>
                <p className="text-xs text-gray-500 mb-4">Sections with highest engagement</p>
                <div className="space-y-3">
                  {hotspots.map((block, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-xs font-semibold">
                        {block.block_index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">{block.block_preview.slice(0, 35)}...</p>
                        <p className="text-xs text-gray-500">{block.reread_count} re-reads • {formatDuration(block.avg_dwell_ms)} avg</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Drop-offs */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-lg">📉</span> Drop-off Points
                </h4>
                <p className="text-xs text-gray-500 mb-4">Where readers stopped</p>
                <div className="space-y-3">
                  {dropOffs.map((block, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-7 h-7 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center text-xs font-semibold">
                        {block.block_index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">{block.block_preview.slice(0, 35)}...</p>
                        <p className="text-xs text-gray-500">{block.drop_off_count} viewers left here</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Viewers */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Viewers</h3>
            <div className="space-y-3">
              {mockData.recent_sessions.map((session, i) => (
                <div key={i} className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {session.viewer_email ? (
                        <>
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                            {session.viewer_email[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {session.viewer_email.split('@')[0]}
                            </p>
                            <p className="text-xs text-gray-500">
                              @{session.viewer_email.split('@')[1]}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                            <Users className="w-3.5 h-3.5 text-gray-500" />
                          </div>
                          <span className="text-sm text-gray-500">Anonymous</span>
                        </>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(session.started_at)}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                    <span className="capitalize">{session.device_type}</span>
                    <span>•</span>
                    <span>{session.browser}</span>
                    {session.country && (
                      <>
                        <span>•</span>
                        <span>{session.country}</span>
                      </>
                    )}
                  </div>

                  {/* Completion bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${session.completion_rate * 100}%`,
                          backgroundColor: session.completion_rate === 1 ? '#10B981' : 
                                          session.completion_rate > 0.7 ? '#F59E0B' : '#EF4444'
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium" style={{
                      color: session.completion_rate === 1 ? '#10B981' : 
                             session.completion_rate > 0.7 ? '#F59E0B' : '#EF4444'
                    }}>
                      {Math.round(session.completion_rate * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  trend,
  trendUp,
  trendLabel = 'vs last week'
}: { 
  icon: typeof Eye
  label: string
  value: string | number
  trend: string
  trendUp?: boolean
  trendLabel?: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
          <Icon className="w-4 h-4 text-gray-600" />
        </div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <div className="text-2xl font-semibold text-gray-900 mb-1">{value}</div>
      <div className="text-xs text-gray-500">
        <span className={trendUp ? 'text-emerald-600' : 'text-gray-500'}>
          {trend}
        </span>
        {' '}{trendLabel}
      </div>
    </div>
  )
}
