/**
 * Crash-Safe Work Queue
 * 
 * Manages ingestion_work_queue with pause/resume/retry capabilities
 * Ensures import/ingest operations can be resumed after crashes
 */

import { getDb } from '../db';
import { sql } from 'drizzle-orm';

export type JobType = 'IMPORT_REGISTRY' | 'INGEST_SOURCE' | 'INGEST_ENDPOINT' | 'INGEST_PRODUCT' | 'BACKFILL' | 'REFRESH';
export type JobState = 'PENDING' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface WorkQueueJob {
  id: number;
  jobType: JobType;
  sourceRegistryId?: number;
  endpointId?: number;
  productId?: number;
  state: JobState;
  priority: number;
  attemptCount: number;
  maxAttempts: number;
  progressJson?: {
    step?: string;
    itemsProcessed?: number;
    itemsTotal?: number;
    percentComplete?: number;
    checkpoint?: any;
  };
  lastError?: string;
  lastErrorAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Enqueue a new job
 */
export async function enqueueJob(params: {
  jobType: JobType;
  sourceRegistryId?: number;
  endpointId?: number;
  productId?: number;
  priority?: number;
  maxAttempts?: number;
}): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.execute(sql`
      INSERT INTO ingestion_work_queue (
        jobType, sourceRegistryId, endpointId, productId, state, priority, attemptCount, maxAttempts, createdAt, updatedAt
      ) VALUES (
        ${params.jobType},
        ${params.sourceRegistryId || null},
        ${params.endpointId || null},
        ${params.productId || null},
        'PENDING',
        ${params.priority || 50},
        0,
        ${params.maxAttempts || 3},
        NOW(),
        NOW()
      )
    `);

    const insertId = (result as any)[0]?.insertId;
    console.log(`[WorkQueue] Enqueued job ${insertId}: ${params.jobType}`);
    return insertId;
  } catch (error) {
    console.error('[WorkQueue] Failed to enqueue job:', error);
    return null;
  }
}

/**
 * Get next pending job (highest priority)
 */
export async function getNextPendingJob(): Promise<WorkQueueJob | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.execute(sql`
      SELECT * FROM ingestion_work_queue
      WHERE state = 'PENDING'
        AND attemptCount < maxAttempts
      ORDER BY priority DESC, createdAt ASC
      LIMIT 1
    `);

    const job = (result as any)[0]?.[0];
    return job ? mapRowToJob(job) : null;
  } catch (error) {
    console.error('[WorkQueue] Failed to get next job:', error);
    return null;
  }
}

/**
 * Mark job as running
 */
export async function markJobRunning(jobId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.execute(sql`
      UPDATE ingestion_work_queue
      SET state = 'RUNNING', startedAt = NOW(), attemptCount = attemptCount + 1, updatedAt = NOW()
      WHERE id = ${jobId}
    `);
    return true;
  } catch (error) {
    console.error('[WorkQueue] Failed to mark job running:', error);
    return false;
  }
}

/**
 * Update job progress (checkpoint)
 */
export async function updateJobProgress(
  jobId: number,
  progress: {
    step?: string;
    itemsProcessed?: number;
    itemsTotal?: number;
    percentComplete?: number;
    checkpoint?: any;
  }
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.execute(sql`
      UPDATE ingestion_work_queue
      SET progressJson = ${JSON.stringify(progress)}, updatedAt = NOW()
      WHERE id = ${jobId}
    `);
    return true;
  } catch (error) {
    console.error('[WorkQueue] Failed to update progress:', error);
    return false;
  }
}

/**
 * Mark job as completed
 */
export async function markJobCompleted(jobId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.execute(sql`
      UPDATE ingestion_work_queue
      SET state = 'COMPLETED', completedAt = NOW(), updatedAt = NOW()
      WHERE id = ${jobId}
    `);
    console.log(`[WorkQueue] Job ${jobId} completed`);
    return true;
  } catch (error) {
    console.error('[WorkQueue] Failed to mark job completed:', error);
    return false;
  }
}

/**
 * Mark job as failed (with retry logic)
 */
export async function markJobFailed(
  jobId: number,
  error: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Get current attempt count
    const jobResult = await db.execute(sql`
      SELECT attemptCount, maxAttempts FROM ingestion_work_queue WHERE id = ${jobId}
    `);
    const job = (jobResult as any)[0]?.[0];

    if (!job) return false;

    // If attempts exhausted, mark as FAILED permanently
    const finalState = job.attemptCount >= job.maxAttempts ? 'FAILED' : 'PENDING';

    await db.execute(sql`
      UPDATE ingestion_work_queue
      SET state = ${finalState}, lastError = ${error}, lastErrorAt = NOW(), updatedAt = NOW()
      WHERE id = ${jobId}
    `);

    if (finalState === 'FAILED') {
      console.log(`[WorkQueue] Job ${jobId} failed permanently after ${job.attemptCount} attempts`);
    } else {
      console.log(`[WorkQueue] Job ${jobId} failed (attempt ${job.attemptCount}/${job.maxAttempts}), will retry`);
    }

    return true;
  } catch (error) {
    console.error('[WorkQueue] Failed to mark job failed:', error);
    return false;
  }
}

