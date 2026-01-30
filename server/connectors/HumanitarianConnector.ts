/**
 * Humanitarian Data Connectors
 * 
 * Direct API integration with humanitarian data sources:
 * - ReliefWeb API
 * - ACLED (Armed Conflict Location & Event Data)
 * - HDX (Humanitarian Data Exchange)
 * - IPC (Integrated Food Security Phase Classification)
 * 
 * FULLY HOST-INDEPENDENT - Uses standard HTTP APIs
 */

import { BaseConnector, ConnectorConfig, IngestionResult, ConnectorRegistry } from './BaseConnector';
import { db } from '../db';
import { timeSeries, libraryDocuments } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

// ============================================================================
// RELIEFWEB CONNECTOR
// ============================================================================

export class ReliefWebConnector extends BaseConnector {
  private static readonly BASE_URL = 'https://api.reliefweb.int/v1';
  private static readonly COUNTRY = 'Yemen';

  constructor() {
    super({
      name: 'ReliefWeb',
      baseUrl: ReliefWebConnector.BASE_URL,
      rateLimit: 30,
      retryAttempts: 3,
      retryDelay: 2000,
      timeout: 30000,
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      const url = `${this.config.baseUrl}/reports?appname=yeto-platform&limit=1`;
      const response = await this.fetchWithRetry(url);
      const data = await response.json();
      return data && data.data !== undefined;
    } catch (error) {
      this.log(`Connection test failed: ${(error as Error).message}`, 'error');
      return false;
    }
  }

  async getAvailableIndicators(): Promise<string[]> {
    return ['reports_count', 'updates_count', 'jobs_count', 'training_count'];
  }

  async ingestYear(year: number): Promise<IngestionResult> {
    const startTime = Date.now();
    const result: IngestionResult = {
      success: true,
      source: 'ReliefWeb',
      year,
      recordsIngested: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
      timestamp: new Date(),
    };

    // Ingest month by month for better granularity
    for (let month = 1; month <= 12; month++) {
      try {
        const monthResult = await this.ingestYearMonth(year, month);
        result.recordsIngested += monthResult.recordsIngested;
        result.recordsUpdated += monthResult.recordsUpdated;
        result.recordsFailed += monthResult.recordsFailed;
        result.errors.push(...monthResult.errors);
      } catch (error) {
        result.errors.push(`${year}-${month}: ${(error as Error).message}`);
      }
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  async ingestYearMonth(year: number, month: number): Promise<IngestionResult> {
    const startTime = Date.now();
    const result: IngestionResult = {
      success: true,
      source: 'ReliefWeb',
      year,
      month,
      recordsIngested: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
      timestamp: new Date(),
    };

    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = month === 12 
      ? `${year + 1}-01-01` 
      : `${year}-${(month + 1).toString().padStart(2, '0')}-01`;

    try {
      // Fetch reports
      const reports = await this.fetchReports(startDate, endDate);
      for (const report of reports) {
        try {
          const stored = await this.storeReport(report);
          stored.isNew ? result.recordsIngested++ : result.recordsUpdated++;
        } catch (error) {
          result.recordsFailed++;
          result.errors.push(`Report ${report.id}: ${(error as Error).message}`);
        }
      }

      // Store monthly count
      await this.storeMonthlyCount('reports_count', reports.length, year, month);

    } catch (error) {
      result.recordsFailed++;
      result.errors.push((error as Error).message);
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  private async fetchReports(startDate: string, endDate: string): Promise<any[]> {
    try {
      const url = `${this.config.baseUrl}/reports?appname=yeto-platform&filter[field]=country.name&filter[value]=${ReliefWebConnector.COUNTRY}&filter[field]=date.created&filter[value][from]=${startDate}&filter[value][to]=${endDate}&limit=1000&fields[include][]=id&fields[include][]=title&fields[include][]=date&fields[include][]=source&fields[include][]=url&fields[include][]=format&fields[include][]=theme`;
      
      const response = await this.fetchWithRetry(url);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      this.log(`Failed to fetch reports: ${(error as Error).message}`, 'warn');
      return [];
    }
  }

  private async storeReport(report: any): Promise<{ isNew: boolean }> {
    try {
      const existing = await db
        .select()
        .from(libraryDocuments)
        .where(eq(libraryDocuments.externalId, `reliefweb-${report.id}`))
        .limit(1);

      const docData = {
        externalId: `reliefweb-${report.id}`,
        title: report.fields?.title || 'Untitled',
        titleAr: null,
        publisher: report.fields?.source?.[0]?.name || 'ReliefWeb',
        publicationDate: report.fields?.date?.created ? new Date(report.fields.date.created) : new Date(),
        docType: report.fields?.format?.[0]?.name || 'Report',
        sourceUrl: report.fields?.url || `https://reliefweb.int/node/${report.id}`,
        pdfUrl: report.fields?.file?.[0]?.url || null,
        sectors: JSON.stringify(report.fields?.theme?.map((t: any) => t.name) || []),
        entities: JSON.stringify(report.fields?.source?.map((s: any) => s.name) || []),
        licenseFlag: 'open',
        status: 'published',
        metadata: JSON.stringify({
          reliefwebId: report.id,
          fetchedAt: new Date().toISOString(),
        }),
        updatedAt: new Date(),
      };

      if (existing.length > 0) {
        await db.update(libraryDocuments).set(docData).where(eq(libraryDocuments.id, existing[0].id));
        return { isNew: false };
      } else {
        await db.insert(libraryDocuments).values({
          id: `rw-${report.id}`,
          ...docData,
          createdAt: new Date(),
        });
        return { isNew: true };
      }
    } catch (error) {
      throw error;
    }
  }

  private async storeMonthlyCount(indicator: string, count: number, year: number, month: number): Promise<void> {
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-01`;
    
    try {
      const existing = await db
        .select()
        .from(timeSeries)
        .where(
          and(
            eq(timeSeries.indicatorCode, `RW_${indicator}`),
            eq(timeSeries.date, new Date(dateStr))
          )
        )
        .limit(1);

      const seriesData = {
        indicatorCode: `RW_${indicator}`,
        indicatorName: `ReliefWeb ${indicator.replace(/_/g, ' ')}`,
        value: count.toString(),
        date: new Date(dateStr),
        source: 'ReliefWeb',
        sourceUrl: 'https://reliefweb.int/country/yem',
        country: 'Yemen',
        countryCode: 'YEM',
        frequency: 'monthly',
        unit: 'count',
        metadata: JSON.stringify({ fetchedAt: new Date().toISOString() }),
        updatedAt: new Date(),
      };

      if (existing.length > 0) {
        await db.update(timeSeries).set(seriesData).where(eq(timeSeries.id, existing[0].id));
      } else {
        await db.insert(timeSeries).values({
          id: `rw-${indicator}-${year}-${month}`,
          ...seriesData,
          createdAt: new Date(),
        });
      }
    } catch (error) {
      this.log(`Failed to store monthly count: ${(error as Error).message}`, 'warn');
    }
  }
}

// ============================================================================
// ACLED CONNECTOR
// ============================================================================

export class ACLEDConnector extends BaseConnector {
  private static readonly BASE_URL = 'https://api.acleddata.com/acled/read';
  private static readonly COUNTRY = 'Yemen';

  constructor() {
    super({
      name: 'ACLED',
      baseUrl: ACLEDConnector.BASE_URL,
      rateLimit: 10, // ACLED has strict rate limits
      retryAttempts: 3,
      retryDelay: 5000,
      timeout: 60000,
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      // ACLED requires API key for full access, but we can test with limited query
      const url = `${this.config.baseUrl}?country=${ACLEDConnector.COUNTRY}&limit=1`;
      const response = await this.fetchWithRetry(url);
      const data = await response.json();
      return data && data.success !== false;
    } catch (error) {
      this.log(`Connection test failed: ${(error as Error).message}`, 'error');
      return false;
    }
  }

  async getAvailableIndicators(): Promise<string[]> {
    return [
      'conflict_events',
      'fatalities',
      'battles',
      'explosions_remote_violence',
      'violence_against_civilians',
      'protests',
      'riots',
      'strategic_developments',
    ];
  }

  async ingestYear(year: number): Promise<IngestionResult> {
    const startTime = Date.now();
    const result: IngestionResult = {
      success: true,
      source: 'ACLED',
      year,
      recordsIngested: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
      timestamp: new Date(),
    };

    // Ingest month by month
    for (let month = 1; month <= 12; month++) {
      try {
        const monthResult = await this.ingestYearMonth(year, month);
        result.recordsIngested += monthResult.recordsIngested;
        result.recordsUpdated += monthResult.recordsUpdated;
        result.recordsFailed += monthResult.recordsFailed;
        result.errors.push(...monthResult.errors);
      } catch (error) {
        result.errors.push(`${year}-${month}: ${(error as Error).message}`);
      }
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  async ingestYearMonth(year: number, month: number): Promise<IngestionResult> {
    const startTime = Date.now();
    const result: IngestionResult = {
      success: true,
      source: 'ACLED',
      year,
      month,
      recordsIngested: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
      timestamp: new Date(),
    };

    try {
      const events = await this.fetchMonthlyEvents(year, month);
      
      // Aggregate by event type
      const aggregates = this.aggregateEvents(events);
      
      for (const [eventType, data] of Object.entries(aggregates)) {
        try {
          const stored = await this.storeAggregatedData(eventType, data, year, month);
          stored.isNew ? result.recordsIngested++ : result.recordsUpdated++;
        } catch (error) {
          result.recordsFailed++;
          result.errors.push(`${eventType}: ${(error as Error).message}`);
        }
      }

    } catch (error) {
      result.recordsFailed++;
      result.errors.push((error as Error).message);
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  private async fetchMonthlyEvents(year: number, month: number): Promise<any[]> {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endMonth = month === 12 ? 1 : month + 1;
    const endYear = month === 12 ? year + 1 : year;
    const endDate = `${endYear}-${endMonth.toString().padStart(2, '0')}-01`;

    try {
      const url = `${this.config.baseUrl}?country=${ACLEDConnector.COUNTRY}&event_date=${startDate}|${endDate}&event_date_where=BETWEEN&limit=10000`;
      const response = await this.fetchWithRetry(url);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      this.log(`Failed to fetch events for ${year}-${month}: ${(error as Error).message}`, 'warn');
      return [];
    }
  }

  private aggregateEvents(events: any[]): Record<string, { count: number; fatalities: number }> {
    const aggregates: Record<string, { count: number; fatalities: number }> = {
      conflict_events: { count: 0, fatalities: 0 },
      battles: { count: 0, fatalities: 0 },
      explosions_remote_violence: { count: 0, fatalities: 0 },
      violence_against_civilians: { count: 0, fatalities: 0 },
      protests: { count: 0, fatalities: 0 },
      riots: { count: 0, fatalities: 0 },
      strategic_developments: { count: 0, fatalities: 0 },
    };

    for (const event of events) {
      aggregates.conflict_events.count++;
      aggregates.conflict_events.fatalities += event.fatalities || 0;

      const eventType = event.event_type?.toLowerCase().replace(/\s+/g, '_');
      if (eventType && aggregates[eventType]) {
        aggregates[eventType].count++;
        aggregates[eventType].fatalities += event.fatalities || 0;
      }
    }

    return aggregates;
  }

  private async storeAggregatedData(
    eventType: string,
    data: { count: number; fatalities: number },
    year: number,
    month: number
  ): Promise<{ isNew: boolean }> {
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-01`;

    try {
      // Store event count
      const countIndicator = `ACLED_${eventType}_count`;
      const existingCount = await db
        .select()
        .from(timeSeries)
        .where(
          and(
            eq(timeSeries.indicatorCode, countIndicator),
            eq(timeSeries.date, new Date(dateStr))
          )
        )
        .limit(1);

      const countData = {
        indicatorCode: countIndicator,
        indicatorName: `ACLED ${eventType.replace(/_/g, ' ')} (count)`,
        value: data.count.toString(),
        date: new Date(dateStr),
        source: 'ACLED',
        sourceUrl: 'https://acleddata.com/data-export-tool/',
        country: 'Yemen',
        countryCode: 'YEM',
        frequency: 'monthly',
        unit: 'events',
        metadata: JSON.stringify({ fetchedAt: new Date().toISOString() }),
        updatedAt: new Date(),
      };

      if (existingCount.length > 0) {
        await db.update(timeSeries).set(countData).where(eq(timeSeries.id, existingCount[0].id));
      } else {
        await db.insert(timeSeries).values({
          id: `acled-${eventType}-count-${year}-${month}`,
          ...countData,
          createdAt: new Date(),
        });
      }

      // Store fatalities
      const fatalIndicator = `ACLED_${eventType}_fatalities`;
      const existingFatal = await db
        .select()
        .from(timeSeries)
        .where(
          and(
            eq(timeSeries.indicatorCode, fatalIndicator),
            eq(timeSeries.date, new Date(dateStr))
          )
        )
        .limit(1);

      const fatalData = {
        indicatorCode: fatalIndicator,
        indicatorName: `ACLED ${eventType.replace(/_/g, ' ')} (fatalities)`,
        value: data.fatalities.toString(),
        date: new Date(dateStr),
        source: 'ACLED',
        sourceUrl: 'https://acleddata.com/data-export-tool/',
        country: 'Yemen',
        countryCode: 'YEM',
        frequency: 'monthly',
        unit: 'persons',
        metadata: JSON.stringify({ fetchedAt: new Date().toISOString() }),
        updatedAt: new Date(),
      };

      if (existingFatal.length > 0) {
        await db.update(timeSeries).set(fatalData).where(eq(timeSeries.id, existingFatal[0].id));
        return { isNew: false };
      } else {
        await db.insert(timeSeries).values({
          id: `acled-${eventType}-fatal-${year}-${month}`,
          ...fatalData,
          createdAt: new Date(),
        });
        return { isNew: true };
      }
    } catch (error) {
      throw error;
    }
  }
}

// ============================================================================
// HDX CONNECTOR
// ============================================================================

export class HDXConnector extends BaseConnector {
  private static readonly BASE_URL = 'https://data.humdata.org/api/3/action';
  private static readonly COUNTRY_CODE = 'yem';

  constructor() {
    super({
      name: 'HDX',
      baseUrl: HDXConnector.BASE_URL,
      rateLimit: 20,
      retryAttempts: 3,
      retryDelay: 2000,
      timeout: 30000,
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      const url = `${this.config.baseUrl}/package_search?q=yemen&rows=1`;
      const response = await this.fetchWithRetry(url);
      const data = await response.json();
      return data && data.success === true;
    } catch (error) {
      this.log(`Connection test failed: ${(error as Error).message}`, 'error');
      return false;
    }
  }

  async getAvailableIndicators(): Promise<string[]> {
    return ['datasets_count', 'resources_count'];
  }

  async ingestYear(year: number): Promise<IngestionResult> {
    const startTime = Date.now();
    const result: IngestionResult = {
      success: true,
      source: 'HDX',
      year,
      recordsIngested: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0,
      timestamp: new Date(),
    };

    try {
      const datasets = await this.fetchDatasets(year);
      
      for (const dataset of datasets) {
        try {
          const stored = await this.storeDataset(dataset);
          stored.isNew ? result.recordsIngested++ : result.recordsUpdated++;
        } catch (error) {
          result.recordsFailed++;
          result.errors.push(`Dataset ${dataset.id}: ${(error as Error).message}`);
        }
      }

    } catch (error) {
      result.recordsFailed++;
      result.errors.push((error as Error).message);
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  async ingestYearMonth(year: number, month: number): Promise<IngestionResult> {
    return this.ingestYear(year);
  }

  private async fetchDatasets(year: number): Promise<any[]> {
    try {
      const url = `${this.config.baseUrl}/package_search?fq=groups:${HDXConnector.COUNTRY_CODE}&rows=1000`;
      const response = await this.fetchWithRetry(url);
      const data = await response.json();
      
      if (data.success && data.result?.results) {
        // Filter by year based on metadata_created or metadata_modified
        return data.result.results.filter((d: any) => {
          const createdYear = new Date(d.metadata_created).getFullYear();
          const modifiedYear = new Date(d.metadata_modified).getFullYear();
          return createdYear === year || modifiedYear === year;
        });
      }
      
      return [];
    } catch (error) {
      this.log(`Failed to fetch datasets: ${(error as Error).message}`, 'warn');
      return [];
    }
  }

  private async storeDataset(dataset: any): Promise<{ isNew: boolean }> {
    try {
      const existing = await db
        .select()
        .from(libraryDocuments)
        .where(eq(libraryDocuments.externalId, `hdx-${dataset.id}`))
        .limit(1);

      const docData = {
        externalId: `hdx-${dataset.id}`,
        title: dataset.title || 'Untitled Dataset',
        titleAr: null,
        publisher: dataset.organization?.title || 'HDX',
        publicationDate: new Date(dataset.metadata_created),
        docType: 'Dataset',
        sourceUrl: `https://data.humdata.org/dataset/${dataset.name}`,
        pdfUrl: null,
        sectors: JSON.stringify(dataset.groups?.map((g: any) => g.title) || []),
        entities: JSON.stringify([dataset.organization?.title].filter(Boolean)),
        licenseFlag: dataset.license_id || 'unknown',
        status: 'published',
        metadata: JSON.stringify({
          hdxId: dataset.id,
          resourcesCount: dataset.num_resources,
          tags: dataset.tags?.map((t: any) => t.name) || [],
          fetchedAt: new Date().toISOString(),
        }),
        updatedAt: new Date(),
      };

      if (existing.length > 0) {
        await db.update(libraryDocuments).set(docData).where(eq(libraryDocuments.id, existing[0].id));
        return { isNew: false };
      } else {
        await db.insert(libraryDocuments).values({
          id: `hdx-${dataset.id.substring(0, 20)}`,
          ...docData,
          createdAt: new Date(),
        });
        return { isNew: true };
      }
    } catch (error) {
      throw error;
    }
  }
}

// Register all humanitarian connectors
const reliefWebConnector = new ReliefWebConnector();
const acledConnector = new ACLEDConnector();
const hdxConnector = new HDXConnector();

ConnectorRegistry.register('ReliefWeb', reliefWebConnector);
ConnectorRegistry.register('ACLED', acledConnector);
ConnectorRegistry.register('HDX', hdxConnector);

export { reliefWebConnector, acledConnector, hdxConnector };
