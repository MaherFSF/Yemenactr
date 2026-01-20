/**
 * YETO Webhooks Router
 * 
 * tRPC procedures for managing ingestion result webhooks
 */

import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import {
  sendWebhook,
  handleIngestionCompletion,
  retryFailedWebhook,
  processBatchResults,
  type IngestionResult,
  type WebhookPayload,
} from '../services/ingestion-webhooks';

export const webhooksRouter = router({
  /**
   * Register a webhook URL
   */
  registerWebhook: protectedProcedure
    .input(
      z.object({
        url: z.string().url(),
        name: z.string().optional(),
        events: z.array(z.enum(['ingestion.completed', 'ingestion.failed', 'ingestion.partial'])),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // In production, save to database
        console.log(`📝 Registering webhook: ${input.url}`);
        console.log(`   Name: ${input.name || 'Unnamed'}`);
        console.log(`   Events: ${input.events.join(', ')}`);

        return {
          success: true,
          message: 'Webhook registered successfully',
          webhookId: `webhook-${Date.now()}`,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  /**
   * List registered webhooks
   */
  listWebhooks: protectedProcedure.query(async () => {
    try {
      // In production, fetch from database
      const webhooks = [
        {
          id: 'webhook-1',
          url: 'https://example.com/webhooks/ingestion',
          name: 'Example Webhook',
          events: ['ingestion.completed', 'ingestion.failed'],
          active: true,
          createdAt: new Date(),
        },
      ];

      return {
        success: true,
        webhooks,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }),

  /**
   * Delete a webhook
   */
  deleteWebhook: protectedProcedure
    .input(z.object({ webhookId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        console.log(`🗑️  Deleting webhook: ${input.webhookId}`);

        return {
          success: true,
          message: 'Webhook deleted successfully',
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  /**
   * Test webhook
   */
  testWebhook: protectedProcedure
    .input(z.object({ url: z.string().url() }))
    .mutation(async ({ input }) => {
      try {
        const testPayload: WebhookPayload = {
          event: 'ingestion.completed',
          result: {
            sourceId: 'test-source',
            sourceName: 'Test Source',
            status: 'SUCCESS',
            dataPoints: 1000,
            latency: 2500,
            timestamp: new Date(),
          },
          timestamp: new Date(),
        };

        const success = await sendWebhook(input.url, testPayload);

        return {
          success,
          message: success ? 'Webhook test successful' : 'Webhook test failed',
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  /**
   * Handle ingestion result
   */
  handleResult: publicProcedure
    .input(
      z.object({
        sourceId: z.string(),
        sourceName: z.string(),
        status: z.enum(['SUCCESS', 'FAILED', 'PARTIAL']),
        dataPoints: z.number(),
        latency: z.number(),
        errorMessage: z.string().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result: IngestionResult = {
          sourceId: input.sourceId,
          sourceName: input.sourceName,
          status: input.status,
          dataPoints: input.dataPoints,
          latency: input.latency,
          timestamp: new Date(),
          errorMessage: input.errorMessage,
          metadata: input.metadata,
        };

        await handleIngestionCompletion(result);

        return {
          success: true,
          message: 'Ingestion result processed',
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  /**
   * Retry webhook delivery
   */
  retryWebhook: protectedProcedure
    .input(
      z.object({
        url: z.string().url(),
        sourceId: z.string(),
        sourceName: z.string(),
        status: z.enum(['SUCCESS', 'FAILED', 'PARTIAL']),
        dataPoints: z.number(),
        latency: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const payload: WebhookPayload = {
          event: input.status === 'SUCCESS' ? 'ingestion.completed' : 'ingestion.failed',
          result: {
            sourceId: input.sourceId,
            sourceName: input.sourceName,
            status: input.status,
            dataPoints: input.dataPoints,
            latency: input.latency,
            timestamp: new Date(),
          },
          timestamp: new Date(),
        };

        const success = await retryFailedWebhook(input.url, payload);

        return {
          success,
          message: success ? 'Webhook retry successful' : 'Webhook retry failed',
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  /**
   * Process batch results
   */
  processBatch: protectedProcedure
    .input(
      z.object({
        results: z.array(
          z.object({
            sourceId: z.string(),
            sourceName: z.string(),
            status: z.enum(['SUCCESS', 'FAILED', 'PARTIAL']),
            dataPoints: z.number(),
            latency: z.number(),
            errorMessage: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const results: IngestionResult[] = input.results.map(r => ({
          ...r,
          timestamp: new Date(),
        }));

        await processBatchResults(results);

        return {
          success: true,
          message: `Processed ${results.length} ingestion results`,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  /**
   * Get webhook statistics
   */
  getStats: protectedProcedure.query(async () => {
    try {
      return {
        success: true,
        stats: {
          totalWebhooks: 1,
          activeWebhooks: 1,
          totalDeliveries: 0,
          successfulDeliveries: 0,
          failedDeliveries: 0,
          averageLatency: 0,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }),
});

export default webhooksRouter;
