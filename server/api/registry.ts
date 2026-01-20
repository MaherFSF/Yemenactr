/**
 * YETO Registry API
 * 
 * Standalone API endpoints for accessing the source registry
 * Loaded from sources-config.json
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Request, Response } from 'express';

interface SourceConfigFile {
  version: string;
  timestamp: string;
  totalSources: number;
  byTier: Record<string, number>;
  byStatus: Record<string, number>;
  byFrequency: Record<string, number>;
  byAccessMethod: Record<string, number>;
  byModule: Record<string, number>;
  sources: any[];
}

let cachedRegistry: SourceConfigFile | null = null;

/**
 * Load registry from config file
 */
function loadRegistry(): SourceConfigFile {
  if (cachedRegistry !== null) return cachedRegistry as SourceConfigFile;

  const configPath = path.join(process.cwd(), 'server/connectors/sources-config.json');

  if (!fs.existsSync(configPath)) {
    console.warn(`⚠️  Config file not found: ${configPath}`);
    return {
      version: '1.0',
      timestamp: new Date().toISOString(),
      totalSources: 0,
      byTier: {},
      byStatus: {},
      byFrequency: {},
      byAccessMethod: {},
      byModule: {},
      sources: [],
    };
  }

  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(content) as SourceConfigFile;
    cachedRegistry = parsed;
    console.log(`✅ Registry loaded: ${parsed.totalSources} sources`);
    return parsed;
  } catch (error) {
    console.error('❌ Error loading registry:', error);
    return {
      version: '1.0',
      timestamp: new Date().toISOString(),
      totalSources: 0,
      byTier: {},
      byStatus: {},
      byFrequency: {},
      byAccessMethod: {},
      byModule: {},
      sources: [],
    };
  }
}

/**
 * GET /api/registry/stats
 * Get registry statistics
 */
export async function getRegistryStats(req: Request, res: Response): Promise<void> {
  try {
    const registry = loadRegistry();

    res.json({
      status: 'OK',
      totalSources: registry.totalSources,
      version: registry.version,
      timestamp: registry.timestamp,
      byTier: registry.byTier,
      byStatus: registry.byStatus,
      byFrequency: registry.byFrequency,
      byAccessMethod: registry.byAccessMethod,
      byModule: registry.byModule,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get registry stats' });
  }
}

/**
 * GET /api/registry/sources
 * List all sources with optional filtering
 */
export async function listSources(req: Request, res: Response): Promise<void> {
  try {
    const registry = loadRegistry();
    const { tier, status, frequency, limit = 50, offset = 0 } = req.query;

    let sources = registry.sources || [];

    // Apply filters
    if (tier && typeof tier === 'string') {
      sources = sources.filter((s: any) => s.tier === tier);
    }
    if (status && typeof status === 'string') {
      sources = sources.filter((s: any) => s.status === status);
    }
    if (frequency && typeof frequency === 'string') {
      sources = sources.filter((s: any) => s.cadence === frequency);
    }

    const total = sources.length;
    const limitNum = Math.min(parseInt(limit as string) || 50, 100);
    const offsetNum = parseInt(offset as string) || 0;
    const paginated = sources.slice(offsetNum, offsetNum + limitNum);

    res.json({
      status: 'OK',
      total,
      limit: limitNum,
      offset: offsetNum,
      sources: paginated.map((s: any) => ({
        id: s.id,
        name: s.nameEn,
        nameAr: s.nameAr,
        tier: s.tier,
        status: s.status,
        cadence: s.cadence,
        accessMethod: s.accessMethod,
        reliabilityScore: s.reliabilityScore,
        active: s.active,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list sources' });
  }
}

/**
 * GET /api/registry/sources/:sourceId
 * Get source details
 */
export async function getSource(req: Request, res: Response): Promise<void> {
  try {
    const { sourceId } = req.params;
    const registry = loadRegistry();

    const source = registry.sources?.find((s: any) => s.id === sourceId);

    if (!source) {
      res.status(404).json({ error: 'Source not found' });
      return;
    }

    res.json({
      status: 'OK',
      source: {
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
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get source' });
  }
}

/**
 * GET /api/registry/sources/by-tier/:tier
 * Get sources by tier
 */
export async function getSourcesByTier(req: Request, res: Response): Promise<void> {
  try {
    const { tier } = req.params;
    const registry = loadRegistry();

    const sources = (registry.sources || []).filter((s: any) => s.tier === tier);

    res.json({
      status: 'OK',
      tier,
      count: sources.length,
      sources: sources.map((s: any) => ({
        id: s.id,
        name: s.nameEn,
        status: s.status,
        cadence: s.cadence,
        reliabilityScore: s.reliabilityScore,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get sources by tier' });
  }
}

/**
 * GET /api/registry/export
 * Export full registry
 */
export async function exportRegistry(req: Request, res: Response): Promise<void> {
  try {
    const registry = loadRegistry();

    res.json({
      status: 'OK',
      version: registry.version,
      timestamp: registry.timestamp,
      totalSources: registry.totalSources,
      sources: registry.sources || [],
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to export registry' });
  }
}

/**
 * POST /api/registry/reload
 * Reload registry from disk (admin only)
 */
export async function reloadRegistry(req: Request, res: Response): Promise<void> {
  try {
    // Clear cache
    cachedRegistry = null;

    // Reload
    const registry = loadRegistry();

    res.json({
      status: 'OK',
      message: 'Registry reloaded',
      totalSources: registry.totalSources,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reload registry' });
  }
}

export default {
  getRegistryStats,
  listSources,
  getSource,
  getSourcesByTier,
  exportRegistry,
  reloadRegistry,
};
