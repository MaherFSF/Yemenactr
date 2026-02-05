/**
 * Registry Policy Enforcer
 * 
 * Enforces allowedUse policies from source_registry.allowedUse JSON array
 * Determines which ingestion pipes are eligible for each source
 */

import { getDb } from '../db';
import { sql } from 'drizzle-orm';

export type AllowedUseType =
  | 'DATA_NUMERIC'
  | 'DATA_GEOSPATIAL'
  | 'REGISTRY'
  | 'DOC_PDF'
  | 'DOC_NARRATIVE'
  | 'DOC_EXCEL'
  | 'NEWS_MEDIA'
  | 'SANCTIONS_LIST'
  | 'EVENT_DATA'
  | 'PRICE_DATA'
  | 'FORECAST';

export type IngestionPipeType =
  | 'NUMERIC_TIMESERIES'
  | 'GEOSPATIAL_DATA'
  | 'DOCUMENT_VAULT'
  | 'NEWS_AGGREGATOR'
  | 'SANCTIONS_COMPLIANCE'
  | 'EVENT_TRACKER'
  | 'PRICE_MONITOR';

// Policy mapping: allowedUse → eligible ingestion pipes
const POLICY_MAP: Record<AllowedUseType, IngestionPipeType[]> = {
  DATA_NUMERIC: ['NUMERIC_TIMESERIES'],
  DATA_GEOSPATIAL: ['GEOSPATIAL_DATA'],
  REGISTRY: ['NUMERIC_TIMESERIES', 'GEOSPATIAL_DATA'], // Registries can feed multiple pipes
  DOC_PDF: ['DOCUMENT_VAULT'],
  DOC_NARRATIVE: ['DOCUMENT_VAULT'],
  DOC_EXCEL: ['DOCUMENT_VAULT'],
  NEWS_MEDIA: ['NEWS_AGGREGATOR', 'DOCUMENT_VAULT'], // News goes to aggregator + RAG
  SANCTIONS_LIST: ['SANCTIONS_COMPLIANCE'], // Descriptive only, no advice
  EVENT_DATA: ['EVENT_TRACKER'],
  PRICE_DATA: ['PRICE_MONITOR'],
  FORECAST: ['NUMERIC_TIMESERIES'], // Forecasts can feed timeseries
};

export interface PolicyDecision {
  sourceId: string;
  allowedUse: AllowedUseType[];
  eligiblePipes: IngestionPipeType[];
  blockedPipes: IngestionPipeType[];
  canIngestNumeric: boolean;
  canIngestDocuments: boolean;
  canIngestNews: boolean;
  canIngestSanctions: boolean;
  reason?: string;
}

/**
 * Get policy decision for a source
 */
export async function getPolicyDecision(sourceId: string): Promise<PolicyDecision | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.execute(sql`
      SELECT sourceId, allowedUse, status FROM source_registry WHERE sourceId = ${sourceId}
    `);
    const source = (result as any)[0]?.[0];
    if (!source) return null;

    // Parse allowedUse JSON
    let allowedUse: AllowedUseType[] = [];
    try {
      const parsed = typeof source.allowedUse === 'string' 
        ? JSON.parse(source.allowedUse) 
        : source.allowedUse;
      allowedUse = Array.isArray(parsed) ? parsed : [];
    } catch {
      allowedUse = [];
    }

    // Determine eligible pipes
    const eligiblePipes = new Set<IngestionPipeType>();
    for (const use of allowedUse) {
      const pipes = POLICY_MAP[use as AllowedUseType] || [];
      pipes.forEach(pipe => eligiblePipes.add(pipe));
    }

    // All possible pipes
    const allPipes: IngestionPipeType[] = [
      'NUMERIC_TIMESERIES',
      'GEOSPATIAL_DATA',
      'DOCUMENT_VAULT',
      'NEWS_AGGREGATOR',
      'SANCTIONS_COMPLIANCE',
      'EVENT_TRACKER',
      'PRICE_MONITOR'
    ];
    const blockedPipes = allPipes.filter(pipe => !eligiblePipes.has(pipe));

    return {
      sourceId: source.sourceId,
      allowedUse,
      eligiblePipes: Array.from(eligiblePipes),
      blockedPipes,
      canIngestNumeric: eligiblePipes.has('NUMERIC_TIMESERIES'),
      canIngestDocuments: eligiblePipes.has('DOCUMENT_VAULT'),
      canIngestNews: eligiblePipes.has('NEWS_AGGREGATOR'),
      canIngestSanctions: eligiblePipes.has('SANCTIONS_COMPLIANCE'),
      reason: source.status !== 'ACTIVE' ? `Source status: ${source.status}` : undefined
    };
  } catch (error) {
    console.error('[PolicyEnforcer] Failed to get policy decision:', error);
    return null;
  }
}

