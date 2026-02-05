#!/usr/bin/env tsx
/**
 * Generate Sector Coaching Packs - Nightly Build
 * 
 * This script generates coaching packs for all sector agents by:
 * 1. Aggregating top indicator changes
 * 2. Collecting recent documents
 * 3. Identifying active contradictions
 * 4. Documenting open gaps
 * 5. Storing versioned packs with drift logs
 * 
 * Run nightly at 02:00 UTC via cron
 */

import { getDb } from "../server/db";
import { sql } from "drizzle-orm";
import {
  getAllSectorDefinitions,
  generateSectorContextPack,
  saveSectorContextPack,
  getLatestContextPack,
  type SectorContextPack
} from "../server/services/sectorAgentService";

interface CoachingPackDrift {
  sectorCode: string;
  previousPackDate: Date;
  newPackDate: Date;
  indicatorsAdded: number;
  indicatorsRemoved: number;
  indicatorsChanged: number;
  documentsAdded: number;
  contradictionsAdded: number;
  contradictionsResolved: number;
  gapsAdded: number;
  gapsClosed: number;
}

/**
 * Main execution function
 */
async function generateAllCoachingPacks() {
  console.log('[CoachingPacks] Starting nightly generation...');
  const startTime = Date.now();

  try {
    // Get all active sectors
    const sectors = await getAllSectorDefinitions();
    console.log(`[CoachingPacks] Found ${sectors.length} active sectors`);

    const driftLogs: CoachingPackDrift[] = [];

    // Generate coaching pack for each sector
    for (const sector of sectors) {
      try {
        console.log(`[CoachingPacks] Generating pack for ${sector.sectorCode}...`);

        // Get previous context pack for drift analysis
        const previousPack = await getLatestContextPack(sector.sectorCode);

        // Generate new context pack
        const newPack = await generateSectorContextPack(sector.sectorCode);

        // Calculate drift if there was a previous pack
        if (previousPack) {
          const drift = calculateDrift(previousPack, newPack);
          driftLogs.push(drift);
          console.log(`[CoachingPacks] Drift for ${sector.sectorCode}:`, {
            indicatorsChanged: drift.indicatorsChanged,
            documentsAdded: drift.documentsAdded,
            contradictionsAdded: drift.contradictionsAdded,
            gapsAdded: drift.gapsAdded
          });
        }

        // Save the new pack
        const packId = await saveSectorContextPack(newPack);
        if (packId) {
          console.log(`[CoachingPacks] Saved pack ${packId} for ${sector.sectorCode}`);
        } else {
          console.error(`[CoachingPacks] Failed to save pack for ${sector.sectorCode}`);
        }

        // Add a small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`[CoachingPacks] Error generating pack for ${sector.sectorCode}:`, error);
        // Continue with next sector
      }
    }

    // Save drift logs
    await saveDriftLogs(driftLogs);

    const duration = Date.now() - startTime;
    console.log(`[CoachingPacks] Completed in ${duration}ms`);
    console.log(`[CoachingPacks] Generated ${sectors.length} packs with ${driftLogs.length} drift logs`);

    // Generate summary report
    await generateSummaryReport({
      totalSectors: sectors.length,
      successfulPacks: sectors.length - driftLogs.filter(d => !d).length,
      totalDurationMs: duration,
      driftLogs
    });

  } catch (error) {
    console.error('[CoachingPacks] Fatal error:', error);
    process.exit(1);
  }
}

/**
 * Calculate drift between two context packs
 */
function calculateDrift(previous: SectorContextPack, current: SectorContextPack): CoachingPackDrift {
  // Create sets of indicator codes for comparison
  const prevIndicatorCodes = new Set(previous.keyIndicators.map(i => i.indicatorCode));
  const currIndicatorCodes = new Set(current.keyIndicators.map(i => i.indicatorCode));

  const indicatorsAdded = [...currIndicatorCodes].filter(code => !prevIndicatorCodes.has(code)).length;
  const indicatorsRemoved = [...prevIndicatorCodes].filter(code => !currIndicatorCodes.has(code)).length;

  // Count changed values
  let indicatorsChanged = 0;
  for (const currInd of current.keyIndicators) {
    const prevInd = previous.keyIndicators.find(i => i.indicatorCode === currInd.indicatorCode);
    if (prevInd && prevInd.currentValue !== currInd.currentValue) {
      indicatorsChanged++;
    }
  }

  // Document drift
  const prevDocIds = new Set(previous.topDocuments.map(d => d.documentId));
  const currDocIds = new Set(current.topDocuments.map(d => d.documentId));
  const documentsAdded = [...currDocIds].filter(id => !prevDocIds.has(id)).length;

  // Contradiction drift
  const prevContradictionCodes = new Set(previous.contradictions.map(c => c.indicatorCode));
  const currContradictionCodes = new Set(current.contradictions.map(c => c.indicatorCode));
  const contradictionsAdded = [...currContradictionCodes].filter(code => !prevContradictionCodes.has(code)).length;
  const contradictionsResolved = [...prevContradictionCodes].filter(code => !currContradictionCodes.has(code)).length;

  // Gap drift
  const prevGapDescs = new Set(previous.gaps.map(g => g.descriptionEn));
  const currGapDescs = new Set(current.gaps.map(g => g.descriptionEn));
  const gapsAdded = [...currGapDescs].filter(desc => !prevGapDescs.has(desc)).length;
  const gapsClosed = [...prevGapDescs].filter(desc => !currGapDescs.has(desc)).length;

  return {
    sectorCode: current.sectorCode,
    previousPackDate: previous.packDate,
    newPackDate: current.packDate,
    indicatorsAdded,
    indicatorsRemoved,
    indicatorsChanged,
    documentsAdded,
    contradictionsAdded,
    contradictionsResolved,
    gapsAdded,
    gapsClosed
  };
}

