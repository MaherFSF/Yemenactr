# /source-registry-import

Import `data/source_registry/YETO_Sources_Universe_Master_PRODUCTION_READY_v2_3.xlsx` into the platform as the canonical Source Registry.

Requirements:
- Create a DB table for sources (or update existing).
- Ensure fields include: source_id, names, tier, reliability_score, status, license, cadence, access_method, url.
- Add validation: sources marked NEEDS_KEY cannot be ingested without credentials.
- Expose an admin UI view (read-only) with filtering by tier/status.

Open PR titled:
"Add source registry import + admin view"
