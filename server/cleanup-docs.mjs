import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

async function main() {
  const conn = await mysql.createConnection(DATABASE_URL);
  
  // Step 1: Get all documents
  const [allDocs] = await conn.execute('SELECT id, title, summary_en, publisher FROM library_documents');
  console.log(`Total documents: ${allDocs.length}`);
  
  // Step 2: Identify non-Yemen documents
  const yemenKeywords = ['yemen', 'yemeni', 'sanaa', "sana'a", 'aden', 'houthi', 'ansar allah', 
    'riyal', 'taiz', 'hodeidah', 'hudaydah', 'marib', 'hadramaut', 'socotra',
    'daily market snapshot', 'cby', 'central bank of yemen'];
  
  const toDelete = [];
  for (const doc of allDocs) {
    const text = `${doc.title || ''} ${doc.summary_en || ''} ${doc.publisher || ''}`.toLowerCase();
    const isYemenRelated = yemenKeywords.some(kw => text.includes(kw));
    if (!isYemenRelated) {
      toDelete.push(doc.id);
    }
  }
  
  console.log(`Non-Yemen documents to delete: ${toDelete.length}`);
  
  // Step 3: Delete in batches
  if (toDelete.length > 0) {
    const batchSize = 50;
    for (let i = 0; i < toDelete.length; i += batchSize) {
      const batch = toDelete.slice(i, i + batchSize);
      const placeholders = batch.map(() => '?').join(',');
      await conn.execute(`DELETE FROM library_documents WHERE id IN (${placeholders})`, batch);
      console.log(`Deleted batch ${Math.floor(i/batchSize) + 1}: ${batch.length} docs`);
    }
  }
  
  // Step 4: Final count
  const [count] = await conn.execute('SELECT COUNT(*) as cnt FROM library_documents');
  console.log(`\nRemaining documents: ${count[0].cnt}`);
  
  // Step 5: Year distribution
  const [years] = await conn.execute('SELECT YEAR(publication_date) as yr, COUNT(*) as cnt FROM library_documents WHERE publication_date IS NOT NULL GROUP BY yr ORDER BY yr');
  years.forEach(r => console.log(`  ${r.yr}: ${r.cnt}`));
  
  await conn.end();
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
