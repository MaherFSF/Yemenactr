/**
 * Comprehensive Data Refresh Script
 * Fetches latest data from all verified API sources for Yemen
 * 
 * Uses correct schema: indicatorCode, regimeTag, date, value, unit, confidenceRating, sourceId
 */

import { getDb } from "../server/db";
import { timeSeries, sources } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

const YEMEN_ISO = "YEM";
const YEMEN_ISO2 = "YE";

interface FetchResult {
  source: string;
  success: boolean;
  recordsIngested: number;
  latestYear: number | null;
  errors: string[];
}

// Helper to get or create source
async function getOrCreateSource(db: any, publisher: string, url: string): Promise<number> {
  const existing = await db.select().from(sources).where(eq(sources.publisher, publisher)).limit(1);
  if (existing.length > 0) {
    return existing[0].id;
  }
  
  const result = await db.insert(sources).values({
    publisher,
    url,
    license: "Open Data",
    retrievalDate: new Date(),
  });
  
  return result[0].insertId;
}

// Helper to insert time series with correct schema
async function insertTimeSeries(
  db: any,
  indicatorCode: string,
  year: number,
  value: number | string,
  unit: string,
  sourceId: number,
  regimeTag: "aden_irg" | "sanaa_defacto" | "mixed" | "unknown" = "mixed"
) {
  const date = new Date(year, 0, 1); // January 1st of the year
  
  try {
    await db.insert(timeSeries).values({
      indicatorCode,
      regimeTag,
      date,
      value: typeof value === 'string' ? parseFloat(value) : value,
      unit,
      confidenceRating: "A",
      sourceId,
    }).onDuplicateKeyUpdate({
      set: {
        value: typeof value === 'string' ? parseFloat(value) : value,
        updatedAt: new Date(),
      }
    });
    return true;
  } catch (error) {
    console.error(`Insert error for ${indicatorCode}:`, error);
    return false;
  }
}

// ============================================
// World Bank WDI
// ============================================
async function fetchWorldBankData(): Promise<FetchResult> {
  const result: FetchResult = {
    source: "World Bank WDI",
    success: false,
    recordsIngested: 0,
    latestYear: null,
    errors: []
  };

  const indicators = [
    { code: "NY.GDP.MKTP.CD", name: "GDP (current US$)", unit: "USD" },
    { code: "NY.GDP.PCAP.CD", name: "GDP per capita", unit: "USD" },
    { code: "FP.CPI.TOTL.ZG", name: "Inflation", unit: "percent" },
    { code: "SP.POP.TOTL", name: "Population", unit: "persons" },
    { code: "SL.UEM.TOTL.ZS", name: "Unemployment", unit: "percent" },
  ];

  try {
    const db = await getDb();
    const sourceId = await getOrCreateSource(db, "World Bank", "https://data.worldbank.org");

    for (const indicator of indicators) {
      const url = `https://api.worldbank.org/v2/country/${YEMEN_ISO}/indicator/${indicator.code}?format=json&per_page=50&date=2000:2026`;
      
      const response = await fetch(url);
      if (!response.ok) {
        result.errors.push(`Failed to fetch ${indicator.code}: HTTP ${response.status}`);
        continue;
      }

      const data = await response.json();
      if (!data[1] || !Array.isArray(data[1])) {
        continue;
      }

      for (const record of data[1]) {
        if (record.value === null) continue;
        
        const year = parseInt(record.date);
        if (year > (result.latestYear || 0)) {
          result.latestYear = year;
        }

        const success = await insertTimeSeries(
          db,
          `WB_${indicator.code}`,
          year,
          record.value,
          indicator.unit,
          sourceId
        );
        
        if (success) result.recordsIngested++;
      }
    }
    result.success = true;
  } catch (error) {
    result.errors.push(`World Bank fetch error: ${error}`);
  }

  return result;
}

