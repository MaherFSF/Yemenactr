/**
 * YETO Platform - Provenance Ledger Service
 * Section 8A: Data Governance - The Trust Engine
 * 
 * Tracks complete provenance for each dataset/document/transformation:
 * - Source, access method, retrieval time, license/terms
 * - Transformations + formulas
 * - QA checks + outcomes
 * - Known limitations + caveats
 * - Update cadence
 */

import { getDb } from '../db';
import { provenanceLedgerFull, sourceRegistry } from '../../drizzle/schema';
import { eq, desc } from 'drizzle-orm';

// Types for provenance tracking
export interface ProvenanceEntry {
  id?: number;
  sourceId: number;
  datasetId?: number;
  documentId?: number;
  seriesId?: number;
  
  // Access tracking
  accessMethod: 'api' | 'scrape' | 'manual' | 'partner_upload' | 'file_import';
  retrievalTime: Date;
  retrievalDuration?: number; // milliseconds
  rawDataHash: string;
  rawDataLocation?: string; // S3 path
  
  // License and terms
  licenseType: string;
  licenseUrl?: string;
  termsAccepted: boolean;
  attributionRequired: boolean;
  attributionText?: string;
  commercialUseAllowed: boolean;
  derivativesAllowed: boolean;
  
  // Transformations
  transformations: TransformationStep[];
  
  // QA checks
  qaChecks: QACheckResult[];
  qaScore: number; // 0-100
  qaPassedAt?: Date;
  
  // Limitations and caveats
  limitations: string[];
  caveats: string[];
  knownIssues: string[];
  
  // Update cadence
  expectedUpdateFrequency: 'realtime' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'irregular';
  lastUpdated: Date;
  nextExpectedUpdate?: Date;
  updateDelayDays?: number;
  
  // Metadata
  createdAt: Date;
  createdBy: string;
  version: number;
}

export interface TransformationStep {
  order: number;
  type: 'normalize' | 'aggregate' | 'interpolate' | 'derive' | 'clean' | 'merge' | 'filter' | 'convert';
  description: string;
  formula?: string;
  inputFields: string[];
  outputFields: string[];
  parameters?: Record<string, unknown>;
  timestamp: string;
  executedBy: string;
}

export interface QACheckResult {
  checkType: 'schema' | 'units' | 'outliers' | 'continuity' | 'geo' | 'duplicates' | 'contradictions' | 'completeness';
  checkName: string;
  passed: boolean;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// Provenance Ledger Service
export class ProvenanceLedgerService {
  
  /**
   * Create a new provenance entry for a data ingestion
   */
  async createEntry(entry: Omit<ProvenanceEntry, 'id' | 'createdAt' | 'version'>): Promise<number> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    
    const result = await db.insert(provenanceLedgerFull).values({
      sourceId: entry.sourceId,
      datasetId: entry.datasetId,
      documentId: entry.documentId,
      seriesId: entry.seriesId,
      accessMethod: entry.accessMethod,
      retrievalTime: entry.retrievalTime,
      retrievalDuration: entry.retrievalDuration,
      rawDataHash: entry.rawDataHash,
      rawDataLocation: entry.rawDataLocation,
      licenseType: entry.licenseType,
      licenseUrl: entry.licenseUrl,
      termsAccepted: entry.termsAccepted,
      attributionRequired: entry.attributionRequired,
      attributionText: entry.attributionText,
      commercialUseAllowed: entry.commercialUseAllowed,
      derivativesAllowed: entry.derivativesAllowed,
      transformations: entry.transformations,
      qaChecks: entry.qaChecks,
      qaScore: entry.qaScore,
      qaPassedAt: entry.qaPassedAt,
      limitations: entry.limitations,
      caveats: entry.caveats,
      knownIssues: entry.knownIssues,
      expectedUpdateFrequency: entry.expectedUpdateFrequency,
      lastUpdated: entry.lastUpdated,
      nextExpectedUpdate: entry.nextExpectedUpdate,
      updateDelayDays: entry.updateDelayDays,
      createdBy: entry.createdBy,
      version: 1,
    });
    
    return Number((result as unknown as { insertId: number }).insertId);
  }
  
