# YETO Platform - Engineering Baseline

**Generated:** 2026-02-04  
**Purpose:** Complete onboarding guide for engineers working on YETO  
**Status:** ✅ Production-Ready

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Tech Stack Summary](#tech-stack-summary)
3. [Architecture Overview](#architecture-overview)
4. [Commands Reference](#commands-reference)
5. [Development Workflow](#development-workflow)
6. [Testing](#testing)
7. [Build & Deployment](#build--deployment)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

- **Node.js**: v20+ (Alpine-compatible)
- **pnpm**: v10.4.1+ (managed via corepack)
- **MySQL**: v8.0+ (or TiDB-compatible)
- **Environment Variables**: See [ENV_VARS.md](./ENV_VARS.md)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd yeto-platform

# Enable pnpm via corepack
corepack enable
corepack prepare pnpm@10.4.1 --activate

# Install dependencies
pnpm install --frozen-lockfile

# Set up environment variables
cp .env.example .env  # Edit with your credentials
```

**Reference:**
- Package manager configuration: `/package.json` line 123
- Lockfile: `/pnpm-lock.yaml`

### Run Locally

```bash
# Development mode (with hot reload)
pnpm run dev

# The server will start on http://localhost:3000
# If port 3000 is busy, it will auto-select the next available port
```

**Reference:**
- Development script: `/package.json` line 7
- Server entry point: `/server/_core/index.ts` lines 32-86

---

## Tech Stack Summary

### Frontend

| Component | Technology | Version | File Reference |
|-----------|-----------|---------|----------------|
| **Framework** | React | 19.2.1 | `/package.json` line 74 |
| **Build Tool** | Vite | 7.1.7 | `/package.json` line 119 |
| **Router** | Wouter | 3.3.5 | `/package.json` line 87 |
| **State Management** | Zustand | 5.0.9 | `/package.json` line 90 |
| **Data Fetching** | TanStack Query + tRPC | 5.90.2 / 11.6.0 | `/package.json` lines 51-54 |
| **UI Components** | Radix UI + shadcn/ui | Various | `/package.json` lines 25-50 |
| **Styling** | Tailwind CSS | 4.1.14 | `/package.json` line 115 |
| **Forms** | React Hook Form + Zod | 7.64.0 / 4.1.12 | `/package.json` lines 77, 89 |

**Key Files:**
- Entry point: `/client/src/main.tsx`
- App router: `/client/src/App.tsx`
- Vite config: `/vite.config.ts`
- TypeScript config: `/tsconfig.json`

### Backend

| Component | Technology | Version | File Reference |
|-----------|-----------|---------|----------------|
| **Framework** | Express | 4.21.2 | `/package.json` line 66 |
| **API Layer** | tRPC | 11.6.0 | `/package.json` lines 52-54 |
| **Database** | MySQL 8.0 | - | `/docker-compose.yml` lines 56-77 |
| **ORM** | Drizzle ORM | 0.44.5 | `/package.json` line 64 |
| **Migrations** | Drizzle Kit | 0.31.4 | `/package.json` line 109 |
| **Authentication** | JWT (via jose) | 6.1.0 | `/package.json` line 69 |
| **Scheduler** | node-cron | 4.4.0 | `/package.json` line 60 |

**Key Files:**
- Server entry: `/server/_core/index.ts`
- Router definitions: `/server/routers.ts` (142,045 characters - large file)
- Database schema: `/drizzle/schema.ts`
- Database client: `/server/db.ts`

### Infrastructure

| Component | Technology | File Reference |
|-----------|-----------|----------------|
| **Cache** | Redis 7 | `/docker-compose.yml` lines 79-94 |
| **Storage** | MinIO (S3-compatible) | `/docker-compose.yml` lines 96-133 |
| **Search** | OpenSearch 2.11.0 | `/docker-compose.yml` lines 135-163 |
| **Container** | Docker / Docker Compose | `/docker-compose.yml`, `/Dockerfile` |

**Note:** The platform uses a custom storage proxy system via `BUILT_IN_FORGE_API_URL` and `BUILT_IN_FORGE_API_KEY` as documented in `/server/storage.ts` lines 1-103.

### Data Ingestion

| Component | Description | File Reference |
|-----------|-------------|----------------|
| **Connector Framework** | BaseConnector abstract class | `/server/connectors/BaseConnector.ts` |
| **Connector Registry** | 13+ data source connectors | `/server/connectors/index.ts` lines 1168-1722 |
| **Scheduler** | Cron-based ingestion scheduler | `/server/init-scheduler.ts` |
| **Sources** | World Bank, IMF, FAO, OCHA, HDX, ACLED, etc. | `/server/connectors/index.ts` lines 785-867 |

**Key Connectors:**
- World Bank: `/server/connectors/WorldBankConnector.ts`
- IMF: `/server/connectors/IMFConnector.ts`
- FAO: `/server/connectors/faoConnector.ts`
- ACLED: `/server/connectors/acledConnector.ts`
- HDX HAPI: `/server/connectors/hdxCkanConnector.ts`
- OCHA FTS: `/server/connectors/ochaFtsConnector.ts`
- Central Bank of Yemen: `/server/connectors/cbyConnector.ts`

**Scheduler Architecture:**
- Initialization: `/server/init-scheduler.ts` lines 13-44
- Job execution: `/server/_core/index.ts` lines 65-84 (runs every 5 minutes)

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│  React + Vite + Wouter + TanStack Query + tRPC Client      │
│                    (Port 3000)                              │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/tRPC
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API                              │
│         Express + tRPC Server + JWT Auth                    │
│                  (Port 3000)                                │
└──────┬──────────┬──────────┬──────────┬────────────────────┘
       │          │          │          │
       ▼          ▼          ▼          ▼
    MySQL     Redis     MinIO    OpenSearch
  (Port 3306) (6379)   (9000)    (9200)
```

**Reference:** `/docker-compose.yml` lines 1-197

### Request Flow

1. **Client Request** → React Component
2. **Data Fetching** → tRPC Client (via TanStack Query)
3. **API Call** → Express `/api/trpc` endpoint
4. **Router** → tRPC router in `/server/routers.ts`
5. **Database** → Drizzle ORM queries MySQL
6. **Response** → JSON serialized via SuperJSON
7. **UI Update** → React re-renders with new data

**Reference:**
- tRPC setup: `/client/src/main.tsx` lines 40-53
- Express middleware: `/server/_core/index.ts` lines 41-47

### Routing Architecture

**Frontend Routing:**
- Uses `wouter` for client-side routing
- All routes defined in `/client/src/App.tsx` lines 138-317
- 80+ routes covering public, authenticated, and admin sections

**Backend Routing:**
- tRPC routers organized by domain
- Main router: `/server/routers.ts`
- Subrouters: `/server/routers/*.ts` (55+ router files)

**Static Files:**
- Development: Vite dev server (HMR enabled)
- Production: Served from `/dist/public` via Express static middleware
- Reference: `/server/_core/vite.ts` lines 1-68

### Database Architecture

**ORM:** Drizzle ORM with MySQL dialect

**Schema Files:**
- Main schema: `/drizzle/schema.ts`
- Source registry: `/drizzle/schema-source-registry.ts`
- Webhooks: `/drizzle/schema-webhooks.ts`
- Backfill: `/drizzle/schema-backfill.ts`
- Visualizations: `/drizzle/schema-visualization.ts`

**Migration System:**
- Migrations stored in `/drizzle/*.sql`
- Latest migration: `0019_absurd_human_robot.sql`
- Configuration: `/drizzle.config.ts`

**Key Tables:**
- `users` - User accounts
- `sources` - Data source registry
- `time_series` - Economic indicators time series
- `documents` - Research library documents
- `entities` - Economic entities (banks, companies)
- `economic_events` - Timeline events
- `glossary_terms` - Glossary definitions
- `data_gap_tickets` - Missing data tracking

**Reference:** `/server/db.ts` lines 1-50

### Scheduler System

**Purpose:** Automated data ingestion from external sources

**Architecture:**
1. **Initialization** on server startup (`/server/_core/index.ts` lines 65-73)
2. **Job Registration** via `initializeSchedulerJobs()` (`/server/services/dailyScheduler.ts`)
3. **Execution** every 5 minutes via `setInterval` (`/server/_core/index.ts` lines 76-82)

**Connector Architecture:**
- **Base Class:** `BaseConnector` with retry logic and rate limiting (`/server/connectors/BaseConnector.ts`)
- **Implementations:** 13+ source-specific connectors
- **Registry:** Dynamic connector loading from `/server/connectors/sources-config.json`

**Reference:** `/server/init-scheduler.ts` lines 1-48

---

## Commands Reference

All commands are defined in `/package.json` lines 6-19.

### Development

```bash
# Start development server with hot reload
pnpm run dev
# → Runs: NODE_ENV=development tsx watch server/_core/index.ts
# Server: http://localhost:3000
# Auto-reloads on file changes
```

### Type Checking

```bash
# Run TypeScript type checker (no output files)
pnpm run check
# → Runs: tsc --noEmit

# Alias for type checking
pnpm run lint
# → Same as 'check'

pnpm run typecheck
# → Same as 'check'
```

**TypeScript Configuration:** `/tsconfig.json` lines 1-23
- Strict mode enabled
- ESNext + DOM libs
- Bundler module resolution
- Path aliases: `@/*` → `./client/src/*`, `@shared/*` → `./shared/*`

### Testing

```bash
# Run unit tests (Vitest)
pnpm run test
# → Runs: vitest run
# Config: vitest.config.ts
# Pattern: server/**/*.test.ts, server/**/*.spec.ts

# Run E2E tests (Playwright)
pnpm run test:e2e
# → Runs: playwright test
# Config: playwright.config.ts
# Tests: e2e/*.spec.ts

# Run E2E with UI
pnpm run test:e2e:ui
# → Runs: playwright test --ui
```

**Test Configuration:**
- Vitest: `/vitest.config.ts` - Node environment, server-only tests
- Playwright: `/playwright.config.ts` - Browser tests with Chromium, mobile, and RTL variants

**Reference:**
- Unit test config: `/vitest.config.ts` lines 1-19
- E2E test config: `/playwright.config.ts` lines 1-77

### Database

```bash
# Generate and run migrations
pnpm run db:push
# → Runs: drizzle-kit generate && drizzle-kit migrate
```

**Requirements:** `DATABASE_URL` environment variable must be set
**Reference:** `/drizzle.config.ts` lines 3-15

### Formatting

```bash
# Format all files with Prettier
pnpm run format
# → Runs: prettier --write .
```

### Build

```bash
# Build for production
pnpm run build
# → Runs: vite build && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Outputs:
# - Frontend: /dist/public (Vite build)
# - Backend: /dist/index.js (esbuild bundle)
```

**Reference:** `/package.json` line 8

### Production

```bash
# Start production server
pnpm run start
# → Runs: NODE_ENV=production node dist/index.js
# Requires: Build artifacts in /dist
```

**Reference:** `/package.json` line 9

### Utilities

```bash
# Run database seed
pnpm run seed
# → Runs: npx tsx server/seed.ts

# Run validation script
pnpm run validate
# → Runs: npx tsx scripts/validate.ts
```

---

## Development Workflow

### 1. Environment Setup

1. Copy `.env.example` to `.env` (if it exists, or create from ENV_VARS.md)
2. Set required variables: `DATABASE_URL`, `JWT_SECRET`
3. Optional: Configure S3, Redis, OpenSearch if using those features

### 2. Database Setup

```bash
# Option A: Docker Compose (recommended)
docker-compose up -d db

# Option B: Local MySQL
# Install MySQL 8.0 and create database 'yeto'

# Run migrations
pnpm run db:push

# Optional: Seed test data
pnpm run seed
```

### 3. Start Development Server

```bash
pnpm run dev
```

The server will:
- Start on port 3000 (or next available port)
- Enable Vite HMR for frontend
- Watch server files for changes with `tsx watch`
- Initialize the scheduler (runs every 5 minutes)

**Reference:** `/server/_core/index.ts` lines 32-88

### 4. Code Changes

**Frontend:**
- Edit files in `/client/src`
- Changes hot-reload automatically via Vite
- TypeScript errors shown in browser console

**Backend:**
- Edit files in `/server`
- Server auto-restarts via `tsx watch`
- Check terminal for errors

**Shared:**
- Edit files in `/shared`
- Used by both frontend and backend

### 5. Type Checking

```bash
# Check types before committing
pnpm run check
```

### 6. Testing

```bash
# Run unit tests
pnpm run test

# Run E2E tests (requires running server)
pnpm run test:e2e
```

---

## Testing

### Unit Tests (Vitest)

**Framework:** Vitest 2.1.4  
**Environment:** Node.js  
**Pattern:** `server/**/*.test.ts`

**Configuration:** `/vitest.config.ts`

**Example Test Files:**
- `/server/auth.logout.test.ts`
- `/server/connectorHealthAlerts.test.ts`
- `/server/evidence-rule.test.ts`
- `/server/evidenceTribunal.test.ts`
- `/server/hardening.test.ts`
- `/server/integration.test.ts`
- `/server/ml/ml.test.ts`
- `/server/routers/*.test.ts` (multiple)

**Run Tests:**
```bash
pnpm run test
```

### E2E Tests (Playwright)

**Framework:** Playwright 1.57.0  
**Browsers:** Chromium, Mobile Chrome, Arabic RTL  
**Pattern:** `e2e/*.spec.ts`

**Configuration:** `/playwright.config.ts`

**Test Files:**
- `/e2e/critical-journeys.spec.ts`

**Features:**
- Parallel execution
- Screenshot on failure
- Video recording on retry
- Automatic dev server startup

**Run Tests:**
```bash
# Headless
pnpm run test:e2e

# With UI
pnpm run test:e2e:ui
```

**Reference:** `/playwright.config.ts` lines 1-77

---

## Build & Deployment

### Production Build

```bash
pnpm run build
```

**Process:**
1. **Frontend Build** (Vite)
   - Bundles React app
   - Optimizes assets
   - Outputs to `/dist/public`
   - Reference: `/vite.config.ts` lines 24-26

2. **Backend Build** (esbuild)
   - Bundles server code
   - External packages preserved
   - ESM format
   - Outputs to `/dist/index.js`
   - Reference: `/package.json` line 8

### Docker Deployment

**Dockerfile:** `/Dockerfile` (multi-stage build)

**Stages:**
1. **deps** - Install dependencies
2. **builder** - Build application
3. **runner** - Production image

**Build:**
```bash
docker build -t yeto-platform .
```

**Run:**
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL=mysql://user:pass@host:3306/yeto \
  -e JWT_SECRET=your-secret \
  yeto-platform
```

**Reference:** `/Dockerfile` lines 1-77

### Docker Compose

**File:** `/docker-compose.yml`

**Services:**
- `web` - YETO application (port 3000)
- `db` - MySQL 8.0 (port 3306)
- `redis` - Redis 7 (port 6379)
- `minio` - S3-compatible storage (ports 9000, 9001)
- `opensearch` - Search engine (port 9200)

**Start All Services:**
```bash
docker-compose up -d
```

**Reference:** `/docker-compose.yml` lines 1-197

### Deployment Checklist

- [ ] Set all required environment variables (see ENV_VARS.md)
- [ ] Run database migrations: `pnpm run db:push`
- [ ] Build application: `pnpm run build`
- [ ] Test production build: `NODE_ENV=production node dist/index.js`
- [ ] Configure reverse proxy (nginx/caddy) if needed
- [ ] Set up SSL/TLS certificates
- [ ] Configure monitoring and logging
- [ ] Set up automated backups

---

## Troubleshooting

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:** The server automatically finds the next available port (lines 23-30 in `/server/_core/index.ts`). Check console output for the actual port.

### Database Connection Failed

**Error:** `Failed to connect to database`

**Checks:**
1. Verify `DATABASE_URL` environment variable
2. Check MySQL is running: `docker-compose ps db`
3. Test connection: `mysql -h localhost -u yeto -p`
4. Review logs: `docker-compose logs db`

**Reference:** `/server/db.ts` lines 34-42

### TypeScript Errors

**Error:** Type checking fails

**Solution:**
```bash
# Clear TypeScript cache
rm -rf node_modules/typescript/tsbuildinfo

# Reinstall dependencies
pnpm install

# Run type check
pnpm run check
```

**Reference:** `/tsconfig.json` line 6 (tsBuildInfoFile)

### Build Failures

**Error:** Vite or esbuild fails

**Checks:**
1. Clear build cache: `rm -rf dist node_modules/.vite`
2. Reinstall: `pnpm install --frozen-lockfile`
3. Check for syntax errors in recent changes
4. Review console output for specific error messages

### Scheduler Not Running

**Issue:** Data not ingesting

**Checks:**
1. Check logs for scheduler initialization: `[YETO Scheduler]` messages
2. Verify cron patterns in connector configurations
3. Check database for `ingestion_jobs` table
4. Review connector status in admin dashboard

**Reference:** `/server/init-scheduler.ts` lines 13-44

### Missing Dependencies

**Error:** Cannot find module 'xyz'

**Solution:**
```bash
# Install missing dependency
pnpm install xyz

# Or reinstall all
pnpm install
```

**Note:** Lock file at `/pnpm-lock.yaml` ensures consistent installs

---

## Additional Resources

- **Architecture Details:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Environment Variables:** [ENV_VARS.md](./ENV_VARS.md)
- **Route Inventory:** [ROUTE_REALITY_CHECK.md](./ROUTE_REALITY_CHECK.md)
- **API Reference:** [API_REFERENCE.md](./API_REFERENCE.md)
- **Data Sources:** [DATA_SOURCE_REGISTER.md](./DATA_SOURCE_REGISTER.md)
- **Connector Documentation:** [CONNECTORS.md](./CONNECTORS.md)

---

## Version History

- **2026-02-04:** Initial baseline documentation created
- All file references verified and cross-checked with actual codebase
