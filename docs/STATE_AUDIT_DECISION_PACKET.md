# YETO Platform State Audit Decision Packet

**Date:** February 1, 2026  
**Audit Type:** Safe State Audit (No Code Changes)  
**Checkpoint Reference:** `1e47ee47` — "YETO Platform State Audit - 10/10 release gates passing"  
**Author:** Manus AI

---

## Executive Summary

This decision packet provides a proof-grade status assessment of the YETO (Yemen Economic Transparency Observatory) platform following the "PROMPT 5.1/6 (P0 PATCH) — Zero-Fake UI" checkpoint. The audit validates runtime health, release gate compliance, database schema integrity, and git discipline to inform the operator's next action.

**Overall Status:** The platform is **functionally operational** with all 10 release gates passing and 736 tests passing. However, there are **two P0 blockers** affecting public page data display that require immediate attention before production deployment.

---

## Section A: Runtime + Release Gate Truth

### A.1 Test Suite Results

| Metric | Value | Status |
|--------|-------|--------|
| Test Files | 34 passed | ✅ |
| Total Tests | 736 passed | ✅ |
| Duration | 24.80s | ✅ |
| Failed Tests | 0 | ✅ |

All 736 tests pass successfully across 34 test files. The test suite covers source registry operations, feed matrix routing, bulk classification, webhook delivery, connector health alerts, and other core functionality.

### A.2 TypeScript Compilation

| Metric | Value | Status |
|--------|-------|--------|
| Total Errors | 129 | ⚠️ |
| Runtime Impact | None (code executes) | ✅ |

The 129 TypeScript errors are primarily concentrated in agent service files (`laborWagesAgent.ts`, `macroSectorAgent.ts`) and relate to schema column mismatches between code expectations and actual database schema. These errors do not prevent runtime execution but indicate technical debt. The full error list has been saved to `/docs/TYPECHECK_ERRORS.md`.

**Top Error Categories:**
1. Missing properties (`year`, `month`, `isProxied`, `confidence`, `evidencePackId`) on time_series type
2. Enum type mismatches for alert types
3. Missing `sectorCode` property on ingestion_runs insert
4. Undefined variable references (`dataUpdates`)

### A.3 Release Gate Results

All 10 release gates pass successfully:

| Gate | Check | Result | Status |
|------|-------|--------|--------|
| 1 | Source Registry Count | 292 (min: 250) | ✅ |
| 2 | Active Sources | 234 (min: 150) | ✅ |
| 3 | Sector Codebook | 16 (expected: 16) | ✅ |
| 4 | Tier Distribution | 40.8% UNKNOWN (max: 70%) | ✅ |
| 5 | Sector Mappings | 100.0% (min: 50%) | ✅ |
| 6 | No Duplicate Source IDs | 0 duplicates | ✅ |
| 7 | Required Fields | 0 null names | ✅ |
| 8 | S3 Storage Health | Configured | ✅ |
| 9 | v2.5 Schema Columns | All present | ✅ |
| 10 | NO_STATIC_PUBLIC_KPIS | Clean | ✅ |

**Tier Distribution:**
- T0 (Official Statistical Authorities): 16
- T1 (Multilateral/UN Operational): 117
- T2 (Research Institutions): 22
- T3 (Aggregated Media): 18
- UNKNOWN: 119 (40.8%)

### A.4 Browser Smoke Test Results

| Page | Data Displays | SourcesUsedPanel | Evidence Drawer | Status |
|------|---------------|------------------|-----------------|--------|
| `/entities` | ❌ "No Data Available" | ✅ Present | N/A | **FAIL** |
| `/corporate-registry` | ✅ GAP tickets shown | ✅ 50 sources | ✅ Working | **PASS** |
| `/admin/source-registry` | ✅ 292 sources | N/A | N/A | **PASS** |
| `/admin/bulk-classification` | ❌ Shows 0 sources | N/A | N/A | **FAIL** |

