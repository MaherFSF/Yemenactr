# Source Registry File Location - Canonical Reference

## Primary Source Registry File

**Canonical Location:** `data/source_registry/YETO_Sources_Universe_Master_PRODUCTION_READY_v2_3.xlsx`

**Version:** v2.3 (latest)  
**Previous versions:** v2.0 (deprecated), v2.5 (rolled back to v2.3)

---

## File Usage Across Repository

### 1. Import Scripts (Read from this file)

All import scripts now reference the canonical v2.3 file:

- **`scripts/import-registry-v2.3.ts`** (Primary importer)
  - Path: `../data/source_registry/YETO_Sources_Universe_Master_PRODUCTION_READY_v2_3.xlsx`
  - Imports: SECTOR_CODEBOOK_16, SOURCES_MASTER_EXT, SOURCE_SECTOR_MATRIX_292, SOURCE_ENDPOINTS, SOURCE_PRODUCTS
  - Includes P0/P1 LINT validation

- **`scripts/import-source-registry-v2.ts`** (Production safe importer)
  - Path: `./data/source_registry/YETO_Sources_Universe_Master_PRODUCTION_READY_v2_3.xlsx`
  - Full upsert logic with field mappings

- **`scripts/import-source-registry.ts`** (Standard importer)
  - Path: `./data/source_registry/YETO_Sources_Universe_Master_PRODUCTION_READY_v2_3.xlsx`
  - Imports 292 sources into source_registry table

### 2. Server Components (Reference this data)

- **`server/routers/sourceRegistry.ts`**
  - Reads from `source_registry` table (populated from v2.3 Excel file)
  - Canonical API for source metadata

- **`server/services/sourceRegistryImport.ts`**
  - Service layer for registry operations

- **`server/pipeline/sourceRegistry.ts`**
  - Pipeline integration for source data

### 3. Database Schema

- **`drizzle/schema.ts`**
  - Line 7706: Comments reference v2.3 as source of truth
  - Defines `source_registry` table structure matching Excel schema

### 4. Documentation

- **`docs/CURSOR_MASTER_EXECUTION_CONTRACT_YEMENACTR.md`**
  - Documents v2.3 as key asset

- **`.cursor/commands/source-registry-import.md`**
  - Import command references canonical path

- **`data/source_registry/README.md`**
  - Explains usage and minimum required fields

### 5. Admin UI

- **`client/src/pages/admin/SourceRegistry.tsx`**
  - Admin interface to view/manage sources from registry

---

## File Contents

The v2.3 Excel file contains the following sheets:

1. **SECTOR_CODEBOOK_16** - 16 economic sectors (S01-S16)
2. **SOURCES_MASTER_EXT** - 292 sources with full metadata
3. **SOURCE_SECTOR_MATRIX_292** - Source-to-sector mappings (● = primary, ◐ = secondary)
4. **SOURCE_ENDPOINTS** - API endpoints for each source
5. **SOURCE_PRODUCTS** - Data products from each source

---

## Database Tables Populated

When imported, v2.3 populates these tables:

- `source_registry` - Main source metadata (292 rows)
- `sector_codebook` - Sector definitions (16 rows)
- `registry_sector_map` - Source-sector relationships
- `source_endpoints` - API endpoints
- `source_products` - Data products
- `registry_lint_results` - Validation results

---

## Version History

| Version | Location | Status |
|---------|----------|--------|
| **v2.3** | `data/source_registry/` | ✅ **CURRENT** (canonical) |
| v2.0 | Removed (deprecated) | ❌ Replaced by v2.3 |
| v2.5 | Backed up to `data.bak/` | ❌ Rolled back to v2.3 |

---

## Import Instructions

To import the source registry into the database:

```bash
# Option 1: Use v2.3-specific importer (recommended)
npx tsx scripts/import-registry-v2.3.ts

# Option 2: Use production-safe importer
npx tsx scripts/import-source-registry-v2.ts

# Option 3: Use standard importer
npx tsx scripts/import-source-registry.ts
```

All scripts now reference the same canonical file at `data/source_registry/YETO_Sources_Universe_Master_PRODUCTION_READY_v2_3.xlsx`.

---

## Validation

After import, the registry is validated against P0/P1 rules:

**P0 Rules (Critical):**
- `src_id` must be unique and present
- `name_en` must be present

**P1 Rules (Should have):**
- `tier` should be classified (T0-T4)
- `status` should be set
- `url` should be valid
- `institution` should be present

**Validation stored in:** `registry_lint_results` table

---

## Backup Locations

Old versions are preserved in `.bak` directories:

- `data.bak/registry/YETO_Sources_Universe_Master_PRODUCTION_READY_v2_3.xlsx` (backup copy)
- `data.bak/YETO_Sources_Universe_Master_PRODUCTION_READY_v2_5.xlsx` (superseded version)

**Note:** These backups are for reference only and should not be used for imports.

---

## Key Takeaways

✅ **Always use:** `data/source_registry/YETO_Sources_Universe_Master_PRODUCTION_READY_v2_3.xlsx`

✅ **Database table:** `source_registry` (not legacy `sources` table)

✅ **All import scripts updated** to reference v2.3

✅ **No confusion:** Single source of truth for source metadata

❌ **Do not use:**
- CSV files in `data.bak/sources-registry.csv`
- JSON files in `data.bak/sources_master_292.json`
- Legacy `sources` table
- Old v2.0 or v2.5 files

---

**Last Updated:** February 5, 2026  
**File Size:** 198 KB (v2.3)  
**Source Count:** 292
