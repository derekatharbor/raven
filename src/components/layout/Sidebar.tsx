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
  
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('harbor-sidebar-collapsed') === 'true'
    }
    return false
  })

  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const handleSignOut = async () => {
    const supabase = createClient()
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
    bg: isDark ? '#171717' : '#FBF9F7',
    text: isDark ? '#F4F6F8' : '#1a1a1a',
    muted: isDark ? 'rgba(244,246,248,0.5)' : '#71717a',
    border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    hover: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
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
        flex-col transition-all duration-200 z-[100]
        ${isCollapsed ? 'w-[56px]' : 'w-[200px]'}
      `}
      style={{
        backgroundColor: colors.bg,
      }}
    >
      {/* Header */}
      <div className="px-3 py-3 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 flex items-center justify-center">
              <img 
                src="/images/harbor-dark-logo.png" 
                alt="Harbor" 
                className="w-6 h-6 object-contain"
              />
            </div>
            <span 
              className="text-sm font-semibold tracking-tight"
              style={{ color: colors.text }}
            >
              Harbor
            </span>
          </div>
        )}
        {isCollapsed && (
          <button
            onClick={toggleCollapse}
            className="w-8 h-8 flex items-center justify-center mx-auto group cursor-pointer relative"
            title="Expand sidebar"
          >
            <img 
              src="/images/harbor-dark-logo.png" 
              alt="Harbor" 
              className="w-6 h-6 object-contain group-hover:opacity-0 transition-opacity"
            />
            <ChevronRight 
              className="w-4 h-4 absolute opacity-0 group-hover:opacity-100 transition-opacity" 
              style={{ color: colors.text }}
              strokeWidth={1.5}
            />
          </button>
        )}
        {!isCollapsed && (
          <button
            onClick={toggleCollapse}
            className="p-1 rounded transition-colors cursor-pointer"
            style={{ color: colors.muted }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-2 py-2">
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center rounded-md transition-colors cursor-pointer relative group
                  ${isCollapsed ? 'p-2 justify-center' : 'gap-2.5 py-1.5 px-2'}
                `}
                style={{
                  color: active ? colors.text : colors.muted,
                  backgroundColor: active ? colors.hover : 'transparent',
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
                <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.5} />
                {!isCollapsed && <span className="text-[13px]">{item.name}</span>}
                
                {isCollapsed && (
                  <div 
                    className="absolute left-full ml-2 px-2 py-1 text-xs rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-[200] shadow-sm"
                    style={{
                      backgroundColor: isDark ? '#262626' : '#fff',
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

        {/* Divider */}
        <div 
          className="my-3 mx-2 h-px"
          style={{ backgroundColor: colors.border }}
        />

        {/* Bottom Items */}
        <div className="space-y-0.5">
          {BOTTOM_ITEMS.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center rounded-md transition-colors cursor-pointer relative group
                  ${isCollapsed ? 'p-2 justify-center' : 'gap-2.5 py-1.5 px-2'}
                `}
                style={{
                  color: active ? colors.text : colors.muted,
                  backgroundColor: active ? colors.hover : 'transparent',
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
                <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.5} />
                {!isCollapsed && <span className="text-[13px]">{item.name}</span>}
                
                {isCollapsed && (
                  <div 
                    className="absolute left-full ml-2 px-2 py-1 text-xs rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-[200] shadow-sm"
                    style={{
                      backgroundColor: isDark ? '#262626' : '#fff',
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
      </nav>

      {/* Footer */}
      <div className="px-2 py-2 space-y-0.5">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`
            w-full flex items-center rounded-md transition-colors cursor-pointer relative group
            ${isCollapsed ? 'p-2 justify-center' : 'gap-2.5 py-1.5 px-2'}
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
            <Moon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.5} />
          ) : (
            <Sun className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.5} />
          )}
          {!isCollapsed && (
            <span className="text-[13px]">
              {theme === 'light' ? 'Dark' : 'Light'}
            </span>
          )}
          
          {isCollapsed && (
            <div 
              className="absolute left-full ml-2 px-2 py-1 text-xs rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-[200] shadow-sm"
              style={{
                backgroundColor: isDark ? '#262626' : '#fff',
                color: colors.text,
                border: `1px solid ${colors.border}`,
              }}
            >
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </div>
          )}
        </button>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className={`
            w-full flex items-center rounded-md transition-colors cursor-pointer relative group
            ${isCollapsed ? 'p-2 justify-center' : 'gap-2.5 py-1.5 px-2'}
          `}
          style={{ color: colors.muted }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'
            e.currentTarget.style.color = '#ef4444'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = colors.muted
          }}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.5} />
          {!isCollapsed && <span className="text-[13px]">Sign Out</span>}
          
          {isCollapsed && (
            <div 
              className="absolute left-full ml-2 px-2 py-1 text-xs rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-[200] shadow-sm"
              style={{
                backgroundColor: isDark ? '#262626' : '#fff',
                color: colors.text,
                border: `1px solid ${colors.border}`,
              }}
            >
              Sign Out
            </div>
          )}
        </button>
      </div>
    </aside>
  )
}