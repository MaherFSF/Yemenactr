/**
 * Literature Ingestion Service
 * Handles automated ingestion from World Bank Documents API and ReliefWeb API
 */

import { getDb } from '../db';
import { sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import * as literatureService from './literatureService';

// Types
export interface IngestionSource {
  id: string;
  name: string;
  type: 'world_bank' | 'reliefweb' | 'manual' | 'iati' | 'imf' | 'ocha';
  apiUrl?: string;
  enabled: boolean;
}

export interface IngestionRunResult {
  runId: string;
  sourceName: string;
  status: 'completed' | 'failed' | 'partial';
  documentsFound: number;
  documentsNew: number;
  documentsUpdated: number;
  documentsDuplicate: number;
  documentsFailed: number;
  errors: string[];
  startedAt: Date;
  completedAt: Date;
}

export interface WorldBankDocument {
  id: string;
  title: string;
  abstracts?: string;
  docdt?: string; // Document date
  docty?: string; // Document type
  url?: string;
  pdfurl?: string;
  count?: string;
  lang?: string;
  repnb?: string; // Report number
  majdocty?: string; // Major document type
  theme?: string[];
  sector?: string[];
  regionname?: string;
  countryname?: string;
}

export interface ReliefWebDocument {
  id: number;
  fields: {
    title: string;
    body?: string;
    date?: {
      original: string;
    };
    source?: Array<{
      name: string;
      shortname?: string;
    }>;
    country?: Array<{
      name: string;
      iso3?: string;
    }>;
    theme?: Array<{
      name: string;
    }>;
    format?: {
      name: string;
    };
    language?: Array<{
      name: string;
      code?: string;
    }>;
    url?: string;
    url_alias?: string;
    file?: Array<{
      url: string;
      mimetype?: string;
      filesize?: number;
    }>;
  };
}

// Ingestion sources configuration
const INGESTION_SOURCES: IngestionSource[] = [
  {
    id: 'world_bank',
    name: 'World Bank Documents',
    type: 'world_bank',
    apiUrl: 'https://search.worldbank.org/api/v2/wds',
    enabled: true
  },
  {
    id: 'reliefweb',
    name: 'ReliefWeb Reports',
    type: 'reliefweb',
    apiUrl: 'https://api.reliefweb.int/v1/reports',
    enabled: true
  }
];

/**
 * Get all configured ingestion sources
 */
export function getIngestionSources(): IngestionSource[] {
  return INGESTION_SOURCES;
}

/**
 * Create an ingestion run record
 */
export async function createIngestionRun(
  sourceId: number | null,
  sourceName: string,
  runType: 'scheduled' | 'manual' | 'backfill',
  triggeredBy?: number
): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const runId = `run_${uuidv4().replace(/-/g, '').substring(0, 16)}`;

  await db.execute(sql`
    INSERT INTO literature_ingestion_runs (
      runId, sourceId, sourceName, runType, status, triggeredBy, startedAt
    ) VALUES (
      ${runId}, ${sourceId}, ${sourceName}, ${runType}, 'running', ${triggeredBy || null}, NOW()
    )
  `);

  return runId;
}

/**
 * Update ingestion run with results
 */
export async function updateIngestionRun(
  runId: string,
  result: Partial<IngestionRunResult>
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.execute(sql`
    UPDATE literature_ingestion_runs SET
      status = ${result.status || 'completed'},
      documentsFound = ${result.documentsFound || 0},
      documentsNew = ${result.documentsNew || 0},
      documentsUpdated = ${result.documentsUpdated || 0},
      documentsDuplicate = ${result.documentsDuplicate || 0},
      documentsFailed = ${result.documentsFailed || 0},
      errorMessage = ${result.errors?.join('; ') || null},
      completedAt = NOW()
    WHERE runId = ${runId}
  `);
}

/**
 * Ingest documents from World Bank Documents API
 */
