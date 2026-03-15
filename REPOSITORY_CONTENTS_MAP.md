# YETO Repository Contents Map
## Comprehensive Guide to the Yemen Economic Transparency Observatory Codebase

**Generated:** February 5, 2026  
**Repository:** YETO Platform (Yemen Economic Transparency Observatory)  
**Version:** 1.0.0  
**License:** Proprietary (Causeway Group)

---

## 📋 Table of Contents

1. [Executive Overview](#executive-overview)
2. [Technology Stack](#technology-stack)
3. [Project Architecture](#project-architecture)
4. [Directory Structure Deep Dive](#directory-structure-deep-dive)
5. [Database Schema](#database-schema)
6. [API & Routers](#api--routers)
7. [Data Sources & Connectors](#data-sources--connectors)
8. [Frontend Components](#frontend-components)
9. [Backend Services](#backend-services)
10. [Data Pipeline](#data-pipeline)
11. [Governance & Security](#governance--security)
12. [Documentation](#documentation)
13. [Scripts & Utilities](#scripts--utilities)
14. [Testing Infrastructure](#testing-infrastructure)
15. [Deployment & Infrastructure](#deployment--infrastructure)
16. [Research & Knowledge Base](#research--knowledge-base)
17. [Getting Started Guide](#getting-started-guide)

---

## Executive Overview

### What is YETO?

**YETO (Yemen Economic Transparency Observatory)** is a comprehensive, bilingual (Arabic/English) economic intelligence platform designed to bring transparency and evidence-based analysis to Yemen's fragmented economy. Built by Causeway Group, this full-stack TypeScript application aggregates data from 292+ international and local sources, processing and presenting it through an intuitive interface with full provenance tracking.

### Core Problem Being Solved

Yemen has operated under a **split monetary authority** since August 2016, with two Central Banks—one in Aden (IRG-controlled) and one in Sana'a (DFA-controlled)—each maintaining different exchange rates, monetary policies, and fiscal realities. Economic data is scattered across hundreds of sources, making it nearly impossible for humanitarian organizations, policymakers, and researchers to establish ground truth.

### Key Statistics

| Metric | Value |
|--------|-------|
| **Total Files** | 1,400+ source files |
| **Data Sources** | 292 registered sources (234 active) |
| **Historical Coverage** | 2010 → Present (15+ years) |
| **Data Points** | 5,500+ verified time series points |
| **Research Publications** | 370+ documents |
| **Database Tables** | 81 tables |
| **API Endpoints** | 14 tRPC routers with 100+ procedures |
| **Test Coverage** | 750+ passing tests |
| **Languages** | TypeScript (primary), SQL, Shell, Python |
| **Lines of Code** | ~150,000 LOC |

---

## Technology Stack

### Frontend Stack

```
React 19.2.1              → UI framework with concurrent features
TypeScript 5.9.3          → Type-safe development
Tailwind CSS 4.1.14       → Utility-first styling with RTL support
shadcn/ui (Radix UI)      → Accessible component library (50+ components)
Wouter 3.3.5              → Lightweight routing (~2KB)
Recharts 2.15.4           → Data visualization library
tRPC Client 11.6.0        → Type-safe API client
Tanstack Query 5.90.2     → Server state management
Framer Motion 12.23.22    → Animation library
Zustand 5.0.9             → Client state management
```

### Backend Stack

```
Node.js 22+               → JavaScript runtime
Express 4.21.2            → HTTP server framework
tRPC 11.6.0               → End-to-end type-safe API
Drizzle ORM 0.44.5        → Type-safe database ORM
Zod 4.1.12                → Runtime schema validation
MySQL2 3.15.0             → MySQL database client
Jose 6.1.0                → JWT token handling
Cron 4.4.0                → Job scheduling
Vitest 2.1.4              → Unit testing framework
```

### Database & Storage

```
TiDB/MySQL 8+             → Primary relational database
AWS S3                    → Document and file storage
Redis (optional)          → Caching layer
```

### DevOps & Tools

```
Vite 7.1.7                → Build tool and dev server
esbuild 0.25.0            → JavaScript bundler
Playwright 1.57.0         → E2E testing
Docker & Docker Compose   → Containerization
Kubernetes                → Container orchestration
Terraform                 → Infrastructure as code
pnpm 10.4.1               → Package manager
```

---

## Project Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            YETO ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                    PRESENTATION LAYER                           │     │
│  │  React 19 • TypeScript • Tailwind 4 • RTL Support • 288 pages  │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                    ↕                                     │
│                              tRPC over HTTP                              │
│                                    ↕                                     │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                      APPLICATION LAYER                          │     │
│  │  Express • tRPC (14 Routers) • Zod Validation • Auth           │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                    ↕                                     │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                        SERVICE LAYER                            │     │
│  │  • 26 Data Connectors    • AI Services (OneBrain)              │     │
│  │  • Governance Services   • ETL Pipeline                         │     │
│  │  • Provenance Ledger     • Evidence Tribunal                    │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                    ↕                                     │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                          DATA LAYER                             │     │
│  │  TiDB (81 Tables) • S3 Storage • Redis Cache                    │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                    ↕                                     │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                      EXTERNAL SOURCES                           │     │
│  │  World Bank • IMF • UN Agencies • Central Banks • 292 Sources   │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Trust Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        YETO TRUST ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                │
│   │   292 Data  │───▶│  Ingestion  │───▶│  Provenance │                │
│   │   Sources   │    │   Pipeline  │    │   Ledger    │                │
│   └─────────────┘    └─────────────┘    └─────────────┘                │
│                                                │                         │
│                                                ▼                         │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                │
│   │   Truth     │◀───│  Evidence   │◀───│  Confidence │                │
│   │   Layer     │    │   Tribunal  │    │   Scoring   │                │
│   └─────────────┘    └─────────────┘    └─────────────┘                │
│         │                                                                │
│         ▼                                                                │
│   ┌─────────────────────────────────────────────────────────────┐      │
│   │                 USER-FACING INTELLIGENCE                     │      │
│   │   • Dashboards  • AI Assistant  • Reports  • API            │      │
│   └─────────────────────────────────────────────────────────────┘      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure Deep Dive

### Root Level Structure

```
yeto-platform/
├── .github/                    # GitHub configuration
│   ├── CODEOWNERS             # Code ownership rules
│   ├── ISSUE_TEMPLATE/        # Issue templates (bug, feature)
│   └── pull_request_template.md
├── .husky/                    # Git hooks for pre-commit checks
├── agentos/                   # Agent system configuration (12 files)
├── client/                    # Frontend React application (554 files)
├── server/                    # Backend Express + tRPC (251 files)
├── shared/                    # Shared types and constants
├── drizzle/                   # Database schema & migrations (68 files)
├── scripts/                   # Utility scripts (53 files)
├── docs/                      # Documentation (234 files)
├── research/                  # Research findings & knowledge base (52 files)
├── cby-publications/          # Central Bank Yemen publications (110 PDFs)
├── data/                      # Static data files (27 files)
├── e2e/                       # Playwright E2E tests
├── infra/                     # Kubernetes manifests
├── infrastructure/            # Terraform configurations
├── patches/                   # Package patches
├── public/                    # Public static assets & documents
├── test-findings/             # Testing reports by sector (9 files)
└── [Configuration Files]      # Root-level configs (see below)
```

### Root Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | NPM dependencies and scripts |
| `tsconfig.json` | TypeScript compiler configuration |
| `drizzle.config.ts` | Database ORM configuration |
| `docker-compose.yml` | Local development Docker setup |
| `docker-compose.prod.yml` | Production Docker setup |
| `Dockerfile` | Container image definition |
| `Makefile` | Build automation commands |
| `.env.example` | Environment variables template |

---

## Directory Structure Deep Dive (Continued)

### `/client/` - Frontend Application (554 files)

```
client/
├── src/
│   ├── _core/
│   │   └── hooks/
│   │       └── useAuth.ts                    # Authentication hook
│   ├── components/                           # Reusable UI components (114 files)
│   │   ├── ui/                              # shadcn/ui base components (50+)
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── table.tsx
│   │   │   ├── card.tsx
│   │   │   └── [47+ more components]
│   │   ├── AIChatBox.tsx                    # AI assistant interface
│   │   ├── Header.tsx                       # Global header with language toggle
│   │   ├── Footer.tsx                       # Global footer
│   │   ├── DashboardLayout.tsx              # Layout wrapper
│   │   ├── LanguageToggle.tsx               # Arabic/English switcher
│   │   ├── SourcesUsedPanel.tsx             # Provenance display
│   │   ├── EvidenceViewer.tsx               # Evidence detail viewer
│   │   ├── ExchangeRateWidget.tsx           # Live FX rates
│   │   ├── TimeSeriesChart.tsx              # Recharts wrapper
│   │   ├── RegimeTag.tsx                    # IRG/DFA badge
│   │   ├── ConfidenceScore.tsx              # A-D rating display
│   │   ├── BreadcrumbNav.tsx                # Navigation breadcrumbs
│   │   ├── DataExportButton.tsx             # CSV/JSON/XLSX export
│   │   └── [90+ more components]
│   ├── contexts/
│   │   ├── LanguageContext.tsx              # i18n state management
│   │   └── ThemeContext.tsx                 # Light/dark theme
│   ├── hooks/                               # Custom React hooks (11 files)
│   │   ├── useLanguage.ts                   # Language helpers
│   │   ├── useIndicators.ts                 # Data fetching hook
│   │   ├── useDebounce.ts                   # Debounce utility
│   │   ├── useMediaQuery.ts                 # Responsive helpers
│   │   └── [7+ more hooks]
│   ├── lib/
│   │   ├── trpc.ts                          # tRPC client setup
│   │   ├── utils.ts                         # Helper functions
│   │   ├── api.ts                           # API utilities
│   │   └── cn.ts                            # Tailwind class merger
│   ├── pages/                               # Page components (90 files)
│   │   ├── Home.tsx                         # Landing page
│   │   ├── Dashboard.tsx                    # Main dashboard
│   │   ├── About.tsx                        # About page
│   │   ├── admin/                           # Admin portal (36 files)
│   │   │   ├── AdminPortal.tsx
│   │   │   ├── IngestionDashboard.tsx
│   │   │   ├── SchedulerManager.tsx
│   │   │   ├── UserManagement.tsx
│   │   │   ├── SourceRegistry.tsx
│   │   │   ├── BulkClassification.tsx
│   │   │   └── [30+ more admin pages]
│   │   ├── sectors/                         # Sector pages (18 files)
│   │   │   ├── Banking.tsx                  # Banking sector
│   │   │   ├── Currency.tsx                 # FX & currency
│   │   │   ├── Energy.tsx                   # Energy sector
│   │   │   ├── FoodSecurity.tsx             # Food security
│   │   │   ├── Labor.tsx                    # Labor market
│   │   │   ├── Trade.tsx                    # Trade & commerce
│   │   │   ├── Macroeconomy.tsx             # Macro indicators
│   │   │   ├── AidFlows.tsx                 # Humanitarian aid
│   │   │   ├── Poverty.tsx                  # Poverty & welfare
│   │   │   ├── Sanctions.tsx                # Sanctions monitoring
│   │   │   └── [8+ more sectors]
│   │   ├── vip/                             # VIP user features
│   │   │   ├── VIPCockpit.tsx
│   │   │   └── ExecutiveBriefing.tsx
│   │   ├── AIAssistantEnhanced.tsx          # OneBrain AI interface
│   │   ├── ResearchLibrary.tsx              # Publications browser
│   │   ├── SourceDetail.tsx                 # Source detail page
│   │   ├── EntityDetail.tsx                 # Entity profile page
│   │   ├── AdvancedSearch.tsx               # Multi-field search
│   │   ├── ComparisonTool.tsx               # Cross-regime comparison
│   │   ├── Changelog.tsx                    # Data corrections log
│   │   └── [40+ more pages]
│   ├── stores/
│   │   └── authStore.ts                     # Zustand auth store
│   ├── main.tsx                             # Application entry point
│   ├── App.tsx                              # Root component with routing
│   ├── index.css                            # Global styles
│   └── const.ts                             # Frontend constants
└── public/                                  # Static assets
    ├── documents/                           # PDF reports
    │   └── banking/                         # Banking sector PDFs (5 files)
    ├── yeto-logo.svg
    ├── favicon.ico
    └── [images, fonts, etc.]
```

### `/server/` - Backend Application (251 files)

```
server/
├── _core/                                   # Framework internals
│   ├── index.ts                            # Express server entry point
│   ├── trpc.ts                             # tRPC router setup
│   ├── context.ts                          # Request context creation
│   ├── env.ts                              # Environment variable validation
│   ├── llm.ts                              # LLM client (Claude/GPT)
│   ├── oauth.ts                            # OAuth 2.0 authentication
│   ├── cookies.ts                          # Cookie management
│   ├── vite.ts                             # Vite dev server integration
│   ├── dataApi.ts                          # Data API client
│   ├── notification.ts                     # Notification service
│   ├── imageGeneration.ts                  # Image generation service
│   ├── voiceTranscription.ts               # Voice transcription
│   └── types/
│       ├── cookie.d.ts
│       └── manusTypes.ts
├── routers/                                # tRPC API routers (14+ routers)
│   ├── yeto.router.ts                      # Main aggregated router
│   ├── fxRouter.ts                         # Exchange rate endpoints
│   ├── oneBrainRouter.ts                   # AI assistant endpoints
│   ├── sectorPages.ts                      # Sector page data
│   ├── publications.ts                     # Research library
│   ├── sourceRegistry.ts                   # Source management
│   ├── bulkClassification.ts               # Bulk tier classification
│   ├── ingestionRouter.ts                  # Data ingestion control
│   ├── scheduler.router.ts                 # Job scheduling
│   ├── backfillRouter.ts                   # Historical data backfill
│   ├── dataInfraRouter.ts                  # Data infrastructure
│   ├── truthLayer.ts                       # Evidence verification
│   ├── evidence.ts                         # Evidence packs
│   ├── feedMatrix.ts                       # Data feed management
│   ├── graphRouter.ts                      # Graph data endpoints
│   ├── vipCockpit.ts                       # VIP user features
│   ├── partnerEngine.ts                    # Partner API
│   ├── apiKeysRouter.ts                    # API key management
│   ├── webhooks.router.ts                  # Webhook handlers
│   ├── methodologyDownloads.ts             # Methodology PDFs
│   ├── bulkExport.ts                       # Bulk data export
│   ├── entities.ts                         # Entity profiles
│   ├── historicalRouter.ts                 # Historical queries
│   ├── mlRouter.ts                         # ML model endpoints
│   ├── povertyHumandev.ts                  # Poverty & HDI data
│   ├── reportsRouter.ts                    # Report generation
│   ├── sectorKpiRouter.ts                  # Sector KPIs
│   ├── storageRouter.ts                    # File storage
│   ├── updates.ts                          # Platform updates
│   ├── laborAlerts.ts                      # Labor market alerts
│   └── autopilot.ts                        # Autopilot features
├── connectors/                             # Data source connectors (26 files)
│   ├── worldBankConnector.ts               # World Bank WDI API
│   ├── imfConnector.ts                     # IMF WEO/IFS API
│   ├── fxRatesConnector.ts                 # Exchange rate scraper
│   ├── cbyAdenConnector.ts                 # CBY Aden data
│   ├── cbySanaaConnector.ts                # CBY Sana'a data
│   ├── unhcrConnector.ts                   # UNHCR API
│   ├── wfpConnector.ts                     # WFP data
│   ├── acledConnector.ts                   # ACLED conflict data
│   ├── ofacConnector.ts                    # OFAC sanctions
│   ├── hdxConnector.ts                     # HDX humanitarian data
│   ├── reliefWebConnector.ts               # ReliefWeb API
│   ├── fewsnetConnector.ts                 # FEWS NET food security
│   └── [14+ more connectors]
├── services/                               # Business logic (81 files)
│   ├── aiSafetyGates.ts                    # AI output validation
│   ├── analytics-engine.ts                 # Analytics processor
│   ├── confidenceRating.ts                 # Data confidence scoring
│   ├── contradictionDetector.ts            # Source contradiction detection
│   ├── dataVintages.ts                     # Historical data versions
│   ├── evidenceTribunal.ts                 # Evidence validation
│   ├── ingestion-orchestrator.ts           # Ingestion coordination
│   ├── provenanceLedger.ts                 # Data provenance tracking
│   ├── publication-engine.ts               # Publication workflow
│   ├── publicChangelog.ts                  # Public corrections log
│   └── [71+ more services]
├── governance/                             # Data governance
│   ├── confidenceRating.ts                 # Confidence algorithms
│   ├── contradictionDetector.ts            # Conflict detection
│   ├── dataVintages.ts                     # Version control
│   ├── provenanceLedger.ts                 # Audit trail
│   └── publicChangelog.ts                  # Transparency log
├── hardening/                              # Production readiness
│   ├── productionReadiness.ts              # Deployment gates
│   ├── security.ts                         # Security policies
│   ├── performance.ts                      # Performance monitoring
│   ├── monitoring.ts                       # System monitoring
│   └── backup.ts                           # Backup strategies
├── ai/                                     # AI services
│   ├── oneBrain.ts                         # AI assistant core
│   ├── oneBrainEnhanced.ts                 # Enhanced AI features
│   ├── agentPersonas.ts                    # Role-based AI personas
│   └── visualizationHelper.ts              # Data viz AI helper
├── ml/                                     # Machine learning
│   ├── core/
│   │   ├── oneBrainDirective.ts            # AI directive engine
│   │   ├── glossaryIntelligence.ts         # Term extraction
│   │   ├── timelineIntelligence.ts         # Event detection
│   │   ├── visualIntelligence.ts           # Chart generation
│   │   ├── realtimePipeline.ts             # Real-time ML
│   │   └── personalizationEngine.ts        # User personalization
│   ├── models/
│   │   └── ensembleForecaster.ts           # Forecasting model
│   └── monitoring/
│       └── mlMonitoring.ts                 # ML metrics
├── scheduler/                              # Job scheduling
│   ├── index.ts                            # Scheduler initialization
│   ├── ingestionScheduler.ts               # Automated ingestion
│   └── historicalBackfill.ts               # Backfill jobs
├── pipeline/                               # Data pipeline
│   ├── index.ts                            # Pipeline orchestrator
│   ├── ingestionJobs.ts                    # Ingestion tasks
│   ├── sourceRegistry.ts                   # Source registry
│   ├── validation.ts                       # Data validation
│   ├── storage.ts                          # Storage layer
│   └── services.ts                         # Pipeline services
├── security/                               # Security layer
│   ├── auditLogger.ts                      # Audit logging
│   └── index.ts                            # Security middleware
├── db/                                     # Database helpers
│   ├── ingestion-persistence.ts            # Ingestion data store
│   └── webhook-persistence.ts              # Webhook storage
├── jobs/                                   # Background jobs
│   └── bankingSectorUpdate.ts              # Banking data jobs
├── middleware/                             # Express middleware
│   └── reviewMode.ts                       # Review mode flag
├── db.ts                                   # Database client & queries
├── ingestion.ts                            # Ingestion engine
├── storage.ts                              # File storage service
├── transform.ts                            # Data transformation
├── seed.ts                                 # Database seeding
└── [50+ test files (*.test.ts)]
```

### `/shared/` - Shared Code

```
shared/
├── _core/
│   └── errors.ts                           # Error definitions
├── types.ts                                # Shared TypeScript types
├── const.ts                                # Shared constants
├── indicatorCatalog.ts                     # Economic indicators catalog
├── indicators/
│   └── index.ts                            # Indicator definitions
├── economic-events-data.ts                 # Timeline events
├── expanded-economic-events.ts             # Extended events
└── stakeholder-knowledge.ts                # Stakeholder database
```

### `/drizzle/` - Database Schema & Migrations (68 files)

```
drizzle/
├── schema.ts                               # Main database schema (81 tables)
├── schema-source-registry.ts               # Source registry schema
├── schema-visualization.ts                 # Visualization schema
├── schema-webhooks.ts                      # Webhook schema
├── schema-backfill.ts                      # Backfill schema
├── relations.ts                            # Table relationships
├── 0000_rich_roxanne_simpson.sql           # Initial migration
├── 0001_early_slayback.sql
├── 0002_military_master_mold.sql
├── [24+ sequential migrations]
├── 0027_add_classification_columns.sql     # Latest migration
├── phase1-schema-upgrade.sql               # Phase 1 upgrade
├── ingestion-schema.sql                    # Ingestion tables
├── webhook-schema.sql                      # Webhook tables
└── meta/                                   # Migration metadata
    ├── _journal.json                       # Migration history
    ├── 0000_snapshot.json
    └── [27 snapshots]
```

---

## Database Schema

### Core Tables (81 Total)

#### Economic Data Tables

```sql
-- Time series data with regime support
time_series (
  id INT PRIMARY KEY AUTO_INCREMENT,
  indicator_id INT NOT NULL,
  date DATE NOT NULL,
  value DECIMAL(20,4),
  regime_tag ENUM('IRG', 'DFA', 'UNIFIED', 'PAR'),
  source_id INT,
  confidence_score DECIMAL(3,2),
  vintage_date DATE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (indicator_id) REFERENCES economic_indicators(id),
  FOREIGN KEY (source_id) REFERENCES evidence_sources(id),
  INDEX idx_indicator_date (indicator_id, date),
  INDEX idx_regime (regime_tag)
)

-- Economic indicators catalog
economic_indicators (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(100) UNIQUE NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  description_en TEXT,
  description_ar TEXT,
  sector VARCHAR(100),
  unit VARCHAR(50),
  frequency ENUM('daily', 'weekly', 'monthly', 'quarterly', 'annual'),
  methodology_en TEXT,
  methodology_ar TEXT,
  created_at TIMESTAMP
)

-- Research publications
research_publications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(500) NOT NULL,
  title_ar VARCHAR(500),
  organization VARCHAR(255),
  publication_date DATE,
  document_type ENUM('report', 'briefing', 'data', 'directive'),
  url VARCHAR(1000),
  file_key VARCHAR(500),
  s3_url VARCHAR(1000),
  language ENUM('en', 'ar', 'both'),
  sector VARCHAR(100),
  source_id INT,
  FOREIGN KEY (source_id) REFERENCES evidence_sources(id)
)

-- Commercial banks
commercial_banks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name_en VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  bank_type ENUM('commercial', 'islamic', 'specialized'),
  regime_tag ENUM('IRG', 'DFA', 'UNIFIED'),
  operating_status ENUM('active', 'suspended', 'merged'),
  headquarters VARCHAR(255),
  founded_year INT,
  total_assets_usd DECIMAL(15,2),
  total_deposits_usd DECIMAL(15,2),
  branches_count INT,
  website VARCHAR(500),
  created_at TIMESTAMP
)
```

#### Governance Tables

```sql
-- Provenance records
provenance_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  entity_type ENUM('timeseries', 'publication', 'bank', 'event'),
  entity_id INT NOT NULL,
  source_id INT NOT NULL,
  retrieval_timestamp TIMESTAMP,
  transformation_log TEXT,
  quality_score DECIMAL(3,2),
  confidence_grade ENUM('A', 'B', 'C', 'D'),
  FOREIGN KEY (source_id) REFERENCES evidence_sources(id)
)

-- Evidence sources (292 sources)
evidence_sources (
  id INT PRIMARY KEY AUTO_INCREMENT,
  source_code VARCHAR(50) UNIQUE NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  organization VARCHAR(255),
  url VARCHAR(1000),
  api_endpoint VARCHAR(1000),
  update_frequency VARCHAR(50),
  reliability_tier ENUM('T0', 'T1', 'T2', 'T3', 'T4', 'UNKNOWN'),
  status ENUM('ACTIVE', 'PENDING_REVIEW', 'NEEDS_KEY', 'INACTIVE'),
  source_type ENUM('DATA', 'RESEARCH', 'MEDIA', 'COMPLIANCE', 'ACADEMIA'),
  allowed_use TEXT,
  sectors JSON,
  created_at TIMESTAMP
)

-- Confidence scores
confidence_scores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  entity_type VARCHAR(50),
  entity_id INT,
  score DECIMAL(3,2),
  grade ENUM('A', 'B', 'C', 'D'),
  rationale TEXT,
  factors JSON,
  created_at TIMESTAMP
)

-- Correction requests
correction_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  entity_type VARCHAR(50),
  entity_id INT,
  field_name VARCHAR(100),
  current_value TEXT,
  proposed_value TEXT,
  justification TEXT,
  submitter_email VARCHAR(255),
  status ENUM('pending', 'approved', 'rejected'),
  reviewed_by INT,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP
)

-- Audit logs
audit_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(100),
  entity_type VARCHAR(50),
  entity_id INT,
  changes JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP,
  INDEX idx_user_action (user_id, action),
  INDEX idx_created (created_at)
)
```

#### FX & Currency Tables

```sql
-- Exchange rates
fx_rates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  date DATE NOT NULL,
  regime_tag ENUM('IRG', 'DFA', 'PAR'),
  rate DECIMAL(10,4) NOT NULL,
  source_id INT,
  vintage_date DATE,
  provenance TEXT,
  created_at TIMESTAMP,
  FOREIGN KEY (source_id) REFERENCES fx_source_registry(id),
  UNIQUE KEY unique_rate (date, regime_tag, source_id),
  INDEX idx_date_regime (date, regime_tag)
)

-- FX source registry
fx_source_registry (
  id INT PRIMARY KEY AUTO_INCREMENT,
  source_code VARCHAR(50) UNIQUE NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  regime_tag ENUM('IRG', 'DFA', 'PAR'),
  url VARCHAR(1000),
  update_frequency VARCHAR(50),
  reliability ENUM('high', 'medium', 'low'),
  created_at TIMESTAMP
)

-- FX gap tickets
fx_gap_tickets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  date DATE NOT NULL,
  regime_tag ENUM('IRG', 'DFA', 'PAR'),
  gap_type ENUM('missing', 'stale', 'suspicious'),
  description TEXT,
  status ENUM('open', 'investigating', 'resolved'),
  assigned_to INT,
  created_at TIMESTAMP
)
```

#### User & Admin Tables

```sql
-- Users
users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role ENUM('admin', 'subscriber', 'contributor', 'public'),
  organization VARCHAR(255),
  created_at TIMESTAMP,
  last_login TIMESTAMP
)

-- API keys
api_keys (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  key_hash VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(255),
  rate_limit INT DEFAULT 1000,
  expires_at TIMESTAMP,
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
)

-- Subscriptions
subscriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  tier ENUM('free', 'professional', 'institutional'),
  status ENUM('active', 'cancelled', 'expired'),
  starts_at DATE,
  expires_at DATE,
  FOREIGN KEY (user_id) REFERENCES users(id)
)
```

#### Ingestion & Pipeline Tables

```sql
-- Ingestion runs
ingestion_runs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  connector_name VARCHAR(100) NOT NULL,
  status ENUM('pending', 'running', 'completed', 'failed'),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  records_processed INT,
  records_inserted INT,
  records_updated INT,
  error_log TEXT,
  INDEX idx_connector (connector_name),
  INDEX idx_status (status)
)

-- Scheduler jobs
scheduler_jobs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  job_name VARCHAR(100) UNIQUE NOT NULL,
  cron_expression VARCHAR(50) NOT NULL,
  enabled BOOLEAN DEFAULT true,
  last_run TIMESTAMP,
  next_run TIMESTAMP,
  status ENUM('idle', 'running', 'failed'),
  config JSON
)

-- Data gap tickets
data_gap_tickets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  indicator_code VARCHAR(100),
  date_range VARCHAR(100),
  gap_type ENUM('missing', 'stale', 'incomplete'),
  priority ENUM('critical', 'high', 'medium', 'low'),
  status ENUM('open', 'investigating', 'resolved', 'wont_fix'),
  description TEXT,
  assigned_to INT,
  created_at TIMESTAMP
)
```

#### Sector-Specific Tables

```sql
-- Banking directives
cby_directives (
  id INT PRIMARY KEY AUTO_INCREMENT,
  directive_number VARCHAR(50),
  title_en VARCHAR(500),
  title_ar VARCHAR(500),
  issue_date DATE,
  issuing_authority ENUM('CBY_ADEN', 'CBY_SANAA'),
  category VARCHAR(100),
  summary_en TEXT,
  summary_ar TEXT,
  file_key VARCHAR(500)
)

-- Sanctions entities
sanctions_entities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  entity_name VARCHAR(255) NOT NULL,
  entity_type ENUM('individual', 'organization', 'vessel'),
  designation_date DATE,
  sanctioning_body ENUM('OFAC', 'EU', 'UK'),
  reason TEXT,
  identifiers JSON,
  status ENUM('active', 'removed'),
  created_at TIMESTAMP
)

-- Economic events (timeline)
economic_events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  date DATE NOT NULL,
  title_en VARCHAR(500) NOT NULL,
  title_ar VARCHAR(500),
  description_en TEXT,
  description_ar TEXT,
  category VARCHAR(100),
  regime_tag ENUM('IRG', 'DFA', 'UNIFIED'),
  impact_level ENUM('critical', 'high', 'medium', 'low'),
  sources JSON,
  related_indicators JSON,
  created_at TIMESTAMP,
  INDEX idx_date (date)
)

-- Entity profiles
entity_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  entity_name VARCHAR(255) NOT NULL,
  entity_type ENUM('bank', 'company', 'ministry', 'ngo'),
  sector VARCHAR(100),
  description_en TEXT,
  description_ar TEXT,
  contact_info JSON,
  metrics JSON,
  created_at TIMESTAMP
)
```

---

## API & Routers

### tRPC Router Structure (14 Main Routers)

```typescript
// server/routers/yeto.router.ts
export const appRouter = router({
  // Authentication & user management
  auth: authRouter,                // Login, logout, session management
  
  // Core data endpoints
  indicators: indicatorsRouter,    // Economic indicators catalog
  timeSeries: timeSeriesRouter,    // Time series data queries
  fx: fxRouter,                    // Exchange rate data
  
  // Sector endpoints
  banking: bankingRouter,          // Banking sector data
  sectors: sectorsRouter,          // All sector pages
  macroeconomy: macroRouter,       // Macroeconomic indicators
  
  // Research & publications
  research: researchRouter,        // Publications library
  publications: publicationsRouter,// Publication CRUD
  
  // AI & intelligence
  oneBrain: oneBrainRouter,        // AI assistant
  ml: mlRouter,                    // ML model endpoints
  
  // Governance & evidence
  truthLayer: truthLayerRouter,    // Evidence verification
  evidence: evidenceRouter,        // Evidence packs
  provenance: provenanceRouter,    // Provenance queries
  
  // Admin & operations
  admin: adminRouter,              // Admin dashboard
  ingestion: ingestionRouter,      // Data ingestion control
  scheduler: schedulerRouter,      // Job scheduling
  sourceRegistry: sourceRegistryRouter, // Source management
  backfill: backfillRouter,        // Historical backfill
  dataInfra: dataInfraRouter,      // Infrastructure metrics
  
  // Advanced features
  vipCockpit: vipCockpitRouter,    // VIP features
  partnerEngine: partnerEngineRouter, // Partner API
  feedMatrix: feedMatrixRouter,    // Data feeds
  
  // Utilities
  storage: storageRouter,          // File storage
  webhooks: webhooksRouter,        // Webhook management
  apiKeys: apiKeysRouter,          // API key management
})
```

### Key Endpoint Examples

#### FX Router (`fxRouter.ts`)

```typescript
export const fxRouter = router({
  // Get latest exchange rates for all regimes
  getLatestRates: publicProcedure.query(async () => {
    // Returns: { IRG: 1520, DFA: 530, PAR: 1650 }
  }),
  
  // Get historical rates with date range
  getRates: publicProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
      regimeTag: z.enum(['IRG', 'DFA', 'PAR']).optional()
    }))
    .query(async ({ input }) => {
      // Returns time series array
    }),
  
  // Get chart-ready data
  getChartData: publicProcedure
    .input(z.object({
      period: z.enum(['7d', '30d', '90d', '1y', 'all']),
      regimes: z.array(z.enum(['IRG', 'DFA', 'PAR']))
    }))
    .query(async ({ input }) => {
      // Returns formatted chart data
    })
})
```

#### OneBrain Router (`oneBrainRouter.ts`)

```typescript
export const oneBrainRouter = router({
  // Chat with AI assistant
  chat: protectedProcedure
    .input(z.object({
      message: z.string(),
      conversationId: z.string().optional(),
      persona: z.enum(['analyst', 'researcher', 'journalist']).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // Returns: { response, sources, confidence }
    }),
  
  // Get suggested queries
  suggestQueries: publicProcedure
    .input(z.object({
      sector: z.string().optional(),
      userType: z.string().optional()
    }))
    .query(async ({ input }) => {
      // Returns array of suggested questions
    }),
  
  // Verify AI response against evidence
  verifyResponse: protectedProcedure
    .input(z.object({
      responseId: z.string()
    }))
    .query(async ({ input }) => {
      // Returns evidence chain and confidence score
    })
})
```

#### Source Registry Router (`sourceRegistry.ts`)

```typescript
export const sourceRegistryRouter = router({
  // Get all sources with filters
  getSources: publicProcedure
    .input(z.object({
      tier: z.enum(['T0', 'T1', 'T2', 'T3', 'T4', 'UNKNOWN']).optional(),
      status: z.enum(['ACTIVE', 'PENDING_REVIEW', 'NEEDS_KEY']).optional(),
      sector: z.string().optional(),
      searchQuery: z.string().optional()
    }))
    .query(async ({ input }) => {
      // Returns filtered source list
    }),
  
  // Bulk classify sources
  bulkClassify: adminProcedure
    .input(z.object({
      sourceIds: z.array(z.number()),
      tier: z.enum(['T0', 'T1', 'T2', 'T3', 'T4'])
    }))
    .mutation(async ({ input }) => {
      // Updates tier classifications
    })
})
```

---

## Data Sources & Connectors

### Connector Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                    CONNECTOR FRAMEWORK                          │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  BaseConnector (Abstract Class)                                │
│  ├── connect()        → Establish connection                   │
│  ├── fetchData()      → Retrieve raw data                      │
│  ├── transform()      → Normalize to schema                    │
│  ├── validate()       → Quality checks                         │
│  ├── persist()        → Save to database                       │
│  └── logProvenance()  → Record audit trail                     │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Implemented Connectors (26)

#### International Financial Institutions

| Connector | Source | Data Types | Update Frequency |
|-----------|--------|------------|------------------|
| `worldBankConnector.ts` | World Bank WDI API | GDP, inflation, trade, poverty | Quarterly |
| `imfConnector.ts` | IMF WEO/IFS | Fiscal, monetary, BOP | Monthly |
| `adbConnector.ts` | Asian Development Bank | Development indicators | Quarterly |

#### Central Banks

| Connector | Source | Data Types | Update Frequency |
|-----------|--------|------------|------------------|
| `cbyAdenConnector.ts` | CBY Aden | Exchange rates, directives, banking | Weekly |
| `cbySanaaConnector.ts` | CBY Sana'a | Exchange rates, directives | Weekly |

#### UN Agencies

| Connector | Source | Data Types | Update Frequency |
|-----------|--------|------------|------------------|
| `unhcrConnector.ts` | UNHCR API | IDP/refugee statistics | Monthly |
| `wfpConnector.ts` | WFP VAM | Food prices, access | Weekly |
| `unicefConnector.ts` | UNICEF | Child welfare, education | Quarterly |
| `whoConnector.ts` | WHO | Health statistics | Quarterly |
| `undpConnector.ts` | UNDP | HDI, development | Annual |
| `ochaConnector.ts` | OCHA FTS | Humanitarian funding | Daily |

#### Humanitarian & Conflict Data

| Connector | Source | Data Types | Update Frequency |
|-----------|--------|------------|------------------|
| `hdxConnector.ts` | HDX (Humanitarian Data Exchange) | Multi-source humanitarian data | Weekly |
| `reliefWebConnector.ts` | ReliefWeb API | Reports, updates | Daily |
| `fewsnetConnector.ts` | FEWS NET | Food security outlook | Weekly |
| `acledConnector.ts` | ACLED | Conflict events | Daily |
| `ucdpConnector.ts` | UCDP | Battle deaths, locations | Monthly |

#### Sanctions & Compliance

| Connector | Source | Data Types | Update Frequency |
|-----------|--------|------------|------------------|
| `ofacConnector.ts` | OFAC SDN List | Sanctions entities | Daily |
| `euSanctionsConnector.ts` | EU Sanctions | Sanctions entities | Weekly |
| `ukSanctionsConnector.ts` | UK Treasury | Sanctions entities | Weekly |

#### Exchange Rate Sources

| Connector | Source | Data Types | Update Frequency |
|-----------|--------|------------|------------------|
| `fxRatesConnector.ts` | Multi-source aggregator | IRG, DFA, parallel rates | Daily |
| `parallelMarketConnector.ts` | Market data | Parallel market rates | Daily |

#### Other Data Sources

| Connector | Source | Data Types | Update Frequency |
|-----------|--------|------------|------------------|
| `energyConnector.ts` | Energy databases | Oil, gas, fuel prices | Weekly |
| `tradeConnector.ts` | Trade statistics | Import/export | Monthly |
| `laborConnector.ts` | Labor statistics | Employment, wages | Quarterly |

### Connector Implementation Example

```typescript
// server/connectors/worldBankConnector.ts
import { BaseConnector } from './BaseConnector'
import axios from 'axios'

export class WorldBankConnector extends BaseConnector {
  private apiBase = 'https://api.worldbank.org/v2'
  
  async fetchData(params: ConnectorParams) {
    const { indicator, startYear, endYear } = params
    
    // Fetch from World Bank API
    const response = await axios.get(
      `${this.apiBase}/country/YEM/indicator/${indicator}`,
      {
        params: {
          date: `${startYear}:${endYear}`,
          format: 'json'
        }
      }
    )
    
    return response.data[1] // World Bank returns [metadata, data]
  }
  
  transform(rawData: any[]) {
    return rawData.map(item => ({
      indicatorCode: item.indicator.id,
      date: item.date,
      value: parseFloat(item.value),
      regimeTag: 'UNIFIED', // Pre-2015 or unified data
      confidence: 'A', // World Bank is T0 source
      sourceId: this.sourceId
    }))
  }
  
  async validate(data: any[]) {
    // Check for required fields
    for (const item of data) {
      if (!item.value || !item.date) {
        throw new Error(`Invalid data: ${JSON.stringify(item)}`)
      }
    }
    return true
  }
}
```

---

## Frontend Components

### Component Categories

#### UI Primitives (`client/src/components/ui/`) - 50+ Components

Based on [shadcn/ui](https://ui.shadcn.com/) and Radix UI:

```
button.tsx               → Button variants (primary, secondary, ghost, etc.)
card.tsx                 → Card containers
dialog.tsx               → Modal dialogs
dropdown-menu.tsx        → Dropdown menus
table.tsx                → Data tables
input.tsx                → Form inputs
select.tsx               → Select dropdowns
tabs.tsx                 → Tab navigation
accordion.tsx            → Collapsible sections
alert.tsx                → Alert messages
badge.tsx                → Status badges
checkbox.tsx             → Checkboxes
slider.tsx               → Range sliders
tooltip.tsx              → Tooltips
popover.tsx              → Popovers
progress.tsx             → Progress bars
radio-group.tsx          → Radio buttons
scroll-area.tsx          → Scrollable areas
separator.tsx            → Dividers
sheet.tsx                → Slide-out panels
skeleton.tsx             → Loading placeholders
switch.tsx               → Toggle switches
textarea.tsx             → Multi-line text inputs
toast.tsx                → Toast notifications
[30+ more components]
```

#### Domain Components (`client/src/components/`)

```
Header.tsx                        → Global header with navigation
Footer.tsx                        → Global footer
LanguageToggle.tsx                → Arabic/English switcher
DashboardLayout.tsx               → Page layout wrapper
Breadcrumb Nav.tsx                → Navigation breadcrumbs

// Data Display
TimeSeriesChart.tsx               → Line/area charts (Recharts)
ExchangeRateWidget.tsx            → Live FX display
IndicatorCard.tsx                 → KPI card component
RegimeTag.tsx                     → IRG/DFA badge
ConfidenceScore.tsx               → A-D rating display
TrendIndicator.tsx                → Up/down arrows with %
DataTable.tsx                     → Sortable tables
ComparisionChart.tsx              → Cross-regime comparison

// Evidence & Provenance
SourcesUsedPanel.tsx              → Source list panel
EvidenceViewer.tsx                → Evidence detail modal
ProvenanceTimeline.tsx            → Audit trail visualization
ConfidenceExplainer.tsx           → Confidence methodology

// AI Features
AIChatBox.tsx                     → Chat interface
AIResponseCard.tsx                → AI response display
SuggestedQueries.tsx              → Query suggestions
EvidenceHighlight.tsx             → Source citation highlights

// Export & Tools
DataExportButton.tsx              → CSV/JSON/XLSX export
DownloadMethodology.tsx           → Methodology PDF download
ShareButton.tsx                   → Share link generator
BookmarkButton.tsx                → Save for later

// Admin Components
IngestionControl.tsx              → Start/stop connectors
SchedulerControl.tsx              → Manage cron jobs
SourceEditor.tsx                  → Edit source registry
BulkClassifier.tsx                → Bulk tier assignment
AuditLogViewer.tsx                → View audit logs

// Sector-Specific
BankingTable.tsx                  → Banking sector table
FXChartComparison.tsx             → Multi-regime FX chart
TimelineVisualization.tsx         → Economic events timeline
SanctionsTable.tsx                → Sanctions entity list
```

### Page Components (`client/src/pages/`)

#### Public Pages

```
Home.tsx                          → Landing page
Dashboard.tsx                     → Main dashboard
About.tsx                         → About YETO
Sitemap.tsx                       → Site navigation
Pricing.tsx                       → Subscription tiers
```

#### Sector Pages (`client/src/pages/sectors/`)

```
Banking.tsx                       → Banking sector analysis
Currency.tsx                      → FX & currency markets
Energy.tsx                        → Energy sector (oil, gas, electricity)
FoodSecurity.tsx                  → Food security & nutrition
Labor.tsx                         → Labor market & employment
Trade.tsx                         → Trade & commerce
Macroeconomy.tsx                  → Macroeconomic indicators
AidFlows.tsx                      → Humanitarian aid tracking
Poverty.tsx                       → Poverty & human development
Sanctions.tsx                     → Sanctions monitoring
PublicDebt.tsx                    → Public debt analysis
Remittances.tsx                   → Remittances & diaspora
Agriculture.tsx                   → Agriculture sector
Infrastructure.tsx                → Infrastructure
InvestmentClimate.tsx             → Investment climate
Compliance.tsx                    → Regulatory compliance
RegionalZones.tsx                 → Regional analysis
```

#### Advanced Features

```
AIAssistantEnhanced.tsx           → OneBrain AI interface
ResearchLibrary.tsx               → Publications browser
AdvancedSearch.tsx                → Multi-field search
ComparisonTool.tsx                → Cross-regime comparison
PolicyImpact.tsx                  → Policy impact analysis
Changelog.tsx                     → Transparency changelog
SourceDetail.tsx                  → Source detail page
EntityDetail.tsx                  → Entity profile page
DocumentDetail.tsx                → Document viewer
```

#### Admin Portal (`client/src/pages/admin/`)

```
AdminPortal.tsx                   → Admin dashboard
IngestionDashboard.tsx            → Data ingestion monitoring
SchedulerManager.tsx              → Job scheduling
SourceRegistry.tsx                → Source management
BulkClassification.tsx            → Bulk tier assignment
UserManagement.tsx                → User CRUD
APIKeyManagement.tsx              → API key issuance
AuditLogs.tsx                     → System audit logs
DataQuality.tsx                   → Data quality metrics
ConnectorHealth.tsx               → Connector status
PerformanceMonitoring.tsx         → System performance
BackupManager.tsx                 → Backup/restore
SecuritySettings.tsx              → Security configuration
SystemSettings.tsx                → Global settings
ReleaseGate.tsx                   → Deployment gate checks
[21+ more admin pages]
```

#### VIP Features (`client/src/pages/vip/`)

```
VIPCockpit.tsx                    → Executive dashboard
ExecutiveBriefing.tsx             → Automated briefings
```

---

## Backend Services

### Service Layer Architecture

```
server/services/
├── Core Business Logic
│   ├── aiSafetyGates.ts              → Validate AI outputs
│   ├── analytics-engine.ts           → Analytics processing
│   ├── confidenceRating.ts           → Data confidence algorithms
│   ├── contradictionDetector.ts      → Detect conflicting sources
│   ├── dataVintages.ts               → Historical data versioning
│   ├── evidenceTribunal.ts           → Evidence validation
│   ├── ingestion-orchestrator.ts     → Coordinate ingestion
│   ├── provenanceLedger.ts           → Track data lineage
│   ├── publication-engine.ts         → Publication workflow
│   └── publicChangelog.ts            → Transparency log
│
├── Data Processing
│   ├── dataTransform.ts              → Data transformation
│   ├── dataNormalization.ts          → Schema normalization
│   ├── dataValidation.ts             → Quality checks
│   ├── dataDeduplication.ts          → Remove duplicates
│   └── dataEnrichment.ts             → Add metadata
│
├── Governance
│   ├── truthLayer.ts                 → Truth enforcement
│   ├── publicationGate.ts            → Pre-publish checks
│   ├── goLiveGate.ts                 → Deployment gate
│   ├── reliabilityLab.ts             → Source reliability
│   └── sanctionsCompliance.ts        → Sanctions screening
│
├── ML & AI
│   ├── oneBrainService.ts            → AI assistant core
│   ├── glossaryIntelligence.ts       → Term extraction
│   ├── timelineIntelligence.ts       → Event detection
│   ├── visualIntelligence.ts         → Chart generation
│   └── personalizationEngine.ts      → User personalization
│
├── Export & Reporting
│   ├── csvExporter.ts                → CSV export
│   ├── jsonExporter.ts               → JSON export
│   ├── xlsxExporter.ts               → Excel export
│   ├── pdfGenerator.ts               → PDF reports
│   └── reportEngine.ts               → Automated reports
│
├── Storage
│   ├── s3Storage.ts                  → S3 file operations
│   ├── fileUpload.ts                 → Upload handler
│   ├── fileDownload.ts               → Download handler
│   └── imageOptimization.ts          → Image processing
│
├── Notifications
│   ├── emailService.ts               → Email sender
│   ├── alertService.ts               → Alert system
│   ├── webhookDispatcher.ts          → Webhook delivery
│   └── notificationQueue.ts          → Queue management
│
└── Utilities
    ├── dateHelpers.ts                → Date utilities
    ├── regimeHelpers.ts              → Regime tag helpers
    ├── translationHelpers.ts         → i18n utilities
    ├── cacheManager.ts               → Cache operations
    └── rateLimiter.ts                → Rate limiting
```

### Key Service Implementations

#### Confidence Rating Service

```typescript
// server/governance/confidenceRating.ts
export interface ConfidenceFactors {
  sourceReliability: number;      // 0-1 based on tier
  dataFreshness: number;          // 0-1 based on age
  methodologyClarity: number;     // 0-1 based on documentation
  triangulation: number;          // 0-1 based on corroboration
  contradictions: number;         // 0-1 (inverted, 0 = many conflicts)
}

export function calculateConfidence(factors: ConfidenceFactors): {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
} {
  const weights = {
    sourceReliability: 0.35,
    dataFreshness: 0.20,
    methodologyClarity: 0.20,
    triangulation: 0.15,
    contradictions: 0.10
  }
  
  const score = Object.entries(factors).reduce((sum, [key, value]) => {
    return sum + value * weights[key as keyof ConfidenceFactors]
  }, 0)
  
  let grade: 'A' | 'B' | 'C' | 'D'
  if (score >= 0.85) grade = 'A'
  else if (score >= 0.70) grade = 'B'
  else if (score >= 0.50) grade = 'C'
  else grade = 'D'
  
  return { score, grade }
}
```

#### Provenance Ledger

```typescript
// server/governance/provenanceLedger.ts
export interface ProvenanceRecord {
  entityType: 'timeseries' | 'publication' | 'bank' | 'event';
  entityId: number;
  sourceId: number;
  retrievalTimestamp: Date;
  transformationLog: string[];
  qualityScore: number;
  confidenceGrade: 'A' | 'B' | 'C' | 'D';
}

export async function recordProvenance(record: ProvenanceRecord) {
  await db.insert(provenanceRecords).values({
    ...record,
    transformationLog: JSON.stringify(record.transformationLog)
  })
}

export async function getProvenanceChain(
  entityType: string,
  entityId: number
): Promise<ProvenanceRecord[]> {
  return await db
    .select()
    .from(provenanceRecords)
    .where(
      and(
        eq(provenanceRecords.entityType, entityType),
        eq(provenanceRecords.entityId, entityId)
      )
    )
    .orderBy(desc(provenanceRecords.retrievalTimestamp))
}
```

#### Evidence Tribunal

```typescript
// server/services/evidenceTribunal.ts
export interface EvidenceCheck {
  hasEvidence: boolean;
  sourceRegistered: boolean;
  meetsConfidenceThreshold: boolean;
  noContradictions: boolean;
  dataFresh: boolean;
  noHallucination: boolean;
  sanctionsCompliant: boolean;
  piiRemoved: boolean;
}

export async function validateEvidence(
  claim: string,
  sources: number[]
): Promise<EvidenceCheck> {
  const checks: EvidenceCheck = {
    hasEvidence: sources.length > 0,
    sourceRegistered: await checkSourcesRegistered(sources),
    meetsConfidenceThreshold: await checkConfidence(sources),
    noContradictions: await checkContradictions(claim, sources),
    dataFresh: await checkFreshness(sources),
    noHallucination: await checkHallucination(claim, sources),
    sanctionsCompliant: await checkSanctions(claim),
    piiRemoved: await checkPII(claim)
  }
  
  return checks
}

export function passesPublicationGate(checks: EvidenceCheck): boolean {
  return Object.values(checks).every(check => check === true)
}
```

---

## Data Pipeline

### ETL Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ETL PIPELINE FRAMEWORK                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────┐      ┌────────────┐      ┌────────────┐         │
│  │  EXTRACT   │─────▶│ TRANSFORM  │─────▶│    LOAD    │         │
│  └────────────┘      └────────────┘      └────────────┘         │
│        │                    │                    │               │
│        │                    │                    │               │
│  • API Calls          • Normalize          • Validate           │
│  • Web Scraping       • Enrich             • Deduplicate        │
│  • File Parsing       • Translate          • Insert/Update      │
│  • Database Query     • Tag Regime         • Record Provenance  │
│                       • Score Confidence                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐       │
│  │              GOVERNANCE CHECKPOINTS                   │       │
│  │  1. Source Verification   5. Data Freshness          │       │
│  │  2. Schema Validation     6. Contradiction Check     │       │
│  │  3. Quality Scoring       7. Sanctions Screening     │       │
│  │  4. Confidence Rating     8. PII Removal             │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Ingestion Scheduler

```typescript
// server/scheduler/ingestionScheduler.ts
import { CronJob } from 'cron'

export const scheduledJobs = [
  {
    name: 'FX Rates - Daily',
    schedule: '0 8 * * *',           // 8am daily
    connector: 'fxRatesConnector',
    enabled: true
  },
  {
    name: 'World Bank - Monthly',
    schedule: '0 2 1 * *',           // 2am on 1st of month
    connector: 'worldBankConnector',
    enabled: true
  },
  {
    name: 'OFAC Sanctions - Daily',
    schedule: '0 3 * * *',           // 3am daily
    connector: 'ofacConnector',
    enabled: true
  },
  {
    name: 'ACLED Conflicts - Daily',
    schedule: '0 4 * * *',           // 4am daily
    connector: 'acledConnector',
    enabled: true
  },
  {
    name: 'OCHA FTS - Hourly',
    schedule: '0 * * * *',           // Top of every hour
    connector: 'ochaConnector',
    enabled: true
  },
  {
    name: 'CBY Aden - Weekly',
    schedule: '0 6 * * 1',           // 6am Mondays
    connector: 'cbyAdenConnector',
    enabled: true
  },
  {
    name: 'Research Ingestion - Weekly',
    schedule: '0 5 * * 0',           // 5am Sundays
    connector: 'researchConnector',
    enabled: true
  },
  {
    name: 'Banking Data - Monthly',
    schedule: '0 7 15 * *',          // 7am on 15th
    connector: 'bankingConnector',
    enabled: true
  },
  {
    name: 'Health Check - Every 5min',
    schedule: '*/5 * * * *',         // Every 5 minutes
    connector: 'healthChecker',
    enabled: true
  },
  {
    name: 'Backup - Daily',
    schedule: '0 1 * * *',           // 1am daily
    connector: 'backupService',
    enabled: true
  },
  {
    name: 'ML Model Update - Weekly',
    schedule: '0 3 * * 0',           // 3am Sundays
    connector: 'mlTrainer',
    enabled: true
  }
]
```

### Ingestion Flow Example

```typescript
// server/pipeline/index.ts
export async function runIngestionPipeline(
  connectorName: string
): Promise<IngestionResult> {
  const run = await createIngestionRun(connectorName)
  
  try {
    // 1. Extract
    const connector = getConnector(connectorName)
    const rawData = await connector.fetchData()
    
    // 2. Transform
    const transformedData = await connector.transform(rawData)
    
    // 3. Validate
    const validData = await validateData(transformedData)
    
    // 4. Enrich
    const enrichedData = await enrichData(validData)
    
    // 5. Govern
    const governedData = await applyGovernance(enrichedData)
    
    // 6. Load
    const result = await loadData(governedData)
    
    // 7. Record Provenance
    await recordProvenance(result)
    
    await completeIngestionRun(run.id, 'completed', result)
    
    return result
  } catch (error) {
    await completeIngestionRun(run.id, 'failed', { error })
    throw error
  }
}
```

---

## Governance & Security

### Truth Layer Architecture

```typescript
// server/governance/truthLayer.ts
export const TruthLayerRules = {
  // Rule 1: No data without evidence
  evidenceRequired: true,
  
  // Rule 2: Every source must be registered
  sourceVerification: true,
  
  // Rule 3: Minimum confidence threshold
  confidenceThreshold: 0.50, // C grade minimum
  
  // Rule 4: Detect contradictions
  contradictionCheck: true,
  
  // Rule 5: Data freshness requirements
  freshnessRequired: true,
  maxStaleness: {
    daily: 7,      // 7 days
    weekly: 30,    // 30 days
    monthly: 90,   // 90 days
    quarterly: 180,// 180 days
    annual: 730    // 2 years
  },
  
  // Rule 6: No AI hallucination
  aiGrounding: true,
  
  // Rule 7: Sanctions compliance
  sanctionsScreening: true,
  
  // Rule 8: PII removal
  piiProtection: true
}
```

### Publication Gate (8 Hard Gates)

```typescript
// server/hardening/productionReadiness.ts
export interface PublicationGateResult {
  passed: boolean;
  gates: {
    evidenceAttached: boolean;
    sourceRegistered: boolean;
    confidenceScore: boolean;
    noContradictions: boolean;
    dataFreshness: boolean;
    noHallucination: boolean;
    sanctionsCompliant: boolean;
    piiRemoved: boolean;
  };
  errors: string[];
}

export async function runPublicationGate(
  entity: any
): Promise<PublicationGateResult> {
  const gates = {
    evidenceAttached: await checkEvidence(entity),
    sourceRegistered: await checkSourceRegistry(entity),
    confidenceScore: await checkConfidence(entity),
    noContradictions: await checkContradictions(entity),
    dataFreshness: await checkFreshness(entity),
    noHallucination: await checkHallucination(entity),
    sanctionsCompliant: await checkSanctions(entity),
    piiRemoved: await checkPII(entity)
  }
  
  const passed = Object.values(gates).every(gate => gate === true)
  const errors = Object.entries(gates)
    .filter(([_, passed]) => !passed)
    .map(([gate, _]) => `Failed: ${gate}`)
  
  return { passed, gates, errors }
}
```

### Security Implementation

#### Authentication Flow

```typescript
// server/_core/oauth.ts
import { SignJWT, jwtVerify } from 'jose'

export async function createSession(userId: number): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET)
  
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
  
  return token
}

export async function verifySession(token: string): Promise<{ userId: number }> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET)
  const { payload } = await jwtVerify(token, secret)
  return payload as { userId: number }
}
```

#### Authorization Middleware

```typescript
// server/_core/trpc.ts
import { TRPCError } from '@trpc/server'

// Public procedure (no auth required)
export const publicProcedure = t.procedure

// Protected procedure (requires auth)
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({ ctx: { ...ctx, user: ctx.user } })
})

// Admin procedure (requires admin role)
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }
  return next({ ctx })
})
```

#### Audit Logging

```typescript
// server/security/auditLogger.ts
export async function logAuditEvent(event: {
  userId?: number;
  action: string;
  entityType: string;
  entityId: number;
  changes?: object;
  ipAddress: string;
  userAgent: string;
}) {
  await db.insert(auditLogs).values({
    ...event,
    changes: event.changes ? JSON.stringify(event.changes) : null,
    createdAt: new Date()
  })
}

// Usage example
await logAuditEvent({
  userId: ctx.user.id,
  action: 'UPDATE_SOURCE_TIER',
  entityType: 'evidence_source',
  entityId: 42,
  changes: { tier: { from: 'UNKNOWN', to: 'T1' } },
  ipAddress: ctx.req.ip,
  userAgent: ctx.req.headers['user-agent']
})
```

---

## Documentation

### Documentation Structure (`/docs/` - 234 files)

```
docs/
├── 0_START_HERE.md                      → Entry point for new developers
├── ARCHITECTURE.md                      → System architecture overview
├── API_REFERENCE.md                     → API documentation
├── ADMIN_MANUAL.md                      → Admin operations guide
├── SUBSCRIBER_GUIDE.md                  → User manual
│
├── Data Governance
│   ├── DATA_GOVERNANCE.md               → Governance policies
│   ├── DATA_SOURCE_REGISTER.md          → All 292 sources documented
│   ├── DATA_SOURCES_CATALOG.md          → Source categories
│   ├── MASTER_SOURCE_REGISTRY.md        → Registry v2.5
│   ├── CORRECTIONS_POLICY.md            → Error handling
│   └── CONFIDENCE_SCORING.md            → Rating methodology
│
├── Technical Documentation
│   ├── DATA_ARCHITECTURE.md             → Database design
│   ├── ML_INFRASTRUCTURE.md             → ML system design
│   ├── DISCOVERY_ENGINE.md              → Search architecture
│   ├── VISUALIZATION_ENGINE.md          → Chart system
│   ├── REPORTING_ENGINE.md              → Report generation
│   ├── BACKFILL_SYSTEM.md               → Historical data ingestion
│   ├── INGESTION_ORCHESTRATION.md       → Pipeline docs
│   └── WEBHOOK_CONFIGURATION.md         → Webhook setup
│
├── Operations
│   ├── DEPLOYMENT_GUIDE.md              → Deployment procedures
│   ├── PRODUCTION_DEPLOYMENT_GUIDE.md   → Production deployment
│   ├── AWS_DEPLOYMENT_GUIDE.md          → AWS-specific deployment
│   ├── RUNBOOK_AWS.md                   → AWS runbook
│   ├── DISASTER_RECOVERY.md             → DR procedures
│   ├── BACKUP_RESTORE.md                → Backup procedures
│   ├── SECURITY_RUNBOOK.md              → Security ops
│   └── RECOVERY_RUNBOOK.md              → Incident recovery
│
├── Sector Methodology
│   ├── BANKING_METHODOLOGY.md           → Banking data methodology
│   ├── labor-methodology.md             → Labor market methodology
│   ├── SANCTIONS_METHODOLOGY.md         → Sanctions screening
│   └── TIMELINE_SCHEMA.md               → Economic events
│
├── Audit Reports
│   ├── BACKEND_AUDIT_REPORT.md          → Backend code audit
│   ├── AUDIT_BANKING_SECTOR.md          → Banking sector audit
│   ├── BANKING_UI_AUDIT.md              → Banking UI audit
│   ├── ROUTE_AUDIT.md                   → API route audit
│   ├── ROUTE_HEALTH_REPORT.md           → Endpoint health
│   ├── HOMEPAGE_AUDIT.md                → Homepage audit
│   ├── ONE_BRAIN_AUDIT.md               → AI system audit
│   ├── STATE_AUDIT_DECISION_PACKET.md   → State management
│   └── SMOKE_TEST_RESULTS.md            → Test results
│
├── Implementation
│   ├── MASTER_IMPLEMENTATION_CHECKLIST.md → Implementation tracker
│   ├── EXECUTION_PLAN.md                → Execution strategy
│   ├── IMPLEMENTATION_ROADMAP.md        → Roadmap
│   ├── WORKPLAN.md                      → Work breakdown
│   └── MASTER_TODO.md                   → Outstanding tasks
│
├── Data Quality
│   ├── COVERAGE_SCORECARD.md            → Data coverage metrics
│   ├── GAP_TICKETS.md                   → Data gap tracking
│   ├── NO_MOCK_DATA_GUARDRAIL.md        → Anti-hallucination policy
│   ├── P0_INGESTION_LINTER.md           → Data quality linter
│   └── HARDCODE_REPORT.md               → Hardcoded data report
│
├── Proofs & Evidence
│   └── PROOFS/                          → Screenshot evidence (57 files)
│       ├── *.webp                       → Screenshots (29 files)
│       └── *.md                         → Proof documents (16 files)
│
├── AUDIT_PACK/                          → Comprehensive audit (29 files)
│   ├── *.md                             → Audit reports (17 files)
│   └── *.txt                            → Audit logs (12 files)
│
└── Migration & Integration
    ├── POSTGRESQL_MIGRATION_GUIDE.md    → PostgreSQL migration
    ├── PROVIDER_SWITCH.md               → Provider switching
    ├── WEBHOOK_INTEGRATION_GUIDE.md     → Webhook integration
    └── ML_INTEGRATION_GUIDE.md          → ML integration
```

### Key Documentation Files

| File | Purpose | Audience |
|------|---------|----------|
| `0_START_HERE.md` | Quick start guide | All |
| `ARCHITECTURE.md` | System design | Developers |
| `API_REFERENCE.md` | API endpoints | API users |
| `ADMIN_MANUAL.md` | Admin operations | Admins |
| `SUBSCRIBER_GUIDE.md` | User guide | End users |
| `DATA_GOVERNANCE.md` | Data policies | Data team |
| `DEPLOYMENT_GUIDE.md` | Deployment steps | DevOps |
| `BANKING_METHODOLOGY.md` | Banking data methods | Analysts |
| `COVERAGE_SCORECARD.md` | Data coverage status | Management |

---

## Scripts & Utilities

### Scripts Directory (`/scripts/` - 53 files)

#### Database Seeding

```bash
scripts/
├── seed.ts                              → Main seed script
├── seed-all-banks.ts                    → Seed banking data
├── seed-complete-database.ts            → Full database seed
├── seed-comprehensive-timeline.ts       → Timeline events
├── seed-indicators.ts                   → Economic indicators
├── seed-glossary.mjs                    → Bilingual glossary
├── seed-knowledge-base.mjs              → Knowledge base
├── seed-master-registry.ts              → Source registry v2.5
├── seed-entities.mjs                    → Entity profiles
├── seed-sanctions.ts                    → Sanctions data
├── seed-truth-layer.ts                  → Truth layer init
└── seed-cby-directives.ts               → CBY directives
```

#### Data Ingestion

```bash
scripts/
├── ingest-2024-2026-data.ts             → Recent data ingestion
├── ingest-backfill-data.ts              → Historical backfill
├── ingest-research-data.ts              → Research publications
├── ingest-labor-data.ts                 → Labor market data
├── ingest-public-finance-data.ts        → Fiscal data
├── ingest-infrastructure-data.ts        → Infrastructure data
├── ingest-hdi-data.ts                   → Human development
├── comprehensive-data-ingestion.ts      → Full ingestion
├── comprehensive-backfill.mjs           → Comprehensive backfill
└── run-real-connectors.mjs              → Run all connectors
```

#### Data Processing

```bash
scripts/
├── populate-all-data.ts                 → Populate all tables
├── populate-comprehensive-data.ts       → Comprehensive population
├── populate-indicators.ts               → Populate indicators
├── populate-confidence-ratings.ts       → Calculate confidence
├── populate-evidence-packs.mjs          → Generate evidence packs
├── populate-gap-tickets.mjs             → Create gap tickets
├── enhance-source-registry.ts           → Enrich source data
└── batch-update-sectors.ts              → Batch sector updates
```

#### Import & Export

```bash
scripts/
├── import-source-registry-v2.ts         → Import registry v2.5
├── import-registry-v2.3.ts              → Import v2.3
├── import-data-to-production.ts         → Production import
├── export-data-for-production.ts        → Production export
├── sync-databases.mjs                   → Sync dev/prod
└── verify-data-counts.mjs               → Verify data integrity
```

#### Testing & Validation

```bash
scripts/
├── validate.ts                          → Data validation
├── test-all-routes.ts                   → API route testing
├── comprehensive-site-audit.ts          → Full site audit
├── release-gate.mjs                     → Pre-deployment checks
├── check-db-counts.ts                   → Database count check
├── check-research-db.ts                 → Research data check
└── db-check.mjs                         → Database health check
```

#### Maintenance & Operations

```bash
scripts/
├── refresh-all-data.ts                  → Refresh all sources
├── refresh-all-apis.ts                  → Refresh API data
├── setup-scheduler-jobs.ts              → Initialize cron jobs
├── run-backfill.ts                      → Run backfill job
├── post-deployment-setup.ts             → Post-deploy tasks
└── create-banking-tables.mjs            → Create banking tables
```

#### Utilities

```bash
scripts/
├── generate-audit-excel.py              → Generate audit reports
├── generate-ux-tracking.py              → UX analytics
├── check-large-files.sh                 → Find large files
├── bootstrap_dev.sh                     → Dev environment setup
├── bootstrap_staging.sh                 → Staging setup
└── bootstrap_prod.sh                    → Production setup
```

### Script Execution Examples

```bash
# Seed database from scratch
pnpm tsx scripts/seed-complete-database.ts

# Run all data connectors
pnpm tsx scripts/run-real-connectors.mjs

# Import source registry v2.5
pnpm tsx scripts/import-source-registry-v2.ts

# Run release gate checks
node scripts/release-gate.mjs

# Backfill historical data
pnpm tsx scripts/run-backfill.ts

# Validate all data
pnpm tsx scripts/validate.ts

# Test all API routes
pnpm tsx scripts/test-all-routes.ts

# Setup scheduler jobs
pnpm tsx scripts/setup-scheduler-jobs.ts
```

---

## Testing Infrastructure

### Test Suite Overview

| Test Type | Count | Location | Framework |
|-----------|-------|----------|-----------|
| **Unit Tests** | 380+ | `server/**/*.test.ts` | Vitest |
| **E2E Tests** | 50+ | `e2e/*.ts` | Playwright |
| **Integration Tests** | 100+ | `server/integration.test.ts` | Vitest |
| **Component Tests** | 50+ | `client/src/**/*.test.tsx` | React Testing Library |

### Test Files by Category

#### Backend Tests (`server/**/*.test.ts`)

```
server/
├── ai.chat.test.ts                      → AI chat functionality
├── aiSafetyGates.test.ts                → AI safety validation
├── auth.logout.test.ts                  → Authentication
├── connectorHealthAlerts.test.ts        → Connector monitoring
├── connectors.test.ts                   → Connector logic
├── evidence-rule.test.ts                → Evidence rules
├── evidenceTribunal.test.ts             → Evidence validation
├── hardening.test.ts                    → Production readiness
├── integration.test.ts                  → Integration tests
├── placeholderDetector.test.ts          → Anti-hallucination
├── source-detail.test.ts                → Source details
├── time-travel.test.ts                  → Data vintages
├── truthLayer.test.ts                   → Truth layer
└── yeto.test.ts                         → Main app tests

router tests:
├── routers/bulkClassification.test.ts   → Bulk tier assignment
├── routers/evidence.test.ts             → Evidence endpoints
├── routers/feedMatrix.test.ts           → Feed matrix
├── routers/partnerEngine.test.ts        → Partner API
├── routers/publications.test.ts         → Publications
├── routers/releaseGate.test.ts          → Deployment gates
├── routers/sectorPages.test.ts          → Sector pages
├── routers/sourceRegistry.test.ts       → Source registry
├── routers/updates.test.ts              → Platform updates
└── routers/vipCockpit.test.ts           → VIP features

ml tests:
├── ml/ml.test.ts                        → ML core
└── ml/oneBrain.test.ts                  → OneBrain AI
```

#### E2E Tests (`e2e/*.ts`)

```
e2e/
├── homepage.spec.ts                     → Landing page
├── dashboard.spec.ts                    → Main dashboard
├── sectors.spec.ts                      → Sector pages
├── banking.spec.ts                      → Banking sector
├── fx.spec.ts                           → Exchange rates
├── research.spec.ts                     → Research library
├── search.spec.ts                       → Search functionality
├── admin.spec.ts                        → Admin portal
├── auth.spec.ts                         → Authentication flow
└── api.spec.ts                          → API endpoints
```

### Test Coverage Goals

| Component | Target | Current |
|-----------|--------|---------|
| **Backend Services** | 80% | 75% |
| **API Routers** | 90% | 85% |
| **Frontend Components** | 70% | 65% |
| **Connectors** | 85% | 80% |
| **Governance** | 95% | 90% |

### Running Tests

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui

# Run specific test file
pnpm test server/truthLayer.test.ts

# Run tests with coverage
pnpm test --coverage
```

---

## Deployment & Infrastructure

### Infrastructure Files

```
infrastructure/
├── terraform/
│   ├── main.tf                          → Main Terraform config
│   ├── variables.tf                     → Variable definitions
│   └── outputs.tf                       → Output definitions
├── k8s/
│   └── deployment.yaml                  → Kubernetes deployment
└── scripts/
    └── deploy.sh                        → Deployment script

root level:
├── docker-compose.yml                   → Local dev compose
├── docker-compose.prod.yml              → Production compose
└── Dockerfile                           → Container image
```

### Docker Configuration

#### Development (`docker-compose.yml`)

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=mysql://user:pass@db:3306/yeto
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - db
  
  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=rootpass
      - MYSQL_DATABASE=yeto
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

#### Production (`docker-compose.prod.yml`)

```yaml
version: '3.8'
services:
  app:
    image: yeto-platform:latest
    ports:
      - "80:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - S3_BUCKET=${S3_BUCKET}
    restart: always
```

### Kubernetes Deployment

```yaml
# infra/k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: yeto-platform
spec:
  replicas: 3
  selector:
    matchLabels:
      app: yeto
  template:
    metadata:
      labels:
        app: yeto
    spec:
      containers:
      - name: yeto
        image: yeto-platform:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: yeto-secrets
              key: database-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
```

### Deployment Process

```bash
# 1. Build Docker image
docker build -t yeto-platform:latest .

# 2. Run tests
pnpm test
pnpm test:e2e

# 3. Run release gate
node scripts/release-gate.mjs

# 4. Deploy to staging
./infrastructure/scripts/deploy.sh staging

# 5. Smoke test
curl https://staging.yeto.causewaygrp.com/api/health

# 6. Deploy to production
./infrastructure/scripts/deploy.sh production

# 7. Post-deployment setup
pnpm tsx scripts/post-deployment-setup.ts
```

---

## Research & Knowledge Base

### Research Directory (`/research/` - 52 files)

```
research/
├── Banking Sector
│   ├── banking-audit-jan-2026.md
│   ├── banking-sector-audit-jan-2026.md
│   ├── yemen-licensed-banks-2024.md
│   ├── alamal_bank_data.md
│   ├── ycb_data.md
│   └── cby_aden_data.md
│
├── Trade & Currency
│   ├── trade-sector-audit-jan-2026.md
│   ├── exchange-companies-regulation-2025.md
│   └── yemen_lng_data.md
│
├── Energy
│   └── aden_refinery_data.md
│
├── International Reports
│   ├── world-bank-fall-2025-findings.md
│   └── imf-article-iv-2025-findings.md
│
├── Updates & News
│   └── yemen-updates-jan-2026.md
│
├── sectors-jan-2026/                    → Sector research (6 files)
├── publications-2019-2026/              → Publications (11 files)
└── wide-research/                       → General research (20 files)
```

### CBY Publications (`/cby-publications/` - 110 files)

```
cby-publications/
├── *.pdf                                → 106 PDF reports
└── *.doc                                → 2 DOC files

Topics include:
- Central Bank Yemen directives
- Banking regulations
- Exchange rate policies
- Financial stability reports
- Monetary policy statements
- Banking sector reports (2010-2026)
```

### Public Documents (`/public/documents/`)

```
public/documents/banking/
├── acaps-yemen-financial-sector-2022.pdf
├── cby_aden_march_2024_report.pdf
├── odi-impact-conflict-financial-sector-yemen.pdf
├── world-bank-yemen-economic-monitor-2024.pdf
└── world-bank-yemen-financial-sector-diagnostics-2024.pdf
```

---

## Getting Started Guide

### Prerequisites

```bash
# Required
- Node.js 22+
- pnpm 10+
- MySQL 8+ or TiDB
- Git

# Recommended
- Docker & Docker Compose
- AWS CLI (for S3)
- kubectl (for k8s deployment)
```

### Local Development Setup

#### 1. Clone Repository

```bash
git clone https://github.com/Causeway-banking-financial/yeto.git
cd yeto
```

#### 2. Install Dependencies

```bash
pnpm install
```

#### 3. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL=mysql://root:password@localhost:3306/yeto

# Authentication
JWT_SECRET=your-secret-key-here
VITE_APP_ID=your-app-id

# AWS S3
S3_BUCKET=yeto-documents
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1

# LLM (for AI assistant)
BUILT_IN_FORGE_API_KEY=your-llm-api-key

# External APIs (optional)
WORLD_BANK_API_KEY=your-wb-key
IMF_API_KEY=your-imf-key
```

#### 4. Database Setup

```bash
# Start MySQL with Docker
docker-compose up -d db

# Push schema to database
pnpm db:push

# Seed initial data
pnpm tsx scripts/seed-complete-database.ts

# Import source registry v2.5
pnpm tsx scripts/import-source-registry-v2.ts
```

#### 5. Start Development Server

```bash
pnpm dev
```

Open browser to `http://localhost:3000`

### Development Workflow

#### Making Code Changes

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
# ... edit files ...

# Run type checking
pnpm typecheck

# Run tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Format code
pnpm format

# Commit changes
git add .
git commit -m "feat: add my feature"

# Push to remote
git push origin feature/my-feature
```

#### Adding a New Connector

1. Create connector file:

```typescript
// server/connectors/myConnector.ts
import { BaseConnector } from './BaseConnector'

export class MyConnector extends BaseConnector {
  async fetchData(params: ConnectorParams) {
    // Implement data fetching
  }
  
  transform(rawData: any[]) {
    // Implement data transformation
  }
  
  async validate(data: any[]) {
    // Implement validation
  }
}
```

2. Register in scheduler:

```typescript
// server/scheduler/ingestionScheduler.ts
{
  name: 'My Connector - Daily',
  schedule: '0 6 * * *',
  connector: 'myConnector',
  enabled: true
}
```

3. Add tests:

```typescript
// server/connectors/myConnector.test.ts
import { describe, it, expect } from 'vitest'
import { MyConnector } from './myConnector'

describe('MyConnector', () => {
  it('should fetch data', async () => {
    // Test implementation
  })
})
```

#### Adding a New API Endpoint

1. Create router:

```typescript
// server/routers/myRouter.ts
import { router, publicProcedure } from '../_core/trpc'
import { z } from 'zod'

export const myRouter = router({
  getData: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      // Implementation
    })
})
```

2. Add to main router:

```typescript
// server/routers/yeto.router.ts
import { myRouter } from './myRouter'

export const appRouter = router({
  // ... existing routers
  myRouter: myRouter
})
```

3. Use in frontend:

```typescript
// client/src/pages/MyPage.tsx
import { trpc } from '@/lib/trpc'

export function MyPage() {
  const { data } = trpc.myRouter.getData.useQuery({ id: 1 })
  return <div>{data}</div>
}
```

### Production Deployment

#### Pre-Deployment Checklist

```bash
# 1. Run all tests
pnpm test
pnpm test:e2e

# 2. Type check
pnpm typecheck

# 3. Build production bundle
pnpm build

# 4. Run release gate
node scripts/release-gate.mjs

# 5. Database migrations
pnpm db:push
```

#### Deploy to Production

```bash
# Using Docker
docker build -t yeto-platform:v1.0.0 .
docker push yeto-platform:v1.0.0
docker-compose -f docker-compose.prod.yml up -d

# Using Kubernetes
kubectl apply -f infra/k8s/deployment.yaml
kubectl rollout status deployment/yeto-platform

# Post-deployment
pnpm tsx scripts/post-deployment-setup.ts
```

---

## Repository Statistics

### File Counts by Type

| Extension | Count | Purpose |
|-----------|-------|---------|
| `.ts` | 500+ | TypeScript source files |
| `.tsx` | 288 | React components |
| `.md` | 160+ | Documentation |
| `.pdf` | 140+ | Research publications & reports |
| `.sql` | 32 | Database migrations |
| `.json` | 35+ | Configuration & data files |
| `.test.ts` | 50+ | Test files |
| `.mjs` | 23 | ES module scripts |
| `.sh` | 5 | Shell scripts |
| `.webp` | 29 | Screenshots & images |
| `.jpg` | 78+ | Images |
| `.svg` | 10+ | Vector graphics |

### Lines of Code (Estimated)

| Category | LOC |
|----------|-----|
| Backend TypeScript | 60,000 |
| Frontend TypeScript | 45,000 |
| Tests | 15,000 |
| Database Schema | 10,000 |
| Scripts | 8,000 |
| Documentation | 12,000 |
| **Total** | **~150,000** |

### Key Metrics

| Metric | Value |
|--------|-------|
| Total Files | 1,400+ |
| Database Tables | 81 |
| API Endpoints | 100+ |
| React Components | 288 |
| Data Connectors | 26 |
| Registered Sources | 292 |
| Active Sources | 234 |
| Time Series Data Points | 5,500+ |
| Research Publications | 370+ |
| Economic Events | 83+ |
| Commercial Banks | 31 |
| Test Files | 50+ |
| Documentation Files | 160+ |

---

## Development Best Practices

### Code Standards

1. **TypeScript Strict Mode**: All code must pass strict type checking
2. **ESLint Rules**: Follow configured ESLint rules
3. **Prettier Formatting**: Auto-format on save
4. **No `any` Types**: Use proper type definitions
5. **tRPC Procedures**: All API endpoints through tRPC
6. **Zod Validation**: Validate all inputs with Zod schemas

### Naming Conventions

```typescript
// Files
ComponentName.tsx       // React components (PascalCase)
serviceName.ts          // Services (camelCase)
myRouter.ts            // Routers (camelCase)
schema.ts              // Schema files
constants.ts           // Constants

// Variables
const userName = ''    // camelCase
const USER_ROLE = ''   // SCREAMING_SNAKE_CASE for constants

// Functions
function fetchData()   // camelCase
async function getData() // async prefix optional

// Components
export function MyComponent() {} // PascalCase

// Types & Interfaces
interface User {}      // PascalCase
type ResponseData = {} // PascalCase
```

### Git Workflow

```bash
# Branch naming
feature/add-new-connector
fix/exchange-rate-bug
docs/update-readme
refactor/improve-performance
test/add-unit-tests

# Commit messages (Conventional Commits)
feat: add new World Bank connector
fix: resolve FX rate calculation bug
docs: update API documentation
refactor: optimize database queries
test: add tests for evidence tribunal
chore: update dependencies
```

### Testing Strategy

1. **Unit Tests**: Test individual functions and services
2. **Integration Tests**: Test API endpoints and data flow
3. **E2E Tests**: Test user workflows end-to-end
4. **Manual Testing**: Test UI interactions before deployment

---

## Common Tasks Reference

### Database Operations

```bash
# Generate migration
pnpm drizzle-kit generate

# Push schema to database
pnpm db:push

# Open Drizzle Studio (GUI)
pnpm db:studio

# Seed database
pnpm tsx scripts/seed-complete-database.ts

# Check database counts
pnpm tsx scripts/check-db-counts.ts

# Verify data integrity
pnpm tsx scripts/verify-data-counts.mjs
```

### Data Ingestion

```bash
# Run all connectors
pnpm tsx scripts/run-real-connectors.mjs

# Run specific connector
pnpm tsx scripts/run-backfill.ts --connector=worldBank

# Refresh all data
pnpm tsx scripts/refresh-all-data.ts

# Backfill historical data
pnpm tsx scripts/comprehensive-backfill.mjs
```

### Testing

```bash
# Run all unit tests
pnpm test

# Run specific test file
pnpm test server/truthLayer.test.ts

# Run tests in watch mode
pnpm test --watch

# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui

# Run tests with coverage
pnpm test --coverage
```

### Build & Deploy

```bash
# Type check
pnpm typecheck

# Build for production
pnpm build

# Start production server
pnpm start

# Run release gate
node scripts/release-gate.mjs

# Format code
pnpm format

# Validate code
pnpm tsx scripts/validate.ts
```

---

## Troubleshooting

### Common Issues

#### Database Connection Errors

```bash
# Check MySQL is running
docker-compose ps

# Restart database
docker-compose restart db

# Check connection string
echo $DATABASE_URL
```

#### TypeScript Errors

```bash
# Clean build cache
rm -rf node_modules/.cache

# Rebuild
pnpm typecheck
```

#### Test Failures

```bash
# Run tests with verbose output
pnpm test --reporter=verbose

# Run specific failing test
pnpm test path/to/failing.test.ts
```

#### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

---

## Support & Contact

### Documentation

- **Start Here**: `/docs/0_START_HERE.md`
- **Architecture**: `/ARCHITECTURE.md`
- **API Reference**: `/docs/API_REFERENCE.md`
- **Admin Manual**: `/docs/ADMIN_MANUAL.md`

### Contact

| Purpose | Email |
|---------|-------|
| **General Inquiries** | yeto@causewaygrp.com |
| **Technical Support** | support@causewaygrp.com |
| **Security Issues** | security@causewaygrp.com |
| **Partnerships** | partnerships@causewaygrp.com |

---

## License

This project is proprietary software owned by **Causeway Group**. All rights reserved.

For licensing inquiries: legal@causewaygrp.com

---

## Acknowledgments

### Data Sources

YETO aggregates data from 292 credible sources including:
- World Bank, IMF, Asian Development Bank
- UNHCR, WFP, UNICEF, WHO, UNDP, OCHA
- ACLED, UCDP, HDX, ReliefWeb, FEWS NET
- CBY Aden, CBY Sana'a
- OFAC, EU, UK Treasury

### Technology Partners

- **Radix UI** (shadcn/ui components)
- **Vercel** (tRPC framework)
- **TiDB** (distributed database)
- **AWS** (cloud infrastructure)

---

**Last Updated:** February 5, 2026  
**Generated by:** Cloud Agent  
**Repository Version:** 1.0.0
