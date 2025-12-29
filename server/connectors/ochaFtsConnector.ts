/**
 * OCHA Financial Tracking Service (FTS) Connector
 * Fetches humanitarian funding flows for Yemen
 * API: https://api.hpc.tools/v2/public/fts/
 * No API key required - public access
 */

import { getDb } from "../db";
import { timeSeries, sources } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

// ============================================
// Types
// ============================================

interface FTSFlow {
  id: number;
  amountUSD: number;
  budgetYear: number;
  date: string;
  description: string;
  flowType: string;
  method: string;
  status: string;
  sourceOrganizations: Array<{ name: string; abbreviation: string }>;
  destinationOrganizations: Array<{ name: string; abbreviation: string }>;
  destinationLocations: Array<{ name: string; iso3: string }>;
  destinationPlans: Array<{ name: string; id: number }>;
  destinationClusters: Array<{ name: string }>;
}

interface FTSPlan {
  id: number;
  name: string;
  year: number;
  requirements: { totalRevisedReqs: number };
  funding: { totalFunding: number; progress: number };
  locations: Array<{ name: string; iso3: string }>;
}

interface FTSResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}

// ============================================
// Constants
// ============================================

const BASE_URL = 'https://api.hpc.tools/v2/public/fts';
const YEMEN_ISO3 = 'YEM';
const SOURCE_NAME = 'OCHA Financial Tracking Service';

// ============================================
// Helper Functions
// ============================================

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Ensure the OCHA FTS source exists in the database
 */
async function ensureSource(): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const existing = await db.select().from(sources).where(eq(sources.publisher, SOURCE_NAME)).limit(1);
  
  if (existing.length > 0) {
    return existing[0].id;
  }
  
  await db.insert(sources).values({
    publisher: SOURCE_NAME,
    url: 'https://fts.unocha.org/',
    license: 'Open Data',
    retrievalDate: new Date(),
    notes: 'Official registry of humanitarian funding flows - who funded what, by when, for which crisis',
  });
  
  const newSource = await db.select().from(sources).where(eq(sources.publisher, SOURCE_NAME)).limit(1);
  return newSource[0].id;
}

// ============================================
// API Functions
// ============================================

/**
 * Fetch funding flows for Yemen
 */
async function fetchFlows(year?: number): Promise<FTSFlow[]> {
  const params = new URLSearchParams({
    countryISO3: YEMEN_ISO3,
    limit: '500',
  });
  
  if (year) {
    params.append('year', year.toString());
  }
  
  const url = `${BASE_URL}/flow?${params.toString()}`;
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const json = await response.json() as FTSResponse<FTSFlow>;
  return json.data || [];
}

/**
 * Fetch humanitarian response plans for Yemen
 */
async function fetchPlans(): Promise<FTSPlan[]> {
  const url = `${BASE_URL}/plan/country/${YEMEN_ISO3}`;
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const json = await response.json() as FTSResponse<FTSPlan>;
  return json.data || [];
}

/**
 * Fetch aggregated funding by year
 */
