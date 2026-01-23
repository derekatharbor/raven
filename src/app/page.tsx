// Path: src/app/page.tsx
// Marketing Landing Page

'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Search, PenLine, Radar, BarChart3, ArrowRight, FileText, Table, Download, Database, Sparkles, CheckCircle, Bot, Blocks, Bell, TrendingUp, Globe, Mail, Eye, MessageSquare, MousePointer, PhoneOff } from 'lucide-react'
import MainNav from '@/components/marketing/MainNav'
import StickyNav from '@/components/marketing/StickyNav'

// Security Section - 4 blocks in a row
function SecuritySection() {
  const securityItems = [
    {
      image: '/images/marketing/security-gdpr.svg',
      title: 'GDPR Compliant',
      description: 'Your data stays yours and stays protected',
    },
    {
      image: '/images/marketing/security-no-training.svg',
      title: 'No model training',
      description: 'Your documents never train our models',
    },
    {
      image: '/images/marketing/security-encrypted.svg',
      title: 'Encrypted everywhere',
      description: 'TLS in transit, AES-256 at rest',
    },
    {
      image: '/images/marketing/security-sso.svg',
      title: 'Enterprise SSO',
      description: 'SAML, OAuth, and role-based access',
    },
  ]

  return (
    <section className="bg-[#000000] py-16 md:py-24 px-5 md:px-6">
      {/* Section Header */}
      <div className="max-w-6xl mx-auto mb-8 md:mb-12 text-center">
        <span className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider uppercase border border-white/20 rounded-full text-white/60">
          Security
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-white leading-tight">
          Built for sensitive work
        </h2>
      </div>

      {/* 4-block grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-white/20">
        {securityItems.map((item, idx) => {
          return (
            <div 
              key={idx}
              className="py-12 sm:py-0 sm:aspect-square flex flex-col items-center justify-center text-center p-6 border-r border-b border-white/20"
            >
              {/* Icon - swap src for animated versions */}
              <div className="w-16 h-16 mb-6 flex items-center justify-center">
                <img src={item.image} alt={item.title} className="w-full h-full" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-white/50">
                {item.description}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// Capabilities Grid Section - zig-zag layout
function CapabilitiesSection() {
  const capabilities = [
    {
      badge: 'EDITOR',
      title: 'Smart Blocks',
      description: 'Structure your documents with intelligent building blocks. Tables that update, charts that refresh, and citations that stay linked to their sources.',
      image: '/images/marketing/cap-blocks.png',
      link: '/features/create',
    },
    {
      badge: 'RESEARCH',
      title: 'Multi-agent Research',
      description: 'Deploy multiple AI agents to research in parallel. Ask different questions, explore different angles, and synthesize findings—all without waiting.',
      image: '/images/marketing/cap-agents.png',
      link: '/features/create',
    },
    {
      badge: 'WRITING',
      title: 'Autocomplete from your sources',
      description: 'Autocomplete suggestions grounded in your connected sources. The intelligence assists your thinking—you stay in control of every word.',
      image: '/images/marketing/cap-autocomplete.png',
      link: '/features/create',
    },
    {
      badge: 'DELIVERY',
      title: 'Interactive Documents',
      description: 'Share via Raven Links and let readers ask questions answered by AI—privately and securely, grounded in your sources. No more follow-up calls for clarification.',
      image: '/images/marketing/cap-interactive.png',
      link: '/features/analyze',
    },
    {
      badge: 'INTEGRATIONS',
      title: 'Connect your sources',
      description: 'Plug into your existing stack. Pull from PitchBook, internal databases, CRMs, and more. Your research stays connected to the systems you already use.',
      image: '/images/marketing/cap-sources.png',
      link: '/sources',
    },
  ]

  return (
    <section className="bg-[#000000] py-16 md:py-24 px-5 md:px-6">
      {/* Section Header */}
      <div className="max-w-6xl mx-auto mb-8 md:mb-12">
        <span className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider uppercase border border-white/20 rounded-full text-white/60">
          Platform Capabilities
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-white leading-tight">
          Built for how you<br className="hidden sm:block" /> actually work
        </h2>
      </div>

      {/* Capabilities Grid */}
      <div className="max-w-6xl mx-auto border-t border-l border-white/20">
        {capabilities.map((cap, idx) => {
          const isEven = idx % 2 === 0
          return (
            <div 
              key={idx}
              className="grid grid-cols-1 md:grid-cols-2 border-b border-r border-white/20"
            >
              {/* Text Side - square on desktop only */}
              <div className={`p-6 sm:p-8 md:p-12 md:aspect-square flex flex-col justify-center ${
                isEven ? 'md:order-1' : 'md:order-2'
              }`}>
                <span className="inline-block px-2 py-1 mb-3 md:mb-4 text-[10px] font-medium tracking-wider uppercase border border-white/20 text-white/50 w-fit">
                  {cap.badge}
                </span>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-medium text-white mb-3 md:mb-4 leading-tight">
                  {cap.title}
                </h3>
                <p className="text-sm sm:text-base text-white/60 leading-relaxed mb-4 md:mb-6">
                  {cap.description}
                </p>
                <Link 
                  href={cap.link}
                  className="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-white/80 transition-colors cursor-pointer"
                >
                  Learn more
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Image Side - square on desktop, shorter on mobile */}
              <div className={`min-h-[250px] sm:min-h-[300px] md:aspect-square bg-white/5 flex items-center justify-center border-white/20 ${
                isEven ? 'md:order-2 md:border-l' : 'md:order-1 md:border-r'
              }`}>
                <img 
                  src={cap.image}
                  alt={cap.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

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
        { icon: FileText, text: 'Natural language queries across all your connected sources' },
        { icon: Table, text: 'Structured matrix view with citations and confidence scores' },
        { icon: Download, text: 'Export results to spreadsheets or reports' },
        { icon: Database, text: 'Connect SEC EDGAR, internal docs, and web sources' },
      ]
    },
    create: {
      title: 'Write with intelligence built in',
      description: 'A Cursor-style editor where research happens alongside writing. Highlight claims to verify, run agents for deep research, and autocomplete with grounded data from your sources.',
      image: '/images/marketing/feature-create.png',
      features: [
        { icon: Sparkles, text: 'Inline autocomplete powered by your connected sources' },
        { icon: CheckCircle, text: 'Highlight text to research and verify claims' },
        { icon: Bot, text: 'Deploy multiple AI agents for parallel research' },
        { icon: Blocks, text: 'Notion-style blocks for structured documents' },
      ]
    },
    track: {
      title: 'Stay current without the noise',
      description: 'Set up monitoring for topics and keywords that matter. Raven runs queries on your schedule and surfaces relevant updates so you never miss a development.',
      image: '/images/marketing/feature-track.png',
      features: [
        { icon: Bell, text: 'Schedule recurring searches across your sources' },
        { icon: TrendingUp, text: 'Get alerts when new relevant content appears' },
        { icon: Globe, text: 'Track competitors, markets, or regulatory changes' },
        { icon: Mail, text: 'Digest summaries delivered on your cadence' },
      ]
    },
    analyze: {
      title: 'See how your work lands',
      description: 'Share documents with a Raven link and understand exactly how readers engage. See where they pause, what they skip, and let them ask questions answered by AI—grounded in your sources.',
      image: '/images/marketing/feature-analyze.png',
      features: [
        { icon: Eye, text: 'Reader heatmaps showing scroll and time spent' },
        { icon: MessageSquare, text: 'In-document AI that answers reader questions' },
        { icon: MousePointer, text: 'Track which sections drive engagement' },
        { icon: PhoneOff, text: 'Reduce follow-up calls with instant clarity' },
      ]
    },
  }

  const content = tabContent[activeTab]
  const ActiveIcon = tabs.find(t => t.id === activeTab)?.icon || Search

  return (
    <section id="features" className="bg-[#000000] py-16 md:py-24 px-5 md:px-6">
      {/* Section Header */}
      <div className="max-w-6xl mx-auto mb-8 md:mb-12">
        <span className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider uppercase border border-white/20 rounded-full text-white/60">
          The Platform
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-white leading-tight">
          Where research becomes<br className="hidden sm:block" /> actionable intelligence
        </h2>
      </div>

      {/* Main Container with border - no rounded corners */}
      <div className="max-w-6xl mx-auto border border-white/20 overflow-hidden">
        {/* Tabs Row */}
        <div className="flex border-b border-white/20">
          {tabs.map((tab, idx) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  idx > 0 ? 'border-l border-white/20' : ''
                } ${
                  isActive 
                    ? 'bg-white text-black' 
                    : 'bg-transparent text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 hidden sm:block" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Two Panel Content */}
        <div className="grid md:grid-cols-2 border-b border-white/20">
          {/* Left - Text */}
          <div className="p-6 sm:p-8 md:p-12 flex flex-col justify-center md:border-r border-white/20">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-medium text-white mb-4 leading-tight">
              {content.title}
            </h3>
            <p className="text-sm sm:text-base text-white/60 leading-relaxed mb-6">
              {content.description}
            </p>
            <Link 
              href={`/features/${activeTab}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-white/80 transition-colors cursor-pointer"
            >
              Learn more
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right - Image */}
          <div className="flex items-center justify-center bg-white/5 min-h-[250px] sm:min-h-[300px] md:min-h-[400px]">
            <img 
              src={content.image}
              alt={`${activeTab} feature`}
              className="w-full h-full object-cover"
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
                className={`p-6 flex gap-4 ${
                  idx > 0 ? 'border-t sm:border-t-0 sm:border-l lg:border-l border-white/20' : ''
                } ${idx === 2 ? 'sm:border-t sm:border-l-0 lg:border-t-0 lg:border-l' : ''}`}
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
    "Research is changing.",
    "AI made information cheaper, not clearer, which means more to sift through and more effort to prove what's real.",
    "The hard part isn't finding information. It's finding what's true, then making it coherent, current, and clear before sending it out.",
    "Then the flow breaks.",
    "You send the report and the feedback disappears. What did they read, where did they hesitate, what confused them, what questions did it trigger?",
    "Raven is built for the full lifecycle of analysis: search, write, track, deliver, and learn.",
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
      className="bg-[#000000] relative"
      style={{ minHeight: '115vh' }}
    >
      {/* Horizontal line - top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-white/20" />
      
      {/* Horizontal line - bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/20" />
      
      {/* Vertical lines */}
      <div className="absolute top-0 bottom-0 left-[5%] w-px bg-white/20" />
      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/20 -translate-x-1/2 hidden md:block" />
      <div className="absolute top-0 bottom-0 right-[5%] w-px bg-white/20" />

      {/* Content */}
      <div className="sticky top-0 min-h-screen flex items-center py-16 md:py-24">
        <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-8 md:gap-16 px-[6%]">
          {/* Left - Title */}
          <div className="flex items-start">
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.2]"
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
      <div className="min-h-screen flex items-center justify-center bg-[#000000]">
        <div className="w-5 h-5 border-2 border-neutral-700 border-t-neutral-400 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#000000] overflow-x-hidden">
      {/* Navigation */}
      <MainNav />
      <StickyNav />

      {/* Hero Section */}
      <section className="pt-8 md:pt-16 pb-16 md:pb-24">
        {/* Text Content - constrained */}
        <div className="max-w-4xl mx-auto text-center px-5 md:px-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-5 md:mb-6">
            The AI-native workspace<br />for analysts.
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-neutral-400 max-w-xl mx-auto mb-8 md:mb-10 leading-relaxed">
            Build, deliver, and track documents that matter. From source to reader.
          </p>
          
          {/* CTA Buttons - stack on mobile */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link 
              href="/signup" 
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-black text-sm font-medium rounded-full hover:bg-neutral-200 transition-all hover:scale-[1.02]"
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

        {/* Hero Image - responsive width */}
        {/* IMAGE: /public/images/marketing/hero.png */}
        <div className="mt-12 md:mt-20 flex justify-center px-4 md:px-0">
          <img 
            src="/images/marketing/hero.png" 
            alt="Raven workspace" 
            className="w-[90%] sm:w-[80%] md:w-[67%]"
          />
        </div>
      </section>

      {/* Manifesto Section */}
      <ManifestoSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Capabilities Section */}
      <CapabilitiesSection />

      {/* Security Section */}
      <SecuritySection />

      {/* CTA Section */}
      <section className="bg-black py-24 px-5 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-white/60 mb-8 max-w-xl mx-auto">
            Join analysts who build, deliver, and track documents that matter.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link 
              href="/signup" 
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-black text-sm font-medium rounded-full hover:bg-neutral-200 transition-all cursor-pointer"
            >
              Get started free
            </Link>
            <Link 
              href="/contact" 
              className="px-6 py-3.5 text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              Contact sales →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 py-12 px-5 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Logo Column */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="inline-block mb-4 cursor-pointer">
                <img 
                  src="/images/raven-logo-white.png" 
                  alt="Raven" 
                  className="h-6 w-auto"
                />
              </Link>
              <p className="text-sm text-white/40">
                The AI-native workspace for analysts.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-xs font-medium text-white/60 uppercase tracking-wider mb-4">Product</h4>
              <ul className="space-y-2.5">
                <li><Link href="/features/search" className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">Search</Link></li>
                <li><Link href="/features/create" className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">Create</Link></li>
                <li><Link href="/features/track" className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">Track</Link></li>
                <li><Link href="/features/analyze" className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">Analyze</Link></li>
                <li><Link href="/pricing" className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">Pricing</Link></li>
                <li><Link href="/changelog" className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">Changelog</Link></li>
              </ul>
            </div>

            {/* Solutions */}
            <div>
              <h4 className="text-xs font-medium text-white/60 uppercase tracking-wider mb-4">Solutions</h4>
              <ul className="space-y-2.5">
                <li><Link href="/solutions/finance" className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">Finance</Link></li>
                <li><Link href="/solutions/consulting" className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">Consulting</Link></li>
                <li><Link href="/solutions/government" className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">Government</Link></li>
                <li><Link href="/solutions/legal" className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">Legal</Link></li>
                <li><Link href="/customers" className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">Customer Stories</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-xs font-medium text-white/60 uppercase tracking-wider mb-4">Resources</h4>
              <ul className="space-y-2.5">
                <li><Link href="/docs" className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">Documentation</Link></li>
                <li><Link href="/api" className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">API</Link></li>
                <li><Link href="/blog" className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">Blog</Link></li>
                <li><Link href="/security" className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">Security</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-xs font-medium text-white/60 uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-2.5">
                <li><Link href="/about" className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">About</Link></li>
                <li><Link href="/contact" className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">Contact</Link></li>
                <li><Link href="/careers" className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">Careers</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-white/10 gap-4">
            <p className="text-xs text-white/40">
              © {new Date().getFullYear()} Raven Technologies, Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}