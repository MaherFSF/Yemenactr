# YETO Platform - Blockers & Missing Components

**Generated:** 2026-02-04  
**Purpose:** Track missing components that block development/deployment  
**Status:** 🔴 2 Blockers Identified

---

## Critical Blockers

### 🔴 BLOCKER 1: Missing `.env.example` File

**Impact:** High  
**Affects:** New engineers, deployment, CI/CD  
**Detected In:** Root directory scan (no `.env*` files found)

**Problem:**
- No `.env.example` template file exists
- New engineers don't know which environment variables to set
- Deployment teams lack configuration reference
- CI/CD pipelines need manual configuration

**Evidence:**
```bash
# Glob search for .env files
Result: 0 files found
```

**Required Variables:** See [ENV_VARS.md](./ENV_VARS.md) for complete list

**Minimum Required:**
- `DATABASE_URL`
- `JWT_SECRET`
- `NODE_ENV`

**Recommended Action:**
Create `.env.example` file in repository root with template values:

```bash
# .env.example
# YETO Platform - Environment Variables Template
# Copy this file to .env and fill in your values

# ============================================
# REQUIRED - Core Application
# ============================================
DATABASE_URL=mysql://yeto:yeto_password@localhost:3306/yeto
JWT_SECRET=CHANGE-THIS-TO-A-STRONG-RANDOM-STRING-64-CHARS
NODE_ENV=development

# ============================================
# OPTIONAL - Server Configuration
# ============================================
PORT=3000

# ============================================
# OPTIONAL - OAuth & Authentication
# ============================================
# OAUTH_SERVER_URL=
# OWNER_OPEN_ID=
# VITE_APP_ID=

# ============================================
# OPTIONAL - AI / LLM Integration
# ============================================
# AI_API_KEY=
# AI_API_URL=https://api.openai.com/v1
# AI_MODEL=gpt-4o
# AI_EMBED_MODEL=text-embedding-3-small

# ============================================
# OPTIONAL - Storage (Choose one)
# ============================================
# Option A: Forge Proxy (Recommended)
# BUILT_IN_FORGE_API_URL=
# BUILT_IN_FORGE_API_KEY=

# Option B: Direct S3 / MinIO
# S3_ENDPOINT=http://localhost:9000
# S3_ACCESS_KEY=minioadmin
# S3_SECRET_KEY=minioadmin
# S3_BUCKET=yeto-storage

# ============================================
# OPTIONAL - Cache / Redis
# ============================================
# REDIS_URL=redis://localhost:6379

# ============================================
# OPTIONAL - Search / OpenSearch
# ============================================
# OPENSEARCH_URL=http://localhost:9200

# ============================================
# OPTIONAL - Analytics
# ============================================
# VITE_ANALYTICS_ENDPOINT=
# VITE_ANALYTICS_WEBSITE_ID=

# ============================================
# OPTIONAL - Data Connectors
# ============================================
# ACLED_API_KEY=  # Required if enabling ACLED connector
# HDX_API_KEY=    # Optional for HDX HAPI

# ============================================
# NOTES
# ============================================
# 1. Copy this file: cp .env.example .env
# 2. Fill in required variables (marked REQUIRED above)
# 3. Configure optional services as needed
# 4. Never commit .env to git (already in .gitignore)
# 5. See docs/ENV_VARS.md for detailed documentation
```

**Priority:** 🔴 High  
**Effort:** Low (5-10 minutes)  
**Owner:** DevOps / Platform Team

**Verification:**
```bash
# After creating .env.example
cp .env.example .env
# Edit .env with actual values
pnpm run dev
```

---

### 🔴 BLOCKER 2: ACLED Connector API Key Required

**Impact:** Medium  
**Affects:** Conflict data ingestion  
**Detected In:** `/server/connectors/index.ts` line 846

**Problem:**
- ACLED connector is marked as `status: 'blocked'` due to `requiresKey: true`
- Conflict event data cannot be ingested without API key
- No documentation on how to obtain ACLED API key
- Fallback mechanism not implemented

**Evidence:**
```typescript
// /server/connectors/index.ts lines 843-848
{
  id: 'acled',
  name: 'Armed Conflict Location & Event Data',
  type: 'api',
  url: 'https://api.acleddata.com',
  cadence: 'weekly',
  status: 'blocked',      // ← BLOCKED
  requiresKey: true,      // ← Requires API key
},
```

**Impact on Features:**
- `/sectors/conflict-economy` page may have limited data
- Conflict indicators incomplete
- Timeline events missing conflict data

**Options:**

**Option A: Obtain ACLED API Key (Recommended)**
1. Register at https://developer.acleddata.com/
2. Request API key (usually approved within 24-48 hours)
3. Add to environment: `ACLED_API_KEY=your-key-here`
4. Update connector status to `'active'`

**Option B: Use Alternative Data Sources**
- UCDP (Uppsala Conflict Data Program) - Already implemented, no key required
  - File: `/server/connectors/index.ts` lines 833-840
  - Status: `'active'`
- OCHA humanitarian data - Includes conflict indicators
- Use static/historical ACLED data (if available)

**Option C: Implement Mock Data Fallback**
- Create fallback connector with representative conflict data
- Document data limitations
- Tag data as "estimated" or "proxy"

