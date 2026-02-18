/**
 * Sector Agents Router
 * API endpoints for sector agent chat and orchestration
 * Enforces Evidence Laws - no fabrication, all claims must cite evidence
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";
import { 
  querySectorAgent, 
  generateSectorAgentResponse,
  validateResponseEvidence 
} from "../services/sectorAgentOrchestration";
import { getLatestContextPack } from "../services/sectorAgentService";

// Zod schemas for type safety
const chatInputSchema = z.object({
  sectorCode: z.string(),
  query: z.string().min(3).max(1000),
  language: z.enum(['en', 'ar']),
  regime: z.enum(['both', 'aden_irg', 'sanaa_dfa']).optional().default('both')
});

const citationSchema = z.object({
  evidencePackId: z.number(),
  sourceTitle: z.string(),
  sourcePublisher: z.string(),
  retrievalDate: z.string(),
  snippet: z.string().optional()
});

const dataGapSchema = z.object({
  description: z.string(),
  recommendedSources: z.array(z.string())
});

const chartDataSchema = z.object({
  indicatorCode: z.string(),
  indicatorName: z.string(),
  values: z.array(z.object({
    date: z.string(),
    value: z.number(),
    confidence: z.string()
  })),
  asOfDate: z.string()
});

export const sectorAgentsRouter = router({
  /**
   * Main chat endpoint - handles queries to sector agents
   */
  chat: publicProcedure
    .input(chatInputSchema)
    .mutation(async ({ input }) => {
      try {
        const { sectorCode, query, language, regime } = input;

        // Get the latest context pack for this sector
        const contextPack = await getLatestContextPack(sectorCode);

        // Generate response using sector agent orchestration
        const response = await generateSectorAgentResponse({
          sectorCode,
          query,
          language,
          regime,
          contextPack: contextPack || undefined
        });

        // Validate response against Evidence Laws
        const validation = await validateResponseEvidence(response);

        if (!validation.passed) {
          // If validation fails, return a safe response indicating gaps
          return {
            success: true,
            response: {
              content: language === 'ar'
                ? `عذراً، لا يمكنني تقديم إجابة مدعومة بالأدلة الكافية. الفجوات المحددة: ${validation.violations.join('، ')}`
                : `Sorry, I cannot provide an answer with sufficient evidence backing. Identified gaps: ${validation.violations.join(', ')}`,
              evidencePackIds: [],
              citations: [],
              confidenceGrade: 'D',
              dataGaps: validation.violations.map(v => ({
                description: v,
                recommendedSources: []
              }))
            }
          };
        }

        return {
          success: true,
          response: {
            content: response.content,
            evidencePackIds: response.evidencePackIds || [],
            citations: response.citations || [],
            confidenceGrade: response.confidenceGrade,
            dataGaps: response.dataGaps || [],
            chartData: response.chartData
          }
        };
      } catch (error) {
        console.error('[SectorAgents] Chat error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }),

  /**
   * Get agent capabilities for a sector
   */
  getAgentInfo: publicProcedure
    .input(z.object({ sectorCode: z.string() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get sector definition
        const sectorResult = await db.execute(sql`
          SELECT * FROM sector_definitions WHERE sectorCode = ${input.sectorCode} AND isActive = 1
        `);

        const sector = (sectorResult as any)[0]?.[0];
        if (!sector) {
          return { success: false, error: 'Sector not found' };
        }

        // Get agent capabilities and example questions from database
        const capabilitiesResult = await db.execute(sql`
          SELECT * FROM sector_agent_capabilities WHERE sectorCode = ${input.sectorCode} AND isActive = 1
        `);

        const exampleQuestionsResult = await db.execute(sql`
          SELECT * FROM sector_agent_example_questions 
          WHERE sectorCode = ${input.sectorCode} AND isActive = 1
          ORDER BY displayOrder ASC
        `);

        return {
          success: true,
          agentInfo: {
            sectorCode: input.sectorCode,
            sectorName: {
              en: sector.nameEn,
              ar: sector.nameAr
            },
            capabilities: (capabilitiesResult as any)[0] || [],
            exampleQuestions: (exampleQuestionsResult as any)[0] || []
          }
        };
      } catch (error) {
        console.error('[SectorAgents] Get agent info error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }),

  /**
   * Get agent performance metrics (for monitoring)
   */
  getAgentMetrics: protectedProcedure
    .input(z.object({
      sectorCode: z.string(),
      startDate: z.string().optional(),
      endDate: z.string().optional()
    }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get query logs for this sector agent
        const logsResult = await db.execute(sql`
          SELECT 
            COUNT(*) as totalQueries,
            AVG(responseTimeMs) as avgResponseTime,
            AVG(citationCount) as avgCitations,
            AVG(CASE WHEN userSatisfaction IS NOT NULL THEN userSatisfaction ELSE NULL END) as avgSatisfaction,
            SUM(CASE WHEN evidenceValidation = 'passed' THEN 1 ELSE 0 END) as validatedResponses,
            SUM(CASE WHEN evidenceValidation = 'failed' THEN 1 ELSE 0 END) as failedValidations
          FROM sector_agent_query_logs
          WHERE sectorCode = ${input.sectorCode}
          ${input.startDate ? sql`AND createdAt >= ${input.startDate}` : sql``}
          ${input.endDate ? sql`AND createdAt <= ${input.endDate}` : sql``}
        `);

        const metrics = (logsResult as any)[0]?.[0];

        // Get common query patterns
        const patternsResult = await db.execute(sql`
          SELECT query, COUNT(*) as frequency
          FROM sector_agent_query_logs
          WHERE sectorCode = ${input.sectorCode}
          ${input.startDate ? sql`AND createdAt >= ${input.startDate}` : sql``}
          ${input.endDate ? sql`AND createdAt <= ${input.endDate}` : sql``}
          GROUP BY query
          ORDER BY frequency DESC
          LIMIT 10
        `);

        return {
          success: true,
          metrics: {
            totalQueries: metrics?.totalQueries || 0,
            avgResponseTime: metrics?.avgResponseTime || 0,
            avgCitations: metrics?.avgCitations || 0,
            avgSatisfaction: metrics?.avgSatisfaction || null,
            validatedResponses: metrics?.validatedResponses || 0,
            failedValidations: metrics?.failedValidations || 0,
            commonPatterns: (patternsResult as any)[0] || []
          }
        };
      } catch (error) {
        console.error('[SectorAgents] Get agent metrics error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }),

  /**
   * Log user feedback on agent response
   */
  logFeedback: publicProcedure
    .input(z.object({
      queryLogId: z.number(),
      satisfaction: z.number().min(1).max(5),
      feedbackText: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.execute(sql`
          UPDATE sector_agent_query_logs
          SET userSatisfaction = ${input.satisfaction},
              userFeedback = ${input.feedbackText || null},
              updatedAt = NOW()
          WHERE id = ${input.queryLogId}
        `);

        return { success: true };
      } catch (error) {
        console.error('[SectorAgents] Log feedback error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }),

  /**
   * Get context pack for a sector (for debugging/monitoring)
   */
  getContextPack: protectedProcedure
    .input(z.object({ sectorCode: z.string() }))
    .query(async ({ input }) => {
      try {
        const contextPack = await getLatestContextPack(input.sectorCode);
        
        if (!contextPack) {
          return { success: false, error: 'No context pack found for this sector' };
        }

        return {
          success: true,
          contextPack
        };
      } catch (error) {
        console.error('[SectorAgents] Get context pack error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    })
});

export type SectorAgentsRouter = typeof sectorAgentsRouter;
