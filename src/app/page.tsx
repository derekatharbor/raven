// Path: src/app/page.tsx
// Marketing Landing Page

'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Manifesto Section with scroll-reveal text fill effect
function ManifestoSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return
      
      const rect = sectionRef.current.getBoundingClientRect()
      const sectionHeight = sectionRef.current.offsetHeight
      const viewportHeight = window.innerHeight
      
      // Calculate progress based on scroll through section
      const startPoint = viewportHeight * 0.9
      const endPoint = -sectionHeight + viewportHeight * 0.5
      
      const progress = (startPoint - rect.top) / (startPoint - endPoint)
      setScrollProgress(Math.max(0, Math.min(1, progress)))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const paragraphs = [
    "Research is changing shape.",
    "Work that used to live in PDFs now lives across links, chats, transcripts, filings, and feeds. The volume goes up. The stakes don't go down.",
    "The hard part isn't finding information. It's turning it into something coherent, keeping it current, and delivering it in a way that actually lands.",
    "Then comes the part nobody tracks.",
    "You send the report and the feedback disappears. What did they read. Where did they slow down. What did they misunderstand. What pushed them to ask the same questions again.",
    "Raven is built for the full lifecycle of an analysis. Search. Create. Track. Analyze.",
    "One workspace for research and writing. Monitoring that keeps your work current. And a reader experience that answers questions in place, grounded in the sources you connected.",
    "This is what comes next.",
    "Moving beyond the PDF."
  ]

  // Join all text for character-level animation
  const allText = paragraphs.join(' ')
  const totalChars = allText.length
  const revealedChars = Math.floor(scrollProgress * totalChars * 1.1) // Slight overshoot

  // Render text with fill effect
  const renderFilledText = () => {
    let charIndex = 0
    return paragraphs.map((paragraph, pIndex) => {
      const paragraphStart = charIndex
      const words = paragraph.split(' ')
      
      const renderedWords = words.map((word, wIndex) => {
        const wordChars = word.split('').map((char, cIndex) => {
          const isRevealed = charIndex < revealedChars
          charIndex++
          return (
            <span
              key={cIndex}
              style={{
                color: isRevealed ? '#ffffff' : 'rgba(255,255,255,0.25)',
                transition: 'color 0.1s ease',
              }}
            >
              {char}
            </span>
          )
        })
        charIndex++ // Space after word
        return (
          <span key={wIndex}>
            {wordChars}
            {wIndex < words.length - 1 && (
              <span style={{ color: charIndex - 1 < revealedChars ? '#ffffff' : 'rgba(255,255,255,0.25)' }}> </span>
            )}
          </span>
        )
      })

      return (
        <p
          key={pIndex}
          className="text-base md:text-lg leading-[1.6] mb-5"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          {renderedWords}
        </p>
      )
    })
  }

  return (
    <section 
      ref={sectionRef}
      className="bg-[#15120B] relative"
      style={{ minHeight: '150vh' }}
    >
      {/* Horizontal line - top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-white/20" />
      
      {/* Horizontal line - bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/20" />
      
      {/* Vertical lines */}
      <div className="absolute top-0 bottom-0 left-[5%] w-px bg-white/20" />
      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/20 -translate-x-1/2" />
      <div className="absolute top-0 bottom-0 right-[5%] w-px bg-white/20" />

      {/* Content */}
      <div className="sticky top-0 min-h-screen flex items-center py-24">
        <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 md:gap-16 px-[6%]">
          {/* Left - Title */}
          <div className="flex items-start">
            <h2 
              className="text-3xl md:text-4xl font-medium leading-[1.2]"
              style={{ 
                fontFamily: 'var(--font-geist-sans)',
                color: scrollProgress > 0.02 ? '#ffffff' : 'rgba(255,255,255,0.25)',
                transition: 'color 0.5s ease',
              }}
            >
              A document should<br />answer back.
            </h2>
          </div>

          {/* Right - Body paragraphs with fill effect */}
          <div>
            {renderFilledText()}
          </div>
        </div>
      </div>
    </section>
  )
}

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

      {/* Manifesto Section */}
      <ManifestoSection />
    </div>
  )
}