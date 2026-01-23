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
                From OSINT to classified holdings—Raven helps analysts work faster without sacrificing rigor.
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
          
          <div className="ml-5 md:ml-6 mr-5 md:mr-6 py-8 md:py-12">
            <img 
              src="/images/marketing/solutions/government-hero.png" 
              alt="Raven for Government"
              className="w-full aspect-[2/1] object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  )
}