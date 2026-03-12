/**
 * Data Freshness SLA Service
 * 
 * Monitors data freshness and enforces SLA thresholds:
 * - Tracks last update time for all numeric series
 * - Defines SLA thresholds by frequency (daily/weekly/monthly/quarterly/annual)
 * - Triggers alerts when data becomes stale
 * - Creates GAP tickets automatically for critical staleness
 * 
 * SLA THRESHOLDS:
 * - Daily: Warning at 2 days, Critical at 7 days
 * - Weekly: Warning at 10 days, Critical at 21 days
 * - Monthly: Warning at 45 days, Critical at 90 days
 * - Quarterly: Warning at 120 days, Critical at 180 days
 * - Annual: Warning at 400 days, Critical at 730 days
 */

import { getDb } from '../db';
import { numericSeries, numericObservations, dataGapTickets } from '../../drizzle/schema';
import { eq, sql } from 'drizzle-orm';

// ============================================================================
// TYPES
// ============================================================================

export type SLAStatus = 'fresh' | 'warning' | 'critical' | 'unknown';

export interface FreshnessThreshold {
  warningDays: number;
  criticalDays: number;
}

export const SLA_THRESHOLDS: Record<string, FreshnessThreshold> = {
  daily: { warningDays: 2, criticalDays: 7 },
  weekly: { warningDays: 10, criticalDays: 21 },
  monthly: { warningDays: 45, criticalDays: 90 },
  quarterly: { warningDays: 120, criticalDays: 180 },
  annual: { warningDays: 400, criticalDays: 730 },
};

export interface SeriesFreshness {
  seriesId: string;
  productId: string;
  name: string;
  frequency: string;
  lastObservationDate: Date | null;
  daysSinceLastUpdate: number | null;
  slaStatus: SLAStatus;
  threshold: FreshnessThreshold;
  observationCount: number;
}

export interface FreshnessReport {
  generatedAt: Date;
  totalSeries: number;
  freshCount: number;
  warningCount: number;
  criticalCount: number;
  unknownCount: number;
  series: SeriesFreshness[];
  byFrequency: Record<string, {
    total: number;
    fresh: number;
    warning: number;
    critical: number;
  }>;
}

// ============================================================================
// DATA FRESHNESS SLA SERVICE
// ============================================================================

export class DataFreshnessSLAService {
  private db: Awaited<ReturnType<typeof getDb>>;

  async init() {
    if (!this.db) {
      this.db = await getDb();
      if (!this.db) {
        throw new Error('Database connection failed');
      }
    }
  }

  /**
   * Check freshness for all numeric series
   */
  async checkAllSeries(): Promise<FreshnessReport> {
    await this.init();

    const now = new Date();
    const seriesList: SeriesFreshness[] = [];

    // Get all series
    const allSeries = await this.db!.select().from(numericSeries);

    for (const series of allSeries) {
      const freshness = await this.checkSeriesFreshness(series.id);
      if (freshness) {
        seriesList.push(freshness);
      }
    }

    // Calculate statistics
    const freshCount = seriesList.filter(s => s.slaStatus === 'fresh').length;
    const warningCount = seriesList.filter(s => s.slaStatus === 'warning').length;
    const criticalCount = seriesList.filter(s => s.slaStatus === 'critical').length;
    const unknownCount = seriesList.filter(s => s.slaStatus === 'unknown').length;

    // Calculate by frequency
    const byFrequency: Record<string, any> = {};
    for (const freq of ['daily', 'weekly', 'monthly', 'quarterly', 'annual']) {
      const freqSeries = seriesList.filter(s => s.frequency === freq);
      byFrequency[freq] = {
        total: freqSeries.length,
        fresh: freqSeries.filter(s => s.slaStatus === 'fresh').length,
        warning: freqSeries.filter(s => s.slaStatus === 'warning').length,
        critical: freqSeries.filter(s => s.slaStatus === 'critical').length,
      };
    }

    return {
      generatedAt: now,
      totalSeries: seriesList.length,
      freshCount,
      warningCount,
      criticalCount,
      unknownCount,
      series: seriesList,
      byFrequency,
    };
  }

