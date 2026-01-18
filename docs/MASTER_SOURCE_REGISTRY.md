# Master Source Registry - YETO Platform

## Overview

The Master Source Registry is the authoritative catalog of all 225+ data sources feeding the Yemen Economic Transparency Observatory. Each source includes metadata on access methods, update frequency, reliability, licensing, and integration status.

**Total Sources:** 225+  
**Categories:** Global, Regional, National, NGO  
**Coverage:** 2010-present  
**Update Frequency:** Daily to Annual (varies by source)

## Source Categories

### Global Economic & Trade Sources (50+ sources)

| Source | Type | Access | Update | Reliability | Status |
|--------|------|--------|--------|-------------|--------|
| World Bank WDI | API | REST | Monthly/Annual | A | Active |
| IMF IFS/SDMX | API | SDMX | Quarterly | A- | Active |
| UN Comtrade | API | REST | Monthly/Annual | B+ | Active |
| UNCTAD | Download | Excel/CSV | Annual | B+ | Active |
| ILO STAT | API | REST | Annual | A- | Active |
| FAO FAOSTAT | Download | CSV | Annual | A | Active |
| WHO GHO | API | REST | Annual | A | Active |
| UNHCR | API | REST | Monthly | A | Active |
| WFP VAM | API | REST | Monthly | A | Active |
| OCHA FTS | API | REST | Daily | A | Active |

### Regional Sources (20+ sources)

| Source | Region | Access | Update | Focus |
|--------|--------|--------|--------|-------|
| Arab Monetary Fund | MENA | Web | Quarterly | Macro/Monetary |
| UN ESCWA | MENA | Portal | Annual | Socio-economic |
| ICCIA | Islamic | Web | Annual | Trade |
| ERF | MENA | Web | Occasional | Research |
| GSMA Mobile Money | Global | Web | Annual | Payments |

### Yemen National Sources (30+ sources)

| Source | Institution | Type | Access | Coverage |
|--------|-------------|------|--------|----------|
| CBY Aden | Central Bank | Web/API | Weekly | FX Auctions, Monetary |
| CBY Sanaa | Central Bank | Web/API | Weekly | FX Auctions, Monetary |
| CSO Yearbooks | Statistics | PDF | Annual (pre-2014) | Demographics, GDP |
| SEMC Bulletins | NGO | PDF | Monthly | Market Prices |
| Sana'a Center | Think Tank | Web | Irregular | Banking, Finance |
| YEMENI BANKS | Private | Web | Quarterly | Banking Sector |

### Humanitarian & Conflict Sources (25+ sources)

| Source | Type | Update | Coverage |
|--------|------|--------|----------|
| ACLED | Conflict Events | Daily | 2010-present |
| UN Panel of Experts | Sanctions | Annual | 2010-present |
| IPC Analysis | Food Security | Semi-annual | Governorate-level |
| FEWS NET | Food Security | Monthly | Market prices |
| ReliefWeb | Humanitarian | Daily | News/Reports |
| UNHCR | Refugees | Monthly | Displacement data |
| WFP Market Monitor | Food Prices | Monthly | Commodity prices |

## Integration Status

### Tier 1: Active & Automated (14 sources)
These sources have automated API connectors and scheduled ingestion:

1. **World Bank WDI** - Daily/Weekly pull via REST API
2. **IMF IFS** - Quarterly pull via SDMX API
3. **UN Comtrade** - Monthly pull via REST API
4. **CBY Aden** - Weekly FX auction scraping
5. **CBY Sanaa** - Weekly FX auction scraping
6. **OCHA FTS** - Daily humanitarian funding pull
7. **UNHCR** - Monthly refugee/IDP data pull
8. **WFP VAM** - Monthly commodity price pull
9. **ACLED** - Daily conflict event pull
10. **WHO GHO** - Annual health data pull
11. **ILO STAT** - Annual labor data pull
12. **FAO FAOSTAT** - Annual agricultural data pull
13. **UN Comtrade** - Monthly/Annual trade data
14. **Signal Detection** - Real-time anomaly alerts

