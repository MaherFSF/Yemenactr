/**
 * YETO Platform - Data Ingestion Service
 * Yemen Economic Transparency Observatory
 * 
 * Orchestrates data fetching from external sources
 * and stores in database with provenance tracking
 */

import {
  WorldBankConnector,
  HDXConnector,
  OCHAFTSConnector,
  ReliefWebConnector,
  getDataSources,
  type NormalizedSeries,
  type QAReport,
} from './connectors';
// Database storage deferred - using in-memory cache for now
// import { getDb } from './db';
// import { timeSeries } from '../drizzle/schema';

// ============================================
// Types
// ============================================

export interface IngestionResult {
  sourceId: string;
  sourceName: string;
  status: 'success' | 'partial' | 'failed';
  startedAt: Date;
  completedAt: Date;
  seriesCount: number;
  observationCount: number;
  qaReport: QAReport | null;
  errors: string[];
}

export interface IngestionSummary {
  totalSources: number;
  successfulSources: number;
  failedSources: number;
  totalSeries: number;
  totalObservations: number;
  results: IngestionResult[];
}

// ============================================
// Ingestion Service
// ============================================

export class IngestionService {
  private results: IngestionResult[] = [];
  
  /**
   * Run full ingestion from all active sources
   */
  async runFullIngestion(): Promise<IngestionSummary> {
    console.log('[Ingestion] Starting full ingestion run...');
    this.results = [];
    
    // World Bank
    await this.ingestWorldBank();
    
    // HDX HAPI
    await this.ingestHDX();
    
    // OCHA FTS
    await this.ingestOCHAFTS();
    
    // ReliefWeb
    await this.ingestReliefWeb();
    
    const summary = this.generateSummary();
    console.log('[Ingestion] Full ingestion complete:', summary);
    
    return summary;
  }
  
