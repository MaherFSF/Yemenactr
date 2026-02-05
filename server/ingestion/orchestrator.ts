/**
 * YETO Ingestion Orchestrator
 * 
 * Central orchestrator for data & document ingestion
 * Features:
 * - Registry-driven: All connectors generated from source_registry
 * - Resumable: Tracks state and can resume failed runs
 * - Idempotent: No duplicate writes
 * - Evidence-first: Stores raw objects before derived data
 * - Governance: Enforces licensing, staleness checks, validation
 */

import { db } from '../db';
import { 
  ingestionConnectors, 
  ingestionRuns, 
  sourceRegistry,
  rawObjects,
  gapTickets
} from '../../drizzle/schema';
import { eq, and, lt, isNull, sql } from 'drizzle-orm';
import crypto from 'crypto';

export interface IngestionJob {
  connectorId: string;
  sourceRegistryId: number;
  connectorType: string;
  config: any;
  priority: 'critical' | 'high' | 'normal' | 'low';
  scheduledFor?: Date;
}

export interface IngestionResult {
  success: boolean;
  runId: number;
  recordsFetched: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsSkipped: number;
  rawObjectsStored: number;
  errors: string[];
  warnings: string[];
}

/**
 * Ingestion Orchestrator
 * Coordinates all data ingestion activities
 */
export class IngestionOrchestrator {
  private runningJobs: Map<string, Promise<IngestionResult>> = new Map();
  
  /**
   * Get list of connectors that are due for ingestion
   */
  async getDueConnectors(): Promise<any[]> {
    const now = new Date();
    
    // Get connectors that:
    // 1. Are active
    // 2. License allows automation
    // 3. Haven't run recently (based on cadence)
    // 4. Don't have too many consecutive failures
    
    const dueConnectors = await db
      .select({
        connector: ingestionConnectors,
        source: sourceRegistry
      })
      .from(ingestionConnectors)
      .innerJoin(sourceRegistry, eq(ingestionConnectors.sourceRegistryId, sourceRegistry.id))
      .where(
        and(
          eq(ingestionConnectors.status, 'active'),
          eq(ingestionConnectors.licenseAllowsAutomation, true),
          lt(ingestionConnectors.consecutiveFailures, 5)
        )
      );
    
    // Filter based on cadence
    const filtered = dueConnectors.filter(({ connector }) => {
      if (!connector.lastRunAt) return true; // Never run
      
      const hoursSinceLastRun = (now.getTime() - connector.lastRunAt.getTime()) / (1000 * 60 * 60);
      const cadenceHours = this.getCadenceHours(connector.cadence);
      
      return hoursSinceLastRun >= cadenceHours;
    });
    
    return filtered;
  }
  
  /**
   * Convert cadence enum to hours
   */
  private getCadenceHours(cadence: string): number {
    const mapping: Record<string, number> = {
      'realtime': 0,
      'hourly': 1,
      'daily': 24,
      'weekly': 168,
      'monthly': 720,
      'quarterly': 2160,
      'annual': 8760,
      'irregular': 720, // default to monthly
      'manual': Infinity
    };
    return mapping[cadence] || 720;
  }
  
