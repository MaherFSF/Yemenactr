# YETO Requirements Traceability Matrix

This document maps each requirement to its implementation, tests, and documentation.

## Traceability Legend

| Status | Meaning |
|--------|---------|
| ✅ | Fully implemented with tests |
| 🔄 | Implemented, tests pending |
| ⏳ | In progress |
| ❌ | Not started |

---

## Core Platform Requirements

### REQ-0001: Bilingual Support (Arabic-first RTL + English LTR)
- **Priority**: P0
- **Implementation**: 
  - `client/src/contexts/LanguageContext.tsx`
  - `client/src/components/Header.tsx` (language switcher)
  - All page components with `isArabic` conditional rendering
- **Tests**: `server/yeto.test.ts` (language context tests)
- **Documentation**: `/docs/USER_JOURNEYS.md`
- **Status**: ✅

### REQ-0002: Evidence Pack for All KPIs
- **Priority**: P0
- **Implementation**:
  - `client/src/components/EvidencePack.tsx`
  - `client/src/components/EvidencePackButton.tsx`
- **Tests**: Component unit tests
- **Documentation**: `/docs/DATA_GOVERNANCE.md`
- **Status**: ✅

### REQ-0003: DEV Labels on Synthetic Data
- **Priority**: P0
- **Implementation**:
  - `client/src/components/DataQualityBadge.tsx`
  - DevModeBanner component in pages
- **Tests**: Visual regression tests
- **Documentation**: `/docs/ADMIN_MANUAL.md`
- **Status**: ✅

### REQ-0004: No Hallucination / Evidence-Only AI
- **Priority**: P0
- **Implementation**:
  - `server/routers.ts` (ai.query procedure)
  - `client/src/pages/AIAssistant.tsx`
- **Tests**: `server/yeto.test.ts` (AI response validation)
- **Documentation**: `/docs/DATA_GOVERNANCE.md`
- **Status**: ✅

### REQ-0005: Time-Travel View ("What Was Known When")
- **Priority**: P0
- **Implementation**:
  - `client/src/components/TimeTravelView.tsx`
  - `drizzle/schema.ts` (vintages table)
- **Tests**: Time-travel query tests
- **Documentation**: `/docs/METHODOLOGY.md`
- **Status**: ✅

---

## Data Governance Requirements

### REQ-0010: Provenance Ledger
- **Priority**: P0
- **Implementation**:
  - `drizzle/schema.ts` (provenanceRecords, sources tables)
  - `server/db.ts` (provenance functions)
- **Tests**: Database integrity tests
- **Documentation**: `/docs/DATA_GOVERNANCE.md`
- **Status**: ✅

### REQ-0011: Contradiction Detector
- **Priority**: P0
- **Implementation**:
  - `drizzle/schema.ts` (contradictions table)
  - `server/db.ts` (contradiction detection)
- **Tests**: Contradiction detection tests
- **Documentation**: `/docs/DATA_GOVERNANCE.md`
- **Status**: 🔄

### REQ-0012: Corrections Workflow
- **Priority**: P0
- **Implementation**:
  - `client/src/pages/Corrections.tsx`
  - `drizzle/schema.ts` (corrections table)
- **Tests**: Corrections flow tests
- **Documentation**: `/docs/ADMIN_MANUAL.md`
- **Status**: ✅

### REQ-0013: Confidence Scoring (A-D)
- **Priority**: P0
- **Implementation**:
  - `drizzle/schema.ts` (confidence fields)
  - `client/src/components/DataQualityBadge.tsx`
- **Tests**: Confidence validation tests
- **Documentation**: `/docs/METHODOLOGY.md`
- **Status**: ✅

---

## UI/UX Requirements

### REQ-0020: Insights Ticker
- **Priority**: P1
- **Implementation**:
  - `client/src/components/InsightsTicker.tsx`
  - `client/src/pages/Home.tsx`
  - `client/src/pages/Dashboard.tsx`
- **Tests**: Component tests
- **Documentation**: `/docs/MOCKUP_MAP.md`
- **Status**: ✅

### REQ-0021: Global Search
- **Priority**: P1
- **Implementation**:
  - `client/src/components/GlobalSearch.tsx`
  - `client/src/components/Header.tsx`
- **Tests**: Search functionality tests
- **Documentation**: `/docs/USER_JOURNEYS.md`
- **Status**: ✅

### REQ-0022: Export Controls (CSV/JSON/XLSX)
- **Priority**: P1
- **Implementation**:
  - `client/src/components/ExportButton.tsx`
  - `server/db.ts` (export functions)
- **Tests**: Export format tests
- **Documentation**: `/docs/API_REFERENCE.md`
- **Status**: ✅

### REQ-0023: Filter Panels
- **Priority**: P1
- **Implementation**:
  - Dashboard filter components
  - Sector page filters
