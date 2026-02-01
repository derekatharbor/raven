/**
 * Stability Score API
 * 
 * Calculates a 0-100 stability score for a location based on:
 * - Safety (40%): Incident frequency and severity
 * - Infrastructure (30%): Active disruptions (coming soon)
 * - Civic (30%): Permit/zoning activity (coming soon)
 * 
 * Methodology is intentionally transparent and documented.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Severity weights - how much each incident type impacts the score
const SEVERITY_WEIGHTS: Record<string, number> = {
  // Critical - violent/dangerous
  shots_fired: 15,
  robbery: 15,
  assault: 12,
  
  // High - serious but less immediate danger
  fire: 10,
  missing: 8,
  burglary: 8,
  
  // Medium - property/traffic
  theft: 5,
  vehicle_breakin: 5,
  traffic: 4,
  drugs: 4,
  
  // Low - minor
  vandalism: 2,
  fraud: 2,
  suspicious: 1,
  other: 1,
};

// Category weights for final score
const CATEGORY_WEIGHTS = {
  safety: 0.4,
  infrastructure: 0.3,
  civic: 0.3,
};

interface CategoryScore {
  score: number;
  maxScore: number;
  incidents: number;
  trend: 'improving' | 'stable' | 'declining';
  trendPercent: number;
  dataAvailable: boolean;
  breakdown: { type: string; count: number; impact: number }[];
}

interface StabilityScoreResponse {
  overall: number;
  confidence: 'high' | 'medium' | 'low';
  
  categories: {
    safety: CategoryScore;
    infrastructure: CategoryScore;
    civic: CategoryScore;
  };
  
  metadata: {
    calculatedAt: string;
    municipality: string;
    periodDays: number;
    sourcesActive: number;
    sourcesTotal: number;
    methodology: string;
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const municipality = searchParams.get('municipality') || 'Crystal Lake';
  const days = parseInt(searchParams.get('days') || '7');
  
  try {
    const supabase = createServerClient();
    
    // Calculate date threshold
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    
    const prevPeriodStart = new Date(dateThreshold);
    prevPeriodStart.setDate(prevPeriodStart.getDate() - days);
    
    // Fetch current period incidents
    const { data: currentIncidents, error } = await supabase
      .from('incidents')
      .select('category, severity, municipality, occurred_at')
      .gte('occurred_at', dateThreshold.toISOString())
      .eq('municipality', municipality);
    
    if (error) throw error;
    
    // Fetch previous period for trend
    const { data: prevIncidents } = await supabase
      .from('incidents')
      .select('category, severity')
      .gte('occurred_at', prevPeriodStart.toISOString())
      .lt('occurred_at', dateThreshold.toISOString())
      .eq('municipality', municipality);
    
    // Calculate Safety Score
    const safetyScore = calculateSafetyScore(currentIncidents || [], prevIncidents || []);
    
    // Infrastructure & Civic (placeholder until data sources added)
    const infrastructureScore: CategoryScore = {
      score: 75, // Static placeholder
      maxScore: 100,
      incidents: 0,
      trend: 'stable',
      trendPercent: 0,
      dataAvailable: false,
      breakdown: [],
    };
    
    const civicScore: CategoryScore = {
      score: 85, // Static placeholder
      maxScore: 100,
      incidents: 0,
      trend: 'stable',
      trendPercent: 0,
      dataAvailable: false,
      breakdown: [],
    };
    
    // Calculate overall score
    const overall = Math.round(
      (safetyScore.score * CATEGORY_WEIGHTS.safety) +
      (infrastructureScore.score * CATEGORY_WEIGHTS.infrastructure) +
      (civicScore.score * CATEGORY_WEIGHTS.civic)
    );
    
    // Determine confidence based on data availability
    const sourcesActive = [safetyScore.dataAvailable, infrastructureScore.dataAvailable, civicScore.dataAvailable]
      .filter(Boolean).length;
    const confidence = sourcesActive >= 3 ? 'high' : sourcesActive >= 2 ? 'medium' : 'low';
    
    const response: StabilityScoreResponse = {
      overall,
      confidence,
      categories: {
        safety: safetyScore,
        infrastructure: infrastructureScore,
        civic: civicScore,
      },
      metadata: {
        calculatedAt: new Date().toISOString(),
        municipality,
        periodDays: days,
        sourcesActive: 1, // Only scanner for now
        sourcesTotal: 4,
        methodology: '/about/methodology', // Link to public explanation
      },
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Stability score error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate stability score' },
      { status: 500 }
    );
  }
}

function calculateSafetyScore(
  currentIncidents: any[],
  prevIncidents: any[]
): CategoryScore {
  const BASE_SCORE = 100;
  
  // Count incidents by category and calculate impact
  const breakdown: { type: string; count: number; impact: number }[] = [];
  const categoryCounts: Record<string, number> = {};
  
  let totalImpact = 0;
  
  for (const incident of currentIncidents) {
    const category = incident.category || 'other';
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  }
  
  for (const [type, count] of Object.entries(categoryCounts)) {
    const weight = SEVERITY_WEIGHTS[type] || 1;
    const impact = weight * count;
    totalImpact += impact;
    breakdown.push({ type, count, impact });
  }
  
  // Sort breakdown by impact descending
  breakdown.sort((a, b) => b.impact - a.impact);
  
  // Calculate score (floor at 0)
  const score = Math.max(0, BASE_SCORE - totalImpact);
  
  // Calculate trend vs previous period
  const prevCount = prevIncidents.length;
  const currentCount = currentIncidents.length;
  
  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  let trendPercent = 0;
  
  if (prevCount > 0) {
    trendPercent = Math.round(((currentCount - prevCount) / prevCount) * 100);
    
    if (trendPercent <= -10) {
      trend = 'improving';
    } else if (trendPercent >= 10) {
      trend = 'declining';
    }
  }
  
  return {
    score,
    maxScore: BASE_SCORE,
    incidents: currentCount,
    trend,
    trendPercent,
    dataAvailable: true,
    breakdown,
  };
}
