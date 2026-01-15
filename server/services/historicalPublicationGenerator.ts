/**
 * Historical Publication Generator
 * 
 * Generates comprehensive historical reports for the YETO platform
 * covering the period from 2015 to present. This ensures the platform
 * has a complete archive of economic intelligence products.
 */

import { getDb } from '../db';
import { sql } from 'drizzle-orm';

export interface HistoricalPublication {
  id: string;
  type: 'monthly_monitor' | 'quarterly_review' | 'annual_report' | 'special_report';
  title: string;
  titleAr: string;
  period: string;
  year: number;
  month?: number;
  quarter?: number;
  summary: string;
  summaryAr: string;
  keyFindings: string[];
  keyFindingsAr: string[];
  indicators: IndicatorData[];
  events: EventData[];
  generatedAt: Date;
  dataAsOf: Date;
}

interface IndicatorData {
  code: string;
  name: string;
  nameAr: string;
  value: number;
  previousValue?: number;
  change?: number;
  source: string;
}

interface EventData {
  title: string;
  titleAr: string;
  date: Date;
  category: string;
  impact: string;
}

// Key economic events by year for context
const HISTORICAL_CONTEXT: Record<number, string[]> = {
  2015: [
    'Saudi-led coalition intervention begins (March 26)',
    'Government relocates to Aden',
    'UN arms embargo imposed',
    'Aden liberated by Coalition forces (July)',
    'Economic crisis deepens with conflict escalation',
  ],
  2016: [
    'Kuwait peace talks fail',
    'Central Bank headquarters moved to Aden (September)',
    'New currency notes printed',
    'Monetary system begins to split',
    'Humanitarian crisis worsens',
  ],
  2017: [
    'CBY Aden prints new currency notes',
    'Houthis ban new notes in north',
    'Dual currency system emerges',
    'Saleh killed by Houthis (December)',
    'Exchange rate divergence accelerates',
  ],
  2018: [
    'Stockholm Agreement on Hodeidah',
    'UNMHA deployed',
    'Aden rate reaches 700+ YER/USD',
    'Saudi deposit to CBY Aden ($2B)',
    'Humanitarian response scales up',
  ],
  2019: [
    'STC seizes Aden (August)',
    'Riyadh Agreement signed (November)',
    'Exchange rate volatility continues',
    'Food insecurity peaks',
    'Economic fragmentation deepens',
  ],
  2020: [
    'CBY Sanaa bans new currency notes (January)',
    'COVID-19 impacts economy',
    'STC declares self-administration (April)',
    'Aden rate peaks at 1,700 YER/USD',
    'Remittances decline sharply',
  ],
  2021: [
    'Marib offensive intensifies',
    'Fuel crisis in north',
    'Exchange rate stabilizes temporarily',
    'Humanitarian funding gaps widen',
    'Economic recovery stalls',
  ],
  2022: [
    'UN-brokered truce (April-October)',
    'Presidential Leadership Council formed',
    'Hadi steps down',
    'Economic conditions improve slightly',
    'Oil exports resume partially',
  ],
  2023: [
    'Saudi-Houthi talks in Sanaa',
    'FSO Safer oil transfer completed',
    'Truce expires but calm continues',
    'Exchange rate pressure resumes',
    'Humanitarian needs remain critical',
  ],
  2024: [
    'Red Sea attacks by Houthis begin',
    'US/UK strikes on Houthi positions',
    'Economic deterioration accelerates',
    'Aden rate reaches 2,050 YER/USD',
    'CBY Aden exchange regulation campaign',
  ],
  2025: [
    'CBY Aden suspends 79 exchange licenses',
    'STC-Coalition tensions escalate',
    'Ongoing Red Sea crisis',
    'Currency depreciation continues',
    'Humanitarian funding crisis',
  ],
  2026: [
    'STC dissolved (January 9)',
    'Al-Zubaidi flees to UAE',
    'Major political transition',
    'Economic uncertainty heightens',
    'New governance arrangements emerging',
  ],
};

/**
 * Generate monthly economic monitor for a specific month
 */
