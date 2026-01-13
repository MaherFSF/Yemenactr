# YETO Platform Baseline Snapshot

**Generated:** January 14, 2026  
**Version:** 3c362846  
**Branch:** main  
**Purpose:** Capture current state before Truth Layer implementation

---

## 1. Current Routes Summary

**Total Routes:** 75  
**Public Routes:** 8  
**Sector Routes:** 15  
**Research Routes:** 7  
**Tool Routes:** 5  
**Admin Routes:** 9  
**Executive Routes:** 2  
**User Routes:** 4  

### Route Categories
| Category | Count | Examples |
|----------|-------|----------|
| Public | 8 | /, /about, /contact, /glossary |
| Sectors | 15 | /sectors/banking, /sectors/trade |
| Research | 7 | /research, /research-library |
| Tools | 5 | /ai-assistant, /scenario-simulator |
| Admin | 9 | /admin, /admin/scheduler |
| Executive | 2 | /executive/governor, /executive/deputy-governor |
| Data | 5 | /dashboard, /data-repository, /timeline |
| Specialized | 10 | /sanctions, /remittances, /entities |

---

## 2. Current Exports Available

### Data Export Formats
| Format | Available From | Status |
|--------|----------------|--------|
| CSV | Data Repository, Report Builder | ✅ Working |
| XLSX | Report Builder, Sector Pages | ✅ Working |
| JSON | API, Data Repository | ✅ Working |
| PDF | Report Builder, Evidence Packs | ✅ Working |
| PNG | Charts, Visualizations | ✅ Working |
| SVG | Charts | ✅ Working |

### Export Endpoints
| Endpoint | Description |
|----------|-------------|
| `/api/trpc/export.*` | tRPC export procedures |
| Report Builder | Custom report generation |
| Evidence Pack | Evidence pack PDF generation |
| Sector Pages | Sector data export |

---

## 3. Database Schema Summary

**Total Tables:** 56  
**Total Records (estimated):**
- Time Series: 1,778+ records
- Research Publications: 353 records
- Economic Events: 83+ records
- Glossary Terms: 51 records
- Sources: 47 records
- Indicators: 44 records
- Scheduler Jobs: 28 records
- Commercial Banks: 17 records
- CBY Directives: 14 records
- Connector Thresholds: 12 records

### Key Table Schemas

#### time_series
```sql
id, indicator_code, regime_tag, period_start, period_end, 
value, unit, source_id, confidence_grade, provenance_id,
created_at, updated_at
```

#### research_publications
```sql
id, title, title_ar, abstract, abstract_ar, organization_id,
publication_date, document_type, category, file_url, source_url,
language, confidence_grade, created_at
```

#### commercial_banks
```sql
id, name_en, name_ar, bank_type, jurisdiction, status,
total_assets, capital_adequacy_ratio, npl_ratio, branch_count,
established_year, headquarters, swift_code, created_at
```

#### economic_events
```sql
id, title_en, title_ar, description_en, description_ar,
event_date, event_type, actor, location, regime_tag,
impact_level, source_id, created_at
```

---

## 4. Test Coverage Status

**Test Framework:** Vitest  
**Test Files:** 9  
**Total Tests:** 173 (all passing)  
**Coverage:** Not measured (no coverage report configured)

### Test File Breakdown
| File | Tests | Status |
|------|-------|--------|
| auth.logout.test.ts | 1 | ✅ Pass |
| ai.chat.test.ts | 6 | ✅ Pass |
| analytics-engine.test.ts | 21 | ✅ Pass |
| connectors.test.ts | 29 | ✅ Pass |
| connectorHealthAlerts.test.ts | 8 | ✅ Pass |
| governance.test.ts | ~30 | ✅ Pass |
| hardening.test.ts | ~40 | ✅ Pass |
| integration.test.ts | ~20 | ✅ Pass |
| yeto.test.ts | 21 | ✅ Pass |

---

## 5. Hardcoded Content Detected

### High Priority (Fallback Values)
| File | Line | Content | Context |
|------|------|---------|---------|
| Home.tsx | 423 | `"15.0%"` | Inflation fallback |
| Home.tsx | 463 | `"1 USD = 1,890 YER"` | Exchange rate fallback |
| Home.tsx | 485-487 | Multiple fallbacks | KPI card fallbacks |