export async function ingestWorldBankDocuments(
  options: {
    query?: string;
    fromDate?: string;
    toDate?: string;
    limit?: number;
    triggeredBy?: number;
  } = {}
): Promise<IngestionRunResult> {
  const startedAt = new Date();
  const runId = await createIngestionRun(null, 'World Bank Documents', 'manual', options.triggeredBy);
  
  const result: IngestionRunResult = {
    runId,
    sourceName: 'World Bank Documents',
    status: 'completed',
    documentsFound: 0,
    documentsNew: 0,
    documentsUpdated: 0,
    documentsDuplicate: 0,
    documentsFailed: 0,
    errors: [],
    startedAt,
    completedAt: new Date()
  };

  try {
    // Build query parameters
    const params = new URLSearchParams({
      format: 'json',
      qterm: options.query || 'Yemen',
      rows: String(options.limit || 50),
      os: '0',
      fl: 'id,title,abstracts,docdt,docty,url,pdfurl,lang,repnb,majdocty,theme,sector,regionname,countryname'
    });

    if (options.fromDate) {
      params.append('docdt_from', options.fromDate);
    }
    if (options.toDate) {
      params.append('docdt_to', options.toDate);
    }

    const apiUrl = `https://search.worldbank.org/api/v2/wds?${params.toString()}`;
    console.log('[LiteratureIngestion] Fetching World Bank documents:', apiUrl);

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`World Bank API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const documents: WorldBankDocument[] = data.documents ? Object.values(data.documents) : [];
    result.documentsFound = documents.length;

    for (const doc of documents) {
      try {
        // Check for duplicate
        const existing = await literatureService.checkDuplicate(
          doc.url || doc.pdfurl,
          undefined,
          doc.title,
          'World Bank',
          doc.docdt ? new Date(doc.docdt) : undefined
        );

        if (existing) {
          result.documentsDuplicate++;
          continue;
        }

        // Map sectors
        const sectors = mapWorldBankSectors(doc.sector || []);

        // Create document
        const newDoc = await literatureService.createDocument({
          titleEn: doc.title,
          publisherName: 'World Bank',
          canonicalUrl: doc.url || doc.pdfurl,
          publishedAt: doc.docdt ? new Date(doc.docdt) : undefined,
          licenseFlag: 'open',
          licenseDetails: 'World Bank Open Access',
          languageOriginal: mapLanguage(doc.lang),
          docType: mapWorldBankDocType(doc.majdocty || doc.docty),
          sectors,
          geographies: doc.countryname ? [doc.countryname] : ['Yemen'],
          regimeTagApplicability: 'both',
          summaryEn: doc.abstracts,
          importanceScore: calculateImportanceScore(doc),
          metadata: {
            worldBankId: doc.id,
            reportNumber: doc.repnb,
            theme: doc.theme,
            region: doc.regionname
          }
        });

        if (newDoc) {
          result.documentsNew++;
          
          // Create version if PDF URL available
          if (doc.pdfurl) {
            await literatureService.createDocumentVersion({
              documentId: newDoc.id,
              contentHash: literatureService.generateContentHash(doc.pdfurl),
              s3OriginalUrl: doc.pdfurl,
              mimeType: 'application/pdf'
            });
          }
        } else {
          result.documentsFailed++;
        }
      } catch (docError) {
        console.error('[LiteratureIngestion] Failed to process WB document:', docError);
        result.documentsFailed++;
        result.errors.push(`Failed to process document ${doc.id}: ${docError}`);
      }
    }

    result.completedAt = new Date();
    result.status = result.documentsFailed > 0 ? 'partial' : 'completed';
  } catch (error) {
    console.error('[LiteratureIngestion] World Bank ingestion failed:', error);
    result.status = 'failed';
    result.errors.push(String(error));
    result.completedAt = new Date();
  }

  await updateIngestionRun(runId, result);
  return result;
}

/**
 * Ingest documents from ReliefWeb API
 */
export async function ingestReliefWebDocuments(
  options: {
    query?: string;
    fromDate?: string;
    toDate?: string;
    limit?: number;
    triggeredBy?: number;
  } = {}
): Promise<IngestionRunResult> {
  const startedAt = new Date();
  const runId = await createIngestionRun(null, 'ReliefWeb Reports', 'manual', options.triggeredBy);
  
  const result: IngestionRunResult = {
    runId,
    sourceName: 'ReliefWeb Reports',
    status: 'completed',
    documentsFound: 0,
    documentsNew: 0,
    documentsUpdated: 0,
    documentsDuplicate: 0,
    documentsFailed: 0,
    errors: [],
    startedAt,
    completedAt: new Date()
  };

  try {
    // Build request body
    const requestBody: any = {
      appname: 'yeto-platform',
      limit: options.limit || 50,
      fields: {
        include: [
          'id', 'title', 'body', 'date.original', 'source.name', 'source.shortname',
          'country.name', 'country.iso3', 'theme.name', 'format.name',
          'language.name', 'language.code', 'url', 'url_alias', 'file.url',
          'file.mimetype', 'file.filesize'
        ]
      },
      filter: {
        operator: 'AND',
        conditions: [
          {
            field: 'country.iso3',
            value: 'YEM'
          }
        ]
      },
      sort: ['date.original:desc']
    };

    if (options.query) {
      requestBody.query = { value: options.query };
    }

    if (options.fromDate) {
      requestBody.filter.conditions.push({
        field: 'date.original',
        value: { from: options.fromDate }
      });
    }

    console.log('[LiteratureIngestion] Fetching ReliefWeb documents');

    const response = await fetch('https://api.reliefweb.int/v1/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`ReliefWeb API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const documents: ReliefWebDocument[] = data.data || [];
    result.documentsFound = documents.length;

    for (const doc of documents) {
      try {
        const fields = doc.fields;
        
        // Check for duplicate
        const docUrl = fields.url || fields.url_alias;
        const existing = await literatureService.checkDuplicate(
          docUrl,
          undefined,
          fields.title,
          fields.source?.[0]?.name || 'ReliefWeb',
          fields.date?.original ? new Date(fields.date.original) : undefined
        );

        if (existing) {
          result.documentsDuplicate++;
          continue;
        }

        // Map sectors from themes
        const sectors = mapReliefWebThemes(fields.theme || []);

        // Create document
        const newDoc = await literatureService.createDocument({
          titleEn: fields.title,
          publisherName: fields.source?.[0]?.name || 'ReliefWeb',
          canonicalUrl: docUrl,
          publishedAt: fields.date?.original ? new Date(fields.date.original) : undefined,
          licenseFlag: 'open',
          licenseDetails: 'ReliefWeb Open Access',
          languageOriginal: mapReliefWebLanguage(fields.language),
          docType: mapReliefWebFormat(fields.format?.name),
          sectors,
          geographies: fields.country?.map(c => c.name) || ['Yemen'],
          regimeTagApplicability: 'both',
          summaryEn: fields.body?.substring(0, 2000),
          importanceScore: 60, // Default importance for ReliefWeb
          metadata: {
            reliefWebId: doc.id,
            themes: fields.theme?.map(t => t.name),
            sources: fields.source?.map(s => s.name)
          }
        });

        if (newDoc) {
          result.documentsNew++;
          
          // Create version if file available
          const file = fields.file?.[0];
          if (file?.url) {
            await literatureService.createDocumentVersion({
              documentId: newDoc.id,
              contentHash: literatureService.generateContentHash(file.url),
              s3OriginalUrl: file.url,
              mimeType: file.mimetype || 'application/pdf',
              fileSize: file.filesize
            });
          }
        } else {
          result.documentsFailed++;
        }
      } catch (docError) {
        console.error('[LiteratureIngestion] Failed to process RW document:', docError);
        result.documentsFailed++;
        result.errors.push(`Failed to process document ${doc.id}: ${docError}`);
      }
    }

    result.completedAt = new Date();
    result.status = result.documentsFailed > 0 ? 'partial' : 'completed';
  } catch (error) {
    console.error('[LiteratureIngestion] ReliefWeb ingestion failed:', error);
    result.status = 'failed';
    result.errors.push(String(error));
    result.completedAt = new Date();
  }

  await updateIngestionRun(runId, result);
  return result;
}

