import { getDb } from "../db";
import { sql } from "drizzle-orm";

export interface ReportConfig {
  type: "monthly" | "quarterly" | "yearly" | "custom";
  title: string;
  titleAr: string;
  dateStart: Date;
  dateEnd: Date;
  sectors: string[];
  indicators: string[];
  regimeTag: "aden_irg" | "sanaa_defacto" | "both";
  includeCharts: boolean;
  includeComparison: boolean;
  includeSources: boolean;
  language: "en" | "ar" | "both";
}

export interface ReportSection {
  id: string;
  type: "summary" | "chart" | "table" | "comparison" | "events" | "sources";
  titleEn: string;
  titleAr: string;
  data: any;
}

export interface GeneratedReport {
  id: string;
  config: ReportConfig;
  generatedAt: Date;
  sections: ReportSection[];
  metadata: {
    totalIndicators: number;
    totalDataPoints: number;
    dateRange: { start: string; end: string };
    sources: string[];
    confidenceDistribution: Record<string, number>;
  };
}

// Report templates
export const REPORT_TEMPLATES = {
  monthly: {
    titleEn: "Monthly Economic Monitor",
    titleAr: "المراقب الاقتصادي الشهري",
    sections: ["summary", "chart", "comparison", "events", "sources"],
    defaultIndicators: [
      "fx_rate_aden", "fx_rate_sanaa", "inflation_aden", "inflation_sanaa",
      "food_basket_cost", "fuel_price_petrol", "fuel_price_diesel"
    ],
  },
  quarterly: {
    titleEn: "Quarterly Macro-Fiscal Brief",
    titleAr: "الموجز المالي الكلي الفصلي",
    sections: ["summary", "chart", "table", "comparison", "events", "sources"],
    defaultIndicators: [
      "gdp_growth", "fx_rate_aden", "fx_rate_sanaa", "inflation_aden",
      "foreign_reserves", "trade_balance", "remittances", "aid_disbursements"
    ],
  },
  yearly: {
    titleEn: "Annual Economic Review",
    titleAr: "المراجعة الاقتصادية السنوية",
    sections: ["summary", "chart", "table", "comparison", "events", "sources"],
    defaultIndicators: [
      "gdp_nominal", "gdp_growth", "gdp_per_capita", "fx_rate_aden", "fx_rate_sanaa",
      "inflation_aden", "inflation_sanaa", "foreign_reserves", "trade_balance",
      "exports_total", "imports_total", "remittances", "aid_disbursements",
      "poverty_rate", "unemployment_rate", "food_insecure_total", "idp_count"
    ],
  },
};

export class ReportGeneratorService {
  
