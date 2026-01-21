// src/app/(dashboard)/track/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, Plus, MoreVertical, Pause, Trash2,
  Clock, Filter, Globe, X,
  Pencil, RefreshCw, Bell, BellOff, Eye,
  ChevronDown, ExternalLink, Calendar,
  CheckSquare, Square, TrendingUp, AlertCircle
} from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import { useAuth } from '@/lib/hooks/useAuth'

// Available sources with their domains for Brandfetch logos
const AVAILABLE_SOURCES = [
  { id: 'sec', name: 'SEC EDGAR', domain: 'sec.gov' },
  { id: 'reuters', name: 'Reuters', domain: 'reuters.com' },
  { id: 'bloomberg', name: 'Bloomberg', domain: 'bloomberg.com' },
  { id: 'wsj', name: 'Wall Street Journal', domain: 'wsj.com' },
  { id: 'ft', name: 'Financial Times', domain: 'ft.com' },
  { id: 'nytimes', name: 'New York Times', domain: 'nytimes.com' },
  { id: 'economist', name: 'The Economist', domain: 'economist.com' },
  { id: 'cnbc', name: 'CNBC', domain: 'cnbc.com' },
  { id: 'techcrunch', name: 'TechCrunch', domain: 'techcrunch.com' },
  { id: 'arxiv', name: 'arXiv', domain: 'arxiv.org' },
]

// Topic colors - muted
const topicColors: Record<string, { bg: string; text: string; dot: string }> = {
  'Geopolitical': { bg: '#FDF2F8', text: '#9D174D', dot: '#DB2777' },
  'Financial': { bg: '#ECFDF5', text: '#065F46', dot: '#10B981' },
  'Technology': { bg: '#EFF6FF', text: '#1E40AF', dot: '#3B82F6' },
  'Regulatory': { bg: '#FFFBEB', text: '#92400E', dot: '#F59E0B' },
  'Market': { bg: '#F5F3FF', text: '#5B21B6', dot: '#8B5CF6' },
  'Competitive': { bg: '#ECFEFF', text: '#155E75', dot: '#06B6D4' },
}

interface TrackedTopic {
  id: string
  query: string
  topic: string
  sourceIds: string[]
  cadence: 'hourly' | '6h' | 'daily' | 'weekly'
  lastRun: string | null
  nextRun: string
  newFindings: number
  totalFindings: number
  status: 'active' | 'paused'
  createdAt: string
  findings?: Finding[]
}

interface Finding {
  id: string
  date: string
  source: string
  title: string
  snippet: string
  url: string
  isNew: boolean
}

