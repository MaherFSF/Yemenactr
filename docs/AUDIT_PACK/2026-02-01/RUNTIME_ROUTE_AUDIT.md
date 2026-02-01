# Runtime Route Audit Report
# تقرير تدقيق المسارات أثناء التشغيل

**Generated:** 2026-02-01T17:07:00Z  
**Dev Server:** https://3000-i4vxq021yxgpq5e84k6y8-91e2125c.sg1.manus.computer  
**Status:** Running

---

## 1. Route Test Results / نتائج اختبار المسارات

### Public Routes / المسارات العامة

| Route | Status | Data Source | Notes |
|-------|--------|-------------|-------|
| `/` | ✅ Working | Static | Landing page loads |
| `/en/entities` | ❌ 404 | - | Route not found |
| `/sectors/banking` | ✅ Working | Mixed | Shows 39 banks, charts, alerts |
| `/sectors/macro` | ⚠️ Untested | - | Not visited |
| `/dashboard` | ⚠️ Untested | - | Not visited |
| `/timeline` | ⚠️ Untested | - | Not visited |
| `/research` | ⚠️ Untested | - | Not visited |

### Admin Routes / مسارات الإدارة

| Route | Status | Data Source | Notes |
|-------|--------|-------------|-------|
| `/admin/sources` | ⚠️ Untested | - | Not visited |
| `/admin/ingestion` | ⚠️ Untested | - | Not visited |
| `/admin/users` | ⚠️ Untested | - | Not visited |

---

## 2. Banking Sector Page Analysis / تحليل صفحة قطاع البنوك

### Page: `/sectors/banking`

**Status:** ✅ Working

### KPIs Displayed
| KPI | Value | Grade | Source Cited |
|-----|-------|-------|--------------|
| Number of Banks | 39 | A | CBY Bank List 2024 |
| Total Assets | $18.8B | B | CBY 2024 |
| Capital Adequacy | 18.3% | B | Bank Annual Reports 2024 |
| NPL Ratio | 16.8% | C | IMF Estimates 2024 |

### Data Sources
- "Sources Used on This Page: No sources currently linked to this sector"
- **Issue:** Sources section shows "No sources" despite citing CBY, IMF in KPIs

### Banks Table
- Shows 10 banks with assets, CAR, status
- Links to individual bank profiles (`عرض` buttons)
- **Data appears to be from `commercial_banks` table (39 rows)**

### Charts
- Banking sector evolution chart (2010-2025)
- Shows decline from $17B (2010) to $6.9B (2025)

### Alerts Section
- OFAC sanctions alerts displayed
- Links to CBY circulars

---

## 3. Entity Routes Issue / مشكلة مسارات الكيانات

### Problem
- `/en/entities` returns **404 Page Not Found**
- Entity directory route is broken

### Expected Behavior
- Should show searchable list of 79 entities from `entities` table

### Root Cause Analysis
- Route may not be registered in `App.tsx`
- Or route path mismatch (`/en/entities` vs `/entities`)

### Files to Check
- `client/src/App.tsx` - Route registration
- `client/src/pages/EntityDirectory.tsx` - Component exists

---

## 4. Data Source Verification / التحقق من مصادر البيانات

### Banking Page Data Flow
```
UI Component → tRPC Query → Database Table
─────────────────────────────────────────
Bank count (39) → banking.getBanks → commercial_banks
Bank list → banking.list → commercial_banks
Charts → banking.getTimeSeries → time_series (?)
Alerts → alerts.getRecent → sector_alerts (?)
```

### Evidence
- Bank count matches `commercial_banks` table (39 rows)
- Chart data source unclear (may be hardcoded)
- "No sources linked" warning suggests missing provenance

---

## 5. P0 Route Issues / مشاكل P0 في المسارات

| # | Issue | Route | Impact |
|---|-------|-------|--------|
| 1 | Entity directory 404 | `/en/entities` | Users cannot browse entities |
| 2 | Sources not linked | `/sectors/banking` | Provenance broken |

---

## 6. Screenshots / لقطات الشاشة

### Landing Page
- **Path:** `/home/ubuntu/screenshots/webdev-preview-1769965533.png`
- **Status:** ✅ Working

### Banking Sector
- **Path:** `/home/ubuntu/screenshots/3000-i4vxq021yxgpq5e_2026-02-01_12-06-26_4678.webp`
- **Status:** ✅ Working, shows data

### Entity Directory (404)
- **Path:** `/home/ubuntu/screenshots/3000-i4vxq021yxgpq5e_2026-02-01_12-05-55_2507.webp`
- **Status:** ❌ 404 error

---

## 7. Recommendations / التوصيات

1. **P0:** Fix `/en/entities` route - register in App.tsx or fix path
2. **P0:** Wire source provenance to banking sector page
3. **P1:** Complete runtime audit of all routes
4. **P1:** Verify chart data sources (may be hardcoded)

---

**Report Generated:** 2026-02-01T17:07:00Z  
**Auditor:** Manus AI (QA/E2E Lead)
