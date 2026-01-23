// Path: src/components/marketing/MobileMenu.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X, ChevronDown } from 'lucide-react'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

const PRODUCT_ITEMS = [
  { title: 'Search', href: '/features/search' },
  { title: 'Create', href: '/features/create' },
  { title: 'Track', href: '/features/track' },
  { title: 'Analyze', href: '/features/analyze' },
]

const INDUSTRY_ITEMS = [
  { title: 'Finance', href: '/solutions/finance' },
  { title: 'Legal', href: '/solutions/legal' },
  { title: 'Government', href: '/solutions/government' },
  { title: 'Consulting', href: '/solutions/consulting' },
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
        className={`fixed top-0 right-0 bottom-0 w-[300px] bg-black z-50 transition-transform duration-300 flex flex-col ${
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
              <div className="ml-3 mt-1 space-y-1">
                {PRODUCT_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className="block px-3 py-2.5 rounded-lg text-[14px] text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {item.title}
                  </Link>
                ))}
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
              <div className="ml-3 mt-1">
                <span className="block px-3 py-2 text-[11px] uppercase tracking-wider text-white/40 font-medium">
                  For Industries
                </span>
                <div className="space-y-1">
                  {INDUSTRY_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className="block px-3 py-2.5 rounded-lg text-[14px] text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {item.title}
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
            className="block px-3 py-3 text-[15px] font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            Pricing
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