# YETO Platform - Coverage Scorecard UI & API Specification

**Status:** CRITICAL FOR TRANSPARENCY  
**Scope:** All 226 data sources, 2010-2026 coverage  
**Audience:** Public (read-only), Admins (full control)  
**Update Frequency:** Real-time (updated after each ingestion)

---

## Overview

The Coverage Scorecard provides transparent visibility into YETO's data coverage across all sectors, indicators, sources, and time periods. It shows exactly what data is available, what's missing, and why—enabling users to assess data reliability and identify gaps.

**Core Principle:** Complete transparency about data availability. Users see exactly what YETO has, what's missing, and when gaps will be filled.

---

## Coverage Scorecard Dimensions

### Dimension 1: Sector Coverage

Shows data availability by YETO sector:

| Sector | Total Indicators | Covered | Coverage % | Latest Data | Gaps |
|--------|-----------------|---------|-----------|-------------|------|
| Banking | 24 | 18 | 75% | Dec 2025 | 6 indicators |
| Trade | 31 | 26 | 84% | Nov 2025 | 5 indicators |
| Poverty | 18 | 14 | 78% | Oct 2025 | 4 indicators |
| Macroeconomy | 42 | 35 | 83% | Jan 2026 | 7 indicators |
| Prices | 15 | 12 | 80% | Dec 2025 | 3 indicators |
| Currency | 8 | 8 | 100% | Jan 2026 | 0 indicators |
| Public Finance | 22 | 16 | 73% | Sep 2025 | 6 indicators |
| Energy | 14 | 9 | 64% | Aug 2025 | 5 indicators |
| Food Security | 19 | 15 | 79% | Dec 2025 | 4 indicators |
| Aid Flows | 12 | 11 | 92% | Jan 2026 | 1 indicator |
| Labor Market | 16 | 11 | 69% | Nov 2025 | 5 indicators |
| Conflict Economy | 13 | 10 | 77% | Dec 2025 | 3 indicators |
| Infrastructure | 17 | 12 | 71% | Oct 2025 | 5 indicators |
| Agriculture | 20 | 15 | 75% | Nov 2025 | 5 indicators |
| Investment | 11 | 8 | 73% | Sep 2025 | 3 indicators |
| Microfinance | 9 | 6 | 67% | Aug 2025 | 3 indicators |

---

### Dimension 2: Temporal Coverage

Shows data availability over time:

```
2010-2015: ████████░░ 80%
2015-2020: █████████░ 90%
2020-2025: ███████░░░ 70%
2025-2026: ██████░░░░ 60%
```

**Coverage by Period:**

| Period | Available | Expected | Coverage % | Status |
|--------|-----------|----------|-----------|--------|
| 2010-2014 | 156 | 180 | 87% | ✅ Complete |
| 2015-2019 | 198 | 210 | 94% | ✅ Complete |
| 2020-2024 | 142 | 200 | 71% | ⚠️ Partial |
| 2025-2026 | 85 | 150 | 57% | ⚠️ Sparse |

---

### Dimension 3: Source Coverage

Shows which sources contribute data:

| Source | Indicators | Coverage % | Last Updated | Status |
|--------|-----------|-----------|--------------|--------|
| World Bank | 85 | 95% | 2026-01-18 | ✅ Fresh |
| IMF | 42 | 92% | 2026-01-15 | ✅ Fresh |
| UN OCHA | 28 | 88% | 2026-01-17 | ✅ Fresh |
| Central Bank Yemen | 15 | 78% | 2025-12-20 | ⚠️ Stale |
| WFP | 22 | 85% | 2026-01-16 | ✅ Fresh |
| UNHCR | 18 | 80% | 2026-01-14 | ✅ Fresh |
| ACLED | 12 | 100% | 2026-01-18 | ✅ Fresh |
| FAO | 16 | 82% | 2026-01-10 | ⚠️ Stale |
| IPC | 8 | 75% | 2025-12-15 | ⚠️ Stale |
| WHO | 14 | 70% | 2026-01-12 | ✅ Fresh |

---

### Dimension 4: Indicator Coverage

Shows data availability for specific indicators:

