// src/app/(dashboard)/track/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, Plus, MoreVertical, Pause, Trash2,
  Clock, Globe, X,
  Pencil, RefreshCw, Bell, BellOff, Eye,
  ChevronDown, ExternalLink, Calendar,
  CheckSquare, Square, TrendingUp, AlertCircle, Loader2
} from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import { useAuth } from '@/lib/hooks/useAuth'

// Topic colors - muted enterprise palette (matching Search page document types)
const topicColors: Record<string, { bg: string; text: string; dot: string }> = {
  'Geopolitical': { bg: '#EEF2F6', text: '#4B5C6B', dot: '#7C9EB2' },
  'Financial': { bg: '#E8F4EF', text: '#5B7B6B', dot: '#8BAF9C' },
  'Technology': { bg: '#EEF2F6', text: '#4B5C6B', dot: '#7C9EB2' },
  'Regulatory': { bg: '#FDF6E3', text: '#8B7355', dot: '#C9A87C' },
  'Market': { bg: '#F3F0F7', text: '#6B5B7B', dot: '#9B8EC4' },
  'Competitive': { bg: '#FAECEC', text: '#8B6B6B', dot: '#C49B9B' },
  'General': { bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF' },
}

interface Source {
  id: string
  name: string
  domain: string
}

interface Finding {
  id: string
  source_id: string
  title: string
  snippet: string
  url: string
  published_at: string | null
  is_new: boolean
  created_at: string
}

interface TrackedTopic {
  id: string
  query: string
  topic: string
  source_ids: string[]
  cadence: 'hourly' | '6h' | 'daily' | 'weekly'
  last_run_at: string | null
  next_run_at: string
  new_findings_count: number
  total_findings_count: number
  status: 'active' | 'paused'
  created_at: string
  findings?: Finding[]
}

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
      style={{ width: size, height: size }}
      className="rounded object-cover"
      onError={() => setError(true)}
    />
  )
}

