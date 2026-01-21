// src/app/(dashboard)/track/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, Plus, Settings, MoreVertical, Play, Pause, Trash2,
  ChevronDown, Filter, Clock, Calendar, Globe, FileText,
  Building2, Newspaper, TrendingUp, CheckSquare, Square,
  Pencil, RefreshCw, Bell, BellOff, Eye
} from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import { useAuth } from '@/lib/hooks/useAuth'

// Color palette
const colors = {
  bg: '#0A0A0A',
  bgCard: '#141414',
  bgHover: '#1A1A1A',
  bgElevated: '#1E1E1E',
  border: '#262626',
  borderLight: '#333333',
  text: '#FAFAFA',
  textMuted: '#888888',
  textDim: '#555555',
  accent: '#8B5CF6',
  accentMuted: 'rgba(139, 92, 246, 0.15)',
  success: '#10B981',
  successMuted: 'rgba(16, 185, 129, 0.15)',
  warning: '#F59E0B',
  warningMuted: 'rgba(245, 158, 11, 0.15)',
  blue: '#3B82F6',
  blueMuted: 'rgba(59, 130, 246, 0.15)',
  pink: '#EC4899',
  pinkMuted: 'rgba(236, 72, 153, 0.15)',
  cyan: '#06B6D4',
  cyanMuted: 'rgba(6, 182, 212, 0.15)',
}

// Topic colors for visual grouping
const topicColors: Record<string, { bg: string; text: string; dot: string }> = {
  'Geopolitical': { bg: colors.pinkMuted, text: '#EC4899', dot: '#EC4899' },
  'Financial': { bg: colors.successMuted, text: '#10B981', dot: '#10B981' },
  'Technology': { bg: colors.blueMuted, text: '#3B82F6', dot: '#3B82F6' },
  'Regulatory': { bg: colors.warningMuted, text: '#F59E0B', dot: '#F59E0B' },
  'Market': { bg: colors.accentMuted, text: '#8B5CF6', dot: '#8B5CF6' },
  'Competitive': { bg: colors.cyanMuted, text: '#06B6D4', dot: '#06B6D4' },
}

// Source icons
const sourceIcons: Record<string, typeof Globe> = {
  'Web': Globe,
  'SEC': Building2,
  'News': Newspaper,
  'Documents': FileText,
}

interface TrackedTopic {
  id: string
  query: string
  topic: string
  sources: string[]
  cadence: 'hourly' | '6h' | 'daily' | 'weekly'
  lastRun: string | null
  nextRun: string
  newFindings: number
  totalFindings: number
  status: 'active' | 'paused'
  createdAt: string
}

