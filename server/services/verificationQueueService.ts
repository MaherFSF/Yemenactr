/**
 * Verification Queue Service
 * Handles media event detection, corroboration, and verification workflow
 */

import { db } from '../db';
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';

// Types for verification queue
interface VerificationEvent {
  id?: number;
  eventType: 'PRICE_CHANGE' | 'POLICY_ANNOUNCEMENT' | 'CONFLICT_EVENT' | 'ECONOMIC_INDICATOR' | 'ENTITY_ACTION' | 'OTHER';
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  sourceRegistryId?: number;
  sourceUrl?: string;
  sourceName?: string;
  detectedAt: Date;
  extractedData?: {
    values?: Record<string, unknown>;
    entities?: string[];
    locations?: string[];
    dates?: string[];
  };
  sectorCode?: string;
  entityIds?: number[];
}

interface CorroboratingSource {
  sourceId: string;
  url: string;
  matchScore: number;
}

// Event type keywords for classification
const eventTypeKeywords: Record<string, string[]> = {
  PRICE_CHANGE: ['price', 'cost', 'سعر', 'تكلفة', 'ارتفاع', 'انخفاض', 'fuel', 'food', 'currency'],
  POLICY_ANNOUNCEMENT: ['policy', 'announce', 'decision', 'قرار', 'سياسة', 'إعلان', 'central bank', 'ministry'],
  CONFLICT_EVENT: ['attack', 'conflict', 'strike', 'هجوم', 'صراع', 'غارة', 'military', 'violence'],
  ECONOMIC_INDICATOR: ['gdp', 'inflation', 'unemployment', 'تضخم', 'بطالة', 'growth', 'economic'],
  ENTITY_ACTION: ['company', 'organization', 'شركة', 'منظمة', 'signed', 'agreement', 'partnership'],
};

// Sector keywords for routing
const sectorKeywords: Record<string, string[]> = {
  macro: ['gdp', 'economy', 'growth', 'اقتصاد', 'نمو'],
  prices: ['price', 'inflation', 'cost', 'سعر', 'تضخم'],
  currency: ['exchange', 'rial', 'dollar', 'صرف', 'ريال'],
  trade: ['import', 'export', 'trade', 'استيراد', 'تصدير'],
  humanitarian: ['aid', 'relief', 'humanitarian', 'مساعدات', 'إغاثة'],
  banking: ['bank', 'loan', 'credit', 'بنك', 'قرض'],
  energy: ['fuel', 'oil', 'electricity', 'وقود', 'نفط', 'كهرباء'],
  food_security: ['food', 'hunger', 'famine', 'غذاء', 'مجاعة'],
};

/**
 * Classify event type based on text content
 */
export function classifyEventType(text: string): string {
  const lowerText = text.toLowerCase();
  
  for (const [eventType, keywords] of Object.entries(eventTypeKeywords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return eventType;
      }
    }
  }
  
  return 'OTHER';
}

/**
 * Detect sector from text content
 */
export function detectSector(text: string): string | null {
  const lowerText = text.toLowerCase();
  
  for (const [sector, keywords] of Object.entries(sectorKeywords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return sector;
      }
    }
  }
  
  return null;
}

/**
 * Extract entities from text (simple keyword-based extraction)
 */
export function extractEntities(text: string): string[] {
  const entities: string[] = [];
  
  // Common Yemen-related entity patterns
  const entityPatterns = [
    /Central Bank of Yemen/gi,
    /CBY/gi,
    /World Bank/gi,
    /IMF/gi,
    /UN OCHA/gi,
    /WFP/gi,
    /Ministry of Finance/gi,
    /Ministry of Industry/gi,
    /البنك المركزي اليمني/g,
    /وزارة المالية/g,
    /البنك الدولي/g,
  ];
  
  for (const pattern of entityPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      entities.push(...matches);
    }
  }
  
  return [...new Set(entities)];
}

/**
 * Extract locations from text
 */