export default function TrackPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  const [topics, setTopics] = useState<TrackedTopic[]>([])
  const [availableSources, setAvailableSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('query')
  const [searchQuery, setSearchQuery] = useState('')
  const [cadenceFilter, setCadenceFilter] = useState<CadenceFilter>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showAddModal, setShowAddModal] = useState(false)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<TrackedTopic | null>(null)
  const [runningId, setRunningId] = useState<string | null>(null)

  // Fetch topics from API
  const fetchTopics = useCallback(async () => {
    try {
      const response = await fetch('/api/track')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setTopics(data.topics || [])
      setAvailableSources(data.sources || [])
    } catch (error) {
      console.error('Error fetching topics:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      fetchTopics()
    }
  }, [user, authLoading, router, fetchTopics])

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

  const handleToggleStatus = async (id: string) => {
    const topic = topics.find(t => t.id === id)
    if (!topic) return

    const newStatus = topic.status === 'active' ? 'paused' : 'active'
    
    try {
      const response = await fetch(`/api/track/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (response.ok) {
        setTopics(prev => prev.map(t => 
          t.id === id ? { ...t, status: newStatus } : t
        ))
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
    setMenuOpenId(null)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/track/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setTopics(prev => prev.filter(t => t.id !== id))
        if (selectedTopic?.id === id) setSelectedTopic(null)
      }
    } catch (error) {
      console.error('Error deleting topic:', error)
    }
    setMenuOpenId(null)
  }

  const handleRunNow = async (id: string) => {
    setRunningId(id)
    setMenuOpenId(null)
    
    try {
      const response = await fetch(`/api/track/${id}/run`, { method: 'POST' })
      if (response.ok) {
        // Refresh topics to get updated counts
        await fetchTopics()
      }
    } catch (error) {
      console.error('Error running topic:', error)
    } finally {
      setRunningId(null)
    }
  }

  const handleRowClick = (topic: TrackedTopic) => {
    setSelectedTopic(topic)
  }

  const getSourcesByIds = (ids: string[]) => {
    return ids.map(id => availableSources.find(s => s.id === id)).filter(Boolean) as Source[]
  }

  const handleAddTopic = async (newTopic: { query: string; topic: string; sourceIds: string[]; cadence: string }) => {
    try {
      const response = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTopic),
      })
      
      if (response.ok) {
        const data = await response.json()
        setTopics(prev => [data.topic, ...prev])
        setShowAddModal(false)
      }
    } catch (error) {
      console.error('Error creating topic:', error)
    }
  }

  const handleUpdateSources = async (topicId: string, sourceIds: string[]) => {
    try {
      const response = await fetch(`/api/track/${topicId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceIds }),
      })
      
      if (response.ok) {
        setTopics(prev => prev.map(t => 
          t.id === topicId ? { ...t, source_ids: sourceIds } : t
        ))
        if (selectedTopic?.id === topicId) {
          setSelectedTopic({ ...selectedTopic, source_ids: sourceIds })
        }
      }
    } catch (error) {
      console.error('Error updating sources:', error)
    }
  }

  if (authLoading || !user) {
    return null
  }

  if (loading) {
    return (
      <div className="h-screen flex bg-white">
        <Sidebar connectedSourceCount={3} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-white">
      <Sidebar connectedSourceCount={3} />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Main content */}
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-200 ${selectedTopic ? 'mr-0' : ''}`}>
          {/* Header - compact like Search page */}
          <div className="flex items-center justify-between px-4 h-12 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-900">Track</span>
              <span className="text-xs text-gray-400">{topics.length} topics</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
              >
                <Plus className="w-4 h-4" />
                Add Topic
              </button>
            </div>
          </div>

          {/* Toolbar row */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              {/* Cadence filter */}
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-gray-200 bg-white text-sm">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={cadenceFilter}
                  onChange={(e) => setCadenceFilter(e.target.value as CadenceFilter)}
                  className="bg-transparent border-none outline-none text-sm text-gray-600 cursor-pointer"
                >
                  <option value="all">All</option>
                  <option value="hourly">Hourly</option>
                  <option value="6h">Every 6h</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              {/* View toggle */}
              <div className="flex items-center rounded border border-gray-200 bg-white overflow-hidden">
                <button
                  onClick={() => setViewMode('query')}
                  className={`px-2.5 py-1.5 text-xs font-medium cursor-pointer ${
                    viewMode === 'query' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Query
                </button>
                <button
                  onClick={() => setViewMode('topic')}
                  className={`px-2.5 py-1.5 text-xs font-medium cursor-pointer ${
                    viewMode === 'topic' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Topic
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded border border-gray-200 bg-white w-56">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none flex-1 text-sm text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-white">
                  <th className="px-4 py-2.5 text-left" style={{ width: 40 }}>
                    <button onClick={toggleSelectAll} className="cursor-pointer">
                      {selectedIds.size === filteredTopics.length && filteredTopics.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-gray-700" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-300" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Query
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: 140 }}>
                    Topic
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: 140 }}>
                    Sources
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: 90 }}>
                    Cadence
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: 90 }}>
                    Last Run
                  </th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: 60 }}>
                    New
                  </th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: 60 }}>
                    Total
                  </th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: 60 }}>
                    Status
                  </th>
                  <th className="px-4 py-2.5" style={{ width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {filteredTopics.map((topic) => {
                  const topicColor = topicColors[topic.topic] || { bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF' }
                  const isSelected = selectedIds.has(topic.id)
                  const sources = getSourcesByIds(topic.source_ids)
                  const isRunning = runningId === topic.id
                  
                  return (
                    <tr 
                      key={topic.id}
                      onClick={() => handleRowClick(topic)}
                      className={`border-b border-gray-100 transition-colors cursor-pointer ${
                        selectedTopic?.id === topic.id ? 'bg-blue-50' : isSelected ? 'bg-gray-50' : 'hover:bg-gray-50'
                      } ${topic.status === 'paused' ? 'opacity-50' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-2.5">
                        <button onClick={(e) => toggleSelect(topic.id, e)} className="cursor-pointer">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-gray-700" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-300" />
                          )}
                        </button>
                      </td>

                      {/* Query */}
                      <td className="px-4 py-2.5">
                        <span className="text-sm text-gray-900">{topic.query}</span>
                      </td>

                      {/* Topic */}
                      <td className="px-4 py-2.5">
                        <div 
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium"
                          style={{ background: topicColor.bg, color: topicColor.text }}
                        >
                          {topic.topic}
                        </div>
                      </td>

                      {/* Sources - Brandfetch logos */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          {sources.slice(0, 3).map((source) => (
                            <div
                              key={source.id}
                              className="w-5 h-5 rounded border border-gray-100 flex items-center justify-center bg-white"
                              title={source.name}
                            >
                              <SourceLogo domain={source.domain} size={14} />
                            </div>
                          ))}
                          {sources.length > 3 && (
                            <span className="text-xs text-gray-400 ml-0.5">+{sources.length - 3}</span>
                          )}
                        </div>
                      </td>

                      {/* Cadence */}
                      <td className="px-4 py-2.5">
                        <span className="text-xs text-gray-500">
                          {formatCadence(topic.cadence)}
                        </span>
                      </td>

                      {/* Last Run */}
                      <td className="px-4 py-2.5">
                        <span className="text-xs text-gray-500">
                          {formatLastRun(topic.last_run_at)}
                        </span>
                      </td>

                      {/* New Findings */}
                      <td className="px-4 py-2.5 text-center">
                        {topic.new_findings_count > 0 ? (
                          <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-medium min-w-[20px]">
                            {topic.new_findings_count}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>

                      {/* Total */}
                      <td className="px-4 py-2.5 text-center">
                        <span className="text-xs text-gray-500">
                          {topic.total_findings_count}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-2.5 text-center">
                        {isRunning ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400 mx-auto" />
                        ) : (
                          <div className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${
                            topic.status === 'active' ? 'bg-emerald-50' : 'bg-gray-100'
                          }`}>
                            {topic.status === 'active' ? (
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            ) : (
                              <Pause className="w-2.5 h-2.5 text-gray-400" />
                            )}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-2.5">
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
                                onClick={(e) => { e.stopPropagation(); handleRunNow(topic.id) }}
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
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-3 bg-gray-100">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  No tracked topics
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Add a topic to start monitoring.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
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
            sources={availableSources}
            onClose={() => setSelectedTopic(null)}
            onUpdateSources={(sourceIds) => handleUpdateSources(selectedTopic.id, sourceIds)}
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
            sources={availableSources}
            onClose={() => setShowAddModal(false)} 
            onAdd={handleAddTopic}
          />
        )}
      </div>
    </div>
  )
}

// Side Pane Component
function TopicSidePane({ 
  topic, 
  sources,
  onClose,
  onUpdateSources 
}: { 
  topic: TrackedTopic
  sources: Source[]
  onClose: () => void
  onUpdateSources: (sourceIds: string[]) => void
}) {
  const [activeTab, setActiveTab] = useState<'findings' | 'sources'>('findings')
  const [localSourceIds, setLocalSourceIds] = useState(topic.source_ids)
  const topicColor = topicColors[topic.topic] || { bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF' }

  // Update local state when topic changes
  useEffect(() => {
    setLocalSourceIds(topic.source_ids)
  }, [topic.id, topic.source_ids])

  const toggleSource = (id: string) => {
    const newIds = localSourceIds.includes(id) 
      ? localSourceIds.filter(s => s !== id)
      : [...localSourceIds, id]
    setLocalSourceIds(newIds)
    onUpdateSources(newIds)
  }

  return (
    <div className="w-[400px] border-l border-gray-200 bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Query</p>
            <h2 className="text-sm font-medium text-gray-900 leading-snug">{topic.query}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 cursor-pointer text-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Tags row */}
        <div className="flex items-center gap-1.5 mt-2">
          <div 
            className="inline-flex items-center px-2 py-0.5 rounded text-xs"
            style={{ background: topicColor.bg, color: topicColor.text }}
          >
            {topic.topic}
          </div>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-gray-500 text-xs">
            <Clock className="w-3 h-3" />
            {topic.cadence === 'hourly' ? 'Hourly' : topic.cadence === '6h' ? '6h' : topic.cadence === 'daily' ? 'Daily' : 'Weekly'}
          </div>
          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
            topic.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
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
      <div className="flex-shrink-0 flex border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => setActiveTab('findings')}
          className={`flex-1 px-4 py-2 text-xs font-medium cursor-pointer ${
            activeTab === 'findings' 
              ? 'text-gray-900 bg-white border-b-2 border-gray-900 -mb-px' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Findings
          {topic.new_findings_count > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-medium">
              {topic.new_findings_count}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('sources')}
          className={`flex-1 px-4 py-2 text-xs font-medium cursor-pointer ${
            activeTab === 'sources' 
              ? 'text-gray-900 bg-white border-b-2 border-gray-900 -mb-px' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Sources ({localSourceIds.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'findings' ? (
          <div className="p-3">
            {topic.findings && topic.findings.length > 0 ? (
              <div className="space-y-2">
                {topic.findings.map((finding) => {
                  const source = sources.find(s => s.id === finding.source_id)
                  return (
                    <div 
                      key={finding.id}
                      className={`p-2.5 rounded border cursor-pointer hover:border-gray-300 ${
                        finding.is_new ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {source && (
                          <div className="flex-shrink-0 w-6 h-6 rounded border border-gray-100 flex items-center justify-center bg-white">
                            <SourceLogo domain={source.domain} size={14} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            {finding.is_new && (
                              <span className="px-1 py-0.5 rounded text-[9px] font-medium uppercase bg-emerald-100 text-emerald-700">
                                New
                              </span>
                            )}
                            <span className="text-[10px] text-gray-400">
                              {finding.published_at || new Date(finding.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="text-xs font-medium text-gray-900 mb-0.5 line-clamp-2">
                            {finding.title}
                          </h4>
                          <p className="text-[11px] text-gray-500 line-clamp-2">
                            {finding.snippet}
                          </p>
                        </div>
                        <a 
                          href={finding.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-shrink-0 p-1 rounded hover:bg-gray-100 cursor-pointer text-gray-400"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2 bg-gray-100">
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500">No findings yet</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Check back after the next run</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3">
            <p className="text-[10px] text-gray-500 mb-2">Select sources to monitor:</p>
            <div className="space-y-1.5">
              {sources.map((source) => {
                const isSelected = localSourceIds.includes(source.id)
                return (
                  <button
                    key={source.id}
                    onClick={() => toggleSource(source.id)}
                    className={`w-full flex items-center gap-2.5 p-2 rounded border cursor-pointer ${
                      isSelected 
                        ? 'bg-gray-50 border-gray-300' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-6 h-6 rounded border border-gray-100 flex items-center justify-center bg-white">
                      <SourceLogo domain={source.domain} size={14} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs font-medium text-gray-900">{source.name}</p>
                      <p className="text-[10px] text-gray-400">{source.domain}</p>
                    </div>
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-gray-700" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-300" />
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
function AddTopicModal({ 
  sources,
  onClose, 
  onAdd 
}: { 
  sources: Source[]
  onClose: () => void
  onAdd: (topic: { query: string; topic: string; sourceIds: string[]; cadence: string }) => void 
}) {
  const [query, setQuery] = useState('')
  const [topic, setTopic] = useState('Geopolitical')
  const [cadence, setCadence] = useState<'hourly' | '6h' | 'daily' | 'weekly'>('daily')
  const [sourceIds, setSourceIds] = useState<string[]>(['reuters', 'bloomberg'])
  const [submitting, setSubmitting] = useState(false)

  const toggleSource = (id: string) => {
    if (sourceIds.includes(id)) {
      setSourceIds(sourceIds.filter(s => s !== id))
    } else {
      setSourceIds([...sourceIds, id])
    }
  }

  const handleSubmit = async () => {
    if (!query.trim() || submitting) return
    setSubmitting(true)
    await onAdd({ query: query.trim(), topic, sourceIds, cadence })
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-md rounded-lg overflow-hidden bg-white shadow-2xl">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Add Tracked Topic</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 cursor-pointer text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Query */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">
              Query
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Taiwan semiconductor supply chain"
              className="w-full px-3 py-2 rounded border border-gray-200 outline-none focus:border-gray-400 text-sm text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* Topic */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">
              Category
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 rounded border border-gray-200 outline-none text-sm text-gray-900 cursor-pointer"
            >
              {Object.keys(topicColors).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Sources */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">
              Sources
            </label>
            <div className="flex flex-wrap gap-1.5">
              {sources.slice(0, 6).map((source) => (
                <button
                  key={source.id}
                  onClick={() => toggleSource(source.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-colors cursor-pointer border text-xs ${
                    sourceIds.includes(source.id)
                      ? 'bg-gray-100 border-gray-300 text-gray-900'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <SourceLogo domain={source.domain} size={14} />
                  {source.name}
                </button>
              ))}
            </div>
          </div>

          {/* Cadence */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">
              Cadence
            </label>
            <div className="flex gap-1.5">
              {[
                { value: 'hourly' as const, label: 'Hourly' },
                { value: '6h' as const, label: '6h' },
                { value: 'daily' as const, label: 'Daily' },
                { value: 'weekly' as const, label: 'Weekly' },
              ].map(c => (
                <button
                  key={c.value}
                  onClick={() => setCadence(c.value)}
                  className={`px-3 py-1.5 rounded transition-colors cursor-pointer border text-xs ${
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

        <div className="px-5 py-3 flex justify-end gap-2 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer text-sm text-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!query.trim() || submitting}
            className="px-3 py-1.5 rounded border border-gray-300 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer text-sm text-white font-medium flex items-center gap-1.5"
          >
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Add
          </button>
        </div>
      </div>
    </div>
  )
}