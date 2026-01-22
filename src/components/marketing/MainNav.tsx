// Path: src/components/marketing/MainNav.tsx

'use client'

import { useState, useRef } from 'react'
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

// Solutions dropdown - left items control right content
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
      <div className="w-[260px] py-3 px-2">
        {items.map((item) => (
          <div
            key={item.id}
            onMouseEnter={() => setActiveItem(item.id)}
            className={`group flex items-start gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
              activeItem === item.id ? 'bg-neutral-100' : 'hover:bg-neutral-100'
            }`}
          >
            <div
              className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-semibold text-black">
                  {item.title}
                </span>
                <svg
                  className={`w-3.5 h-3.5 transition-all ${
                    activeItem === item.id ? 'text-black/50 translate-x-0.5' : 'text-black/30'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <p className="text-[12px] text-neutral-500 mt-0.5">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px bg-neutral-200 my-3" />

      {/* Right Column - Dynamic based on hover */}
      <div className="w-[260px] py-3 pl-2">
        {rightContent[activeItem]?.map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            className="block px-4 py-2.5 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <span className="text-[13px] font-semibold text-black flex items-center gap-2">
              {item.title}
              {item.isNew && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500 text-white rounded uppercase">
                  New
                </span>
              )}
            </span>
            <p className="text-[11px] text-neutral-500 mt-0.5">
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
        className={`flex items-center gap-1.5 px-3 py-2 text-[14px] font-medium transition-colors rounded ${
          isOpen ? 'text-white bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/5'
        }`}
      >
        {label}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Panel */}
      <div
        className={`absolute top-full left-0 mt-2 bg-white rounded-xl shadow-[0px_8px_30px_rgba(0,0,0,0.2)] border border-black/5 transition-all duration-150 overflow-hidden ${
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

export default function MainNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <nav className="flex items-center justify-between px-5 md:px-6 lg:px-14 py-4 lg:py-6">
        {/* Left: Logo + Nav Links */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center mr-4">
            <img
              src="/images/nav-logo.png"
              alt="Raven"
              className="h-6 lg:h-7 w-auto"
            />
          </Link>

          {/* Desktop Nav Dropdowns */}
          <div className="hidden lg:flex items-center gap-1">
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
              className="px-3 py-2 text-[14px] font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors rounded"
            >
              Pricing
            </Link>
          </div>
        </div>

        {/* Right: Desktop Buttons */}
        <div className="hidden lg:flex items-center gap-2.5">
          <Link 
            href="/login"
            className="h-10 px-5 rounded-lg border border-white/20 text-[14px] font-medium text-white hover:bg-white/5 transition-colors flex items-center"
          >
            Log in
          </Link>
          <Link 
            href="/signup"
            className="h-10 px-5 rounded-lg bg-white text-black text-[14px] font-medium hover:bg-gray-100 transition-colors flex items-center"
          >
            Get started
          </Link>
        </div>

        {/* Mobile: Hamburger Menu */}
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 -mr-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />
    </>
  )
}
