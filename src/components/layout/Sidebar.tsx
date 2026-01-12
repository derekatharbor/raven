// Route: src/components/layout/Sidebar.tsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Search, 
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  FileText,
  FolderOpen,
  Database,
  Settings,
  Plus,
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
  border: 'rgba(0,0,0,0.08)',
  hover: 'rgba(0,0,0,0.06)',
  accent: '#5BDFFA',
  alert: '#EF4444',
}

export default function Sidebar() {
  const pathname = usePathname()
  
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('harbor-sidebar-collapsed') === 'true'
    }
    return false
  })
  
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['recent', 'projects']))
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())

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

  return (
    <aside 
      className={`
        hidden lg:flex fixed left-0 top-0 h-screen 
        flex-col transition-all duration-300 ease-in-out z-[100]
        ${isCollapsed ? 'w-[56px]' : 'w-[220px]'}
      `}
      style={{ backgroundColor: colors.bg }}
    >
      {/* Header */}
      <div 
        className="px-4 py-3 border-b flex items-center justify-between"
        style={{ borderColor: colors.border }}
      >
        {!isCollapsed && (
          <div className="flex items-center gap-2">
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
          </div>
        )}
        
        {isCollapsed && (
          <button
            onClick={toggleCollapse}
            className="w-8 h-8 flex items-center justify-center mx-auto group relative cursor-pointer"
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
            className="p-1 rounded-md transition-colors cursor-pointer"
            style={{ color: colors.textMuted }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Main nav */}
      <div className="px-2 py-2 border-b" style={{ borderColor: colors.border }}>
        <Link
          href="/overview"
          className={`
            flex items-center rounded-md transition-colors cursor-pointer relative group
            ${isCollapsed ? 'py-2.5 justify-center' : 'gap-2.5 px-2.5 py-2'}
            ${isActive('/overview') ? 'bg-white shadow-sm' : ''}
          `}
          onMouseEnter={(e) => !isActive('/overview') && (e.currentTarget.style.backgroundColor = colors.hover)}
          onMouseLeave={(e) => !isActive('/overview') && (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <LayoutDashboard className="w-[18px] h-[18px] flex-shrink-0" style={{ color: colors.text }} strokeWidth={1.5} />
          {!isCollapsed && <span className="text-[13px] font-medium" style={{ color: colors.text }}>Overview</span>}
          {isCollapsed && (
            <div 
              className="absolute left-full ml-2 px-2 py-1 text-xs font-medium rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-[200] shadow-md"
              style={{ backgroundColor: 'white', color: colors.text, border: `1px solid ${colors.border}` }}
            >
              Overview
            </div>
          )}
        </Link>
        <Link
          href="/search"
          className={`
            flex items-center rounded-md transition-colors cursor-pointer relative group
            ${isCollapsed ? 'py-2.5 justify-center' : 'gap-2.5 px-2.5 py-2'}
            ${isActive('/search') ? 'bg-white shadow-sm' : ''}
          `}
          onMouseEnter={(e) => !isActive('/search') && (e.currentTarget.style.backgroundColor = colors.hover)}
          onMouseLeave={(e) => !isActive('/search') && (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <Search className="w-[18px] h-[18px] flex-shrink-0" style={{ color: colors.text }} strokeWidth={1.5} />
          {!isCollapsed && <span className="text-[13px] font-medium" style={{ color: colors.text }}>Search</span>}
          {isCollapsed && (
            <div 
              className="absolute left-full ml-2 px-2 py-1 text-xs font-medium rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-[200] shadow-md"
              style={{ backgroundColor: 'white', color: colors.text, border: `1px solid ${colors.border}` }}
            >
              Search
            </div>
          )}
        </Link>
      </div>

      {/* Scrollable content */}
      <nav className={`flex-1 ${isCollapsed ? '' : 'overflow-y-auto overflow-x-hidden'}`}>
        
        {/* Recent Section */}
        {!isCollapsed && (
          <div className="px-2 pt-4 pb-2">
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
                        className={`
                          flex items-center gap-2 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer
                          ${isActive(`/report/${report.id}`) ? 'bg-white shadow-sm' : ''}
                        `}
                        onMouseEnter={(e) => !isActive(`/report/${report.id}`) && (e.currentTarget.style.backgroundColor = colors.hover)}
                        onMouseLeave={(e) => !isActive(`/report/${report.id}`) && (e.currentTarget.style.backgroundColor = 'transparent')}
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
                        className={`
                          flex items-center gap-2 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer
                          ${isActive(`/report/${report.id}`) ? 'bg-white shadow-sm' : ''}
                        `}
                        onMouseEnter={(e) => !isActive(`/report/${report.id}`) && (e.currentTarget.style.backgroundColor = colors.hover)}
                        onMouseLeave={(e) => !isActive(`/report/${report.id}`) && (e.currentTarget.style.backgroundColor = 'transparent')}
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
        )}

        {/* Projects Section */}
        {!isCollapsed && (
          <div className="px-2 pb-2">
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
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hover}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
                        <div className="ml-4 border-l pl-2 mt-1" style={{ borderColor: colors.border }}>
                          {project.reports.map(report => (
                            <Link
                              key={report.id}
                              href={`/report/${report.id}`}
                              className={`
                                flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors cursor-pointer
                                ${isActive(`/report/${report.id}`) ? 'bg-white shadow-sm' : ''}
                              `}
                              onMouseEnter={(e) => !isActive(`/report/${report.id}`) && (e.currentTarget.style.backgroundColor = colors.hover)}
                              onMouseLeave={(e) => !isActive(`/report/${report.id}`) && (e.currentTarget.style.backgroundColor = 'transparent')}
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
                            className="flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors cursor-pointer"
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hover}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
        )}

        {/* Collapsed state - just show icons for projects/recent */}
        {isCollapsed && (
          <div className="px-2 py-4 flex flex-col items-center gap-1">
            <button
              className="w-10 h-10 flex items-center justify-center rounded-md transition-colors cursor-pointer relative group"
              title="Recent"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <FileText className="w-[18px] h-[18px]" style={{ color: colors.textMuted }} strokeWidth={1.5} />
              <div 
                className="absolute left-full ml-2 px-2 py-1 text-xs font-medium rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-[200] shadow-md"
                style={{ backgroundColor: 'white', color: colors.text, border: `1px solid ${colors.border}` }}
              >
                Recent Reports
              </div>
            </button>
            <button
              className="w-10 h-10 flex items-center justify-center rounded-md transition-colors cursor-pointer relative group"
              title="Projects"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <FolderOpen className="w-[18px] h-[18px]" style={{ color: colors.textMuted }} strokeWidth={1.5} />
              <div 
                className="absolute left-full ml-2 px-2 py-1 text-xs font-medium rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-[200] shadow-md"
                style={{ backgroundColor: 'white', color: colors.text, border: `1px solid ${colors.border}` }}
              >
                Projects
              </div>
            </button>
          </div>
        )}
      </nav>

      {/* Bottom nav */}
      <div className="px-2 py-2 border-t" style={{ borderColor: colors.border }}>
        <Link
          href="/sources"
          className={`
            flex items-center rounded-md transition-colors cursor-pointer relative group
            ${isCollapsed ? 'py-2.5 justify-center' : 'gap-2.5 px-2.5 py-2'}
            ${isActive('/sources') ? 'bg-white shadow-sm' : ''}
          `}
          onMouseEnter={(e) => !isActive('/sources') && (e.currentTarget.style.backgroundColor = colors.hover)}
          onMouseLeave={(e) => !isActive('/sources') && (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <Database className="w-[18px] h-[18px] flex-shrink-0" style={{ color: colors.text }} strokeWidth={1.5} />
          {!isCollapsed && <span className="text-[13px] font-medium" style={{ color: colors.text }}>Sources</span>}
          {isCollapsed && (
            <div 
              className="absolute left-full ml-2 px-2 py-1 text-xs font-medium rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-[200] shadow-md"
              style={{ backgroundColor: 'white', color: colors.text, border: `1px solid ${colors.border}` }}
            >
              Sources
            </div>
          )}
        </Link>
        <Link
          href="/settings"
          className={`
            flex items-center rounded-md transition-colors cursor-pointer relative group
            ${isCollapsed ? 'py-2.5 justify-center' : 'gap-2.5 px-2.5 py-2'}
            ${isActive('/settings') ? 'bg-white shadow-sm' : ''}
          `}
          onMouseEnter={(e) => !isActive('/settings') && (e.currentTarget.style.backgroundColor = colors.hover)}
          onMouseLeave={(e) => !isActive('/settings') && (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <Settings className="w-[18px] h-[18px] flex-shrink-0" style={{ color: colors.text }} strokeWidth={1.5} />
          {!isCollapsed && <span className="text-[13px] font-medium" style={{ color: colors.text }}>Settings</span>}
          {isCollapsed && (
            <div 
              className="absolute left-full ml-2 px-2 py-1 text-xs font-medium rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-[200] shadow-md"
              style={{ backgroundColor: 'white', color: colors.text, border: `1px solid ${colors.border}` }}
            >
              Settings
            </div>
          )}
        </Link>
      </div>
    </aside>
  )
}