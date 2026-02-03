/**
 * YETO CI Database Seed Script
 * 
 * Seeds the minimum required data for CI tests to pass.
 * This script is designed to run quickly in CI environments.
 * 
 * Required data for failing tests:
 * 1. source_registry with classification columns and tier data
 * 2. time_series with 500+ records, sourceId, confidenceRating, regimeTag
 * 3. research_publications with 100+ records
 * 4. economic_events with 50+ records
 * 5. evidence_packs for Dashboard KPIs
 * 6. sources table with valid publishers
 */

import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

function parseDbUrl(url) {
  const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
  if (!match) {
    throw new Error('Invalid DATABASE_URL format');
  }
  const config = {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4]),
    database: match[5],
  };
  
  // Add SSL for TiDB Cloud (production) but not for local MySQL (CI)
  if (config.host.includes('tidb') || config.host.includes('gateway')) {
    config.ssl = { rejectUnauthorized: true };
  }
  
  return config;
}

async function seedCI() {
  console.log('🌱 Starting CI database seed...\n');
  
  const config = parseDbUrl(DATABASE_URL);
  const connection = await mysql.createConnection(config);
  
  try {
    // ========================================================================
    // 1. SEED SOURCES (required for time_series foreign key)
    // ========================================================================
    console.log('📚 Seeding sources...');
    
    const sourcesData = [
      { publisher: 'Central Bank of Yemen - Aden', url: 'https://cby-ye.com', license: 'Government' },
      { publisher: 'Central Bank of Yemen - Sanaa', url: 'https://centralbank.gov.ye', license: 'Government' },
      { publisher: 'World Bank', url: 'https://data.worldbank.org', license: 'CC-BY-4.0' },
      { publisher: 'IMF', url: 'https://imf.org', license: 'IMF Terms' },
      { publisher: 'UN OCHA', url: 'https://unocha.org', license: 'UN Terms' },
      { publisher: 'WFP', url: 'https://wfp.org', license: 'UN Terms' },
      { publisher: 'Sanaa Center', url: 'https://sanaacenter.org', license: 'CC-BY-NC' },
    ];
    
    for (const source of sourcesData) {
      await connection.execute(
        `INSERT IGNORE INTO sources (publisher, url, license, retrievalDate) VALUES (?, ?, ?, NOW())`,
        [source.publisher, source.url, source.license]
      );
    }
    console.log(`  ✅ Seeded ${sourcesData.length} sources\n`);
    
    // ========================================================================
    // 2. SEED SOURCE_REGISTRY with classification data (100+ classified sources)
    // ========================================================================
    console.log('📋 Seeding source_registry with classification data...');
    
    const tiers = ['T0', 'T1', 'T2', 'T3', 'T4'];
    const sourceTypes = ['API', 'SCRAPE', 'MANUAL', 'PARTNER'];
    
    for (let i = 1; i <= 150; i++) {
      const tier = tiers[i % 5];
      const sourceType = sourceTypes[i % 4];
      await connection.execute(
        `INSERT IGNORE INTO source_registry 
         (sourceId, name, tier, sourceType, tierClassificationSuggested, tierClassificationReason, tierClassificationConfidence, requiresHumanReview, classificationMatchedRule) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `src_${i}`,
          `Test Source ${i}`,
          tier,
          sourceType,
          tier,
          `Auto-classified as ${tier} based on publisher type`,
          0.85 + (Math.random() * 0.1),
          i % 10 === 0 ? 1 : 0,
          `rule_${tier.toLowerCase()}_default`
        ]
      );
    }
    console.log(`  ✅ Seeded 150 source_registry entries\n`);
    
    // ========================================================================
    // 3. SEED TIME_SERIES with 600+ records
    // ========================================================================
    console.log('📈 Seeding time_series data...');
    
    const indicators = [
      { code: 'FX_RATE_PARALLEL', unit: 'YER/USD' },
      { code: 'INFLATION_CPI', unit: 'percent' },
      { code: 'GDP_GROWTH', unit: 'percent' },
      { code: 'UNEMPLOYMENT_RATE', unit: 'percent' },
      { code: 'FOOD_PRICE_INDEX', unit: 'index' },
      { code: 'OIL_PRODUCTION', unit: 'bpd' },
    ];
    
    const regimes = ['aden_irg', 'sanaa_defacto', 'mixed'];
    const confidenceRatings = ['A', 'B', 'C', 'D'];
    
    let timeSeriesCount = 0;
    for (const indicator of indicators) {
      for (const regime of regimes) {
        // Generate 40 data points per indicator/regime combination
        for (let month = 1; month <= 40; month++) {
          const year = 2020 + Math.floor((month - 1) / 12);
          const monthNum = ((month - 1) % 12) + 1;
          const date = `${year}-${String(monthNum).padStart(2, '0')}-15`;
          const value = (100 + Math.random() * 50).toFixed(2);
          const sourceId = (month % 7) + 1;
          const confidence = confidenceRatings[month % 4];
          
          await connection.execute(
            `INSERT IGNORE INTO time_series 
             (indicatorCode, regimeTag, date, value, unit, confidenceRating, sourceId) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [indicator.code, regime, date, value, indicator.unit, confidence, sourceId]
          );
          timeSeriesCount++;
        }
      }
    }
    console.log(`  ✅ Seeded ${timeSeriesCount} time_series records\n`);
    
    // ========================================================================
    // 4. SEED RESEARCH_PUBLICATIONS with 120+ records
    // ========================================================================
    console.log('📄 Seeding research_publications...');
    
    const pubTypes = ['report', 'article', 'brief', 'analysis', 'dataset'];
    const sectors = ['macro', 'currency', 'trade', 'banking', 'humanitarian', 'food_security'];
    
    for (let i = 1; i <= 120; i++) {
      const pubType = pubTypes[i % 5];
      const sector = sectors[i % 6];
      const year = 2018 + (i % 7);
      
      await connection.execute(
        `INSERT IGNORE INTO research_publications 
         (title, titleAr, publicationType, sector, publishDate, sourceId, url, abstract) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `Yemen Economic Analysis Report ${i}`,
          `تقرير تحليل اقتصادي يمني ${i}`,
          pubType,
          sector,
          `${year}-${String((i % 12) + 1).padStart(2, '0')}-01`,
          (i % 7) + 1,
          `https://example.org/publications/${i}`,
          `Analysis of Yemen economic conditions in ${year} focusing on ${sector} sector.`
        ]
      );
    }
    console.log(`  ✅ Seeded 120 research_publications\n`);
    
    // ========================================================================
    // 5. SEED ECONOMIC_EVENTS with 60+ records
    // ========================================================================
    console.log('📅 Seeding economic_events...');
    
    const eventCategories = ['monetary_policy', 'fiscal', 'trade', 'humanitarian', 'energy', 'banking'];
    const impactLevels = ['high', 'medium', 'low'];
    
    for (let i = 1; i <= 60; i++) {
      const category = eventCategories[i % 6];
      const impact = impactLevels[i % 3];
      const regime = regimes[i % 3];
      const year = 2018 + (i % 7);
      
      await connection.execute(
        `INSERT IGNORE INTO economic_events 
         (title, titleAr, description, descriptionAr, eventDate, regimeTag, category, impactLevel, sourceId) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `Economic Event ${i}: ${category} development`,
          `حدث اقتصادي ${i}: تطور ${category}`,
          `Description of economic event ${i} related to ${category} in Yemen.`,
          `وصف الحدث الاقتصادي ${i} المتعلق بـ ${category} في اليمن.`,
          `${year}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
          regime,
          category,
          impact,
          (i % 7) + 1
        ]
      );
    }
    console.log(`  ✅ Seeded 60 economic_events\n`);
    
    // ========================================================================
    // 6. SEED EVIDENCE_PACKS for Dashboard KPIs
    // ========================================================================
    console.log('🔍 Seeding evidence_packs for Dashboard KPIs...');
    
    const dashboardKPIs = [
      { code: 'inflation_cpi_aden', regime: 'aden_irg' },
      { code: 'inflation_cpi_sanaa', regime: 'sanaa_defacto' },
      { code: 'unemployment_rate', regime: 'mixed' },
      { code: 'fx_rate_aden_parallel', regime: 'aden_irg' },
      { code: 'fx_rate_sanaa', regime: 'sanaa_defacto' },
    ];
    
    for (const kpi of dashboardKPIs) {
      const subjectId = `${kpi.code}_${kpi.regime}`;
      
      await connection.execute(
        `INSERT IGNORE INTO evidence_packs 
         (subjectId, subjectType, confidenceGrade, confidenceExplanation, regimeTag, 
          citations, transforms, timeCoverage, geographicScope, dqafIntegrity, 
          dqafMethodology, dqafAccuracy, dqafServiceability, dqafAccessibility) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          subjectId,
          'metric',
          'B',
          `Evidence pack for ${kpi.code} with moderate confidence based on available sources.`,
          kpi.regime,
          JSON.stringify([{ source: 'World Bank', url: 'https://data.worldbank.org', page: 1 }]),
          JSON.stringify([{ type: 'aggregation', description: 'Monthly average' }]),
          JSON.stringify({ start: '2020-01-01', end: '2024-12-31' }),
          kpi.regime === 'mixed' ? 'National' : kpi.regime === 'aden_irg' ? 'Southern Yemen' : 'Northern Yemen',
          'pass',
          'pass',
          'needs_review',
          'pass',
          'pass'
        ]
      );
    }
    console.log(`  ✅ Seeded ${dashboardKPIs.length} evidence_packs for Dashboard KPIs\n`);
    
    console.log('🎉 CI database seeding completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Error seeding CI database:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

seedCI()
  .then(() => {
    console.log('✅ CI seed script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ CI seed script failed:', error);
    process.exit(1);
  });
