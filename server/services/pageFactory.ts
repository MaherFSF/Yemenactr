/**
 * Page Factory Service
 * 
 * Auto-generates pages from claims in the Truth Layer:
 * - Year pages (economic snapshot for a specific year)
 * - Sector pages (deep dive into a sector)
 * - Actor pages (entity profiles)
 * - Regulation pages (law/circular summaries)
 * - Governorate pages (regional data)
 */

import { getDb } from "../db";
import { sql } from "drizzle-orm";

// Page types supported by the factory
export type PageType = 'year' | 'sector' | 'actor' | 'regulation' | 'governorate';

// Page template structure
export interface PageTemplate {
  type: PageType;
  slug: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  sections: PageSection[];
  metadata: Record<string, any>;
  generatedAt: Date;
  claimCount: number;
  sourceCount: number;
}

export interface PageSection {
  id: string;
  titleEn: string;
  titleAr: string;
  type: 'kpi_grid' | 'chart' | 'table' | 'narrative' | 'timeline' | 'comparison';
  claims: string[]; // Claim IDs
  data: any;
}

export interface GenerationResult {
  success: boolean;
  pageType: PageType;
  slug: string;
  template?: PageTemplate;
  error?: string;
}

/**
 * Generate a Year page from claims
 */
export async function generateYearPage(year: number): Promise<GenerationResult> {
  const db = await getDb();
  if (!db) {
    return { success: false, pageType: 'year', slug: `year-${year}`, error: 'Database not available' };
  }

  try {
    // Fetch claims for this year
    const claimsResult = await db.execute(sql`
      SELECT c.*, es.nameEn as sourceName
      FROM claims c
      LEFT JOIN evidence_sources es ON c.sourceId = es.id
      WHERE c.year = ${year}
      ORDER BY c.sector, c.claimType
    `);
    
    const claims = Array.isArray(claimsResult) ? claimsResult : (claimsResult as any)[0] || [];
    
    // Group claims by sector
    const sectorClaims: Record<string, any[]> = {};
    for (const claim of claims as any[]) {
      const sector = claim.sector || 'general';
      if (!sectorClaims[sector]) sectorClaims[sector] = [];
      sectorClaims[sector].push(claim);
    }

    // Build sections
    const sections: PageSection[] = [];

    // KPI Grid section
    const kpiClaims = (claims as any[]).filter(c => 
      ['gdp', 'inflation', 'exchange_rate', 'unemployment', 'poverty_rate'].includes(c.claimType)
    );
    if (kpiClaims.length > 0) {
      sections.push({
        id: 'key-indicators',
        titleEn: 'Key Economic Indicators',
        titleAr: 'المؤشرات الاقتصادية الرئيسية',
        type: 'kpi_grid',
        claims: kpiClaims.map(c => c.id),
        data: kpiClaims.map(c => ({
          label: c.claimType,
          value: c.valueNumeric || c.valueText,
          unit: c.unit,
          source: c.sourceName,
          confidence: c.confidenceGrade
        }))
      });
    }

    // Sector breakdown sections
    for (const [sector, sectorData] of Object.entries(sectorClaims)) {
      sections.push({
        id: `sector-${sector}`,
        titleEn: `${sector.charAt(0).toUpperCase() + sector.slice(1)} Sector`,
        titleAr: `قطاع ${sector}`,
        type: 'table',
        claims: sectorData.map((c: any) => c.id),
        data: sectorData.map((c: any) => ({
          indicator: c.claimType,
          value: c.valueNumeric || c.valueText,
          unit: c.unit,
          source: c.sourceName,
          date: c.observationDate
        }))
      });
    }

    // Count unique sources
    const sourceIds = new Set((claims as any[]).map(c => c.sourceId).filter(Boolean));

    const template: PageTemplate = {
      type: 'year',
      slug: `year-${year}`,
      titleEn: `Yemen Economic Overview ${year}`,
      titleAr: `نظرة عامة على الاقتصاد اليمني ${year}`,
      descriptionEn: `Comprehensive economic data and analysis for Yemen in ${year}`,
      descriptionAr: `بيانات وتحليلات اقتصادية شاملة لليمن في عام ${year}`,
      sections,
      metadata: {
        year,
        sectorCount: Object.keys(sectorClaims).length,
        lastUpdated: new Date().toISOString()
      },
      generatedAt: new Date(),
      claimCount: (claims as any[]).length,
      sourceCount: sourceIds.size
    };

    // Save to database
    await db.execute(sql`
      INSERT INTO page_build_runs (pageType, pageSlug, status, claimsUsed, sourcesUsed, generatedTemplate)
      VALUES ('year', ${template.slug}, 'completed', ${template.claimCount}, ${template.sourceCount}, ${JSON.stringify(template)})
    `);

    return { success: true, pageType: 'year', slug: template.slug, template };
  } catch (error) {
    return { success: false, pageType: 'year', slug: `year-${year}`, error: String(error) };
  }
}

