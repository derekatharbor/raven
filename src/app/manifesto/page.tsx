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
              Kill the static doc.
            </h1>
          </div>
        </div>

        {/* Horizontal line */}
        <div className="w-full h-px bg-white/10" />
      </section>

      {/* The State of Documents */}
      <section className="relative">
        <div className="max-w-7xl mx-auto relative">
          {/* Left vertical line */}
          <div className="absolute top-0 bottom-0 left-5 md:left-6 w-px bg-white/10" />
          {/* Right vertical line */}
          <div className="absolute top-0 bottom-0 right-5 md:right-6 w-px bg-white/10" />
          
          <div className="px-10 md:px-16 py-16 md:py-24">
            <div className="max-w-3xl">
              <h2 className="text-2xl md:text-3xl font-semibold mb-8">
                Documents carry everything that matters
              </h2>
              <div className="space-y-6 text-lg text-white/60 leading-relaxed">
                <p>
                  Investment memos. Legal briefs. Intelligence assessments. Board decks. Policy recommendations. The decisions that move markets, win cases, and shape strategy—they all live in documents.
                </p>
                <p>
                  And in 2026, we're still copying from ChatGPT into Word and hoping nobody asks where the numbers came from.
                </p>
                <p className="text-white">
                  This is embarrassing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal line */}
        <div className="w-full h-px bg-white/10" />
      </section>

      {/* The Innovation That Wasn't */}
      <section className="relative">
        <div className="max-w-7xl mx-auto relative">
          {/* Left vertical line */}
          <div className="absolute top-0 bottom-0 left-5 md:left-6 w-px bg-white/10" />
          {/* Right vertical line */}
          <div className="absolute top-0 bottom-0 right-5 md:right-6 w-px bg-white/10" />
          
          <div className="px-10 md:px-16 py-16 md:py-24">
            <div className="max-w-3xl ml-auto">
              <h2 className="text-2xl md:text-3xl font-semibold mb-8">
                The innovation that wasn't
              </h2>
              <div className="space-y-6 text-lg text-white/60 leading-relaxed">
                <p>
                  Google gave us real-time collaboration. That was 2006.
                </p>
                <p>
                  Notion gave us blocks and emojis. Microsoft bolted Copilot onto a 40-year-old word processor. Dropbox added "AI search." Everyone's racing to sprinkle AI on top of software that was never designed for it.
                </p>
                <p>
                  Meanwhile, documents are still static. They still go stale the moment you hit save. They still can't tell you where the claims came from. They still disappear into inboxes and never get read.
                </p>
                <p className="text-white">
                  Two decades of "innovation" and the best we got was a block system that lets you label pages with emojis.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal line */}
        <div className="w-full h-px bg-white/10" />
      </section>

      {/* The Fragmentation Problem */}
      <section className="relative">
        <div className="max-w-7xl mx-auto relative">
          {/* Left vertical line */}
          <div className="absolute top-0 bottom-0 left-5 md:left-6 w-px bg-white/10" />
          {/* Right vertical line */}
          <div className="absolute top-0 bottom-0 right-5 md:right-6 w-px bg-white/10" />
          
          <div className="px-10 md:px-16 py-16 md:py-24">
            <div className="max-w-3xl">
              <h2 className="text-2xl md:text-3xl font-semibold mb-8">
                The fragmentation problem
              </h2>
              <div className="space-y-6 text-lg text-white/60 leading-relaxed">
                <p>
                  Research in one tool. Writing in another. Storage somewhere else. Collaboration in Slack. Version control in email. Citations done manually at the end, if at all.
                </p>
                <p>
                  The startup market has become "we connect your 800 apps together!" The AI market is selling you writing assistants and then—in the same product—tools to make your writing sound less like AI. That's the state of innovation.
                </p>
                <p>
                  Nobody built the thing that actually needed to exist: a place where research, writing, verification, and publishing work together. Where the document isn't just a container for text—it's an intelligent system that knows where its information came from and what's happened to it since.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal line */}
        <div className="w-full h-px bg-white/10" />
      </section>

      {/* What Documents Should Be */}
      <section className="relative">
        <div className="max-w-7xl mx-auto relative">
          {/* Left vertical line */}
          <div className="absolute top-0 bottom-0 left-5 md:left-6 w-px bg-white/10" />
          {/* Right vertical line */}
          <div className="absolute top-0 bottom-0 right-5 md:right-6 w-px bg-white/10" />
          
          <div className="px-10 md:px-16 py-16 md:py-24">
            <div className="max-w-3xl ml-auto">
              <h2 className="text-2xl md:text-3xl font-semibold mb-8">
                What documents should be
              </h2>
              <div className="space-y-6 text-lg text-white/60 leading-relaxed">
                <p className="text-white text-xl">
                  Documents should work. Actually work.
                </p>
                <p>
                  They should know where every claim came from. Not as footnotes added later, but as the foundation each statement was built on.
                </p>
                <p>
                  They should know when they're going stale. When the source changes, when the market moves, when the facts shift—the document should know before you do.
                </p>
                <p>
                  They should be interactive. Readers should be able to ask questions, drill into sources, interrogate the reasoning. A document shouldn't be a wall of text you hope someone reads.
                </p>
                <p>
                  They should tell you what happened to them. Who read it. What they focused on. What questions they asked. Your work shouldn't disappear into a void.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal line */}
        <div className="w-full h-px bg-white/10" />
      </section>

      {/* Why This Requires Starting Over */}
      <section className="relative">
        <div className="max-w-7xl mx-auto relative">
          {/* Left vertical line */}
          <div className="absolute top-0 bottom-0 left-5 md:left-6 w-px bg-white/10" />
          {/* Right vertical line */}
          <div className="absolute top-0 bottom-0 right-5 md:right-6 w-px bg-white/10" />
          
          <div className="px-10 md:px-16 py-16 md:py-24">
            <div className="max-w-3xl">
              <h2 className="text-2xl md:text-3xl font-semibold mb-8">
                You can't bolt this onto Word
              </h2>
              <div className="space-y-6 text-lg text-white/60 leading-relaxed">
                <p>
                  This isn't a feature request for Microsoft. You can't add "continuous verification" to software designed before the internet existed. You can't retrofit "source tracing" onto a word processor that treats text as text.
                </p>
                <p>
                  The entire architecture has to assume intelligence from the start. The AI isn't a feature—it's the foundation. Every piece of content is a node in a knowledge graph. Every claim has provenance. Every document is alive.
                </p>
                <p className="text-white">
                  You have to build for this from day one. So that's what we did.
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
          
          <div className="px-10 md:px-16 py-24 md:py-32">
            <div className="max-w-3xl ml-auto">
              <p className="text-2xl md:text-3xl font-medium text-white leading-relaxed mb-6">
                Down with the PDF. Down with the static doc.
              </p>
              <p className="text-lg text-white/60 leading-relaxed">
                Documents are the operating system of professional work. It's time they started acting like it.
              </p>
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
          
          <div className="px-10 md:px-16 py-16 md:py-20 text-center">
            <Link 
              href="/signup"
              className="inline-flex px-8 py-3.5 bg-white text-black text-sm font-medium rounded hover:bg-white/90 transition-colors cursor-pointer"
            >
              Try Raven
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