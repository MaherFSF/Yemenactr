# Primary Datasets & API Endpoints Reference

## A1) Conflict, Events, Maritime, Access, Sanctions

| Source | Data | API/Endpoint |
|--------|------|--------------|
| ACLED | Armed conflict & political violence | `https://api.acleddata.com/acled/read?country=Yemen` (requires key) |
| Yemen Data Project | Airstrike data since 2015 | Public site, periodic bulk imports |
| UNVIM | Ships cleared by cargo (food, fuel) | `https://www.vimye.org/` (scrape monthly) |
| ReliefWeb | Access constraints & humanitarian ops | RSS/JSON feeds per collection |
| UN Panel of Experts | Arms flows, finance networks | UNDOCs (scrape index) |
| OFAC Sanctions | US sanctions list | `https://ofac.treasury.gov/sanctions-lists/consolidated-sanctions-list-data-files` |
| EU Sanctions | EU consolidated list | `https://data.europa.eu/data/datasets/consolidated-list-of-persons-groups-and-entities-subject-to-eu-financial-sanctions` |

## A2) Humanitarian, Population, Displacement, Food Security

| Source | Data | API/Endpoint |
|--------|------|--------------|
| OCHA FTS | Funding flows | `https://api.hpc.tools/v2/public/fts/flow?countryISO3=YEM` |
| IOM DTM | IDP numbers, movements | HDX CKAN API |
| UNHCR | Refugees/Asylum | UNHCR Operational Data Portal |
| WFP VAM | Food prices & minimum food basket | `https://data.humdata.org/api/3/action/package_show?id=wfp-food-prices-for-yemen` |
| FEWS NET | Food security phases | Country page (scrape) |
| WHO | Health events (cholera) | WHO EMRO & WHO HQ |
| HDX COD | Population baselines | CKAN endpoint for COD packages |

## A3) Economy, Prices, FX, Oil, Trade/Ports

| Source | Data | API/Endpoint |
|--------|------|--------------|
| World Bank WDI | GDP, poverty, external balance | `https://api.worldbank.org/v2/country/YEM/indicator/NY.GDP.MKTP.CD?format=json&per_page=200` |
| IMF IFS | Monetary & financial data | `http://dataservices.imf.org/REST/SDMX_JSON.svc/CompactData/IFS/YEM.NNOB_XDC.A` |
| U.S. EIA | Oil production, exports | EIA international data tables |
| JODI Oil | Official energy data | JODI Data Portal (CSV downloads) |
| UNVIM + WFP Logistics | Ports/imports logistics | Merge monthly with WFP briefs |
| CBY | Exchange rate (dual markets) | Central bank bulletins + market monitors |

## C) Concrete API Cheat-Sheet

```bash
# World Bank – GDP current US$ (back to 1960)
https://api.worldbank.org/v2/country/YEM/indicator/NY.GDP.MKTP.CD?format=json&per_page=200

# OCHA FTS – all funding flows to Yemen (paginate)
https://api.hpc.tools/v2/public/fts/flow?countryISO3=YEM

# IMF IFS – example (reserves, money, prices) via SDMX JSON
http://dataservices.imf.org/REST/SDMX_JSON.svc/CompactData/IFS/YEM.NNOB_XDC.A

# HDX (CKAN) – get the file URLs (WFP prices)
https://data.humdata.org/api/3/action/package_show?id=wfp-food-prices-for-yemen

# ACLED – events (requires token)
https://api.acleddata.com/acled/read?country=Yemen&event_date=2011-01-01|2050-01-01&limit=0&key=YOUR_KEY

# UNVIM – monthly report list (crawl)
https://www.vimye.org/

# EU consolidated sanctions list (bundle)
https://data.europa.eu/data/datasets/consolidated-list-of-persons-groups-and-entities-subject-to-eu-financial-sanctions

# OFAC – consolidated sanctions list bulk files
https://ofac.treasury.gov/sanctions-lists/consolidated-sanctions-list-data-files
```

## D) Triangulation & Validation Rules

| Indicator | Primary | Cross-checks | Rule |
|-----------|---------|--------------|------|
| GDP | WB WDI | IMF WEO/IFS | Prefer WB unless WEO newer; flag if delta > 10% |
| Inflation | WFP price indices | IMF CPI | Compute Laspeyres from WFP basket |
| FX (Aden, Sana'a) | CBY bulletins | WFP market prices | Maintain FX_ADEN and FX_SANA; alert if gap > 15% for 14 days |
| Food basket cost | WFP VAM (FBF) | FEWS NET | Use WFP; compute from commodity lines when missing |
| Imports | UNVIM | WFP Logistics Cluster | Alert if < 70% of 12-mo avg |
| Displacement | IOM DTM | UNHCR, OCHA sitreps | Interpolate linearly |
| Sanctions intensity | OFAC/EU/UK counts | UN Panel of Experts | SII = weighted(# new listings, severity, domain) |

## F) Alerting & Intelligence

### Signal Detectors
- **Conflict spike**: Rolling 7-day ACLED counts per governorate; z-score > 2.0 → Conflict Surge
- **Currency stress**: gap% = (FX_ADEN-FX_SANA)/mid. If gap% > 15% for 14 days → Currency Fragmentation
- **Supply shock**: UNVIM fuel+food tonnage < 70% of trailing 12-mo avg → Port Supply Risk
- **Sanctions pulse**: SII 20-point jump in 30 days → Compliance Heat
- **Humanitarian underfunding**: FTS plan coverage < 35% by mid-year → Funding Gap Critical

## New Connectors to Implement

1. **World Bank API** - GDP, poverty, external balance (no key required)
2. **OCHA FTS API** - Humanitarian funding flows (no key required)
3. **IMF IFS/SDMX** - Monetary & financial data (no key required)
4. **HDX CKAN** - WFP food prices, IOM DTM, COD population (no key required)
5. **OFAC Sanctions** - US sanctions list bulk files (no key required)
6. **EU Sanctions** - EU consolidated list (no key required)
7. **ReliefWeb** - RSS/JSON feeds for humanitarian updates (no key required)
8. **FEWS NET** - Food security phases (scrape, no key required)
