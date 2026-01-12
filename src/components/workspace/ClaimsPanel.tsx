// Route: src/components/workspace/ClaimsPanel.tsx

'use client'

import { useState } from 'react'
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Circle,
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  Trash2,
  Shield,
  Radar,
} from 'lucide-react'

// Category options for claims
const CATEGORY_OPTIONS = [
  { value: 'financial', label: 'Financial', color: 'bg-emerald-500' },
  { value: 'strategic', label: 'Strategic', color: 'bg-blue-500' },
  { value: 'personnel', label: 'Personnel', color: 'bg-violet-500' },
  { value: 'regulatory', label: 'Regulatory', color: 'bg-amber-500' },
  { value: 'sentiment', label: 'Sentiment', color: 'bg-rose-500' },
]

// Mock data for tracked items
const MOCK_CLAIMS = [
  {
    id: 'HAR-001',
    text: 'market share of 80%',
    status: 'verified' as const,
    type: 'verify' as const,
    source: 'pitchbook',
    cadence: 'daily',
    category: 'financial',
    lastChecked: '2h ago',
  },
  {
    id: 'HAR-002',
    text: 'data center revenue reached $14.5B',
    status: 'verified' as const,
    type: 'both' as const,
    source: 'sec',
    cadence: 'daily',
    category: 'financial',
    lastChecked: '2h ago',
    signal: { name: 'Revenue update', categoryId: 'financial' },
  },
  {
    id: 'HAR-003',
    text: 'forward P/E ratio of 45x',
    status: 'stale' as const,
    type: 'verify' as const,
    source: 'bloomberg',
    cadence: 'daily',
    category: 'financial',
    lastChecked: '26h ago',
  },
  {
    id: 'HAR-004',
    text: 'China accounts for approximately 20% of revenue',
    status: 'attention' as const,
    type: 'both' as const,
    source: 'web',
    cadence: 'weekly',
    category: 'regulatory',
    lastChecked: '1d ago',
    signal: { name: 'Regulatory action', categoryId: 'regulatory' },
  },
  {
    id: 'HAR-005',
    text: 'price target of $650',
    status: 'verified' as const,
    type: 'signal' as const,
    source: 'reuters',
    cadence: 'daily',
    category: 'financial',
    lastChecked: '4h ago',
    signal: { name: 'Analyst rating change', categoryId: 'sentiment' },
  },
]

interface ClaimData {
  id: string
  text: string
  status: 'pending' | 'verified' | 'stale' | 'attention'
  type: 'verify' | 'signal' | 'both'
  source: string
  cadence: string
  category: string
  lastChecked: string
  signal?: { name: string; categoryId: string }
}

// Tracking type indicator (circles)
function TrackingTypeIndicator({ type }: { type: 'verify' | 'signal' | 'both' }) {
  if (type === 'verify') {
    return (
      <div className="flex items-center" title="Verification only">
        <div className="w-3 h-3 rounded-full bg-gray-700 border-2 border-white" />
      </div>
    )
  }
  
  if (type === 'signal') {
    return (
      <div className="flex items-center" title="Signal only">
        <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white" />
      </div>
    )
  }
  
  // Both - overlapping circles
  return (
    <div className="flex items-center" title="Verification + Signal">
      <div className="w-3 h-3 rounded-full bg-gray-700 border-2 border-white" />
      <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white -ml-1.5" />
    </div>
  )
}

// Claim card in the list view
function ClaimCard({ claim, isHovered, onClick }: { claim: ClaimData; isHovered?: boolean; onClick: () => void }) {
  const category = CATEGORY_OPTIONS.find(c => c.value === claim.category)
  
  const statusConfig = {
    verified: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Verified' },
    stale: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Stale' },
    attention: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Needs Attention' },
    pending: { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-50', label: 'Pending' },
  }[claim.status] || { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-50', label: 'Unknown' }
  
  const StatusIcon = statusConfig.icon

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-3 border rounded-lg transition-all cursor-pointer group
        ${isHovered 
          ? 'bg-gray-100 border-gray-300 shadow-sm' 
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }
      `}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <TrackingTypeIndicator type={claim.type} />
          <span className="text-xs font-mono text-gray-400">{claim.id}</span>
        </div>
        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${statusConfig.bg}`}>
          <StatusIcon className={`w-3 h-3 ${statusConfig.color}`} />
          <span className={`text-xs font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
        </div>
      </div>
      
      {/* Claim text */}
      <p className="text-sm text-gray-900 line-clamp-2 mb-2">"{claim.text}"</p>
      
      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          {category && (
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${category.color}`} />
              {category.label}
            </span>
          )}
          {claim.signal && (
            <span className="text-blue-600">• {claim.signal.name}</span>
          )}
        </div>
        <span>{claim.lastChecked}</span>
      </div>
    </button>
  )
}

