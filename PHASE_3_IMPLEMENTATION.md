# YETO Manus 1.6 Max — Phase 3: Ingestion Framework + Provenance + P0 Indicators

**Status:** SPECIFICATIONS COMPLETE  
**Estimated Effort:** 16-20 hours  
**Deliverables:** Indicator dictionary, methodology ledger, provenance system, P0 linter, ingestion pipelines

---

## Phase 3 Objectives

1. **Indicator Dictionary** - Standardized definitions for all 200+ indicators across 12 sectors
2. **Methodology Ledger** - Document calculation methods, transformations, and assumptions
3. **Provenance System** - Track data lineage from source through ingestion to publication
4. **P0 Indicator Validation** - Enforce data quality for 40 priority indicators
5. **Ingestion Pipelines** - Automated ETL for all 225 sources with error handling

---

## 1. Indicator Dictionary System

### 1.1 Data Model

**Table: `indicator`**
```sql
CREATE TABLE indicator (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_key text UNIQUE NOT NULL,           -- IND-001, IND-002, etc.
  name_en text NOT NULL,
  name_ar text,
  description_en text,
  description_ar text,
  unit_en text,                                  -- "YER", "USD", "%", "persons", etc.
  unit_ar text,
  category text NOT NULL,                        -- Banking, Trade, Macroeconomy, etc.
  subcategory text,
  data_type text NOT NULL,                       -- numeric | categorical | boolean
  frequency text NOT NULL,                       -- DAILY, WEEKLY, MONTHLY, QUARTERLY, ANNUAL
  is_p0 boolean NOT NULL DEFAULT false,          -- Priority indicator flag
  p0_tier text,                                  -- CRITICAL, HIGH, MEDIUM, LOW
  methodology_id uuid REFERENCES methodology(id),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_indicator_category ON indicator(category);
CREATE INDEX idx_indicator_is_p0 ON indicator(is_p0);
```

**Table: `indicator_source_mapping`**
```sql
CREATE TABLE indicator_source_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_id uuid NOT NULL REFERENCES indicator(id) ON DELETE CASCADE,
  source_id uuid NOT NULL REFERENCES source(id) ON DELETE CASCADE,
  source_field_name text NOT NULL,               -- Field name in source data
  transformation text,                           -- SQL/formula to transform source value
  confidence_score numeric(3,2),                 -- 0.00-1.00 (1.0 = high confidence)
  notes text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE(indicator_id, source_id)
);

CREATE INDEX idx_indicator_source_mapping ON indicator_source_mapping(indicator_id, source_id);
```

**Table: `methodology`**
```sql
CREATE TABLE methodology (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  methodology_key text UNIQUE NOT NULL,
  name_en text NOT NULL,
  name_ar text,
  description text,
  calculation_formula text,                      -- Mathematical formula or description
  assumptions jsonb NOT NULL DEFAULT '{}'::jsonb,
  limitations text,
  data_sources text[],                           -- Array of source IDs
  created_by uuid REFERENCES user_account(id),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_methodology_created_at ON methodology(created_at DESC);
```

### 1.2 P0 Indicator List (40 Critical Indicators)

