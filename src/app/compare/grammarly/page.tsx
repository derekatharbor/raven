// src/app/compare/notion/page.tsx

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

export default function CompareNotionPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <MainNav />
      <StickyNav />

      {/* Hero Section */}
      <section className="relative border-b border-white/10">
        {/* Horizontal line under nav */}
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
              src="https://cdn.brandfetch.io/notion.so/w/512/h/512" 
              alt="Notion" 
              className="h-10 invert"
            />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight mb-6">
            Looking for a Notion alternative?
          </h1>
          
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10">
            Notion is a wiki with AI sprinkled on top. Raven is an end-to-end platform for research, writing, and publishing—where documents actually work.
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
            Notion is great at what it does
          </h2>
          <div className="space-y-4 text-lg text-white/60 leading-relaxed">
            <p>
              Team wikis. Project documentation. Meeting notes. Internal knowledge bases. Notion handles all of that well. The block system is flexible, collaboration works, and the AI features help with basic writing tasks.
            </p>
            <p>
              But Notion wasn't built for high-stakes deliverables. There's no way to trace where information came from. No way to know if your sources have changed. No way for readers to interrogate the document. No way to see if anyone actually read it.
            </p>
            <p className="text-white font-medium">
              For internal docs and team collaboration, Notion is fine. For work that leaves the building—work you have to defend—you need something built for that.
            </p>
          </div>
        </div>
      </section>

      {/* What Raven Actually Does */}
      <section className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <h2 className="text-2xl md:text-3xl font-semibold mb-12 text-center">
            What Raven actually does
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 rounded-lg border border-white/10 bg-white/[0.02]">
              <h3 className="text-xl font-semibold mb-3">Research that doesn't start from scratch</h3>
              <p className="text-white/60">
                Multi-agent analysis across your entire document set. Ask a question, get answers from hundreds of sources with full citations. Not a chatbot—an actual research engine.
              </p>
            </div>
            
            <div className="p-8 rounded-lg border border-white/10 bg-white/[0.02]">
              <h3 className="text-xl font-semibold mb-3">Writing that doesn't hallucinate</h3>
              <p className="text-white/60">
                Smart autocomplete grounded in your sources. Every suggestion tied to real data. Consultants, lawyers, and analysts can actually use it without getting fired.
              </p>
            </div>
            
            <div className="p-8 rounded-lg border border-white/10 bg-white/[0.02]">
              <h3 className="text-xl font-semibold mb-3">Documents people can talk to</h3>
              <p className="text-white/60">
                Share a Raven doc and readers can ask it questions. Scoped AI Q&A on your content—not the entire internet. Your deliverable becomes interactive.
              </p>
            </div>
            
            <div className="p-8 rounded-lg border border-white/10 bg-white/[0.02]">
              <h3 className="text-xl font-semibold mb-3">Analytics on who actually read it</h3>
              <p className="text-white/60">
                Reader engagement tracking. Know who opened your doc, what they focused on, what questions they asked. Your work doesn't disappear into a void.
              </p>
            </div>
            
            <div className="p-8 rounded-lg border border-white/10 bg-white/[0.02]">
              <h3 className="text-xl font-semibold mb-3">Monitoring that catches problems</h3>
              <p className="text-white/60">
                Track keywords, phrases, and topics across your sources. Get alerts when something changes. Your documents know when they're going stale.
              </p>
            </div>
            
            <div className="p-8 rounded-lg border border-white/10 bg-white/[0.02]">
              <h3 className="text-xl font-semibold mb-3">Search that actually finds things</h3>
              <p className="text-white/60">
                Natural language search across all your data. Not keyword matching—semantic understanding. Find the needle without knowing which haystack it's in.
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
              <img src="https://cdn.brandfetch.io/notion.so/w/512/h/512" alt="Notion" className="h-7 invert" />
            </div>
          </div>
          
          {/* Section: Research & Analysis */}
          <div className="mt-8 mb-4">
            <h3 className="text-lg font-semibold text-white px-6">Research & Analysis</h3>
          </div>
          
          <div className="divide-y divide-white/10">
            <FeatureRow
              feature="Multi-Document Analysis"
              description="Extract insights across entire document sets"
              raven={<YesBadge>Matrix extraction with citations across unlimited docs</YesBadge>}
              competitor={<NoBadge />}
              highlighted
            />
            
            <FeatureRow
              feature="Natural Language Search"
              description="Find information without knowing where it is"
              raven={<YesBadge>Semantic search across all sources</YesBadge>}
              competitor={<PartialBadge>Basic search within workspace</PartialBadge>}
            />
            
            <FeatureRow
              feature="Source Citations"
              description="Know where every claim came from"
              raven={<YesBadge>Automatic with page, paragraph, snippet</YesBadge>}
              competitor={<NoBadge />}
              highlighted
            />
            
            <FeatureRow
              feature="Multi-Agent Research"
              description="AI agents working together on complex queries"
              raven={<YesBadge>Orchestrated analysis across sources</YesBadge>}
              competitor={<NoBadge />}
            />
          </div>
          
          {/* Section: Writing & Editing */}
          <div className="mt-12 mb-4">
            <h3 className="text-lg font-semibold text-white px-6">Writing & Editing</h3>
          </div>
          
          <div className="divide-y divide-white/10">
            <FeatureRow
              feature="Grounded Autocomplete"
              description="Suggestions based on your actual sources"
              raven={<YesBadge>Every suggestion tied to real data</YesBadge>}
              competitor={<NoBadge />}
              highlighted
            />
            
            <FeatureRow
              feature="AI Writing Help"
              description="Assistance drafting content"
              raven={<YesBadge>With inline citations and confidence</YesBadge>}
              competitor={<YesBadge>General writing, no source grounding</YesBadge>}
            />
            
            <FeatureRow
              feature="Confidence Scores"
              description="Know how certain the AI is"
              raven={<YesBadge>0-100% with reasoning chain</YesBadge>}
              competitor={<NoBadge />}
              highlighted
            />
          </div>
          
          {/* Section: Publishing & Sharing */}
          <div className="mt-12 mb-4">
            <h3 className="text-lg font-semibold text-white px-6">Publishing & Sharing</h3>
          </div>
          
          <div className="divide-y divide-white/10">
            <FeatureRow
              feature="Interactive Documents"
              description="Readers can ask questions about your content"
              raven={<YesBadge>Scoped AI Q&A for every shared doc</YesBadge>}
              competitor={<NoBadge />}
              highlighted
            />
            
            <FeatureRow
              feature="Reader Analytics"
              description="Know who read what and how they engaged"
              raven={<YesBadge>Views, time spent, questions asked</YesBadge>}
              competitor={<NoBadge />}
            />
            
            <FeatureRow
              feature="Public Sharing"
              description="Share documents externally"
              raven={<YesBadge />}
              competitor={<YesBadge />}
              highlighted
            />
          </div>
          
          {/* Section: Monitoring & Verification */}
          <div className="mt-12 mb-4">
            <h3 className="text-lg font-semibold text-white px-6">Monitoring & Verification</h3>
          </div>
          
          <div className="divide-y divide-white/10">
            <FeatureRow
              feature="Keyword & Topic Tracking"
              description="Monitor sources for changes that matter"
              raven={<YesBadge>Alerts when tracked items change</YesBadge>}
              competitor={<NoBadge />}
              highlighted
            />
            
            <FeatureRow
              feature="Continuous Verification"
              description="Documents that know when they're wrong"
              raven={<YesBadge>Automatic staleness detection</YesBadge>}
              competitor={<NoBadge />}
            />
            
            <FeatureRow
              feature="Audit Trails"
              description="Complete history of changes and queries"
              raven={<YesBadge>Every action logged</YesBadge>}
              competitor={<PartialBadge>Basic version history</PartialBadge>}
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
              description="Research → Write → Publish in one place"
              raven={<YesBadge>Complete platform</YesBadge>}
              competitor={<PartialBadge>Writing and wiki only</PartialBadge>}
              highlighted
            />
            
            <FeatureRow
              feature="No Model Training"
              description="Your data never trains AI"
              raven={<YesBadge>Guaranteed—not a toggle</YesBadge>}
              competitor={<PartialBadge>Opt-out available</PartialBadge>}
            />
            
            <FeatureRow
              feature="Real-time Collaboration"
              description="Multiple users editing"
              raven={<YesBadge />}
              competitor={<YesBadge />}
              highlighted
            />
          </div>
        </div>
      </section>

      {/* The Real Difference */}
      <section className="border-b border-white/10">
        <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
          <h2 className="text-3xl font-semibold mb-8">
            Different tools for different jobs
          </h2>
          
          <div className="space-y-6 text-lg text-white/60 leading-relaxed">
            <p>
              Notion is built for internal collaboration. Team wikis, project tracking, shared knowledge bases. It does those things well, and its AI helps with everyday writing tasks.
            </p>
            
            <p>
              Raven is built for external deliverables. The investment memo going to the IC. The legal brief going to court. The client deck going to the steering committee. Work where someone's going to ask "where did this come from?"
            </p>
            
            <p className="text-white font-medium">
              The difference isn't features—it's what the tool assumes about your work.
            </p>
            
            <p>
              Notion assumes you're organizing information for your team. Raven assumes you're building documents that need to survive scrutiny. That assumption shapes everything: how research works, how writing works, how sharing works.
            </p>
            
            <p>
              If you need a collaborative wiki, use Notion. If you need documents you can defend—with sources you can trace, readers you can track, and content that stays current—that's what Raven is for.
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