// Route: src/app/(dashboard)/layout.tsx

import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: '#FBF9F7' }}
    >
      <Sidebar />
      {/* Content area - floats on top with shadow */}
      <main 
        className="lg:ml-[200px] min-h-screen transition-all duration-200"
      >
        <div 
          className="min-h-screen bg-white shadow-sm"
          style={{ 
            borderTopLeftRadius: '12px',
            borderBottomLeftRadius: '12px',
          }}
        >
          {children}
        </div>
      </main>
    </div>
  )
}