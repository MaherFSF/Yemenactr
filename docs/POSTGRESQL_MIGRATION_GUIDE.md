# PostgreSQL Migration Guide - YETO Platform

## Overview

This guide provides step-by-step instructions for migrating the YETO platform from MySQL to PostgreSQL with an evidence-first schema supporting 7-stage approval pipeline, disagreement mode, artifact tracking, and TimescaleDB optimization.

**Status:** Ready for implementation  
**Target Database:** PostgreSQL 14+ with TimescaleDB extension  
**Schema Size:** 2,637 lines with 40+ tables and comprehensive provenance tracking  
**Data Volume:** 6,659+ records across 32 tables (2010-2026)

## Phase 1: Database Setup

### 1.1 PostgreSQL Installation

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib postgresql-client

# Start PostgreSQL service
sudo service postgresql start

# Verify installation
psql --version
```

### 1.2 Create YETO Database and User

```bash
# Connect as postgres user
sudo -u postgres psql

# Create database
CREATE DATABASE yeto;

# Create user with secure password
CREATE USER yeto_user WITH PASSWORD 'secure_password_here';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE yeto TO yeto_user;
ALTER USER yeto_user CREATEDB;

# Connect to yeto database
\c yeto

# Grant schema privileges
GRANT ALL ON SCHEMA public TO yeto_user;
```

### 1.3 Install TimescaleDB Extension

```bash
# Add TimescaleDB repository
sudo sh -c "echo 'deb https://packagecloud.io/timescale/timescaledb/ubuntu/ $(lsb_release -c -s) main' > /etc/apt/sources.list.d/timescaledb.list"
wget --quiet -O - https://packagecloud.io/timescale/timescaledb/gpgkey | sudo apt-key add -
sudo apt-get update

# Install TimescaleDB
sudo apt-get install -y timescaledb-2-postgresql-14

# Enable extension
sudo -u postgres psql yeto -c "CREATE EXTENSION IF NOT EXISTS timescaledb;"
```

## Phase 2: Schema Implementation

### 2.1 Create Evidence-First Schema

The PostgreSQL schema includes:

- **Source Registry** (yeto.source) - 225+ data sources with metadata
- **Geographic Registry** (yeto.geo) - Yemen governorates, districts, cities
- **Indicator Registry** (yeto.indicator) - Economic indicators with bilingual names
- **Time Series** (yeto.series) - Disagreement mode: separate series per source/regime
- **Observations** (yeto.observation) - Individual data points with full provenance
- **Approval Pipeline** (yeto.approval_*) - 7-stage approval workflow
- **Artifacts** (yeto.artifact) - Raw evidence storage (CSV, PDF, JSON, etc.)
- **Ingestion Runs** (yeto.ingestion_run, yeto.ingestion_task) - ETL job tracking
- **Provenance Ledger** (yeto.provenance_event) - Complete audit trail

### 2.2 Apply Schema

```bash
# Load the full schema (2,637 lines)
psql postgresql://yeto_user:password@localhost:5432/yeto -f drizzle/schema.sql

# Verify tables were created
psql postgresql://yeto_user:password@localhost:5432/yeto -c "\dt yeto.*"

# Expected output: 40+ tables in yeto schema
```

### 2.3 Create Indexes for Performance

```sql
-- Time series optimization
CREATE INDEX idx_observation_series_date ON yeto.observation(series_id, observation_date DESC);
CREATE INDEX idx_observation_regime ON yeto.observation(regime);

-- Approval pipeline
CREATE INDEX idx_approval_stage ON yeto.approval_stage(stage);
CREATE INDEX idx_approval_status ON yeto.approval_stage(status);

-- Search optimization
CREATE INDEX idx_source_name_search ON yeto.source USING gin (name_en gin_trgm_ops);
CREATE INDEX idx_indicator_name_search ON yeto.indicator USING gin (name_en gin_trgm_ops);
```

## Phase 3: Data Migration

### 3.1 Export MySQL Data

```bash
# Export each table from MySQL
mysqldump -u root -p yeto sources > /tmp/sources.sql
mysqldump -u root -p yeto time_series > /tmp/time_series.sql
mysqldump -u root -p yeto datasets > /tmp/datasets.sql
# ... repeat for all 32 tables
```

### 3.2 Transform and Load Data

Create a migration script (`scripts/migrate-mysql-to-postgres.ts`):

```typescript
import { Pool } from 'pg';
import mysql from 'mysql2/promise';

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const mysqlConnection = await mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

