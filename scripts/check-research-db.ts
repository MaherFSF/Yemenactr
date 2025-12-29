import { getDb } from '../server/db';
import { researchPublications, researchOrganizations } from '../drizzle/schema';
import { sql } from 'drizzle-orm';

async function main() {
  const db = await getDb();
  if (!db) {
    console.error('Failed to connect to database');
    return;
  }
  
  // Get count by organization
  const pubs = await db.select({
    orgId: researchPublications.organizationId,
    count: sql<number>`count(*)`
  })
  .from(researchPublications)
  .groupBy(researchPublications.organizationId);
  
  console.log('Publications by Organization ID:');
  for (const p of pubs) {
    console.log(`  Org ${p.orgId}: ${p.count} publications`);
  }
  
  // Get organizations
  const orgs = await db.select().from(researchOrganizations);
  console.log('\nOrganizations:');
  for (const o of orgs) {
    console.log(`  ${o.id}: ${o.name} (${o.type})`);
  }
  
  // Get total count
  const total = await db.select({ count: sql<number>`count(*)` }).from(researchPublications);
  console.log(`\nTotal publications: ${total[0].count}`);
  
  // Get by year
  const byYear = await db.select({
    year: researchPublications.publicationYear,
    count: sql<number>`count(*)`
  })
  .from(researchPublications)
  .groupBy(researchPublications.publicationYear)
  .orderBy(researchPublications.publicationYear);
  
  console.log('\nPublications by Year:');
  for (const y of byYear) {
    console.log(`  ${y.year}: ${y.count}`);
  }
  
  // Get by category
  const byCat = await db.select({
    cat: researchPublications.researchCategory,
    count: sql<number>`count(*)`
  })
  .from(researchPublications)
  .groupBy(researchPublications.researchCategory);
  
  console.log('\nPublications by Category:');
  for (const c of byCat) {
    console.log(`  ${c.cat}: ${c.count}`);
  }
}

main().catch(console.error);
