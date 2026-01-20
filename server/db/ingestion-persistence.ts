/**
 * YETO Ingestion Persistence Layer
 * 
 * Stores ingestion results, data snapshots, and historical records
 * - Ingestion jobs and status
 * - Data snapshots with timestamps
 * - Error logs and retry tracking
 * - Data gap tracking
 */

import { sql } from 'drizzle-orm';

// Database connection will be injected at runtime
let dbConnection: any = null;

export function setDatabase(db: any) {
  dbConnection = db;
}

interface IngestionJob {
  id: string;
  sourceId: string;
  sourceName: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  startTime: Date;
  endTime?: Date;
  dataPoints: number;
  errorMessage?: string;
  retryCount: number;
}

interface DataSnapshot {
  id: string;
  sourceId: string;
  timestamp: Date;
  dataCount: number;
  dataHash: string;
  storageKey: string;
  metadata: Record<string, any>;
}

interface DataGap {
  id: string;
  sourceId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
}

/**
 * Create ingestion job record
 */
export async function createIngestionJob(
  sourceId: string,
  sourceName: string
): Promise<IngestionJob> {
  const jobId = `job-${sourceId}-${Date.now()}`;

  const job: IngestionJob = {
    id: jobId,
    sourceId,
    sourceName,
    status: 'PENDING',
    startTime: new Date(),
    dataPoints: 0,
    retryCount: 0,
  };

  try {
    // Insert into database
    if (!dbConnection) throw new Error('Database not initialized');
    await dbConnection.execute(
      sql`
        INSERT INTO ingestion_jobs (
          id, source_id, source_name, status, start_time, data_points, retry_count
        ) VALUES (
          ${jobId}, ${sourceId}, ${sourceName}, 'PENDING', ${new Date()}, 0, 0
        )
      `
    );

    console.log(`✅ Created ingestion job: ${jobId}`);
  } catch (error) {
    console.error('Failed to create ingestion job:', error);
  }

  return job;
}

/**
 * Update ingestion job status
 */
export async function updateIngestionJob(
  jobId: string,
  status: 'RUNNING' | 'SUCCESS' | 'FAILED',
  dataPoints: number,
  errorMessage?: string
): Promise<void> {
  try {
    const endTime = new Date();

    if (!dbConnection) throw new Error('Database not initialized');
    await dbConnection.execute(
      sql`
        UPDATE ingestion_jobs
        SET status = ${status},
            end_time = ${endTime},
            data_points = ${dataPoints},
            error_message = ${errorMessage || null}
        WHERE id = ${jobId}
      `
    );

    console.log(`✅ Updated ingestion job ${jobId}: ${status}`);
  } catch (error) {
    console.error('Failed to update ingestion job:', error);
  }
}

/**
 * Create data snapshot
 */
export async function createDataSnapshot(
  sourceId: string,
  dataCount: number,
  dataHash: string,
  storageKey: string,
  metadata: Record<string, any> = {}
): Promise<DataSnapshot> {
  const snapshotId = `snap-${sourceId}-${Date.now()}`;

  const snapshot: DataSnapshot = {
    id: snapshotId,
    sourceId,
    timestamp: new Date(),
    dataCount,
    dataHash,
    storageKey,
    metadata,
  };

  try {
    if (!dbConnection) throw new Error('Database not initialized');
    await dbConnection.execute(
      sql`
        INSERT INTO data_snapshots (
          id, source_id, timestamp, data_count, data_hash, storage_key, metadata
        ) VALUES (
          ${snapshotId}, ${sourceId}, ${new Date()}, ${dataCount}, ${dataHash}, ${storageKey}, ${JSON.stringify(metadata)}
        )
      `
    );

    console.log(`✅ Created data snapshot: ${snapshotId}`);
  } catch (error) {
    console.error('Failed to create data snapshot:', error);
  }

  return snapshot;
}

/**
 * Get latest snapshot for source
 */
export async function getLatestSnapshot(sourceId: string): Promise<DataSnapshot | null> {
  try {
    if (!dbConnection) throw new Error('Database not initialized');
    const result = await dbConnection.execute(
      sql`
        SELECT * FROM data_snapshots
        WHERE source_id = ${sourceId}
        ORDER BY timestamp DESC
        LIMIT 1
      `
    );

    if (result.rows && result.rows.length > 0) {
      const row = result.rows[0] as any;
      return {
        id: row.id,
        sourceId: row.source_id,
        timestamp: new Date(row.timestamp),
        dataCount: row.data_count,
        dataHash: row.data_hash,
        storageKey: row.storage_key,
        metadata: JSON.parse(row.metadata || '{}'),
      };
    }

    return null;
  } catch (error) {
    console.error('Failed to get latest snapshot:', error);
    return null;
  }
}

/**
 * Record data gap
 */
