/**
 * Source Registry Router - CANONICAL
 * 
 * This router reads from the source_registry table (canonical, 292 sources)
 * imported from YETO_Sources_Universe_Master_PRODUCTION_READY_v2_3.xlsx
 * 
 * DO NOT use the legacy 'sources' table or JSON config files.
 * This is the single source of truth for all source metadata.
 */

import { router, publicProcedure, protectedProcedure, adminProcedure } from '../_core/trpc';
import { z } from 'zod';
import { getDb } from '../db';
import { sql, eq, like, or, and, desc, asc } from 'drizzle-orm';

// Tier descriptions
const TIER_DESCRIPTIONS: Record<string, string> = {
  T0: 'Official Government Sources (CBY, CSO)',
  T1: 'International Organizations (UN, WB, IMF)',
  T2: 'Research Institutions & Assessments',
  T3: 'Aggregated Data Platforms',
  T4: 'Supplementary & News Sources',
  UNKNOWN: 'Not yet classified',
};

// Status descriptions
const STATUS_DESCRIPTIONS: Record<string, string> = {
  ACTIVE: 'Connector active and fetching data',
  NEEDS_KEY: 'Requires API key or partnership',
  PENDING_REVIEW: 'Awaiting classification',
  INACTIVE: 'Temporarily disabled',
  DEPRECATED: 'No longer maintained',
};

