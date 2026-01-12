// Route: src/app/(dashboard)/overview/page.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  AlertCircle, 
  Search, 
  FileText, 
  Database, 
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  X,
  RefreshCw,
  Clock,
  TrendingUp,
  Building2,
} from 'lucide-react'

// Mock data
const SOURCE_VERIFIED_ALERTS = [
  {
    id: '1',
    type: 'source_verified',
    claim: 'NVDA market cap',
    currentValue: '$1.2T',
    newValue: '$1.4T',
    source: 'PitchBook',
    sourceLogo: 'pitchbook.com',
    reportName: 'Q4 Revenue Model',
    reportId: 'r2',
    projectName: 'Nordic Telecoms',
    updatedAgo: '2h ago',
  },
  {
    id: '2',
    type: 'source_verified',
    claim: 'Acme Corp headcount',
    currentValue: '450',
    newValue: '512',
    source: 'LinkedIn',
    sourceLogo: 'linkedin.com',
    reportName: 'Company Profile',
    reportId: 'r1',
    projectName: 'Acme Corp DD',
    updatedAgo: '6h ago',
  },
]

const PROMPT_TRACKED_ALERTS = [
  {
    id: '3',
    type: 'prompt_tracked',
    claim: 'Taiwan Strait maritime activity',
    summary: 'Reuters reports "increased naval presence near median line"',
    reportName: 'Taiwan Strait Analysis',
    reportId: 'r3',
    projectName: 'Acme Corp DD',
    checkedAgo: '1h ago',
  },
]

const RECENT_ACTIVITY = [
  {
    id: 'a1',
    action: 'Claim updated',
    detail: 'TSMC revenue updated from $18.2B to $19.1B',
    reportName: 'Q4 Revenue Model',
    timestamp: '2h ago',
    type: 'update',
  },
  {
    id: 'a2',
    action: 'Sync completed',
    detail: '12 claims verified, 0 changes detected',
    reportName: 'Series B Financials',
    timestamp: '4h ago',
    type: 'sync',
  },
  {
    id: 'a3',
    action: 'Report created',
    detail: 'New report added to Acme Corp DD',
    reportName: 'Supply Chain Risk',
    timestamp: '1d ago',
    type: 'create',
  },
  {
    id: 'a4',
    action: 'Source connected',
    detail: 'PitchBook API linked to workspace',
    reportName: null,
    timestamp: '2d ago',
    type: 'source',
  },
]

const PROJECTS = [
  { id: 'p1', name: 'Acme Corp DD', alerts: 2, lastSync: '2h ago', reports: 4, status: 'attention' },
  { id: 'p2', name: 'Nordic Telecoms', alerts: 1, lastSync: '1d ago', reports: 3, status: 'attention' },
  { id: 'p3', name: 'Series B Prep', alerts: 0, lastSync: '3h ago', reports: 2, status: 'clear' },
]

const STATS = [
  { label: 'Reports', value: '24', icon: FileText },
  { label: 'Alerts', value: '3', icon: AlertCircle, highlight: true },
  { label: 'Claims Tracked', value: '156', icon: TrendingUp },
  { label: 'Sources', value: '12', icon: Database },
]

