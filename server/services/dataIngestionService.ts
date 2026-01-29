/**
 * Data Ingestion Service
 * Handles ingestion from all sources in the source registry
 * Supports World Bank, IMF, UN agencies, and other data providers
 */

import { db } from '../db';
import { sql } from 'drizzle-orm';

// Source connector types
type ConnectorType = 
  | 'WORLD_BANK_API'
  | 'IMF_API'
  | 'UN_OCHA_API'
  | 'RELIEFWEB_API'
  | 'WFP_VAM_API'
  | 'FAO_STAT_API'
  | 'ILO_STAT_API'
  | 'ACLED_API'
  | 'CBY_SCRAPER'
  | 'MANUAL_UPLOAD'
  | 'RSS_FEED'
  | 'CUSTOM_API';

interface IngestionResult {
  sourceId: string;
  success: boolean;
  recordsIngested: number;
  recordsUpdated: number;
  recordsFailed: number;
  errors: string[];
  duration: number;
}

interface SourceConfig {
  id: string;
  name: string;
  connector: ConnectorType;
  apiEndpoint?: string;
  apiKey?: string;
  indicators?: string[];
  countryCode?: string;
  dateRange?: { start: string; end: string };
}

// World Bank API connector
async function ingestFromWorldBank(config: SourceConfig): Promise<IngestionResult> {
  const startTime = Date.now();
  const result: IngestionResult = {
    sourceId: config.id,
    success: false,
    recordsIngested: 0,
    recordsUpdated: 0,
    recordsFailed: 0,
    errors: [],
    duration: 0,
  };

  try {
    const indicators = config.indicators || [
      'NY.GDP.MKTP.CD',      // GDP (current US$)
      'NY.GDP.PCAP.CD',      // GDP per capita
      'FP.CPI.TOTL.ZG',      // Inflation, consumer prices
      'SL.UEM.TOTL.ZS',      // Unemployment rate
      'BN.CAB.XOKA.CD',      // Current account balance
      'NE.EXP.GNFS.ZS',      // Exports of goods and services
      'NE.IMP.GNFS.ZS',      // Imports of goods and services
    ];

    const countryCode = config.countryCode || 'YEM';
    
    for (const indicator of indicators) {
      try {
        const url = `https://api.worldbank.org/v2/country/${countryCode}/indicator/${indicator}?format=json&per_page=100&date=2010:2025`;
        const response = await fetch(url);
        
        if (!response.ok) {
          result.errors.push(`Failed to fetch ${indicator}: ${response.status}`);
          result.recordsFailed++;
          continue;
        }

        const data = await response.json();
        
        if (!data[1] || !Array.isArray(data[1])) {
          result.errors.push(`No data for ${indicator}`);
          continue;
        }

        for (const record of data[1]) {
          if (record.value === null) continue;
          
          // Insert or update in database
          await db.execute(sql`
            INSERT INTO indicator_data (
              indicator_code, source_id, country_code, year, value, 
              unit, source_name, fetched_at, created_at, updated_at
            ) VALUES (
              ${indicator}, ${config.id}, ${countryCode}, ${record.date},
              ${record.value}, ${record.unit || 'value'}, 'World Bank',
              NOW(), NOW(), NOW()
            )
            ON DUPLICATE KEY UPDATE
              value = VALUES(value),
              fetched_at = NOW(),
              updated_at = NOW()
          `);
          
          result.recordsIngested++;
        }
      } catch (err) {
        result.errors.push(`Error processing ${indicator}: ${err}`);
        result.recordsFailed++;
      }
    }

    result.success = result.recordsFailed < indicators.length;
  } catch (err) {
    result.errors.push(`World Bank ingestion failed: ${err}`);
  }

  result.duration = Date.now() - startTime;
  return result;
}

