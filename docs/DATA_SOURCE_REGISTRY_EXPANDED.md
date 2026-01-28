# YETO Data Source Registry - Expanded Edition

**Last Updated:** January 28, 2026  
**Total Sources:** 44 verified data sources  
**Total Contacts:** 68 contact records  
**Total API Instructions:** 22 registration guides

## Summary Statistics

| Category | Count | Description |
|----------|-------|-------------|
| Humanitarian | 9 | OCHA, UNHCR, WFP, IPC, IOM-DTM |
| UN Agency | 9 | WHO, UNICEF, FAO-GIEWS, UNDP |
| Other | 9 | Trading Economics, Statista, Google Data Commons |
| Academic | 5 | ACLED, SIPRI, Our World in Data |
| IFI | 4 | World Bank, IMF, CEIC |
| Domestic Aden | 4 | CBY-Aden, IRG ministries |
| Domestic Sana'a | 2 | CBY-Sana'a, DFA authorities |
| Sanctions | 1 | OFAC/EU/UK consolidated |
| Think Tank | 1 | Yemen Data Project |

## Trust Level Distribution

| Trust Level | Count | Criteria |
|-------------|-------|----------|
| High | 31 | Official UN/IFI sources, verified methodology |
| Medium | 10 | Reputable aggregators, secondary sources |
| Low | 3 | Limited verification, older data |

## API Availability

| API Type | Count | Notes |
|----------|-------|-------|
| REST | 22 | Standard JSON/CSV endpoints |
| Manual | 6 | Download-only, no API |
| None | 7 | Subscription or contact required |
| SDMX | 1 | UNICEF statistical data |

---

## Newly Added Sources (January 28, 2026)

### 1. IOM DTM Yemen - Displacement Tracking Matrix
- **Category:** Humanitarian
- **Trust Level:** High
- **API:** Manual download
- **Data Types:** Displacement, returnees, migrants, humanitarian data
- **Coverage:** 2015-present
- **Contact:** iomYemenDTM@iom.int