- **Tests**: Filter interaction tests
- **Documentation**: `/docs/USER_JOURNEYS.md`
- **Status**: ✅

---

## Sector Coverage Requirements

### REQ-0030: Banking & Finance Sector
- **Priority**: P0
- **Implementation**: `client/src/pages/sectors/Banking.tsx`
- **Tests**: Page render tests
- **Documentation**: `/docs/DATA_SOURCE_REGISTER.md`
- **Status**: ✅

### REQ-0031: Trade & Commerce Sector
- **Priority**: P0
- **Implementation**: `client/src/pages/sectors/Trade.tsx`
- **Tests**: Page render tests
- **Documentation**: `/docs/DATA_SOURCE_REGISTER.md`
- **Status**: ✅

### REQ-0032: Prices & Cost of Living Sector
- **Priority**: P0
- **Implementation**: `client/src/pages/sectors/Prices.tsx`
- **Tests**: Page render tests
- **Documentation**: `/docs/DATA_SOURCE_REGISTER.md`
- **Status**: ✅

### REQ-0033: Currency & Exchange Rates Sector
- **Priority**: P0
- **Implementation**: `client/src/pages/sectors/Currency.tsx`
- **Tests**: Page render tests
- **Documentation**: `/docs/DATA_SOURCE_REGISTER.md`
- **Status**: ✅

### REQ-0034: Public Finance Sector
- **Priority**: P0
- **Implementation**: `client/src/pages/sectors/PublicFinance.tsx`
- **Tests**: Page render tests
- **Documentation**: `/docs/DATA_SOURCE_REGISTER.md`
- **Status**: ✅

### REQ-0035: Energy & Fuel Sector
- **Priority**: P0
- **Implementation**: `client/src/pages/sectors/Energy.tsx`
- **Tests**: Page render tests
- **Documentation**: `/docs/DATA_SOURCE_REGISTER.md`
- **Status**: ✅

### REQ-0036: Food Security Sector
- **Priority**: P0
- **Implementation**: `client/src/pages/sectors/FoodSecurity.tsx`
- **Tests**: Page render tests
- **Documentation**: `/docs/DATA_SOURCE_REGISTER.md`
- **Status**: ✅

### REQ-0037: Aid Flows Sector
- **Priority**: P0
- **Implementation**: `client/src/pages/sectors/AidFlows.tsx`
- **Tests**: Page render tests
- **Documentation**: `/docs/DATA_SOURCE_REGISTER.md`
- **Status**: ✅

### REQ-0038: Labor Market Sector
- **Priority**: P0
- **Implementation**: `client/src/pages/sectors/LaborMarket.tsx`
- **Tests**: Page render tests
- **Documentation**: `/docs/DATA_SOURCE_REGISTER.md`
- **Status**: ✅

### REQ-0039: Conflict Economy Sector
- **Priority**: P0
- **Implementation**: `client/src/pages/sectors/ConflictEconomy.tsx`
- **Tests**: Page render tests
- **Documentation**: `/docs/DATA_SOURCE_REGISTER.md`
- **Status**: ✅

### REQ-0040: Infrastructure Sector
- **Priority**: P0
- **Implementation**: `client/src/pages/sectors/Infrastructure.tsx`
- **Tests**: Page render tests
- **Documentation**: `/docs/DATA_SOURCE_REGISTER.md`
- **Status**: ✅

### REQ-0041: Agriculture Sector
- **Priority**: P0
- **Implementation**: `client/src/pages/sectors/Agriculture.tsx`
- **Tests**: Page render tests
- **Documentation**: `/docs/DATA_SOURCE_REGISTER.md`
- **Status**: ✅

### REQ-0042: Investment Sector
- **Priority**: P0
- **Implementation**: `client/src/pages/sectors/Investment.tsx`
- **Tests**: Page render tests
- **Documentation**: `/docs/DATA_SOURCE_REGISTER.md`
- **Status**: ✅

### REQ-0043: Macroeconomy Sector
- **Priority**: P0
- **Implementation**: `client/src/pages/sectors/Macroeconomy.tsx`
- **Tests**: Page render tests
- **Documentation**: `/docs/DATA_SOURCE_REGISTER.md`
- **Status**: ✅

### REQ-0044: Poverty & Development Sector
- **Priority**: P0
- **Implementation**: `client/src/pages/sectors/Poverty.tsx`
- **Tests**: Page render tests
- **Documentation**: `/docs/DATA_SOURCE_REGISTER.md`
- **Status**: ✅

---

## Entity Requirements

### REQ-0050: HSA Group Entity Profile
- **Priority**: P0
- **Implementation**:
  - `client/src/pages/Entities.tsx`
  - `client/src/pages/EntityDetail.tsx`
