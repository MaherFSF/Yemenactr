# Sources Used Panel - FIXED

## Timestamp: 2026-02-01T18:37:17Z

## Status: ✅ WORKING

The "المصادر المستخدمة في هذه الصفحة" (Sources Used on This Page) section now shows data:

### Visible in Screenshot:
- **22 مصدر** (22 sources) displayed
- **حكومي رسمي 1** (1 Official Government source) - T0 tier
- **منظمة دولية 18** (18 International Organization sources) - T1 tier
- Multiple **نقطة بيانات** (data point) entries visible

### Fix Applied:
Updated `source_registry.sectorCategory` to 'Banking' for 20 sources that had:
- Name containing 'Bank', 'CBY', 'Monetary'
- sectorsFed containing 'Banking' or 'Monetary'

### SQL Used:
```sql
UPDATE source_registry SET sectorCategory = 'Banking' 
WHERE name LIKE '%Bank%' 
   OR name LIKE '%CBY%'
   OR name LIKE '%Monetary%'
   OR JSON_CONTAINS(sectorsFed, '"Banking"')
   OR JSON_CONTAINS(sectorsFed, '"Monetary"')
```

### Root Cause:
The `feedMatrix.getSourcesForPage` endpoint queries `source_registry.sectorCategory` 
but no sources had this field populated for the banking sector.

### P0 Issue Resolved:
- [x] /sectors/banking "no sources linked" - **FIXED**
