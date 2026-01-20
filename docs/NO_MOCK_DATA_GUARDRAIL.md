# YETO Platform - Zero-Mock-Data Guarantee

**Status:** MANDATORY  
**Enforcement:** CI/CD Pipeline  
**Scope:** All production routes  
**Violation:** Build failure (cannot deploy)

---

## Overview

The YETO platform must never return mock or placeholder data to users in production. This document specifies how mock data is identified, prevented, and tested.

**Core Rule:** Every number, chart, KPI, and dataset visible to users must be traceable to real data sources with documented provenance.

---

## What Constitutes Mock Data

### Prohibited Patterns

Mock data includes any of the following:

1. **Hardcoded fixture data** in API responses
   ```typescript
   // ❌ PROHIBITED
   const mockData = [
     { id: 1, name: 'Test Bank', balance: 1000000 },
     { id: 2, name: 'Demo Bank', balance: 2000000 },
   ];
   return res.json(mockData);
   ```

2. **Placeholder values** in responses
   ```typescript
   // ❌ PROHIBITED
   return res.json({
     dataPoints: 0,
     lastUpdated: 'TBD',
     coverage: 'Coming soon',
   });
   ```

3. **Faker/random data generators** in production
   ```typescript
   // ❌ PROHIBITED
   import { faker } from '@faker-js/faker';
   const mockUser = faker.person.fullName();
   ```

4. **TODO or placeholder comments** in data paths
   ```typescript
   // ❌ PROHIBITED
   // TODO: Replace with real data from API
   const data = [/* mock data */];
   ```

5. **Test data** accessible in production
   ```typescript
   // ❌ PROHIBITED
   if (process.env.NODE_ENV === 'development') {
     return mockData; // Accessible in production if env not set correctly
   }
   ```

6. **Conditional fallbacks** to mock data
   ```typescript
   // ❌ PROHIBITED
   try {
     const data = await fetchRealData();
     return data;
   } catch {
     return mockData; // Falls back to mock on error
   }
   ```

### Allowed Patterns

The following patterns are acceptable:

1. **Real database queries**
   ```typescript
   // ✅ ALLOWED
   const data = await db.select().from(indicators);
   return res.json(data);
   ```

2. **Real API calls** with proper error handling
   ```typescript
   // ✅ ALLOWED
   try {
     const data = await fetchFromWorldBank();
     return res.json(data);
   } catch (error) {
     // Return error response, not mock data
     return res.status(503).json({ error: 'Data source unavailable' });
   }
   ```

3. **Cached real data** with freshness metadata
   ```typescript
   // ✅ ALLOWED
   const cachedData = await cache.get('world-bank-data');
   return res.json({
     data: cachedData,
     cached: true,
     cachedAt: new Date(),
   });
   ```

4. **Staging-only demo data** clearly marked
   ```typescript
   // ✅ ALLOWED (staging only)
   if (process.env.NODE_ENV === 'staging' && process.env.DEMO_MODE === 'true') {
     return res.json({
       data: demoData,
      _demo: true,
      _demoWarning: 'This is demo data for staging testing only',
    });
  }
  ```

5. **Empty responses** with clear explanation
   ```typescript
   // ✅ ALLOWED
   return res.json({
     data: [],
     message: 'No data available for this period',
     dataGapTicket: 'gap-12345',
   });
   ```

---

## Identifying Mock Data

### Code Patterns to Search For

The following patterns indicate potential mock data:

```bash
# Search for mock data patterns
grep -r "mock" src/ --include="*.ts" --include="*.tsx" | grep -v "\.test\." | grep -v "\.mock\."
grep -r "TODO.*data" src/ --include="*.ts" --include="*.tsx" | grep -v "\.test\."
grep -r "faker\." src/ --include="*.ts" --include="*.tsx" | grep -v "\.test\."
grep -r "placeholder" src/ --include="*.ts" --include="*.tsx" | grep -v "\.test\."
grep -r "dummy" src/ --include="*.ts" --include="*.tsx" | grep -v "\.test\."
grep -r "test.*data\|data.*test" src/ --include="*.ts" --include="*.tsx" | grep -v "\.test\."
```

### Files to Audit

Priority audit files:

1. **API endpoints** - `server/routers/*.ts`
2. **tRPC procedures** - `server/routers.ts`
3. **Page components** - `client/src/pages/*.tsx`
4. **Data fetching** - `client/src/lib/*.ts`
5. **Server services** - `server/services/*.ts`

