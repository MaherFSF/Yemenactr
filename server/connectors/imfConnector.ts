/**
 * IMF Data Services Connector
 * 
 * Connects to IMF's SDMX REST API for:
 * - International Financial Statistics (IFS)
 * - World Economic Outlook (WEO)
 * - Balance of Payments Statistics (BOP)
 * - Government Finance Statistics (GFS)
 * 
 * Documentation: https://dataservices.imf.org/
 */

import { getDb } from "../db";
import { indicators, provenanceLog } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const IMF_BASE_URL = "http://dataservices.imf.org/REST/SDMX_JSON.svc";

// IMF Dataset IDs
const IMF_DATASETS = {
  IFS: "IFS", // International Financial Statistics
  BOP: "BOP", // Balance of Payments
  DOT: "DOT", // Direction of Trade Statistics
  GFS: "GFS", // Government Finance Statistics
  PCPS: "PCPS", // Primary Commodity Price System
  AFRREO: "AFRREO", // Regional Economic Outlook for Sub-Saharan Africa
  MCDREO: "MCDREO", // Regional Economic Outlook for Middle East and Central Asia
};

// Yemen country code in IMF system
const YEMEN_CODE = "474"; // IMF numeric code for Yemen

interface IMFDataPoint {
  date: string;
  value: number | null;
  indicator: string;
  frequency: string;
}

interface IMFIndicatorMapping {
  imfCode: string;
  yetoCode: string;
  nameEn: string;
  nameAr: string;
  unit: string;
  dataset: string;
  frequency: "A" | "Q" | "M"; // Annual, Quarterly, Monthly
}

// Mapping of IMF indicators to YETO indicators
const IMF_INDICATOR_MAPPINGS: IMFIndicatorMapping[] = [
  // Exchange Rates
  {
    imfCode: "ENDA_XDC_USD_RATE",
    yetoCode: "fx-rate-official",
    nameEn: "Official Exchange Rate (YER per USD)",
    nameAr: "سعر الصرف الرسمي (ريال يمني/دولار)",
    unit: "YER/USD",
    dataset: "IFS",
    frequency: "M",
  },
  {
    imfCode: "EREER_IX",
    yetoCode: "reer-index",
    nameEn: "Real Effective Exchange Rate Index",
    nameAr: "مؤشر سعر الصرف الفعلي الحقيقي",
    unit: "Index (2010=100)",
    dataset: "IFS",
    frequency: "M",
  },
  // Consumer Prices
  {
    imfCode: "PCPI_IX",
    yetoCode: "cpi-index",
    nameEn: "Consumer Price Index",
    nameAr: "مؤشر أسعار المستهلكين",
    unit: "Index (2010=100)",
    dataset: "IFS",
    frequency: "M",
  },
  {
    imfCode: "PCPI_PC_CP_A_PT",
    yetoCode: "inflation-annual",
    nameEn: "Inflation Rate (Annual %)",
    nameAr: "معدل التضخم السنوي (%)",
    unit: "%",
    dataset: "IFS",
    frequency: "A",
  },
  // Monetary Aggregates
  {
    imfCode: "FM_AMB_XDC",
    yetoCode: "monetary-base",
    nameEn: "Monetary Base",
    nameAr: "القاعدة النقدية",
    unit: "Million YER",
    dataset: "IFS",
    frequency: "M",
  },
  {
    imfCode: "FM_LBL_XDC",
    yetoCode: "broad-money-m2",
    nameEn: "Broad Money (M2)",
    nameAr: "النقود بالمعنى الواسع (M2)",
    unit: "Million YER",
    dataset: "IFS",
    frequency: "M",
  },
  // International Reserves
  {
    imfCode: "RAFA_USD",
    yetoCode: "fx-reserves",
    nameEn: "Foreign Exchange Reserves",
    nameAr: "احتياطيات النقد الأجنبي",
    unit: "Million USD",
    dataset: "IFS",
    frequency: "M",
  },
  // Trade
  {
    imfCode: "TXG_FOB_USD",
    yetoCode: "exports-fob",
    nameEn: "Exports (FOB)",
    nameAr: "الصادرات (فوب)",
    unit: "Million USD",
    dataset: "DOT",
    frequency: "A",
  },
  {
    imfCode: "TMG_CIF_USD",
    yetoCode: "imports-cif",
    nameEn: "Imports (CIF)",
    nameAr: "الواردات (سيف)",
    unit: "Million USD",
    dataset: "DOT",
    frequency: "A",
  },
  // GDP
  {
    imfCode: "NGDP_R_XDC",
    yetoCode: "gdp-real",
    nameEn: "Real GDP",
    nameAr: "الناتج المحلي الإجمالي الحقيقي",
    unit: "Million YER (2015 prices)",
    dataset: "IFS",
    frequency: "A",
  },
  {
    imfCode: "NGDP_XDC",
    yetoCode: "gdp-nominal",
    nameEn: "Nominal GDP",
    nameAr: "الناتج المحلي الإجمالي الاسمي",
    unit: "Million YER",
    dataset: "IFS",
    frequency: "A",
  },
  // Government Finance
  {
    imfCode: "GGR_G01_XDC",
    yetoCode: "gov-revenue",
    nameEn: "General Government Revenue",
    nameAr: "إيرادات الحكومة العامة",
    unit: "Million YER",
    dataset: "GFS",
    frequency: "A",
  },
  {
    imfCode: "GGX_G01_XDC",
    yetoCode: "gov-expenditure",
    nameEn: "General Government Expenditure",
    nameAr: "نفقات الحكومة العامة",
    unit: "Million YER",
    dataset: "GFS",
    frequency: "A",
  },
];

