# Manus Ingestion Agent - YETO Platform

## Overview

The Manus Ingestion Agent is an AI-powered ETL system that orchestrates data ingestion, validation, and transformation across all 225+ sources. It enforces evidence-first principles, prevents hallucination, and ensures complete provenance tracking for every data point.

**Capabilities:**
- Autonomous source discovery and validation
- Cross-triangulation of conflicting data
- Self-coaching feedback loop
- Real-time anomaly detection
- Bilingual metadata generation
- Evidence pack creation

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│         Manus Ingestion Agent (AI-Powered)              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Source       │  │ Data         │  │ Validation   │ │
│  │ Discovery    │  │ Fetching     │  │ Pipeline     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Cross-       │  │ Regime       │  │ Evidence     │ │
│  │ Triangulation│  │ Consistency  │  │ Pack         │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Self-Coaching│  │ Anomaly      │  │ Provenance   │ │
│  │ Loop         │  │ Detection    │  │ Ledger       │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Source Discovery Engine

Continuously identifies new data sources:

```typescript
// server/agents/sourceDiscoveryEngine.ts
import { invokeLLM } from '../_core/llm';

export async function discoverNewSources() {
  const prompt = `
You are a data source discovery agent for Yemen's economy. Your task is to identify 
NEW data sources that could provide economic indicators for Yemen (2010-present).

STRICT RULES:
1. Only suggest sources that are PUBLICLY AVAILABLE
2. Include full URLs and access methods
3. Specify update frequency and coverage
4. Rate reliability (A-D scale)
5. Identify any licensing restrictions
6. Never hallucinate or invent sources

