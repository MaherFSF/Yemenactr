# Repository Metadata Notes

Generated: 2026-02-05T14:58:22.621Z

## Source registry of truth

- Canonical spreadsheet: data/registry/YETO_Sources_Universe_Master_PRODUCTION_READY_v2_3.xlsx
- Versioned spreadsheet copies: data/YETO_Sources_Universe_Master_PRODUCTION_READY_v2_0.xlsx and data/YETO_Sources_Universe_Master_PRODUCTION_READY_v2_5.xlsx
- Canonical database table: source_registry (MySQL/TiDB)
- Import scripts: scripts/import-registry-v2.3.ts, scripts/import-source-registry-v2.ts, scripts/import-source-registry.ts, scripts/initialize-sources.mjs

## Unknown metrics

- Release gate: Command failed: node scripts/release-gate.mjs --json
node:internal/modules/package_json_reader:314
  throw new ERR_MODULE_NOT_FOUND(packageName, fileURLToPath(base), null);
        ^

Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'mysql2' imported from /workspace/scripts/release-gate.mjs
    at Object.getPackageJSONURL (node:internal/modules/package_json_reader:314:9)
    at packageResolve (node:internal/modules/esm/resolve:767:81)
    at moduleResolve (node:internal/modules/esm/resolve:853:18)
    at defaultResolve (node:internal/modules/esm/resolve:983:11)
    at #cachedDefaultResolve (node:internal/modules/esm/loader:731:20)
    at ModuleLoader.resolve (node:internal/modules/esm/loader:708:38)
    at ModuleLoader.getModuleJobForImport (node:internal/modules/esm/loader:310:38)
    at ModuleJob._link (node:internal/modules/esm/module_job:182:49) {
  code: 'ERR_MODULE_NOT_FOUND'
}

Node.js v22.21.1

  - Command: `node scripts/release-gate.mjs --json`
- Tests: Command failed: pnpm test
sh: 1: vitest: not found

  - Command: `pnpm test`
