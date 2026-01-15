# YETO Platform Verification Notes

## Currency Page Verification (Jan 15, 2026)

### Exchange Rate Chart
- **Data Range**: May 2015 to Dec 2026 (comprehensive historical data)
- **Three Series Displayed**:
  1. Aden - Official (green dashed line)
  2. Aden - Parallel (yellow solid line)
  3. Sanaa - Parallel (blue dashed line)
- **Y-Axis**: 0 to 2200 YER/USD
- **Data Sources Listed**:
  - CBY Aden (Official rates and monthly reports)
  - CBY Sanaa (Northern region rates)
  - Market Surveys (Parallel market rates)

### Key Observations
1. Chart shows clear divergence starting around 2016 (when CBY split)
2. Aden parallel rate peaks around 2000+ YER/USD in 2024
3. Sanaa rate remains relatively stable around 530-600 YER/USD
4. Data is dynamically loaded from database (no static arrays)

### Data Sources Section
- "البيانات محدثة حتى: ٣١ ديسمبر ٢٠٢٦" (Data updated to: Dec 31, 2026)
- Three source cards displayed with Arabic descriptions

## Database Verification

### Record Counts (Jan 15, 2026)
- time_series: 4,320 records
- organizations: 56 records
- commercial_entities: 44 records
- economic_events: 205 records
- research_publications: 370 records
- indicators: 66 records
- glossary_terms: 51 records

### Exchange Rate Data Coverage
- fx_rate_sanaa: 150 records (2010-2026)
- fx_rate_aden_official: 133 records (2015-2026)
- fx_rate_aden_parallel: 151 records (2010-2026)
- fx_rate_official: 60 records (2010-2014, pre-split)
- FX_RATE_PARALLEL: 96 records (2024)

## AI Knowledge Context
- Integrated comprehensive Yemen knowledge base
- Entity context includes 100+ organizations
- Historical timeline from 2011-2026
- Dual-regime economic system explained
- All major stakeholders documented
