/**
 * Numeric Backfill Runner
 * 
 * Populates database with real numeric series from DATA_NUMERIC sources
 * Backfills by year: 2026 → 2020, then 2019 → 2010
 * Stores observations at native frequency (daily/weekly/monthly/quarterly/annual)
 * Strict regime_tag separation (never merge Aden/Sana'a)
 */

import { getDb } from '../db';
import { sql } from 'drizzle-orm';

export interface BackfillCheckpoint {
  id: number;
  sourceRegistryId: number;
  productId?: number;
  indicatorCode: string;
  year: number;
  regimeTag: 'aden_irg' | 'sanaa_defacto' | 'mixed' | 'unified' | 'unknown';
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  observationsIngested: number;
}

/**
 * Create backfill checkpoints for numeric products
 */
export async function createNumericBackfillCheckpoints(): Promise<{
  checkpointsCreated: number;
  errors: string[];
}> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  let checkpointsCreated = 0;
  const errors: string[] = [];

  try {
    // Get all DATA_NUMERIC products
    const result = await db.execute(sql`
      SELECT 
        sp.id as productId,
        sp.sourceRegistryId,
        sp.productName,
        sp.historicalStart,
        sp.historicalEnd,
        sp.keywords,
        sr.sourceId,
        sr.name as sourceName,
        sr.regimeApplicability
      FROM source_products sp
      JOIN source_registry sr ON sp.sourceRegistryId = sr.id
      WHERE sp.productType IN ('DATA_NUMERIC', 'REGISTRY', 'DATA_GEOSPATIAL', 'PRICE_DATA', 'FORECAST')
        AND sp.isActive = true
        AND sr.status = 'ACTIVE'
    `);

    const products = (result as any)[0] || [];
    console.log(`[NumericBackfillRunner] Found ${products.length} numeric products`);

    for (const product of products) {
      const startYear = product.historicalStart || 2010;
      const endYear = product.historicalEnd || new Date().getFullYear();

      // Determine regime tags based on source
      const regimeTags = determineRegimeTags(product.regimeApplicability);

      // Extract indicator code from keywords or product name
      const indicatorCode = extractIndicatorCode(product.productName, product.keywords);

      // Priority years: 2026 → 2020, then 2019 → 2010
      const years = [];
      for (let y = 2026; y >= Math.max(startYear, 2020) && y <= endYear; y--) {
        years.push(y);
      }
      for (let y = 2019; y >= startYear && y >= 2010; y--) {
        years.push(y);
      }

      for (const year of years) {
        for (const regimeTag of regimeTags) {
          try {
            // Check if checkpoint exists
            const existingResult = await db.execute(sql`
              SELECT id FROM numeric_backfill_checkpoint
              WHERE sourceRegistryId = ${product.sourceRegistryId}
                AND indicatorCode = ${indicatorCode}
                AND year = ${year}
                AND regimeTag = ${regimeTag}
              LIMIT 1
            `);

            if ((existingResult as any)[0]?.length === 0) {
              // Create checkpoint
              await db.execute(sql`
                INSERT INTO numeric_backfill_checkpoint (
                  sourceRegistryId, productId, indicatorCode, year, regimeTag,
                  status, observationsIngested, createdAt, updatedAt
                ) VALUES (
                  ${product.sourceRegistryId},
                  ${product.productId},
                  ${indicatorCode},
                  ${year},
                  ${regimeTag},
                  'PLANNED',
                  0,
                  NOW(),
                  NOW()
                )
              `);
              checkpointsCreated++;
            }
          } catch (error) {
            errors.push(`Failed to create checkpoint for ${product.sourceName} ${indicatorCode} (${year}, ${regimeTag}): ${error}`);
          }
        }
      }
    }

    console.log(`[NumericBackfillRunner] Created ${checkpointsCreated} numeric backfill checkpoints`);
    return { checkpointsCreated, errors };
  } catch (error) {
    console.error('[NumericBackfillRunner] Failed to create checkpoints:', error);
    throw error;
  }
}

/**
 * Get next checkpoint to process
 */
export async function getNextNumericCheckpoint(): Promise<BackfillCheckpoint | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.execute(sql`
      SELECT * FROM numeric_backfill_checkpoint
      WHERE status = 'PLANNED'
      ORDER BY year DESC
      LIMIT 1
    `);

    return (result as any)[0]?.[0] || null;
  } catch (error) {
    console.error('[NumericBackfillRunner] Failed to get next checkpoint:', error);
    return null;
  }
}

/**
 * Mark checkpoint as in progress
 */
