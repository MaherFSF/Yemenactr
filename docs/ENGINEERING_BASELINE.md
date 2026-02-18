# ENGINEERING BASELINE

**Repository:** YETO Platform (Yemen Economic Transparency Observatory)  
**Audit Date:** February 4, 2026  
**Auditor:** Lead Engineer Onboarding  
**Branch:** cursor/repo-baseline-audit-3194

---

## Executive Summary

This document provides a comprehensive technical baseline for the YETO platform, detailing the full technology stack, development workflows, and operational procedures. All information is derived from actual configuration files and source code, with explicit file references provided.

---

## Technology Stack

### Frontend Framework

**Framework:** React 19.2.1  
**Reference:** `/workspace/package.json:74-76`

**UI Library:** Radix UI + Custom Components  
**Styling:** Tailwind CSS 4.1.14  
**Reference:** `/workspace/package.json:115`

**Router:** Wouter 3.3.5  
**Reference:** `/workspace/package.json:87`  
**Implementation:** `/workspace/client/src/App.tsx:4`

**State Management:**
- Zustand 5.0.9 (`/workspace/package.json:90`)
- TanStack React Query 5.90.2 (`/workspace/package.json:51`)

**Build Tool:** Vite 7.1.7  
**Reference:** `/workspace/package.json:119`  
**Config:** `/workspace/vite.config.ts`

### Backend Framework

**Server:** Express 4.21.2  
**Reference:** `/workspace/package.json:66`  
**Entry Point:** `/workspace/server/_core/index.ts`

**API Layer:** tRPC 11.6.0  
**Reference:** `/workspace/package.json:52-54`  
**Router Definition:** `/workspace/server/routers.ts`

**Runtime:** Node.js 20 (Alpine)  
**Reference:** `/workspace/Dockerfile:7`

### Database Layer

**Database:** MySQL  
**ORM:** Drizzle ORM 0.44.5  
**Reference:** `/workspace/package.json:64`

**Driver:** mysql2 3.15.0  
**Reference:** `/workspace/package.json:71`

**Migrations:**
- Tool: Drizzle Kit 0.31.4 (`/workspace/package.json:109`)
- Config: `/workspace/drizzle.config.ts`
- Schema: `/workspace/drizzle/schema.ts`
- Migrations Directory: `/workspace/drizzle/`

**Migration Commands:**
```bash
pnpm db:push  # Generate and run migrations
```
**Reference:** `/workspace/package.json:13`

### Scheduler/Queue Mechanism

**Scheduler:** Custom cron-based implementation  
**Reference:** `/workspace/server/scheduler/ingestionScheduler.ts`

**Features:**
- Cron expression parsing
- Priority-based execution
- Retry logic with exponential backoff
- Job status tracking

**Initialization:** `/workspace/server/_core/index.ts:66-73`

**Poll Interval:** 5 minutes  
**Reference:** `/workspace/server/_core/index.ts:76-82`

**Alternative Scheduler:** Daily scheduler for general tasks  
**Reference:** `/workspace/server/services/dailyScheduler.ts` (imported at line 10 of `/workspace/server/_core/index.ts`)

### Ingestion Connector Architecture

**Base Connector:** `/workspace/server/connectors/BaseConnector.ts`

**Orchestrator:** `/workspace/server/connectors/IngestionOrchestrator.ts`

**Registry:** `/workspace/server/connectors/index.ts` (ENHANCED_CONNECTOR_REGISTRY)

**Active Connectors:**
- World Bank (`/workspace/server/connectors/WorldBankConnector.ts`)
- IMF (`/workspace/server/connectors/IMFConnector.ts`)
- FAO (`/workspace/server/connectors/faoConnector.ts`)
- ACLED (`/workspace/server/connectors/acledConnector.ts`)
- OCHA FTS (`/workspace/server/connectors/ochaFtsConnector.ts`)
- HDX CKAN (`/workspace/server/connectors/hdxCkanConnector.ts`)
- ReliefWeb (`/workspace/server/connectors/reliefWebConnector.ts`)
- IOM DTM (`/workspace/server/connectors/iomDtmConnector.ts`)
- UN Agencies (`/workspace/server/connectors/UNAgenciesConnector.ts`)
- UNHCR (`/workspace/server/connectors/unhcrConnector.ts`)
- UNICEF (`/workspace/server/connectors/unicefConnector.ts`)
- WFP (`/workspace/server/connectors/wfpConnector.ts`)
- WHO (`/workspace/server/connectors/whoConnector.ts`)
- UNDP (`/workspace/server/connectors/undpConnector.ts`)
- IATI (`/workspace/server/connectors/iatiConnector.ts`)
- FEWS NET (`/workspace/server/connectors/fewsNetConnector.ts`)
- Sanctions (`/workspace/server/connectors/sanctionsConnector.ts`)
- Banking Documents (`/workspace/server/connectors/bankingDocuments.ts`)
- Central Bank of Yemen (`/workspace/server/connectors/cbyConnector.ts`)
- Research Connectors (`/workspace/server/connectors/researchConnectors.ts`)

