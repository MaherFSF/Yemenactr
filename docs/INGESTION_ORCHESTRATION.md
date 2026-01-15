# YETO Ingestion Orchestration

**Generated:** January 15, 2026
**Version:** 1.0
**Status:** Active

## Overview

The YETO Ingestion Orchestration system manages the continuous flow of data from 20+ connectors into the platform. It handles scheduling, error recovery, deduplication, and quality assurance for all incoming data.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  INGESTION ORCHESTRATOR                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Scheduler  │  │   Queue     │  │   Worker    │             │
│  │   (Cron)    │──▶│  Manager    │──▶│   Pool      │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│         │                │                │                     │
│         ▼                ▼                ▼                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Job       │  │   Retry     │  │   Result    │             │
│  │   Config    │  │   Logic     │  │   Handler   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Scheduled Jobs

### Daily Scheduler

The daily scheduler runs 11 jobs at configured times:

| Job ID | Name | Schedule | Priority |
|--------|------|----------|----------|
| 1 | World Bank Sync | 6:00 AM UTC | High |
| 2 | IMF Data Sync | 6:15 AM UTC | High |
| 3 | OCHA Humanitarian | 6:30 AM UTC | High |
| 4 | WFP Food Prices | 6:45 AM UTC | High |
| 5 | FAO Agriculture | 7:00 AM UTC | Medium |
| 6 | CBY Aden Exchange | 7:15 AM UTC | High |
| 7 | News Aggregation | Every 15 min | Medium |
| 8 | Daily Market Snapshot | 7:00 AM UTC | High |
| 9 | Weekly Economic Digest | Monday 8:00 AM | Medium |
| 10 | Monthly Economic Monitor | 1st of month 9:00 AM | Medium |
| 11 | Nightly Insight Miner | 2:00 AM UTC | Low |

### Job Configuration

```typescript
interface ScheduledJob {
  id: string;
  name: string;
  cronExpression: string;
  handler: () => Promise<void>;
  retryPolicy: RetryPolicy;
  timeout: number;
  enabled: boolean;
}

const DEFAULT_JOBS: ScheduledJob[] = [
  {
    id: 'world-bank-sync',
    name: 'World Bank Data Sync',
    cronExpression: '0 6 * * *',  // 6:00 AM daily
    handler: syncWorldBankData,
    retryPolicy: { maxRetries: 3, backoff: 'exponential' },
    timeout: 300000,  // 5 minutes
    enabled: true
  },
  // ... more jobs
];
```

## News Tracker Pipeline

### Real-Time News Monitoring

The news tracker monitors multiple sources for Yemen-related news:

```typescript
interface NewsSource {
  id: string;
  name: string;
  type: 'rss' | 'api' | 'scraper';
  url: string;
  keywords: string[];
  frequency: number;  // minutes
}

const NEWS_SOURCES: NewsSource[] = [
  {
    id: 'reuters-yemen',
    name: 'Reuters Yemen',
    type: 'rss',
    url: 'https://www.reuters.com/rss/yemen',
    keywords: ['Yemen', 'Aden', 'Sanaa', 'Houthi', 'IRG'],
    frequency: 15
  },
  {
    id: 'aljazeera-yemen',
    name: 'Al Jazeera Yemen',
    type: 'rss',
    url: 'https://www.aljazeera.com/rss/yemen',
    keywords: ['Yemen', 'اليمن'],
    frequency: 15
  },
  // ... more sources
];
```

### News Processing Pipeline

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Fetch     │───▶│   Filter    │───▶│   Classify  │
│   News      │    │   Keywords  │    │   Category  │
└─────────────┘    └─────────────┘    └─────────────┘
                                            │
                                            ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Store     │◀───│   Extract   │◀───│   Dedupe    │
│   Database  │    │   Entities  │    │   Check     │
└─────────────┘    └─────────────┘    └─────────────┘
```

### News Classification

```typescript
type NewsCategory = 
  | 'economic'
  | 'banking'
  | 'humanitarian'
  | 'conflict'
  | 'political'
  | 'trade'
  | 'energy'
  | 'other';

async function classifyNews(article: NewsArticle): Promise<NewsCategory> {
  const keywords = {
    economic: ['GDP', 'inflation', 'economy', 'growth', 'recession'],
    banking: ['central bank', 'currency', 'exchange rate', 'monetary'],
    humanitarian: ['aid', 'food security', 'displacement', 'OCHA', 'WFP'],
    conflict: ['ceasefire', 'military', 'attack', 'peace talks'],
    political: ['government', 'parliament', 'election', 'minister'],
    trade: ['export', 'import', 'port', 'shipping', 'customs'],
    energy: ['oil', 'gas', 'fuel', 'electricity', 'power']
  };
  
  // Count keyword matches
  const scores = Object.entries(keywords).map(([category, words]) => ({
    category,
    score: words.filter(w => 
      article.title.toLowerCase().includes(w.toLowerCase()) ||
      article.content.toLowerCase().includes(w.toLowerCase())
    ).length
  }));
  
  // Return highest scoring category
  const best = scores.sort((a, b) => b.score - a.score)[0];
  return best.score > 0 ? best.category as NewsCategory : 'other';
}
```

## Data Validation Pipeline

### Schema Validation

All incoming data is validated against expected schemas:

```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  recordsProcessed: number;
  recordsAccepted: number;
  recordsRejected: number;
}

