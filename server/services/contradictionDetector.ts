/**
 * Data Contradiction Detector
 * 
 * Detects and manages contradictions between multiple sources:
 * - Triggered when variance > 15% for same indicator/date
 * - Stores both values (never averages silently)
 * - Triggers "disagreement mode" for human review
 * - Tracks resolution workflow
 * 
 * RULES:
 * - NEVER average conflicting values automatically
 * - NEVER discard one value in favor of another without explicit human decision
 * - ALWAYS flag contradictions for review
 * - Store both/all contradicting observations with full provenance
 */

import { getDb } from '../db';
import { 
  dataContradictions, 
  numericObservations,
  numericSeries,
  type InsertDataContradiction 
} from '../../drizzle/schema';
import { eq, and, sql } from 'drizzle-orm';

// ============================================================================
// TYPES
// ============================================================================

export interface ContradictionDetection {
  indicatorCode: string;
  observationDate: Date;
  regimeTag: string;
  observation1: {
    id: string;
    value: number;
    source: string;
  };
  observation2: {
    id: string;
    value: number;
    source: string;
  };
  variancePercent: number;
  varianceAbsolute: number;
  isSignificant: boolean; // true if variance > 15%
}

export interface ContradictionResolution {
  contradictionId: number;
  resolution: string;
  preferredObservationId?: string;
  resolvedBy: number;
}

// ============================================================================
// CONTRADICTION DETECTOR
// ============================================================================

export class ContradictionDetector {
  private db: Awaited<ReturnType<typeof getDb>>;
  private readonly VARIANCE_THRESHOLD = 15.0; // 15% variance triggers contradiction

  async init() {
    if (!this.db) {
      this.db = await getDb();
      if (!this.db) {
        throw new Error('Database connection failed');
      }
    }
  }

  /**
   * Check for contradictions when inserting a new observation
   * Returns contradiction detection if found
   */
  async checkForContradictions(
    seriesId: string,
    observationDate: Date,
    newValue: number,
    newObservationId: string,
    newSource: string,
    regimeTag: string
  ): Promise<ContradictionDetection | null> {
    await this.init();

    // Get series metadata
    const series = await this.db!
      .select()
      .from(numericSeries)
      .where(eq(numericSeries.id, seriesId))
      .limit(1);

    if (!series || series.length === 0) {
      return null;
    }

    const indicatorCode = series[0].productId; // Using productId as indicator code

    // Find existing observations for same date/regime
    const existingObs = await this.db!
      .select()
      .from(numericObservations)
      .where(
        and(
          eq(numericObservations.seriesId, seriesId),
          eq(numericObservations.observationDate, observationDate),
          eq(numericObservations.regimeTag, regimeTag)
        )
      );

    if (existingObs.length === 0) {
      return null; // No existing observation, no contradiction
    }

    // Check variance with each existing observation
    for (const existing of existingObs) {
      if (existing.id === newObservationId) {
        continue; // Skip self
      }

      const existingValue = parseFloat(existing.value);
      const varianceAbsolute = Math.abs(newValue - existingValue);
      const variancePercent = (varianceAbsolute / existingValue) * 100;

      if (variancePercent > this.VARIANCE_THRESHOLD) {
        // Significant contradiction detected!
        const detection: ContradictionDetection = {
          indicatorCode,
          observationDate,
          regimeTag,
          observation1: {
            id: existing.id,
            value: existingValue,
            source: existing.seriesId, // Will be enhanced with actual source name
          },
          observation2: {
            id: newObservationId,
            value: newValue,
            source: newSource,
          },
          variancePercent: Math.round(variancePercent * 100) / 100,
          varianceAbsolute: Math.round(varianceAbsolute * 100) / 100,
          isSignificant: true,
        };

        // Store contradiction
        await this.storeContradiction(detection);

        return detection;
      }
    }

    return null; // No significant contradiction
  }

