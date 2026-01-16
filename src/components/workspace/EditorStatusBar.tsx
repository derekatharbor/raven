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
  Moon,
  Sun,
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
  darkMode?: boolean
  onDarkModeToggle?: () => void
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
  darkMode = false,
  onDarkModeToggle,
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
    <div className={`h-8 border-t flex items-center justify-between px-3 text-xs select-none ${darkMode ? 'bg-[#1a1a1a] border-[#333]' : 'bg-[#FAFAF9] border-gray-200'}`}>
      {/* Left section - Document stats */}
      <div className={`flex items-center gap-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {/* Word count */}
        <div className="flex items-center gap-1.5" title={`${readingTime} min read`}>
          <FileText className="w-3.5 h-3.5" />
          <span>{wordCount.toLocaleString()} words</span>
          <span className={darkMode ? 'text-gray-600' : 'text-gray-300'}>•</span>
          <span>{readingTime} min</span>
        </div>

        {/* Claims summary */}
        {totalClaims > 0 && (
          <div className="flex items-center gap-2">
            <span className={darkMode ? 'text-gray-600' : 'text-gray-300'}>|</span>
            {claimSummary.verified > 0 && (
              <div className="flex items-center gap-1 text-green-500" title="Verified claims">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{claimSummary.verified}</span>
              </div>
            )}
            {claimSummary.pending > 0 && (
              <div className={`flex items-center gap-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} title="Pending verification">
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
          <span className={darkMode ? 'text-gray-600' : 'text-gray-300'}>|</span>
          <Database className="w-3.5 h-3.5" />
          <span>{connectedSources} source{connectedSources !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Center section - Mode toggle */}
      <div className={`flex items-center rounded-md border p-0.5 ${darkMode ? 'bg-[#2a2a2a] border-[#444]' : 'bg-white border-gray-200'}`}>
        {modes.map((m) => {
          const Icon = m.icon
          const isActive = mode === m.id
          return (
            <button
              key={m.id}
              onClick={() => onModeChange(m.id)}
              title={m.description}
              className={`
                flex items-center gap-1.5 px-2.5 py-1 rounded transition-all cursor-pointer
                ${isActive 
                  ? darkMode ? 'bg-gray-100 text-gray-900' : 'bg-gray-900 text-white'
                  : darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
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
        {onDarkModeToggle && (
          <button
            onClick={onDarkModeToggle}
            className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors cursor-pointer ${darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-white/10' : 'text-gray-500 hover:text-gray-700 hover:bg-white'}`}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        )}
        
        <button
          onClick={onExport}
          className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors cursor-pointer ${darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-white/10' : 'text-gray-500 hover:text-gray-700 hover:bg-white'}`}
          title="Export document"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
        
        <button
          onClick={onShare}
          className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors cursor-pointer ${darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-white/10' : 'text-gray-500 hover:text-gray-700 hover:bg-white'}`}
          title="Share document"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>

        <div className={`w-px h-4 mx-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />

        <button
          onClick={onCommandPalette}
          className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors cursor-pointer ${darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-white/10' : 'text-gray-500 hover:text-gray-700 hover:bg-white'}`}
          title="Command palette (⌘K)"
        >
          <Command className="w-3.5 h-3.5" />
          <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>⌘K</span>
        </button>
      </div>
    </div>
  )
}