| Indicator | Sector | Data Points | Coverage % | Latest | Status |
|-----------|--------|------------|-----------|--------|--------|
| GDP | Macroeconomy | 156 | 95% | 2025-Q4 | ✅ |
| Inflation | Prices | 142 | 92% | 2025-12 | ✅ |
| Exchange Rate | Currency | 180 | 100% | 2026-01-18 | ✅ |
| Food Prices | Food Security | 98 | 78% | 2025-11 | ⚠️ |
| Unemployment | Labor Market | 45 | 62% | 2025-Q3 | ❌ |
| Conflict Events | Conflict Economy | 2156 | 100% | 2026-01-18 | ✅ |
| Bank Deposits | Banking | 24 | 45% | 2025-09 | ❌ |

---

## Coverage Scorecard API

### Endpoint 1: Sector Coverage

**GET** `/api/coverage/sectors`

**Response:**

```json
{
  "sectors": [
    {
      "sectorId": "banking",
      "name": "Banking",
      "totalIndicators": 24,
      "coveredIndicators": 18,
      "coveragePercentage": 75,
      "latestDataDate": "2025-12-20",
      "gaps": [
        {
          "indicatorId": "bank-deposits",
          "indicatorName": "Bank Deposits",
          "missingPeriods": ["2025-Q4", "2026-Q1"],
          "lastAvailable": "2025-Q3",
          "gapTicketId": "gap-20260118-001"
        }
      ],
      "sources": [
        {
          "sourceId": "central-bank-yemen",
          "name": "Central Bank Yemen",
          "indicatorsProvided": 12,
          "lastUpdated": "2025-12-20",
          "status": "STALE"
        }
      ]
    }
  ],
  "summary": {
    "totalSectors": 16,
    "averageCoverage": 78,
    "fullyCovered": 2,
    "partiallyCovered": 12,
    "uncovered": 2
  }
}
```

### Endpoint 2: Temporal Coverage

**GET** `/api/coverage/temporal?startDate=2010-01-01&endDate=2026-01-31`

**Response:**

```json
{
  "periods": [
    {
      "period": "2010-2014",
      "startDate": "2010-01-01",
      "endDate": "2014-12-31",
      "availableDataPoints": 156,
      "expectedDataPoints": 180,
      "coveragePercentage": 87,
      "status": "COMPLETE",
      "indicators": {
        "total": 45,
        "covered": 42,
        "gaps": 3
      }
    },
    {
      "period": "2025-2026",
      "startDate": "2025-01-01",
      "endDate": "2026-01-31",
      "availableDataPoints": 85,
      "expectedDataPoints": 150,
      "coveragePercentage": 57,
      "status": "SPARSE",
      "indicators": {
        "total": 48,
        "covered": 28,
        "gaps": 20
      }
    }
  ],
  "timeline": {
    "oldestData": "2010-01-15",
    "newestData": "2026-01-18",
    "totalYears": 16,
    "totalDataPoints": 2145
  }
}
```

### Endpoint 3: Source Coverage

**GET** `/api/coverage/sources`

**Response:**

```json
{
  "sources": [
    {
      "sourceId": "world-bank-api",
      "name": "World Bank Open Data",
      "organization": "World Bank",
      "indicatorsProvided": 85,
      "coveragePercentage": 95,
      "lastUpdated": "2026-01-18T23:45:00Z",
      "status": "FRESH",
      "sectors": ["Banking", "Trade", "Macroeconomy", "Prices"],
      "indicators": [
        {
          "indicatorId": "gdp",
          "name": "GDP",
          "dataPoints": 156,
          "coverage": 95,
          "latestDate": "2025-Q4"
        }
      ],
      "health": {
        "lastSuccessfulIngestion": "2026-01-18T23:45:00Z",
        "failureRate": 0.02,
        "averageResponseTime": 245,
        "status": "HEALTHY"
      }
    }
  ],
  "summary": {
    "totalSources": 226,
    "activeSources": 145,
    "healthySources": 138,
    "degradedSources": 5,
    "unhealthySources": 2
  }
}
```

### Endpoint 4: Indicator Coverage

**GET** `/api/coverage/indicators?sectorId=banking`

**Response:**

