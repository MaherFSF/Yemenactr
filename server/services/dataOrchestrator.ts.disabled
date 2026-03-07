/**
 * Data Ingestion Orchestrator
 * Manages all data connectors, scheduling, and real-time distribution
 */

import { db } from "../db";
import { dataConnectors, dataIngestionJobs } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { BankingConnector } from "../connectors/BankingConnector";
import { TradeConnector } from "../connectors/TradeConnector";
import { BaseDataConnector, ConnectorConfig, IngestionResult } from "./dataConnector";

// ============================================================================
// ORCHESTRATOR
// ============================================================================

export class DataOrchestrator {
  private connectors: Map<string, BaseDataConnector> = new Map();
  private jobs: Map<string, NodeJS.Timer> = new Map();

  constructor() {
    this.initializeConnectors();
  }

  /**
   * Initialize all registered connectors
   */
  private initializeConnectors(): void {
    // Banking Connector
    const bankingConfig: ConnectorConfig = {
      id: 'banking-connector',
      name: 'Banking Sector Data Connector',
      sourceType: 'banking',
      apiEndpoint: process.env.BANKING_API_ENDPOINT || 'https://api.banking.example.com',
      authType: 'api_key',
      authCredentials: {
        apiKey: process.env.BANKING_API_KEY || '',
      },
      retryPolicy: {
        maxRetries: 5,
        backoffMultiplier: 2,
        initialDelayMs: 1000,
        maxDelayMs: 60000,
      },
      dataMapping: {
        'npl_ratio': 'NPL_RATIO',
        'deposit_growth': 'DEPOSIT_GROWTH',
        'credit_to_gdp': 'CREDIT_TO_GDP',
        'capital_adequacy': 'CAR',
      },
    };
    this.connectors.set('banking-connector', new BankingConnector(bankingConfig));

    // Trade Connector
    const tradeConfig: ConnectorConfig = {
      id: 'trade-connector',
      name: 'Trade Sector Data Connector',
      sourceType: 'trade',
      apiEndpoint: process.env.TRADE_API_ENDPOINT || 'https://api.trade.example.com',
      authType: 'api_key',
      authCredentials: {
        apiKey: process.env.TRADE_API_KEY || '',
      },
      retryPolicy: {
        maxRetries: 5,
        backoffMultiplier: 2,
        initialDelayMs: 1000,
        maxDelayMs: 60000,
      },
      dataMapping: {
        'import_volume': 'IMPORT_VOLUME',
        'export_revenue': 'EXPORT_REVENUE',
        'trade_balance': 'TRADE_BALANCE',
        'port_throughput': 'PORT_THROUGHPUT',
      },
    };
    this.connectors.set('trade-connector', new TradeConnector(tradeConfig));
  }

  /**
   * Run a specific connector
   */
  async runConnector(connectorId: string, year?: number): Promise<IngestionResult> {
    const connector = this.connectors.get(connectorId);
    if (!connector) {
      throw new Error(`Connector not found: ${connectorId}`);
    }

    console.log(`[Orchestrator] Running connector: ${connectorId}`);
    const result = await connector.run(year);

    // Log result
    await this.logIngestionResult(connectorId, result);

    // Notify subscribers
    await this.notifySubscribers(connectorId, result);

    return result;
  }

