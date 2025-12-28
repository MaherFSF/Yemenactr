import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, analystProcedure, partnerProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import {
  ingestionService,
  fetchWorldBankIndicator,
  fetchReliefWebReports,
  getDataSourceStatus,
} from './ingestion';
import { WorldBankConnector, HDXConnector, OCHAFTSConnector, ReliefWebConnector } from './connectors';
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
  getSectorMetrics,
  getRegimeComparison,
  getPlatformStats,
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

  // ============================================================================
  // SECTOR ANALYTICS
  // ============================================================================

  sectors: router({
    getMetrics: publicProcedure
      .query(async () => {
        return await getSectorMetrics();
      }),
  }),

  // ============================================================================
  // REGIME COMPARISON
  // ============================================================================

  comparison: router({
    getIndicators: publicProcedure
      .input(z.object({
        indicatorCodes: z.array(z.string()).optional(),
      }))
      .query(async ({ input }) => {
        return await getRegimeComparison(input.indicatorCodes || []);
      }),
  }),

  // ============================================================================
  // PLATFORM STATISTICS
  // ============================================================================

  platform: router({
    getStats: publicProcedure
      .query(async () => {
        return await getPlatformStats();
      }),
  }),

  // ============================================================================
  // AI ASSISTANT
  // ============================================================================

  ai: router({
    chat: protectedProcedure
      .input(z.object({
        message: z.string().min(1).max(2000),
        conversationHistory: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })).optional(),
        context: z.object({
          sector: z.string().optional(),
          regime: z.enum(["aden_irg", "sanaa_defacto", "both"]).optional(),
          timeRange: z.object({
            start: z.string().optional(),
            end: z.string().optional(),
          }).optional(),
        }).optional(),
      }))
      .mutation(async ({ input }) => {
        // Build system prompt with Yemen economic context
        const systemPrompt = `You are the YETO AI Assistant ("One Brain"), an expert economic analyst specializing in Yemen's economy. You have deep knowledge of:

1. **Dual Authority Context**: Yemen operates under two competing authorities:
   - IRG (Internationally Recognized Government) based in Aden
   - DFA (De Facto Authority/Ansar Allah) based in Sana'a
   Each has separate central banks, fiscal policies, and economic indicators.

2. **Key Economic Sectors**: Banking & Finance, Trade & Commerce, Prices & Inflation, Currency & Exchange Rates, Public Finance, Energy & Fuel, Food Security, Aid Flows, Labor Market, Conflict Economy, Infrastructure.

3. **Data Sources**: World Bank, IMF, UN agencies (WFP, OCHA, UNDP), Central Bank of Yemen (both Aden and Sana'a), FAO, IPC, Sana'a Center for Strategic Studies, and local market surveys.

4. **Current Challenges**: Currency bifurcation, banking sector fragmentation, import dependency, humanitarian crisis, fuel shortages, remittance disruptions.

When answering:
- Always specify which authority/region data refers to (Aden/IRG vs Sana'a/DFA)
- Cite confidence levels for data (A=verified official, B=credible estimate, C=proxy/modeled, D=unverified)
- Acknowledge data gaps and uncertainties
- Provide context on how conflict affects economic indicators
- Use both English and Arabic terms where relevant

Current context: ${input.context?.sector ? `Sector: ${input.context.sector}` : 'General'}, ${input.context?.regime ? `Focus: ${input.context.regime}` : 'Both authorities'}`;

        // Build messages array
        const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
          { role: "system", content: systemPrompt },
        ];

        // Add conversation history
        if (input.conversationHistory) {
          for (const msg of input.conversationHistory.slice(-10)) {
            messages.push({
              role: msg.role as "user" | "assistant",
              content: msg.content,
            });
          }
        }

        // Add current message
        messages.push({ role: "user", content: input.message });

        try {
          const response = await invokeLLM({ messages });
          
          const rawContent = response.choices[0]?.message?.content;
          const assistantMessage = typeof rawContent === 'string' 
            ? rawContent 
            : "I apologize, but I couldn't generate a response. Please try again.";

          // Extract potential citations/sources mentioned
          const sources: Array<{ name: string; type: string }> = [];
          const sourcePatterns = [
            /World Bank/gi,
            /IMF/gi,
            /WFP/gi,
            /OCHA/gi,
            /Central Bank of Yemen/gi,
            /CBY/gi,
            /IPC/gi,
            /Sana'a Center/gi,
            /UN Comtrade/gi,
          ];
          
          for (const pattern of sourcePatterns) {
            if (pattern.test(assistantMessage)) {
              const match = assistantMessage.match(pattern);
              if (match) {
                sources.push({
                  name: match[0],
                  type: "reference",
                });
              }
            }
          }

          // Deduplicate sources
          const uniqueSources = sources.filter((source, index, self) =>
            index === self.findIndex((s) => s.name === source.name)
          );

          return {
            message: assistantMessage,
            sources: uniqueSources,
            confidence: "B" as const,
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          console.error("AI Assistant error:", error);
          return {
            message: "I apologize, but I encountered an error processing your request. Please try again or rephrase your question.",
            sources: [],
            confidence: "D" as const,
            timestamp: new Date().toISOString(),
          };
        }
      }),

    suggestQueries: publicProcedure
      .input(z.object({
        sector: z.string().optional(),
      }))
      .query(({ input }) => {
        const generalQueries = [
          { en: "What is the current exchange rate difference between Aden and Sana'a?", ar: "ما هو الفرق الحالي في سعر الصرف بين عدن وصنعاء؟" },
          { en: "How has inflation affected food prices in Yemen?", ar: "كيف أثر التضخم على أسعار الغذاء في اليمن؟" },
          { en: "What are the main sources of government revenue for each authority?", ar: "ما هي المصادر الرئيسية لإيرادات الحكومة لكل سلطة؟" },
          { en: "How has the banking sector been affected by the conflict?", ar: "كيف تأثر القطاع المصرفي بالصراع؟" },
        ];

        const sectorQueries: Record<string, Array<{ en: string; ar: string }>> = {
          banking: [
            { en: "What is the status of correspondent banking relationships?", ar: "ما هو وضع علاقات المراسلة المصرفية؟" },
            { en: "How do the two central banks differ in monetary policy?", ar: "كيف يختلف البنكان المركزيان في السياسة النقدية؟" },
          ],
          trade: [
            { en: "What are Yemen's main import commodities?", ar: "ما هي السلع الرئيسية المستوردة لليمن؟" },
            { en: "How has port access affected trade flows?", ar: "كيف أثر الوصول إلى الموانئ على التدفقات التجارية؟" },
          ],
          prices: [
            { en: "What is the current cost of the minimum food basket?", ar: "ما هي التكلفة الحالية للحد الأدنى لسلة الغذاء؟" },
            { en: "How do fuel prices compare between regions?", ar: "كيف تقارن أسعار الوقود بين المناطق؟" },
          ],
        };

        const queries = input.sector && sectorQueries[input.sector]
          ? [...sectorQueries[input.sector], ...generalQueries.slice(0, 2)]
          : generalQueries;

        return queries;
      }),
  }),

  // ============================================================================
  // ADMIN MANAGEMENT
  // ============================================================================

  admin: router({
    // Get all users (admin only)
    getUsers: adminProcedure
      .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        role: z.enum(["user", "admin", "analyst", "partner_contributor"]).optional(),
        search: z.string().optional(),
      }))
      .query(async ({ input }) => {
        // Sample data for now - would query database
        return {
          users: [
            { id: 1, name: "Admin User", email: "admin@yeto.org", role: "admin", subscriptionTier: "institutional", createdAt: new Date() },
            { id: 2, name: "Analyst User", email: "analyst@yeto.org", role: "analyst", subscriptionTier: "researcher", createdAt: new Date() },
            { id: 3, name: "Partner User", email: "partner@ngo.org", role: "partner_contributor", subscriptionTier: "free", createdAt: new Date() },
          ],
          total: 3,
          page: input.page,
          limit: input.limit,
        };
      }),

    // Update user role (admin only)
    updateUserRole: adminProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["user", "admin", "analyst", "partner_contributor"]),
      }))
      .mutation(async ({ input }) => {
        // Would update database
        return { success: true, userId: input.userId, newRole: input.role };
      }),

    // Get system stats (admin only)
    getSystemStats: adminProcedure
      .query(async () => {
        return {
          totalUsers: 850,
          activeToday: 124,
          totalIndicators: 500,
          totalDataPoints: 1200000,
          pendingSubmissions: 12,
          openGapTickets: 8,
          lastDataUpdate: new Date().toISOString(),
        };
      }),

    // Get pending partner submissions (admin only)
    getPendingSubmissions: adminProcedure
      .query(async () => {
        return [
          { id: 1, partnerName: "WFP Yemen", dataType: "Food Prices", submittedAt: new Date(), status: "pending_review" },
          { id: 2, partnerName: "OCHA", dataType: "Humanitarian Indicators", submittedAt: new Date(), status: "pending_review" },
        ];
      }),
  }),

  // ============================================================================
  // NOTIFICATIONS & SUBSCRIPTIONS
  // ============================================================================

  notifications: router({
    // Get user's notification preferences
    getPreferences: protectedProcedure
      .query(async ({ ctx }) => {
        // Would fetch from database
        return {
          emailDailyDigest: false,
          emailWeeklyMonitor: true,
          emailMonthlyBrief: true,
          emailSpecialReports: true,
          emailDataAlerts: false,
          emailCorrectionNotices: true,
          watchlistAlerts: true,
          preferredLanguage: "both" as const,
        };
      }),

    // Update notification preferences
    updatePreferences: protectedProcedure
      .input(z.object({
        emailDailyDigest: z.boolean().optional(),
        emailWeeklyMonitor: z.boolean().optional(),
        emailMonthlyBrief: z.boolean().optional(),
        emailSpecialReports: z.boolean().optional(),
        emailDataAlerts: z.boolean().optional(),
        emailCorrectionNotices: z.boolean().optional(),
        watchlistAlerts: z.boolean().optional(),
        preferredLanguage: z.enum(["en", "ar", "both"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Would update database
        return { success: true, updated: input };
      }),

    // Subscribe to newsletter (public - no auth required)
    subscribe: publicProcedure
      .input(z.object({
        email: z.string().email(),
        name: z.string().optional(),
        organization: z.string().optional(),
        subscribedToDaily: z.boolean().default(false),
        subscribedToWeekly: z.boolean().default(true),
        subscribedToMonthly: z.boolean().default(true),
        subscribedToSpecial: z.boolean().default(true),
        preferredLanguage: z.enum(["en", "ar", "both"]).default("both"),
      }))
      .mutation(async ({ input }) => {
        // Would insert into database and send verification email
        return {
          success: true,
          message: "Please check your email to verify your subscription.",
          email: input.email,
        };
      }),

    // Unsubscribe from newsletter
    unsubscribe: publicProcedure
      .input(z.object({
        token: z.string(),
      }))
      .mutation(async ({ input }) => {
        // Would update database
        return { success: true, message: "You have been unsubscribed." };
      }),
  }),

  // ============================================================================
  // USER WATCHLIST
  // ============================================================================

  watchlist: router({
    // Get user's watchlist
    get: protectedProcedure
      .query(async ({ ctx }) => {
        // Would fetch from database
        return [
          { id: 1, indicatorCode: "fx_rate_usd", alertThreshold: 2000, alertDirection: "above", notes: "Monitor for currency crisis" },
          { id: 2, indicatorCode: "inflation_cpi", alertThreshold: 50, alertDirection: "above", notes: "Hyperinflation threshold" },
        ];
      }),

    // Add indicator to watchlist
    add: protectedProcedure
      .input(z.object({
        indicatorCode: z.string(),
        alertThreshold: z.number().optional(),
        alertDirection: z.enum(["above", "below", "any_change"]).default("any_change"),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Would insert into database
        return { success: true, id: Date.now(), ...input };
      }),

    // Remove from watchlist
    remove: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Would delete from database
        return { success: true };
      }),
  }),

  // ============================================================================
  // SAVED SEARCHES
  // ============================================================================

  savedSearches: router({
    // Get user's saved searches
    list: protectedProcedure
      .query(async ({ ctx }) => {
        // Would fetch from database
        return [
          { id: 1, name: "Banking sector Aden", searchQuery: "banking aden", filters: { sector: "banking", regime: "aden_irg" }, createdAt: new Date() },
          { id: 2, name: "Food prices 2024", searchQuery: "food prices", filters: { sector: "prices", year: 2024 }, createdAt: new Date() },
        ];
      }),

    // Save a search
    save: protectedProcedure
      .input(z.object({
        name: z.string(),
        searchQuery: z.string(),
        filters: z.record(z.string(), z.any()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Would insert into database
        return { success: true, id: Date.now(), ...input };
      }),

    // Delete a saved search
    delete: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Would delete from database
        return { success: true };
      }),
  }),

  // ============================================================================
  // DATA EXPORT
  // ============================================================================

  export: router({
    // Export time series data
    timeSeries: protectedProcedure
      .input(z.object({
        indicatorCodes: z.array(z.string()),
        regimeTag: z.enum(["aden_irg", "sanaa_defacto", "both"]),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        format: z.enum(["csv", "json", "xlsx"]).default("csv"),
      }))
      .mutation(async ({ input }) => {
        // Would generate export file and return URL
        return {
          success: true,
          downloadUrl: `/api/exports/timeseries-${Date.now()}.${input.format}`,
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
          recordCount: 1000,
        };
      }),

    // Export full dataset
    dataset: protectedProcedure
      .input(z.object({
        datasetId: z.number(),
        format: z.enum(["csv", "json", "xlsx"]).default("csv"),
      }))
      .mutation(async ({ input }) => {
        // Would generate export file and return URL
        return {
          success: true,
          downloadUrl: `/api/exports/dataset-${input.datasetId}.${input.format}`,
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
        };
      }),
  }),

  // ============================================================================
  // DATA INGESTION (Real Data Sources)
  // ============================================================================

  ingestion: router({
    // Get status of all data sources
    getSourceStatus: publicProcedure
      .query(async () => {
        return getDataSourceStatus();
      }),

    // Fetch World Bank indicator data
    fetchWorldBank: publicProcedure
      .input(z.object({
        indicatorCode: z.string(),
      }))
      .query(async ({ input }) => {
        const connector = new WorldBankConnector();
        try {
          const rawData = await connector.fetchIndicator(input.indicatorCode);
          const series = await connector.normalize(rawData);
          return {
            success: true,
            data: series[0] || null,
            source: 'World Bank Development Indicators',
            retrievedAt: new Date().toISOString(),
          };
        } catch (error) {
          return {
            success: false,
            data: null,
            error: error instanceof Error ? error.message : 'Unknown error',
            source: 'World Bank Development Indicators',
            retrievedAt: new Date().toISOString(),
          };
        }
      }),

    // Fetch HDX humanitarian data
    fetchHDX: publicProcedure
      .input(z.object({
        dataType: z.enum(['population', 'food-security', 'humanitarian-needs']),
      }))
      .query(async ({ input }) => {
        const connector = new HDXConnector();
        try {
          let rawData;
          switch (input.dataType) {
            case 'population':
              rawData = await connector.fetchPopulation();
              break;
            case 'food-security':
              rawData = await connector.fetchFoodSecurity();
              break;
            case 'humanitarian-needs':
              rawData = await connector.fetchHumanitarianNeeds();
              break;
          }
          
          const series = rawData ? await connector.normalize(rawData) : [];
          return {
            success: true,
            data: series,
            source: 'HDX Humanitarian API',
            retrievedAt: new Date().toISOString(),
          };
        } catch (error) {
          return {
            success: false,
            data: [],
            error: error instanceof Error ? error.message : 'Unknown error',
            source: 'HDX Humanitarian API',
            retrievedAt: new Date().toISOString(),
          };
        }
      }),

    // Fetch OCHA FTS funding data
    fetchOCHAFunding: publicProcedure
      .input(z.object({
        year: z.number().min(2015).max(2025).default(2024),
      }))
      .query(async ({ input }) => {
        const connector = new OCHAFTSConnector();
        try {
          const rawData = await connector.fetchFundingFlows(input.year);
          const series = rawData ? await connector.normalize(rawData) : [];
          return {
            success: true,
            data: series,
            source: 'OCHA Financial Tracking Service',
            retrievedAt: new Date().toISOString(),
          };
        } catch (error) {
          return {
            success: false,
            data: [],
            error: error instanceof Error ? error.message : 'Unknown error',
            source: 'OCHA Financial Tracking Service',
            retrievedAt: new Date().toISOString(),
          };
        }
      }),

    // Fetch ReliefWeb reports
    fetchReliefWeb: publicProcedure
      .input(z.object({
        query: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
      }))
      .query(async ({ input }) => {
        const connector = new ReliefWebConnector();
        try {
          const rawData = input.query 
            ? await connector.searchReports(input.query, input.limit)
            : await connector.fetchReports(input.limit);
          
          // Return raw reports for display
          const reports = rawData?.data?.map((item: any) => ({
            id: item.id,
            title: item.fields?.title || 'Untitled',
            url: item.fields?.url_alias ? `https://reliefweb.int${item.fields.url_alias}` : null,
            date: item.fields?.date?.created,
            source: item.fields?.source?.[0]?.name || 'Unknown',
            format: item.fields?.format?.[0]?.name || 'Report',
            theme: item.fields?.theme?.map((t: any) => t.name) || [],
          })) || [];
          
          return {
            success: true,
            data: reports,
            total: rawData?.totalCount || reports.length,
            source: 'ReliefWeb',
            retrievedAt: new Date().toISOString(),
          };
        } catch (error) {
          return {
            success: false,
            data: [],
            total: 0,
            error: error instanceof Error ? error.message : 'Unknown error',
            source: 'ReliefWeb',
            retrievedAt: new Date().toISOString(),
          };
        }
      }),

    // Run full ingestion (admin only)
    runFullIngestion: adminProcedure
      .mutation(async () => {
        const summary = await ingestionService.runFullIngestion();
        return {
          success: summary.failedSources === 0,
          summary,
        };
      }),

    // Get cached data from last ingestion
    getCachedData: publicProcedure
      .input(z.object({
        sourceId: z.string().optional(),
        indicatorCode: z.string().optional(),
      }))
      .query(async ({ input }) => {
        if (input.sourceId) {
          return ingestionService.getCachedSeries(input.sourceId, input.indicatorCode);
        }
        return ingestionService.getAllCachedSeries();
      }),

    // Get key Yemen economic indicators from World Bank
    getKeyIndicators: publicProcedure
      .query(async () => {
        const connector = new WorldBankConnector();
        const indicators = [
          { code: 'NY.GDP.MKTP.CD', name: 'GDP (current US$)' },
          { code: 'FP.CPI.TOTL.ZG', name: 'Inflation Rate (%)' },
          { code: 'PA.NUS.FCRF', name: 'Exchange Rate (YER/USD)' },
          { code: 'SP.POP.TOTL', name: 'Population' },
          { code: 'SL.UEM.TOTL.ZS', name: 'Unemployment (%)' },
        ];
        
        const results = [];
        for (const indicator of indicators) {
          try {
            const rawData = await connector.fetchIndicator(indicator.code);
            const series = await connector.normalize(rawData);
            if (series[0]) {
              const latestObs = series[0].observations[series[0].observations.length - 1];
              results.push({
                code: indicator.code,
                name: indicator.name,
                value: latestObs?.value,
                date: latestObs?.date,
                unit: series[0].unit,
                source: 'World Bank',
                confidence: series[0].confidence,
              });
            }
            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 300));
          } catch (error) {
            console.error(`Failed to fetch ${indicator.code}:`, error);
          }
        }
        
        return {
          indicators: results,
          retrievedAt: new Date().toISOString(),
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
