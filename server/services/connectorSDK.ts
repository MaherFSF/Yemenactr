/**
 * YETO Connector SDK
 * 
 * Standardized interface for all data connectors with:
 * - discover(): List available datasets
 * - fetch_raw(): Get raw data from source
 * - normalize(): Transform to standard schema
 * - validate(): Quality checks
 * - load(): Store to database
 * - index(): Update search indexes
 * - emit_evidence(): Create evidence packs
 */

import { getDb } from "../db";
import {
  sourceRegistry,
  timeSeries,
  indicators,
  ingestionRuns,
  evidencePacks,
  datasetVersions,
} from "../../drizzle/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

// ============================================================================
// Types
// ============================================================================

export interface SourceMetadata {
  sourceId: string;
  name: string;
  nameAr: string;
  description: string;
  apiType: "REST" | "SDMX" | "CKAN" | "OData" | "MANUAL" | "SCRAPER";
  baseUrl: string;
  datasets: DatasetInfo[];
  indicators: IndicatorInfo[];
  coverage: {
    startDate: string;
    endDate: string;
    countries: string[];
    frequency: string;
  };
}

export interface DatasetInfo {
  id: string;
  name: string;
  description: string;
  indicatorCount: number;
  lastUpdated: string;
}

export interface IndicatorInfo {
  id: string;
  name: string;
  nameAr: string;
  unit: string;
  frequency: string;
}

export interface FetchParams {
  sourceId: string;
  datasetId?: string;
  indicators?: string[];
  startDate: string;
  endDate: string;
  countries?: string[];
  page?: number;
  pageSize?: number;
}

export interface RawPayload {
  sourceId: string;
  fetchedAt: Date;
  params: FetchParams;
  data: unknown[];
  metadata: {
    totalRecords: number;
    pageCount: number;
    currentPage: number;
    checksum: string;
  };
}

export interface NormalizedSeries {
  indicatorId: string;
  indicatorName: string;
  indicatorNameAr: string;
  unit: string;
  frequency: string;
  country: string;
  observations: Observation[];
  source: {
    id: string;
    name: string;
    url: string;
    accessDate: string;
  };
}

export interface Observation {
  date: string;
  value: number | null;
  status?: "preliminary" | "revised" | "final";
  notes?: string;
}

export interface QAReport {
  passed: boolean;
  checks: QACheck[];
  warnings: string[];
  errors: string[];
  coverage: {
    startDate: string;
    endDate: string;
    completeness: number;
    gaps: DateRange[];
  };
}

export interface QACheck {
  name: string;
  passed: boolean;
  message: string;
  severity: "info" | "warning" | "error";
}

export interface DateRange {
  start: string;
  end: string;
}

export interface LoadResult {
  success: boolean;
  recordsLoaded: number;
  recordsSkipped: number;
  recordsFailed: number;
  errors: string[];
  ingestionRunId: number;
}

export interface EvidencePack {
  id: number;
  subjectType: string;
  subjectId: string;
  citations: Citation[];
  transforms: Transform[];
  confidenceGrade: "A" | "B" | "C" | "D";
  confidenceExplanation: string;
}

export interface Citation {
  sourceId: string;
  sourceName: string;
  url: string;
  accessDate: string;
  page?: number;
  section?: string;
  table?: string;
}

export interface Transform {
  step: number;
  operation: string;
  input: string;
  output: string;
  timestamp: string;
}

// ============================================================================
// Connector SDK Interface
// ============================================================================

export interface ConnectorSDK {
  /**
   * Discover available datasets and indicators from the source
   */
  discover(): Promise<SourceMetadata>;

  /**
   * Fetch raw data from the source API
   */
  fetch_raw(params: FetchParams): Promise<RawPayload>;

  /**
   * Normalize raw data to standard schema
   */
  normalize(raw: RawPayload): Promise<NormalizedSeries[]>;

  /**
   * Validate normalized data against quality rules
   */
  validate(series: NormalizedSeries[]): Promise<QAReport>;

  /**
   * Load validated data into the database
   */
  load(series: NormalizedSeries[]): Promise<LoadResult>;

  /**
   * Update search indexes for the loaded data
   */
  index(series: NormalizedSeries[]): Promise<void>;

  /**
   * Create evidence packs for the loaded data
   */
  emit_evidence(series: NormalizedSeries[]): Promise<EvidencePack[]>;
}

// ============================================================================
// Base Connector Implementation
// ============================================================================

