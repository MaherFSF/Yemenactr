/**
 * FAO/FAOSTAT Data Connector
 * 
 * Connects to FAO's data services for:
 * - Food production statistics
 * - Agricultural trade data
 * - Food security indicators
 * - Land use statistics
 * 
 * Documentation: https://www.fao.org/faostat/en/#data
 */

const FAO_BASE_URL = "https://fenixservices.fao.org/faostat/api/v1";
const FAOSTAT_BULK_URL = "https://bulks-faostat.fao.org/production";

// Yemen country code in FAO system
const YEMEN_CODE = "249"; // FAO numeric code for Yemen

interface FAODataPoint {
  year: number;
  value: number | null;
  element: string;
  item: string;
  unit: string;
  flag: string;
}

interface FAOIndicatorMapping {
  domain: string;
  elementCode: string;
  itemCode: string;
  yetoCode: string;
  nameEn: string;
  nameAr: string;
  unit: string;
}

// Mapping of FAO indicators to YETO indicators
const FAO_INDICATOR_MAPPINGS: FAOIndicatorMapping[] = [
  // Food Production
  {
    domain: "QCL",
    elementCode: "5510",
    itemCode: "2905",
    yetoCode: "cereal-production",
    nameEn: "Cereal Production",
    nameAr: "إنتاج الحبوب",
    unit: "Tonnes",
  },
  {
    domain: "QCL",
    elementCode: "5510",
    itemCode: "2617",
    yetoCode: "fruit-production",
    nameEn: "Fruit Production",
    nameAr: "إنتاج الفواكه",
    unit: "Tonnes",
  },
  {
    domain: "QCL",
    elementCode: "5510",
    itemCode: "2918",
    yetoCode: "vegetable-production",
    nameEn: "Vegetable Production",
    nameAr: "إنتاج الخضروات",
    unit: "Tonnes",
  },
  // Food Security
  {
    domain: "FS",
    elementCode: "21010",
    itemCode: "21010",
    yetoCode: "prevalence-undernourishment",
    nameEn: "Prevalence of Undernourishment",
    nameAr: "انتشار نقص التغذية",
    unit: "%",
  },
  {
    domain: "FS",
    elementCode: "21011",
    itemCode: "21011",
    yetoCode: "number-undernourished",
    nameEn: "Number of Undernourished People",
    nameAr: "عدد الأشخاص الذين يعانون من نقص التغذية",
    unit: "Million",
  },
  {
    domain: "FS",
    elementCode: "21035",
    itemCode: "21035",
    yetoCode: "food-insecurity-moderate",
    nameEn: "Prevalence of Moderate Food Insecurity",
    nameAr: "انتشار انعدام الأمن الغذائي المعتدل",
    unit: "%",
  },
  {
    domain: "FS",
    elementCode: "21036",
    itemCode: "21036",
    yetoCode: "food-insecurity-severe",
    nameEn: "Prevalence of Severe Food Insecurity",
    nameAr: "انتشار انعدام الأمن الغذائي الشديد",
    unit: "%",
  },
  // Agricultural Trade
  {
    domain: "TCL",
    elementCode: "5610",
    itemCode: "2905",
    yetoCode: "cereal-imports",
    nameEn: "Cereal Imports",
    nameAr: "واردات الحبوب",
    unit: "Tonnes",
  },
  {
    domain: "TCL",
    elementCode: "5622",
    itemCode: "2905",
    yetoCode: "cereal-import-value",
    nameEn: "Cereal Import Value",
    nameAr: "قيمة واردات الحبوب",
    unit: "1000 USD",
  },
  // Land Use
  {
    domain: "RL",
    elementCode: "5110",
    itemCode: "6610",
    yetoCode: "agricultural-land",
    nameEn: "Agricultural Land Area",
    nameAr: "مساحة الأراضي الزراعية",
    unit: "1000 ha",
  },
  {
    domain: "RL",
    elementCode: "5110",
    itemCode: "6621",
    yetoCode: "arable-land",
    nameEn: "Arable Land Area",
    nameAr: "مساحة الأراضي الصالحة للزراعة",
    unit: "1000 ha",
  },
  // Livestock
  {
    domain: "QCL",
    elementCode: "5111",
    itemCode: "1107",
    yetoCode: "cattle-stock",
    nameEn: "Cattle Stock",
    nameAr: "أعداد الماشية",
    unit: "Head",
  },
  {
    domain: "QCL",
    elementCode: "5111",
    itemCode: "1016",
    yetoCode: "sheep-stock",
    nameEn: "Sheep Stock",
    nameAr: "أعداد الأغنام",
    unit: "Head",
  },
  {
    domain: "QCL",
    elementCode: "5111",
    itemCode: "1017",
    yetoCode: "goat-stock",
    nameEn: "Goat Stock",
    nameAr: "أعداد الماعز",
    unit: "Head",
  },
  // Fisheries
  {
    domain: "CL",
    elementCode: "5510",
    itemCode: "2960",
    yetoCode: "fish-production",
    nameEn: "Fish Production",
    nameAr: "إنتاج الأسماك",
    unit: "Tonnes",
  },
];

