# YETO Platform - P0 Ingestion Linter Specification

**Status:** MANDATORY FOR LAUNCH  
**Enforcement:** Pre-ingestion validation gate  
**Scope:** All sources marked `required_for_p0_ingestion=true`  
**Violation:** Ingestion blocked, gap ticket auto-created, super-admin notified

---

## Overview

The P0 Ingestion Linter is a ruthless validation system that ensures all critical data sources meet production readiness standards before ingestion. It prevents data drift, ensures completeness, and automatically creates gap tickets when validation fails.

**Core Principle:** No P0 source ingests data without passing all linter checks. If a source fails, the system creates a gap ticket and notifies admins.

---

## P0 Source Definition

A source is marked `required_for_p0_ingestion=true` if:

1. **Critical for YETO mission** - Essential for economic transparency in Yemen
2. **High reliability** - Published by trusted institutions (World Bank, IMF, UN, Central Bank Yemen)
3. **Regular updates** - Data published on predictable schedule
4. **Broad coverage** - Covers multiple sectors or indicators
5. **Historical depth** - Data available from 2010 onwards

### P0 Sources (Initial List)

| Source | Organization | Cadence | Coverage | Reliability |
|--------|--------------|---------|----------|-------------|
| World Bank Open Data | World Bank | Monthly | 200+ indicators | 99% |
| IMF Data | IMF | Quarterly | Macro indicators | 98% |
| UN OCHA ReliefWeb | UN OCHA | Weekly | Humanitarian data | 97% |
| Central Bank Yemen | CBY | Monthly | Monetary data | 95% |
| WFP Food Security | WFP | Monthly | Food security | 96% |
| UNHCR Refugee Data | UNHCR | Monthly | Displacement | 97% |
| ACLED Conflict Events | ACLED | Daily | Conflict data | 98% |
| FAO Food Prices | FAO | Monthly | Food prices | 96% |
| IPC Acute Food Insecurity | IPC | Quarterly | IPC phases | 95% |
| WHO Health Data | WHO | Monthly | Health indicators | 94% |

---

## Linter Validation Checks

### Check 1: Required Metadata Validation

**Purpose:** Ensure source has complete metadata for governance and traceability

**Required Fields:**

```typescript
interface SourceMetadata {
  // Basic identification
  sourceId: string;
  name: string;
  description: string;
  organization: string;
  
  // Access information
  url: string;
  rawDataUrl?: string;
  apiEndpoint?: string;
  accessMethod: 'API' | 'WEB' | 'MANUAL' | 'FTP';
  
  // Authentication
  authType?: 'NONE' | 'API_KEY' | 'OAUTH' | 'BASIC';
  authRequired: boolean;
  
  // Data characteristics
  dataFormat: 'JSON' | 'CSV' | 'XML' | 'XLSX' | 'PDF';
  updateCadence: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'IRREGULAR';
  
  // Coverage
  geographicCoverage: string[]; // ['Yemen', 'Region', 'Global']
  temporalCoverage: {
    startDate: Date;
    endDate: Date;
  };
  
  // Quality
  reliability: number; // 0-100
  dataCompleteness: number; // 0-100
  lastVerified: Date;
  
  // Governance
  licenseType: string;
  licenseUrl: string;
  termsOfUse: string;
  contactEmail: string;
  contactName: string;
  
  // Mapping
  sectors: string[]; // YETO sectors
  indicators: string[]; // YETO indicators
  regimeHandling: 'NATIONAL' | 'ADEN_IRG' | 'SANAA_DFA' | 'MULTIPLE';
  
  // Ingestion
  required_for_p0_ingestion: boolean;
  p0_required_fields: string[];
  p0_expected_coverage_start: Date; // default 2010-01-01
  p0_max_staleness_days: number; // e.g., 30 for monthly data
  p0_min_coverage_ratio: number; // e.g., 0.85 for 85% coverage
}
```

**Validation Logic:**

```typescript
function validateMetadata(source: SourceMetadata): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!source.sourceId) errors.push('sourceId is required');
  if (!source.name) errors.push('name is required');
  if (!source.organization) errors.push('organization is required');
  if (!source.url && !source.apiEndpoint) errors.push('url or apiEndpoint is required');
  if (!source.accessMethod) errors.push('accessMethod is required');
  if (!source.dataFormat) errors.push('dataFormat is required');
  if (!source.updateCadence) errors.push('updateCadence is required');
  if (!source.licenseType) errors.push('licenseType is required');
  if (!source.contactEmail) errors.push('contactEmail is required');
  if (!source.sectors || source.sectors.length === 0) errors.push('At least one sector mapping required');
  if (!source.indicators || source.indicators.length === 0) errors.push('At least one indicator mapping required');

  // Metadata quality
  if (source.reliability < 80) warnings.push(`Low reliability score: ${source.reliability}%`);
  if (source.dataCompleteness < 70) warnings.push(`Low data completeness: ${source.dataCompleteness}%`);
  if (!source.lastVerified || (Date.now() - source.lastVerified.getTime()) > 90 * 24 * 60 * 60 * 1000) {
    warnings.push('Metadata not verified recently');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
```

