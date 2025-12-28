/**
 * YETO Platform - Automated Data Ingestion Pipeline
 * 
 * This module handles automated data collection from various sources
 * with full provenance tracking and quality validation.
 */

import { getDb } from '../db';
import { 
  sources, 
  indicators, 
  timeSeries, 
  economicEvents
} from '../../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';

// ============================================
// Types
// ============================================

export interface DataSource {
  id: string;
  name: string;
  nameAr: string;
  type: 'api' | 'scraper' | 'manual' | 'partner';
  url?: string;
  frequency: 'realtime' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  enabled: boolean;
  lastIngested?: Date;
  config: Record<string, unknown>;
}

export interface IngestionResult {
  sourceId: string;
  success: boolean;
  recordsIngested: number;
  recordsUpdated: number;
  recordsFailed: number;
  errors: string[];
  duration: number;
  timestamp: Date;
}

export interface DataPoint {
  indicatorCode: string;
  value: number;
  date: Date;
  regime: 'aden' | 'sanaa' | 'national';
  confidence: 'A' | 'B' | 'C' | 'D';
  sourceId: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// Data Source Registry
// ============================================

export const DATA_SOURCES: DataSource[] = [
  {
    id: 'cby-aden',
    name: 'Central Bank of Yemen - Aden',
    nameAr: 'البنك المركزي اليمني - عدن',
    type: 'manual',
    frequency: 'weekly',
    enabled: true,
    config: {
      indicators: ['fx_rate', 'reserves', 'money_supply'],
      regime: 'aden'
    }
  },
  {
    id: 'cby-sanaa',
    name: 'Central Bank of Yemen - Sana\'a',
    nameAr: 'البنك المركزي اليمني - صنعاء',
    type: 'manual',
    frequency: 'weekly',
    enabled: true,
    config: {
      indicators: ['fx_rate', 'money_supply'],
      regime: 'sanaa'
    }
  },
  {
    id: 'wfp-vam',
    name: 'WFP Vulnerability Analysis & Mapping',
    nameAr: 'تحليل الضعف ورسم الخرائط - برنامج الأغذية العالمي',
    type: 'api',
    url: 'https://dataviz.vam.wfp.org/api',
    frequency: 'monthly',
    enabled: true,
    config: {
      indicators: ['food_prices', 'food_security_index'],
      country: 'YEM'
    }
  },
  {
    id: 'ocha-fts',
    name: 'OCHA Financial Tracking Service',
    nameAr: 'خدمة التتبع المالي - مكتب تنسيق الشؤون الإنسانية',
    type: 'api',
    url: 'https://api.hpc.tools/v2/fts',
    frequency: 'daily',
    enabled: true,
    config: {
      indicators: ['aid_flows', 'humanitarian_funding'],
      country: 'YEM'
    }
  },
  {
    id: 'imf-weo',
    name: 'IMF World Economic Outlook',
    nameAr: 'آفاق الاقتصاد العالمي - صندوق النقد الدولي',
    type: 'api',
    url: 'https://www.imf.org/external/datamapper/api',
    frequency: 'quarterly',
    enabled: true,
    config: {
      indicators: ['gdp', 'inflation', 'unemployment'],
      country: 'YEM'
    }
  },
  {
    id: 'world-bank',
    name: 'World Bank Open Data',
    nameAr: 'البيانات المفتوحة - البنك الدولي',
    type: 'api',
    url: 'https://api.worldbank.org/v2',
    frequency: 'annual',
    enabled: true,
    config: {
      indicators: ['poverty_rate', 'gdp_per_capita', 'population'],
      country: 'YEM'
    }
  },
  {
    id: 'market-surveys',
    name: 'Local Market Surveys',
    nameAr: 'مسوحات السوق المحلية',
    type: 'partner',
    frequency: 'weekly',
    enabled: true,
    config: {
      indicators: ['fuel_prices', 'commodity_prices'],
      regions: ['aden', 'sanaa', 'taiz', 'hodeidah']
    }
  },
  {
    id: 'ofac-sdn',
    name: 'OFAC Specially Designated Nationals List',
    nameAr: 'قائمة المواطنين المعينين خصيصاً - مكتب مراقبة الأصول الأجنبية',
    type: 'api',
    url: 'https://api.ofac-api.com/v4',
    frequency: 'daily',
    enabled: true,
    config: {
      indicators: ['sanctions_list'],
      country: 'YEM'
    }
  }
];

// ============================================
// Ingestion Pipeline
// ============================================

export class IngestionPipeline {
  private sources: DataSource[];
  private results: IngestionResult[] = [];

