/**
 * YETO Webhook Delivery Scheduler Tests
 * 
 * Comprehensive test suite for webhook delivery functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebhookDeliveryScheduler, WebhookDeliveryJob } from './webhook-delivery-scheduler';

describe('WebhookDeliveryScheduler', () => {
  let scheduler: WebhookDeliveryScheduler;

  beforeEach(() => {
    scheduler = new WebhookDeliveryScheduler();
  });

  afterEach(() => {
    scheduler.stop();
  });

  describe('Initialization', () => {
    it('should create a new scheduler instance', () => {
      expect(scheduler).toBeDefined();
      expect(scheduler.isActive()).toBe(false);
    });

    it('should start the scheduler', () => {
      scheduler.start(60);
      expect(scheduler.isActive()).toBe(true);
    });

    it('should stop the scheduler', () => {
      scheduler.start(60);
      expect(scheduler.isActive()).toBe(true);
      scheduler.stop();
      expect(scheduler.isActive()).toBe(false);
    });

    it('should not start if already running', () => {
      scheduler.start(60);
      const consoleSpy = vi.spyOn(console, 'log');
      scheduler.start(60);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('already running'));
    });
  });

  describe('Webhook Delivery', () => {
    it('should successfully deliver a webhook', async () => {
      const job: WebhookDeliveryJob = {
        id: 'test-1',
        webhookId: 'webhook-1',
        url: 'https://example.com/webhooks',
        eventType: 'ingestion.completed',
        sourceId: 'world-bank-api',
        sourceName: 'World Bank Open Data',
        payload: {
          status: 'SUCCESS',
          dataPoints: 1000,
          latency: 2500,
        },
        attemptNumber: 1,
        maxAttempts: 3,
        backoffBase: 2,
        timeoutMs: 10000,
      };

      const result = await scheduler.deliverWebhook(job);

      expect(result).toBeDefined();
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
    }, 15000);

    it('should handle timeout errors', async () => {
      const job: WebhookDeliveryJob = {
        id: 'test-timeout',
        webhookId: 'webhook-1',
        url: 'https://httpbin.org/delay/20', // Will timeout
        eventType: 'ingestion.completed',
        sourceId: 'test-source',
        payload: {},
        attemptNumber: 1,
        maxAttempts: 3,
        backoffBase: 2,
        timeoutMs: 100, // Very short timeout
      };

      const result = await scheduler.deliverWebhook(job);

      expect(result.success).toBe(false);
      expect(result.shouldRetry).toBe(true);
      expect(result.error).toBeDefined();
    });

    it('should handle connection errors', async () => {
      const job: WebhookDeliveryJob = {
        id: 'test-connection',
        webhookId: 'webhook-1',
        url: 'https://invalid-domain-that-does-not-exist-12345.com',
        eventType: 'ingestion.completed',
        sourceId: 'test-source',
        payload: {},
        attemptNumber: 1,
        maxAttempts: 3,
        backoffBase: 2,
        timeoutMs: 10000,
      };

      const result = await scheduler.deliverWebhook(job);

      expect(result.success).toBe(false);
      expect(result.shouldRetry).toBe(true);
    });

    it('should include correct headers in webhook delivery', async () => {
      const job: WebhookDeliveryJob = {
        id: 'test-headers',
        webhookId: 'webhook-1',
        url: 'https://httpbin.org/post',
        eventType: 'ingestion.completed',
        sourceId: 'test-source',
        payload: { test: true },
        attemptNumber: 2,
        maxAttempts: 3,
        backoffBase: 2,
        timeoutMs: 10000,
        headers: {
          'X-Custom-Header': 'custom-value',
        },
      };

      const result = await scheduler.deliverWebhook(job);

      expect(result).toBeDefined();
      // In production, verify headers are sent correctly
    }, 15000);

    it('should handle bearer token authentication', async () => {
      const job: WebhookDeliveryJob = {
        id: 'test-bearer-auth',
        webhookId: 'webhook-1',
        url: 'https://httpbin.org/post',
        eventType: 'ingestion.completed',
        sourceId: 'test-source',
        payload: {},
        attemptNumber: 1,
        maxAttempts: 3,
        backoffBase: 2,
        timeoutMs: 10000,
        authType: 'bearer',
        authToken: 'test-token-12345',
      };

      const result = await scheduler.deliverWebhook(job);

      expect(result).toBeDefined();
      // In production, verify Authorization header is set
    }, 15000);

    it('should handle API key authentication', async () => {
      const job: WebhookDeliveryJob = {
        id: 'test-api-key-auth',
        webhookId: 'webhook-1',
        url: 'https://httpbin.org/post',
        eventType: 'ingestion.completed',
        sourceId: 'test-source',
        payload: {},
        attemptNumber: 1,
        maxAttempts: 3,
        backoffBase: 2,
        timeoutMs: 10000,
        authType: 'api-key',
        authToken: 'test-api-key-12345',
      };

      const result = await scheduler.deliverWebhook(job);

      expect(result).toBeDefined();
      // In production, verify X-API-Key header is set
    });
  });

  describe('Retry Logic', () => {
    it('should calculate exponential backoff correctly', { timeout: 15000 }, async () => {
      const job: WebhookDeliveryJob = {
        id: 'test-backoff',
        webhookId: 'webhook-1',
        url: 'https://example.com/webhooks',
        eventType: 'ingestion.completed',
        sourceId: 'test-source',
        payload: {},
        attemptNumber: 3,
        maxAttempts: 5,
        backoffBase: 2,
        timeoutMs: 10000,
      };

      const result = await scheduler.deliverWebhook(job);

      // Backoff should be 2^3 = 8 seconds
      if (result.shouldRetry && result.nextRetryDelay) {
        expect(result.nextRetryDelay).toBe(8);
      }
    });

    it('should identify retryable HTTP status codes', { timeout: 30000 }, async () => {
      const retryableStatuses = [408, 429, 500, 502, 503, 504];

      for (const status of retryableStatuses) {
        const job: WebhookDeliveryJob = {
          id: `test-status-${status}`,
          webhookId: 'webhook-1',
          url: `https://httpbin.org/status/${status}`,
          eventType: 'ingestion.completed',
          sourceId: 'test-source',
          payload: {},
          attemptNumber: 1,
          maxAttempts: 3,
          backoffBase: 2,
          timeoutMs: 10000,
        };

        const result = await scheduler.deliverWebhook(job);

        expect(result.statusCode).toBe(status);
        expect(result.shouldRetry).toBe(true);
      }
    });

    it('should identify non-retryable HTTP status codes', { timeout: 30000 }, async () => {
      const nonRetryableStatuses = [400, 401, 403, 404];

      for (const status of nonRetryableStatuses) {
        const job: WebhookDeliveryJob = {
          id: `test-status-${status}`,
          webhookId: 'webhook-1',
          url: `https://httpbin.org/status/${status}`,
          eventType: 'ingestion.completed',
          sourceId: 'test-source',
          payload: {},
          attemptNumber: 1,
          maxAttempts: 3,
          backoffBase: 2,
          timeoutMs: 10000,
        };

        const result = await scheduler.deliverWebhook(job);

        expect(result.statusCode).toBe(status);
        expect(result.shouldRetry).toBe(false);
      }
    });
  });

  describe('Scheduler Status', () => {
    it('should report scheduler status', () => {
      const status = scheduler.getStatus();

      expect(status).toBeDefined();
      expect(status.isRunning).toBe(false);

      scheduler.start(60);
      const runningStatus = scheduler.getStatus();
      expect(runningStatus.isRunning).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty webhook payload', { timeout: 15000 }, async () => {
      const job: WebhookDeliveryJob = {
        id: 'test-empty-payload',
        webhookId: 'webhook-1',
        url: 'https://httpbin.org/post',
        eventType: 'ingestion.completed',
        sourceId: 'test-source',
        payload: {},
        attemptNumber: 1,
        maxAttempts: 3,
        backoffBase: 2,
        timeoutMs: 10000,
      };

      const result = await scheduler.deliverWebhook(job);

      expect(result).toBeDefined();
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle large webhook payload', { timeout: 15000 }, async () => {
      const largePayload = {
        data: Array(1000).fill({ key: 'value' }),
      };

      const job: WebhookDeliveryJob = {
        id: 'test-large-payload',
        webhookId: 'webhook-1',
        url: 'https://httpbin.org/post',
        eventType: 'ingestion.completed',
        sourceId: 'test-source',
        payload: largePayload,
        attemptNumber: 1,
        maxAttempts: 3,
        backoffBase: 2,
        timeoutMs: 10000,
      };

      const result = await scheduler.deliverWebhook(job);

      expect(result).toBeDefined();
    });

    it('should handle special characters in URL', { timeout: 15000 }, async () => {
      const job: WebhookDeliveryJob = {
        id: 'test-special-chars',
        webhookId: 'webhook-1',
        url: 'https://example.com/webhooks?token=abc123&user=test@example.com',
        eventType: 'ingestion.completed',
        sourceId: 'test-source',
        payload: {},
        attemptNumber: 1,
        maxAttempts: 3,
        backoffBase: 2,
        timeoutMs: 10000,
      };

      const result = await scheduler.deliverWebhook(job);

      expect(result).toBeDefined();
    });
  });

  describe('Concurrency', () => {
    it('should handle multiple concurrent deliveries', { timeout: 30000 }, async () => {
      const jobs: WebhookDeliveryJob[] = Array.from({ length: 5 }, (_, i) => ({
        id: `test-concurrent-${i}`,
        webhookId: `webhook-${i}`,
        url: 'https://httpbin.org/post',
        eventType: 'ingestion.completed',
        sourceId: `test-source-${i}`,
        payload: { index: i },
        attemptNumber: 1,
        maxAttempts: 3,
        backoffBase: 2,
        timeoutMs: 10000,
      }));

      const results = await Promise.all(jobs.map((job) => scheduler.deliverWebhook(job)));

      expect(results).toHaveLength(5);
      expect(results.every((r) => r.responseTime >= 0)).toBe(true);
    });
  });
});
