// Route: src/app/(dashboard)/layout.tsx

'use client'

import { useEffect, useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    const checkSidebarState = () => {
      if (typeof window !== 'undefined') {
        const collapsed = localStorage.getItem('harbor-sidebar-collapsed') === 'true'
        setSidebarCollapsed(collapsed)
      }
    }

    checkSidebarState()

    window.addEventListener('sidebar-toggle', checkSidebarState)
    return () => window.removeEventListener('sidebar-toggle', checkSidebarState)
  }, [])

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: '#FBF9F7' }}
    >
      {/* Sidebar - fixed position */}
      <Sidebar collapsed={sidebarCollapsed} />
      
      {/* Main content wrapper */}
      <div 
        className={`min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'pl-16' : 'pl-56'}`}
        style={{ backgroundColor: '#FBF9F7' }}
      >
        {/* Content area - padding on top and left only */}
        <main className="pt-3 pl-3 min-h-screen" style={{ backgroundColor: '#FBF9F7' }}>
          <div 
            className="min-h-[calc(100vh-12px)] bg-white overflow-hidden relative"
            style={{ 
              borderTopLeftRadius: '12px',
              boxShadow: '-4px -2px 24px rgba(0, 0, 0, 0.08)',
            }}
          >
            {/* Frosted glass fade at top */}
            <div 
              className="absolute top-0 left-0 right-0 h-8 z-10 pointer-events-none"
              style={{
                background: 'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)',
              }}
            />
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}