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
    <div className="h-9 flex items-center bg-[#F8F8F7] border-b border-[#E8E8E6]">
      {/* Raven logo cushion */}
      <div className="h-full flex items-center px-3 border-r border-[#E8E8E6]">
        <div className="w-4 h-4 rounded bg-[#5F6AD2] flex items-center justify-center">
          <span className="text-white text-[8px] font-bold">R</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 flex items-center h-full overflow-x-auto">
        {tabs.map(tab => (
          <div
            key={tab.id}
            onClick={() => onTabSelect(tab.id)}
            className={`
              group flex items-center gap-2 h-full px-3 cursor-pointer transition-colors border-r border-[#E8E8E6] min-w-0 max-w-[160px]
              ${activeTabId === tab.id 
                ? 'bg-white' 
                : 'bg-[#F8F8F7] hover:bg-[#F0F0EE]'
              }
            `}
          >
            {tab.hasChanges && (
              <div className="w-1.5 h-1.5 rounded-full bg-[#5F6AD2] flex-shrink-0" />
            )}
            
            <span className="text-[13px] text-gray-700 truncate">{tab.name}</span>
            
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

      {/* New tab */}
      <button
        onClick={onNewTab}
        className="h-full px-3 hover:bg-[#F0F0EE] cursor-pointer transition-colors border-l border-[#E8E8E6]"
        title="New document"
      >
        <Plus className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  )
}