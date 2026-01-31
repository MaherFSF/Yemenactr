/**
 * Feed Matrix Router
 * 
 * Provides sector-feed-matrix and page-feed-matrix data for admin dashboards.
 * Shows which sources feed each sector/page with ingestion stats and coverage.
 */

import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { getDb } from '../db';
import { sql } from 'drizzle-orm';
import { getSourcesForPage, getSourceCoverage, TARGET_PAGES } from '../services/routingEngine';

// Sector definitions
const SECTORS = [
  { code: 'S01', name: 'Macroeconomy', nameAr: 'الاقتصاد الكلي' },
  { code: 'S02', name: 'Trade', nameAr: 'التجارة' },
  { code: 'S03', name: 'Monetary', nameAr: 'النقدية' },
  { code: 'S04', name: 'Fiscal', nameAr: 'المالية العامة' },
  { code: 'S05', name: 'Banking', nameAr: 'البنوك' },
  { code: 'S06', name: 'Energy', nameAr: 'الطاقة' },
  { code: 'S07', name: 'Agriculture', nameAr: 'الزراعة' },
  { code: 'S08', name: 'Humanitarian', nameAr: 'الإنسانية' },
  { code: 'S09', name: 'Labor', nameAr: 'العمالة' },
  { code: 'S10', name: 'Infrastructure', nameAr: 'البنية التحتية' },
  { code: 'S11', name: 'Governance', nameAr: 'الحوكمة' },
  { code: 'S12', name: 'Security', nameAr: 'الأمن' },
  { code: 'S13', name: 'Health', nameAr: 'الصحة' },
  { code: 'S14', name: 'Education', nameAr: 'التعليم' },
  { code: 'S15', name: 'Environment', nameAr: 'البيئة' },
  { code: 'S16', name: 'Social', nameAr: 'الاجتماعية' },
];

// Page/module definitions
const PAGES = [
  { key: 'dashboard', name: 'Dashboard', nameAr: 'لوحة القيادة' },
  { key: 'data-repository', name: 'Data Repository', nameAr: 'مستودع البيانات' },
  { key: 'research-library', name: 'Research Library', nameAr: 'مكتبة الأبحاث' },
  { key: 'timeline', name: 'Timeline', nameAr: 'الجدول الزمني' },
  { key: 'entities', name: 'Entities', nameAr: 'الكيانات' },
  { key: 'corporate-registry', name: 'Corporate Registry', nameAr: 'السجل التجاري' },
  { key: 'methodology', name: 'Methodology', nameAr: 'المنهجية' },
  { key: 'vip-cockpits', name: 'VIP Cockpits', nameAr: 'قمرات القيادة' },
];

