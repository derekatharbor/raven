// Route: src/components/workspace/ClaimsPanel.tsx

'use client'

import { useState } from 'react'
import { 
  X, 
  Clock, 
  Database, 
  Tag, 
  Calendar, 
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Circle,
  ExternalLink,
  MoreHorizontal,
} from 'lucide-react'

// Cadence options
const CADENCE_OPTIONS = [
  { value: 'realtime', label: 'Real-time' },
  { value: 'hourly', label: 'Every hour' },
  { value: '4hours', label: 'Every 4 hours' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'custom', label: 'Custom schedule...' },
]

// Source options (would come from connected sources)
const SOURCE_OPTIONS = [
  { id: 's1', name: 'PitchBook', domain: 'pitchbook.com' },
  { id: 's2', name: 'SEC EDGAR', domain: 'sec.gov' },
  { id: 's3', name: 'Bloomberg', domain: 'bloomberg.com' },
  { id: 's4', name: 'Reuters', domain: 'reuters.com' },
  { id: 's5', name: 'Company Website', domain: 'nvidia.com' },
]

// Category options
const CATEGORY_OPTIONS = [
  { value: 'financial', label: 'Financial Metric', color: '#7C3AED' },
  { value: 'personnel', label: 'Personnel', color: '#059669' },
  { value: 'market', label: 'Market Data', color: '#D97706' },
  { value: 'competitive', label: 'Competitive Intel', color: '#DC2626' },
  { value: 'regulatory', label: 'Regulatory', color: '#2563EB' },
]

// Mock tracked claims
const MOCK_CLAIMS = [
  {
    id: 'HAR-001',
    text: 'market share of 80%',
    status: 'verified',
    source: 'PitchBook',
    lastChecked: '2h ago',
    cadence: 'daily',
    category: 'market',
  },
  {
    id: 'HAR-002',
    text: 'revenue reached $14.5B',
    status: 'verified',
    source: 'SEC EDGAR',
    lastChecked: '1h ago',
    cadence: '4hours',
    category: 'financial',
  },
  {
    id: 'HAR-003',
    text: 'market capitalization stands at $1.2 trillion',
    status: 'stale',
    source: 'Bloomberg',
    lastChecked: '6h ago',
    cadence: 'hourly',
    category: 'financial',
  },
  {
    id: 'HAR-004',
    text: '20% of revenue',
    status: 'attention',
    source: 'Company Website',
    lastChecked: '30m ago',
    cadence: 'daily',
    category: 'market',
  },
]

interface ClaimData {
  id: string
  text: string
  status: 'pending' | 'verified' | 'stale' | 'attention'
  source: string
  cadence: string
  category: string
  lastChecked: string
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
  // Combine passed claims with mock data for demo
  const allClaims = [...claims, ...MOCK_CLAIMS]
  const selectedClaim = allClaims.find(c => c.id === selectedClaimId)

  // If a claim is selected, show properties view
  if (selectedClaimId && selectedClaim) {
    return (
      <ClaimPropertiesView 
        claim={selectedClaim} 
        onBack={() => onClaimSelect?.(null)}
      />
    )
  }

  // Otherwise show claims list
  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 text-cyan-500" strokeWidth={2} />
            <span className="text-sm font-semibold text-gray-900">Tracked Claims</span>
            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
              {allClaims.length}
            </span>
          </div>
        </div>
      </div>

      {/* Claims List */}
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {allClaims.length > 0 ? (
          <div className="space-y-2">
            {allClaims.map(claim => (
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
            <Circle className="w-8 h-8 text-gray-300 mb-3" strokeWidth={1.5} />
            <p className="text-sm text-gray-500 mb-1">No tracked claims yet</p>
            <p className="text-xs text-gray-400">Highlight text in the editor and click Track to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Claim card in the list view
function ClaimCard({ claim, isHovered, onClick }: { claim: typeof MOCK_CLAIMS[0]; isHovered?: boolean; onClick: () => void }) {
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
      {/* Top row: ID + Status */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400 font-mono">{claim.id}</span>
        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${statusConfig.bg}`}>
          <StatusIcon className={`w-3 h-3 ${statusConfig.color}`} strokeWidth={2} />
          <span className={`text-[10px] font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
        </div>
      </div>
      
      {/* Claim text */}
      <p className="text-sm text-gray-700 mb-2 line-clamp-2">"{claim.text}"</p>
      
      {/* Bottom row: Source + Category */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-gray-500">{claim.source}</span>
        <span className="text-gray-300">•</span>
        <div className="flex items-center gap-1">
          <div 
            className="w-2 h-2 rounded-sm"
            style={{ backgroundColor: category?.color }}
          />
          <span className="text-[10px] text-gray-500">{category?.label}</span>
        </div>
      </div>
    </button>
  )
}

// Properties view when a claim is selected
function ClaimPropertiesView({ claim, onBack }: { claim: typeof MOCK_CLAIMS[0]; onBack: () => void }) {
  const [cadence, setCadence] = useState(claim.cadence)
  const [selectedSource, setSelectedSource] = useState(claim.source)
  const [category, setCategory] = useState(claim.category)

  const categoryConfig = CATEGORY_OPTIONS.find(c => c.value === category)
  
  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={onBack}
              className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              ← Back
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded hover:bg-gray-100 cursor-pointer">
              <ExternalLink className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
            </button>
            <button className="p-1 rounded hover:bg-gray-100 cursor-pointer">
              <MoreHorizontal className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Properties Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Claim ID + Text */}
        <div className="mb-6">
          <div className="text-xs text-gray-400 font-mono mb-1">{claim.id}</div>
          <p className="text-sm text-gray-900 font-medium">"{claim.text}"</p>
        </div>

        {/* Properties Section */}
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
          Properties
        </div>

        {/* Status */}
        <div className="mb-4">
          <label className="text-xs text-gray-500 mb-1.5 block">Status</label>
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <Circle className="w-4 h-4 text-gray-400" strokeWidth={2} />
            <span className="text-sm text-gray-700">Todo</span>
          </div>
        </div>

        {/* Data Source */}
        <div className="mb-4">
          <label className="text-xs text-gray-500 mb-1.5 block">Data Source</label>
          <button className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
              <span className="text-sm text-gray-700">{selectedSource}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
          </button>
        </div>

        {/* Cadence */}
        <div className="mb-4">
          <label className="text-xs text-gray-500 mb-1.5 block">Check Cadence</label>
          <button className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
              <span className="text-sm text-gray-700">
                {CADENCE_OPTIONS.find(c => c.value === cadence)?.label}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
          </button>
        </div>

        {/* Category */}
        <div className="mb-6">
          <label className="text-xs text-gray-500 mb-1.5 block">Category</label>
          <button className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded"
                style={{ backgroundColor: categoryConfig?.color }}
              />
              <span className="text-sm text-gray-700">{categoryConfig?.label}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
          </button>
        </div>

        {/* Labels Section */}
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
          Labels
        </div>
        
        <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
          <Tag className="w-4 h-4" strokeWidth={1.5} />
          Add label
        </button>

        {/* Project Section */}
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 mt-6">
          Project
        </div>
        
        <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
          <Database className="w-4 h-4" strokeWidth={1.5} />
          Add to project
        </button>

        {/* Last Checked */}
        <div className="mt-8 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Last checked</span>
            <span>{claim.lastChecked}</span>
          </div>
        </div>
      </div>
    </div>
  )
}