import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { eq, and, desc, sql } from "drizzle-orm";
import { 
  evidencePacks, 
  datasetVersions, 
  dataContradictions,
  sources,
  datasets
} from "../../drizzle/schema";

// Evidence Pack schema for validation
const citationSchema = z.object({
  sourceId: z.number(),
  title: z.string(),
  publisher: z.string(),
  url: z.string().optional(),
  retrievalDate: z.string(),
  licenseFlag: z.string(),
  anchor: z.string().optional(),
  rawObjectRef: z.string().optional(),
});

const transformSchema = z.object({
  formula: z.string().optional(),
  parameters: z.record(z.string(), z.unknown()).optional(),
  codeRef: z.string().optional(),
  assumptions: z.array(z.string()).optional(),
  description: z.string().optional(),
});

const contradictionSchema = z.object({
  altSourceId: z.number(),
  altSourceName: z.string(),
  altValue: z.string(),
  ourValue: z.string(),
  methodNotes: z.string().optional(),
  whyDifferent: z.string().optional(),
});

const missingRangeSchema = z.object({
  start: z.string(),
  end: z.string(),
  reason: z.string().optional(),
});

const dqafStatusEnum = z.enum(["pass", "needs_review", "unknown"]);
const confidenceGradeEnum = z.enum(["A", "B", "C", "D"]);

