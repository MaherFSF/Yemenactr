import { db } from '../server/db';
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
  alerts
} from '../drizzle/schema';
import { count } from 'drizzle-orm';

async function checkCounts() {
  console.log('\n📊 Database Record Counts:\n');
  
  try {
    const tables = [
      { name: 'research_publications', table: researchPublications },
      { name: 'glossary_terms', table: glossaryTerms },
      { name: 'time_series', table: timeSeries },
      { name: 'indicators', table: indicators },
      { name: 'economic_events', table: economicEvents },
      { name: 'documents', table: documents },
      { name: 'users', table: users },
      { name: 'sources', table: sources },
      { name: 'provenance_ledger_full', table: provenanceLedgerFull },
      { name: 'confidence_ratings', table: confidenceRatings },
      { name: 'data_vintages', table: dataVintages },
      { name: 'scheduler_jobs', table: schedulerJobs },
      { name: 'alerts', table: alerts },
    ];

    for (const { name, table } of tables) {
      const [result] = await db.select({ count: count() }).from(table);
      const recordCount = result.count;
      const status = recordCount > 0 ? '✅' : '⚠️';
      console.log(`${status} ${name.padEnd(30)} : ${recordCount.toString().padStart(6)} records`);
    }
    
    console.log('\n✅ Database check complete\n');
  } catch (error) {
    console.error('❌ Error checking database:', error);
  }
}

checkCounts();
