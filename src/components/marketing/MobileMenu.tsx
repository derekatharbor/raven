// Path: src/components/marketing/MobileMenu.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X, ChevronDown } from 'lucide-react'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

const PRODUCT_CORE = [
  { title: 'Search', description: 'Matrix extraction across datasets', href: '/features/search', color: '#7C9EB2' },
  { title: 'Create', description: 'AI-guided editor with Smart Blocks', href: '/features/create', color: '#8BAF9C' },
  { title: 'Track', description: 'Topic monitoring and alerts', href: '/features/track', color: '#C9A87C' },
  { title: 'Analyze', description: 'Reader analytics and engagement', href: '/features/analyze', color: '#9B8EC4' },
]

const PRODUCT_MORE = [
  { title: 'Integrations', href: '/features/integrations' },
  { title: 'Security', href: '/features/security' },
  { title: 'Raven Links', href: '/features/raven-links' },
  { title: 'AI Models', href: '/features/ai' },
]

const INDUSTRIES = [
  { title: 'Finance', description: 'Investment research & diligence', href: '/solutions/finance', color: '#7C9EB2' },
  { title: 'Consulting', description: 'Client deliverables & research', href: '/solutions/consulting', color: '#C9A87C' },
  { title: 'Government', description: 'Intelligence analysis & briefs', href: '/solutions/government', color: '#8BAF9C' },
  { title: 'Legal', description: 'Document review & case research', href: '/solutions/legal', color: '#9B8EC4' },
]

const USE_CASES = [
  { title: 'Due Diligence', href: '/use-cases/due-diligence' },
  { title: 'Market Research', href: '/use-cases/market-research' },
  { title: 'Investment Memos', href: '/use-cases/investment-memos' },
  { title: 'Client Reports', href: '/use-cases/client-reports' },
]

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [productOpen, setProductOpen] = useState(false)
  const [solutionsOpen, setSolutionsOpen] = useState(false)

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Menu Panel - Full Height */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[320px] bg-black z-50 transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <img src="/images/nav-logo.png" alt="Raven" className="h-5 w-auto" />
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Links - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {/* Product Accordion */}
          <div>
            <button
              onClick={() => setProductOpen(!productOpen)}
              className="flex items-center justify-between w-full px-3 py-3 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <span className="text-[15px] font-medium">Product</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${productOpen ? 'rotate-180' : ''}`} />
            </button>
            {productOpen && (
              <div className="mt-2 space-y-4 px-3 pb-3">
                {/* Core Features */}
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-white/40 font-medium mb-2">
                    Core Features
                  </span>
                  <div className="space-y-2">
                    {PRODUCT_CORE.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className="flex items-start gap-2.5 py-1.5"
                      >
                        <div 
                          className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" 
                          style={{ backgroundColor: item.color }}
                        />
                        <div>
                          <span className="text-[14px] font-medium text-white">{item.title}</span>
                          <p className="text-[12px] text-white/50 mt-0.5">{item.description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
                
                {/* More */}
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-white/40 font-medium mb-2">
                    More
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {PRODUCT_MORE.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className="text-[13px] text-white/70 hover:text-white transition-colors py-1"
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Solutions Accordion */}
          <div>
            <button
              onClick={() => setSolutionsOpen(!solutionsOpen)}
              className="flex items-center justify-between w-full px-3 py-3 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <span className="text-[15px] font-medium">Solutions</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${solutionsOpen ? 'rotate-180' : ''}`} />
            </button>
            {solutionsOpen && (
              <div className="mt-2 space-y-4 px-3 pb-3">
                {/* Industries */}
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-white/40 font-medium mb-2">
                    Industries
                  </span>
                  <div className="space-y-2">
                    {INDUSTRIES.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className="flex items-start gap-2.5 py-1.5"
                      >
                        <div 
                          className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" 
                          style={{ backgroundColor: item.color }}
                        />
                        <div>
                          <span className="text-[14px] font-medium text-white">{item.title}</span>
                          <p className="text-[12px] text-white/50 mt-0.5">{item.description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
                
                {/* Use Cases */}
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-white/40 font-medium mb-2">
                    Use Cases
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {USE_CASES.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className="text-[13px] text-white/70 hover:text-white transition-colors py-1"
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Simple Links */}
          <Link
            href="/pricing"
            onClick={onClose}
            className="block px-3 py-3 text-[15px] font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            Pricing
          </Link>
          
          <Link
            href="/docs"
            onClick={onClose}
            className="block px-3 py-3 text-[15px] font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            Docs
          </Link>
          
          <Link
            href="/changelog"
            onClick={onClose}
            className="block px-3 py-3 text-[15px] font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            Changelog
          </Link>
        </div>

        {/* Bottom Buttons - Fixed */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/login"
            onClick={onClose}
            className="block w-full py-2.5 text-center text-[14px] font-medium text-white border border-white/20 rounded-lg hover:bg-white/5 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            onClick={onClose}
            className="block w-full py-2.5 text-center text-[14px] font-medium bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
          >
            Get started
          </Link>
        </div>
      </div>
    </>
  )
}