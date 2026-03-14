import { db } from '../db';
import { sql } from 'drizzle-orm';

async function main() {
  const r = (q: any) => (q as unknown as any[])[0] || q;
  const ts = r(await db.execute(sql`SELECT COUNT(*) as c FROM time_series`));
  const ind = r(await db.execute(sql`SELECT COUNT(*) as c FROM indicators`));
  const src = r(await db.execute(sql`SELECT COUNT(*) as c FROM source_registry`));
  const pub = r(await db.execute(sql`SELECT COUNT(*) as c FROM research_publications`));
  const yrs = r(await db.execute(sql`SELECT MIN(date) as min_d, MAX(date) as max_d FROM time_series`));
  console.log('Time series:', ts);
  console.log('Indicators:', ind);
  console.log('Sources:', src);
  console.log('Publications:', pub);
  console.log('Date range:', yrs);
  process.exit(0);
}
main();