  /**
   * Ingest World Bank indicators
   */
  async ingestWorldBank(): Promise<IngestionResult> {
    const connector = new WorldBankConnector();
    const startedAt = new Date();
    const errors: string[] = [];
    
    try {
      console.log('[Ingestion] Fetching World Bank data...');
      
      // Fetch all indicators
      const series = await connector.fetchAllIndicators();
      
      // Validate
      const qaReport = await connector.validate(series);
      
      // Count observations
      const observationCount = series.reduce((sum, s) => sum + s.observations.length, 0);
      
      // Store in database
      await this.storeSeries(series, 'world-bank');
      
      const result: IngestionResult = {
        sourceId: connector.sourceId,
        sourceName: connector.sourceName,
        status: qaReport.passed ? 'success' : 'partial',
        startedAt,
        completedAt: new Date(),
        seriesCount: series.length,
        observationCount,
        qaReport,
        errors,
      };
      
      this.results.push(result);
      console.log(`[Ingestion] World Bank: ${series.length} series, ${observationCount} observations`);
      
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMsg);
      
      const result: IngestionResult = {
        sourceId: connector.sourceId,
        sourceName: connector.sourceName,
        status: 'failed',
        startedAt,
        completedAt: new Date(),
        seriesCount: 0,
        observationCount: 0,
        qaReport: null,
        errors,
      };
      
      this.results.push(result);
      console.error('[Ingestion] World Bank failed:', errorMsg);
      
      return result;
    }
  }
  
  /**
   * Ingest HDX humanitarian data
   */
  async ingestHDX(): Promise<IngestionResult> {
    const connector = new HDXConnector();
    const startedAt = new Date();
    const errors: string[] = [];
    
    try {
      console.log('[Ingestion] Fetching HDX data...');
      
      // Fetch population data
      const populationData = await connector.fetchPopulation();
      const foodSecurityData = await connector.fetchFoodSecurity();
      const humanitarianNeedsData = await connector.fetchHumanitarianNeeds();
      
      const allSeries: NormalizedSeries[] = [];
      
      if (populationData) {
        const series = await connector.normalize(populationData);
        allSeries.push(...series);
      }
      
      if (foodSecurityData) {
        const series = await connector.normalize(foodSecurityData);
        allSeries.push(...series);
      }
      
      if (humanitarianNeedsData) {
        const series = await connector.normalize(humanitarianNeedsData);
        allSeries.push(...series);
      }
      
      const qaReport = await connector.validate(allSeries);
      const observationCount = allSeries.reduce((sum, s) => sum + s.observations.length, 0);
      
      await this.storeSeries(allSeries, 'hdx-hapi');
      
      const result: IngestionResult = {
        sourceId: connector.sourceId,
        sourceName: connector.sourceName,
        status: allSeries.length > 0 ? 'success' : 'partial',
        startedAt,
        completedAt: new Date(),
        seriesCount: allSeries.length,
        observationCount,
        qaReport,
        errors,
      };
      
      this.results.push(result);
      console.log(`[Ingestion] HDX: ${allSeries.length} series, ${observationCount} observations`);
      
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMsg);
      
      const result: IngestionResult = {
        sourceId: connector.sourceId,
        sourceName: connector.sourceName,
        status: 'failed',
        startedAt,
        completedAt: new Date(),
        seriesCount: 0,
        observationCount: 0,
        qaReport: null,
        errors,
      };
      
      this.results.push(result);
      console.error('[Ingestion] HDX failed:', errorMsg);
      
      return result;
    }
  }
  
  /**
   * Ingest OCHA FTS funding data
   */
  async ingestOCHAFTS(): Promise<IngestionResult> {
    const connector = new OCHAFTSConnector();
    const startedAt = new Date();
    const errors: string[] = [];
    
    try {
      console.log('[Ingestion] Fetching OCHA FTS data...');
      
      const allSeries: NormalizedSeries[] = [];
      
      // Fetch funding for multiple years
      for (const year of [2020, 2021, 2022, 2023, 2024]) {
        const fundingData = await connector.fetchFundingFlows(year);
        if (fundingData) {
          const series = await connector.normalize(fundingData);
          allSeries.push(...series);
        }
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const qaReport = await connector.validate(allSeries);
      const observationCount = allSeries.reduce((sum, s) => sum + s.observations.length, 0);
      
      await this.storeSeries(allSeries, 'ocha-fts');
      
      const result: IngestionResult = {
        sourceId: connector.sourceId,
        sourceName: connector.sourceName,
        status: allSeries.length > 0 ? 'success' : 'partial',
        startedAt,
        completedAt: new Date(),
        seriesCount: allSeries.length,
        observationCount,
        qaReport,
        errors,
      };
      
      this.results.push(result);
      console.log(`[Ingestion] OCHA FTS: ${allSeries.length} series, ${observationCount} observations`);
      
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMsg);
      
      const result: IngestionResult = {
        sourceId: connector.sourceId,
        sourceName: connector.sourceName,
        status: 'failed',
        startedAt,
        completedAt: new Date(),
        seriesCount: 0,
        observationCount: 0,
        qaReport: null,
        errors,
      };
      
      this.results.push(result);
      console.error('[Ingestion] OCHA FTS failed:', errorMsg);
      
      return result;
    }
  }
  
  /**
   * Ingest ReliefWeb documents
   */
  async ingestReliefWeb(): Promise<IngestionResult> {
    const connector = new ReliefWebConnector();
    const startedAt = new Date();
    const errors: string[] = [];
    
    try {
      console.log('[Ingestion] Fetching ReliefWeb data...');
      
      const reportsData = await connector.fetchReports(100);
      const series = reportsData ? await connector.normalize(reportsData) : [];
      
      const qaReport = await connector.validate(series);
      const observationCount = series.reduce((sum, s) => sum + s.observations.length, 0);
      
      await this.storeSeries(series, 'reliefweb');
      
      const result: IngestionResult = {
        sourceId: connector.sourceId,
        sourceName: connector.sourceName,
        status: series.length > 0 ? 'success' : 'partial',
        startedAt,
        completedAt: new Date(),
        seriesCount: series.length,
        observationCount,
        qaReport,
        errors,
      };
      
      this.results.push(result);
      console.log(`[Ingestion] ReliefWeb: ${series.length} series, ${observationCount} observations`);
      
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMsg);
      
      const result: IngestionResult = {
        sourceId: connector.sourceId,
        sourceName: connector.sourceName,
        status: 'failed',
        startedAt,
        completedAt: new Date(),
        seriesCount: 0,
        observationCount: 0,
        qaReport: null,
        errors,
      };
      
      this.results.push(result);
      console.error('[Ingestion] ReliefWeb failed:', errorMsg);
      
      return result;
    }
  }
  
  /**
   * Store normalized series in database
   * Note: For now, we store in memory cache since sourceId requires FK to sources table
   * In production, we would first create source records and use their IDs
   */
  private async storeSeries(series: NormalizedSeries[], sourceId: string): Promise<void> {
    // Store in memory cache for immediate use
    // Database storage would require creating source records first
    for (const s of series) {
      const cacheKey = `${sourceId}:${s.indicatorCode}`;
      this.seriesCache.set(cacheKey, s);
    }
    console.log(`[Ingestion] Cached ${series.length} series from ${sourceId}`);
  }
  
  // In-memory cache for fetched data
  private seriesCache = new Map<string, NormalizedSeries>();
  
  /**
   * Get cached series data
   */
  getCachedSeries(sourceId: string, indicatorCode?: string): NormalizedSeries[] {
    const results: NormalizedSeries[] = [];
    for (const [key, value] of Array.from(this.seriesCache.entries())) {
      if (key.startsWith(sourceId)) {
        if (!indicatorCode || key.includes(indicatorCode)) {
          results.push(value);
        }
      }
    }
    return results;
  }
  
  /**
   * Get all cached series
   */
  getAllCachedSeries(): NormalizedSeries[] {
    return Array.from(this.seriesCache.values());
  }
  
  /**
   * Generate summary of ingestion run
   */
  private generateSummary(): IngestionSummary {
    const successfulSources = this.results.filter(r => r.status === 'success').length;
    const failedSources = this.results.filter(r => r.status === 'failed').length;
    const totalSeries = this.results.reduce((sum, r) => sum + r.seriesCount, 0);
    const totalObservations = this.results.reduce((sum, r) => sum + r.observationCount, 0);
    
    return {
      totalSources: this.results.length,
      successfulSources,
      failedSources,
      totalSeries,
      totalObservations,
      results: this.results,
    };
  }
}

