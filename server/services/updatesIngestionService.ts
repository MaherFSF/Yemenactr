/**
 * Updates Ingestion Pipeline Service
 * 
 * Handles ingestion of updates from approved sources with:
 * - Deduplication by content hash, URL, and normalized title
 * - Classification (sector, entity, theme tagging)
 * - Bilingualization with glossary enforcement
 * - Evidence pack generation
 */

import { getDb } from "../db";
import { 
  updateItems, 
  updateEvidenceBundles, 
  updateSignals,
  updateIngestionCheckpoints,
  sourceRegistry,
  evidencePacks
} from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import crypto from "crypto";

// Sector keywords for classification
const SECTOR_KEYWORDS: Record<string, string[]> = {
  currency_fx: ["exchange rate", "currency", "rial", "dollar", "forex", "سعر الصرف", "العملة", "الريال"],
  trade_commerce: ["trade", "export", "import", "customs", "tariff", "التجارة", "الصادرات", "الواردات"],
  aid_flows: ["humanitarian", "aid", "funding", "donor", "grant", "المساعدات", "التمويل", "المانحين"],
  public_finance: ["budget", "fiscal", "revenue", "expenditure", "tax", "الميزانية", "الإيرادات", "الضرائب"],
  prices_inflation: ["inflation", "price", "cost of living", "CPI", "التضخم", "الأسعار", "تكلفة المعيشة"],
  banking_finance: ["bank", "loan", "credit", "interest rate", "البنك", "القروض", "الائتمان"],
  energy_fuel: ["fuel", "oil", "gas", "electricity", "الوقود", "النفط", "الغاز", "الكهرباء"],
  food_security: ["food", "hunger", "famine", "IPC", "الغذاء", "الجوع", "المجاعة"],
  labor_wages: ["employment", "wages", "labor", "unemployment", "التوظيف", "الأجور", "البطالة"],
  poverty_humandev: ["poverty", "development", "HDI", "الفقر", "التنمية"],
};

// Entity keywords for linking
const ENTITY_KEYWORDS: Record<string, string[]> = {
  world_bank: ["World Bank", "WB", "IDA", "IBRD", "البنك الدولي"],
  imf: ["IMF", "International Monetary Fund", "صندوق النقد الدولي"],
  ocha: ["OCHA", "humanitarian affairs", "مكتب تنسيق الشؤون الإنسانية"],
  unhcr: ["UNHCR", "refugees", "المفوضية السامية للاجئين"],
  wfp: ["WFP", "World Food Programme", "برنامج الأغذية العالمي"],
  unicef: ["UNICEF", "children", "اليونيسف"],
  undp: ["UNDP", "development programme", "برنامج الأمم المتحدة الإنمائي"],
  cby_aden: ["Central Bank Aden", "CBY Aden", "البنك المركزي عدن"],
  cby_sanaa: ["Central Bank Sana'a", "CBY Sana'a", "البنك المركزي صنعاء"],
  mof: ["Ministry of Finance", "MoF", "وزارة المالية"],
  sfd: ["Social Fund", "SFD", "الصندوق الاجتماعي للتنمية"],
};

export interface RawUpdate {
  title: string;
  summary: string;
  body?: string;
  sourceUrl: string;
  sourcePublisher: string;
  publishedAt: Date;
  language: "en" | "ar";
  updateType?: string;
  metadata?: Record<string, unknown>;
}

export interface IngestionResult {
  success: boolean;
  updateItemId?: number;
  isDuplicate: boolean;
  error?: string;
}

/**
 * Generate content hash for deduplication
 */
function generateContentHash(title: string, sourceUrl: string, publishedAt: Date): string {
  const normalized = `${title.toLowerCase().trim()}|${sourceUrl}|${publishedAt.toISOString().split('T')[0]}`;
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Classify update by sector
 */
function classifySectors(title: string, summary: string): string[] {
  const text = `${title} ${summary}`.toLowerCase();
  const sectors: string[] = [];
  
  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        if (!sectors.includes(sector)) {
          sectors.push(sector);
        }
        break;
      }
    }
  }
  
  return sectors.length > 0 ? sectors : ["other"];
}

/**
 * Link update to entities
 */
function linkEntities(title: string, summary: string): string[] {
  const text = `${title} ${summary}`;
  const entities: string[] = [];
  
  for (const [entity, keywords] of Object.entries(ENTITY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        if (!entities.includes(entity)) {
          entities.push(entity);
        }
        break;
      }
    }
  }
  
  return entities;
}

/**
 * Determine regime tag based on content
 */
function determineRegimeTag(title: string, summary: string): "aden" | "sanaa" | "both" | "neutral" {
  const text = `${title} ${summary}`.toLowerCase();
  
  const adenKeywords = ["aden", "عدن", "southern", "الجنوب", "irg", "internationally recognized"];
  const sanaaKeywords = ["sana'a", "sanaa", "صنعاء", "houthi", "ansar allah", "de facto"];
  
  const hasAden = adenKeywords.some(k => text.includes(k));
  const hasSanaa = sanaaKeywords.some(k => text.includes(k));
  
  if (hasAden && hasSanaa) return "both";
  if (hasAden) return "aden";
  if (hasSanaa) return "sanaa";
  return "neutral";
}

