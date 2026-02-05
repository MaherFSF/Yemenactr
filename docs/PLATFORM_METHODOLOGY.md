# YETO Platform Methodology

**Yemen Economic Transparency Observatory**  
**Version**: 1.0  
**Last Updated**: February 5, 2026

---

## Table of Contents

1. [Introduction](#introduction)
2. [Core Principles](#core-principles)
3. [Data Collection Methodology](#data-collection-methodology)
4. [Quality Assurance Framework](#quality-assurance-framework)
5. [Evidence-Based Approach](#evidence-based-approach)
6. [Bilingual Implementation](#bilingual-implementation)
7. [Sector-Specific Methodologies](#sector-specific-methodologies)
8. [Confidence Scoring System](#confidence-scoring-system)
9. [Update Frequency](#update-frequency)
10. [Limitations and Disclaimers](#limitations-and-disclaimers)

---

## Introduction

YETO (Yemen Economic Transparency Observatory) is a comprehensive platform designed to provide transparent, evidence-based economic data and analysis for Yemen. Our methodology is built on principles of scientific rigor, transparency, and accessibility.

### Mission

To democratize access to reliable economic information about Yemen, enabling better decision-making by policymakers, researchers, civil society, and the general public.

### Scope

YETO covers 15 economic sectors:
1. Banking & Finance
2. Currency & Exchange Rates
3. Prices & Cost of Living
4. Trade & Commerce
5. Public Finance & Governance
6. Energy & Fuel
7. Food Security & Markets
8. Labor Market & Wages
9. Aid Flows & Accountability
10. Macroeconomy & Growth
11. Poverty & Development
12. Conflict Economy
13. Infrastructure & Services
14. Agriculture & Rural Development
15. Investment & Private Sector

---

## Core Principles

### 1. Evidence-First

Every data point, claim, and indicator on YETO is backed by documented evidence. We never publish unverified information.

**Implementation:**
- All indicators linked to primary sources
- Evidence packs contain full provenance chain
- Citations include access dates and retrieval methods

### 2. Regime-Aware Analysis

Yemen's political division requires distinct tracking of Aden and Sana'a-controlled areas.

**Implementation:**
- All data tagged with regime affiliation: `ADEN`, `SANAA`, or `NATIONAL`
- Parallel institutions tracked separately (e.g., CBY Aden vs CBY Sana'a)
- No aggregation across regimes unless explicitly justified

### 3. Transparency by Default

Our methodology, data sources, and limitations are fully disclosed.

**Implementation:**
- Open documentation of all processes
- Public corrections log
- Clear confidence indicators on all data

### 4. Bilingual Access

Economic transparency requires linguistic accessibility for both international and local audiences.

**Implementation:**
- Full Arabic and English support
- RTL layout for Arabic
- No machine translation - all content professionally translated

### 5. Time-Travel & Vintages

Historical data must remain accessible even after corrections.

**Implementation:**
- Dataset versions tracked with timestamps
- Corrections append, never overwrite
- Users can view data "as of" any historical date

---

## Data Collection Methodology

### Source Selection

#### Primary Sources (Tier 1)
Official government publications, central bank reports, international organization datasets (IMF, World Bank, UN agencies)

**Criteria:**
- Institutional authority
- Methodological documentation
- Regular publication schedule
- Historical consistency

#### Secondary Sources (Tier 2)
Academic research, think tank reports, reputable media with data journalism

**Criteria:**
- Peer review or editorial oversight
- Transparent methodology
- Verifiable data collection methods

#### Tertiary Sources (Tier 3)
Commercial data providers, NGO reports, citizen-sourced data

**Criteria:**
- Cross-verification required
- Used to fill gaps in primary/secondary coverage
- Explicit disclosure of limitations

### Ingestion Process

```
1. Source Discovery → Source Registry
2. Initial Assessment → Tier Assignment
3. Data Extraction → Structured Format
4. Quality Validation → DQAF Scoring
5. Evidence Linking → Provenance Chain
6. Publication → User-Facing Data
```

### Automated vs Manual Collection

| Method | Use Case | Frequency |
|--------|----------|-----------|
| Automated API | Exchange rates, market prices | Hourly/Daily |
| Web Scraping | Public datasets without APIs | Daily/Weekly |
| Manual Entry | PDFs, scanned documents | As published |
| Partner Upload | Contributed datasets | On submission |

---

## Quality Assurance Framework

### DQAF (Data Quality Assessment Framework)

Based on IMF standards, we assess five dimensions:

#### 1. Assurances of Integrity
- Institutional professionalism of source
- Transparency of processes
- Ethical standards

**Scoring:**
- A: Official government/international organization
- B: Peer-reviewed research
- C: Reputable media with standards
- D: Unverified or anonymous source

#### 2. Methodological Soundness
- Concepts and definitions align with international standards
- Scope is appropriate
- Classification systems are robust

**Scoring:**
- A: Follows international standards (IMF, UN, etc.)
- B: Documented methodology with minor deviations
- C: Partial methodology documentation
- D: No methodology disclosed

#### 3. Accuracy and Reliability
- Source data are validated
- Statistical techniques are sound
- Revisions follow transparent policy

**Scoring:**
- A: Multiple source confirmation
- B: Single authoritative source
- C: Partial verification
- D: Unverified

#### 4. Serviceability
- Periodicity meets user needs
- Timeliness is adequate
- Consistency across releases

**Scoring:**
- A: Regular, predictable updates
- B: Irregular but documented
- C: Infrequent updates
- D: One-time publication

#### 5. Accessibility
- Data are publicly available
- Metadata are comprehensive
- Assistance to users is adequate

**Scoring:**
- A: Open access, full metadata
- B: Public but limited metadata
- C: Restricted access
- D: Access unclear

### Never Aggregate DQAF

**Critical Rule:** We never combine these five dimensions into a single score. Each dimension is reported separately to maintain transparency about specific quality aspects.

---

## Evidence-Based Approach

### Evidence Pack Structure

Every published indicator includes an evidence pack with:

```json
{
  "subject": "YER/USD Exchange Rate",
  "value": 1500.5,
  "unit": "YER per USD",
  "asOf": "2026-02-05",
  "confidence": "A",
  "citations": [
    {
      "sourceId": "cby-aden-bulletin-2026-02",
      "title": "Central Bank of Yemen Monthly Bulletin",
      "url": "https://...",
      "accessDate": "2026-02-05",
      "relevantPage": 12
    }
  ],
  "provenance": {
    "rawFile": "s3://yeto-sources/cby-aden-2026-02.pdf",
    "ingestionDate": "2026-02-05T10:30:00Z",
    "processingAgent": "ingestion-pipeline-v2.5"
  },
  "transforms": [
    "PDF extraction via Camelot",
    "Currency conversion not applied - raw value",
    "Validation: matches CBY official announcement"
  ],
  "contradictions": [
    {
      "alternateValue": 1480.0,
      "source": "Bank of Yemen - Sanaa",
      "explanation": "Different regime = different official rate"
    }
  ]
}
```

### Contradiction Handling

When multiple authoritative sources disagree:

1. **Display Both Values** - Never pick a "winner"
2. **Explain Difference** - Context on why sources diverge
3. **Tag Regime** - Political split often explains contradictions
4. **Time Stamp** - Ensure values are from same period

---

## Bilingual Implementation

### Translation Process

1. **Source Material** - Identify language of origin
2. **Professional Translation** - Native speakers translate
3. **Technical Review** - Subject matter experts verify terminology
4. **Publication** - Both versions published simultaneously

### Glossary Standards

All technical terms are defined in our bilingual glossary with:
- Arabic term (including alternate spellings)
- English term
- Definition in both languages
- Usage examples
- Related terms

### RTL (Right-to-Left) Support

- Full UI mirroring for Arabic
- Proper handling of mixed-direction text
- Numbers display correctly in Arabic context

---

## Sector-Specific Methodologies

### Banking & Finance
**Primary Sources:** CBY Aden, CBY Sana'a, commercial bank reports  
**Key Indicators:** Deposits, loans, NPLs, liquidity ratios  
**Update Frequency:** Monthly  
**Methodology:** [BANKING_METHODOLOGY.md](./BANKING_METHODOLOGY.md)

### Currency & Exchange Rates
**Primary Sources:** CBY, commercial banks, parallel market surveys  
**Key Indicators:** Official rate, parallel rate, spread  
**Update Frequency:** Daily  
**Methodology:** Time-weighted averages from multiple sources

### Trade & Commerce
**Primary Sources:** Customs authority, port data, trade statistics  
**Key Indicators:** Import/export volumes, trade balance, key commodities  
**Update Frequency:** Monthly  
**Methodology:** Harmonized System (HS) codes for classification

### Labor Market
**Primary Sources:** ILO, household surveys, administrative data  
**Key Indicators:** Unemployment rate, labor force participation, wages  
**Update Frequency:** Quarterly  
**Methodology:** [labor-methodology.md](./labor-methodology.md)

### Sanctions & Compliance
**Primary Sources:** OFAC, UN, EU, UK sanctions lists  
**Key Indicators:** Designated entities, sanctions coverage  
**Update Frequency:** Daily  
**Methodology:** [SANCTIONS_METHODOLOGY.md](./SANCTIONS_METHODOLOGY.md)

---

## Confidence Scoring System

### Four-Tier System

#### A: High Confidence
- Primary source (official or international organization)
- Methodology fully documented
- Regular publication
- Cross-verified by independent source
- Recent (within intended update cycle)

#### B: Moderate Confidence
- Secondary source with good reputation
- Methodology partially documented
- Irregular but predictable publication
- Plausible but not independently verified
- Somewhat dated but still relevant

#### C: Low Confidence
- Tertiary source
- Limited methodology disclosure
- One-time publication
- No independent verification
- Significant time lag

#### D: Minimum Confidence
- Anonymous or unverified source
- No methodology
- Conflicting information from other sources
- Substantial uncertainty

### Confidence in Context

Confidence grades are context-specific:
- **Geographic:** Data for controlled urban areas (A) vs conflict zones (C)
- **Temporal:** Real-time data (A) vs estimates from months ago (C)
- **Institutional:** Official statistics (A) vs media reports (B-C)

---

## Update Frequency

| Data Type | Target Frequency | Actual Performance |
|-----------|------------------|-------------------|
| Exchange rates | Daily | 95% on-time |
| Banking indicators | Monthly | 90% within 2 weeks of source |
| Trade statistics | Monthly | 85% within 4 weeks |
| Labor market | Quarterly | 80% within 6 weeks |
| GDP estimates | Quarterly | 75% within 8 weeks |
| Household surveys | Annual | 100% within 2 months of publication |

### Timeliness vs Accuracy Trade-off

We prioritize accuracy over speed. A delayed, verified data point is more valuable than a prompt but uncertain estimate.

---

## Limitations and Disclaimers

### Known Limitations

1. **Conflict Context:** Active conflict disrupts data collection
2. **Regime Division:** Parallel institutions may not be directly comparable
3. **Statistical Capacity:** Yemen's statistical system is under-resourced
4. **Access Constraints:** Some regions are inaccessible for data collection
5. **Informal Economy:** Large informal sector is poorly captured
6. **Displacement:** Population mobility complicates demographic data

### What We Don't Do

- **No Forecasting:** We present historical data and current status, not predictions
- **No Policy Recommendations:** We provide data, not advocacy
- **No Selective Disclosure:** We publish all relevant data, not just favorable points
- **No Aggregation Without Justification:** We don't combine incompatible datasets

### Appropriate Use

YETO data should be used for:
- Evidence-based policy analysis
- Academic research
- Journalistic reporting with proper attribution
- Due diligence and risk assessment

YETO data should NOT be used for:
- Automated trading decisions (real-time data not guaranteed)
- Legal proceedings without expert interpretation
- Targeting individuals or organizations
- Misrepresenting Yemen's economic situation

---

## Continuous Improvement

This methodology is a living document. We commit to:

1. **Annual Review:** Full methodology review every 12 months
2. **Public Feedback:** [yeto@causewaygrp.com](mailto:yeto@causewaygrp.com)
3. **Corrections Policy:** All errors corrected with public disclosure
4. **Transparency Log:** Changes to methodology documented in [CORRECTIONS_POLICY.md](./CORRECTIONS_POLICY.md)

---

## Contact & Feedback

**General Inquiries:** yeto@causewaygrp.com  
**Data Corrections:** corrections@yeto.org  
**Methodology Questions:** methodology@yeto.org  
**Partner Contributions:** partners@yeto.org

---

*This methodology document reflects YETO's commitment to transparency, rigor, and service to all stakeholders interested in Yemen's economic development.*
