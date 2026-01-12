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
  ExternalLink,
  X,
  RefreshCw,
  Clock,
  TrendingUp,
  Building2,
  Users,
  DollarSign,
  BarChart3,
  Globe,
  Shield,
} from 'lucide-react'

// Category config
const CATEGORIES = {
  financial: { label: 'Financial Metric', color: '#E5D5F4', textColor: '#7C3AED' },
  personnel: { label: 'Personnel', color: '#CFDFD5', textColor: '#059669' },
  market: { label: 'Market Data', color: '#F7E3C9', textColor: '#D97706' },
  competitive: { label: 'Competitive Intel', color: '#FBD9D4', textColor: '#DC2626' },
  regulatory: { label: 'Regulatory', color: '#DBEAFE', textColor: '#2563EB' },
}

// Mock data
const NEEDS_ATTENTION = [
  {
    id: '1',
    claim: 'NVDA market cap',
    currentValue: '$1.2T',
    newValue: '$1.4T',
    source: 'PitchBook',
    sourceLogo: 'pitchbook.com',
    reportName: 'Q4 Revenue Model',
    reportId: 'r2',
    category: 'financial',
    updatedAgo: '2h ago',
  },
  {
    id: '2',
    claim: 'Acme Corp headcount',
    currentValue: '450',
    newValue: '512',
    source: 'LinkedIn',
    sourceLogo: 'linkedin.com',
    reportName: 'Company Profile',
    reportId: 'r1',
    category: 'personnel',
    updatedAgo: '6h ago',
  },
  {
    id: '3',
    claim: 'TSMC Q4 revenue',
    currentValue: '$18.2B',
    newValue: '$19.1B',
    source: 'SEC Filing',
    sourceLogo: 'sec.gov',
    reportName: 'Semiconductor Analysis',
    reportId: 'r4',
    category: 'financial',
    updatedAgo: '1d ago',
  },
  {
    id: '4',
    claim: 'EU AI Act status',
    currentValue: 'Pending vote',
    newValue: 'Passed',
    source: 'EUR-Lex',
    sourceLogo: 'europa.eu',
    reportName: 'Regulatory Landscape',
    reportId: 'r5',
    category: 'regulatory',
    updatedAgo: '3h ago',
  },
]

const REVIEW_SUGGESTED = [
  {
    id: '5',
    claim: 'Taiwan Strait activity',
    summary: 'Reuters: "increased naval presence"',
    reportName: 'Taiwan Strait Analysis',
    reportId: 'r3',
    category: 'competitive',
    checkedAgo: '1h ago',
  },
  {
    id: '6',
    claim: 'OpenAI valuation',
    summary: 'TechCrunch: "discussing $150B"',
    reportName: 'AI Market Report',
    reportId: 'r6',
    category: 'market',
    checkedAgo: '4h ago',
  },
]

const RECENT_ACTIVITY = [
  {
    id: 'a1',
    action: 'Claim updated',
    detail: 'TSMC revenue: $18.2B → $19.1B',
    reportName: 'Q4 Revenue Model',
    timestamp: '2h ago',
    type: 'update',
  },
  {
    id: 'a2',
    action: 'Sync completed',
    detail: '12 claims verified, 0 changes',
    reportName: 'Series B Financials',
    timestamp: '4h ago',
    type: 'sync',
  },
  {
    id: 'a3',
    action: 'Report created',
    detail: 'Added to Acme Corp DD',
    reportName: 'Supply Chain Risk',
    timestamp: '1d ago',
    type: 'create',
  },
  {
    id: 'a4',
    action: 'Source connected',
    detail: 'PitchBook API linked',
    reportName: null,
    timestamp: '2d ago',
    type: 'source',
  },
]

