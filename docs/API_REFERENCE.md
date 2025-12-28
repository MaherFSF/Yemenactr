# YETO Platform API Reference

## Overview

The YETO platform uses tRPC for type-safe API communication. All endpoints are available under `/api/trpc`.

## Authentication

### Session-based Authentication

The platform uses Manus OAuth for authentication. After login, a session cookie is set automatically.

### Protected vs Public Procedures

- **publicProcedure**: Accessible without authentication
- **protectedProcedure**: Requires valid session

---

## API Endpoints

### Authentication

#### `auth.me`
Get current user information.

```typescript
// Query
const { data } = trpc.auth.me.useQuery();

// Response
{
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: Date;
}
```

#### `auth.logout`
Log out current user.

```typescript
// Mutation
const logout = trpc.auth.logout.useMutation();
await logout.mutateAsync();
```

---

### Platform Statistics

#### `platform.stats`
Get platform-wide statistics.

```typescript
// Query
const { data } = trpc.platform.stats.useQuery();

// Response
{
  totalIndicators: number;
  totalDataPoints: number;
  totalSources: number;
  totalEvents: number;
  totalGlossaryTerms: number;
  totalStakeholders: number;
  lastUpdated: string;
}
```

---

### Sector Analytics

#### `sectors.analytics`
Get analytics for a specific sector.

```typescript
// Query
const { data } = trpc.sectors.analytics.useQuery({
  sector: "banking" | "currency" | "prices" | "trade" | "public_finance" | "energy" | "food_security" | "labor" | "aid" | "conflict" | "infrastructure" | "agriculture" | "investment" | "macroeconomy" | "poverty"
});

// Response
{
  sector: string;
  totalIndicators: number;
  totalDataPoints: number;
  coveragePercentage: number;
  lastUpdated: string;
  keyMetrics: Array<{
    name: string;
    value: number;
    unit: string;
    change: number;
    regime: "aden" | "sanaa" | "national";
  }>;
}
```

---

### Regime Comparison

#### `regime.comparison`
Compare indicators between Aden and Sana'a regimes.

```typescript
// Query
const { data } = trpc.regime.comparison.useQuery({
  indicator: string;
  startDate?: string;
  endDate?: string;
});

// Response
{
  indicator: string;
  adenData: Array<{ date: string; value: number }>;
  sanaaData: Array<{ date: string; value: number }>;
  divergenceIndex: number;
  lastUpdated: string;
}
```

---

### Time Series Data

#### `timeSeries.query`
Query time series data with filters.

```typescript
// Query
const { data } = trpc.timeSeries.query.useQuery({
  indicatorId?: string;
  sector?: string;
  regime?: "aden" | "sanaa" | "national";
  startDate?: string;
  endDate?: string;
  limit?: number;
});

// Response
Array<{
  id: string;
  indicatorId: string;
  value: number;
  date: string;
  regime: string;
  confidenceLevel: "A" | "B" | "C" | "D";
  sourceId: string;
}>
```

---

### Economic Events

#### `events.list`
List economic events with filtering.

```typescript
// Query
const { data } = trpc.events.list.useQuery({
  startDate?: string;
  endDate?: string;
  actor?: string;
  location?: string;
  theme?: string;
  limit?: number;
});

// Response
Array<{
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  date: string;
  actor: string;
  location: string;
  theme: string;
  impactLevel: "high" | "medium" | "low";
}>
```

---

### Glossary

#### `glossary.list`
Get glossary terms.

```typescript
// Query
const { data } = trpc.glossary.list.useQuery({
  search?: string;
  category?: string;
});

// Response
Array<{
  id: string;
  termEn: string;
  termAr: string;
  definitionEn: string;
  definitionAr: string;
  category: string;
}>
```

---

### AI Assistant

#### `ai.query`
Query the AI assistant.

```typescript
// Mutation
const aiQuery = trpc.ai.query.useMutation();

const response = await aiQuery.mutateAsync({
  question: string;
  context?: string;
});

// Response
{
  answer: string;
  confidence: number;
  sources: Array<{
    title: string;
    url?: string;
    date?: string;
  }>;
  relatedIndicators: string[];
}
```

---

### Data Export

#### `export.timeSeries`
Export time series data.

