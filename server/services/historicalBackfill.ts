/**
 * Historical Backfill Runner
 * Day spine from 2010-01-01 → today with resumable checkpoints and idempotent inserts.
 */

import { getDb } from '../db';
import { sql } from 'drizzle-orm';

// Backfill configuration
export interface BackfillConfig {
  datasetId: string;
  indicatorCode: string;
  sourceId: string;
  startDate: Date;
  endDate: Date;
  chunkSize: 'year' | 'month' | 'day';
  regimeTag?: 'IRG' | 'DFA' | 'unified';
}

// Backfill checkpoint for resumability
export interface BackfillCheckpoint {
  id: string;
  datasetId: string;
  indicatorCode: string;
  lastProcessedDate: Date;
  totalDays: number;
  processedDays: number;
  insertedRecords: number;
  skippedRecords: number;
  errorCount: number;
  status: 'running' | 'paused' | 'completed' | 'failed';
  startedAt: Date;
  lastUpdatedAt: Date;
  errors: string[];
}

// Day spine entry
interface DaySpineEntry {
  date: Date;
  year: number;
  month: number;
  day: number;
  quarter: number;
  weekOfYear: number;
  dayOfWeek: number;
  isWeekend: boolean;
  fiscalYear: number; // Yemen fiscal year (Jan-Dec)
}

/**
 * Generate day spine from start to end date
 */
export function generateDaySpine(startDate: Date, endDate: Date): DaySpineEntry[] {
  const spine: DaySpineEntry[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const year = current.getFullYear();
    const month = current.getMonth() + 1;
    const day = current.getDate();
    const dayOfWeek = current.getDay();
    
    // Calculate week of year
    const startOfYear = new Date(year, 0, 1);
    const days = Math.floor((current.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekOfYear = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    
    // Calculate quarter
    const quarter = Math.ceil(month / 3);
    
    spine.push({
      date: new Date(current),
      year,
      month,
      day,
      quarter,
      weekOfYear,
      dayOfWeek,
      isWeekend: dayOfWeek === 5 || dayOfWeek === 6, // Friday-Saturday in Yemen
      fiscalYear: year, // Yemen uses calendar year
    });
    
    current.setDate(current.getDate() + 1);
  }
  
  return spine;
}

/**
 * Chunk day spine by year, month, or day
 */
export function chunkDaySpine(
  spine: DaySpineEntry[],
  chunkSize: 'year' | 'month' | 'day'
): DaySpineEntry[][] {
  if (chunkSize === 'day') {
    return spine.map(entry => [entry]);
  }
  
  const chunks: Map<string, DaySpineEntry[]> = new Map();
  
  for (const entry of spine) {
    let key: string;
    if (chunkSize === 'year') {
      key = `${entry.year}`;
    } else {
      key = `${entry.year}-${String(entry.month).padStart(2, '0')}`;
    }
    
    if (!chunks.has(key)) {
      chunks.set(key, []);
    }
    chunks.get(key)!.push(entry);
  }
  
  return Array.from(chunks.values());
}

/**
 * Get or create backfill checkpoint
 */
export async function getOrCreateCheckpoint(
  datasetId: string,
  indicatorCode: string
): Promise<BackfillCheckpoint> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  // Check for existing checkpoint
  const [existing] = await db.execute(sql`
    SELECT * FROM backfill_checkpoints 
    WHERE datasetId = ${datasetId} AND indicatorCode = ${indicatorCode}
    ORDER BY startedAt DESC LIMIT 1
  `) as any;
  
  if (existing && existing.length > 0) {
    const row = existing[0];
    return {
      id: row.id,
      datasetId: row.datasetId,
      indicatorCode: row.indicatorCode,
      lastProcessedDate: new Date(row.lastProcessedDate),
      totalDays: row.totalDays,
      processedDays: row.processedDays,
      insertedRecords: row.insertedRecords,
      skippedRecords: row.skippedRecords,
      errorCount: row.errorCount,
      status: row.status,
      startedAt: new Date(row.startedAt),
      lastUpdatedAt: new Date(row.lastUpdatedAt),
      errors: JSON.parse(row.errors || '[]'),
    };
  }
  
  // Create new checkpoint
  const id = `bf_${datasetId}_${indicatorCode}_${Date.now()}`;
  const now = new Date();
  
  await db.execute(sql`
    INSERT INTO backfill_checkpoints (
      id, datasetId, indicatorCode, lastProcessedDate, totalDays, processedDays,
      insertedRecords, skippedRecords, errorCount, status, startedAt, lastUpdatedAt, errors
    ) VALUES (
      ${id}, ${datasetId}, ${indicatorCode}, ${new Date('2010-01-01').toISOString().split('T')[0]},
      0, 0, 0, 0, 0, 'running', ${now.toISOString()}, ${now.toISOString()}, '[]'
    )
  `);
  
  return {
    id,
    datasetId,
    indicatorCode,
    lastProcessedDate: new Date('2010-01-01'),
    totalDays: 0,
    processedDays: 0,
    insertedRecords: 0,
    skippedRecords: 0,
    errorCount: 0,
    status: 'running',
    startedAt: now,
    lastUpdatedAt: now,
    errors: [],
  };
}

/**
 * Update backfill checkpoint
 */
export async function updateCheckpoint(checkpoint: BackfillCheckpoint): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db.execute(sql`
    UPDATE backfill_checkpoints SET
      lastProcessedDate = ${checkpoint.lastProcessedDate.toISOString().split('T')[0]},
      totalDays = ${checkpoint.totalDays},
      processedDays = ${checkpoint.processedDays},
      insertedRecords = ${checkpoint.insertedRecords},
      skippedRecords = ${checkpoint.skippedRecords},
      errorCount = ${checkpoint.errorCount},
      status = ${checkpoint.status},
      lastUpdatedAt = ${new Date().toISOString()},
      errors = ${JSON.stringify(checkpoint.errors.slice(-100))}
    WHERE id = ${checkpoint.id}
  `);
}

