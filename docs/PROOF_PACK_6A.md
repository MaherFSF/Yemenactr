# PROOF PACK 6A — Safe State Re-Audit

**Timestamp:** 2026-02-01T01:09:09Z  
**Mode:** READ-ONLY (No code changes)  
**Checkpoint:** `1e47ee47`

---

## 1. Git Status + Branch + Diff Summary

```
=== GIT STATUS ===
On branch main
Your branch is up to date with 'origin/main'.
Changes not staged for commit:
	modified:   docs/DECISIONS.md
	modified:   docs/SMOKE_TEST_RESULTS.md
Untracked files:
	docs/STATE_AUDIT_DECISION_PACKET.md
	docs/TYPECHECK_ERRORS.md
no changes added to commit

=== CURRENT BRANCH ===
main

=== LAST COMMIT ===
1e47ee4 (HEAD -> main, origin/main, origin/HEAD) Checkpoint: YETO Platform State 
Audit - 10/10 release gates passing, 736 tests passing, 292 sources, 234 active. 
Ready for GitHub export.
```

**Summary:** Clean working tree with only documentation changes (from previous audit). No code changes since checkpoint.

---

## 2. Test Suite Proof

```
 Test Files  34 passed (34)
      Tests  736 passed (736)
   Start at  20:05:04
   Duration  24.95s (transform 2.69s, setup 0ms, collect 7.70s, tests 45.18s, environment 8ms, prepare 2.81s)
```

**Result:** ✅ ALL 736 TESTS PASSING

---

## 3. Release Gate Proof

```
╔══════════════════════════════════════════════════════════════╗
║           YETO Platform Release Gate v2.5                    ║
╚══════════════════════════════════════════════════════════════╝
🔍 Gate 1: Source Registry Count
   ✅ Sources: 292 (min: 250)
🔍 Gate 2: Active Sources
   ✅ Active: 234 (min: 150)
🔍 Gate 3: Sector Codebook
   ✅ Sectors: 16 (expected: 16)
🔍 Gate 4: Tier Distribution
   ✅ Unknown Tier: 40.8% (max: 70%)
🔍 Gate 5: Sector Mappings
   ✅ Mapped: 100.0% (min: 50%)
🔍 Gate 6: No Duplicate Source IDs
   ✅ Duplicates: 0
🔍 Gate 7: Required Fields
   ✅ Null names: 0
🔍 Gate 8: S3 Storage Health Check
   ✅ S3 Storage: Configured
🔍 Gate 9: v2.5 Schema Columns
   ✅ v2.5 columns: All present
🔍 Gate 10: NO_STATIC_PUBLIC_KPIS
   ✅ No static KPIs found in public UI pages

═══════════════════════════════════════════════════════════════
                        SUMMARY
═══════════════════════════════════════════════════════════════
✅ ALL GATES PASSED

Tier Distribution:
  T1: 117 (International)
  T0: 16 (Official)
  T3: 18 (Aggregated)
  T2: 22 (Research)
  UNKNOWN: 119 (Not classified)

Status Distribution:
  ACTIVE: 234
  PENDING_REVIEW: 41
  NEEDS_KEY: 17
```

**Result:** ✅ 10/10 RELEASE GATES PASSING

---

## 4. Typecheck Proof

**First 60 lines (sample errors):**
```
client/src/components/SourcesUsedPanel.tsx(84,7): error TS2322: Type '{ pageKey: string; className: string; }' is not assignable...
client/src/pages/Entities.tsx(107,26): error TS2802: Type 'Set<any>' can only be iterated through...
client/src/pages/EntityDetail.tsx(514,34): error TS2304: Cannot find name 'id'.
client/src/pages/admin/GraphConsole.tsx(311,21): error TS2304: Cannot find name 'useToast'.
drizzle/schema.ts(7764,41): error TS2349: This expression is not callable...
server/connectors/BaseConnector.ts(285,37): error TS2802: Type 'Map<string, BaseConnector>' can only be iterated...
server/connectors/HumanitarianConnector.ts(567,36): error TS2339: Property 'externalId' does not exist...
server/connectors/IMFConnector.ts(231,16): error TS2345: Argument of type...
```

**Error Count:** 129

**Result:** ⚠️ 129 TypeScript errors (non-blocking runtime)

---

## 5. Database Proof

### 5.1 Missing Tables Check

```
=== MISSING TABLES CHECK ===
indicator_values: DOES NOT EXIST
timeline_events: DOES NOT EXIST
```

### 5.2 Row Counts