```json
{
  "indicators": [
    {
      "indicatorId": "bank-deposits",
      "name": "Bank Deposits",
      "sectorId": "banking",
      "dataPoints": 24,
      "coveragePercentage": 45,
      "latestDate": "2025-09-30",
      "expectedFrequency": "QUARTERLY",
      "sources": [
        {
          "sourceId": "central-bank-yemen",
          "name": "Central Bank Yemen",
          "lastProvided": "2025-09-30"
        }
      ],
      "gaps": [
        {
          "period": "2025-Q4",
          "status": "MISSING",
          "expectedDate": "2026-01-15",
          "gapTicketId": "gap-20260118-001"
        }
      ],
      "trend": {
        "direction": "DECLINING",
        "recentCoverage": 45,
        "previousCoverage": 60,
        "changePercentage": -25
      }
    }
  ],
  "sector": {
    "sectorId": "banking",
    "name": "Banking",
    "totalIndicators": 24,
    "averageCoverage": 75
  }
}
```

### Endpoint 5: Data Gaps

**GET** `/api/coverage/gaps?severity=HIGH&status=OPEN`

**Response:**

```json
{
  "gaps": [
    {
      "gapId": "gap-20260118-001",
      "sourceId": "central-bank-yemen",
      "sourceName": "Central Bank Yemen",
      "indicatorId": "bank-deposits",
      "indicatorName": "Bank Deposits",
      "sectorId": "banking",
      "period": "2025-Q4",
      "expectedDate": "2026-01-15",
      "severity": "HIGH",
      "status": "OPEN",
      "reason": "Source not updated",
      "impact": "Banking sector coverage drops from 78% to 45%",
      "remediation": "Contact Central Bank Yemen for Q4 data",
      "createdAt": "2026-01-18T23:45:00Z",
      "dueDate": "2026-01-25T23:59:59Z"
    }
  ],
  "summary": {
    "totalGaps": 42,
    "criticalGaps": 3,
    "highGaps": 8,
    "mediumGaps": 18,
    "lowGaps": 13
  }
}
```

---

## Coverage Scorecard UI

### Component 1: Sector Coverage Dashboard

**Path:** `client/src/pages/CoverageScorecard.tsx`

**Features:**

- **Sector Grid** - Visual grid showing coverage % for each sector with color coding
  - 🟢 Green (>90%) - Excellent coverage
  - 🟡 Yellow (70-90%) - Good coverage
  - 🟠 Orange (50-70%) - Partial coverage
  - 🔴 Red (<50%) - Poor coverage

- **Coverage Trend** - Line chart showing coverage trend over time
- **Gap Heatmap** - Heatmap showing gaps by sector and time period
- **Source Contribution** - Stacked bar chart showing which sources contribute to each sector
- **Latest Data** - Table showing latest data date for each sector

### Component 2: Temporal Coverage View

**Features:**

- **Timeline Visualization** - Interactive timeline showing data availability by period
- **Period Selector** - Dropdown to select specific time period
- **Coverage Breakdown** - Table showing coverage % by period
- **Gap Identification** - Highlight missing periods

### Component 3: Source Health Dashboard

**Features:**

- **Source Status Table** - All sources with health status
- **Freshness Indicator** - Shows time since last update
- **Ingestion History** - Chart showing ingestion success rate
- **Health Metrics** - Response time, failure rate, data quality

### Component 4: Data Gap Tracker

**Features:**

- **Gap List** - All open gaps with severity
- **Gap Details** - Click to view gap details and remediation
- **Gap Timeline** - Show when gaps will be filled
- **Gap Notifications** - Alert when gap expected to be filled

---

## Coverage Calculation

### Algorithm

