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
    const accessTypes = ['API', 'WEB', 'MANUAL', 'PARTNER'];
    
    for (let i = 1; i <= 320; i++) {
      const tier = tiers[i % 5];
      const accessType = accessTypes[i % 4];
      const status = i <= 240 ? 'ACTIVE' : 'PENDING_REVIEW';
      const sourceType = i % 3 === 0 ? 'official' : i % 3 === 1 ? 'research' : 'media';
      const sectorsFed = JSON.stringify(
        i % 5 === 0
          ? []
          : [i % 2 === 0 ? 'banking' : 'macroeconomy', i % 3 === 0 ? 'trade' : 'prices']
      );
      await connection.execute(
        `INSERT IGNORE INTO source_registry 
         (sourceId, name, tier, accessType, status, description, confidenceRating, sourceType, sectorsFed) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `src_${i}`,
          `Test Source ${i}`,
          tier,
          accessType,
          status,
          `Auto-classified as ${tier} based on publisher type`,
          ['A', 'B', 'C', 'D'][i % 4],
          sourceType,
          sectorsFed,
        ]
      );
    }
    console.log(`  ✅ Seeded 320 source_registry entries (240 ACTIVE)\n`);

    // ========================================================================
    // 2.1 SEED SECTOR_CODEBOOK (required by release gate)
    // ========================================================================
    console.log('🧭 Seeding sector_codebook...');
    const sectorCodebookRows = [
      ['S01', 'Macroeconomy', 'الاقتصاد الكلي'],
      ['S02', 'Banking', 'القطاع المصرفي'],
      ['S03', 'Prices & Inflation', 'الأسعار والتضخم'],
      ['S04', 'Trade & External', 'التجارة والقطاع الخارجي'],
      ['S05', 'Currency & FX', 'العملة وسعر الصرف'],
      ['S06', 'Public Finance', 'المالية العامة'],
      ['S07', 'Energy', 'الطاقة'],
      ['S08', 'Labor Market', 'سوق العمل'],
      ['S09', 'Food Security', 'الأمن الغذائي'],
      ['S10', 'Poverty', 'الفقر'],
      ['S11', 'Humanitarian', 'القطاع الإنساني'],
      ['S12', 'Infrastructure', 'البنية التحتية'],
      ['S13', 'Agriculture', 'الزراعة'],
      ['S14', 'Conflict Economics', 'اقتصاد الصراع'],
      ['S15', 'Private Sector', 'القطاع الخاص'],
      ['S16', 'Governance', 'الحوكمة'],
    ];
    for (const [sectorCode, sectorName, sectorNameAr] of sectorCodebookRows) {
      await connection.execute(
        `INSERT IGNORE INTO sector_codebook (sectorCode, sectorName, sectorNameAr, displayOrder, isActive)
         VALUES (?, ?, ?, ?, 1)`,
        [sectorCode, sectorName, sectorNameAr, Number(sectorCode.replace('S', ''))]
      );
    }
    console.log(`  ✅ Seeded ${sectorCodebookRows.length} sector codebook entries\n`);

    // ========================================================================
    // 2.2 SEED INDICATORS for sector data service tests
    // ========================================================================
    console.log('🧮 Seeding indicators...');
    const indicatorCatalog = [
      { code: 'IMF_CREDIT_TO_PRIVATE_SECTOR', nameEn: 'Credit to Private Sector', nameAr: 'الائتمان للقطاع الخاص', unit: 'YER bn', sector: 'banking' },
      { code: 'WB_BANK_BRANCHES_PER_100K', nameEn: 'Bank Branches per 100k Adults', nameAr: 'فروع البنوك لكل 100 ألف بالغ', unit: 'branches', sector: 'banking' },
      { code: 'IMF_GDP_GROWTH_REAL', nameEn: 'Real GDP Growth', nameAr: 'نمو الناتج المحلي الحقيقي', unit: 'percent', sector: 'macroeconomy' },
      { code: 'WB_GDP_PER_CAPITA_USD', nameEn: 'GDP per Capita', nameAr: 'الناتج المحلي للفرد', unit: 'USD', sector: 'macroeconomy' },
      { code: 'IMF_CPI_YOY', nameEn: 'Consumer Price Index YoY', nameAr: 'التضخم السنوي لأسعار المستهلك', unit: 'percent', sector: 'prices' },
      { code: 'WB_FOOD_PRICE_INDEX', nameEn: 'Food Price Index', nameAr: 'مؤشر أسعار الغذاء', unit: 'index', sector: 'prices' },
      { code: 'IMF_EXPORTS_GOODS_SERVICES', nameEn: 'Exports of Goods and Services', nameAr: 'صادرات السلع والخدمات', unit: 'USD mn', sector: 'trade' },
      { code: 'WB_IMPORTS_GOODS_SERVICES', nameEn: 'Imports of Goods and Services', nameAr: 'واردات السلع والخدمات', unit: 'USD mn', sector: 'trade' },
    ];
    for (const indicator of indicatorCatalog) {
      await connection.execute(
        `INSERT IGNORE INTO indicators
         (code, nameEn, nameAr, unit, sector, frequency, isActive)
         VALUES (?, ?, ?, ?, ?, 'monthly', 1)`,
        [indicator.code, indicator.nameEn, indicator.nameAr, indicator.unit, indicator.sector]
      );
    }
    console.log(`  ✅ Seeded ${indicatorCatalog.length} indicators\n`);
    
    // ========================================================================
    // 3. SEED TIME_SERIES with 600+ records
    // ========================================================================
    console.log('📈 Seeding time_series data...');
    
    const indicators = [
      { code: 'IMF_CREDIT_TO_PRIVATE_SECTOR', unit: 'YER bn' },
      { code: 'WB_BANK_BRANCHES_PER_100K', unit: 'branches' },
      { code: 'IMF_GDP_GROWTH_REAL', unit: 'percent' },
      { code: 'WB_GDP_PER_CAPITA_USD', unit: 'USD' },
      { code: 'IMF_CPI_YOY', unit: 'percent' },
      { code: 'WB_FOOD_PRICE_INDEX', unit: 'index' },
      { code: 'IMF_EXPORTS_GOODS_SERVICES', unit: 'USD mn' },
      { code: 'WB_IMPORTS_GOODS_SERVICES', unit: 'USD mn' },
    ];
    
    const regimes = ['aden_irg', 'sanaa_defacto', 'mixed'];
    const confidenceRatings = ['A', 'B', 'C', 'D'];
    
    let timeSeriesCount = 0;
    for (const indicator of indicators) {
      for (const regime of regimes) {
        // Generate 180 data points per indicator/regime combination (2010+ coverage)
        for (let month = 1; month <= 180; month++) {
          const year = 2010 + Math.floor((month - 1) / 12);
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
    
    const pubTypes = ['research_paper', 'working_paper', 'policy_brief', 'technical_note', 'case_study'];
    const researchCategories = ['macroeconomic_analysis', 'banking_sector', 'monetary_policy', 'fiscal_policy', 'trade_external', 'humanitarian_finance'];
    
    for (let i = 1; i <= 120; i++) {
      const pubType = pubTypes[i % 5];
      const researchCategory = researchCategories[i % 6];
      const year = 2018 + (i % 7);
      
      await connection.execute(
        `INSERT IGNORE INTO research_publications 
         (title, titleAr, publicationType, researchCategory, publicationYear, sourceUrl, abstract) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          `Yemen Economic Analysis Report ${i}`,
          `تقرير تحليل اقتصادي يمني ${i}`,
          pubType,
          researchCategory,
          year,
          `https://example.org/publications/${i}`,
          `Analysis of Yemen economic conditions in ${year} focusing on ${researchCategory}.`
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
      const geoScope = kpi.regime === 'mixed' ? 'National' : kpi.regime === 'aden_irg' ? 'Southern Yemen' : 'Northern Yemen';
      
      await connection.execute(
        `INSERT IGNORE INTO evidence_packs 
         (subjectId, subjectType, subjectLabel, citations, regimeTags, geoScope, 
          dqafIntegrity, dqafMethodology, dqafAccuracyReliability, dqafServiceability, dqafAccessibility) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          subjectId,
          'metric',
          `Evidence pack for ${kpi.code}`,
          JSON.stringify([{ sourceId: 1, title: 'World Bank Data', publisher: 'World Bank', url: 'https://data.worldbank.org', retrievalDate: '2024-01-15', licenseFlag: 'CC-BY-4.0' }]),
          JSON.stringify([kpi.regime]),
          geoScope,
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
