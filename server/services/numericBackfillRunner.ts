/**
 * Numeric Series Backfill Runner
 * 
 * Year-based backfill system that:
 * - Processes years in reverse order: 2026, 2025, 2024, 2023, 2022, 2021, 2020, then older
 * - Stores observations at native frequency (daily/weekly/monthly/quarterly/annual)
 * - Creates checkpoints per {sourceId, product_id, year}
 * - Links observations to evidence packs (source + run + raw object)
 * - Never interpolates missing data
 * - Enforces strict regime_tag separation
 * 
 * ARCHITECTURE:
 * - Day/Month spine is for scheduling + gap detection only
 * - Observations stored at native frequency
 * - Each observation has: date, value, unit, frequency, regime_tag, evidence_pack_id
 */

import { getDb } from '../db';
import { 
  numericObservations, 
  numericSeries, 
  numericEvidencePacks, 
  backfillCheckpoints,
  type InsertNumericObservation,
  type InsertNumericSeries,
  type InsertNumericEvidencePack,
  type InsertBackfillCheckpoint
} from '../../drizzle/schema';
import { eq, and, sql } from 'drizzle-orm';
import { numericSourceRegistry, type NumericProduct, type DataFrequency } from './numericSourceRegistry';

// ============================================================================
// TYPES
// ============================================================================

export interface BackfillYearConfig {
  sourceId: string;
  product_id: string;
  year: number;
  regimeTag?: 'aden_irg' | 'sanaa_defacto' | 'mixed' | 'international';
}

export interface ObservationData {
  date: Date; // Observation date at native frequency
  value: number;
  unit: string;
  frequency: DataFrequency;
  regimeTag: 'aden_irg' | 'sanaa_defacto' | 'mixed' | 'international';
  rawData?: Record<string, unknown>; // Original API response
  sourceMetadata?: Record<string, unknown>; // Additional metadata
}

export interface BackfillYearResult {
  sourceId: string;
  product_id: string;
  year: number;
  success: boolean;
  observationsInserted: number;
  observationsSkipped: number;
  errors: string[];
  duration: number;
  checkpointId: string;
}

export interface DataFetcher {
  (year: number, product: NumericProduct): Promise<ObservationData[]>;
}

// ============================================================================
// YEAR-BASED BACKFILL RUNNER
// ============================================================================

export class NumericBackfillRunner {
  private db: Awaited<ReturnType<typeof getDb>>;
  private fetcher: DataFetcher;

  constructor(fetcher: DataFetcher) {
    this.fetcher = fetcher;
  }

  /**
   * Initialize database connection
   */
  private async init() {
    if (!this.db) {
      this.db = await getDb();
      if (!this.db) {
        throw new Error('Database connection failed');
      }
    }
  }

  /**
   * Run backfill for a single year
   */
  async backfillYear(config: BackfillYearConfig): Promise<BackfillYearResult> {
    await this.init();
    const startTime = Date.now();
    const errors: string[] = [];
    
    try {
      // 1. Get product metadata
      const product = numericSourceRegistry.getProduct(config.product_id);
      if (!product) {
        throw new Error(`Product ${config.product_id} not found in registry`);
      }

      // 2. Check if product is available for this year
      if (!numericSourceRegistry.isProductAvailableForYear(config.product_id, config.year)) {
        return {
          sourceId: config.sourceId,
          product_id: config.product_id,
          year: config.year,
          success: false,
          observationsInserted: 0,
          observationsSkipped: 0,
          errors: [`Product ${config.product_id} not available for year ${config.year}`],
          duration: Date.now() - startTime,
          checkpointId: '',
        };
      }

      // 3. Check for existing checkpoint
      const existingCheckpoint = await this.getCheckpoint(
        config.sourceId,
        config.product_id,
        config.year
      );

      if (existingCheckpoint && existingCheckpoint.status === 'completed') {
        console.log(`[Backfill] Year ${config.year} already completed for ${config.product_id}`);
        return {
          sourceId: config.sourceId,
          product_id: config.product_id,
          year: config.year,
          success: true,
          observationsInserted: existingCheckpoint.insertedRecords || 0,
          observationsSkipped: 0,
          errors: [],
          duration: Date.now() - startTime,
          checkpointId: existingCheckpoint.id,
        };
      }

      // 4. Ensure series exists
      const seriesId = await this.ensureSeries(config.sourceId, config.product_id, product);

      // 5. Create/update checkpoint
      const checkpointId = await this.createCheckpoint(
        config.sourceId,
        config.product_id,
        config.year,
        'running'
      );

      // 6. Fetch data for the year
      console.log(`[Backfill] Fetching data for ${config.product_id} year ${config.year}...`);
      const observations = await this.fetcher(config.year, product);
      
      console.log(`[Backfill] Fetched ${observations.length} observations`);

      // 7. Create evidence pack for this backfill run
      const evidencePackId = await this.createEvidencePack(
        config.sourceId,
        config.product_id,
        config.year,
        checkpointId
      );

      // 8. Insert observations
      let inserted = 0;
      let skipped = 0;

      for (const obs of observations) {
        try {
          const exists = await this.checkObservationExists(
            seriesId,
            obs.date,
            obs.regimeTag
          );

          if (exists) {
            skipped++;
            continue;
          }

          await this.insertObservation(
            seriesId,
            obs,
            evidencePackId
          );
          inserted++;
        } catch (err) {
          errors.push(`Failed to insert observation for ${obs.date}: ${err}`);
          console.error(`[Backfill] Insert error:`, err);
        }
      }

      // 9. Update checkpoint
      await this.updateCheckpoint(checkpointId, {
        status: 'completed',
        insertedRecords: inserted,
        skippedRecords: skipped,
        errorCount: errors.length,
      });

      console.log(`[Backfill] Year ${config.year} completed: ${inserted} inserted, ${skipped} skipped`);

      return {
        sourceId: config.sourceId,
        product_id: config.product_id,
        year: config.year,
        success: true,
        observationsInserted: inserted,
        observationsSkipped: skipped,
        errors,
        duration: Date.now() - startTime,
        checkpointId,
      };

    } catch (err) {
      const error = String(err);
      errors.push(error);
      console.error(`[Backfill] Year ${config.year} failed:`, err);

      // Update checkpoint as failed
      const checkpointId = await this.createCheckpoint(
        config.sourceId,
        config.product_id,
        config.year,
        'failed'
      );

      return {
        sourceId: config.sourceId,
        product_id: config.product_id,
        year: config.year,
        success: false,
        observationsInserted: 0,
        observationsSkipped: 0,
        errors,
        duration: Date.now() - startTime,
        checkpointId,
      };
    }
  }

