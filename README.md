# YETO - Yemen Economic Transparency Observatory

<div align="center">

![YETO Logo](client/public/yeto-logo.svg)

**منصة الذكاء الاقتصادي الرائدة للبيانات والتحليل والمساءلة**

*The Leading Economic Intelligence Platform for Data, Analysis, and Accountability*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![tRPC](https://img.shields.io/badge/tRPC-11-2596be.svg)](https://trpc.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8.svg)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-131%20Passing-brightgreen.svg)]()
[![Routes](https://img.shields.io/badge/Routes-60%2F60-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

[Live Demo](https://yeto.causewaygrp.com) · [Documentation](docs/) · [Report Bug](mailto:yeto@causewaygrp.com)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Current Status](#current-status)
- [Key Features](#key-features)
- [Data Connectors](#data-connectors)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Data Governance](#data-governance)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Deployment](#deployment)
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

## Current Status

**Last Updated:** December 29, 2024

### Platform Health

| Metric | Status |
|--------|--------|
| **Routes Tested** | 60/60 (100% ✅) |
| **Unit Tests** | 131 Passing ✅ |
| **TypeScript Errors** | 0 ✅ |
| **Data Records** | 4,347+ |
| **Active Connectors** | 14/16 |

### Recent Updates

- ✅ Comprehensive site audit completed - all 60 routes passing
- ✅ Research Portal with 6 new pages (Explorer, Analytics, Assistant, Library, Audit)
- ✅ Signal detection system with 12 configurable thresholds
- ✅ Daily scheduler with 13 automated data refresh jobs
- ✅ 7 new data connectors (World Bank, OCHA FTS, IMF, HDX, Sanctions, ReliefWeb, FEWS NET)
- ✅ Real-time KPI cards connected to live database
- ✅ Scroll animations and parallax effects on homepage
- ✅ Custom YETO logo SVG with animations

---

## Key Features

### 📊 Data Intelligence

| Feature | Description |
|---------|-------------|
| **16 Data Connectors** | World Bank, IMF, UNHCR, WHO, WFP, UNDP, UNICEF, IATI, CBY, HDX, OCHA FTS, FEWS NET, Sanctions, ReliefWeb |
| **4,347+ Data Points** | Time series, geospatial, and event data |
| **15 Economic Sectors** | Comprehensive coverage from banking to agriculture |
| **Real-time Updates** | Automated daily ingestion with quality validation |

### 🔍 Analysis Tools

- **AI Research Assistant**: Natural language queries with evidence-backed responses
- **Scenario Simulator**: "What-if" analysis with transparent assumptions
- **Policy Impact Analysis**: 6 scenario models for economic policy evaluation
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
- **Signal Detection**: Automated alerts for threshold breaches

### 📚 Research Portal

- **Research Explorer**: Advanced filtering by category, type, year, organization
- **Research Analytics**: Timeline visualization, topic clustering, citation networks
- **AI Research Assistant**: Natural language queries across publications
- **Research Library**: Bookmarks, reading lists, topic alerts
- **Completeness Audit**: Gap detection and coverage analysis

---

## Data Connectors

### Active Connectors (14)

| Connector | Source | Data Type | Records |
|-----------|--------|-----------|---------|
| World Bank WDI | api.worldbank.org | GDP, poverty, trade | 394 |
| UNHCR | data.unhcr.org | Refugees, IDPs | 90 |
| WHO | ghoapi.azureedge.net | Health indicators | 393 |
| UNICEF | data.unicef.org | Child welfare | 180 |
| WFP | api.wfp.org | Food prices, security | 225 |
| UNDP | hdr.undp.org | Human development | 240 |
| IATI | iatiregistry.org | Aid transparency | 180 |
| CBY | cby.gov.ye | Exchange rates, monetary | 201 |
| HDX CKAN | data.humdata.org | Humanitarian data | 10 |
| IMF IFS | data.imf.org | Monetary, financial | 79 |
| FEWS NET | fews.net | Food security phases | 232 |
| Sanctions | treasury.gov, sanctionsmap.eu | OFAC/EU lists | 11 |
| ReliefWeb | reliefweb.int | Humanitarian updates | Pending |
| OCHA FTS | fts.unocha.org | Funding flows | Pending |

### Pending Connectors (2)

| Connector | Requirement |
|-----------|-------------|
| HDX HAPI | API key required |
| ACLED | API key required |

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
│  │                  Data Pipeline Layer                     │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │Connectors│ │Validation│ │Scheduler │ │ Signals  │   │   │
│  │  │  (16)    │ │   & QA   │ │  (Daily) │ │Detection │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
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

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm test         # Run unit tests (131 tests)
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
│   │   ├── components/    # Reusable UI components (60+)
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks (10+)
│   │   ├── lib/           # Utilities and tRPC client
│   │   ├── pages/         # Page components (60+)
│   │   ├── App.tsx        # Main app with routing
│   │   └── main.tsx       # Entry point
│   └── index.html         # HTML template
├── server/                 # Backend application
│   ├── _core/             # Framework internals
│   ├── connectors/        # Data source connectors (16)
│   ├── governance/        # Data governance services
│   ├── hardening/         # Production hardening
│   ├── scheduler/         # Automated job scheduling
│   ├── services/          # Business logic services
│   ├── db.ts              # Database helpers
│   └── routers.ts         # tRPC procedures
├── drizzle/               # Database schema
│   └── schema.ts          # Drizzle schema definitions
├── shared/                # Shared types and constants
├── scripts/               # Utility scripts
├── docs/                  # Documentation
│   ├── 0_START_HERE.md   # Quick start guide
│   ├── ARCHITECTURE.md   # System architecture
│   ├── API_REFERENCE.md  # API documentation
│   ├── DATA_GOVERNANCE.md # Data governance policies
│   └── site-audit-report.md # Latest audit results
└── storage/               # S3 storage helpers
```

---

## Data Governance

YETO implements a comprehensive "Trust Engine" for data governance:

### Provenance Ledger

Every data point tracks its complete lineage including source, access method, retrieval time, transformations, and QA checks.

### Confidence Ratings

| Rating | Score | Description |
|--------|-------|-------------|
| **A** | 85-100 | Highly Reliable - Official/audited data |
| **B** | 70-84 | Reliable - Credible institutional source |
| **C** | 50-69 | Moderate - Proxy or modelled data |
| **D** | <50 | Low - Disputed or unverified |

### Signal Detection

Automated monitoring for 12 threshold conditions:
- Exchange rate spikes (5%, 10%)
- Inflation thresholds (20%, 30%)
- Food insecurity levels (50%, 60%)
- Sanctions intensity changes

---

## API Reference

### tRPC Endpoints

| Router | Endpoints | Description |
|--------|-----------|-------------|
| `dashboard` | getStats, getHeroKPIs | Platform statistics |
| `research` | getPublications, search | Research portal |
| `scheduler` | getJobs, runJob | Job management |
| `alerts` | getAlerts, acknowledge | Alert system |
| `ai` | chat, askResearch | AI assistant |

See [docs/API_REFERENCE.md](docs/API_REFERENCE.md) for complete documentation.

---

## Testing

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test --coverage

# Run specific test file
pnpm test server/auth.logout.test.ts
```

**Current Status:** 131 tests passing

---

## Deployment

YETO is deployed via Manus platform with built-in hosting:

1. Create a checkpoint: `webdev_save_checkpoint`
2. Click "Publish" in the Manus UI
3. Configure custom domain in Settings → Domains

---

## License

Copyright © 2024 CauseWay Financial & Banking Consultancy. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

---

## Contact

- **Email:** yeto@causewaygrp.com
- **Website:** [causewaygrp.com](https://causewaygrp.com)

---

<div align="center">

**Built with ❤️ for Yemen's economic transparency**

</div>
