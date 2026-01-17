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
      {/* Left side - Auth form (60%) */}
      <div className="w-full lg:w-[60%] flex flex-col" style={{ background: '#0D0D0D' }}>
        {children}
      </div>
      
      {/* Right side - Image (40%, hidden on mobile) */}
      <div className="hidden lg:block lg:w-[40%] relative overflow-hidden" style={{ background: '#1a1a1a' }}>
        <img 
          src={`/images/${isLogin ? 'auth-login' : 'auth-signup'}.png`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  )
}