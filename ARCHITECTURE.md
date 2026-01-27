# YETO Platform - System Architecture

## Overview

The Yemen Economic Transparency Observatory (YETO) is a full-stack economic intelligence platform providing comprehensive data, analysis, and AI-powered tools for understanding Yemen's fragmented economy. Built with a modern TypeScript stack, the architecture prioritizes type safety, data integrity, and evidence-based transparency.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           YETO ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                        PRESENTATION LAYER                       │     │
│  │  React 19 • TypeScript • Tailwind CSS 4 • shadcn/ui • Recharts │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                    │                                     │
│                              tRPC over HTTP                              │
│                                    │                                     │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                         APPLICATION LAYER                       │     │
│  │  Express 4 • tRPC 11 • Drizzle ORM • Zod Validation            │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                    │                                     │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                          SERVICE LAYER                          │     │
│  │  Connectors (26) • ETL Pipeline • Governance • AI Services     │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                    │                                     │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                           DATA LAYER                            │     │
│  │  TiDB (MySQL) • S3 Storage • Redis Cache (optional)            │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI framework with concurrent features |
| TypeScript | 5.x | Type-safe development |
| Tailwind CSS | 4.x | Utility-first styling with RTL support |
| shadcn/ui | Latest | Accessible component library |
| Wouter | 3.x | Lightweight routing |
| Recharts | 2.x | Data visualization |
| tRPC Client | 11.x | Type-safe API calls |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 22.x | JavaScript runtime |
| Express | 4.x | HTTP server framework |
| tRPC | 11.x | End-to-end type-safe APIs |
| Drizzle ORM | Latest | Type-safe database queries |
| Zod | 3.x | Runtime schema validation |
| Superjson | Latest | Rich type serialization |
| Vitest | Latest | Unit testing framework |

### Data Layer

| Technology | Purpose |
|------------|---------|
| TiDB/MySQL | Primary relational database (81 tables) |
| S3 | File and document storage |
| Redis | Session and query caching (optional) |

---

## Directory Structure

```
yeto-platform/
├── client/                     # Frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components (114)
│   │   │   ├── ui/             # shadcn/ui components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── AIChatBox.tsx
│   │   ├── contexts/           # React contexts
│   │   │   ├── LanguageContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── hooks/              # Custom hooks (15+)
│   │   ├── lib/                # Utilities
│   │   │   └── trpc.ts         # tRPC client
│   │   ├── pages/              # Page components (90)
│   │   │   ├── Home.tsx
│   │   │   ├── sectors/        # 15 sector pages
│   │   │   ├── dashboards/     # Dashboard pages
│   │   │   ├── admin/          # Admin pages
│   │   │   └── research/       # Research portal
│   │   ├── App.tsx             # Router & layout
│   │   └── main.tsx            # Entry point
│   └── public/                 # Static assets
├── server/                     # Backend application
│   ├── _core/                  # Framework internals
│   │   ├── context.ts          # Request context
│   │   ├── trpc.ts             # tRPC setup
│   │   ├── llm.ts              # LLM integration
│   │   └── env.ts              # Environment config
│   ├── routers/                # tRPC routers (14)
│   │   ├── fxRouter.ts
│   │   ├── oneBrainRouter.ts
│   │   └── ...
│   ├── connectors/             # Data source connectors (26)
│   │   ├── worldBankConnector.ts
│   │   ├── imfConnector.ts
│   │   ├── fxRatesConnector.ts
│   │   └── ...
│   ├── services/               # Business logic
│   │   ├── publicationGate.ts
│   │   ├── reliabilityLab.ts
│   │   ├── goLiveGate.ts
│   │   └── ...
│   ├── governance/             # Truth layer & gates
│   │   ├── governing-laws.ts
│   │   └── truth-layer.ts
│   ├── hardening/              # Production readiness
│   │   ├── security.ts
│   │   └── productionReadiness.ts
│   ├── etl/                    # ETL pipeline framework
│   │   ├── pipeline-framework.ts
│   │   └── scheduler.ts
│   ├── db.ts                   # Database queries
│   ├── routers.ts              # Main router aggregation
│   └── *.test.ts               # Test files (380+)
├── drizzle/                    # Database schema
│   └── schema.ts               # 81 table definitions
├── shared/                     # Shared types/constants
├── docs/                       # Documentation (70+ files)
├── scripts/                    # Utility scripts
└── e2e/                        # Playwright E2E tests
```