```typescript
// Query
const { data } = trpc.export.timeSeries.useQuery({
  indicatorId: string;
  format: "csv" | "json";
  startDate?: string;
  endDate?: string;
});

// Response (JSON format)
{
  data: Array<{...}>;
  metadata: {
    indicator: string;
    dateRange: string;
    exportedAt: string;
  };
}

// Response (CSV format)
string // CSV content
```

---

## Error Handling

All errors follow the tRPC error format:

```typescript
{
  code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "BAD_REQUEST" | "INTERNAL_SERVER_ERROR";
  message: string;
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Not logged in |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `BAD_REQUEST` | Invalid input |
| `INTERNAL_SERVER_ERROR` | Server error |

---

## Rate Limiting

| Tier | Requests/minute |
|------|-----------------|
| Public | 60 |
| Registered | 120 |
| Pro | 300 |
| Institutional | 1000 |

---

## Webhooks (Future)

Planned webhook events:
- `data.updated` - New data published
- `alert.triggered` - Economic alert triggered
- `publication.released` - New publication available

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server/routers';

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'https://yeto.causewaygrp.com/api/trpc',
    }),
  ],
});

// Query platform stats
const stats = await client.platform.stats.query();
console.log(stats);
```

### Python (via HTTP)

```python
import requests

BASE_URL = "https://yeto.causewaygrp.com/api/trpc"

# Query platform stats
response = requests.get(f"{BASE_URL}/platform.stats")
data = response.json()
print(data['result']['data'])
```

---

## Changelog

### v1.0.0 (December 2024)
- Initial API release
- Core endpoints for data, events, glossary
- AI assistant integration
- Export functionality

---

*Last Updated: December 2024*


---

## Extended API Reference

### Governance Endpoints

#### `governance.getProvenance`
Get full provenance chain for any data entity.

```typescript
// Query
const { data } = trpc.governance.getProvenance.useQuery({
  entityType: "indicator" | "series" | "observation";
  entityId: string;
});

// Response
{
  records: Array<{
    id: string;
    activity: "generation" | "derivation" | "revision" | "validation" | "publication";
    agent: string;
    agentType: "human" | "system" | "organization";
    timestamp: string;
    sourceUrl: string;
    methodology: string;
    transformations: string[];
    qaChecks: Array<{
      check: string;
      passed: boolean;
      details: string;
      timestamp: string;
    }>;
    licenseType: string;
    accessRestrictions: string[];
  }>;
  chain: Array<{
    from: string;
    to: string;
    relationship: string;
  }>;
}
```

#### `governance.getConfidenceRating`
Get detailed confidence rating breakdown.

```typescript
// Query
const { data } = trpc.governance.getConfidenceRating.useQuery({
  entityType: string;
  entityId: string;
});

// Response
{
  overallRating: "A" | "B" | "C" | "D";
  overallScore: number; // 0-100
  dimensions: {
    sourceCredibility: { score: number; weight: number; explanation: string };
    methodologyRigor: { score: number; weight: number; explanation: string };
    temporalCoverage: { score: number; weight: number; explanation: string };
    geographicCoverage: { score: number; weight: number; explanation: string };
    crossValidation: { score: number; weight: number; explanation: string };
  };
  assessedBy: string;
  assessedAt: string;
  validUntil: string;
}
```

#### `governance.getContradictions`
Get data contradictions for an entity.

```typescript
// Query
const { data } = trpc.governance.getContradictions.useQuery({
  entityType?: string;
  entityId?: string;
  status?: "detected" | "investigating" | "resolved" | "accepted";
  limit?: number;
});

// Response
{
  contradictions: Array<{
    id: string;
    entityType: string;
    entityId: string;
    fieldName: string;
    sourceAId: string;
    sourceAName: string;
    sourceAValue: any;
    sourceBId: string;
    sourceBName: string;
    sourceBValue: any;
    discrepancyPercent: number;
    status: string;
    resolution: string | null;
    detectedAt: string;
    resolvedAt: string | null;
  }>;
  total: number;
}
```

#### `governance.getVintages`
Get historical versions of data.

