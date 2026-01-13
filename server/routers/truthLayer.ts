/**
 * Truth Layer tRPC Router
 * 
 * Provides APIs for:
 * - Claim Ledger: Create, read, update claims with provenance
 * - Evidence Graph: Manage evidence sources, documents, excerpts
 * - Conflicts: Detect and resolve source disagreements
 * - Confidence: Compute and retrieve confidence scores
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { sql, eq, and, desc, like, or, inArray, gte, lte, isNull } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// Helper to get db instance
const getDbInstance = async () => {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
};

// ============================================================================
// CLAIM LEDGER PROCEDURES
// ============================================================================

const claimSchema = z.object({
  claimType: z.enum(["metric_value", "event_statement", "regulation_statement", "narrative_statement", "model_parameter"]),
  subjectType: z.enum(["indicator", "entity", "event", "regulation", "geography"]),
  subjectId: z.string(),
  subjectLabel: z.string().optional(),
  subjectLabelAr: z.string().optional(),
  predicate: z.enum(["equals", "increased_by", "decreased_by", "changed_to", "announced", "implemented", "estimated_at", "reported_as", "projected_to", "other"]),
  objectValue: z.number().optional(),
  objectText: z.string().optional(),
  objectUnit: z.string().optional(),
  objectFrequency: z.string().optional(),
  objectBaseYear: z.number().optional(),
  geography: z.string().optional(),
  regimeTag: z.enum(["aden_irg", "sanaa_defacto", "mixed", "unknown"]),
  timeStart: z.date().optional(),
  timeEnd: z.date().optional(),
  asOfDate: z.date().optional(),
  computationLineage: z.object({
    steps: z.array(z.object({
      operation: z.string(),
      input: z.string(),
      output: z.string()
    })),
    rawValue: z.string().optional(),
    transformations: z.array(z.string()).optional()
  }).optional(),
  confidenceGrade: z.enum(["A", "B", "C", "D"]),
  confidenceRationale: z.string().optional(),
  visibility: z.enum(["public", "registered", "pro", "admin"]).default("public"),
  createdBy: z.enum(["system_ingestion", "contributor", "analyst", "admin"])
});

export const truthLayerRouter = router({
  // ============================================================================
  // CLAIM LEDGER
  // ============================================================================
  
  /**
   * Get a single claim by ID with full evidence chain
   */
  getClaim: publicProcedure
    .input(z.object({ claimId: z.string() }))
    .query(async ({ input }) => {
      const [claim] = await (await getDbInstance()).execute(sql`
        SELECT c.*, 
               JSON_ARRAYAGG(
                 JSON_OBJECT(
                   'evidenceType', cel.evidenceType,
                   'evidenceId', cel.evidenceId,
                   'isPrimary', cel.isPrimary,
                   'relevanceScore', cel.relevanceScore
                 )
               ) as evidence
        FROM claims c
        LEFT JOIN claim_evidence_links cel ON c.id = cel.claimId
        WHERE c.id = ${input.claimId}
        GROUP BY c.id
      `);
      
      return claim || null;
    }),

  /**
   * Search claims with filters
   */
  searchClaims: publicProcedure
    .input(z.object({
      subjectType: z.enum(["indicator", "entity", "event", "regulation", "geography"]).optional(),
      subjectId: z.string().optional(),
      claimType: z.enum(["metric_value", "event_statement", "regulation_statement", "narrative_statement", "model_parameter"]).optional(),
      regimeTag: z.enum(["aden_irg", "sanaa_defacto", "mixed", "unknown"]).optional(),
      confidenceGrade: z.enum(["A", "B", "C", "D"]).optional(),
      timeStart: z.date().optional(),
      timeEnd: z.date().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0)
    }))
    .query(async ({ input }) => {
      let whereClause = sql`1=1`;
      
      if (input.subjectType) {
        whereClause = sql`${whereClause} AND subjectType = ${input.subjectType}`;
      }
      if (input.subjectId) {
        whereClause = sql`${whereClause} AND subjectId = ${input.subjectId}`;
      }
      if (input.claimType) {
        whereClause = sql`${whereClause} AND claimType = ${input.claimType}`;
      }
      if (input.regimeTag) {
        whereClause = sql`${whereClause} AND regimeTag = ${input.regimeTag}`;
      }
      if (input.confidenceGrade) {
        whereClause = sql`${whereClause} AND confidenceGrade = ${input.confidenceGrade}`;
      }
      if (input.timeStart) {
        whereClause = sql`${whereClause} AND timeStart >= ${input.timeStart}`;
      }
      if (input.timeEnd) {
        whereClause = sql`${whereClause} AND timeEnd <= ${input.timeEnd}`;
      }
      
      const claims = await (await getDbInstance()).execute(sql`
        SELECT * FROM claims
        WHERE ${whereClause}
        ORDER BY createdAt DESC
        LIMIT ${input.limit} OFFSET ${input.offset}
      `);
      
      const [countResult] = await (await getDbInstance()).execute(sql`
        SELECT COUNT(*) as total FROM claims WHERE ${whereClause}
      `);
      
      return {
        claims,
        total: (countResult as any)?.total || 0,
        limit: input.limit,
        offset: input.offset
      };
    }),

  /**
   * Create a new claim with evidence links
   */
  createClaim: protectedProcedure
    .input(z.object({
      claim: claimSchema,
      evidenceLinks: z.array(z.object({
        evidenceType: z.enum(["document", "excerpt", "dataset", "observation"]),
        evidenceId: z.number(),
        isPrimary: z.boolean().default(false),
        relevanceScore: z.number().optional()
      })).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const claimId = uuidv4();
      
      // Insert claim
      await (await getDbInstance()).execute(sql`
        INSERT INTO claims (
          id, claimType, subjectType, subjectId, subjectLabel, subjectLabelAr,
          predicate, objectValue, objectText, objectUnit, objectFrequency, objectBaseYear,
          geography, regimeTag, timeStart, timeEnd, asOfDate, computationLineage,
          confidenceGrade, confidenceRationale, visibility, createdBy, createdByUserId
        ) VALUES (
          ${claimId}, ${input.claim.claimType}, ${input.claim.subjectType}, ${input.claim.subjectId},
          ${input.claim.subjectLabel || null}, ${input.claim.subjectLabelAr || null},
          ${input.claim.predicate}, ${input.claim.objectValue || null}, ${input.claim.objectText || null},
          ${input.claim.objectUnit || null}, ${input.claim.objectFrequency || null}, ${input.claim.objectBaseYear || null},
          ${input.claim.geography || null}, ${input.claim.regimeTag},
          ${input.claim.timeStart || null}, ${input.claim.timeEnd || null}, ${input.claim.asOfDate || null},
          ${input.claim.computationLineage ? JSON.stringify(input.claim.computationLineage) : null},
          ${input.claim.confidenceGrade}, ${input.claim.confidenceRationale || null},
          ${input.claim.visibility}, ${input.claim.createdBy}, ${ctx.user.id}
        )
      `);
      
      // Insert evidence links
      if (input.evidenceLinks && input.evidenceLinks.length > 0) {
        for (const link of input.evidenceLinks) {
          await (await getDbInstance()).execute(sql`
            INSERT INTO claim_evidence_links (claimId, evidenceType, evidenceId, isPrimary, relevanceScore)
            VALUES (${claimId}, ${link.evidenceType}, ${link.evidenceId}, ${link.isPrimary}, ${link.relevanceScore || null})
          `);
        }
      }
      
      return { claimId, success: true };
    }),

  /**
   * Update an existing claim
   */
  updateClaim: protectedProcedure
    .input(z.object({
      claimId: z.string(),
      updates: claimSchema.partial()
    }))
    .mutation(async ({ input, ctx }) => {
      const updates = input.updates;
      const setClauses: string[] = [];
      
      if (updates.objectValue !== undefined) {
        setClauses.push(`objectValue = ${updates.objectValue}`);
      }
      if (updates.objectText !== undefined) {
        setClauses.push(`objectText = '${updates.objectText}'`);
      }
      if (updates.confidenceGrade !== undefined) {
        setClauses.push(`confidenceGrade = '${updates.confidenceGrade}'`);
      }
      if (updates.confidenceRationale !== undefined) {
        setClauses.push(`confidenceRationale = '${updates.confidenceRationale}'`);
      }
      
      if (setClauses.length > 0) {
        await (await getDbInstance()).execute(sql.raw(`
          UPDATE claims SET ${setClauses.join(', ')}, updatedAt = NOW()
          WHERE id = '${input.claimId}'
        `));
      }
      
      return { success: true };
    }),

  /**
   * Get claims for a specific page/view
   */
  getClaimSet: publicProcedure
    .input(z.object({ pageRoute: z.string() }))
    .query(async ({ input }) => {
      const [claimSet] = await (await getDbInstance()).execute(sql`
        SELECT * FROM claim_sets WHERE pageRoute = ${input.pageRoute}
        ORDER BY generatedAt DESC LIMIT 1
      `);
      
      if (!claimSet) return null;
      
      const claimIds = (claimSet as any).claimIds || [];
      if (claimIds.length === 0) return { ...claimSet, claims: [] };
      
      const claims = await (await getDbInstance()).execute(sql`
        SELECT * FROM claims WHERE id IN (${sql.join(claimIds.map((id: string) => sql`${id}`), sql`, `)})
      `);
      
      return { ...claimSet, claims };
    }),

  // ============================================================================
  // EVIDENCE GRAPH
  // ============================================================================

  /**
   * Get all evidence sources
   */
  getEvidenceSources: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      isWhitelisted: z.boolean().optional(),
      limit: z.number().default(100)
    }))
    .query(async ({ input }) => {
      let whereClause = sql`1=1`;
      
      if (input.category) {
        whereClause = sql`${whereClause} AND category = ${input.category}`;
      }
      if (input.isWhitelisted !== undefined) {
        whereClause = sql`${whereClause} AND isWhitelisted = ${input.isWhitelisted}`;
      }
      
      const sources = await (await getDbInstance()).execute(sql`
        SELECT * FROM evidence_sources
        WHERE ${whereClause}
        ORDER BY name ASC
        LIMIT ${input.limit}
      `);
      
      return sources;
    }),

  /**
   * Create an evidence source
   */
  createEvidenceSource: protectedProcedure
    .input(z.object({
      name: z.string(),
      nameAr: z.string().optional(),
      acronym: z.string().optional(),
      category: z.enum(["humanitarian", "ifi", "un_agency", "sanctions", "domestic_aden", "domestic_sanaa", "academic", "think_tank", "media", "partner", "other"]),
      trustLevel: z.enum(["high", "medium", "low", "unverified"]).default("medium"),
      baseUrl: z.string().optional(),
      apiEndpoint: z.string().optional(),
      apiType: z.enum(["rest", "graphql", "sdmx", "ckan", "manual", "none"]).optional(),
      updateFrequency: z.enum(["realtime", "daily", "weekly", "monthly", "quarterly", "annual", "irregular"]).optional()
    }))
    .mutation(async ({ input }) => {
      const [result] = await (await getDbInstance()).execute(sql`
        INSERT INTO evidence_sources (name, nameAr, acronym, category, trustLevel, baseUrl, apiEndpoint, apiType, updateFrequency)
        VALUES (${input.name}, ${input.nameAr || null}, ${input.acronym || null}, ${input.category},
                ${input.trustLevel}, ${input.baseUrl || null}, ${input.apiEndpoint || null},
                ${input.apiType || null}, ${input.updateFrequency || null})
      `);
      
      return { id: (result as any).insertId, success: true };
    }),

  /**
   * Get evidence documents with filters
   */
  getEvidenceDocuments: publicProcedure
    .input(z.object({
      sourceId: z.number().optional(),
      documentType: z.string().optional(),
      regimeTag: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0)
    }))
    .query(async ({ input }) => {
      let whereClause = sql`1=1`;
      
      if (input.sourceId) {
        whereClause = sql`${whereClause} AND sourceId = ${input.sourceId}`;
      }
      if (input.documentType) {
        whereClause = sql`${whereClause} AND documentType = ${input.documentType}`;
      }
      if (input.regimeTag) {
        whereClause = sql`${whereClause} AND regimeTag = ${input.regimeTag}`;
      }
      if (input.search) {
        whereClause = sql`${whereClause} AND (title LIKE ${`%${input.search}%`} OR titleAr LIKE ${`%${input.search}%`})`;
      }
      
      const documents = await (await getDbInstance()).execute(sql`
        SELECT ed.*, es.name as sourceName, es.acronym as sourceAcronym
        FROM evidence_documents ed
        LEFT JOIN evidence_sources es ON ed.sourceId = es.id
        WHERE ${whereClause}
        ORDER BY publicationDate DESC
        LIMIT ${input.limit} OFFSET ${input.offset}
      `);
      
      const [countResult] = await (await getDbInstance()).execute(sql`
        SELECT COUNT(*) as total FROM evidence_documents WHERE ${whereClause}
      `);
      
      return {
        documents,
        total: (countResult as any)?.total || 0
      };
    }),

  /**
   * Create an evidence document
   */
  createEvidenceDocument: protectedProcedure
    .input(z.object({
      sourceId: z.number(),
      title: z.string(),
      titleAr: z.string().optional(),
      documentType: z.enum(["report", "circular", "law", "decree", "statistical_bulletin", "press_release", "dataset_metadata", "academic_paper", "news_article", "other"]),
      publicationDate: z.date().optional(),
      retrievalDate: z.date(),
      sourceUrl: z.string().optional(),
      storageKey: z.string().optional(),
      storageUrl: z.string().optional(),
      contentHash: z.string().optional(),
      mimeType: z.string().optional(),
      fileSize: z.number().optional(),
      pageCount: z.number().optional(),
      language: z.enum(["en", "ar", "both"]).default("en"),
      regimeTag: z.enum(["aden_irg", "sanaa_defacto", "mixed", "unknown"]).optional(),
      license: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      const [result] = await (await getDbInstance()).execute(sql`
        INSERT INTO evidence_documents (
          sourceId, title, titleAr, documentType, publicationDate, retrievalDate,
          sourceUrl, storageKey, storageUrl, contentHash, mimeType, fileSize,
          pageCount, language, regimeTag, license
        ) VALUES (
          ${input.sourceId}, ${input.title}, ${input.titleAr || null}, ${input.documentType},
          ${input.publicationDate || null}, ${input.retrievalDate},
          ${input.sourceUrl || null}, ${input.storageKey || null}, ${input.storageUrl || null},
          ${input.contentHash || null}, ${input.mimeType || null}, ${input.fileSize || null},
          ${input.pageCount || null}, ${input.language}, ${input.regimeTag || null}, ${input.license || null}
        )
      `);
      
      return { id: (result as any).insertId, success: true };
    }),

  /**
   * Get evidence for a claim
   */
  getClaimEvidence: publicProcedure
    .input(z.object({ claimId: z.string() }))
    .query(async ({ input }) => {
      const links = await (await getDbInstance()).execute(sql`
        SELECT * FROM claim_evidence_links WHERE claimId = ${input.claimId}
      `);
      
      const evidence: any[] = [];
      
      for (const link of links as any[]) {
        let item = null;
        
        switch (link.evidenceType) {
          case 'document':
            [item] = await (await getDbInstance()).execute(sql`
              SELECT ed.*, es.name as sourceName
              FROM evidence_documents ed
              LEFT JOIN evidence_sources es ON ed.sourceId = es.id
              WHERE ed.id = ${link.evidenceId}
            `);
            break;
          case 'excerpt':
            [item] = await (await getDbInstance()).execute(sql`
              SELECT ee.*, ed.title as documentTitle
              FROM evidence_excerpts ee
              LEFT JOIN evidence_documents ed ON ee.documentId = ed.id
              WHERE ee.id = ${link.evidenceId}
            `);
            break;
          case 'dataset':
            [item] = await (await getDbInstance()).execute(sql`
              SELECT eds.*, es.name as sourceName
              FROM evidence_datasets eds
              LEFT JOIN evidence_sources es ON eds.sourceId = es.id
              WHERE eds.id = ${link.evidenceId}
            `);
            break;
          case 'observation':
            [item] = await (await getDbInstance()).execute(sql`
              SELECT eo.*, eds.name as datasetName
              FROM evidence_observations eo
              LEFT JOIN evidence_datasets eds ON eo.datasetId = eds.id
              WHERE eo.id = ${link.evidenceId}
            `);
            break;
        }
        
        if (item) {
          evidence.push({
            ...link,
            data: item
          });
        }
      }
      
      return evidence;
    }),

  /**
   * Link evidence to a claim
   */
  linkEvidence: protectedProcedure
    .input(z.object({
      claimId: z.string(),
      evidenceType: z.enum(["document", "excerpt", "dataset", "observation"]),
      evidenceId: z.number(),
      isPrimary: z.boolean().default(false),
      relevanceScore: z.number().optional(),
      notes: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      await (await getDbInstance()).execute(sql`
        INSERT INTO claim_evidence_links (claimId, evidenceType, evidenceId, isPrimary, relevanceScore, notes)
        VALUES (${input.claimId}, ${input.evidenceType}, ${input.evidenceId}, ${input.isPrimary}, ${input.relevanceScore || null}, ${input.notes || null})
      `);
      
      return { success: true };
    }),

  // ============================================================================
  // CONFLICTS
  // ============================================================================

  /**
   * Get conflicts with filters
   */
  getConflicts: publicProcedure
    .input(z.object({
      status: z.enum(["detected", "under_review", "resolved", "accepted"]).optional(),
      severity: z.enum(["low", "medium", "high", "critical"]).optional(),
      subjectType: z.string().optional(),
      limit: z.number().default(50)
    }))
    .query(async ({ input }) => {
      let whereClause = sql`1=1`;
      
      if (input.status) {
        whereClause = sql`${whereClause} AND status = ${input.status}`;
      }
      if (input.severity) {
        whereClause = sql`${whereClause} AND severity = ${input.severity}`;
      }
      if (input.subjectType) {
        whereClause = sql`${whereClause} AND subjectType = ${input.subjectType}`;
      }
      
      const conflicts = await (await getDbInstance()).execute(sql`
        SELECT * FROM conflicts
        WHERE ${whereClause}
        ORDER BY 
          CASE severity 
            WHEN 'critical' THEN 1 
            WHEN 'high' THEN 2 
            WHEN 'medium' THEN 3 
            ELSE 4 
          END,
          createdAt DESC
        LIMIT ${input.limit}
      `);
      
      return conflicts;
    }),

  /**
   * Create a conflict
   */
  createConflict: protectedProcedure
    .input(z.object({
      conflictType: z.enum(["value_mismatch", "date_mismatch", "source_contradiction", "methodology_difference"]),
      subjectType: z.string(),
      subjectId: z.string(),
      description: z.string(),
      descriptionAr: z.string().optional(),
      claimIds: z.array(z.string()),
      severity: z.enum(["low", "medium", "high", "critical"]).default("medium")
    }))
    .mutation(async ({ input }) => {
      const [result] = await (await getDbInstance()).execute(sql`
        INSERT INTO conflicts (conflictType, subjectType, subjectId, description, descriptionAr, claimIds, severity)
        VALUES (${input.conflictType}, ${input.subjectType}, ${input.subjectId}, ${input.description},
                ${input.descriptionAr || null}, ${JSON.stringify(input.claimIds)}, ${input.severity})
      `);
      
      // Update claim conflict status
      for (const claimId of input.claimIds) {
        await (await getDbInstance()).execute(sql`
          UPDATE claims SET conflictStatus = 'disputed' WHERE id = ${claimId}
        `);
      }
      
      return { id: (result as any).insertId, success: true };
    }),

  /**
   * Resolve a conflict
   */
  resolveConflict: protectedProcedure
    .input(z.object({
      conflictId: z.number(),
      resolution: z.string(),
      resolvedClaimId: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      await (await getDbInstance()).execute(sql`
        UPDATE conflicts 
        SET status = 'resolved', resolution = ${input.resolution}, 
            resolvedClaimId = ${input.resolvedClaimId || null},
            resolvedByUserId = ${ctx.user.id}, resolvedAt = NOW()
        WHERE id = ${input.conflictId}
      `);
      
      // Update claim conflict status
      if (input.resolvedClaimId) {
        await (await getDbInstance()).execute(sql`
          UPDATE claims SET conflictStatus = 'resolved' WHERE id = ${input.resolvedClaimId}
        `);
      }
      
      return { success: true };
    }),

  // ============================================================================
  // CONFIDENCE SCORING
  // ============================================================================

  /**
   * Get confidence score for a claim
   */
  getConfidenceScore: publicProcedure
    .input(z.object({ claimId: z.string() }))
    .query(async ({ input }) => {
      const [score] = await (await getDbInstance()).execute(sql`
        SELECT * FROM claim_confidence_scores WHERE claimId = ${input.claimId}
        ORDER BY createdAt DESC LIMIT 1
      `);
      
      return score || null;
    }),

  /**
   * Compute confidence score for a claim
   */
  computeConfidence: protectedProcedure
    .input(z.object({
      claimId: z.string(),
      sourceReliability: z.number().min(0).max(1),
      dataRecency: z.number().min(0).max(1),
      methodologyClarity: z.number().min(0).max(1),
      corroborationLevel: z.number().min(0).max(1),
      computationMethod: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      // Calculate overall score (weighted average)
      const weights = {
        sourceReliability: 0.35,
        dataRecency: 0.25,
        methodologyClarity: 0.20,
        corroborationLevel: 0.20
      };
      
      const overallScore = 
        input.sourceReliability * weights.sourceReliability +
        input.dataRecency * weights.dataRecency +
        input.methodologyClarity * weights.methodologyClarity +
        input.corroborationLevel * weights.corroborationLevel;
      
      // Determine grade
      let grade: 'A' | 'B' | 'C' | 'D';
      if (overallScore >= 0.85) grade = 'A';
      else if (overallScore >= 0.70) grade = 'B';
      else if (overallScore >= 0.50) grade = 'C';
      else grade = 'D';
      
      // Insert score
      await (await getDbInstance()).execute(sql`
        INSERT INTO claim_confidence_scores (
          claimId, sourceReliability, dataRecency, methodologyClarity, corroborationLevel,
          overallScore, grade, computationMethod
        ) VALUES (
          ${input.claimId}, ${input.sourceReliability}, ${input.dataRecency},
          ${input.methodologyClarity}, ${input.corroborationLevel},
          ${overallScore}, ${grade}, ${input.computationMethod || 'weighted_average'}
        )
      `);
      
      // Update claim confidence grade
      await (await getDbInstance()).execute(sql`
        UPDATE claims SET confidenceGrade = ${grade} WHERE id = ${input.claimId}
      `);
      
      return { overallScore, grade, success: true };
    }),

  // ============================================================================
  // ENTITIES & REGULATIONS
  // ============================================================================

  /**
   * Get entities with filters
   */
  getEntities: publicProcedure
    .input(z.object({
      entityType: z.string().optional(),
      regimeTag: z.string().optional(),
      status: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().default(100)
    }))
    .query(async ({ input }) => {
      let whereClause = sql`1=1`;
      
      if (input.entityType) {
        whereClause = sql`${whereClause} AND entityType = ${input.entityType}`;
      }
      if (input.regimeTag) {
        whereClause = sql`${whereClause} AND regimeTag = ${input.regimeTag}`;
      }
      if (input.status) {
        whereClause = sql`${whereClause} AND status = ${input.status}`;
      }
      if (input.search) {
        whereClause = sql`${whereClause} AND (name LIKE ${`%${input.search}%`} OR nameAr LIKE ${`%${input.search}%`} OR acronym LIKE ${`%${input.search}%`})`;
      }
      
      const entities = await (await getDbInstance()).execute(sql`
        SELECT * FROM entities
        WHERE ${whereClause}
        ORDER BY name ASC
        LIMIT ${input.limit}
      `);
      
      return entities;
    }),

  /**
   * Get regulations with filters
   */
  getRegulations: publicProcedure
    .input(z.object({
      regulationType: z.string().optional(),
      regimeTag: z.string().optional(),
      status: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().default(100)
    }))
    .query(async ({ input }) => {
      let whereClause = sql`1=1`;
      
      if (input.regulationType) {
        whereClause = sql`${whereClause} AND regulationType = ${input.regulationType}`;
      }
      if (input.regimeTag) {
        whereClause = sql`${whereClause} AND regimeTag = ${input.regimeTag}`;
      }
      if (input.status) {
        whereClause = sql`${whereClause} AND status = ${input.status}`;
      }
      if (input.search) {
        whereClause = sql`${whereClause} AND (title LIKE ${`%${input.search}%`} OR titleAr LIKE ${`%${input.search}%`} OR referenceNumber LIKE ${`%${input.search}%`})`;
      }
      
      const regulations = await (await getDbInstance()).execute(sql`
        SELECT r.*, e.name as issuingEntityName
        FROM regulations r
        LEFT JOIN entities e ON r.issuingEntityId = e.id
        WHERE ${whereClause}
        ORDER BY issuedDate DESC
        LIMIT ${input.limit}
      `);
      
      return regulations;
    }),

  // ============================================================================
  // STATISTICS
  // ============================================================================

  /**
   * Get Truth Layer statistics
   */
  getStats: publicProcedure.query(async () => {
    const [claimStats] = await (await getDbInstance()).execute(sql`
      SELECT 
        COUNT(*) as totalClaims,
        SUM(CASE WHEN confidenceGrade = 'A' THEN 1 ELSE 0 END) as gradeA,
        SUM(CASE WHEN confidenceGrade = 'B' THEN 1 ELSE 0 END) as gradeB,
        SUM(CASE WHEN confidenceGrade = 'C' THEN 1 ELSE 0 END) as gradeC,
        SUM(CASE WHEN confidenceGrade = 'D' THEN 1 ELSE 0 END) as gradeD,
        SUM(CASE WHEN conflictStatus = 'disputed' THEN 1 ELSE 0 END) as disputed
      FROM claims
    `);
    
    const [evidenceStats] = await (await getDbInstance()).execute(sql`
      SELECT 
        (SELECT COUNT(*) FROM evidence_sources) as sources,
        (SELECT COUNT(*) FROM evidence_documents) as documents,
        (SELECT COUNT(*) FROM evidence_excerpts) as excerpts,
        (SELECT COUNT(*) FROM evidence_datasets) as datasets,
        (SELECT COUNT(*) FROM evidence_observations) as observations
    `);
    
    const [conflictStats] = await (await getDbInstance()).execute(sql`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'detected' THEN 1 ELSE 0 END) as detected,
        SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) as underReview,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
      FROM conflicts
    `);
    
    const [entityStats] = await (await getDbInstance()).execute(sql`
      SELECT COUNT(*) as total FROM entities
    `);
    
    const [regulationStats] = await (await getDbInstance()).execute(sql`
      SELECT COUNT(*) as total FROM regulations
    `);
    
    return {
      claims: claimStats,
      evidence: evidenceStats,
      conflicts: conflictStats,
      entities: (entityStats as any)?.total || 0,
      regulations: (regulationStats as any)?.total || 0
    };
  })
});

export type TruthLayerRouter = typeof truthLayerRouter;
