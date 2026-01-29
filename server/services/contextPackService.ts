/**
 * Context Pack Generator Service
 * Generates nightly context packs for AI agents with latest data, events, and contradictions
 */

import { getDb } from '../db';
import { contextPacks, indicators, economicEvents, glossaryTerms, dataGapTickets, dataContradictions } from '../../drizzle/schema';
import { eq, desc, gte, and, sql } from 'drizzle-orm';
import { storagePut } from '../storage';
import crypto from 'crypto';

interface ContextPackContent {
  packCode: string;
  packDate: string;
  packType: 'global' | 'sector' | 'role' | 'entity';
  targetCode?: string;
  generatedAt: string;
  
  // Top indicators and definitions
  topIndicators: {
    code: string;
    nameEn: string;
    nameAr: string;
    latestValue?: number;
    latestDate?: string;
    trend?: 'up' | 'down' | 'stable';
    confidenceGrade: string;
  }[];
  
  // Major events since last pack
  recentEvents: {
    id: number;
    titleEn: string;
    titleAr: string;
    date: string;
    eventType: string;
    citations: { sourceType: string; url: string }[];
  }[];
  
  // Top contradictions discovered
  contradictions: {
    indicatorCode: string;
    sources: string[];
    description: string;
    descriptionAr: string;
    severity: string;
  }[];
  
  // Top gaps and staleness breaches
  gaps: {
    ticketId: number;
    indicatorCode: string;
    gapType: string;
    severity: string;
    description: string;
  }[];
  
  // What changed deltas
  deltas: {
    type: 'indicator_update' | 'new_event' | 'new_contradiction' | 'gap_resolved';
    description: string;
    timestamp: string;
  }[];
  
  // What to watch next (neutral)
  watchlist: {
    item: string;
    itemAr: string;
    reason: string;
    reasonAr: string;
  }[];
  
  // Bilingual glossary deltas
  glossaryDeltas: {
    termEn: string;
    termAr: string;
    definitionEn: string;
    definitionAr: string;
    isNew: boolean;
  }[];
}

