/**
 * Auto-Enrichment Engine
 * 
 * Automatically generates knowledge graph links when new content is ingested.
 * This makes YETO feel "alive" by auto-connecting:
 * - Documents to sectors, entities, indicators
 * - Updates to sectors, entities, events
 * - Events to indicators, documents
 * - Entities to documents, projects
 */

import { db } from "../db";
import {
  knowledgeGraphLinks,
  linkRules,
  graphReviewQueue,
  libraryDocuments,
  entities,
  economicEvents,
  citationAnchors,
  evidencePacks,
  timeSeries,
} from "../../drizzle/schema";
import { eq, and, sql, desc, inArray } from "drizzle-orm";
import * as knowledgeGraphService from "./knowledgeGraphService";
import type { LinkType, NodeType, LinkMethod } from "./knowledgeGraphService";

// ============================================================================
// DOCUMENT ENRICHMENT
// ============================================================================

/**
 * Enrich a newly ingested document with knowledge graph links
 */
export async function enrichDocument(documentId: number): Promise<{
  linksCreated: number;
  linksSuggested: number;
}> {
  let linksCreated = 0;
  let linksSuggested = 0;
  
  // Get the document
  const docs = await db
    .select()
    .from(libraryDocuments)
    .where(eq(libraryDocuments.id, documentId))
    .limit(1);
  
  if (docs.length === 0) {
    throw new Error(`Document ${documentId} not found`);
  }
  
  const doc = docs[0];
  
  // 1. Link to sectors based on tags
  const sectors = (doc.sectors as string[]) ?? [];
  for (const sector of sectors) {
    const result = await createLinkIfNotExists({
      linkType: "related_to",
      srcType: "document",
      srcId: doc.id,
      srcLabel: doc.titleEn ?? doc.titleAr ?? `Document #${doc.id}`,
      dstType: "sector",
      dstId: 0, // Sectors identified by label
      dstLabel: sector,
      strengthScore: 0.8,
      method: "tag_based",
      status: "active",
    });
    if (result.created) linksCreated++;
  }
  
  // 2. Link to publisher entity
  if (doc.publisherName) {
    // Find matching entity
    const matchingEntities = await db
      .select()
      .from(entities)
      .where(
        sql`LOWER(${entities.name}) LIKE LOWER(${`%${doc.publisherName}%`})`
      )
      .limit(1);
    
    if (matchingEntities.length > 0) {
      const entity = matchingEntities[0];
      const result = await createLinkIfNotExists({
        linkType: "publishes",
        srcType: "entity",
        srcId: entity.id,
        srcLabel: entity.name ?? entity.nameAr ?? `Entity #${entity.id}`,
        dstType: "document",
        dstId: doc.id,
        dstLabel: doc.titleEn ?? doc.titleAr ?? `Document #${doc.id}`,
        strengthScore: 0.9,
        method: "structured_data",
        status: "active",
      });
      if (result.created) linksCreated++;
    }
  }
  
  // 3. Link to entities mentioned in document (from citation anchors)
  const anchors = await db
    .select()
    .from(citationAnchors)
    .where(eq(citationAnchors.versionId, documentId));
  
  for (const anchor of anchors) {
    // Check if anchor mentions an entity
    const anchorText = anchor.snippetText ?? anchor.snippetTextAr ?? "";
    
    // Find entities mentioned in the anchor
    const mentionedEntities = await db
      .select()
      .from(entities)
      .where(
        sql`${anchorText} LIKE CONCAT('%', ${entities.name}, '%')`
      )
      .limit(5);
    
    for (const entity of mentionedEntities) {
      const result = await createLinkIfNotExists({
        linkType: "mentions",
        srcType: "document",
        srcId: doc.id,
        srcLabel: doc.titleEn ?? doc.titleAr ?? `Document #${doc.id}`,
        dstType: "entity",
        dstId: entity.id,
        dstLabel: entity.name ?? entity.nameAr ?? `Entity #${entity.id}`,
        strengthScore: 0.7,
        method: "extracted_from_anchor",
        anchorId: anchor.id,
        evidenceSnippet: anchorText.substring(0, 200),
        status: "needs_review", // Needs admin verification
      });
      if (result.created) linksSuggested++;
    }
  }
  
  // 4. Link to related entities from entityIds[] field
  const entityIds = (doc.entityIds as number[]) ?? [];
  for (const entityId of entityIds) {
    const entityResult = await db
      .select()
      .from(entities)
      .where(eq(entities.id, entityId))
      .limit(1);
    
    if (entityResult.length > 0) {
      const entity = entityResult[0];
      const result = await createLinkIfNotExists({
        linkType: "mentions",
        srcType: "document",
        srcId: doc.id,
        srcLabel: doc.titleEn ?? doc.titleAr ?? `Document #${doc.id}`,
        dstType: "entity",
        dstId: entity.id,
        dstLabel: entity.name ?? entity.nameAr ?? `Entity #${entity.id}`,
        strengthScore: 0.85,
        method: "structured_data",
        status: "active",
      });
      if (result.created) linksCreated++;
    }
  }
  
  return { linksCreated, linksSuggested };
}

