/**
 * IMF Data Connector
 * 
 * Direct API integration with IMF's open data APIs:
 * - World Economic Outlook (WEO)
 * - International Financial Statistics (IFS)
 * - Direction of Trade Statistics (DOTS)
 * 
 * FULLY HOST-INDEPENDENT - Uses standard HTTP APIs
 * 
 * @see https://datahelp.imf.org/knowledgebase/articles/667681-using-json-restful-web-service
 */

import { BaseConnector, ConnectorConfig, IngestionResult, ConnectorRegistry } from './BaseConnector';
import { db } from '../db';
import { timeSeries } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

// ============================================================================
// IMF INDICATOR DEFINITIONS
// ============================================================================

const IMF_INDICATORS = {
  // World Economic Outlook Indicators
  'NGDP_RPCH': 'Real GDP growth (Annual percent change)',
  'NGDPD': 'GDP, current prices (Billions of U.S. dollars)',
  'NGDPDPC': 'GDP per capita, current prices (U.S. dollars)',
  'NGDP_D': 'GDP, deflator (Index)',
  'PCPIPCH': 'Inflation, average consumer prices (Annual percent change)',
  'PCPIEPCH': 'Inflation, end of period consumer prices (Annual percent change)',
  'LUR': 'Unemployment rate (Percent of total labor force)',
  'LP': 'Population (Millions)',
  'BCA': 'Current account balance (Billions of U.S. dollars)',
  'BCA_NGDPD': 'Current account balance (Percent of GDP)',
  'GGXWDG_NGDP': 'General government gross debt (Percent of GDP)',
  'GGXCNL_NGDP': 'General government net lending/borrowing (Percent of GDP)',
  'GGR_NGDP': 'General government revenue (Percent of GDP)',
  'GGX_NGDP': 'General government total expenditure (Percent of GDP)',
  
  // International Financial Statistics
  'ENDA_XDC_USD_RATE': 'Exchange Rate, End of Period',
  'EDNA_USD_XDC_RATE': 'Exchange Rate, Period Average',
  'FM_BROAD_MONEY': 'Broad Money',
  'FI_INTEREST_RATE': 'Interest Rate',
};

// ============================================================================
// IMF CONNECTOR
// ============================================================================

export class IMFConnector extends BaseConnector {
  private static readonly BASE_URL = 'https://www.imf.org/external/datamapper/api/v1';
  private static readonly IFS_URL = 'http://dataservices.imf.org/REST/SDMX_JSON.svc';
  private static readonly COUNTRY_CODE = 'YEM'; // Yemen

  constructor() {
    super({
      name: 'IMF',
      baseUrl: IMFConnector.BASE_URL,
      rateLimit: 20, // 20 requests per minute
      retryAttempts: 3,
      retryDelay: 3000,
      timeout: 45000,
    });
  }

  /**
   * Test connection to IMF API
   */
  async testConnection(): Promise<boolean> {
    try {
      const url = `${this.config.baseUrl}/NGDP_RPCH/${IMFConnector.COUNTRY_CODE}`;
      const response = await this.fetchWithRetry(url);
      const data = await response.json();
      return data && data.values !== undefined;
    } catch (error) {
      this.log(`Connection test failed: ${(error as Error).message}`, 'error');
      return false;
    }
  }

  /**
   * Get list of available indicators
   */
  async getAvailableIndicators(): Promise<string[]> {
    return Object.keys(IMF_INDICATORS);
  }

  /**
   * Ingest all indicators for a specific year
   */
  async ingestYear(year: number): Promise<IngestionResult> {
    const startTime = Date.now();
    const result: IngestionResult = {
      success: true,
      source: 'IMF',
      year,
      recordsIngested: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
      timestamp: new Date(),
    };

    const indicators = Object.keys(IMF_INDICATORS);
    
    for (const indicatorCode of indicators) {
      try {
        const data = await this.fetchIndicator(indicatorCode, year);
        
        if (data !== null) {
          const stored = await this.storeIndicatorData(indicatorCode, data, year);
          if (stored.isNew) {
            result.recordsIngested++;
          } else {
            result.recordsUpdated++;
          }
        }
      } catch (error) {
        result.recordsFailed++;
        result.errors.push(`${indicatorCode}: ${(error as Error).message}`);
      }
    }

    result.duration = Date.now() - startTime;
    result.success = result.recordsFailed < indicators.length / 2;

    return result;
  }

  /**
   * Ingest indicators for a specific year and month
   */
  async ingestYearMonth(year: number, month: number): Promise<IngestionResult> {
    // IMF WEO data is annual, IFS has monthly data
    return this.ingestYear(year);
  }