// ============================================
// Singleton instance
// ============================================

export const ingestionService = new IngestionService();

// ============================================
// Quick fetch functions for tRPC
// ============================================

/**
 * Fetch World Bank data for a specific indicator
 */
export async function fetchWorldBankIndicator(indicatorCode: string): Promise<NormalizedSeries | null> {
  const connector = new WorldBankConnector();
  
  try {
    const rawData = await connector.fetchIndicator(indicatorCode);
    const series = await connector.normalize(rawData);
    return series[0] || null;
  } catch (error) {
    console.error(`[WorldBank] Failed to fetch ${indicatorCode}:`, error);
    return null;
  }
}

/**
 * Fetch ReliefWeb reports
 */
export async function fetchReliefWebReports(query?: string, limit: number = 20) {
  const connector = new ReliefWebConnector();
  
  try {
    if (query) {
      return await connector.searchReports(query, limit);
    }
    return await connector.fetchReports(limit);
  } catch (error) {
    console.error('[ReliefWeb] Failed to fetch reports:', error);
    return null;
  }
}

/**
 * Get data source status from DB (source_registry)
 */
export async function getDataSourceStatus() {
  const sources = await getDataSources();
  return sources.map(source => ({
    ...source,
    lastRun: source.lastRun?.toISOString(),
    lastSuccess: source.lastSuccess?.toISOString(),
  }));
}