### Tier 2: Scheduled & Manual (50+ sources)
These sources require periodic manual downloads or have limited API access:

- UNCTAD (Annual Excel download)
- UN Population Division (Annual API pull)
- UN HDR (Annual web scraping)
- World Bank Doing Business (Annual, discontinued)
- ILOSTAT (Annual API pull)
- FEWS NET (Monthly PDF scraping)
- IPC Analysis (Semi-annual PDF ingestion)
- UN Comtrade (Monthly bulk download)

### Tier 3: Document & Research (100+ sources)
These sources provide narrative documents, reports, and research papers:

- IMF Article IV Reports (Annual PDF)
- World Bank Economic Reports (Quarterly)
- UN Panel of Experts Reports (Annual)
- Sana'a Center Analysis Papers (Irregular)
- Economic Research Forum Papers (Occasional)
- Academic Publications (Continuous)
- News Archives (Daily)

### Tier 4: Pending & Conditional (40+ sources)
These sources require API keys, licensing agreements, or manual intervention:

- Trading Economics (Requires key)
- GEM (Requires registration)
- MENA Financial Inclusion Dashboard (Limited access)
- Sanctions Databases (OFAC, EU, UK - requires parsing)
- Private Sector Data (Banks, Mobile Operators)
- Regional Central Banks (Various requirements)

## Connector Implementation Priority

### Phase 1: Core Infrastructure (Week 1-2)
1. World Bank WDI - GDP, poverty, trade, population
2. IMF IFS - Macro-financial data
3. UN Comtrade - Trade flows
4. CBY Aden/Sanaa - Exchange rates

### Phase 2: Humanitarian & Food Security (Week 3-4)
5. OCHA FTS - Humanitarian funding
6. WFP VAM - Food prices
7. UNHCR - Displacement data
8. ACLED - Conflict events

### Phase 3: Specialized Indicators (Week 5-6)
9. FAO FAOSTAT - Agricultural data
10. WHO GHO - Health indicators
11. ILO STAT - Labor market data
12. UN Population Division - Demographics

### Phase 4: Regional & National (Week 7-8)
13. CBY Monetary Data - Banking sector
14. SEMC Bulletins - Market prices
15. CSO Yearbooks - Historical baseline
16. Arab Monetary Fund - Regional context

## Data Quality Standards

### Reliability Scoring

| Score | Definition | Examples |
|-------|-----------|----------|
| A | Highly credible, official source | World Bank, IMF, UN agencies |
| A- | Authoritative but may have gaps | IMF estimates for conflict years |
| B+ | Generally reliable, some gaps | UN Comtrade with mirror data |
| B | Credible with moderate limitations | Regional sources, NGO reports |
| B- | Credible but incomplete coverage | Specialized datasets |
| C | Provisional or estimated data | Market prices, informal trade |
| C- | Limited reliability, use with caution | Unofficial sources |
| D | Experimental or low confidence | Satellite imagery, proxies |

### Confidence Ratings

Every observation includes a confidence rating:

- **VERIFIED:** Official source, validated by multiple sources
- **PROVISIONAL:** Official source, not yet cross-validated
- **ESTIMATED:** Model-based or interpolated
- **EXPERIMENTAL:** Satellite, proxy, or novel methodology
- **UNKNOWN:** Source or methodology unclear

## Metadata Requirements

Each source entry includes:

