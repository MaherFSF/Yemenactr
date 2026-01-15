# YETO Source Registry

**Generated:** January 15, 2026
**Total Sources:** 50+
**Last Updated:** Continuous via API connectors

## Overview

The YETO Source Registry maintains a comprehensive catalog of all data sources used by the platform. Each source is registered with publisher information, licensing terms, and retrieval metadata to ensure full traceability and compliance.

## Source Categories

### 1. International Organizations

| Publisher | License | Data Types | Update Frequency |
|-----------|---------|------------|------------------|
| World Bank | CC-BY-4.0 | GDP, poverty, development indicators | Quarterly |
| IMF | Open Data | Fiscal, monetary, balance of payments | Monthly |
| UN OCHA | CC-BY-3.0 IGO | Humanitarian needs, funding | Weekly |
| UNHCR | Open Data | Refugee statistics, displacement | Monthly |
| WFP | CC-BY-4.0 | Food security, prices | Weekly |
| WHO | CC-BY-NC-SA | Health indicators | Monthly |
| ILO | CC-BY-4.0 | Employment, labor statistics | Quarterly |
| FAO | CC-BY-NC-SA | Agriculture, food production | Monthly |

### 2. Central Banks

| Publisher | License | Data Types | Update Frequency |
|-----------|---------|------------|------------------|
| Central Bank of Yemen - Aden | Government | Exchange rates, monetary aggregates | Daily |
| Central Bank of Yemen - Sana'a | Government | Exchange rates, monetary aggregates | Weekly |

### 3. Government Sources

| Publisher | License | Data Types | Update Frequency |
|-----------|---------|------------|------------------|
| Ministry of Planning (Aden) | Government | Economic plans, statistics | Quarterly |
| Central Statistical Organization | Government | National accounts, surveys | Annual |

### 4. Research Institutions

| Publisher | License | Data Types | Update Frequency |
|-----------|---------|------------|------------------|
| Sana'a Center for Strategic Studies | CC-BY-NC | Research papers, analysis | Monthly |
| DeepRoot Consulting | CC-BY-NC | Governance, conflict analysis | Quarterly |
| ACAPS | CC-BY-NC | Crisis analysis, briefings | Weekly |

### 5. News & Media

| Publisher | License | Data Types | Update Frequency |
|-----------|---------|------------|------------------|
| Reuters | Restricted | News articles, market data | Real-time |
| Al Jazeera | CC-BY-NC | News coverage | Daily |
| Yemen Times | Fair Use | Local news | Daily |

## Licensing Framework

### License Types

| License | Code | Commercial Use | Modification | Attribution |
|---------|------|----------------|--------------|-------------|
| Creative Commons Attribution 4.0 | CC-BY-4.0 | ✅ | ✅ | Required |
| Creative Commons Attribution-NonCommercial | CC-BY-NC | ❌ | ✅ | Required |
| Creative Commons Attribution-ShareAlike | CC-BY-SA | ✅ | ✅ (same license) | Required |
| Open Data | Open | ✅ | ✅ | Recommended |
| Government | Gov | Varies | Varies | Required |
| Restricted | Restricted | ❌ | ❌ | Required |
| Unknown | Unknown | ❌ | ❌ | Required |

### Access Control by License

```typescript
// License-based access control
function canDownload(license: string, userTier: string): boolean {
  if (license === 'restricted') return false;
  if (license === 'unknown' && userTier === 'free') return false;
  return true;
}

function canUseInAPI(license: string): boolean {
  return !['restricted', 'unknown'].includes(license);
}

function canUseCommercially(license: string): boolean {
  return ['CC-BY-4.0', 'Open', 'Gov'].includes(license);
}
```

## Source Registration Process

### 1. New Source Addition

When adding a new data source:

1. **Identify Publisher** - Official name and organization type
2. **Locate License** - Check website footer, data portal, or terms of use
3. **Document URL** - Persistent link to data or API endpoint
4. **Record Retrieval Date** - When data was first accessed
5. **Add Notes** - Any special considerations or limitations

### 2. Source Verification

Before a source is marked as verified:

- [ ] Publisher is a recognized organization
- [ ] License terms are clearly documented
- [ ] Data methodology is available
- [ ] Update frequency is established
- [ ] Contact information is available

### 3. Source Update Protocol

Sources are reviewed and updated:

- **Daily:** Exchange rates, market data
- **Weekly:** Humanitarian indicators, news
- **Monthly:** Economic indicators, reports
- **Quarterly:** Research publications, surveys
- **Annually:** Full source registry audit

## API Connectors

### Active Connectors (6/20)

| Connector | Status | Last Sync | Records |
|-----------|--------|-----------|---------|
| World Bank API | ✅ Active | Today | 500+ |
| IMF Data API | ✅ Active | Today | 200+ |
| UN OCHA API | ✅ Active | Today | 150+ |
| WFP VAM API | ✅ Active | Today | 100+ |
| FAO STAT API | ✅ Active | Today | 80+ |
| CBY Aden Scraper | ✅ Active | Today | 50+ |

### Pending API Keys (3)

| Connector | Status | Required Key |
|-----------|--------|--------------|
| HDX API | ⏳ Pending | HDX_API_KEY |
| ACLED API | ⏳ Pending | ACLED_API_KEY |
| HAPI API | ⏳ Pending | HAPI_API_KEY |

### Inactive Connectors (11)

Reserved for future integration or manual data entry.

## Data Quality Assurance

### Source Reliability Scoring

Each source receives a reliability score based on:

| Factor | Weight | Criteria |
|--------|--------|----------|
| Official Status | 30% | Government, international org, or accredited institution |
| Methodology | 25% | Published methodology, peer review |
| Update Frequency | 20% | Regular updates, timely data |
| Historical Track Record | 15% | Consistent data quality over time |
| Accessibility | 10% | API availability, data format |

### Conflict Resolution

When sources conflict:

1. **Flag the contradiction** in the database
2. **Display both values** with source attribution
3. **Prioritize** based on reliability score
4. **Never auto-merge** without human review

## Compliance Requirements

### Attribution Requirements

All data displayed on YETO must include:

- Source publisher name
- Retrieval date
- License type (if known)
- Link to original source (when available)

### Usage Restrictions

| Restriction | Enforcement |
|-------------|-------------|
| No commercial use (CC-BY-NC) | Block API access for commercial accounts |
| No derivatives (CC-BY-ND) | Disable export in modified formats |
| Share-alike (CC-BY-SA) | Require same license on exports |
| Restricted | Display only, no download |

## Source Registry API

### Endpoints

```typescript
// Get all sources
GET /api/trpc/sources.list

// Get source by ID
GET /api/trpc/sources.getById?id=123

// Get sources by publisher
GET /api/trpc/sources.byPublisher?publisher=World%20Bank

// Get source statistics
GET /api/trpc/sources.stats
```

### Response Format

```json
{
  "id": 1,
  "publisher": "World Bank",
  "url": "https://data.worldbank.org/indicator/NY.GDP.MKTP.CD",
  "license": "CC-BY-4.0",
  "retrievalDate": "2026-01-15T00:00:00Z",
  "notes": "GDP data for Yemen, annual frequency",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2026-01-15T00:00:00Z"
}
```

## Conclusion

The YETO Source Registry ensures:

1. **Complete traceability** - Every data point links to its source
2. **License compliance** - Access controls respect usage terms
3. **Quality assurance** - Sources are verified and scored
4. **Transparency** - Users can see where data comes from
5. **Accountability** - Full audit trail for all data
