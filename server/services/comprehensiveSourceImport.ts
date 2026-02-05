/**
 * Comprehensive Source Import Service
 * 
 * Imports all 292 sources from YETO_Sources_Universe_Master Excel file
 * into the canonical source_registry table with full sector mappings
 */

import { getDb } from '../db';
import { sql } from 'drizzle-orm';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// Source tier mapping
const TIER_MAP: Record<string, 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'UNKNOWN'> = {
  'T0': 'T0',
  'T1': 'T1',
  'T2': 'T2',
  'T3': 'T3',
  'T4': 'T4',
  'UNKNOWN': 'UNKNOWN'
};

// Status mapping
const STATUS_MAP: Record<string, 'ACTIVE' | 'PENDING_REVIEW' | 'NEEDS_KEY' | 'INACTIVE' | 'DEPRECATED'> = {
  'ACTIVE': 'ACTIVE',
  'PENDING_REVIEW': 'PENDING_REVIEW',
  'NEEDS_KEY': 'NEEDS_KEY',
  'INACTIVE': 'INACTIVE',
  'DEPRECATED': 'DEPRECATED'
};

// Access type mapping
const ACCESS_TYPE_MAP: Record<string, string> = {
  'API': 'API',
  'WEB': 'WEB',
  'PDF': 'PDF',
  'CSV': 'CSV',
  'XLSX': 'XLSX',
  'MANUAL': 'MANUAL',
  'PARTNER': 'PARTNER',
  'SDMX': 'SDMX',
  'RSS': 'RSS',
  'REMOTE_SENSING': 'REMOTE_SENSING'
};

// Frequency mapping
const FREQUENCY_MAP: Record<string, string> = {
  'REALTIME': 'REALTIME',
  'DAILY': 'DAILY',
  'WEEKLY': 'WEEKLY',
  'MONTHLY': 'MONTHLY',
  'QUARTERLY': 'QUARTERLY',
  'ANNUAL': 'ANNUAL',
  'IRREGULAR': 'IRREGULAR'
};

// Sector code mapping (from common names to codes)
const SECTOR_CODE_MAP: Record<string, string> = {
  'macroeconomic': 'MACRO',
  'macro': 'MACRO',
  'banking': 'BANKING',
  'banking_finance': 'BANKING',
  'finance': 'BANKING',
  'fiscal': 'FISCAL',
  'fiscal_policy': 'FISCAL',
  'public_finance': 'FISCAL',
  'monetary': 'MONETARY',
  'fx': 'FX',
  'exchange': 'FX',
  'trade': 'TRADE',
  'commerce': 'TRADE',
  'humanitarian': 'HUMAN',
  'aid': 'AID',
  'aid_flows': 'AID',
  'food_security': 'FOOD',
  'food': 'FOOD',
  'agriculture': 'FOOD',
  'energy': 'ENERGY',
  'infrastructure': 'INFRA',
  'conflict': 'CONFLICT',
  'security': 'CONFLICT',
  'demographics': 'DEMO',
  'population': 'DEMO',
  'social': 'SOCIAL',
  'labor': 'LABOR',
  'employment': 'LABOR',
  'poverty': 'POVERTY',
  'environment': 'ENV'
};

interface SourceRow {
  source_id?: string;
  sourceId?: string;
  src_id?: string;
  name?: string;
  name_en?: string;
  name_ar?: string;
  altName?: string;
  publisher?: string;
  tier?: string;
  status?: string;
  api_url?: string;
  apiUrl?: string;
  web_url?: string;
  webUrl?: string;
  url?: string;
  access_type?: string;
  accessType?: string;
  update_frequency?: string;
  updateFrequency?: string;
  frequency_normalized?: string;
  description?: string;
  license?: string;
  geographic_scope?: string;
  geographicScope?: string;
  primary_sector?: string;
  primarySector?: string;
  sectors_fed?: string;
  sectorsFed?: string;
  sector_tags?: string;
  api_key_required?: string | boolean;
  apiKeyRequired?: string | boolean;
  needs_partnership?: string | boolean;
  needsPartnership?: string | boolean;
  partnership_contact?: string;
  partnershipContact?: string;
  confidence_rating?: string;
  confidenceRating?: string;
  connector_type?: string;
  connectorType?: string;
  notes?: string;
  active?: string | boolean;
  [key: string]: any;
}

