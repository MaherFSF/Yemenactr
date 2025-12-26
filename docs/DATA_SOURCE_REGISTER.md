# YETO Platform - Data Source Register

This document inventories all data sources to be supported by the platform, including their access methods, cadence, licensing, and implementation status.

---

## Status Legend

| Status | Description |
|--------|-------------|
| **Implemented** | Connector working, data flowing |
| **In Progress** | Connector being developed |
| **Planned** | Scheduled for implementation |
| **Blocked** | Requires API key or access not available |
| **Dev-Fallback** | Using synthetic data for development |

---

## Global Macro/Data Sources

### World Bank Indicators API
- **Publisher**: World Bank
- **Dataset**: World Development Indicators
- **URL**: https://api.worldbank.org/v2/country/YEM/indicator/{INDICATOR_CODE}?format=json
- **Method**: API
- **Cadence**: Monthly update check
- **License**: CC BY 4.0
- **Schema**: JSON with indicator code, country, year, value
- **Validation**: Range checks, continuity validation
- **Status**: Planned

### World Bank Documents & Reports
- **Publisher**: World Bank
- **Dataset**: Documents and Reports
- **URL**: https://documents.worldbank.org/en/publication/documents-reports/api
- **Method**: API
- **Cadence**: Weekly
- **License**: CC BY 4.0
- **Status**: Planned

### IMF Data APIs
- **Publisher**: International Monetary Fund
- **Dataset**: IFS, WEO metadata
- **URL**: Various SDMX endpoints
- **Method**: API
- **Cadence**: Quarterly
- **License**: Terms vary by dataset
- **Status**: Blocked (may require subscription)

### UN Comtrade
- **Publisher**: United Nations
- **Dataset**: International Trade Statistics
- **URL**: https://comtradeapi.worldbank.org/
- **Method**: API
- **Cadence**: Monthly
- **License**: Open data
- **Status**: Planned

### UNCTADstat
- **Publisher**: UNCTAD
- **Dataset**: Trade and development statistics
- **URL**: Bulk download
- **Method**: Bulk loader
- **Cadence**: Quarterly
- **License**: Open data
- **Status**: Planned

### FAOSTAT
- **Publisher**: FAO
- **Dataset**: Food and agriculture statistics
- **URL**: https://fenixservices.fao.org/faostat/api/v1/
- **Method**: API
- **Cadence**: Annual
- **License**: CC BY-NC-SA 3.0 IGO
- **Status**: Planned

### ILOSTAT
- **Publisher**: ILO
- **Dataset**: Labor statistics
- **URL**: API endpoint
- **Method**: API
- **Cadence**: Annual
- **License**: Open data
- **Status**: Blocked (may require key)

---

## Humanitarian/Social Sources

### OCHA HPC Tools / FTS
- **Publisher**: UN OCHA
- **Dataset**: Financial Tracking Service - Humanitarian funding flows
- **URL**: https://api.hpc.tools/v2/public/fts/flow
- **Method**: API
- **Cadence**: Daily
- **License**: Open data
- **Schema**: JSON with donor, recipient, amount, sector, location
- **Validation**: Amount validation, entity matching
- **Status**: Planned

### HDX HAPI
- **Publisher**: Humanitarian Data Exchange
- **Dataset**: Humanitarian datasets for Yemen
- **URL**: https://hapi.humdata.org/api/v1/
- **Method**: API
- **Cadence**: Varies by dataset
- **License**: Various (tracked per dataset)
- **Status**: Planned

### IATI Datastore
- **Publisher**: IATI
- **Dataset**: Aid activity data
- **URL**: https://api.iatistandard.org/datastore/
- **Method**: API
- **Cadence**: Daily
- **License**: Open data
- **Status**: Planned

### ReliefWeb API
- **Publisher**: UN OCHA
- **Dataset**: Humanitarian reports and documents
- **URL**: https://api.reliefweb.int/v1/reports
- **Method**: API
- **Cadence**: Daily
- **License**: Open data
- **Schema**: JSON with title, source, date, body, attachments
- **Status**: Planned

### UNHCR Statistics API
- **Publisher**: UNHCR
- **Dataset**: Refugee and displacement statistics
- **URL**: API endpoint
- **Method**: API
- **Cadence**: Monthly
- **License**: Open data
- **Status**: Planned

### IOM DTM Exports
- **Publisher**: IOM
- **Dataset**: Displacement Tracking Matrix
- **URL**: DTM portal exports
- **Method**: Manual upload / scrape
- **Cadence**: Monthly
- **License**: Open data
- **Status**: Planned

---

## Conflict/Events Sources

### UCDP
- **Publisher**: Uppsala Conflict Data Program
- **Dataset**: Armed conflict events
- **URL**: https://ucdp.uu.se/api/
- **Method**: API
- **Cadence**: Annual (versioned)
- **License**: CC BY 4.0
- **Status**: Planned

### ACLED
- **Publisher**: Armed Conflict Location & Event Data
- **Dataset**: Conflict events
- **URL**: API endpoint
- **Method**: API
- **Cadence**: Weekly
- **License**: Requires license/key
- **Status**: Blocked (requires API key)

---

## Remote Sensing / Geospatial

