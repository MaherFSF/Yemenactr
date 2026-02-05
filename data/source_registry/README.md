# YETO Source Registry

## Overview
The YETO Source Registry is the authoritative catalog of all data sources used in the Yemen Economic Tracker & Observatory platform. Every data point in YETO must be traceable to a verified source listed in this registry.

## Registry File
**Location**: `data/registry/YETO_Sources_Universe_Master_PRODUCTION_READY_v2_3.xlsx`

This Excel file contains the master list of sources with columns:
- **Source ID**: Unique identifier for each source
- **Source Name**: Official name of the data provider
- **Type**: Category (Government, International Org, NGO, Research, etc.)
- **URL**: Official website or data portal
- **Sectors**: Economic sectors this source covers
- **Reliability**: Quality rating (High, Medium, Low)
- **Last Verified**: Date source was last verified active
- **Notes**: Additional context or access requirements

## Key Sources by Sector

### Banking Sector
- Central Bank of Yemen (CBY) - Aden
- Central Bank of Yemen - Sana'a
- Yemen Banks Association
- World Bank Financial Data

### Currency & Exchange Rates
- CBY Official Rates
- Parallel Market (Al-Sahwa, Yemen Times)
- MoneyExchangers.com Yemen
- XE Currency Data

### Trade
- UN COMTRADE Database
- Yemen Customs Authority
- Aden Port Authority
- World Bank Trade Statistics

### Macroeconomy
- World Bank Yemen Data
- IMF Country Reports
- Yemen Central Statistical Organization
- UNDP Yemen

### Energy
- Ministry of Oil & Minerals
- Yemen LNG Company
- IEA Yemen Profile
- Oil Price Tracking Services

### Food Security
- WFP (World Food Programme)
- FAO Yemen Office
- FEWS NET Yemen
- Market Price Monitoring

### Labor & Employment
- ILO Yemen Reports
- Yemen CSO Labor Force Survey
- NGO Employment Studies

### Poverty & Social Indicators
- World Bank Poverty Data
- UNDP Human Development Reports
- UNICEF Yemen
- OCHA Humanitarian Response

### Aid Flows
- OCHA FTS (Financial Tracking Service)
- UN Yemen HRP (Humanitarian Response Plan)
- Donor Government Reports

### Health Services Access
- WHO Yemen
- Ministry of Public Health
- Health Cluster Reports
- MSF/Doctors Without Borders

## Data Governance Rules

### Evidence Laws (See `agentos/policies/EVIDENCE_LAWS.md`)
1. **Source Attribution**: Every data point must reference a source_id
2. **Verification**: Sources must be verified active at least annually
3. **Timeliness**: Note publication date and data collection period
4. **Conflicts**: When sources conflict, use highest reliability source or flag uncertainty

### Adding New Sources
To add a new source to the registry:
1. Verify the source is legitimate and accessible
2. Assign next available source_id
3. Document in the Excel registry
4. Add entry to `server/db/schema.ts` sources table
5. Reference in relevant sector documentation

### Removing Sources
Sources should only be removed if:
- Source is permanently offline/unavailable
- Source found to be unreliable or fraudulent
- Replaced by superior source covering same data

**Process**:
1. Mark as deprecated in registry (don't delete row)
2. Migrate existing data references to replacement source
3. Document in `docs/DECISIONS.md`

## Database Integration
The sources table in the database mirrors this registry:

```typescript
export const sources = mysqlTable('sources', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 100 }),
  url: text('url'),
  reliability: mysqlEnum('reliability', ['high', 'medium', 'low']),
  sectors: json('sectors'), // Array of sector codes
  last_verified: date('last_verified'),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});
```

## Source Verification Schedule
- **High Reliability**: Verify annually
- **Medium Reliability**: Verify semi-annually
- **Low Reliability**: Verify quarterly or deprecate

## Contact
For questions about source registry:
- Technical: See `docs/ARCHITECTURE.md`
- Data Quality: See `agentos/policies/EVIDENCE_LAWS.md`
- Governance: See `docs/DECISIONS.md`

## Notes
- The Excel file is the source of truth - database is populated from it
- Do NOT commit sensitive access credentials to this registry
- For sources requiring authentication, document requirements in Notes column
- Keep URLs up to date as sources migrate platforms
