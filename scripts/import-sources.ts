/**
 * Import Sources from YETO Master Complete Registry
 * 
 * This script imports 225 sources from the new registry file into the database
 */

import { db } from '../server/db';
import { sourceRegistry } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';

interface SourceData {
  source_id: string;
  name: string;
  category: string;
  tier: string;
  institution: string;
  url: string;
  access_method: string;
  frequency: string;
  coverage: string;
  status: string;
  sectors: string;
  relevance: string;
}

// Sector code mapping
const sectorCodeMapping: Record<string, string> = {
  'S01': 'macro',
  'S02': 'prices',
  'S03': 'currency',
  'S04': 'banking',
  'S05': 'fiscal',
  'S06': 'trade',
  'S07': 'energy',
  'S08': 'labor',
  'S09': 'aid',
  'S10': 'food-security',
  'S11': 'humanitarian',
  'S12': 'conflict',
  'S13': 'infrastructure',
  'S14': 'investment',
  'S15': 'research',
  'S16': 'remote-sensing',
};

// Map tier from file to database enum
function mapTier(tier: string): 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'UNKNOWN' {
  const tierMap: Record<string, 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'UNKNOWN'> = {
    'T0': 'T0',
    'T1': 'T1',
    'T2': 'T2',
    'T3': 'T3',
    'T4': 'T4',
    'UNKNOWN': 'UNKNOWN',
  };
  return tierMap[tier] || 'UNKNOWN';
}

// Map access method to database enum
function mapAccessType(method: string): 'API' | 'SDMX' | 'RSS' | 'WEB' | 'PDF' | 'CSV' | 'XLSX' | 'MANUAL' | 'PARTNER' | 'REMOTE_SENSING' {
  const methodMap: Record<string, 'API' | 'SDMX' | 'RSS' | 'WEB' | 'PDF' | 'CSV' | 'XLSX' | 'MANUAL' | 'PARTNER' | 'REMOTE_SENSING'> = {
    'API': 'API',
    'SDMX': 'SDMX',
    'RSS': 'RSS',
    'WEB': 'WEB',
    'PDF': 'PDF',
    'CSV': 'CSV',
    'XLSX': 'XLSX',
    'MANUAL': 'MANUAL',
    'PARTNER': 'PARTNER',
    'REMOTE_SENSING': 'REMOTE_SENSING',
  };
  return methodMap[method.toUpperCase()] || 'WEB';
}

// Map status to database enum
function mapStatus(status: string): 'ACTIVE' | 'PENDING_REVIEW' | 'NEEDS_KEY' | 'INACTIVE' | 'DEPRECATED' {
  const statusMap: Record<string, 'ACTIVE' | 'PENDING_REVIEW' | 'NEEDS_KEY' | 'INACTIVE' | 'DEPRECATED'> = {
    'ACTIVE': 'ACTIVE',
    'PENDING_REVIEW': 'PENDING_REVIEW',
    'NEEDS_KEY': 'NEEDS_KEY',
    'INACTIVE': 'INACTIVE',
    'DEPRECATED': 'DEPRECATED',
  };
  return statusMap[status.toUpperCase()] || 'ACTIVE';
}

// Map frequency to database enum
function mapFrequency(freq: string): 'REALTIME' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'IRREGULAR' {
  const freqLower = freq.toLowerCase();
  if (freqLower.includes('realtime') || freqLower.includes('real-time')) return 'REALTIME';
  if (freqLower.includes('daily')) return 'DAILY';
  if (freqLower.includes('weekly')) return 'WEEKLY';
  if (freqLower.includes('monthly')) return 'MONTHLY';
  if (freqLower.includes('quarterly')) return 'QUARTERLY';
  if (freqLower.includes('annual') || freqLower.includes('yearly')) return 'ANNUAL';
  return 'IRREGULAR';
}

// Parse sectors string to array
function parseSectors(sectorsStr: string): string[] {
  if (!sectorsStr || sectorsStr === 'nan') return [];
  return sectorsStr.split(',').map(s => {
    const code = s.trim();
    return sectorCodeMapping[code] || code.toLowerCase();
  }).filter(s => s);
}

async function importSources() {
  console.log('📥 Starting source import from YETO Master Complete Registry...\n');
  
  // Read the JSON file
  const sourcesData: SourceData[] = JSON.parse(
    fs.readFileSync('/home/ubuntu/yeto-platform/data/new_sources.json', 'utf-8')
  );
  
  console.log(`Found ${sourcesData.length} sources to import\n`);
  
  let imported = 0;
  let updated = 0;
  let errors = 0;
  
  for (const source of sourcesData) {
    try {
      // Check if source already exists
      const existing = await db.select().from(sourceRegistry)
        .where(eq(sourceRegistry.sourceId, source.source_id))
        .limit(1);
      
      const sectors = parseSectors(source.sectors);
      const isApi = source.access_method.toUpperCase() === 'API';
      
      const sourceData = {
        sourceId: source.source_id,
        name: source.name,
        publisher: source.institution !== 'nan' ? source.institution : undefined,
        apiUrl: isApi ? source.url : undefined,
        webUrl: !isApi ? source.url : undefined,
        accessType: mapAccessType(source.access_method),
        tier: mapTier(source.tier),
        status: mapStatus(source.status),
        updateFrequency: mapFrequency(source.frequency),
        geographicScope: source.coverage !== 'nan' ? source.coverage : 'Global',
        sectorsFed: sectors,
        sectorCategory: source.category !== 'nan' ? source.category : undefined,
        description: `${source.name} - ${source.category}`,
        historicalStart: 2010,
        historicalEnd: null,
        isPrimary: source.tier === 'T0' || source.tier === 'T1',
      };
      
      if (existing.length > 0) {
        // Update existing source
        await db.update(sourceRegistry)
          .set(sourceData)
          .where(eq(sourceRegistry.sourceId, source.source_id));
        updated++;
      } else {
        // Insert new source
        await db.insert(sourceRegistry).values(sourceData);
        imported++;
      }
      
      if ((imported + updated) % 25 === 0) {
        console.log(`Progress: ${imported + updated}/${sourcesData.length} sources processed`);
      }
    } catch (error) {
      console.error(`Error importing ${source.source_id}: ${error}`);
      errors++;
    }
  }
  
  console.log('\n✅ Source import complete!');
  console.log(`   - New sources imported: ${imported}`);
  console.log(`   - Existing sources updated: ${updated}`);
  console.log(`   - Errors: ${errors}`);
  console.log(`   - Total processed: ${imported + updated + errors}`);
}

// Run the import
importSources().catch(console.error);
