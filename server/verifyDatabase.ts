/**
 * Database Verification Script
 * Checks all tables are properly populated
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { sql } from "drizzle-orm";

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }
  
  const connection = await mysql.createConnection(dbUrl);
  const db = drizzle(connection);
  
  const tables = [
    'time_series', 
    'research_publications', 
    'economic_events', 
    'indicators',
    'glossary_terms', 
    'sources', 
    'organizations', 
    'commercial_banks',
    'users', 
    'stakeholders', 
    'data_gap_tickets', 
    'scheduler_jobs',
    'datasets',
    'provenance_log',
    'geospatial_data',
  ];
  
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║           YETO DATABASE VERIFICATION REPORT                  ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  
  let totalRecords = 0;
  
  for (const table of tables) {
    try {
      const [rows] = await connection.execute(`SELECT COUNT(*) as cnt FROM ${table}`);
      const count = (rows as any)[0].cnt;
      totalRecords += count;
      const status = count > 0 ? '✓' : '⚠';
      console.log(`║ ${status} ${table.padEnd(30)} ${String(count).padStart(10)} records ║`);
    } catch (e) {
      console.log(`║ ✗ ${table.padEnd(30)} ${'ERROR'.padStart(10)}        ║`);
    }
  }
  
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║   TOTAL RECORDS: ${String(totalRecords).padStart(10)}                              ║`);
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  // Check time series date range
  console.log('\n=== TIME SERIES DATE RANGE ===');
  const [dateRange] = await connection.execute(`
    SELECT MIN(date) as min_date, MAX(date) as max_date, COUNT(DISTINCT indicatorCode) as indicators
    FROM time_series
  `);
  const range = (dateRange as any)[0];
  console.log(`Date Range: ${range.min_date} to ${range.max_date}`);
  console.log(`Unique Indicators: ${range.indicators}`);
  
  // Check research publications by year
  console.log('\n=== RESEARCH PUBLICATIONS BY YEAR ===');
  const [pubsByYear] = await connection.execute(`
    SELECT YEAR(publishedDate) as year, COUNT(*) as count 
    FROM research_publications 
    GROUP BY YEAR(publishedDate) 
    ORDER BY year DESC 
    LIMIT 10
  `);
  for (const row of pubsByYear as any[]) {
    console.log(`${row.year}: ${row.count} publications`);
  }
  
  // Check economic events by year
  console.log('\n=== ECONOMIC EVENTS BY YEAR ===');
  const [eventsByYear] = await connection.execute(`
    SELECT YEAR(date) as year, COUNT(*) as count 
    FROM economic_events 
    GROUP BY YEAR(date) 
    ORDER BY year DESC 
    LIMIT 10
  `);
  for (const row of eventsByYear as any[]) {
    console.log(`${row.year}: ${row.count} events`);
  }
  
  await connection.end();
  console.log('\n✓ Database verification complete');
}

main().catch(console.error);
