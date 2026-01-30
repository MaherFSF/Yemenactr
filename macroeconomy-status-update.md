# Macroeconomy Page Status Update

## Current Status: PARTIALLY WORKING ✅

### What's Working:
1. **GDP Chart** - The chart is now displaying data from 2010-2026 showing GDP trends
   - Shows the decline from ~35B to ~15B during conflict years
   - Data from World Bank World Development Indicators

2. **Sources Panel** - Shows 3 sources:
   - World Bank WDI (32 data points)
   - UN Population Division (16 data points)
   - IMF WEO (16 data points)

3. **Related Research** - Links to:
   - Yemen Economic Monitor - Fall 2025 (World Bank)
   - IMF Article IV Consultation - Yemen

### What Needs Fixing:
1. **KPI Cards** - Still showing "Loading..." for:
   - GDP (Nominal)
   - GDP Per Capita
   - GDP Growth
   - Only Population (33.8M) shows actual data

### Root Cause:
The KPIs are fetched from `sectorPages.getSectorPageData` which looks for data in the `sector_kpis` table, but the time series data is in the `time_series` table. The chart works because it uses `getSectorTimeSeries` which queries the time_series table directly.

### Solution:
Either:
1. Populate the sector_kpis table with macro KPIs
2. Or modify the Macroeconomy page to derive KPIs from time_series data
