import mysql from 'mysql2/promise';

async function verifyDataCounts() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  const tables = [
    'time_series',
    'economic_events',
    'documents',
    'research_library',
    'indicators',
    'data_sources',
    'scheduler_jobs',
    'provenance_ledger',
    'visualization_specs',
    'report_templates',
    'sanctions_lists',
    'sanctions_entities',
    'glossary_terms',
    'timeline_events',
    'geographic_units',
    'users',
    'user_subscriptions'
  ];
  
  console.log('=== YETO Platform Database Audit ===\n');
  
  for (const table of tables) {
    try {
      const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`${table}: ${rows[0].count} records`);
    } catch (err) {
      console.log(`${table}: Table not found or error`);
    }
  }
  
  // Check time series data by source
  console.log('\n=== Time Series by Source ===');
  try {
    const [sources] = await connection.execute(`
      SELECT source_id, COUNT(*) as count 
      FROM time_series 
      GROUP BY source_id 
      ORDER BY count DESC
    `);
    for (const row of sources) {
      console.log(`  ${row.source_id}: ${row.count} data points`);
    }
  } catch (err) {
    console.log('Error fetching time series by source');
  }
  
  // Check research library by type
  console.log('\n=== Research Library by Type ===');
  try {
    const [types] = await connection.execute(`
      SELECT type, COUNT(*) as count 
      FROM research_library 
      GROUP BY type 
      ORDER BY count DESC
    `);
    for (const row of types) {
      console.log(`  ${row.type}: ${row.count} documents`);
    }
  } catch (err) {
    console.log('Error fetching research by type');
  }
  
  // Check scheduler jobs status
  console.log('\n=== Scheduler Jobs Status ===');
  try {
    const [jobs] = await connection.execute(`
      SELECT job_name, job_type, is_enabled, cron_expression 
      FROM scheduler_jobs 
      ORDER BY job_type
    `);
    for (const job of jobs) {
      const status = job.is_enabled ? '✅' : '❌';
      console.log(`  ${status} ${job.job_name} (${job.job_type}): ${job.cron_expression}`);
    }
  } catch (err) {
    console.log('Error fetching scheduler jobs');
  }
  
  await connection.end();
}

verifyDataCounts().catch(console.error);