**Connector Configuration:** `/workspace/server/connectors/sources-config.json`

### Test Frameworks

**Unit Tests:** Vitest 2.1.4  
**Reference:** `/workspace/package.json:121`  
**Config:** `/workspace/vitest.config.ts`  
**Test Pattern:** `server/**/*.test.ts`, `server/**/*.spec.ts`  
**Reference:** `/workspace/vitest.config.ts:17`

**E2E Tests:** Playwright 1.57.0  
**Reference:** `/workspace/package.json:94,111`  
**Config:** `/workspace/playwright.config.ts`  
**Test Directory:** `/workspace/e2e/`  
**Reference:** `/workspace/playwright.config.ts:9`

**Testing Library:** @testing-library/react 16.3.2  
**Reference:** `/workspace/package.json:98`

### Build/Deploy

**Build Script:** `/workspace/package.json:8`
```bash
vite build && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
```

**Deployment:**
- **Container:** Multi-stage Docker build
- **Dockerfile:** `/workspace/Dockerfile`
- **Base Image:** node:20-alpine
- **Production Port:** 3000
- **Health Check:** wget http://localhost:3000/api/health

**Kubernetes:** `/workspace/infra/k8s/deployment.yaml`

**Infrastructure as Code:** `/workspace/infrastructure/` (Terraform)

---

## Development Commands

### Install Dependencies

**Command:**
```bash
pnpm install
```

**Package Manager:** pnpm 10.4.1  
**Reference:** `/workspace/package.json:123`

**Lockfile:** `/workspace/pnpm-lock.yaml`

### Development Server

**Command:**
```bash
pnpm dev
```

**Implementation:** `/workspace/package.json:7`
```bash
NODE_ENV=development tsx watch server/_core/index.ts
```

**Runtime:** tsx 4.19.1 (TypeScript executor with watch mode)  
**Reference:** `/workspace/package.json:116`

**Behavior:**
- Starts Express server with Vite middleware
- Hot module replacement (HMR) enabled
- Auto-restarts on server changes
- Default port: 3000 (auto-increments if busy)
- Reference: `/workspace/server/_core/index.ts:23-57`

### Linting

**Command:**
```bash
pnpm lint
```

**Implementation:** `/workspace/package.json:18`
```bash
tsc --noEmit
```

**Note:** This is TypeScript type checking, not ESLint. No ESLint configuration found.

### Type Checking

**Command:**
```bash
pnpm typecheck
```

**Implementation:** `/workspace/package.json:19`
```bash
tsc --noEmit
```

**TypeScript Version:** 5.9.3  
**Reference:** `/workspace/package.json:118`  
**Config:** `/workspace/tsconfig.json`

**Compiler Options:**
- Module: ESNext
- Strict mode: enabled
- JSX: preserve
- Module resolution: bundler
- Path aliases: `@/*`, `@shared/*`
- Reference: `/workspace/tsconfig.json:4-21`

### Unit Tests

**Command:**
```bash
pnpm test
```

**Implementation:** `/workspace/package.json:12`
```bash
vitest run
```

**Watch Mode:**
```bash
vitest
```

**UI Mode:**
```bash
pnpm add -D @vitest/ui
vitest --ui
```

### E2E Tests

**Command:**
```bash
pnpm test:e2e
```

**Implementation:** `/workspace/package.json:16`
```bash
playwright test
```

**UI Mode:**
```bash
pnpm test:e2e:ui
```

**Implementation:** `/workspace/package.json:17`
```bash
playwright test --ui
```

**Browsers Tested:**
- Chromium (Desktop)
- Mobile Chrome (Pixel 5)
- Arabic RTL (ar-YE locale)
- Reference: `/workspace/playwright.config.ts:48-67`

### Build for Production

**Command:**
```bash
pnpm build
```

**Implementation:** `/workspace/package.json:8`

**Steps:**
1. Vite builds frontend to `dist/public/`
2. esbuild bundles server to `dist/index.js`

**Output:**
- Frontend: `/workspace/dist/public/`
- Backend: `/workspace/dist/index.js`

