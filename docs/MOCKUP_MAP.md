# YETO Platform - Mockup Map

This document maps each mockup image to its corresponding route, components, UI behaviors, data sources, and acceptance criteria.

---

## Mockup Sources

### External iCloud Links
- **Link 1**: https://share.icloud.com/photos/060BwSAsLo3yw99bUbFbjtS6w (83 images)
- **Link 2**: https://share.icloud.com/photos/0f7lzzeu2QPngu44MuFMNIsjA
- **Status**: Download in progress, images to be stored in `/assets/mockups/external/`

### Uploaded Mockups
- Location: `/assets/mockups/`
- Status: Pending inventory

---

## Mockup Inventory

### Landing Page / Home

| Mockup File | Route | Components | Data Sources | Acceptance Criteria |
|-------------|-------|------------|--------------|---------------------|
| `home-hero.png` | `/` | Hero section, CauseWay logo, CTA buttons | Static content | Hero matches mockup layout, RTL alignment correct |
| `home-stats.png` | `/` | Stats cards (15+ sectors, 500+ indicators, 100+ sources, 2014-Now) | Platform stats API | Numbers display correctly, icons match |
| `home-sectors.png` | `/` | Sector grid cards with icons | Sector list | All 15 sectors displayed with correct icons |
| `home-features.png` | `/` | Feature highlights section | Static content | Layout matches mockup |

**Implementation**: `client/src/pages/Home.tsx`

---

### Dashboard

| Mockup File | Route | Components | Data Sources | Acceptance Criteria |
|-------------|-------|------------|--------------|---------------------|
| `dashboard-overview.png` | `/dashboard` | KPI cards, regime comparison, charts | `trpc.analytics.*` | KPI cards show value, delta, sparkline, evidence link |
| `dashboard-filters.png` | `/dashboard` | Filter panel (time, geo, sector) | Filter state | Filters persist and update data |
| `dashboard-charts.png` | `/dashboard` | Line/bar charts with export controls | Time series API | Charts render correctly, export works |

**Implementation**: `client/src/pages/Dashboard.tsx`

---

### Data Repository

| Mockup File | Route | Components | Data Sources | Acceptance Criteria |
|-------------|-------|------------|--------------|---------------------|
| `data-repo-list.png` | `/data` | Dataset cards with badges | `trpc.data.list` | Cards show Verified/Provisional badges |
| `data-repo-filters.png` | `/data` | Advanced filter panel | Filter state | All filter options work |
| `data-repo-preview.png` | `/data` | Dataset preview modal | Dataset API | Preview shows sample data |

**Implementation**: `client/src/pages/DataRepository.tsx`

---

### Research Library

| Mockup File | Route | Components | Data Sources | Acceptance Criteria |
|-------------|-------|------------|--------------|---------------------|
| `research-hub.png` | `/research` | Category sidebar, document cards | `trpc.research.list` | Categories filter documents |
| `research-card.png` | `/research` | Document card with metadata | Document API | Shows title, date, source, downloads |
| `research-detail.png` | `/research/:id` | Document viewer, evidence pack | Document API | Full document with citations |

**Implementation**: `client/src/pages/Research.tsx`

---

### AI Assistant

| Mockup File | Route | Components | Data Sources | Acceptance Criteria |
|-------------|-------|------------|--------------|---------------------|
| `ai-chat.png` | `/ai-assistant` | Chat panel, message history | `trpc.ai.query` | Messages display with evidence |
| `ai-capabilities.png` | `/ai-assistant` | Capability panel, suggested prompts | Static + AI | Capabilities listed correctly |
| `ai-evidence.png` | `/ai-assistant` | Evidence pack modal | Evidence API | Full provenance displayed |

**Implementation**: `client/src/pages/AIAssistant.tsx`

---

### Scenario Simulator

| Mockup File | Route | Components | Data Sources | Acceptance Criteria |
|-------------|-------|------------|--------------|---------------------|
| `scenario-templates.png` | `/scenario-simulator` | Template cards | Template list | Templates selectable |
| `scenario-sliders.png` | `/scenario-simulator` | Assumption sliders | Model parameters | Sliders update projections |
| `scenario-results.png` | `/scenario-simulator` | Projection charts, sensitivity | Model output | Charts show uncertainty bands |

