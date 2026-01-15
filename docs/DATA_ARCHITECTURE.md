# YETO Data & Evidence Architecture

**Generated:** January 15, 2026
**Schema Version:** 1.0
**Total Tables:** 101

## Executive Summary

The YETO platform implements an **evidence-first architecture** where every data point is traceable to its source, carries a confidence rating, and respects Yemen's split-system reality. This document details the schema design, provenance tracking, and data governance mechanisms.

## Core Design Principles

### 1. Evidence-First Design

Every data point in YETO carries mandatory provenance metadata:

| Field | Purpose | Required |
|-------|---------|----------|
| `sourceId` | Foreign key to sources table | Yes |
| `confidenceRating` | A-D quality rating | Yes |
| `regimeTag` | Geographic/political scope | Yes |
| `notes` | Additional context | No |

### 2. Split-System Enforcement

Yemen's political split (2014-present) requires careful data segregation:

```
regimeTag ENUM:
- 'aden_irg'      → Internationally Recognized Government (Aden)
- 'sanaa_defacto' → De facto authorities (Sana'a)
- 'mixed'         → Data covering both (with explicit methodology)
- 'unknown'       → Pre-split or unclear attribution
```

**Rule:** Data from different regimes is NEVER merged without explicit user consent and clear methodology documentation.

### 3. No Hallucination Policy

Missing data is explicitly marked, never fabricated:

```typescript
// ❌ WRONG: Fabricating data
value: 0 // or estimated value

// ✅ CORRECT: Explicit null with note
value: null
notes: "Data not available for this period"
```

## Schema Overview

### Layer 1: Core Data Tables

| Table | Purpose | Records | Provenance |
|-------|---------|---------|------------|
| `time_series` | Economic indicators | 1,083+ | Full |
| `geospatial_data` | Geographic indicators | 500+ | Full |
| `economic_events` | Timeline events | 100 | Full |
| `commercial_banks` | Bank profiles | 18 | Full |
| `research_publications` | Documents/reports | 353 | Full |

### Layer 2: Provenance Tables

| Table | Purpose | Records |
|-------|---------|---------|
| `sources` | Publisher/URL registry | 50+ |
| `datasets` | Dataset metadata | 30+ |
| `provenance_log` | Transformation history | 1,000+ |
| `corrections` | Error corrections | 10+ |
| `public_changelog` | Public change log | 100+ |

### Layer 3: Reference Tables

| Table | Purpose | Records |
|-------|---------|---------|
| `glossary_terms` | Bilingual definitions | 100+ |
| `stakeholders` | Organization registry | 50+ |
| `indicators` | Indicator metadata | 200+ |

## Detailed Schema

### time_series

The core table for all time-series economic data.

```sql
CREATE TABLE time_series (
  id INT AUTO_INCREMENT PRIMARY KEY,
  indicatorCode VARCHAR(100) NOT NULL,  -- e.g., "inflation_cpi_aden"
  regimeTag ENUM('aden_irg', 'sanaa_defacto', 'mixed', 'unknown') NOT NULL,
  date TIMESTAMP NOT NULL,
  value DECIMAL(20, 6) NOT NULL,
  unit VARCHAR(50) NOT NULL,            -- e.g., "YER", "percent"
  confidenceRating ENUM('A', 'B', 'C', 'D') NOT NULL,
  sourceId INT NOT NULL REFERENCES sources(id),
  datasetId INT REFERENCES datasets(id),
  notes TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
  
  INDEX indicator_idx (indicatorCode),
  INDEX regime_idx (regimeTag),
  INDEX date_idx (date),
  UNIQUE indicator_regime_date_unique (indicatorCode, regimeTag, date)
);
```

### sources

Registry of all data sources with licensing information.

```sql
CREATE TABLE sources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  publisher VARCHAR(255) NOT NULL,      -- e.g., "Central Bank of Yemen - Aden"
  url TEXT,                             -- Persistent link to source
  license VARCHAR(100),                 -- e.g., "CC-BY-4.0", "unknown"
  retrievalDate TIMESTAMP NOT NULL,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
  
  INDEX publisher_idx (publisher)
);
```

### provenance_log

Tracks all transformations applied to data.

```sql
CREATE TABLE provenance_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dataPointId INT NOT NULL,
  dataPointType VARCHAR(50) NOT NULL,   -- e.g., "time_series"
  transformationType VARCHAR(100),      -- e.g., "deflation", "currency_conversion"
  formula TEXT,                         -- e.g., "nominal / cpi_base_2015 * 100"
  performedAt TIMESTAMP DEFAULT NOW(),
  performedByUserId INT REFERENCES users(id),
  
  INDEX data_point_idx (dataPointId, dataPointType)
);
```

## Confidence Rating System

YETO uses a 4-tier confidence rating system:

| Rating | Label | Criteria |
|--------|-------|----------|
| **A** | High Confidence | Official source, recent data, verified methodology |
| **B** | Medium-High | Reputable source, some methodology gaps |
| **C** | Medium | Secondary source, older data, partial verification |
| **D** | Low Confidence | Unverified, estimated, or conflicting sources |

### Rating Assignment Rules

1. **Official government sources** → Start at A, downgrade if methodology unclear
2. **International organizations** (World Bank, IMF) → Start at A-B
3. **NGO reports** → Start at B-C depending on methodology
4. **News/media sources** → Start at C-D
5. **User submissions** → Start at D, upgrade after verification

