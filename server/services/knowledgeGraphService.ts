/**
 * Knowledge Graph Service - Connective Tissue Layer
 * 
 * This service manages the unified knowledge graph that connects all YETO data types:
 * - KPIs, documents, entities, projects, events, datasets
 * - Provides "related insights" for every page
 * - Implements link generation rules
 * - Manages the review queue for suggested links
 */

import { db } from "../db";
import { 
  knowledgeGraphLinks, 
  linkRules, 
  linkRuleRuns,
  graphReviewQueue,
  graphHealthMetrics,
  relatedItemsCache,
  entities,
  libraryDocuments,
  economicEvents,
  evidencePacks,
  citationAnchors,
  dataUpdates
} from "../../drizzle/schema";
import { eq, and, or, desc, asc, sql, inArray, like, gte, lte } from "drizzle-orm";

// Types
export type LinkType = 
  | "publishes" | "funds" | "implements" | "located_in" | "mentions"
  | "measures" | "affects" | "related_to" | "contradicts" | "supersedes"
  | "update_signal" | "suspected_link" | "temporal_cooccurrence" | "cites"
  | "derived_from" | "part_of" | "regulates" | "operates_in";

export type NodeType = 
  | "entity" | "document" | "series" | "event" | "project"
  | "update" | "sector" | "indicator" | "dataset" | "geography";

export type LinkMethod = 
  | "rule_based" | "extracted_from_anchor" | "structured_data"
  | "tag_based" | "embedding_similarity" | "manual" | "imported";

export type LinkStatus = "active" | "needs_review" | "deprecated" | "rejected";

export interface CreateLinkInput {
  linkType: LinkType;
  srcType: NodeType;
  srcId: number;
  srcLabel?: string;
  dstType: NodeType;
  dstId: number;
  dstLabel?: string;
  strengthScore?: number;
  confidenceLevel?: "high" | "medium" | "low" | "uncertain";
  method: LinkMethod;
  evidencePackId?: number;
  ruleId?: number;
  anchorId?: number;
  evidenceSnippet?: string;
  evidenceUrl?: string;
  status?: LinkStatus;
  bidirectional?: boolean;
  regimeTag?: "aden" | "sanaa" | "unified" | "pre_split";
  createdBy?: number;
}

export interface RelatedItem {
  id: number;
  type: NodeType;
  label: string;
  linkType: LinkType;
  strength: number;
  whyLinked: string;
  evidenceSnippet?: string;
  confidenceLevel: string;
}

export interface RelatedItemsResult {
  documents: RelatedItem[];
  entities: RelatedItem[];
  datasets: RelatedItem[];
  events: RelatedItem[];
  contradictions: Array<{
    sourceA: { type: string; id: number; value: string };
    sourceB: { type: string; id: number; value: string };
    notes: string;
  }>;
}

// ============================================================================
// LINK CRUD OPERATIONS
// ============================================================================

/**
 * Create a new knowledge graph link
 */
export async function createLink(input: CreateLinkInput): Promise<number> {
  const result = await db.insert(knowledgeGraphLinks).values({
    linkType: input.linkType,
    srcType: input.srcType,
    srcId: input.srcId,
    srcLabel: input.srcLabel,
    dstType: input.dstType,
    dstId: input.dstId,
    dstLabel: input.dstLabel,
    strengthScore: String(input.strengthScore ?? 0.5),
    confidenceLevel: input.confidenceLevel ?? "medium",
    method: input.method,
    evidencePackId: input.evidencePackId,
    ruleId: input.ruleId,
    anchorId: input.anchorId,
    evidenceSnippet: input.evidenceSnippet,
    evidenceUrl: input.evidenceUrl,
    status: input.status ?? "active",
    bidirectional: input.bidirectional ?? false,
    regimeTag: input.regimeTag,
    createdBy: input.createdBy,
  });
  
  // If bidirectional, create reverse link
  if (input.bidirectional) {
    await db.insert(knowledgeGraphLinks).values({
      linkType: input.linkType,
      srcType: input.dstType,
      srcId: input.dstId,
      srcLabel: input.dstLabel,
      dstType: input.srcType,
      dstId: input.srcId,
      dstLabel: input.srcLabel,
      strengthScore: String(input.strengthScore ?? 0.5),
      confidenceLevel: input.confidenceLevel ?? "medium",
      method: input.method,
      evidencePackId: input.evidencePackId,
      ruleId: input.ruleId,
      anchorId: input.anchorId,
      evidenceSnippet: input.evidenceSnippet,
      evidenceUrl: input.evidenceUrl,
      status: input.status ?? "active",
      bidirectional: true,
      regimeTag: input.regimeTag,
      createdBy: input.createdBy,
    });
  }
  
  // Invalidate related cache
  await invalidateCache(input.srcType, input.srcId);
  await invalidateCache(input.dstType, input.dstId);
  
  return result.insertId;
}

