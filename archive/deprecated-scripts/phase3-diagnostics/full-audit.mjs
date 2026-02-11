import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;
const connection = await mysql.createConnection(DATABASE_URL);

// Get all table counts
const tables = [
  'sources', 'indicators', 'time_series', 'economic_events', 
  'sector_definitions', 'datasets', 'documents', 'entities',
  'users', 'research_publications', 'commercial_banks', 'fx_rates',
  'provenance_records', 'data_gap_tickets', 'ingestion_runs',
  'sector_kpis', 'sector_alerts', 'sector_agent_configs'
];

console.log('=== DATABASE AUDIT ===');
for (const table of tables) {
  try {
    const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
    console.log(`${table}: ${rows[0].count} records`);
  } catch (e) {
    console.log(`${table}: TABLE NOT FOUND`);
  }
}

// Get sector codes from indicators
console.log('\n=== SECTOR CODES IN INDICATORS ===');
const [sectors] = await connection.query(`SELECT DISTINCT sector_code, COUNT(*) as count FROM indicators GROUP BY sector_code`);
sectors.forEach(s => console.log(`${s.sector_code}: ${s.count} indicators`));

// Get source types
console.log('\n=== SOURCE TYPES ===');
const [sourceTypes] = await connection.query(`SELECT DISTINCT source_type, COUNT(*) as count FROM sources GROUP BY source_type`);
sourceTypes.forEach(s => console.log(`${s.source_type}: ${s.count} sources`));

// Get time series date range
console.log('\n=== TIME SERIES DATE RANGE ===');
const [dateRange] = await connection.query(`SELECT MIN(date) as min_date, MAX(date) as max_date FROM time_series`);
console.log(`Date range: ${dateRange[0].min_date} to ${dateRange[0].max_date}`);

await connection.end();
