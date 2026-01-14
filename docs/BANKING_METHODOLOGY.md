# YETO Banking Sector Methodology

## منهجية قطاع البنوك في منصة يتو

---

## 1. Overview | نظرة عامة

The YETO Banking Sector module provides comprehensive coverage of Yemen's commercial banking system from 2010 to present. This methodology document outlines the data collection, validation, and presentation standards used throughout the platform.

يوفر قسم القطاع المصرفي في منصة يتو تغطية شاملة للنظام المصرفي التجاري اليمني من عام 2010 حتى الوقت الحاضر.

---

## 2. Data Sources | مصادر البيانات

### 2.1 Primary Sources (Tier 1)

| Source | Type | Reliability | Update Frequency |
|--------|------|-------------|------------------|
| Central Bank of Yemen - Aden | Official Regulator | A | Quarterly |
| Central Bank of Yemen - Sana'a | De Facto Authority | B | Irregular |
| Individual Bank Annual Reports | Primary | A | Annual |
| OFAC SDN List | Sanctions Authority | A | Real-time |

### 2.2 Secondary Sources (Tier 2)

| Source | Type | Reliability | Update Frequency |
|--------|------|-------------|------------------|
| World Bank Yemen Reports | International Institution | A | Semi-annual |
| IMF Article IV Consultations | International Institution | A | Annual |
| CEIC Data | Commercial Database | B | Monthly |
| Bloomberg Terminal | Financial Data | B | Real-time |

### 2.3 Tertiary Sources (Tier 3)

| Source | Type | Reliability | Update Frequency |
|--------|------|-------------|------------------|
| Academic Research | Research | C | Variable |
| News Reports | Media | C | Daily |
| Industry Analysis | Commercial | C | Quarterly |

---

## 3. Bank Coverage | تغطية البنوك

### 3.1 Inclusion Criteria

A bank is included in YETO if it meets ANY of the following criteria:

1. **Licensed by CBY-Aden** - Listed on official CBY-Aden licensed banks register
2. **Operating under CBY-Sana'a** - Active operations in Sana'a-controlled areas
3. **Historical Significance** - Operated in Yemen between 2010-2025
4. **International Relevance** - Subject to international sanctions or designations

### 3.2 Current Coverage

| Category | Count | Notes |
|----------|-------|-------|
| CBY-Aden Licensed | 31 | Per official 2024 register |
| CBY-Sana'a Operating | 16 | Estimated active |
| Dual Jurisdiction | 13 | Operating in both areas |
| OFAC Sanctioned | 3 | IBY, YKB, CAC Bank |
| Inactive/Merged | 2 | Historical records maintained |

---

## 4. Data Fields | حقول البيانات

### 4.1 Bank Profile Fields

| Field | Description | Source | Update Frequency |
|-------|-------------|--------|------------------|
| `name` | Official English name | CBY Register | Static |
| `nameAr` | Official Arabic name | CBY Register | Static |
| `swiftCode` | SWIFT/BIC code | SWIFT Directory | Annual |
| `licenseNumber` | CBY license number | CBY Register | Static |
| `foundedYear` | Year of establishment | Bank records | Static |
| `headquarters` | City of HQ | Bank records | Static |
| `jurisdiction` | Aden/Sana'a/Both | YETO Analysis | Quarterly |

### 4.2 Financial Metrics

| Metric | Unit | Source | Calculation |
|--------|------|--------|-------------|
| `totalAssets` | USD millions | Annual Reports | Direct |
| `capitalAdequacyRatio` | Percentage | CBY Reports | Basel II formula |
| `nonPerformingLoans` | Percentage | CBY Reports | NPL/Total Loans |
| `returnOnAssets` | Percentage | Annual Reports | Net Income/Total Assets |
| `returnOnEquity` | Percentage | Annual Reports | Net Income/Equity |
| `liquidityRatio` | Percentage | CBY Reports | Liquid Assets/Deposits |

### 4.3 Operational Data

| Field | Description | Source |
|-------|-------------|--------|
| `branchCount` | Number of branches | Bank websites |
| `employeeCount` | Total employees | Annual reports |
| `operationalStatus` | Active/Limited/Suspended | YETO Analysis |
| `sanctionsStatus` | None/Under Review/Sanctioned | OFAC/UN/EU |

