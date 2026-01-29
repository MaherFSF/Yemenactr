/**
 * VIP Cockpit Router
 * 
 * Provides role-based decision support dashboards (RoleLens Cockpits) with:
 * - Real-time signals and change detection
 * - Driver analysis with evidence packs
 * - Policy options with tradeoffs
 * - Watchlist management
 * - Decision journal integration
 * - Auto-brief generation
 */

import { z } from "zod";
import { router, protectedProcedure, analystProcedure, adminProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getVIPRoleProfiles,
  getVIPRoleProfile,
  getCockpitData,
  generateCockpitSignals,
  addToWatchlist,
  removeFromWatchlist,
  getUserWatchlist,
  takeCockpitSnapshot,
  getCockpitSnapshots,
  assignUserToVIPRole,
  getUserVIPAssignments,
} from "../services/vipCockpitService";
import {
  createDecisionEntry,
  getUserDecisions,
  getDecisionEntry,
  updateDecisionEntry,
  recordOutcome,
  getDecisionOutcomes,
  createFollowUp,
  getDecisionFollowUps,
  updateFollowUpStatus,
  getPendingFollowUps,
  getDecisionStats,
} from "../services/decisionJournalService";
import {
  getBriefTemplates,
  getBriefTemplate,
  createBriefTemplate,
  generateBrief,
  getUserSubscriptions,
  subscribeToBrief,
  unsubscribeFromBrief,
  getUserBriefHistory,
  markBriefAsRead,
  getBriefInstance,
} from "../services/autoBriefService";

