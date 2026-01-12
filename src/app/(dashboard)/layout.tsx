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
      className="flex min-h-screen"
      style={{ backgroundColor: '#FBF9F7' }}
    >
      {/* Sidebar - fixed position */}
      <Sidebar collapsed={sidebarCollapsed} />
      
      {/* Spacer for fixed sidebar */}
      <div 
        className={`flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-56'}`} 
      />
      
      {/* Main content - padding on top and left only, bleeds right and bottom */}
      <main className="flex-1 pt-3 pl-3 min-w-0">
        <div 
          className="min-h-[calc(100vh-12px)] bg-white overflow-hidden relative"
          style={{ 
            borderTopLeftRadius: '12px',
            boxShadow: '-4px -2px 24px rgba(0, 0, 0, 0.08)',
          }}
        >
          {children}
        </div>
      </main>
    </div>
  )
}