## "What Was Known When" (Vintage System)

The platform supports temporal queries to answer: "What did we know about X at time Y?"

### Implementation

```sql
CREATE TABLE data_vintages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dataPointId INT NOT NULL,
  dataPointType VARCHAR(50) NOT NULL,
  vintageDate TIMESTAMP NOT NULL,       -- When this version was current
  value DECIMAL(20, 6) NOT NULL,
  supersededAt TIMESTAMP,               -- When replaced by newer data
  supersededBy INT,                     -- ID of replacement record
  
  INDEX vintage_idx (dataPointId, vintageDate)
);
```

### Usage

```typescript
// Get current value
const current = await getIndicator('inflation_cpi_aden', 'latest');

// Get value as known on specific date
const historical = await getIndicator('inflation_cpi_aden', '2023-06-01');
```

## Contradiction Detection

When multiple sources report conflicting values, the system:

1. **Flags the contradiction** in `contradiction_flags` table
2. **Preserves all values** with their respective sources
3. **Displays both** to users with clear labeling
4. **Never auto-resolves** without human review

```sql
CREATE TABLE contradiction_flags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  indicatorCode VARCHAR(100) NOT NULL,
  date TIMESTAMP NOT NULL,
  sourceAId INT NOT NULL REFERENCES sources(id),
  sourceBId INT NOT NULL REFERENCES sources(id),
  valueA DECIMAL(20, 6) NOT NULL,
  valueB DECIMAL(20, 6) NOT NULL,
  divergencePercent DECIMAL(10, 2),
  resolutionStatus ENUM('pending', 'resolved', 'acknowledged') DEFAULT 'pending',
  resolutionNotes TEXT,
  resolvedAt TIMESTAMP,
  resolvedByUserId INT REFERENCES users(id),
  
  INDEX indicator_date_idx (indicatorCode, date)
);
```

## Correction Workflow

When errors are identified:

1. **Log the correction** with full audit trail
2. **Update the data** with new value
3. **Preserve the old value** in correction history
4. **Notify affected users** if subscribed

```sql
CREATE TABLE corrections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dataPointId INT NOT NULL,
  dataPointType VARCHAR(50) NOT NULL,
  oldValue DECIMAL(20, 6),
  newValue DECIMAL(20, 6),
  reason TEXT NOT NULL,
  correctedAt TIMESTAMP DEFAULT NOW(),
  correctedByUserId INT REFERENCES users(id),
  notificationSent BOOLEAN DEFAULT FALSE,
  
  INDEX data_point_idx (dataPointId, dataPointType)
);
```

## Source Registry

All data sources are registered with:

| Field | Purpose |
|-------|---------|
| `publisher` | Organization name |
| `url` | Persistent link |
| `license` | Reuse terms |
| `retrievalDate` | When accessed |
| `notes` | Additional context |

### Licensing Enforcement

The platform enforces licensing restrictions:

| License | Display | Download | API | Commercial |
|---------|---------|----------|-----|------------|
| CC-BY-4.0 | ✅ | ✅ | ✅ | ✅ |
| CC-BY-NC | ✅ | ✅ | ✅ | ❌ |
| Restricted | ✅ | ❌ | ❌ | ❌ |
| Unknown | ✅ | ⚠️ | ⚠️ | ❌ |

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     DATA INGESTION LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│  API Connectors  │  Web Scrapers  │  Manual Upload  │  Partner  │
│  (World Bank,    │  (CBY, MOPIC)  │  (Admin Portal) │  Portal   │
│   IMF, OCHA)     │                │                 │           │
└────────┬─────────┴───────┬────────┴────────┬────────┴─────┬─────┘
         │                 │                 │              │
         ▼                 ▼                 ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     VALIDATION LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  • Schema validation     • Duplicate detection                  │
│  • Confidence assignment • Contradiction check                  │
│  • Source verification   • Regime tag assignment                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     STORAGE LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL/MySQL         │  S3 Object Storage                  │
│  • time_series            │  • PDF documents                    │
│  • sources                │  • Images                           │
│  • provenance_log         │  • Raw data files                   │
│  • corrections            │  • Report exports                   │
└────────────────────────────┴────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DELIVERY LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  tRPC API  │  Dashboard UI  │  Report Generator  │  AI Assistant│
└────────────┴────────────────┴───────────────────┴───────────────┘
```

## Compliance with Requirements

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| R1: Source every claim | `sourceId` FK on all data | ✅ |
| R2: Confidence ratings | `confidenceRating` ENUM | ✅ |
| R3: Split-system | `regimeTag` ENUM | ✅ |
| R9: Correction workflow | `corrections` table | ✅ |
| Evidence store | S3 + PostgreSQL | ✅ |
| Vintage system | `data_vintages` table | ✅ |
| Contradiction detection | `contradiction_flags` table | ✅ |
| Licensing enforcement | `license` field + access control | ✅ |

## Conclusion

The YETO data architecture ensures:

1. **Complete traceability** - Every data point links to its source
2. **Quality transparency** - Confidence ratings visible to users
3. **Political neutrality** - Split-system data never merged without consent
4. **Error accountability** - Full correction history maintained
5. **Temporal accuracy** - "What was known when" queries supported
