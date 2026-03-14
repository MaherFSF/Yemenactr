# Phase 85 Audit Findings

## Database State
- **292 sources** in source_registry
- **7,427 time series** records (date range: 1970 to 2026)
- **370 research publications** (2010-2025 well covered)
- **309 sources** in legacy sources table
- **173 time_series_data** records

## Source Registry Breakdown
- **25 connectable API sources** with URLs populated
- **17 API sources** needing URLs populated
- **250+ sources** with WEB/PDF/CSV/MANUAL access types

## Connectable API Sources (25 with URLs)
1. World Bank (7 endpoints) - T0/T1
2. IMF (2 endpoints) - T1
3. ReliefWeb - T1
4. OCHA FTS - T1
5. FAO FAOSTAT - T1
6. ILOSTAT - T1
7. UNHCR - T1
8. WFP (2 endpoints) - T1
9. WHO GHO - T1
10. UN Comtrade - T1
11. UN Population - T1
12. UNDP - T1
13. IATI - T1
14. UN SDG (2) - T1/UNKNOWN
15. ACLED - T2
16. NASA FIRMS - UNKNOWN

## API Sources Needing URLs (17)
- Central Bank of Yemen, ACAPS, Trading Economics, OCHA CBPF, Copernicus, OpenAlex, UCDP, Crossref, Semantic Scholar, USAspending, etc.

## Priority Actions
1. Build connectors for all 25 API sources with URLs
2. Populate URLs for the 17 API sources missing them
3. Build literature ingestion from ReliefWeb, World Bank, IMF
4. Backfill all data since 2010
5. Wire everything to agents and dashboards
