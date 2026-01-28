/**
 * YETO Storage Router
 * 
 * tRPC endpoints for S3 storage operations including:
 * - File uploads (documents, exports, assets)
 * - Download URL generation
 * - Storage statistics
 */

import { z } from 'zod';
import { router, protectedProcedure, adminProcedure } from '../_core/trpc';
import { TRPCError } from '@trpc/server';
import {
  uploadDocument,
  uploadExport,
  uploadAsset,
  getDownloadUrl,
  getStorageStats,
  S3_PREFIXES,
} from '../services/s3StorageService';

export const storageRouter = router({
  /**
   * Upload a document (PDF, report)
   */
  uploadDocument: protectedProcedure
    .input(z.object({
      filename: z.string().min(1).max(255),
      data: z.string(), // Base64 encoded
      category: z.string().optional(),
      contentType: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const buffer = Buffer.from(input.data, 'base64');
        
        const result = await uploadDocument(input.filename, buffer, {
          userId: String(ctx.user.id),
          category: input.category,
          contentType: input.contentType,
        });
        
        return {
          success: true,
          key: result.key,
          url: result.url,
        };
      } catch (error) {
        console.error('[Storage] Document upload failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to upload document',
        });
      }
    }),

  /**
   * Upload an export file (CSV, XLSX, PDF, JSON)
   */
  uploadExport: protectedProcedure
    .input(z.object({
      filename: z.string().min(1).max(255),
      data: z.string(), // Base64 encoded
      exportType: z.enum(['csv', 'xlsx', 'pdf', 'json']),
      expiresInHours: z.number().min(1).max(168).optional(), // Max 7 days
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const buffer = Buffer.from(input.data, 'base64');
        
        const result = await uploadExport(String(ctx.user.id), input.filename, buffer, {
          exportType: input.exportType,
          expiresIn: input.expiresInHours,
        });
        
        return {
          success: true,
          key: result.key,
          url: result.url,
          expiresAt: result.expiresAt?.toISOString(),
        };
      } catch (error) {
        console.error('[Storage] Export upload failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to upload export',
        });
      }
    }),

  /**
   * Upload an asset (image, media)
   */
  uploadAsset: protectedProcedure
    .input(z.object({
      filename: z.string().min(1).max(255),
      data: z.string(), // Base64 encoded
      category: z.string().optional(),
      contentType: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const buffer = Buffer.from(input.data, 'base64');
        
        const result = await uploadAsset(input.filename, buffer, {
          category: input.category,
          contentType: input.contentType,
        });
        
        return {
          success: true,
          key: result.key,
          url: result.url,
        };
      } catch (error) {
        console.error('[Storage] Asset upload failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to upload asset',
        });
      }
    }),

  /**
   * Get a signed download URL for a file
   */
  getDownloadUrl: protectedProcedure
    .input(z.object({
      key: z.string().min(1),
    }))
    .query(async ({ input }) => {
      try {
        const url = await getDownloadUrl(input.key);
        return { url };
      } catch (error) {
        console.error('[Storage] Failed to get download URL:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get download URL',
        });
      }
    }),

  /**
   * Get storage statistics (admin only)
   */
  getStats: adminProcedure
    .query(async () => {
      try {
        const stats = await getStorageStats();
        return {
          prefixes: S3_PREFIXES,
          stats,
          totalFiles: stats.reduce((sum, s) => sum + s.fileCount, 0),
          totalSizeBytes: stats.reduce((sum, s) => sum + s.totalSizeBytes, 0),
        };
      } catch (error) {
        console.error('[Storage] Failed to get stats:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get storage statistics',
        });
      }
    }),

  /**
   * Get S3 prefix configuration
   */
  getPrefixes: protectedProcedure
    .query(() => {
      return {
        prefixes: S3_PREFIXES,
        descriptions: {
          [S3_PREFIXES.DOCUMENTS]: 'PDFs, reports, publications',
          [S3_PREFIXES.RAW_DATA]: 'Ingestion payloads, API responses',
          [S3_PREFIXES.PROCESSED_DATA]: 'Normalized, cleaned data',
          [S3_PREFIXES.EXPORTS]: 'User-generated exports',
          [S3_PREFIXES.LOGS]: 'Application logs, audit trails',
          [S3_PREFIXES.BACKUPS]: 'Database backups',
          [S3_PREFIXES.ASSETS]: 'Images, media files',
          [S3_PREFIXES.TEMP]: 'Temporary files',
        },
      };
    }),
});
