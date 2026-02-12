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
| `hardcoded-connector-arrays.ts` | 3 hardcoded arrays (9+13+8 entries) from connectors/index.ts | Replaced by DB-backed async functions (Phase 2) |

## Source Data Architecture (After Phase 0 + Phase 1)

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
       ├──▶ server/connectors/  (read config from DB, query sourceRegistry)
       ├──▶ server/pipeline/  (read config from DB)
       ├──▶ server/db.ts  (getSourceById, getAllSources → sourceRegistry)
       ├──▶ server/seed.ts  (seeds into sourceRegistry with SEED-* IDs)
       └──▶ client/src/pages/  (display via tRPC)

  DEPRECATED TABLES (Phase 1 — all FKs migrated):
       sources (7 rows) ──── @deprecated, FKs → sourceRegistry
       evidence_sources ──── @deprecated, FKs → sourceRegistry
```

## Phase 1: Source Table Unification (Feb 2026)

Previously, 3 separate tables served as "source" references:
- `sources` (7 rows) — used by 20 FK columns across datasets, timeSeries, etc.
- `evidence_sources` — used by 5 FK columns in evidence/truth layer
- `source_registry` (292+ rows) — the canonical registry

Phase 1 unified all 25 FK references to point to `source_registry.id`.
Both `sources` and `evidence_sources` are now marked `@deprecated`.

## Phase 2: Clean Connector System (Feb 2026)

Removed 3 hardcoded source arrays from `server/connectors/index.ts`:

| Array | Entries | What It Was | Replacement |
|-------|---------|-------------|-------------|
| `DATA_SOURCES` | 9 | Hardcoded source registry (id, name, url, cadence) | `getDataSources()` — async DB query |
| `ENHANCED_CONNECTOR_REGISTRY` | 13 | Hardcoded connector metadata (name, nameAr, priority, dataTypes) | `getAllEnhancedConnectorStatuses()` — async DB query |
| `EXTENDED_CONNECTORS` | 8 | Second hardcoded source list (UNHCR, WHO, UNICEF, etc.) | Merged into `getDataSources()` |

All helper functions (`getAllConnectors`, `getActiveConnectorsSorted`, etc.) are now async
and read from `source_registry` table instead of hardcoded arrays.

Files updated: `server/connectors/index.ts`, `server/ingestion.ts`, `server/scheduler/ingestionScheduler.ts`,
`server/connectors.test.ts`, `server/routers.ts`, `Makefile`.

## Phase 3: Script Consolidation (Feb 2026)

Archived 33 scripts that were duplicates, superseded versions, one-off migration tools,
or tiny diagnostic utilities. Reduced scripts/ from ~97 to 64 active files.

### deprecated-scripts/phase3-duplicates/ (15 scripts)

Scripts superseded by a better or more comprehensive version.

| File | Lines | Superseded By | Why Archived |
|------|-------|---------------|-------------|
| `ingest-labor-market-data.ts` | 722 | `ingest-labor-data.ts` | Duplicate labor data ingestion |
| `populate-comprehensive-data.ts` | 374 | `populate-all-data.ts` | Subset of larger population script |
| `seed-banks.mjs` | 405 | `seed-all-banks.ts` (1297 lines) | Smaller incomplete version |
| `seed-data.mjs` | 569 | `seed-complete-database.ts` | Alternative seed, standardize on .ts |
| `initialize-sources.mjs` | — | `initialize-sources-v2.mjs` | Old version, v2 is current |
| `insert-2025-reports.mjs` | — | `insert-2025-reports-v2.mjs` | Old version, v2 is current |
| `run-backfill.ts` | 88 | `comprehensive-backfill.mjs` | Less comprehensive backfill |
| `run-new-connectors-backfill.ts` | 163 | `comprehensive-backfill.mjs` | Subset of comprehensive backfill |
| `run-research-ingestion.ts` | 65 | `ingest-research-data.ts` | Thin wrapper, use full script |
| `test-all-routes.ts` | 120 | `comprehensive-site-audit.ts` | Less complete route testing |
| `test-connector-run.mjs` | 156 | `run-real-connectors.mjs` | Overlapping connector test |
| `seed-cby-directives.mjs` | 140 | `seed-cby-directives.ts` | Duplicate .mjs version |
| `sync-economic-events.ts` | 113 | N/A | One-off sync, not reusable |
| `add-sources-all.mjs` | 77 | `bulk-add-sources.mjs` (182 lines) | Smaller incomplete version |
| `create-banking-tables.mjs` | 244 | `seed-all-banks.ts` (1297 lines) | Subset of full banking seed |

### deprecated-scripts/phase3-one-off-migrations/ (6 scripts)

One-time UI/schema migration scripts. Work is done, no longer needed.

| File | What It Did | Why Archived |
|------|-------------|-------------|
| `add-imports.mjs` | Added SourcesUsedPanel imports to sector pages | One-time migration complete |
| `fix-closing-divs.mjs` | Fixed HTML closing divs in sector pages | One-time fix complete |
| `add-classification-columns.mjs` | Added classification columns to schema | One-time schema migration |
| `batch-update-sectors.ts` | Updated sector background configs | One-time UI migration |
| `fix-all-sectors.mjs` | Bulk fix sector page structure | One-time fix complete |
| `update-sector-backgrounds.ts` | Updated sector background images | One-time UI migration |

### deprecated-scripts/phase3-diagnostics/ (8 scripts)

Small diagnostic scripts. Functionality covered by `scripts/validate.ts` and
`scripts/comprehensive-site-audit.ts`.

| File | Lines | What It Did |
|------|-------|-------------|
| `check-columns.ts` | 10 | `SHOW COLUMNS` on single table |
| `check-db-counts.ts` | 32 | Row counts on multiple tables |
| `check-research-db.ts` | 55 | Research publication data checks |
| `test-raw-query.mjs` | — | Test raw SQL execution |
| `db-check.mjs` | — | Missing tables + row counts |
| `verify-data-counts.mjs` | 88 | Data count expectations |
| `full-audit.mjs` | 40 | Generic DB audit |
| `check_entities.mjs` | 26 | Entity table query (was in project root) |

### deprecated-scripts/phase3-server-seeds/ (4 scripts)

Server-level seed scripts superseded by canonical `server/seed.ts` and `scripts/import-registry.ts`.

| File | Lines | Why Archived |
|------|-------|-------------|
| `seed.mjs` | 521 | Use `server/seed.ts` (canonical TypeScript version) |
| `seed-source-registry.mjs` | 445 | Use `scripts/import-registry.ts` |
| `seed-source-metadata.mjs` | 401 | Functionality in `import-registry.ts` |
| `seed-yemen-sources-comprehensive.mjs` | 1228 | Use `scripts/seed-expanded-sources.mjs` |

## Phase 4: Frontend Alignment (Feb 2026)

Replaced hardcoded frontend mock data with tRPC calls to canonical `source_registry` table.
Archived dead `.old` page files. Tagged remaining mock data with `@placeholder`.

### Hardcoded Data Replaced

| File | What Was Removed | Replacement |
|------|-----------------|-------------|
| `client/src/pages/DataFreshness.tsx` | 16-entry `DATA_SOURCES` array + `generateFreshnessData()` random data | `trpc.sourceRegistry.getAll` with real `lastFetch`/`nextFetch` |
| `client/src/pages/admin/SourceConsole.tsx` | 8-entry `mockSources` array + hardcoded stats | `trpc.sourceRegistry.getAll` + `trpc.sourceRegistry.getStats` |

### deprecated-scripts/phase4-dead-pages/ (2 files)

Dead `.old` page files disconnected from routing.

| File | Why Archived |
|------|-------------|
| `PartnerPortal.old.tsx` | Dead `.old` file, not routed or imported |
| `Banking.old.tsx` | Dead `.old` file, not routed or imported |

### Mock Data Tagged @placeholder (4 components)

These components still use local mock data but are now tagged with `@placeholder` comments
indicating which tRPC endpoint will replace them:

| File | Mock Variable | Future Endpoint |
|------|--------------|-----------------|
| `VIPCockpit.tsx` | `createMockEvidencePack()` + `mockData` | `trpc.vip.getCockpitData` |
| `InsightsTicker.tsx` | `insights` array | `trpc.insights` endpoint |
| `OwnershipGraph.tsx` | `SAMPLE_DATA` | `trpc.ownership` endpoint |
| `TimelineNavigation.tsx` | `yemenTimelineEvents` | `trpc.timeline` endpoint |
| `SourceConsole.tsx` | `mockVerificationQueue` + `mockSectorFeedMatrix` | `trpc.verification` + `trpc.feedMatrix` endpoints |

### Canonical Scripts (Post Phase 3)

After cleanup, these are the canonical scripts for key operations:

| Operation | Canonical Script |
|-----------|-----------------|
| Import source registry from xlsx | `scripts/import-registry.ts` |
| Seed fresh database | `server/seed.ts` + `scripts/seed-complete-database.ts` |
| Seed banking data | `scripts/seed-all-banks.ts` |
| Seed indicators | `scripts/seed-indicators.ts` |
| Refresh live API data | `scripts/refresh-all-data.ts` |
| Historical backfill | `scripts/comprehensive-backfill.mjs` |
| Sector-specific ingestion | `scripts/ingest-{sector}-data.ts` |
| Pre-deployment validation | `scripts/validate.ts` |
| Release verification | `scripts/release-gate.mjs` |
| CI/CD seed | `scripts/seed-ci.mjs` |