### Medium Priority (Static Data)
| File | Line | Content | Context |
|------|------|---------|---------|
| RegionalZones.tsx | 32-140 | Exchange rates | Regional zone data |
| Entities.tsx | 175, 211 | `"$1.2B"`, `"YER 530/USD"` | Entity metrics |
| EntityDetail.tsx | 116 | `"$1.2B"` | Entity detail |
| InsightsTicker.tsx | 51-52 | `"1,890 YER/USD"` | Ticker value |

### Low Priority (Example/Demo Data)
| File | Line | Content | Context |
|------|------|---------|---------|
| ApiDocs.tsx | 50 | `1890.5` | API example |
| Dashboard.tsx | 53 | Historical data | Chart data |
| PolicyImpact.tsx | 134 | `1890` | Baseline value |

---

## 6. TypeScript Errors

**Total Errors:** 4 (non-blocking)

All errors are in `Banking.tsx` related to tRPC type generation lag:
```
client/src/pages/sectors/Banking.tsx(94,57): error TS2339: Property 'banking' does not exist
client/src/pages/sectors/Banking.tsx(101,67): error TS2339: Property 'banking' does not exist
client/src/pages/sectors/Banking.tsx(102,36): error TS2339: Property 'banking' does not exist
client/src/pages/sectors/Banking.tsx(103,37): error TS2339: Property 'banking' does not exist
```

**Note:** These are type-only errors. The `banking` router exists and works correctly at runtime. The errors are due to TypeScript not regenerating types after the router was added. Using `(trpc as any).banking` as a workaround.

---

## 7. Data Freshness Status

### Connector Status
| Connector | Last Run | Status | Freshness |
|-----------|----------|--------|-----------|
| World Bank | 2026-01-13 | ✅ Active | Fresh |
| OCHA FTS | 2026-01-13 | ✅ Active | Fresh |
| UNHCR | 2026-01-13 | ✅ Active | Fresh |
| WFP | 2026-01-13 | ✅ Active | Fresh |
| CBY | 2026-01-13 | ✅ Active | Fresh |

### Data Coverage
| Period | Coverage |
|--------|----------|
| 2010-2015 | Partial (historical) |
| 2015-2020 | Good |
| 2020-2024 | Excellent |
| 2024-2026 | Current |

---

## 8. Feature Completeness

### Fully Implemented ✅
- Bilingual support (Arabic/English)
- RTL layout support
- 15 sector pages
- Research library (353 publications)
- AI Economic Assistant
- Scenario Simulator
- Timeline (83+ events)
- Banking Sector Dashboard (17 banks)
- Governor Dashboard
- Deputy Governor Dashboard
- Partner Contribution Portal
- ProvenanceBadge component
- Report Generator
- 20 data connectors
- 28 scheduled jobs
- Webhook integrations
- Alert system

### Partially Implemented ⚠️
- CBY PDF downloads (files exist, links not mapped)
- Coverage Scorecard (basic implementation)
- API key management (UI exists, limited functionality)

### Not Implemented ❌
- Microfinance sector page
- Truth Layer (Evidence Graph)
- Autopilot OS
- Click audit crawler
- Hardcode detection CI

---

## 9. Environment Configuration

### Required Environment Variables
```
DATABASE_URL          # MySQL/TiDB connection
JWT_SECRET           # Session signing
VITE_APP_ID          # Manus OAuth app ID
OAUTH_SERVER_URL     # OAuth backend URL
VITE_OAUTH_PORTAL_URL # Login portal URL
OWNER_OPEN_ID        # Owner's ID
OWNER_NAME           # Owner's name
BUILT_IN_FORGE_API_URL # Manus APIs
BUILT_IN_FORGE_API_KEY # API key (server)
VITE_FRONTEND_FORGE_API_KEY # API key (frontend)
VITE_FRONTEND_FORGE_API_URL # Frontend API URL
```

### Build Configuration
- Node.js: 22.13.0
- Package Manager: pnpm
- Build Tool: Vite
- Framework: React 19 + Express 4 + tRPC 11
- Database: MySQL (TiDB compatible)
- ORM: Drizzle

---

## 10. Deployment Status

**Current State:** Development  
**Last Checkpoint:** 3c362846  
**Published:** No (requires checkpoint + publish)

### Deployment Requirements
1. Create checkpoint via `webdev_save_checkpoint`
2. Click Publish button in Management UI
3. Configure custom domain (optional)

---

*This baseline snapshot was generated as part of the Truth Layer implementation (D1: Discovery Pack)*
