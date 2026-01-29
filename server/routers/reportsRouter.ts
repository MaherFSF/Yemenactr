/**
 * YETO Reports Router
 * 
 * tRPC endpoints for report management, generation, and subscription
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { 
  reportGeneratorService, 
  REPORT_TEMPLATES,
  generateAndUploadReport,
  generateQuarterlyReportWithUpload,
  generateAnnualReportWithUpload,
} from "../services/reportGenerator";
import {
  distributeReport,
  addSubscriber,
  verifySubscriber,
  unsubscribe,
  getSubscribersForReport,
  getDistributionStats,
} from "../services/reportDistribution";

export const reportsRouter = router({
  /**
   * List available report templates
   */
  listTemplates: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const result = await db.execute(`
      SELECT * FROM report_templates_new WHERE isActive = 1 ORDER BY createdAt DESC
    `) as unknown as any[][];
    
    const templates = result[0] || [];
    
    // If no templates in DB, return default templates
    if (templates.length === 0) {
      return Object.entries(REPORT_TEMPLATES).map(([key, template]) => ({
        slug: key,
        nameEn: template.titleEn,
        nameAr: template.titleAr,
        frequency: key === "monthly" ? "monthly" : key === "quarterly" ? "quarterly" : "annual",
        sections: template.sections,
        indicators: template.defaultIndicators,
      }));
    }
    
    return templates.map((t: any) => ({
      id: t.id,
      slug: t.slug,
      nameEn: t.nameEn,
      nameAr: t.nameAr,
      descriptionEn: t.descriptionEn,
      descriptionAr: t.descriptionAr,
      frequency: t.frequency,
      isActive: t.isActive,
      config: t.config ? (typeof t.config === "string" ? JSON.parse(t.config) : t.config) : null,
    }));
  }),

  /**
   * List generated reports (public access)
   */
  listReports: publicProcedure
    .input(z.object({
      templateSlug: z.string().optional(),
      year: z.number().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let whereClause = "WHERE gr.status = 'success'";
      if (input.templateSlug) {
        whereClause += ` AND rt.slug = '${input.templateSlug}'`;
      }
      if (input.year) {
        whereClause += ` AND YEAR(gr.periodStart) = ${input.year}`;
      }
      
      const result = await db.execute(`
        SELECT gr.*, rt.nameEn as templateNameEn, rt.nameAr as templateNameAr, rt.slug as templateSlug
        FROM generated_reports_new gr
        LEFT JOIN report_templates_new rt ON gr.templateId = rt.id
        ${whereClause}
        ORDER BY gr.createdAt DESC
        LIMIT ${input.limit} OFFSET ${input.offset}
      `) as unknown as any[][];
      
      const reports = result[0] || [];
      
      return reports.map((r: any) => ({
        id: r.id,
        templateSlug: r.templateSlug || "quarterly",
        templateNameEn: r.templateNameEn || "Quarterly Economic Outlook",
        templateNameAr: r.templateNameAr || "التقرير الاقتصادي الفصلي",
        periodLabel: r.periodLabel,
        periodStart: r.periodStart,
        periodEnd: r.periodEnd,
        status: r.status,
        s3UrlEn: r.s3UrlEn,
        s3UrlAr: r.s3UrlAr,
        fileSizeBytesEn: r.fileSizeBytesEn,
        fileSizeBytesAr: r.fileSizeBytesAr,
        pageCountEn: r.pageCountEn,
        pageCountAr: r.pageCountAr,
        summary: r.summary ? (typeof r.summary === "string" ? JSON.parse(r.summary) : r.summary) : null,
        generatedAt: r.generatedAt,
        createdAt: r.createdAt,
      }));
    }),

  /**
   * Get a single report by ID
   */
  getReport: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.execute(`
        SELECT gr.*, rt.nameEn as templateNameEn, rt.nameAr as templateNameAr, rt.slug as templateSlug
        FROM generated_reports_new gr
        LEFT JOIN report_templates_new rt ON gr.templateId = rt.id
        WHERE gr.id = ${input.id}
      `) as unknown as any[][];
      
      const report = result[0]?.[0];
      if (!report) {
        throw new Error("Report not found");
      }
      
      return {
        id: report.id,
        templateSlug: report.templateSlug,
        templateNameEn: report.templateNameEn,
        templateNameAr: report.templateNameAr,
        periodLabel: report.periodLabel,
        periodStart: report.periodStart,
        periodEnd: report.periodEnd,
        status: report.status,
        s3UrlEn: report.s3UrlEn,
        s3UrlAr: report.s3UrlAr,
        fileSizeBytesEn: report.fileSizeBytesEn,
        fileSizeBytesAr: report.fileSizeBytesAr,
        pageCountEn: report.pageCountEn,
        pageCountAr: report.pageCountAr,
        summary: report.summary ? (typeof report.summary === "string" ? JSON.parse(report.summary) : report.summary) : null,
        generatedAt: report.generatedAt,
        createdAt: report.createdAt,
      };
    }),

  /**
   * Generate a new report (admin only)
   */
  generateReport: protectedProcedure
    .input(z.object({
      templateSlug: z.string(),
      periodStart: z.string().transform(s => new Date(s)),
      periodEnd: z.string().transform(s => new Date(s)),
      language: z.enum(["en", "ar"]).default("en"),
    }))
    .mutation(async ({ input, ctx }) => {
      // Check if user is admin
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can generate reports");
      }
      
      const result = await generateAndUploadReport({
        templateSlug: input.templateSlug,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        language: input.language,
        triggeredBy: "admin",
        triggeredByUserId: ctx.user.id,
      });
      
      return result;
    }),

  /**
   * Generate quarterly report (admin only)
   */
  generateQuarterly: protectedProcedure
    .input(z.object({
      year: z.number().min(2010).max(2030),
      quarter: z.number().min(1).max(4) as z.ZodType<1 | 2 | 3 | 4>,
      language: z.enum(["en", "ar"]).default("en"),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can generate reports");
      }
      
      const result = await generateQuarterlyReportWithUpload(
        input.year,
        input.quarter,
        input.language
      );
      
      return result;
    }),

  /**
   * Generate annual report (admin only)
   */
  generateAnnual: protectedProcedure
    .input(z.object({
      year: z.number().min(2010).max(2030),
      language: z.enum(["en", "ar"]).default("en"),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can generate reports");
      }
      
      const result = await generateAnnualReportWithUpload(input.year, input.language);
      
      return result;
    }),

  /**
   * Subscribe to reports (public)
   */
  subscribe: publicProcedure
    .input(z.object({
      email: z.string().email(),
      nameEn: z.string().optional(),
      nameAr: z.string().optional(),
      organization: z.string().optional(),
      preferredLanguage: z.enum(["en", "ar"]).default("en"),
      subscribedTemplates: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const result = await addSubscriber(input.email, {
        nameEn: input.nameEn,
        nameAr: input.nameAr,
        organization: input.organization,
        preferredLanguage: input.preferredLanguage,
        subscribedTemplates: input.subscribedTemplates,
      });
      
      return result;
    }),

  /**
   * Verify email subscription
   */
  verifySubscription: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      const result = await verifySubscriber(input.token);
      return result;
    }),

  /**
   * Unsubscribe from reports
   */
  unsubscribe: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const result = await unsubscribe(input.email);
      return result;
    }),

  /**
   * Get subscriber statistics (admin only)
   */
  getSubscriberStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Only admins can view subscriber stats");
    }
    
    const stats = await getDistributionStats();
    return stats;
  }),

  /**
   * List subscribers (admin only)
   */
  listSubscribers: protectedProcedure
    .input(z.object({
      tier: z.enum(["public", "premium", "vip"]).optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can list subscribers");
      }
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let whereClause = "WHERE 1=1";
      if (input.tier) {
        whereClause += ` AND tier = '${input.tier}'`;
      }
      
      const result = await db.execute(`
        SELECT * FROM report_subscribers_new
        ${whereClause}
        ORDER BY subscribedAt DESC
        LIMIT ${input.limit} OFFSET ${input.offset}
      `) as unknown as any[][];
      
      const subscribers = result[0] || [];
      
      return subscribers.map((s: any) => ({
        id: s.id,
        email: s.email,
        nameEn: s.nameEn,
        nameAr: s.nameAr,
        organization: s.organization,
        tier: s.tier,
        preferredLanguage: s.preferredLanguage,
        isActive: s.isActive,
        isVerified: s.isVerified,
        subscribedAt: s.subscribedAt,
      }));
    }),

  /**
   * Distribute a report to subscribers (admin only)
   */
  distributeReport: protectedProcedure
    .input(z.object({
      reportId: z.number(),
      language: z.enum(["en", "ar"]).default("en"),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can distribute reports");
      }
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Get report details
      const reportResult = await db.execute(`
        SELECT gr.*, rt.nameEn as templateNameEn, rt.nameAr as templateNameAr
        FROM generated_reports_new gr
        LEFT JOIN report_templates_new rt ON gr.templateId = rt.id
        WHERE gr.id = ${input.reportId}
      `) as unknown as any[][];
      
      const report = reportResult[0]?.[0];
      if (!report) {
        throw new Error("Report not found");
      }
      
      const s3Url = input.language === "ar" ? report.s3UrlAr : report.s3UrlEn;
      if (!s3Url) {
        throw new Error(`Report not available in ${input.language}`);
      }
      
      const result = await distributeReport({
        reportId: input.reportId,
        language: input.language,
        s3Url,
        periodLabel: report.periodLabel,
        reportTitle: input.language === "ar" ? report.templateNameAr : report.templateNameEn,
      });
      
      return result;
    }),

  /**
   * Get distribution log for a report (admin only)
   */
  getDistributionLog: protectedProcedure
    .input(z.object({
      reportId: z.number(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can view distribution logs");
      }
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.execute(`
        SELECT dl.*, rs.nameEn, rs.nameAr, rs.organization
        FROM report_distribution_log_new dl
        LEFT JOIN report_subscribers_new rs ON dl.subscriberId = rs.id
        WHERE dl.reportId = ${input.reportId}
        ORDER BY dl.sentAt DESC
        LIMIT ${input.limit}
      `) as unknown as any[][];
      
      const logs = result[0] || [];
      
      return logs.map((l: any) => ({
        id: l.id,
        emailAddress: l.emailAddress,
        subscriberName: l.nameEn || l.nameAr || l.emailAddress,
        organization: l.organization,
        language: l.language,
        emailStatus: l.emailStatus,
        sentAt: l.sentAt,
        errorMessage: l.errorMessage,
      }));
    }),

  /**
   * Get report generation schedule (admin only)
   */
  getSchedule: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Only admins can view schedule");
    }
    
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const result = await db.execute(`
      SELECT rs.*, rt.nameEn, rt.nameAr, rt.slug
      FROM report_schedule_new rs
      LEFT JOIN report_templates_new rt ON rs.templateId = rt.id
      ORDER BY rs.nextRunAt ASC
    `) as unknown as any[][];
    
    const schedules = result[0] || [];
    
    return schedules.map((s: any) => ({
      id: s.id,
      templateSlug: s.slug,
      templateNameEn: s.nameEn,
      templateNameAr: s.nameAr,
      cronExpression: s.cronExpression,
      timezone: s.timezone,
      nextRunAt: s.nextRunAt,
      lastRunAt: s.lastRunAt,
      lastRunStatus: s.lastRunStatus,
      isActive: s.isActive,
    }));
  }),
});

export default reportsRouter;
