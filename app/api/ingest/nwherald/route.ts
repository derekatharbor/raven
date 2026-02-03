/**
 * Northwest Herald (Shaw Local) News Ingestion API Route
 * 
 * Fetches local news from Northwest Herald RSS feeds.
 * Covers breaking news, local government, community events for McHenry County.
 * 
 * Triggered by:
 * - Vercel Cron (automatic, every 2 hours)
 * - Manual GET request to /api/ingest/nwherald
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import Parser from 'rss-parser';
import crypto from 'crypto';

// Northwest Herald RSS feeds
const RSS_FEEDS = [
  {
    url: 'https://www.shawlocal.com/northwest-herald/news/breaking/rss/',
    source: 'nwherald_breaking',
    name: 'Northwest Herald Breaking',
    priority: 'high',
  },
  {
    url: 'https://www.shawlocal.com/northwest-herald/news/local/rss/',
    source: 'nwherald_local',
    name: 'Northwest Herald Local',
    priority: 'medium',
  },
];

// McHenry County cities
const MCHENRY_CITIES = [
  'crystal lake', 'mchenry', 'woodstock', 'cary', 'algonquin',
  'lake in the hills', 'huntley', 'harvard', 'marengo', 'fox river grove',
  'island lake', 'johnsburg', 'lakewood', 'spring grove', 'wonder lake',
  'ringwood', 'union', 'hebron', 'richmond', 'bull valley', 'nunda',
  'oakwood hills', 'round lake', 'grayslake', 'lake villa', 'fox lake',
  'barrington', 'carpentersville', 'palatine', 'arlington heights'
];

// News categorization patterns
const NEWS_PATTERNS: [RegExp, string, string][] = [
  // Crime/Safety (high priority)
  [/\bkill(?:ed|ing|s)?\b|\bdead\b|\bdeath\b|\bdie[ds]?\b/i, 'fatality', 'violent_crime'],
  [/\bshoot(?:ing|s)?\b|\bshot\b|\bgunfire\b/i, 'shooting', 'violent_crime'],
  [/\bstab(?:bing|bed)?\b/i, 'stabbing', 'violent_crime'],
  [/\bhomicide\b|\bmurder(?:ed)?\b/i, 'homicide', 'violent_crime'],
  [/\brobbe(?:ry|d)\b/i, 'robbery', 'violent_crime'],
  [/\bassault(?:ed)?\b/i, 'assault', 'violent_crime'],
  [/\bdomestic\b/i, 'domestic', 'violent_crime'],
  [/\bsexual\s+(?:assault|abuse)\b/i, 'sexual_assault', 'violent_crime'],
  [/\bkidnap/i, 'kidnapping', 'violent_crime'],
  [/\barrest(?:ed)?\b|\bcharg(?:ed|es)\b/i, 'arrest', 'police'],
  [/\bprison\b|\bjail\b|\bsentenc/i, 'sentencing', 'police'],
  [/\bfugitive\b|\bwanted\b/i, 'wanted', 'police'],
  
  // Traffic (infrastructure)
  [/\bcrash(?:ed|es)?\b|\baccident\b|\bcollision\b/i, 'crash', 'traffic'],
  [/\bhit.and.run\b/i, 'hit_and_run', 'traffic'],
  [/\bpedestrian\b.*(?:struck|hit|killed)/i, 'pedestrian_struck', 'traffic'],
  [/\bbicycl(?:e|ist)\b.*(?:struck|hit|killed)/i, 'cyclist_struck', 'traffic'],
  [/\bdui\b|\bdrunk\s+driv/i, 'dui', 'traffic'],
  [/\brollover\b/i, 'rollover', 'traffic'],
  [/\broad\s+clos(?:ed|ure)\b/i, 'road_closure', 'traffic'],
  
  // Fire/Emergency
  [/\bfire\b/i, 'fire', 'fire'],
  [/\bblaze\b/i, 'fire', 'fire'],
  [/\brescue[ds]?\b/i, 'rescue', 'fire'],
  [/\boverdose\b/i, 'overdose', 'medical'],
  
  // Property Crime
  [/\bburglary\b|\bbreak-?in\b/i, 'burglary', 'property_crime'],
  [/\btheft\b|\bstolen\b|\bsteal/i, 'theft', 'property_crime'],
  [/\bvandal/i, 'vandalism', 'property_crime'],
  [/\bfraud\b|\bscam\b|\bdeception\b/i, 'fraud', 'property_crime'],
  
  // Weather/Natural
  [/\bflood(?:ing|ed)?\b/i, 'flooding', 'weather'],
  [/\bstorm\b|\btornado\b|\bsevere\s+weather\b/i, 'storm', 'weather'],
  [/\bsnow\b|\bblizzard\b|\bice\b.*(?:storm|warning)/i, 'winter_weather', 'weather'],
  [/\bpower\s+outage\b/i, 'power_outage', 'infrastructure'],
  
  // Government/Civic
  [/\bcounty\s+board\b/i, 'county_board', 'civic'],
  [/\bcity\s+council\b/i, 'city_council', 'civic'],
  [/\bschool\s+(?:board|district)\b/i, 'school', 'civic'],
  [/\belection\b|\bvot(?:e|ing|er)\b/i, 'election', 'civic'],
  [/\btax(?:es)?\b.*(?:increase|levy|hike)\b/i, 'taxes', 'civic'],
  [/\bbusiness\b.*(?:open|clos|mov)/i, 'business', 'civic'],
  [/\bdevelop(?:ment|er)\b/i, 'development', 'civic'],
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
  priority: string;
}

function extractCity(text: string): string | null {
  const lower = text.toLowerCase();
  for (const city of [...MCHENRY_CITIES].sort((a, b) => b.length - a.length)) {
    if (lower.includes(city)) {
      return city.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }
  return null;
}

function extractNewsType(text: string): { type: string; category: string } {
  const lower = text.toLowerCase();
  for (const [pattern, type, category] of NEWS_PATTERNS) {
    if (pattern.test(lower)) {
      return { type, category };
    }
  }
  return { type: 'local_news', category: 'other' };
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

function generateHash(title: string, url: string): string {
  return crypto
    .createHash('sha256')
    .update(`nwherald:${url || title}`)
    .digest('hex')
    .slice(0, 16);
}

function mapToSeverity(category: string, priority: string): 'critical' | 'high' | 'medium' | 'low' {
  if (category === 'violent_crime') return 'critical';
  if (category === 'fire') return 'high';
  if (priority === 'high' && ['traffic', 'police'].includes(category)) return 'high';
  if (['traffic', 'property_crime', 'weather'].includes(category)) return 'medium';
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
      
      // Only include McHenry County news
      if (!city) continue;
      
      const { type, category } = extractNewsType(fullText);
      
      items.push({
        title,
        description: description.slice(0, 500),
        url,
        publishedAt: pubDate,
        city,
        newsType: type,
        category,
        contentHash: generateHash(title, url),
        source: feedConfig.source,
        priority: feedConfig.priority,
      });
    }
    
    return items;
  } catch (error) {
    console.error(`[NW Herald] Failed to fetch ${feedConfig.name}:`, error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  // NW Herald RSS feeds are no longer available (Shaw Local removed them)
  // This endpoint is disabled until we find a replacement source
  return NextResponse.json({
    success: false,
    message: 'Northwest Herald RSS feeds no longer available - Shaw Local removed their RSS feeds',
    fetched: 0,
    inserted: 0,
    skipped: 0
  });
    
    const allNews: ParsedNews[] = [];
    for (const feed of RSS_FEEDS) {
      const items = await fetchFeed(feed);
      allNews.push(...items);
      console.log(`[NW Herald] Fetched ${items.length} items from ${feed.name}`);
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
    const hashes = allNews.map(n => `nwherald_${n.contentHash}`);
    const { data: existing } = await supabase
      .from('incidents')
      .select('external_id')
      .in('external_id', hashes);
    
    const existingHashes = new Set(existing?.map(e => e.external_id) || []);
    const newItems = allNews.filter(n => !existingHashes.has(`nwherald_${n.contentHash}`));
    
    console.log(`[NW Herald] ${existingHashes.size} existing, ${newItems.length} new`);
    
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
      external_id: `nwherald_${item.contentHash}`,
      category: item.category,
      severity: mapToSeverity(item.category, item.priority),
      title: item.title,
      description: item.description,
      location_text: item.city,
      municipality: item.city,
      occurred_at: item.publishedAt?.toISOString() || null,
      reported_at: new Date().toISOString(),
      verification_status: 'verified' as const,
      raw_data: {
        url: item.url,
        news_type: item.newsType,
        source: item.source,
        content_hash: item.contentHash,
      },
    }));
    
    const { data, error } = await supabase
      .from('incidents')
      .insert(dbItems)
      .select();
    
    if (error) {
      console.error('[NW Herald] Database error:', error);
      throw error;
    }
    
    const inserted = data?.length || 0;
    console.log(`[NW Herald] Inserted ${inserted} new items`);
    
    return NextResponse.json({
      success: true,
      message: `Ingested ${inserted} new news items`,
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
    console.error('[NW Herald] Error:', error);
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