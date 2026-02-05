/**
 * Sector Context Pack Builder
 * 
 * Nightly builds context packs for each sector agent from:
 * - Top indicator changes
 * - Recent documents
 * - Active contradictions
 * - Open gaps
 * 
 * Agents use these packs for evidence-grounded responses
 */

import { getDb } from '../db';
import { sql } from 'drizzle-orm';
import * as crypto from 'crypto';

export interface SectorContextPack {
  sectorCode: string;
  packVersion: string;
  generatedAt: Date;
  validUntil: Date;
  topIndicators: Array<{
    code: string;
    name: string;
    latestValue: number;
    changePercent: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  recentDocuments: Array<{
    docId: string;
    title: string;
    publisher: string;
    publishedAt: Date;
    importance: number;
  }>;
  activeContradictions: Array<{
    indicatorCode: string;
    date: string;
    sourceA: string;
    valueA: number;
    sourceB: string;
    valueB: number;
    variance: number;
  }>;
  openGaps: Array<{
    indicatorCode: string;
    missingYears: string;
    priority: string;
    recommendedSource: string;
  }>;
  exampleQuestions: string[];
}

/**
 * Build context pack for a sector
 */
export async function buildSectorContextPack(sectorCode: string): Promise<SectorContextPack> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const packVersion = `v${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const generatedAt = new Date();
  const validUntil = new Date(generatedAt.getTime() + 24 * 60 * 60 * 1000); // Valid for 24 hours

  try {
    // 1. Get top indicator changes (last 30 days)
    const topIndicatorsResult = await db.execute(sql`
      SELECT DISTINCT
        ts.indicatorCode,
        i.nameEn as name,
        ts.value as latestValue,
        0 as changePercent
      FROM time_series ts
      JOIN indicators i ON ts.indicatorCode = i.code
      WHERE JSON_CONTAINS(i.sectors, ${JSON.stringify(sectorCode)})
        AND ts.date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ORDER BY ts.date DESC
      LIMIT 10
    `);
    const topIndicators = ((topIndicatorsResult as any)[0] || []).map((row: any) => ({
      code: row.indicatorCode,
      name: row.name || row.indicatorCode,
      latestValue: parseFloat(row.latestValue),
      changePercent: parseFloat(row.changePercent),
      trend: Math.abs(row.changePercent) < 2 ? 'stable' : row.changePercent > 0 ? 'up' : 'down'
    }));

    // 2. Get recent documents (last 90 days)
    const recentDocsResult = await db.execute(sql`
      SELECT 
        ld.docId,
        ld.titleEn as title,
        ld.publisherName as publisher,
        ld.publishedAt,
        ld.importanceScore as importance
      FROM library_documents ld
      WHERE JSON_CONTAINS(ld.sectors, ${JSON.stringify(sectorCode)})
        AND ld.status = 'published'
        AND ld.retrievedAt >= DATE_SUB(NOW(), INTERVAL 90 DAY)
      ORDER BY ld.importanceScore DESC, ld.publishedAt DESC
      LIMIT 10
    `);
    const recentDocuments = ((recentDocsResult as any)[0] || []).map((row: any) => ({
      docId: row.docId,
      title: row.title,
      publisher: row.publisher,
      publishedAt: new Date(row.publishedAt),
      importance: row.importance
    }));

    // 3. Get active contradictions
    const contradictionsResult = await db.execute(sql`
      SELECT 
        cr.indicatorCode,
        cr.date,
        srA.name as sourceA,
        cr.sourceA_value as valueA,
        srB.name as sourceB,
        cr.sourceB_value as valueB,
        cr.variance_percent as variance
      FROM contradiction_registry cr
      JOIN source_registry srA ON cr.sourceA_registryId = srA.id
      JOIN source_registry srB ON cr.sourceB_registryId = srB.id
      WHERE cr.status IN ('DETECTED', 'UNDER_REVIEW')
      ORDER BY cr.variance_percent DESC
      LIMIT 5
    `);
    const activeContradictions = ((contradictionsResult as any)[0] || []).map((row: any) => ({
      indicatorCode: row.indicatorCode,
      date: row.date,
      sourceA: row.sourceA,
      valueA: parseFloat(row.valueA),
      sourceB: row.sourceB,
      valueB: parseFloat(row.valueB),
      variance: parseFloat(row.variance)
    }));

    // 4. Get open gaps
    const gapsResult = await db.execute(sql`
      SELECT 
        gt.indicatorCode,
        gt.missingYears,
        gt.priority,
        gt.recommendedSourceId,
        sr.name as recommendedSource
      FROM gap_tickets gt
      LEFT JOIN source_registry sr ON gt.recommendedSourceId = sr.id
      WHERE gt.status IN ('OPEN', 'IN_PROGRESS')
        AND JSON_CONTAINS(gt.sectors, ${JSON.stringify(sectorCode)})
      ORDER BY 
        CASE gt.priority WHEN 'P0' THEN 1 WHEN 'P1' THEN 2 ELSE 3 END,
        gt.createdAt DESC
      LIMIT 10
    `);
    const openGaps = ((gapsResult as any)[0] || []).map((row: any) => ({
      indicatorCode: row.indicatorCode,
      missingYears: row.missingYears || 'Unknown',
      priority: row.priority,
      recommendedSource: row.recommendedSource || 'Unknown'
    }));

    // 5. Generate example questions
    const exampleQuestions = generateExampleQuestions(sectorCode, topIndicators);

    // Store pack
    const pack: SectorContextPack = {
      sectorCode,
      packVersion,
      generatedAt,
      validUntil,
      topIndicators,
      recentDocuments,
      activeContradictions,
      openGaps,
      exampleQuestions
    };

    await db.execute(sql`
      INSERT INTO sector_context_packs (
        sectorCode, packVersion, generatedAt, validUntil,
        topIndicators, recentDocuments, activeContradictions, openGaps,
        exampleQuestions, createdAt
      ) VALUES (
        ${sectorCode},
        ${packVersion},
        ${generatedAt},
        ${validUntil},
        ${JSON.stringify(pack.topIndicators)},
        ${JSON.stringify(pack.recentDocuments)},
        ${JSON.stringify(pack.activeContradictions)},
        ${JSON.stringify(pack.openGaps)},
        ${JSON.stringify(pack.exampleQuestions)},
        NOW()
      )
    `);

    console.log(`[SectorContextPack] Built pack for ${sectorCode}: ${packVersion}`);
    return pack;
  } catch (error) {
    console.error('[SectorContextPack] Failed to build pack:', error);
    throw error;
  }
}

/**
 * Get latest context pack for a sector
 */
export async function getLatestContextPack(sectorCode: string): Promise<SectorContextPack | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.execute(sql`
      SELECT * FROM sector_context_packs
      WHERE sectorCode = ${sectorCode}
        AND validUntil > NOW()
      ORDER BY generatedAt DESC
      LIMIT 1
    `);

    const pack = (result as any)[0]?.[0];
    if (!pack) return null;

    return {
      sectorCode: pack.sectorCode,
      packVersion: pack.packVersion,
      generatedAt: new Date(pack.generatedAt),
      validUntil: new Date(pack.validUntil),
      topIndicators: typeof pack.topIndicators === 'string' ? JSON.parse(pack.topIndicators) : pack.topIndicators,
      recentDocuments: typeof pack.recentDocuments === 'string' ? JSON.parse(pack.recentDocuments) : pack.recentDocuments,
      activeContradictions: typeof pack.activeContradictions === 'string' ? JSON.parse(pack.activeContradictions) : pack.activeContradictions,
      openGaps: typeof pack.openGaps === 'string' ? JSON.parse(pack.openGaps) : pack.openGaps,
      exampleQuestions: typeof pack.exampleQuestions === 'string' ? JSON.parse(pack.exampleQuestions) : pack.exampleQuestions
    };
  } catch (error) {
    console.error('[SectorContextPack] Failed to get latest pack:', error);
    return null;
  }
}

/**
 * Build context packs for all sectors (nightly job)
 */
export async function buildAllSectorContextPacks(): Promise<{
  sectorsProcessed: number;
  errors: string[];
}> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  let sectorsProcessed = 0;
  const errors: string[] = [];

  try {
    // Get all active sectors
    const sectorsResult = await db.execute(sql`
      SELECT sectorCode FROM sector_codebook WHERE isActive = true
    `);
    const sectors = (sectorsResult as any)[0] || [];

    for (const sector of sectors) {
      try {
        await buildSectorContextPack(sector.sectorCode);
        sectorsProcessed++;
      } catch (error) {
        errors.push(`Failed to build pack for ${sector.sectorCode}: ${error}`);
      }
    }

    console.log(`[SectorContextPack] Built packs for ${sectorsProcessed} sectors`);
    return { sectorsProcessed, errors };
  } catch (error) {
    console.error('[SectorContextPack] Failed to build all packs:', error);
    throw error;
  }
}

function generateExampleQuestions(
  sectorCode: string,
  indicators: any[]
): string[] {
  const sectorQuestions: Record<string, string[]> = {
    MACRO: [
      "What is Yemen's current GDP growth rate?",
      "How has inflation changed in the last quarter?",
      "What are the latest exchange rate trends?"
    ],
    BANKING: [
      "How many banks are currently operating in Yemen?",
      "What is the liquidity situation in the banking sector?",
      "Are there any new banking regulations?"
    ],
    FOOD: [
      "What are the current wheat prices?",
      "How many people face food insecurity?",
      "What is WFP's food basket cost this month?"
    ],
    AID: [
      "How much humanitarian aid was pledged this year?",
      "Which donors are the largest contributors?",
      "What is the funding gap for the HRP?"
    ],
    FX: [
      "What is the official exchange rate in Aden?",
      "What is the parallel market rate in Sana'a?",
      "How much has the rial depreciated?"
    ]
  };

  return sectorQuestions[sectorCode] || [
    `What are the key trends in ${sectorCode}?`,
    `What recent data is available for ${sectorCode}?`,
    `Are there any data gaps in ${sectorCode}?`
  ];
}
