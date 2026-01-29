/**
 * Publications Router
 * Handles publication templates, runs, generation, and approval workflows
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { 
  publicationTemplates,
  publicationRuns,
  publicationEvidenceBundles,
  publicationChangelog
} from "../../drizzle/schema";
import { eq, desc, and, gte, lte, sql, inArray } from "drizzle-orm";
import {
  runEditorialPipeline,
  approvePublicationRun,
  rejectPublicationRun,
  publishRun,
  getPipelineStatus
} from "../services/editorialPipelineService";

export const publicationsRouter = router({
  // Get all publication templates
  getTemplates: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const templates = await db
      .select()
      .from(publicationTemplates)
      .where(eq(publicationTemplates.isActive, true))
      .orderBy(publicationTemplates.templateCode);

    return templates.map(t => ({
      id: t.id,
      templateCode: t.templateCode,
      nameEn: t.nameEn,
      nameAr: t.nameAr,
      descriptionEn: t.descriptionEn,
      descriptionAr: t.descriptionAr,
      publicationType: t.publicationType,
      audience: t.audience,
      languages: t.languages as string[],
      sections: t.sections as Array<{
        sectionCode: string;
        titleEn: string;
        titleAr: string;
        type: string;
        order: number;
        isRequired: boolean;
      }>,
      requiredIndicators: t.requiredIndicators as string[],
      requiredSourcesMin: t.requiredSourcesMin,
      evidenceThreshold: t.evidenceThreshold ? Number(t.evidenceThreshold) : 95,
      approvalPolicy: t.approvalPolicy,
      schedule: t.schedule,
      isActive: t.isActive
    }));
  }),

  // Get single template by code
  getTemplate: publicProcedure
    .input(z.object({ templateCode: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const templates = await db
        .select()
        .from(publicationTemplates)
        .where(eq(publicationTemplates.templateCode, input.templateCode))
        .limit(1);

      const t = templates[0];
      if (!t) return null;

      return {
        id: t.id,
        templateCode: t.templateCode,
        nameEn: t.nameEn,
        nameAr: t.nameAr,
        descriptionEn: t.descriptionEn,
        descriptionAr: t.descriptionAr,
        publicationType: t.publicationType,
        audience: t.audience,
        languages: t.languages as string[],
        sections: t.sections as Array<{
          sectionCode: string;
          titleEn: string;
          titleAr: string;
          type: string;
          order: number;
          isRequired: boolean;
        }>,
        requiredIndicators: t.requiredIndicators as string[],
        requiredSourcesMin: t.requiredSourcesMin,
        evidenceThreshold: t.evidenceThreshold ? Number(t.evidenceThreshold) : 95,
        approvalPolicy: t.approvalPolicy,
        schedule: t.schedule,
        isActive: t.isActive
      };
    }),

  // Get all publication runs with filters
  getRuns: publicProcedure
    .input(z.object({
      templateCode: z.string().optional(),
      approvalState: z.enum(["draft", "in_review", "approved", "published", "rejected", "archived"]).optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0)
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { runs: [], total: 0 };

      const conditions = [];
      if (input.templateCode) {
        conditions.push(eq(publicationRuns.templateCode, input.templateCode));
      }
      if (input.approvalState) {
        conditions.push(eq(publicationRuns.approvalState, input.approvalState));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [runs, countResult] = await Promise.all([
        db
          .select()
          .from(publicationRuns)
          .where(whereClause)
          .orderBy(desc(publicationRuns.createdAt))
          .limit(input.limit)
          .offset(input.offset),
        db
          .select({ count: sql<number>`COUNT(*)` })
          .from(publicationRuns)
          .where(whereClause)
      ]);

      return {
        runs: runs.map(r => ({
          id: r.id,
          templateId: r.templateId,
          templateCode: r.templateCode,
          runWindowStart: r.runWindowStart,
          runWindowEnd: r.runWindowEnd,
          generatedAt: r.generatedAt,
          approvalState: r.approvalState,
          confidenceSummary: r.confidenceSummary,
          pipelineStages: r.pipelineStages,
          approvalsLog: r.approvalsLog,
          outputArtifacts: r.outputArtifacts,
          publicUrl: r.publicUrl,
          createdAt: r.createdAt
        })),
        total: countResult[0]?.count || 0
      };
    }),

  // Get single publication run
  getRun: publicProcedure
    .input(z.object({ runId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const runs = await db
        .select()
        .from(publicationRuns)
        .where(eq(publicationRuns.id, input.runId))
        .limit(1);

      const r = runs[0];
      if (!r) return null;

      // Get evidence bundles for this run
      const bundles = await db
        .select()
        .from(publicationEvidenceBundles)
        .where(eq(publicationEvidenceBundles.publicationRunId, r.id));

      return {
        id: r.id,
        templateId: r.templateId,
        templateCode: r.templateCode,
        runWindowStart: r.runWindowStart,
        runWindowEnd: r.runWindowEnd,
        generatedAt: r.generatedAt,
        inputsSnapshotRefs: r.inputsSnapshotRefs,
        outputArtifacts: r.outputArtifacts,
        contradictionsSummary: r.contradictionsSummary,
        dqafQualitySummary: r.dqafQualitySummary,
        confidenceSummary: r.confidenceSummary,
        pipelineStages: r.pipelineStages,
        approvalState: r.approvalState,
        approvalsLog: r.approvalsLog,
        publicUrl: r.publicUrl,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        evidenceBundles: bundles.map(b => ({
          id: b.id,
          evidencePackIds: b.evidencePackIds,
          sectionCoverage: b.sectionCoverage,
          topContradictions: b.topContradictions
        }))
      };
    }),

  // Get published publications for public hub
  getPublished: publicProcedure
    .input(z.object({
      publicationType: z.string().optional(),
      limit: z.number().min(1).max(50).default(10),
      offset: z.number().min(0).default(0)
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { publications: [], total: 0 };

      const conditions = [eq(publicationRuns.approvalState, "published")];
      
      if (input.publicationType) {
        // Join with templates to filter by type
        const templateCodes = await db
          .select({ code: publicationTemplates.templateCode })
          .from(publicationTemplates)
          .where(eq(publicationTemplates.publicationType, input.publicationType as "daily" | "weekly" | "monthly" | "quarterly" | "annual" | "shock_note"));
        
        if (templateCodes.length > 0) {
          conditions.push(
            inArray(publicationRuns.templateCode, templateCodes.map(t => t.code))
          );
        }
      }

      const whereClause = and(...conditions);

      const [runs, countResult] = await Promise.all([
        db
          .select()
          .from(publicationRuns)
          .where(whereClause)
          .orderBy(desc(publicationRuns.createdAt))
          .limit(input.limit)
          .offset(input.offset),
        db
          .select({ count: sql<number>`COUNT(*)` })
          .from(publicationRuns)
          .where(whereClause)
      ]);

      return {
        publications: runs.map(r => ({
          id: r.id,
          templateCode: r.templateCode,
          runWindowStart: r.runWindowStart,
          runWindowEnd: r.runWindowEnd,
          outputArtifacts: r.outputArtifacts,
          publicUrl: r.publicUrl,
          confidenceSummary: r.confidenceSummary,
          createdAt: r.createdAt
        })),
        total: countResult[0]?.count || 0
      };
    }),

  // Generate a new publication run (admin only)
  generateRun: protectedProcedure
    .input(z.object({
      templateCode: z.string(),
      runWindowStart: z.string().optional(),
      runWindowEnd: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Check admin role
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required");
      }

      // Get template
      const templates = await db
        .select()
        .from(publicationTemplates)
        .where(eq(publicationTemplates.templateCode, input.templateCode))
        .limit(1);

      const template = templates[0];
      if (!template) {
        throw new Error("Template not found");
      }

      // Calculate period if not provided
      const now = new Date();
      const runWindowStart = input.runWindowStart ? new Date(input.runWindowStart) : new Date(now.getFullYear(), now.getMonth(), 1);
      const runWindowEnd = input.runWindowEnd ? new Date(input.runWindowEnd) : now;

      // Create the publication run
      const result = await db.insert(publicationRuns).values({
        templateId: template.id,
        templateCode: input.templateCode,
        runWindowStart,
        runWindowEnd,
        approvalState: "draft",
        pipelineStages: [],
        approvalsLog: [{
          action: "submit" as const,
          actorType: "admin" as const,
          actorId: ctx.user.id,
          actorName: ctx.user.name || "Admin",
          timestamp: new Date().toISOString()
        }]
      });

      const runId = Number((result as unknown as { insertId: number }).insertId);

      // Run the editorial pipeline
      const pipelineResult = await runEditorialPipeline(
        template.id,
        runWindowStart,
        runWindowEnd
      );

      // Determine approval state based on pipeline result
      const citationCoverage = pipelineResult.confidenceSummary?.citationCoverage || 0;
      const allStagesPassed = pipelineResult.success;
      const requiresAdminApproval = pipelineResult.finalState === "in_review";

      // Update the run with pipeline results
      await db.update(publicationRuns)
        .set({
          approvalState: pipelineResult.finalState,
          confidenceSummary: pipelineResult.confidenceSummary || {
            overallConfidence: citationCoverage >= 95 ? "high" : 
                              citationCoverage >= 80 ? "medium" : "low",
            citationCoverage,
            sourceCount: 0,
            freshestDataDate: runWindowEnd.toISOString(),
            oldestDataDate: runWindowStart.toISOString()
          },
          pipelineStages: pipelineResult.stages.map((s, i) => ({
            stage: i + 1,
            stageName: String(s.stage),
            status: s.status as "pending" | "running" | "passed" | "failed" | "skipped",
            startedAt: s.startedAt,
            completedAt: s.completedAt,
            errors: s.errors
          })),
          dqafQualitySummary: pipelineResult.dqafSummary,
          contradictionsSummary: pipelineResult.dataContradictionsSummary,
          generatedAt: new Date()
        })
        .where(eq(publicationRuns.id, runId));

      return {
        runId,
        pipelineResult: {
          allStagesPassed,
          requiresAdminApproval,
          citationCoverage,
          stageCount: pipelineResult.stages.length
        }
      };
    }),

  // Approve a publication run (admin only)
  approveRun: protectedProcedure
    .input(z.object({
      runId: z.number(),
      notes: z.string().optional(),
      notesAr: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required");
      }

      const success = await approvePublicationRun(
        input.runId,
        ctx.user.id,
        ctx.user.name || "Admin",
        input.notes,
        input.notesAr
      );

      if (!success) {
        throw new Error("Failed to approve publication run");
      }

      return { success: true };
    }),

  // Reject a publication run (admin only)
  rejectRun: protectedProcedure
    .input(z.object({
      runId: z.number(),
      notes: z.string(),
      notesAr: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required");
      }

      const success = await rejectPublicationRun(
        input.runId,
        ctx.user.id,
        ctx.user.name || "Admin",
        input.notes,
        input.notesAr
      );

      if (!success) {
        throw new Error("Failed to reject publication run");
      }

      return { success: true };
    }),

  // Publish an approved run (admin only)
  publishRun: protectedProcedure
    .input(z.object({
      runId: z.number()
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required");
      }

      // Generate public URL
      const publicUrl = `/publications/${input.runId}`;

      const success = await publishRun(input.runId, publicUrl);

      if (!success) {
        throw new Error("Failed to publish run");
      }

      return { success: true, publicUrl };
    }),

  // Get pipeline status for a run
  getPipelineStatus: publicProcedure
    .input(z.object({ runId: z.number() }))
    .query(async ({ input }) => {
      const stages = await getPipelineStatus(input.runId);
      return stages || [];
    }),

  // Get publication changelog
  getChangelog: publicProcedure
    .input(z.object({
      publicationRunId: z.number().optional(),
      limit: z.number().min(1).max(100).default(20)
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = [];
      if (input.publicationRunId) {
        conditions.push(eq(publicationChangelog.publicationRunId, input.publicationRunId));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const changes = await db
        .select()
        .from(publicationChangelog)
        .where(whereClause)
        .orderBy(desc(publicationChangelog.createdAt))
        .limit(input.limit);

      return changes.map(c => ({
        id: c.id,
        publicationRunId: c.publicationRunId,
        changeType: c.changeType,
        titleEn: c.titleEn,
        titleAr: c.titleAr,
        descriptionEn: c.descriptionEn,
        descriptionAr: c.descriptionAr,
        affectedSections: c.affectedSections,
        previousValue: c.previousValue,
        newValue: c.newValue,
        reasonEn: c.reasonEn,
        reasonAr: c.reasonAr,
        isPublic: c.isPublic,
        createdAt: c.createdAt
      }));
    }),

  // Get dashboard summary for admin
  getDashboardSummary: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Admin access required");
    }

    const db = await getDb();
    if (!db) return null;

    // Get counts by state
    const stateCounts = await db
      .select({
        state: publicationRuns.approvalState,
        count: sql<number>`COUNT(*)`
      })
      .from(publicationRuns)
      .groupBy(publicationRuns.approvalState);

    // Get recent runs
    const recentRuns = await db
      .select()
      .from(publicationRuns)
      .orderBy(desc(publicationRuns.createdAt))
      .limit(5);

    // Get template counts
    const templateCounts = await db
      .select({
        templateCode: publicationRuns.templateCode,
        count: sql<number>`COUNT(*)`
      })
      .from(publicationRuns)
      .groupBy(publicationRuns.templateCode);

    return {
      stateCounts: stateCounts.reduce((acc, s) => {
        if (s.state) acc[s.state] = s.count;
        return acc;
      }, {} as Record<string, number>),
      recentRuns: recentRuns.map(r => ({
        id: r.id,
        templateCode: r.templateCode,
        approvalState: r.approvalState,
        createdAt: r.createdAt
      })),
      templateCounts: templateCounts.reduce((acc, t) => {
        acc[t.templateCode] = t.count;
        return acc;
      }, {} as Record<string, number>)
    };
  })
});