export function extractLocations(text: string): string[] {
  const locations: string[] = [];
  
  const locationPatterns = [
    /Aden/gi,
    /Sana'?a/gi,
    /Taiz/gi,
    /Hodeidah/gi,
    /Marib/gi,
    /عدن/g,
    /صنعاء/g,
    /تعز/g,
    /الحديدة/g,
    /مأرب/g,
  ];
  
  for (const pattern of locationPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      locations.push(...matches);
    }
  }
  
  return [...new Set(locations)];
}

/**
 * Extract dates from text
 */
export function extractDates(text: string): string[] {
  const dates: string[] = [];
  
  // Common date patterns
  const datePatterns = [
    /\d{1,2}\/\d{1,2}\/\d{2,4}/g,
    /\d{1,2}-\d{1,2}-\d{2,4}/g,
    /\d{4}-\d{2}-\d{2}/g,
    /January|February|March|April|May|June|July|August|September|October|November|December/gi,
    /يناير|فبراير|مارس|أبريل|مايو|يونيو|يوليو|أغسطس|سبتمبر|أكتوبر|نوفمبر|ديسمبر/g,
  ];
  
  for (const pattern of datePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      dates.push(...matches);
    }
  }
  
  return [...new Set(dates)];
}

/**
 * Calculate corroboration score based on matching sources
 */
export function calculateCorroborationScore(corroboratingSources: CorroboratingSource[]): number {
  if (corroboratingSources.length === 0) return 0;
  
  // Base score from number of sources
  let score = Math.min(corroboratingSources.length * 20, 60);
  
  // Add average match score
  const avgMatchScore = corroboratingSources.reduce((sum, s) => sum + s.matchScore, 0) / corroboratingSources.length;
  score += avgMatchScore * 0.4;
  
  return Math.min(Math.round(score), 100);
}

/**
 * Add event to verification queue
 */
export async function addToVerificationQueue(event: VerificationEvent): Promise<number> {
  // Auto-classify if not provided
  const eventType = event.eventType || classifyEventType(event.title + ' ' + (event.description || ''));
  const sectorCode = event.sectorCode || detectSector(event.title + ' ' + (event.description || ''));
  
  // Extract data if not provided
  const extractedData = event.extractedData || {
    entities: extractEntities(event.title + ' ' + (event.description || '')),
    locations: extractLocations(event.title + ' ' + (event.description || '')),
    dates: extractDates(event.title + ' ' + (event.description || '')),
  };
  
  // Insert into database using raw SQL since we're using a new table
  const result = await db.execute(sql`
    INSERT INTO verification_queue (
      eventType, title, titleAr, description, descriptionAr,
      sourceRegistryId, sourceUrl, sourceName, detectedAt,
      extractedData, status, sectorCode, entityIds, createdAt, updatedAt
    ) VALUES (
      ${eventType}, ${event.title}, ${event.titleAr || null}, 
      ${event.description || null}, ${event.descriptionAr || null},
      ${event.sourceRegistryId || null}, ${event.sourceUrl || null}, 
      ${event.sourceName || null}, ${event.detectedAt},
      ${JSON.stringify(extractedData)}, 'PENDING', ${sectorCode || null},
      ${JSON.stringify(event.entityIds || [])}, NOW(), NOW()
    )
  `);
  
  return (result as any).insertId || 0;
}

/**
 * Get pending verification events
 */
export async function getPendingVerifications(options?: {
  eventType?: string;
  sectorCode?: string;
  limit?: number;
  offset?: number;
}): Promise<any[]> {
  const limit = options?.limit || 50;
  const offset = options?.offset || 0;
  
  let query = sql`
    SELECT * FROM verification_queue 
    WHERE status = 'PENDING'
  `;
  
  if (options?.eventType) {
    query = sql`${query} AND eventType = ${options.eventType}`;
  }
  
  if (options?.sectorCode) {
    query = sql`${query} AND sectorCode = ${options.sectorCode}`;
  }
  
  query = sql`${query} ORDER BY detectedAt DESC LIMIT ${limit} OFFSET ${offset}`;
  
  const result = await db.execute(query);
  return (result as any)[0] || [];
}

