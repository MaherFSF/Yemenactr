/**
 * YETO Source Registry Importer v2 - Production Safe
 * 
 * CANONICAL TABLE: source_registry (sources table is deprecated/alias)
 * 
 * Imports the Master Source Registry from YETO_Sources_Universe_Master_PRODUCTION_READY_v2_3.xlsx
 * with proper field mappings, P0/P1 lint enforcement, and full upsert logic.
 */

import XLSX from 'xlsx';
import mysql from 'mysql2/promise';
import crypto from 'crypto';

const DATABASE_URL = process.env.DATABASE_URL!;

// ============================================================================
// REGISTRY CONTRACT - REQUIRED FIELDS (P0 = must have, P1 = should have)
// ============================================================================
// P0 = Absolute minimum to create a registry entry
// P1 = Important for quality but not blocking
const REQUIRED_FIELDS = {
  P0: ['src_id', 'name_en'],  // Only truly critical - must have ID and name
  P1: ['institution', 'category', 'source_type', 'sector_category', 'access_method', 'auth_required', 'cadence', 'status', 'url', 'data_format', 'cadence_lag_tolerance', 'time_coverage_start', 'time_coverage_end', 'geographic_coverage', 'license', 'tier', 'evidence_pack_flag']
};

// ============================================================================
// ENUM MAPPINGS
// ============================================================================
const TIER_MAP: Record<string, string> = {
  'T0': 'T0', 'T1': 'T1', 'T2': 'T2', 'T3': 'T3', 'T4': 'T4',
  '1': 'T1', '2': 'T2', '3': 'T3', '4': 'T4', '5': 'T4',
  'Tier 1': 'T1', 'Tier 2': 'T2', 'Tier 3': 'T3', 'Tier 4': 'T4',
  '': 'UNKNOWN'
};

const STATUS_MAP: Record<string, string> = {
  'ACTIVE': 'ACTIVE', 'Active': 'ACTIVE', 'active': 'ACTIVE',
  'NEEDS_KEY': 'NEEDS_KEY', 'Needs Key': 'NEEDS_KEY',
  'PENDING_REVIEW': 'PENDING_REVIEW', 'Pending': 'PENDING_REVIEW',
  'INACTIVE': 'INACTIVE', 'Inactive': 'INACTIVE',
  'DEPRECATED': 'DEPRECATED', 'Deprecated': 'DEPRECATED',
  'PAUSED': 'INACTIVE', 'BLOCKED_TOS': 'INACTIVE',
  '': 'PENDING_REVIEW'
};

const ACCESS_TYPE_MAP: Record<string, string> = {
  'API': 'API', 'api': 'API',
  'SDMX': 'SDMX', 'sdmx': 'SDMX',
  'RSS': 'RSS', 'rss': 'RSS',
  'WEB': 'WEB', 'web': 'WEB', 'Web': 'WEB',
  'PDF': 'PDF', 'pdf': 'PDF',
  'CSV': 'CSV', 'csv': 'CSV',
  'XLSX': 'XLSX', 'xlsx': 'XLSX', 'Excel': 'XLSX',
  'MANUAL': 'MANUAL', 'manual': 'MANUAL', 'Manual': 'MANUAL',
  'PARTNER': 'PARTNER', 'partner': 'PARTNER', 'partner_upload': 'PARTNER',
  'REMOTE_SENSING': 'REMOTE_SENSING', 'remote_sensing': 'REMOTE_SENSING',
  'email': 'MANUAL',
  '': 'WEB'
};

