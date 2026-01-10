/**
 * Data Import Script for Production Database
 * 
 * This script imports exported data into the production database.
 * It should be run after deployment to populate the production database.
 * 
 * Usage: pnpm tsx scripts/import-data-to-production.ts
 */

import { getDb } from '../server/db';
import fs from 'fs';
import path from 'path';
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
  researchOrganizations,
  researchAuthors,
  publicationAuthors,
} from '../drizzle/schema';

const TABLE_SCHEMAS: Record<string, any> = {
  research_publications: researchPublications,
  glossary_terms: glossaryTerms,
  time_series: timeSeries,
  indicators: indicators,
  economic_events: economicEvents,
  documents: documents,
  users: users,
  sources: sources,
  provenance_ledger_full: provenanceLedgerFull,
  confidence_ratings: confidenceRatings,
  data_vintages: dataVintages,
  scheduler_jobs: schedulerJobs,
  alerts: alerts,
  research_organizations: researchOrganizations,
  research_authors: researchAuthors,
  publication_authors: publicationAuthors,
};

async function importData() {
  console.log('🚀 Starting data import to production database...\n');

  try {
    const db = await getDb();
    if (!db) {
      console.error('❌ Failed to connect to database');
      process.exit(1);
    }

    // Try to read export file
    const exportPath = path.join(process.cwd(), 'data-export.json');
    
    if (!fs.existsSync(exportPath)) {
      console.error(`❌ Export file not found: ${exportPath}`);
      console.log(`\n📌 Please run: pnpm tsx scripts/export-data-for-production.ts`);
      process.exit(1);
    }

    const exportedData = JSON.parse(fs.readFileSync(exportPath, 'utf-8'));
    console.log('📖 Export file loaded\n');

    let totalImported = 0;

    // Import data for each table
    for (const [tableName, records] of Object.entries(exportedData)) {
      if (!Array.isArray(records) || records.length === 0) {
        console.log(`⏭️  Skipping ${tableName} (no data)`);
        continue;
      }

      const schema = TABLE_SCHEMAS[tableName];
      if (!schema) {
        console.log(`⚠️  Skipping ${tableName} (schema not found)`);
        continue;
      }

      try {
        console.log(`📥 Importing ${tableName}...`);
        
        // Insert records in batches
        const batchSize = 100;
        for (let i = 0; i < records.length; i += batchSize) {
          const batch = records.slice(i, i + batchSize);
          await db.insert(schema).values(batch as any);
        }
        
        console.log(`   ✅ ${records.length} records imported`);
        totalImported += records.length;
      } catch (error) {
        console.error(`   ❌ Error importing ${tableName}:`, (error as any).message);
      }
    }

    console.log(`\n✅ Data import complete!`);
    console.log(`📈 Total records imported: ${totalImported}`);
    console.log(`\n📌 Next steps:`);
    console.log(`   1. Go to Management UI → Database panel`);
    console.log(`   2. Verify all tables show data (not "No data")`);
    console.log(`   3. Refresh the published site to see data`);

  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

importData();
