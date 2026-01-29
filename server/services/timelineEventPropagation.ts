/**
 * Timeline Event Propagation Service
 * 
 * Automatically propagates events across the platform:
 * - Any data update → creates timeline event
 * - Any timeline event → creates sector signal
 * - Any sector signal → appears in VIP "what changed"
 * - Any entity action → creates timeline event
 */

import { db } from "../db";
import {
  economicEvents,
  knowledgeGraphLinks,
  sectorSignals,
  libraryDocuments,
} from "../../drizzle/schema";
import { eq, desc, and, sql, inArray, gte } from "drizzle-orm";
import * as knowledgeGraphService from "./knowledgeGraphService";

// Event types that can be propagated
export type PropagableEventType = 
  | "data_update"
  | "document_published"
  | "entity_action"
  | "policy_change"
  | "market_event"
  | "humanitarian_event"
  | "conflict_event"
  | "economic_indicator";

// Sector signal types
export type SignalType = 
  | "critical"
  | "warning"
  | "info"
  | "positive"
  | "negative";

// ============================================================================
// EVENT CREATION
// ============================================================================

/**
 * Create a timeline event from a data update
 */
export async function createEventFromDataUpdate(params: {
  indicatorCode: string;
  indicatorName: string;
  indicatorNameAr?: string;
  oldValue?: number;
  newValue: number;
  changePercent?: number;
  source: string;
  sectors: string[];
  regime?: string;
}): Promise<number | null> {
  try {
    const eventDate = new Date();
    const isSignificant = Math.abs(params.changePercent || 0) > 5;
    
    // Create timeline event
    const result = await db.insert(economicEvents).values({
      eventType: "data_update",
      titleEn: `${params.indicatorName} updated to ${params.newValue}`,
      titleAr: params.indicatorNameAr 
        ? `تحديث ${params.indicatorNameAr} إلى ${params.newValue}`
        : undefined,
      descriptionEn: params.changePercent 
        ? `${params.indicatorName} changed by ${params.changePercent > 0 ? '+' : ''}${params.changePercent.toFixed(1)}% from ${params.oldValue} to ${params.newValue}`
        : `${params.indicatorName} updated to ${params.newValue}`,
      eventDate,
      source: params.source,
      impactLevel: isSignificant ? "medium" : "low",
      sectors: params.sectors,
      regimeTag: params.regime || "mixed",
    });
    
    const eventId = Number(result.insertId);
    
    // Create sector signals if significant
    if (isSignificant && params.sectors.length > 0) {
      await createSectorSignalsFromEvent({
        eventId,
        sectors: params.sectors,
        signalType: params.changePercent && params.changePercent > 0 ? "positive" : "negative",
        magnitude: Math.abs(params.changePercent || 0),
        titleEn: `${params.indicatorName} ${params.changePercent && params.changePercent > 0 ? 'increased' : 'decreased'} by ${Math.abs(params.changePercent || 0).toFixed(1)}%`,
        titleAr: params.indicatorNameAr 
          ? `${params.indicatorNameAr} ${params.changePercent && params.changePercent > 0 ? 'ارتفع' : 'انخفض'} بنسبة ${Math.abs(params.changePercent || 0).toFixed(1)}%`
          : undefined,
      });
    }
    
    // Create graph links
    await knowledgeGraphService.createLink({
      linkType: "update_signal",
      srcType: "indicator",
      srcId: 0, // Would need indicator ID
      srcLabel: params.indicatorCode,
      dstType: "event",
      dstId: eventId,
      dstLabel: `Data update: ${params.indicatorName}`,
      strengthScore: isSignificant ? 0.9 : 0.6,
      confidenceLevel: "high",
      method: "auto_propagation",
      status: "active",
    });
    
    return eventId;
  } catch (error) {
    console.error("[TimelinePropagation] Error creating event from data update:", error);
    return null;
  }
}

/**
 * Create a timeline event from a document publication
 */