// Mock data
const MOCK_TOPICS: TrackedTopic[] = [
  {
    id: '1',
    query: 'Taiwan semiconductor supply chain disruptions',
    topic: 'Geopolitical',
    sourceIds: ['reuters', 'bloomberg', 'sec'],
    cadence: 'daily',
    lastRun: '2026-01-20T18:00:00Z',
    nextRun: '2026-01-21T18:00:00Z',
    newFindings: 3,
    totalFindings: 47,
    status: 'active',
    createdAt: '2024-12-01T00:00:00Z',
    findings: [
      { id: 'f1', date: '2026-01-20', source: 'reuters', title: 'TSMC reports Q4 capacity concerns amid geopolitical tensions', snippet: 'Taiwan Semiconductor Manufacturing Co warned of potential supply constraints...', url: '#', isNew: true },
      { id: 'f2', date: '2026-01-20', source: 'bloomberg', title: 'US-China chip tensions escalate with new export controls', snippet: 'The Biden administration announced additional restrictions on semiconductor...', url: '#', isNew: true },
      { id: 'f3', date: '2026-01-19', source: 'sec', title: 'Intel 8-K filing mentions Taiwan supply risk', snippet: 'Risk factors updated to include potential disruption to Taiwan-based suppliers...', url: '#', isNew: true },
      { id: 'f4', date: '2026-01-18', source: 'ft', title: 'European chipmakers seek alternatives to Taiwan dependency', snippet: 'Major European semiconductor firms are accelerating plans to diversify...', url: '#', isNew: false },
    ]
  },
  {
    id: '2',
    query: 'Chinese military activity South China Sea',
    topic: 'Geopolitical',
    sourceIds: ['reuters', 'nytimes'],
    cadence: '6h',
    lastRun: '2026-01-20T22:00:00Z',
    nextRun: '2026-01-21T04:00:00Z',
    newFindings: 0,
    totalFindings: 128,
    status: 'active',
    createdAt: '2024-11-15T00:00:00Z',
  },
  {
    id: '3',
    query: 'NVIDIA competitive position data center GPU',
    topic: 'Competitive',
    sourceIds: ['sec', 'techcrunch', 'bloomberg'],
    cadence: 'weekly',
    lastRun: '2026-01-15T10:00:00Z',
    nextRun: '2026-01-22T10:00:00Z',
    newFindings: 7,
    totalFindings: 34,
    status: 'active',
    createdAt: '2024-10-20T00:00:00Z',
  },
  {
    id: '4',
    query: 'Federal Reserve interest rate policy signals',
    topic: 'Financial',
    sourceIds: ['wsj', 'bloomberg', 'ft'],
    cadence: 'daily',
    lastRun: '2026-01-20T14:00:00Z',
    nextRun: '2026-01-21T14:00:00Z',
    newFindings: 2,
    totalFindings: 89,
    status: 'active',
    createdAt: '2024-09-01T00:00:00Z',
  },
  {
    id: '5',
    query: 'AI regulation executive orders legislation',
    topic: 'Regulatory',
    sourceIds: ['nytimes', 'techcrunch'],
    cadence: 'daily',
    lastRun: '2026-01-20T09:00:00Z',
    nextRun: '2026-01-21T09:00:00Z',
    newFindings: 1,
    totalFindings: 56,
    status: 'active',
    createdAt: '2024-11-01T00:00:00Z',
  },
  {
    id: '6',
    query: 'AMD MI300 adoption enterprise deployments',
    topic: 'Technology',
    sourceIds: ['sec', 'techcrunch'],
    cadence: 'weekly',
    lastRun: '2026-01-13T10:00:00Z',
    nextRun: '2026-01-20T10:00:00Z',
    newFindings: 4,
    totalFindings: 21,
    status: 'active',
    createdAt: '2024-12-10T00:00:00Z',
  },
  {
    id: '7',
    query: 'OpenAI enterprise partnerships announcements',
    topic: 'Competitive',
    sourceIds: ['techcrunch', 'bloomberg'],
    cadence: 'daily',
    lastRun: '2026-01-20T12:00:00Z',
    nextRun: '2026-01-21T12:00:00Z',
    newFindings: 0,
    totalFindings: 73,
    status: 'paused',
    createdAt: '2024-08-15T00:00:00Z',
  },
  {
    id: '8',
    query: 'Semiconductor export controls China',
    topic: 'Regulatory',
    sourceIds: ['reuters', 'wsj', 'ft'],
    cadence: '6h',
    lastRun: '2026-01-20T20:00:00Z',
    nextRun: '2026-01-21T02:00:00Z',
    newFindings: 5,
    totalFindings: 112,
    status: 'active',
    createdAt: '2024-07-01T00:00:00Z',
  },
]

type ViewMode = 'query' | 'topic'
type CadenceFilter = 'all' | 'hourly' | '6h' | 'daily' | 'weekly'

// Brandfetch logo component
function SourceLogo({ domain, size = 20 }: { domain: string; size?: number }) {
  const [error, setError] = useState(false)
  
  if (error) {
    return (
      <div 
        className="rounded bg-gray-100 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <Globe className="text-gray-400" style={{ width: size * 0.6, height: size * 0.6 }} />
      </div>
    )
  }
  
  return (
    <img
      src={`https://cdn.brandfetch.io/${domain}?c=1id1Fyz-h7an5-5KR_y`}
      alt={domain}
      width={size}
      height={size}
      className="rounded object-contain"
      onError={() => setError(true)}
    />
  )
}

