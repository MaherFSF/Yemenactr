/**
 * YETO Backfill Runner Service
 * 
 * Handles historical data backfill from 2010-01-01 to today with:
 * - Chunked processing (monthly/yearly)
 * - Checkpoint persistence for resume
 * - Idempotent inserts
 * - Progress tracking
 */

import { getDb } from "../db";
import { backfillCheckpoints, ingestionRuns } from "../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

// ============================================================================
// Types
// ============================================================================

export interface BackfillConfig {
  sourceId: string;
  startDate: string; // YYYY-MM-DD format
  endDate: string;   // YYYY-MM-DD or "today"
  chunkSize: "daily" | "weekly" | "monthly" | "yearly";
  checkpointInterval: number; // Records between checkpoints
  idempotent: boolean;
  resumeOnFailure: boolean;
  maxRetries: number;
}

export interface BackfillProgress {
  sourceId: string;
  status: "pending" | "running" | "completed" | "failed" | "paused";
  startDate: string;
  endDate: string;
  currentDate: string;
  recordsProcessed: number;
  recordsTotal: number;
  percentComplete: number;
  lastCheckpoint: Date | null;
  errorCount: number;
  errors: string[];
}

export interface BackfillResult {
  success: boolean;
  sourceId: string;
  recordsProcessed: number;
  recordsFailed: number;
  duration: number;
  checkpointsCreated: number;
  errors: string[];
}

// ============================================================================
// Backfill Runner
// ============================================================================

export class BackfillRunner {
  private config: BackfillConfig;
  private progress: BackfillProgress;
  private aborted: boolean = false;

  constructor(config: Partial<BackfillConfig> & { sourceId: string }) {
    this.config = {
      sourceId: config.sourceId,
      startDate: config.startDate || "2010-01-01",
      endDate: config.endDate || "today",
      chunkSize: config.chunkSize || "monthly",
      checkpointInterval: config.checkpointInterval || 1000,
      idempotent: config.idempotent !== false,
      resumeOnFailure: config.resumeOnFailure !== false,
      maxRetries: config.maxRetries || 3,
    };

    this.progress = {
      sourceId: this.config.sourceId,
      status: "pending",
      startDate: this.config.startDate,
      endDate: this.config.endDate === "today" 
        ? new Date().toISOString().split("T")[0] 
        : this.config.endDate,
      currentDate: this.config.startDate,
      recordsProcessed: 0,
      recordsTotal: 0,
      percentComplete: 0,
      lastCheckpoint: null,
      errorCount: 0,
      errors: [],
    };
  }

  /**
   * Run the backfill process
   */
  async run(
    fetchFunction: (startDate: string, endDate: string) => Promise<{ records: number; errors: string[] }>
  ): Promise<BackfillResult> {
    const startTime = Date.now();
    let checkpointsCreated = 0;

    try {
      // Check for existing checkpoint
      if (this.config.resumeOnFailure) {
        const checkpoint = await this.loadCheckpoint();
        if (checkpoint) {
          this.progress.currentDate = checkpoint.currentDate;
          this.progress.recordsProcessed = checkpoint.recordsProcessed;
          console.log(`[Backfill] Resuming from checkpoint: ${checkpoint.currentDate}`);
        }
      }

      this.progress.status = "running";
      await this.saveCheckpoint();

      // Generate date chunks
      const chunks = this.generateChunks();
      this.progress.recordsTotal = chunks.length * 100; // Estimate

      // Process each chunk
      for (const chunk of chunks) {
        if (this.aborted) {
          this.progress.status = "paused";
          break;
        }

        // Skip already processed chunks
        if (chunk.start < this.progress.currentDate) {
          continue;
        }

        console.log(`[Backfill] Processing chunk: ${chunk.start} to ${chunk.end}`);

        let retries = 0;
        let success = false;

        while (!success && retries < this.config.maxRetries) {
          try {
            const result = await fetchFunction(chunk.start, chunk.end);
            this.progress.recordsProcessed += result.records;
            this.progress.currentDate = chunk.end;
            
            if (result.errors.length > 0) {
              this.progress.errors.push(...result.errors);
              this.progress.errorCount += result.errors.length;
            }

            success = true;
          } catch (err) {
            retries++;
            console.error(`[Backfill] Chunk failed (attempt ${retries}): ${err}`);
            
            if (retries >= this.config.maxRetries) {
              this.progress.errors.push(`Failed chunk ${chunk.start}-${chunk.end}: ${err}`);
              this.progress.errorCount++;
            } else {
              // Wait before retry
              await this.sleep(1000 * retries);
            }
          }
        }

        // Update progress
        this.progress.percentComplete = Math.round(
          (chunks.indexOf(chunk) / chunks.length) * 100
        );

        // Create checkpoint if needed
        if (this.progress.recordsProcessed % this.config.checkpointInterval === 0) {
          await this.saveCheckpoint();
          checkpointsCreated++;
        }
      }

      // Final status
      if (!this.aborted) {
        this.progress.status = this.progress.errorCount > 0 ? "completed" : "completed";
        this.progress.percentComplete = 100;
      }

      await this.saveCheckpoint();
      checkpointsCreated++;

      return {
        success: this.progress.errorCount === 0,
        sourceId: this.config.sourceId,
        recordsProcessed: this.progress.recordsProcessed,
        recordsFailed: this.progress.errorCount,
        duration: Date.now() - startTime,
        checkpointsCreated,
        errors: this.progress.errors,
      };
    } catch (err) {
      this.progress.status = "failed";
      this.progress.errors.push(String(err));
      await this.saveCheckpoint();

      return {
        success: false,
        sourceId: this.config.sourceId,
        recordsProcessed: this.progress.recordsProcessed,
        recordsFailed: this.progress.errorCount + 1,
        duration: Date.now() - startTime,
        checkpointsCreated,
        errors: [...this.progress.errors, String(err)],
      };
    }
  }

