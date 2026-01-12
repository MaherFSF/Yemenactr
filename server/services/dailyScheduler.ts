/**
 * Daily Data Refresh Scheduler
 * Manages scheduled data ingestion from all connectors
 */

import { getDb } from "../db";
import { schedulerJobs, schedulerRunHistory } from "../../drizzle/schema";
import { eq, desc, and, lte } from "drizzle-orm";

// Import all connectors
import { fetchWorldBankData } from "../connectors/worldBankConnector";
import { fetchOchaFtsData } from "../connectors/ochaFtsConnector";
import { fetchHdxData } from "../connectors/hdxCkanConnector";
import { fetchSanctionsData } from "../connectors/sanctionsConnector";
import { fetchReliefWebData } from "../connectors/reliefWebConnector";
import { fetchFewsNetData } from "../connectors/fewsNetConnector";
import { ingestUNHCRData as fetchUnhcrData } from "../connectors/unhcrConnector";
import { ingestWHOData as fetchWhoData } from "../connectors/whoConnector";
import { ingestUNICEFData as fetchUnicefData } from "../connectors/unicefConnector";
import { ingestWFPData as fetchWfpData } from "../connectors/wfpConnector";
import { ingestUNDPData as fetchUndpData } from "../connectors/undpConnector";
import { ingestIATIData as fetchIatiData } from "../connectors/iatiConnector";
import { ingestCBYData as fetchCbyData } from "../connectors/cbyConnector";

// Import signal detector
import { runSignalDetection } from "./signalDetector";

// ============================================
// Types
// ============================================

export interface SchedulerJobConfig {
  id: string;
  name: string;
  type: 'data_refresh' | 'signal_detection' | 'publication' | 'backup' | 'cleanup';
  cronExpression: string;
  description: string;
  enabled: boolean;
  connector?: string;
  fetchFn?: () => Promise<{ success: boolean; recordsIngested: number; errors: string[] }>;
}

export interface JobRunResult {
  jobId: string;
  jobName: string;
  status: 'success' | 'failed' | 'skipped';
  startedAt: Date;
  completedAt: Date;
  duration: number;
  recordsProcessed: number;
  error?: string;
}

// ============================================
// Default Job Configurations
// ============================================

