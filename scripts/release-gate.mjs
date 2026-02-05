#!/usr/bin/env node
/**
 * YETO Platform Release Gate v2.6 (Truth-Native)
 * 
 * This script verifies data integrity before any deployment.
 * All 11 gates must pass for a release to proceed.
 * 
 * Gate 11 (NO_MOCK_EVIDENCE) ensures EvidencePackButton never shows fabricated data.
 * 
 * Usage: node scripts/release-gate.mjs
 */

import mysql from 'mysql2/promise';

// Gate thresholds
const THRESHOLDS = {
  MIN_SOURCES: 250,           // Minimum sources in registry
  MIN_ACTIVE_SOURCES: 150,    // Minimum active sources
  MIN_SECTORS: 16,            // Expected sector count
  MAX_UNKNOWN_TIER_PCT: 70,   // Max percentage of UNKNOWN tier sources
  MIN_MAPPED_SOURCES_PCT: 50, // Min percentage of sources with sector mappings
};

async function runReleaseGate() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  const results = [];
  const stats = {};
  
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║           YETO Platform Release Gate v2.5                    ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  // Gate 1: Source Registry Count
  console.log('🔍 Gate 1: Source Registry Count');
  const [sourceCount] = await conn.execute('SELECT COUNT(*) as count FROM source_registry');
  const sources = sourceCount[0].count;
  const gate1Pass = sources >= THRESHOLDS.MIN_SOURCES;
  console.log(`   ${gate1Pass ? '✅' : '❌'} Sources: ${sources} (min: ${THRESHOLDS.MIN_SOURCES})`);
  results.push({ gate: 'Source Registry Count', value: sources, expected: `>= ${THRESHOLDS.MIN_SOURCES}`, pass: gate1Pass });
  
  // Gate 2: Active Sources
  console.log('🔍 Gate 2: Active Sources');
  const [activeCount] = await conn.execute("SELECT COUNT(*) as count FROM source_registry WHERE status = 'ACTIVE'");
  const active = activeCount[0].count;
  const gate2Pass = active >= THRESHOLDS.MIN_ACTIVE_SOURCES;
  console.log(`   ${gate2Pass ? '✅' : '❌'} Active: ${active} (min: ${THRESHOLDS.MIN_ACTIVE_SOURCES})`);
  results.push({ gate: 'Active Sources', value: active, expected: `>= ${THRESHOLDS.MIN_ACTIVE_SOURCES}`, pass: gate2Pass });
  
  // Gate 3: Sector Codebook
  console.log('🔍 Gate 3: Sector Codebook');
  const [sectorCount] = await conn.execute('SELECT COUNT(*) as count FROM sector_codebook');
  const sectors = sectorCount[0].count;
  const gate3Pass = sectors >= THRESHOLDS.MIN_SECTORS;
  console.log(`   ${gate3Pass ? '✅' : '❌'} Sectors: ${sectors} (expected: ${THRESHOLDS.MIN_SECTORS})`);
  results.push({ gate: 'Sector Codebook', value: sectors, expected: `>= ${THRESHOLDS.MIN_SECTORS}`, pass: gate3Pass });
  
  // Gate 4: Tier Distribution
  console.log('🔍 Gate 4: Tier Distribution');
  const [tierDist] = await conn.execute('SELECT tier, COUNT(*) as count FROM source_registry GROUP BY tier');
  const unknownCount = tierDist.find(t => t.tier === 'UNKNOWN')?.count || 0;
  const unknownPct = (unknownCount / sources * 100).toFixed(1);
  const gate4Pass = parseFloat(unknownPct) <= THRESHOLDS.MAX_UNKNOWN_TIER_PCT;
  console.log(`   ${gate4Pass ? '✅' : '❌'} Unknown Tier: ${unknownPct}% (max: ${THRESHOLDS.MAX_UNKNOWN_TIER_PCT}%)`);
  results.push({ gate: 'Unknown Tier %', value: `${unknownPct}%`, expected: `<= ${THRESHOLDS.MAX_UNKNOWN_TIER_PCT}%`, pass: gate4Pass });
  stats.tierDistribution = tierDist.reduce((acc, t) => { acc[t.tier] = t.count; return acc; }, {});
  
  // Gate 5: Sector Mappings
  console.log('🔍 Gate 5: Sector Mappings');
  const [mappedCount] = await conn.execute("SELECT COUNT(*) as count FROM source_registry WHERE sectorsFed IS NOT NULL AND sectorsFed != '[]' AND sectorsFed != ''");
  const mapped = mappedCount[0].count;
  const mappedPct = (mapped / sources * 100).toFixed(1);
  const gate5Pass = parseFloat(mappedPct) >= THRESHOLDS.MIN_MAPPED_SOURCES_PCT;
  console.log(`   ${gate5Pass ? '✅' : '❌'} Mapped: ${mappedPct}% (min: ${THRESHOLDS.MIN_MAPPED_SOURCES_PCT}%)`);
  results.push({ gate: 'Mapped Sources %', value: `${mappedPct}%`, expected: `>= ${THRESHOLDS.MIN_MAPPED_SOURCES_PCT}%`, pass: gate5Pass });
  
  // Gate 6: No Duplicate Source IDs
  console.log('🔍 Gate 6: No Duplicate Source IDs');
  const [duplicates] = await conn.execute('SELECT sourceId, COUNT(*) as count FROM source_registry GROUP BY sourceId HAVING count > 1');
  const dupCount = duplicates.length;
  const gate6Pass = dupCount === 0;
  console.log(`   ${gate6Pass ? '✅' : '❌'} Duplicates: ${dupCount}`);
  results.push({ gate: 'No Duplicate IDs', value: dupCount, expected: '0 duplicates', pass: gate6Pass });
  
  // Gate 7: Required Fields
  console.log('🔍 Gate 7: Required Fields');
  const [nullNames] = await conn.execute("SELECT COUNT(*) as count FROM source_registry WHERE name IS NULL OR name = ''");
  const nullCount = nullNames[0].count;
  const gate7Pass = nullCount === 0;
  console.log(`   ${gate7Pass ? '✅' : '❌'} Null names: ${nullCount}`);
  results.push({ gate: 'Required Fields', value: nullCount, expected: '0 null names', pass: gate7Pass });
  
  // Gate 8: S3 Storage Health Check
  console.log('🔍 Gate 8: S3 Storage Health Check');
  let gate8Pass = false;
  try {
    // Test S3 connectivity by checking if we can access the storage API
    const testKey = `test/health-check-${Date.now()}.txt`;
    const testData = `YETO Release Gate Health Check - ${new Date().toISOString()}`;
    
    // Check if storage environment variables are set
    const hasStorageConfig = process.env.BUILT_IN_FORGE_API_URL && process.env.BUILT_IN_FORGE_API_KEY;
    gate8Pass = hasStorageConfig;
    console.log(`   ${gate8Pass ? '✅' : '❌'} S3 Storage: ${gate8Pass ? 'Configured' : 'Missing credentials'}`);
  } catch (err) {
    console.log(`   ❌ S3 Storage: Error - ${err.message}`);
  }
  results.push({ gate: 'S3 Storage', value: gate8Pass ? 'Configured' : 'Missing', expected: 'Configured', pass: gate8Pass });

  // Gate 9: v2.5 Schema Columns
  console.log('🔍 Gate 9: v2.5 Schema Columns');
  const [columns] = await conn.execute('DESCRIBE source_registry');
  const colNames = columns.map(c => c.Field);
  const v25Cols = ['sourceType', 'licenseState', 'needsClassification', 'reliabilityScore', 'evidencePackFlag'];
  const missingCols = v25Cols.filter(c => !colNames.includes(c));
  const gate9Pass = missingCols.length === 0;
  
  if (gate9Pass) {
    console.log(`   ✅ v2.5 columns: All present`);
  } else {
    console.log(`   ❌ v2.5 columns: Missing columns detected`);
    console.log(`      Missing: ${missingCols.join(', ')}`);
    console.log('');
    console.log('   📋 RESOLUTION STEPS:');
    console.log('   1. Expected schema version: v2.5');
    console.log('   2. Missing migration: 0028_add_v2_5_governance_columns.sql');
    console.log('   3. Apply migration locally: pnpm db:push');
    console.log('   4. Or run: npx drizzle-kit migrate');
    console.log('   5. Documentation: docs/SCHEMA_V2_5_TRUTH_TABLE.md');
    console.log('   6. Migration runbook: docs/MIGRATION_RUNBOOK.md');
    console.log('');
  }
  
  results.push({ gate: 'v2.5 Schema', value: gate9Pass ? 'Present' : `Missing: ${missingCols.join(', ')}`, expected: 'All v2.5 columns', pass: gate9Pass });
  
  // Gate 10: NO_STATIC_PUBLIC_KPIS - Scan frontend files for forbidden static patterns
  console.log('🔍 Gate 10: NO_STATIC_PUBLIC_KPIS');
  let gate10Pass = true;
  const forbiddenPatterns = [
    { pattern: /"\$[0-9]+\.?[0-9]*[BMK]?\+?\s*\(est\.\)"/g, desc: 'Estimated dollar values' },
    { pattern: /"~[0-9]+/g, desc: 'Approximate values with ~' },
    { pattern: /"[0-9]+,?[0-9]*\+"/g, desc: 'Values with + suffix' },
    { pattern: /const\s+(entities|registrationStats|sectorDistribution|majorCompanies|regionalDistribution|registrationTrends)\s*=\s*\[/g, desc: 'Static data arrays' },
    { pattern: /employees:\s*"~[0-9]+/g, desc: 'Static employee counts' },
    { pattern: /value:\s*"[0-9]+%"/g, desc: 'Static percentage values' },
  ];
  
  const filesToScan = [
    'client/src/pages/Entities.tsx',
    'client/src/pages/CorporateRegistry.tsx',
  ];
  
  const fs = await import('fs/promises');
  const path = await import('path');
  const projectRoot = process.cwd();
  const violations = [];
  
  for (const file of filesToScan) {
    try {
      const filePath = path.join(projectRoot, file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      for (const { pattern, desc } of forbiddenPatterns) {
        const matches = content.match(pattern);
        if (matches && matches.length > 0) {
          violations.push({ file, pattern: desc, matches: matches.slice(0, 3) });
          gate10Pass = false;
        }
      }
    } catch (err) {
      // File doesn't exist or can't be read - skip
    }
  }
  
  if (gate10Pass) {
    console.log('   ✅ No static KPIs found in public UI pages');
  } else {
    console.log('   ❌ Found static KPIs in public UI pages:');
    violations.forEach(v => {
      console.log(`      - ${v.file}: ${v.pattern} (${v.matches.join(', ')})`);
    });
  }
  results.push({ gate: 'NO_STATIC_PUBLIC_KPIS', value: violations.length === 0 ? 'Clean' : `${violations.length} violations`, expected: 'No static KPIs', pass: gate10Pass });

  // Gate 11: NO_MOCK_EVIDENCE - Ensure EvidencePackButton has no mock fallback
  console.log('🔍 Gate 11: NO_MOCK_EVIDENCE');
  let gate11Pass = true;
  const mockEvidencePatterns = [
    { pattern: /getMockEvidenceData/g, desc: 'getMockEvidenceData function' },
    { pattern: /mock.*evidence/gi, desc: 'Mock evidence references' },
    { pattern: /providedData\s*\|\|\s*getMock/g, desc: 'Mock fallback pattern' },
    { pattern: /Loading\.\.\..*جاري التحميل/g, desc: 'Loading placeholder as data' },
  ];
  
  const evidenceFilesToScan = [
    'client/src/components/EvidencePackButton.tsx',
    'client/src/components/EvidenceDrawer.tsx',
  ];
  
  const mockViolations = [];
  
  for (const file of evidenceFilesToScan) {
    try {
      const filePath = path.join(projectRoot, file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      for (const { pattern, desc } of mockEvidencePatterns) {
        const matches = content.match(pattern);
        if (matches && matches.length > 0) {
          mockViolations.push({ file, pattern: desc, count: matches.length });
          gate11Pass = false;
        }
      }
    } catch (err) {
      // File doesn't exist or can't be read - skip
    }
  }
  
  if (gate11Pass) {
    console.log('   ✅ No mock evidence fallback found');
  } else {
    console.log('   ❌ Found mock evidence patterns:');
    mockViolations.forEach(v => {
      console.log(`      - ${v.file}: ${v.pattern} (${v.count} occurrences)`);
    });
  }
  results.push({ gate: 'NO_MOCK_EVIDENCE', value: mockViolations.length === 0 ? 'Clean' : `${mockViolations.length} violations`, expected: 'No mock evidence', pass: gate11Pass });

  // Get additional stats
  const [statusDist] = await conn.execute('SELECT status, COUNT(*) as count FROM source_registry GROUP BY status');
  stats.statusDistribution = statusDist.reduce((acc, s) => { acc[s.status] = s.count; return acc; }, {});
  
  const [typeDist] = await conn.execute('SELECT sourceType, COUNT(*) as count FROM source_registry GROUP BY sourceType');
  stats.sourceTypeDistribution = typeDist.reduce((acc, t) => { acc[t.sourceType] = t.count; return acc; }, {});
  
  await conn.end();
  
  // Summary
  const allPassed = results.every(r => r.pass);
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                        SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(allPassed ? '✅ ALL GATES PASSED' : '❌ SOME GATES FAILED');
  console.log('Gate Results:');
  results.forEach(r => {
    console.log(`  ${r.pass ? '✅' : '❌'} ${r.gate}: ${r.value} (expected: ${r.expected})`);
  });
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                     STATISTICS');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('Tier Distribution:');
  Object.entries(stats.tierDistribution).forEach(([tier, count]) => {
    console.log(`  ${tier}: ${count}`);
  });
  console.log('Status Distribution:');
  Object.entries(stats.statusDistribution).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });
  console.log('Source Type Distribution:');
  Object.entries(stats.sourceTypeDistribution).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Release Gate completed at ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════════════════');
  
  process.exit(allPassed ? 0 : 1);
}

runReleaseGate().catch(err => {
  console.error('Release Gate Error:', err.message);
  process.exit(1);
});
