# YETO Discovery Engine

**Generated:** January 15, 2026
**Version:** 1.0
**Status:** Active

## Overview

The YETO Discovery Engine is an automated system that continuously searches for, evaluates, and ingests new data sources relevant to Yemen's economy. It implements a "wide search" strategy to ensure comprehensive coverage of all available data.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     DISCOVERY ENGINE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Search    │  │  Evaluate   │  │   Ingest    │             │
│  │   Module    │──▶│   Module    │──▶│   Module    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│         │                │                │                     │
│         ▼                ▼                ▼                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Candidate  │  │  Relevance  │  │   Source    │             │
│  │    Queue    │  │   Scores    │  │  Registry   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Search Strategies

### 1. API Discovery

Automated search for new data APIs:

| Strategy | Targets | Frequency |
|----------|---------|-----------|
| API Catalog Scan | data.gov, HDX, World Bank | Weekly |
| Organization Websites | UN agencies, central banks | Monthly |
| Academic Repositories | SSRN, RePEc, Google Scholar | Weekly |
| News API Discovery | News aggregators, RSS feeds | Daily |

### 2. Document Discovery

Search for new reports and publications:

| Source Type | Search Terms | Frequency |
|-------------|--------------|-----------|
| IMF Reports | "Yemen" + "Article IV", "Staff Report" | Monthly |
| World Bank | "Yemen" + "Economic Update", "Assessment" | Monthly |
| UN Reports | "Yemen" + "Humanitarian", "OCHA" | Weekly |
| Think Tanks | "Yemen" + "Economy", "Conflict" | Weekly |

### 3. News Monitoring

Real-time tracking of Yemen-related news:

| Category | Keywords | Sources |
|----------|----------|---------|
| Economic | exchange rate, inflation, GDP, trade | Reuters, Bloomberg, Al Jazeera |
| Banking | central bank, currency, monetary policy | Financial Times, local media |
| Humanitarian | aid, food security, displacement | OCHA, WFP, UNHCR |
| Conflict | ceasefire, peace talks, military | AP, Reuters, local sources |

## Evaluation Criteria

### Source Quality Score

Each discovered source is evaluated on:

