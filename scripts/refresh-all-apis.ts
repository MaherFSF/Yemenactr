/**
 * YETO Platform - Public API Refresh, Backfill & Continuous Sync
 *
 * - Verifies connectivity for every public API connector before ingestion.
 * - Performs historical backfill from a configurable start year.
 * - Supports one-shot refresh or continuous dynamic updates on an interval.
 */

import { fetchWorldBankData } from "../server/connectors/WorldBankConnector";
import { fetchOchaFtsData } from "../server/connectors/ochaFtsConnector";
import { fetchHdxData } from "../server/connectors/hdxCkanConnector";
import { fetchReliefWebData } from "../server/connectors/reliefWebConnector";
import { fetchFewsNetData } from "../server/connectors/fewsNetConnector";
import { ingestUNHCRData } from "../server/connectors/unhcrConnector";
import { ingestWHOData } from "../server/connectors/whoConnector";
import { ingestUNICEFData } from "../server/connectors/unicefConnector";
import { ingestWFPData } from "../server/connectors/wfpConnector";
import { ingestUNDPData } from "../server/connectors/undpConnector";
import { ingestIATIData } from "../server/connectors/iatiConnector";
import { ingestCBYData } from "../server/connectors/cbyConnector";

interface ConnectorResult {
  name: string;
  success: boolean;
  recordsIngested: number;
  errors: string[];
  duration: number;
  healthCheckPassed: boolean;
}

interface ConnectorDefinition {
  name: string,
  healthUrl: string,
  backfillStartYear: number,
  refreshWindowYears: number,
  fn: (startYear: number, endYear: number) => Promise<{ success: boolean; recordsIngested: number; errors: string[] }>
}

