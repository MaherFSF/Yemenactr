import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Get sample entities
const [entities] = await conn.query("SELECT id, name, nameAr, entityType, regimeTag, status FROM entities ORDER BY id LIMIT 15");
console.log("=== TOP 15 ENTITIES ===");
for (const e of entities) {
  console.log(`${e.id}: ${e.name} (${e.entityType}, ${e.regimeTag}, ${e.status})`);
}

// Get entity_claims structure
const [claimCols] = await conn.query("DESCRIBE entity_claims");
console.log("\n=== ENTITY_CLAIMS TABLE STRUCTURE ===");
for (const col of claimCols) {
  console.log(`${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : ''}`);
}

// Check current claims count
const [count] = await conn.query("SELECT COUNT(*) as cnt FROM entity_claims");
console.log(`\n=== CURRENT CLAIMS COUNT: ${count[0].cnt} ===`);

await conn.end();