const CADENCE_MAP: Record<string, string> = {
  'REALTIME': 'REALTIME', 'realtime': 'REALTIME', 'Real-time': 'REALTIME',
  'DAILY': 'DAILY', 'daily': 'DAILY', 'Daily': 'DAILY',
  'WEEKLY': 'WEEKLY', 'weekly': 'WEEKLY', 'Weekly': 'WEEKLY',
  'MONTHLY': 'MONTHLY', 'monthly': 'MONTHLY', 'Monthly': 'MONTHLY',
  'QUARTERLY': 'QUARTERLY', 'quarterly': 'QUARTERLY', 'Quarterly': 'QUARTERLY',
  'ANNUAL': 'ANNUAL', 'annual': 'ANNUAL', 'Annual': 'ANNUAL', 'Yearly': 'ANNUAL',
  'IRREGULAR': 'IRREGULAR', 'irregular': 'IRREGULAR', 'Irregular': 'IRREGULAR', 'Ad-hoc': 'IRREGULAR',
  '': 'IRREGULAR'
};

const CATEGORY_MAP: Record<string, string> = {
  'CB': 'CB', 'Central Bank': 'CB',
  'IFI': 'IFI', 'International Financial Institution': 'IFI',
  'UN': 'UN', 'United Nations': 'UN',
  'Gov': 'GOV', 'Government': 'GOV', 'GOV': 'GOV',
  'NGO': 'NGO', 'Non-Governmental Organization': 'NGO',
  'Research': 'RESEARCH', 'RESEARCH': 'RESEARCH', 'Academic': 'RESEARCH',
  'Media': 'MEDIA', 'MEDIA': 'MEDIA',
  'Sanctions': 'SANCTIONS', 'SANCTIONS': 'SANCTIONS',
  'Registry': 'REGISTRY', 'REGISTRY': 'REGISTRY',
  'RemoteSensing': 'REMOTE_SENSING', 'REMOTE_SENSING': 'REMOTE_SENSING',
  'Private': 'PRIVATE', 'PRIVATE': 'PRIVATE',
  '': 'OTHER'
};

const CONFIDENCE_GRADE_MAP: Record<string, string> = {
  'A': 'A', 'A+': 'A', 'A-': 'A',
  'B': 'B', 'B+': 'B', 'B-': 'B',
  'C': 'C', 'C+': 'C', 'C-': 'C',
  'D': 'D', 'D+': 'D', 'D-': 'D',
  '': 'C'
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function mapEnum(value: any, map: Record<string, string>, defaultVal: string): string {
  if (!value) return defaultVal;
  const str = String(value).trim();
  return map[str] || defaultVal;
}

function parseBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    return lower === 'yes' || lower === 'true' || lower === '1';
  }
  return false;
}

function parseLanguages(row: any): string {
  const languages: string[] = [];
  
  // Check for Arabic name
  if (row.name_ar && String(row.name_ar).trim()) {
    languages.push('ar');
  }
  
  // Check multilingual flag
  if (row.multilingual_required === 1 || row.multilingual_required === true) {
    if (!languages.includes('ar')) languages.push('ar');
  }
  
  // Always include English as base
  if (!languages.includes('en')) languages.unshift('en');
  
  return JSON.stringify(languages);
}

function computeAllowedUse(row: any): string {
  const uses: string[] = [];
  
  // Determine allowed uses based on source characteristics
  const sourceType = String(row.source_type || '').toLowerCase();
  const sourceClass = String(row.source_class || '').toLowerCase();
  
  if (sourceType === 'data' || sourceClass.includes('numeric')) {
    uses.push('DATA_NUMERIC');
  }
  if (sourceType === 'documents' || sourceClass.includes('document') || sourceClass.includes('pdf')) {
    uses.push('DOCUMENT');
  }
  if (sourceType === 'mixed') {
    uses.push('DATA_NUMERIC', 'DOCUMENT');
  }
  if (sourceClass.includes('media') || row.source_type === 'Media') {
    uses.push('MEDIA_REFERENCE');
  }
  if (sourceClass.includes('research') || sourceClass.includes('academic')) {
    uses.push('RESEARCH');
  }
  
  // Default if nothing matched
  if (uses.length === 0) {
    uses.push('DATA_NUMERIC');
  }
  
  return JSON.stringify([...new Set(uses)]);
}

