// src/components/layout/Sidebar.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  ChevronRight,
  ChevronLeft,
  PenLine,
  Database,
  Settings,
  Check,
  Home,
  BarChart3,
  Radar,
  Search,
  LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface SidebarProps {
  connectedSourceCount?: number
}

export default function Sidebar({ connectedSourceCount = 0 }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const supabase = createClient()

  const isActive = (href: string) => pathname?.startsWith(href)
  
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div 
      className={`
        h-full flex flex-col bg-[#FBF9F7] border-r border-gray-200
        transition-all duration-200 ease-in-out
        ${isCollapsed ? 'w-12' : 'w-[200px]'}
      `}
    >
      {/* Header */}
      <div className="h-11 flex items-center justify-between px-3 border-b border-gray-200">
        {!isCollapsed ? (
          <>
            <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src="/images/raven-logo.png" alt="Raven" className="w-5 h-5 object-contain" />
              <span className="text-sm font-semibold text-gray-900">Raven</span>
            </Link>
            <button onClick={() => setIsCollapsed(true)} className="p-1 rounded hover:bg-black/5 cursor-pointer">
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            </button>
          </>
        ) : (
          <button onClick={() => setIsCollapsed(false)} className="w-full flex items-center justify-center cursor-pointer group">
            <div className="relative">
              <img src="/images/raven-logo.png" alt="Raven" className="w-5 h-5 object-contain group-hover:opacity-0 transition-opacity" />
              <ChevronRight className="w-4 h-4 absolute inset-0 m-auto opacity-0 group-hover:opacity-100 transition-opacity text-gray-500" />
            </div>
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-2 py-2">
        {!isCollapsed ? (
          <div className="space-y-0.5">
            <Link 
              href="/dashboard"
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded transition-colors ${isActive('/dashboard') ? 'bg-white shadow-sm border border-gray-200' : 'hover:bg-black/5'}`}
            >
              <Home className="w-4 h-4 text-gray-400" />
              <span className="text-[13px] text-gray-900">Home</span>
            </Link>
            <Link 
              href="/search"
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded transition-colors ${isActive('/search') ? 'bg-white shadow-sm border border-gray-200' : 'hover:bg-black/5'}`}
            >
              <Search className="w-4 h-4 text-gray-400" />
              <span className="text-[13px] text-gray-900">Search</span>
            </Link>
            <Link 
              href="/workspace"
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded transition-colors ${isActive('/workspace') ? 'bg-white shadow-sm border border-gray-200' : 'hover:bg-black/5'}`}
            >
              <PenLine className="w-4 h-4 text-gray-400" />
              <span className="text-[13px] text-gray-900">Editor</span>
            </Link>
            <Link 
              href="/analytics"
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded transition-colors ${isActive('/analytics') ? 'bg-white shadow-sm border border-gray-200' : 'hover:bg-black/5'}`}
            >
              <BarChart3 className="w-4 h-4 text-gray-400" />
              <span className="text-[13px] text-gray-900">Analytics</span>
            </Link>
            <Link 
              href="/track"
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded transition-colors ${isActive('/track') ? 'bg-white shadow-sm border border-gray-200' : 'hover:bg-black/5'}`}
            >
              <Radar className="w-4 h-4 text-gray-400" />
              <span className="text-[13px] text-gray-900">Track</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-0.5">
            <Link 
              href="/dashboard"
              className={`flex items-center justify-center p-2 rounded ${isActive('/dashboard') ? 'bg-white shadow-sm border border-gray-200' : 'hover:bg-black/5'}`}
              title="Home"
            >
              <Home className="w-4 h-4 text-gray-500" />
            </Link>
            <Link 
              href="/search"
              className={`flex items-center justify-center p-2 rounded ${isActive('/search') ? 'bg-white shadow-sm border border-gray-200' : 'hover:bg-black/5'}`}
              title="Search"
            >
              <Search className="w-4 h-4 text-gray-500" />
            </Link>
            <Link 
              href="/workspace"
              className={`flex items-center justify-center p-2 rounded ${isActive('/workspace') ? 'bg-white shadow-sm border border-gray-200' : 'hover:bg-black/5'}`}
              title="Editor"
            >
              <PenLine className="w-4 h-4 text-gray-500" />
            </Link>
            <Link 
              href="/analytics"
              className={`flex items-center justify-center p-2 rounded ${isActive('/analytics') ? 'bg-white shadow-sm border border-gray-200' : 'hover:bg-black/5'}`}
              title="Analytics"
            >
              <BarChart3 className="w-4 h-4 text-gray-500" />
            </Link>
            <Link 
              href="/track"
              className={`flex items-center justify-center p-2 rounded ${isActive('/track') ? 'bg-white shadow-sm border border-gray-200' : 'hover:bg-black/5'}`}
              title="Track"
            >
              <Radar className="w-4 h-4 text-gray-500" />
            </Link>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="px-2 py-2 space-y-0.5 border-t border-gray-200">
        {!isCollapsed ? (
          <>
            <Link 
              href="/sources"
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded transition-colors ${isActive('/sources') ? 'bg-white shadow-sm border border-gray-200' : 'hover:bg-black/5'}`}
            >
              <Database className="w-4 h-4 text-gray-400" />
              <span className="text-[13px] text-gray-900 flex-1 text-left">Sources</span>
              {connectedSourceCount > 0 && (
                <span className="flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                  <Check className="w-2.5 h-2.5" />
                  {connectedSourceCount}
                </span>
              )}
            </Link>
            <Link 
              href="/settings" 
              className={`flex items-center gap-2 px-2 py-1.5 rounded transition-colors ${isActive('/settings') ? 'bg-white shadow-sm border border-gray-200' : 'hover:bg-black/5'}`}
            >
              <Settings className="w-4 h-4 text-gray-400" />
              <span className="text-[13px] text-gray-900">Settings</span>
            </Link>
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded transition-colors hover:bg-black/5"
            >
              <LogOut className="w-4 h-4 text-gray-400" />
              <span className="text-[13px] text-gray-500">Sign out</span>
            </button>
          </>
        ) : (
          <>
            <Link 
              href="/sources"
              className={`relative flex items-center justify-center p-2 rounded ${isActive('/sources') ? 'bg-white shadow-sm border border-gray-200' : 'hover:bg-black/5'}`}
              title="Sources"
            >
              <Database className="w-4 h-4 text-gray-500" />
              {connectedSourceCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border border-[#FBF9F7]" />
              )}
            </Link>
            <Link 
              href="/settings" 
              className={`flex items-center justify-center p-2 rounded ${isActive('/settings') ? 'bg-white shadow-sm border border-gray-200' : 'hover:bg-black/5'}`} 
              title="Settings"
            >
              <Settings className="w-4 h-4 text-gray-500" />
            </Link>
            <button 
              onClick={handleSignOut}
              className="flex items-center justify-center p-2 rounded transition-colors hover:bg-black/5"
              title="Sign out"
            >
              <LogOut className="w-4 h-4 text-gray-500" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}