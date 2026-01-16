// src/components/workspace/EditorStatusBar.tsx

'use client'

import { useState } from 'react'
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  Share2,
  Download,
  Command,
  Pencil,
  Eye,
  Shield,
  Database,
  ChevronUp,
} from 'lucide-react'

type EditorMode = 'write' | 'review' | 'verify'

interface ClaimSummary {
  verified: number
  pending: number
  stale: number
  contradiction: number
}

interface EditorStatusBarProps {
  wordCount: number
  claimSummary: ClaimSummary
  connectedSources: number
  mode: EditorMode
  onModeChange: (mode: EditorMode) => void
  onExport?: () => void
  onShare?: () => void
  onCommandPalette?: () => void
}

export default function EditorStatusBar({
  wordCount,
  claimSummary,
  connectedSources,
  mode,
  onModeChange,
  onExport,
  onShare,
  onCommandPalette,
}: EditorStatusBarProps) {
  const totalClaims = claimSummary.verified + claimSummary.pending + claimSummary.stale + claimSummary.contradiction
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  const modes: { id: EditorMode; label: string; icon: typeof Pencil; description: string }[] = [
    { id: 'write', label: 'Write', icon: Pencil, description: 'Focus on writing' },
    { id: 'review', label: 'Review', icon: Eye, description: 'Review claims and citations' },
    { id: 'verify', label: 'Verify', icon: Shield, description: 'Run verification checks' },
  ]

  return (
    <div className="h-8 bg-[#FAFAF9] border-t border-gray-200 flex items-center justify-between px-3 text-xs select-none">
      {/* Left section - Document stats */}
      <div className="flex items-center gap-4 text-gray-500">
        {/* Word count */}
        <div className="flex items-center gap-1.5" title={`${readingTime} min read`}>
          <FileText className="w-3.5 h-3.5" />
          <span>{wordCount.toLocaleString()} words</span>
          <span className="text-gray-300">•</span>
          <span>{readingTime} min</span>
        </div>

        {/* Claims summary */}
        {totalClaims > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-gray-300">|</span>
            {claimSummary.verified > 0 && (
              <div className="flex items-center gap-1 text-green-600" title="Verified claims">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{claimSummary.verified}</span>
              </div>
            )}
            {claimSummary.pending > 0 && (
              <div className="flex items-center gap-1 text-gray-400" title="Pending verification">
                <Clock className="w-3.5 h-3.5" />
                <span>{claimSummary.pending}</span>
              </div>
            )}
            {claimSummary.stale > 0 && (
              <div className="flex items-center gap-1 text-amber-500" title="Stale claims">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{claimSummary.stale}</span>
              </div>
            )}
            {claimSummary.contradiction > 0 && (
              <div className="flex items-center gap-1 text-red-500" title="Contradictions found">
                <Zap className="w-3.5 h-3.5" />
                <span>{claimSummary.contradiction}</span>
              </div>
            )}
          </div>
        )}

        {/* Sources */}
        <div className="flex items-center gap-1.5">
          <span className="text-gray-300">|</span>
          <Database className="w-3.5 h-3.5" />
          <span>{connectedSources} source{connectedSources !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Center section - Mode toggle */}
      <div className="flex items-center bg-white rounded-md border border-gray-200 p-0.5">
        {modes.map((m) => {
          const Icon = m.icon
          const isActive = mode === m.id
          return (
            <button
              key={m.id}
              onClick={() => onModeChange(m.id)}
              title={m.description}
              className={`
                flex items-center gap-1.5 px-2.5 py-1 rounded transition-all
                ${isActive 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="font-medium">{m.label}</span>
            </button>
          )
        })}
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-gray-500 hover:text-gray-700 hover:bg-white transition-colors"
          title="Export document"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
        
        <button
          onClick={onShare}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-gray-500 hover:text-gray-700 hover:bg-white transition-colors"
          title="Share document"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>

        <div className="w-px h-4 bg-gray-200 mx-1" />

        <button
          onClick={onCommandPalette}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-gray-500 hover:text-gray-700 hover:bg-white transition-colors"
          title="Command palette (⌘K)"
        >
          <Command className="w-3.5 h-3.5" />
          <span className="text-gray-400">⌘K</span>
        </button>
      </div>
    </div>
  )
}
