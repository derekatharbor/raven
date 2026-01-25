// Path: src/components/marketing/MainNav.tsx

'use client'

import { useState, useRef } from 'react'
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
        className={`flex items-center gap-1.5 px-3 py-2 text-[14px] font-medium transition-colors rounded cursor-pointer ${
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
        className={`absolute top-full left-0 mt-2 z-50 bg-[#0a0a0a] rounded-xl shadow-[0px_8px_30px_rgba(0,0,0,0.5)] border border-white/10 transition-all duration-150 overflow-hidden ${
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
    <div className="w-[420px]">
      {/* 2x2 Grid of Core Features */}
      <div className="grid grid-cols-2 p-4 gap-1">
        <Link href="/features/search" className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#7C9EB2]" />
          <div>
            <span className="text-[14px] font-semibold text-white">Search</span>
            <p className="text-[13px] text-white/50 mt-0.5">Matrix extraction across any dataset</p>
          </div>
        </Link>
        
        <Link href="/features/create" className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#8BAF9C]" />
          <div>
            <span className="text-[14px] font-semibold text-white">Create</span>
            <p className="text-[13px] text-white/50 mt-0.5">AI-guided editor with Smart Blocks</p>
          </div>
        </Link>
        
        <Link href="/features/track" className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#C9A87C]" />
          <div>
            <span className="text-[14px] font-semibold text-white">Track</span>
            <p className="text-[13px] text-white/50 mt-0.5">Topic monitoring and alerts</p>
          </div>
        </Link>
        
        <Link href="/features/analyze" className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#9B8EC4]" />
          <div>
            <span className="text-[14px] font-semibold text-white">Analyze</span>
            <p className="text-[13px] text-white/50 mt-0.5">Reader analytics and engagement</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

function SolutionsDropdown() {
  return (
    <div className="w-[420px]">
      {/* 2x2 Grid of Industries */}
      <div className="grid grid-cols-2 p-4 gap-1">
        <Link href="/solutions/finance" className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#7C9EB2]" />
          <div>
            <span className="text-[14px] font-semibold text-white">Finance</span>
            <p className="text-[13px] text-white/50 mt-0.5">Investment research & due diligence</p>
          </div>
        </Link>
        
        <Link href="/solutions/consulting" className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#C9A87C]" />
          <div>
            <span className="text-[14px] font-semibold text-white">Consulting</span>
            <p className="text-[13px] text-white/50 mt-0.5">Client deliverables & research</p>
          </div>
        </Link>
        
        <Link href="/solutions/government" className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#8BAF9C]" />
          <div>
            <span className="text-[14px] font-semibold text-white">Government</span>
            <p className="text-[13px] text-white/50 mt-0.5">Intelligence analysis & briefs</p>
          </div>
        </Link>
        
        <Link href="/solutions/legal" className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#9B8EC4]" />
          <div>
            <span className="text-[14px] font-semibold text-white">Legal</span>
            <p className="text-[13px] text-white/50 mt-0.5">Document review & case research</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

function CompanyDropdown() {
  return (
    <div className="w-[520px]">
      <div className="grid grid-cols-2">
        {/* Left column - Company */}
        <div className="p-4 space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-white/40 px-3 mb-2 block">Company</span>
          <Link href="/about" className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
            <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#7C9EB2]" />
            <div>
              <span className="text-[14px] font-semibold text-white">About</span>
              <p className="text-[13px] text-white/50 mt-0.5">Our story and approach</p>
            </div>
          </Link>
          
          <Link href="/manifesto" className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
            <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#8BAF9C]" />
            <div>
              <span className="text-[14px] font-semibold text-white">Manifesto</span>
              <p className="text-[13px] text-white/50 mt-0.5">Where documents should be</p>
            </div>
          </Link>
          
          <Link href="/security" className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
            <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#C9A87C]" />
            <div>
              <span className="text-[14px] font-semibold text-white">Security</span>
              <p className="text-[13px] text-white/50 mt-0.5">How we protect your data</p>
            </div>
          </Link>
        </div>
        
        {/* Right column - Compare */}
        <div className="p-4 space-y-1 border-l border-white/10">
          <span className="text-[11px] uppercase tracking-wider text-white/40 px-3 mb-2 block">Compare</span>
          <Link href="/compare/notion" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
            <img src="https://cdn.brandfetch.io/notion.so/w/32/h/32" alt="Notion" className="w-5 h-5 rounded" />
            <span className="text-[14px] font-medium text-white">Raven vs Notion</span>
          </Link>
          
          <Link href="/compare/google-docs" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
            <img src="https://cdn.brandfetch.io/idCQPygB73/w/32/h/32" alt="Google Docs" className="w-5 h-5 rounded" />
            <span className="text-[14px] font-medium text-white">Raven vs Google Docs</span>
          </Link>
          
          <Link href="/compare/microsoft-word" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
            <img src="https://cdn.brandfetch.io/idchmboHEZ/w/32/h/32" alt="Microsoft" className="w-5 h-5 rounded" />
            <span className="text-[14px] font-medium text-white">Raven vs Word</span>
          </Link>
          
          <Link href="/compare/hebbia" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
            <img src="https://cdn.brandfetch.io/idjYOMaBaJ/w/32/h/32" alt="Hebbia" className="w-5 h-5 rounded" />
            <span className="text-[14px] font-medium text-white">Raven vs Hebbia</span>
          </Link>
          
          <Link href="/compare/grammarly" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
            <img src="https://cdn.brandfetch.io/idZAyF9rlg/w/32/h/32" alt="Grammarly" className="w-5 h-5 rounded" />
            <span className="text-[14px] font-medium text-white">Raven vs Grammarly</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function MainNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <nav className="relative z-40 flex items-center justify-between px-5 md:px-6 lg:px-14 py-4 lg:py-6">
        {/* Left: Logo + Nav Links */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center mr-4 cursor-pointer">
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

            <NavDropdown label="Company">
              <CompanyDropdown />
            </NavDropdown>

            <Link
              href="/pricing"
              className="px-3 py-2 text-[14px] font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors rounded cursor-pointer"
            >
              Pricing
            </Link>
          </div>
        </div>

        {/* Right: Desktop Buttons */}
        <div className="hidden lg:flex items-center gap-2.5">
          <Link 
            href="/login"
            className="h-10 px-5 rounded-lg border border-white/20 text-[14px] font-medium text-white hover:bg-white/5 transition-colors flex items-center cursor-pointer"
          >
            Log in
          </Link>
          <Link 
            href="/signup"
            className="h-10 px-5 rounded-lg bg-white text-black text-[14px] font-medium hover:bg-gray-100 transition-colors flex items-center cursor-pointer"
          >
            Get started
          </Link>
        </div>

        {/* Mobile: Hamburger Menu */}
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 -mr-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
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