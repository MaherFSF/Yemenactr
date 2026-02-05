# YETO Source Registry CSV Exports

This directory contains CSV exports of each sheet from the canonical YETO Source Registry Excel file.

## Source File

**Excel File:** `data/source_registry/YETO_Sources_Universe_Master_PRODUCTION_READY_v2_3.xlsx`  
**Version:** v2.3  
**Last Exported:** Run `python scripts/export_excel_to_csv.py` to update

## Exported Sheets

The following CSV files are generated from the Excel workbook:

| CSV File | Source Sheet | Description |
|----------|--------------|-------------|
| `sector_codebook_16.csv` | SECTOR_CODEBOOK_16 | 16 economic sectors (S01-S16) with definitions |
| `sources_master_ext.csv` | SOURCES_MASTER_EXT | 292 sources with complete metadata (63 columns) |
| `source_sector_matrix_292.csv` | SOURCE_SECTOR_MATRIX_292 | Source-to-sector mappings (● = primary, ◐ = secondary) |
| `source_endpoints.csv` | SOURCE_ENDPOINTS | API endpoints for each source (292 rows) |
| `source_products.csv` | SOURCE_PRODUCTS | Data products available from each source (292 rows) |
| `readme.csv` | README | Registry overview and usage instructions |
| `enums.csv` | ENUMS | Valid enum values for tier, status, access_method, etc. |
| `col_map_to_db.csv` | COL_MAP_TO_DB | Excel column to database field mappings |
| `lint_rules.csv` | LINT_RULES | Validation rules (P0/P1) for registry entries |
| `changelog.csv` | CHANGELOG | Version history and changes |

## File Naming Convention

Sheet names are sanitized to create valid filenames:
- Converted to lowercase
- Spaces, hyphens, parentheses replaced with underscores
- Special characters removed
- Multiple underscores collapsed to single underscore

**Examples:**
- `SECTOR_CODEBOOK_16` → `sector_codebook_16.csv`
- `SOURCE-SECTOR MATRIX_292` → `source_sector_matrix_292.csv`
- `Source Products (v2)` → `source_products_v2.csv`

## Usage

### Export/Update CSV Files

To (re)export all sheets to CSV:

```bash
python scripts/export_excel_to_csv.py
```

**Requirements:**
```bash
pip install pandas openpyxl
```

### Read CSV in Scripts

**Python:**
```python
import pandas as pd

# Read sources
sources = pd.read_csv('data/exports/yeto_sources_universe/sources_master_ext.csv')
print(f"Loaded {len(sources)} sources")

# Read sectors
sectors = pd.read_csv('data/exports/yeto_sources_universe/sector_codebook_16.csv')
```

**Node.js:**
```javascript
import fs from 'fs';
import { parse } from 'csv-parse/sync';

// Read sources
const sourcesCSV = fs.readFileSync('data/exports/yeto_sources_universe/sources_master_ext.csv', 'utf-8');
const sources = parse(sourcesCSV, { columns: true });
console.log(`Loaded ${sources.length} sources`);
```

**Bash/Shell:**
```bash
# Count sources
wc -l data/exports/yeto_sources_universe/sources_master_ext.csv

# View sectors
cat data/exports/yeto_sources_universe/sector_codebook_16.csv | column -t -s,
```

## Why CSV Exports?

CSV files provide several advantages for programmatic access:

1. **Version Control Friendly:** Easier to diff changes in git
2. **Universal Format:** Readable by any programming language
3. **Lightweight:** No Excel library dependencies for reading
4. **Fast Parsing:** Quicker to load than Excel files
5. **Command Line Tools:** Works with standard Unix tools (grep, awk, etc.)

## Data Integrity

⚠️ **Important:** These CSV files are **derived exports** from the canonical Excel file.

- **Source of Truth:** `data/source_registry/YETO_Sources_Universe_Master_PRODUCTION_READY_v2_3.xlsx`
- **For Database Import:** Use the Excel file with import scripts
- **For Quick Access:** Use these CSV exports

If you make changes to source data:
1. Update the Excel file
2. Re-run the export script to update CSV files
3. Commit both Excel and CSV files

## Column Descriptions

### sources_master_ext.csv

Key columns in the sources master file:

- `src_id` - Unique source identifier (e.g., SRC-001)
- `name_en` - English name of the source
- `name_ar` - Arabic name of the source
- `institution` - Publishing organization
- `tier` - Quality tier (T0-T4)
- `status` - Current status (ACTIVE, NEEDS_KEY, etc.)
- `access_method` - How to access (API, WEB, PDF, etc.)
- `url` - Primary URL
- `sector_category` - Main sector focus
- `update_frequency` - How often updated
- `license` - Usage license

See `data/source_registry/README.md` for full field descriptions.

### sector_codebook_16.csv

- `sector_code` - Sector identifier (S01-S16)
- `sector_name` - Sector name (e.g., "Macroeconomy")
- `definition` - Sector definition and scope

### source_sector_matrix_292.csv

- `src_id` - Source identifier
- `S01` through `S16` - Mapping symbols:
  - `●` - Primary sector
  - `◐` - Secondary sector
  - Empty - Not applicable

## Git Tracking

These CSV files are tracked in git for easy diffing and history:

```bash
# See what changed in sources
git diff data/exports/yeto_sources_universe/sources_master_ext.csv

# View history of sector definitions
git log -p data/exports/yeto_sources_universe/sector_codebook_16.csv
```

## Notes

- CSV files use UTF-8 encoding for Arabic text support
- Empty cells are represented as empty strings (not null)
- All exports include column headers
- Line endings are Unix-style (LF)

---

**Generated by:** `scripts/export_excel_to_csv.py`  
**Source:** YETO Source Registry v2.3  
**Last Updated:** February 5, 2026
