/**
 * ReliefWeb API Fetcher
 * 
 * Fetches Yemen humanitarian reports and updates from ReliefWeb
 * API Documentation: https://apidoc.reliefweb.int/
 * 
 * Key Endpoints:
 * - /v1/reports: Humanitarian reports and situation updates
 * - /v1/disasters: Disaster events
 * - /v1/countries: Country profiles
 * - /v1/sources: Source organizations
 */

const RELIEFWEB_API_BASE = 'https://api.reliefweb.int/v1';
const YEMEN_COUNTRY_ID = 269; // Yemen's ReliefWeb country ID

export interface ReliefWebReport {
  id: number;
  score: number;
  href: string;
  fields: {
    id: number;
    title: string;
    date: {
      original: string;
      created: string;
    };
    source: Array<{
      id: number;
      name: string;
      shortname?: string;
      type: { id: number; name: string };
    }>;
    country: Array<{
      id: number;
      name: string;
      iso3: string;
    }>;
    primary_country?: {
      id: number;
      name: string;
      iso3: string;
    };
    format?: Array<{
      id: number;
      name: string;
    }>;
    theme?: Array<{
      id: number;
      name: string;
    }>;
    disaster?: Array<{
      id: number;
      name: string;
    }>;
    body?: string;
    body_html?: string;
    url?: string;
    url_alias?: string;
  };
}

export interface ReliefWebResponse {
  time: number;
  href: string;
  links: {
    self: { href: string };
    next?: { href: string };
    prev?: { href: string };
  };
  took: number;
  totalCount: number;
  count: number;
  data: ReliefWebReport[];
}

/**
 * Fetch reports from ReliefWeb API
 */
export async function fetchReliefWebReports(
  limit: number = 100,
  offset: number = 0,
  fromDate?: string,
  toDate?: string
): Promise<ReliefWebResponse> {
  const params = new URLSearchParams({
    appname: 'YETO-Platform',
    'filter[field]': 'country.id',
    'filter[value]': YEMEN_COUNTRY_ID.toString(),
    limit: limit.toString(),
    offset: offset.toString(),
    'fields[include][]': 'id,title,date,source,country,primary_country,format,theme,disaster,body,url',
    sort: 'date:desc',
  });
  
  if (fromDate) {
    params.append('filter[field]', 'date.created');
    params.append('filter[value][from]', fromDate);
  }
  
  if (toDate) {
    params.append('filter[value][to]', toDate);
  }
  
  const url = `${RELIEFWEB_API_BASE}/reports?${params.toString()}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`ReliefWeb API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching ReliefWeb reports:', error);
    throw error;
  }
}

/**
 * Fetch all Yemen reports from a specific year
 */
export async function fetchReliefWebReportsByYear(
  year: number
): Promise<ReliefWebReport[]> {
  const fromDate = `${year}-01-01T00:00:00+00:00`;
  const toDate = `${year}-12-31T23:59:59+00:00`;
  
  const allReports: ReliefWebReport[] = [];
  let offset = 0;
  const limit = 100;
  let hasMore = true;
  
  while (hasMore) {
    try {
      const response = await fetchReliefWebReports(limit, offset, fromDate, toDate);
      allReports.push(...response.data);
      
      offset += limit;
      hasMore = response.count === limit && offset < response.totalCount;
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Error fetching reports at offset ${offset}:`, error);
      hasMore = false;
    }
  }
  
  return allReports;
}

/**
 * Fetch disasters affecting Yemen
 */
export async function fetchReliefWebDisasters(): Promise<any[]> {
  const url = `${RELIEFWEB_API_BASE}/disasters?appname=YETO-Platform&filter[field]=country.id&filter[value]=${YEMEN_COUNTRY_ID}&limit=100&fields[include][]=id,name,date,status,type,country`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`ReliefWeb API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching ReliefWeb disasters:', error);
    throw error;
  }
}

/**
 * Fetch Yemen country profile
 */
export async function fetchReliefWebCountryProfile(): Promise<any> {
  const url = `${RELIEFWEB_API_BASE}/countries/${YEMEN_COUNTRY_ID}?appname=YETO-Platform&fields[include][]=id,name,iso3,description,profile,status,location`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`ReliefWeb API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data?.[0] || null;
  } catch (error) {
    console.error('Error fetching ReliefWeb country profile:', error);
    throw error;
  }
}

/**
 * Run full ReliefWeb backfill from 2010 to present
 */
export async function runReliefWebBackfill(
  onProgress?: (year: number, progress: number, total: number) => void
): Promise<{
  success: boolean;
  yearsProcessed: number;
  reportsRetrieved: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let yearsProcessed = 0;
  let reportsRetrieved = 0;
  
  const currentYear = new Date().getFullYear();
  const startYear = 2010;
  const total = currentYear - startYear + 1;
  
  for (let year = currentYear; year >= startYear; year--) {
    try {
      console.log(`[ReliefWeb Backfill] Processing year ${year}...`);
      
      const reports = await fetchReliefWebReportsByYear(year);
      reportsRetrieved += reports.length;
      yearsProcessed++;
      
      if (onProgress) {
        onProgress(year, yearsProcessed, total);
      }
      
      console.log(`[ReliefWeb Backfill] ${year}: ${reports.length} reports retrieved`);
      
      // Rate limiting between years
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      const errorMsg = `Failed to process year ${year}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(`[ReliefWeb Backfill] ${errorMsg}`);
      errors.push(errorMsg);
    }
  }
  
  return {
    success: errors.length === 0,
    yearsProcessed,
    reportsRetrieved,
    errors,
  };
}

/**
 * Create data fetcher function for backfill orchestrator
 */
export function createReliefWebFetcher(): (date: Date, regimeTag?: string) => Promise<number | null> {
  return async (date: Date, regimeTag?: string) => {
    // ReliefWeb returns reports, not numeric values
    // This returns the count of reports for the given date's year
    const year = date.getFullYear();
    
    try {
      const reports = await fetchReliefWebReportsByYear(year);
      return reports.length;
    } catch (error) {
      console.error(`Error fetching ReliefWeb data for ${year}:`, error);
      return null;
    }
  };
}