| Indicator Key | Name | Category | Unit | Sources | Frequency |
|---|---|---|---|---|---|
| IND-001 | FX Rate (USD/YER) | Currency | YER/USD | CBY Aden, CBY Sanaa, WB | Daily |
| IND-002 | FX Rate (SAR/YER) | Currency | YER/SAR | CBY Aden, CBY Sanaa | Daily |
| IND-003 | Inflation Rate (YoY) | Prices | % | CSO, WB, IMF | Monthly |
| IND-004 | Food Price Index | Prices | Index | WFP, FAO | Weekly |
| IND-005 | Fuel Price (Diesel) | Prices | YER/liter | OCHA, WFP | Weekly |
| IND-006 | Fuel Price (Petrol) | Prices | YER/liter | OCHA, WFP | Weekly |
| IND-007 | Central Bank Reserves | Banking | USD millions | CBY Aden, CBY Sanaa, IMF | Monthly |
| IND-008 | Money Supply (M2) | Banking | YER billions | CBY Aden, CBY Sanaa | Monthly |
| IND-009 | Commercial Bank Deposits | Banking | YER billions | CBY Aden, CBY Sanaa | Monthly |
| IND-010 | Private Sector Credit | Banking | YER billions | CBY Aden, CBY Sanaa | Monthly |
| IND-011 | Unemployment Rate | Labor | % | CSO, WB, ILO | Annual |
| IND-012 | Labor Force Participation | Labor | % | CSO, WB, ILO | Annual |
| IND-013 | Remittances Inflow | Trade | USD millions | WB, IMF, CBY | Monthly |
| IND-014 | Merchandise Exports | Trade | USD millions | CSO, WB, IMF | Monthly |
| IND-015 | Merchandise Imports | Trade | USD millions | CSO, WB, IMF | Monthly |
| IND-016 | Trade Balance | Trade | USD millions | CSO, WB, IMF | Monthly |
| IND-017 | Oil Production | Energy | barrels/day | OPEC, WB, CSO | Monthly |
| IND-018 | Oil Exports | Energy | barrels/day | OPEC, WB, CSO | Monthly |
| IND-019 | Government Revenue | Fiscal | YER billions | MOF, IMF, WB | Monthly |
| IND-020 | Government Expenditure | Fiscal | YER billions | MOF, IMF, WB | Monthly |
| IND-021 | Budget Deficit | Fiscal | YER billions | MOF, IMF, WB | Monthly |
| IND-022 | Public Debt | Fiscal | YER billions | MOF, IMF, WB | Annual |
| IND-023 | Poverty Rate | Social | % | CSO, WB, UNDP | Annual |
| IND-024 | Malnutrition Rate (Children) | Health | % | UNICEF, WFP, WHO | Annual |
| IND-025 | Mortality Rate (Under-5) | Health | per 1000 | WHO, UNICEF, WB | Annual |
| IND-026 | Life Expectancy | Health | years | WHO, WB, UNDP | Annual |
| IND-027 | Conflict Deaths | Security | count | ACLED, UCDP, UN | Monthly |
| IND-028 | IDPs (Total) | Humanitarian | count | OCHA, IOM, UN | Monthly |
| IND-029 | Refugees (Total) | Humanitarian | count | UNHCR, UN | Monthly |
| IND-030 | Food Insecurity (Acute) | Humanitarian | % population | WFP, FAO, IPC | Monthly |
| IND-031 | Healthcare Access | Health | % population | WHO, OCHA, UN | Annual |
| IND-032 | School Enrollment (Primary) | Education | % | UNESCO, CSO, WB | Annual |
| IND-033 | School Enrollment (Secondary) | Education | % | UNESCO, CSO, WB | Annual |
| IND-034 | Literacy Rate | Education | % | UNESCO, CSO, WB | Annual |
| IND-035 | Internet Penetration | Technology | % population | ITU, WB, CSO | Annual |
| IND-036 | Mobile Penetration | Technology | % population | ITU, WB, CSO | Annual |
| IND-037 | GDP (Nominal) | Macroeconomy | USD billions | WB, IMF, CSO | Annual |
| IND-038 | GDP Growth Rate | Macroeconomy | % | WB, IMF, CSO | Annual |
| IND-039 | Per Capita Income | Macroeconomy | USD | WB, IMF, CSO | Annual |
| IND-040 | Gini Coefficient | Inequality | 0-100 | WB, UNDP, CSO | Annual |

### 1.3 Indicator Dictionary UI (`/indicators`)

**Public View:**
- Search indicators by name/category
- Filter by category, frequency, P0 status
- View indicator details:
  - Definition
  - Unit
  - Frequency
  - Data sources
  - Methodology link
  - Latest value
  - Historical chart
  - Download data button

**Admin View (`/admin/indicators`):**
- Create/edit indicators
- Manage source mappings
- Link to methodologies
- Mark as P0
- Set P0 tier (CRITICAL/HIGH/MEDIUM/LOW)
- View usage statistics

---

## 2. Methodology Ledger System

### 2.1 Data Model

**Table: `methodology` (already defined above)**

**Table: `methodology_change_log`**
```sql
CREATE TABLE methodology_change_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  methodology_id uuid NOT NULL REFERENCES methodology(id) ON DELETE CASCADE,
  changed_by uuid REFERENCES user_account(id),
  change_type text NOT NULL,                     -- CREATED | UPDATED | REVIEWED
  old_value jsonb,
  new_value jsonb,
  reason text,
  changed_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_methodology_change_log_methodology ON methodology_change_log(methodology_id);
```

### 2.2 Methodology Examples

**Example 1: FX Rate (USD/YER)**
```json
{
  "methodology_key": "METH-001",
  "name_en": "FX Rate USD/YER",
  "calculation_formula": "CBY Aden official rate OR market rate if CBY unavailable",
  "assumptions": {
    "primary_source": "CBY Aden",
    "fallback_source": "CBY Sanaa",
    "fallback_to_market": true,
    "market_source": "World Bank"
  },
  "limitations": "CBY Aden rate may not reflect parallel market rates; Sanaa rate historically inflated",
  "data_sources": ["SRC-004", "SRC-005", "SRC-001"]
}
```

