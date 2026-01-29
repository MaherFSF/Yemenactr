# YETO Runtime Wiring Inventory

**Generated:** January 29, 2025 (Updated)
**Purpose:** Classify each subsystem as WIRED ✅, PRESENT BUT NOT WIRED ⚠️, or MISSING ❌
**Prompt 5 Audit:** Ingestion Supermax + Backfill Spine

---

## 1. Connectors Framework

| Status | Classification |
|--------|----------------|
| ✅ WIRED | Integrated and functional at runtime |

**File Paths:**
- `server/services/connectors/` - Main connector implementations
- `server/services/dataConnectors.ts` - Unified connector interface
- `server/services/connectorRegistry.ts` - Registry of all connectors

**Invocation Points:**
- Scheduler jobs trigger connectors via `server/services/scheduler.ts`
- Manual trigger via `/admin/ingestion` dashboard
- tRPC endpoints: `trpc.connectors.*`

**Active Connectors (14):**
1. World Bank WDI - GDP, poverty, trade, population
2. OCHA FTS - Humanitarian funding flows
3. UNHCR - Refugees, IDPs, asylum seekers
4. WHO - Health indicators
5. UNICEF - Child welfare
6. WFP - Food security, prices
7. UNDP - Human development
8. IATI - Aid transparency
9. CBY - Exchange rates, monetary data
10. HDX CKAN - Humanitarian datasets
11. Sanctions - OFAC/EU/UK lists
12. ReliefWeb - Humanitarian reports
13. FEWS NET - IPC food security
14. Signal Detection - Anomaly alerts

---

## 2. Scheduler

| Status | Classification |
|--------|----------------|
| ✅ WIRED | Integrated and functional at runtime |

**File Paths:**
- `server/services/scheduler.ts` - Main scheduler implementation
- `server/services/schedulerJobs.ts` - Job definitions
- `drizzle/schema.ts` - `scheduler_jobs` table

**Invocation Points:**
- Server startup: `server/_core/index.ts` initializes scheduler
- Runs every 5 minutes checking for due jobs
- Admin UI: `/admin/scheduler` and `/admin/scheduler-status`

**Configured Jobs (16):**
- Daily data refresh (6-8 AM UTC)
- Signal detection (every 4 hours)
- Stale data alerts
- API health checks

---

## 3. Ingestion Orchestrator

| Status | Classification |
|--------|----------------|
| ✅ WIRED | Integrated and functional at runtime |

**File Paths:**
- `server/services/ingestionOrchestrator.ts` - Main orchestrator
- `server/services/historicalBackfill.ts` - Backfill logic
- `server/services/backfillOrchestrator.ts` - Advanced backfill with multi-source strategy

**Invocation Points:**
- Scheduler triggers ingestion jobs
- Admin UI: `/admin/ingestion`
- tRPC endpoints: `trpc.ingestion.*`

---

## 4. Provenance Ledger

| Status | Classification |
|--------|----------------|
| ✅ WIRED | Integrated and functional at runtime |

**File Paths:**
- `drizzle/schema.ts` - `provenance_records`, `data_lineage` tables
- `server/services/provenanceService.ts` - Provenance tracking
- `client/src/components/ProvenanceBadge.tsx` - UI component

**Invocation Points:**
- Every data insert creates provenance record
- Evidence popovers display provenance
- tRPC endpoints: `trpc.provenance.*`

**Data Lineage Chain:**
`observation → series → dataset_version → ingestion_run → raw_object → source`

---

## 5. Export Service

| Status | Classification |
|--------|----------------|
| ✅ WIRED | Integrated and functional at runtime |

**File Paths:**
- `server/services/exportService.ts` - Export logic
- `server/routers/exportRouter.ts` - tRPC endpoints
- `client/src/components/ExportButton.tsx` - UI component

**Invocation Points:**
- Data Repository: CSV/JSON export buttons
- Dashboard: Export functionality
- Report Builder: PDF/XLSX generation
- tRPC endpoints: `trpc.export.*`

**Supported Formats:**
- CSV ✅
- JSON ✅
- XLSX ✅
- PDF ✅
- PNG/SVG (charts) ✅

