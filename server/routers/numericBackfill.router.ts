/**
 * Numeric Backfill Router
 * 
 * tRPC endpoints for numeric data backfill system:
 * - Source registry management
 * - Backfill execution and monitoring
 * - Contradiction detection and resolution
 * - Data freshness SLA monitoring
 * - Coverage map integration
 */

import { z } from 'zod';
import { adminProcedure, publicProcedure, router } from '../_core/trpc';
import { numericSourceRegistry } from '../services/numericSourceRegistry';
import { NumericBackfillRunner, BatchBackfillOrchestrator } from '../services/numericBackfillRunner';
import { getAllFetchers, testFetcher } from '../services/numericDataFetchers';
import { contradictionDetector } from '../services/contradictionDetector';
import { dataFreshnessSLA } from '../services/dataFreshnessSLA';
import { getNumericSeriesCoverageStats } from '../services/coverageMap';

export const numericBackfillRouter = router({
  // =========================================================================
  // SOURCE REGISTRY
  // =========================================================================

  /**
   * Get all numeric data sources
   */
  getSources: publicProcedure
    .query(async () => {
      return numericSourceRegistry.getAllSources();
    }),

  /**
   * Get source by ID
   */
  getSource: publicProcedure
    .input(z.object({
      sourceId: z.string(),
    }))
    .query(async ({ input }) => {
      return numericSourceRegistry.getSource(input.sourceId);
    }),

  /**
   * Get all products
   */
  getProducts: publicProcedure
    .query(async () => {
      return numericSourceRegistry.getAllProducts();
    }),

  /**
   * Get product by ID
   */
  getProduct: publicProcedure
    .input(z.object({
      productId: z.string(),
    }))
    .query(async ({ input }) => {
      return numericSourceRegistry.getProduct(input.productId);
    }),

  /**
   * Get registry statistics
   */
  getRegistryStats: publicProcedure
    .query(async () => {
      return numericSourceRegistry.getStatistics();
    }),

  /**
   * Get active sources (ready for backfill)
   */
  getActiveSources: adminProcedure
    .query(async () => {
      return numericSourceRegistry.getActiveSources();
    }),

  // =========================================================================
  // BACKFILL EXECUTION
  // =========================================================================

  /**
   * Run backfill for a single product/year
   */
  backfillYear: adminProcedure
    .input(z.object({
      sourceId: z.string(),
      productId: z.string(),
      year: z.number(),
    }))
    .mutation(async ({ input }) => {
      const product = numericSourceRegistry.getProduct(input.productId);
      if (!product) {
        throw new Error(`Product ${input.productId} not found`);
      }

      const fetchers = getAllFetchers();
      const fetcher = fetchers.get(input.sourceId);
      if (!fetcher) {
        throw new Error(`No fetcher available for source ${input.sourceId}`);
      }

      const runner = new NumericBackfillRunner(fetcher);
      const result = await runner.backfillYear({
        sourceId: input.sourceId,
        product_id: input.productId,
        year: input.year,
      });

      return result;
    }),

  /**
   * Run backfill for multiple years (2026→2020)
   */
  backfillProduct: adminProcedure
    .input(z.object({
      sourceId: z.string(),
      productId: z.string(),
      startYear: z.number().optional(),
      endYear: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const product = numericSourceRegistry.getProduct(input.productId);
      if (!product) {
        throw new Error(`Product ${input.productId} not found`);
      }

      const fetchers = getAllFetchers();
      const fetcher = fetchers.get(input.sourceId);
      if (!fetcher) {
        throw new Error(`No fetcher available for source ${input.sourceId}`);
      }

      const runner = new NumericBackfillRunner(fetcher);
      const results = await runner.backfillYears(
        input.sourceId,
        input.productId,
        input.startYear || 2020,
        input.endYear || 2026
      );

      return results;
    }),

  /**
   * Run batch backfill for multiple products
   */
  batchBackfill: adminProcedure
    .input(z.object({
      productIds: z.array(z.string()),
      startYear: z.number().optional(),
      endYear: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const orchestrator = new BatchBackfillOrchestrator();
      const fetchers = getAllFetchers();

      const results = await orchestrator.runBatchBackfill(
        {
          products: input.productIds,
          startYear: input.startYear || 2020,
          endYear: input.endYear || 2026,
        },
        fetchers
      );

      const summary = orchestrator.getSummary(results);

      return {
        results: Array.from(results.entries()).map(([productId, yearResults]) => ({
          productId,
          yearResults,
        })),
        summary,
      };
    }),

  /**
   * Test fetcher connectivity
   */
  testFetcher: adminProcedure
    .input(z.object({
      sourceId: z.string(),
      productId: z.string(),
      year: z.number(),
    }))
    .mutation(async ({ input }) => {
      return await testFetcher(input.sourceId, input.productId, input.year);
    }),

  // =========================================================================
  // CONTRADICTION MANAGEMENT
  // =========================================================================

  /**
   * Get all unresolved contradictions
   */
  getUnresolvedContradictions: adminProcedure
    .query(async () => {
      return await contradictionDetector.getUnresolvedContradictions();
    }),

  /**
   * Get contradictions by indicator
   */
  getContradictionsByIndicator: adminProcedure
    .input(z.object({
      indicatorCode: z.string(),
    }))
    .query(async ({ input }) => {
      return await contradictionDetector.getContradictionsByIndicator(input.indicatorCode);
    }),

  /**
   * Get contradiction statistics
   */
  getContradictionStats: publicProcedure
    .query(async () => {
      return await contradictionDetector.getContradictionStatistics();
    }),

  /**
   * Get contradiction details
   */
  getContradictionDetails: adminProcedure
    .input(z.object({
      contradictionId: z.number(),
    }))
    .query(async ({ input }) => {
      return await contradictionDetector.getContradictionDetails(input.contradictionId);
    }),

  /**
   * Resolve contradiction
   */
  resolveContradiction: adminProcedure
    .input(z.object({
      contradictionId: z.number(),
      resolution: z.string(),
      preferredObservationId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await contradictionDetector.resolveContradiction({
        contradictionId: input.contradictionId,
        resolution: input.resolution,
        preferredObservationId: input.preferredObservationId,
        resolvedBy: ctx.user.id,
      });
      return { success: true };
    }),

  /**
   * Accept variance
   */
  acceptVariance: adminProcedure
    .input(z.object({
      contradictionId: z.number(),
      reason: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      await contradictionDetector.acceptVariance(
        input.contradictionId,
        input.reason,
        ctx.user.id
      );
      return { success: true };
    }),

  /**
   * Scan for contradictions
   */
  scanForContradictions: adminProcedure
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const startDate = input.startDate ? new Date(input.startDate) : undefined;
      const endDate = input.endDate ? new Date(input.endDate) : undefined;
      
      const detections = await contradictionDetector.scanForContradictions(startDate, endDate);
      
      return {
        detectionsCount: detections.length,
        detections: detections.slice(0, 50), // Return first 50
      };
    }),

  // =========================================================================
  // DATA FRESHNESS SLA
  // =========================================================================

  /**
   * Check freshness for all series
   */
  checkAllSeriesFreshness: adminProcedure
    .query(async () => {
      return await dataFreshnessSLA.checkAllSeries();
    }),

  /**
   * Check freshness for single series
   */
  checkSeriesFreshness: adminProcedure
    .input(z.object({
      seriesId: z.string(),
    }))
    .query(async ({ input }) => {
      return await dataFreshnessSLA.checkSeriesFreshness(input.seriesId);
    }),

  /**
   * Get critical staleness
   */
  getCriticalStaleness: adminProcedure
    .query(async () => {
      return await dataFreshnessSLA.getCriticalStaleness();
    }),

  /**
   * Get freshness alerts
   */
  getFreshnessAlerts: adminProcedure
    .query(async () => {
      return await dataFreshnessSLA.getFreshnessAlerts();
    }),

  /**
   * Get freshness summary
   */
  getFreshnessSummary: publicProcedure
    .query(async () => {
      return await dataFreshnessSLA.getSummaryStats();
    }),

  /**
   * Create GAP tickets for stale series
   */
  createGapTicketsForStaleSeries: adminProcedure
    .mutation(async ({ ctx }) => {
      const ticketsCreated = await dataFreshnessSLA.createGapTicketsForStaleSeries(ctx.user.id);
      return { ticketsCreated };
    }),

  // =========================================================================
  // COVERAGE STATS
  // =========================================================================

  /**
   * Get numeric series coverage statistics
   */
  getNumericCoverageStats: publicProcedure
    .query(async () => {
      return await getNumericSeriesCoverageStats();
    }),
});