/**
 * Get links for a specific node
 */
export async function getLinksForNode(
  nodeType: NodeType,
  nodeId: number,
  options?: {
    linkTypes?: LinkType[];
    status?: LinkStatus;
    limit?: number;
    includeReverse?: boolean;
  }
): Promise<typeof knowledgeGraphLinks.$inferSelect[]> {
  const conditions = [
    or(
      and(eq(knowledgeGraphLinks.srcType, nodeType), eq(knowledgeGraphLinks.srcId, nodeId)),
      options?.includeReverse !== false
        ? and(eq(knowledgeGraphLinks.dstType, nodeType), eq(knowledgeGraphLinks.dstId, nodeId))
        : undefined
    ),
  ].filter(Boolean);
  
  if (options?.status) {
    conditions.push(eq(knowledgeGraphLinks.status, options.status));
  }
  
  if (options?.linkTypes && options.linkTypes.length > 0) {
    conditions.push(inArray(knowledgeGraphLinks.linkType, options.linkTypes));
  }
  
  const query = db
    .select()
    .from(knowledgeGraphLinks)
    .where(and(...conditions))
    .orderBy(desc(knowledgeGraphLinks.strengthScore))
    .limit(options?.limit ?? 50);
  
  return query;
}

/**
 * Update link status (for review workflow)
 */
export async function updateLinkStatus(
  linkId: number,
  status: LinkStatus,
  reviewedBy?: number,
  reviewNotes?: string
): Promise<void> {
  await db.update(knowledgeGraphLinks)
    .set({
      status,
      reviewedBy,
      reviewedAt: new Date(),
      reviewNotes,
    })
    .where(eq(knowledgeGraphLinks.id, linkId));
}

/**
 * Delete a link (soft delete by setting status to deprecated)
 */
export async function deprecateLink(linkId: number, reason?: string): Promise<void> {
  await db.update(knowledgeGraphLinks)
    .set({
      status: "deprecated",
      reviewNotes: reason,
    })
    .where(eq(knowledgeGraphLinks.id, linkId));
}

// ============================================================================
// RELATED ITEMS RETRIEVAL
// ============================================================================

/**
 * Get all related items for a node (with caching)
 */