/**
 * Pause a running job
 */
export async function pauseJob(jobId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.execute(sql`
      UPDATE ingestion_work_queue
      SET state = 'PAUSED', updatedAt = NOW()
      WHERE id = ${jobId} AND state = 'RUNNING'
    `);
    console.log(`[WorkQueue] Job ${jobId} paused`);
    return true;
  } catch (error) {
    console.error('[WorkQueue] Failed to pause job:', error);
    return false;
  }
}

/**
 * Resume a paused job
 */
export async function resumeJob(jobId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.execute(sql`
      UPDATE ingestion_work_queue
      SET state = 'PENDING', updatedAt = NOW()
      WHERE id = ${jobId} AND state = 'PAUSED'
    `);
    console.log(`[WorkQueue] Job ${jobId} resumed`);
    return true;
  } catch (error) {
    console.error('[WorkQueue] Failed to resume job:', error);
    return false;
  }
}

/**
 * Get running jobs (for recovery after crash)
 */
export async function getStuckRunningJobs(): Promise<WorkQueueJob[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    // Jobs running for more than 1 hour are considered stuck
    const result = await db.execute(sql`
      SELECT * FROM ingestion_work_queue
      WHERE state = 'RUNNING'
        AND startedAt < DATE_SUB(NOW(), INTERVAL 1 HOUR)
      ORDER BY startedAt ASC
    `);

    const jobs = (result as any)[0] || [];
    return jobs.map(mapRowToJob);
  } catch (error) {
    console.error('[WorkQueue] Failed to get stuck jobs:', error);
    return [];
  }
}

/**
 * Reset stuck jobs to PENDING for retry
 */
export async function resetStuckJobs(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  try {
    const result = await db.execute(sql`
      UPDATE ingestion_work_queue
      SET state = 'PENDING', updatedAt = NOW()
      WHERE state = 'RUNNING'
        AND startedAt < DATE_SUB(NOW(), INTERVAL 1 HOUR)
        AND attemptCount < maxAttempts
    `);

    const affectedRows = (result as any)[0]?.affectedRows || 0;
    if (affectedRows > 0) {
      console.log(`[WorkQueue] Reset ${affectedRows} stuck jobs to PENDING`);
    }
    return affectedRows;
  } catch (error) {
    console.error('[WorkQueue] Failed to reset stuck jobs:', error);
    return 0;
  }
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<{
  pending: number;
  running: number;
  paused: number;
  completed: number;
  failed: number;
  totalJobs: number;
}> {
  const db = await getDb();
  if (!db) {
    return { pending: 0, running: 0, paused: 0, completed: 0, failed: 0, totalJobs: 0 };
  }

  try {
    const result = await db.execute(sql`
      SELECT 
        state,
        COUNT(*) as count
      FROM ingestion_work_queue
      GROUP BY state
    `);

    const stats: Record<string, number> = {};
    for (const row of (result as any)[0] || []) {
      stats[row.state.toLowerCase()] = row.count;
    }

    return {
      pending: stats.pending || 0,
      running: stats.running || 0,
      paused: stats.paused || 0,
      completed: stats.completed || 0,
      failed: stats.failed || 0,
      totalJobs: Object.values(stats).reduce((a, b) => a + b, 0)
    };
  } catch (error) {
    console.error('[WorkQueue] Failed to get queue stats:', error);
    return { pending: 0, running: 0, paused: 0, completed: 0, failed: 0, totalJobs: 0 };
  }
}

function mapRowToJob(row: any): WorkQueueJob {
  return {
    id: row.id,
    jobType: row.jobType,
    sourceRegistryId: row.sourceRegistryId,
    endpointId: row.endpointId,
    productId: row.productId,
    state: row.state,
    priority: row.priority,
    attemptCount: row.attemptCount,
    maxAttempts: row.maxAttempts,
    progressJson: typeof row.progressJson === 'string' ? JSON.parse(row.progressJson) : row.progressJson,
    lastError: row.lastError,
    lastErrorAt: row.lastErrorAt ? new Date(row.lastErrorAt) : undefined,
    startedAt: row.startedAt ? new Date(row.startedAt) : undefined,
    completedAt: row.completedAt ? new Date(row.completedAt) : undefined,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt)
  };
}
