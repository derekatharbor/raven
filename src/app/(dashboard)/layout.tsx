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
        className={`min-h-screen transition-all duration-200 pt-3 pr-3 pb-3 ${
          sidebarCollapsed ? 'lg:pl-[68px]' : 'lg:pl-[212px]'
        }`}
      >
        <div 
          className="min-h-[calc(100vh-24px)] bg-white"
          style={{ 
            borderRadius: '12px',
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.06)',
          }}
        >
          {children}
        </div>
      </main>
    </div>
  )
}