/**
 * YETO Data Ingestion Orchestrator
 * 
 * Manages continuous data ingestion from all 225 sources
 * - Automatic scheduling per source cadence
 * - Historical backfill (2010-2026)
 * - Real-time updates
 * - No static data
 */

import { registry, UniversalConnector, IngestionResult } from './connectors/universal-connector';
import * as fs from 'fs';

interface IngestionSchedule {
  sourceId: string;
  cron: string;
  lastRun?: Date;
  nextRun: Date;
  status: 'SCHEDULED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
}

interface IngestionStats {
  totalSources: number;
  activeConnectors: number;
  successRate: number;
  recordsIngested: number;
  dataFreshness: string;
  lastRun: Date;
  nextRun: Date;
}

/**
 * Main Orchestrator Class
 */
export class IngestionOrchestrator {
  private schedules: Map<string, IngestionSchedule> = new Map();
  private stats: IngestionStats;
  private isRunning = false;
  private lastRunResults: IngestionResult[] = [];

  constructor() {
    this.stats = {
      totalSources: 0,
      activeConnectors: 0,
      successRate: 0,
      recordsIngested: 0,
      dataFreshness: 'Never',
      lastRun: new Date(0),
      nextRun: new Date(),
    };
  }

  /**
   * Initialize orchestrator with CSV source registry
   */
  async initialize(csvPath: string): Promise<void> {
    console.log('🚀 Initializing YETO Ingestion Orchestrator...\n');

    try {
      // Register all sources from CSV
      await registry.registerFromCSV(csvPath);

      // Create schedules for each connector
      for (const connector of registry.getAllConnectors()) {
        const schedule = connector.getSchedule();
        const sourceId = (connector as any).config.sourceId;

        this.schedules.set(sourceId, {
          sourceId,
          cron: schedule,
          nextRun: this.calculateNextRun(schedule),
          status: 'SCHEDULED',
        });
      }

      const stats = registry.getStats();
      this.stats.totalSources = stats.totalSources;
      this.stats.activeConnectors = stats.totalSources;

      console.log(`✅ Orchestrator initialized with ${stats.totalSources} sources\n`);
      console.log('📊 Source Distribution:');
      console.log(`   By Tier: ${JSON.stringify(stats.byTier)}`);
      console.log(`   By Frequency: ${JSON.stringify(stats.byFrequency)}\n`);
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Start continuous ingestion
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️  Orchestrator already running');
      return;
    }

    this.isRunning = true;
    console.log('▶️  Starting continuous ingestion...\n');

    // Run initial ingestion
    await this.runAllConnectors();

    // Schedule periodic checks (every 15 minutes)
    setInterval(() => this.checkAndRunDueConnectors(), 15 * 60 * 1000);

    // Log status every hour
    setInterval(() => this.logStatus(), 60 * 60 * 1000);
  }

  /**
   * Stop orchestrator
   */
  stop(): void {
    this.isRunning = false;
    console.log('⏹️  Orchestrator stopped');
  }

  /**
   * Run all connectors immediately
   */
  async runAllConnectors(): Promise<IngestionResult[]> {
    console.log('🔄 Running all connectors...\n');

    const results = await registry.runAllConnectors();
    this.lastRunResults = results;

    // Update statistics
    await this.updateStats(results);

    // Log results
    this.logResults(results);

    return results;
  }

  /**
   * Check and run due connectors
   */
  private async checkAndRunDueConnectors(): Promise<void> {
    const now = new Date();
    const dueConnectors: string[] = [];

    for (const [sourceId, schedule] of Array.from(this.schedules.entries())) {
      if (schedule.nextRun <= now && schedule.status !== 'RUNNING') {
        dueConnectors.push(sourceId);
      }
    }

    if (dueConnectors.length > 0) {
      console.log(`\n📅 Running ${dueConnectors.length} due connectors...`);

      for (const sourceId of dueConnectors) {
        const connector = registry.getConnector(sourceId);
        if (connector) {
          const schedule = this.schedules.get(sourceId)!;
          schedule.status = 'RUNNING';

          try {
            const result = await connector.ingest();
            schedule.status = result.status === 'SUCCESS' ? 'COMPLETED' : 'FAILED';
            schedule.lastRun = new Date();
            schedule.nextRun = this.calculateNextRun(schedule.cron);

            console.log(`✓ ${sourceId}: ${result.recordsLoaded} records loaded`);
          } catch (error) {
            schedule.status = 'FAILED';
            console.error(`✗ ${sourceId}: ${error}`);
          }
        }
      }
    }
  }

  /**
   * Calculate next run time from cron expression
   */
  private calculateNextRun(cron: string): Date {
    const now = new Date();

    // Simple cron parsing (production would use cron-parser)
    const parts = cron.split(' ');
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    const next = new Date(now);

    if (cron === '*/15 * * * *') {
      // Every 15 minutes
      next.setMinutes(next.getMinutes() + 15);
    } else if (cron === '0 0 * * *') {
      // Daily
      next.setDate(next.getDate() + 1);
      next.setHours(0, 0, 0, 0);
    } else if (cron === '0 0 * * 0') {
      // Weekly
      next.setDate(next.getDate() + (7 - next.getDay()));
      next.setHours(0, 0, 0, 0);
    } else if (cron === '0 0 1 * *') {
      // Monthly
      next.setMonth(next.getMonth() + 1);
      next.setDate(1);
      next.setHours(0, 0, 0, 0);
    } else {
      // Default: next day
      next.setDate(next.getDate() + 1);
      next.setHours(0, 0, 0, 0);
    }

    return next;
  }