/**
 * Generate a Sector page from claims
 */
export async function generateSectorPage(sector: string): Promise<GenerationResult> {
  const db = await getDb();
  if (!db) {
    return { success: false, pageType: 'sector', slug: `sector-${sector}`, error: 'Database not available' };
  }

  try {
    // Fetch claims for this sector
    const claimsResult = await db.execute(sql`
      SELECT c.*, es.nameEn as sourceName
      FROM claims c
      LEFT JOIN evidence_sources es ON c.sourceId = es.id
      WHERE c.sector = ${sector}
      ORDER BY c.year DESC, c.claimType
    `);
    
    const claims = Array.isArray(claimsResult) ? claimsResult : (claimsResult as any)[0] || [];

    // Group by year for time series
    const yearClaims: Record<number, any[]> = {};
    for (const claim of claims as any[]) {
      const year = claim.year || 2024;
      if (!yearClaims[year]) yearClaims[year] = [];
      yearClaims[year].push(claim);
    }

    const sections: PageSection[] = [];

    // Latest indicators
    const latestYear = Math.max(...Object.keys(yearClaims).map(Number));
    const latestClaims = yearClaims[latestYear] || [];
    if (latestClaims.length > 0) {
      sections.push({
        id: 'latest-indicators',
        titleEn: `Latest Indicators (${latestYear})`,
        titleAr: `أحدث المؤشرات (${latestYear})`,
        type: 'kpi_grid',
        claims: latestClaims.slice(0, 6).map(c => c.id),
        data: latestClaims.slice(0, 6).map(c => ({
          label: c.claimType,
          value: c.valueNumeric || c.valueText,
          unit: c.unit,
          confidence: c.confidenceGrade
        }))
      });
    }

    // Time series chart
    const timeSeriesData = Object.entries(yearClaims).map(([year, data]) => ({
      year: parseInt(year),
      indicators: data.length,
      avgConfidence: data.reduce((sum, c) => {
        const scores: Record<string, number> = { A: 4, B: 3, C: 2, D: 1 };
        return sum + (scores[c.confidenceGrade] || 0);
      }, 0) / data.length
    })).sort((a, b) => a.year - b.year);

    sections.push({
      id: 'historical-trend',
      titleEn: 'Historical Data Coverage',
      titleAr: 'تغطية البيانات التاريخية',
      type: 'chart',
      claims: [],
      data: timeSeriesData
    });

    // All data table
    sections.push({
      id: 'all-data',
      titleEn: 'All Sector Data',
      titleAr: 'جميع بيانات القطاع',
      type: 'table',
      claims: (claims as any[]).map(c => c.id),
      data: (claims as any[]).map(c => ({
        year: c.year,
        indicator: c.claimType,
        value: c.valueNumeric || c.valueText,
        unit: c.unit,
        source: c.sourceName,
        confidence: c.confidenceGrade
      }))
    });

    const sourceIds = new Set((claims as any[]).map(c => c.sourceId).filter(Boolean));

    const sectorLabels: Record<string, { en: string; ar: string }> = {
      banking: { en: 'Banking & Finance', ar: 'المصارف والتمويل' },
      trade: { en: 'Trade & Commerce', ar: 'التجارة' },
      poverty: { en: 'Poverty & Development', ar: 'الفقر والتنمية' },
      macroeconomy: { en: 'Macroeconomy', ar: 'الاقتصاد الكلي' },
      prices: { en: 'Prices & Inflation', ar: 'الأسعار والتضخم' },
      currency: { en: 'Currency & Exchange', ar: 'العملة والصرف' },
      public_finance: { en: 'Public Finance', ar: 'المالية العامة' },
      energy: { en: 'Energy', ar: 'الطاقة' },
      food_security: { en: 'Food Security', ar: 'الأمن الغذائي' },
      aid_flows: { en: 'Aid Flows', ar: 'تدفقات المساعدات' },
      labor_market: { en: 'Labor Market', ar: 'سوق العمل' },
      conflict_economy: { en: 'Conflict Economy', ar: 'اقتصاد الصراع' },
      infrastructure: { en: 'Infrastructure', ar: 'البنية التحتية' },
      agriculture: { en: 'Agriculture', ar: 'الزراعة' },
      investment: { en: 'Investment', ar: 'الاستثمار' },
    };

    const label = sectorLabels[sector] || { en: sector, ar: sector };

    const template: PageTemplate = {
      type: 'sector',
      slug: `sector-${sector}`,
      titleEn: `${label.en} Sector Analysis`,
      titleAr: `تحليل قطاع ${label.ar}`,
      descriptionEn: `In-depth analysis of Yemen's ${label.en.toLowerCase()} sector`,
      descriptionAr: `تحليل معمق لقطاع ${label.ar} في اليمن`,
      sections,
      metadata: {
        sector,
        yearRange: [Math.min(...Object.keys(yearClaims).map(Number)), latestYear],
        lastUpdated: new Date().toISOString()
      },
      generatedAt: new Date(),
      claimCount: (claims as any[]).length,
      sourceCount: sourceIds.size
    };

    await db.execute(sql`
      INSERT INTO page_build_runs (pageType, pageSlug, status, claimsUsed, sourcesUsed, generatedTemplate)
      VALUES ('sector', ${template.slug}, 'completed', ${template.claimCount}, ${template.sourceCount}, ${JSON.stringify(template)})
    `);

    return { success: true, pageType: 'sector', slug: template.slug, template };
  } catch (error) {
    return { success: false, pageType: 'sector', slug: `sector-${sector}`, error: String(error) };
  }
}