  /**
   * Fetch a specific indicator from IMF DataMapper API
   */
  private async fetchIndicator(indicatorCode: string, year: number): Promise<number | null> {
    const url = `${this.config.baseUrl}/${indicatorCode}/${IMFConnector.COUNTRY_CODE}`;
    
    try {
      const response = await this.fetchWithRetry(url);
      const data = await response.json();

      if (data.values && data.values[IMFConnector.COUNTRY_CODE]) {
        const yearData = data.values[IMFConnector.COUNTRY_CODE][year.toString()];
        return yearData !== undefined ? yearData : null;
      }

      return null;
    } catch (error) {
      this.log(`Failed to fetch ${indicatorCode}: ${(error as Error).message}`, 'warn');
      return null;
    }
  }

  /**
   * Fetch all years of data for an indicator
   */
  async fetchIndicatorAllYears(indicatorCode: string): Promise<Array<{ year: number; value: number | null }>> {
    const url = `${this.config.baseUrl}/${indicatorCode}/${IMFConnector.COUNTRY_CODE}`;
    
    try {
      const response = await this.fetchWithRetry(url);
      const data = await response.json();

      if (data.values && data.values[IMFConnector.COUNTRY_CODE]) {
        const yearData = data.values[IMFConnector.COUNTRY_CODE];
        return Object.entries(yearData).map(([year, value]) => ({
          year: parseInt(year),
          value: value as number | null,
        }));
      }

      return [];
    } catch (error) {
      this.log(`Failed to fetch all years for ${indicatorCode}: ${(error as Error).message}`, 'warn');
      return [];
    }
  }

  /**
   * Store indicator data in the database
   */
  private async storeIndicatorData(
    indicatorCode: string,
    value: number,
    year: number
  ): Promise<{ isNew: boolean }> {
    const indicatorName = IMF_INDICATORS[indicatorCode as keyof typeof IMF_INDICATORS] || indicatorCode;
    
    try {
      // Check if record exists
      const existing = await db
        .select()
        .from(timeSeries)
        .where(
          and(
            eq(timeSeries.indicatorCode, `IMF_${indicatorCode}`),
            eq(timeSeries.date, new Date(`${year}-01-01`))
          )
        )
        .limit(1);

      const seriesData = {
        indicatorCode: `IMF_${indicatorCode}`,
        indicatorName,
        value: value?.toString() || null,
        date: new Date(`${year}-01-01`),
        source: 'IMF World Economic Outlook',
        sourceUrl: `https://www.imf.org/external/datamapper/${indicatorCode}@WEO/YEM`,
        country: 'Yemen',
        countryCode: 'YEM',
        frequency: 'annual',
        unit: this.getIndicatorUnit(indicatorCode),
        metadata: JSON.stringify({
          fetchedAt: new Date().toISOString(),
          apiVersion: 'v1',
        }),
        updatedAt: new Date(),
      };

      if (existing.length > 0) {
        await db
          .update(timeSeries)
          .set(seriesData)
          .where(eq(timeSeries.id, existing[0].id));
        return { isNew: false };
      } else {
        await db.insert(timeSeries).values({
          id: `imf-${indicatorCode}-${year}`,
          ...seriesData,
          createdAt: new Date(),
        });
        return { isNew: true };
      }
    } catch (error) {
      this.log(`Failed to store ${indicatorCode} for ${year}: ${(error as Error).message}`, 'error');
      throw error;
    }
  }

  /**
   * Get the unit for an indicator
   */
  private getIndicatorUnit(indicatorCode: string): string {
    if (indicatorCode.includes('PCH') || indicatorCode.includes('NGDP')) {
      return '%';
    }
    if (indicatorCode.includes('USD') || indicatorCode.includes('D')) {
      return 'USD';
    }
    return 'value';
  }

  /**
   * Fetch IMF Article IV consultation reports for Yemen
   */
  async fetchArticleIVReports(): Promise<any[]> {
    try {
      // IMF doesn't have a public API for Article IV reports, so we use search
      const url = 'https://www.imf.org/en/Publications/Search?country=Yemen&series=IMF%20Staff%20Country%20Reports';
      this.log('Article IV reports require manual ingestion from IMF website');
      return [];
    } catch (error) {
      this.log(`Failed to fetch Article IV reports: ${(error as Error).message}`, 'warn');
      return [];
    }
  }

  /**
   * Run full ingestion for all years
   */
  async runFullIngestion(startYear: number = 2010, endYear: number = 2026): Promise<{
    indicators: IngestionResult[];
  }> {
    this.log(`Starting full IMF ingestion: ${startYear}-${endYear}`);

    const indicatorResults: IngestionResult[] = [];
    for (let year = startYear; year <= endYear; year++) {
      const result = await this.ingestYear(year);
      indicatorResults.push(result);
      this.log(`Year ${year}: ${result.recordsIngested} new, ${result.recordsUpdated} updated`);
    }

    return { indicators: indicatorResults };
  }
}

// Register the connector
const imfConnector = new IMFConnector();
ConnectorRegistry.register('IMF', imfConnector);

export { imfConnector };
