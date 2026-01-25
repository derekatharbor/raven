// src/app/compare/microsoft-word/page.tsx

import Link from 'next/link'
import MainNav from '@/components/marketing/MainNav'
import StickyNav from '@/components/marketing/StickyNav'

// Badge components
function YesBadge({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="px-3 py-1 bg-white text-black text-xs font-semibold rounded">
        YES
      </span>
      {children && (
        <p className="text-sm text-white/50 text-center max-w-[220px]">{children}</p>
      )}
    </div>
  )
}

function NoBadge() {
  return (
    <span className="px-3 py-1 bg-transparent text-white/40 text-xs font-semibold rounded border border-white/20">
      NO
    </span>
  )
}

function PartialBadge({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="px-3 py-1 bg-white/10 text-white/60 text-xs font-semibold rounded">
        PARTIAL
      </span>
      {children && (
        <p className="text-sm text-white/40 text-center max-w-[220px]">{children}</p>
      )}
    </div>
  )
}

// Feature row component
interface FeatureRowProps {
  feature: string
  description: string
  raven: React.ReactNode
  competitor: React.ReactNode
  highlighted?: boolean
}

function FeatureRow({ feature, description, raven, competitor, highlighted }: FeatureRowProps) {
  return (
    <div className={`grid grid-cols-3 py-6 ${highlighted ? 'bg-white/[0.02]' : ''}`}>
      <div className="px-6">
        <h3 className="font-semibold text-white">{feature}</h3>
        <p className="text-sm text-white/50 mt-1">{description}</p>
      </div>
      <div className="flex justify-center items-start">
        {raven}
      </div>
      <div className="flex justify-center items-start">
        {competitor}
      </div>
    </div>
  )
}

