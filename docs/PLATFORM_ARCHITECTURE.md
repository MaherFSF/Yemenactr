# YETO Platform Architecture

## Evidence-First, 4-Layer Architecture

The YETO (Yemen Economic Transparency Observatory) platform is architected as a layered, evidence-first system designed for clarity, maintainability, and trust. This document describes the four architectural layers and their implementation.

---

## Layer 1: Data Layer

The Data Layer serves as the foundation for all raw and processed data storage. It implements a comprehensive data model supporting multiple frequencies, geographic levels, and regime contexts.

### Storage Components

**Relational Database (MySQL/TiDB)**

The platform uses MySQL-compatible TiDB for structured data with the following key characteristics:

| Component | Implementation | Purpose |
|-----------|---------------|---------|
| Time Series | `time_series` table | Economic indicators with regime tags |
| Geospatial | `geospatial_data` table | Location-based data with coordinates |
| Documents | `research_publications` table | Reports, circulars, publications |
| Events | `economic_events` table | Historical timeline events |
| Entities | `commercial_banks`, `entities` tables | Organizations and institutions |

**Object Storage (AWS S3)**

Large files and documents are stored in S3 with metadata tracked in the database:

| Content Type | Storage Location | Metadata Table |
|--------------|------------------|----------------|
| PDF Documents | `s3://yeto-documents/` | `research_publications` |
| Images | `s3://yeto-images/` | `timeline_images` |
| Raw Data Files | `s3://yeto-raw-data/` | `data_sources` |
| Export Archives | `s3://yeto-exports/` | `export_logs` |

### Data Model Features

**Multi-Frequency Support**

The schema supports annual, quarterly, monthly, weekly, and daily data through the `frequency` field in indicator definitions:

```typescript
export const indicatorDefinitions = mysqlTable("indicator_definitions", {
  frequency: mysqlEnum("frequency", ["annual", "quarterly", "monthly", "weekly", "daily"]),
  // ...
});
```

**Geographic Levels**

Data supports national, subnational, and multi-regime contexts:

```typescript
export const timeSeries = mysqlTable("time_series", {
  regimeTag: mysqlEnum("regimeTag", ["aden_irg", "sanaa_defacto", "mixed", "unknown"]),
  // ...
});

export const geospatialData = mysqlTable("geospatial_data", {
  governorate: varchar("governorate", { length: 100 }),
  district: varchar("district", { length: 100 }),
  // ...
});
```

**Version/Vintage Tracking**

The `data_vintages` table tracks what was known at each point in time:

```typescript
export const dataVintages = mysqlTable("data_vintages", {
  dataPointId: int("dataPointId"),
  vintageDate: timestamp("vintageDate"),
  value: decimal("value"),
  supersededBy: int("supersededBy"),
  // ...
});
```

### Key Tables (101 Total)

| Category | Tables | Purpose |
|----------|--------|---------|
| Core Data | `time_series`, `geospatial_data`, `economic_events` | Primary economic data |
| Sources | `sources`, `datasets`, `data_sources` | Data provenance |
| Documents | `research_publications`, `cby_directives` | Document repository |
| Entities | `commercial_banks`, `entities`, `stakeholders` | Organization profiles |
| Users | `users`, `user_subscriptions`, `api_access_logs` | Access management |
| AI/ML | `ai_query_logs`, `insight_proposals`, `scenario_runs` | AI operations |

---

## Layer 2: Provenance & Trust Layer

This layer implements the core trust infrastructure ensuring every data point can be traced to its source, with full transparency about quality and conflicts.

### Provenance Ledger

The `provenance_ledger_full` table implements W3C PROV concepts:

```typescript
export const provenanceLedgerFull = mysqlTable("provenance_ledger_full", {
  entityType: varchar("entityType"),      // What type of data
  entityId: int("entityId"),              // Which record
  activity: varchar("activity"),          // What happened (ingest, transform, correct)
  agentType: varchar("agentType"),        // Who did it (system, user, partner)
  agentId: varchar("agentId"),            // Specific agent identifier
  wasGeneratedBy: text("wasGeneratedBy"), // Generation context
  wasDerivedFrom: text("wasDerivedFrom"), // Source lineage
  wasAttributedTo: text("wasAttributedTo"), // Attribution chain
  timestamp: timestamp("timestamp"),
  metadata: json("metadata"),
});
```

