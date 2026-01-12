// Route: src/components/workspace/ClaimsPanel.tsx

'use client'

import { useState } from 'react'
import { 
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  Trash2,
  Shield,
  Radar,
} from 'lucide-react'
import TrackingBadge from './TrackingBadge'

// Mock data for tracked items
const MOCK_CLAIMS = [
  {
    id: 'HAR-001',
    text: 'market share of 80%',
    status: 'verified' as const,
    type: 'verify' as const,
    source: 'pitchbook',
    cadence: 'daily',
    category: 'Financial',
    lastChecked: '2h ago',
  },
  {
    id: 'HAR-002',
    text: 'data center revenue reached $14.5B',
    status: 'verified' as const,
    type: 'both' as const,
    source: 'sec',
    cadence: 'daily',
    category: 'Financial',
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
    category: 'Financial',
    lastChecked: '26h ago',
  },
  {
    id: 'HAR-004',
    text: 'China accounts for approximately 20% of revenue',
    status: 'attention' as const,
    type: 'both' as const,
    source: 'web',
    cadence: 'weekly',
    category: 'Regulatory',
    lastChecked: '1d ago',
    signal: { name: 'Regulatory action', categoryId: 'regulatory' },
  },
  {
    id: 'HAR-005',
    text: 'price target of $650',
    status: 'pending' as const,
    type: 'signal' as const,
    source: 'reuters',
    cadence: 'daily',
    category: 'Sentiment',
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

// Status labels (text only, no colors)
const STATUS_LABELS = {
  verified: 'Verified',
  pending: 'Checking...',
  stale: 'Stale',
  attention: 'Needs attention',
}

// Claim card in the list view
function ClaimCard({ claim, isHovered, onClick }: { claim: ClaimData; isHovered?: boolean; onClick: () => void }) {
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
      <div className="flex items-center gap-3 mb-2">
        <TrackingBadge status={claim.status} type={claim.type} size="sm" />
        <span className="text-xs font-mono text-gray-400">{claim.id}</span>
        <span className="ml-auto text-xs text-gray-400">{claim.lastChecked}</span>
      </div>
      
      {/* Claim text */}
      <p className="text-sm text-gray-900 line-clamp-2 mb-2 pl-8">"{claim.text}"</p>
      
      {/* Footer - category and signal name */}
      <div className="flex items-center gap-2 text-xs text-gray-500 pl-8">
        <span>{claim.category}</span>
        {claim.signal && (
          <>
            <span className="text-gray-300">•</span>
            <span>{claim.signal.name}</span>
          </>
        )}
      </div>
    </button>
  )
}

// Properties view when a claim is selected
function ClaimPropertiesView({ claim, onBack }: { claim: ClaimData; onBack: () => void }) {
  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <button 
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 cursor-pointer transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-3">
          <TrackingBadge status={claim.status} type={claim.type} size="md" />
          <div>
            <div className="text-sm font-semibold text-gray-900">{claim.id}</div>
            <div className="text-xs text-gray-500">{STATUS_LABELS[claim.status]}</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Claim text */}
        <div className="mb-5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tracked Text</label>
          <p className="mt-1.5 text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-200">
            "{claim.text}"
          </p>
        </div>

        {/* Tracking Type */}
        <div className="mb-5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tracking</label>
          <div className="mt-1.5 space-y-2">
            {(claim.type === 'verify' || claim.type === 'both') && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Shield className="w-4 h-4 text-gray-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Verification</div>
                  <div className="text-xs text-gray-500">Checking via {claim.source} • {claim.cadence}</div>
                </div>
              </div>
            )}
            {(claim.type === 'signal' || claim.type === 'both') && claim.signal && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Radar className="w-4 h-4 text-gray-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{claim.signal.name}</div>
                  <div className="text-xs text-gray-500">Watching for changes</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="mb-5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Details</label>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500">Category</div>
              <div className="text-sm text-gray-900">{claim.category}</div>
            </div>
            <div className="p-2.5 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500">Last checked</div>
              <div className="text-sm text-gray-900">{claim.lastChecked}</div>
            </div>
          </div>
        </div>

        {/* Source link */}
        <div className="mb-4">
          <a 
            href="#" 
            className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors text-sm text-gray-700"
          >
            <ExternalLink className="w-4 h-4 text-gray-400" />
            View source data
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
          <button className="px-3 py-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors">
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
}

export default function ClaimsPanel({
  claims = [],
  selectedClaimId,
  hoveredClaimId,
  onClaimSelect,
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
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              {activeTab === 'signals' ? (
                <Radar className="w-5 h-5 text-gray-400" />
              ) : (
                <Shield className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <p className="text-sm text-gray-500 mb-1">
              {activeTab === 'signals' ? 'No signals yet' : 'No verifications yet'}
            </p>
            <p className="text-xs text-gray-400">
              {activeTab === 'signals' 
                ? 'Add signals to track market changes' 
                : 'Highlight text and click Track to verify claims'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}