export const evidenceRouter = {
  // Get evidence pack by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db
        .select()
        .from(evidencePacks)
        .where(eq(evidencePacks.id, input.id))
        .limit(1);
      
      return result[0] || null;
    }),

  // Get evidence pack by subject
  getBySubject: publicProcedure
    .input(z.object({
      subjectType: z.string(),
      subjectId: z.string(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db
        .select()
        .from(evidencePacks)
        .where(
          and(
            eq(evidencePacks.subjectType, input.subjectType as any),
            eq(evidencePacks.subjectId, input.subjectId)
          )
        )
        .orderBy(desc(evidencePacks.createdAt))
        .limit(1);
      
      return result[0] || null;
    }),

  // List evidence packs with filters
  list: publicProcedure
    .input(z.object({
      subjectType: z.string().optional(),
      confidenceGrade: z.enum(["A", "B", "C", "D"]).optional(),
      hasContradictions: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const conditions = [];
      
      if (input.subjectType) {
        conditions.push(eq(evidencePacks.subjectType, input.subjectType as any));
      }
      if (input.confidenceGrade) {
        conditions.push(eq(evidencePacks.confidenceGrade, input.confidenceGrade));
      }
      if (input.hasContradictions !== undefined) {
        conditions.push(eq(evidencePacks.hasContradictions, input.hasContradictions));
      }
      
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [items, countResult] = await Promise.all([
        db
          .select()
          .from(evidencePacks)
          .where(whereClause)
          .orderBy(desc(evidencePacks.createdAt))
          .limit(input.limit)
          .offset(input.offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(evidencePacks)
          .where(whereClause),
      ]);
      
      return {
        items,
        total: countResult[0]?.count || 0,
        hasMore: (input.offset + items.length) < (countResult[0]?.count || 0),
      };
    }),

  // Create evidence pack (admin/editor only)
  create: protectedProcedure
    .input(z.object({
      subjectType: z.enum(["metric", "series", "document", "claim", "alert", "report", "chart", "kpi", "table_cell"]),
      subjectId: z.string(),
      subjectLabel: z.string().optional(),
      citations: z.array(citationSchema),
      transforms: z.array(transformSchema).optional(),
      regimeTags: z.array(z.string()),
      geoScope: z.string(),
      timeCoverageStart: z.string().optional(),
      timeCoverageEnd: z.string().optional(),
      missingRanges: z.array(missingRangeSchema).optional(),
      contradictions: z.array(contradictionSchema).optional(),
      dqafIntegrity: dqafStatusEnum.default("unknown"),
      dqafMethodology: dqafStatusEnum.default("unknown"),
      dqafAccuracyReliability: dqafStatusEnum.default("unknown"),
      dqafServiceability: dqafStatusEnum.default("unknown"),
      dqafAccessibility: dqafStatusEnum.default("unknown"),
      uncertaintyInterval: z.string().optional(),
      uncertaintyNote: z.string().optional(),
      confidenceGrade: confidenceGradeEnum,
      confidenceExplanation: z.string(),
      whatWouldChange: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const hasContradictions = (input.contradictions?.length || 0) > 0;
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.insert(evidencePacks).values({
        subjectType: input.subjectType,
        subjectId: input.subjectId,
        subjectLabel: input.subjectLabel,
        citations: input.citations,
        transforms: input.transforms,
        regimeTags: input.regimeTags,
        geoScope: input.geoScope,
        timeCoverageStart: input.timeCoverageStart ? new Date(input.timeCoverageStart) : null,
        timeCoverageEnd: input.timeCoverageEnd ? new Date(input.timeCoverageEnd) : null,
        missingRanges: input.missingRanges,
        contradictions: input.contradictions,
        hasContradictions,
        dqafIntegrity: input.dqafIntegrity,
        dqafMethodology: input.dqafMethodology,
        dqafAccuracyReliability: input.dqafAccuracyReliability,
        dqafServiceability: input.dqafServiceability,
        dqafAccessibility: input.dqafAccessibility,
        uncertaintyInterval: input.uncertaintyInterval,
        uncertaintyNote: input.uncertaintyNote,
        confidenceGrade: input.confidenceGrade,
        confidenceExplanation: input.confidenceExplanation,
        whatWouldChange: input.whatWouldChange,
      });
      
      return { id: (result as any)[0]?.insertId || 0 };
    }),

  // Get dataset vintages (versions)
  getDatasetVintages: publicProcedure
    .input(z.object({
      datasetId: z.number(),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const vintages = await db
        .select()
        .from(datasetVersions)
        .where(eq(datasetVersions.datasetId, input.datasetId))
        .orderBy(desc(datasetVersions.vintageDate))
        .limit(input.limit);
      
      return vintages;
    }),

  // Compare two vintages
  compareVintages: publicProcedure
    .input(z.object({
      vintageId1: z.number(),
      vintageId2: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [vintage1, vintage2] = await Promise.all([
        db.select().from(datasetVersions).where(eq(datasetVersions.id, input.vintageId1)).limit(1),
        db.select().from(datasetVersions).where(eq(datasetVersions.id, input.vintageId2)).limit(1),
      ]);
      
      if (!vintage1[0] || !vintage2[0]) {
        throw new Error("One or both vintages not found");
      }
      
      return {
        vintage1: vintage1[0],
        vintage2: vintage2[0],
        // Diff summary would be computed from changeSummary fields
        diffSummary: {
          recordsAdded: (vintage2[0].changeSummary as any)?.recordsAdded || 0,
          recordsModified: (vintage2[0].changeSummary as any)?.recordsModified || 0,
          recordsDeleted: (vintage2[0].changeSummary as any)?.recordsDeleted || 0,
        },
      };
    }),

  // Get contradictions for an indicator
  getContradictions: publicProcedure
    .input(z.object({
      indicatorCode: z.string().optional(),
      status: z.enum(["detected", "investigating", "explained", "resolved"]).optional(),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ input }) => {
      const conditions = [];
      
      if (input.indicatorCode) {
        conditions.push(eq(dataContradictions.indicatorCode, input.indicatorCode));
      }
      if (input.status) {
        conditions.push(eq(dataContradictions.status, input.status));
      }
      
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const contradictions = await db
        .select({
          contradiction: dataContradictions,
          source1: sources,
        })
        .from(dataContradictions)
        .leftJoin(sources, eq(dataContradictions.source1Id, sources.id))
        .where(whereClause)
        .orderBy(desc(dataContradictions.detectedAt))
        .limit(input.limit);
      
      return contradictions;
    }),

  // Get provenance chain for a data point
  getProvenanceChain: publicProcedure
    .input(z.object({
      dataPointType: z.string(),
      dataPointId: z.number(),
    }))
    .query(async ({ input }) => {
      // This would trace: observation → series → dataset_version → ingestion_run → raw_object → source
      // For now, return a simplified provenance chain
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Get the evidence pack for this data point
      const evidencePack = await db
        .select()
        .from(evidencePacks)
        .where(
          and(
            eq(evidencePacks.subjectType, input.dataPointType as any),
            eq(evidencePacks.subjectId, String(input.dataPointId))
          )
        )
        .limit(1);
      
      if (!evidencePack[0]) {
        return null;
      }
      
      // Get source details for each citation
      const sourceIds = evidencePack[0].citations?.map((c: any) => c.sourceId) || [];
      const sourcesData = sourceIds.length > 0 
        ? await db.select().from(sources).where(sql`id IN (${sourceIds.join(",")})`)
        : [];
      
      return {
        evidencePack: evidencePack[0],
        sources: sourcesData,
        chain: [
          { level: "observation", id: input.dataPointId, type: input.dataPointType },
          { level: "evidence_pack", id: evidencePack[0].id },
          { level: "citations", count: evidencePack[0].citations?.length || 0 },
          { level: "sources", count: sourcesData.length },
        ],
      };
    }),

  // Get evidence coverage stats (for release gate)
  getCoverageStats: protectedProcedure
    .query(async () => {
      // Count total KPIs/metrics that should have evidence
      // Count those that actually have evidence packs
      // Return coverage percentage
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [totalPacks, byConfidence, withContradictions] = await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(evidencePacks),
        db
          .select({
            grade: evidencePacks.confidenceGrade,
            count: sql<number>`count(*)`,
          })
          .from(evidencePacks)
          .groupBy(evidencePacks.confidenceGrade),
        db
          .select({ count: sql<number>`count(*)` })
          .from(evidencePacks)
          .where(eq(evidencePacks.hasContradictions, true)),
      ]);
      
      return {
        totalEvidencePacks: totalPacks[0]?.count || 0,
        byConfidenceGrade: byConfidence.reduce((acc: Record<string, number>, row: { grade: string; count: number }) => {
          acc[row.grade] = row.count;
          return acc;
        }, {} as Record<string, number>),
        withContradictions: withContradictions[0]?.count || 0,
      };
    }),
};

export type EvidenceRouter = typeof evidenceRouter;
