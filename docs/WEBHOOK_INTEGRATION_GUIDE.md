# YETO Webhook Integration Guide

## Overview

The YETO platform provides a comprehensive webhook system for real-time notifications of data ingestion events. This guide covers the complete implementation, testing, and deployment of webhook functionality.

## Architecture

The webhook system consists of three main components:

### 1. Database Schema (PostgreSQL)

**Tables:**
- `webhook_endpoints` - Webhook configuration storage
- `webhook_deliveries` - Delivery attempt tracking
- `webhook_event_log` - Event logging
- `webhook_audit_log` - Configuration audit trail

**Views:**
- `webhook_stats` - Delivery statistics and success rates
- `webhook_delivery_failures` - Failed delivery tracking

**Stored Procedures:**
- `retry_failed_webhooks()` - Automatic retry logic
- `cleanup_old_webhook_deliveries()` - Data retention

### 2. Webhook Delivery Scheduler

**Service:** `server/services/webhook-delivery-scheduler.ts`

**Features:**
- Processes pending webhook deliveries every 5 minutes
- Exponential backoff retry logic (2^n seconds)
- Automatic HTTP status code classification
- Bearer token and API key authentication support
- Configurable timeouts and retry limits
- Comprehensive error handling

**Delivery Statuses:**
- `SUCCESS` - Delivered successfully (HTTP 200-299)
- `FAILED` - Delivery failed (non-retryable)
- `PENDING` - Awaiting retry

**Retryable Status Codes:**
- 408 Request Timeout
- 429 Too Many Requests
- 500-599 Server Errors

### 3. Admin Management UI

**Component:** `client/src/pages/WebhookManagement.tsx`

**Features:**
- Register and manage webhook endpoints
- Test webhook connectivity
- Monitor delivery statistics
- View delivery history
- Retry failed deliveries
- Real-time status monitoring
- Bilingual interface (English/Arabic)

## Implementation Steps

### Step 1: Database Setup

Run migrations to create webhook tables:

```bash
cd /home/ubuntu/yeto-platform
pnpm db:push
```

This creates:
- `webhook_endpoints` table
- `webhook_deliveries` table
- `webhook_event_log` table
- `webhook_audit_log` table
- Statistical views
- Stored procedures
- Performance indexes

### Step 2: Initialize Scheduler

Add scheduler initialization to server startup:

```typescript
// server/_core/index.ts
import { initializeWebhookDeliveryScheduler } from '@/server/services/webhook-delivery-scheduler';

// In your server initialization code
initializeWebhookDeliveryScheduler(300); // Run every 5 minutes
```

### Step 3: Add Admin Routes

Register webhook management routes in App.tsx:

```typescript
import WebhookManagement from '@/pages/WebhookManagement';

// In your router configuration
<Route path="/admin/webhooks" component={WebhookManagement} />
```

### Step 4: Configure Environment Variables

Set webhook configuration in your environment:

```bash
# .env or environment variables
INGESTION_WEBHOOKS=https://example.com/webhooks,https://backup.example.com/webhooks
WEBHOOK_DELIVERY_INTERVAL=300  # seconds
WEBHOOK_TIMEOUT_MS=10000       # milliseconds
WEBHOOK_MAX_RETRIES=3
WEBHOOK_BACKOFF_BASE=2
```

## API Integration

### Register Webhook

**Endpoint:** `POST /api/trpc/webhooks.registerWebhook`

**Request:**
```json
{
  "url": "https://example.com/webhooks/ingestion",
  "name": "Example Webhook",
  "events": ["ingestion.completed", "ingestion.failed", "ingestion.partial"],
  "authType": "bearer",
  "authToken": "your-api-token"
}
```

**Response:**
```json
{
  "success": true,
  "webhookId": "webhook-1234567890"
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
  "responseTime": 245,
  "statusCode": 200
}
```

### List Webhooks

**Endpoint:** `GET /api/trpc/webhooks.listWebhooks`

**Response:**
```json
{
  "webhooks": [
    {
      "id": "webhook-1",
      "url": "https://example.com/webhooks",
      "name": "Example Webhook",
      "active": true,
      "events": ["ingestion.completed"],
      "createdAt": "2026-01-18T20:00:00Z"
    }
  ]
}
```

### Get Webhook Statistics

**Endpoint:** `GET /api/trpc/webhooks.getStats/:webhookId`

