/**
 * Populate Indicators Table with Yemen Economic Indicators
 * This script creates comprehensive economic indicators for Yemen
 */

import { getDb } from '../server/db';
import { indicators } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

interface IndicatorInput {
  code: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  unit: string;
  sector: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  methodology: string;
}

const INDICATORS: IndicatorInput[] = [
  // Macroeconomic Indicators
  {
    code: 'GDP_GROWTH',
    nameEn: 'GDP Growth Rate',
    nameAr: 'معدل نمو الناتج المحلي الإجمالي',
    descriptionEn: 'Annual percentage growth rate of GDP at market prices based on constant local currency',
    descriptionAr: 'معدل النمو السنوي للناتج المحلي الإجمالي بأسعار السوق بناءً على العملة المحلية الثابتة',
    unit: '%',
    sector: 'macroeconomy',
    frequency: 'annual',
    methodology: 'Calculated as (GDP_t - GDP_t-1) / GDP_t-1 * 100. Source: World Bank, IMF'
  },
  {
    code: 'GDP_NOMINAL',
    nameEn: 'Nominal GDP',
    nameAr: 'الناتج المحلي الإجمالي الاسمي',
    descriptionEn: 'Gross Domestic Product at current market prices in USD',
    descriptionAr: 'الناتج المحلي الإجمالي بأسعار السوق الحالية بالدولار الأمريكي',
    unit: 'USD Billion',
    sector: 'macroeconomy',
    frequency: 'annual',
    methodology: 'Sum of all final goods and services produced within Yemen. Source: World Bank'
  },
  {
    code: 'GDP_PER_CAPITA',
    nameEn: 'GDP Per Capita',
    nameAr: 'نصيب الفرد من الناتج المحلي الإجمالي',
    descriptionEn: 'GDP divided by midyear population',
    descriptionAr: 'الناتج المحلي الإجمالي مقسومًا على عدد السكان في منتصف العام',
    unit: 'USD',
    sector: 'macroeconomy',
    frequency: 'annual',
    methodology: 'GDP / Population. Source: World Bank'
  },
  
  // Inflation Indicators
  {
    code: 'CPI_INFLATION',
    nameEn: 'Consumer Price Inflation',
    nameAr: 'تضخم أسعار المستهلك',
    descriptionEn: 'Annual percentage change in consumer price index',
    descriptionAr: 'التغير السنوي في مؤشر أسعار المستهلك',
    unit: '%',
    sector: 'prices',
    frequency: 'monthly',
    methodology: 'Year-over-year change in CPI basket. Source: Central Statistical Organization, IMF'
  },
  {
    code: 'FOOD_INFLATION',
    nameEn: 'Food Price Inflation',
    nameAr: 'تضخم أسعار الغذاء',
    descriptionEn: 'Annual percentage change in food prices',
    descriptionAr: 'التغير السنوي في أسعار الغذاء',
    unit: '%',
    sector: 'prices',
    frequency: 'monthly',
    methodology: 'Year-over-year change in food price index. Source: WFP, FAO'
  },
  
  // Exchange Rate Indicators
  {
    code: 'EXCHANGE_RATE_OFFICIAL',
    nameEn: 'Official Exchange Rate',
    nameAr: 'سعر الصرف الرسمي',
    descriptionEn: 'Official exchange rate (YER per USD) set by Central Bank of Yemen',
    descriptionAr: 'سعر الصرف الرسمي (ريال يمني لكل دولار) المحدد من البنك المركزي اليمني',
    unit: 'YER/USD',
    sector: 'currency',
    frequency: 'daily',
    methodology: 'Official rate announced by CBY'
  },
  {
    code: 'EXCHANGE_RATE_PARALLEL',
    nameEn: 'Parallel Market Exchange Rate',
    nameAr: 'سعر الصرف في السوق الموازي',
    descriptionEn: 'Exchange rate in the parallel/black market',
    descriptionAr: 'سعر الصرف في السوق الموازي/السوداء',
    unit: 'YER/USD',
    sector: 'currency',
    frequency: 'daily',
    methodology: 'Average of reported parallel market rates'
  },
  {
    code: 'EXCHANGE_RATE_ADEN',
    nameEn: 'Aden Exchange Rate',
    nameAr: 'سعر الصرف في عدن',
    descriptionEn: 'Exchange rate in Aden (government-controlled areas)',
    descriptionAr: 'سعر الصرف في عدن (المناطق الخاضعة للحكومة)',
    unit: 'YER/USD',
    sector: 'currency',
    frequency: 'daily',
    methodology: 'Rate in IRG-controlled areas. Source: CBY Aden'
  },
  {
    code: 'EXCHANGE_RATE_SANAA',
    nameEn: 'Sanaa Exchange Rate',
    nameAr: 'سعر الصرف في صنعاء',
    descriptionEn: 'Exchange rate in Sanaa (Houthi-controlled areas)',
    descriptionAr: 'سعر الصرف في صنعاء (المناطق الخاضعة للحوثيين)',
    unit: 'YER/USD',
    sector: 'currency',
    frequency: 'daily',
    methodology: 'Rate in DFA-controlled areas. Source: CBY Sanaa'
  },
  
  // Trade Indicators
  {
    code: 'EXPORTS',
    nameEn: 'Total Exports',
    nameAr: 'إجمالي الصادرات',
    descriptionEn: 'Total value of goods and services exported',
    descriptionAr: 'القيمة الإجمالية للسلع والخدمات المصدرة',
    unit: 'USD Million',
    sector: 'trade',
    frequency: 'annual',
    methodology: 'FOB value of exports. Source: World Bank, IMF'
  },
  {
    code: 'IMPORTS',
    nameEn: 'Total Imports',
    nameAr: 'إجمالي الواردات',
    descriptionEn: 'Total value of goods and services imported',
    descriptionAr: 'القيمة الإجمالية للسلع والخدمات المستوردة',
    unit: 'USD Million',
    sector: 'trade',
    frequency: 'annual',
    methodology: 'CIF value of imports. Source: World Bank, IMF'
  },
  {
    code: 'TRADE_BALANCE',
    nameEn: 'Trade Balance',
    nameAr: 'الميزان التجاري',
    descriptionEn: 'Difference between exports and imports',
    descriptionAr: 'الفرق بين الصادرات والواردات',
    unit: 'USD Million',
    sector: 'trade',
    frequency: 'annual',
    methodology: 'Exports - Imports. Source: World Bank, IMF'
  },
  
  // Oil & Energy Indicators
  {
    code: 'OIL_PRODUCTION',
    nameEn: 'Oil Production',
    nameAr: 'إنتاج النفط',
    descriptionEn: 'Crude oil production in barrels per day',
    descriptionAr: 'إنتاج النفط الخام بالبراميل يوميًا',
    unit: 'bpd',
    sector: 'energy',
    frequency: 'monthly',
    methodology: 'Total crude oil production. Source: OPEC, EIA'
  },
  {
    code: 'OIL_EXPORTS',
    nameEn: 'Oil Exports',
    nameAr: 'صادرات النفط',
    descriptionEn: 'Value of crude oil exports',
    descriptionAr: 'قيمة صادرات النفط الخام',
    unit: 'USD Million',
    sector: 'energy',
    frequency: 'annual',
    methodology: 'FOB value of oil exports. Source: OPEC, World Bank'
  },
  {
    code: 'FUEL_PRICES',
    nameEn: 'Fuel Prices',
    nameAr: 'أسعار الوقود',
    descriptionEn: 'Retail fuel prices (petrol/diesel)',
    descriptionAr: 'أسعار الوقود بالتجزئة (بنزين/ديزل)',
    unit: 'YER/Liter',
    sector: 'energy',
    frequency: 'weekly',
    methodology: 'Average retail prices across major cities'
  },
  
  // Fiscal Indicators
  {
    code: 'GOVT_REVENUE',
    nameEn: 'Government Revenue',
    nameAr: 'الإيرادات الحكومية',
    descriptionEn: 'Total government revenue including taxes and non-tax revenue',
    descriptionAr: 'إجمالي الإيرادات الحكومية بما في ذلك الضرائب والإيرادات غير الضريبية',
    unit: 'YER Billion',
    sector: 'fiscal',
    frequency: 'annual',
    methodology: 'Sum of tax and non-tax revenues. Source: Ministry of Finance, IMF'
  },
  {
    code: 'GOVT_EXPENDITURE',
    nameEn: 'Government Expenditure',
    nameAr: 'الإنفاق الحكومي',
    descriptionEn: 'Total government expenditure including current and capital spending',
    descriptionAr: 'إجمالي الإنفاق الحكومي بما في ذلك الإنفاق الجاري والرأسمالي',
    unit: 'YER Billion',
    sector: 'fiscal',
    frequency: 'annual',
    methodology: 'Sum of current and capital expenditures. Source: Ministry of Finance, IMF'
  },
  {
    code: 'BUDGET_DEFICIT',
    nameEn: 'Budget Deficit',
    nameAr: 'عجز الموازنة',
    descriptionEn: 'Government budget deficit as percentage of GDP',
    descriptionAr: 'عجز الموازنة الحكومية كنسبة من الناتج المحلي الإجمالي',
    unit: '% of GDP',
    sector: 'fiscal',
    frequency: 'annual',
    methodology: '(Revenue - Expenditure) / GDP * 100. Source: Ministry of Finance, IMF'
  },
  {
    code: 'FOREIGN_RESERVES',
    nameEn: 'Foreign Exchange Reserves',
    nameAr: 'احتياطيات النقد الأجنبي',
    descriptionEn: 'Central Bank foreign exchange reserves',
    descriptionAr: 'احتياطيات البنك المركزي من النقد الأجنبي',
    unit: 'USD Billion',
    sector: 'fiscal',
    frequency: 'monthly',
    methodology: 'Total foreign currency holdings. Source: Central Bank of Yemen, IMF'
  },
  
  // Humanitarian Indicators
  {
    code: 'FOOD_INSECURITY',
    nameEn: 'Food Insecurity Rate',
    nameAr: 'معدل انعدام الأمن الغذائي',
    descriptionEn: 'Percentage of population facing food insecurity (IPC Phase 3+)',
    descriptionAr: 'نسبة السكان الذين يواجهون انعدام الأمن الغذائي (المرحلة 3+ من التصنيف المتكامل)',
    unit: '%',
    sector: 'humanitarian',
    frequency: 'quarterly',
    methodology: 'IPC Phase 3+ population / Total population. Source: IPC, WFP'
  },
  {
    code: 'IDPS',
    nameEn: 'Internally Displaced Persons',
    nameAr: 'النازحون داخليًا',
    descriptionEn: 'Number of internally displaced persons',
    descriptionAr: 'عدد النازحين داخليًا',
    unit: 'Million',
    sector: 'humanitarian',
    frequency: 'quarterly',
    methodology: 'DTM tracking. Source: IOM, UNHCR'
  },
  {
    code: 'HUMANITARIAN_NEEDS',
    nameEn: 'People in Need',
    nameAr: 'الأشخاص المحتاجون',
    descriptionEn: 'Total number of people in need of humanitarian assistance',
    descriptionAr: 'إجمالي عدد الأشخاص المحتاجين للمساعدات الإنسانية',
    unit: 'Million',
    sector: 'humanitarian',
    frequency: 'annual',
    methodology: 'HNO assessment. Source: OCHA'
  },
  {
    code: 'MALNUTRITION_RATE',
    nameEn: 'Acute Malnutrition Rate',
    nameAr: 'معدل سوء التغذية الحاد',
    descriptionEn: 'Percentage of children under 5 with acute malnutrition',
    descriptionAr: 'نسبة الأطفال دون سن الخامسة الذين يعانون من سوء التغذية الحاد',
    unit: '%',
    sector: 'humanitarian',
    frequency: 'quarterly',
    methodology: 'SMART surveys. Source: UNICEF, WHO'
  },
  
  // Banking Indicators
  {
    code: 'MONEY_SUPPLY_M2',
    nameEn: 'Money Supply (M2)',
    nameAr: 'عرض النقود (م2)',
    descriptionEn: 'Broad money supply including currency and deposits',
    descriptionAr: 'عرض النقود الواسع بما في ذلك العملة والودائع',
    unit: 'YER Billion',
    sector: 'banking',
    frequency: 'monthly',
    methodology: 'Currency + demand deposits + time deposits. Source: Central Bank of Yemen'
  },
  {
    code: 'BANK_DEPOSITS',
    nameEn: 'Bank Deposits',
    nameAr: 'الودائع المصرفية',
    descriptionEn: 'Total deposits in commercial banks',
    descriptionAr: 'إجمالي الودائع في البنوك التجارية',
    unit: 'YER Billion',
    sector: 'banking',
    frequency: 'monthly',
    methodology: 'Sum of all deposit types. Source: Central Bank of Yemen'
  },
  {
    code: 'REMITTANCES',
    nameEn: 'Remittances',
    nameAr: 'التحويلات المالية',
    descriptionEn: 'Personal remittances received',
    descriptionAr: 'التحويلات المالية الشخصية المستلمة',
    unit: 'USD Billion',
    sector: 'banking',
    frequency: 'annual',
    methodology: 'Balance of payments data. Source: World Bank, CBY'
  },
  
  // Conflict Indicators
  {
    code: 'CONFLICT_EVENTS',
    nameEn: 'Conflict Events',
    nameAr: 'أحداث النزاع',
    descriptionEn: 'Number of recorded conflict events',
    descriptionAr: 'عدد أحداث النزاع المسجلة',
    unit: 'Events',
    sector: 'conflict',
    frequency: 'monthly',
    methodology: 'Event count from ACLED database. Source: ACLED'
  },
  {
    code: 'CONFLICT_FATALITIES',
    nameEn: 'Conflict Fatalities',
    nameAr: 'ضحايا النزاع',
    descriptionEn: 'Number of reported conflict-related fatalities',
    descriptionAr: 'عدد الوفيات المبلغ عنها المرتبطة بالنزاع',
    unit: 'Persons',
    sector: 'conflict',
    frequency: 'monthly',
    methodology: 'Fatality count from ACLED database. Source: ACLED'
  }
];

