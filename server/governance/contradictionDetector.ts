/**
 * YETO Platform - Contradiction Detector Service
 * Section 8C: Data Governance - Contradiction Detection
 * 
 * Detects conflicting values for same indicator/time/geo:
 * - Stores both conflicting values
 * - Shows discrepancy view with explanations
 * - Explains plausible reasons for contradictions
 */

import { getDb } from '../db';
import { dataContradictions, sourceRegistry, timeSeries } from '../../drizzle/schema';
import { eq, desc, and } from 'drizzle-orm';

// Types for contradiction detection
export interface ContradictionInput {
  indicatorCode: string;
  date: Date;
  regimeTag: 'aden_irg' | 'sanaa_defacto' | 'mixed' | 'unknown';
  value1: number;
  source1Id: number;
  value2: number;
  source2Id: number;
}

export interface ContradictionResult {
  id: number;
  indicatorCode: string;
  date: Date;
  regimeTag: string;
  value1: number;
  source1: string;
  value2: number;
  source2: string;
  discrepancyPercent: number;
  discrepancyType: 'minor' | 'significant' | 'major' | 'critical';
  plausibleReasons: string[];
  status: 'detected' | 'investigating' | 'explained' | 'resolved';
  resolvedValue?: number;
  resolvedSource?: string;
  detectedAt: Date;
  resolvedAt?: Date;
}

// Discrepancy thresholds
const DISCREPANCY_THRESHOLDS = {
  minor: 5,      // < 5% = minor
  significant: 15, // 5-15% = significant
  major: 30,     // 15-30% = major
  // > 30% = critical
};

// Common reasons for contradictions
const COMMON_CONTRADICTION_REASONS = {
  methodology: {
    en: 'Different calculation methodologies used by sources',
    ar: 'منهجيات حساب مختلفة مستخدمة من قبل المصادر',
  },
  timing: {
    en: 'Data collected at different points in time',
    ar: 'تم جمع البيانات في نقاط زمنية مختلفة',
  },
  coverage: {
    en: 'Different geographic or demographic coverage',
    ar: 'تغطية جغرافية أو ديموغرافية مختلفة',
  },
  revision: {
    en: 'One source may have revised data not yet reflected in other',
    ar: 'قد يكون أحد المصادر قد راجع البيانات التي لم تنعكس بعد في المصدر الآخر',
  },
  regime: {
    en: 'Different administrative zones or regime-specific reporting',
    ar: 'مناطق إدارية مختلفة أو تقارير خاصة بالنظام',
  },
  exchange_rate: {
    en: 'Different exchange rates used for currency conversion',
    ar: 'أسعار صرف مختلفة مستخدمة لتحويل العملات',
  },
  sampling: {
    en: 'Different sampling methods or sample sizes',
    ar: 'طرق أخذ عينات مختلفة أو أحجام عينات مختلفة',
  },
};

export class ContradictionDetectorService {
  
  /**
   * Detect and record a contradiction between two data sources
   */
  async detectContradiction(input: ContradictionInput): Promise<ContradictionResult> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    
    // Calculate discrepancy
    const avgValue = (input.value1 + input.value2) / 2;
    const discrepancyPercent = avgValue !== 0 
      ? Math.abs(input.value1 - input.value2) / avgValue * 100 
      : 0;
    
    // Determine discrepancy type
    const discrepancyType = this.classifyDiscrepancy(discrepancyPercent);
    
    // Generate plausible reasons
    const plausibleReasons = this.generatePlausibleReasons(input, discrepancyType);
    
    // Get source names
    const source1Results = await db.select().from(sourceRegistry).where(eq(sourceRegistry.id, input.source1Id));
    const source2Results = await db.select().from(sourceRegistry).where(eq(sourceRegistry.id, input.source2Id));
    const source1Name = source1Results[0]?.name || 'Unknown Source';
    const source2Name = source2Results[0]?.name || 'Unknown Source';
    
