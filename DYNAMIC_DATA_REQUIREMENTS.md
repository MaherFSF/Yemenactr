# YETO Dynamic Data Requirements

Based on review of master design documents and data source register.

## Core Principles (From Master Documents)

1. **No figure without a reference** - Every data point must have source attribution
2. **All data from database** - No hardcoded values in frontend
3. **Automatic updates** - Platform should run without human intervention
4. **Source attribution on every data point** - Full provenance tracking

## Data Sources to Integrate (From DATA_SOURCE_REGISTER)

### International Organizations (Active APIs)
| Source | Dataset | Method | Cadence | Status |
|--------|---------|--------|---------|--------|
| World Bank | WDI indicators | API | Monthly | ✅ Active |
| HDX/OCHA | Humanitarian data | API | Weekly | ✅ Active |
| ReliefWeb | Reports, updates | API | Daily | ✅ Active |
| WFP VAM | Food prices, security | API | Monthly | ✅ Active |
| UNHCR | Displacement data | API | Monthly | ✅ Active |
| IOM DTM | Migration tracking | API | Monthly | Planned |
| FAO GIEWS | Agricultural data | API | Monthly | Planned |

### Yemen Institutional Sources (Manual/Scrape)
| Source | Dataset | Method | Cadence |
|--------|---------|--------|---------|
| CBY Aden | Publications, statistics | Manual/Scrape | As published |
| Sana'a Monetary Authority | Publications | Manual | As published |
| Ministry of Finance | Budget documents | Manual | Annual |
| Central Statistical Org | Yearbooks, surveys | Manual | Annual |
| Social Fund for Development | Project reports | Manual | Quarterly |

### Think Tanks / Research
| Source | Dataset | Method |
|--------|---------|--------|
| ACAPS | Analysis reports | Scrape/API |
| Rethinking Yemen's Economy | Research outputs | Manual |
| Academic Discovery | Papers via OpenAlex | API |

## Current Issues Identified

### Homepage (Home.tsx)
- Lines 91-96: Hardcoded platform stats (45 reports, 850+ users, 1.2M data points, 47 sources)
- Lines 49-88: Hero KPIs have fallback values that should come from DB
- Lines 212+: Latest updates are hardcoded

### Dashboard
- Some chart data may be static
- Need to verify all metrics come from database

### Sector Pages
- Need to audit each sector page for hardcoded statistics

## Required Changes

1. **Platform Stats** - Query actual counts from database tables
2. **Hero KPIs** - Ensure all values come from time_series table with source attribution
3. **Latest Updates** - Pull from economic_events table dynamically
4. **News Ticker** - Should pull from real data sources
5. **Sector Metrics** - All should query from database with sources

## API Integrations Status

- World Bank API: ✅ Connector exists
- HDX API: ✅ Connector exists  
- ReliefWeb API: ✅ Connector exists
- OCHA FTS API: ✅ Connector exists
- WFP VAM: Planned
- ACLED: Blocked (needs API key)
- IMF: Blocked (needs verification)

