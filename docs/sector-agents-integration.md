# Sector Agents Integration

## Overview

This document describes the sector agents integration that makes all sector analysts visible and usable on each sector page with evidence-only answers and dynamic visualizations backed by the database and document vault.

## Implementation Date

February 5, 2026

## Components Implemented

### 1. UI Integration: SectorAgentPanel

**Location**: `/client/src/components/sectors/SectorAgentPanel.tsx`

A persistent "Ask the Sector Analyst" panel that:
- Auto-selects the right sector agent by `sectorCode`
- Shows agent roster with capabilities
- Displays example questions in both Arabic and English
- Provides a chat interface for evidence-backed Q&A
- Shows citations, confidence ratings, and data gaps
- Renders charts when appropriate

**Features**:
- Collapsible panel design (sticky on sidebar)
- Bilingual support (Arabic/English)
- Real-time chat with typing indicators
- Evidence pack links for all citations
- Confidence & DQAF panels visible
- Data gap acknowledgment

### 2. Backend API: Sector Agents Router

**Location**: `/server/routers/sectorAgents.ts`

tRPC endpoints for:
- `chat`: Main query endpoint with evidence validation
- `getAgentInfo`: Get agent capabilities and examples
- `getAgentMetrics`: Performance monitoring (protected)
- `logFeedback`: User satisfaction tracking
- `getContextPack`: Access sector coaching packs (protected)

**Evidence Laws Enforcement**:
All responses validated against R0-R12:
- R0: Zero Fabrication - No invented data
- R1: Source Attribution - All claims cited
- R2: Confidence Scoring - Explicit grades (A/B/C/D)
- R3: Contradiction Surfacing - Never averaged
- R4: Temporal Precision - As-of dates required
- R5: Geographic Precision - Regime context included

### 3. Agent Orchestration Service

**Location**: `/server/services/sectorAgentOrchestration.ts`

Core intelligence engine that:
1. Parses query intent (current_value, trend, comparison, explanation, forecast)
2. Retrieves relevant evidence from database
3. Checks evidence sufficiency
4. Builds evidence-backed response
5. Validates against Evidence Laws
6. Logs queries for monitoring

**Query Intent Detection**:
- Detects mentioned indicators via keyword matching
- Identifies time periods (last month, last year, etc.)
- Determines query type for appropriate response format

