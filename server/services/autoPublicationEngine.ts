/**
 * Auto-Publication Engine
 * 
 * Automatically generates and publishes reports based on:
 * - Scheduled intervals (daily, weekly, monthly)
 * - Data threshold triggers (significant changes)
 * - Event-based triggers (new data ingestion)
 * 
 * Report Types:
 * - Daily Market Snapshot
 * - Weekly Economic Digest
 * - Monthly Comprehensive Report
 * - Alert Reports (triggered by anomalies)
 */

import { getDb } from '../db';
import { timeSeries, economicEvents, documents } from '../../drizzle/schema';
import { eq, desc, gte, and, sql } from 'drizzle-orm';

// Publication types
export type PublicationType = 
  | 'daily_snapshot'
  | 'weekly_digest'
  | 'monthly_report'
  | 'quarterly_analysis'
  | 'alert_report'
  | 'special_report';

export type PublicationStatus = 'draft' | 'review' | 'approved' | 'published' | 'archived';

export interface PublicationConfig {
  type: PublicationType;
  schedule: string; // cron expression
  enabled: boolean;
  recipients: string[];
  indicators: string[];
  template: string;
  autoApprove: boolean;
}

export interface GeneratedReport {
  id: string;
  type: PublicationType;
  title: string;
  titleAr: string;
  summary: string;
  summaryAr: string;
  content: ReportSection[];
  generatedAt: Date;
  status: PublicationStatus;
  dataSnapshot: DataSnapshot;
}

export interface ReportSection {
  heading: string;
  headingAr: string;
  content: string;
  contentAr: string;
  charts?: ChartConfig[];
  tables?: TableConfig[];
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  data: { label: string; value: number }[];
}

export interface TableConfig {
  headers: string[];
  rows: string[][];
}

export interface DataSnapshot {
  timestamp: Date;
  indicators: IndicatorSnapshot[];
  events: EventSnapshot[];
}

export interface IndicatorSnapshot {
  code: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface EventSnapshot {
  id: number;
  title: string;
  date: Date;
  category: string;
}

// Default publication configurations
export const DEFAULT_PUBLICATION_CONFIGS: PublicationConfig[] = [
  {
    type: 'daily_snapshot',
    schedule: '0 6 * * *', // 6 AM daily
    enabled: true,
    recipients: ['subscribers'],
    indicators: ['CBY_FX_PARALLEL_ADEN', 'CBY_FX_PARALLEL_SANAA', 'CBY_INFLATION_ADEN'],
    template: 'daily_snapshot',
    autoApprove: true,
  },
  {
    type: 'weekly_digest',
    schedule: '0 8 * * 0', // 8 AM every Sunday
    enabled: true,
    recipients: ['subscribers', 'partners'],
    indicators: ['CBY_FX_PARALLEL_ADEN', 'CBY_FX_PARALLEL_SANAA', 'CBY_INFLATION_ADEN', 'UNHCR_IDPS', 'WFP_FOOD_PRICES'],
    template: 'weekly_digest',
    autoApprove: false,
  },
  {
    type: 'monthly_report',
    schedule: '0 9 1 * *', // 9 AM on 1st of each month
    enabled: true,
    recipients: ['subscribers', 'partners', 'institutions'],
    indicators: ['*'], // All indicators
    template: 'monthly_comprehensive',
    autoApprove: false,
  },
  {
    type: 'quarterly_analysis',
    schedule: '0 10 1 1,4,7,10 *', // 10 AM on 1st of Jan, Apr, Jul, Oct
    enabled: true,
    recipients: ['institutions'],
    indicators: ['*'],
    template: 'quarterly_analysis',
    autoApprove: false,
  },
];

/**
 * Auto-Publication Engine Service
 */
export class AutoPublicationEngine {
  private configs: PublicationConfig[] = DEFAULT_PUBLICATION_CONFIGS;
  
