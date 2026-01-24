// src/app/solutions/government/page.tsx

import Link from 'next/link'
import MainNav from '@/components/marketing/MainNav'
import StickyNav from '@/components/marketing/StickyNav'

export default function GovernmentPage() {
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
                For Government
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.1] tracking-tight">
                Intelligence you can stand behind.
              </h1>
            </div>
            
            {/* Right - Description + CTA */}
            <div className="flex flex-col justify-end">
              <p className="text-lg text-white/60 mb-4 leading-relaxed">
                Build intelligence products with AI that shows its reasoning. Every assessment backed by source material with complete provenance.
              </p>
              <p className="text-lg text-white/60 mb-8 leading-relaxed">
                From OSINT to finished intelligence—Raven helps analysts work faster without sacrificing rigor.
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
        {/* IMAGE: /public/images/marketing/solutions/government-hero.png */}
        <div className="max-w-7xl mx-auto relative">
          {/* Left vertical line */}
          <div className="absolute top-0 bottom-0 left-5 md:left-6 w-px bg-white/10" />
          {/* Right vertical line */}
          <div className="absolute top-0 bottom-0 right-5 md:right-6 w-px bg-white/10" />
          
          <div className="ml-5 md:ml-6 mr-5 md:mr-6">
            <img 
              src="/images/marketing/solutions/government-hero.png" 
              alt="Raven for Government"
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
          
          {/* Header */}
          <div className="px-10 md:px-16 py-16 md:py-20 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight">
              Generic AI fails intelligence analysts<br />because...
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
            <div className="p-6 md:p-8 border-r border-b md:border-b-0 border-white/10">
              <p className="text-sm md:text-base text-white/80 leading-relaxed">
                Your brief needs to cite every cable and report
              </p>
            </div>
            <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-white/10">
              <p className="text-sm md:text-base text-white/80 leading-relaxed">
                You're tracking an entity across 5 years of reporting
              </p>
            </div>
            <div className="p-6 md:p-8 border-r md:border-r border-white/10">
              <p className="text-sm md:text-base text-white/80 leading-relaxed">
                Assessment confidence needs justification
              </p>
            </div>
            <div className="p-6 md:p-8 md:border-r border-white/10">
              <p className="text-sm md:text-base text-white/80 leading-relaxed">
                Sources can't be exposed to commercial AI
              </p>
            </div>
            <div className="p-6 md:p-8 col-span-2 md:col-span-1">
              <p className="text-sm md:text-base text-white/80 leading-relaxed">
                Your product needs to survive coordination
              </p>
            </div>
          </div>
        </div>

        {/* Horizontal line below */}
        <div className="w-full h-px bg-white/10" />
      </section>
    </div>
  )
}