---

## 5. Historical Time Series | السلاسل الزمنية التاريخية

### 5.1 Coverage Period

- **Start Date:** January 1, 2010 (pre-conflict baseline)
- **End Date:** Current (rolling updates)
- **Granularity:** Annual for most metrics, quarterly for key indicators

### 5.2 Key Historical Milestones

| Year | Event | Impact on Data |
|------|-------|----------------|
| 2010 | Pre-conflict baseline | Full data availability |
| 2011 | Arab Spring protests | Partial disruption |
| 2014 | Houthi takeover of Sana'a | Data fragmentation begins |
| 2015 | Saudi-led intervention | Severe disruption |
| 2016 | CBY split (Aden/Sana'a) | Dual reporting begins |
| 2017 | Liquidity crisis | Limited bank reporting |
| 2020 | COVID-19 pandemic | Additional disruption |
| 2025 | OFAC sanctions (IBY, YKB) | Sanctions tracking added |

### 5.3 Data Interpolation

For years with missing data, YETO uses the following methodology:

1. **Linear Interpolation** - For gradual changes (assets, branches)
2. **Carry Forward** - For static fields (license, SWIFT)
3. **Expert Estimation** - For conflict-affected periods (marked with confidence score)

---

## 6. Sanctions Tracking | تتبع العقوبات

### 6.1 Sanctions Authorities Monitored

| Authority | Database | Update Method |
|-----------|----------|---------------|
| OFAC (US Treasury) | SDN List | API + Manual |
| UN Security Council | Consolidated List | Manual |
| EU | Sanctions Map | Manual |
| UK | OFSI List | Manual |

### 6.2 Sanctions Data Fields

| Field | Description |
|-------|-------------|
| `designationDate` | Date of sanctions designation |
| `authority` | Sanctioning authority |
| `legalBasis` | Legal authority for sanctions |
| `reasons` | Stated reasons for designation |
| `generalLicenses` | Applicable wind-down licenses |
| `windDownDeadline` | Deadline for compliance |

---

## 7. Confidence Scoring | تقييم الثقة

### 7.1 Confidence Grades

| Grade | Score Range | Description |
|-------|-------------|-------------|
| A | 90-100 | Official source, directly verified |
| B | 70-89 | Reputable source, cross-validated |
| C | 50-69 | Secondary source, partially verified |
| D | 30-49 | Estimated or interpolated |
| F | 0-29 | Unverified, flagged for review |

### 7.2 Confidence Calculation

```
Confidence Score = (Source Reliability × 0.4) + 
                   (Recency × 0.3) + 
                   (Cross-Validation × 0.3)
```

---

## 8. Data Quality Assurance | ضمان جودة البيانات

### 8.1 Automated Checks

- **Range Validation** - CAR must be 0-50%, NPL must be 0-100%
- **Consistency Checks** - Assets must equal Liabilities + Equity
- **Temporal Logic** - Values cannot change more than 50% year-over-year without flag

### 8.2 Manual Review Triggers

- New sanctions designation
- Bank merger or acquisition
- Significant metric deviation
- Source conflict detected

---

## 9. Update Schedule | جدول التحديثات

| Data Type | Frequency | Next Update |
|-----------|-----------|-------------|
| Bank profiles | Quarterly | Q2 2026 |
| Financial metrics | Annual | March 2026 |
| Sanctions status | Real-time | Continuous |
| Historical data | As available | Ongoing |

---

## 10. Limitations & Disclaimers | القيود والإخلاءات

1. **Conflict Context** - Data from 2015-present may be incomplete due to ongoing conflict
2. **Dual Authority** - CBY-Aden and CBY-Sana'a may report conflicting figures
3. **Currency Complexity** - Old vs New Rial creates valuation challenges
4. **Sanctions Compliance** - YETO data is for informational purposes only, not legal advice

---

## 11. Contact | التواصل

For methodology questions or data corrections:
- **Technical:** YETO Platform Support
- **Content:** YETO Research Team

---

*Last Updated: January 14, 2026*
*Version: 1.0*
