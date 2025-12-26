# YETO Data Governance Manual

## Introduction

This document establishes the data governance framework for the Yemen Economic Transparency Observatory (YETO). It defines policies, procedures, and standards for data collection, validation, storage, and dissemination.

---

## Core Principles

### 1. Transparency
Every data point must be traceable to its source. Users can always ask "How do you know this?" and receive a complete evidence pack.

### 2. Dual-Authority Recognition
Yemen's split governance requires tracking data separately for:
- **Aden (IRG)**: Internationally Recognized Government
- **Sana'a (DFA)**: De Facto Authority

### 3. Confidence Scoring
All data carries a confidence level reflecting source reliability and verification status.

### 4. Correction Culture
Errors are expected and welcomed. The platform maintains a public corrections log demonstrating commitment to accuracy.

---

## Data Classification

### Regime Tags

| Tag | Full Name | Description |
|-----|-----------|-------------|
| `aden` | IRG | Data from/about areas under Internationally Recognized Government |
| `sanaa` | DFA | Data from/about areas under De Facto Authority (Houthi) |
| `national` | National | Pre-2014 unified data or aggregated national estimates |

### Confidence Levels

| Level | Label | Criteria |
|-------|-------|----------|
| A | High | Official government source, verified methodology, cross-validated |
| B | Medium-High | Reputable international organization, consistent with other sources |
| C | Medium | Single credible source, plausible but not independently verified |
| D | Low | Estimated, proxy data, contested, or from unverified source |

### Data Categories

| Category | Examples |
|----------|----------|
| Macroeconomic | GDP, inflation, unemployment |
| Financial | Exchange rates, banking data, reserves |
| Trade | Imports, exports, port throughput |
| Fiscal | Government revenue, expenditure, debt |
| Humanitarian | Food prices, displacement, aid flows |
| Infrastructure | Electricity, water, telecommunications |

---

## Data Collection

### Source Hierarchy

1. **Primary Official Sources**
   - Central Bank of Yemen (Aden & Sana'a)
   - Ministry of Planning
   - Central Statistical Organization

2. **International Organizations**
   - World Bank, IMF, UN agencies
   - WFP, UNDP, OCHA

3. **Research Institutions**
   - Sana'a Center for Strategic Studies
   - DeepRoot Consulting
   - ACAPS

4. **Market Data**
   - Money exchanger surveys
   - Commodity price monitoring
   - Port authority reports

### Collection Procedures

1. **Identify Source**: Document full source details
2. **Extract Data**: Record exact values and dates
3. **Verify Format**: Ensure units, currency, time period consistency
4. **Apply Regime Tag**: Assign appropriate authority context
5. **Assess Confidence**: Apply confidence level based on criteria
6. **Log Provenance**: Record collector, date, methodology

---

## Data Validation

### Automated Checks

| Check | Description |
|-------|-------------|
| Range Validation | Values within expected bounds |
| Format Validation | Correct data types and units |
| Temporal Consistency | No future dates, logical sequences |
| Duplicate Detection | Flag potential duplicate entries |

### Manual Review

Required for:
- Confidence Level A or B assignments
- Data from new sources
- Values outside historical ranges
- Politically sensitive indicators

### Cross-Validation

When possible, compare data across:
- Multiple sources for same indicator
- Related indicators (e.g., imports vs. port throughput)
- Historical trends and seasonality

---

## Data Storage

### Database Schema

```
indicators
├── id (UUID)
├── name_en, name_ar
├── sector
├── unit
├── frequency
└── methodology

time_series_data
├── id (UUID)
├── indicator_id (FK)
├── value (DECIMAL)
├── date
├── regime_tag
├── confidence_level
├── source_id (FK)
└── provenance_id (FK)

provenance
├── id (UUID)
├── collector_id
├── collection_date
├── methodology_notes
├── original_source_url
└── verification_status
```

### Versioning

- All data changes create new versions
- Previous versions retained for audit
- "Vintages" system tracks "what was known when"

### Retention Policy

| Data Type | Retention |
|-----------|-----------|
| Time series | Indefinite |
| Provenance logs | Indefinite |
| User activity | 2 years |
| API logs | 1 year |

---

## Data Quality

### Quality Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Coverage | >80% | Indicators with recent data |
| Timeliness | <30 days | Lag from source publication |
| Accuracy | >95% | Corrections rate |
| Completeness | >90% | Required fields populated |

### Quality Assurance Process

1. **Daily**: Automated validation checks
2. **Weekly**: Source freshness review
3. **Monthly**: Coverage scorecard review
4. **Quarterly**: Full data audit

### Gap Management

Data gaps are tracked via tickets:
- Title and description
- Sector and priority
- Why it matters
- Candidate sources
- Assigned researcher
- Resolution status

---

## Data Access

### Access Tiers

| Tier | Access Level |
|------|--------------|
| Public | Aggregated dashboards, basic exports |
| Registered | Full dashboards, standard exports |
| Pro | API access, custom queries, raw data |
| Institutional | Bulk downloads, white-label, priority |

### Export Formats

| Format | Use Case |
|--------|----------|
| CSV | Spreadsheet analysis |
| JSON | Programmatic access |
| XLSX | Excel with formatting |
| PDF | Reports and briefs |

### Attribution Requirements

All data use must include:
```
Source: Yemen Economic Transparency Observatory (YETO)
URL: https://yeto.causewaygrp.com
License: [Appropriate license]
```

---

## Corrections Policy

### Reporting Issues

Users can report issues via:
- "Report Issue" button on any data point
- Email to yeto@causewaygrp.com
- Partner portal submission

### Correction Workflow

1. **Submission**: User reports issue with evidence
2. **Triage**: Admin assigns priority and reviewer
3. **Investigation**: Reviewer checks original source
4. **Resolution**: One of:
   - Correction applied (data updated)
   - Clarification added (context provided)
   - Rejected (issue invalid)
5. **Publication**: Added to public corrections log

### Corrections Log

Public log includes:
- Original value and corrected value
- Date of correction
- Reason for correction
- Source of correction

---

## Compliance

### Sanctions Screening

- All entity data cross-referenced against:
  - OFAC SDN List
  - UN Security Council sanctions
  - EU and UK sanctions lists
- Flagged entities marked in database
- Regular updates from sanctions authorities

### Data Protection

- Personal data minimized
- User consent for data collection
- Right to access and deletion
- Encrypted storage and transmission

### Audit Trail

All actions logged:
- Data modifications
- User access
- Export requests
- Admin actions

---

## Roles & Responsibilities

### Data Steward
- Overall data quality responsibility
- Policy enforcement
- Escalation point for disputes

### Sector Leads
- Domain expertise for assigned sectors
- Source relationship management
- Quality review for sector data

### Data Analysts
- Data collection and entry
- Validation and verification
- Gap ticket resolution

### Platform Administrators
- System access management
- Technical data operations
- Backup and recovery

---

## Appendix

### Glossary

| Term | Definition |
|------|------------|
| Provenance | Complete history of data origin and transformations |
| Vintage | Snapshot of data as known at a specific point in time |
| Regime Tag | Indicator of which Yemeni authority the data relates to |
| Evidence Pack | Collection of sources and methodology for a data point |

### Contact

- Data Governance: yeto@causewaygrp.com
- Technical Support: tech@causewaygrp.com
- Corrections: corrections@causewaygrp.com

---

*Last Updated: December 2024*
*Version: 1.0*
