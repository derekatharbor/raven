// src/components/workspace/EditorTabs.tsx

'use client'

import { X, Plus } from 'lucide-react'

interface Tab {
  id: string
  name: string
  hasChanges: boolean
}

interface EditorTabsProps {
  tabs: Tab[]
  activeTabId: string | null
  onTabSelect: (id: string) => void
  onTabClose: (id: string) => void
  onNewTab: () => void
}

export default function EditorTabs({ tabs, activeTabId, onTabSelect, onTabClose, onNewTab }: EditorTabsProps) {
  return (
    <div className="h-10 flex items-center bg-[#fafafa] border-b border-gray-200 px-2 gap-1">
      {tabs.map(tab => (
        <div
          key={tab.id}
          onClick={() => onTabSelect(tab.id)}
          className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-md cursor-pointer transition-colors ${activeTabId === tab.id ? 'bg-white border border-b-0 border-gray-200 -mb-px' : 'hover:bg-gray-200/50 text-gray-600'}`}
        >
          {tab.hasChanges && <div className="w-2 h-2 rounded-full bg-gray-400" />}
          <span className={`text-sm truncate max-w-[120px] ${activeTabId === tab.id ? 'text-gray-900' : ''}`}>{tab.name}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onTabClose(tab.id) }}
            className={`p-0.5 rounded hover:bg-gray-300 cursor-pointer transition-opacity ${activeTabId === tab.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          >
            <X className="w-3 h-3 text-gray-500" />
          </button>
        </div>
      ))}
      <button onClick={onNewTab} className="p-1.5 rounded hover:bg-gray-200/50 cursor-pointer ml-1" title="New document">
        <Plus className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  )
}
