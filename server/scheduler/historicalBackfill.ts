/**
 * Historical Data Backfill System
 * 
 * Orchestrates backfill of historical data from 2010 to present
 * for all data connectors. Supports:
 * - Year-by-year ingestion
 * - Incremental backfill (skip existing data)
 * - Progress tracking and logging
 * - Data availability detection per source
 * - Validation of historical records
 */

import { getDb } from "../db";
import { provenanceLog, sources, timeSeries } from "../../drizzle/schema";
import { eq, sql, and, gte, lte } from "drizzle-orm";

// Import all connectors
import { ingestUNHCRData } from "../connectors/unhcrConnector";
import { ingestWHOData } from "../connectors/whoConnector";
import { ingestUNICEFData } from "../connectors/unicefConnector";
import { ingestWFPData } from "../connectors/wfpConnector";
import { ingestUNDPData } from "../connectors/undpConnector";
import { ingestIATIData } from "../connectors/iatiConnector";
import { ingestCBYData } from "../connectors/cbyConnector";

// ============================================
// Types
// ============================================

export interface BackfillConfig {
  startYear: number;
  endYear: number;
  connectors: string[];
  skipExisting: boolean;
  validateData: boolean;
  batchSize: number;
}

export interface BackfillProgress {
  connector: string;
  status: "pending" | "running" | "completed" | "failed";
  startYear: number;
  endYear: number;
  currentYear: number;
  recordsIngested: number;
  errors: string[];
  startedAt?: Date;
  completedAt?: Date;
}

export interface BackfillResult {
  success: boolean;
  totalRecords: number;
  connectorResults: Record<string, {
    records: number;
    years: number[];
    errors: string[];
    duration: number;
  }>;
  startedAt: Date;
  completedAt: Date;
  duration: number;
}

// ============================================
// Connector Registry
// ============================================

interface ConnectorInfo {
  name: string;
  nameAr: string;
  dataAvailability: { start: number; end: number };
  ingestFn: (startYear: number, endYear: number) => Promise<{ recordsIngested: number; errors: string[]; yearsCovered: number[] }>;
  priority: number;
}

const CONNECTOR_REGISTRY: Record<string, ConnectorInfo> = {
  "unhcr": {
    name: "UNHCR Refugee Data",
    nameAr: "بيانات اللاجئين - المفوضية السامية",
    dataAvailability: { start: 2010, end: 2024 },
    ingestFn: ingestUNHCRData,
    priority: 1,
  },
  "who": {
    name: "WHO Health Indicators",
    nameAr: "مؤشرات الصحة - منظمة الصحة العالمية",
    dataAvailability: { start: 2010, end: 2024 },
    ingestFn: ingestWHOData,
    priority: 2,
  },
  "unicef": {
    name: "UNICEF Child Welfare",
    nameAr: "رعاية الطفل - اليونيسف",
    dataAvailability: { start: 2010, end: 2024 },
    ingestFn: ingestUNICEFData,
    priority: 3,
  },
  "wfp": {
    name: "WFP Food Security",
    nameAr: "الأمن الغذائي - برنامج الغذاء العالمي",
    dataAvailability: { start: 2010, end: 2024 },
    ingestFn: ingestWFPData,
    priority: 4,
  },
  "undp": {
    name: "UNDP Human Development",
    nameAr: "التنمية البشرية - برنامج الأمم المتحدة الإنمائي",
    dataAvailability: { start: 2010, end: 2024 },
    ingestFn: ingestUNDPData,
    priority: 5,
  },
  "iati": {
    name: "IATI Aid Transparency",
    nameAr: "شفافية المساعدات - IATI",
    dataAvailability: { start: 2010, end: 2024 },
    ingestFn: ingestIATIData,
    priority: 6,
  },
  "cby": {
    name: "Central Bank of Yemen",
    nameAr: "البنك المركزي اليمني",
    dataAvailability: { start: 2010, end: 2024 },
    ingestFn: ingestCBYData,
    priority: 7,
  },
};

// ============================================
// Backfill Progress Tracking
// ============================================

const backfillProgress: Map<string, BackfillProgress> = new Map();

export function getBackfillProgress(): BackfillProgress[] {
  return Array.from(backfillProgress.values());
}

export function getConnectorProgress(connector: string): BackfillProgress | undefined {
  return backfillProgress.get(connector);
}

// ============================================
// Data Availability Detection
// ============================================

async function checkDataAvailability(
  connector: string,
  year: number
): Promise<boolean> {
  const connectorInfo = CONNECTOR_REGISTRY[connector];
  if (!connectorInfo) return false;
  
  return year >= connectorInfo.dataAvailability.start && 
         year <= connectorInfo.dataAvailability.end;
}

