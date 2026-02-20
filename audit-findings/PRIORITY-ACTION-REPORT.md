# YETO Platform Priority Action Report

## Executive Summary

After comprehensive deep dive audit of the backend, database, admin dashboard, and all sector pages, I have identified **critical issues** that must be addressed for the platform to have complete, inclusive, and accurate data from 2010 to present.

---

## CRITICAL FINDING #1: DATABASE IS COMPLETELY EMPTY

**All database tables contain 0 records:**

| Table | Records | Required for |
|-------|---------|--------------|
| time_series | 0 | All charts, KPIs, trends |
| indicators | 0 | Sector metrics definitions |
| sources | 0 | Data provenance tracking |
| documents | 0 | Research library, citations |
| economic_events | 0 | Timeline, event overlays |
| entities | 0 | Organizations, people |
| alerts | 0 | Admin notifications |
| users | 0 | User management |
| datasets | 0 | Downloadable data packages |
| sector_definitions | 0 | Sector configurations |
| library_documents | 0 | Research papers |
| source_feed_matrix | 0 | Source-sector routing |
| data_gap_tickets | 0 | Gap tracking |
| data_contradictions | 0 | Contradiction detection |

**Impact:** ALL data displayed on the platform is STATIC/HARDCODED in frontend components. The platform shows fake data that doesn't reflect actual database state.

---

## CRITICAL FINDING #2: SECTOR PAGES USE HARDCODED DATA

Every sector page (Trade, Macro, Banking, Labor, Currency, Food Security, Poverty, Energy, Aid Flows) displays:
- Static KPI values hardcoded in React components
- Fake chart data defined in component state
- Placeholder alerts and events
- Non-functional evidence panels (no real sources to display)

**Example - Trade Sector:**
- Total Exports: $1.1B (hardcoded)
- Total Imports: $16.2B (hardcoded)
- Trade Deficit: -$15.1B (hardcoded)
- These values don't come from database queries

---

## CRITICAL FINDING #3: ADMIN DASHBOARD SHOWS FAKE METRICS

The admin dashboard displays:
- "5/6 sources active" - but 0 sources in database
- "70% coverage" - but 0 indicators in database
- "45 records today" - but 0 time_series records
- Connector status showing "healthy" - but no actual data flowing

---

## PRIORITY ACTION PLAN

### PRIORITY 1: Populate Database with Real Data (HIGHEST)

**Estimated effort: 2-3 days**

1. **Create and run comprehensive data seeding script** that populates:
   - 225+ sources from YETO Master Registry
   - 150+ indicators across all sectors
   - 10,000+ time_series records (2010-2026)
   - 500+ documents from research sources
   - 300+ economic events
   - 100+ entities (organizations, institutions)
   - Sector definitions for all 15 sectors

2. **Data sources to ingest:**
   - World Bank WDI API (GDP, inflation, trade, etc.)
   - IMF WEO/IFS databases
   - OCHA FTS (humanitarian funding)
   - WFP VAM (food prices)
   - Central Bank Yemen reports (manual)
   - UN Comtrade (trade statistics)
   - ACLED (conflict events)
   - HDX datasets

### PRIORITY 2: Connect Frontend to Database (HIGH)

**Estimated effort: 1-2 days**

1. Replace hardcoded data in sector pages with tRPC queries
2. Update KPI components to fetch from `trpc.indicators.getByCode`
3. Update charts to fetch from `trpc.timeSeries.getByIndicator`
4. Connect evidence panels to real sources
5. Make admin dashboard reflect actual database state

### PRIORITY 3: Fix TypeScript Errors (MEDIUM)

**Estimated effort: 4-6 hours**

- 130 TypeScript errors in service files
- Main issues: incorrect column names, missing table references
- These don't block runtime but indicate code-schema mismatch

### PRIORITY 4: Implement Real Data Connectors (MEDIUM)

**Estimated effort: 1-2 days**

1. World Bank API connector (working, needs data population)
2. IMF API connector (working, needs data population)
3. OCHA FTS connector (needs testing)
4. WFP connector (needs credentials)
5. HDX connector (showing connection failed)
6. ACLED connector (working, needs data population)

### PRIORITY 5: Admin Dashboard Functionality (MEDIUM)

**Estimated effort: 1 day**

1. Make "Force Sync" button actually trigger data ingestion
2. Connect ingestion status to real connector health
3. Show actual record counts from database
4. Enable manual data upload functionality
5. Implement user management

