// src/app/(dashboard)/analytics/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Eye, Users, Clock, TrendingUp, FileText, ExternalLink, 
  MessageCircle, ChevronDown, RefreshCw, Globe, Sparkles,
  LayoutDashboard, Flame, Route, RotateCcw, UserCircle, MessageSquare,
  ArrowRight, ArrowDown, AlertCircle, Check, TrendingDown
} from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import { useAuth } from '@/lib/hooks/useAuth'

// Types
interface PublishedDoc {
  id: string
  document_id: string
  title: string
  slug: string
  url: string
  published_at: string
  version_number: number
}

interface BlockMetric {
  block_id: string
  block_index: number
  block_preview: string
  block_type: string
  avg_dwell_ms: number
  enter_count: number
  reread_count: number
  drop_off_count: number
  engagement_score: number
  scroll_depth: number
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
  scroll_pattern: 'linear' | 'jumping' | 'skimming'
}

interface ReaderQuestion {
  id: string
  question: string
  block_index: number | null
  asked_at: string
  topic: string
}

interface DocumentAnalytics {
  stats: {
    total_views: number
    unique_viewers: number
    avg_completion: number
    avg_read_time_ms: number
    questions_asked: number
    bounce_rate: number
  }
  block_metrics: BlockMetric[]
  recent_sessions: ViewerSession[]
  questions: ReaderQuestion[]
  question_topics: { topic: string; count: number }[]
}

interface AIInsight {
  type: 'positive' | 'warning' | 'neutral'
  title: string
  description: string
}

type TabId = 'overview' | 'heatmap' | 'journey' | 'rereads' | 'readers' | 'voice'

const tabs: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'heatmap', label: 'Heatmap', icon: Flame },
  { id: 'journey', label: 'Journey', icon: Route },
  { id: 'rereads', label: 'Rereads', icon: RotateCcw },
  { id: 'readers', label: 'Readers', icon: UserCircle },
  { id: 'voice', label: 'Voice', icon: MessageSquare },
]

