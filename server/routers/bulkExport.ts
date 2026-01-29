/**
 * Bulk Export Router
 * API endpoints for bulk data exports
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { executeBulkExport, getExportHistory } from "../services/bulkExportService";

export const bulkExportRouter = router({
  // Execute a bulk export
  export: protectedProcedure
    .input(z.object({
      exportType: z.enum(["datasets", "indicators", "timeseries", "events", "publications", "full"]),
      format: z.enum(["csv", "json", "xlsx"]),
      filters: z.object({
        datasetIds: z.array(z.number()).optional(),
        indicatorIds: z.array(z.number()).optional(),
        sourceIds: z.array(z.number()).optional(),
        sectors: z.array(z.string()).optional(),
        regimes: z.array(z.string()).optional(),
        dateRange: z.object({
          start: z.string(),
          end: z.string(),
        }).optional(),
      }).optional(),
      includeMetadata: z.boolean().optional(),
      includeEvidencePack: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const result = await executeBulkExport({
        ...input,
        userId: ctx.user?.openId || "anonymous",
        userEmail: ctx.user?.name || undefined,
      });
      return result;
    }),

  // Get export history
  history: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).optional(),
    }))
    .query(async ({ input, ctx }) => {
      const history = await getExportHistory(
        ctx.user?.openId || "anonymous",
        input.limit || 20
      );
      return history;
    }),

  // Get available export types
  types: protectedProcedure.query(async () => {
    return {
      exportTypes: [
        { id: "datasets", name: "Datasets", description: "All registered datasets with metadata" },
        { id: "indicators", name: "Indicators", description: "Economic indicators catalog" },
        { id: "timeseries", name: "Time Series", description: "Historical data points" },
        { id: "events", name: "Economic Events", description: "Timeline of economic events" },
        { id: "publications", name: "Publications", description: "Research publications library" },
        { id: "full", name: "Full Export", description: "Complete data package" },
      ],
      formats: [
        { id: "csv", name: "CSV", description: "Comma-separated values" },
        { id: "json", name: "JSON", description: "JavaScript Object Notation" },
        { id: "xlsx", name: "Excel", description: "Microsoft Excel format" },
      ],
    };
  }),
});

export type BulkExportRouter = typeof bulkExportRouter;