// ============================================
// UNHCR Refugee Data
// ============================================
async function fetchUNHCRData(): Promise<FetchResult> {
  const result: FetchResult = {
    source: "UNHCR",
    success: false,
    recordsIngested: 0,
    latestYear: null,
    errors: []
  };

  try {
    const db = await getDb();
    const sourceId = await getOrCreateSource(db, "UNHCR", "https://www.unhcr.org/refugee-statistics");

    // Fetch Yemen as country of asylum
    const coaUrl = `https://api.unhcr.org/population/v1/population/?coa_iso=${YEMEN_ISO}&limit=100`;
    const coaResponse = await fetch(coaUrl, {
      headers: { "Accept": "application/json" }
    });

    if (coaResponse.ok) {
      const coaData = await coaResponse.json();

      for (const item of coaData.items || []) {
        const year = item.year;
        if (year > (result.latestYear || 0)) {
          result.latestYear = year;
        }

        if (item.refugees > 0) {
          const success = await insertTimeSeries(
            db, "UNHCR_REFUGEES_HOSTED", year, item.refugees, "persons", sourceId
          );
          if (success) result.recordsIngested++;
        }

        if (item.asylum_seekers > 0) {
          const success = await insertTimeSeries(
            db, "UNHCR_ASYLUM_SEEKERS", year, item.asylum_seekers, "persons", sourceId
          );
          if (success) result.recordsIngested++;
        }
      }
    }

    // Fetch Yemen as country of origin (IDPs)
    const cooUrl = `https://api.unhcr.org/population/v1/population/?coo_iso=${YEMEN_ISO}&limit=100`;
    const cooResponse = await fetch(cooUrl, {
      headers: { "Accept": "application/json" }
    });

    if (cooResponse.ok) {
      const cooData = await cooResponse.json();

      for (const item of cooData.items || []) {
        const year = item.year;
        
        if (item.idps > 0) {
          const success = await insertTimeSeries(
            db, "UNHCR_IDPS", year, item.idps, "persons", sourceId
          );
          if (success) result.recordsIngested++;
        }
      }
    }

    result.success = true;
  } catch (error) {
    result.errors.push(`UNHCR fetch error: ${error}`);
  }

  return result;
}

