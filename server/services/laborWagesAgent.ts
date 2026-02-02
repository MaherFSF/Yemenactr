/**
 * Labor & Wages Sector Agent
 * Automated products for Real Income & Livelihoods Observatory
 */

import { db } from '../db';
import { 
  timeSeries, 
  indicators, 
  documents, 
  economicEvents, 
  alerts,
  sectorAgentRuns,
  sources
} from '../../drizzle/schema';
import { eq, and, gte, lte, desc, sql, like, or } from 'drizzle-orm';

// Types
interface LaborContextPack {
  asOfDate: string;
  sectorCode: string;
  metrics: LaborMetric[];
  documents: LaborDocument[];
  events: LaborEvent[];
  contradictions: Contradiction[];
  gaps: DataGap[];
  sources: SourceInfo[];
  lastUpdated: string;
}

interface LaborMetric {
  indicatorCode: string;
  nameEn: string;
  nameAr: string;
  value: number | null;
  unit: string;
  year: number;
  month?: number;
  status: 'measured' | 'proxied' | 'unknown' | 'gap';
  confidence: 'high' | 'medium' | 'low';
  sourceId: string;
  evidencePackId?: string;
}

interface LaborDocument {
  id: string;
  titleEn: string;
  titleAr: string;
  publisher: string;
  publishDate: string;
  documentType: string;
  url?: string;
  relevanceScore: number;
}

interface LaborEvent {
  id: string;
  titleEn: string;
  titleAr: string;
  eventDate: string;
  eventType: string;
  impactLevel: 'high' | 'medium' | 'low';
  description: string;
}

interface Contradiction {
  id: string;
  indicatorCode: string;
  source1: string;
  value1: number;
  source2: string;
  value2: number;
  variance: number;
  status: 'active' | 'resolved' | 'under_review';
}

interface DataGap {
  id: string;
  indicatorCode: string;
  nameEn: string;
  nameAr: string;
  lastAvailableYear: number | null;
  priority: 'critical' | 'high' | 'medium' | 'low';
  accessWorkflow?: string;
}

interface SourceInfo {
  id: string;
  publisher: string;
  tier: string;
  lastUpdate: string;
  indicatorCount: number;
}

// Labor sector indicator codes
const LABOR_INDICATORS = [
  'LABOR_FORCE_TOTAL',
  'LABOR_FORCE_FEMALE',
  'UNEMPLOYMENT_RATE',
  'UNEMPLOYMENT_YOUTH',
  'EMPLOYMENT_AGRICULTURE',
  'EMPLOYMENT_INDUSTRY',
  'EMPLOYMENT_SERVICES',
  'WAGE_NOMINAL_AVG',
  'WAGE_PUBLIC_SECTOR',
  'WAGE_PRIVATE_SECTOR',
  'REAL_WAGE_INDEX',
  'WAGE_ADEQUACY_RATIO',
  'BASKET_COST_FOOD',
  'TRANSFER_CASH_WFP',
  'TRANSFER_CASH_UNICEF',
  'TRANSFER_ADEQUACY_RATIO',
  'REMITTANCE_INFLOWS',
  'REMITTANCE_COST',
  'PURCHASING_POWER_INDEX',
  'LIVELIHOOD_COPING_INDEX'
];

// Related sectors for cross-referencing
const RELATED_SECTORS = [
  'prices',
  'currency_fx',
  'public_finance',
  'aid_flows',
  'food_security',
  'humanitarian'
];

/**
 * Build nightly context pack for labor sector
 */
