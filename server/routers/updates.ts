/**
 * Updates Router
 * 
 * Handles updates/news feed operations:
 * - Public: List published updates, get update details
 * - Admin: Review queue, approve/reject, run ingestion
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { 
  updateItems, 
  updateEvidenceBundles,
  updateSignals,
  updateNotifications,
  sourceRegistry
} from "../../drizzle/schema";
import { eq, and, desc, asc, sql, like, or, inArray } from "drizzle-orm";
import { ingestUpdate, RawUpdate, runDailyUpdatesIngestion } from "../services/updatesIngestionService";
import { runPublishingPipeline, applyPublishingDecision, getPublishingStats } from "../services/governedPublishingService";

export const updatesRouter = router({
  // ============================================================================
  // PUBLIC ENDPOINTS
  // ============================================================================
  
  /**
   * Get published updates for public display
   */
  getPublished: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
      offset: z.number().min(0).default(0),
      sector: z.string().optional(),
      updateType: z.string().optional(),
      search: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { updates: [], total: 0 };
      
      let query = db.select()
        .from(updateItems)
        .where(
          and(
            eq(updateItems.status, "published"),
            eq(updateItems.visibility, "public")
          )
        )
        .orderBy(desc(updateItems.publishedAt))
        .limit(input.limit)
        .offset(input.offset);
      
      const updates = await query;
      
      // Get total count
      const [countResult] = await db.select({ count: sql<number>`count(*)` })
        .from(updateItems)
        .where(
          and(
            eq(updateItems.status, "published"),
            eq(updateItems.visibility, "public")
          )
        );
      
      return {
        updates: updates.map(u => ({
          id: u.id,
          titleEn: u.titleEn,
          titleAr: u.titleAr,
          summaryEn: u.summaryEn,
          summaryAr: u.summaryAr,
          sourcePublisher: u.sourcePublisher,
          sourceUrl: u.sourceUrl,
          publishedAt: u.publishedAt,
          sectors: u.sectors,
          entities: u.entities,
          updateType: u.updateType,
          confidenceGrade: u.confidenceGrade,
          evidencePackId: u.evidencePackId,
        })),
        total: countResult?.count || 0,
      };
    }),
  
  /**
   * Get single update by ID (public)
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      
      const [update] = await db.select()
        .from(updateItems)
        .where(
          and(
            eq(updateItems.id, input.id),
            eq(updateItems.status, "published")
          )
        )
        .limit(1);
      
      if (!update) return null;
      
      // Get evidence bundle
      const [bundle] = await db.select()
        .from(updateEvidenceBundles)
        .where(eq(updateEvidenceBundles.updateItemId, input.id))
        .limit(1);
      
      return {
        ...update,
        evidenceBundle: bundle || null,
      };
    }),
  
  /**
   * Get latest updates for homepage
   */
  getLatest: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(10).default(6) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      const updates = await db.select()
        .from(updateItems)
        .where(
          and(
            eq(updateItems.status, "published"),
            eq(updateItems.visibility, "public")
          )
        )
        .orderBy(desc(updateItems.publishedAt))
        .limit(input.limit);
      
      return updates.map(u => ({
        id: u.id,
        titleEn: u.titleEn,
        titleAr: u.titleAr,
        summaryEn: u.summaryEn?.substring(0, 200),
        summaryAr: u.summaryAr?.substring(0, 200),
        sourcePublisher: u.sourcePublisher,
        publishedAt: u.publishedAt,
        updateType: u.updateType,
        sectors: u.sectors,
        confidenceGrade: u.confidenceGrade,
      }));
    }),
  
  /**
   * Get updates by sector
   */
  getBySector: publicProcedure
    .input(z.object({ 
      sector: z.string(),
      limit: z.number().min(1).max(20).default(10),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      // Get all published updates and filter by sector
      const updates = await db.select()
        .from(updateItems)
        .where(
          and(
            eq(updateItems.status, "published"),
            eq(updateItems.visibility, "public")
          )
        )
        .orderBy(desc(updateItems.publishedAt))
        .limit(100);
      
      // Filter by sector (sectors is a JSON array)
      const filtered = updates.filter(u => {
        const sectors = u.sectors as string[] || [];
        return sectors.includes(input.sector);
      }).slice(0, input.limit);
      
      return filtered;
    }),
  
  // ============================================================================
  // ADMIN ENDPOINTS
  // ============================================================================
  
  /**
   * Get review queue (admin only)
   */
  getReviewQueue: protectedProcedure
    .input(z.object({
      status: z.enum(["queued_for_review", "draft", "rejected", "all"]).default("queued_for_review"),
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { updates: [], total: 0 };
      
      let whereClause;
      if (input.status === "all") {
        whereClause = or(
          eq(updateItems.status, "queued_for_review"),
          eq(updateItems.status, "draft"),
          eq(updateItems.status, "rejected")
        );
      } else {
        whereClause = eq(updateItems.status, input.status);
      }
      
      const updates = await db.select()
        .from(updateItems)
        .where(whereClause)
        .orderBy(desc(updateItems.createdAt))
        .limit(input.limit)
        .offset(input.offset);
      
      const [countResult] = await db.select({ count: sql<number>`count(*)` })
        .from(updateItems)
        .where(whereClause);
      
      return {
        updates,
        total: countResult?.count || 0,
      };
    }),
  
  /**
   * Run publishing pipeline for an update (admin only)
   */
  runPipeline: protectedProcedure
    .input(z.object({ updateItemId: z.number() }))
    .mutation(async ({ input }) => {
      const decision = await runPublishingPipeline(input.updateItemId);
      return decision;
    }),
  
  /**
   * Approve an update (admin only)
   */
  approve: protectedProcedure
    .input(z.object({
      updateItemId: z.number(),
      visibility: z.enum(["public", "vip_only", "admin_only"]).default("public"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { success: false, error: "Database not available" };
      
      try {
        await db.update(updateItems)
          .set({
            status: "published",
            visibility: input.visibility,
            reviewedBy: ctx.user.id,
            reviewedAt: new Date(),
          })
          .where(eq(updateItems.id, input.updateItemId));
        
        return { success: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),
  
  /**
   * Reject an update (admin only)
   */
  reject: protectedProcedure
    .input(z.object({
      updateItemId: z.number(),
      reason: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { success: false, error: "Database not available" };
      
      try {
        await db.update(updateItems)
          .set({
            status: "rejected",
            rejectionReason: input.reason,
            reviewedBy: ctx.user.id,
            reviewedAt: new Date(),
          })
          .where(eq(updateItems.id, input.updateItemId));
        
        return { success: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),
  
  /**
   * Manually ingest an update (admin only)
   */
  ingest: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      summary: z.string().min(1),
      body: z.string().optional(),
      sourceUrl: z.string().url(),
      sourcePublisher: z.string().min(1),
      publishedAt: z.string(),
      language: z.enum(["en", "ar"]),
      updateType: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, error: "Database not available" };
      
      // Find or create source
      let sourceId = 1; // Default source
      const [existingSource] = await db.select()
        .from(sourceRegistry)
        .where(eq(sourceRegistry.name, input.sourcePublisher))
        .limit(1);
      
      if (existingSource) {
        sourceId = existingSource.id;
      }
      
      const rawUpdate: RawUpdate = {
        title: input.title,
        summary: input.summary,
        body: input.body,
        sourceUrl: input.sourceUrl,
        sourcePublisher: input.sourcePublisher,
        publishedAt: new Date(input.publishedAt),
        language: input.language,
        updateType: input.updateType,
      };
      
      const result = await ingestUpdate(rawUpdate, sourceId);
      return result;
    }),
  
  /**
   * Run daily ingestion job (admin only)
   */
  runDailyIngestion: protectedProcedure
    .mutation(async () => {
      const result = await runDailyUpdatesIngestion();
      return result;
    }),
  
  /**
   * Get publishing statistics (admin only)
   */
  getStats: protectedProcedure
    .query(async () => {
      const stats = await getPublishingStats();
      return stats;
    }),
  
  /**
   * Get signals for an update (admin only)
   */
  getSignals: protectedProcedure
    .input(z.object({ updateItemId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      const signals = await db.select()
        .from(updateSignals)
        .where(eq(updateSignals.updateItemId, input.updateItemId))
        .orderBy(desc(updateSignals.createdAt));
      
      return signals;
    }),
  
  /**
   * Get notifications (admin only)
   */
  getNotifications: protectedProcedure
    .input(z.object({
      status: z.enum(["pending", "sent", "failed", "read", "all"]).default("all"),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      if (input.status !== "all") {
        return await db.select()
          .from(updateNotifications)
          .where(eq(updateNotifications.status, input.status))
          .orderBy(desc(updateNotifications.createdAt))
          .limit(input.limit);
      }
      
      return await db.select()
        .from(updateNotifications)
        .orderBy(desc(updateNotifications.createdAt))
        .limit(input.limit);
    }),
});

export type UpdatesRouter = typeof updatesRouter;

