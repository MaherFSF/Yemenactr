/**
 * World Bank Data Ingestion Script
 * Fetches real Yemen economic data from World Bank API for 2010-2024
 * and stores it in the time_series table with proper provenance
 */

import { getDb } from '../db';
import { sql } from 'drizzle-orm';

// World Bank indicator mappings: WB code -> our indicator code + metadata
const WB_INDICATORS = [
  // GDP & Macro
  { wbCode: 'NY.GDP.MKTP.CD', code: 'WB_GDP_CURRENT_USD', name: 'GDP (current US$)', nameAr: 'الناتج المحلي الإجمالي (بالدولار الأمريكي الحالي)', unit: 'USD', sector: 'macroeconomy', frequency: 'annual' },
  { wbCode: 'NY.GDP.MKTP.KD.ZG', code: 'WB_GDP_GROWTH', name: 'GDP growth (annual %)', nameAr: 'نمو الناتج المحلي الإجمالي (سنوي %)', unit: 'percent', sector: 'macroeconomy', frequency: 'annual' },
  { wbCode: 'NY.GDP.PCAP.CD', code: 'WB_GDP_PER_CAPITA', name: 'GDP per capita (current US$)', nameAr: 'نصيب الفرد من الناتج المحلي الإجمالي', unit: 'USD', sector: 'macroeconomy', frequency: 'annual' },
  { wbCode: 'SP.POP.TOTL', code: 'WB_POPULATION', name: 'Population, total', nameAr: 'إجمالي السكان', unit: 'people', sector: 'macroeconomy', frequency: 'annual' },
  
  // Inflation & Prices
  { wbCode: 'FP.CPI.TOTL.ZG', code: 'WB_CPI_INFLATION', name: 'Inflation, consumer prices (annual %)', nameAr: 'التضخم، أسعار المستهلك (سنوي %)', unit: 'percent', sector: 'prices', frequency: 'annual' },
  { wbCode: 'FP.CPI.TOTL', code: 'WB_CPI_INDEX', name: 'Consumer price index (2010 = 100)', nameAr: 'مؤشر أسعار المستهلك (2010 = 100)', unit: 'index', sector: 'prices', frequency: 'annual' },
  
  // Trade
  { wbCode: 'NE.EXP.GNFS.CD', code: 'WB_EXPORTS', name: 'Exports of goods and services (current US$)', nameAr: 'صادرات السلع والخدمات', unit: 'USD', sector: 'trade', frequency: 'annual' },
  { wbCode: 'NE.IMP.GNFS.CD', code: 'WB_IMPORTS', name: 'Imports of goods and services (current US$)', nameAr: 'واردات السلع والخدمات', unit: 'USD', sector: 'trade', frequency: 'annual' },
  { wbCode: 'NE.TRD.GNFS.ZS', code: 'WB_TRADE_GDP', name: 'Trade (% of GDP)', nameAr: 'التجارة (% من الناتج المحلي)', unit: 'percent', sector: 'trade', frequency: 'annual' },
  { wbCode: 'BX.TRF.PWKR.CD.DT', code: 'WB_REMITTANCES', name: 'Personal remittances, received (current US$)', nameAr: 'التحويلات الشخصية المستلمة', unit: 'USD', sector: 'banking', frequency: 'annual' },
  
  // Labor & Employment
  { wbCode: 'SL.UEM.TOTL.ZS', code: 'WB_UNEMPLOYMENT', name: 'Unemployment, total (% of total labor force)', nameAr: 'البطالة، الإجمالي (% من القوى العاملة)', unit: 'percent', sector: 'labor', frequency: 'annual' },
  { wbCode: 'SL.TLF.TOTL.IN', code: 'WB_LABOR_FORCE', name: 'Labor force, total', nameAr: 'إجمالي القوى العاملة', unit: 'people', sector: 'labor', frequency: 'annual' },
  { wbCode: 'SL.UEM.1524.ZS', code: 'WB_YOUTH_UNEMPLOYMENT', name: 'Unemployment, youth total (% ages 15-24)', nameAr: 'بطالة الشباب (% الأعمار 15-24)', unit: 'percent', sector: 'labor', frequency: 'annual' },
  
  // Poverty & Human Development
  { wbCode: 'SI.POV.NAHC', code: 'WB_POVERTY_NATIONAL', name: 'Poverty headcount ratio at national poverty lines', nameAr: 'نسبة الفقر عند خطوط الفقر الوطنية', unit: 'percent', sector: 'poverty', frequency: 'annual' },
  { wbCode: 'SP.DYN.LE00.IN', code: 'WB_LIFE_EXPECTANCY', name: 'Life expectancy at birth, total (years)', nameAr: 'العمر المتوقع عند الولادة', unit: 'years', sector: 'humanitarian', frequency: 'annual' },
  { wbCode: 'SE.ADT.LITR.ZS', code: 'WB_LITERACY_RATE', name: 'Literacy rate, adult total', nameAr: 'معدل محو الأمية للبالغين', unit: 'percent', sector: 'humanitarian', frequency: 'annual' },
  
  // Banking & Finance
  { wbCode: 'FM.LBL.BMNY.GD.ZS', code: 'WB_BROAD_MONEY_GDP', name: 'Broad money (% of GDP)', nameAr: 'النقود بالمعنى الواسع (% من الناتج المحلي)', unit: 'percent', sector: 'banking', frequency: 'annual' },
  { wbCode: 'FS.AST.DOMS.GD.ZS', code: 'WB_DOMESTIC_CREDIT_GDP', name: 'Domestic credit provided by financial sector (% of GDP)', nameAr: 'الائتمان المحلي من القطاع المالي (% من الناتج المحلي)', unit: 'percent', sector: 'banking', frequency: 'annual' },
  { wbCode: 'FD.AST.PRVT.GD.ZS', code: 'WB_PRIVATE_CREDIT_GDP', name: 'Domestic credit to private sector (% of GDP)', nameAr: 'الائتمان المحلي للقطاع الخاص (% من الناتج المحلي)', unit: 'percent', sector: 'banking', frequency: 'annual' },
  
  // Energy
  { wbCode: 'EG.USE.ELEC.KH.PC', code: 'WB_ELECTRICITY_PC', name: 'Electric power consumption (kWh per capita)', nameAr: 'استهلاك الطاقة الكهربائية (كيلوواط ساعة للفرد)', unit: 'kWh', sector: 'energy', frequency: 'annual' },
  { wbCode: 'EG.ELC.ACCS.ZS', code: 'WB_ELECTRICITY_ACCESS', name: 'Access to electricity (% of population)', nameAr: 'الوصول إلى الكهرباء (% من السكان)', unit: 'percent', sector: 'energy', frequency: 'annual' },
  
  // Public Finance
  { wbCode: 'GC.REV.XGRT.GD.ZS', code: 'WB_REVENUE_GDP', name: 'Revenue, excluding grants (% of GDP)', nameAr: 'الإيرادات باستثناء المنح (% من الناتج المحلي)', unit: 'percent', sector: 'public_finance', frequency: 'annual' },
  { wbCode: 'GC.DOD.TOTL.GD.ZS', code: 'WB_DEBT_GDP', name: 'Central government debt, total (% of GDP)', nameAr: 'الدين الحكومي المركزي (% من الناتج المحلي)', unit: 'percent', sector: 'public_finance', frequency: 'annual' },
  
  // External
  { wbCode: 'PA.NUS.FCRF', code: 'WB_EXCHANGE_RATE', name: 'Official exchange rate (LCU per US$, period average)', nameAr: 'سعر الصرف الرسمي', unit: 'YER/USD', sector: 'currency', frequency: 'annual' },
  { wbCode: 'BN.CAB.XOKA.CD', code: 'WB_CURRENT_ACCOUNT', name: 'Current account balance (BoP, current US$)', nameAr: 'رصيد الحساب الجاري', unit: 'USD', sector: 'trade', frequency: 'annual' },
  { wbCode: 'FI.RES.TOTL.CD', code: 'WB_RESERVES', name: 'Total reserves (includes gold, current US$)', nameAr: 'إجمالي الاحتياطيات (بما في ذلك الذهب)', unit: 'USD', sector: 'banking', frequency: 'annual' },
  
  // Food & Agriculture
  { wbCode: 'AG.PRD.FOOD.XD', code: 'WB_FOOD_PRODUCTION', name: 'Food production index (2014-2016 = 100)', nameAr: 'مؤشر إنتاج الغذاء', unit: 'index', sector: 'food_security', frequency: 'annual' },
  { wbCode: 'NV.AGR.TOTL.ZS', code: 'WB_AGRICULTURE_GDP', name: 'Agriculture, forestry, and fishing, value added (% of GDP)', nameAr: 'الزراعة والغابات والصيد (% من الناتج المحلي)', unit: 'percent', sector: 'food_security', frequency: 'annual' },
  
  // Health (humanitarian)
  { wbCode: 'SH.XPD.CHEX.PC.CD', code: 'WB_HEALTH_EXPENDITURE_PC', name: 'Current health expenditure per capita (current US$)', nameAr: 'الإنفاق الصحي الحالي للفرد', unit: 'USD', sector: 'humanitarian', frequency: 'annual' },
  { wbCode: 'SH.DYN.MORT', code: 'WB_CHILD_MORTALITY', name: 'Mortality rate, under-5 (per 1,000 live births)', nameAr: 'معدل وفيات الأطفال دون الخامسة', unit: 'per 1000', sector: 'humanitarian', frequency: 'annual' },
  
  // ODA & Aid
  { wbCode: 'DT.ODA.ODAT.CD', code: 'WB_ODA_RECEIVED', name: 'Net official development assistance received (current US$)', nameAr: 'صافي المساعدات الإنمائية الرسمية المتلقاة', unit: 'USD', sector: 'humanitarian', frequency: 'annual' },
  { wbCode: 'DT.ODA.ODAT.GN.ZS', code: 'WB_ODA_GNI', name: 'Net ODA received (% of GNI)', nameAr: 'صافي المساعدات الإنمائية (% من الدخل القومي)', unit: 'percent', sector: 'humanitarian', frequency: 'annual' },
];

