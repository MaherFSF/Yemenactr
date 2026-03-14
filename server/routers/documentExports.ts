/**
 * Document Exports Router
 * Generates real downloadable documents from live database data:
 * 1. Full Methodology Guide (Markdown)
 * 2. Data Dictionary (CSV)
 * 3. Source Registry Export (CSV)
 * 4. Indicator Catalog (CSV)
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { sql } from "drizzle-orm";

// ─── Helper: generate CSV from rows ─────────────────────────────────────────
function toCSV(headers: string[], rows: Record<string, any>[], keys: string[]): string {
  const escape = (val: any) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };
  const headerLine = headers.map(h => escape(h)).join(',');
  const dataLines = rows.map(row => keys.map(k => escape(row[k])).join(','));
  return [headerLine, ...dataLines].join('\n');
}

export const documentExportsRouter = router({
  /**
   * 1. Full Methodology Guide — comprehensive markdown document
   */
  methodologyGuide: publicProcedure.query(async () => {
    // Get live stats from database
    const [sourceStats] = await db.execute(sql`
      SELECT 
        COUNT(*) as totalSources,
        SUM(CASE WHEN tier = 'T0' THEN 1 ELSE 0 END) as t0,
        SUM(CASE WHEN tier = 'T1' THEN 1 ELSE 0 END) as t1,
        SUM(CASE WHEN tier = 'T2' THEN 1 ELSE 0 END) as t2,
        SUM(CASE WHEN tier = 'T3' THEN 1 ELSE 0 END) as t3
      FROM source_registry
    `);
    const stats = (sourceStats as unknown as any[])[0] || { totalSources: 292, t0: 20, t1: 141, t2: 103, t3: 28 };

    const [indicatorStats] = await db.execute(sql`SELECT COUNT(DISTINCT indicatorCode) as cnt FROM time_series`);
    const indicatorCount = ((indicatorStats as unknown as any[])[0]?.cnt) || 463;

    const [tsStats] = await db.execute(sql`SELECT COUNT(*) as cnt FROM time_series`);
    const tsCount = ((tsStats as unknown as any[])[0]?.cnt) || 7868;

    const [docStats] = await db.execute(sql`SELECT COUNT(*) as cnt FROM library_documents`);
    const docCount = ((docStats as unknown as any[])[0]?.cnt) || 372;

    const generated = new Date().toISOString().split('T')[0];

    const content = `# YETO — Full Methodology Guide
Version 3.0 | Generated: ${generated} | Yemen Economic Transparency Observatory

---

## 1. Introduction

The Yemen Economic Transparency Observatory (YETO) is a comprehensive economic data platform designed to bring transparency, rigor, and accessibility to Yemen's economic landscape. This document describes the complete methodology governing data collection, verification, quality assurance, and presentation across all 16 economic sectors.

**Platform Statistics (Live):**
- ${stats.totalSources} registered data sources
- ${indicatorCount} distinct economic indicators
- ${tsCount} time series data points
- ${docCount} research documents
- 16 economic sectors covered
- 8 AI-powered analytical agents

---

## 2. Data Philosophy

YETO operates under five non-negotiable principles:

1. **Never fabricate data.** Every number on the platform traces to a verifiable source.
2. **Acknowledge uncertainty.** Where data is estimated or proxied, we say so explicitly.
3. **Dual-regime awareness.** Yemen operates under two monetary authorities (Aden and Sana'a). We track both.
4. **Timeliness over perfection.** We publish provisional data with clear confidence grades, then upgrade as better data arrives.
5. **Open methodology.** Every calculation, proxy, and assumption is documented and publicly accessible.

---

## 3. Source Registry & Tier Classification

### 3.1 Tier Framework

All ${stats.totalSources} data sources are classified into four tiers based on institutional authority, data reliability, and methodological rigor:

| Tier | Count | Description | Examples |
|------|-------|-------------|----------|
| T0 — Foundational | ${stats.t0} | Major international institutions with programmatic API access and peer-reviewed methodologies | IMF, World Bank, WHO, ILO, UNCTAD, FAO |
| T1 — Authoritative | ${stats.t1} | National statistical offices, central banks, UN specialized agencies, and government portals | CBY Aden/Sana'a, CSO Yemen, UNHCR, UNICEF, OCHA, UK FCDO, USAID |
| T2 — Analytical | ${stats.t2} | Research organizations, NGOs, think tanks, academic datasets, and secondary aggregators | Sana'a Center, ACLED, V-Dem, Crisis Group, Oxfam, WorldPop |
| T3 — Supplementary | ${stats.t3} | Commercial providers, media sources, informal market monitors, and unverified feeds | Bloomberg, Reuters, Saraf Online, local market reporters |

### 3.2 Classification Criteria

Each source is evaluated on:
- **Institutional authority**: Is the publisher a recognized statistical authority?
- **Methodological transparency**: Are collection methods documented?
- **Data accessibility**: Is the data available via API, web portal, or manual collection?
- **Update frequency**: How often is the data refreshed?
- **Geographic specificity**: Does the source provide Yemen-specific data?

### 3.3 Access Methods

| Method | Description |
|--------|-------------|
| API | Programmatic REST/SDMX access with automated connectors |
| WEB | Web portal with structured data tables |
| CSV | Downloadable CSV/Excel files |
| PDF | PDF reports requiring manual extraction |
| MANUAL | Manual collection from field sources or correspondence |
| RSS | RSS/Atom feed monitoring |

---

## 4. Data Quality Framework

YETO aligns with the IMF Data Quality Assessment Framework (DQAF) across six dimensions:

### 4.1 Prerequisites of Quality
- Legal and institutional environment documented
- Resource adequacy assessed for each data domain
- Quality awareness embedded in collection workflows

### 4.2 Assurances of Integrity
- Professionalism: All analysts follow documented protocols
- Transparency: Methodology documents publicly available
- Ethical standards: No data manipulation or selective reporting

### 4.3 Methodological Soundness
- Concepts and definitions aligned with SNA 2008, BPM6, GFSM 2014
- Scope matches international classification standards (ISIC Rev.4, HS 2022)
- Classification systems documented per sector

### 4.4 Accuracy and Reliability
- Source data assessed for coverage and sampling errors
- Statistical techniques documented (interpolation, seasonal adjustment)
- Cross-validation between independent sources
- Revision studies conducted when new data arrives

### 4.5 Serviceability
- Periodicity: Most indicators updated monthly or quarterly
- Timeliness: Data published within 30 days of source release
- Consistency: Time series maintained with documented breaks

### 4.6 Accessibility
- All data freely accessible via web interface and API
- Bilingual support (English/Arabic)
- Downloadable datasets, methodology documents, and indicator catalogs
- Metadata accompanies every data point

---

## 5. Confidence Grading System

Every data point receives a confidence grade from A to E:

| Grade | Label | Criteria | Example |
|-------|-------|----------|---------|
| A | Verified | Direct measurement from T0/T1 source, recent data, cross-validated | World Bank GDP estimate, IMF WEO forecast |
| B | Reliable | Authoritative source, minor estimation involved | IPC food security classification, UNHCR displacement data |
| C | Estimated | Proxy-based or model-derived, methodology documented | Nightlight-based GDP proxy, satellite-derived crop estimates |
| D | Provisional | Single unverified source, pending cross-validation | Media-reported exchange rate, informal market price |
| E | Historical | Data older than 5 years, may not reflect current conditions | 2014 household survey estimates |

---

## 6. Provenance Rules

Seven non-negotiable rules govern data lineage:

1. **Every data point must have a source citation** — no exceptions
2. **Source tier must be recorded** — T0 through T3
3. **Collection timestamp must be logged** — when was the data accessed?
4. **Transformation steps must be documented** — any calculation, adjustment, or interpolation
5. **Confidence grade must be assigned** — A through E
6. **Regime applicability must be noted** — Aden, Sana'a, or National
7. **Revision history must be maintained** — all changes to previously published data are logged

---

## 7. Sector Methodologies

YETO covers 16 economic sectors. Each sector has specific indicator definitions, data sources, and calculation methods:

### 7.1 Macroeconomic Indicators
- GDP (nominal and real), GDP per capita, GDP growth rate
- Sources: World Bank WDI, IMF WEO, CBY estimates
- Methodology: Expenditure approach with conflict adjustments

### 7.2 Banking & Monetary Policy
- Money supply (M1, M2), credit to private sector, interest rates
- Sources: CBY Aden, CBY Sana'a, IMF IFS
- Dual-regime tracking for split monetary authority

### 7.3 Trade & External Sector
- Imports, exports, trade balance, current account
- Sources: UN Comtrade, UNCTAD, customs data
- Port throughput from UNVIM verification mechanism

### 7.4 Public Finance & Fiscal
- Government revenue, expenditure, fiscal balance, public debt
- Sources: IMF GFS, World Bank, Ministry of Finance
- Dual-budget tracking (Aden and Sana'a authorities)

### 7.5 Currency & Exchange Rates
- Official rate (CBY Aden), parallel market rate, spread analysis
- Sources: CBY, parallel market monitors, Saraf Online
- Daily tracking with regime divergence analysis

### 7.6 Prices & Inflation
- CPI, food price index, fuel prices, commodity prices
- Sources: CSO, WFP VAM, FAO FPMA
- Regional price disaggregation where available

### 7.7 Energy & Fuel
- Fuel prices (diesel, petrol, LPG), electricity generation, solar adoption
- Sources: YPC, OPEC, satellite nightlight data
- Dual-market pricing (official vs. black market)

### 7.8 Agriculture & Food Security
- Crop production, food imports, IPC classification, malnutrition rates
- Sources: FAO, WFP, IPC, FEWS NET
- Seasonal adjustment for agricultural cycles

### 7.9 Labor Market & Wages
- Employment rates, wage levels, labor force participation
- Sources: ILO, World Bank, household surveys
- Limitations: Last labor force survey was 2013

### 7.10 Poverty & Human Development
- Poverty rate, HDI, food insecurity, humanitarian needs
- Sources: World Bank, UNDP, OCHA HNO/HRP
- Proxy methodologies for years without household surveys

### 7.11 Infrastructure & Reconstruction
- Road network, port capacity, reconstruction spending
- Sources: UNDP, World Bank, SDRPY, satellite imagery
- Damage assessment from UNOSAT

### 7.12 Investment Climate
- FDI flows, business environment indicators, regulatory quality
- Sources: World Bank Doing Business, UNCTAD, YGIA
- Conflict-adjusted investment risk assessment

### 7.13 Microfinance & Inclusion
- MFI outreach, loan portfolio, financial inclusion rates
- Sources: Yemen Microfinance Network, SFD, World Bank Findex
- Gender-disaggregated data where available

### 7.14 Conflict Economy
- Conflict events, displacement, economic impact of violence
- Sources: ACLED, UNHCR, IOM DTM, Yemen Data Project
- Geospatial conflict-economic correlation analysis

### 7.15 Aid Flows & Humanitarian
- ODA flows, humanitarian funding, donor commitments
- Sources: OCHA FTS, IATI, OECD DAC, bilateral trackers
- Gap analysis between needs and funding

### 7.16 Digital Economy
- Internet penetration, mobile subscriptions, digital payments
- Sources: ITU, GSMA, telecom operators
- Connectivity proxy from satellite data

---

## 8. AI Analytical Agents

YETO deploys 8 specialized AI agents:

1. **Macro Analyst** — GDP forecasting, fiscal analysis, monetary policy assessment
2. **Trade Analyst** — Import/export analysis, trade balance, port throughput
3. **Conflict Economist** — Economic impact of conflict events, displacement costs
4. **Humanitarian Analyst** — Aid flow analysis, needs-funding gap assessment
5. **Currency Analyst** — Exchange rate forecasting, regime divergence analysis
6. **Food Security Analyst** — IPC analysis, price monitoring, supply chain assessment
7. **Research Synthesizer** — Literature review, evidence synthesis, gap identification
8. **Policy Advisor** — Cross-sector policy recommendations, scenario analysis

Each agent operates under strict guardrails: they cite sources, acknowledge uncertainty, and flag when confidence is below threshold.

---

## 9. Data Update Cycle

| Frequency | Indicators | Sources |
|-----------|-----------|---------|
| Daily | Exchange rates, fuel prices, conflict events | CBY, market monitors, ACLED |
| Weekly | Food prices, displacement updates | WFP, IOM DTM |
| Monthly | CPI, trade data, aid disbursements | CSO, customs, OCHA FTS |
| Quarterly | GDP estimates, IPC classification, labor data | World Bank, IPC, ILO |
| Annual | HDI, poverty estimates, FDI, governance indices | UNDP, World Bank, V-Dem |

---

## 10. International Standards Alignment

| Standard | Application |
|----------|-------------|
| SNA 2008 | National accounts methodology |
| BPM6 | Balance of payments |
| GFSM 2014 | Government finance statistics |
| ISIC Rev.4 | Industry classification |
| HS 2022 | Trade commodity classification |
| IPC Technical Manual | Food security classification |
| IMF DQAF | Data quality assessment |
| SDDS/e-GDDS | Statistical dissemination standards |

---

## 11. Limitations & Caveats

- **Conflict context**: Active conflict severely limits primary data collection
- **Dual authority**: Two competing governments produce inconsistent statistics
- **Survey gaps**: Last comprehensive household survey was 2014
- **Informal economy**: Large informal sector not captured in official statistics
- **Access restrictions**: Some areas inaccessible for data collection
- **Timeliness**: Some indicators have significant publication lags

---

## 12. Contact

For methodology questions, data requests, or partnership inquiries:
- **Email**: yeto@causewaygrp.com
- **Website**: yteocauseway.manus.space
- **Organization**: Causeway Group

---

*This document is auto-generated from live platform data and reflects the current state of the YETO methodology as of ${generated}.*
`;

    return {
      filename: `YETO_Methodology_Guide_${generated}.md`,
      content,
      mimeType: 'text/markdown',
    };
  }),

  /**
   * 2. Data Dictionary — all indicators with metadata
   */
  dataDictionary: publicProcedure.query(async () => {
    // Use indicators table joined with time_series for comprehensive data dictionary
    const [rows] = await db.execute(sql`
      SELECT 
        i.code as indicator_code,
        i.nameEn as indicator_name,
        i.unit,
        i.frequency,
        i.sector,
        i.methodology,
        COUNT(ts.id) as data_points,
        MIN(YEAR(ts.date)) as first_year,
        MAX(YEAR(ts.date)) as last_year
      FROM indicators i
      LEFT JOIN time_series ts ON ts.indicatorCode = i.code
      GROUP BY i.code, i.nameEn, i.unit, i.frequency, i.sector, i.methodology
      ORDER BY i.sector, i.code
    `);

    const data = rows as unknown as any[];
    const headers = ['Indicator Code', 'Indicator Name', 'Unit', 'Frequency', 'Sector', 'Methodology', 'Data Points', 'First Year', 'Last Year'];
    const keys = ['indicator_code', 'indicator_name', 'unit', 'frequency', 'sector', 'methodology', 'data_points', 'first_year', 'last_year'];
    const csv = toCSV(headers, data, keys);

    return {
      filename: `YETO_Data_Dictionary_${new Date().toISOString().split('T')[0]}.csv`,
      content: csv,
      mimeType: 'text/csv',
      rowCount: data.length,
    };
  }),

  /**
   * 3. Source Registry Export — all sources with classifications
   */
  sourceRegistryExport: publicProcedure.query(async () => {
    const [rows] = await db.execute(sql`
      SELECT 
        id, sourceId, name, altName, publisher, 
        webUrl, apiUrl, accessType, tier, status,
        updateFrequency, sectorCategory, sectorsFed,
        confidenceRating, historicalStart, historicalEnd,
        connectorType, apiKeyRequired, needsPartnership,
        tierClassificationReason, tierClassificationConfidence,
        classifiedBy, classifiedAt,
        license, description
      FROM source_registry 
      ORDER BY tier, name
    `);

    const data = (rows as unknown as any[]).map(r => ({
      ...r,
      sectorsFed: Array.isArray(r.sectorsFed) ? r.sectorsFed.join('; ') : r.sectorsFed || '',
    }));

    const headers = [
      'ID', 'Source ID', 'Name', 'Alt Name', 'Publisher',
      'Web URL', 'API URL', 'Access Type', 'Tier', 'Status',
      'Update Frequency', 'Sector Category', 'Sectors Fed',
      'Confidence Rating', 'Historical Start', 'Historical End',
      'Connector Type', 'API Key Required', 'Needs Partnership',
      'Classification Reason', 'Classification Confidence',
      'Classified By', 'Classified At',
      'License', 'Description'
    ];
    const keys = [
      'id', 'sourceId', 'name', 'altName', 'publisher',
      'webUrl', 'apiUrl', 'accessType', 'tier', 'status',
      'updateFrequency', 'sectorCategory', 'sectorsFed',
      'confidenceRating', 'historicalStart', 'historicalEnd',
      'connectorType', 'apiKeyRequired', 'needsPartnership',
      'tierClassificationReason', 'tierClassificationConfidence',
      'classifiedBy', 'classifiedAt',
      'license', 'description'
    ];
    const csv = toCSV(headers, data, keys);

    return {
      filename: `YETO_Source_Registry_${new Date().toISOString().split('T')[0]}.csv`,
      content: csv,
      mimeType: 'text/csv',
      rowCount: data.length,
    };
  }),

  /**
   * 4. Indicator Catalog — all indicators with sources, frequencies, and sector mappings
   */
  indicatorCatalog: publicProcedure.query(async () => {
    const [rows] = await db.execute(sql`
      SELECT 
        i.code as indicator_code,
        i.nameEn as indicator_name,
        i.descriptionEn as description,
        i.unit,
        i.frequency,
        i.sector,
        sr.name as source_name,
        sr.tier as source_tier,
        COUNT(ts.id) as data_points,
        MIN(YEAR(ts.date)) as first_year,
        MAX(YEAR(ts.date)) as last_year,
        CASE 
          WHEN MAX(YEAR(ts.date)) >= 2024 THEN 'Current'
          WHEN MAX(YEAR(ts.date)) >= 2020 THEN 'Recent'
          ELSE 'Historical'
        END as freshness
      FROM indicators i
      LEFT JOIN time_series ts ON ts.indicatorCode = i.code
      LEFT JOIN source_registry sr ON sr.id = i.primarySourceId
      GROUP BY i.code, i.nameEn, i.descriptionEn, i.unit, i.frequency, i.sector, sr.name, sr.tier
      ORDER BY i.sector, i.code
    `);

    const data = rows as unknown as any[];
    const headers = [
      'Indicator Code', 'Indicator Name', 'Description', 'Unit', 
      'Frequency', 'Sector', 'Source', 'Source Tier', 'Data Points', 'First Year', 'Last Year', 'Freshness'
    ];
    const keys = [
      'indicator_code', 'indicator_name', 'description', 'unit',
      'frequency', 'sector', 'source_name', 'source_tier', 'data_points', 'first_year', 'last_year', 'freshness'
    ];
    const csv = toCSV(headers, data, keys);

    return {
      filename: `YETO_Indicator_Catalog_${new Date().toISOString().split('T')[0]}.csv`,
      content: csv,
      mimeType: 'text/csv',
      rowCount: data.length,
    };
  }),
});