export default function TrackPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  const [topics, setTopics] = useState<TrackedTopic[]>(MOCK_TOPICS)
  const [viewMode, setViewMode] = useState<ViewMode>('query')
  const [searchQuery, setSearchQuery] = useState('')
  const [cadenceFilter, setCadenceFilter] = useState<CadenceFilter>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showAddModal, setShowAddModal] = useState(false)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<TrackedTopic | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Filter topics
  const filteredTopics = topics.filter(t => {
    const matchesSearch = t.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.topic.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCadence = cadenceFilter === 'all' || t.cadence === cadenceFilter
    return matchesSearch && matchesCadence
  })

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredTopics.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredTopics.map(t => t.id)))
    }
  }

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const formatLastRun = (date: string | null) => {
    if (!date) return 'Never'
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatCadence = (cadence: string) => {
    switch (cadence) {
      case 'hourly': return 'Hourly'
      case '6h': return 'Every 6h'
      case 'daily': return 'Daily'
      case 'weekly': return 'Weekly'
      default: return cadence
    }
  }

  const handleToggleStatus = (id: string) => {
    setTopics(prev => prev.map(t => 
      t.id === id ? { ...t, status: t.status === 'active' ? 'paused' : 'active' } : t
    ))
    setMenuOpenId(null)
  }

  const handleDelete = (id: string) => {
    setTopics(prev => prev.filter(t => t.id !== id))
    setMenuOpenId(null)
    if (selectedTopic?.id === id) setSelectedTopic(null)
  }

  const handleRowClick = (topic: TrackedTopic) => {
    setSelectedTopic(topic)
  }

  const getSourcesByIds = (ids: string[]) => {
    return ids.map(id => AVAILABLE_SOURCES.find(s => s.id === id)).filter(Boolean)
  }

  if (authLoading || !user) {
    return null
  }

  return (
    <div className="h-screen flex bg-[#FAFAFA]">
      <Sidebar connectedSourceCount={3} />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Main content */}
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-200 ${selectedTopic ? 'mr-0' : ''}`}>
          {/* Header */}
          <header className="flex-shrink-0 px-6 py-5 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between mb-5">
              <h1 className="text-xl font-semibold text-gray-900">Track</h1>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Topic
              </button>
            </div>

            {/* Filters row */}
            <div className="flex items-center gap-3">
              {/* Cadence filter */}
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200">
                <Clock className="w-4 h-4 text-gray-400" />
                <select
                  value={cadenceFilter}
                  onChange={(e) => setCadenceFilter(e.target.value as CadenceFilter)}
                  className="bg-transparent border-none outline-none text-sm text-gray-700 cursor-pointer"
                >
                  <option value="all">All Cadences</option>
                  <option value="hourly">Hourly</option>
                  <option value="6h">Every 6h</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              {/* Filter button */}
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors cursor-pointer bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm">
                <Filter className="w-4 h-4" />
                Filter
              </button>

              <div className="flex-1" />

              {/* View toggle */}
              <div className="flex items-center rounded-lg p-1 bg-gray-100">
                <button
                  onClick={() => setViewMode('query')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer text-sm font-medium ${
                    viewMode === 'query' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Query
                </button>
                <button
                  onClick={() => setViewMode('topic')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer text-sm font-medium ${
                    viewMode === 'topic' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Topic
                </button>
              </div>

              {/* Search */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg w-64 bg-white border border-gray-200">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none flex-1 text-sm text-gray-900 placeholder:text-gray-400"
                />
              </div>

              {/* Edit Topics button */}
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors cursor-pointer bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm">
                <Pencil className="w-4 h-4" />
                Edit Topics
              </button>
            </div>
          </header>

          {/* Table */}
          <div className="flex-1 overflow-auto bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="sticky top-0 px-4 py-3 text-left bg-white" style={{ width: 40 }}>
                    <button onClick={toggleSelectAll} className="cursor-pointer">
                      {selectedIds.size === filteredTopics.length && filteredTopics.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-gray-700" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-300" />
                      )}
                    </button>
                  </th>
                  <th className="sticky top-0 px-4 py-3 text-left bg-white text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Query
                  </th>
                  <th className="sticky top-0 px-4 py-3 text-left bg-white text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: 160 }}>
                    Topic
                  </th>
                  <th className="sticky top-0 px-4 py-3 text-left bg-white text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: 140 }}>
                    Sources
                  </th>
                  <th className="sticky top-0 px-4 py-3 text-left bg-white text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: 100 }}>
                    Cadence
                  </th>
                  <th className="sticky top-0 px-4 py-3 text-left bg-white text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: 100 }}>
                    Last Run
                  </th>
                  <th className="sticky top-0 px-4 py-3 text-center bg-white text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: 80 }}>
                    New
                  </th>
                  <th className="sticky top-0 px-4 py-3 text-center bg-white text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: 70 }}>
                    Total
                  </th>
                  <th className="sticky top-0 px-4 py-3 text-center bg-white text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: 70 }}>
                    Status
                  </th>
                  <th className="sticky top-0 px-4 py-3 bg-white" style={{ width: 50 }} />
                </tr>
              </thead>
              <tbody>
                {filteredTopics.map((topic) => {
                  const topicColor = topicColors[topic.topic] || { bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF' }
                  const isSelected = selectedIds.has(topic.id)
                  const sources = getSourcesByIds(topic.sourceIds)
                  
                  return (
                    <tr 
                      key={topic.id}
                      onClick={() => handleRowClick(topic)}
                      className={`border-b border-gray-100 transition-colors cursor-pointer ${
                        isSelected ? 'bg-gray-50' : 'hover:bg-gray-50'
                      } ${topic.status === 'paused' ? 'opacity-60' : ''} ${
                        selectedTopic?.id === topic.id ? 'bg-blue-50 hover:bg-blue-50' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3">
                        <button onClick={(e) => toggleSelect(topic.id, e)} className="cursor-pointer">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-gray-700" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-300" />
                          )}
                        </button>
                      </td>

                      {/* Query */}
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-900">{topic.query}</span>
                      </td>

                      {/* Topic */}
                      <td className="px-4 py-3">
                        <div 
                          className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full"
                          style={{ background: topicColor.bg }}
                        >
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ background: topicColor.dot }}
                          />
                          <span className="text-xs font-medium" style={{ color: topicColor.text }}>
                            {topic.topic}
                          </span>
                        </div>
                      </td>

                      {/* Sources - Brandfetch logos */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {sources.slice(0, 4).map((source) => (
                            <div
                              key={source!.id}
                              className="w-6 h-6 rounded border border-gray-100 flex items-center justify-center bg-white"
                              title={source!.name}
                            >
                              <SourceLogo domain={source!.domain} size={16} />
                            </div>
                          ))}
                          {sources.length > 4 && (
                            <div className="w-6 h-6 rounded border border-gray-100 flex items-center justify-center bg-gray-50 text-xs text-gray-500">
                              +{sources.length - 4}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Cadence */}
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-500">
                          {formatCadence(topic.cadence)}
                        </span>
                      </td>

                      {/* Last Run */}
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-500">
                          {formatLastRun(topic.lastRun)}
                        </span>
                      </td>

                      {/* New Findings */}
                      <td className="px-4 py-3 text-center">
                        {topic.newFindings > 0 ? (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold min-w-[24px]">
                            {topic.newFindings}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-300">—</span>
                        )}
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-gray-500">
                          {topic.totalFindings}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                          topic.status === 'active' ? 'bg-emerald-50' : 'bg-gray-100'
                        }`}>
                          {topic.status === 'active' ? (
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          ) : (
                            <Pause className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setMenuOpenId(menuOpenId === topic.id ? null : topic.id)
                            }}
                            className="p-1 rounded transition-colors cursor-pointer text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {menuOpenId === topic.id && (
                            <div className="absolute right-0 top-full mt-1 w-40 rounded-lg shadow-lg z-50 overflow-hidden bg-white border border-gray-200">
                              <button
                                onClick={(e) => { e.stopPropagation(); setMenuOpenId(null) }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors cursor-pointer text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <RefreshCw className="w-4 h-4" />
                                Run Now
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleRowClick(topic); setMenuOpenId(null) }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors cursor-pointer text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Eye className="w-4 h-4" />
                                View Findings
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleToggleStatus(topic.id) }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors cursor-pointer text-sm text-gray-700 hover:bg-gray-50"
                              >
                                {topic.status === 'active' ? (
                                  <>
                                    <BellOff className="w-4 h-4" />
                                    Pause
                                  </>
                                ) : (
                                  <>
                                    <Bell className="w-4 h-4" />
                                    Resume
                                  </>
                                )}
                              </button>
                              <div className="h-px bg-gray-100 my-1" />
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(topic.id) }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors cursor-pointer text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filteredTopics.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-gray-100">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  No tracked topics
                </h3>
                <p className="text-sm text-gray-500 mb-5">
                  Add a topic to start monitoring across your data sources.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Topic
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Side Pane */}
        {selectedTopic && (
          <TopicSidePane 
            topic={selectedTopic} 
            onClose={() => setSelectedTopic(null)}
            onUpdateSources={(sourceIds) => {
              setTopics(prev => prev.map(t => 
                t.id === selectedTopic.id ? { ...t, sourceIds } : t
              ))
              setSelectedTopic({ ...selectedTopic, sourceIds })
            }}
          />
        )}

        {/* Click outside to close menu */}
        {menuOpenId && (
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpenId(null)}
          />
        )}

        {/* Add Topic Modal */}
        {showAddModal && (
          <AddTopicModal 
            onClose={() => setShowAddModal(false)} 
            onAdd={(newTopic) => {
              setTopics(prev => [newTopic, ...prev])
              setShowAddModal(false)
            }}
          />
        )}
      </div>
    </div>
  )
}

// Side Pane Component
function TopicSidePane({ 
  topic, 
  onClose,
  onUpdateSources 
}: { 
  topic: TrackedTopic
  onClose: () => void
  onUpdateSources: (sourceIds: string[]) => void
}) {
  const [activeTab, setActiveTab] = useState<'findings' | 'sources'>('findings')
  const [localSourceIds, setLocalSourceIds] = useState(topic.sourceIds)
  const topicColor = topicColors[topic.topic] || { bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF' }

  // Update local state when topic changes
  useEffect(() => {
    setLocalSourceIds(topic.sourceIds)
  }, [topic.id, topic.sourceIds])

  const toggleSource = (id: string) => {
    const newIds = localSourceIds.includes(id) 
      ? localSourceIds.filter(s => s !== id)
      : [...localSourceIds, id]
    setLocalSourceIds(newIds)
    onUpdateSources(newIds)
  }

  return (
    <div className="w-[480px] border-l border-gray-200 bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Query</p>
            <h2 className="text-base font-semibold text-gray-900 leading-snug">{topic.query}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Tags row */}
        <div className="flex items-center gap-2 mt-3">
          <div 
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
            style={{ background: topicColor.bg, color: topicColor.text }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: topicColor.dot }} />
            {topic.topic}
          </div>
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">
            <Clock className="w-3 h-3" />
            {topic.cadence === 'hourly' ? 'Hourly' : topic.cadence === '6h' ? 'Every 6h' : topic.cadence === 'daily' ? 'Daily' : 'Weekly'}
          </div>
          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${
            topic.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {topic.status === 'active' ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active
              </>
            ) : (
              <>
                <Pause className="w-3 h-3" />
                Paused
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('findings')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
            activeTab === 'findings' 
              ? 'text-gray-900 border-b-2 border-gray-900' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Findings
          {topic.newFindings > 0 && (
            <span className="ml-2 px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
              {topic.newFindings} new
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('sources')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
            activeTab === 'sources' 
              ? 'text-gray-900 border-b-2 border-gray-900' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Sources
          <span className="ml-2 text-gray-400">({localSourceIds.length})</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'findings' ? (
          <div className="p-4">
            {topic.findings && topic.findings.length > 0 ? (
              <div className="space-y-3">
                {topic.findings.map((finding) => {
                  const source = AVAILABLE_SOURCES.find(s => s.id === finding.source)
                  return (
                    <div 
                      key={finding.id}
                      className={`p-3 rounded-lg border transition-colors cursor-pointer hover:border-gray-300 ${
                        finding.isNew ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {source && (
                          <div className="flex-shrink-0 w-8 h-8 rounded border border-gray-100 flex items-center justify-center bg-white">
                            <SourceLogo domain={source.domain} size={20} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {finding.isNew && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-100 text-emerald-700">
                                New
                              </span>
                            )}
                            <span className="text-xs text-gray-400">{finding.date}</span>
                          </div>
                          <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                            {finding.title}
                          </h4>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {finding.snippet}
                          </p>
                        </div>
                        <button className="flex-shrink-0 p-1 rounded hover:bg-gray-100 cursor-pointer text-gray-400 hover:text-gray-600">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-gray-100">
                  <AlertCircle className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">No findings yet</p>
                <p className="text-xs text-gray-400 mt-1">Check back after the next scheduled run</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">
            <p className="text-xs text-gray-500 mb-3">Select the sources to monitor for this topic:</p>
            <div className="space-y-2">
              {AVAILABLE_SOURCES.map((source) => {
                const isSelected = localSourceIds.includes(source.id)
                return (
                  <button
                    key={source.id}
                    onClick={() => toggleSource(source.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-gray-50 border-gray-300' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-8 h-8 rounded border border-gray-100 flex items-center justify-center bg-white">
                      <SourceLogo domain={source.domain} size={20} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-gray-900">{source.name}</p>
                      <p className="text-xs text-gray-400">{source.domain}</p>
                    </div>
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-gray-700" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-300" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Add Topic Modal
function AddTopicModal({ onClose, onAdd }: { onClose: () => void; onAdd: (topic: TrackedTopic) => void }) {
  const [query, setQuery] = useState('')
  const [topic, setTopic] = useState('Geopolitical')
  const [cadence, setCadence] = useState<'hourly' | '6h' | 'daily' | 'weekly'>('daily')
  const [sourceIds, setSourceIds] = useState<string[]>(['reuters', 'bloomberg'])

  const toggleSource = (id: string) => {
    if (sourceIds.includes(id)) {
      setSourceIds(sourceIds.filter(s => s !== id))
    } else {
      setSourceIds([...sourceIds, id])
    }
  }

  const handleSubmit = () => {
    if (!query.trim()) return
    
    const newTopic: TrackedTopic = {
      id: Date.now().toString(),
      query: query.trim(),
      topic,
      sourceIds,
      cadence,
      lastRun: null,
      nextRun: new Date(Date.now() + 3600000).toISOString(),
      newFindings: 0,
      totalFindings: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    }
    
    onAdd(newTopic)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-xl overflow-hidden bg-white shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Add Tracked Topic</h2>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Query */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Query
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Taiwan semiconductor supply chain disruptions"
              className="w-full px-3 py-2 rounded-lg outline-none transition-colors border border-gray-200 focus:border-gray-400 text-gray-900 text-sm placeholder:text-gray-400"
            />
          </div>

          {/* Topic */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Topic Category
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 rounded-lg outline-none border border-gray-200 text-gray-900 text-sm cursor-pointer"
            >
              {Object.keys(topicColors).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Sources */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Sources
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SOURCES.slice(0, 6).map((source) => (
                <button
                  key={source.id}
                  onClick={() => toggleSource(source.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer border ${
                    sourceIds.includes(source.id)
                      ? 'bg-gray-100 border-gray-300'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <SourceLogo domain={source.domain} size={16} />
                  <span className="text-sm text-gray-700">{source.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cadence */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Cadence
            </label>
            <div className="flex gap-2">
              {[
                { value: 'hourly' as const, label: 'Hourly' },
                { value: '6h' as const, label: 'Every 6h' },
                { value: 'daily' as const, label: 'Daily' },
                { value: 'weekly' as const, label: 'Weekly' },
              ].map(c => (
                <button
                  key={c.value}
                  onClick={() => setCadence(c.value)}
                  className={`px-3 py-2 rounded-lg transition-colors cursor-pointer border text-sm ${
                    cadence === c.value
                      ? 'bg-gray-100 border-gray-300 text-gray-900'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg transition-colors cursor-pointer bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!query.trim()}
            className="px-4 py-2 rounded-lg transition-colors cursor-pointer bg-gray-800 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium"
          >
            Add Topic
          </button>
        </div>
      </div>
    </div>
  )
}