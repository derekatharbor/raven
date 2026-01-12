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
    if (typeof window !== 'undefined') {
      const collapsed = localStorage.getItem('harbor-sidebar-collapsed') === 'true'
      setSidebarCollapsed(collapsed)
    }

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
      {/* Content area - margin adjusts smoothly based on sidebar state */}
      <main 
        className="min-h-screen transition-all duration-300 ease-in-out pt-3 pr-3 pb-3"
        style={{
          marginLeft: sidebarCollapsed ? '56px' : '220px',
        }}
      >
        <div 
          className="min-h-[calc(100vh-24px)] bg-white overflow-hidden"
          style={{ 
            borderRadius: '12px',
            boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.06), 0 0 20px rgba(0, 0, 0, 0.04)',
          }}
        >
          {children}
        </div>
      </main>
    </div>
  )
}