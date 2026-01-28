/**
 * World Bank Data API Fetcher
 * 
 * Fetches Yemen economic indicators from World Bank Data API
 * API Documentation: https://datahelpdesk.worldbank.org/knowledgebase/articles/889392
 * 
 * Key Yemen Indicators:
 * - NY.GDP.MKTP.CD: GDP (current US$)
 * - NY.GDP.PCAP.CD: GDP per capita (current US$)
 * - FP.CPI.TOTL.ZG: Inflation, consumer prices (annual %)
 * - SL.UEM.TOTL.ZS: Unemployment, total (% of total labor force)
 * - SP.POP.TOTL: Population, total
 * - BN.CAB.XOKA.CD: Current account balance (BoP, current US$)
 * - NE.EXP.GNFS.ZS: Exports of goods and services (% of GDP)
 * - NE.IMP.GNFS.ZS: Imports of goods and services (% of GDP)
 */

import { getDb } from '../db';
import { sql } from 'drizzle-orm';

const WORLD_BANK_API_BASE = 'https://api.worldbank.org/v2';
const YEMEN_COUNTRY_CODE = 'YEM';

// Key economic indicators for Yemen
export const YEMEN_INDICATORS = {
  GDP: 'NY.GDP.MKTP.CD',
  GDP_PER_CAPITA: 'NY.GDP.PCAP.CD',
  INFLATION: 'FP.CPI.TOTL.ZG',
  UNEMPLOYMENT: 'SL.UEM.TOTL.ZS',
  POPULATION: 'SP.POP.TOTL',
  CURRENT_ACCOUNT: 'BN.CAB.XOKA.CD',
  EXPORTS_PCT_GDP: 'NE.EXP.GNFS.ZS',
  IMPORTS_PCT_GDP: 'NE.IMP.GNFS.ZS',
  EXTERNAL_DEBT: 'DT.DOD.DECT.CD',
  REMITTANCES: 'BX.TRF.PWKR.CD.DT',
  FDI_INFLOWS: 'BX.KLT.DINV.CD.WD',
  TRADE_PCT_GDP: 'NE.TRD.GNFS.ZS',
  GROSS_SAVINGS: 'NY.GNS.ICTR.ZS',
  MILITARY_EXPENDITURE: 'MS.MIL.XPND.GD.ZS',
  LIFE_EXPECTANCY: 'SP.DYN.LE00.IN',
  INFANT_MORTALITY: 'SP.DYN.IMRT.IN',
  POVERTY_RATIO: 'SI.POV.DDAY',
};

export interface WorldBankDataPoint {
  indicator: string;
  indicatorName: string;
  country: string;
  countryName: string;
  date: string;
  value: number | null;
  unit: string;
  decimal: number;
}

export interface WorldBankResponse {
  page: number;
  pages: number;
  perPage: number;
  total: number;
  data: WorldBankDataPoint[];
}

/**
 * Fetch data from World Bank API for a specific indicator
 */
export async function fetchWorldBankIndicator(
  indicatorCode: string,
  startYear: number = 2010,
  endYear: number = new Date().getFullYear()
): Promise<WorldBankDataPoint[]> {
  const url = `${WORLD_BANK_API_BASE}/country/${YEMEN_COUNTRY_CODE}/indicator/${indicatorCode}?format=json&date=${startYear}:${endYear}&per_page=100`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`World Bank API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // World Bank API returns [metadata, data] array
    if (!Array.isArray(data) || data.length < 2) {
      console.log(`No data returned for indicator ${indicatorCode}`);
      return [];
    }
    
    const [metadata, records] = data;
    
    if (!records || !Array.isArray(records)) {
      return [];
    }
    
    return records.map((record: any) => ({
      indicator: record.indicator?.id || indicatorCode,
      indicatorName: record.indicator?.value || '',
      country: record.country?.id || YEMEN_COUNTRY_CODE,
      countryName: record.country?.value || 'Yemen',
      date: record.date,
      value: record.value,
      unit: record.unit || '',
      decimal: record.decimal || 0,
    }));
  } catch (error) {
    console.error(`Error fetching World Bank indicator ${indicatorCode}:`, error);
    throw error;
  }
}

/**
 * Fetch all Yemen economic indicators from World Bank
 */
export async function fetchAllYemenIndicators(
  startYear: number = 2010,
  endYear: number = new Date().getFullYear()
): Promise<Map<string, WorldBankDataPoint[]>> {
  const results = new Map<string, WorldBankDataPoint[]>();
  
  for (const [name, code] of Object.entries(YEMEN_INDICATORS)) {
    try {
      console.log(`Fetching World Bank indicator: ${name} (${code})`);
      const data = await fetchWorldBankIndicator(code, startYear, endYear);
      results.set(code, data);
      
      // Rate limiting - wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to fetch ${name}:`, error);
      results.set(code, []);
    }
  }
  
  return results;
}

