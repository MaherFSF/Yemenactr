/**
 * YETO Ingestion Result Webhooks
 * 
 * Handles callbacks when ingestion jobs complete
 * - Updates database with results
 * - Triggers alerts for failures
 * - Sends notifications to admins
 * - Logs completion status
 */

import axios from 'axios';

export interface IngestionResult {
  sourceId: string;
  sourceName: string;
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  dataPoints: number;
  latency: number;
  timestamp: Date;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface WebhookPayload {
  event: 'ingestion.completed' | 'ingestion.failed' | 'ingestion.partial';
  result: IngestionResult;
  timestamp: Date;
  retryCount?: number;
}

/**
 * Send webhook notification
 */
export async function sendWebhook(
  webhookUrl: string,
  payload: WebhookPayload
): Promise<boolean> {
  try {
    const response = await axios.post(webhookUrl, payload, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'X-YETO-Webhook': 'ingestion-result',
      },
    });

    console.log(`✅ Webhook sent to ${webhookUrl}: ${response.status}`);
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    console.error(`❌ Webhook failed for ${webhookUrl}:`, error);
    return false;
  }
}

/**
 * Handle ingestion completion
 */
export async function handleIngestionCompletion(result: IngestionResult): Promise<void> {
  console.log(`\n📊 Processing ingestion result for ${result.sourceName}...`);

  // Determine event type
  let event: WebhookPayload['event'];
  if (result.status === 'SUCCESS') {
    event = 'ingestion.completed';
  } else if (result.status === 'FAILED') {
    event = 'ingestion.failed';
  } else {
    event = 'ingestion.partial';
  }

  const payload: WebhookPayload = {
    event,
    result,
    timestamp: new Date(),
  };

  // Get configured webhooks (from environment or database)
  const webhookUrls = getConfiguredWebhooks();

  console.log(`📤 Sending webhooks to ${webhookUrls.length} endpoints...`);

  // Send webhooks in parallel
  const webhookPromises = webhookUrls.map(url => sendWebhook(url, payload));
  const results = await Promise.allSettled(webhookPromises);

  // Count successes
  const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
  console.log(`✅ ${successCount}/${webhookUrls.length} webhooks delivered`);

  // Handle failures
  if (result.status === 'FAILED') {
    await handleIngestionFailure(result);
  }

  // Update database
  await updateIngestionResult(result);
}

/**
 * Handle ingestion failure
 */
async function handleIngestionFailure(result: IngestionResult): Promise<void> {
  console.log(`\n⚠️  Ingestion failed for ${result.sourceName}`);
  console.log(`   Error: ${result.errorMessage}`);

  // Send alert notification
  try {
    await sendAlertNotification({
      title: `Ingestion Failed: ${result.sourceName}`,
      message: `Source ${result.sourceId} failed to ingest. Error: ${result.errorMessage}`,
      severity: 'HIGH',
      sourceId: result.sourceId,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to send alert notification:', error);
  }

  // Record data gap
  try {
    await recordDataGap(result.sourceId, result.timestamp);
  } catch (error) {
    console.error('Failed to record data gap:', error);
  }
}

/**
 * Send alert notification to admins
 */
async function sendAlertNotification(alert: {
  title: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  sourceId: string;
  timestamp: Date;
}): Promise<void> {
  console.log(`🚨 Alert: ${alert.title}`);
  console.log(`   Severity: ${alert.severity}`);
  console.log(`   Message: ${alert.message}`);

  // In production, this would send to:
  // - Email notifications
  // - Slack/Teams webhooks
  // - Admin dashboard alerts
  // - Database alert log
}

/**
 * Record data gap in database
 */
async function recordDataGap(sourceId: string, failureTime: Date): Promise<void> {
  console.log(`📍 Recording data gap for ${sourceId}`);

  // In production, this would:
  // - Insert into data_gaps table
  // - Set severity based on source tier
  // - Mark as OPEN status
  // - Calculate expected next data point
}

/**
 * Update ingestion result in database
 */
async function updateIngestionResult(result: IngestionResult): Promise<void> {
  console.log(`💾 Updating database with ingestion result...`);
  console.log(`   Source: ${result.sourceName}`);
  console.log(`   Status: ${result.status}`);
  console.log(`   Data Points: ${result.dataPoints}`);
  console.log(`   Latency: ${result.latency}ms`);

  // In production, this would:
  // - Update ingestion_jobs table
  // - Create data_snapshot record
  // - Update source health metrics
  // - Calculate success rate
}

/**
 * Get configured webhooks
 */
function getConfiguredWebhooks(): string[] {
  const webhookUrls: string[] = [];

  // Get from environment variables
  const envWebhooks = process.env.INGESTION_WEBHOOKS;
  if (envWebhooks) {
    webhookUrls.push(...envWebhooks.split(',').map(url => url.trim()));
  }

  // Get from database (in production)
  // webhookUrls.push(...await getWebhooksFromDatabase());

  return webhookUrls;
}

/**
 * Retry failed webhook
 */
export async function retryFailedWebhook(
  webhookUrl: string,
  payload: WebhookPayload,
  maxRetries: number = 3
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`🔄 Webhook retry attempt ${attempt}/${maxRetries} for ${webhookUrl}`);

    const success = await sendWebhook(webhookUrl, {
      ...payload,
      retryCount: attempt,
    });

    if (success) {
      return true;
    }

    // Exponential backoff
    const delay = Math.pow(2, attempt) * 1000;
    console.log(`⏳ Waiting ${delay}ms before retry...`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  console.error(`❌ Webhook failed after ${maxRetries} retries: ${webhookUrl}`);
  return false;
}

/**
 * Batch webhook processing
 */
export async function processBatchResults(results: IngestionResult[]): Promise<void> {
  console.log(`\n📦 Processing batch of ${results.length} ingestion results...\n`);

  for (const result of results) {
    try {
      await handleIngestionCompletion(result);
    } catch (error) {
      console.error(`Failed to process result for ${result.sourceId}:`, error);
    }
  }

  console.log(`\n✅ Batch processing complete\n`);
}

export default {
  sendWebhook,
  handleIngestionCompletion,
  retryFailedWebhook,
  processBatchResults,
};
