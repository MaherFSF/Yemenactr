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