  /**
   * Check freshness for a single series
   */
  async checkSeriesFreshness(seriesId: string): Promise<SeriesFreshness | null> {
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

    const seriesData = series[0];

    // Get latest observation
    const [latestObs] = await this.db!.execute(sql`
      SELECT 
        MAX(observationDate) as latestDate,
        COUNT(*) as count
      FROM numeric_observations
      WHERE seriesId = ${seriesId}
    `) as any;

    const lastObservationDate = latestObs?.[0]?.latestDate || null;
    const observationCount = latestObs?.[0]?.count || 0;

    let daysSinceLastUpdate: number | null = null;
    let slaStatus: SLAStatus = 'unknown';

    if (lastObservationDate) {
      const lastDate = new Date(lastObservationDate);
      const now = new Date();
      daysSinceLastUpdate = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      // Get threshold for this frequency
      const threshold = SLA_THRESHOLDS[seriesData.frequency];

      if (threshold) {
        if (daysSinceLastUpdate <= threshold.warningDays) {
          slaStatus = 'fresh';
        } else if (daysSinceLastUpdate <= threshold.criticalDays) {
          slaStatus = 'warning';
        } else {
          slaStatus = 'critical';
        }
      }
    }

    return {
      seriesId,
      productId: seriesData.productId,
      name: seriesData.name,
      frequency: seriesData.frequency,
      lastObservationDate,
      daysSinceLastUpdate,
      slaStatus,
      threshold: SLA_THRESHOLDS[seriesData.frequency] || { warningDays: 30, criticalDays: 90 },
      observationCount,
    };
  }

  /**
   * Get critical staleness (series that need immediate attention)
   */
  async getCriticalStaleness(): Promise<SeriesFreshness[]> {
    const report = await this.checkAllSeries();
    return report.series.filter(s => s.slaStatus === 'critical');
  }

  /**
   * Create GAP tickets for critical staleness
   */
  async createGapTicketsForStaleSeries(userId?: number): Promise<number> {
    await this.init();

    const criticalSeries = await this.getCriticalStaleness();
    let ticketsCreated = 0;

    for (const series of criticalSeries) {
      // Check if ticket already exists
      const existing = await this.db!.execute(sql`
        SELECT id FROM data_gap_tickets
        WHERE missingItem LIKE ${`%${series.productId}%`}
          AND status IN ('open', 'in_progress')
        LIMIT 1
      `) as any;

      if (existing && existing[0] && existing[0].length > 0) {
        continue; // Ticket already exists
      }

      // Create new GAP ticket
      const missingItem = `${series.name} (${series.productId}) - Data stale for ${series.daysSinceLastUpdate} days`;
      const whyItMatters = `This ${series.frequency} series has exceeded SLA threshold (${series.threshold.criticalDays} days). Last update: ${series.lastObservationDate?.toISOString().split('T')[0] || 'Never'}`;

      await this.db!.insert(dataGapTickets).values({
        missingItem,
        whyItMatters,
        priority: 'high',
        status: 'open',
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      ticketsCreated++;
      console.log(`[FreshnessSLA] Created GAP ticket for ${series.productId}`);
    }

    return ticketsCreated;
  }

  /**
   * Get freshness alerts (series that need attention soon)
   */
  async getFreshnessAlerts(): Promise<{
    warnings: SeriesFreshness[];
    critical: SeriesFreshness[];
  }> {
    const report = await this.checkAllSeries();
    
    return {
      warnings: report.series.filter(s => s.slaStatus === 'warning'),
      critical: report.series.filter(s => s.slaStatus === 'critical'),
    };
  }

  /**
   * Get freshness summary statistics
   */
  async getSummaryStats(): Promise<{
    overallHealth: number; // 0-100
    totalSeries: number;
    freshPercent: number;
    warningPercent: number;
    criticalPercent: number;
    mostStale: SeriesFreshness[];
  }> {
    const report = await this.checkAllSeries();
    
    const freshPercent = report.totalSeries > 0 
      ? Math.round((report.freshCount / report.totalSeries) * 100) 
      : 0;
    
    const warningPercent = report.totalSeries > 0
      ? Math.round((report.warningCount / report.totalSeries) * 100)
      : 0;
    
    const criticalPercent = report.totalSeries > 0
      ? Math.round((report.criticalCount / report.totalSeries) * 100)
      : 0;

    // Calculate overall health (penalize warnings and critical)
    const overallHealth = Math.max(0, freshPercent - (warningPercent * 0.5) - criticalPercent);

    // Get 10 most stale series
    const mostStale = report.series
      .filter(s => s.daysSinceLastUpdate !== null)
      .sort((a, b) => (b.daysSinceLastUpdate || 0) - (a.daysSinceLastUpdate || 0))
      .slice(0, 10);

    return {
      overallHealth: Math.round(overallHealth),
      totalSeries: report.totalSeries,
      freshPercent,
      warningPercent,
      criticalPercent,
      mostStale,
    };
  }
}

// Singleton instance
export const dataFreshnessSLA = new DataFreshnessSLAService();
