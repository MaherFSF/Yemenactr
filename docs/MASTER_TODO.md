# YETO Platform - Master TODO

**Last Updated:** January 15, 2026  
**Status:** Active Development  
**Total Pages:** 85+  
**Total Tests:** 320 passing

---

## Priority Legend

| Priority | Description | Timeline |
|----------|-------------|----------|
| **P0** | Critical - Must complete before deployment | Immediate |
| **P1** | High - Core functionality | This week |
| **P2** | Medium - Important features | This month |
| **P3** | Low - Nice to have | Future |

---

## Section 1: One Brain Intelligence Directive (P0)

### 1.1 Core Intelligence Layer
- [x] Zero fabrication enforcement
- [x] Evidence-packed answer structure (9-part format)
- [x] Role-aware intelligence modes (7 roles: citizen, researcher, policymaker, donor, banker, private sector, journalist)
- [x] Knowledge graph reasoning
- [x] Scenario & futures intelligence
- [x] Data gap ticket auto-creation
- [x] Contradiction detection & disagreement mode
- [x] Governance & auditability
- [x] One Brain tRPC router

### 1.2 Visual Intelligence (P1)
- [x] Chart generation from evidence (visualIntelligence.ts)
- [x] Timeline visualization
- [x] Before/after comparison views
- [x] Annotated visuals with meaning
- [x] Bilingual chart labels (EN/AR)
- [x] RTL-correct for Arabic
- [x] Uncertainty visualization (confidence bands)
- [x] OneBrainVisual React component

### 1.3 Site-Wide Integration (P1)
- [ ] Wire One Brain to AI Chat UI (replace basic LLM)
- [ ] Add inline explanations to Dashboard KPIs
- [ ] Add "What changed" annotations to charts
- [ ] Add causal analysis to Timeline events
- [ ] Add smart narrative generation to Reports
- [ ] Add uncertainty explanations to Scenario Simulator
- [ ] Add interpreted alerts to Notifications

### 1.4 Articulation Quality (P2)
- [ ] Remove generic AI phrasing ("As of...", "It's important to note...")
- [ ] Implement calm, precise, intentional writing style
- [ ] Add "why" explanations, not just "what"
- [ ] Ensure confident but restrained tone
- [ ] Clear uncertainty communication

### 1.5 Governance & Audit (P1)
- [ ] Prompt versioning registry
- [ ] Retrieval logging for all queries
- [ ] Output auditing (store all AI responses)
- [ ] Admin override for sensitive topics
- [ ] Evidence inspection ("Show me how you know")
- [ ] Learning governance (approved sources only)

---

## Section 2: ML Systems Integration (P1)

### 2.1 Real-time ML Pipeline
- [x] Feature engineering (lag, rolling, seasonal)
- [x] Online learning system
- [x] Insight generation (anomalies, trends, correlations)
- [x] Data drift detection
- [ ] Connect to live data streams
- [ ] Add ML insights widget to Dashboard

### 2.2 Semantic Glossary Intelligence
- [x] Semantic embeddings
- [x] Automatic term relationship discovery
- [x] Context-aware suggestions
- [x] Translation quality scoring
- [ ] Integrate with Glossary page
- [ ] Add "Related Terms" sidebar

### 2.3 Intelligent Timeline
- [x] Automated event detection
- [x] Causal inference engine
- [x] Event-indicator linking
- [ ] Connect to Timeline page
- [ ] Add "Impact Analysis" panel

### 2.4 Ensemble Forecasting
- [x] ARIMA, Prophet, LSTM, XGBoost models
- [x] Uncertainty quantification
- [x] Adaptive model selection
- [ ] Connect to Scenario Simulator
- [ ] Add forecast confidence bands to charts

### 2.5 Personalization Engine
- [x] User behavior tracking
- [x] Content recommendations
- [x] Role-based personalization
- [ ] Connect to User Dashboard
- [ ] Add personalized insights feed

### 2.6 ML Monitoring
- [x] Model performance tracking
- [x] Data quality monitoring
- [x] Intelligent alerting
- [ ] Add ML health panel to Admin Hub

---

## Section 3: Data Connectors & Ingestion (P0)

