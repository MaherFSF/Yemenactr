import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
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
});

export type AppRouter = typeof appRouter;
