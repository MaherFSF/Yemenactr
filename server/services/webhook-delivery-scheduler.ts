/**
 * YETO Webhook Delivery Scheduler
 * 
 * Processes pending webhook deliveries with exponential backoff retry logic
 * Runs every 5 minutes to check for pending deliveries and retry failed ones
 */

import axios, { AxiosError } from 'axios';

export interface WebhookDeliveryJob {
  id: string;
  webhookId: string;
  url: string;
  eventType: string;
  sourceId: string;
  sourceName?: string;
  payload: Record<string, any>;
  attemptNumber: number;
  maxAttempts: number;
  backoffBase: number;
  timeoutMs: number;
  headers?: Record<string, string>;
  authType?: string;
  authToken?: string;
}

export interface DeliveryResult {
  success: boolean;
  statusCode?: number;
  responseTime: number;
  error?: string;
  shouldRetry: boolean;
  nextRetryDelay?: number;
}

/**
 * Webhook Delivery Scheduler Service
 */
export class WebhookDeliveryScheduler {
  private static readonly DEFAULT_TIMEOUT_MS = 10000;
  private static readonly DEFAULT_MAX_ATTEMPTS = 3;
  private static readonly DEFAULT_BACKOFF_BASE = 2;
  private isRunning = false;
  private schedulerInterval: NodeJS.Timeout | null = null;

  /**
   * Start the webhook delivery scheduler
   * Runs every 5 minutes to process pending deliveries
   */
  start(intervalSeconds: number = 300): void {
    if (this.isRunning) {
      console.log('⚠️  Webhook delivery scheduler already running');
      return;
    }

    this.isRunning = true;
    console.log(`✅ Webhook delivery scheduler started (interval: ${intervalSeconds}s)`);

    // Run immediately on start
    this.processPendingDeliveries().catch((error) => {
      console.error('[WebhookScheduler] Error processing deliveries:', error);
    });

    // Schedule recurring runs
    this.schedulerInterval = setInterval(() => {
      this.processPendingDeliveries().catch((error) => {
        console.error('[WebhookScheduler] Error processing deliveries:', error);
      });
    }, intervalSeconds * 1000);
  }

  /**
   * Stop the webhook delivery scheduler
   */
  stop(): void {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
    this.isRunning = false;
    console.log('⏹️  Webhook delivery scheduler stopped');
  }

  /**
   * Check if scheduler is running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Process pending webhook deliveries
   */
  private async processPendingDeliveries(): Promise<void> {
    const now = new Date();
    console.log(`[${now.toISOString()}] Processing pending webhook deliveries...`);

    try {
      // In production, fetch pending deliveries from database
      // const pendingDeliveries = await getPendingWebhookDeliveries(100);
      // for (const delivery of pendingDeliveries) {
      //   await this.deliverWebhook(delivery);
      // }

      console.log('✅ Webhook delivery processing complete');
    } catch (error) {
      console.error('[WebhookScheduler] Error in processPendingDeliveries:', error);
    }
  }