export async function getRelatedItems(
  sourceType: NodeType,
  sourceId: number,
  options?: {
    skipCache?: boolean;
    maxItems?: number;
  }
): Promise<RelatedItemsResult> {
  // Check cache first
  if (!options?.skipCache) {
    const cached = await getCachedRelatedItems(sourceType, sourceId);
    if (cached) return cached;
  }
  
  const maxItems = options?.maxItems ?? 10;
  
  // Get all active links for this node
  const links = await getLinksForNode(sourceType, sourceId, {
    status: "active",
    limit: 100,
    includeReverse: true,
  });
  
  // Categorize links by destination type
  const result: RelatedItemsResult = {
    documents: [],
    entities: [],
    datasets: [],
    events: [],
    contradictions: [],
  };
  
  for (const link of links) {
    // Determine which end is the "other" node
    const isSource = link.srcType === sourceType && link.srcId === sourceId;
    const otherType = isSource ? link.dstType : link.srcType;
    const otherId = isSource ? link.dstId : link.srcId;
    const otherLabel = isSource ? link.dstLabel : link.srcLabel;
    
    const relatedItem: RelatedItem = {
      id: otherId,
      type: otherType,
      label: otherLabel ?? `${otherType} #${otherId}`,
      linkType: link.linkType,
      strength: parseFloat(link.strengthScore ?? "0.5"),
      whyLinked: generateWhyLinked(link),
      evidenceSnippet: link.evidenceSnippet ?? undefined,
      confidenceLevel: link.confidenceLevel ?? "medium",
    };
    
    // Handle contradictions specially
    if (link.linkType === "contradicts") {
      result.contradictions.push({
        sourceA: { type: sourceType, id: sourceId, value: "" },
        sourceB: { type: otherType, id: otherId, value: "" },
        notes: link.evidenceSnippet ?? "Sources disagree",
      });
      continue;
    }
    
    // Categorize by type
    switch (otherType) {
      case "document":
        if (result.documents.length < maxItems) {
          result.documents.push(relatedItem);
        }
        break;
      case "entity":
        if (result.entities.length < maxItems) {
          result.entities.push(relatedItem);
        }
        break;
      case "series":
      case "dataset":
      case "indicator":
        if (result.datasets.length < maxItems) {
          result.datasets.push(relatedItem);
        }
        break;
      case "event":
        if (result.events.length < maxItems) {
          result.events.push(relatedItem);
        }
        break;
    }
  }
  
  // Sort by strength
  result.documents.sort((a, b) => b.strength - a.strength);
  result.entities.sort((a, b) => b.strength - a.strength);
  result.datasets.sort((a, b) => b.strength - a.strength);
  result.events.sort((a, b) => b.strength - a.strength);
  
  // Cache the result
  await cacheRelatedItems(sourceType, sourceId, result);
  
  return result;
}

/**
 * Generate human-readable "why linked" explanation
 */
