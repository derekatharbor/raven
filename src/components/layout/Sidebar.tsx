// src/components/layout/Sidebar.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  FolderOpen,
  Database,
  Settings,
  Plus,
  Layers,
} from 'lucide-react'

const WORKSPACES = [
  { id: 'w1', name: 'Acme Corp DD', alerts: 2 },
  { id: 'w2', name: 'Nordic Telecoms', alerts: 1 },
  { id: 'w3', name: 'Series B Prep', alerts: 0 },
]

interface SidebarProps {
  activeWorkspaceId?: string | null
  onWorkspaceSelect?: (workspaceId: string) => void
}

export default function Sidebar({ activeWorkspaceId, onWorkspaceSelect }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [workspacesExpanded, setWorkspacesExpanded] = useState(true)

  const isActive = (href: string) => pathname === href

  return (
    <div 
      className={`
        h-full flex flex-col bg-[#F8F8F7] border-r border-[#E8E8E6]
        transition-all duration-200 ease-in-out
        ${isCollapsed ? 'w-12' : 'w-[200px]'}
      `}
    >
      {/* Header */}
      <div className="h-11 flex items-center justify-between px-3 border-b border-[#E8E8E6]">
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[#5F6AD2] flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">R</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">Raven</span>
            </div>
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1 rounded hover:bg-black/5 cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-full flex items-center justify-center cursor-pointer group"
          >
            <div className="w-5 h-5 rounded bg-[#5F6AD2] flex items-center justify-center group-hover:bg-[#4F5AC2] transition-colors">
              <span className="text-white text-[10px] font-bold">R</span>
            </div>
          </button>
        )}
      </div>

      {/* Workspaces */}
      <div className="flex-1 overflow-y-auto">
        {!isCollapsed ? (
          <div className="px-2 py-2">
            <div className="flex items-center justify-between px-1 mb-1">
              <button
                onClick={() => setWorkspacesExpanded(!workspacesExpanded)}
                className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:text-gray-700"
              >
                {workspacesExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                Workspaces
              </button>
              <button className="p-0.5 rounded hover:bg-black/5 cursor-pointer">
                <Plus className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>

            {workspacesExpanded && (
              <div className="space-y-0.5">
                {WORKSPACES.map(ws => (
                  <button
                    key={ws.id}
                    onClick={() => onWorkspaceSelect?.(ws.id)}
                    className={`
                      w-full flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors
                      ${activeWorkspaceId === ws.id 
                        ? 'bg-white shadow-sm border border-[#E8E8E6]' 
                        : 'hover:bg-black/5'
                      }
                    `}
                  >
                    <FolderOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-[13px] text-gray-900 truncate flex-1 text-left">{ws.name}</span>
                    {ws.alerts > 0 && (
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-[#FD7941]/10 text-[#FD7941]">
                        {ws.alerts}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Collapsed: single workspaces icon */
          <div className="px-2 py-3">
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-full flex items-center justify-center p-2 rounded hover:bg-black/5 cursor-pointer transition-colors"
              title="Workspaces"
            >
              <Layers className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="px-2 py-2 space-y-0.5 border-t border-[#E8E8E6]">
        {!isCollapsed ? (
          <>
            <Link
              href="/sources"
              className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${isActive('/sources') ? 'bg-white shadow-sm border border-[#E8E8E6]' : 'hover:bg-black/5'}`}
            >
              <Database className="w-4 h-4 text-gray-400" />
              <span className="text-[13px] text-gray-900">Sources</span>
            </Link>
            <Link
              href="/settings"
              className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${isActive('/settings') ? 'bg-white shadow-sm border border-[#E8E8E6]' : 'hover:bg-black/5'}`}
            >
              <Settings className="w-4 h-4 text-gray-400" />
              <span className="text-[13px] text-gray-900">Settings</span>
            </Link>
          </>
        ) : (
          <>
            <Link href="/sources" className="flex items-center justify-center p-2 rounded hover:bg-black/5 cursor-pointer" title="Sources">
              <Database className="w-4 h-4 text-gray-500" />
            </Link>
            <Link href="/settings" className="flex items-center justify-center p-2 rounded hover:bg-black/5 cursor-pointer" title="Settings">
              <Settings className="w-4 h-4 text-gray-500" />
            </Link>
          </>
        )}
      </div>
    </div>
  )
}