### 3.1 Active Connectors (Verified Working)
- [x] World Bank WDI
- [x] OCHA FTS (v1 API)
- [x] UNHCR
- [x] WHO
- [x] UNICEF
- [x] WFP
- [x] UNDP
- [x] IATI
- [x] CBY (Central Bank of Yemen)
- [x] HDX CKAN
- [x] Sanctions (OFAC/EU/UK)
- [x] ReliefWeb
- [x] FEWS NET
- [x] Signal Detection

### 3.2 Pending Connectors (P1)
- [ ] UCDP conflict events
- [ ] ACLED conflict data
- [ ] IMF WEO
- [ ] UN COMTRADE
- [ ] FAO STAT

### 3.3 Data Quality (P1)
- [x] Contradiction detector
- [x] Confidence rating A-D
- [x] Data gap tickets
- [ ] DEV/SYNTHETIC labels on placeholder data
- [ ] Data vintage timestamps on all displays

---

## Section 4: Frontend Pages (P1)

### 4.1 Core Pages (Complete)
- [x] Home
- [x] Dashboard
- [x] About
- [x] Contact
- [x] Pricing
- [x] Changelog
- [x] Sitemap (NEW)

### 4.2 Sector Pages (Complete - 16 sectors)
- [x] Banking & Finance
- [x] Microfinance
- [x] Trade & Commerce
- [x] Macroeconomy
- [x] Prices & Inflation
- [x] Currency & Exchange
- [x] Public Finance
- [x] Energy & Fuel
- [x] Food Security
- [x] Aid Flows
- [x] Labor Market
- [x] Conflict Economy
- [x] Infrastructure
- [x] Agriculture
- [x] Investment
- [x] Poverty & Development

### 4.3 Specialized Topics (Complete)
- [x] Sanctions
- [x] Remittances
- [x] Public Debt
- [x] Humanitarian Funding
- [x] Regional Zones
- [x] Economic Actors
- [x] Corporate Registry
- [x] Compliance
- [x] Policy Impact

### 4.4 Analysis Tools (Complete)
- [x] AI Assistant
- [x] Report Builder
- [x] Scenario Simulator
- [x] Comparison Tool
- [x] Data Repository
- [x] Timeline
- [x] Indicator Catalog
- [x] Advanced Search

### 4.5 Research & Knowledge (Complete)
- [x] Research Portal
- [x] Research Explorer
- [x] Research Analytics
- [x] Research Assistant
- [x] Research Library
- [x] Research Audit
- [x] Publications
- [x] Entity Profiles
- [x] Glossary
- [x] Methodology

### 4.6 Data Quality Pages (Complete)
- [x] Coverage Scorecard
- [x] Data Freshness
- [x] Accuracy Dashboard
- [x] Corrections Log
- [x] Data Exchange Hub

### 4.7 User Account (Complete)
- [x] My Dashboard
- [x] API Keys
- [x] Notification Settings

### 4.8 Executive Dashboards (Complete)
- [x] Governor Dashboard
- [x] Deputy Governor Dashboard

### 4.9 Partner Portal (Complete)
- [x] Partner Portal

### 4.10 Admin Pages (Complete - 14 pages)
- [x] Admin Hub
- [x] Admin Portal
- [x] Admin Monitoring
- [x] Scheduler Dashboard
- [x] Alerts Dashboard
- [x] API Health
- [x] Alert History
- [x] Webhook Settings
- [x] Connector Thresholds
- [x] Autopilot Control Room
- [x] Report Workflow
- [x] Visualization Builder
- [x] Insight Miner
- [x] Export Bundle

### 4.11 Legal Pages (Complete)
- [x] Legal Hub
- [x] Privacy Policy
- [x] Terms of Service
- [x] Data License
- [x] Accessibility

---

## Section 5: Backend & API (P1)

### 5.1 tRPC Routers (Complete)
- [x] Auth router
- [x] Indicators router
- [x] TimeSeries router
- [x] Events router
- [x] Documents router
- [x] Governance router
- [x] Publications router
- [x] Entities router
- [x] Admin router
- [x] Scheduler router
- [x] AI router
- [x] ML router (NEW)
- [x] One Brain router (NEW)

### 5.2 Scheduled Jobs (Complete - 11 jobs)
- [x] Daily data refresh
- [x] Weekly report generation
- [x] Monthly macro brief
- [x] Quarterly analysis
- [x] Annual report
- [x] Signal detection (4-hourly)
- [x] Data quality checks
- [x] Connector health monitoring
- [x] Cache refresh
- [x] Notification dispatch
- [x] Backup verification

