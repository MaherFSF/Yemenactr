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


// ============================================================================
// STEP 6: AUTONOMOUS REPORT GENERATION WITH PDF & S3
// ============================================================================

import { storagePut } from "../storage";

export interface ReportGenerationInput {
  templateSlug: string;
  periodStart: Date;
  periodEnd: Date;
  language: "en" | "ar";
  triggeredBy: "scheduled" | "admin" | "api";
  triggeredByUserId?: number;
}

export interface ReportGenerationResult {
  success: boolean;
  reportId?: string;
  s3Key?: string;
  s3Url?: string;
  fileSizeBytes?: number;
  pageCount?: number;
  generationDurationMs?: number;
  error?: string;
}

/**
 * Generate HTML content for PDF conversion
 */
function generateReportHTML(report: GeneratedReport, language: "en" | "ar"): string {
  const isRTL = language === "ar";
  const dir = isRTL ? "rtl" : "ltr";
  const fontFamily = isRTL ? "'Noto Sans Arabic', Arial, sans-serif" : "'Inter', Arial, sans-serif";
  
  const title = language === "ar" ? report.config.titleAr : report.config.title;
  
  const sectionsHTML = report.sections.map(section => {
    const sectionTitle = language === "ar" ? section.titleAr : section.titleEn;
    return `
      <div class="section">
        <h2>${sectionTitle}</h2>
        <div class="section-content">
          ${renderSectionContent(section, language)}
        </div>
      </div>
    `;
  }).join("");
  
  return `
<!DOCTYPE html>
<html lang="${language}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: ${fontFamily};
      font-size: 11pt;
      line-height: 1.6;
      color: #1a1a1a;
      direction: ${dir};
      padding: 40px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #1e3a5f;
    }
    .header h1 {
      font-size: 24pt;
      color: #1e3a5f;
      margin-bottom: 8px;
    }
    .header .subtitle {
      font-size: 14pt;
      color: #666;
    }
    .header .period {
      font-size: 16pt;
      color: #1e3a5f;
      font-weight: bold;
      margin-top: 12px;
    }
    .header .generated {
      font-size: 10pt;
      color: #888;
      margin-top: 8px;
    }
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .section h2 {
      font-size: 16pt;
      color: #1e3a5f;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid #ddd;
    }
    .section-content {
      text-align: justify;
    }
    .key-finding {
      background: #f5f7fa;
      border-${isRTL ? "right" : "left"}: 4px solid #1e3a5f;
      padding: 12px 16px;
      margin: 8px 0;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }
    .data-table th, .data-table td {
      border: 1px solid #ddd;
      padding: 8px 12px;
      text-align: ${isRTL ? "right" : "left"};
    }
    .data-table th {
      background: #f5f7fa;
      font-weight: bold;
    }
    .stats {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin: 20px 0;
    }
    .stat {
      text-align: center;
    }
    .stat-value {
      font-size: 24pt;
      font-weight: bold;
      color: #1e3a5f;
    }
    .stat-label {
      font-size: 10pt;
      color: #666;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 9pt;
      color: #666;
      text-align: center;
    }
    .source-citation {
      font-size: 9pt;
      color: #666;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <div class="subtitle">${isRTL ? "مرصد اليمن للشفافية الاقتصادية" : "Yemen Economic Transparency Observatory"}</div>
    <div class="period">${report.metadata.dateRange.start} - ${report.metadata.dateRange.end}</div>
    <div class="generated">${isRTL ? "تم الإنشاء:" : "Generated:"} ${report.generatedAt.toLocaleDateString(isRTL ? "ar-SA" : "en-US")}</div>
  </div>
  
  <div class="stats">
    <div class="stat">
      <div class="stat-value">${report.metadata.totalDataPoints}</div>
      <div class="stat-label">${isRTL ? "نقاط البيانات" : "Data Points"}</div>
    </div>
    <div class="stat">
      <div class="stat-value">${report.metadata.sources.length}</div>
      <div class="stat-label">${isRTL ? "المصادر" : "Sources"}</div>
    </div>
    <div class="stat">
      <div class="stat-value">${report.metadata.totalIndicators}</div>
      <div class="stat-label">${isRTL ? "المؤشرات" : "Indicators"}</div>
    </div>
  </div>
  
  ${sectionsHTML}
  
  <div class="footer">
    <p>${isRTL 
      ? "© 2026 مرصد اليمن للشفافية الاقتصادية (YETO). جميع الحقوق محفوظة."
      : "© 2026 Yemen Economic Transparency Observatory (YETO). All rights reserved."
    }</p>
    <p>${isRTL
      ? "هذا التقرير تم إنشاؤه تلقائياً من بيانات موثقة من مصادر متعددة."
      : "This report was automatically generated from verified data from multiple sources."
    }</p>
  </div>
</body>
</html>
  `;
}