/**
 * Save drift logs to database
 */
async function saveDriftLogs(driftLogs: CoachingPackDrift[]): Promise<void> {
  if (driftLogs.length === 0) return;

  const db = await getDb();
  if (!db) {
    console.error('[CoachingPacks] Database not available for drift logs');
    return;
  }

  try {
    for (const drift of driftLogs) {
      await db.execute(sql`
        INSERT INTO sector_context_pack_drift_logs (
          sectorCode, previousPackDate, newPackDate,
          indicatorsAdded, indicatorsRemoved, indicatorsChanged,
          documentsAdded, contradictionsAdded, contradictionsResolved,
          gapsAdded, gapsClosed, createdAt
        ) VALUES (
          ${drift.sectorCode},
          ${drift.previousPackDate},
          ${drift.newPackDate},
          ${drift.indicatorsAdded},
          ${drift.indicatorsRemoved},
          ${drift.indicatorsChanged},
          ${drift.documentsAdded},
          ${drift.contradictionsAdded},
          ${drift.contradictionsResolved},
          ${drift.gapsAdded},
          ${drift.gapsClosed},
          NOW()
        )
      `);
    }
    console.log(`[CoachingPacks] Saved ${driftLogs.length} drift logs`);
  } catch (error) {
    console.error('[CoachingPacks] Failed to save drift logs:', error);
  }
}

/**
 * Generate summary report
 */
async function generateSummaryReport(summary: {
  totalSectors: number;
  successfulPacks: number;
  totalDurationMs: number;
  driftLogs: CoachingPackDrift[];
}): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    // Calculate aggregates
    const totalIndicatorsChanged = summary.driftLogs.reduce((sum, d) => sum + d.indicatorsChanged, 0);
    const totalContradictionsAdded = summary.driftLogs.reduce((sum, d) => sum + d.contradictionsAdded, 0);
    const totalGapsAdded = summary.driftLogs.reduce((sum, d) => sum + d.gapsAdded, 0);
    const totalGapsClosed = summary.driftLogs.reduce((sum, d) => sum + d.gapsClosed, 0);

    await db.execute(sql`
      INSERT INTO sector_coaching_pack_run_logs (
        runDate, totalSectors, successfulPacks, failedPacks,
        totalDurationMs, totalIndicatorsChanged, totalContradictionsAdded,
        totalGapsAdded, totalGapsClosed, createdAt
      ) VALUES (
        NOW(),
        ${summary.totalSectors},
        ${summary.successfulPacks},
        ${summary.totalSectors - summary.successfulPacks},
        ${summary.totalDurationMs},
        ${totalIndicatorsChanged},
        ${totalContradictionsAdded},
        ${totalGapsAdded},
        ${totalGapsClosed},
        NOW()
      )
    `);

    console.log('[CoachingPacks] Summary report saved');
    console.log({
      totalSectors: summary.totalSectors,
      successfulPacks: summary.successfulPacks,
      totalIndicatorsChanged,
      totalContradictionsAdded,
      totalGapsAdded,
      totalGapsClosed
    });

  } catch (error) {
    console.error('[CoachingPacks] Failed to save summary report:', error);
  }
}

/**
 * Cleanup old coaching packs (keep last 30 days)
 */
async function cleanupOldPacks(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const result = await db.execute(sql`
      DELETE FROM sector_context_packs
      WHERE packDate < DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    console.log(`[CoachingPacks] Cleaned up old packs`);
  } catch (error) {
    console.error('[CoachingPacks] Failed to cleanup old packs:', error);
  }
}

/**
 * Entry point
 */
async function main() {
  console.log('[CoachingPacks] ========================================');
  console.log('[CoachingPacks] Sector Coaching Pack Generation');
  console.log('[CoachingPacks] Run Date:', new Date().toISOString());
  console.log('[CoachingPacks] ========================================');

  // Generate new packs
  await generateAllCoachingPacks();

  // Cleanup old packs
  await cleanupOldPacks();

  console.log('[CoachingPacks] ========================================');
  console.log('[CoachingPacks] Complete!');
  console.log('[CoachingPacks] ========================================');

  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('[CoachingPacks] Unhandled error:', error);
    process.exit(1);
  });
}

export { generateAllCoachingPacks, calculateDrift };
