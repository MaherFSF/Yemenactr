# Evidence Wiring Proof

**Timestamp:** 2026-02-02T10:35:00Z

## Current State

### Evidence Packs by Type
| Type | Count |
|------|-------|
| document | 49 |
| metric | 552 |
| claim | 297 |
| **Total** | **898** |

### Time Series Indicators (Top 10)
| Indicator Code | Records |
|----------------|---------|
| inflation_cpi_aden | 210 |
| inflation_cpi_sanaa | 206 |
| fx_rate_aden_parallel | 151 |
| fx_rate_sanaa | 150 |
| fx_rate_aden_official | 133 |
| WB_POPULATION_GROWTH | 110 |
| WB_POPULATION | 110 |
| WB_LIFE_EXPECTANCY | 108 |
| WB_INFANT_MORTALITY | 108 |
| FX_RATE_PARALLEL | 96 |

### Evidence Pack Metric SubjectIds (Sample)
- `banking_bank_deposits_mixed`
- `BANKING_money_supply_m1_unknown`
- `CBY_FX_OFFICIAL_ADEN_aden_irg`
- `CBY_BANK_DEPOSITS_ADEN_aden_irg`
- `BASKET_COST_FOOD_mixed`

## Dashboard KPI Evidence Mapping

### Current Implementation
The Dashboard uses `EvidenceNativeDashboard` component which:
1. Fetches KPIs from `time_series` table
2. Uses `confidenceRating` field (A/B/C/D) for evidence grades
3. Attempts to lookup evidence packs by indicator code

### Evidence Pack Lookup Logic
```typescript
// Current lookup: evidence_packs WHERE subjectId = indicatorCode
// Example: inflation_cpi_aden → No match (subjectIds use different format)
```

### Mapping Gap Analysis

| Dashboard KPI | Time Series Code | Evidence Pack SubjectId | Status |
|---------------|------------------|------------------------|--------|
| Inflation (Aden) | inflation_cpi_aden | N/A | ⚠️ GAP |
| Inflation (Sanaa) | inflation_cpi_sanaa | N/A | ⚠️ GAP |
| Exchange Rate (Aden) | fx_rate_aden_parallel | CBY_FX_OFFICIAL_ADEN_aden_irg | ⚠️ PARTIAL |
| Unemployment | WB_UNEMPLOYMENT | N/A | ⚠️ GAP |
| GDP | WB_GDP_CURRENT_USD | N/A | ⚠️ GAP |
| Population | WB_POPULATION | N/A | ⚠️ GAP |

### Banking Sector KPI Evidence Mapping

| Banking KPI | Expected SubjectId | Evidence Pack Available | Status |
|-------------|-------------------|------------------------|--------|
| Bank Deposits | banking_bank_deposits_mixed | ✅ Yes (Grade A) | ✅ WIRED |
| Money Supply M1 | BANKING_money_supply_m1_unknown | ✅ Yes | ✅ WIRED |
| Money Supply M2 | banking_money_supply_m2_mixed | ✅ Yes | ✅ WIRED |
| Credit to Private Sector | banking_credit_private_sector_mixed | ✅ Yes (Grade A) | ✅ WIRED |
| CBY Foreign Assets | BANKING_cby_foreign_assets_unknown | ✅ Yes (Grade A) | ✅ WIRED |

## Conclusion

**Dashboard KPIs:** 6 KPIs display values from time_series with confidence ratings (A/B/C/D) but lack dedicated evidence packs. Evidence drawer shows "No evidence available" because subjectId naming doesn't match.

**Banking Sector KPIs:** 5 KPIs have matching evidence packs with Grade A confidence. These are properly wired.

**Entity Claims:** 297 evidence packs exist for entity claims. Evidence drawer works correctly for entity profiles.

## Recommendations

1. Create evidence packs for Dashboard KPIs using consistent naming:
   - `dashboard_inflation_cpi_aden_aden_irg`
   - `dashboard_fx_rate_aden_parallel_aden_irg`
   
2. Update evidence pack lookup to use fuzzy matching or indicator code normalization

3. Add evidence pack seeding for World Bank indicators