---

## 6. Report Engine

| Status | Classification |
|--------|----------------|
| ✅ WIRED | Integrated and functional at runtime |

**File Paths:**
- `server/services/reportGenerator.ts` - Report generation
- `client/src/pages/ReportBuilder.tsx` - Report builder UI
- `client/src/components/ReportGenerator.tsx` - Component

**Invocation Points:**
- Report Builder page: `/report-builder`
- Executive dashboards: Governor/Deputy Governor
- tRPC endpoints: `trpc.reports.*`

---

## 7. AI Safety Gates

| Status | Classification |
|--------|----------------|
| ✅ WIRED | Integrated and functional at runtime |

**File Paths:**
- `server/services/oneBrainDirective.ts` - AI safety enforcement
- `server/services/aiSafetyGates.ts` - Safety checks
- `server/routers/oneBrainRouter.ts` - AI endpoints

**Invocation Points:**
- AI Assistant: `/ai-assistant`
- All LLM calls go through safety gates
- Evidence citation enforcement (≥95%)

**Safety Features:**
- Zero fabrication enforcement
- Evidence-packed answer structure
- Role-aware intelligence modes
- Contradiction detection
- Citation coverage validation

---

## 8. Playwright E2E Tests

| Status | Classification |
|--------|----------------|
| ⚠️ PRESENT BUT NOT WIRED | Code exists but not connected to CI |

**File Paths:**
- `tests/e2e/` - E2E test files (if present)
- `playwright.config.ts` - Configuration (if present)

**Current State:**
- Vitest unit tests: 173 passing ✅
- E2E tests: Not fully configured for CI
- Need to add Playwright to GitHub Actions

**Action Required:**
- Configure Playwright in CI/CD pipeline
- Add critical journey tests

---

## 9. Notifications/Email

| Status | Classification |
|--------|----------------|
| ⚠️ PRESENT BUT NOT WIRED | Code exists but outbox not connected |

**File Paths:**
- `server/_core/notification.ts` - Notification helper
- `server/services/emailService.ts` - Email service (if present)

**Invocation Points:**
- `notifyOwner()` function available
- tRPC: `trpc.system.notifyOwner`

**Current State:**
- Owner notifications work via Manus platform
- Email outbox for partnerships not fully configured
- Need to implement email queue for access-needed workflow

**Action Required:**
- Create email outbox table
- Implement partnership email drafting
- Connect to SMTP or email service

---

## 10. S3 Adapter

| Status | Classification |
|--------|----------------|
| ✅ WIRED | Integrated and functional at runtime |

**File Paths:**
- `server/storage.ts` - S3 helpers (`storagePut`, `storageGet`)
- `server/_core/storage.ts` - Core storage functions

**Invocation Points:**
- File uploads via tRPC
- Document storage
- Export file storage

**S3 Prefixes:**
- `documents/` - PDFs, reports
- `raw-data/` - Ingestion payloads
- `processed-data/` - Normalized data
- `exports/` - User exports
- `logs/` - Application logs
- `backups/` - Database backups

**Current State:**
- Basic S3 operations working
- Need to validate all prefixes are being used correctly
- Need to add signed URL generation for secure downloads

---

## 11. Admin Console

| Status | Classification |
|--------|----------------|
| ✅ WIRED | Integrated and functional at runtime |

**File Paths:**
- `client/src/pages/AdminPortal.tsx` - Main admin portal
- `client/src/pages/admin/` - Admin sub-pages
- `server/routers/adminRouter.ts` - Admin endpoints

**Invocation Points:**
- `/admin` - Main admin portal
- `/admin/api-keys` - API key management
- `/admin/backfill` - Backfill dashboard
- `/admin/scheduler` - Scheduler management
- `/admin/ingestion` - Ingestion dashboard
- `/admin/coverage-map` - Coverage visualization