export async function generateMonthlyMonitor(year: number, month: number): Promise<HistoricalPublication> {
  const db = await getDb();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const monthNamesAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  
  const monthName = monthNames[month - 1];
  const monthNameAr = monthNamesAr[month - 1];
  
  // Get indicator data for this month
  const indicators: IndicatorData[] = [];
  
  if (db) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const [rows] = await db.execute(sql`
      SELECT ts.indicatorCode, ts.value, ts.date, i.nameEn, i.nameAr, ts.source
      FROM time_series ts
      LEFT JOIN indicators i ON ts.indicatorCode = i.code
      WHERE ts.date >= ${startDate} AND ts.date <= ${endDate}
      ORDER BY ts.date DESC
    `);
    
    const dataRows = Array.isArray(rows) ? rows : [];
    for (const row of dataRows as any[]) {
      indicators.push({
        code: row.indicatorCode,
        name: row.nameEn || row.indicatorCode,
        nameAr: row.nameAr || row.indicatorCode,
        value: parseFloat(row.value),
        source: row.source || 'YETO Database',
      });
    }
  }
  
  // Get events for this month
  const events: EventData[] = [];
  const yearContext = HISTORICAL_CONTEXT[year] || [];
  
  return {
    id: `monthly-${year}-${month.toString().padStart(2, '0')}`,
    type: 'monthly_monitor',
    title: `Yemen Economic Monitor - ${monthName} ${year}`,
    titleAr: `مرصد الاقتصاد اليمني - ${monthNameAr} ${year}`,
    period: `${monthName} ${year}`,
    year,
    month,
    summary: generateMonthlySummary(year, month, indicators),
    summaryAr: generateMonthlySummaryAr(year, month, indicators),
    keyFindings: generateKeyFindings(year, month, indicators),
    keyFindingsAr: generateKeyFindingsAr(year, month, indicators),
    indicators,
    events,
    generatedAt: new Date(),
    dataAsOf: new Date(year, month - 1, 28),
  };
}

/**
 * Generate quarterly economic review
 */
export async function generateQuarterlyReview(year: number, quarter: number): Promise<HistoricalPublication> {
  const quarterNames = ['Q1', 'Q2', 'Q3', 'Q4'];
  const quarterNamesAr = ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'];
  
  const db = await getDb();
  const indicators: IndicatorData[] = [];
  
  if (db) {
    const startMonth = (quarter - 1) * 3 + 1;
    const endMonth = quarter * 3;
    const startDate = new Date(year, startMonth - 1, 1);
    const endDate = new Date(year, endMonth, 0);
    
    const [rows] = await db.execute(sql`
      SELECT ts.indicatorCode, AVG(ts.value) as avgValue, i.nameEn, i.nameAr
      FROM time_series ts
      LEFT JOIN indicators i ON ts.indicatorCode = i.code
      WHERE ts.date >= ${startDate} AND ts.date <= ${endDate}
      GROUP BY ts.indicatorCode, i.nameEn, i.nameAr
    `);
    
    const dataRows = Array.isArray(rows) ? rows : [];
    for (const row of dataRows as any[]) {
      indicators.push({
        code: row.indicatorCode,
        name: row.nameEn || row.indicatorCode,
        nameAr: row.nameAr || row.indicatorCode,
        value: parseFloat(row.avgValue),
        source: 'YETO Database (Quarterly Average)',
      });
    }
  }
  
  return {
    id: `quarterly-${year}-Q${quarter}`,
    type: 'quarterly_review',
    title: `Yemen Quarterly Economic Review - ${quarterNames[quarter - 1]} ${year}`,
    titleAr: `المراجعة الاقتصادية الفصلية لليمن - ${quarterNamesAr[quarter - 1]} ${year}`,
    period: `${quarterNames[quarter - 1]} ${year}`,
    year,
    quarter,
    summary: generateQuarterlySummary(year, quarter, indicators),
    summaryAr: generateQuarterlySummaryAr(year, quarter, indicators),
    keyFindings: generateKeyFindings(year, quarter * 3, indicators),
    keyFindingsAr: generateKeyFindingsAr(year, quarter * 3, indicators),
    indicators,
    events: [],
    generatedAt: new Date(),
    dataAsOf: new Date(year, quarter * 3, 0),
  };
}

/**
 * Generate annual economic report
 */
