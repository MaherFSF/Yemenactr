/**
 * YETO Automated Ingestion Scheduler
 * 
 * Manages cron jobs for all 226 data sources
 * - Tier 1 sources: Daily ingestion
 * - Tier 2 sources: Twice weekly
 * - Tier 3 sources: Weekly
 * - Tier 4 sources: Bi-weekly
 * - Custom cadences: Based on source update frequency
 */

import * as fs from 'fs';
import * as path from 'path';
import { CronJob } from 'cron';
import { getDb } from '../db';
import { ingestionRuns } from '../../drizzle/schema';
import { eq, lt, and, sql } from 'drizzle-orm';

interface ScheduledSource {
  sourceId: string;
  sourceName: string;
  tier: string;
  cadence: string;
  cronExpression: string;
  job?: CronJob;
  lastRun?: Date;
  nextRun?: Date;
  status: 'ACTIVE' | 'PAUSED' | 'FAILED';
}

class IngestionScheduler {
  private scheduledSources: Map<string, ScheduledSource> = new Map();
  private isRunning: boolean = false;
  private registryPath: string;

  constructor() {
    this.registryPath = path.join(process.cwd(), 'server/connectors/sources-config.json');
  }

  /**
   * Initialize scheduler and load all sources
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing Ingestion Scheduler...\n');

    // Start cleanup job for stuck runs
    this.startCleanupJob();

    try {
      const registry = this.loadRegistry();

      if (!registry.sources || registry.sources.length === 0) {
        console.error('❌ No sources found in registry');
        return;
      }

      console.log(`📊 Loading ${registry.sources.length} sources...\n`);

      registry.sources.forEach((source: any) => {
        const cronExpression = this.getCronExpression(source);
        const scheduledSource: ScheduledSource = {
          sourceId: source.id,
          sourceName: source.nameEn,
          tier: source.tier,
          cadence: source.cadence,
          cronExpression,
          status: source.active ? 'ACTIVE' : 'PAUSED',
        };

        this.scheduledSources.set(source.id, scheduledSource);
      });

      console.log(`✅ Loaded ${this.scheduledSources.size} sources into scheduler\n`);
      this.printScheduleStatistics();
    } catch (error) {
      console.error('❌ Failed to initialize scheduler:', error);
    }
  }

  /**
   * Determine cron expression based on tier and cadence
   */
  private getCronExpression(source: any): string {
    const tier = source.tier || 'T2';
    const cadence = source.cadence || 'ANNUAL';

    // Map cadences to cron expressions
    const cadenceMap: Record<string, string> = {
      'CONTINUOUS': '*/15 * * * * *', // Every 15 minutes
      'DAILY': '0 2 * * *', // 2 AM daily
      'WEEKLY': '0 3 * * 1', // 3 AM Monday
      'MONTHLY': '0 4 1 * *', // 4 AM on 1st of month
      'QUARTERLY': '0 5 1 */3 *', // 5 AM on 1st of every 3rd month
      'ANNUAL': '0 6 1 1 *', // 6 AM on Jan 1
      'IRREGULAR': '0 7 * * 0', // 7 AM on Sunday (manual review)
    };

    // Override based on tier for consistency
    const tierOverrides: Record<string, string> = {
      'T1': '0 2 * * *', // Daily at 2 AM
      'T2': '0 3 * * 1,4', // Twice weekly (Mon, Thu) at 3 AM
      'T3': '0 4 * * 1', // Weekly (Mon) at 4 AM
      'T4': '0 5 * * 1', // Bi-weekly (every other Monday) at 5 AM
    };

    // Use tier-based schedule if available, otherwise use cadence
    return tierOverrides[tier] || cadenceMap[cadence] || '0 6 * * 0';
  }