```typescript
// Query
const { data } = trpc.governance.getVintages.useQuery({
  entityType: string;
  entityId: string;
  asOfDate?: string; // Point-in-time query
});

// Response
{
  current: {
    value: any;
    validFrom: string;
    validTo: string | null;
  };
  history: Array<{
    version: number;
    value: any;
    validFrom: string;
    validTo: string;
    changedBy: string;
    changeReason: string;
  }>;
}
```

#### `governance.getChangelog`
Get public changelog entries.

```typescript
// Query
const { data } = trpc.governance.getChangelog.useQuery({
  entityType?: string;
  entityId?: string;
  changeType?: "correction" | "update" | "addition" | "deletion" | "methodology_change";
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
});

// Response
{
  entries: Array<{
    id: string;
    timestamp: string;
    changeType: string;
    title: string;
    titleAr: string;
    description: string;
    descriptionAr: string;
    entityType: string;
    entityId: string;
    previousValue: any;
    newValue: any;
    reason: string;
    author: string;
    isPublic: boolean;
  }>;
  total: number;
  rssUrl: string;
}
```

---

### Monitoring Endpoints

#### `monitoring.getLiveness`
Basic liveness check.

```typescript
// Query
const { data } = trpc.monitoring.getLiveness.useQuery();

// Response
{
  status: "alive";
  timestamp: string;
}
```

#### `monitoring.getReadiness`
Readiness check for load balancers.

```typescript
// Query
const { data } = trpc.monitoring.getReadiness.useQuery();

// Response
{
  ready: boolean;
  checks: {
    database: boolean;
    cache: boolean;
    storage: boolean;
  };
}
```

#### `monitoring.getHealth`
Full health status.

```typescript
// Query
const { data } = trpc.monitoring.getHealth.useQuery();

// Response
{
  status: "healthy" | "degraded" | "unhealthy";
  uptime: number;
  version: string;
  components: {
    database: { status: string; latency: number };
    cache: { status: string; hitRate: number };
    storage: { status: string; available: boolean };
  };
  metrics: {
    requestsPerMinute: number;
    errorRate: number;
    avgResponseTime: number;
    activeConnections: number;
  };
}
```

#### `monitoring.getMetrics`
Get system metrics (admin only).

```typescript
// Query (requires admin)
const { data } = trpc.monitoring.getMetrics.useQuery({
  period: "hour" | "day" | "week" | "month";
});

// Response
{
  requests: Array<{ timestamp: string; count: number }>;
  errors: Array<{ timestamp: string; count: number }>;
  latency: Array<{ timestamp: string; p50: number; p95: number; p99: number }>;
  memory: Array<{ timestamp: string; used: number; total: number }>;
}
```

---

### Admin Endpoints

#### `admin.users.list`
List all users with filtering.

```typescript
// Query (requires admin)
const { data } = trpc.admin.users.list.useQuery({
  role?: "user" | "admin";
  status?: "active" | "suspended";
  search?: string;
  limit?: number;
  offset?: number;
});

// Response
{
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
    lastLoginAt: string;
  }>;
  total: number;
}
```

#### `admin.users.updateRole`
Update user role.

```typescript
// Mutation (requires admin)
const updateRole = trpc.admin.users.updateRole.useMutation();

await updateRole.mutateAsync({
  userId: string;
  role: "user" | "admin";
});
```

#### `admin.users.suspend`
Suspend a user.

```typescript
// Mutation (requires admin)
const suspend = trpc.admin.users.suspend.useMutation();

await suspend.mutateAsync({
  userId: string;
  reason: string;
});
```

#### `admin.sources.list`
List all data sources.

```typescript
// Query (requires admin)
const { data } = trpc.admin.sources.list.useQuery();

// Response
{
  sources: Array<{
    id: string;
    name: string;
    type: "api" | "file" | "manual";
    status: "active" | "inactive" | "error";
    lastRun: string;
    nextRun: string;
    indicatorCount: number;
  }>;
}
```

#### `admin.sources.runIngestion`
Trigger manual data ingestion.

```typescript
// Mutation (requires admin)
const runIngestion = trpc.admin.sources.runIngestion.useMutation();

const result = await runIngestion.mutateAsync({
  sourceId: string;
});

// Response
{
  runId: string;
  status: "started" | "queued";
  estimatedDuration: number;
}
```

#### `admin.quality.getReport`
Get data quality report.

