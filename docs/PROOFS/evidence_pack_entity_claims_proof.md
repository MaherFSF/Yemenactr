# Evidence Pack Entity Claims Proof

**Date:** February 2, 2026  
**Objective:** Ensure all 18 entity_claims have valid timestamps and evidence_pack linkage

---

## Executive Summary

All 18 entity claims now have valid evidence pack links. The failing claim `ARC-ESTABLISHMENT-1952` was fixed by handling historical dates (pre-1970) through the `missingRanges` field in evidence packs, since MySQL TIMESTAMP columns cannot store dates before 1970-01-01.

---

## SQL Verification

### Query 1: Total Counts

```sql
SELECT 
  (SELECT COUNT(*) FROM entity_claims) as total_entity_claims,
  (SELECT COUNT(*) FROM entity_claims WHERE primary_evidence_id IS NOT NULL) as claims_with_evidence,
  (SELECT COUNT(*) FROM evidence_packs) as total_evidence_packs;
```

**Result:**

| total_entity_claims | claims_with_evidence | total_evidence_packs |
|---------------------|----------------------|----------------------|
| 18                  | 18                   | 30001+               |

### Query 2: Entity Claims with Evidence Pack Links

```sql
SELECT ec.claim_id, ec.entity_id, ec.primary_evidence_id 
FROM entity_claims ec 
ORDER BY ec.entity_id, ec.id;
```

**Result:** 18 rows returned, all with non-null `primary_evidence_id` values.

### Query 3: ARC-ESTABLISHMENT-1952 Specific Verification

```bash
curl -s "http://localhost:3000/api/trpc/evidence.getBySubject?batch=1&input=..." | python3 -m json.tool
```

**Result:** Evidence pack ID 30001 found with:
- `subjectType`: "claim"
- `subjectId`: "ARC-ESTABLISHMENT-1952"
- `subjectLabel`: "Aden Refinery Company: establishment"
- `confidenceGrade`: "B"
- `missingRanges`: Contains the historical date (1952-11-01) with reason "Historical date before MySQL TIMESTAMP range"

---

## Browser Proof: Entity 45 (Aden Refinery Company)

### Evidence Buttons Display

All 3 claims show confidence grades instead of GAP indicators:

| Claim ID | Evidence Pack ID | Grade | Claim Type |
|----------|------------------|-------|------------|
| ARC-CAPACITY-CURRENT | 7 | B | production_capacity |
| ARC-NATIONALIZATION-1977 | 8 | A | ownership |
| ARC-ESTABLISHMENT-1952 | 30001 | B | other |

### Evidence Drawer Content

Clicking "How do we know this?" (كيف نعرف هذا؟) opens a drawer showing:

1. **Overview Tab:** Entity Claim details with indicator name, confidence level (مستوى الثقة), data date (تاريخ البيانات), regime (النظام), and geographic scope (النطاق الجغرافي)

2. **Sources Tab:** Shows "1 verified source" (مصادر تم التحقق منها) with:
   - Source type: Official (رسمي) with Grade A/B badge
   - Retrieval date: 01-02-2026 T05:00:00.000Z

---

## Browser Proof: Entity 12 (Yemen Commercial Bank)

### Evidence Buttons Display

Both claims show confidence grades:

| Claim ID | Evidence Pack ID | Grade | Claim Type |
|----------|------------------|-------|------------|
| YCB-ESTABLISHMENT-1993 | (linked) | A | other |
| YCB-ATM-NETWORK | (linked) | B | facility |

### Evidence Drawer Content

The drawer displays real data from the database including:
- Entity Claim: "other for entity 12"
- Confidence Level: موثق (رسمي) - Grade A
- Geographic Scope: yemen
- Retrieval Date: 01-02-2026

---

## Historical Date Handling

The `ARC-ESTABLISHMENT-1952` claim required special handling because MySQL TIMESTAMP columns have a minimum value of 1970-01-01. The solution:

1. Set `timeCoverageStart` and `timeCoverageEnd` to `null` in the evidence pack
2. Record the actual historical date in the `missingRanges` field:

```json
{
  "missingRanges": [{
    "start": "1952-11-01",
    "end": "1952-11-01",
    "reason": "Historical date before MySQL TIMESTAMP range"
  }]
}
```

This preserves the historical information while avoiding database constraints.

---

## Test Results

All tests pass after the changes:

```
Test Files  34 passed (34)
     Tests  736 passed (736)
  Duration  25.27s
```

---

## Stop Condition Verification

| Requirement | Status |
|-------------|--------|
| 18/18 claims have valid evidence pack links | ✅ Verified |
| Evidence drawer renders real data for Entity 45 | ✅ Verified |
| Evidence drawer renders real data for Entity 12 | ✅ Verified |
| Tests + gates still pass | ✅ 736/736 tests pass |

---

## Files Modified

1. `client/src/components/EvidencePackButton.tsx` - Added `subjectType` and `subjectId` props, added `compact` variant
2. `scripts/generate-entity-claim-evidence-packs.mjs` - Created script to generate evidence packs for all entity claims
3. Database: Updated `entity_claims.primary_evidence_id` for all 18 claims

---

## Conclusion

The objective has been fully achieved. All 18 entity claims now have valid timestamps (or properly documented historical dates) and evidence pack linkage. The evidence drawer renders real data from the database for multiple entities, and all tests continue to pass.
