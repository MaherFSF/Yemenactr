# YETO Webhook Configuration Guide

## Overview

The YETO platform uses webhooks to notify external systems when ingestion jobs complete. This guide explains how to configure, register, and manage webhooks.

## Environment Variables

### INGESTION_WEBHOOKS

Configure webhook endpoints via the `INGESTION_WEBHOOKS` environment variable:

```bash
INGESTION_WEBHOOKS=https://example.com/webhooks/ingestion,https://backup.example.com/webhooks/ingestion
```

**Format:** Comma-separated list of webhook URLs

**Example:**
```
INGESTION_WEBHOOKS=https://api.example.com/webhooks/yeto-ingestion,https://monitoring.example.com/webhooks/data-refresh
```

## Webhook Events

The platform sends three types of webhook events:

### 1. ingestion.completed

Sent when an ingestion job completes successfully.

**Payload:**
```json
{
  "event": "ingestion.completed",
  "result": {
    "sourceId": "world-bank-api",
    "sourceName": "World Bank Open Data API",
    "status": "SUCCESS",
    "dataPoints": 15234,
    "latency": 2500,
    "timestamp": "2026-01-18T23:45:00Z",
    "metadata": {
      "period": "2024-Q4",
      "indicators": 42,
      "countries": 189
    }
  },
  "timestamp": "2026-01-18T23:45:00Z"
}
```

### 2. ingestion.failed

Sent when an ingestion job fails.

**Payload:**
```json
{
  "event": "ingestion.failed",
  "result": {
    "sourceId": "imf-api",
    "sourceName": "IMF Data API",
    "status": "FAILED",
    "dataPoints": 0,
    "latency": 5000,
    "timestamp": "2026-01-18T23:50:00Z",
    "errorMessage": "Connection timeout after 5000ms",
    "metadata": {
      "retryCount": 3,
      "lastAttempt": "2026-01-18T23:50:00Z"
    }
  },
  "timestamp": "2026-01-18T23:50:00Z"
}
```

### 3. ingestion.partial

Sent when an ingestion job completes with partial data.

**Payload:**
```json
{
  "event": "ingestion.partial",
  "result": {
    "sourceId": "un-ocha-api",
    "sourceName": "UN OCHA ReliefWeb",
    "status": "PARTIAL",
    "dataPoints": 8500,
    "latency": 3200,
    "timestamp": "2026-01-18T23:55:00Z",
    "errorMessage": "Some endpoints returned 429 (rate limit)",
    "metadata": {
      "successfulEndpoints": 8,
      "failedEndpoints": 2,
      "dataCompleteness": 0.81
    }
  },
  "timestamp": "2026-01-18T23:55:00Z"
}
```

## Webhook Management API

### Register a Webhook

**Endpoint:** `POST /api/trpc/webhooks.registerWebhook`

**Request:**
```json
{
  "url": "https://example.com/webhooks/ingestion",
  "name": "Example Webhook",
  "events": ["ingestion.completed", "ingestion.failed"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook registered successfully",
  "webhookId": "webhook-1234567890"
}
```

### List Webhooks

**Endpoint:** `GET /api/trpc/webhooks.listWebhooks`

**Response:**
```json
{
  "success": true,
  "webhooks": [
    {
      "id": "webhook-1",
      "url": "https://example.com/webhooks/ingestion",
      "name": "Example Webhook",
      "events": ["ingestion.completed", "ingestion.failed"],
      "active": true,
      "createdAt": "2026-01-18T20:00:00Z"
    }
  ]
}
```

### Test Webhook

**Endpoint:** `POST /api/trpc/webhooks.testWebhook`

**Request:**
```json
{
  "url": "https://example.com/webhooks/ingestion"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook test successful"
}
```

### Delete Webhook

**Endpoint:** `POST /api/trpc/webhooks.deleteWebhook`

**Request:**
```json
{
  "webhookId": "webhook-1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook deleted successfully"
}
```

### Retry Webhook

**Endpoint:** `POST /api/trpc/webhooks.retryWebhook`

**Request:**
```json
{
  "url": "https://example.com/webhooks/ingestion",
  "sourceId": "world-bank-api",
  "sourceName": "World Bank Open Data API",
  "status": "SUCCESS",
  "dataPoints": 15234,
  "latency": 2500
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook retry successful"
}
```

## Webhook Delivery

### Retry Logic

Failed webhook deliveries are retried with exponential backoff:

- **Attempt 1:** Immediate
- **Attempt 2:** After 2 seconds
- **Attempt 3:** After 4 seconds
- **Attempt 4:** After 8 seconds (max 3 retries by default)

### Timeout

Each webhook request has a **10-second timeout**. If the endpoint doesn't respond within this time, the delivery is considered failed and will be retried.

### Headers

All webhook requests include these headers:

```
Content-Type: application/json
X-YETO-Webhook: ingestion-result
```

## Best Practices

### 1. Idempotency

Implement idempotent webhook handlers. The same webhook may be delivered multiple times due to retries.

**Recommendation:** Use the `sourceId` + `timestamp` combination as a unique identifier.

```javascript
// Example: Check if already processed
const key = `${result.sourceId}-${result.timestamp}`;
if (await cache.has(key)) {
  return 200; // Already processed
}
await cache.set(key, true, { ttl: 3600 }); // Cache for 1 hour
// Process webhook...
```

### 2. Quick Response

Respond with HTTP 200-299 as quickly as possible. Don't perform long-running operations in the webhook handler.