  constructor() {
    console.log('[AutoPublicationEngine] Initialized with', this.configs.length, 'publication configs');
  }

  /**
   * Generate a daily market snapshot report
   */
  async generateDailySnapshot(): Promise<GeneratedReport> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Fetch latest exchange rates
    const fxAden = await this.getLatestIndicator('CBY_FX_PARALLEL_ADEN', 'aden_irg');
    const fxSanaa = await this.getLatestIndicator('CBY_FX_PARALLEL_SANAA', 'sanaa_defacto');
    const inflation = await this.getLatestIndicator('CBY_INFLATION_ADEN', 'aden_irg');

    const indicators: IndicatorSnapshot[] = [
      this.createIndicatorSnapshot('Exchange Rate (Aden)', fxAden),
      this.createIndicatorSnapshot('Exchange Rate (Sana\'a)', fxSanaa),
      this.createIndicatorSnapshot('Inflation Rate (Aden)', inflation),
    ].filter(i => i !== null) as IndicatorSnapshot[];

    const report: GeneratedReport = {
      id: `daily_${today.toISOString().split('T')[0]}`,
      type: 'daily_snapshot',
      title: `Daily Market Snapshot - ${today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
      titleAr: `لمحة السوق اليومية - ${today.toLocaleDateString('ar-YE', { month: 'long', day: 'numeric', year: 'numeric' })}`,
      summary: this.generateDailySummary(indicators),
      summaryAr: this.generateDailySummaryAr(indicators),
      content: this.generateDailyContent(indicators),
      generatedAt: today,
      status: 'draft',
      dataSnapshot: {
        timestamp: today,
        indicators,
        events: [],
      },
    };

    return report;
  }

  /**
   * Generate a weekly economic digest
   */
  async generateWeeklyDigest(): Promise<GeneratedReport> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Fetch key indicators with weekly comparison
    const indicators: IndicatorSnapshot[] = [];
    
    const indicatorCodes = [
      { code: 'CBY_FX_PARALLEL_ADEN', regime: 'aden_irg' as const, name: 'Exchange Rate (Aden)' },
      { code: 'CBY_FX_PARALLEL_SANAA', regime: 'sanaa_defacto' as const, name: 'Exchange Rate (Sana\'a)' },
      { code: 'CBY_INFLATION_ADEN', regime: 'aden_irg' as const, name: 'Inflation Rate' },
      { code: 'UNHCR_IDPS', regime: 'mixed' as const, name: 'Internally Displaced Persons' },
      { code: 'WFP_FOOD_PRICES', regime: 'mixed' as const, name: 'Food Price Index' },
    ];

    for (const ind of indicatorCodes) {
      const data = await this.getLatestIndicator(ind.code, ind.regime);
      const snapshot = this.createIndicatorSnapshot(ind.name, data);
      if (snapshot) indicators.push(snapshot);
    }

    // Fetch recent events
    const events = await this.getRecentEvents(7);

    const report: GeneratedReport = {
      id: `weekly_${today.toISOString().split('T')[0]}`,
      type: 'weekly_digest',
      title: `Weekly Economic Digest - Week of ${weekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      titleAr: `الملخص الاقتصادي الأسبوعي - أسبوع ${weekAgo.toLocaleDateString('ar-YE', { month: 'short', day: 'numeric' })}`,
      summary: this.generateWeeklySummary(indicators, events),
      summaryAr: this.generateWeeklySummaryAr(indicators, events),
      content: this.generateWeeklyContent(indicators, events),
      generatedAt: today,
      status: 'draft',
      dataSnapshot: {
        timestamp: today,
        indicators,
        events,
      },
    };

    return report;
  }

  /**
   * Generate a monthly comprehensive report
   */
  async generateMonthlyReport(): Promise<GeneratedReport> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const monthName = monthAgo.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const monthNameAr = monthAgo.toLocaleDateString('ar-YE', { month: 'long', year: 'numeric' });

