/**
 * Master Source Registry Seed Script
 * 
 * Populates the YETO database with 225+ data sources from the master registry.
 * Run with: pnpm ts-node scripts/seed-master-registry.ts
 */

import { db } from '../server/db';
import { source as sourceTable } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as csv from 'csv-parse/sync';

interface SourceRow {
  'SRC-ID': string;
  'Numeric ID': string;
  'Name': string;
  'Category': string;
  'Type': string;
  'URL': string;
  'URL (Raw)': string;
  'Access Method': string;
  'Update Cadence': string;
  'Tier': string;
  'Notes': string;
  'Origin': string;
}

const TIER_MAP: Record<string, string> = {
  'T1': 'T1',
  'T2': 'T2',
  'T3': 'T3',
  'Tier 1': 'T1',
  'Tier 2': 'T2',
  'Tier 3': 'T3',
  '1': 'T1',
  '2': 'T2',
  '3': 'T3',
};

const RELIABILITY_SCORES: Record<string, number> = {
  'A': 95,
  'A-': 90,
  'A+': 98,
  'B': 75,
  'B+': 85,
  'B-': 70,
  'C': 60,
  'D': 40,
};

const ACCESS_METHODS = ['API', 'WEB', 'PORTAL', 'DOCUMENTS', 'SCRAPE', 'MANUAL', 'SATELLITE', 'SUBSCRIPTION', 'MIXED'];

async function seedMasterRegistry() {
  console.log('🌍 Starting Master Source Registry Seed...\n');

  try {
    // Read CSV file
    const csvPath = '/home/ubuntu/upload/sources_seed_225.csv';
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    
    const records = csv.parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as SourceRow[];

    console.log(`📊 Found ${records.length} sources in CSV\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ row: number; error: string }> = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      
      try {
        const srcId = row['SRC-ID']?.trim() || `SRC-${i + 1}`;
        const numericId = parseInt(row['Numeric ID'] || String(i + 1));
        const nameEn = row['Name']?.trim() || 'Unknown Source';
        const category = row['Category']?.trim() || 'Other';
        const tier = TIER_MAP[row['Tier']?.trim() || 'T2'] || 'T2';
        const url = row['URL']?.trim() || '';
        const urlRaw = row['URL (Raw)']?.trim() || url;
        const accessMethod = row['Access Method']?.trim() || 'WEB';
        const updateFrequency = row['Update Cadence']?.trim() || 'Annual';
        const notes = row['Notes']?.trim() || '';
        const origin = row['Origin']?.trim() || 'Global';

        // Extract reliability score from notes if present
        let reliabilityScore = 75; // Default
        const scoreMatch = notes.match(/[AB][+-]?/);
        if (scoreMatch) {
          reliabilityScore = RELIABILITY_SCORES[scoreMatch[0]] || 75;
        }

        // Check if source already exists
        const existing = await db.query.sources.findFirst({
          where: eq(sourceTable.publisher, nameEn),
        });

        if (existing) {
          console.log(`⏭️  Skipping ${srcId}: ${nameEn} (already exists)`);
          continue;
        }

        // Insert source
        await db.insert(sourceTable).values({
          publisher: nameEn,
          url: url || null,
          license: 'Open Data',
          retrievalDate: new Date(),
          notes: notes || null,
        });

        successCount++;
        
        if ((i + 1) % 25 === 0) {
          console.log(`✓ Processed ${i + 1}/${records.length} sources...`);
        }
      } catch (error) {
        errorCount++;
        errors.push({
          row: i + 1,
          error: error instanceof Error ? error.message : String(error),
        });
        console.error(`✗ Error on row ${i + 1}: ${error}`);
      }
    }

    console.log('\n📈 Seed Results:');
    console.log(`✓ Successfully inserted: ${successCount} sources`);
    console.log(`✗ Errors: ${errorCount} sources`);
    console.log(`📊 Total processed: ${successCount + errorCount}/${records.length}\n`);

    if (errors.length > 0 && errors.length <= 10) {
      console.log('Errors encountered:');
      errors.forEach(e => {
        console.log(`  Row ${e.row}: ${e.error}`);
      });
    }

    // Verify insertion
    const totalSources = await db.query.sources.findMany();
    console.log(`\n✅ Total sources in database: ${totalSources.length}`);

    console.log('\n🎉 Master Source Registry Seed Complete!');
  } catch (error) {
    console.error('❌ Fatal error during seed:', error);
    process.exit(1);
  }
}

// Run seed
seedMasterRegistry().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