// ============================================================================
// UPDATE ENRICHMENT
// ============================================================================

/**
 * Enrich a newly created update with knowledge graph links
 */
export async function enrichUpdate(updateId: number): Promise<{
  linksCreated: number;
  linksSuggested: number;
}> {
  let linksCreated = 0;
  let linksSuggested = 0;
  
  // Get the update (using timeSeries as proxy)
  const updateResults = await db
    .select()
    .from(timeSeries)
    .where(eq(timeSeries.id, updateId))
    .limit(1);
  
  if (updateResults.length === 0) {
    throw new Error(`Update ${updateId} not found`);
  }
  
  const update = updateResults[0];
  
  // 1. Link to sectors based on tags
  const sectors = (update.sectors as string[]) ?? [];
  for (const sector of sectors) {
    const result = await createLinkIfNotExists({
      linkType: "update_signal",
      srcType: "update",
      srcId: update.id,
      srcLabel: update.titleEn ?? update.titleAr ?? `Update #${update.id}`,
      dstType: "sector",
      dstId: 0,
      dstLabel: sector,
      strengthScore: 0.9,
      method: "tag_based",
      status: "active",
    });
    if (result.created) linksCreated++;
  }
  
  // 2. Link to entities mentioned
  const entityIds = (update.entities as number[]) ?? [];
  for (const entityId of entityIds) {
    const entityResult = await db
      .select()
      .from(entities)
      .where(eq(entities.id, entityId))
      .limit(1);
    
    if (entityResult.length > 0) {
      const entity = entityResult[0];
      const result = await createLinkIfNotExists({
        linkType: "update_signal",
        srcType: "update",
        srcId: update.id,
        srcLabel: update.titleEn ?? update.titleAr ?? `Update #${update.id}`,
        dstType: "entity",
        dstId: entity.id,
        dstLabel: entity.name ?? entity.nameAr ?? `Entity #${entity.id}`,
        strengthScore: 0.8,
        method: "structured_data",
        status: "active",
      });
      if (result.created) linksCreated++;
    }
  }
  
  // 3. Link to related events (temporal co-occurrence)
  if (update.date) {
    const updateDate = new Date(update.date);
    const startDate = new Date(updateDate);
    startDate.setDate(startDate.getDate() - 7); // 1 week before
    const endDate = new Date(updateDate);
    endDate.setDate(endDate.getDate() + 7); // 1 week after
    
    const nearbyEvents = await db
      .select()
      .from(economicEvents)
      .where(
        and(
          sql`${economicEvents.eventDate} >= ${startDate}`,
          sql`${economicEvents.eventDate} <= ${endDate}`
        )
      )
      .limit(5);
    
    for (const event of nearbyEvents) {
      const result = await createLinkIfNotExists({
        linkType: "temporal_cooccurrence",
        srcType: "update",
        srcId: update.id,
        srcLabel: update.titleEn ?? update.titleAr ?? `Update #${update.id}`,
        dstType: "event",
        dstId: event.id,
        dstLabel: event.title ?? event.titleAr ?? `Event #${event.id}`,
        strengthScore: 0.5,
        method: "rule_based",
        evidenceSnippet: `Update occurred within 1 week of event`,
        status: "needs_review",
      });
      if (result.created) linksSuggested++;
    }
  }
  
  return { linksCreated, linksSuggested };
}

