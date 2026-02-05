/**
 * Source Import Router - TRPC API for source registry imports
 */

import { router, publicProcedure, adminProcedure } from '../_core/trpc';
import { z } from 'zod';
import * as sourceImport from '../services/comprehensiveSourceImport';

export const sourceImportRouter = router({
  /**
   * Import sources from default Excel file
   */
  importFromDefaultExcel: adminProcedure
    .mutation(async ({ ctx }) => {
      try {
        const result = await sourceImport.importFromDefaultExcel();
        
        // Log audit
        console.log(`[SourceImport] User ${ctx.user?.email} triggered import: ${result.imported} imported, ${result.updated} updated`);
        
        return {
          success: true,
          result,
          message: `Successfully imported ${result.imported} sources, updated ${result.updated}, skipped ${result.skipped}. Created ${result.sectorMappingsCreated} sector mappings.`
        };
      } catch (error) {
        console.error('[SourceImport] Import failed:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }),

  /**
   * Import from specific Excel file path
   */
  importFromFile: adminProcedure
    .input(z.object({
      filePath: z.string(),
      sheetName: z.string().optional(),
      createSectorMappings: z.boolean().default(true),
      updateExisting: z.boolean().default(true)
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await sourceImport.importSourcesFromExcel(input.filePath, {
          sheetName: input.sheetName,
          createSectorMappings: input.createSectorMappings,
          updateExisting: input.updateExisting
        });
        
        return {
          success: true,
          result,
          message: `Successfully imported ${result.imported} sources, updated ${result.updated}`
        };
      } catch (error) {
        console.error('[SourceImport] Import from file failed:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }),

  /**
   * Initialize sector codebook
   */
  initializeSectorCodebook: adminProcedure
    .mutation(async ({ ctx }) => {
      try {
        const count = await sourceImport.initializeSectorCodebook();
        
        return {
          success: true,
          count,
          message: `Initialized ${count} sectors in codebook`
        };
      } catch (error) {
        console.error('[SourceImport] Sector codebook initialization failed:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }),

  /**
   * Get import statistics
   */
  getImportStatistics: publicProcedure
    .query(async () => {
      try {
        const stats = await sourceImport.getImportStatistics();
        return {
          success: true,
          stats
        };
      } catch (error) {
        console.error('[SourceImport] Failed to get statistics:', error);
        return {
          success: false,
          stats: {
            totalSources: 0,
            byTier: {},
            byStatus: {},
            byAccessType: {},
            sectorsWithMappings: 0,
            sourcesWithMappings: 0
          },
          error: String(error)
        };
      }
    })
});

export type SourceImportRouter = typeof sourceImportRouter;