    // Insert contradiction record
    const result = await db.insert(dataContradictions).values({
      indicatorCode: input.indicatorCode,
      date: input.date,
      regimeTag: input.regimeTag,
      value1: input.value1.toString(),
      source1Id: input.source1Id,
      value2: input.value2.toString(),
      source2Id: input.source2Id,
      discrepancyPercent: discrepancyPercent.toFixed(2),
      discrepancyType,
      plausibleReasons,
      status: 'detected',
    });
    
    const insertId = Number((result as unknown as { insertId: number }).insertId);
    
    return {
      id: insertId,
      indicatorCode: input.indicatorCode,
      date: input.date,
      regimeTag: input.regimeTag,
      value1: input.value1,
      source1: source1Name,
      value2: input.value2,
      source2: source2Name,
      discrepancyPercent,
      discrepancyType,
      plausibleReasons,
      status: 'detected',
      detectedAt: new Date(),
    };
  }
  
  /**
   * Scan for contradictions in time series data
   */
  async scanForContradictions(indicatorCode: string): Promise<ContradictionResult[]> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    
    // Get all data points for this indicator
    const dataPoints = await db.select()
      .from(timeSeries)
      .where(eq(timeSeries.indicatorCode, indicatorCode))
      .orderBy(timeSeries.date);
    
    const contradictions: ContradictionResult[] = [];
    
    // Group by date and regime
    const grouped = new Map<string, typeof dataPoints>();
    for (const point of dataPoints) {
      const key = `${point.date.toISOString()}_${point.regimeTag}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(point);
    }
    
    // Check for contradictions within each group
    for (const [key, points] of Array.from(grouped.entries())) {
      if (points.length < 2) continue;
      
      // Compare all pairs
      for (let i = 0; i < points.length - 1; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const p1 = points[i];
          const p2 = points[j];
          
          const val1 = parseFloat(p1.value);
          const val2 = parseFloat(p2.value);
          const avgValue = (val1 + val2) / 2;
          const discrepancyPercent = avgValue !== 0 
            ? Math.abs(val1 - val2) / avgValue * 100 
            : 0;
          
          // Only record if discrepancy is significant
          if (discrepancyPercent >= DISCREPANCY_THRESHOLDS.minor) {
            const contradiction = await this.detectContradiction({
              indicatorCode,
              date: p1.date,
              regimeTag: p1.regimeTag,
              value1: val1,
              source1Id: p1.sourceId,
              value2: val2,
              source2Id: p2.sourceId,
            });
            contradictions.push(contradiction);
          }
        }
      }
    }
    
    return contradictions;
  }
  
  /**
   * Get all contradictions for an indicator
   */
  async getContradictions(indicatorCode: string): Promise<ContradictionResult[]> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    
    const results = await db.select()
      .from(dataContradictions)
      .where(eq(dataContradictions.indicatorCode, indicatorCode))
      .orderBy(desc(dataContradictions.detectedAt));
    
    const contradictions: ContradictionResult[] = [];
    
    for (const row of results) {
      const source1Results = await db.select().from(sourceRegistry).where(eq(sourceRegistry.id, row.source1Id));
      const source2Results = await db.select().from(sourceRegistry).where(eq(sourceRegistry.id, row.source2Id));
      
      contradictions.push({
        id: row.id,
        indicatorCode: row.indicatorCode,
        date: row.date,
        regimeTag: row.regimeTag,
        value1: parseFloat(row.value1),
        source1: source1Results[0]?.name || 'Unknown',
        value2: parseFloat(row.value2),
        source2: source2Results[0]?.name || 'Unknown',
        discrepancyPercent: parseFloat(row.discrepancyPercent),
        discrepancyType: row.discrepancyType,
        plausibleReasons: (row.plausibleReasons as string[]) || [],
        status: row.status,
        resolvedValue: row.resolvedValue ? parseFloat(row.resolvedValue) : undefined,
        detectedAt: row.detectedAt,
        resolvedAt: row.resolvedAt ?? undefined,
      });
    }
    
    return contradictions;
  }
  
  /**
   * Resolve a contradiction
   */
  async resolveContradiction(
    contradictionId: number,
    resolution: {
      resolvedValue: number;
      resolvedSourceId: number;
      resolutionNotes: string;
      resolvedBy: number;
    }
  ): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    
    await db.update(dataContradictions)
      .set({
        status: 'resolved',
        resolvedValue: resolution.resolvedValue.toString(),
        resolvedSourceId: resolution.resolvedSourceId,
        resolutionNotes: resolution.resolutionNotes,
        resolvedAt: new Date(),
        resolvedBy: resolution.resolvedBy,
      })
      .where(eq(dataContradictions.id, contradictionId));
  }
  
  /**
   * Update contradiction status
   */
  async updateStatus(
    contradictionId: number,
    status: 'investigating' | 'explained' | 'resolved',
    notes?: string
  ): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    
    const updates: Record<string, unknown> = { status };
    if (notes) {
      updates.resolutionNotes = notes;
    }
    
    await db.update(dataContradictions)
      .set(updates)
      .where(eq(dataContradictions.id, contradictionId));
  }
  
  /**
   * Classify discrepancy severity
   */
  private classifyDiscrepancy(percent: number): 'minor' | 'significant' | 'major' | 'critical' {
    if (percent < DISCREPANCY_THRESHOLDS.minor) return 'minor';
    if (percent < DISCREPANCY_THRESHOLDS.significant) return 'significant';
    if (percent < DISCREPANCY_THRESHOLDS.major) return 'major';
    return 'critical';
  }
  
  /**
   * Generate plausible reasons for contradiction
   */
  private generatePlausibleReasons(
    input: ContradictionInput,
    discrepancyType: string
  ): string[] {
    const reasons: string[] = [];
    
    // Always include methodology as a possibility
    reasons.push(COMMON_CONTRADICTION_REASONS.methodology.en);
    
    // Add timing if relevant
    reasons.push(COMMON_CONTRADICTION_REASONS.timing.en);
    
    // Add regime-specific reason for Yemen context
    if (input.regimeTag === 'mixed' || input.regimeTag === 'unknown') {
      reasons.push(COMMON_CONTRADICTION_REASONS.regime.en);
    }
    
    // Add exchange rate reason for monetary indicators
    if (input.indicatorCode.includes('fx') || 
        input.indicatorCode.includes('currency') ||
        input.indicatorCode.includes('gdp') ||
        input.indicatorCode.includes('trade')) {
      reasons.push(COMMON_CONTRADICTION_REASONS.exchange_rate.en);
    }
    
    // Add coverage reason for significant+ discrepancies
    if (discrepancyType !== 'minor') {
      reasons.push(COMMON_CONTRADICTION_REASONS.coverage.en);
    }
    
    // Add sampling reason for survey-based indicators
    if (input.indicatorCode.includes('poverty') ||
        input.indicatorCode.includes('unemployment') ||
        input.indicatorCode.includes('survey')) {
      reasons.push(COMMON_CONTRADICTION_REASONS.sampling.en);
    }
    
    return reasons;
  }
  
  /**
   * Get contradiction summary statistics
   */
  async getContradictionStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    recentDetections: number;
  }> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    
    const all = await db.select().from(dataContradictions);
    
    const byStatus: Record<string, number> = {
      detected: 0,
      investigating: 0,
      explained: 0,
      resolved: 0,
    };
    
    const byType: Record<string, number> = {
      minor: 0,
      significant: 0,
      major: 0,
      critical: 0,
    };
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    let recentDetections = 0;
    
    for (const row of all) {
      byStatus[row.status]++;
      byType[row.discrepancyType]++;
      if (row.detectedAt > oneWeekAgo) {
        recentDetections++;
      }
    }
    
    return {
      total: all.length,
      byStatus,
      byType,
      recentDetections,
    };
  }
}

// Export singleton instance
export const contradictionDetectorService = new ContradictionDetectorService();