### 5.3 API Endpoints (P2)
- [ ] CSV export endpoint
- [ ] JSON export endpoint
- [ ] XLSX export endpoint
- [ ] Export rate limiting
- [ ] Export audit logging

---

## Section 6: Testing & Quality (P1)

### 6.1 Unit Tests
- [x] 320 tests passing (100%)
- [x] Auth tests
- [x] Router tests
- [x] ML tests (44 tests)
- [x] One Brain tests (16 tests)
- [ ] E2E tests with Playwright

### 6.2 TypeScript
- [x] 0 compilation errors
- [x] Strict mode enabled

### 6.3 Code Quality
- [ ] ESLint configuration
- [ ] Prettier formatting
- [ ] Husky pre-commit hooks

---

## Section 7: Documentation (P2)

### 7.1 Completed Documentation
- [x] ONE_BRAIN_AUDIT.md
- [x] ML_INFRASTRUCTURE.md
- [x] ML_INTEGRATION_GUIDE.md
- [x] BACKEND_AUDIT_REPORT.md
- [x] PRODUCTION_READINESS_SUMMARY.md
- [x] ARCHITECTURE.md
- [x] DECISIONS.md
- [x] DATA_GOVERNANCE.md
- [x] API_REFERENCE.md
- [x] ADMIN_MANUAL.md
- [x] SUBSCRIBER_MANUAL.md
- [x] PARTNER_MANUAL.md
- [x] USER_JOURNEYS.md
- [x] DEMO_SCRIPT.md

### 7.2 Pending Documentation
- [x] FINAL_SELF_AUDIT.md
- [ ] RECOVERY_RUNBOOK.md

---

## Section 8: Deployment (P0)

### 8.1 Pre-Deployment Checklist
- [x] All tests passing
- [x] TypeScript clean
- [x] Database schema synced
- [x] Scheduled jobs configured
- [ ] Security audit
- [ ] Performance optimization
- [ ] CDN configuration

### 8.2 Deployment Options
- [ ] AWS deployment (RDS + S3 + EC2/ECS)
- [ ] GitHub Actions CI/CD
- [ ] Docker containerization

---

## Section 9: Outstanding Items from Attachments

### 9.1 From One Brain Directive (Pasted_content_05.txt)
- [x] Zero fabrication enforcement
- [x] Evidence-packed answer structure
- [x] Role-aware intelligence modes
- [x] Knowledge graph reasoning
- [x] Scenario projections
- [x] Data gap ticket creation
- [x] Contradiction detection
- [ ] Visual intelligence (charts, timelines)
- [ ] Site-wide integration

### 9.2 From Master Build Prompt (Pasted_content_07.txt)
- [x] Core data connectors
- [x] Provenance tracking
- [x] Confidence ratings
- [x] Bilingual support
- [x] Admin console
- [ ] Full mockup alignment
- [ ] Original Yemen imagery

### 9.3 From 12-Point Requirements (Pasted_content_08.txt)
- [x] Database schema complete
- [x] API connectors working
- [x] AI assistant functional
- [x] Scheduled jobs running
- [x] Publications engine
- [ ] Email notification system
- [ ] Full i18n implementation

### 9.4 From Additional Requirements (Pasted_content_09.txt)
- [x] ML pipeline infrastructure
- [x] Personalization engine
- [x] Forecasting models
- [x] Anomaly detection
- [ ] Real-time data streaming
- [ ] Feedback loops

---

## Summary Statistics

| Category | Completed | Pending | Total |
|----------|-----------|---------|-------|
| One Brain | 9 | 12 | 21 |
| ML Systems | 20 | 8 | 28 |
| Data Connectors | 14 | 5 | 19 |
| Frontend Pages | 85 | 0 | 85 |
| Backend Routers | 13 | 0 | 13 |
| Scheduled Jobs | 11 | 0 | 11 |
| Tests | 320 | 0 | 320 |
| Documentation | 14 | 2 | 16 |

**Overall Completion:** ~92%

---

## Next Priority Actions

1. **Wire One Brain to AI Chat UI** - Replace basic LLM with evidence-grounded intelligence
2. **Add Visual Intelligence** - Chart generation, timeline visualization
3. **Complete ML Dashboard Integration** - Add insights widgets to main dashboard
4. **Implement Email Notifications** - Complete notification system
5. **Final Security Audit** - Pre-deployment security review
