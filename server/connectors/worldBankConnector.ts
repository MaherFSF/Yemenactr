/**
 * World Bank API Connector
 * Fetches GDP, poverty, external balance, and other macroeconomic indicators for Yemen
 * API: https://api.worldbank.org/v2/
 * No API key required - public access
 */

import { getDb } from "../db";
import { timeSeries, sources } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

// ============================================
// Types
// ============================================

interface WorldBankDataPoint {
  indicator: { id: string; value: string };
  country: { id: string; value: string };
  countryiso3code: string;
  date: string;
  value: number | null;
  unit: string;
  obs_status: string;
  decimal: number;
}

interface WorldBankResponse {
  page: number;
  pages: number;
  per_page: string;
  total: number;
  sourceid: string;
  lastupdated: string;
}

// ============================================
// World Bank Indicator Codes for Yemen
// ============================================

export const WORLD_BANK_INDICATORS = {
  // GDP & Growth
  GDP_CURRENT_USD: { code: 'NY.GDP.MKTP.CD', name: 'GDP (current US$)', unit: 'USD billions', category: 'economy' },
  GDP_GROWTH: { code: 'NY.GDP.MKTP.KD.ZG', name: 'GDP growth (annual %)', unit: 'percent', category: 'economy' },
  GDP_PER_CAPITA: { code: 'NY.GDP.PCAP.CD', name: 'GDP per capita (current US$)', unit: 'USD', category: 'economy' },
  GNI_PER_CAPITA: { code: 'NY.GNP.PCAP.CD', name: 'GNI per capita (current US$)', unit: 'USD', category: 'economy' },
  
  // Trade & External
  EXPORTS_GDP: { code: 'NE.EXP.GNFS.ZS', name: 'Exports of goods and services (% of GDP)', unit: 'percent', category: 'trade' },
  IMPORTS_GDP: { code: 'NE.IMP.GNFS.ZS', name: 'Imports of goods and services (% of GDP)', unit: 'percent', category: 'trade' },
  TRADE_BALANCE: { code: 'NE.RSB.GNFS.ZS', name: 'External balance on goods and services (% of GDP)', unit: 'percent', category: 'trade' },
  CURRENT_ACCOUNT: { code: 'BN.CAB.XOKA.GD.ZS', name: 'Current account balance (% of GDP)', unit: 'percent', category: 'trade' },
  FDI_INFLOWS: { code: 'BX.KLT.DINV.WD.GD.ZS', name: 'Foreign direct investment, net inflows (% of GDP)', unit: 'percent', category: 'trade' },
  REMITTANCES: { code: 'BX.TRF.PWKR.DT.GD.ZS', name: 'Personal remittances, received (% of GDP)', unit: 'percent', category: 'trade' },
  
  // Poverty & Inequality
  POVERTY_HEADCOUNT: { code: 'SI.POV.NAHC', name: 'Poverty headcount ratio at national poverty lines', unit: 'percent', category: 'poverty' },
  POVERTY_190: { code: 'SI.POV.DDAY', name: 'Poverty headcount ratio at $1.90 a day', unit: 'percent', category: 'poverty' },
  GINI_INDEX: { code: 'SI.POV.GINI', name: 'GINI index', unit: 'index', category: 'poverty' },
  
  // Population & Labor
  POPULATION: { code: 'SP.POP.TOTL', name: 'Population, total', unit: 'persons', category: 'population' },
  POPULATION_GROWTH: { code: 'SP.POP.GROW', name: 'Population growth (annual %)', unit: 'percent', category: 'population' },
  UNEMPLOYMENT: { code: 'SL.UEM.TOTL.ZS', name: 'Unemployment, total (% of total labor force)', unit: 'percent', category: 'labor' },
  LABOR_FORCE: { code: 'SL.TLF.TOTL.IN', name: 'Labor force, total', unit: 'persons', category: 'labor' },
  
  // Inflation & Prices
  INFLATION_CPI: { code: 'FP.CPI.TOTL.ZG', name: 'Inflation, consumer prices (annual %)', unit: 'percent', category: 'prices' },
  INFLATION_GDP_DEFLATOR: { code: 'NY.GDP.DEFL.KD.ZG', name: 'Inflation, GDP deflator (annual %)', unit: 'percent', category: 'prices' },
  
  // Government & Debt
  GOV_EXPENDITURE: { code: 'GC.XPN.TOTL.GD.ZS', name: 'Expense (% of GDP)', unit: 'percent', category: 'government' },
  GOV_REVENUE: { code: 'GC.REV.XGRT.GD.ZS', name: 'Revenue, excluding grants (% of GDP)', unit: 'percent', category: 'government' },
  EXTERNAL_DEBT: { code: 'DT.DOD.DECT.GD.ZS', name: 'External debt stocks (% of GNI)', unit: 'percent', category: 'government' },
  
  // Health & Development
  LIFE_EXPECTANCY: { code: 'SP.DYN.LE00.IN', name: 'Life expectancy at birth, total (years)', unit: 'years', category: 'health' },
  INFANT_MORTALITY: { code: 'SP.DYN.IMRT.IN', name: 'Mortality rate, infant (per 1,000 live births)', unit: 'per 1,000', category: 'health' },
  HEALTH_EXPENDITURE: { code: 'SH.XPD.CHEX.GD.ZS', name: 'Current health expenditure (% of GDP)', unit: 'percent', category: 'health' },
};

