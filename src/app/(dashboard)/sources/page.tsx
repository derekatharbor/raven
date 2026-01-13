// Route: src/app/(dashboard)/sources/page.tsx

'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Search, 
  Check, 
  X, 
  ChevronRight,
  ExternalLink,
  Zap,
  TrendingUp,
  Scale,
  Database,
  Sparkles,
  Bell,
  Key,
  Link2,
} from 'lucide-react'

// =============================================================================
// TYPES
// =============================================================================

interface Source {
  id: string
  name: string
  description: string
  domain: string
  connected: boolean
  free?: boolean
  autoEnabled?: boolean
  requiresKey?: boolean
  oauth?: boolean
  comingSoon?: boolean
  category: 'essentials' | 'market' | 'legal' | 'systems' | 'comingSoon'
  overview: string
  verifies: string[]
  useCases: string[]
}

interface SourcesData {
  essentials: Source[]
  market: Source[]
  legal: Source[]
  systems: Source[]
  comingSoon: Source[]
}

// =============================================================================
// SMALL SHIELD STATUS ICON
// =============================================================================

function ShieldStatus({ connected, size = 14 }: { connected: boolean; size?: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none"
      className="flex-shrink-0"
    >
      <path 
        d="M12 2L4 6v6c0 5.25 3.4 10.15 8 11.25 4.6-1.1 8-6 8-11.25V6l-8-4z" 
        fill={connected ? '#22c55e' : '#d1d5db'}
        stroke={connected ? '#22c55e' : '#d1d5db'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path 
        d="M9 12l2 2 4-4" 
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// =============================================================================
// CATEGORY METADATA
// =============================================================================

const categories = [
  { 
    id: 'essentials', 
    label: 'Public Data', 
    description: 'Free, auto-enabled government and public sources',
    icon: Zap,
  },
  { 
    id: 'market', 
    label: 'Market Intelligence', 
    description: 'Connect your existing subscriptions via API key',
    icon: TrendingUp,
  },
  { 
    id: 'legal', 
    label: 'Legal & Regulatory', 
    description: 'Case law, litigation analytics, and court records',
    icon: Scale,
  },
  { 
    id: 'systems', 
    label: 'Your Systems', 
    description: 'Connect via OAuth to verify against internal data',
    icon: Database,
  },
  { 
    id: 'comingSoon', 
    label: 'Coming Soon', 
    description: 'More integrations on the way',
    icon: Sparkles,
  },
]

// =============================================================================
// SOURCE DATA
// =============================================================================

const sourcesData: SourcesData = {
  essentials: [
    {
      id: 'sec-edgar',
      name: 'SEC EDGAR',
      description: 'Public company filings including 10-Ks, 10-Qs, 8-Ks, and proxy statements',
      domain: 'sec.gov',
      connected: true,
      free: true,
      autoEnabled: true,
      category: 'essentials',
      overview: 'The SEC EDGAR database provides free public access to corporate filings including 10-Ks, 10-Qs, 8-Ks, proxy statements, and more. Harbor continuously monitors these filings to verify claims about public companies.',
      verifies: ['Revenue figures', 'Executive compensation', 'Risk factors', 'Material events', 'Shareholder information'],
      useCases: ['Financial due diligence', 'Competitive analysis', 'Investment research', 'Regulatory compliance'],
    },
    {
      id: 'fda',
      name: 'FDA',
      description: 'Drug approvals, clinical trials, and medical device databases',
      domain: 'fda.gov',
      connected: true,
      free: true,
      autoEnabled: true,
      category: 'essentials',
      overview: 'The FDA provides public access to drug approval databases, medical device registrations, warning letters, and regulatory actions. Essential for healthcare and life sciences verification.',
      verifies: ['Drug approval status', 'Clinical trial phases', 'Warning letters', 'Device classifications', 'Regulatory actions'],
      useCases: ['Pharma due diligence', 'Medical device research', 'Regulatory compliance', 'Healthcare investment'],
    },
    {
      id: 'uspto',
      name: 'USPTO',
      description: 'Patent grants, applications, and intellectual property records',
      domain: 'uspto.gov',
      connected: true,
      free: true,
      autoEnabled: true,
      category: 'essentials',
      overview: 'The United States Patent and Trademark Office database contains all U.S. patents and patent applications. Harbor uses this to verify intellectual property claims and track competitive innovation.',
      verifies: ['Patent ownership', 'Filing dates', 'Claims scope', 'Prior art', 'Patent status'],
      useCases: ['IP due diligence', 'Competitive intelligence', 'Freedom to operate', 'Technology scouting'],
    },
    {
      id: 'bls',
      name: 'BLS',
      description: 'Labor statistics, employment data, and economic indicators',
      domain: 'bls.gov',
      connected: true,
      free: true,
      autoEnabled: true,
      category: 'essentials',
      overview: 'The Bureau of Labor Statistics provides authoritative data on employment, wages, inflation, productivity, and economic conditions across industries and regions.',
      verifies: ['Employment figures', 'Wage data', 'Industry statistics', 'Inflation rates', 'Productivity metrics'],
      useCases: ['Market sizing', 'Compensation benchmarking', 'Economic analysis', 'Industry research'],
    },
    {
      id: 'opencorporates',
      name: 'OpenCorporates',
      description: 'Global company registry data from 140+ jurisdictions',
      domain: 'opencorporates.com',
      connected: true,
      free: true,
      autoEnabled: true,
      category: 'essentials',
      overview: 'OpenCorporates is the largest open database of companies in the world, with data from over 140 jurisdictions. Harbor uses this to verify corporate structure and registration claims.',
      verifies: ['Company registration', 'Incorporation date', 'Registered address', 'Officer names', 'Company status'],
      useCases: ['KYC verification', 'Vendor due diligence', 'Corporate structure analysis', 'Entity verification'],
    },
    {
      id: 'clinicaltrials',
      name: 'ClinicalTrials.gov',
      description: 'Clinical study registrations and results database',
      domain: 'clinicaltrials.gov',
      connected: true,
      free: true,
      autoEnabled: true,
      category: 'essentials',
      overview: 'ClinicalTrials.gov is the NIH database of privately and publicly funded clinical studies. Essential for verifying claims about drug development pipelines and trial status.',
      verifies: ['Trial status', 'Phase information', 'Enrollment numbers', 'Study results', 'Sponsor information'],
      useCases: ['Biotech due diligence', 'Pipeline analysis', 'Competitive intelligence', 'Healthcare investment'],
    },
    {
      id: 'federal-register',
      name: 'Federal Register',
      description: 'Daily journal of the U.S. Government with rules and notices',
      domain: 'federalregister.gov',
      connected: true,
      free: true,
      autoEnabled: true,
      category: 'essentials',
      overview: 'The Federal Register is the official daily publication for rules, proposed rules, and notices of Federal agencies. Harbor monitors regulatory changes that could impact your business.',
      verifies: ['Regulatory requirements', 'Proposed rules', 'Agency notices', 'Executive orders'],
      useCases: ['Regulatory monitoring', 'Compliance tracking', 'Policy analysis', 'Government affairs'],
    },
    {
      id: 'web-search',
      name: 'Web Search',
      description: 'Real-time news, press releases, and web content monitoring',
      domain: 'google.com',
      connected: true,
      free: true,
      autoEnabled: true,
      category: 'essentials',
      overview: 'Harbor continuously monitors web content and news sources to verify claims and detect contradictions in real-time. This includes press releases, news articles, and company announcements.',
      verifies: ['News accuracy', 'Press releases', 'Company announcements', 'Executive statements', 'Market events'],
      useCases: ['Media monitoring', 'Reputation tracking', 'Event detection', 'Fact checking'],
    },
  ],
  market: [
    {
      id: 'alphasense',
      name: 'AlphaSense',
      description: 'AI-powered market intelligence and search platform',
      domain: 'alpha-sense.com',
      connected: false,
      requiresKey: true,
      category: 'market',
      overview: 'AlphaSense provides AI-powered search across financial documents, transcripts, news, and research. Connect your existing subscription to verify claims against expert calls and broker research.',
      verifies: ['Expert transcripts', 'Broker research', 'Earnings calls', 'News sentiment', 'Competitive mentions'],
      useCases: ['Investment research', 'Competitive intelligence', 'Expert network verification', 'Sentiment analysis'],
    },
    {
      id: 'crunchbase',
      name: 'Crunchbase',
      description: 'Startup and company data, funding rounds, and acquisitions',
      domain: 'crunchbase.com',
      connected: false,
      requiresKey: true,
      category: 'market',
      overview: 'Crunchbase provides data on startups, investments, and acquisitions. Track funding announcements, company growth, and market trends.',
      verifies: ['Funding history', 'Investor relationships', 'Acquisition data', 'Company growth', 'Leadership changes'],
      useCases: ['Startup research', 'Investment tracking', 'Competitive analysis', 'Market mapping'],
    },
    {
      id: 'pitchbook',
      name: 'PitchBook',
      description: 'Private market data, VC, PE, and M&A intelligence',
      domain: 'pitchbook.com',
      connected: false,
      requiresKey: true,
      category: 'market',
      overview: 'PitchBook provides comprehensive data on the private capital markets, including venture capital, private equity, and M&A transactions.',
      verifies: ['Funding rounds', 'Valuations', 'Investor details', 'Deal terms', 'Company profiles'],
      useCases: ['Deal sourcing', 'Competitive intelligence', 'Market sizing', 'LP reporting'],
    },
    {
      id: 'statista',
      name: 'Statista',
      description: 'Statistics, market data, and consumer insights',
      domain: 'statista.com',
      connected: false,
      requiresKey: true,
      category: 'market',
      overview: 'Statista aggregates statistics from over 22,500 sources, providing market data, consumer insights, and industry reports across hundreds of sectors.',
      verifies: ['Market statistics', 'Consumer data', 'Industry trends', 'Regional data', 'Forecasts'],
      useCases: ['Market research', 'Presentation data', 'Trend analysis', 'Benchmarking'],
    },
    {
      id: 'morningstar',
      name: 'Morningstar',
      description: 'Investment research, fund ratings, and portfolio tools',
      domain: 'morningstar.com',
      connected: false,
      requiresKey: true,
      category: 'market',
      overview: 'Morningstar provides independent investment research including fund ratings, analyst reports, and portfolio analysis tools. Many advisory firms have existing licenses.',
      verifies: ['Fund ratings', 'Expense ratios', 'Holdings data', 'Performance metrics', 'Risk scores'],
      useCases: ['Fund selection', 'Portfolio construction', 'Client reporting', 'Due diligence'],
    },
    {
      id: 'factset',
      name: 'FactSet',
      description: 'Financial data and analytics for investment professionals',
      domain: 'factset.com',
      connected: false,
      requiresKey: true,
      category: 'market',
      overview: 'FactSet delivers integrated financial information and analytical applications. Your firm may already have a FactSet license. Connect to verify financial data at scale.',
      verifies: ['Company financials', 'Estimates', 'Ownership data', 'Supply chain', 'Geographic revenue'],
      useCases: ['Equity research', 'Portfolio analytics', 'Risk management', 'M&A analysis'],
    },
    {
      id: 'sp-capital-iq',
      name: 'S&P Capital IQ',
      description: 'Financial intelligence and analytics platform',
      domain: 'spglobal.com',
      connected: false,
      requiresKey: true,
      category: 'market',
      overview: 'S&P Capital IQ provides financial data, analytics, and research on public and private companies, with deep coverage of financials, transactions, and credit ratings.',
      verifies: ['Credit ratings', 'Financial statements', 'Transaction data', 'Ownership', 'Debt profiles'],
      useCases: ['Credit analysis', 'Financial modeling', 'Transaction research', 'Risk assessment'],
    },
    {
      id: 'gartner',
      name: 'Gartner',
      description: 'Technology research, market analysis, and Magic Quadrants',
      domain: 'gartner.com',
      connected: false,
      requiresKey: true,
      category: 'market',
      overview: 'Gartner provides technology research, market analysis, and advisory services. Verify claims about vendor positioning, market forecasts, and technology trends.',
      verifies: ['Magic Quadrant positions', 'Market forecasts', 'Vendor assessments', 'Technology trends', 'Hype cycles'],
      useCases: ['Vendor selection', 'Technology strategy', 'Market positioning', 'Competitive analysis'],
    },
    {
      id: 'ibisworld',
      name: 'IBISWorld',
      description: 'Industry research reports and market analysis',
      domain: 'ibisworld.com',
      connected: false,
      requiresKey: true,
      category: 'market',
      overview: 'IBISWorld provides comprehensive industry research reports covering market size, growth trends, competitive landscape, and key success factors for thousands of industries.',
      verifies: ['Industry size', 'Growth rates', 'Market share', 'Industry structure', 'Key success factors'],
      useCases: ['Industry analysis', 'Business planning', 'Market entry strategy', 'Competitive positioning'],
    },
    {
      id: 'newsapi',
      name: 'News API',
      description: 'Global news aggregation from 80,000+ sources',
      domain: 'newsapi.org',
      connected: false,
      requiresKey: true,
      category: 'market',
      overview: 'News API provides access to headlines and articles from news sources and blogs across the web in real-time.',
      verifies: ['Breaking news', 'Press coverage', 'Media mentions', 'Sentiment'],
      useCases: ['Media monitoring', 'Reputation tracking', 'Event detection', 'Trend analysis'],
    },
  ],
  legal: [
    {
      id: 'lexisnexis',
      name: 'LexisNexis',
      description: 'Case law, statutes, regulations, and legal analytics',
      domain: 'lexisnexis.com',
      connected: false,
      requiresKey: true,
      category: 'legal',
      overview: 'LexisNexis provides comprehensive legal research including case law, statutes, regulations, and legal news from jurisdictions worldwide. Connect your existing subscription to verify legal claims.',
      verifies: ['Case citations', 'Statutory status', 'Regulatory text', 'Legal precedents', 'Court decisions'],
      useCases: ['Legal research', 'Compliance verification', 'Litigation support', 'Regulatory analysis'],
    },
    {
      id: 'westlaw',
      name: 'Westlaw',
      description: 'Legal research, court documents, and practice tools',
      domain: 'thomsonreuters.com',
      connected: false,
      requiresKey: true,
      category: 'legal',
      overview: 'Westlaw delivers legal research including cases, statutes, regulations, secondary sources, and practice tools. Many law firms and legal departments have existing access.',
      verifies: ['Case law', 'Regulatory status', 'Legal treatises', 'Court filings', 'Docket information'],
      useCases: ['Legal due diligence', 'Regulatory research', 'Case analysis', 'Contract review'],
    },
    {
      id: 'lex-machina',
      name: 'Lex Machina',
      description: 'Litigation analytics, case outcomes, and judge data',
      domain: 'lexmachina.com',
      connected: false,
      requiresKey: true,
      category: 'legal',
      overview: 'Lex Machina provides legal analytics including case outcomes, judge behavior, attorney performance, and damages data. Essential for litigation strategy and risk assessment.',
      verifies: ['Litigation outcomes', 'Judge statistics', 'Damages awarded', 'Case timelines', 'Attorney records'],
      useCases: ['Litigation strategy', 'Case assessment', 'Settlement analysis', 'Risk evaluation'],
    },
    {
      id: 'pacer',
      name: 'PACER',
      description: 'Federal court records, filings, and docket information',
      domain: 'uscourts.gov',
      connected: true,
      free: true,
      autoEnabled: true,
      category: 'legal',
      overview: 'Public Access to Court Electronic Records (PACER) provides access to federal court documents. Harbor monitors case filings and docket entries relevant to your tracked entities.',
      verifies: ['Case filings', 'Docket entries', 'Court orders', 'Judgment status', 'Party information'],
      useCases: ['Litigation monitoring', 'Bankruptcy tracking', 'Due diligence', 'Competitive intelligence'],
    },
  ],
  systems: [
    {
      id: 'google-sheets',
      name: 'Google Sheets',
      description: 'Verify claims against your own spreadsheet data',
      domain: 'sheets.google.com',
      connected: false,
      oauth: true,
      category: 'systems',
      overview: 'Connect your Google Sheets to verify claims against your own data. Harbor can cross-reference AI-generated content with your internal metrics, KPIs, and tracking data.',
      verifies: ['Internal metrics', 'KPIs', 'Custom data', 'Historical records', 'Team data'],
      useCases: ['Internal fact-checking', 'Data validation', 'Report verification', 'Custom tracking'],
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'CRM data, customer records, and pipeline metrics',
      domain: 'salesforce.com',
      connected: false,
      oauth: true,
      category: 'systems',
      overview: 'Salesforce integration allows Harbor to verify claims against your CRM data, including customer information, deal status, and pipeline metrics.',
      verifies: ['Customer data', 'Deal status', 'Pipeline metrics', 'Account information', 'Contact details'],
      useCases: ['Sales verification', 'Customer references', 'Pipeline accuracy', 'Revenue validation'],
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'Marketing automation and sales platform data',
      domain: 'hubspot.com',
      connected: false,
      oauth: true,
      category: 'systems',
      overview: 'HubSpot integration connects your marketing automation, CRM, and sales data for comprehensive verification of customer and campaign claims.',
      verifies: ['Contact data', 'Campaign metrics', 'Deal information', 'Marketing performance', 'Lead data'],
      useCases: ['Marketing verification', 'Lead validation', 'Campaign analysis', 'Sales tracking'],
    },
    {
      id: 'notion',
      name: 'Notion',
      description: 'Sync your Notion workspace and knowledge base',
      domain: 'notion.so',
      connected: false,
      oauth: true,
      category: 'systems',
      overview: 'Connect Notion to verify claims against your team\'s knowledge base, documentation, and project data. Harbor respects your workspace permissions.',
      verifies: ['Documentation', 'Project details', 'Team wiki', 'Meeting notes', 'Process documentation'],
      useCases: ['Knowledge verification', 'Documentation sync', 'Project tracking', 'Internal references'],
    },
    {
      id: 'airtable',
      name: 'Airtable',
      description: 'Connect your Airtable bases for verification',
      domain: 'airtable.com',
      connected: false,
      oauth: true,
      category: 'systems',
      overview: 'Airtable integration allows Harbor to verify claims against your structured data. Perfect for teams using Airtable for CRM, project tracking, or content management.',
      verifies: ['Project status', 'Client data', 'Content records', 'Team information', 'Custom fields'],
      useCases: ['Project verification', 'CRM validation', 'Content fact-checking', 'Workflow automation'],
    },
    {
      id: 'monday',
      name: 'Monday.com',
      description: 'Work management and project tracking platform',
      domain: 'monday.com',
      connected: false,
      oauth: true,
      category: 'systems',
      overview: 'Monday.com integration enables Harbor to verify claims against your project data, timelines, and team workflows.',
      verifies: ['Project status', 'Timeline data', 'Task completion', 'Team assignments', 'Workflow stages'],
      useCases: ['Project verification', 'Status tracking', 'Timeline validation', 'Resource planning'],
    },
  ],
  comingSoon: [
    {
      id: 'bloomberg',
      name: 'Bloomberg Terminal',
      description: 'Financial data, market analytics, and real-time pricing',
      domain: 'bloomberg.com',
      connected: false,
      comingSoon: true,
      category: 'comingSoon',
      overview: 'Bloomberg provides comprehensive financial data, analytics, and news. Integration pending due to terminal licensing requirements.',
      verifies: ['Stock prices', 'Financial metrics', 'Analyst ratings', 'Market cap', 'Trading volumes'],
      useCases: ['Investment research', 'Market analysis', 'Portfolio monitoring', 'Trading decisions'],
    },
    {
      id: 'refinitiv',
      name: 'Refinitiv Eikon',
      description: 'Financial markets data and trading infrastructure',
      domain: 'refinitiv.com',
      connected: false,
      comingSoon: true,
      category: 'comingSoon',
      overview: 'Refinitiv Eikon (now part of LSEG) provides financial markets data, trading infrastructure, and analytics. Integration in development.',
      verifies: ['Market prices', 'Trading data', 'ESG scores', 'News', 'Estimates'],
      useCases: ['Trading research', 'Market analysis', 'ESG analysis', 'Price verification'],
    },
    {
      id: 'snowflake',
      name: 'Snowflake',
      description: 'Cloud data warehouse for enterprise analytics',
      domain: 'snowflake.com',
      connected: false,
      comingSoon: true,
      category: 'comingSoon',
      overview: 'Snowflake integration will allow Harbor to query your data warehouse directly, enabling verification against your complete analytical dataset.',
      verifies: ['Business metrics', 'Custom analytics', 'Historical data', 'Cross-system data', 'KPIs'],
      useCases: ['Enterprise verification', 'Data validation', 'Custom queries', 'Advanced analytics'],
    },
    {
      id: 'postgresql',
      name: 'PostgreSQL',
      description: 'Connect directly to your PostgreSQL databases',
      domain: 'postgresql.org',
      connected: false,
      comingSoon: true,
      category: 'comingSoon',
      overview: 'Direct PostgreSQL connections will allow Harbor to verify claims against your internal databases with secure, read-only access.',
      verifies: ['Custom tables', 'Internal metrics', 'Transaction data', 'User data', 'Business records'],
      useCases: ['Internal verification', 'Custom queries', 'Data validation', 'Business intelligence'],
    },
    {
      id: 'sap',
      name: 'SAP',
      description: 'Enterprise resource planning and business data',
      domain: 'sap.com',
      connected: false,
      comingSoon: true,
      category: 'comingSoon',
      overview: 'SAP integration will enable Harbor to verify claims against your ERP data, including financials, supply chain, and operational metrics.',
      verifies: ['Financial data', 'Supply chain', 'Inventory', 'Procurement', 'HR metrics'],
      useCases: ['Enterprise verification', 'Supply chain validation', 'Financial accuracy', 'Operational data'],
    },
  ],
} compensation', 'Risk factors', 'Material events', 'Shareholder information'],
      useCases: ['Financial due diligence', 'Competitive analysis', 'Investment research', 'Regulatory compliance'],
    },
    {
      id: 'federal-register',
      name: 'Federal Register',
      description: 'Daily journal of the U.S. Government with rules and notices',
      domain: 'federalregister.gov',
      connected: true,
      free: true,
      autoEnabled: true,
      category: 'essentials',
      overview: 'The Federal Register is the official daily publication for rules, proposed rules, and notices of Federal agencies. Harbor monitors regulatory changes that could impact your business.',
      verifies: ['Regulatory requirements', 'Proposed rules', 'Agency notices', 'Executive orders'],
      useCases: ['Regulatory monitoring', 'Compliance tracking', 'Policy analysis', 'Government affairs'],
    },
    {
      id: 'patents-uspo',
      name: 'USPTO Patents',
      description: 'Patent grants, applications, and intellectual property records',
      domain: 'uspto.gov',
      connected: true,
      free: true,
      autoEnabled: true,
      category: 'essentials',
      overview: 'The United States Patent and Trademark Office database contains all U.S. patents and patent applications. Harbor uses this to verify intellectual property claims and track competitive innovation.',
      verifies: ['Patent ownership', 'Filing dates', 'Claims scope', 'Prior art', 'Patent status'],
      useCases: ['IP due diligence', 'Competitive intelligence', 'Freedom to operate', 'Technology scouting'],
    },
    {
      id: 'opencorporates',
      name: 'OpenCorporates',
      description: 'Global company registry data from 140+ jurisdictions',
      domain: 'opencorporates.com',
      connected: true,
      free: true,
      autoEnabled: true,
      category: 'essentials',
      overview: 'OpenCorporates is the largest open database of companies in the world, with data from over 140 jurisdictions. Harbor uses this to verify corporate structure and registration claims.',
      verifies: ['Company registration', 'Incorporation date', 'Registered address', 'Officer names', 'Company status'],
      useCases: ['KYC verification', 'Vendor due diligence', 'Corporate structure analysis', 'Entity verification'],
    },
    {
      id: 'web-search',
      name: 'Web Search',
      description: 'Real-time news, press releases, and web content monitoring',
      domain: 'google.com',
      connected: true,
      free: true,
      autoEnabled: true,
      category: 'essentials',
      overview: 'Harbor continuously monitors web content and news sources to verify claims and detect contradictions in real-time. This includes press releases, news articles, and company announcements.',
      verifies: ['News accuracy', 'Press releases', 'Company announcements', 'Executive statements', 'Market events'],
      useCases: ['Media monitoring', 'Reputation tracking', 'Event detection', 'Fact checking'],
    },
    {
      id: 'wikipedia',
      name: 'Wikipedia',
      description: 'Encyclopedia articles and general knowledge verification',
      domain: 'wikipedia.org',
      connected: true,
      free: true,
      autoEnabled: true,
      category: 'essentials',
      overview: 'Wikipedia provides general reference information that Harbor uses as a baseline for verifying commonly known facts about companies, people, and events.',
      verifies: ['Company history', 'Founding dates', 'Key personnel', 'General facts', 'Historical events'],
      useCases: ['Background research', 'Fact verification', 'Historical context', 'General knowledge'],
    },
  ],
  market: [
    {
      id: 'factset',
      name: 'FactSet',
      description: 'Financial data and analytics for investment professionals',
      domain: 'factset.com',
      connected: false,
      requiresKey: true,
      category: 'market',
      overview: 'FactSet delivers integrated financial information and analytical applications. Your firm may already have a FactSet license. Connect to verify financial data at scale.',
      verifies: ['Company financials', 'Estimates', 'Ownership data', 'Supply chain', 'Geographic revenue'],
      useCases: ['Equity research', 'Portfolio analytics', 'Risk management', 'M&A analysis'],
    },
    {
      id: 'pitchbook',
      name: 'PitchBook',
      description: 'Private market data, VC, PE, and M&A intelligence',
      domain: 'pitchbook.com',
      connected: false,
      requiresKey: true,
      category: 'market',
      overview: 'PitchBook provides comprehensive data on the private capital markets, including venture capital, private equity, and M&A transactions.',
      verifies: ['Funding rounds', 'Valuations', 'Investor details', 'Deal terms', 'Company profiles'],
      useCases: ['Deal sourcing', 'Competitive intelligence', 'Market sizing', 'LP reporting'],
    },
    {
      id: 'morningstar',
      name: 'Morningstar',
      description: 'Investment research, fund ratings, and portfolio tools',
      domain: 'morningstar.com',
      connected: false,
      requiresKey: true,
      category: 'market',
      overview: 'Morningstar provides independent investment research including fund ratings, analyst reports, and portfolio analysis tools. Many advisory firms have existing licenses.',
      verifies: ['Fund ratings', 'Expense ratios', 'Holdings data', 'Performance metrics', 'Risk scores'],
      useCases: ['Fund selection', 'Portfolio construction', 'Client reporting', 'Due diligence'],
    },
    {
      id: 'ibisworld',
      name: 'IBISWorld',
      description: 'Industry research reports and market analysis',
      domain: 'ibisworld.com',
      connected: false,
      requiresKey: true,
      category: 'market',
      overview: 'IBISWorld provides comprehensive industry research reports covering market size, growth trends, competitive landscape, and key success factors for thousands of industries.',
      verifies: ['Industry size', 'Growth rates', 'Market share', 'Industry structure', 'Key success factors'],
      useCases: ['Industry analysis', 'Business planning', 'Market entry strategy', 'Competitive positioning'],
    },
    {
      id: 'crunchbase',
      name: 'Crunchbase',
      description: 'Startup and company data, funding rounds, and acquisitions',
      domain: 'crunchbase.com',
      connected: false,
      requiresKey: true,
      category: 'market',
      overview: 'Crunchbase provides data on startups, investments, and acquisitions. Track funding announcements, company growth, and market trends.',
      verifies: ['Funding history', 'Investor relationships', 'Acquisition data', 'Company growth', 'Leadership changes'],
      useCases: ['Startup research', 'Investment tracking', 'Competitive analysis', 'Market mapping'],
    },
    {
      id: 'statista',
      name: 'Statista',
      description: 'Statistics, market data, and consumer insights',
      domain: 'statista.com',
      connected: false,
      requiresKey: true,
      category: 'market',
      overview: 'Statista aggregates statistics from over 22,500 sources, providing market data, consumer insights, and industry reports across hundreds of sectors.',
      verifies: ['Market statistics', 'Consumer data', 'Industry trends', 'Regional data', 'Forecasts'],
      useCases: ['Market research', 'Presentation data', 'Trend analysis', 'Benchmarking'],
    },
    {
      id: 'sp-capital-iq',
      name: 'S&P Capital IQ',
      description: 'Financial intelligence and analytics platform',
      domain: 'spglobal.com',
      connected: false,
      requiresKey: true,
      category: 'market',
      overview: 'S&P Capital IQ provides financial data, analytics, and research on public and private companies, with deep coverage of financials, transactions, and credit ratings.',
      verifies: ['Credit ratings', 'Financial statements', 'Transaction data', 'Ownership', 'Debt profiles'],
      useCases: ['Credit analysis', 'Financial modeling', 'Transaction research', 'Risk assessment'],
    },
    {
      id: 'refinitiv',
      name: 'Refinitiv',
      description: 'Financial markets data and infrastructure',
      domain: 'refinitiv.com',
      connected: false,
      requiresKey: true,
      category: 'market',
      overview: 'Refinitiv (now part of LSEG) provides financial markets data, trading infrastructure, and analytics used by financial institutions worldwide.',
      verifies: ['Market prices', 'Trading data', 'ESG scores', 'News', 'Estimates'],
      useCases: ['Trading research', 'Market analysis', 'ESG analysis', 'Price verification'],
    },
  ],
  legal: [
    {
      id: 'lexisnexis',
      name: 'LexisNexis',
      description: 'Case law, statutes, regulations, and legal analytics',
      domain: 'lexisnexis.com',
      connected: false,
      requiresKey: true,
      category: 'legal',
      overview: 'LexisNexis provides comprehensive legal research including case law, statutes, regulations, and legal news from jurisdictions worldwide. Connect your existing subscription to verify legal claims.',
      verifies: ['Case citations', 'Statutory status', 'Regulatory text', 'Legal precedents', 'Court decisions'],
      useCases: ['Legal research', 'Compliance verification', 'Litigation support', 'Regulatory analysis'],
    },
    {
      id: 'westlaw',
      name: 'Westlaw',
      description: 'Legal research, court documents, and practice tools',
      domain: 'thomsonreuters.com',
      connected: false,
      requiresKey: true,
      category: 'legal',
      overview: 'Westlaw delivers legal research including cases, statutes, regulations, secondary sources, and practice tools. Many law firms and legal departments have existing access.',
      verifies: ['Case law', 'Regulatory status', 'Legal treatises', 'Court filings', 'Docket information'],
      useCases: ['Legal due diligence', 'Regulatory research', 'Case analysis', 'Contract review'],
    },
    {
      id: 'pacer',
      name: 'PACER',
      description: 'Federal court records, filings, and docket information',
      domain: 'uscourts.gov',
      connected: false,
      requiresKey: true,
      category: 'legal',
      overview: 'Public Access to Court Electronic Records (PACER) provides access to federal court documents. Harbor monitors case filings and docket entries relevant to your tracked entities.',
      verifies: ['Case filings', 'Docket entries', 'Court orders', 'Judgment status', 'Party information'],
      useCases: ['Litigation monitoring', 'Bankruptcy tracking', 'Due diligence', 'Competitive intelligence'],
    },
    {
      id: 'courtlistener',
      name: 'CourtListener',
      description: 'Free legal research and court opinion database',
      domain: 'courtlistener.com',
      connected: false,
      requiresKey: true,
      category: 'legal',
      overview: 'CourtListener is a free legal research platform with millions of court opinions, oral arguments, and judicial data from Free Law Project.',
      verifies: ['Court opinions', 'Oral arguments', 'Judge information', 'Case history', 'Citations'],
      useCases: ['Legal research', 'Case monitoring', 'Judicial analytics', 'Citation tracking'],
    },
    {
      id: 'regulations-gov',
      name: 'Regulations.gov',
      description: 'Federal regulatory actions and public comments',
      domain: 'regulations.gov',
      connected: false,
      requiresKey: true,
      category: 'legal',
      overview: 'Regulations.gov provides access to federal regulatory actions, proposed rules, and public comments across all federal agencies.',
      verifies: ['Proposed rules', 'Final rules', 'Public comments', 'Agency actions', 'Regulatory timelines'],
      useCases: ['Regulatory tracking', 'Comment monitoring', 'Policy analysis', 'Compliance planning'],
    },
    {
      id: 'docketalarm',
      name: 'Docket Alarm',
      description: 'Litigation analytics and court docket monitoring',
      domain: 'docketalarm.com',
      connected: false,
      requiresKey: true,
      category: 'legal',
      overview: 'Docket Alarm provides litigation analytics, docket monitoring, and document retrieval across federal and state courts.',
      verifies: ['Docket updates', 'Case documents', 'Litigation trends', 'Party history', 'Judge analytics'],
      useCases: ['Litigation tracking', 'Case research', 'Competitive intelligence', 'Risk assessment'],
    },
  ],
  systems: [
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'CRM data, customer records, and pipeline metrics',
      domain: 'salesforce.com',
      connected: false,
      oauth: true,
      category: 'systems',
      overview: 'Salesforce integration allows Harbor to verify claims against your CRM data, including customer information, deal status, and pipeline metrics.',
      verifies: ['Customer data', 'Deal status', 'Pipeline metrics', 'Account information', 'Contact details'],
      useCases: ['Sales verification', 'Customer references', 'Pipeline accuracy', 'Revenue validation'],
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'Marketing automation and sales platform data',
      domain: 'hubspot.com',
      connected: false,
      oauth: true,
      category: 'systems',
      overview: 'HubSpot integration connects your marketing automation, CRM, and sales data for comprehensive verification of customer and campaign claims.',
      verifies: ['Contact data', 'Campaign metrics', 'Deal information', 'Marketing performance', 'Lead data'],
      useCases: ['Marketing verification', 'Lead validation', 'Campaign analysis', 'Sales tracking'],
    },
    {
      id: 'snowflake',
      name: 'Snowflake',
      description: 'Data warehouse integration for enterprise verification',
      domain: 'snowflake.com',
      connected: false,
      oauth: true,
      category: 'systems',
      overview: 'Snowflake integration allows Harbor to query your data warehouse directly, enabling verification against your complete analytical dataset.',
      verifies: ['Business metrics', 'Custom analytics', 'Historical data', 'Cross-system data', 'KPIs'],
      useCases: ['Enterprise verification', 'Data validation', 'Custom queries', 'Advanced analytics'],
    },
    {
      id: 'google-sheets',
      name: 'Google Sheets',
      description: 'Verify claims against your own spreadsheet data',
      domain: 'sheets.google.com',
      connected: false,
      oauth: true,
      category: 'systems',
      overview: 'Connect your Google Sheets to verify claims against your own data. Harbor can cross-reference AI-generated content with your internal metrics, KPIs, and tracking data.',
      verifies: ['Internal metrics', 'KPIs', 'Custom data', 'Historical records', 'Team data'],
      useCases: ['Internal fact-checking', 'Data validation', 'Report verification', 'Custom tracking'],
    },
    {
      id: 'airtable',
      name: 'Airtable',
      description: 'Connect your Airtable bases for verification',
      domain: 'airtable.com',
      connected: false,
      oauth: true,
      category: 'systems',
      overview: 'Airtable integration allows Harbor to verify claims against your structured data. Perfect for teams using Airtable for CRM, project tracking, or content management.',
      verifies: ['Project status', 'Client data', 'Content records', 'Team information', 'Custom fields'],
      useCases: ['Project verification', 'CRM validation', 'Content fact-checking', 'Workflow automation'],
    },
    {
      id: 'notion',
      name: 'Notion',
      description: 'Sync your Notion workspace and knowledge base',
      domain: 'notion.so',
      connected: false,
      oauth: true,
      category: 'systems',
      overview: 'Connect Notion to verify claims against your team\'s knowledge base, documentation, and project data. Harbor respects your workspace permissions.',
      verifies: ['Documentation', 'Project details', 'Team wiki', 'Meeting notes', 'Process documentation'],
      useCases: ['Knowledge verification', 'Documentation sync', 'Project tracking', 'Internal references'],
    },
    {
      id: 'confluence',
      name: 'Confluence',
      description: 'Team documentation and knowledge management',
      domain: 'atlassian.com',
      connected: false,
      oauth: true,
      category: 'systems',
      overview: 'Confluence integration enables Harbor to verify claims against your team\'s documentation, wikis, and knowledge base stored in Atlassian Confluence.',
      verifies: ['Documentation', 'Team wikis', 'Project pages', 'Meeting notes', 'Technical specs'],
      useCases: ['Documentation verification', 'Knowledge validation', 'Process tracking', 'Internal research'],
    },
    {
      id: 'sharepoint',
      name: 'SharePoint',
      description: 'Microsoft document management and collaboration',
      domain: 'microsoft.com',
      connected: false,
      oauth: true,
      category: 'systems',
      overview: 'SharePoint integration allows Harbor to verify claims against documents, lists, and content stored in your Microsoft 365 SharePoint environment.',
      verifies: ['Documents', 'Lists', 'Site content', 'Team files', 'Policies'],
      useCases: ['Document verification', 'Policy compliance', 'Content validation', 'Internal research'],
    },
  ],
  comingSoon: [
    {
      id: 'bloomberg',
      name: 'Bloomberg',
      description: 'Financial data, market analytics, and real-time pricing',
      domain: 'bloomberg.com',
      connected: false,
      comingSoon: true,
      category: 'comingSoon',
      overview: 'Bloomberg provides comprehensive financial data, analytics, and news. Integration pending due to licensing requirements.',
      verifies: ['Stock prices', 'Financial metrics', 'Analyst ratings', 'Market cap', 'Trading volumes'],
      useCases: ['Investment research', 'Market analysis', 'Portfolio monitoring', 'Trading decisions'],
    },
    {
      id: 'internal-sql',
      name: 'Internal Databases',
      description: 'Connect directly to your SQL databases',
      domain: 'postgresql.org',
      connected: false,
      comingSoon: true,
      category: 'comingSoon',
      overview: 'Direct SQL database connections will allow Harbor to verify claims against your internal PostgreSQL, MySQL, or SQL Server databases with read-only access.',
      verifies: ['Custom tables', 'Internal metrics', 'Transaction data', 'User data', 'Business records'],
      useCases: ['Internal verification', 'Custom queries', 'Data validation', 'Business intelligence'],
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Professional network data and company information',
      domain: 'linkedin.com',
      connected: false,
      comingSoon: true,
      category: 'comingSoon',
      overview: 'LinkedIn integration will enable verification of professional credentials, company employee counts, and organizational changes.',
      verifies: ['Employee counts', 'Job titles', 'Company updates', 'Professional history', 'Skills'],
      useCases: ['Personnel verification', 'Company research', 'Competitive intelligence', 'Recruiting'],
    },
    {
      id: 'glassdoor',
      name: 'Glassdoor',
      description: 'Company reviews, salaries, and workplace insights',
      domain: 'glassdoor.com',
      connected: false,
      comingSoon: true,
      category: 'comingSoon',
      overview: 'Glassdoor integration will provide access to company reviews, salary data, and workplace culture insights for verification purposes.',
      verifies: ['Company ratings', 'Salary ranges', 'Interview processes', 'Culture insights', 'CEO approval'],
      useCases: ['Company research', 'Salary verification', 'Culture assessment', 'Recruiting intelligence'],
    },
  ],
}