export async function markCheckpointInProgress(checkpointId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.execute(sql`
      UPDATE numeric_backfill_checkpoint
      SET status = 'IN_PROGRESS', lastAttemptAt = NOW(), updatedAt = NOW()
      WHERE id = ${checkpointId}
    `);
    return true;
  } catch (error) {
    console.error('[NumericBackfillRunner] Failed to mark checkpoint in progress:', error);
    return false;
  }
}

/**
 * Mark checkpoint as completed
 */
export async function markCheckpointCompleted(
  checkpointId: number,
  observationsIngested: number,
  lastValue?: number,
  lastDate?: Date
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.execute(sql`
      UPDATE numeric_backfill_checkpoint
      SET status = 'COMPLETED',
          observationsIngested = ${observationsIngested},
          lastValue = ${lastValue || null},
          lastDate = ${lastDate || null},
          completedAt = NOW(),
          updatedAt = NOW()
      WHERE id = ${checkpointId}
    `);
    return true;
  } catch (error) {
    console.error('[NumericBackfillRunner] Failed to mark checkpoint completed:', error);
    return false;
  }
}

/**
 * Detect contradictions between sources
 */
export async function detectContradictions(
  indicatorCode: string,
  regimeTag: string,
  date: Date,
  threshold: number = 15.0
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    // Find overlapping observations from different sources
    const result = await db.execute(sql`
      SELECT 
        ts1.sourceId as sourceA,
        ts1.value as valueA,
        ts2.sourceId as sourceB,
        ts2.value as valueB,
        ABS((ts1.value - ts2.value) / ts1.value * 100) as variance
      FROM time_series ts1
      JOIN time_series ts2 ON ts1.indicatorCode = ts2.indicatorCode
        AND ts1.regimeTag = ts2.regimeTag
        AND DATE(ts1.date) = DATE(ts2.date)
        AND ts1.sourceId < ts2.sourceId
      WHERE ts1.indicatorCode = ${indicatorCode}
        AND ts1.regimeTag = ${regimeTag}
        AND DATE(ts1.date) = DATE(${date})
        AND ABS((ts1.value - ts2.value) / ts1.value * 100) > ${threshold}
    `);

    const contradictions = (result as any)[0] || [];

    for (const contradiction of contradictions) {
      const contradictionId = `CONTRA_${indicatorCode}_${regimeTag}_${date.toISOString().split('T')[0]}_${contradiction.sourceA}_${contradiction.sourceB}`;

      // Check if already registered
      const existingResult = await db.execute(sql`
        SELECT id FROM contradiction_registry WHERE contradictionId = ${contradictionId}
      `);

      if ((existingResult as any)[0]?.length === 0) {
        // Register contradiction
        await db.execute(sql`
          INSERT INTO contradiction_registry (
            contradictionId, indicatorCode, regimeTag, date,
            sourceA_registryId, sourceA_value,
            sourceB_registryId, sourceB_value,
            variance_percent, status, createdAt, updatedAt
          ) VALUES (
            ${contradictionId},
            ${indicatorCode},
            ${regimeTag},
            ${date},
            ${contradiction.sourceA},
            ${contradiction.valueA},
            ${contradiction.sourceB},
            ${contradiction.valueB},
            ${contradiction.variance},
            'DETECTED',
            NOW(),
            NOW()
          )
        `);

        console.log(`[NumericBackfillRunner] Detected contradiction: ${contradictionId} (${contradiction.variance.toFixed(2)}% variance)`);
      }
    }
  } catch (error) {
    console.error('[NumericBackfillRunner] Failed to detect contradictions:', error);
  }
}

// Helper functions

function determineRegimeTags(regimeApplicability?: string): Array<'aden_irg' | 'sanaa_defacto' | 'mixed' | 'unified'> {
  if (!regimeApplicability) return ['unified'];
  
  const normalized = regimeApplicability.toUpperCase();
  if (normalized === 'BOTH' || normalized === 'MIXED') return ['aden_irg', 'sanaa_defacto'];
  if (normalized === 'ADEN_IRG') return ['aden_irg'];
  if (normalized === 'SANAA_DFA') return ['sanaa_defacto'];
  return ['unified'];
}

function extractIndicatorCode(productName: string, keywords?: any): string {
  // Try to extract from keywords
  if (keywords) {
    try {
      const parsed = typeof keywords === 'string' ? JSON.parse(keywords) : keywords;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');
      }
    } catch {}
  }

  // Fallback: derive from product name
  return productName.toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .substring(0, 100);
}
