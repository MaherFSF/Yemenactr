/**
 * Sector Data Service
 * Fetches real economic data from the database to provide context for AI agents
 */

import { getDb } from '../db';
import { sql } from 'drizzle-orm';

export interface SectorDataContext {
  sectorName: string;
  indicators: Array<{
    code: string;
    name: string;
    nameAr: string;
    unit: string;
    latestValue: number | null;
    latestDate: string | null;
    previousValue: number | null;
    previousDate: string | null;
    changePercent: number | null;
    trend: 'up' | 'down' | 'stable';
    historicalData: Array<{ year: number; value: number }>;
  }>;
  summary: string;
  dataPoints: number;
  dateRange: { from: string; to: string };
}

// Map sector IDs to their database sector codes
const SECTOR_MAPPING: Record<string, string[]> = {
  banking: ['banking'],
  trade: ['trade'],
  energy: ['energy'],
  humanitarian: ['humanitarian'],
  labor: ['labor', 'labor_wages'],
  macroeconomy: ['macroeconomy', 'macro'],
  prices: ['prices'],
  currency: ['currency'],
  public_finance: ['public_finance', 'fiscal'],
  food_security: ['food_security'],
  poverty: ['poverty'],
  infrastructure: ['infrastructure'],
  conflict: ['conflict'],
  agriculture: ['food_security'],
};

export async function getSectorDataContext(sectorId: string): Promise<SectorDataContext | null> {
  const db = await getDb();
  if (!db) return null;

  const sectorCodes = SECTOR_MAPPING[sectorId] || [sectorId];
  
  try {
    // Get all indicators for this sector
    const placeholders = sectorCodes.map(() => '?').join(',');
    const [indicatorRows] = await db.execute(
      sql`SELECT code, nameEn, nameAr, unit, frequency FROM indicators WHERE sector IN (${sql.raw(sectorCodes.map(s => `'${s}'`).join(','))}) AND isActive = 1`
    );
    const indicators = indicatorRows as unknown as any[];

    if (indicators.length === 0) {
      return {
        sectorName: sectorId,
        indicators: [],
        summary: `No indicators found for sector ${sectorId}`,
        dataPoints: 0,
        dateRange: { from: 'N/A', to: 'N/A' },
      };
    }

    const enrichedIndicators: SectorDataContext['indicators'] = [];
    let totalDataPoints = 0;
    let minDate = '2099-01-01';
    let maxDate = '1900-01-01';

    for (const ind of indicators) {
      // Get historical data
    const [histRows] = await db.execute(
      sql`SELECT YEAR(date) as year, value FROM time_series 
            WHERE indicatorCode = ${ind.code} 
            ORDER BY date ASC`
    );
    const historical = (histRows as unknown as any[]).map(r => ({
        year: r.year,
        value: parseFloat(r.value),
      }));

      // Get latest value
      const [latestRows] = await db.execute(
        sql`SELECT value, date FROM time_series 
            WHERE indicatorCode = ${ind.code}
            ORDER BY date DESC LIMIT 2`
      );
      const latest = (latestRows as unknown as any[]);

      const latestValue = latest[0] ? parseFloat(latest[0].value) : null;
      const latestDate = latest[0] ? new Date(latest[0].date).toISOString().split('T')[0] : null;
      const previousValue = latest[1] ? parseFloat(latest[1].value) : null;
      const previousDate = latest[1] ? new Date(latest[1].date).toISOString().split('T')[0] : null;
      
      let changePercent: number | null = null;
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (latestValue !== null && previousValue !== null && previousValue !== 0) {
        changePercent = ((latestValue - previousValue) / Math.abs(previousValue)) * 100;
        trend = changePercent > 1 ? 'up' : changePercent < -1 ? 'down' : 'stable';
      }

      totalDataPoints += historical.length;
      if (latestDate && latestDate < minDate) minDate = latestDate;
      if (latestDate && latestDate > maxDate) maxDate = latestDate;

      enrichedIndicators.push({
        code: ind.code,
        name: ind.nameEn,
        nameAr: ind.nameAr,
        unit: ind.unit,
        latestValue,
        latestDate,
        previousValue,
        previousDate,
        changePercent: changePercent ? Math.round(changePercent * 10) / 10 : null,
        trend,
        historicalData: historical,
      });
    }

    // Generate summary
    const summary = generateSectorSummary(sectorId, enrichedIndicators);

    return {
      sectorName: sectorId,
      indicators: enrichedIndicators,
      summary,
      dataPoints: totalDataPoints,
      dateRange: { from: minDate, to: maxDate },
    };
  } catch (error) {
    console.error(`[SectorData] Error fetching data for ${sectorId}:`, error);
    return null;
  }
}

function generateSectorSummary(sectorId: string, indicators: SectorDataContext['indicators']): string {
  const parts: string[] = [];
  
  parts.push(`The ${sectorId} sector has ${indicators.length} tracked indicators with real data.`);
  
  for (const ind of indicators.slice(0, 10)) {
    if (ind.latestValue !== null) {
      const changeStr = ind.changePercent !== null 
        ? ` (${ind.changePercent > 0 ? '+' : ''}${ind.changePercent}% change)`
        : '';
      parts.push(`${ind.name}: ${ind.latestValue.toLocaleString()} ${ind.unit} as of ${ind.latestDate}${changeStr}`);
    }
  }

  return parts.join('\n');
}