SEARCH AREAS:
- UN agencies (UNDP, UNEP, UNEP, UNODC)
- Regional organizations (GCC, Arab League, ESCWA)
- Academic institutions (World Bank research, IMF working papers)
- NGO reports (Sana'a Center, Oxfam, CARE)
- News archives (Reuters, Bloomberg, AFP)
- Government statistics (Yemen CSO, CBY, ministries)

For each source found, provide:
{
  "name_en": "Source Name",
  "name_ar": "الاسم بالعربية",
  "url": "https://...",
  "access_method": "API|Download|Scrape|Manual",
  "update_frequency": "Daily|Weekly|Monthly|Annual",
  "coverage": "2010-present",
  "reliability": "A|B|C|D",
  "data_types": ["indicator1", "indicator2"],
  "notes": "Additional context"
}

Return a JSON array of new sources.
`;

  const response = await invokeLLM({
    messages: [
      {
        role: 'system',
        content: `You are a meticulous data source discovery agent. You NEVER invent sources. 
You ONLY suggest sources that you are confident exist and are publicly accessible.`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'discovered_sources',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            sources: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name_en: { type: 'string' },
                  name_ar: { type: 'string' },
                  url: { type: 'string' },
                  access_method: { type: 'string' },
                  update_frequency: { type: 'string' },
                  coverage: { type: 'string' },
                  reliability: { type: 'string' },
                  data_types: { type: 'array', items: { type: 'string' } },
                  notes: { type: 'string' },
                },
                required: ['name_en', 'url', 'access_method'],
              },
            },
          },
          required: ['sources'],
        },
      },
    },
  });

  const discovered = JSON.parse(response.choices[0].message.content);

  // Validate and store discovered sources
  for (const source of discovered.sources) {
    const validated = await validateSourceAccess(source);
    if (validated) {
      await db.insert(db.schema.source).values({
        srcId: `SRC-${Date.now()}`,
        srcNumericId: await getNextSourceId(),
        nameEn: source.name_en,
        nameAr: source.name_ar,
        url: source.url,
        accessMethod: source.access_method,
        updateFrequency: source.update_frequency,
        reliabilityScore: scoreReliability(source.reliability),
        active: false, // Requires manual review
        tags: source.data_types,
      });

      console.log(`✓ Discovered new source: ${source.name_en}`);
    }
  }
}

async function validateSourceAccess(source: any): Promise<boolean> {
  try {
    const response = await axios.head(source.url, { timeout: 5000 });
    return response.status === 200;
  } catch {
    return false;
  }
}
```

### 2. Data Fetching & Transformation

```typescript
// server/agents/dataFetcher.ts
export async function fetchAndTransformData(sourceId: string) {
  const source = await db.query.source.findFirst({
    where: (s) => eq(s.id, sourceId),
  });

  if (!source) throw new Error(`Source ${sourceId} not found`);

  const ingestionRun = await db.insert(db.schema.ingestionRun).values({
    runKey: `RUN-${source.srcId}-${Date.now()}`,
    status: 'RUNNING',
    trigger: 'SCHEDULE',
    initiatedBy: 'MANUS_AGENT',
  }).returning().then(r => r[0]);

  try {
    let data: any[];

    // Fetch based on access method
    switch (source.accessMethod) {
      case 'API':
        data = await fetchFromAPI(source);
        break;
      case 'DOWNLOAD':
        data = await downloadAndParse(source);
        break;
      case 'SCRAPE':
        data = await scrapeWebsite(source);
        break;
      default:
        throw new Error(`Unknown access method: ${source.accessMethod}`);
    }

    // Transform data
    const transformed = await transformData(data, source);

    // Validate
    const validated = await validateData(transformed, source);

    // Load
    let loadedCount = 0;
    for (const record of validated) {
      const series = await getOrCreateSeries(record, source);
      await db.insert(db.schema.observation).values({
        seriesId: series.id,
        observationDate: record.date,
        value: record.value,
        qualityStatus: record.qualityStatus,
        sourceId: source.id,
        metadata: record.metadata,
      }).onConflictDoNothing();
      loadedCount++;
    }

    // Update ingestion run
    await db.update(db.schema.ingestionRun)
      .set({
        status: 'SUCCEEDED',
        endedAt: new Date(),
      })
      .where(eq(db.schema.ingestionRun.id, ingestionRun.id));

    console.log(`✓ Ingested ${loadedCount} records from ${source.nameEn}`);
  } catch (error) {
    await db.update(db.schema.ingestionRun)
      .set({
        status: 'FAILED',
        endedAt: new Date(),
        notes: error.message,
      })
      .where(eq(db.schema.ingestionRun.id, ingestionRun.id));

    throw error;
  }
}
```

### 3. Cross-Triangulation Engine

Validates data by comparing multiple sources:

```typescript
// server/agents/crossTriangulation.ts
export async function crossTriangulateIndicator(
  indicatorCode: string,
  observationDate: Date
) {
  // Find all sources reporting this indicator
  const sources = await db.query.series.findMany({
    where: (s) => eq(s.indicatorId, indicatorCode),
  });

  if (sources.length < 2) {
    return { status: 'INSUFFICIENT_SOURCES', sources: sources.length };
  }

  // Fetch latest values from each source
  const values: Array<{ sourceId: string; value: number; confidence: string }> = [];

  for (const series of sources) {
    const observation = await db.query.observation.findFirst({
      where: (o) =>
        and(
          eq(o.seriesId, series.id),
          gte(o.observationDate, new Date(observationDate.getFullYear(), 0, 1)),
          lte(o.observationDate, new Date(observationDate.getFullYear(), 11, 31))
        ),
      orderBy: (o) => desc(o.observationDate),
    });

    if (observation) {
      values.push({
        sourceId: series.sourceId,
        value: observation.value,
        confidence: observation.qualityStatus,
      });
    }
  }

  if (values.length < 2) {
    return { status: 'INSUFFICIENT_DATA', sources: values.length };
  }

  // Calculate statistics
  const numericValues = values.map(v => v.value);
  const mean = numericValues.reduce((a, b) => a + b) / numericValues.length;
  const variance = numericValues.reduce((a, b) => a + Math.pow(b - mean, 2)) / numericValues.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean; // Coefficient of variation

  // Determine triangulation result
  let triangulationStatus = 'VERIFIED';
  if (cv > 0.15) triangulationStatus = 'DIVERGENT'; // >15% variation
  if (cv > 0.30) triangulationStatus = 'CONFLICTING'; // >30% variation

  return {
    status: triangulationStatus,
    mean,
    stdDev,
    cv,
    sources: values.length,
    values,
  };
}
```

### 4. Self-Coaching Feedback Loop

Agent learns from ingestion outcomes:

```typescript
// server/agents/selfCoachingLoop.ts
export async function runSelfCoachingCycle() {
  const prompt = `
You are the Manus Ingestion Agent. Review recent ingestion runs and identify 
patterns of success and failure.

RECENT RUNS:
${await getRecentIngestionRuns()}

ANALYSIS REQUIRED:
1. Which sources consistently succeed?
2. Which sources have high failure rates?
3. What error patterns appear?
4. What data quality issues are recurring?
5. Which sources need updated connectors?

RECOMMENDATIONS:
For each issue, provide:
- Root cause analysis
- Recommended action (retry, update connector, find alternative source)
- Priority (HIGH|MEDIUM|LOW)
- Estimated effort to fix

Format as JSON.
`;

  const response = await invokeLLM({
    messages: [
      {
        role: 'system',
        content: `You are a self-improving data ingestion agent. You analyze patterns in 
ingestion outcomes and recommend improvements. You are HONEST about failures and 
never make excuses.`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const analysis = JSON.parse(response.choices[0].message.content);

  // Store recommendations
  for (const rec of analysis.recommendations) {
    await db.insert(db.schema.agentRecommendation).values({
      sourceId: rec.sourceId,
      recommendation: rec.action,
      priority: rec.priority,
      reasoning: rec.rootCause,
      createdAt: new Date(),
    });
  }

  // Execute high-priority recommendations
  for (const rec of analysis.recommendations.filter(r => r.priority === 'HIGH')) {
    await executeRecommendation(rec);
  }

  console.log(`✓ Self-coaching cycle complete: ${analysis.recommendations.length} recommendations`);
}
```

### 5. Anomaly Detection

Real-time detection of unusual data patterns:

```typescript
// server/agents/anomalyDetector.ts
export async function detectAnomalies(seriesId: string) {
  // Get last 100 observations
  const observations = await db.query.observation.findMany({
    where: (o) => eq(o.seriesId, seriesId),
    orderBy: (o) => desc(o.observationDate),
    limit: 100,
  });

  if (observations.length < 20) return null; // Insufficient data

  const values = observations.map(o => o.value).reverse();

  // Calculate moving average and standard deviation
  const windowSize = 12;
  const anomalies: Array<{ date: Date; value: number; deviation: number }> = [];

  for (let i = windowSize; i < values.length; i++) {
    const window = values.slice(i - windowSize, i);
    const mean = window.reduce((a, b) => a + b) / window.length;
    const variance = window.reduce((a, b) => a + Math.pow(b - mean, 2)) / window.length;
    const stdDev = Math.sqrt(variance);

    const current = values[i];
    const deviation = Math.abs(current - mean) / stdDev;

    // Flag if >3 standard deviations
    if (deviation > 3) {
      anomalies.push({
        date: observations[observations.length - 1 - i].observationDate,
        value: current,
        deviation,
      });
    }
  }

  if (anomalies.length > 0) {
    // Create alert
    await db.insert(db.schema.dataAlert).values({
      seriesId,
      alertType: 'ANOMALY',
      severity: 'MEDIUM',
      message: `Detected ${anomalies.length} anomalies in recent data`,
      metadata: { anomalies },
      createdAt: new Date(),
    });

    console.log(`⚠ Anomaly detected in series ${seriesId}: ${anomalies.length} outliers`);
  }

  return anomalies;
}
```

### 6. Evidence Pack Generation

Creates comprehensive provenance documentation:

```typescript
// server/agents/evidencePackGenerator.ts
export async function generateEvidencePack(observationId: string) {
  const observation = await db.query.observation.findFirst({
    where: (o) => eq(o.id, observationId),
  });

  const series = await db.query.series.findFirst({
    where: (s) => eq(s.id, observation.seriesId),
  });

  const indicator = await db.query.indicator.findFirst({
    where: (i) => eq(i.id, series.indicatorId),
  });

  const source = await db.query.source.findFirst({
    where: (s) => eq(s.id, series.sourceId),
  });

  const artifact = await db.query.artifact.findFirst({
    where: (a) => eq(a.sourceId, source.id),
    orderBy: (a) => desc(a.createdAt),
  });

  // Create evidence pack
  const evidencePack = {
    observation: {
      id: observation.id,
      value: observation.value,
      date: observation.observationDate,
      unit: series.unitOverride || indicator.unit,
      qualityStatus: observation.qualityStatus,
    },
    indicator: {
      code: indicator.indicatorCode,
      nameEn: indicator.nameEn,
      nameAr: indicator.nameAr,
      description: indicator.descriptionEn,
      sector: indicator.sector,
    },
    source: {
      id: source.id,
      nameEn: source.nameEn,
      nameAr: source.nameAr,
      url: source.url,
      reliabilityScore: source.reliabilityScore,
      tier: source.tier,
    },
    series: {
      key: series.seriesKey,
      frequency: series.freq,
      regime: series.regime,
      startDate: series.startDate,
      endDate: series.endDate,
      methodology: series.methodology,
    },
    artifact: artifact ? {
      id: artifact.id,
      type: artifact.artifactType,
      url: artifact.sourceUrl,
      retrievedAt: artifact.retrievedAt,
    } : null,
    triangulation: await crossTriangulateIndicator(
      indicator.indicatorCode,
      observation.observationDate
    ),
    createdAt: new Date(),
  };

  // Store evidence pack
  await db.insert(db.schema.evidencePack).values({
    observationId,
    packData: evidencePack,
  });

  return evidencePack;
}
```

## Operational Workflow

### Daily Ingestion Cycle

```
06:00 UTC - Start ingestion cycle
  ├─ Check all Tier 1 sources for updates
  ├─ Fetch new data from 14 automated connectors
  ├─ Validate and transform data
  ├─ Load into PostgreSQL
  ├─ Cross-triangulate conflicting data
  └─ Generate evidence packs

12:00 UTC - Mid-day check
  ├─ Monitor ingestion run status
  ├─ Detect anomalies in new data
  ├─ Alert on failures
  └─ Trigger fallback sources if needed

18:00 UTC - Evening analysis
  ├─ Run self-coaching cycle
  ├─ Analyze data quality metrics
  ├─ Generate recommendations
  └─ Update source reliability scores

23:00 UTC - End-of-day report
  ├─ Summarize ingestion results
  ├─ Report any gaps or issues
  ├─ Schedule next day's jobs
  └─ Archive logs
```

### Weekly Maintenance

```
Monday 06:00 UTC - Source discovery
  ├─ Scan for new data sources
  ├─ Validate discovered sources
  ├─ Add to registry if credible
  └─ Schedule connector development

Wednesday 12:00 UTC - Quality review
  ├─ Analyze data quality metrics
  ├─ Review triangulation results
  ├─ Identify systematic issues
  └─ Recommend improvements

Friday 18:00 UTC - Performance analysis
  ├─ Calculate ingestion efficiency
  ├─ Review connector performance
  ├─ Identify optimization opportunities
  └─ Plan next week's priorities
```

## No-Hallucination Enforcement

The agent is constrained to never invent data:

```typescript
// Strict rules enforced at every step
const NO_HALLUCINATION_RULES = [
  'Never insert a value without a source',
  'Never create an observation without a series',
  'Never create a series without an indicator',
  'Never create an indicator without documentation',
  'Never report data from an inactive source',
  'Never merge regime-specific data without explicit consent',
  'When data is missing, mark as "Not available yet" not estimated',
  'When uncertain, create a Gap Ticket instead of guessing',
];

// Validation at insertion
async function insertObservationWithValidation(obs: Observation) {
  // Verify source is active
  const source = await db.query.source.findFirst({
    where: (s) => eq(s.id, obs.sourceId),
  });
  if (!source?.active) throw new Error('Source is not active');

  // Verify series exists
  const series = await db.query.series.findFirst({
    where: (s) => eq(s.id, obs.seriesId),
  });
  if (!series) throw new Error('Series does not exist');

  // Verify no duplicate
  const existing = await db.query.observation.findFirst({
    where: (o) =>
      and(
        eq(o.seriesId, obs.seriesId),
        eq(o.observationDate, obs.observationDate)
      ),
  });
  if (existing) throw new Error('Duplicate observation');

  // Safe to insert
  return db.insert(db.schema.observation).values(obs);
}
```

## Monitoring Dashboard

The agent provides real-time visibility:

```typescript
export async function getAgentDashboard() {
  return {
    ingestion: {
      lastRun: await getLastIngestionRun(),
      successRate: await calculateSuccessRate(),
      recordsIngested: await countRecentObservations(),
      failedConnectors: await getFailedConnectors(),
    },
    quality: {
      triangulationRate: await calculateTriangulationRate(),
      anomaliesDetected: await countRecentAnomalies(),
      dataGaps: await countOpenGapTickets(),
      averageConfidence: await calculateAverageConfidence(),
    },
    sources: {
      active: await countActiveSources(),
      pending: await countPendingSources(),
      failureRate: await calculateSourceFailureRate(),
      lastDiscovery: await getLastSourceDiscovery(),
    },
    recommendations: {
      highPriority: await getHighPriorityRecommendations(),
      pendingActions: await countPendingActions(),
      completedThisWeek: await countCompletedActions(),
    },
  };
}
```

## References

- [Master Source Registry](./MASTER_SOURCE_REGISTRY.md)
- [Data Connectors](./CONNECTORS.md)
- [PostgreSQL Schema](./POSTGRESQL_MIGRATION_GUIDE.md)
- [LLM Integration Guide](../server/_core/llm.ts)