/**
 * Idempotent insert for time series data
 */
export async function idempotentInsert(
  indicatorCode: string,
  date: Date,
  value: number | null,
  sourceId: string,
  regimeTag: string = 'unified',
  metadata: Record<string, any> = {}
): Promise<{ inserted: boolean; skipped: boolean; error?: string }> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const dateStr = date.toISOString().split('T')[0];
  
  try {
    // Check if record exists
    const [existing] = await db.execute(sql`
      SELECT id FROM time_series 
      WHERE indicatorCode = ${indicatorCode} 
        AND date = ${dateStr}
        AND regimeTag = ${regimeTag}
      LIMIT 1
    `) as any;
    
    if (existing && existing.length > 0) {
      return { inserted: false, skipped: true };
    }
    
    // Insert new record
    await db.execute(sql`
      INSERT INTO time_series (
        indicatorCode, date, value, sourceId, regimeTag, 
        vintageDate, createdAt, updatedAt
      ) VALUES (
        ${indicatorCode}, ${dateStr}, ${value}, ${sourceId}, ${regimeTag},
        ${new Date().toISOString().split('T')[0]}, NOW(), NOW()
      )
    `);
    
    return { inserted: true, skipped: false };
  } catch (error: any) {
    // Handle duplicate key error gracefully
    if (error.code === 'ER_DUP_ENTRY') {
      return { inserted: false, skipped: true };
    }
    return { inserted: false, skipped: false, error: error.message };
  }
}

/**
 * Run historical backfill for a dataset
 */
export async function runHistoricalBackfill(
  config: BackfillConfig,
  dataFetcher: (date: Date, regimeTag?: string) => Promise<number | null>,
  onProgress?: (checkpoint: BackfillCheckpoint) => void
): Promise<BackfillCheckpoint> {
  const checkpoint = await getOrCreateCheckpoint(config.datasetId, config.indicatorCode);
  
  // Generate day spine
  const startDate = checkpoint.status === 'running' && checkpoint.processedDays > 0
    ? new Date(checkpoint.lastProcessedDate.getTime() + 24 * 60 * 60 * 1000)
    : config.startDate;
  
  const spine = generateDaySpine(startDate, config.endDate);
  const chunks = chunkDaySpine(spine, config.chunkSize);
  
  checkpoint.totalDays = spine.length + checkpoint.processedDays;
  checkpoint.status = 'running';
  
  try {
    for (const chunk of chunks) {
      for (const entry of chunk) {
        try {
          // Fetch data for this date
          const value = await dataFetcher(entry.date, config.regimeTag);
          
          // Idempotent insert
          const result = await idempotentInsert(
            config.indicatorCode,
            entry.date,
            value,
            config.sourceId,
            config.regimeTag || 'unified'
          );
          
          if (result.inserted) {
            checkpoint.insertedRecords++;
          } else if (result.skipped) {
            checkpoint.skippedRecords++;
          } else if (result.error) {
            checkpoint.errorCount++;
            checkpoint.errors.push(`${entry.date.toISOString().split('T')[0]}: ${result.error}`);
          }
          
          checkpoint.processedDays++;
          checkpoint.lastProcessedDate = entry.date;
          
        } catch (error: any) {
          checkpoint.errorCount++;
          checkpoint.errors.push(`${entry.date.toISOString().split('T')[0]}: ${error.message}`);
        }
      }
      
      // Update checkpoint after each chunk
      await updateCheckpoint(checkpoint);
      
      if (onProgress) {
        onProgress(checkpoint);
      }
    }
    
    checkpoint.status = 'completed';
  } catch (error: any) {
    checkpoint.status = 'failed';
    checkpoint.errors.push(`Fatal: ${error.message}`);
  }
  
  await updateCheckpoint(checkpoint);
  return checkpoint;
}

