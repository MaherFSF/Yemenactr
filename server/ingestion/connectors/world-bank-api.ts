/**
 * World Bank API Connector
 * 
 * Ingests data from World Bank's WDI (World Development Indicators) API
 * 
 * API Documentation: https://datahelpdesk.worldbank.org/knowledgebase/articles/889392
 * License: Creative Commons Attribution 4.0 (CC BY 4.0)
 * 
 * Features:
 * - Raw-first storage
 * - Evidence pack generation
 * - Vintage tracking
 * - Regime tag support (Yemen split-system)
 */

import axios from 'axios';
import crypto from 'crypto';
import { db } from '../../db';
import { 
  rawObjects, 
  datasets,
  datasetVersions,
  timeSeries,
  sources
} from '../../../drizzle/schema';

export interface WorldBankConnectorConfig {
  indicatorCodes: string[];
  countryCodes: string[];
  dateRange?: { start: number; end: number };
  frequency?: 'yearly' | 'quarterly' | 'monthly';
}

export class WorldBankConnector {
  private baseUrl = 'https://api.worldbank.org/v2';
  private sourceId: number;
  
  constructor(sourceId: number) {
    this.sourceId = sourceId;
  }
  
  /**
   * Fetch indicator data
   */
  async fetchIndicator(
    indicatorCode: string,
    countryCode: string,
    startYear: number,
    endYear: number
  ): Promise<any[]> {
    const url = `${this.baseUrl}/country/${countryCode}/indicator/${indicatorCode}`;
    const params = {
      format: 'json',
      date: `${startYear}:${endYear}`,
      per_page: 1000
    };
    
    console.log(`  📊 Fetching ${indicatorCode} for ${countryCode} (${startYear}-${endYear})`);
    
    try {
      const response = await axios.get(url, { params });
      
      // World Bank API returns [metadata, data]
      if (!response.data || !Array.isArray(response.data) || response.data.length < 2) {
        throw new Error('Unexpected response format from World Bank API');
      }
      
      const [metadata, data] = response.data;
      
      if (!data || data.length === 0) {
        console.log(`  ℹ️  No data returned for ${indicatorCode}`);
        return [];
      }
      
      return data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log(`  ℹ️  Indicator ${indicatorCode} not found`);
        return [];
      }
      throw error;
    }
  }
  
  /**
   * Store raw API response as evidence
   */
  async storeRawResponse(
    runId: number,
    url: string,
    data: any
  ): Promise<number> {
    const content = JSON.stringify(data);
    const sha256 = crypto.createHash('sha256').update(content).digest('hex');
    
    // Check for existing
    const existing = await db
      .select({ id: rawObjects.id })
      .from(rawObjects)
      .where(eq(rawObjects.sha256, sha256))
      .limit(1);
    
    if (existing.length > 0) {
      return existing[0].id;
    }
    
    const storageUri = `raw/world-bank/${sha256}.json`;
    
    const result = await db.insert(rawObjects).values({
      sourceRegistryId: this.sourceId,
      ingestionRunId: runId,
      contentType: 'application/json',
      canonicalUrl: url,
      retrievalTs: new Date(),
      sha256,
      fileSize: content.length,
      storageUri,
      status: 'active'
    });
    
    return result[0].insertId;
  }
  
  /**
   * Parse and store time series data
   */
  async storeTimeSeries(
    datasetVersionId: number,
    indicatorCode: string,
    data: any[],
    rawObjectId: number
  ): Promise<number> {
    let storedCount = 0;
    
    for (const point of data) {
      if (point.value === null || point.value === undefined) {
        continue;
      }
      
      // Determine regime tag based on date
      // Yemen split occurred in 2015
      let regimeTag = 'UNIFIED';
      const year = parseInt(point.date);
      if (year >= 2015) {
        // After 2015: data is often aggregated but administratively split
        regimeTag = 'UNIFIED'; // World Bank reports unified national data
      }
      
      // Insert time series observation
      await db.insert(timeSeries).values({
        indicatorId: null, // TODO: Link to indicators table
        date: new Date(`${point.date}-01-01`),
        value: point.value,
        valueText: String(point.value),
        unit: point.unit || 'number',
        regimeTag: regimeTag,
        geography: point.countryiso3code || point.country?.id,
        frequencyCode: 'ANNUAL',
        sourceId: this.sourceId,
        rawObjectId: rawObjectId,
        datasetVersionId: datasetVersionId,
        vintageDate: new Date(),
        confidenceScore: 95, // World Bank is Tier 0
        qualityFlags: null,
        notes: null
      });
      
      storedCount++;
    }
    
    return storedCount;
  }
  
  /**
   * Run full ingestion for configured indicators
   */
  async ingest(
    runId: number,
    config: WorldBankConnectorConfig
  ): Promise<{
    fetched: number;
    stored: number;
    errors: string[];
  }> {
    const result = {
      fetched: 0,
      stored: 0,
      errors: []
    };
    
    const defaultCountries = config.countryCodes || ['YEM'];
    const defaultRange = config.dateRange || { start: 2010, end: new Date().getFullYear() };
    
    for (const indicatorCode of config.indicatorCodes) {
      for (const countryCode of defaultCountries) {
        try {
          const data = await this.fetchIndicator(
            indicatorCode,
            countryCode,
            defaultRange.start,
            defaultRange.end
          );
          
          if (data.length === 0) continue;
          
          result.fetched += data.length;
          
          // Store raw response
          const rawObjectId = await this.storeRawResponse(
            runId,
            `${this.baseUrl}/country/${countryCode}/indicator/${indicatorCode}`,
            data
          );
          
          // Create/get dataset version
          // (Simplified: in production, check for existing dataset)
          const datasetResult = await db.insert(datasets).values({
            name: `World Bank ${indicatorCode} - ${countryCode}`,
            sourceId: this.sourceId,
            publicationDate: new Date(),
            description: `World Bank World Development Indicators: ${indicatorCode}`,
            methodology: 'World Bank WDI API',
            license: 'CC-BY-4.0',
            status: 'published'
          });
          
          const datasetId = datasetResult[0].insertId;
          
          const versionResult = await db.insert(datasetVersions).values({
            datasetId: datasetId,
            versionNumber: 1,
            releaseDate: new Date(),
            ingestionRunId: runId,
            rawObjectId: rawObjectId,
            recordCount: data.length,
            sha256: crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex')
          });
          
          const versionId = versionResult[0].insertId;
          
          // Store time series
          const stored = await this.storeTimeSeries(
            versionId,
            indicatorCode,
            data,
            rawObjectId
          );
          
          result.stored += stored;
          
        } catch (error: any) {
          result.errors.push(`${indicatorCode}/${countryCode}: ${error.message}`);
          console.error(`  ❌ Error: ${error.message}`);
        }
      }
    }
    
    return result;
  }
}
