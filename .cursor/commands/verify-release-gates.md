---
name: verify-release-gates
description: Check status of all release gates
---

# Verify Release Gates

Check the status of all release gates defined in `docs/RELEASE_GATES.md`.

## Tasks

1. Run CI checks (lint, typecheck)
2. Check schema version matches expected
3. Verify RBAC enforcement exists for VIP routes
4. Check that KPIs have evidencePackId
5. Verify provenance chain for sample observations
6. Check regime_tag usage in Yemen data
7. Verify source registry has licensing flags
8. Test export functionality
9. Check if Playwright tests exist and pass
10. Basic accessibility checks (keyboard nav, RTL)
11. Verify no secrets in committed code

## Output

Create or update `docs/RELEASE_GATE_STATUS.md` with:
- Gate name
- Status (PASS/FAIL)
- Evidence/reason
- Action items if failing
