# YETO Archive — Deprecated Files

**Archived on:** 2026-02-11
**Reason:** Phase 0 cleanup — consolidating source data to single source of truth

These files were moved here because they contained duplicate, outdated, or superseded
source data definitions. They are preserved for reference only.

**DO NOT re-import or use these files.** The canonical source of truth is:

```
data/registry/YETO_Sources_Universe_Master_SINGLE_SOURCE_OF_TRUTH_v3_0.xlsx
```

Imported via the single canonical script:
```
scripts/import-registry.ts
```

## What was archived and why

### deprecated-xlsx/
Old versions of the Sources Universe Master spreadsheet. Superseded by v3.0.

| File | Version | Why Archived |
|------|---------|-------------|
| `PRODUCTION_READY_v2_0.xlsx` | v2.0 | 56 columns, replaced by v3.0 (75+ cols) |
| `PRODUCTION_READY_v2_3.xlsx` (root) | v2.3 | Duplicate of data/registry copy |
| `PRODUCTION_READY_v2_3.xlsx` (data/registry) | v2.3 | Replaced by v3.0 |
| `PRODUCTION_READY_v2_3.xlsx` (docs-source) | v2.3 | Third copy, same data |
| `PRODUCTION_READY_v2_5.xlsx` | v2.5 | 75 columns, replaced by v3.0 |

### deprecated-scripts/
One-off import scripts that were superseded by the canonical `scripts/import-registry.ts`.

| File | What It Did | Why Archived |
|------|-------------|-------------|
| `populate-sources-200.ts` | Hardcoded 200+ sources as TypeScript array | Hardcoded data, should come from xlsx |
| `import-source-registry.ts` | v1 xlsx importer | Superseded by import-registry.ts |
| `import-source-registry-v2.ts` | v2 xlsx importer | Superseded by import-registry.ts |
| `import-sources.ts` | JSON file importer | Superseded by import-registry.ts |
| `ingest-sources-292.ts` | Excel to DB importer | Superseded by import-registry.ts |
| `initialize-sources.ts` | Old source initializer | Superseded by import-registry.ts |

### deprecated-source-defs/
Files that contained hardcoded source definitions duplicating the xlsx master.

| File | What It Contained | Why Archived |
|------|-------------------|-------------|
| `sourceRegistryImport.ts` | CSV-based source importer (225+) | CSV format replaced by xlsx |
| `sources-registry.csv` | 225+ source rows in CSV | Replaced by xlsx master |
| `sources-config.json` | 226 sources in JSON for connector registry | Replaced by DB-backed registry |

## Source Data Architecture (After Cleanup)

```
SINGLE SOURCE OF TRUTH:
  data/registry/YETO_Sources_Universe_Master_*.xlsx
       │
       ▼
  scripts/import-registry.ts  (reads xlsx → writes to DB)
       │
       ▼
  source_registry table  (292+ sources in MySQL/TiDB)
       │
       ├──▶ server/routers/sourceRegistry.ts  (tRPC API)
       ├──▶ server/connectors/  (read config from DB)
       ├──▶ server/pipeline/  (read config from DB)
       └──▶ client/src/pages/  (display via tRPC)
```
