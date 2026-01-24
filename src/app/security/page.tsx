// src/app/security/page.tsx

import Link from 'next/link'
import { ShieldCheck, Lock, Ban, KeyRound } from 'lucide-react'
import MainNav from '@/components/marketing/MainNav'
import StickyNav from '@/components/marketing/StickyNav'

export default function SecurityPage() {
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
              {/* IMAGE: /public/images/security/security-hero.png */}
              <img 
                src="/images/security/security-hero.png"
                alt="Security"
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
            
            {/* Right - Copy */}
            <div className="flex flex-col justify-center">
              <span className="text-xs uppercase tracking-widest text-white/40 mb-4 block">
                Security
              </span>
              <h1 className="text-4xl md:text-5xl font-semibold leading-[1.1] tracking-tight">
                Built for sensitive work.
              </h1>
              <p className="text-lg text-white/60 mt-6 leading-relaxed">
                Your data is yours. We don't train on it, we don't share it, and we protect it with encryption at every layer.
              </p>
            </div>
          </div>
        </div>

        {/* Horizontal line */}
        <div className="w-full h-px bg-white/10" />
      </section>

      {/* Security Grid */}
      <section className="relative">
        <div className="max-w-7xl mx-auto relative">
          {/* Left vertical line */}
          <div className="absolute top-0 bottom-0 left-5 md:left-6 w-px bg-white/10" />
          {/* Right vertical line */}
          <div className="absolute top-0 bottom-0 right-5 md:right-6 w-px bg-white/10" />
          
          <div className="px-5 md:px-6">
            <div className="ml-5 md:ml-10 mr-5 md:mr-10">
              {/* 2x2 Security Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4">
                <div className="aspect-[4/3] flex flex-col items-center justify-center p-8 bg-black border border-white/10">
                  <ShieldCheck className="w-12 h-12 text-white/80 mb-4" strokeWidth={1} />
                  <span className="text-base font-semibold text-white">GDPR Compliant</span>
                </div>
                <div className="aspect-[4/3] flex flex-col items-center justify-center p-8 bg-black border border-white/10 border-l-0">
                  <Ban className="w-12 h-12 text-white/80 mb-4" strokeWidth={1} />
                  <span className="text-base font-semibold text-white">No model training</span>
                </div>
                <div className="aspect-[4/3] flex flex-col items-center justify-center p-8 bg-black border border-white/10 border-l-0 max-md:border-l max-md:border-t-0">
                  <Lock className="w-12 h-12 text-white/80 mb-4" strokeWidth={1} />
                  <span className="text-base font-semibold text-white text-center">Encrypted everywhere</span>
                </div>
                <div className="aspect-[4/3] flex flex-col items-center justify-center p-8 bg-black border border-white/10 border-l-0 max-md:border-t-0">
                  <KeyRound className="w-12 h-12 text-white/80 mb-4" strokeWidth={1} />
                  <span className="text-base font-semibold text-white">Enterprise SSO</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal line */}
        <div className="w-full h-px bg-white/10 mt-16" />
      </section>

      {/* Data Protection */}
      <section className="relative">
        <div className="max-w-7xl mx-auto relative">
          {/* Left vertical line */}
          <div className="absolute top-0 bottom-0 left-5 md:left-6 w-px bg-white/10" />
          {/* Right vertical line */}
          <div className="absolute top-0 bottom-0 right-5 md:right-6 w-px bg-white/10" />
          
          <div className="px-10 md:px-16 py-16 md:py-24">
            <div className="grid md:grid-cols-2 gap-12 md:gap-20">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold mb-6">
                  Your data never trains our models
                </h2>
                <div className="space-y-4 text-lg text-white/60 leading-relaxed">
                  <p>
                    Your documents, queries, and outputs are never used to train or improve AI models. Not ours, not anyone else's.
                  </p>
                  <p>
                    This isn't a toggle in settings. It's how we built the system from day one.
                  </p>
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold mb-6">
                  Encryption at every layer
                </h2>
                <div className="space-y-4 text-lg text-white/60 leading-relaxed">
                  <p>
                    TLS 1.3 in transit. AES-256 at rest. Your data is encrypted the moment it leaves your device and stays encrypted until you need it.
                  </p>
                  <p>
                    Database encryption, backup encryption, and secure key management through industry-standard HSMs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal line */}
        <div className="w-full h-px bg-white/10" />
      </section>

      {/* Access Control */}
      <section className="relative">
        <div className="max-w-7xl mx-auto relative">
          {/* Left vertical line */}
          <div className="absolute top-0 bottom-0 left-5 md:left-6 w-px bg-white/10" />
          {/* Right vertical line */}
          <div className="absolute top-0 bottom-0 right-5 md:right-6 w-px bg-white/10" />
          
          <div className="px-10 md:px-16 py-16 md:py-24">
            <div className="grid md:grid-cols-2 gap-12 md:gap-20">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold mb-6">
                  Enterprise access control
                </h2>
                <div className="space-y-4 text-lg text-white/60 leading-relaxed">
                  <p>
                    SAML 2.0 and OAuth 2.0 single sign-on. Your team authenticates through your existing identity provider.
                  </p>
                  <p>
                    Role-based access control, audit logs for every action, and configurable session policies.
                  </p>
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold mb-6">
                  Privacy by design
                </h2>
                <div className="space-y-4 text-lg text-white/60 leading-relaxed">
                  <p>
                    Built with GDPR principles from day one. Full data portability and deletion rights for all users.
                  </p>
                  <p>
                    Your data stays in your region. No surprises about where your documents live.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal line */}
        <div className="w-full h-px bg-white/10" />
      </section>

      {/* Infrastructure */}
      <section className="relative">
        <div className="max-w-7xl mx-auto relative">
          {/* Left vertical line */}
          <div className="absolute top-0 bottom-0 left-5 md:left-6 w-px bg-white/10" />
          {/* Right vertical line */}
          <div className="absolute top-0 bottom-0 right-5 md:right-6 w-px bg-white/10" />
          
          <div className="px-10 md:px-16 py-16 md:py-24">
            <h2 className="text-2xl md:text-3xl font-semibold mb-8">
              Infrastructure
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-3">Cloud hosting</h3>
                <p className="text-white/60 leading-relaxed">
                  Hosted on modern cloud infrastructure with data residency options for teams that need them.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Reliability</h3>
                <p className="text-white/60 leading-relaxed">
                  Redundant infrastructure with automated backups. Your work is safe even when things go wrong.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Flexible deployment</h3>
                <p className="text-white/60 leading-relaxed">
                  For organizations with strict data requirements, we can discuss private deployment options.
                </p>
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
            <h2 className="text-3xl md:text-4xl font-semibold mb-6">
              Questions about security?
            </h2>
            <p className="text-lg text-white/60 mb-8 max-w-xl mx-auto">
              Our team can walk you through our security practices and discuss your specific requirements.
            </p>
            <Link 
              href="/contact"
              className="inline-flex px-8 py-3.5 bg-white text-black text-sm font-medium rounded hover:bg-white/90 transition-colors cursor-pointer"
            >
              Contact Us
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