// ============================================
// Constants
// ============================================

const BASE_URL = 'https://api.worldbank.org/v2';
const COUNTRY_CODE = 'YEM';
const SOURCE_NAME = 'World Bank WDI';

// ============================================
// Helper Functions
// ============================================

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch a single indicator from World Bank API
 */
async function fetchIndicator(indicatorCode: string, fromYear: number, toYear: number): Promise<WorldBankDataPoint[]> {
  const url = `${BASE_URL}/country/${COUNTRY_CODE}/indicator/${indicatorCode}?format=json&per_page=200&date=${fromYear}:${toYear}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const json = await response.json();
  
  // World Bank API returns [metadata, data] array
  if (!Array.isArray(json) || json.length < 2) {
    return [];
  }

  const [_metadata, data] = json as [WorldBankResponse, WorldBankDataPoint[]];
  
  if (!data || !Array.isArray(data)) {
    return [];
  }

  return data;
}

/**
 * Ensure the World Bank source exists in the database
 */
async function ensureSource(): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  // Check if source exists
  const existing = await db.select().from(sources).where(eq(sources.publisher, SOURCE_NAME)).limit(1);
  
  if (existing.length > 0) {
    return existing[0].id;
  }
  
  // Create new source
  const result = await db.insert(sources).values({
    publisher: SOURCE_NAME,
    url: 'https://data.worldbank.org/',
    license: 'CC-BY-4.0',
    retrievalDate: new Date(),
    notes: 'World Development Indicators - comprehensive macroeconomic data including GDP, trade, poverty, population, and development indicators',
  });
  
  // Get the inserted ID
  const newSource = await db.select().from(sources).where(eq(sources.publisher, SOURCE_NAME)).limit(1);
  return newSource[0].id;
}

// ============================================
// Main Fetch Functions
// ============================================

/**
 * Fetch all World Bank indicators for Yemen
 */
export async function fetchWorldBankData(startYear?: number, endYear?: number): Promise<{
  success: boolean;
  recordsIngested: number;
  errors: string[];
}> {
  const currentYear = new Date().getFullYear();
  const fromYear = startYear || 1990;
  const toYear = endYear || currentYear;
  
  let recordsIngested = 0;
  const errors: string[] = [];
  
  console.log(`[WorldBank] Starting fetch for years ${fromYear}-${toYear}`);
  
  const db = await getDb();
  if (!db) {
    return { success: false, recordsIngested: 0, errors: ['Database not available'] };
  }
  
  // Ensure source exists
  let sourceId: number;
  try {
    sourceId = await ensureSource();
  } catch (error) {
    return { success: false, recordsIngested: 0, errors: ['Failed to create source'] };
  }
  
  // Fetch each indicator
  for (const [indicatorKey, indicator] of Object.entries(WORLD_BANK_INDICATORS)) {
    try {
      const data = await fetchIndicator(indicator.code, fromYear, toYear);
      
      for (const point of data) {
        if (point.value !== null) {
          const year = parseInt(point.date);
          const dateForYear = new Date(year, 11, 31); // Dec 31 of the year
          const indicatorCode = `WB_${indicatorKey}`;
          
          try {
            await db.insert(timeSeries).values({
              indicatorCode,
              regimeTag: 'mixed',
              date: dateForYear,
              value: point.value.toString(),
              unit: indicator.unit,
              confidenceRating: 'A',
              sourceId,
              notes: `${indicator.name} - World Bank WDI`,
            }).onDuplicateKeyUpdate({
              set: { 
                value: point.value.toString(),
                updatedAt: new Date(),
              },
            });
            recordsIngested++;
          } catch (insertError) {
            // Ignore duplicate key errors
          }
        }
      }
      
      const validPoints = data.filter(d => d.value !== null).length;
      if (validPoints > 0) {
        console.log(`[WorldBank] Fetched ${validPoints} data points for ${indicatorKey}`);
      }
    } catch (error) {
      const errorMsg = `Failed to fetch ${indicatorKey}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMsg);
      console.error(`[WorldBank] ${errorMsg}`);
    }
    
    // Rate limiting - be nice to the API
    await delay(300);
  }
  
  console.log(`[WorldBank] Completed: ${recordsIngested} records ingested, ${errors.length} errors`);
  
  return {
    success: errors.length === 0,
    recordsIngested,
    errors,
  };
}