### Confidence Scoring System

Every data point receives a confidence rating (A-D):

| Rating | Meaning | Criteria |
|--------|---------|----------|
| A | High Confidence | Official source, verified, recent |
| B | Good Confidence | Reliable source, minor gaps |
| C | Moderate Confidence | Secondary source, some uncertainty |
| D | Low Confidence | Unverified, significant gaps |

Implementation in `confidence_ratings` table:

```typescript
export const confidenceRatings = mysqlTable("confidence_ratings", {
  entityType: varchar("entityType"),
  entityId: int("entityId"),
  rating: mysqlEnum("rating", ["A", "B", "C", "D"]),
  methodology: text("methodology"),
  factors: json("factors"),
  calculatedAt: timestamp("calculatedAt"),
});
```

### Contradiction Detection

The `data_contradictions` table flags conflicting data:

```typescript
export const dataContradictions = mysqlTable("data_contradictions", {
  primaryEntityType: varchar("primaryEntityType"),
  primaryEntityId: int("primaryEntityId"),
  conflictingEntityType: varchar("conflictingEntityType"),
  conflictingEntityId: int("conflictingEntityId"),
  contradictionType: varchar("contradictionType"),
  severity: mysqlEnum("severity", ["minor", "moderate", "major", "critical"]),
  resolution: text("resolution"),
  resolvedAt: timestamp("resolvedAt"),
});
```

### Correction Workflow

The `corrections` table tracks all data corrections:

```typescript
export const corrections = mysqlTable("corrections", {
  entityType: varchar("entityType"),
  entityId: int("entityId"),
  fieldName: varchar("fieldName"),
  oldValue: text("oldValue"),
  newValue: text("newValue"),
  reason: text("reason"),
  submittedBy: int("submittedBy"),
  approvedBy: int("approvedBy"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]),
});
```

### Rule Implementation (R1-R3, R9)

| Rule | Implementation |
|------|---------------|
| R1: Source Attribution | Every record has `sourceId` FK to `sources` table |
| R2: No Fabrication | Missing data returns "Not available yet" via `isDataAvailable` checks |
| R3: Regime Separation | `regimeTag` enforced on all time series data |
| R9: Correction Transparency | All corrections logged in `corrections` table with full audit trail |

---

## Layer 3: Reasoning & AI Layer

The Reasoning & AI Layer provides analytical capabilities including change detection, forecasting, scenario simulation, and AI-powered narrative generation.

### Change Detection Module

The `signal_detection` system monitors for anomalies:

```typescript
// Signal detection runs every 4 hours
export const signalDetectionJob = {
  name: "signal_detection",
  cronExpression: "0 0 */4 * * *",
  handler: async () => {
    // Detect sudden changes in key indicators
    // Flag anomalies for review
    // Generate alerts for significant deviations
  }
};
```

Detection thresholds:

| Indicator Type | Minor Change | Major Change | Critical Change |
|----------------|--------------|--------------|-----------------|
| Exchange Rate | >2% daily | >5% daily | >10% daily |
| Inflation | >1% monthly | >3% monthly | >5% monthly |
| Trade Volume | >10% quarterly | >25% quarterly | >50% quarterly |

### Forecasting/Nowcasting

The scenario simulator provides forecasting capabilities:

```typescript
export const scenarioRuns = mysqlTable("scenario_runs", {
  userId: int("userId"),
  scenarioType: varchar("scenarioType"),
  parameters: json("parameters"),
  results: json("results"),
  confidenceInterval: decimal("confidenceInterval"),
  methodology: text("methodology"),
  createdAt: timestamp("createdAt"),
});
```

Supported forecast models:

| Model | Indicators | Horizon |
|-------|------------|---------|
| ARIMA | Exchange rates, inflation | 3-12 months |
| VAR | GDP components, trade | 1-4 quarters |
| ML Ensemble | Multi-indicator | 6-24 months |

### AI Assistant (One Brain Enhanced)

The AI assistant uses RAG (Retrieval-Augmented Generation) with evidence packs:

```typescript
// server/ai/oneBrainEnhanced.ts
export async function processQuery(query: string, language: string) {
  // 1. Retrieve relevant data from database
  const relevantData = await retrieveRelevantData(query);
  
  // 2. Build context with evidence
  const context = buildEvidenceContext(relevantData);
  
  // 3. Generate response with LLM
  const response = await invokeLLM({
    messages: [
      { role: "system", content: YEMEN_EXPERT_PROMPT },
      { role: "user", content: `Context: ${context}\n\nQuery: ${query}` }
    ]
  });
  
  // 4. Attach evidence pack
  return {
    response: response.content,
    evidencePack: generateEvidencePack(relevantData),
    confidence: calculateConfidence(relevantData)
  };
}
```

### Narrative Generation

Auto-generated reports use structured templates:

```typescript
export const reportTemplates = mysqlTable("report_templates", {
  name: varchar("name"),
  templateType: mysqlEnum("templateType", ["monthly_pulse", "quarterly_outlook", "annual_review"]),
  structure: json("structure"),
  dataQueries: json("dataQueries"),
  narrativePrompts: json("narrativePrompts"),
});
```

### Semantic Search

For large context handling, the platform uses semantic search:

```typescript
// Vector embeddings for document search
export const documentEmbeddings = mysqlTable("document_embeddings", {
  documentId: int("documentId"),
  chunkIndex: int("chunkIndex"),
  embedding: json("embedding"), // 1536-dimensional vector
  chunkText: text("chunkText"),
});
```

---

## Layer 4: Delivery Layer

The Delivery Layer provides user-facing components with role-based access, interactive visualizations, and comprehensive export capabilities.

### Role-Based Access Control

| Role | Access Level | Features |
|------|--------------|----------|
| Public | Read-only | Homepage, basic dashboard, public data |
| Registered | Enhanced | Full dashboard, data downloads, AI assistant |
| Pro | Premium | API access, custom reports, scenario simulator |
| Institutional | Enterprise | Bulk exports, priority support, white-label |
| Admin | Full | All features + admin console |

Implementation:

```typescript
export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
  return next({ ctx });
});
```

### Public API

The tRPC-based API provides typed endpoints:

| Endpoint Category | Examples |
|-------------------|----------|
| Data Access | `timeSeries.get`, `indicators.list`, `events.query` |
| Analytics | `analytics.sectorStats`, `analytics.regimeComparison` |
| AI | `ai.chat`, `ai.generateReport` |
| Admin | `admin.ingestion`, `admin.scheduler`, `admin.users` |

### Visualization Components

| Component | Chart Types | Features |
|-----------|-------------|----------|
| `TimeSeriesChart` | Line, Area, Bar | Regime comparison, annotations |
| `MapVisualization` | Choropleth, Points | Governorate-level data |
| `SankeyDiagram` | Flow | Trade flows, aid distribution |
| `NetworkGraph` | Force-directed | Entity relationships |
| `HeatmapChart` | Matrix | Correlation, coverage |

### Export Pipeline

| Format | Implementation | Use Case |
|--------|---------------|----------|
| CSV | `exportToCSV()` | Data analysis |
| JSON | `exportToJSON()` | API integration |
| XLSX | `exportToXLSX()` | Spreadsheet analysis |
| PDF | `generatePDF()` | Reports, sharing |
| PNG/SVG | `exportChart()` | Presentations |

### Bilingual Interface

Full Arabic (RTL) and English (LTR) support:

```typescript
// Language context
const { language, setLanguage } = useLanguage();

// RTL-aware styling
<div dir={language === 'ar' ? 'rtl' : 'ltr'}>
  {t('dashboard.title')}
</div>
```

### Notification System

