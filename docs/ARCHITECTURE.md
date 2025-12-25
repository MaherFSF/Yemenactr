# YETO Platform Architecture

## System Overview

YETO (Yemen Economic Transparency Observatory) is a bilingual economic intelligence platform built on a four-layer architecture designed for evidence-based analysis, complete provenance tracking, and verifiable outputs.

## Architecture Layers

### 1. Data Layer
Stores all economic data, documents, and metadata with complete provenance tracking.

**Components:**
- Time series data (inflation, FX rates, reserves, GDP, etc.)
- Geospatial datasets (governorate-level indicators)
- Economic events and timeline entries
- Documents and reports (PDFs, spreadsheets)
- Funding flows and project data
- Images with attribution metadata

**Storage:**
- MySQL/TiDB: Structured data, relationships, provenance
- S3: Documents, images, raw data files
- Database tables enforce regime_tag and confidence scoring

### 2. Provenance & Trust Layer
Ensures every data point is traceable, versioned, and confidence-scored.

**Components:**
- Source registry (publishers, datasets, licenses)
- Provenance ledger (transformations, calculations)
- Confidence scoring system (A-D ratings with explanations)
- Version control (vintages, "what was known when")
- Contradiction detection (conflicting sources)
- Correction workflow (public corrections log)

**Key Features:**
- Every number links to its source
- Transformations are logged and reproducible
- Conflicting data shown side-by-side, never averaged
- Corrections published transparently with timestamps

### 3. Reasoning & ML Layer
Provides advanced analytics while staying grounded in evidence.

**Components:**
- Change detection (significant shifts in indicators)
- Anomaly detection (outliers, suspicious patterns)
- Nowcasting (real-time estimates from partial data)
- Forecasting (scenario-based projections)
- Scenario simulator (policy impact modeling)
- Evidence-grounded narrative generation (AI summaries with citations)

**Constraints:**
- All AI outputs labeled: Fact / Interpretation / Hypothesis / Forecast / Recommendation
- Outputs must cite evidence from platform store
- "Not available yet" displayed for missing data (no fabrication)
- Evidence Packs generated for high-stakes outputs

### 4. Delivery Layer
Provides role-based access to data, analysis, and tools.

**Components:**
- Public website (bilingual: Arabic RTL + English LTR)
- Interactive dashboards (sector-specific, customizable)
- Data repository (search, filter, download)
- Research library (reports, publications)
- API (public tier + premium tiers)
- Admin operations console
- Partner contributor portal
- User workspaces (premium feature)

## Technology Stack

### Frontend
- **Framework:** React 19 with TypeScript
- **Styling:** Tailwind CSS 4
- **Routing:** Wouter (lightweight client-side routing)
- **State Management:** React Query + tRPC
- **Charts:** Recharts (with potential for ECharts for advanced visualizations)
- **i18n:** Custom React context with JSON translation files
- **Typography:** 
  - Arabic: Cairo or Noto Kufi Arabic
  - English: Inter

### Backend
- **Framework:** Express 4 with tRPC 11
- **Language:** TypeScript (Node.js)
- **API:** tRPC procedures (type-safe, auto-generated client)
- **Authentication:** Manus OAuth (JWT-based sessions)
- **Database ORM:** Drizzle ORM
- **File Storage:** AWS S3 (via pre-configured helpers)
- **Background Jobs:** (TBD: Celery + Redis OR AWS Step Functions)

### Database
- **Primary:** MySQL/TiDB (provided by Manus platform)
- **ORM:** Drizzle ORM with migrations via `drizzle-kit`
- **Schema:** 
  - Users, roles, subscriptions
  - Economic data with regime_tag and confidence scoring
  - Sources, datasets, provenance ledger
  - Documents, images, attribution
  - Data gap tickets, correction logs

### Infrastructure
- **Hosting:** Manus platform (AWS-backed)
- **Domain:** yeto.causewaygrp.com
- **CDN:** Built-in via Manus
- **File Storage:** S3 (pre-configured, no manual setup)
- **CI/CD:** GitHub Actions (to be configured)

## Data Model (Core Tables)

### Users & Access
```
users
├── id (PK)
├── openId (unique, from OAuth)
├── name, email, loginMethod
├── role (user | admin)
├── subscriptionTier (free | researcher | institutional)
├── createdAt, updatedAt, lastSignedIn
```

### Economic Data
```
time_series
├── id (PK)
├── indicator_code (e.g., "inflation_cpi_aden")
├── regime_tag (aden_irg | sanaa_defacto | mixed | unknown)
├── date (timestamp)
├── value (decimal)
├── unit (e.g., "YER", "percent", "USD millions")
├── confidence_rating (A | B | C | D)
├── source_id (FK → sources)
├── dataset_id (FK → datasets)
├── created_at, updated_at
```

### Provenance
```
sources
├── id (PK)
├── publisher (e.g., "Central Bank of Yemen - Aden")
├── url (persistent link)
├── license (e.g., "CC-BY-4.0", "unknown")
├── retrieval_date
├── notes

datasets
├── id (PK)
├── name (e.g., "CPI Monthly Series 2010-2024")
├── source_id (FK → sources)
├── publication_date
├── time_coverage_start, time_coverage_end
├── geographic_scope
├── confidence_rating
├── notes

provenance_log
├── id (PK)
├── data_point_id (FK → time_series or other data tables)
├── transformation_type (e.g., "deflation", "currency_conversion")
├── formula (e.g., "nominal / cpi_base_2015 * 100")
├── performed_at
├── performed_by_user_id
```

