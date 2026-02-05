# Next Actions

This is the “what we do next” page for you + Cursor.

## Right now (P0)

1) **Resolve BLOCKER 1 (Schema v2.5 migration)**
   - Add additive migrations only
   - No destructive changes
   - Add CI error messages telling dev exactly what to run

2) **Re-run CI and confirm all release gates that depend on schema now pass**

## Next (P1)

3) Build `/admin/release-gate` and wire gates to real checks
4) Create Playwright route inventory test
5) Implement “no fake numbers” guard at component level (KpiCard requires evidencePackId)

## Then (P2)

6) RBAC + VIP routing hardening
7) Dashboard module framework + Evidence Drawer
8) Role dashboards (5 minimum)
9) Alerts + briefs + S3 signed URL proof
10) Evidence-only assistant

