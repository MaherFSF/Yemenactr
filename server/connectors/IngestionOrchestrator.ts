/**
 * Ingestion Orchestrator
 * 
 * Master coordinator for all data connectors. Handles:
 * - Full historical ingestion (2010-present)
 * - Year-by-year and month-by-month ingestion
 * - Parallel processing with rate limiting
 * - Progress tracking and reporting
 * - Automated scheduling
 * 
 * FULLY HOST-INDEPENDENT - Works on any hosting platform
 */

import { ConnectorRegistry, IngestionResult } from './BaseConnector';
import { db } from '../db';
import { eq, desc } from 'drizzle-orm';

// ============================================================================
// TYPES
// ============================================================================

interface IngestionJob {
  id: string;
  connector: string;
  year: number;
  month?: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: IngestionResult;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

interface IngestionProgress {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  currentJob?: IngestionJob;
  startedAt: Date;
  estimatedCompletion?: Date;
  results: IngestionResult[];
}

interface IngestionSchedule {
  connector: string;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  lastRun?: Date;
  nextRun: Date;
  enabled: boolean;
}

// ============================================================================
// INGESTION ORCHESTRATOR
// ============================================================================

export class IngestionOrchestrator {
  private jobs: Map<string, IngestionJob> = new Map();
  private progress: IngestionProgress | null = null;
  private schedules: Map<string, IngestionSchedule> = new Map();
  private isRunning: boolean = false;

  /**
   * Run full historical ingestion for all connectors from 2010 to present
   */
  async runFullHistoricalIngestion(
    startYear: number = 2010,
    endYear: number = new Date().getFullYear(),
    connectors?: string[]
  ): Promise<IngestionProgress> {
    if (this.isRunning) {
      throw new Error('Ingestion already in progress');
    }

    this.isRunning = true;
    const availableConnectors = connectors || ConnectorRegistry.getAll();
    
    // Create jobs for each connector and year
    const jobs: IngestionJob[] = [];
    for (const connectorName of availableConnectors) {
      for (let year = startYear; year <= endYear; year++) {
        jobs.push({
          id: `${connectorName}-${year}`,
          connector: connectorName,
          year,
          status: 'pending',
        });
      }
    }

    this.progress = {
      totalJobs: jobs.length,
      completedJobs: 0,
      failedJobs: 0,
      startedAt: new Date(),
      results: [],
    };

    console.log(`Starting full historical ingestion: ${jobs.length} jobs`);

    // Process jobs sequentially to respect rate limits
    for (const job of jobs) {
      this.progress.currentJob = job;
      job.status = 'running';
      job.startedAt = new Date();
      this.jobs.set(job.id, job);

      try {
        const connector = ConnectorRegistry.get(job.connector);
        if (connector) {
          const result = await connector.ingestYear(job.year);
          job.result = result;
          job.status = 'completed';
          this.progress.results.push(result);
          this.progress.completedJobs++;
          
          console.log(`✓ ${job.connector} ${job.year}: ${result.recordsIngested} new, ${result.recordsUpdated} updated`);
        } else {
          throw new Error(`Connector ${job.connector} not found`);
        }
      } catch (error) {
        job.status = 'failed';
        job.error = (error as Error).message;
        this.progress.failedJobs++;
        console.error(`✗ ${job.connector} ${job.year}: ${job.error}`);
      }

      job.completedAt = new Date();
      this.jobs.set(job.id, job);

      // Estimate completion time
      const elapsed = Date.now() - this.progress.startedAt.getTime();
      const avgTimePerJob = elapsed / (this.progress.completedJobs + this.progress.failedJobs);
      const remainingJobs = this.progress.totalJobs - this.progress.completedJobs - this.progress.failedJobs;
      this.progress.estimatedCompletion = new Date(Date.now() + avgTimePerJob * remainingJobs);
    }

    this.isRunning = false;
    this.progress.currentJob = undefined;

    return this.progress;
  }

  /**
   * Run ingestion for a specific year across all connectors
   */
  async runYearIngestion(year: number, connectors?: string[]): Promise<IngestionResult[]> {
    const availableConnectors = connectors || ConnectorRegistry.getAll();
    const results: IngestionResult[] = [];

    for (const connectorName of availableConnectors) {
      try {
        const connector = ConnectorRegistry.get(connectorName);
        if (connector) {
          const result = await connector.ingestYear(year);
          results.push(result);
          console.log(`✓ ${connectorName} ${year}: ${result.recordsIngested} new, ${result.recordsUpdated} updated`);
        }
      } catch (error) {
        console.error(`✗ ${connectorName} ${year}: ${(error as Error).message}`);
        results.push({
          success: false,
          source: connectorName,
          year,
          recordsIngested: 0,
          recordsUpdated: 0,
          recordsFailed: 1,
          errors: [(error as Error).message],
          duration: 0,
          timestamp: new Date(),
        });
      }
    }

    return results;
  }