export const feedMatrixRouter = router({
  /**
   * Get sector feed matrix - top 50 sources per sector
   */
  getSectorFeedMatrix: publicProcedure
    .input(z.object({
      sectorCode: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return { success: false, error: 'Database unavailable', sectors: [] };
      }

      try {
        const limit = input?.limit || 50;
        const sectorFilter = input?.sectorCode;

        const sectorsToQuery = sectorFilter 
          ? SECTORS.filter(s => s.code === sectorFilter)
          : SECTORS;

        const result: any[] = [];

        for (const sector of sectorsToQuery) {
          // Get sources for this sector using sectorsFed JSON array or sectorCategory
          const sourcesResult = await db.execute(sql`
            SELECT 
              sr.sourceId, sr.name, sr.altName, sr.tier, sr.status,
              sr.confidenceRating, sr.updateFrequency, sr.lastFetch,
              sr.allowedUse, sr.webUrl, sr.historicalStart, sr.historicalEnd,
              sr.isPrimary, sr.sectorsFed, sr.sectorCategory
            FROM source_registry sr
            WHERE sr.sectorCategory LIKE ${`%${sector.name}%`}
               OR JSON_CONTAINS(sr.sectorsFed, ${JSON.stringify(sector.name)})
               OR JSON_CONTAINS(sr.sectorsFed, ${JSON.stringify(sector.code)})
            ORDER BY sr.isPrimary DESC, 
              CASE sr.tier WHEN 'T0' THEN 1 WHEN 'T1' THEN 2 WHEN 'T2' THEN 3 WHEN 'T3' THEN 4 ELSE 5 END,
              sr.name
            LIMIT ${limit}
          `);

          const sources = (sourcesResult as any)[0] || [];

          // Calculate coverage stats
          const tierCounts: Record<string, number> = {};
          const allowedUseCounts: Record<string, number> = {};
          let primaryCount = 0;
          let activeCount = 0;

          for (const source of sources) {
            tierCounts[source.tier] = (tierCounts[source.tier] || 0) + 1;
            allowedUseCounts[source.allowedUse || 'Unknown'] = (allowedUseCounts[source.allowedUse || 'Unknown'] || 0) + 1;
            if (source.isPrimary) primaryCount++;
            if (source.status === 'ACTIVE') activeCount++;
          }

          result.push({
            sector: {
              code: sector.code,
              name: sector.name,
              nameAr: sector.nameAr,
            },
            sourceCount: sources.length,
            primaryCount,
            activeCount,
            tierDistribution: tierCounts,
            allowedUseDistribution: allowedUseCounts,
            sources: sources.map((s: any) => ({
              sourceId: s.sourceId,
              name: s.name,
              altName: s.altName,
              tier: s.tier,
              status: s.status,
              confidenceRating: s.confidenceRating,
              updateFrequency: s.updateFrequency,
              lastFetch: s.lastFetch,
              allowedUse: s.allowedUse,
              webUrl: s.webUrl,
              isPrimary: s.isPrimary,
              coverageStart: s.historicalStart,
              coverageEnd: s.historicalEnd,
            })),
          });
        }

        return { success: true, sectors: result };
      } catch (error) {
        console.error('[FeedMatrix] Error getting sector feed matrix:', error);
        return { success: false, error: 'Failed to get sector feed matrix', sectors: [] };
      }
    }),

  /**
   * Get page feed matrix - sources per page/module
   */
  getPageFeedMatrix: publicProcedure
    .input(z.object({
      pageKey: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return { success: false, error: 'Database unavailable', pages: [] };
      }

      try {
        const limit = input?.limit || 50;
        const pageFilter = input?.pageKey;

        const pagesToQuery = pageFilter 
          ? PAGES.filter(p => p.key === pageFilter)
          : PAGES;

        const result: any[] = [];

        for (const page of pagesToQuery) {
          const sources = await getSourcesForPage(page.key as any, limit);

          // Calculate stats
          const tierCounts: Record<string, number> = {};
          const allowedUseCounts: Record<string, number> = {};
          let activeCount = 0;

          for (const source of sources) {
            tierCounts[source.tier] = (tierCounts[source.tier] || 0) + 1;
            allowedUseCounts[source.allowedUse || 'Unknown'] = (allowedUseCounts[source.allowedUse || 'Unknown'] || 0) + 1;
            if (source.status === 'ACTIVE') activeCount++;
          }

          result.push({
            page: {
              key: page.key,
              name: page.name,
              nameAr: page.nameAr,
            },
            sourceCount: sources.length,
            activeCount,
            tierDistribution: tierCounts,
            allowedUseDistribution: allowedUseCounts,
            sources: sources.map((s: any) => ({
              sourceId: s.sourceId,
              name: s.name,
              altName: s.altName,
              tier: s.tier,
              status: s.status,
              confidenceRating: s.confidenceRating,
              updateFrequency: s.updateFrequency,
              lastFetch: s.lastFetch,
              allowedUse: s.allowedUse,
              webUrl: s.webUrl,
            })),
          });
        }

        return { success: true, pages: result };
      } catch (error) {
        console.error('[FeedMatrix] Error getting page feed matrix:', error);
        return { success: false, error: 'Failed to get page feed matrix', pages: [] };
      }
    }),

  /**
   * Get sources for a specific page (used by SourcesUsedPanel)
   */
  getSourcesForPage: publicProcedure
    .input(z.object({
      pageKey: z.string(),
      sectorCode: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return { success: false, error: 'Database unavailable', sources: [] };
      }

      try {
        // If sectorCode provided, get sources for that sector
        if (input.sectorCode) {
          const result = await db.execute(sql`
            SELECT 
              sr.sourceId, sr.name, sr.altName, sr.tier, sr.status,
              sr.confidenceRating, sr.lastFetch, sr.allowedUse, sr.webUrl,
              sr.isPrimary
            FROM source_registry sr
            WHERE sr.sectorCategory LIKE ${`%${input.sectorCode}%`}
               OR JSON_CONTAINS(sr.sectorsFed, ${JSON.stringify(input.sectorCode)})
            ORDER BY sr.isPrimary DESC, sr.tier, sr.name
            LIMIT ${input.limit}
          `);

          return {
            success: true,
            sources: ((result as any)[0] || []).map((s: any) => ({
              sourceId: s.sourceId,
              name: s.name,
              altName: s.altName,
              tier: s.tier,
              status: s.status,
              confidenceRating: s.confidenceRating,
              lastFetch: s.lastFetch,
              allowedUse: s.allowedUse,
              webUrl: s.webUrl,
              isPrimary: s.isPrimary,
              isRestricted: s.allowedUse && s.allowedUse !== 'Open' && s.allowedUse !== 'Public',
            })),
          };
        }

        // Otherwise use routing engine
        const sources = await getSourcesForPage(input.pageKey as any, input.limit);
        
        return {
          success: true,
          sources: sources.map((s: any) => ({
            sourceId: s.sourceId,
            name: s.name,
            altName: s.altName,
            tier: s.tier,
            status: s.status,
            confidenceRating: s.confidenceRating,
            lastFetch: s.lastFetch,
            allowedUse: s.allowedUse,
            webUrl: s.webUrl,
            isPrimary: s.isPrimary || false,
            isRestricted: s.allowedUse && s.allowedUse !== 'Open' && s.allowedUse !== 'Public',
          })),
        };
      } catch (error) {
        console.error('[FeedMatrix] Error getting sources for page:', error);
        return { success: false, error: 'Failed to get sources', sources: [] };
      }
    }),

  /**
   * Export sector feed matrix as CSV
   */
  exportSectorMatrix: protectedProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) {
        return { success: false, error: 'Database unavailable', csv: '' };
      }

      try {
        const result = await db.execute(sql`
          SELECT 
            sr.sectorCategory as sectorCode,
            sr.sourceId, sr.name, sr.tier, sr.status,
            sr.confidenceRating, sr.updateFrequency, sr.allowedUse,
            sr.isPrimary
          FROM source_registry sr
          WHERE sr.sectorCategory IS NOT NULL AND sr.sectorCategory != ''
          ORDER BY sr.sectorCategory, sr.isPrimary DESC, sr.tier
        `);

        const rows = (result as any)[0] || [];
        
        // Build CSV
        const headers = ['Sector', 'Source ID', 'Name', 'Tier', 'Status', 'Confidence', 'Update Frequency', 'Allowed Use', 'Is Primary'];
        const csvRows = [headers.join(',')];
        
        for (const row of rows) {
          csvRows.push([
            row.sectorCode,
            row.sourceId,
            `"${(row.name || '').replace(/"/g, '""')}"`,
            row.tier,
            row.status,
            row.confidenceRating,
            row.updateFrequency,
            row.allowedUse,
            row.isPrimary ? 'Yes' : 'No',
          ].join(','));
        }

        return { success: true, csv: csvRows.join('\n') };
      } catch (error) {
        console.error('[FeedMatrix] Error exporting sector matrix:', error);
        return { success: false, error: 'Failed to export', csv: '' };
      }
    }),

  /**
   * Get matrix summary statistics
   */
  getMatrixStats: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) {
        return { success: false, error: 'Database unavailable', stats: null };
      }

      try {
        // Total sources
        const totalResult = await db.execute(sql`
          SELECT COUNT(*) as total FROM source_registry
        `);
        const total = (totalResult as any)[0]?.[0]?.total || 0;

        // Sources with sector mappings (use sectorsFed JSON column)
        const mappedResult = await db.execute(sql`
          SELECT COUNT(*) as mapped FROM source_registry 
          WHERE sectorsFed IS NOT NULL AND JSON_LENGTH(sectorsFed) > 0
        `);
        const mapped = (mappedResult as any)[0]?.[0]?.mapped || 0;

        // Sector coverage (use sectorCategory)
        const sectorCoverageResult = await db.execute(sql`
          SELECT sectorCategory as sectorCode, COUNT(*) as count
          FROM source_registry
          WHERE sectorCategory IS NOT NULL AND sectorCategory != ''
          GROUP BY sectorCategory
          ORDER BY sectorCategory
        `);
        const sectorCoverage = (sectorCoverageResult as any)[0] || [];

        // Tier distribution
        const tierResult = await db.execute(sql`
          SELECT tier, COUNT(*) as count
          FROM source_registry
          GROUP BY tier
        `);
        const tierDistribution = (tierResult as any)[0] || [];

        return {
          success: true,
          stats: {
            totalSources: total,
            mappedSources: mapped,
            unmappedSources: total - mapped,
            sectorCoverage: sectorCoverage.reduce((acc: any, row: any) => {
              acc[row.sectorCode] = row.count;
              return acc;
            }, {}),
            tierDistribution: tierDistribution.reduce((acc: any, row: any) => {
              acc[row.tier] = row.count;
              return acc;
            }, {}),
          },
        };
      } catch (error) {
        console.error('[FeedMatrix] Error getting matrix stats:', error);
        return { success: false, error: 'Failed to get stats', stats: null };
      }
    }),
});

export default feedMatrixRouter;