export abstract class BaseConnector implements ConnectorSDK {
  protected sourceId: string;
  protected sourceName: string;
  protected sourceNameAr: string;
  protected baseUrl: string;
  protected apiType: "REST" | "SDMX" | "CKAN" | "OData" | "MANUAL" | "SCRAPER";

  constructor(config: {
    sourceId: string;
    sourceName: string;
    sourceNameAr: string;
    baseUrl: string;
    apiType: "REST" | "SDMX" | "CKAN" | "OData" | "MANUAL" | "SCRAPER";
  }) {
    this.sourceId = config.sourceId;
    this.sourceName = config.sourceName;
    this.sourceNameAr = config.sourceNameAr;
    this.baseUrl = config.baseUrl;
    this.apiType = config.apiType;
  }

  abstract discover(): Promise<SourceMetadata>;
  abstract fetch_raw(params: FetchParams): Promise<RawPayload>;
  abstract normalize(raw: RawPayload): Promise<NormalizedSeries[]>;

  /**
   * Default validation implementation
   */
  async validate(series: NormalizedSeries[]): Promise<QAReport> {
    const checks: QACheck[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];
    const db = getDb;
    let allGaps: DateRange[] = [];

    // Check 1: Non-empty data
    const hasData = series.length > 0 && series.some(s => s.observations.length > 0);
    checks.push({
      name: "Non-empty data",
      passed: hasData,
      message: hasData ? "Data contains observations" : "No observations found",
      severity: hasData ? "info" : "error",
    });
    if (!hasData) errors.push("No observations found in data");

    // Check 2: Valid values
    let invalidValues = 0;
    for (const s of series) {
      for (const obs of s.observations) {
        if (obs.value !== null && (isNaN(obs.value) || !isFinite(obs.value))) {
          invalidValues++;
        }
      }
    }
    const validValues = invalidValues === 0;
    checks.push({
      name: "Valid numeric values",
      passed: validValues,
      message: validValues ? "All values are valid" : `${invalidValues} invalid values found`,
      severity: validValues ? "info" : "warning",
    });
    if (!validValues) warnings.push(`${invalidValues} invalid numeric values`);

    // Check 3: Date format
    let invalidDates = 0;
    for (const s of series) {
      for (const obs of s.observations) {
        if (!obs.date || isNaN(Date.parse(obs.date))) {
          invalidDates++;
        }
      }
    }
    const validDates = invalidDates === 0;
    checks.push({
      name: "Valid date format",
      passed: validDates,
      message: validDates ? "All dates are valid" : `${invalidDates} invalid dates found`,
      severity: validDates ? "info" : "error",
    });
    if (!validDates) errors.push(`${invalidDates} invalid date formats`);

    // Check 4: Duplicate detection
    const seenKeys = new Set<string>();
    let duplicates = 0;
    for (const s of series) {
      for (const obs of s.observations) {
        const key = `${s.indicatorId}:${s.country}:${obs.date}`;
        if (seenKeys.has(key)) {
          duplicates++;
        } else {
          seenKeys.add(key);
        }
      }
    }
    const noDuplicates = duplicates === 0;
    checks.push({
      name: "No duplicates",
      passed: noDuplicates,
      message: noDuplicates ? "No duplicates found" : `${duplicates} duplicate records`,
      severity: noDuplicates ? "info" : "warning",
    });
    if (!noDuplicates) warnings.push(`${duplicates} duplicate records detected`);

    // Calculate coverage
    let minDate = "9999-12-31";
    let maxDate = "1900-01-01";
    let totalObs = 0;
    for (const s of series) {
      for (const obs of s.observations) {
        if (obs.date < minDate) minDate = obs.date;
        if (obs.date > maxDate) maxDate = obs.date;
        totalObs++;
      }
    }

    // Estimate completeness (simplified)
    const startYear = parseInt(minDate.substring(0, 4));
    const endYear = parseInt(maxDate.substring(0, 4));
    const expectedYears = endYear - startYear + 1;
    const expectedObs = expectedYears * series.length;
    const completeness = expectedObs > 0 ? Math.min(100, (totalObs / expectedObs) * 100) : 0;

    return {
      passed: errors.length === 0,
      checks,
      warnings,
      errors,
      coverage: {
        startDate: minDate,
        endDate: maxDate,
        completeness: Math.round(completeness),
        gaps: allGaps,
      },
    };
  }

