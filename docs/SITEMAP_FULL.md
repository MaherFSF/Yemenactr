# YETO Platform - Complete Sitemap & Route Inventory

**Generated:** January 18, 2026  
**Platform:** Yemen Economic Transparency Observatory (YETO)  
**Total Routes:** 80+  
**Status:** Audit-Ready

---

## Executive Summary

This document provides a comprehensive inventory of all routes, pages, and components in the YETO platform. Each entry includes the route path, purpose, data dependencies, access level requirements, current status, and test coverage. This sitemap serves as the authoritative reference for platform architecture and feature completeness.

---

## Public Routes (No Authentication Required)

| Route | Component | Purpose | Data Dependencies | Access Level | Status | Tests |
|-------|-----------|---------|-------------------|--------------|--------|-------|
| `/` | Home | Landing page with platform overview | None | Public | OK | ✅ |
| `/about` | About | Platform mission and team information | None | Public | OK | ✅ |
| `/methodology` | Methodology | Detailed explanation of data sources and calculation methods | sources_registry, indicators | Public | OK | ✅ |
| `/indicators` | IndicatorCatalog | Searchable catalog of all economic indicators | indicators, sectors | Public | OK | ⚠️ |
| `/data-repository` | DataRepository | Browse and download datasets | data_snapshots, sources_registry | Public | OK | ⚠️ |
| `/timeline` | Timeline | Historical timeline of conflict and economic events | events, timeline_data | Public | PARTIAL | ⚠️ |
| `/research` | Research | Research articles and publications | research_library, publications | Public | OK | ✅ |
| `/research-library` | ResearchLibrary | Full-text searchable research library | research_library, documents | Public | OK | ⚠️ |
| `/publications` | Publications | Published reports and analyses | publications | Public | OK | ✅ |
| `/pricing` | Pricing | Subscription tier information | None | Public | OK | ✅ |
| `/legal` | Legal | Legal documents and policies | None | Public | OK | ✅ |
| `/legal/privacy` | Legal | Privacy policy | None | Public | OK | ✅ |
| `/legal/terms` | Legal | Terms of service | None | Public | OK | ✅ |
| `/legal/data-license` | Legal | Data licensing information | None | Public | OK | ✅ |
| `/legal/accessibility` | Legal | Accessibility statement | None | Public | OK | ✅ |
| `/contact` | Contact | Contact form and support information | None | Public | OK | ✅ |
| `/changelog` | Changelog | Platform updates and version history | None | Public | OK | ✅ |
| `/compliance` | Compliance | Compliance certifications and standards | None | Public | OK | ✅ |
| `/api-docs` | ApiDocs | API documentation and endpoints | None | Public | OK | ⚠️ |
| `/sitemap` | Sitemap | XML sitemap for search engines | None | Public | OK | ✅ |
| `/404` | NotFound | 404 error page | None | Public | OK | ✅ |

---

## Sector Dashboards (Public Access, Real Data)

