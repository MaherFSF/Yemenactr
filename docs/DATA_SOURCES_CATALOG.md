# YETO Data Sources Catalog

## Overview

This catalog documents all data sources integrated into the Yemen Economic Transparency Observatory (YETO). Each source is classified by type, credibility, update frequency, and access requirements.

---

## Source Classification

### Credibility Ratings

| Rating | Description | Criteria |
|--------|-------------|----------|
| **Tier 1** | Official/Institutional | Government agencies, central banks, UN agencies |
| **Tier 2** | International Organizations | World Bank, IMF, major NGOs |
| **Tier 3** | Research Institutions | Think tanks, academic institutions |
| **Tier 4** | Secondary Sources | News aggregators, derived datasets |

### Access Types

| Type | Description |
|------|-------------|
| **Public API** | Freely accessible REST/GraphQL API |
| **Authenticated API** | API requiring registration/key |
| **RSS/Atom** | Feed-based updates |
| **Web Scraping** | Permitted crawling (robots.txt compliant) |
| **Manual** | Periodic manual data entry |

---

## International Data Sources

### World Bank

| Attribute | Value |
|-----------|-------|
| **Source ID** | `world-bank` |
| **Credibility** | Tier 2 |
| **API Endpoint** | `https://api.worldbank.org/v2/` |
| **Access Type** | Public API |
| **API Key Required** | No |
| **Update Frequency** | Daily |
| **Data Coverage** | 2010-present |
| **License** | CC BY 4.0 |

**Available Datasets:**
- World Development Indicators (WDI)
- Documents & Reports
- Projects & Operations
- Country Data

**Key Indicators:**
- GDP growth rate
- Inflation rate
- Population
- Trade balance
- Foreign direct investment

---

### International Monetary Fund (IMF)

| Attribute | Value |
|-----------|-------|
| **Source ID** | `imf` |
| **Credibility** | Tier 2 |
| **API Endpoint** | `https://www.imf.org/external/datamapper/api/` |
| **Access Type** | Public API |
| **API Key Required** | No |
| **Update Frequency** | Quarterly |
| **Data Coverage** | 2010-present |
| **License** | IMF Terms of Use |

**Available Datasets:**
- World Economic Outlook (WEO)
- International Financial Statistics (IFS)
- Country Reports (metadata only)

**Key Indicators:**
- GDP projections
- Inflation forecasts
- Current account balance
- Government debt

---

### UN OCHA Financial Tracking Service (FTS)

| Attribute | Value |
|-----------|-------|
| **Source ID** | `ocha-fts` |
| **Credibility** | Tier 1 |
| **API Endpoint** | `https://api.hpc.tools/v2/` |
| **Access Type** | Public API |
| **API Key Required** | No |
| **Update Frequency** | Daily |
| **Data Coverage** | 2010-present |
| **License** | Open Data |

**Available Datasets:**
- Humanitarian funding flows
- Donor contributions
- Implementing organizations
- Project allocations

---

### Humanitarian Data Exchange (HDX)

| Attribute | Value |
|-----------|-------|
| **Source ID** | `hdx-hapi` |
| **Credibility** | Tier 2 |
| **API Endpoint** | `https://hapi.humdata.org/api/v1/` |
| **Access Type** | Authenticated API |
| **API Key Required** | Yes |
| **Update Frequency** | Daily |
| **Data Coverage** | 2015-present |
| **License** | Various (per dataset) |

**Available Datasets:**
- Food security indicators
- Population statistics
- Administrative boundaries
- Humanitarian needs overview

---

### ReliefWeb

| Attribute | Value |
|-----------|-------|
| **Source ID** | `reliefweb` |
| **Credibility** | Tier 2 |
| **API Endpoint** | `https://api.reliefweb.int/v1/` |
| **Access Type** | Public API |
| **API Key Required** | No |
| **Update Frequency** | Daily |
| **Data Coverage** | 2010-present |
| **License** | Open Data |

**Available Datasets:**
- Reports and publications
- Job listings
- Training opportunities
- Disaster information

---

### IATI (International Aid Transparency Initiative)

| Attribute | Value |
|-----------|-------|
| **Source ID** | `iati` |
| **Credibility** | Tier 2 |
| **API Endpoint** | `https://api.iatistandard.org/datastore/` |
| **Access Type** | Public API |
| **API Key Required** | No |
| **Update Frequency** | Weekly |
| **Data Coverage** | 2010-present |
| **License** | Open Data |

**Available Datasets:**
- Aid activities
- Financial transactions
- Organization data
- Results and outcomes

---

### World Food Programme (WFP)

| Attribute | Value |
|-----------|-------|
| **Source ID** | `wfp-vam` |
| **Credibility** | Tier 1 |
| **API Endpoint** | `https://api.vam.wfp.org/` |
| **Access Type** | Public API |
| **API Key Required** | No |
| **Update Frequency** | Weekly |
| **Data Coverage** | 2015-present |
| **License** | WFP Terms |

**Available Datasets:**
- Market price monitoring
- Food security assessments
- Vulnerability analysis

---

### FAO GIEWS

| Attribute | Value |
|-----------|-------|
| **Source ID** | `fao-giews` |
| **Credibility** | Tier 1 |
| **API Endpoint** | `https://www.fao.org/giews/` |
| **Access Type** | RSS/Web |
| **API Key Required** | No |
| **Update Frequency** | Weekly |
| **Data Coverage** | 2010-present |
| **License** | FAO Terms |

**Available Datasets:**
- Food price monitoring
- Crop production forecasts
- Food security briefs

---

### ACLED (Armed Conflict Location & Event Data)

