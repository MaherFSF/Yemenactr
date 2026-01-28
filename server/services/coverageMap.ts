/**
 * Coverage Map Service
 * Shows per dataset/indicator: earliest_date, latest_date, missing_ranges, coverage%
 * Filterable by geo + regime_tag, shows top gap drivers per sector.
 */

import { getDb } from '../db';
import { sql } from 'drizzle-orm';
import { calculateCoverage } from './historicalBackfill';

// Coverage entry for a single indicator
export interface IndicatorCoverage {
  indicatorCode: string;
  indicatorName: string;
  sector: string;
  regimeTag: string;
  earliestDate: string | null;
  latestDate: string | null;
  totalDays: number;
  coveredDays: number;
  missingDays: number;
  coveragePercent: number;
  missingRanges: { start: string; end: string; days: number }[];
  lastUpdated: string | null;
  sourceId: string | null;
  sourceName: string | null;
}

// Coverage summary by sector
export interface SectorCoverageSummary {
  sector: string;
  sectorNameAr: string;
  totalIndicators: number;
  avgCoverage: number;
  topGapDrivers: {
    indicatorCode: string;
    indicatorName: string;
    missingDays: number;
    coveragePercent: number;
  }[];
}

// Full coverage map
export interface CoverageMapData {
  generatedAt: Date;
  startDate: Date;
  endDate: Date;
  totalIndicators: number;
  avgCoverage: number;
  indicators: IndicatorCoverage[];
  bySector: SectorCoverageSummary[];
  byRegime: {
    regime: string;
    avgCoverage: number;
    indicatorCount: number;
  }[];
  topGapDrivers: {
    indicatorCode: string;
    indicatorName: string;
    sector: string;
    missingDays: number;
    coveragePercent: number;
  }[];
}

// Sector mapping
const SECTOR_MAP: Record<string, { en: string; ar: string }> = {
  'macro': { en: 'Macroeconomy', ar: 'الاقتصاد الكلي' },
  'banking': { en: 'Banking & Finance', ar: 'البنوك والتمويل' },
  'trade': { en: 'Trade', ar: 'التجارة' },
  'prices': { en: 'Prices & Inflation', ar: 'الأسعار والتضخم' },
  'fx': { en: 'Exchange Rates', ar: 'أسعار الصرف' },
  'fiscal': { en: 'Public Finance', ar: 'المالية العامة' },
  'energy': { en: 'Energy & Fuel', ar: 'الطاقة والوقود' },
  'labor': { en: 'Labor Market', ar: 'سوق العمل' },
  'food': { en: 'Food Security', ar: 'الأمن الغذائي' },
  'humanitarian': { en: 'Humanitarian', ar: 'الإنسانية' },
  'conflict': { en: 'Conflict Economy', ar: 'اقتصاد الصراع' },
  'infrastructure': { en: 'Infrastructure', ar: 'البنية التحتية' },
  'agriculture': { en: 'Agriculture', ar: 'الزراعة' },
  'telecom': { en: 'Telecommunications', ar: 'الاتصالات' },
  'investment': { en: 'Investment', ar: 'الاستثمار' },
};

/**
 * Get coverage for a single indicator
 */
export async function getIndicatorCoverage(
  indicatorCode: string,
  startDate: Date = new Date('2010-01-01'),
  endDate: Date = new Date(),
  regimeTag?: string
): Promise<IndicatorCoverage | null> {
  const db = await getDb();
  if (!db) return null;
  
  // Get indicator metadata
  const [indicators] = await db.execute(sql`
    SELECT code, name, nameAr, sector, sourceId
    FROM indicators
    WHERE code = ${indicatorCode}
    LIMIT 1
  `) as any;
  
  if (!indicators || indicators.length === 0) return null;
  
  const indicator = indicators[0];
  
  // Calculate coverage
  const coverage = await calculateCoverage(
    indicatorCode,
    startDate,
    endDate,
    regimeTag
  );
  
  // Get source name
  let sourceName = null;
  if (indicator.sourceId) {
    const [sources] = await db.execute(sql`
      SELECT name FROM evidence_sources WHERE id = ${indicator.sourceId} LIMIT 1
    `) as any;
    sourceName = sources?.[0]?.name || null;
  }
  
  // Get last updated
  const [lastUpdate] = await db.execute(sql`
    SELECT MAX(updatedAt) as lastUpdated FROM time_series
    WHERE indicatorCode = ${indicatorCode}
  `) as any;
  
  return {
    indicatorCode,
    indicatorName: indicator.name || indicatorCode,
    sector: indicator.sector || 'unknown',
    regimeTag: regimeTag || 'all',
    earliestDate: coverage.earliestDate?.toISOString().split('T')[0] || null,
    latestDate: coverage.latestDate?.toISOString().split('T')[0] || null,
    totalDays: coverage.totalDays,
    coveredDays: coverage.coveredDays,
    missingDays: coverage.missingDays,
    coveragePercent: Math.round(coverage.coveragePercent * 100) / 100,
    missingRanges: coverage.missingRanges.map(r => ({
      start: r.start.toISOString().split('T')[0],
      end: r.end.toISOString().split('T')[0],
      days: Math.ceil((r.end.getTime() - r.start.getTime()) / (24 * 60 * 60 * 1000)) + 1,
    })),
    lastUpdated: lastUpdate?.[0]?.lastUpdated?.toISOString() || null,
    sourceId: indicator.sourceId,
    sourceName,
  };
}

/**
 * Generate full coverage map
 */