interface RuntimeConfig {
  backfillStartYear: number;
  continuous: boolean;
  intervalMinutes: number;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function parseRuntimeConfig(): RuntimeConfig {
  const currentYear = new Date().getFullYear();
  const args = process.argv.slice(2);

  const getArg = (name: string): string | undefined => {
    const prefixed = args.find((arg) => arg.startsWith(`--${name}=`));
    return prefixed?.split("=")[1];
  };

  const backfillStartRaw = getArg("backfill-start-year");
  const backfillStartYear = backfillStartRaw ? Number(backfillStartRaw) : 2010;

  if (!Number.isFinite(backfillStartYear) || backfillStartYear < 1960 || backfillStartYear > currentYear) {
    throw new Error(`Invalid --backfill-start-year value: ${backfillStartRaw ?? "undefined"}`);
  }

  const intervalRaw = getArg("interval-minutes");
  const intervalMinutes = intervalRaw ? Number(intervalRaw) : 180;
  if (!Number.isFinite(intervalMinutes) || intervalMinutes <= 0) {
    throw new Error(`Invalid --interval-minutes value: ${intervalRaw ?? "undefined"}`);
  }

  return {
    backfillStartYear,
    continuous: args.includes("--continuous"),
    intervalMinutes,
  };
}

async function runHealthCheck(name: string, healthUrl: string): Promise<boolean> {
  try {
    const response = await fetch(healthUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      console.warn(`[${name}] Health check failed with HTTP ${response.status}: ${healthUrl}`);
      return false;
    }
    return true;
  } catch (error) {
    console.warn(`[${name}] Health check failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    return false;
  }
}

async function runConnector(
  connector: ConnectorDefinition,
  startYear: number,
  endYear: number,
  fetchFn: () => Promise<{ success: boolean; recordsIngested: number; errors: string[] }>
): Promise<ConnectorResult> {
  const startTime = Date.now();
  console.log(`\n[${connector.name}] Starting (${startYear}-${endYear})...`);
  const healthCheckPassed = await runHealthCheck(connector.name, connector.healthUrl);
  if (!healthCheckPassed) {
    return {
      name: connector.name,
      success: false,
      recordsIngested: 0,
      errors: ["Health check failed"],
      duration: Date.now() - startTime,
      healthCheckPassed,
    };
  }
  
  try {
    const result = await fetchFn();
    const duration = Date.now() - startTime;
    
    console.log(`[${connector.name}] Completed in ${(duration / 1000).toFixed(1)}s - ${result.recordsIngested} records`);
    if (result.errors.length > 0) {
      console.log(`[${connector.name}] Errors: ${result.errors.join(", ")}`);
    }
    
    return {
      name: connector.name,
      success: result.success,
      recordsIngested: result.recordsIngested,
      errors: result.errors,
      duration,
      healthCheckPassed,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[${connector.name}] Failed: ${errorMsg}`);
    
    return {
      name: connector.name,
      success: false,
      recordsIngested: 0,
      errors: [errorMsg],
      duration,
      healthCheckPassed,
    };
  }
}

async function runFullRefresh(config: RuntimeConfig) {
  console.log('='.repeat(60));
  console.log('YETO Platform - Public API Refresh');
  console.log(`Started at: ${new Date().toISOString()}`);
  console.log(`Historical backfill start year: ${config.backfillStartYear}`);
  console.log('='.repeat(60));
  
  const currentYear = new Date().getFullYear();
  const results: ConnectorResult[] = [];
  
  // Run connectors in sequence to avoid overwhelming APIs.
  const connectors: ConnectorDefinition[] = [
    { 
      name: 'World Bank WDI',
      healthUrl: 'https://api.worldbank.org/v2/country/YEM?format=json',
      backfillStartYear: config.backfillStartYear,
      refreshWindowYears: 4,
      fn: (startYear, endYear) => fetchWorldBankData(startYear, endYear)
    },
    {
      name: 'OCHA FTS',
      healthUrl: 'https://api.hpc.tools/v1/public/fts/flow?planCountry=YEM&year=2024&groupby=year',
      backfillStartYear: Math.max(config.backfillStartYear, 2015),
      refreshWindowYears: 3,
      fn: (startYear, endYear) => fetchOchaFtsData(startYear, endYear)
    },
    {
      name: 'HDX CKAN',
      healthUrl: 'https://data.humdata.org/api/3/action/status_show',
      backfillStartYear: config.backfillStartYear,
      refreshWindowYears: 2,
      fn: () => fetchHdxData()
    },
    {
      name: 'ReliefWeb',
      healthUrl: 'https://api.reliefweb.int/v1/reports?appname=yeto-observatory&limit=1',
      backfillStartYear: config.backfillStartYear,
      refreshWindowYears: 2,
      fn: () => fetchReliefWebData()
    },
    {
      name: 'FEWS NET',
      healthUrl: 'https://fdw.fews.net/api/ipcphase/?country_code=YE',
      backfillStartYear: Math.max(config.backfillStartYear, 2016),
      refreshWindowYears: 2,
      fn: (startYear, endYear) => fetchFewsNetData(startYear, endYear)
    },
    {
      name: 'UNHCR',
      healthUrl: 'https://api.unhcr.org/population/v1/countries',
      backfillStartYear: config.backfillStartYear,
      refreshWindowYears: 2,
      fn: (_startYear, endYear) => ingestUNHCRData(endYear)
    },
    {
      name: 'WHO',
      healthUrl: 'https://ghoapi.azureedge.net/api/WHOSIS_000001?$filter=SpatialDim%20eq%20%27YEM%27&$top=1',
      backfillStartYear: config.backfillStartYear,
      refreshWindowYears: 2,
      fn: (_startYear, endYear) => ingestWHOData(endYear)
    },
    {
      name: 'UNICEF',
      healthUrl: 'https://sdmx.data.unicef.org/ws/public/sdmxapi/rest/dataflow',
      backfillStartYear: config.backfillStartYear,
      refreshWindowYears: 2,
      fn: (_startYear, endYear) => ingestUNICEFData(endYear)
    },
    {
      name: 'WFP',
      healthUrl: 'https://api.vam.wfp.org/general/countries',
      backfillStartYear: config.backfillStartYear,
      refreshWindowYears: 1,
      fn: (_startYear, endYear) => ingestWFPData(endYear)
    },
    {
      name: 'UNDP',
      healthUrl: 'https://api.undp.org/data/v1/indicators',
      backfillStartYear: config.backfillStartYear,
      refreshWindowYears: 2,
      fn: (_startYear, endYear) => ingestUNDPData(endYear)
    },
    {
      name: 'IATI',
      healthUrl: 'https://api.iatistandard.org/datastore/activity/select?q=recipient_country_code:YE&rows=1',
      backfillStartYear: config.backfillStartYear,
      refreshWindowYears: 2,
      fn: (_startYear, endYear) => ingestIATIData(endYear)
    },
    {
      name: 'CBY (Central Bank of Yemen)',
      healthUrl: 'https://cby-ye.com/',
      backfillStartYear: Math.max(config.backfillStartYear, 2016),
      refreshWindowYears: 1,
      fn: (_startYear, endYear) => ingestCBYData(endYear)
    },
  ];
  
  for (const connector of connectors) {
    const startYear = connector.backfillStartYear;
    const refreshStartYear = Math.max(startYear, currentYear - connector.refreshWindowYears);
    const result = await runConnector(
      connector,
      refreshStartYear,
      currentYear,
      () => connector.fn(refreshStartYear, currentYear),
    );
    results.push(result);
    
    // Small delay between connectors to be nice to APIs
    await sleep(1000);
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  
  let totalRecords = 0;
  let successCount = 0;
  let failCount = 0;
  let healthCheckFailures = 0;
  
  for (const result of results) {
    const status = result.success ? '✓' : '✗';
    const health = result.healthCheckPassed ? 'healthy' : 'health-check-failed';
    console.log(`${status} ${result.name}: ${result.recordsIngested} records (${(result.duration / 1000).toFixed(1)}s, ${health})`);
    
    totalRecords += result.recordsIngested;
    if (result.success) {
      successCount++;
    } else {
      failCount++;
      if (!result.healthCheckPassed) {
        healthCheckFailures++;
      }
    }
  }
  
  console.log('\n' + '-'.repeat(60));
  console.log(`Total: ${totalRecords} records ingested`);
  console.log(`Success: ${successCount}/${connectors.length} connectors`);
  console.log(`Failed: ${failCount}/${connectors.length} connectors`);
  if (healthCheckFailures > 0) {
    console.log(`Health check failures: ${healthCheckFailures}`);
  }
  console.log(`Completed at: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
  
  // Exit with error code if any connector failed
  if (failCount > 0) {
    throw new Error(`${failCount} connector(s) failed in this refresh cycle`);
  }
}

async function main() {
  const config = parseRuntimeConfig();

  if (!config.continuous) {
    await runFullRefresh(config);
    return;
  }

  console.log(`Running in continuous mode every ${config.intervalMinutes} minute(s)...`);
  while (true) {
    try {
      await runFullRefresh(config);
    } catch (error) {
      console.error("Refresh cycle ended with errors:", error);
    }
    await sleep(config.intervalMinutes * 60 * 1000);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
