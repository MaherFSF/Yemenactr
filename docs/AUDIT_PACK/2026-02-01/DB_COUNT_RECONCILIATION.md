# DB Count Reconciliation Report
# تقرير مطابقة أعداد قاعدة البيانات

**Generated:** 2026-02-01T17:00:04Z  
**Database:** TiDB (MySQL-compatible)  
**Total Tables:** 243

---

## 1. SHOW TABLES Output / قائمة الجداول

```sql
-- Executed: 2026-02-01T17:00:04.455Z
SHOW TABLES;
-- Result: 243 tables total
```

**Critical Tables for Audit:**
| # | Table Name | Purpose |
|---|------------|---------|
| 1 | entities | Core entity registry (orgs, agencies, companies) |
| 2 | source_registry | Data source metadata (292 sources) |
| 3 | sources | Legacy source table |
| 4 | time_series | Time-indexed economic indicators |
| 5 | economic_events | Timeline events |
| 6 | documents | Document metadata |
| 7 | library_documents | Research library (empty) |
| 8 | raw_objects | Raw ingestion storage (empty) |
| 9 | entity_claims | Verified entity facts |
| 10 | gap_tickets | Data gap tracking |
| 11 | evidence_packs | Evidence bundles (empty) |
| 12 | commercial_banks | Bank profiles |
| 13 | research_publications | Academic/research papers |
| 14 | indicators | Indicator definitions |

---

## 2. SELECT COUNT(*) Results / نتائج العد

```sql
-- Executed: 2026-02-01T17:00:04.455Z
-- Single database: yeto_production (TiDB)
```

| Table | Count | Status | Notes |
|-------|-------|--------|-------|
| `entities` | **79** | ✅ Populated | Core entity registry |
| `source_registry` | **292** | ✅ Populated | Release gate verified |
| `sources` | **307** | ✅ Populated | Legacy + new sources |
| `time_series` | **6,699** | ✅ Populated | Economic indicators |
| `time_series_data` | **173** | ⚠️ Low | Secondary time data |
| `economic_events` | **237** | ✅ Populated | Timeline events |
| `documents` | **61** | ✅ Populated | Document metadata |
| `library_documents` | **0** | ❌ Empty | Not ingested yet |
| `raw_objects` | **0** | ❌ Empty | No raw storage used |
| `entity_claims` | **18** | ⚠️ Low | Only 5 entities have claims |
| `gap_tickets` | **0** | ❌ Empty | No gaps tracked |
| `data_gap_tickets` | **0** | ❌ Empty | Alternate gap table |
| `evidence_packs` | **0** | ❌ Empty | Evidence not populated |
| `evidence_store` | **0** | ❌ Empty | Evidence not populated |
| `commercial_banks` | **39** | ✅ Populated | Yemen bank profiles |
| `research_publications` | **370** | ✅ Populated | Research papers |
| `indicators` | **165** | ✅ Populated | Indicator definitions |
| `sector_codebook` | **16** | ✅ Populated | 16 sectors defined |
| `ingestion_runs` | **37** | ✅ Populated | Ingestion history |
| `scheduler_jobs` | **36** | ✅ Populated | Scheduled tasks |
| `users` | **6** | ✅ Populated | User accounts |
| `sector_alerts` | **0** | ❌ Empty | No alerts generated |
| `sector_briefs` | **0** | ❌ Empty | No briefs generated |

---

## 3. Table → UI Route Map / خريطة الجداول والمسارات

### Public Routes / المسارات العامة

| Route | Tables Read | Count Source |
|-------|-------------|--------------|
| `/` (Home) | `time_series`, `economic_events` | Dynamic |
| `/dashboard` | `time_series`, `indicators`, `sector_codebook` | Dynamic |
| `/entities` | `entities`, `entity_timeline`, `entity_links` | **79 entities** |
| `/entities/:id` | `entities`, `entity_claims`, `entity_links`, `entity_timeline` | Dynamic |
| `/sectors/*` | `time_series`, `indicators`, `sector_codebook` | Dynamic |
| `/timeline` | `economic_events` | **237 events** |
| `/research` | `research_publications` | **370 publications** |
| `/banking` | `commercial_banks`, `time_series` | **39 banks** |
| `/corporate-registry` | `entities` (filtered by type) | Subset of 79 |

### Admin Routes / مسارات الإدارة

