// Route: src/components/workspace/SignalModal.tsx

'use client'

import { useState } from 'react'
import { X, Search, Sparkles } from 'lucide-react'

// Signal categories and their signals
const SIGNAL_CATEGORIES = [
  {
    id: 'financial',
    name: 'Financial',
    color: 'bg-emerald-500',
    signals: [
      { id: 'valuation_change', name: 'Valuation change', description: 'Market cap or enterprise value shifts significantly' },
      { id: 'revenue_update', name: 'Revenue update', description: 'Quarterly or annual revenue figures released' },
      { id: 'margin_shift', name: 'Margin shift', description: 'Gross or operating margin changes materially' },
      { id: 'debt_equity', name: 'Debt/equity change', description: 'Capital structure or leverage ratio changes' },
      { id: 'funding_round', name: 'Funding round', description: 'New investment or financing announced' },
    ]
  },
  {
    id: 'strategic',
    name: 'Strategic',
    color: 'bg-blue-500',
    signals: [
      { id: 'ma_activity', name: 'M&A activity', description: 'Merger, acquisition, or divestiture announced' },
      { id: 'partnership', name: 'Partnership announced', description: 'New strategic partnership or alliance' },
      { id: 'market_share', name: 'Market share shift', description: 'Competitive position changes in key markets' },
      { id: 'new_market', name: 'New market entry', description: 'Expansion into new geography or segment' },
      { id: 'product_launch', name: 'Product launch', description: 'New product or service announced' },
    ]
  },
  {
    id: 'personnel',
    name: 'Personnel',
    color: 'bg-violet-500',
    signals: [
      { id: 'exec_change', name: 'Executive change', description: 'C-suite appointment or departure' },
      { id: 'board_change', name: 'Board change', description: 'Board member added or removed' },
      { id: 'key_hire', name: 'Key hire/departure', description: 'Notable talent movement' },
      { id: 'reorg', name: 'Reorg announced', description: 'Organizational restructuring' },
    ]
  },
  {
    id: 'regulatory',
    name: 'Regulatory',
    color: 'bg-amber-500',
    signals: [
      { id: 'sec_filing', name: 'SEC filing', description: 'New 10-K, 10-Q, 8-K, or other filing' },
      { id: 'lawsuit', name: 'Legal action', description: 'Lawsuit filed or settled' },
      { id: 'regulatory_action', name: 'Regulatory action', description: 'Government investigation or ruling' },
      { id: 'earnings_release', name: 'Earnings release', description: 'Quarterly earnings announced' },
    ]
  },
  {
    id: 'sentiment',
    name: 'Sentiment',
    color: 'bg-rose-500',
    signals: [
      { id: 'analyst_rating', name: 'Analyst rating change', description: 'Buy/sell rating upgraded or downgraded' },
      { id: 'media_sentiment', name: 'Media sentiment shift', description: 'Notable change in press coverage tone' },
      { id: 'competitor_positioning', name: 'Competitor positioning', description: 'Competitor makes claim about this entity' },
    ]
  },
]

interface SignalModalProps {
  text: string
  onConfirm: (signal: { categoryId: string; signalId: string; signalName: string }) => void
  onCancel: () => void
}

export default function SignalModal({ text, onConfirm, onCancel }: SignalModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSignal, setSelectedSignal] = useState<{
    categoryId: string
    signalId: string
    signalName: string
  } | null>(null)

  // Filter signals based on search
  const filteredCategories = SIGNAL_CATEGORIES.map(category => ({
    ...category,
    signals: category.signals.filter(signal =>
      signal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      signal.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.signals.length > 0)

  const handleSignalClick = (categoryId: string, signalId: string, signalName: string) => {
    setSelectedSignal({ categoryId, signalId, signalName })
  }

  const handleConfirm = () => {
    if (selectedSignal) {
      onConfirm(selectedSignal)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-[520px] max-h-[600px] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Add Signal</h3>
            <button 
              onClick={onCancel}
              className="p-1 rounded hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          
          {/* Selected text preview */}
          <div className="mt-3 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700 line-clamp-2">"{text}"</p>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-gray-100 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search signals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
        </div>

        {/* Signal Categories */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-5">
            {filteredCategories.map(category => (
              <div key={category.id}>
                {/* Category header */}
                <div className="flex items-center gap-2 mb-2.5">
                  <div className={`w-2 h-2 rounded-full ${category.color}`} />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {category.name}
                  </span>
                </div>
                
                {/* Signals grid */}
                <div className="grid grid-cols-2 gap-2">
                  {category.signals.map(signal => {
                    const isSelected = selectedSignal?.signalId === signal.id
                    return (
                      <button
                        key={signal.id}
                        onClick={() => handleSignalClick(category.id, signal.id, signal.name)}
                        className={`
                          text-left p-3 rounded-lg border transition-all cursor-pointer
                          ${isSelected 
                            ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }
                        `}
                      >
                        <div className="text-sm font-medium text-gray-900">{signal.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{signal.description}</div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Custom signal option */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <button 
              className="w-full text-left p-3 rounded-lg border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer group"
              onClick={() => {/* TODO: Custom signal flow */}}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Custom signal</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Pro</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-6">Create a custom monitoring prompt for this text</p>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={!selectedSignal}
            className={`
              px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors
              ${selectedSignal 
                ? 'text-white bg-gray-900 hover:bg-gray-800' 
                : 'text-gray-400 bg-gray-100 cursor-not-allowed'
              }
            `}
          >
            Add Signal
          </button>
        </div>
      </div>
    </div>
  )
}

export { SIGNAL_CATEGORIES }
