/**
 * Scanner Ingestion API Route
 * 
 * Fetches incidents from Lake McHenry Scanner RSS feed and stores in Supabase.
 * 
 * Triggered by:
 * - Vercel Cron (automatic, every hour)
 * - Manual GET request to /api/ingest/scanner
 * 
 * Set CRON_SECRET in environment to secure the endpoint.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import Parser from 'rss-parser';
import crypto from 'crypto';

// RSS Feed URL
const RSS_URL = 'https://www.lakemchenryscanner.com/feed/';

// McHenry County cities for filtering
const MCHENRY_CITIES = [
  'crystal lake', 'mchenry', 'woodstock', 'cary', 'algonquin',
  'lake in the hills', 'huntley', 'harvard', 'marengo', 'fox river grove',
  'island lake', 'johnsburg', 'lakewood', 'spring grove', 'wonder lake',
  'ringwood', 'union', 'hebron', 'richmond', 'bull valley', 'nunda',
  'oakwood hills', 'round lake', 'grayslake'
];

// Incident type patterns
const INCIDENT_PATTERNS: [RegExp, string, string][] = [
  // Violent crime
  [/\barmed\s+robbery\b/i, 'armed_robbery', 'violent_crime'],
  [/\bshooting\b/i, 'shooting', 'violent_crime'],
  [/\bstabbing\b/i, 'stabbing', 'violent_crime'],
  [/\bhomicide\b|\bmurder\b/i, 'homicide', 'violent_crime'],
  [/\brobbery\b/i, 'robbery', 'violent_crime'],
  [/\bassault\b/i, 'assault', 'violent_crime'],
  [/\bdomestic\b/i, 'domestic', 'violent_crime'],
  [/\bsexual\s+(?:assault|abuse)/i, 'sexual_assault', 'violent_crime'],
  
  // Traffic
  [/\bcrash\b|\baccident\b|\bcollision\b/i, 'crash', 'traffic'],
  [/\bhit.and.run\b/i, 'hit_and_run', 'traffic'],
  [/\bpedestrian\b|\bstruck\s+by\b|\bhit\s+by\b/i, 'pedestrian_struck', 'traffic'],
  [/\bdui\b|\bdrunk\s+driv/i, 'dui', 'traffic'],
  [/\brollover\b/i, 'rollover', 'traffic'],
  
  // Fire
  [/\bstructure\s+fire\b|\bhouse\s+fire\b|\bbuilding\s+fire\b/i, 'structure_fire', 'fire'],
  [/\bblaze\b/i, 'fire', 'fire'],
  
  // Property crime
  [/\bburglary\b|\bbreak-in\b/i, 'burglary', 'property_crime'],
  [/\btheft\b|\bstolen\b/i, 'theft', 'property_crime'],
  [/\bvandalism\b/i, 'vandalism', 'property_crime'],
  
  // Other
  [/\bmissing\b/i, 'missing_person', 'missing'],
  [/\boverdose\b/i, 'overdose', 'medical'],
  [/\barrested\b|\bcharged\b/i, 'arrest', 'police'],
];

interface ParsedIncident {
  title: string;
  description: string;
  url: string;
  publishedAt: Date | null;
  city: string | null;
  incidentType: string;
  category: string;
  contentHash: string;
}

function extractCity(text: string): string | null {
  const lower = text.toLowerCase();
  // Sort by length to match "lake in the hills" before "lake"
  for (const city of [...MCHENRY_CITIES].sort((a, b) => b.length - a.length)) {
    if (lower.includes(city)) {
      return city.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }
  return null;
}

function extractIncidentType(text: string): { type: string; category: string } {
  const lower = text.toLowerCase();
  for (const [pattern, type, category] of INCIDENT_PATTERNS) {
    if (pattern.test(lower)) {
      return { type, category };
    }
  }
  return { type: 'other', category: 'other' };
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

function generateHash(title: string, description: string): string {
  return crypto
    .createHash('sha256')
    .update(`${title}:${description.slice(0, 100)}`)
    .digest('hex')
    .slice(0, 16);
}

async function fetchAndParseRss(): Promise<ParsedIncident[]> {
  const parser = new Parser();
  const feed = await parser.parseURL(RSS_URL);
  
  const incidents: ParsedIncident[] = [];
  
  for (const item of feed.items) {
    const title = item.title || '';
    const description = cleanHtml(item.contentSnippet || item.content || '');
    const url = item.link || '';
    const pubDate = item.pubDate ? new Date(item.pubDate) : null;
    
    const fullText = `${title} ${description}`;
    const city = extractCity(fullText);
    
    // Only include if it's in McHenry County
    if (!city) continue;
    
    const { type, category } = extractIncidentType(fullText);
    
    incidents.push({
      title,
      description,
      url,
      publishedAt: pubDate,
      city,
      incidentType: type,
      category,
      contentHash: generateHash(title, description),
    });
  }
  
  return incidents;
}

function mapToSeverity(category: string): 'critical' | 'high' | 'medium' | 'low' {
  switch (category) {
    case 'violent_crime': return 'critical';
    case 'fire': return 'high';
    case 'traffic': return 'medium';
    case 'property_crime': return 'medium';
    default: return 'low';
  }
}

export async function GET(request: NextRequest) {
  // Verify cron secret if set (for security)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Allow manual calls without secret in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  
  try {
    console.log('[Scanner Ingest] Starting fetch...');
    
    // Fetch incidents from RSS
    const incidents = await fetchAndParseRss();
    console.log(`[Scanner Ingest] Parsed ${incidents.length} incidents from RSS`);
    
    if (incidents.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No incidents found in RSS feed',
        fetched: 0,
        inserted: 0,
      });
    }
    
    // Store in Supabase
    const supabase = createServerClient();
    
    // Check which incidents already exist (by content hash)
    const hashes = incidents.map(i => i.contentHash);
    const { data: existing } = await supabase
      .from('incidents')
      .select('external_id')
      .in('external_id', hashes);
    
    const existingHashes = new Set(existing?.map(e => e.external_id) || []);
    const newIncidents = incidents.filter(i => !existingHashes.has(i.contentHash));
    
    console.log(`[Scanner Ingest] ${existingHashes.size} existing, ${newIncidents.length} new`);
    
    if (newIncidents.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new incidents to insert',
        fetched: incidents.length,
        inserted: 0,
        skipped: incidents.length,
      });
    }
    
    // Map to database format
    const dbIncidents = newIncidents.map(inc => ({
      external_id: inc.contentHash,
      category: inc.category,
      severity: mapToSeverity(inc.category),
      title: inc.title,
      description: inc.description,
      location_text: inc.city,
      municipality: inc.city,
      occurred_at: inc.publishedAt?.toISOString() || null,
      reported_at: new Date().toISOString(),
      verification_status: 'unverified' as const,
      raw_data: {
        url: inc.url,
        incident_type: inc.incidentType,
        content_hash: inc.contentHash,
        source: 'lake_mchenry_scanner',
      },
    }));
    
    // Insert new incidents
    const { data, error } = await supabase
      .from('incidents')
      .insert(dbIncidents)
      .select();
    
    if (error) {
      console.error('[Scanner Ingest] Database error:', error);
      throw error;
    }
    
    const inserted = data?.length || 0;
    console.log(`[Scanner Ingest] Inserted ${inserted} new incidents`);
    
    return NextResponse.json({
      success: true,
      message: `Ingested ${inserted} new incidents`,
      fetched: incidents.length,
      inserted,
      skipped: incidents.length - newIncidents.length,
      sample: newIncidents.slice(0, 3).map(i => ({
        title: i.title.slice(0, 60),
        city: i.city,
        type: i.incidentType,
      })),
    });
    
  } catch (error) {
    console.error('[Scanner Ingest] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export const POST = GET;
