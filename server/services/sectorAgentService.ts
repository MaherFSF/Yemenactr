/**
 * Sector Agent Service
 * Each sector has its own "agent" that maintains context packs, generates briefs,
 * and monitors data quality. This service provides the core functionality.
 */

import { getDb } from "../db";
import { sql } from "drizzle-orm";

// Types for sector agent outputs
export interface SectorIndicator {
  indicatorCode: string;
  nameEn: string;
  nameAr: string;
  currentValue: number | null;
  previousValue: number | null;
  changePercent: number | null;
  confidence: string;
  sourceId: number | null;
  sourceName: string;
  lastUpdated: string;
  regime?: string;
}

export interface SectorEvent {
  eventId: number;
  titleEn: string;
  titleAr: string;
  date: string;
  category: string;
  evidencePackId?: number;
}

export interface SectorDocument {
  documentId: number;
  titleEn: string;
  titleAr: string;
  sourceId: number;
  sourceName: string;
  publishDate: string;
  documentType: string;
}

export interface SectorContradiction {
  indicatorCode: string;
  sources: string[];
  descriptionEn: string;
  descriptionAr: string;
  status: string;
}

export interface SectorGap {
  gapType: string;
  descriptionEn: string;
  descriptionAr: string;
  ticketId?: number;
  priority: string;
}

export interface SectorChange {
  indicatorCode: string;
  changeType: string;
  descriptionEn: string;
  descriptionAr: string;
  previousValue: number | null;
  currentValue: number | null;
  changePercent: number | null;
  evidencePackId?: number;
}

export interface SectorWatchItem {
  itemType: string;
  itemId: string;
  titleEn: string;
  titleAr: string;
  reasonEn: string;
  reasonAr: string;
  importance: string;
}

export interface SectorContextPack {
  sectorCode: string;
  packDate: Date;
  keyIndicators: SectorIndicator[];
  topEvents: SectorEvent[];
  topDocuments: SectorDocument[];
  contradictions: SectorContradiction[];
  gaps: SectorGap[];
  whatChanged: SectorChange[];
  whatToWatch: SectorWatchItem[];
  dataCoveragePercent: number;
  dataFreshnessPercent: number;
  contradictionCount: number;
  gapCount: number;
}

/**
 * Get sector definition from database
 */
export async function getSectorDefinition(sectorCode: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.execute(sql`
    SELECT * FROM sector_definitions WHERE sectorCode = ${sectorCode} AND isActive = 1
  `);
  
  return (result as any)[0]?.[0] || null;
}

/**
 * Get all active sector definitions
 */
export async function getAllSectorDefinitions() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.execute(sql`
    SELECT * FROM sector_definitions WHERE isActive = 1 ORDER BY displayOrder ASC
  `);
  
  return (result as any)[0] || [];
}

/**
 * Get key indicators for a sector from the database
 */
export async function getSectorIndicators(sectorCode: string): Promise<SectorIndicator[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    // Get indicators linked to this sector
    const result = await db.execute(sql`
      SELECT 
        i.indicatorCode,
        i.nameEn,
        i.nameAr,
        ts.value as currentValue,
        ts.date as lastUpdated,
        ts.sourceId,
        s.nameEn as sourceName,
        ts.regime
      FROM indicators i
      LEFT JOIN time_series ts ON i.indicatorCode = ts.indicatorCode
      LEFT JOIN sources s ON ts.sourceId = s.id
      WHERE i.sector = ${sectorCode} AND i.isActive = 1
      ORDER BY ts.date DESC
    `);
    
    const rows = (result as any)[0] || [];
    const indicatorMap = new Map<string, SectorIndicator>();
    
    for (const row of rows) {
      if (!indicatorMap.has(row.indicatorCode)) {
        indicatorMap.set(row.indicatorCode, {
          indicatorCode: row.indicatorCode,
          nameEn: row.nameEn || row.indicatorCode,
          nameAr: row.nameAr || row.nameEn || row.indicatorCode,
          currentValue: row.currentValue ? parseFloat(row.currentValue) : null,
          previousValue: null,
          changePercent: null,
          confidence: 'B',
          sourceId: row.sourceId,
          sourceName: row.sourceName || 'Unknown',
          lastUpdated: row.lastUpdated ? new Date(row.lastUpdated).toISOString() : new Date().toISOString(),
          regime: row.regime
        });
      }
    }
    
    return Array.from(indicatorMap.values());
  } catch (error) {
    console.error(`[SectorAgent] Failed to get indicators for ${sectorCode}:`, error);
    return [];
  }
}

