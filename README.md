# YETO - Yemen Economic Transparency Observatory

<div align="center">

![YETO Logo](client/public/yeto-logo.svg)

**منصة الذكاء الاقتصادي الرائدة للبيانات والتحليل والمساءلة**

*The Leading Economic Intelligence Platform for Data, Analysis, and Accountability*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![tRPC](https://img.shields.io/badge/tRPC-11-2596be.svg)](https://trpc.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

[Live Demo](https://yeto.causewaygrp.com) · [Documentation](docs/) · [Report Bug](mailto:yeto@causewaygrp.com)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Data Governance](#data-governance)
- [Security](#security)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

YETO (Yemen Economic Transparency Observatory) is a comprehensive economic intelligence platform designed to provide transparent, evidence-based insights into Yemen's economy. Built by [CauseWay Financial & Banking Consultancy](https://causewaygrp.com), YETO aggregates data from multiple authoritative sources, applies rigorous quality assurance, and presents actionable intelligence to policymakers, researchers, journalists, and the international community.

### Mission

> To illuminate Yemen's economic reality through transparent, verifiable data—empowering informed decisions and accountability during crisis.

### Core Principles

1. **Evidence-Only Rule**: Every data point, chart, and statement links to a verifiable Evidence Pack
2. **Bilingual First**: Arabic-first design with full English support (RTL/LTR)
3. **No Hallucination**: Zero tolerance for fabricated or unverifiable information
4. **Do No Harm**: No PII, no content enabling violence or sanctions evasion

---

## Key Features

### 📊 Data Intelligence

| Feature | Description |
|---------|-------------|
| **47+ Data Sources** | Aggregated from World Bank, OCHA, IMF, CBY, and local institutions |
| **1.2M+ Data Points** | Time series, geospatial, and event data |
| **15 Economic Sectors** | Comprehensive coverage from banking to agriculture |
| **Real-time Updates** | Automated ingestion with quality validation |

### 🔍 Analysis Tools

- **AI Research Assistant**: Natural language queries with evidence-backed responses
- **Scenario Simulator**: "What-if" analysis with transparent assumptions
- **Contradiction Detector**: Identifies discrepancies between sources
- **Vintage Time Travel**: View data as it was known at any point in time

### 📈 Visualization

- **Interactive Dashboards**: Sector-specific KPIs with drill-down
- **Geographic Mapping**: Governorate-level data visualization
- **Timeline Explorer**: Historical trends and event correlation
- **Export Controls**: PNG, CSV, PDF with full attribution

### 🔐 Data Governance (The Trust Engine)

- **Provenance Ledger**: W3C PROV-compliant data lineage tracking
- **Confidence Ratings**: A-D grades with transparent methodology
- **Public Changelog**: RSS-enabled update notifications
- **Integrity Verification**: Checksums and audit trails

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        YETO Platform                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   React 19  │  │  Tailwind 4 │  │  shadcn/ui  │  Frontend   │
│  │   + tRPC    │  │    + RTL    │  │ Components  │             │
│  └──────┬──────┘  └─────────────┘  └─────────────┘             │
│         │                                                       │
│  ───────┼───────────────────────────────────────────────────── │
│         │              tRPC over HTTP                           │
│  ───────┼───────────────────────────────────────────────────── │
│         │                                                       │
│  ┌──────┴──────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Express 4  │  │   Drizzle   │  │    TiDB     │  Backend    │
│  │  + tRPC 11  │  │     ORM     │  │  (MySQL)    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Hardening Layer                       │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │Monitoring│ │  Backup  │ │  Cache   │ │ Security │   │   │
│  │  │& Metrics │ │& Recovery│ │& RateLimit│ │& Audit  │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
External Sources → Ingestion Pipeline → QA Validation → Provenance Ledger
                                              ↓
                                    Confidence Rating
                                              ↓
                                    Time Series DB → API → UI
```

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI Framework |
| TypeScript | 5.x | Type Safety |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | Latest | Component Library |
| tRPC Client | 11.x | Type-safe API Calls |
| Wouter | 3.x | Routing |
| Chart.js | 4.x | Data Visualization |
| Leaflet | 1.9.x | Maps |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 22.x | Runtime |
| Express | 4.x | HTTP Server |
| tRPC | 11.x | API Layer |
| Drizzle ORM | Latest | Database ORM |
| Zod | 3.x | Schema Validation |
| Superjson | Latest | Serialization |

### Database & Storage

| Technology | Purpose |
|------------|---------|
| TiDB (MySQL-compatible) | Primary Database |
| S3-compatible Storage | File Storage |

### DevOps & Quality

| Technology | Purpose |
|------------|---------|
| Vitest | Unit Testing |
| ESLint | Code Linting |
| Prettier | Code Formatting |
| GitHub Actions | CI/CD |

---

## Getting Started

### Prerequisites

- Node.js 22.x or higher
- pnpm 9.x or higher
- MySQL/TiDB database
- S3-compatible storage (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/causeway/yeto-platform.git
cd yeto-platform

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

### Environment Variables

```env
# Database
DATABASE_URL=mysql://user:password@host:port/database

# Authentication
JWT_SECRET=your-jwt-secret
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/login

# Application
VITE_APP_ID=your-app-id
VITE_APP_TITLE=YETO
VITE_APP_LOGO=/yeto-logo.svg

# External APIs (optional)
BUILT_IN_FORGE_API_URL=https://api.forge.example.com
BUILT_IN_FORGE_API_KEY=your-api-key
```

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm test         # Run unit tests
pnpm typecheck    # TypeScript type checking
pnpm lint         # ESLint code linting
pnpm db:push      # Push schema to database
pnpm db:studio    # Open Drizzle Studio
```

---

## Project Structure

```
yeto-platform/
├── client/                 # Frontend application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilities and tRPC client
│   │   ├── pages/         # Page components
│   │   ├── App.tsx        # Main app with routing
│   │   └── main.tsx       # Entry point
│   └── index.html         # HTML template
├── server/                 # Backend application
│   ├── _core/             # Framework internals
│   ├── governance/        # Data governance services
│   ├── hardening/         # Production hardening
│   ├── db.ts              # Database helpers
│   └── routers.ts         # tRPC procedures
├── drizzle/               # Database schema
│   └── schema.ts          # Drizzle schema definitions
├── shared/                # Shared types and constants
├── docs/                  # Documentation
│   ├── 0_START_HERE.md   # Quick start guide
│   ├── WORKPLAN.md       # Implementation roadmap
│   ├── REQ_INDEX.md      # Requirements index
│   └── ...               # Additional docs
└── storage/               # S3 storage helpers
```

---

## Data Governance

YETO implements a comprehensive "Trust Engine" for data governance:

### Provenance Ledger (Section 8A)

Every data point tracks its complete lineage:

```typescript
interface ProvenanceLedger {
  sourceId: number;           // Original data source
  accessMethod: string;       // How data was retrieved
  retrievalTime: Date;        // When data was fetched
  rawDataHash: string;        // SHA-256 of raw data
  transformations: Transform[]; // Processing steps
  qaChecks: QACheck[];        // Quality validations
  licenseType: string;        // Data license
}
```

### Confidence Ratings (Section 8B)

Data quality is rated A-D based on five dimensions:

| Rating | Score | Description |
|--------|-------|-------------|
| **A** | 85-100 | Highly Reliable - Official/audited data |
| **B** | 70-84 | Reliable - Credible institutional source |
| **C** | 50-69 | Moderate - Proxy or modelled data |
| **D** | 0-49 | Low Reliability - Use with caution |

Scoring dimensions:
- Source Credibility (25%)
- Data Completeness (20%)
- Timeliness (20%)
- Consistency (20%)
- Methodology (15%)

### Contradiction Detection (Section 8C)

Automatic detection of discrepancies between sources:

```typescript
interface Contradiction {
  indicatorId: number;
  source1: { value: number; sourceId: number };
  source2: { value: number; sourceId: number };
  discrepancyPercent: number;
  discrepancyType: 'minor' | 'significant' | 'major' | 'critical';
  plausibleReasons: string[];
}
```

### Data Vintages (Section 8D)

Point-in-time queries for historical analysis:

```typescript
// Get GDP as it was known on January 1, 2024
const gdp = await getValueAsOf('gdp', new Date('2024-01-01'));
```

### Public Changelog (Section 8E)

Transparent update notifications with RSS support:

- Dataset additions and updates
- Methodology changes
- Corrections and restatements
- Source additions

---

## Security

### Hardening Features (Section 9)

#### Monitoring & Observability (9A)

- Health check endpoints (`/health`, `/ready`, `/live`)
- System metrics collection (CPU, memory, requests)
- Request logging with correlation IDs
- Error tracking and alerting

#### Backup & Recovery (9B)

- Automated daily full backups
- Hourly incremental backups
- Point-in-time recovery
- Integrity verification

#### Performance Optimization (9C)

- LRU caching with TTL
- Rate limiting (API, auth, export)
- Query optimization tracking
- Response compression

#### Security Hardening (9D)

- CSRF protection with single-use tokens
- Security headers (CSP, HSTS, X-Frame-Options)
- Input sanitization (XSS, SQL injection prevention)
- Brute force protection
- API key management with rotation
- Security audit logging

### Security Headers

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'...
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

---

## API Reference

### tRPC Procedures

YETO uses tRPC for type-safe API calls. All procedures are available under the `/api/trpc` endpoint.

#### Authentication

```typescript
// Get current user
trpc.auth.me.useQuery()

// Logout
trpc.auth.logout.useMutation()
```

#### Data Queries

```typescript
// Get time series data
trpc.data.getTimeSeries.useQuery({
  indicatorId: 1,
  startDate: '2020-01-01',
  endDate: '2024-12-31',
})

// Get sector overview
trpc.sectors.getOverview.useQuery({ sectorId: 'banking' })

// Search indicators
trpc.indicators.search.useQuery({ query: 'exchange rate' })
```

#### Governance

```typescript
// Get provenance for a data point
trpc.governance.getProvenance.useQuery({ dataPointId: 123 })

// Get confidence rating
trpc.governance.getConfidenceRating.useQuery({ indicatorId: 1 })

// Get contradictions
trpc.governance.getContradictions.useQuery({ status: 'open' })

// Get changelog
trpc.governance.getChangelog.useQuery({ limit: 50 })
```

#### Monitoring (Admin)

```typescript
// Get health status
trpc.monitoring.getHealth.useQuery()

// Get system metrics
trpc.monitoring.getMetrics.useQuery()

// Get active alerts
trpc.monitoring.getAlerts.useQuery()
```

---

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test server/governance.test.ts

# Run with coverage
pnpm test --coverage

# Watch mode
pnpm test --watch
```

### Test Structure

```
server/
├── auth.logout.test.ts      # Authentication tests
├── governance.test.ts       # Data governance tests (15 tests)
└── hardening.test.ts        # Hardening tests (42 tests)
```

### Test Categories

| Category | Tests | Description |
|----------|-------|-------------|
| Governance | 15 | Provenance, confidence, contradictions, vintages, changelog |
| Hardening | 42 | Monitoring, backup, performance, security |
| Integration | 7 | Cross-module integration tests |
| Bilingual | 2 | Arabic/English support tests |

---

## Deployment

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL/TLS certificates installed
- [ ] Security headers enabled
- [ ] Rate limiting configured
- [ ] Backup schedule active
- [ ] Monitoring alerts configured
- [ ] Error tracking enabled

### Recommended Infrastructure

```
                    ┌─────────────┐
                    │   CDN       │
                    │ (Cloudflare)│
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │ Load Balancer│
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    ┌─────┴─────┐   ┌─────┴─────┐   ┌─────┴─────┐
    │  App Node │   │  App Node │   │  App Node │
    │     1     │   │     2     │   │     3     │
    └─────┬─────┘   └─────┬─────┘   └─────┬─────┘
          │                │                │
          └────────────────┼────────────────┘
                           │
                    ┌──────┴──────┐
                    │   TiDB      │
                    │  Cluster    │
                    └─────────────┘
```

---

## Contributing

YETO is a proprietary platform developed by CauseWay. For inquiries about contributing or partnership opportunities, please contact:

**Email**: yeto@causewaygrp.com

---

## License

Copyright © 2024 CauseWay Financial & Banking Consultancy. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

---

## Acknowledgments

### Data Sources

YETO aggregates data from the following authoritative sources:

- World Bank Open Data
- UN OCHA Financial Tracking Service
- International Monetary Fund
- Central Bank of Yemen (Aden & Sana'a)
- Yemen Ministry of Planning
- Humanitarian Data Exchange (HDX)
- And 40+ additional sources

### Technology Partners

- [Manus](https://manus.im) - Platform Infrastructure
- [TiDB](https://pingcap.com) - Distributed Database

---

<div align="center">

**Built with ❤️ for Yemen**

*Transparency • Accountability • Evidence*

</div>
