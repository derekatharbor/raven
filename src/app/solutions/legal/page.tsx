// src/app/solutions/legal/page.tsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShieldCheck, Lock, Ban, KeyRound } from 'lucide-react'
import MainNav from '@/components/marketing/MainNav'
import StickyNav from '@/components/marketing/StickyNav'

const FEATURES = [
  { id: 'feature-citations', label: 'Every claim traced' },
  { id: 'feature-confidence', label: 'Confidence with justification' },
  { id: 'feature-audit', label: 'Audit trails' },
  { id: 'feature-security', label: 'Your data stays yours' },
]

export default function LegalPage() {
  const [activeFeature, setActiveFeature] = useState('feature-citations')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveFeature(entry.target.id)
          }
        })
      },
      { rootMargin: '-40% 0px -40% 0px' }
    )

    FEATURES.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      <MainNav />
      <StickyNav />

      {/* Hero Section */}
      <section className="relative">
        {/* Horizontal line under nav */}
        <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />
        
        {/* Content area with vertical edge lines */}
        <div className="relative max-w-7xl mx-auto">
          {/* Left vertical line */}
          <div className="absolute top-0 bottom-0 left-5 md:left-6 w-px bg-white/10" />
          {/* Right vertical line */}
          <div className="absolute top-0 bottom-0 right-5 md:right-6 w-px bg-white/10" />
          
          {/* Hero content - two column */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 px-10 md:px-16 py-16 md:py-24">
            {/* Left - Badge + Headline */}
            <div>
              <span className="text-xs uppercase tracking-widest text-white/40 mb-4 block">
                For Legal
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.1] tracking-tight">
                Research that holds up in court.
              </h1>
            </div>
            
            {/* Right - Description + CTA */}
            <div className="flex flex-col justify-end">
              <p className="text-lg text-white/60 mb-4 leading-relaxed">
                Build case research with AI that cites every source. Every precedent traceable, every argument backed by the record.
              </p>
              <p className="text-lg text-white/60 mb-8 leading-relaxed">
                From discovery to brief—Raven helps legal teams move faster without sacrificing precision.
              </p>
              <div>
                <Link 
                  href="/contact"
                  className="inline-flex px-6 py-3 bg-white text-black text-sm font-medium rounded hover:bg-white/90 transition-colors cursor-pointer"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal line above image - full width */}
        <div className="w-full h-px bg-white/10" />

        {/* Hero Image - boxed in by grid lines */}
        {/* IMAGE: /public/images/marketing/solutions/legal-hero.png */}
        <div className="max-w-7xl mx-auto relative">
          {/* Left vertical line */}
          <div className="absolute top-0 bottom-0 left-5 md:left-6 w-px bg-white/10" />
          {/* Right vertical line */}
          <div className="absolute top-0 bottom-0 right-5 md:right-6 w-px bg-white/10" />
          
          <div className="ml-5 md:ml-6 mr-5 md:mr-6">
            <img 
              src="/images/marketing/solutions/legal-hero.png" 
              alt="Raven for Legal"
              className="w-full aspect-[2/1] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="relative">
        {/* Horizontal line above */}
        <div className="w-full h-px bg-white/10" />
        
        <div className="max-w-7xl mx-auto relative">
          {/* Left vertical line */}
          <div className="absolute top-0 bottom-0 left-5 md:left-6 w-px bg-white/10" />
          {/* Right vertical line */}
          <div className="absolute top-0 bottom-0 right-5 md:right-6 w-px bg-white/10" />
          
          {/* Header - narrower container */}
          <div className="px-10 md:px-16 py-16 md:py-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight max-w-2xl">
              Generic AI fails legal teams because...
            </h2>
          </div>
        </div>

        {/* Horizontal line between header and cards */}
        <div className="w-full h-px bg-white/10" />

        {/* Cards Grid */}
        <div className="max-w-7xl mx-auto relative">
          {/* Left vertical line */}
          <div className="absolute top-0 bottom-0 left-5 md:left-6 w-px bg-white/10" />
          {/* Right vertical line */}
          <div className="absolute top-0 bottom-0 right-5 md:right-6 w-px bg-white/10" />
          
          <div className="ml-5 md:ml-6 mr-5 md:mr-6 grid grid-cols-2 md:grid-cols-5">
            <div className="h-[236px] p-6 md:p-8 border-r border-b md:border-b-0 border-white/10 flex items-center justify-center text-center">
              <p className="text-base md:text-lg font-medium text-white leading-snug">
                Your brief needs to cite every case and statute
              </p>
            </div>
            <div className="h-[236px] p-6 md:p-8 border-b md:border-b-0 md:border-r border-white/10 flex items-center justify-center text-center">
              <p className="text-base md:text-lg font-medium text-white leading-snug">
                You're reviewing 10,000 documents in discovery
              </p>
            </div>
            <div className="h-[236px] p-6 md:p-8 border-r md:border-r border-white/10 flex items-center justify-center text-center">
              <p className="text-base md:text-lg font-medium text-white leading-snug">
                Legal arguments need airtight precedent
              </p>
            </div>
            <div className="h-[236px] p-6 md:p-8 md:border-r border-white/10 flex items-center justify-center text-center">
              <p className="text-base md:text-lg font-medium text-white leading-snug">
                Client data can't be exposed to commercial AI
              </p>
            </div>
            <div className="h-[236px] p-6 md:p-8 col-span-2 md:col-span-1 flex items-center justify-center text-center">
              <p className="text-base md:text-lg font-medium text-white leading-snug">
                Your work needs to survive opposing counsel
              </p>
            </div>
          </div>
        </div>

        {/* Horizontal line below */}
        <div className="w-full h-px bg-white/10" />
      </section>

      {/* Features Section - Sticky Scroll */}
      <section className="relative">
        <div className="max-w-7xl mx-auto relative">
          {/* Left vertical line */}
          <div className="absolute top-0 bottom-0 left-5 md:left-6 w-px bg-white/10" />
          {/* Center vertical line - divider between nav and content */}
          <div className="absolute top-0 bottom-0 left-1/3 w-px bg-white/10 hidden md:block" />
          {/* Right vertical line */}
          <div className="absolute top-0 bottom-0 right-5 md:right-6 w-px bg-white/10" />
          
          <div className="ml-5 md:ml-6 mr-5 md:mr-6">
            <div className="grid md:grid-cols-3">
              {/* Left Column - Sticky Feature Nav */}
              <div className="hidden md:block md:col-span-1">
                <div className="sticky top-32 py-16 pr-8">
                  <nav className="space-y-4">
                    {FEATURES.map(({ id, label }) => (
                      <a 
                        key={id}
                        href={`#${id}`} 
                        className={`block text-lg font-medium transition-colors ${
                          activeFeature === id 
                            ? 'text-white' 
                            : 'text-white/40 hover:text-white/60'
                        }`}
                      >
                        {label}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
              
              {/* Right Column - Scrolling Content */}
              <div className="md:col-span-2 md:pl-8">
                {/* Feature 1: Citations */}
                <div id="feature-citations" className="py-16 md:py-24 border-b border-white/10">
                  <h3 className="text-2xl md:text-3xl font-semibold mb-3">Every claim traced to source</h3>
                  <p className="text-white/60 mb-8 max-w-lg">
                    Click any statement to see the exact passage it came from. No black boxes, no hallucinations that survive review.
                  </p>
                  {/* IMAGE: /public/images/marketing/solutions/legal-feature-citations.png */}
                  <img 
                    src="/images/marketing/solutions/legal-feature-citations.png"
                    alt="Every claim traced to source"
                    className="w-full aspect-[4/3] object-cover rounded-sm"
                  />
                </div>
                
                {/* Feature 2: Confidence */}
                <div id="feature-confidence" className="py-16 md:py-24 border-b border-white/10">
                  <h3 className="text-2xl md:text-3xl font-semibold mb-3">Confidence with justification</h3>
                  <p className="text-white/60 mb-8 max-w-lg">
                    Assessments include reasoning chains. When leadership asks "how do we know this," you have the answer.
                  </p>
                  {/* IMAGE: /public/images/marketing/solutions/legal-feature-confidence.png */}
                  <img 
                    src="/images/marketing/solutions/legal-feature-confidence.png"
                    alt="Confidence with justification"
                    className="w-full aspect-[4/3] object-cover rounded-sm"
                  />
                </div>
                
                {/* Feature 3: Audit */}
                <div id="feature-audit" className="py-16 md:py-24 border-b border-white/10">
                  <h3 className="text-2xl md:text-3xl font-semibold mb-3">Audit trails for coordination</h3>
                  <p className="text-white/60 mb-8 max-w-lg">
                    Full provenance history for every edit. Your product arrives at review with its sources intact.
                  </p>
                  {/* IMAGE: /public/images/marketing/solutions/legal-feature-audit.png */}
                  <img 
                    src="/images/marketing/solutions/legal-feature-audit.png"
                    alt="Audit trails for coordination"
                    className="w-full aspect-[4/3] object-cover rounded-sm"
                  />
                </div>
                
                {/* Feature 4: Security - 2x2 icon grid */}
                <div id="feature-security" className="py-16 md:py-24">
                  <h3 className="text-2xl md:text-3xl font-semibold mb-3">Your data stays yours</h3>
                  <p className="text-white/60 mb-8 max-w-lg">
                    Enterprise-grade security for sensitive work. No compromises.
                  </p>
                  {/* 2x2 Security Grid - Black background */}
                  <div className="grid grid-cols-2">
                    <div className="aspect-[4/3] flex flex-col items-center justify-center p-8 bg-black border border-white/10">
                      <ShieldCheck className="w-16 h-16 text-white/80 mb-6" strokeWidth={1} />
                      <span className="text-lg font-semibold text-white">GDPR Compliant</span>
                    </div>
                    <div className="aspect-[4/3] flex flex-col items-center justify-center p-8 bg-black border border-white/10 border-l-0">
                      <Ban className="w-16 h-16 text-white/80 mb-6" strokeWidth={1} />
                      <span className="text-lg font-semibold text-white">No model training</span>
                    </div>
                    <div className="aspect-[4/3] flex flex-col items-center justify-center p-8 bg-black border border-white/10 border-t-0">
                      <Lock className="w-16 h-16 text-white/80 mb-6" strokeWidth={1} />
                      <span className="text-lg font-semibold text-white text-center">Encrypted everywhere</span>
                    </div>
                    <div className="aspect-[4/3] flex flex-col items-center justify-center p-8 bg-black border border-white/10 border-l-0 border-t-0">
                      <KeyRound className="w-16 h-16 text-white/80 mb-6" strokeWidth={1} />
                      <span className="text-lg font-semibold text-white">Enterprise SSO</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Horizontal line below */}
        <div className="w-full h-px bg-white/10" />
      </section>

      {/* CTA Section */}
      <section className="relative">
        <div className="max-w-7xl mx-auto relative">
          {/* Left vertical line */}
          <div className="absolute top-0 bottom-0 left-5 md:left-6 w-px bg-white/10" />
          {/* Right vertical line */}
          <div className="absolute top-0 bottom-0 right-5 md:right-6 w-px bg-white/10" />
          
          <div className="px-10 md:px-16 py-24 md:py-32 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-6">
              Ready to get started?
            </h2>
            <p className="text-lg text-white/60 mb-8 max-w-xl mx-auto">
              See how Raven can help your team build better case research.
            </p>
            <Link 
              href="/contact"
              className="inline-flex px-8 py-3.5 bg-white text-black text-sm font-medium rounded hover:bg-white/90 transition-colors cursor-pointer"
            >
              Contact Sales
            </Link>
          </div>
        </div>
        
        {/* Horizontal line below */}
        <div className="w-full h-px bg-white/10" />
      </section>

      {/* Footer */}
      <footer className="py-8 px-5 md:px-6">
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