/**
 * Get recent events related to a sector
 */
export async function getSectorEvents(sectorCode: string, limit: number = 10): Promise<SectorEvent[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db.execute(sql`
      SELECT id, titleEn, titleAr, date, category
      FROM economic_events
      WHERE category LIKE ${`%${sectorCode}%`} OR category LIKE '%economic%'
      ORDER BY date DESC
      LIMIT ${limit}
    `);
    
    const rows = (result as any)[0] || [];
    return rows.map((row: any) => ({
      eventId: row.id,
      titleEn: row.titleEn || 'Economic Event',
      titleAr: row.titleAr || row.titleEn || 'حدث اقتصادي',
      date: row.date ? new Date(row.date).toISOString() : new Date().toISOString(),
      category: row.category || sectorCode
    }));
  } catch (error) {
    console.error(`[SectorAgent] Failed to get events for ${sectorCode}:`, error);
    return [];
  }
}

/**
 * Get documents related to a sector
 */
export async function getSectorDocuments(sectorCode: string, limit: number = 10): Promise<SectorDocument[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db.execute(sql`
      SELECT d.id, d.titleEn, d.titleAr, d.sourceId, d.publishDate, d.documentType, s.nameEn as sourceName
      FROM documents d
      LEFT JOIN sources s ON d.sourceId = s.id
      WHERE d.sector = ${sectorCode} OR d.titleEn LIKE ${`%${sectorCode}%`}
      ORDER BY d.publishDate DESC
      LIMIT ${limit}
    `);
    
    const rows = (result as any)[0] || [];
    return rows.map((row: any) => ({
      documentId: row.id,
      titleEn: row.titleEn || 'Document',
      titleAr: row.titleAr || row.titleEn || 'وثيقة',
      sourceId: row.sourceId || 0,
      sourceName: row.sourceName || 'Unknown',
      publishDate: row.publishDate ? new Date(row.publishDate).toISOString() : new Date().toISOString(),
      documentType: row.documentType || 'report'
    }));
  } catch (error) {
    console.error(`[SectorAgent] Failed to get documents for ${sectorCode}:`, error);
    return [];
  }
}

/**
 * Get contradictions for a sector
 */
export async function getSectorContradictions(sectorCode: string): Promise<SectorContradiction[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db.execute(sql`
      SELECT indicatorCode, source1Name, source2Name, descriptionEn, descriptionAr, status
      FROM data_contradictions
      WHERE sectorCode = ${sectorCode} OR indicatorCode LIKE ${`%${sectorCode}%`}
      ORDER BY detectedAt DESC
      LIMIT 20
    `);
    
    const rows = (result as any)[0] || [];
    return rows.map((row: any) => ({
      indicatorCode: row.indicatorCode || 'unknown',
      sources: [row.source1Name, row.source2Name].filter(Boolean),
      descriptionEn: row.descriptionEn || 'Data discrepancy detected',
      descriptionAr: row.descriptionAr || 'تم اكتشاف تناقض في البيانات',
      status: row.status || 'unresolved'
    }));
  } catch (error) {
    console.error(`[SectorAgent] Failed to get contradictions for ${sectorCode}:`, error);
    return [];
  }
}

/**
 * Get data gaps for a sector
 */
export async function getSectorGaps(sectorCode: string): Promise<SectorGap[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db.execute(sql`
      SELECT id, gapType, descriptionEn, descriptionAr, priority
      FROM data_gap_tickets
      WHERE sectorCode = ${sectorCode} AND status = 'open'
      ORDER BY priority DESC, createdAt DESC
      LIMIT 20
    `);
    
    const rows = (result as any)[0] || [];
    return rows.map((row: any) => ({
      gapType: row.gapType || 'missing_data',
      descriptionEn: row.descriptionEn || 'Data gap identified',
      descriptionAr: row.descriptionAr || 'تم تحديد فجوة في البيانات',
      ticketId: row.id,
      priority: row.priority || 'medium'
    }));
  } catch (error) {
    console.error(`[SectorAgent] Failed to get gaps for ${sectorCode}:`, error);
    return [];
  }
}

/**
 * Get sector alerts
 */