**Implementation**: `client/src/pages/ScenarioSimulator.tsx`

---

### Sector Pages

| Mockup File | Route | Components | Data Sources | Acceptance Criteria |
|-------------|-------|------------|--------------|---------------------|
| `sector-banking.png` | `/sectors/banking` | Sector dashboard, regime split | Sector API | Aden vs Sana'a comparison |
| `sector-trade.png` | `/sectors/trade` | Trade flow charts | Trade data | Import/export visualization |
| `sector-prices.png` | `/sectors/prices` | Price index charts | Price data | Commodity prices displayed |

**Implementation**: `client/src/pages/sectors/*.tsx`

---

### Timeline

| Mockup File | Route | Components | Data Sources | Acceptance Criteria |
|-------------|-------|------------|--------------|---------------------|
| `timeline-view.png` | `/timeline` | Interactive timeline | Events API | Events filterable by type |
| `timeline-event.png` | `/timeline` | Event detail card | Event API | Full event with evidence |

**Implementation**: `client/src/pages/Timeline.tsx`

---

### Entity Profiles

| Mockup File | Route | Components | Data Sources | Acceptance Criteria |
|-------------|-------|------------|--------------|---------------------|
| `entity-list.png` | `/entities` | Entity cards grid | Entity API | All entities displayed |
| `entity-profile.png` | `/entities/:slug` | Profile page, relationships | Entity API | Ownership structure shown |
| `entity-hsa.png` | `/entities/hsa-group` | HSA Group profile | HSA data | Verified facts only |

**Implementation**: `client/src/pages/Entities.tsx`

---

### Admin Console

| Mockup File | Route | Components | Data Sources | Acceptance Criteria |
|-------------|-------|------------|--------------|---------------------|
| `admin-dashboard.png` | `/admin` | Operations overview | Admin API | Health metrics displayed |
| `admin-ingestion.png` | `/admin/ingestion` | Pipeline status, logs | Ingestion API | Job status visible |
| `admin-quality.png` | `/admin/quality` | QA alerts, coverage heatmap | QA API | Alerts actionable |
| `admin-sources.png` | `/admin/sources` | Source registry | Sources API | CRUD operations work |

**Implementation**: `client/src/pages/AdminPortal.tsx`

---

### Partner Portal

| Mockup File | Route | Components | Data Sources | Acceptance Criteria |
|-------------|-------|------------|--------------|---------------------|
| `partner-upload.png` | `/partner/upload` | File upload form | Upload API | Files validated |
| `partner-submissions.png` | `/partner/submissions` | Submission list | Submissions API | Status tracking works |

**Implementation**: `client/src/pages/PartnerPortal.tsx`

---

### Subscription / Pricing

| Mockup File | Route | Components | Data Sources | Acceptance Criteria |
|-------------|-------|------------|--------------|---------------------|
| `pricing-tiers.png` | `/pricing` | Tier cards with features | Static | All tiers displayed |
| `pricing-comparison.png` | `/pricing` | Feature comparison table | Static | Features listed correctly |

**Implementation**: `client/src/pages/Pricing.tsx`

---

## Design System Components

### Shared Components

| Component | Mockup Reference | Props | Usage |
|-----------|------------------|-------|-------|
| `Header` | All pages | `locale`, `user` | Navigation, language switch |
| `Footer` | All pages | `locale` | Links, contact info |
| `KPICard` | Dashboard, Sectors | `value`, `delta`, `sparkline`, `evidenceId` | Metric display |
| `FilterPanel` | Data, Dashboard | `filters`, `onChange` | Data filtering |
| `EvidenceModal` | All data pages | `evidencePackId` | Provenance display |
| `ChartContainer` | Dashboard, Sectors | `data`, `type`, `exportable` | Chart wrapper |

---

## Deviations Log

Any deviations from mockups must be documented here with rationale.

| Mockup | Deviation | Rationale | Approved |
|--------|-----------|-----------|----------|
| None documented yet | - | - | - |

---

## Vendor Name Redactions

Per compliance requirements, any AI vendor names in mockups are replaced with "AI".

| Original Text | Replacement | Location |
|---------------|-------------|----------|
| Any vendor name | "AI" | Throughout |

---

*Last updated: December 2024*