```typescript
// Query (requires admin)
const { data } = trpc.admin.quality.getReport.useQuery({
  sector?: string;
  dateRange?: { start: string; end: string };
});

// Response
{
  overallScore: number;
  byRating: {
    A: number;
    B: number;
    C: number;
    D: number;
  };
  issues: Array<{
    type: string;
    severity: "high" | "medium" | "low";
    count: number;
    examples: string[];
  }>;
  recommendations: string[];
}
```

#### `admin.audit.getLogs`
Get audit logs.

```typescript
// Query (requires admin)
const { data } = trpc.admin.audit.getLogs.useQuery({
  userId?: string;
  action?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
});

// Response
{
  logs: Array<{
    id: string;
    timestamp: string;
    userId: string;
    userName: string;
    action: string;
    resourceType: string;
    resourceId: string;
    details: Record<string, any>;
    ipAddress: string;
    userAgent: string;
    success: boolean;
  }>;
  total: number;
}
```

---

### Partner Portal Endpoints

#### `partner.submissions.list`
List partner's data submissions.

```typescript
// Query (requires partner role)
const { data } = trpc.partner.submissions.list.useQuery({
  status?: "pending" | "approved" | "rejected";
  limit?: number;
  offset?: number;
});

// Response
{
  submissions: Array<{
    id: string;
    title: string;
    indicatorId: string;
    status: string;
    submittedAt: string;
    reviewedAt: string | null;
    reviewNotes: string | null;
  }>;
  total: number;
}
```

#### `partner.submissions.create`
Submit new data.

```typescript
// Mutation (requires partner role)
const submit = trpc.partner.submissions.create.useMutation();

await submit.mutateAsync({
  indicatorId: string;
  data: Array<{
    date: string;
    value: number;
    regimeTag: "aden" | "sanaa" | "national";
    notes?: string;
  }>;
  sourceDescription: string;
  methodology: string;
  attachments?: string[]; // File URLs
});
```

---

## Batch Operations

### Batch Query

Query multiple procedures in a single request:

```typescript
// Client-side batching
const [indicators, stats, events] = await Promise.all([
  client.indicators.list.query({ limit: 10 }),
  client.platform.stats.query(),
  client.events.list.query({ limit: 5 }),
]);
```

### HTTP Batch Request

```http
POST /api/trpc/indicators.list,platform.stats,events.list
Content-Type: application/json

[
  { "json": { "limit": 10 } },
  { "json": {} },
  { "json": { "limit": 5 } }
]
```

---

## Pagination

All list endpoints support cursor-based pagination:

```typescript
// First page
const page1 = await client.indicators.list.query({ limit: 20 });

// Next page
const page2 = await client.indicators.list.query({
  limit: 20,
  offset: 20,
});

// Response includes pagination info
{
  items: [...],
  total: 150,
  hasMore: true,
  nextOffset: 40
}
```

---

## Filtering & Sorting

### Filter Syntax

```typescript
// Multiple filters
const data = await client.indicators.list.query({
  category: "fiscal",
  sector: "public_finance",
  confidenceRating: "A",
});

// Date range
const events = await client.events.list.query({
  startDate: "2024-01-01",
  endDate: "2024-12-31",
});

// Search
const results = await client.search.global.query({
  query: "GDP growth",
  types: ["indicator", "event"],
});
```

### Sort Options

```typescript
const data = await client.indicators.list.query({
  sortBy: "name" | "lastUpdated" | "confidenceRating",
  sortOrder: "asc" | "desc",
});
```

---

## Caching

### Cache Headers

Responses include cache control headers:

```http
Cache-Control: public, max-age=300
ETag: "abc123"
Last-Modified: Sat, 28 Dec 2024 12:00:00 GMT
```

### Conditional Requests

```http
GET /api/trpc/indicators.list
If-None-Match: "abc123"
If-Modified-Since: Sat, 28 Dec 2024 12:00:00 GMT
```

Returns `304 Not Modified` if data unchanged.

---

## Versioning

The API is versioned through the URL path:

- Current: `/api/trpc` (v1)
- Future: `/api/v2/trpc`

Breaking changes will be introduced in new versions only.

---

*Extended API Reference - Version 1.0*
*Last Updated: December 28, 2024*
