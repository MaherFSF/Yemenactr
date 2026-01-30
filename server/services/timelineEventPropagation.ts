/**
 * Timeline Event Propagation Service
 * 
 * Automatically propagates events across the platform:
 * - Any data update → creates timeline event
 * - Any timeline event → creates alert
 * - Any alert → appears in VIP "what changed"
 * - Any entity action → creates timeline event
 */

import { db } from "../db";
import {
  economicEvents,
  knowledgeGraphLinks,
  alerts,
  documents,
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

// Signal types (mapped to alert severity)
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
      title: `${params.indicatorName} updated to ${params.newValue}`,
      titleAr: params.indicatorNameAr 
        ? `تحديث ${params.indicatorNameAr} إلى ${params.newValue}`
        : undefined,
      description: params.changePercent 
        ? `${params.indicatorName} changed by ${params.changePercent > 0 ? '+' : ''}${params.changePercent.toFixed(1)}% from ${params.oldValue} to ${params.newValue}`
        : `${params.indicatorName} updated to ${params.newValue}`,
      eventDate,
      category: "data_update",
      impactLevel: isSignificant ? "medium" : "low",
      regimeTag: (params.regime || "mixed") as "aden_irg" | "sanaa_defacto" | "mixed" | "unknown",
    });
    
    const eventId = Number((result as any).insertId);
    
    // Create alerts if significant
    if (isSignificant && params.sectors.length > 0) {
      await createAlertsFromEvent({
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
      srcId: 0,
      srcLabel: params.indicatorCode,
      dstType: "event",
      dstId: eventId,
      dstLabel: `Data update: ${params.indicatorName}`,
      strengthScore: isSignificant ? 0.9 : 0.6,
      confidenceLevel: "high",
      method: "auto" as any,
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
      title: `New report: ${params.titleEn}`,
      titleAr: params.titleAr ? `تقرير جديد: ${params.titleAr}` : undefined,
      description: `${params.publisher} published "${params.titleEn}"`,
      eventDate: params.publishedAt,
      category: "document_published",
      impactLevel: "low",
      regimeTag: "mixed",
    });
    
    const eventId = Number((result as any).insertId);
    
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
      method: "auto" as any,
      status: "active",
    });
    
    // Create alerts for relevant sectors
    if (params.sectors.length > 0) {
      await createAlertsFromEvent({
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
      title: params.titleEn,
      titleAr: params.titleAr,
      description: params.descriptionEn,
      descriptionAr: params.descriptionAr,
      eventDate: params.eventDate,
      category: "entity_action",
      impactLevel: params.impactLevel,
      regimeTag: "mixed",
    });
    
    const eventId = Number((result as any).insertId);
    
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
      method: "auto" as any,
      status: "active",
    });
    
    // Create alerts based on impact level
    if (params.impactLevel !== "low") {
      const signalType: SignalType = 
        params.impactLevel === "critical" ? "critical" :
        params.impactLevel === "high" ? "warning" : "info";
      
      await createAlertsFromEvent({
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
// ALERTS (Sector Signals)
// ============================================================================

/**
 * Create alerts from a timeline event
 */
export async function createAlertsFromEvent(params: {
  eventId: number;
  sectors: string[];
  signalType: SignalType;
  magnitude: number;
  titleEn: string;
  titleAr?: string;
}): Promise<number[]> {
  const alertIds: number[] = [];
  
  try {
    // Map signal type to alert severity
    const severity = params.signalType === "critical" ? "critical" :
                     params.signalType === "warning" ? "warning" : "info";
    
    for (const sector of params.sectors) {
      const result = await db.insert(alerts).values({
        type: params.signalType,
        title: params.titleEn,
        titleAr: params.titleAr,
        description: `Event ID: ${params.eventId}, Sector: ${sector}, Magnitude: ${params.magnitude}`,
        indicatorCode: sector,
        severity,
        isRead: false,
      });
      
      alertIds.push(Number((result as any).insertId));
    }
    
    return alertIds;
  } catch (error) {
    console.error("[TimelinePropagation] Error creating alerts:", error);
    return alertIds;
  }
}

/**
 * Get active alerts for a sector
 */
export async function getActiveSectorSignals(sectorCode: string, limit: number = 10): Promise<any[]> {
  try {
    return await db
      .select()
      .from(alerts)
      .where(and(
        eq(alerts.indicatorCode, sectorCode),
        eq(alerts.isRead, false)
      ))
      .orderBy(desc(alerts.createdAt))
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
    
    // Get alerts for relevant sectors
    const alertList = await db
      .select()
      .from(alerts)
      .where(and(
        inArray(alerts.indicatorCode, params.sectors),
        eq(alerts.isRead, false),
        gte(alerts.createdAt, sinceDate)
      ))
      .orderBy(desc(alerts.createdAt))
      .limit(params.limit || 20);
    
    return alertList;
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
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);
    
    if (docs.length === 0) return;
    
    const doc = docs[0];
    
    await createEventFromDocument({
      documentId: doc.id,
      titleEn: doc.title,
      titleAr: doc.titleAr || undefined,
      publisher: "Unknown",
      sectors: (doc.tags as string[]) || [],
      publishedAt: doc.publicationDate || new Date(),
    });
  } catch (error) {
    console.error("[TimelinePropagation] Error propagating new document:", error);
  }
}

/**
 * Mark old alerts as read (expire)
 */
export async function expireOldSignals(): Promise<number> {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const result = await db
      .update(alerts)
      .set({ isRead: true })
      .where(and(
        eq(alerts.isRead, false),
        sql`${alerts.createdAt} < ${sevenDaysAgo}`
      ));
    
    return (result as any).rowsAffected || 0;
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
    
    // Count alerts
    const alertCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(alerts);
    
    // Count unread alerts
    const unreadAlertCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(alerts)
      .where(eq(alerts.isRead, false));
    
    return {
      totalEvents: eventCount[0]?.count || 0,
      totalSignals: alertCount[0]?.count || 0,
      activeSignals: unreadAlertCount[0]?.count || 0,
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

// Legacy function names for backward compatibility
export const createSectorSignalsFromEvent = createAlertsFromEvent;
