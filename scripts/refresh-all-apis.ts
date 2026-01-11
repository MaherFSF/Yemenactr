/**
 * YETO Platform - Full API Data Refresh Script
 * 
 * Runs all data connectors to fetch the latest data from external APIs.
 * This script should be run manually or via scheduler to keep data fresh.
 */

import { fetchWorldBankData } from "../server/connectors/worldBankConnector";
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
}

async function runConnector(
  name: string,
  fetchFn: () => Promise<{ success: boolean; recordsIngested: number; errors: string[] }>
): Promise<ConnectorResult> {
  const startTime = Date.now();
  console.log(`\n[${name}] Starting...`);
  
  try {
    const result = await fetchFn();
    const duration = Date.now() - startTime;
    
    console.log(`[${name}] Completed in ${(duration / 1000).toFixed(1)}s - ${result.recordsIngested} records`);
    if (result.errors.length > 0) {
      console.log(`[${name}] Errors: ${result.errors.join(', ')}`);
    }
    
    return {
      name,
      success: result.success,
      recordsIngested: result.recordsIngested,
      errors: result.errors,
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[${name}] Failed: ${errorMsg}`);
    
    return {
      name,
      success: false,
      recordsIngested: 0,
      errors: [errorMsg],
      duration,
    };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('YETO Platform - Full API Data Refresh');
  console.log(`Started at: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
  
  const currentYear = new Date().getFullYear();
  const results: ConnectorResult[] = [];
  
  // Run connectors in sequence to avoid overwhelming APIs
  const connectors: Array<{ name: string; fn: () => Promise<any> }> = [
    { 
      name: 'World Bank WDI',
      fn: () => fetchWorldBankData(2010, currentYear)
    },
    {
      name: 'OCHA FTS',
      fn: () => fetchOchaFtsData(2015, currentYear)
    },
    {
      name: 'HDX CKAN',
      fn: () => fetchHdxData()
    },
    {
      name: 'ReliefWeb',
      fn: () => fetchReliefWebData()
    },
    {
      name: 'FEWS NET',
      fn: () => fetchFewsNetData(currentYear)
    },
    {
      name: 'UNHCR',
      fn: () => ingestUNHCRData(currentYear)
    },
    {
      name: 'WHO',
      fn: () => ingestWHOData(currentYear)
    },
    {
      name: 'UNICEF',
      fn: () => ingestUNICEFData(currentYear)
    },
    {
      name: 'WFP',
      fn: () => ingestWFPData(currentYear)
    },
    {
      name: 'UNDP',
      fn: () => ingestUNDPData(currentYear)
    },
    {
      name: 'IATI',
      fn: () => ingestIATIData(currentYear)
    },
    {
      name: 'CBY (Central Bank of Yemen)',
      fn: () => ingestCBYData(currentYear)
    },
  ];
  
  for (const connector of connectors) {
    const result = await runConnector(connector.name, connector.fn);
    results.push(result);
    
    // Small delay between connectors to be nice to APIs
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  
  let totalRecords = 0;
  let successCount = 0;
  let failCount = 0;
  
  for (const result of results) {
    const status = result.success ? '✓' : '✗';
    console.log(`${status} ${result.name}: ${result.recordsIngested} records (${(result.duration / 1000).toFixed(1)}s)`);
    
    totalRecords += result.recordsIngested;
    if (result.success) successCount++;
    else failCount++;
  }
  
  console.log('\n' + '-'.repeat(60));
  console.log(`Total: ${totalRecords} records ingested`);
  console.log(`Success: ${successCount}/${connectors.length} connectors`);
  console.log(`Failed: ${failCount}/${connectors.length} connectors`);
  console.log(`Completed at: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
  
  // Exit with error code if any connector failed
  if (failCount > 0) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
