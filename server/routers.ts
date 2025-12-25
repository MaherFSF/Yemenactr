import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getTimeSeriesByIndicator,
  getLatestTimeSeriesValue,
  getAllIndicators,
  getGeospatialDataByIndicator,
  getEconomicEvents,
  getSourceById,
  getDatasetById,
  getAllSources,
  getDocumentsByCategory,
  searchDocuments,
  getGlossaryTerms,
  searchGlossaryTerms,
  getDataGapTickets,
  getStakeholders,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============================================================================
  // TIME SERIES DATA
  // ============================================================================
  
  timeSeries: router({
    getByIndicator: publicProcedure
      .input(z.object({
        indicatorCode: z.string(),
        regimeTag: z.enum(["aden_irg", "sanaa_defacto", "mixed", "unknown"]),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .query(async ({ input }) => {
        return await getTimeSeriesByIndicator(
          input.indicatorCode,
          input.regimeTag,
          input.startDate,
          input.endDate
        );
      }),

    getLatest: publicProcedure
      .input(z.object({
        indicatorCode: z.string(),
        regimeTag: z.enum(["aden_irg", "sanaa_defacto", "mixed", "unknown"]),
      }))
      .query(async ({ input }) => {
        return await getLatestTimeSeriesValue(input.indicatorCode, input.regimeTag);
      }),

    getAllIndicators: publicProcedure
      .query(async () => {
        return await getAllIndicators();
      }),
  }),

  // ============================================================================
  // GEOSPATIAL DATA
  // ============================================================================

  geospatial: router({
    getByIndicator: publicProcedure
      .input(z.object({
        indicatorCode: z.string(),
        regimeTag: z.enum(["aden_irg", "sanaa_defacto", "mixed", "unknown"]),
        date: z.date().optional(),
      }))
      .query(async ({ input }) => {
        return await getGeospatialDataByIndicator(
          input.indicatorCode,
          input.regimeTag,
          input.date
        );
      }),
  }),

  // ============================================================================
  // ECONOMIC EVENTS
  // ============================================================================

  events: router({
    list: publicProcedure
      .input(z.object({
        regimeTag: z.enum(["aden_irg", "sanaa_defacto", "mixed", "unknown"]).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().min(1).max(200).default(50),
      }))
      .query(async ({ input }) => {
        return await getEconomicEvents(
          input.regimeTag,
          input.startDate,
          input.endDate,
          input.limit
        );
      }),
  }),

  // ============================================================================
  // SOURCES & DATASETS
  // ============================================================================

  sources: router({
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getSourceById(input.id);
      }),

    list: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(200).default(100) }))
      .query(async ({ input }) => {
        return await getAllSources(input.limit);
      }),
  }),

  datasets: router({
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getDatasetById(input.id);
      }),
  }),

  // ============================================================================
  // DOCUMENTS & RESEARCH LIBRARY
  // ============================================================================

  documents: router({
    getByCategory: publicProcedure
      .input(z.object({
        category: z.string(),
        limit: z.number().min(1).max(100).default(50),
      }))
      .query(async ({ input }) => {
        return await getDocumentsByCategory(input.category, input.limit);
      }),

    search: publicProcedure
      .input(z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(100).default(50),
      }))
      .query(async ({ input }) => {
        return await searchDocuments(input.query, input.limit);
      }),
  }),

  // ============================================================================
  // GLOSSARY
  // ============================================================================

  glossary: router({
    list: publicProcedure
      .input(z.object({ category: z.string().optional() }))
      .query(async ({ input }) => {
        return await getGlossaryTerms(input.category);
      }),

    search: publicProcedure
      .input(z.object({ query: z.string().min(1) }))
      .query(async ({ input }) => {
        return await searchGlossaryTerms(input.query);
      }),
  }),

  // ============================================================================
  // DATA GAPS & QUALITY
  // ============================================================================

  dataGaps: router({
    list: publicProcedure
      .input(z.object({
        status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
      }))
      .query(async ({ input }) => {
        return await getDataGapTickets(input.status, input.priority);
      }),
  }),

  // ============================================================================
  // STAKEHOLDERS
  // ============================================================================

  stakeholders: router({
    list: publicProcedure
      .input(z.object({
        type: z.enum(["government", "ngo", "international_org", "research_institution", "private_sector"]).optional(),
      }))
      .query(async ({ input }) => {
        return await getStakeholders(input.type);
      }),
  }),

  // ============================================================================
  // DASHBOARD ANALYTICS
  // ============================================================================

  dashboard: router({
    getKeyMetrics: publicProcedure
      .input(z.object({
        regimeTag: z.enum(["aden_irg", "sanaa_defacto"]),
      }))
      .query(async ({ input }) => {
        // Fetch latest values for key indicators
        const [inflation, fxRate, gdp, poverty] = await Promise.all([
          getLatestTimeSeriesValue("inflation_cpi", input.regimeTag),
          getLatestTimeSeriesValue("fx_rate_usd", input.regimeTag),
          getLatestTimeSeriesValue("gdp_nominal", input.regimeTag),
          getLatestTimeSeriesValue("poverty_rate", input.regimeTag),
        ]);

        return {
          inflation,
          fxRate,
          gdp,
          poverty,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