**Response:**
```json
{
  "id": "webhook-1",
  "url": "https://example.com/webhooks",
  "name": "Example Webhook",
  "totalDeliveries": 150,
  "successfulDeliveries": 145,
  "failedDeliveries": 5,
  "pendingDeliveries": 0,
  "avgResponseTimeMs": 250,
  "successRate": 96.67,
  "lastDeliveryAt": "2026-01-18T23:45:00Z"
}
```

### Retry Failed Delivery

**Endpoint:** `POST /api/trpc/webhooks.retryDelivery/:deliveryId`

**Response:**
```json
{
  "success": true,
  "message": "Delivery queued for retry"
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
  "message": "Webhook deleted"
}
```

## Webhook Payload Format

### Ingestion Completed Event

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

### Ingestion Failed Event

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

### Ingestion Partial Event

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

## Request Headers

All webhook requests include standard headers:

```
Content-Type: application/json
X-YETO-Webhook: ingestion-result
X-YETO-Event: ingestion.completed
X-YETO-Source: world-bank-api
X-YETO-Attempt: 1
```

**Authentication Headers (if configured):**

Bearer Token:
```
Authorization: Bearer your-api-token
```

API Key:
```
X-API-Key: your-api-key
```

## Retry Logic

The webhook delivery scheduler implements exponential backoff retry logic:

**Formula:** `delay = backoffBase ^ attemptNumber`

**Example with backoffBase=2:**
- Attempt 1: Immediate
- Attempt 2: 2 seconds
- Attempt 3: 4 seconds
- Attempt 4: 8 seconds (if maxAttempts > 3)

**Configuration:**
```typescript
{
  retryMaxAttempts: 3,      // Maximum retry attempts
  retryBackoffBase: 2,      // Exponential backoff base
  timeoutMs: 10000,         // Request timeout
}
```

## Monitoring and Debugging

### View Webhook Statistics

```sql
SELECT * FROM webhook_stats
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY total_deliveries DESC;
```

### View Failed Deliveries

```sql
SELECT * FROM webhook_delivery_failures
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### View Audit Log

```sql
SELECT * FROM webhook_audit_log
WHERE webhook_id = 'webhook-1'
ORDER BY created_at DESC;
```

### Cleanup Old Deliveries

```sql
CALL cleanup_old_webhook_deliveries(90); -- Keep 90 days of history
```

## Testing

### Unit Tests

Run webhook delivery scheduler tests:

```bash
pnpm test server/services/webhook-delivery-scheduler.test.ts
```

**Test Coverage:**
- Scheduler initialization and lifecycle
- Successful webhook delivery
- Timeout handling
- Connection error handling
- Authentication (Bearer, API Key)
- Retry logic and backoff calculation
- HTTP status code classification
- Concurrent delivery processing
- Edge cases (empty payload, large payload, special characters)

### Integration Tests

Test webhook delivery end-to-end:

```bash
# Start test webhook server
node scripts/test-webhook-server.js

# Run integration tests
pnpm test integration/webhooks.test.ts
```

### Manual Testing

Use the admin UI to test webhooks:

1. Navigate to `/admin/webhooks`
2. Click "Register New Webhook"
3. Enter webhook URL (e.g., `https://webhook.site/your-unique-id`)
4. Click "Register Webhook"
5. Click "Send Test" to test delivery
6. Monitor delivery status in "Recent Deliveries" table

## Troubleshooting

### Webhook Not Receiving Events

**Check:**
1. Webhook is registered and active
2. URL is accessible from the internet
3. Firewall allows inbound connections
4. Server is responding within 10 seconds

**Debug:**
```sql
SELECT * FROM webhook_deliveries
WHERE webhook_id = 'webhook-1'
ORDER BY created_at DESC
LIMIT 10;
```

### High Failure Rate

**Check:**
1. Endpoint response time (should be < 10s)
2. HTTP status codes (429, 5xx are retryable)
3. Network connectivity
4. Authentication credentials

**Optimize:**
- Reduce processing time in webhook handler
- Use async processing
- Scale infrastructure
- Increase timeout if needed

### Webhook Delivery Lag

**Check:**
1. Scheduler interval (default 5 minutes)
2. Database query performance
3. Network latency
4. Endpoint response time

**Optimize:**
- Reduce scheduler interval
- Add database indexes
- Use CDN for webhook delivery
- Optimize endpoint performance

## Best Practices

### 1. Idempotency

