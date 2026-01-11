// Route: src/components/layout/Sidebar.tsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard,
  FileText,
  Radio,
  Settings,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  LogOut,
  Sparkles
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { name: 'Overview', href: '/overview', icon: LayoutDashboard },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Monitoring', href: '/monitoring', icon: Radio },
]

const BOTTOM_ITEMS = [
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('harbor-sidebar-collapsed') === 'true'
    }
    return false
  })

  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem('harbor-theme') as 'light' | 'dark' | null
    const initialTheme = savedTheme || 'light'
    setTheme(initialTheme)
    document.documentElement.setAttribute('data-theme', initialTheme)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('harbor-theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('harbor-sidebar-collapsed', String(newState))
    window.dispatchEvent(new Event('sidebar-toggle'))
  }

  const isDark = theme === 'dark'

  const colors = {
    bg: isDark ? '#171717' : '#FFFFFF',
    text: isDark ? '#F4F6F8' : '#111827',
    muted: isDark ? 'rgba(244,246,248,0.5)' : '#6B7280',
    border: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB',
    hover: isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6',
    accent: '#5BDFFA',
  }

  const isActive = (href: string) => {
    if (href === '/documents') {
      return pathname === href || pathname?.startsWith('/documents/')
    }
    return pathname === href
  }

  return (
    <aside 
      className={`
        hidden lg:flex fixed left-0 top-0 h-screen 
        border-r flex-col transition-all duration-300 z-[100] 
        ${isCollapsed ? 'w-20' : 'w-60'}
      `}
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
      }}
    >
      {/* Header */}
      <div 
        className="px-6 py-4 border-b flex items-center justify-between"
        style={{ borderColor: colors.border }}
      >
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img 
                src={isDark ? '/images/Harbor_White_Logo.png' : '/images/harbor-dark-solo.svg'}
                alt="Harbor Logo" 
                className="w-10 h-10 object-contain"
              />
            </div>
            <h1 
              className="text-lg font-bold"
              style={{ color: colors.text }}
            >
              Harbor
            </h1>
          </div>
        )}
        {isCollapsed && (
          <button
            onClick={toggleCollapse}
            className="w-10 h-10 flex items-center justify-center mx-auto group relative cursor-pointer transition-all"
            title="Expand sidebar"
          >
            <img 
              src={isDark ? '/images/Harbor_White_Logo.png' : '/images/harbor-dark-solo.svg'}
              alt="Harbor Logo" 
              className="w-10 h-10 object-contain group-hover:opacity-0 transition-opacity"
            />
            <ChevronRight 
              className="w-5 h-5 absolute opacity-0 group-hover:opacity-100 transition-opacity" 
              style={{ color: colors.text }}
              strokeWidth={2} 
            />
          </button>
        )}
        {!isCollapsed && (
          <button
            onClick={toggleCollapse}
            className="p-1.5 rounded-lg transition-colors cursor-pointer"
            style={{ color: colors.muted }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className={`flex-1 ${isCollapsed ? '' : 'overflow-y-auto overflow-x-hidden'}`}>
        <div className="px-4 pt-6 pb-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center rounded-lg mb-1
                  transition-colors cursor-pointer relative group
                  ${isCollapsed ? 'py-3 justify-center' : 'gap-3 py-2.5 px-3'}
                  ${active && !isCollapsed ? 'pl-[10px]' : ''}
                `}
                style={{
                  color: active ? colors.text : colors.muted,
                  backgroundColor: active ? colors.hover : 'transparent',
                  borderLeft: active && !isCollapsed ? `2px solid ${colors.accent}` : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = colors.hover
                    e.currentTarget.style.color = colors.text
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = colors.muted
                  }
                }}
              >
                <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                {!isCollapsed && <span className="text-sm truncate">{item.name}</span>}
                
                {isCollapsed && (
                  <div 
                    className="absolute left-full ml-2 px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-[200] shadow-lg"
                    style={{
                      backgroundColor: colors.bg,
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    {item.name}
                  </div>
                )}
              </Link>
            )
          })}
        </div>

        {/* Settings */}
        <div 
          className="px-4 py-3 border-t"
          style={{ borderColor: colors.border }}
        >
          {BOTTOM_ITEMS.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center rounded-lg mb-1
                  transition-colors cursor-pointer relative group
                  ${isCollapsed ? 'py-3 justify-center' : 'gap-3 py-2.5 px-3'}
                  ${active && !isCollapsed ? 'pl-[10px]' : ''}
                `}
                style={{
                  color: active ? colors.text : colors.muted,
                  borderLeft: active && !isCollapsed ? `2px solid ${colors.accent}` : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = colors.hover
                    e.currentTarget.style.color = colors.text
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = colors.muted
                  }
                }}
              >
                <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                {!isCollapsed && <span className="text-sm truncate">{item.name}</span>}
                
                {isCollapsed && (
                  <div 
                    className="absolute left-full ml-2 px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-[200] shadow-lg"
                    style={{
                      backgroundColor: colors.bg,
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    {item.name}
                  </div>
                )}
              </Link>
            )
          })}
        </div>

        {/* Upgrade */}
        <div 
          className="px-4 py-3 border-t"
          style={{ borderColor: colors.border }}
        >
          <Link
            href="/pricing"
            className={`
              flex items-center rounded-lg
              transition-all cursor-pointer relative group
              ${isCollapsed ? 'py-3 justify-center' : 'gap-3 py-2.5 px-3'}
            `}
            style={{ 
              color: colors.muted,
              background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'
              e.currentTarget.style.color = colors.text
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
              e.currentTarget.style.color = colors.muted
            }}
          >
            <Sparkles className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-sm">Upgrade</span>
                <span className="text-xs opacity-60">Unlock more features</span>
              </div>
            )}
            
            {isCollapsed && (
              <div 
                className="absolute left-full ml-2 px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-[200] shadow-lg"
                style={{
                  backgroundColor: colors.bg,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                }}
              >
                Upgrade Plan
              </div>
            )}
          </Link>
        </div>

        {/* Theme Toggle */}
        <div 
          className="px-4 py-3 border-t"
          style={{ borderColor: colors.border }}
        >
          <div
            onClick={toggleTheme}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                toggleTheme()
              }
            }}
            className={`
              flex items-center rounded-lg
              transition-colors cursor-pointer relative group
              ${isCollapsed ? 'py-3 justify-center' : 'gap-3 py-2.5 px-3'}
            `}
            style={{ color: colors.muted }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.hover
              e.currentTarget.style.color = colors.text
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = colors.muted
            }}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
            ) : (
              <Sun className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
            )}
            {!isCollapsed && (
              <span className="text-sm">
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </span>
            )}
            
            {isCollapsed && (
              <div 
                className="absolute left-full ml-2 px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-[200] shadow-lg"
                style={{
                  backgroundColor: colors.bg,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                }}
              >
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </div>
            )}
          </div>
        </div>

        {/* Sign Out */}
        <div 
          className="px-4 py-3 border-t"
          style={{ borderColor: colors.border }}
        >
          <button
            onClick={handleSignOut}
            className={`
              w-full flex items-center rounded-lg
              transition-colors cursor-pointer relative group
              ${isCollapsed ? 'py-3 justify-center' : 'gap-3 py-2.5 px-3'}
            `}
            style={{ color: colors.muted }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'
              e.currentTarget.style.color = '#F87171'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = colors.muted
            }}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
            {!isCollapsed && <span className="text-sm">Sign Out</span>}
            
            {isCollapsed && (
              <div 
                className="absolute left-full ml-2 px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-[200] shadow-lg"
                style={{
                  backgroundColor: colors.bg,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                }}
              >
                Sign Out
              </div>
            )}
          </button>
        </div>
      </nav>
    </aside>
  )
}
