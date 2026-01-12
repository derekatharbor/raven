// Route: src/app/(dashboard)/layout.tsx

'use client'

import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div 
      className="min-h-screen flex"
      style={{ backgroundColor: '#FBF9F7' }}
    >
      <Sidebar />
      {/* Content area - floats on top with shadow */}
      <main className="flex-1 p-3 pl-0 min-w-0">
        <div 
          className="min-h-[calc(100vh-24px)] bg-white overflow-hidden"
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