export async function createEventFromDocument(params: {
  documentId: number;
  titleEn: string;
  titleAr?: string;
  publisher: string;
  sectors: string[];
  publishedAt: Date;
}): Promise<number | null> {
  try {
    // Create timeline event
    const result = await db.insert(economicEvents).values({
      eventType: "document_published",
      titleEn: `New report: ${params.titleEn}`,
      titleAr: params.titleAr ? `تقرير جديد: ${params.titleAr}` : undefined,
      descriptionEn: `${params.publisher} published "${params.titleEn}"`,
      eventDate: params.publishedAt,
      source: params.publisher,
      impactLevel: "low",
      sectors: params.sectors,
    });
    
    const eventId = Number(result.insertId);
    
    // Create graph link between document and event
    await knowledgeGraphService.createLink({
      linkType: "publishes",
      srcType: "document",
      srcId: params.documentId,
      srcLabel: params.titleEn,
      dstType: "event",
      dstId: eventId,
      dstLabel: `Publication event`,
      strengthScore: 1.0,
      confidenceLevel: "high",
      method: "auto_propagation",
      status: "active",
    });
    
    // Create sector signals for relevant sectors
    if (params.sectors.length > 0) {
      await createSectorSignalsFromEvent({
        eventId,
        sectors: params.sectors,
        signalType: "info",
        magnitude: 0,
        titleEn: `New ${params.publisher} report on ${params.sectors.join(", ")}`,
        titleAr: params.titleAr ? `تقرير جديد من ${params.publisher}` : undefined,
      });
    }
    
    return eventId;
  } catch (error) {
    console.error("[TimelinePropagation] Error creating event from document:", error);
    return null;
  }
}

/**
 * Create a timeline event from an entity action
 */
export async function createEventFromEntityAction(params: {
  entityId: number;
  entityName: string;
  entityNameAr?: string;
  actionType: string;
  titleEn: string;
  titleAr?: string;
  descriptionEn: string;
  descriptionAr?: string;
  sectors: string[];
  impactLevel: "low" | "medium" | "high" | "critical";
  eventDate: Date;
}): Promise<number | null> {
  try {
    // Create timeline event
    const result = await db.insert(economicEvents).values({
      eventType: "entity_action",
      titleEn: params.titleEn,
      titleAr: params.titleAr,
      descriptionEn: params.descriptionEn,
      descriptionAr: params.descriptionAr,
      eventDate: params.eventDate,
      source: params.entityName,
      impactLevel: params.impactLevel,
      sectors: params.sectors,
    });
    
    const eventId = Number(result.insertId);
    
    // Create graph link between entity and event
    await knowledgeGraphService.createLink({
      linkType: "affects",
      srcType: "entity",
      srcId: params.entityId,
      srcLabel: params.entityName,
      dstType: "event",
      dstId: eventId,
      dstLabel: params.titleEn,
      strengthScore: 0.9,
      confidenceLevel: "high",
      method: "auto_propagation",
      status: "active",
    });
    
    // Create sector signals based on impact level
    if (params.impactLevel !== "low") {
      const signalType: SignalType = 
        params.impactLevel === "critical" ? "critical" :
        params.impactLevel === "high" ? "warning" : "info";
      
      await createSectorSignalsFromEvent({
        eventId,
        sectors: params.sectors,
        signalType,
        magnitude: params.impactLevel === "critical" ? 100 : params.impactLevel === "high" ? 50 : 25,
        titleEn: params.titleEn,
        titleAr: params.titleAr,
      });
    }
    
    return eventId;
  } catch (error) {
    console.error("[TimelinePropagation] Error creating event from entity action:", error);
    return null;
  }
}

// ============================================================================
// SECTOR SIGNALS
// ============================================================================

/**
 * Create sector signals from a timeline event
 */
export async function createSectorSignalsFromEvent(params: {
  eventId: number;
  sectors: string[];
  signalType: SignalType;
  magnitude: number;
  titleEn: string;
  titleAr?: string;
}): Promise<number[]> {
  const signalIds: number[] = [];
  
  try {
    for (const sector of params.sectors) {
      const result = await db.insert(sectorSignals).values({
        sectorCode: sector,
        signalType: params.signalType,
        titleEn: params.titleEn,
        titleAr: params.titleAr,
        magnitude: params.magnitude,
        sourceEventId: params.eventId,
        detectedAt: new Date(),
        isActive: true,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });
      
      signalIds.push(Number(result.insertId));
    }
    
    return signalIds;
  } catch (error) {
    console.error("[TimelinePropagation] Error creating sector signals:", error);
    return signalIds;
  }
}