**Example 2: Inflation Rate (YoY)**
```json
{
  "methodology_key": "METH-002",
  "name_en": "Inflation Rate (Year-over-Year)",
  "calculation_formula": "(CPI_current_month - CPI_same_month_last_year) / CPI_same_month_last_year * 100",
  "assumptions": {
    "base_year": 2010,
    "base_index": 100,
    "cpi_basket": "Urban consumer basket",
    "coverage": "Sana'a and Aden"
  },
  "limitations": "CSO data may be incomplete; WB estimates used as fallback; conflict periods have data gaps",
  "data_sources": ["SRC-006", "SRC-001", "SRC-002"]
}
```

### 2.3 Methodology UI (`/methodologies`)

**Public View:**
- Browse all methodologies
- Search by indicator or category
- View methodology details:
  - Calculation formula
  - Assumptions
  - Limitations
  - Data sources used
  - Change history (who changed what and when)
  - Related indicators

**Admin View (`/admin/methodologies`):**
- Create/edit methodologies
- Version control (track all changes)
- Peer review workflow
- Approve/reject changes
- View change history

---

## 3. Provenance System

### 3.1 Data Model

**Table: `provenance_ledger`**
```sql
CREATE TABLE provenance_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id uuid NOT NULL REFERENCES observation(id) ON DELETE CASCADE,
  source_id uuid NOT NULL REFERENCES source(id) ON DELETE CASCADE,
  ingestion_run_id uuid NOT NULL REFERENCES ingestion_run(id) ON DELETE CASCADE,
  raw_object_id uuid NOT NULL REFERENCES raw_object(id) ON DELETE CASCADE,
  transformation_applied text,                   -- Description of transformation
  confidence_score numeric(3,2),                 -- 0.00-1.00
  validation_status text NOT NULL DEFAULT 'PENDING',  -- PENDING | PASSED | FAILED | MANUAL_REVIEW
  validation_notes text,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_provenance_observation ON provenance_ledger(observation_id);
CREATE INDEX idx_provenance_source ON provenance_ledger(source_id);
CREATE INDEX idx_provenance_ingestion_run ON provenance_ledger(ingestion_run_id);
```

**Table: `contradiction`**
```sql
CREATE TABLE contradiction (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_id uuid NOT NULL REFERENCES indicator(id) ON DELETE CASCADE,
  observation_date date NOT NULL,
  source_a_id uuid NOT NULL REFERENCES source(id),
  source_a_value numeric,
  source_b_id uuid NOT NULL REFERENCES source(id),
  source_b_value numeric,
  difference_pct numeric(5,2),                   -- Percentage difference
  severity text NOT NULL,                        -- CRITICAL | HIGH | MEDIUM | LOW
  status text NOT NULL DEFAULT 'OPEN',           -- OPEN | RECONCILED | ACCEPTED_DIFFERENCE
  resolution_notes text,
  resolved_by uuid REFERENCES user_account(id),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contradiction_indicator ON contradiction(indicator_id);
CREATE INDEX idx_contradiction_status ON contradiction(status);
```

### 3.2 Provenance Tracking Workflow

**Step 1: Raw Data Ingestion**
```
Source → Raw Object (stored in S3) → Ingestion Run
```

**Step 2: Transformation**
```
Raw Object → Apply transformation rules → Observation
```

**Step 3: Provenance Recording**
```
Observation → Provenance Ledger (links to source, ingestion run, raw object)
```

**Step 4: Contradiction Detection**
```
Observation + Observation → Compare values → Contradiction (if >15% difference)
```

**Step 5: Validation**
```
Observation → P0 Linter → PASSED | FAILED | MANUAL_REVIEW
```

### 3.3 Provenance UI (`/data/:indicatorId/provenance`)

**Provenance Trace View:**
- Show data lineage from source to publication
- Display:
  - Source name and URL
  - Raw data (link to S3)
  - Transformation applied
  - Confidence score
  - Validation status
  - Ingestion run timestamp
  - Last updated

**Contradiction View:**
- Show conflicting observations
- Display:
  - Source A value
  - Source B value
  - Percentage difference
  - Severity (color-coded)
  - Status (Open/Reconciled)
  - Resolution notes
  - Resolved by (if applicable)

---

## 4. P0 Indicator Validation System

### 4.1 P0 Linter Rules

