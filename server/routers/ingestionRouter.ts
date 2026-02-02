/**
 * Ingestion Router
 * 
 * API endpoints for triggering and monitoring data ingestion.
 * Provides admin controls for the ingestion orchestrator.
 */

import { z } from 'zod';
import { router, adminProcedure, publicProcedure } from '../_core/trpc';
import { ingestionOrchestrator } from '../connectors/IngestionOrchestrator';
import { ConnectorRegistry } from '../connectors/BaseConnector';

// Import all connectors to register them
import '../connectors/WorldBankConnector';
import '../connectors/IMFConnector';
import '../connectors/UNAgenciesConnector';
import '../connectors/HumanitarianConnector';

export const ingestionRouter = router({
  /**
   * Get list of available connectors
   */
  getConnectors: publicProcedure.query(async () => {
    const connectors = ConnectorRegistry.getAll();
    const results = [];

    for (const name of Array.from(connectors.keys())) {
      const connector = ConnectorRegistry.get(name);
      if (connector) {
        results.push({
          name,
          indicators: await connector.getAvailableIndicators(),
        });
      }
    }

    return results;
  }),

  /**
   * Test all connector connections
   */
  testConnections: adminProcedure.mutation(async () => {
    return ingestionOrchestrator.testAllConnectors();
  }),

  /**
   * Run full historical ingestion (2010-present)
   */
  runFullIngestion: adminProcedure
    .input(z.object({
      startYear: z.number().min(2000).max(2030).default(2010),
      endYear: z.number().min(2000).max(2030).default(new Date().getFullYear()),
      connectors: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      // Run in background
      ingestionOrchestrator.runFullHistoricalIngestion(
        input.startYear,
        input.endYear,
        input.connectors
      ).catch(console.error);

      return { 
        message: 'Full ingestion started',
        startYear: input.startYear,
        endYear: input.endYear,
      };
    }),

  /**
   * Run ingestion for a specific year
   */
  runYearIngestion: adminProcedure
    .input(z.object({
      year: z.number().min(2000).max(2030),
      connectors: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const results = await ingestionOrchestrator.runYearIngestion(
        input.year,
        input.connectors
      );
      return results;
    }),

  /**
   * Run ingestion for a specific month
   */
  runMonthIngestion: adminProcedure
    .input(z.object({
      year: z.number().min(2000).max(2030),
      month: z.number().min(1).max(12),
      connectors: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const results = await ingestionOrchestrator.runMonthIngestion(
        input.year,
        input.month,
        input.connectors
      );
      return results;
    }),

  /**
   * Run incremental update (current month)
   */
  runIncrementalUpdate: adminProcedure
    .input(z.object({
      connectors: z.array(z.string()).optional(),
    }).optional())
    .mutation(async ({ input }) => {
      const results = await ingestionOrchestrator.runIncrementalUpdate(
        input?.connectors
      );
      return results;
    }),

  /**
   * Get current ingestion progress
   */
  getProgress: publicProcedure.query(async () => {
    return ingestionOrchestrator.getProgress();
  }),

  /**
   * Get ingestion summary
   */
  getSummary: publicProcedure.query(async () => {
    return ingestionOrchestrator.getSummary();
  }),

  /**
   * Get all jobs
   */
  getJobs: publicProcedure.query(async () => {
    return ingestionOrchestrator.getAllJobs();
  }),

  /**
   * Check if ingestion is running
   */
  isRunning: publicProcedure.query(async () => {
    return ingestionOrchestrator.isIngestionRunning();
  }),

  /**
   * Set up scheduled ingestion
   */
  setupSchedule: adminProcedure
    .input(z.object({
      connector: z.string(),
      frequency: z.enum(['hourly', 'daily', 'weekly', 'monthly']),
    }))
    .mutation(async ({ input }) => {
      ingestionOrchestrator.setupSchedule(input.connector, input.frequency);
      return { success: true };
    }),

  /**
   * Get all schedules
   */
  getSchedules: publicProcedure.query(async () => {
    return ingestionOrchestrator.getSchedules();
  }),

  /**
   * Run single connector for a year
   */
  runSingleConnector: adminProcedure
    .input(z.object({
      connector: z.string(),
      year: z.number().min(2000).max(2030),
    }))
    .mutation(async ({ input }) => {
      const connector = ConnectorRegistry.get(input.connector);
      if (!connector) {
        throw new Error(`Connector ${input.connector} not found`);
      }
      return connector.ingestYear(input.year);
    }),
});

export type IngestionRouter = typeof ingestionRouter;