  /**
   * Run ingestion for a specific connector
   */
  async runConnector(connectorId: string, options: {
    force?: boolean;
    dryRun?: boolean;
  } = {}): Promise<IngestionResult> {
    // Check if already running
    if (this.runningJobs.has(connectorId)) {
      throw new Error(`Connector ${connectorId} is already running`);
    }
    
    // Get connector config
    const connectorResult = await db
      .select({
        connector: ingestionConnectors,
        source: sourceRegistry
      })
      .from(ingestionConnectors)
      .innerJoin(sourceRegistry, eq(ingestionConnectors.sourceRegistryId, sourceRegistry.id))
      .where(eq(ingestionConnectors.connectorId, connectorId))
      .limit(1);
    
    if (connectorResult.length === 0) {
      throw new Error(`Connector ${connectorId} not found`);
    }
    
    const { connector, source } = connectorResult[0];
    
    // Validate connector can run
    if (!options.force) {
      if (connector.status !== 'active') {
        throw new Error(`Connector ${connectorId} is not active (status: ${connector.status})`);
      }
      
      if (!connector.licenseAllowsAutomation) {
        throw new Error(`Connector ${connectorId} license does not allow automation`);
      }
      
      if (connector.requiresPartnership) {
        throw new Error(`Connector ${connectorId} requires partnership setup`);
      }
    }
    
    // Create ingestion run record
    const runResult = await db.insert(ingestionRuns).values({
      sourceId: source.id,
      connectorName: connectorId,
      startedAt: new Date(),
      status: 'running',
      recordsFetched: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsSkipped: 0,
      claimsCreated: 0,
      coverageCellsUpdated: 0
    });
    
    const runId = runResult[0].insertId;
    
    // Start the job
    const jobPromise = this.executeConnector(
      runId,
      connector,
      source,
      options
    );
    
    this.runningJobs.set(connectorId, jobPromise);
    
    try {
      const result = await jobPromise;
      
      // Update connector last run
      await db.update(ingestionConnectors)
        .set({
          lastRunId: runId,
          lastRunAt: new Date(),
          lastSuccessAt: result.success ? new Date() : connector.lastSuccessAt,
          consecutiveFailures: result.success ? 0 : connector.consecutiveFailures + 1
        })
        .where(eq(ingestionConnectors.id, connector.id));
      
      return result;
    } finally {
      this.runningJobs.delete(connectorId);
    }
  }
  
  /**
   * Execute the actual connector logic
   */
  private async executeConnector(
    runId: number,
    connector: any,
    source: any,
    options: any
  ): Promise<IngestionResult> {
    const result: IngestionResult = {
      success: false,
      runId,
      recordsFetched: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsSkipped: 0,
      rawObjectsStored: 0,
      errors: [],
      warnings: []
    };
    
    try {
      console.log(`🔄 Starting ingestion for ${connector.connectorId} (${source.name})`);
      
      // Route to appropriate connector handler based on type
      switch (connector.connectorType) {
        case 'api_rest':
          await this.handleApiRestConnector(runId, connector, source, result, options);
          break;
        case 'web_scrape':
          await this.handleWebScrapeConnector(runId, connector, source, result, options);
          break;
        case 'csv_download':
          await this.handleCsvDownloadConnector(runId, connector, source, result, options);
          break;
        case 'pdf_download':
          await this.handlePdfDownloadConnector(runId, connector, source, result, options);
          break;
        default:
          result.errors.push(`Unsupported connector type: ${connector.connectorType}`);
          throw new Error(`Unsupported connector type: ${connector.connectorType}`);
      }
      
      result.success = result.errors.length === 0;
      
      // Update run record
      await db.update(ingestionRuns)
        .set({
          status: result.success ? 'success' : (result.recordsFetched > 0 ? 'partial' : 'failed'),
          completedAt: new Date(),
          duration: Date.now() - new Date(connector.lastRunAt || new Date()).getTime(),
          recordsFetched: result.recordsFetched,
          recordsCreated: result.recordsCreated,
          recordsUpdated: result.recordsUpdated,
          recordsSkipped: result.recordsSkipped,
          errorMessage: result.errors.join('; ')
        })
        .where(eq(ingestionRuns.id, runId));
      
      console.log(`✅ Ingestion completed for ${connector.connectorId}`);
      console.log(`   Fetched: ${result.recordsFetched}, Created: ${result.recordsCreated}, Updated: ${result.recordsUpdated}`);
      
    } catch (error: any) {
      result.success = false;
      result.errors.push(error.message);
      
      // Update run record with error
      await db.update(ingestionRuns)
        .set({
          status: 'failed',
          completedAt: new Date(),
          errorMessage: error.message,
          errorDetails: { stack: error.stack }
        })
        .where(eq(ingestionRuns.id, runId));
      
      console.error(`❌ Ingestion failed for ${connector.connectorId}:`, error.message);
    }
    
    return result;
  }
  