| Attribute | Value |
|-----------|-------|
| **Source ID** | `acled` |
| **Credibility** | Tier 3 |
| **API Endpoint** | `https://api.acleddata.com/` |
| **Access Type** | Authenticated API |
| **API Key Required** | Yes |
| **Update Frequency** | Daily |
| **Data Coverage** | 2015-present |
| **License** | ACLED Terms (registration required) |

**Available Datasets:**
- Conflict events
- Fatality estimates
- Actor information
- Geographic coordinates

---

## Yemen Institutional Sources

### Central Bank of Yemen - Aden

| Attribute | Value |
|-----------|-------|
| **Source ID** | `cby-aden` |
| **Credibility** | Tier 1 |
| **Access Type** | Manual/Web |
| **API Key Required** | No |
| **Update Frequency** | Daily |
| **Data Coverage** | 2016-present |
| **Regime Tag** | `aden` |

**Available Data:**
- Exchange rate bulletins
- Monetary policy circulars
- Banking sector reports
- Foreign reserve estimates

---

### Sana'a Monetary Authority

| Attribute | Value |
|-----------|-------|
| **Source ID** | `sanaa-monetary` |
| **Credibility** | Tier 1 (de facto) |
| **Access Type** | Manual/Web |
| **API Key Required** | No |
| **Update Frequency** | Weekly |
| **Data Coverage** | 2016-present |
| **Regime Tag** | `sanaa` |

**Available Data:**
- Exchange rate announcements
- Banking directives
- Economic statements

---

## Research Institutions

### Sana'a Center for Strategic Studies

| Attribute | Value |
|-----------|-------|
| **Source ID** | `sanaa-center` |
| **Credibility** | Tier 3 |
| **API Endpoint** | RSS feed |
| **Access Type** | RSS |
| **API Key Required** | No |
| **Update Frequency** | Weekly |
| **License** | CC BY-NC |

**Publication Types:**
- Analysis reports
- Policy briefs
- Yemen Review

---

### Rethinking Yemen's Economy

| Attribute | Value |
|-----------|-------|
| **Source ID** | `rethinking-yemen` |
| **Credibility** | Tier 3 |
| **Access Type** | RSS/Web |
| **API Key Required** | No |
| **Update Frequency** | Weekly |
| **License** | Open Access |

**Publication Types:**
- Economic analysis
- Policy recommendations
- Sector studies

---

### DeepRoot Consulting

| Attribute | Value |
|-----------|-------|
| **Source ID** | `deeproot` |
| **Credibility** | Tier 3 |
| **Access Type** | Web |
| **API Key Required** | No |
| **Update Frequency** | Monthly |
| **License** | Open Access |

---

### CARPO (Center for Applied Research in Partnership with the Orient)

| Attribute | Value |
|-----------|-------|
| **Source ID** | `carpo` |
| **Credibility** | Tier 3 |
| **Access Type** | Web |
| **API Key Required** | No |
| **Update Frequency** | Monthly |
| **License** | Open Access |

---

## Academic Discovery Sources

### OpenAlex

| Attribute | Value |
|-----------|-------|
| **Source ID** | `openalex` |
| **Credibility** | Tier 2 |
| **API Endpoint** | `https://api.openalex.org/` |
| **Access Type** | Public API |
| **API Key Required** | No |
| **Update Frequency** | Weekly |
| **License** | CC0 |

**Search Queries:**
- Yemen economy
- Yemen currency
- Yemen banking
- Yemen humanitarian

---

### Crossref

| Attribute | Value |
|-----------|-------|
| **Source ID** | `crossref` |
| **Credibility** | Tier 2 |
| **API Endpoint** | `https://api.crossref.org/` |
| **Access Type** | Public API |
| **API Key Required** | No |
| **Update Frequency** | Weekly |
| **License** | Open Metadata |

---

## Data Ingestion Schedule

| Time (UTC) | Job | Sources |
|------------|-----|---------|
| 06:00 | World Bank Sync | world-bank |
| 06:00 | IMF Sync | imf |
| 06:00 | OCHA Sync | ocha-fts |
| 06:00 | HDX Sync | hdx-hapi |
| 06:00 | ReliefWeb Sync | reliefweb |
| 07:00 | Research Discovery | openalex, crossref |
| Every 4h | Exchange Rate Update | cby-aden, sanaa-monetary |
| 08:00 | Data Quality Check | All sources |
| Weekly | Gap Ticket Review | Internal |
| Weekly | Report Generation | Internal |

---

## API Key Requirements

The following sources require API keys to be configured:

| Source | Environment Variable | How to Obtain |
|--------|---------------------|---------------|
| HDX HAPI | `HDX_API_KEY` | Register at [HDX](https://data.humdata.org/) |
| ACLED | `ACLED_API_KEY` | Register at [ACLED](https://acleddata.com/) |

Configure keys in Settings → Secrets in the admin panel.

---

## License Compliance

All data ingestion respects source licensing:

| License Type | Usage Allowed | Attribution Required |
|--------------|---------------|---------------------|
| CC BY 4.0 | Commercial, derivative | Yes |
| CC BY-NC | Non-commercial only | Yes |
| Open Data | Commercial, derivative | Varies |
| Restricted | Metadata only | Yes |

For restricted sources, only metadata is stored (title, abstract, link, date).

---

## Adding New Sources

To add a new data source:

1. Create source entry in Admin → Sources
2. Configure connector in `/server/connectors/`
3. Define data mapping schema
4. Set ingestion schedule
5. Run initial backfill
6. Monitor data quality

See `ADMIN_MANUAL.md` for detailed instructions.

---

*Last Updated: January 2026*
*Version: 1.0*
