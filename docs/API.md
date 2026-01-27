# YETO Platform - API Reference

## Overview

The YETO API is built on tRPC, providing end-to-end type safety between client and server. All endpoints are accessible via the `/api/trpc` gateway.

## Base URL

```
Production: https://yeto.manus.space/api/trpc
Development: http://localhost:3000/api/trpc
```

## Authentication

Most endpoints require authentication via OAuth 2.0. Include the session cookie in requests.

```typescript
// Check authentication status
const { data: user } = trpc.auth.me.useQuery();
```

---

## API Endpoints

### Auth Router

#### `auth.me`
Get current authenticated user.

```typescript
// Response
{
  id: string;
  openId: string;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: Date;
}
```

#### `auth.logout`
End current session.

```typescript
// Response
{ success: boolean }
```

---

### Dashboard Router

#### `dashboard.getStats`
Get homepage statistics.

```typescript
// Response
{
  totalIndicators: number;
  totalDataPoints: number;
  totalSources: number;
  lastUpdated: Date;
}
```

#### `dashboard.getHeroKPIs`
Get hero section KPIs.

```typescript
// Response
{
  gdpGrowth: { value: number; change: number; year: number };
  inflation: { value: number; change: number; year: number };
  exchangeRate: { aden: number; sanaa: number; parallel: number };
  population: { value: number; displaced: number };
}
```

---

### Indicators Router

#### `indicators.list`
List all economic indicators.

```typescript
// Input
{
  sector?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

// Response
{
  items: Indicator[];
  total: number;
}
```

#### `indicators.getByCode`
Get indicator by code.

```typescript
// Input
{ code: string }

// Response
{
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  sector: string;
  unit: string;
  frequency: string;
  methodology: string;
  sources: Source[];
}
```

#### `indicators.getTimeSeries`
Get time series data for an indicator.

```typescript
// Input
{
  indicatorId: string;
  startDate?: Date;
  endDate?: Date;
  regimeTag?: "IRG" | "DFA" | "UNIFIED";
}

// Response
{
  indicator: Indicator;
  data: TimeSeriesPoint[];
}
```

---

### FX Router

#### `fx.getLatestRates`
Get latest exchange rates for all regimes.

```typescript
// Response
{
  aden: { rate: number; date: Date; source: string };
  sanaa: { rate: number; date: Date; source: string };
  parallel: { rate: number; date: Date; source: string };
}
```

#### `fx.getChartData`
Get historical FX data for charting.

```typescript
// Input
{
  startDate?: Date;
  endDate?: Date;
  regimes?: ("IRG" | "DFA" | "PAR")[];
}

// Response
{
  data: {
    date: Date;
    aden?: number;
    sanaa?: number;
    parallel?: number;
  }[];
}
```

#### `fx.getGapTickets`
Get data gap tickets for FX data.

```typescript
// Response
{
  tickets: {
    id: string;
    regime: string;
    startDate: Date;
    endDate: Date;
    status: "open" | "resolved";
    createdAt: Date;
  }[];
}
```

---

### Research Router

#### `research.getPublications`
Get research publications.

```typescript
// Input
{
  organization?: string;
  documentType?: string;
  year?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

// Response
{
  items: Publication[];
  total: number;
}
```

#### `research.search`
Full-text search across publications.

```typescript
// Input
{ query: string; limit?: number }

// Response
{
  results: {
    publication: Publication;
    score: number;
    highlights: string[];
  }[];
}
```

---

### Banking Router

#### `banking.getBanks`
Get list of commercial banks.

```typescript
// Response
{
  banks: {
    id: string;
    name: string;
    nameAr: string;
    type: "commercial" | "islamic" | "microfinance";
    headquarters: string;
    operationalStatus: string;
    branches: number;
  }[];
}
```

#### `banking.getMetrics`
Get banking sector metrics.

```typescript
// Response
{
  totalBanks: number;
  totalBranches: number;
  totalAssets: number;
  totalDeposits: number;
  nplRatio: number;
}
```

---

### One Brain Router (AI)

#### `oneBrain.chat`
Send message to AI assistant.

```typescript
// Input
{
  message: string;
  conversationId?: string;
  language?: "en" | "ar";
}

// Response
{
  response: string;
  conversationId: string;
  sources: Source[];
  confidence: number;
}
```

#### `oneBrain.suggestQueries`
Get suggested queries based on context.

```typescript
// Input
{ context?: string }

// Response
{
  suggestions: string[];
}
```

---

### Truth Layer Router

#### `truthLayer.verify`
Verify a claim against evidence.

```typescript
// Input
{
  claim: string;
  entityType: string;
  entityId: string;
}

// Response
{
  verified: boolean;
  confidence: number;
  evidence: Evidence[];
  contradictions: Contradiction[];
}
```

#### `truthLayer.getProvenance`
Get data provenance chain.

```typescript
// Input
{
  entityType: string;
  entityId: string;
}

// Response
{
  chain: {
    source: Source;
    retrievalDate: Date;
    transformations: string[];
    qualityScore: number;
  }[];
}
```

---

### Go-Live Router

#### `goLive.runAllGates`
Run all production gates.

```typescript
// Response
{
  passed: boolean;
  gates: {
    publicationGate: { passed: boolean; details: string[] };
    aiSafetyGates: { passed: boolean; details: string[] };
    reliabilityLab: { passed: boolean; details: string[] };
    hardeningTests: { passed: boolean; details: string[] };
    routeHealthChecks: { passed: boolean; details: string[] };
  };
  timestamp: Date;
}
```

#### `goLive.getStatus`
Get current gate status.

```typescript
// Response
{
  lastRun: Date;
  status: "passed" | "failed" | "pending";
  failedGates: string[];
}
```

---

### Data Infrastructure Router

#### `dataInfra.getCoverage`
Get data coverage map.

```typescript
// Response
{
  sectors: {
    name: string;
    coverage: number;
    indicators: number;
    lastUpdated: Date;
  }[];
  overall: number;
}
```

#### `dataInfra.runBackfill`
Trigger historical data backfill.

```typescript
// Input
{
  source: string;
  startYear: number;
  endYear: number;
}

// Response
{
  jobId: string;
  status: "queued" | "running" | "completed" | "failed";
}
```

---

## Error Handling

All errors follow the tRPC error format:

```typescript
{
  code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "BAD_REQUEST" | "INTERNAL_SERVER_ERROR";
  message: string;
  data?: any;
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `BAD_REQUEST` | 400 | Invalid input |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

---

## Rate Limiting

| Endpoint Category | Limit |
|-------------------|-------|
| Public endpoints | 100/min |
| Authenticated endpoints | 1000/min |
| AI endpoints | 20/min |
| Admin endpoints | 500/min |

---

## Webhooks

YETO supports webhooks for real-time notifications:

```typescript
// Webhook payload
{
  event: "data.updated" | "alert.triggered" | "report.published";
  timestamp: Date;
  data: any;
  signature: string;
}
```

---

*Last Updated: January 28, 2026*