function normalizeCadence(row: any): string {
  // Try normalized field first, then raw field
  const cadence = row.cadence_norm || row.update_frequency_norm || row.cadence || row.update_frequency || '';
  return mapEnum(cadence, CADENCE_MAP, 'IRREGULAR');
}

function computeFreshnessSla(row: any): number | null {
  // Parse cadence_lag_tolerance
  const lag = row.cadence_lag_tolerance;
  if (!lag) return null;
  
  if (typeof lag === 'number') return lag;
  
  const str = String(lag).trim();
  const match = str.match(/(\d+)/);
  if (match) return parseInt(match[1]);
  
  // Map cadence to default SLA if no explicit lag
  const cadence = normalizeCadence(row);
  const defaultSla: Record<string, number> = {
    'REALTIME': 1,
    'DAILY': 3,
    'WEEKLY': 10,
    'MONTHLY': 45,
    'QUARTERLY': 120,
    'ANNUAL': 400,
    'IRREGULAR': 180
  };
  return defaultSla[cadence] || 90;
}

function parseReliabilityScore(row: any): number | null {
  const score = row.reliability_score;
  if (!score) return null;
  
  if (typeof score === 'number') return Math.min(100, Math.max(0, score));
  
  const str = String(score).trim();
  const match = str.match(/(\d+)/);
  if (match) return Math.min(100, Math.max(0, parseInt(match[1])));
  
  return null;
}

function mapSectorWeight(symbol: string): string | null {
  if (symbol === '●') return 'primary';
  if (symbol === '◐') return 'secondary';
  if (symbol === '○') return 'tertiary';
  return null;
}

// ============================================================================
// LINT FUNCTIONS
// ============================================================================
interface LintFailure {
  sourceId: string;
  field: string;
  rule: string;
  message: string;
  severity: 'P0' | 'P1' | 'warning';
}

function lintSource(row: any): LintFailure[] {
  const failures: LintFailure[] = [];
  const srcId = row.src_id || 'UNKNOWN';
  
  // P0 checks - must have
  for (const field of REQUIRED_FIELDS.P0) {
    const value = row[field];
    if (!value || String(value).trim() === '') {
      failures.push({
        sourceId: srcId,
        field,
        rule: 'required_p0',
        message: `P0 field '${field}' is missing or empty`,
        severity: 'P0'
      });
    }
  }
  
  // P1 checks - should have
  for (const field of REQUIRED_FIELDS.P1) {
    const value = row[field];
    if (!value || String(value).trim() === '') {
      failures.push({
        sourceId: srcId,
        field,
        rule: 'required_p1',
        message: `P1 field '${field}' is missing or empty`,
        severity: 'P1'
      });
    }
  }
  
  // URL validation
  if (row.url) {
    try {
      new URL(row.url);
    } catch {
      failures.push({
        sourceId: srcId,
        field: 'url',
        rule: 'valid_url',
        message: `Invalid URL format: ${row.url}`,
        severity: 'warning'
      });
    }
  }
  
  // Tier validation
  const tier = mapEnum(row.tier, TIER_MAP, 'UNKNOWN');
  if (tier === 'UNKNOWN') {
    failures.push({
      sourceId: srcId,
      field: 'tier',
      rule: 'valid_tier',
      message: 'Tier classification is missing or invalid',
      severity: 'P1'
    });
  }
  
  return failures;
}

