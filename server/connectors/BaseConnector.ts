/**
 * YETO Production-Ready Data Connector Framework
 * 
 * This framework is designed to be FULLY HOST-INDEPENDENT:
 * - No Manus-specific dependencies
 * - Uses standard HTTP/REST APIs
 * - All data stored in platform's own database
 * - Works on any hosting platform (AWS, GCP, Azure, VPS, etc.)
 * 
 * @author YETO Platform
 * @version 1.0.0
 */

import { db } from '../db';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ConnectorConfig {
  name: string;
  baseUrl: string;
  apiKey?: string;
  rateLimit: number; // requests per minute
  retryAttempts: number;
  retryDelay: number; // milliseconds
  timeout: number; // milliseconds
}

export interface IngestionResult {
  success: boolean;
  source: string;
  year: number;
  month?: number;
  recordsIngested: number;
  recordsUpdated: number;
  recordsFailed: number;
  errors: string[];
  duration: number; // milliseconds
  timestamp: Date;
}

export interface DataRecord {
  sourceId: string;
  indicatorCode: string;
  indicatorName: string;
  value: number | string | null;
  unit: string;
  year: number;
  month?: number;
  day?: number;
  country: string;
  countryCode: string;
  sourceUrl: string;
  metadata: Record<string, any>;
  fetchedAt: Date;
}

export interface IngestionJob {
  id: string;
  connectorName: string;
  startYear: number;
  endYear: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  totalYears: number;
  completedYears: number;
  results: IngestionResult[];
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

// ============================================================================
// BASE CONNECTOR CLASS
// ============================================================================

export abstract class BaseConnector {
  protected config: ConnectorConfig;
  protected requestCount: number = 0;
  protected lastRequestTime: number = 0;

  constructor(config: ConnectorConfig) {
    this.config = config;
  }

  /**
   * Rate-limited HTTP fetch with retry logic
   * Works on any host - uses standard fetch API
   */
  protected async fetchWithRetry(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    // Rate limiting
    await this.enforceRateLimit();

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            'User-Agent': 'YETO-Platform/1.0 (Yemen Economic Transparency Observatory)',
            'Accept': 'application/json',
            ...options.headers,
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        this.requestCount++;
        return response;
      } catch (error) {
        lastError = error as Error;
        console.warn(
          `[${this.config.name}] Attempt ${attempt}/${this.config.retryAttempts} failed: ${lastError.message}`
        );

        if (attempt < this.config.retryAttempts) {
          await this.sleep(this.config.retryDelay * attempt);
        }
      }
    }