// ============================================================================
// EVENT ENRICHMENT
// ============================================================================

/**
 * Enrich a timeline event with knowledge graph links
 */
export async function enrichEvent(eventId: number): Promise<{
  linksCreated: number;
  linksSuggested: number;
}> {
  let linksCreated = 0;
  let linksSuggested = 0;
  
  // Get the event
  const eventResults = await db
    .select()
    .from(economicEvents)
    .where(eq(economicEvents.id, eventId))
    .limit(1);
  
  if (eventResults.length === 0) {
    throw new Error(`Event ${eventId} not found`);
  }
  
  const event = eventResults[0];
  
  // 1. Link to sectors
  const sectors = event.category ? [event.category] : [];
  for (const sector of sectors) {
    const result = await createLinkIfNotExists({
      linkType: "related_to",
      srcType: "event",
      srcId: event.id,
      srcLabel: event.title ?? event.titleAr ?? `Event #${event.id}`,
      dstType: "sector",
      dstId: 0,
      dstLabel: sector,
      strengthScore: 0.8,
      method: "tag_based",
      status: "active",
    });
    if (result.created) linksCreated++;
  }
  
  // 2. Link to entities involved
  const entityIds: number[] = [];
  for (const entityId of entityIds) {
    const entityResult = await db
      .select()
      .from(entities)
      .where(eq(entities.id, entityId))
      .limit(1);
    
    if (entityResult.length > 0) {
      const entity = entityResult[0];
      const result = await createLinkIfNotExists({
        linkType: "related_to",
        srcType: "event",
        srcId: event.id,
        srcLabel: event.title ?? event.titleAr ?? `Event #${event.id}`,
        dstType: "entity",
        dstId: entity.id,
        dstLabel: entity.name ?? entity.nameAr ?? `Entity #${entity.id}`,
        strengthScore: 0.85,
        method: "structured_data",
        status: "active",
      });
      if (result.created) linksCreated++;
    }
  }
  
  // 3. Link to documents that mention this event
  const eventDate = event.eventDate ? new Date(event.eventDate) : null;
  if (eventDate) {
    const year = eventDate.getFullYear();
    
    // Find documents from the same year that might be related
    const relatedDocs = await db
      .select()
      .from(libraryDocuments)
      .where(eq(libraryDocuments.publicationYear, year))
      .limit(10);
    
    for (const doc of relatedDocs) {
      // Check if document sectors overlap with event sectors
      const docSectors = (doc.sectors as string[]) ?? [];
      const hasOverlap = sectors.some(s => docSectors.includes(s));
      
      if (hasOverlap) {
        const result = await createLinkIfNotExists({
          linkType: "temporal_cooccurrence",
          srcType: "event",
          srcId: event.id,
          srcLabel: event.title ?? event.titleAr ?? `Event #${event.id}`,
          dstType: "document",
          dstId: doc.id,
          dstLabel: doc.titleEn ?? doc.titleAr ?? `Document #${doc.id}`,
          strengthScore: 0.5,
          method: "rule_based",
          evidenceSnippet: `Document published in same year with overlapping sectors`,
          status: "needs_review",
        });
        if (result.created) linksSuggested++;
      }
    }
  }
  
  return { linksCreated, linksSuggested };
}

// ============================================================================
// ENTITY ENRICHMENT
// ============================================================================

/**
 * Enrich an entity with knowledge graph links
 */
