// Route: src/app/(dashboard)/layout.tsx

'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    // Check initial state
    const collapsed = localStorage.getItem('harbor-sidebar-collapsed') === 'true'
    setSidebarCollapsed(collapsed)

    // Listen for sidebar toggle events
    const handleToggle = () => {
      const collapsed = localStorage.getItem('harbor-sidebar-collapsed') === 'true'
      setSidebarCollapsed(collapsed)
    }

    window.addEventListener('sidebar-toggle', handleToggle)
    return () => window.removeEventListener('sidebar-toggle', handleToggle)
  }, [])

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: '#FBF9F7' }}
    >
      <Sidebar />
      {/* Content area - floats on top with shadow */}
      <main 
        className={`min-h-screen transition-all duration-200 p-3 pl-0 ${
          sidebarCollapsed ? 'lg:ml-[56px]' : 'lg:ml-[200px]'
        }`}
      >
        <div 
          className="min-h-[calc(100vh-24px)] bg-white"
          style={{ 
            borderRadius: '12px',
            boxShadow: '-4px -2px 12px rgba(0, 0, 0, 0.04), -2px 0px 8px rgba(0, 0, 0, 0.02)',
          }}
        >
          {children}
        </div>
      </main>
    </div>
  )
}