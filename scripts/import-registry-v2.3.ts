/**
 * Source Registry Importer v2.3
 * Imports from YETO_Sources_Universe_Master_PRODUCTION_READY_v2_3.xlsx
 * 
 * Sheets imported:
 * - SECTOR_CODEBOOK_16 → sector_codebook
 * - SOURCES_MASTER_EXT → source_registry (canonical)
 * - SOURCE_SECTOR_MATRIX_292 → registry_sector_map
 * - SOURCE_ENDPOINTS → source_endpoints
 * - SOURCE_PRODUCTS → source_products_v2
 * 
 * Features:
 * - Idempotent upsert (no duplicates on rerun)
 * - Registry diff tracking
 * - LINT validation with P0/P1 rules
 */

import XLSX from 'xlsx';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const EXCEL_PATH = path.join(__dirname, '../data/source_registry/YETO_Sources_Universe_Master_PRODUCTION_READY_v2_3.xlsx');

// Enum mappings from ENUMS sheet
const TIER_ENUM = ['T0', 'T1', 'T2', 'T3', 'T4', 'UNKNOWN'];
const STATUS_ENUM = ['ACTIVE', 'NEEDS_KEY', 'PENDING_REVIEW', 'INACTIVE', 'DEPRECATED'];
const ACCESS_METHOD_ENUM = ['API', 'SDMX', 'RSS', 'WEB', 'PDF', 'CSV', 'XLSX', 'MANUAL', 'PARTNER', 'REMOTE_SENSING'];
const FREQUENCY_ENUM = ['REALTIME', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL', 'IRREGULAR'];

// LINT rules
interface LintResult {
  sourceId: string;
  severity: 'ERROR' | 'WARN';
  rule: string;
  message: string;
}

const lintResults: LintResult[] = [];

function normalizeEnum(value: any, allowed: string[], defaultVal: string): string {
  if (!value) return defaultVal;
  const upper = String(value).toUpperCase().trim();
  if (allowed.includes(upper)) return upper;
  return defaultVal;
}

function parseBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    return lower === 'true' || lower === 'yes' || lower === '1' || lower === 'y';
  }
  return false;
}

function parseLanguages(value: any): string[] {
  if (!value) return [];
  const langs = String(value).split(/[,;\s]+/).map(l => l.trim().toLowerCase()).filter(Boolean);
  return langs.map(l => {
    if (l === 'arabic' || l === 'ar') return 'ar';
    if (l === 'english' || l === 'en') return 'en';
    if (l === 'french' || l === 'fr') return 'fr';
    return l;
  });
}

// Helper to convert undefined to null for MySQL
function n(val: any): any {
  return val === undefined ? null : val;
}

// Helper to get string or null, with optional max length
function s(val: any, maxLen?: number): string | null {
  if (val === undefined || val === null || val === '') return null;
  let str = String(val);
  if (maxLen && str.length > maxLen) {
    str = str.substring(0, maxLen - 3) + '...';
  }
  return str;
}

// Helper to get int or null
function i(val: any): number | null {
  if (val === undefined || val === null || val === '') return null;
  const num = parseInt(String(val), 10);
  return isNaN(num) ? null : num;
}