```javascript
// Good: Return immediately
app.post('/webhooks/ingestion', (req, res) => {
  res.json({ success: true }); // Return immediately
  
  // Process asynchronously
  processIngestionResult(req.body).catch(console.error);
});
```

### 3. Error Handling

Log all webhook deliveries and errors for debugging:

```javascript
app.post('/webhooks/ingestion', (req, res) => {
  const { event, result } = req.body;
  
  console.log(`[Webhook] Received ${event} for ${result.sourceId}`);
  
  try {
    res.json({ success: true });
    processIngestionResult(result).catch(err => {
      console.error(`[Webhook] Error processing ${result.sourceId}:`, err);
    });
  } catch (error) {
    console.error('[Webhook] Handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 4. Validation

Validate webhook payloads before processing:

```javascript
const validateWebhookPayload = (payload) => {
  if (!payload.event || !payload.result) {
    throw new Error('Invalid webhook payload');
  }
  
  if (!['ingestion.completed', 'ingestion.failed', 'ingestion.partial'].includes(payload.event)) {
    throw new Error('Unknown event type');
  }
  
  if (!payload.result.sourceId || !payload.result.status) {
    throw new Error('Missing required fields');
  }
  
  return true;
};
```

### 5. Monitoring

Track webhook delivery metrics:

- **Success rate** - Percentage of successful deliveries
- **Average latency** - Time to deliver webhooks
- **Failure patterns** - Which sources fail most often
- **Retry counts** - How many retries are needed

## Troubleshooting

### Webhook Not Received

1. **Check URL is correct:** Test with `POST /api/trpc/webhooks.testWebhook`
2. **Check firewall:** Ensure your endpoint is accessible from the internet
3. **Check logs:** Review webhook delivery logs in the admin dashboard
4. **Check timeout:** Ensure your endpoint responds within 10 seconds

### Webhook Delivery Failures

1. **Review error message** - Check the webhook logs for specific error
2. **Test endpoint** - Use `curl` to test your endpoint manually
3. **Check authentication** - If using API keys, ensure they're correct
4. **Retry manually** - Use `POST /api/trpc/webhooks.retryWebhook` to retry

### High Latency

1. **Optimize endpoint** - Reduce processing time in your webhook handler
2. **Use async processing** - Don't block the webhook response
3. **Check network** - Measure latency to your endpoint
4. **Scale infrastructure** - Add more resources if needed

## Example Webhook Handler

### Node.js/Express

```javascript
const express = require('express');
const app = express();

app.use(express.json());

// Webhook endpoint
app.post('/webhooks/ingestion', async (req, res) => {
  const { event, result, timestamp } = req.body;
  
  // Respond immediately
  res.json({ success: true });
  
  // Process asynchronously
  try {
    console.log(`[${new Date().toISOString()}] Webhook: ${event}`);
    console.log(`Source: ${result.sourceName}`);
    console.log(`Status: ${result.status}`);
    console.log(`Data Points: ${result.dataPoints}`);
    console.log(`Latency: ${result.latency}ms`);
    
    if (result.status === 'FAILED') {
      console.error(`Error: ${result.errorMessage}`);
      // Send alert notification
      await sendAlert({
        title: `Ingestion Failed: ${result.sourceName}`,
        message: result.errorMessage,
        severity: 'HIGH'
      });
    }
    
    // Update database
    await updateIngestionStatus({
      sourceId: result.sourceId,
      status: result.status,
      dataPoints: result.dataPoints,
      latency: result.latency,
      timestamp: new Date(timestamp)
    });
    
  } catch (error) {
    console.error('[Webhook] Error:', error);
  }
});

app.listen(3000, () => {
  console.log('Webhook server listening on port 3000');
});
```

### Python/Flask

```python
from flask import Flask, request, jsonify
from datetime import datetime
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

@app.route('/webhooks/ingestion', methods=['POST'])
def handle_webhook():
    data = request.json
    event = data.get('event')
    result = data.get('result')
    
    # Respond immediately
    response = jsonify({'success': True})
    
    # Process asynchronously (in production, use Celery or similar)
    try:
        logging.info(f"[{datetime.now()}] Webhook: {event}")
        logging.info(f"Source: {result['sourceName']}")
        logging.info(f"Status: {result['status']}")
        logging.info(f"Data Points: {result['dataPoints']}")
        logging.info(f"Latency: {result['latency']}ms")
        
        if result['status'] == 'FAILED':
            logging.error(f"Error: {result.get('errorMessage')}")
            # Send alert
            send_alert({
                'title': f"Ingestion Failed: {result['sourceName']}",
                'message': result.get('errorMessage'),
                'severity': 'HIGH'
            })
        
        # Update database
        update_ingestion_status({
            'sourceId': result['sourceId'],
            'status': result['status'],
            'dataPoints': result['dataPoints'],
            'latency': result['latency'],
            'timestamp': result['timestamp']
        })
        
    except Exception as e:
        logging.error(f"[Webhook] Error: {e}")
    
    return response

if __name__ == '__main__':
    app.run(port=3000)
```

## Next Steps

1. **Set up webhook endpoint** - Create an endpoint to receive webhooks
2. **Configure environment variable** - Add `INGESTION_WEBHOOKS` with your endpoint URL
3. **Test webhook delivery** - Use the test endpoint to verify connectivity
4. **Monitor deliveries** - Check webhook logs and metrics
5. **Implement error handling** - Handle failures and retries gracefully

For more information, see the [Ingestion Webhooks Service Documentation](./INGESTION_WEBHOOKS.md).