export async function enrichEntity(entityId: number): Promise<{
  linksCreated: number;
  linksSuggested: number;
}> {
  let linksCreated = 0;
  let linksSuggested = 0;
  
  // Get the entity
  const entityResults = await db
    .select()
    .from(entities)
    .where(eq(entities.id, entityId))
    .limit(1);
  
  if (entityResults.length === 0) {
    throw new Error(`Entity ${entityId} not found`);
  }
  
  const entity = entityResults[0];
  const entityName = entity.name ?? entity.nameAr ?? "";
  
  // 1. Find documents published by this entity
  const publishedDocs = await db
    .select()
    .from(libraryDocuments)
    .where(
      sql`LOWER(${libraryDocuments.publisherName}) LIKE LOWER(${`%${entityName}%`})`
    )
    .limit(20);
  
  for (const doc of publishedDocs) {
    const result = await createLinkIfNotExists({
      linkType: "publishes",
      srcType: "entity",
      srcId: entity.id,
      srcLabel: entityName,
      dstType: "document",
      dstId: doc.id,
      dstLabel: doc.titleEn ?? doc.titleAr ?? `Document #${doc.id}`,
      strengthScore: 0.9,
      method: "structured_data",
      status: "active",
    });
    if (result.created) linksCreated++;
  }
  
  // 2. Find documents that mention this entity
  const mentioningDocs = await db
    .select()
    .from(libraryDocuments)
    .where(
      sql`JSON_CONTAINS(${libraryDocuments.entityIds}, ${entityId})`
    )
    .limit(20);
  
  for (const doc of mentioningDocs) {
    const result = await createLinkIfNotExists({
      linkType: "mentions",
      srcType: "document",
      srcId: doc.id,
      srcLabel: doc.titleEn ?? doc.titleAr ?? `Document #${doc.id}`,
      dstType: "entity",
      dstId: entity.id,
      dstLabel: entityName,
      strengthScore: 0.7,
      method: "structured_data",
      status: "active",
    });
    if (result.created) linksCreated++;
  }
  
  // 3. Link to sectors based on entity category
  if (entity.entityType) {
    const sectorMapping: Record<string, string[]> = {
      "bank": ["banking", "finance"],
      "government": ["governance", "fiscal"],
      "ngo": ["humanitarian", "aid_flows"],
      "international_org": ["aid_flows", "humanitarian"],
      "private_sector": ["trade", "private_sector"],
    };
    
    const sectors = sectorMapping[entity.entityType] ?? [];
    for (const sector of sectors) {
      const result = await createLinkIfNotExists({
        linkType: "operates_in",
        srcType: "entity",
        srcId: entity.id,
        srcLabel: entityName,
        dstType: "sector",
        dstId: 0,
        dstLabel: sector,
        strengthScore: 0.7,
        method: "rule_based",
        status: "active",
      });
      if (result.created) linksCreated++;
    }
  }
  
  return { linksCreated, linksSuggested };
}

// ============================================================================
// BATCH ENRICHMENT (NIGHTLY JOB)
// ============================================================================

/**
 * Run batch enrichment for all new/updated content
 */
