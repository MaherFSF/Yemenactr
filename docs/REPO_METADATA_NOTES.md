# Repository Metadata Notes

Generated: 2026-02-05T15:05:29.941Z

## Source registry of truth

- Canonical spreadsheet: data/registry/YETO_Sources_Universe_Master_PRODUCTION_READY_v2_3.xlsx
- Versioned spreadsheet copies: data/YETO_Sources_Universe_Master_PRODUCTION_READY_v2_0.xlsx and data/YETO_Sources_Universe_Master_PRODUCTION_READY_v2_5.xlsx
- Canonical database table: source_registry (MySQL/TiDB)
- Import scripts: scripts/import-registry-v2.3.ts, scripts/import-source-registry-v2.ts, scripts/import-source-registry.ts, scripts/initialize-sources.mjs

## Unknown metrics

- Release gate: Cannot read properties of undefined (reading 'isServer')
  - Command: `node scripts/release-gate.mjs --json`
