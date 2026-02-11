/**
 * YETO Connector Registry Router
 * 
 * tRPC procedures for:
 * - Initialize registry from config
 * - Get registry statistics
 * - List all connectors
 * - Get connector details
 * - Activate/deactivate sources
 */

import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

interface SourceConfigFile {
  version: string;
  timestamp: string;
  totalSources: number;
  sources: any[];
}

let registryData: SourceConfigFile | null = null;

/**
 * Load registry from config file
 */
function loadRegistry(): SourceConfigFile {
  if (registryData !== null) return registryData;

  const configPath = path.join(process.cwd(), 'data/registry/sources-v2.5-extracted.json');

  if (!fs.existsSync(configPath)) {
    console.warn(`⚠️  Config file not found: ${configPath}`);
    return {
      version: '1.0',
      timestamp: new Date().toISOString(),
      totalSources: 0,
      sources: [],
    };
  }

  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(content) as SourceConfigFile;
    registryData = parsed;
    console.log(`✅ Registry loaded: ${parsed.totalSources} sources`);
    return parsed;
  } catch (error) {
    console.error('❌ Error loading registry:', error);
    return {
      version: '1.0',
      timestamp: new Date().toISOString(),
      totalSources: 0,
      sources: [],
    };
  }
}

export const registryRouter = router({
  /**
   * Initialize registry from config file
   */
  initialize: protectedProcedure.mutation(async ({ ctx }) => {
    console.log(`🚀 Initializing registry for ${ctx.user?.id}`);

    const registry = loadRegistry();

    return {
      status: 'INITIALIZED',
      totalSources: registry.totalSources,
      version: registry.version,
      timestamp: registry.timestamp,
      message: `Registry initialized with ${registry.totalSources} sources`,
    };
  }),

  /**
   * Get registry statistics
   */
  getStats: publicProcedure.query(async () => {
    const registry = loadRegistry();

    if (!registry.sources || registry.sources.length === 0) {
      return {
        totalSources: 0,
        activeSources: 0,
        byTier: {},
        byFrequency: {},
        byAccessMethod: {},
        byStatus: {},
      };
    }

    const byTier: Record<string, number> = {};
    const byFrequency: Record<string, number> = {};
    const byAccessMethod: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    for (const source of registry.sources) {
      const tier = source.tier || 'T2';
      const freq = source.cadence || 'ANNUAL';
      const method = source.accessMethod || 'WEB';
      const status = source.status || 'PENDING';

      byTier[tier] = (byTier[tier] || 0) + 1;
      byFrequency[freq] = (byFrequency[freq] || 0) + 1;
      byAccessMethod[method] = (byAccessMethod[method] || 0) + 1;
      byStatus[status] = (byStatus[status] || 0) + 1;
    }

    const activeSources = registry.sources.filter((s: any) => s.active).length;

    return {
      totalSources: registry.totalSources,
      activeSources,
      byTier,
      byFrequency,
      byAccessMethod,
      byStatus,
    };
  }),

  /**
   * List all sources with filtering
   */
  listSources: publicProcedure
    .input(
      z.object({
        tier: z.string().optional(),
        status: z.string().optional(),
        frequency: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const registry = loadRegistry();

      let sources = registry.sources || [];

      // Apply filters
      if (input.tier) {
        sources = sources.filter((s: any) => s.tier === input.tier);
      }
      if (input.status) {
        sources = sources.filter((s: any) => s.status === input.status);
      }
      if (input.frequency) {
        sources = sources.filter((s: any) => s.cadence === input.frequency);
      }

      const total = sources.length;
      const paginated = sources.slice(input.offset, input.offset + input.limit);

      return {
        total,
        limit: input.limit,
        offset: input.offset,
        sources: paginated.map((s: any) => ({
          id: s.id,
          name: s.nameEn,
          nameAr: s.nameAr,
          tier: s.tier,
          status: s.status,
          cadence: s.cadence,
          accessMethod: s.accessMethod,
          url: s.url,
          reliabilityScore: s.reliabilityScore,
          active: s.active,
        })),
      };
    }),

  /**
   * Get source details
   */
  getSource: publicProcedure
    .input(z.object({ sourceId: z.string() }))
    .query(async ({ input }) => {
      const registry = loadRegistry();

      const source = registry.sources?.find((s: any) => s.id === input.sourceId);

      if (!source) {
        return { error: 'Source not found' };
      }

      return {
        id: source.id,
        nameEn: source.nameEn,
        nameAr: source.nameAr,
        category: source.category,
        tier: source.tier,
        institution: source.institution,
        url: source.url,
        urlRaw: source.urlRaw,
        accessMethod: source.accessMethod,
        updateFrequency: source.updateFrequency,
        cadence: source.cadence,
        license: source.license,
        reliabilityScore: source.reliabilityScore,
        geographicCoverage: source.geographicCoverage,
        typicalLagDays: source.typicalLagDays,
        requiresAuth: source.requiresAuth,
        dataFields: source.dataFields,
        ingestionMethod: source.ingestionMethod,
        yetoUsage: source.yetoUsage,
        yetoModule: source.yetoModule,
        notes: source.notes,
        tags: source.tags,
        status: source.status,
        active: source.active,
      };
    }),

  /**
   * Get sources by tier
   */
  getSourcesByTier: publicProcedure
    .input(z.object({ tier: z.string() }))
    .query(async ({ input }) => {
      const registry = loadRegistry();

      const sources = (registry.sources || []).filter((s: any) => s.tier === input.tier);

      return {
        tier: input.tier,
        count: sources.length,
        sources: sources.map((s: any) => ({
          id: s.id,
          name: s.nameEn,
          status: s.status,
          cadence: s.cadence,
          reliabilityScore: s.reliabilityScore,
        })),
      };
    }),

  /**
   * Get sources by frequency
   */
  getSourcesByFrequency: publicProcedure
    .input(z.object({ frequency: z.string() }))
    .query(async ({ input }) => {
      const registry = loadRegistry();

      const sources = (registry.sources || []).filter((s: any) => s.cadence === input.frequency);

      return {
        frequency: input.frequency,
        count: sources.length,
        sources: sources.map((s: any) => ({
          id: s.id,
          name: s.nameEn,
          tier: s.tier,
          reliabilityScore: s.reliabilityScore,
        })),
      };
    }),

  /**
   * Get registry summary
   */
  getSummary: publicProcedure.query(async () => {
    const registry = loadRegistry();

    if (!registry.sources || registry.sources.length === 0) {
      return {
        status: 'EMPTY',
        message: 'Registry not initialized',
      };
    }

    const tier1 = registry.sources.filter((s: any) => s.tier === 'T1').length;
    const tier2 = registry.sources.filter((s: any) => s.tier === 'T2').length;
    const tier3 = registry.sources.filter((s: any) => s.tier === 'T3').length;
    const active = registry.sources.filter((s: any) => s.active).length;

    return {
      status: 'INITIALIZED',
      totalSources: registry.totalSources,
      activeSources: active,
      tier1,
      tier2,
      tier3,
      version: registry.version,
      lastUpdated: registry.timestamp,
      readyForIngestion: active > 0,
    };
  }),

  /**
   * Get registry export
   */
  export: publicProcedure.query(async () => {
    const registry = loadRegistry();

    return {
      version: registry.version,
      timestamp: registry.timestamp,
      totalSources: registry.totalSources,
      sources: registry.sources || [],
    };
  }),
});

export type RegistryRouter = typeof registryRouter;