// Map sector IDs to research categories for publication lookup
const SECTOR_RESEARCH_MAPPING: Record<string, string[]> = {
  banking: ['banking_sector', 'monetary_policy', 'sanctions_compliance'],
  trade: ['trade_external'],
  energy: ['energy_infrastructure'],
  humanitarian: ['humanitarian_finance', 'poverty_development'],
  labor: ['labor_market'],
  macroeconomy: ['macroeconomic_analysis', 'fiscal_policy'],
  prices: ['monetary_policy', 'macroeconomic_analysis'],
  currency: ['monetary_policy', 'banking_sector'],
  public_finance: ['fiscal_policy', 'macroeconomic_analysis'],
  food_security: ['food_security'],
  poverty: ['poverty_development'],
  infrastructure: ['energy_infrastructure'],
  conflict: ['conflict_economics'],
  agriculture: ['food_security'],
};

export interface ResearchContext {
  totalPublications: number;
  recentPublications: Array<{
    title: string;
    year: number;
    type: string;
    category: string;
    sourceUrl: string;
  }>;
  yearDistribution: Record<number, number>;
  topCategories: Array<{ category: string; count: number }>;
}

export async function getSectorResearchContext(sectorId: string): Promise<ResearchContext | null> {
  const db = await getDb();
  if (!db) return null;

  const categories = SECTOR_RESEARCH_MAPPING[sectorId] || ['macroeconomic_analysis'];
  const catFilter = categories.map(c => `'${c}'`).join(',');

  try {
    // Get total count
    const [countRows] = await db.execute(
      sql`SELECT COUNT(*) as cnt FROM research_publications WHERE researchCategory IN (${sql.raw(catFilter)})`
    );
    const totalPublications = (countRows as unknown as any[])[0]?.cnt || 0;

    // Get recent publications (last 20)
    const [recentRows] = await db.execute(
      sql`SELECT title, publicationYear, publicationType, researchCategory, sourceUrl 
          FROM research_publications 
          WHERE researchCategory IN (${sql.raw(catFilter)})
          ORDER BY publicationYear DESC, publicationDate DESC 
          LIMIT 20`
    );
    const recentPublications = (recentRows as unknown as any[]).map(r => ({
      title: r.title,
      year: r.publicationYear,
      type: r.publicationType,
      category: r.researchCategory,
      sourceUrl: r.sourceUrl || '',
    }));

    // Year distribution
    const [yearRows] = await db.execute(
      sql`SELECT publicationYear as yr, COUNT(*) as cnt 
          FROM research_publications 
          WHERE researchCategory IN (${sql.raw(catFilter)}) AND publicationYear >= 2010
          GROUP BY publicationYear ORDER BY publicationYear`
    );
    const yearDistribution: Record<number, number> = {};
    for (const r of (yearRows as unknown as any[])) {
      yearDistribution[r.yr] = r.cnt;
    }

    // Top categories
    const [catRows] = await db.execute(
      sql`SELECT researchCategory as cat, COUNT(*) as cnt 
          FROM research_publications 
          WHERE researchCategory IN (${sql.raw(catFilter)})
          GROUP BY researchCategory ORDER BY cnt DESC`
    );
    const topCategories = (catRows as unknown as any[]).map(r => ({
      category: r.cat,
      count: r.cnt,
    }));

    return { totalPublications, recentPublications, yearDistribution, topCategories };
  } catch (error) {
    console.error(`[SectorData] Error fetching research for ${sectorId}:`, error);
    return null;
  }
}

export async function getFullSectorBriefing(sectorId: string): Promise<string> {
  const dataContext = await getSectorDataContext(sectorId);
  const researchContext = await getSectorResearchContext(sectorId);

  const parts: string[] = [];

  if (dataContext) {
    parts.push('=== REAL-TIME DATA ===');
    parts.push(dataContext.summary);
    parts.push(`Data coverage: ${dataContext.dataPoints} data points from ${dataContext.dateRange.from} to ${dataContext.dateRange.to}`);
  }

  if (researchContext && researchContext.totalPublications > 0) {
    parts.push('\n=== RESEARCH LIBRARY ===');
    parts.push(`${researchContext.totalPublications} academic publications and reports available.`);
    parts.push('Recent key publications:');
    for (const pub of researchContext.recentPublications.slice(0, 10)) {
      parts.push(`- [${pub.year}] ${pub.title} (${pub.type})`);
    }
  }

  return parts.join('\n');
}

export async function getAllSectorsSummary(): Promise<Record<string, string>> {
  const summaries: Record<string, string> = {};
  
  for (const sectorId of Object.keys(SECTOR_MAPPING)) {
    const context = await getSectorDataContext(sectorId);
    if (context) {
      summaries[sectorId] = context.summary;
    }
  }
  
  return summaries;
}
