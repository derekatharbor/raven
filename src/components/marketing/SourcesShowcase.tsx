'use client'

// src/components/marketing/SourcesShowcase.tsx
// Marketing section showing all integrations - minimal grid tabs, Brandfetch logos

import { useState } from 'react'

// Brandfetch logo URL helper (consistent with platform)
const getBrandfetchLogo = (domain: string) =>
  `https://cdn.brandfetch.io/${domain}?c=1id1Fyz-h7an5-5KR_y`

interface Source {
  id: string
  name: string
  category: 'cloud' | 'financial' | 'research' | 'collaboration'
  domain: string
  status: 'available' | 'coming-soon' | 'enterprise'
}

const SOURCES: Source[] = [
  // Cloud Storage - OAuth
  { id: 'google-drive', name: 'Google Drive', category: 'cloud', domain: 'google.com', status: 'available' },
  { id: 'onedrive', name: 'OneDrive', category: 'cloud', domain: 'microsoft.com', status: 'coming-soon' },
  { id: 'dropbox', name: 'Dropbox', category: 'cloud', domain: 'dropbox.com', status: 'coming-soon' },
  { id: 'box', name: 'Box', category: 'cloud', domain: 'box.com', status: 'coming-soon' },
  
  // Collaboration - OAuth
  { id: 'notion', name: 'Notion', category: 'collaboration', domain: 'notion.so', status: 'coming-soon' },
  { id: 'confluence', name: 'Confluence', category: 'collaboration', domain: 'atlassian.com', status: 'coming-soon' },
  { id: 'slack', name: 'Slack', category: 'collaboration', domain: 'slack.com', status: 'coming-soon' },
  { id: 'gmail', name: 'Gmail', category: 'collaboration', domain: 'gmail.com', status: 'coming-soon' },
  
  // Financial Data
  { id: 'sec-edgar', name: 'SEC EDGAR', category: 'financial', domain: 'sec.gov', status: 'available' },
  { id: 'pitchbook', name: 'PitchBook', category: 'financial', domain: 'pitchbook.com', status: 'enterprise' },
  { id: 'bloomberg', name: 'Bloomberg', category: 'financial', domain: 'bloomberg.com', status: 'enterprise' },
  { id: 'capitaliq', name: 'Capital IQ', category: 'financial', domain: 'spglobal.com', status: 'enterprise' },
  { id: 'refinitiv', name: 'Refinitiv', category: 'financial', domain: 'refinitiv.com', status: 'enterprise' },
  { id: 'factset', name: 'FactSet', category: 'financial', domain: 'factset.com', status: 'enterprise' },
  
  // Research - Public APIs
  { id: 'arxiv', name: 'arXiv', category: 'research', domain: 'arxiv.org', status: 'coming-soon' },
  { id: 'pubmed', name: 'PubMed', category: 'research', domain: 'nih.gov', status: 'coming-soon' },
  { id: 'patents', name: 'USPTO', category: 'research', domain: 'uspto.gov', status: 'coming-soon' },
  { id: 'federal-register', name: 'Federal Register', category: 'research', domain: 'archives.gov', status: 'coming-soon' },
]

const CATEGORIES = [
  { id: 'all', label: 'ALL SOURCES' },
  { id: 'cloud', label: 'CLOUD STORAGE' },
  { id: 'financial', label: 'FINANCIAL DATA' },
  { id: 'research', label: 'RESEARCH' },
  { id: 'collaboration', label: 'COLLABORATION' },
]

export default function SourcesShowcase() {
  const [activeCategory, setActiveCategory] = useState('all')
  
  const filteredSources = activeCategory === 'all' 
    ? SOURCES 
    : SOURCES.filter(s => s.category === activeCategory)

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">
            Connect your sources
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Bring all your research into one place. Connect cloud storage, financial data, 
            and research databases—your AI assistant searches them all.
          </p>
        </div>

        {/* Category Tabs Row - separated, no icons, all caps */}
        <div className="flex border border-gray-200 mb-6">
          {CATEGORIES.map((cat, idx) => {
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-1 py-3 text-xs font-medium tracking-wider transition-colors cursor-pointer ${
                  idx > 0 ? 'border-l border-gray-200' : ''
                } ${
                  isActive 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Sources Grid - separated cards with gaps */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredSources.map((source) => (
            <div
              key={source.id}
              className="group relative p-5 flex flex-col items-center border border-gray-200 rounded-sm transition-colors hover:bg-gray-50 cursor-pointer"
            >
              {/* Status Badge */}
              {source.status !== 'available' && (
                <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded-sm text-[9px] font-semibold uppercase tracking-wide ${
                  source.status === 'coming-soon' 
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-purple-50 text-purple-600'
                }`}>
                  {source.status === 'coming-soon' ? 'Soon' : 'Enterprise'}
                </div>
              )}
              
              {/* Logo - Brandfetch */}
              <div className="w-12 h-12 rounded-sm bg-gray-100 flex items-center justify-center overflow-hidden mb-3">
                <img
                  src={getBrandfetchLogo(source.domain)}
                  alt={source.name}
                  className="w-8 h-8 object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.parentElement!.innerHTML = `<span class="text-gray-400 font-semibold text-lg">${source.name[0]}</span>`
                  }}
                />
              </div>
              
              {/* Name */}
              <p className="text-sm text-gray-700 text-center font-medium">
                {source.name}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
          <span className="text-xs text-gray-400">
            {filteredSources.length} sources • {filteredSources.filter(s => s.status === 'available').length} available now
          </span>
          <a
            href="mailto:integrations@tryraven.io"
            className="text-xs text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            Request an integration →
          </a>
        </div>
      </div>
    </section>
  )
}