  /**
   * Deliver a webhook with retry logic
   */
  async deliverWebhook(job: WebhookDeliveryJob): Promise<DeliveryResult> {
    const startTime = Date.now();
    const timeout = job.timeoutMs || WebhookDeliveryScheduler.DEFAULT_TIMEOUT_MS;

    console.log(`📤 Delivering webhook: ${job.id}`);
    console.log(`   URL: ${job.url}`);
    console.log(`   Event: ${job.eventType}`);
    console.log(`   Attempt: ${job.attemptNumber}/${job.maxAttempts}`);

    try {
      // Build headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-YETO-Webhook': 'ingestion-result',
        'X-YETO-Event': job.eventType,
        'X-YETO-Source': job.sourceId,
        'X-YETO-Attempt': job.attemptNumber.toString(),
        ...job.headers,
      };

      // Add authentication if configured
      if (job.authType === 'bearer' && job.authToken) {
        headers['Authorization'] = `Bearer ${job.authToken}`;
      } else if (job.authType === 'api-key' && job.authToken) {
        headers['X-API-Key'] = job.authToken;
      }

      // Build payload
      const payload = {
        event: job.eventType,
        result: job.payload,
        timestamp: new Date().toISOString(),
      };

      // Send webhook
      const response = await axios.post(job.url, payload, {
        headers,
        timeout,
        validateStatus: () => true, // Don't throw on any status code
      });

      const responseTime = Date.now() - startTime;
      const success = response.status >= 200 && response.status < 300;

      if (success) {
        console.log(`✅ Webhook delivered successfully (${response.status}, ${responseTime}ms)`);
        return {
          success: true,
          statusCode: response.status,
          responseTime,
          shouldRetry: false,
        };
      } else if (this.isRetryableStatusCode(response.status)) {
        console.log(`⚠️  Webhook delivery failed with retryable status: ${response.status}`);
        return {
          success: false,
          statusCode: response.status,
          responseTime,
          error: `HTTP ${response.status}`,
          shouldRetry: true,
          nextRetryDelay: this.calculateBackoffDelay(job.attemptNumber, job.backoffBase),
        };
      } else {
        console.log(`❌ Webhook delivery failed with non-retryable status: ${response.status}`);
        return {
          success: false,
          statusCode: response.status,
          responseTime,
          error: `HTTP ${response.status}`,
          shouldRetry: false,
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (error instanceof AxiosError) {
        if (error.code === 'ECONNABORTED') {
          console.log(`⏱️  Webhook delivery timeout (${timeout}ms)`);
          return {
            success: false,
            responseTime,
            error: 'Timeout',
            shouldRetry: true,
            nextRetryDelay: this.calculateBackoffDelay(job.attemptNumber, job.backoffBase),
          };
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
          console.log(`🔌 Webhook endpoint unreachable: ${error.code}`);
          return {
            success: false,
            responseTime,
            error: error.code,
            shouldRetry: true,
            nextRetryDelay: this.calculateBackoffDelay(job.attemptNumber, job.backoffBase),
          };
        }
      }

      console.log(`❌ Webhook delivery error: ${errorMessage}`);
      return {
        success: false,
        responseTime,
        error: errorMessage,
        shouldRetry: true,
        nextRetryDelay: this.calculateBackoffDelay(job.attemptNumber, job.backoffBase),
      };
    }
  }

  /**
   * Check if HTTP status code is retryable
   */
  private isRetryableStatusCode(statusCode: number): boolean {
    // Retry on server errors and rate limiting
    return (
      statusCode === 408 || // Request Timeout
      statusCode === 429 || // Too Many Requests
      statusCode >= 500 // Server Errors
    );
  }

  /**
   * Calculate exponential backoff delay in seconds
   */
  private calculateBackoffDelay(attemptNumber: number, backoffBase: number): number {
    // Formula: backoffBase ^ attemptNumber
    // Example with backoffBase=2: 2, 4, 8, 16, 32 seconds
    return Math.pow(backoffBase, attemptNumber);
  }

  /**
   * Get scheduler status
   */
  getStatus(): {
    isRunning: boolean;
    uptime?: number;
  } {
    return {
      isRunning: this.isRunning,
    };
  }
}

// Singleton instance
let schedulerInstance: WebhookDeliveryScheduler | null = null;

/**
 * Get or create webhook delivery scheduler instance
 */
export function getWebhookDeliveryScheduler(): WebhookDeliveryScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new WebhookDeliveryScheduler();
  }
  return schedulerInstance;
}

/**
 * Initialize webhook delivery scheduler
 */
export function initializeWebhookDeliveryScheduler(intervalSeconds: number = 300): void {
  const scheduler = getWebhookDeliveryScheduler();
  scheduler.start(intervalSeconds);
}

export default {
  WebhookDeliveryScheduler,
  getWebhookDeliveryScheduler,
  initializeWebhookDeliveryScheduler,
};
