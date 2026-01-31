/**
 * Universal Routing Engine
 * 
 * Routes artifacts (datasets, documents, events, projects, entities) to target pages
 * based on registry metadata, NLP tags, and indicator mappings.
 * 
 * Every page is powered by the FULL evidence base, filtered by relevance + tier + allowedUse.
 */

import { getDb } from '../db';
import { sql } from 'drizzle-orm';

// Target pages/modules in the platform
export const TARGET_PAGES = [
  // Sector pages S01-S16
  'S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08',
  'S09', 'S10', 'S11', 'S12', 'S13', 'S14', 'S15', 'S16',
  // Module pages
  'dashboard',
  'data-repository',
  'research-library',
  'timeline',
  'entities',
  'corporate-registry',
  'methodology',
  'vip-cockpits',
] as const;

export type TargetPage = typeof TARGET_PAGES[number];

// Routing result
export interface RoutingResult {
  pageKey: TargetPage;
  weight: number; // 0-100, higher = more relevant
  rationale: string;
  isPrimary: boolean;
}

// Artifact types
export type ArtifactType = 'dataset' | 'document' | 'event' | 'project' | 'entity' | 'indicator';

// Routing input
export interface RoutingInput {
  sourceId: string;
  artifactId?: string;
  artifactType: ArtifactType;
  tags?: string[];
  language?: 'en' | 'ar' | 'both';
  regime?: 'aden_irg' | 'sanaa_defacto' | 'mixed' | 'unknown';
  years?: number[];
}

// Sector code to page key mapping
const SECTOR_CODE_TO_PAGE: Record<string, TargetPage> = {
  'MACRO': 'S01',
  'TRADE': 'S02',
  'MONETARY': 'S03',
  'FISCAL': 'S04',
  'BANKING': 'S05',
  'ENERGY': 'S06',
  'AGRICULTURE': 'S07',
  'HUMANITARIAN': 'S08',
  'LABOR': 'S09',
  'INFRASTRUCTURE': 'S10',
  'GOVERNANCE': 'S11',
  'SECURITY': 'S12',
  'HEALTH': 'S13',
  'EDUCATION': 'S14',
  'ENVIRONMENT': 'S15',
  'SOCIAL': 'S16',
};

// Page keywords for NLP matching
const PAGE_KEYWORDS: Record<TargetPage, string[]> = {
  'S01': ['gdp', 'growth', 'inflation', 'economy', 'macroeconomic', 'الناتج', 'التضخم'],
  'S02': ['trade', 'export', 'import', 'tariff', 'customs', 'التجارة', 'الصادرات'],
  'S03': ['monetary', 'exchange', 'currency', 'central bank', 'النقدية', 'العملة'],
  'S04': ['fiscal', 'budget', 'revenue', 'expenditure', 'tax', 'الميزانية', 'الضرائب'],
  'S05': ['banking', 'finance', 'loan', 'credit', 'deposit', 'البنوك', 'القروض'],
  'S06': ['energy', 'oil', 'gas', 'electricity', 'fuel', 'الطاقة', 'النفط'],
  'S07': ['agriculture', 'food', 'crop', 'livestock', 'farming', 'الزراعة', 'الغذاء'],
  'S08': ['humanitarian', 'aid', 'relief', 'emergency', 'crisis', 'الإنسانية', 'الإغاثة'],
  'S09': ['labor', 'employment', 'wage', 'workforce', 'job', 'العمالة', 'الأجور'],
  'S10': ['infrastructure', 'transport', 'road', 'port', 'construction', 'البنية', 'النقل'],
  'S11': ['governance', 'institution', 'policy', 'reform', 'administration', 'الحوكمة'],
  'S12': ['security', 'conflict', 'military', 'peace', 'violence', 'الأمن', 'النزاع'],
  'S13': ['health', 'medical', 'disease', 'hospital', 'healthcare', 'الصحة', 'المستشفى'],
  'S14': ['education', 'school', 'university', 'student', 'learning', 'التعليم', 'المدرسة'],
  'S15': ['environment', 'climate', 'water', 'pollution', 'natural', 'البيئة', 'المناخ'],
  'S16': ['social', 'poverty', 'inequality', 'welfare', 'community', 'الفقر', 'المجتمع'],
  'dashboard': ['overview', 'summary', 'key', 'indicator', 'snapshot'],
  'data-repository': ['data', 'dataset', 'download', 'raw', 'statistics'],
  'research-library': ['report', 'document', 'publication', 'research', 'study'],
  'timeline': ['event', 'history', 'date', 'chronology', 'milestone'],
  'entities': ['organization', 'institution', 'stakeholder', 'actor', 'entity'],
  'corporate-registry': ['company', 'business', 'corporate', 'firm', 'enterprise'],
  'methodology': ['method', 'approach', 'calculation', 'formula', 'standard'],
  'vip-cockpits': ['executive', 'decision', 'brief', 'alert', 'priority'],
};

