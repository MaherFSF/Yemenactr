/**
 * YETO Data Pipeline - Source Registry
 *
 * Manages all data sources with metadata, status, and scheduling.
 * SOURCES COME FROM THE DATABASE (source_registry table), not hardcoded arrays.
 *
 * The source_registry table is populated by: scripts/import-registry.ts
 * from the canonical xlsx: data/registry/YETO_Sources_Universe_Master_*.xlsx
 */

import { getDb } from "../db";
import { sourceRegistry as sourceRegistryTable } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export interface DataSourceConfig {
  id: string;
  name: string;
  nameAr: string;
  type: 'api' | 'partner' | 'scraper' | 'manual' | 'file';
  category: 'official' | 'international' | 'research' | 'other';
  endpoint?: string;
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  regime?: 'aden' | 'sanaa' | 'both' | 'international';
  confidenceDefault: 'A' | 'B' | 'C' | 'D';
  enabled: boolean;
  rateLimitPerMinute: number;
  retryAttempts: number;
  timeout: number;
  lastRun?: Date;
  lastSuccess?: Date;
  recordCount: number;
  errorCount: number;
  metadata: Record<string, unknown>;
}

/**
 * Map a sourceRegistry DB row to a DataSourceConfig for pipeline use
 */
function mapDbRowToConfig(row: any): DataSourceConfig {
  const accessType = (row.accessType || 'WEB').toUpperCase();
  const type: DataSourceConfig['type'] =
    accessType === 'API' || accessType === 'SDMX' || accessType === 'RSS' ? 'api' :
    accessType === 'PARTNER' ? 'partner' :
    accessType === 'MANUAL' ? 'manual' :
    accessType === 'PDF' || accessType === 'CSV' || accessType === 'XLSX' ? 'file' :
    'api';

  const freqMap: Record<string, DataSourceConfig['frequency']> = {
    'REALTIME': 'realtime',
    'DAILY': 'daily',
    'WEEKLY': 'weekly',
    'MONTHLY': 'monthly',
    'QUARTERLY': 'monthly',
    'ANNUAL': 'monthly',
    'IRREGULAR': 'weekly',
  };

  const tierToConfidence: Record<string, 'A' | 'B' | 'C' | 'D'> = {
    'T0': 'A',
    'T1': 'A',
    'T2': 'B',
    'T3': 'C',
    'T4': 'D',
    'UNKNOWN': 'C',
  };

  return {
    id: row.sourceId,
    name: row.name,
    nameAr: row.altName || '',
    type,
    category: row.tier === 'T0' ? 'official' :
              row.tier === 'T1' ? 'international' :
              row.tier === 'T2' ? 'research' : 'other',
    endpoint: row.apiUrl || row.webUrl || undefined,
    frequency: freqMap[row.updateFrequency] || 'monthly',
    regime: row.regimeApplicability === 'ADEN_IRG' ? 'aden' :
            row.regimeApplicability === 'SANAA_DFA' ? 'sanaa' :
            row.regimeApplicability === 'BOTH' || row.regimeApplicability === 'MIXED' ? 'both' :
            'international',
    confidenceDefault: tierToConfidence[row.tier] || 'C',
    enabled: row.status === 'ACTIVE',
    rateLimitPerMinute: 60,
    retryAttempts: 3,
    timeout: 30000,
    recordCount: 0,
    errorCount: 0,
    metadata: {
      tier: row.tier,
      sectorsFed: row.sectorsFed || [],
      sectorCategory: row.sectorCategory,
      license: row.license,
    },
  };
}

export class SourceRegistry {
  private sources: Map<string, DataSourceConfig> = new Map();
  private loaded = false;

  /**
   * Load sources from the database (source_registry table).
   * Call this once at startup or when sources need refresh.
   */
  async loadFromDb(): Promise<void> {
    try {
      const db = await getDb();
      if (!db) {
        console.warn('[SourceRegistry] No database connection, running with empty registry');
        return;
      }

      const rows = await db.select().from(sourceRegistryTable);
      this.sources.clear();

      for (const row of rows) {
        const config = mapDbRowToConfig(row);
        this.sources.set(config.id, config);
      }

      this.loaded = true;
      console.log(`[SourceRegistry] Loaded ${this.sources.size} sources from database`);
    } catch (error) {
      console.error('[SourceRegistry] Failed to load from database:', error);
    }
  }

  /**
   * Get all registered data sources. Loads from DB on first access.
   */
  getAllSources(): DataSourceConfig[] {
    return Array.from(this.sources.values());
  }

  /**
   * Get sources by category
   */
  getSourcesByCategory(category: DataSourceConfig['category']): DataSourceConfig[] {
    return this.getAllSources().filter(s => s.category === category);
  }

  /**
   * Get sources by type
   */
  getSourcesByType(type: DataSourceConfig['type']): DataSourceConfig[] {
    return this.getAllSources().filter(s => s.type === type);
  }

  /**
   * Get enabled sources only
   */
  getEnabledSources(): DataSourceConfig[] {
    return this.getAllSources().filter(s => s.enabled);
  }

  /**
   * Get source by ID
   */
  getSource(id: string): DataSourceConfig | undefined {
    return this.sources.get(id);
  }

  /**
   * Update source status after run
   */
  updateSourceStatus(id: string, success: boolean, recordCount?: number): void {
    const source = this.sources.get(id);
    if (source) {
      source.lastRun = new Date();
      if (success) {
        source.lastSuccess = new Date();
        if (recordCount !== undefined) {
          source.recordCount += recordCount;
        }
      } else {
        source.errorCount++;
      }
    }
  }

  /**
   * Get sources due for refresh
   */
  getSourcesDueForRefresh(): DataSourceConfig[] {
    const now = new Date();
    return this.getEnabledSources().filter(source => {
      if (!source.lastRun) return true;

      const lastRun = new Date(source.lastRun);
      const diffMs = now.getTime() - lastRun.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      switch (source.frequency) {
        case 'realtime': return diffHours >= 0.1;
        case 'hourly': return diffHours >= 1;
        case 'daily': return diffHours >= 24;
        case 'weekly': return diffHours >= 168;
        case 'monthly': return diffHours >= 720;
        default: return false;
      }
    });
  }

  /**
   * Get source statistics
   */
  getStatistics(): {
    total: number;
    enabled: number;
    byCategory: Record<string, number>;
    byType: Record<string, number>;
    totalRecords: number;
    totalErrors: number;
  } {
    const sources = this.getAllSources();
    const byCategory: Record<string, number> = {};
    const byType: Record<string, number> = {};
    let totalRecords = 0;
    let totalErrors = 0;

    sources.forEach(source => {
      byCategory[source.category] = (byCategory[source.category] || 0) + 1;
      byType[source.type] = (byType[source.type] || 0) + 1;
      totalRecords += source.recordCount;
      totalErrors += source.errorCount;
    });

    return {
      total: sources.length,
      enabled: sources.filter(s => s.enabled).length,
      byCategory,
      byType,
      totalRecords,
      totalErrors,
    };
  }
}

// Singleton instance
export const sourceRegistry = new SourceRegistry();
