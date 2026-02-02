/**
 * UN Agencies Data Connectors
 * 
 * Direct API integration with UN agency data sources:
 * - OCHA Financial Tracking Service (FTS)
 * - OCHA Humanitarian Data Exchange (HDX)
 * - WFP VAM Food Prices
 * - FAO FAOSTAT
 * - UNHCR Refugee Data
 * - IOM Displacement Tracking Matrix
 * 
 * FULLY HOST-INDEPENDENT - Uses standard HTTP APIs
 */

import { BaseConnector, ConnectorConfig, IngestionResult, ConnectorRegistry } from './BaseConnector';
import { db } from '../db';
import { timeSeries } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

// ============================================================================
// OCHA FTS CONNECTOR
// ============================================================================

export class OCHAFTSConnector extends BaseConnector {
  private static readonly BASE_URL = 'https://api.hpc.tools/v1/public';
  private static readonly COUNTRY_CODE = 'YEM';
  private static readonly LOCATION_ID = 269; // Yemen location ID in FTS

  constructor() {
    super({
      name: 'OCHA_FTS',
      baseUrl: OCHAFTSConnector.BASE_URL,
      rateLimit: 30,
      retryAttempts: 3,
      retryDelay: 2000,
      timeout: 30000,
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      const url = `${this.config.baseUrl}/location/${OCHAFTSConnector.LOCATION_ID}`;
      const response = await this.fetchWithRetry(url);
      const data = await response.json();
      return data && data.data !== undefined;
    } catch (error) {
      this.log(`Connection test failed: ${(error as Error).message}`, 'error');
      return false;
    }
  }

  async getAvailableIndicators(): Promise<string[]> {
    return ['funding_total', 'funding_requirements', 'funding_coverage', 'donors_count', 'organizations_count'];
  }

  async ingestYear(year: number): Promise<IngestionResult> {
    const startTime = Date.now();
    const result: IngestionResult = {
      success: true,
      source: 'OCHA_FTS',
      year,
      recordsIngested: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
      timestamp: new Date(),
    };

    try {
      // Fetch funding data for the year
      const fundingData = await this.fetchYearFunding(year);
      
      if (fundingData) {
        // Store funding total
        const storedTotal = await this.storeData('funding_total', fundingData.totalFunding, year);
        storedTotal.isNew ? result.recordsIngested++ : result.recordsUpdated++;

        // Store requirements
        const storedReq = await this.storeData('funding_requirements', fundingData.requirements, year);
        storedReq.isNew ? result.recordsIngested++ : result.recordsUpdated++;

        // Store coverage percentage
        const coverage = fundingData.requirements > 0 
          ? (fundingData.totalFunding / fundingData.requirements) * 100 
          : 0;
        const storedCov = await this.storeData('funding_coverage', coverage, year);
        storedCov.isNew ? result.recordsIngested++ : result.recordsUpdated++;
      }

      // Fetch flow data
      const flows = await this.fetchYearFlows(year);
      if (flows.length > 0) {
        const storedFlows = await this.storeData('aid_flows_count', flows.length, year);
        storedFlows.isNew ? result.recordsIngested++ : result.recordsUpdated++;
      }

    } catch (error) {
      result.recordsFailed++;
      result.errors.push((error as Error).message);
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  async ingestYearMonth(year: number, month: number): Promise<IngestionResult> {
    return this.ingestYear(year);
  }

  private async fetchYearFunding(year: number): Promise<{ totalFunding: number; requirements: number } | null> {
    try {
      const url = `${this.config.baseUrl}/fts/flow?locationId=${OCHAFTSConnector.LOCATION_ID}&year=${year}&groupby=year`;
      const response = await this.fetchWithRetry(url);
      const data = await response.json();

      if (data.data && data.data.flows) {
        const totalFunding = data.data.flows.reduce((sum: number, f: any) => sum + (f.amountUSD || 0), 0);
        return {
          totalFunding,
          requirements: data.data.requirements || 0,
        };
      }

      return null;
    } catch (error) {
      this.log(`Failed to fetch funding for ${year}: ${(error as Error).message}`, 'warn');
      return null;
    }
  }

  private async fetchYearFlows(year: number): Promise<any[]> {
    try {
      const url = `${this.config.baseUrl}/fts/flow?locationId=${OCHAFTSConnector.LOCATION_ID}&year=${year}`;
      const response = await this.fetchWithRetry(url);
      const data = await response.json();
      return data.data?.flows || [];
    } catch (error) {
      this.log(`Failed to fetch flows for ${year}: ${(error as Error).message}`, 'warn');
      return [];
    }
  }

  private async storeData(indicator: string, value: number, year: number): Promise<{ isNew: boolean }> {
    try {
      const existing = await db
        .select()
        .from(timeSeries)
        .where(
          and(
            eq(timeSeries.indicatorCode, `OCHA_${indicator}`),
            eq(timeSeries.date, new Date(`${year}-01-01`))
          )
        )
        .limit(1);

      const seriesData = {
        indicatorCode: `OCHA_${indicator}`,
        regimeTag: 'mixed' as const,
        value: value?.toString() || '0',
        date: new Date(`${year}-01-01`),
        unit: indicator.includes('coverage') ? '%' : 'USD',
        confidenceRating: 'B' as const,
        sourceId: 1, // OCHA source
        notes: JSON.stringify({ 
          indicatorName: indicator.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          source: 'OCHA Financial Tracking Service',
          sourceUrl: `https://fts.unocha.org/countries/248/summary/${year}`,
          country: 'Yemen',
          countryCode: 'YEM',
          frequency: 'annual',
          fetchedAt: new Date().toISOString() 
        }),
        updatedAt: new Date(),
      };

      if (existing.length > 0) {
        await db.update(timeSeries).set(seriesData).where(eq(timeSeries.id, existing[0].id));
        return { isNew: false };
      } else {
        await db.insert(timeSeries).values({
          ...seriesData,
          createdAt: new Date(),
        });
        return { isNew: true };
      }
    } catch (error) {
      throw error;
    }
  }
}

// ============================================================================
// WFP VAM CONNECTOR
// ============================================================================

export class WFPConnector extends BaseConnector {
  private static readonly BASE_URL = 'https://api.vam.wfp.org/dataviz';
  private static readonly COUNTRY_CODE = 'YEM';

  constructor() {
    super({
      name: 'WFP_VAM',
      baseUrl: WFPConnector.BASE_URL,
      rateLimit: 20,
      retryAttempts: 3,
      retryDelay: 2000,
      timeout: 30000,
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      const url = `${this.config.baseUrl}/api/GetCountries`;
      const response = await this.fetchWithRetry(url);
      const data = await response.json();
      return Array.isArray(data);
    } catch (error) {
      this.log(`Connection test failed: ${(error as Error).message}`, 'error');
      return false;
    }
  }

  async getAvailableIndicators(): Promise<string[]> {
    return ['food_price_wheat', 'food_price_rice', 'food_price_oil', 'food_basket_cost'];
  }

  async ingestYear(year: number): Promise<IngestionResult> {
    const startTime = Date.now();
    const result: IngestionResult = {
      success: true,
      source: 'WFP_VAM',
      year,
      recordsIngested: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
      timestamp: new Date(),
    };

    try {
      // WFP provides monthly price data
      for (let month = 1; month <= 12; month++) {
        const monthResult = await this.ingestYearMonth(year, month);
        result.recordsIngested += monthResult.recordsIngested;
        result.recordsUpdated += monthResult.recordsUpdated;
        result.recordsFailed += monthResult.recordsFailed;
        result.errors.push(...monthResult.errors);
      }
    } catch (error) {
      result.recordsFailed++;
      result.errors.push((error as Error).message);
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  async ingestYearMonth(year: number, month: number): Promise<IngestionResult> {
    const startTime = Date.now();
    const result: IngestionResult = {
      success: true,
      source: 'WFP_VAM',
      year,
      month,
      recordsIngested: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
      timestamp: new Date(),
    };

    try {
      const prices = await this.fetchMonthlyPrices(year, month);
      
      for (const price of prices) {
        try {
          const stored = await this.storePrice(price, year, month);
          stored.isNew ? result.recordsIngested++ : result.recordsUpdated++;
        } catch (error) {
          result.recordsFailed++;
          result.errors.push(`${price.commodity}: ${(error as Error).message}`);
        }
      }
    } catch (error) {
      result.recordsFailed++;
      result.errors.push((error as Error).message);
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  private async fetchMonthlyPrices(year: number, month: number): Promise<any[]> {
    // WFP API structure varies - this is a simplified version
    try {
      const url = `${this.config.baseUrl}/api/GetPrices?country=${WFPConnector.COUNTRY_CODE}&year=${year}&month=${month}`;
      const response = await this.fetchWithRetry(url);
      const data = await response.json();
      return data || [];
    } catch (error) {
      this.log(`Failed to fetch prices for ${year}-${month}: ${(error as Error).message}`, 'warn');
      return [];
    }
  }

  private async storePrice(price: any, year: number, month: number): Promise<{ isNew: boolean }> {
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-01`;
    const indicator = `wfp_price_${price.commodity?.toLowerCase().replace(/\s+/g, '_') || 'unknown'}`;

    try {
      const existing = await db
        .select()
        .from(timeSeries)
        .where(
          and(
            eq(timeSeries.indicatorCode, indicator),
            eq(timeSeries.date, new Date(dateStr))
          )
        )
        .limit(1);

      const seriesData = {
        indicatorCode: indicator,
        indicatorName: `WFP Price: ${price.commodity || 'Unknown'}`,
        value: price.price?.toString() || null,
        date: new Date(dateStr),
        source: 'WFP VAM Food Prices',
        sourceUrl: 'https://dataviz.vam.wfp.org/',
        country: 'Yemen',
        countryCode: 'YEM',
        frequency: 'monthly',
        unit: price.currency || 'YER',
        metadata: JSON.stringify({
          market: price.market,
          unit: price.unit,
          fetchedAt: new Date().toISOString(),
        }),
        updatedAt: new Date(),
      };

      if (existing.length > 0) {
        await db.update(timeSeries).set(seriesData).where(eq(timeSeries.id, existing[0].id));
        return { isNew: false };
      } else {
        await db.insert(timeSeries).values({
          id: `wfp-${indicator}-${year}-${month}`,
          ...seriesData,
          createdAt: new Date(),
        });
        return { isNew: true };
      }
    } catch (error) {
      throw error;
    }
  }
}

// ============================================================================
// FAO CONNECTOR
// ============================================================================

export class FAOConnector extends BaseConnector {
  private static readonly BASE_URL = 'https://fenixservices.fao.org/faostat/api/v1';
  private static readonly COUNTRY_CODE = '249'; // Yemen in FAOSTAT

  constructor() {
    super({
      name: 'FAO',
      baseUrl: FAOConnector.BASE_URL,
      rateLimit: 20,
      retryAttempts: 3,
      retryDelay: 2000,
      timeout: 45000,
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      const url = `${this.config.baseUrl}/en/countries/`;
      const response = await this.fetchWithRetry(url);
      const data = await response.json();
      return data && data.data !== undefined;
    } catch (error) {
      this.log(`Connection test failed: ${(error as Error).message}`, 'error');
      return false;
    }
  }

  async getAvailableIndicators(): Promise<string[]> {
    return [
      'food_production_index',
      'crop_production_index',
      'livestock_production_index',
      'cereal_import_dependency',
      'dietary_energy_supply',
      'prevalence_undernourishment',
    ];
  }

  async ingestYear(year: number): Promise<IngestionResult> {
    const startTime = Date.now();
    const result: IngestionResult = {
      success: true,
      source: 'FAO',
      year,
      recordsIngested: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
      timestamp: new Date(),
    };

    const indicators = await this.getAvailableIndicators();
    
    for (const indicator of indicators) {
      try {
        const data = await this.fetchIndicator(indicator, year);
        if (data !== null) {
          const stored = await this.storeData(indicator, data, year);
          stored.isNew ? result.recordsIngested++ : result.recordsUpdated++;
        }
      } catch (error) {
        result.recordsFailed++;
        result.errors.push(`${indicator}: ${(error as Error).message}`);
      }
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  async ingestYearMonth(year: number, month: number): Promise<IngestionResult> {
    return this.ingestYear(year);
  }

  private async fetchIndicator(indicator: string, year: number): Promise<number | null> {
    // FAO API requires specific domain and element codes
    // This is a simplified version
    try {
      const url = `${this.config.baseUrl}/en/data/QCL?area=${FAOConnector.COUNTRY_CODE}&year=${year}&show_codes=true`;
      const response = await this.fetchWithRetry(url);
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        const record = data.data.find((d: any) => d.Item === indicator);
        return record?.Value || null;
      }
      return null;
    } catch (error) {
      this.log(`Failed to fetch ${indicator}: ${(error as Error).message}`, 'warn');
      return null;
    }
  }

  private async storeData(indicator: string, value: number, year: number): Promise<{ isNew: boolean }> {
    try {
      const existing = await db
        .select()
        .from(timeSeries)
        .where(
          and(
            eq(timeSeries.indicatorCode, `FAO_${indicator}`),
            eq(timeSeries.date, new Date(`${year}-01-01`))
          )
        )
        .limit(1);

      const seriesData = {
        indicatorCode: `FAO_${indicator}`,
        regimeTag: 'mixed' as const,
        value: value?.toString() || '0',
        date: new Date(`${year}-01-01`),
        unit: 'index',
        confidenceRating: 'B' as const,
        sourceId: 1, // FAO source
        notes: JSON.stringify({ 
          indicatorName: indicator.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          source: 'FAO FAOSTAT',
          sourceUrl: `https://www.fao.org/faostat/en/#data`,
          country: 'Yemen',
          countryCode: 'YEM',
          frequency: 'annual',
          fetchedAt: new Date().toISOString() 
        }),
        updatedAt: new Date(),
      };

      if (existing.length > 0) {
        await db.update(timeSeries).set(seriesData).where(eq(timeSeries.id, existing[0].id));
        return { isNew: false };
      } else {
        await db.insert(timeSeries).values({
          ...seriesData,
          createdAt: new Date(),
        });
        return { isNew: true };
      }
    } catch (error) {
      throw error;
    }
  }
}

// ============================================================================
// UNHCR CONNECTOR
// ============================================================================

export class UNHCRConnector extends BaseConnector {
  private static readonly BASE_URL = 'https://api.unhcr.org/population/v1';
  private static readonly COUNTRY_CODE = 'YEM';

  constructor() {
    super({
      name: 'UNHCR',
      baseUrl: UNHCRConnector.BASE_URL,
      rateLimit: 20,
      retryAttempts: 3,
      retryDelay: 2000,
      timeout: 30000,
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      const url = `${this.config.baseUrl}/countries/`;
      const response = await this.fetchWithRetry(url);
      const data = await response.json();
      return data && data.items !== undefined;
    } catch (error) {
      this.log(`Connection test failed: ${(error as Error).message}`, 'error');
      return false;
    }
  }

  async getAvailableIndicators(): Promise<string[]> {
    return ['refugees', 'asylum_seekers', 'idps', 'stateless', 'returned_refugees'];
  }

  async ingestYear(year: number): Promise<IngestionResult> {
    const startTime = Date.now();
    const result: IngestionResult = {
      success: true,
      source: 'UNHCR',
      year,
      recordsIngested: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
      timestamp: new Date(),
    };

    try {
      const populationData = await this.fetchPopulationData(year);
      
      for (const [indicator, value] of Object.entries(populationData)) {
        try {
          const stored = await this.storeData(indicator, value as number, year);
          stored.isNew ? result.recordsIngested++ : result.recordsUpdated++;
        } catch (error) {
          result.recordsFailed++;
          result.errors.push(`${indicator}: ${(error as Error).message}`);
        }
      }
    } catch (error) {
      result.recordsFailed++;
      result.errors.push((error as Error).message);
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  async ingestYearMonth(year: number, month: number): Promise<IngestionResult> {
    return this.ingestYear(year);
  }

  private async fetchPopulationData(year: number): Promise<Record<string, number>> {
    try {
      const url = `${this.config.baseUrl}/population/?year=${year}&coo=${UNHCRConnector.COUNTRY_CODE}`;
      const response = await this.fetchWithRetry(url);
      const data = await response.json();

      const result: Record<string, number> = {
        refugees: 0,
        asylum_seekers: 0,
        idps: 0,
        stateless: 0,
      };

      if (data.items) {
        for (const item of data.items) {
          result.refugees += item.refugees || 0;
          result.asylum_seekers += item.asylum_seekers || 0;
          result.idps += item.idps || 0;
          result.stateless += item.stateless || 0;
        }
      }

      return result;
    } catch (error) {
      this.log(`Failed to fetch population data for ${year}: ${(error as Error).message}`, 'warn');
      return {};
    }
  }

  private async storeData(indicator: string, value: number, year: number): Promise<{ isNew: boolean }> {
    try {
      const existing = await db
        .select()
        .from(timeSeries)
        .where(
          and(
            eq(timeSeries.indicatorCode, `UNHCR_${indicator}`),
            eq(timeSeries.date, new Date(`${year}-01-01`))
          )
        )
        .limit(1);

      const seriesData = {
        indicatorCode: `UNHCR_${indicator}`,
        regimeTag: 'mixed' as const,
        value: value?.toString() || '0',
        date: new Date(`${year}-01-01`),
        unit: 'persons',
        confidenceRating: 'B' as const,
        sourceId: 1, // UNHCR source
        notes: JSON.stringify({ 
          indicatorName: indicator.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          source: 'UNHCR Population Statistics',
          sourceUrl: `https://www.unhcr.org/refugee-statistics/`,
          country: 'Yemen',
          countryCode: 'YEM',
          frequency: 'annual',
          fetchedAt: new Date().toISOString() 
        }),
        updatedAt: new Date(),
      };

      if (existing.length > 0) {
        await db.update(timeSeries).set(seriesData).where(eq(timeSeries.id, existing[0].id));
        return { isNew: false };
      } else {
        await db.insert(timeSeries).values({
          ...seriesData,
          createdAt: new Date(),
        });
        return { isNew: true };
      }
    } catch (error) {
      throw error;
    }
  }
}

// Register all UN agency connectors
const ochaFtsConnector = new OCHAFTSConnector();
const wfpConnector = new WFPConnector();
const faoConnector = new FAOConnector();
const unhcrConnector = new UNHCRConnector();

ConnectorRegistry.register('OCHA_FTS', ochaFtsConnector);
ConnectorRegistry.register('WFP_VAM', wfpConnector);
ConnectorRegistry.register('FAO', faoConnector);
ConnectorRegistry.register('UNHCR', unhcrConnector);

export { ochaFtsConnector, wfpConnector, faoConnector, unhcrConnector };