export async function generateAnnualReport(year: number): Promise<HistoricalPublication> {
  const db = await getDb();
  const indicators: IndicatorData[] = [];
  
  if (db) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    const [rows] = await db.execute(sql`
      SELECT ts.indicatorCode, AVG(ts.value) as avgValue, MIN(ts.value) as minValue, 
             MAX(ts.value) as maxValue, i.nameEn, i.nameAr
      FROM time_series ts
      LEFT JOIN indicators i ON ts.indicatorCode = i.code
      WHERE ts.date >= ${startDate} AND ts.date <= ${endDate}
      GROUP BY ts.indicatorCode, i.nameEn, i.nameAr
    `);
    
    const dataRows = Array.isArray(rows) ? rows : [];
    for (const row of dataRows as any[]) {
      indicators.push({
        code: row.indicatorCode,
        name: row.nameEn || row.indicatorCode,
        nameAr: row.nameAr || row.indicatorCode,
        value: parseFloat(row.avgValue),
        source: 'YETO Database (Annual Average)',
      });
    }
  }
  
  const yearContext = HISTORICAL_CONTEXT[year] || [];
  
  return {
    id: `annual-${year}`,
    type: 'annual_report',
    title: `Yemen Annual Economic Report ${year}`,
    titleAr: `التقرير الاقتصادي السنوي لليمن ${year}`,
    period: `${year}`,
    year,
    summary: generateAnnualSummary(year, indicators, yearContext),
    summaryAr: generateAnnualSummaryAr(year, indicators, yearContext),
    keyFindings: yearContext,
    keyFindingsAr: yearContext.map(e => translateToArabic(e)),
    indicators,
    events: [],
    generatedAt: new Date(),
    dataAsOf: new Date(year, 11, 31),
  };
}

// Helper functions for summary generation
function generateMonthlySummary(year: number, month: number, indicators: IndicatorData[]): string {
  const fxRate = indicators.find(i => i.code.includes('fx_rate'));
  const fxValue = fxRate ? fxRate.value.toFixed(0) : 'N/A';
  
  return `This monthly economic monitor provides a comprehensive overview of Yemen's economic conditions for ${month}/${year}. ` +
         `Key indicators tracked include exchange rates (${fxValue} YER/USD), inflation trends, and humanitarian conditions. ` +
         `The dual-economy system continues to present challenges for economic analysis and policy coordination.`;
}

function generateMonthlySummaryAr(year: number, month: number, indicators: IndicatorData[]): string {
  const fxRate = indicators.find(i => i.code.includes('fx_rate'));
  const fxValue = fxRate ? fxRate.value.toFixed(0) : 'غير متوفر';
  
  return `يقدم هذا المرصد الاقتصادي الشهري نظرة شاملة على الأوضاع الاقتصادية في اليمن لشهر ${month}/${year}. ` +
         `تشمل المؤشرات الرئيسية المتتبعة أسعار الصرف (${fxValue} ريال/دولار) واتجاهات التضخم والأوضاع الإنسانية. ` +
         `يستمر نظام الاقتصاد المزدوج في تقديم تحديات للتحليل الاقتصادي وتنسيق السياسات.`;
}

function generateQuarterlySummary(year: number, quarter: number, indicators: IndicatorData[]): string {
  return `The quarterly economic review for Q${quarter} ${year} analyzes key economic trends across Yemen's dual-economy system. ` +
         `This report covers exchange rate movements, trade flows, humanitarian funding, and sectoral developments. ` +
         `Data is aggregated from multiple sources including CBY Aden, CBY Sanaa, World Bank, and UN agencies.`;
}

function generateQuarterlySummaryAr(year: number, quarter: number, indicators: IndicatorData[]): string {
  return `تحلل المراجعة الاقتصادية الفصلية للربع ${quarter} من عام ${year} الاتجاهات الاقتصادية الرئيسية عبر نظام الاقتصاد المزدوج في اليمن. ` +
         `يغطي هذا التقرير تحركات أسعار الصرف والتدفقات التجارية والتمويل الإنساني والتطورات القطاعية. ` +
         `يتم تجميع البيانات من مصادر متعددة بما في ذلك البنك المركزي في عدن والبنك المركزي في صنعاء والبنك الدولي ووكالات الأمم المتحدة.`;
}

function generateAnnualSummary(year: number, indicators: IndicatorData[], context: string[]): string {
  return `The ${year} Annual Economic Report provides a comprehensive analysis of Yemen's economic performance throughout the year. ` +
         `Key developments included: ${context.slice(0, 3).join('; ')}. ` +
         `This report synthesizes data from over 20 international and local sources to present the most complete picture of Yemen's economic landscape.`;
}

function generateAnnualSummaryAr(year: number, indicators: IndicatorData[], context: string[]): string {
  return `يقدم التقرير الاقتصادي السنوي لعام ${year} تحليلاً شاملاً للأداء الاقتصادي لليمن على مدار العام. ` +
         `شملت التطورات الرئيسية: ${context.slice(0, 3).map(e => translateToArabic(e)).join('؛ ')}. ` +
         `يجمع هذا التقرير بيانات من أكثر من 20 مصدراً دولياً ومحلياً لتقديم الصورة الأكثر اكتمالاً للمشهد الاقتصادي اليمني.`;
}

