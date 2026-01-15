import mysql from 'mysql2/promise';

async function checkCounts() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL!);
  const tables = ['time_series', 'organizations', 'commercial_entities', 'economic_events', 'research_publications', 'indicators', 'glossary_terms'];
  
  console.log('📊 Database Record Counts:');
  console.log('========================');
  
  for (const t of tables) {
    const [rows] = await conn.execute(`SELECT COUNT(*) as cnt FROM ${t}`);
    console.log(`${t}: ${(rows as any)[0].cnt}`);
  }
  
  // Check exchange rate data specifically
  console.log('\n📈 Exchange Rate Data:');
  const [fxData] = await conn.execute(`
    SELECT indicatorCode, COUNT(*) as cnt, MIN(date) as earliest, MAX(date) as latest 
    FROM time_series 
    WHERE indicatorCode LIKE 'fx_rate%' 
    GROUP BY indicatorCode
  `);
  for (const row of fxData as any[]) {
    console.log(`${row.indicatorCode}: ${row.cnt} records (${row.earliest} to ${row.latest})`);
  }
  
  await conn.end();
}

checkCounts().catch(console.error);