/**
 * Render section content based on type
 */
function renderSectionContent(section: ReportSection, language: "en" | "ar"): string {
  const isArabic = language === "ar";
  
  switch (section.type) {
    case "summary":
      return renderSummarySection(section.data, isArabic);
    case "chart":
      return renderChartSection(section.data, isArabic);
    case "comparison":
      return renderComparisonSection(section.data, isArabic);
    case "events":
      return renderEventsSection(section.data, isArabic);
    case "sources":
      return renderSourcesSection(section.data, isArabic);
    default:
      return "<p>Section content not available</p>";
  }
}

function renderSummarySection(data: any, isArabic: boolean): string {
  if (!data.keyFindings || data.keyFindings.length === 0) {
    return `<p>${isArabic ? "لا توجد بيانات متاحة" : "No data available"}</p>`;
  }
  
  return data.keyFindings.map((finding: any) => `
    <div class="key-finding">
      <strong>${isArabic ? finding.nameAr : finding.nameEn}</strong>: 
      ${finding.value} ${finding.unit}
      <span class="source-citation">(${finding.regime}, ${finding.source})</span>
    </div>
  `).join("");
}

function renderChartSection(data: any, isArabic: boolean): string {
  if (!data.charts || data.charts.length === 0) {
    return `<p>${isArabic ? "لا توجد رسوم بيانية متاحة" : "No charts available"}</p>`;
  }
  
  return data.charts.map((chart: any) => `
    <div style="margin: 20px 0; padding: 16px; background: #f9f9f9; border-radius: 8px;">
      <h3>${isArabic ? chart.nameAr : chart.nameEn}</h3>
      <table class="data-table">
        <tr>
          <th>${isArabic ? "السنة" : "Year"}</th>
          <th>${isArabic ? "عدن" : "Aden"}</th>
          <th>${isArabic ? "صنعاء" : "Sana'a"}</th>
        </tr>
        ${chart.data.map((row: any) => `
          <tr>
            <td>${row.year}</td>
            <td>${row.aden ?? "-"}</td>
            <td>${row.sanaa ?? "-"}</td>
          </tr>
        `).join("")}
      </table>
    </div>
  `).join("");
}

function renderComparisonSection(data: any, isArabic: boolean): string {
  if (!data.comparisons || data.comparisons.length === 0) {
    return `<p>${isArabic ? "لا توجد مقارنات متاحة" : "No comparisons available"}</p>`;
  }
  
  return `
    <table class="data-table">
      <tr>
        <th>${isArabic ? "المؤشر" : "Indicator"}</th>
        <th>${isArabic ? "عدن" : "Aden"}</th>
        <th>${isArabic ? "صنعاء" : "Sana'a"}</th>
        <th>${isArabic ? "الفجوة" : "Gap"}</th>
      </tr>
      ${data.comparisons.map((comp: any) => `
        <tr>
          <td>${isArabic ? comp.nameAr : comp.nameEn}</td>
          <td>${comp.aden.value ?? "-"} ${comp.unit}</td>
          <td>${comp.sanaa.value ?? "-"} ${comp.unit}</td>
          <td>${comp.gapPercent ? comp.gapPercent.toFixed(1) + "%" : "-"}</td>
        </tr>
      `).join("")}
    </table>
  `;
}

function renderEventsSection(data: any, isArabic: boolean): string {
  if (!data.events || data.events.length === 0) {
    return `<p>${isArabic ? "لم يتم تسجيل أحداث خلال هذه الفترة" : "No events recorded during this period"}</p>`;
  }
  
  return data.events.map((event: any) => `
    <div style="margin: 12px 0; padding: 12px; border-left: 3px solid #1e3a5f;">
      <strong>${new Date(event.date).toLocaleDateString(isArabic ? "ar-SA" : "en-US")}</strong>: 
      ${isArabic ? event.titleAr : event.titleEn}
      <p style="margin-top: 4px; font-size: 10pt; color: #666;">
        ${isArabic ? event.descriptionAr : event.descriptionEn}
      </p>
    </div>
  `).join("");
}

