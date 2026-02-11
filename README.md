<p align="center">
  <img src="client/public/yeto-logo.svg" alt="YETO Logo" width="120" height="120">
</p>

<h1 align="center">YETO — Yemen Economic Transparency Observatory</h1>

<p align="center">
  <strong>مرصد الشفافية الاقتصادية اليمني</strong><br>
  <em>The First Comprehensive Economic Intelligence Platform for Yemen</em>
</p>

<p align="center">
  <a href="https://yeto.causewaygrp.com"><img src="https://img.shields.io/badge/🌐_Production-yeto.causewaygrp.com-107040?style=for-the-badge" alt="Production"></a>
  <a href="https://yteocauseway.manus.space"><img src="https://img.shields.io/badge/🔬_Preview-manus.space-103050?style=for-the-badge" alt="Preview"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Tests-750%2B_Passing-brightgreen?style=flat-square" alt="Tests">
  <img src="https://img.shields.io/badge/Data_Points-5%2C500%2B-blue?style=flat-square" alt="Data Points">
  <img src="https://img.shields.io/badge/Sources-292_(234_Active)-orange?style=flat-square" alt="Sources">
  <img src="https://img.shields.io/badge/Tier_Classification-59%25_Complete-blue?style=flat-square" alt="Tier Classification">
  <img src="https://img.shields.io/badge/Release_Gate-✅_PASSING-brightgreen?style=flat-square" alt="Release Gate">
  <img src="https://img.shields.io/badge/License-Proprietary-C0A030?style=flat-square" alt="License">
</p>

<p align="center">
  <a href="#-the-challenge">Challenge</a> •
  <a href="#-what-yeto-does">Solution</a> •
  <a href="#-who-we-serve">Audience</a> •
  <a href="#-data-coverage">Data</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-getting-started">Quick Start</a> •
  <a href="#-documentation">Docs</a>
</p>

---

## 🌍 The Challenge

> *"In Yemen, the truth is the first casualty of conflict. Economic data is fragmented, politicized, and often fabricated. Decision-makers—from humanitarian organizations to international institutions—operate in an information vacuum."*

Yemen represents one of the world's most complex economic environments:

| Challenge | Reality |
|-----------|---------|
| **Split Monetary Authority** | Since August 2016, two Central Banks operate independently in Aden (IRG) and Sana'a (DFA), each with different exchange rates, monetary policies, and fiscal realities |
| **Data Fragmentation** | Economic statistics are scattered across 292+ international sources, each with different methodologies, update frequencies, and political biases |
| **Information Warfare** | Conflicting narratives make it nearly impossible to establish ground truth |
| **Humanitarian Crisis** | 21.6 million people need assistance, but aid allocation decisions rely on incomplete or outdated data |

**YETO exists to solve this problem.**

---

## 💡 What YETO Does

YETO is not just a data portal—it is an **Economic Intelligence Platform** that transforms fragmented information into actionable, evidence-backed insights.

### The Trust Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        YETO TRUST ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│   │   47+ Data  │───▶│  Ingestion  │───▶│  Provenance │                 │
│   │   Sources   │    │   Pipeline  │    │   Ledger    │                 │
│   └─────────────┘    └─────────────┘    └─────────────┘                 │
│                                                │                         │
│                                                ▼                         │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│   │   Truth     │◀───│  Evidence   │◀───│  Confidence │                 │
│   │   Layer     │    │   Tribunal  │    │   Scoring   │                 │
│   └─────────────┘    └─────────────┘    └─────────────┘                 │
│         │                                                                │
│         ▼                                                                │
│   ┌─────────────────────────────────────────────────────────────┐       │
│   │                 USER-FACING INTELLIGENCE                     │       │
│   │   • Dashboards  • AI Assistant  • Reports  • Exports  • API │       │
│   └─────────────────────────────────────────────────────────────┘       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Core Capabilities

| Capability | Description | Technology |
|------------|-------------|------------|
| **Evidence-Packed Data** | Every number links to its source, methodology, and confidence level | Provenance Ledger |
| **Dual-Regime Tracking** | Separate tracking for Aden (IRG) and Sana'a (DFA) economies | Regime Tags |
| **AI Economic Analyst** | "One Brain" intelligence system with zero-fabrication guarantee | LLM + RAG + Truth Layer |
| **Real-Time Ingestion** | Automated data pipelines from 292 sources with freshness tracking | ETL Scheduler |
| **Source Trust Hardening** | Deterministic tier classification (T0-T4) with allowedUse enforcement | Bulk Classification Engine |
| **Transparency Panels** | "Sources Used" panels on every page showing evidence provenance | SourcesUsedPanel |
| **Bilingual Interface** | Full Arabic (RTL) and English support | i18n Framework |
| **Export Everything** | CSV, JSON, XLSX, PDF exports with provenance metadata | Export Engine |

