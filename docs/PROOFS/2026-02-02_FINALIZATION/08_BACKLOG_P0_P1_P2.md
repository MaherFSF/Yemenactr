# YETO v0.2.3 Backlog — P0 / P1 / P2

**Date:** 2026-02-02  
**Version:** 654e2148

---

## P0 — Launch Blockers (MUST FIX BEFORE LAUNCH)

| # | Issue | File Path | Symptom | Proof | Fix Action | Acceptance Test | Status |
|---|-------|-----------|---------|-------|------------|-----------------|--------|
| P0-1 | Mock evidence in drawer | `client/src/pages/Dashboard.tsx:330-352` | Evidence drawer shows "Sample Data Source" instead of real sources | Browser screenshot | Replace mock data with subjectType/subjectId lookup | Drawer shows "Central Bank of Yemen" | ✅ FIXED |
| P0-2 | Banking shows 0 banks | `server/routers/sectorKpiRouter.ts:45` | KPI card shows "0 بنك" when DB has 39 banks | Browser screenshot | Fix async/await for getDb() | Banking page shows 39 banks | ✅ FIXED |
| P0-3 | sectorKpiRouter async bug | `server/routers/sectorKpiRouter.ts` | `db.select is not a function` error | Console log | Add `await` to all getDb() calls | No console errors | ✅ FIXED |
| P0-4 | Entities JSON render error | `client/src/pages/Entities.tsx:310` | "Objects are not valid as React child" for claim_subject | Browser console | Stringify JSON objects before rendering | Entities page loads without error | ✅ FIXED |

**P0 Summary:** 4/4 resolved ✅

---

## P1 — Important (Fix Within 1 Week)

| # | Issue | File Path | Symptom | Impact | Effort | Acceptance Test |
|---|-------|-----------|---------|--------|--------|-----------------|
| P1-1 | ReliefWeb connector 403 | `scripts/run-real-connectors.mjs` | API returns 403 Forbidden | No humanitarian data ingestion | 2h | Connector returns 200 with records |
| P1-2 | EN Dashboard inflation 0% | `client/src/pages/Dashboard.tsx` | EN version shows 0% inflation vs AR 25% | Data inconsistency across languages | 1h | EN and AR show same values |
| P1-3 | Arabic content on EN pages | Various components | Some Arabic text appears on EN routes | UX degradation for EN users | 2h | All text in EN on EN routes |
| P1-4 | Route sweep incomplete | N/A | Only 7 routes tested, need 20+ | Missing coverage for sector routes | 4h | All routes in truth table |
| P1-5 | evidence_items count 0 | `drizzle/schema.ts` | evidence_items table empty despite 898 packs | Evidence chain incomplete | 2h | evidence_items > 0 |
| P1-6 | gap_tickets count 7 | N/A | 7 unresolved gap tickets | Data gaps not addressed | 1h | gap_tickets = 0 or documented |

**P1 Total Effort:** ~12 hours

---

## P2 — Nice to Have (Backlog)

| # | Issue | File Path | Description | Impact | Effort |
|---|-------|-----------|-------------|--------|--------|
| P2-1 | Mobile responsive testing | All pages | No mobile screenshots captured | Unknown mobile UX | 4h |
| P2-2 | Admin routes testing | `/admin/*` | Admin routes not in route sweep | Unknown admin UX | 2h |
| P2-3 | Performance baseline | N/A | No load time metrics captured | Unknown performance | 2h |
| P2-4 | Accessibility audit | All pages | No a11y testing done | Unknown accessibility | 4h |
| P2-5 | Error boundary coverage | Client components | Some components lack error boundaries | Potential crashes | 3h |

**P2 Total Effort:** ~15 hours

---

## Route Coverage Gap

### Routes Tested (7)
- `/` ✅
- `/home` ✅
- `/dashboard` (AR+EN) ✅
- `/entities` ✅
- `/entities/:id` ✅
- `/sectors/banking` (AR+EN) ✅

### Routes NOT Tested (Need P1-4)
**Sector Routes (16):**
- `/sectors/agriculture`
- `/sectors/energy`
- `/sectors/finance`
- `/sectors/health`
- `/sectors/education`
- `/sectors/infrastructure`
- `/sectors/telecommunications`
- `/sectors/trade`
- `/sectors/manufacturing`
- `/sectors/tourism`
- `/sectors/real-estate`
- `/sectors/transport`
- `/sectors/water`
- `/sectors/mining`
- `/sectors/fisheries`
- `/sectors/construction`

**Other Public Routes:**
- `/corporate-registry`
- `/research`
- `/timeline`
- `/methodology`
- `/reports`
- `/ai`

**Admin Routes:**
- `/admin/source-registry`
- `/admin/bulk-classification`
- `/admin/ingestion`
- `/admin/users/subscriptions`

---

## Evidence Rule Compliance

### Current State
- Dashboard KPIs: ✅ Evidence-native (subjectType/subjectId lookup)
- Entity Claims: ✅ Evidence drawer with real sources
- Banking KPIs: ⚠️ Shows grades but needs evidence_pack verification

### Required Proof (Not Yet Complete)
1. SQL proof: Count of KPIs with grade vs KPIs with evidence_pack_id
2. Unit test: Fail if grade renders without evidence_pack_id
3. Browser proof: 6 Dashboard + 2 Banking KPIs with drawer screenshots

---

## Next Sprint Priorities

1. **P1-4: Complete route sweep** — Test all 20+ routes with AR+EN, desktop+mobile
2. **P1-1: Fix ReliefWeb connector** — Investigate 403 error, add authentication
3. **P1-5: Populate evidence_items** — Ensure evidence chain is complete
4. **Evidence rule unit test** — Add test to prevent grade-without-pack regression