    // Comprehensive indicator list
    const indicatorCodes = [
      { code: 'CBY_FX_PARALLEL_ADEN', regime: 'aden_irg' as const, name: 'Exchange Rate (Aden)' },
      { code: 'CBY_FX_PARALLEL_SANAA', regime: 'sanaa_defacto' as const, name: 'Exchange Rate (Sana\'a)' },
      { code: 'CBY_INFLATION_ADEN', regime: 'aden_irg' as const, name: 'Inflation Rate' },
      { code: 'UNHCR_IDPS', regime: 'mixed' as const, name: 'IDPs' },
      { code: 'UNHCR_REFUGEES', regime: 'mixed' as const, name: 'Refugees' },
      { code: 'WFP_FOOD_PRICES', regime: 'mixed' as const, name: 'Food Prices' },
      { code: 'WFP_FOOD_INSECURE', regime: 'mixed' as const, name: 'Food Insecure Population' },
      { code: 'WHO_HEALTH_FACILITIES', regime: 'mixed' as const, name: 'Health Facilities' },
      { code: 'UNDP_HDI', regime: 'mixed' as const, name: 'Human Development Index' },
      { code: 'IATI_AID_DISBURSEMENTS', regime: 'mixed' as const, name: 'Aid Disbursements' },
    ];

    const indicators: IndicatorSnapshot[] = [];
    for (const ind of indicatorCodes) {
      const data = await this.getLatestIndicator(ind.code, ind.regime);
      const snapshot = this.createIndicatorSnapshot(ind.name, data);
      if (snapshot) indicators.push(snapshot);
    }

    const events = await this.getRecentEvents(30);

    const report: GeneratedReport = {
      id: `monthly_${today.toISOString().split('T')[0]}`,
      type: 'monthly_report',
      title: `Monthly Economic Report - ${monthName}`,
      titleAr: `التقرير الاقتصادي الشهري - ${monthNameAr}`,
      summary: this.generateMonthlySummary(indicators, events),
      summaryAr: this.generateMonthlySummaryAr(indicators, events),
      content: this.generateMonthlyContent(indicators, events),
      generatedAt: today,
      status: 'draft',
      dataSnapshot: {
        timestamp: today,
        indicators,
        events,
      },
    };

    return report;
  }

  /**
   * Generate an alert report based on anomaly detection
   */
  async generateAlertReport(
    indicatorCode: string,
    currentValue: number,
    threshold: number,
    direction: 'above' | 'below'
  ): Promise<GeneratedReport> {
    const today = new Date();
    
    const report: GeneratedReport = {
      id: `alert_${indicatorCode}_${today.getTime()}`,
      type: 'alert_report',
      title: `Alert: ${indicatorCode} ${direction === 'above' ? 'Exceeded' : 'Dropped Below'} Threshold`,
      titleAr: `تنبيه: ${indicatorCode} ${direction === 'above' ? 'تجاوز' : 'انخفض تحت'} الحد`,
      summary: `The indicator ${indicatorCode} has ${direction === 'above' ? 'exceeded' : 'dropped below'} the threshold of ${threshold}. Current value: ${currentValue}.`,
      summaryAr: `المؤشر ${indicatorCode} ${direction === 'above' ? 'تجاوز' : 'انخفض تحت'} الحد ${threshold}. القيمة الحالية: ${currentValue}.`,
      content: [{
        heading: 'Alert Details',
        headingAr: 'تفاصيل التنبيه',
        content: `Indicator: ${indicatorCode}\nCurrent Value: ${currentValue}\nThreshold: ${threshold}\nDirection: ${direction}`,
        contentAr: `المؤشر: ${indicatorCode}\nالقيمة الحالية: ${currentValue}\nالحد: ${threshold}\nالاتجاه: ${direction}`,
      }],
      generatedAt: today,
      status: 'draft',
      dataSnapshot: {
        timestamp: today,
        indicators: [{
          code: indicatorCode,
          name: indicatorCode,
          value: currentValue,
          previousValue: threshold,
          change: currentValue - threshold,
          changePercent: ((currentValue - threshold) / threshold) * 100,
          trend: direction === 'above' ? 'up' : 'down',
        }],
        events: [],
      },
    };

    return report;
  }

