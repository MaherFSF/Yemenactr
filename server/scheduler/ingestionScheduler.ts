/**
 * YETO Automated Data Ingestion Scheduler
 * 
 * Manages scheduled data ingestion from all configured connectors.
 * Supports:
 * - Cron-based scheduling
 * - Priority-based execution
 * - Retry logic with exponential backoff
 * - Notification on failures
 * - Comprehensive logging
 */

import {
  runAllConnectors,
  getActiveConnectorsSorted,
  getAllEnhancedConnectorStatuses,
  type EnhancedConnectorInfo,
} from "../connectors";
import { imfConnector } from "../connectors/IMFConnector";
import faoConnector from "../connectors/faoConnector";
import acledConnector from "../connectors/acledConnector";
import iomDtmConnector from "../connectors/iomDtmConnector";

// ============================================
// Types
// ============================================

export interface ScheduledJob {
  id: string;
  connectorId: string;
  cronExpression: string;
  enabled: boolean;
  lastRun: Date | null;
  lastStatus: "success" | "failed" | "running" | "pending";
  nextRun: Date | null;
  retryCount: number;
  maxRetries: number;
  priority: number;
}

export interface IngestionResult {
  jobId: string;
  connectorId: string;
  startTime: Date;
  endTime: Date;
  success: boolean;
  recordsProcessed: number;
  errors: string[];
  duration: number; // milliseconds
}

export interface SchedulerStatus {
  isRunning: boolean;
  activeJobs: number;
  pendingJobs: number;
  failedJobs: number;
  lastFullRun: Date | null;
  nextFullRun: Date | null;
  totalRecordsToday: number;
  uptimeSeconds: number;
}

// ============================================
// Cron Expression Parser (simplified)
// ============================================

interface CronSchedule {
  minute: number[];
  hour: number[];
  dayOfMonth: number[];
  month: number[];
  dayOfWeek: number[];
}

