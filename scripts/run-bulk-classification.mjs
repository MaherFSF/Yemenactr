/**
 * Bulk Classification Script for YETO Source Registry
 * Runs deterministic tier classification on UNKNOWN tier sources
 */

import mysql from 'mysql2/promise';

// Tier classification rules (same as tierClassifier.ts)
const T0_PATTERNS = {
  organizations: [
    'world bank', 'imf', 'international monetary fund', 'un statistics', 'unsd',
    'central statistical organization', 'cso yemen', 'ministry of planning',
    'central bank of yemen', 'cby', 'world trade organization', 'wto',
    'bank for international settlements', 'bis', 'oecd', 'eurostat',
    'un comtrade', 'comtrade', 'wdi', 'world development indicators',
    'gfs', 'government finance statistics', 'bop', 'balance of payments',
    'ifs', 'international financial statistics', 'sdmx', 'dsd'
  ],
  keywords: ['official statistics', 'national accounts', 'gdp', 'balance of payments', 
             'government finance', 'monetary statistics', 'trade statistics']
};

const T1_PATTERNS = {
  organizations: [
    'ocha', 'unhcr', 'wfp', 'world food programme', 'unicef', 'who',
    'fao', 'food and agriculture', 'iom', 'undp', 'unops', 'unfpa',
    'hdx', 'humanitarian data exchange', 'reliefweb', 'fts', 'financial tracking',
    'iati', 'aid transparency', 'aiddata', 'acaps', 'reach initiative',
    'cluster', 'protection cluster', 'food security cluster', 'wash cluster',
    'european union', 'eu', 'european commission', 'usaid', 'dfid', 'giz',
    'afdb', 'african development bank', 'isdb', 'islamic development bank',
    'arab monetary fund', 'amf', 'gcc stat', 'escwa'
  ],
  keywords: ['humanitarian', 'aid', 'displacement', 'refugee', 'food security',
             'nutrition', 'health', 'protection', 'wash', 'shelter', 'education']
};

const T2_PATTERNS = {
  organizations: [
    'brookings', 'carnegie', 'chatham house', 'csis', 'rand', 'iiss',
    'crisis group', 'international crisis group', 'sanaa center', 'sana\'a center',
    'yemen policy center', 'deep root', 'rethinking yemen', 'acled',
    'armed conflict', 'sipri', 'iep', 'institute for economics and peace',
    'transparency international', 'freedom house', 'heritage foundation',
    'world economic forum', 'wef', 'mckinsey', 'oxford', 'cambridge',
    'harvard', 'mit', 'stanford', 'lse', 'soas', 'american university',
    'cmi', 'chr. michelsen', 'prio', 'diis', 'odi', 'cgdev', 'ifpri',
    'economist intelligence unit', 'eiu', 'fitch', 'moody', 's&p'
  ],
  keywords: ['research', 'analysis', 'study', 'report', 'working paper',
             'policy brief', 'assessment', 'evaluation', 'academic']
};

const T3_PATTERNS = {
  organizations: [
    'reuters', 'afp', 'ap news', 'associated press', 'bbc', 'al jazeera',
    'al arabiya', 'sky news', 'cnn', 'guardian', 'new york times', 'washington post',
    'financial times', 'economist', 'bloomberg', 'wall street journal',
    'middle east eye', 'al-monitor', 'arab news', 'gulf news',
    'yemen times', 'saba news', 'al-masdar', 'al-sahwa', 'mareb press',
    'belqees tv', 'yemen shabab', 'al-ayyam'
  ],
  keywords: ['news', 'media', 'press', 'journalism', 'breaking', 'report',
             'coverage', 'correspondent', 'editorial']
};

const T4_PATTERNS = {
  licenseStates: ['restricted', 'paywalled', 'subscription'],
  keywords: ['subscription required', 'members only', 'premium', 'paywall',
             'restricted access', 'confidential', 'proprietary']
};