  /**
   * Run all connectors
   */
  async runAllConnectors(year?: number): Promise<IngestionResult[]> {
    const results: IngestionResult[] = [];

    for (const [connectorId, connector] of this.connectors) {
      try {
        console.log(`[Orchestrator] Running all connectors - ${connectorId}`);
        const result = await connector.run(year);
        results.push(result);
      } catch (error) {
        console.error(`[Orchestrator] Connector failed: ${connectorId}`, error);
        results.push({
          success: false,
          connectorId,
          recordsProcessed: 0,
          recordsStored: 0,
          duration: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  /**
   * Run historical backfill for all years
   */
  async runHistoricalBackfill(): Promise<IngestionResult[]> {
    const results: IngestionResult[] = [];
    const years = [2023, 2024, 2025, 2026];

    for (const year of years) {
      console.log(`[Orchestrator] Running backfill for year: ${year}`);
      const yearResults = await this.runAllConnectors(year);
      results.push(...yearResults);
    }

    return results;
  }

  /**
   * Schedule recurring ingestion jobs
   */
  scheduleJobs(): void {
    // Banking connector - daily at 2 AM
    this.scheduleConnector('banking-connector', '0 2 * * *');

    // Trade connector - daily at 3 AM
    this.scheduleConnector('trade-connector', '0 3 * * *');

    console.log('[Orchestrator] Ingestion jobs scheduled');
  }

  /**
   * Schedule a connector with cron expression
   */
  private scheduleConnector(connectorId: string, cronExpression: string): void {
    // Parse cron and schedule
    // For now, using simple interval (daily)
    const dailyInterval = 24 * 60 * 60 * 1000; // 24 hours

    const job = setInterval(async () => {
      try {
        await this.runConnector(connectorId);
      } catch (error) {
        console.error(`[Orchestrator] Scheduled job failed: ${connectorId}`, error);
      }
    }, dailyInterval);

    this.jobs.set(connectorId, job);
  }

  /**
   * Stop all scheduled jobs
   */
  stopAllJobs(): void {
    for (const [connectorId, job] of this.jobs) {
      clearInterval(job);
      console.log(`[Orchestrator] Stopped job: ${connectorId}`);
    }
    this.jobs.clear();
  }

  /**
   * Log ingestion result to database
   */
  private async logIngestionResult(connectorId: string, result: IngestionResult): Promise<void> {
    try {
      await db.insert(dataIngestionJobs).values({
        id: `${connectorId}-${Date.now()}`,
        connectorId,
        sectorId: this.getSectorFromConnector(connectorId),
        schedule: '0 2 * * *', // Daily at 2 AM
        lastRunAt: new Date(),
        lastRunStatus: result.success ? 'success' : 'failed',
        lastRunDuration: result.duration,
        nextRunAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        recordsProcessed: result.recordsProcessed,
        recordsFailed: result.recordsProcessed - result.recordsStored,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('[Orchestrator] Failed to log ingestion result:', error);
    }
  }

  /**
   * Notify subscribers of ingestion completion
   */
  private async notifySubscribers(connectorId: string, result: IngestionResult): Promise<void> {
    // Broadcast to WebSocket subscribers
    // Update dashboard in real-time
    // Send notifications to admin users
    console.log(`[Orchestrator] Notifying subscribers - ${connectorId}: ${result.recordsStored} records stored`);
  }

  /**
   * Get sector ID from connector ID
   */
  private getSectorFromConnector(connectorId: string): string {
    if (connectorId.includes('banking')) return 'banking';
    if (connectorId.includes('trade')) return 'trade';
    if (connectorId.includes('energy')) return 'energy';
    if (connectorId.includes('humanitarian')) return 'humanitarian';
    return 'unknown';
  }

  /**
   * Get connector status
   */
  async getConnectorStatus(connectorId: string): Promise<any> {
    try {
      const connector = await db.query.dataConnectors.findFirst({
        where: eq(dataConnectors.id, connectorId),
      });

      if (!connector) {
        throw new Error(`Connector not found: ${connectorId}`);
      }

      return {
        id: connector.id,
        name: connector.name,
        isActive: connector.isActive,
        lastSuccessfulRun: connector.lastSuccessfulRun,
        lastFailedRun: connector.lastFailedRun,
        failureReason: connector.failureReason,
      };
    } catch (error) {
      console.error('[Orchestrator] Failed to get connector status:', error);
      throw error;
    }
  }

  /**
   * Get all connectors status
   */
  async getAllConnectorsStatus(): Promise<any[]> {
    try {
      const connectors = await db.query.dataConnectors.findMany();
      return connectors.map((c) => ({
        id: c.id,
        name: c.name,
        isActive: c.isActive,
        lastSuccessfulRun: c.lastSuccessfulRun,
        lastFailedRun: c.lastFailedRun,
        failureReason: c.failureReason,
      }));
    } catch (error) {
      console.error('[Orchestrator] Failed to get all connectors status:', error);
      throw error;
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let orchestratorInstance: DataOrchestrator | null = null;

export function getOrchestrator(): DataOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new DataOrchestrator();
  }
  return orchestratorInstance;
}

export function initializeOrchestrator(): void {
  const orchestrator = getOrchestrator();
  orchestrator.scheduleJobs();
  console.log('[Orchestrator] Initialized and jobs scheduled');
}