export default function AnalyticsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  // State
  const [loading, setLoading] = useState(true)
  const [docs, setDocs] = useState<PublishedDoc[]>([])
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const [showDocDropdown, setShowDocDropdown] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [analytics, setAnalytics] = useState<DocumentAnalytics | null>(null)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d')
  
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDocDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch documents list
  useEffect(() => {
    if (user) {
      fetchDocuments()
    }
  }, [user])

  // Fetch analytics when document selected
  useEffect(() => {
    if (selectedDocId) {
      fetchDocumentAnalytics(selectedDocId)
    }
  }, [selectedDocId, dateRange])

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/analytics/overview')
      if (response.ok) {
        const data = await response.json()
        const publishedDocs = data.documents || []
        setDocs(publishedDocs)
        if (publishedDocs.length > 0 && !selectedDocId) {
          setSelectedDocId(publishedDocs[0].document_id)
        }
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchDocumentAnalytics = async (docId: string) => {
    try {
      const response = await fetch(`/api/analytics?document_id=${docId}&range=${dateRange}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
    }
  }

  const selectedDoc = docs.find(d => d.document_id === selectedDocId)

  // Generate AI insights based on analytics
  const generateInsights = (): AIInsight[] => {
    if (!analytics) return []
    
    const insights: AIInsight[] = []
    
    // Completion rate insight
    if (analytics.stats.avg_completion < 0.5) {
      insights.push({
        type: 'warning',
        title: 'Low completion rate',
        description: `Only ${Math.round(analytics.stats.avg_completion * 100)}% of readers finish. Consider shortening or restructuring.`
      })
    } else if (analytics.stats.avg_completion > 0.8) {
      insights.push({
        type: 'positive',
        title: 'High completion rate',
        description: `${Math.round(analytics.stats.avg_completion * 100)}% of readers finish - above average engagement.`
      })
    }

    // Drop-off analysis
    const highDropOff = analytics.block_metrics.find(b => b.drop_off_count > analytics.stats.unique_viewers * 0.3)
    if (highDropOff) {
      insights.push({
        type: 'warning',
        title: `Drop-off at section ${highDropOff.block_index + 1}`,
        description: `${highDropOff.drop_off_count} readers stopped here. Review this section for clarity.`
      })
    }

    // Reread patterns
    const highRereads = analytics.block_metrics.filter(b => b.reread_count > 2)
    if (highRereads.length > 0) {
      insights.push({
        type: 'neutral',
        title: `${highRereads.length} sections frequently re-read`,
        description: 'Could indicate valuable reference content or unclear writing.'
      })
    }

    // Questions insight
    if (analytics.question_topics.length > 0) {
      const topTopic = analytics.question_topics[0]
      insights.push({
        type: 'neutral',
        title: `"${topTopic.topic}" is top question theme`,
        description: `${topTopic.count} questions on this topic. Consider addressing in the document.`
      })
    }

    // Bounce rate
    if (analytics.stats.bounce_rate > 0.4) {
      insights.push({
        type: 'warning',
        title: 'High bounce rate',
        description: `${Math.round(analytics.stats.bounce_rate * 100)}% of visitors leave quickly. Check your opening section.`
      })
    }

    return insights.slice(0, 5)
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return '<1s'
    if (ms < 60000) return `${Math.round(ms / 1000)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  if (authLoading || !user) {
    return null
  }

  return (
    <div className="h-screen flex bg-[#FAFAFA]">
      <Sidebar connectedSourceCount={3} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with doc selector */}
        <header className="h-14 border-b border-gray-200 bg-white flex items-center px-6 gap-4 flex-shrink-0">
          <span className="text-sm text-gray-500">Analytics on</span>
          
          {/* Document Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDocDropdown(!showDocDropdown)}
              className="flex items-center gap-2 text-gray-900 hover:text-gray-700 transition-colors"
            >
              <span className="text-lg font-semibold">
                {selectedDoc?.title || 'Select document'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showDocDropdown && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                <div className="p-2 border-b border-gray-100">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wide px-2">
                    Published Documents
                  </span>
                </div>
                <div className="max-h-64 overflow-auto">
                  {docs.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-gray-500">
                      No published documents
                    </div>
                  ) : (
                    docs.map(doc => (
                      <button
                        key={doc.document_id}
                        onClick={() => {
                          setSelectedDocId(doc.document_id)
                          setShowDocDropdown(false)
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                          selectedDocId === doc.document_id ? 'bg-gray-50' : ''
                        }`}
                      >
                        <div>
                          <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                          <div className="text-xs text-gray-400 mt-0.5">v{doc.version_number}</div>
                        </div>
                        {selectedDocId === doc.document_id && (
                          <Check className="w-4 h-4 text-emerald-500" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1" />

          {/* Date range filter */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  dateRange === range 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days'}
              </button>
            ))}
          </div>

          {/* External link */}
          {selectedDoc && (
            <a
              href={selectedDoc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>
          )}
        </header>

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left sidebar tabs */}
          <nav className="w-48 border-r border-gray-200 bg-white flex-shrink-0 py-4">
            {tabs.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors ${
                    isActive 
                      ? 'text-gray-900 bg-gray-100 border-l-2 border-gray-900' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-l-2 border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>

          {/* Main visualization area */}
          <main className="flex-1 overflow-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : !selectedDoc ? (
              <EmptyState onCreateDoc={() => router.push('/workspace')} />
            ) : !analytics ? (
              <div className="flex items-center justify-center h-full">
                <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <OverviewTab analytics={analytics} formatDuration={formatDuration} />
                )}
                {activeTab === 'heatmap' && (
                  <HeatmapTab blocks={analytics.block_metrics} formatDuration={formatDuration} />
                )}
                {activeTab === 'journey' && (
                  <JourneyTab analytics={analytics} />
                )}
                {activeTab === 'rereads' && (
                  <RereadsTab blocks={analytics.block_metrics} formatDuration={formatDuration} />
                )}
                {activeTab === 'readers' && (
                  <ReadersTab sessions={analytics.recent_sessions} formatDate={formatDate} formatDuration={formatDuration} />
                )}
                {activeTab === 'voice' && (
                  <VoiceTab questions={analytics.questions} topics={analytics.question_topics} formatDate={formatDate} />
                )}
              </>
            )}
          </main>

          {/* Right insights panel */}
          {analytics && (
            <aside className="w-72 border-l border-gray-200 bg-white flex-shrink-0 p-4 overflow-auto">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <h3 className="text-sm font-semibold text-gray-900">Insights</h3>
              </div>
              
              <div className="space-y-3">
                {generateInsights().map((insight, i) => (
                  <div 
                    key={i}
                    className={`p-3 rounded-lg border ${
                      insight.type === 'positive' 
                        ? 'bg-emerald-50 border-emerald-200' 
                        : insight.type === 'warning'
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {insight.type === 'positive' && <TrendingUp className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />}
                      {insight.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />}
                      {insight.type === 'neutral' && <Sparkles className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />}
                      <div>
                        <div className={`text-sm font-medium ${
                          insight.type === 'positive' ? 'text-emerald-900' :
                          insight.type === 'warning' ? 'text-amber-900' : 'text-gray-900'
                        }`}>
                          {insight.title}
                        </div>
                        <div className={`text-xs mt-1 ${
                          insight.type === 'positive' ? 'text-emerald-700' :
                          insight.type === 'warning' ? 'text-amber-700' : 'text-gray-600'
                        }`}>
                          {insight.description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {generateInsights().length === 0 && (
                  <div className="text-center py-8 text-sm text-gray-400">
                    Not enough data yet for insights
                  </div>
                )}
              </div>

              {/* Quick stats */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Quick Stats</h4>
                <div className="space-y-2">
                  <QuickStat label="Total views" value={analytics.stats.total_views} />
                  <QuickStat label="Unique readers" value={analytics.stats.unique_viewers} />
                  <QuickStat label="Avg. read time" value={formatDuration(analytics.stats.avg_read_time_ms)} />
                  <QuickStat label="Completion" value={`${Math.round(analytics.stats.avg_completion * 100)}%`} />
                  <QuickStat label="Questions" value={analytics.stats.questions_asked} />
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}

// Quick stat row
function QuickStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}

// Empty state
function EmptyState({ onCreateDoc }: { onCreateDoc: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <Globe className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No published documents</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-sm text-center">
        Publish a document to start tracking reader engagement and behavior.
      </p>
      <button
        onClick={onCreateDoc}
        className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
      >
        Create a document
      </button>
    </div>
  )
}

// Overview Tab
function OverviewTab({ analytics, formatDuration }: { 
  analytics: DocumentAnalytics
  formatDuration: (ms: number) => string 
}) {
  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Eye} label="Total Views" value={analytics.stats.total_views} />
        <StatCard icon={Users} label="Unique Readers" value={analytics.stats.unique_viewers} />
        <StatCard icon={TrendingUp} label="Completion Rate" value={`${Math.round(analytics.stats.avg_completion * 100)}%`} />
        <StatCard icon={Clock} label="Avg. Read Time" value={formatDuration(analytics.stats.avg_read_time_ms)} />
      </div>

      {/* Mini heatmap preview */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Engagement Overview</h3>
        <div className="flex gap-1 h-12">
          {analytics.block_metrics.slice(0, 30).map((block, i) => {
            const intensity = Math.min(block.engagement_score / 100, 1)
            return (
              <div
                key={i}
                className="flex-1 rounded-sm cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: `rgba(16, 185, 129, ${intensity})`,
                }}
                title={`Section ${block.block_index + 1}: ${block.engagement_score}% engagement`}
              />
            )
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>Start</span>
          <span>End</span>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Readers</h3>
        <div className="space-y-3">
          {analytics.recent_sessions.slice(0, 5).map((session, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <UserCircle className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-900">
                    {session.viewer_email || 'Anonymous'}
                  </div>
                  <div className="text-xs text-gray-400">{session.device_type}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-emerald-600">
                  {Math.round(session.completion_rate * 100)}%
                </div>
                <div className="text-xs text-gray-400">completed</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Stat Card
function StatCard({ icon: Icon, label, value }: { 
  icon: typeof Eye
  label: string
  value: string | number 
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
          <Icon className="w-4 h-4 text-gray-500" />
        </div>
      </div>
      <div className="text-2xl font-semibold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  )
}

// Heatmap Tab
function HeatmapTab({ blocks, formatDuration }: { 
  blocks: BlockMetric[]
  formatDuration: (ms: number) => string 
}) {
  const [hoveredBlock, setHoveredBlock] = useState<number | null>(null)
  const maxDwell = Math.max(...blocks.map(b => b.avg_dwell_ms), 1)

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Block-Level Engagement</h3>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-emerald-200" />
              <span>Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-emerald-500" />
              <span>High</span>
            </div>
          </div>
        </div>

        {/* Heatmap visualization */}
        <div className="space-y-2">
          {blocks.map((block, i) => {
            const intensity = Math.min(block.engagement_score / 100, 1)
            const isHovered = hoveredBlock === i
            
            return (
              <div
                key={i}
                className={`relative rounded-lg border transition-all cursor-pointer ${
                  isHovered ? 'border-gray-300 shadow-sm' : 'border-gray-100'
                }`}
                style={{
                  backgroundColor: `rgba(16, 185, 129, ${intensity * 0.15})`,
                  borderLeftWidth: 4,
                  borderLeftColor: `rgba(16, 185, 129, ${intensity})`,
                }}
                onMouseEnter={() => setHoveredBlock(i)}
                onMouseLeave={() => setHoveredBlock(null)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-400">
                          Section {block.block_index + 1}
                        </span>
                        <span className="text-xs text-gray-300">
                          {block.block_type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 truncate">
                        {block.block_preview}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs flex-shrink-0">
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{block.enter_count}</div>
                        <div className="text-gray-400">views</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{formatDuration(block.avg_dwell_ms)}</div>
                        <div className="text-gray-400">avg time</div>
                      </div>
                      <div className="text-center">
                        <div className={`font-semibold ${block.engagement_score > 70 ? 'text-emerald-600' : block.engagement_score > 40 ? 'text-amber-600' : 'text-gray-900'}`}>
                          {block.engagement_score}%
                        </div>
                        <div className="text-gray-400">engaged</div>
                      </div>
                    </div>
                  </div>

                  {/* Dwell time bar */}
                  <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${(block.avg_dwell_ms / maxDwell) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Journey Tab
function JourneyTab({ analytics }: { analytics: DocumentAnalytics }) {
  const totalReaders = analytics.stats.unique_viewers || 1
  
  // Calculate funnel stages
  const stages = [
    { label: 'Opened', count: totalReaders, percent: 100 },
    { label: 'Read intro', count: Math.round(totalReaders * 0.85), percent: 85 },
    { label: 'Reached middle', count: Math.round(totalReaders * 0.65), percent: 65 },
    { label: 'Completed', count: Math.round(totalReaders * analytics.stats.avg_completion), percent: Math.round(analytics.stats.avg_completion * 100) },
  ]

  // Scroll patterns
  const patterns = analytics.recent_sessions.reduce((acc, s) => {
    acc[s.scroll_pattern] = (acc[s.scroll_pattern] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalSessions = analytics.recent_sessions.length || 1

  return (
    <div className="space-y-6">
      {/* Funnel */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-6">Reading Funnel</h3>
        
        <div className="space-y-3">
          {stages.map((stage, i) => (
            <div key={i}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-700">{stage.label}</span>
                <span className="text-gray-500">{stage.count} readers ({stage.percent}%)</span>
              </div>
              <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-lg transition-all flex items-center justify-end pr-3"
                  style={{ width: `${stage.percent}%` }}
                >
                  {stage.percent > 20 && (
                    <span className="text-xs font-medium text-white">{stage.percent}%</span>
                  )}
                </div>
              </div>
              {i < stages.length - 1 && (
                <div className="flex justify-center my-2">
                  <ArrowDown className="w-4 h-4 text-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Scroll patterns */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Reading Patterns</h3>
        
        <div className="grid grid-cols-3 gap-4">
          <PatternCard 
            label="Linear" 
            description="Read start to finish"
            count={patterns.linear || 0}
            total={totalSessions}
            color="emerald"
          />
          <PatternCard 
            label="Jumping" 
            description="Skipped around sections"
            count={patterns.jumping || 0}
            total={totalSessions}
            color="amber"
          />
          <PatternCard 
            label="Skimming" 
            description="Quick scroll through"
            count={patterns.skimming || 0}
            total={totalSessions}
            color="red"
          />
        </div>
      </div>
    </div>
  )
}

function PatternCard({ label, description, count, total, color }: {
  label: string
  description: string
  count: number
  total: number
  color: 'emerald' | 'amber' | 'red'
}) {
  const percent = Math.round((count / total) * 100) || 0
  const colors = {
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    red: 'bg-red-100 text-red-700 border-red-200',
  }

  return (
    <div className={`p-4 rounded-lg border ${colors[color]}`}>
      <div className="text-2xl font-semibold mb-1">{percent}%</div>
      <div className="text-sm font-medium">{label}</div>
      <div className="text-xs opacity-75 mt-0.5">{description}</div>
    </div>
  )
}

// Rereads Tab
function RereadsTab({ blocks, formatDuration }: { 
  blocks: BlockMetric[]
  formatDuration: (ms: number) => string 
}) {
  const rereads = blocks
    .filter(b => b.reread_count > 0)
    .sort((a, b) => b.reread_count - a.reread_count)

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Frequently Re-read Sections</h3>
        <p className="text-xs text-gray-500 mb-4">
          Sections readers come back to - could indicate valuable content or unclear writing
        </p>

        {rereads.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-400">
            No rereads tracked yet
          </div>
        ) : (
          <div className="space-y-3">
            {rereads.map((block, i) => (
              <div 
                key={i}
                className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <RotateCcw className="w-5 h-5 text-purple-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400 mb-0.5">Section {block.block_index + 1}</div>
                  <p className="text-sm text-gray-700 truncate">{block.block_preview}</p>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-semibold text-purple-600">{block.reread_count}</div>
                  <div className="text-xs text-gray-400">rereads</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Readers Tab
function ReadersTab({ sessions, formatDate, formatDuration }: {
  sessions: ViewerSession[]
  formatDate: (date: string) => string
  formatDuration: (ms: number) => string
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Reader Sessions</h3>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400">
            No reader sessions yet
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sessions.map((session, i) => (
              <div key={i} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <UserCircle className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {session.viewer_email || 'Anonymous visitor'}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-2">
                        <span>{session.device_type}</span>
                        <span className="text-gray-300">·</span>
                        <span>{session.browser}</span>
                        {session.country && (
                          <>
                            <span className="text-gray-300">·</span>
                            <span>{session.country}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">{formatDate(session.started_at)}</div>
                </div>

                <div className="flex items-center gap-4 ml-11">
                  <div className="flex-1">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${session.completion_rate * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-medium text-emerald-600 w-12 text-right">
                    {Math.round(session.completion_rate * 100)}%
                  </span>
                  <span className="text-xs text-gray-400 w-16 text-right">
                    {formatDuration(session.total_dwell_ms)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Voice Tab
function VoiceTab({ questions, topics, formatDate }: {
  questions: ReaderQuestion[]
  topics: { topic: string; count: number }[]
  formatDate: (date: string) => string
}) {
  return (
    <div className="space-y-6">
      {/* Topic summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Question Themes</h3>
        
        {topics.length === 0 ? (
          <div className="text-center py-6 text-sm text-gray-400">
            No questions asked yet
          </div>
        ) : (
          <div className="space-y-2">
            {topics.map((topic, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{topic.topic}</span>
                <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                  {topic.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Individual questions */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Reader Questions</h3>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400">
            No questions yet. Questions from readers will appear here.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {questions.map((q, i) => (
              <div key={i} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{q.question}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <span>{formatDate(q.asked_at)}</span>
                      {q.block_index !== null && (
                        <>
                          <span className="text-gray-300">·</span>
                          <span>Section {q.block_index + 1}</span>
                        </>
                      )}
                      <span className="text-gray-300">·</span>
                      <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">{q.topic}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}