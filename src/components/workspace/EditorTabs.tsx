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
  onTabSelect: (tabId: string) => void
  onTabClose: (tabId: string) => void
  onNewTab: () => void
}

export default function EditorTabs({ tabs, activeTabId, onTabSelect, onTabClose, onNewTab }: EditorTabsProps) {
  return (
    <div className="h-9 flex items-center bg-[#FBF9F7] border-b border-gray-200">
      {/* Tabs */}
      <div className="flex-1 flex items-center h-full overflow-x-auto">
        {tabs.map(tab => (
          <div
            key={tab.id}
            onClick={() => onTabSelect(tab.id)}
            className={`
              group flex items-center gap-2 h-full px-3 cursor-pointer transition-colors border-r border-gray-200 min-w-0 max-w-[180px]
              ${activeTabId === tab.id ? 'bg-white' : 'hover:bg-gray-100'}
            `}
          >
            {/* Logo INSIDE the tab */}
            <img src="/images/raven-logo.png" alt="" className="w-3.5 h-3.5 object-contain flex-shrink-0" />
            
            {/* Document name */}
            <span className="text-[13px] text-gray-700 truncate flex-1">{tab.name}</span>
            
            {/* Unsaved indicator */}
            {tab.hasChanges && (
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
            )}
            
            {/* Close button */}
            <button
              onClick={(e) => { e.stopPropagation(); onTabClose(tab.id) }}
              className={`
                p-0.5 rounded flex-shrink-0 cursor-pointer transition-opacity
                ${activeTabId === tab.id 
                  ? 'opacity-40 hover:opacity-100 hover:bg-gray-200' 
                  : 'opacity-0 group-hover:opacity-40 hover:!opacity-100 hover:bg-gray-200'
                }
              `}
            >
              <X className="w-3 h-3 text-gray-500" />
            </button>
          </div>
        ))}
      </div>

      {/* New tab button */}
      <button
        onClick={onNewTab}
        className="h-full px-3 hover:bg-gray-100 cursor-pointer transition-colors border-l border-gray-200"
        title="New document"
      >
        <Plus className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  )
}