  /**
   * Run ingestion for a specific month across all connectors
   */
  async runMonthIngestion(year: number, month: number, connectors?: string[]): Promise<IngestionResult[]> {
    const availableConnectors = connectors || ConnectorRegistry.getAll();
    const results: IngestionResult[] = [];

    for (const connectorName of availableConnectors) {
      try {
        const connector = ConnectorRegistry.get(connectorName);
        if (connector) {
          const result = await connector.ingestYearMonth(year, month);
          results.push(result);
          console.log(`✓ ${connectorName} ${year}-${month}: ${result.recordsIngested} new, ${result.recordsUpdated} updated`);
        }
      } catch (error) {
        console.error(`✗ ${connectorName} ${year}-${month}: ${(error as Error).message}`);
        results.push({
          success: false,
          source: connectorName,
          year,
          month,
          recordsIngested: 0,
          recordsUpdated: 0,
          recordsFailed: 1,
          errors: [(error as Error).message],
          duration: 0,
          timestamp: new Date(),
        });
      }
    }

    return results;
  }

  /**
   * Run incremental update (current month only)
   */
  async runIncrementalUpdate(connectors?: string[]): Promise<IngestionResult[]> {
    const now = new Date();
    return this.runMonthIngestion(now.getFullYear(), now.getMonth() + 1, connectors);
  }

  /**
   * Set up automated ingestion schedule
   */
  setupSchedule(connector: string, frequency: 'hourly' | 'daily' | 'weekly' | 'monthly'): void {
    const now = new Date();
    let nextRun: Date;

    switch (frequency) {
      case 'hourly':
        nextRun = new Date(now.getTime() + 60 * 60 * 1000);
        break;
      case 'daily':
        nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        nextRun = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        nextRun = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
    }

    this.schedules.set(connector, {
      connector,
      frequency,
      nextRun,
      enabled: true,
    });

    console.log(`Scheduled ${connector} for ${frequency} ingestion, next run: ${nextRun.toISOString()}`);
  }

  /**
   * Get all schedules
   */
  getSchedules(): IngestionSchedule[] {
    return Array.from(this.schedules.values());
  }

  /**
   * Get current progress
   */
  getProgress(): IngestionProgress | null {
    return this.progress;
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): IngestionJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get all jobs
   */
  getAllJobs(): IngestionJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Check if ingestion is running
   */
  isIngestionRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get summary statistics
   */
  getSummary(): {
    totalRecordsIngested: number;
    totalRecordsUpdated: number;
    totalRecordsFailed: number;
    connectorStats: Record<string, { ingested: number; updated: number; failed: number }>;
  } {
    const summary = {
      totalRecordsIngested: 0,
      totalRecordsUpdated: 0,
      totalRecordsFailed: 0,
      connectorStats: {} as Record<string, { ingested: number; updated: number; failed: number }>,
    };

    if (this.progress) {
      for (const result of this.progress.results) {
        summary.totalRecordsIngested += result.recordsIngested;
        summary.totalRecordsUpdated += result.recordsUpdated;
        summary.totalRecordsFailed += result.recordsFailed;

        if (!summary.connectorStats[result.source]) {
          summary.connectorStats[result.source] = { ingested: 0, updated: 0, failed: 0 };
        }
        summary.connectorStats[result.source].ingested += result.recordsIngested;
        summary.connectorStats[result.source].updated += result.recordsUpdated;
        summary.connectorStats[result.source].failed += result.recordsFailed;
      }
    }

    return summary;
  }

  /**
   * Test all connectors
   */
  async testAllConnectors(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    const connectors = ConnectorRegistry.getAll();

    for (const connectorName of connectors) {
      try {
        const connector = ConnectorRegistry.get(connectorName);
        if (connector) {
          results[connectorName] = await connector.testConnection();
        } else {
          results[connectorName] = false;
        }
      } catch (error) {
        results[connectorName] = false;
      }
    }

    return results;
  }
}

// Export singleton instance
export const ingestionOrchestrator = new IngestionOrchestrator();