| Criterion | Weight | Scoring |
|-----------|--------|---------|
| Publisher Authority | 25% | 1-5 (government/int'l org = 5) |
| Data Freshness | 20% | 1-5 (< 1 month = 5) |
| Methodology Transparency | 20% | 1-5 (full methodology = 5) |
| Geographic Coverage | 15% | 1-5 (national + subnational = 5) |
| Update Frequency | 10% | 1-5 (daily = 5) |
| API Availability | 10% | 1-5 (REST API = 5) |

### Relevance Scoring

```typescript
interface RelevanceScore {
  topicRelevance: number;      // 0-100: How relevant to Yemen economy
  dataQuality: number;         // 0-100: Quality of data
  uniqueness: number;          // 0-100: Does it add new information?
  timeliness: number;          // 0-100: How current is the data?
  overallScore: number;        // Weighted average
}

function calculateRelevance(source: DiscoveredSource): RelevanceScore {
  const topicRelevance = evaluateTopicRelevance(source);
  const dataQuality = evaluateDataQuality(source);
  const uniqueness = evaluateUniqueness(source);
  const timeliness = evaluateTimeliness(source);
  
  return {
    topicRelevance,
    dataQuality,
    uniqueness,
    timeliness,
    overallScore: (topicRelevance * 0.3) + (dataQuality * 0.3) + 
                  (uniqueness * 0.2) + (timeliness * 0.2)
  };
}
```

## Ingestion Pipeline

### Stage 1: Discovery

```typescript
// Daily discovery job
async function runDiscovery() {
  const candidates = [];
  
  // Search API catalogs
  candidates.push(...await searchAPICatalogs());
  
  // Search document repositories
  candidates.push(...await searchDocumentRepos());
  
  // Monitor news feeds
  candidates.push(...await monitorNewsFeeds());
  
  // Queue for evaluation
  await queueForEvaluation(candidates);
}
```

### Stage 2: Evaluation

```typescript
// Evaluate discovered sources
async function evaluateSource(candidate: Candidate) {
  // Check if already in registry
  if (await isKnownSource(candidate.url)) {
    return { action: 'skip', reason: 'already_registered' };
  }
  
  // Calculate relevance score
  const score = calculateRelevance(candidate);
  
  // Auto-approve high-quality sources
  if (score.overallScore >= 80) {
    return { action: 'auto_approve', score };
  }
  
  // Queue for human review
  if (score.overallScore >= 50) {
    return { action: 'human_review', score };
  }
  
  // Reject low-quality sources
  return { action: 'reject', score, reason: 'low_quality' };
}
```

### Stage 3: Ingestion

```typescript
// Ingest approved source
async function ingestSource(source: ApprovedSource) {
  // Register in source registry
  const sourceId = await registerSource(source);
  
  // Fetch data
  const data = await fetchData(source);
  
  // Validate and transform
  const validated = await validateData(data, source.schema);
  
  // Store with provenance
  await storeWithProvenance(validated, sourceId);
  
  // Update discovery log
  await logIngestion(source, validated.recordCount);
}
```

## Connector Registry

### Active Connectors (20)

| ID | Connector | Type | Status | Priority |
|----|-----------|------|--------|----------|
| 1 | World Bank API | API | ✅ Active | High |
| 2 | IMF Data API | API | ✅ Active | High |
| 3 | UN OCHA API | API | ✅ Active | High |
| 4 | WFP VAM API | API | ✅ Active | High |
| 5 | FAO STAT API | API | ✅ Active | Medium |
| 6 | CBY Aden Scraper | Scraper | ✅ Active | High |
| 7 | CBY Sana'a Scraper | Scraper | ⏳ Pending | High |
| 8 | HDX API | API | ⏳ Needs Key | High |
| 9 | ACLED API | API | ⏳ Needs Key | Medium |
| 10 | HAPI API | API | ⏳ Needs Key | Medium |
| 11 | Reuters News | API | ⏳ Pending | Medium |
| 12 | Google Scholar | Scraper | ⏳ Pending | Low |
| 13 | SSRN | API | ⏳ Pending | Low |
| 14 | RePEc | API | ⏳ Pending | Low |
| 15 | UNHCR API | API | ✅ Active | Medium |
| 16 | WHO API | API | ⏳ Pending | Medium |
| 17 | ILO API | API | ⏳ Pending | Medium |
| 18 | UNCTAD API | API | ⏳ Pending | Low |
| 19 | Trading Economics | API | ⏳ Pending | Medium |
| 20 | CEIC Data | API | ⏳ Pending | Low |

### Connector Health Monitoring

```typescript
interface ConnectorHealth {
  id: number;
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  lastSuccess: Date;
  lastError?: string;
  successRate: number;  // Last 7 days
  avgLatency: number;   // ms
}

// Health check runs every 5 minutes
async function checkConnectorHealth(connectorId: number): Promise<ConnectorHealth> {
  const connector = await getConnector(connectorId);
  
  try {
    const start = Date.now();
    await connector.healthCheck();
    const latency = Date.now() - start;
    
    return {
      id: connectorId,
      name: connector.name,
      status: 'healthy',
      lastSuccess: new Date(),
      successRate: await calculateSuccessRate(connectorId),
      avgLatency: latency
    };
  } catch (error) {
    return {
      id: connectorId,
      name: connector.name,
      status: 'down',
      lastSuccess: await getLastSuccess(connectorId),
      lastError: error.message,
      successRate: await calculateSuccessRate(connectorId),
      avgLatency: 0
    };
  }
}
```

## Historical Backfill

### Backfill Strategy

For each new connector, historical data is backfilled from 2010 to present:

| Period | Priority | Strategy |
|--------|----------|----------|
| 2020-Present | High | Full granularity (daily/monthly) |
| 2015-2019 | High | Monthly/quarterly (split-system era) |
| 2010-2014 | Medium | Annual/quarterly (pre-split) |
| Pre-2010 | Low | Annual only, if available |

### Backfill Process

```typescript
async function backfillConnector(connectorId: number) {
  const connector = await getConnector(connectorId);
  const startYear = 2010;
  const endYear = new Date().getFullYear();
  
  for (let year = startYear; year <= endYear; year++) {
    // Determine granularity based on year
    const granularity = year >= 2020 ? 'monthly' : 
                        year >= 2015 ? 'quarterly' : 'annual';
    
    // Fetch historical data
    const data = await connector.fetchHistorical(year, granularity);
    
    // Store with vintage tracking
    await storeWithVintage(data, year);
    
    // Log progress
    await logBackfillProgress(connectorId, year, data.length);
  }
}
```

## Scheduled Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| API Discovery | Sunday 2:00 AM | Search for new APIs |
| Document Discovery | Daily 3:00 AM | Search for new reports |
| News Monitoring | Every 15 min | Track Yemen news |
| Connector Health | Every 5 min | Check connector status |
| Data Sync | Daily 6:00 AM | Sync all active connectors |
| Backfill Check | Weekly | Verify historical completeness |

## Admin Interface

### Discovery Dashboard

Located at `/admin/discovery`:

- **Candidate Queue** - Sources awaiting evaluation
- **Evaluation History** - Recently evaluated sources
- **Ingestion Log** - Successfully ingested data
- **Connector Status** - Health of all connectors

### Manual Discovery

Admins can manually add sources:

1. Enter URL or API endpoint
2. System auto-evaluates quality
3. Configure connector settings
4. Trigger initial backfill
5. Set update schedule

## Metrics & Monitoring

### Key Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Active Connectors | 20 | 6 |
| Sources Registered | 100+ | 50+ |
| Daily Data Points | 1,000+ | 275 |
| Backfill Completeness | 100% | 85% |
| Connector Uptime | 99.5% | 98.2% |

### Alerts

| Alert | Threshold | Action |
|-------|-----------|--------|
| Connector Down | > 1 hour | Notify admin |
| No New Data | > 24 hours | Check source |
| Backfill Stalled | > 7 days | Review connector |
| Quality Drop | < 80% | Human review |

## Conclusion

The YETO Discovery Engine ensures:

1. **Comprehensive coverage** - Continuous search for new sources
2. **Quality assurance** - Automated evaluation and scoring
3. **Historical depth** - Backfill from 2010 to present
4. **Reliability** - Health monitoring and alerts
5. **Scalability** - Easy addition of new connectors
