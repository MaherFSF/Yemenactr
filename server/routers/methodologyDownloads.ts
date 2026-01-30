/**
 * Methodology Downloads Router
 * Provides downloadable methodology documents for all sectors
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";

// Sector methodology definitions
const SECTOR_METHODOLOGIES: Record<string, {
  titleEn: string;
  titleAr: string;
  version: string;
  lastUpdated: string;
  content: string;
}> = {
  poverty: {
    titleEn: "Poverty & Human Development Methodology",
    titleAr: "منهجية الفقر والتنمية البشرية",
    version: "2.1",
    lastUpdated: "2024-12-01",
    content: `
# YETO Poverty & Human Development Methodology
Version 2.1 | Last Updated: December 2024

## 1. Overview

This document describes the methodology used by YETO to collect, process, and present poverty and human development indicators for Yemen. Our approach prioritizes transparency, evidence-based analysis, and clear acknowledgment of data limitations.

## 2. Data Philosophy

We never fabricate data. We present:
- **What is measured**: Official statistics from authoritative sources
- **What is proxied**: Derived indicators with clear methodology
- **What is unknown**: Acknowledged data gaps
- **What is being done**: Active data access workflows

## 3. Welfare Metrics Definitions

### 3.1 Poverty Rate
- **Definition**: Percentage of population living below national poverty line
- **Source**: World Bank, UNDP
- **Methodology**: National poverty line methodology
- **Limitations**: Last household survey 2014; current estimates are projections
- **Proxy Policy**: When direct measurement unavailable, proxy from food insecurity + income indicators

### 3.2 Extreme Poverty Rate
- **Definition**: Percentage living below $2.15/day (2017 PPP)
- **Source**: World Bank
- **Methodology**: International poverty line
- **Limitations**: PPP adjustments uncertain in conflict context

### 3.3 Human Development Index (HDI)
- **Definition**: Composite index of life expectancy, education, and income
- **Source**: UNDP Human Development Report
- **Methodology**: Geometric mean of normalized indices
- **Components**:
  - Life expectancy at birth
  - Expected years of schooling
  - Mean years of schooling
  - GNI per capita (PPP)

### 3.4 Food Insecurity
- **Definition**: Population in IPC Phase 3+ (Crisis or worse)
- **Source**: IPC, WFP, FAO
- **Methodology**: Integrated Food Security Phase Classification
- **IPC Phases**:
  - Phase 1: Minimal
  - Phase 2: Stressed
  - Phase 3: Crisis
  - Phase 4: Emergency
  - Phase 5: Famine

### 3.5 Humanitarian Needs
- **Definition**: Population requiring humanitarian assistance
- **Source**: UN OCHA HNO/HRP
- **Methodology**: Multi-sector needs assessment

## 4. Data Source Tiers

| Tier | Description | Sources |
|------|-------------|---------|
| T0 | Official Statistics | UNDP, World Bank, UN OCHA, WFP, UNICEF, WHO |
| T1 | Authoritative Assessments | IPC, FEWS NET, UNHCR, IOM DTM |
| T2 | Research Institutions | Sana'a Center, Yemen Policy Center, ACAPS |
| T3 | Aggregated Data | ReliefWeb, HDX, IATI |
| T4 | Supplementary | News sources, Local reports |

## 5. Confidence Ratings

- **A (High)**: Official statistics from T0 sources, recent data
- **B (Medium)**: Verified assessments from T1 sources
- **C (Low)**: Projections or estimates based on proxy indicators
- **D (Very Low)**: Unverified or outdated data

## 6. Proxy Methodologies

When direct measurement is unavailable, we use proxy indicators:

### 6.1 Poverty Rate Proxy
- Base: 2014 household survey poverty rate
- Adjustments:
  - GDP per capita change
  - Currency depreciation impact
  - Food price inflation
  - Conflict displacement effects

### 6.2 Real Income Proxy
- Components:
  - Nominal wage data (when available)
  - Consumer price index
  - Exchange rate movements
  - Remittance flows

## 7. Data Quality Assessment

Each indicator includes:
- **Verification Status**: Verified, Provisional, or Unverified
- **Confidence Rating**: A, B, C, or D
- **Source Citation**: Full reference with access date
- **Methodology Note**: How the data was collected/derived
- **Limitations**: Known issues or caveats

## 8. Update Frequency

| Indicator | Update Frequency | Source |
|-----------|------------------|--------|
| Poverty Rate | Annual (projection) | World Bank |
| HDI | Annual | UNDP |
| Food Insecurity | Quarterly | IPC |
| Humanitarian Needs | Annual | OCHA |
| Funding Status | Monthly | OCHA FTS |

## 9. Data Access Workflows

For data gaps, we maintain active access workflows:

1. **World Bank**: Request through Yemen Country Office
2. **UNDP**: Access via HDR data portal
3. **UN OCHA**: Public data on HDX platform
4. **IPC**: Technical Working Group reports

## 10. Contact

For methodology questions or data requests:
- Email: yeto@causewaygrp.com
- Website: yeto.causewaygrp.com
    `.trim(),
  },
  labor: {
    titleEn: "Labor Market & Wages Methodology",
    titleAr: "منهجية سوق العمل والأجور",
    version: "1.5",
    lastUpdated: "2024-11-15",
    content: `
# YETO Labor Market & Wages Methodology
Version 1.5 | Last Updated: November 2024

## 1. Overview

This document describes the methodology for labor market and wage indicators in Yemen.

## 2. Data Sources

- ILOSTAT (where available)
- Household surveys and UN/NGO assessments
- Wage payment documents and salary circulars
- Market price monitors
- Remittance transfer data

## 3. Key Indicators

### 3.1 Employment
- Labor force participation rate
- Employment-to-population ratio
- Sector distribution

### 3.2 Wages
- Public sector wage levels
- Private sector wage estimates
- Wage payment regularity

### 3.3 Real Income
- Nominal wages adjusted for inflation
- Purchasing power analysis
- Wage adequacy assessment

## 4. Limitations

- Last labor force survey: 2013
- Current estimates are projections
- Informal sector data limited
    `.trim(),
  },
  macro: {
    titleEn: "Macroeconomic Indicators Methodology",
    titleAr: "منهجية المؤشرات الاقتصادية الكلية",
    version: "2.0",
    lastUpdated: "2024-12-01",
    content: `
# YETO Macroeconomic Indicators Methodology
Version 2.0 | Last Updated: December 2024

## 1. Overview

This document describes the methodology for macroeconomic indicators.

## 2. Key Indicators

### 2.1 GDP
- Source: World Bank, IMF estimates
- Methodology: Expenditure approach with adjustments

### 2.2 Inflation
- Source: Central Statistical Organization, WFP price monitoring
- Methodology: Consumer Price Index (CPI)

### 2.3 Exchange Rate
- Source: Central Bank of Yemen, parallel market monitoring
- Dual rate tracking: Official and parallel

### 2.4 Foreign Reserves
- Source: Central Bank of Yemen
- Reporting: Monthly estimates
    `.trim(),
  },
};

export const methodologyDownloadsRouter = router({
  // List available methodologies
  list: publicProcedure.query(() => {
    return Object.entries(SECTOR_METHODOLOGIES).map(([code, methodology]) => ({
      code,
      titleEn: methodology.titleEn,
      titleAr: methodology.titleAr,
      version: methodology.version,
      lastUpdated: methodology.lastUpdated,
    }));
  }),
  
  // Get methodology content for a sector
  get: publicProcedure
    .input(z.object({ sectorCode: z.string() }))
    .query(({ input }) => {
      const methodology = SECTOR_METHODOLOGIES[input.sectorCode];
      if (!methodology) {
        return null;
      }
      return methodology;
    }),
  
  // Get methodology as downloadable markdown
  downloadMarkdown: publicProcedure
    .input(z.object({ sectorCode: z.string() }))
    .query(({ input }) => {
      const methodology = SECTOR_METHODOLOGIES[input.sectorCode];
      if (!methodology) {
        return null;
      }
      return {
        filename: `yeto-methodology-${input.sectorCode}-v${methodology.version}.md`,
        content: methodology.content,
        mimeType: "text/markdown",
      };
    }),
  
  // Get all methodologies combined
  downloadAll: publicProcedure.query(() => {
    const combined = Object.entries(SECTOR_METHODOLOGIES)
      .map(([code, m]) => `\n\n---\n\n# ${m.titleEn}\n\n${m.content}`)
      .join("\n");
    
    return {
      filename: "yeto-methodology-complete.md",
      content: `# YETO Complete Methodology Documentation\n\nVersion: Consolidated | Generated: ${new Date().toISOString().split("T")[0]}\n\n${combined}`,
      mimeType: "text/markdown",
    };
  }),
});