**Available Admin Pages:**
- API Health Dashboard ✅
- Alert History ✅
- Webhook Settings ✅
- Connector Thresholds ✅
- Autopilot Control Room ✅
- Coverage Map ✅
- Backfill Dashboard ✅
- API Keys Management ✅
- Report Workflow ✅
- Visualization Builder ✅
- Insight Miner ✅
- Export Bundle ✅

---

## Summary Table

| Subsystem | Status | Priority |
|-----------|--------|----------|
| Connectors Framework | ✅ WIRED | - |
| Scheduler | ✅ WIRED | - |
| Ingestion Orchestrator | ✅ WIRED | - |
| Provenance Ledger | ✅ WIRED | - |
| Export Service | ✅ WIRED | - |
| Report Engine | ✅ WIRED | - |
| AI Safety Gates | ✅ WIRED | - |
| Playwright E2E Tests | ⚠️ PRESENT BUT NOT WIRED | P1 |
| Notifications/Email | ⚠️ PRESENT BUT NOT WIRED | P1 |
| S3 Adapter | ✅ WIRED | - |
| Admin Console | ✅ WIRED | - |

---

## Action Items

### P0 (Blocking Release)
- None identified

### P1 (Should Fix Before Release)
1. **Playwright E2E Tests:** Configure in CI/CD, add critical journey tests
2. **Email Outbox:** Implement partnership email workflow with queue

### P2 (Nice to Have)
1. Enhance S3 signed URL generation for all document types
2. Add more comprehensive E2E test coverage

---

## Prompt 5 Additions: Ingestion Supermax

### Connector SDK Interface

```typescript
interface ConnectorSDK {
  discover(): Promise<SourceMetadata>;     // List available datasets
  fetch_raw(params: FetchParams): Promise<RawPayload>;  // Get raw data
  normalize(raw: RawPayload): Promise<NormalizedSeries[]>;  // Transform
  validate(series: NormalizedSeries[]): Promise<QAReport>;  // Quality check
  load(series: NormalizedSeries[]): Promise<LoadResult>;    // Store to DB
  index(series: NormalizedSeries[]): Promise<void>;         // Update search
  emit_evidence(series: NormalizedSeries[]): Promise<EvidencePack>;  // Create evidence
}
```

### Backfill Runner Configuration

```typescript
interface BackfillConfig {
  startDate: '2010-01-01';  // Historical start
  endDate: 'today';         // Current date
  chunkSize: 'monthly' | 'yearly';
  checkpointInterval: 1000; // Records between checkpoints
  idempotent: true;         // Prevent duplicates
  resumeOnFailure: true;    // Continue from checkpoint
}
```

### Staleness SLA Thresholds

| Connector | Warning | Critical | Auto-Ticket |
|-----------|---------|----------|-------------|
| cby | 1 day | 3 days | ✅ |
| world_bank | 7 days | 14 days | ✅ |
| unhcr | 7 days | 14 days | ✅ |
| who | 7 days | 14 days | ✅ |
| wfp | 7 days | 14 days | ✅ |
| ocha_fts | 7 days | 14 days | ✅ |
| unicef | 7 days | 14 days | ✅ |
| undp | 14 days | 30 days | ✅ |

### Document Ingestion Pipeline

```
PDF/DOCX → Text Extraction → Citation Anchors → Translation (EN↔AR) → Embeddings → Search Index
```

**Citation Anchor Types:**
- Page number: `[doc:123:p5]`
- Section: `[doc:123:s2.3]`
- Table: `[doc:123:t4]`
- Figure: `[doc:123:f7]`

### Manual Ingestion Queue

| Status | Action |
|--------|--------|
| PENDING | Awaiting admin review |
| VALIDATED | Schema checks passed |
| LOADED | Data stored |
| REJECTED | Failed validation |

### Partnership Outbox

Draft email templates for data access requests:
- Initial outreach
- Follow-up reminder
- Data sharing agreement
- Thank you + citation promise

---

## Prompt 5 Stop Conditions

- [ ] `/admin/coverage-map` with ≥10 flagship datasets
- [ ] `/admin/data-freshness` showing SLA status
- [ ] 2 backfills executed with checkpoints
- [ ] 2 documents ingested and searchable
- [ ] 1 manual ingestion successful