### Start Production Server

**Command:**
```bash
pnpm start
```

**Implementation:** `/workspace/package.json:9`
```bash
NODE_ENV=production node dist/index.js
```

### Database Operations

**Generate & Run Migrations:**
```bash
pnpm db:push
```

**Seed Database:**
```bash
pnpm seed
```
**Reference:** `/workspace/package.json:15`  
**Implementation:** `npx tsx server/seed.ts`

**Validate Data:**
```bash
pnpm validate
```
**Reference:** `/workspace/package.json:14`  
**Implementation:** `npx tsx scripts/validate.ts`

### Code Formatting

**Command:**
```bash
pnpm format
```

**Implementation:** `/workspace/package.json:11`
```bash
prettier --write .
```

**Prettier Version:** 3.6.2  
**Reference:** `/workspace/package.json:114`

---

## Project Structure

```
/workspace/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── pages/         # Route components (81 files)
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── contexts/      # React contexts
│   │   ├── lib/           # Utilities (trpc, utils, etc.)
│   │   ├── App.tsx        # Main router
│   │   └── main.tsx       # Entry point
│   └── public/            # Static assets
├── server/                # Backend Express + tRPC
│   ├── _core/            # Core server infrastructure
│   │   ├── index.ts      # Server entry point
│   │   ├── trpc.ts       # tRPC setup
│   │   ├── context.ts    # Request context
│   │   └── env.ts        # Environment variables
│   ├── routers/          # tRPC routers (100+ files)
│   ├── services/         # Business logic (81+ files)
│   ├── connectors/       # Data ingestion connectors
│   ├── scheduler/        # Job scheduler
│   ├── db/               # Database utilities
│   └── seed.ts           # Database seeding
├── shared/               # Shared types/constants
│   ├── types.ts
│   ├── const.ts
│   └── indicators/
├── drizzle/              # Database schema & migrations
│   ├── schema.ts
│   └── 0001_*.sql        # Migration files
├── scripts/              # Utility scripts (70+ files)
├── docs/                 # Documentation (169 files)
├── e2e/                  # E2E tests
├── infrastructure/       # Terraform configs
├── infra/k8s/           # Kubernetes manifests
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── vite.config.ts        # Vite config
├── vitest.config.ts      # Vitest config
├── playwright.config.ts  # Playwright config
├── drizzle.config.ts     # Drizzle config
└── Dockerfile            # Container build
```

---

## Key Architectural Patterns

### Frontend Architecture

**Pattern:** Single Page Application (SPA) with client-side routing  
**Data Fetching:** tRPC with React Query for caching  
**Reference:** `/workspace/client/src/lib/trpc.ts`

**Component Structure:**
- UI components: `/workspace/client/src/components/ui/` (Radix-based)
- Feature components: `/workspace/client/src/components/`
- Page components: `/workspace/client/src/pages/`

**State Management:**
- Global: Zustand stores (`/workspace/client/src/stores/`)
- Server state: React Query (via tRPC)
- Context: Theme, Language (`/workspace/client/src/contexts/`)

### Backend Architecture

**Pattern:** Procedure-based API (tRPC)  
**Reference:** `/workspace/server/routers.ts`

**Middleware Stack:**
- Express body parser (50MB limit)
- tRPC middleware
- Vite dev server (development only)
- Static file serving (production only)
- Reference: `/workspace/server/_core/index.ts:35-53`

**Authentication:**
- OAuth integration (`/workspace/server/_core/oauth.ts`)
- Cookie-based sessions
- Role-based access control (public, protected, admin, analyst, partner, editor, viewer)
- Reference: `/workspace/server/_core/trpc.ts`

**Database Access:**
- Drizzle ORM for type-safe queries
- Raw MySQL connection pooling for complex queries
- Reference: `/workspace/server/db.ts`

### Data Ingestion Pipeline

**Pattern:** Connector-based architecture with orchestration

**Flow:**
1. Scheduler triggers connector based on cron expression
2. Connector fetches data from external API
3. Data transformed to internal schema
4. Validation and quality checks
5. Upsert to database
6. Provenance and audit logging

**Reference:** `/workspace/server/scheduler/ingestionScheduler.ts`

---

## Local Development Setup

### Prerequisites

- Node.js 20+
- pnpm 10.4.1+
- MySQL database
- Environment variables configured (see ENV_VARS.md)

### Setup Steps