async function getExistingYears(connector: string): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];
  
  // Get unique years for this connector's indicators
  const prefix = connector.toUpperCase();
  
  try {
    const results = await db.select({
      year: sql<number>`YEAR(${timeSeries.date})`.as("year"),
    })
    .from(timeSeries)
    .where(sql`${timeSeries.indicatorCode} LIKE ${prefix + "_%"}`)
    .groupBy(sql`YEAR(${timeSeries.date})`);
    
    return results.map(r => r.year);
  } catch {
    return [];
  }
}

// ============================================
// Data Validation
// ============================================

interface ValidationResult {
  valid: boolean;
  issues: string[];
}

async function validateBackfilledData(
  connector: string,
  year: number
): Promise<ValidationResult> {
  const db = await getDb();
  if (!db) return { valid: false, issues: ["Database not available"] };
  
  const issues: string[] = [];
  const prefix = connector.toUpperCase();
  
  try {
    // Check for records in the year
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    const records = await db.select({ count: sql<number>`COUNT(*)` })
      .from(timeSeries)
      .where(and(
        sql`${timeSeries.indicatorCode} LIKE ${prefix + "_%"}`,
        gte(timeSeries.date, startDate),
        lte(timeSeries.date, endDate)
      ));
    
    const count = records[0]?.count || 0;
    
    if (count === 0) {
      issues.push(`No records found for ${year}`);
    }
    
    // Check for null/invalid values
    const nullValues = await db.select({ count: sql<number>`COUNT(*)` })
      .from(timeSeries)
      .where(and(
        sql`${timeSeries.indicatorCode} LIKE ${prefix + "_%"}`,
        gte(timeSeries.date, startDate),
        lte(timeSeries.date, endDate),
        sql`${timeSeries.value} IS NULL OR ${timeSeries.value} = ''`
      ));
    
    if ((nullValues[0]?.count || 0) > 0) {
      issues.push(`Found ${nullValues[0].count} null/empty values for ${year}`);
    }
    
    return {
      valid: issues.length === 0,
      issues,
    };
  } catch (error) {
    return {
      valid: false,
      issues: [`Validation error: ${error}`],
    };
  }
}

// ============================================
// Main Backfill Functions
// ============================================

/**
 * Run backfill for a single connector
 */
export async function backfillConnector(
  connector: string,
  config: Partial<BackfillConfig> = {}
): Promise<{ records: number; years: number[]; errors: string[]; duration: number }> {
  const connectorInfo = CONNECTOR_REGISTRY[connector];
  if (!connectorInfo) {
    return { records: 0, years: [], errors: [`Unknown connector: ${connector}`], duration: 0 };
  }
  
  const startYear = config.startYear || connectorInfo.dataAvailability.start;
  const endYear = config.endYear || connectorInfo.dataAvailability.end;
  const skipExisting = config.skipExisting ?? true;
  
  console.log(`[Backfill] Starting ${connector} backfill: ${startYear}-${endYear}`);
  
  // Update progress
  backfillProgress.set(connector, {
    connector,
    status: "running",
    startYear,
    endYear,
    currentYear: startYear,
    recordsIngested: 0,
    errors: [],
    startedAt: new Date(),
  });
  
  const startTime = Date.now();
  const errors: string[] = [];
  let totalRecords = 0;
  const yearsCovered: number[] = [];
  
  try {
    // Check which years already have data
    const existingYears = skipExisting ? await getExistingYears(connector) : [];
    
    // Determine years to backfill
    const yearsToBackfill: number[] = [];
    for (let year = startYear; year <= endYear; year++) {
      if (!skipExisting || !existingYears.includes(year)) {
        const available = await checkDataAvailability(connector, year);
        if (available) {
          yearsToBackfill.push(year);
        }
      }
    }
    
    if (yearsToBackfill.length === 0) {
      console.log(`[Backfill] ${connector}: All years already backfilled`);
      backfillProgress.set(connector, {
        ...backfillProgress.get(connector)!,
        status: "completed",
        completedAt: new Date(),
      });
      return { records: 0, years: [], errors: [], duration: Date.now() - startTime };
    }
    
    // Run ingestion for the full range
    const minYear = Math.min(...yearsToBackfill);
    const maxYear = Math.max(...yearsToBackfill);
    
    const result = await connectorInfo.ingestFn(minYear, maxYear);
    
    totalRecords = result.recordsIngested;
    yearsCovered.push(...result.yearsCovered);
    errors.push(...result.errors);
    
    // Validate if configured
    if (config.validateData) {
      for (const year of yearsCovered) {
        const validation = await validateBackfilledData(connector, year);
        if (!validation.valid) {
          errors.push(...validation.issues.map(i => `Validation (${year}): ${i}`));
        }
      }
    }
    
    // Update progress
    backfillProgress.set(connector, {
      connector,
      status: errors.length === 0 ? "completed" : "completed",
      startYear,
      endYear,
      currentYear: endYear,
      recordsIngested: totalRecords,
      errors,
      startedAt: backfillProgress.get(connector)?.startedAt,
      completedAt: new Date(),
    });
    
  } catch (error) {
    errors.push(`Fatal error: ${error}`);
    backfillProgress.set(connector, {
      ...backfillProgress.get(connector)!,
      status: "failed",
      errors,
      completedAt: new Date(),
    });
  }
  
  const duration = Date.now() - startTime;
  console.log(`[Backfill] ${connector} complete: ${totalRecords} records in ${duration}ms`);
  
  return { records: totalRecords, years: yearsCovered, errors, duration };
}

