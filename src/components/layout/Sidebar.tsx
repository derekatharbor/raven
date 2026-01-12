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
  PenTool,
} from 'lucide-react'

// Mock data
const RECENT_REPORTS = [
  { id: '1', name: 'Taiwan Strait Analysis', updatedAt: 'today' },
  { id: '2', name: 'Q4 Revenue Model', updatedAt: 'today' },
  { id: '3', name: 'Competitor Teardown', updatedAt: 'yesterday' },
  { id: '4', name: 'Market Entry Memo', updatedAt: 'yesterday' },
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
  alert: '#EF4444',
}

interface SidebarProps {
  collapsed?: boolean
}

export default function Sidebar({ collapsed: controlledCollapsed }: SidebarProps) {
  const pathname = usePathname()
  
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('harbor-sidebar-collapsed') === 'true'
    }
    return false
  })
  
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['recent', 'projects']))
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())

  // Sync with controlled prop if provided
  useEffect(() => {
    if (controlledCollapsed !== undefined) {
      setIsCollapsed(controlledCollapsed)
    }
  }, [controlledCollapsed])

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

  const todayReports = RECENT_REPORTS.filter(r => r.updatedAt === 'today')
  const yesterdayReports = RECENT_REPORTS.filter(r => r.updatedAt === 'yesterday')

  return (
    <aside 
      className={`
        h-screen flex flex-col flex-shrink-0 fixed left-0 top-0
        transition-all duration-300 ease-in-out z-[100]
        ${isCollapsed ? 'w-16' : 'w-56'}
      `}
      style={{ backgroundColor: colors.bg }}
    >
      {/* Header */}
      <div className="px-3 py-4 flex items-center justify-between">
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-2">
              <img 
                src="/images/harbor-dark-logo.png" 
                alt="Harbor" 
                className="w-6 h-6 object-contain"
              />
              <span className="text-sm font-semibold" style={{ color: colors.text }}>
                Harbor
              </span>
            </div>
            <button
              onClick={toggleCollapse}
              className="p-1 rounded-md cursor-pointer transition-colors"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <ChevronLeft className="w-4 h-4" style={{ color: colors.textMuted }} strokeWidth={1.5} />
            </button>
          </>
        ) : (
          <button
            onClick={toggleCollapse}
            className="w-full flex items-center justify-center py-1 group cursor-pointer"
          >
            <div className="relative">
              <img 
                src="/images/harbor-dark-logo.png" 
                alt="Harbor" 
                className="w-6 h-6 object-contain group-hover:opacity-0 transition-opacity"
              />
              <ChevronRight 
                className="w-4 h-4 absolute inset-0 m-auto opacity-0 group-hover:opacity-100 transition-opacity" 
                style={{ color: colors.text }}
                strokeWidth={1.5}
              />
            </div>
          </button>
        )}
      </div>

      {/* Main nav */}
      <div className="px-2 pb-2 space-y-1">
        <NavItem 
          href="/overview" 
          icon={LayoutDashboard} 
          label="Overview" 
          isActive={isActive('/overview')}
          isCollapsed={isCollapsed}
        />
        <NavItem 
          href="/workspace" 
          icon={PenTool} 
          label="Workspace" 
          isActive={isActive('/workspace')}
          isCollapsed={isCollapsed}
        />
        <NavItem 
          href="/search" 
          icon={Search} 
          label="Search" 
          isActive={isActive('/search')}
          isCollapsed={isCollapsed}
        />
      </div>

      {/* Scrollable content */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2">
        {!isCollapsed ? (
          <>
            {/* Recent Section */}
            <div className="py-2">
              <button
                onClick={() => toggleSection('recent')}
                className="w-full flex items-center gap-1.5 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider cursor-pointer"
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
                <div className="mt-1 space-y-0.5">
                  {todayReports.length > 0 && (
                    <>
                      <div className="px-2 py-1 text-[9px] font-medium uppercase tracking-wider" style={{ color: colors.textMuted }}>
                        Today
                      </div>
                      {todayReports.map(report => (
                        <ReportLink key={report.id} report={report} isActive={isActive(`/report/${report.id}`)} />
                      ))}
                    </>
                  )}
                  {yesterdayReports.length > 0 && (
                    <>
                      <div className="px-2 py-1 mt-1 text-[9px] font-medium uppercase tracking-wider" style={{ color: colors.textMuted }}>
                        Yesterday
                      </div>
                      {yesterdayReports.map(report => (
                        <ReportLink key={report.id} report={report} isActive={isActive(`/report/${report.id}`)} />
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Projects Section */}
            <div className="py-2">
              <div className="flex items-center justify-between px-2 py-1">
                <button
                  onClick={() => toggleSection('projects')}
                  className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider cursor-pointer"
                  style={{ color: colors.textMuted }}
                >
                  {expandedSections.has('projects') ? (
                    <ChevronDown className="w-3 h-3" strokeWidth={2} />
                  ) : (
                    <ChevronRight className="w-3 h-3" strokeWidth={2} />
                  )}
                  Projects
                </button>
                <button className="p-0.5 rounded cursor-pointer hover:bg-black/5">
                  <Plus className="w-3.5 h-3.5" style={{ color: colors.textMuted }} strokeWidth={1.5} />
                </button>
              </div>
              
              {expandedSections.has('projects') && (
                <div className="mt-1 space-y-0.5">
                  {PROJECTS.map(project => {
                    const totalAlerts = project.reports.reduce((sum, r) => sum + r.alerts, 0)
                    const isExpanded = expandedProjects.has(project.id)
                    
                    return (
                      <div key={project.id}>
                        <button
                          onClick={() => toggleProject(project.id)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors"
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hover}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3 h-3" style={{ color: colors.textMuted }} strokeWidth={2} />
                          ) : (
                            <ChevronRight className="w-3 h-3" style={{ color: colors.textMuted }} strokeWidth={2} />
                          )}
                          <FolderOpen className="w-3.5 h-3.5" style={{ color: colors.textMuted }} strokeWidth={1.5} />
                          <span className="text-xs flex-1 text-left truncate" style={{ color: colors.text }}>
                            {project.name}
                          </span>
                          {totalAlerts > 0 && (
                            <span 
                              className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                              style={{ backgroundColor: '#FEE2E2', color: colors.alert }}
                            >
                              {totalAlerts}
                            </span>
                          )}
                        </button>
                        
                        {isExpanded && (
                          <div className="ml-4 pl-2 border-l mt-0.5 space-y-0.5" style={{ borderColor: colors.border }}>
                            {project.reports.map(report => (
                              <Link
                                key={report.id}
                                href={`/report/${report.id}`}
                                className={`
                                  flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer transition-colors
                                  ${isActive(`/report/${report.id}`) ? 'bg-white shadow-sm' : ''}
                                `}
                                onMouseEnter={(e) => !isActive(`/report/${report.id}`) && (e.currentTarget.style.backgroundColor = colors.hover)}
                                onMouseLeave={(e) => !isActive(`/report/${report.id}`) && (e.currentTarget.style.backgroundColor = 'transparent')}
                              >
                                <FileText className="w-3 h-3" style={{ color: colors.textMuted }} strokeWidth={1.5} />
                                <span className="text-[11px] flex-1 truncate" style={{ color: colors.text }}>
                                  {report.name}
                                </span>
                                {report.alerts > 0 && (
                                  <AlertCircle className="w-3 h-3" style={{ color: colors.alert }} strokeWidth={2} />
                                )}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Collapsed icons */
          <div className="py-2 space-y-1">
            <CollapsedIcon icon={FileText} label="Recent" />
            <CollapsedIcon icon={FolderOpen} label="Projects" />
          </div>
        )}
      </nav>

      {/* Bottom nav */}
      <div className="px-2 py-2">
        <NavItem 
          href="/sources" 
          icon={Database} 
          label="Sources" 
          isActive={isActive('/sources')}
          isCollapsed={isCollapsed}
        />
        <NavItem 
          href="/settings" 
          icon={Settings} 
          label="Settings" 
          isActive={isActive('/settings')}
          isCollapsed={isCollapsed}
        />
      </div>
    </aside>
  )
}

// Sub-components
function NavItem({ href, icon: Icon, label, isActive, isCollapsed }: {
  href: string
  icon: any
  label: string
  isActive: boolean
  isCollapsed: boolean
}) {
  return (
    <Link
      href={href}
      className={`
        flex items-center rounded-md cursor-pointer transition-colors relative group
        ${isCollapsed ? 'justify-center p-3' : 'gap-2.5 px-2 py-1.5'}
        ${isActive ? 'bg-white shadow-sm' : ''}
      `}
      onMouseEnter={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)')}
      onMouseLeave={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <Icon className="w-[18px] h-[18px] flex-shrink-0" style={{ color: '#1a1a1a' }} strokeWidth={1.5} />
      {!isCollapsed && <span className="text-[13px]" style={{ color: '#1a1a1a' }}>{label}</span>}
      {isCollapsed && (
        <div 
          className="absolute left-full ml-3 px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[200]"
          style={{ 
            backgroundColor: '#FBF9F7', 
            color: '#1a1a1a',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)',
          }}
        >
          {label}
        </div>
      )}
    </Link>
  )
}

function ReportLink({ report, isActive }: { report: { id: string; name: string }; isActive: boolean }) {
  return (
    <Link
      href={`/report/${report.id}`}
      className={`
        flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors
        ${isActive ? 'bg-white shadow-sm' : ''}
      `}
      onMouseEnter={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)')}
      onMouseLeave={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#71717a' }} strokeWidth={1.5} />
      <span className="text-xs truncate" style={{ color: '#1a1a1a' }}>{report.name}</span>
    </Link>
  )
}

function CollapsedIcon({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <button
      className="w-full flex items-center justify-center p-3 rounded-md cursor-pointer transition-colors relative group"
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <Icon className="w-[18px] h-[18px]" style={{ color: '#71717a' }} strokeWidth={1.5} />
      <div 
        className="absolute left-full ml-3 px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[200]"
        style={{ 
          backgroundColor: '#FBF9F7', 
          color: '#1a1a1a',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)',
        }}
      >
        {label}
      </div>
    </button>
  )
}