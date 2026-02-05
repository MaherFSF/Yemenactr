# Schema v2.5 Missing Columns Truth Table

This document provides a comprehensive analysis of the missing v2.5 governance-critical columns identified by the schema release gate (Gate 9).

## Gate 9 Failure Analysis

**Script:** `scripts/release-gate.mjs` (lines 109-117)
**Table:** `source_registry`
**Missing Columns:** 5 columns required for v2.5 governance compliance

---

## Missing Columns Analysis

### 1. sourceType

| Property | Value |
|----------|-------|
| **Table** | `source_registry` |
| **Column Name** | `sourceType` |
| **DB Type** | `ENUM('DATA', 'DOCUMENT', 'API', 'MEDIA', 'RESEARCH', 'OFFICIAL', 'OTHER')` |
| **ORM/TS Type** | `mysqlEnum("sourceType", ["DATA", "DOCUMENT", "API", "MEDIA", "RESEARCH", "OFFICIAL", "OTHER"])` |
| **Nullability** | `NULL` (nullable) |
| **Default** | `NULL` |
| **Justification** | Historical sources lack classification data; forcing a default would introduce inaccuracy |
| **Purpose** | **Governance & Classification** - Used by tier classifier to apply classification rules based on source type |
| **Code References** | |
| - File | `server/services/tierClassifier.ts` (lines 99-111) |
| - File | `server/routers/bulkClassification.ts` (lines 20, 33, 88, 107) |
| - File | `scripts/run-bulk-classification.mjs` (lines 78, 235) |
| **Backfill Policy** | **NO** - Leave NULL for historical records. Future ingestion should populate based on source analysis. |
| **Migration Risk** | Low - Nullable column, no existing data constraints |

---

### 2. licenseState

| Property | Value |
|----------|-------|
| **Table** | `source_registry` |
| **Column Name** | `licenseState` |
| **DB Type** | `ENUM('open', 'known', 'unknown', 'restricted', 'paywalled')` |
| **ORM/TS Type** | `mysqlEnum("licenseState", ["open", "known", "unknown", "restricted", "paywalled"])` |
| **Nullability** | `NULL` (nullable) |
| **Default** | `NULL` |
| **Justification** | License state is unknown for many historical sources; incorrect defaults would violate governance |
| **Purpose** | **Governance & Compliance** - Critical for tier classification (T4 = restricted/paywalled). Ensures proper licensing compliance and access control. |
| **Code References** | |
| - File | `server/services/tierClassifier.ts` (lines 90, 103, 112-119, 235-237) |
| - File | `server/routers/bulkClassification.ts` (lines 20, 34, 88, 108, 233-234, 256-259) |
| - File | `server/routers/bulkClassification.test.ts` (line 86) |
| - File | `scripts/run-bulk-classification.mjs` (lines 68, 79, 82-85, 235) |
| **Backfill Policy** | **PARTIAL** - Can infer from existing `license` column where data exists:<br>- `license` contains "CC-" or "Public Domain" → `open`<br>- `license` = "unknown" → `unknown`<br>- `apiKeyRequired` = true → `restricted`<br>- Otherwise → `NULL` |
| **Migration Risk** | Low - Nullable column with safe inference rules |

---

### 3. needsClassification

| Property | Value |
|----------|-------|
| **Table** | `source_registry` |
| **Column Name** | `needsClassification` |
| **DB Type** | `BOOLEAN` |
| **ORM/TS Type** | `boolean("needsClassification")` |
| **Nullability** | `NULL` (nullable) |
| **Default** | `NULL` |
| **Justification** | Flag state unknown for historical data; safer to leave NULL than incorrectly flag sources |
| **Purpose** | **Governance & Workflow** - Flags sources that need human review for tier classification. Used in admin workflows to prioritize classification work. |
| **Code References** | |
| - Context | Referenced implicitly in bulk classification workflows |
| - File | Related to `requiresHumanReview` column in `source_registry` (line 7468 in schema.ts) |
| **Backfill Policy** | **YES (Conditional)** - Can safely infer:<br>- `tier = 'UNKNOWN'` AND `tierClassificationSuggested IS NULL` → `TRUE`<br>- `tier != 'UNKNOWN'` AND `tier IS NOT NULL` → `FALSE`<br>- Otherwise → `NULL` |
| **Migration Risk** | Low - Nullable boolean with safe inference logic |

---

### 4. reliabilityScore

