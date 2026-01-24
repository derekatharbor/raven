// src/app/about/page.tsx

import Link from 'next/link'
import MainNav from '@/components/marketing/MainNav'
import StickyNav from '@/components/marketing/StickyNav'

export default function AboutPage() {
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
          
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 px-10 md:px-16 py-16 md:py-24">
            {/* Left - Image */}
            <div>
              {/* IMAGE: /public/images/about/about-hero.png */}
              <img 
                src="/images/about/about-hero.png"
                alt="Raven"
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
            
            {/* Right - Copy */}
            <div className="flex flex-col justify-center">
              <span className="text-xs uppercase tracking-widest text-white/40 mb-4 block">
                About
              </span>
              <h1 className="text-4xl md:text-5xl font-semibold leading-[1.1] tracking-tight">
                Built by analysts, for analysts.
              </h1>
            </div>
          </div>
        </div>

        {/* Horizontal line */}
        <div className="w-full h-px bg-white/10" />
      </section>

      {/* AI-Native Section */}
      <section className="relative">
        <div className="max-w-7xl mx-auto relative">
          {/* Left vertical line */}
          <div className="absolute top-0 bottom-0 left-5 md:left-6 w-px bg-white/10" />
          {/* Right vertical line */}
          <div className="absolute top-0 bottom-0 right-5 md:right-6 w-px bg-white/10" />
          
          <div className="px-10 md:px-16 py-16 md:py-24">
            <div className="grid md:grid-cols-2 gap-12 md:gap-20">
              {/* Left - Image */}
              <div className="flex items-center justify-center">
                {/* IMAGE: /public/images/about/ai-native-diagram.png */}
                <img 
                  src="/images/about/ai-native-diagram.png"
                  alt="AI-native architecture"
                  className="w-full max-w-[400px]"
                />
              </div>
              
              {/* Right - Content */}
              <div>
                <h2 className="text-3xl md:text-4xl font-semibold leading-tight mb-8">
                  AI-native, not AI-added.
                </h2>
                <div className="space-y-6 text-lg text-white/60 leading-relaxed">
                  <p>
                    Every software company is rushing to add AI. A chatbot here, an "AI assistant" there. Features bolted onto architectures designed before the transformer existed.
                  </p>
                  <p>
                    Raven is different. We didn't add AI to a document tool—we built a document tool around AI. The model isn't a feature. It's the foundation.
                  </p>
                  <p>
                    This isn't a philosophical distinction. It's a practical one. AI-native means every claim can be traced to source. Every conclusion shows its reasoning. Every document knows when its underlying facts have changed.
                  </p>
                  <p>
                    You can't bolt that onto legacy software. You have to build for it from day one.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal line */}
        <div className="w-full h-px bg-white/10" />
      </section>

      {/* Founder Section */}
      <section className="relative">
        <div className="max-w-7xl mx-auto relative">
          {/* Left vertical line */}
          <div className="absolute top-0 bottom-0 left-5 md:left-6 w-px bg-white/10" />
          {/* Right vertical line */}
          <div className="absolute top-0 bottom-0 right-5 md:right-6 w-px bg-white/10" />
          
          <div className="px-10 md:px-16 py-16 md:py-24">
            <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
              {/* Left - Image */}
              <div>
                {/* IMAGE: /public/images/about/founder.jpg */}
                <div className="aspect-[4/5] bg-white/5 rounded-sm overflow-hidden">
                  <img 
                    src="/images/about/founder.jpeg"
                    alt="Founder"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Right - Bio */}
              <div>
                <h2 className="text-3xl md:text-4xl font-semibold mb-6">
                  From the intelligence community to the private sector.
                </h2>
                <div className="space-y-4 text-lg text-white/60 leading-relaxed">
                  <p>
                    Raven was founded by an analyst who spent years supporting the U.S. intelligence community—where every assessment needs sourcing, every conclusion needs justification, and "the AI said so" is never an acceptable answer.
                  </p>
                  <p>
                    After transitioning to private sector consulting, the gap became clear: the same rigor that's mandatory in intelligence work is desperately needed in finance, legal, and consulting. But the tools don't exist.
                  </p>
                  <p>
                    Raven is the tool we wished we had. Built with the standards of intelligence work, designed for the pace of commercial business.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal line */}
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
              See how Raven can bring intelligence-grade rigor to your work.
            </p>
            <Link 
              href="/contact"
              className="inline-flex px-8 py-3.5 bg-white text-black text-sm font-medium rounded hover:bg-white/90 transition-colors cursor-pointer"
            >
              Contact Sales
            </Link>
          </div>
        </div>
        
        {/* Horizontal line */}
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