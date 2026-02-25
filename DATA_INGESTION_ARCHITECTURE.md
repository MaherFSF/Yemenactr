# Dynamic Data Ingestion Architecture (2023-2026)

## Overview

This document outlines the comprehensive data ingestion system for YETO platform, enabling continuous backfill of historical data (2023-2026) and real-time feeding to all platform sections.

## Architecture Layers

### Layer 1: Data Sources
- **Official Sources**: CBY, World Bank, IMF, UN OCHA, WFP, UNHCR
- **Market Data**: Reuters, Bloomberg, local market surveys
- **Research**: Academic papers, think tanks, NGO reports
- **Real-time**: News feeds, market updates, policy announcements

### Layer 2: Data Connectors
Each source has a dedicated connector that:
- Authenticates with source APIs
- Fetches data with proper pagination/versioning
- Transforms to YETO schema
- Handles errors and retries
- Tracks data lineage and confidence

### Layer 3: Data Pipeline
```
Source → Connector → Transformer → Validator → Storage → Distributor
```

**Components**:
- **Connector**: Fetches raw data from source
- **Transformer**: Converts to YETO schema
- **Validator**: Quality checks, confidence scoring
- **Storage**: Database persistence
- **Distributor**: Routes to all consuming services

### Layer 4: Distribution
- **Real-time**: WebSocket push to dashboards
- **Batch**: Scheduled updates to reports
- **On-demand**: API queries for research
- **Aggregation**: Sector-level rollups

## Data Backfill Strategy (2023-2026)

### Phase 1: Historical Data Collection
1. **2023 Data**: Collect from archived sources
2. **2024 Data**: Gather from public databases
3. **2025 Data**: Integrate recent updates
4. **2026 Data**: Ingest current data

### Phase 2: Data Transformation
- Normalize formats across sources
- Handle missing data with proxies
- Calculate derived indicators
- Assign confidence ratings

### Phase 3: Validation & QA
- Cross-source validation
- Outlier detection
- Contradiction flagging
- Expert review workflows

### Phase 4: Distribution
- Backfill all historical tables
- Trigger sector updates
- Update research indices
- Refresh dashboards

## Connector Specifications

### Banking Sector Connector
```typescript
interface BankingConnector {
  source: 'cby' | 'imf' | 'world_bank';
  endpoints: {
    nplRatio: string;
    depositGrowth: string;
    creditToGdp: string;
    branchCoverage: string;
  };
  frequency: 'daily' | 'weekly' | 'monthly';
  retryPolicy: RetryPolicy;
  dataMapping: Record<string, string>;
}
```

### Trade Sector Connector
```typescript
interface TradeConnector {
  source: 'un_comtrade' | 'world_bank' | 'port_authority';
  endpoints: {
    importVolumes: string;
    exportRevenues: string;
    tradeBalance: string;
    portThroughput: string;
  };
  frequency: 'daily' | 'weekly' | 'monthly';
  retryPolicy: RetryPolicy;
  dataMapping: Record<string, string>;
}
```

### Energy Sector Connector
```typescript
interface EnergyConnector {
  source: 'pec' | 'fuel_importers' | 'utility_companies';
  endpoints: {
    fuelPrices: string;
    electricityAvailability: string;
    solarAdoption: string;
    generationCapacity: string;
  };
  frequency: 'daily' | 'weekly' | 'monthly';
  retryPolicy: RetryPolicy;
  dataMapping: Record<string, string>;
}
```

## Real-time Ingestion Pipeline

### Scheduled Jobs
```typescript
interface IngestionJob {
  id: string;
  sectorId: string;
  connectorId: string;
  schedule: CronExpression;
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelayMs: number;
  };
  dataTransformations: Transformation[];
  validationRules: ValidationRule[];
  distribution: {
    updateDashboards: boolean;
    updateResearch: boolean;
    notifyUsers: boolean;
    webhookUrls?: string[];
  };
}
```

### Data Transformation Pipeline
```typescript
interface Transformation {
  type: 'map' | 'aggregate' | 'calculate' | 'normalize';
  config: {
    sourceField: string;
    targetField: string;
    formula?: string;
    lookupTable?: Record<string, any>;
  };
}
```