export const DEFAULT_JOBS: SchedulerJobConfig[] = [
  // Daily connectors (run at 6 AM UTC)
  {
    id: 'world_bank_daily',
    name: 'World Bank WDI Refresh',
    type: 'data_refresh',
    cronExpression: '0 0 6 * * *',
    description: 'Fetch latest World Bank indicators (GDP, poverty, trade)',
    enabled: true,
    connector: 'world_bank',
    fetchFn: () => fetchWorldBankData(new Date().getFullYear() - 1, new Date().getFullYear()),
  },
  {
    id: 'unhcr_daily',
    name: 'UNHCR Refugee Data Refresh',
    type: 'data_refresh',
    cronExpression: '0 10 6 * * *',
    description: 'Fetch latest UNHCR refugee and IDP statistics',
    enabled: true,
    connector: 'unhcr',
    fetchFn: () => fetchUnhcrData(new Date().getFullYear()),
  },
  {
    id: 'who_daily',
    name: 'WHO Health Indicators Refresh',
    type: 'data_refresh',
    cronExpression: '0 20 6 * * *',
    description: 'Fetch latest WHO health indicators',
    enabled: true,
    connector: 'who',
    fetchFn: () => fetchWhoData(new Date().getFullYear()),
  },
  {
    id: 'unicef_daily',
    name: 'UNICEF Child Welfare Refresh',
    type: 'data_refresh',
    cronExpression: '0 30 6 * * *',
    description: 'Fetch latest UNICEF child welfare indicators',
    enabled: true,
    connector: 'unicef',
    fetchFn: () => fetchUnicefData(new Date().getFullYear()),
  },
  {
    id: 'wfp_daily',
    name: 'WFP Food Security Refresh',
    type: 'data_refresh',
    cronExpression: '0 40 6 * * *',
    description: 'Fetch latest WFP food security data',
    enabled: true,
    connector: 'wfp',
    fetchFn: () => fetchWfpData(new Date().getFullYear()),
  },
  {
    id: 'undp_daily',
    name: 'UNDP Development Indicators Refresh',
    type: 'data_refresh',
    cronExpression: '0 50 6 * * *',
    description: 'Fetch latest UNDP human development indicators',
    enabled: true,
    connector: 'undp',
    fetchFn: () => fetchUndpData(new Date().getFullYear()),
  },
  {
    id: 'iati_daily',
    name: 'IATI Aid Transparency Refresh',
    type: 'data_refresh',
    cronExpression: '0 0 7 * * *',
    description: 'Fetch latest IATI aid flow data',
    enabled: true,
    connector: 'iati',
    fetchFn: () => fetchIatiData(new Date().getFullYear()),
  },
  {
    id: 'cby_daily',
    name: 'Central Bank of Yemen Refresh',
    type: 'data_refresh',
    cronExpression: '0 10 7 * * *',
    description: 'Fetch latest CBY exchange rates and monetary data',
    enabled: true,
    connector: 'cby',
    fetchFn: () => fetchCbyData(new Date().getFullYear()),
  },
  {
    id: 'hdx_daily',
    name: 'HDX CKAN Data Refresh',
    type: 'data_refresh',
    cronExpression: '0 20 7 * * *',
    description: 'Fetch latest HDX humanitarian datasets',
    enabled: true,
    connector: 'hdx',
    fetchFn: fetchHdxData,
  },
  {
    id: 'sanctions_daily',
    name: 'Sanctions Lists Refresh',
    type: 'data_refresh',
    cronExpression: '0 30 7 * * *',
    description: 'Fetch latest OFAC and EU sanctions data',
    enabled: true,
    connector: 'sanctions',
    fetchFn: fetchSanctionsData,
  },
  {
    id: 'reliefweb_daily',
    name: 'ReliefWeb Updates Refresh',
    type: 'data_refresh',
    cronExpression: '0 40 7 * * *',
    description: 'Fetch latest ReliefWeb humanitarian reports',
    enabled: true,
    connector: 'reliefweb',
    fetchFn: fetchReliefWebData,
  },
  {
    id: 'fews_net_daily',
    name: 'FEWS NET Food Security Refresh',
    type: 'data_refresh',
    cronExpression: '0 50 7 * * *',
    description: 'Fetch latest FEWS NET IPC classifications',
    enabled: true,
    connector: 'fews_net',
    fetchFn: () => fetchFewsNetData(new Date().getFullYear()),
  },
  
  // Signal detection (run every 4 hours)
  {
    id: 'signal_detection',
    name: 'Signal Detection & Alerts',
    type: 'signal_detection',
    cronExpression: '0 0 */4 * * *',
    description: 'Run signal detection and generate alerts for threshold breaches',
    enabled: true,
  },
  
  // Connector health check (run daily at 7 AM UTC)
  {
    id: 'connector_health_check',
    name: 'Connector Health Check',
    type: 'backup', // Using backup type for maintenance tasks
    cronExpression: '0 0 7 * * *',
    description: 'Check connector health and send alerts for failures or stale data (>7 days)',
    enabled: true,
  },
];

// ============================================
// Scheduler Functions
// ============================================

/**
 * Initialize scheduler jobs in the database
 */
export async function initializeSchedulerJobs(): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  console.log('[Scheduler] Initializing scheduler jobs...');
  
  for (const job of DEFAULT_JOBS) {
    try {
      // Check if job exists
      const existing = await db.select()
        .from(schedulerJobs)
        .where(eq(schedulerJobs.jobName, job.id))
        .limit(1);
      
      if (existing.length === 0) {
        // Calculate next run time
        const nextRun = calculateNextRun(job.cronExpression);
        
        await db.insert(schedulerJobs).values({
          jobName: job.id,
          jobType: job.type,
          cronExpression: job.cronExpression,
          isEnabled: job.enabled,
          nextRunAt: nextRun,
          config: {
            name: job.name,
            description: job.description,
            connector: job.connector,
          },
        });
        
        console.log(`[Scheduler] Created job: ${job.name}`);
      }
    } catch (error) {
      console.error(`[Scheduler] Error initializing job ${job.id}:`, error);
    }
  }
  
  console.log('[Scheduler] Initialization complete');
}

/**
 * Calculate the next run time based on cron expression
 */
