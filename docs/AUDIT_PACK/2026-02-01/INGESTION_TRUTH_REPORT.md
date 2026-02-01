# Ingestion Truth Report
# تقرير حقيقة الاستيعاب

**Generated:** 2026-02-01T17:02:00Z  
**Total Connectors:** 26 files in `/server/connectors/`  
**Ingestion Runs:** 37 total (all status: running, 0 records)

---

## 1. Connector Inventory / قائمة الموصلات

### Time-Series Connectors / موصلات السلاسل الزمنية

| Connector | File | Cadence | Last Success | Backfill Coverage |
|-----------|------|---------|--------------|-------------------|
| World Bank | `worldBankConnector.ts` | Daily | Never | 2010-2026 (target) |
| IMF | `imfConnector.ts` | Daily | Never | 2010-2026 (target) |
| CBY (Central Bank) | `cbyConnector.ts` | Daily | Never | 2015-2026 (target) |
| FAO | `faoConnector.ts` | Weekly | Never | 2010-2026 (target) |
| ACLED | `acledConnector.ts` | Daily | Never | 2015-2026 (target) |

### Document Connectors / موصلات الوثائق

| Connector | File | Cadence | Last Success | Output Tables |
|-----------|------|---------|--------------|---------------|
| ReliefWeb | `reliefWebConnector.ts` | Daily | Never | documents, research_publications |
| Banking Docs | `bankingDocuments.ts` | Weekly | Never | documents |
| Research | `researchConnectors.ts` | Weekly | Never | research_publications |

### Humanitarian Connectors / موصلات إنسانية

| Connector | File | Cadence | Last Success | Output Tables |
|-----------|------|---------|--------------|---------------|
| OCHA FTS | `ochaFtsConnector.ts` | Daily | Never | time_series |
| WFP | `wfpConnector.ts` | Daily | Never | time_series |
| UNHCR | `unhcrConnector.ts` | Weekly | Never | time_series |
| UNICEF | `unicefConnector.ts` | Weekly | Never | time_series |
| WHO | `whoConnector.ts` | Weekly | Never | time_series |
| UNDP | `undpConnector.ts` | Weekly | Never | time_series |
| IOM DTM | `iomDtmConnector.ts` | Weekly | Never | time_series |
| IATI | `iatiConnector.ts` | Weekly | Never | time_series |
| HDX CKAN | `hdxCkanConnector.ts` | Weekly | Never | time_series |
| FEWS NET | `fewsNetConnector.ts` | Weekly | Never | time_series |

### Compliance Connectors / موصلات الامتثال

| Connector | File | Cadence | Last Success | Output Tables |
|-----------|------|---------|--------------|---------------|
| Sanctions | `sanctionsConnector.ts` | Daily | Never | sanctions_entries |

---

## 2. Ingestion Run Analysis / تحليل عمليات الاستيعاب

### Database Evidence
```sql
SELECT status, COUNT(*) FROM ingestion_runs GROUP BY status;
-- Result: running: 37 (all stuck)
```

### Last 10 Runs (from DB)
| ID | Connector | Status | Records | Started |
|----|-----------|--------|---------|---------|
| 37 | SOURCE_2 | running | 0 | 2026-01-28 |
| 36 | SOURCE_1 | running | 0 | 2026-01-28 |
| 35 | SOURCE_2 | running | 0 | 2026-01-28 |
| 34 | SOURCE_1 | running | 0 | 2026-01-28 |
| 33 | SOURCE_1 | running | 0 | 2026-01-28 |
| 32 | SOURCE_1 | running | 0 | 2026-01-28 |
| 31 | MOCK_SOURCE | running | 0 | 2026-01-28 |
| 30 | MOCK_SOURCE | running | 0 | 2026-01-28 |
| 29 | SOURCE_2 | running | 0 | 2026-01-28 |
| 28 | SOURCE_1 | running | 0 | 2026-01-28 |

**Issue:** All runs are stuck in "running" status with 0 records processed.

---

## 3. Connector Test Results / نتائج اختبار الموصلات

From `pnpm test --run server/connectors`:
```
✓ server/connectors/connectors.test.ts (26 tests) 
  ✓ Connector Tests > World Bank Connector > should have valid configuration
  ✓ Connector Tests > IMF Connector > should have valid configuration
  ✓ Connector Tests > OCHA FTS Connector > should have valid configuration
  ... (26/26 passed)
```

**Proof:** `/docs/AUDIT_PACK/2026-02-01/proofs/pnpm_test_output.txt`

---

## 4. Backfill Coverage Analysis / تحليل تغطية الملء الخلفي

### Target Coverage: 2010-2026

| Data Domain | Current Coverage | Gap |
|-------------|------------------|-----|
| GDP/Macro | 6,699 time_series rows | Unknown years |
| FX Rates | Present | Unknown completeness |
| Humanitarian | Present | Unknown completeness |
| Banking | 39 banks profiled | Metrics incomplete |
| Research | 370 publications | Good coverage |

### Coverage Verification Needed
- [ ] Verify year range in time_series
- [ ] Verify indicator completeness per sector
- [ ] Verify document date coverage

---

## 5. Pipeline Status Summary / ملخص حالة خط الأنابيب

| Component | Status | Issue |
|-----------|--------|-------|
| Connector Code | ✅ Present | 26 connectors exist |
| Connector Tests | ✅ Passing | 26/26 tests pass |
| Scheduler Jobs | ✅ Configured | 36 jobs in DB |
| Ingestion Runs | ❌ Broken | All stuck at "running" |
| Data Output | ⚠️ Partial | time_series has data, but unclear source |
| Evidence Linking | ❌ Broken | evidence_packs empty |

---

## 6. P0 Ingestion Issues / مشاكل P0 في الاستيعاب

| # | Issue | Impact | File Path |
|---|-------|--------|-----------|
| 1 | All ingestion runs stuck at "running" | No new data ingested | `server/connectors/IngestionOrchestrator.ts` |
| 2 | No evidence_packs created | Provenance broken | `server/connectors/BaseConnector.ts` |
| 3 | Scheduler jobs not completing | Automation broken | `server/services/scheduler.ts` |

---

## 7. Recommendations / التوصيات

1. **P0:** Fix ingestion run completion - runs never transition to "success"
2. **P0:** Wire evidence_pack creation in BaseConnector
3. **P1:** Verify time_series data source and completeness
4. **P1:** Run manual backfill for 2010-2025 data
5. **P2:** Add ingestion monitoring dashboard

---

**Report Generated:** 2026-02-01T17:02:00Z  
**Auditor:** Manus AI (Data Engineering Lead)
