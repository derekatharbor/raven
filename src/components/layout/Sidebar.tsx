// Route: src/components/layout/Sidebar.tsx

'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Search, 
  ChevronRight,
  ChevronDown,
  FileText,
  FolderOpen,
  Database,
  Settings,
  Plus,
  Clock,
  AlertCircle,
} from 'lucide-react'

// Mock data - will come from API later
const RECENT_REPORTS = [
  { id: '1', name: 'Taiwan Strait Analysis', projectId: 'p1', updatedAt: 'today' },
  { id: '2', name: 'Q4 Revenue Model', projectId: 'p2', updatedAt: 'today' },
  { id: '3', name: 'Competitor Teardown', projectId: 'p1', updatedAt: 'yesterday' },
  { id: '4', name: 'Market Entry Memo', projectId: 'p3', updatedAt: 'yesterday' },
]

const PROJECTS = [
  { 
    id: 'p1', 
    name: 'Acme Corp DD', 
    reports: [
      { id: '1', name: 'Taiwan Strait Analysis', alerts: 2 },
      { id: '5', name: 'Supply Chain Risk', alerts: 0 },
    ]
  },
  { 
    id: 'p2', 
    name: 'Nordic Telecoms', 
    reports: [
      { id: '2', name: 'Q4 Revenue Model', alerts: 1 },
      { id: '6', name: 'Spectrum Analysis', alerts: 0 },
    ]
  },
  { 
    id: 'p3', 
    name: 'Series B Prep', 
    reports: [
      { id: '4', name: 'Market Entry Memo', alerts: 0 },
    ]
  },
]

