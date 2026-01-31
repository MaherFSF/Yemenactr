/**
 * YETO Source Registry Importer
 * 
 * Imports the Master Source Registry from YETO_Sources_Universe_Master_PRODUCTION_READY_v2_0.xlsx
 * into the database tables:
 * - source_registry (292 sources)
 * - registry_sector_map (source-sector mappings)
 * - sector_codebook (16 sectors)
 */

import XLSX from 'xlsx';
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL!;

interface SourceRow {
  src_id: string;
  src_numeric_id: number;
  name_en: string;
  name_ar: string;
  domain: string;
  institution: string;
  category: string;
  source_type: string;
  source_class: string;
  sector_category: string;
  sub_sector_tag: string;
  geographic_coverage: string;
  time_coverage_start: number;
  time_coverage_end: number;
  access_method: string;
  access_method_norm: string;
  auth_required: string;
  data_format: string;
  update_frequency: string;
  update_frequency_norm: string;
  cadence: string;
  cadence_norm: string;
  cadence_lag_tolerance: string;
  tier: string;
  reliability_score: string;
  confidence_grade: string;
  license: string;
  partnership_required: boolean;
  partnership_action_email: string;
  routing_function: string;
  dashboard_modules_linked: string;
  integration_targets: string;
  embedded_indicators: string;
  data_fields: string;
  transformation_notes: string;
  granularity_caveats: string;
  fallback_plan: string;
  admin_alert_trigger_condition: string;
  ingestion_method: string;
  ingestion_owner_agent: string;
  multilingual_required: number;
  glossary_terms_required: number;
  evidence_pack_flag: number;
  yeto_usage: string;
  yeto_module: string;
  coverage: string;
  typical_lag_days: string;
  typical_lag_text: string;
  notes: string;
  tags: string;
  status: string;
  active: boolean;
  url: string;
  url_raw: string;
  origin: string;
  ai_coach_prompt: string;
}

interface SectorMapping {
  src_id: string;
  source_name: string;
  S01: string;
  S02: string;
  S03: string;
  S04: string;
  S05: string;
  S06: string;
  S07: string;
  S08: string;
  S09: string;
  S10: string;
  S11: string;
  S12: string;
  S13: string;
  S14: string;
  S15: string;
  S16: string;
}

interface SectorDefinition {
  sector_code: string;
  sector_name: string;
  definition: string;
}

// Map tier codes to enum values
function mapTier(tier: string): string {
  const tierMap: Record<string, string> = {
    'T0': 'T0',
    'T1': 'T1',
    'T2': 'T2',
    'T3': 'T3',
    'T4': 'T4',
    '': 'UNKNOWN'
  };
  return tierMap[tier] || 'UNKNOWN';
}

// Map status to enum values
function mapStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'ACTIVE': 'ACTIVE',
    'NEEDS_KEY': 'NEEDS_KEY',
    'PENDING_REVIEW': 'PENDING_REVIEW',
    'INACTIVE': 'INACTIVE',
    'DEPRECATED': 'DEPRECATED',
    '': 'PENDING_REVIEW'
  };
  return statusMap[status] || 'PENDING_REVIEW';
}

// Map access method to enum values
function mapAccessType(method: string): string {
  const accessMap: Record<string, string> = {
    'API': 'API',
    'SDMX': 'SDMX',
    'RSS': 'RSS',
    'WEB': 'WEB',
    'PDF': 'PDF',
    'CSV': 'CSV',
    'XLSX': 'XLSX',
    'MANUAL': 'MANUAL',
    'MANUAL+WEB': 'MANUAL',
    'PARTNER': 'PARTNER',
    'REMOTE_SENSING': 'REMOTE_SENSING',
    '': 'WEB'
  };
  return accessMap[method] || 'WEB';
}

// Map update frequency to enum values
function mapUpdateFrequency(freq: string): string {
  const freqMap: Record<string, string> = {
    'REALTIME': 'REALTIME',
    'DAILY': 'DAILY',
    'WEEKLY': 'WEEKLY',
    'MONTHLY': 'MONTHLY',
    'QUARTERLY': 'QUARTERLY',
    'ANNUAL': 'ANNUAL',
    'IRREGULAR': 'IRREGULAR',
    '': 'IRREGULAR'
  };
  return freqMap[freq] || 'IRREGULAR';
}

