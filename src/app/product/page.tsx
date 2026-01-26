// src/app/product/page.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, PenLine, Radar, BarChart3, ArrowRight, FileText, Table, Download, Database, Sparkles, CheckCircle, Bot, Blocks, Bell, TrendingUp, Globe, Mail, Eye, MessageSquare, MousePointer, PhoneOff } from 'lucide-react'
import MainNav from '@/components/marketing/MainNav'
import StickyNav from '@/components/marketing/StickyNav'

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

  return (
    <section className="py-16 md:py-24">
      {/* Section Header */}
      <div className="max-w-6xl mx-auto px-5 md:px-6 mb-8 md:mb-12">
        <span className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider uppercase border border-white/20 rounded-full text-white/60">
          The Platform
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-white leading-tight">
          Research, write, publish—<br className="hidden sm:block" /> all in one place
        </h2>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-5 md:px-6 mb-8 md:mb-12">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-white text-black' 
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-5 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Text Content */}
          <div>
            <h3 className="text-2xl md:text-3xl font-medium text-white mb-4">
              {content.title}
            </h3>
            <p className="text-white/60 mb-8 leading-relaxed">
              {content.description}
            </p>
            <div className="space-y-4">
              {content.features.map((feature, idx) => {
                const Icon = feature.icon
                return (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-white/70" />
                    </div>
                    <span className="text-white/80 text-sm pt-1.5">{feature.text}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Image */}
          <div className="aspect-[4/3] bg-white/5 rounded-lg border border-white/10 overflow-hidden">
            <img 
              src={content.image}
              alt={content.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// Capabilities Grid Section
function CapabilitiesSection() {
  const capabilities = [
    {
      badge: 'EDITOR',
      title: 'Smart Blocks',
      description: 'Structure your documents with intelligent building blocks. Tables that update, charts that refresh, and citations that stay linked to their sources.',
      image: '/images/marketing/cap-blocks.png',
    },
    {
      badge: 'RESEARCH',
      title: 'Multi-agent Research',
      description: 'Deploy multiple AI agents to research in parallel. Ask different questions, explore different angles, and synthesize findings—all without waiting.',
      image: '/images/marketing/cap-agents.png',
    },
    {
      badge: 'WRITING',
      title: 'Autocomplete from your sources',
      description: 'Autocomplete suggestions grounded in your connected sources. The intelligence assists your thinking—you stay in control of every word.',
      image: '/images/marketing/cap-autocomplete.png',
    },
    {
      badge: 'DELIVERY',
      title: 'Interactive Documents',
      description: 'Share via Raven Links and let readers ask questions answered by AI—privately and securely, grounded in your sources. No more follow-up calls for clarification.',
      image: '/images/marketing/cap-interactive.png',
    },
    {
      badge: 'INTEGRATIONS',
      title: 'Connect your sources',
      description: 'Plug into your existing stack. Pull from SEC EDGAR, Google Drive, internal documents, and more. Your research stays connected to the systems you already use.',
      image: '/images/marketing/cap-sources.png',
    },
  ]

  return (
    <section className="py-16 md:py-24 px-5 md:px-6">
      {/* Section Header */}
      <div className="max-w-6xl mx-auto mb-8 md:mb-12">
        <span className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider uppercase border border-white/20 rounded-full text-white/60">
          Capabilities
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
              {/* Text Side */}
              <div className={`p-6 sm:p-8 md:p-12 md:aspect-square flex flex-col justify-center ${
                isEven ? 'md:order-1' : 'md:order-2'
              }`}>
                <span className="inline-block px-2 py-1 mb-3 md:mb-4 text-[10px] font-medium tracking-wider uppercase border border-white/20 text-white/50 w-fit">
                  {cap.badge}
                </span>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-medium text-white mb-3 md:mb-4 leading-tight">
                  {cap.title}
                </h3>
                <p className="text-sm sm:text-base text-white/60 leading-relaxed">
                  {cap.description}
                </p>
              </div>

              {/* Image Side */}
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

// Security Section
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
    <section className="py-16 md:py-24 px-5 md:px-6">
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

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <MainNav />
      <StickyNav />

      {/* Hero Section */}
      <section className="relative">
        {/* Horizontal line under nav */}
        <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />
        
        <div className="relative max-w-7xl mx-auto">
          {/* Left vertical line */}
          <div className="absolute top-0 bottom-0 left-5 md:left-6 w-px bg-white/10" />
          {/* Right vertical line */}
          <div className="absolute top-0 bottom-0 right-5 md:right-6 w-px bg-white/10" />
          
          <div className="px-10 md:px-16 py-16 md:py-24">
            <span className="text-xs uppercase tracking-widest text-white/40 mb-4 block">
              Product
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.1] tracking-tight max-w-4xl mb-6">
              Research at the speed of thought.
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mb-8">
              One platform for research, writing, and publishing. Every claim traced to its source. Every document defensible.
            </p>
            <Link 
              href="/signup"
              className="inline-flex px-8 py-3.5 bg-white text-black text-sm font-medium rounded hover:bg-white/90 transition-colors cursor-pointer"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Horizontal line */}
        <div className="w-full h-px bg-white/10" />

        {/* Hero Image */}
        {/* IMAGE: /public/images/marketing/product-hero.png - Full platform screenshot, aspect 2:1 */}
        <div className="max-w-7xl mx-auto relative">
          {/* Left vertical line */}
          <div className="absolute top-0 bottom-0 left-5 md:left-6 w-px bg-white/10" />
          {/* Right vertical line */}
          <div className="absolute top-0 bottom-0 right-5 md:right-6 w-px bg-white/10" />
          
          <div className="ml-5 md:ml-6 mr-5 md:mr-6">
            <img 
              src="/images/marketing/product-hero.png" 
              alt="Raven Platform"
              className="w-full aspect-[2/1] object-cover"
            />
          </div>
        </div>

        {/* Horizontal line */}
        <div className="w-full h-px bg-white/10" />
      </section>

      {/* Features Tabs Section */}
      <FeaturesSection />

      {/* Horizontal divider */}
      <div className="max-w-6xl mx-auto px-5 md:px-6">
        <div className="w-full h-px bg-white/10" />
      </div>

      {/* Capabilities Grid */}
      <CapabilitiesSection />

      {/* Horizontal divider */}
      <div className="max-w-6xl mx-auto px-5 md:px-6">
        <div className="w-full h-px bg-white/10" />
      </div>

      {/* Security Section */}
      <SecuritySection />

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-5 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-6">
            Ready to try Raven?
          </h2>
          <p className="text-lg text-white/60 mb-8">
            See what documents look like when they actually work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup"
              className="inline-flex justify-center px-8 py-3.5 bg-white text-black text-sm font-medium rounded hover:bg-white/90 transition-colors cursor-pointer"
            >
              Start Free Trial
            </Link>
            <Link 
              href="/contact"
              className="inline-flex justify-center px-8 py-3.5 bg-transparent text-white text-sm font-medium rounded border border-white/20 hover:bg-white/5 transition-colors cursor-pointer"
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-5 md:px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="cursor-pointer">
            <img src="/images/raven-logo-white.png" alt="Raven" className="h-5 w-auto" />
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