// =============================================================================
// SOURCE DETAIL MODAL
// =============================================================================

interface SourceDetailModalProps {
  source: Source
  onClose: () => void
  onConnect: (sourceId: string, apiKey?: string) => void
}

function SourceDetailModal({ source, onClose, onConnect }: SourceDetailModalProps) {
  const [apiKey, setApiKey] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [showApiInput, setShowApiInput] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    await new Promise(resolve => setTimeout(resolve, 1200))
    onConnect(source.id, apiKey || undefined)
    setIsConnecting(false)
    onClose()
  }

  const handleOAuthConnect = async () => {
    setIsConnecting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    onConnect(source.id)
    setIsConnecting(false)
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white border border-gray-200 rounded-xl w-full max-w-lg overflow-hidden"
        style={{ boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src={`https://cdn.brandfetch.io/${source.domain}?c=1id1Fyz-h7an5-5KR_y`}
                  alt={source.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-gray-900 font-semibold text-lg">
                    {source.name}
                  </h2>
                  <ShieldStatus connected={source.connected} size={14} />
                </div>
                <p className="text-gray-500 text-sm">{source.domain}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Overview */}
          <div>
            <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Overview</h3>
            <p className="text-gray-700 text-sm leading-relaxed">{source.overview}</p>
          </div>

          {/* What we verify */}
          <div>
            <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">What Harbor Verifies</h3>
            <div className="flex flex-wrap gap-2">
              {source.verifies.map((item, idx) => (
                <span 
                  key={idx}
                  className="px-2.5 py-1 bg-gray-100 border border-gray-200 rounded text-gray-700 text-xs"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <div>
            <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Use Cases</h3>
            <ul className="space-y-1.5">
              {source.useCases.map((useCase, idx) => (
                <li key={idx} className="flex items-center gap-2 text-gray-700 text-sm">
                  <ChevronRight size={12} className="text-gray-400" />
                  {useCase}
                </li>
              ))}
            </ul>
          </div>

          {/* API Key Input */}
          {source.requiresKey && !source.connected && showApiInput && (
            <div className="pt-2">
              <label className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2 block">
                API Key
              </label>
              <div className="relative">
                <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-300 transition-colors"
                />
              </div>
              <p className="text-gray-400 text-xs mt-2">
                Your API key is encrypted and stored securely.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="px-6 py-4 border-t border-gray-200"
          style={{ backgroundColor: '#FBF9F7' }}
        >
          {source.comingSoon ? (
            <button
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Bell size={14} />
              Notify me when available
            </button>
          ) : source.connected ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-600 text-sm">
                <ShieldStatus connected={true} size={14} />
                <span>{source.free ? 'Active' : 'Connected'}</span>
              </div>
              {!source.free && (
                <button className="text-gray-500 text-sm hover:text-gray-700 transition-colors cursor-pointer">
                  Disconnect
                </button>
              )}
            </div>
          ) : source.oauth ? (
            <button
              onClick={handleOAuthConnect}
              disabled={isConnecting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isConnecting ? (
                <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Link2 size={14} />
                  Connect with OAuth
                </>
              )}
            </button>
          ) : source.requiresKey ? (
            showApiInput ? (
              <button
                onClick={handleConnect}
                disabled={isConnecting || !apiKey}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isConnecting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Check size={14} />
                    Connect Source
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => setShowApiInput(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <Key size={14} />
                Add API Key
              </button>
            )
          ) : null}
          
          {/* External link */}
          <a 
            href={`https://${source.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-gray-400 text-xs mt-3 hover:text-gray-600 transition-colors"
          >
            Visit {source.domain}
            <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// SOURCE CARD COMPONENT (Linear-style)
// =============================================================================

interface SourceCardProps {
  source: Source
  onClick: () => void
}

function SourceCard({ source, onClick }: SourceCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:shadow-md transition-all cursor-pointer"
      style={{ boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}
    >
      {/* Logo + Name Row */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
          <img
            src={`https://cdn.brandfetch.io/${source.domain}?c=1id1Fyz-h7an5-5KR_y`}
            alt={source.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-900 text-sm font-medium truncate">{source.name}</span>
            <ShieldStatus connected={source.connected} size={14} />
          </div>
          <span className="text-gray-400 text-xs">{source.domain}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
        {source.description}
      </p>
    </button>
  )
}

// =============================================================================
// MAIN SOURCES PAGE
// =============================================================================

export default function SourcesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSource, setSelectedSource] = useState<Source | null>(null)
  const [sources, setSources] = useState<SourcesData>(sourcesData)
  const [activeCategory, setActiveCategory] = useState('essentials')
  
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const mainContentRef = useRef<HTMLDivElement>(null)

  // Scroll spy effect
  useEffect(() => {
    const handleScroll = () => {
      if (!mainContentRef.current) return
      
      const container = mainContentRef.current
      const scrollTop = container.scrollTop
      const scrollHeight = container.scrollHeight
      const clientHeight = container.clientHeight
      
      // If we're near the bottom, activate the last visible category
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        // Find the last category that has content
        for (let i = categories.length - 1; i >= 0; i--) {
          const category = categories[i]
          const categorySources = sources[category.id as keyof SourcesData] || []
          if (categorySources.length > 0) {
            setActiveCategory(category.id)
            return
          }
        }
      }

      // Otherwise, find which section we're in
      for (const category of categories) {
        const section = sectionRefs.current[category.id]
        if (section) {
          const sectionTop = section.offsetTop - 100
          const sectionBottom = sectionTop + section.offsetHeight
          
          if (scrollTop >= sectionTop && scrollTop < sectionBottom) {
            setActiveCategory(category.id)
            break
          }
        }
      }
    }

    const mainContent = mainContentRef.current
    mainContent?.addEventListener('scroll', handleScroll)
    return () => mainContent?.removeEventListener('scroll', handleScroll)
  }, [sources])

  // Scroll to section
  const scrollToSection = (categoryId: string) => {
    const section = sectionRefs.current[categoryId]
    if (section && mainContentRef.current) {
      mainContentRef.current.scrollTo({
        top: section.offsetTop - 24,
        behavior: 'smooth'
      })
    }
  }

  // Handle source connection
  const handleConnect = (sourceId: string, apiKey?: string) => {
    setSources(prev => {
      const newSources = { ...prev }
      for (const category of Object.keys(newSources) as (keyof SourcesData)[]) {
        newSources[category] = newSources[category].map(s => 
          s.id === sourceId ? { ...s, connected: true } : s
        )
      }
      return newSources
    })
  }

  // Count connected sources per category
  const getConnectedCount = (categoryId: string) => {
    const categorySources = sources[categoryId as keyof SourcesData] || []
    return categorySources.filter(s => s.connected).length
  }

  // Total connected count
  const totalConnected = Object.values(sources).flat().filter(s => s.connected).length

  // Filter sources by search
  const filterSources = (categorySources: Source[]) => {
    if (!searchQuery) return categorySources
    const query = searchQuery.toLowerCase()
    return categorySources.filter(s => 
      s.name.toLowerCase().includes(query) || 
      s.description.toLowerCase().includes(query) ||
      s.domain.toLowerCase().includes(query)
    )
  }

  return (
    <div className="h-full flex">
      {/* Left Sidebar - Category Navigation */}
      <div className="w-56 flex-shrink-0 border-r border-gray-200 p-4 flex flex-col">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-gray-900 text-xl font-semibold mb-1">
            Sources
          </h1>
          <p className="text-gray-500 text-sm">
            {totalConnected} sources active
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sources..."
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-300 transition-colors"
          />
        </div>

        {/* Category Navigation */}
        <nav className="space-y-1 flex-1">
          {categories.map(category => {
            const Icon = category.icon
            const connectedCount = getConnectedCount(category.id)
            const isActive = activeCategory === category.id
            
            return (
              <button
                key={category.id}
                onClick={() => scrollToSection(category.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                  isActive 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-gray-700' : 'text-gray-400'} strokeWidth={1.5} />
                <span className="text-sm flex-1">{category.label}</span>
                {connectedCount > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {connectedCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div 
        ref={mainContentRef}
        className="flex-1 overflow-y-auto p-8"
      >
        {categories.map(category => {
          const categorySources = filterSources(sources[category.id as keyof SourcesData] || [])
          if (categorySources.length === 0 && searchQuery) return null

          return (
            <div
              key={category.id}
              ref={el => { sectionRefs.current[category.id] = el }}
              className="mb-10"
            >
              {/* Section Header */}
              <div className="mb-4">
                <h2 className="text-gray-900 text-lg font-semibold mb-1">
                  {category.label}
                </h2>
                <p className="text-gray-500 text-sm">{category.description}</p>
              </div>

              {/* Card Grid - 3 columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {categorySources.map(source => (
                  <SourceCard
                    key={source.id}
                    source={source}
                    onClick={() => setSelectedSource(source)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Source Detail Modal */}
      {selectedSource && (
        <SourceDetailModal
          source={selectedSource}
          onClose={() => setSelectedSource(null)}
          onConnect={handleConnect}
        />
      )}
    </div>
  )
}