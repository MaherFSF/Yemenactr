# Database Truth Report
# تقرير حقيقة قاعدة البيانات

**Generated:** 2026-02-01T17:00:04Z  
**Database:** TiDB (MySQL-compatible)  
**Connection:** Verified via `mysql2/promise`

---

## 1. Critical Table Existence / وجود الجداول الحرجة

| Table | Exists | Row Count | Should Be Empty? | Status |
|-------|--------|-----------|------------------|--------|
| `entities` | ✅ Yes | 79 | No | ✅ OK |
| `source_registry` | ✅ Yes | 292 | No | ✅ OK |
| `sources` | ✅ Yes | 307 | No | ✅ OK |
| `time_series` | ✅ Yes | 6,699 | No | ✅ OK |
| `time_series_data` | ✅ Yes | 173 | No | ⚠️ Low |
| `economic_events` | ✅ Yes | 237 | No | ✅ OK |
| `documents` | ✅ Yes | 61 | No | ✅ OK |
| `library_documents` | ✅ Yes | 0 | No | ❌ BROKEN |
| `raw_objects` | ✅ Yes | 0 | Yes (optional) | ⚠️ Expected |
| `entity_claims` | ✅ Yes | 18 | No | ⚠️ Low |
| `gap_tickets` | ✅ Yes | 0 | No | ❌ BROKEN |
| `data_gap_tickets` | ✅ Yes | 0 | No | ❌ BROKEN |
| `evidence_packs` | ✅ Yes | 0 | No | ❌ BROKEN |
| `evidence_store` | ✅ Yes | 0 | No | ❌ BROKEN |
| `commercial_banks` | ✅ Yes | 39 | No | ✅ OK |
| `research_publications` | ✅ Yes | 370 | No | ✅ OK |
| `indicators` | ✅ Yes | 165 | No | ✅ OK |
| `sector_codebook` | ✅ Yes | 16 | No | ✅ OK |
| `ingestion_runs` | ✅ Yes | 37 | No | ✅ OK |
| `scheduler_jobs` | ✅ Yes | 36 | No | ✅ OK |
| `users` | ✅ Yes | 6 | No | ✅ OK |
| `sector_alerts` | ✅ Yes | 0 | No | ❌ BROKEN |
| `sector_briefs` | ✅ Yes | 0 | No | ❌ BROKEN |

**Total Tables:** 243  
**Critical Tables Checked:** 23  
**Broken (empty when shouldn't be):** 7

---

## 2. Empty Table Analysis / تحليل الجداول الفارغة

### Expected Empty (Not Ingested Yet)
| Table | Reason | Priority |
|-------|--------|----------|
| `raw_objects` | Raw storage feature not implemented | P3 |

### Broken Pipeline (Should Have Data)
| Table | Expected Source | Issue | Priority |
|-------|-----------------|-------|----------|
| `library_documents` | research_publications migration | Migration not run | P1 |
| `evidence_packs` | Ingestion pipeline | Evidence system not wired | P0 |
| `evidence_store` | Ingestion pipeline | Evidence system not wired | P0 |
| `gap_tickets` | Gap detection agent | Agent not running | P1 |
| `data_gap_tickets` | Gap detection agent | Agent not running | P1 |
| `sector_alerts` | Sector agents | Agents not generating alerts | P2 |
| `sector_briefs` | Sector agents | Agents not generating briefs | P2 |

**Proof:** See `/docs/AUDIT_PACK/2026-02-01/proofs/critical_table_counts.txt`

---

## 3. Schema Drift Map / خريطة انحراف المخطط

Based on TypeScript errors (130 total), the following schema drift exists:

### time_series Table
| TypeScript Expects | DB Has | Impact |
|--------------------|--------|--------|
| `indicatorId` | `indicatorCode` | ❌ Query failures |
| `year` | Not present | ❌ Query failures |
| `month` | Not present | ❌ Query failures |
| `isProxied` | Not present | ❌ Query failures |
| `confidence` | `confidenceRating` | ❌ Query failures |
| `evidencePackId` | Not present | ❌ Evidence linking broken |

### sources Table
| TypeScript Expects | DB Has | Impact |
|--------------------|--------|--------|
| `tier` | Not present | ⚠️ Tier filtering broken |
| `lastChecked` | Not present | ⚠️ Freshness checks broken |

### sector_agent_runs Table
| TypeScript Expects | DB Has | Impact |
|--------------------|--------|--------|
| `sectorCode` | Not present | ❌ Agent run logging broken |

**Proof:** See `/docs/AUDIT_PACK/2026-02-01/proofs/TYPECHECK_ERRORS.txt`

---

## 4. Data Integrity Checks / فحوصات سلامة البيانات

### Entities Table
```sql
SELECT COUNT(*) FROM entities WHERE name IS NULL;
-- Result: 0 (✅ No null names)

SELECT COUNT(DISTINCT entityType) FROM entities;
-- Result: Multiple types present (✅ OK)
```

### Source Registry
```sql
SELECT COUNT(*) FROM source_registry WHERE sourceId IS NULL;
-- Result: 0 (✅ No null IDs)

SELECT COUNT(*) FROM source_registry WHERE status = 'ACTIVE';
-- Result: 234 (✅ Release gate verified)
```

### Time Series
```sql
SELECT COUNT(DISTINCT indicatorCode) FROM time_series;
-- Result: Multiple indicators (✅ OK)

SELECT MIN(date), MAX(date) FROM time_series;
-- Result: Date range present (✅ OK)
```

---

## 5. P0 Database Issues / مشاكل P0 في قاعدة البيانات

| # | Issue | Table | Impact | File Path |
|---|-------|-------|--------|-----------|
| 1 | evidence_packs empty | `evidence_packs` | Evidence Drawer shows no data | `server/routers/evidence.ts` |
| 2 | Schema drift: time_series | `time_series` | 130 TypeScript errors | `drizzle/schema.ts` |
| 3 | gap_tickets empty | `gap_tickets` | GAP system non-functional | `server/services/gapDetection.ts` |
| 4 | library_documents empty | `library_documents` | Research library broken | `server/routers/library.ts` |

---

## 6. Recommendations / التوصيات

1. **P0: Fix schema drift** - Update `drizzle/schema.ts` to match actual DB columns or migrate DB
2. **P0: Populate evidence_packs** - Wire ingestion to create evidence records
3. **P1: Migrate library_documents** - Copy data from `research_publications`
4. **P1: Enable gap detection** - Start gap detection agent
5. **P2: Enable sector agents** - Start alert/brief generation

---

**Report Generated:** 2026-02-01T17:00:04Z  
**Auditor:** Manus AI (Principal Architect)
