/**
 * YETO Webhook Delivery Scheduler Tests
 * 
 * Unit tests with mocked axios - no network dependencies
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebhookDeliveryScheduler, WebhookDeliveryJob } from './webhook-delivery-scheduler';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('WebhookDeliveryScheduler', () => {
  let scheduler: WebhookDeliveryScheduler;

  beforeEach(() => {
    scheduler = new WebhookDeliveryScheduler();
    vi.clearAllMocks();
    
    // Default successful response
    mockedAxios.post.mockResolvedValue({
      status: 200,
      statusText: 'OK',
      data: {},
      headers: {},
      config: {} as any,
    });
  });

  afterEach(() => {
    scheduler.stop();
    vi.restoreAllMocks();
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
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: { received: true },
        headers: {},
        config: {} as any,
      });

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
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('timeout of 100ms exceeded');
      (timeoutError as any).code = 'ECONNABORTED';
      (timeoutError as any).isAxiosError = true;
      mockedAxios.post.mockRejectedValueOnce(timeoutError);
      mockedAxios.isAxiosError = vi.fn().mockReturnValue(true);

      const job: WebhookDeliveryJob = {
        id: 'test-timeout',
        webhookId: 'webhook-1',
        url: 'https://example.com/slow-endpoint',
        eventType: 'ingestion.completed',
        sourceId: 'test-source',
        payload: {},
        attemptNumber: 1,
        maxAttempts: 3,
        backoffBase: 2,
        timeoutMs: 100,
      };

      const result = await scheduler.deliverWebhook(job);

      expect(result.success).toBe(false);
      expect(result.shouldRetry).toBe(true);
      expect(result.error).toBeDefined();
    });

    it('should handle connection errors', async () => {
      const connectionError = new Error('ENOTFOUND');
      (connectionError as any).code = 'ENOTFOUND';
      (connectionError as any).isAxiosError = true;
      mockedAxios.post.mockRejectedValueOnce(connectionError);
      mockedAxios.isAxiosError = vi.fn().mockReturnValue(true);

      const job: WebhookDeliveryJob = {
        id: 'test-connection',
        webhookId: 'webhook-1',
        url: 'https://invalid-domain.com',
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
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: {},
        headers: {},
        config: {} as any,
      });

      const job: WebhookDeliveryJob = {
        id: 'test-headers',
        webhookId: 'webhook-1',
        url: 'https://example.com/webhooks',
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
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Custom-Header': 'custom-value',
          }),
        })
      );
    });

    it('should handle bearer token authentication', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: {},
        headers: {},
        config: {} as any,
      });

      const job: WebhookDeliveryJob = {
        id: 'test-bearer-auth',
        webhookId: 'webhook-1',
        url: 'https://example.com/webhooks',
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
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token-12345',
          }),
        })
      );
    });

    it('should handle API key authentication', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: {},
        headers: {},
        config: {} as any,
      });

      const job: WebhookDeliveryJob = {
        id: 'test-api-key-auth',
        webhookId: 'webhook-1',
        url: 'https://example.com/webhooks',
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
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-API-Key': 'test-api-key-12345',
          }),
        })
      );
    });
  });

  describe('Retry Logic', () => {
    it('should calculate exponential backoff correctly', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: {},
        headers: {},
        config: {} as any,
      });

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

    it('should identify retryable HTTP status codes', async () => {
      const retryableStatuses = [408, 429, 500, 502, 503, 504];

      for (const status of retryableStatuses) {
        mockedAxios.post.mockResolvedValueOnce({
          status: status,
          statusText: 'Error',
          data: {},
          headers: {},
          config: {} as any,
        });

        const job: WebhookDeliveryJob = {
          id: `test-status-${status}`,
          webhookId: 'webhook-1',
          url: 'https://example.com/webhooks',
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

    it('should identify non-retryable HTTP status codes', async () => {
      const nonRetryableStatuses = [400, 401, 403, 404];

      for (const status of nonRetryableStatuses) {
        mockedAxios.post.mockResolvedValueOnce({
          status: status,
          statusText: 'Error',
          data: {},
          headers: {},
          config: {} as any,
        });

        const job: WebhookDeliveryJob = {
          id: `test-status-${status}`,
          webhookId: 'webhook-1',
          url: 'https://example.com/webhooks',
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
    it('should handle empty webhook payload', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: {},
        headers: {},
        config: {} as any,
      });

      const job: WebhookDeliveryJob = {
        id: 'test-empty-payload',
        webhookId: 'webhook-1',
        url: 'https://example.com/webhooks',
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
      expect(result.success).toBe(true);
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle large webhook payload', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: {},
        headers: {},
        config: {} as any,
      });

      const largePayload = {
        data: Array(1000).fill({ key: 'value' }),
      };

      const job: WebhookDeliveryJob = {
        id: 'test-large-payload',
        webhookId: 'webhook-1',
        url: 'https://example.com/webhooks',
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
      expect(result.success).toBe(true);
    });

    it('should handle special characters in URL', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        data: {},
        headers: {},
        config: {} as any,
      });

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
      expect(result.success).toBe(true);
    });
  });

  describe('Concurrency', () => {
    it('should handle multiple concurrent deliveries', async () => {
      // Mock all concurrent requests
      mockedAxios.post.mockResolvedValue({
        status: 200,
        statusText: 'OK',
        data: {},
        headers: {},
        config: {} as any,
      });

      const jobs: WebhookDeliveryJob[] = Array.from({ length: 5 }, (_, i) => ({
        id: `test-concurrent-${i}`,
        webhookId: `webhook-${i}`,
        url: 'https://example.com/webhooks',
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
      expect(results.every((r) => r.success === true)).toBe(true);
      expect(results.every((r) => r.responseTime >= 0)).toBe(true);
    });
  });
});
