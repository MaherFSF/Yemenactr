# YETO Platform - Comprehensive TODO List

**Created:** January 11, 2026
**Purpose:** Track all incomplete items, required enhancements, and quality improvements

---

## CRITICAL PRIORITIES

### 1. Dynamic Data & Source Attribution
- [ ] Ensure ALL displayed values have "as of [DATE]" timestamps
- [ ] Every data point must show source reference (clickable link)
- [ ] No hardcoded values anywhere - all from database
- [ ] Daily exchange rate tracking with historical data
- [ ] Implement data freshness indicators on all pages

### 2. Exchange Rate Tracking (URGENT)
- [ ] Track daily Aden parallel market rate
- [ ] Track daily Sana'a controlled rate
- [ ] Show "as of [specific date]" for all exchange rates
- [ ] Historical daily data from 2015 onwards
- [ ] Calculate and show daily/weekly/monthly changes

---

## SECTOR PAGES - Complete Enrichment Required

### Banking Sector (/sectors/banking)
- [ ] Dynamic data from database (not hardcoded)
- [ ] Central Bank split (CBY-Aden vs CBY-Sana'a) with full details
- [ ] Commercial bank status by regime
- [ ] Money supply data (M1, M2) with sources
- [ ] Interest rates (if available)
- [ ] Bank branch counts and closures
- [ ] Remittance data (hawala networks)
- [ ] Mobile money adoption rates
- [ ] Banking sanctions impact
- [ ] Historical data 2010-2026 for all indicators

### Trade Sector (/sectors/trade)
- [ ] Import/export data by commodity
- [ ] Trade balance trends
- [ ] Port activity (Aden, Hodeidah, Mukalla)
- [ ] Red Sea shipping crisis impact
- [ ] Fuel imports data
- [ ] Food imports data
- [ ] Trade partners breakdown
- [ ] Smuggling economy estimates
- [ ] Historical data 2010-2026

### Currency Sector (/sectors/currency)
- [ ] DAILY exchange rate tracking (Aden parallel)
- [ ] DAILY exchange rate tracking (Sana'a)
- [ ] Currency divergence analysis
- [ ] Black market vs official rates
- [ ] Currency depreciation trends
- [ ] Purchasing power parity estimates
- [ ] Remittance impact on currency
- [ ] Historical daily data 2015-2026

### Humanitarian Sector (/sectors/food-security, /sectors/aid-flows, /sectors/poverty)
- [ ] IPC food security classifications by governorate
- [ ] WFP beneficiary numbers
- [ ] OCHA funding tracker (requested vs received)
- [ ] Humanitarian access constraints
- [ ] Malnutrition rates (acute, chronic)
- [ ] WASH indicators
- [ ] Health facility functionality
- [ ] Education access rates
- [ ] Poverty headcount by regime
- [ ] Historical data 2015-2026

### Energy Sector (/sectors/energy)
- [ ] Oil production data (pre-war vs current)
- [ ] Oil export revenues
- [ ] Fuel prices by governorate
- [ ] Electricity generation capacity
- [ ] Power outage data
- [ ] Solar adoption rates
- [ ] LNG status
- [ ] Historical data 2010-2026

### Agriculture Sector (/sectors/agriculture)
- [ ] Crop production by type
- [ ] Livestock numbers
- [ ] Agricultural land under cultivation
- [ ] Irrigation water availability
- [ ] Qat cultivation extent
- [ ] Agricultural input prices
- [ ] Historical data 2010-2026

### Labor Market (/sectors/labor-market)
- [ ] Unemployment rates by regime
- [ ] Public sector salary payments status
- [ ] Private sector employment
- [ ] Youth unemployment
- [ ] Female labor participation
- [ ] Wage levels and trends
- [ ] Historical data 2010-2026

### Infrastructure (/sectors/infrastructure)
- [ ] Road network status
- [ ] Bridge destruction/repair
- [ ] Port capacity utilization
- [ ] Airport status
- [ ] Telecommunications coverage
- [ ] Internet penetration
- [ ] Historical data 2010-2026

### Public Finance (/sectors/public-finance)
- [ ] Government revenue by source
- [ ] Government expenditure by category
- [ ] Budget deficit/surplus
- [ ] Public debt levels
- [ ] Customs revenue (Aden vs Hodeidah)
- [ ] Tax collection rates
- [ ] Historical data 2010-2026

### Investment (/sectors/investment)
- [ ] FDI flows
- [ ] Domestic investment trends
- [ ] Business registration data
- [ ] Investment climate indicators
- [ ] Reconstruction funding
- [ ] Historical data 2010-2026

### Macroeconomy (/sectors/macroeconomy)
- [ ] GDP estimates (both regimes)
- [ ] GDP growth rates
- [ ] GDP by sector composition
- [ ] Economic contraction since 2015
- [ ] Informal economy estimates
- [ ] Historical data 2010-2026

### Prices (/sectors/prices)
- [ ] CPI inflation by governorate
- [ ] Food price index
- [ ] Fuel price index
- [ ] Minimum food basket cost
- [ ] Price divergence (Aden vs Sana'a)
- [ ] Historical data 2010-2026

### Conflict Economy (/sectors/conflict-economy)
- [ ] War economy actors
- [ ] Smuggling routes and volumes
- [ ] Blockade impact
- [ ] Military expenditure estimates
- [ ] Conflict-related economic losses
- [ ] Historical data 2015-2026

---

## API CONNECTIONS REQUIRED

### International Organizations
- [ ] World Bank WDI API - connected, needs full indicator mapping
- [ ] IMF WEO API - connected, needs full indicator mapping
- [ ] UN OCHA FTS API - humanitarian funding
- [ ] UNHCR API - refugee/IDP data
- [ ] WFP VAM API - food security data
- [ ] WHO GHO API - health indicators
- [ ] ILO ILOSTAT API - labor statistics
- [ ] UNCTAD API - trade data
- [ ] FAO FAOSTAT API - agriculture data

### Humanitarian Data
- [ ] HDX (Humanitarian Data Exchange) API
- [ ] ReliefWeb API - reports and updates
- [ ] FEWS NET API - food security outlook
- [ ] ACAPS API - humanitarian analysis
- [ ] iMMAP API - geospatial data

### Think Tanks & Research
- [ ] Sana'a Center RSS feed parser
- [ ] Crisis Group RSS feed parser
- [ ] Chatham House publications
- [ ] Carnegie Endowment publications
- [ ] Brookings Institution publications
- [ ] CSIS publications

### Regional Sources
- [ ] CBY-Aden official data (if available)
- [ ] CBY-Sana'a official data (if available)
- [ ] Saudi Development Fund reports
- [ ] UAE aid tracker
- [ ] GCC economic data

### Sanctions & Compliance
- [ ] OFAC SDN list
- [ ] UN Security Council sanctions
- [ ] EU sanctions list

---

## DATA QUALITY & GOVERNANCE

### Source Attribution
- [ ] Every data point linked to source
- [ ] Source URL must be clickable
- [ ] Retrieval date recorded
- [ ] Confidence rating displayed (A/B/C/D)
- [ ] Methodology notes available

### Data Freshness
- [ ] "Last updated" timestamp on all pages
- [ ] Data age indicators (green/yellow/red)
- [ ] Automated staleness alerts
- [ ] Refresh schedule displayed

### Provenance
- [ ] Full audit trail for all data
- [ ] Transformation history logged
- [ ] Version control for corrections
- [ ] Public changelog maintained

---

## UI/UX IMPROVEMENTS

### Arabic Support
- [ ] All pages fully translated
- [ ] RTL layout verified on all pages
- [ ] Arabic typography optimized
- [ ] Date formats localized

### Accessibility
- [ ] All pages accessible via navigation
- [ ] Mobile responsive verified
- [ ] Screen reader compatible
- [ ] Keyboard navigation working

### Data Visualization
- [ ] Interactive charts with source tooltips
- [ ] Time series with date range selector
- [ ] Regime comparison views
- [ ] Export functionality (CSV, JSON, XLSX)

---

## PAGES TO VERIFY ACCESSIBILITY

### Main Pages (59 total)
- [x] Home (/)
- [x] Dashboard (/dashboard)
- [x] About (/about)
- [x] Contact (/contact)
- [x] Glossary (/glossary)
- [x] Research (/research)
- [x] Timeline (/timeline)
- [x] Methodology (/methodology)
- [x] Pricing (/pricing)
- [x] Legal (/legal)

### Sector Pages (15 total)
- [x] Banking (/sectors/banking)
- [x] Trade (/sectors/trade)
- [x] Currency (/sectors/currency)
- [x] Poverty (/sectors/poverty)
- [x] Macroeconomy (/sectors/macroeconomy)
- [x] Prices (/sectors/prices)
- [x] Public Finance (/sectors/public-finance)
- [x] Energy (/sectors/energy)
- [x] Food Security (/sectors/food-security)
- [x] Aid Flows (/sectors/aid-flows)
- [x] Labor Market (/sectors/labor-market)
- [x] Conflict Economy (/sectors/conflict-economy)
- [x] Infrastructure (/sectors/infrastructure)
- [x] Agriculture (/sectors/agriculture)
- [x] Investment (/sectors/investment)

### Tools & Features
- [x] AI Assistant (/ai-assistant)
- [x] Scenario Simulator (/scenario-simulator)
- [x] Report Builder (/report-builder)
- [x] Comparison Tool (/comparison)
- [x] Indicator Catalog (/indicators)
- [x] Data Repository (/data-repository)
- [x] Entities (/entities)
- [x] Publications (/publications)
- [x] Coverage Scorecard (/coverage)
- [x] Policy Impact (/policy-impact)
- [x] Data Exchange Hub (/data-exchange)

### Admin & User
- [x] Admin Portal (/admin)
- [x] Admin Monitoring (/admin/monitoring)
- [x] Admin Scheduler (/admin/scheduler)
- [x] Admin Alerts (/admin/alerts)
- [x] Partner Portal (/partner)
- [x] User Dashboard (/my-dashboard)
- [x] API Keys (/api-keys)
- [x] Notifications (/notifications)
- [x] Compliance (/compliance)

### Research Portal
- [x] Research Portal (/research-portal)
- [x] Research Explorer (/research-explorer)
- [x] Research Analytics (/research-analytics)
- [x] Research Assistant (/research-assistant)
- [x] Research Library (/research-library)
- [x] Research Audit (/research-audit)

### Other
- [x] Data Freshness (/data-freshness)
- [x] API Docs (/api-docs)
- [x] Accuracy Dashboard (/accuracy)
- [x] Corrections (/corrections)
- [x] Changelog (/changelog)

---

## SCHEDULED TASKS

### Data Refresh Jobs
- [ ] World Bank data - weekly
- [ ] IMF data - monthly
- [ ] OCHA FTS - daily
- [ ] Exchange rates - daily
- [ ] ReliefWeb - daily
- [ ] Think tank publications - daily

### Report Generation
- [ ] Daily signals report
- [ ] Weekly economic monitor
- [ ] Monthly sector briefs
- [ ] Quarterly comprehensive report

### Alerts
- [ ] Exchange rate threshold alerts
- [ ] Inflation spike alerts
- [ ] Humanitarian funding gap alerts
- [ ] Data staleness alerts

---

## TESTING REQUIREMENTS

### Unit Tests
- [ ] All tRPC procedures tested
- [ ] Data transformation functions tested
- [ ] API connector functions tested
- [ ] Alert system tested

### Integration Tests
- [ ] Database queries verified
- [ ] External API responses handled
- [ ] Error handling verified

### Browser Tests
- [ ] All 59 pages load correctly
- [ ] Arabic RTL layout verified
- [ ] Mobile responsiveness verified
- [ ] Data displays correctly

---

## DOCUMENTATION

### User Documentation
- [ ] User guide complete
- [ ] API documentation complete
- [ ] Methodology documentation complete
- [ ] Data dictionary complete

### Technical Documentation
- [ ] Architecture documentation
- [ ] Deployment guide
- [ ] Admin manual
- [ ] API reference

---

## COMPLETED ITEMS

### Database
- [x] Schema designed and migrated
- [x] 47 data sources seeded
- [x] 44 indicator definitions created
- [x] 2,033+ time series data points
- [x] Historical data 2010-2026 for key indicators

### API Connectors
- [x] World Bank WDI connector
- [x] IMF WEO connector
- [x] OCHA FTS connector
- [x] UNHCR connector
- [x] Think tank RSS parser

### Features
- [x] Dynamic homepage KPIs
- [x] Timeline with 2026 events
- [x] AI Assistant
- [x] Scenario Simulator
- [x] Report Builder
- [x] Alert system
- [x] Scheduler system

---

**Next Priority:** Enrich sector pages with complete dynamic data, starting with Currency sector for daily exchange rate tracking.