  /**
   * Default load implementation
   */
  async load(series: NormalizedSeries[]): Promise<LoadResult> {
    const database = await getDb();
    if (!database) {
      return {
        success: false,
        recordsLoaded: 0,
        recordsSkipped: 0,
        recordsFailed: series.reduce((sum, s) => sum + s.observations.length, 0),
        errors: ["Database connection not available"],
        ingestionRunId: 0,
      };
    }
    let recordsLoaded = 0;
    let recordsSkipped = 0;
    let recordsFailed = 0;
    const errors: string[] = [];

    // Create ingestion run record
    const ingestionRunResult = await database
      .insert(ingestionRuns)
      .values({
        sourceId: 1, // Default source ID, will be updated
        connectorName: this.sourceId,
        status: "running",
        startedAt: new Date(),
        recordsFetched: series.reduce((sum, s) => sum + s.observations.length, 0),
      })
      .$returningId();
    
    const ingestionRun = { id: ingestionRunResult[0]?.id || 0, startedAt: new Date() };

    try {
      for (const s of series) {
        // Ensure indicator exists
        const existingIndicator = await database
          .select()
          .from(indicators)
          .where(eq(indicators.code, s.indicatorId))
          .limit(1);

        let indicatorId: number;
        if (existingIndicator.length === 0) {
          const result = await database
            .insert(indicators)
            .values({
              code: s.indicatorId,
              nameEn: s.indicatorName,
              nameAr: s.indicatorNameAr || s.indicatorName,
              unit: s.unit || "units",
              sector: "general",
              frequency: "monthly",
            })
            .$returningId();
          indicatorId = result[0]?.id || 0;
        } else {
          indicatorId = existingIndicator[0].id;
        }

        // Insert observations
        for (const obs of s.observations) {
          try {
            // Check for existing record (idempotent insert)
            const existing = await database
              .select()
              .from(timeSeries)
              .where(
                and(
                  eq(timeSeries.indicatorCode, s.indicatorId),
                  sql`DATE(${timeSeries.date}) = ${obs.date}`
                )
              )
              .limit(1);

            if (existing.length > 0) {
              // Update if value changed
              if (String(existing[0].value) !== String(obs.value)) {
                await database
                  .update(timeSeries)
                  .set({
                    value: String(obs.value || 0),
                    updatedAt: new Date(),
                  })
                  .where(eq(timeSeries.id, existing[0].id));
                recordsLoaded++;
              } else {
                recordsSkipped++;
              }
            } else {
              // Insert new record
              const sourceRecord = await database
                .select()
                .from(sourceRegistry)
                .where(eq(sourceRegistry.name, this.sourceName))
                .limit(1);
              
              const sourceDbId = sourceRecord[0]?.id || 1;
              
              await database.insert(timeSeries).values({
                indicatorCode: s.indicatorId,
                regimeTag: "mixed",
                date: new Date(obs.date),
                value: String(obs.value || 0),
                unit: s.unit || "units",
                confidenceRating: "B",
                sourceId: sourceDbId,
              });
              recordsLoaded++;
            }
          } catch (err) {
            recordsFailed++;
            errors.push(`Failed to load ${s.indicatorId}:${obs.date}: ${err}`);
          }
        }
      }

      // Update ingestion run with duration
      const completedAt = new Date();
      const startedAt = new Date(); // Will be overwritten by actual startedAt from insert
      await database
        .update(ingestionRuns)
        .set({
          status: errors.length === 0 ? "success" : "partial",
          completedAt,
          duration: Math.floor((completedAt.getTime() - ingestionRun.startedAt.getTime()) / 1000),
          recordsCreated: recordsLoaded,
          recordsSkipped,
          errorMessage: errors.length > 0 ? errors.join("; ") : null,
        })
        .where(eq(ingestionRuns.id, ingestionRun.id));

      return {
        success: errors.length === 0,
        recordsLoaded,
        recordsSkipped,
        recordsFailed,
        errors,
        ingestionRunId: ingestionRun.id,
      };
    } catch (err) {
      const completedAt = new Date();
      await database
        .update(ingestionRuns)
        .set({
          status: "failed",
          completedAt,
          duration: Math.floor((completedAt.getTime() - ingestionRun.startedAt.getTime()) / 1000),
          errorMessage: String(err),
        })
        .where(eq(ingestionRuns.id, ingestionRun.id));

      return {
        success: false,
        recordsLoaded,
        recordsSkipped,
        recordsFailed: recordsFailed + 1,
        errors: [...errors, String(err)],
        ingestionRunId: ingestionRun.id,
      };
    }
  }

