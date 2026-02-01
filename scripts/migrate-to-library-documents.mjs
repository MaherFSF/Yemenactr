#!/usr/bin/env node
/**
 * Migrate documents table to library_documents table
 * This ensures the research library has proper data
 */

import mysql from 'mysql2/promise';
import { randomUUID } from 'crypto';
import crypto from 'crypto';

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('=== Migrating documents to library_documents ===\n');
  
  // Get all documents
  const [docs] = await conn.query('SELECT * FROM documents');
  console.log(`Found ${docs.length} documents to migrate\n`);
  
  let migrated = 0;
  let skipped = 0;
  
  for (const doc of docs) {
    // Generate content hash from title + fileUrl
    const contentHash = crypto.createHash('sha256')
      .update(doc.title + (doc.fileUrl || ''))
      .digest('hex')
      .substring(0, 64);
    
    // Check if already exists
    const [existing] = await conn.query(
      'SELECT id FROM library_documents WHERE content_hash = ?',
      [contentHash]
    );
    
    if (existing.length > 0) {
      skipped++;
      continue;
    }
    
    // Map category to doc_type
    const docTypeMap = {
      'humanitarian_report': 'report',
      'situation_report': 'report',
      'economic_report': 'report',
      'financial_report': 'report',
      'policy_brief': 'brief',
      'research_paper': 'paper',
      'statistical_bulletin': 'bulletin',
      'press_release': 'press',
      'legal_document': 'legal',
      'dataset': 'data'
    };
    const docType = docTypeMap[doc.category] || 'report';
    
    // Map category to sectors
    const sectorMap = {
      'humanitarian_report': ['humanitarian', 'aid_flows'],
      'situation_report': ['humanitarian'],
      'economic_report': ['macroeconomy'],
      'financial_report': ['banking', 'public_finance'],
      'policy_brief': ['macroeconomy', 'public_finance'],
      'research_paper': ['macroeconomy'],
      'statistical_bulletin': ['macroeconomy', 'trade'],
      'press_release': ['macroeconomy'],
      'legal_document': ['public_finance'],
      'dataset': ['macroeconomy']
    };
    const sectors = sectorMap[doc.category] || ['macroeconomy'];
    
    // Insert into library_documents
    const id = randomUUID();
    await conn.query(`
      INSERT INTO library_documents 
      (id, title, title_ar, publisher, doc_type, sectors, entities, license_flag, s3_key, content_hash, extraction_status, publication_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      id,
      doc.title,
      doc.titleAr,
      'OCHA', // Default publisher
      docType,
      JSON.stringify(sectors),
      JSON.stringify([]), // No entities linked yet
      doc.license || 'public',
      doc.fileKey,
      contentHash,
      'pending',
      doc.publicationDate
    ]);
    
    migrated++;
    console.log(`✓ Migrated: ${doc.title.substring(0, 50)}...`);
  }
  
  console.log(`\n=== Migration Complete ===`);
  console.log(`Migrated: ${migrated}`);
  console.log(`Skipped (already exists): ${skipped}`);
  
  // Verify count
  const [count] = await conn.query('SELECT COUNT(*) as total FROM library_documents');
  console.log(`\nTotal library_documents: ${count[0].total}`);
  
  await conn.end();
}

main().catch(console.error);