  async generateReport(config: ReportConfig): Promise<GeneratedReport> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const reportId = `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const sections: ReportSection[] = [];

    // Get template if using predefined type
    const template = config.type !== "custom" ? REPORT_TEMPLATES[config.type] : null;
    const indicators = config.indicators.length > 0 
      ? config.indicators 
      : template?.defaultIndicators || [];

    // 1. Generate Executive Summary
    const summaryData = await this.generateSummary(db, config, indicators);
    sections.push({
      id: "summary",
      type: "summary",
      titleEn: "Executive Summary",
      titleAr: "الملخص التنفيذي",
      data: summaryData,
    });

    // 2. Generate Time Series Charts
    if (config.includeCharts) {
      const chartData = await this.generateChartData(db, config, indicators);
      sections.push({
        id: "charts",
        type: "chart",
        titleEn: "Key Indicators",
        titleAr: "المؤشرات الرئيسية",
        data: chartData,
      });
    }

    // 3. Generate Comparison Table
    if (config.includeComparison && config.regimeTag === "both") {
      const comparisonData = await this.generateComparison(db, config, indicators);
      sections.push({
        id: "comparison",
        type: "comparison",
        titleEn: "Regime Comparison",
        titleAr: "مقارنة الأنظمة",
        data: comparisonData,
      });
    }

    // 4. Generate Events Timeline
    const eventsData = await this.generateEventsSection(db, config);
    sections.push({
      id: "events",
      type: "events",
      titleEn: "Key Economic Events",
      titleAr: "الأحداث الاقتصادية الرئيسية",
      data: eventsData,
    });

    // 5. Generate Sources Section
    if (config.includeSources) {
      const sourcesData = await this.generateSourcesSection(db, indicators);
      sections.push({
        id: "sources",
        type: "sources",
        titleEn: "Data Sources & Methodology",
        titleAr: "مصادر البيانات والمنهجية",
        data: sourcesData,
      });
    }

    // Calculate metadata
    const metadata = await this.calculateMetadata(db, config, indicators);

    return {
      id: reportId,
      config,
      generatedAt: new Date(),
      sections,
      metadata,
    };
  }

  private async generateSummary(db: any, config: ReportConfig, indicators: string[]): Promise<any> {
    // Get latest values for key indicators
    const summaryPoints: any[] = [];

    for (const code of indicators.slice(0, 8)) { // Top 8 indicators for summary
      const regimes = config.regimeTag === "both" 
        ? ["aden_irg", "sanaa_defacto"] 
        : [config.regimeTag];

      for (const regime of regimes) {
        const [rows] = await db.execute(
          sql`SELECT ts.*, i.nameEn, i.nameAr, i.unit, s.publisher as sourceName
              FROM time_series ts
              JOIN indicators i ON ts.indicatorCode = i.code
              LEFT JOIN sources s ON ts.sourceId = s.id
              WHERE ts.indicatorCode = ${code} 
              AND ts.regimeTag = ${regime}
              AND ts.date >= ${config.dateStart}
              AND ts.date <= ${config.dateEnd}
              ORDER BY ts.date DESC LIMIT 1`
        );

        if ((rows as any[]).length > 0) {
          const row = (rows as any[])[0];
          summaryPoints.push({
            indicatorCode: code,
            nameEn: row.nameEn,
            nameAr: row.nameAr,
            value: parseFloat(row.value),
            unit: row.unit,
            regime: regime === "aden_irg" ? "Aden" : "Sana'a",
            regimeAr: regime === "aden_irg" ? "عدن" : "صنعاء",
            date: row.date,
            source: row.sourceName,
            confidence: row.confidenceRating,
          });
        }
      }
    }

    return {
      keyFindings: summaryPoints,
      periodStart: config.dateStart,
      periodEnd: config.dateEnd,
    };
  }

  private async generateChartData(db: any, config: ReportConfig, indicators: string[]): Promise<any> {
    const charts: any[] = [];

    for (const code of indicators) {
      const chartData: any[] = [];
      const regimes = config.regimeTag === "both" 
        ? ["aden_irg", "sanaa_defacto"] 
        : [config.regimeTag];

      for (const regime of regimes) {
        const [rows] = await db.execute(
          sql`SELECT ts.date, ts.value, ts.confidenceRating, i.nameEn, i.nameAr, i.unit
              FROM time_series ts
              JOIN indicators i ON ts.indicatorCode = i.code
              WHERE ts.indicatorCode = ${code}
              AND ts.regimeTag = ${regime}
              AND ts.date >= ${config.dateStart}
              AND ts.date <= ${config.dateEnd}
              ORDER BY ts.date ASC`
        );

        for (const row of (rows as any[])) {
          const year = new Date(row.date).getFullYear().toString();
          let existing = chartData.find(d => d.year === year);
          if (!existing) {
            existing = { year, nameEn: row.nameEn, nameAr: row.nameAr, unit: row.unit };
            chartData.push(existing);
          }
          if (regime === "aden_irg") {
            existing.aden = parseFloat(row.value);
            existing.adenConfidence = row.confidenceRating;
          } else {
            existing.sanaa = parseFloat(row.value);
            existing.sanaaConfidence = row.confidenceRating;
          }
        }
      }

      if (chartData.length > 0) {
        charts.push({
          indicatorCode: code,
          nameEn: chartData[0]?.nameEn || code,
          nameAr: chartData[0]?.nameAr || code,
          unit: chartData[0]?.unit || "",
          data: chartData.sort((a, b) => parseInt(a.year) - parseInt(b.year)),
        });
      }
    }

    return { charts };
  }

  private async generateComparison(db: any, config: ReportConfig, indicators: string[]): Promise<any> {
    const comparisons: any[] = [];

    for (const code of indicators) {
      // Get latest Aden value
      const [adenRows] = await db.execute(
        sql`SELECT ts.value, ts.date, ts.confidenceRating, i.nameEn, i.nameAr, i.unit, s.publisher
            FROM time_series ts
            JOIN indicators i ON ts.indicatorCode = i.code
            LEFT JOIN sources s ON ts.sourceId = s.id
            WHERE ts.indicatorCode = ${code}
            AND ts.regimeTag = 'aden_irg'
            AND ts.date <= ${config.dateEnd}
            ORDER BY ts.date DESC LIMIT 1`
      );

      // Get latest Sana'a value
      const [sanaaRows] = await db.execute(
        sql`SELECT ts.value, ts.date, ts.confidenceRating, s.publisher
            FROM time_series ts
            LEFT JOIN sources s ON ts.sourceId = s.id
            WHERE ts.indicatorCode = ${code}
            AND ts.regimeTag = 'sanaa_defacto'
            AND ts.date <= ${config.dateEnd}
            ORDER BY ts.date DESC LIMIT 1`
      );

      if ((adenRows as any[]).length > 0 || (sanaaRows as any[]).length > 0) {
        const adenRow = (adenRows as any[])[0];
        const sanaaRow = (sanaaRows as any[])[0];
        
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
        });
      }
    }

    return { comparisons };
  }

  private async generateEventsSection(db: any, config: ReportConfig): Promise<any> {
    const [rows] = await db.execute(
      sql`SELECT * FROM economic_events
          WHERE eventDate >= ${config.dateStart}
          AND eventDate <= ${config.dateEnd}
          ORDER BY eventDate DESC
          LIMIT 20`
    );

    return {
      events: (rows as any[]).map(e => ({
        id: e.id,
        titleEn: e.titleEn,
        titleAr: e.titleAr,
        date: e.eventDate,
        category: e.category,
        impactLevel: e.impactLevel,
        descriptionEn: e.descriptionEn,
        descriptionAr: e.descriptionAr,
      })),
    };
  }

  private async generateSourcesSection(db: any, indicators: string[]): Promise<any> {
    const [rows] = await db.execute(
      sql`SELECT DISTINCT s.* FROM sources s
          JOIN time_series ts ON ts.sourceId = s.id
          WHERE ts.indicatorCode IN (${sql.raw(indicators.map(i => `'${i}'`).join(","))})`
    );

    return {
      sources: (rows as any[]).map(s => ({
        id: s.id,
        publisher: s.publisher,
        url: s.url,
        license: s.license,
        notes: s.notes,
      })),
      methodology: {
        en: "Data is collected from verified international sources including World Bank, IMF, UN agencies, and official government statistics. Each data point includes confidence ratings (A-D) based on source reliability and verification status.",
        ar: "يتم جمع البيانات من مصادر دولية موثقة تشمل البنك الدولي وصندوق النقد الدولي ووكالات الأمم المتحدة والإحصاءات الحكومية الرسمية. يتضمن كل نقطة بيانات تصنيف ثقة (A-D) بناءً على موثوقية المصدر وحالة التحقق.",
      },
    };
  }

  private async calculateMetadata(db: any, config: ReportConfig, indicators: string[]): Promise<any> {
    // Count data points
    const [countResult] = await db.execute(
      sql`SELECT COUNT(*) as count FROM time_series
          WHERE date >= ${config.dateStart}
          AND date <= ${config.dateEnd}`
    );

    // Get confidence distribution
    const [confResult] = await db.execute(
      sql`SELECT confidenceRating, COUNT(*) as count FROM time_series
          WHERE date >= ${config.dateStart}
          AND date <= ${config.dateEnd}
          GROUP BY confidenceRating`
    );

    // Get unique sources
    const [sourceResult] = await db.execute(
      sql`SELECT DISTINCT s.publisher FROM sources s
          JOIN time_series ts ON ts.sourceId = s.id
          WHERE ts.date >= ${config.dateStart}
          AND ts.date <= ${config.dateEnd}`
    );

    const confDist: Record<string, number> = {};
    for (const row of (confResult as any[])) {
      confDist[row.confidenceRating || "Unknown"] = Number(row.count);
    }

    return {
      totalIndicators: indicators.length,
      totalDataPoints: Number((countResult as any[])[0]?.count) || 0,
      dateRange: {
        start: config.dateStart.toISOString().split("T")[0],
        end: config.dateEnd.toISOString().split("T")[0],
      },
      sources: (sourceResult as any[]).map(s => s.publisher),
      confidenceDistribution: confDist,
    };
  }
}

export const reportGeneratorService = new ReportGeneratorService();
