// Path: src/components/marketing/StickyNav.tsx

'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import MobileMenu from './MobileMenu'

// Product dropdown - left items control right content
const PRODUCT_LEFT = [
  {
    id: 'search',
    color: '#3B82F6',
    title: 'Search',
    description: 'Find answers across any dataset',
  },
  {
    id: 'create',
    color: '#22C55E',
    title: 'Create',
    description: 'Write with intelligence built in',
  },
  {
    id: 'track',
    color: '#F97316',
    title: 'Track',
    description: 'Stay current without the noise',
  },
  {
    id: 'analyze',
    color: '#8B5CF6',
    title: 'Analyze',
    description: 'See how your work lands',
  },
]

const PRODUCT_RIGHT: Record<string, { title: string; description: string; href: string; isNew?: boolean }[]> = {
  search: [
    { title: 'Matrix Extraction', description: 'Structured answers from unstructured docs', href: '/features/search' },
    { title: 'SEC EDGAR', description: 'Instant access to public filings', href: '/features/search' },
  ],
  create: [
    { title: 'Smart Blocks', description: 'Tables, charts, and citations that stay linked', href: '/features/create' },
    { title: 'AI Autocomplete', description: 'Suggestions grounded in your sources', href: '/features/create' },
    { title: 'Multi-agent Research', description: 'Parallel research across angles', href: '/features/create', isNew: true },
  ],
  track: [
    { title: 'Topic Monitoring', description: 'Scheduled searches and alerts', href: '/features/track' },
    { title: 'Digest Summaries', description: 'Daily or weekly briefings', href: '/features/track' },
  ],
  analyze: [
    { title: 'Reader Analytics', description: 'Heatmaps and engagement tracking', href: '/features/analyze' },
    { title: 'Interactive Documents', description: 'AI Q&A for your readers', href: '/features/analyze', isNew: true },
  ],
}

// Solutions dropdown
const SOLUTIONS_LEFT = [
  {
    id: 'finance',
    color: '#3B82F6',
    title: 'Finance',
    description: 'Investment research and due diligence',
  },
  {
    id: 'consulting',
    color: '#F97316',
    title: 'Consulting',
    description: 'Client deliverables and research',
  },
  {
    id: 'government',
    color: '#22C55E',
    title: 'Government',
    description: 'Intelligence analysis',
  },
  {
    id: 'legal',
    color: '#8B5CF6',
    title: 'Legal',
    description: 'Document review and case research',
  },
]

const SOLUTIONS_RIGHT: Record<string, { title: string; description: string; href: string; isNew?: boolean }[]> = {
  finance: [
    { title: 'Investment Memos', description: 'From data room to deliverable', href: '/solutions/finance' },
    { title: 'Earnings Analysis', description: 'Track filings and transcripts', href: '/solutions/finance' },
  ],
  consulting: [
    { title: 'Market Research', description: 'Comprehensive industry analysis', href: '/solutions/consulting' },
    { title: 'Client Reports', description: 'Professional deliverables fast', href: '/solutions/consulting' },
  ],
  government: [
    { title: 'Intel Briefs', description: 'Synthesis across classified and open sources', href: '/solutions/government' },
    { title: 'Threat Monitoring', description: 'Track topics and entities', href: '/solutions/government' },
  ],
  legal: [
    { title: 'Case Research', description: 'Search precedents and filings', href: '/solutions/legal' },
    { title: 'Contract Review', description: 'Extract key terms at scale', href: '/solutions/legal' },
  ],
}

interface DropdownProps {
  items: typeof PRODUCT_LEFT
  rightContent: typeof PRODUCT_RIGHT
  defaultActive: string
}