  /**
   * Run backfill for multiple years in reverse order
   */
  async backfillYears(
    sourceId: string,
    product_id: string,
    startYear: number = 2020,
    endYear: number = 2026
  ): Promise<BackfillYearResult[]> {
    const results: BackfillYearResult[] = [];
    
    // Process years in reverse order: 2026, 2025, 2024, ...
    const years = [];
    for (let year = endYear; year >= startYear; year--) {
      years.push(year);
    }

    console.log(`[Backfill] Starting backfill for ${product_id}: years ${years.join(', ')}`);

    for (const year of years) {
      const result = await this.backfillYear({
        sourceId,
        product_id,
        year,
      });
      results.push(result);

      // Stop if we encounter a failure (unless it's just unavailable data)
      if (!result.success && result.errors.length > 0) {
        const isUnavailable = result.errors.some(e => e.includes('not available'));
        if (!isUnavailable) {
          console.error(`[Backfill] Stopping due to error in year ${year}`);
          break;
        }
      }
    }

    return results;
  }

  /**
   * Ensure series exists in database
   */
  private async ensureSeries(
    sourceId: string,
    product_id: string,
    product: NumericProduct & { sourceId: string }
  ): Promise<string> {
    // Check if series exists
    const existing = await this.db!
      .select()
      .from(numericSeries)
      .where(
        and(
          eq(numericSeries.sourceId, sourceId),
          eq(numericSeries.productId, product_id)
        )
      )
      .limit(1);

    if (existing && existing.length > 0) {
      return existing[0].id;
    }

    // Create new series
    const seriesId = `series_${sourceId}_${product_id}_${Date.now()}`;
    
    await this.db!.insert(numericSeries).values({
      id: seriesId,
      sourceId,
      productId: product_id,
      name: product.name,
      nameAr: product.nameAr,
      frequency: product.frequency,
      unit: product.unit,
      regimeTag: product.regimeTag,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return seriesId;
  }

  /**
   * Create evidence pack for backfill run
   */
  private async createEvidencePack(
    sourceId: string,
    product_id: string,
    year: number,
    checkpointId: string
  ): Promise<string> {
    const evidencePackId = `evidence_${sourceId}_${product_id}_${year}_${Date.now()}`;
    
    const source = numericSourceRegistry.getSource(sourceId);
    
    await this.db!.insert(numericEvidencePacks).values({
      id: evidencePackId,
      sourceId,
      productId: product_id,
      year,
      checkpointId,
      runTimestamp: new Date(),
      sourceUrl: source?.baseUrl || '',
      apiVersion: source?.apiVersion,
      rawResponse: null, // Will be populated by specific fetchers
      metadata: {
        backfillYear: year,
        sourceType: source?.type,
      },
      createdAt: new Date(),
    });

    return evidencePackId;
  }

  /**
   * Insert observation
   */
  private async insertObservation(
    seriesId: string,
    obs: ObservationData,
    evidencePackId: string
  ): Promise<void> {
    await this.db!.insert(numericObservations).values({
      id: `obs_${seriesId}_${obs.date.toISOString()}_${Date.now()}`,
      seriesId,
      observationDate: obs.date,
      value: obs.value.toString(),
      unit: obs.unit,
      frequency: obs.frequency,
      regimeTag: obs.regimeTag,
      evidencePackId,
      rawData: obs.rawData || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Check if observation exists
   */
  private async checkObservationExists(
    seriesId: string,
    date: Date,
    regimeTag: string
  ): Promise<boolean> {
    const existing = await this.db!
      .select()
      .from(numericObservations)
      .where(
        and(
          eq(numericObservations.seriesId, seriesId),
          eq(numericObservations.observationDate, date),
          eq(numericObservations.regimeTag, regimeTag)
        )
      )
      .limit(1);

    return existing && existing.length > 0;
  }

  /**
   * Get checkpoint
   */
  private async getCheckpoint(
    sourceId: string,
    product_id: string,
    year: number
  ): Promise<any> {
    const checkpointId = this.makeCheckpointId(sourceId, product_id, year);
    
    const existing = await this.db!
      .select()
      .from(backfillCheckpoints)
      .where(eq(backfillCheckpoints.id, checkpointId))
      .limit(1);

    return existing && existing.length > 0 ? existing[0] : null;
  }

  /**
   * Create or update checkpoint
   */
  private async createCheckpoint(
    sourceId: string,
    product_id: string,
    year: number,
    status: 'running' | 'paused' | 'completed' | 'failed'
  ): Promise<string> {
    const checkpointId = this.makeCheckpointId(sourceId, product_id, year);
    
    const existing = await this.getCheckpoint(sourceId, product_id, year);

    if (existing) {
      await this.db!
        .update(backfillCheckpoints)
        .set({
          status,
          lastUpdatedAt: new Date(),
        })
        .where(eq(backfillCheckpoints.id, checkpointId));
    } else {
      await this.db!.insert(backfillCheckpoints).values({
        id: checkpointId,
        datasetId: `${sourceId}_${product_id}`,
        indicatorCode: product_id,
        sourceId: null, // Will be set by source ID lookup
        lastProcessedDate: new Date(`${year}-12-31`),
        totalDays: 365,
        processedDays: 0,
        insertedRecords: 0,
        skippedRecords: 0,
        errorCount: 0,
        status,
        startedAt: new Date(),
        lastUpdatedAt: new Date(),
        metadata: { year, sourceId, product_id },
      });
    }

    return checkpointId;
  }

  /**
   * Update checkpoint
   */
  private async updateCheckpoint(
    checkpointId: string,
    updates: {
      status?: 'running' | 'paused' | 'completed' | 'failed';
      insertedRecords?: number;
      skippedRecords?: number;
      errorCount?: number;
    }
  ): Promise<void> {
    await this.db!
      .update(backfillCheckpoints)
      .set({
        ...updates,
        lastUpdatedAt: new Date(),
        completedAt: updates.status === 'completed' ? new Date() : undefined,
      })
      .where(eq(backfillCheckpoints.id, checkpointId));
  }

  /**
   * Make checkpoint ID
   */
  private makeCheckpointId(sourceId: string, product_id: string, year: number): string {
    return `checkpoint_${sourceId}_${product_id}_${year}`;
  }
}

// ============================================================================
// BATCH BACKFILL ORCHESTRATOR
// ============================================================================

export interface BatchBackfillConfig {
  products: string[]; // product IDs to backfill
  startYear?: number;
  endYear?: number;
  parallelism?: number; // Number of products to process in parallel
}

export class BatchBackfillOrchestrator {
  /**
   * Run batch backfill across multiple products
   */
  async runBatchBackfill(
    config: BatchBackfillConfig,
    fetchers: Map<string, DataFetcher>
  ): Promise<Map<string, BackfillYearResult[]>> {
    const results = new Map<string, BackfillYearResult[]>();
    const startYear = config.startYear || 2020;
    const endYear = config.endYear || 2026;

    console.log(`[BatchBackfill] Starting batch backfill for ${config.products.length} products`);
    console.log(`[BatchBackfill] Year range: ${startYear}-${endYear}`);

    for (const productId of config.products) {
      const product = numericSourceRegistry.getProduct(productId);
      if (!product) {
        console.error(`[BatchBackfill] Product ${productId} not found`);
        continue;
      }

      const fetcher = fetchers.get(product.sourceId);
      if (!fetcher) {
        console.error(`[BatchBackfill] No fetcher available for source ${product.sourceId}`);
        continue;
      }

      const runner = new NumericBackfillRunner(fetcher);
      const productResults = await runner.backfillYears(
        product.sourceId,
        productId,
        startYear,
        endYear
      );

      results.set(productId, productResults);
    }

    return results;
  }

  /**
   * Get backfill progress summary
   */
  getSummary(results: Map<string, BackfillYearResult[]>): {
    totalProducts: number;
    totalYears: number;
    successfulYears: number;
    failedYears: number;
    totalObservations: number;
    totalErrors: number;
  } {
    let totalYears = 0;
    let successfulYears = 0;
    let failedYears = 0;
    let totalObservations = 0;
    let totalErrors = 0;

    for (const productResults of results.values()) {
      for (const result of productResults) {
        totalYears++;
        if (result.success) {
          successfulYears++;
        } else {
          failedYears++;
        }
        totalObservations += result.observationsInserted;
        totalErrors += result.errors.length;
      }
    }

    return {
      totalProducts: results.size,
      totalYears,
      successfulYears,
      failedYears,
      totalObservations,
      totalErrors,
    };
  }
}
