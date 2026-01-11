import { getDb } from "../db";
import { sql } from "drizzle-orm";

export interface AlertThreshold {
  id: number;
  indicatorCode: string;
  regimeTag: "aden_irg" | "sanaa_defacto" | "both";
  thresholdType: "above" | "below" | "change_percent";
  thresholdValue: number;
  severity: "info" | "warning" | "critical";
  isActive: boolean;
  createdAt: Date;
}

export interface Alert {
  id: string;
  indicatorCode: string;
  indicatorNameEn: string;
  indicatorNameAr: string;
  regimeTag: string;
  currentValue: number;
  thresholdValue: number;
  thresholdType: string;
  severity: "info" | "warning" | "critical";
  message: string;
  messageAr: string;
  triggeredAt: Date;
  acknowledged: boolean;
}

// Default thresholds for key indicators
export const DEFAULT_THRESHOLDS: Omit<AlertThreshold, "id" | "createdAt">[] = [
  // Exchange rate alerts
  { indicatorCode: "fx_rate_aden", regimeTag: "aden_irg", thresholdType: "above", thresholdValue: 2000, severity: "warning", isActive: true },
  { indicatorCode: "fx_rate_aden", regimeTag: "aden_irg", thresholdType: "above", thresholdValue: 2500, severity: "critical", isActive: true },
  { indicatorCode: "fx_rate_aden", regimeTag: "aden_irg", thresholdType: "change_percent", thresholdValue: 10, severity: "warning", isActive: true },
  
  // Inflation alerts
  { indicatorCode: "inflation_aden", regimeTag: "aden_irg", thresholdType: "above", thresholdValue: 20, severity: "warning", isActive: true },
  { indicatorCode: "inflation_aden", regimeTag: "aden_irg", thresholdType: "above", thresholdValue: 35, severity: "critical", isActive: true },
  { indicatorCode: "inflation_sanaa", regimeTag: "sanaa_defacto", thresholdType: "above", thresholdValue: 20, severity: "warning", isActive: true },
  
  // Foreign reserves alerts
  { indicatorCode: "foreign_reserves", regimeTag: "aden_irg", thresholdType: "below", thresholdValue: 1.0, severity: "warning", isActive: true },
  { indicatorCode: "foreign_reserves", regimeTag: "aden_irg", thresholdType: "below", thresholdValue: 0.5, severity: "critical", isActive: true },
  
  // Food security alerts
  { indicatorCode: "food_insecure_total", regimeTag: "both", thresholdType: "above", thresholdValue: 20, severity: "warning", isActive: true },
  { indicatorCode: "food_insecure_total", regimeTag: "both", thresholdType: "above", thresholdValue: 25, severity: "critical", isActive: true },
  
  // Poverty alerts
  { indicatorCode: "poverty_rate", regimeTag: "both", thresholdType: "above", thresholdValue: 75, severity: "warning", isActive: true },
  { indicatorCode: "poverty_rate", regimeTag: "both", thresholdType: "above", thresholdValue: 80, severity: "critical", isActive: true },
  
  // Unemployment alerts
  { indicatorCode: "unemployment_rate", regimeTag: "both", thresholdType: "above", thresholdValue: 30, severity: "warning", isActive: true },
  { indicatorCode: "unemployment_rate", regimeTag: "both", thresholdType: "above", thresholdValue: 40, severity: "critical", isActive: true },
];

export class AlertSystemService {
  
