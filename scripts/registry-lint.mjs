#!/usr/bin/env node
/**
 * YETO Platform - Source Registry Lint
 * 
 * This script validates the integrity of the source_registry table.
 * It checks for data quality issues, schema compliance, and referential integrity.
 * 
 * Usage: node scripts/registry-lint.mjs
 * Exit code: 0 = all checks pass, 1 = validation errors found
 */

import mysql from 'mysql2/promise';

const VALIDATION_RULES = {
  // Required fields that must not be null or empty
  REQUIRED_FIELDS: ['sourceId', 'name', 'tier', 'status'],
  
  // Valid values for enum-like fields
  VALID_TIERS: ['PRIMARY', 'SECONDARY', 'TERTIARY', 'UNKNOWN'],
  VALID_STATUSES: ['ACTIVE', 'INACTIVE', 'DEPRECATED', 'PENDING'],
  VALID_SOURCE_TYPES: ['OFFICIAL', 'RESEARCH', 'MEDIA', 'COMMERCIAL', 'NGO', 'OTHER'],
  
  // Data quality thresholds
  MAX_NULL_PERCENTAGE: 50, // Max % of sources with null optional fields
  MIN_MAPPED_SOURCES: 50,  // Min % of sources with sector mappings
  MAX_DUPLICATES: 0,       // Max allowed duplicate source IDs
};

