/**
 * Generate Evidence Packs for Entity Claims
 * 
 * This script:
 * 1. Reads all entity_claims from the database
 * 2. Creates an evidence_pack for each claim
 * 3. Links the evidence_pack to the claim via primary_evidence_id
 */

import mysql from 'mysql2/promise';

// Use DATABASE_URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

// Parse DATABASE_URL
function parseDbUrl(url) {
  // Format: mysql://user:password@host:port/database?ssl=...
  const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
  if (!match) {
    throw new Error('Invalid DATABASE_URL format');
  }
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4]),
    database: match[5],
    ssl: {
      rejectUnauthorized: true
    }
  };
}

async function main() {
  console.log('Connecting to database...');
  const config = parseDbUrl(DATABASE_URL);
  const connection = await mysql.createConnection(config);
  
  try {
    // 1. Get all entity_claims
    console.log('\n1. Fetching all entity_claims...');
    const [claims] = await connection.execute(
      `SELECT id, claim_id, entity_id, claim_type, claim_subject, claim_object, 
              valid_from, valid_to, quality_profile, source_url, source_name, 
              retrieval_date, primary_evidence_id
       FROM entity_claims`
    );
    
    console.log(`Found ${claims.length} entity_claims`);
    
    // 2. Get entity names for labels
    const [entities] = await connection.execute(
      `SELECT id, name, nameAr, entityType, regimeTag FROM entities`
    );
    const entityMap = new Map(entities.map(e => [e.id.toString(), e]));
    
    // 3. Check existing evidence packs for claims
    const [existingPacks] = await connection.execute(
      `SELECT id, subjectId FROM evidence_packs WHERE subjectType = 'claim'`
    );
    const existingPackMap = new Map(existingPacks.map(p => [p.subjectId, p.id]));
    console.log(`Found ${existingPacks.length} existing evidence packs for claims`);
    
    // 4. Generate evidence packs for claims that don't have one
    let created = 0;
    let updated = 0;
    let skipped = 0;
    
    for (const claim of claims) {
      const claimId = claim.claim_id;
      const entity = entityMap.get(claim.entity_id.toString());
      
      // Parse JSON fields if they're strings
      const claimSubject = typeof claim.claim_subject === 'string' 
        ? JSON.parse(claim.claim_subject) 
        : claim.claim_subject;
      const claimObject = typeof claim.claim_object === 'string'
        ? JSON.parse(claim.claim_object)
        : claim.claim_object;
      const qualityProfile = typeof claim.quality_profile === 'string'
        ? JSON.parse(claim.quality_profile)
        : claim.quality_profile;
      
      // Build the evidence pack data
      const subjectLabel = `${entity?.name || 'Unknown Entity'}: ${claimSubject?.metric || claimSubject?.event || claim.claim_type}`;
      
      // Build citations from claim source info
      const citations = [{
        sourceId: 0, // We don't have a source table entry, use 0
        title: claim.source_name || 'Unknown Source',
        publisher: claim.source_name?.split(' - ')[0] || 'Unknown',
        url: claim.source_url || undefined,
        retrievalDate: claim.retrieval_date ? new Date(claim.retrieval_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        licenseFlag: 'public'
      }];
      
      // Determine regime tags from entity
      const regimeTags = entity?.regimeTag ? [entity.regimeTag] : ['unified'];
      
      // Determine geo scope
      const geoScope = entity?.regimeTag === 'aden_irg' ? 'Aden' 
        : entity?.regimeTag === 'sanaa_defacto' ? "Sana'a" 
        : 'National';
      
      // Determine confidence grade based on source type
      const sourceType = qualityProfile?.source_type || 'unknown';
      const confidenceGrade = sourceType === 'official' ? 'B' 
        : sourceType === 'partner' ? 'B'
        : sourceType === 'media' ? 'C'
        : 'C';
      
      // Build confidence explanation
      const confidenceExplanation = `Based on ${sourceType} source (${claim.source_name}). ` +
        `Claim type: ${claim.claim_type}. ` +
        `Methodology: ${qualityProfile?.methodology || 'unspecified'}.`;
      
      // Check if pack already exists
      if (existingPackMap.has(claimId)) {
        // Update the claim to link to existing pack
        const packId = existingPackMap.get(claimId);
        if (!claim.primary_evidence_id) {
          await connection.execute(
            `UPDATE entity_claims SET primary_evidence_id = ? WHERE id = ?`,
            [packId, claim.id]
          );
          updated++;
          console.log(`  Updated claim ${claimId} to link to existing pack ${packId}`);
        } else {
          skipped++;
          console.log(`  Skipped claim ${claimId} - already linked to pack ${claim.primary_evidence_id}`);
        }
        continue;
      }
      
      // Handle dates before 1970 (MySQL TIMESTAMP limitation)
      // TIMESTAMP range: '1970-01-01 00:00:01' to '2038-01-19 03:14:07'
      // For dates before 1970, we set timeCoverageStart to null and store in missingRanges
      let timeCoverageStart = claim.valid_from;
      let timeCoverageEnd = claim.valid_to;
      let missingRanges = null;
      
      if (timeCoverageStart) {
        const startDate = new Date(timeCoverageStart);
        if (startDate.getFullYear() < 1970) {
          console.log(`    Note: Date ${startDate.toISOString()} is before 1970, storing in missingRanges`);
          missingRanges = JSON.stringify([{
            start: startDate.toISOString().split('T')[0],
            end: startDate.toISOString().split('T')[0],
            reason: 'Historical date before MySQL TIMESTAMP range'
          }]);
          timeCoverageStart = null;
        }
      }
      
      // Create new evidence pack
      const [result] = await connection.execute(
        `INSERT INTO evidence_packs (
          subjectType, subjectId, subjectLabel, citations, transforms,
          regimeTags, geoScope, timeCoverageStart, timeCoverageEnd, missingRanges,
          hasContradictions, dqafIntegrity, dqafMethodology, 
          dqafAccuracyReliability, dqafServiceability, dqafAccessibility,
          confidenceGrade, confidenceExplanation, whatWouldChange
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'claim',
          claimId,
          subjectLabel,
          JSON.stringify(citations),
          JSON.stringify([{ description: `Claim extracted from ${claim.source_name}` }]),
          JSON.stringify(regimeTags),
          geoScope,
          timeCoverageStart,
          timeCoverageEnd,
          missingRanges,
          false,
          'pass',
          sourceType === 'official' ? 'pass' : 'needs_review',
          sourceType === 'official' ? 'pass' : 'needs_review',
          'pass',
          'pass',
          confidenceGrade,
          confidenceExplanation,
          JSON.stringify(['Primary source verification', 'Additional corroborating sources'])
        ]
      );
      
      const packId = result.insertId;
      
      // Update the claim to link to the new pack
      await connection.execute(
        `UPDATE entity_claims SET primary_evidence_id = ? WHERE id = ?`,
        [packId, claim.id]
      );
      
      created++;
      console.log(`  Created pack ${packId} for claim ${claimId} (${subjectLabel})`);
    }
    
    console.log(`\n=== Summary ===`);
    console.log(`Created: ${created} new evidence packs`);
    console.log(`Updated: ${updated} claims linked to existing packs`);
    console.log(`Skipped: ${skipped} claims already linked`);
    
    // 5. Verify results
    console.log('\n5. Verifying results...');
    const [verifyPacks] = await connection.execute(
      `SELECT COUNT(*) as count FROM evidence_packs WHERE subjectType = 'claim'`
    );
    const [verifyClaims] = await connection.execute(
      `SELECT COUNT(*) as total, 
              SUM(CASE WHEN primary_evidence_id IS NOT NULL THEN 1 ELSE 0 END) as linked
       FROM entity_claims`
    );
    
    console.log(`Evidence packs for claims: ${verifyPacks[0].count}`);
    console.log(`Entity claims total: ${verifyClaims[0].total}`);
    console.log(`Entity claims with evidence pack: ${verifyClaims[0].linked}`);
    
    if (verifyClaims[0].total === verifyClaims[0].linked) {
      console.log('\n✅ SUCCESS: All entity_claims have evidence pack linkage!');
    } else {
      console.log(`\n⚠️ WARNING: ${verifyClaims[0].total - verifyClaims[0].linked} claims still missing evidence packs`);
    }
    
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