/**
 * Run all enabled ingestion sources
 */
export async function runAllIngestion(
  options: {
    fromDate?: string;
    limit?: number;
    triggeredBy?: number;
  } = {}
): Promise<IngestionRunResult[]> {
  const results: IngestionRunResult[] = [];

  // World Bank
  try {
    const wbResult = await ingestWorldBankDocuments({
      query: 'Yemen',
      fromDate: options.fromDate,
      limit: options.limit,
      triggeredBy: options.triggeredBy
    });
    results.push(wbResult);
  } catch (error) {
    console.error('[LiteratureIngestion] World Bank ingestion error:', error);
  }

  // ReliefWeb
  try {
    const rwResult = await ingestReliefWebDocuments({
      fromDate: options.fromDate,
      limit: options.limit,
      triggeredBy: options.triggeredBy
    });
    results.push(rwResult);
  } catch (error) {
    console.error('[LiteratureIngestion] ReliefWeb ingestion error:', error);
  }

  return results;
}

/**
 * Get recent ingestion runs
 */
export async function getRecentIngestionRuns(limit: number = 20): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db.execute(sql`
      SELECT * FROM literature_ingestion_runs 
      ORDER BY startedAt DESC 
      LIMIT ${limit}
    `);

    return (result as any)[0] || [];
  } catch (error) {
    console.error('[LiteratureIngestion] Failed to get recent runs:', error);
    return [];
  }
}

