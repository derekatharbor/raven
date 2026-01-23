// Path: src/components/marketing/StickyNav.tsx

'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import MobileMenu from './MobileMenu'

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
        className={`flex items-center gap-1 px-2 py-1.5 text-[13px] font-medium transition-colors rounded cursor-pointer ${
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
        className={`absolute top-full left-0 mt-3 bg-[#0A0A0B] rounded-xl shadow-[0px_8px_30px_rgba(0,0,0,0.5)] border border-white/10 transition-all duration-150 overflow-hidden ${
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
    <div className="w-[380px]">
      {/* 2x2 Grid of Core Features */}
      <div className="grid grid-cols-2 p-4 gap-1">
        <Link href="/features/search" className="flex items-start gap-2.5 px-2 py-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#7C9EB2]" />
          <div>
            <span className="text-[13px] font-semibold text-white">Search</span>
            <p className="text-[12px] text-white/50 mt-0.5">Matrix extraction across datasets</p>
          </div>
        </Link>
        
        <Link href="/features/create" className="flex items-start gap-2.5 px-2 py-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#8BAF9C]" />
          <div>
            <span className="text-[13px] font-semibold text-white">Create</span>
            <p className="text-[12px] text-white/50 mt-0.5">AI-guided editor with Smart Blocks</p>
          </div>
        </Link>
        
        <Link href="/features/track" className="flex items-start gap-2.5 px-2 py-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#C9A87C]" />
          <div>
            <span className="text-[13px] font-semibold text-white">Track</span>
            <p className="text-[12px] text-white/50 mt-0.5">Topic monitoring and alerts</p>
          </div>
        </Link>
        
        <Link href="/features/analyze" className="flex items-start gap-2.5 px-2 py-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#9B8EC4]" />
          <div>
            <span className="text-[13px] font-semibold text-white">Analyze</span>
            <p className="text-[12px] text-white/50 mt-0.5">Reader analytics and engagement</p>
          </div>
        </Link>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border-t border-white/10">
        <span className="text-[12px] text-white/60">
          <span className="text-white/40">New:</span> Multi-agent research
        </span>
        <Link 
          href="/changelog" 
          className="text-[12px] font-medium text-[#7C9EB2] hover:text-[#9BB8CC] transition-colors cursor-pointer"
        >
          Changelog
        </Link>
      </div>
    </div>
  )
}

function SolutionsDropdown() {
  return (
    <div className="w-[380px]">
      {/* 2x2 Grid of Industries */}
      <div className="grid grid-cols-2 p-4 gap-1">
        <Link href="/solutions/finance" className="flex items-start gap-2.5 px-2 py-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#7C9EB2]" />
          <div>
            <span className="text-[13px] font-semibold text-white">Finance</span>
            <p className="text-[12px] text-white/50 mt-0.5">Investment research & diligence</p>
          </div>
        </Link>
        
        <Link href="/solutions/consulting" className="flex items-start gap-2.5 px-2 py-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#C9A87C]" />
          <div>
            <span className="text-[13px] font-semibold text-white">Consulting</span>
            <p className="text-[12px] text-white/50 mt-0.5">Client deliverables & research</p>
          </div>
        </Link>
        
        <Link href="/solutions/government" className="flex items-start gap-2.5 px-2 py-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#8BAF9C]" />
          <div>
            <span className="text-[13px] font-semibold text-white">Government</span>
            <p className="text-[12px] text-white/50 mt-0.5">Intelligence analysis & briefs</p>
          </div>
        </Link>
        
        <Link href="/solutions/legal" className="flex items-start gap-2.5 px-2 py-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#9B8EC4]" />
          <div>
            <span className="text-[13px] font-semibold text-white">Legal</span>
            <p className="text-[12px] text-white/50 mt-0.5">Document review & case research</p>
          </div>
        </Link>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border-t border-white/10">
        <span className="text-[12px] text-white/60">
          See how teams use Raven
        </span>
        <Link 
          href="/customers" 
          className="text-[12px] font-medium text-[#7C9EB2] hover:text-[#9BB8CC] transition-colors cursor-pointer"
        >
          Customer Stories
        </Link>
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
            <Link href="/" className="flex items-center mr-3 cursor-pointer">
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
              className="px-2 py-1.5 text-[13px] font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors rounded cursor-pointer"
            >
              Pricing
            </Link>

            <Link
              href="/docs"
              className="px-2 py-1.5 text-[13px] font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors rounded cursor-pointer"
            >
              Docs
            </Link>
          </div>

          {/* Right: Buttons */}
          <div className="flex items-center gap-2">
            <Link 
              href="/login"
              className="h-9 px-5 rounded-md border border-white/20 text-[13px] font-medium text-white hover:bg-white/10 transition-colors flex items-center cursor-pointer"
            >
              Log in
            </Link>
            <Link 
              href="/signup"
              className="h-9 px-5 rounded-md bg-white text-black text-[13px] font-medium hover:bg-gray-200 transition-colors flex items-center cursor-pointer"
            >
              Get started
            </Link>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="lg:hidden flex items-center justify-between w-[calc(100vw-32px)] max-w-[400px] h-12 px-4 rounded-xl backdrop-blur-md bg-[#111111]/80 shadow-[0px_4px_20px_rgba(0,0,0,0.5)] border border-white/10">
          <Link href="/" className="flex items-center cursor-pointer">
            <img
              src="/images/raven-logo-white.png"
              alt="Raven"
              className="h-5 w-auto"
            />
          </Link>

          <div className="flex items-center gap-2">
            <Link 
              href="/signup"
              className="h-8 px-4 rounded-md bg-white text-black text-[12px] font-medium hover:bg-gray-200 transition-colors flex items-center cursor-pointer"
            >
              Get started
            </Link>
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
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