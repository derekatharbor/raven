// src/app/(dashboard)/analytics/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Eye, Users, Clock, TrendingUp, FileText, ExternalLink, 
  MessageCircle, ChevronRight, BarChart3, RefreshCw, Globe, PenLine
} from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import { useAuth } from '@/lib/hooks/useAuth'

interface PublishedDoc {
  id: string
  document_id: string
  title: string
  slug: string
  url: string
  published_at: string
  version_number: number
  stats: {
    total_views: number
    unique_viewers: number
    avg_completion: number
    avg_read_time_ms: number
    questions_asked: number
  }
  question_topics: { topic: string; count: number }[]
}

interface OverviewStats {
  total_published: number
  total_views: number
  total_unique_viewers: number
  avg_completion: number
  total_questions: number
}

export default function AnalyticsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [docs, setDocs] = useState<PublishedDoc[]>([])
  const [overview, setOverview] = useState<OverviewStats | null>(null)
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchAnalytics()
    }
  }, [user])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/overview')
      if (response.ok) {
        const data = await response.json()
        setDocs(data.documents || [])
        setOverview(data.overview || null)
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
    } finally {
      setLoading(false)
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
    })
  }

  if (authLoading || !user) {
    return null
  }

  return (
    <div className="h-screen flex bg-[#FBF9F7]">
      <Sidebar connectedSourceCount={3} />
      
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Analytics</h1>
            <p className="text-sm text-gray-500">Track engagement across your published documents</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : docs.length === 0 ? (
            <EmptyState onCreateDoc={() => router.push('/workspace')} />
          ) : (
            <>
              {/* Overview Stats */}
              {overview && (
                <div className="grid grid-cols-5 gap-4 mb-8">
                  <StatCard icon={FileText} label="Published" value={overview.total_published} />
                  <StatCard icon={Eye} label="Total Views" value={overview.total_views} />
                  <StatCard icon={Users} label="Unique Viewers" value={overview.total_unique_viewers} />
                  <StatCard icon={TrendingUp} label="Avg. Completion" value={`${Math.round(overview.avg_completion * 100)}%`} />
                  <StatCard icon={MessageCircle} label="Questions" value={overview.total_questions} />
                </div>
              )}

              {/* Documents List */}
              <div>
                <h2 className="text-sm font-medium text-gray-700 mb-4">Published Documents</h2>
                <div className="space-y-3">
                  {docs.map((doc) => (
                    <DocumentRow 
                      key={doc.id}
                      doc={doc}
                      isExpanded={expandedDoc === doc.id}
                      onToggle={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                      onOpenEditor={() => router.push(`/workspace?doc=${doc.document_id}`)}
                      formatDuration={formatDuration}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { 
  icon: typeof Eye
  label: string
  value: string | number 
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
          <Icon className="w-4 h-4 text-gray-500" />
        </div>
      </div>
      <div className="text-2xl font-semibold text-gray-900 mb-0.5">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}

function EmptyState({ onCreateDoc }: { onCreateDoc: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="py-20 px-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-200">
          <Globe className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No published documents</h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
          When you publish a document, you'll see views, engagement metrics, and reader questions here.
        </p>
        <button
          onClick={onCreateDoc}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          <PenLine className="w-4 h-4" />
          Create a document
        </button>
      </div>
      
      {/* Preview of what they'll see */}
      <div className="border-t border-gray-100 bg-gray-50 rounded-b-2xl px-8 py-6">
        <p className="text-xs text-gray-400 text-center mb-4">What you'll see when you publish</p>
        <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
          {['Views', 'Readers', 'Completion', 'Questions'].map((label) => (
            <div key={label} className="bg-white rounded-lg border border-gray-200 p-3 text-center">
              <div className="text-lg font-semibold text-gray-300">--</div>
              <div className="text-[10px] text-gray-400">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function DocumentRow({ 
  doc, 
  isExpanded, 
  onToggle, 
  onOpenEditor,
  formatDuration,
  formatDate,
}: { 
  doc: PublishedDoc
  isExpanded: boolean
  onToggle: () => void
  onOpenEditor: () => void
  formatDuration: (ms: number) => string
  formatDate: (date: string) => string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Main row */}
      <div 
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-900 truncate">{doc.title}</h3>
            <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">v{doc.version_number}</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Published {formatDate(doc.published_at)}</p>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-6 text-xs text-gray-500">
          <Stat icon={Eye} value={doc.stats.total_views} />
          <Stat icon={Users} value={doc.stats.unique_viewers} />
          <Stat icon={TrendingUp} value={`${Math.round(doc.stats.avg_completion * 100)}%`} />
          <Stat icon={Clock} value={formatDuration(doc.stats.avg_read_time_ms)} />
          {doc.stats.questions_asked > 0 && (
            <Stat icon={MessageCircle} value={doc.stats.questions_asked} highlight />
          )}
        </div>

        {/* External link */}
        <a
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
        >
          <ExternalLink className="w-4 h-4 text-gray-400" />
        </a>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-5 py-5 border-t border-gray-100 bg-gray-50">
          <div className="grid grid-cols-2 gap-8">
            {/* Engagement breakdown */}
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-4">Engagement</h4>
              <div className="space-y-3">
                <EngagementBar label="Views" value={doc.stats.total_views} max={Math.max(doc.stats.total_views, 10)} />
                <EngagementBar label="Unique readers" value={doc.stats.unique_viewers} max={Math.max(doc.stats.total_views, 10)} />
                <EngagementBar label="Avg. completion" value={Math.round(doc.stats.avg_completion * 100)} max={100} suffix="%" />
              </div>
            </div>

            {/* Question topics */}
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-4">
                Reader Questions
                {doc.stats.questions_asked > 0 && (
                  <span className="ml-2 text-gray-400 font-normal">({doc.stats.questions_asked})</span>
                )}
              </h4>
              {doc.question_topics.length > 0 ? (
                <div className="space-y-2">
                  {doc.question_topics.slice(0, 5).map((topic, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{topic.topic}</span>
                      <span className="text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{topic.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No questions yet</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-200">
            <button 
              onClick={onOpenEditor}
              className="text-xs text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer"
            >
              Open in editor
            </button>
            <span className="text-gray-300">·</span>
            <a 
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer"
            >
              View published
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ icon: Icon, value, highlight }: { icon: typeof Eye; value: string | number; highlight?: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 ${highlight ? 'text-blue-600' : ''}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{value}</span>
    </div>
  )
}

function EngagementBar({ label, value, max, suffix = '' }: {
  label: string
  value: number
  max: number
  suffix?: string
}) {
  const percentage = Math.min((value / max) * 100, 100)
  
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-gray-500">{label}</span>
        <span className="text-gray-900 font-medium">{value}{suffix}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-emerald-500 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}