### 2. ACLED - Armed Conflict Location & Event Data
- **Category:** Academic
- **Trust Level:** High
- **API:** REST (https://api.acleddata.com/acled/read)
- **Data Types:** Political violence, demonstrations, strategic developments
- **Coverage:** 2015-present (weekly updates)
- **Contact:** access@acleddata.com
- **Rate Limit:** 5,000 rows per request

### 3. WFP VAM - Vulnerability Analysis and Mapping
- **Category:** Humanitarian
- **Trust Level:** High
- **API:** REST (DataBridges API)
- **Data Types:** Climate, prices, market assessment, exchange rates, food security
- **Contact:** wfp.economicanalysis@wfp.org

### 4. IPC - Integrated Food Security Phase Classification
- **Category:** Humanitarian
- **Trust Level:** High
- **API:** Manual download
- **Data Types:** Acute/chronic food insecurity, acute malnutrition
- **Coverage:** 2022-present
- **Contact:** IPC@fao.org

### 5. UNHCR Yemen - UN Refugee Agency
- **Category:** Humanitarian
- **Trust Level:** High
- **API:** REST (https://data.unhcr.org/api) - Open Access
- **Data Types:** Refugees, asylum seekers, IDPs, protection, shelter, cash assistance
- **Coverage:** 2012-present
- **Contact:** yemsa@unhcr.org

### 6. WHO Yemen - World Health Organization
- **Category:** UN Agency
- **Trust Level:** High
- **API:** Manual download
- **Data Types:** Health expenditure, life expectancy, causes of death, risk factors
- **Coverage:** 2000-present
- **Contact:** emrgocom@who.int

### 7. UNICEF MICS Yemen
- **Category:** UN Agency
- **Trust Level:** High
- **API:** SDMX (https://sdmx.data.unicef.org/ws/public/sdmxapi/rest/)
- **Data Types:** Child welfare, health, education, child protection
- **Coverage:** 2006-2023
- **Contact:** mics@unicef.org

### 8. FAO GIEWS - Global Information and Early Warning System
- **Category:** UN Agency
- **Trust Level:** High
- **API:** REST - Open Access
- **Data Types:** Cereal production, food security, agricultural stress, drought
- **Coverage:** 1980-present

### 9. Trading Economics
- **Category:** Other
- **Trust Level:** Medium
- **API:** REST (https://api.tradingeconomics.com) - Subscription
- **Data Types:** GDP, inflation, trade, population, forecasts
- **Coverage:** 1960-present
- **Rate Limit:** 1 req/sec, max 10,000 rows
- **Contact:** contact@tradingeconomics.com

### 10. Statista
- **Category:** Other
- **Trust Level:** Medium
- **API:** REST (https://api.statista.com/v2/) - Subscription
- **Data Types:** GDP, inflation, trade, population, unemployment
- **Coverage:** 1960-present
- **Contact:** connect@statista.com

### 11. Google Data Commons
- **Category:** Other
- **Trust Level:** High
- **API:** REST (https://api.datacommons.org) - API Key
- **Data Types:** Economics, health, demographics, environment, energy
- **Registration:** https://apikeys.datacommons.org

### 12. Our World in Data
- **Category:** Academic
- **Trust Level:** High
- **API:** REST - Open Access
- **Data Types:** Population, GDP, life expectancy, CO2, energy, agriculture
- **Contact:** info@ourworldindata.org

### 13. SIPRI Arms Transfers Database
- **Category:** Academic
- **Trust Level:** High
- **API:** Manual download
- **Data Types:** Military equipment transfers
- **Coverage:** 1950-present (annual updates)
- **Contact:** atp@sipri.org

### 14. TheGlobalEconomy.com
- **Category:** Other
- **Trust Level:** Medium
- **API:** REST - Subscription
- **Data Types:** GDP, inflation, trade, investment, employment
- **Coverage:** 1960-present
- **Contact:** neven.valev@theglobaleconomy.com

### 15. Index Mundi
- **Category:** Other
- **Trust Level:** Low
- **API:** Manual download
- **Data Types:** Demographics, economy, energy, military
- **Coverage:** 2000-2021
- **Contact:** webmaster@indexmundi.com

### 16. Macrotrends
- **Category:** Other
- **Trust Level:** Low
- **API:** Manual download
- **Data Types:** GDP, inflation, population, trade
- **Coverage:** 1990-2018 (limited updates)

### 17. Knoema (Seek)
- **Category:** Other
- **Trust Level:** Low
- **API:** None (rebranded)
- **Notes:** Contact sales for subscription

---

## Pre-Existing Sources (27 sources)

### International Financial Institutions (IFI)
1. **World Bank** - WDI indicators, poverty data
2. **IMF** - Fiscal data, exchange rates
3. **CEIC Data** - Economic/financial database

### Humanitarian Organizations
4. **OCHA** - Humanitarian needs, funding
5. **WFP** - Food prices, security
6. **HDX HAPI** - Humanitarian data exchange

### UN Agencies
7. **UNDP** - Human development
8. **UNICEF** - Child welfare
9. **FAO** - Agriculture, food

### Domestic Sources
10. **CBY-Aden** - Monetary authority (IRG)
11. **CBY-Sana'a** - Monetary authority (DFA)
12. **Ministry of Finance (Aden)**
13. **Ministry of Planning (Aden)**

### Think Tanks & Research
14. **Sana'a Center** - Policy research
15. **Yemen Data Project** - Airstrikes data
16. **ACAPS** - Crisis analysis

### Sanctions & Compliance
17. **OFAC** - US sanctions
18. **EU Sanctions** - European sanctions
19. **UK Sanctions** - British sanctions

---

## API Integration Priority Matrix

| Priority | Source | API Status | Data Value | Effort |
|----------|--------|------------|------------|--------|
| P1 | World Bank | ✅ Active | High | Low |
| P1 | ACLED | ✅ Active | High | Medium |
| P1 | UNHCR | ✅ Active | High | Low |
| P1 | FAO GIEWS | ✅ Active | High | Low |
| P2 | OCHA HAPI | ✅ Active | High | Medium |
| P2 | Trading Economics | 💰 Paid | Medium | Medium |
| P2 | Google Data Commons | ✅ Active | Medium | Low |
| P3 | UNICEF SDMX | ✅ Active | Medium | Medium |
| P3 | Our World in Data | ✅ Active | Medium | Low |

---

## Contact Directory

| Source | Contact Email | Department |
|--------|--------------|------------|
| OCHA | hdx@un.org | Humanitarian Data Exchange |
| IOM DTM | iomYemenDTM@iom.int | DTM Yemen |
| ACLED | access@acleddata.com | Data Access |
| WFP VAM | wfp.economicanalysis@wfp.org | Economic Analysis |
| IPC | IPC@fao.org | Global Support Unit |
| UNHCR | yemsa@unhcr.org | Yemen Operations |
| WHO | emrgocom@who.int | EMRO |
| UNICEF | mics@unicef.org | MICS Programme |
| Trading Economics | contact@tradingeconomics.com | Support |
| Statista | connect@statista.com | API Support |
| SIPRI | atp@sipri.org | Arms Transfers Programme |
| Our World in Data | info@ourworldindata.org | Data Team |

---

## Data Coverage Timeline

```
1950 ─────────────────────────────────────────────────────────── 2026
      │                                                           │
      ├── SIPRI (1950-present) ──────────────────────────────────►│
      │                                                           │
      ├──────── Trading Economics (1960-present) ────────────────►│
      │                                                           │
      ├──────────── FAO GIEWS (1980-present) ────────────────────►│
      │                                                           │
      ├──────────────── Macrotrends (1990-2018) ──────┤           │
      │                                                           │
      ├──────────────────── WHO (2000-present) ──────────────────►│
      │                                                           │
      ├──────────────────────── UNHCR (2012-present) ────────────►│
      │                                                           │
      ├──────────────────────────── ACLED (2015-present) ────────►│
      │                                                           │
      ├──────────────────────────── IOM DTM (2015-present) ──────►│
      │                                                           │
      ├────────────────────────────────── IPC (2022-present) ────►│
```

---

## Next Steps

1. **Integrate ACLED API** - Weekly conflict event data
2. **Connect UNHCR API** - Displacement statistics
3. **Set up FAO GIEWS** - Food security indicators
4. **Request Trading Economics trial** - Economic forecasts
5. **Configure Google Data Commons** - Supplementary indicators

---

*This registry is maintained by the YETO Data Team. For updates or corrections, contact yeto@causewaygrp.com*