export async function generateContextPack(
  packType: 'global' | 'sector' | 'role' | 'entity',
  targetCode?: string
): Promise<{ packId: number; s3Url: string }> {
  const packDate = new Date().toISOString().split('T')[0];
  const packCode = targetCode 
    ? `context_pack_${packType}_${targetCode}_${packDate}`
    : `context_pack_${packType}_${packDate}`;
  
  const startTime = Date.now();
  const db = await getDb();
  if (!db) throw new Error('Database connection failed');
  
  // Fetch top indicators
  const topIndicators = await db
    .select({
      code: indicators.code,
      nameEn: indicators.nameEn,
      nameAr: indicators.nameAr,
      sector: indicators.sector,
    })
    .from(indicators)
    .where(eq(indicators.isActive, true))
    .limit(50);
  
  // Fetch recent events (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentEvents = await db
    .select({
      id: economicEvents.id,
      title: economicEvents.title,
      titleAr: economicEvents.titleAr,
      eventDate: economicEvents.eventDate,
      category: economicEvents.category,
    })
    .from(economicEvents)
    .where(gte(economicEvents.eventDate, sevenDaysAgo))
    .orderBy(desc(economicEvents.eventDate))
    .limit(20);
  
  // Fetch contradictions
  const contradictions = await db
    .select({
      id: dataContradictions.id,
      indicatorCode: dataContradictions.indicatorCode,
      discrepancyType: dataContradictions.discrepancyType,
    })
    .from(dataContradictions)
    .where(eq(dataContradictions.status, 'detected'))
    .limit(10);
  
  // Fetch open gap tickets
  const gaps = await db
    .select({
      id: dataGapTickets.id,
      missingItem: dataGapTickets.missingItem,
      priority: dataGapTickets.priority,
      whyItMatters: dataGapTickets.whyItMatters,
    })
    .from(dataGapTickets)
    .where(eq(dataGapTickets.status, 'open'))
    .limit(20);
  
  // Fetch glossary terms
  const glossaryItems = await db
    .select({
      termEn: glossaryTerms.termEn,
      termAr: glossaryTerms.termAr,
      definitionEn: glossaryTerms.definitionEn,
      definitionAr: glossaryTerms.definitionAr,
    })
    .from(glossaryTerms)
    .limit(100);
  
  // Build context pack content
  const content: ContextPackContent = {
    packCode,
    packDate,
    packType,
    targetCode,
    generatedAt: new Date().toISOString(),
    
    topIndicators: topIndicators.map((ind: any) => ({
      code: ind.code,
      nameEn: ind.nameEn,
      nameAr: ind.nameAr || '',
      confidenceGrade: ind.confidenceGrade || 'C',
    })),
    
    recentEvents: recentEvents.map((evt: any) => ({
      id: evt.id,
      titleEn: evt.titleEn,
      titleAr: evt.titleAr || '',
      date: evt.date,
      eventType: evt.eventType,
      citations: [],
    })),
    
    contradictions: contradictions.map((c: any) => ({
      indicatorCode: c.indicatorCode || '',
      sources: [],
      description: c.description || '',
      descriptionAr: '',
      severity: 'medium',
    })),
    
    gaps: gaps.map((g: any) => ({
      ticketId: g.id,
      indicatorCode: g.indicatorCode || '',
      gapType: g.gapType,
      severity: g.severity,
      description: g.description || '',
    })),
    
    deltas: [],
    
    watchlist: [
      {
        item: 'Exchange rate movements',
        itemAr: 'تحركات سعر الصرف',
        reason: 'High volatility expected',
        reasonAr: 'تقلبات عالية متوقعة',
      },
      {
        item: 'Fuel price updates',
        itemAr: 'تحديثات أسعار الوقود',
        reason: 'Monthly review due',
        reasonAr: 'المراجعة الشهرية مستحقة',
      },
    ],
    
    glossaryDeltas: glossaryItems.slice(0, 10).map((g: any) => ({
      termEn: g.termEn,
      termAr: g.termAr || '',
      definitionEn: g.definitionEn,
      definitionAr: g.definitionAr || '',
      isNew: false,
    })),
  };
  
  // Generate content hash
  const contentJson = JSON.stringify(content);
  const contentHash = crypto.createHash('sha256').update(contentJson).digest('hex');
  
  // Upload to S3
  const s3Key = `context_packs/${packDate}/${packCode}.json`;
  const { url: s3Url } = await storagePut(s3Key, contentJson, 'application/json');
  
  const durationMs = Date.now() - startTime;
  
  // Save to database
  const [result] = await db.insert(contextPacks).values({
    packCode,
    packDate: new Date(packDate),
    packType,
    targetCode,
    contentHash,
    s3Key,
    s3Url,
    fileSizeBytes: contentJson.length,
    topIndicatorsCount: content.topIndicators.length,
    eventsCount: content.recentEvents.length,
    contradictionsCount: content.contradictions.length,
    gapsCount: content.gaps.length,
    glossaryDeltasCount: content.glossaryDeltas.length,
    generatedAt: new Date(),
    generationDurationMs: durationMs,
  });
  
  return {
    packId: result.insertId,
    s3Url,
  };
}

export async function generateAllContextPacks(): Promise<{
  global: { packId: number; s3Url: string };
  sectors: { sectorCode: string; packId: number; s3Url: string }[];
  roles: { roleCode: string; packId: number; s3Url: string }[];
}> {
  // Generate global pack
  const globalPack = await generateContextPack('global');
  
  // Generate sector packs
  const sectorCodes = [
    'macro', 'prices', 'currency', 'banking', 'trade',
    'fiscal', 'energy', 'food', 'labor', 'aid',
    'poverty', 'conflict', 'infrastructure', 'agriculture', 'investment'
  ];
  
  const sectorPacks = [];
  for (const sectorCode of sectorCodes) {
    const pack = await generateContextPack('sector', sectorCode);
    sectorPacks.push({ sectorCode, ...pack });
  }
  
  // Generate role packs
  const roleCodes = [
    'policy_maker', 'donor', 'researcher', 'journalist', 'private_sector', 'ngo'
  ];
  
  const rolePacks = [];
  for (const roleCode of roleCodes) {
    const pack = await generateContextPack('role', roleCode);
    rolePacks.push({ roleCode, ...pack });
  }
  
  return {
    global: globalPack,
    sectors: sectorPacks,
    roles: rolePacks,
  };
}

export async function getLatestContextPack(
  packType: 'global' | 'sector' | 'role' | 'entity',
  targetCode?: string
): Promise<typeof contextPacks.$inferSelect | null> {
  const conditions = [eq(contextPacks.packType, packType)];
  if (targetCode) {
    conditions.push(eq(contextPacks.targetCode, targetCode));
  }
  
  const db = await getDb();
  if (!db) throw new Error('Database connection failed');
  
  const [pack] = await db
    .select()
    .from(contextPacks)
    .where(and(...conditions))
    .orderBy(desc(contextPacks.packDate))
    .limit(1);
  
  return pack || null;
}
