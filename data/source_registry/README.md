# Source Registry

This folder contains the authoritative Source Registry used by ingestion + governance.

- **File:** `YETO_Sources_Universe_Master_PRODUCTION_READY_v2_0.xlsx`
- **Source IDs:** `SRC-###`

## How to use

1) Import into DB table `sources_registry` (or whatever your schema names it).
2) Treat `tier`, `status`, `license`, and `access_method` as policy inputs.
3) Ingestion connectors must refuse to run for sources marked `NEEDS_KEY` unless credentials exist and are allowed.

## Minimum required fields

- source_id
- source_name_en / source_name_ar
- tier (T1/T2/T3/T4)
- reliability_score
- license
- access_method
- cadence
- url