/**
 * Route an artifact to target pages based on source metadata and content
 */
export async function routeArtifactsToTargets(input: RoutingInput): Promise<RoutingResult[]> {
  const db = await getDb();
  if (!db) {
    console.error('[RoutingEngine] Database unavailable');
    return [];
  }

  const results: RoutingResult[] = [];

  try {
    // 1. Get source metadata from registry
    const sourceResult = await db.execute(sql`
      SELECT 
        sr.sourceId, sr.name, sr.tier, sr.status, sr.allowedUse,
        sr.sectorCategory, sr.geographicScope, sr.confidenceRating
      FROM source_registry sr
      WHERE sr.sourceId = ${input.sourceId}
    `);

    const source = (sourceResult as any)[0]?.[0];
    if (!source) {
      console.warn(`[RoutingEngine] Source not found: ${input.sourceId}`);
      return [];
    }

    // 2. Get sector mappings for this source
    const sectorResult = await db.execute(sql`
      SELECT sectorCode, isPrimary
      FROM registry_sector_map
      WHERE sourceId = ${input.sourceId}
    `);

    const sectorMappings = (sectorResult as any)[0] || [];

    // 3. Route to sector pages based on registry_sector_map
    for (const mapping of sectorMappings) {
      const pageKey = mapping.sectorCode as TargetPage;
      if (TARGET_PAGES.includes(pageKey)) {
        results.push({
          pageKey,
          weight: mapping.isPrimary ? 100 : 70,
          rationale: `Source ${input.sourceId} mapped to sector ${pageKey} via registry_sector_map`,
          isPrimary: mapping.isPrimary,
        });
      }
    }

    // 4. Route based on sectorCategory field
    if (source.sectorCategory) {
      const categories = source.sectorCategory.split(',').map((s: string) => s.trim());
      for (const category of categories) {
        const pageKey = SECTOR_CODE_TO_PAGE[category.toUpperCase()];
        if (pageKey && !results.find(r => r.pageKey === pageKey)) {
          results.push({
            pageKey,
            weight: 60,
            rationale: `Source sectorCategory field contains ${category}`,
            isPrimary: false,
          });
        }
      }
    }

    // 5. Route based on NLP tags (if provided)
    if (input.tags && input.tags.length > 0) {
      const tagSet = new Set(input.tags.map(t => t.toLowerCase()));
      
      for (const [pageKey, keywords] of Object.entries(PAGE_KEYWORDS)) {
        const matchCount = keywords.filter(kw => 
          tagSet.has(kw.toLowerCase()) || 
          input.tags!.some(t => t.toLowerCase().includes(kw.toLowerCase()))
        ).length;
        
        if (matchCount > 0 && !results.find(r => r.pageKey === pageKey)) {
          results.push({
            pageKey: pageKey as TargetPage,
            weight: Math.min(50, matchCount * 15),
            rationale: `NLP tags match ${matchCount} keywords for ${pageKey}`,
            isPrimary: false,
          });
        }
      }
    }

    // 6. Route to module pages based on artifact type
    switch (input.artifactType) {
      case 'dataset':
        if (!results.find(r => r.pageKey === 'data-repository')) {
          results.push({
            pageKey: 'data-repository',
            weight: 80,
            rationale: 'Artifact type is dataset',
            isPrimary: false,
          });
        }
        break;
      case 'document':
        if (!results.find(r => r.pageKey === 'research-library')) {
          results.push({
            pageKey: 'research-library',
            weight: 80,
            rationale: 'Artifact type is document',
            isPrimary: false,
          });
        }
        break;
      case 'event':
        if (!results.find(r => r.pageKey === 'timeline')) {
          results.push({
            pageKey: 'timeline',
            weight: 80,
            rationale: 'Artifact type is event',
            isPrimary: false,
          });
        }
        break;
      case 'entity':
        if (!results.find(r => r.pageKey === 'entities')) {
          results.push({
            pageKey: 'entities',
            weight: 80,
            rationale: 'Artifact type is entity',
            isPrimary: false,
          });
        }
        break;
    }

    // 7. Always route to dashboard if source is T0 or T1
    if (['T0', 'T1'].includes(source.tier)) {
      if (!results.find(r => r.pageKey === 'dashboard')) {
        results.push({
          pageKey: 'dashboard',
          weight: 40,
          rationale: `High-tier source (${source.tier}) relevant to dashboard`,
          isPrimary: false,
        });
      }
    }

    // Sort by weight descending
    results.sort((a, b) => b.weight - a.weight);

    return results;
  } catch (error) {
    console.error('[RoutingEngine] Error routing artifacts:', error);
    return [];
  }
}

/**
 * Get all sources feeding a specific page
 */