export default function OverviewPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'activity'>('pending')
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const dismissAlert = (id: string) => {
    setDismissedAlerts(prev => new Set([...prev, id]))
  }

  const visibleNeedsAttention = NEEDS_ATTENTION.filter(a => !dismissedAlerts.has(a.id))
  const visibleReviewSuggested = REVIEW_SUGGESTED.filter(a => !dismissedAlerts.has(a.id))

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="px-8 pt-8 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 mb-1">
              Good morning, Derek
            </h1>
            <p className="text-gray-500 text-sm">
              {visibleNeedsAttention.length + visibleReviewSuggested.length} items need your attention
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} strokeWidth={1.5} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('pending')}
            className={`
              pb-3 text-sm font-medium border-b-2 -mb-px cursor-pointer transition-colors
              ${activeTab === 'pending' 
                ? 'border-gray-900 text-gray-900' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }
            `}
          >
            Pending Action
            {(visibleNeedsAttention.length + visibleReviewSuggested.length) > 0 && (
              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                {visibleNeedsAttention.length + visibleReviewSuggested.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`
              pb-3 text-sm font-medium border-b-2 -mb-px cursor-pointer transition-colors
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
        {activeTab === 'pending' && (
          <PendingActionTab 
            needsAttention={visibleNeedsAttention}
            reviewSuggested={visibleReviewSuggested}
            onDismiss={dismissAlert}
          />
        )}
        {activeTab === 'activity' && <ActivityTab />}
      </div>
    </div>
  )
}

// Pending Action Tab - clean columns with header bars
function PendingActionTab({ 
  needsAttention, 
  reviewSuggested,
  onDismiss 
}: { 
  needsAttention: typeof NEEDS_ATTENTION
  reviewSuggested: typeof REVIEW_SUGGESTED
  onDismiss: (id: string) => void
}) {
  return (
    <div className="flex gap-6">
      {/* Left Column - Needs Attention */}
      <div className="flex-1">
        <div 
          className="flex items-center gap-2 px-4 py-3 rounded-lg mb-4"
          style={{ backgroundColor: '#FBF9F7' }}
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <h3 className="text-sm font-medium text-gray-700">Needs Attention</h3>
          <span className="text-xs text-gray-400">{needsAttention.length}</span>
        </div>
        
        <div className="space-y-3">
          {needsAttention.length > 0 ? (
            needsAttention.map(item => (
              <ActionCard key={item.id} item={item} onDismiss={() => onDismiss(item.id)} />
            ))
          ) : (
            <div className="p-6 text-center text-gray-400 text-sm">
              All caught up!
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Review Suggested */}
      <div className="flex-1">
        <div 
          className="flex items-center gap-2 px-4 py-3 rounded-lg mb-4"
          style={{ backgroundColor: '#FBF9F7' }}
        >
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <h3 className="text-sm font-medium text-gray-700">Review Suggested</h3>
          <span className="text-xs text-gray-400">{reviewSuggested.length}</span>
        </div>
        
        <div className="space-y-3">
          {reviewSuggested.length > 0 ? (
            reviewSuggested.map(item => (
              <ReviewCard key={item.id} item={item} onDismiss={() => onDismiss(item.id)} />
            ))
          ) : (
            <div className="p-6 text-center text-gray-400 text-sm">
              Nothing to review
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Action Card - Linear style
function ActionCard({ item, onDismiss }: { 
  item: typeof NEEDS_ATTENTION[0]
  onDismiss: () => void 
}) {
  const category = CATEGORIES[item.category as keyof typeof CATEGORIES]
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group relative"
      style={{ boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}
    >
      {/* Dismiss on hover - top right */}
      <button 
        onClick={onDismiss}
        className="absolute top-2 right-2 p-1 text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded cursor-pointer transition-all opacity-0 group-hover:opacity-100"
      >
        <X className="w-3.5 h-3.5" strokeWidth={2} />
      </button>
      
      {/* Top row: logo + source name | ID */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
            <img 
              src={`https://cdn.brandfetch.io/${item.sourceLogo}?c=1id1Fyz-h7an5-5KR_y`}
              alt={item.source}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
          <span className="text-sm text-gray-900">{item.source}</span>
        </div>
        <span className="text-xs text-gray-400 pr-6">HAR-{item.id.padStart(3, '0')}</span>
      </div>
      
      {/* Title */}
      <h4 className="text-base text-gray-700 mb-3">{item.claim}</h4>
      
      {/* Value change - subtle */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
        <span className="line-through">{item.currentValue}</span>
        <span>→</span>
        <span className="text-emerald-600">{item.newValue}</span>
      </div>
      
      {/* Bottom row: priority bars + badge + Update button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Priority bars */}
          <div className="flex items-end gap-0.5 px-2 py-1.5 bg-gray-50 rounded border border-gray-200">
            <div className="w-1 h-2 bg-gray-300 rounded-sm" />
            <div className="w-1 h-3 bg-gray-300 rounded-sm" />
            <div className="w-1 h-4 bg-gray-300 rounded-sm" />
          </div>
          
          {/* Category badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded border border-gray-200">
            <div 
              className="w-3 h-3 rounded"
              style={{ backgroundColor: category.textColor }}
            />
            <span className="text-sm text-gray-700">{category.label}</span>
          </div>
        </div>
        
        {/* Update button */}
        <button className="px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 cursor-pointer transition-colors">
          Update
        </button>
      </div>
    </div>
  )
}

// Review Card - simpler version
function ReviewCard({ item, onDismiss }: { 
  item: typeof REVIEW_SUGGESTED[0]
  onDismiss: () => void 
}) {
  const category = CATEGORIES[item.category as keyof typeof CATEGORIES]
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group relative"
      style={{ boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}
    >
      {/* Dismiss on hover - top right */}
      <button 
        onClick={onDismiss}
        className="absolute top-2 right-2 p-1 text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded cursor-pointer transition-all opacity-0 group-hover:opacity-100"
      >
        <X className="w-3.5 h-3.5" strokeWidth={2} />
      </button>
      
      {/* Top row: ID */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">{item.checkedAgo}</span>
        <span className="text-xs text-gray-400 pr-6">HAR-{item.id.padStart(3, '0')}</span>
      </div>
      
      {/* Title */}
      <h4 className="text-base text-gray-700 mb-2">{item.claim}</h4>
      
      {/* Summary */}
      <p className="text-xs text-gray-400 mb-4 line-clamp-2">{item.summary}</p>
      
      {/* Bottom row: priority bars + badge + Review button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-end gap-0.5 px-2 py-1.5 bg-gray-50 rounded border border-gray-200">
            <div className="w-1 h-2 bg-gray-300 rounded-sm" />
            <div className="w-1 h-3 bg-gray-300 rounded-sm" />
            <div className="w-1 h-4 bg-gray-300 rounded-sm" />
          </div>
          
          <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded border border-gray-200">
            <div 
              className="w-2.5 h-2.5 rounded"
              style={{ backgroundColor: category.textColor }}
            />
            <span className="text-xs text-gray-700">{category.label}</span>
          </div>
        </div>
        
        {/* Review button */}
        <button className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-1.5">
          Review
          <ExternalLink className="w-3 h-3" strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}

// Activity Tab
function ActivityTab() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">Recent Activity</h3>
        <Link 
          href="/audit-log"
          className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          View full audit log
          <ChevronRight className="w-3 h-3" strokeWidth={2} />
        </Link>
      </div>
      
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {RECENT_ACTIVITY.map((item) => (
          <div 
            key={item.id}
            className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0"
          >
            {/* Icon */}
            <div className={`
              w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
              ${item.type === 'update' ? 'bg-emerald-50' : ''}
              ${item.type === 'sync' ? 'bg-blue-50' : ''}
              ${item.type === 'create' ? 'bg-purple-50' : ''}
              ${item.type === 'source' ? 'bg-gray-100' : ''}
            `}>
              {item.type === 'update' && <RefreshCw className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.5} />}
              {item.type === 'sync' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" strokeWidth={1.5} />}
              {item.type === 'create' && <FileText className="w-3.5 h-3.5 text-purple-600" strokeWidth={1.5} />}
              {item.type === 'source' && <Database className="w-3.5 h-3.5 text-gray-500" strokeWidth={1.5} />}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <span className="text-sm text-gray-900">{item.action}</span>
              <span className="text-sm text-gray-400 mx-1">•</span>
              <span className="text-sm text-gray-500">{item.detail}</span>
            </div>
            
            {/* Timestamp */}
            <div className="text-xs text-gray-400 flex-shrink-0">
              {item.timestamp}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}