    throw new Error(
      `[${this.config.name}] All ${this.config.retryAttempts} attempts failed. Last error: ${lastError?.message}`
    );
  }

  /**
   * Enforce rate limiting to avoid API bans
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = (60 * 1000) / this.config.rateLimit;

    if (timeSinceLastRequest < minInterval) {
      await this.sleep(minInterval - timeSinceLastRequest);
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Sleep utility
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log ingestion progress
   */
  protected log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${this.config.name}]`;
    
    switch (level) {
      case 'error':
        console.error(`${prefix} ERROR: ${message}`);
        break;
      case 'warn':
        console.warn(`${prefix} WARN: ${message}`);
        break;
      default:
        console.log(`${prefix} ${message}`);
    }
  }

  /**
   * Abstract methods to be implemented by each connector
   */
  abstract ingestYear(year: number): Promise<IngestionResult>;
  abstract ingestYearMonth(year: number, month: number): Promise<IngestionResult>;
  abstract getAvailableIndicators(): Promise<string[]>;
  abstract testConnection(): Promise<boolean>;

  /**
   * Ingest all data from startYear to endYear
   */
  async ingestRange(startYear: number, endYear: number): Promise<IngestionJob> {
    const jobId = `${this.config.name}-${Date.now()}`;
    const totalYears = endYear - startYear + 1;
    
    const job: IngestionJob = {
      id: jobId,
      connectorName: this.config.name,
      startYear,
      endYear,
      status: 'running',
      progress: 0,
      totalYears,
      completedYears: 0,
      results: [],
      startedAt: new Date(),
    };

    this.log(`Starting ingestion job ${jobId}: ${startYear}-${endYear} (${totalYears} years)`);

    try {
      for (let year = startYear; year <= endYear; year++) {
        this.log(`Ingesting year ${year}...`);
        
        const result = await this.ingestYear(year);
        job.results.push(result);
        job.completedYears++;
        job.progress = Math.round((job.completedYears / totalYears) * 100);

        this.log(
          `Year ${year} complete: ${result.recordsIngested} ingested, ${result.recordsUpdated} updated, ${result.recordsFailed} failed`
        );
      }

      job.status = 'completed';
      job.completedAt = new Date();
      
      const totalIngested = job.results.reduce((sum, r) => sum + r.recordsIngested, 0);
      const totalUpdated = job.results.reduce((sum, r) => sum + r.recordsUpdated, 0);
      const totalFailed = job.results.reduce((sum, r) => sum + r.recordsFailed, 0);
      
      this.log(
        `Job ${jobId} completed: ${totalIngested} total ingested, ${totalUpdated} updated, ${totalFailed} failed`
      );
    } catch (error) {
      job.status = 'failed';
      job.error = (error as Error).message;
      job.completedAt = new Date();
      this.log(`Job ${jobId} failed: ${job.error}`, 'error');
    }

    return job;
  }

  /**
   * Ingest with monthly granularity for a specific year
   */
  async ingestYearMonthly(year: number): Promise<IngestionResult[]> {
    const results: IngestionResult[] = [];
    
    for (let month = 1; month <= 12; month++) {
      this.log(`Ingesting ${year}-${month.toString().padStart(2, '0')}...`);
      const result = await this.ingestYearMonth(year, month);
      results.push(result);
    }

    return results;
  }
}

// ============================================================================
// CONNECTOR REGISTRY
// ============================================================================

export class ConnectorRegistry {
  private static connectors: Map<string, BaseConnector> = new Map();

  static register(name: string, connector: BaseConnector): void {
    this.connectors.set(name, connector);
    console.log(`[ConnectorRegistry] Registered connector: ${name}`);
  }

  static get(name: string): BaseConnector | undefined {
    return this.connectors.get(name);
  }

  static getAll(): Map<string, BaseConnector> {
    return this.connectors;
  }

  static async testAll(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    
    for (const [name, connector] of Array.from(this.connectors)) {
      try {
        const isConnected = await connector.testConnection();
        results.set(name, isConnected);
        console.log(`[ConnectorRegistry] ${name}: ${isConnected ? 'OK' : 'FAILED'}`);
      } catch (error) {
        results.set(name, false);
        console.error(`[ConnectorRegistry] ${name}: ERROR - ${(error as Error).message}`);
      }
    }

    return results;
  }
}

// ============================================================================
// INGESTION SCHEDULER
// ============================================================================

export interface ScheduleConfig {
  connectorName: string;
  cronExpression: string;
  startYear: number;
  endYear: number;
  enabled: boolean;
}

export class IngestionScheduler {
  private schedules: Map<string, ScheduleConfig> = new Map();
  private runningJobs: Map<string, IngestionJob> = new Map();

  addSchedule(config: ScheduleConfig): void {
    this.schedules.set(config.connectorName, config);
    console.log(`[IngestionScheduler] Added schedule for ${config.connectorName}: ${config.cronExpression}`);
  }

  removeSchedule(connectorName: string): void {
    this.schedules.delete(connectorName);
    console.log(`[IngestionScheduler] Removed schedule for ${connectorName}`);
  }

  async runNow(connectorName: string, startYear: number, endYear: number): Promise<IngestionJob | null> {
    const connector = ConnectorRegistry.get(connectorName);
    if (!connector) {
      console.error(`[IngestionScheduler] Connector not found: ${connectorName}`);
      return null;
    }

    if (this.runningJobs.has(connectorName)) {
      console.warn(`[IngestionScheduler] Job already running for ${connectorName}`);
      return this.runningJobs.get(connectorName) || null;
    }

    const job = await connector.ingestRange(startYear, endYear);
    this.runningJobs.set(connectorName, job);

    if (job.status === 'completed' || job.status === 'failed') {
      this.runningJobs.delete(connectorName);
    }

    return job;
  }

  getRunningJobs(): Map<string, IngestionJob> {
    return this.runningJobs;
  }

  getSchedules(): Map<string, ScheduleConfig> {
    return this.schedules;
  }
}

// Export singleton scheduler
export const ingestionScheduler = new IngestionScheduler();
