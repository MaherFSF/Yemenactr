/**
 * YETO Connector Registry Loader
 *
 * Loads sources from the DATABASE (source_registry table) into the
 * universal connector registry at startup.
 *
 * Previously loaded from sources-config.json (archived).
 * Now uses the single source of truth: source_registry DB table,
 * populated by scripts/import-registry.ts from the canonical xlsx.
 */

import { registry, SourceConfig } from './universal-connector';
import { getDb } from '../db';
import { sourceRegistry } from '../../drizzle/schema';

/**
 * Load all sources from database into the universal connector registry.
 */
export async function loadSourcesFromConfig(): Promise<void> {
  console.log('[RegistryLoader] Loading source registry from database...');

  try {
    const db = await getDb();
    if (!db) {
      console.warn('[RegistryLoader] No database connection, skipping registry load');
      return;
    }

    const rows = await db.select().from(sourceRegistry);
    console.log(`[RegistryLoader] Found ${rows.length} sources in database`);

    let registered = 0;
    let failed = 0;

    for (const row of rows) {
      try {
        const sourceConfig: SourceConfig = {
          sourceId: row.sourceId,
          sourceName: row.name,
          category: row.sectorCategory || 'general',
          url: row.webUrl || '',
          apiEndpoint: row.apiUrl || undefined,
          accessMethod: (row.accessType || 'WEB') as any,
          updateFrequency: (row.updateFrequency || 'IRREGULAR') as any,
          tier: (row.tier || 'UNKNOWN') as any,
          requiresAuth: row.apiKeyRequired || false,
          requiresKey: row.apiKeyRequired ? row.apiKeyContact || undefined : undefined,
          dataFormat: (row.sourceType === 'PDF' || row.sourceType === 'CSV' || row.sourceType === 'XML' ? row.sourceType : 'JSON') as any,
          indicators: [],
          coverage: {
            start: row.historicalStart ? new Date(`${row.historicalStart}-01-01`) : new Date('2010-01-01'),
            end: row.historicalEnd ? new Date(`${row.historicalEnd}-12-31`) : new Date(),
          },
          reliabilityScore: row.reliabilityScore ? parseInt(String(row.reliabilityScore), 10) || 75 : 75,
        };

        registry.registerSource(sourceConfig);
        registered++;
      } catch (error) {
        console.warn(`[RegistryLoader] Failed to register ${row.sourceId}: ${error}`);
        failed++;
      }
    }

    console.log(`[RegistryLoader] Registered: ${registered}, Failed: ${failed}`);

    const stats = registry.getStats();
    console.log(`[RegistryLoader] Active: ${stats.totalSources} sources`);
  } catch (error) {
    console.error('[RegistryLoader] Error loading registry:', error);
  }
}

/**
 * Get registry statistics
 */
export function getRegistryStats(): any {
  return registry.getStats();
}

/**
 * Get all registered connectors
 */
export function getAllConnectors(): any[] {
  return registry.getAllConnectors();
}

/**
 * Get connector by ID
 */
export function getConnector(sourceId: string): any {
  return registry.getConnector(sourceId);
}

export default {
  loadSourcesFromConfig,
  getRegistryStats,
  getAllConnectors,
  getConnector,
};