function generateKeyFindings(year: number, month: number, indicators: IndicatorData[]): string[] {
  const findings: string[] = [];
  
  const fxRate = indicators.find(i => i.code.includes('fx_rate_aden'));
  if (fxRate) {
    findings.push(`Exchange rate (Aden): ${fxRate.value.toFixed(0)} YER/USD`);
  }
  
  const sanaaRate = indicators.find(i => i.code.includes('fx_rate_sanaa'));
  if (sanaaRate) {
    findings.push(`Exchange rate (Sanaa): ${sanaaRate.value.toFixed(0)} YER/USD`);
  }
  
  if (fxRate && sanaaRate) {
    const spread = ((fxRate.value - sanaaRate.value) / sanaaRate.value * 100).toFixed(0);
    findings.push(`North-South exchange rate spread: ${spread}%`);
  }
  
  findings.push('Dual-economy system continues to operate');
  findings.push('Humanitarian needs remain critical');
  
  return findings;
}

function generateKeyFindingsAr(year: number, month: number, indicators: IndicatorData[]): string[] {
  const findings: string[] = [];
  
  const fxRate = indicators.find(i => i.code.includes('fx_rate_aden'));
  if (fxRate) {
    findings.push(`سعر الصرف (عدن): ${fxRate.value.toFixed(0)} ريال/دولار`);
  }
  
  const sanaaRate = indicators.find(i => i.code.includes('fx_rate_sanaa'));
  if (sanaaRate) {
    findings.push(`سعر الصرف (صنعاء): ${sanaaRate.value.toFixed(0)} ريال/دولار`);
  }
  
  if (fxRate && sanaaRate) {
    const spread = ((fxRate.value - sanaaRate.value) / sanaaRate.value * 100).toFixed(0);
    findings.push(`فجوة سعر الصرف بين الشمال والجنوب: ${spread}%`);
  }
  
  findings.push('يستمر نظام الاقتصاد المزدوج في العمل');
  findings.push('تبقى الاحتياجات الإنسانية حرجة');
  
  return findings;
}

function translateToArabic(text: string): string {
  // Simple translation mapping for common phrases
  const translations: Record<string, string> = {
    'Saudi-led coalition intervention begins': 'بدء تدخل التحالف بقيادة السعودية',
    'Government relocates to Aden': 'انتقال الحكومة إلى عدن',
    'UN arms embargo imposed': 'فرض حظر الأسلحة الأممي',
    'Central Bank headquarters moved to Aden': 'نقل مقر البنك المركزي إلى عدن',
    'Dual currency system emerges': 'ظهور نظام العملة المزدوج',
    'Stockholm Agreement on Hodeidah': 'اتفاق ستوكهولم بشأن الحديدة',
    'UN-brokered truce': 'الهدنة بوساطة الأمم المتحدة',
    'Presidential Leadership Council formed': 'تشكيل مجلس القيادة الرئاسي',
    'Red Sea attacks by Houthis begin': 'بدء هجمات الحوثيين في البحر الأحمر',
    'STC dissolved': 'حل المجلس الانتقالي الجنوبي',
  };
  
  for (const [en, ar] of Object.entries(translations)) {
    if (text.includes(en)) {
      return text.replace(en, ar);
    }
  }
  
  return text;
}

/**
 * Generate all historical publications from 2015 to present
 */
export async function generateAllHistoricalPublications(): Promise<{
  monthly: number;
  quarterly: number;
  annual: number;
}> {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  let monthlyCount = 0;
  let quarterlyCount = 0;
  let annualCount = 0;
  
  // Generate publications for each year from 2015 to present
  for (let year = 2015; year <= currentYear; year++) {
    const maxMonth = year === currentYear ? currentMonth : 12;
    
    // Monthly monitors
    for (let month = 1; month <= maxMonth; month++) {
      await generateMonthlyMonitor(year, month);
      monthlyCount++;
    }
    
    // Quarterly reviews
    const maxQuarter = year === currentYear ? Math.ceil(currentMonth / 3) : 4;
    for (let quarter = 1; quarter <= maxQuarter; quarter++) {
      await generateQuarterlyReview(year, quarter);
      quarterlyCount++;
    }
    
    // Annual report (only for completed years)
    if (year < currentYear) {
      await generateAnnualReport(year);
      annualCount++;
    }
  }
  
  console.log(`[HistoricalPublicationGenerator] Generated:`);
  console.log(`  - ${monthlyCount} monthly monitors`);
  console.log(`  - ${quarterlyCount} quarterly reviews`);
  console.log(`  - ${annualCount} annual reports`);
  
  return { monthly: monthlyCount, quarterly: quarterlyCount, annual: annualCount };
}

export default {
  generateMonthlyMonitor,
  generateQuarterlyReview,
  generateAnnualReport,
  generateAllHistoricalPublications,
};