function DropdownContent({ items, rightContent, defaultActive }: DropdownProps) {
  const [activeItem, setActiveItem] = useState(defaultActive)

  return (
    <div className="flex">
      {/* Left Column */}
      <div className="w-[240px] py-3 px-2">
        {items.map((item) => (
          <div
            key={item.id}
            onMouseEnter={() => setActiveItem(item.id)}
            className={`group flex items-start gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
              activeItem === item.id ? 'bg-neutral-100' : 'hover:bg-neutral-100'
            }`}
          >
            <div
              className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-semibold text-black">
                  {item.title}
                </span>
                <svg
                  className={`w-3 h-3 transition-all ${
                    activeItem === item.id ? 'text-black/50 translate-x-0.5' : 'text-black/30'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px bg-neutral-200 my-3" />

      {/* Right Column */}
      <div className="w-[240px] py-3 pl-2">
        {rightContent[activeItem]?.map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            className="block px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <span className="text-[12px] font-semibold text-black flex items-center gap-2">
              {item.title}
              {item.isNew && (
                <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-emerald-500 text-white rounded uppercase">
                  New
                </span>
              )}
            </span>
            <p className="text-[10px] text-neutral-500 mt-0.5">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}

interface NavDropdownProps {
  label: string
  children: React.ReactNode
}

function NavDropdown({ label, children }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150)
  }

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={`flex items-center gap-1 px-2 py-1.5 text-[13px] font-medium transition-colors rounded ${
          isOpen ? 'text-white bg-white/10' : 'text-white/80 hover:text-white hover:bg-white/10'
        }`}
      >
        {label}
        <svg
          className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Panel */}
      <div
        className={`absolute top-full left-0 mt-3 bg-white rounded-xl shadow-[0px_8px_30px_rgba(0,0,0,0.3)] border border-black/5 transition-all duration-150 overflow-hidden ${
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        {children}
      </div>
    </div>
  )
}

export default function StickyNav() {
  const [isVisible, setIsVisible] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <div
        className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
        style={{ top: 'calc(16px + env(safe-area-inset-top, 0px))' }}
      >
        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center justify-between w-[720px] h-14 px-5 rounded-xl backdrop-blur-md bg-[#111111]/80 shadow-[0px_4px_20px_rgba(0,0,0,0.5)] border border-white/10">
          {/* Left: Logo + Nav Links */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center mr-3">
              <img
                src="/images/raven-logo-white.png"
                alt="Raven"
                className="h-5 w-auto"
              />
            </Link>

            {/* Nav Dropdowns */}
            <NavDropdown label="Product">
              <DropdownContent 
                items={PRODUCT_LEFT} 
                rightContent={PRODUCT_RIGHT} 
                defaultActive="search"
              />
            </NavDropdown>

            <NavDropdown label="Solutions">
              <DropdownContent 
                items={SOLUTIONS_LEFT} 
                rightContent={SOLUTIONS_RIGHT} 
                defaultActive="finance" 
              />
            </NavDropdown>

            <Link
              href="/pricing"
              className="px-2 py-1.5 text-[13px] font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors rounded"
            >
              Pricing
            </Link>
          </div>

          {/* Right: Buttons */}
          <div className="flex items-center gap-2">
            <Link 
              href="/login"
              className="h-9 px-5 rounded-md border border-white/20 text-[13px] font-medium text-white hover:bg-white/10 transition-colors flex items-center"
            >
              Log in
            </Link>
            <Link 
              href="/signup"
              className="h-9 px-5 rounded-md bg-white text-black text-[13px] font-medium hover:bg-gray-200 transition-colors flex items-center"
            >
              Get started
            </Link>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="lg:hidden flex items-center justify-between w-[calc(100vw-32px)] max-w-[400px] h-12 px-4 rounded-xl backdrop-blur-md bg-[#111111]/80 shadow-[0px_4px_20px_rgba(0,0,0,0.5)] border border-white/10">
          <Link href="/" className="flex items-center">
            <img
              src="/images/raven-logo-white.png"
              alt="Raven"
              className="h-5 w-auto"
            />
          </Link>

          <div className="flex items-center gap-2">
            <Link 
              href="/signup"
              className="h-8 px-4 rounded-md bg-white text-black text-[12px] font-medium hover:bg-gray-200 transition-colors flex items-center"
            >
              Get started
            </Link>
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />
    </>
  )
}