/**
 * Fetch data from FAOSTAT API
 */
async function fetchFAOData(
  domain: string,
  areaCode: string,
  elementCode: string,
  itemCode: string,
  startYear: number,
  endYear: number
): Promise<FAODataPoint[]> {
  const datapoints: FAODataPoint[] = [];
  
  try {
    // Build the FAOSTAT query URL
    const url = `${FAO_BASE_URL}/en/data/${domain}`;
    
    const params = new URLSearchParams({
      area: areaCode,
      element: elementCode,
      item: itemCode,
      year: Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i).join(","),
      output_type: "objects",
    });
    
    const fullUrl = `${url}?${params}`;
    
    console.log(`[FAO Connector] Fetching: ${fullUrl}`);
    
    const response = await fetch(fullUrl, {
      headers: {
        "Accept": "application/json",
      },
    });
    
    if (!response.ok) {
      console.error(`[FAO Connector] HTTP error: ${response.status}`);
      return datapoints;
    }
    
    const data = await response.json();
    
    // Parse FAO response
    const records = data?.data || [];
    
    for (const record of records) {
      if (record.Value !== null && record.Value !== undefined) {
        datapoints.push({
          year: parseInt(record.Year),
          value: parseFloat(record.Value),
          element: record.Element,
          item: record.Item,
          unit: record.Unit,
          flag: record.Flag || "",
        });
      }
    }
    
    console.log(`[FAO Connector] Retrieved ${datapoints.length} data points`);
    
  } catch (error) {
    console.error(`[FAO Connector] Error fetching data:`, error);
  }
  
  return datapoints;
}

/**
 * Ingest FAO data for Yemen
 */
export async function ingestFAOData(
  startYear: number = 2010,
  endYear: number = new Date().getFullYear()
): Promise<{
  success: boolean;
  recordsProcessed: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let recordsProcessed = 0;
  
  console.log(`[FAO Connector] Starting ingestion for Yemen (${startYear}-${endYear})`);
  
  for (const mapping of FAO_INDICATOR_MAPPINGS) {
    try {
      const datapoints = await fetchFAOData(
        mapping.domain,
        YEMEN_CODE,
        mapping.elementCode,
        mapping.itemCode,
        startYear,
        endYear
      );
      
      for (const dp of datapoints) {
        if (dp.value === null) continue;
        
        // Store in memory or log - actual DB storage would go here
        console.log(`[FAO Connector] ${mapping.yetoCode} (${dp.year}): ${dp.value} ${dp.unit}`);
        recordsProcessed++;
      }
      
    } catch (error) {
      const errorMsg = `Error processing ${mapping.yetoCode}: ${error}`;
      console.error(`[FAO Connector] ${errorMsg}`);
      errors.push(errorMsg);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log(`[FAO Connector] Completed. Processed ${recordsProcessed} records with ${errors.length} errors`);
  
  return {
    success: errors.length === 0,
    recordsProcessed,
    errors,
  };
}

/**
 * Get specific FAO indicator data
 */
export async function getFAOIndicator(
  indicatorCode: string,
  startYear?: number,
  endYear?: number
): Promise<FAODataPoint[]> {
  const mapping = FAO_INDICATOR_MAPPINGS.find(m => m.yetoCode === indicatorCode);
  if (!mapping) {
    console.error(`[FAO Connector] Unknown indicator: ${indicatorCode}`);
    return [];
  }
  
  return fetchFAOData(
    mapping.domain,
    YEMEN_CODE,
    mapping.elementCode,
    mapping.itemCode,
    startYear || 2010,
    endYear || new Date().getFullYear()
  );
}

/**
 * Get connector status
 */
export function getFAOConnectorStatus() {
  return {
    name: "FAO/FAOSTAT",
    nameAr: "منظمة الأغذية والزراعة",
    baseUrl: FAO_BASE_URL,
    indicatorCount: FAO_INDICATOR_MAPPINGS.length,
    countryCode: YEMEN_CODE,
    domains: Array.from(new Set(FAO_INDICATOR_MAPPINGS.map(m => m.domain))),
    lastUpdated: null as Date | null,
  };
}

export default {
  ingestFAOData,
  getFAOIndicator,
  getFAOConnectorStatus,
};