export const sourceRegistryRouter = router({
  /**
   * Get all sources from canonical source_registry table
   */
  getAll: publicProcedure
    .input(z.object({
      tier: z.string().optional(),
      status: z.string().optional(),
      search: z.string().optional(),
      sectorCode: z.string().optional(),
      limit: z.number().default(100),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return { success: false, sources: [], total: 0, error: 'Database unavailable' };
      }

      try {
        // Build WHERE clause
        let whereClause = sql`1=1`;
        
        if (input.tier) {
          whereClause = sql`${whereClause} AND tier = ${input.tier}`;
        }
        if (input.status) {
          whereClause = sql`${whereClause} AND status = ${input.status}`;
        }
        if (input.search) {
          const searchTerm = `%${input.search}%`;
          whereClause = sql`${whereClause} AND (name LIKE ${searchTerm} OR altName LIKE ${searchTerm} OR sourceId LIKE ${searchTerm} OR description LIKE ${searchTerm})`;
        }

        // Get total count
        const [countResult] = await db.execute(sql`
          SELECT COUNT(*) as total FROM source_registry WHERE ${whereClause}
        `);
        const total = (countResult as any)[0]?.total || 0;

        // Get sources with pagination
        const result = await db.execute(sql`
          SELECT 
            id, sourceId, name, altName, publisher, webUrl, description,
            tier, status, accessType, updateFrequency, language, allowedUse,
            apiKeyRequired, needsPartnership, partnershipContact,
            confidenceRating, freshnessSla, connectorType,
            geographicScope, sectorCategory, license,
            historicalStart, historicalEnd,
            lastFetch, nextFetch, createdAt, updatedAt
          FROM source_registry
          WHERE ${whereClause}
          ORDER BY 
            CASE tier 
              WHEN 'T0' THEN 1 
              WHEN 'T1' THEN 2 
              WHEN 'T2' THEN 3 
              WHEN 'T3' THEN 4 
              WHEN 'T4' THEN 5 
              ELSE 6 
            END,
            name ASC
          LIMIT ${input.limit} OFFSET ${input.offset}
        `);

        const sources = ((result as any)[0] || []).map((row: any) => ({
          id: row.id,
          sourceId: row.sourceId,
          name: row.name,
          nameAr: row.altName,
          publisher: row.publisher,
          url: row.webUrl,
          description: row.description,
          tier: row.tier,
          tierDescription: TIER_DESCRIPTIONS[row.tier] || TIER_DESCRIPTIONS.UNKNOWN,
          status: row.status,
          statusDescription: STATUS_DESCRIPTIONS[row.status] || STATUS_DESCRIPTIONS.PENDING_REVIEW,
          accessType: row.accessType,
          updateFrequency: row.updateFrequency,
          language: row.language,
          allowedUse: row.allowedUse,
          apiKeyRequired: row.apiKeyRequired,
          needsPartnership: row.needsPartnership,
          partnershipContact: row.partnershipContact,
          confidenceRating: row.confidenceRating,
          freshnessSla: row.freshnessSla,
          connectorType: row.connectorType,
          geographicScope: row.geographicScope,
          sectorCategory: row.sectorCategory,
          license: row.license,
          historicalStart: row.historicalStart,
          historicalEnd: row.historicalEnd,
          lastFetch: row.lastFetch,
          nextFetch: row.nextFetch,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        }));

        return { success: true, sources, total };
      } catch (error) {
        console.error('[SourceRegistry] Failed to get sources:', error);
        return { success: false, sources: [], total: 0, error: String(error) };
      }
    }),

  /**
   * Get source by ID
   */
  getById: publicProcedure
    .input(z.object({ sourceId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return { success: false, source: null, error: 'Database unavailable' };
      }

      try {
        const result = await db.execute(sql`
          SELECT * FROM source_registry WHERE sourceId = ${input.sourceId}
        `);

        const row = (result as any)[0]?.[0];
        if (!row) {
          return { success: false, source: null, error: 'Source not found' };
        }

        // Get sector mappings for this source
        const sectorResult = await db.execute(sql`
          SELECT rsm.sectorCode, rsm.isPrimary, sc.sectorName
          FROM registry_sector_map rsm
          LEFT JOIN sector_codebook sc ON rsm.sectorCode = sc.sectorCode
          WHERE rsm.sourceId = ${input.sourceId}
        `);

        const sectors = ((sectorResult as any)[0] || []).map((s: any) => ({
          code: s.sectorCode,
          name: s.sectorName,
          isPrimary: s.isPrimary,
        }));

        return {
          success: true,
          source: {
            ...row,
            tierDescription: TIER_DESCRIPTIONS[row.tier] || TIER_DESCRIPTIONS.UNKNOWN,
            statusDescription: STATUS_DESCRIPTIONS[row.status] || STATUS_DESCRIPTIONS.PENDING_REVIEW,
            sectors,
          },
        };
      } catch (error) {
        console.error('[SourceRegistry] Failed to get source:', error);
        return { success: false, source: null, error: String(error) };
      }
    }),

  /**
   * Get registry statistics
   */
  getStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return { success: false, stats: null, error: 'Database unavailable' };
    }

    try {
      // Get counts by tier
      const tierResult = await db.execute(sql`
        SELECT tier, COUNT(*) as count FROM source_registry GROUP BY tier
      `);
      const byTier: Record<string, number> = {};
      for (const row of (tierResult as any)[0] || []) {
        byTier[row.tier || 'UNKNOWN'] = row.count;
      }

      // Get counts by status
      const statusResult = await db.execute(sql`
        SELECT status, COUNT(*) as count FROM source_registry GROUP BY status
      `);
      const byStatus: Record<string, number> = {};
      for (const row of (statusResult as any)[0] || []) {
        byStatus[row.status || 'PENDING_REVIEW'] = row.count;
      }

      // Get counts by frequency
      const freqResult = await db.execute(sql`
        SELECT updateFrequency, COUNT(*) as count FROM source_registry GROUP BY updateFrequency
      `);
      const byFrequency: Record<string, number> = {};
      for (const row of (freqResult as any)[0] || []) {
        byFrequency[row.updateFrequency || 'IRREGULAR'] = row.count;
      }

      // Get counts by access type
      const accessResult = await db.execute(sql`
        SELECT accessType, COUNT(*) as count FROM source_registry GROUP BY accessType
      `);
      const byAccessType: Record<string, number> = {};
      for (const row of (accessResult as any)[0] || []) {
        byAccessType[row.accessType || 'WEB'] = row.count;
      }

      // Get total count
      const [totalResult] = await db.execute(sql`SELECT COUNT(*) as total FROM source_registry`);
      const total = (totalResult as any)[0]?.total || 0;

      // Get active count
      const [activeResult] = await db.execute(sql`
        SELECT COUNT(*) as active FROM source_registry WHERE status = 'ACTIVE'
      `);
      const active = (activeResult as any)[0]?.active || 0;

      // Get needs key count
      const [needsKeyResult] = await db.execute(sql`
        SELECT COUNT(*) as needsKey FROM source_registry WHERE status = 'NEEDS_KEY'
      `);
      const needsKey = (needsKeyResult as any)[0]?.needsKey || 0;

      // Get sector count
      const [sectorResult] = await db.execute(sql`SELECT COUNT(*) as count FROM sector_codebook`);
      const sectorCount = (sectorResult as any)[0]?.count || 0;

      return {
        success: true,
        stats: {
          total,
          active,
          needsKey,
          pending: byStatus['PENDING_REVIEW'] || 0,
          inactive: byStatus['INACTIVE'] || 0,
          deprecated: byStatus['DEPRECATED'] || 0,
          byTier,
          byStatus,
          byFrequency,
          byAccessType,
          sectorCount,
          tierDescriptions: TIER_DESCRIPTIONS,
          statusDescriptions: STATUS_DESCRIPTIONS,
        },
      };
    } catch (error) {
      console.error('[SourceRegistry] Failed to get stats:', error);
      return { success: false, stats: null, error: String(error) };
    }
  }),

  /**
   * Get all sectors from codebook
   */
  getSectors: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return { success: false, sectors: [], error: 'Database unavailable' };
    }

    try {
      const result = await db.execute(sql`
        SELECT sectorCode, sectorName, sectorNameAr, definition, displayOrder
        FROM sector_codebook
        ORDER BY displayOrder, sectorCode
      `);

      const sectors = ((result as any)[0] || []).map((row: any) => ({
        code: row.sectorCode,
        name: row.sectorName,
        nameAr: row.sectorNameAr,
        definition: row.definition,
        displayOrder: row.displayOrder,
      }));

      return { success: true, sectors };
    } catch (error) {
      console.error('[SourceRegistry] Failed to get sectors:', error);
      return { success: false, sectors: [], error: String(error) };
    }
  }),

  /**
   * Get sources by sector
   */
  getSourcesBySector: publicProcedure
    .input(z.object({ 
      sectorCode: z.string(),
      primaryOnly: z.boolean().default(false),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return { success: false, sources: [], error: 'Database unavailable' };
      }

      try {
        let whereClause = sql`rsm.sectorCode = ${input.sectorCode}`;
        if (input.primaryOnly) {
          whereClause = sql`${whereClause} AND rsm.isPrimary = 1`;
        }

        const result = await db.execute(sql`
          SELECT sr.*, rsm.isPrimary
          FROM source_registry sr
          INNER JOIN registry_sector_map rsm ON sr.sourceId = rsm.sourceId
          WHERE ${whereClause}
          ORDER BY rsm.isPrimary DESC, sr.tier, sr.name
        `);

        const sources = ((result as any)[0] || []).map((row: any) => ({
          ...row,
          tierDescription: TIER_DESCRIPTIONS[row.tier] || TIER_DESCRIPTIONS.UNKNOWN,
          statusDescription: STATUS_DESCRIPTIONS[row.status] || STATUS_DESCRIPTIONS.PENDING_REVIEW,
        }));

        return { success: true, sources };
      } catch (error) {
        console.error('[SourceRegistry] Failed to get sources by sector:', error);
        return { success: false, sources: [], error: String(error) };
      }
    }),

  /**
   * Get sources needing API keys or partnerships
   */
  getSourcesNeedingAccess: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return { success: false, sources: [], error: 'Database unavailable' };
    }

    try {
      const result = await db.execute(sql`
        SELECT sourceId, name, altName, tier, status, partnershipContact, description
        FROM source_registry
        WHERE status = 'NEEDS_KEY' OR needsPartnership = 1
        ORDER BY tier, name
      `);

      const sources = ((result as any)[0] || []).map((row: any) => ({
        sourceId: row.sourceId,
        name: row.name,
        nameAr: row.altName,
        tier: row.tier,
        status: row.status,
        partnershipContact: row.partnershipContact,
        description: row.description,
      }));

      return { success: true, sources };
    } catch (error) {
      console.error('[SourceRegistry] Failed to get sources needing access:', error);
      return { success: false, sources: [], error: String(error) };
    }
  }),

  /**
   * Update source status (admin only)
   */
  updateStatus: adminProcedure
    .input(z.object({
      sourceId: z.string(),
      status: z.enum(['ACTIVE', 'NEEDS_KEY', 'PENDING_REVIEW', 'INACTIVE', 'DEPRECATED']),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        return { success: false, error: 'Database unavailable' };
      }

      try {
        await db.execute(sql`
          UPDATE source_registry 
          SET status = ${input.status}, updatedAt = NOW(), updatedBy = ${ctx.user?.id || 'system'}
          WHERE sourceId = ${input.sourceId}
        `);

        return { success: true, message: `Source ${input.sourceId} status updated to ${input.status}` };
      } catch (error) {
        console.error('[SourceRegistry] Failed to update status:', error);
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Get lint report for registry
   */
  getLintReport: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return { success: false, report: null, error: 'Database unavailable' };
    }

    try {
      // P0 errors: missing required fields
      const [missingNameResult] = await db.execute(sql`
        SELECT COUNT(*) as count FROM source_registry WHERE name IS NULL OR name = ''
      `);
      const missingName = (missingNameResult as any)[0]?.count || 0;

      const [missingTierResult] = await db.execute(sql`
        SELECT COUNT(*) as count FROM source_registry WHERE tier = 'UNKNOWN' OR tier IS NULL
      `);
      const missingTier = (missingTierResult as any)[0]?.count || 0;

      // P1 warnings: missing optional but recommended fields
      const [missingUrlResult] = await db.execute(sql`
        SELECT COUNT(*) as count FROM source_registry WHERE webUrl IS NULL OR webUrl = ''
      `);
      const missingUrl = (missingUrlResult as any)[0]?.count || 0;

      const [missingDescResult] = await db.execute(sql`
        SELECT COUNT(*) as count FROM source_registry WHERE description IS NULL OR description = ''
      `);
      const missingDesc = (missingDescResult as any)[0]?.count || 0;

      const p0Errors = missingName;
      const p1Warnings = missingTier + missingUrl + missingDesc;

      return {
        success: true,
        report: {
          p0Errors,
          p1Warnings,
          details: {
            missingName,
            missingTier,
            missingUrl,
            missingDesc,
          },
          status: p0Errors === 0 ? 'PASS' : 'FAIL',
          message: p0Errors === 0 
            ? `Registry passes lint (${p1Warnings} warnings)`
            : `Registry has ${p0Errors} critical errors`,
        },
      };
    } catch (error) {
      console.error('[SourceRegistry] Failed to get lint report:', error);
      return { success: false, report: null, error: String(error) };
    }
  }),
});

export type SourceRegistryRouter = typeof sourceRegistryRouter;