### The "One Brain" AI System

YETO's AI assistant operates under strict governance rules:

1. **Zero Fabrication**: Every claim must link to evidence
2. **Confidence Scoring**: A-D grades with transparent methodology
3. **Contradiction Detection**: Identifies discrepancies between sources
4. **Data Gap Tickets**: Auto-creates tickets when data is missing
5. **Role-Aware Intelligence**: 7 specialized modes for different user types

---

## 🎯 Who We Serve

### Primary Audiences

| Audience | Use Case | Key Features |
|----------|----------|--------------|
| **International Organizations** | Policy analysis, funding allocation, program design | Evidence packs, regime comparison, trend analysis |
| **Central Bank Officials** | Monetary policy research, cross-regime analysis | FX tracking, banking sector data, regulatory intelligence |
| **Humanitarian Agencies** | Needs assessment, resource allocation | Food security data, aid flow tracking, IPC classifications |
| **Academic Researchers** | Economic studies, conflict economics research | Full data export, methodology documentation, citation support |
| **Journalists & Media** | Fact-checking, investigative reporting | Source verification, historical data, correction tracking |
| **Private Sector** | Market intelligence, risk assessment | Sanctions monitoring, banking data, investment climate |

### Access Tiers

| Tier | Access | Features |
|------|--------|----------|
| **Public** | Free | Core dashboards, basic exports, AI assistant (limited) |
| **Registered** | Free (account) | Full exports, saved searches, email alerts |
| **Professional** | Subscription | API access, bulk exports, priority support |
| **Institutional** | Enterprise | Custom integrations, dedicated support, SLA |

---

## 📊 Data Coverage

### Economic Sectors (15 Domains)

<table>
<tr>
<td width="33%" valign="top">

**Macroeconomic**
- GDP & Growth
- Inflation & Prices
- Currency & FX Rates
- Public Finance
- Trade & Balance of Payments

</td>
<td width="33%" valign="top">

**Sectoral**
- Banking & Finance
- Energy & Fuel
- Agriculture
- Labor Market
- Infrastructure

</td>
<td width="33%" valign="top">

**Humanitarian**
- Food Security
- Aid Flows
- Conflict Economy
- Poverty & Welfare
- Investment Climate

</td>
</tr>
</table>

| **Data Sources (225+ Integrated)**| Category | Sources | Update Frequency |
|----------|---------|------------------|
| **International Financial** | World Bank WDI, IMF WEO, IFS | Monthly/Quarterly |
| **UN Agencies** | OCHA FTS, UNHCR, WFP, UNICEF, WHO | Weekly/Monthly |
| **Humanitarian** | HDX, FEWS NET, IPC, ReliefWeb | Daily/Weekly |
| **Central Banks** | CBY Aden, CBY Sana'a | Weekly |
| **Sanctions** | OFAC, EU, UK Treasury | Daily |
| **Conflict Data** | ACLED, UCDP | Weekly |

### Historical Coverage

| Metric | Coverage |
|--------|----------|
| **Time Series** | 2010 → Present (15+ years, 5,513 data points) |
| **Exchange Rates** | Daily granularity since 2016 split |
| **Economic Events** | 83+ documented with indicator linkages |
| **Research Library** | 370+ publications from 38 organizations |
| **Sector Pages** | 16 sectors with Sources Used panels |
| **Commercial Banks** | 31 banks with $18.7B total assets |

---

## 🏗️ Architecture

### Technology Stack

```
Frontend                    Backend                     Data Layer
─────────────────────────────────────────────────────────────────────
React 19 + TypeScript       Express 4 + tRPC 11        TiDB (MySQL)
Tailwind CSS 4              Node.js 22                 S3 Storage
Recharts + D3.js            Drizzle ORM                Redis Cache
Wouter (Routing)            Vitest (380+ tests)        
shadcn/ui Components        Playwright (E2E)           
```

### Database Schema (81 Tables)

```
Core Data                   Governance                  Operations
─────────────────────────────────────────────────────────────────────
time_series                 provenance_records          ingestion_runs
economic_indicators         evidence_sources            scheduler_jobs
research_publications       confidence_scores           data_gap_tickets
commercial_banks            correction_requests         api_access_logs
economic_events             audit_logs                  notification_queue
fx_rates                    fx_source_registry          fx_gap_tickets
```