---

## CI/CD Guardrail Implementation

### Pre-Deployment Mock Data Test

Create a CI test that fails if mock data is detected:

**File:** `scripts/ci-check-mock-data.ts`

```typescript
import fs from 'fs';
import path from 'path';

const MOCK_DATA_PATTERNS = [
  /const\s+mock\w+\s*=\s*\[/i,
  /faker\./,
  /TODO.*data/i,
  /placeholder/i,
  /dummy.*data/i,
  /test.*data(?!base)/i,
  /return\s+mock/i,
];

const EXCLUDED_FILES = [
  '.test.ts',
  '.mock.ts',
  'node_modules',
  'dist',
  '.next',
];

function isMockDataFile(filePath: string): boolean {
  return EXCLUDED_FILES.some(excluded => filePath.includes(excluded));
}

function scanForMockData(dir: string, results: any[] = []): any[] {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      scanForMockData(filePath, results);
    } else if ((filePath.endsWith('.ts') || filePath.endsWith('.tsx')) && !isMockDataFile(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');

      for (const pattern of MOCK_DATA_PATTERNS) {
        const matches = content.match(pattern);
        if (matches) {
          results.push({
            file: filePath,
            pattern: pattern.toString(),
            line: content.substring(0, content.indexOf(matches[0])).split('\n').length,
          });
        }
      }
    }
  }

  return results;
}

// Run scan
const mockDataFiles = scanForMockData('src');

if (mockDataFiles.length > 0) {
  console.error('❌ Mock data detected in production code:');
  mockDataFiles.forEach(file => {
    console.error(`  ${file.file}:${file.line} - ${file.pattern}`);
  });
  process.exit(1);
} else {
  console.log('✅ No mock data detected');
  process.exit(0);
}
```

### CI Configuration

**File:** `.github/workflows/ci-mock-data-check.yml`

```yaml
name: Mock Data Check

on:
  pull_request:
    paths:
      - 'src/**'
      - 'server/**'
      - 'client/**'
  push:
    branches:
      - main
      - staging

jobs:
  mock-data-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      - run: npm install
      - name: Check for mock data
        run: npm run ci:check-mock-data
      - name: Report results
        if: failure()
        run: |
          echo "❌ Build failed: Mock data detected in production code"
          echo "Please remove all mock data before deploying"
          exit 1
```

### Package.json Script

```json
{
  "scripts": {
    "ci:check-mock-data": "ts-node scripts/ci-check-mock-data.ts"
  }
}
```

---

## Runtime Mock Data Detection

### Middleware for Mock Data Detection

**File:** `server/_core/mock-data-detector.ts`

```typescript
import { Request, Response, NextFunction } from 'express';

interface MockDataIndicator {
  field: string;
  value: any;
  reason: string;
}

function detectMockData(data: any, path: string = ''): MockDataIndicator[] {
  const indicators: MockDataIndicator[] = [];

  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      indicators.push(...detectMockData(data[i], `${path}[${i}]`));
    }
  } else if (typeof data === 'object' && data !== null) {
    for (const [key, value] of Object.entries(data)) {
      const fieldPath = path ? `${path}.${key}` : key;

      // Check for mock data patterns
      if (typeof value === 'string') {
        if (value.toLowerCase().includes('mock') || value.toLowerCase().includes('test')) {
          indicators.push({
            field: fieldPath,
            value,
            reason: 'Contains "mock" or "test"',
          });
        }
        if (value === 'TBD' || value === 'TODO' || value === 'Coming soon') {
          indicators.push({
            field: fieldPath,
            value,
            reason: 'Placeholder value',
          });
        }
      }

      // Recursively check nested objects
      if (typeof value === 'object' && value !== null) {
        indicators.push(...detectMockData(value, fieldPath));
      }
    }
  }

  return indicators;
}

export function mockDataDetectorMiddleware(req: Request, res: Response, next: NextFunction) {
  // Only check in staging
  if (process.env.NODE_ENV !== 'staging') {
    return next();
  }

  // Intercept response
  const originalJson = res.json.bind(res);

  res.json = function (data: any) {
    const mockIndicators = detectMockData(data);

    if (mockIndicators.length > 0) {
      console.warn('⚠️  Potential mock data detected in response:');
      mockIndicators.forEach(indicator => {
        console.warn(`  ${indicator.field}: ${indicator.value} (${indicator.reason})`);
      });

      // Add warning header
      res.set('X-Mock-Data-Warning', `${mockIndicators.length} potential mock data indicators detected`);
    }

    return originalJson(data);
  };

  next();
}
```

