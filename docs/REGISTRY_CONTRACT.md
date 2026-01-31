# YETO Source Registry Contract

## Overview

The Source Registry is the **canonical single source of truth** for all data sources in YETO. Every connector, ingestion schedule, evidence pack, sector reflection, RAG query, and admin alert derives from this registry.

## Canonical Table

**`source_registry`** is the ONE canonical table for all source metadata.

> ⚠️ The `sources` table is **deprecated** and should not be used for new development. All queries should reference `source_registry`.

## Required Fields

### P0 Fields (Critical - Must Have)

| Field | Type | Description |
|-------|------|-------------|
| `src_id` | string | Stable unique ID (never change once seeded) |
| `name_en` | string | Canonical English name |
| `institution` | string | Owning institution/publisher |
| `category` | enum | Source category (CB, IFI, UN, GOV, NGO, RESEARCH, MEDIA, SANCTIONS, REGISTRY, REMOTE_SENSING, PRIVATE, OTHER) |
| `source_type` | enum | data \| documents \| mixed |
| `sector_category` | string | Primary sector (one of 16 sectors) |
| `access_method` | enum | API, SDMX, RSS, WEB, PDF, CSV, XLSX, MANUAL, PARTNER, REMOTE_SENSING |
| `auth_required` | boolean | Whether credentials/login are required |
| `cadence` | enum | REALTIME, DAILY, WEEKLY, MONTHLY, QUARTERLY, ANNUAL, IRREGULAR |
| `status` | enum | ACTIVE, NEEDS_KEY, PENDING_REVIEW, INACTIVE, DEPRECATED |

### P1 Fields (Important - Should Have)

| Field | Type | Description |
|-------|------|-------------|
| `url` | url | Canonical landing page or API docs URL |
| `data_format` | string | Expected formats (csv, xlsx, pdf, html, json, api) |
| `cadence_lag_tolerance` | int | Lag tolerance in days for staleness alerts |
| `time_coverage_start` | int/string | Earliest known coverage year |
| `time_coverage_end` | int/string | Latest known coverage year |
| `geographic_coverage` | string | Yemen national / governorate / district / global |
| `license` | string | License / terms-of-use summary |
| `tier` | enum | T0, T1, T2, T3, T4, UNKNOWN |
| `evidence_pack_flag` | boolean | Must be TRUE for public-facing KPI usage |

## Allowed Enums

### Tier Classification

| Tier | Description | Reliability |
|------|-------------|-------------|
| T0 | Official government/central bank primary source | Highest |
| T1 | International organization primary data | Very High |
| T2 | Verified research/academic source | High |
| T3 | Secondary aggregator with methodology | Medium |
| T4 | Unverified or proxy source | Lower |
| UNKNOWN | Not yet classified | Requires review |

### Status Values

| Status | Description |
|--------|-------------|
| ACTIVE | Source is operational and being ingested |
| NEEDS_KEY | Requires API key or credentials to access |
| PENDING_REVIEW | Awaiting quality review |
| INACTIVE | Temporarily disabled |
| DEPRECATED | No longer used |

### Access Type

| Type | Description |
|------|-------------|
| API | Programmatic REST/GraphQL API |
| SDMX | Statistical Data and Metadata eXchange |
| RSS | RSS/Atom feed |
| WEB | Web scraping required |
| PDF | PDF document extraction |
| CSV | Direct CSV download |
| XLSX | Excel file download |
| MANUAL | Manual data entry |
| PARTNER | Partner data sharing agreement |
| REMOTE_SENSING | Satellite/remote sensing data |

### Cadence (Update Frequency)

| Cadence | Description | Default SLA (days) |
|---------|-------------|-------------------|
| REALTIME | Continuous updates | 1 |
| DAILY | Daily updates | 3 |
| WEEKLY | Weekly updates | 10 |
| MONTHLY | Monthly updates | 45 |
| QUARTERLY | Quarterly updates | 120 |
| ANNUAL | Annual updates | 400 |
| IRREGULAR | Ad-hoc updates | 180 |

### Confidence Grade