export interface ImportResult {
  imported: number;
  updated: number;
  skipped: number;
  errors: Array<{
    row: number;
    sourceId: string;
    error: string;
  }>;
  sectorMappingsCreated: number;
}

/**
 * Import sources from Excel workbook
 */
export async function importSourcesFromExcel(
  excelPath: string,
  options: {
    sheetName?: string;
    createSectorMappings?: boolean;
    updateExisting?: boolean;
  } = {}
): Promise<ImportResult> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const {
    sheetName = 'Sources Master',
    createSectorMappings = true,
    updateExisting = true
  } = options;

  const result: ImportResult = {
    imported: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    sectorMappingsCreated: 0
  };

  try {
    // Read Excel file
    const workbook = XLSX.readFile(excelPath);
    const sheetNames = workbook.SheetNames;
    const targetSheet = sheetNames.includes(sheetName) 
      ? sheetName 
      : sheetNames[0];
    
    console.log(`[SourceImport] Reading from sheet: ${targetSheet}`);
    const worksheet = workbook.Sheets[targetSheet];
    const rows: SourceRow[] = XLSX.utils.sheet_to_json(worksheet);

    console.log(`[SourceImport] Found ${rows.length} rows to process`);

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // Excel row number (1-indexed + header)

      try {
        // Extract and normalize fields
        const sourceId = extractValue(row, ['source_id', 'sourceId', 'src_id']) || `SRC-${String(rowNum).padStart(3, '0')}`;
        const name = extractValue(row, ['name', 'name_en']) || '';
        const altName = extractValue(row, ['name_ar', 'altName']);
        const publisher = extractValue(row, ['publisher', 'institution']);
        const tier = normalizeTier(extractValue(row, ['tier']));
        const status = normalizeStatus(extractValue(row, ['status', 'active']));
        const apiUrl = extractValue(row, ['api_url', 'apiUrl']);
        const webUrl = extractValue(row, ['web_url', 'webUrl', 'url']);
        const accessType = normalizeAccessType(extractValue(row, ['access_type', 'accessType']));
        const updateFrequency = normalizeFrequency(extractValue(row, ['update_frequency', 'updateFrequency', 'frequency_normalized']));
        const description = extractValue(row, ['description', 'notes']);
        const license = extractValue(row, ['license']);
        const geographicScope = extractValue(row, ['geographic_scope', 'geographicScope', 'coverage']);
        const apiKeyRequired = normalizeBoolean(extractValue(row, ['api_key_required', 'apiKeyRequired']));
        const needsPartnership = normalizeBoolean(extractValue(row, ['needs_partnership', 'needsPartnership']));
        const partnershipContact = extractValue(row, ['partnership_contact', 'partnershipContact', 'api_key_contact']);
        const confidenceRating = extractValue(row, ['confidence_rating', 'confidenceRating', 'reliability_score']);
        const connectorType = extractValue(row, ['connector_type', 'connectorType', 'ingestion_method']);

        // Extract sectors
        const primarySector = extractValue(row, ['primary_sector', 'primarySector', 'category']);
        const sectorsFed = extractValue(row, ['sectors_fed', 'sectorsFed', 'sector_tags']);
        const sectors = extractSectors(primarySector, sectorsFed);

        // Validate required fields
        if (!name || name.length < 2) {
          result.skipped++;
          continue;
        }

        // Check if source exists
        const existingResult = await db.execute(sql`
          SELECT id FROM source_registry WHERE sourceId = ${sourceId} LIMIT 1
        `);
        const existing = (existingResult as any)[0]?.[0];

        if (existing && !updateExisting) {
          result.skipped++;
          continue;
        }

        // Prepare data
        const sourceData = {
          sourceId,
          name: name.substring(0, 500),
          altName: altName?.substring(0, 500) || null,
          publisher: publisher?.substring(0, 255) || null,
          apiUrl: apiUrl?.substring(0, 1000) || null,
          webUrl: webUrl?.substring(0, 1000) || null,
          accessType,
          apiKeyRequired,
          tier,
          status,
          updateFrequency,
          geographicScope: geographicScope?.substring(0, 100) || null,
          description: description?.substring(0, 5000) || null,
          license: license?.substring(0, 500) || null,
          confidenceRating: confidenceRating?.substring(0, 10) || null,
          needsPartnership,
          partnershipContact: partnershipContact?.substring(0, 255) || null,
          connectorType: connectorType?.substring(0, 100) || null,
          sectorsFed: JSON.stringify(sectors),
          registryType: 'master'
        };

        if (existing) {
          // Update existing source
          await db.execute(sql`
            UPDATE source_registry SET
              name = ${sourceData.name},
              altName = ${sourceData.altName},
              publisher = ${sourceData.publisher},
              apiUrl = ${sourceData.apiUrl},
              webUrl = ${sourceData.webUrl},
              accessType = ${sourceData.accessType},
              apiKeyRequired = ${sourceData.apiKeyRequired},
              tier = ${sourceData.tier},
              status = ${sourceData.status},
              updateFrequency = ${sourceData.updateFrequency},
              geographicScope = ${sourceData.geographicScope},
              description = ${sourceData.description},
              license = ${sourceData.license},
              confidenceRating = ${sourceData.confidenceRating},
              needsPartnership = ${sourceData.needsPartnership},
              partnershipContact = ${sourceData.partnershipContact},
              connectorType = ${sourceData.connectorType},
              sectorsFed = ${sourceData.sectorsFed},
              updatedAt = NOW()
            WHERE id = ${existing.id}
          `);
          result.updated++;

          // Create sector mappings if requested
          if (createSectorMappings && sectors.length > 0) {
            const mappingsCreated = await createSectorMappingsForSource(existing.id, sectors);
            result.sectorMappingsCreated += mappingsCreated;
          }
        } else {
          // Insert new source
          const insertResult = await db.execute(sql`
            INSERT INTO source_registry (
              sourceId, name, altName, publisher, apiUrl, webUrl, accessType,
              apiKeyRequired, tier, status, updateFrequency, geographicScope,
              description, license, confidenceRating, needsPartnership,
              partnershipContact, connectorType, sectorsFed, registryType,
              createdAt, updatedAt
            ) VALUES (
              ${sourceData.sourceId},
              ${sourceData.name},
              ${sourceData.altName},
              ${sourceData.publisher},
              ${sourceData.apiUrl},
              ${sourceData.webUrl},
              ${sourceData.accessType},
              ${sourceData.apiKeyRequired},
              ${sourceData.tier},
              ${sourceData.status},
              ${sourceData.updateFrequency},
              ${sourceData.geographicScope},
              ${sourceData.description},
              ${sourceData.license},
              ${sourceData.confidenceRating},
              ${sourceData.needsPartnership},
              ${sourceData.partnershipContact},
              ${sourceData.connectorType},
              ${sourceData.sectorsFed},
              ${sourceData.registryType},
              NOW(),
              NOW()
            )
          `);

          const newId = (insertResult as any)[0]?.insertId;
          result.imported++;

          // Create sector mappings if requested
          if (createSectorMappings && sectors.length > 0 && newId) {
            const mappingsCreated = await createSectorMappingsForSource(newId, sectors);
            result.sectorMappingsCreated += mappingsCreated;
          }
        }
      } catch (error) {
        console.error(`[SourceImport] Error processing row ${rowNum}:`, error);
        result.errors.push({
          row: rowNum,
          sourceId: extractValue(row, ['source_id', 'sourceId', 'src_id']) || `row-${rowNum}`,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    console.log(`[SourceImport] Complete: ${result.imported} imported, ${result.updated} updated, ${result.skipped} skipped, ${result.errors.length} errors`);
    return result;
  } catch (error) {
    console.error('[SourceImport] Import failed:', error);
    throw error;
  }
}

/**
 * Create sector mappings for a source
 */
async function createSectorMappingsForSource(
  sourceRegistryId: number,
  sectors: string[]
): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  let created = 0;

  // Delete existing mappings
  await db.execute(sql`
    DELETE FROM registry_sector_map WHERE sourceRegistryId = ${sourceRegistryId}
  `);

  // Create new mappings
  for (let i = 0; i < sectors.length; i++) {
    const sectorCode = sectors[i];
    const weight = i === 0 ? 'primary' : i === 1 ? 'secondary' : 'tertiary';

    try {
      await db.execute(sql`
        INSERT INTO registry_sector_map (sourceRegistryId, sectorCode, weight, createdAt, updatedAt)
        VALUES (${sourceRegistryId}, ${sectorCode}, ${weight}, NOW(), NOW())
        ON DUPLICATE KEY UPDATE weight = ${weight}, updatedAt = NOW()
      `);
      created++;
    } catch (error) {
      console.error(`[SourceImport] Failed to create sector mapping for ${sectorCode}:`, error);
    }
  }

  return created;
}

/**
 * Initialize sector codebook with standard YETO sectors
 */
export async function initializeSectorCodebook(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const sectors = [
    { code: 'MACRO', name: 'Macroeconomic', nameAr: 'الاقتصاد الكلي', order: 1 },
    { code: 'BANKING', name: 'Banking & Finance', nameAr: 'المصارف والتمويل', order: 2 },
    { code: 'FISCAL', name: 'Fiscal Policy & Public Finance', nameAr: 'السياسة المالية والمالية العامة', order: 3 },
    { code: 'MONETARY', name: 'Monetary Policy', nameAr: 'السياسة النقدية', order: 4 },
    { code: 'FX', name: 'Foreign Exchange', nameAr: 'الصرف الأجنبي', order: 5 },
    { code: 'TRADE', name: 'Trade & Commerce', nameAr: 'التجارة والتجارة', order: 6 },
    { code: 'HUMAN', name: 'Humanitarian', nameAr: 'الإنسانية', order: 7 },
    { code: 'AID', name: 'Aid Flows', nameAr: 'تدفقات المساعدات', order: 8 },
    { code: 'FOOD', name: 'Food Security & Agriculture', nameAr: 'الأمن الغذائي والزراعة', order: 9 },
    { code: 'ENERGY', name: 'Energy', nameAr: 'الطاقة', order: 10 },
    { code: 'INFRA', name: 'Infrastructure', nameAr: 'البنية التحتية', order: 11 },
    { code: 'CONFLICT', name: 'Conflict & Security', nameAr: 'الصراع والأمن', order: 12 },
    { code: 'DEMO', name: 'Demographics', nameAr: 'الديموغرافيا', order: 13 },
    { code: 'SOCIAL', name: 'Social Indicators', nameAr: 'المؤشرات الاجتماعية', order: 14 },
    { code: 'LABOR', name: 'Labor & Employment', nameAr: 'العمل والتوظيف', order: 15 },
    { code: 'POVERTY', name: 'Poverty & Distribution', nameAr: 'الفقر والتوزيع', order: 16 },
    { code: 'ENV', name: 'Environment', nameAr: 'البيئة', order: 17 }
  ];

  let created = 0;
  for (const sector of sectors) {
    try {
      await db.execute(sql`
        INSERT INTO sector_codebook (sectorCode, sectorName, sectorNameAr, displayOrder, isActive, createdAt, updatedAt)
        VALUES (${sector.code}, ${sector.name}, ${sector.nameAr}, ${sector.order}, true, NOW(), NOW())
        ON DUPLICATE KEY UPDATE 
          sectorName = ${sector.name},
          sectorNameAr = ${sector.nameAr},
          displayOrder = ${sector.order},
          updatedAt = NOW()
      `);
      created++;
    } catch (error) {
      console.error(`[SourceImport] Failed to create sector ${sector.code}:`, error);
    }
  }

  console.log(`[SourceImport] Initialized ${created} sectors in codebook`);
  return created;
}

// Helper functions

function extractValue(row: SourceRow, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && value !== '') {
      return String(value).trim();
    }
  }
  return undefined;
}