/**
 * Get ingestion statistics
 */
export async function getIngestionStatistics(): Promise<{
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  totalDocumentsIngested: number;
  lastRunAt?: Date;
}> {
  const db = await getDb();
  if (!db) return { totalRuns: 0, successfulRuns: 0, failedRuns: 0, totalDocumentsIngested: 0 };

  try {
    const statsResult = await db.execute(sql`
      SELECT 
        COUNT(*) as totalRuns,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successfulRuns,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failedRuns,
        SUM(documentsNew) as totalDocumentsIngested,
        MAX(completedAt) as lastRunAt
      FROM literature_ingestion_runs
    `);

    const stats = (statsResult as any)[0]?.[0] || {};
    return {
      totalRuns: stats.totalRuns || 0,
      successfulRuns: stats.successfulRuns || 0,
      failedRuns: stats.failedRuns || 0,
      totalDocumentsIngested: stats.totalDocumentsIngested || 0,
      lastRunAt: stats.lastRunAt ? new Date(stats.lastRunAt) : undefined
    };
  } catch (error) {
    console.error('[LiteratureIngestion] Failed to get statistics:', error);
    return { totalRuns: 0, successfulRuns: 0, failedRuns: 0, totalDocumentsIngested: 0 };
  }
}

// Helper functions

function mapWorldBankSectors(sectors: string[]): string[] {
  const sectorMap: Record<string, string> = {
    'Finance': 'banking_finance',
    'Financial Sector': 'banking_finance',
    'Macro-Fiscal': 'fiscal_policy',
    'Macroeconomics': 'macroeconomic',
    'Trade': 'trade',
    'Agriculture': 'food_security',
    'Food Security': 'food_security',
    'Energy': 'energy',
    'Health': 'humanitarian',
    'Social Protection': 'humanitarian',
    'Water': 'humanitarian',
    'Transport': 'infrastructure',
    'Urban Development': 'infrastructure'
  };

  const mappedSectors: string[] = [];
  for (const sector of sectors) {
    const mapped = sectorMap[sector];
    if (mapped && !mappedSectors.includes(mapped)) {
      mappedSectors.push(mapped);
    }
  }

  return mappedSectors.length > 0 ? mappedSectors : ['macroeconomic'];
}

