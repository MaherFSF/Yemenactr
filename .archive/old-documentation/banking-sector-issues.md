# Banking Sector Page Issues

## Current State
The banking sector page loads but shows:
- Number of Banks: 0 (should show actual count)
- Total Assets: N/A
- Capital Adequacy Ratio: N/A
- Non-Performing Loans: N/A

## Main Banks Section
The "Main Banks" section shows empty skeleton loaders (green bars) - no actual bank data is being displayed.

## What's Working
- Page structure loads correctly
- Tabs work (Overview, Operating Banks, System Comparison)
- Alerts section shows OFAC sanctions data
- Research reports links are present
- Central Bank circulars section exists

## Root Cause
The banking sector data needs to be populated in the database. The KPIs and bank list are fetching from the database but returning empty results.

## Required Fix
1. Backfill banking sector data into the database
2. Add bank entities with their financial metrics
3. Wire the KPI cards to actual data sources