  /**
   * Check for anomalies and trigger alert reports
   */
  async checkAnomaliesAndAlert(): Promise<GeneratedReport[]> {
    const alerts: GeneratedReport[] = [];
    
    // Define thresholds for key indicators
    const thresholds = [
      { code: 'CBY_FX_PARALLEL_ADEN', regime: 'aden_irg' as const, upper: 2500, lower: 1500 },
      { code: 'CBY_FX_PARALLEL_SANAA', regime: 'sanaa_defacto' as const, upper: 600, lower: 500 },
    ];

    for (const threshold of thresholds) {
      const data = await this.getLatestIndicator(threshold.code, threshold.regime);
      if (data && data.current) {
        const value = parseFloat(data.current.value);
        if (value > threshold.upper) {
          alerts.push(await this.generateAlertReport(threshold.code, value, threshold.upper, 'above'));
        } else if (value < threshold.lower) {
          alerts.push(await this.generateAlertReport(threshold.code, value, threshold.lower, 'below'));
        }
      }
    }

    return alerts;
  }

  /**
   * Publish a report
   */
  async publishReport(report: GeneratedReport): Promise<boolean> {
    const db = await getDb();
    if (!db) return false;

    try {
      // Generate a unique file key for the report
      const fileKey = `reports/${report.type}/${report.id}.json`;
      const fileUrl = `https://yeto-storage.s3.amazonaws.com/${fileKey}`;
      
      // Insert into documents table
      await db.insert(documents).values({
        title: report.title,
        titleAr: report.titleAr,
        fileKey: fileKey,
        fileUrl: fileUrl,
        mimeType: 'application/json',
        category: report.type,
        publicationDate: report.generatedAt,
        license: 'CC-BY-4.0',
        tags: ['auto-generated', report.type],
      });

      console.log(`[AutoPublicationEngine] Published report: ${report.title}`);
      return true;
    } catch (error) {
      console.error('[AutoPublicationEngine] Failed to publish report:', error);
      return false;
    }
  }

  /**
   * Get publication schedule
   */
  getSchedule(): PublicationConfig[] {
    return this.configs.filter(c => c.enabled);
  }

  /**
   * Update publication config
   */
  updateConfig(type: PublicationType, updates: Partial<PublicationConfig>): void {
    const index = this.configs.findIndex(c => c.type === type);
    if (index !== -1) {
      this.configs[index] = { ...this.configs[index], ...updates };
    }
  }

  // Private helper methods
  private async getLatestIndicator(code: string, regime: 'aden_irg' | 'sanaa_defacto' | 'mixed' | 'unknown') {
    const db = await getDb();
    if (!db) return null;

    const results = await db
      .select()
      .from(timeSeries)
      .where(and(
        eq(timeSeries.indicatorCode, code),
        eq(timeSeries.regimeTag, regime)
      ))
      .orderBy(desc(timeSeries.date))
      .limit(2);

    return results.length > 0 ? { current: results[0], previous: results[1] || null } : null;
  }

  private createIndicatorSnapshot(name: string, data: any): IndicatorSnapshot | null {
    if (!data || !data.current) return null;

    const currentValue = parseFloat(data.current.value);
    const previousValue = data.previous ? parseFloat(data.previous.value) : currentValue;
    const change = currentValue - previousValue;
    const changePercent = previousValue !== 0 ? (change / previousValue) * 100 : 0;

    return {
      code: data.current.indicatorCode,
      name,
      value: currentValue,
      previousValue,
      change,
      changePercent,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
    };
  }

