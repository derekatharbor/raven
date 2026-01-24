// src/app/manifesto/page.tsx

import Link from 'next/link'
import MainNav from '@/components/marketing/MainNav'
import StickyNav from '@/components/marketing/StickyNav'

export default function ManifestoPage() {
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
              Manifesto
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.1] tracking-tight max-w-4xl">
              Documents were supposed to get smarter. They didn't.
            </h1>
          </div>
        </div>

        {/* Horizontal line */}
        <div className="w-full h-px bg-white/10" />
      </section>

      {/* The Problem */}
      <section className="relative">
        <div className="max-w-7xl mx-auto relative">
          {/* Left vertical line */}
          <div className="absolute top-0 bottom-0 left-5 md:left-6 w-px bg-white/10" />
          {/* Right vertical line */}
          <div className="absolute top-0 bottom-0 right-5 md:right-6 w-px bg-white/10" />
          
          <div className="px-10 md:px-16 py-16 md:py-24">
            <div className="max-w-3xl">
              <h2 className="text-2xl md:text-3xl font-semibold mb-8">
                The problem
              </h2>
              <div className="space-y-6 text-lg text-white/60 leading-relaxed">
                <p>
                  Every report you've ever written became a fossil the moment you hit save.
                </p>
                <p>
                  The market moved. The policy changed. The competitor launched. But your document didn't know. It sat there, confidently wrong, waiting to embarrass you in the next meeting.
                </p>
                <p>
                  We've had "smart documents" for decades now. Track changes. Version history. Comments. Real-time collaboration. But none of that made documents actually intelligent. It just made them easier to edit together.
                </p>
                <p>
                  The fundamental problem remained: a document is a snapshot. The world keeps moving. The document doesn't.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal line */}
        <div className="w-full h-px bg-white/10" />
      </section>

      {/* The Deeper Issue */}
      <section className="relative">
        <div className="max-w-7xl mx-auto relative">
          {/* Left vertical line */}
          <div className="absolute top-0 bottom-0 left-5 md:left-6 w-px bg-white/10" />
          {/* Right vertical line */}
          <div className="absolute top-0 bottom-0 right-5 md:right-6 w-px bg-white/10" />
          
          <div className="px-10 md:px-16 py-16 md:py-24">
            <div className="max-w-3xl ml-auto">
              <h2 className="text-2xl md:text-3xl font-semibold mb-8">
                It's worse than that
              </h2>
              <div className="space-y-6 text-lg text-white/60 leading-relaxed">
                <p>
                  Even when documents are current, we have no idea if they're right.
                </p>
                <p>
                  Where did that revenue number come from? What's the source for that market size claim? Who verified that the CEO actually said that?
                </p>
                <p>
                  In most documents, citations are an afterthought—a chore performed at the end, if at all. The claims come first. The sourcing comes later. Or never.
                </p>
                <p>
                  This is backwards. It's how misinformation spreads. It's how embarrassing corrections happen. It's why your IC memo gets torn apart in review.
                </p>
                <p>
                  The document doesn't know where its claims came from. So neither do you.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal line */}
        <div className="w-full h-px bg-white/10" />
      </section>

      {/* The Vision */}
      <section className="relative">
        <div className="max-w-7xl mx-auto relative">
          {/* Left vertical line */}
          <div className="absolute top-0 bottom-0 left-5 md:left-6 w-px bg-white/10" />
          {/* Right vertical line */}
          <div className="absolute top-0 bottom-0 right-5 md:right-6 w-px bg-white/10" />
          
          <div className="px-10 md:px-16 py-16 md:py-24">
            <div className="max-w-3xl">
              <h2 className="text-2xl md:text-3xl font-semibold mb-8">
                Where documents should be
              </h2>
              <div className="space-y-6 text-lg text-white/60 leading-relaxed">
                <p className="text-white text-xl">
                  We believe documents should know where their claims come from—and tell you when those claims are wrong.
                </p>
                <p>
                  Every statement should trace back to a source. Not as a footnote added later, but as the foundation the statement was built on.
                </p>
                <p>
                  Every conclusion should show its reasoning. Not "the AI said so," but "here's the evidence, here's the logic, here's the confidence level."
                </p>
                <p>
                  Every document should monitor itself. When the underlying facts change, you should know—before someone else tells you.
                </p>
                <p>
                  This isn't science fiction. This is what documents would look like if we designed them today, with AI at the foundation instead of bolted on top.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal line */}
        <div className="w-full h-px bg-white/10" />
      </section>

      {/* The Implication */}
      <section className="relative">
        <div className="max-w-7xl mx-auto relative">
          {/* Left vertical line */}
          <div className="absolute top-0 bottom-0 left-5 md:left-6 w-px bg-white/10" />
          {/* Right vertical line */}
          <div className="absolute top-0 bottom-0 right-5 md:right-6 w-px bg-white/10" />
          
          <div className="px-10 md:px-16 py-16 md:py-24">
            <div className="max-w-3xl ml-auto">
              <h2 className="text-2xl md:text-3xl font-semibold mb-8">
                What this changes
              </h2>
              <div className="space-y-6 text-lg text-white/60 leading-relaxed">
                <p>
                  Verification stops being a final step. It becomes continuous—baked into every claim from the moment of creation.
                </p>
                <p>
                  Review stops being adversarial. When sources are visible and reasoning is transparent, there's nothing to defend. The document speaks for itself.
                </p>
                <p>
                  Trust stops being assumed. It becomes earned—through provenance, through transparency, through receipts.
                </p>
                <p>
                  This is the document experience that professionals deserve. Not another AI chatbot stapled to a word processor. A fundamentally new relationship between what you write and what you know.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal line */}
        <div className="w-full h-px bg-white/10" />
      </section>

      {/* Closing */}
      <section className="relative">
        <div className="max-w-7xl mx-auto relative">
          {/* Left vertical line */}
          <div className="absolute top-0 bottom-0 left-5 md:left-6 w-px bg-white/10" />
          {/* Right vertical line */}
          <div className="absolute top-0 bottom-0 right-5 md:right-6 w-px bg-white/10" />
          
          <div className="px-10 md:px-16 py-24 md:py-32 text-center">
            <p className="text-2xl md:text-3xl font-medium text-white/80 max-w-2xl mx-auto leading-relaxed">
              That's what we're building.
            </p>
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
          
          <div className="px-10 md:px-16 py-16 md:py-20 text-center">
            <Link 
              href="/contact"
              className="inline-flex px-8 py-3.5 bg-white text-black text-sm font-medium rounded hover:bg-white/90 transition-colors cursor-pointer"
            >
              Get Early Access
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
