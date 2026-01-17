// Path: src/app/(auth)/layout.tsx

'use client'

import { usePathname } from 'next/navigation'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLogin = pathname === '/login'
  
  return (
    <div className="min-h-screen flex">
      {/* Left side - Auth form */}
      <div className="w-full lg:w-1/2 flex flex-col" style={{ background: '#0D0D0D' }}>
        {children}
      </div>
      
      {/* Right side - Image (hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(/images/${isLogin ? 'auth-login' : 'auth-signup'}.png)`,
            background: '#1a1a1a',
          }}
        />
        {/* Fallback gradient if no image */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            zIndex: -1,
          }}
        />
      </div>
    </div>
  )
}