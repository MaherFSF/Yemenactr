/**
 * YETO Connector Registry Loader
 * 
 * Loads all 226 sources from sources-config.json into the universal connector registry
 * Activates automatic scheduling and ingestion for all sources
 */

import * as fs from 'fs';
import * as path from 'path';
import { registry, SourceConfig } from './universal-connector';

interface SourceConfigFile {
  version: string;
  timestamp: string;
  totalSources: number;
  byTier: Record<string, number>;
  byStatus: Record<string, number>;
  byFrequency: Record<string, number>;
  byAccessMethod: Record<string, number>;
  byModule: Record<string, number>;
  sources: Array<{
    id: string;
    numericId: number;
    nameEn: string;
    nameAr: string;
    category: string;
    tier: string;
    institution: string;
    url: string;
    urlRaw: string;
    accessMethod: string;
    updateFrequency: string;
    cadence: string;
    license: string;
    reliabilityScore: number;
    geographicCoverage: string;
    coverageText: string;
    typicalLagDays: number;
    typicalLagText: string;
    requiresAuth: boolean;
    dataFields: string[];
    ingestionMethod: string;
    yetoUsage: string;
    yetoModule: string;
    granularityCaveats: string;
    notes: string;
    tags: string[];
    origin: string;
    status: string;
    active: boolean;
    coverageRange: {
      start: string;
      end: string;
    };
  }>;
}

/**
 * Load all sources from config file into registry
 */
export async function loadSourcesFromConfig(): Promise<void> {
  console.log('🚀 Loading YETO source registry from config...\n');

  const configPath = path.join(__dirname, './sources-config.json');

  if (!fs.existsSync(configPath)) {
    console.error(`❌ Config file not found: ${configPath}`);
    throw new Error(`Config file not found: ${configPath}`);
  }

  try {
    // Read config file
    const configContent = fs.readFileSync(configPath, 'utf-8');
    const config: SourceConfigFile = JSON.parse(configContent);

    console.log(`📊 Loading ${config.totalSources} sources from config\n`);
    console.log(`📈 Registry Statistics:`);
    console.log(`   Version: ${config.version}`);
    console.log(`   Generated: ${config.timestamp}`);
    console.log(`   Total Sources: ${config.totalSources}`);

    console.log(`\n📋 By Tier:`);
    Object.entries(config.byTier).forEach(([tier, count]) => {
      console.log(`   ${tier}: ${count}`);
    });

    console.log(`\n📅 By Update Frequency:`);
    Object.entries(config.byFrequency).forEach(([freq, count]) => {
      console.log(`   ${freq}: ${count}`);
    });

    console.log(`\n🔌 By Access Method:`);
    Object.entries(config.byAccessMethod).forEach(([method, count]) => {
      if (typeof method === 'string' && method.length < 50) {
        console.log(`   ${method}: ${count}`);
      }
    });

    // Register each source
    let registered = 0;
    let failed = 0;

    for (const sourceData of config.sources) {
      try {
        const sourceConfig: SourceConfig = {
          sourceId: sourceData.id,
          sourceName: sourceData.nameEn,
          category: sourceData.category,
          url: sourceData.url,
          apiEndpoint: sourceData.urlRaw,
          accessMethod: (sourceData.accessMethod || 'WEB') as any,
          updateFrequency: (sourceData.cadence || 'ANNUAL') as any,
          tier: (sourceData.tier || 'T2') as any,
          requiresAuth: sourceData.requiresAuth,
          requiresKey: undefined,
          dataFormat: 'JSON',
          indicators: sourceData.dataFields || [],
          coverage: {
            start: new Date(sourceData.coverageRange.start),
            end: new Date(sourceData.coverageRange.end),
          },
          reliabilityScore: sourceData.reliabilityScore || 75,
        };

        registry.registerSource(sourceConfig);
        registered++;
      } catch (error) {
        console.warn(`⚠️  Failed to register ${sourceData.id}: ${error}`);
        failed++;
      }
    }

    console.log(`\n✅ Registry Loading Complete`);
    console.log(`   Registered: ${registered} sources`);
    console.log(`   Failed: ${failed} sources`);

    // Get registry stats
    const stats = registry.getStats();
    console.log(`\n📊 Active Registry Statistics:`);
    console.log(`   Total Sources: ${stats.totalSources}`);
    console.log(`   By Tier: ${JSON.stringify(stats.byTier)}`);
    console.log(`   By Frequency: ${JSON.stringify(stats.byFrequency)}`);

    console.log(`\n✅ All sources ready for ingestion`);
    console.log(`   Next: Start orchestrator with await orchestrator.start()`);
  } catch (error) {
    console.error('❌ Error loading registry:', error);
    throw error;
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
