// Path: src/app/page.tsx
// Marketing Landing Page

'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Search, PenLine, Radar, BarChart3, ArrowRight } from 'lucide-react'

// Features Section with tabs
function FeaturesSection() {
  const [activeTab, setActiveTab] = useState<'search' | 'create' | 'track' | 'analyze'>('search')

  const tabs = [
    { id: 'search' as const, label: 'Search', icon: Search },
    { id: 'create' as const, label: 'Create', icon: PenLine },
    { id: 'track' as const, label: 'Track', icon: Radar },
    { id: 'analyze' as const, label: 'Analyze', icon: BarChart3 },
  ]

  const tabContent = {
    search: {
      title: 'Find what matters across any dataset',
      description: 'Search across documents, filings, transcripts, and more with natural language. Get cited answers instantly, organized in a structured matrix you can export and share.',
      image: '/images/marketing/feature-search.png',
      features: [
        { icon: Search, text: 'Natural language queries across all your connected sources' },
        { icon: Search, text: 'Structured matrix view with citations and confidence scores' },
        { icon: Search, text: 'Export results to spreadsheets or reports' },
        { icon: Search, text: 'Connect SEC EDGAR, internal docs, and web sources' },
      ]
    },
    create: {
      title: 'Write with intelligence built in',
      description: 'A Cursor-style editor where research happens alongside writing. Highlight claims to verify, run agents for deep research, and autocomplete with grounded data from your sources.',
      image: '/images/marketing/feature-create.png',
      features: [
        { icon: PenLine, text: 'Inline autocomplete powered by your connected sources' },
        { icon: PenLine, text: 'Highlight text to research and verify claims' },
        { icon: PenLine, text: 'Deploy multiple AI agents for parallel research' },
        { icon: PenLine, text: 'Notion-style blocks for structured documents' },
      ]
    },
    track: {
      title: 'Stay current without the noise',
      description: 'Set up monitoring for topics and keywords that matter. Raven runs queries on your schedule and surfaces relevant updates so you never miss a development.',
      image: '/images/marketing/feature-track.png',
      features: [
        { icon: Radar, text: 'Schedule recurring searches across your sources' },
        { icon: Radar, text: 'Get alerts when new relevant content appears' },
        { icon: Radar, text: 'Track competitors, markets, or regulatory changes' },
        { icon: Radar, text: 'Digest summaries delivered on your cadence' },
      ]
    },
    analyze: {
      title: 'See how your work lands',
      description: 'Share documents with a Raven link and understand exactly how readers engage. See where they pause, what they skip, and let them ask questions answered by AI—grounded in your sources.',
      image: '/images/marketing/feature-analyze.png',
      features: [
        { icon: BarChart3, text: 'Reader heatmaps showing scroll and time spent' },
        { icon: BarChart3, text: 'In-document AI that answers reader questions' },
        { icon: BarChart3, text: 'Track which sections drive engagement' },
        { icon: BarChart3, text: 'Reduce follow-up calls with instant clarity' },
      ]
    },
  }

  const content = tabContent[activeTab]
  const ActiveIcon = tabs.find(t => t.id === activeTab)?.icon || Search

  return (
    <section id="features" className="bg-[#0A0A0A] py-24 px-6">
      {/* Section Header */}
      <div className="max-w-6xl mx-auto mb-12">
        <span className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider uppercase border border-white/20 rounded-full text-white/60">
          The Platform
        </span>
        <h2 className="text-4xl md:text-5xl font-medium text-white leading-tight">
          Where research becomes<br />actionable intelligence
        </h2>
      </div>

      {/* Main Container with border */}
      <div className="max-w-6xl mx-auto border border-white/20 rounded-lg overflow-hidden">
        {/* Tabs Row */}
        <div className="flex border-b border-white/20">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-white text-black' 
                    : 'bg-transparent text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Two Panel Content */}
        <div className="grid md:grid-cols-2 border-b border-white/20">
          {/* Left - Text */}
          <div className="p-8 md:p-12 flex flex-col justify-center border-r border-white/20">
            <h3 className="text-2xl md:text-3xl font-medium text-white mb-4 leading-tight">
              {content.title}
            </h3>
            <p className="text-white/60 leading-relaxed mb-6">
              {content.description}
            </p>
            <Link 
              href={`/features/${activeTab}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-white/80 transition-colors"
            >
              Learn more
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right - Image */}
          <div className="p-6 md:p-8 flex items-center justify-center bg-white/5">
            <img 
              src={content.image}
              alt={`${activeTab} feature`}
              className="w-full rounded-lg shadow-2xl"
            />
          </div>
        </div>

        {/* Feature Nodes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {content.features.map((feature, idx) => {
            const FeatureIcon = feature.icon
            return (
              <div 
                key={idx} 
                className="p-6 flex gap-4 border-t border-white/20 lg:border-t-0 lg:border-l first:border-l-0"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <FeatureIcon className="w-4 h-4 text-white/60" />
                </div>
                <p className="text-sm text-white/60 leading-relaxed">
                  {feature.text}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

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
      const startPoint = viewportHeight * 0.5 // Start later (was 0.7)
      const endPoint = -sectionHeight + viewportHeight * 0.8 // End later
      
      const progress = (startPoint - rect.top) / (startPoint - endPoint)
      setScrollProgress(Math.max(0, Math.min(1, progress)))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const paragraphs = [
    "Research is changing shape.",
    "The work lives across links, chats, transcripts, filings, and feeds. The volume goes up. The stakes don't go down.",
    "The hard part isn't finding information. It's making it coherent, keeping it current, and delivering it in a way that lands.",
    "Then the loop breaks.",
    "You send the report and the feedback disappears. What did they read, where did they hesitate, what confused them, what questions did it trigger?",
    "Raven is built for the full lifecycle of analysis: search, write, track, deliver, learn.",
    "One workspace for research and writing. Monitoring that keeps your work current. And a reader experience where questions get answered in place, grounded in your sources.",
    "This is what comes next.",
    "Moving beyond the PDF."
  ]

  // Join all text for character-level animation
  const allText = paragraphs.join(' ')
  const totalChars = allText.length
  const revealedChars = Math.floor(scrollProgress * totalChars * 1.2)

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
      style={{ minHeight: '115vh' }}
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
              className="text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.2]"
              style={{ 
                fontFamily: 'var(--font-geist-sans)',
                color: scrollProgress > 0.02 ? '#ffffff' : 'rgba(255,255,255,0.25)',
                transition: 'color 0.5s ease',
              }}
            >
              A document<br />should answer<br />back.
            </h2>
          </div>

          {/* Right - Body paragraphs with fill effect */}
          <div>
            {renderFilledText()}
            {/* CTA Button */}
            <Link 
              href="#features"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 border border-white/30 rounded-full text-sm text-white hover:bg-white/10 transition-colors"
              style={{
                opacity: scrollProgress > 0.85 ? 1 : 0,
                transition: 'opacity 0.3s ease',
              }}
            >
              Learn more
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
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

      {/* Features Section */}
      <FeaturesSection />
    </div>
  )
}