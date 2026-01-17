// Path: src/app/demo/analytics/page.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  AlertTriangle, Info, Clock, Eye,
  GitCommit, ChevronDown, FileText, RotateCcw
} from 'lucide-react'

// Mock document blocks
const mockBlocks = [
  { id: 'b1', type: 'heading1', content: 'Q3 2024 Investment Analysis', metrics: { dwell: 3200, bounceRate: 0, views: 47 } },
  { id: 'b2', type: 'paragraph', content: 'Executive Summary: This quarter showed exceptional growth driven by AI infrastructure demand. Revenue exceeded expectations by 12% while maintaining healthy margins across all segments.', metrics: { dwell: 8500, bounceRate: 4, views: 47 } },
  { id: 'b3', type: 'heading2', content: 'Market Conditions', metrics: { dwell: 1200, bounceRate: 0, views: 45 } },
  { id: 'b4', type: 'paragraph', content: 'Market conditions remained favorable despite macroeconomic headwinds. The semiconductor sector benefited from sustained demand in data center and automotive applications.', metrics: { dwell: 12400, bounceRate: 2, views: 45 } },
  { id: 'b5', type: 'heading2', content: 'Revenue Analysis', metrics: { dwell: 1100, bounceRate: 0, views: 44 } },
  { id: 'b6', type: 'paragraph', content: 'Data center revenue reached $14.51 billion, representing a 279% year-over-year increase. Gaming revenue declined 8% due to inventory normalization.', metrics: { dwell: 18200, bounceRate: 0, views: 44, hasSource: true } },
  { id: 'b7', type: 'heading2', content: 'Risk Factors', metrics: { dwell: 2100, bounceRate: 32, views: 44 } },
  { id: 'b8', type: 'paragraph', content: 'Key risks include supply chain constraints, geopolitical tensions affecting chip manufacturing, and potential demand softening in consumer segments.', metrics: { dwell: 4800, bounceRate: 28, views: 41 } },
  { id: 'b9', type: 'heading2', content: 'Competitive Landscape', metrics: { dwell: 6100, bounceRate: 8, views: 38 } },
  { id: 'b10', type: 'paragraph', content: 'AMD continues to gain market share in data center GPUs. Intel\'s re-entry into discrete graphics adds competitive pressure. However, NVIDIA maintains technological leadership in AI training workloads.', metrics: { dwell: 9800, bounceRate: 5, views: 38 } },
  { id: 'b11', type: 'heading2', content: 'Recommendation', metrics: { dwell: 2400, bounceRate: 0, views: 36 } },
  { id: 'b12', type: 'paragraph', content: 'Strong Buy. Price target of $950 based on 35x forward earnings. The AI infrastructure cycle is still in early innings with significant runway for growth.', metrics: { dwell: 11200, bounceRate: 0, views: 36 } },
]

// Suggestions
const suggestions = [
  {
    id: 's1',
    type: 'warning' as const,
    blockId: 'b7',
    blockIndex: 6,
    blockTitle: 'Risk Factors',
    diagnosis: '32% bounce rate on this section',
    data: 'Avg. dwell: 2.1s (expected: 8s+)',
    resolution: 'Rewrite for Clarity',
    action: 'rewrite',
  },
  {
    id: 's2',
    type: 'warning' as const,
    blockId: 'b8',
    blockIndex: 7,
    blockTitle: 'Risk Factors (cont.)',
    diagnosis: '28% of readers dropped off here',
    data: 'Only 4.8s avg read time',
    resolution: 'Simplify or Split',
    action: 'simplify',
  },
  {
    id: 's3',
    type: 'info' as const,
    blockId: 'b6',
    blockIndex: 5,
    blockTitle: 'Revenue Analysis',
    diagnosis: 'Unverified claim detected',
    data: '"279% YoY" lacks source receipt',
    resolution: 'Add Source Receipt',
    action: 'add-source',
  },
]

// Version history
const versionHistory = [
  { version: 3, hash: 'a3f2c1d', date: '2h ago', message: 'Added source for revenue claim', changes: ['+1 source'] },
  { version: 2, hash: 'b8e4a2f', date: '1d ago', message: 'Rewrote executive summary', changes: ['-12% bounce'] },
  { version: 1, hash: 'c1d3e5g', date: '3d ago', message: 'Initial publish', changes: ['12 blocks'] },
]

