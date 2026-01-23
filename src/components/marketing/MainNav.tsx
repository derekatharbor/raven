// Path: src/components/marketing/MainNav.tsx

'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import MobileMenu from './MobileMenu'

// Product dropdown items - muted pastel colors
const PRODUCT_ITEMS = [
  { id: 'search', color: '#7C9EB2', title: 'Search', href: '/features/search' },
  { id: 'create', color: '#8BAF9C', title: 'Create', href: '/features/create' },
  { id: 'track', color: '#C9A87C', title: 'Track', href: '/features/track' },
  { id: 'analyze', color: '#9B8EC4', title: 'Analyze', href: '/features/analyze' },
]

// Solutions dropdown items
const INDUSTRY_ITEMS = [
  { id: 'finance', color: '#7C9EB2', title: 'Finance', href: '/solutions/finance' },
  { id: 'legal', color: '#9B8EC4', title: 'Legal', href: '/solutions/legal' },
  { id: 'government', color: '#8BAF9C', title: 'Government', href: '/solutions/government' },
  { id: 'consulting', color: '#C9A87C', title: 'Consulting', href: '/solutions/consulting' },
]

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

      {/* Dropdown Panel - Black */}
      <div
        className={`absolute top-full left-0 mt-2 bg-black rounded-xl shadow-[0px_8px_30px_rgba(0,0,0,0.4)] border border-white/10 transition-all duration-150 overflow-hidden ${
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

function ProductDropdown() {
  return (
    <div className="py-2 px-2 min-w-[200px]">
      {PRODUCT_ITEMS.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-[14px] font-medium text-white/90">{item.title}</span>
        </Link>
      ))}
    </div>
  )
}

function SolutionsDropdown() {
  return (
    <div className="py-2 px-2 min-w-[200px]">
      <span className="block px-3 py-2 text-[11px] uppercase tracking-wider text-white/40 font-medium">
        For Industries
      </span>
      {INDUSTRY_ITEMS.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-[14px] font-medium text-white/90">{item.title}</span>
        </Link>
      ))}
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
              <ProductDropdown />
            </NavDropdown>

            <NavDropdown label="Solutions">
              <SolutionsDropdown />
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