// Map sector weight from symbol
function mapSectorWeight(symbol: string): string | null {
  if (symbol === '●') return 'primary';
  if (symbol === '◐') return 'secondary';
  if (symbol === '○') return null; // No mapping
  return null;
}

async function main() {
  console.log('=== YETO Source Registry Importer ===\n');
  
  // Read the Excel workbook
  const workbook = XLSX.readFile('./data/YETO_Sources_Universe_Master_PRODUCTION_READY_v2_0.xlsx');
  
  // Connect to database
  const connection = await mysql.createConnection(DATABASE_URL);
  console.log('Connected to database\n');
  
  try {
    // 1. Import Sector Codebook
    console.log('--- Importing Sector Codebook (16 sectors) ---');
    const codebookSheet = workbook.Sheets['SECTOR_CODEBOOK_16'];
    const codebookData = XLSX.utils.sheet_to_json<SectorDefinition>(codebookSheet);
    
    for (const sector of codebookData) {
      await connection.execute(
        `INSERT INTO sector_codebook (sectorCode, sectorName, definition, displayOrder)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE sectorName = VALUES(sectorName), definition = VALUES(definition)`,
        [
          sector.sector_code,
          sector.sector_name,
          sector.definition,
          parseInt(sector.sector_code.replace('S', ''))
        ]
      );
    }
    console.log(`✓ Imported ${codebookData.length} sectors\n`);
    
    // 2. Import Sources from SOURCES_MASTER_EXT
    console.log('--- Importing Source Registry (292 sources) ---');
    const sourcesSheet = workbook.Sheets['SOURCES_MASTER_EXT'];
    const sourcesData = XLSX.utils.sheet_to_json<SourceRow>(sourcesSheet);
    
    let importedCount = 0;
    let skippedCount = 0;
    
    for (const source of sourcesData) {
      if (!source.src_id || !source.name_en) {
        skippedCount++;
        continue;
      }
      
      try {
        await connection.execute(
          `INSERT INTO source_registry (
            sourceId, name, altName, publisher,
            apiUrl, webUrl, accessType, apiKeyRequired, apiKeyContact,
            tier, status, allowedUse,
            updateFrequency, freshnessSla,
            geographicScope, historicalStart, historicalEnd, language,
            description, license, confidenceRating,
            needsPartnership, partnershipContact,
            connectorType, connectorOwner,
            sectorsFed, pagesFed,
            isPrimary, isProxy, isMedia,
            limitations, notes, sectorCategory, registryType
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            publisher = VALUES(publisher),
            webUrl = VALUES(webUrl),
            tier = VALUES(tier),
            status = VALUES(status),
            updateFrequency = VALUES(updateFrequency),
            notes = VALUES(notes)`,
          [
            source.src_id,
            source.name_en,
            source.name_ar || null,
            source.institution || source.domain || null,
            null, // apiUrl
            source.url || null,
            mapAccessType(source.access_method_norm || ''),
            source.auth_required === 'Yes' || source.auth_required === true,
            source.partnership_action_email || null,
            mapTier(source.tier || ''),
            mapStatus(source.status || ''),
            JSON.stringify([source.source_class || 'DATA_NUMERIC']),
            mapUpdateFrequency(source.update_frequency_norm || source.cadence_norm || ''),
            source.cadence_lag_tolerance ? parseInt(source.cadence_lag_tolerance) || null : null,
            source.geographic_coverage || source.coverage || null,
            source.time_coverage_start || null,
            source.time_coverage_end || null,
            source.multilingual_required ? 'multi' : 'en',
            source.notes || null,
            source.license || null,
            source.confidence_grade || source.reliability_score || null,
            source.partnership_required === true,
            source.partnership_action_email || null,
            source.ingestion_method || null,
            source.ingestion_owner_agent || 'Manus',
            source.sector_category ? JSON.stringify([source.sector_category]) : null,
            source.dashboard_modules_linked ? JSON.stringify([source.dashboard_modules_linked]) : null,
            false, // isPrimary
            false, // isProxy
            source.source_type === 'Media',
            source.granularity_caveats || null,
            source.notes || null,
            source.sector_category || null,
            source.origin || 'master'
          ]
        );
        importedCount++;
      } catch (err: any) {
        console.error(`Error importing ${source.src_id}: ${err.message}`);
        skippedCount++;
      }
    }
    console.log(`✓ Imported ${importedCount} sources (${skippedCount} skipped)\n`);
    
    // 3. Import Source-Sector Mappings
    console.log('--- Importing Source-Sector Mappings ---');
    const matrixSheet = workbook.Sheets['SOURCE_SECTOR_MATRIX_292'];
    const matrixData = XLSX.utils.sheet_to_json<SectorMapping>(matrixSheet);
    
    let mappingsCount = 0;
    const sectorCodes = ['S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08', 
                         'S09', 'S10', 'S11', 'S12', 'S13', 'S14', 'S15', 'S16'];
    
    for (const row of matrixData) {
      if (!row.src_id) continue;
      
      // Get the source_registry ID for this src_id
      const [sourceRows] = await connection.execute<any[]>(
        'SELECT id FROM source_registry WHERE sourceId = ?',
        [row.src_id]
      );
      
      if (sourceRows.length === 0) continue;
      const sourceRegistryId = sourceRows[0].id;
      
      for (const sectorCode of sectorCodes) {
        const symbol = (row as any)[sectorCode];
        const weight = mapSectorWeight(symbol);
        
        if (weight) {
          try {
            await connection.execute(
              `INSERT INTO registry_sector_map (sourceRegistryId, sectorCode, weight)
               VALUES (?, ?, ?)
               ON DUPLICATE KEY UPDATE weight = VALUES(weight)`,
              [sourceRegistryId, sectorCode, weight]
            );
            mappingsCount++;
          } catch (err: any) {
            // Ignore duplicate errors
          }
        }
      }
    }
    console.log(`✓ Created ${mappingsCount} source-sector mappings\n`);
    
    // 4. Run Registry Lint
    console.log('--- Running Registry Lint ---');
    const [sources] = await connection.execute<any[]>('SELECT * FROM source_registry');
    
    const failures: any[] = [];
    let passedCount = 0;
    
    for (const source of sources) {
      let hasError = false;
      
      // Check required fields
      if (!source.name) {
        failures.push({
          sourceId: source.sourceId,
          field: 'name',
          rule: 'required',
          message: 'Name is required',
          severity: 'error'
        });
        hasError = true;
      }
      
      if (!source.webUrl && !source.apiUrl) {
        failures.push({
          sourceId: source.sourceId,
          field: 'url',
          rule: 'required',
          message: 'At least one URL (web or API) is required',
          severity: 'warning'
        });
      }
      
      if (source.tier === 'UNKNOWN') {
        failures.push({
          sourceId: source.sourceId,
          field: 'tier',
          rule: 'classification',
          message: 'Tier classification is missing',
          severity: 'warning'
        });
      }
      
      if (!hasError) passedCount++;
    }
    
    const lintRunId = `LINT-${Date.now()}`;
    await connection.execute(
      `INSERT INTO registry_lint_results (runId, runAt, totalSources, passedSources, failedSources, warningCount, failures, overallStatus)
       VALUES (?, NOW(), ?, ?, ?, ?, ?, ?)`,
      [
        lintRunId,
        sources.length,
        passedCount,
        sources.length - passedCount,
        failures.filter(f => f.severity === 'warning').length,
        JSON.stringify(failures),
        failures.filter(f => f.severity === 'error').length > 0 ? 'fail' : 
          failures.filter(f => f.severity === 'warning').length > 0 ? 'warning' : 'pass'
      ]
    );
    
    console.log(`✓ Lint completed: ${passedCount}/${sources.length} passed`);
    console.log(`  Errors: ${failures.filter(f => f.severity === 'error').length}`);
    console.log(`  Warnings: ${failures.filter(f => f.severity === 'warning').length}\n`);
    
    // Summary
    console.log('=== Import Summary ===');
    const [sectorCount] = await connection.execute<any[]>('SELECT COUNT(*) as count FROM sector_codebook');
    const [sourceCount] = await connection.execute<any[]>('SELECT COUNT(*) as count FROM source_registry');
    const [mappingCount] = await connection.execute<any[]>('SELECT COUNT(*) as count FROM registry_sector_map');
    
    console.log(`Sectors: ${sectorCount[0].count}`);
    console.log(`Sources: ${sourceCount[0].count}`);
    console.log(`Mappings: ${mappingCount[0].count}`);
    console.log(`Lint Status: ${failures.filter(f => f.severity === 'error').length > 0 ? 'FAIL' : 'PASS'}`);
    
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
