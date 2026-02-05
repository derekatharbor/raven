// app/api/ingest/idot/route.ts
/**
 * IDOT Traffic Events Ingestion
 * 
 * Fetches road closures, construction, and incidents from Illinois DOT
 * GettingAroundIllinois.com API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import crypto from 'crypto';

// McHenry County bounding box (approximate)
const MCHENRY_BOUNDS = {
  minLat: 42.15,
  maxLat: 42.50,
  minLng: -88.70,
  maxLng: -88.10
};

// IDOT GettingAroundIllinois API
const IDOT_API = 'https://www.gettingaroundillinois.com/api/v1.0/events';

interface IDOTEvent {
  id: string;
  eventType: string;
  description: string;
  primaryRoad: string;
  direction: string;
  startLocation: string;
  endLocation: string;
  latitude: number;
  longitude: number;
  startTime: string;
  endTime: string | null;
  lastUpdated: string;
}

function isInMcHenryCounty(lat: number, lng: number): boolean {
  return (
    lat >= MCHENRY_BOUNDS.minLat &&
    lat <= MCHENRY_BOUNDS.maxLat &&
    lng >= MCHENRY_BOUNDS.minLng &&
    lng <= MCHENRY_BOUNDS.maxLng
  );
}

function generateHash(id: string, description: string): string {
  return crypto
    .createHash('sha256')
    .update(`idot:${id}:${description?.slice(0, 50) || ''}`)
    .digest('hex')
    .slice(0, 16);
}

export async function GET(request: NextRequest) {
  try {
    // Fetch from IDOT API
    const response = await fetch(IDOT_API, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      // Try alternate endpoint
      const altResponse = await fetch('https://www.gettingaroundillinois.com/api/v1.0/Events', {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!altResponse.ok) {
        return NextResponse.json({
          success: false,
          error: `IDOT API returned ${response.status}`,
          altStatus: altResponse.status
        }, { status: 500 });
      }
    }

    const data = await response.json();
    
    // Handle different response shapes
    const events: IDOTEvent[] = Array.isArray(data) ? data : (data.events || data.Events || []);

    // Filter to McHenry County area
    const mchenryEvents = events.filter(e => {
      const lat = e.latitude || e.Latitude;
      const lng = e.longitude || e.Longitude;
      return lat && lng && isInMcHenryCounty(lat, lng);
    });

    if (mchenryEvents.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No McHenry County traffic events',
        totalEvents: events.length,
        mchenryEvents: 0,
        inserted: 0
      });
    }

    // Check existing
    const supabase = createServerClient();
    const hashes = mchenryEvents.map(e => 
      generateHash(e.id || e.Id, e.description || e.Description)
    );
    
    const { data: existing } = await supabase
      .from('incidents')
      .select('external_id')
      .in('external_id', hashes);

    const existingHashes = new Set(existing?.map(e => e.external_id) || []);
    const newEvents = mchenryEvents.filter(e => 
      !existingHashes.has(generateHash(e.id || e.Id, e.description || e.Description))
    );

    if (newEvents.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new traffic events',
        totalEvents: events.length,
        mchenryEvents: mchenryEvents.length,
        inserted: 0
      });
    }

    // Insert new events
    const dbRecords = newEvents.map(e => {
      const road = e.primaryRoad || e.PrimaryRoad || 'Unknown Road';
      const eventType = e.eventType || e.EventType || 'Traffic Event';
      const desc = e.description || e.Description || '';
      const lat = e.latitude || e.Latitude;
      const lng = e.longitude || e.Longitude;
      
      return {
        external_id: generateHash(e.id || e.Id, desc),
        category: 'traffic',
        severity: eventType.toLowerCase().includes('closure') ? 'high' : 'medium' as const,
        title: `${road}: ${eventType}`,
        description: desc,
        location_text: `${road} - ${e.startLocation || e.StartLocation || ''}`.trim(),
        latitude: lat,
        longitude: lng,
        municipality: 'McHenry County',
        occurred_at: e.startTime || e.StartTime || new Date().toISOString(),
        reported_at: new Date().toISOString(),
        verification_status: 'verified' as const,
        raw_data: {
          source: 'idot',
          idot_id: e.id || e.Id,
          event_type: eventType,
          end_time: e.endTime || e.EndTime,
          last_updated: e.lastUpdated || e.LastUpdated
        }
      };
    });

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
      totalEvents: events.length,
      mchenryEvents: mchenryEvents.length,
      inserted: inserted?.length || 0
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}

export const POST = GET;
