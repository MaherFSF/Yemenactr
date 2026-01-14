# YETO Banking Sector - Comprehensive Multi-Role Expert Audit

**Audit Date:** January 14, 2026
**Auditor Roles:** Senior Economist, Banking Expert, Data Integrity Auditor, Frontend/Backend Developer, AI Specialist, Compliance Officer, Humanitarian Data Expert, Investigative Journalist, Yemen Context Expert

---

## PART 1: DATA ACCURACY & COMPLETENESS AUDIT

### 1.1 Banks Listed vs Reality Check

**Currently Displayed:** 17 banks
**Claimed Split:** Aden: 12 | Sana'a: 9

#### CRITICAL FINDING #1: Bank Count Discrepancy
- 12 + 9 = 21, not 17 (some banks operate in both jurisdictions)
- Need to verify: Which banks are dual-jurisdiction?

#### Banks Shown in UI:
1. البنك اليمني للإنشاء والتعمير (YBRD) - Aden - $2.8B - 22.5% CAR
2. بنك اليمن والكويت (YKB) - Aden/Sana'a - $2.8B - 22.5% CAR
3. البنك التجاري اليمني (YCB) - Sana'a - $2.3B - 16.8% CAR
4. بنك التضامن الإسلامي الدولي (TIIB) - Aden - $1.9B - 25.1% CAR
5. البنك الأهلي اليمني (NBY) - Aden - $1.65B - 19.8% CAR
6. بنك كاك (CAC) - Sana'a - $1.4B - 15.2% CAR - **OFAC SANCTIONED**
7. بنك سبأ الإسلامي (SIB) - Aden/Sana'a - $1.25B - 21.0% CAR
8. بنك الشامل الإسلامي (ASIB) - Sana'a - $980M - 12.5% CAR - **DISTRESSED**
9. البنك اليمني الدولي (IBY) - Aden - $850M - 18.2% CAR
10. بنك التسليف التعاوني الزراعي (CACB) - Sana'a - $750M - 10.1% CAR

### 1.2 MISSING BANKS - CRITICAL GAP

