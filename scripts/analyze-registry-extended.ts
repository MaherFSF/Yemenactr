/**
 * Analyze Extended Registry Data
 */

import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGISTRY_PATH = path.join(__dirname, '../data/YETO_Sources_Universe_Master_FINAL_v1_2.xlsx');

async function analyzeExtended() {
  const workbook = XLSX.readFile(REGISTRY_PATH);
  
  // Parse SOURCES_MASTER_EXT (the extended authoritative sheet)
  const extSheet = workbook.Sheets['SOURCES_MASTER_EXT'];
  const extData = XLSX.utils.sheet_to_json(extSheet, { defval: null });
  
  console.log('📊 SOURCES_MASTER_EXT Analysis:');
  console.log(`Total sources: ${extData.length}`);
  
  if (extData.length > 0) {
    console.log('\n📋 All Columns:');
    const headers = Object.keys(extData[0]);
    headers.forEach((h, idx) => console.log(`  ${idx + 1}. ${h}`));
    
    console.log('\n📝 Sample (first entry):');
    console.log(JSON.stringify(extData[0], null, 2));
  }
  
  // Parse METADATA_GAPS
  const gapsSheet = workbook.Sheets['METADATA_GAPS'];
  const gapsData = XLSX.utils.sheet_to_json(gapsSheet, { defval: null });
  
  console.log('\n\n📊 METADATA_GAPS Analysis:');
  console.log(`Total gap items: ${gapsData.length}`);
  
  if (gapsData.length > 0) {
    console.log('\n📋 Gap Columns:');
    const gapHeaders = Object.keys(gapsData[0]);
    gapHeaders.forEach((h, idx) => console.log(`  ${idx + 1}. ${h}`));
    
    console.log('\n📝 Sample Gap (first 3):');
    gapsData.slice(0, 3).forEach((gap, idx) => {
      console.log(`\n${idx + 1}. ${JSON.stringify(gap, null, 2)}`);
    });
  }
  
  // Parse REQUIRED_FIELDS
  const reqSheet = workbook.Sheets['REQUIRED_FIELDS'];
  const reqData = XLSX.utils.sheet_to_json(reqSheet, { defval: null });
  
  console.log('\n\n📊 REQUIRED_FIELDS Analysis:');
  console.log(`Total field requirements: ${reqData.length}`);
  
  if (reqData.length > 0) {
    console.log('\n📝 Required Fields:');
    reqData.forEach((req: any) => {
      console.log(`  - ${req.field_name || req.Field || req.column_name || JSON.stringify(req)}`);
    });
  }
  
  // Parse REGISTRY_LINT
  const lintSheet = workbook.Sheets['REGISTRY_LINT'];
  const lintData = XLSX.utils.sheet_to_json(lintSheet, { defval: null });
  
  console.log('\n\n📊 REGISTRY_LINT Analysis:');
  console.log(`Total lint entries: ${lintData.length}`);
  
  if (lintData.length > 0) {
    console.log('\n📋 Lint Columns:');
    const lintHeaders = Object.keys(lintData[0]);
    lintHeaders.forEach((h, idx) => console.log(`  ${idx + 1}. ${h}`));
    
    console.log('\n📝 Sample Lint (first):');
    console.log(JSON.stringify(lintData[0], null, 2));
  }
  
  // Save all for further analysis
  fs.writeFileSync(
    path.join(__dirname, '../data/registry-extended-full.json'),
    JSON.stringify({
      sources_master_ext: extData,
      metadata_gaps: gapsData,
      required_fields: reqData,
      registry_lint: lintData
    }, null, 2)
  );
  
  console.log('\n\n✅ Full analysis saved to data/registry-extended-full.json');
}

analyzeExtended().catch(console.error);