/**
 * Generate an Actor/Entity page from claims
 */
export async function generateActorPage(entityId: number): Promise<GenerationResult> {
  const db = await getDb();
  if (!db) {
    return { success: false, pageType: 'actor', slug: `actor-${entityId}`, error: 'Database not available' };
  }

  try {
    // Fetch entity info
    const entityResult = await db.execute(sql`
      SELECT * FROM entities WHERE id = ${entityId}
    `);
    const entities = Array.isArray(entityResult) ? entityResult : (entityResult as any)[0] || [];
    const entity = (entities as any[])[0];

    if (!entity) {
      return { success: false, pageType: 'actor', slug: `actor-${entityId}`, error: 'Entity not found' };
    }

    // Fetch claims mentioning this entity
    const claimsResult = await db.execute(sql`
      SELECT c.*, es.nameEn as sourceName
      FROM claims c
      LEFT JOIN evidence_sources es ON c.sourceId = es.id
      WHERE c.entityId = ${entityId}
      ORDER BY c.year DESC
    `);
    
    const claims = Array.isArray(claimsResult) ? claimsResult : (claimsResult as any)[0] || [];

    const sections: PageSection[] = [];

    // Entity overview
    sections.push({
      id: 'overview',
      titleEn: 'Overview',
      titleAr: 'نظرة عامة',
      type: 'narrative',
      claims: [],
      data: {
        nameEn: entity.nameEn,
        nameAr: entity.nameAr,
        type: entity.entityType,
        status: entity.status,
        description: entity.description
      }
    });

    // Key metrics
    const metricClaims = (claims as any[]).filter(c => c.valueNumeric !== null);
    if (metricClaims.length > 0) {
      sections.push({
        id: 'key-metrics',
        titleEn: 'Key Metrics',
        titleAr: 'المقاييس الرئيسية',
        type: 'kpi_grid',
        claims: metricClaims.slice(0, 6).map(c => c.id),
        data: metricClaims.slice(0, 6).map(c => ({
          label: c.claimType,
          value: c.valueNumeric,
          unit: c.unit,
          year: c.year,
          confidence: c.confidenceGrade
        }))
      });
    }

    // Timeline
    sections.push({
      id: 'timeline',
      titleEn: 'Historical Timeline',
      titleAr: 'الجدول الزمني',
      type: 'timeline',
      claims: (claims as any[]).map(c => c.id),
      data: (claims as any[]).map(c => ({
        year: c.year,
        event: c.claimType,
        value: c.valueNumeric || c.valueText,
        source: c.sourceName
      }))
    });

    const sourceIds = new Set((claims as any[]).map(c => c.sourceId).filter(Boolean));

    const template: PageTemplate = {
      type: 'actor',
      slug: `actor-${entity.id}`,
      titleEn: entity.nameEn || `Entity ${entityId}`,
      titleAr: entity.nameAr || `الكيان ${entityId}`,
      descriptionEn: `Profile and data for ${entity.nameEn}`,
      descriptionAr: `ملف وبيانات ${entity.nameAr}`,
      sections,
      metadata: {
        entityId,
        entityType: entity.entityType,
        lastUpdated: new Date().toISOString()
      },
      generatedAt: new Date(),
      claimCount: (claims as any[]).length,
      sourceCount: sourceIds.size
    };

    await db.execute(sql`
      INSERT INTO page_build_runs (pageType, pageSlug, status, claimsUsed, sourcesUsed, generatedTemplate)
      VALUES ('actor', ${template.slug}, 'completed', ${template.claimCount}, ${template.sourceCount}, ${JSON.stringify(template)})
    `);

    return { success: true, pageType: 'actor', slug: template.slug, template };
  } catch (error) {
    return { success: false, pageType: 'actor', slug: `actor-${entityId}`, error: String(error) };
  }
}