  /**
   * Get provenance entry by ID
   */
  async getEntry(id: number): Promise<ProvenanceEntry | null> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    const results = await db.select().from(provenanceLedgerFull).where(eq(provenanceLedgerFull.id, id));
    
    if (results.length === 0) return null;
    
    return this.parseEntry(results[0]);
  }
  
  /**
   * Get all provenance entries for a source
   */
  async getEntriesBySource(sourceId: number): Promise<ProvenanceEntry[]> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    const results = await db.select()
      .from(provenanceLedgerFull)
      .where(eq(provenanceLedgerFull.sourceId, sourceId))
      .orderBy(desc(provenanceLedgerFull.retrievalTime));
    
    return results.map((r) => this.parseEntry(r));
  }
  
  /**
   * Get provenance for a specific series
   */
  async getSeriesProvenance(seriesId: number): Promise<ProvenanceEntry[]> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    const results = await db.select()
      .from(provenanceLedgerFull)
      .where(eq(provenanceLedgerFull.seriesId, seriesId))
      .orderBy(desc(provenanceLedgerFull.version));
    
    return results.map((r) => this.parseEntry(r));
  }
  
  /**
   * Add transformation step to existing entry
   */
  async addTransformation(entryId: number, step: TransformationStep): Promise<void> {
    const entry = await this.getEntry(entryId);
    if (!entry) throw new Error(`Provenance entry ${entryId} not found`);
    
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    const updatedTransformations = [...entry.transformations, step];
    
    await db.update(provenanceLedgerFull)
      .set({
        transformations: updatedTransformations,
        version: entry.version + 1,
      })
      .where(eq(provenanceLedgerFull.id, entryId));
  }
  
  /**
   * Add QA check result to existing entry
   */
  async addQACheck(entryId: number, check: QACheckResult): Promise<void> {
    const entry = await this.getEntry(entryId);
    if (!entry) throw new Error(`Provenance entry ${entryId} not found`);
    
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    const updatedChecks = [...entry.qaChecks, check];
    const newScore = this.calculateQAScore(updatedChecks);
    
    await db.update(provenanceLedgerFull)
      .set({
        qaChecks: updatedChecks,
        qaScore: newScore,
        qaPassedAt: newScore >= 80 ? new Date() : undefined,
        version: entry.version + 1,
      })
      .where(eq(provenanceLedgerFull.id, entryId));
  }
  
  /**
   * Calculate QA score from check results
   */
  private calculateQAScore(checks: QACheckResult[]): number {
    if (checks.length === 0) return 0;
    
    const weights: Record<string, number> = {
      critical: 30,
      warning: 15,
      info: 5,
    };
    
    let totalWeight = 0;
    let passedWeight = 0;
    
    for (const check of checks) {
      const weight = weights[check.severity] || 10;
      totalWeight += weight;
      if (check.passed) passedWeight += weight;
    }
    
    return Math.round((passedWeight / totalWeight) * 100);
  }
  
  /**
   * Get provenance summary for display
   */
  async getProvenanceSummary(entryId: number): Promise<{
    source: string;
    lastUpdated: Date;
    qaScore: number;
    confidence: 'A' | 'B' | 'C' | 'D';
    transformationCount: number;
    limitations: string[];
    attribution: string | null;
  }> {
    const entry = await this.getEntry(entryId);
    if (!entry) throw new Error(`Provenance entry ${entryId} not found`);
    
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    const sourceResults = await db.select().from(sourceRegistry).where(eq(sourceRegistry.id, entry.sourceId));
    const sourceName = sourceResults[0]?.name || 'Unknown Source';
    
    return {
      source: sourceName,
      lastUpdated: entry.lastUpdated,
      qaScore: entry.qaScore,
      confidence: this.scoreToConfidence(entry.qaScore),
      transformationCount: entry.transformations.length,
      limitations: entry.limitations,
      attribution: entry.attributionRequired ? entry.attributionText || sourceName : null,
    };
  }
  
  /**
   * Convert QA score to confidence rating
   */
  private scoreToConfidence(score: number): 'A' | 'B' | 'C' | 'D' {
    if (score >= 90) return 'A';
    if (score >= 70) return 'B';
    if (score >= 50) return 'C';
    return 'D';
  }
  
  /**
   * Parse database row to ProvenanceEntry
   */
  private parseEntry(row: typeof provenanceLedgerFull.$inferSelect): ProvenanceEntry {
    return {
      id: row.id,
      sourceId: row.sourceId,
      datasetId: row.datasetId ?? undefined,
      documentId: row.documentId ?? undefined,
      seriesId: row.seriesId ?? undefined,
      accessMethod: row.accessMethod,
      retrievalTime: row.retrievalTime,
      retrievalDuration: row.retrievalDuration ?? undefined,
      rawDataHash: row.rawDataHash,
      rawDataLocation: row.rawDataLocation ?? undefined,
      licenseType: row.licenseType,
      licenseUrl: row.licenseUrl ?? undefined,
      termsAccepted: row.termsAccepted,
      attributionRequired: row.attributionRequired,
      attributionText: row.attributionText ?? undefined,
      commercialUseAllowed: row.commercialUseAllowed,
      derivativesAllowed: row.derivativesAllowed,
      transformations: (row.transformations as TransformationStep[]) || [],
      qaChecks: (row.qaChecks as QACheckResult[]) || [],
      qaScore: row.qaScore,
      qaPassedAt: row.qaPassedAt ?? undefined,
      limitations: (row.limitations as string[]) || [],
      caveats: (row.caveats as string[]) || [],
      knownIssues: (row.knownIssues as string[]) || [],
      expectedUpdateFrequency: row.expectedUpdateFrequency,
      lastUpdated: row.lastUpdated,
      nextExpectedUpdate: row.nextExpectedUpdate ?? undefined,
      updateDelayDays: row.updateDelayDays ?? undefined,
      createdAt: row.createdAt,
      createdBy: row.createdBy,
      version: row.version,
    };
  }
  
  /**
   * Generate provenance report for export
   */
  async generateProvenanceReport(entryId: number): Promise<string> {
    const entry = await this.getEntry(entryId);
    if (!entry) throw new Error(`Provenance entry ${entryId} not found`);
    
    const summary = await this.getProvenanceSummary(entryId);
    
    const report = `
# Data Provenance Report

## Source Information
- **Source**: ${summary.source}
- **Access Method**: ${entry.accessMethod}
- **Retrieval Time**: ${entry.retrievalTime.toISOString()}
- **Data Hash**: ${entry.rawDataHash}

## License & Terms
- **License Type**: ${entry.licenseType}
- **License URL**: ${entry.licenseUrl || 'N/A'}
- **Attribution Required**: ${entry.attributionRequired ? 'Yes' : 'No'}
- **Attribution Text**: ${entry.attributionText || 'N/A'}
- **Commercial Use**: ${entry.commercialUseAllowed ? 'Allowed' : 'Not Allowed'}
- **Derivatives**: ${entry.derivativesAllowed ? 'Allowed' : 'Not Allowed'}

## Quality Assessment
- **QA Score**: ${entry.qaScore}/100
- **Confidence Rating**: ${summary.confidence}
- **QA Passed**: ${entry.qaPassedAt ? entry.qaPassedAt.toISOString() : 'Not Yet'}

### QA Checks Performed
${entry.qaChecks.map(c => `- [${c.passed ? '✓' : '✗'}] ${c.checkName} (${c.severity}): ${c.message}`).join('\n')}

## Transformations Applied
${entry.transformations.map((t, i) => `${i + 1}. **${t.type}**: ${t.description}${t.formula ? `\n   Formula: \`${t.formula}\`` : ''}`).join('\n')}

## Known Limitations
${entry.limitations.map(l => `- ${l}`).join('\n') || 'None documented'}

## Caveats
${entry.caveats.map(c => `- ${c}`).join('\n') || 'None documented'}

## Update Information
- **Expected Frequency**: ${entry.expectedUpdateFrequency}
- **Last Updated**: ${entry.lastUpdated.toISOString()}
- **Next Expected**: ${entry.nextExpectedUpdate?.toISOString() || 'Unknown'}
- **Update Delay**: ${entry.updateDelayDays ? `${entry.updateDelayDays} days` : 'On schedule'}

---
Generated: ${new Date().toISOString()}
Version: ${entry.version}
    `.trim();
    
    return report;
  }
}

// Export singleton instance
export const provenanceLedgerService = new ProvenanceLedgerService();