export default function OverviewPage() {
  const [activeTab, setActiveTab] = useState<'hub' | 'activity'>('hub')
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['source_verified', 'prompt_tracked']))
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh - replace with actual data fetch
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const dismissAlert = (id: string) => {
    setDismissedAlerts(prev => new Set([...prev, id]))
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) next.delete(section)
      else next.add(section)
      return next
    })
  }

  const visibleSourceAlerts = SOURCE_VERIFIED_ALERTS.filter(a => !dismissedAlerts.has(a.id))
  const visiblePromptAlerts = PROMPT_TRACKED_ALERTS.filter(a => !dismissedAlerts.has(a.id))
  const totalAlerts = visibleSourceAlerts.length + visiblePromptAlerts.length

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="px-8 pt-8 pb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Building2 className="w-4 h-4" strokeWidth={1.5} />
          <span>Workspace</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">Overview</span>
        </div>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              Good morning, Derek
            </h1>
            <p className="text-gray-500 text-sm">
              {totalAlerts > 0 
                ? `You have ${totalAlerts} item${totalAlerts > 1 ? 's' : ''} to review.`
                : 'All caught up. No items need attention.'
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} strokeWidth={1.5} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <div className="text-right text-sm text-gray-500">
              <div className="font-medium text-gray-900">Mon, Jan 13</div>
              <div>Last sync: 2h ago</div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {totalAlerts > 0 && (
        <div className="px-8 pb-6 space-y-4">
          {/* Source-Verified Alerts */}
          {visibleSourceAlerts.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('source_verified')}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                  <span className="text-sm font-medium text-gray-900">
                    Needs Attention
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">
                    Source-Verified
                  </span>
                  <span className="text-xs text-gray-500">
                    {visibleSourceAlerts.length} item{visibleSourceAlerts.length > 1 ? 's' : ''}
                  </span>
                </div>
                {expandedSections.has('source_verified') ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" strokeWidth={2} />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" strokeWidth={2} />
                )}
              </button>
              
              {expandedSections.has('source_verified') && (
                <div className="divide-y divide-gray-100">
                  {visibleSourceAlerts.map(alert => (
                    <SourceVerifiedAlert 
                      key={alert.id} 
                      alert={alert} 
                      onDismiss={() => dismissAlert(alert.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Prompt-Tracked Alerts */}
          {visiblePromptAlerts.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('prompt_tracked')}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-amber-600" strokeWidth={2} />
                  <span className="text-sm font-medium text-gray-900">
                    Review Suggested
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">
                    Prompt-Tracked
                  </span>
                  <span className="text-xs text-gray-500">
                    {visiblePromptAlerts.length} item{visiblePromptAlerts.length > 1 ? 's' : ''}
                  </span>
                </div>
                {expandedSections.has('prompt_tracked') ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" strokeWidth={2} />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" strokeWidth={2} />
                )}
              </button>
              
              {expandedSections.has('prompt_tracked') && (
                <div className="divide-y divide-gray-100">
                  {visiblePromptAlerts.map(alert => (
                    <PromptTrackedAlert 
                      key={alert.id} 
                      alert={alert} 
                      onDismiss={() => dismissAlert(alert.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="px-8 border-b border-gray-200">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('hub')}
            className={`
              py-3 text-sm font-medium border-b-2 -mb-px cursor-pointer transition-colors
              ${activeTab === 'hub' 
                ? 'border-gray-900 text-gray-900' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }
            `}
          >
            Hub
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`
              py-3 text-sm font-medium border-b-2 -mb-px cursor-pointer transition-colors
              ${activeTab === 'activity' 
                ? 'border-gray-900 text-gray-900' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }
            `}
          >
            Activity
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-8 py-6">
        {activeTab === 'hub' && <HubTab />}
        {activeTab === 'activity' && <ActivityTab />}
      </div>
    </div>
  )
}

// Sub-components

function SourceVerifiedAlert({ alert, onDismiss }: { 
  alert: typeof SOURCE_VERIFIED_ALERTS[0]
  onDismiss: () => void 
}) {
  return (
    <div className="px-4 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-4">
        {/* Source logo */}
        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
          <img 
            src={`https://cdn.brandfetch.io/${alert.sourceLogo}?c=1id1Fyz-h7an5-5KR_y`}
            alt={alert.source}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.parentElement!.innerHTML = `<span class="text-xs font-medium text-gray-400">${alert.source.charAt(0)}</span>`
            }}
          />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">{alert.claim}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{alert.updatedAgo}</span>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-500 line-through">{alert.currentValue}</span>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="text-sm font-medium text-emerald-600">{alert.newValue}</span>
            <span className="text-xs text-gray-400">via {alert.source}</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Link 
              href={`/report/${alert.reportId}`}
              className="hover:text-gray-900 hover:underline"
            >
              {alert.reportName}
            </Link>
            <span>•</span>
            <span>{alert.projectName}</span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 cursor-pointer transition-colors">
            Update Claim
          </button>
          <Link 
            href={`/report/${alert.reportId}`}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
          >
            View
          </Link>
          <button 
            onClick={onDismiss}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  )
}

function PromptTrackedAlert({ alert, onDismiss }: { 
  alert: typeof PROMPT_TRACKED_ALERTS[0]
  onDismiss: () => void 
}) {
  return (
    <div className="px-4 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
          <Search className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">{alert.claim}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">Checked {alert.checkedAgo}</span>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">
            {alert.summary}
          </p>
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Link 
              href={`/report/${alert.reportId}`}
              className="hover:text-gray-900 hover:underline"
            >
              {alert.reportName}
            </Link>
            <span>•</span>
            <span>{alert.projectName}</span>
          </div>
        </div>
        
        {/* Actions - No "Update" button, only review */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-1.5">
            <ExternalLink className="w-3 h-3" strokeWidth={2} />
            Review Sources
          </button>
          <button 
            onClick={onDismiss}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  )
}

function HubTab() {
  return (
    <div className="space-y-8">
      {/* Stats */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Quick Stats
        </h3>
        <div className="grid grid-cols-4 gap-4">
          {STATS.map(stat => (
            <div 
              key={stat.label}
              className="p-4 bg-gray-50 rounded-lg border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon 
                  className={`w-4 h-4 ${stat.highlight ? 'text-amber-500' : 'text-gray-400'}`} 
                  strokeWidth={1.5} 
                />
                <span className="text-xs text-gray-500">{stat.label}</span>
              </div>
              <div className={`text-2xl font-semibold ${stat.highlight ? 'text-amber-600' : 'text-gray-900'}`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Projects
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {PROJECTS.map(project => (
            <Link
              key={project.id}
              href={`/project/${project.id}`}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                  {project.name}
                </h4>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" strokeWidth={2} />
              </div>
              
              <div className="flex items-center gap-3 text-xs text-gray-500">
                {project.status === 'attention' ? (
                  <span className="flex items-center gap-1 text-amber-600">
                    <AlertCircle className="w-3 h-3" strokeWidth={2} />
                    {project.alerts} alert{project.alerts > 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 className="w-3 h-3" strokeWidth={2} />
                    All clear
                  </span>
                )}
                <span>•</span>
                <span>{project.reports} reports</span>
              </div>
              
              <div className="mt-2 text-xs text-gray-400">
                Last sync: {project.lastSync}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function ActivityTab() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Recent Activity
        </h3>
        <Link 
          href="/audit-log"
          className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          View full audit log
          <ChevronRight className="w-3 h-3" strokeWidth={2} />
        </Link>
      </div>
      
      <div className="space-y-1">
        {RECENT_ACTIVITY.map((item, index) => (
          <div 
            key={item.id}
            className="flex items-start gap-4 py-3 border-b border-gray-100 last:border-0"
          >
            {/* Icon */}
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
              ${item.type === 'update' ? 'bg-emerald-50' : ''}
              ${item.type === 'sync' ? 'bg-blue-50' : ''}
              ${item.type === 'create' ? 'bg-purple-50' : ''}
              ${item.type === 'source' ? 'bg-gray-100' : ''}
            `}>
              {item.type === 'update' && <RefreshCw className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />}
              {item.type === 'sync' && <CheckCircle2 className="w-4 h-4 text-blue-600" strokeWidth={1.5} />}
              {item.type === 'create' && <FileText className="w-4 h-4 text-purple-600" strokeWidth={1.5} />}
              {item.type === 'source' && <Database className="w-4 h-4 text-gray-500" strokeWidth={1.5} />}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-900">{item.action}</div>
              <div className="text-sm text-gray-500">{item.detail}</div>
              {item.reportName && (
                <div className="text-xs text-gray-400 mt-0.5">{item.reportName}</div>
              )}
            </div>
            
            {/* Timestamp */}
            <div className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
              <Clock className="w-3 h-3" strokeWidth={2} />
              {item.timestamp}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}