function classifySource(source) {
  const nameLower = (source.name || '').toLowerCase();
  const descLower = (source.description || '').toLowerCase();
  const urlLower = (source.url || '').toLowerCase();
  const combined = `${nameLower} ${descLower} ${urlLower}`;
  const sourceType = (source.sourceType || '').toUpperCase();
  const licenseState = (source.licenseState || '').toLowerCase();

  // Rule 1: Check for T4 (restricted/paywalled) first
  if (T4_PATTERNS.licenseStates.includes(licenseState)) {
    return {
      tier: 'T4',
      reason: `License state is ${licenseState} - requires access approval`,
      confidence: 0.95,
      requiresReview: false,
      rule: 'LICENSE_STATE_RESTRICTED'
    };
  }

  for (const keyword of T4_PATTERNS.keywords) {
    if (combined.includes(keyword)) {
      return {
        tier: 'T4',
        reason: `Contains restricted keyword: "${keyword}"`,
        confidence: 0.85,
        requiresReview: true,
        rule: 'RESTRICTED_KEYWORD'
      };
    }
  }

  // Rule 2: Check for T0 (official statistical authorities)
  for (const org of T0_PATTERNS.organizations) {
    if (combined.includes(org)) {
      return {
        tier: 'T0',
        reason: `Matches T0 organization: "${org}" - official statistical authority`,
        confidence: 0.95,
        requiresReview: false,
        rule: 'T0_ORGANIZATION'
      };
    }
  }

  // Rule 3: Check for T3 (media) based on sourceType
  if (sourceType === 'MEDIA') {
    return {
      tier: 'T3',
      reason: 'Source type is MEDIA - EVENT_DETECTION only',
      confidence: 0.95,
      requiresReview: false,
      rule: 'MEDIA_SOURCE_TYPE'
    };
  }

  for (const org of T3_PATTERNS.organizations) {
    if (combined.includes(org)) {
      return {
        tier: 'T3',
        reason: `Matches T3 media organization: "${org}" - EVENT_DETECTION only`,
        confidence: 0.90,
        requiresReview: false,
        rule: 'T3_ORGANIZATION'
      };
    }
  }

  // Rule 4: Check for T1 (multilateral/UN operational)
  for (const org of T1_PATTERNS.organizations) {
    if (combined.includes(org)) {
      return {
        tier: 'T1',
        reason: `Matches T1 organization: "${org}" - reputable multilateral/UN`,
        confidence: 0.90,
        requiresReview: false,
        rule: 'T1_ORGANIZATION'
      };
    }
  }

  // Rule 5: Check for T2 (research/think tanks)
  for (const org of T2_PATTERNS.organizations) {
    if (combined.includes(org)) {
      return {
        tier: 'T2',
        reason: `Matches T2 organization: "${org}" - research institution`,
        confidence: 0.85,
        requiresReview: false,
        rule: 'T2_ORGANIZATION'
      };
    }
  }

  // Rule 6: Check keywords for tier hints
  for (const keyword of T0_PATTERNS.keywords) {
    if (combined.includes(keyword)) {
      return {
        tier: 'T0',
        reason: `Contains T0 keyword: "${keyword}" - likely official statistics`,
        confidence: 0.75,
        requiresReview: true,
        rule: 'T0_KEYWORD'
      };
    }
  }

  for (const keyword of T1_PATTERNS.keywords) {
    if (combined.includes(keyword)) {
      return {
        tier: 'T1',
        reason: `Contains T1 keyword: "${keyword}" - likely humanitarian/operational`,
        confidence: 0.70,
        requiresReview: true,
        rule: 'T1_KEYWORD'
      };
    }
  }

  for (const keyword of T2_PATTERNS.keywords) {
    if (combined.includes(keyword)) {
      return {
        tier: 'T2',
        reason: `Contains T2 keyword: "${keyword}" - likely research`,
        confidence: 0.65,
        requiresReview: true,
        rule: 'T2_KEYWORD'
      };
    }
  }

  // Rule 7: Check sourceType as fallback
  if (sourceType === 'ACADEMIA') {
    return {
      tier: 'T2',
      reason: 'Source type is ACADEMIA - classified as research',
      confidence: 0.80,
      requiresReview: false,
      rule: 'ACADEMIA_SOURCE_TYPE'
    };
  }

  if (sourceType === 'RESEARCH') {
    return {
      tier: 'T2',
      reason: 'Source type is RESEARCH - classified as research',
      confidence: 0.75,
      requiresReview: true,
      rule: 'RESEARCH_SOURCE_TYPE'
    };
  }

  if (sourceType === 'COMPLIANCE') {
    return {
      tier: 'T1',
      reason: 'Source type is COMPLIANCE - classified as official/regulatory',
      confidence: 0.70,
      requiresReview: true,
      rule: 'COMPLIANCE_SOURCE_TYPE'
    };
  }

  // Rule 8: Unknown license state with DATA type
  if (licenseState === 'unknown' && sourceType === 'DATA') {
    return {
      tier: 'T1',
      reason: 'DATA source with unknown license - likely operational data',
      confidence: 0.60,
      requiresReview: true,
      rule: 'DATA_UNKNOWN_LICENSE'
    };
  }

  // Default: Cannot classify with confidence
  return {
    tier: 'UNKNOWN',
    reason: 'No matching classification rules - requires human review',
    confidence: 0.0,
    requiresReview: true,
    rule: 'NO_MATCH'
  };
}

