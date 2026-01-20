/**
 * YETO Scheduler Router
 * 
 * tRPC procedures for managing automated ingestion scheduling
 */

import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { ingestionScheduler } from '../services/ingestion-scheduler';

export const schedulerRouter = router({
  /**
   * Initialize scheduler
   */
  initialize: protectedProcedure.mutation(async () => {
    try {
      await ingestionScheduler.initialize();
      return { success: true, message: 'Scheduler initialized' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }),

  /**
   * Start scheduler
   */
  start: protectedProcedure.mutation(async () => {
    try {
      await ingestionScheduler.start();
      return { success: true, message: 'Scheduler started' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }),

  /**
   * Stop scheduler
   */
  stop: protectedProcedure.mutation(async () => {
    try {
      await ingestionScheduler.stop();
      return { success: true, message: 'Scheduler stopped' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }),

  /**
   * Get scheduler status
   */
  getStatus: publicProcedure.query(() => {
    try {
      const status = ingestionScheduler.getStatus();
      return {
        success: true,
        data: status,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }),

  /**
   * Pause a source
   */
  pauseSource: protectedProcedure
    .input(z.object({ sourceId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const success = ingestionScheduler.pauseSource(input.sourceId);
        return {
          success,
          message: success ? 'Source paused' : 'Source not found',
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  /**
   * Resume a source
   */
  resumeSource: protectedProcedure
    .input(z.object({ sourceId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const success = ingestionScheduler.resumeSource(input.sourceId);
        return {
          success,
          message: success ? 'Source resumed' : 'Failed to resume source',
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),
});

export default schedulerRouter;
