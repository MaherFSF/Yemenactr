/**
 * Partner Engine Router
 * API endpoints for partner data submission, validation, and moderation
 */

import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { 
  dataContracts, 
  partnerSubmissions,
  partnerOrganizations,
  moderationQueue,
  submissionValidations,
  adminAuditLog,
  governancePolicies,
  adminIncidents
} from "../../drizzle/schema";
import { eq, desc, and, sql, like } from "drizzle-orm";
import { 
  validateSubmission, 
  getDataContracts, 
  getContractById 
} from "../services/partnerValidationService";
import { 
  startModerationWorkflow,
  reviewSubmission,
  qaSignoff,
  publishSubmission,
  getModerationQueue,
  getModerationStats,
  updateEvidenceCoverage
} from "../services/partnerModerationService";

export const partnerEngineRouter = router({
  // ============================================================================
  // DATA CONTRACTS
  // ============================================================================
  
  /**
   * Get all active data contracts
   */
  getContracts: publicProcedure.query(async () => {
    return getDataContracts();
  }),

  /**
   * Get contract by ID
   */
  getContract: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getContractById(input.id);
    }),

  /**
   * Create new data contract (admin only)
   */
  createContract: protectedProcedure
    .input(z.object({
      contractId: z.string(),
      nameEn: z.string(),
      nameAr: z.string().optional(),
      datasetFamily: z.string(),
      frequency: z.enum(["daily", "weekly", "monthly", "quarterly", "annual", "irregular"]),
      geoLevel: z.enum(["national", "governorate", "district", "locality"]).optional(),
      privacyClassification: z.enum(["public", "restricted", "confidential"]),
      requiredFields: z.array(z.object({
        name: z.string(),
        type: z.enum(["string", "number", "date", "boolean", "geo"]),
        description: z.string(),
        required: z.boolean()
      })).optional(),
      requiredMetadata: z.object({
        sourceStatement: z.boolean(),
        methodDescription: z.boolean(),
        coverageWindow: z.boolean(),
        license: z.boolean(),
        contactInfo: z.boolean()
      }).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [result] = await db.insert(dataContracts).values({
        contractId: input.contractId,
        nameEn: input.nameEn,
        nameAr: input.nameAr,
        datasetFamily: input.datasetFamily,
        frequency: input.frequency,
        geoLevel: input.geoLevel,
        privacyClassification: input.privacyClassification,
        requiredFields: input.requiredFields,
        requiredMetadata: input.requiredMetadata as { sourceStatement: boolean; methodDescription: boolean; coverageWindow: boolean; license: boolean; contactInfo: boolean; } | undefined
      }).$returningId();

      // Audit log
      await db.insert(adminAuditLog).values({
        userId: ctx.user.id,
        userName: ctx.user.name,
        action: "create_contract",
        actionCategory: "data_management",
        targetType: "contract",
        targetId: String(result.id),
        targetName: input.nameEn,
        newValue: input
      });

      return { id: result.id };
    }),

  // ============================================================================
  // PARTNER SUBMISSIONS
  // ============================================================================

  /**
   * Submit data from partner
   */
  submitData: protectedProcedure
    .input(z.object({
      contractId: z.number(),
      title: z.string(),
      description: z.string().optional(),
      dataType: z.enum(["time_series", "geospatial", "document", "report"]),
      rawData: z.any().optional(),
      fileUrl: z.string().optional(),
      sourceDescription: z.string(),
      methodology: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Create submission
      const [submission] = await db.insert(partnerSubmissions).values({
        partnerId: ctx.user.id,
        title: input.title,
        description: input.description,
        dataType: input.dataType,
        rawData: input.rawData,
        fileUrl: input.fileUrl,
        sourceDescription: input.sourceDescription,
        methodology: input.methodology,
        status: "pending"
      }).$returningId();

      // Start moderation workflow
      const workflowResult = await startModerationWorkflow(submission.id, input.contractId);

      return {
        submissionId: submission.id,
        status: workflowResult.status,
        validationPassed: workflowResult.success
      };
    }),

  /**
   * Get partner's submissions
   */
  getMySubmissions: protectedProcedure
    .input(z.object({
      status: z.enum(["pending", "under_review", "approved", "rejected", "needs_revision"]).optional(),
      limit: z.number().default(20),
      offset: z.number().default(0)
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      let query = db
        .select()
        .from(partnerSubmissions)
        .where(eq(partnerSubmissions.partnerId, ctx.user.id))
        .orderBy(desc(partnerSubmissions.submittedAt))
        .limit(input.limit)
        .offset(input.offset)
        .$dynamic();

      if (input.status) {
        query = query.where(and(
          eq(partnerSubmissions.partnerId, ctx.user.id),
          eq(partnerSubmissions.status, input.status)
        ));
      }

      return query;
    }),

  /**
   * Get submission details
   */
  getSubmission: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const [submission] = await db
        .select()
        .from(partnerSubmissions)
        .where(eq(partnerSubmissions.id, input.id))
        .limit(1);

      return submission;
    }),

  // ============================================================================
  // MODERATION QUEUE (Admin)
  // ============================================================================

  /**
   * Get moderation queue
   */
  getModerationQueue: protectedProcedure
    .input(z.object({
      status: z.enum([
        "received", "validating", "failed_validation", "quarantined",
        "pending_review", "approved_restricted", "approved_public_aggregate",
        "published", "rejected"
      ]).optional(),
      limit: z.number().default(50),
      offset: z.number().default(0)
    }))
    .query(async ({ input }) => {
      return getModerationQueue({
        status: input.status,
        limit: input.limit,
        offset: input.offset
      });
    }),

  /**
   * Get moderation statistics
   */
  getModerationStats: protectedProcedure.query(async () => {
    return getModerationStats();
  }),

  /**
   * Review submission (approve/reject)
   */
  reviewSubmission: protectedProcedure
    .input(z.object({
      queueId: z.number(),
      decision: z.enum(["approve_restricted", "approve_public", "reject", "quarantine"]),
      notes: z.string().optional(),
      rejectionReason: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const statusMap: Record<string, "approved_restricted" | "approved_public_aggregate" | "rejected" | "quarantined"> = {
        approve_restricted: "approved_restricted",
        approve_public: "approved_public_aggregate",
        reject: "rejected",
        quarantine: "quarantined"
      };

      const laneMap: Record<string, "lane_a_public" | "lane_b_restricted" | "none"> = {
        approve_restricted: "lane_b_restricted",
        approve_public: "lane_a_public",
        reject: "none",
        quarantine: "none"
      };

      return reviewSubmission(
        input.queueId,
        {
          status: statusMap[input.decision],
          lane: laneMap[input.decision],
          notes: input.notes,
          rejectionReason: input.rejectionReason
        },
        ctx.user.id,
        ctx.user.name || undefined
      );
    }),

  /**
   * QA signoff for public publishing
   */
  qaSignoff: protectedProcedure
    .input(z.object({
      queueId: z.number(),
      notes: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      return qaSignoff(input.queueId, ctx.user.id, ctx.user.name || undefined, input.notes);
    }),

  /**
   * Publish approved submission
   */
  publishSubmission: protectedProcedure
    .input(z.object({ queueId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return publishSubmission(input.queueId, ctx.user.id);
    }),

  /**
   * Update evidence coverage
   */
  updateEvidenceCoverage: protectedProcedure
    .input(z.object({
      queueId: z.number(),
      coverage: z.number(),
      evidencePackId: z.number().optional()
    }))
    .mutation(async ({ input }) => {
      return updateEvidenceCoverage(input.queueId, input.coverage, input.evidencePackId);
    }),

  // ============================================================================
  // GOVERNANCE POLICIES
  // ============================================================================

  /**
   * Get all governance policies
   */
  getPolicies: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    return db.select().from(governancePolicies).where(eq(governancePolicies.isActive, true));
  }),

  /**
   * Update governance policy
   */
  updatePolicy: protectedProcedure
    .input(z.object({
      policyKey: z.string(),
      policyValue: z.any()
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get current value for audit
      const [current] = await db
        .select()
        .from(governancePolicies)
        .where(eq(governancePolicies.policyKey, input.policyKey))
        .limit(1);

      await db.update(governancePolicies)
        .set({
          policyValue: input.policyValue,
          updatedAt: new Date(),
          updatedBy: ctx.user.id
        })
        .where(eq(governancePolicies.policyKey, input.policyKey));

      // Audit log
      await db.insert(adminAuditLog).values({
        userId: ctx.user.id,
        userName: ctx.user.name,
        action: "update_policy",
        actionCategory: "configuration",
        targetType: "policy",
        targetId: input.policyKey,
        previousValue: current?.policyValue,
        newValue: input.policyValue
      });

      return { success: true };
    }),

  // ============================================================================
  // INCIDENTS
  // ============================================================================

  /**
   * Get active incidents
   */
  getIncidents: protectedProcedure
    .input(z.object({
      status: z.enum(["open", "investigating", "mitigating", "resolved", "closed"]).optional(),
      severity: z.enum(["critical", "high", "medium", "low"]).optional(),
      limit: z.number().default(20)
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      let query = db
        .select()
        .from(adminIncidents)
        .orderBy(desc(adminIncidents.detectedAt))
        .limit(input.limit)
        .$dynamic();

      if (input.status) {
        query = query.where(eq(adminIncidents.status, input.status));
      }

      if (input.severity) {
        query = query.where(eq(adminIncidents.severity, input.severity));
      }

      return query;
    }),

  /**
   * Create incident
   */
  createIncident: protectedProcedure
    .input(z.object({
      title: z.string(),
      description: z.string(),
      severity: z.enum(["critical", "high", "medium", "low"]),
      category: z.enum(["pipeline_outage", "data_anomaly", "security", "performance", "integration", "other"]).optional(),
      affectedDatasets: z.array(z.string()).optional(),
      affectedPublications: z.array(z.string()).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [result] = await db.insert(adminIncidents).values({
        ...input,
        status: "open",
        createdBy: ctx.user.id
      }).$returningId();

      return { id: result.id };
    }),

  /**
   * Update incident status
   */
  updateIncident: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["open", "investigating", "mitigating", "resolved", "closed"]),
      rootCause: z.string().optional(),
      preventionMeasures: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const updateData: Record<string, unknown> = {
        status: input.status,
        updatedAt: new Date()
      };

      if (input.status === "investigating") {
        updateData.acknowledgedAt = new Date();
      }
      if (input.status === "resolved") {
        updateData.resolvedAt = new Date();
        updateData.rootCause = input.rootCause;
        updateData.preventionMeasures = input.preventionMeasures;
      }
      if (input.status === "closed") {
        updateData.closedAt = new Date();
      }

      await db.update(adminIncidents)
        .set(updateData)
        .where(eq(adminIncidents.id, input.id));

      // Audit log
      await db.insert(adminAuditLog).values({
        userId: ctx.user.id,
        userName: ctx.user.name,
        action: "update_incident",
        actionCategory: "incident",
        targetType: "incident",
        targetId: String(input.id),
        newValue: input
      });

      return { success: true };
    }),

  // ============================================================================
  // AUDIT LOG
  // ============================================================================

  /**
   * Get audit log entries
   */
  getAuditLog: protectedProcedure
    .input(z.object({
      actionCategory: z.enum([
        "user_management", "data_management", "publication",
        "moderation", "configuration", "security", "incident", "other"
      ]).optional(),
      userId: z.number().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0)
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      let query = db
        .select()
        .from(adminAuditLog)
        .orderBy(desc(adminAuditLog.createdAt))
        .limit(input.limit)
        .offset(input.offset)
        .$dynamic();

      if (input.actionCategory) {
        query = query.where(eq(adminAuditLog.actionCategory, input.actionCategory));
      }

      if (input.userId) {
        query = query.where(eq(adminAuditLog.userId, input.userId));
      }

      return query;
    }),

  // ============================================================================
  // PARTNER ORGANIZATIONS
  // ============================================================================

  /**
   * Get partner organizations
   */
  getPartnerOrganizations: protectedProcedure
    .input(z.object({
      status: z.enum(["pending", "active", "suspended", "expired"]).optional(),
      limit: z.number().default(50)
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      let query = db
        .select()
        .from(partnerOrganizations)
        .orderBy(desc(partnerOrganizations.createdAt))
        .limit(input.limit)
        .$dynamic();

      if (input.status) {
        query = query.where(eq(partnerOrganizations.partnershipStatus, input.status));
      }

      return query;
    }),

  /**
   * Update partner organization status
   */
  updatePartnerStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "active", "suspended", "expired"]),
      notes: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(partnerOrganizations)
        .set({
          partnershipStatus: input.status,
          updatedAt: new Date()
        })
        .where(eq(partnerOrganizations.id, input.id));

      // Audit log
      await db.insert(adminAuditLog).values({
        userId: ctx.user.id,
        userName: ctx.user.name,
        action: "update_partner_status",
        actionCategory: "user_management",
        targetType: "partner_organization",
        targetId: String(input.id),
        newValue: input
      });

      return { success: true };
    }),

  // ============================================================================
  // VALIDATION
  // ============================================================================

  /**
   * Run validation on a submission
   */
  runValidation: protectedProcedure
    .input(z.object({
      submissionId: z.number(),
      contractId: z.number()
    }))
    .mutation(async ({ input }) => {
      return validateSubmission(input.submissionId, input.contractId);
    }),

  /**
   * Get validation result
   */
  getValidation: protectedProcedure
    .input(z.object({ submissionId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const [validation] = await db
        .select()
        .from(submissionValidations)
        .where(eq(submissionValidations.submissionId, input.submissionId))
        .orderBy(desc(submissionValidations.validatedAt))
        .limit(1);

      return validation;
    })
});
