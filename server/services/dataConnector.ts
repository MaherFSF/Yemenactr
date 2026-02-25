/**
 * Data Connector Framework
 * Base class for all data source connectors
 * Handles authentication, fetching, transformation, and error handling
 */

import { db } from "../db";
import { dataConnectors, timeSeriesData } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// ============================================================================
// TYPES
// ============================================================================

export interface ConnectorConfig {
  id: string;
  name: string;
  sourceType: string;
  apiEndpoint: string;
  authType: 'api_key' | 'oauth' | 'basic' | 'none';
  authCredentials?: Record<string, string>;
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelayMs: number;
    maxDelayMs: number;
  };
  dataMapping: Record<string, string>;
}

export interface DataPoint {
  year: number;
  month?: number;
  value: number | null;
  confidence: 'high' | 'medium' | 'low' | 'proxy';
  source: string;
}

export interface TransformationResult {
  sectorId: string;
  indicatorCode: string;
  dataPoints: DataPoint[];
  metadata: {
    source: string;
    sourceType: string;
    fetchedAt: Date;
    transformedAt: Date;
  };
}

// ============================================================================
// BASE CONNECTOR CLASS
// ============================================================================

export abstract class BaseDataConnector {
  protected config: ConnectorConfig;
  protected lastRunAt: Date | null = null;
  protected lastError: string | null = null;

  constructor(config: ConnectorConfig) {
    this.config = config;
  }

  /**
   * Fetch raw data from source
   */
  abstract fetchData(year?: number): Promise<any>;

  /**
   * Transform raw data to YETO schema
   */
  abstract transformData(rawData: any): Promise<TransformationResult[]>;

  /**
   * Validate transformed data
   */
  abstract validateData(data: TransformationResult[]): Promise<ValidationResult>;

  /**
   * Main execution method with retry logic
   */
  async run(year?: number): Promise<IngestionResult> {
    const startTime = Date.now();
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < this.config.retryPolicy.maxRetries) {
      try {
        console.log(`[${this.config.id}] Attempt ${attempt + 1}/${this.config.retryPolicy.maxRetries}`);

        // Fetch data
        const rawData = await this.fetchData(year);
        console.log(`[${this.config.id}] Fetched raw data`);

        // Transform data
        const transformedData = await this.transformData(rawData);
        console.log(`[${this.config.id}] Transformed ${transformedData.length} records`);

        // Validate data
        const validation = await this.validateData(transformedData);
        if (!validation.isValid) {
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }
        console.log(`[${this.config.id}] Validation passed`);

        // Store data
        const stored = await this.storeData(transformedData);
        console.log(`[${this.config.id}] Stored ${stored} records`);

        // Update connector status
        this.lastRunAt = new Date();
        this.lastError = null;
        await this.updateConnectorStatus('success', null);

        return {
          success: true,
          connectorId: this.config.id,
          recordsProcessed: transformedData.length,
          recordsStored: stored,
          duration: Date.now() - startTime,
          error: null,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`[${this.config.id}] Attempt ${attempt + 1} failed:`, lastError.message);

        attempt++;
        if (attempt < this.config.retryPolicy.maxRetries) {
          const delayMs = Math.min(
            this.config.retryPolicy.initialDelayMs * Math.pow(this.config.retryPolicy.backoffMultiplier, attempt - 1),
            this.config.retryPolicy.maxDelayMs
          );
          console.log(`[${this.config.id}] Retrying in ${delayMs}ms...`);
          await this.sleep(delayMs);
        }
      }
    }

    // All retries failed
    this.lastError = lastError?.message || 'Unknown error';
    await this.updateConnectorStatus('failed', this.lastError);

    return {
      success: false,
      connectorId: this.config.id,
      recordsProcessed: 0,
      recordsStored: 0,
      duration: Date.now() - startTime,
      error: this.lastError,
    };
  }

  /**
   * Store transformed data to database
   */
  protected async storeData(results: TransformationResult[]): Promise<number> {
    let stored = 0;

    for (const result of results) {
      for (const point of result.dataPoints) {
        try {
          // Insert or update time series data
          await db.insert(timeSeriesData).values({
            sectorId: result.sectorId,
            indicatorCode: result.indicatorCode,
            year: point.year,
            month: point.month || null,
            value: point.value,
            confidence: point.confidence,
            source: point.source,
            sourceType: result.metadata.sourceType,
            dataVintage: result.metadata.fetchedAt,
            connectorId: this.config.id,
            lastUpdated: new Date(),
          }).onConflictDoUpdate({
            target: [
              // Assuming unique constraint on (sectorId, indicatorCode, year, month)
            ],
            set: {
              value: point.value,
              confidence: point.confidence,
              lastUpdated: new Date(),
            },
          });

          stored++;
        } catch (error) {
          console.error(`[${this.config.id}] Failed to store data point:`, error);
        }
      }
    }

    return stored;
  }

  /**
   * Update connector status in database
   */
  protected async updateConnectorStatus(status: 'success' | 'failed', error: string | null): Promise<void> {
    try {
      await db
        .update(dataConnectors)
        .set({
          lastSuccessfulRun: status === 'success' ? new Date() : undefined,
          lastFailedRun: status === 'failed' ? new Date() : undefined,
          failureReason: error,
          updatedAt: new Date(),
        })
        .where(eq(dataConnectors.id, this.config.id));
    } catch (error) {
      console.error(`[${this.config.id}] Failed to update connector status:`, error);
    }
  }

  /**
   * Helper: Sleep for specified milliseconds
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Helper: Make HTTP request with auth
   */
  protected async fetchUrl(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = new Headers(options.headers || {});

    // Add authentication
    if (this.config.authType === 'api_key' && this.config.authCredentials?.apiKey) {
      headers.set('Authorization', `Bearer ${this.config.authCredentials.apiKey}`);
    } else if (this.config.authType === 'basic' && this.config.authCredentials?.username) {
      const credentials = btoa(`${this.config.authCredentials.username}:${this.config.authCredentials.password}`);
      headers.set('Authorization', `Basic ${credentials}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  }
}

// ============================================================================
// VALIDATION
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface IngestionResult {
  success: boolean;
  connectorId: string;
  recordsProcessed: number;
  recordsStored: number;
  duration: number;
  error: string | null;
}

// ============================================================================
// CONNECTOR REGISTRY
// ============================================================================

export class ConnectorRegistry {
  private static connectors: Map<string, typeof BaseDataConnector> = new Map();

  static register(id: string, connectorClass: typeof BaseDataConnector): void {
    this.connectors.set(id, connectorClass);
  }

  static getConnector(id: string): typeof BaseDataConnector | undefined {
    return this.connectors.get(id);
  }

  static getAllConnectors(): Map<string, typeof BaseDataConnector> {
    return this.connectors;
  }
}
