// Route: src/app/(dashboard)/layout.tsx

import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="lg:pl-60 transition-all duration-300">
        {children}
      </main>
    </div>
  )
}