## Database Schema Extensions

### TimeSeries Table (Enhanced)
```sql
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

### DataConnectors Table
```sql
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
```

### DataIngestionJobs Table
```sql
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
```

## Research Document Ingestion

### Document Connector
```typescript
interface ResearchConnector {
  sourceId: string;
  documentType: 'report' | 'paper' | 'policy' | 'news';
  extractionMethod: 'pdf' | 'web_scrape' | 'api' | 'manual';
  keywordExtraction: boolean;
  entityRecognition: boolean;
  sectorTagging: boolean;
  confidenceScoring: boolean;
  schedule: CronExpression;
}
```

### Document Processing Pipeline
1. **Fetch**: Retrieve documents from sources
2. **Extract**: Parse text, tables, metadata
3. **Enrich**: Add keywords, entities, sector tags
4. **Index**: Full-text search indexing
5. **Link**: Connect to related indicators
6. **Distribute**: Update research library

## API Endpoints for Data Ingestion

### Backfill Data
```
POST /api/admin/data/backfill
{
  startYear: 2023,
  endYear: 2026,
  sectors: ['banking', 'trade', 'energy'],
  sources: ['cby', 'world_bank', 'imf'],
  dryRun: boolean
}
```

### Trigger Connector
```
POST /api/admin/connectors/:connectorId/run
{
  backfillYears?: [2023, 2024, 2025, 2026],
  force?: boolean
}
```

### Get Ingestion Status
```
GET /api/admin/ingestion/status
Response: {
  connectors: ConnectorStatus[],
  jobs: JobStatus[],
  lastBackfill: Date,
  nextScheduledRun: Date
}
```

## Monitoring & Observability

### Metrics to Track
- Records ingested per source per day
- Data quality scores by sector
- Connector success/failure rates
- Data freshness by indicator
- Pipeline latency (source → platform)

### Alerts
- Connector failures
- Data quality degradation
- Missing data for critical indicators
- Unusual value changes
- Stale data (>7 days old)

## Error Handling & Recovery

### Retry Strategy
```typescript
const retryPolicy = {
  maxRetries: 5,
  backoffMultiplier: 2,
  initialDelayMs: 1000,
  maxDelayMs: 60000,
  retryableErrors: [408, 429, 500, 502, 503, 504]
};
```

### Fallback Mechanisms
1. Use cached data if connector fails
2. Interpolate missing values
3. Use proxy indicators
4. Alert analysts for manual intervention

## Data Freshness Guarantees

| Sector | Update Frequency | Backfill Coverage | Confidence |
|--------|------------------|-------------------|------------|
| Banking | Daily | 2023-2026 | High |
| Trade | Daily | 2023-2026 | High |
| Energy | Daily | 2023-2026 | Medium |
| Humanitarian | Daily | 2023-2026 | High |
| Labor | Weekly | 2023-2026 | Medium |
| Food Security | Daily | 2023-2026 | High |
| Prices | Daily | 2023-2026 | High |

## Implementation Roadmap

### Week 1: Foundation
- [ ] Design connector framework
- [ ] Create database schema
- [ ] Build base connector class

### Week 2: Banking & Trade
- [ ] Implement CBY connector
- [ ] Implement World Bank connector
- [ ] Implement UN Comtrade connector
- [ ] Test backfill (2023-2026)

### Week 3: Energy & Humanitarian
- [ ] Implement PEC connector
- [ ] Implement OCHA connector
- [ ] Implement WFP connector
- [ ] Test data distribution

### Week 4: Research & Monitoring
- [ ] Build document ingestion
- [ ] Create monitoring dashboard
- [ ] Implement alerts
- [ ] Performance optimization

## Success Criteria

✅ All sectors have 2023-2026 historical data
✅ Real-time ingestion running for all major sources
✅ <1 hour data latency from source to platform
✅ >95% data quality score
✅ Zero critical data gaps
✅ Automated alerts for failures
✅ Research documents indexed and searchable
✅ Dashboard showing live ingestion status
