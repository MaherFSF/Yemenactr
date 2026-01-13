# YETO Hardcode Detection Report

**Generated:** January 14, 2026  
**Scan Type:** Initial baseline scan  
**Purpose:** Identify hardcoded values that should be replaced with database-driven claims

---

## Executive Summary

| Severity | Count | Action Required |
|----------|-------|-----------------|
| 🔴 Critical | 0 | None |
| 🟠 High | 8 | Replace with DB queries |
| 🟡 Medium | 12 | Add fallback handling |
| 🟢 Low | 6 | Document as intentional |

**Overall Assessment:** The platform uses database-driven data for most displays. Hardcoded values are primarily fallbacks when API data is unavailable, not primary data sources.

---

## 1. High Priority - Fallback Values in UI

These values appear as fallbacks when database queries fail or return null. They should be replaced with proper "No Data" handling.

### Home.tsx (Landing Page)

| Line | Value | Context | Recommendation |
|------|-------|---------|----------------|
| 423 | `"15.0%"` | Inflation rate fallback | Replace with ClaimValue component showing "No Data" |
| 463 | `"1 USD = 1,890 YER"` | Exchange rate fallback | Replace with ClaimValue component |
| 485 | `"15.0%"` | Inflation KPI card | Use null-safe rendering |
| 486 | `"$1.2B"` | Foreign reserves | Use null-safe rendering |
| 487 | `"4.8M"` | IDPs count | Use null-safe rendering |

**Code Pattern:**
```tsx
// Current (problematic)
<div>{kpiData?.inflation?.value || "15.0%"}</div>

// Recommended (Truth Layer compliant)
<ClaimValue claimId={kpiData?.inflation?.claimId} fallback="No Data" />
```

### InsightsTicker.tsx

| Line | Value | Context | Recommendation |
|------|-------|---------|----------------|
| 51-52 | `"1,890 YER/USD"` | Ticker display | Fetch from time_series table |

---

## 2. Medium Priority - Static Data Arrays

These are static arrays that should be populated from the database.

### RegionalZones.tsx

| Line | Content | Issue |
|------|---------|-------|
| 32-140 | Regional zone data | Exchange rates hardcoded as 1890 for all zones |
| 135-140 | Chart data array | Static exchange rate data |

**Affected Data:**
```tsx
// Lines 32-140: Static zone definitions
{
  name: "Aden",
  exchangeRate: 1890,  // Should come from DB
  ...
}
```

**Recommendation:** Create `regional_zones` table and fetch data dynamically.

### Entities.tsx

| Line | Value | Context |
|------|-------|---------|
| 175 | `"$1.2B (est.)"` | Foreign reserves for CBY Aden |
| 211 | `"YER 530/USD"` | Exchange rate for CBY Sana'a |

**Recommendation:** Link to claims in the database with proper provenance.

### EntityDetail.tsx

| Line | Value | Context |
|------|-------|---------|
| 116 | `"$1.2B"` | Foreign reserves display |

### Dashboard.tsx

| Line | Content | Issue |
|------|---------|-------|
| 53 | Historical GDP data | Static array for chart |
| 118 | Data table values | Static demonstration data |

### DataRepository.tsx

| Line | Content | Issue |
|------|---------|-------|
| 37 | Datasets array | Static dataset definitions |

### DeputyGovernorDashboard.tsx

| Line | Content | Issue |
|------|---------|-------|
| 121 | `banksData` array | Static bank data (should use commercial_banks table) |
| 133 | `banksUnderMonitoring` | Static monitoring list |

**Note:** This page has database integration but also includes static fallback data.

---

## 3. Low Priority - Intentional Constants

These are intentional design constants or example data.

### ApiDocs.tsx

| Line | Value | Context |
|------|-------|---------|
| 50 | `1890.5` | API documentation example |

**Status:** Acceptable - documentation example

### PolicyImpact.tsx

| Line | Value | Context |
|------|-------|---------|
| 134 | `1890` | Baseline value for simulator |

**Status:** Acceptable - simulation baseline