| Route | Component | Purpose | Data Dependencies | Access Level | Status | Tests |
|-------|-----------|---------|-------------------|--------------|--------|-------|
| `/sectors/banking` | Banking | Banking sector indicators and analysis | banking_data, sources | Public | OK | ⚠️ |
| `/sectors/trade` | Trade | Trade flows and tariff analysis | trade_data, sources | Public | OK | ⚠️ |
| `/sectors/poverty` | Poverty | Poverty and inequality indicators | poverty_data, sources | Public | OK | ⚠️ |
| `/sectors/macroeconomy` | Macroeconomy | Macroeconomic indicators | macro_data, sources | Public | OK | ⚠️ |
| `/sectors/prices` | Prices | Price indices and inflation | prices_data, sources | Public | OK | ⚠️ |
| `/sectors/currency` | Currency | Currency and exchange rates | currency_data, sources | Public | OK | ⚠️ |
| `/sectors/public-finance` | PublicFinance | Government revenue and spending | finance_data, sources | Public | OK | ⚠️ |
| `/sectors/energy` | Energy | Energy production and consumption | energy_data, sources | Public | OK | ⚠️ |
| `/sectors/food-security` | FoodSecurity | Food security and nutrition | food_data, sources | Public | OK | ⚠️ |
| `/sectors/aid-flows` | AidFlows | Humanitarian and development aid | aid_data, sources | Public | OK | ⚠️ |
| `/sectors/labor-market` | LaborMarket | Employment and labor statistics | labor_data, sources | Public | OK | ⚠️ |
| `/sectors/conflict-economy` | ConflictEconomy | Conflict-related economic impacts | conflict_data, sources | Public | OK | ⚠️ |
| `/sectors/infrastructure` | Infrastructure | Infrastructure and utilities | infrastructure_data, sources | Public | OK | ⚠️ |
| `/sectors/agriculture` | Agriculture | Agricultural production and trade | agriculture_data, sources | Public | OK | ⚠️ |
| `/sectors/investment` | Investment | Foreign and domestic investment | investment_data, sources | Public | OK | ⚠️ |
| `/sectors/microfinance` | Microfinance | Microfinance and financial inclusion | microfinance_data, sources | Public | OK | ⚠️ |

---

## Data & Analysis Routes (Registered+ Access)

| Route | Component | Purpose | Data Dependencies | Access Level | Status | Tests |
|-------|-----------|---------|-------------------|--------------|--------|-------|
| `/coverage` | CoverageScorecard | Data coverage by sector, indicator, and time period | coverage_data, data_gaps | Registered | OK | ⚠️ |
| `/data-freshness` | DataFreshness | Last update times for all sources | ingestion_jobs, sources | Registered | OK | ⚠️ |
| `/accuracy` | AccuracyDashboard | Data quality and confidence scores | data_quality, sources | Registered | OK | ⚠️ |
| `/policy-impact` | PolicyImpact | Policy impact analysis and simulations | policy_data, indicators | Registered | OK | ⚠️ |
| `/data-exchange` | DataExchangeHub | Data exchange and integration hub | external_data, sources | Registered | OK | MISSING |
| `/comparison` | ComparisonTool | Compare indicators across regimes and time periods | indicators, data_snapshots | Registered | OK | ⚠️ |
| `/scenario-simulator` | ScenarioSimulator | Economic scenario modeling and simulation | indicators, models | Registered | OK | MISSING |
| `/report-builder` | ReportBuilder | Custom report generation | indicators, data_snapshots | Registered | OK | ⚠️ |
| `/entities` | Entities | Entity registry and profiles | entities, entity_data | Registered | OK | ⚠️ |
| `/entities/:id` | EntityDetail | Individual entity detail page | entities, entity_data | Registered | OK | ⚠️ |
| `/entities/bank/:id` | BankDetail | Bank-specific detail page | banks, bank_data | Registered | OK | ⚠️ |
| `/corrections` | Corrections | Data corrections and revisions | corrections, audit_log | Registered | OK | ✅ |
| `/sanctions` | Sanctions | Sanctions list and tracking | sanctions_data, sources | Registered | OK | ⚠️ |
| `/corporate-registry` | CorporateRegistry | Corporate entity registry | corporate_data, sources | Registered | OK | MISSING |
| `/remittances` | Remittances | Remittance flows and analysis | remittances_data, sources | Registered | OK | ⚠️ |
| `/public-debt` | PublicDebt | Public debt analysis and tracking | debt_data, sources | Registered | OK | ⚠️ |
| `/humanitarian-funding` | HumanitarianFunding | Humanitarian funding flows | funding_data, sources | Registered | OK | ⚠️ |
| `/regional-zones` | RegionalZones | Regional zone analysis | zones_data, sources | Registered | OK | MISSING |
| `/economic-actors` | EconomicActors | Economic actors and stakeholders | actors_data, sources | Registered | OK | MISSING |

---

## User Account Routes (Registered+ Access)

