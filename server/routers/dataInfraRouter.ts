/**
 * Data Infrastructure Router
 * Exposes coverage map, backfill, and registry linter endpoints
 */

import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { runRegistryLint, formatLintReport } from '../services/registryLinter';
import { generateCoverageMap, getQuickCoverageStats } from '../services/coverageMap';
import { getAllCheckpoints } from '../services/historicalBackfill';

export const dataInfraRouter = router({
  // Get coverage map
  getCoverageMap: publicProcedure
    .input(z.object({
      sector: z.string().optional(),
      regimeTag: z.string().optional(),
      minCoverage: z.number().optional(),
      maxCoverage: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      const startDate = new Date('2010-01-01');
      const endDate = new Date();
      return generateCoverageMap(startDate, endDate, input || {});
    }),

  // Get quick coverage stats
  getQuickCoverageStats: publicProcedure.query(async () => {
    return getQuickCoverageStats();
  }),

  // Run registry linter
  runRegistryLint: protectedProcedure.mutation(async () => {
    const report = await runRegistryLint();
    return {
      ...report,
      formattedReport: formatLintReport(report),
    };
  }),

  // Get backfill checkpoints
  getBackfillCheckpoints: publicProcedure.query(async () => {
    return getAllCheckpoints();
  }),
});