### Key Technical Features

| Feature | Implementation | Purpose |
|---------|----------------|---------|
| **Type Safety** | End-to-end TypeScript with tRPC | Zero runtime type errors |
| **Evidence Tracking** | Provenance ledger with source IDs | Every number is traceable |
| **Dual-Regime Support** | `regime_tag` on all time series | Aden/Sana'a separation |
| **AI Safety** | Truth Layer + Evidence Tribunal | Zero fabrication guarantee |
| **Bilingual** | i18n with RTL support | Full Arabic experience |
| **Export Pipeline** | CSV/JSON/XLSX/PDF with metadata | Data portability |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 22+
- pnpm 9+
- MySQL 8+ or TiDB

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Causeway-banking-financial/yeto.git
cd yeto

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Push database schema
pnpm db:push

# Seed initial data
pnpm db:seed

# Start development server
pnpm dev
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | MySQL/TiDB connection string | Yes |
| `JWT_SECRET` | Session signing secret | Yes |
| `VITE_APP_ID` | OAuth application ID | Yes |
| `S3_BUCKET` | S3 bucket for file storage | Yes |
| `BUILT_IN_FORGE_API_KEY` | LLM API key | Yes |

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm test         # Run unit tests (432+ tests)
pnpm test:e2e     # Run E2E tests
pnpm typecheck    # TypeScript type checking
pnpm lint         # ESLint code linting
pnpm db:push      # Push schema to database
pnpm db:studio    # Open Drizzle Studio
```

---

## 📁 Project Structure

```
yeto/
├── client/                 # Frontend React 19 application
│   ├── src/
│   │   ├── main.tsx        # ENTRY: tRPC client + React Query setup
│   │   ├── App.tsx         # ENTRY: Router (100+ routes) + contexts
│   │   ├── components/     # Reusable UI components (114)
│   │   ├── pages/          # Page components (90)
│   │   │   └── sectors/    # 16 sector pages
│   │   ├── contexts/       # LanguageContext, ThemeContext
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/trpc.ts     # tRPC client definition
│   └── public/             # Static assets
├── server/                 # Backend Express + tRPC
│   ├── _core/
│   │   └── index.ts        # ENTRY: Server startup, tRPC mount, scheduler
│   ├── routers/            # tRPC routers (30+)
│   ├── routers.ts          # appRouter — combines all sub-routers
│   ├── connectors/         # Data source connectors (26)
│   │   └── index.ts        # Connector registry + factory
│   ├── services/           # Business logic services (81)
│   ├── pipeline/
│   │   └── sourceRegistry.ts  # DB-backed source config (loads from source_registry)
│   ├── governance/         # Truth layer and evidence gates
│   ├── ai/                 # OneBrain AI system
│   ├── hardening/          # Security and production readiness
│   └── db.ts               # Database connection
├── drizzle/
│   ├── schema.ts           # CANONICAL: All 81+ tables (source_registry at line ~7412)
│   ├── relations.ts        # Table relationships
│   └── phase1-enhancements.ts  # Calendar, agents, evidence (re-exports sourceRegistry from schema.ts)
├── data/
│   └── registry/           # Source data files
│       └── *.xlsx          # Canonical source xlsx (SINGLE SOURCE OF TRUTH)
├── scripts/
│   └── import-registry.ts  # CANONICAL: xlsx → source_registry DB importer
├── archive/                # Deprecated files preserved for reference
│   ├── README.md           # Index of all archived files and why
│   ├── deprecated-xlsx/    # Old v2.0, v2.3, v2.5 xlsx files
│   ├── deprecated-scripts/ # Old import/seed scripts (6 files)
│   └── deprecated-source-defs/  # Old CSV, JSON source configs
├── shared/                 # Shared types and constants
├── docs/                   # Documentation (70+ files)
└── e2e/                    # Playwright E2E tests
```

---

## 🗄️ Source Data Architecture

### Single Source of Truth

All source data flows from ONE canonical path:

```
data/registry/YETO_Sources_Universe_Master_*.xlsx   (Canonical Excel)
        │
        ▼
scripts/import-registry.ts                          (Canonical importer)
        │
        ▼
source_registry table (292+ rows, 40+ columns)      (Database)
        │
        ├──▶ server/pipeline/sourceRegistry.ts       (Pipeline config — loads from DB)
        ├──▶ server/connectors/registry-loader.ts    (Connector config — loads from DB)
        ├──▶ server/routers/sourceRegistry.ts        (tRPC API)
        └──▶ client/src/pages/                       (Display via tRPC)