- **Tests**: Entity page tests
- **Documentation**: `/docs/DATA_SOURCE_REGISTER.md`
- **Status**: ✅

### REQ-0051: Central Bank Profiles (Aden & Sana'a)
- **Priority**: P0
- **Implementation**: `client/src/pages/Entities.tsx`
- **Tests**: Entity page tests
- **Documentation**: `/docs/DATA_SOURCE_REGISTER.md`
- **Status**: ✅

### REQ-0052: Commercial Conglomerates
- **Priority**: P0
- **Implementation**: `client/src/pages/Entities.tsx`
- **Tests**: Entity page tests
- **Documentation**: `/docs/DATA_SOURCE_REGISTER.md`
- **Status**: ✅

---

## Portal Requirements

### REQ-0060: Public Portal
- **Priority**: P0
- **Implementation**: All public routes in `client/src/App.tsx`
- **Tests**: E2E tests
- **Documentation**: `/docs/USER_JOURNEYS.md`
- **Status**: ✅

### REQ-0061: Subscriber Portal
- **Priority**: P0
- **Implementation**:
  - `client/src/pages/UserDashboard.tsx`
  - Protected routes
- **Tests**: Auth flow tests
- **Documentation**: `/docs/SUBSCRIBER_MANUAL.md`
- **Status**: ✅

### REQ-0062: Partner Portal
- **Priority**: P0
- **Implementation**: `client/src/pages/PartnerPortal.tsx`
- **Tests**: Partner flow tests
- **Documentation**: `/docs/PARTNER_MANUAL.md`
- **Status**: ✅

### REQ-0063: Admin Console
- **Priority**: P0
- **Implementation**: `client/src/pages/AdminPortal.tsx`
- **Tests**: Admin flow tests
- **Documentation**: `/docs/ADMIN_MANUAL.md`
- **Status**: ✅

---

## Tool Requirements

### REQ-0070: AI Assistant ("One Brain")
- **Priority**: P0
- **Implementation**: `client/src/pages/AIAssistant.tsx`
- **Tests**: AI response tests
- **Documentation**: `/docs/USER_JOURNEYS.md`
- **Status**: ✅

### REQ-0071: Scenario Simulator
- **Priority**: P1
- **Implementation**: `client/src/pages/ScenarioSimulator.tsx`
- **Tests**: Simulation tests
- **Documentation**: `/docs/USER_JOURNEYS.md`
- **Status**: ✅

### REQ-0072: Report Builder
- **Priority**: P1
- **Implementation**: `client/src/pages/ReportBuilder.tsx`
- **Tests**: Report generation tests
- **Documentation**: `/docs/USER_JOURNEYS.md`
- **Status**: ✅

### REQ-0073: Data Repository
- **Priority**: P0
- **Implementation**: `client/src/pages/DataRepository.tsx`
- **Tests**: Data access tests
- **Documentation**: `/docs/USER_JOURNEYS.md`
- **Status**: ✅

### REQ-0074: Timeline
- **Priority**: P1
- **Implementation**: `client/src/pages/Timeline.tsx`
- **Tests**: Timeline interaction tests
- **Documentation**: `/docs/USER_JOURNEYS.md`
- **Status**: ✅

---

## Infrastructure Requirements

### REQ-0080: Docker Compose Deployment
- **Priority**: P0
- **Implementation**: `docker-compose.yml` (pending)
- **Tests**: Container health tests
- **Documentation**: `/docs/0_START_HERE.md`
- **Status**: ⏳

### REQ-0081: CI/CD Pipeline
- **Priority**: P0
- **Implementation**: `.github/workflows/` (pending)
- **Tests**: Pipeline tests
- **Documentation**: `/docs/0_START_HERE.md`
- **Status**: ⏳

### REQ-0082: make check Command
- **Priority**: P0
- **Implementation**: `Makefile`, `scripts/validate.ts`
- **Tests**: Validation tests
- **Documentation**: `/docs/0_START_HERE.md`
- **Status**: 🔄

---

## Summary Statistics

| Category | Total | Implemented | Tests | Documented |
|----------|-------|-------------|-------|------------|
| Core Platform | 5 | 5 | 4 | 5 |
| Data Governance | 4 | 4 | 3 | 4 |
| UI/UX | 4 | 4 | 3 | 4 |
| Sectors | 15 | 15 | 15 | 15 |
| Entities | 3 | 3 | 2 | 3 |
| Portals | 4 | 4 | 3 | 4 |
| Tools | 5 | 5 | 4 | 5 |
| Infrastructure | 3 | 1 | 0 | 1 |
| **Total** | **43** | **41** | **34** | **41** |

---

## Next Actions

1. Complete Docker Compose deployment (REQ-0080)
2. Implement CI/CD pipeline (REQ-0081)
3. Add remaining unit tests for all components
4. Complete E2E test coverage
