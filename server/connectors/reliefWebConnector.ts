/**
 * ReliefWeb API Connector
 * Fetches humanitarian reports, updates, and jobs for Yemen
 * API: https://api.reliefweb.int/v1/
 * No API key required - public access
 */

import { getDb } from "../db";
import { sources, economicEvents } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

// ============================================
// Types
// ============================================

interface ReliefWebReport {
  id: number;
  score: number;
  href: string;
  fields: {
    id: number;
    title: string;
    date: { created: string; changed: string; original: string };
    body?: string;
    body_html?: string;
    url?: string;
    url_alias?: string;
    source?: Array<{ name: string; shortname: string; href: string }>;
    country?: Array<{ name: string; iso3: string }>;
    primary_country?: { name: string; iso3: string };
    theme?: Array<{ name: string }>;
    format?: { name: string };
    disaster?: Array<{ name: string; glide: string }>;
    disaster_type?: Array<{ name: string }>;
    ocha_product?: { name: string };
  };
}

interface ReliefWebResponse {
  time: number;
  href: string;
  links: { self: { href: string }; next?: { href: string } };
  count: number;
  totalCount: number;
  data: ReliefWebReport[];
}

// ============================================
// Constants
// ============================================

const BASE_URL = 'https://api.reliefweb.int/v1';
const YEMEN_ISO3 = 'yem';
const SOURCE_NAME = 'ReliefWeb';

// Report types to fetch
const REPORT_TYPES = [
  'situation-report',
  'assessment',
  'analysis',
  'news',
  'appeal',
];

// ============================================
// Helper Functions
// ============================================

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Ensure the ReliefWeb source exists in the database
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
    url: 'https://reliefweb.int/',
    license: 'Open Data',
    retrievalDate: new Date(),
    notes: 'Leading humanitarian information source providing reports, maps, and updates on crises worldwide',
  });
  
  const newSource = await db.select().from(sources).where(eq(sources.publisher, SOURCE_NAME)).limit(1);
  return newSource[0].id;
}

// ============================================
// API Functions
// ============================================

/**
 * Fetch reports from ReliefWeb API
 */
async function fetchReports(params: {
  limit?: number;
  offset?: number;
  format?: string;
  preset?: string;
  filter?: Record<string, unknown>;
}): Promise<ReliefWebReport[]> {
  const queryParams: Record<string, string> = {
    'appname': 'yeto-platform',
    'limit': (params.limit || 20).toString(),
    'offset': (params.offset || 0).toString(),
    'preset': params.preset || 'latest',
    'profile': 'full',
  };
  
  // Build filter for Yemen
  const filter = {
    operator: 'AND',
    conditions: [
      { field: 'primary_country.iso3', value: YEMEN_ISO3 },
      ...(params.format ? [{ field: 'format.name', value: params.format }] : []),
    ],
  };
  
  const url = new URL(`${BASE_URL}/reports`);
  url.searchParams.set('appname', queryParams.appname);
  url.searchParams.set('limit', queryParams.limit);
  url.searchParams.set('offset', queryParams.offset);
  url.searchParams.set('preset', queryParams.preset);
  url.searchParams.set('profile', queryParams.profile);
  url.searchParams.set('filter[operator]', 'AND');
  url.searchParams.set('filter[conditions][0][field]', 'primary_country.iso3');
  url.searchParams.set('filter[conditions][0][value]', YEMEN_ISO3);
  
  if (params.format) {
    url.searchParams.set('filter[conditions][1][field]', 'format.name');
    url.searchParams.set('filter[conditions][1][value]', params.format);
  }
  
  try {
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'YETO-Platform/1.0 (yeto@causewaygrp.com)',
        'Cache-Control': 'no-cache',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const json = await response.json() as ReliefWebResponse;
    return json.data || [];
  } catch (error) {
    console.error(`[ReliefWeb] Error fetching reports:`, error);
    return [];
  }
}

/**
 * Fetch latest situation reports
 */
export async function fetchLatestSitReps(limit: number = 10): Promise<ReliefWebReport[]> {
  return fetchReports({
    limit,
    format: 'Situation Report',
    preset: 'latest',
  });
}

/**
 * Fetch latest assessments
 */
export async function fetchLatestAssessments(limit: number = 10): Promise<ReliefWebReport[]> {
  return fetchReports({
    limit,
    format: 'Assessment',
    preset: 'latest',
  });
}

/**
 * Fetch latest news
 */