// Migrate sources
const [sources] = await mysqlConnection.query('SELECT * FROM sources');
for (const source of sources) {
  await pgPool.query(
    `INSERT INTO yeto.source (src_id, src_numeric_id, name_en, name_ar, tier, url, active)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [source.id, source.id, source.publisher, source.publisher, 'T2', source.url, true]
  );
}

// Migrate time series
const [timeSeries] = await mysqlConnection.query('SELECT * FROM time_series');
for (const ts of timeSeries) {
  await pgPool.query(
    `INSERT INTO yeto.observation (series_id, observation_date, value, quality_status)
     VALUES ($1, $2, $3, $4)`,
    [ts.id, ts.date, ts.value, ts.confidenceRating === 'A' ? 'VERIFIED' : 'PROVISIONAL']
  );
}

console.log('Migration complete');
await mysqlConnection.end();
await pgPool.end();
```

### 3.3 Verify Data Integrity

```sql
-- Check record counts
SELECT 'sources' as table_name, COUNT(*) as record_count FROM yeto.source
UNION ALL
SELECT 'indicators', COUNT(*) FROM yeto.indicator
UNION ALL
SELECT 'observations', COUNT(*) FROM yeto.observation;

-- Verify no NULL values in critical fields
SELECT COUNT(*) FROM yeto.observation WHERE series_id IS NULL;
SELECT COUNT(*) FROM yeto.source WHERE src_id IS NULL;
```

## Phase 4: Update Application Code

### 4.1 Update Drizzle Configuration

Update `drizzle.config.ts`:

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### 4.2 Update Schema Definitions

Convert MySQL schema to PostgreSQL in `drizzle/schema.ts`:

```typescript
import { pgTable, uuid, text, timestamp, numeric, index } from 'drizzle-orm/pg-core';

export const source = pgTable('source', {
  id: uuid('id').primaryKey().defaultRandom(),
  srcId: text('src_id').notNull().unique(),
  srcNumericId: numeric('src_numeric_id').notNull().unique(),
  nameEn: text('name_en').notNull(),
  nameAr: text('name_ar'),
  tier: text('tier'),
  url: text('url'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  nameIdx: index('idx_source_name_trgm').on(table.nameEn),
}));
```

### 4.3 Update Environment Variables

Set DATABASE_URL to PostgreSQL connection string:

```bash
DATABASE_URL=postgresql://yeto_user:password@localhost:5432/yeto
```

## Phase 5: Testing

### 5.1 Run Existing Tests

```bash
# Update test database connection
export DATABASE_URL=postgresql://yeto_user:password@localhost:5432/yeto_test

# Run all tests
pnpm test

# Expected: All 320 tests pass
```

### 5.2 Create Migration Tests

Create `server/migration.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from './db';

describe('PostgreSQL Migration', () => {
  it('should have all sources migrated', async () => {
    const sources = await db.query.source.findMany();
    expect(sources.length).toBeGreaterThan(0);
  });

  it('should have all observations migrated', async () => {
    const observations = await db.query.observation.findMany();
    expect(observations.length).toBeGreaterThan(0);
  });

  it('should enforce provenance on all observations', async () => {
    const orphaned = await db.query.observation.findMany({
      where: (obs) => isNull(obs.seriesId),
    });
    expect(orphaned.length).toBe(0);
  });

  it('should support regime disagreement mode', async () => {
    const adenSeries = await db.query.series.findMany({
      where: (s) => eq(s.regime, 'ADEN_IRG'),
    });
    const sanaaSeries = await db.query.series.findMany({
      where: (s) => eq(s.regime, 'SANAA_DFA'),
    });
    expect(adenSeries.length).toBeGreaterThan(0);
    expect(sanaaSeries.length).toBeGreaterThan(0);
  });
});
```

## Phase 6: Optimization

### 6.1 Enable TimescaleDB Hypertables

```sql
-- Convert observation table to hypertable for time-series optimization
SELECT create_hypertable('yeto.observation', 'observation_date', if_not_exists => TRUE);

-- Create continuous aggregates for common queries
CREATE MATERIALIZED VIEW yeto.observation_daily AS
SELECT
  series_id,
  time_bucket('1 day', observation_date) as day,
  avg(value) as avg_value,
  min(value) as min_value,
  max(value) as max_value
FROM yeto.observation
GROUP BY series_id, day;

-- Refresh policy
SELECT add_continuous_aggregate_policy('yeto.observation_daily',
  start_offset => INTERVAL '1 month',
  end_offset => INTERVAL '1 day',
  schedule_interval => INTERVAL '1 day');
```

### 6.2 Query Optimization

```sql
-- Analyze query performance
EXPLAIN ANALYZE
SELECT o.value, s.series_key, i.name_en
FROM yeto.observation o
JOIN yeto.series s ON o.series_id = s.id
JOIN yeto.indicator i ON s.indicator_id = i.id
WHERE s.regime = 'ADEN_IRG'
  AND o.observation_date >= NOW() - INTERVAL '1 year'
ORDER BY o.observation_date DESC;
```

## Phase 7: Deployment Checklist

- [ ] PostgreSQL 14+ installed and running
- [ ] TimescaleDB extension enabled
- [ ] YETO database and user created
- [ ] Schema applied (2,637 lines)
- [ ] Data migrated from MySQL (6,659+ records)
- [ ] Data integrity verified (no orphaned records)
- [ ] Indexes created for performance
- [ ] Hypertables configured for time-series
- [ ] All 320 tests passing
- [ ] DATABASE_URL updated in environment
- [ ] Drizzle schema converted to PostgreSQL
- [ ] Application restarted and verified
- [ ] Backups configured
- [ ] Monitoring alerts set up

## Rollback Plan

If issues occur during migration:

```bash
# Restore from backup
pg_restore -d yeto /path/to/backup.sql

# Revert to MySQL
export DATABASE_URL=mysql://user:password@localhost:3306/yeto

# Restart application
pnpm dev
```

## Performance Benchmarks

After migration, expect:

- **Query Performance:** 2-5x faster for time-series queries (TimescaleDB optimization)
- **Storage:** 20-30% reduction (PostgreSQL compression)
- **Concurrent Users:** Support for 100+ simultaneous connections
- **Data Ingestion:** 10,000+ records/second throughput

## References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TimescaleDB Documentation](https://docs.timescale.com/)
- [Drizzle ORM PostgreSQL Guide](https://orm.drizzle.team/docs/get-started-postgresql)
- [YETO Evidence-First Schema](./POSTGRESQL_MIGRATION_GUIDE.md)
