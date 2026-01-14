/**
 * YETO Truth Layer Seed Script
 * 
 * Seeds evidence sources and banking claims to activate the Truth Layer
 * This creates the provenance foundation for all banking data
 */

import mysql from 'mysql2/promise';

// Trusted evidence sources for Yemen economic data
// Using actual table columns: name, nameAr, acronym, category, isWhitelisted, trustLevel, baseUrl, notes
const evidenceSources = [
  {
    name: 'Central Bank of Yemen - Aden',
    nameAr: 'البنك المركزي اليمني - عدن',
    acronym: 'CBY-Aden',
    category: 'domestic_aden',
    trustLevel: 'high',
    baseUrl: 'https://english.cby-ye.com',
    notes: 'Official monetary authority for internationally recognized government',
  },
  {
    name: 'Central Bank of Yemen - Sanaa',
    nameAr: 'البنك المركزي اليمني - صنعاء',
    acronym: 'CBY-Sanaa',
    category: 'domestic_sanaa',
    trustLevel: 'medium',
    baseUrl: 'https://www.centralbank.gov.ye',
    notes: 'De facto monetary authority in Houthi-controlled areas',
  },
  {
    name: 'World Bank',
    nameAr: 'البنك الدولي',
    acronym: 'WB',
    category: 'ifi',
    trustLevel: 'high',
    baseUrl: 'https://www.worldbank.org/en/country/yemen',
    notes: 'International financial institution with Yemen country office',
  },
  {
    name: 'International Monetary Fund',
    nameAr: 'صندوق النقد الدولي',
    acronym: 'IMF',
    category: 'ifi',
    trustLevel: 'high',
    baseUrl: 'https://www.imf.org/en/Countries/YEM',
    notes: 'Article IV consultations and technical assistance',
  },
  {
    name: 'OFAC - US Treasury',
    nameAr: 'مكتب مراقبة الأصول الأجنبية',
    acronym: 'OFAC',
    category: 'sanctions',
    trustLevel: 'high',
    baseUrl: 'https://ofac.treasury.gov',
    notes: 'Official sanctions designations and general licenses',
  },
  {
    name: 'UN OCHA',
    nameAr: 'مكتب الأمم المتحدة لتنسيق الشؤون الإنسانية',
    acronym: 'OCHA',
    category: 'un_agency',
    trustLevel: 'high',
    baseUrl: 'https://www.unocha.org/yemen',
    notes: 'Humanitarian coordination and response data',
  },
  {
    name: 'CEIC Data',
    nameAr: 'بيانات CEIC',
    acronym: 'CEIC',
    category: 'other',
    trustLevel: 'medium',
    baseUrl: 'https://www.ceicdata.com',
    notes: 'Commercial economic data provider',
  },
  {
    name: 'Yemen Bank Annual Reports',
    nameAr: 'التقارير السنوية للبنوك اليمنية',
    acronym: 'YBAR',
    category: 'domestic_aden',
    trustLevel: 'medium',
    baseUrl: null,
    notes: 'Individual bank annual reports and financial statements',
  },
];

// Sample banking claims with evidence - using actual table columns
const bankingClaims = [
  {
    id: crypto.randomUUID(),
    claimType: 'metric_value',
    subjectType: 'indicator',
    subjectId: 'banking_total_assets',
    subjectLabel: 'Yemen Banking Sector Total Assets',
    subjectLabelAr: 'إجمالي أصول القطاع المصرفي اليمني',
    predicate: 'equals',
    objectValue: 18670,
    objectUnit: 'USD_millions',
    geography: 'yemen_national',
    regimeTag: 'mixed',
    asOfDate: '2024-12-31',
    confidenceGrade: 'B',
    confidenceRationale: 'Total banking sector assets as of Q4 2024 from CBY-Aden reports',
  },
  {
    id: crypto.randomUUID(),
    claimType: 'metric_value',
    subjectType: 'indicator',
    subjectId: 'banking_licensed_banks',
    subjectLabel: 'Total Licensed Banks',
    subjectLabelAr: 'إجمالي البنوك المرخصة',
    predicate: 'equals',
    objectValue: 31,
    objectUnit: 'count',
    geography: 'yemen_national',
    regimeTag: 'aden_irg',
    asOfDate: '2024-10-01',
    confidenceGrade: 'A',
    confidenceRationale: 'CBY-Aden licensed banks list 2024 - official source',
  },
  {
    id: crypto.randomUUID(),
    claimType: 'metric_value',
    subjectType: 'indicator',
    subjectId: 'banking_npl_ratio',
    subjectLabel: 'Average NPL Ratio',
    subjectLabelAr: 'متوسط نسبة القروض المتعثرة',
    predicate: 'estimated_at',
    objectValue: 35.2,
    objectUnit: 'percent',
    geography: 'yemen_national',
    regimeTag: 'mixed',
    asOfDate: '2024-06-30',
    confidenceGrade: 'C',
    confidenceRationale: 'World Bank Yemen Economic Monitor estimate - significant uncertainty',
  },
  {
    id: crypto.randomUUID(),
    claimType: 'event_statement',
    subjectType: 'entity',
    subjectId: 'bank_iby',
    subjectLabel: 'International Bank of Yemen',
    subjectLabelAr: 'البنك الدولي اليمني',
    predicate: 'announced',
    objectText: 'OFAC SDN Designation',
    geography: 'yemen_national',
    regimeTag: 'sanaa_defacto',
    asOfDate: '2025-04-17',
    confidenceGrade: 'A',
    confidenceRationale: 'OFAC SDN designation April 17, 2025 - official US Treasury source',
  },
  {
    id: crypto.randomUUID(),
    claimType: 'event_statement',
    subjectType: 'entity',
    subjectId: 'bank_ykb',
    subjectLabel: 'Yemen Kuwait Bank',
    subjectLabelAr: 'بنك اليمن والكويت',
    predicate: 'announced',
    objectText: 'OFAC SDN Designation',
    geography: 'yemen_national',
    regimeTag: 'sanaa_defacto',
    asOfDate: '2025-01-17',
    confidenceGrade: 'A',
    confidenceRationale: 'OFAC SDN designation January 17, 2025 - official US Treasury source',
  },
  {
    id: crypto.randomUUID(),
    claimType: 'metric_value',
    subjectType: 'entity',
    subjectId: 'cby_aden',
    subjectLabel: 'CBY-Aden Foreign Reserves',
    subjectLabelAr: 'احتياطيات البنك المركزي عدن',
    predicate: 'estimated_at',
    objectValue: 1200,
    objectUnit: 'USD_millions',
    geography: 'aden',
    regimeTag: 'aden_irg',
    asOfDate: '2024-12-31',
    confidenceGrade: 'C',
    confidenceRationale: 'IMF Article IV estimate - significant uncertainty due to limited data access',
  },
];