export async function fetchLatestNews(limit: number = 20): Promise<ReliefWebReport[]> {
  return fetchReports({
    limit,
    format: 'News and Press Release',
    preset: 'latest',
  });
}

/**
 * Get report count by type
 */
async function getReportCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  
  for (const format of ['Situation Report', 'Assessment', 'Analysis', 'News and Press Release', 'Appeal']) {
    try {
      const url = `${BASE_URL}/reports?appname=yeto-platform&limit=0&filter[conditions][0][field]=primary_country.iso3&filter[conditions][0][value]=${YEMEN_ISO3}&filter[conditions][1][field]=format.name&filter[conditions][1][value]=${encodeURIComponent(format)}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const json = await response.json() as ReliefWebResponse;
        counts[format] = json.totalCount || 0;
      }
      
      await delay(200);
    } catch {
      counts[format] = 0;
    }
  }
  
  return counts;
}

// ============================================
// Main Fetch Functions
// ============================================

/**
 * Fetch and store ReliefWeb updates
 */
export async function fetchReliefWebData(): Promise<{
  success: boolean;
  recordsIngested: number;
  errors: string[];
}> {
  let recordsIngested = 0;
  const errors: string[] = [];
  
  console.log('[ReliefWeb] Starting fetch for Yemen reports');
  
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
  
  // Fetch latest situation reports
  try {
    const sitReps = await fetchLatestSitReps(20);
    
    for (const report of sitReps) {
      try {
        const eventDate = new Date(report.fields.date.original || report.fields.date.created);
        
        // Store as economic event (humanitarian update)
        await db.insert(economicEvents).values({
          title: report.fields.title.substring(0, 255),
          titleAr: null,
          description: report.fields.body?.substring(0, 5000) || `ReliefWeb Situation Report: ${report.fields.title}`,
          descriptionAr: null,
          eventDate,
          regimeTag: 'mixed',
          category: 'humanitarian',
          impactLevel: 'medium',
          sourceId,
        }).onDuplicateKeyUpdate({
          set: { updatedAt: new Date() },
        });
        recordsIngested++;
      } catch {
        // Ignore duplicate errors
      }
    }
    
    console.log(`[ReliefWeb] Ingested ${sitReps.length} situation reports`);
  } catch (error) {
    errors.push(`Situation Reports: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  await delay(500);
  
  // Fetch latest assessments
  try {
    const assessments = await fetchLatestAssessments(10);
    
    for (const report of assessments) {
      try {
        const eventDate = new Date(report.fields.date.original || report.fields.date.created);
        
        await db.insert(economicEvents).values({
          title: report.fields.title.substring(0, 255),
          titleAr: null,
          description: report.fields.body?.substring(0, 5000) || `ReliefWeb Assessment: ${report.fields.title}`,
          descriptionAr: null,
          eventDate,
          regimeTag: 'mixed',
          category: 'assessment',
          impactLevel: 'medium',
          sourceId,
        }).onDuplicateKeyUpdate({
          set: { updatedAt: new Date() },
        });
        recordsIngested++;
      } catch {
        // Ignore duplicate errors
      }
    }
    
    console.log(`[ReliefWeb] Ingested ${assessments.length} assessments`);
  } catch (error) {
    errors.push(`Assessments: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  // Get and log report counts
  try {
    const counts = await getReportCounts();
    console.log(`[ReliefWeb] Yemen report counts:`, counts);
  } catch {
    // Non-critical error
  }
  
  console.log(`[ReliefWeb] Completed: ${recordsIngested} records ingested, ${errors.length} errors`);
  
  return {
    success: errors.length === 0,
    recordsIngested,
    errors,
  };
}

/**
 * Get latest humanitarian updates from database
 */
export async function getLatestUpdates(limit: number = 10): Promise<Array<{
  title: string;
  date: string;
  category: string;
}>> {
  const db = await getDb();
  if (!db) return [];
  
  const results = await db.select()
    .from(economicEvents)
    .where(eq(economicEvents.category, 'humanitarian'))
    .orderBy(desc(economicEvents.eventDate))
    .limit(limit);
  
  return results.map(r => ({
    title: r.title,
    date: r.eventDate.toISOString().split('T')[0],
    category: r.category || 'humanitarian',
  }));
}

// Export for scheduler
export const reliefWebConnector = {
  id: 'reliefweb',
  name: SOURCE_NAME,
  fetch: fetchReliefWebData,
  fetchLatestSitReps,
  fetchLatestAssessments,
  fetchLatestNews,
  getLatestUpdates,
};