### Documents & Images
```
documents
├── id (PK)
├── title
├── file_key (S3 key)
├── file_url (public S3 URL)
├── mime_type
├── source_id (FK → sources)
├── license
├── upload_date
├── uploader_id (FK → users)

images
├── id (PK)
├── title
├── creator
├── source_url
├── license
├── file_key (S3 key)
├── file_url (public S3 URL)
├── usage_locations (JSON array)
├── retrieval_date
```

### Data Gaps & Corrections
```
data_gap_tickets
├── id (PK)
├── missing_item (e.g., "Monthly FX rates for Sana'a 2022")
├── why_it_matters
├── candidate_sources
├── acquisition_method
├── priority (low | medium | high)
├── status (open | in_progress | resolved)
├── created_at, resolved_at

corrections
├── id (PK)
├── data_point_id (FK → time_series or other)
├── old_value
├── new_value
├── reason
├── corrected_at
├── corrected_by_user_id
```

## Security Architecture

### Authentication & Authorization
- **OAuth:** Manus OAuth handles user login (no password storage)
- **Sessions:** JWT-based session cookies (httpOnly, secure, sameSite)
- **Roles:** `user` (default) | `admin` | `partner_contributor`
- **Permissions:** Role-based access control (RBAC) enforced in tRPC procedures

### Data Protection
- **Encryption in transit:** HTTPS enforced
- **Encryption at rest:** S3 server-side encryption enabled
- **PII Policy:** Never store or display personally identifiable information
- **API Rate Limiting:** By subscription tier (free: 100 req/day, researcher: 10k/day, institutional: unlimited)

### Content Security
- **No physical addresses:** Contact info limited to yeto@causewaygrp.com
- **Image licensing:** All images tracked with attribution and license metadata
- **Source respect:** No scraping of paywalled or robots.txt-blocked content

## Deployment Architecture

### Development
- Local dev server: `pnpm dev` (Express + Vite HMR)
- Database: MySQL/TiDB connection via `DATABASE_URL` env var
- File storage: S3 via pre-configured helpers (credentials injected)

### Production
- **Domain:** yeto.causewaygrp.com
- **Hosting:** Manus platform (AWS-backed infrastructure)
- **CDN:** Built-in content delivery
- **Database:** Managed MySQL/TiDB with automated backups
- **File Storage:** S3 with versioning enabled
- **Monitoring:** (TBD: CloudWatch, Sentry, or platform-provided)

## Scalability Considerations

### Data Volume
- **Time series:** ~100k data points initially, growing to millions
- **Documents:** ~10k PDFs/reports initially
- **Images:** ~1k images with attribution
- **Users:** Expect 1k-10k registered users in first year

### Performance Targets
- **Page load:** <2s for dashboard (initial render)
- **API response:** <500ms for most queries
- **Chart rendering:** <1s for complex visualizations
- **Search:** <1s for full-text queries

### Caching Strategy
- **Static assets:** Aggressive CDN caching (1 year)
- **API responses:** Short-lived cache for frequently accessed data (5-15 min)
- **Charts:** Client-side caching with React Query
- **Translations:** Bundled with frontend, cached indefinitely

## Monitoring & Observability

### Health Checks
- **Database:** Connection pool status, query performance
- **API:** Response times, error rates
- **Background jobs:** Success/failure rates, queue depth
- **Data integrity:** Nightly checks for orphaned records, missing provenance

### Logging
- **Application logs:** Structured JSON logs (timestamp, level, message, context)
- **Audit logs:** User actions (data edits, admin operations)
- **Error tracking:** (TBD: Sentry or platform-provided)

### Alerts
- **Critical:** Database connection failures, API downtime
- **Warning:** Slow queries, high error rates, data integrity failures
- **Info:** New data gap tickets, correction requests

## Disaster Recovery

### Backup Strategy
- **Database:** Automated daily snapshots (retained 30 days)
- **S3:** Versioning enabled (all file versions retained)
- **Code:** GitHub repository (all commits preserved)

### Recovery Procedures
1. **Database restore:** Restore from latest snapshot via platform UI
2. **File restore:** Retrieve previous S3 versions if needed
3. **Code rollback:** Deploy previous Git commit
4. **Integrity validation:** Run automated smoke tests after restore

### RTO/RPO Targets
- **Recovery Time Objective (RTO):** <4 hours
- **Recovery Point Objective (RPO):** <24 hours (daily backups)

## Future Enhancements

### Phase 2 Features (Post-Launch)
- Real-time data streaming (WebSocket updates)
- Advanced ML models (LSTM forecasting, NLP for document extraction)
- Mobile apps (iOS/Android)
- Collaborative workspaces (team annotations, shared reports)
- Public API v2 (GraphQL)

### Phase 3 Features (Long-term)
- Blockchain-based provenance (immutable audit trail)
- Federated data sharing (with partner organizations)
- Automated report generation (scheduled PDF/Excel exports)
- Predictive alerts (anomaly detection triggers notifications)
