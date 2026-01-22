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
      <div className="min-h-screen flex items-center justify-center bg-[#15120B]">
        <div className="w-5 h-5 border-2 border-neutral-700 border-t-neutral-400 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#15120B] overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#15120B]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo - IMAGE: /public/images/nav-logo.png */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/nav-logo.png" alt="Raven" className="h-6 w-auto" />
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/docs" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Docs
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Log in
            </Link>
            <Link 
              href="/signup" 
              className="text-sm px-4 py-2 bg-white text-black rounded-full hover:bg-neutral-200 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24">
        {/* Text Content - constrained */}
        <div className="max-w-4xl mx-auto text-center px-6">
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-6">
            Built for work that matters.
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Raven is a document workspace with AI-powered research and reader analytics.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4">
            <Link 
              href="/signup" 
              className="px-8 py-3.5 bg-white text-black text-sm font-medium rounded-full hover:bg-neutral-200 transition-all hover:scale-[1.02]"
            >
              Get started
            </Link>
            <Link 
              href="#features" 
              className="px-6 py-3.5 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
            >
              Learn more →
            </Link>
          </div>
        </div>

        {/* Hero Image - full width container, 67% of hero width */}
        {/* IMAGE: /public/images/marketing/hero.png */}
        <div className="mt-20 flex justify-center">
          <img 
            src="/images/marketing/hero.png" 
            alt="Raven workspace" 
            className="w-[67%]"
          />
        </div>
      </section>
    </div>
  )
}