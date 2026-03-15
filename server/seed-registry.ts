/**
 * YETO Registry Database Seeder
 * 
 * Seeds the database from registry-seed-data.json
 * Uses Drizzle ORM for type-safe insertions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db';
import { 
  sourceRegistry, 
  gapTickets, 
  ingestionConnectors,
  registryLintResults 
} from '../drizzle/schema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEED_DATA_PATH = path.join(__dirname, '../data/registry-seed-data.json');

async function seedRegistry() {
  console.log('🌱 Starting YETO Registry Seeding...\n');
  
  // Read seed data
  const seedData = JSON.parse(fs.readFileSync(SEED_DATA_PATH, 'utf-8'));
  
  console.log('📋 Seed Data Metadata:');
  console.log(`  Registry Version: ${seedData.metadata.registryVersion}`);
  console.log(`  Generated At: ${seedData.metadata.generatedAt}`);
  console.log(`  Checksum: ${seedData.metadata.registryChecksum.substring(0, 16)}...`);
  console.log(`  Sources: ${seedData.metadata.counts.sources}`);
  console.log(`  Gap Tickets: ${seedData.metadata.counts.gaps}`);
  console.log(`  Connectors: ${seedData.metadata.counts.connectors}\n`);
  
  try {
    // 1. Seed source_registry
    console.log('📊 Seeding source_registry...');
    let sourceCount = 0;
    for (const source of seedData.sourceRegistry) {
      try {
        await db.insert(sourceRegistry).values({
          sourceId: source.sourceId,
          name: source.name,
          altName: source.altName,
          publisher: source.publisher,
          apiUrl: source.apiUrl,
          webUrl: source.webUrl,
          accessType: source.accessType,
          updateFrequency: source.updateFrequency,
          tier: source.tier,
          reliabilityScore: source.reliabilityScore,
          confidenceGrade: source.confidenceGrade,
          authRequired: source.authRequired,
          partnershipRequired: source.partnershipRequired,
          dataFormat: source.dataFormat,
          license: source.license,
          geographicCoverage: source.geographicCoverage,
          timeCoverageStart: source.timeCoverageStart,
          timeCoverageEnd: source.timeCoverageEnd,
          sectorCategory: source.sectorCategory,
          notes: source.notes,
          tags: source.tags,
          status: source.status,
          active: source.active,
          registryType: 'master'
        }).onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });
        sourceCount++;
      } catch (err) {
        console.error(`  ⚠️  Error inserting source ${source.sourceId}:`, err.message);
      }
    }
    console.log(`  ✅ Inserted ${sourceCount} sources\n`);
    
    // 2. Seed gap_tickets
    console.log('🎫 Seeding gap_tickets...');
    let gapCount = 0;
    for (const gap of seedData.gapTickets) {
      try {
        // Find sourceRegistryId from sourceId
        const sourceResult = await db
          .select({ id: sourceRegistry.id })
          .from(sourceRegistry)
          .where(sourceRegistry.sourceId.eq(gap.sourceId))
          .limit(1);
        
        const sourceRegistryId = sourceResult[0]?.id;
        
        await db.insert(gapTickets).values({
          gapId: gap.gapId,
          severity: gap.severity,
          gapType: gap.gapType,
          sourceRegistryId: sourceRegistryId || null,
          titleEn: gap.titleEn,
          titleAr: gap.titleAr,
          descriptionEn: gap.descriptionEn,
          descriptionAr: gap.descriptionAr,
          status: gap.status,
          recommendedAction: gap.recommendedAction,
          isPublic: gap.isPublic
        }).onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });
        gapCount++;
      } catch (err) {
        console.error(`  ⚠️  Error inserting gap ${gap.gapId}:`, err.message);
      }
    }
    console.log(`  ✅ Inserted ${gapCount} gap tickets\n`);
    
    // 3. Seed ingestion_connectors
    console.log('🔌 Seeding ingestion_connectors...');
    let connectorCount = 0;
    for (const connector of seedData.ingestionConnectors) {
      try {
        // Find sourceRegistryId
        const sourceResult = await db
          .select({ id: sourceRegistry.id })
          .from(sourceRegistry)
          .where(sourceRegistry.sourceId.eq(connector.sourceId))
          .limit(1);
        
        const sourceRegistryId = sourceResult[0]?.id;
        
        if (!sourceRegistryId) {
          console.warn(`  ⚠️  Source not found for connector ${connector.connectorId}`);
          continue;
        }
        
        await db.insert(ingestionConnectors).values({
          connectorId: connector.connectorId,
          sourceRegistryId: sourceRegistryId,
          connectorType: connector.connectorType,
          config: connector.config,
          cadence: connector.cadence,
          cadenceLagTolerance: connector.cadenceLagTolerance,
          licenseAllowsAutomation: connector.licenseAllowsAutomation,
          requiresAuth: connector.requiresAuth,
          requiresPartnership: connector.requiresPartnership,
          evidenceRequired: connector.evidenceRequired,
          status: connector.status,
          consecutiveFailures: 0
        }).onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });
        connectorCount++;
      } catch (err) {
        console.error(`  ⚠️  Error inserting connector ${connector.connectorId}:`, err.message);
      }
    }
    console.log(`  ✅ Inserted ${connectorCount} connectors\n`);
    
    console.log('✅ Registry seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Sources seeded: ${sourceCount}`);
    console.log(`   Gap tickets created: ${gapCount}`);
    console.log(`   Connectors configured: ${connectorCount}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedRegistry()
    .then(() => {
      console.log('\n✅ Done!');
      process.exit(0);
    })
    .catch(err => {
      console.error('\n❌ Failed:', err);
      process.exit(1);
    });
}

export { seedRegistry };