| Grade | Description | Reliability Score Range |
|-------|-------------|------------------------|
| A | Highest confidence - official primary source | 90-100 |
| B | High confidence - verified secondary source | 70-89 |
| C | Medium confidence - aggregated data | 50-69 |
| D | Lower confidence - proxy or estimated | 0-49 |

## Workbook Column Mappings

The importer maps Excel columns from `SOURCES_MASTER_EXT` sheet as follows:

| Workbook Column | Database Field | Transformation |
|-----------------|----------------|----------------|
| `src_id` | `sourceId` | Direct |
| `name_en` | `name` | Direct |
| `name_ar` | `altName` | Direct |
| `institution` | `publisher` | Direct |
| `category` | `category` | CATEGORY_MAP enum |
| `source_type` | `sourceType` | Direct |
| `url` | `webUrl` | Direct |
| `access_method_norm` | `accessType` | ACCESS_TYPE_MAP enum |
| `auth_required` | `apiKeyRequired` | Boolean parse |
| `tier` | `tier` | TIER_MAP enum |
| `status` | `status` | STATUS_MAP enum |
| `source_class` | `allowedUse` | Computed JSON array |
| `cadence_norm` | `updateFrequency` | CADENCE_MAP enum |
| `cadence_lag_tolerance` | `freshnessSla` | Integer parse |
| `geographic_coverage` | `geographicScope` | Direct |
| `time_coverage_start` | `historicalStart` | Direct |
| `time_coverage_end` | `historicalEnd` | Direct |
| `multilingual_required` + `name_ar` | `language` | Computed JSON array |
| `license` | `license` | Direct |
| `confidence_grade` | `confidenceRating` | CONFIDENCE_GRADE_MAP enum |
| `reliability_score` | `reliabilityScore` | Integer 0-100 |
| `partnership_required` | `needsPartnership` | Boolean parse |
| `partnership_action_email` | `partnershipContact` | Direct |
| `ingestion_method` | `connectorType` | Truncated to 100 chars |
| `ingestion_owner_agent` | `connectorOwner` | Default 'Manus' |
| `sector_category` | `sectorsFed` | JSON array |
| `dashboard_modules_linked` | `pagesFed` | JSON array |
| `evidence_pack_flag` | `evidencePackFlag` | Boolean parse |
| `notes` | `notes` | Direct |

## Registry Lint Rules

### P0 Failures (Block Import)

- Missing `src_id`
- Missing `name_en`
- Missing `institution`
- Missing `category`
- Missing `source_type`
- Missing `sector_category`
- Missing `access_method`
- Missing `auth_required`
- Missing `cadence`
- Missing `status`

### P1 Failures (Warning)

- Missing `url` (unless offline/manual)
- Missing `data_format`
- Missing `cadence_lag_tolerance`
- Missing `time_coverage_start`
- Missing `time_coverage_end`
- Missing `geographic_coverage`
- Missing `license`
- Missing or UNKNOWN `tier`
- Missing `evidence_pack_flag`

### Warnings

- Invalid URL format
- Tier classification is UNKNOWN

## Related Tables

| Table | Purpose |
|-------|---------|
| `sector_codebook` | 16 sector definitions |
| `registry_sector_map` | Source-to-sector mappings with weight (primary/secondary/tertiary) |
| `registry_lint_results` | Lint run history |
| `gap_tickets` | Data gap tracking |
| `partnership_access_requests` | API key/partnership request tracking |
| `raw_objects` | Raw ingested file metadata |

## Usage in Platform

1. **Connectors**: Read `source_registry` to determine which sources to fetch
2. **Ingestion Scheduler**: Use `updateFrequency` and `freshnessSla` for scheduling
3. **Evidence Packs**: Only sources with `evidencePackFlag = true` can be cited
4. **Admin Alerts**: Triggered when `freshnessSla` exceeded
5. **Sector Pages**: Use `registry_sector_map` to show relevant sources
6. **RAG/AI Coach**: Use `confidenceRating` to weight source reliability

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2026-01-31 | Production-safe importer with P0/P1 lint enforcement |
| 1.0 | 2026-01-30 | Initial import from Excel workbook |