  private async getRecentEvents(days: number): Promise<EventSnapshot[]> {
    const db = await getDb();
    if (!db) return [];

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const results = await db
      .select()
      .from(economicEvents)
      .where(gte(economicEvents.eventDate, cutoffDate))
      .orderBy(desc(economicEvents.eventDate))
      .limit(10);

    return results.map(e => ({
      id: e.id,
      title: e.title,
      date: e.eventDate,
      category: e.category || 'general',
    }));
  }

  private generateDailySummary(indicators: IndicatorSnapshot[]): string {
    const fxAden = indicators.find(i => i.name.includes('Aden'));
    const fxSanaa = indicators.find(i => i.name.includes('Sana\'a'));
    
    return `Today's market snapshot shows the Yemeni Rial trading at ${fxAden?.value.toLocaleString() || 'N/A'} YER/USD in Aden and ${fxSanaa?.value.toLocaleString() || 'N/A'} YER/USD in Sana'a.`;
  }

  private generateDailySummaryAr(indicators: IndicatorSnapshot[]): string {
    const fxAden = indicators.find(i => i.name.includes('Aden'));
    const fxSanaa = indicators.find(i => i.name.includes('Sana\'a'));
    
    return `تُظهر لمحة السوق اليوم أن الريال اليمني يتداول عند ${fxAden?.value.toLocaleString() || 'غير متاح'} ريال/دولار في عدن و${fxSanaa?.value.toLocaleString() || 'غير متاح'} ريال/دولار في صنعاء.`;
  }

  private generateWeeklySummary(indicators: IndicatorSnapshot[], events: EventSnapshot[]): string {
    return `This week's economic digest covers ${indicators.length} key indicators and ${events.length} significant events affecting Yemen's economy.`;
  }

  private generateWeeklySummaryAr(indicators: IndicatorSnapshot[], events: EventSnapshot[]): string {
    return `يغطي الملخص الاقتصادي لهذا الأسبوع ${indicators.length} مؤشرات رئيسية و${events.length} أحداث مهمة تؤثر على الاقتصاد اليمني.`;
  }

  private generateMonthlySummary(indicators: IndicatorSnapshot[], events: EventSnapshot[]): string {
    return `This comprehensive monthly report analyzes ${indicators.length} economic indicators and ${events.length} key events from the past month.`;
  }

  private generateMonthlySummaryAr(indicators: IndicatorSnapshot[], events: EventSnapshot[]): string {
    return `يحلل هذا التقرير الشهري الشامل ${indicators.length} مؤشراً اقتصادياً و${events.length} حدثاً رئيسياً من الشهر الماضي.`;
  }

  private generateDailyContent(indicators: IndicatorSnapshot[]): ReportSection[] {
    return [{
      heading: 'Market Overview',
      headingAr: 'نظرة عامة على السوق',
      content: indicators.map(i => `${i.name}: ${i.value.toLocaleString()} (${i.changePercent > 0 ? '+' : ''}${i.changePercent.toFixed(2)}%)`).join('\n'),
      contentAr: indicators.map(i => `${i.name}: ${i.value.toLocaleString()} (${i.changePercent > 0 ? '+' : ''}${i.changePercent.toFixed(2)}%)`).join('\n'),
      charts: [{
        type: 'bar',
        title: 'Daily Indicators',
        data: indicators.map(i => ({ label: i.name, value: i.value })),
      }],
    }];
  }

