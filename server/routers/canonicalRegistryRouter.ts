/**
 * Canonical Registry Router - THE registry brain
 */

import { router, publicProcedure, adminProcedure } from '../_core/trpc';
import { z } from 'zod';
import * as canonicalImporter from '../services/canonicalRegistryImporter';
import { getDb } from '../db';
import { sql } from 'drizzle-orm';

export const canonicalRegistryRouter = router({
  /**
   * Import from canonical Excel file
   */
  importFromCanonicalExcel: adminProcedure
    .mutation(async ({ ctx }) => {
      try {
        const result = await canonicalImporter.importCanonicalRegistry();
        
        console.log(`[CanonicalRegistry] User ${ctx.user?.email} triggered import: ${result.sourcesImported} new, ${result.sourcesUpdated} updated`);
        
        return {
          success: true,
          result,
          message: `Import complete: ${result.sourcesImported} new sources, ${result.sourcesUpdated} updated. ${result.lintErrors.length} lint errors.`
        };
      } catch (error) {
        console.error('[CanonicalRegistry] Import failed:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }),

  /**
   * Get recent diffs from last import
   */
  getRecentDiffs: adminProcedure
    .input(z.object({
      limit: z.number().default(100),
      importRunId: z.string().optional()
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, diffs: [] };

      try {
        const whereClause = input.importRunId 
          ? sql`WHERE importRunId = ${input.importRunId}`
          : sql`WHERE 1=1`;

        const result = await db.execute(sql`
          SELECT * FROM registry_diff_log
          ${whereClause}
          ORDER BY createdAt DESC
          LIMIT ${input.limit}
        `);

        const diffs = (result as any)[0] || [];
        return { success: true, diffs };
      } catch (error) {
        console.error('[CanonicalRegistry] Failed to get diffs:', error);
        return { success: false, diffs: [], error: String(error) };
      }
    }),

  /**
   * Get diff summary by change type
   */
  getDiffSummary: adminProcedure
    .input(z.object({
      importRunId: z.string().optional()
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, summary: null };

      try {
        const whereClause = input.importRunId 
          ? sql`WHERE importRunId = ${input.importRunId}`
          : sql`WHERE importRunId = (SELECT importRunId FROM registry_diff_log ORDER BY createdAt DESC LIMIT 1)`;

        const result = await db.execute(sql`
          SELECT 
            changeType,
            COUNT(*) as count,
            COUNT(DISTINCT sourceId) as uniqueSources
          FROM registry_diff_log
          ${whereClause}
          GROUP BY changeType
        `);

        const summary = (result as any)[0] || [];
        return { success: true, summary };
      } catch (error) {
        console.error('[CanonicalRegistry] Failed to get diff summary:', error);
        return { success: false, summary: null, error: String(error) };
      }
    }),

  /**
   * Get lint errors from last import
   */
  getLintErrors: adminProcedure
    .query(async ({ ctx }) => {
      // For now, re-run lint (in production, store in DB)
      const result = await canonicalImporter.importCanonicalRegistry('/workspace/data/registry/YETO_Sources_Universe_Master_PRODUCTION_READY_v2_3.xlsx');
      
      return {
        success: true,
        lintErrors: result.lintErrors,
        totalErrors: result.lintErrors.length
      };
    }),

  /**
   * Get source with all related data (endpoints, products, sectors)
   */
  getSourceWithRelations: publicProcedure
    .input(z.object({ sourceId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, source: null };

      try {
        // Get source
        const sourceResult = await db.execute(sql`
          SELECT * FROM source_registry WHERE sourceId = ${input.sourceId}
        `);
        const source = (sourceResult as any)[0]?.[0];
        if (!source) return { success: false, source: null, error: 'Source not found' };

        // Get endpoints
        const endpointsResult = await db.execute(sql`
          SELECT * FROM source_endpoints WHERE sourceRegistryId = ${source.id}
        `);
        const endpoints = (endpointsResult as any)[0] || [];

        // Get products
        const productsResult = await db.execute(sql`
          SELECT * FROM source_products WHERE sourceRegistryId = ${source.id}
        `);
        const products = (productsResult as any)[0] || [];

        // Get sector mappings
        const sectorsResult = await db.execute(sql`
          SELECT rsm.sectorCode, rsm.weight, sc.sectorName
          FROM registry_sector_map rsm
          LEFT JOIN sector_codebook sc ON rsm.sectorCode = sc.sectorCode
          WHERE rsm.sourceRegistryId = ${source.id}
          ORDER BY 
            CASE rsm.weight 
              WHEN 'primary' THEN 1 
              WHEN 'secondary' THEN 2 
              WHEN 'tertiary' THEN 3 
              ELSE 4 
            END
        `);
        const sectors = (sectorsResult as any)[0] || [];

        return {
          success: true,
          source: {
            ...source,
            endpoints,
            products,
            sectors
          }
        };
      } catch (error) {
        console.error('[CanonicalRegistry] Failed to get source with relations:', error);
        return { success: false, source: null, error: String(error) };
      }
    }),

  /**
   * Get registry statistics
   */
  getRegistryStats: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return { success: false, stats: null };

      try {
        // Total sources
        const [totalResult] = await db.execute(sql`SELECT COUNT(*) as count FROM source_registry`);
        const totalSources = (totalResult as any)[0]?.count || 0;

        // By status
        const statusResult = await db.execute(sql`
          SELECT status, COUNT(*) as count FROM source_registry GROUP BY status
        `);
        const byStatus: Record<string, number> = {};
        for (const row of (statusResult as any)[0] || []) {
          byStatus[row.status] = row.count;
        }

        // Endpoints count
        const [endpointsResult] = await db.execute(sql`SELECT COUNT(*) as count FROM source_endpoints`);
        const totalEndpoints = (endpointsResult as any)[0]?.count || 0;

        // Products count
        const [productsResult] = await db.execute(sql`SELECT COUNT(*) as count FROM source_products`);
        const totalProducts = (productsResult as any)[0]?.count || 0;

        // Sources with endpoints
        const [withEndpointsResult] = await db.execute(sql`
          SELECT COUNT(DISTINCT sourceRegistryId) as count FROM source_endpoints
        `);
        const sourcesWithEndpoints = (withEndpointsResult as any)[0]?.count || 0;

        // Sources with products
        const [withProductsResult] = await db.execute(sql`
          SELECT COUNT(DISTINCT sourceRegistryId) as count FROM source_products
        `);
        const sourcesWithProducts = (withProductsResult as any)[0]?.count || 0;

        return {
          success: true,
          stats: {
            totalSources,
            byStatus,
            totalEndpoints,
            totalProducts,
            sourcesWithEndpoints,
            sourcesWithProducts,
            endpointCoverage: totalSources > 0 ? (sourcesWithEndpoints / totalSources * 100).toFixed(1) : '0.0',
            productCoverage: totalSources > 0 ? (sourcesWithProducts / totalSources * 100).toFixed(1) : '0.0'
          }
        };
      } catch (error) {
        console.error('[CanonicalRegistry] Failed to get stats:', error);
        return { success: false, stats: null, error: String(error) };
      }
    })
});

export type CanonicalRegistryRouter = typeof canonicalRegistryRouter;
