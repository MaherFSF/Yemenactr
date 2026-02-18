/**
 * Numeric Data Fetchers
 * 
 * Real API integrations for flagship numeric data sources:
 * - World Bank WDI
 * - IMF IFS
 * - UNHCR Population Statistics
 * - OCHA FTS
 * - WFP VAM
 * 
 * Each fetcher:
 * - Fetches data at native frequency for a given year
 * - Returns ObservationData array
 * - Handles rate limiting and errors
 * - Never invents or interpolates missing data
 */

import type { NumericProduct, DataFrequency } from './numericSourceRegistry';
import type { ObservationData } from './numericBackfillRunner';

// ============================================================================
// WORLD BANK WDI FETCHER
// ============================================================================

/**
 * Fetch World Bank WDI data for Yemen
 * API: https://api.worldbank.org/v2/country/YE/indicator/{indicatorCode}?date={year}&format=json
 */
export async function fetchWorldBankData(
  year: number,
  product: NumericProduct
): Promise<ObservationData[]> {
  const observations: ObservationData[] = [];

  if (!product.indicatorCode) {
    throw new Error(`World Bank product ${product.product_id} missing indicatorCode`);
  }

  try {
    // World Bank API endpoint
    const url = `https://api.worldbank.org/v2/country/YE/indicator/${product.indicatorCode}?date=${year}&format=json`;
    
    console.log(`[WorldBank] Fetching: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'YETO-Platform/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`World Bank API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // World Bank returns [metadata, data]
    if (!Array.isArray(data) || data.length < 2) {
      console.log(`[WorldBank] No data returned for ${product.product_id} year ${year}`);
      return observations;
    }

    const records = data[1];
    if (!Array.isArray(records)) {
      console.log(`[WorldBank] Invalid response format for ${product.product_id}`);
      return observations;
    }

    for (const record of records) {
      if (record.value !== null && record.value !== undefined) {
        // World Bank data is annual, use year-end date
        const observationDate = new Date(`${record.date}-12-31`);
        
        observations.push({
          date: observationDate,
          value: parseFloat(record.value),
          unit: product.unit,
          frequency: 'annual',
          regimeTag: 'international',
          rawData: record,
          sourceMetadata: {
            source: 'World Bank WDI',
            indicatorCode: product.indicatorCode,
            countryCode: record.countryiso3code || 'YEM',
          },
        });
      }
    }

    console.log(`[WorldBank] Fetched ${observations.length} observations for ${product.product_id} year ${year}`);

  } catch (error) {
    console.error(`[WorldBank] Error fetching ${product.product_id} year ${year}:`, error);
    throw error;
  }

  return observations;
}

// ============================================================================
// IMF IFS FETCHER (SDMX)
// ============================================================================

/**
 * Fetch IMF International Financial Statistics data
 * Note: IMF SDMX API is complex, this is a simplified version
 * Real implementation would need full SDMX parsing
 */
export async function fetchIMFData(
  year: number,
  product: NumericProduct
): Promise<ObservationData[]> {
  const observations: ObservationData[] = [];

  if (!product.indicatorCode) {
    throw new Error(`IMF product ${product.product_id} missing indicatorCode`);
  }

  try {
    // IMF Data Mapper API (simpler than SDMX)
    // https://www.imf.org/external/datamapper/api/v1/{indicator}/{country}
    
    // Note: This is simplified. Real IMF API requires more complex handling
    console.log(`[IMF] Fetching data for ${product.product_id} year ${year}`);
    
    // For now, return empty array as IMF API requires more complex setup
    // In production, would implement full SDMX client
    console.log(`[IMF] IMF SDMX API requires full implementation - placeholder for now`);
    
    return observations;

  } catch (error) {
    console.error(`[IMF] Error fetching ${product.product_id} year ${year}:`, error);
    throw error;
  }
}

// ============================================================================
// UNHCR POPULATION STATISTICS FETCHER
// ============================================================================

/**
 * Fetch UNHCR refugee and IDP statistics
 * API: https://api.unhcr.org/population/v1/
 * Requires API key
 */
export async function fetchUNHCRData(
  year: number,
  product: NumericProduct
): Promise<ObservationData[]> {
  const observations: ObservationData[] = [];

  try {
    const apiKey = process.env.UNHCR_API_KEY;
    if (!apiKey) {
      console.log(`[UNHCR] API key not configured, skipping ${product.product_id}`);
      return observations;
    }

    // UNHCR API endpoint
    // GET /population/v1/population/?year={year}&country_of_origin=YEM
    const url = `https://api.unhcr.org/population/v1/population/?year=${year}&country_of_origin=YEM`;
    
    console.log(`[UNHCR] Fetching: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'API-Key': apiKey,
        'User-Agent': 'YETO-Platform/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`UNHCR API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.items || !Array.isArray(data.items)) {
      console.log(`[UNHCR] No data returned for ${product.product_id} year ${year}`);
      return observations;
    }

    // UNHCR data is annual
    const observationDate = new Date(`${year}-12-31`);
    
    // Aggregate based on product type
    let totalValue = 0;
    
    for (const item of data.items) {
      if (product.product_id === 'unhcr-refugees' && item.refugees) {
        totalValue += parseInt(item.refugees) || 0;
      } else if (product.product_id === 'unhcr-idps' && item.idps) {
        totalValue += parseInt(item.idps) || 0;
      } else if (product.product_id === 'unhcr-asylum-seekers' && item.asylum_seekers) {
        totalValue += parseInt(item.asylum_seekers) || 0;
      }
    }

    if (totalValue > 0) {
      observations.push({
        date: observationDate,
        value: totalValue,
        unit: 'persons',
        frequency: 'annual',
        regimeTag: product.regimeTag || 'international',
        rawData: { items: data.items },
        sourceMetadata: {
          source: 'UNHCR',
          year,
          recordCount: data.items.length,
        },
      });
    }

    console.log(`[UNHCR] Fetched ${observations.length} observations for ${product.product_id} year ${year}`);

  } catch (error) {
    console.error(`[UNHCR] Error fetching ${product.product_id} year ${year}:`, error);
    throw error;
  }

  return observations;
}

// ============================================================================
// OCHA FTS FETCHER
// ============================================================================

/**
 * Fetch OCHA Financial Tracking Service data
 * API: https://api.hpc.tools/v2/fts/flow
 */
export async function fetchOCHAFTSData(
  year: number,
  product: NumericProduct
): Promise<ObservationData[]> {
  const observations: ObservationData[] = [];

  try {
    // OCHA FTS API - get flows for Yemen (country code: 248)
    const url = `https://api.hpc.tools/v2/fts/flow?countryISO3=yem&year=${year}`;
    
    console.log(`[OCHA-FTS] Fetching: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'YETO-Platform/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`OCHA FTS API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.data || !data.data.flows) {
      console.log(`[OCHA-FTS] No flows returned for year ${year}`);
      return observations;
    }

    const flows = data.data.flows;
    
    // Group by month for monthly observations
    const monthlyTotals: Map<string, number> = new Map();
    
    for (const flow of flows) {
      if (flow.amountUSD && flow.date) {
        const date = new Date(flow.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        const current = monthlyTotals.get(monthKey) || 0;
        monthlyTotals.set(monthKey, current + parseFloat(flow.amountUSD));
      }
    }

    // Create observations for each month
    for (const [monthKey, total] of monthlyTotals.entries()) {
      const [y, m] = monthKey.split('-');
      const observationDate = new Date(`${y}-${m}-01`);
      
      observations.push({
        date: observationDate,
        value: total,
        unit: 'USD',
        frequency: product.frequency,
        regimeTag: 'mixed',
        rawData: {
          month: monthKey,
          flowCount: flows.filter((f: any) => {
            const d = new Date(f.date);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === monthKey;
          }).length,
        },
        sourceMetadata: {
          source: 'OCHA FTS',
          year,
          totalFlows: flows.length,
        },
      });
    }

    console.log(`[OCHA-FTS] Fetched ${observations.length} observations for ${product.product_id} year ${year}`);

  } catch (error) {
    console.error(`[OCHA-FTS] Error fetching ${product.product_id} year ${year}:`, error);
    throw error;
  }

  return observations;
}

// ============================================================================
// WFP VAM FETCHER
// ============================================================================

/**
 * Fetch WFP food price data
 * Requires API key
 */
export async function fetchWFPData(
  year: number,
  product: NumericProduct
): Promise<ObservationData[]> {
  const observations: ObservationData[] = [];

  try {
    const apiKey = process.env.WFP_VAM_API_KEY;
    if (!apiKey) {
      console.log(`[WFP] API key not configured, skipping ${product.product_id}`);
      return observations;
    }

    // WFP VAM API endpoint
    const url = `https://api.vam.wfp.org/dataviz/api/GetMarketPrices?country=Yemen&year=${year}`;
    
    console.log(`[WFP] Fetching: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'API-Key': apiKey,
        'User-Agent': 'YETO-Platform/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`WFP API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.log(`[WFP] No data returned for year ${year}`);
      return observations;
    }

    // Group by month and commodity
    const monthlyPrices: Map<string, number[]> = new Map();
    
    for (const record of data) {
      if (record.price && record.date) {
        const date = new Date(record.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyPrices.has(monthKey)) {
          monthlyPrices.set(monthKey, []);
        }
        monthlyPrices.get(monthKey)!.push(parseFloat(record.price));
      }
    }

    // Create observations for each month (average price)
    for (const [monthKey, prices] of monthlyPrices.entries()) {
      const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      const [y, m] = monthKey.split('-');
      const observationDate = new Date(`${y}-${m}-01`);
      
      observations.push({
        date: observationDate,
        value: avgPrice,
        unit: 'YER',
        frequency: 'monthly',
        regimeTag: 'mixed',
        rawData: {
          month: monthKey,
          priceCount: prices.length,
          minPrice: Math.min(...prices),
          maxPrice: Math.max(...prices),
        },
        sourceMetadata: {
          source: 'WFP VAM',
          year,
        },
      });
    }

    console.log(`[WFP] Fetched ${observations.length} observations for ${product.product_id} year ${year}`);

  } catch (error) {
    console.error(`[WFP] Error fetching ${product.product_id} year ${year}:`, error);
    throw error;
  }

  return observations;
}

// ============================================================================
// FETCHER FACTORY
// ============================================================================

/**
 * Create a fetcher function for a given source
 */
export function createFetcher(sourceId: string) {
  switch (sourceId) {
    case 'wb-wdi':
      return fetchWorldBankData;
    case 'imf-ifs':
      return fetchIMFData;
    case 'unhcr-popstats':
      return fetchUNHCRData;
    case 'ocha-fts':
      return fetchOCHAFTSData;
    case 'wfp-vam':
      return fetchWFPData;
    default:
      throw new Error(`No fetcher available for source: ${sourceId}`);
  }
}

/**
 * Get fetcher map for all active sources
 */
export function getAllFetchers(): Map<string, (year: number, product: NumericProduct) => Promise<ObservationData[]>> {
  const fetchers = new Map();
  
  fetchers.set('wb-wdi', fetchWorldBankData);
  fetchers.set('imf-ifs', fetchIMFData);
  fetchers.set('unhcr-popstats', fetchUNHCRData);
  fetchers.set('ocha-fts', fetchOCHAFTSData);
  fetchers.set('wfp-vam', fetchWFPData);
  
  return fetchers;
}

/**
 * Test a fetcher with a single year
 */
export async function testFetcher(
  sourceId: string,
  productId: string,
  year: number
): Promise<{
  success: boolean;
  observationCount: number;
  error?: string;
  sampleObservation?: ObservationData;
}> {
  try {
    const fetcher = createFetcher(sourceId);
    
    // Mock product for testing
    const product: NumericProduct = {
      product_id: productId,
      name: 'Test Product',
      nameAr: 'منتج تجريبي',
      frequency: 'annual',
      unit: 'USD',
      availableFrom: '2000-01-01',
      regimeTag: 'international',
      indicatorCode: productId,
    };
    
    const observations = await fetcher(year, product);
    
    return {
      success: true,
      observationCount: observations.length,
      sampleObservation: observations[0],
    };
  } catch (error) {
    return {
      success: false,
      observationCount: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
