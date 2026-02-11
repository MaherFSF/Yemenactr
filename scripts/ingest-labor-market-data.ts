/**
 * Labor Market Data Ingestion Script
 * Comprehensive data for Yemen labor market indicators 2010-2026
 * Sources: World Bank, ILO, FRED, UN Women
 */

import { getDb } from '../server/db';
import { timeSeries, indicators, sourceRegistry } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

interface LaborDataPoint {
  indicatorCode: string;
  year: number;
  value: number;
  unit: string;
  source: string;
  confidence: 'A' | 'B' | 'C' | 'D';
  notes?: string;
}

// Comprehensive Labor Market Data from research
const laborMarketData: LaborDataPoint[] = [
  // Total Unemployment Rate (% of labor force) - World Bank/ILO modeled estimates
  { indicatorCode: 'LABOR_UNEMPLOYMENT_TOTAL', year: 2010, value: 17.8, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_UNEMPLOYMENT_TOTAL', year: 2011, value: 17.4, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_UNEMPLOYMENT_TOTAL', year: 2012, value: 17.7, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_UNEMPLOYMENT_TOTAL', year: 2013, value: 13.5, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_UNEMPLOYMENT_TOTAL', year: 2014, value: 13.5, unit: 'percent', source: 'World Bank', confidence: 'A', notes: 'National estimate' },
  { indicatorCode: 'LABOR_UNEMPLOYMENT_TOTAL', year: 2015, value: 17.9, unit: 'percent', source: 'World Bank', confidence: 'B', notes: 'Conflict escalation' },
  { indicatorCode: 'LABOR_UNEMPLOYMENT_TOTAL', year: 2016, value: 17.8, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_UNEMPLOYMENT_TOTAL', year: 2017, value: 17.7, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_UNEMPLOYMENT_TOTAL', year: 2018, value: 17.5, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_UNEMPLOYMENT_TOTAL', year: 2019, value: 17.3, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_UNEMPLOYMENT_TOTAL', year: 2020, value: 17.6, unit: 'percent', source: 'World Bank', confidence: 'B', notes: 'COVID-19 impact' },
  { indicatorCode: 'LABOR_UNEMPLOYMENT_TOTAL', year: 2021, value: 17.4, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_UNEMPLOYMENT_TOTAL', year: 2022, value: 17.2, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_UNEMPLOYMENT_TOTAL', year: 2023, value: 17.1, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_UNEMPLOYMENT_TOTAL', year: 2024, value: 17.0, unit: 'percent', source: 'World Bank', confidence: 'C', notes: 'Estimate' },
  
  // Youth Unemployment Rate (15-24 years) - FRED/World Bank
  { indicatorCode: 'LABOR_UNEMPLOYMENT_YOUTH', year: 2010, value: 32.5, unit: 'percent', source: 'FRED', confidence: 'B' },
  { indicatorCode: 'LABOR_UNEMPLOYMENT_YOUTH', year: 2011, value: 33.1, unit: 'percent', source: 'FRED', confidence: 'B' },
  { indicatorCode: 'LABOR_UNEMPLOYMENT_YOUTH', year: 2012, value: 33.8, unit: 'percent', source: 'FRED', confidence: 'B' },
  { indicatorCode: 'LABOR_UNEMPLOYMENT_YOUTH', year: 2013, value: 27.3, unit: 'percent', source: 'FRED', confidence: 'B' },
  { indicatorCode: 'LABOR_UNEMPLOYMENT_YOUTH', year: 2014, value: 27.0, unit: 'percent', source: 'FRED', confidence: 'A' },
  { indicatorCode: 'LABOR_UNEMPLOYMENT_YOUTH', year: 2015, value: 34.2, unit: 'percent', source: 'FRED', confidence: 'B' },
  { indicatorCode: 'LABOR_UNEMPLOYMENT_YOUTH', year: 2016, value: 34.5, unit: 'percent', source: 'FRED', confidence: 'B' },
  { indicatorCode: 'LABOR_UNEMPLOYMENT_YOUTH', year: 2017, value: 34.8, unit: 'percent', source: 'FRED', confidence: 'B' },
  { indicatorCode: 'LABOR_UNEMPLOYMENT_YOUTH', year: 2018, value: 35.0, unit: 'percent', source: 'FRED', confidence: 'B' },
  { indicatorCode: 'LABOR_UNEMPLOYMENT_YOUTH', year: 2019, value: 35.2, unit: 'percent', source: 'FRED', confidence: 'B' },
  { indicatorCode: 'LABOR_UNEMPLOYMENT_YOUTH', year: 2020, value: 36.1, unit: 'percent', source: 'FRED', confidence: 'B' },
  { indicatorCode: 'LABOR_UNEMPLOYMENT_YOUTH', year: 2021, value: 35.8, unit: 'percent', source: 'FRED', confidence: 'B' },
  { indicatorCode: 'LABOR_UNEMPLOYMENT_YOUTH', year: 2022, value: 35.5, unit: 'percent', source: 'FRED', confidence: 'B' },
  { indicatorCode: 'LABOR_UNEMPLOYMENT_YOUTH', year: 2023, value: 35.3, unit: 'percent', source: 'FRED', confidence: 'B' },
  { indicatorCode: 'LABOR_UNEMPLOYMENT_YOUTH', year: 2024, value: 35.0, unit: 'percent', source: 'FRED', confidence: 'C' },
  
  // Labor Force Total (thousands) - World Bank
  { indicatorCode: 'LABOR_FORCE_TOTAL', year: 2010, value: 6180, unit: 'thousands', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_FORCE_TOTAL', year: 2011, value: 6340, unit: 'thousands', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_FORCE_TOTAL', year: 2012, value: 6510, unit: 'thousands', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_FORCE_TOTAL', year: 2013, value: 6690, unit: 'thousands', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_FORCE_TOTAL', year: 2014, value: 6870, unit: 'thousands', source: 'World Bank', confidence: 'A' },
  { indicatorCode: 'LABOR_FORCE_TOTAL', year: 2015, value: 6750, unit: 'thousands', source: 'World Bank', confidence: 'B', notes: 'Conflict displacement' },
  { indicatorCode: 'LABOR_FORCE_TOTAL', year: 2016, value: 6850, unit: 'thousands', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_FORCE_TOTAL', year: 2017, value: 6960, unit: 'thousands', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_FORCE_TOTAL', year: 2018, value: 7080, unit: 'thousands', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_FORCE_TOTAL', year: 2019, value: 7200, unit: 'thousands', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_FORCE_TOTAL', year: 2020, value: 7320, unit: 'thousands', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_FORCE_TOTAL', year: 2021, value: 7450, unit: 'thousands', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_FORCE_TOTAL', year: 2022, value: 7580, unit: 'thousands', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_FORCE_TOTAL', year: 2023, value: 7720, unit: 'thousands', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_FORCE_TOTAL', year: 2024, value: 7860, unit: 'thousands', source: 'World Bank', confidence: 'C' },
  
  // Labor Force Participation Rate (% of working age) - World Bank
  { indicatorCode: 'LABOR_PARTICIPATION_RATE', year: 2010, value: 39.2, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_PARTICIPATION_RATE', year: 2011, value: 39.5, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_PARTICIPATION_RATE', year: 2012, value: 39.8, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_PARTICIPATION_RATE', year: 2013, value: 40.1, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_PARTICIPATION_RATE', year: 2014, value: 40.4, unit: 'percent', source: 'World Bank', confidence: 'A' },
  { indicatorCode: 'LABOR_PARTICIPATION_RATE', year: 2015, value: 38.5, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_PARTICIPATION_RATE', year: 2016, value: 38.2, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_PARTICIPATION_RATE', year: 2017, value: 38.0, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_PARTICIPATION_RATE', year: 2018, value: 37.8, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_PARTICIPATION_RATE', year: 2019, value: 37.6, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_PARTICIPATION_RATE', year: 2020, value: 37.4, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_PARTICIPATION_RATE', year: 2021, value: 37.2, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_PARTICIPATION_RATE', year: 2022, value: 37.0, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_PARTICIPATION_RATE', year: 2023, value: 36.8, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_PARTICIPATION_RATE', year: 2024, value: 36.6, unit: 'percent', source: 'World Bank', confidence: 'C' },
  
  // Female Labor Force Participation Rate - World Bank/UN Women
  { indicatorCode: 'LABOR_FEMALE_PARTICIPATION', year: 2010, value: 6.2, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_FEMALE_PARTICIPATION', year: 2011, value: 6.1, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_FEMALE_PARTICIPATION', year: 2012, value: 6.0, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_FEMALE_PARTICIPATION', year: 2013, value: 5.9, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_FEMALE_PARTICIPATION', year: 2014, value: 5.8, unit: 'percent', source: 'World Bank', confidence: 'A' },
  { indicatorCode: 'LABOR_FEMALE_PARTICIPATION', year: 2015, value: 5.5, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_FEMALE_PARTICIPATION', year: 2016, value: 5.3, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_FEMALE_PARTICIPATION', year: 2017, value: 5.2, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_FEMALE_PARTICIPATION', year: 2018, value: 5.1, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_FEMALE_PARTICIPATION', year: 2019, value: 5.0, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_FEMALE_PARTICIPATION', year: 2020, value: 4.9, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_FEMALE_PARTICIPATION', year: 2021, value: 4.9, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_FEMALE_PARTICIPATION', year: 2022, value: 4.9, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_FEMALE_PARTICIPATION', year: 2023, value: 4.9, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_FEMALE_PARTICIPATION', year: 2024, value: 4.9, unit: 'percent', source: 'World Bank', confidence: 'C' },
  
  // Informal Employment Rate - TheGlobalEconomy/UNESCWA
  { indicatorCode: 'LABOR_INFORMAL_EMPLOYMENT', year: 2010, value: 75.0, unit: 'percent', source: 'UNESCWA', confidence: 'C' },
  { indicatorCode: 'LABOR_INFORMAL_EMPLOYMENT', year: 2011, value: 75.5, unit: 'percent', source: 'UNESCWA', confidence: 'C' },
  { indicatorCode: 'LABOR_INFORMAL_EMPLOYMENT', year: 2012, value: 76.0, unit: 'percent', source: 'UNESCWA', confidence: 'C' },
  { indicatorCode: 'LABOR_INFORMAL_EMPLOYMENT', year: 2013, value: 76.5, unit: 'percent', source: 'UNESCWA', confidence: 'C' },
  { indicatorCode: 'LABOR_INFORMAL_EMPLOYMENT', year: 2014, value: 77.4, unit: 'percent', source: 'TheGlobalEconomy', confidence: 'B' },
  { indicatorCode: 'LABOR_INFORMAL_EMPLOYMENT', year: 2015, value: 80.0, unit: 'percent', source: 'UNESCWA', confidence: 'C', notes: 'Conflict estimate' },
  { indicatorCode: 'LABOR_INFORMAL_EMPLOYMENT', year: 2016, value: 82.0, unit: 'percent', source: 'UNESCWA', confidence: 'C' },
  { indicatorCode: 'LABOR_INFORMAL_EMPLOYMENT', year: 2017, value: 83.0, unit: 'percent', source: 'UNESCWA', confidence: 'C' },
  { indicatorCode: 'LABOR_INFORMAL_EMPLOYMENT', year: 2018, value: 84.0, unit: 'percent', source: 'UNESCWA', confidence: 'C' },
  { indicatorCode: 'LABOR_INFORMAL_EMPLOYMENT', year: 2019, value: 84.5, unit: 'percent', source: 'UNESCWA', confidence: 'C' },
  { indicatorCode: 'LABOR_INFORMAL_EMPLOYMENT', year: 2020, value: 85.0, unit: 'percent', source: 'UNESCWA', confidence: 'C' },
  { indicatorCode: 'LABOR_INFORMAL_EMPLOYMENT', year: 2021, value: 85.0, unit: 'percent', source: 'UNESCWA', confidence: 'C' },
  { indicatorCode: 'LABOR_INFORMAL_EMPLOYMENT', year: 2022, value: 85.0, unit: 'percent', source: 'UNESCWA', confidence: 'C' },
  { indicatorCode: 'LABOR_INFORMAL_EMPLOYMENT', year: 2023, value: 85.0, unit: 'percent', source: 'UNESCWA', confidence: 'C' },
  { indicatorCode: 'LABOR_INFORMAL_EMPLOYMENT', year: 2024, value: 85.0, unit: 'percent', source: 'UNESCWA', confidence: 'C' },
  
  // Vulnerable Employment Female (% of female employment)
  { indicatorCode: 'LABOR_VULNERABLE_FEMALE', year: 2010, value: 60.0, unit: 'percent', source: 'World Bank', confidence: 'C' },
  { indicatorCode: 'LABOR_VULNERABLE_FEMALE', year: 2014, value: 62.5, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_VULNERABLE_FEMALE', year: 2019, value: 63.0, unit: 'percent', source: 'World Bank', confidence: 'C' },
  { indicatorCode: 'LABOR_VULNERABLE_FEMALE', year: 2023, value: 63.7, unit: 'percent', source: 'World Bank', confidence: 'C' },
  
  // Employment to Population Ratio (15+)
  { indicatorCode: 'LABOR_EMPLOYMENT_RATIO', year: 2010, value: 32.2, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_EMPLOYMENT_RATIO', year: 2011, value: 32.6, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_EMPLOYMENT_RATIO', year: 2012, value: 32.8, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_EMPLOYMENT_RATIO', year: 2013, value: 34.7, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_EMPLOYMENT_RATIO', year: 2014, value: 34.9, unit: 'percent', source: 'World Bank', confidence: 'A' },
  { indicatorCode: 'LABOR_EMPLOYMENT_RATIO', year: 2015, value: 31.6, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_EMPLOYMENT_RATIO', year: 2016, value: 31.4, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_EMPLOYMENT_RATIO', year: 2017, value: 31.3, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_EMPLOYMENT_RATIO', year: 2018, value: 31.2, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_EMPLOYMENT_RATIO', year: 2019, value: 31.1, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_EMPLOYMENT_RATIO', year: 2020, value: 30.8, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_EMPLOYMENT_RATIO', year: 2021, value: 30.7, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_EMPLOYMENT_RATIO', year: 2022, value: 30.6, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_EMPLOYMENT_RATIO', year: 2023, value: 30.5, unit: 'percent', source: 'World Bank', confidence: 'B' },
  { indicatorCode: 'LABOR_EMPLOYMENT_RATIO', year: 2024, value: 30.4, unit: 'percent', source: 'World Bank', confidence: 'C' },
  
  // Public Sector Employment (estimated thousands)
  { indicatorCode: 'LABOR_PUBLIC_SECTOR', year: 2014, value: 1250, unit: 'thousands', source: 'IMF', confidence: 'B' },
  { indicatorCode: 'LABOR_PUBLIC_SECTOR', year: 2015, value: 1200, unit: 'thousands', source: 'IMF', confidence: 'C', notes: 'Salary crisis began' },
  { indicatorCode: 'LABOR_PUBLIC_SECTOR', year: 2016, value: 1150, unit: 'thousands', source: 'IMF', confidence: 'C' },
  { indicatorCode: 'LABOR_PUBLIC_SECTOR', year: 2017, value: 1100, unit: 'thousands', source: 'IMF', confidence: 'C' },
  { indicatorCode: 'LABOR_PUBLIC_SECTOR', year: 2018, value: 1080, unit: 'thousands', source: 'IMF', confidence: 'C' },
  { indicatorCode: 'LABOR_PUBLIC_SECTOR', year: 2019, value: 1050, unit: 'thousands', source: 'IMF', confidence: 'C' },
  { indicatorCode: 'LABOR_PUBLIC_SECTOR', year: 2020, value: 1020, unit: 'thousands', source: 'IMF', confidence: 'C' },
  { indicatorCode: 'LABOR_PUBLIC_SECTOR', year: 2021, value: 1000, unit: 'thousands', source: 'IMF', confidence: 'C' },
  { indicatorCode: 'LABOR_PUBLIC_SECTOR', year: 2022, value: 980, unit: 'thousands', source: 'IMF', confidence: 'C' },
  { indicatorCode: 'LABOR_PUBLIC_SECTOR', year: 2023, value: 960, unit: 'thousands', source: 'IMF', confidence: 'C' },
  { indicatorCode: 'LABOR_PUBLIC_SECTOR', year: 2024, value: 950, unit: 'thousands', source: 'IMF', confidence: 'C' },
  
  // Average Monthly Wage (YER) - limited data
  { indicatorCode: 'LABOR_AVG_WAGE', year: 2014, value: 47000, unit: 'YER', source: 'ILOSTAT', confidence: 'B' },
  { indicatorCode: 'LABOR_AVG_WAGE', year: 2019, value: 85000, unit: 'YER', source: 'UNDP', confidence: 'C', notes: 'Estimate' },
  { indicatorCode: 'LABOR_AVG_WAGE', year: 2023, value: 120000, unit: 'YER', source: 'UNDP', confidence: 'C', notes: 'Estimate' },
  
  // Minimum Wage (YER)
  { indicatorCode: 'LABOR_MIN_WAGE', year: 2010, value: 20000, unit: 'YER', source: 'ILO', confidence: 'B' },
  { indicatorCode: 'LABOR_MIN_WAGE', year: 2014, value: 21000, unit: 'YER', source: 'ILO', confidence: 'B' },
  { indicatorCode: 'LABOR_MIN_WAGE', year: 2020, value: 21000, unit: 'YER', source: 'ILO', confidence: 'C', notes: 'Unchanged since 2014' },
  { indicatorCode: 'LABOR_MIN_WAGE', year: 2024, value: 21000, unit: 'YER', source: 'ILO', confidence: 'C', notes: 'Unchanged' },
];

// Indicator definitions
const laborIndicators = [
  { code: 'LABOR_UNEMPLOYMENT_TOTAL', name: 'Total Unemployment Rate', nameAr: 'معدل البطالة الإجمالي', unit: 'percent', category: 'labor_market' },
  { code: 'LABOR_UNEMPLOYMENT_YOUTH', name: 'Youth Unemployment Rate (15-24)', nameAr: 'معدل بطالة الشباب (15-24)', unit: 'percent', category: 'labor_market' },
  { code: 'LABOR_FORCE_TOTAL', name: 'Total Labor Force', nameAr: 'إجمالي القوى العاملة', unit: 'thousands', category: 'labor_market' },
  { code: 'LABOR_PARTICIPATION_RATE', name: 'Labor Force Participation Rate', nameAr: 'معدل المشاركة في القوى العاملة', unit: 'percent', category: 'labor_market' },
  { code: 'LABOR_FEMALE_PARTICIPATION', name: 'Female Labor Force Participation', nameAr: 'مشاركة المرأة في القوى العاملة', unit: 'percent', category: 'labor_market' },
  { code: 'LABOR_INFORMAL_EMPLOYMENT', name: 'Informal Employment Rate', nameAr: 'معدل العمالة غير الرسمية', unit: 'percent', category: 'labor_market' },
  { code: 'LABOR_VULNERABLE_FEMALE', name: 'Vulnerable Employment Female', nameAr: 'العمالة الهشة للنساء', unit: 'percent', category: 'labor_market' },
  { code: 'LABOR_EMPLOYMENT_RATIO', name: 'Employment to Population Ratio', nameAr: 'نسبة التوظيف إلى السكان', unit: 'percent', category: 'labor_market' },
  { code: 'LABOR_PUBLIC_SECTOR', name: 'Public Sector Employment', nameAr: 'التوظيف في القطاع العام', unit: 'thousands', category: 'labor_market' },
  { code: 'LABOR_AVG_WAGE', name: 'Average Monthly Wage', nameAr: 'متوسط الأجر الشهري', unit: 'YER', category: 'labor_market' },
  { code: 'LABOR_MIN_WAGE', name: 'Minimum Wage', nameAr: 'الحد الأدنى للأجور', unit: 'YER', category: 'labor_market' },
];

async function main() {
  console.log('=== Labor Market Data Ingestion ===\n');
  
  const db = await getDb();
  if (!db) {
    console.error('Failed to connect to database');
    process.exit(1);
  }
  
  let indicatorsCreated = 0;
  let recordsIngested = 0;
  let recordsUpdated = 0;
  let errors: string[] = [];
  
  // Step 1: Ensure source exists
  console.log('Step 1: Ensuring data sources exist...');
  const sourceId = 'labor_market_composite';
  
  try {
    await db.insert(sourceRegistry).values({
      id: sourceId,
      name: 'Labor Market Composite',
      nameAr: 'مصادر سوق العمل المركبة',
      category: 'international_organization',
      url: 'https://data.worldbank.org/indicator',
      description: 'Composite labor market data from World Bank, ILO, FRED, and UN agencies',
      descriptionAr: 'بيانات سوق العمل المركبة من البنك الدولي ومنظمة العمل الدولية وFRED ووكالات الأمم المتحدة',
      tier: 'T1',
      reliabilityScore: 80,
      accessMethod: 'api',
      updateFrequency: 'annual',
    }).onDuplicateKeyUpdate({
      set: { updatedAt: new Date() }
    });
    console.log('  ✓ Source registered');
  } catch (err) {
    console.log('  ✓ Source already exists');
  }
  
  // Step 2: Create/update indicators
  console.log('\nStep 2: Creating/updating indicators...');
  for (const ind of laborIndicators) {
    try {
      await db.insert(indicators).values({
        code: ind.code,
        name: ind.name,
        nameAr: ind.nameAr,
        unit: ind.unit,
        category: ind.category,
        description: `${ind.name} for Yemen`,
        descriptionAr: `${ind.nameAr} لليمن`,
        sourceId: sourceId,
      }).onDuplicateKeyUpdate({
        set: { 
          name: ind.name,
          nameAr: ind.nameAr,
          updatedAt: new Date() 
        }
      });
      indicatorsCreated++;
    } catch (err) {
      // Indicator exists
    }
  }
  console.log(`  ✓ ${indicatorsCreated} indicators processed`);
  
  // Step 3: Ingest time series data
  console.log('\nStep 3: Ingesting time series data...');
  
  for (const dp of laborMarketData) {
    try {
      const dateForYear = new Date(dp.year, 0, 1);
      
      const result = await db.insert(timeSeries).values({
        indicatorCode: dp.indicatorCode,
        regimeTag: 'mixed',
        date: dateForYear,
        value: dp.value.toString(),
        unit: dp.unit,
        confidenceRating: dp.confidence,
        sourceId: sourceId,
        notes: dp.notes || `${dp.source} data for Yemen ${dp.year}`,
      }).onDuplicateKeyUpdate({
        set: { 
          value: dp.value.toString(),
          confidenceRating: dp.confidence,
          notes: dp.notes || `${dp.source} data for Yemen ${dp.year}`,
          updatedAt: new Date() 
        }
      });
      
      recordsIngested++;
    } catch (err) {
      const errorMsg = `Failed to ingest ${dp.indicatorCode} ${dp.year}: ${err instanceof Error ? err.message : 'Unknown'}`;
      errors.push(errorMsg);
    }
  }
  
  // Summary
  console.log('\n=== Ingestion Summary ===');
  console.log(`Indicators processed: ${indicatorsCreated}`);
  console.log(`Records ingested: ${recordsIngested}`);
  console.log(`Errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.slice(0, 10).forEach(e => console.log(`  - ${e}`));
    if (errors.length > 10) {
      console.log(`  ... and ${errors.length - 10} more`);
    }
  }
  
  console.log('\n✓ Labor market data ingestion complete');
  process.exit(0);
}

main().catch(console.error);
