// src/app/(dashboard)/analytics/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Eye, Users, Clock, TrendingUp, FileText, ExternalLink, 
  MessageCircle, ChevronRight, BarChart3, RefreshCw,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react'

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
  const [loading, setLoading] = useState(true)
  const [docs, setDocs] = useState<PublishedDoc[]>([])
  const [overview, setOverview] = useState<OverviewStats | null>(null)
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

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

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto bg-[#FAFAFA]">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Analytics</h1>
          <p className="text-sm text-gray-500">Track engagement across your published documents</p>
        </div>

        {/* Overview Stats */}
        {overview && (
          <div className="grid grid-cols-5 gap-4 mb-8">
            <StatCard 
              icon={FileText} 
              label="Published" 
              value={overview.total_published}
            />
            <StatCard 
              icon={Eye} 
              label="Total Views" 
              value={overview.total_views}
            />
            <StatCard 
              icon={Users} 
              label="Unique Viewers" 
              value={overview.total_unique_viewers}
            />
            <StatCard 
              icon={TrendingUp} 
              label="Avg. Completion" 
              value={`${Math.round(overview.avg_completion * 100)}%`}
            />
            <StatCard 
              icon={MessageCircle} 
              label="Questions Asked" 
              value={overview.total_questions}
            />
          </div>
        )}

        {/* Documents List */}
        {docs.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-gray-700 mb-3">Published Documents</h2>
            {docs.map((doc) => (
              <DocumentCard 
                key={doc.id}
                doc={doc}
                isExpanded={selectedDoc === doc.id}
                onToggle={() => setSelectedDoc(selectedDoc === doc.id ? null : doc.id)}
                onOpenEditor={() => router.push(`/documents/${doc.document_id}`)}
                formatDuration={formatDuration}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
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
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <div className="text-2xl font-semibold text-gray-900">{value}</div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <BarChart3 className="w-6 h-6 text-gray-400" />
      </div>
      <h3 className="text-sm font-medium text-gray-900 mb-1">No published documents yet</h3>
      <p className="text-xs text-gray-500 max-w-xs mx-auto">
        Publish a document to start tracking views, engagement, and reader questions.
      </p>
    </div>
  )
}

function DocumentCard({ 
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
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Main row */}
      <div 
        className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-900 truncate">{doc.title}</h3>
            <span className="text-[10px] text-gray-400 font-mono">v{doc.version_number}</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Published {formatDate(doc.published_at)}
          </p>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-gray-400" />
            <span>{doc.stats.total_views}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-gray-400" />
            <span>{doc.stats.unique_viewers}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
            <span>{Math.round(doc.stats.avg_completion * 100)}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>{formatDuration(doc.stats.avg_read_time_ms)}</span>
          </div>
          {doc.stats.questions_asked > 0 && (
            <div className="flex items-center gap-1.5 text-blue-600">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{doc.stats.questions_asked}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="View published"
          >
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </a>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-4 py-4 border-t border-gray-100 bg-gray-50">
          <div className="grid grid-cols-2 gap-6">
            {/* Engagement breakdown */}
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-3">Engagement</h4>
              <div className="space-y-2">
                <EngagementBar label="Views" value={doc.stats.total_views} max={Math.max(doc.stats.total_views, 10)} />
                <EngagementBar label="Unique viewers" value={doc.stats.unique_viewers} max={Math.max(doc.stats.total_views, 10)} />
                <EngagementBar label="Avg. completion" value={Math.round(doc.stats.avg_completion * 100)} max={100} suffix="%" />
              </div>
            </div>

            {/* Question topics */}
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-3">
                Reader Questions
                {doc.stats.questions_asked > 0 && (
                  <span className="ml-2 text-gray-400 font-normal">({doc.stats.questions_asked} total)</span>
                )}
              </h4>
              {doc.question_topics.length > 0 ? (
                <div className="space-y-1.5">
                  {doc.question_topics.slice(0, 5).map((topic, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 truncate">{topic.topic}</span>
                      <span className="text-gray-400 ml-2">{topic.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No questions yet</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
            <button 
              onClick={onOpenEditor}
              className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
            >
              Open in editor
            </button>
            <span className="text-gray-300">·</span>
            <a 
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
            >
              View published
            </a>
          </div>
        </div>
      )}
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
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="text-gray-700 font-medium">{value}{suffix}</span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-emerald-500 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