async function runBulkClassification() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║         YETO Bulk Classification Engine v1.0                 ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  // Get current tier distribution
  const [beforeTiers] = await conn.query(`
    SELECT tier, COUNT(*) as count 
    FROM source_registry 
    GROUP BY tier 
    ORDER BY count DESC
  `);
  
  console.log('\n📊 BEFORE Classification:');
  for (const row of beforeTiers) {
    console.log(`   ${row.tier || 'NULL'}: ${row.count}`);
  }
  
  // Get UNKNOWN tier sources
  const [unknownSources] = await conn.query(`
    SELECT id, sourceId, name, sourceType, licenseState, webUrl as url, description, tier
    FROM source_registry 
    WHERE tier = 'UNKNOWN' OR tier IS NULL
  `);
  
  console.log(`\n🔍 Found ${unknownSources.length} UNKNOWN tier sources to classify`);
  
  const results = {
    total: unknownSources.length,
    classified: 0,
    requiresReview: 0,
    byTier: {},
    byRule: {}
  };
  
  // Classify each source
  for (const source of unknownSources) {
    const classification = classifySource(source);
    
    results.byTier[classification.tier] = (results.byTier[classification.tier] || 0) + 1;
    results.byRule[classification.rule] = (results.byRule[classification.rule] || 0) + 1;
    
    if (classification.tier !== 'UNKNOWN') {
      results.classified++;
    }
    if (classification.requiresReview) {
      results.requiresReview++;
    }
    
    // Update database
    await conn.query(`
      UPDATE source_registry SET
        tierClassificationSuggested = ?,
        tierClassificationReason = ?,
        tierClassificationConfidence = ?,
        requiresHumanReview = ?,
        classificationMatchedRule = ?,
        classifiedAt = NOW(),
        classifiedBy = 'BULK_CLASSIFIER_v1',
        previousTier = tier,
        tier = CASE WHEN ? >= 0.85 THEN ? ELSE tier END
      WHERE id = ?
    `, [
      classification.tier,
      classification.reason,
      classification.confidence,
      classification.requiresReview ? 1 : 0,
      classification.rule,
      classification.confidence,
      classification.tier,
      source.id
    ]);
  }
  
  console.log('\n✅ Classification Results:');
  console.log(`   Total processed: ${results.total}`);
  console.log(`   Successfully classified: ${results.classified}`);
  console.log(`   Requires human review: ${results.requiresReview}`);
  
  console.log('\n📊 Classification by Tier:');
  for (const [tier, count] of Object.entries(results.byTier)) {
    console.log(`   ${tier}: ${count}`);
  }
  
  console.log('\n📋 Classification by Rule:');
  for (const [rule, count] of Object.entries(results.byRule)) {
    console.log(`   ${rule}: ${count}`);
  }
  
  // Get new tier distribution
  const [afterTiers] = await conn.query(`
    SELECT tier, COUNT(*) as count 
    FROM source_registry 
    GROUP BY tier 
    ORDER BY count DESC
  `);
  
  console.log('\n📊 AFTER Classification:');
  for (const row of afterTiers) {
    console.log(`   ${row.tier || 'NULL'}: ${row.count}`);
  }
  
  // Calculate unknown percentage
  const [totalCount] = await conn.query('SELECT COUNT(*) as total FROM source_registry');
  const [unknownCount] = await conn.query("SELECT COUNT(*) as count FROM source_registry WHERE tier = 'UNKNOWN' OR tier IS NULL");
  const unknownPct = (unknownCount[0].count / totalCount[0].total * 100).toFixed(1);
  
  console.log(`\n📈 Unknown Tier Percentage: ${unknownPct}% (target: <50%)`);
  
  if (parseFloat(unknownPct) < 50) {
    console.log('✅ TARGET ACHIEVED: Unknown tier is below 50%');
  } else {
    console.log('⚠️  TARGET NOT MET: Unknown tier still above 50%');
  }
  
  await conn.end();
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('Bulk classification completed at', new Date().toISOString());
  console.log('═══════════════════════════════════════════════════════════════');
}

runBulkClassification().catch(console.error);