// Mock data
const MOCK_TOPICS: TrackedTopic[] = [
  {
    id: '1',
    query: 'Taiwan semiconductor supply chain disruptions',
    topic: 'Geopolitical',
    sources: ['Web', 'News', 'SEC'],
    cadence: 'daily',
    lastRun: '2026-01-20T18:00:00Z',
    nextRun: '2026-01-21T18:00:00Z',
    newFindings: 3,
    totalFindings: 47,
    status: 'active',
    createdAt: '2024-12-01T00:00:00Z',
  },
  {
    id: '2',
    query: 'Chinese military activity South China Sea',
    topic: 'Geopolitical',
    sources: ['Web', 'News'],
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
    sources: ['SEC', 'News', 'Web'],
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
    sources: ['News', 'Web'],
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
    sources: ['Web', 'News'],
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
    sources: ['SEC', 'News'],
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
    sources: ['Web', 'News'],
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
    sources: ['News', 'Web'],
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

  // Group by topic if in topic view
  const groupedByTopic = viewMode === 'topic' 
    ? filteredTopics.reduce((acc, t) => {
        if (!acc[t.topic]) acc[t.topic] = []
        acc[t.topic].push(t)
        return acc
      }, {} as Record<string, TrackedTopic[]>)
    : null

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredTopics.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredTopics.map(t => t.id)))
    }
  }

  const toggleSelect = (id: string) => {
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
  }

  const handleRunNow = (id: string) => {
    // Would trigger immediate run
    setMenuOpenId(null)
  }

  if (authLoading || !user) {
    return null
  }

  return (
    <div className="h-screen flex" style={{ background: colors.bg }}>
      <Sidebar connectedSourceCount={3} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header 
          className="flex-shrink-0 px-6 py-5"
          style={{ borderBottom: `1px solid ${colors.border}` }}
        >
          <div className="flex items-center justify-between mb-5">
            <h1 style={{ fontSize: 24, fontWeight: 600, color: colors.text }}>Track</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
              style={{ 
                background: colors.accent, 
                color: 'white',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              <Plus className="w-4 h-4" />
              Add Topic
            </button>
          </div>

          {/* Filters row */}
          <div className="flex items-center gap-3">
            {/* Cadence filter */}
            <div 
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg"
              style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
            >
              <Clock className="w-4 h-4" style={{ color: colors.textDim }} />
              <select
                value={cadenceFilter}
                onChange={(e) => setCadenceFilter(e.target.value as CadenceFilter)}
                className="bg-transparent border-none outline-none text-sm"
                style={{ color: colors.text }}
              >
                <option value="all">All Cadences</option>
                <option value="hourly">Hourly</option>
                <option value="6h">Every 6h</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            {/* Filter button */}
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors"
              style={{ 
                background: colors.bgCard, 
                border: `1px solid ${colors.border}`,
                color: colors.textMuted,
                fontSize: 14,
              }}
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>

            <div className="flex-1" />

            {/* View toggle */}
            <div 
              className="flex items-center rounded-lg p-1"
              style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
            >
              <button
                onClick={() => setViewMode('query')}
                className="px-3 py-1 rounded-md transition-colors"
                style={{ 
                  fontSize: 13,
                  fontWeight: 500,
                  background: viewMode === 'query' ? colors.bgElevated : 'transparent',
                  color: viewMode === 'query' ? colors.text : colors.textMuted,
                }}
              >
                Query
              </button>
              <button
                onClick={() => setViewMode('topic')}
                className="px-3 py-1 rounded-md transition-colors"
                style={{ 
                  fontSize: 13,
                  fontWeight: 500,
                  background: viewMode === 'topic' ? colors.bgElevated : 'transparent',
                  color: viewMode === 'topic' ? colors.text : colors.textMuted,
                }}
              >
                Topic
              </button>
            </div>

            {/* Search */}
            <div 
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg w-64"
              style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
            >
              <Search className="w-4 h-4" style={{ color: colors.textDim }} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none flex-1 text-sm"
                style={{ color: colors.text }}
              />
            </div>

            {/* Edit Topics button */}
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors"
              style={{ 
                background: colors.bgCard, 
                border: `1px solid ${colors.border}`,
                color: colors.textMuted,
                fontSize: 14,
              }}
            >
              <Pencil className="w-4 h-4" />
              Edit Topics
            </button>
          </div>
        </header>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                <th className="sticky top-0 px-4 py-3 text-left" style={{ background: colors.bg, width: 40 }}>
                  <button onClick={toggleSelectAll}>
                    {selectedIds.size === filteredTopics.length && filteredTopics.length > 0 ? (
                      <CheckSquare className="w-4 h-4" style={{ color: colors.accent }} />
                    ) : (
                      <Square className="w-4 h-4" style={{ color: colors.textDim }} />
                    )}
                  </button>
                </th>
                <th 
                  className="sticky top-0 px-4 py-3 text-left"
                  style={{ background: colors.bg, fontSize: 12, fontWeight: 500, color: colors.textMuted }}
                >
                  Query
                </th>
                <th 
                  className="sticky top-0 px-4 py-3 text-left"
                  style={{ background: colors.bg, fontSize: 12, fontWeight: 500, color: colors.textMuted, width: 180 }}
                >
                  Topic
                </th>
                <th 
                  className="sticky top-0 px-4 py-3 text-left"
                  style={{ background: colors.bg, fontSize: 12, fontWeight: 500, color: colors.textMuted, width: 140 }}
                >
                  Sources
                </th>
                <th 
                  className="sticky top-0 px-4 py-3 text-left"
                  style={{ background: colors.bg, fontSize: 12, fontWeight: 500, color: colors.textMuted, width: 100 }}
                >
                  Cadence
                </th>
                <th 
                  className="sticky top-0 px-4 py-3 text-left"
                  style={{ background: colors.bg, fontSize: 12, fontWeight: 500, color: colors.textMuted, width: 100 }}
                >
                  Last Run
                </th>
                <th 
                  className="sticky top-0 px-4 py-3 text-center"
                  style={{ background: colors.bg, fontSize: 12, fontWeight: 500, color: colors.textMuted, width: 100 }}
                >
                  New
                </th>
                <th 
                  className="sticky top-0 px-4 py-3 text-center"
                  style={{ background: colors.bg, fontSize: 12, fontWeight: 500, color: colors.textMuted, width: 80 }}
                >
                  Total
                </th>
                <th 
                  className="sticky top-0 px-4 py-3 text-center"
                  style={{ background: colors.bg, fontSize: 12, fontWeight: 500, color: colors.textMuted, width: 80 }}
                >
                  Status
                </th>
                <th 
                  className="sticky top-0 px-4 py-3"
                  style={{ background: colors.bg, width: 50 }}
                />
              </tr>
            </thead>
            <tbody>
              {filteredTopics.map((topic) => {
                const topicColor = topicColors[topic.topic] || { bg: colors.bgCard, text: colors.textMuted, dot: colors.textDim }
                const isSelected = selectedIds.has(topic.id)
                
                return (
                  <tr 
                    key={topic.id}
                    className="transition-colors cursor-pointer"
                    style={{ 
                      borderBottom: `1px solid ${colors.border}`,
                      background: isSelected ? colors.bgHover : 'transparent',
                      opacity: topic.status === 'paused' ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = colors.bgHover
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3">
                      <button onClick={() => toggleSelect(topic.id)}>
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4" style={{ color: colors.accent }} />
                        ) : (
                          <Square className="w-4 h-4" style={{ color: colors.textDim }} />
                        )}
                      </button>
                    </td>

                    {/* Query */}
                    <td className="px-4 py-3">
                      <span style={{ fontSize: 14, color: colors.text }}>{topic.query}</span>
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
                        <span style={{ fontSize: 12, fontWeight: 500, color: topicColor.text }}>
                          {topic.topic}
                        </span>
                      </div>
                    </td>

                    {/* Sources */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {topic.sources.map((source, i) => {
                          const Icon = sourceIcons[source] || Globe
                          return (
                            <div
                              key={i}
                              className="w-6 h-6 rounded flex items-center justify-center"
                              style={{ background: colors.bgCard }}
                              title={source}
                            >
                              <Icon className="w-3.5 h-3.5" style={{ color: colors.textMuted }} />
                            </div>
                          )
                        })}
                      </div>
                    </td>

                    {/* Cadence */}
                    <td className="px-4 py-3">
                      <span style={{ fontSize: 13, color: colors.textMuted }}>
                        {formatCadence(topic.cadence)}
                      </span>
                    </td>

                    {/* Last Run */}
                    <td className="px-4 py-3">
                      <span style={{ fontSize: 13, color: colors.textMuted }}>
                        {formatLastRun(topic.lastRun)}
                      </span>
                    </td>

                    {/* New Findings */}
                    <td className="px-4 py-3 text-center">
                      {topic.newFindings > 0 ? (
                        <span 
                          className="inline-flex items-center justify-center px-2 py-0.5 rounded-full"
                          style={{ 
                            background: colors.successMuted, 
                            color: colors.success,
                            fontSize: 12,
                            fontWeight: 600,
                            minWidth: 24,
                          }}
                        >
                          {topic.newFindings}
                        </span>
                      ) : (
                        <span style={{ fontSize: 13, color: colors.textDim }}>—</span>
                      )}
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3 text-center">
                      <span style={{ fontSize: 13, color: colors.textMuted }}>
                        {topic.totalFindings}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <div 
                        className="inline-flex items-center justify-center w-6 h-6 rounded-full"
                        style={{ 
                          background: topic.status === 'active' ? colors.successMuted : colors.bgCard,
                        }}
                      >
                        {topic.status === 'active' ? (
                          <div className="w-2 h-2 rounded-full" style={{ background: colors.success }} />
                        ) : (
                          <Pause className="w-3 h-3" style={{ color: colors.textDim }} />
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
                          className="p-1 rounded transition-colors"
                          style={{ color: colors.textDim }}
                          onMouseEnter={(e) => e.currentTarget.style.background = colors.bgElevated}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {menuOpenId === topic.id && (
                          <div 
                            className="absolute right-0 top-full mt-1 w-40 rounded-lg shadow-xl z-50 overflow-hidden"
                            style={{ 
                              background: colors.bgElevated, 
                              border: `1px solid ${colors.border}` 
                            }}
                          >
                            <button
                              onClick={() => handleRunNow(topic.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors"
                              style={{ fontSize: 13, color: colors.text }}
                              onMouseEnter={(e) => e.currentTarget.style.background = colors.bgHover}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <RefreshCw className="w-4 h-4" />
                              Run Now
                            </button>
                            <button
                              onClick={() => {}}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors"
                              style={{ fontSize: 13, color: colors.text }}
                              onMouseEnter={(e) => e.currentTarget.style.background = colors.bgHover}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <Eye className="w-4 h-4" />
                              View Findings
                            </button>
                            <button
                              onClick={() => handleToggleStatus(topic.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors"
                              style={{ fontSize: 13, color: colors.text }}
                              onMouseEnter={(e) => e.currentTarget.style.background = colors.bgHover}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
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
                            <div style={{ height: 1, background: colors.border, margin: '4px 0' }} />
                            <button
                              onClick={() => handleDelete(topic.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors"
                              style={{ fontSize: 13, color: '#EF4444' }}
                              onMouseEnter={(e) => e.currentTarget.style.background = colors.bgHover}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
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
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: colors.bgCard }}
              >
                <Search className="w-8 h-8" style={{ color: colors.textDim }} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: colors.text, marginBottom: 8 }}>
                No tracked topics
              </h3>
              <p style={{ fontSize: 14, color: colors.textMuted, marginBottom: 20 }}>
                Add a topic to start monitoring across your data sources.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                style={{ 
                  background: colors.accent, 
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                <Plus className="w-4 h-4" />
                Add Topic
              </button>
            </div>
          )}
        </div>

        {/* Click outside to close menu */}
        {menuOpenId && (
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpenId(null)}
          />
        )}

        {/* Add Topic Modal - placeholder */}
        {showAddModal && (
          <AddTopicModal onClose={() => setShowAddModal(false)} />
        )}
      </div>
    </div>
  )
}

// Add Topic Modal
function AddTopicModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [topic, setTopic] = useState('Geopolitical')
  const [cadence, setCadence] = useState('daily')
  const [sources, setSources] = useState<string[]>(['Web', 'News'])

  const toggleSource = (source: string) => {
    if (sources.includes(source)) {
      setSources(sources.filter(s => s !== source))
    } else {
      setSources([...sources, source])
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-lg rounded-xl overflow-hidden"
        style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
      >
        <div className="px-6 py-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: colors.text }}>Add Tracked Topic</h2>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Query */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: colors.textMuted, display: 'block', marginBottom: 8 }}>
              Query
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Taiwan semiconductor supply chain disruptions"
              className="w-full px-3 py-2 rounded-lg outline-none transition-colors"
              style={{ 
                background: colors.bgHover, 
                border: `1px solid ${colors.border}`,
                color: colors.text,
                fontSize: 14,
              }}
            />
          </div>

          {/* Topic */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: colors.textMuted, display: 'block', marginBottom: 8 }}>
              Topic Category
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 rounded-lg outline-none"
              style={{ 
                background: colors.bgHover, 
                border: `1px solid ${colors.border}`,
                color: colors.text,
                fontSize: 14,
              }}
            >
              {Object.keys(topicColors).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Sources */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: colors.textMuted, display: 'block', marginBottom: 8 }}>
              Sources
            </label>
            <div className="flex gap-2">
              {Object.entries(sourceIcons).map(([name, Icon]) => (
                <button
                  key={name}
                  onClick={() => toggleSource(name)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
                  style={{ 
                    background: sources.includes(name) ? colors.accentMuted : colors.bgHover,
                    border: `1px solid ${sources.includes(name) ? colors.accent : colors.border}`,
                    color: sources.includes(name) ? colors.accent : colors.textMuted,
                    fontSize: 13,
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Cadence */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: colors.textMuted, display: 'block', marginBottom: 8 }}>
              Cadence
            </label>
            <div className="flex gap-2">
              {[
                { value: 'hourly', label: 'Hourly' },
                { value: '6h', label: 'Every 6h' },
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
              ].map(c => (
                <button
                  key={c.value}
                  onClick={() => setCadence(c.value)}
                  className="px-3 py-2 rounded-lg transition-colors"
                  style={{ 
                    background: cadence === c.value ? colors.accentMuted : colors.bgHover,
                    border: `1px solid ${cadence === c.value ? colors.accent : colors.border}`,
                    color: cadence === c.value ? colors.accent : colors.textMuted,
                    fontSize: 13,
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div 
          className="px-6 py-4 flex justify-end gap-3"
          style={{ borderTop: `1px solid ${colors.border}` }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{ 
              background: colors.bgHover,
              color: colors.textMuted,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{ 
              background: colors.accent,
              color: 'white',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Add Topic
          </button>
        </div>
      </div>
    </div>
  )
}
