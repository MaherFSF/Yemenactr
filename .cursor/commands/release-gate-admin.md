# /release-gate-admin

Build `/admin/release-gate` as the single source of truth for production readiness.

Requirements:
- Show PASS/FAIL per gate (see docs/RELEASE_GATES.md)
- Each gate links to the failing check or doc.
- Must run without secrets in the client.
- Must be protected by admin RBAC.

Deliverables:
- Admin page
- Any backend endpoints needed
- Update docs/ROUTE_INVENTORY.md with release-gate link
- Add Playwright test that the page loads for admin and denies non-admin

Open PR titled:
"Add admin release gate dashboard"