**Recommended Action:**
1. Document ACLED API key registration process in [CONNECTORS.md](./CONNECTORS.md)
2. Add ACLED_API_KEY to .env.example (see Blocker 1)
3. Update connector documentation with key acquisition steps
4. Consider implementing UCDP as primary conflict data source (no key required)

**Priority:** 🟡 Medium  
**Effort:** Medium (API key registration: 2-3 days, documentation: 1 hour)  
**Owner:** Data Engineering Team

**Workaround:**
Use UCDP connector instead (already active):
```typescript
// UCDP is active and doesn't require API key
{
  id: 'ucdp',
  name: 'Uppsala Conflict Data Program',
  type: 'api',
  url: 'https://ucdp.uu.se/api',
  cadence: 'annual',
  status: 'active',        // ← Active
  requiresKey: false,      // ← No key required
}
```

---

## Minor Issues (Not Blockers)

### 🟡 Issue 1: Documentation Gaps

**Impact:** Low  
**Affects:** Onboarding, feature discovery

**Gaps:**
1. 33 routes not documented in SITEMAP_FULL.md
   - See [ROUTE_REALITY_CHECK.md](./ROUTE_REALITY_CHECK.md) for full list
   - VIP cockpit routes undocumented
   - Many new admin routes undocumented

2. Connector documentation incomplete
   - No guide for obtaining API keys
   - Connector health monitoring not documented
   - Scheduler configuration not fully documented

**Recommended Action:**
1. Update SITEMAP_FULL.md with 33 orphan routes
2. Create ADMIN_ROUTES.md for admin-specific documentation
3. Expand CONNECTORS.md with API key guides
4. Document scheduler configuration in detail

**Priority:** 🟡 Medium  
**Effort:** Medium (3-4 hours)  
**Owner:** Documentation Team

---

### 🟢 Issue 2: Test Coverage Gaps

**Impact:** Low  
**Affects:** Code quality, regression prevention

**Observation:**
- SITEMAP_FULL.md shows many routes with ⚠️ (partial test coverage)
- E2E tests: Only 1 spec file (`/e2e/critical-journeys.spec.ts`)
- Unit tests: Good coverage in `/server/**/*.test.ts` but frontend tests minimal

**Evidence:**
```bash
# E2E tests
find e2e -name "*.spec.ts" | wc -l
# Result: 1

# Unit tests
find server -name "*.test.ts" | wc -l
# Result: 20+
```

**Recommended Action:**
1. Add E2E tests for critical user journeys
2. Add component tests for complex UI (AI Assistant, Data Repository, etc.)
3. Add API integration tests for tRPC routers
4. Document test writing guidelines

**Priority:** 🟢 Low (not blocking)  
**Effort:** High (ongoing effort)  
**Owner:** QA / Engineering Team

---

## Resolved / Non-Issues

### ✅ TypeScript Configuration

**Status:** ✅ Complete  
**Evidence:** `/tsconfig.json` is properly configured with strict mode, path aliases, and bundler resolution

### ✅ Database Schema

**Status:** ✅ Complete  
**Evidence:** Multiple schema files exist, migrations present in `/drizzle/*.sql`

### ✅ Build System

**Status:** ✅ Complete  
**Evidence:** 
- Vite configured (`/vite.config.ts`)
- esbuild configured in package.json
- Docker multi-stage build working (`/Dockerfile`)

### ✅ Router Implementation

**Status:** ✅ Complete  
**Evidence:** All 113 routes properly defined in `/client/src/App.tsx`

### ✅ Package Management

**Status:** ✅ Complete  
**Evidence:** 
- pnpm configured with lockfile
- packageManager field set in package.json
- All dependencies properly declared

---

## Checklist for Production Readiness

Use this checklist to track blocker resolution:

### Critical Items
- [ ] Create `.env.example` file with all variables (BLOCKER 1)
- [ ] Obtain ACLED API key OR document UCDP as primary conflict source (BLOCKER 2)
- [ ] Test full deployment with .env.example → .env workflow
- [ ] Verify all required environment variables are documented

### Important Items
- [ ] Update SITEMAP_FULL.md with 33 orphan routes
- [ ] Create ADMIN_ROUTES.md documentation
- [ ] Document ACLED API key registration process
- [ ] Add E2E tests for top 10 user journeys
- [ ] Set up CI/CD pipeline with environment variable injection

### Nice to Have
- [ ] Expand connector documentation
- [ ] Add more unit tests
- [ ] Create deployment runbook
- [ ] Set up monitoring and alerting
- [ ] Document backup and recovery procedures

---

## How to Contribute

If you're resolving a blocker:

1. Update this file with resolution details
2. Move item from "Critical Blockers" to "Resolved / Non-Issues"
3. Add verification steps
4. Update related documentation
5. Close related GitHub issues (if any)

---

## Contact

For questions about blockers:
- **Environment Variables:** See [ENV_VARS.md](./ENV_VARS.md)
- **Routes:** See [ROUTE_REALITY_CHECK.md](./ROUTE_REALITY_CHECK.md)
- **Setup:** See [ENGINEERING_BASELINE.md](./ENGINEERING_BASELINE.md)

---

## Changelog

- **2026-02-04:** Initial blockers document created
  - Identified 2 critical blockers
  - Documented 2 minor issues
  - Confirmed 5 areas are complete and not blocking
