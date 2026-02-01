# Prioritized Issue Backlog
# قائمة المشاكل المرتبة حسب الأولوية

**Generated:** 2026-02-01T17:09:00Z  
**Total Issues:** 25

---

## P0 - Critical (Blocks Launch) / حرجة

| # | Issue | File Path | Impact | Effort |
|---|-------|-----------|--------|--------|
| P0-1 | Evidence Drawer shows mock data | `client/src/components/EvidencePackButton.tsx:85` | Users see fabricated provenance | 2h |
| P0-2 | `/en/entities` returns 404 | `client/src/App.tsx` | Core feature broken | 1h |
| P0-3 | Ingestion runs stuck at "running" | `server/connectors/IngestionOrchestrator.ts` | No new data ingested | 4h |
| P0-4 | `evidence_packs` table empty | `server/connectors/BaseConnector.ts` | Provenance system broken | 4h |
| P0-5 | Schema drift: 130 TypeScript errors | `drizzle/schema.ts` | Runtime errors possible | 6h |

**P0 Total Effort:** ~17 hours

---

## P1 - High Priority (Degrades Experience) / أولوية عالية

| # | Issue | File Path | Impact | Effort |
|---|-------|-----------|--------|--------|
| P1-1 | `entity_claims` only 18 rows | `scripts/populate-entity-claims.mjs` | Entity profiles incomplete | 8h |
| P1-2 | `gap_tickets` empty | `server/services/gapDetection.ts` | Gap system non-functional | 4h |
| P1-3 | `library_documents` empty | `server/routers/library.ts` | Research library broken | 2h |
| P1-4 | 119 sources with UNKNOWN tier | `source_registry` table | License enforcement broken | 4h |
| P1-5 | Sources not linked to banking page | `client/src/pages/SectorBanking.tsx` | Provenance unclear | 2h |
| P1-6 | Contradiction detection not running | `server/services/contradictionDetection.ts` | Conflicts not surfaced | 4h |
| P1-7 | `data_contradictions` empty | Database | No contradictions recorded | 2h |

**P1 Total Effort:** ~26 hours

---

## P2 - Medium Priority (Technical Debt) / أولوية متوسطة

| # | Issue | File Path | Impact | Effort |
|---|-------|-----------|--------|--------|
| P2-1 | `sector_briefs` empty | `server/services/macroSectorAgent.ts` | No briefs generated | 4h |
| P2-2 | `sector_alerts` empty | `server/services/laborWagesAgent.ts` | No alerts generated | 4h |
| P2-3 | `sector_agent_runs` schema drift | `drizzle/schema.ts` | Agent runs not logged | 2h |
| P2-4 | `raw_objects` empty | `server/connectors/BaseConnector.ts` | Raw storage not used | 4h |
| P2-5 | Scheduler jobs not completing | `server/services/scheduler.ts` | Automation broken | 4h |
| P2-6 | Static scan: 930 suspicious patterns | Various files | Potential hardcoded data | 8h |
| P2-7 | Vintage/historical data not populated | `data_vintages` table | No revision history | 4h |
| P2-8 | Missing agents (entity resolution, etc.) | `server/services/` | Features not implemented | 16h |
| P2-9 | T3/T4 license enforcement not verified | `server/middleware/` | Restricted data may leak | 4h |
| P2-10 | GitHub Actions not verified | `.github/workflows/main.yml` | CI may fail | 1h |
| P2-11 | Branch protection not configured | GitHub UI | Security risk | 1h |
| P2-12 | Insight Miner UI missing | `client/src/pages/` | Feature not accessible | 4h |
| P2-13 | Entity directory shows 79 (not 200+) | `entities` table | Data incomplete | 8h |

**P2 Total Effort:** ~64 hours

---

## Issue Details / تفاصيل المشاكل

### P0-1: Evidence Drawer Mock Data

**Problem:** `EvidencePackButton.tsx` falls back to mock data when no evidence exists.

**Code:**
```typescript
// Line 85
const getMockEvidenceData = (id: string): EvidencePackData => ({
  ...
});

// Line 116
const data = providedData || getMockEvidenceData(evidencePackId || packId || "unknown");
```

**Fix:** Replace mock fallback with "No evidence available" message.

---

### P0-2: Entity Directory 404

**Problem:** `/en/entities` route returns 404.

**Likely Cause:** Route not registered in `App.tsx` or path mismatch.

**Fix:** Add route registration:
```tsx
<Route path="/en/entities" component={EntityDirectory} />
```

---

### P0-3: Ingestion Runs Stuck

**Problem:** All 37 ingestion runs have status "running" with 0 records.

**Evidence:**
```sql
SELECT status, COUNT(*) FROM ingestion_runs GROUP BY status;
-- Result: running: 37
```

**Fix:** Add completion logic in `IngestionOrchestrator.ts`.

---

### P0-5: Schema Drift

**Problem:** TypeScript expects columns that don't exist in DB.

**Examples:**
- `time_series.indicatorId` vs `indicatorCode`
- `sources.tier` not present
- `sector_agent_runs.sectorCode` not present

**Fix:** Update `drizzle/schema.ts` to match actual DB, then run `pnpm db:push`.

---

## Summary / الملخص

| Priority | Count | Total Effort |
|----------|-------|--------------|
| P0 | 5 | ~17 hours |
| P1 | 7 | ~26 hours |
| P2 | 13 | ~64 hours |
| **Total** | **25** | **~107 hours** |

---

## Recommended Sprint Plan / خطة السبرنت المقترحة

### Sprint 1 (Week 1): P0 Resolution
- Fix P0-1 through P0-5
- Goal: All critical issues resolved

### Sprint 2 (Week 2): P1 Resolution
- Fix P1-1 through P1-7
- Goal: User experience improved

### Sprint 3 (Week 3-4): P2 Resolution
- Fix P2-1 through P2-13
- Goal: Technical debt reduced

---

**Report Generated:** 2026-02-01T17:09:00Z  
**Auditor:** Manus AI (QA Lead)