async function fetchYearlyFunding(year: number): Promise<{
  requirements: number;
  funding: number;
  coverage: number;
}> {
  const url = `${BASE_URL}/plan/country/${YEMEN_ISO3}?year=${year}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      return { requirements: 0, funding: 0, coverage: 0 };
    }
    
    const json = await response.json() as FTSResponse<FTSPlan>;
    const plans = json.data || [];
    
    let totalRequirements = 0;
    let totalFunding = 0;
    
    for (const plan of plans) {
      if (plan.requirements?.totalRevisedReqs) {
        totalRequirements += plan.requirements.totalRevisedReqs;
      }
      if (plan.funding?.totalFunding) {
        totalFunding += plan.funding.totalFunding;
      }
    }
    
    const coverage = totalRequirements > 0 ? (totalFunding / totalRequirements) * 100 : 0;
    
    return { requirements: totalRequirements, funding: totalFunding, coverage };
  } catch {
    return { requirements: 0, funding: 0, coverage: 0 };
  }
}

// ============================================
// Main Fetch Functions
// ============================================

/**
 * Fetch all OCHA FTS data for Yemen
 */
export async function fetchOchaFtsData(startYear?: number, endYear?: number): Promise<{
  success: boolean;
  recordsIngested: number;
  errors: string[];
}> {
  const currentYear = new Date().getFullYear();
  const fromYear = startYear || 2015;
  const toYear = endYear || currentYear;
  
  let recordsIngested = 0;
  const errors: string[] = [];
  
  console.log(`[OCHA-FTS] Starting fetch for years ${fromYear}-${toYear}`);
  
  const db = await getDb();
  if (!db) {
    return { success: false, recordsIngested: 0, errors: ['Database not available'] };
  }
  
  let sourceId: number;
  try {
    sourceId = await ensureSource();
  } catch (error) {
    return { success: false, recordsIngested: 0, errors: ['Failed to create source'] };
  }
  
  // Fetch yearly funding data
  for (let year = fromYear; year <= toYear; year++) {
    try {
      const yearlyData = await fetchYearlyFunding(year);
      const dateForYear = new Date(year, 11, 31);
      
      // Store requirements
      if (yearlyData.requirements > 0) {
        await db.insert(timeSeries).values({
          indicatorCode: 'FTS_REQUIREMENTS',
          regimeTag: 'mixed',
          date: dateForYear,
          value: yearlyData.requirements.toString(),
          unit: 'USD',
          confidenceRating: 'A',
          sourceId,
          notes: `Humanitarian Response Plan requirements for Yemen ${year}`,
        }).onDuplicateKeyUpdate({
          set: { value: yearlyData.requirements.toString(), updatedAt: new Date() },
        });
        recordsIngested++;
      }
      
      // Store funding received
      if (yearlyData.funding > 0) {
        await db.insert(timeSeries).values({
          indicatorCode: 'FTS_FUNDING',
          regimeTag: 'mixed',
          date: dateForYear,
          value: yearlyData.funding.toString(),
          unit: 'USD',
          confidenceRating: 'A',
          sourceId,
          notes: `Humanitarian funding received for Yemen ${year}`,
        }).onDuplicateKeyUpdate({
          set: { value: yearlyData.funding.toString(), updatedAt: new Date() },
        });
        recordsIngested++;
      }
      
      // Store coverage percentage
      if (yearlyData.coverage > 0) {
        await db.insert(timeSeries).values({
          indicatorCode: 'FTS_COVERAGE',
          regimeTag: 'mixed',
          date: dateForYear,
          value: yearlyData.coverage.toFixed(2),
          unit: 'percent',
          confidenceRating: 'A',
          sourceId,
          notes: `Humanitarian funding coverage for Yemen ${year}`,
        }).onDuplicateKeyUpdate({
          set: { value: yearlyData.coverage.toFixed(2), updatedAt: new Date() },
        });
        recordsIngested++;
      }
      
      console.log(`[OCHA-FTS] Year ${year}: Requirements $${(yearlyData.requirements / 1e9).toFixed(2)}B, Funding $${(yearlyData.funding / 1e9).toFixed(2)}B, Coverage ${yearlyData.coverage.toFixed(1)}%`);
      
      await delay(500);
    } catch (error) {
      const errorMsg = `Failed to fetch year ${year}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMsg);
      console.error(`[OCHA-FTS] ${errorMsg}`);
    }
  }
  
  // Fetch detailed flow data for recent years
  try {
    const flows = await fetchFlows();
    
    // Aggregate flows by donor type
    const donorFlows: Record<string, number> = {};
    for (const flow of flows) {
      if (flow.amountUSD > 0 && flow.sourceOrganizations?.length > 0) {
        const donor = flow.sourceOrganizations[0].name;
        donorFlows[donor] = (donorFlows[donor] || 0) + flow.amountUSD;
      }
    }
    
    console.log(`[OCHA-FTS] Processed ${flows.length} funding flows from ${Object.keys(donorFlows).length} donors`);
  } catch (error) {
    errors.push(`Failed to fetch flows: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  console.log(`[OCHA-FTS] Completed: ${recordsIngested} records ingested, ${errors.length} errors`);
  
  return {
    success: errors.length === 0,
    recordsIngested,
    errors,
  };
}

/**
 * Get the latest funding coverage from the database
 */
export async function getLatestFundingCoverage(): Promise<{
  requirements: number | null;
  funding: number | null;
  coverage: number | null;
  year: string | null;
}> {
  const db = await getDb();
  if (!db) return { requirements: null, funding: null, coverage: null, year: null };
  
  const coverageResult = await db.select()
    .from(timeSeries)
    .where(eq(timeSeries.indicatorCode, 'FTS_COVERAGE'))
    .orderBy(desc(timeSeries.date))
    .limit(1);
  
  if (coverageResult.length === 0) {
    return { requirements: null, funding: null, coverage: null, year: null };
  }
  
  const year = coverageResult[0].date.getFullYear().toString();
  
  const reqResult = await db.select()
    .from(timeSeries)
    .where(and(
      eq(timeSeries.indicatorCode, 'FTS_REQUIREMENTS'),
      eq(timeSeries.date, coverageResult[0].date)
    ))
    .limit(1);
  
  const fundResult = await db.select()
    .from(timeSeries)
    .where(and(
      eq(timeSeries.indicatorCode, 'FTS_FUNDING'),
      eq(timeSeries.date, coverageResult[0].date)
    ))
    .limit(1);
  
  return {
    requirements: reqResult.length > 0 ? parseFloat(reqResult[0].value) : null,
    funding: fundResult.length > 0 ? parseFloat(fundResult[0].value) : null,
    coverage: parseFloat(coverageResult[0].value),
    year,
  };
}

// Export for scheduler
export const ochaFtsConnector = {
  id: 'ocha_fts',
  name: SOURCE_NAME,
  fetch: fetchOchaFtsData,
  getLatestCoverage: getLatestFundingCoverage,
};