// IMF API connector
async function ingestFromIMF(config: SourceConfig): Promise<IngestionResult> {
  const startTime = Date.now();
  const result: IngestionResult = {
    sourceId: config.id,
    success: false,
    recordsIngested: 0,
    recordsUpdated: 0,
    recordsFailed: 0,
    errors: [],
    duration: 0,
  };

  try {
    // IMF Data API indicators
    const datasets = [
      { id: 'IFS', indicators: ['PCPI_IX', 'ENDA_XDC_USD_RATE'] }, // CPI, Exchange rate
      { id: 'DOT', indicators: ['TXG_FOB_USD', 'TMG_CIF_USD'] }, // Trade
    ];

    const countryCode = config.countryCode || '474'; // Yemen IMF code

    for (const dataset of datasets) {
      for (const indicator of dataset.indicators) {
        try {
          const url = `https://www.imf.org/external/datamapper/api/v1/${indicator}/${countryCode}`;
          const response = await fetch(url);
          
          if (!response.ok) {
            result.errors.push(`Failed to fetch IMF ${indicator}: ${response.status}`);
            result.recordsFailed++;
            continue;
          }

          const data = await response.json();
          
          if (data.values && data.values[indicator] && data.values[indicator][countryCode]) {
            const values = data.values[indicator][countryCode];
            
            for (const [year, value] of Object.entries(values)) {
              if (value === null) continue;
              
              await db.execute(sql`
                INSERT INTO indicator_data (
                  indicator_code, source_id, country_code, year, value,
                  unit, source_name, fetched_at, created_at, updated_at
                ) VALUES (
                  ${`IMF_${indicator}`}, ${config.id}, 'YEM', ${year},
                  ${value as number}, 'index', 'IMF',
                  NOW(), NOW(), NOW()
                )
                ON DUPLICATE KEY UPDATE
                  value = VALUES(value),
                  fetched_at = NOW(),
                  updated_at = NOW()
              `);
              
              result.recordsIngested++;
            }
          }
        } catch (err) {
          result.errors.push(`Error processing IMF ${indicator}: ${err}`);
          result.recordsFailed++;
        }
      }
    }

    result.success = result.recordsFailed === 0;
  } catch (err) {
    result.errors.push(`IMF ingestion failed: ${err}`);
  }

  result.duration = Date.now() - startTime;
  return result;
}