export async function generateCoverageMap(
  startDate: Date = new Date('2010-01-01'),
  endDate: Date = new Date(),
  filters?: {
    sector?: string;
    regimeTag?: string;
    minCoverage?: number;
    maxCoverage?: number;
  }
): Promise<CoverageMapData> {
  const db = await getDb();
  if (!db) {
    return {
      generatedAt: new Date(),
      startDate,
      endDate,
      totalIndicators: 0,
      avgCoverage: 0,
      indicators: [],
      bySector: [],
      byRegime: [],
      topGapDrivers: [],
    };
  }
  
  // Get all indicators
  let query = sql`SELECT code, name, nameAr, sector, sourceId FROM indicators`;
  if (filters?.sector) {
    query = sql`SELECT code, name, nameAr, sector, sourceId FROM indicators WHERE sector = ${filters.sector}`;
  }
  
  const [indicators] = await db.execute(query) as any;
  
  // Calculate coverage for each indicator
  const coverageResults: IndicatorCoverage[] = [];
  const regimeTags = filters?.regimeTag ? [filters.regimeTag] : ['IRG', 'DFA', 'unified'];
  
  for (const indicator of indicators || []) {
    for (const regime of regimeTags) {
      const coverage = await getIndicatorCoverage(
        indicator.code,
        startDate,
        endDate,
        regime
      );
      
      if (coverage) {
        // Apply coverage filters
        if (filters?.minCoverage !== undefined && coverage.coveragePercent < filters.minCoverage) continue;
        if (filters?.maxCoverage !== undefined && coverage.coveragePercent > filters.maxCoverage) continue;
        
        coverageResults.push(coverage);
      }
    }
  }
  
  // Calculate sector summaries
  const sectorMap = new Map<string, IndicatorCoverage[]>();
  for (const cov of coverageResults) {
    const sector = cov.sector || 'unknown';
    if (!sectorMap.has(sector)) {
      sectorMap.set(sector, []);
    }
    sectorMap.get(sector)!.push(cov);
  }
  
  const bySector: SectorCoverageSummary[] = Array.from(sectorMap.entries()).map(([sector, indicators]) => {
    const avgCoverage = indicators.reduce((sum, i) => sum + i.coveragePercent, 0) / indicators.length;
    const topGapDrivers = indicators
      .sort((a, b) => a.coveragePercent - b.coveragePercent)
      .slice(0, 5)
      .map(i => ({
        indicatorCode: i.indicatorCode,
        indicatorName: i.indicatorName,
        missingDays: i.missingDays,
        coveragePercent: i.coveragePercent,
      }));
    
    return {
      sector,
      sectorNameAr: SECTOR_MAP[sector]?.ar || sector,
      totalIndicators: indicators.length,
      avgCoverage: Math.round(avgCoverage * 100) / 100,
      topGapDrivers,
    };
  });
  
  // Calculate regime summaries
  const regimeMap = new Map<string, IndicatorCoverage[]>();
  for (const cov of coverageResults) {
    const regime = cov.regimeTag;
    if (!regimeMap.has(regime)) {
      regimeMap.set(regime, []);
    }
    regimeMap.get(regime)!.push(cov);
  }
  
  const byRegime = Array.from(regimeMap.entries()).map(([regime, indicators]) => ({
    regime,
    avgCoverage: Math.round((indicators.reduce((sum, i) => sum + i.coveragePercent, 0) / indicators.length) * 100) / 100,
    indicatorCount: indicators.length,
  }));
  
  // Get top gap drivers overall
  const topGapDrivers = coverageResults
    .sort((a, b) => a.coveragePercent - b.coveragePercent)
    .slice(0, 10)
    .map(i => ({
      indicatorCode: i.indicatorCode,
      indicatorName: i.indicatorName,
      sector: i.sector,
      missingDays: i.missingDays,
      coveragePercent: i.coveragePercent,
    }));
  
  // Calculate overall average
  const avgCoverage = coverageResults.length > 0
    ? Math.round((coverageResults.reduce((sum, i) => sum + i.coveragePercent, 0) / coverageResults.length) * 100) / 100
    : 0;
  
  return {
    generatedAt: new Date(),
    startDate,
    endDate,
    totalIndicators: coverageResults.length,
    avgCoverage,
    indicators: coverageResults,
    bySector: bySector.sort((a, b) => a.avgCoverage - b.avgCoverage),
    byRegime,
    topGapDrivers,
  };
}

/**
 * Get quick coverage stats
 */
export async function getQuickCoverageStats(): Promise<{
  totalIndicators: number;
  avgCoverage: number;
  criticalGaps: number;
  lastUpdated: string;
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalIndicators: 0,
      avgCoverage: 0,
      criticalGaps: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
  
  // Count indicators
  const [indicatorCount] = await db.execute(sql`
    SELECT COUNT(*) as count FROM indicators
  `) as any;
  
  // Count time series records
  const [tsStats] = await db.execute(sql`
    SELECT 
      COUNT(DISTINCT indicatorCode) as covered,
      MAX(updatedAt) as lastUpdated
    FROM time_series
  `) as any;
  
  // Count indicators with <50% coverage (critical gaps)
  const [gapCount] = await db.execute(sql`
    SELECT COUNT(*) as count FROM (
      SELECT indicatorCode, COUNT(*) as records
      FROM time_series
      GROUP BY indicatorCode
      HAVING records < 1000
    ) as gaps
  `) as any;
  
  const total = indicatorCount?.[0]?.count || 0;
  const covered = tsStats?.[0]?.covered || 0;
  
  return {
    totalIndicators: total,
    avgCoverage: total > 0 ? Math.round((covered / total) * 100) : 0,
    criticalGaps: gapCount?.[0]?.count || 0,
    lastUpdated: tsStats?.[0]?.lastUpdated?.toISOString() || new Date().toISOString(),
  };
}
