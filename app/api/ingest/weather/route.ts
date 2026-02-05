// app/api/ingest/weather/route.ts
/**
 * NWS Weather Alerts Ingestion
 * 
 * Fetches weather alerts from National Weather Service API
 * Free, no API key required
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import crypto from 'crypto';

// McHenry County, IL zone codes
// ILZ004 = McHenry County
const NWS_ZONES = ['ILZ004'];
const NWS_API = 'https://api.weather.gov/alerts/active';

interface NWSAlert {
  id: string;
  properties: {
    id: string;
    event: string;
    headline: string;
    description: string;
    severity: string;
    certainty: string;
    urgency: string;
    effective: string;
    expires: string;
    senderName: string;
    areaDesc: string;
  };
}

function generateHash(id: string): string {
  return crypto
    .createHash('sha256')
    .update(`nws:${id}`)
    .digest('hex')
    .slice(0, 16);
}

function mapSeverity(nwsSeverity: string): 'critical' | 'high' | 'medium' | 'low' {
  switch (nwsSeverity?.toLowerCase()) {
    case 'extreme':
      return 'critical';
    case 'severe':
      return 'high';
    case 'moderate':
      return 'medium';
    default:
      return 'low';
  }
}

function mapToCategory(event: string): string {
  const lower = event.toLowerCase();
  // Weather events that could affect safety/traffic
  if (lower.includes('tornado') || lower.includes('thunderstorm')) return 'other';
  if (lower.includes('flood') || lower.includes('flash')) return 'traffic';
  if (lower.includes('winter') || lower.includes('snow') || lower.includes('ice')) return 'traffic';
  if (lower.includes('wind')) return 'other';
  if (lower.includes('heat') || lower.includes('cold')) return 'other';
  return 'other';
}

export async function GET(request: NextRequest) {
  try {
    // Fetch alerts for McHenry County zone
    const url = `${NWS_API}?zone=${NWS_ZONES.join(',')}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/geo+json',
        'User-Agent': '(Raven Local Intelligence, contact@tryraven.io)'
      }
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `NWS API returned ${response.status}`
      }, { status: 500 });
    }

    const data = await response.json();
    const alerts: NWSAlert[] = data.features || [];

    if (alerts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active weather alerts for McHenry County',
        alerts: 0,
        inserted: 0
      });
    }

    // Check existing
    const supabase = createServerClient();
    const hashes = alerts.map(a => generateHash(a.properties.id));
    
    const { data: existing } = await supabase
      .from('incidents')
      .select('external_id')
      .in('external_id', hashes);

    const existingHashes = new Set(existing?.map(e => e.external_id) || []);
    const newAlerts = alerts.filter(a => 
      !existingHashes.has(generateHash(a.properties.id))
    );

    if (newAlerts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new weather alerts',
        alerts: alerts.length,
        inserted: 0
      });
    }

    // Insert new alerts
    const dbRecords = newAlerts.map(a => ({
      external_id: generateHash(a.properties.id),
      category: mapToCategory(a.properties.event),
      severity: mapSeverity(a.properties.severity),
      title: a.properties.headline || a.properties.event,
      description: a.properties.description?.slice(0, 2000) || '',
      location_text: a.properties.areaDesc || 'McHenry County',
      municipality: 'McHenry County',
      occurred_at: a.properties.effective,
      reported_at: new Date().toISOString(),
      verification_status: 'verified' as const,
      raw_data: {
        source: 'nws',
        nws_id: a.properties.id,
        event: a.properties.event,
        severity: a.properties.severity,
        certainty: a.properties.certainty,
        urgency: a.properties.urgency,
        expires: a.properties.expires,
        sender: a.properties.senderName
      }
    }));

    const { data: inserted, error } = await supabase
      .from('incidents')
      .insert(dbRecords)
      .select();

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      alerts: alerts.length,
      inserted: inserted?.length || 0,
      sample: newAlerts.slice(0, 3).map(a => ({
        event: a.properties.event,
        headline: a.properties.headline?.slice(0, 60)
      }))
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}

export const POST = GET;
