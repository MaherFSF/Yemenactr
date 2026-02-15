# YETO Platform - Blockers & Missing Components

**Generated:** 2026-02-04  
**Updated:** 2026-02-04 (CI failure analysis added)  
**Purpose:** Track missing components that block development/deployment  
**Status:** 🔴 3 Critical Blockers (1 Resolved, 2 Active)

---

## Summary

- **Total Blockers:** 3 critical
- **Active:** 2 (Database schema, ACLED API key)
- **Resolved:** 1 (.env.example created)
- **CI Status:** ❌ Failing (6/11 release gates failing)
- **PR Merge Status:** 🔴 Blocked until database schema is fixed

---

## Critical Blockers

### 🔴 BLOCKER 1: Database Schema Missing v2.5 Columns

**Impact:** Critical - CI/CD Pipeline Failing  
**Affects:** All deployments, release gate, data integrity  
**Detected In:** CI test-and-gate job #62555852725

**Problem:**
- Database schema is missing required v2.5 columns
- Release gate failing: 6/11 gates failing
- CI cannot complete successfully
- Blocks all merges to main branch

**Evidence:**
```bash
# CI Error (from test-and-gate job)
Release Gate Error: Unknown column 'sourceType' in 'field list'

❌ Gate 1: Source Registry Count - 150 (min: 250)
❌ Gate 2: Active Sources - 75 (min: 150)
❌ Gate 3: Sector Codebook - 0 (expected: 16)
❌ Gate 5: Sector Mappings - 0.0% (min: 50%)
❌ Gate 8: S3 Storage - Missing credentials
❌ Gate 9: v2.5 Schema Columns - Missing: sourceType, licenseState, 
           needsClassification, reliabilityScore, evidencePackFlag
```

**Missing Columns in `sources_registry` table:**
- `sourceType`
- `licenseState`
- `needsClassification`
- `reliabilityScore`
- `evidencePackFlag`

**Root Cause:**
- Schema migration not applied to test database
- CI database initialization missing v2.5 schema updates
- Possible migration file missing or not executed

**Recommended Action:**
1. **Check migration files:** Review `/drizzle/*.sql` for v2.5 column additions
2. **Update schema:** Add missing columns to `/drizzle/schema-source-registry.ts`
3. **Create migration:** Run `pnpm run db:push` to generate migration
4. **Update CI:** Ensure GitHub Actions runs migrations before release-gate
5. **Seed data:** Populate source registry to meet minimum counts (250 sources, 16 sectors)

**Priority:** 🔴 Critical (blocks all PRs)  
**Effort:** High (2-4 hours: schema update + migration + CI fix + data seeding)  
**Owner:** Database Team / DevOps

**Related Files:**
- Schema: `/drizzle/schema-source-registry.ts`
- Release gate: `/scripts/release-gate.mjs`
- CI workflow: `/.github/workflows/*.yml`
- Migrations: `/drizzle/*.sql`

---

### 🔴 BLOCKER 2: Missing `.env.example` File

**Impact:** High  
**Affects:** New engineers, deployment, CI/CD  
**Detected In:** Root directory scan (no `.env*` files found)  
**Status:** ✅ **RESOLVED** - `.env.example` created in this PR

**Problem:**
- No `.env.example` template file existed
- New engineers didn't know which environment variables to set
- Deployment teams lacked configuration reference
- CI/CD pipelines needed manual configuration

**Evidence:**
```bash
# Glob search for .env files (before fix)
Result: 0 files found
```

**Resolution:**
Created comprehensive `.env.example` file with:
- All 30+ environment variables documented
- Required vs optional categorization
- Development and production examples
- Inline documentation and usage instructions
- Connector status and API key requirements
- Troubleshooting tips

**Required Variables:** See [ENV_VARS.md](./ENV_VARS.md) for complete list

**Minimum Required:**
- `DATABASE_URL`
- `JWT_SECRET`
- `NODE_ENV`

**Verification:**
```bash
# After this PR merges
cp .env.example .env
# Edit .env with actual values
pnpm run dev

---

### 🔴 BLOCKER 3: ACLED Connector API Key Required

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

### Critical Items (Blocking CI/CD)
- [ ] **Fix database schema** - Add v2.5 columns to sources_registry table (BLOCKER 1)
- [ ] **Update CI migrations** - Ensure migrations run before release-gate (BLOCKER 1)
- [ ] **Seed source registry** - Add sources to meet minimum count of 250 (BLOCKER 1)
- [ ] **Seed sector codebook** - Add 16 sector definitions (BLOCKER 1)
- [ ] **Configure CI S3 credentials** - Add to GitHub Secrets (BLOCKER 1)
- [x] **Create `.env.example`** - Done in this PR (BLOCKER 2 - RESOLVED)
- [ ] **Obtain ACLED API key** OR document UCDP as primary conflict source (BLOCKER 3)

### Important Items
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

- **2026-02-04 (Update 2):** CI failure analysis and resolution
  - Added BLOCKER 1: Database schema missing v2.5 columns (critical - blocks CI)
  - Resolved BLOCKER 2: Created `.env.example` file
  - Renumbered BLOCKER 3: ACLED API key (unchanged)
  - Updated checklist with CI fix action items
  - Analyzed failed CI run #62555852725
  - Documented 6 failing release gates

- **2026-02-04 (Update 1):** Initial blockers document created
  - Identified 2 critical blockers
  - Documented 2 minor issues
  - Confirmed 5 areas are complete and not blocking