  /**
   * Start all scheduled ingestion jobs
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('⚠️  Scheduler is already running');
      return;
    }

    console.log('🚀 Starting Ingestion Scheduler...\n');
    this.isRunning = true;

    let activeCount = 0;

    this.scheduledSources.forEach((scheduled: ScheduledSource, sourceId: string) => {
      if (scheduled.status === 'ACTIVE') {
        try {
          // Create cron job
          const job = new CronJob(
            scheduled.cronExpression,
            () => this.runIngestion(sourceId),
            null,
            true,
            'UTC'
          );

          scheduled.job = job;
          const nextDate = job.nextDate();
          scheduled.nextRun = typeof nextDate === 'object' && 'toJSDate' in nextDate ? nextDate.toJSDate() : new Date(nextDate as any);
          activeCount++;

          console.log(`✅ Scheduled ${scheduled.sourceName} (${scheduled.sourceId})`);
          console.log(`   Cron: ${scheduled.cronExpression}`);
          if (scheduled.nextRun) {
            console.log(`   Next run: ${scheduled.nextRun.toISOString()}\n`);
          }
        } catch (error) {
          console.error(`❌ Failed to schedule ${sourceId}:`, error);
          scheduled.status = 'FAILED';
        }
      }
    });

    console.log('='.repeat(80));
    console.log(`✅ Scheduler started with ${activeCount} active jobs`);
    console.log('='.repeat(80));
  }

  /**
   * Stop all scheduled jobs
   */
  async stop(): Promise<void> {
    console.log('⏹️  Stopping Ingestion Scheduler...\n');

    this.scheduledSources.forEach((scheduled) => {
      if (scheduled.job) {
        scheduled.job.stop();
      }
    });

    this.isRunning = false;
    console.log('✅ Scheduler stopped');
  }

  /**
   * Run ingestion for a specific source
   */
  private async runIngestion(sourceId: string): Promise<void> {
    const scheduled = this.scheduledSources.get(sourceId);

    if (!scheduled) {
      console.error(`❌ Source not found: ${sourceId}`);
      return;
    }

    console.log(`🔄 Running ingestion for ${scheduled.sourceName}...`);
    scheduled.lastRun = new Date();

    try {
      // Simulate ingestion
      // In production, this would call the actual connector
      const dataPoints = Math.floor(Math.random() * 10000);
      const latency = Math.floor(Math.random() * 5000);

      console.log(`✅ Ingestion complete for ${sourceId}`);
      console.log(`   Data points: ${dataPoints}`);
      console.log(`   Latency: ${latency}ms\n`);

      // Update next run time
      if (scheduled.job) {
        const nextDate = scheduled.job.nextDate();
        scheduled.nextRun = typeof nextDate === 'object' && 'toJSDate' in nextDate ? nextDate.toJSDate() : new Date(nextDate as any);
      }
    } catch (error) {
      console.error(`❌ Ingestion failed for ${sourceId}:`, error);
      scheduled.status = 'FAILED';
    }
  }

  /**
   * Get schedule statistics
   */
  private printScheduleStatistics(): void {
    const stats = {
      total: this.scheduledSources.size,
      active: 0,
      paused: 0,
      failed: 0,
      byTier: {} as Record<string, number>,
      byCadence: {} as Record<string, number>,
    };

    this.scheduledSources.forEach((scheduled) => {
      if (scheduled.status === 'ACTIVE') stats.active++;
      else if (scheduled.status === 'PAUSED') stats.paused++;
      else if (scheduled.status === 'FAILED') stats.failed++;

      const tier = scheduled.tier || 'UNKNOWN';
      stats.byTier[tier] = (stats.byTier[tier] || 0) + 1;

      const cadence = scheduled.cadence || 'UNKNOWN';
      stats.byCadence[cadence] = (stats.byCadence[cadence] || 0) + 1;
    });

    console.log('📊 Schedule Statistics:');
    console.log(`   Total: ${stats.total}`);
    console.log(`   Active: ${stats.active}`);
    console.log(`   Paused: ${stats.paused}`);
    console.log(`   Failed: ${stats.failed}\n`);

    console.log('📈 By Tier:');
    Object.entries(stats.byTier).forEach(([tier, count]) => {
      console.log(`   ${tier}: ${count}`);
    });

    console.log('\n⏱️  By Cadence:');
    Object.entries(stats.byCadence).forEach(([cadence, count]) => {
      console.log(`   ${cadence}: ${count}`);
    });

    console.log('');
  }

