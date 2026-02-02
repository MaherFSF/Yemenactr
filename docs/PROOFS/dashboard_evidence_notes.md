# Dashboard Evidence Pack Verification Notes

## Date: February 2, 2026

### Dashboard KPI Evidence Verification

**Test Location:** `/dashboard` page

**Test 1: Quick Stats - Annual Inflation Rate (Aden)**
- KPI shows: 25.0% with confidence badge "C"
- Evidence button: "الأدلة" (Evidence) link present
- Clicking opens Evidence Pack drawer
- Sources tab shows: "مصدر بيانات عينة" (Sample Data Source)
- Date: 10-01-2026
- Quality: C (تقدير/estimate)

**Observation:** The dashboard KPIs are using hardcoded sample data (EvidencePackData passed inline) rather than fetching from the database. This is because the Dashboard.tsx component passes static `data` prop to EvidencePackButton instead of using `subjectType` and `subjectId` to fetch from DB.

### Evidence Pack API Verification

**API Test:** `evidence.getBySubject` for metric type
```
curl "http://localhost:3000/api/trpc/evidence.getBySubject?batch=1&input={...subjectType:metric,subjectId:CPI_ANNUAL_aden_irg...}"
```

**Result:** Successfully returns evidence pack with:
- id: 30074
- subjectType: "metric"
- subjectId: "CPI_ANNUAL_aden_irg"
- subjectLabel: "CPI ANNUAL (Aden)"
- confidenceGrade: "A"
- citations: Central Bank of Yemen - Aden
- geoScope: "Aden"
- regimeTags: ["aden_irg"]

### Database Verification

**Evidence Packs for Metrics:** 552 packs
**Unique Indicator/Regime Combinations:** 411

All indicators have evidence pack coverage in the database.

### Next Steps

To fully connect dashboard KPIs to real evidence packs:
1. Update Dashboard.tsx to pass `subjectType="metric"` and `subjectId={indicatorCode}` to EvidencePackButton
2. Remove hardcoded `data` prop from EvidencePackButton calls
3. Map indicator names to their database codes (e.g., "inflation_aden" -> "CPI_ANNUAL_aden_irg")