| Route | Tables Read | Count Source |
|-------|-------------|--------------|
| `/admin/sources` | `source_registry` | **292 sources** |
| `/admin/bulk-classification` | `source_registry` | **292 sources** |
| `/admin/ingestion` | `ingestion_runs`, `scheduler_jobs` | **37 runs, 36 jobs** |
| `/admin/users` | `users` | **6 users** |

---

## 4. Count Contradiction Resolution / حل التناقضات

### Contradiction 1: "entities 79 vs 200+"

**Source of "200+" claim:** Previous todo.md entry stated "/entities shows 200+ entities"

**Resolution:**
- **Actual DB count:** `SELECT COUNT(*) FROM entities` = **79**
- **Cause:** The "200+" was an aspirational target or documentation error
- **Proof:** `/home/ubuntu/yeto-platform/docs/AUDIT_PACK/2026-02-01/proofs/critical_table_counts.txt`
- **Status:** ✅ RESOLVED - Actual count is 79

### Contradiction 2: "sources 292 vs 307"

**Resolution:**
- `source_registry` table: **292 rows** (curated, release-gate verified)
- `sources` table: **307 rows** (includes legacy/deprecated entries)
- **Cause:** Two tables serve different purposes
  - `source_registry` = production source metadata (used by release gate)
  - `sources` = legacy table with additional entries
- **Status:** ✅ RESOLVED - Both counts are correct for their respective tables

### Contradiction 3: "library_documents 0 vs documents 61"

**Resolution:**
- `library_documents`: **0 rows** (research library feature not populated)
- `documents`: **61 rows** (general document metadata)
- **Cause:** Different tables for different purposes
  - `library_documents` = research library UI (empty, needs ingestion)
  - `documents` = general document storage
- **Status:** ⚠️ P1 - `library_documents` should be populated from `research_publications`

---

## 5. Empty Tables Analysis / تحليل الجداول الفارغة

| Table | Expected State | Actual | Issue |
|-------|----------------|--------|-------|
| `library_documents` | Populated | Empty | P1: Needs migration from research_publications |
| `raw_objects` | Populated | Empty | P2: Raw storage not implemented |
| `entity_claims` | More data | 18 rows | P1: Only 5 entities have claims |
| `gap_tickets` | Populated | Empty | P2: Gap detection not running |
| `evidence_packs` | Populated | Empty | P1: Evidence system not wired |
| `sector_alerts` | Populated | Empty | P2: Alert generation not running |
| `sector_briefs` | Populated | Empty | P2: Brief generation not running |

---

## 6. P0 Issues Identified / مشاكل P0

| # | Issue | File Path | Impact |
|---|-------|-----------|--------|
| 1 | `evidence_packs` empty - Evidence Drawer shows no data | `server/routers/evidence.ts` | Trust/provenance broken |
| 2 | `entity_claims` only 18 rows for 5 entities | `server/routers/entities.ts` | Entity profiles incomplete |
| 3 | `library_documents` empty despite 370 research_publications | `server/routers/library.ts` | Research library broken |

---

## 7. SQL Proof Commands / أوامر SQL للإثبات

```sql
-- Run these to verify counts:

-- Entities
SELECT COUNT(*) as entity_count FROM entities;
-- Result: 79

-- Source Registry (release gate source)
SELECT COUNT(*) as source_count FROM source_registry;
-- Result: 292

-- Time Series
SELECT COUNT(*) as ts_count FROM time_series;
-- Result: 6699

-- Entity Claims
SELECT COUNT(*) as claims_count FROM entity_claims;
-- Result: 18

-- Evidence Packs
SELECT COUNT(*) as evidence_count FROM evidence_packs;
-- Result: 0

-- Research Publications
SELECT COUNT(*) as research_count FROM research_publications;
-- Result: 370
```

---

## 8. Verification Proof Files / ملفات الإثبات

- `/docs/AUDIT_PACK/2026-02-01/proofs/show_tables.txt` - Full table list
- `/docs/AUDIT_PACK/2026-02-01/proofs/critical_table_counts.txt` - Row counts
- `/docs/AUDIT_PACK/2026-02-01/proofs/release_gate_output.txt` - Release gate verification
- `/docs/AUDIT_PACK/2026-02-01/proofs/pnpm_test_output.txt` - Test results

---

**Report Generated:** 2026-02-01T17:00:04Z  
**Auditor:** Manus AI (Principal Architect)
