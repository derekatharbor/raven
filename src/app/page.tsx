// Path: src/app/page.tsx
// Marketing Landing Page

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Redirect logged-in users to dashboard
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
      } else {
        setLoading(false)
      }
    }
    checkAuth()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAFAF8]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            {/* IMAGE: /public/images/nav-logo.png (small icon, ~20x20) */}
            <img src="/images/nav-logo.png" alt="Raven" className="h-5 w-auto" />
            {/* Or if you want icon + text separately: */}
            {/* <span className="text-sm font-semibold text-black tracking-tight">RAVEN</span> */}
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-gray-500 hover:text-black transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-gray-500 hover:text-black transition-colors">
              Pricing
            </Link>
            <Link href="/docs" className="text-sm text-gray-500 hover:text-black transition-colors">
              Docs
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="text-sm text-gray-500 hover:text-black transition-colors"
            >
              Log in
            </Link>
            <Link 
              href="/signup" 
              className="text-sm px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative">
        {/* Content */}
        <div className="pt-32 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-black tracking-tight leading-[1.1] mb-6">
              Built for work that matters.
            </h1>
            <p className="text-lg md:text-xl text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
              Raven is a document workspace with AI-powered research and reader analytics.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex items-center justify-center gap-4">
              <Link 
                href="/signup" 
                className="px-8 py-3.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all hover:scale-[1.02]"
              >
                Get started
              </Link>
              <Link 
                href="#features" 
                className="px-6 py-3.5 text-sm font-medium text-gray-600 hover:text-black transition-colors"
              >
                Learn more →
              </Link>
            </div>
          </div>

          {/* Product Screenshot with Backdrop */}
          <div className="mt-20 relative">
            {/* Backdrop - sits behind screenshot only */}
            {/* IMAGE: /public/images/marketing/hero-bg.png */}
            <img 
              src="/images/marketing/hero-bg.png" 
              alt="" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Product Screenshot */}
            {/* IMAGE: /public/images/marketing/hero-ui.png */}
            <div className="relative z-10 max-w-5xl mx-auto">
              <img 
                src="/images/marketing/hero-ui.png" 
                alt="Raven workspace" 
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}