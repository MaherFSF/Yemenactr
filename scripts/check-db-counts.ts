import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function checkCounts() {
  const tables = [
    "sources", "indicators", "time_series", "economic_events", 
    "sector_definitions", "datasets", "documents", "entities"
  ];
  
  console.log("📊 Database Record Counts:\n");
  
  for (const table of tables) {
    try {
      const result = await db.execute(sql.raw(`SELECT COUNT(*) as count FROM ${table}`));
      const count = (result as any)[0][0].count;
      console.log(`   ${table}: ${count} records`);
    } catch (e: any) {
      console.log(`   ${table}: error - ${e.message}`);
    }
  }
}

checkCounts().then(() => process.exit(0));