/**
 * Check if source can feed a specific pipe
 */
export async function canSourceFeedPipe(
  sourceId: string,
  pipe: IngestionPipeType
): Promise<boolean> {
  const decision = await getPolicyDecision(sourceId);
  if (!decision) return false;
  return decision.eligiblePipes.includes(pipe);
}

/**
 * Get all sources eligible for a pipe
 */
export async function getSourcesForPipe(
  pipe: IngestionPipeType
): Promise<Array<{ sourceId: string; name: string; tier: string }>> {
  const db = await getDb();
  if (!db) return [];

  try {
    // Find required allowedUse types for this pipe
    const requiredUses: AllowedUseType[] = [];
    for (const [use, pipes] of Object.entries(POLICY_MAP)) {
      if (pipes.includes(pipe)) {
        requiredUses.push(use as AllowedUseType);
      }
    }

    if (requiredUses.length === 0) return [];

    // Query sources with ANY of the required uses
    const result = await db.execute(sql`
      SELECT sourceId, name, tier, allowedUse 
      FROM source_registry 
      WHERE status = 'ACTIVE'
    `);

    const sources = (result as any)[0] || [];
    const eligible: Array<{ sourceId: string; name: string; tier: string }> = [];

    for (const source of sources) {
      try {
        const allowedUse = typeof source.allowedUse === 'string' 
          ? JSON.parse(source.allowedUse) 
          : source.allowedUse;
        
        if (Array.isArray(allowedUse)) {
          const hasRequiredUse = allowedUse.some((use: string) => 
            requiredUses.includes(use as AllowedUseType)
          );
          
          if (hasRequiredUse) {
            eligible.push({
              sourceId: source.sourceId,
              name: source.name,
              tier: source.tier
            });
          }
        }
      } catch {
        // Skip sources with invalid allowedUse JSON
      }
    }

    return eligible;
  } catch (error) {
    console.error('[PolicyEnforcer] Failed to get sources for pipe:', error);
    return [];
  }
}

/**
 * PIPE_REGISTRY_LINT: Validate all sources against policy rules
 */