1. **Clone repository:**
   ```bash
   git clone <repository-url>
   cd workspace
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start database:**
   ```bash
   # Ensure MySQL is running
   # Create database: yeto_platform
   ```

5. **Run migrations:**
   ```bash
   pnpm db:push
   ```

6. **Seed database (optional):**
   ```bash
   pnpm seed
   ```

7. **Start development server:**
   ```bash
   pnpm dev
   ```

8. **Access application:**
   - Frontend: http://localhost:3000
   - tRPC API: http://localhost:3000/api/trpc

### Development Workflow

1. Make changes to code
2. Hot reload automatically applies (frontend)
3. Server restarts on changes (backend via tsx watch)
4. Run type checks: `pnpm typecheck`
5. Run tests: `pnpm test`
6. Format code: `pnpm format`

---

## Production Deployment

### Build Process

1. **Build application:**
   ```bash
   pnpm build
   ```

2. **Verify build:**
   - Check `dist/public/` for frontend assets
   - Check `dist/index.js` for server bundle

### Docker Deployment

**Build image:**
```bash
docker build -t yeto-platform:latest .
```

**Run container:**
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="mysql://..." \
  -e JWT_SECRET="..." \
  yeto-platform:latest
```

**Reference:** `/workspace/Dockerfile`

### Environment Configuration

- See `/workspace/docs/ENV_VARS.md` for complete list
- Required variables:
  - DATABASE_URL
  - JWT_SECRET
  - NODE_ENV=production

### Health Checks

**Endpoint:** `/api/health`  
**Method:** GET  
**Expected:** HTTP 200

**Kubernetes Health Check:**
```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
```

**Reference:** `/workspace/infra/k8s/deployment.yaml`

---

## Testing Strategy

### Unit Tests

**Location:** `server/**/*.test.ts`  
**Framework:** Vitest  
**Coverage:** Partial (services, routers, business logic)

**Run tests:**
```bash
pnpm test
```

### Integration Tests

**Pattern:** Tests marked as `.test.ts` that interact with database  
**Example:** `/workspace/server/connectors/connectors.test.ts`

**Note:** Tests require DATABASE_URL environment variable

### E2E Tests

**Location:** `e2e/`  
**Framework:** Playwright  
**Browsers:** Chromium, Mobile Chrome, Arabic RTL

**Run tests:**
```bash
pnpm test:e2e
```

**Test Types:**
- Route availability
- User flows
- Cross-browser compatibility
- RTL/Arabic support

---

## Key Dependencies

### Runtime Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.2.1 | UI framework |
| express | 4.21.2 | HTTP server |
| @trpc/server | 11.6.0 | API layer |
| drizzle-orm | 0.44.5 | ORM |
| mysql2 | 3.15.0 | MySQL driver |
| wouter | 3.3.5 | Routing |
| zod | 4.1.12 | Validation |
| axios | 1.12.0 | HTTP client |
| cron | 4.4.0 | Scheduler (note: custom implementation actually used) |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| typescript | 5.9.3 | Type system |
| vite | 7.1.7 | Build tool |
| vitest | 2.1.4 | Test runner |
| playwright | 1.57.0 | E2E testing |
| tsx | 4.19.1 | TS executor |
| esbuild | 0.25.0 | Server bundler |
| prettier | 3.6.2 | Formatter |
| tailwindcss | 4.1.14 | CSS framework |

---

## Known Issues / Blockers

See `/workspace/docs/BLOCKERS.md` for any identified blockers.

---

## Additional Resources

- **Architecture Overview:** `/workspace/ARCHITECTURE.md`
- **Environment Variables:** `/workspace/docs/ENV_VARS.md`
- **Route Inventory:** `/workspace/docs/ROUTE_REALITY_CHECK.md`
- **Deployment Guide:** `/workspace/docs/DEPLOYMENT_GUIDE.md`
- **Security Guidelines:** `/workspace/SECURITY.md`
- **Changelog:** `/workspace/CHANGELOG.md`

---

## Maintenance Notes

**TypeScript Configuration:**
- Strict mode enabled
- No emit (build handled by Vite/esbuild)
- Path aliases configured
- Reference: `/workspace/tsconfig.json`

**Database Schema:**
- Location: `/workspace/drizzle/schema.ts`
- Migrations: Auto-generated by Drizzle Kit
- Migration history: `/workspace/drizzle/`

**Patches:**
- wouter@3.7.1 patched
- Patch file: `/workspace/patches/wouter@3.7.1.patch`
- Reference: `/workspace/package.json:125-127`

---

**Document Status:** ✅ Complete  
**Last Updated:** February 4, 2026  
**Next Review:** On major architecture changes
