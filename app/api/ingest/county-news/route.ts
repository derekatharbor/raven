/**
 * McHenry County Government News Ingestion API Route
 * 
 * Fetches news/press releases from McHenry County Government RSS feed.
 * This captures civic data: court cases, government announcements, public services.
 * 
 * RSS URL: https://www.mchenrycountyil.gov/county-government/advance-components/rss-feed-viewer-view
 * 
 * Triggered by:
 * - Vercel Cron (automatic, every 6 hours)
 * - Manual GET request to /api/ingest/county-news
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import Parser from 'rss-parser';
import crypto from 'crypto';

// Multiple RSS feeds from McHenry County
const RSS_FEEDS = [
  {
    url: 'https://www.mchenrycountyil.gov/county-government/rss.aspx',
    source: 'mchenry_county_government',
    name: 'McHenry County Government',
  },
];

// McHenry County cities for location extraction
const MCHENRY_CITIES = [
  'crystal lake', 'mchenry', 'woodstock', 'cary', 'algonquin',
  'lake in the hills', 'huntley', 'harvard', 'marengo', 'fox river grove',
  'island lake', 'johnsburg', 'lakewood', 'spring grove', 'wonder lake',
  'ringwood', 'union', 'hebron', 'richmond', 'bull valley', 'nunda',
  'oakwood hills', 'round lake', 'grayslake', 'lake villa', 'fox lake'
];

// News/civic category patterns
const CIVIC_PATTERNS: [RegExp, string, string][] = [
  // Court/Legal
  [/\bsentenced?\b|\bconvicted?\b|\bguilty\b/i, 'sentencing', 'court'],
  [/\bcharged?\b|\bindicted?\b|\barraigned?\b/i, 'charges', 'court'],
  [/\bcourt\b|\bjudge\b|\btrial\b/i, 'court_proceeding', 'court'],
  [/\bstate'?s?\s+attorney\b/i, 'prosecution', 'court'],
  [/\bsheriff\b.*(?:arrest|apprehend)/i, 'arrest', 'court'],
  
  // Government/Civic
  [/\bcounty\s+board\b/i, 'county_board', 'government'],
  [/\btown(?:ship)?\s+(?:hall|meeting|board)\b/i, 'township', 'government'],
  [/\bcity\s+council\b/i, 'city_council', 'government'],
  [/\bvillage\s+board\b/i, 'village_board', 'government'],
  [/\bpublic\s+hearing\b/i, 'public_hearing', 'government'],
  [/\belection\b|\bvot(?:e|ing)\b|\bballot\b/i, 'election', 'government'],
  [/\bordinance\b|\bresolution\b/i, 'legislation', 'government'],
  [/\bbudget\b|\btax\s+levy\b|\bproperty\s+tax\b/i, 'budget', 'government'],
  
  // Public Services
  [/\bhealth\s+department\b/i, 'public_health', 'services'],
  [/\bvaccin(?:e|ation)\b|\bimmuniz/i, 'health_services', 'services'],
  [/\bwic\b|\bsnap\b|\bassistance\b/i, 'social_services', 'services'],
  [/\blibrary\b/i, 'library', 'services'],
  [/\bpark(?:s)?\b.*district\b/i, 'parks', 'services'],
  [/\bschool\b.*(?:district|board)\b/i, 'education', 'services'],
  [/\bemergency\s+(?:management|services)\b/i, 'emergency_services', 'services'],
  
  // Infrastructure/Development
  [/\bpermit\b|\bzoning\b/i, 'permits', 'development'],
  [/\bconstruction\b|\bproject\b/i, 'construction', 'development'],
  [/\bplanning\b.*development\b/i, 'planning', 'development'],
  [/\broad\s+(?:closure|construction|work)\b/i, 'road_work', 'infrastructure'],
  [/\bbridge\b/i, 'bridge', 'infrastructure'],
  [/\bflood(?:ing|plain)?\b|\bstorm\s+water\b/i, 'flooding', 'infrastructure'],
  [/\bwater\b.*(?:main|quality|supply)\b/i, 'water', 'infrastructure'],
  
  // Community Events
  [/\bevent\b|\bfestival\b|\bcelebrat/i, 'community_event', 'events'],
  [/\bworkshop\b|\bseminar\b|\bpresentation\b/i, 'workshop', 'events'],
  [/\bmeeting\b/i, 'meeting', 'events'],
];

interface ParsedNews {
  title: string;
  description: string;
  url: string;
  publishedAt: Date | null;
  city: string | null;
  newsType: string;
  category: string;
  contentHash: string;
  source: string;
}

function extractCity(text: string): string | null {
  const lower = text.toLowerCase();
  for (const city of [...MCHENRY_CITIES].sort((a, b) => b.length - a.length)) {
    if (lower.includes(city)) {
      return city.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }
  // Default to Woodstock (county seat) for county-level news
  if (lower.includes('mchenry county') || lower.includes('county board')) {
    return 'Woodstock';
  }
  return null;
}

function extractNewsType(text: string): { type: string; category: string } {
  const lower = text.toLowerCase();
  for (const [pattern, type, category] of CIVIC_PATTERNS) {
    if (pattern.test(lower)) {
      return { type, category };
    }
  }
  return { type: 'announcement', category: 'civic' };
}

function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function generateHash(title: string, source: string): string {
  return crypto
    .createHash('sha256')
    .update(`${source}:${title}`)
    .digest('hex')
    .slice(0, 16);
}

function mapToDbCategory(category: string): string {
  switch (category) {
    case 'court':
      return 'police'; // Court/legal falls under public safety/police category
    case 'government':
    case 'services':
    case 'events':
      return 'civic';
    case 'development':
    case 'infrastructure':
      return 'traffic'; // Infrastructure goes with traffic
    default:
      return 'other';
  }
}

function mapToSeverity(category: string, type: string): 'critical' | 'high' | 'medium' | 'low' {
  // Court cases with convictions/sentencing are higher priority
  if (category === 'court' && ['sentencing', 'charges'].includes(type)) {
    return 'medium';
  }
  // Infrastructure issues
  if (category === 'infrastructure') {
    return 'medium';
  }
  // Most civic news is informational
  return 'low';
}

async function fetchFeed(feedConfig: typeof RSS_FEEDS[0]): Promise<ParsedNews[]> {
  const parser = new Parser();
  
  try {
    const feed = await parser.parseURL(feedConfig.url);
    const items: ParsedNews[] = [];
    
    for (const item of feed.items) {
      const title = item.title || '';
      const description = cleanHtml(item.contentSnippet || item.content || '');
      const url = item.link || '';
      const pubDate = item.pubDate ? new Date(item.pubDate) : null;
      
      const fullText = `${title} ${description}`;
      const city = extractCity(fullText);
      
      // We want all county news, even if no specific city
      const { type, category } = extractNewsType(fullText);
      
      items.push({
        title,
        description,
        url,
        publishedAt: pubDate,
        city: city || 'McHenry County', // Default to county-level
        newsType: type,
        category,
        contentHash: generateHash(title, feedConfig.source),
        source: feedConfig.source,
      });
    }
    
    return items;
  } catch (error) {
    console.error(`[County News] Failed to fetch ${feedConfig.name}:`, error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  
  try {
    console.log('[County News] Starting fetch...');
    
    // Fetch from all configured feeds
    const allNews: ParsedNews[] = [];
    for (const feed of RSS_FEEDS) {
      const items = await fetchFeed(feed);
      allNews.push(...items);
      console.log(`[County News] Fetched ${items.length} items from ${feed.name}`);
    }
    
    if (allNews.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No news items found',
        fetched: 0,
        inserted: 0,
      });
    }
    
    const supabase = createServerClient();
    
    // Check for existing items
    const hashes = allNews.map(n => `county_${n.contentHash}`);
    const { data: existing } = await supabase
      .from('incidents')
      .select('external_id')
      .in('external_id', hashes);
    
    const existingHashes = new Set(existing?.map(e => e.external_id) || []);
    const newItems = allNews.filter(n => !existingHashes.has(`county_${n.contentHash}`));
    
    console.log(`[County News] ${existingHashes.size} existing, ${newItems.length} new`);
    
    if (newItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new news items to insert',
        fetched: allNews.length,
        inserted: 0,
        skipped: allNews.length,
      });
    }
    
    // Map to database format
    const dbItems = newItems.map(item => ({
      external_id: `county_${item.contentHash}`,
      category: mapToDbCategory(item.category),
      severity: mapToSeverity(item.category, item.newsType),
      title: item.title,
      description: item.description.slice(0, 1000), // Limit description length
      location_text: item.city,
      municipality: item.city,
      occurred_at: item.publishedAt?.toISOString() || null,
      reported_at: new Date().toISOString(),
      verification_status: 'verified' as const, // Government sources are verified
      raw_data: {
        url: item.url,
        news_type: item.newsType,
        civic_category: item.category,
        source: item.source,
        content_hash: item.contentHash,
      },
    }));
    
    // Insert new items
    const { data, error } = await supabase
      .from('incidents')
      .insert(dbItems)
      .select();
    
    if (error) {
      console.error('[County News] Database error:', error);
      throw error;
    }
    
    const inserted = data?.length || 0;
    console.log(`[County News] Inserted ${inserted} new items`);
    
    return NextResponse.json({
      success: true,
      message: `Ingested ${inserted} new county news items`,
      fetched: allNews.length,
      inserted,
      skipped: allNews.length - newItems.length,
      sample: newItems.slice(0, 3).map(i => ({
        title: i.title.slice(0, 60),
        city: i.city,
        type: i.newsType,
        category: i.category,
      })),
    });
    
  } catch (error) {
    console.error('[County News] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export const POST = GET;