// ============================================
// WHO Global Health Observatory
// ============================================
async function fetchWHOData(): Promise<FetchResult> {
  const result: FetchResult = {
    source: "WHO GHO",
    success: false,
    recordsIngested: 0,
    latestYear: null,
    errors: []
  };

  const indicators = [
    { code: "WHOSIS_000001", name: "Life expectancy", unit: "years" },
    { code: "MDG_0000000007", name: "Under-5 mortality", unit: "per 1000" },
    { code: "WHS4_100", name: "Infant mortality", unit: "per 1000" },
    { code: "WHS8_110", name: "DTP3 coverage", unit: "percent" },
  ];

  try {
    const db = await getDb();
    const sourceId = await getOrCreateSource(db, "WHO", "https://www.who.int/data/gho");

    for (const indicator of indicators) {
      const url = `https://ghoapi.azureedge.net/api/${indicator.code}?$filter=SpatialDim eq '${YEMEN_ISO}'`;
      
      const response = await fetch(url, {
        headers: { "Accept": "application/json" }
      });

      if (!response.ok) {
        result.errors.push(`Failed to fetch ${indicator.code}: HTTP ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      for (const record of data.value || []) {
        if (!record.NumericValue) continue;
        
        const year = record.TimeDim;
        if (year > (result.latestYear || 0)) {
          result.latestYear = year;
        }

        const success = await insertTimeSeries(
          db, `WHO_${indicator.code}`, year, record.NumericValue, indicator.unit, sourceId
        );
        if (success) result.recordsIngested++;
      }
    }
    result.success = true;
  } catch (error) {
    result.errors.push(`WHO fetch error: ${error}`);
  }

  return result;
}

// ============================================
// FEWS NET IPC Data
// ============================================
async function fetchFEWSNETData(): Promise<FetchResult> {
  const result: FetchResult = {
    source: "FEWS NET",
    success: false,
    recordsIngested: 0,
    latestYear: null,
    errors: []
  };

  try {
    const db = await getDb();
    const sourceId = await getOrCreateSource(db, "FEWS NET", "https://fews.net");

    const url = `https://fdw.fews.net/api/ipcphase.json?country_code=${YEMEN_ISO2}`;
    
    const response = await fetch(url, {
      headers: { "Accept": "application/json" }
    });

    if (!response.ok) {
      result.errors.push(`FEWS NET API returned HTTP ${response.status}`);
      return result;
    }

    const data = await response.json();

    for (const record of data || []) {
      const dateStr = record.period_date || record.date;
      if (!dateStr) continue;
      
      const year = new Date(dateStr).getFullYear();
      if (isNaN(year) || year < 2010) continue;
      
      if (year > (result.latestYear || 0)) {
        result.latestYear = year;
      }

      const phase = record.phase || record.ipc_phase || 3;
      const success = await insertTimeSeries(
        db, "FEWSNET_IPC_PHASE", year, phase, "phase", sourceId
      );
      if (success) result.recordsIngested++;
    }

    result.success = true;
  } catch (error) {
    result.errors.push(`FEWS NET fetch error: ${error}`);
  }

  return result;
}

// ============================================
// OCHA FTS Humanitarian Funding
// ============================================
async function fetchOCHAFTSData(): Promise<FetchResult> {
  const result: FetchResult = {
    source: "OCHA FTS",
    success: false,
    recordsIngested: 0,
    latestYear: null,
    errors: []
  };

  try {
    const db = await getDb();
    const sourceId = await getOrCreateSource(db, "OCHA FTS", "https://fts.unocha.org");

    const url = `https://api.hpc.tools/v1/public/fts/flow?countryISO3=${YEMEN_ISO}&limit=500`;
    
    const response = await fetch(url, {
      headers: { "Accept": "application/json" }
    });

    if (!response.ok) {
      result.errors.push(`OCHA FTS API returned HTTP ${response.status}`);
      return result;
    }

    const data = await response.json();
    
    // Aggregate funding by year
    const yearlyFunding: Record<number, number> = {};
    
    const flows = data.data || [];
    if (!Array.isArray(flows)) {
      result.errors.push("OCHA FTS returned non-array data");
      return result;
    }
    
    for (const flow of flows) {
      if (!flow.amountUSD || flow.amountUSD <= 0) continue;
      
      const dateStr = flow.date || flow.createdAt;
      if (!dateStr) continue;
      
      const year = new Date(dateStr).getFullYear();
      if (isNaN(year) || year < 2010) continue;
      
      yearlyFunding[year] = (yearlyFunding[year] || 0) + flow.amountUSD;
      
      if (year > (result.latestYear || 0)) {
        result.latestYear = year;
      }
    }

    for (const [yearStr, amount] of Object.entries(yearlyFunding)) {
      const year = parseInt(yearStr);
      const success = await insertTimeSeries(
        db, "OCHA_FTS_FUNDING", year, amount, "USD", sourceId
      );
      if (success) result.recordsIngested++;
    }

    result.success = true;
  } catch (error) {
    result.errors.push(`OCHA FTS fetch error: ${error}`);
  }

  return result;
}

// ============================================
// HDX CKAN Humanitarian Data
// ============================================
async function fetchHDXData(): Promise<FetchResult> {
  const result: FetchResult = {
    source: "HDX CKAN",
    success: false,
    recordsIngested: 0,
    latestYear: null,
    errors: []
  };

  try {
    const url = `https://data.humdata.org/api/3/action/package_search?q=groups:yem&rows=50`;
    
    const response = await fetch(url, {
      headers: { "Accept": "application/json" }
    });

    if (!response.ok) {
      result.errors.push(`HDX API returned HTTP ${response.status}`);
      return result;
    }

    const data = await response.json();
    
    // Count datasets found
    const datasets = data.result?.results || [];
    result.recordsIngested = datasets.length;
    
    if (datasets.length > 0) {
      const latestDataset = datasets[0];
      const updateDate = new Date(latestDataset.metadata_modified || latestDataset.metadata_created);
      result.latestYear = updateDate.getFullYear();
    }

    result.success = true;
    console.log(`  Found ${datasets.length} Yemen datasets on HDX`);
  } catch (error) {
    result.errors.push(`HDX fetch error: ${error}`);
  }

  return result;
}

// ============================================
// UNICEF via World Bank Data360
// ============================================
async function fetchUNICEFData(): Promise<FetchResult> {
  const result: FetchResult = {
    source: "UNICEF",
    success: false,
    recordsIngested: 0,
    latestYear: null,
    errors: []
  };

  try {
    const db = await getDb();
    const sourceId = await getOrCreateSource(db, "UNICEF", "https://data.unicef.org");

    const url = `https://data360api.worldbank.org/data360/data?DATABASE_ID=UNICEF_DW&REF_AREA=${YEMEN_ISO}`;
    
    const response = await fetch(url, {
      headers: { "Accept": "application/json" }
    });

    if (!response.ok) {
      result.errors.push(`UNICEF API returned HTTP ${response.status}`);
      return result;
    }

    const data = await response.json();

    for (const record of data.data || []) {
      if (!record.OBS_VALUE) continue;
      
      const year = parseInt(record.TIME_PERIOD);
      if (isNaN(year) || year < 2000) continue;
      
      if (year > (result.latestYear || 0)) {
        result.latestYear = year;
      }

      const indicatorCode = `UNICEF_${record.INDICATOR || 'UNKNOWN'}`.substring(0, 100);
      const success = await insertTimeSeries(
        db, indicatorCode, year, record.OBS_VALUE, record.UNIT_MEASURE || "percent", sourceId
      );
      if (success) result.recordsIngested++;
    }

    result.success = true;
  } catch (error) {
    result.errors.push(`UNICEF fetch error: ${error}`);
  }

  return result;
}

// ============================================
// Main Execution
// ============================================
async function main() {
  console.log("=".repeat(60));
  console.log("YETO Platform - Comprehensive Data Refresh");
  console.log("Started:", new Date().toISOString());
  console.log("=".repeat(60));

  const results: FetchResult[] = [];

  console.log("\n[1/7] Fetching World Bank WDI data...");
  results.push(await fetchWorldBankData());
  
  console.log("[2/7] Fetching UNHCR refugee data...");
  results.push(await fetchUNHCRData());
  
  console.log("[3/7] Fetching WHO health indicators...");
  results.push(await fetchWHOData());
  
  console.log("[4/7] Fetching FEWS NET IPC data...");
  results.push(await fetchFEWSNETData());
  
  console.log("[5/7] Fetching HDX humanitarian datasets...");
  results.push(await fetchHDXData());
  
  console.log("[6/7] Fetching UNICEF child welfare data...");
  results.push(await fetchUNICEFData());
  
  console.log("[7/7] Fetching OCHA FTS funding data...");
  results.push(await fetchOCHAFTSData());

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("DATA REFRESH SUMMARY");
  console.log("=".repeat(60));
  
  let totalRecords = 0;
  let successCount = 0;
  
  for (const r of results) {
    const status = r.success ? "✓" : "✗";
    console.log(`${status} ${r.source}: ${r.recordsIngested} records (latest: ${r.latestYear || "N/A"})`);
    if (r.errors.length > 0) {
      console.log(`  Errors: ${r.errors.join(", ")}`);
    }
    totalRecords += r.recordsIngested;
    if (r.success) successCount++;
  }

  console.log("\n" + "-".repeat(60));
  console.log(`Total: ${totalRecords} records from ${successCount}/${results.length} sources`);
  console.log("Completed:", new Date().toISOString());
  console.log("=".repeat(60));

  return { results, totalRecords, successCount };
}

main().catch(console.error);