export async function runBatchEnrichment(options?: {
  since?: Date;
  types?: NodeType[];
}): Promise<{
  documentsProcessed: number;
  updatesProcessed: number;
  eventsProcessed: number;
  entitiesProcessed: number;
  totalLinksCreated: number;
  totalLinksSuggested: number;
}> {
  const since = options?.since ?? new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours
  const types = options?.types ?? ["document", "update", "event", "entity"];
  
  let documentsProcessed = 0;
  let updatesProcessed = 0;
  let eventsProcessed = 0;
  let entitiesProcessed = 0;
  let totalLinksCreated = 0;
  let totalLinksSuggested = 0;
  
  // Process documents
  if (types.includes("document")) {
    const docs = await db
      .select()
      .from(libraryDocuments)
      .where(sql`${libraryDocuments.createdAt} >= ${since}`)
      .limit(100);
    
    for (const doc of docs) {
      try {
        const result = await enrichDocument(doc.id);
        totalLinksCreated += result.linksCreated;
        totalLinksSuggested += result.linksSuggested;
        documentsProcessed++;
      } catch (error) {
        console.error(`[AutoEnrichment] Error enriching document ${doc.id}:`, error);
      }
    }
  }
  
  // Process updates - disabled as updates table doesn't exist in current schema
  // if (types.includes("update")) {
  //   // Updates processing would go here
  // }
  
  // Process events
  if (types.includes("event")) {
    const eventResults = await db
      .select()
      .from(economicEvents)
      .where(sql`${economicEvents.createdAt} >= ${since}`)
      .limit(100);
    
    for (const event of eventResults) {
      try {
        const result = await enrichEvent(event.id);
        totalLinksCreated += result.linksCreated;
        totalLinksSuggested += result.linksSuggested;
        eventsProcessed++;
      } catch (error) {
        console.error(`[AutoEnrichment] Error enriching event ${event.id}:`, error);
      }
    }
  }
  
  // Process entities
  if (types.includes("entity")) {
    const entityResults = await db
      .select()
      .from(entities)
      .where(sql`${entities.createdAt} >= ${since}`)
      .limit(100);
    
    for (const entity of entityResults) {
      try {
        const result = await enrichEntity(entity.id);
        totalLinksCreated += result.linksCreated;
        totalLinksSuggested += result.linksSuggested;
        entitiesProcessed++;
      } catch (error) {
        console.error(`[AutoEnrichment] Error enriching entity ${entity.id}:`, error);
      }
    }
  }
  
  // Calculate and store health metrics
  await knowledgeGraphService.calculateGraphHealthMetrics();
  
  return {
    documentsProcessed,
    updatesProcessed,
    eventsProcessed,
    entitiesProcessed,
    totalLinksCreated,
    totalLinksSuggested,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

interface CreateLinkIfNotExistsInput {
  linkType: LinkType;
  srcType: NodeType;
  srcId: number;
  srcLabel?: string;
  dstType: NodeType;
  dstId: number;
  dstLabel?: string;
  strengthScore?: number;
  method: LinkMethod;
  anchorId?: number;
  evidenceSnippet?: string;
  status?: "active" | "needs_review";
}

async function createLinkIfNotExists(
  input: CreateLinkIfNotExistsInput
): Promise<{ created: boolean; linkId?: number }> {
  // Check if link already exists
  const existing = await db
    .select()
    .from(knowledgeGraphLinks)
    .where(
      and(
        eq(knowledgeGraphLinks.linkType, input.linkType),
        eq(knowledgeGraphLinks.srcType, input.srcType),
        eq(knowledgeGraphLinks.srcId, input.srcId),
        eq(knowledgeGraphLinks.dstType, input.dstType),
        eq(knowledgeGraphLinks.dstId, input.dstId)
      )
    )
    .limit(1);
  
  if (existing.length > 0) {
    return { created: false, linkId: existing[0].id };
  }
  
  // Create the link
  const linkId = await knowledgeGraphService.createLink({
    linkType: input.linkType,
    srcType: input.srcType,
    srcId: input.srcId,
    srcLabel: input.srcLabel,
    dstType: input.dstType,
    dstId: input.dstId,
    dstLabel: input.dstLabel,
    strengthScore: input.strengthScore ?? 0.5,
    method: input.method,
    anchorId: input.anchorId,
    evidenceSnippet: input.evidenceSnippet,
    status: input.status ?? "active",
  });
  
  // If needs review, add to review queue
  if (input.status === "needs_review") {
    await db.insert(graphReviewQueue).values({
      linkId,
      status: "pending",
      priority: "medium",
      evidenceSummary: input.evidenceSnippet,
    });
  }
  
  return { created: true, linkId };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  enrichDocument,
  enrichUpdate,
  enrichEvent,
  enrichEntity,
  runBatchEnrichment,
};