```typescript
export const notificationSettings = mysqlTable("notification_settings", {
  userId: int("userId"),
  alertTypes: json("alertTypes"),
  frequency: mysqlEnum("frequency", ["immediate", "daily", "weekly"]),
  channels: json("channels"), // email, in-app, webhook
});
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        LAYER 4: DELIVERY                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │  Dashboards  │ │ Visualizations│ │  AI Chat    │ │  Public API  │   │
│  │  (Role-based)│ │  (Charts/Maps)│ │  Interface  │ │  (tRPC)      │   │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ Report Gen   │ │ Notifications │ │ Admin Portal│ │ Partner Portal│  │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │
├─────────────────────────────────────────────────────────────────────────┤
│                     LAYER 3: REASONING & AI                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │   Change     │ │  Forecasting │ │   Scenario   │ │  Narrative   │   │
│  │  Detection   │ │  Nowcasting  │ │  Simulation  │ │  Generation  │   │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                    │
│  │   Semantic   │ │  LLM Service │ │   Evidence   │                    │
│  │   Search     │ │  (OpenAI)    │ │   Linking    │                    │
│  └──────────────┘ └──────────────┘ └──────────────┘                    │
├─────────────────────────────────────────────────────────────────────────┤
│                   LAYER 2: PROVENANCE & TRUST                            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │  Provenance  │ │  Confidence  │ │ Contradiction│ │  Correction  │   │
│  │   Ledger     │ │   Scoring    │ │  Detection   │ │   Workflow   │   │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                    │
│  │   Version    │ │   Public     │ │   Audit      │                    │
│  │   History    │ │  Changelog   │ │    Logs      │                    │
│  └──────────────┘ └──────────────┘ └──────────────┘                    │
├─────────────────────────────────────────────────────────────────────────┤
│                        LAYER 1: DATA                                     │
│  ┌─────────────────────────────────┐ ┌─────────────────────────────────┐│
│  │     RELATIONAL (MySQL/TiDB)     │ │      OBJECT STORAGE (S3)        ││
│  │  ┌───────────┐ ┌───────────┐   │ │  ┌───────────┐ ┌───────────┐   ││
│  │  │Time Series│ │ Geospatial│   │ │  │ Documents │ │  Images   │   ││
│  │  └───────────┘ └───────────┘   │ │  └───────────┘ └───────────┘   ││
│  │  ┌───────────┐ ┌───────────┐   │ │  ┌───────────┐ ┌───────────┐   ││
│  │  │  Events   │ │  Entities │   │ │  │ Raw Data  │ │  Exports  │   ││
│  │  └───────────┘ └───────────┘   │ │  └───────────┘ └───────────┘   ││
│  │  ┌───────────┐ ┌───────────┐   │ │                                 ││
│  │  │  Sources  │ │   Users   │   │ │                                 ││
│  │  └───────────┘ └───────────┘   │ │                                 ││
│  └─────────────────────────────────┘ └─────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Status

| Layer | Component | Status | Tables/Files |
|-------|-----------|--------|--------------|
| Data | Time Series | ✅ Complete | `time_series`, `indicator_definitions` |
| Data | Geospatial | ✅ Complete | `geospatial_data` |
| Data | Documents | ✅ Complete | `research_publications`, `cby_directives` |
| Data | Events | ✅ Complete | `economic_events` |
| Data | Entities | ✅ Complete | `commercial_banks`, `entities`, `stakeholders` |
| Data | S3 Storage | ✅ Complete | `server/storage.ts` |
| Provenance | Ledger | ✅ Complete | `provenance_ledger_full` |
| Provenance | Confidence | ✅ Complete | `confidence_ratings` |
| Provenance | Contradictions | ✅ Complete | `data_contradictions` |
| Provenance | Corrections | ✅ Complete | `corrections` |
| Provenance | Vintages | ✅ Complete | `data_vintages` |
| Reasoning | Change Detection | ✅ Complete | `signal_detection` job |
| Reasoning | Forecasting | ✅ Complete | `scenario_runs` |
| Reasoning | AI Assistant | ✅ Complete | `server/ai/oneBrainEnhanced.ts` |
| Reasoning | Narrative Gen | ✅ Complete | `report_templates` |
| Delivery | Dashboards | ✅ Complete | 17 sector pages |
| Delivery | Visualizations | ✅ Complete | Chart components |
| Delivery | API | ✅ Complete | tRPC routers |
| Delivery | Exports | ✅ Complete | CSV, JSON, PDF |
| Delivery | Bilingual | ✅ Complete | AR/EN with RTL |

---

## Security Considerations

The architecture implements defense-in-depth security:

| Layer | Security Measure |
|-------|-----------------|
| Data | Encrypted at rest, parameterized queries |
| Provenance | Immutable audit logs, signed records |
| Reasoning | Rate limiting, input validation |
| Delivery | JWT authentication, RBAC, CORS |

---

## Scalability

The architecture supports horizontal scaling:

| Component | Scaling Strategy |
|-----------|-----------------|
| Database | TiDB horizontal sharding |
| S3 | Automatic scaling |
| API | Stateless, load-balanced |
| AI | Queue-based processing |

---

*Document Version: 1.0*
*Last Updated: January 14, 2026*