export const vipCockpitRouter = router({
  // ============================================================================
  // ROLE PROFILES
  // ============================================================================
  
  /**
   * Get all available VIP role profiles
   */
  getRoleProfiles: protectedProcedure
    .query(async () => {
      const profiles = await getVIPRoleProfiles();
      return profiles;
    }),

  /**
   * Get a specific role profile by code
   */
  getRoleProfile: protectedProcedure
    .input(z.object({ roleCode: z.string() }))
    .query(async ({ input }) => {
      const profile = await getVIPRoleProfile(input.roleCode);
      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Role profile not found: ${input.roleCode}`,
        });
      }
      return profile;
    }),

  /**
   * Get user's assigned VIP roles
   */
  getMyAssignments: protectedProcedure
    .query(async ({ ctx }) => {
      const assignments = await getUserVIPAssignments(ctx.user.id);
      return assignments;
    }),

  /**
   * Assign a user to a VIP role (admin only)
   */
  assignUserToRole: adminProcedure
    .input(z.object({
      userId: z.number(),
      roleCode: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const assignment = await assignUserToVIPRole(
        input.userId,
        input.roleCode,
        ctx.user.id
      );
      return assignment;
    }),

  // ============================================================================
  // COCKPIT DATA
  // ============================================================================

  /**
   * Get cockpit data for a specific role
   * This is the main endpoint for the RoleLens dashboard
   */
  getCockpitData: protectedProcedure
    .input(z.object({ roleCode: z.string() }))
    .query(async ({ ctx, input }) => {
      const data = await getCockpitData(input.roleCode, ctx.user.id);
      return data;
    }),

  /**
   * Refresh cockpit signals from latest indicator data
   */
  refreshSignals: analystProcedure
    .input(z.object({ roleCode: z.string() }))
    .mutation(async ({ input }) => {
      await generateCockpitSignals(input.roleCode);
      return { success: true };
    }),

  /**
   * Take a snapshot of current cockpit state
   */
  takeSnapshot: analystProcedure
    .input(z.object({ roleCode: z.string() }))
    .mutation(async ({ input }) => {
      await takeCockpitSnapshot(input.roleCode);
      return { success: true };
    }),

  /**
   * Get historical snapshots for trend analysis
   */
  getSnapshots: protectedProcedure
    .input(z.object({
      roleCode: z.string(),
      days: z.number().optional().default(30),
    }))
    .query(async ({ input }) => {
      const snapshots = await getCockpitSnapshots(input.roleCode, input.days);
      return snapshots;
    }),

  // ============================================================================
  // WATCHLIST
  // ============================================================================

  /**
   * Get user's watchlist items
   */
  getWatchlist: protectedProcedure
    .input(z.object({
      roleProfileId: z.number().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const items = await getUserWatchlist(ctx.user.id, input?.roleProfileId);
      return items;
    }),

  /**
   * Add item to watchlist
   */
  addToWatchlist: protectedProcedure
    .input(z.object({
      roleProfileId: z.number(),
      itemType: z.enum(["indicator", "entity", "event", "sector"]),
      itemCode: z.string(),
      itemName: z.string(),
      itemNameAr: z.string(),
      alertThreshold: z.number().optional(),
      alertDirection: z.enum(["above", "below", "both"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const item = await addToWatchlist(ctx.user.id, input.roleProfileId, {
        itemType: input.itemType,
        itemCode: input.itemCode,
        itemName: input.itemName,
        itemNameAr: input.itemNameAr,
        alertThreshold: input.alertThreshold,
        alertDirection: input.alertDirection,
      });
      return item;
    }),

  /**
   * Remove item from watchlist
   */
  removeFromWatchlist: protectedProcedure
    .input(z.object({ itemId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await removeFromWatchlist(ctx.user.id, input.itemId);
      return { success: true };
    }),

  // ============================================================================
  // DECISION JOURNAL
  // ============================================================================

  /**
   * Create a new decision entry
   */
  createDecision: protectedProcedure
    .input(z.object({
      roleProfileId: z.number().nullable(),
      title: z.string(),
      titleAr: z.string().optional(),
      contextSummary: z.string(),
      contextSummaryAr: z.string().optional(),
      keySignals: z.array(z.string()).optional(),
      keyDrivers: z.array(z.string()).optional(),
      decision: z.string(),
      decisionAr: z.string().optional(),
      rationale: z.string(),
      rationaleAr: z.string().optional(),
      alternativesConsidered: z.array(z.object({
        title: z.string(),
        titleAr: z.string().optional(),
        whyRejected: z.string(),
        whyRejectedAr: z.string().optional(),
      })).optional(),
      expectedOutcomes: z.array(z.object({
        outcome: z.string(),
        outcomeAr: z.string().optional(),
        metric: z.string().optional(),
        targetValue: z.number().optional(),
        timeframe: z.string().optional(),
      })).optional(),
      identifiedRisks: z.array(z.object({
        risk: z.string(),
        riskAr: z.string().optional(),
        likelihood: z.enum(["high", "medium", "low"]),
        impact: z.enum(["high", "medium", "low"]),
        mitigation: z.string().optional(),
      })).optional(),
      confidenceLevel: z.enum(["high", "medium", "low"]).optional(),
      confidenceExplanation: z.string().optional(),
      evidencePackId: z.number().optional(),
      decisionDate: z.date().optional(),
      implementationDeadline: z.date().optional(),
      reviewDate: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await createDecisionEntry(ctx.user.id, input.roleProfileId, input);
      return result;
    }),

  /**
   * Get user's decisions
   */
  getMyDecisions: protectedProcedure
    .input(z.object({
      roleProfileId: z.number().optional(),
      status: z.enum(["draft", "active", "implemented", "abandoned", "superseded"]).optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const decisions = await getUserDecisions(ctx.user.id, input);
      return decisions;
    }),

  /**
   * Get a specific decision
   */
  getDecision: protectedProcedure
    .input(z.object({ decisionId: z.number() }))
    .query(async ({ input }) => {
      const decision = await getDecisionEntry(input.decisionId);
      if (!decision) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Decision not found",
        });
      }
      return decision;
    }),

  /**
   * Update a decision
   */
  updateDecision: protectedProcedure
    .input(z.object({
      decisionId: z.number(),
      title: z.string().optional(),
      titleAr: z.string().optional(),
      contextSummary: z.string().optional(),
      contextSummaryAr: z.string().optional(),
      decision: z.string().optional(),
      decisionAr: z.string().optional(),
      rationale: z.string().optional(),
      rationaleAr: z.string().optional(),
      confidenceLevel: z.enum(["high", "medium", "low"]).optional(),
      confidenceExplanation: z.string().optional(),
      status: z.enum(["draft", "active", "implemented", "abandoned", "superseded"]).optional(),
      implementationDeadline: z.date().optional(),
      reviewDate: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { decisionId, ...data } = input;
      const result = await updateDecisionEntry(decisionId, ctx.user.id, data);
      return result;
    }),

  /**
   * Record an outcome for a decision
   */
  recordOutcome: protectedProcedure
    .input(z.object({
      decisionId: z.number(),
      expectedOutcomeIndex: z.number().optional(),
      actualOutcome: z.string(),
      actualOutcomeAr: z.string().optional(),
      actualValue: z.number().optional(),
      outcomeStatus: z.enum(["achieved", "partially_achieved", "not_achieved", "unexpected"]),
      variancePercent: z.number().optional(),
      analysisNotes: z.string().optional(),
      analysisNotesAr: z.string().optional(),
      lessonsLearned: z.string().optional(),
      lessonsLearnedAr: z.string().optional(),
      evidencePackId: z.number().optional(),
      observedAt: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { decisionId, ...data } = input;
      const result = await recordOutcome(decisionId, ctx.user.id, data);
      return result;
    }),

  /**
   * Get outcomes for a decision
   */
  getDecisionOutcomes: protectedProcedure
    .input(z.object({ decisionId: z.number() }))
    .query(async ({ input }) => {
      const outcomes = await getDecisionOutcomes(input.decisionId);
      return outcomes;
    }),

  /**
   * Create a follow-up for a decision
   */
  createFollowUp: protectedProcedure
    .input(z.object({
      decisionId: z.number(),
      followUpType: z.enum(["review", "action", "update", "escalation"]),
      title: z.string(),
      titleAr: z.string().optional(),
      description: z.string(),
      descriptionAr: z.string().optional(),
      assignedTo: z.number().optional(),
      priority: z.enum(["high", "medium", "low"]).optional(),
      dueDate: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { decisionId, ...data } = input;
      const result = await createFollowUp(decisionId, ctx.user.id, data);
      return result;
    }),

  /**
   * Get follow-ups for a decision
   */
  getDecisionFollowUps: protectedProcedure
    .input(z.object({ decisionId: z.number() }))
    .query(async ({ input }) => {
      const followUps = await getDecisionFollowUps(input.decisionId);
      return followUps;
    }),

  /**
   * Update follow-up status
   */
  updateFollowUpStatus: protectedProcedure
    .input(z.object({
      followUpId: z.number(),
      status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
      completedAt: z.date().optional(),
    }))
    .mutation(async ({ input }) => {
      const result = await updateFollowUpStatus(
        input.followUpId,
        input.status,
        input.completedAt
      );
      return result;
    }),

  /**
   * Get pending follow-ups for current user
   */
  getMyPendingFollowUps: protectedProcedure
    .query(async ({ ctx }) => {
      const followUps = await getPendingFollowUps(ctx.user.id);
      return followUps;
    }),

  /**
   * Get decision statistics
   */
  getDecisionStats: protectedProcedure
    .input(z.object({
      roleProfileId: z.number().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const stats = await getDecisionStats(ctx.user.id, input?.roleProfileId);
      return stats;
    }),

  // ============================================================================
  // AUTO-BRIEFS
  // ============================================================================

  /**
   * Get available brief templates
   */
  getBriefTemplates: protectedProcedure
    .input(z.object({
      roleProfileId: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      const templates = await getBriefTemplates(input?.roleProfileId);
      return templates;
    }),

  /**
   * Get a specific brief template
   */
  getBriefTemplate: protectedProcedure
    .input(z.object({ templateId: z.number() }))
    .query(async ({ input }) => {
      const template = await getBriefTemplate(input.templateId);
      if (!template) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Brief template not found",
        });
      }
      return template;
    }),

  /**
   * Create a new brief template (admin only)
   */
  createBriefTemplate: adminProcedure
    .input(z.object({
      templateName: z.string(),
      templateNameAr: z.string(),
      roleProfileId: z.number().optional(),
      frequency: z.enum(["daily", "weekly", "monthly", "on_demand"]).optional(),
      deliveryChannels: z.array(z.string()).optional(),
      deliveryTime: z.string().optional(),
      timezone: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const result = await createBriefTemplate(input);
      return result;
    }),

  /**
   * Generate a brief on demand
   */
  generateBrief: protectedProcedure
    .input(z.object({
      templateId: z.number(),
      roleCode: z.string(),
      periodStart: z.date().optional(),
      periodEnd: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await generateBrief(
        input.templateId,
        input.roleCode,
        ctx.user.id,
        input.periodStart,
        input.periodEnd
      );
      return result;
    }),

  /**
   * Get user's brief subscriptions
   */
  getMySubscriptions: protectedProcedure
    .query(async ({ ctx }) => {
      const subscriptions = await getUserSubscriptions(ctx.user.id);
      return subscriptions;
    }),

  /**
   * Subscribe to a brief template
   */
  subscribeToBrief: protectedProcedure
    .input(z.object({
      templateId: z.number(),
      customDeliveryTime: z.string().optional(),
      customTimezone: z.string().optional(),
      emailEnabled: z.boolean().optional(),
      dashboardEnabled: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { templateId, ...options } = input;
      const result = await subscribeToBrief(ctx.user.id, templateId, options);
      return result;
    }),

  /**
   * Unsubscribe from a brief
   */
  unsubscribeFromBrief: protectedProcedure
    .input(z.object({ subscriptionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const result = await unsubscribeFromBrief(ctx.user.id, input.subscriptionId);
      return result;
    }),

  /**
   * Get brief history
   */
  getBriefHistory: protectedProcedure
    .input(z.object({
      templateId: z.number().optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const briefs = await getUserBriefHistory(ctx.user.id, input);
      return briefs;
    }),

  /**
   * Get a specific brief instance
   */
  getBrief: protectedProcedure
    .input(z.object({ briefId: z.number() }))
    .query(async ({ input }) => {
      const brief = await getBriefInstance(input.briefId);
      if (!brief) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Brief not found",
        });
      }
      return brief;
    }),

  /**
   * Mark a brief as read
   */
  markBriefAsRead: protectedProcedure
    .input(z.object({ briefId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const result = await markBriefAsRead(input.briefId, ctx.user.id);
      return result;
    }),
});