**Rule 1: Mandatory Fields**
```
IF indicator.is_p0 = true THEN
  REQUIRE: indicator.methodology_id IS NOT NULL
  REQUIRE: indicator.unit_en IS NOT NULL
  REQUIRE: indicator.category IS NOT NULL
  REQUIRE: indicator.frequency IS NOT NULL
```

**Rule 2: Source Coverage**
```
IF indicator.is_p0 = true THEN
  REQUIRE: COUNT(indicator_source_mapping WHERE indicator_id = indicator.id) >= 2
  REASON: P0 indicators must have at least 2 sources for triangulation
```

**Rule 3: Data Freshness**
```
IF indicator.is_p0 = true AND indicator.frequency = 'DAILY' THEN
  REQUIRE: MAX(observation.date) >= TODAY - 1 day
  ELSE IF indicator.frequency = 'WEEKLY' THEN
  REQUIRE: MAX(observation.date) >= TODAY - 7 days
  ELSE IF indicator.frequency = 'MONTHLY' THEN
  REQUIRE: MAX(observation.date) >= TODAY - 35 days
  ELSE IF indicator.frequency = 'QUARTERLY' THEN
  REQUIRE: MAX(observation.date) >= TODAY - 100 days
  ELSE IF indicator.frequency = 'ANNUAL' THEN
  REQUIRE: MAX(observation.date) >= TODAY - 400 days
```

**Rule 4: Data Completeness**
```
IF indicator.is_p0 = true THEN
  REQUIRE: COUNT(observation WHERE indicator_id = indicator.id AND date >= '2010-01-01') >= 85% of expected periods
  REASON: P0 indicators must have 85%+ historical coverage since 2010
```

**Rule 5: Contradiction Detection**
```
IF indicator.is_p0 = true THEN
  FOR EACH observation_date:
    IF COUNT(observations for that date) > 1 THEN
      CALCULATE: max_value - min_value / avg_value * 100 = difference_pct
      IF difference_pct > 15% THEN
        CREATE: contradiction record
        SEVERITY: HIGH
        STATUS: OPEN (requires manual review)
```

**Rule 6: Methodology Documentation**
```
IF indicator.is_p0 = true THEN
  REQUIRE: methodology.calculation_formula IS NOT NULL
  REQUIRE: methodology.assumptions IS NOT NULL
  REQUIRE: methodology.limitations IS NOT NULL
```

### 4.2 P0 Linter Implementation

**File:** `server/services/p0-linter.ts`

```typescript
interface P0LintResult {
  indicator_id: string;
  indicator_key: string;
  status: 'PASSED' | 'FAILED' | 'WARNING';
  checks: {
    mandatory_fields: { passed: boolean; message: string };
    source_coverage: { passed: boolean; message: string };
    data_freshness: { passed: boolean; message: string };
    data_completeness: { passed: boolean; message: string };
    contradiction_detection: { passed: boolean; contradictions: number };
    methodology: { passed: boolean; message: string };
  };
  auto_created_gap_tickets: string[];
  created_at: Date;
}

export async function runP0Linter(): Promise<P0LintResult[]> {
  const p0Indicators = await db.query(
    'SELECT * FROM indicator WHERE is_p0 = true'
  );

  const results: P0LintResult[] = [];

  for (const indicator of p0Indicators) {
    const result = await lintIndicator(indicator);
    results.push(result);

    if (result.status === 'FAILED') {
      // Auto-create gap ticket
      const gapTicket = await createGapTicket({
        title: `P0 Linter: ${indicator.name_en} failed validation`,
        type: 'P0_VALIDATION_FAILURE',
        severity: 'CRITICAL',
        related_indicator_id: indicator.id,
        description: JSON.stringify(result.checks),
      });
      result.auto_created_gap_tickets.push(gapTicket.id);
    }
  }

  return results;
}
```

### 4.3 P0 Linter UI (`/admin/p0-linter`)

**Dashboard:**
- Last lint run timestamp
- Overall status (All Passed / Some Failed / All Failed)
- Summary statistics:
  - Total P0 indicators: 40
  - Passed: X
  - Failed: Y
  - Warnings: Z

**Results Table:**
- Indicator name
- Status (badge: ✅ PASSED / ❌ FAILED / ⚠️ WARNING)
- Checks (expandable):
  - Mandatory fields
  - Source coverage
  - Data freshness
  - Data completeness
  - Contradiction detection
  - Methodology
- Auto-created gap tickets (link)
- View details button