export async function recordDataGap(
  sourceId: string,
  startDate: Date,
  endDate: Date,
  reason: string,
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM'
): Promise<DataGap> {
  const gapId = `gap-${sourceId}-${Date.now()}`;

  const gap: DataGap = {
    id: gapId,
    sourceId,
    startDate,
    endDate,
    reason,
    severity,
    status: 'OPEN',
  };

  try {
    if (!dbConnection) throw new Error('Database not initialized');
    await dbConnection.execute(
      sql`
        INSERT INTO data_gaps (
          id, source_id, start_date, end_date, reason, severity, status
        ) VALUES (
          ${gapId}, ${sourceId}, ${startDate}, ${endDate}, ${reason}, ${severity}, 'OPEN'
        )
      `
    );

    console.log(`✅ Recorded data gap: ${gapId}`);
  } catch (error) {
    console.error('Failed to record data gap:', error);
  }

  return gap;
}

/**
 * Get data gaps for source
 */
export async function getDataGaps(sourceId: string): Promise<DataGap[]> {
  try {
    if (!dbConnection) throw new Error('Database not initialized');
    const result = await dbConnection.execute(
      sql`
        SELECT * FROM data_gaps
        WHERE source_id = ${sourceId} AND status = 'OPEN'
        ORDER BY severity DESC, start_date DESC
      `
    );

    return (result.rows || []).map((row: any) => ({
      id: row.id,
      sourceId: row.source_id,
      startDate: new Date(row.start_date),
      endDate: new Date(row.end_date),
      reason: row.reason,
      severity: row.severity,
      status: row.status,
    }));
  } catch (error) {
    console.error('Failed to get data gaps:', error);
    return [];
  }
}

/**
 * Get ingestion statistics
 */
export async function getIngestionStats(): Promise<{
  totalJobs: number;
  successfulJobs: number;
  failedJobs: number;
  totalDataPoints: number;
  averageLatency: number;
  lastUpdate: Date;
}> {
  try {
    if (!dbConnection) throw new Error('Database not initialized');
    const result = await dbConnection.execute(
      sql`
        SELECT
          COUNT(*) as total_jobs,
          SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) as successful_jobs,
          SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed_jobs,
          SUM(data_points) as total_data_points,
          AVG(EXTRACT(EPOCH FROM (end_time - start_time))) as average_latency,
          MAX(end_time) as last_update
        FROM ingestion_jobs
        WHERE end_time IS NOT NULL
      `
    );

    const row = result.rows?.[0] as any;

    return {
      totalJobs: parseInt(row?.total_jobs || '0'),
      successfulJobs: parseInt(row?.successful_jobs || '0'),
      failedJobs: parseInt(row?.failed_jobs || '0'),
      totalDataPoints: parseInt(row?.total_data_points || '0'),
      averageLatency: parseFloat(row?.average_latency || '0'),
      lastUpdate: row?.last_update ? new Date(row.last_update) : new Date(),
    };
  } catch (error) {
    console.error('Failed to get ingestion stats:', error);
    return {
      totalJobs: 0,
      successfulJobs: 0,
      failedJobs: 0,
      totalDataPoints: 0,
      averageLatency: 0,
      lastUpdate: new Date(),
    };
  }
}

/**
 * Get recent ingestion jobs
 */
export async function getRecentJobs(limit: number = 50): Promise<IngestionJob[]> {
  try {
    if (!dbConnection) throw new Error('Database not initialized');
    const result = await dbConnection.execute(
      sql`
        SELECT * FROM ingestion_jobs
        ORDER BY start_time DESC
        LIMIT ${limit}
      `
    );

    return (result.rows || []).map((row: any) => ({
      id: row.id,
      sourceId: row.source_id,
      sourceName: row.source_name,
      status: row.status,
      startTime: new Date(row.start_time),
      endTime: row.end_time ? new Date(row.end_time) : undefined,
      dataPoints: row.data_points,
      errorMessage: row.error_message,
      retryCount: row.retry_count,
    }));
  } catch (error) {
    console.error('Failed to get recent jobs:', error);
    return [];
  }
}

/**
 * Cleanup old snapshots (keep last 30 days)
 */
export async function cleanupOldSnapshots(daysToKeep: number = 30): Promise<number> {
  try {
    if (!dbConnection) throw new Error('Database not initialized');
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

    const result = await dbConnection.execute(
      sql`
        DELETE FROM data_snapshots
        WHERE timestamp < ${cutoffDate}
      `
    );

    const deletedCount = result.rowsAffected || 0;
    console.log(`✅ Deleted ${deletedCount} old snapshots`);

    return deletedCount;
  } catch (error) {
    console.error('Failed to cleanup old snapshots:', error);
    return 0;
  }
}

export default {
  createIngestionJob,
  updateIngestionJob,
  createDataSnapshot,
  getLatestSnapshot,
  recordDataGap,
  getDataGaps,
  getIngestionStats,
  getRecentJobs,
  cleanupOldSnapshots,
};
