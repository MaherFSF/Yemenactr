/**
 * Backfill Router - tRPC endpoints for backfill orchestration
 */

import { z } from 'zod';
import { publicProcedure, router, adminProcedure } from '../_core/trpc';
import {
  analyzeSource,
  analyzeAllSources,
  createBackfillPlan,
  executeBackfillPlan,
  getBackfillRecommendations,
  type BackfillRequest,
} from '../services/backfillOrchestrator';
import { getAllCheckpoints } from '../services/historicalBackfill';
import { createAdapter } from '../services/sourceAdapters';

export const backfillRouter = router({
  /**
   * Analyze a single source to determine backfill strategy
   */
  analyzeSource: adminProcedure
    .input(z.object({
      sourceId: z.string(),
    }))
    .query(async ({ input }) => {
      return await analyzeSource(input.sourceId);
    }),

  /**
   * Analyze all active sources
   */
  analyzeAllSources: adminProcedure
    .query(async () => {
      return await analyzeAllSources();
    }),

  /**
   * Get backfill recommendations sorted by readiness
   */
  getRecommendations: adminProcedure
    .query(async () => {
      return await getBackfillRecommendations();
    }),

  /**
   * Create a backfill plan for specific indicators
   */
  createPlan: adminProcedure
    .input(z.object({
      sourceId: z.string(),
      indicatorCodes: z.array(z.string()),
      startDate: z.string().transform(s => new Date(s)),
      endDate: z.string().transform(s => new Date(s)),
      regimeTag: z.enum(['aden_irg', 'sanaa_defacto', 'mixed']).optional(),
      priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    }))
    .mutation(async ({ input, ctx }) => {
      const request: BackfillRequest = {
        ...input,
        requestedBy: ctx.user.openId,
      };
      return await createBackfillPlan(request);
    }),

  /**
   * Execute a backfill plan
   */
  executePlan: adminProcedure
    .input(z.object({
      sourceId: z.string(),
      indicatorCodes: z.array(z.string()),
      startDate: z.string().transform(s => new Date(s)),
      endDate: z.string().transform(s => new Date(s)),
      regimeTag: z.enum(['aden_irg', 'sanaa_defacto', 'mixed']).optional(),
      priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    }))
    .mutation(async ({ input, ctx }) => {
      const request: BackfillRequest = {
        ...input,
        requestedBy: ctx.user.openId,
      };

      // Create plan
      const plan = await createBackfillPlan(request);

      // Execute plan
      const checkpoints = await executeBackfillPlan(plan, request);

      return {
        plan,
        checkpoints,
        success: checkpoints.every(c => c.status === 'completed'),
      };
    }),

  /**
   * Get all backfill checkpoints
   */
  getCheckpoints: adminProcedure
    .query(async () => {
      return await getAllCheckpoints();
    }),

  /**
   * Get checkpoint details
   */
  getCheckpointDetails: adminProcedure
    .input(z.object({
      checkpointId: z.string(),
    }))
    .query(async ({ input }) => {
      const checkpoints = await getAllCheckpoints();
      return checkpoints.find(c => c.id === input.checkpointId);
    }),

  /**
   * Validate adapter for a source
   */
  validateAdapter: adminProcedure
    .input(z.object({
      sourceId: z.string(),
      indicatorCode: z.string(),
      strategy: z.string(),
    }))
    .mutation(async ({ input }) => {
      const adapter = await createAdapter(
        input.sourceId,
        input.indicatorCode,
        input.strategy
      );

      const validation = await adapter.validate();
      const metadata = adapter.getMetadata();

      return {
        validation,
        metadata,
      };
    }),

  /**
   * Test fetch a single data point
   */
  testFetch: adminProcedure
    .input(z.object({
      sourceId: z.string(),
      indicatorCode: z.string(),
      strategy: z.string(),
      date: z.string().transform(s => new Date(s)),
      regimeTag: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const adapter = await createAdapter(
        input.sourceId,
        input.indicatorCode,
        input.strategy
      );

      const dataPoint = await adapter.fetch(input.date, input.regimeTag);

      return {
        success: dataPoint !== null,
        dataPoint,
      };
    }),
});