```

**Previously**, source data was scattered across 12+ files with conflicting formats.
This was cleaned up in Phase 0 (Feb 2026). See `archive/README.md` for details.

### Database Schema: Source Tables

After Phase 1 unification, ALL foreign keys point to the canonical `source_registry` table:

| Table | Purpose | Status |
|-------|---------|--------|
| `source_registry` | **CANONICAL** — 292+ sources with tiers, access methods, sectors | Active, all FKs point here |
| `sources` | Legacy 7-row table (deprecated) | Deprecated — all FKs migrated to source_registry |
| `evidence_sources` | Legacy truth-layer source list (deprecated) | Deprecated — all FKs migrated to source_registry |

**Phase 1 Migration**: 20 FK references from `sources` and 5 FK references from `evidence_sources` were unified to point to `source_registry`. All connectors, services, and seed scripts updated.

### Importing Sources

```bash
# Import from the canonical xlsx (auto-detects latest file in data/registry/)
npx tsx scripts/import-registry.ts

# Import from a specific file
npx tsx scripts/import-registry.ts --file path/to/custom.xlsx
```

### Source Tiers

| Tier | Description | Count |
|------|-------------|-------|
| T0 | Yemen government primary sources | 16 |
| T1 | International organizations (World Bank, IMF, UN) | 117 |
| T2 | Academic and research institutions | 22 |
| T3 | Media and monitoring organizations | 18 |
| T4 | Informal / unverified | — |
| UNKNOWN | Needs classification | 119 |

---

## 🔧 Developer Guide — Code Flow

### Server Startup

```
server/_core/index.ts
  1. Creates Express app (JSON body parser, 50MB limit)
  2. Registers OAuth routes at /api/login, /api/callback
  3. Mounts tRPC middleware at /api/trpc → server/routers.ts (appRouter)
  4. Sets up Vite (dev) or static file serving (prod)
  5. Initializes scheduler → runDueJobs() every 5 min
  6. Listens on port 3000 (auto-increments if busy)
```

### Frontend Data Flow

```
client/src/main.tsx
  → tRPC client (httpBatchLink → /api/trpc)
  → React Query (auto 401 redirect)
  → App.tsx (ThemeProvider → LanguageProvider → Router)
       → 100+ routes using Wouter
       → Each page uses trpc.xxx.useQuery() for data
```

### Connector Ingestion Flow

```
server/connectors/index.ts
  → WorldBankConnector.fetchAllIndicators()
    → Look up source in source_registry (or insert with CONN-* sourceId)
    → normalize() → canonical NormalizedSeries
    → validate() → QA report
    → load() → write to database (sourceId → source_registry.id)
  → HDXConnector, OCHAFTSConnector, etc. (same pattern)
