// src/app/compare/grammarly/page.tsx

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

export default function CompareGrammarlyPage() {
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
              src="https://cdn.brandfetch.io/idZAyF9rlg/w/400/h/400/theme/dark/icon.png?c=1bfwsmEH20zzEfSNTed" 
              alt="Grammarly" 
              className="h-10"
            />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight mb-6">
            Looking for a Grammarly alternative?
          </h1>
          
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10">
            Grammarly makes your writing sound better. Raven makes your writing actually true.
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
            Grammarly polishes writing
          </h2>
          <div className="space-y-4 text-lg text-white/60 leading-relaxed">
            <p>
              Grammar. Tone. Clarity. Conciseness. Grammarly catches errors and suggests improvements. For everyday writing—emails, posts, quick docs—it helps you sound more professional.
            </p>
            <p>
              They've added AI writing features too. Generate text, rewrite paragraphs, adjust tone. And then, in the same product, they sell you AI detection to make sure your writing doesn't sound like AI wrote it.
            </p>
            <p className="text-white font-medium">
              Grammarly is about how you write. It has nothing to say about whether what you're writing is actually correct.
            </p>
          </div>
        </div>
      </section>

      {/* What Raven Actually Does */}
      <section className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <h2 className="text-2xl md:text-3xl font-semibold mb-12 text-center">
            Different problems entirely
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 rounded-lg border border-white/10 bg-white/[0.02]">
              <h3 className="text-xl font-semibold mb-3">Research-backed writing</h3>
              <p className="text-white/60">
                Start with sources, not a blank page. Every claim in your document traces back to evidence. Not about sounding smart—about being right.
              </p>
            </div>
            
            <div className="p-8 rounded-lg border border-white/10 bg-white/[0.02]">
              <h3 className="text-xl font-semibold mb-3">AI that doesn't hallucinate</h3>
              <p className="text-white/60">
                Autocomplete grounded in your actual data. Suggestions you can trace to a source. No generating confident-sounding nonsense.
              </p>
            </div>
            
            <div className="p-8 rounded-lg border border-white/10 bg-white/[0.02]">
              <h3 className="text-xl font-semibold mb-3">Documents that verify themselves</h3>
              <p className="text-white/60">
                Track your sources. When something changes, your document knows. Verification isn't a final step—it's continuous.
              </p>
            </div>
            
            <div className="p-8 rounded-lg border border-white/10 bg-white/[0.02]">
              <h3 className="text-xl font-semibold mb-3">Readers can dig in</h3>
              <p className="text-white/60">
                Share a Raven doc and readers ask it questions. They check your sources, explore your reasoning. The document defends itself.
              </p>
            </div>
            
            <div className="p-8 rounded-lg border border-white/10 bg-white/[0.02]">
              <h3 className="text-xl font-semibold mb-3">See who engaged</h3>
              <p className="text-white/60">
                Reader analytics show who opened your doc, what they focused on, what questions they asked. Know what happened after you hit send.
              </p>
            </div>
            
            <div className="p-8 rounded-lg border border-white/10 bg-white/[0.02]">
              <h3 className="text-xl font-semibold mb-3">Complete audit trail</h3>
              <p className="text-white/60">
                Every edit, every query, every verification. When someone asks where something came from, you have the receipts.
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
              <img src="https://cdn.brandfetch.io/idZAyF9rlg/w/400/h/400/theme/dark/icon.png?c=1bfwsmEH20zzEfSNTed" alt="Grammarly" className="h-7" />
            </div>
          </div>
          
          {/* Section: Research & Sources */}
          <div className="mt-8 mb-4">
            <h3 className="text-lg font-semibold text-white px-6">Research & Sources</h3>
          </div>
          
          <div className="divide-y divide-white/10">
            <FeatureRow
              feature="Multi-Document Analysis"
              description="Research across document sets"
              raven={<YesBadge>Matrix extraction with citations</YesBadge>}
              competitor={<NoBadge />}
              highlighted
            />
            
            <FeatureRow
              feature="Source Citations"
              description="Know where claims came from"
              raven={<YesBadge>Automatic with snippets</YesBadge>}
              competitor={<NoBadge />}
            />
            
            <FeatureRow
              feature="Natural Language Search"
              description="Find information semantically"
              raven={<YesBadge>Across all sources</YesBadge>}
              competitor={<NoBadge />}
              highlighted
            />
          </div>
          
          {/* Section: Writing */}
          <div className="mt-12 mb-4">
            <h3 className="text-lg font-semibold text-white px-6">Writing & Editing</h3>
          </div>
          
          <div className="divide-y divide-white/10">
            <FeatureRow
              feature="Grounded Autocomplete"
              description="Suggestions from your sources"
              raven={<YesBadge>Every suggestion traceable</YesBadge>}
              competitor={<NoBadge />}
              highlighted
            />
            
            <FeatureRow
              feature="AI Writing Assistance"
              description="Help generating content"
              raven={<YesBadge>With citations</YesBadge>}
              competitor={<YesBadge>General generation</YesBadge>}
            />
            
            <FeatureRow
              feature="Grammar & Spelling"
              description="Catch errors"
              raven={<YesBadge />}
              competitor={<YesBadge>Core strength</YesBadge>}
              highlighted
            />
            
            <FeatureRow
              feature="Tone Adjustment"
              description="Sound more professional"
              raven={<PartialBadge>Basic</PartialBadge>}
              competitor={<YesBadge>Extensive controls</YesBadge>}
            />
            
            <FeatureRow
              feature="Browser Extension"
              description="Works everywhere you write"
              raven={<NoBadge />}
              competitor={<YesBadge>All major browsers</YesBadge>}
              highlighted
            />
          </div>
          
          {/* Section: Verification */}
          <div className="mt-12 mb-4">
            <h3 className="text-lg font-semibold text-white px-6">Verification & Trust</h3>
          </div>
          
          <div className="divide-y divide-white/10">
            <FeatureRow
              feature="Confidence Scores"
              description="Know how certain claims are"
              raven={<YesBadge>With reasoning chain</YesBadge>}
              competitor={<NoBadge />}
              highlighted
            />
            
            <FeatureRow
              feature="Source Monitoring"
              description="Know when data changes"
              raven={<YesBadge>Alerts on changes</YesBadge>}
              competitor={<NoBadge />}
            />
            
            <FeatureRow
              feature="Plagiarism Detection"
              description="Check for copied content"
              raven={<NoBadge />}
              competitor={<YesBadge>Built-in</YesBadge>}
              highlighted
            />
            
            <FeatureRow
              feature="AI Detection"
              description="Check if content sounds AI-generated"
              raven={<NoBadge />}
              competitor={<YesBadge>Recent addition</YesBadge>}
            />
          </div>
          
          {/* Section: Publishing */}
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
              description="Track engagement"
              raven={<YesBadge>Views, focus, questions</YesBadge>}
              competitor={<NoBadge />}
            />
            
            <FeatureRow
              feature="Native Document Editor"
              description="Write full documents in-platform"
              raven={<YesBadge>Complete editor</YesBadge>}
              competitor={<PartialBadge>Overlay on other apps</PartialBadge>}
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
              competitor={<PartialBadge>Editing layer only</PartialBadge>}
              highlighted
            />
            
            <FeatureRow
              feature="No Model Training"
              description="Your data stays private"
              raven={<YesBadge>Guaranteed</YesBadge>}
              competitor={<PartialBadge>Settings available</PartialBadge>}
            />
          </div>
        </div>
      </section>

      {/* The Real Difference */}
      <section className="border-b border-white/10">
        <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
          <h2 className="text-3xl font-semibold mb-8">
            Polish vs. substance
          </h2>
          
          <div className="space-y-6 text-lg text-white/60 leading-relaxed">
            <p>
              Grammarly solves one problem well: making your writing cleaner, clearer, more professional. For emails, blog posts, everyday communication—it's useful.
            </p>
            
            <p>
              But for high-stakes documents—the investment memo, the legal brief, the client deliverable—clean prose isn't the challenge. The challenge is: is this actually true? Where did this claim come from? Will it hold up when someone asks questions?
            </p>
            
            <p className="text-white font-medium">
              Grammarly can make a hallucination sound professional. Raven makes sure you're not hallucinating in the first place.
            </p>
            
            <p>
              If you need to polish everyday writing, use Grammarly. If you need to produce documents where the content matters as much as the prose—where being right is the job—that's what Raven is for.
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