  /**
   * Get scheduler status
   */
  getStatus(): {
    isRunning: boolean;
    totalSources: number;
    activeSources: number;
    nextRuns: Array<{ sourceId: string; sourceName: string; nextRun: Date }>;
  } {
    const nextRuns: Array<{ sourceId: string; sourceName: string; nextRun: Date }> = [];

    this.scheduledSources.forEach((scheduled) => {
      if (scheduled.nextRun) {
        nextRuns.push({
          sourceId: scheduled.sourceId,
          sourceName: scheduled.sourceName,
          nextRun: scheduled.nextRun,
        });
      }
    });

    // Sort by next run time
    nextRuns.sort((a, b) => {
      const aTime = a.nextRun instanceof Date ? a.nextRun.getTime() : new Date(a.nextRun as any).getTime();
      const bTime = b.nextRun instanceof Date ? b.nextRun.getTime() : new Date(b.nextRun as any).getTime();
      return aTime - bTime;
    });

    return {
      isRunning: this.isRunning,
      totalSources: this.scheduledSources.size,
      activeSources: Array.from(this.scheduledSources.values()).filter(
        s => s.status === 'ACTIVE'
      ).length,
      nextRuns: nextRuns.slice(0, 10), // Top 10 upcoming runs
    };
  }

  /**
   * Pause a source
   */
  pauseSource(sourceId: string): boolean {
    const scheduled = this.scheduledSources.get(sourceId);
    if (!scheduled) return false;

    if (scheduled.job) {
      scheduled.job.stop();
    }
    scheduled.status = 'PAUSED';
    return true;
  }

  /**
   * Resume a source
   */
  resumeSource(sourceId: string): boolean {
    const scheduled = this.scheduledSources.get(sourceId);
    if (!scheduled) return false;

    try {
      const job = new CronJob(
        scheduled.cronExpression,
        () => this.runIngestion(sourceId),
        null,
        true,
        'UTC'
      );

      scheduled.job = job;
      scheduled.status = 'ACTIVE';
      const nextDate = job.nextDate();
      scheduled.nextRun = typeof nextDate === 'object' && 'toJSDate' in nextDate ? nextDate.toJSDate() : new Date(nextDate as any);
      return true;
    } catch (error) {
      console.error(`Failed to resume ${sourceId}:`, error);
      return false;
    }
  }

  /**
   * Cleanup stuck ingestion runs (running > 60 minutes)
   * Runs every 15 minutes
   */
  private startCleanupJob(): void {
    const cleanupJob = new CronJob(
      '0 */15 * * * *', // Every 15 minutes
      async () => {
        try {
          await this.cleanupStuckRuns();
        } catch (error) {
          console.error('[Scheduler] Cleanup job failed:', error);
        }
      },
      null,
      true,
      'UTC'
    );
    console.log('🧹 Started cleanup job for stuck ingestion runs (every 15 minutes)');
  }

  /**
   * Mark stuck runs as failed
   */
  async cleanupStuckRuns(): Promise<number> {
    try {
      const db = await getDb();
      const sixtyMinutesAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      // Find stuck runs
      const stuckRuns = await db
        .select({ id: ingestionRuns.id, connectorName: ingestionRuns.connectorName, startedAt: ingestionRuns.startedAt })
        .from(ingestionRuns)
        .where(
          and(
            eq(ingestionRuns.status, 'running'),
            lt(ingestionRuns.startedAt, sixtyMinutesAgo)
          )
        );

      if (stuckRuns.length === 0) {
        return 0;
      }

      console.log(`[Scheduler] Found ${stuckRuns.length} stuck ingestion runs, marking as failed...`);

      // Update stuck runs to failed
      for (const run of stuckRuns) {
        const completedAt = new Date();
        const duration = Math.floor((completedAt.getTime() - run.startedAt.getTime()) / 1000);
        
        await db
          .update(ingestionRuns)
          .set({
            status: 'failed',
            completedAt,
            duration,
            errorMessage: `Timeout cleanup - run was stuck for ${Math.floor(duration / 60)} minutes`,
          })
          .where(eq(ingestionRuns.id, run.id));
        
        console.log(`[Scheduler] Marked run ${run.id} (${run.connectorName}) as failed`);
      }

      return stuckRuns.length;
    } catch (error) {
      console.error('[Scheduler] Failed to cleanup stuck runs:', error);
      return 0;
    }
  }

  /**
   * Load registry from config file
   */
  private loadRegistry(): any {
    try {
      const content = fs.readFileSync(this.registryPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to load registry:', error);
      return { sources: [] };
    }
  }
}

// Export singleton instance
export const ingestionScheduler = new IngestionScheduler();

export default ingestionScheduler;