---

## DETAILED YEAR-BY-YEAR DATA REQUIREMENTS

For complete 2010-2026 coverage, each sector needs:

### Macroeconomy (macro)
| Indicator | Years Needed | Source |
|-----------|--------------|--------|
| GDP (nominal, real) | 2010-2026 | World Bank, IMF |
| GDP growth rate | 2010-2026 | World Bank |
| Inflation rate | 2010-2026 | IMF, CBY |
| Unemployment rate | 2010-2026 | ILO, World Bank |
| Government revenue | 2010-2026 | IMF, MoF |
| Government expenditure | 2010-2026 | IMF, MoF |
| Fiscal balance | 2010-2026 | IMF |
| Public debt | 2010-2026 | IMF |

### Trade (trade)
| Indicator | Years Needed | Source |
|-----------|--------------|--------|
| Total exports | 2010-2026 | UN Comtrade, CBY |
| Total imports | 2010-2026 | UN Comtrade, CBY |
| Trade balance | 2010-2026 | Calculated |
| Oil exports | 2010-2026 | OPEC, CBY |
| Non-oil exports | 2010-2026 | UN Comtrade |
| Food imports | 2010-2026 | FAO, UN Comtrade |
| Fuel imports | 2010-2026 | UN Comtrade |

### Banking (banking)
| Indicator | Years Needed | Source |
|-----------|--------------|--------|
| Foreign reserves | 2010-2026 | CBY Aden, CBY Sanaa |
| Money supply (M1, M2) | 2010-2026 | CBY |
| Credit to private sector | 2010-2026 | CBY |
| Interest rates | 2010-2026 | CBY |
| Bank deposits | 2010-2026 | CBY |

### Currency (currency_fx)
| Indicator | Years Needed | Source |
|-----------|--------------|--------|
| Exchange rate (official) | 2010-2026 | CBY |
| Exchange rate (parallel) | 2014-2026 | Market monitors |
| Exchange rate spread | 2014-2026 | Calculated |

### Food Security (food_security)
| Indicator | Years Needed | Source |
|-----------|--------------|--------|
| Food insecurity (IPC) | 2015-2026 | IPC, WFP |
| Wheat prices | 2010-2026 | WFP VAM |
| Rice prices | 2010-2026 | WFP VAM |
| Cooking oil prices | 2010-2026 | WFP VAM |
| Food basket cost | 2015-2026 | WFP |

### Humanitarian (humanitarian)
| Indicator | Years Needed | Source |
|-----------|--------------|--------|
| Humanitarian funding | 2015-2026 | OCHA FTS |
| People in need | 2015-2026 | OCHA HNO |
| IDPs | 2015-2026 | IOM DTM |
| Refugees | 2015-2026 | UNHCR |

### Poverty (poverty)
| Indicator | Years Needed | Source |
|-----------|--------------|--------|
| Poverty rate | 2010-2026 | World Bank |
| HDI | 2010-2026 | UNDP |
| Multidimensional poverty | 2014-2026 | UNDP |

---

## RECOMMENDED IMMEDIATE ACTIONS

1. **Today:** Run comprehensive data seeding script to populate all tables with real data from 2010-2026

2. **Tomorrow:** Update sector page components to fetch data from database instead of hardcoded values

3. **Day 3:** Test all sector pages with real data, fix any display issues

4. **Day 4:** Enable admin dashboard to show real metrics and trigger actual data ingestion

5. **Day 5:** Run full platform test, create checkpoint, deliver to user

---

## FILES TO CREATE/MODIFY

1. `/scripts/seed-complete-database.ts` - Master seeding script
2. `/server/services/dataPopulation.ts` - Data population service
3. `/client/src/pages/sectors/*.tsx` - Update all sector pages
4. `/client/src/pages/admin/AdminDashboard.tsx` - Connect to real data
5. `/server/routers/indicators.ts` - Add missing queries
6. `/server/routers/timeSeries.ts` - Add missing queries

---

## CONCLUSION

The YETO platform has excellent frontend design and architecture, but **the database is completely empty**. All displayed data is hardcoded placeholders. The highest priority is to populate the database with real historical data from 2010-2026, then connect the frontend components to fetch from the database instead of using static values.

Without this work, the platform cannot serve its purpose as a Yemen Economic Transparency Observatory.
