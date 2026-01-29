/**
 * Graph Router - Knowledge Graph API Endpoints
 * 
 * Provides API endpoints for:
 * - Getting related items for any node
 * - Managing knowledge graph links
 * - Admin graph governance (rules, review queue, health metrics)
 * - Story mode narratives
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure, adminProcedure } from "../_core/trpc";
import * as knowledgeGraphService from "../services/knowledgeGraphService";
import * as autoEnrichmentEngine from "../services/autoEnrichmentEngine";
import { db } from "../db";
import {
  knowledgeGraphLinks,
  linkRules,
  linkRuleRuns,
  graphReviewQueue,
  graphHealthMetrics,
  storyModeNarratives,
} from "../../drizzle/schema";
import { eq, desc, and, sql, inArray } from "drizzle-orm";

// Node type enum for validation
const nodeTypeEnum = z.enum([
  "entity", "document", "series", "event", "project",
  "update", "sector", "indicator", "dataset", "geography"
]);

// Link type enum for validation
const linkTypeEnum = z.enum([
  "publishes", "funds", "implements", "located_in", "mentions",
  "measures", "affects", "related_to", "contradicts", "supersedes",
  "update_signal", "suspected_link", "temporal_cooccurrence", "cites",
  "derived_from", "part_of", "regulates", "operates_in"
]);

export const graphRouter = router({
  // ============================================================================
  // PUBLIC ENDPOINTS - Related Items
  // ============================================================================
  
  /**
   * Get related items for any node (documents, entities, datasets, events, contradictions)
   */
  getRelatedItems: publicProcedure
    .input(z.object({
      sourceType: nodeTypeEnum,
      sourceId: z.number(),
      maxItems: z.number().optional().default(10),
      skipCache: z.boolean().optional().default(false),
    }))
    .query(async ({ input }) => {
      return await knowledgeGraphService.getRelatedItems(
        input.sourceType,
        input.sourceId,
        {
          skipCache: input.skipCache,
          maxItems: input.maxItems,
        }
      );
    }),
  
  /**
   * Get links for a specific node
   */
  getLinksForNode: publicProcedure
    .input(z.object({
      nodeType: nodeTypeEnum,
      nodeId: z.number(),
      linkTypes: z.array(linkTypeEnum).optional(),
      status: z.enum(["active", "needs_review", "deprecated", "rejected"]).optional(),
      limit: z.number().optional().default(50),
    }))
    .query(async ({ input }) => {
      return await knowledgeGraphService.getLinksForNode(
        input.nodeType,
        input.nodeId,
        {
          linkTypes: input.linkTypes as any,
          status: input.status,
          limit: input.limit,
        }
      );
    }),
  
  /**
   * Get graph health metrics (public summary)
   */
  getHealthSummary: publicProcedure
    .query(async () => {
      const metrics = await knowledgeGraphService.getLatestGraphHealthMetrics();
      if (!metrics) {
        return {
          totalLinks: 0,
          activeLinks: 0,
          coverageScore: 0,
        };
      }
      
      // Calculate overall coverage score
      const coverageScore = (
        parseFloat(String(metrics.docsLinkedToSectors ?? 0)) +
        parseFloat(String(metrics.entitiesWithLinks ?? 0)) +
        parseFloat(String(metrics.eventsWithEvidence ?? 0))
      ) / 3;
      
      return {
        totalLinks: metrics.totalLinks ?? 0,
        activeLinks: metrics.activeLinks ?? 0,
        coverageScore: Math.round(coverageScore),
        lastUpdated: metrics.measuredAt,
      };
    }),
  
  // ============================================================================
  // ADMIN ENDPOINTS - Link Management
  // ============================================================================
  
  /**
   * Create a new link manually
   */
  createLink: adminProcedure
    .input(z.object({
      linkType: linkTypeEnum,
      srcType: nodeTypeEnum,
      srcId: z.number(),
      srcLabel: z.string().optional(),
      dstType: nodeTypeEnum,
      dstId: z.number(),
      dstLabel: z.string().optional(),
      strengthScore: z.number().min(0).max(1).optional(),
      confidenceLevel: z.enum(["high", "medium", "low", "uncertain"]).optional(),
      evidenceSnippet: z.string().optional(),
      evidenceUrl: z.string().optional(),
      bidirectional: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const linkId = await knowledgeGraphService.createLink({
        ...input,
        method: "manual",
        status: "active",
        createdBy: ctx.user?.id,
      });
      
      return { success: true, linkId };
    }),
  
  /**
   * Update link status
   */
  updateLinkStatus: adminProcedure
    .input(z.object({
      linkId: z.number(),
      status: z.enum(["active", "needs_review", "deprecated", "rejected"]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await knowledgeGraphService.updateLinkStatus(
        input.linkId,
        input.status,
        ctx.user?.id,
        input.notes
      );
      
      return { success: true };
    }),
  
  /**
   * Deprecate a link
   */
  deprecateLink: adminProcedure
    .input(z.object({
      linkId: z.number(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await knowledgeGraphService.deprecateLink(input.linkId, input.reason);
      return { success: true };
    }),
  
  // ============================================================================
  // ADMIN ENDPOINTS - Link Rules
  // ============================================================================
  
  /**
   * Get all link rules
   */
  getRules: adminProcedure
    .query(async () => {
      return await db
        .select()
        .from(linkRules)
        .orderBy(desc(linkRules.priority));
    }),
  
  /**
   * Create a new link rule
   */
  createRule: adminProcedure
    .input(z.object({
      ruleId: z.string(),
      nameEn: z.string(),
      nameAr: z.string().optional(),
      descriptionEn: z.string().optional(),
      descriptionAr: z.string().optional(),
      inputTypes: z.array(z.string()),
      matchLogic: z.object({
        type: z.enum(["keyword", "anchor", "shared_id", "tag", "metadata", "embedding"]),
        keywords: z.array(z.string()).optional(),
        anchorTypes: z.array(z.string()).optional(),
        idFields: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
        metadataFields: z.array(z.string()).optional(),
        embeddingThreshold: z.number().optional(),
      }),
      outputLinkType: z.string(),
      strengthFormula: z.string().optional(),
      isPublicSafe: z.boolean().optional(),
      autoApprove: z.boolean().optional(),
      priority: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const ruleId = await knowledgeGraphService.createLinkRule({
        ...input,
        createdBy: ctx.user?.id,
      });
      
      return { success: true, ruleId };
    }),
  
  /**
   * Toggle rule enabled status
   */
  toggleRule: adminProcedure
    .input(z.object({
      ruleId: z.number(),
      isEnabled: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      await db.update(linkRules)
        .set({ isEnabled: input.isEnabled })
        .where(eq(linkRules.id, input.ruleId));
      
      return { success: true };
    }),
  
  /**
   * Run a specific rule
   */
  runRule: adminProcedure
    .input(z.object({
      ruleId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const result = await knowledgeGraphService.runLinkRule(
        input.ruleId,
        "manual",
        ctx.user?.id
      );
      
      return result;
    }),
  
  /**
   * Get rule run history
   */
  getRuleRuns: adminProcedure
    .input(z.object({
      ruleId: z.number().optional(),
      limit: z.number().optional().default(20),
    }))
    .query(async ({ input }) => {
      const conditions = [];
      if (input.ruleId) {
        conditions.push(eq(linkRuleRuns.ruleId, input.ruleId));
      }
      
      return await db
        .select()
        .from(linkRuleRuns)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(linkRuleRuns.startedAt))
        .limit(input.limit);
    }),
  
  // ============================================================================
  // ADMIN ENDPOINTS - Review Queue
  // ============================================================================
  
  /**
   * Get pending reviews
   */
  getPendingReviews: adminProcedure
    .input(z.object({
      priority: z.enum(["high", "medium", "low"]).optional(),
      limit: z.number().optional().default(50),
    }))
    .query(async ({ input }) => {
      return await knowledgeGraphService.getPendingReviews({
        priority: input.priority,
        limit: input.limit,
      });
    }),
  
  /**
   * Approve a review
   */
  approveReview: adminProcedure
    .input(z.object({
      reviewId: z.number(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await knowledgeGraphService.approveReview(
        input.reviewId,
        ctx.user!.id,
        input.notes
      );
      
      return { success: true };
    }),
  
  /**
   * Reject a review
   */
  rejectReview: adminProcedure
    .input(z.object({
      reviewId: z.number(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await knowledgeGraphService.rejectReview(
        input.reviewId,
        ctx.user!.id,
        input.notes
      );
      
      return { success: true };
    }),
  
  // ============================================================================
  // ADMIN ENDPOINTS - Health Metrics
  // ============================================================================
  
  /**
   * Get detailed health metrics
   */
  getHealthMetrics: adminProcedure
    .query(async () => {
      return await knowledgeGraphService.getLatestGraphHealthMetrics();
    }),
  
  /**
   * Calculate new health metrics
   */
  calculateHealthMetrics: adminProcedure
    .mutation(async () => {
      const metrics = await knowledgeGraphService.calculateGraphHealthMetrics();
      return { success: true, metrics };
    }),
  
  /**
   * Get health metrics history
   */
  getHealthMetricsHistory: adminProcedure
    .input(z.object({
      limit: z.number().optional().default(30),
    }))
    .query(async ({ input }) => {
      return await db
        .select()
        .from(graphHealthMetrics)
        .orderBy(desc(graphHealthMetrics.measuredAt))
        .limit(input.limit);
    }),
  
  // ============================================================================
  // ADMIN ENDPOINTS - Enrichment
  // ============================================================================
  
  /**
   * Enrich a specific item
   */
  enrichItem: adminProcedure
    .input(z.object({
      itemType: z.enum(["document", "update", "event", "entity"]),
      itemId: z.number(),
    }))
    .mutation(async ({ input }) => {
      let result;
      
      switch (input.itemType) {
        case "document":
          result = await autoEnrichmentEngine.enrichDocument(input.itemId);
          break;
        case "update":
          result = await autoEnrichmentEngine.enrichUpdate(input.itemId);
          break;
        case "event":
          result = await autoEnrichmentEngine.enrichEvent(input.itemId);
          break;
        case "entity":
          result = await autoEnrichmentEngine.enrichEntity(input.itemId);
          break;
      }
      
      return { success: true, ...result };
    }),
  
  /**
   * Run batch enrichment
   */
  runBatchEnrichment: adminProcedure
    .input(z.object({
      types: z.array(z.enum(["document", "update", "event", "entity"])).optional(),
      since: z.date().optional(),
    }))
    .mutation(async ({ input }) => {
      const result = await autoEnrichmentEngine.runBatchEnrichment({
        types: input.types as any,
        since: input.since,
      });
      
      return { success: true, ...result };
    }),
  
  /**
   * Seed default link rules
   */
  seedDefaultRules: adminProcedure
    .mutation(async () => {
      await knowledgeGraphService.seedDefaultLinkRules();
      return { success: true };
    }),
  
  // ============================================================================
  // STORY MODE
  // ============================================================================
  
  /**
   * Get story narratives
   */
  getStories: publicProcedure
    .input(z.object({
      subjectType: z.enum(["sector", "entity", "event", "period", "indicator"]).optional(),
      subjectId: z.number().optional(),
      isPublished: z.boolean().optional(),
      limit: z.number().optional().default(10),
    }))
    .query(async ({ input }) => {
      const conditions = [];
      
      if (input.subjectType) {
        conditions.push(eq(storyModeNarratives.subjectType, input.subjectType));
      }
      if (input.subjectId) {
        conditions.push(eq(storyModeNarratives.subjectId, input.subjectId));
      }
      if (input.isPublished !== undefined) {
        conditions.push(eq(storyModeNarratives.isPublished, input.isPublished));
      }
      
      return await db
        .select()
        .from(storyModeNarratives)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(storyModeNarratives.generatedAt))
        .limit(input.limit);
    }),
  
  /**
   * Get a single story by ID
   */
  getStory: publicProcedure
    .input(z.object({
      storyId: z.string(),
    }))
    .query(async ({ input }) => {
      const stories = await db
        .select()
        .from(storyModeNarratives)
        .where(eq(storyModeNarratives.storyId, input.storyId))
        .limit(1);
      
      return stories[0] ?? null;
    }),
  
  /**
   * Generate a new story (admin only)
   */
  generateStory: adminProcedure
    .input(z.object({
      subjectType: z.enum(["sector", "entity", "event", "period", "indicator"]),
      subjectId: z.number().optional(),
      subjectLabel: z.string(),
      periodStart: z.date().optional(),
      periodEnd: z.date().optional(),
    }))
    .mutation(async ({ input }) => {
      // Generate a unique story ID
      const storyId = `story_${input.subjectType}_${input.subjectId ?? "all"}_${Date.now()}`;
      
      // Insert placeholder story (actual generation would use LLM)
      const result = await db.insert(storyModeNarratives).values({
        storyId,
        subjectType: input.subjectType,
        subjectId: input.subjectId,
        subjectLabel: input.subjectLabel,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        titleEn: `Story: ${input.subjectLabel}`,
        titleAr: `قصة: ${input.subjectLabel}`,
        whatHappenedEn: "Story generation in progress...",
        generatedBy: "admin",
        isPublished: false,
      });
      
      return { success: true, storyId, id: result.insertId };
    }),
  
  /**
   * Publish/unpublish a story
   */
  toggleStoryPublished: adminProcedure
    .input(z.object({
      storyId: z.string(),
      isPublished: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      await db.update(storyModeNarratives)
        .set({ isPublished: input.isPublished })
        .where(eq(storyModeNarratives.storyId, input.storyId));
      
      return { success: true };
    }),
});

export type GraphRouter = typeof graphRouter;