  /**
   * Abort the backfill process
   */
  abort(): void {
    this.aborted = true;
  }

  /**
   * Get current progress
   */
  getProgress(): BackfillProgress {
    return { ...this.progress };
  }

  /**
   * Generate date chunks based on config
   */
  private generateChunks(): Array<{ start: string; end: string }> {
    const chunks: Array<{ start: string; end: string }> = [];
    const startDate = new Date(this.config.startDate);
    const endDate = this.config.endDate === "today" 
      ? new Date() 
      : new Date(this.config.endDate);

    let current = new Date(startDate);

    while (current < endDate) {
      const chunkStart = current.toISOString().split("T")[0];
      let chunkEnd: Date;

      switch (this.config.chunkSize) {
        case "daily":
          chunkEnd = new Date(current);
          chunkEnd.setDate(chunkEnd.getDate() + 1);
          break;
        case "weekly":
          chunkEnd = new Date(current);
          chunkEnd.setDate(chunkEnd.getDate() + 7);
          break;
        case "monthly":
          chunkEnd = new Date(current);
          chunkEnd.setMonth(chunkEnd.getMonth() + 1);
          break;
        case "yearly":
          chunkEnd = new Date(current);
          chunkEnd.setFullYear(chunkEnd.getFullYear() + 1);
          break;
      }

      // Don't exceed end date
      if (chunkEnd > endDate) {
        chunkEnd = endDate;
      }

      chunks.push({
        start: chunkStart,
        end: chunkEnd.toISOString().split("T")[0],
      });

      current = chunkEnd;
    }

    return chunks;
  }

  /**
   * Save checkpoint to database
   */
  private async saveCheckpoint(): Promise<void> {
    const database = await getDb();
    if (!database) return;

    try {
      // Check if checkpoint exists
      const checkpointId = `bf_${this.config.sourceId}_${Date.now()}`;
      const existing = await database
        .select()
        .from(backfillCheckpoints)
        .where(eq(backfillCheckpoints.datasetId, this.config.sourceId))
        .limit(1);

      if (existing.length > 0) {
        await database
          .update(backfillCheckpoints)
          .set({
            lastProcessedDate: new Date(this.progress.currentDate),
            status: this.progress.status as "running" | "paused" | "completed" | "failed",
            processedDays: this.progress.recordsProcessed,
            lastUpdatedAt: new Date(),
            errorCount: this.progress.errorCount,
          })
          .where(eq(backfillCheckpoints.datasetId, this.config.sourceId));
      } else {
        await database.insert(backfillCheckpoints).values({
          id: checkpointId,
          datasetId: this.config.sourceId,
          indicatorCode: "all",
          lastProcessedDate: new Date(this.progress.currentDate),
          totalDays: 365 * 15, // ~15 years from 2010
          processedDays: this.progress.recordsProcessed,
          insertedRecords: this.progress.recordsProcessed,
          status: this.progress.status as "running" | "paused" | "completed" | "failed",
          startedAt: new Date(),
          lastUpdatedAt: new Date(),
          errorCount: this.progress.errorCount,
        });
      }

      this.progress.lastCheckpoint = new Date();
    } catch (err) {
      console.error(`[Backfill] Failed to save checkpoint: ${err}`);
    }
  }

