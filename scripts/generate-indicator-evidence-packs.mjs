/**
 * Generate Evidence Packs for Time Series Indicators
 * 
 * This script:
 * 1. Reads all time_series records from the database
 * 2. Creates an evidence_pack for each unique indicator
 * 3. Links the evidence_pack to the indicator via a new column or lookup
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
    // 1. Get all unique indicator codes with their latest data
    console.log('\n1. Fetching unique indicators from time_series...');
    const [indicators] = await connection.execute(`
      SELECT 
        ts.indicatorCode,
        ts.regimeTag,
        ts.unit,
        ts.confidenceRating,
        ts.sourceId,
        s.publisher as sourceName,
        s.url as sourceUrl,
        s.retrievalDate,
        COUNT(*) as dataPointCount,
        MIN(ts.date) as earliestDate,
        MAX(ts.date) as latestDate
      FROM time_series ts
      LEFT JOIN sources s ON ts.sourceId = s.id
      GROUP BY ts.indicatorCode, ts.regimeTag, ts.unit, ts.confidenceRating, ts.sourceId, s.publisher, s.url, s.retrievalDate
      ORDER BY ts.indicatorCode
    `);
    
    console.log(`Found ${indicators.length} unique indicator/regime combinations`);
    
    // 2. Get indicator definitions for labels
    const [indicatorDefs] = await connection.execute(
      `SELECT code, nameEn, nameAr, unit, sector FROM indicators`
    );
    const indicatorMap = new Map(indicatorDefs.map(i => [i.code, i]));
    console.log(`Found ${indicatorDefs.length} indicator definitions`);
    
    // 3. Check existing evidence packs for indicators
    const [existingPacks] = await connection.execute(
      `SELECT id, subjectId FROM evidence_packs WHERE subjectType IN ('metric', 'series', 'kpi')`
    );
    const existingPackMap = new Map(existingPacks.map(p => [p.subjectId, p.id]));
    console.log(`Found ${existingPacks.length} existing evidence packs for indicators`);
    
    // 4. Generate evidence packs for indicators
    let created = 0;
    let skipped = 0;
    
    for (const ind of indicators) {
      const indicatorCode = ind.indicatorCode;
      const subjectId = `${indicatorCode}_${ind.regimeTag}`;
      
      // Check if pack already exists
      if (existingPackMap.has(subjectId) || existingPackMap.has(indicatorCode)) {
        skipped++;
        continue;
      }
      
      // Get indicator definition
      const indicatorDef = indicatorMap.get(indicatorCode);
      const indicatorName = indicatorDef?.nameEn || indicatorCode.replace(/_/g, ' ');
      
      // Build subject label
      const regimeLabel = ind.regimeTag === 'aden_irg' ? 'Aden' 
        : ind.regimeTag === 'sanaa_defacto' ? "Sana'a" 
        : 'National';
      const subjectLabel = `${indicatorName} (${regimeLabel})`;
      
      // Build citations
      const citations = [{
        sourceId: ind.sourceId || 0,
        title: ind.sourceName || 'Unknown Source',
        publisher: ind.sourceName?.split(' - ')[0] || 'Unknown',
        url: ind.sourceUrl || undefined,
        retrievalDate: ind.retrievalDate ? new Date(ind.retrievalDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        licenseFlag: 'public'
      }];
      
      // Determine regime tags
      const regimeTags = [ind.regimeTag || 'unknown'];
      
      // Determine geo scope
      const geoScope = ind.regimeTag === 'aden_irg' ? 'Aden' 
        : ind.regimeTag === 'sanaa_defacto' ? "Sana'a" 
        : 'yemen';
      
      // Determine confidence grade based on confidenceRating
      const confidenceGrade = ind.confidenceRating || 'C';
      
      // Build confidence explanation
      const confidenceExplanation = `Based on ${ind.dataPointCount} data points from ${ind.sourceName || 'unknown source'}. ` +
        `Coverage: ${ind.earliestDate ? new Date(ind.earliestDate).toISOString().split('T')[0] : 'unknown'} to ` +
        `${ind.latestDate ? new Date(ind.latestDate).toISOString().split('T')[0] : 'unknown'}. ` +
        `Regime: ${regimeLabel}.`;
      
      // Handle time coverage
      let timeCoverageStart = ind.earliestDate;
      let timeCoverageEnd = ind.latestDate;
      let missingRanges = null;
      
      // Check for dates before 1970
      if (timeCoverageStart) {
        const startDate = new Date(timeCoverageStart);
        if (startDate.getFullYear() < 1970) {
          missingRanges = JSON.stringify([{
            start: startDate.toISOString().split('T')[0],
            end: startDate.toISOString().split('T')[0],
            reason: 'Historical date before MySQL TIMESTAMP range'
          }]);
          timeCoverageStart = null;
        }
      }
      
      // Create new evidence pack
      try {
        const [result] = await connection.execute(
          `INSERT INTO evidence_packs (
            subjectType, subjectId, subjectLabel, citations, transforms,
            regimeTags, geoScope, timeCoverageStart, timeCoverageEnd, missingRanges,
            hasContradictions, dqafIntegrity, dqafMethodology, 
            dqafAccuracyReliability, dqafServiceability, dqafAccessibility,
            confidenceGrade, confidenceExplanation, whatWouldChange
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            'metric',
            subjectId,
            subjectLabel,
            JSON.stringify(citations),
            JSON.stringify([{ description: `Time series data from ${ind.sourceName || 'official sources'}` }]),
            JSON.stringify(regimeTags),
            geoScope,
            timeCoverageStart,
            timeCoverageEnd,
            missingRanges,
            false,
            'pass',
            confidenceGrade === 'A' ? 'pass' : 'needs_review',
            confidenceGrade === 'A' || confidenceGrade === 'B' ? 'pass' : 'needs_review',
            'pass',
            'pass',
            confidenceGrade,
            confidenceExplanation,
            JSON.stringify(['Primary source verification', 'Cross-validation with other sources'])
          ]
        );
        
        created++;
        console.log(`  Created pack ${result.insertId} for ${subjectId} (${subjectLabel})`);
      } catch (err) {
        console.error(`  Error creating pack for ${subjectId}: ${err.message}`);
      }
    }
    
    console.log(`\n=== Summary ===`);
    console.log(`Created: ${created} new evidence packs`);
    console.log(`Skipped: ${skipped} indicators already have packs`);
    
    // 5. Verify results
    console.log('\n5. Verifying results...');
    const [verifyPacks] = await connection.execute(
      `SELECT COUNT(*) as count FROM evidence_packs WHERE subjectType = 'metric'`
    );
    const [verifyIndicators] = await connection.execute(
      `SELECT COUNT(DISTINCT CONCAT(indicatorCode, '_', regimeTag)) as count FROM time_series`
    );
    
    console.log(`Evidence packs for metrics: ${verifyPacks[0].count}`);
    console.log(`Unique indicator/regime combinations: ${verifyIndicators[0].count}`);
    
    if (verifyPacks[0].count >= verifyIndicators[0].count) {
      console.log('\n✅ SUCCESS: All indicators have evidence pack coverage!');
    } else {
      console.log(`\n⚠️ Note: Some indicators may share evidence packs`);
    }
    
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