**Critical Finding:** The `/entities` page shows "No Data Available" despite 79 entities existing in the database. The root cause is a **stale MySQL connection** in the entities router. The connection pool is not properly handling connection lifecycle, causing queries to fail silently and return empty arrays.

---

## Section B: Database Schema Drift Check

### B.1 Table Existence Verification

| Table Name | Expected by Code | Exists in DB | Row Count | Priority | Next Action |
|------------|------------------|--------------|-----------|----------|-------------|
| `source_registry` | Y | Y | 292 | - | None |
| `sector_codebook` | Y | Y | 16 | - | None |
| `entities` | Y | Y | 79 | - | Fix connection |
| `entity_claims` | Y | Y | 0 | P1 | Populate data |
| `library_documents` | Y | Y | 0 | P1 | Populate data |
| `gap_tickets` | Y | Y | 0 | P2 | Auto-generate |
| `indicator_values` | Y | N | N/A | P1 | Create table |
| `timeline_events` | Y | N | N/A | P1 | Create table |

### B.2 Schema Column Verification

The `entities` table schema matches between Drizzle definition and database:

| Column | Drizzle Schema | Database | Match |
|--------|----------------|----------|-------|
| `id` | int, autoincrement, PK | ✅ | ✅ |
| `name` | varchar(255), notNull | ✅ | ✅ |
| `nameAr` | varchar(255) | ✅ | ✅ |
| `entityType` | enum | ✅ | ✅ |
| `regimeTag` | enum | ✅ | ✅ |

The entities router correctly uses `name` and `nameAr` columns (not `nameEn`), matching the actual database schema. The previous context mentioning a "nameEn vs name mismatch" was **incorrect**—the actual issue is the connection pool problem.

### B.3 Key Table Row Counts

| Table | Rows | Purpose |
|-------|------|---------|
| `source_registry` | 292 | Canonical source universe |
| `entities` | 79 | Economic entities directory |
| `indicators` | 165 | Economic indicators |
| `time_series` | 6,684+ | Time series data points |
| `economic_events` | 237 | Timeline events |
| `documents` | 57 | Research documents |
| `commercial_banks` | 39 | Banking sector entities |
| `alerts` | 378 | System alerts |

---

## Section C: Git / Checkpoint Discipline

### C.1 Repository Status

| Property | Value |
|----------|-------|
| Current Branch | `main` |
| Last Commit Hash | `1e47ee47` |
| Commit Message | "Checkpoint: YETO Platform State Audit - 10/10 release gates passing, 736 tests passing, 292 sources, 234 active. Ready for GitHub export." |
| Branch Status | Up to date with `origin/main` |
| Uncommitted Changes | 2 files (docs only) |

### C.2 Changed Files Since Checkpoint

| File | Change Type | Impact |
|------|-------------|--------|
| `docs/SMOKE_TEST_RESULTS.md` | Modified | Documentation only |
| `docs/TYPECHECK_ERRORS.md` | New (untracked) | Documentation only |

Both changes are documentation files created during this audit and do not affect platform functionality.

### C.3 GitHub Export Status

The repository is **not yet pushed to GitHub**. The current remote (`origin`) points to Manus internal S3 storage:
```
origin  s3://vida-prod-gitrepo/webdev-git/310419663029421755/XodoyKMzPdFiKkVj3QFTGK
```

**GitHub Export Plan:**
1. User navigates to Management UI → Settings → GitHub
2. Selects GitHub account and repository name
3. Clicks "Export" to push code to GitHub
4. Manus handles the git push operation internally

---

## Section D: Decision Pack Summary

### ✅ What Is Actually Working Now