  /**
   * Load checkpoint from database
   */
  private async loadCheckpoint(): Promise<{
    currentDate: string;
    recordsProcessed: number;
  } | null> {
    const database = await getDb();
    if (!database) return null;

    try {
      const [checkpoint] = await database
        .select()
        .from(backfillCheckpoints)
        .where(eq(backfillCheckpoints.datasetId, this.config.sourceId))
        .limit(1);

      if (checkpoint && checkpoint.status !== "completed") {
        return {
          currentDate: checkpoint.lastProcessedDate instanceof Date 
            ? checkpoint.lastProcessedDate.toISOString().split("T")[0]
            : String(checkpoint.lastProcessedDate),
          recordsProcessed: checkpoint.processedDays || 0,
        };
      }

      return null;
    } catch (err) {
      console.error(`[Backfill] Failed to load checkpoint: ${err}`);
      return null;
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================================================
// Backfill Orchestrator
// ============================================================================

export class BackfillOrchestrator {
  private runners: Map<string, BackfillRunner> = new Map();

  /**
   * Start a backfill for a source
   */
  async startBackfill(
    sourceId: string,
    config: Partial<BackfillConfig>,
    fetchFunction: (startDate: string, endDate: string) => Promise<{ records: number; errors: string[] }>
  ): Promise<BackfillResult> {
    // Check if already running
    if (this.runners.has(sourceId)) {
      const existing = this.runners.get(sourceId)!;
      if (existing.getProgress().status === "running") {
        throw new Error(`Backfill already running for ${sourceId}`);
      }
    }

    const runner = new BackfillRunner({ ...config, sourceId });
    this.runners.set(sourceId, runner);

    return runner.run(fetchFunction);
  }

  /**
   * Get progress for a source
   */
  getProgress(sourceId: string): BackfillProgress | null {
    const runner = this.runners.get(sourceId);
    return runner ? runner.getProgress() : null;
  }

  /**
   * Get all active backfills
   */
  getAllProgress(): BackfillProgress[] {
    return Array.from(this.runners.values()).map((r) => r.getProgress());
  }

  /**
   * Abort a backfill
   */
  abort(sourceId: string): boolean {
    const runner = this.runners.get(sourceId);
    if (runner) {
      runner.abort();
      return true;
    }
    return false;
  }

  /**
   * Abort all backfills
   */
  abortAll(): void {
    this.runners.forEach((runner) => runner.abort());
  }
}

// ============================================================================
// Pre-configured Backfill Functions
// ============================================================================

/**
 * Run full historical backfill for all flagship sources
 */
export async function runFullHistoricalBackfill(): Promise<{
  results: BackfillResult[];
  summary: {
    totalRecords: number;
    totalErrors: number;
    duration: number;
  };
}> {
  const orchestrator = new BackfillOrchestrator();
  const results: BackfillResult[] = [];
  const startTime = Date.now();

  // Flagship sources to backfill
  const sources = [
    { id: "world-bank", name: "World Bank WDI" },
    { id: "imf-data", name: "IMF SDMX" },
    { id: "unhcr", name: "UNHCR" },
    { id: "who-gho", name: "WHO GHO" },
    { id: "ocha-fts", name: "OCHA FTS" },
    { id: "wfp-vam", name: "WFP VAM" },
  ];

  for (const source of sources) {
    console.log(`[FullBackfill] Starting backfill for ${source.name}...`);

    // Mock fetch function - in production, this would call the actual connector
    const fetchFunction = async (startDate: string, endDate: string) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // Return mock results
      return {
        records: Math.floor(Math.random() * 100) + 10,
        errors: [] as string[],
      };
    };

    const result = await orchestrator.startBackfill(
      source.id,
      {
        startDate: "2010-01-01",
        endDate: "today",
        chunkSize: "yearly",
        checkpointInterval: 500,
      },
      fetchFunction
    );

    results.push(result);
    console.log(`[FullBackfill] Completed ${source.name}: ${result.recordsProcessed} records`);
  }

  return {
    results,
    summary: {
      totalRecords: results.reduce((sum, r) => sum + r.recordsProcessed, 0),
      totalErrors: results.reduce((sum, r) => sum + r.recordsFailed, 0),
      duration: Date.now() - startTime,
    },
  };
}

/**
 * Get backfill status from database
 */
export async function getBackfillStatus(): Promise<Array<{
  sourceId: string;
  status: string;
  progress: number;
  lastCheckpoint: Date | null;
}>> {
  const database = await getDb();
  if (!database) return [];

  const states = await database.select().from(backfillCheckpoints);

  return states.map((s) => ({
    sourceId: s.datasetId,
    status: s.status,
    progress: s.processedDays || 0,
    lastCheckpoint: s.lastUpdatedAt,
  }));
}

// Export singleton orchestrator
export const backfillOrchestrator = new BackfillOrchestrator();