export async function runPipeRegistryLint(): Promise<{
  passed: boolean;
  errors: Array<{
    sourceId: string;
    rule: string;
    severity: 'ERROR' | 'WARNING';
    message: string;
  }>;
}> {
  const db = await getDb();
  if (!db) {
    return { passed: false, errors: [{ sourceId: 'SYSTEM', rule: 'DB_UNAVAILABLE', severity: 'ERROR', message: 'Database unavailable' }] };
  }

  const errors: Array<{ sourceId: string; rule: string; severity: 'ERROR' | 'WARNING'; message: string }> = [];

  try {
    // Rule 1: Missing name (ERROR)
    const missingName = await db.execute(sql`
      SELECT sourceId FROM source_registry WHERE name IS NULL OR name = ''
    `);
    for (const row of (missingName as any)[0] || []) {
      errors.push({
        sourceId: row.sourceId,
        rule: 'MISSING_NAME',
        severity: 'ERROR',
        message: 'Source has no name'
      });
    }

    // Rule 2: Invalid enum values (ERROR)
    const invalidEnums = await db.execute(sql`
      SELECT sourceId, status, tier, accessType, updateFrequency
      FROM source_registry
      WHERE status NOT IN ('ACTIVE', 'PENDING_REVIEW', 'NEEDS_KEY', 'INACTIVE', 'DEPRECATED')
         OR tier NOT IN ('T0', 'T1', 'T2', 'T3', 'T4', 'UNKNOWN')
         OR accessType NOT IN ('API', 'SDMX', 'RSS', 'WEB', 'PDF', 'CSV', 'XLSX', 'MANUAL', 'PARTNER', 'REMOTE_SENSING')
         OR updateFrequency NOT IN ('REALTIME', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL', 'IRREGULAR')
    `);
    for (const row of (invalidEnums as any)[0] || []) {
      errors.push({
        sourceId: row.sourceId,
        rule: 'INVALID_ENUM',
        severity: 'ERROR',
        message: 'Invalid status/tier/accessType/updateFrequency value'
      });
    }

    // Rule 3: ACTIVE sources without endpoint and not manual/partner (ERROR)
    const activeNoEndpoint = await db.execute(sql`
      SELECT sr.sourceId, sr.accessType
      FROM source_registry sr
      LEFT JOIN source_endpoints se ON sr.id = se.sourceRegistryId
      WHERE sr.status = 'ACTIVE'
        AND sr.accessType NOT IN ('MANUAL', 'PARTNER')
        AND se.id IS NULL
    `);
    for (const row of (activeNoEndpoint as any)[0] || []) {
      errors.push({
        sourceId: row.sourceId,
        rule: 'ACTIVE_NO_ENDPOINT',
        severity: 'ERROR',
        message: `ACTIVE source with accessType=${row.accessType} must have at least one endpoint`
      });
    }

    // Rule 4: needsPartnership=true but missing contact (WARNING)
    const partnershipNoContact = await db.execute(sql`
      SELECT sourceId FROM source_registry
      WHERE needsPartnership = true
        AND (partnershipContact IS NULL OR partnershipContact = '')
    `);
    for (const row of (partnershipNoContact as any)[0] || []) {
      errors.push({
        sourceId: row.sourceId,
        rule: 'PARTNERSHIP_NO_CONTACT',
        severity: 'WARNING',
        message: 'needsPartnership=true but no partnershipContact provided'
      });
    }

    // Rule 5: Missing or empty allowedUse (WARNING)
    const missingAllowedUse = await db.execute(sql`
      SELECT sourceId FROM source_registry
      WHERE allowedUse IS NULL 
         OR allowedUse = ''
         OR allowedUse = '[]'
    `);
    for (const row of (missingAllowedUse as any)[0] || []) {
      errors.push({
        sourceId: row.sourceId,
        rule: 'MISSING_ALLOWED_USE',
        severity: 'WARNING',
        message: 'allowedUse is empty - source will not feed any ingestion pipes'
      });
    }

    // Check if any ERRORs exist
    const hasErrors = errors.some(e => e.severity === 'ERROR');

    return {
      passed: !hasErrors,
      errors
    };
  } catch (error) {
    console.error('[PolicyEnforcer] Lint validation failed:', error);
    return {
      passed: false,
      errors: [{
        sourceId: 'SYSTEM',
        rule: 'LINT_FAILURE',
        severity: 'ERROR',
        message: error instanceof Error ? error.message : String(error)
      }]
    };
  }
}

/**
 * Get policy summary across all sources
 */
export async function getPolicySummary(): Promise<{
  totalSources: number;
  byPipe: Record<IngestionPipeType, number>;
  byAllowedUse: Record<AllowedUseType, number>;
  sourcesWithoutPolicy: number;
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalSources: 0,
      byPipe: {} as any,
      byAllowedUse: {} as any,
      sourcesWithoutPolicy: 0
    };
  }

  try {
    const result = await db.execute(sql`SELECT sourceId, allowedUse FROM source_registry WHERE status = 'ACTIVE'`);
    const sources = (result as any)[0] || [];

    const byPipe: Record<string, number> = {};
    const byAllowedUse: Record<string, number> = {};
    let sourcesWithoutPolicy = 0;

    for (const source of sources) {
      try {
        const allowedUse = typeof source.allowedUse === 'string'
          ? JSON.parse(source.allowedUse)
          : source.allowedUse;

        if (!Array.isArray(allowedUse) || allowedUse.length === 0) {
          sourcesWithoutPolicy++;
          continue;
        }

        // Count allowedUse types
        for (const use of allowedUse) {
          byAllowedUse[use] = (byAllowedUse[use] || 0) + 1;

          // Count pipes
          const pipes = POLICY_MAP[use as AllowedUseType] || [];
          for (const pipe of pipes) {
            byPipe[pipe] = (byPipe[pipe] || 0) + 1;
          }
        }
      } catch {
        sourcesWithoutPolicy++;
      }
    }

    return {
      totalSources: sources.length,
      byPipe: byPipe as any,
      byAllowedUse: byAllowedUse as any,
      sourcesWithoutPolicy
    };
  } catch (error) {
    console.error('[PolicyEnforcer] Failed to get policy summary:', error);
    return {
      totalSources: 0,
      byPipe: {} as any,
      byAllowedUse: {} as any,
      sourcesWithoutPolicy: 0
    };
  }
}
