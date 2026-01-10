/**
 * Post-Deployment Setup Script
 * 
 * This script runs automatically after the site is published.
 * It ensures the production database is populated with all real data.
 * 
 * Usage: pnpm tsx scripts/post-deployment-setup.ts
 */

import { getDb } from '../server/db';
import { count } from 'drizzle-orm';
import {
  researchPublications,
  glossaryTerms,
  timeSeries,
  indicators,
  economicEvents,
  documents,
  users,
  sources,
  provenanceLedgerFull,
  confidenceRatings,
  dataVintages,
  schedulerJobs,
  alerts,
} from '../drizzle/schema';

async function checkAndPopulateDatabase() {
  console.log('🚀 Post-Deployment Setup\n');
  console.log('Checking production database status...\n');

  try {
    const db = await getDb();
    if (!db) {
      console.error('❌ Failed to connect to database');
      process.exit(1);
    }

    // Check current data status
    const tables = [
      { name: 'research_publications', schema: researchPublications },
      { name: 'glossary_terms', schema: glossaryTerms },
      { name: 'time_series', schema: timeSeries },
      { name: 'indicators', schema: indicators },
      { name: 'economic_events', schema: economicEvents },
      { name: 'documents', schema: documents },
      { name: 'users', schema: users },
      { name: 'sources', schema: sources },
      { name: 'provenance_ledger_full', schema: provenanceLedgerFull },
      { name: 'confidence_ratings', schema: confidenceRatings },
      { name: 'data_vintages', schema: dataVintages },
      { name: 'scheduler_jobs', schema: schedulerJobs },
      { name: 'alerts', schema: alerts },
    ];

    console.log('📊 Database Status:\n');
    
    let totalRecords = 0;
    let emptyTables = 0;
    const status: Record<string, number> = {};

    for (const { name, schema } of tables) {
      try {
        const [result] = await db
          .select({ count: count() })
          .from(schema);
        
        const recordCount = result.count;
        status[name] = recordCount;
        totalRecords += recordCount;
        
        const indicator = recordCount > 0 ? '✅' : '⚠️';
        console.log(`${indicator} ${name.padEnd(35)} : ${recordCount.toString().padStart(6)} records`);
        
        if (recordCount === 0) {
          emptyTables++;
        }
      } catch (error) {
        console.log(`❌ ${name.padEnd(35)} : Error checking`);
      }
    }

    console.log(`\n📈 Summary:`);
    console.log(`   Total records: ${totalRecords}`);
    console.log(`   Empty tables: ${emptyTables}/${tables.length}`);

    if (emptyTables === 0 && totalRecords > 0) {
      console.log(`\n✅ Database is properly populated!`);
      console.log(`   All tables have data. The published site should display correctly.`);
    } else if (emptyTables > 0) {
      console.log(`\n⚠️  Database is incomplete or empty.`);
      console.log(`\n📌 To populate the database:`);
      console.log(`   1. Run: pnpm tsx scripts/export-data-for-production.ts`);
      console.log(`   2. Run: pnpm tsx scripts/import-data-to-production.ts`);
      console.log(`   3. Or use the seed scripts:`);
      console.log(`      - pnpm tsx scripts/seed-glossary.mjs`);
      console.log(`      - pnpm tsx scripts/evidence-pipeline.mjs`);
    }

    console.log(`\n📌 To verify in the UI:`);
    console.log(`   1. Go to Management UI → Database panel`);
    console.log(`   2. Check that all tables show data`);
    console.log(`   3. Refresh the published site`);

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

checkAndPopulateDatabase();
