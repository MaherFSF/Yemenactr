# YETO Sector Agents

This document defines the specialized agents for each economic sector monitored by YETO.

## 1. Currency & FX Agent (وكيل العملة)

**Domain**: Exchange rates, currency flows, monetary policy
**Data Sources**: CBY Aden, CBY Sanaa, Reuters, YETO field surveys
**Key Indicators**: YER/USD rates, spread analysis, reserve estimates

**Expertise**:
- Dual exchange rate dynamics between Aden and Sanaa
- Black market vs official rate divergence
- Remittance flow patterns
- Currency printing impact analysis
- Import financing mechanisms

**Alert Triggers**:
- Rate divergence exceeds 15%
- Daily volatility exceeds 3%
- New currency policy announcements
- Significant remittance flow changes

---

## 2. Banking & Finance Agent (وكيل البنوك)

**Domain**: Banking sector health, credit conditions, financial inclusion
**Data Sources**: CBY reports, bank financial statements, IMF assessments
**Key Indicators**: NPL ratios, deposit growth, credit-to-GDP, branch coverage

**Expertise**:
- Split banking system analysis
- Correspondent banking relationships
- Mobile money adoption
- Microfinance sector health
- Islamic banking instruments

**Alert Triggers**:
- Bank liquidity stress indicators
- Correspondent banking restrictions
- New financial regulations
- Significant deposit movements

---

## 3. Trade & Commerce Agent (وكيل التجارة)

**Domain**: Imports, exports, trade finance, port operations
**Data Sources**: Port authorities, customs data, shipping manifests, UNCTAD
**Key Indicators**: Import volumes, export revenues, trade balance, port throughput

**Expertise**:
- Aden vs Hodeidah port dynamics
- Fuel import mechanisms
- Food import dependencies
- Export commodity analysis (oil, fish, honey)
- Trade finance constraints

**Alert Triggers**:
- Port closure or restrictions
- Fuel shipment delays
- Significant import price changes
- Export disruptions

---

## 4. Prices & Inflation Agent (وكيل الأسعار)

**Domain**: Consumer prices, inflation dynamics, purchasing power
**Data Sources**: CSO, WFP, FAO, YETO price surveys
**Key Indicators**: CPI, food basket costs, fuel prices, regional price indices

**Expertise**:
- Regional price divergence analysis
- Food security price thresholds
- Fuel price transmission effects
- Wage-price dynamics
- Seasonal price patterns

**Alert Triggers**:
- Monthly inflation exceeds 5%
- Food prices exceed WFP thresholds
- Fuel price spikes
- Regional price divergence exceeds 20%

---

## 5. Fiscal & Budget Agent (وكيل المالية العامة)

**Domain**: Government revenues, expenditures, public debt
**Data Sources**: Ministry of Finance, IMF Article IV, donor reports
**Key Indicators**: Revenue collection, salary payments, debt levels, deficit financing

**Expertise**:
- Dual budget analysis (Aden vs Sanaa)
- Oil revenue allocation
- Public sector wage dynamics
- Donor budget support tracking
- Debt sustainability assessment

**Alert Triggers**:
- Salary payment delays
- Revenue collection shortfalls
- New borrowing announcements
- Budget allocation changes

---

## 6. Energy & Fuel Agent (وكيل الطاقة)

**Domain**: Fuel supply, electricity generation, energy access
**Data Sources**: PEC, fuel importers, utility companies, satellite imagery
**Key Indicators**: Fuel prices, electricity availability, solar adoption, generation capacity

**Expertise**:
- Fuel import logistics
- Power generation mix
- Solar energy expansion
- Regional energy access disparities
- Fuel subsidy mechanisms

**Alert Triggers**:
- Fuel shortages
- Power outage patterns
- Price spikes
- Import disruptions

---

## 7. Humanitarian Economy Agent (وكيل الاقتصاد الإنساني)

**Domain**: Aid flows, humanitarian access, crisis economics
**Data Sources**: OCHA, WFP, UNHCR, cluster reports
**Key Indicators**: Aid volumes, beneficiary counts, access constraints, funding gaps

**Expertise**:
- Humanitarian-development nexus
- Cash transfer programming
- Market-based interventions
- Access negotiation dynamics
- Localization trends

**Alert Triggers**:
- Access restrictions
- Funding shortfalls
- Beneficiary targeting changes
- New humanitarian crises

---

## 8. Labor & Employment Agent (وكيل العمل)

**Domain**: Employment, wages, labor market dynamics
**Data Sources**: ILO, CSO labor surveys, private sector reports
**Key Indicators**: Unemployment rates, wage levels, labor force participation, skills gaps

**Expertise**:
- Public vs private sector employment
- Youth unemployment dynamics
- Gender employment gaps
- Skills mismatch analysis
- Informal sector estimation

**Alert Triggers**:
- Mass layoffs
- Wage payment delays
- Labor market disruptions
- Migration pattern changes

---

## Agent Coordination Protocol

All sector agents operate under One Brain orchestration with the following coordination rules:

1. **Cross-Sector Queries**: When a query spans multiple sectors, One Brain routes to primary agent and requests supporting analysis from secondary agents.

2. **Contradiction Resolution**: When sector agents provide conflicting data, escalate to Evidence Tribunal for resolution.

3. **Confidence Aggregation**: Final confidence grade is the minimum of all contributing agents' grades.

4. **Update Synchronization**: Sector agents synchronize their knowledge bases nightly at 02:00 UTC.

5. **Escalation Path**: Sector Agent → One Brain → Human Analyst (for unresolved conflicts).

## Continuous Learning

Each sector agent maintains:
- Query log with user satisfaction signals
- Knowledge gap register
- Source reliability tracker
- Prediction accuracy metrics
- Monthly performance review
