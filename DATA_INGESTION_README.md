# Dynamic Data Ingestion System (2023-2026)

## Quick Start

The YETO platform now includes a comprehensive dynamic data ingestion system that automatically backfills historical data (2023-2026) and continuously feeds real-time updates to all platform sections.

### Key Features

✅ **Historical Backfill**: Automatically ingests 2023-2026 data from all sources
✅ **Real-time Updates**: Continuous data feeding with configurable schedules
✅ **Multi-source Integration**: Banking, Trade, Energy, Humanitarian sectors
✅ **Research Indexing**: Automatic document fetching and enrichment
✅ **Smart Retry Logic**: Exponential backoff with configurable policies
✅ **Data Validation**: Quality checks and confidence scoring
✅ **Error Handling**: Comprehensive logging and notifications

## Architecture

```
Data Sources (CBY, World Bank, IMF, UN, etc.)
        ↓
Connectors (Banking, Trade, Energy, Humanitarian)
        ↓
Transformers (Normalize to YETO schema)
        ↓
Validators (Quality checks, confidence scoring)
        ↓
Storage (MySQL database)
        ↓
Distributors (Dashboards, Research, APIs)
```

## Database Setup

### Required Tables

The system uses these database tables:

```sql
-- Data Connectors
CREATE TABLE data_connectors (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255),
  sourceType VARCHAR(50),
  apiEndpoint VARCHAR(500),
  authType VARCHAR(50),
  authCredentials JSON,
  lastSuccessfulRun TIMESTAMP,
  lastFailedRun TIMESTAMP,
  failureReason TEXT,
  isActive BOOLEAN,
  retryPolicy JSON,
  dataMapping JSON,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);

-- Data Ingestion Jobs
CREATE TABLE data_ingestion_jobs (
  id VARCHAR(100) PRIMARY KEY,
  connectorId VARCHAR(100),
  sectorId VARCHAR(50),
  schedule VARCHAR(100),
  lastRunAt TIMESTAMP,
  lastRunStatus VARCHAR(50),
  lastRunDuration INT,
  nextRunAt TIMESTAMP,
  recordsProcessed INT,
  recordsFailed INT,
  isActive BOOLEAN,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (connectorId) REFERENCES data_connectors(id)
);

-- Time Series Data (Enhanced)
CREATE TABLE time_series (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sectorId VARCHAR(50),
  indicatorCode VARCHAR(100),
  year INT,
  month INT,
  value DECIMAL(20, 4),
  confidence ENUM('high', 'medium', 'low', 'proxy'),
  source VARCHAR(255),
  sourceType VARCHAR(50),
  dataVintage DATE,
  lastUpdated TIMESTAMP,
  connectorId VARCHAR(100),
  transformationLog JSON,
  validationStatus VARCHAR(50),
  INDEX idx_sector_indicator_year (sectorId, indicatorCode, year),
  INDEX idx_data_vintage (dataVintage)
);
```

## Environment Variables

```bash
# Banking Connector
BANKING_API_ENDPOINT=https://api.banking.example.com
BANKING_API_KEY=your_api_key

# Trade Connector
TRADE_API_ENDPOINT=https://api.trade.example.com
TRADE_API_KEY=your_api_key

# Energy Connector
ENERGY_API_ENDPOINT=https://api.energy.example.com
ENERGY_API_KEY=your_api_key

# Humanitarian Connector
HUMANITARIAN_API_ENDPOINT=https://api.humanitarian.example.com
HUMANITARIAN_API_KEY=your_api_key
```

## API Endpoints

### Trigger Backfill

```bash
POST /api/admin/data/backfill
Content-Type: application/json

{
  "startYear": 2023,
  "endYear": 2026,
  "sectors": ["banking", "trade", "energy"],
  "sources": ["cby", "world_bank", "imf"],
  "dryRun": false
}
```

### Run Specific Connector

```bash
POST /api/admin/connectors/:connectorId/run
Content-Type: application/json

{
  "backfillYears": [2023, 2024, 2025, 2026],
  "force": false
}
```

### Get Ingestion Status

```bash
GET /api/admin/ingestion/status

Response:
{
  "connectors": [
    {
      "id": "banking-connector",
      "name": "Banking Sector Data Connector",
      "isActive": true,
      "lastSuccessfulRun": "2026-02-25T04:00:00Z",
      "lastFailedRun": null,
      "failureReason": null
    }
  ],
  "jobs": [
    {
      "id": "banking-connector-1708926000000",
      "connectorId": "banking-connector",
      "sectorId": "banking",
      "lastRunStatus": "success",
      "recordsProcessed": 150,
      "recordsStored": 150,
      "duration": 45000
    }
  ],
  "lastBackfill": "2026-02-25T00:00:00Z",
  "nextScheduledRun": "2026-02-26T02:00:00Z"
}
```

## Connector Implementation

### Creating a New Connector

1. **Extend BaseDataConnector**:

```typescript
import { BaseDataConnector, ConnectorConfig, TransformationResult, ValidationResult } from "../services/dataConnector";

export class EnergyConnector extends BaseDataConnector {
  async fetchData(year?: number): Promise<any> {
    // Fetch from your data source
  }

  async transformData(rawData: any): Promise<TransformationResult[]> {
    // Transform to YETO schema
  }

  async validateData(data: TransformationResult[]): Promise<ValidationResult> {
    // Validate data quality
  }
}
```

2. **Register in Orchestrator**:

```typescript
const energyConfig: ConnectorConfig = {
  id: 'energy-connector',
  name: 'Energy Sector Data Connector',
  sourceType: 'energy',
  apiEndpoint: process.env.ENERGY_API_ENDPOINT,
  // ... other config
};
this.connectors.set('energy-connector', new EnergyConnector(energyConfig));
```

3. **Schedule Jobs**:

```typescript
this.scheduleConnector('energy-connector', '0 4 * * *'); // Daily at 4 AM
```

## Data Transformation

### Banking Sector Example

```typescript
// Raw data from CBY
{
  "nplRatio": 16.8,
  "depositGrowth": 3.1,
  "creditToGdp": 45.2
}

// Transformed to YETO schema
{
  "sectorId": "banking",
  "indicatorCode": "NPL_RATIO",
  "dataPoints": [
    {
      "year": 2026,
      "month": 2,
      "value": 16.8,
      "confidence": "high",
      "source": "Central Bank of Yemen"
    }
  ],
  "metadata": {
    "source": "Multiple sources",
    "sourceType": "banking",
    "fetchedAt": "2026-02-25T04:00:00Z",
    "transformedAt": "2026-02-25T04:05:00Z"
  }
}
```

## Monitoring & Alerts

### Metrics Tracked

- Records ingested per source per day
- Data quality scores by sector
- Connector success/failure rates
- Data freshness by indicator
- Pipeline latency (source → platform)

### Alert Conditions

- ⚠️ Connector fails 3+ times in a row
- ⚠️ Data quality score drops below 80%
- ⚠️ Missing data for critical indicators
- ⚠️ Unusual value changes (>20% deviation)
- ⚠️ Stale data (>7 days old)

## Troubleshooting

### Connector Fails to Connect

```
Error: HTTP 401: Unauthorized
```

**Solution**: Check API credentials in environment variables

```bash
echo $BANKING_API_KEY
# Should output your API key
```

### Data Quality Issues

```
Error: Validation failed: NPL ratio out of range: 150%
```

**Solution**: Check data transformation logic and source data format

### Missing Historical Data

```
Error: No data for 2023
```

**Solution**: Trigger historical backfill

```bash
curl -X POST http://localhost:3000/api/admin/data/backfill \
  -H "Content-Type: application/json" \
  -d '{
    "startYear": 2023,
    "endYear": 2026,
    "sectors": ["banking"],
    "dryRun": false
  }'
```

## Performance Optimization

### Batch Processing

The system processes data in batches to optimize database performance:

```typescript
// Process 100 records at a time
const batchSize = 100;
for (let i = 0; i < dataPoints.length; i += batchSize) {
  const batch = dataPoints.slice(i, i + batchSize);
  await db.insert(timeSeriesData).values(batch);
}
```

### Caching

Frequently accessed indicators are cached:

```typescript
const cacheKey = `indicator:${sectorId}:${indicatorCode}:${year}`;
const cached = await cache.get(cacheKey);
if (cached) return cached;

// Fetch from database
const data = await db.query.timeSeriesData.findMany(...);
await cache.set(cacheKey, data, 3600); // 1 hour TTL
```

### Indexing

Database indexes optimize query performance:

```sql
-- Sector + Indicator + Year queries
CREATE INDEX idx_sector_indicator_year 
ON time_series(sectorId, indicatorCode, year);

-- Data vintage queries
CREATE INDEX idx_data_vintage 
ON time_series(dataVintage);
```

## Data Freshness Guarantees

| Sector | Update Frequency | Backfill Coverage | Confidence |
|--------|------------------|-------------------|------------|
| Banking | Daily @ 2 AM | 2023-2026 | High |
| Trade | Daily @ 3 AM | 2023-2026 | High |
| Energy | Daily @ 4 AM | 2023-2026 | Medium |
| Humanitarian | Daily @ 5 AM | 2023-2026 | High |
| Labor | Weekly | 2023-2026 | Medium |
| Food Security | Daily @ 6 AM | 2023-2026 | High |
| Prices | Daily @ 1 AM | 2023-2026 | High |

## Research Document Ingestion

### Supported Sources

- World Bank Reports
- IMF Publications
- Academic Papers
- News Articles
- Policy Documents

### Document Processing Pipeline

1. **Fetch**: Retrieve documents from sources
2. **Extract**: Parse text, tables, metadata
3. **Enrich**: Add keywords, entities, sector tags
4. **Index**: Full-text search indexing
5. **Link**: Connect to related indicators
6. **Distribute**: Update research library

### Example: Fetch and Index Documents

```typescript
const researchService = getResearchIngestionService();

// Fetch all documents
const documents = await researchService.fetchAllDocuments();

// Process each document
for (const doc of documents) {
  const enriched = await researchService.processDocument(doc);
  
  // Index for search
  await researchService.indexDocuments([enriched]);
  
  // Link to indicators
  await researchService.linkDocumentsToIndicators([enriched]);
}
```

## Next Steps

1. **Configure API Credentials**: Add your data source API keys to environment variables
2. **Run Historical Backfill**: Trigger backfill for 2023-2026 data
3. **Monitor Ingestion**: Check connector status and logs
4. **Extend Connectors**: Add more data sources as needed
5. **Optimize Performance**: Tune batch sizes and caching

## Support

For issues or questions:
- Check logs: `docker logs yeto-platform`
- Review architecture: See `DATA_INGESTION_ARCHITECTURE.md`
- Contact: yeto@causewaygrp.com