function generateWhyLinked(link: typeof knowledgeGraphLinks.$inferSelect): string {
  const linkTypeExplanations: Record<LinkType, string> = {
    publishes: "Published by this organization",
    funds: "Funded by this donor",
    implements: "Implemented by this organization",
    located_in: "Located in this area",
    mentions: "Mentioned in this document",
    measures: "Measures this indicator",
    affects: "Affected by this event",
    related_to: "Related to this topic",
    contradicts: "Contradicts this source",
    supersedes: "Supersedes previous version",
    update_signal: "Triggered by this update",
    suspected_link: "Potentially related (unverified)",
    temporal_cooccurrence: "Occurred around the same time",
    cites: "Cites this source",
    derived_from: "Derived from this data",
    part_of: "Part of this organization",
    regulates: "Regulates this entity",
    operates_in: "Operates in this area",
  };
  
  let explanation = linkTypeExplanations[link.linkType as LinkType] || "Related";
  
  // Add method context
  if (link.method === "extracted_from_anchor") {
    explanation += " (extracted from document)";
  } else if (link.method === "structured_data") {
    explanation += " (from official records)";
  } else if (link.method === "embedding_similarity") {
    explanation += " (semantic similarity)";
  }
  
  // Add confidence
  if (link.confidenceLevel === "high") {
    explanation += " • High confidence";
  } else if (link.confidenceLevel === "low" || link.confidenceLevel === "uncertain") {
    explanation += " • Needs verification";
  }
  
  return explanation;
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

async function getCachedRelatedItems(
  sourceType: string,
  sourceId: number
): Promise<RelatedItemsResult | null> {
  const cached = await db
    .select()
    .from(relatedItemsCache)
    .where(
      and(
        eq(relatedItemsCache.sourceType, sourceType),
        eq(relatedItemsCache.sourceId, sourceId),
        eq(relatedItemsCache.isValid, true),
        gte(relatedItemsCache.expiresAt, new Date())
      )
    )
    .limit(1);
  
  if (cached.length === 0) return null;
  
  const entry = cached[0];
  return {
    documents: (entry.relatedDocuments as RelatedItem[]) ?? [],
    entities: (entry.relatedEntities as RelatedItem[]) ?? [],
    datasets: (entry.relatedDatasets as RelatedItem[]) ?? [],
    events: (entry.relatedEvents as RelatedItem[]) ?? [],
    contradictions: (entry.contradictions as RelatedItemsResult["contradictions"]) ?? [],
  };
}

async function cacheRelatedItems(
  sourceType: string,
  sourceId: number,
  result: RelatedItemsResult
): Promise<void> {
  // Delete existing cache
  await db.delete(relatedItemsCache).where(
    and(
      eq(relatedItemsCache.sourceType, sourceType),
      eq(relatedItemsCache.sourceId, sourceId)
    )
  );
  
  // Insert new cache (expires in 1 hour)
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  
  await db.insert(relatedItemsCache).values({
    sourceType,
    sourceId,
    relatedDocuments: result.documents,
    relatedEntities: result.entities,
    relatedDatasets: result.datasets,
    relatedEvents: result.events,
    contradictions: result.contradictions,
    expiresAt,
    isValid: true,
  });
}

async function invalidateCache(sourceType: string, sourceId: number): Promise<void> {
  await db.update(relatedItemsCache)
    .set({ isValid: false })
    .where(
      and(
        eq(relatedItemsCache.sourceType, sourceType),
        eq(relatedItemsCache.sourceId, sourceId)
      )
    );
}

// ============================================================================
// LINK RULE ENGINE
// ============================================================================

/**
 * Get all enabled link rules
 */
export async function getEnabledRules(): Promise<typeof linkRules.$inferSelect[]> {
  return db
    .select()
    .from(linkRules)
    .where(eq(linkRules.isEnabled, true))
    .orderBy(desc(linkRules.priority));
}

/**
 * Create a new link rule
 */
export async function createLinkRule(input: {
  ruleId: string;
  nameEn: string;
  nameAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  inputTypes: string[];
  matchLogic: object;
  minEvidenceRequirements?: object;
  outputLinkType: string;
  strengthFormula?: string;
  isPublicSafe?: boolean;
  autoApprove?: boolean;
  priority?: number;
  createdBy?: number;
}): Promise<number> {
  const result = await db.insert(linkRules).values({
    ruleId: input.ruleId,
    nameEn: input.nameEn,
    nameAr: input.nameAr,
    descriptionEn: input.descriptionEn,
    descriptionAr: input.descriptionAr,
    inputTypes: input.inputTypes,
    matchLogic: input.matchLogic,
    minEvidenceRequirements: input.minEvidenceRequirements,
    outputLinkType: input.outputLinkType,
    strengthFormula: input.strengthFormula ?? "0.5",
    isPublicSafe: input.isPublicSafe ?? false,
    autoApprove: input.autoApprove ?? false,
    priority: input.priority ?? 50,
    createdBy: input.createdBy,
  });
  
  return result.insertId;
}

/**
 * Run a specific link rule
 */
export async function runLinkRule(
  ruleId: number,
  triggeredBy: "nightly" | "manual" | "on_ingest" = "manual",
  triggeredByUser?: number
): Promise<{
  linksCreated: number;
  linksSuggested: number;
  errors: number;
}> {
  // Get the rule
  const rules = await db
    .select()
    .from(linkRules)
    .where(eq(linkRules.id, ruleId))
    .limit(1);
  
  if (rules.length === 0) {
    throw new Error(`Rule ${ruleId} not found`);
  }
  
  const rule = rules[0];
  
  // Create run record
  const runResult = await db.insert(linkRuleRuns).values({
    ruleId,
    startedAt: new Date(),
    status: "running",
    triggeredBy,
    triggeredByUser,
  });
  
  const runId = runResult.insertId;
  
  let linksCreated = 0;
  let linksSuggested = 0;
  let errors = 0;
  const errorLog: Array<{ itemId: number; itemType: string; error: string; timestamp: string }> = [];
  
  try {
    // Process based on input types
    const inputTypes = rule.inputTypes as string[];
    
    for (const inputType of inputTypes) {
      try {
        const result = await processInputTypeForRule(rule, inputType as NodeType);
        linksCreated += result.created;
        linksSuggested += result.suggested;
      } catch (error) {
        errors++;
        errorLog.push({
          itemId: 0,
          itemType: inputType,
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        });
      }
    }
    
    // Update run record
    await db.update(linkRuleRuns)
      .set({
        completedAt: new Date(),
        status: "completed",
        linksCreated,
        linksSuggested,
        errors,
        errorLog: errorLog.length > 0 ? errorLog : null,
      })
      .where(eq(linkRuleRuns.id, runId));
    
  } catch (error) {
    // Mark run as failed
    await db.update(linkRuleRuns)
      .set({
        completedAt: new Date(),
        status: "failed",
        errors: errors + 1,
        errorLog: [...errorLog, {
          itemId: 0,
          itemType: "rule",
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        }],
      })
      .where(eq(linkRuleRuns.id, runId));
    
    throw error;
  }
  
  return { linksCreated, linksSuggested, errors };
}

async function processInputTypeForRule(
  rule: typeof linkRules.$inferSelect,
  inputType: NodeType
): Promise<{ created: number; suggested: number }> {
  let created = 0;
  let suggested = 0;
  
  const matchLogic = rule.matchLogic as {
    type: string;
    keywords?: string[];
    tags?: string[];
    embeddingThreshold?: number;
  };
  
  // Get items to process based on input type
  // This is a simplified implementation - real implementation would be more sophisticated
  
  if (inputType === "document" && matchLogic.type === "tag") {
    // Find documents with matching tags and create sector links
    const docs = await db
      .select()
      .from(libraryDocuments)
      .where(eq(libraryDocuments.status, "published"))
      .limit(100);
    
    for (const doc of docs) {
      const sectors = doc.sectors as string[] ?? [];
      for (const sector of sectors) {
        // Check if link already exists
        const existing = await db
          .select()
          .from(knowledgeGraphLinks)
          .where(
            and(
              eq(knowledgeGraphLinks.srcType, "document"),
              eq(knowledgeGraphLinks.srcId, doc.id),
              eq(knowledgeGraphLinks.dstType, "sector"),
              eq(knowledgeGraphLinks.linkType, rule.outputLinkType as LinkType)
            )
          )
          .limit(1);
        
        if (existing.length === 0) {
          const status = rule.autoApprove ? "active" : "needs_review";
          await createLink({
            linkType: rule.outputLinkType as LinkType,
            srcType: "document",
            srcId: doc.id,
            srcLabel: doc.titleEn ?? doc.titleAr ?? `Document #${doc.id}`,
            dstType: "sector",
            dstId: 0, // Sector is identified by name, not ID
            dstLabel: sector,
            strengthScore: 0.7,
            method: "tag_based",
            ruleId: rule.id,
            status,
          });
          
          if (status === "active") {
            created++;
          } else {
            suggested++;
          }
        }
      }
    }
  }
  
  return { created, suggested };
}

// ============================================================================
// REVIEW QUEUE
// ============================================================================

/**
 * Get pending review items
 */
export async function getPendingReviews(options?: {
  priority?: "high" | "medium" | "low";
  limit?: number;
}): Promise<Array<{
  review: typeof graphReviewQueue.$inferSelect;
  link: typeof knowledgeGraphLinks.$inferSelect;
}>> {
  const conditions = [eq(graphReviewQueue.status, "pending")];
  
  if (options?.priority) {
    conditions.push(eq(graphReviewQueue.priority, options.priority));
  }
  
  const reviews = await db
    .select()
    .from(graphReviewQueue)
    .innerJoin(knowledgeGraphLinks, eq(graphReviewQueue.linkId, knowledgeGraphLinks.id))
    .where(and(...conditions))
    .orderBy(
      asc(sql`FIELD(${graphReviewQueue.priority}, 'high', 'medium', 'low')`),
      asc(graphReviewQueue.createdAt)
    )
    .limit(options?.limit ?? 50);
  
  return reviews.map(r => ({
    review: r.graph_review_queue,
    link: r.knowledge_graph_links,
  }));
}

/**
 * Approve a review item
 */
export async function approveReview(
  reviewId: number,
  reviewedBy: number,
  notes?: string
): Promise<void> {
  const reviews = await db
    .select()
    .from(graphReviewQueue)
    .where(eq(graphReviewQueue.id, reviewId))
    .limit(1);
  
  if (reviews.length === 0) {
    throw new Error("Review not found");
  }
  
  const review = reviews[0];
  
  // Update the link status
  await updateLinkStatus(review.linkId, "active", reviewedBy, notes);
  
  // Update the review
  await db.update(graphReviewQueue)
    .set({
      status: "approved",
      reviewedBy,
      reviewedAt: new Date(),
      reviewAction: "approve",
      reviewNotes: notes,
    })
    .where(eq(graphReviewQueue.id, reviewId));
}

/**
 * Reject a review item
 */
export async function rejectReview(
  reviewId: number,
  reviewedBy: number,
  notes?: string
): Promise<void> {
  const reviews = await db
    .select()
    .from(graphReviewQueue)
    .where(eq(graphReviewQueue.id, reviewId))
    .limit(1);
  
  if (reviews.length === 0) {
    throw new Error("Review not found");
  }
  
  const review = reviews[0];
  
  // Update the link status
  await updateLinkStatus(review.linkId, "rejected", reviewedBy, notes);
  
  // Update the review
  await db.update(graphReviewQueue)
    .set({
      status: "rejected",
      reviewedBy,
      reviewedAt: new Date(),
      reviewAction: "reject",
      reviewNotes: notes,
    })
    .where(eq(graphReviewQueue.id, reviewId));
}

// ============================================================================
// GRAPH HEALTH METRICS
// ============================================================================

/**
 * Calculate and store graph health metrics
 */
export async function calculateGraphHealthMetrics(): Promise<typeof graphHealthMetrics.$inferSelect> {
  // Count total links by status
  const linkCounts = await db
    .select({
      status: knowledgeGraphLinks.status,
      count: sql<number>`COUNT(*)`,
    })
    .from(knowledgeGraphLinks)
    .groupBy(knowledgeGraphLinks.status);
  
  const totalLinks = linkCounts.reduce((sum, c) => sum + c.count, 0);
  const activeLinks = linkCounts.find(c => c.status === "active")?.count ?? 0;
  const pendingReviewLinks = linkCounts.find(c => c.status === "needs_review")?.count ?? 0;
  const deprecatedLinks = linkCounts.find(c => c.status === "deprecated")?.count ?? 0;
  
  // Count links with evidence
  const linksWithEvidenceResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(knowledgeGraphLinks)
    .where(
      and(
        eq(knowledgeGraphLinks.status, "active"),
        or(
          sql`${knowledgeGraphLinks.evidencePackId} IS NOT NULL`,
          sql`${knowledgeGraphLinks.anchorId} IS NOT NULL`
        )
      )
    );
  const linksWithEvidence = activeLinks > 0 
    ? (linksWithEvidenceResult[0].count / activeLinks) * 100 
    : 0;
  
  // Count links with anchors
  const linksWithAnchorsResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(knowledgeGraphLinks)
    .where(
      and(
        eq(knowledgeGraphLinks.status, "active"),
        sql`${knowledgeGraphLinks.anchorId} IS NOT NULL`
      )
    );
  const linksWithAnchors = activeLinks > 0 
    ? (linksWithAnchorsResult[0].count / activeLinks) * 100 
    : 0;
  
  // Calculate average strength
  const avgStrengthResult = await db
    .select({ avg: sql<string>`AVG(${knowledgeGraphLinks.strengthScore})` })
    .from(knowledgeGraphLinks)
    .where(eq(knowledgeGraphLinks.status, "active"));
  const averageStrengthScore = parseFloat(avgStrengthResult[0].avg ?? "0.5");
  
  // Link type distribution
  const linkTypeDistResult = await db
    .select({
      linkType: knowledgeGraphLinks.linkType,
      count: sql<number>`COUNT(*)`,
    })
    .from(knowledgeGraphLinks)
    .where(eq(knowledgeGraphLinks.status, "active"))
    .groupBy(knowledgeGraphLinks.linkType);
  
  const linkTypeDistribution: Record<string, number> = {};
  for (const row of linkTypeDistResult) {
    linkTypeDistribution[row.linkType] = row.count;
  }
  
  // Count orphan documents (documents with no links)
  const totalDocsResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(libraryDocuments);
  const linkedDocsResult = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${knowledgeGraphLinks.srcId})` })
    .from(knowledgeGraphLinks)
    .where(
      and(
        eq(knowledgeGraphLinks.srcType, "document"),
        eq(knowledgeGraphLinks.status, "active")
      )
    );
  const orphanDocuments = totalDocsResult[0].count - linkedDocsResult[0].count;
  
  // Count orphan entities
  const totalEntitiesResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(entities);
  const linkedEntitiesResult = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${knowledgeGraphLinks.srcId})` })
    .from(knowledgeGraphLinks)
    .where(
      and(
        eq(knowledgeGraphLinks.srcType, "entity"),
        eq(knowledgeGraphLinks.status, "active")
      )
    );
  const orphanEntities = totalEntitiesResult[0].count - linkedEntitiesResult[0].count;
  
  // Count orphan events
  const totalEventsResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(timelineEvents);
  const linkedEventsResult = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${knowledgeGraphLinks.srcId})` })
    .from(knowledgeGraphLinks)
    .where(
      and(
        eq(knowledgeGraphLinks.srcType, "event"),
        eq(knowledgeGraphLinks.status, "active")
      )
    );
  const orphanEvents = totalEventsResult[0].count - linkedEventsResult[0].count;
  
  // Calculate coverage percentages
  const docsLinkedToSectors = totalDocsResult[0].count > 0
    ? (linkedDocsResult[0].count / totalDocsResult[0].count) * 100
    : 0;
  const entitiesWithLinks = totalEntitiesResult[0].count > 0
    ? (linkedEntitiesResult[0].count / totalEntitiesResult[0].count) * 100
    : 0;
  const eventsWithEvidence = totalEventsResult[0].count > 0
    ? (linkedEventsResult[0].count / totalEventsResult[0].count) * 100
    : 0;
  
  // Insert metrics
  const result = await db.insert(graphHealthMetrics).values({
    docsLinkedToSectors: String(docsLinkedToSectors),
    updatesLinkedToEntities: "0", // TODO: Calculate
    kpisWithRelatedDocs: "0", // TODO: Calculate
    entitiesWithLinks: String(entitiesWithLinks),
    eventsWithEvidence: String(eventsWithEvidence),
    linksWithEvidence: String(linksWithEvidence),
    linksWithAnchors: String(linksWithAnchors),
    averageStrengthScore: String(averageStrengthScore),
    totalLinks,
    activeLinks,
    pendingReviewLinks,
    deprecatedLinks,
    linkTypeDistribution,
    orphanDocuments,
    orphanEntities,
    orphanEvents,
    brokenLinks: 0,
    newLinksToday: 0,
    removedLinksToday: 0,
    driftScore: "0",
  });
  
  // Return the inserted metrics
  const metrics = await db
    .select()
    .from(graphHealthMetrics)
    .where(eq(graphHealthMetrics.id, result.insertId))
    .limit(1);
  
  return metrics[0];
}

/**
 * Get latest graph health metrics
 */
export async function getLatestGraphHealthMetrics(): Promise<typeof graphHealthMetrics.$inferSelect | null> {
  const metrics = await db
    .select()
    .from(graphHealthMetrics)
    .orderBy(desc(graphHealthMetrics.measuredAt))
    .limit(1);
  
  return metrics[0] ?? null;
}

// ============================================================================
// SEED DEFAULT RULES
// ============================================================================

/**
 * Seed default link rules
 */
export async function seedDefaultLinkRules(): Promise<void> {
  const defaultRules = [
    {
      ruleId: "doc_sector_tag",
      nameEn: "Document-Sector Tag Linking",
      nameAr: "ربط الوثائق بالقطاعات عبر العلامات",
      descriptionEn: "Links documents to sectors based on their sector tags",
      inputTypes: ["document"],
      matchLogic: { type: "tag", tags: ["sector"] },
      outputLinkType: "related_to",
      strengthFormula: "0.7",
      isPublicSafe: true,
      autoApprove: true,
      priority: 100,
    },
    {
      ruleId: "doc_entity_mention",
      nameEn: "Document-Entity Mention Linking",
      nameAr: "ربط الوثائق بالكيانات عبر الذكر",
      descriptionEn: "Links documents to entities mentioned in their content",
      inputTypes: ["document"],
      matchLogic: { type: "anchor", anchorTypes: ["entity_mention"] },
      outputLinkType: "mentions",
      strengthFormula: "anchor_count * 0.1",
      isPublicSafe: true,
      autoApprove: false,
      priority: 90,
    },
    {
      ruleId: "entity_publishes_doc",
      nameEn: "Entity Publishes Document",
      nameAr: "الكيان ينشر الوثيقة",
      descriptionEn: "Links entities to documents they published",
      inputTypes: ["document"],
      matchLogic: { type: "metadata", metadataFields: ["publisher"] },
      outputLinkType: "publishes",
      strengthFormula: "0.9",
      isPublicSafe: true,
      autoApprove: true,
      priority: 95,
    },
    {
      ruleId: "update_signal_sector",
      nameEn: "Update Signal to Sector",
      nameAr: "إشارة التحديث للقطاع",
      descriptionEn: "Links updates to affected sectors",
      inputTypes: ["update"],
      matchLogic: { type: "tag", tags: ["sector"] },
      outputLinkType: "update_signal",
      strengthFormula: "0.8",
      isPublicSafe: true,
      autoApprove: true,
      priority: 85,
    },
    {
      ruleId: "event_affects_indicator",
      nameEn: "Event Affects Indicator",
      nameAr: "الحدث يؤثر على المؤشر",
      descriptionEn: "Links events to indicators with temporal co-occurrence",
      inputTypes: ["event"],
      matchLogic: { type: "temporal", embeddingThreshold: 0.7 },
      outputLinkType: "temporal_cooccurrence",
      strengthFormula: "0.5",
      isPublicSafe: false,
      autoApprove: false,
      priority: 50,
    },
  ];
  
  for (const rule of defaultRules) {
    // Check if rule already exists
    const existing = await db
      .select()
      .from(linkRules)
      .where(eq(linkRules.ruleId, rule.ruleId))
      .limit(1);
    
    if (existing.length === 0) {
      await createLinkRule(rule);
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  createLink,
  getLinksForNode,
  updateLinkStatus,
  deprecateLink,
  getRelatedItems,
  getEnabledRules,
  createLinkRule,
  runLinkRule,
  getPendingReviews,
  approveReview,
  rejectReview,
  calculateGraphHealthMetrics,
  getLatestGraphHealthMetrics,
  seedDefaultLinkRules,
};
