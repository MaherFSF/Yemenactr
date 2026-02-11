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
│   │   290+ Data  │───▶│  Ingestion  │───▶│  Provenance │                 │
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
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components (114)
│   │   ├── pages/          # Page components (90)
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utilities and tRPC client
│   └── public/             # Static assets
├── server/                 # Backend Express + tRPC
│   ├── routers/            # tRPC routers (14)
│   ├── connectors/         # Data source connectors (26)
│   ├── services/           # Business logic services
│   ├── governance/         # Truth layer and gates
│   ├── hardening/          # Security and production readiness
│   ├── etl/                # ETL pipeline framework
│   └── _core/              # Framework infrastructure
├── drizzle/                # Database schema and migrations
├── shared/                 # Shared types and constants
├── docs/                   # Documentation (70+ files)
├── scripts/                # Utility scripts
└── e2e/                    # Playwright E2E tests
```

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

### Source Registry v2.5 Statistics

| Category | Distribution |
|----------|--------------|
| **Tier** | T1: 117, T2: 22, T0: 16, T3: 18, UNKNOWN: 119 |
| **Status** | ACTIVE: 234, PENDING_REVIEW: 41, NEEDS_KEY: 17 |
| **Source Type** | DATA: 246, RESEARCH: 23, MEDIA: 10, COMPLIANCE: 7, ACADEMIA: 6 |
| **Sectors** | 16 sectors in codebook |

