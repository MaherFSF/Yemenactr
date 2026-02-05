# YETO Schema v2.5 - Governance Columns

**Version:** 2.5  
**Status:** Active  
**Migration:** `0028_add_v2_5_governance_columns.sql`  
**Release Gate:** Gate 9 (v2.5 Schema Check)

---

## Overview

Schema v2.5 introduces five governance-critical columns to the `source_registry` table, enhancing data quality, licensing compliance, and tier classification capabilities. These columns are essential for:

- Automated tier classification workflows
- License state compliance tracking
- Source reliability scoring
- Evidence pack documentation management
- Classification workflow prioritization

---

## Changes Summary

### Table: `source_registry`

| Column | Type | Nullable | Purpose |
|--------|------|----------|---------|
| `sourceType` | ENUM | Yes | Source classification (DATA, DOCUMENT, API, etc.) |
| `licenseState` | ENUM | Yes | License compliance state tracking |
| `needsClassification` | BOOLEAN | Yes | Flag for classification workflow |
| `reliabilityScore` | DECIMAL(5,2) | Yes | Quantitative reliability metric (0-100) |
| `evidencePackFlag` | BOOLEAN | Yes | Evidence pack availability indicator |

---

## Column Specifications

### 1. sourceType

**Type:** `ENUM('DATA','DOCUMENT','API','MEDIA','RESEARCH','OFFICIAL','OTHER')`  
**Nullable:** Yes  
**Default:** NULL  
**Index:** Yes (`source_registry_source_type_idx`)

**Purpose:**  
Classifies sources by type for tier classification rules. Used by the bulk classification system to apply appropriate credibility assessments.

**Values:**
- `DATA` - Structured datasets (APIs, databases)
- `DOCUMENT` - Document repositories (PDFs, reports)
- `API` - API endpoints
- `MEDIA` - News and media sources
- `RESEARCH` - Research institutions and publications
- `OFFICIAL` - Official government/institutional sources
- `OTHER` - Uncategorized sources

**Usage:**
- Tier classifier applies type-specific rules
- Bulk classification workflows use this for filtering
- Admin interfaces for source categorization

---

### 2. licenseState

**Type:** `ENUM('open','known','unknown','restricted','paywalled')`  
**Nullable:** Yes  
**Default:** NULL  
**Index:** Yes (`source_registry_license_state_idx`)

**Purpose:**  
Tracks license compliance state for governance and legal compliance. Critical for determining T4 (restricted) tier classification.

**Values:**
- `open` - Open license (CC-BY, Public Domain, etc.)
- `known` - License known but not fully open
- `unknown` - License state not determined
- `restricted` - Requires special access permissions
- `paywalled` - Subscription or payment required

**Usage:**
- Automatic T4 tier assignment for restricted sources
- Legal compliance tracking
- Access control decisions
- Partner relationship requirements

**Compliance Note:**  
Sources with `licenseState = 'restricted'` or `'paywalled'` are automatically flagged for partnership or access key requirements.

---

### 3. needsClassification

**Type:** `BOOLEAN`  
**Nullable:** Yes  
**Default:** NULL  
**Index:** No

**Purpose:**  
Workflow flag indicating a source requires human review for tier classification. Used in admin dashboards to prioritize classification work.

**Logic:**
- `TRUE` - Source needs classification review
- `FALSE` - Source classification is complete
- `NULL` - Classification state unknown

**Inference Rules:**
- Set `TRUE` when `tier = 'UNKNOWN'` AND no AI classification exists
- Set `FALSE` when tier is assigned and validated
- Leave `NULL` for legacy data where state is unknown

**Usage:**
- Admin classification queue filtering
- Bulk classification prioritization
- Workflow automation triggers

---

### 4. reliabilityScore

**Type:** `DECIMAL(5,2)`  
**Nullable:** Yes  
**Default:** NULL  
**Range:** 0.00 to 100.00  
**Index:** Yes (`source_registry_reliability_score_idx`)

**Purpose:**  
Quantitative reliability metric for source quality assessment. Used for data quality gates, deployment decisions, and dashboard visualizations.

**Scoring Guidelines:**
- **90-100**: T0/T1 official sources (IMF, World Bank, CBY)
- **70-89**: T2 credible sources (research institutions)
- **50-69**: T3 media sources with verification
- **0-49**: T4 unverified or low-quality sources

**Calculation Factors:**
- Historical accuracy
- Update frequency reliability
- Data quality checks passed
- Citation coverage
- Contradiction resolution rate

**Usage:**
- Ingestion dashboard quality monitoring
- Deployment blocking decisions (reliability lab)
- Source prioritization algorithms
- Admin filtering and sorting