function calculateNextRun(cronExpression: string): Date {
  // Simple implementation - parse cron and calculate next run
  // Format: seconds minutes hours day month weekday
  const parts = cronExpression.split(' ');
  const now = new Date();
  
  // For simplicity, just add the appropriate interval
  if (cronExpression.includes('*/4')) {
    // Every 4 hours
    const next = new Date(now);
    next.setHours(Math.ceil(now.getHours() / 4) * 4, 0, 0, 0);
    if (next <= now) next.setHours(next.getHours() + 4);
    return next;
  } else {
    // Daily at specific time
    const hour = parseInt(parts[2]) || 6;
    const minute = parseInt(parts[1]) || 0;
    const next = new Date(now);
    next.setHours(hour, minute, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    return next;
  }
}

/**
 * Run a specific job
 */
export async function runJob(jobId: string): Promise<JobRunResult> {
  const startedAt = new Date();
  const job = DEFAULT_JOBS.find(j => j.id === jobId);
  
  if (!job) {
    return {
      jobId,
      jobName: jobId,
      status: 'failed',
      startedAt,
      completedAt: new Date(),
      duration: 0,
      recordsProcessed: 0,
      error: 'Job not found',
    };
  }
  
  console.log(`[Scheduler] Running job: ${job.name}`);
  
  const db = await getDb();
  let recordsProcessed = 0;
  let error: string | undefined;
  let status: 'success' | 'failed' = 'success';
  
  try {
    // Update job status to running
    if (db) {
      await db.update(schedulerJobs)
        .set({ lastRunStatus: 'running', lastRunAt: startedAt })
        .where(eq(schedulerJobs.jobName, jobId));
    }
    
    // Execute the job
    if (job.type === 'signal_detection') {
      const result = await runSignalDetection();
      recordsProcessed = result.signalsDetected;
    } else if (job.id === 'connector_health_check') {
      // Import and run health check
      const { runHealthCheckAndAlert } = await import('./connectorHealthAlerts');
      const result = await runHealthCheckAndAlert();
      recordsProcessed = result.alertsSent;
    } else if (job.fetchFn) {
      const result = await job.fetchFn();
      recordsProcessed = result.recordsIngested;
      if (!result.success && result.errors.length > 0) {
        error = result.errors.join('; ');
        status = 'failed';
      }
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown error';
    status = 'failed';
    console.error(`[Scheduler] Job ${job.name} failed:`, err);
  }
  
  const completedAt = new Date();
  const duration = completedAt.getTime() - startedAt.getTime();
  
  // Update job status
  if (db) {
    try {
      const nextRun = calculateNextRun(job.cronExpression);
      
      await db.update(schedulerJobs)
        .set({
          lastRunStatus: status,
          lastRunAt: completedAt,
          lastRunDuration: duration,
          lastRunError: error || null,
          nextRunAt: nextRun,
          // runCount will be updated separately
          // failCount will be updated separately
        })
        .where(eq(schedulerJobs.jobName, jobId));
      
      // Log run history
      const jobRecord = await db.select()
        .from(schedulerJobs)
        .where(eq(schedulerJobs.jobName, jobId))
        .limit(1);
      
      if (jobRecord.length > 0) {
        await db.insert(schedulerRunHistory).values({
          jobId: jobRecord[0].id,
          jobName: jobId,
          status,
          startedAt,
          completedAt,
          duration,
          recordsProcessed,
          errorMessage: error || null,
          details: { connector: job.connector },
        });
      }
    } catch (dbError) {
      console.error('[Scheduler] Error updating job status:', dbError);
    }
  }
  
  console.log(`[Scheduler] Job ${job.name} completed: ${status}, ${recordsProcessed} records, ${duration}ms`);
  
  return {
    jobId,
    jobName: job.name,
    status,
    startedAt,
    completedAt,
    duration,
    recordsProcessed,
    error,
  };
}

/**
 * Run all due jobs
 */
export async function runDueJobs(): Promise<JobRunResult[]> {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  const results: JobRunResult[] = [];
  
  // Find jobs that are due
  const dueJobs = await db.select()
    .from(schedulerJobs)
    .where(and(
      eq(schedulerJobs.isEnabled, true),
      lte(schedulerJobs.nextRunAt, now)
    ));
  
  console.log(`[Scheduler] Found ${dueJobs.length} due jobs`);
  
  for (const job of dueJobs) {
    const result = await runJob(job.jobName);
    results.push(result);
    
    // Small delay between jobs to avoid overwhelming APIs
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  return results;
}

/**
 * Run all data refresh jobs immediately
 */
export async function runAllDataRefresh(): Promise<JobRunResult[]> {
  const results: JobRunResult[] = [];
  
  console.log('[Scheduler] Running all data refresh jobs...');
  
  for (const job of DEFAULT_JOBS.filter(j => j.type === 'data_refresh' && j.enabled)) {
    const result = await runJob(job.id);
    results.push(result);
    
    // Small delay between jobs
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Run signal detection after data refresh
  const signalResult = await runJob('signal_detection');
  results.push(signalResult);
  
  return results;
}

/**
 * Get scheduler status
 */
export async function getSchedulerStatus(): Promise<{
  totalJobs: number;
  enabledJobs: number;
  lastRunAt: Date | null;
  nextRunAt: Date | null;
  jobs: Array<{
    id: string;
    name: string;
    type: string;
    enabled: boolean;
    lastRunAt: Date | null;
    lastRunStatus: string | null;
    nextRunAt: Date | null;
  }>;
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalJobs: DEFAULT_JOBS.length,
      enabledJobs: DEFAULT_JOBS.filter(j => j.enabled).length,
      lastRunAt: null,
      nextRunAt: null,
      jobs: DEFAULT_JOBS.map(j => ({
        id: j.id,
        name: j.name,
        type: j.type,
        enabled: j.enabled,
        lastRunAt: null,
        lastRunStatus: null,
        nextRunAt: null,
      })),
    };
  }
  
  const jobs = await db.select().from(schedulerJobs).orderBy(schedulerJobs.jobName);
  
  const enabledJobs = jobs.filter(j => j.isEnabled);
  const lastRun = jobs.reduce((latest, j) => {
    if (!j.lastRunAt) return latest;
    if (!latest) return j.lastRunAt;
    return j.lastRunAt > latest ? j.lastRunAt : latest;
  }, null as Date | null);
  
  const nextRun = enabledJobs.reduce((earliest, j) => {
    if (!j.nextRunAt) return earliest;
    if (!earliest) return j.nextRunAt;
    return j.nextRunAt < earliest ? j.nextRunAt : earliest;
  }, null as Date | null);
  
  return {
    totalJobs: jobs.length,
    enabledJobs: enabledJobs.length,
    lastRunAt: lastRun,
    nextRunAt: nextRun,
    jobs: jobs.map(j => ({
      id: j.jobName,
      name: (j.config as any)?.name || j.jobName,
      type: j.jobType,
      enabled: j.isEnabled,
      lastRunAt: j.lastRunAt,
      lastRunStatus: j.lastRunStatus,
      nextRunAt: j.nextRunAt,
    })),
  };
}

/**
 * Get recent run history
 */
export async function getRunHistory(limit: number = 50): Promise<Array<{
  id: number;
  jobName: string;
  status: string;
  startedAt: Date;
  duration: number | null;
  recordsProcessed: number;
  error: string | null;
}>> {
  const db = await getDb();
  if (!db) return [];
  
  const history = await db.select()
    .from(schedulerRunHistory)
    .orderBy(desc(schedulerRunHistory.startedAt))
    .limit(limit);
  
  return history.map(h => ({
    id: h.id,
    jobName: h.jobName,
    status: h.status,
    startedAt: h.startedAt,
    duration: h.duration,
    recordsProcessed: h.recordsProcessed,
    error: h.errorMessage,
  }));
}

/**
 * Enable or disable a job
 */
export async function setJobEnabled(jobId: string, enabled: boolean): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  await db.update(schedulerJobs)
    .set({ isEnabled: enabled })
    .where(eq(schedulerJobs.jobName, jobId));
  
  return true;
}

// Export for use in routers
export const dailyScheduler = {
  initialize: initializeSchedulerJobs,
  runJob,
  runDueJobs,
  runAll: runAllDataRefresh,
  getStatus: getSchedulerStatus,
  getHistory: getRunHistory,
  setEnabled: setJobEnabled,
  jobs: DEFAULT_JOBS,
};