| Table | Row Count | Status |
|-------|-----------|--------|
| `entities` | 79 | ✅ Populated |
| `source_registry` | 292 | ✅ Populated |
| `sector_codebook` | 16 | ✅ Populated |
| `entity_claims` | 0 | ⚠️ Empty |
| `library_documents` | 0 | ⚠️ Empty |
| `gap_tickets` | 0 | ⚠️ Empty |
| `raw_objects` | 0 | ⚠️ Empty |

**Result:**
- ✅ Core tables populated: entities (79), source_registry (292), sector_codebook (16)
- ❌ Missing tables: `indicator_values`, `timeline_events`
- ⚠️ Empty tables: `entity_claims`, `library_documents`, `gap_tickets`, `raw_objects`

---

## 6. Runtime Proof (Browser)

### 6.1 /entities Page

**Screenshot:** `/home/ubuntu/screenshots/3000-i4vxq021yxgpq5e_2026-01-31_20-07-31_4612.webp`

**Observation:**
- Page shows "Entity Directory" header
- Stats show: **0 Total Entities, 0 With Verified Data, 0 Data Gaps, 0 Entity Types**
- Entity cards show **loading skeletons** (yellow placeholder bars)
- "Sources Used on This Page" panel is visible but collapsed
- **NO ACTUAL ENTITY DATA DISPLAYED**

**Server Console Error:**
```
[rawQuery] Query failed: Error: Can't add new command when connection is in closed state
```

**Result:** ❌ **FAIL** — Shows 0 entities despite 79 in database

---

### 6.2 /admin/bulk-classification Page

**Screenshot:** `/home/ubuntu/screenshots/3000-i4vxq021yxgpq5e_2026-01-31_20-08-25_1086.webp`

**Observation:**
- Page shows "Bulk Classification Engine" header
- Stats show: **Total Sources: 0, Review Queue: 0, Unknown Tier: 0**
- Tier Distribution shows all zeros (T0: 0, T1: 0, T2: 0, T3: 0, UNKNOWN: 0)
- Classification Preview table is empty
- **NO SOURCE DATA DISPLAYED**

**Result:** ❌ **FAIL** — Shows 0 sources despite 292 in database

---

### 6.3 /admin/source-registry Page

**Screenshot:** `/home/ubuntu/screenshots/3000-i4vxq021yxgpq5e_2026-01-31_20-08-39_9757.webp`

**Observation:**
- Page shows "Source Registry" header
- Stats show: **292 Total Sources, 234 Active, 17 Needs API Key, 41 Pending Review, 16 Sectors**
- Tier Distribution: T1: 117, T2: 22, T0: 16, T3: 18, UNKNOWN: 119
- Source table displays actual data (IMF, World Bank, FAO sources visible)
- **DATA IS CORRECTLY DISPLAYED**

**Result:** ✅ **PASS** — Shows 292 sources correctly

---

### 6.4 /corporate-registry Page

**Screenshot:** `/home/ubuntu/screenshots/3000-i4vxq021yxgpq5e_2026-01-31_20-09-09_9665.webp`

**Observation:**
- Page shows "Corporate Registry" header
- Data Source Policy banner is visible
- GAP tickets displayed: GAP-CORP-001 through GAP-CORP-007
- Major Companies section shows entities with GAP ticket references (Aden Refinery, MTN Yemen, etc.)
- **Sources Used on This Page** panel shows: **50 sources** (Official Government: 16, International Organization: 34)
- **DATA GAPS AND SOURCES PANEL WORKING CORRECTLY**

**Result:** ✅ **PASS** — GAP tickets and SourcesUsedPanel render correctly

---

## TRUTH TABLE

| Item | Expected | Observed Now | Proof | Severity | Next Prompt Needed |
|------|----------|--------------|-------|----------|-------------------|
| Entities page data visible | 79 entities | 0 entities (loading skeleton) | Browser screenshot | **P0** | **YES** |
| Bulk classification page data visible | 292 sources | 0 sources | Browser screenshot | **P0** | **YES** |
| Source registry page data visible | 292 sources | 292 sources | Browser screenshot | - | No |
| Corporate registry GAP tickets | GAP tickets visible | 7 GAP tickets shown | Browser screenshot | - | No |
| SourcesUsedPanel renders | Panel visible | 50 sources shown | Browser screenshot | - | No |
| Release gate 10/10 passing | All pass | All pass | `node scripts/release-gate.mjs` | - | No |
| Tests passing | 736 pass | 736 pass | `pnpm test` | - | No |
| Typecheck errors count | 0 | 129 | `pnpm typecheck` | P1 | No (deferred) |
| Missing tables (schema drift) | None | 2 missing | SQL SHOW TABLES | P1 | No (deferred) |
| Empty key tables | Populated | 4 empty | SQL COUNT(*) | P2 | No (deferred) |

