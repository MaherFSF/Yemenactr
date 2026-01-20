/**
 * YETO Ingestion Management Router
 * 
 * tRPC procedures for:
 * - Real-time ingestion status
 * - Trigger manual ingestion
 * - View ingestion history
 * - Manage data gaps
 * - Monitor connector health
 */

import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { orchestrator } from '../ingestion-orchestrator';

export const ingestionRouter = router({
  /**
   * Get current ingestion status
   */
  getStatus: publicProcedure.query(async () => {
    const stats = orchestrator.getStats();

    return {
      status: 'OPERATIONAL',
      totalSources: stats.totalSources,
      activeConnectors: stats.activeConnectors,
      successRate: stats.successRate,
      recordsIngested: stats.recordsIngested,
      dataFreshness: stats.dataFreshness,
      lastRun: stats.lastRun,
      nextRun: stats.nextRun,
      timestamp: new Date(),
    };
  }),

  /**
   * Get all ingestion schedules
   */
  getSchedules: publicProcedure
    .input(
      z.object({
        status: z.enum(['SCHEDULED', 'RUNNING', 'COMPLETED', 'FAILED']).optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      let schedules = orchestrator.getAllSchedules();

      if (input.status) {
        schedules = schedules.filter(s => s.status === input.status);
      }

      return {
        total: schedules.length,
        schedules: schedules.slice(0, input.limit),
      };
    }),

  /**
   * Get schedule for specific source
   */
  getSourceSchedule: publicProcedure
    .input(z.object({ sourceId: z.string() }))
    .query(async ({ input }) => {
      const schedule = orchestrator.getSchedule(input.sourceId);

      if (!schedule) {
        return { error: 'Source not found' };
      }

      return schedule;
    }),

  /**
   * Trigger ingestion for all sources
   */
  triggerAll: protectedProcedure
    .input(z.object({ force: z.boolean().optional() }))
    .mutation(async ({ input, ctx }) => {
      console.log(`🚀 Manual ingestion triggered by ${ctx.user?.id}`);

      const results = await orchestrator.runAllConnectors();

      const successful = results.filter(r => r.status === 'SUCCESS').length;
      const totalRecords = results.reduce((sum, r) => sum + r.recordsLoaded, 0);

      return {
        status: 'COMPLETED',
        sourcesRun: results.length,
        successful,
        failed: results.length - successful,
        totalRecords,
        results: results.slice(0, 10), // Return first 10
      };
    }),

  /**
   * Trigger ingestion for specific source
   */
  triggerSource: protectedProcedure
    .input(z.object({ sourceId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      console.log(`🚀 Manual ingestion triggered for ${input.sourceId} by ${ctx.user?.id}`);

      const connector = require('../connectors/universal-connector').registry.getConnector(input.sourceId);

      if (!connector) {
        return { error: 'Connector not found' };
      }

      const result = await connector.ingest();

      return {
        sourceId: input.sourceId,
        status: result.status,
        recordsProcessed: result.recordsProcessed,
        recordsLoaded: result.recordsLoaded,
        duration: result.duration,
        errors: result.errors,
      };
    }),

  /**
   * Get ingestion history
   */
  getHistory: publicProcedure
    .input(
      z.object({
        sourceId: z.string().optional(),
        status: z.enum(['SUCCESS', 'PARTIAL', 'FAILED']).optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      // In production, query from database
      // For now, return mock history

      const mockHistory = [
        {
          id: 'RUN-001',
          sourceId: input.sourceId || 'SRC-001',
          status: 'SUCCESS',
          startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          duration: 3600,
          recordsProcessed: 5000,
          recordsLoaded: 4950,
          errors: [],
        },
        {
          id: 'RUN-002',
          sourceId: input.sourceId || 'SRC-002',
          status: 'SUCCESS',
          startedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          duration: 2400,
          recordsProcessed: 3000,
          recordsLoaded: 2990,
          errors: [],
        },
      ];

      return {
        total: mockHistory.length,
        history: mockHistory.slice(input.offset, input.offset + input.limit),
      };
    }),

  /**
   * Get data gaps
   */
  getDataGaps: publicProcedure
    .input(
      z.object({
        severity: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
        sector: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      // In production, query from database
      // For now, return mock gaps

      const mockGaps = [
        {
          id: 'GAP-001',
          sourceId: 'SRC-023',
          indicator: 'FX_RATE',
          sector: 'CURRENCY',
          dateRange: { start: '2020-01-01', end: '2020-06-30' },
          severity: 'HIGH',
          reason: 'Source unavailable during conflict escalation',
          status: 'OPEN',
          createdAt: new Date('2024-01-15'),
        },
        {
          id: 'GAP-002',
          sourceId: 'SRC-009',
          indicator: 'GDP',
          sector: 'MACRO',
          dateRange: { start: '2014-01-01', end: '2026-12-31' },
          severity: 'MEDIUM',
          reason: 'Source discontinued after conflict',
          status: 'OPEN',
          createdAt: new Date('2024-01-10'),
        },
      ];

      let gaps = mockGaps;

      if (input.severity) {
        gaps = gaps.filter(g => g.severity === input.severity);
      }

      if (input.sector) {
        gaps = gaps.filter(g => g.sector === input.sector);
      }

      return {
        total: gaps.length,
        gaps,
      };
    }),

  /**
   * Report data gap
   */
  reportDataGap: protectedProcedure
    .input(
      z.object({
        sourceId: z.string(),
        indicator: z.string(),
        dateRange: z.object({ start: z.string(), end: z.string() }),
        reason: z.string(),
        severity: z.enum(['HIGH', 'MEDIUM', 'LOW']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      console.log(`📝 Data gap reported by ${ctx.user?.id}: ${input.indicator}`);

      // In production, save to database
      return {
        id: `GAP-${Date.now()}`,
        ...input,
        status: 'OPEN',
        createdAt: new Date(),
        createdBy: ctx.user?.id,
      };
    }),

  /**
   * Get connector health
   */
  getConnectorHealth: publicProcedure
    .input(z.object({ sourceId: z.string().optional() }))
    .query(async ({ input }) => {
      // In production, query from database
      // For now, return mock health data

      const mockHealth = [
        {
          sourceId: 'SRC-001',
          status: 'HEALTHY',
          uptime: 99.9,
          lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000),
          nextRun: new Date(Date.now() + 18 * 60 * 60 * 1000),
          successRate: 98.5,
          avgDuration: 3600,
          errors: [],
        },
        {
          sourceId: 'SRC-023',
          status: 'DEGRADED',
          uptime: 85.2,
          lastRun: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          nextRun: new Date(Date.now() + 12 * 60 * 60 * 1000),
          successRate: 75.0,
          avgDuration: 5400,
          errors: ['Connection timeout', 'Rate limit exceeded'],
        },
      ];

      if (input.sourceId) {
        return mockHealth.find(h => h.sourceId === input.sourceId) || { error: 'Source not found' };
      }

      return { connectors: mockHealth };
    }),

  /**
   * Get ingestion report
   */
  getReport: publicProcedure
    .input(
      z.object({
        period: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).default('WEEKLY'),
      })
    )
    .query(async ({ input }) => {
      const report = orchestrator.exportStatusReport();

      return {
        period: input.period,
        report,
        generatedAt: new Date(),
      };
    }),

  /**
   * Get data ingestion statistics
   */
  getStatistics: publicProcedure.query(async () => {
    const stats = orchestrator.getStats();

    return {
      overview: {
        totalSources: stats.totalSources,
        activeConnectors: stats.activeConnectors,
        successRate: stats.successRate,
        recordsIngested: stats.recordsIngested,
      },
      timing: {
        dataFreshness: stats.dataFreshness,
        lastRun: stats.lastRun,
        nextRun: stats.nextRun,
      },
      coverage: {
        timeRange: {
          start: '2010-01-01',
          end: '2026-12-31',
        },
        updateFrequency: 'Continuous (real-time to annual)',
        dataQuality: 'Evidence-first with triangulation',
      },
      storage: {
        primary: 'PostgreSQL',
        backup: 'S3 (raw snapshots)',
      },
    };
  }),
});

export type IngestionRouter = typeof ingestionRouter;
