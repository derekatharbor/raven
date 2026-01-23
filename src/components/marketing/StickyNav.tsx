// Path: src/components/marketing/StickyNav.tsx

'use client'

import { useState, useEffect, useRef } from 'react'
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

      {/* Dropdown Panel - Black */}
      <div
        className={`absolute top-full left-0 mt-3 bg-black rounded-xl shadow-[0px_8px_30px_rgba(0,0,0,0.4)] border border-white/10 transition-all duration-150 overflow-hidden ${
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
    <div className="py-2 px-2 min-w-[180px]">
      {PRODUCT_ITEMS.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-[13px] font-medium text-white/90">{item.title}</span>
        </Link>
      ))}
    </div>
  )
}

function SolutionsDropdown() {
  return (
    <div className="py-2 px-2 min-w-[180px]">
      <span className="block px-3 py-1.5 text-[10px] uppercase tracking-wider text-white/40 font-medium">
        For Industries
      </span>
      {INDUSTRY_ITEMS.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-[13px] font-medium text-white/90">{item.title}</span>
        </Link>
      ))}
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
              <ProductDropdown />
            </NavDropdown>

            <NavDropdown label="Solutions">
              <SolutionsDropdown />
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