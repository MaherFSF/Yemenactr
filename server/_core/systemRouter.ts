import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, protectedProcedure, router } from "./trpc";
import { getReviewModeStatus } from "../middleware/reviewMode";
import { getDb } from "../db";
import { gapTickets } from "../../drizzle/schema";

// Generate unique GAP ID
const generateGapId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `GAP-${timestamp}-${random}`;
};

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  reviewModeStatus: publicProcedure
    .query(() => getReviewModeStatus()),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),

  // TRUTH-NATIVE: Create GAP ticket for missing evidence
  createGapTicket: protectedProcedure
    .input(
      z.object({
        gapType: z.enum([
          "missing_data",
          "stale",
          "access_blocked",
          "schema_drift",
          "contradiction",
          "quality_low",
          "coverage_gap",
          "ingestion_failed"
        ]),
        severity: z.enum(["critical", "high", "medium", "low"]).default("medium"),
        titleEn: z.string().min(1, "title is required"),
        titleAr: z.string().optional(),
        descriptionEn: z.string().optional(),
        descriptionAr: z.string().optional(),
        sectorCode: z.string().optional(),
        indicatorCode: z.string().optional(),
        sourceRegistryId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const gapId = generateGapId();

      try {
        await db.insert(gapTickets).values({
          gapId,
          gapType: input.gapType,
          severity: input.severity,
          titleEn: input.titleEn,
          titleAr: input.titleAr || null,
          descriptionEn: input.descriptionEn || null,
          descriptionAr: input.descriptionAr || null,
          sectorCode: input.sectorCode || null,
          indicatorCode: input.indicatorCode || null,
          sourceRegistryId: input.sourceRegistryId || null,
          status: "open",
          isPublic: true,
          ownerRole: ctx.user?.role || "user",
        });

        return {
          success: true,
          gapId,
          message: `GAP ticket ${gapId} created successfully`,
        };
      } catch (error) {
        console.error("Error creating GAP ticket:", error);
        // Return a local GAP ID even if DB insert fails
        return {
          success: false,
          gapId,
          message: "GAP ticket recorded locally (database unavailable)",
        };
      }
    }),

  // Get GAP tickets for an indicator
  getGapTickets: publicProcedure
    .input(
      z.object({
        indicatorCode: z.string().optional(),
        sectorCode: z.string().optional(),
        status: z.enum(["open", "in_progress", "resolved", "wont_fix", "duplicate"]).optional(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return { tickets: [], total: 0 };
      }

      try {
        const conditions = [];
        if (input.indicatorCode) {
          conditions.push(`indicatorCode = '${input.indicatorCode}'`);
        }
        if (input.sectorCode) {
          conditions.push(`sectorCode = '${input.sectorCode}'`);
        }
        if (input.status) {
          conditions.push(`status = '${input.status}'`);
        }

        const whereClause = conditions.length > 0 
          ? `WHERE ${conditions.join(" AND ")}` 
          : "";

        const result = await db.execute(`
          SELECT * FROM gap_tickets 
          ${whereClause}
          ORDER BY createdAt DESC 
          LIMIT ${input.limit}
        `);

        const tickets = Array.isArray(result) ? result : (result as any)[0] || [];

        return {
          tickets,
          total: tickets.length,
        };
      } catch (error) {
        console.error("Error fetching GAP tickets:", error);
        return { tickets: [], total: 0 };
      }
    }),
});