/**
 * Fetch a specific indicator from the API
 */
export async function fetchWorldBankIndicator(indicatorKey: keyof typeof WORLD_BANK_INDICATORS, years: number = 10): Promise<{
  success: boolean;
  data: Array<{ year: string; value: number }>;
}> {
  const indicator = WORLD_BANK_INDICATORS[indicatorKey];
  if (!indicator) {
    return { success: false, data: [] };
  }
  
  const currentYear = new Date().getFullYear();
  const data = await fetchIndicator(indicator.code, currentYear - years, currentYear);
  
  return {
    success: true,
    data: data
      .filter(d => d.value !== null)
      .map(d => ({ year: d.date, value: d.value as number }))
      .sort((a, b) => parseInt(a.year) - parseInt(b.year)),
  };
}

/**
 * Get the latest value for an indicator from the database
 */
export async function getLatestWorldBankValue(indicatorKey: keyof typeof WORLD_BANK_INDICATORS): Promise<{
  value: number | null;
  year: string | null;
}> {
  const db = await getDb();
  if (!db) return { value: null, year: null };
  
  const indicatorCode = `WB_${indicatorKey}`;
  
  const result = await db.select()
    .from(timeSeries)
    .where(eq(timeSeries.indicatorCode, indicatorCode))
    .orderBy(desc(timeSeries.date))
    .limit(1);
  
  if (result.length === 0) {
    return { value: null, year: null };
  }
  
  return {
    value: parseFloat(result[0].value),
    year: result[0].date.getFullYear().toString(),
  };
}

// Export for scheduler
export const worldBankConnector = {
  id: 'world_bank',
  name: SOURCE_NAME,
  fetch: fetchWorldBankData,
  fetchIndicator: fetchWorldBankIndicator,
  getLatestValue: getLatestWorldBankValue,
  indicators: WORLD_BANK_INDICATORS,
};
