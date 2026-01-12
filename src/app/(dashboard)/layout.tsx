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
    <>
      {/* Layer 1: Background + Sidebar (low z-index) */}
      <div 
        className="fixed inset-0 z-0"
        style={{ backgroundColor: '#FBF9F7' }}
      >
        <Sidebar collapsed={sidebarCollapsed} />
      </div>
      
      {/* Layer 2: Main content (higher z-index, sits on top) */}
      <div 
        className={`
          fixed top-3 right-0 bottom-0 z-10
          transition-all duration-300
          ${sidebarCollapsed ? 'left-[76px]' : 'left-[236px]'}
        `}
      >
        <div 
          className="h-full bg-white overflow-auto"
          style={{ 
            borderTopLeftRadius: '12px',
            boxShadow: '-8px -4px 32px rgba(0, 0, 0, 0.08)',
          }}
        >
          {children}
        </div>
      </div>
    </>
  )
}