  // Check all thresholds and generate alerts
  async checkThresholds(): Promise<Alert[]> {
    const db = await getDb();
    if (!db) return [];

    const alerts: Alert[] = [];

    for (const threshold of DEFAULT_THRESHOLDS) {
      if (!threshold.isActive) continue;

      const regimes = threshold.regimeTag === "both" 
        ? ["aden_irg", "sanaa_defacto"] 
        : [threshold.regimeTag];

      for (const regime of regimes) {
        try {
          // Get latest value
          const [latestRows] = await db.execute(
            sql`SELECT ts.value, ts.date, i.nameEn, i.nameAr, i.unit
                FROM time_series ts
                JOIN indicators i ON ts.indicatorCode = i.code
                WHERE ts.indicatorCode = ${threshold.indicatorCode}
                AND ts.regimeTag = ${regime}
                ORDER BY ts.date DESC LIMIT 1`
          );

          if ((latestRows as unknown as any[]).length === 0) continue;

          const latest = (latestRows as unknown as any[])[0];
          const currentValue = parseFloat(latest.value);

          let isTriggered = false;
          let message = "";
          let messageAr = "";

          if (threshold.thresholdType === "above" && currentValue > threshold.thresholdValue) {
            isTriggered = true;
            message = `${latest.nameEn} (${currentValue.toFixed(1)} ${latest.unit}) exceeds threshold of ${threshold.thresholdValue}`;
            messageAr = `${latest.nameAr} (${currentValue.toFixed(1)} ${latest.unit}) يتجاوز الحد ${threshold.thresholdValue}`;
          } else if (threshold.thresholdType === "below" && currentValue < threshold.thresholdValue) {
            isTriggered = true;
            message = `${latest.nameEn} (${currentValue.toFixed(1)} ${latest.unit}) falls below threshold of ${threshold.thresholdValue}`;
            messageAr = `${latest.nameAr} (${currentValue.toFixed(1)} ${latest.unit}) ينخفض تحت الحد ${threshold.thresholdValue}`;
          } else if (threshold.thresholdType === "change_percent") {
            // Get previous value for change calculation
            const [prevRows] = await db.execute(
              sql`SELECT value FROM time_series
                  WHERE indicatorCode = ${threshold.indicatorCode}
                  AND regimeTag = ${regime}
                  ORDER BY date DESC LIMIT 1 OFFSET 1`
            );

            if ((prevRows as unknown as any[]).length > 0) {
              const prevValue = parseFloat((prevRows as unknown as any[])[0].value);
              const changePercent = Math.abs((currentValue - prevValue) / prevValue * 100);

              if (changePercent > threshold.thresholdValue) {
                isTriggered = true;
                const direction = currentValue > prevValue ? "increased" : "decreased";
                const directionAr = currentValue > prevValue ? "ارتفع" : "انخفض";
                message = `${latest.nameEn} ${direction} by ${changePercent.toFixed(1)}% (threshold: ${threshold.thresholdValue}%)`;
                messageAr = `${latest.nameAr} ${directionAr} بنسبة ${changePercent.toFixed(1)}% (الحد: ${threshold.thresholdValue}%)`;
              }
            }
          }

          if (isTriggered) {
            alerts.push({
              id: `ALT-${threshold.indicatorCode}-${regime}-${Date.now()}`,
              indicatorCode: threshold.indicatorCode,
              indicatorNameEn: latest.nameEn,
              indicatorNameAr: latest.nameAr,
              regimeTag: regime,
              currentValue,
              thresholdValue: threshold.thresholdValue,
              thresholdType: threshold.thresholdType,
              severity: threshold.severity,
              message,
              messageAr,
              triggeredAt: new Date(),
              acknowledged: false,
            });
          }
        } catch (error) {
          console.error(`[AlertSystem] Error checking threshold for ${threshold.indicatorCode}:`, error);
        }
      }
    }

    return alerts;
  }

  // Get active alerts sorted by severity
  async getActiveAlerts(): Promise<Alert[]> {
    const alerts = await this.checkThresholds();
    
    // Sort by severity (critical first)
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  }

  // Get alert summary for dashboard
  async getAlertSummary(): Promise<{ critical: number; warning: number; info: number; total: number }> {
    const alerts = await this.checkThresholds();
    
    return {
      critical: alerts.filter(a => a.severity === "critical").length,
      warning: alerts.filter(a => a.severity === "warning").length,
      info: alerts.filter(a => a.severity === "info").length,
      total: alerts.length,
    };
  }
}

export const alertSystemService = new AlertSystemService();

// Comparative analysis tools
export class ComparativeAnalysisService {
  