### VIIRS Nightlights
- **Publisher**: NOAA/NASA
- **Dataset**: Night light intensity (economic proxy)
- **URL**: NOAA data portal
- **Method**: Download
- **Cadence**: Monthly
- **License**: Public domain
- **Status**: Planned

### Admin Boundaries (HDX COD)
- **Publisher**: HDX
- **Dataset**: Yemen administrative boundaries
- **URL**: HDX Yemen COD
- **Method**: Download
- **Cadence**: As updated
- **License**: Open data
- **Status**: Planned

---

## Sanctions Lists (Informational Only)

### UN Security Council Consolidated List
- **Publisher**: UN
- **Dataset**: Sanctions designations
- **URL**: https://scsanctions.un.org/resources/xml/en/consolidated.xml
- **Method**: Download
- **Cadence**: Weekly
- **License**: Public
- **Status**: Planned

### US OFAC SDN List
- **Publisher**: US Treasury
- **Dataset**: Specially Designated Nationals
- **URL**: https://www.treasury.gov/ofac/downloads/sdn.csv
- **Method**: Download
- **Cadence**: Daily
- **License**: Public
- **Status**: Planned

### EU Consolidated Sanctions List
- **Publisher**: European Commission
- **Dataset**: EU sanctions
- **URL**: https://webgate.ec.europa.eu/fsd/fsf/public/files/xmlFullSanctionsList_1_1/content
- **Method**: Download
- **Cadence**: Weekly
- **License**: Public
- **Status**: Planned

### UK Sanctions List
- **Publisher**: UK Government
- **Dataset**: UK sanctions
- **URL**: https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/.../UK_Sanctions_List.csv
- **Method**: Download
- **Cadence**: Weekly
- **License**: Open Government Licence
- **Status**: Planned

---

## Yemen Institutional Sources

### Central Bank of Yemen (Aden)
- **Publisher**: CBY Aden
- **Dataset**: Publications, circulars, statistics
- **URL**: Official website
- **Method**: Manual upload / scrape
- **Cadence**: As published
- **License**: Public (verify)
- **Status**: Planned

### Sana'a Monetary Authority
- **Publisher**: De facto authority
- **Dataset**: Publications (labeled as de facto)
- **URL**: Official channels
- **Method**: Manual upload
- **Cadence**: As published
- **License**: Public (verify)
- **Status**: Planned

### Ministry of Finance Publications
- **Publisher**: MoF Yemen
- **Dataset**: Budget documents, fiscal reports
- **URL**: Official channels
- **Method**: Manual upload
- **Cadence**: Annual
- **License**: Public
- **Status**: Planned

### Central Statistical Organization
- **Publisher**: CSO Yemen
- **Dataset**: Statistical yearbooks, surveys
- **URL**: Official website
- **Method**: Manual upload
- **Cadence**: Annual
- **License**: Public
- **Status**: Planned

### Social Fund for Development
- **Publisher**: SFD Yemen
- **Dataset**: Project documents, reports
- **URL**: SFD website
- **Method**: Manual upload
- **Cadence**: Quarterly
- **License**: Public
- **Status**: Planned

### Yemen Microfinance Network
- **Publisher**: YMN
- **Dataset**: Microfinance statistics
- **URL**: YMN publications
- **Method**: Manual upload
- **Cadence**: Annual
- **License**: Public
- **Status**: Planned

### Association of Yemeni Banks
- **Publisher**: AYB
- **Dataset**: Banking sector reports
- **URL**: AYB publications
- **Method**: Manual upload
- **Cadence**: Annual
- **License**: Public
- **Status**: Planned

---

## Think Tanks / Research Hubs

### ACAPS Yemen Products
- **Publisher**: ACAPS
- **Dataset**: Analysis reports
- **URL**: ACAPS Yemen page
- **Method**: Scrape / API
- **Cadence**: Weekly
- **License**: Open
- **Status**: Planned

### Rethinking Yemen's Economy
- **Publisher**: DeepRoot / Partners
- **Dataset**: Research outputs
- **URL**: RYE website
- **Method**: Manual upload
- **Cadence**: As published
- **License**: Open
- **Status**: Planned

### Academic Discovery
- **Publisher**: Various
- **Dataset**: Academic papers on Yemen economy
- **URL**: OpenAlex, Crossref, Semantic Scholar
- **Method**: API
- **Cadence**: Weekly
- **License**: Metadata open, full text varies
- **Status**: Planned

---

## Source Discovery Engine

The platform includes automated discovery jobs that run weekly to identify new sources:

1. **OpenAlex Query**: Search for Yemen economy-related academic works
2. **ReliefWeb Query**: Search for Yemen-related humanitarian reports
3. **HDX Query**: Search for Yemen datasets
4. **IATI Query**: Search for Yemen recipient activities
5. **Citation Mining**: Extract new publishers from ingested documents

All discovered sources go to admin review queue with licensing checks before activation.

---

## API Endpoint Verification Notes

All API endpoints listed above are starter references. Before implementation:

1. Verify endpoint is still active
2. Check for authentication requirements
3. Review rate limits
4. Document any changes in this register
5. Store verification evidence (retrieval date, response sample)

---

*Last updated: December 2024*
