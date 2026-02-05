/**
 * Parse YETO Source Registry Excel File
 * Reads the authoritative source registry and prepares it for database seeding
 */

import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGISTRY_PATH = path.join(__dirname, '../data/YETO_Sources_Universe_Master_FINAL_v1_2.xlsx');

interface RegistryRow {
  [key: string]: any;
}

async function parseRegistry() {
  console.log('📋 Parsing YETO Source Registry...');
  console.log('File:', REGISTRY_PATH);

  // Check if file exists
  if (!fs.existsSync(REGISTRY_PATH)) {
    console.error('❌ Registry file not found:', REGISTRY_PATH);
    process.exit(1);
  }

  // Read the Excel file
  const workbook = XLSX.readFile(REGISTRY_PATH);
  
  console.log('\n📊 Workbook Structure:');
  console.log('Sheet names:', workbook.SheetNames);

  // Look for the authoritative sheet
  const sourcesMasterSheet = workbook.SheetNames.find(
    name => name.toUpperCase().includes('SOURCES_MASTER') || name.toUpperCase().includes('MASTER')
  );

  if (!sourcesMasterSheet) {
    console.error('❌ Could not find SOURCES_MASTER sheet');
    console.log('Available sheets:', workbook.SheetNames);
    process.exit(1);
  }

  console.log(`\n✅ Found authoritative sheet: "${sourcesMasterSheet}"`);

  // Parse the sheet
  const worksheet = workbook.Sheets[sourcesMasterSheet];
  const data: RegistryRow[] = XLSX.utils.sheet_to_json(worksheet, { defval: null });

  console.log(`\n📈 Parsed ${data.length} source entries`);

  // Analyze structure
  if (data.length > 0) {
    console.log('\n📋 Column Headers:');
    const headers = Object.keys(data[0]);
    headers.forEach((header, idx) => {
      console.log(`  ${idx + 1}. ${header}`);
    });

    console.log('\n📝 Sample Entry (first row):');
    console.log(JSON.stringify(data[0], null, 2));

    console.log('\n📊 Statistics:');
    console.log(`  Total sources: ${data.length}`);
    
    // Check for required fields
    const requiredFields = [
      'source_id', 'sourceId', 'name', 'publisher', 'access_method', 
      'accessType', 'tier', 'status', 'url', 'api_url'
    ];
    
    const foundFields = requiredFields.filter(field => 
      headers.some(h => h.toLowerCase().includes(field.toLowerCase()))
    );
    
    console.log(`  Found required-like fields: ${foundFields.length}/${requiredFields.length}`);
    foundFields.forEach(f => console.log(`    ✓ ${f}`));
  }

  // Check for other tabs
  console.log('\n📑 Other Sheets:');
  workbook.SheetNames.forEach(sheetName => {
    if (sheetName !== sourcesMasterSheet) {
      const sheet = workbook.Sheets[sheetName];
      const sheetData = XLSX.utils.sheet_to_json(sheet, { defval: null });
      console.log(`  - ${sheetName}: ${sheetData.length} rows`);
      
      if (sheetName.toUpperCase().includes('REQUIRED') || 
          sheetName.toUpperCase().includes('FIELDS')) {
        console.log('    → This appears to be a requirements/contract sheet');
      }
      if (sheetName.toUpperCase().includes('GAP') || 
          sheetName.toUpperCase().includes('METADATA')) {
        console.log('    → This appears to be a gap/metadata issues sheet');
      }
      if (sheetName.toUpperCase().includes('LINT')) {
        console.log('    → This appears to be a validation/lint sheet');
      }
    }
  });

  // Save parsed data for inspection
  const outputPath = path.join(__dirname, '../data/parsed-registry.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    sheetName: sourcesMasterSheet,
    totalRows: data.length,
    columns: Object.keys(data[0] || {}),
    data: data,
    allSheets: workbook.SheetNames
  }, null, 2));

  console.log(`\n✅ Parsed data saved to: ${outputPath}`);

  return {
    data,
    headers: Object.keys(data[0] || {}),
    workbook,
    sourcesMasterSheet
  };
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  parseRegistry().catch(error => {
    console.error('❌ Error parsing registry:', error);
    process.exit(1);
  });
}

export { parseRegistry };
