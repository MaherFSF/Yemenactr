import mysql from 'mysql2/promise';

async function addColumns() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  // Check if columns exist
  const [cols] = await conn.query('SHOW COLUMNS FROM source_registry');
  const colNames = cols.map(c => c.Field);
  
  const newCols = [
    { name: 'tierClassificationSuggested', sql: 'VARCHAR(10) DEFAULT NULL' },
    { name: 'tierClassificationReason', sql: 'TEXT DEFAULT NULL' },
    { name: 'tierClassificationConfidence', sql: 'DECIMAL(3,2) DEFAULT NULL' },
    { name: 'requiresHumanReview', sql: 'BOOLEAN DEFAULT FALSE' },
    { name: 'classificationMatchedRule', sql: 'VARCHAR(50) DEFAULT NULL' },
    { name: 'classifiedAt', sql: 'DATETIME DEFAULT NULL' },
    { name: 'classifiedBy', sql: 'VARCHAR(50) DEFAULT NULL' },
    { name: 'previousTier', sql: 'VARCHAR(10) DEFAULT NULL' }
  ];
  
  for (const col of newCols) {
    if (colNames.indexOf(col.name) === -1) {
      await conn.query(`ALTER TABLE source_registry ADD COLUMN ${col.name} ${col.sql}`);
      console.log('Added column:', col.name);
    } else {
      console.log('Column exists:', col.name);
    }
  }
  
  await conn.end();
  console.log('Done');
}

addColumns().catch(console.error);