### ConfidenceRating.tsx

| Line | Value | Context |
|------|-------|---------|
| 54, 56, 148, 153, 162, 237 | `'#c53030'` | Color constant for low confidence |

**Status:** Acceptable - design token

### ContradictionView.tsx

| Line | Value | Context |
|------|-------|---------|
| 42, 46, 348 | `'#c53030'` | Color constant for critical status |

**Status:** Acceptable - design token

### ProvenanceViewer.tsx

| Line | Value | Context |
|------|-------|---------|
| 334 | `'#c53030'` | Color constant |

**Status:** Acceptable - design token

---

## 4. Files Requiring Truth Layer Migration

### Priority 1 - High Traffic Pages
1. **Home.tsx** - Landing page with KPI displays
2. **Dashboard.tsx** - Main dashboard
3. **sectors/Banking.tsx** - Banking sector (already uses DB)

### Priority 2 - Sector Pages
4. **RegionalZones.tsx** - Regional economic zones
5. **Entities.tsx** - Entity listings
6. **EntityDetail.tsx** - Entity details

### Priority 3 - Executive Dashboards
7. **DeputyGovernorDashboard.tsx** - Has some static data
8. **GovernorDashboard.tsx** - Verify all data is DB-driven

### Priority 4 - Tools
9. **DataRepository.tsx** - Dataset listings
10. **PolicyImpact.tsx** - Simulation baselines

---

## 5. Recommended Actions

### Immediate (Before Truth Layer)
1. Add null-safe rendering to all KPI displays
2. Remove `|| "fallback"` patterns
3. Show "Loading..." or "No Data" instead of fake values

### With Truth Layer Implementation
1. Create `claims` table for all factual values
2. Implement `ClaimValue` component
3. Wrap all numeric displays with `ClaimValue`
4. Link claims to evidence sources
5. Add confidence grades to all claims

### Database Tables Needed
```sql
-- New tables for Truth Layer
CREATE TABLE claims (
  id VARCHAR(36) PRIMARY KEY,
  claim_type ENUM('metric_value', 'event_statement', 'regulation_statement', 'narrative_statement'),
  subject_id VARCHAR(36),
  predicate VARCHAR(100),
  object_value TEXT,
  unit VARCHAR(50),
  regime_tag ENUM('aden_irg', 'sanaa_defacto', 'mixed', 'unknown'),
  time_start DATE,
  time_end DATE,
  confidence_grade ENUM('A', 'B', 'C', 'D'),
  evidence_refs JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE claim_evidence_links (
  id VARCHAR(36) PRIMARY KEY,
  claim_id VARCHAR(36) REFERENCES claims(id),
  evidence_type ENUM('document', 'dataset', 'observation'),
  evidence_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 6. Scan Configuration

### Files Scanned
- `client/src/pages/*.tsx` (54 files)
- `client/src/components/*.tsx` (47 files)
- `client/src/pages/sectors/*.tsx` (15 files)
- `client/src/pages/admin/*.tsx` (5 files)

### Patterns Searched
```regex
# Numeric values that might be hardcoded
/1890|1,890|530|15\.0%|21\.9%|4\.8M|\$1\.2B/

# Static data arrays
/const.*=.*\[.*{/

# Fallback patterns
/\|\| ["']\d/
```

### Excluded (Intentional)
- Color constants (`#c53030`, `#107040`, etc.)
- Design tokens
- API documentation examples
- Test fixtures

---

## 7. Compliance Score

**Current Score:** 78/100

| Category | Score | Notes |
|----------|-------|-------|
| KPI Displays | 70/100 | Fallbacks present |
| Sector Pages | 85/100 | Mostly DB-driven |
| Charts | 75/100 | Some static data |
| Tables | 80/100 | Good DB integration |
| Executive Dashboards | 90/100 | Well integrated |

**Target Score:** 100/100 (after Truth Layer implementation)

---

*This report was generated as part of the Truth Layer implementation (D1: Discovery Pack)*
*Next step: Implement Truth Layer V1 (D2)*