---

## GO/NO-GO DECISIONS

### Push to GitHub Now: **NO-GO** ❌

**Justification:** Two P0 runtime issues exist:
1. `/entities` page shows 0 entities despite 79 in database
2. `/admin/bulk-classification` shows 0 sources despite 292 in database

Both pages use the same `rawQuery` connection pattern in `server/routers/entities.ts` which fails silently when the MySQL connection times out. This is a critical user-facing bug that would be immediately visible to anyone visiting the platform.

### Proceed to Production Deployment: **NO-GO** ❌

**Justification:** Same P0 issues as above. Production deployment requires all public-facing pages to render data correctly. The `/entities` page is a core feature of the platform and must work before deployment.

---

## NEXT PROMPT RECOMMENDATION

**Selected Path:** **Path 1 (P0 Runtime)** — Connection lifecycle / query empties / page data missing

**Rationale:** The P0 issues are the most critical blockers. The root cause is a stale MySQL connection that fails silently. This must be fixed before GitHub export or production deployment. The fix is well-scoped (single file) and low-risk.

---

# PROMPT 6B — P0 Connection Fix + Entities/Bulk Classification Restoration

**Mode:** IMPLEMENTATION  
**Scope:** Fix stale MySQL connection issue in entities router

## Objectives

1. Replace single MySQL connection with connection pool in `server/routers/entities.ts`
2. Implement connection health check before queries
3. Verify `/entities` page displays 79 entities
4. Verify `/admin/bulk-classification` shows 292 sources with correct tier distribution
5. Run full test suite to confirm no regressions
6. Save checkpoint

## File Paths to Touch

| File | Action |
|------|--------|
| `server/routers/entities.ts` | Replace `getRawConnection()` with pooled connection |
| `server/routers/bulkClassification.ts` | Verify uses same connection pattern (may need fix) |

## Exact Commands to Run

```bash
# 1. After code changes, restart server
cd /home/ubuntu/yeto-platform && pnpm dev

# 2. Test entities endpoint
curl -s "http://localhost:3000/api/trpc/entities.getWithClaims?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22limit%22%3A5%2C%22offset%22%3A0%7D%7D%7D"

# 3. Run test suite
pnpm test

# 4. Run release gate
node scripts/release-gate.mjs

# 5. Browser verification (manual)
# - /entities must show 79 entities
# - /admin/bulk-classification must show 292 sources
```

## Implementation Pattern

Replace this:
```typescript
let _rawConn: mysql.Connection | null = null;
async function getRawConnection(): Promise<mysql.Connection | null> {
  if (!_rawConn && process.env.DATABASE_URL) {
    try {
      _rawConn = await mysql.createConnection(process.env.DATABASE_URL);
    } catch (error) {
      console.warn('[rawQuery] Failed to create connection:', error);
      return null;
    }
  }
  return _rawConn;
}
```

With this:
```typescript
import mysql from 'mysql2/promise';

let _pool: mysql.Pool | null = null;
function getPool(): mysql.Pool {
  if (!_pool && process.env.DATABASE_URL) {
    _pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000
    });
  }
  return _pool!;
}

async function rawQuery(sql: string, params: any[] = []): Promise<any[]> {
  try {
    const pool = getPool();
    const [rows] = await pool.query(sql, params);
    return (rows as any[]) || [];
  } catch (error) {
    console.error('[rawQuery] Query failed:', error);
    return [];
  }
}
```

## Strict Stop Conditions

| # | Check | Expected Result |
|---|-------|-----------------|
| 1 | `/entities` page loads | Shows 79 entities (not 0, not loading skeleton) |
| 2 | `/admin/bulk-classification` loads | Shows 292 sources with tier distribution |
| 3 | `pnpm test` | 736+ tests passing |
| 4 | `node scripts/release-gate.mjs` | All 10 gates passing |
| 5 | Server console | No "connection is in closed state" errors |
| 6 | tRPC endpoint test | `entities.getWithClaims` returns data with entities array length > 0 |

---

**STOP and wait for operator approval to apply changes.**

---

## Files Created During This Audit

| File | Purpose |
|------|---------|
| `/home/ubuntu/yeto-platform/docs/PROOF_PACK_6A.md` | This proof pack document |
| `/home/ubuntu/yeto-platform/scripts/db-check.mjs` | Database verification script (temporary) |

---

*End of PROOF PACK 6A*
