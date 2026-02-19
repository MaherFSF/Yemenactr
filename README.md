# YETO - Yemen Economic Transparency Observatory

**Version:** 3.0 (Production Release)  
**Last Updated:** February 19, 2026  
**Status:** ✅ Production Ready  
**Repository:** https://github.com/MaherFSF/Yemenactr

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Development Guide](#development-guide)
6. [Database Schema](#database-schema)
7. [API Documentation](#api-documentation)
8. [Deployment](#deployment)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## 🌍 Overview

**YETO** is an **Economic Intelligence Platform** that provides transparent, evidence-backed access to Yemen's economic data. It consolidates 292+ data sources into a unified, trustworthy system for decision-makers.

### Core Mission

Transform fragmented economic information into actionable intelligence through:
- **Evidence-Based Data**: Every data point links to its source and methodology
- **Dual-Regime Tracking**: Separate tracking for Aden (IRG) and Sana'a (DFA) economies
- **AI-Powered Analysis**: "One Brain" system with zero-fabrication guarantee
- **Bilingual Interface**: Full English and Arabic (RTL) support

### Key Statistics

| Metric | Value |
|--------|-------|
| **Data Sources** | 292+ (234 active) |
| **Time Series Records** | 6,700+ |
| **Evidence Packs** | 898+ |
| **Research Publications** | 370+ |
| **Economic Sectors** | 16 |
| **Database Tables** | 243 |
| **Unit Tests** | 740+ |
| **Code Coverage** | 80%+ |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 22.13.0 or higher
- **pnpm**: 9.0.0 or higher (package manager)
- **MySQL**: 8.0+ or TiDB Cloud
- **Git**: For version control

### Installation Steps

#### 1. Clone Repository
```bash
git clone https://github.com/MaherFSF/Yemenactr.git
cd Yemenactr
```

#### 2. Install Dependencies
```bash
pnpm install
```

#### 3. Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/yeto

# Authentication
JWT_SECRET=your-secret-key-here
VITE_APP_ID=your-oauth-app-id

# OAuth
OAUTH_SERVER_URL=https://oauth.example.com
VITE_OAUTH_PORTAL_URL=https://login.example.com

# Storage
S3_BUCKET=your-s3-bucket
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret

# LLM Integration
BUILT_IN_FORGE_API_KEY=your-api-key
BUILT_IN_FORGE_API_URL=https://api.example.com
```

#### 4. Setup Database
```bash
# Push schema to database
pnpm db:push

# (Optional) Open Drizzle Studio for visual inspection
pnpm db:studio
```

#### 5. Start Development Server
```bash
pnpm dev
```

Server runs on `http://localhost:3000`

---

## 🏗️ Architecture

### Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React | 19 |
| **Styling** | Tailwind CSS | 4 |
| **UI Components** | shadcn/ui | Latest |
| **Routing** | Wouter | Latest |
| **Backend** | Express | 4 |
| **RPC Framework** | tRPC | 11 |
| **ORM** | Drizzle | Latest |
| **Database** | MySQL/TiDB | 8.0+ |
| **Testing** | Vitest | Latest |
| **Runtime** | Node.js | 22+ |

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     YETO SYSTEM ARCHITECTURE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    CLIENT LAYER (React 19)               │  │
│  │  • Pages (Sectors, Timeline, Research, Admin)            │  │
│  │  • Components (Dashboards, Charts, Tables)               │  │
│  │  • Contexts (Auth, Theme, Language)                      │  │
│  │  • tRPC Hooks (useQuery, useMutation)                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↕ tRPC                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  SERVER LAYER (Express + tRPC)           │  │
│  │  • Routers (14 feature routers)                          │  │
│  │  • Procedures (publicProcedure, protectedProcedure)      │  │
│  │  • Services (Business logic)                             │  │
│  │  • Connectors (Data source integrations)                 │  │
│  │  • Governance (Truth layer, Evidence tribunal)           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↕ SQL                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              DATABASE LAYER (MySQL/TiDB)                 │  │
│  │  • 243 tables with full schema                           │  │
│  │  • Time series, evidence packs, publications             │  │
│  │  • User management, audit logs                           │  │
│  │  • Provenance tracking, confidence scoring               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
External Data Sources (292+)
         ↓
    ETL Pipeline
         ↓
  Ingestion Service
         ↓
  Truth Layer (Validation)
         ↓
  Evidence Tribunal (Scoring)
         ↓
  Database Storage
         ↓
  tRPC API Layer
         ↓
  Frontend UI
         ↓
  End Users
```

---

## 📁 Project Structure

### Root Level Files

| File | Purpose |
|------|---------|
| `README.md` | This file - comprehensive documentation |
| `ARCHITECTURE.md` | Detailed system design decisions |
| `CHANGELOG.md` | Version history and changes |
| `CONTRIBUTING.md` | Guidelines for contributors |
| `DECISIONS.md` | Technical decision log |
| `SECURITY.md` | Security policies and practices |
| `START_HERE.md` | Quick reference for new developers |
| `todo.md` | Task tracking and progress |

### Directory Structure

```
yeto-platform/
│
├── client/                          # React frontend application
│   ├── public/                      # Static assets (images, icons, fonts)
│   ├── src/
│   │   ├── pages/                   # Page components (90+ pages)
│   │   │   ├── sectors/             # 16 sector pages
│   │   │   ├── admin/               # Admin dashboard pages
│   │   │   └── ...
│   │   ├── components/              # Reusable UI components (114+)
│   │   │   ├── ui/                  # shadcn/ui components
│   │   │   ├── charts/              # Data visualization
│   │   │   └── ...
│   │   ├── contexts/                # React contexts (auth, theme, language)
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── lib/                     # Utilities and helpers
│   │   │   └── trpc.ts              # tRPC client configuration
│   │   ├── App.tsx                  # Main app router
│   │   ├── main.tsx                 # Entry point
│   │   └── index.css                # Global styles
│   └── vite.config.ts               # Vite configuration
│
├── server/                          # Express + tRPC backend
│   ├── routers/                     # tRPC routers (14 feature routers)
│   │   ├── sectors.ts               # Sector data endpoints
│   │   ├── timeline.ts              # Economic timeline
│   │   ├── research.ts              # Research publications
│   │   ├── evidence.ts              # Evidence packs
│   │   ├── admin.ts                 # Admin operations
│   │   └── ...
│   ├── services/                    # Business logic services
│   │   ├── auditLogger.ts           # Audit trail logging
│   │   ├── accuracyChecker.ts       # Data quality checks
│   │   ├── signalDetector.ts        # Anomaly detection
│   │   └── ...
│   ├── connectors/                  # Data source connectors (26+)
│   │   ├── worldBank.ts             # World Bank API
│   │   ├── hdx.ts                   # HDX (Humanitarian Data Exchange)
│   │   ├── ocha.ts                  # OCHA FTS
│   │   └── ...
│   ├── governance/                  # Truth layer & governance
│   │   ├── truthLayer.ts            # Evidence validation
│   │   ├── evidenceTribunal.ts      # Confidence scoring
│   │   └── ...
│   ├── _core/                       # Framework core (DO NOT EDIT)
│   │   ├── trpc.ts                  # tRPC configuration
│   │   ├── context.ts               # Request context
│   │   ├── cookies.ts               # Session management
│   │   ├── auth.ts                  # Authentication
│   │   ├── llm.ts                   # LLM integration
│   │   └── ...
│   ├── db.ts                        # Database query helpers
│   ├── routers.ts                   # Main router composition
│   └── index.ts                     # Server entry point
│
├── drizzle/                         # Database schema & migrations
│   ├── schema.ts                    # Complete schema definition (243 tables)
│   ├── migrations/                  # SQL migration files (27+)
│   ├── meta/                        # Migration metadata
│   └── drizzle.config.ts            # Drizzle configuration
│
├── shared/                          # Shared types and constants
│   ├── types.ts                     # TypeScript type definitions
│   ├── const.ts                     # Application constants
│   └── validators.ts                # Zod validators
│
├── data/                            # Data files
│   └── sources-registry.csv         # v3.0 Source Registry (SINGLE SOURCE OF TRUTH)
│
├── docs/                            # Documentation
│   ├── API.md                       # API endpoint reference
│   ├── DATA_GOVERNANCE.md           # Data quality policies
│   ├── METHODOLOGY.md               # Data collection methods
│   └── ...
│
├── scripts/                         # Utility scripts
│   ├── seed-ci.mjs                  # CI test data seeding
│   ├── release-gate.mjs             # Production readiness checks
│   └── ...
│
├── e2e/                             # End-to-end tests (Playwright)
│   └── ...
│
├── .archive/                        # Archived old files (NOT in git)
│   ├── old-development-files/       # Old development directories
│   └── old-documentation/           # Old documentation files
│
├── .github/                         # GitHub configuration
│   └── workflows/                   # CI/CD workflows
│
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore rules
├── package.json                     # npm/pnpm dependencies
├── pnpm-lock.yaml                   # Dependency lock file
├── tsconfig.json                    # TypeScript configuration
├── vitest.config.ts                 # Vitest configuration
├── playwright.config.ts             # Playwright configuration
└── Dockerfile                       # Docker image definition
```

---

## 💻 Development Guide

### Adding a New Feature

#### Step 1: Define Database Schema
Edit `drizzle/schema.ts`:
```typescript
export const myFeatureTable = mysqlTable('my_feature', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

#### Step 2: Generate Migration
```bash
pnpm drizzle-kit generate
```

This creates a migration file in `drizzle/migrations/`. Review and verify it.

#### Step 3: Push to Database
```bash
pnpm db:push
```

#### Step 4: Create Database Helpers
Edit `server/db.ts`:
```typescript
export async function getMyFeatures() {
  const db = await getDb();
  return db.select().from(myFeatureTable);
}
```

#### Step 5: Add tRPC Procedures
Edit `server/routers.ts` or create `server/routers/myFeature.ts`:
```typescript
export const myFeatureRouter = router({
  getAll: publicProcedure
    .query(async () => {
      return await getMyFeatures();
    }),
  
  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      return db.insert(myFeatureTable).values({
        name: input.name,
      });
    }),
});
```

#### Step 6: Build Frontend
Create `client/src/pages/MyFeature.tsx`:
```typescript
import { trpc } from '@/lib/trpc';

export function MyFeature() {
  const { data, isLoading } = trpc.myFeature.getAll.useQuery();
  const createMutation = trpc.myFeature.create.useMutation();
  
  return (
    <div>
      {/* Your UI here */}
    </div>
  );
}
```

#### Step 7: Write Tests
Create `server/routers/myFeature.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { getMyFeatures } from '../db';

describe('myFeature', () => {
  it('should fetch all features', async () => {
    const features = await getMyFeatures();
    expect(Array.isArray(features)).toBe(true);
  });
});
```

#### Step 8: Run Tests
```bash
pnpm test
```

### Working with tRPC

#### Query (Read-Only)
```typescript
// Backend
getMyData: publicProcedure
  .input(z.object({ id: z.number() }))
  .query(async ({ input }) => {
    // Fetch and return data
  })

// Frontend
const { data } = trpc.myFeature.getMyData.useQuery({ id: 1 });
```

#### Mutation (Write)
```typescript
// Backend
updateMyData: protectedProcedure
  .input(z.object({ id: z.number(), name: z.string() }))
  .mutation(async ({ input, ctx }) => {
    // Update data
    return { success: true };
  })

// Frontend
const mutation = trpc.myFeature.updateMyData.useMutation({
  onSuccess: () => {
    // Refetch data or show success message
  },
  onError: (error) => {
    // Handle error
  },
});

mutation.mutate({ id: 1, name: 'New Name' });
```

### Authentication & Authorization

#### Procedure Types
```typescript
// Public - anyone can access
publicProcedure

// Protected - requires login
protectedProcedure

// Admin - requires admin role
adminProcedure

// Custom roles
analystProcedure
partnerProcedure
editorProcedure
viewerProcedure
```

#### Checking User Role
```typescript
protectedProcedure
  .query(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }
    // Admin-only logic
  })
```

### Data Connectors

YETO integrates 26+ external data sources. Each connector follows this pattern:

```typescript
// server/connectors/mySource.ts
export class MySourceConnector {
  async fetch(): Promise<DataPoint[]> {
    // Call external API
    // Transform to standard format
    // Return data points
  }
}
```

Common connectors:
- **WorldBankConnector**: World Bank WDI data
- **HDXConnector**: Humanitarian Data Exchange
- **OCHAFTSConnector**: OCHA Financial Tracking Service
- **ReliefWebConnector**: ReliefWeb humanitarian data

---

## 🗄️ Database Schema

### Core Tables (243 Total)

#### Time Series Data
```sql
time_series
├── id (PK)
├── indicatorCode (FK → indicators)
├── regimeTag (aden_irg | sanaa_defacto | mixed | unknown)
├── value (DECIMAL)
├── date (DATE)
├── sourceId (FK → evidence_sources)
└── confidence (A | B | C | D)
```

#### Evidence Packs
```sql
evidence_packs
├── id (PK)
├── title
├── description
├── sourceIds (JSON array)
├── dqafAccuracyReliability (0-100)
├── dqafCompletenessTimeliness (0-100)
└── createdAt
```

#### Research Publications
```sql
research_publications
├── id (PK)
├── title
├── authors
├── organizationId (FK)
├── publicationDate
├── url
└── abstract
```

#### Source Registry
```sql
source_registry
├── id (PK)
├── name
├── acronym
├── category
├── tier (T0 | T1 | T2 | T3 | UNKNOWN)
├── accessType (public | restricted | licensed)
├── isActive (boolean)
└── lastUpdated
```

#### User Management
```sql
users
├── id (PK)
├── email (UNIQUE)
├── name
├── role (admin | analyst | editor | viewer | partner)
├── createdAt
└── lastLogin
```

#### Audit Logs
```sql
audit_logs
├── id (PK)
├── userId (FK)
├── action (create | read | update | delete)
├── tableName
├── recordId
├── timestamp
└── details (JSON)
```

### Key Relationships

```
evidence_sources ──┬──→ time_series
                   ├──→ evidence_packs
                   └──→ research_publications

source_registry ──→ evidence_sources

users ──→ audit_logs

sectors ──→ sector_indicators ──→ time_series
```

---

## 🔌 API Documentation

### Authentication

All protected endpoints require:
```
Authorization: Bearer {jwt_token}
```

JWT token obtained via OAuth callback at `/api/oauth/callback`

### Sector Data

#### Get All Sectors
```
GET /api/trpc/sectors.getAll
```

Response:
```json
[
  {
    "id": 1,
    "name": "Banking",
    "nameAr": "البنوك",
    "description": "...",
    "indicators": [...]
  }
]
```

#### Get Sector by ID
```
GET /api/trpc/sectors.getById?input={"id":1}
```

### Time Series

#### Get Time Series by Indicator
```
GET /api/trpc/timeSeries.getByIndicator?input={...}
```

Parameters:
- `indicatorCode` (string): Code of the indicator
- `regimeTag` (enum): aden_irg | sanaa_defacto | mixed | unknown
- `startDate` (optional): ISO date
- `endDate` (optional): ISO date

### Evidence Packs

#### Get Evidence Pack
```
GET /api/trpc/evidence.getById?input={"id":1}
```

Response includes:
- Title and description
- Source list with links
- DQAF quality scores
- Confidence ratings

---

## 🚀 Deployment

### Production Build

```bash
# Build frontend and backend
pnpm build

# Output goes to:
# - client/dist/ (frontend)
# - dist/ (backend)
```

### Docker Deployment

```bash
# Build Docker image
docker build -t yeto:3.0 .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL=mysql://... \
  -e JWT_SECRET=... \
  yeto:3.0
```

### Environment Variables (Production)

```env
# Database (TiDB Cloud recommended)
DATABASE_URL=mysql://user:pass@tidb-host:4000/yeto?ssl=true

# Security
JWT_SECRET=<generate-strong-secret>
NODE_ENV=production

# OAuth
VITE_APP_ID=<oauth-app-id>
OAUTH_SERVER_URL=<oauth-server>
VITE_OAUTH_PORTAL_URL=<login-portal>

# Storage
S3_BUCKET=yeto-prod
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>

# LLM
BUILT_IN_FORGE_API_KEY=<api-key>
BUILT_IN_FORGE_API_URL=<api-url>
```

### Release Gate

Before deploying, run the release gate to verify production readiness:

```bash
node scripts/release-gate.mjs
```

Must pass all 8 gates:
- ✅ Source Registry Count ≥ 250
- ✅ Active Sources ≥ 150
- ✅ Sector Codebook = 16
- ✅ Unknown Tier % ≤ 70%
- ✅ Mapped Sources % ≥ 50%
- ✅ No Duplicate IDs = 0
- ✅ Required Fields = 0 nulls
- ✅ v2.5 Schema present

---

## 🧪 Testing

### Running Tests

```bash
# All tests
pnpm test

# Specific test file
pnpm test -- bulkClassification.test.ts

# Watch mode
pnpm test -- --watch

# With coverage
pnpm test -- --coverage
```

### Test Structure

Tests are located in `server/**/*.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getDb } from '../db';

describe('MyFeature', () => {
  let db;
  
  beforeAll(async () => {
    db = await getDb();
  });
  
  it('should perform operation', async () => {
    const result = await db.select().from(myTable);
    expect(result).toBeDefined();
  });
  
  afterAll(async () => {
    // Cleanup
  });
});
```

### CI/CD Pipeline

GitHub Actions runs on every push:

1. **Install dependencies**
2. **Push database migrations**
3. **Seed test data**
4. **Run unit tests** (740+ tests)
5. **Run release gate** validation
6. **Build project**

---

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Failed
```
Error: Failed to connect to database
```

**Solution:**
1. Verify `DATABASE_URL` in `.env`
2. Check database is running
3. Verify credentials
4. For TiDB Cloud, ensure SSL is enabled

#### OAuth Token Invalid
```
Error: Invalid OAuth token
```

**Solution:**
1. Verify `VITE_APP_ID` and `OAUTH_SERVER_URL`
2. Check token hasn't expired
3. Re-authenticate via `/api/oauth/callback`

#### Port Already in Use
```
Error: EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 pnpm dev
```

#### TypeScript Errors
```
Error: Type 'X' is not assignable to type 'Y'
```

**Solution:**
1. Run type check: `pnpm typecheck`
2. Check imports are correct
3. Verify schema changes are reflected in types
4. Clear cache: `rm -rf dist node_modules/.vite`

### Debug Mode

Enable detailed logging:

```bash
DEBUG=yeto:* pnpm dev
```

---

## 📚 Additional Resources

### Documentation Files
- **ARCHITECTURE.md** - System design and technical decisions
- **CONTRIBUTING.md** - How to contribute to the project
- **DECISIONS.md** - Technical decision log
- **SECURITY.md** - Security policies and best practices
- **START_HERE.md** - Quick reference guide

### External Resources
- [tRPC Documentation](https://trpc.io)
- [Drizzle ORM](https://orm.drizzle.team)
- [React 19](https://react.dev)
- [Tailwind CSS 4](https://tailwindcss.com)

---

## 🤝 Contributing

We welcome contributions! Please:

1. Read [CONTRIBUTING.md](./CONTRIBUTING.md)
2. Follow the development guide above
3. Write tests for new features
4. Ensure all tests pass: `pnpm test`
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) file for details.

---

## 📞 Support

| Need | Contact |
|------|---------|
| **General Questions** | Open an issue on GitHub |
| **Bug Reports** | GitHub Issues with reproduction steps |
| **Security Issues** | security@yeto-yemen.org |
| **Feature Requests** | GitHub Discussions |

---

**Built with ❤️ for Yemen's Economic Transparency**

Last Updated: February 19, 2026 | Version: 3.0 | Status: Production Ready