async function validateIncomingData(
  data: unknown[],
  schema: DataSchema
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  let accepted = 0;
  let rejected = 0;
  
  for (const record of data) {
    const result = validateRecord(record, schema);
    
    if (result.valid) {
      accepted++;
    } else {
      rejected++;
      errors.push(...result.errors);
    }
    
    warnings.push(...result.warnings);
  }
  
  return {
    valid: rejected === 0,
    errors,
    warnings,
    recordsProcessed: data.length,
    recordsAccepted: accepted,
    recordsRejected: rejected
  };
}
```

### Deduplication

```typescript
async function deduplicateRecords(
  records: DataRecord[],
  table: string
): Promise<DataRecord[]> {
  const unique: DataRecord[] = [];
  
  for (const record of records) {
    // Check for existing record with same key
    const existing = await findExisting(table, record);
    
    if (!existing) {
      unique.push(record);
    } else if (isNewer(record, existing)) {
      // Update existing record
      await updateRecord(table, existing.id, record);
    }
    // Skip if existing is newer
  }
  
  return unique;
}
```

## Error Handling & Recovery

### Retry Policy

```typescript
interface RetryPolicy {
  maxRetries: number;
  backoff: 'linear' | 'exponential';
  initialDelay: number;  // ms
  maxDelay: number;      // ms
}

const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxRetries: 3,
  backoff: 'exponential',
  initialDelay: 1000,
  maxDelay: 60000
};

async function executeWithRetry<T>(
  fn: () => Promise<T>,
  policy: RetryPolicy
): Promise<T> {
  let lastError: Error;
  let delay = policy.initialDelay;
  
  for (let attempt = 0; attempt <= policy.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < policy.maxRetries) {
        await sleep(delay);
        delay = policy.backoff === 'exponential' 
          ? Math.min(delay * 2, policy.maxDelay)
          : Math.min(delay + policy.initialDelay, policy.maxDelay);
      }
    }
  }
  
  throw lastError;
}
```

### Dead Letter Queue

Failed jobs are moved to a dead letter queue for manual review:

```typescript
interface DeadLetterEntry {
  id: string;
  jobId: string;
  jobName: string;
  error: string;
  payload: unknown;
  attempts: number;
  createdAt: Date;
  lastAttempt: Date;
}

async function moveToDeadLetter(
  job: ScheduledJob,
  error: Error,
  payload: unknown
): Promise<void> {
  await db.insert(deadLetterQueue).values({
    jobId: job.id,
    jobName: job.name,
    error: error.message,
    payload: JSON.stringify(payload),
    attempts: job.currentAttempts,
    createdAt: new Date(),
    lastAttempt: new Date()
  });
  
  // Notify admin
  await notifyAdmin({
    title: `Job Failed: ${job.name}`,
    content: `Job ${job.name} failed after ${job.currentAttempts} attempts. Error: ${error.message}`
  });
}
```

## Monitoring & Alerting

### Health Metrics

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| Job Success Rate | % of jobs completing successfully | < 95% |
| Average Latency | Time to complete jobs | > 5 minutes |
| Queue Depth | Number of pending jobs | > 100 |
| Dead Letter Count | Failed jobs awaiting review | > 10 |
| Data Freshness | Time since last successful sync | > 24 hours |

### Alert Configuration

```typescript
interface Alert {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
  channels: ('email' | 'slack' | 'webhook')[];
}

const ALERTS: Alert[] = [
  {
    id: 'job-failure-rate',
    name: 'High Job Failure Rate',
    condition: 'job_success_rate < threshold',
    threshold: 0.95,
    severity: 'warning',
    channels: ['email']
  },
  {
    id: 'connector-down',
    name: 'Connector Down',
    condition: 'connector_status == "down" && duration > threshold',
    threshold: 3600,  // 1 hour
    severity: 'critical',
    channels: ['email', 'slack']
  }
];
```

## Admin Interface

### Ingestion Dashboard

Located at `/admin` → Ingestion tab:

- **Job Status** - Current state of all scheduled jobs
- **Recent Runs** - History of job executions
- **Data Sources** - Status of all connectors
- **Dead Letter Queue** - Failed jobs requiring attention

### Manual Controls

| Action | Description |
|--------|-------------|
| Trigger Job | Manually run a scheduled job |
| Pause Job | Temporarily disable a job |
| Resume Job | Re-enable a paused job |
| Retry Failed | Retry a job from dead letter queue |
| Clear Queue | Remove all items from dead letter queue |

## Data Flow Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SOURCES                            │
├─────────────────────────────────────────────────────────────────┤
│  World Bank │ IMF │ OCHA │ WFP │ FAO │ CBY │ News │ Research   │
└──────┬──────┴──┬──┴───┬──┴──┬──┴──┬──┴──┬──┴───┬──┴──────┬─────┘
       │         │      │     │     │     │      │         │
       ▼         ▼      ▼     ▼     ▼     ▼      ▼         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CONNECTOR LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  API Clients │ Web Scrapers │ RSS Parsers │ File Importers     │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     VALIDATION LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  Schema Check │ Deduplication │ Quality Score │ Provenance     │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     STORAGE LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  time_series │ research_publications │ economic_events │ S3    │
└─────────────────────────────────────────────────────────────────┘
```

## Conclusion

The YETO Ingestion Orchestration system ensures:

1. **Reliability** - Automated scheduling with retry logic
2. **Quality** - Validation and deduplication of all data
3. **Monitoring** - Real-time health metrics and alerts
4. **Scalability** - Queue-based architecture for high throughput
5. **Recoverability** - Dead letter queue for failed jobs
