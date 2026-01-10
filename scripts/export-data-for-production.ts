/**
 * Data Export Script for Production Deployment
 * 
 * This script exports all data from the development database and creates
 * a JSON file that can be imported into the production database.
 * 
 * Usage: pnpm tsx scripts/export-data-for-production.ts
 */

import { getDb } from '../server/db';
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
import fs from 'fs';
import path from 'path';

async function exportData() {
  console.log('🚀 Starting data export for production deployment...\n');

  try {
    const db = await getDb();
    if (!db) {
      console.error('❌ Failed to connect to database');
      process.exit(1);
    }

    const exportedData: Record<string, any[]> = {};

    // Export all key tables
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
      { name: 'research_organizations', schema: researchOrganizations },
      { name: 'research_authors', schema: researchAuthors },
      { name: 'publication_authors', schema: publicationAuthors },
    ];

    for (const { name, schema } of tables) {
      try {
        console.log(`📤 Exporting ${name}...`);
        const data = await db.select().from(schema);
        exportedData[name] = data;
        console.log(`   ✅ ${data.length} records exported`);
      } catch (error) {
        console.log(`   ⚠️  Table ${name} not found or empty (this is OK)`);
        exportedData[name] = [];
      }
    }

    // Create export file
    const exportPath = path.join(process.cwd(), 'data-export.json');
    fs.writeFileSync(exportPath, JSON.stringify(exportedData, null, 2));

    console.log(`\n✅ Data export complete!`);
    console.log(`📁 Export file: ${exportPath}`);
    console.log(`\n📊 Export Summary:`);
    
    let totalRecords = 0;
    for (const [table, data] of Object.entries(exportedData)) {
      if (data.length > 0) {
        console.log(`   ${table.padEnd(35)} : ${data.length.toString().padStart(6)} records`);
        totalRecords += data.length;
      }
    }
    
    console.log(`\n📈 Total records exported: ${totalRecords}`);
    console.log(`\n📌 Next steps:`);
    console.log(`   1. Upload data-export.json to production`);
    console.log(`   2. Run: pnpm tsx scripts/import-data-to-production.ts`);
    console.log(`   3. Verify all tables are populated in Management UI`);

  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

exportData();