  private generateWeeklyContent(indicators: IndicatorSnapshot[], events: EventSnapshot[]): ReportSection[] {
    return [
      {
        heading: 'Key Indicators',
        headingAr: 'المؤشرات الرئيسية',
        content: indicators.map(i => `${i.name}: ${i.value.toLocaleString()} (${i.trend})`).join('\n'),
        contentAr: indicators.map(i => `${i.name}: ${i.value.toLocaleString()} (${i.trend === 'up' ? 'ارتفاع' : i.trend === 'down' ? 'انخفاض' : 'مستقر'})`).join('\n'),
        tables: [{
          headers: ['Indicator', 'Value', 'Change', 'Trend'],
          rows: indicators.map(i => [i.name, i.value.toLocaleString(), `${i.changePercent.toFixed(2)}%`, i.trend]),
        }],
      },
      {
        heading: 'Recent Events',
        headingAr: 'الأحداث الأخيرة',
        content: events.map(e => `${e.date.toLocaleDateString()}: ${e.title}`).join('\n'),
        contentAr: events.map(e => `${e.date.toLocaleDateString('ar-YE')}: ${e.title}`).join('\n'),
      },
    ];
  }

  private generateMonthlyContent(indicators: IndicatorSnapshot[], events: EventSnapshot[]): ReportSection[] {
    // Group indicators by category
    const fxIndicators = indicators.filter(i => i.name.includes('Exchange') || i.name.includes('Rate'));
    const humanitarianIndicators = indicators.filter(i => i.name.includes('IDP') || i.name.includes('Refugee') || i.name.includes('Food'));
    const developmentIndicators = indicators.filter(i => i.name.includes('HDI') || i.name.includes('Aid'));

    return [
      {
        heading: 'Executive Summary',
        headingAr: 'الملخص التنفيذي',
        content: `This report provides a comprehensive analysis of Yemen's economic situation for the past month, covering currency markets, humanitarian indicators, and development metrics.`,
        contentAr: `يقدم هذا التقرير تحليلاً شاملاً للوضع الاقتصادي في اليمن للشهر الماضي، ويغطي أسواق العملات والمؤشرات الإنسانية ومقاييس التنمية.`,
      },
      {
        heading: 'Currency & Exchange Rates',
        headingAr: 'العملة وأسعار الصرف',
        content: fxIndicators.map(i => `${i.name}: ${i.value.toLocaleString()}`).join('\n'),
        contentAr: fxIndicators.map(i => `${i.name}: ${i.value.toLocaleString()}`).join('\n'),
        charts: [{
          type: 'line',
          title: 'Exchange Rate Trends',
          data: fxIndicators.map(i => ({ label: i.name, value: i.value })),
        }],
      },
      {
        heading: 'Humanitarian Situation',
        headingAr: 'الوضع الإنساني',
        content: humanitarianIndicators.map(i => `${i.name}: ${i.value.toLocaleString()}`).join('\n'),
        contentAr: humanitarianIndicators.map(i => `${i.name}: ${i.value.toLocaleString()}`).join('\n'),
      },
      {
        heading: 'Development Indicators',
        headingAr: 'مؤشرات التنمية',
        content: developmentIndicators.map(i => `${i.name}: ${i.value.toLocaleString()}`).join('\n'),
        contentAr: developmentIndicators.map(i => `${i.name}: ${i.value.toLocaleString()}`).join('\n'),
      },
      {
        heading: 'Key Events',
        headingAr: 'الأحداث الرئيسية',
        content: events.slice(0, 5).map(e => `• ${e.date.toLocaleDateString()}: ${e.title}`).join('\n'),
        contentAr: events.slice(0, 5).map(e => `• ${e.date.toLocaleDateString('ar-YE')}: ${e.title}`).join('\n'),
      },
    ];
  }
}

// Export singleton instance
export const autoPublicationEngine = new AutoPublicationEngine();

// Export convenience functions
export async function generateDailySnapshot() {
  return autoPublicationEngine.generateDailySnapshot();
}

export async function generateWeeklyDigest() {
  return autoPublicationEngine.generateWeeklyDigest();
}

export async function generateMonthlyReport() {
  return autoPublicationEngine.generateMonthlyReport();
}

export async function checkAnomaliesAndAlert() {
  return autoPublicationEngine.checkAnomaliesAndAlert();
}

export function getPublicationSchedule() {
  return autoPublicationEngine.getSchedule();
}
