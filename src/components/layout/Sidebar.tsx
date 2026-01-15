// src/components/layout/Sidebar.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Search, 
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  FolderOpen,
  Database,
  Settings,
  Plus,
} from 'lucide-react'

const WORKSPACES = [
  { id: 'w1', name: 'Acme Corp DD', hasAlerts: true },
  { id: 'w2', name: 'Nordic Telecoms', hasAlerts: true },
  { id: 'w3', name: 'Series B Prep', hasAlerts: false },
]

interface SidebarProps {
  activeWorkspaceId?: string | null
  onWorkspaceSelect?: (id: string) => void
}

export default function Sidebar({ activeWorkspaceId, onWorkspaceSelect }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expanded, setExpanded] = useState(true)

  return (
    <div className={`h-full flex flex-col bg-[#fafafa] border-r border-gray-200 transition-all duration-200 ${isCollapsed ? 'w-14' : 'w-[200px]'}`}>
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-3 border-b border-gray-200">
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-2">
              <img src="/images/raven-logo.png" alt="Raven" className="w-6 h-6 object-contain" />
              <span className="text-sm font-semibold text-gray-900">Raven</span>
            </div>
            <button onClick={() => setIsCollapsed(true)} className="p-1 rounded hover:bg-gray-200 cursor-pointer">
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
          </>
        ) : (
          <button onClick={() => setIsCollapsed(false)} className="w-full flex justify-center cursor-pointer group">
            <div className="relative w-6 h-6">
              <img src="/images/raven-logo.png" alt="Raven" className="w-6 h-6 object-contain group-hover:opacity-0 transition-opacity" />
              <ChevronRight className="w-4 h-4 absolute inset-0 m-auto opacity-0 group-hover:opacity-100 transition-opacity text-gray-600" />
            </div>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="px-2 py-2">
        {!isCollapsed ? (
          <button className="w-full flex items-center gap-2 px-2.5 py-1.5 text-sm text-gray-500 bg-white border border-gray-200 rounded-md hover:border-gray-300 cursor-pointer">
            <Search className="w-3.5 h-3.5" /><span>Search</span><span className="ml-auto text-xs text-gray-400">⌘K</span>
          </button>
        ) : (
          <button className="w-full flex justify-center p-2 hover:bg-gray-200 rounded-md cursor-pointer">
            <Search className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Workspaces */}
      <div className="flex-1 overflow-y-auto px-2">
        {!isCollapsed ? (
          <div className="py-1">
            <div className="flex items-center justify-between px-1 py-1">
              <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500 cursor-pointer hover:text-gray-700">
                {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                Workspaces
              </button>
              <button className="p-0.5 rounded hover:bg-gray-200 cursor-pointer"><Plus className="w-3.5 h-3.5 text-gray-500" /></button>
            </div>
            {expanded && (
              <div className="mt-1 space-y-0.5">
                {WORKSPACES.map(ws => (
                  <button
                    key={ws.id}
                    onClick={() => onWorkspaceSelect?.(ws.id)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-left transition-colors ${activeWorkspaceId === ws.id ? 'bg-white shadow-sm border border-gray-200' : 'hover:bg-gray-200/50'}`}
                  >
                    <FolderOpen className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-900 truncate flex-1">{ws.name}</span>
                    {ws.hasAlerts && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="py-2 space-y-1">
            {WORKSPACES.map(ws => (
              <button
                key={ws.id}
                onClick={() => onWorkspaceSelect?.(ws.id)}
                className={`w-full flex justify-center p-2 rounded-md cursor-pointer relative transition-colors ${activeWorkspaceId === ws.id ? 'bg-white shadow-sm border border-gray-200' : 'hover:bg-gray-200/50'}`}
                title={ws.name}
              >
                <FolderOpen className="w-4 h-4 text-gray-500" />
                {ws.hasAlerts && <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom */}
      <div className="px-2 py-2 border-t border-gray-200 space-y-0.5">
        {!isCollapsed ? (
          <>
            <Link href="/sources" className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-gray-200/50"><Database className="w-4 h-4 text-gray-500" /><span className="text-sm text-gray-700">Sources</span></Link>
            <Link href="/settings" className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-gray-200/50"><Settings className="w-4 h-4 text-gray-500" /><span className="text-sm text-gray-700">Settings</span></Link>
          </>
        ) : (
          <>
            <Link href="/sources" className="flex justify-center p-2 rounded-md cursor-pointer hover:bg-gray-200/50" title="Sources"><Database className="w-4 h-4 text-gray-500" /></Link>
            <Link href="/settings" className="flex justify-center p-2 rounded-md cursor-pointer hover:bg-gray-200/50" title="Settings"><Settings className="w-4 h-4 text-gray-500" /></Link>
          </>
        )}
      </div>
    </div>
  )
}