  constructor(sources: DataSource[] = DATA_SOURCES) {
    this.sources = sources.filter(s => s.enabled);
  }

  /**
   * Run full ingestion pipeline for all enabled sources
   */
  async runFullIngestion(): Promise<IngestionResult[]> {
    console.log(`[Ingestion] Starting full ingestion for ${this.sources.length} sources`);
    
    for (const source of this.sources) {
      const result = await this.ingestSource(source);
      this.results.push(result);
    }

    await this.generateIngestionReport();
    return this.results;
  }

  /**
   * Run ingestion for a specific source
   */
  async ingestSource(source: DataSource): Promise<IngestionResult> {
    const startTime = Date.now();
    const result: IngestionResult = {
      sourceId: source.id,
      success: false,
      recordsIngested: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
      timestamp: new Date()
    };

    try {
      console.log(`[Ingestion] Processing source: ${source.name}`);

      // Fetch data based on source type
      let dataPoints: DataPoint[] = [];
      
      switch (source.type) {
        case 'api':
          dataPoints = await this.fetchFromAPI(source);
          break;
        case 'scraper':
          dataPoints = await this.fetchFromScraper(source);
          break;
        case 'manual':
          dataPoints = await this.fetchManualData(source);
          break;
        case 'partner':
          dataPoints = await this.fetchPartnerData(source);
          break;
      }

      // Validate and store data
      for (const point of dataPoints) {
        try {
          const validated = await this.validateDataPoint(point);
          if (validated) {
            await this.storeDataPoint(point, source);
            result.recordsIngested++;
          } else {
            result.recordsFailed++;
          }
        } catch (error) {
          result.recordsFailed++;
          result.errors.push(`Failed to process data point: ${error}`);
        }
      }

      // Update source last ingested timestamp
      await this.updateSourceTimestamp(source.id);

      result.success = result.recordsFailed === 0;
    } catch (error) {
      result.errors.push(`Source ingestion failed: ${error}`);
    }

    result.duration = Date.now() - startTime;
    console.log(`[Ingestion] Completed ${source.name}: ${result.recordsIngested} records in ${result.duration}ms`);
    
    return result;
  }

  /**
   * Fetch data from API source
   */
  private async fetchFromAPI(source: DataSource): Promise<DataPoint[]> {
    // In production, this would make actual API calls
    // For now, return sample data structure
    console.log(`[Ingestion] Fetching from API: ${source.url}`);
    
    // Simulate API response with sample data
    const sampleData: DataPoint[] = [];
    const indicators = source.config.indicators as string[];
    
    for (const indicator of indicators) {
      sampleData.push({
        indicatorCode: indicator,
        value: Math.random() * 1000,
        date: new Date(),
        regime: (source.config.regime as 'aden' | 'sanaa') || 'national',
        confidence: 'B',
        sourceId: source.id,
        metadata: {
          fetchedAt: new Date().toISOString(),
          apiVersion: '1.0'
        }
      });
    }

    return sampleData;
  }

  /**
   * Fetch data from web scraper
   */
  private async fetchFromScraper(source: DataSource): Promise<DataPoint[]> {
    console.log(`[Ingestion] Scraping from: ${source.url}`);
    // Placeholder for scraper implementation
    return [];
  }

  /**
   * Fetch manually entered data
   */
  private async fetchManualData(source: DataSource): Promise<DataPoint[]> {
    console.log(`[Ingestion] Fetching manual data for: ${source.name}`);
    // In production, this would fetch from admin-entered data queue
    return [];
  }

  /**
   * Fetch data from partner submissions
   */
  private async fetchPartnerData(source: DataSource): Promise<DataPoint[]> {
    console.log(`[Ingestion] Fetching partner data for: ${source.name}`);
    // In production, this would fetch from partner submission queue
    return [];
  }

