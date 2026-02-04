/**
 * Scanner Ingestion API Route
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

// Valid DB categories: vehicle_breakin, theft, burglary, robbery, assault, 
// shots_fired, fire, traffic, drugs, fraud, vandalism, missing, suspicious, other
const INCIDENT_PATTERNS: [RegExp, string, string][] = [
  // Violent crime
  [/\bshooting\b|\bshots\s+fired\b/i, 'shooting', 'shots_fired'],
  [/\bstabbing\b/i, 'stabbing', 'assault'],
  [/\bhomicide\b|\bmurder\b/i, 'homicide', 'assault'],
  [/\barmed\s+robbery\b/i, 'armed_robbery', 'robbery'],
  [/\brobbery\b/i, 'robbery', 'robbery'],
  [/\bassault\b|\battack\b/i, 'assault', 'assault'],
  [/\bdomestic\b/i, 'domestic', 'assault'],
  [/\bsexual\s+(?:assault|abuse)/i, 'sexual_assault', 'assault'],
  
  // Property crime
  [/\bburglary\b|\bbreak-in\b|\bbroke\s+into\b/i, 'burglary', 'burglary'],
  [/\btheft\b|\bstolen\b|\bshoplift/i, 'theft', 'theft'],
  [/\bvehicle\s+(?:breakin|break-in)\b|\bcar\s+(?:breakin|break-in)\b/i, 'vehicle_breakin', 'vehicle_breakin'],
  [/\bvandalism\b|\bgraffiti\b/i, 'vandalism', 'vandalism'],
  [/\bfraud\b|\bscam\b/i, 'fraud', 'fraud'],
  
  // Traffic
  [/\bcrash\b|\baccident\b|\bcollision\b/i, 'crash', 'traffic'],
  [/\bhit.and.run\b/i, 'hit_and_run', 'traffic'],
  [/\bpedestrian\b|\bstruck\s+by\b|\bhit\s+by\b/i, 'pedestrian_struck', 'traffic'],
  [/\bdui\b|\bdrunk\s+driv/i, 'dui', 'traffic'],
  [/\brollover\b/i, 'rollover', 'traffic'],
  
  // Fire
  [/\bfire\b|\bblaze\b/i, 'fire', 'fire'],
  
  // Drugs
  [/\boverdose\b/i, 'overdose', 'drugs'],
  [/\bdrug\b|\bnarcotics\b|\bcocaine\b|\bheroin\b|\bfentanyl\b/i, 'drugs', 'drugs'],
  
  // Missing
  [/\bmissing\b/i, 'missing_person', 'missing'],
  
  // Suspicious
  [/\bsuspicious\b/i, 'suspicious', 'suspicious'],
  
  // Court/arrest -> other (news about legal proceedings)
  [/\barrested\b|\bcharged\b|\bguilty\b|\bsentenced\b|\bconvicted\b/i, 'arrest', 'other'],
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
    case 'shots_fired':
    case 'robbery':
    case 'assault':
      return 'critical';
    case 'burglary':
    case 'fire':
      return 'high';
    case 'traffic':
    case 'theft':
    case 'vehicle_breakin':
    case 'drugs':
      return 'medium';
    default:
      return 'low';
  }
}

export async function GET(request: NextRequest) {
  try {
    // Fetch RSS
    const parser = new Parser();
    const feed = await parser.parseURL(RSS_URL);
    
    // Parse incidents
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
    
    if (incidents.length === 0) {
      return NextResponse.json({ success: true, message: 'No McHenry incidents found', fetched: 0, inserted: 0 });
    }
    
    // Check existing
    const supabase = createServerClient();
    const hashes = incidents.map(i => i.contentHash);
    const { data: existing } = await supabase
      .from('incidents')
      .select('external_id')
      .in('external_id', hashes);
    
    const existingHashes = new Set(existing?.map(e => e.external_id) || []);
    const newIncidents = incidents.filter(i => !existingHashes.has(i.contentHash));
    
    if (newIncidents.length === 0) {
      return NextResponse.json({ success: true, message: 'No new incidents', fetched: incidents.length, inserted: 0 });
    }
    
    // Insert
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
    
    const { data, error } = await supabase.from('incidents').insert(dbIncidents).select();
    
    if (error) {
      return NextResponse.json({ success: false, error: error.message, details: error }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      fetched: incidents.length,
      inserted: data?.length || 0,
      sample: newIncidents.slice(0, 3).map(i => ({ title: i.title.slice(0, 50), city: i.city, category: i.category }))
    });
    
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Unknown error' }, { status: 500 });
  }
}

export const POST = GET;