  /**
   * Default index implementation (placeholder)
   */
  async index(series: NormalizedSeries[]): Promise<void> {
    // In production, this would update search indexes (Elasticsearch, etc.)
    console.log(`Indexed ${series.length} series from ${this.sourceId}`);
  }

  /**
   * Default evidence pack emission
   */
  async emit_evidence(series: NormalizedSeries[]): Promise<EvidencePack[]> {
    const database = await getDb();
    if (!database) return [];
    const packs: EvidencePack[] = [];

    for (const s of series) {
      const result = await database
        .insert(evidencePacks)
        .values({
          subjectType: "series",
          subjectId: s.indicatorId,
          subjectLabel: s.indicatorName,
          citations: [
            {
              sourceId: 1,
              title: s.indicatorName,
              publisher: s.source.name,
              url: s.source.url,
              retrievalDate: s.source.accessDate,
              licenseFlag: "unknown",
            },
          ],
          transforms: [
            {
              description: "Fetched from API and normalized",
              codeRef: "connectorSDK.ts",
            },
          ],
          regimeTags: ["mixed"],
          geoScope: s.country || "Yemen",
          timeCoverageStart: s.observations[0] ? new Date(s.observations[0].date) : null,
          timeCoverageEnd: s.observations.length > 0 ? new Date(s.observations[s.observations.length - 1].date) : null,
          confidenceGrade: "B",
          confidenceExplanation: `Data sourced from ${s.source.name} with ${s.observations.length} observations`,
        })
        .$returningId();

      const packId = result[0]?.id || 0;

      packs.push({
        id: packId,
        subjectType: "series",
        subjectId: s.indicatorId,
        citations: [
          {
            sourceId: "1",
            sourceName: s.source.name,
            url: s.source.url,
            accessDate: s.source.accessDate,
          },
        ],
        transforms: [],
        confidenceGrade: "B",
        confidenceExplanation: `Data sourced from ${s.source.name}`,
      });
    }

    return packs;
  }
}

// ============================================================================
// Connector Factory
// ============================================================================

export class ConnectorFactory {
  private static connectors: Map<string, ConnectorSDK> = new Map();

  static register(sourceId: string, connector: ConnectorSDK): void {
    this.connectors.set(sourceId, connector);
  }

  static get(sourceId: string): ConnectorSDK | undefined {
    return this.connectors.get(sourceId);
  }

  static list(): string[] {
    return Array.from(this.connectors.keys());
  }
}

// ============================================================================
// Pipeline Runner
// ============================================================================

export async function runConnectorPipeline(
  connector: ConnectorSDK,
  params: FetchParams
): Promise<{
  success: boolean;
  loadResult?: LoadResult;
  qaReport?: QAReport;
  evidencePacks?: EvidencePack[];
  errors: string[];
}> {
  const errors: string[] = [];

  try {
    // Step 1: Fetch raw data
    console.log(`[Pipeline] Fetching raw data for ${params.sourceId}...`);
    const raw = await connector.fetch_raw(params);
    console.log(`[Pipeline] Fetched ${raw.metadata.totalRecords} records`);

    // Step 2: Normalize
    console.log(`[Pipeline] Normalizing data...`);
    const normalized = await connector.normalize(raw);
    console.log(`[Pipeline] Normalized ${normalized.length} series`);

    // Step 3: Validate
    console.log(`[Pipeline] Validating data...`);
    const qaReport = await connector.validate(normalized);
    console.log(`[Pipeline] Validation ${qaReport.passed ? "PASSED" : "FAILED"}`);

    if (!qaReport.passed) {
      return {
        success: false,
        qaReport,
        errors: qaReport.errors,
      };
    }

    // Step 4: Load
    console.log(`[Pipeline] Loading data to database...`);
    const loadResult = await connector.load(normalized);
    console.log(`[Pipeline] Loaded ${loadResult.recordsLoaded} records`);

    // Step 5: Index
    console.log(`[Pipeline] Indexing data...`);
    await connector.index(normalized);

    // Step 6: Emit evidence
    console.log(`[Pipeline] Emitting evidence packs...`);
    const evidencePacks = await connector.emit_evidence(normalized);
    console.log(`[Pipeline] Created ${evidencePacks.length} evidence packs`);

    return {
      success: loadResult.success,
      loadResult,
      qaReport,
      evidencePacks,
      errors: loadResult.errors,
    };
  } catch (err) {
    errors.push(String(err));
    return {
      success: false,
      errors,
    };
  }
}