/**
 * Store World Bank data in the database
 */
export async function storeWorldBankData(
  indicatorCode: string,
  data: WorldBankDataPoint[]
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  let insertedCount = 0;
  
  for (const point of data) {
    if (point.value === null) continue;
    
    try {
      // Insert into time_series_data table using snake_case column names
      await db.execute(sql`
        INSERT INTO time_series_data (
          indicator_code,
          indicator_name,
          source_name,
          country_code,
          date,
          year,
          value,
          unit,
          confidence_level,
          metadata
        ) VALUES (
          ${indicatorCode},
          ${point.indicatorName},
          'World Bank',
          'YEM',
          ${`${point.date}-01-01`},
          ${parseInt(point.date)},
          ${point.value},
          ${point.unit || 'units'},
          'A',
          ${JSON.stringify({ source: 'World Bank API', decimal: point.decimal })}
        )
        ON DUPLICATE KEY UPDATE
          value = VALUES(value),
          updated_at = NOW()
      `);
      insertedCount++;
    } catch (error) {
      console.error(`Error storing data point for ${indicatorCode}:`, error);
    }
  }
  
  return insertedCount;
}

/**
 * Run full World Bank backfill from 2010 to present
 */
export async function runWorldBankBackfill(
  onProgress?: (indicator: string, progress: number, total: number) => void
): Promise<{
  success: boolean;
  indicatorsProcessed: number;
  dataPointsInserted: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let indicatorsProcessed = 0;
  let dataPointsInserted = 0;
  
  const indicatorEntries = Object.entries(YEMEN_INDICATORS);
  const total = indicatorEntries.length;
  
  for (const [name, code] of indicatorEntries) {
    try {
      console.log(`[World Bank Backfill] Processing ${name} (${code})...`);
      
      // Fetch data from API
      const data = await fetchWorldBankIndicator(code, 2010, new Date().getFullYear());
      
      // Store in database
      const inserted = await storeWorldBankData(code, data);
      dataPointsInserted += inserted;
      indicatorsProcessed++;
      
      // Report progress
      if (onProgress) {
        onProgress(name, indicatorsProcessed, total);
      }
      
      console.log(`[World Bank Backfill] ${name}: ${inserted} data points inserted`);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      const errorMsg = `Failed to process ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(`[World Bank Backfill] ${errorMsg}`);
      errors.push(errorMsg);
    }
  }
  
  return {
    success: errors.length === 0,
    indicatorsProcessed,
    dataPointsInserted,
    errors,
  };
}

/**
 * Create data fetcher function for backfill orchestrator
 */
export function createWorldBankFetcher(
  indicatorCode: string
): (date: Date, regimeTag?: string) => Promise<number | null> {
  return async (date: Date, regimeTag?: string) => {
    const year = date.getFullYear();
    
    try {
      const data = await fetchWorldBankIndicator(indicatorCode, year, year);
      
      if (data.length > 0 && data[0].value !== null) {
        return data[0].value;
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching World Bank data for ${indicatorCode} at ${year}:`, error);
      return null;
    }
  };
}
