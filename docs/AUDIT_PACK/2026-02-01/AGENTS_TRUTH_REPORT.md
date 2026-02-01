# Agents Truth Report
# تقرير حقيقة الوكلاء

**Generated:** 2026-02-01T17:04:00Z  
**Total Agent Files:** 5  
**Scheduler Jobs:** 36

---

## 1. Agent Inventory / قائمة الوكلاء

### Sector Agents / وكلاء القطاعات

| Agent | File | Purpose | UI Location |
|-------|------|---------|-------------|
| Macro Sector Agent | `server/services/macroSectorAgent.ts` | Macro analysis, briefs, alerts | `/sectors/macro` |
| Labor Wages Agent | `server/services/laborWagesAgent.ts` | Labor market analysis | `/sectors/labor` |
| Poverty Humandev Agent | `server/services/povertyHumandevAgent.ts` | Poverty/HDI analysis | `/sectors/poverty` |
| Sector Agent Service | `server/services/sectorAgentService.ts` | Base sector agent logic | All sector pages |

### AI Agents / وكلاء الذكاء الاصطناعي

| Agent | File | Purpose | UI Location |
|-------|------|---------|-------------|
| One Brain | `server/services/oneBrain.ts` | AI assistant | `/ai`, chat interface |
| Insight Miner | `server/services/insightMiner.ts` | Signal detection | `/admin/insights` |

### Verification Agents / وكلاء التحقق

| Agent | File | Purpose | UI Location |
|-------|------|---------|-------------|
| Gap Detection | `server/services/gapDetection.ts` | Data gap identification | `/admin/gaps` |
| Contradiction Detection | `server/services/contradictionDetection.ts` | Conflict detection | `/admin/contradictions` |

---

## 2. Scheduler Jobs / وظائف المجدول

### Data Refresh Jobs (17)
| Job Name | Type | Enabled | Last Status |
|----------|------|---------|-------------|
| world_bank_daily | data_refresh | ✅ | success |
| imf_weo_update | data_refresh | ✅ | null |
| cby_daily | data_refresh | ✅ | success |
| ocha_humanitarian_update | data_refresh | ✅ | null |
| wfp_daily | data_refresh | ✅ | success |
| unhcr_daily | data_refresh | ✅ | success |
| unicef_daily | data_refresh | ✅ | success |
| who_daily | data_refresh | ✅ | success |
| undp_daily | data_refresh | ✅ | success |
| reliefweb_daily | data_refresh | ✅ | success |
| hdx_daily | data_refresh | ✅ | success |
| iati_daily | data_refresh | ✅ | success |
| fews_net_daily | data_refresh | ✅ | success |
| sanctions_daily | data_refresh | ✅ | success |
| banking_data_refresh | data_refresh | ✅ | null |
| cby_exchange_rate_update | data_refresh | ✅ | null |
| imf_exchange_rate_update | data_refresh | ✅ | null |

### Signal Detection Jobs (4)
| Job Name | Type | Enabled | Last Status |
|----------|------|---------|-------------|
| signal_detection | signal_detection | ✅ | success |
| acled_conflict_update | signal_detection | ✅ | null |
| data_quality_check | signal_detection | ✅ | null |
| sanctions_monitoring | signal_detection | ✅ | null |

### Publication Jobs (7)
| Job Name | Type | Enabled | Last Status |
|----------|------|---------|-------------|
| daily_snapshot_publication | publication | ✅ | success |
| weekly_digest_publication | publication | ✅ | success |
| monthly_report_publication | publication | ✅ | success |
| quarterly_outlook_publication | publication | ✅ | success |
| annual_review_publication | publication | ✅ | success |
| insight_miner_nightly | signal_detection | ✅ | success |
| research_publications_scan | publication | ✅ | null |

### Maintenance Jobs (2)
| Job Name | Type | Enabled | Last Status |
|----------|------|---------|-------------|
| database_backup | backup | ✅ | null |
| cleanup_old_logs | cleanup | ✅ | null |

---

## 3. Agent → UI Wiring / ربط الوكلاء بالواجهة

### Verified Wiring ✅
| Agent | UI Component | Route | Status |
|-------|--------------|-------|--------|
| One Brain | `AIChatBox.tsx` | `/ai` | ✅ Wired |
| Sector Agent | `SectorPage.tsx` | `/sectors/*` | ✅ Wired |

### Missing/Broken Wiring ❌
| Agent | Expected UI | Route | Issue |
|-------|-------------|-------|-------|
| Macro Sector Agent | Sector briefs | `/sectors/macro` | sector_briefs empty |
| Labor Wages Agent | Labor alerts | `/sectors/labor` | sector_alerts empty |
| Gap Detection | Gap tickets | `/admin/gaps` | gap_tickets empty |
| Contradiction Detection | Contradictions | `/admin/contradictions` | data_contradictions empty |
| Insight Miner | Insights | `/admin/insights` | No UI component found |

---

## 4. Agent Run Status / حالة تشغيل الوكلاء

### sector_agent_runs Table
```sql
SELECT COUNT(*) FROM sector_agent_runs;
-- Result: Unknown (schema drift issue)
```

**Issue:** TypeScript errors prevent sector_agent_runs from being written correctly.

### Proof from TypeScript Errors
```
server/services/laborWagesAgent.ts(784,7): error TS2769
  'sectorCode' does not exist in type
```

---

## 5. Missing Agents / الوكلاء المفقودون

| Agent | Mentioned In | Status |
|-------|--------------|--------|
| Entity Resolution Agent | Docs | ❌ Not found |
| Provenance Agent | Docs | ❌ Not found |
| Translation Agent | Docs | ❌ Not found |
| Quality Assurance Agent | Docs | ❌ Not found |

---

## 6. P0 Agent Issues / مشاكل P0 في الوكلاء

| # | Issue | Impact | File Path |
|---|-------|--------|-----------|
| 1 | sector_agent_runs schema drift | Agent runs not logged | `server/services/laborWagesAgent.ts:784` |
| 2 | sector_briefs empty | No briefs generated | `server/services/macroSectorAgent.ts` |
| 3 | sector_alerts empty | No alerts generated | `server/services/laborWagesAgent.ts` |
| 4 | gap_tickets empty | Gap detection not running | `server/services/gapDetection.ts` |

---

## 7. Recommendations / التوصيات

1. **P0:** Fix sector_agent_runs schema to match TypeScript expectations
2. **P0:** Wire sector agents to generate briefs and alerts
3. **P1:** Create Insight Miner UI component
4. **P1:** Enable gap detection agent
5. **P2:** Implement missing agents (entity resolution, provenance, translation)

---

**Report Generated:** 2026-02-01T17:04:00Z  
**Auditor:** Manus AI (QA/E2E Lead)
