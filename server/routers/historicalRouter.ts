/**
 * Historical Router - Time-Travel What-If System
 * 
 * Provides endpoints for:
 * 1. Getting platform state at any point in time (2010-present)
 * 2. Fetching key historical events for timeline visualization
 * 3. Generating AI projections for "what-if" scenarios
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { 
  timeSeries, 
  economicEvents, 
  keyEvents,
  aiProjections,
  historicalSnapshots,
  sources
} from "../../drizzle/schema";
import { lte, gte, and, eq, desc, asc, sql, inArray } from "drizzle-orm";
import { createHash } from "crypto";
import { invokeLLM } from "../_core/llm";

// Helper to generate scenario hash for caching
function generateScenarioHash(timestamp: Date, neutralizedEventIds: number[]): string {
  const sortedIds = [...neutralizedEventIds].sort((a, b) => a - b);
  const input = `${timestamp.toISOString()}|${sortedIds.join(',')}`;
  return createHash('sha256').update(input).digest('hex');
}

export const historicalRouter = router({
  /**
   * Get all key events for the timeline slider
   */
  getAllKeyEvents: publicProcedure
    .input(z.object({
      startYear: z.number().min(2010).max(2030).optional(),
      endYear: z.number().min(2010).max(2030).optional(),
      category: z.enum([
        "political", "economic", "military", "humanitarian",
        "monetary", "fiscal", "trade", "infrastructure", "social"
      ]).optional(),
      regimeTag: z.enum(["aden_irg", "sanaa_defacto", "all", "international"]).optional(),
      minImpactLevel: z.number().min(1).max(5).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      let conditions = [];
      
      if (input?.startYear) {
        conditions.push(gte(keyEvents.eventDate, new Date(`${input.startYear}-01-01`)));
      }
      if (input?.endYear) {
        conditions.push(lte(keyEvents.eventDate, new Date(`${input.endYear}-12-31`)));
      }
      if (input?.category) {
        conditions.push(eq(keyEvents.category, input.category));
      }
      if (input?.regimeTag) {
        conditions.push(eq(keyEvents.regimeTag, input.regimeTag));
      }
      if (input?.minImpactLevel) {
        conditions.push(gte(keyEvents.impactLevel, input.minImpactLevel));
      }
      
      const events = await db
        .select()
        .from(keyEvents)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(asc(keyEvents.eventDate));
      
      return events;
    }),

  /**
   * Get the complete platform state at a specific timestamp
   * This is the core Time-Travel endpoint
   */
  getStateAtTimestamp: publicProcedure
    .input(z.object({
      timestamp: z.date(),
      neutralizedEventIds: z.array(z.number()).optional().default([]),
      indicatorCodes: z.array(z.string()).optional(), // Filter to specific indicators
      regimeTag: z.enum(["aden_irg", "sanaa_defacto", "all"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { timestamp, neutralizedEventIds, indicatorCodes, regimeTag } = input;
      
      // Build conditions for time series query
      let tsConditions = [lte(timeSeries.date, timestamp)];
      if (indicatorCodes && indicatorCodes.length > 0) {
        tsConditions.push(inArray(timeSeries.indicatorCode, indicatorCodes));
      }
      if (regimeTag && regimeTag !== "all") {
        tsConditions.push(eq(timeSeries.regimeTag, regimeTag));
      }
      
      // Get historical observations up to timestamp
      // Use subquery to get latest value per indicator/regime combination
      const historicalObservations = await db
        .select({
          indicatorCode: timeSeries.indicatorCode,
          regimeTag: timeSeries.regimeTag,
          date: sql<Date>`MAX(${timeSeries.date})`.as('latest_date'),
          value: timeSeries.value,
          unit: timeSeries.unit,
          confidenceRating: timeSeries.confidenceRating,
        })
        .from(timeSeries)
        .where(and(...tsConditions))
        .groupBy(timeSeries.indicatorCode, timeSeries.regimeTag, timeSeries.value, timeSeries.unit, timeSeries.confidenceRating)
        .orderBy(desc(sql`latest_date`))
        .limit(100);
      
      // Get key events up to timestamp (excluding neutralized ones)
      let eventConditions = [lte(keyEvents.eventDate, timestamp)];
      if (neutralizedEventIds.length > 0) {
        eventConditions.push(sql`${keyEvents.id} NOT IN (${neutralizedEventIds.join(',')})`);
      }
      
      const historicalEvents = await db
        .select()
        .from(keyEvents)
        .where(and(...eventConditions))
        .orderBy(desc(keyEvents.eventDate))
        .limit(50);
      
      // Get economic events (legacy table) for additional context
      const legacyEvents = await db
        .select()
        .from(economicEvents)
        .where(lte(economicEvents.eventDate, timestamp))
        .orderBy(desc(economicEvents.eventDate))
        .limit(20);
      
      // Calculate summary statistics
      const fxAden = historicalObservations.find(o => 
        o.indicatorCode === 'fx_rate_aden' || o.indicatorCode === 'exchange_rate_aden'
      );
      const fxSanaa = historicalObservations.find(o => 
        o.indicatorCode === 'fx_rate_sanaa' || o.indicatorCode === 'exchange_rate_sanaa'
      );
      const inflationAden = historicalObservations.find(o => 
        o.indicatorCode === 'inflation_aden' || o.indicatorCode === 'cpi_aden'
      );
      const inflationSanaa = historicalObservations.find(o => 
        o.indicatorCode === 'inflation_sanaa' || o.indicatorCode === 'cpi_sanaa'
      );
      
      const summary = {
        fxRateAden: fxAden ? parseFloat(String(fxAden.value)) : null,
        fxRateSanaa: fxSanaa ? parseFloat(String(fxSanaa.value)) : null,
        inflationAden: inflationAden ? parseFloat(String(inflationAden.value)) : null,
        inflationSanaa: inflationSanaa ? parseFloat(String(inflationSanaa.value)) : null,
        totalEvents: historicalEvents.length,
        criticalEvents: historicalEvents.filter(e => e.impactLevel >= 4).length,
      };
      
      return {
        timestamp,
        observations: historicalObservations,
        keyEvents: historicalEvents,
        legacyEvents,
        summary,
        neutralizedEventIds,
      };
    }),

  /**
   * Generate AI projection for a what-if scenario
   * Caches results to avoid repeated LLM calls
   */
  getWhatIfProjection: protectedProcedure
    .input(z.object({
      timestamp: z.date(),
      neutralizedEventIds: z.array(z.number()),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { timestamp, neutralizedEventIds } = input;
      
      if (neutralizedEventIds.length === 0) {
        return null; // No what-if scenario requested
      }
      
      const scenarioHash = generateScenarioHash(timestamp, neutralizedEventIds);
      
      // Check cache first
      const cached = await db
        .select()
        .from(aiProjections)
        .where(eq(aiProjections.scenarioHash, scenarioHash))
        .limit(1);
      
      if (cached.length > 0 && cached[0].expiresAt && cached[0].expiresAt > new Date()) {
        return cached[0].projectionData;
      }
      
      // Get the neutralized events for context
      const neutralizedEvents = await db
        .select()
        .from(keyEvents)
        .where(inArray(keyEvents.id, neutralizedEventIds));
      
      // Get current state for comparison
      const currentState = await db
        .select()
        .from(timeSeries)
        .where(lte(timeSeries.date, timestamp))
        .orderBy(desc(timeSeries.date))
        .limit(50);
      
      // Generate AI projection
      const startTime = Date.now();
      
      const prompt = `You are an economic analyst for Yemen. Given the following scenario, project what the economic indicators might have been if certain historical events had NOT occurred.

Current timestamp: ${timestamp.toISOString()}

Events being neutralized (imagining they didn't happen):
${neutralizedEvents.map(e => `- ${e.title} (${e.eventDate?.toISOString().split('T')[0]}): ${e.description}`).join('\n')}

Current economic state at this time:
${currentState.slice(0, 10).map(s => `- ${s.indicatorCode}: ${s.value} ${s.unit}`).join('\n')}

Please provide a JSON response with the following structure:
{
  "projectedIndicators": [
    {
      "indicatorCode": "fx_rate_aden",
      "originalValue": <current value>,
      "projectedValue": <what it might have been>,
      "confidence": <0-1>,
      "reasoning": "<brief explanation>"
    }
  ],
  "narrativeSummary": "<2-3 sentence summary in English>",
  "narrativeSummaryAr": "<Arabic translation>",
  "methodology": "<brief methodology note>",
  "caveats": ["<caveat 1>", "<caveat 2>"]
}`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are an expert economic analyst specializing in Yemen's economy. Respond only with valid JSON." },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" }
        });
        
        const generationTimeMs = Date.now() - startTime;
        const content = response.choices[0].message.content;
        const projectionData = JSON.parse(typeof content === 'string' ? content : '{}');
        
        // Cache the result
        await db.insert(aiProjections).values({
          scenarioHash,
          timestamp,
          neutralizedEventIds: neutralizedEventIds,
          projectionData,
          modelUsed: 'gpt-4',
          generationTimeMs,
          requestedBy: ctx.user?.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days cache
        });
        
        return projectionData;
      } catch (error) {
        console.error('AI projection generation failed:', error);
        return {
          projectedIndicators: [],
          narrativeSummary: "Unable to generate projection at this time.",
          narrativeSummaryAr: "غير قادر على إنشاء التوقعات في هذا الوقت.",
          methodology: "AI projection failed",
          caveats: ["Projection could not be generated due to an error"],
        };
      }
    }),

  /**
   * Get pre-computed historical snapshots for fast loading
   */
  getHistoricalSnapshots: publicProcedure
    .input(z.object({
      snapshotType: z.enum(["monthly", "quarterly", "annual", "event_triggered"]).optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      let conditions = [];
      if (input?.snapshotType) {
        conditions.push(eq(historicalSnapshots.snapshotType, input.snapshotType));
      }
      if (input?.startDate) {
        conditions.push(gte(historicalSnapshots.snapshotDate, input.startDate));
      }
      if (input?.endDate) {
        conditions.push(lte(historicalSnapshots.snapshotDate, input.endDate));
      }
      
      const snapshots = await db
        .select()
        .from(historicalSnapshots)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(asc(historicalSnapshots.snapshotDate));
      
      return snapshots;
    }),

  /**
   * Get event categories with counts for filtering UI
   */
  getEventCategories: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    const categories = await db
      .select({
        category: keyEvents.category,
        count: sql<number>`COUNT(*)`.as('count'),
      })
      .from(keyEvents)
      .groupBy(keyEvents.category);
    
    return categories;
  }),

  /**
   * Get events by year for timeline visualization
   */
  getEventsByYear: publicProcedure
    .input(z.object({
      year: z.number().min(2010).max(2030),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const startDate = new Date(`${input.year}-01-01`);
      const endDate = new Date(`${input.year}-12-31`);
      
      const events = await db
        .select()
        .from(keyEvents)
        .where(and(
          gte(keyEvents.eventDate, startDate),
          lte(keyEvents.eventDate, endDate)
        ))
        .orderBy(asc(keyEvents.eventDate));
      
      return events;
    }),

  /**
   * Get year range with event counts for slider marks
   */
  getYearEventCounts: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    const counts = await db
      .select({
        year: sql<number>`YEAR(${keyEvents.eventDate})`.as('year'),
        count: sql<number>`COUNT(*)`.as('count'),
        criticalCount: sql<number>`SUM(CASE WHEN ${keyEvents.impactLevel} >= 4 THEN 1 ELSE 0 END)`.as('critical_count'),
      })
      .from(keyEvents)
      .groupBy(sql`YEAR(${keyEvents.eventDate})`)
      .orderBy(sql`year`);
    
    return counts;
  }),
});

export type HistoricalRouter = typeof historicalRouter;