### Response Validation Test

**File:** `server/routes.test.ts`

```typescript
describe('Mock Data Guarantee', () => {
  it('should not return mock data from any production route', async () => {
    const routes = [
      '/api/sectors/banking',
      '/api/indicators',
      '/api/data-repository',
      '/api/coverage',
      // ... all production routes
    ];

    for (const route of routes) {
      const response = await request(app).get(route);

      // Check for mock data patterns
      const responseText = JSON.stringify(response.body);
      expect(responseText).not.toMatch(/mock/i);
      expect(responseText).not.toMatch(/faker/i);
      expect(responseText).not.toMatch(/TODO/);
      expect(responseText).not.toMatch(/placeholder/i);
      expect(responseText).not.toMatch(/dummy/i);

      // Verify response has real data or proper error
      if (response.status === 200) {
        expect(response.body).toBeDefined();
        expect(response.body.data || response.body.length).toBeDefined();
      } else {
        // Should be proper error, not mock data
        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.body.error).toBeDefined();
      }
    }
  });
});
```

---

## Handling Missing Data

When real data is unavailable, follow this pattern:

### Pattern 1: Empty Response with Gap Ticket

```typescript
// ✅ CORRECT
const data = await db.select().from(indicators).where(/* ... */);

if (data.length === 0) {
  // Create data gap ticket
  const gapTicket = await createDataGapTicket({
    sourceId: 'world-bank-api',
    indicator: 'GDP',
    period: '2024',
    severity: 'HIGH',
    message: 'No data available for this period',
  });

  return res.json({
    data: [],
    message: 'No data available for this period',
    dataGapTicket: gapTicket.id,
    suggestedAlternatives: [
      { source: 'IMF', indicator: 'GDP Estimate' },
      { source: 'UN', indicator: 'GDP Proxy' },
    ],
  });
}

return res.json({ data });
```

### Pattern 2: Error Response

```typescript
// ✅ CORRECT
try {
  const data = await fetchFromExternalAPI();
  return res.json(data);
} catch (error) {
  // Log error for investigation
  logger.error('API fetch failed', { error, source: 'world-bank' });

  // Return error response, not mock data
  return res.status(503).json({
    error: 'Data source temporarily unavailable',
    message: 'Unable to fetch data from World Bank API',
    retryAfter: 300, // seconds
  });
}
```

---

## Audit Trail for Data Sources

Every API response must include provenance metadata:

```typescript
interface DataResponse {
  data: any[];
  metadata: {
    source: string;
    sourceId: string;
    lastUpdated: Date;
    confidence: number; // 0-100
    coverage: {
      startDate: Date;
      endDate: Date;
      completeness: number; // 0-100
    };
    provenance: {
      fetchedAt: Date;
      fetchedBy: string;
      checksum: string;
      storageKey: string;
    };
  };
}
```

---

## Compliance Checklist

Before deploying to production:

- [ ] Run `npm run ci:check-mock-data` - passes
- [ ] All routes return real data or proper errors
- [ ] All responses include provenance metadata
- [ ] Data gap tickets created for missing data
- [ ] Error responses are proper HTTP errors (not mock data)
- [ ] No TODO or placeholder values in responses
- [ ] All external API calls have error handling
- [ ] Staging-only demo data is clearly marked
- [ ] Test data is isolated to `.test.ts` files
- [ ] Mock data is isolated to `.mock.ts` files

---

## Enforcement

### Build Failure

The CI pipeline will fail if:
- Mock data patterns detected in production code
- Any production route returns mock data
- Mock data patterns found in API responses

### Deployment Blocking

Deployments are blocked if:
- CI mock data check fails
- Runtime mock data detection triggers
- Manual review finds mock data

### Post-Deployment Monitoring

Monitor for mock data in production:
- Automated daily scans
- Response validation tests
- User reports of suspicious data
- Anomaly detection

---

## References

- [Route Health Report](./ROUTE_HEALTH_REPORT.md)
- [Data Ingestion Linter](./P0_INGESTION_LINTER.md)
- [Provenance System](./PROVENANCE_SYSTEM.md)
