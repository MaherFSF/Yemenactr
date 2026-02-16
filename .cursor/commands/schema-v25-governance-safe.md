# /schema-v25-governance-safe

You are the lead data platform engineer. Resolve BLOCKER 1: database schema missing v2.5 governance-critical columns.

NON-NEGOTIABLE RULES:
- Do NOT weaken or bypass CI release gates.
- Do NOT drop or rename existing columns.
- Do NOT overwrite historical data.
- All migrations MUST be additive and forward-compatible.
- If historical values are unknown or unsafe, fields MUST remain NULL (no inference).

TASKS:

1) Discovery & Evidence
- Identify all missing v2.5 columns referenced by CI.
- For EACH column, document: table, column, code reference (file + line), and purpose.

2) Classification (MANDATORY TABLE)
- Produce a table classifying each column:
  REQUIRED_AT_INGEST | REQUIRED_FOR_GOVERNANCE | REQUIRED_FOR_UI | OPTIONAL

3) Migration Design
- Design additive migrations.
- Specify type, nullability, defaults only if safe.

4) Backfill Policy
- For each column: Can backfill safely? YES/NO.
- If YES: deterministic method.
- If NO: remain NULL until future evidence.

5) Implementation
- Create migration files.
- Update schema definitions.
- Ensure schema validation passes ONLY when migration is applied.

6) CI Hardening
- Improve failure message: expected version, missing migrations, next commands.

7) Documentation
- Create docs/SCHEMA_V2_5.md and docs/MIGRATION_RUNBOOK.md
- Update BLOCKERS.md marking BLOCKER 1 resolved ONLY if gates pass.

PR:
- Create a new branch.
- Open PR titled:
  "Resolve BLOCKER 1: Schema v2.5 migration (governance-safe)"