/**
 * Run full historical backfill for all connectors
 */
export async function runFullBackfill(
  config: Partial<BackfillConfig> = {}
): Promise<BackfillResult> {
  const startedAt = new Date();
  const connectors = config.connectors || Object.keys(CONNECTOR_REGISTRY);
  
  console.log(`[Backfill] Starting full backfill for ${connectors.length} connectors`);
  
  const connectorResults: BackfillResult["connectorResults"] = {};
  let totalRecords = 0;
  
  // Sort connectors by priority
  const sortedConnectors = connectors.sort((a, b) => {
    const priorityA = CONNECTOR_REGISTRY[a]?.priority || 999;
    const priorityB = CONNECTOR_REGISTRY[b]?.priority || 999;
    return priorityA - priorityB;
  });
  
  // Run backfill for each connector
  for (const connector of sortedConnectors) {
    const result = await backfillConnector(connector, config);
    connectorResults[connector] = result;
    totalRecords += result.records;
  }
  
  const completedAt = new Date();
  const duration = completedAt.getTime() - startedAt.getTime();
  
  // Log overall provenance
  const db = await getDb();
  if (db) {
    await db.insert(provenanceLog).values({
      dataPointId: 0,
      dataPointType: "full_backfill",
      transformationType: "historical_import",
      formula: `Connectors: ${connectors.join(", ")}, Total: ${totalRecords} records`,
    });
  }
  
  console.log(`[Backfill] Full backfill complete: ${totalRecords} records in ${duration}ms`);
  
  return {
    success: Object.values(connectorResults).every(r => r.errors.length === 0),
    totalRecords,
    connectorResults,
    startedAt,
    completedAt,
    duration,
  };
}

/**
 * Get backfill status summary
 */
export async function getBackfillStatus(): Promise<{
  connectors: {
    name: string;
    nameAr: string;
    dataAvailability: { start: number; end: number };
    existingYears: number[];
    missingYears: number[];
    progress: BackfillProgress | null;
  }[];
  totalRecords: number;
  lastBackfill: Date | null;
}> {
  const db = await getDb();
  const connectors = [];
  let totalRecords = 0;
  
  for (const [key, info] of Object.entries(CONNECTOR_REGISTRY)) {
    const existingYears = await getExistingYears(key);
    const allYears = Array.from(
      { length: info.dataAvailability.end - info.dataAvailability.start + 1 },
      (_, i) => info.dataAvailability.start + i
    );
    const missingYears = allYears.filter(y => !existingYears.includes(y));
    
    connectors.push({
      name: info.name,
      nameAr: info.nameAr,
      dataAvailability: info.dataAvailability,
      existingYears,
      missingYears,
      progress: backfillProgress.get(key) || null,
    });
    
    // Count records
    if (db) {
      const prefix = key.toUpperCase();
      const count = await db.select({ count: sql<number>`COUNT(*)` })
        .from(timeSeries)
        .where(sql`${timeSeries.indicatorCode} LIKE ${prefix + "_%"}`);
      totalRecords += count[0]?.count || 0;
    }
  }
  
  // Get last backfill date from provenance log
  let lastBackfill: Date | null = null;
  if (db) {
    const lastLog = await db.select()
      .from(provenanceLog)
      .where(eq(provenanceLog.dataPointType, "full_backfill"))
      .orderBy(sql`${provenanceLog.performedAt} DESC`)
      .limit(1);
    
    if (lastLog.length > 0) {
      lastBackfill = lastLog[0].performedAt;
    }
  }
  
  return {
    connectors,
    totalRecords,
    lastBackfill,
  };
}

export default {
  backfillConnector,
  runFullBackfill,
  getBackfillStatus,
  getBackfillProgress,
  getConnectorProgress,
  CONNECTOR_REGISTRY,
};