| Property | Value |
|----------|-------|
| **Table** | `source_registry` |
| **Column Name** | `reliabilityScore` |
| **DB Type** | `DECIMAL(5,2)` |
| **ORM/TS Type** | `decimal("reliabilityScore", { precision: 5, scale: 2 })` |
| **Nullability** | `NULL` (nullable) |
| **Default** | `NULL` |
| **Justification** | Reliability scores require calculation; cannot safely assign defaults to historical data without analysis |
| **Purpose** | **Governance & Quality Control** - Quantitative reliability metric (0-100 scale) used for:<br>- Ingestion dashboard quality monitoring<br>- Source prioritization<br>- Data quality gates<br>- Deployment blocking decisions |
| **Code References** | |
| - File | `client/src/pages/IngestionDashboard.tsx` (lines 27, 79, 306, 310) |
| - File | `server/services/reliabilityLab.ts` (lines 65, 299-307, 317, 321, 345, 380, 397, 405, 415, 422, 430) |
| - File | `server/routers/yeto.router.ts` (lines 45, 199, 207, 230) |
| - File | `server/routers/registry.router.ts` (lines 170, 203, 236, 258) |
| - File | `server/seed.mjs` (lines 36, 45, 54, 63, 72, 81, 90, 99) |
| - File | `server/api/registry.ts` (lines 135, 175, 214) |
| - File | `server/connectors/registry-loader.ts` (lines 35, 122) |
| - File | `server/connectors/universal-connector.ts` (lines 33, 484) |
| - File | `scripts/seed-master-registry.ts` (lines 91-95) |
| - File | `scripts/enhance-source-registry.ts` (lines 26, 60, 274, 323-326, 376) |
| **Backfill Policy** | **YES (Mapped from confidenceRating)** - Can infer from existing `confidenceRating`:<br>- `A` or `A+` → `95.00`<br>- `A-` → `90.00`<br>- `B+` → `85.00`<br>- `B` → `80.00`<br>- `B-` → `75.00`<br>- `C+` → `70.00`<br>- `C` → `65.00`<br>- `C-` → `60.00`<br>- `D` → `50.00`<br>- `tier = 'T0'` → `95.00` (official sources)<br>- `tier = 'T1'` → `85.00` (high credibility)<br>- `tier = 'T2'` → `75.00` (credible)<br>- `tier = 'T3'` → `60.00` (media)<br>- `tier = 'T4'` → `50.00` (unverified)<br>- Otherwise → `NULL` |
| **Migration Risk** | Medium - Widely used, requires careful backfill logic |

---

### 5. evidencePackFlag

| Property | Value |
|----------|-------|
| **Table** | `source_registry` |
| **Column Name** | `evidencePackFlag` |
| **DB Type** | `BOOLEAN` |
| **ORM/TS Type** | `boolean("evidencePackFlag")` |
| **Nullability** | `NULL` (nullable) |
| **Default** | `NULL` |
| **Justification** | Evidence pack availability is unknown for historical sources; NULL is safer than false negatives/positives |
| **Purpose** | **UI & Evidence Governance** - Indicates whether a source has an associated evidence pack (documentation bundle). Used in:<br>- Evidence button visibility logic<br>- Source registry import workflows<br>- Documentation completeness checks |
| **Code References** | |
| - File | `scripts/import-source-registry-v2.ts` (line 411) |
| **Backfill Policy** | **NO** - Leave NULL. Evidence packs require explicit verification; false flags would mislead users. |
| **Migration Risk** | Low - Limited usage, nullable boolean |

---

## Migration Safety Summary

| Column | Nullable | Has Default | Backfill | Risk Level |
|--------|----------|-------------|----------|------------|
| `sourceType` | ✅ Yes | ❌ No | ❌ No | 🟢 Low |
| `licenseState` | ✅ Yes | ❌ No | ⚠️ Partial | 🟢 Low |
| `needsClassification` | ✅ Yes | ❌ No | ⚠️ Conditional | 🟢 Low |
| `reliabilityScore` | ✅ Yes | ❌ No | ✅ Yes | 🟡 Medium |
| `evidencePackFlag` | ✅ Yes | ❌ No | ❌ No | 🟢 Low |

**Overall Risk Assessment:** 🟢 **LOW** - All columns are nullable with no mandatory defaults, ensuring backward compatibility.

---

## Backfill Script Requirements

If implementing backfill (optional, can be done post-migration):

1. **Phase 1:** Add columns (this migration) - No backfill, all NULL
2. **Phase 2:** Optional backfill script (`scripts/backfill-v2.5-columns.ts`):
   - Map `confidenceRating` → `reliabilityScore`
   - Map `tier` → `reliabilityScore` (fallback)
   - Infer `licenseState` from `license` and `apiKeyRequired`
   - Calculate `needsClassification` from `tier` and classification status
   - Leave `sourceType` and `evidencePackFlag` as NULL

---

## Code Update Requirements

### Files Requiring NULL-Safe Handling

1. **server/services/tierClassifier.ts**
   - Already handles optional `sourceType` and `licenseState`
   - Uses `|| ''` fallback pattern (lines 111-112)

2. **server/routers/bulkClassification.ts**
   - Already uses optional typing for these fields
   - Safe SELECT queries include these fields

3. **client/src/pages/IngestionDashboard.tsx**
   - Must handle NULL `reliabilityScore`
   - Should display "N/A" or default to 0 for display

### Files Requiring Updates

No breaking changes expected - all existing code already treats these fields as optional or uses fallback values.

---

## Rollback Considerations

**Rollback Strategy:** Drop columns in reverse order

```sql
ALTER TABLE `source_registry` DROP COLUMN `evidencePackFlag`;
ALTER TABLE `source_registry` DROP COLUMN `reliabilityScore`;
ALTER TABLE `source_registry` DROP COLUMN `needsClassification`;
ALTER TABLE `source_registry` DROP COLUMN `licenseState`;
ALTER TABLE `source_registry` DROP COLUMN `sourceType`;
```

**Risk:** 🟢 **SAFE** - No existing data to lose, all columns are additive.

---

## Compliance Verification

After migration, verify:

1. ✅ All 5 columns present in `source_registry`
2. ✅ All columns are nullable
3. ✅ No NOT NULL constraints on new columns
4. ✅ No defaults that could introduce data integrity issues
5. ✅ Gate 9 passes in `scripts/release-gate.mjs`
6. ✅ TypeScript types updated in `drizzle/schema.ts`
7. ✅ No TypeScript compilation errors
8. ✅ All tests pass

---

*Document Version: 1.0*  
*Created: 2026-02-05*  
*Schema Target: v2.5*  
*Governance Level: CRITICAL*
