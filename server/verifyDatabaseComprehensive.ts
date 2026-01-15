/**
 * Comprehensive Database Verification Script
 * Verifies all tables are populated per Phase 2 requirements
 */

import { getDb } from './db';
import { sql } from 'drizzle-orm';

interface TableStatus {
  name: string;
  count: number;
  status: 'populated' | 'empty' | 'critical_empty';
  required: boolean;
}

// Core tables that MUST be populated (from Phase 2 requirements)
const REQUIRED_TABLES = [
  'sources',
  'datasets',
  'documents',
  'indicators',
  'time_series',
  'entities',
  'economic_events',
  'glossary_terms',
  'research_publications',
  'users',
  'commercial_banks',
  'geospatial_data',
  'scheduler_jobs',
];

async function verifyDatabase() {
  console.log('='.repeat(80));
  console.log('YETO Platform - Comprehensive Database Verification');
  console.log('='.repeat(80));
  console.log('');

  const db = await getDb();
  if (!db) {
    console.error('ERROR: Could not connect to database');
    process.exit(1);
  }

  // Get all tables and their counts
  const [tables] = await db.execute(sql`
    SELECT 
      table_name,
      table_rows as estimated_rows
    FROM information_schema.tables 
    WHERE table_schema = DATABASE()
    ORDER BY table_rows DESC
  `) as any;

  const tableStatuses: TableStatus[] = [];
  let totalRecords = 0;
  let emptyTables = 0;
  let criticalEmpty = 0;

  console.log('TABLE STATUS REPORT');
  console.log('-'.repeat(80));
  console.log('Table Name'.padEnd(45) + 'Records'.padStart(12) + 'Status'.padStart(15) + 'Required'.padStart(10));
  console.log('-'.repeat(80));

  for (const table of tables) {
    const name = table.table_name;
    const count = parseInt(table.estimated_rows) || 0;
    const required = REQUIRED_TABLES.includes(name);
    
    let status: 'populated' | 'empty' | 'critical_empty' = 'populated';
    if (count === 0) {
      status = required ? 'critical_empty' : 'empty';
      emptyTables++;
      if (required) criticalEmpty++;
    }
    
    totalRecords += count;
    tableStatuses.push({ name, count, status, required });
    
    const statusIcon = status === 'populated' ? '✓' : status === 'critical_empty' ? '✗' : '○';
    const statusText = status === 'populated' ? 'OK' : status === 'critical_empty' ? 'CRITICAL' : 'Empty';
    const requiredText = required ? 'Yes' : 'No';
    
    console.log(
      name.padEnd(45) + 
      count.toString().padStart(12) + 
      `${statusIcon} ${statusText}`.padStart(15) +
      requiredText.padStart(10)
    );
  }

  console.log('-'.repeat(80));
  console.log('');
  console.log('SUMMARY');
  console.log('-'.repeat(80));
  console.log(`Total Tables: ${tables.length}`);
  console.log(`Total Records: ${totalRecords.toLocaleString()}`);
  console.log(`Populated Tables: ${tables.length - emptyTables}`);
  console.log(`Empty Tables: ${emptyTables}`);
  console.log(`Critical Empty (Required): ${criticalEmpty}`);
  console.log('');

  // Check specific data requirements
  console.log('DATA REQUIREMENTS CHECK');
  console.log('-'.repeat(80));

  // Check sources
  const [sourcesResult] = await db.execute(sql`SELECT COUNT(*) as count FROM sources`) as any;
  const sourcesCount = sourcesResult[0]?.count || 0;
  console.log(`Sources Registry: ${sourcesCount} sources ${sourcesCount >= 20 ? '✓' : '⚠ (need 20+)'}`);

  // Check time series
  const [timeSeriesResult] = await db.execute(sql`SELECT COUNT(*) as count FROM time_series`) as any;
  const timeSeriesCount = timeSeriesResult[0]?.count || 0;
  console.log(`Time Series Data: ${timeSeriesCount} records ${timeSeriesCount >= 1000 ? '✓' : '⚠ (need 1000+)'}`);

  // Check indicators
  const [indicatorsResult] = await db.execute(sql`SELECT COUNT(*) as count FROM indicators`) as any;
  const indicatorsCount = indicatorsResult[0]?.count || 0;
  console.log(`Indicators: ${indicatorsCount} indicators ${indicatorsCount >= 20 ? '✓' : '⚠ (need 20+)'}`);

  // Check publications
  const [pubsResult] = await db.execute(sql`SELECT COUNT(*) as count FROM research_publications`) as any;
  const pubsCount = pubsResult[0]?.count || 0;
  console.log(`Publications: ${pubsCount} publications ${pubsCount >= 100 ? '✓' : '⚠ (need 100+)'}`);

  // Check events
  const [eventsResult] = await db.execute(sql`SELECT COUNT(*) as count FROM economic_events`) as any;
  const eventsCount = eventsResult[0]?.count || 0;
  console.log(`Economic Events: ${eventsCount} events ${eventsCount >= 50 ? '✓' : '⚠ (need 50+)'}`);

  // Check glossary
  const [glossaryResult] = await db.execute(sql`SELECT COUNT(*) as count FROM glossary_terms`) as any;
  const glossaryCount = glossaryResult[0]?.count || 0;
  console.log(`Glossary Terms: ${glossaryCount} terms ${glossaryCount >= 30 ? '✓' : '⚠ (need 30+)'}`);

  // Check commercial banks
  const [banksResult] = await db.execute(sql`SELECT COUNT(*) as count FROM commercial_banks`) as any;
  const banksCount = banksResult[0]?.count || 0;
  console.log(`Commercial Banks: ${banksCount} banks ${banksCount >= 10 ? '✓' : '⚠ (need 10+)'}`);

  // Check entities
  const [entitiesResult] = await db.execute(sql`SELECT COUNT(*) as count FROM entities`) as any;
  const entitiesCount = entitiesResult[0]?.count || 0;
  console.log(`Entities: ${entitiesCount} entities ${entitiesCount >= 20 ? '✓' : '⚠ (need 20+)'}`);

  // Check geospatial
  const [geoResult] = await db.execute(sql`SELECT COUNT(*) as count FROM geospatial_data`) as any;
  const geoCount = geoResult[0]?.count || 0;
  console.log(`Geospatial Data: ${geoCount} records ${geoCount >= 100 ? '✓' : '⚠ (need 100+)'}`);

  console.log('');
  console.log('REGIME TAG COVERAGE');
  console.log('-'.repeat(80));

  // Check regime tag distribution
  const [regimeResult] = await db.execute(sql`
    SELECT regimeTag, COUNT(*) as count 
    FROM time_series 
    GROUP BY regimeTag
  `) as any;
  
  for (const row of regimeResult) {
    console.log(`  ${row.regimeTag}: ${row.count} records`);
  }

  console.log('');
  console.log('TIME COVERAGE');
  console.log('-'.repeat(80));

  // Check time coverage
  const [timeRangeResult] = await db.execute(sql`
    SELECT 
      MIN(date) as earliest,
      MAX(date) as latest,
      COUNT(DISTINCT YEAR(date)) as years_covered
    FROM time_series
  `) as any;
  
  if (timeRangeResult[0]) {
    console.log(`  Earliest: ${timeRangeResult[0].earliest}`);
    console.log(`  Latest: ${timeRangeResult[0].latest}`);
    console.log(`  Years Covered: ${timeRangeResult[0].years_covered}`);
  }

  console.log('');
  console.log('='.repeat(80));
  console.log('Verification Complete');
  console.log('='.repeat(80));

  process.exit(criticalEmpty > 0 ? 1 : 0);
}

verifyDatabase().catch(console.error);