// Properties view when a claim is selected
function ClaimPropertiesView({ claim, onBack }: { claim: ClaimData; onBack: () => void }) {
  const category = CATEGORY_OPTIONS.find(c => c.value === claim.category)
  
  const statusConfig = {
    verified: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Verified', desc: 'Last check confirmed this claim' },
    stale: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Stale', desc: 'Check is overdue' },
    attention: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Needs Attention', desc: 'Potential discrepancy detected' },
    pending: { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-50', label: 'Pending', desc: 'Awaiting first check' },
  }[claim.status]
  
  const StatusIcon = statusConfig?.icon || Circle

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <button 
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 cursor-pointer transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to list
        </button>
        <div className="flex items-center gap-2">
          <TrackingTypeIndicator type={claim.type} />
          <span className="text-sm font-semibold text-gray-900">{claim.id}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Claim text */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tracked Text</label>
          <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-200">
            "{claim.text}"
          </p>
        </div>

        {/* Status */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
          <div className={`mt-1 flex items-center gap-2 p-3 rounded-lg ${statusConfig?.bg}`}>
            <StatusIcon className={`w-4 h-4 ${statusConfig?.color}`} />
            <div>
              <div className={`text-sm font-medium ${statusConfig?.color}`}>{statusConfig?.label}</div>
              <div className="text-xs text-gray-600">{statusConfig?.desc}</div>
            </div>
          </div>
        </div>

        {/* Tracking Type */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tracking Type</label>
          <div className="mt-1 space-y-2">
            {(claim.type === 'verify' || claim.type === 'both') && (
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                <Shield className="w-4 h-4 text-gray-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Verification</div>
                  <div className="text-xs text-gray-500">Checking accuracy via {claim.source}</div>
                </div>
              </div>
            )}
            {(claim.type === 'signal' || claim.type === 'both') && claim.signal && (
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                <Radar className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="text-sm font-medium text-blue-900">{claim.signal.name}</div>
                  <div className="text-xs text-blue-600">Watching for changes</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Configuration */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Configuration</label>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <div className="p-2 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500">Source</div>
              <div className="text-sm text-gray-900 capitalize">{claim.source}</div>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500">Cadence</div>
              <div className="text-sm text-gray-900 capitalize">{claim.cadence}</div>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500">Category</div>
              <div className="text-sm text-gray-900 flex items-center gap-1.5">
                {category && <span className={`w-2 h-2 rounded-full ${category.color}`} />}
                {category?.label || 'General'}
              </div>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500">Last Checked</div>
              <div className="text-sm text-gray-900">{claim.lastChecked}</div>
            </div>
          </div>
        </div>

        {/* Source link */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Source</label>
          <a 
            href="#" 
            className="mt-1 flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">View source data</span>
          </a>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 cursor-pointer transition-colors">
            <RefreshCw className="w-4 h-4" />
            Check Now
          </button>
          <button className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

interface ClaimsPanelProps {
  claims?: ClaimData[]
  selectedClaimId?: string | null
  hoveredClaimId?: string | null
  onClaimSelect?: (claimId: string | null) => void
  onClose?: () => void
}

export default function ClaimsPanel({
  claims = [],
  selectedClaimId,
  hoveredClaimId,
  onClaimSelect,
  onClose,
}: ClaimsPanelProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'verify' | 'signals'>('all')
  
  // Combine passed claims with mock data for demo
  const allClaims = [...claims, ...MOCK_CLAIMS]
  const selectedClaim = allClaims.find(c => c.id === selectedClaimId)

  // Filter by tab
  const filteredClaims = allClaims.filter(claim => {
    if (activeTab === 'all') return true
    if (activeTab === 'verify') return claim.type === 'verify' || claim.type === 'both'
    if (activeTab === 'signals') return claim.type === 'signal' || claim.type === 'both'
    return true
  })

  // Counts for tabs
  const verifyCounts = allClaims.filter(c => c.type === 'verify' || c.type === 'both').length
  const signalCounts = allClaims.filter(c => c.type === 'signal' || c.type === 'both').length

  // If a claim is selected, show properties view
  if (selectedClaimId && selectedClaim) {
    return (
      <ClaimPropertiesView 
        claim={selectedClaim} 
        onBack={() => onClaimSelect?.(null)}
      />
    )
  }

  // Otherwise show claims list with tabs
  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      {/* Header with tabs */}
      <div className="border-b border-gray-200">
        <div className="px-4 py-3">
          <span className="text-sm font-semibold text-gray-900">Monitoring</span>
        </div>
        
        {/* Tabs */}
        <div className="flex px-4 gap-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`
              px-3 py-2 text-sm font-medium rounded-t-lg transition-colors cursor-pointer
              ${activeTab === 'all' 
                ? 'text-gray-900 bg-gray-100' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            All
            <span className="ml-1.5 text-xs text-gray-400">{allClaims.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('verify')}
            className={`
              flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-lg transition-colors cursor-pointer
              ${activeTab === 'verify' 
                ? 'text-gray-900 bg-gray-100' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            <Shield className="w-3.5 h-3.5" />
            Verify
            <span className="text-xs text-gray-400">{verifyCounts}</span>
          </button>
          <button
            onClick={() => setActiveTab('signals')}
            className={`
              flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-lg transition-colors cursor-pointer
              ${activeTab === 'signals' 
                ? 'text-gray-900 bg-gray-100' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            <Radar className="w-3.5 h-3.5" />
            Signals
            <span className="text-xs text-gray-400">{signalCounts}</span>
          </button>
        </div>
      </div>

      {/* Claims List */}
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {filteredClaims.length > 0 ? (
          <div className="space-y-2">
            {filteredClaims.map(claim => (
              <ClaimCard 
                key={claim.id} 
                claim={claim} 
                isHovered={claim.id === hoveredClaimId}
                onClick={() => onClaimSelect?.(claim.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            {activeTab === 'signals' ? (
              <>
                <Radar className="w-8 h-8 text-gray-300 mb-3" strokeWidth={1.5} />
                <p className="text-sm text-gray-500 mb-1">No signals yet</p>
                <p className="text-xs text-gray-400">Add signals to track market changes</p>
              </>
            ) : (
              <>
                <Shield className="w-8 h-8 text-gray-300 mb-3" strokeWidth={1.5} />
                <p className="text-sm text-gray-500 mb-1">No verifications yet</p>
                <p className="text-xs text-gray-400">Highlight text and click Track to verify claims</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}