// ============================================================================
// MAIN IMPORT FUNCTION
// ============================================================================
async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     YETO Source Registry Importer v2 - Production Safe       ║');
  console.log('║     CANONICAL TABLE: source_registry                         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  // Read the Excel workbook
  const workbook = XLSX.readFile('./data/source_registry/YETO_Sources_Universe_Master_PRODUCTION_READY_v2_3.xlsx');
  console.log('✓ Loaded Excel workbook\n');
  
  // Connect to database
  const connection = await mysql.createConnection(DATABASE_URL);
  console.log('✓ Connected to database\n');
  
  const allLintFailures: LintFailure[] = [];
  
  try {
    // ========================================================================
    // STEP 1: Import Sector Codebook (16 sectors)
    // ========================================================================
    console.log('━━━ STEP 1: Importing Sector Codebook ━━━');
    const codebookSheet = workbook.Sheets['SECTOR_CODEBOOK_16'];
    if (codebookSheet) {
      const codebookData = XLSX.utils.sheet_to_json<any>(codebookSheet);
      
      for (const sector of codebookData) {
        await connection.execute(
          `INSERT INTO sector_codebook (sectorCode, sectorName, definition, displayOrder, isActive)
           VALUES (?, ?, ?, ?, true)
           ON DUPLICATE KEY UPDATE 
             sectorName = VALUES(sectorName), 
             definition = VALUES(definition),
             displayOrder = VALUES(displayOrder)`,
          [
            sector.sector_code,
            sector.sector_name,
            sector.definition || null,
            parseInt(String(sector.sector_code).replace('S', '')) || 0
          ]
        );
      }
      console.log(`✓ Imported ${codebookData.length} sectors\n`);
    }
    
    // ========================================================================
    // STEP 2: Import Source Registry with FULL UPSERT
    // ========================================================================
    console.log('━━━ STEP 2: Importing Source Registry (292 sources) ━━━');
    const sourcesSheet = workbook.Sheets['SOURCES_MASTER_EXT'];
    const sourcesData = XLSX.utils.sheet_to_json<any>(sourcesSheet);
    
    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const row of sourcesData) {
      if (!row.src_id || !row.name_en) {
        skippedCount++;
        continue;
      }
      
      // Lint the source
      const lintResults = lintSource(row);
      allLintFailures.push(...lintResults);
      
      // Only skip if missing src_id or name_en (truly critical)
      if (!row.src_id || !row.name_en) {
        console.log(`⚠ Skipping row: missing src_id or name_en`);
        skippedCount++;
        continue;
      }
      
      try {
        // Check if exists
        const [existing] = await connection.execute<any[]>(
          'SELECT id FROM source_registry WHERE sourceId = ?',
          [row.src_id]
        );
        
        const isUpdate = existing.length > 0;
        
        // Prepare all fields
        const fields = {
          sourceId: row.src_id,
          name: row.name_en,
          altName: row.name_ar || null,
          publisher: row.institution || row.domain || null,
          category: mapEnum(row.category, CATEGORY_MAP, 'OTHER'),
          sourceType: row.source_type || 'data',
          apiUrl: row.api_url || null,
          webUrl: row.url || row.url_raw || null,
          accessType: mapEnum(row.access_method_norm || row.access_method, ACCESS_TYPE_MAP, 'WEB'),
          apiKeyRequired: parseBoolean(row.auth_required),
          apiKeyContact: row.partnership_action_email || null,
          tier: mapEnum(row.tier, TIER_MAP, 'UNKNOWN'),
          status: mapEnum(row.status, STATUS_MAP, 'PENDING_REVIEW'),
          allowedUse: computeAllowedUse(row),
          updateFrequency: normalizeCadence(row),
          freshnessSla: computeFreshnessSla(row),
          geographicScope: row.geographic_coverage || row.coverage || null,
          historicalStart: row.time_coverage_start || null,
          historicalEnd: row.time_coverage_end || null,
          language: parseLanguages(row),
          description: row.notes || row.yeto_usage || null,
          license: row.license || null,
          confidenceRating: mapEnum(row.confidence_grade, CONFIDENCE_GRADE_MAP, 'C'),
          reliabilityScore: parseReliabilityScore(row),
          needsPartnership: parseBoolean(row.partnership_required),
          partnershipContact: row.partnership_action_email || null,
          connectorType: row.ingestion_method ? String(row.ingestion_method).substring(0, 100) : null,
          connectorOwner: row.ingestion_owner_agent || 'Manus',
          sectorsFed: row.sector_category ? JSON.stringify([row.sector_category]) : null,
          pagesFed: row.dashboard_modules_linked ? JSON.stringify([row.dashboard_modules_linked]) : null,
          isPrimary: parseBoolean(row.is_primary),
          isProxy: parseBoolean(row.is_proxy),
          isMedia: row.source_type === 'Media',
          limitations: row.granularity_caveats || null,
          notes: row.notes || null,
          sectorCategory: row.sector_category || null,
          registryType: row.origin || 'master',
          evidencePackFlag: parseBoolean(row.evidence_pack_flag),
          dataFormat: row.data_format || null
        };
        
        if (isUpdate) {
          // FULL UPSERT - update all fields
          await connection.execute(
            `UPDATE source_registry SET
              name = ?, altName = ?, publisher = ?,
              apiUrl = ?, webUrl = ?, accessType = ?, apiKeyRequired = ?, apiKeyContact = ?,
              tier = ?, status = ?, allowedUse = ?, updateFrequency = ?, freshnessSla = ?,
              geographicScope = ?, historicalStart = ?, historicalEnd = ?, language = ?,
              description = ?, license = ?, confidenceRating = ?, needsPartnership = ?,
              partnershipContact = ?, connectorType = ?, connectorOwner = ?, sectorsFed = ?,
              pagesFed = ?, isPrimary = ?, isProxy = ?, isMedia = ?, limitations = ?,
              notes = ?, sectorCategory = ?, registryType = ?, updatedAt = NOW()
             WHERE sourceId = ?`,
            [
              fields.name, fields.altName, fields.publisher,
              fields.apiUrl, fields.webUrl, fields.accessType, fields.apiKeyRequired, fields.apiKeyContact,
              fields.tier, fields.status, fields.allowedUse, fields.updateFrequency, fields.freshnessSla,
              fields.geographicScope, fields.historicalStart, fields.historicalEnd, fields.language,
              fields.description, fields.license, fields.confidenceRating, fields.needsPartnership,
              fields.partnershipContact, fields.connectorType, fields.connectorOwner, fields.sectorsFed,
              fields.pagesFed, fields.isPrimary, fields.isProxy, fields.isMedia, fields.limitations,
              fields.notes, fields.sectorCategory, fields.registryType,
              fields.sourceId
            ]
          );
          updatedCount++;
        } else {
          // INSERT new record
          await connection.execute(
            `INSERT INTO source_registry (
              sourceId, name, altName, publisher,
              apiUrl, webUrl, accessType, apiKeyRequired, apiKeyContact,
              tier, status, allowedUse, updateFrequency, freshnessSla,
              geographicScope, historicalStart, historicalEnd, language,
              description, license, confidenceRating, needsPartnership,
              partnershipContact, connectorType, connectorOwner, sectorsFed,
              pagesFed, isPrimary, isProxy, isMedia, limitations,
              notes, sectorCategory, registryType
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              fields.sourceId, fields.name, fields.altName, fields.publisher,
              fields.apiUrl, fields.webUrl, fields.accessType, fields.apiKeyRequired, fields.apiKeyContact,
              fields.tier, fields.status, fields.allowedUse, fields.updateFrequency, fields.freshnessSla,
              fields.geographicScope, fields.historicalStart, fields.historicalEnd, fields.language,
              fields.description, fields.license, fields.confidenceRating, fields.needsPartnership,
              fields.partnershipContact, fields.connectorType, fields.connectorOwner, fields.sectorsFed,
              fields.pagesFed, fields.isPrimary, fields.isProxy, fields.isMedia, fields.limitations,
              fields.notes, fields.sectorCategory, fields.registryType
            ]
          );
          importedCount++;
        }
      } catch (err: any) {
        console.error(`✗ Error importing ${row.src_id}: ${err.message}`);
        skippedCount++;
      }
    }
    
    console.log(`✓ Imported: ${importedCount} new, ${updatedCount} updated, ${skippedCount} skipped\n`);
    
    // ========================================================================
    // STEP 3: Import Source-Sector Mappings
    // ========================================================================
    console.log('━━━ STEP 3: Importing Source-Sector Mappings ━━━');
    const matrixSheet = workbook.Sheets['SOURCE_SECTOR_MATRIX_292'];
    if (matrixSheet) {
      const matrixData = XLSX.utils.sheet_to_json<any>(matrixSheet);
      
      let mappingsCount = 0;
      const sectorCodes = ['S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08', 
                           'S09', 'S10', 'S11', 'S12', 'S13', 'S14', 'S15', 'S16'];
      
      for (const row of matrixData) {
        if (!row.src_id) continue;
        
        // Get the source_registry ID
        const [sourceRows] = await connection.execute<any[]>(
          'SELECT id FROM source_registry WHERE sourceId = ?',
          [row.src_id]
        );
        
        if (sourceRows.length === 0) continue;
        const sourceRegistryId = sourceRows[0].id;
        
        for (const sectorCode of sectorCodes) {
          const symbol = row[sectorCode];
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
            } catch {
              // Ignore duplicate errors
            }
          }
        }
      }
      console.log(`✓ Created ${mappingsCount} source-sector mappings\n`);
    }
    
    // ========================================================================
    // STEP 4: Store Lint Results
    // ========================================================================
    console.log('━━━ STEP 4: Registry Lint Results ━━━');
    
    const p0Count = allLintFailures.filter(f => f.severity === 'P0').length;
    const p1Count = allLintFailures.filter(f => f.severity === 'P1').length;
    const warningCount = allLintFailures.filter(f => f.severity === 'warning').length;
    
    const [totalSources] = await connection.execute<any[]>('SELECT COUNT(*) as count FROM source_registry');
    const passedSources = totalSources[0].count - new Set(allLintFailures.filter(f => f.severity === 'P0').map(f => f.sourceId)).size;
    
    const lintRunId = `LINT-${Date.now()}`;
    await connection.execute(
      `INSERT INTO registry_lint_results (runId, runAt, totalSources, passedSources, failedSources, warningCount, failures, overallStatus)
       VALUES (?, NOW(), ?, ?, ?, ?, ?, ?)`,
      [
        lintRunId,
        totalSources[0].count,
        passedSources,
        totalSources[0].count - passedSources,
        warningCount,
        JSON.stringify(allLintFailures.slice(0, 100)), // Store first 100 failures
        p0Count > 0 ? 'fail' : p1Count > 0 ? 'warning' : 'pass'
      ]
    );
    
    console.log(`P0 Failures (Critical): ${p0Count}`);
    console.log(`P1 Failures (Should Fix): ${p1Count}`);
    console.log(`Warnings: ${warningCount}`);
    console.log(`Lint Status: ${p0Count > 0 ? 'FAIL' : p1Count > 0 ? 'WARNING' : 'PASS'}\n`);
    
    // ========================================================================
    // SUMMARY
    // ========================================================================
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                     IMPORT SUMMARY                           ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    
    const [sectorCount] = await connection.execute<any[]>('SELECT COUNT(*) as count FROM sector_codebook');
    const [sourceCount] = await connection.execute<any[]>('SELECT COUNT(*) as count FROM source_registry');
    const [mappingCount] = await connection.execute<any[]>('SELECT COUNT(*) as count FROM registry_sector_map');
    
    console.log(`║ Sectors:          ${String(sectorCount[0].count).padStart(5)}                                   ║`);
    console.log(`║ Sources:          ${String(sourceCount[0].count).padStart(5)}                                   ║`);
    console.log(`║ Sector Mappings:  ${String(mappingCount[0].count).padStart(5)}                                   ║`);
    console.log(`║ P0 Failures:      ${String(p0Count).padStart(5)}                                   ║`);
    console.log(`║ P1 Failures:      ${String(p1Count).padStart(5)}                                   ║`);
    console.log(`║ Lint Status:      ${(p0Count > 0 ? 'FAIL' : p1Count > 0 ? 'WARNING' : 'PASS').padStart(5)}                                   ║`);
    console.log('╚══════════════════════════════════════════════════════════════╝');
    
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
