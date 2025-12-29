/**
 * Backfill script for new API connectors
 * Run with: npx tsx scripts/run-new-connectors-backfill.ts
 */

import { fetchWorldBankData } from '../server/connectors/worldBankConnector';
import { fetchOchaFtsData } from '../server/connectors/ochaFtsConnector';
import { fetchHdxData } from '../server/connectors/hdxCkanConnector';
import { fetchSanctionsData } from '../server/connectors/sanctionsConnector';
import { fetchReliefWebData } from '../server/connectors/reliefWebConnector';
import { fetchFewsNetData } from '../server/connectors/fewsNetConnector';

async function runBackfill() {
  console.log('='.repeat(60));
  console.log('YETO Platform - New Connectors Historical Backfill');
  console.log('='.repeat(60));
  console.log(`Started at: ${new Date().toISOString()}`);
  console.log('');

  const results: Array<{ connector: string; success: boolean; records: number; errors: string[] }> = [];

  // 1. World Bank (1990-2024)
  console.log('\n[1/6] World Bank WDI...');
  try {
    const wb = await fetchWorldBankData(2000, 2024);
    results.push({ connector: 'World Bank', success: wb.success, records: wb.recordsIngested, errors: wb.errors });
    console.log(`   ✓ ${wb.recordsIngested} records ingested`);
  } catch (error) {
    results.push({ connector: 'World Bank', success: false, records: 0, errors: [String(error)] });
    console.log(`   ✗ Error: ${error}`);
  }

  // 2. OCHA FTS (2015-2024)
  console.log('\n[2/6] OCHA Financial Tracking Service...');
  try {
    const fts = await fetchOchaFtsData(2015, 2024);
    results.push({ connector: 'OCHA FTS', success: fts.success, records: fts.recordsIngested, errors: fts.errors });
    console.log(`   ✓ ${fts.recordsIngested} records ingested`);
  } catch (error) {
    results.push({ connector: 'OCHA FTS', success: false, records: 0, errors: [String(error)] });
    console.log(`   ✗ Error: ${error}`);
  }

  // 3. HDX CKAN (WFP, IOM DTM)
  console.log('\n[3/6] HDX CKAN (WFP Food Prices, IOM DTM)...');
  try {
    const hdx = await fetchHdxData();
    results.push({ connector: 'HDX CKAN', success: hdx.success, records: hdx.recordsIngested, errors: hdx.errors });
    console.log(`   ✓ ${hdx.recordsIngested} records ingested`);
  } catch (error) {
    results.push({ connector: 'HDX CKAN', success: false, records: 0, errors: [String(error)] });
    console.log(`   ✗ Error: ${error}`);
  }

  // 4. Sanctions (OFAC + EU)
  console.log('\n[4/6] Sanctions (OFAC + EU)...');
  try {
    const sanctions = await fetchSanctionsData();
    results.push({ connector: 'Sanctions', success: sanctions.success, records: sanctions.recordsIngested, errors: sanctions.errors });
    console.log(`   ✓ ${sanctions.recordsIngested} records ingested`);
  } catch (error) {
    results.push({ connector: 'Sanctions', success: false, records: 0, errors: [String(error)] });
    console.log(`   ✗ Error: ${error}`);
  }

  // 5. ReliefWeb
  console.log('\n[5/6] ReliefWeb...');
  try {
    const rw = await fetchReliefWebData();
    results.push({ connector: 'ReliefWeb', success: rw.success, records: rw.recordsIngested, errors: rw.errors });
    console.log(`   ✓ ${rw.recordsIngested} records ingested`);
  } catch (error) {
    results.push({ connector: 'ReliefWeb', success: false, records: 0, errors: [String(error)] });
    console.log(`   ✗ Error: ${error}`);
  }

  // 6. FEWS NET (2015-2024)
  console.log('\n[6/6] FEWS NET Food Security...');
  try {
    const fews = await fetchFewsNetData(2015, 2024);
    results.push({ connector: 'FEWS NET', success: fews.success, records: fews.recordsIngested, errors: fews.errors });
    console.log(`   ✓ ${fews.recordsIngested} records ingested`);
  } catch (error) {
    results.push({ connector: 'FEWS NET', success: false, records: 0, errors: [String(error)] });
    console.log(`   ✗ Error: ${error}`);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('BACKFILL SUMMARY');
  console.log('='.repeat(60));
  
  let totalRecords = 0;
  let successCount = 0;
  
  for (const r of results) {
    const status = r.success ? '✓' : '✗';
    console.log(`${status} ${r.connector}: ${r.records} records`);
    if (r.errors.length > 0) {
      console.log(`   Errors: ${r.errors.slice(0, 3).join(', ')}`);
    }
    totalRecords += r.records;
    if (r.success) successCount++;
  }
  
  console.log('');
  console.log(`Total: ${totalRecords} records from ${successCount}/${results.length} connectors`);
  console.log(`Completed at: ${new Date().toISOString()}`);
}

runBackfill().catch(console.error);