/**
 * Simple bilingualization (placeholder - would use LLM in production)
 */
async function bilingualize(
  text: string, 
  fromLang: "en" | "ar", 
  toLang: "en" | "ar"
): Promise<string> {
  // In production, this would call the LLM service with glossary enforcement
  // For now, return a placeholder indicating translation needed
  if (fromLang === toLang) return text;
  
  // Placeholder translation marker
  return `[${toLang.toUpperCase()} Translation Pending] ${text}`;
}

/**
 * Determine sensitivity level based on content
 */
function determineSensitivity(
  title: string, 
  summary: string, 
  sourcePublisher: string
): "public_safe" | "needs_review" | "restricted_metadata_only" {
  const text = `${title} ${summary}`.toLowerCase();
  
  // Sensitive keywords that require review
  const sensitiveKeywords = [
    "conflict", "military", "attack", "casualty", "death",
    "الصراع", "عسكري", "هجوم", "ضحايا", "وفاة"
  ];
  
  // Check for sensitive content
  if (sensitiveKeywords.some(k => text.includes(k))) {
    return "needs_review";
  }
  
  // Trusted sources can be auto-published
  const trustedPublishers = [
    "World Bank", "IMF", "OCHA", "UNHCR", "WFP", "UNICEF", "UNDP"
  ];
  
  if (trustedPublishers.some(p => sourcePublisher.includes(p))) {
    return "public_safe";
  }
  
  return "needs_review";
}

/**
 * Ingest a single update from a source
 */