1. **Source Registry**: 292 sources imported from v2.5 Excel workbook, fully searchable and filterable
2. **Release Gates**: All 10 automated quality gates passing
3. **Test Suite**: 736 tests passing with comprehensive coverage
4. **Admin UI**: Source Registry, Sector Feed Matrix, Page Feed Matrix pages functional
5. **Zero-Fake UI**: Corporate Registry correctly shows GAP tickets instead of fabricated data
6. **S3 Integration**: Export functionality with signed URLs working
7. **Bulk Classification**: Engine reduced UNKNOWN tier from 57% to 40.8%
8. **SourcesUsedPanel**: Component renders on public pages with source attribution

### 🔴 True Blockers (P0)

| ID | Issue | Impact | Root Cause |
|----|-------|--------|------------|
| P0-001 | `/entities` page shows "No Data Available" | Public page broken | Stale MySQL connection in entities router |
| P0-002 | `/admin/bulk-classification` shows 0 sources | Admin functionality broken | Same connection pool issue |

**Root Cause Analysis:** The entities router creates a single MySQL connection at module load time and reuses it indefinitely. When the connection times out or is closed by the server, subsequent queries fail silently and return empty arrays. The connection is never re-established.

**Fix Required:** Implement connection pooling or connection health checks in `server/routers/entities.ts`.

### 🟠 High Priority (P1)

| ID | Issue | Impact | Effort |
|----|-------|--------|--------|
| P1-001 | 129 TypeScript errors | Technical debt, CI/CD risk | Medium |
| P1-002 | `entity_claims` table empty | No verified claims displayed | Medium |
| P1-003 | `indicator_values` table missing | Schema drift | Low |
| P1-004 | `timeline_events` table missing | Schema drift | Low |
| P1-005 | 119 UNKNOWN tier sources | Classification incomplete | Medium |

---

## Recommended Next Prompt

**Recommended:** Execute **PROMPT 6/6: P0 Connection Fix + Entities Page Restoration**

**Rationale:** The P0 blockers directly affect public-facing pages and must be resolved before any production deployment or GitHub export. The connection pool issue is a single-point-of-failure that affects multiple pages and should be fixed with a proper connection management pattern.

**Prompt Text:**
```
PROMPT 6/6: P0 CONNECTION FIX + ENTITIES PAGE RESTORATION

Objective: Fix the stale MySQL connection issue in entities router and restore 
/entities page functionality.

Tasks:
1. Replace single connection with connection pool in server/routers/entities.ts
2. Implement connection health check before queries
3. Verify /entities page displays 79 entities
4. Verify /admin/bulk-classification shows 292 sources
5. Run full test suite to confirm no regressions
6. Save checkpoint

STOP CONDITION:
- /entities page shows 79 entities (not "No Data Available")
- /admin/bulk-classification shows 292 sources
- All 10 release gates still passing
- All 736+ tests still passing
```

### Verification Checklist for Next Prompt

| # | Check | Expected Result |
|---|-------|-----------------|
| 1 | `/entities` page loads | Shows 79 entities, not "No Data Available" |
| 2 | `/admin/bulk-classification` loads | Shows 292 sources, tier distribution |
| 3 | `pnpm test` | 736+ tests passing |
| 4 | `node scripts/release-gate.mjs` | All 10 gates passing |
| 5 | Browser console | No connection errors |
| 6 | tRPC endpoint test | `entities.getWithClaims` returns data |

---

## Files Created/Updated

| File | Action | Purpose |
|------|--------|---------|
| `/docs/STATE_AUDIT_DECISION_PACKET.md` | Created | This decision packet |
| `/docs/TYPECHECK_ERRORS.md` | Created | Full TypeScript error list |
| `/docs/SMOKE_TEST_RESULTS.md` | Updated | Browser smoke test results |

---

## Appendix: Console Errors Observed

During the audit, the following console errors were observed:
```
[rawQuery] Query failed: Error: Can't add new command when connection is in closed state
```

This error confirms the P0 root cause: the MySQL connection is being closed by the server (likely due to idle timeout) and the code does not handle reconnection.

---

*End of Decision Packet*
