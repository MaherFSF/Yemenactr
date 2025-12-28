/**
 * YETO Data Pipeline - Ingestion Jobs
 * Manages scheduled data ingestion with rate limiting and error handling
 */

import { sourceRegistry, DataSourceConfig } from './sourceRegistry';

export interface IngestionJob {
  id: string;
  sourceId: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  startedAt?: Date;
  completedAt?: Date;
  recordsProcessed: number;
  recordsInserted: number;
  recordsUpdated: number;
  recordsSkipped: number;
  errors: string[];
  duration?: number;
  retryCount: number;
}

export interface RateLimiter {
  sourceId: string;
  requestsThisMinute: number;
  lastReset: Date;
  blocked: boolean;
}

class IngestionJobManager {
  private jobs: Map<string, IngestionJob> = new Map();
  private rateLimiters: Map<string, RateLimiter> = new Map();
  private runningJobs: Set<string> = new Set();
  
  /**
   * Create a new ingestion job
   */
  createJob(sourceId: string): IngestionJob {
    const jobId = `job_${sourceId}_${Date.now()}`;
    const job: IngestionJob = {
      id: jobId,
      sourceId,
      status: 'pending',
      recordsProcessed: 0,
      recordsInserted: 0,
      recordsUpdated: 0,
      recordsSkipped: 0,
      errors: [],
      retryCount: 0
    };
    this.jobs.set(jobId, job);
    return job;
  }
  
  /**
   * Start a job
   */
  startJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'pending') return false;
    
    // Check rate limit
    if (this.isRateLimited(job.sourceId)) {
      job.errors.push('Rate limited - waiting for reset');
      return false;
    }
    
    job.status = 'running';
    job.startedAt = new Date();
    this.runningJobs.add(jobId);
    this.incrementRateLimit(job.sourceId);
    
    return true;
  }
  
  /**
   * Complete a job
   */
  completeJob(jobId: string, success: boolean, stats?: Partial<IngestionJob>): void {
    const job = this.jobs.get(jobId);
    if (!job) return;
    
    job.status = success ? 'success' : 'failed';
    job.completedAt = new Date();
    job.duration = job.startedAt 
      ? job.completedAt.getTime() - job.startedAt.getTime() 
      : 0;
    
    if (stats) {
      Object.assign(job, stats);
    }
    
    this.runningJobs.delete(jobId);
    
    // Update source registry
    sourceRegistry.updateSourceStatus(
      job.sourceId, 
      success, 
      job.recordsInserted + job.recordsUpdated
    );
  }
  
  /**
   * Check if source is rate limited
   */
  isRateLimited(sourceId: string): boolean {
    const source = sourceRegistry.getSource(sourceId);
    if (!source) return true;
    
    let limiter = this.rateLimiters.get(sourceId);
    if (!limiter) {
      limiter = {
        sourceId,
        requestsThisMinute: 0,
        lastReset: new Date(),
        blocked: false
      };
      this.rateLimiters.set(sourceId, limiter);
    }
    
    // Reset if minute has passed
    const now = new Date();
    if (now.getTime() - limiter.lastReset.getTime() > 60000) {
      limiter.requestsThisMinute = 0;
      limiter.lastReset = now;
      limiter.blocked = false;
    }
    
    return limiter.requestsThisMinute >= source.rateLimitPerMinute;
  }
  
  /**
   * Increment rate limit counter
   */
  private incrementRateLimit(sourceId: string): void {
    const limiter = this.rateLimiters.get(sourceId);
    if (limiter) {
      limiter.requestsThisMinute++;
    }
  }
  
  /**
   * Get job by ID
   */
  getJob(jobId: string): IngestionJob | undefined {
    return this.jobs.get(jobId);
  }
  
  /**
   * Get all jobs for a source
   */
  getJobsForSource(sourceId: string): IngestionJob[] {
    return Array.from(this.jobs.values())
      .filter(j => j.sourceId === sourceId)
      .sort((a, b) => {
        const aTime = a.startedAt?.getTime() || 0;
        const bTime = b.startedAt?.getTime() || 0;
        return bTime - aTime;
      });
  }
  
  /**
   * Get recent jobs
   */
  getRecentJobs(limit: number = 20): IngestionJob[] {
    return Array.from(this.jobs.values())
      .sort((a, b) => {
        const aTime = a.startedAt?.getTime() || 0;
        const bTime = b.startedAt?.getTime() || 0;
        return bTime - aTime;
      })
      .slice(0, limit);
  }
  
  /**
   * Get running jobs count
   */
  getRunningJobsCount(): number {
    return this.runningJobs.size;
  }
  
  /**
   * Get job statistics
   */
  getStatistics(): {
    total: number;
    running: number;
    success: number;
    failed: number;
    pending: number;
    totalRecordsProcessed: number;
    averageDuration: number;
  } {
    const jobs = Array.from(this.jobs.values());
    const completedJobs = jobs.filter(j => j.duration !== undefined);
    
    return {
      total: jobs.length,
      running: jobs.filter(j => j.status === 'running').length,
      success: jobs.filter(j => j.status === 'success').length,
      failed: jobs.filter(j => j.status === 'failed').length,
      pending: jobs.filter(j => j.status === 'pending').length,
      totalRecordsProcessed: jobs.reduce((sum, j) => sum + j.recordsProcessed, 0),
      averageDuration: completedJobs.length > 0
        ? completedJobs.reduce((sum, j) => sum + (j.duration || 0), 0) / completedJobs.length
        : 0
    };
  }
  
  /**
   * Retry failed job
   */
  retryJob(jobId: string): IngestionJob | null {
    const oldJob = this.jobs.get(jobId);
    if (!oldJob || oldJob.status !== 'failed') return null;
    
    const source = sourceRegistry.getSource(oldJob.sourceId);
    if (!source || oldJob.retryCount >= source.retryAttempts) return null;
    
    const newJob = this.createJob(oldJob.sourceId);
    newJob.retryCount = oldJob.retryCount + 1;
    
    return newJob;
  }
  
  /**
   * Cancel a pending or running job
   */
  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job || (job.status !== 'pending' && job.status !== 'running')) {
      return false;
    }
    
    job.status = 'cancelled';
    job.completedAt = new Date();
    this.runningJobs.delete(jobId);
    
    return true;
  }
}

// Singleton instance
export const ingestionJobManager = new IngestionJobManager();

/**
 * Schedule ingestion for all due sources
 */
export function scheduleDueIngestions(): IngestionJob[] {
  const dueSources = sourceRegistry.getSourcesDueForRefresh();
  const jobs: IngestionJob[] = [];
  
  for (const source of dueSources) {
    const job = ingestionJobManager.createJob(source.id);
    jobs.push(job);
  }
  
  return jobs;
}

/**
 * Process a single ingestion job
 */
export async function processIngestionJob(
  jobId: string,
  fetchFn: () => Promise<{ records: unknown[]; errors?: string[] }>
): Promise<IngestionJob | null> {
  const job = ingestionJobManager.getJob(jobId);
  if (!job) return null;
  
  if (!ingestionJobManager.startJob(jobId)) {
    return job;
  }
  
  try {
    const result = await fetchFn();
    
    ingestionJobManager.completeJob(jobId, true, {
      recordsProcessed: result.records.length,
      recordsInserted: result.records.length,
      errors: result.errors || []
    });
  } catch (error) {
    ingestionJobManager.completeJob(jobId, false, {
      errors: [error instanceof Error ? error.message : 'Unknown error']
    });
  }
  
  return ingestionJobManager.getJob(jobId) || null;
}
