/**
 * Sector Pages Router
 * Provides API endpoints for sector intelligence pages with evidence-backed data
 */

import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { sql } from "drizzle-orm";
import {
  getAllSectorDefinitions,
  getSectorDefinition,
  getSectorIndicators,
  getSectorEvents,
  getSectorDocuments,
  getSectorContradictions,
  getSectorGaps,
  getSectorAlerts,
  getSectorWatchlist,
  getSectorKpis,
  getSectorMechanisms,
  getSectorFaqs,
  getSectorReleaseGate,
  generateSectorContextPack,
  getLatestContextPack,
  calculateSectorCoverage
} from "../services/sectorAgentService";

export const sectorPagesRouter = router({
  // Get all sector definitions for navigation
  getAllSectors: publicProcedure.query(async () => {
    try {
      const sectors = await getAllSectorDefinitions();
      return { success: true, sectors };
    } catch (error) {
      console.error('[SectorPages] Failed to get all sectors:', error);
      return { success: false, sectors: [], error: 'Failed to load sectors' };
    }
  }),

  // Get single sector definition
  getSector: publicProcedure
    .input(z.object({ sectorCode: z.string() }))
    .query(async ({ input }) => {
      try {
        const sector = await getSectorDefinition(input.sectorCode);
        if (!sector) {
          return { success: false, sector: null, error: 'Sector not found' };
        }
        return { success: true, sector };
      } catch (error) {
        console.error(`[SectorPages] Failed to get sector ${input.sectorCode}:`, error);
        return { success: false, sector: null, error: 'Failed to load sector' };
      }
    }),

  // Get complete sector page data (all sections)
  getSectorPageData: publicProcedure
    .input(z.object({
      sectorCode: z.string(),
      regime: z.enum(['both', 'aden_irg', 'sanaa_dfa']).optional().default('both'),
      isVip: z.boolean().optional().default(false)
    }))
    .query(async ({ input }) => {
      try {
        const [
          definition,
          indicators,
          events,
          documents,
          contradictions,
          gaps,
          alerts,
          watchlist,
          kpis,
          mechanisms,
          faqs,
          releaseGate,
          coverage
        ] = await Promise.all([
          getSectorDefinition(input.sectorCode),
          getSectorIndicators(input.sectorCode),
          getSectorEvents(input.sectorCode, 10),
          getSectorDocuments(input.sectorCode, 10),
          getSectorContradictions(input.sectorCode),
          getSectorGaps(input.sectorCode),
          getSectorAlerts(input.sectorCode, 5),
          getSectorWatchlist(input.sectorCode, input.isVip),
          getSectorKpis(input.sectorCode),
          getSectorMechanisms(input.sectorCode),
          getSectorFaqs(input.sectorCode),
          getSectorReleaseGate(input.sectorCode),
          calculateSectorCoverage(input.sectorCode)
        ]);

        if (!definition) {
          return { success: false, error: 'Sector not found' };
        }

        // Filter by regime if specified
        const filteredIndicators = input.regime === 'both' 
          ? indicators 
          : indicators.filter(ind => !ind.regime || ind.regime === input.regime);

        // Build "Sector in 60 Seconds" data
        const sectorIn60Seconds = {
          topKpis: kpis.length > 0 ? kpis.slice(0, 5) : filteredIndicators.slice(0, 5).map(ind => ({
            indicatorCode: ind.indicatorCode,
            titleEn: ind.nameEn,
            titleAr: ind.nameAr,
            value: ind.currentValue,
            change: ind.changePercent,
            confidence: ind.confidence,
            source: ind.sourceName,
            lastUpdated: ind.lastUpdated
          })),
          topChanges: filteredIndicators
            .filter(ind => ind.changePercent !== null && Math.abs(ind.changePercent || 0) > 2)
            .slice(0, 3)
            .map(ind => ({
              indicatorCode: ind.indicatorCode,
              titleEn: ind.nameEn,
              titleAr: ind.nameAr,
              previousValue: ind.previousValue,
              currentValue: ind.currentValue,
              changePercent: ind.changePercent
            })),
          topAlerts: alerts.slice(0, 3)
        };

        // Build core trends data
        const coreTrends = {
          primaryChart: definition.flagshipIndicatorCode 
            ? filteredIndicators.find(ind => ind.indicatorCode === definition.flagshipIndicatorCode)
            : filteredIndicators[0],
          secondaryCharts: filteredIndicators.slice(1, 5)
        };

        // Build drivers & links
        const driversAndLinks = {
          relatedEvents: events,
          relatedEntities: [], // Would come from entity graph
          relatedProjects: [], // Would come from IATI/WB data
          relatedDocuments: documents
        };

        return {
          success: true,
          data: {
            definition,
            sectorIn60Seconds,
            coreTrends,
            mechanisms,
            driversAndLinks,
            contradictions,
            gaps,
            watchlist,
            faqs,
            coverage: {
              dataCoveragePercent: coverage.coverage,
              dataFreshnessPercent: coverage.freshness,
              contradictionCount: contradictions.length,
              gapCount: gaps.length
            },
            releaseGate,
            lastUpdated: new Date().toISOString()
          }
        };
      } catch (error) {
        console.error(`[SectorPages] Failed to get page data for ${input.sectorCode}:`, error);
        return { success: false, error: 'Failed to load sector page data' };
      }
    }),

  // Get sector time series data for charts
  getSectorTimeSeries: publicProcedure
    .input(z.object({
      sectorCode: z.string(),
      indicatorCode: z.string().optional(),
      startYear: z.number().optional().default(2010),
      endYear: z.number().optional().default(2026),
      regime: z.enum(['both', 'aden_irg', 'sanaa_dfa']).optional().default('both')
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, data: [], error: 'Database unavailable' };

      try {
        let query;
        if (input.indicatorCode) {
          query = sql`
            SELECT ts.*, i.nameEn, i.nameAr, s.nameEn as sourceName
            FROM time_series ts
            LEFT JOIN indicators i ON ts.indicatorCode = i.indicatorCode
            LEFT JOIN sources s ON ts.sourceId = s.id
            WHERE ts.indicatorCode = ${input.indicatorCode}
            AND YEAR(ts.date) >= ${input.startYear}
            AND YEAR(ts.date) <= ${input.endYear}
            ORDER BY ts.date ASC
          `;
        } else {
          query = sql`
            SELECT ts.*, i.nameEn, i.nameAr, s.nameEn as sourceName
            FROM time_series ts
            LEFT JOIN indicators i ON ts.indicatorCode = i.indicatorCode
            LEFT JOIN sources s ON ts.sourceId = s.id
            WHERE i.sector = ${input.sectorCode}
            AND YEAR(ts.date) >= ${input.startYear}
            AND YEAR(ts.date) <= ${input.endYear}
            ORDER BY ts.indicatorCode, ts.date ASC
          `;
        }

        const result = await db.execute(query);
        const rows = (result as any)[0] || [];

        // Filter by regime if specified
        const filteredRows = input.regime === 'both'
          ? rows
          : rows.filter((row: any) => !row.regime || row.regime === input.regime);

        return { success: true, data: filteredRows };
      } catch (error) {
        console.error(`[SectorPages] Failed to get time series for ${input.sectorCode}:`, error);
        return { success: false, data: [], error: 'Failed to load time series data' };
      }
    }),

  // Get sector context pack (for AI/exports)
  getContextPack: publicProcedure
    .input(z.object({
      sectorCode: z.string(),
      forceRefresh: z.boolean().optional().default(false)
    }))
    .query(async ({ input }) => {
      try {
        // Check for existing recent pack
        if (!input.forceRefresh) {
          const existingPack = await getLatestContextPack(input.sectorCode);
          if (existingPack) {
            const packAge = Date.now() - existingPack.packDate.getTime();
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours
            if (packAge < maxAge) {
              return { success: true, pack: existingPack, cached: true };
            }
          }
        }

        // Generate fresh pack
        const pack = await generateSectorContextPack(input.sectorCode);
        return { success: true, pack, cached: false };
      } catch (error) {
        console.error(`[SectorPages] Failed to get context pack for ${input.sectorCode}:`, error);
        return { success: false, pack: null, error: 'Failed to generate context pack' };
      }
    }),

  // Get sector briefs
  getSectorBriefs: publicProcedure
    .input(z.object({
      sectorCode: z.string(),
      briefType: z.enum(['public', 'vip']).optional(),
      limit: z.number().optional().default(10)
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, briefs: [], error: 'Database unavailable' };

      try {
        const typeFilter = input.briefType 
          ? sql`AND briefType = ${input.briefType}`
          : sql``;

        const result = await db.execute(sql`
          SELECT * FROM sector_briefs
          WHERE sectorCode = ${input.sectorCode}
          ${typeFilter}
          AND status = 'published'
          ORDER BY weekStart DESC
          LIMIT ${input.limit}
        `);

        return { success: true, briefs: (result as any)[0] || [] };
      } catch (error) {
        console.error(`[SectorPages] Failed to get briefs for ${input.sectorCode}:`, error);
        return { success: false, briefs: [], error: 'Failed to load briefs' };
      }
    }),

  // Admin: Update sector definition
  updateSectorDefinition: protectedProcedure
    .input(z.object({
      sectorCode: z.string(),
      updates: z.object({
        nameEn: z.string().optional(),
        nameAr: z.string().optional(),
        missionEn: z.string().optional(),
        missionAr: z.string().optional(),
        displayOrder: z.number().optional(),
        navLabelEn: z.string().optional(),
        navLabelAr: z.string().optional(),
        iconName: z.string().optional(),
        heroColor: z.string().optional(),
        flagshipIndicatorCode: z.string().optional(),
        hasRegimeSplit: z.boolean().optional(),
        isActive: z.boolean().optional(),
        isPublished: z.boolean().optional()
      })
    }))
    .mutation(async ({ input, ctx }) => {
      // Check admin role
      if (ctx.user.role !== 'admin') {
        return { success: false, error: 'Admin access required' };
      }

      const db = await getDb();
      if (!db) return { success: false, error: 'Database unavailable' };

      try {
        const setClauses: string[] = [];
        const values: any[] = [];

        Object.entries(input.updates).forEach(([key, value]) => {
          if (value !== undefined) {
            setClauses.push(`${key} = ?`);
            values.push(value);
          }
        });

        if (setClauses.length === 0) {
          return { success: false, error: 'No updates provided' };
        }

        values.push(input.sectorCode);

        // Build dynamic update query
        const updateQuery = `UPDATE sector_definitions SET ${setClauses.join(', ')} WHERE sectorCode = ?`;
        await db.execute(sql.raw(updateQuery.replace(/\?/g, () => {
          const val = values.shift();
          return typeof val === 'string' ? `'${val}'` : String(val);
        })));

        return { success: true };
      } catch (error) {
        console.error(`[SectorPages] Failed to update sector ${input.sectorCode}:`, error);
        return { success: false, error: 'Failed to update sector' };
      }
    }),

  // Admin: Add sector KPI
  addSectorKpi: protectedProcedure
    .input(z.object({
      sectorCode: z.string(),
      indicatorCode: z.string(),
      titleEn: z.string(),
      titleAr: z.string(),
      unitEn: z.string().optional(),
      unitAr: z.string().optional(),
      formatType: z.enum(['number', 'percent', 'currency', 'index']).optional(),
      displayOrder: z.number().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        return { success: false, error: 'Admin access required' };
      }

      const db = await getDb();
      if (!db) return { success: false, error: 'Database unavailable' };

      try {
        await db.execute(sql`
          INSERT INTO sector_kpis (
            sectorCode, indicatorCode, titleEn, titleAr, 
            unitEn, unitAr, formatType, displayOrder
          ) VALUES (
            ${input.sectorCode},
            ${input.indicatorCode},
            ${input.titleEn},
            ${input.titleAr},
            ${input.unitEn || null},
            ${input.unitAr || null},
            ${input.formatType || 'number'},
            ${input.displayOrder || 0}
          )
        `);

        return { success: true };
      } catch (error) {
        console.error(`[SectorPages] Failed to add KPI for ${input.sectorCode}:`, error);
        return { success: false, error: 'Failed to add KPI' };
      }
    }),

  // Admin: Add sector mechanism explainer
  addSectorMechanism: protectedProcedure
    .input(z.object({
      sectorCode: z.string(),
      headingEn: z.string(),
      headingAr: z.string(),
      contentEn: z.string(),
      contentAr: z.string(),
      contentType: z.enum(['evidence_backed', 'conceptual']).optional(),
      citations: z.array(z.object({
        citationId: z.string(),
        sourceId: z.number(),
        documentId: z.number().optional(),
        pageRef: z.string().optional(),
        quote: z.string().optional()
      })).optional(),
      sectionOrder: z.number().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        return { success: false, error: 'Admin access required' };
      }

      const db = await getDb();
      if (!db) return { success: false, error: 'Database unavailable' };

      try {
        await db.execute(sql`
          INSERT INTO sector_mechanisms (
            sectorCode, headingEn, headingAr, contentEn, contentAr,
            contentType, citations, sectionOrder
          ) VALUES (
            ${input.sectorCode},
            ${input.headingEn},
            ${input.headingAr},
            ${input.contentEn},
            ${input.contentAr},
            ${input.contentType || 'evidence_backed'},
            ${JSON.stringify(input.citations || [])},
            ${input.sectionOrder || 0}
          )
        `);

        return { success: true };
      } catch (error) {
        console.error(`[SectorPages] Failed to add mechanism for ${input.sectorCode}:`, error);
        return { success: false, error: 'Failed to add mechanism explainer' };
      }
    }),

  // Admin: Add sector FAQ
  addSectorFaq: protectedProcedure
    .input(z.object({
      sectorCode: z.string(),
      questionEn: z.string(),
      questionAr: z.string(),
      answerEn: z.string(),
      answerAr: z.string(),
      citations: z.array(z.object({
        citationId: z.string(),
        sourceId: z.number()
      })).optional(),
      isRefusalAnswer: z.boolean().optional(),
      displayOrder: z.number().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        return { success: false, error: 'Admin access required' };
      }

      const db = await getDb();
      if (!db) return { success: false, error: 'Database unavailable' };

      try {
        await db.execute(sql`
          INSERT INTO sector_faqs (
            sectorCode, questionEn, questionAr, answerEn, answerAr,
            citations, isRefusalAnswer, displayOrder
          ) VALUES (
            ${input.sectorCode},
            ${input.questionEn},
            ${input.questionAr},
            ${input.answerEn},
            ${input.answerAr},
            ${JSON.stringify(input.citations || [])},
            ${input.isRefusalAnswer || false},
            ${input.displayOrder || 0}
          )
        `);

        return { success: true };
      } catch (error) {
        console.error(`[SectorPages] Failed to add FAQ for ${input.sectorCode}:`, error);
        return { success: false, error: 'Failed to add FAQ' };
      }
    }),

  // Admin: Update release gate
  updateReleaseGate: protectedProcedure
    .input(z.object({
      sectorCode: z.string(),
      evidenceCoveragePercent: z.number().optional(),
      evidenceCoveragePassed: z.boolean().optional(),
      exportsWorking: z.boolean().optional(),
      contradictionsVisible: z.boolean().optional(),
      bilingualParityPassed: z.boolean().optional(),
      noPlaceholdersPassed: z.boolean().optional(),
      notes: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        return { success: false, error: 'Admin access required' };
      }

      const db = await getDb();
      if (!db) return { success: false, error: 'Database unavailable' };

      try {
        // Calculate if all gates passed
        const allGatesPassed = 
          (input.evidenceCoveragePassed ?? false) &&
          (input.exportsWorking ?? false) &&
          (input.contradictionsVisible ?? false) &&
          (input.bilingualParityPassed ?? false) &&
          (input.noPlaceholdersPassed ?? false);

        // Upsert release gate
        await db.execute(sql`
          INSERT INTO sector_release_gates (
            sectorCode, evidenceCoveragePercent, evidenceCoveragePassed,
            exportsWorking, contradictionsVisible, bilingualParityPassed,
            noPlaceholdersPassed, allGatesPassed, lastCheckedAt, notes
          ) VALUES (
            ${input.sectorCode},
            ${input.evidenceCoveragePercent || 0},
            ${input.evidenceCoveragePassed || false},
            ${input.exportsWorking || false},
            ${input.contradictionsVisible || false},
            ${input.bilingualParityPassed || false},
            ${input.noPlaceholdersPassed || false},
            ${allGatesPassed},
            NOW(),
            ${input.notes || null}
          )
          ON DUPLICATE KEY UPDATE
            evidenceCoveragePercent = VALUES(evidenceCoveragePercent),
            evidenceCoveragePassed = VALUES(evidenceCoveragePassed),
            exportsWorking = VALUES(exportsWorking),
            contradictionsVisible = VALUES(contradictionsVisible),
            bilingualParityPassed = VALUES(bilingualParityPassed),
            noPlaceholdersPassed = VALUES(noPlaceholdersPassed),
            allGatesPassed = VALUES(allGatesPassed),
            lastCheckedAt = NOW(),
            notes = VALUES(notes)
        `);

        return { success: true, allGatesPassed };
      } catch (error) {
        console.error(`[SectorPages] Failed to update release gate for ${input.sectorCode}:`, error);
        return { success: false, error: 'Failed to update release gate' };
      }
    }),

  // Get all release gates (for admin dashboard)
  getAllReleaseGates: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') {
      return { success: false, gates: [], error: 'Admin access required' };
    }

    const db = await getDb();
    if (!db) return { success: false, gates: [], error: 'Database unavailable' };

    try {
      const result = await db.execute(sql`
        SELECT rg.*, sd.nameEn, sd.nameAr
        FROM sector_release_gates rg
        LEFT JOIN sector_definitions sd ON rg.sectorCode = sd.sectorCode
        ORDER BY sd.displayOrder ASC
      `);

      return { success: true, gates: (result as any)[0] || [] };
    } catch (error) {
      console.error('[SectorPages] Failed to get all release gates:', error);
      return { success: false, gates: [], error: 'Failed to load release gates' };
    }
  }),

  // Get methodology notes
  getMethodologyNotes: publicProcedure
    .input(z.object({
      sectorCode: z.string().optional(),
      category: z.string().optional()
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, notes: [], error: 'Database unavailable' };

      try {
        let query;
        if (input.sectorCode) {
          query = sql`
            SELECT * FROM methodology_notes
            WHERE (sectorCode = ${input.sectorCode} OR sectorCode IS NULL)
            AND isPublished = 1
            ORDER BY createdAt DESC
          `;
        } else if (input.category) {
          query = sql`
            SELECT * FROM methodology_notes
            WHERE category = ${input.category}
            AND isPublished = 1
            ORDER BY createdAt DESC
          `;
        } else {
          query = sql`
            SELECT * FROM methodology_notes
            WHERE isPublished = 1
            ORDER BY category, createdAt DESC
          `;
        }

        const result = await db.execute(query);
        return { success: true, notes: (result as any)[0] || [] };
      } catch (error) {
        console.error('[SectorPages] Failed to get methodology notes:', error);
        return { success: false, notes: [], error: 'Failed to load methodology notes' };
      }
    }),

  // Admin: Add methodology note
  addMethodologyNote: protectedProcedure
    .input(z.object({
      titleEn: z.string(),
      titleAr: z.string(),
      contentEn: z.string(),
      contentAr: z.string(),
      category: z.enum([
        'data_collection',
        'contradiction_handling',
        'confidence_grades',
        'revisions_vintages',
        'uncertainty_interpretation',
        'missing_data',
        'data_licenses',
        'general'
      ]).optional(),
      sectorCode: z.string().optional(),
      isPublished: z.boolean().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        return { success: false, error: 'Admin access required' };
      }

      const db = await getDb();
      if (!db) return { success: false, error: 'Database unavailable' };

      try {
        await db.execute(sql`
          INSERT INTO methodology_notes (
            titleEn, titleAr, contentEn, contentAr,
            category, sectorCode, isPublished, authorId,
            publishedAt
          ) VALUES (
            ${input.titleEn},
            ${input.titleAr},
            ${input.contentEn},
            ${input.contentAr},
            ${input.category || 'general'},
            ${input.sectorCode || null},
            ${input.isPublished || false},
            ${ctx.user.id},
            ${input.isPublished ? sql`NOW()` : sql`NULL`}
          )
        `);

        return { success: true };
      } catch (error) {
        console.error('[SectorPages] Failed to add methodology note:', error);
        return { success: false, error: 'Failed to add methodology note' };
      }
    }),

  // Get credibility metrics
  getCredibilityMetrics: publicProcedure
    .input(z.object({
      sectorCode: z.string().optional()
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, metrics: null, error: 'Database unavailable' };

      try {
        let query;
        if (input.sectorCode) {
          query = sql`
            SELECT * FROM credibility_metrics
            WHERE sectorCode = ${input.sectorCode}
            ORDER BY metricDate DESC
            LIMIT 1
          `;
        } else {
          query = sql`
            SELECT * FROM credibility_metrics
            WHERE sectorCode IS NULL
            ORDER BY metricDate DESC
            LIMIT 1
          `;
        }

        const result = await db.execute(query);
        const metrics = (result as any)[0]?.[0] || null;

        return { success: true, metrics };
      } catch (error) {
        console.error('[SectorPages] Failed to get credibility metrics:', error);
        return { success: false, metrics: null, error: 'Failed to load credibility metrics' };
      }
    })
});

export type SectorPagesRouter = typeof sectorPagesRouter;
