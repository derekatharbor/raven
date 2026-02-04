/**
 * Scanner Ingestion API Route - Debug Version
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import Parser from 'rss-parser';
import crypto from 'crypto';

const RSS_URL = 'https://www.lakemchenryscanner.com/feed/';

const MCHENRY_CITIES = [
  'crystal lake', 'mchenry', 'woodstock', 'cary', 'algonquin',
  'lake in the hills', 'huntley', 'harvard', 'marengo', 'fox river grove',
  'island lake', 'johnsburg', 'lakewood', 'spring grove', 'wonder lake',
  'ringwood', 'union', 'hebron', 'richmond', 'bull valley', 'nunda',
  'oakwood hills', 'round lake', 'grayslake'
];

const INCIDENT_PATTERNS: [RegExp, string, string][] = [
  [/\barmed\s+robbery\b/i, 'armed_robbery', 'violent_crime'],
  [/\bshooting\b/i, 'shooting', 'violent_crime'],
  [/\bstabbing\b/i, 'stabbing', 'violent_crime'],
  [/\bhomicide\b|\bmurder\b/i, 'homicide', 'violent_crime'],
  [/\brobbery\b/i, 'robbery', 'violent_crime'],
  [/\bassault\b/i, 'assault', 'violent_crime'],
  [/\bdomestic\b/i, 'domestic', 'violent_crime'],
  [/\bsexual\s+(?:assault|abuse)/i, 'sexual_assault', 'violent_crime'],
  [/\bcrash\b|\baccident\b|\bcollision\b/i, 'crash', 'traffic'],
  [/\bhit.and.run\b/i, 'hit_and_run', 'traffic'],
  [/\bpedestrian\b|\bstruck\s+by\b|\bhit\s+by\b/i, 'pedestrian_struck', 'traffic'],
  [/\bdui\b|\bdrunk\s+driv/i, 'dui', 'traffic'],
  [/\brollover\b/i, 'rollover', 'traffic'],
  [/\bstructure\s+fire\b|\bhouse\s+fire\b|\bbuilding\s+fire\b/i, 'structure_fire', 'fire'],
  [/\bblaze\b/i, 'fire', 'fire'],
  [/\bburglary\b|\bbreak-in\b/i, 'burglary', 'property_crime'],
  [/\btheft\b|\bstolen\b/i, 'theft', 'property_crime'],
  [/\bvandalism\b/i, 'vandalism', 'property_crime'],
  [/\bmissing\b/i, 'missing_person', 'missing'],
  [/\boverdose\b/i, 'overdose', 'medical'],
  [/\barrested\b|\bcharged\b/i, 'arrest', 'police'],
];

function extractCity(text: string): string | null {
  const lower = text.toLowerCase();
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
  const debug: string[] = [];
  
  try {
    debug.push('Starting...');
    
    // Step 1: Fetch RSS
    debug.push('Fetching RSS...');
    const parser = new Parser();
    let feed;
    try {
      feed = await parser.parseURL(RSS_URL);
      debug.push(`RSS fetched: ${feed.items?.length || 0} items`);
    } catch (rssError: any) {
      return NextResponse.json({
        success: false,
        error: 'RSS fetch failed',
        rssError: rssError?.message || String(rssError),
        debug
      }, { status: 500 });
    }
    
    // Step 2: Parse incidents
    debug.push('Parsing incidents...');
    const incidents = [];
    for (const item of feed.items || []) {
      const title = item.title || '';
      const description = cleanHtml(item.contentSnippet || item.content || '');
      const url = item.link || '';
      const pubDate = item.pubDate ? new Date(item.pubDate) : null;
      const fullText = `${title} ${description}`;
      const city = extractCity(fullText);
      
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
    debug.push(`Parsed ${incidents.length} McHenry County incidents`);
    
    if (incidents.length === 0) {
      return NextResponse.json({ success: true, message: 'No McHenry incidents found', debug });
    }
    
    // Step 3: Create Supabase client
    debug.push('Creating Supabase client...');
    let supabase;
    try {
      supabase = createServerClient();
      debug.push('Supabase client created');
    } catch (sbError: any) {
      return NextResponse.json({
        success: false,
        error: 'Supabase client failed',
        sbError: sbError?.message || String(sbError),
        debug
      }, { status: 500 });
    }
    
    // Step 4: Check existing
    debug.push('Checking existing incidents...');
    const hashes = incidents.map(i => i.contentHash);
    const { data: existing, error: selectError } = await supabase
      .from('incidents')
      .select('external_id')
      .in('external_id', hashes);
    
    if (selectError) {
      return NextResponse.json({
        success: false,
        error: 'Select query failed',
        selectError,
        debug
      }, { status: 500 });
    }
    
    const existingHashes = new Set(existing?.map(e => e.external_id) || []);
    const newIncidents = incidents.filter(i => !existingHashes.has(i.contentHash));
    debug.push(`Found ${existingHashes.size} existing, ${newIncidents.length} new`);
    
    if (newIncidents.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new incidents',
        fetched: incidents.length,
        inserted: 0,
        debug
      });
    }
    
    // Step 5: Insert new incidents
    debug.push('Inserting new incidents...');
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
    
    const { data, error: insertError } = await supabase
      .from('incidents')
      .insert(dbIncidents)
      .select();
    
    if (insertError) {
      return NextResponse.json({
        success: false,
        error: 'Insert failed',
        insertError,
        debug,
        sampleData: dbIncidents[0]
      }, { status: 500 });
    }
    
    debug.push(`Inserted ${data?.length || 0} incidents`);
    
    return NextResponse.json({
      success: true,
      fetched: incidents.length,
      inserted: data?.length || 0,
      debug
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || 'Unknown error',
      stack: error?.stack,
      debug
    }, { status: 500 });
  }
}

export const POST = GET;