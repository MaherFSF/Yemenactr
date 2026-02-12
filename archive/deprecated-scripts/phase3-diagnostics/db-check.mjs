import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Check missing tables
console.log("=== MISSING TABLES CHECK ===");
const [t1] = await conn.query("SHOW TABLES LIKE 'indicator_values'");
console.log("indicator_values:", t1.length > 0 ? "EXISTS" : "DOES NOT EXIST");
const [t2] = await conn.query("SHOW TABLES LIKE 'timeline_events'");
console.log("timeline_events:", t2.length > 0 ? "EXISTS" : "DOES NOT EXIST");

// Row counts
console.log("\n=== ROW COUNTS ===");
const tables = ['entities', 'source_registry', 'sector_codebook', 'entity_claims', 'library_documents', 'gap_tickets', 'raw_objects'];
for (const t of tables) {
  try {
    const [r] = await conn.query(`SELECT COUNT(*) as cnt FROM ${t}`);
    console.log(`${t}: ${r[0].cnt} rows`);
  } catch (e) {
    console.log(`${t}: TABLE NOT FOUND`);
  }
}
await conn.end();