export async function getSourcesForPage(pageKey: TargetPage, limit = 50): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    // For sector pages (S01-S16), query registry_sector_map
    if (pageKey.startsWith('S')) {
      const result = await db.execute(sql`
        SELECT 
          sr.sourceId, sr.name, sr.altName, sr.tier, sr.status,
          sr.confidenceRating, sr.updateFrequency, sr.lastFetch,
          sr.allowedUse, sr.webUrl,
          rsm.isPrimary
        FROM source_registry sr
        INNER JOIN registry_sector_map rsm ON sr.sourceId = rsm.sourceId
        WHERE rsm.sectorCode = ${pageKey}
        ORDER BY rsm.isPrimary DESC, sr.tier, sr.name
        LIMIT ${limit}
      `);
      return (result as any)[0] || [];
    }

    // For module pages, query based on artifact type or tier
    let whereClause = sql`1=1`;
    
    switch (pageKey) {
      case 'dashboard':
        whereClause = sql`sr.tier IN ('T0', 'T1')`;
        break;
      case 'data-repository':
        whereClause = sql`sr.accessType IN ('API', 'CSV', 'SDMX')`;
        break;
      case 'research-library':
        whereClause = sql`sr.accessType IN ('WEB', 'PDF', 'MANUAL')`;
        break;
      case 'entities':
        whereClause = sql`sr.sectorCategory LIKE '%entity%' OR sr.sectorCategory LIKE '%stakeholder%'`;
        break;
      case 'methodology':
        whereClause = sql`sr.tier IN ('T0', 'T1') AND sr.status = 'ACTIVE'`;
        break;
      case 'vip-cockpits':
        whereClause = sql`sr.tier = 'T0' OR (sr.tier = 'T1' AND sr.confidenceRating = 'A')`;
        break;
      default:
        whereClause = sql`sr.status = 'ACTIVE'`;
    }

    const result = await db.execute(sql`
      SELECT 
        sr.sourceId, sr.name, sr.altName, sr.tier, sr.status,
        sr.confidenceRating, sr.updateFrequency, sr.lastFetch,
        sr.allowedUse, sr.webUrl
      FROM source_registry sr
      WHERE ${whereClause}
      ORDER BY sr.tier, sr.name
      LIMIT ${limit}
    `);

    return (result as any)[0] || [];
  } catch (error) {
    console.error(`[RoutingEngine] Error getting sources for page ${pageKey}:`, error);
    return [];
  }
}

/**
 * Get coverage statistics for a source
 */
export async function getSourceCoverage(sourceId: string): Promise<{
  yearsAvailable: number[];
  gaps: number[];
  lastIngestion: Date | null;
  totalArtifacts: number;
}> {
  const db = await getDb();
  if (!db) {
    return { yearsAvailable: [], gaps: [], lastIngestion: null, totalArtifacts: 0 };
  }

  try {
    // Get source metadata
    const sourceResult = await db.execute(sql`
      SELECT historicalStart, historicalEnd, lastFetch
      FROM source_registry
      WHERE sourceId = ${sourceId}
    `);

    const source = (sourceResult as any)[0]?.[0];
    if (!source) {
      return { yearsAvailable: [], gaps: [], lastIngestion: null, totalArtifacts: 0 };
    }

    const startYear = source.historicalStart || 2010;
    const endYear = source.historicalEnd || new Date().getFullYear();
    
    // Generate expected years
    const expectedYears: number[] = [];
    for (let y = startYear; y <= endYear; y++) {
      expectedYears.push(y);
    }

    // For now, assume all years are available (would need artifact table to check actual coverage)
    const yearsAvailable = expectedYears;
    const gaps: number[] = [];

    return {
      yearsAvailable,
      gaps,
      lastIngestion: source.lastFetch,
      totalArtifacts: 0, // Would need to count from artifacts table
    };
  } catch (error) {
    console.error(`[RoutingEngine] Error getting coverage for ${sourceId}:`, error);
    return { yearsAvailable: [], gaps: [], lastIngestion: null, totalArtifacts: 0 };
  }
}

/**
 * Save routing results to registry_page_map
 */
export async function saveRoutingResults(
  sourceId: string,
  artifactId: string,
  results: RoutingResult[]
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    for (const result of results) {
      await db.execute(sql`
        INSERT INTO registry_page_map (sourceId, artifactId, pageKey, weight, rationale, isPrimary, createdAt)
        VALUES (${sourceId}, ${artifactId}, ${result.pageKey}, ${result.weight}, ${result.rationale}, ${result.isPrimary}, NOW())
        ON DUPLICATE KEY UPDATE 
          weight = VALUES(weight),
          rationale = VALUES(rationale),
          isPrimary = VALUES(isPrimary),
          updatedAt = NOW()
      `);
    }
    return true;
  } catch (error) {
    console.error('[RoutingEngine] Error saving routing results:', error);
    return false;
  }
}

export default {
  routeArtifactsToTargets,
  getSourcesForPage,
  getSourceCoverage,
  saveRoutingResults,
  TARGET_PAGES,
  PAGE_KEYWORDS,
};