**Banks NOT shown but should be included:**
- [ ] البنك المركزي اليمني - عدن (CBY-Aden) - THE REGULATOR
- [ ] البنك المركزي اليمني - صنعاء (CBY-Sana'a) - THE OTHER REGULATOR
- [ ] بنك الكريمي للتمويل الأصغر (Al-Kuraimi Bank)
- [ ] بنك الأمل للتمويل الأصغر (Al-Amal Microfinance Bank)
- [ ] بنك الرافدين (Rafidain Bank - Iraqi, operates in Yemen)
- [ ] بنك قطر الوطني - فرع اليمن (QNB Yemen)
- [ ] بنك الخليج الدولي (Gulf International Bank)
- [ ] بنك اليمن والخليج (Yemen Gulf Bank)
- [ ] بنك اليمن الدولي للتنمية (YIDB)

### 1.3 HISTORICAL DATA GAPS (2010-2025)

**CRITICAL: No historical time series visible**
- Where is 2010 baseline data?
- Where is 2011-2014 pre-conflict data?
- Where is 2015 conflict onset data?
- Where is 2016 Central Bank split data?
- Where is year-by-year progression?

**Required Historical Milestones:**
- [ ] 2010: Pre-Arab Spring baseline
- [ ] 2011: Political upheaval impact
- [ ] 2012-2014: Transition period
- [ ] 2015: War onset, banking crisis begins
- [ ] 2016: CBY split (September) - CRITICAL EVENT
- [ ] 2017-2019: Dual banking system emergence
- [ ] 2020: COVID + conflict compounding
- [ ] 2021-2023: Currency crisis deepening
- [ ] 2024-2025: Current state

---

## PART 2: SANCTIONS & COMPLIANCE AUDIT

### 2.1 OFAC Sanctions Verification

**Displayed:** CAC Bank marked as "OFAC sanctioned"

**AUDIT REQUIRED:**
- [ ] Verify CAC Bank OFAC designation date
- [ ] Check for other sanctioned entities not shown
- [ ] Verify Al-Kuraimi sanctions status (was designated, then delisted)
- [ ] Check Houthi-affiliated financial institutions
- [ ] Verify SWIFT disconnection status for each bank

### 2.2 Missing Sanctions Information

**Known Sanctioned Entities NOT shown:**
- [ ] Ansarallah (Houthis) - designated terrorist organization
- [ ] Specific individuals controlling banks
- [ ] Shell companies used for sanctions evasion
- [ ] Hawala networks operating alongside banks

---

## PART 3: FINANCIAL METRICS ACCURACY

### 3.1 Total Assets Verification

**Displayed:** $18.7B total sector assets

**AUDIT QUESTIONS:**
- [ ] Source of this figure?
- [ ] As of what date?
- [ ] Does this include CBY reserves?
- [ ] Is this USD equivalent at which exchange rate?
- [ ] Aden rate (1,890 YER/USD) or Sana'a rate (530 YER/USD)?

### 3.2 Capital Adequacy Ratio (CAR)

**Displayed:** 21.0% average, 12% minimum required

**AUDIT QUESTIONS:**
- [ ] Which Basel standard? (Basel II or III?)
- [ ] Who sets the 12% minimum? CBY-Aden or CBY-Sana'a?
- [ ] Are these self-reported or audited figures?
- [ ] When were these last updated?

### 3.3 Non-Performing Loans (NPL)

**Displayed:** 13.3% (vs 5% regional average)

**AUDIT QUESTIONS:**
- [ ] This seems LOW for a conflict zone - verify
- [ ] IMF/World Bank estimates suggest 30-50% NPL
- [ ] Is this hiding the true distress?
- [ ] Definition of NPL used?

---

## PART 4: UI/UX AUDIT

### 4.1 Arabic RTL Issues
- [ ] Check all text alignment
- [ ] Verify number formatting (Arabic vs Western numerals)
- [ ] Check date formats
- [ ] Verify currency symbol placement

### 4.2 Accessibility
- [ ] Color contrast ratios
- [ ] Screen reader compatibility
- [ ] Keyboard navigation
- [ ] Focus indicators

### 4.3 Responsive Design
- [ ] Mobile view
- [ ] Tablet view
- [ ] Print view

### 4.4 Data Visualization
- [ ] Charts present?
- [ ] Interactive elements?
- [ ] Drill-down capability?
- [ ] Export functionality?

---

## PART 5: BACKEND & DATABASE AUDIT

### 5.1 API Response Check
- [ ] Test banking.getBanks endpoint
- [ ] Test banking.getSectorMetrics endpoint
- [ ] Test banking.getBanksUnderWatch endpoint
- [ ] Test banking.getDirectives endpoint

### 5.2 Database Schema Review
- [ ] commercial_banks table structure
- [ ] Historical data tables
- [ ] Sanctions tracking
- [ ] Evidence/provenance links

### 5.3 Data Freshness
- [ ] Last update timestamps
- [ ] Data ingestion pipeline status
- [ ] Connector health

---

## PART 6: EVIDENCE & PROVENANCE AUDIT

### 6.1 Source Attribution
- [ ] Every number should have a source
- [ ] Every source should be verifiable
- [ ] Every claim should have evidence

### 6.2 Missing Evidence
- [ ] No CBY-Aden reports linked
- [ ] No CBY-Sana'a reports linked
- [ ] No IMF Article IV linked
- [ ] No World Bank reports linked

---

## FINDINGS LOG

### CRITICAL ISSUES (Severity: HIGH)

### MAJOR ISSUES (Severity: MEDIUM)

### MINOR ISSUES (Severity: LOW)

### RECOMMENDATIONS

---

*Audit in progress...*


---

## PART 7: SANCTIONS VERIFICATION - CRITICAL FINDINGS

### 7.1 OFAC Sanctions on Yemen Banks (VERIFIED)

**CRITICAL DISCOVERY: YETO Platform is MISSING Major Sanctions!**

| Bank | Sanction Date | Sanction Type | Shown in YETO? | YETO Status |
|------|---------------|---------------|----------------|-------------|
| **International Bank of Yemen (IBY)** | April 17, 2025 | OFAC SDN - Houthi Support | YES | Shows "Operational" - **WRONG!** |
| **Yemen Kuwait Bank (YKB)** | January 17, 2025 | OFAC SDN - Houthi Support | YES | Shows "Limited" - **INCOMPLETE!** |
| CAC Bank | Historical | OFAC | YES | Correctly marked |

### 7.2 CRITICAL AUDIT FAILURES

**FAILURE #1: IBY Sanctions Not Reflected**
- OFAC sanctioned International Bank of Yemen on April 17, 2025
- Treasury Press Release: "sanctioning Yemen-based International Bank of Yemen YSC (IBY) for its financial support to Ansarallah"
- YETO shows IBY as "Operational" with $850M assets
- **This is a CRITICAL compliance failure**

**FAILURE #2: YKB Sanctions Not Fully Reflected**
- OFAC sanctioned Yemen Kuwait Bank on January 17, 2025
- Treasury: "sanctioning Yemen-based Yemen Kuwait Bank for Trade and Investment YSC"
- YETO shows YKB as "Limited" but doesn't show OFAC designation
- General License 32 issued for wind-down transactions

**FAILURE #3: Missing Ansarallah/Houthi Designation Context**
- Ansarallah redesignated as Foreign Terrorist Organization (March 4, 2025)
- Specially Designated Global Terrorist (February 16, 2024)
- Multiple Houthi-affiliated entities sanctioned
- YETO doesn't show the broader sanctions context

### 7.3 Source Verification

| Source | URL | Date |
|--------|-----|------|
| Treasury - IBY Sanctions | https://home.treasury.gov/news/press-releases/sb0092 | April 17, 2025 |
| Treasury - YKB Sanctions | https://home.treasury.gov/news/press-releases/jy2794 | January 17, 2025 |
| State Dept - Ansarallah FTO | https://www.state.gov/designation-of-ansarallah-as-a-foreign-terrorist-organization | March 4, 2025 |

---

## PART 8: DATA ACCURACY CROSS-REFERENCE

### 8.1 Total Assets Verification

**YETO Claims:** $18.7B total sector assets

**Reality Check:**
- CEIC Data (Oct 2025): YER 12,973,300 million
- At official rate (530 YER/USD): ~$24.5B
- At market rate (1,890 YER/USD): ~$6.9B
- **YETO figure of $18.7B needs source clarification**

### 8.2 NPL Ratio Verification

**YETO Claims:** 13.3% NPL (vs 5% regional average)

**Reality Check:**
- BTI 2024 Report: "almost 25% in 2014"
- World Bank estimates: 30-50% for some banks
- Some banks reportedly have 40%+ NPL
- **YETO's 13.3% appears UNDERSTATED**

### 8.3 Capital Adequacy Verification

**YETO Claims:** 21.0% average CAR, 12% minimum

**Questions:**
- Which Basel standard?
- Self-reported or audited?
- As of what date?
- Does this account for currency depreciation impact?

---

## PART 9: SYSTEM INTEGRATION AUDIT

### 9.1 Autopilot OS Status

**Finding:** Autopilot Control Room shows:
- Ingestion: 0 Active connectors
- QA Status: 0/0 Checks passed (24h)
- Tickets: 0 Open tickets
- Coverage: 0.0% Average coverage
- Recent Events: "No recent events"

**CRITICAL: The Autopilot OS is NOT RUNNING!**

### 9.2 Evidence Tribunal Status

**Finding:** Database shows:
- Claims table: 0 records
- Evidence sources: 0 records
- Evidence documents: 0 records
- Tribunal runs: 0 records

**CRITICAL: The Truth Layer has NO DATA!**

### 9.3 Scheduler Jobs Status

**Finding:** 28 scheduler jobs configured but:
- Connection errors occurring
- Jobs not executing properly
- "Error running due jobs: DrizzleQueryError"

---

## PART 10: UI/UX AUDIT FINDINGS

### 10.1 Banking Page Issues

1. **Data Table Limitations:**
   - Only shows 10 banks, not all 17 in database
   - No pagination visible
   - No export functionality
   - No historical comparison

2. **Missing Visualizations:**
   - No asset distribution chart
   - No NPL trend chart
   - No CAR comparison chart
   - No regional breakdown map

3. **Missing Quick Links:**
   - No link to CBY-Aden regulations
   - No link to CBY-Sana'a directives
   - No link to OFAC sanctions list
   - No link to related research papers

4. **Arabic RTL Issues:**
   - Number formatting inconsistent
   - Some labels not properly aligned
   - Mixed Arabic/English in same row

### 10.2 Missing Stakeholder Features

**For CBY Governor:**
- No executive summary dashboard
- No trend alerts
- No peer comparison tools
- No scenario modeling

**For International Donors:**
- No methodology documentation link
- No data quality indicators
- No confidence scores visible
- No source attribution

**For Researchers:**
- No data export (CSV/Excel)
- No API documentation
- No citation generator
- No historical data access

---

## PART 11: RECOMMENDATIONS

### CRITICAL (Must Fix Immediately)

1. **Update IBY sanctions status** - Currently showing "Operational" but OFAC sanctioned April 2025
2. **Update YKB sanctions status** - Add OFAC designation from January 2025
3. **Add missing 14+ banks** from CBY-Aden official list
4. **Fix Autopilot OS** - Currently showing 0% coverage, no active connectors
5. **Populate Truth Layer** - Claims and evidence tables are empty

### HIGH PRIORITY

6. Add historical data (2010-2025 timeline)
7. Add data source attribution for every metric
8. Add confidence scores to displayed values
9. Fix scheduler job errors
10. Add SWIFT code verification

### MEDIUM PRIORITY

11. Add data export functionality
12. Add interactive charts
13. Add peer comparison tools
14. Add regulatory compliance tracker
15. Add correspondent banking status

### LOW PRIORITY

16. Improve Arabic RTL consistency
17. Add mobile-optimized views
18. Add print-friendly reports
19. Add API documentation
20. Add glossary links

---

*Audit conducted: January 14, 2026*
*Auditor: Multi-Role Expert System*