/**
 * Fetch data from IMF SDMX API
 */
async function fetchIMFData(
  dataset: string,
  indicator: string,
  countryCode: string,
  frequency: string,
  startPeriod?: string,
  endPeriod?: string
): Promise<IMFDataPoint[]> {
  const datapoints: IMFDataPoint[] = [];
  
  try {
    // Build the SDMX query URL
    // Format: /CompactData/{database}/{frequency}.{ref_area}.{indicator}
    const url = `${IMF_BASE_URL}/CompactData/${dataset}/${frequency}.${countryCode}.${indicator}`;
    
    const params = new URLSearchParams();
    if (startPeriod) params.append("startPeriod", startPeriod);
    if (endPeriod) params.append("endPeriod", endPeriod);
    
    const fullUrl = params.toString() ? `${url}?${params}` : url;
    
    console.log(`[IMF Connector] Fetching: ${fullUrl}`);
    
    const response = await fetch(fullUrl, {
      headers: {
        "Accept": "application/json",
      },
    });
    
    if (!response.ok) {
      console.error(`[IMF Connector] HTTP error: ${response.status}`);
      return datapoints;
    }
    
    const data = await response.json();
    
    // Parse SDMX JSON response
    const series = data?.CompactData?.DataSet?.Series;
    if (!series) {
      console.log(`[IMF Connector] No data found for ${indicator}`);
      return datapoints;
    }
    
    // Handle both single series and array of series
    const seriesArray = Array.isArray(series) ? series : [series];
    
    for (const s of seriesArray) {
      const observations = s.Obs;
      if (!observations) continue;
      
      const obsArray = Array.isArray(observations) ? observations : [observations];
      
      for (const obs of obsArray) {
        const period = obs["@TIME_PERIOD"];
        const value = obs["@OBS_VALUE"];
        
        if (period && value !== undefined) {
          datapoints.push({
            date: period,
            value: parseFloat(value),
            indicator: indicator,
            frequency: frequency,
          });
        }
      }
    }
    
    console.log(`[IMF Connector] Retrieved ${datapoints.length} data points for ${indicator}`);
    
  } catch (error) {
    console.error(`[IMF Connector] Error fetching ${indicator}:`, error);
  }
  
  return datapoints;
}

/**
 * Get available datasets from IMF
 */
export async function getIMFDatasets(): Promise<string[]> {
  try {
    const response = await fetch(`${IMF_BASE_URL}/Dataflow`, {
      headers: { "Accept": "application/json" },
    });
    
    if (!response.ok) return Object.keys(IMF_DATASETS);
    
    const data = await response.json();
    const dataflows = data?.Structure?.Dataflows?.Dataflow || [];
    
    return dataflows.map((df: any) => df["@id"]).filter(Boolean);
  } catch (error) {
    console.error("[IMF Connector] Error fetching datasets:", error);
    return Object.keys(IMF_DATASETS);
  }
}

/**
 * Ingest IMF data for Yemen
 */