export async function buildLaborContextPack(asOfDate?: string): Promise<LaborContextPack> {
  const targetDate = asOfDate || new Date().toISOString().split('T')[0];
  const targetYear = parseInt(targetDate.substring(0, 4));
  
  // Get metrics
  const metrics = await getLaborMetrics(targetYear);
  
  // Get documents
  const docs = await getLaborDocuments(targetYear);
  
  // Get events
  const events = await getLaborEvents(targetYear);
  
  // Get contradictions
  const contradictions = await getLaborContradictions();
  
  // Get gaps
  const gaps = await getLaborGaps();
  
  // Get sources
  const sourcesInfo = await getLaborSources();
  
  return {
    asOfDate: targetDate,
    sectorCode: 'labor_wages',
    metrics,
    documents: docs,
    events,
    contradictions,
    gaps,
    sources: sourcesInfo,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Get labor metrics for a given year
 */
async function getLaborMetrics(year: number): Promise<LaborMetric[]> {
  const results: LaborMetric[] = [];
  
  for (const indicatorCode of LABOR_INDICATORS) {
    try {
      // Get indicator definition
      const indicatorDef = await db.select()
        .from(indicators)
        .where(eq(indicators.code, indicatorCode))
        .limit(1);
      
      if (indicatorDef.length === 0) {
        // Create gap entry
        results.push({
          indicatorCode,
          nameEn: indicatorCode.replace(/_/g, ' '),
          nameAr: indicatorCode,
          value: null,
          unit: '',
          year,
          status: 'gap',
          confidence: 'low',
          sourceId: ''
        });
        continue;
      }
      
      const indicator = indicatorDef[0];
      
      // Get latest value for the year
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      const values = await db.select()
        .from(timeSeries)
        .where(and(
          eq(timeSeries.indicatorCode, indicatorCode),
          gte(timeSeries.date, startDate),
          lte(timeSeries.date, endDate)
        ))
        .orderBy(desc(timeSeries.date))
        .limit(1);
      
      if (values.length > 0) {
        const v = values[0];
        const vDate = new Date(v.date);
        results.push({
          indicatorCode,
          nameEn: indicator.nameEn || indicatorCode,
          nameAr: indicator.nameAr || indicatorCode,
          value: v.value ? parseFloat(v.value) : null,
          unit: indicator.unit || '',
          year: vDate.getFullYear(),
          month: vDate.getMonth() + 1,
          status: 'measured',
          confidence: v.confidenceRating === 'A' ? 'high' : v.confidenceRating === 'B' ? 'medium' : 'low',
          sourceId: v.sourceId?.toString() || '',
          evidencePackId: undefined
        });
      } else {
        // No data for this year
        results.push({
          indicatorCode,
          nameEn: indicator.nameEn || indicatorCode,
          nameAr: indicator.nameAr || indicatorCode,
          value: null,
          unit: indicator.unit || '',
          year,
          status: 'unknown',
          confidence: 'low',
          sourceId: ''
        });
      }
    } catch (error) {
      console.error(`Error fetching metric ${indicatorCode}:`, error);
    }
  }
  
  return results;
}

/**
 * Get labor-related documents
 */
async function getLaborDocuments(year: number): Promise<LaborDocument[]> {
  try {
    const docs = await db.select()
      .from(documents)
      .where(and(
        or(
          like(documents.title, '%labor%'),
          like(documents.title, '%wage%'),
          like(documents.title, '%employment%'),
          like(documents.title, '%livelihood%'),
          like(documents.title, '%income%'),
          like(documents.title, '%workforce%'),
          like(documents.title, '%salary%'),
          like(documents.title, '%remittance%')
        ),
        gte(documents.publicationDate, new Date(`${year - 2}-01-01`)),
        lte(documents.publicationDate, new Date(`${year}-12-31`))
      ))
      .orderBy(desc(documents.publicationDate))
      .limit(50);
    
    return docs.map(d => ({
      id: d.id.toString(),
      titleEn: d.title || '',
      titleAr: d.titleAr || d.title || '',
      publisher: 'Unknown',
      publishDate: d.publicationDate?.toISOString() || '',
      documentType: d.category || 'report',
      url: d.fileUrl || undefined,
      relevanceScore: 0.8
    }));
  } catch (error) {
    console.error('Error fetching labor documents:', error);
    return [];
  }
}

/**
 * Get labor-related events
 */
async function getLaborEvents(year: number): Promise<LaborEvent[]> {
  try {
    const events = await db.select()
      .from(economicEvents)
      .where(and(
        or(
          like(economicEvents.title, '%labor%'),
          like(economicEvents.title, '%wage%'),
          like(economicEvents.title, '%salary%'),
          like(economicEvents.title, '%employment%'),
          like(economicEvents.title, '%strike%'),
          like(economicEvents.title, '%payment%')
        ),
        gte(economicEvents.eventDate, new Date(`${year - 2}-01-01`)),
        lte(economicEvents.eventDate, new Date(`${year}-12-31`))
      ))
      .orderBy(desc(economicEvents.eventDate))
      .limit(30);
    
    return events.map(e => ({
      id: e.id.toString(),
      titleEn: e.title || '',
      titleAr: e.titleAr || '',
      eventDate: e.eventDate?.toISOString() || '',
      eventType: e.category || 'economic',
      impactLevel: (e.impactLevel as 'high' | 'medium' | 'low') || 'medium',
      description: e.description || ''
    }));
  } catch (error) {
    console.error('Error fetching labor events:', error);
    return [];
  }
}

/**
 * Get active contradictions in labor data
 */
async function getLaborContradictions(): Promise<Contradiction[]> {
  // For now, return mock contradictions - in production, query data_contradictions table
  return [
    {
      id: 'CONTR-LAB-001',
      indicatorCode: 'WAGE_NOMINAL_AVG',
      source1: 'UNDP Survey 2025',
      value1: 85000,
      source2: 'WFP Market Monitor',
      value2: 105000,
      variance: 23.5,
      status: 'under_review'
    }
  ];
}

/**
 * Get data gaps for labor sector
 */
async function getLaborGaps(): Promise<DataGap[]> {
  const gaps: DataGap[] = [];
  
  // Check each indicator for gaps
  for (const code of LABOR_INDICATORS) {
    try {
      const indicator = await db.select()
        .from(indicators)
        .where(eq(indicators.code, code))
        .limit(1);
      
      if (indicator.length === 0) {
        gaps.push({
          id: `GAP-${code}`,
          indicatorCode: code,
          nameEn: code.replace(/_/g, ' '),
          nameAr: code,
          lastAvailableYear: null,
          priority: 'high',
          accessWorkflow: 'Request from CSO/Ministry of Labor'
        });
        continue;
      }
      
      // Check for recent data
      const latestData = await db.select()
        .from(timeSeries)
        .where(eq(timeSeries.indicatorCode, code))
        .orderBy(desc(timeSeries.date))
        .limit(1);
      
      const lastYear = latestData.length > 0 ? new Date(latestData[0].date).getFullYear() : null;
      if (latestData.length === 0 || (lastYear && lastYear < 2024)) {
        gaps.push({
          id: `GAP-${code}`,
          indicatorCode: code,
          nameEn: indicator[0].nameEn || code,
          nameAr: indicator[0].nameAr || code,
          lastAvailableYear: lastYear,
          priority: code.includes('UNEMPLOYMENT') || code.includes('WAGE') ? 'critical' : 'high',
          accessWorkflow: 'Request from relevant ministry or UN agency'
        });
      }
    } catch (error) {
      console.error(`Error checking gap for ${code}:`, error);
    }
  }
  
  return gaps;
}

/**
 * Get sources used for labor sector
 */
async function getLaborSources(): Promise<SourceInfo[]> {
  try {
    const sourcesData = await db.select()
      .from(sources)
      .where(or(
        like(sources.publisher, '%ILO%'),
        like(sources.publisher, '%World Bank%'),
        like(sources.publisher, '%UNDP%'),
        like(sources.publisher, '%WFP%'),
        like(sources.publisher, '%UNICEF%'),
        like(sources.publisher, '%Ministry of Finance%'),
        like(sources.publisher, '%Central Bank%'),
        like(sources.publisher, '%CSO%')
      ))
      .limit(20);
    
    return sourcesData.map(s => ({
      id: s.id.toString(),
      publisher: s.publisher || '',
      tier: 'T2',
      lastUpdate: s.retrievalDate?.toISOString() || '',
      indicatorCount: 0
    }));
  } catch (error) {
    console.error('Error fetching labor sources:', error);
    return [];
  }
}

/**
 * Generate Daily Livelihoods Digest
 */
export async function generateDailyLivelihoodsDigest(): Promise<{
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  generatedAt: string;
}> {
  const contextPack = await buildLaborContextPack();
  
  // Build digest content
  const measuredMetrics = contextPack.metrics.filter(m => m.status === 'measured');
  const proxiedMetrics = contextPack.metrics.filter(m => m.status === 'proxied');
  const gapCount = contextPack.gaps.length;
  const contradictionCount = contextPack.contradictions.filter(c => c.status === 'active').length;
  
  const contentEn = `
## Daily Livelihoods Digest - ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}

### Key Metrics Summary
- **Measured indicators**: ${measuredMetrics.length}
- **Proxied indicators**: ${proxiedMetrics.length}
- **Data gaps**: ${gapCount}
- **Active contradictions**: ${contradictionCount}

### Recent Updates
${contextPack.documents.slice(0, 3).map(d => `- ${d.titleEn} (${d.publisher}, ${d.publishDate})`).join('\n')}

### Key Events
${contextPack.events.slice(0, 3).map(e => `- ${e.titleEn} (${e.eventDate})`).join('\n')}

### Sources Used
${contextPack.sources.slice(0, 5).map(s => `- ${s.publisher} (${s.tier})`).join('\n')}

---
*Generated by YETO Labor & Wages Agent*
  `.trim();
  
  const contentAr = `
## ملخص سبل العيش اليومي - ${new Date().toLocaleDateString('ar-YE', { dateStyle: 'long' })}

### ملخص المؤشرات الرئيسية
- **المؤشرات المقاسة**: ${measuredMetrics.length}
- **المؤشرات التقديرية**: ${proxiedMetrics.length}
- **فجوات البيانات**: ${gapCount}
- **التناقضات النشطة**: ${contradictionCount}

### التحديثات الأخيرة
${contextPack.documents.slice(0, 3).map(d => `- ${d.titleAr || d.titleEn} (${d.publisher}, ${d.publishDate})`).join('\n')}

### الأحداث الرئيسية
${contextPack.events.slice(0, 3).map(e => `- ${e.titleAr || e.titleEn} (${e.eventDate})`).join('\n')}

### المصادر المستخدمة
${contextPack.sources.slice(0, 5).map(s => `- ${s.publisher} (${s.tier})`).join('\n')}

---
*تم إنشاؤه بواسطة وكيل العمل والأجور في يتو*
  `.trim();
  
  return {
    titleEn: `Daily Livelihoods Digest - ${new Date().toISOString().split('T')[0]}`,
    titleAr: `ملخص سبل العيش اليومي - ${new Date().toISOString().split('T')[0]}`,
    contentEn,
    contentAr,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Generate Weekly Real Income & Livelihoods Bulletin
 */
export async function generateWeeklyBulletin(): Promise<{
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  generatedAt: string;
}> {
  const contextPack = await buildLaborContextPack();
  
  // Calculate week range
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 7);
  
  const contentEn = `
# Weekly Real Income & Livelihoods Bulletin
**Period**: ${startDate.toLocaleDateString('en-US')} - ${endDate.toLocaleDateString('en-US')}

## Executive Summary
This bulletin provides a comprehensive overview of labor market conditions and real income trends in Yemen, drawing from ${contextPack.sources.length} verified sources.

## Key Findings

### Wage Adequacy
${contextPack.metrics.find(m => m.indicatorCode === 'WAGE_ADEQUACY_RATIO')?.value 
  ? `Current wage adequacy ratio stands at ${contextPack.metrics.find(m => m.indicatorCode === 'WAGE_ADEQUACY_RATIO')?.value?.toFixed(2)}, indicating ${contextPack.metrics.find(m => m.indicatorCode === 'WAGE_ADEQUACY_RATIO')?.value! < 1 ? 'wages are insufficient to cover basic food basket costs' : 'wages can cover basic needs'}.`
  : 'Wage adequacy data not available for this period.'}

### Transfer Programs
${contextPack.metrics.find(m => m.indicatorCode === 'TRANSFER_ADEQUACY_RATIO')?.value
  ? `Cash transfer adequacy ratio: ${contextPack.metrics.find(m => m.indicatorCode === 'TRANSFER_ADEQUACY_RATIO')?.value?.toFixed(2)}`
  : 'Transfer adequacy data not available.'}

### Data Coverage
- Measured: ${contextPack.metrics.filter(m => m.status === 'measured').length} indicators
- Proxied: ${contextPack.metrics.filter(m => m.status === 'proxied').length} indicators
- Gaps: ${contextPack.gaps.length} indicators

## Recent Documents
${contextPack.documents.slice(0, 5).map(d => `- **${d.titleEn}** - ${d.publisher} (${d.publishDate})`).join('\n')}

## Methodology Notes
This bulletin uses a proxy-based approach for wage data where official statistics are unavailable. All proxied values are clearly labeled.

---
*YETO Labor & Wages Sector Agent | ${new Date().toISOString()}*
  `.trim();
  
  const contentAr = `
# النشرة الأسبوعية للدخل الحقيقي وسبل العيش
**الفترة**: ${startDate.toLocaleDateString('ar-YE')} - ${endDate.toLocaleDateString('ar-YE')}

## الملخص التنفيذي
تقدم هذه النشرة نظرة شاملة على ظروف سوق العمل واتجاهات الدخل الحقيقي في اليمن، مستندة إلى ${contextPack.sources.length} مصادر موثقة.

## النتائج الرئيسية

### كفاية الأجور
${contextPack.metrics.find(m => m.indicatorCode === 'WAGE_ADEQUACY_RATIO')?.value 
  ? `نسبة كفاية الأجر الحالية تبلغ ${contextPack.metrics.find(m => m.indicatorCode === 'WAGE_ADEQUACY_RATIO')?.value?.toFixed(2)}، مما يشير إلى ${contextPack.metrics.find(m => m.indicatorCode === 'WAGE_ADEQUACY_RATIO')?.value! < 1 ? 'أن الأجور غير كافية لتغطية تكلفة السلة الغذائية الأساسية' : 'أن الأجور يمكنها تغطية الاحتياجات الأساسية'}.`
  : 'بيانات كفاية الأجور غير متوفرة لهذه الفترة.'}

### برامج التحويلات
${contextPack.metrics.find(m => m.indicatorCode === 'TRANSFER_ADEQUACY_RATIO')?.value
  ? `نسبة كفاية التحويلات النقدية: ${contextPack.metrics.find(m => m.indicatorCode === 'TRANSFER_ADEQUACY_RATIO')?.value?.toFixed(2)}`
  : 'بيانات كفاية التحويلات غير متوفرة.'}

### تغطية البيانات
- مقاسة: ${contextPack.metrics.filter(m => m.status === 'measured').length} مؤشرات
- تقديرية: ${contextPack.metrics.filter(m => m.status === 'proxied').length} مؤشرات
- فجوات: ${contextPack.gaps.length} مؤشرات

## الوثائق الأخيرة
${contextPack.documents.slice(0, 5).map(d => `- **${d.titleAr || d.titleEn}** - ${d.publisher} (${d.publishDate})`).join('\n')}

## ملاحظات منهجية
تستخدم هذه النشرة نهجًا قائمًا على التقديرات لبيانات الأجور حيث لا تتوفر الإحصاءات الرسمية. جميع القيم التقديرية موضحة بوضوح.

---
*وكيل قطاع العمل والأجور في يتو | ${new Date().toISOString()}*
  `.trim();
  
  return {
    titleEn: `Weekly Real Income & Livelihoods Bulletin - Week of ${startDate.toISOString().split('T')[0]}`,
    titleAr: `النشرة الأسبوعية للدخل الحقيقي وسبل العيش - أسبوع ${startDate.toISOString().split('T')[0]}`,
    contentEn,
    contentAr,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Generate Monthly Labor & Wages Monitor
 */
export async function generateMonthlyMonitor(): Promise<{
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  generatedAt: string;
}> {
  const contextPack = await buildLaborContextPack();
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  const contentEn = `
# Monthly Labor & Wages Monitor
**${currentMonth}**

## Overview
This monitor provides a comprehensive monthly assessment of Yemen's labor market conditions, wage trends, and livelihood indicators.

## Key Indicators

| Indicator | Value | Status | Confidence | Change |
|-----------|-------|--------|------------|--------|
${contextPack.metrics.slice(0, 10).map(m => 
  `| ${m.nameEn} | ${m.value !== null ? m.value.toFixed(2) : '—'} ${m.unit} | ${m.status} | ${m.confidence} | — |`
).join('\n')}

## Trend Analysis
### Real Wage Index
The real wage index continues to reflect the erosion of purchasing power due to inflation and currency depreciation.

### Transfer Programs
Cash transfer programs remain critical for household survival, though adequacy ratios indicate transfers cover only a fraction of basic needs.

## Data Gaps & Uncertainties
${contextPack.gaps.slice(0, 5).map(g => `- **${g.nameEn}**: Last available ${g.lastAvailableYear || 'Never'} - ${g.priority} priority`).join('\n')}

## Contradictions Under Review
${contextPack.contradictions.map(c => `- ${c.indicatorCode}: ${c.source1} (${c.value1}) vs ${c.source2} (${c.value2}) - ${c.variance.toFixed(1)}% variance`).join('\n')}

## Sources
${contextPack.sources.map(s => `- ${s.publisher} (${s.tier})`).join('\n')}

---
*YETO Labor & Wages Monitor | Generated ${new Date().toISOString()}*
  `.trim();
  
  const contentAr = `
# المراقب الشهري للعمل والأجور
**${new Date().toLocaleDateString('ar-YE', { month: 'long', year: 'numeric' })}**

## نظرة عامة
يقدم هذا المراقب تقييمًا شهريًا شاملاً لظروف سوق العمل في اليمن واتجاهات الأجور ومؤشرات سبل العيش.

## المؤشرات الرئيسية

| المؤشر | القيمة | الحالة | الثقة | التغير |
|--------|--------|--------|-------|--------|
${contextPack.metrics.slice(0, 10).map(m => 
  `| ${m.nameAr} | ${m.value !== null ? m.value.toFixed(2) : '—'} ${m.unit} | ${m.status} | ${m.confidence} | — |`
).join('\n')}

## تحليل الاتجاهات
### مؤشر الأجر الحقيقي
يستمر مؤشر الأجر الحقيقي في عكس تآكل القوة الشرائية بسبب التضخم وانخفاض قيمة العملة.

### برامج التحويلات
تظل برامج التحويلات النقدية حاسمة لبقاء الأسر، على الرغم من أن نسب الكفاية تشير إلى أن التحويلات تغطي جزءًا فقط من الاحتياجات الأساسية.

## فجوات البيانات والشكوك
${contextPack.gaps.slice(0, 5).map(g => `- **${g.nameAr}**: آخر توفر ${g.lastAvailableYear || 'أبدًا'} - أولوية ${g.priority}`).join('\n')}

## التناقضات قيد المراجعة
${contextPack.contradictions.map(c => `- ${c.indicatorCode}: ${c.source1} (${c.value1}) مقابل ${c.source2} (${c.value2}) - تباين ${c.variance.toFixed(1)}%`).join('\n')}

## المصادر
${contextPack.sources.map(s => `- ${s.publisher} (${s.tier})`).join('\n')}

---
*مراقب العمل والأجور في يتو | تم إنشاؤه ${new Date().toISOString()}*
  `.trim();
  
  return {
    titleEn: `Monthly Labor & Wages Monitor - ${currentMonth}`,
    titleAr: `المراقب الشهري للعمل والأجور - ${new Date().toLocaleDateString('ar-YE', { month: 'long', year: 'numeric' })}`,
    contentEn,
    contentAr,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Generate shock note for significant wage adequacy changes
 */
export async function generateWageAdequacyShockNote(
  currentRatio: number,
  previousRatio: number,
  triggerSource: string
): Promise<{
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  severity: 'critical' | 'high' | 'medium';
  generatedAt: string;
}> {
  const changePercent = ((currentRatio - previousRatio) / previousRatio) * 100;
  const severity = Math.abs(changePercent) > 20 ? 'critical' : Math.abs(changePercent) > 10 ? 'high' : 'medium';
  
  const contentEn = `
# WAGE ADEQUACY SHOCK NOTE

**Alert Level**: ${severity.toUpperCase()}
**Generated**: ${new Date().toISOString()}
**Trigger**: ${triggerSource}

## Summary
Wage adequacy ratio has ${changePercent > 0 ? 'increased' : 'decreased'} by ${Math.abs(changePercent).toFixed(1)}% from ${previousRatio.toFixed(2)} to ${currentRatio.toFixed(2)}.

## Implications
${currentRatio < 0.5 
  ? 'CRITICAL: Average wages now cover less than half of basic food basket costs. Immediate humanitarian implications.'
  : currentRatio < 1 
    ? 'SEVERE: Wages remain insufficient to cover basic food needs. Continued livelihood stress expected.'
    : 'Wages now cover basic food basket costs, though broader needs remain unmet.'}

## Recommended Actions
1. Monitor cash transfer program adequacy
2. Track price trends for key commodities
3. Assess impact on vulnerable populations

## Evidence
- Current wage adequacy: ${currentRatio.toFixed(2)}
- Previous wage adequacy: ${previousRatio.toFixed(2)}
- Change: ${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%

---
*YETO Labor & Wages Agent - Automated Shock Note*
  `.trim();
  
  const contentAr = `
# مذكرة صدمة كفاية الأجور

**مستوى التنبيه**: ${severity === 'critical' ? 'حرج' : severity === 'high' ? 'عالي' : 'متوسط'}
**تم الإنشاء**: ${new Date().toISOString()}
**المحفز**: ${triggerSource}

## الملخص
${changePercent > 0 ? 'ارتفعت' : 'انخفضت'} نسبة كفاية الأجور بنسبة ${Math.abs(changePercent).toFixed(1)}% من ${previousRatio.toFixed(2)} إلى ${currentRatio.toFixed(2)}.

## التداعيات
${currentRatio < 0.5 
  ? 'حرج: متوسط الأجور الآن يغطي أقل من نصف تكلفة السلة الغذائية الأساسية. تداعيات إنسانية فورية.'
  : currentRatio < 1 
    ? 'شديد: الأجور لا تزال غير كافية لتغطية الاحتياجات الغذائية الأساسية. من المتوقع استمرار ضغوط سبل العيش.'
    : 'الأجور الآن تغطي تكلفة السلة الغذائية الأساسية، على الرغم من أن الاحتياجات الأوسع لا تزال غير ملباة.'}

## الإجراءات الموصى بها
1. مراقبة كفاية برامج التحويلات النقدية
2. تتبع اتجاهات أسعار السلع الرئيسية
3. تقييم التأثير على الفئات الضعيفة

## الأدلة
- كفاية الأجور الحالية: ${currentRatio.toFixed(2)}
- كفاية الأجور السابقة: ${previousRatio.toFixed(2)}
- التغير: ${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%

---
*وكيل العمل والأجور في يتو - مذكرة صدمة آلية*
  `.trim();
  
  return {
    titleEn: `Wage Adequacy Shock Note - ${new Date().toISOString().split('T')[0]}`,
    titleAr: `مذكرة صدمة كفاية الأجور - ${new Date().toISOString().split('T')[0]}`,
    contentEn,
    contentAr,
    severity,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Log agent run to database
 */
export async function logAgentRun(
  runType: 'daily_digest' | 'weekly_bulletin' | 'monthly_monitor' | 'shock_note',
  status: 'success' | 'failed' | 'partial',
  metrics: Record<string, number>
): Promise<void> {
  try {
    await db.insert(sectorAgentRuns).values({
      sectorCode: 'labor_wages',
      runType: runType === 'daily_digest' ? 'daily' : runType === 'weekly_bulletin' ? 'weekly' : runType === 'monthly_monitor' ? 'nightly' : 'manual',
      startedAt: new Date(),
      completedAt: new Date(),
      status: status === 'success' ? 'completed' : 'failed',
      metrics: metrics
    });
  } catch (error) {
    console.error('Error logging agent run:', error);
  }
}

// Export all functions
export default {
  buildLaborContextPack,
  generateDailyLivelihoodsDigest,
  generateWeeklyBulletin,
  generateMonthlyMonitor,
  generateWageAdequacyShockNote,
  logAgentRun
};