function normalizeTier(tier?: string): 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'UNKNOWN' {
  if (!tier) return 'UNKNOWN';
  const normalized = tier.toUpperCase().trim();
  return TIER_MAP[normalized] || 'UNKNOWN';
}

function normalizeStatus(status?: string): 'ACTIVE' | 'PENDING_REVIEW' | 'NEEDS_KEY' | 'INACTIVE' | 'DEPRECATED' {
  if (!status) return 'PENDING_REVIEW';
  const normalized = status.toUpperCase().trim();
  if (normalized === 'TRUE' || normalized === '1' || normalized === 'YES') return 'ACTIVE';
  if (normalized === 'FALSE' || normalized === '0' || normalized === 'NO') return 'INACTIVE';
  return STATUS_MAP[normalized] || 'PENDING_REVIEW';
}

function normalizeAccessType(accessType?: string): string {
  if (!accessType) return 'WEB';
  const normalized = accessType.toUpperCase().trim();
  return ACCESS_TYPE_MAP[normalized] || 'WEB';
}

function normalizeFrequency(frequency?: string): string {
  if (!frequency) return 'IRREGULAR';
  const normalized = frequency.toUpperCase().trim();
  return FREQUENCY_MAP[normalized] || 'IRREGULAR';
}

function normalizeBoolean(value?: string | boolean): boolean {
  if (typeof value === 'boolean') return value;
  if (!value) return false;
  const normalized = String(value).toLowerCase().trim();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}