function renderSourcesSection(data: any, isArabic: boolean): string {
  const methodologyText = isArabic ? data.methodology?.ar : data.methodology?.en;
  
  return `
    <p style="margin-bottom: 16px;">${methodologyText || ""}</p>
    <h3>${isArabic ? "المصادر المستخدمة" : "Sources Used"}</h3>
    <ul>
      ${(data.sources || []).map((source: any) => `
        <li>${source.publisher}${source.url ? ` - <a href="${source.url}">${source.url}</a>` : ""}</li>
      `).join("")}
    </ul>
  `;
}

/**
 * Generate report and upload to S3
 */
export async function generateAndUploadReport(
  input: ReportGenerationInput
): Promise<ReportGenerationResult> {
  const startTime = Date.now();
  
  try {
    // Get template configuration
    const template = input.templateSlug === "quarterly-economic-outlook" 
      ? REPORT_TEMPLATES.quarterly
      : input.templateSlug === "annual-economic-review"
        ? REPORT_TEMPLATES.yearly
        : REPORT_TEMPLATES.monthly;
    
    // Build report config
    const config: ReportConfig = {
      type: input.templateSlug.includes("annual") ? "yearly" 
        : input.templateSlug.includes("quarterly") ? "quarterly" 
        : "monthly",
      title: template.titleEn,
      titleAr: template.titleAr,
      dateStart: input.periodStart,
      dateEnd: input.periodEnd,
      sectors: [],
      indicators: template.defaultIndicators,
      regimeTag: "both",
      includeCharts: true,
      includeComparison: true,
      includeSources: true,
      language: input.language === "ar" ? "ar" : "en",
    };
    
    // Generate report using existing service
    const report = await reportGeneratorService.generateReport(config);
    
    // Generate HTML
    const html = generateReportHTML(report, input.language);
    
    // Convert to PDF buffer (HTML for now, can integrate puppeteer later)
    const pdfBuffer = Buffer.from(html, "utf-8");
    
    // Generate S3 key
    const year = input.periodStart.getFullYear();
    const periodLabel = getPeriodLabel(input.periodStart, input.periodEnd, config.type);
    const s3Key = `reports/${year}/${input.templateSlug}/${periodLabel}-${input.language}.html`;
    
    // Upload to S3
    const { url } = await storagePut(s3Key, pdfBuffer, "text/html");
    
    const generationDurationMs = Date.now() - startTime;
    
    return {
      success: true,
      reportId: report.id,
      s3Key,
      s3Url: url,
      fileSizeBytes: pdfBuffer.length,
      pageCount: report.sections.length + 2,
      generationDurationMs,
    };
  } catch (error) {
    console.error("[ReportGenerator] Error generating report:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      generationDurationMs: Date.now() - startTime,
    };
  }
}

/**
 * Get period label based on dates
 */
function getPeriodLabel(start: Date, end: Date, type: string): string {
  const year = start.getFullYear();
  const month = start.getMonth();
  
  if (type === "quarterly") {
    const quarter = Math.floor(month / 3) + 1;
    return `Q${quarter}-${year}`;
  } else if (type === "yearly") {
    return `${year}-annual`;
  } else {
    const monthNames = ["jan", "feb", "mar", "apr", "may", "jun",
      "jul", "aug", "sep", "oct", "nov", "dec"];
    return `${monthNames[month]}-${year}`;
  }
}

/**
 * Generate quarterly report with S3 upload
 */
export async function generateQuarterlyReportWithUpload(
  year: number,
  quarter: 1 | 2 | 3 | 4,
  language: "en" | "ar" = "en"
): Promise<ReportGenerationResult> {
  const quarterStartMonth = (quarter - 1) * 3;
  const periodStart = new Date(year, quarterStartMonth, 1);
  const periodEnd = new Date(year, quarterStartMonth + 3, 0);
  
  return generateAndUploadReport({
    templateSlug: "quarterly-economic-outlook",
    periodStart,
    periodEnd,
    language,
    triggeredBy: "scheduled",
  });
}

/**
 * Generate annual report with S3 upload
 */
export async function generateAnnualReportWithUpload(
  year: number,
  language: "en" | "ar" = "en"
): Promise<ReportGenerationResult> {
  const periodStart = new Date(year, 0, 1);
  const periodEnd = new Date(year, 11, 31);
  
  return generateAndUploadReport({
    templateSlug: "annual-economic-review",
    periodStart,
    periodEnd,
    language,
    triggeredBy: "scheduled",
  });
}