export async function ingestIMFData(
  startYear: number = 2010,
  endYear: number = new Date().getFullYear()
): Promise<{
  success: boolean;
  recordsProcessed: number;
  errors: string[];
}> {
  const db = await getDb();
  if (!db) {
    return {
      success: false,
      recordsProcessed: 0,
      errors: ["Database connection not available"],
    };
  }
  
  const errors: string[] = [];
  let recordsProcessed = 0;
  
  console.log(`[IMF Connector] Starting ingestion for Yemen (${startYear}-${endYear})`);
  
  for (const mapping of IMF_INDICATOR_MAPPINGS) {
    try {
      const datapoints = await fetchIMFData(
        mapping.dataset,
        mapping.imfCode,
        YEMEN_CODE,
        mapping.frequency,
        startYear.toString(),
        endYear.toString()
      );
      
      for (const dp of datapoints) {
        if (dp.value === null) continue;
        
        // Check if indicator exists
        const existingResults = await db.select()
          .from(indicators)
          .where(eq(indicators.code, `${mapping.yetoCode}-${dp.date}`))
          .limit(1);
        const existing = existingResults[0];
        
        if (existing) {
          // Update existing - just update timestamp since indicators don't store values directly
          await db.update(indicators)
            .set({
              updatedAt: new Date(),
            })
            .where(eq(indicators.id, existing.id));
        } else {
          // Insert new indicator
          await db.insert(indicators).values({
            code: `${mapping.yetoCode}-${dp.date}`,
            nameEn: `${mapping.nameEn} (${dp.date})`,
            nameAr: `${mapping.nameAr} (${dp.date})`,
            descriptionEn: `${mapping.nameEn} for Yemen in ${dp.date}`,
            descriptionAr: `${mapping.nameAr} لليمن في ${dp.date}`,
            unit: mapping.unit,
            sector: "macroeconomy",
            methodology: "IMF SDMX API",
            frequency: mapping.frequency === "A" ? "annual" : mapping.frequency === "Q" ? "quarterly" : "monthly",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        
        recordsProcessed++;
      }
      
      // Log provenance
      await db.insert(provenanceLog).values({
        dataPointId: 0, // System-level ingestion
        dataPointType: "indicator_batch",
        transformationType: "imf_ingest",
        formula: JSON.stringify({
          dataset: mapping.dataset,
          indicator: mapping.imfCode,
          period: `${startYear}-${endYear}`,
          recordsIngested: datapoints.length,
          source: "IMF Data Services",
          sourceUrl: `${IMF_BASE_URL}/CompactData/${mapping.dataset}`,
        }),
        performedAt: new Date(),
      });
      
    } catch (error) {
      const errorMsg = `Error processing ${mapping.imfCode}: ${error}`;
      console.error(`[IMF Connector] ${errorMsg}`);
      errors.push(errorMsg);
    }
    
    // Rate limiting - IMF has rate limits
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`[IMF Connector] Completed. Processed ${recordsProcessed} records with ${errors.length} errors`);
  
  return {
    success: errors.length === 0,
    recordsProcessed,
    errors,
  };
}

/**
 * Get specific IMF indicator data
 */
export async function getIMFIndicator(
  indicatorCode: string,
  startYear?: number,
  endYear?: number
): Promise<IMFDataPoint[]> {
  const mapping = IMF_INDICATOR_MAPPINGS.find(m => m.yetoCode === indicatorCode);
  if (!mapping) {
    console.error(`[IMF Connector] Unknown indicator: ${indicatorCode}`);
    return [];
  }
  
  return fetchIMFData(
    mapping.dataset,
    mapping.imfCode,
    YEMEN_CODE,
    mapping.frequency,
    startYear?.toString(),
    endYear?.toString()
  );
}

/**
 * Get connector status
 */
export function getIMFConnectorStatus() {
  return {
    name: "IMF Data Services",
    nameAr: "خدمات بيانات صندوق النقد الدولي",
    baseUrl: IMF_BASE_URL,
    datasets: Object.keys(IMF_DATASETS),
    indicatorCount: IMF_INDICATOR_MAPPINGS.length,
    countryCode: YEMEN_CODE,
    supportedFrequencies: ["Annual", "Quarterly", "Monthly"],
    lastUpdated: null as Date | null,
  };
}

export default {
  ingestIMFData,
  getIMFIndicator,
  getIMFDatasets,
  getIMFConnectorStatus,
};