---

## Database Schema (81 Tables)

### Core Data Tables

```sql
-- Time series data with regime support
time_series (
  id, indicator_id, date, value,
  regime_tag ENUM('IRG', 'DFA', 'UNIFIED'),
  confidence_score, source_id, vintage_date
)

-- Economic indicators catalog
economic_indicators (
  id, code, name_en, name_ar,
  sector, unit, frequency, methodology
)

-- Research publications
research_publications (
  id, title, title_ar, organization,
  publication_date, document_type, url, file_key
)
```

### Governance Tables

```sql
-- Provenance tracking
provenance_records (
  id, entity_type, entity_id, source_id,
  retrieval_timestamp, transformation_log, quality_score
)

-- Evidence sources
evidence_sources (
  id, name, organization, url,
  api_endpoint, update_frequency, reliability_tier
)
```

### FX Tracking Tables

```sql
-- Exchange rates with regime separation
fx_rates (
  id, date, regime_tag ENUM('IRG', 'DFA', 'PAR'),
  rate, source_id, vintage_date, provenance
)

-- FX source registry
fx_source_registry (
  id, source_code, name_en, name_ar,
  regime_tag, url, update_frequency
)
```

### Regime Tag System

All data entities include a `regime_tag` field:

| Value | Description |
|-------|-------------|
| `IRG` | IRG-controlled areas (Aden, southern governorates) |
| `DFA` | DFA-controlled areas (Sana'a, northern governorates) |
| `PAR` | Parallel market rates |
| `UNIFIED` | Data covering both areas |

---

## API Architecture

### tRPC Router Structure (14 Routers)

```typescript
appRouter
├── auth                    // Authentication & sessions
│   ├── me
│   └── logout
├── dashboard               // Homepage KPIs
│   ├── getStats
│   └── getHeroKPIs
├── indicators              // Economic indicators
│   ├── list
│   ├── getByCode
│   └── getTimeSeries
├── timeSeries              // Time series data
│   ├── getByIndicator
│   └── getLatest
├── research                // Research library
│   ├── getPublications
│   └── search
├── banking                 // Banking sector
│   ├── getBanks
│   └── getMetrics
├── sectors                 // Sector dashboards
│   └── getMetrics
├── oneBrain                // AI assistant
│   ├── chat
│   └── suggestQueries
├── truthLayer              // Evidence verification
│   ├── verify
│   └── getProvenance
├── fx                      // Exchange rates
│   ├── getRates
│   ├── getLatestRates
│   └── getChartData
├── dataInfra               // Data infrastructure
│   ├── getCoverage
│   └── runBackfill
├── scheduler               // Job scheduling
│   ├── getJobs
│   └── runJob
├── goLive                  // Release gates
│   ├── runAllGates
│   └── getStatus
└── admin                   // Administrative
    ├── getUsers
    └── getAuditLogs
```

---

## Governance Architecture

### Truth Layer

The Truth Layer ensures all data meets evidence standards:

```typescript
interface TruthLayerGates {
  evidenceRequired: boolean;      // Every claim needs evidence
  sourceVerification: boolean;    // Source must be registered
  confidenceThreshold: number;    // Minimum confidence score
  contradictionCheck: boolean;    // Check for conflicts
  freshnessRequired: boolean;     // Data must be current
}
```

### Publication Gate

Before any data is published, it must pass through 8 hard gates:

1. **Evidence Attached** - Every claim links to evidence
2. **Source Registered** - Source is in the registry
3. **Confidence Score** - Meets minimum threshold
4. **No Contradictions** - No conflicting data
5. **Data Freshness** - Data is current
6. **No Hallucination** - AI claims are verified
7. **Sanctions Compliance** - No restricted entities
8. **PII Removed** - No personal information

### Go-Live Gate

Production deployment requires passing all gates:

```typescript
interface GoLiveGateResult {
  passed: boolean;
  gates: {
    publicationGate: GateStatus;
    aiSafetyGates: GateStatus;
    reliabilityLab: GateStatus;
    hardeningTests: GateStatus;
    routeHealthChecks: GateStatus;
  };
  timestamp: Date;
}
```

---

## Data Pipeline Architecture

### ETL Framework

```
┌─────────────────────────────────────────────────────────────────┐
│                      ETL PIPELINE FRAMEWORK                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │  Source  │───▶│ Extract  │───▶│Transform │───▶│   Load   │  │
│  │Connectors│    │  Stage   │    │  Stage   │    │  Stage   │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│       │                                                │         │
│       │         ┌──────────────────────────┐          │         │
│       └────────▶│   Provenance Ledger      │◀─────────┘         │
│                 │   (Full Data Lineage)    │                    │
│                 └──────────────────────────┘                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Connectors (26)

| Category | Connectors |
|----------|------------|
| **International Financial** | World Bank WDI, IMF WEO, IMF IFS |
| **UN Agencies** | UNHCR, WFP, UNICEF, WHO, UNDP |
| **Humanitarian** | OCHA FTS, HDX, FEWS NET, ReliefWeb |
| **Central Banks** | CBY Aden, CBY Sana'a |
| **Sanctions** | OFAC, EU, UK Treasury |
| **Conflict** | ACLED, UCDP |

---

## Security Architecture

### Authentication Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  User   │────▶│  OAuth  │────▶│  Token  │────▶│   API   │
│ Browser │     │ Server  │     │  Verify │     │ Access  │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
```

### Security Layers

| Layer | Implementation |
|-------|----------------|
| **Transport** | HTTPS/TLS 1.3 |
| **Authentication** | OAuth 2.0 + JWT |
| **Authorization** | Role-based (RBAC) |
| **Input Validation** | Zod schemas |
| **Output Sanitization** | XSS prevention |
| **Rate Limiting** | Per-endpoint limits |
| **Audit Logging** | Full request logging |

---

## Frontend Architecture

### Context Providers

```tsx
<ThemeProvider defaultTheme="light">
  <LanguageProvider defaultLanguage="en">
    <TRPCProvider>
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </TRPCProvider>
  </LanguageProvider>
</ThemeProvider>
```

### RTL Support

The platform supports Right-to-Left (RTL) layout for Arabic:

```tsx
useEffect(() => {
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = language;
}, [language]);
```

---

## Performance Optimizations

### Caching Strategy

| Cache Level | TTL | Use Case |
|-------------|-----|----------|
| **Browser** | 1 hour | Static assets |
| **CDN** | 15 min | API responses |
| **Redis** | 5 min | Database queries |
| **In-Memory** | 1 min | Hot data |

### Database Optimization

- Indexed columns for common queries
- Partitioned time series tables by year
- Read replicas for analytics queries
- Connection pooling (max 20 connections)

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRODUCTION DEPLOYMENT                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                   │
│  │   CDN    │───▶│  Nginx   │───▶│  Node.js │                   │
│  │(Static)  │    │ (Proxy)  │    │  Server  │                   │
│  └──────────┘    └──────────┘    └──────────┘                   │
│                                        │                         │
│                       ┌────────────────┼────────────────┐       │
│                       │                │                │       │
│                       ▼                ▼                ▼       │
│                 ┌──────────┐    ┌──────────┐    ┌──────────┐   │
│                 │   TiDB   │    │    S3    │    │  Redis   │   │
│                 │(Primary) │    │(Storage) │    │ (Cache)  │   │
│                 └──────────┘    └──────────┘    └──────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Monitoring & Observability

### Key Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Response Time (p95) | < 200ms | > 500ms |
| Error Rate | < 0.1% | > 1% |
| Uptime | 99.9% | < 99.5% |
| Database Latency | < 10ms | > 50ms |

### Health Check Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/api/health` | Basic health check |
| `/api/health/db` | Database connectivity |
| `/api/health/services` | All services status |

---

*Last Updated: January 28, 2026*