  /**
   * Update statistics from results
   */
  private async updateStats(results: IngestionResult[]): Promise<void> {
    const successful = results.filter(r => r.status === 'SUCCESS').length;
    const totalRecords = results.reduce((sum, r) => sum + r.recordsLoaded, 0);

    this.stats.successRate = (successful / results.length) * 100;
    this.stats.recordsIngested += totalRecords;
    this.stats.lastRun = new Date();
    this.stats.nextRun = this.calculateNextRun('0 0 * * 0'); // Next week

    // Calculate data freshness
    const hoursAgo = Math.floor((Date.now() - this.stats.lastRun.getTime()) / (1000 * 60 * 60));
    this.stats.dataFreshness = hoursAgo === 0 ? 'Just now' : `${hoursAgo} hours ago`;
  }

  /**
   * Log ingestion results
   */
  private logResults(results: IngestionResult[]): void {
    console.log('\n📊 Ingestion Results:');
    console.log('─'.repeat(80));

    let successCount = 0;
    let totalRecords = 0;
    const errors: string[] = [];

    for (const result of results) {
      if (result.status === 'SUCCESS') {
        successCount++;
        totalRecords += result.recordsLoaded;
        console.log(`✅ ${result.sourceId}: ${result.recordsLoaded} records (${result.duration}ms)`);
      } else if (result.status === 'PARTIAL') {
        console.log(`⚠️  ${result.sourceId}: ${result.recordsLoaded}/${result.recordsProcessed} records`);
      } else {
        console.log(`❌ ${result.sourceId}: ${result.errors.join(', ')}`);
        errors.push(`${result.sourceId}: ${result.errors[0]}`);
      }
    }

    console.log('─'.repeat(80));
    console.log(`\n✅ Success Rate: ${(successCount / results.length * 100).toFixed(1)}%`);
    console.log(`📦 Total Records Loaded: ${totalRecords}`);
    console.log(`⏱️  Total Duration: ${results.reduce((sum, r) => sum + r.duration, 0)}ms\n`);

    if (errors.length > 0) {
      console.log('⚠️  Errors:');
      errors.forEach(err => console.log(`   - ${err}`));
      console.log();
    }
  }

  /**
   * Log current status
   */
  private logStatus(): void {
    console.log('\n📈 Orchestrator Status:');
    console.log(`   Total Sources: ${this.stats.totalSources}`);
    console.log(`   Active Connectors: ${this.stats.activeConnectors}`);
    console.log(`   Success Rate: ${this.stats.successRate.toFixed(1)}%`);
    console.log(`   Records Ingested: ${this.stats.recordsIngested}`);
    console.log(`   Data Freshness: ${this.stats.dataFreshness}`);
    console.log(`   Last Run: ${this.stats.lastRun.toISOString()}`);
    console.log(`   Next Run: ${this.stats.nextRun.toISOString()}\n`);
  }

  /**
   * Get current statistics
   */
  getStats(): IngestionStats {
    return this.stats;
  }

  /**
   * Get schedule for specific source
   */
  getSchedule(sourceId: string): IngestionSchedule | undefined {
    return this.schedules.get(sourceId);
  }

  /**
   * Get all schedules
   */
  getAllSchedules(): IngestionSchedule[] {
    return Array.from(this.schedules.values());
  }

  /**
   * Export status report
   */
  exportStatusReport(): string {
    const report = `
# YETO Ingestion Orchestrator Status Report
Generated: ${new Date().toISOString()}

## Overall Statistics
- Total Sources: ${this.stats.totalSources}
- Active Connectors: ${this.stats.activeConnectors}
- Success Rate: ${this.stats.successRate.toFixed(1)}%
- Records Ingested: ${this.stats.recordsIngested}
- Data Freshness: ${this.stats.dataFreshness}

## Recent Results
${this.lastRunResults
  .map(
    r =>
      `- ${r.sourceId}: ${r.status} (${r.recordsLoaded}/${r.recordsProcessed} records, ${r.duration}ms)`
  )
  .join('\n')}

## Scheduled Connectors
${Array.from(this.schedules.values())
  .map(s => `- ${s.sourceId}: ${s.status} (Next: ${s.nextRun.toISOString()})`)
  .join('\n')}

## Data Coverage
- Time Range: 2010-01-01 to 2026-12-31
- Update Frequency: Continuous (real-time to annual)
- Data Quality: Evidence-first with triangulation
- Storage: PostgreSQL + S3 (raw snapshots)

---
Generated by YETO Platform v1.0
`;

    return report;
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const orchestrator = new IngestionOrchestrator();

/**
 * Initialize and start orchestrator
 */
export async function startOrchestrator(csvPath: string): Promise<void> {
  await orchestrator.initialize(csvPath);
  await orchestrator.start();
}

export default orchestrator;