const colors = {
  bg: '#FBF9F7',
  text: '#1a1a1a',
  textMuted: '#71717a',
  border: 'rgba(0,0,0,0.06)',
  hover: 'rgba(0,0,0,0.04)',
  accent: '#5BDFFA',
  alert: '#EF4444',
}

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['recent', 'projects']))
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())

  useEffect(() => {
    const saved = localStorage.getItem('harbor-sidebar-collapsed')
    if (saved) setIsCollapsed(saved === 'true')
  }, [])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('harbor-sidebar-collapsed', String(newState))
    window.dispatchEvent(new Event('sidebar-toggle'))
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) next.delete(section)
      else next.add(section)
      return next
    })
  }

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev)
      if (next.has(projectId)) next.delete(projectId)
      else next.add(projectId)
      return next
    })
  }

  const isActive = (href: string) => pathname === href

  // Group recent reports by date
  const todayReports = RECENT_REPORTS.filter(r => r.updatedAt === 'today')
  const yesterdayReports = RECENT_REPORTS.filter(r => r.updatedAt === 'yesterday')

  if (isCollapsed) {
    return (
      <div 
        className="fixed left-0 top-0 h-screen w-[56px] flex flex-col py-3 z-50"
        style={{ backgroundColor: colors.bg }}
      >
        {/* Logo */}
        <button
          onClick={toggleCollapse}
          className="w-8 h-8 flex items-center justify-center mx-auto mb-4 group cursor-pointer relative"
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

        {/* Collapsed nav icons */}
        <div className="flex flex-col items-center gap-1 px-2">
          <Link
            href="/overview"
            className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${
              isActive('/overview') ? 'bg-white shadow-sm' : 'hover:bg-white/50'
            }`}
            title="Overview"
          >
            <LayoutDashboard className="w-[18px] h-[18px]" style={{ color: colors.text }} strokeWidth={1.5} />
          </Link>
          <Link
            href="/search"
            className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${
              isActive('/search') ? 'bg-white shadow-sm' : 'hover:bg-white/50'
            }`}
            title="Search"
          >
            <Search className="w-[18px] h-[18px]" style={{ color: colors.text }} strokeWidth={1.5} />
          </Link>
          <Link
            href="/sources"
            className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${
              isActive('/sources') ? 'bg-white shadow-sm' : 'hover:bg-white/50'
            }`}
            title="Sources"
          >
            <Database className="w-[18px] h-[18px]" style={{ color: colors.text }} strokeWidth={1.5} />
          </Link>
          <Link
            href="/settings"
            className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${
              isActive('/settings') ? 'bg-white shadow-sm' : 'hover:bg-white/50'
            }`}
            title="Settings"
          >
            <Settings className="w-[18px] h-[18px]" style={{ color: colors.text }} strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="fixed left-0 top-0 h-screen w-[220px] flex flex-col py-3 z-50"
      style={{ backgroundColor: colors.bg }}
    >
      {/* Header */}
      <div className="px-4 mb-4 flex items-center justify-between">
        <button onClick={toggleCollapse} className="flex items-center gap-2 cursor-pointer">
          <img 
            src="/images/harbor-dark-logo.png" 
            alt="Harbor" 
            className="w-6 h-6 object-contain"
          />
          <span 
            className="text-[15px] font-semibold tracking-tight"
            style={{ color: colors.text }}
          >
            Harbor
          </span>
        </button>
        <button 
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-black/5 cursor-pointer"
          title="New report"
        >
          <Plus className="w-4 h-4" style={{ color: colors.textMuted }} strokeWidth={1.5} />
        </button>
      </div>

      {/* Main nav */}
      <div className="px-2 mb-2">
        <Link
          href="/overview"
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-colors cursor-pointer ${
            isActive('/overview') ? 'bg-white shadow-sm' : 'hover:bg-white/50'
          }`}
        >
          <LayoutDashboard className="w-[18px] h-[18px]" style={{ color: colors.text }} strokeWidth={1.5} />
          <span className="text-[13px] font-medium" style={{ color: colors.text }}>Overview</span>
        </Link>
        <Link
          href="/search"
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-colors cursor-pointer ${
            isActive('/search') ? 'bg-white shadow-sm' : 'hover:bg-white/50'
          }`}
        >
          <Search className="w-[18px] h-[18px]" style={{ color: colors.text }} strokeWidth={1.5} />
          <span className="text-[13px] font-medium" style={{ color: colors.text }}>Search</span>
        </Link>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-2">
        {/* Recent Section */}
        <div className="mb-3">
          <button
            onClick={() => toggleSection('recent')}
            className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-wide cursor-pointer hover:opacity-70"
            style={{ color: colors.textMuted }}
          >
            {expandedSections.has('recent') ? (
              <ChevronDown className="w-3 h-3" strokeWidth={2} />
            ) : (
              <ChevronRight className="w-3 h-3" strokeWidth={2} />
            )}
            Recent
          </button>
          
          {expandedSections.has('recent') && (
            <div className="mt-1">
              {todayReports.length > 0 && (
                <>
                  <div className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide" style={{ color: colors.textMuted }}>
                    Today
                  </div>
                  {todayReports.map(report => (
                    <Link
                      key={report.id}
                      href={`/report/${report.id}`}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer ${
                        isActive(`/report/${report.id}`) ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colors.textMuted }} strokeWidth={1.5} />
                      <span className="text-[12px] truncate" style={{ color: colors.text }}>{report.name}</span>
                    </Link>
                  ))}
                </>
              )}
              {yesterdayReports.length > 0 && (
                <>
                  <div className="px-2.5 py-1 mt-2 text-[10px] font-medium uppercase tracking-wide" style={{ color: colors.textMuted }}>
                    Yesterday
                  </div>
                  {yesterdayReports.map(report => (
                    <Link
                      key={report.id}
                      href={`/report/${report.id}`}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer ${
                        isActive(`/report/${report.id}`) ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colors.textMuted }} strokeWidth={1.5} />
                      <span className="text-[12px] truncate" style={{ color: colors.text }}>{report.name}</span>
                    </Link>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Projects Section */}
        <div className="mb-3">
          <div className="flex items-center justify-between px-2.5 py-1.5">
            <button
              onClick={() => toggleSection('projects')}
              className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide cursor-pointer hover:opacity-70"
              style={{ color: colors.textMuted }}
            >
              {expandedSections.has('projects') ? (
                <ChevronDown className="w-3 h-3" strokeWidth={2} />
              ) : (
                <ChevronRight className="w-3 h-3" strokeWidth={2} />
              )}
              Projects
            </button>
            <button 
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-black/5 cursor-pointer"
              title="New project"
            >
              <Plus className="w-3.5 h-3.5" style={{ color: colors.textMuted }} strokeWidth={1.5} />
            </button>
          </div>
          
          {expandedSections.has('projects') && (
            <div className="mt-1">
              {PROJECTS.map(project => {
                const totalAlerts = project.reports.reduce((sum, r) => sum + r.alerts, 0)
                const isExpanded = expandedProjects.has(project.id)
                
                return (
                  <div key={project.id}>
                    <button
                      onClick={() => toggleProject(project.id)}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer hover:bg-white/50"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3 h-3 flex-shrink-0" style={{ color: colors.textMuted }} strokeWidth={2} />
                      ) : (
                        <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: colors.textMuted }} strokeWidth={2} />
                      )}
                      <FolderOpen className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colors.textMuted }} strokeWidth={1.5} />
                      <span className="text-[12px] truncate flex-1 text-left" style={{ color: colors.text }}>
                        {project.name}
                      </span>
                      {totalAlerts > 0 && (
                        <span 
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: '#FEE2E2', color: colors.alert }}
                        >
                          {totalAlerts}
                        </span>
                      )}
                    </button>
                    
                    {isExpanded && (
                      <div className="ml-4 border-l border-gray-200 pl-2 mt-1">
                        {project.reports.map(report => (
                          <Link
                            key={report.id}
                            href={`/report/${report.id}`}
                            className={`flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors cursor-pointer ${
                              isActive(`/report/${report.id}`) ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                            }`}
                          >
                            <FileText className="w-3 h-3 flex-shrink-0" style={{ color: colors.textMuted }} strokeWidth={1.5} />
                            <span className="text-[11px] truncate flex-1" style={{ color: colors.text }}>
                              {report.name}
                            </span>
                            {report.alerts > 0 && (
                              <AlertCircle className="w-3 h-3 flex-shrink-0" style={{ color: colors.alert }} strokeWidth={2} />
                            )}
                          </Link>
                        ))}
                        <Link
                          href={`/project/${project.id}`}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors cursor-pointer hover:bg-white/50"
                        >
                          <span className="text-[11px]" style={{ color: colors.textMuted }}>View project →</span>
                        </Link>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="px-2 pt-2 border-t" style={{ borderColor: colors.border }}>
        <Link
          href="/sources"
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-colors cursor-pointer ${
            isActive('/sources') ? 'bg-white shadow-sm' : 'hover:bg-white/50'
          }`}
        >
          <Database className="w-[18px] h-[18px]" style={{ color: colors.text }} strokeWidth={1.5} />
          <span className="text-[13px] font-medium" style={{ color: colors.text }}>Sources</span>
        </Link>
        <Link
          href="/settings"
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-colors cursor-pointer ${
            isActive('/settings') ? 'bg-white shadow-sm' : 'hover:bg-white/50'
          }`}
        >
          <Settings className="w-[18px] h-[18px]" style={{ color: colors.text }} strokeWidth={1.5} />
          <span className="text-[13px] font-medium" style={{ color: colors.text }}>Settings</span>
        </Link>
      </div>
    </div>
  )
}