async function main() {
  console.log('=== Source Registry Importer v2.3 ===');
  console.log(`Reading: ${EXCEL_PATH}`);
  
  const wb = XLSX.readFile(EXCEL_PATH);
  const importRunId = `import_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  
  // Connect to database
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL not set');
  }
  
  const connection = await mysql.createConnection(dbUrl);
  console.log('Connected to database');
  
  try {
    // 1. Import SECTOR_CODEBOOK_16
    console.log('\n--- Importing SECTOR_CODEBOOK_16 ---');
    const sectorData = XLSX.utils.sheet_to_json(wb.Sheets['SECTOR_CODEBOOK_16']);
    let sectorCount = 0;
    
    for (const row of sectorData as any[]) {
      const code = row['sector_code'];
      const nameEn = row['sector_name'] || 'Unknown';
      const definition = s(row['definition']);
      
      if (!code) continue;
      
      await connection.execute(`
        INSERT INTO sector_codebook (sectorCode, sectorName, definition)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE sectorName = VALUES(sectorName), definition = VALUES(definition)
      `, [code, nameEn, definition]);
      sectorCount++;
    }
    console.log(`Imported ${sectorCount} sectors`);
    
    // 2. Import SOURCES_MASTER_EXT → source_registry
    console.log('\n--- Importing SOURCES_MASTER_EXT → source_registry ---');
    const sourcesData = XLSX.utils.sheet_to_json(wb.Sheets['SOURCES_MASTER_EXT']);
    let sourceCount = 0;
    let p0Errors = 0;
    let p1Warnings = 0;
    
    for (const row of sourcesData as any[]) {
      const sourceId = row['src_id'];
      const nameEn = row['name_en'];
      
      // P0 LINT: src_id and name_en are required
      if (!sourceId) {
        lintResults.push({ sourceId: 'UNKNOWN', severity: 'ERROR', rule: 'src_id unique', message: 'Missing src_id' });
        p0Errors++;
        continue;
      }
      if (!nameEn) {
        lintResults.push({ sourceId, severity: 'ERROR', rule: 'name_en present', message: 'Missing name_en' });
        p0Errors++;
        continue;
      }
      
      // Normalize enums
      const tier = normalizeEnum(row['tier'], TIER_ENUM, 'UNKNOWN');
      const status = normalizeEnum(row['status'], STATUS_ENUM, 'PENDING_REVIEW');
      const accessMethod = normalizeEnum(row['access_method_norm'], ACCESS_METHOD_ENUM, 'WEB');
      const frequency = normalizeEnum(row['update_frequency_norm'], FREQUENCY_ENUM, 'IRREGULAR');
      
      // P1 LINT warnings
      if (tier === 'UNKNOWN') {
        lintResults.push({ sourceId, severity: 'WARN', rule: 'tier present', message: 'Tier is unknown, requires classification' });
        p1Warnings++;
      }
      
      // Parse other fields - map Excel columns to DB columns
      const nameAr = s(row['name_ar']);
      const institution = s(row['institution']);
      const url = s(row['url']);
      const description = s(row['notes']);
      const languages = JSON.stringify(parseLanguages(row['multilingual_required'] ? 'ar,en' : 'en'));
      const allowedUse = JSON.stringify([row['source_class'] || 'DATA_NUMERIC']);
      const authRequired = parseBoolean(row['auth_required']);
      const needsPartnership = parseBoolean(row['partnership_required']);
      const partnershipContact = s(row['partnership_action_email']);
      const confidenceGrade = s(row['confidence_grade']);
      const cadenceLagDays = i(row['cadence_lag_tolerance']);
      const connectorType = s(row['ingestion_method'], 250);
      const countryScope = s(row['geographic_coverage']) || 'YEM';
      const sectorCategory = s(row['sector_category'], 95);
      const license = s(row['license'], 495);
      const historicalStart = i(row['time_coverage_start']);
      const historicalEnd = i(row['time_coverage_end']);
      
      // Upsert into source_registry
      await connection.execute(`
        INSERT INTO source_registry (
          sourceId, name, altName, publisher, webUrl, description,
          tier, status, accessType, updateFrequency,
          language, allowedUse, apiKeyRequired, needsPartnership, partnershipContact,
          confidenceRating, freshnessSla, connectorType,
          geographicScope, sectorCategory, license, historicalStart, historicalEnd
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name), altName = VALUES(altName),
          publisher = VALUES(publisher), webUrl = VALUES(webUrl),
          description = VALUES(description), tier = VALUES(tier),
          status = VALUES(status), accessType = VALUES(accessType),
          updateFrequency = VALUES(updateFrequency), language = VALUES(language),
          allowedUse = VALUES(allowedUse), apiKeyRequired = VALUES(apiKeyRequired),
          needsPartnership = VALUES(needsPartnership), partnershipContact = VALUES(partnershipContact),
          confidenceRating = VALUES(confidenceRating),
          freshnessSla = VALUES(freshnessSla), connectorType = VALUES(connectorType),
          geographicScope = VALUES(geographicScope), sectorCategory = VALUES(sectorCategory),
          license = VALUES(license), historicalStart = VALUES(historicalStart), historicalEnd = VALUES(historicalEnd)
      `, [
        sourceId, nameEn, nameAr, institution, url, description,
        tier, status, accessMethod, frequency,
        languages, allowedUse, authRequired, needsPartnership, partnershipContact,
        confidenceGrade, cadenceLagDays, connectorType,
        countryScope, sectorCategory, license, historicalStart, historicalEnd
      ]);
      
      sourceCount++;
      if (sourceCount % 50 === 0) {
        console.log(`  Processed ${sourceCount} sources...`);
      }
    }
    console.log(`Imported ${sourceCount} sources (P0 errors: ${p0Errors}, P1 warnings: ${p1Warnings})`);
    
    // 3. Import SOURCE_SECTOR_MATRIX_292 → registry_sector_map
    console.log('\n--- Importing SOURCE_SECTOR_MATRIX_292 ---');
    const matrixSheet = wb.Sheets['SOURCE_SECTOR_MATRIX_292'];
    if (matrixSheet) {
      const matrixData = XLSX.utils.sheet_to_json(matrixSheet);
      let mappingCount = 0;
      
      // Clear existing mappings for reimport
      await connection.execute('DELETE FROM registry_sector_map');
      
      for (const row of matrixData as any[]) {
        const sourceId = row['src_id'];
        if (!sourceId) continue;
        
        // Check each sector column for ● or ◐
        const sectorCols = Object.keys(row).filter(k => k.startsWith('S') && k.length <= 3);
        for (const col of sectorCols) {
          const value = row[col];
          if (value === '●' || value === '◐') {
            const isPrimary = value === '●';
            await connection.execute(`
              INSERT INTO registry_sector_map (sourceId, sectorCode, isPrimary)
              VALUES (?, ?, ?)
              ON DUPLICATE KEY UPDATE isPrimary = VALUES(isPrimary)
            `, [sourceId, col, isPrimary]);
            mappingCount++;
          }
        }
      }
      console.log(`Imported ${mappingCount} sector mappings`);
    } else {
      console.log('Sheet SOURCE_SECTOR_MATRIX_292 not found, skipping');
    }
    
    // 4. Import SOURCE_ENDPOINTS
    console.log('\n--- Importing SOURCE_ENDPOINTS ---');
    const endpointsSheet = wb.Sheets['SOURCE_ENDPOINTS'];
    if (endpointsSheet) {
      const endpointsData = XLSX.utils.sheet_to_json(endpointsSheet);
      let endpointCount = 0;
      
      for (const row of endpointsData as any[]) {
        const sourceId = row['src_id'];
        const endpointUrl = s(row['endpoint_url']);
        
        if (!sourceId || !endpointUrl) continue;
        
        await connection.execute(`
          INSERT INTO source_endpoints (sourceId, endpointUrl, endpointType, method, params, headers, isActive)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            endpointType = VALUES(endpointType),
            method = VALUES(method),
            params = VALUES(params),
            headers = VALUES(headers),
            isActive = VALUES(isActive)
        `, [
          sourceId,
          endpointUrl,
          s(row['endpoint_type']) || 'DATA',
          s(row['method']) || 'GET',
          s(row['params']),
          s(row['headers']),
          true
        ]);
        endpointCount++;
      }
      console.log(`Imported ${endpointCount} endpoints`);
    } else {
      console.log('Sheet SOURCE_ENDPOINTS not found, skipping');
    }
    
    // 5. Import SOURCE_PRODUCTS
    console.log('\n--- Importing SOURCE_PRODUCTS ---');
    const productsSheet = wb.Sheets['SOURCE_PRODUCTS'];
    if (productsSheet) {
      const productsData = XLSX.utils.sheet_to_json(productsSheet);
      let productCount = 0;
      
      for (const row of productsData as any[]) {
        const sourceId = row['src_id'];
        const productName = s(row['product_name']);
        
        if (!sourceId || !productName) continue;
        
        await connection.execute(`
          INSERT INTO source_products (sourceId, productName, productType, description, url, isActive)
          VALUES (?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            productType = VALUES(productType),
            description = VALUES(description),
            url = VALUES(url),
            isActive = VALUES(isActive)
        `, [
          sourceId,
          productName,
          s(row['product_type']) || 'DATA_NUMERIC',
          s(row['description']),
          s(row['url']),
          true
        ]);
        productCount++;
      }
      console.log(`Imported ${productCount} products`);
    } else {
      console.log('Sheet SOURCE_PRODUCTS not found, skipping');
    }
    
    // Summary
    console.log('\n=== Import Summary ===');
    console.log(`Sectors: ${sectorCount}`);
    console.log(`Sources: ${sourceCount}`);
    console.log(`P0 Errors: ${p0Errors}`);
    console.log(`P1 Warnings: ${p1Warnings}`);
    
    // Verify counts
    const [countResult] = await connection.execute('SELECT COUNT(*) as cnt FROM source_registry');
    console.log(`\nTotal sources in source_registry: ${(countResult as any)[0].cnt}`);
    
    // Show lint results
    if (lintResults.length > 0) {
      console.log('\n=== LINT Results ===');
      const errors = lintResults.filter(r => r.severity === 'ERROR');
      const warnings = lintResults.filter(r => r.severity === 'WARN');
      console.log(`Errors: ${errors.length}, Warnings: ${warnings.length}`);
      if (errors.length > 0) {
        console.log('\nFirst 5 errors:');
        errors.slice(0, 5).forEach(e => console.log(`  [${e.sourceId}] ${e.rule}: ${e.message}`));
      }
    }
    
  } finally {
    await connection.end();
  }
  
  console.log('\n=== Import Complete ===');
}

main().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});