**Backfill Mapping:**
```sql
-- From confidenceRating
A/A+ → 95.00
A-   → 90.00
B+   → 85.00
B    → 80.00
B-   → 75.00
C+   → 70.00
C    → 65.00
C-   → 60.00
D    → 50.00

-- From tier (fallback)
T0 → 95.00
T1 → 85.00
T2 → 75.00
T3 → 60.00
T4 → 50.00
```

---

### 5. evidencePackFlag

**Type:** `BOOLEAN`  
**Nullable:** Yes  
**Default:** NULL  
**Index:** No

**Purpose:**  
Indicates whether a source has an associated evidence pack (documentation bundle with methodology, samples, and validation materials).

**Logic:**
- `TRUE` - Evidence pack available
- `FALSE` - No evidence pack
- `NULL` - Evidence pack status unknown

**Usage:**
- Evidence drawer button visibility
- Source registry import workflows
- Documentation completeness tracking
- Partner onboarding checklists

**Note:**  
Evidence packs are curated documentation bundles. NULL is safer than false positives to avoid misleading users about documentation availability.

---

## Migration Safety

### Backward Compatibility

✅ **SAFE** - All columns are nullable with no defaults
- No existing data is affected
- No NOT NULL constraints
- No mandatory defaults that could introduce data integrity issues
- Existing queries continue to work unchanged

### Forward Compatibility

✅ **FORWARD-COMPATIBLE** - New columns integrate seamlessly
- Existing code handles optional fields via type system
- Tier classifier already uses optional typing
- NULL checks in place where fields are referenced

### Rollback Strategy

If rollback is required:

```sql
ALTER TABLE `source_registry` DROP COLUMN `evidencePackFlag`;
ALTER TABLE `source_registry` DROP COLUMN `reliabilityScore`;
ALTER TABLE `source_registry` DROP COLUMN `needsClassification`;
ALTER TABLE `source_registry` DROP COLUMN `licenseState`;
ALTER TABLE `source_registry` DROP COLUMN `sourceType`;

DROP INDEX `source_registry_source_type_idx` ON `source_registry`;
DROP INDEX `source_registry_license_state_idx` ON `source_registry`;
DROP INDEX `source_registry_reliability_score_idx` ON `source_registry`;
```

**Rollback Risk:** 🟢 **ZERO** - No data to lose, columns added are empty.

---

## Code Integration

### Files Updated

1. **Schema Definition:**
   - `drizzle/schema.ts` - Added column definitions to `sourceRegistry` table

2. **Migration Files:**
   - `drizzle/0028_add_v2_5_governance_columns.sql` - Migration SQL
   - `drizzle/meta/_journal.json` - Migration registry

3. **Release Gate:**
   - `scripts/release-gate.mjs` - Enhanced error messages with migration instructions

### Files Already Compatible

These files already handle the new columns as optional fields:
- `server/services/tierClassifier.ts`
- `server/routers/bulkClassification.ts`
- `server/routers/bulkClassification.test.ts`
- `scripts/run-bulk-classification.mjs`
- `client/src/pages/IngestionDashboard.tsx` (with NULL handling)

---

## Testing

### Schema Verification

Run release gate to verify schema:
```bash
node scripts/release-gate.mjs
```

Expected output:
```
🔍 Gate 9: v2.5 Schema Columns
   ✅ v2.5 columns: All present
```

### TypeScript Verification

```bash
pnpm typecheck
```

All type definitions should pass without errors.

### Integration Tests

```bash
pnpm test
```

Existing tests should pass; new columns are nullable and transparent to existing logic.

---

## Future Enhancements

### Optional Backfill (Phase 2)

A backfill script can be created to populate historical data:

1. **reliabilityScore** - Map from `confidenceRating` and `tier`
2. **licenseState** - Infer from `license` and `apiKeyRequired`
3. **needsClassification** - Calculate from `tier` and classification state
4. **sourceType** - Require manual classification or NLP analysis
5. **evidencePackFlag** - Require manual verification

Script location: `scripts/backfill-v2.5-columns.ts` (not included in this migration)

---

## Governance Compliance

This migration satisfies:

- ✅ **Hard Rule 2** - No data fabrication (all NULL where unknown)
- ✅ **Hard Rule 3** - Forward-compatible schema evolution
- ✅ **Hard Rule 4** - Audit trail preserved (migration logged)
- ✅ **Release Gate 2** - Schema version compliance
- ✅ **BLOCKER 1** - v2.5 governance columns present

---

## Support

**Documentation:**
- Truth Table: `docs/SCHEMA_V2_5_TRUTH_TABLE.md`
- Migration Runbook: `docs/MIGRATION_RUNBOOK.md`
- Release Gates: `docs/RELEASE_GATES.md`

**Questions:**
- Technical Lead: See `docs/ARCHITECTURE.md`
- Data Governance: See `docs/DATA_GOVERNANCE.md`

---

*Schema v2.5 implemented: 2026-02-05*  
*Next schema version: TBD*  
*Migration status: ✅ Complete*