| Route | Component | Purpose | Data Dependencies | Access Level | Status | Tests |
|-------|-----------|---------|-------------------|--------------|--------|-------|
| `/my-dashboard` | UserDashboard | Personal user dashboard | user_data, saved_searches | Registered | OK | ⚠️ |
| `/api-keys` | APIKeys | API key management | api_keys, audit_log | Registered | OK | ⚠️ |
| `/notifications` | NotificationSettings | Notification preferences | user_preferences, alerts | Registered | OK | ⚠️ |

---

## AI & Research Routes (Registered+ Access)

| Route | Component | Purpose | Data Dependencies | Access Level | Status | Tests |
|-------|-----------|---------|-------------------|--------------|--------|-------|
| `/ai-assistant` | AIAssistant | General AI assistant for data queries | indicators, data_snapshots, llm_service | Registered | OK | ⚠️ |
| `/ai-assistant-enhanced` | AIAssistantEnhanced | Enhanced AI with evidence packs | indicators, data_snapshots, evidence_packs | Registered | OK | MISSING |
| `/research-assistant` | ResearchAssistant | AI-powered research assistant | research_library, documents, llm_service | Registered | OK | MISSING |
| `/research-explorer` | ResearchExplorer | Interactive research exploration | research_library, documents | Registered | OK | MISSING |
| `/research-audit` | ResearchAudit | Research quality audit trail | research_library, audit_log | Registered | OK | MISSING |
| `/research-portal` | ResearchPortal | Research portal and hub | research_library, publications | Registered | OK | MISSING |
| `/research-visualization` | ResearchVisualization | Research visualization tools | research_library, visualization_data | Registered | OK | MISSING |

---

## Executive & Partner Routes (Role-Based Access)

| Route | Component | Purpose | Data Dependencies | Access Level | Status | Tests |
|-------|-----------|---------|-------------------|--------------|--------|-------|
| `/executive/governor` | GovernorDashboard | Central Bank Governor dashboard | all_data, executive_reports | Executive | OK | MISSING |
| `/executive/deputy-governor` | DeputyGovernorDashboard | Deputy Governor dashboard | all_data, executive_reports | Executive | OK | MISSING |
| `/partner` | PartnerPortal | Partner organization portal | partner_data, shared_data | Partner | OK | MISSING |

---

## Admin Routes (Super-Admin Access Only)

| Route | Component | Purpose | Data Dependencies | Access Level | Status | Tests |
|-------|-----------|---------|-------------------|--------------|--------|-------|
| `/admin` | AdminPortal | Main admin dashboard | all_data, admin_stats | Admin | OK | ⚠️ |
| `/admin/monitoring` | AdminMonitoring | System monitoring and health | system_stats, logs | Admin | OK | ⚠️ |
| `/admin/scheduler` | SchedulerDashboard | Ingestion scheduler control | ingestion_jobs, sources | Admin | OK | ⚠️ |
| `/admin/scheduler-status` | SchedulerStatus | Scheduler status and history | ingestion_jobs | Admin | OK | ⚠️ |
| `/admin/ingestion` | IngestionDashboard | Ingestion job management | ingestion_jobs, data_gaps | Admin | OK | ⚠️ |
| `/admin/alerts` | AlertsDashboard | System alerts and notifications | alerts, audit_log | Admin | OK | ⚠️ |
| `/admin/api-health` | ApiHealthDashboard | API health and performance | api_metrics, logs | Admin | OK | MISSING |
| `/admin/alert-history` | AlertHistory | Alert history and trends | alerts, audit_log | Admin | OK | MISSING |
| `/admin-hub` | AdminHub | Admin hub and control center | all_data, admin_stats | Admin | OK | ⚠️ |
| `/admin/webhooks` | WebhookSettings | Webhook configuration and management | webhook_endpoints, webhook_deliveries | Admin | OK | ✅ |
| `/admin/connector-thresholds` | ConnectorThresholds | Connector threshold configuration | sources_registry, connector_config | Admin | OK | MISSING |
| `/admin/autopilot` | AutopilotControlRoom | Autopilot control and configuration | autopilot_config, ingestion_jobs | Admin | OK | MISSING |
| `/admin/reports` | ReportWorkflow | Report generation workflow | reports, data_snapshots | Admin | OK | MISSING |
| `/admin/visualizations` | VisualizationBuilder | Visualization builder and management | visualization_config, data_snapshots | Admin | OK | MISSING |
| `/admin/insights` | InsightMiner | Insight mining and discovery | indicators, data_snapshots | Admin | OK | MISSING |
| `/admin/export` | ExportBundle | Export bundle creation | all_data, data_snapshots | Admin | OK | MISSING |

