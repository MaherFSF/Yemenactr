/**
 * Sync Economic Events from Static Data to Database
 * Populates the economic_events table with all 83 events from the Timeline
 */

import { getDb } from '../server/db';
import { economicEvents } from '../drizzle/schema';
import { economicEventsData } from '../shared/economic-events-data';
import { sql } from 'drizzle-orm';

// Map severity to impactLevel
function mapSeverity(severity: string): 'low' | 'medium' | 'high' | 'critical' {
  switch (severity) {
    case 'critical': return 'critical';
    case 'major': return 'high';
    case 'moderate': return 'medium';
    case 'minor': return 'low';
    default: return 'medium';
  }
}

// Determine regime tag based on date and event
function getRegimeTag(date: string, title: string): 'aden_irg' | 'sanaa_defacto' | 'mixed' | 'unknown' {
  const year = parseInt(date.substring(0, 4));
  const lowerTitle = title.toLowerCase();
  
  // Before 2014 - unified government
  if (year < 2014) return 'unknown';
  
  // After 2014 - check for specific mentions
  if (lowerTitle.includes('houthi') || lowerTitle.includes('sanaa')) return 'sanaa_defacto';
  if (lowerTitle.includes('aden') || lowerTitle.includes('irg') || lowerTitle.includes('coalition')) return 'aden_irg';
  if (lowerTitle.includes('both') || lowerTitle.includes('nationwide')) return 'mixed';
  
  // Default based on year
  if (year >= 2015) return 'mixed';
  return 'unknown';
}

async function syncEvents() {
  console.log('📅 Syncing Economic Events to Database...\n');
  
  const db = await getDb();
  if (!db) {
    console.error('❌ Database connection failed');
    process.exit(1);
  }
  
  // Clear existing events
  console.log('🗑️  Clearing existing events...');
  await db.delete(economicEvents);
  
  let added = 0;
  let failed = 0;
  
  console.log(`📊 Adding ${economicEventsData.length} events from Timeline...\n`);
  
  for (const event of economicEventsData) {
    try {
      await db.insert(economicEvents).values({
        title: event.title,
        titleAr: event.titleAr,
        description: event.description,
        descriptionAr: event.descriptionAr,
        eventDate: new Date(event.date),
        regimeTag: getRegimeTag(event.date, event.title),
        category: event.category,
        impactLevel: mapSeverity(event.severity),
        sourceId: 1, // Default source
      });
      added++;
      console.log(`  ✅ ${event.date}: ${event.title}`);
    } catch (error: any) {
      failed++;
      console.log(`  ❌ ${event.date}: ${event.title} - ${error.message?.substring(0, 80)}`);
    }
  }
  
  // Get final count
  const count = await db.select({ count: sql<number>`count(*)` }).from(economicEvents);
  
  console.log('\n📈 Summary:');
  console.log(`   Added: ${added}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total in database: ${count[0]?.count || 0}`);
  
  process.exit(0);
}

syncEvents().catch(console.error);