/**
 * Verify an event (mark as verified and optionally create record)
 */
export async function verifyEvent(
  eventId: number,
  verifiedBy: number,
  notes?: string,
  createRecord?: {
    recordType: string;
    recordId: number;
  }
): Promise<boolean> {
  await db.execute(sql`
    UPDATE verification_queue 
    SET status = 'VERIFIED',
        verifiedBy = ${verifiedBy},
        verifiedAt = NOW(),
        verificationNotes = ${notes || null},
        createdRecordType = ${createRecord?.recordType || null},
        createdRecordId = ${createRecord?.recordId || null},
        updatedAt = NOW()
    WHERE id = ${eventId}
  `);
  
  return true;
}

/**
 * Reject an event
 */
export async function rejectEvent(
  eventId: number,
  verifiedBy: number,
  reason: string
): Promise<boolean> {
  await db.execute(sql`
    UPDATE verification_queue 
    SET status = 'REJECTED',
        verifiedBy = ${verifiedBy},
        verifiedAt = NOW(),
        verificationNotes = ${reason},
        updatedAt = NOW()
    WHERE id = ${eventId}
  `);
  
  return true;
}

/**
 * Update corroboration for an event
 */
export async function updateCorroboration(
  eventId: number,
  corroboratingSources: CorroboratingSource[]
): Promise<void> {
  const score = calculateCorroborationScore(corroboratingSources);
  
  await db.execute(sql`
    UPDATE verification_queue 
    SET corroboratingSources = ${JSON.stringify(corroboratingSources)},
        corroborationScore = ${score},
        updatedAt = NOW()
    WHERE id = ${eventId}
  `);
}

/**
 * Get verification statistics
 */
export async function getVerificationStats(): Promise<{
  pending: number;
  verified: number;
  rejected: number;
  needsMoreEvidence: number;
  byEventType: Record<string, number>;
  avgCorroborationScore: number;
}> {
  const result = await db.execute(sql`
    SELECT 
      SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'VERIFIED' THEN 1 ELSE 0 END) as verified,
      SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected,
      SUM(CASE WHEN status = 'NEEDS_MORE_EVIDENCE' THEN 1 ELSE 0 END) as needsMoreEvidence,
      AVG(corroborationScore) as avgCorroborationScore
    FROM verification_queue
  `);
  
  const stats = (result as any)[0]?.[0] || {};
  
  // Get by event type
  const byTypeResult = await db.execute(sql`
    SELECT eventType, COUNT(*) as count
    FROM verification_queue
    WHERE status = 'PENDING'
    GROUP BY eventType
  `);
  
  const byEventType: Record<string, number> = {};
  for (const row of (byTypeResult as any)[0] || []) {
    byEventType[row.eventType] = row.count;
  }
  
  return {
    pending: stats.pending || 0,
    verified: stats.verified || 0,
    rejected: stats.rejected || 0,
    needsMoreEvidence: stats.needsMoreEvidence || 0,
    byEventType,
    avgCorroborationScore: Math.round(stats.avgCorroborationScore || 0),
  };
}

/**
 * Detect events from media source content
 */
export async function detectEventsFromContent(
  content: string,
  sourceName: string,
  sourceUrl?: string,
  sourceRegistryId?: number
): Promise<number[]> {
  const createdIds: number[] = [];
  
  // Split content into potential events (by paragraph or sentence)
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 50);
  
  for (const paragraph of paragraphs) {
    // Check if this looks like an event
    const eventType = classifyEventType(paragraph);
    if (eventType === 'OTHER') continue;
    
    // Extract title (first sentence or first 100 chars)
    const title = paragraph.split(/[.!?]/)[0]?.trim().substring(0, 200) || paragraph.substring(0, 200);
    
    const id = await addToVerificationQueue({
      eventType: eventType as any,
      title,
      description: paragraph,
      sourceName,
      sourceUrl,
      sourceRegistryId,
      detectedAt: new Date(),
    });
    
    if (id > 0) {
      createdIds.push(id);
    }
  }
  
  return createdIds;
}
