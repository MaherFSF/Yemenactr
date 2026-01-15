# YETO Deep Functional Audit Findings

## Source: YETO-DEEP-FUNCTIONAL-AUDIT.pdf (January 14, 2026)

## Critical Issues Identified

### 1. Static vs Dynamic Data Issues

| Element | Current State | Must Be |
|---------|--------------|---------|
| Exchange rates | STATIC (hardcoded) | DYNAMIC - API feed every 6 hours |
| "Jan 2026" dates | STATIC text | DYNAMIC - actual timestamp |
| Gap calculation | STATIC | DYNAMIC - calculated from live rates |
| Chart data | STATIC array | DYNAMIC - from observations table |
| YoY change | STATIC | DYNAMIC - calculated from historical data |

### 2. Data Inconsistencies Found (Currency Page)

| Data Point | Location 1 | Location 2 | Conflict |
|------------|-----------|------------|----------|
| Aden Parallel Rate | Hero: 1,950 YER/$ | Table: 2,320 YER/$ | 370 YER DIFFERENCE |
| Aden Official Rate | Hero: 1,890 YER/$ | Table: 1,800 YER/$ | 90 YER DIFFERENCE |
| Sana'a Rate | Hero: 530 YER/$ | Table: 562 YER/$ | 32 YER DIFFERENCE |
| Gap Percentage | Hero: 268% | Table: 313% | 45% DIFFERENCE |

### 3. Required Dynamic Feeds

1. **CBY Aden Official Rate**
   - Source: https://cby-ye.com
   - Frequency: Every 6 hours
   - Method: Web scrape or API if available

2. **CBY Sana'a Rate**
   - Source: https://cby.gov.ye
   - Frequency: Every 6 hours
   - Method: Web scrape

3. **Al-Kuraimi Exchange (Parallel Market)**
   - Source: https://alkuraimi.com
   - Frequency: Every 6 hours
   - Method: API or scrape

4. **Market Survey Data**
   - Source: WFP Market Monitor, FSAC
   - Frequency: Weekly
   - Method: API from data.humdata.org

### 4. Missing Historical Events (Currency Page)

The audit found only 3 events shown. Missing major events:
- 2015: Saudi intervention begins
- 2016: CBY moved to Aden
- 2017: Salary crisis
- 2018: Stockholm Agreement
- 2020: COVID impact
- 2021: Marib offensive
- 2023: Truce period

### 5. Test Results Summary

| Test | Result | Notes |
|------|--------|-------|
| Evidence Button on Exchange Rate KPI | ✅ WORKS | Opens modal with evidence pack |
| News Article Link Click | ⚠️ PARTIAL | Links to sector page, not article |
| Export Button on Currency Page | ⚠️ PARTIAL | Button exists but no dropdown |
| Historical Tab on Currency Page | ✅ WORKS | Tab switches content |

### 6. Homepage Issues

- "آخر تحديث: الآن" (Last update: Now) is MISLEADING
- Data shows December 28, 2024 but today is January 14, 2026
- This is STATIC HARDCODED data, NOT live feed

## Action Items

1. [ ] Replace all hardcoded exchange rate data with database queries
2. [ ] Implement 6-hour refresh schedule for exchange rate data
3. [ ] Fix data inconsistencies between hero cards and tables
4. [ ] Add missing historical events (2015-2023)
5. [ ] Fix export button dropdown functionality
6. [ ] Update news links to point to actual articles
7. [ ] Implement dynamic "Last Updated" timestamps
8. [ ] Calculate YoY changes from historical data

## Notes

The audit emphasizes that **everything must be dynamic, not static**. The platform should pull data from the database and display actual timestamps, not hardcoded values.