export default function CompareMicrosoftWordPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <MainNav />
      <StickyNav />

      {/* Hero Section */}
      <section className="relative border-b border-white/10">
        <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />
        
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24 text-center">
          {/* Logos */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <img 
              src="/images/raven-logo-white.png" 
              alt="Raven" 
              className="h-10"
            />
            <span className="text-white/30 text-3xl font-light">vs</span>
            <img 
              src="https://cdn.brandfetch.io/idchmboHEZ/w/400/h/400/theme/dark/icon.png?c=1bfwsmEH20zzEfSNTed" 
              alt="Microsoft Word" 
              className="h-10"
            />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight mb-6">
            Looking for a Microsoft Word alternative?
          </h1>
          
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10">
            Word is the document standard. But adding Copilot to a 40-year-old word processor doesn't make it intelligent.
          </p>
          
          <Link 
            href="/signup"
            className="inline-flex px-8 py-3.5 bg-white text-black text-sm font-medium rounded hover:bg-white/90 transition-colors cursor-pointer"
          >
            Try Raven Free
          </Link>
        </div>
      </section>

      {/* The Problem */}
      <section className="border-b border-white/10">
        <div className="max-w-3xl mx-auto px-6 py-16 md:py-20">
          <h2 className="text-2xl md:text-3xl font-semibold mb-6">
            Word is everywhere
          </h2>
          <div className="space-y-4 text-lg text-white/60 leading-relaxed">
            <p>
              Microsoft Word has been the default for professional documents since 1983. Track changes. Comments. Formatting that (mostly) survives email. Copilot now helps you draft, summarize, and rewrite.
            </p>
            <p>
              But underneath the AI features, it's still the same architecture. Text goes in, text comes out. The document doesn't know where its claims came from. It can't tell you when your sources are outdated. It can't show readers the evidence behind your conclusions.
            </p>
            <p className="text-white font-medium">
              Copilot makes Word faster. It doesn't make your documents smarter.
            </p>
          </div>
        </div>
      </section>

      {/* What Raven Actually Does */}
      <section className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <h2 className="text-2xl md:text-3xl font-semibold mb-12 text-center">
            What Raven does differently
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 rounded-lg border border-white/10 bg-white/[0.02]">
              <h3 className="text-xl font-semibold mb-3">Research that builds the foundation</h3>
              <p className="text-white/60">
                Start with your sources, not a blank page. Multi-document analysis extracts insights with citations before you write a word.
              </p>
            </div>
            
            <div className="p-8 rounded-lg border border-white/10 bg-white/[0.02]">
              <h3 className="text-xl font-semibold mb-3">AI that doesn't make things up</h3>
              <p className="text-white/60">
                Autocomplete grounded in your actual data. Every suggestion traceable to a source. No hallucinations disguised as facts.
              </p>
            </div>
            
            <div className="p-8 rounded-lg border border-white/10 bg-white/[0.02]">
              <h3 className="text-xl font-semibold mb-3">Documents that monitor themselves</h3>
              <p className="text-white/60">
                Track the sources behind your claims. When something changes—earnings reported, policy updated, market moved—you know.
              </p>
            </div>
            
            <div className="p-8 rounded-lg border border-white/10 bg-white/[0.02]">
              <h3 className="text-xl font-semibold mb-3">Interactive deliverables</h3>
              <p className="text-white/60">
                Readers can ask your document questions. They explore sources, check reasoning, engage with evidence. Not passive reading—active interrogation.
              </p>
            </div>
            
            <div className="p-8 rounded-lg border border-white/10 bg-white/[0.02]">
              <h3 className="text-xl font-semibold mb-3">Engagement visibility</h3>
              <p className="text-white/60">
                Know who read your doc, what they focused on, what questions they asked. Stop wondering if anyone opened the attachment.
              </p>
            </div>
            
            <div className="p-8 rounded-lg border border-white/10 bg-white/[0.02]">
              <h3 className="text-xl font-semibold mb-3">Complete provenance</h3>
              <p className="text-white/60">
                Every claim, every edit, every query—logged with full context. When someone asks "where did this come from," the answer is one click away.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <h2 className="text-3xl font-semibold text-center mb-12">
            Side by side
          </h2>
          
          {/* Table Header */}
          <div className="grid grid-cols-3 py-4 border-b border-white/20 mb-2">
            <div className="px-6">
              <span className="text-sm font-semibold text-white/50 uppercase tracking-wider">Capability</span>
            </div>
            <div className="flex justify-center">
              <img src="/images/raven-logo-white.png" alt="Raven" className="h-7" />
            </div>
            <div className="flex justify-center">
              <img src="https://cdn.brandfetch.io/idchmboHEZ/w/400/h/400/theme/dark/icon.png?c=1bfwsmEH20zzEfSNTed" alt="Microsoft Word" className="h-7" />
            </div>
          </div>
          
          {/* Section: Research & Analysis */}
          <div className="mt-8 mb-4">
            <h3 className="text-lg font-semibold text-white px-6">Research & Analysis</h3>
          </div>
          
          <div className="divide-y divide-white/10">
            <FeatureRow
              feature="Multi-Document Analysis"
              description="Extract insights across document sets"
              raven={<YesBadge>Matrix extraction with citations</YesBadge>}
              competitor={<NoBadge />}
              highlighted
            />
            
            <FeatureRow
              feature="Natural Language Search"
              description="Find information semantically"
              raven={<YesBadge>Across all connected sources</YesBadge>}
              competitor={<PartialBadge>Copilot can search within doc</PartialBadge>}
            />
            
            <FeatureRow
              feature="Source Citations"
              description="Know where claims came from"
              raven={<YesBadge>Automatic with snippets</YesBadge>}
              competitor={<NoBadge />}
              highlighted
            />
          </div>
          
          {/* Section: Writing & Editing */}
          <div className="mt-12 mb-4">
            <h3 className="text-lg font-semibold text-white px-6">Writing & Editing</h3>
          </div>
          
          <div className="divide-y divide-white/10">
            <FeatureRow
              feature="Grounded Autocomplete"
              description="Suggestions from your sources"
              raven={<YesBadge>Every suggestion tied to data</YesBadge>}
              competitor={<NoBadge />}
              highlighted
            />
            
            <FeatureRow
              feature="AI Writing Help"
              description="Assistance drafting content"
              raven={<YesBadge>With citations and confidence</YesBadge>}
              competitor={<YesBadge>Copilot, no source grounding</YesBadge>}
            />
            
            <FeatureRow
              feature="Track Changes"
              description="See who edited what"
              raven={<YesBadge />}
              competitor={<YesBadge>Industry standard</YesBadge>}
              highlighted
            />
            
            <FeatureRow
              feature="Formatting Controls"
              description="Professional document styling"
              raven={<YesBadge />}
              competitor={<YesBadge>Comprehensive</YesBadge>}
            />
          </div>
          
          {/* Section: Publishing & Sharing */}
          <div className="mt-12 mb-4">
            <h3 className="text-lg font-semibold text-white px-6">Publishing & Sharing</h3>
          </div>
          
          <div className="divide-y divide-white/10">
            <FeatureRow
              feature="Interactive Documents"
              description="Readers can ask questions"
              raven={<YesBadge>Scoped AI Q&A</YesBadge>}
              competitor={<NoBadge />}
              highlighted
            />
            
            <FeatureRow
              feature="Reader Analytics"
              description="Know who engaged and how"
              raven={<YesBadge>Views, focus, questions</YesBadge>}
              competitor={<NoBadge />}
            />
            
            <FeatureRow
              feature="Export Options"
              description="PDF, DOCX, etc."
              raven={<YesBadge />}
              competitor={<YesBadge>Extensive</YesBadge>}
              highlighted
            />
          </div>
          
          {/* Section: Monitoring & Verification */}
          <div className="mt-12 mb-4">
            <h3 className="text-lg font-semibold text-white px-6">Monitoring & Verification</h3>
          </div>
          
          <div className="divide-y divide-white/10">
            <FeatureRow
              feature="Source Monitoring"
              description="Know when underlying data changes"
              raven={<YesBadge>Alerts on tracked items</YesBadge>}
              competitor={<NoBadge />}
              highlighted
            />
            
            <FeatureRow
              feature="Staleness Detection"
              description="Documents that know they're outdated"
              raven={<YesBadge>Automatic verification</YesBadge>}
              competitor={<NoBadge />}
            />
            
            <FeatureRow
              feature="Version History"
              description="Track changes over time"
              raven={<YesBadge>With full audit trail</YesBadge>}
              competitor={<YesBadge>AutoSave versions</YesBadge>}
              highlighted
            />
          </div>
          
          {/* Section: Platform */}
          <div className="mt-12 mb-4">
            <h3 className="text-lg font-semibold text-white px-6">Platform</h3>
          </div>
          
          <div className="divide-y divide-white/10">
            <FeatureRow
              feature="End-to-End Workflow"
              description="Research → Write → Publish"
              raven={<YesBadge>Complete platform</YesBadge>}
              competitor={<PartialBadge>Writing only</PartialBadge>}
              highlighted
            />
            
            <FeatureRow
              feature="No Model Training"
              description="Your data stays private"
              raven={<YesBadge>Guaranteed</YesBadge>}
              competitor={<PartialBadge>Enterprise settings</PartialBadge>}
            />
            
            <FeatureRow
              feature="Offline Access"
              description="Work without internet"
              raven={<PartialBadge>Coming soon</PartialBadge>}
              competitor={<YesBadge>Full desktop app</YesBadge>}
              highlighted
            />
          </div>
        </div>
      </section>

      {/* The Real Difference */}
      <section className="border-b border-white/10">
        <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
          <h2 className="text-3xl font-semibold mb-8">
            Same problem, different interface
          </h2>
          
          <div className="space-y-6 text-lg text-white/60 leading-relaxed">
            <p>
              Word with Copilot is still Word. Faster to draft, sure. Better at summarizing, yes. But the fundamental workflow hasn't changed: you write something, you save it, it becomes a static file that immediately starts going stale.
            </p>
            
            <p>
              The document still doesn't know where its claims came from. It still can't verify itself against sources. Readers still can't interrogate it. You still don't know if anyone read it.
            </p>
            
            <p className="text-white font-medium">
              Copilot is AI bolted onto a word processor. Raven is a platform built around AI from the start.
            </p>
            
            <p>
              For formatting-heavy documents where the template matters, Word still works. For documents where being right matters—where you need to trace every claim, monitor every source, and prove your work—that requires something built for it.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-b border-white/10">
        <div className="max-w-3xl mx-auto px-6 py-16 md:py-24 text-center">
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
      <footer className="py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
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