**Evidence Retrieval**:
- Queries time series data from database
- Fetches relevant documents and events
- Filters by regime (Aden/Sana'a/Both)
- Links to evidence packs for provenance

### 4. Coaching Pack Generation System

**Location**: `/scripts/generate-sector-coaching-packs.ts`

Nightly build system that:
- Aggregates top indicator changes per sector
- Collects recent documents
- Identifies active contradictions
- Documents open data gaps
- Stores versioned context packs
- Logs drift between versions

**Drift Tracking**:
Monitors changes between coaching packs:
- Indicators added/removed/changed
- Documents added
- Contradictions added/resolved
- Gaps opened/closed

**Cron Setup**: `/scripts/cron-coaching-packs.sh`
```bash
# Add to crontab for nightly execution at 02:00 UTC
0 2 * * * /path/to/cron-coaching-packs.sh
```

### 5. Visualization Components

**Location**: `/client/src/components/sectors/SectorAgentVisualization.tsx`

DB-backed charts with:
- Real-time series data from database
- "As-of" timestamp on every chart
- Confidence & DQAF panel always visible
- Uncertainty bands (only when provided by evidence metadata)
- Evidence pack links for each data point
- Interactive tooltips with source attribution

**Chart Types**:
- Line charts for time series
- Area charts when uncertainty bands available
- Regime-specific filtering
- Responsive design

**DQAF Display**:
Visual indicators for 5 dimensions:
- Integrity
- Methodology
- Accuracy & Reliability
- Serviceability
- Accessibility

### 6. Integration with Sector Pages

**Modified**: `/client/src/components/sectors/SectorPageTemplate.tsx`

Changes:
- Added `SectorAgentPanel` import
- Restructured layout to 2/3 main + 1/3 sidebar grid
- Panel receives `sectorCode`, `sectorName`, and `regime`
- Sticky positioning for persistent visibility

### 7. Test Suite

**Location**: `/tests/sector-agents-integration.test.ts`

Comprehensive testing:
- 10 prompts per sector in English
- 10 prompts per sector in Arabic
- Citation coverage validation (>= 95%)
- Chart rendering verification
- Evidence Law compliance checks

**Sectors Covered**:
- Currency & FX
- Banking & Finance
- Trade & Commerce
- Prices & Inflation
- Macroeconomy
- Energy & Fuel
- Humanitarian Economy
- Labor & Employment
- Food Security

**Total Tests**: 180 (9 sectors × 10 prompts × 2 languages)

### 8. Release Gate Update

**Location**: `/scripts/update-sector-release-gates.ts`

Adds 10 new criteria to sector release gates:
1. Agent panel visible
2. Agent capabilities defined
3. Agent evidence validation
4. Citation coverage >= 95%
5. Chart rendering from DB
6. Bilingual support (AR/EN)
7. Coaching pack generation
8. Confidence & DQAF panel
9. No fabrication (R0 compliance)
10. Gap acknowledgment

**Status Tracking**:
- `pass`: Criterion met
- `pending`: Requires verification
- `fail`: Criterion not met

## Agent Roster by Sector

### 1. Currency & FX Agent (وكيل العملة)
**Capabilities**:
- Exchange rate analysis
- Currency flow tracking
- Remittance monitoring
- Reserve estimates

**Example Questions**:
- What is the current YER/USD exchange rate in Aden vs Sanaa?
- How has the black market spread changed in the last 6 months?
- What are the latest estimates of foreign reserves?

### 2. Banking & Finance Agent (وكيل البنوك)
**Capabilities**:
- Banking sector health
- Credit conditions
- NPL tracking
- Mobile money analysis

**Example Questions**:
- What is the current NPL ratio in Yemen's banking sector?
- How has mobile money adoption changed?
- Which banks have relocated since the split?

### 3. Trade & Commerce Agent (وكيل التجارة)
**Capabilities**:
- Import/export analysis
- Port operations
- Trade finance
- Commodity flows

**Example Questions**:
- What are the latest import volumes through Aden port?
- How has fuel import changed in Q1 2024?
- What is Yemen's main export commodity?

### 4. Prices & Inflation Agent (وكيل الأسعار)
**Capabilities**:
- CPI tracking
- Food basket costs
- Regional price divergence
- Purchasing power

**Example Questions**:
- What is the current inflation rate?
- How much does the food basket cost in different regions?
- What is driving price increases?

### 5. Macroeconomy Agent (وكيل الاقتصاد الكلي)
**Capabilities**:
- GDP estimates
- Fiscal analysis
- Budget tracking
- Debt monitoring

**Example Questions**:
- What is Yemen's current GDP estimate?
- How is the government financing the deficit?
- What are the main revenue sources?

### 6. Energy & Fuel Agent (وكيل الطاقة)
**Capabilities**:
- Fuel supply tracking
- Electricity monitoring
- Solar adoption
- Energy access

**Example Questions**:
- What is the current fuel price?
- How many hours of electricity per day?
- What percentage of households have solar?

### 7. Humanitarian Economy Agent (وكيل الاقتصاد الإنساني)
**Capabilities**:
- Aid flow tracking
- Beneficiary monitoring
- Funding gap analysis
- Access constraints

**Example Questions**:
- How much aid has been disbursed this year?
- What are the current funding gaps?
- Which sectors are most underfunded?

### 8. Labor & Employment Agent (وكيل العمل)
**Capabilities**:
- Unemployment tracking
- Wage analysis
- Skills gap assessment
- Labor force participation

**Example Questions**:
- What is the current unemployment rate?
- How do public sector wages compare to private?
- What are the main employment barriers for women?

### 9. Food Security Agent (وكيل الأمن الغذائي)
**Capabilities**:
- Food prices
- Availability monitoring
- IPC classification
- Agricultural production

**Example Questions**:
- What is the current IPC classification?
- How have wheat prices changed?
- What percentage of food is imported?

## Evidence Rules Enforcement

### Zero Fabrication (R0)
Agents **cannot** invent numbers. All data points must:
- Exist in the database
- Have a linked evidence pack
- Include source attribution
- Show confidence grade

### Citation Coverage
Non-D responses must achieve:
- >= 95% citation coverage
- Complete provenance chain
- Evidence pack IDs for all claims

### Data Gaps
When evidence is insufficient:
- Agent responds with explicit gaps
- Recommends alternative sources
- Never invents plausible data
- Assigns confidence grade D

## Visualization Rules

### Chart Requirements
1. **Database-backed**: All data from `time_series` table
2. **As-of timestamp**: Shown on every visualization
3. **Confidence visible**: Badge and tooltip on each point
4. **DQAF panel**: 5-dimension quality assessment
5. **Evidence links**: Clickable evidence pack buttons

### Uncertainty Bands
Only shown when:
- Evidence pack includes uncertainty metadata
- `uncertaintyLower` and `uncertaintyUpper` provided
- Never calculated or invented

If no uncertainty data:
- Display alert: "Uncertainty bands not available"
- Show point estimates only
- Link to methodology documentation

## Performance Metrics

### Monitoring Dashboard
Query logs track:
- Total queries per sector
- Average response time
- Average citations per response
- User satisfaction ratings
- Evidence validation pass rate
- Common query patterns

### Drift Reports
Coaching pack logs show:
- Indicator changes over time
- Document additions
- Contradiction resolution
- Gap closure rates

## Database Schema

### New Tables

#### `sector_agent_query_logs`
```sql
CREATE TABLE sector_agent_query_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sectorCode VARCHAR(50) NOT NULL,
  query TEXT NOT NULL,
  language ENUM('en', 'ar') NOT NULL,
  regime VARCHAR(50),
  responseLength INT,
  citationCount INT,
  evidencePackIds JSON,
  confidenceGrade ENUM('A', 'B', 'C', 'D'),
  evidenceValidation ENUM('passed', 'failed'),
  userSatisfaction INT,
  userFeedback TEXT,
  responseTimeMs INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sector_date (sectorCode, createdAt)
);
```

#### `sector_context_packs`
```sql
CREATE TABLE sector_context_packs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sectorCode VARCHAR(50) NOT NULL,
  packDate TIMESTAMP NOT NULL,
  keyIndicators JSON,
  topEvents JSON,
  topDocuments JSON,
  contradictions JSON,
  gaps JSON,
  whatChanged JSON,
  whatToWatch JSON,
  dataCoveragePercent DECIMAL(5,2),
  dataFreshnessPercent DECIMAL(5,2),
  contradictionCount INT,
  gapCount INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sector_date (sectorCode, packDate DESC)
);
```

#### `sector_context_pack_drift_logs`
```sql
CREATE TABLE sector_context_pack_drift_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sectorCode VARCHAR(50) NOT NULL,
  previousPackDate TIMESTAMP,
  newPackDate TIMESTAMP,
  indicatorsAdded INT,
  indicatorsRemoved INT,
  indicatorsChanged INT,
  documentsAdded INT,
  contradictionsAdded INT,
  contradictionsResolved INT,
  gapsAdded INT,
  gapsClosed INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sector (sectorCode)
);
```

#### `sector_release_gates`
```sql
CREATE TABLE sector_release_gates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sectorCode VARCHAR(50) NOT NULL UNIQUE,
  criteria JSON NOT NULL,
  overallStatus ENUM('ready', 'in_progress', 'blocked') NOT NULL,
  lastCheckedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (overallStatus)
);
```

## Usage Instructions

### For Users

1. **Navigate** to any sector page (e.g., `/sectors/currency`)
2. **Find** the "Ask the Sector Analyst" panel on the right sidebar
3. **Click** to expand the panel
4. **Review** example questions or type your own query
5. **Send** your question
6. **Review** the evidence-backed answer with citations
7. **Click** evidence pack badges to view full provenance
8. **View** charts with confidence indicators

### For Developers

1. **Import** the `SectorAgentPanel` component
2. **Pass** required props: `sectorCode`, `sectorName`, `regime`
3. **Ensure** backend router is registered in `/server/routers.ts`
4. **Run** coaching pack generation nightly
5. **Monitor** query logs for performance
6. **Update** release gates regularly

### For System Administrators

1. **Set up** cron job for coaching pack generation:
   ```bash
   0 2 * * * /path/to/cron-coaching-packs.sh
   ```

2. **Monitor** drift logs for data quality trends

3. **Run** release gate updates after changes:
   ```bash
   npm run release-gates:update
   ```

4. **Review** agent performance metrics monthly

5. **Check** citation coverage >= 95%

## Testing

### Run Integration Tests
```bash
npm test tests/sector-agents-integration.test.ts
```

### Run Coaching Pack Generation
```bash
npm run coaching-packs:generate
```

### Update Release Gates
```bash
npm run release-gates:update
```

### Check Coverage
```bash
npm run test:coverage
```

## Release Gate Status

To check current release gate status for all sectors:
```bash
npm run release-gates:summary
```

Expected output:
```
Sector              | Status       | Criteria | Last Checked
--------------------+--------------+----------+-------------------------
currency            | ✓ ready      |       10 | 2026-02-05T12:00:00Z
banking             | ◐ in_progress|       10 | 2026-02-05T12:00:00Z
...
```

## Known Limitations

1. **Data Coverage**: Some sectors may have limited historical data, resulting in more D-grade responses
2. **Uncertainty Bands**: Not available for all indicators; requires source metadata
3. **Real-time Data**: Agent uses database snapshots; not live streaming
4. **Language Detection**: Basic keyword matching; may misidentify complex queries
5. **Query Complexity**: Best for factual questions; limited inferential reasoning

## Future Enhancements

1. **RAG Integration**: Add document retrieval for richer context
2. **Multi-agent Coordination**: Cross-sector queries with agent collaboration
3. **User Personalization**: Learn from user query patterns
4. **Predictive Insights**: Proactive alerts based on user interests
5. **Voice Interface**: Audio queries in Arabic and English
6. **Mobile Optimization**: Dedicated mobile chat experience

## Maintenance

### Daily
- Check query logs for errors
- Monitor response times
- Review user satisfaction scores

### Weekly
- Analyze common query patterns
- Update example questions based on usage
- Review data gap reports

### Monthly
- Update agent capabilities
- Refresh coaching packs manually if needed
- Review and update release gate criteria
- Conduct citation coverage audits

### Quarterly
- Comprehensive accuracy review
- Update Evidence Laws if needed
- Retrain query intent detection
- Optimize performance bottlenecks

## Support

For issues or questions:
- **Technical**: Open GitHub issue
- **Data Quality**: Contact data steward team
- **Agent Behavior**: Review Evidence Laws policy

## Changelog

### 2026-02-05: Initial Release
- ✅ UI integration complete
- ✅ Backend API operational
- ✅ Agent orchestration service deployed
- ✅ Coaching pack generation automated
- ✅ Visualization components ready
- ✅ Integration tests passing
- ✅ Release gates updated

---

**Document Version**: 1.0  
**Last Updated**: February 5, 2026  
**Status**: Production Ready