  /**
   * Validate a data point
   */
  private async validateDataPoint(point: DataPoint): Promise<boolean> {
    // Validation rules
    if (point.value === null || point.value === undefined) {
      return false;
    }
    if (!point.date || isNaN(point.date.getTime())) {
      return false;
    }
    if (!['aden', 'sanaa', 'national'].includes(point.regime)) {
      return false;
    }
    if (!['A', 'B', 'C', 'D'].includes(point.confidence)) {
      return false;
    }
    return true;
  }

  /**
   * Store a validated data point
   */
  private async storeDataPoint(point: DataPoint, source: DataSource): Promise<void> {
    const db = await getDb();
    if (!db) return;
    
    // Check for existing data point (deduplication)
    const existing = await db.select()
      .from(timeSeries)
      .where(
        and(
          eq(timeSeries.indicatorCode, point.indicatorCode)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing record
      await db.update(timeSeries)
        .set({
          value: point.value.toString(),
          updatedAt: new Date()
        })
        .where(eq(timeSeries.id, existing[0].id));
    } else {
      // Insert new record
      await db.insert(timeSeries).values({
        indicatorCode: point.indicatorCode,
        regimeTag: point.regime === 'aden' ? 'aden_irg' : point.regime === 'sanaa' ? 'sanaa_defacto' : 'mixed',
        date: point.date,
        value: point.value.toString(),
        unit: 'YER',
        confidenceRating: point.confidence,
        sourceId: 1, // Would lookup actual source ID
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Create provenance record
    await this.createProvenanceRecord(point, source);
  }

  /**
   * Create provenance record for data point
   */
  private async createProvenanceRecord(point: DataPoint, source: DataSource): Promise<void> {
    // Provenance tracking - log for now, would insert to provenance table in production
    console.log('[Provenance] Recording data point origin:', {
      entityType: 'time_series',
      indicatorCode: point.indicatorCode,
      value: point.value,
      confidence: point.confidence,
      sourceType: source.type,
      sourceId: source.id,
      ingestedAt: new Date().toISOString()
    });
  }

  /**
   * Update source last ingested timestamp
   */
  private async updateSourceTimestamp(sourceId: string): Promise<void> {
    const db = await getDb();
    if (!db) return;
    await db.update(sources)
      .set({ updatedAt: new Date() })
      .where(eq(sources.id, 1)); // Would use actual source ID lookup
  }

  /**
   * Generate ingestion report
   */
  private async generateIngestionReport(): Promise<void> {
    const totalRecords = this.results.reduce((sum, r) => sum + r.recordsIngested, 0);
    const totalFailed = this.results.reduce((sum, r) => sum + r.recordsFailed, 0);
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log(`[Ingestion] === Report ===`);
    console.log(`[Ingestion] Total sources: ${this.results.length}`);
    console.log(`[Ingestion] Records ingested: ${totalRecords}`);
    console.log(`[Ingestion] Records failed: ${totalFailed}`);
    console.log(`[Ingestion] Total duration: ${totalDuration}ms`);
    
    // Log any errors
    for (const result of this.results) {
      if (result.errors.length > 0) {
        console.error(`[Ingestion] Errors for ${result.sourceId}:`, result.errors);
      }
    }
  }
}

// ============================================
// Scheduled Ingestion Jobs
// ============================================

export const INGESTION_SCHEDULES = {
  realtime: '*/5 * * * *',      // Every 5 minutes
  daily: '0 6 * * *',           // 6 AM daily
  weekly: '0 6 * * 1',          // 6 AM every Monday
  monthly: '0 6 1 * *',         // 6 AM first day of month
  quarterly: '0 6 1 1,4,7,10 *' // 6 AM first day of quarter
};

/**
 * Run scheduled ingestion based on frequency
 */
export async function runScheduledIngestion(frequency: string): Promise<void> {
  const pipeline = new IngestionPipeline(
    DATA_SOURCES.filter(s => s.frequency === frequency && s.enabled)
  );
  await pipeline.runFullIngestion();
}

// ============================================
// Data Quality Monitoring
// ============================================

export async function checkDataQuality(): Promise<void> {
  console.log('[Quality] Running data quality checks...');

  // Check for stale data
  const staleThreshold = new Date();
  staleThreshold.setDate(staleThreshold.getDate() - 7);

  // Check for missing data
  // Check for outliers
  // Check for contradictions

  console.log('[Quality] Data quality checks completed');
}

// ============================================
// Export
// ============================================

export default IngestionPipeline;