export async function getSectorAlerts(sectorCode: string, limit: number = 5) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db.execute(sql`
      SELECT * FROM sector_alerts
      WHERE sectorCode = ${sectorCode} AND status = 'active'
      ORDER BY severity DESC, triggeredAt DESC
      LIMIT ${limit}
    `);
    
    return (result as any)[0] || [];
  } catch (error) {
    console.error(`[SectorAgent] Failed to get alerts for ${sectorCode}:`, error);
    return [];
  }
}

/**
 * Get sector watchlist items
 */
export async function getSectorWatchlist(sectorCode: string, isVip: boolean = false): Promise<SectorWatchItem[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const visibilityFilter = isVip ? sql`1=1` : sql`visibilityLevel = 'public'`;
    
    const result = await db.execute(sql`
      SELECT * FROM sector_watchlist_items
      WHERE sectorCode = ${sectorCode} AND isActive = 1 AND ${visibilityFilter}
      ORDER BY importance DESC, displayOrder ASC
      LIMIT 20
    `);
    
    const rows = (result as any)[0] || [];
    return rows.map((row: any) => ({
      itemType: row.itemType || 'indicator',
      itemId: row.itemId || '',
      titleEn: row.titleEn || 'Watch Item',
      titleAr: row.titleAr || 'عنصر مراقبة',
      reasonEn: row.reasonEn || '',
      reasonAr: row.reasonAr || '',
      importance: row.importance || 'medium'
    }));
  } catch (error) {
    console.error(`[SectorAgent] Failed to get watchlist for ${sectorCode}:`, error);
    return [];
  }
}

/**
 * Calculate data coverage for a sector
 */
export async function calculateSectorCoverage(sectorCode: string): Promise<{ coverage: number; freshness: number }> {
  const db = await getDb();
  if (!db) return { coverage: 0, freshness: 0 };
  
  try {
    // Get coverage from coverage_cells table
    const result = await db.execute(sql`
      SELECT 
        AVG(coverageScore) as avgCoverage,
        AVG(CASE WHEN updatedAt > DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 100 ELSE 0 END) as freshness
      FROM coverage_cells
      WHERE sector = ${sectorCode}
    `);
    
    const row = (result as any)[0]?.[0];
    return {
      coverage: row?.avgCoverage ? parseFloat(row.avgCoverage) : 0,
      freshness: row?.freshness ? parseFloat(row.freshness) : 0
    };
  } catch (error) {
    console.error(`[SectorAgent] Failed to calculate coverage for ${sectorCode}:`, error);
    return { coverage: 0, freshness: 0 };
  }
}

/**
 * Generate a complete context pack for a sector
 */
export async function generateSectorContextPack(sectorCode: string): Promise<SectorContextPack> {
  const [
    indicators,
    events,
    documents,
    contradictions,
    gaps,
    watchlist,
    coverage
  ] = await Promise.all([
    getSectorIndicators(sectorCode),
    getSectorEvents(sectorCode),
    getSectorDocuments(sectorCode),
    getSectorContradictions(sectorCode),
    getSectorGaps(sectorCode),
    getSectorWatchlist(sectorCode),
    calculateSectorCoverage(sectorCode)
  ]);
  
  // Calculate what changed (indicators with significant changes)
  const whatChanged: SectorChange[] = indicators
    .filter(ind => ind.changePercent !== null && Math.abs(ind.changePercent) > 5)
    .map(ind => ({
      indicatorCode: ind.indicatorCode,
      changeType: (ind.changePercent || 0) > 0 ? 'increase' : 'decrease',
      descriptionEn: `${ind.nameEn} changed by ${ind.changePercent?.toFixed(1)}%`,
      descriptionAr: `تغير ${ind.nameAr} بنسبة ${ind.changePercent?.toFixed(1)}%`,
      previousValue: ind.previousValue,
      currentValue: ind.currentValue,
      changePercent: ind.changePercent
    }));
  
  return {
    sectorCode,
    packDate: new Date(),
    keyIndicators: indicators.slice(0, 10),
    topEvents: events.slice(0, 5),
    topDocuments: documents.slice(0, 5),
    contradictions,
    gaps,
    whatChanged,
    whatToWatch: watchlist,
    dataCoveragePercent: coverage.coverage,
    dataFreshnessPercent: coverage.freshness,
    contradictionCount: contradictions.length,
    gapCount: gaps.length
  };
}

