import { getDb } from '../db.js';
import { indicators } from '../../drizzle/schema.js';

async function main() {
  const db = await getDb();
  if (!db) { console.log("No DB"); process.exit(1); }
  const rows = await db.select({ sector: indicators.sector, code: indicators.code, name: indicators.nameEn }).from(indicators).orderBy(indicators.sector);
  const bySector: Record<string, string[]> = {};
  for (const r of rows) {
    if (!bySector[r.sector]) bySector[r.sector] = [];
    bySector[r.sector].push(`${r.code} (${r.name})`);
  }
  for (const [sector, codes] of Object.entries(bySector)) {
    console.log(`${sector}: ${codes.length} indicators`);
    codes.slice(0, 5).forEach(c => console.log(`  ${c}`));
    if (codes.length > 5) console.log(`  ... and ${codes.length - 5} more`);
  }
  process.exit(0);
}
main();
