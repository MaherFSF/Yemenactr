/**
 * Infrastructure Data Ingestion Script
 * Ingests collected infrastructure data from parallel research into the YETO database
 */

import { getDb } from '../server/db';
import { timeSeries, sources, indicators } from '../drizzle/schema';
import { eq, sql } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

interface DataPoint {
  year: number;
  value: number | string;
  source: string;
  confidence: string;
  indicator_source?: string;
}

interface Indicator {
  code: string;
  name: string;
  unit: string;
  data: DataPoint[];
}

interface CategoryData {
  category: string;
  indicators: Indicator[];
}

// Map confidence letters to database values
const confidenceMap: Record<string, string> = {
  'A': 'A',
  'B': 'B',
  'C': 'C',
  'D': 'D',
  'High': 'A',
  'Medium': 'B',
  'Low': 'C'
};

// Source ID mapping (will be created if not exists)
const sourceMapping: Record<string, number> = {};

async function getOrCreateSource(db: any, publisher: string, url?: string): Promise<number> {
  if (sourceMapping[publisher]) {
    return sourceMapping[publisher];
  }

  // Check if source exists
  const existing = await db.select().from(sources).where(eq(sources.publisher, publisher)).limit(1);
  
  if (existing.length > 0) {
    sourceMapping[publisher] = existing[0].id;
    return existing[0].id;
  }

  // Create new source
  const result = await db.insert(sources).values({
    publisher,
    url: url || null,
    license: 'unknown',
    retrievalDate: new Date(),
    notes: `Infrastructure data source - ${publisher}`
  });

  const newSource = await db.select().from(sources).where(eq(sources.publisher, publisher)).limit(1);
  sourceMapping[publisher] = newSource[0].id;
  return newSource[0].id;
}

async function getOrCreateIndicator(db: any, code: string, name: string, unit: string, category: string): Promise<void> {
  const existing = await db.select().from(indicators).where(eq(indicators.code, code)).limit(1);
  
  if (existing.length === 0) {
    await db.insert(indicators).values({
      code,
      nameEn: name,
      nameAr: name, // Would need translation
      descriptionEn: `${category} indicator: ${name}`,
      descriptionAr: `${category} indicator: ${name}`,
      unit,
      sector: 'infrastructure',
      frequency: 'annual',
      isActive: true
    });
    console.log(`  Created indicator: ${code}`);
  }
}

async function insertDataPoint(
  db: any,
  indicatorCode: string,
  year: number,
  value: number | string,
  unit: string,
  sourceId: number,
  confidence: string,
  notes?: string
): Promise<boolean> {
  try {
    const dateForYear = new Date(year, 11, 31); // December 31 of the year
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) {
      console.log(`  Skipping invalid value for ${indicatorCode} ${year}: ${value}`);
      return false;
    }

    await db.insert(timeSeries).values({
      indicatorCode,
      date: dateForYear,
      value: numValue.toString(),
      unit,
      sourceId,
      regimeTag: 'mixed',
      confidenceRating: confidenceMap[confidence] || 'B',
      notes: notes || `${indicatorCode} for Yemen ${year}`
    }).onDuplicateKeyUpdate({
      set: { value: numValue.toString(), updatedAt: new Date() }
    });
    
    return true;
  } catch (error) {
    console.error(`  Error inserting ${indicatorCode} ${year}:`, error);
    return false;
  }
}

async function processDataFile(db: any, filePath: string): Promise<{ success: number; failed: number }> {
  const result = { success: 0, failed: 0 };
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data: CategoryData = JSON.parse(content);
    
    console.log(`\n📊 Processing ${data.category}...`);
    
    for (const indicator of data.indicators) {
      const indicatorCode = `INFRA_${indicator.code.toUpperCase().replace(/[^A-Z0-9_]/g, '_')}`;
      
      // Create indicator if not exists
      await getOrCreateIndicator(db, indicatorCode, indicator.name, indicator.unit, data.category);
      
      for (const point of indicator.data) {
        // Only process data from 2010 onwards
        if (point.year < 2010) continue;
        
        const sourceId = await getOrCreateSource(db, point.source || 'Unknown');
        
        const notes = point.indicator_source 
          ? `${indicator.name} (${point.indicator_source}) for Yemen ${point.year}`
          : `${indicator.name} for Yemen ${point.year}`;
        
        const success = await insertDataPoint(
          db,
          indicatorCode,
          point.year,
          point.value,
          indicator.unit,
          sourceId,
          point.confidence,
          notes
        );
        
        if (success) {
          result.success++;
        } else {
          result.failed++;
        }
      }
    }
    
    console.log(`  ✅ ${data.category}: ${result.success} records ingested, ${result.failed} failed`);
  } catch (error) {
    console.error(`  ❌ Error processing ${filePath}:`, error);
  }
  
  return result;
}

async function main() {
  console.log('🚀 Starting Infrastructure Data Ingestion...');
  console.log('============================================================\n');
  
  const db = await getDb();
  const dataDir = '/home/ubuntu/infrastructure_data';
  
  // Get all JSON files in the directory
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
  
  let totalSuccess = 0;
  let totalFailed = 0;
  
  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const result = await processDataFile(db, filePath);
    totalSuccess += result.success;
    totalFailed += result.failed;
  }
  
  console.log('\n============================================================');
  console.log('📊 INFRASTRUCTURE INGESTION SUMMARY');
  console.log('============================================================');
  console.log(`Total Records Ingested: ${totalSuccess}`);
  console.log(`Total Failed: ${totalFailed}`);
  console.log(`Success Rate: ${((totalSuccess / (totalSuccess + totalFailed)) * 100).toFixed(1)}%`);
  console.log('============================================================\n');
  
  process.exit(0);
}

main().catch(console.error);