---

## Component Gallery & Testing Routes

| Route | Component | Purpose | Data Dependencies | Access Level | Status | Tests |
|-------|-----------|---------|-------------------|--------------|--------|-------|
| `/component-showcase` | ComponentShowcase | UI component gallery | None | Admin | OK | ✅ |
| `/review/all-pages` | AllPages | All pages review page | None | Admin | OK | ⚠️ |

---

## Status Legend

- **OK** - Route is functional and returns real data
- **PARTIAL** - Route is functional but missing some features or data
- **MISSING** - Route exists but is not fully implemented
- **BROKEN** - Route has errors or is non-functional

---

## Test Coverage Legend

- **✅** - Comprehensive test coverage (unit + integration)
- **⚠️** - Partial test coverage (unit OR integration)
- **MISSING** - No test coverage

---

## Data Dependencies Summary

### Core Tables
- `users` - User accounts and authentication
- `user_roles` - User role assignments
- `user_subscriptions` - Subscription tier tracking
- `indicators` - Economic indicator definitions
- `data_snapshots` - Historical data versions
- `sources_registry` - Data source catalog
- `ingestion_jobs` - Ingestion job tracking
- `data_gaps` - Missing data tracking
- `entities` - Entity registry
- `events` - Timeline events
- `research_library` - Research documents
- `corrections` - Data corrections
- `audit_log` - Audit trail

### External Services
- `llm_service` - LLM for AI features
- `storage_service` - S3 for file storage
- `notification_service` - Email and in-app notifications

---

## Access Level Requirements

### Public
- No authentication required
- Accessible to all users

### Registered
- Requires user account
- Includes all public content plus registered features

### Pro
- Requires Pro subscription
- Includes advanced analytics and exports

### Institutional
- Requires Institutional subscription
- Includes API access and multi-user accounts

### Executive
- Requires Executive role
- Central Bank leadership access

### Partner
- Requires Partner organization account
- Shared data access

### Admin
- Requires Super-Admin role
- Full platform control

---

## Route Health Checks

### Automated Health Checks (Run Daily)
1. All routes return HTTP 200 or appropriate error code
2. All routes with data return real data (not mock)
3. All routes respect access level restrictions
4. All routes complete within SLA (< 2 seconds)
5. All routes have proper error handling

### Manual Health Checks (Run Weekly)
1. Verify data freshness for all sector dashboards
2. Verify AI assistant returns evidence-backed answers
3. Verify admin dashboards show accurate statistics
4. Verify export functionality works correctly
5. Verify bilingual interface is correct

---

## Next Steps

1. **Implement missing routes** - Complete all MISSING routes
2. **Expand test coverage** - Increase coverage from ⚠️ to ✅
3. **Add QA Review Mode** - Enable super-admin inspection of all routes
4. **Implement CI health checks** - Automate route health verification
5. **Create route documentation** - Add OpenAPI/Swagger specs for all API endpoints

---

## References

- [YETO Platform Architecture](./ARCHITECTURE.md)
- [Route Health Report](./ROUTE_HEALTH_REPORT.md)
- [QA Review Mode](./QA_REVIEW_MODE.md)
- [API Documentation](./API_DOCUMENTATION.md)