Implement idempotent webhook handlers to handle duplicate deliveries:

```typescript
const processWebhook = async (payload: WebhookPayload) => {
  const key = `${payload.result.sourceId}-${payload.timestamp}`;
  
  // Check if already processed
  if (await cache.has(key)) {
    return 200; // Already processed
  }
  
  // Process webhook
  await updateDatabase(payload);
  
  // Mark as processed
  await cache.set(key, true, { ttl: 3600 });
  
  return 200;
};
```

### 2. Quick Response

Always respond quickly to webhook requests:

```typescript
app.post('/webhooks/ingestion', (req, res) => {
  // Respond immediately
  res.json({ success: true });
  
  // Process asynchronously
  processWebhook(req.body).catch(console.error);
});
```

### 3. Error Handling

Log all webhook errors for debugging:

```typescript
app.post('/webhooks/ingestion', (req, res) => {
  try {
    res.json({ success: true });
    processWebhook(req.body).catch(err => {
      logger.error('Webhook processing error:', err);
      alerting.send({
        title: 'Webhook Processing Failed',
        message: err.message,
      });
    });
  } catch (error) {
    logger.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 4. Monitoring

Track webhook metrics:

```typescript
const metrics = {
  totalDeliveries: 0,
  successfulDeliveries: 0,
  failedDeliveries: 0,
  averageResponseTime: 0,
  successRate: 0,
};

app.post('/webhooks/ingestion', (req, res) => {
  const startTime = Date.now();
  
  res.json({ success: true });
  
  processWebhook(req.body)
    .then(() => {
      metrics.successfulDeliveries++;
    })
    .catch(() => {
      metrics.failedDeliveries++;
    })
    .finally(() => {
      metrics.totalDeliveries++;
      metrics.averageResponseTime = Date.now() - startTime;
      metrics.successRate = (metrics.successfulDeliveries / metrics.totalDeliveries) * 100;
    });
});
```

## Production Deployment

### Pre-Deployment Checklist

- [ ] Database migrations applied (`pnpm db:push`)
- [ ] Webhook scheduler initialized in server startup
- [ ] Admin routes registered in App.tsx
- [ ] Environment variables configured
- [ ] Webhook endpoints tested and verified
- [ ] Monitoring and alerting configured
- [ ] Error handling implemented
- [ ] Rate limiting configured
- [ ] Backup and recovery procedures documented
- [ ] Audit logging enabled

### Deployment Steps

1. **Backup database**
   ```bash
   pg_dump yeto > yeto-backup-$(date +%Y%m%d).sql
   ```

2. **Apply migrations**
   ```bash
   pnpm db:push
   ```

3. **Update server code**
   ```bash
   git pull origin main
   pnpm install
   ```

4. **Initialize scheduler**
   - Restart application server
   - Verify scheduler is running

5. **Test webhooks**
   - Register test webhook
   - Send test event
   - Verify delivery

6. **Monitor**
   - Watch error logs
   - Monitor delivery statistics
   - Check webhook health

## Performance Optimization

### Database Indexes

The schema includes optimized indexes for common queries:

```sql
-- Webhook lookup by ID
CREATE INDEX idx_webhook_endpoints_active ON webhook_endpoints(active);

-- Delivery lookup by webhook and status
CREATE INDEX idx_webhook_deliveries_webhook_status ON webhook_deliveries(webhook_id, status);

-- Pending delivery lookup
CREATE INDEX idx_webhook_deliveries_next_retry_at ON webhook_deliveries(next_retry_at);
```

### Query Optimization

Retrieve pending deliveries efficiently:

```sql
SELECT * FROM webhook_deliveries
WHERE status = 'PENDING'
AND (next_retry_at IS NULL OR next_retry_at <= NOW())
ORDER BY created_at ASC
LIMIT 100;
```

### Caching

Cache webhook configurations in memory:

```typescript
const webhookCache = new Map<string, WebhookEndpoint>();

// Load on startup
const webhooks = await listWebhookEndpoints();
webhooks.forEach(w => webhookCache.set(w.id, w));

// Invalidate on update
function invalidateWebhookCache(webhookId: string) {
  webhookCache.delete(webhookId);
}
```

## References

- [Webhook Best Practices](https://webhook.guide/)
- [HTTP Status Codes](https://httpwg.org/specs/rfc7231.html#status.codes)
- [Exponential Backoff](https://en.wikipedia.org/wiki/Exponential_backoff)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