function extractSectors(primarySector?: string, sectorsFed?: string): string[] {
  const sectors: string[] = [];
  const seen = new Set<string>();

  // Add primary sector first
  if (primarySector) {
    const mapped = mapSectorName(primarySector);
    if (mapped && !seen.has(mapped)) {
      sectors.push(mapped);
      seen.add(mapped);
    }
  }

  // Add additional sectors
  if (sectorsFed) {
    const parts = sectorsFed.split(/[,;|]/).map(s => s.trim());
    for (const part of parts) {
      const mapped = mapSectorName(part);
      if (mapped && !seen.has(mapped)) {
        sectors.push(mapped);
        seen.add(mapped);
      }
    }
  }

  return sectors;
}

function mapSectorName(name: string): string | null {
  if (!name) return null;
  const normalized = name.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');
  return SECTOR_CODE_MAP[normalized] || null;
}

/**
 * Import from default Excel file in /workspace/data/
 */
export async function importFromDefaultExcel(): Promise<ImportResult> {
  const dataDir = path.join(process.cwd(), 'data');
  const excelFiles = [
    'YETO_Sources_Universe_Master_PRODUCTION_READY_v2_5.xlsx',
    'YETO_Sources_Universe_Master_PRODUCTION_READY_v2_0.xlsx',
    'YETO_Sources_Universe_Master_FINAL_v1_2.xlsx'
  ];

  for (const file of excelFiles) {
    const filePath = path.join(dataDir, file);
    if (fs.existsSync(filePath)) {
      console.log(`[SourceImport] Importing from ${file}`);
      return await importSourcesFromExcel(filePath);
    }
  }

  throw new Error('No source Excel file found in /workspace/data/');
}