/**
 * Generate a Regulation page
 */
export async function generateRegulationPage(regulationId: number): Promise<GenerationResult> {
  const db = await getDb();
  if (!db) {
    return { success: false, pageType: 'regulation', slug: `regulation-${regulationId}`, error: 'Database not available' };
  }

  try {
    // Fetch regulation
    const regResult = await db.execute(sql`
      SELECT * FROM regulations WHERE id = ${regulationId}
    `);
    const regs = Array.isArray(regResult) ? regResult : (regResult as any)[0] || [];
    const regulation = (regs as any[])[0];

    if (!regulation) {
      return { success: false, pageType: 'regulation', slug: `regulation-${regulationId}`, error: 'Regulation not found' };
    }

    const sections: PageSection[] = [];

    // Overview
    sections.push({
      id: 'overview',
      titleEn: 'Overview',
      titleAr: 'نظرة عامة',
      type: 'narrative',
      claims: [],
      data: {
        titleEn: regulation.titleEn,
        titleAr: regulation.titleAr,
        type: regulation.regulationType,
        issuedBy: regulation.issuedBy,
        issuedDate: regulation.issuedDate,
        effectiveDate: regulation.effectiveDate,
        status: regulation.status
      }
    });

    // Summary
    if (regulation.summaryEn || regulation.summaryAr) {
      sections.push({
        id: 'summary',
        titleEn: 'Summary',
        titleAr: 'ملخص',
        type: 'narrative',
        claims: [],
        data: {
          summaryEn: regulation.summaryEn,
          summaryAr: regulation.summaryAr
        }
      });
    }

    const template: PageTemplate = {
      type: 'regulation',
      slug: `regulation-${regulation.id}`,
      titleEn: regulation.titleEn || `Regulation ${regulationId}`,
      titleAr: regulation.titleAr || `اللائحة ${regulationId}`,
      descriptionEn: `Details of ${regulation.titleEn}`,
      descriptionAr: `تفاصيل ${regulation.titleAr}`,
      sections,
      metadata: {
        regulationId,
        regulationType: regulation.regulationType,
        issuedBy: regulation.issuedBy,
        lastUpdated: new Date().toISOString()
      },
      generatedAt: new Date(),
      claimCount: 0,
      sourceCount: 1
    };

    await db.execute(sql`
      INSERT INTO page_build_runs (pageType, pageSlug, status, claimsUsed, sourcesUsed, generatedTemplate)
      VALUES ('regulation', ${template.slug}, 'completed', 0, 1, ${JSON.stringify(template)})
    `);

    return { success: true, pageType: 'regulation', slug: template.slug, template };
  } catch (error) {
    return { success: false, pageType: 'regulation', slug: `regulation-${regulationId}`, error: String(error) };
  }
}