```typescript
interface CoverageCalculation {
  // Input
  sourceId: string;
  indicatorId: string;
  startDate: Date;
  endDate: Date;
  expectedFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';

  // Calculation
  expectedPeriods: number; // Based on frequency
  actualPeriods: number; // Data points available
  missingPeriods: string[]; // Specific gaps
  coveragePercentage: number; // (actualPeriods / expectedPeriods) * 100

  // Quality
  dataQuality: number; // 0-100 based on completeness
  confidence: number; // 0-100 based on source reliability
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
}

function calculateCoverage(params: CoverageCalculation): CoverageResult {
  // Calculate expected periods based on frequency
  const expectedPeriods = calculateExpectedPeriods(
    params.startDate,
    params.endDate,
    params.expectedFrequency
  );

  // Get actual data points
  const dataPoints = await getDataPoints(
    params.sourceId,
    params.indicatorId,
    params.startDate,
    params.endDate
  );

  // Identify missing periods
  const missingPeriods = identifyMissingPeriods(
    params.startDate,
    params.endDate,
    params.expectedFrequency,
    dataPoints
  );

  // Calculate coverage percentage
  const coveragePercentage = (dataPoints.length / expectedPeriods) * 100;

  // Calculate data quality
  const dataQuality = calculateDataQuality(dataPoints);

  // Get source reliability
  const sourceReliability = await getSourceReliability(params.sourceId);

  // Calculate confidence
  const confidence = (coveragePercentage * 0.6) + (sourceReliability * 0.4);

  // Determine trend
  const trend = calculateTrend(params.sourceId, params.indicatorId);

  return {
    ...params,
    expectedPeriods,
    actualPeriods: dataPoints.length,
    missingPeriods,
    coveragePercentage,
    dataQuality,
    confidence,
    trend,
  };
}
```

---

## Real-Time Updates

Coverage scorecard updates automatically after each ingestion:

```typescript
async function onIngestionComplete(ingestionJob: IngestionJob) {
  // Recalculate coverage for affected indicators
  const affectedIndicators = await getAffectedIndicators(ingestionJob.sourceId);

  for (const indicator of affectedIndicators) {
    const coverage = await calculateCoverage({
      sourceId: ingestionJob.sourceId,
      indicatorId: indicator.id,
      startDate: new Date('2010-01-01'),
      endDate: new Date(),
      expectedFrequency: indicator.expectedFrequency,
    });

    // Update coverage in database
    await updateCoverageRecord(coverage);

    // Broadcast update to connected clients
    await broadcastCoverageUpdate(coverage);

    // Check for coverage improvements/declines
    const previousCoverage = await getPreviousCoverage(indicator.id);
    if (coverage.coveragePercentage > previousCoverage.coveragePercentage) {
      // Coverage improved - close related gap tickets
      await closeRelatedGapTickets(indicator.id);
    }
  }
}
```

---

## Transparency Features

### Feature 1: Gap Explanation

Every gap includes explanation:

```json
{
  "gapId": "gap-20260118-001",
  "period": "2025-Q4",
  "reason": "Source not yet published",
  "expectedDate": "2026-01-15",
  "status": "EXPECTED",
  "explanation": "Central Bank Yemen typically publishes quarterly data 2 weeks after quarter end. Q4 2025 data expected by January 15, 2026.",
  "remediation": "Wait for source publication or contact Central Bank Yemen",
  "userMessage": "Data for Q4 2025 is expected to be available by January 15, 2026"
}
```

### Feature 2: Source Reliability Scoring

Each source has transparency score:

```json
{
  "sourceId": "world-bank-api",
  "reliabilityScore": 95,
  "scoreBreakdown": {
    "updateTimeliness": 98,
    "dataCompleteness": 92,
    "dataAccuracy": 96,
    "documentationQuality": 94,
    "accessReliability": 95
  },
  "historicalPerformance": {
    "onTimeUpdates": 98,
    "failureRate": 0.02,
    "averageResponseTime": 245
  }
}
```

### Feature 3: Coverage Confidence Levels

Users understand data reliability:

```json
{
  "indicatorId": "gdp",
  "coveragePercentage": 95,
  "confidence": {
    "level": "HIGH",
    "score": 92,
    "factors": [
      "95% temporal coverage",
      "Source reliability: 95%",
      "Data quality: 96%",
      "Recent data: Updated 2026-01-18"
    ],
    "warnings": []
  }
}
```

---

## Implementation Checklist

- [ ] Create coverage calculation engine
- [ ] Build sector coverage dashboard
- [ ] Build temporal coverage view
- [ ] Build source health dashboard
- [ ] Build data gap tracker
- [ ] Implement real-time coverage updates
- [ ] Create coverage APIs
- [ ] Add bilingual interface
- [ ] Write comprehensive tests
- [ ] Document coverage methodology
- [ ] Train admins on gap management

---

## References

- [Route Health Report](./ROUTE_HEALTH_REPORT.md)
- [P0 Ingestion Linter](./P0_INGESTION_LINTER.md)
- [Data Gaps System](./DATA_GAPS_SYSTEM.md)