```

### Phase 0 Cleanup (Feb 2026)

| What | Before | After |
|------|--------|-------|
| Source xlsx files | 5 copies (v2.0, v2.3 x3, v2.5) | 1 canonical in data/registry/ |
| Import scripts | 7 different scripts | 1 canonical: scripts/import-registry.ts |
| Source data files | JSON, CSV, hardcoded arrays | All from DB (source_registry table) |
| Pipeline config | Hardcoded 12-source array | Loads from DB at startup |
| Connector config | 226-source JSON file | Loads from DB at startup |
| Schema duplication | sourceRegistry in 2 files | 1 definition in schema.ts, re-exported |

### Phase 1: Unify Source Tables (Feb 2026)

| What | Before | After |
|------|--------|-------|
| FK references | 20 FKs → `sources`, 5 FKs → `evidence_sources` | All 25 FKs → `source_registry` |
| Schema FKs | `datasets`, `timeSeries`, `geospatialData`, etc. → `sources.id` | All → `sourceRegistry.id` |
| Evidence FKs | `evidenceDocuments`, `evidenceDatasets`, `ingestionRuns`, etc. → `evidenceSources.id` | All → `sourceRegistry.id` |
| Seed script | Inserts 7 rows into legacy `sources` table | Inserts into `source_registry` with proper tiers |
| Connectors | Query `sources` by publisher, insert if missing | Query `sourceRegistry` by name, insert with full metadata |
| Services | `db.ts`, `accuracyChecker.ts`, etc. use `sources` | All use `sourceRegistry` |
| Legacy tables | `sources`, `evidence_sources` actively used | Deprecated with `@deprecated` markers |

---

## 📖 Documentation

### Essential Reading

| Document | Description |
|----------|-------------|
| [**START_HERE.md**](./START_HERE.md) | Quick start guide for operators |
| [**ARCHITECTURE.md**](./ARCHITECTURE.md) | System design and technical decisions |
| [**docs/OPERATIONS.md**](./docs/OPERATIONS.md) | Deployment and operations guide |
| [**docs/API.md**](./docs/api-endpoints-reference.md) | API endpoint reference |

### Governance & Methodology

| Document | Description |
|----------|-------------|
| [**docs/DATA_GOVERNANCE.md**](./docs/DATA_GOVERNANCE.md) | Data quality and provenance policies |
| [**docs/METHODOLOGY.md**](./docs/METHODOLOGY.md) | Data collection and processing methods |
| [**docs/CONFIDENCE_SCORING.md**](./docs/CONFIDENCE_SCORING.md) | How we rate data reliability |
| [**docs/CORRECTIONS_POLICY.md**](./docs/CORRECTIONS_POLICY.md) | Error handling and corrections |

### Technical Reference

| Document | Description |
|----------|-------------|
| [**docs/DATA_SOURCE_REGISTER.md**](./docs/DATA_SOURCE_REGISTER.md) | All 47+ data sources |
| [**docs/INVENTORY_RUNTIME_WIRING.md**](./docs/INVENTORY_RUNTIME_WIRING.md) | System wiring audit |
| [**docs/SECURITY.md**](./docs/SECURITY.md) | Security policies and practices |
| [**CONTRIBUTING.md**](./CONTRIBUTING.md) | Development guidelines |

---

## 🔒 Security & Compliance

### Security Measures

- **Authentication**: OAuth 2.0 with JWT sessions
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: Encrypted at rest and in transit
- **Audit Logging**: Full audit trail for all data access
- **Sanctions Compliance**: Real-time OFAC/EU/UK screening

### Responsible Disclosure

Security issues should be reported to: **security@causewaygrp.com**

---

## 🤝 Contributing

We welcome contributions from the community. Please read our [Contributing Guidelines](./CONTRIBUTING.md) before submitting pull requests.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`pnpm test`)
5. Commit with conventional commits (`git commit -m 'feat: add amazing feature'`)
6. Push to your fork (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## 📜 License

This project is proprietary software owned by [Causeway Group](https://causewaygrp.com). All rights reserved.

For licensing inquiries, contact: **legal@causewaygrp.com**

---

## 📞 Contact

| Purpose | Contact |
|---------|---------|
| **General Inquiries** | yeto@causewaygrp.com |
| **Technical Support** | support@causewaygrp.com |
| **Security Issues** | security@causewaygrp.com |
| **Partnership** | partnerships@causewaygrp.com |

---

<p align="center">
  <strong>Built with ❤️ by <a href="https://causewaygrp.com">Causeway Group</a></strong><br>
  <em>Bringing transparency to Yemen's economy, one data point at a time.</em>
</p>

<p align="center">
  <a href="https://causewaygrp.com"><img src="https://img.shields.io/badge/Causeway-Group-103050?style=for-the-badge" alt="Causeway Group"></a>
</p>


---

## 🚦 Release Gate

Before any deployment, the platform must pass all 8 release gates:

```bash
node scripts/release-gate.mjs
```

| Gate | Threshold | Current |
|------|-----------|---------|
| Source Registry Count | ≥ 250 | ✅ 292 |
| Active Sources | ≥ 150 | ✅ 234 |
| Sector Codebook | = 16 | ✅ 16 |
| Unknown Tier % | ≤ 70% | ✅ 40.8% |
| Mapped Sources % | ≥ 50% | ✅ 100% |
| No Duplicate IDs | = 0 | ✅ 0 |
| Required Fields | = 0 nulls | ✅ 0 |
| v2.5 Schema | All present | ✅ Yes |
| NO_STATIC_PUBLIC_KPIS | Clean | ✅ Clean |

### Source Registry Statistics

| Category | Distribution |
|----------|--------------|
| **Tier** | T1: 117, T2: 22, T0: 16, T3: 18, UNKNOWN: 119 |
| **Status** | ACTIVE: 234, PENDING_REVIEW: 41, NEEDS_KEY: 17 |
| **Source Type** | DATA: 246, RESEARCH: 23, MEDIA: 10, COMPLIANCE: 7, ACADEMIA: 6 |
| **Sectors** | 16 sectors in codebook |

> **Note:** When v3.0 xlsx is imported, these statistics will update automatically
> via `scripts/import-registry.ts`.