  /**
   * Store raw object (evidence-first principle)
   */
  private async storeRawObject(
    sourceRegistryId: number,
    runId: number,
    url: string,
    content: Buffer | string,
    contentType: string
  ): Promise<number> {
    const buffer = typeof content === 'string' ? Buffer.from(content) : content;
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
    
    // Check if we already have this object
    const existing = await db
      .select({ id: rawObjects.id })
      .from(rawObjects)
      .where(eq(rawObjects.sha256, sha256))
      .limit(1);
    
    if (existing.length > 0) {
      return existing[0].id;
    }
    
    // Store in S3 or local storage (simplified for now)
    const storageUri = `raw/${sourceRegistryId}/${sha256}`;
    
    // Insert raw object record
    const result = await db.insert(rawObjects).values({
      sourceRegistryId,
      ingestionRunId: runId,
      contentType,
      canonicalUrl: url,
      retrievalTs: new Date(),
      sha256,
      fileSize: buffer.length,
      storageUri,
      status: 'active'
    });
    
    return result[0].insertId;
  }
  
  /**
   * Handler for REST API connectors
   */
  private async handleApiRestConnector(
    runId: number,
    connector: any,
    source: any,
    result: IngestionResult,
    options: any
  ): Promise<void> {
    const url = connector.config.url;
    
    if (!url) {
      throw new Error('No URL configured for API connector');
    }
    
    // Placeholder: In production, use axios or fetch
    result.warnings.push('API connector handler not fully implemented');
    console.log(`  📡 Would fetch from: ${url}`);
    
    // Simulate fetch
    if (!options.dryRun) {
      // TODO: Implement actual API fetching
      result.recordsFetched = 0;
    }
  }
  
  /**
   * Handler for web scraping connectors
   */
  private async handleWebScrapeConnector(
    runId: number,
    connector: any,
    source: any,
    result: IngestionResult,
    options: any
  ): Promise<void> {
    result.warnings.push('Web scrape connector handler not fully implemented');
    console.log(`  🕷️  Would scrape: ${connector.config.url}`);
  }
  
  /**
   * Handler for CSV download connectors
   */
  private async handleCsvDownloadConnector(
    runId: number,
    connector: any,
    source: any,
    result: IngestionResult,
    options: any
  ): Promise<void> {
    result.warnings.push('CSV connector handler not fully implemented');
    console.log(`  📄 Would download CSV from: ${connector.config.url}`);
  }
  
  /**
   * Handler for PDF download connectors
   */
  private async handlePdfDownloadConnector(
    runId: number,
    connector: any,
    source: any,
    result: IngestionResult,
    options: any
  ): Promise<void> {
    result.warnings.push('PDF connector handler not fully implemented');
    console.log(`  📕 Would download PDF from: ${connector.config.url}`);
  }
  
  /**
   * Run all due connectors
   */
  async runScheduledIngestion(): Promise<IngestionResult[]> {
    console.log('🚀 Running scheduled ingestion...\n');
    
    const dueConnectors = await this.getDueConnectors();
    
    console.log(`Found ${dueConnectors.length} connectors due for ingestion`);
    
    const results: IngestionResult[] = [];
    
    for (const { connector } of dueConnectors) {
      try {
        const result = await this.runConnector(connector.connectorId);
        results.push(result);
      } catch (error: any) {
        console.error(`Failed to run connector ${connector.connectorId}:`, error.message);
        results.push({
          success: false,
          runId: 0,
          recordsFetched: 0,
          recordsCreated: 0,
          recordsUpdated: 0,
          recordsSkipped: 0,
          rawObjectsStored: 0,
          errors: [error.message],
          warnings: []
        });
      }
    }
    
    return results;
  }
}

// Singleton instance
export const ingestionOrchestrator = new IngestionOrchestrator();