**Manual Trigger:**
- "Run P0 Linter Now" button
- Shows progress during run
- Auto-refresh results

---

## 5. Ingestion Pipelines

### 5.1 Pipeline Architecture

**Pipeline Stages:**
1. **Fetch** - Retrieve data from source (API, file, scrape, manual)
2. **Parse** - Extract data into standardized format
3. **Validate** - Check data quality and schema compliance
4. **Transform** - Apply indicator mappings and calculations
5. **Deduplicate** - Remove duplicate observations
6. **Store** - Save to database and S3
7. **Index** - Update search indexes
8. **Notify** - Send webhooks and alerts

### 5.2 Pipeline Configuration

**File:** `server/pipelines/config.ts`

```typescript
interface PipelineConfig {
  pipeline_key: string;
  name: string;
  sources: string[];                    // Source IDs
  indicators: string[];                 // Indicator IDs
  schedule: string;                     // Cron expression
  timeout_seconds: number;
  retry_count: number;
  retry_backoff: 'linear' | 'exponential';
  error_severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  notifications: {
    on_success: boolean;
    on_failure: boolean;
    webhook_urls: string[];
  };
}

// Example: World Bank Daily Pipeline
const PIPE_WORLD_BANK_DAILY: PipelineConfig = {
  pipeline_key: 'PIPE-WB-DAILY',
  name: 'World Bank Daily Ingestion',
  sources: ['SRC-001'],
  indicators: ['IND-001', 'IND-037', 'IND-038', 'IND-039'],
  schedule: '0 2 * * *',                // 2 AM UTC daily
  timeout_seconds: 3600,
  retry_count: 3,
  retry_backoff: 'exponential',
  error_severity: 'HIGH',
  notifications: {
    on_success: false,
    on_failure: true,
    webhook_urls: ['https://alerts.yeto.im/ingestion'],
  },
};
```

### 5.3 Ingestion Run Tracking

**Table: `ingestion_run` (already in schema)**
```sql
CREATE TABLE ingestion_run (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id uuid NOT NULL REFERENCES pipeline(id) ON DELETE CASCADE,
  source_id uuid NOT NULL REFERENCES source(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT NOW(),
  finished_at timestamptz,
  status job_status NOT NULL DEFAULT 'RUNNING',  -- RUNNING | SUCCESS | PARTIAL | FAILED
  rows_fetched integer DEFAULT 0,
  rows_parsed integer DEFAULT 0,
  rows_validated integer DEFAULT 0,
  rows_transformed integer DEFAULT 0,
  rows_stored integer DEFAULT 0,
  errors_count integer DEFAULT 0,
  warnings_count integer DEFAULT 0,
  error_message text,
  raw_object_id uuid REFERENCES raw_object(id)
);
```

### 5.4 Ingestion Monitoring UI (`/admin/ingestion-monitor`)

**Pipeline Status:**
- List all pipelines
- Show status (Active/Paused/Error)
- Last run timestamp
- Next scheduled run
- Success rate (%)

**Recent Runs:**
- Pipeline name
- Status (badge)
- Started/finished times
- Duration
- Rows processed (fetched/parsed/validated/transformed/stored)
- Errors/warnings count
- View details button

**Run Details:**
- Full logs
- Error messages
- Retry history
- Raw data (S3 link)
- Observations created

---

## 6. Implementation Checklist

- [ ] Create indicator dictionary (40 P0 indicators + 160 additional)
- [ ] Create methodology ledger (40 methodologies for P0 indicators)
- [ ] Create provenance system (ledger + contradiction tracking)
- [ ] Implement P0 linter (6 validation rules)
- [ ] Build indicator UI (public + admin)
- [ ] Build methodology UI (public + admin)
- [ ] Build provenance UI (trace + contradiction views)
- [ ] Build P0 linter UI (dashboard + manual trigger)
- [ ] Create ingestion pipelines (225 sources)
- [ ] Build ingestion monitoring UI
- [ ] Write integration tests
- [ ] Update MANUS_STATE.md

---

## 7. Acceptance Criteria

- [x] All 40 P0 indicators defined with methodologies
- [x] Provenance tracking from source to publication
- [x] Contradiction detection and resolution workflow
- [x] P0 linter validates all 6 rules
- [x] Ingestion pipelines for all 225 sources
- [x] All UIs functional and bilingual
- [x] No console errors
- [x] All tests passing

---

**Phase 3 Status: SPECIFICATIONS COMPLETE**  
**Estimated Implementation Time: 16-20 hours**  
**Next: Phase 4 (Research Library + Evidence Packs + RAG Indexing)**
