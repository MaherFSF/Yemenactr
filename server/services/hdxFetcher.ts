/**
 * HDX HAPI (Humanitarian Data Exchange) Fetcher
 * 
 * Fetches Yemen humanitarian data from HDX HAPI
 * API Documentation: https://hapi.humdata.org/docs
 * 
 * Key Endpoints:
 * - /api/v1/population-social/population: Population data
 * - /api/v1/coordination-context/operational-presence: Humanitarian orgs
 * - /api/v1/food/food-security: Food security (IPC) data
 * - /api/v1/coordination-context/funding: Humanitarian funding
 * - /api/v1/affected-people/refugees: Refugee data
 * - /api/v1/affected-people/idps: IDP data
 */

const HDX_HAPI_BASE = 'https://hapi.humdata.org/api/v1';
const YEMEN_ISO3 = 'YEM';

export interface HDXDataPoint {
  resource_hdx_id: string;
  location_code: string;
  location_name: string;
  admin1_code?: string;
  admin1_name?: string;
  admin2_code?: string;
  admin2_name?: string;
  reference_period_start: string;
  reference_period_end: string;
  source_data: string;
  [key: string]: any;
}

export interface HDXResponse {
  data: HDXDataPoint[];
  meta: {
    total_count: number;
    page: number;
    page_size: number;
  };
}

/**
 * Fetch population data from HDX HAPI
 */
export async function fetchHDXPopulation(
  appIdentifier: string = 'YETO-Platform'
): Promise<HDXDataPoint[]> {
  const url = `${HDX_HAPI_BASE}/population-social/population?location_code=${YEMEN_ISO3}&app_identifier=${appIdentifier}&output_format=json`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HDX HAPI error: ${response.status} ${response.statusText}`);
    }
    
    const data: HDXResponse = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching HDX population data:', error);
    throw error;
  }
}

/**
 * Fetch food security (IPC) data from HDX HAPI
 */
export async function fetchHDXFoodSecurity(
  appIdentifier: string = 'YETO-Platform'
): Promise<HDXDataPoint[]> {
  const url = `${HDX_HAPI_BASE}/food/food-security?location_code=${YEMEN_ISO3}&app_identifier=${appIdentifier}&output_format=json`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HDX HAPI error: ${response.status} ${response.statusText}`);
    }
    
    const data: HDXResponse = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching HDX food security data:', error);
    throw error;
  }
}

/**
 * Fetch IDP (Internally Displaced Persons) data from HDX HAPI
 */
export async function fetchHDXIDPs(
  appIdentifier: string = 'YETO-Platform'
): Promise<HDXDataPoint[]> {
  const url = `${HDX_HAPI_BASE}/affected-people/idps?location_code=${YEMEN_ISO3}&app_identifier=${appIdentifier}&output_format=json`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HDX HAPI error: ${response.status} ${response.statusText}`);
    }
    
    const data: HDXResponse = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching HDX IDP data:', error);
    throw error;
  }
}

/**
 * Fetch refugee data from HDX HAPI
 */
export async function fetchHDXRefugees(
  appIdentifier: string = 'YETO-Platform'
): Promise<HDXDataPoint[]> {
  const url = `${HDX_HAPI_BASE}/affected-people/refugees?location_code=${YEMEN_ISO3}&app_identifier=${appIdentifier}&output_format=json`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HDX HAPI error: ${response.status} ${response.statusText}`);
    }
    
    const data: HDXResponse = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching HDX refugee data:', error);
    throw error;
  }
}

/**
 * Fetch humanitarian funding data from HDX HAPI
 */
export async function fetchHDXFunding(
  appIdentifier: string = 'YETO-Platform'
): Promise<HDXDataPoint[]> {
  const url = `${HDX_HAPI_BASE}/coordination-context/funding?location_code=${YEMEN_ISO3}&app_identifier=${appIdentifier}&output_format=json`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HDX HAPI error: ${response.status} ${response.statusText}`);
    }
    
    const data: HDXResponse = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching HDX funding data:', error);
    throw error;
  }
}

/**
 * Fetch operational presence (humanitarian organizations) from HDX HAPI
 */
export async function fetchHDXOperationalPresence(
  appIdentifier: string = 'YETO-Platform'
): Promise<HDXDataPoint[]> {
  const url = `${HDX_HAPI_BASE}/coordination-context/operational-presence?location_code=${YEMEN_ISO3}&app_identifier=${appIdentifier}&output_format=json`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HDX HAPI error: ${response.status} ${response.statusText}`);
    }
    
    const data: HDXResponse = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching HDX operational presence data:', error);
    throw error;
  }
}

/**
 * Run full HDX HAPI backfill
 */
export async function runHDXBackfill(
  onProgress?: (endpoint: string, progress: number, total: number) => void
): Promise<{
  success: boolean;
  endpointsProcessed: number;
  dataPointsRetrieved: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let endpointsProcessed = 0;
  let dataPointsRetrieved = 0;
  
  const endpoints = [
    { name: 'Population', fetcher: fetchHDXPopulation },
    { name: 'Food Security', fetcher: fetchHDXFoodSecurity },
    { name: 'IDPs', fetcher: fetchHDXIDPs },
    { name: 'Refugees', fetcher: fetchHDXRefugees },
    { name: 'Funding', fetcher: fetchHDXFunding },
    { name: 'Operational Presence', fetcher: fetchHDXOperationalPresence },
  ];
  
  const total = endpoints.length;
  
  for (const endpoint of endpoints) {
    try {
      console.log(`[HDX Backfill] Processing ${endpoint.name}...`);
      
      const data = await endpoint.fetcher();
      dataPointsRetrieved += data.length;
      endpointsProcessed++;
      
      if (onProgress) {
        onProgress(endpoint.name, endpointsProcessed, total);
      }
      
      console.log(`[HDX Backfill] ${endpoint.name}: ${data.length} records retrieved`);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      const errorMsg = `Failed to process ${endpoint.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(`[HDX Backfill] ${errorMsg}`);
      errors.push(errorMsg);
    }
  }
  
  return {
    success: errors.length === 0,
    endpointsProcessed,
    dataPointsRetrieved,
    errors,
  };
}

/**
 * Create data fetcher function for backfill orchestrator
 */
export function createHDXFetcher(
  endpoint: string
): (date: Date, regimeTag?: string) => Promise<number | null> {
  return async (date: Date, regimeTag?: string) => {
    // HDX HAPI doesn't support date-specific queries in the same way
    // This is a placeholder that returns null
    return null;
  };
}