/**
 * Save a context pack to the database
 */
export async function saveSectorContextPack(pack: SectorContextPack): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.execute(sql`
      INSERT INTO sector_context_packs (
        sectorCode, packDate, keyIndicators, topEvents, topDocuments,
        contradictions, gaps, whatChanged, whatToWatch,
        dataCoveragePercent, dataFreshnessPercent, contradictionCount, gapCount
      ) VALUES (
        ${pack.sectorCode},
        ${pack.packDate},
        ${JSON.stringify(pack.keyIndicators)},
        ${JSON.stringify(pack.topEvents)},
        ${JSON.stringify(pack.topDocuments)},
        ${JSON.stringify(pack.contradictions)},
        ${JSON.stringify(pack.gaps)},
        ${JSON.stringify(pack.whatChanged)},
        ${JSON.stringify(pack.whatToWatch)},
        ${pack.dataCoveragePercent},
        ${pack.dataFreshnessPercent},
        ${pack.contradictionCount},
        ${pack.gapCount}
      )
    `);
    
    return (result as any)[0]?.insertId || null;
  } catch (error) {
    console.error(`[SectorAgent] Failed to save context pack for ${pack.sectorCode}:`, error);
    return null;
  }
}

/**
 * Get the latest context pack for a sector
 */
export async function getLatestContextPack(sectorCode: string): Promise<SectorContextPack | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.execute(sql`
      SELECT * FROM sector_context_packs
      WHERE sectorCode = ${sectorCode}
      ORDER BY packDate DESC
      LIMIT 1
    `);
    
    const row = (result as any)[0]?.[0];
    if (!row) return null;
    
    return {
      sectorCode: row.sectorCode,
      packDate: new Date(row.packDate),
      keyIndicators: row.keyIndicators || [],
      topEvents: row.topEvents || [],
      topDocuments: row.topDocuments || [],
      contradictions: row.contradictions || [],
      gaps: row.gaps || [],
      whatChanged: row.whatChanged || [],
      whatToWatch: row.whatToWatch || [],
      dataCoveragePercent: parseFloat(row.dataCoveragePercent) || 0,
      dataFreshnessPercent: parseFloat(row.dataFreshnessPercent) || 0,
      contradictionCount: row.contradictionCount || 0,
      gapCount: row.gapCount || 0
    };
  } catch (error) {
    console.error(`[SectorAgent] Failed to get latest context pack for ${sectorCode}:`, error);
    return null;
  }
}

/**
 * Get sector KPIs configured in the database
 */
export async function getSectorKpis(sectorCode: string) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db.execute(sql`
      SELECT * FROM sector_kpis
      WHERE sectorCode = ${sectorCode} AND isActive = 1
      ORDER BY displayOrder ASC
    `);
    
    return (result as any)[0] || [];
  } catch (error) {
    console.error(`[SectorAgent] Failed to get KPIs for ${sectorCode}:`, error);
    return [];
  }
}

/**
 * Get sector mechanism explainers
 */
export async function getSectorMechanisms(sectorCode: string) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db.execute(sql`
      SELECT * FROM sector_mechanisms
      WHERE sectorCode = ${sectorCode} AND isActive = 1
      ORDER BY sectionOrder ASC
    `);
    
    return (result as any)[0] || [];
  } catch (error) {
    console.error(`[SectorAgent] Failed to get mechanisms for ${sectorCode}:`, error);
    return [];
  }
}

/**
 * Get sector FAQs
 */
export async function getSectorFaqs(sectorCode: string) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db.execute(sql`
      SELECT * FROM sector_faqs
      WHERE sectorCode = ${sectorCode} AND isActive = 1
      ORDER BY displayOrder ASC
    `);
    
    return (result as any)[0] || [];
  } catch (error) {
    console.error(`[SectorAgent] Failed to get FAQs for ${sectorCode}:`, error);
    return [];
  }
}

/**
 * Get sector release gate status
 */
export async function getSectorReleaseGate(sectorCode: string) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.execute(sql`
      SELECT * FROM sector_release_gates
      WHERE sectorCode = ${sectorCode}
      ORDER BY lastCheckedAt DESC
      LIMIT 1
    `);
    
    return (result as any)[0]?.[0] || null;
  } catch (error) {
    console.error(`[SectorAgent] Failed to get release gate for ${sectorCode}:`, error);
    return null;
  }
}