/**
 * Get import statistics
 */
export async function getImportStatistics(): Promise<{
  totalSources: number;
  byTier: Record<string, number>;
  byStatus: Record<string, number>;
  byAccessType: Record<string, number>;
  sectorsWithMappings: number;
  sourcesWithMappings: number;
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalSources: 0,
      byTier: {},
      byStatus: {},
      byAccessType: {},
      sectorsWithMappings: 0,
      sourcesWithMappings: 0
    };
  }

  // Total sources
  const [totalResult] = await db.execute(sql`SELECT COUNT(*) as count FROM source_registry`);
  const totalSources = (totalResult as any)[0]?.count || 0;

  // By tier
  const tierResult = await db.execute(sql`
    SELECT tier, COUNT(*) as count FROM source_registry GROUP BY tier
  `);
  const byTier: Record<string, number> = {};
  for (const row of (tierResult as any)[0] || []) {
    byTier[row.tier || 'UNKNOWN'] = row.count;
  }

  // By status
  const statusResult = await db.execute(sql`
    SELECT status, COUNT(*) as count FROM source_registry GROUP BY status
  `);
  const byStatus: Record<string, number> = {};
  for (const row of (statusResult as any)[0] || []) {
    byStatus[row.status || 'PENDING_REVIEW'] = row.count;
  }

  // By access type
  const accessResult = await db.execute(sql`
    SELECT accessType, COUNT(*) as count FROM source_registry GROUP BY accessType
  `);
  const byAccessType: Record<string, number> = {};
  for (const row of (accessResult as any)[0] || []) {
    byAccessType[row.accessType || 'WEB'] = row.count;
  }

  // Sectors with mappings
  const [sectorsResult] = await db.execute(sql`
    SELECT COUNT(DISTINCT sectorCode) as count FROM registry_sector_map
  `);
  const sectorsWithMappings = (sectorsResult as any)[0]?.count || 0;

  // Sources with mappings
  const [sourcesResult] = await db.execute(sql`
    SELECT COUNT(DISTINCT sourceRegistryId) as count FROM registry_sector_map
  `);
  const sourcesWithMappings = (sourcesResult as any)[0]?.count || 0;

  return {
    totalSources,
    byTier,
    byStatus,
    byAccessType,
    sectorsWithMappings,
    sourcesWithMappings
  };
}