// Coverage cells for banking sector - using actual table columns
const coverageCells = [
  { year: 2010, sector: 'banking', governorate: 'national', totalExpectedItems: 20, totalAvailableItems: 15, coverageScore: 75.00, indicatorsCovered: 10, indicatorsExpected: 12, eventsCovered: 3, eventsExpected: 4, documentsCovered: 2, documentsExpected: 4, evidenceCount: 15 },
  { year: 2011, sector: 'banking', governorate: 'national', totalExpectedItems: 20, totalAvailableItems: 12, coverageScore: 60.00, indicatorsCovered: 8, indicatorsExpected: 12, eventsCovered: 2, eventsExpected: 4, documentsCovered: 2, documentsExpected: 4, evidenceCount: 12 },
  { year: 2012, sector: 'banking', governorate: 'national', totalExpectedItems: 20, totalAvailableItems: 14, coverageScore: 70.00, indicatorsCovered: 9, indicatorsExpected: 12, eventsCovered: 3, eventsExpected: 4, documentsCovered: 2, documentsExpected: 4, evidenceCount: 14 },
  { year: 2013, sector: 'banking', governorate: 'national', totalExpectedItems: 20, totalAvailableItems: 16, coverageScore: 80.00, indicatorsCovered: 10, indicatorsExpected: 12, eventsCovered: 4, eventsExpected: 4, documentsCovered: 2, documentsExpected: 4, evidenceCount: 16 },
  { year: 2014, sector: 'banking', governorate: 'national', totalExpectedItems: 20, totalAvailableItems: 18, coverageScore: 90.00, indicatorsCovered: 11, indicatorsExpected: 12, eventsCovered: 4, eventsExpected: 4, documentsCovered: 3, documentsExpected: 4, evidenceCount: 18 },
  { year: 2015, sector: 'banking', governorate: 'national', totalExpectedItems: 20, totalAvailableItems: 8, coverageScore: 40.00, indicatorsCovered: 5, indicatorsExpected: 12, eventsCovered: 2, eventsExpected: 4, documentsCovered: 1, documentsExpected: 4, evidenceCount: 8 },
  { year: 2016, sector: 'banking', governorate: 'national', totalExpectedItems: 20, totalAvailableItems: 6, coverageScore: 30.00, indicatorsCovered: 4, indicatorsExpected: 12, eventsCovered: 1, eventsExpected: 4, documentsCovered: 1, documentsExpected: 4, evidenceCount: 6 },
  { year: 2017, sector: 'banking', governorate: 'national', totalExpectedItems: 20, totalAvailableItems: 7, coverageScore: 35.00, indicatorsCovered: 5, indicatorsExpected: 12, eventsCovered: 1, eventsExpected: 4, documentsCovered: 1, documentsExpected: 4, evidenceCount: 7 },
  { year: 2018, sector: 'banking', governorate: 'national', totalExpectedItems: 20, totalAvailableItems: 9, coverageScore: 45.00, indicatorsCovered: 6, indicatorsExpected: 12, eventsCovered: 2, eventsExpected: 4, documentsCovered: 1, documentsExpected: 4, evidenceCount: 9 },
  { year: 2019, sector: 'banking', governorate: 'national', totalExpectedItems: 20, totalAvailableItems: 10, coverageScore: 50.00, indicatorsCovered: 7, indicatorsExpected: 12, eventsCovered: 2, eventsExpected: 4, documentsCovered: 1, documentsExpected: 4, evidenceCount: 10 },
  { year: 2020, sector: 'banking', governorate: 'national', totalExpectedItems: 20, totalAvailableItems: 11, coverageScore: 55.00, indicatorsCovered: 7, indicatorsExpected: 12, eventsCovered: 2, eventsExpected: 4, documentsCovered: 2, documentsExpected: 4, evidenceCount: 11 },
  { year: 2021, sector: 'banking', governorate: 'national', totalExpectedItems: 20, totalAvailableItems: 12, coverageScore: 60.00, indicatorsCovered: 8, indicatorsExpected: 12, eventsCovered: 2, eventsExpected: 4, documentsCovered: 2, documentsExpected: 4, evidenceCount: 12 },
  { year: 2022, sector: 'banking', governorate: 'national', totalExpectedItems: 20, totalAvailableItems: 18, coverageScore: 90.00, indicatorsCovered: 11, indicatorsExpected: 12, eventsCovered: 4, eventsExpected: 4, documentsCovered: 3, documentsExpected: 4, evidenceCount: 20 },
  { year: 2023, sector: 'banking', governorate: 'national', totalExpectedItems: 20, totalAvailableItems: 19, coverageScore: 95.00, indicatorsCovered: 12, indicatorsExpected: 12, eventsCovered: 4, eventsExpected: 4, documentsCovered: 3, documentsExpected: 4, evidenceCount: 25 },
  { year: 2024, sector: 'banking', governorate: 'national', totalExpectedItems: 20, totalAvailableItems: 20, coverageScore: 100.00, indicatorsCovered: 12, indicatorsExpected: 12, eventsCovered: 4, eventsExpected: 4, documentsCovered: 4, documentsExpected: 4, evidenceCount: 30 },
  { year: 2025, sector: 'banking', governorate: 'national', totalExpectedItems: 20, totalAvailableItems: 10, coverageScore: 50.00, indicatorsCovered: 6, indicatorsExpected: 12, eventsCovered: 2, eventsExpected: 4, documentsCovered: 2, documentsExpected: 4, evidenceCount: 15 },
];