/**
 * Get all backfill checkpoints
 */
export async function getAllCheckpoints(): Promise<BackfillCheckpoint[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const [rows] = await db.execute(sql`
      SELECT * FROM backfill_checkpoints ORDER BY startedAt DESC
    `) as any;
    
    return (rows || []).map((row: any) => ({
      id: row.id,
      datasetId: row.datasetId,
      indicatorCode: row.indicatorCode,
      lastProcessedDate: new Date(row.lastProcessedDate),
      totalDays: row.totalDays,
      processedDays: row.processedDays,
      insertedRecords: row.insertedRecords,
      skippedRecords: row.skippedRecords,
      errorCount: row.errorCount,
      status: row.status,
      startedAt: new Date(row.startedAt),
      lastUpdatedAt: new Date(row.lastUpdatedAt),
      errors: JSON.parse(row.errors || '[]'),
    }));
  } catch {
    return [];
  }
}

/**
 * Calculate coverage percentage for an indicator
 */
export async function calculateCoverage(
  indicatorCode: string,
  startDate: Date,
  endDate: Date,
  regimeTag?: string
): Promise<{
  totalDays: number;
  coveredDays: number;
  missingDays: number;
  coveragePercent: number;
  earliestDate: Date | null;
  latestDate: Date | null;
  missingRanges: { start: Date; end: Date }[];
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalDays: 0,
      coveredDays: 0,
      missingDays: 0,
      coveragePercent: 0,
      earliestDate: null,
      latestDate: null,
      missingRanges: [],
    };
  }
  
  // Generate expected days
  const spine = generateDaySpine(startDate, endDate);
  const totalDays = spine.length;
  
  // Get actual data points
  const regimeFilter = regimeTag ? sql`AND regimeTag = ${regimeTag}` : sql``;
  const [rows] = await db.execute(sql`
    SELECT date FROM time_series 
    WHERE indicatorCode = ${indicatorCode}
      AND date >= ${startDate.toISOString().split('T')[0]}
      AND date <= ${endDate.toISOString().split('T')[0]}
      ${regimeFilter}
    ORDER BY date ASC
  `) as any;
  
  const coveredDates = new Set((rows || []).map((r: any) => 
    new Date(r.date).toISOString().split('T')[0]
  ));
  
  const coveredDays = coveredDates.size;
  const missingDays = totalDays - coveredDays;
  const coveragePercent = totalDays > 0 ? (coveredDays / totalDays) * 100 : 0;
  
  // Find missing ranges
  const missingRanges: { start: Date; end: Date }[] = [];
  let rangeStart: Date | null = null;
  
  for (const entry of spine) {
    const dateStr = entry.date.toISOString().split('T')[0];
    const isMissing = !coveredDates.has(dateStr);
    
    if (isMissing && !rangeStart) {
      rangeStart = entry.date;
    } else if (!isMissing && rangeStart) {
      const prevDate = new Date(entry.date);
      prevDate.setDate(prevDate.getDate() - 1);
      missingRanges.push({ start: rangeStart, end: prevDate });
      rangeStart = null;
    }
  }
  
  if (rangeStart) {
    missingRanges.push({ start: rangeStart, end: endDate });
  }
  
  // Get earliest and latest dates
  const [dateRange] = await db.execute(sql`
    SELECT MIN(date) as earliest, MAX(date) as latest 
    FROM time_series 
    WHERE indicatorCode = ${indicatorCode}
      ${regimeFilter}
  `) as any;
  
  const earliest = dateRange?.[0]?.earliest ? new Date(dateRange[0].earliest) : null;
  const latest = dateRange?.[0]?.latest ? new Date(dateRange[0].latest) : null;
  
  return {
    totalDays,
    coveredDays,
    missingDays,
    coveragePercent,
    earliestDate: earliest,
    latestDate: latest,
    missingRanges,
  };
}
