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

const INDUSTRIES = [
  { title: 'Finance', description: 'Investment research & diligence', href: '/solutions/finance', color: '#7C9EB2' },
  { title: 'Consulting', description: 'Client deliverables & research', href: '/solutions/consulting', color: '#C9A87C' },
  { title: 'Government', description: 'Intelligence analysis & briefs', href: '/solutions/government', color: '#8BAF9C' },
  { title: 'Legal', description: 'Document review & case research', href: '/solutions/legal', color: '#9B8EC4' },
]

const COMPANY = [
  { title: 'About', description: 'Our story and approach', href: '/about', color: '#7C9EB2' },
  { title: 'Manifesto', description: 'Where documents should be', href: '/manifesto', color: '#8BAF9C' },
  { title: 'Security', description: 'How we protect your data', href: '/security', color: '#C9A87C' },
]

const COMPARE = [
  { title: 'Raven vs Notion', href: '/compare/notion', logo: 'https://cdn.brandfetch.io/notion.so/w/32/h/32' },
  { title: 'Raven vs Google Docs', href: '/compare/google-docs', logo: 'https://cdn.brandfetch.io/google.com/w/32/h/32' },
  { title: 'Raven vs Word', href: '/compare/microsoft-word', logo: 'https://cdn.brandfetch.io/microsoft.com/w/32/h/32' },
  { title: 'Raven vs Hebbia', href: '/compare/hebbia', logo: 'https://cdn.brandfetch.io/hebbia.ai/w/32/h/32' },
]

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [productOpen, setProductOpen] = useState(false)
  const [solutionsOpen, setSolutionsOpen] = useState(false)
  const [companyOpen, setCompanyOpen] = useState(false)
  const [compareOpen, setCompareOpen] = useState(false)

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 cursor-pointer ${
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
            className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
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
              className="flex items-center justify-between w-full px-3 py-3 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              <span className="text-[15px] font-medium">Product</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${productOpen ? 'rotate-180' : ''}`} />
            </button>
            {productOpen && (
              <div className="mt-2 px-3 pb-3">
                <div className="space-y-2">
                  {PRODUCT_CORE.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className="flex items-start gap-2.5 py-1.5 cursor-pointer"
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
            )}
          </div>

          {/* Solutions Accordion */}
          <div>
            <button
              onClick={() => setSolutionsOpen(!solutionsOpen)}
              className="flex items-center justify-between w-full px-3 py-3 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              <span className="text-[15px] font-medium">Solutions</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${solutionsOpen ? 'rotate-180' : ''}`} />
            </button>
            {solutionsOpen && (
              <div className="mt-2 px-3 pb-3">
                <div className="space-y-2">
                  {INDUSTRIES.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className="flex items-start gap-2.5 py-1.5 cursor-pointer"
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
            )}
          </div>

          {/* Company Accordion */}
          <div>
            <button
              onClick={() => setCompanyOpen(!companyOpen)}
              className="flex items-center justify-between w-full px-3 py-3 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              <span className="text-[15px] font-medium">Company</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${companyOpen ? 'rotate-180' : ''}`} />
            </button>
            {companyOpen && (
              <div className="mt-2 px-3 pb-3">
                <div className="space-y-2">
                  {COMPANY.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className="flex items-start gap-2.5 py-1.5 cursor-pointer"
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
            )}
          </div>

          {/* Compare Accordion */}
          <div>
            <button
              onClick={() => setCompareOpen(!compareOpen)}
              className="flex items-center justify-between w-full px-3 py-3 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              <span className="text-[15px] font-medium">Compare</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${compareOpen ? 'rotate-180' : ''}`} />
            </button>
            {compareOpen && (
              <div className="mt-2 px-3 pb-3">
                <div className="space-y-2">
                  {COMPARE.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center gap-2.5 py-1.5 cursor-pointer"
                    >
                      <img src={item.logo} alt="" className="w-5 h-5 rounded" />
                      <span className="text-[14px] font-medium text-white">{item.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Simple Links */}
          <Link
            href="/pricing"
            onClick={onClose}
            className="block px-3 py-3 text-[15px] font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
          >
            Pricing
          </Link>
        </div>

        {/* Bottom Buttons - Fixed */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/login"
            onClick={onClose}
            className="block w-full py-2.5 text-center text-[14px] font-medium text-white border border-white/20 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            onClick={onClose}
            className="block w-full py-2.5 text-center text-[14px] font-medium bg-white text-black rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Get started
          </Link>
        </div>
      </div>
    </>
  )
}