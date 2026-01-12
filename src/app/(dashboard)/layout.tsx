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

  // Listen for sidebar toggle events
  useEffect(() => {
    const checkSidebarState = () => {
      const collapsed = localStorage.getItem('harbor-sidebar-collapsed') === 'true'
      setSidebarCollapsed(collapsed)
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
      <Sidebar />
      
      <main 
        className={`
          flex-1 relative p-3 pl-0
          transition-[margin] duration-300 
          ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}
        `}
        style={{ backgroundColor: '#FBF9F7' }}
      >
        <div 
          className="min-h-[calc(100vh-24px)] bg-white overflow-hidden"
          style={{ 
            borderRadius: '12px',
            boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.06), 0 4px 20px rgba(0, 0, 0, 0.04)',
          }}
        >
          {children}
        </div>
      </main>
    </div>
  )
}