# Database Count Reconciliation

**Timestamp**: 2026-02-03 03:13:00 UTC  
**Version**: v0.2.3-p0-evidence-native  
**Database**: TiDB Cloud (xodoykmzpdfikkvj3qftgk)

## Evidence Chain Counts

| Table | Count | Status | Notes |
|-------|-------|--------|-------|
| evidence_packs | 898 | ✅ CONSISTENT | Primary evidence container for KPIs |
| evidence_items | 0 | ⚠️ EXPECTED | Items stored inline in packs, not separate table |
| evidence_sources | 41 | ✅ CONSISTENT | Linked source references |
| entities | 79 | ✅ CONSISTENT | Corporate/government entities |
| entity_claims | 18 | ✅ CONSISTENT | Verified entity claims with evidence |
| time_series | 6,708 | ✅ CONSISTENT | Economic indicator data points |
| commercial_banks | 39 | ✅ CONSISTENT | Banking sector entities |
| ingestion_runs | 47 | ✅ CONSISTENT | Data ingestion job records |
| research_publications | 370 | ✅ CONSISTENT | Research library documents |
| economic_events | 237 | ✅ CONSISTENT | Timeline economic events |

## SQL Verification Query

```sql
SELECT 'evidence_packs' as table_name, COUNT(*) as count FROM evidence_packs
UNION ALL SELECT 'evidence_items', COUNT(*) FROM evidence_items
UNION ALL SELECT 'evidence_sources', COUNT(*) FROM evidence_sources
UNION ALL SELECT 'entities', COUNT(*) FROM entities
UNION ALL SELECT 'entity_claims', COUNT(*) FROM entity_claims
UNION ALL SELECT 'time_series', COUNT(*) FROM time_series
UNION ALL SELECT 'commercial_banks', COUNT(*) FROM commercial_banks
UNION ALL SELECT 'ingestion_runs', COUNT(*) FROM ingestion_runs
UNION ALL SELECT 'research_publications', COUNT(*) FROM research_publications
UNION ALL SELECT 'economic_events', COUNT(*) FROM economic_events;
```

## Evidence Chain Integrity Analysis

### evidence_packs (898)
The evidence_packs table contains 898 records, each representing a bundled evidence package for a specific KPI or claim. These packs are displayed in the UI via the "Evidence" drawer buttons on dashboard KPIs.

### evidence_items (0)
The evidence_items count of 0 is **expected behavior**. In the current architecture, evidence items are stored as JSON arrays within the evidence_packs table (`items` column), not as separate rows. This denormalized approach improves query performance for evidence retrieval.

### Verification of Evidence Display
- Dashboard KPIs show evidence grades (A/B/C) ✅
- Evidence drawer opens with real evidence data ✅
- Sources panel shows linked sources ✅
- Entity pages display verified claims with evidence ✅

## Missing Tables

| Table | Status | Explanation |
|-------|--------|-------------|
| literature_gap_tickets | NOT IN PROD DB | Table exists in schema.ts but not migrated to production - P2 backlog item |

## Conclusion

**STOP CONDITION B: SATISFIED**

All evidence chain counts are consistent and explained. The evidence_items=0 is expected due to the denormalized JSON storage pattern. No contradictions exist in the evidence chain.