async function fetchWorldBankData(indicatorCode: string, fromYear: number = 2010): Promise<{ year: number; value: number }[]> {
  const url = `https://api.worldbank.org/v2/country/YE/indicator/${indicatorCode}?format=json&date=${fromYear}:2024&per_page=50`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`[WB] HTTP ${response.status} for ${indicatorCode}`);
      return [];
    }
    const data = await response.json() as any[];
    if (!data[1]) return [];
    
    return (data[1] as any[])
      .filter((x: any) => x.value !== null)
      .map((x: any) => ({ year: parseInt(x.date), value: x.value }))
      .sort((a: any, b: any) => a.year - b.year);
  } catch (err) {
    console.error(`[WB] Failed to fetch ${indicatorCode}:`, err);
    return [];
  }
}

export async function runWorldBankIngestion() {
  const db = await getDb();
  if (!db) {
    console.error('[Ingestion] No database connection');
    return { success: false, error: 'No database connection' };
  }

  console.log('[Ingestion] Starting World Bank data ingestion...');
  const results: { indicator: string; inserted: number; skipped: number; errors: number }[] = [];

  // First, ensure we have a World Bank source entry
  let wbSourceId: number;
  const [existingSources] = await db.execute(
    sql`SELECT id FROM sources WHERE publisher = 'World Bank' LIMIT 1`
  );
  const existingSource = (existingSources as unknown as any[])[0];
  
  if (existingSource) {
    wbSourceId = existingSource.id;
  } else {
    const [insertResult] = await db.execute(
      sql`INSERT INTO sources (publisher, url, license, retrievalDate, notes) 
          VALUES ('World Bank', 'https://data.worldbank.org', 'CC-BY-4.0', NOW(), 'World Bank Open Data API - Yemen indicators')`
    );
    wbSourceId = (insertResult as any).insertId;
  }
  console.log(`[Ingestion] Using World Bank source ID: ${wbSourceId}`);

  for (const indicator of WB_INDICATORS) {
    console.log(`[Ingestion] Fetching ${indicator.wbCode} (${indicator.name})...`);
    const data = await fetchWorldBankData(indicator.wbCode);
    
    let inserted = 0;
    let skipped = 0;
    let errors = 0;

    // Ensure indicator exists in indicators table
    try {
      await db.execute(
        sql`INSERT IGNORE INTO indicators (code, nameEn, nameAr, unit, sector, frequency, descriptionEn, primarySourceId, isActive)
            VALUES (${indicator.code}, ${indicator.name}, ${indicator.nameAr}, ${indicator.unit}, ${indicator.sector}, ${indicator.frequency}, ${`World Bank indicator ${indicator.wbCode}`}, ${wbSourceId}, 1)`
      );
    } catch (e) {
      // Indicator may already exist
    }

    for (const point of data) {
      try {
        // Use INSERT IGNORE to skip duplicates (unique constraint on indicatorCode + regimeTag + date)
        const dateStr = `${point.year}-07-01`; // Mid-year for annual data
        await db.execute(
          sql`INSERT IGNORE INTO time_series (indicatorCode, regimeTag, date, value, unit, confidenceRating, sourceId, notes)
              VALUES (${indicator.code}, 'mixed', ${dateStr}, ${point.value}, ${indicator.unit}, 'A', ${wbSourceId}, ${`World Bank ${indicator.wbCode} for Yemen, year ${point.year}`})`
        );
        inserted++;
      } catch (e: any) {
        if (e.message?.includes('Duplicate')) {
          skipped++;
        } else {
          errors++;
          console.error(`[Ingestion] Error inserting ${indicator.code} ${point.year}:`, e.message);
        }
      }
    }

    results.push({ indicator: indicator.code, inserted, skipped, errors });
    console.log(`[Ingestion] ${indicator.code}: ${data.length} points fetched, ${inserted} inserted, ${skipped} skipped, ${errors} errors`);
    
    // Small delay to be respectful to the API
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  const totalInserted = results.reduce((sum, r) => sum + r.inserted, 0);
  const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);

  console.log(`[Ingestion] Complete: ${totalInserted} inserted, ${totalSkipped} skipped, ${totalErrors} errors`);
  
  return {
    success: true,
    totalInserted,
    totalSkipped,
    totalErrors,
    details: results,
  };
}

// Run if called directly
if (process.argv[1]?.includes('ingestWorldBankData')) {
  runWorldBankIngestion().then(result => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