export async function ingestUpdate(
  raw: RawUpdate,
  sourceId: number
): Promise<IngestionResult> {
  const db = await getDb();
  if (!db) {
    return { success: false, isDuplicate: false, error: "Database not available" };
  }
  
  try {
    // Generate content hash for deduplication
    const contentHash = generateContentHash(raw.title, raw.sourceUrl, raw.publishedAt);
    
    // Check for duplicates
    const existing = await db.select()
      .from(updateItems)
      .where(eq(updateItems.contentHash, contentHash))
      .limit(1);
    
    if (existing.length > 0) {
      // Update seen count
      await db.update(updateItems)
        .set({ 
          seenCount: sql`${updateItems.seenCount} + 1`,
          retrievedAt: new Date()
        })
        .where(eq(updateItems.id, existing[0].id));
      
      return { 
        success: true, 
        updateItemId: existing[0].id, 
        isDuplicate: true 
      };
    }
    
    // Classify the update
    const sectors = classifySectors(raw.title, raw.summary);
    const entities = linkEntities(raw.title, raw.summary);
    const regimeTag = determineRegimeTag(raw.title, raw.summary);
    const sensitivity = determineSensitivity(raw.title, raw.summary, raw.sourcePublisher);
    
    // Bilingualize content
    const isEnglish = raw.language === "en";
    const titleEn = isEnglish ? raw.title : await bilingualize(raw.title, "ar", "en");
    const titleAr = isEnglish ? await bilingualize(raw.title, "en", "ar") : raw.title;
    const summaryEn = isEnglish ? raw.summary : await bilingualize(raw.summary, "ar", "en");
    const summaryAr = isEnglish ? await bilingualize(raw.summary, "en", "ar") : raw.summary;
    
    // Create evidence pack
    const [evidencePack] = await db.insert(evidencePacks).values({
      subjectType: "claim",
      subjectId: contentHash,
      subjectLabel: raw.title.substring(0, 500),
      citations: [{
        sourceId: sourceId,
        title: raw.title,
        publisher: raw.sourcePublisher,
        url: raw.sourceUrl,
        retrievalDate: new Date().toISOString(),
        licenseFlag: "unknown",
        anchor: "full_document"
      }],
      confidenceGrade: "B",
      regimeTags: ["neutral"],
      geoScope: "national",
      confidenceExplanation: "Auto-generated evidence pack for update ingestion",
    });
    
    const evidencePackId = evidencePack.insertId;
    
    // Insert the update item
    const [result] = await db.insert(updateItems).values({
      titleEn,
      titleAr,
      summaryEn,
      summaryAr,
      bodyEn: isEnglish ? raw.body : null,
      bodyAr: !isEnglish ? raw.body : null,
      sourceId,
      sourcePublisher: raw.sourcePublisher,
      sourceUrl: raw.sourceUrl,
      publishedAt: raw.publishedAt,
      contentHash,
      sectors: sectors,
      themes: [],
      entities: entities,
      geography: ["yemen"],
      regimeTag,
      sensitivityLevel: sensitivity,
      confidenceGrade: "B",
      confidenceReason: "Auto-classified based on source and content analysis",
      evidencePackId: Number(evidencePackId),
      status: sensitivity === "public_safe" ? "published" : "queued_for_review",
      visibility: sensitivity === "public_safe" ? "public" : "admin_only",
      updateType: (raw.updateType as any) || "other",
    });
    
    const updateItemId = result.insertId;
    
    // Create evidence bundle
    await db.insert(updateEvidenceBundles).values({
      updateItemId: Number(updateItemId),
      citations: [{
        text: raw.summary.substring(0, 500),
        sourceUrl: raw.sourceUrl,
        anchor: "full_document"
      }],
      licenseType: "unknown",
      whatChanged: [],
      extractionAnchors: [],
    });
    
    // Generate signals if high importance
    if (sectors.includes("currency_fx") || sectors.includes("aid_flows") || entities.length > 0) {
      await db.insert(updateSignals).values({
        updateItemId: Number(updateItemId),
        signalType: "sector_signal",
        targetType: "sector",
        targetId: sectors[0],
        signalTitleEn: titleEn,
        signalTitleAr: titleAr,
        signalSummaryEn: summaryEn.substring(0, 500),
        signalSummaryAr: summaryAr.substring(0, 500),
        priority: "medium",
        status: "pending",
        evidencePackId: Number(evidencePackId),
      });
    }
    
    return { 
      success: true, 
      updateItemId: Number(updateItemId), 
      isDuplicate: false 
    };
    
  } catch (error) {
    console.error("[UpdatesIngestion] Error:", error);
    return { 
      success: false, 
      isDuplicate: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Get or create ingestion checkpoint for a source
 */
export async function getIngestionCheckpoint(sourceId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const existing = await db.select()
    .from(updateIngestionCheckpoints)
    .where(eq(updateIngestionCheckpoints.sourceId, sourceId))
    .limit(1);
  
  if (existing.length > 0) {
    return existing[0];
  }
  
  // Create new checkpoint
  const [result] = await db.insert(updateIngestionCheckpoints).values({
    sourceId,
  });
  
  return {
    id: result.insertId,
    sourceId,
    lastCursor: null,
    lastSeenDate: null,
    lastHash: null,
    lastSuccessfulRun: null,
    totalIngested: 0,
    totalDuplicates: 0,
    totalErrors: 0,
  };
}

/**
 * Update ingestion checkpoint after a run
 */
export async function updateIngestionCheckpoint(
  sourceId: number,
  updates: {
    lastCursor?: string;
    lastSeenDate?: Date;
    lastHash?: string;
    ingested?: number;
    duplicates?: number;
    errors?: number;
  }
) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(updateIngestionCheckpoints)
    .set({
      lastCursor: updates.lastCursor,
      lastSeenDate: updates.lastSeenDate,
      lastHash: updates.lastHash,
      lastSuccessfulRun: new Date(),
      totalIngested: updates.ingested ? sql`${updateIngestionCheckpoints.totalIngested} + ${updates.ingested}` : undefined,
      totalDuplicates: updates.duplicates ? sql`${updateIngestionCheckpoints.totalDuplicates} + ${updates.duplicates}` : undefined,
      totalErrors: updates.errors ? sql`${updateIngestionCheckpoints.totalErrors} + ${updates.errors}` : undefined,
    })
    .where(eq(updateIngestionCheckpoints.sourceId, sourceId));
}

/**
 * Get approved sources for updates ingestion
 */
export async function getApprovedUpdateSources() {
  const db = await getDb();
  if (!db) return [];
  
  // sourceRegistry table - get all sources
  const approvedSources = await db.select()
    .from(sourceRegistry);
  
  return approvedSources;
}

/**
 * Run daily updates ingestion job
 */
export async function runDailyUpdatesIngestion(): Promise<{
  totalProcessed: number;
  totalIngested: number;
  totalDuplicates: number;
  totalErrors: number;
  sourceResults: Array<{
    sourceId: number;
    sourceName: string;
    ingested: number;
    duplicates: number;
    errors: number;
  }>;
}> {
  const approvedSources = await getApprovedUpdateSources();
  
  const results = {
    totalProcessed: 0,
    totalIngested: 0,
    totalDuplicates: 0,
    totalErrors: 0,
    sourceResults: [] as Array<{
      sourceId: number;
      sourceName: string;
      ingested: number;
      duplicates: number;
      errors: number;
    }>,
  };
  
  for (const source of approvedSources) {
    // In production, each source would have its own connector
    // For now, we simulate the ingestion
    const sourceResult = {
      sourceId: source.id,
      sourceName: source.name,
      ingested: 0,
      duplicates: 0,
      errors: 0,
    };
    
    // Update checkpoint
    await updateIngestionCheckpoint(source.id, {
      lastSeenDate: new Date(),
      ingested: sourceResult.ingested,
      duplicates: sourceResult.duplicates,
      errors: sourceResult.errors,
    });
    
    results.sourceResults.push(sourceResult);
    results.totalIngested += sourceResult.ingested;
    results.totalDuplicates += sourceResult.duplicates;
    results.totalErrors += sourceResult.errors;
  }
  
  results.totalProcessed = approvedSources.length;
  
  return results;
}