```json
{
  "src_id": "SRC-001",
  "src_numeric_id": 1,
  "name_en": "World Bank World Development Indicators",
  "name_ar": "مؤشرات التنمية العالمية للبنك الدولي",
  "category": "Global Economic",
  "tier": "T1",
  "institution": "World Bank",
  "url": "https://data.worldbank.org/",
  "url_raw": "https://api.worldbank.org/v2/country/YEM/indicator/{code}",
  "access_method": "API",
  "update_frequency": "Monthly/Annual",
  "license": "CC-BY-4.0",
  "reliability_score": 95,
  "geographic_coverage": "National",
  "typical_lag_days": 30,
  "auth": "None",
  "data_fields": "Indicator Code, Year, Value, Metadata",
  "ingestion_method": "Direct API connector with JSON pagination",
  "notes": "Extensive national time-series (1960-present); some series have gaps during conflict years",
  "origin": "Global",
  "tags": ["macro", "trade", "poverty", "development"],
  "active": true
}
```

## Ingestion Workflow

### Standard ETL Pipeline

```
1. TRIGGER
   ├─ Schedule (daily/weekly/monthly)
   ├─ Manual request
   ├─ Webhook notification
   └─ Backfill request

2. FETCH
   ├─ API call with pagination
   ├─ File download
   ├─ Web scraping
   └─ Manual upload

3. VALIDATE
   ├─ Schema validation
   ├─ Data type checking
   ├─ Range validation
   ├─ Duplicate detection
   └─ Regime consistency

4. TRANSFORM
   ├─ Unit conversion
   ├─ Currency conversion
   ├─ Disaggregation
   ├─ Interpolation
   └─ Regime tagging

5. LOAD
   ├─ Insert into series table
   ├─ Create observations
   ├─ Link to indicators
   └─ Record provenance

6. MONITOR
   ├─ Row count verification
   ├─ Data quality checks
   ├─ Alert on failures
   └─ Log ingestion run
```

## Fallback Strategies

When a primary source fails:

| Scenario | Fallback | Action |
|----------|----------|--------|
| API timeout | Retry with exponential backoff | Retry 3x, then alert |
| Missing data | Use alternative source | Flag as proxy data |
| Format change | Manual intervention | Create Gap Ticket |
| Authentication failure | Check credentials | Alert admin |
| Rate limit exceeded | Queue for later | Retry next cycle |

## Gap Tracking

When data is missing or delayed:

1. **Automatic Detection:** Ingestion pipeline detects missing expected data
2. **Gap Ticket Creation:** System creates ticket with source, indicator, date range
3. **Notification:** Alert sent to data steward
4. **Resolution:** Data steward finds alternative source or marks as "Not available"
5. **Documentation:** Gap recorded in Data Gap Tracker for transparency

## Source Discovery Engine

Continuous process to identify new sources:

1. **Automated Scanning:** Monitor 50+ data portals for new Yemen datasets
2. **User Submissions:** Accept source suggestions from registered users
3. **Academic Monitoring:** Track new publications and working papers
4. **News Monitoring:** Identify newly released reports
5. **Validation:** Assess reliability and coverage before integration
6. **Integration:** Add to registry and schedule ingestion

## Licensing & Attribution

All sources include licensing information:

- **Open Data:** CC-BY-4.0, CC0, Open Government License
- **Restricted:** Academic use only, Non-commercial, Attribution required
- **Proprietary:** Requires agreement, Subscription, API key
- **Public Domain:** No restrictions

YETO respects all licensing terms and provides proper attribution.

## Maintenance Schedule

- **Weekly:** Monitor Tier 1 sources for failures
- **Monthly:** Update source metadata and reliability scores
- **Quarterly:** Review data quality and coverage
- **Annually:** Comprehensive source audit and gap analysis
- **Continuously:** Accept new source submissions and validate

## References

- [YETO Master Source Registry CSV](../sources_seed_225.csv)
- [Source Registry PDF](../YETO-Source-Registry-Inclusive-Jan-2026.pdf)
- [Data Source Registry Master](../Yemen-Economic-Transparency-Observatory-Master-Data-Source-Registry-2010-Present.pdf)
- [PostgreSQL Schema](./POSTGRESQL_MIGRATION_GUIDE.md)