/**
 * Get active signals for a sector
 */
export async function getActiveSectorSignals(sectorCode: string, limit: number = 10): Promise<any[]> {
  try {
    return await db
      .select()
      .from(sectorSignals)
      .where(and(
        eq(sectorSignals.sectorCode, sectorCode),
        eq(sectorSignals.isActive, true),
        gte(sectorSignals.expiresAt, new Date())
      ))
      .orderBy(desc(sectorSignals.detectedAt))
      .limit(limit);
  } catch (error) {
    console.error("[TimelinePropagation] Error getting sector signals:", error);
    return [];
  }
}

/**
 * Get signals for VIP "what changed" view
 */
export async function getVipWhatChanged(params: {
  roleCode: string;
  sectors: string[];
  since?: Date;
  limit?: number;
}): Promise<any[]> {
  try {
    const sinceDate = params.since || new Date(Date.now() - 24 * 60 * 60 * 1000); // Default: last 24 hours
    
    // Get signals for relevant sectors
    const signals = await db
      .select()
      .from(sectorSignals)
      .where(and(
        inArray(sectorSignals.sectorCode, params.sectors),
        eq(sectorSignals.isActive, true),
        gte(sectorSignals.detectedAt, sinceDate)
      ))
      .orderBy(desc(sectorSignals.detectedAt))
      .limit(params.limit || 20);
    
    // Enrich with event details
    const enrichedSignals = await Promise.all(
      signals.map(async (signal) => {
        if (signal.sourceEventId) {
          const events = await db
            .select()
            .from(economicEvents)
            .where(eq(economicEvents.id, signal.sourceEventId))
            .limit(1);
          
          return {
            ...signal,
            event: events[0] || null,
          };
        }
        return { ...signal, event: null };
      })
    );
    
    return enrichedSignals;
  } catch (error) {
    console.error("[TimelinePropagation] Error getting VIP what changed:", error);
    return [];
  }
}

// ============================================================================
// PROPAGATION TRIGGERS
// ============================================================================

/**
 * Trigger propagation for a new document
 */
export async function propagateNewDocument(documentId: number): Promise<void> {
  try {
    const docs = await db
      .select()
      .from(libraryDocuments)
      .where(eq(libraryDocuments.id, documentId))
      .limit(1);
    
    if (docs.length === 0) return;
    
    const doc = docs[0];
    
    await createEventFromDocument({
      documentId: doc.id,
      titleEn: doc.titleEn,
      titleAr: doc.titleAr || undefined,
      publisher: doc.publisherName,
      sectors: (doc.sectors as string[]) || [],
      publishedAt: doc.publishedAt || new Date(),
    });
  } catch (error) {
    console.error("[TimelinePropagation] Error propagating new document:", error);
  }
}

/**
 * Expire old signals
 */
export async function expireOldSignals(): Promise<number> {
  try {
    const result = await db
      .update(sectorSignals)
      .set({ isActive: false })
      .where(and(
        eq(sectorSignals.isActive, true),
        sql`${sectorSignals.expiresAt} < NOW()`
      ));
    
    return result.rowsAffected || 0;
  } catch (error) {
    console.error("[TimelinePropagation] Error expiring old signals:", error);
    return 0;
  }
}

/**
 * Get propagation statistics
 */
export async function getPropagationStats(): Promise<{
  totalEvents: number;
  totalSignals: number;
  activeSignals: number;
  eventsByType: Record<string, number>;
  signalsBySector: Record<string, number>;
}> {
  try {
    // Count events
    const eventCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(economicEvents);
    
    // Count signals
    const signalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(sectorSignals);
    
    // Count active signals
    const activeSignalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(sectorSignals)
      .where(eq(sectorSignals.isActive, true));
    
    return {
      totalEvents: eventCount[0]?.count || 0,
      totalSignals: signalCount[0]?.count || 0,
      activeSignals: activeSignalCount[0]?.count || 0,
      eventsByType: {},
      signalsBySector: {},
    };
  } catch (error) {
    console.error("[TimelinePropagation] Error getting propagation stats:", error);
    return {
      totalEvents: 0,
      totalSignals: 0,
      activeSignals: 0,
      eventsByType: {},
      signalsBySector: {},
    };
  }
}