async function seedTruthLayer() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL!);
  
  console.log('🔬 Starting Truth Layer seed...\n');
  
  // Seed evidence sources
  console.log('📚 Seeding evidence sources...');
  await conn.execute('DELETE FROM evidence_sources');
  
  for (const source of evidenceSources) {
    await conn.execute(`
      INSERT INTO evidence_sources (name, nameAr, acronym, category, trustLevel, baseUrl, notes, isWhitelisted)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `, [
      source.name,
      source.nameAr,
      source.acronym,
      source.category,
      source.trustLevel,
      source.baseUrl,
      source.notes,
    ]);
    console.log(`  ✓ ${source.name}`);
  }
  
  // Seed claims
  console.log('\n📋 Seeding banking claims...');
  await conn.execute('DELETE FROM claims');
  
  for (const claim of bankingClaims) {
    await conn.execute(`
      INSERT INTO claims (id, claimType, subjectType, subjectId, subjectLabel, subjectLabelAr, predicate, objectValue, objectText, objectUnit, geography, regimeTag, asOfDate, confidenceGrade, confidenceRationale, conflictStatus, visibility, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'none', 'public', 'system_ingestion')
    `, [
      claim.id,
      claim.claimType,
      claim.subjectType,
      claim.subjectId,
      claim.subjectLabel,
      claim.subjectLabelAr,
      claim.predicate,
      claim.objectValue || null,
      claim.objectText || null,
      claim.objectUnit || null,
      claim.geography,
      claim.regimeTag,
      claim.asOfDate,
      claim.confidenceGrade,
      claim.confidenceRationale,
    ]);
    console.log(`  ✓ ${claim.subjectLabel} = ${claim.objectValue || claim.objectText}`);
  }
  
  // Seed coverage cells
  console.log('\n📊 Seeding coverage cells...');
  await conn.execute('DELETE FROM coverage_cells');
  
  for (const cell of coverageCells) {
    await conn.execute(`
      INSERT INTO coverage_cells (year, sector, governorate, totalExpectedItems, totalAvailableItems, coverageScore, indicatorsCovered, indicatorsExpected, eventsCovered, eventsExpected, documentsCovered, documentsExpected, evidenceCount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [cell.year, cell.sector, cell.governorate, cell.totalExpectedItems, cell.totalAvailableItems, cell.coverageScore, cell.indicatorsCovered, cell.indicatorsExpected, cell.eventsCovered, cell.eventsExpected, cell.documentsCovered, cell.documentsExpected, cell.evidenceCount]);
  }
  console.log(`  ✓ ${coverageCells.length} coverage cells created`);
  
  await conn.end();
  
  console.log('\n✅ Truth Layer seed complete!');
  console.log(`📚 Evidence sources: ${evidenceSources.length}`);
  console.log(`📋 Claims: ${bankingClaims.length}`);
  console.log(`📊 Coverage cells: ${coverageCells.length}`);
}

seedTruthLayer().catch(console.error);