// UN OCHA API connector (Humanitarian Data Exchange)
async function ingestFromOCHA(config: SourceConfig): Promise<IngestionResult> {
  const startTime = Date.now();
  const result: IngestionResult = {
    sourceId: config.id,
    success: false,
    recordsIngested: 0,
    recordsUpdated: 0,
    recordsFailed: 0,
    errors: [],
    duration: 0,
  };

  try {
    // HDX API for Yemen datasets
    const url = 'https://data.humdata.org/api/3/action/package_search?q=yemen&rows=50';
    const response = await fetch(url);
    
    if (!response.ok) {
      result.errors.push(`Failed to fetch OCHA data: ${response.status}`);
      result.success = false;
      result.duration = Date.now() - startTime;
      return result;
    }

    const data = await response.json();
    
    if (data.success && data.result && data.result.results) {
      for (const dataset of data.result.results) {
        try {
          // Store dataset metadata
          await db.execute(sql`
            INSERT INTO library_documents (
              title, titleAr, publisher, docType, sourceUrl, 
              publicationDate, sectors, status, createdAt, updatedAt
            ) VALUES (
              ${dataset.title}, ${dataset.title}, 'UN OCHA',
              'dataset', ${`https://data.humdata.org/dataset/${dataset.name}`},
              ${dataset.metadata_created ? new Date(dataset.metadata_created) : new Date()},
              ${JSON.stringify(['humanitarian'])}, 'published',
              NOW(), NOW()
            )
            ON DUPLICATE KEY UPDATE
              updatedAt = NOW()
          `);
          
          result.recordsIngested++;
        } catch (err) {
          result.errors.push(`Error storing OCHA dataset ${dataset.name}: ${err}`);
          result.recordsFailed++;
        }
      }
    }

    result.success = result.recordsFailed === 0;
  } catch (err) {
    result.errors.push(`OCHA ingestion failed: ${err}`);
  }

  result.duration = Date.now() - startTime;
  return result;
}

// ReliefWeb API connector
async function ingestFromReliefWeb(config: SourceConfig): Promise<IngestionResult> {
  const startTime = Date.now();
  const result: IngestionResult = {
    sourceId: config.id,
    success: false,
    recordsIngested: 0,
    recordsUpdated: 0,
    recordsFailed: 0,
    errors: [],
    duration: 0,
  };

  try {
    const url = 'https://api.reliefweb.int/v1/reports?appname=yeto&filter[field]=country&filter[value]=Yemen&limit=100&sort[]=date:desc';
    const response = await fetch(url);
    
    if (!response.ok) {
      result.errors.push(`Failed to fetch ReliefWeb data: ${response.status}`);
      result.success = false;
      result.duration = Date.now() - startTime;
      return result;
    }

    const data = await response.json();
    
    if (data.data && Array.isArray(data.data)) {
      for (const report of data.data) {
        try {
          const fields = report.fields || {};
          
          await db.execute(sql`
            INSERT INTO library_documents (
              title, titleAr, publisher, docType, sourceUrl,
              publicationDate, summary, sectors, status, createdAt, updatedAt
            ) VALUES (
              ${fields.title || 'Untitled'}, ${fields.title || 'Untitled'},
              ${fields.source?.[0]?.name || 'ReliefWeb'}, 'report',
              ${fields.url_alias || fields.url || ''},
              ${fields.date?.created ? new Date(fields.date.created) : new Date()},
              ${fields.body || ''}, ${JSON.stringify(['humanitarian'])},
              'published', NOW(), NOW()
            )
            ON DUPLICATE KEY UPDATE
              updatedAt = NOW()
          `);
          
          result.recordsIngested++;
        } catch (err) {
          result.errors.push(`Error storing ReliefWeb report: ${err}`);
          result.recordsFailed++;
        }
      }
    }

    result.success = result.recordsFailed === 0;
  } catch (err) {
    result.errors.push(`ReliefWeb ingestion failed: ${err}`);
  }

  result.duration = Date.now() - startTime;
  return result;
}

// WFP VAM (Vulnerability Analysis and Mapping) connector
async function ingestFromWFP(config: SourceConfig): Promise<IngestionResult> {
  const startTime = Date.now();
  const result: IngestionResult = {
    sourceId: config.id,
    success: false,
    recordsIngested: 0,
    recordsUpdated: 0,
    recordsFailed: 0,
    errors: [],
    duration: 0,
  };

  try {
    // WFP DataViz API for food prices
    const url = 'https://dataviz.vam.wfp.org/api/v1/commodities/list?iso3=YEM';
    const response = await fetch(url);
    
    if (!response.ok) {
      result.errors.push(`Failed to fetch WFP data: ${response.status}`);
      result.success = false;
      result.duration = Date.now() - startTime;
      return result;
    }

    const data = await response.json();
    
    if (Array.isArray(data)) {
      for (const commodity of data) {
        try {
          // Store commodity price data
          await db.execute(sql`
            INSERT INTO price_data (
              commodity_name, commodity_code, source_id, country_code,
              price, currency, unit, market, date, source_name,
              created_at, updated_at
            ) VALUES (
              ${commodity.name || 'Unknown'}, ${commodity.id || ''},
              ${config.id}, 'YEM', ${commodity.price || 0},
              'YER', ${commodity.unit || 'kg'}, ${commodity.market || 'National'},
              NOW(), 'WFP VAM', NOW(), NOW()
            )
            ON DUPLICATE KEY UPDATE
              price = VALUES(price),
              updated_at = NOW()
          `);
          
          result.recordsIngested++;
        } catch (err) {
          result.errors.push(`Error storing WFP commodity: ${err}`);
          result.recordsFailed++;
        }
      }
    }

    result.success = result.recordsFailed === 0;
  } catch (err) {
    result.errors.push(`WFP ingestion failed: ${err}`);
  }

  result.duration = Date.now() - startTime;
  return result;
}

// FAO STAT connector
async function ingestFromFAO(config: SourceConfig): Promise<IngestionResult> {
  const startTime = Date.now();
  const result: IngestionResult = {
    sourceId: config.id,
    success: false,
    recordsIngested: 0,
    recordsUpdated: 0,
    recordsFailed: 0,
    errors: [],
    duration: 0,
  };

  try {
    // FAO API for agricultural data
    const url = 'https://fenixservices.fao.org/faostat/api/v1/en/data/QCL?area=249&year=2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023&output_type=objects';
    const response = await fetch(url);
    
    if (!response.ok) {
      result.errors.push(`Failed to fetch FAO data: ${response.status}`);
      result.success = false;
      result.duration = Date.now() - startTime;
      return result;
    }

    const data = await response.json();
    
    if (data.data && Array.isArray(data.data)) {
      for (const record of data.data) {
        try {
          await db.execute(sql`
            INSERT INTO indicator_data (
              indicator_code, source_id, country_code, year, value,
              unit, source_name, fetched_at, created_at, updated_at
            ) VALUES (
              ${`FAO_${record.Item_Code || 'UNKNOWN'}`}, ${config.id}, 'YEM',
              ${record.Year || 2020}, ${record.Value || 0},
              ${record.Unit || 'tonnes'}, 'FAO',
              NOW(), NOW(), NOW()
            )
            ON DUPLICATE KEY UPDATE
              value = VALUES(value),
              fetched_at = NOW(),
              updated_at = NOW()
          `);
          
          result.recordsIngested++;
        } catch (err) {
          result.errors.push(`Error storing FAO record: ${err}`);
          result.recordsFailed++;
        }
      }
    }

    result.success = result.recordsFailed === 0;
  } catch (err) {
    result.errors.push(`FAO ingestion failed: ${err}`);
  }

  result.duration = Date.now() - startTime;
  return result;
}

// ACLED (Armed Conflict Location & Event Data) connector
async function ingestFromACLED(config: SourceConfig): Promise<IngestionResult> {
  const startTime = Date.now();
  const result: IngestionResult = {
    sourceId: config.id,
    success: false,
    recordsIngested: 0,
    recordsUpdated: 0,
    recordsFailed: 0,
    errors: [],
    duration: 0,
  };

  try {
    // Note: ACLED requires API key - this is a placeholder
    const apiKey = config.apiKey || process.env.ACLED_API_KEY;
    
    if (!apiKey) {
      result.errors.push('ACLED API key not configured');
      result.success = false;
      result.duration = Date.now() - startTime;
      return result;
    }

    const url = `https://api.acleddata.com/acled/read?key=${apiKey}&email=yeto@example.com&country=Yemen&limit=1000`;
    const response = await fetch(url);
    
    if (!response.ok) {
      result.errors.push(`Failed to fetch ACLED data: ${response.status}`);
      result.success = false;
      result.duration = Date.now() - startTime;
      return result;
    }

    const data = await response.json();
    
    if (data.data && Array.isArray(data.data)) {
      for (const event of data.data) {
        try {
          await db.execute(sql`
            INSERT INTO conflict_events (
              event_id, event_date, event_type, sub_event_type,
              actor1, actor2, location, admin1, admin2,
              latitude, longitude, fatalities, notes,
              source_id, source_name, created_at, updated_at
            ) VALUES (
              ${event.data_id}, ${event.event_date ? new Date(event.event_date) : new Date()},
              ${event.event_type || 'Unknown'}, ${event.sub_event_type || ''},
              ${event.actor1 || ''}, ${event.actor2 || ''},
              ${event.location || ''}, ${event.admin1 || ''}, ${event.admin2 || ''},
              ${event.latitude || 0}, ${event.longitude || 0},
              ${event.fatalities || 0}, ${event.notes || ''},
              ${config.id}, 'ACLED', NOW(), NOW()
            )
            ON DUPLICATE KEY UPDATE
              updated_at = NOW()
          `);
          
          result.recordsIngested++;
        } catch (err) {
          result.errors.push(`Error storing ACLED event: ${err}`);
          result.recordsFailed++;
        }
      }
    }

    result.success = result.recordsFailed === 0;
  } catch (err) {
    result.errors.push(`ACLED ingestion failed: ${err}`);
  }

  result.duration = Date.now() - startTime;
  return result;
}

// Main ingestion orchestrator
export async function runIngestion(sourceIds?: string[]): Promise<IngestionResult[]> {
  const results: IngestionResult[] = [];
  
  // Get sources from registry
  let sources: any[];
  if (sourceIds && sourceIds.length > 0) {
    const placeholders = sourceIds.map(() => '?').join(',');
    const queryResult = await db.execute(sql`
      SELECT * FROM source_registry WHERE source_id IN (${sql.raw(placeholders)}) AND is_active = 1
    `);
    sources = (queryResult as any)[0] || [];
  } else {
    const queryResult = await db.execute(sql`
      SELECT * FROM source_registry WHERE is_active = 1 ORDER BY tier ASC
    `);
    sources = (queryResult as any)[0] || [];
  }
  
  for (const source of sources) {
    const config: SourceConfig = {
      id: source.source_id,
      name: source.name,
      connector: source.connector_type as ConnectorType,
      apiEndpoint: source.api_endpoint,
      apiKey: source.api_key,
      countryCode: 'YEM',
    };
    
    let result: IngestionResult;
    
    switch (config.connector) {
      case 'WORLD_BANK_API':
        result = await ingestFromWorldBank(config);
        break;
      case 'IMF_API':
        result = await ingestFromIMF(config);
        break;
      case 'UN_OCHA_API':
        result = await ingestFromOCHA(config);
        break;
      case 'RELIEFWEB_API':
        result = await ingestFromReliefWeb(config);
        break;
      case 'WFP_VAM_API':
        result = await ingestFromWFP(config);
        break;
      case 'FAO_STAT_API':
        result = await ingestFromFAO(config);
        break;
      case 'ACLED_API':
        result = await ingestFromACLED(config);
        break;
      default:
        result = {
          sourceId: config.id,
          success: false,
          recordsIngested: 0,
          recordsUpdated: 0,
          recordsFailed: 0,
          errors: [`Unknown connector type: ${config.connector}`],
          duration: 0,
        };
    }
    
    // Log ingestion run
    await db.execute(sql`
      INSERT INTO ingestion_runs (
        source_id, status, records_ingested, records_updated,
        records_failed, errors, duration_ms, started_at, completed_at
      ) VALUES (
        ${config.id}, ${result.success ? 'SUCCESS' : 'FAILED'},
        ${result.recordsIngested}, ${result.recordsUpdated},
        ${result.recordsFailed}, ${JSON.stringify(result.errors)},
        ${result.duration}, NOW(), NOW()
      )
    `);
    
    results.push(result);
  }
  
  return results;
}

// Get ingestion status
export async function getIngestionStatus(): Promise<{
  totalSources: number;
  activeSources: number;
  lastIngestionRun: Date | null;
  recentErrors: string[];
  sourcesByTier: Record<string, number>;
}> {
  const totalResult = await db.execute(sql`SELECT COUNT(*) as count FROM source_registry`);
  const activeResult = await db.execute(sql`SELECT COUNT(*) as count FROM source_registry WHERE is_active = 1`);
  const lastRunResult = await db.execute(sql`SELECT MAX(completed_at) as last_run FROM ingestion_runs`);
  const errorsResult = await db.execute(sql`
    SELECT errors FROM ingestion_runs 
    WHERE status = 'FAILED' 
    ORDER BY completed_at DESC 
    LIMIT 5
  `);
  const tierResult = await db.execute(sql`
    SELECT tier, COUNT(*) as count FROM source_registry GROUP BY tier
  `);
  
  const sourcesByTier: Record<string, number> = {};
  for (const row of (tierResult as any)[0] || []) {
    sourcesByTier[row.tier] = row.count;
  }
  
  const recentErrors: string[] = [];
  for (const row of (errorsResult as any)[0] || []) {
    try {
      const errors = JSON.parse(row.errors || '[]');
      recentErrors.push(...errors.slice(0, 2));
    } catch {
      // Ignore parse errors
    }
  }
  
  return {
    totalSources: (totalResult as any)[0]?.[0]?.count || 0,
    activeSources: (activeResult as any)[0]?.[0]?.count || 0,
    lastIngestionRun: (lastRunResult as any)[0]?.[0]?.last_run || null,
    recentErrors: recentErrors.slice(0, 10),
    sourcesByTier,
  };
}

export default {
  runIngestion,
  getIngestionStatus,
  ingestFromWorldBank,
  ingestFromIMF,
  ingestFromOCHA,
  ingestFromReliefWeb,
  ingestFromWFP,
  ingestFromFAO,
  ingestFromACLED,
};