---

### Check 2: Connector Configuration Validation

**Purpose:** Ensure connector exists, is configured correctly, and passes unit tests

**Validation Logic:**

```typescript
async function validateConnectorConfig(source: SourceMetadata): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check connector exists
  const connector = await getConnector(source.sourceId);
  if (!connector) {
    errors.push(`No connector found for source: ${source.sourceId}`);
    return { valid: false, errors, warnings };
  }

  // Validate connector configuration
  if (!connector.config.url && !connector.config.apiEndpoint) {
    errors.push('Connector missing URL or API endpoint');
  }

  if (connector.config.authRequired && !connector.config.auth) {
    errors.push('Connector requires authentication but auth not configured');
  }

  // Run connector unit tests
  const testResults = await runConnectorTests(source.sourceId);
  if (!testResults.passed) {
    errors.push(`Connector tests failed: ${testResults.failures.join(', ')}`);
  }

  // Check connector health
  const health = await checkConnectorHealth(source.sourceId);
  if (health.status === 'UNHEALTHY') {
    errors.push(`Connector is unhealthy: ${health.reason}`);
  } else if (health.status === 'DEGRADED') {
    warnings.push(`Connector is degraded: ${health.reason}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
```

---

### Check 3: Provenance Pipeline Validation

**Purpose:** Ensure data provenance is tracked and verifiable

**Validation Logic:**

```typescript
async function validateProvenancePipeline(source: SourceMetadata): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check artifact storage configured
  if (!source.p0_required_fields.includes('artifact_storage_key')) {
    errors.push('Artifact storage not configured for provenance');
  }

  // Check checksum calculation configured
  if (!source.p0_required_fields.includes('data_checksum')) {
    errors.push('Checksum calculation not configured');
  }

  // Check retrieval metadata captured
  if (!source.p0_required_fields.includes('retrieval_timestamp')) {
    errors.push('Retrieval timestamp not configured');
  }

  // Check transformation log configured
  if (!source.p0_required_fields.includes('transformation_log')) {
    warnings.push('Transformation log not configured (recommended)');
  }

  // Verify provenance storage is accessible
  const storageHealth = await checkProvenanceStorage();
  if (!storageHealth.accessible) {
    errors.push(`Provenance storage not accessible: ${storageHealth.reason}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
```

---

### Check 4: Coverage Validation

**Purpose:** Ensure data covers expected time period and completeness threshold

**Validation Logic:**

```typescript
async function validateCoverage(source: SourceMetadata): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  const expectedStart = source.p0_expected_coverage_start || new Date('2010-01-01');
  const expectedEnd = new Date();

  // Fetch latest data snapshot
  const latestSnapshot = await getLatestDataSnapshot(source.sourceId);
  if (!latestSnapshot) {
    errors.push('No data snapshot found for coverage analysis');
    return { valid: false, errors, warnings };
  }

  // Calculate actual coverage
  const actualStart = latestSnapshot.periodStart;
  const actualEnd = latestSnapshot.periodEnd;
  const expectedPeriods = calculateExpectedPeriods(expectedStart, expectedEnd, source.updateCadence);
  const actualPeriods = calculateActualPeriods(actualStart, actualEnd, source.updateCadence);

  // Calculate coverage ratio
  const coverageRatio = actualPeriods / expectedPeriods;
  const minCoverageRatio = source.p0_min_coverage_ratio || 0.85;

  if (coverageRatio < minCoverageRatio) {
    errors.push(`Coverage ratio ${(coverageRatio * 100).toFixed(1)}% below minimum ${(minCoverageRatio * 100).toFixed(1)}%`);
  }

  // Check for gaps
  const gaps = identifyDataGaps(actualStart, actualEnd, source.updateCadence, actualPeriods);
  if (gaps.length > 0) {
    warnings.push(`Found ${gaps.length} data gaps: ${gaps.map(g => g.period).join(', ')}`);
  }

  // Check coverage start date
  if (actualStart > expectedStart) {
    warnings.push(`Coverage starts ${differenceInDays(expectedStart, actualStart)} days after expected`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      coverageRatio,
      expectedStart,
      expectedEnd,
      actualStart,
      actualEnd,
      gaps,
    },
  };
}
```

---

### Check 5: Freshness Validation

**Purpose:** Ensure data is not stale beyond acceptable threshold

**Validation Logic:**

```typescript
async function validateFreshness(source: SourceMetadata): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Get last successful ingestion
  const lastIngestion = await getLastSuccessfulIngestion(source.sourceId);
  if (!lastIngestion) {
    errors.push('No successful ingestion history found');
    return { valid: false, errors, warnings };
  }

  // Calculate staleness
  const stalenessMs = Date.now() - lastIngestion.completedAt.getTime();
  const stalenessDays = stalenessMs / (24 * 60 * 60 * 1000);
  const maxStalenessDays = source.p0_max_staleness_days || 30;

  if (stalenessDays > maxStalenessDays) {
    errors.push(`Data is ${stalenessDays.toFixed(1)} days stale (max: ${maxStalenessDays} days)`);
  }

  // Check for ingestion failures
  const recentFailures = await getRecentIngestionFailures(source.sourceId, 7); // Last 7 days
  if (recentFailures.length > 2) {
    warnings.push(`${recentFailures.length} ingestion failures in last 7 days`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      lastIngestionTime: lastIngestion.completedAt,
      stalenessDays,
      maxStalenessDays,
      recentFailures: recentFailures.length,
    },
  };
}
```

---

## Linter Execution

### Pre-Ingestion Linter Run

```typescript
async function runP0Linter(sourceId: string): Promise<LinterResult> {
  const source = await getSource(sourceId);

  if (!source.required_for_p0_ingestion) {
    return {
      sourceId,
      passed: true,
      skipped: true,
      reason: 'Source not marked as P0 required',
    };
  }

  const results = {
    sourceId,
    passed: true,
    checks: {} as Record<string, ValidationResult>,
    gapTickets: [] as string[],
  };

  // Run all checks
  const checks = [
    { name: 'metadata', fn: validateMetadata },
    { name: 'connector', fn: validateConnectorConfig },
    { name: 'provenance', fn: validateProvenancePipeline },
    { name: 'coverage', fn: validateCoverage },
    { name: 'freshness', fn: validateFreshness },
  ];

  for (const check of checks) {
    try {
      results.checks[check.name] = await check.fn(source);
      if (!results.checks[check.name].valid) {
        results.passed = false;
      }
    } catch (error) {
      results.checks[check.name] = {
        valid: false,
        errors: [`Check failed with error: ${error.message}`],
        warnings: [],
      };
      results.passed = false;
    }
  }

  // If linter failed, create gap ticket
  if (!results.passed) {
    const gapTicket = await createDataGapTicket({
      sourceId,
      severity: 'HIGH',
      title: `P0 Ingestion Linter Failed: ${source.name}`,
      description: formatLinterFailureReport(results),
      failedChecks: Object.entries(results.checks)
        .filter(([_, result]) => !result.valid)
        .map(([name, result]) => ({ check: name, errors: result.errors })),
      remediation: generateRemediationSteps(results),
      autoCreated: true,
      notifyAdmins: true,
    });

    results.gapTickets.push(gapTicket.id);

    // Notify super-admin
    await notifyAdmin({
      title: `P0 Ingestion Linter Failed: ${source.name}`,
      message: `Source ${sourceId} failed P0 linter checks. Gap ticket: ${gapTicket.id}`,
      severity: 'HIGH',
      actionUrl: `/admin/gap-tickets/${gapTicket.id}`,
    });
  }

  return results;
}
```

---

## CI/CD Integration

### Pre-Deployment Linter Gate

**File:** `.github/workflows/ci-p0-linter.yml`

```yaml
name: P0 Ingestion Linter

on:
  pull_request:
    paths:
      - 'drizzle/schema.ts'
      - 'server/connectors/**'
      - 'data/sources/**'
  push:
    branches:
      - main
      - staging

jobs:
  p0-linter:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      - run: npm install
      - name: Run P0 Linter
        run: npm run ci:p0-linter
      - name: Report results
        if: failure()
        run: |
          echo "❌ Build failed: P0 sources failed linter checks"
          echo "Please fix all P0 source issues before deploying"
          exit 1
```

**Package.json Script:**

```json
{
  "scripts": {
    "ci:p0-linter": "ts-node scripts/ci-p0-linter.ts"
  }
}
```

**Script:** `scripts/ci-p0-linter.ts`

```typescript
import { runP0Linter } from '../server/ingestion/p0Linter';

async function main() {
  const sources = await getAllSources();
  const p0Sources = sources.filter(s => s.required_for_p0_ingestion);

  console.log(`Running P0 Linter on ${p0Sources.length} sources...`);

  let allPassed = true;
  for (const source of p0Sources) {
    const result = await runP0Linter(source.sourceId);
    
    if (!result.passed) {
      console.error(`❌ ${source.name} (${source.sourceId}) - FAILED`);
      Object.entries(result.checks).forEach(([check, checkResult]) => {
        if (!checkResult.valid) {
          checkResult.errors.forEach(err => console.error(`   [${check}] ${err}`));
        }
      });
      allPassed = false;
    } else {
      console.log(`✅ ${source.name} (${source.sourceId}) - PASSED`);
    }
  }

  if (!allPassed) {
    process.exit(1);
  }

  console.log('\n✅ All P0 sources passed linter checks');
  process.exit(0);
}

main().catch(err => {
  console.error('Linter error:', err);
  process.exit(1);
});
```

---

## Gap Ticket Auto-Creation

When P0 linter fails, an automatic gap ticket is created:

```typescript
interface DataGapTicket {
  id: string;
  sourceId: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  failedChecks: Array<{
    check: string;
    errors: string[];
  }>;
  remediation: string[];
  autoCreated: boolean;
  createdAt: Date;
  createdBy: 'P0_LINTER';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'BLOCKED';
  assignedTo?: string;
  dueDate?: Date;
}
```

**Example Gap Ticket:**

```json
{
  "id": "gap-20260118-001",
  "sourceId": "world-bank-api",
  "severity": "HIGH",
  "title": "P0 Ingestion Linter Failed: World Bank Open Data",
  "description": "Source failed P0 linter validation. See failed checks below.",
  "failedChecks": [
    {
      "check": "coverage",
      "errors": [
        "Coverage ratio 0.72 below minimum 0.85",
        "Found 8 data gaps: 2020-Q1, 2020-Q2, 2021-Q1, 2021-Q2, 2022-Q1, 2022-Q2, 2023-Q1, 2023-Q2"
      ]
    },
    {
      "check": "freshness",
      "errors": [
        "Data is 45 days stale (max: 30 days)"
      ]
    }
  ],
  "remediation": [
    "1. Contact World Bank to obtain missing data for Q1/Q2 periods",
    "2. Update connector to fetch latest data",
    "3. Run manual ingestion to backfill missing periods",
    "4. Re-run linter to verify all checks pass",
    "5. Update p0_max_staleness_days if 30-day threshold is unrealistic"
  ],
  "autoCreated": true,
  "createdAt": "2026-01-18T23:45:00Z",
  "createdBy": "P0_LINTER",
  "status": "OPEN",
  "assignedTo": null,
  "dueDate": "2026-01-25T23:59:59Z"
}
```

---

## Linter Dashboard

Super-admins can view linter status and results:

**Endpoint:** `GET /api/admin/p0-linter/status`

**Response:**

```json
{
  "lastRun": "2026-01-18T23:45:00Z",
  "nextRun": "2026-01-19T00:00:00Z",
  "totalP0Sources": 10,
  "passedSources": 8,
  "failedSources": 2,
  "results": [
    {
      "sourceId": "world-bank-api",
      "name": "World Bank Open Data",
      "status": "FAILED",
      "failedChecks": ["coverage", "freshness"],
      "gapTicketId": "gap-20260118-001"
    },
    {
      "sourceId": "imf-data",
      "name": "IMF Data",
      "status": "PASSED",
      "failedChecks": []
    }
  ],
  "openGapTickets": 3,
  "criticalGapTickets": 1
}
```

---

## Testing

### Unit Tests for Linter

```typescript
describe('P0 Ingestion Linter', () => {
  describe('Metadata Validation', () => {
    it('should fail if required fields missing');
    it('should warn if reliability below 80%');
    it('should pass with all required fields');
  });

  describe('Connector Validation', () => {
    it('should fail if connector not found');
    it('should fail if connector tests fail');
    it('should warn if connector degraded');
  });

  describe('Coverage Validation', () => {
    it('should fail if coverage below minimum ratio');
    it('should warn if gaps detected');
    it('should pass with sufficient coverage');
  });

  describe('Freshness Validation', () => {
    it('should fail if data stale beyond max');
    it('should warn if recent failures');
    it('should pass if fresh');
  });

  describe('Gap Ticket Creation', () => {
    it('should auto-create gap ticket on failure');
    it('should include remediation steps');
    it('should notify super-admin');
  });

  describe('CI Integration', () => {
    it('should fail CI if P0 source fails linter');
    it('should pass CI if all P0 sources pass');
  });
});
```

---

## Implementation Checklist

- [ ] Add P0 source fields to source registry schema
- [ ] Implement metadata validation
- [ ] Implement connector validation
- [ ] Implement provenance validation
- [ ] Implement coverage validation
- [ ] Implement freshness validation
- [ ] Implement gap ticket auto-creation
- [ ] Create linter dashboard UI
- [ ] Add CI/CD linter gate
- [ ] Write comprehensive tests
- [ ] Document linter usage
- [ ] Train admins on gap ticket workflow

---

## References

- [Route Health Report](./ROUTE_HEALTH_REPORT.md)
- [No Mock Data Guardrail](./NO_MOCK_DATA_GUARDRAIL.md)
- [Coverage Scorecard](./COVERAGE_SCORECARD.md)
