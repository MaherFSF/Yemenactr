# Browser Proof: /sectors/banking Page
**Timestamp:** 2026-02-01T18:32:00Z
**URL:** https://3000-i4vxq021yxgpq5e84k6y8-91e2125c.sg1.manus.computer/sectors/banking

## Findings

### Page Status: ✅ WORKING (with issues)
- Page loads successfully in Arabic (RTL)
- Shows banking sector overview with tabs
- Contains alerts, reports, and tools sections

### KPI Cards (Top Section):
| KPI | Value | Confidence | Source |
|-----|-------|------------|--------|
| عدد البنوك (Bank Count) | 0 بنك | A | قائمة البنك المركزي اليمني 2024 |
| إجمالي الأصول (Total Assets) | N/A | B | البنك المركزي اليمني 2024 |
| نسبة كفاية رأس المال (CAR) | N/A | B | تقارير البنوك السنوية 2024 |
| القروض غير العاملة (NPL) | N/A | C | تقديرات صندوق النقد الدولي 2024 |

### Alerts Section:
- عقوبات OFAC - بنك اليمن الدولي (17 أبريل 2025)
- عقوبات OFAC - بنك اليمن والكويت (17 يناير 2025)
- تقرير البنك الدولي (نوفمبر 2025)

### Reports Section:
- تشخيص القطاع المالي 2024 (البنك الدولي - 152 صفحة)
- مرصد الاقتصاد اليمني 2024 (البنك الدولي)
- تحليل القطاع المالي (ACAPS - 2022)
- تأثير الصراع على القطاع المالي (ODI)

### Sources Used Section (Bottom):
**STATUS: ❌ EMPTY**
- Shows: "لا توجد مصادر مرتبطة بهذا القطاع حالياً" (No sources linked to this sector currently)
- This is a P0 issue - KPIs cite sources but SourcesUsedPanel shows empty

### Issues Identified:
1. **P0**: SourcesUsedPanel shows "no sources linked" despite KPIs citing sources
2. **P1**: Bank count shows 0 instead of actual count
3. **P1**: Total Assets, CAR, NPL show N/A - may be correct if no evidence

### Screenshot:
/home/ubuntu/screenshots/3000-i4vxq021yxgpq5e_2026-02-01_13-31-59_3311.webp


## Update: 2026-02-01T18:35:21Z

### KPI Cards NOW SHOWING DATA:
| KPI | Value | Confidence | Source |
|-----|-------|------------|--------|
| عدد البنوك (Bank Count) | 39 بنك | A | قائمة البنك المركزي اليمني 2024 |
| إجمالي الأصول (Total Assets) | $18.8B | B | البنك المركزي اليمني 2024 |
| نسبة كفاية رأس المال (CAR) | 18.3% | B | تقارير البنوك السنوية 2024 |
| القروض غير العاملة (NPL) | 16.8% | C | تقديرات صندوق النقد الدولي 2024 |

### Chart Visible:
- تطور القطاع المصرفي (2010-2025) - Banking sector evolution chart showing asset decline

### Banks Table:
- Shows 10 major banks with assets, CAR, and status
- Includes OFAC-sanctioned banks with warnings

### Sources Used Section:
**STATUS: ❌ STILL EMPTY**
- Still shows: "لا توجد مصادر مرتبطة بهذا القطاع حالياً"
- Root cause: The getSectorSources query joins time_series → indicators → sources
- But banking indicators have data, so the issue is in the query or component

### Root Cause Analysis:
The SourcesUsedPanel calls two endpoints:
1. `feedMatrix.getSourcesForPage` - may not be returning data
2. `sectorPages.getSectorSources` - query works in DB but may fail in tRPC

Need to check if the component is receiving the data correctly.
