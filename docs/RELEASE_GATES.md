# Release Gates

A release gate is a measurable PASS/FAIL rule that blocks merges/deploys if failing.

## Gate list (minimum)

1) **CI green** (lint, typecheck, tests)
2) **Schema gate** (migrations applied; schema matches expected version)
3) **RBAC gate** (server-side enforcement for VIP/admin routes)
4) **Evidence gate** (no KPI rendered without evidencePackId)
5) **Provenance gate** (every observation links to source_id + ingestion_run + raw_object)
6) **Split-system gate** (regime_tag required where relevant; no mixing)
7) **Licensing gate** (sources marked NEEDS_KEY are not scraped; access tracked)
8) **Exports gate** (CSV + PNG minimum; PDFs where specified)
9) **E2E gate** (Playwright critical journeys)
10) **Accessibility gate** (basic keyboard nav + RTL rendering sanity)
11) **Security gate** (no secrets in repo; CSP sane; auth checks)

## Admin UX

Implement `/admin/release-gate` that shows PASS/FAIL for each gate with a link to the failing check.