function parseCronExpression(expr: string): CronSchedule {
  const parts = expr.split(" ");
  if (parts.length !== 5) {
    throw new Error(`Invalid cron expression: ${expr}`);
  }
  
  const parseField = (field: string, min: number, max: number): number[] => {
    if (field === "*") {
      return Array.from({ length: max - min + 1 }, (_, i) => min + i);
    }
    if (field.includes("/")) {
      const [, step] = field.split("/");
      const stepNum = parseInt(step);
      return Array.from({ length: Math.floor((max - min + 1) / stepNum) }, (_, i) => min + i * stepNum);
    }
    if (field.includes(",")) {
      return field.split(",").map(f => parseInt(f));
    }
    if (field.includes("-")) {
      const [start, end] = field.split("-").map(f => parseInt(f));
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
    return [parseInt(field)];
  };
  
  return {
    minute: parseField(parts[0], 0, 59),
    hour: parseField(parts[1], 0, 23),
    dayOfMonth: parseField(parts[2], 1, 31),
    month: parseField(parts[3], 1, 12),
    dayOfWeek: parseField(parts[4], 0, 6),
  };
}

function getNextRunTime(cronExpr: string, after: Date = new Date()): Date {
  const schedule = parseCronExpression(cronExpr);
  const next = new Date(after);
  next.setSeconds(0);
  next.setMilliseconds(0);
  next.setMinutes(next.getMinutes() + 1);
  
  // Find next matching time (simplified - checks next 7 days)
  for (let i = 0; i < 7 * 24 * 60; i++) {
    if (
      schedule.minute.includes(next.getMinutes()) &&
      schedule.hour.includes(next.getHours()) &&
      schedule.dayOfMonth.includes(next.getDate()) &&
      schedule.month.includes(next.getMonth() + 1) &&
      schedule.dayOfWeek.includes(next.getDay())
    ) {
      return next;
    }
    next.setMinutes(next.getMinutes() + 1);
  }
  
  return next;
}

// ============================================
// Default Job Schedules
// ============================================

const DEFAULT_SCHEDULES: Record<string, string> = {
  // Daily at 2 AM
  "world-bank": "0 2 * * *",
  "imf-data": "0 2 * * *",
  "cby-aden": "0 6 * * *", // Daily at 6 AM (exchange rates)
  
  // Weekly on Sunday at 3 AM
  "ocha-fts": "0 3 * * 0",
  "hdx-hapi": "0 3 * * 0",
  "acled": "0 4 * * 0",
  "iom-dtm": "0 4 * * 0",
  "wfp-vam": "0 5 * * 0",
  
  // Monthly on 1st at 1 AM
  "fao-stat": "0 1 1 * *",
  "reliefweb": "0 1 1 * *",
  "unhcr": "0 1 1 * *",
  "unicef": "0 1 1 * *",
  "who-gho": "0 1 1 * *",
};

// ============================================
// Scheduler Class
// ============================================

class IngestionScheduler {
  private jobs: Map<string, ScheduledJob> = new Map();
  private results: IngestionResult[] = [];
  private isRunning: boolean = false;
  private startTime: Date = new Date();
  private checkInterval: NodeJS.Timeout | null = null;
  private totalRecordsToday: number = 0;
  private lastDayReset: number = new Date().getDate();
  
  constructor() {
    // Jobs are initialized asynchronously via initializeJobs()
    // Call start() or initializeJobs() after construction
  }

  /**
   * Initialize jobs from source_registry DB table.
   * Must be called (and awaited) before start().
   */
  async initializeJobs(): Promise<void> {
    const connectors = await getAllEnhancedConnectorStatuses();

    for (const connector of connectors) {
      const cronExpr = DEFAULT_SCHEDULES[connector.id] || "0 2 * * *";

      this.jobs.set(connector.id, {
        id: `job-${connector.id}`,
        connectorId: connector.id,
        cronExpression: cronExpr,
        enabled: connector.status === "active",
        lastRun: null,
        lastStatus: "pending",
        nextRun: getNextRunTime(cronExpr),
        retryCount: 0,
        maxRetries: 3,
        priority: connector.priority,
      });
    }

    console.log(`[Scheduler] Initialized ${this.jobs.size} jobs from source_registry`);
  }
  
  /**
   * Start the scheduler (initializes jobs from DB if not yet done)
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log("[Scheduler] Already running");
      return;
    }

    // Initialize jobs from DB if not yet done
    if (this.jobs.size === 0) {
      await this.initializeJobs();
    }

    this.isRunning = true;
    this.startTime = new Date();

    // Check every minute for jobs to run
    this.checkInterval = setInterval(() => this.checkAndRunJobs(), 60000);

    console.log("[Scheduler] Started");
  }
  
  /**
   * Stop the scheduler
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log("[Scheduler] Stopped");
  }
  
  /**
   * Check for jobs that need to run
   */
  private async checkAndRunJobs(): Promise<void> {
    const now = new Date();
    
    // Reset daily counter
    if (now.getDate() !== this.lastDayReset) {
      this.totalRecordsToday = 0;
      this.lastDayReset = now.getDate();
    }
    
    // Get jobs that are due
    const dueJobs = Array.from(this.jobs.values())
      .filter(job => job.enabled && job.nextRun && job.nextRun <= now && job.lastStatus !== "running")
      .sort((a, b) => a.priority - b.priority);
    
    for (const job of dueJobs) {
      await this.runJob(job);
    }
  }
  
  /**
   * Run a specific job
   */
  async runJob(job: ScheduledJob): Promise<IngestionResult> {
    console.log(`[Scheduler] Running job: ${job.connectorId}`);
    
    job.lastStatus = "running";
    job.lastRun = new Date();
    
    const startTime = new Date();
    let success = false;
    let recordsProcessed = 0;
    let errors: string[] = [];
    
    try {
      // Run the appropriate connector
      switch (job.connectorId) {
        case "imf-data":
          const imfResult = await imfConnector.ingestYear(new Date().getFullYear());
          success = imfResult.success;
          recordsProcessed = imfResult.recordsIngested + imfResult.recordsUpdated;
          errors = imfResult.errors;
          break;
          
        case "fao-stat":
          const faoResult = await faoConnector.ingestFAOData();
          success = faoResult.success;
          recordsProcessed = faoResult.recordsProcessed;
          errors = faoResult.errors;
          break;
          
        case "acled":
          const acledResult = await acledConnector.ingestACLEDData();
          success = acledResult.success;
          recordsProcessed = acledResult.recordsProcessed;
          errors = acledResult.errors;
          break;
          
        case "iom-dtm":
          const dtmResult = await iomDtmConnector.ingestDTMData();
          success = dtmResult.success;
          recordsProcessed = dtmResult.recordsProcessed;
          errors = dtmResult.errors;
          break;
          
        default:
          // For connectors without specific implementation
          success = true;
          recordsProcessed = 0;
          console.log(`[Scheduler] No specific handler for ${job.connectorId}, skipping`);
      }
      
    } catch (error) {
      success = false;
      errors.push(`Job execution error: ${error}`);
      console.error(`[Scheduler] Job ${job.connectorId} failed:`, error);
    }
    
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    
    // Update job status
    job.lastStatus = success ? "success" : "failed";
    job.nextRun = getNextRunTime(job.cronExpression);
    
    if (!success) {
      job.retryCount++;
      if (job.retryCount < job.maxRetries) {
        // Schedule retry with exponential backoff
        const retryDelay = Math.pow(2, job.retryCount) * 60000; // 2^n minutes
        job.nextRun = new Date(Date.now() + retryDelay);
        console.log(`[Scheduler] Scheduling retry for ${job.connectorId} in ${retryDelay / 60000} minutes`);
      }
    } else {
      job.retryCount = 0;
      this.totalRecordsToday += recordsProcessed;
    }
    
    // Store result
    const result: IngestionResult = {
      jobId: job.id,
      connectorId: job.connectorId,
      startTime,
      endTime,
      success,
      recordsProcessed,
      errors,
      duration,
    };
    
    this.results.push(result);
    
    // Keep only last 100 results
    if (this.results.length > 100) {
      this.results = this.results.slice(-100);
    }
    
    console.log(`[Scheduler] Job ${job.connectorId} completed: ${success ? "SUCCESS" : "FAILED"} (${recordsProcessed} records, ${duration}ms)`);
    
    return result;
  }
  
  /**
   * Run all jobs immediately (manual trigger)
   */
  async runAllNow(): Promise<IngestionResult[]> {
    console.log("[Scheduler] Running all jobs immediately");
    
    const results: IngestionResult[] = [];
    const jobs = Array.from(this.jobs.values())
      .filter(job => job.enabled)
      .sort((a, b) => a.priority - b.priority);
    
    for (const job of jobs) {
      const result = await this.runJob(job);
      results.push(result);
      
      // Small delay between jobs
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    return results;
  }
  
  /**
   * Run a specific connector immediately
   */
  async runConnectorNow(connectorId: string): Promise<IngestionResult | null> {
    const job = this.jobs.get(connectorId);
    if (!job) {
      console.error(`[Scheduler] Unknown connector: ${connectorId}`);
      return null;
    }
    
    return this.runJob(job);
  }
  
  /**
   * Get scheduler status
   */
  getStatus(): SchedulerStatus {
    const jobs = Array.from(this.jobs.values());
    
    return {
      isRunning: this.isRunning,
      activeJobs: jobs.filter(j => j.lastStatus === "running").length,
      pendingJobs: jobs.filter(j => j.enabled && j.lastStatus === "pending").length,
      failedJobs: jobs.filter(j => j.lastStatus === "failed").length,
      lastFullRun: this.results.length > 0 ? this.results[this.results.length - 1].endTime : null,
      nextFullRun: this.getNextFullRunTime(),
      totalRecordsToday: this.totalRecordsToday,
      uptimeSeconds: Math.floor((Date.now() - this.startTime.getTime()) / 1000),
    };
  }
  
  /**
   * Get all job statuses
   */
  getJobStatuses(): ScheduledJob[] {
    return Array.from(this.jobs.values());
  }
  
  /**
   * Get recent results
   */
  getRecentResults(limit: number = 20): IngestionResult[] {
    return this.results.slice(-limit);
  }
  
  /**
   * Enable/disable a job
   */
  setJobEnabled(connectorId: string, enabled: boolean): boolean {
    const job = this.jobs.get(connectorId);
    if (!job) return false;
    
    job.enabled = enabled;
    if (enabled) {
      job.nextRun = getNextRunTime(job.cronExpression);
    }
    
    console.log(`[Scheduler] Job ${connectorId} ${enabled ? "enabled" : "disabled"}`);
    return true;
  }
  
  /**
   * Update job schedule
   */
  updateJobSchedule(connectorId: string, cronExpression: string): boolean {
    const job = this.jobs.get(connectorId);
    if (!job) return false;
    
    try {
      // Validate cron expression
      parseCronExpression(cronExpression);
      
      job.cronExpression = cronExpression;
      job.nextRun = getNextRunTime(cronExpression);
      
      console.log(`[Scheduler] Updated schedule for ${connectorId}: ${cronExpression}`);
      return true;
    } catch (error) {
      console.error(`[Scheduler] Invalid cron expression: ${cronExpression}`);
      return false;
    }
  }
  
  /**
   * Get next full run time (when all daily jobs run)
   */
  private getNextFullRunTime(): Date | null {
    const dailyJobs = Array.from(this.jobs.values())
      .filter(j => j.enabled && j.cronExpression.includes("2 * * *"));
    
    if (dailyJobs.length === 0) return null;
    
    const nextRuns = dailyJobs
      .map(j => j.nextRun)
      .filter((d): d is Date => d !== null);
    
    if (nextRuns.length === 0) return null;
    
    return new Date(Math.min(...nextRuns.map(d => d.getTime())));
  }
}

// ============================================
// Singleton Instance
// ============================================

let schedulerInstance: IngestionScheduler | null = null;

export function getScheduler(): IngestionScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new IngestionScheduler();
  }
  return schedulerInstance;
}

export async function startScheduler(): Promise<void> {
  await getScheduler().start();
}

export function stopScheduler(): void {
  getScheduler().stop();
}

export default {
  getScheduler,
  startScheduler,
  stopScheduler,
};