  // Compare indicators between regimes
  async compareRegimes(indicatorCodes: string[]): Promise<any[]> {
    const db = await getDb();
    if (!db) return [];

    const comparisons: any[] = [];

    for (const code of indicatorCodes) {
      // Get latest Aden value
      const [adenRows] = await db.execute(
        sql`SELECT ts.value, ts.date, ts.confidenceRating, i.nameEn, i.nameAr, i.unit, s.publisher
            FROM time_series ts
            JOIN indicators i ON ts.indicatorCode = i.code
            LEFT JOIN sources s ON ts.sourceId = s.id
            WHERE ts.indicatorCode = ${code}
            AND ts.regimeTag = 'aden_irg'
            ORDER BY ts.date DESC LIMIT 1`
      );

      // Get latest Sana'a value
      const [sanaaRows] = await db.execute(
        sql`SELECT ts.value, ts.date, ts.confidenceRating, s.publisher
            FROM time_series ts
            LEFT JOIN sources s ON ts.sourceId = s.id
            WHERE ts.indicatorCode = ${code}
            AND ts.regimeTag = 'sanaa_defacto'
            ORDER BY ts.date DESC LIMIT 1`
      );

      const adenRow = (adenRows as unknown as any[])[0];
      const sanaaRow = (sanaaRows as unknown as any[])[0];

      if (adenRow || sanaaRow) {
        const adenValue = adenRow ? parseFloat(adenRow.value) : null;
        const sanaaValue = sanaaRow ? parseFloat(sanaaRow.value) : null;
        const gap = adenValue && sanaaValue ? adenValue - sanaaValue : null;
        const gapPercent = adenValue && sanaaValue && sanaaValue !== 0
          ? ((adenValue - sanaaValue) / sanaaValue * 100)
          : null;

        comparisons.push({
          indicatorCode: code,
          nameEn: adenRow?.nameEn || code,
          nameAr: adenRow?.nameAr || code,
          unit: adenRow?.unit || "",
          aden: {
            value: adenValue,
            date: adenRow?.date,
            confidence: adenRow?.confidenceRating,
            source: adenRow?.publisher,
          },
          sanaa: {
            value: sanaaValue,
            date: sanaaRow?.date,
            confidence: sanaaRow?.confidenceRating,
            source: sanaaRow?.publisher,
          },
          gap,
          gapPercent,
          divergence: gapPercent ? Math.abs(gapPercent) > 50 ? "high" : Math.abs(gapPercent) > 20 ? "moderate" : "low" : null,
        });
      }
    }

    return comparisons;
  }

  // Compare year-over-year changes
  async compareYearOverYear(indicatorCode: string, regimeTag: string): Promise<any[]> {
    const db = await getDb();
    if (!db) return [];

    const [rows] = await db.execute(
      sql`SELECT YEAR(date) as year, AVG(value) as avgValue, COUNT(*) as dataPoints
          FROM time_series
          WHERE indicatorCode = ${indicatorCode}
          AND regimeTag = ${regimeTag}
          GROUP BY YEAR(date)
          ORDER BY year ASC`
    );

    const yearData = rows as unknown as any[];
    const comparisons: any[] = [];

    for (let i = 1; i < yearData.length; i++) {
      const prev = yearData[i - 1];
      const curr = yearData[i];
      const change = curr.avgValue - prev.avgValue;
      const changePercent = (change / prev.avgValue) * 100;

      comparisons.push({
        year: curr.year,
        value: curr.avgValue,
        previousValue: prev.avgValue,
        change,
        changePercent,
        trend: change > 0 ? "up" : change < 0 ? "down" : "stable",
      });
    }

    return comparisons;
  }

  // Get divergence analysis between regimes
  async getDivergenceAnalysis(): Promise<any> {
    const db = await getDb();
    if (!db) return { highDivergence: [], moderateDivergence: [], lowDivergence: [] };

    // Get all indicators that have data for both regimes
    const [indicators] = await db.execute(
      sql`SELECT DISTINCT indicatorCode FROM time_series WHERE regimeTag = 'aden_irg'
          INTERSECT
          SELECT DISTINCT indicatorCode FROM time_series WHERE regimeTag = 'sanaa_defacto'`
    );

    const indicatorCodes = (indicators as unknown as any[]).map(i => i.indicatorCode);
    const comparisons = await this.compareRegimes(indicatorCodes);

    return {
      highDivergence: comparisons.filter(c => c.divergence === "high"),
      moderateDivergence: comparisons.filter(c => c.divergence === "moderate"),
      lowDivergence: comparisons.filter(c => c.divergence === "low"),
      totalIndicators: comparisons.length,
    };
  }
}

export const comparativeAnalysisService = new ComparativeAnalysisService();