/**
 * Generate a Governorate page
 */
export async function generateGovernoratePage(governorate: string): Promise<GenerationResult> {
  const db = await getDb();
  if (!db) {
    return { success: false, pageType: 'governorate', slug: `governorate-${governorate}`, error: 'Database not available' };
  }

  try {
    // Fetch claims for this governorate
    const claimsResult = await db.execute(sql`
      SELECT c.*, es.nameEn as sourceName
      FROM claims c
      LEFT JOIN evidence_sources es ON c.sourceId = es.id
      WHERE c.governorate = ${governorate}
      ORDER BY c.year DESC, c.sector
    `);
    
    const claims = Array.isArray(claimsResult) ? claimsResult : (claimsResult as any)[0] || [];

    // Group by sector
    const sectorClaims: Record<string, any[]> = {};
    for (const claim of claims as any[]) {
      const sector = claim.sector || 'general';
      if (!sectorClaims[sector]) sectorClaims[sector] = [];
      sectorClaims[sector].push(claim);
    }

    const sections: PageSection[] = [];

    // Overview KPIs
    const kpiClaims = (claims as any[]).slice(0, 6);
    if (kpiClaims.length > 0) {
      sections.push({
        id: 'key-indicators',
        titleEn: 'Key Indicators',
        titleAr: 'المؤشرات الرئيسية',
        type: 'kpi_grid',
        claims: kpiClaims.map(c => c.id),
        data: kpiClaims.map(c => ({
          label: c.claimType,
          value: c.valueNumeric || c.valueText,
          unit: c.unit,
          sector: c.sector,
          confidence: c.confidenceGrade
        }))
      });
    }

    // Sector breakdown
    for (const [sector, data] of Object.entries(sectorClaims)) {
      sections.push({
        id: `sector-${sector}`,
        titleEn: `${sector.charAt(0).toUpperCase() + sector.slice(1)}`,
        titleAr: sector,
        type: 'table',
        claims: data.map((c: any) => c.id),
        data: data.map((c: any) => ({
          year: c.year,
          indicator: c.claimType,
          value: c.valueNumeric || c.valueText,
          source: c.sourceName
        }))
      });
    }

    const sourceIds = new Set((claims as any[]).map(c => c.sourceId).filter(Boolean));

    const template: PageTemplate = {
      type: 'governorate',
      slug: `governorate-${governorate.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      titleEn: `${governorate} Governorate`,
      titleAr: `محافظة ${governorate}`,
      descriptionEn: `Economic data and analysis for ${governorate} governorate`,
      descriptionAr: `بيانات وتحليلات اقتصادية لمحافظة ${governorate}`,
      sections,
      metadata: {
        governorate,
        sectorCount: Object.keys(sectorClaims).length,
        lastUpdated: new Date().toISOString()
      },
      generatedAt: new Date(),
      claimCount: (claims as any[]).length,
      sourceCount: sourceIds.size
    };

    await db.execute(sql`
      INSERT INTO page_build_runs (pageType, pageSlug, status, claimsUsed, sourcesUsed, generatedTemplate)
      VALUES ('governorate', ${template.slug}, 'completed', ${template.claimCount}, ${template.sourceCount}, ${JSON.stringify(template)})
    `);

    return { success: true, pageType: 'governorate', slug: template.slug, template };
  } catch (error) {
    return { success: false, pageType: 'governorate', slug: `governorate-${governorate}`, error: String(error) };
  }
}

/**
 * Get list of pages that can be generated
 */
export async function getGeneratablePages(): Promise<{
  years: number[];
  sectors: string[];
  actors: { id: number; name: string }[];
  regulations: { id: number; title: string }[];
  governorates: string[];
}> {
  const db = await getDb();
  if (!db) {
    return { years: [], sectors: [], actors: [], regulations: [], governorates: [] };
  }

  try {
    // Get years with claims
    const yearsResult = await db.execute(sql`SELECT DISTINCT year FROM claims WHERE year IS NOT NULL ORDER BY year`);
    const years = (Array.isArray(yearsResult) ? yearsResult : (yearsResult as any)[0] || []).map((r: any) => r.year);

    // Get sectors with claims
    const sectorsResult = await db.execute(sql`SELECT DISTINCT sector FROM claims WHERE sector IS NOT NULL`);
    const sectors = (Array.isArray(sectorsResult) ? sectorsResult : (sectorsResult as any)[0] || []).map((r: any) => r.sector);

    // Get entities
    const actorsResult = await db.execute(sql`SELECT id, nameEn FROM entities LIMIT 100`);
    const actors = (Array.isArray(actorsResult) ? actorsResult : (actorsResult as any)[0] || []).map((r: any) => ({ id: r.id, name: r.nameEn }));

    // Get regulations
    const regsResult = await db.execute(sql`SELECT id, titleEn FROM regulations LIMIT 100`);
    const regulations = (Array.isArray(regsResult) ? regsResult : (regsResult as any)[0] || []).map((r: any) => ({ id: r.id, title: r.titleEn }));

    // Get governorates with claims
    const govsResult = await db.execute(sql`SELECT DISTINCT governorate FROM claims WHERE governorate IS NOT NULL AND governorate != 'national'`);
    const governorates = (Array.isArray(govsResult) ? govsResult : (govsResult as any)[0] || []).map((r: any) => r.governorate);

    return { years, sectors, actors, regulations, governorates };
  } catch (error) {
    console.error('Error getting generatable pages:', error);
    return { years: [], sectors: [], actors: [], regulations: [], governorates: [] };
  }
}

/**
 * Get generated page templates
 */
export async function getGeneratedPages(pageType?: PageType): Promise<PageTemplate[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    let result;
    if (pageType) {
      result = await db.execute(sql`
        SELECT generatedTemplate FROM page_build_runs 
        WHERE pageType = ${pageType} AND status = 'completed'
        ORDER BY createdAt DESC
      `);
    } else {
      result = await db.execute(sql`
        SELECT generatedTemplate FROM page_build_runs 
        WHERE status = 'completed'
        ORDER BY createdAt DESC
      `);
    }

    const rows = Array.isArray(result) ? result : (result as any)[0] || [];
    return (rows as any[]).map(r => {
      try {
        return typeof r.generatedTemplate === 'string' 
          ? JSON.parse(r.generatedTemplate) 
          : r.generatedTemplate;
      } catch {
        return null;
      }
    }).filter(Boolean);
  } catch (error) {
    console.error('Error getting generated pages:', error);
    return [];
  }
}

export default {
  generateYearPage,
  generateSectorPage,
  generateActorPage,
  generateRegulationPage,
  generateGovernoratePage,
  getGeneratablePages,
  getGeneratedPages
};
