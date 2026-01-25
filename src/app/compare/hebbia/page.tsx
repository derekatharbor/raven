// src/app/compare/hebbia/page.tsx

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

export default function CompareHebbiaPage() {
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
              src="https://cdn.brandfetch.io/idjYOMaBaJ/w/400/h/400/theme/dark/icon.png?c=1bfwsmEH20zzEfSNTed" 
              alt="Hebbia" 
              className="h-10"
            />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight mb-6">
            Looking for a Hebbia alternative?
          </h1>
          
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10">
            Hebbia extracts answers from documents. Raven extracts answers and turns them into deliverables you can defend.
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
            Hebbia is strong at extraction
          </h2>
          <div className="space-y-4 text-lg text-white/60 leading-relaxed">
            <p>
              Hebbia built a good product for analyzing document sets. Upload your files, ask questions, get a matrix of answers. For due diligence and document review, it speeds up the research phase.
            </p>
            <p>
              But what happens after extraction? You export to Excel. You copy into Word. You build your memo in a separate tool that has no connection to the analysis you just did. The research and the writing live in different worlds.
            </p>
            <p className="text-white font-medium">
              Hebbia helps you find answers. It doesn't help you turn those answers into documents that hold up.
            </p>
          </div>
        </div>
      </section>

      {/* What Raven Actually Does */}
      <section className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <h2 className="text-2xl md:text-3xl font-semibold mb-12 text-center">
            Research to deliverable—in one place
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 rounded-lg border border-white/10 bg-white/[0.02]">
              <h3 className="text-xl font-semibold mb-3">Same extraction power</h3>
              <p className="text-white/60">
                Multi-document analysis, matrix extraction, natural language queries across your entire document set. The research capabilities you need.
              </p>
            </div>
            
            <div className="p-8 rounded-lg border border-white/10 bg-white/[0.02]">
              <h3 className="text-xl font-semibold mb-3">Writing that stays connected</h3>
              <p className="text-white/60">
                Write your memo in the same platform. Autocomplete pulls from your research. Citations flow automatically. No copy-paste, no broken links.
              </p>
            </div>
            
            <div className="p-8 rounded-lg border border-white/10 bg-white/[0.02]">
              <h3 className="text-xl font-semibold mb-3">Documents readers can interrogate</h3>
              <p className="text-white/60">
                Share your deliverable and readers ask it questions. They drill into your sources, check your reasoning. The document defends itself.
              </p>
            </div>
            
            <div className="p-8 rounded-lg border border-white/10 bg-white/[0.02]">
              <h3 className="text-xl font-semibold mb-3">Know what happens after you send it</h3>
              <p className="text-white/60">
                Reader analytics show engagement. Who opened it, what they focused on, what questions they asked. Your work doesn't disappear into email.
              </p>
            </div>
            
            <div className="p-8 rounded-lg border border-white/10 bg-white/[0.02]">
              <h3 className="text-xl font-semibold mb-3">Continuous verification</h3>
              <p className="text-white/60">
                Track your sources. When something changes—new filing, updated report, breaking news—your document knows before you do.
              </p>
            </div>
            
            <div className="p-8 rounded-lg border border-white/10 bg-white/[0.02]">
              <h3 className="text-xl font-semibold mb-3">One workflow, not two</h3>
              <p className="text-white/60">
                Research, write, publish, monitor—all in one platform. No exporting to Excel, no rebuilding in Word, no losing the thread.
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
              <img src="https://cdn.brandfetch.io/idjYOMaBaJ/w/400/h/400/theme/dark/icon.png?c=1bfwsmEH20zzEfSNTed" alt="Hebbia" className="h-7" />
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
              competitor={<YesBadge>Core strength</YesBadge>}
              highlighted
            />
            
            <FeatureRow
              feature="Natural Language Search"
              description="Find information semantically"
              raven={<YesBadge>Across all sources</YesBadge>}
              competitor={<YesBadge>Strong semantic search</YesBadge>}
            />
            
            <FeatureRow
              feature="Source Citations"
              description="Know where answers came from"
              raven={<YesBadge>Automatic with snippets</YesBadge>}
              competitor={<YesBadge>With source links</YesBadge>}
              highlighted
            />
            
            <FeatureRow
              feature="Multi-Agent Research"
              description="Complex queries across sources"
              raven={<YesBadge>Orchestrated analysis</YesBadge>}
              competitor={<YesBadge>Matrix agent</YesBadge>}
            />
          </div>
          
          {/* Section: Document Creation */}
          <div className="mt-12 mb-4">
            <h3 className="text-lg font-semibold text-white px-6">Document Creation</h3>
          </div>
          
          <div className="divide-y divide-white/10">
            <FeatureRow
              feature="Native Document Editor"
              description="Write deliverables in-platform"
              raven={<YesBadge>Full editor with formatting</YesBadge>}
              competitor={<NoBadge />}
              highlighted
            />
            
            <FeatureRow
              feature="Grounded Autocomplete"
              description="Suggestions from your research"
              raven={<YesBadge>Connected to your sources</YesBadge>}
              competitor={<NoBadge />}
            />
            
            <FeatureRow
              feature="Inline Citations"
              description="Sources flow into writing"
              raven={<YesBadge>Automatic from research</YesBadge>}
              competitor={<NoBadge />}
              highlighted
            />
            
            <FeatureRow
              feature="Confidence Scores"
              description="Know certainty of claims"
              raven={<YesBadge>With reasoning chain</YesBadge>}
              competitor={<PartialBadge>On extractions only</PartialBadge>}
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
              description="Track engagement"
              raven={<YesBadge>Views, focus, questions</YesBadge>}
              competitor={<NoBadge />}
            />
            
            <FeatureRow
              feature="Shareable Deliverables"
              description="Send final documents"
              raven={<YesBadge>Native sharing</YesBadge>}
              competitor={<PartialBadge>Export to other tools</PartialBadge>}
              highlighted
            />
          </div>
          
          {/* Section: Monitoring */}
          <div className="mt-12 mb-4">
            <h3 className="text-lg font-semibold text-white px-6">Monitoring & Verification</h3>
          </div>
          
          <div className="divide-y divide-white/10">
            <FeatureRow
              feature="Source Monitoring"
              description="Track changes to underlying data"
              raven={<YesBadge>Alerts on changes</YesBadge>}
              competitor={<NoBadge />}
              highlighted
            />
            
            <FeatureRow
              feature="Document Staleness"
              description="Know when content is outdated"
              raven={<YesBadge>Automatic detection</YesBadge>}
              competitor={<NoBadge />}
            />
            
            <FeatureRow
              feature="Audit Trail"
              description="Complete history"
              raven={<YesBadge>Every action logged</YesBadge>}
              competitor={<PartialBadge>Query history</PartialBadge>}
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
              competitor={<PartialBadge>Research only</PartialBadge>}
              highlighted
            />
            
            <FeatureRow
              feature="No Model Training"
              description="Your data stays private"
              raven={<YesBadge>Guaranteed</YesBadge>}
              competitor={<YesBadge>Enterprise controls</YesBadge>}
            />
          </div>
        </div>
      </section>

      {/* The Real Difference */}
      <section className="border-b border-white/10">
        <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
          <h2 className="text-3xl font-semibold mb-8">
            Analysis vs. deliverables
          </h2>
          
          <div className="space-y-6 text-lg text-white/60 leading-relaxed">
            <p>
              Hebbia is a research tool. A good one. You upload documents, extract data, build a matrix of findings. For the analysis phase of due diligence or document review, it works well.
            </p>
            
            <p>
              But analysis isn't the deliverable. The IC memo is. The client deck is. The legal brief is. And those get built somewhere else—in Word, in Google Docs, in tools that have no connection to the research you just did.
            </p>
            
            <p className="text-white font-medium">
              Raven is end-to-end. Research flows into writing. Writing stays connected to sources. The deliverable you share can defend itself.
            </p>
            
            <p>
              If you just need extraction and you're fine building the actual document elsewhere, Hebbia works. If you want the whole workflow—research to finished deliverable to reader engagement—without losing the thread, that's what Raven is for.
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
            See what end-to-end document intelligence looks like.
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
