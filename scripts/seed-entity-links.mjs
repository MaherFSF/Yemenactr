/**
 * Seed Entity Relationship Links
 * Creates meaningful relationships between entities in the YETO platform
 */

import mysql from 'mysql2/promise';

const entityLinks = [
  // Central Bank relationships
  { sourceId: 1, targetId: 3, type: 'affiliated_with', desc: 'CBY Aden works with Ministry of Finance - IRG on monetary policy' },
  { sourceId: 1, targetId: 7, type: 'regulates', desc: 'CBY Aden oversees Customs Authority - Aden' },
  { sourceId: 2, targetId: 8, type: 'regulates', desc: 'CBY Sanaa oversees Customs Authority - Sanaa' },
  
  // CBY regulates commercial banks
  { sourceId: 1, targetId: 10, type: 'regulates', desc: 'CBY Aden regulates Cooperative and Agricultural Credit Bank' },
  { sourceId: 1, targetId: 11, type: 'regulates', desc: 'CBY Aden regulates International Bank of Yemen' },
  { sourceId: 1, targetId: 59, type: 'regulates', desc: 'CBY Aden regulates National Bank of Yemen' },
  { sourceId: 1, targetId: 15, type: 'regulates', desc: 'CBY Aden regulates Saba Islamic Bank' },
  { sourceId: 1, targetId: 13, type: 'regulates', desc: 'CBY Aden regulates Shamil Bank of Yemen and Bahrain' },
  { sourceId: 1, targetId: 14, type: 'regulates', desc: 'CBY Aden regulates Tadhamon International Islamic Bank' },
  { sourceId: 1, targetId: 58, type: 'regulates', desc: 'CBY Aden regulates Yemen Bank for Reconstruction and Development' },
  { sourceId: 1, targetId: 12, type: 'regulates', desc: 'CBY Aden regulates Yemen Commercial Bank' },
  
  // CBY regulates MFIs
  { sourceId: 1, targetId: 16, type: 'regulates', desc: 'CBY Aden regulates Al-Amal Microfinance Bank' },
  { sourceId: 1, targetId: 17, type: 'regulates', desc: 'CBY Aden regulates SMEPS' },
  { sourceId: 1, targetId: 18, type: 'regulates', desc: 'CBY Aden regulates Al-Kuraimi Islamic Microfinance Bank' },
  
  // Ministry relationships
  { sourceId: 3, targetId: 9, type: 'parent_of', desc: 'Ministry of Finance oversees Tax Authority' },
  { sourceId: 3, targetId: 7, type: 'affiliated_with', desc: 'Ministry of Finance coordinates with Customs Authority' },
  { sourceId: 4, targetId: 27, type: 'partner_with', desc: 'Ministry of Planning coordinates with World Bank' },
  { sourceId: 4, targetId: 28, type: 'partner_with', desc: 'Ministry of Planning coordinates with IMF' },
  { sourceId: 5, targetId: 41, type: 'regulates', desc: 'Ministry of Oil oversees Yemen LNG Company' },
  { sourceId: 5, targetId: 44, type: 'regulates', desc: 'Ministry of Oil oversees Safer E&P' },
  { sourceId: 5, targetId: 45, type: 'regulates', desc: 'Ministry of Oil oversees Aden Refinery Company' },
  
  // UN Agency coordination
  { sourceId: 19, targetId: 20, type: 'partner_with', desc: 'OCHA coordinates humanitarian response with WFP' },
  { sourceId: 19, targetId: 21, type: 'partner_with', desc: 'OCHA coordinates with UNDP on development-humanitarian nexus' },
  { sourceId: 19, targetId: 22, type: 'partner_with', desc: 'OCHA coordinates child protection with UNICEF' },
  { sourceId: 19, targetId: 23, type: 'partner_with', desc: 'OCHA coordinates health response with WHO' },
  { sourceId: 19, targetId: 24, type: 'partner_with', desc: 'OCHA coordinates food security with FAO' },
  { sourceId: 19, targetId: 25, type: 'partner_with', desc: 'OCHA coordinates migration response with IOM' },
  { sourceId: 19, targetId: 26, type: 'partner_with', desc: 'OCHA coordinates refugee response with UNHCR' },
  { sourceId: 20, targetId: 24, type: 'partner_with', desc: 'WFP and FAO coordinate on food security cluster' },
  { sourceId: 22, targetId: 23, type: 'partner_with', desc: 'UNICEF and WHO coordinate on child health' },
  
  // Donor funding relationships
  { sourceId: 27, targetId: 21, type: 'funds', desc: 'World Bank funds UNDP programs in Yemen' },
  { sourceId: 27, targetId: 4, type: 'funds', desc: 'World Bank provides technical assistance to Ministry of Planning' },
  { sourceId: 28, targetId: 1, type: 'partner_with', desc: 'IMF provides technical assistance to CBY Aden' },
  { sourceId: 29, targetId: 3, type: 'funds', desc: 'SDRPY provides budget support to Ministry of Finance' },
  { sourceId: 30, targetId: 20, type: 'funds', desc: 'USAID funds WFP food assistance' },
  { sourceId: 30, targetId: 36, type: 'funds', desc: 'USAID funds Save the Children programs' },
  { sourceId: 31, targetId: 19, type: 'funds', desc: 'EU funds OCHA coordination activities' },
  { sourceId: 31, targetId: 37, type: 'funds', desc: 'EU funds CARE International programs' },
  { sourceId: 32, targetId: 38, type: 'funds', desc: 'UK FCDO funds Oxfam programs' },
  { sourceId: 33, targetId: 4, type: 'funds', desc: 'Kuwait Fund provides development financing' },
  
  // INGO partnerships
  { sourceId: 34, targetId: 23, type: 'partner_with', desc: 'ICRC partners with WHO on health facilities' },
  { sourceId: 35, targetId: 23, type: 'partner_with', desc: 'MSF coordinates with WHO on health response' },
  { sourceId: 36, targetId: 22, type: 'partner_with', desc: 'Save the Children partners with UNICEF on child protection' },
  { sourceId: 37, targetId: 20, type: 'partner_with', desc: 'CARE partners with WFP on food distribution' },
  { sourceId: 38, targetId: 24, type: 'partner_with', desc: 'Oxfam partners with FAO on livelihoods' },
  { sourceId: 39, targetId: 26, type: 'partner_with', desc: 'NRC partners with UNHCR on displacement response' },
  { sourceId: 40, targetId: 20, type: 'partner_with', desc: 'ACF partners with WFP on nutrition' },
  
  // Company relationships
  { sourceId: 41, targetId: 44, type: 'partner_with', desc: 'Yemen LNG and Safer E&P coordinate on gas production' },
  { sourceId: 42, targetId: 43, type: 'competes_with', desc: 'Yemen Mobile and MTN Yemen compete in telecom market' },
  
  // Political relationships
  { sourceId: 53, targetId: 55, type: 'affiliated_with', desc: 'GPC and Islah historically part of national dialogue' },
  { sourceId: 53, targetId: 54, type: 'affiliated_with', desc: 'GPC and YSP historical political parties' },
  
  // Armed group territorial control
  { sourceId: 56, targetId: 2, type: 'affiliated_with', desc: 'Ansar Allah controls CBY Sanaa' },
  { sourceId: 57, targetId: 1, type: 'affiliated_with', desc: 'STC influences Aden-based institutions' },
];

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('Creating entity relationship links...');
  
  let inserted = 0;
  let skipped = 0;
  
  for (const link of entityLinks) {
    try {
      // Check if link already exists
      const [existing] = await conn.execute(
        'SELECT id FROM entity_links WHERE sourceEntityId = ? AND targetEntityId = ? AND relationshipType = ?',
        [link.sourceId, link.targetId, link.type]
      );
      
      if (existing.length > 0) {
        skipped++;
        continue;
      }
      
      await conn.execute(
        'INSERT INTO entity_links (sourceEntityId, targetEntityId, relationshipType, description, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [link.sourceId, link.targetId, link.type, link.desc]
      );
      inserted++;
      console.log(`✓ Created: ${link.desc}`);
    } catch (error) {
      console.error(`✗ Failed: ${link.desc} - ${error.message}`);
    }
  }
  
  console.log(`\\nSummary: ${inserted} inserted, ${skipped} skipped (already exist)`);
  
  // Show total count
  const [count] = await conn.execute('SELECT COUNT(*) as total FROM entity_links');
  console.log(`Total entity links in database: ${count[0].total}`);
  
  await conn.end();
}

main().catch(console.error);
