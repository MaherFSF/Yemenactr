# Labor Market & Wages Sector Methodology

## Real Income & Livelihoods Observatory

### Overview

The Labor Market & Wages sector of YETO provides comprehensive monitoring of employment, wages, and livelihoods in Yemen. Given the significant data gaps resulting from conflict, this sector employs a multi-source triangulation approach that clearly distinguishes between measured, proxied, and unknown data.

### Data Philosophy

**We never fabricate unemployment rates.** Instead, we present:
- What is **measured** (official statistics where available)
- What is **proxied** (derived from related indicators)
- What is **unknown** (acknowledged data gaps)
- What is **being done** (gap tickets and access workflows)

### Data Sources

#### Tier 0 - Primary Official Sources
| Source | Data Types | Access Method | Update Frequency |
|--------|-----------|---------------|------------------|
| ILOSTAT | Labor force, unemployment | API | Annual |
| World Bank WDI | Employment indicators | API | Annual |
| IMF Article IV | Labor market analysis | PDF | Irregular |
| Central Bank of Yemen | Wage payment data | PDF | Monthly |

#### Tier 1 - UN Agency Data
| Source | Data Types | Access Method | Update Frequency |
|--------|-----------|---------------|------------------|
| OCHA Yemen | Humanitarian needs | PDF/API | Monthly |
| WFP Market Bulletins | Wage rates, food prices | PDF | Monthly |
| FAO GIEWS | Agricultural labor | PDF | Quarterly |
| IOM DTM | Displacement impacts | API | Monthly |

#### Tier 2 - Research & Analysis
| Source | Data Types | Access Method | Update Frequency |
|--------|-----------|---------------|------------------|
| Sana'a Center | Labor analysis | Web | Irregular |
| ACAPS | Crisis indicators | CSV | Monthly |
| Yemen Policy Center | Policy analysis | Web | Irregular |

### Key Indicators

#### Employment Indicators
- **LABOR_FORCE_TOTAL**: Total labor force (persons)
- **LABOR_FORCE_FEMALE**: Female labor force participation (%)
- **UNEMPLOYMENT_RATE**: Unemployment rate (%)
- **UNEMPLOYMENT_YOUTH**: Youth unemployment rate (%)
- **EMPLOYMENT_AGRICULTURE**: Employment in agriculture (%)
- **EMPLOYMENT_INDUSTRY**: Employment in industry (%)
- **EMPLOYMENT_SERVICES**: Employment in services (%)

#### Wage Indicators
- **WAGE_NOMINAL_AVG**: Average nominal wage (YER)
- **WAGE_PUBLIC_SECTOR**: Public sector wage (YER)
- **REAL_WAGE_INDEX**: Real wage index (base 2010=100)
- **WAGE_ADEQUACY_RATIO**: Wage to food basket ratio

#### Livelihoods Indicators
- **BASKET_COST_FOOD**: Minimum food basket cost (YER)
- **REMITTANCE_INFLOWS**: Remittance inflows (USD millions)
- **REMITTANCE_COST**: Transfer cost (%)
- **CASUAL_LABOR_WAGE**: Casual labor daily wage (YER)
- **TERMS_OF_TRADE_LABOR**: Labor to wheat exchange rate (kg)

### Confidence Rating System

| Rating | Description | Typical Sources |
|--------|-------------|-----------------|
| A | High confidence - Official verified data | ILOSTAT, World Bank, IMF |
| B | Medium-high - UN agency estimates | WFP, OCHA, FAO |
| C | Medium - Modeled/proxied estimates | Research centers, surveys |
| D | Low - Limited verification | Media reports, single sources |

### Proxy Methodologies

#### Real Wage Estimation
When official wage data is unavailable, real wages are proxied using:
1. Public sector salary circulars (when available)
2. WFP market monitoring wage rates
3. Casual labor daily rates from market bulletins
4. Adjustment for exchange rate and inflation

#### Unemployment Proxying
Post-2014 unemployment is estimated using:
1. Pre-conflict baseline from ILOSTAT
2. Displacement data from IOM DTM
3. Sector employment shifts from surveys
4. Economic contraction estimates from IMF

#### Purchasing Power Calculation
Wage adequacy ratio = Average wage / Minimum food basket cost
- Food basket cost from WFP monthly bulletins
- Wage data from available sources
- Separate calculations for Aden and Sana'a zones

### Data Gaps & Access Workflows

#### Critical Gaps
1. **Formal sector employment** - Last comprehensive survey: 2014
   - Access workflow: Request from Yemen CSO
   
2. **Private sector wages** - No systematic collection since 2015
   - Access workflow: Partner with business associations
   
3. **Informal economy size** - Estimates only
   - Access workflow: Household survey data from UN agencies

#### Gap Ticket System
Each identified data gap generates a ticket with:
- Indicator code
- Last available year
- Priority level (critical/high/medium)
- Suggested access workflow
- Responsible agency

### Automated Products

#### Daily
- Wage adequacy alerts (when threshold breached)
- Salary payment status updates

#### Weekly
- Labor market signal summary
- Remittance flow updates

#### Monthly
- Real Income & Livelihoods Brief
- Food basket cost vs wage analysis

#### Quarterly
- Comprehensive labor market assessment
- Employment sector analysis

### Event Overlays

The labor sector integrates conflict and displacement events that impact labor markets:
- Public sector salary suspensions
- Mass displacement events
- Currency split impacts
- Humanitarian program changes

### Dual Regime Tracking

All indicators are tracked separately for:
- **Aden/IRG Zone**: Internationally recognized government areas
- **Sana'a/DFA Zone**: De facto authority areas
- **Mixed**: National-level estimates where separation not possible

### Quality Assurance

1. **Source verification**: All data points linked to primary source
2. **Cross-validation**: Multiple sources compared where available
3. **Confidence scoring**: Transparent rating for each data point
4. **Methodology documentation**: Full explanation of proxy methods
5. **Gap acknowledgment**: Clear indication of missing data

### Contact

For data inquiries or to report issues:
- Data gaps: Submit via platform gap ticket system
- Methodology questions: Contact YETO data team
- Source suggestions: Submit via source discovery queue

---

*Last updated: January 2026*
*Version: 1.0*
