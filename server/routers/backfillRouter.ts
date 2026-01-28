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
import { runWorldBankBackfill, fetchWorldBankIndicator, YEMEN_INDICATORS } from '../services/worldBankFetcher';
import { runHDXBackfill } from '../services/hdxFetcher';
import { runReliefWebBackfill, fetchReliefWebReports } from '../services/reliefwebFetcher';

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

  /**
   * Trigger World Bank API backfill (2010-present)
   */
  triggerWorldBankBackfill: adminProcedure
    .mutation(async () => {
      console.log('[Backfill] Starting World Bank backfill...');
      const result = await runWorldBankBackfill();
      console.log('[Backfill] World Bank backfill complete:', result);
      return result;
    }),

  /**
   * Trigger HDX HAPI backfill
   */
  triggerHDXBackfill: adminProcedure
    .mutation(async () => {
      console.log('[Backfill] Starting HDX HAPI backfill...');
      const result = await runHDXBackfill();
      console.log('[Backfill] HDX HAPI backfill complete:', result);
      return result;
    }),

  /**
   * Trigger ReliefWeb API backfill (2010-present)
   */
  triggerReliefWebBackfill: adminProcedure
    .mutation(async () => {
      console.log('[Backfill] Starting ReliefWeb backfill...');
      const result = await runReliefWebBackfill();
      console.log('[Backfill] ReliefWeb backfill complete:', result);
      return result;
    }),

  /**
   * Test World Bank API connection
   */
  testWorldBankAPI: adminProcedure
    .query(async () => {
      try {
        const data = await fetchWorldBankIndicator(YEMEN_INDICATORS.GDP, 2020, 2023);
        return {
          success: true,
          dataPoints: data.length,
          sample: data.slice(0, 3),
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  /**
   * Test ReliefWeb API connection
   */
  testReliefWebAPI: adminProcedure
    .query(async () => {
      try {
        const data = await fetchReliefWebReports(5);
        return {
          success: true,
          totalReports: data.totalCount,
          sample: data.data.slice(0, 3).map(r => ({
            id: r.id,
            title: r.fields.title,
            date: r.fields.date.original,
          })),
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  /**
   * Get available World Bank indicators
   */
  getWorldBankIndicators: adminProcedure
    .query(async () => {
      return Object.entries(YEMEN_INDICATORS).map(([name, code]) => ({
        name,
        code,
        description: getIndicatorDescription(name),
      }));
    }),
});

// Helper function for indicator descriptions
function getIndicatorDescription(name: string): string {
  const descriptions: Record<string, string> = {
    GDP: 'Gross Domestic Product (current US$)',
    GDP_PER_CAPITA: 'GDP per capita (current US$)',
    INFLATION: 'Inflation, consumer prices (annual %)',
    UNEMPLOYMENT: 'Unemployment, total (% of labor force)',
    POPULATION: 'Total population',
    CURRENT_ACCOUNT: 'Current account balance (BoP, current US$)',
    EXPORTS_PCT_GDP: 'Exports of goods and services (% of GDP)',
    IMPORTS_PCT_GDP: 'Imports of goods and services (% of GDP)',
    EXTERNAL_DEBT: 'External debt stocks, total (DOD, current US$)',
    REMITTANCES: 'Personal remittances, received (current US$)',
    FDI_INFLOWS: 'Foreign direct investment, net inflows (BoP, current US$)',
    TRADE_PCT_GDP: 'Trade (% of GDP)',
    GROSS_SAVINGS: 'Gross savings (% of GDP)',
    MILITARY_EXPENDITURE: 'Military expenditure (% of GDP)',
    LIFE_EXPECTANCY: 'Life expectancy at birth, total (years)',
    INFANT_MORTALITY: 'Mortality rate, infant (per 1,000 live births)',
    POVERTY_RATIO: 'Poverty headcount ratio at $2.15 a day (2017 PPP)',
  };
  return descriptions[name] || name;
}