async function runRegistryLint() {
  let conn;
  const errors = [];
  const warnings = [];
  
  try {
    conn = await mysql.createConnection(process.env.DATABASE_URL);
    
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║             YETO Platform - Registry Lint v1.0               ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    
    // ========================================
    // Check 1: Table Exists
    // ========================================
    console.log('🔍 Check 1: Table Existence');
    try {
      const [tables] = await conn.execute(
        "SHOW TABLES LIKE 'source_registry'"
      );
      if (tables.length === 0) {
        errors.push('FATAL: source_registry table does not exist');
        console.log('   ❌ Table not found\n');
      } else {
        console.log('   ✅ Table exists\n');
      }
    } catch (err) {
      errors.push(`Table check failed: ${err.message}`);
    }
    
    // ========================================
    // Check 2: Schema Validation
    // ========================================
    console.log('🔍 Check 2: Schema Validation');
    try {
      const [columns] = await conn.execute('DESCRIBE source_registry');
      const columnNames = columns.map(c => c.Field);
      
      const requiredColumns = [
        'id', 'sourceId', 'name', 'tier', 'status', 'sourceType',
        'licenseState', 'sectorsFed', 'reliabilityScore', 'evidencePackFlag'
      ];
      
      const missingColumns = requiredColumns.filter(c => !columnNames.includes(c));
      
      if (missingColumns.length > 0) {
        errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
        console.log(`   ❌ Missing columns: ${missingColumns.join(', ')}\n`);
      } else {
        console.log('   ✅ All required columns present\n');
      }
    } catch (err) {
      errors.push(`Schema validation failed: ${err.message}`);
    }
    
    // ========================================
    // Check 3: Required Fields
    // ========================================
    console.log('🔍 Check 3: Required Fields');
    for (const field of VALIDATION_RULES.REQUIRED_FIELDS) {
      try {
        const [rows] = await conn.execute(
          `SELECT COUNT(*) as count FROM source_registry WHERE ${field} IS NULL OR ${field} = ''`
        );
        const nullCount = rows[0].count;
        
        if (nullCount > 0) {
          errors.push(`${nullCount} rows have null/empty ${field}`);
          console.log(`   ❌ ${field}: ${nullCount} null/empty values`);
        } else {
          console.log(`   ✅ ${field}: all values present`);
        }
      } catch (err) {
        warnings.push(`Could not validate ${field}: ${err.message}`);
      }
    }
    console.log('');
    
    // ========================================
    // Check 4: Duplicate Source IDs
    // ========================================
    console.log('🔍 Check 4: Duplicate Source IDs');
    try {
      const [duplicates] = await conn.execute(
        'SELECT sourceId, COUNT(*) as count FROM source_registry GROUP BY sourceId HAVING count > 1'
      );
      
      if (duplicates.length > 0) {
        errors.push(`${duplicates.length} duplicate source IDs found`);
        console.log(`   ❌ Found ${duplicates.length} duplicates:`);
        duplicates.slice(0, 5).forEach(d => {
          console.log(`      - ${d.sourceId} (${d.count} occurrences)`);
        });
        if (duplicates.length > 5) {
          console.log(`      ... and ${duplicates.length - 5} more`);
        }
      } else {
        console.log('   ✅ No duplicate source IDs\n');
      }
    } catch (err) {
      errors.push(`Duplicate check failed: ${err.message}`);
    }
    console.log('');
    
    // ========================================
    // Check 5: Valid Tier Values
    // ========================================
    console.log('🔍 Check 5: Valid Tier Values');
    try {
      const [invalidTiers] = await conn.execute(
        `SELECT tier, COUNT(*) as count FROM source_registry 
         WHERE tier NOT IN (${VALIDATION_RULES.VALID_TIERS.map(t => `'${t}'`).join(',')})
         GROUP BY tier`
      );
      
      if (invalidTiers.length > 0) {
        errors.push(`Invalid tier values found`);
        console.log('   ❌ Invalid tier values:');
        invalidTiers.forEach(t => {
          console.log(`      - ${t.tier}: ${t.count} occurrences`);
        });
      } else {
        console.log('   ✅ All tier values valid\n');
      }
    } catch (err) {
      warnings.push(`Tier validation failed: ${err.message}`);
    }
    console.log('');
    
    // ========================================
    // Check 6: Valid Status Values
    // ========================================
    console.log('🔍 Check 6: Valid Status Values');
    try {
      const [invalidStatuses] = await conn.execute(
        `SELECT status, COUNT(*) as count FROM source_registry 
         WHERE status NOT IN (${VALIDATION_RULES.VALID_STATUSES.map(s => `'${s}'`).join(',')})
         GROUP BY status`
      );
      
      if (invalidStatuses.length > 0) {
        errors.push(`Invalid status values found`);
        console.log('   ❌ Invalid status values:');
        invalidStatuses.forEach(s => {
          console.log(`      - ${s.status}: ${s.count} occurrences`);
        });
      } else {
        console.log('   ✅ All status values valid\n');
      }
    } catch (err) {
      warnings.push(`Status validation failed: ${err.message}`);
    }
    console.log('');
    
    // ========================================
    // Check 7: Sector Mappings
    // ========================================
    console.log('🔍 Check 7: Sector Mappings');
    try {
      const [totalRows] = await conn.execute('SELECT COUNT(*) as count FROM source_registry');
      const total = totalRows[0].count;
      
      const [mappedRows] = await conn.execute(
        "SELECT COUNT(*) as count FROM source_registry WHERE sectorsFed IS NOT NULL AND sectorsFed != '[]' AND sectorsFed != ''"
      );
      const mapped = mappedRows[0].count;
      
      const mappedPct = total > 0 ? (mapped / total * 100).toFixed(1) : 0;
      
      if (parseFloat(mappedPct) < VALIDATION_RULES.MIN_MAPPED_SOURCES) {
        warnings.push(`Only ${mappedPct}% of sources have sector mappings (min: ${VALIDATION_RULES.MIN_MAPPED_SOURCES}%)`);
        console.log(`   ⚠️  Mapped sources: ${mappedPct}% (min: ${VALIDATION_RULES.MIN_MAPPED_SOURCES}%)\n`);
      } else {
        console.log(`   ✅ Mapped sources: ${mappedPct}%\n`);
      }
    } catch (err) {
      warnings.push(`Sector mapping check failed: ${err.message}`);
    }
    
    // ========================================
    // Check 8: Referential Integrity with sector_codebook
    // ========================================
    console.log('🔍 Check 8: Sector Codebook Integrity');
    try {
      const [sectorCount] = await conn.execute('SELECT COUNT(*) as count FROM sector_codebook');
      const sectors = sectorCount[0].count;
      
      if (sectors < 15) {
        warnings.push(`Only ${sectors} sectors in codebook (expected: 15+)`);
        console.log(`   ⚠️  Sectors in codebook: ${sectors} (expected: 15+)\n`);
      } else {
        console.log(`   ✅ Sectors in codebook: ${sectors}\n`);
      }
    } catch (err) {
      warnings.push(`Sector codebook check failed: ${err.message}`);
    }
    
    // ========================================
    // Check 9: Data Quality Scores
    // ========================================
    console.log('🔍 Check 9: Data Quality Scores');
    try {
      const [nullScores] = await conn.execute(
        "SELECT COUNT(*) as count FROM source_registry WHERE reliabilityScore IS NULL"
      );
      const nullCount = nullScores[0].count;
      
      const [totalRows] = await conn.execute('SELECT COUNT(*) as count FROM source_registry');
      const total = totalRows[0].count;
      
      const nullPct = total > 0 ? (nullCount / total * 100).toFixed(1) : 0;
      
      if (parseFloat(nullPct) > VALIDATION_RULES.MAX_NULL_PERCENTAGE) {
        warnings.push(`${nullPct}% of sources missing reliability scores`);
        console.log(`   ⚠️  Missing scores: ${nullPct}%\n`);
      } else {
        console.log(`   ✅ Missing scores: ${nullPct}%\n`);
      }
    } catch (err) {
      warnings.push(`Quality score check failed: ${err.message}`);
    }
    
    // ========================================
    // Check 10: Evidence Pack Flags
    // ========================================
    console.log('🔍 Check 10: Evidence Pack Flags');
    try {
      const [flaggedRows] = await conn.execute(
        "SELECT COUNT(*) as count FROM source_registry WHERE evidencePackFlag = TRUE OR evidencePackFlag = 1"
      );
      const flagged = flaggedRows[0].count;
      
      console.log(`   ℹ️  Sources with evidence packs: ${flagged}\n`);
    } catch (err) {
      warnings.push(`Evidence pack check failed: ${err.message}`);
    }
    
  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    errors.push(`Fatal error: ${err.message}`);
  } finally {
    if (conn) {
      await conn.end();
    }
  }
  
  // ========================================
  // Summary
  // ========================================
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                           SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ ALL CHECKS PASSED - Registry is clean\n');
    process.exit(0);
  }
  
  if (errors.length > 0) {
    console.log(`❌ ERRORS: ${errors.length}`);
    errors.forEach((err, idx) => {
      console.log(`   ${idx + 1}. ${err}`);
    });
    console.log('');
  }
  
  if (warnings.length > 0) {
    console.log(`⚠️  WARNINGS: ${warnings.length}`);
    warnings.forEach((warn, idx) => {
      console.log(`   ${idx + 1}. ${warn}`);
    });
    console.log('');
  }
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Registry Lint completed at ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  // Exit with error if there are any errors (warnings are okay)
  process.exit(errors.length > 0 ? 1 : 0);
}

runRegistryLint().catch(err => {
  console.error('Registry Lint Fatal Error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