export default function EngagementLinterDemo() {
  const [hoveredSuggestion, setHoveredSuggestion] = useState<string | null>(null)
  const [focusedBlock, setFocusedBlock] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(true)
  const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  // Scroll to block on hover
  useEffect(() => {
    if (hoveredSuggestion) {
      const suggestion = suggestions.find(s => s.id === hoveredSuggestion)
      if (suggestion) {
        const blockEl = blockRefs.current.get(suggestion.blockId)
        if (blockEl) {
          blockEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
          setFocusedBlock(suggestion.blockId)
        }
      }
    } else {
      setFocusedBlock(null)
    }
  }, [hoveredSuggestion])

  const getBlockHighlight = (blockId: string, bounceRate: number) => {
    const isFocused = focusedBlock === blockId
    const hasProblem = bounceRate > 20
    
    if (isFocused) {
      return {
        borderLeft: '3px solid #F59E0B',
        background: 'rgba(245, 158, 11, 0.06)',
      }
    }
    if (hasProblem) {
      return {
        borderLeft: '3px solid rgba(245, 158, 11, 0.4)',
        background: 'transparent',
      }
    }
    return {
      borderLeft: '3px solid transparent',
      background: 'transparent',
    }
  }

  return (
    <div className="h-screen bg-[#FAFAFA] flex overflow-hidden">
      {/* Main Document Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-12 bg-white border-b border-gray-200 flex items-center px-5 justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-900">Q3 2024 Investment Analysis</span>
            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-mono">v3</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              47 views
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              4m avg
            </span>
          </div>
        </header>

        {/* Document Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-[620px] mx-auto py-10 px-6">
            {mockBlocks.map((block) => (
              <div
                key={block.id}
                ref={el => { if (el) blockRefs.current.set(block.id, el) }}
                className="relative -ml-3 pl-3 rounded-r transition-all duration-200"
                style={getBlockHighlight(block.id, block.metrics.bounceRate)}
              >
                {block.type === 'heading1' && (
                  <h1 className="text-xl font-semibold text-gray-900 mb-5 pt-1">{block.content}</h1>
                )}
                {block.type === 'heading2' && (
                  <h2 className="text-sm font-semibold text-gray-900 mb-2 mt-7 uppercase tracking-wide">{block.content}</h2>
                )}
                {block.type === 'paragraph' && (
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-4">{block.content}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar: Linter */}
      <div className="w-72 border-l border-gray-200 bg-white flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Linter</span>
          <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-semibold">
            {suggestions.length}
          </span>
        </div>

        {/* Suggestion Feed */}
        <div className="flex-1 overflow-auto p-2 space-y-1.5">
          {suggestions.map(suggestion => (
            <div
              key={suggestion.id}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                hoveredSuggestion === suggestion.id
                  ? 'bg-amber-50/80 border-amber-200'
                  : 'bg-white border-gray-150 hover:border-gray-250'
              }`}
              style={{ borderColor: hoveredSuggestion === suggestion.id ? undefined : 'rgba(0,0,0,0.08)' }}
              onMouseEnter={() => setHoveredSuggestion(suggestion.id)}
              onMouseLeave={() => setHoveredSuggestion(null)}
            >
              {/* Type indicator + Title */}
              <div className="flex items-start gap-2 mb-1.5">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                  suggestion.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-gray-400 mb-0.5">
                    Section {suggestion.blockIndex + 1}: '{suggestion.blockTitle}'
                  </div>
                  <div className="text-xs font-medium text-gray-900 leading-snug">
                    {suggestion.diagnosis}
                  </div>
                </div>
              </div>

              {/* Data */}
              <div className="text-[10px] text-gray-500 mb-2.5 ml-3.5 font-mono">
                {suggestion.data}
              </div>

              {/* Resolution Button */}
              <button className="ml-3.5 flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-900 text-white rounded text-[11px] font-medium hover:bg-gray-800 transition-colors">
                {suggestion.action === 'rewrite' && <RotateCcw className="w-3 h-3" />}
                {suggestion.action === 'simplify' && <RotateCcw className="w-3 h-3" />}
                {suggestion.action === 'add-source' && <FileText className="w-3 h-3" />}
                {suggestion.resolution}
              </button>
            </div>
          ))}
        </div>

        {/* Version History */}
        <div className="border-t border-gray-200 flex-shrink-0">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-[11px] font-semibold text-gray-500 uppercase tracking-wider hover:bg-gray-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <GitCommit className="w-3.5 h-3.5" />
              History
            </span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
          </button>
          
          {showHistory && (
            <div className="px-3 pb-3 space-y-0.5">
              {versionHistory.map((v, i) => (
                <div 
                  key={v.version}
                  className="flex items-start gap-2.5 p-2 rounded hover:bg-gray-50 cursor-pointer"
                >
                  {/* Commit dot + line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    {i < versionHistory.length - 1 && (
                      <div className="w-px h-8 bg-gray-200 mt-1" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 -mt-0.5">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-mono text-gray-400">{v.hash}</span>
                      <span className="text-[10px] text-gray-300">•</span>
                      <span className="text-[10px] text-gray-400">{v.date}</span>
                    </div>
                    <div className="text-[11px] text-gray-700 leading-snug mb-1">{v.message}</div>
                    <div className="flex gap-1">
                      {v.changes.map((c, j) => (
                        <span key={j} className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}