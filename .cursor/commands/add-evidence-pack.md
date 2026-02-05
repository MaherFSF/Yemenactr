---
name: add-evidence-pack
description: Create evidence pack for a data source or observation
---

# Add Evidence Pack

Create a proper evidence pack with full provenance chain.

## Requirements

Evidence pack must include:
1. Source ID (from source_registry)
2. Raw object reference (original data file/API response)
3. Ingestion run ID (when data was ingested)
4. Dataset version (which schema/version)
5. Series ID (time series or indicator)
6. Observation ID (specific data point)

## Implementation

### Database schema
Ensure tables exist:
- `source_registry` (source metadata)
- `ingestion_runs` (ETL run logs)
- `raw_objects` (original data artifacts)
- `dataset_versions` (schema versions)
- `series` (indicators/time series)
- `observations` (actual data points)

Each observation should have:
```typescript
{
  id: string,
  seriesId: string,
  value: number,
  timestamp: Date,
  evidencePackId: string, // links to evidence pack
  regimeTag?: "IRG" | "DFA" | "NATIONWIDE"
}
```

### UI component
"Show Evidence" button should display:
- Source name, URL, access date
- Ingestion metadata (when, by whom/what)
- Raw data snippet or link
- Quality indicators (if available)
- Licensing/attribution

## Testing

1. Create sample observation with evidence
2. Verify provenance chain is complete
3. Test "Show Evidence" UI
4. Verify all links resolve
5. Check bilingual support