function mapReliefWebThemes(themes: Array<{ name: string }>): string[] {
  const themeMap: Record<string, string> = {
    'Food and Nutrition': 'food_security',
    'Health': 'humanitarian',
    'Protection and Human Rights': 'humanitarian',
    'Shelter and Non-Food Items': 'humanitarian',
    'Water Sanitation Hygiene': 'humanitarian',
    'Education': 'humanitarian',
    'Logistics and Telecommunications': 'infrastructure',
    'Coordination': 'humanitarian',
    'Agriculture': 'food_security',
    'Economy': 'macroeconomic',
    'Climate Change and Environment': 'environment',
    'Contributions': 'aid_flows',
    'Recovery and Reconstruction': 'infrastructure'
  };

  const mappedSectors: string[] = [];
  for (const theme of themes) {
    const mapped = themeMap[theme.name];
    if (mapped && !mappedSectors.includes(mapped)) {
      mappedSectors.push(mapped);
    }
  }

  return mappedSectors.length > 0 ? mappedSectors : ['humanitarian'];
}

function mapWorldBankDocType(docType?: string): string {
  const typeMap: Record<string, string> = {
    'Policy Research Working Paper': 'working_paper',
    'Working Paper': 'working_paper',
    'Report': 'report',
    'Economic Report': 'report',
    'Project Appraisal Document': 'report',
    'Implementation Completion Report': 'evaluation',
    'Country Economic Memorandum': 'report',
    'Public Expenditure Review': 'report',
    'Poverty Assessment': 'report',
    'Technical Assistance': 'methodology_note',
    'Brief': 'policy_brief'
  };

  return typeMap[docType || ''] || 'report';
}

function mapReliefWebFormat(format?: string): string {
  const formatMap: Record<string, string> = {
    'Situation Report': 'sitrep',
    'Assessment': 'evaluation',
    'Analysis': 'report',
    'News and Press Release': 'press_release',
    'Appeal': 'report',
    'Map': 'other',
    'Infographic': 'other',
    'Manual and Guideline': 'methodology_note',
    'Evaluation and Lessons Learned': 'evaluation'
  };

  return formatMap[format || ''] || 'report';
}

function mapLanguage(lang?: string): 'en' | 'ar' | 'both' | 'other' {
  if (!lang) return 'en';
  const langLower = lang.toLowerCase();
  if (langLower.includes('arabic') || langLower === 'ar') return 'ar';
  if (langLower.includes('english') || langLower === 'en') return 'en';
  return 'other';
}

function mapReliefWebLanguage(languages?: Array<{ name: string; code?: string }>): 'en' | 'ar' | 'both' | 'other' {
  if (!languages || languages.length === 0) return 'en';
  
  const hasEn = languages.some(l => l.code === 'en' || l.name.toLowerCase().includes('english'));
  const hasAr = languages.some(l => l.code === 'ar' || l.name.toLowerCase().includes('arabic'));
  
  if (hasEn && hasAr) return 'both';
  if (hasAr) return 'ar';
  if (hasEn) return 'en';
  return 'other';
}

function calculateImportanceScore(doc: WorldBankDocument): number {
  let score = 50;
  
  // Boost for certain document types
  if (doc.majdocty?.includes('Economic Report')) score += 15;
  if (doc.majdocty?.includes('Country Economic Memorandum')) score += 20;
  if (doc.majdocty?.includes('Public Expenditure Review')) score += 15;
  
  // Boost for recent documents
  if (doc.docdt) {
    const docDate = new Date(doc.docdt);
    const now = new Date();
    const yearsOld = (now.getTime() - docDate.getTime()) / (365 * 24 * 60 * 60 * 1000);
    if (yearsOld < 1) score += 10;
    else if (yearsOld < 3) score += 5;
  }
  
  return Math.min(100, score);
}