async function populateIndicators() {
  console.log('Populating indicators table...\n');
  
  const db = await getDb();
  
  let created = 0;
  let skipped = 0;
  let failed = 0;
  
  for (const indicator of INDICATORS) {
    try {
      // Check if indicator already exists
      const existing = await db.select().from(indicators).where(eq(indicators.code, indicator.code));
      
      if (existing.length > 0) {
        console.log(`⏭️  Skipped: ${indicator.code} (already exists)`);
        skipped++;
        continue;
      }
      
      // Insert new indicator
      await db.insert(indicators).values({
        code: indicator.code,
        nameEn: indicator.nameEn,
        nameAr: indicator.nameAr,
        descriptionEn: indicator.descriptionEn,
        descriptionAr: indicator.descriptionAr,
        unit: indicator.unit,
        sector: indicator.sector,
        frequency: indicator.frequency,
        methodology: indicator.methodology
      });
      
      console.log(`✅ Created: ${indicator.code} - ${indicator.nameEn}`);
      created++;
    } catch (error) {
      console.error(`❌ Failed: ${indicator.code} - ${error}`);
      failed++;
    }
  }
  
  console.log('\n=== Indicators Population Summary ===');
  console.log(`Created: ${created}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total indicators: ${INDICATORS.length}`);
  
  // Count total indicators in database
  const allIndicators = await db.select().from(indicators);
  console.log(`\nTotal indicators in database: ${allIndicators.length}`);
  
  process.exit(0);
}

populateIndicators().catch(console.error);