  /**
   * Store contradiction in database
   */
  private async storeContradiction(detection: ContradictionDetection): Promise<number> {
    await this.init();

    const result = await this.db!.insert(dataContradictions).values({
      indicatorCode: detection.indicatorCode,
      observationDate: detection.observationDate,
      regimeTag: detection.regimeTag as any,
      observation1Id: detection.observation1.id,
      observation1Value: detection.observation1.value.toString(),
      observation1Source: detection.observation1.source,
      observation2Id: detection.observation2.id,
      observation2Value: detection.observation2.value.toString(),
      observation2Source: detection.observation2.source,
      variancePercent: detection.variancePercent.toString(),
      varianceAbsolute: detection.varianceAbsolute.toString(),
      status: 'unresolved',
      detectedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`[Contradiction] Detected: ${detection.indicatorCode} on ${detection.observationDate.toISOString().split('T')[0]}`);
    console.log(`[Contradiction] Variance: ${detection.variancePercent}% (${detection.varianceAbsolute} absolute)`);
    console.log(`[Contradiction] Values: ${detection.observation1.value} vs ${detection.observation2.value}`);

    return result[0].insertId;
  }

  /**
   * Get all unresolved contradictions
   */
  async getUnresolvedContradictions(): Promise<any[]> {
    await this.init();

    const contradictions = await this.db!
      .select()
      .from(dataContradictions)
      .where(eq(dataContradictions.status, 'unresolved'))
      .orderBy(dataContradictions.detectedAt);

    return contradictions;
  }

  /**
   * Get contradictions by indicator
   */
  async getContradictionsByIndicator(indicatorCode: string): Promise<any[]> {
    await this.init();

    const contradictions = await this.db!
      .select()
      .from(dataContradictions)
      .where(eq(dataContradictions.indicatorCode, indicatorCode))
      .orderBy(dataContradictions.observationDate);

    return contradictions;
  }

  /**
   * Get contradiction statistics
   */
  async getContradictionStatistics(): Promise<{
    total: number;
    unresolved: number;
    investigating: number;
    resolved: number;
    acceptedVariance: number;
    byIndicator: Record<string, number>;
    avgVariancePercent: number;
  }> {
    await this.init();

    const all = await this.db!
      .select()
      .from(dataContradictions);

    const byStatus = {
      unresolved: all.filter(c => c.status === 'unresolved').length,
      investigating: all.filter(c => c.status === 'investigating').length,
      resolved: all.filter(c => c.status === 'resolved').length,
      acceptedVariance: all.filter(c => c.status === 'accepted_variance').length,
    };

    const byIndicator: Record<string, number> = {};
    let totalVariance = 0;

    all.forEach(c => {
      byIndicator[c.indicatorCode] = (byIndicator[c.indicatorCode] || 0) + 1;
      totalVariance += parseFloat(c.variancePercent);
    });

    return {
      total: all.length,
      ...byStatus,
      byIndicator,
      avgVariancePercent: all.length > 0 ? totalVariance / all.length : 0,
    };
  }

  /**
   * Resolve contradiction
   */
  async resolveContradiction(resolution: ContradictionResolution): Promise<void> {
    await this.init();

    await this.db!
      .update(dataContradictions)
      .set({
        status: 'resolved',
        resolution: resolution.resolution,
        preferredObservationId: resolution.preferredObservationId,
        resolvedBy: resolution.resolvedBy,
        resolvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(dataContradictions.id, resolution.contradictionId));

    console.log(`[Contradiction] Resolved: ID ${resolution.contradictionId}`);
  }

  /**
   * Mark contradiction as accepted variance (both values are valid)
   */
  async acceptVariance(contradictionId: number, reason: string, userId: number): Promise<void> {
    await this.init();

    await this.db!
      .update(dataContradictions)
      .set({
        status: 'accepted_variance',
        resolution: reason,
        resolvedBy: userId,
        resolvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(dataContradictions.id, contradictionId));

    console.log(`[Contradiction] Accepted variance: ID ${contradictionId}`);
  }

  /**
   * Mark contradiction as under investigation
   */
  async markInvestigating(contradictionId: number): Promise<void> {
    await this.init();

    await this.db!
      .update(dataContradictions)
      .set({
        status: 'investigating',
        updatedAt: new Date(),
      })
      .where(eq(dataContradictions.id, contradictionId));
  }

  /**
   * Get detailed contradiction info with full observation data
   */
  async getContradictionDetails(contradictionId: number): Promise<any> {
    await this.init();

    const [contradiction] = await this.db!
      .select()
      .from(dataContradictions)
      .where(eq(dataContradictions.id, contradictionId))
      .limit(1);

    if (!contradiction) {
      return null;
    }

    // Fetch full observation details
    const obs1 = await this.db!
      .select()
      .from(numericObservations)
      .where(eq(numericObservations.id, contradiction.observation1Id))
      .limit(1);

    const obs2 = await this.db!
      .select()
      .from(numericObservations)
      .where(eq(numericObservations.id, contradiction.observation2Id))
      .limit(1);

    return {
      ...contradiction,
      observation1Details: obs1[0] || null,
      observation2Details: obs2[0] || null,
    };
  }

  /**
   * Batch check for contradictions across all observations
   * Useful for retroactive contradiction detection
   */
  async scanForContradictions(
    startDate?: Date,
    endDate?: Date
  ): Promise<ContradictionDetection[]> {
    await this.init();

    console.log('[Contradiction] Starting batch scan for contradictions...');

    const detections: ContradictionDetection[] = [];

    // Get all unique series/date/regime combinations with multiple observations
    const query = sql`
      SELECT 
        seriesId,
        observationDate,
        regimeTag,
        COUNT(*) as count
      FROM numeric_observations
      ${startDate ? sql`WHERE observationDate >= ${startDate}` : sql``}
      ${endDate ? sql`AND observationDate <= ${endDate}` : sql``}
      GROUP BY seriesId, observationDate, regimeTag
      HAVING count > 1
    `;

    const duplicates = await this.db!.execute(query);

    // Check each duplicate group for contradictions
    for (const dup of (duplicates as any)[0] || []) {
      const observations = await this.db!
        .select()
        .from(numericObservations)
        .where(
          and(
            eq(numericObservations.seriesId, dup.seriesId),
            eq(numericObservations.observationDate, dup.observationDate),
            eq(numericObservations.regimeTag, dup.regimeTag)
          )
        );

      // Compare all pairs
      for (let i = 0; i < observations.length; i++) {
        for (let j = i + 1; j < observations.length; j++) {
          const obs1 = observations[i];
          const obs2 = observations[j];

          const value1 = parseFloat(obs1.value);
          const value2 = parseFloat(obs2.value);

          const varianceAbsolute = Math.abs(value1 - value2);
          const variancePercent = (varianceAbsolute / value1) * 100;

          if (variancePercent > this.VARIANCE_THRESHOLD) {
            const series = await this.db!
              .select()
              .from(numericSeries)
              .where(eq(numericSeries.id, obs1.seriesId))
              .limit(1);

            const detection: ContradictionDetection = {
              indicatorCode: series[0].productId,
              observationDate: obs1.observationDate,
              regimeTag: obs1.regimeTag,
              observation1: {
                id: obs1.id,
                value: value1,
                source: obs1.seriesId,
              },
              observation2: {
                id: obs2.id,
                value: value2,
                source: obs2.seriesId,
              },
              variancePercent: Math.round(variancePercent * 100) / 100,
              varianceAbsolute: Math.round(varianceAbsolute * 100) / 100,
              isSignificant: true,
            };

            // Check if already stored
            const existing = await this.db!
              .select()
              .from(dataContradictions)
              .where(
                and(
                  eq(dataContradictions.observation1Id, obs1.id),
                  eq(dataContradictions.observation2Id, obs2.id)
                )
              )
              .limit(1);

            if (!existing || existing.length === 0) {
              await this.storeContradiction(detection);
              detections.push(detection);
            }
          }
        }
      }
    }

    console.log(`[Contradiction] Scan complete: ${detections.length} new contradictions detected`);

    return detections;
  }
}

// Singleton instance
export const contradictionDetector = new ContradictionDetector();
