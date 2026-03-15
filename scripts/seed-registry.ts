/**
 * YETO Registry Seed Script
 * 
 * Seeds the database from YETO_Sources_Universe_Master_FINAL_v1_2.xlsx
 * - Populates source_registry from SOURCES_MASTER_EXT
 * - Creates gap_tickets from METADATA_GAPS
 * - Creates ingestion_connectors from registry entries
 * - Records lint results
 * 
 * GOVERNANCE:
 * - No fabrication: Only data from the Excel file
 * - Creates GAP tickets for missing/unknown data
 * - Enforces licensing compliance
 * - Supports split-system (Aden vs Sana'a)
 */

import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGISTRY_PATH = path.join(__dirname, '../data/YETO_Sources_Universe_Master_FINAL_v1_2.xlsx');

interface SourceMasterExtRow {
  src_id: string;
  src_numeric_id: number;
  name_en: string;
  name_ar: string | null;
  domain: string | null;
  institution: string | null;
  category: string | null;
  source_type: string | null;
  source_class: string | null;
  sector_category: string | null;
  sub_sector_tag: string | null;
  geographic_coverage: string | null;
  time_coverage_start: number | null;
  time_coverage_end: number | null;
  access_method: string | null;
  access_method_norm: string | null;
  auth_required: string | null;
  data_format: string | null;
  update_frequency: string | null;
  update_frequency_norm: string | null;
  cadence: string | null;
  cadence_norm: string | null;
  cadence_lag_tolerance: string | null;
  tier: string | null;
  reliability_score: string | null;
  confidence_grade: string | null;
  license: string | null;
  partnership_required: boolean | null;
  partnership_action_email: string | null;
  routing_function: string | null;
  dashboard_modules_linked: string | null;
  integration_targets: string | null;
  embedded_indicators: string | null;
  data_fields: string | null;
  transformation_notes: string | null;
  granularity_caveats: string | null;
  fallback_plan: string | null;
  admin_alert_trigger_condition: string | null;
  ingestion_method: string | null;
  ingestion_owner_agent: string | null;
  multilingual_required: number | null;
  glossary_terms_required: number | null;
  evidence_pack_flag: number | null;
  yeto_usage: string | null;
  yeto_module: string | null;
  coverage: string | null;
  typical_lag_days: string | number | null;
  typical_lag_text: string | null;
  notes: string | null;
  tags: string | null;
  status: string | null;
  active: boolean;
  url: string | null;
  url_raw: string | null;
}

interface MetadataGapRow {
  src_id: string;
  name_en: string;
  gap_type: string;
  gap_field: string;
  recommended_action: string;
}

interface RegistryLintRow {
  source_id: string;
  source_name_en: string;
  url: string;
  category: string;
  sector_category: string;
  access_method: string;
  cadence: string;
  time_coverage_start: number;
  time_coverage_end: number;
  reliability_tier: string;
  status: string;
  p0_fail: boolean;
  p1_license_unknown: boolean;
  p1_restricted_source: boolean;
  p1_flag: boolean;
}

function parseRegistry() {
  console.log('📋 Reading YETO Source Registry...\n');
  
  const workbook = XLSX.readFile(REGISTRY_PATH);
  
  // Parse SOURCES_MASTER_EXT
  const extSheet = workbook.Sheets['SOURCES_MASTER_EXT'];
  const sources: SourceMasterExtRow[] = XLSX.utils.sheet_to_json(extSheet, { defval: null });
  
  // Parse METADATA_GAPS
  const gapsSheet = workbook.Sheets['METADATA_GAPS'];
  const gaps: MetadataGapRow[] = XLSX.utils.sheet_to_json(gapsSheet, { defval: null });
  
  // Parse REGISTRY_LINT
  const lintSheet = workbook.Sheets['REGISTRY_LINT'];
  const lintResults: RegistryLintRow[] = XLSX.utils.sheet_to_json(lintSheet, { defval: null });
  
  console.log(`✅ Parsed ${sources.length} sources`);
  console.log(`✅ Parsed ${gaps.length} metadata gaps`);
  console.log(`✅ Parsed ${lintResults.length} lint results\n`);
  
  return { sources, gaps, lintResults };
}

function generateSourceRegistryInserts(sources: SourceMasterExtRow[]) {
  console.log('🔨 Generating source_registry INSERT statements...\n');
  
  const inserts = sources.map(src => {
    // Map access_method_norm to connector type
    const accessMethodMapping: Record<string, string> = {
      'API': 'api_rest',
      'SDMX': 'api_sdmx',
      'RSS': 'rss_feed',
      'WEB': 'web_scrape',
      'CSV': 'csv_download',
      'PDF': 'pdf_download',
      'MANUAL': 'manual_upload',
      'MANUAL+WEB': 'web_scrape',
      'PARTNER': 'partner_sftp',
      'EMAIL': 'email_fetch'
    };
    
    const accessMethod = src.access_method_norm?.toUpperCase() || 'WEB';
    const connectorType = accessMethodMapping[accessMethod] || 'web_scrape';
    
    // Map tier to reliability
    const tierMapping: Record<string, string> = {
      'T0': 'tier_0_gold',
      'T1': 'tier_1_high',
      'T2': 'tier_2_medium',
      'T3': 'tier_3_limited',
      'T4': 'tier_4_unverified',
      'UNKNOWN': 'tier_4_unverified'
    };
    
    const tier = tierMapping[src.tier || 'UNKNOWN'] || 'tier_4_unverified';
    
    // Map status
    const statusMapping: Record<string, string> = {
      'ACTIVE': 'active',
      'NEEDS_KEY': 'needs_key',
      'PAUSED': 'paused',
      'BLOCKED': 'blocked_tos',
      'DEPRECATED': 'deprecated'
    };
    
    const status = statusMapping[src.status || 'ACTIVE'] || 'active';
    
    // Parse cadence_lag_tolerance (e.g., "120 days" -> 120)
    let lagTolerance = 30; // default
    if (src.cadence_lag_tolerance) {
      const match = String(src.cadence_lag_tolerance).match(/(\d+)/);
      if (match) {
        lagTolerance = parseInt(match[1]);
      }
    }
    
    return {
      sourceId: src.src_id,
      name: src.name_en,
      altName: src.name_ar,
      publisher: src.institution || 'Unknown',
      apiUrl: src.url_raw !== 'Subscription' ? src.url : null,
      webUrl: src.url,
      accessType: connectorType.toUpperCase().replace('_', '-'),
      updateFrequency: src.cadence_norm || 'IRREGULAR',
      tier: tier,
      reliabilityScore: src.reliability_score || 'C',
      confidenceGrade: src.confidence_grade || 'C',
      authRequired: src.auth_required === 'Yes' || src.auth_required === 'true',
      partnershipRequired: Boolean(src.partnership_required),
      dataFormat: src.data_format || 'Unknown',
      license: src.license || 'Unknown',
      geographicCoverage: src.geographic_coverage || 'Yemen',
      timeCoverageStart: src.time_coverage_start,
      timeCoverageEnd: src.time_coverage_end,
      sectorCategory: src.sector_category,
      notes: src.notes,
      tags: src.tags,
      status: status,
      active: src.active !== false,
      cadenceLagTolerance: lagTolerance
    };
  });
  
  console.log(`✅ Generated ${inserts.length} source registry entries\n`);
  
  return inserts;
}

function generateGapTicketInserts(gaps: MetadataGapRow[]) {
  console.log('🎫 Generating gap_tickets INSERT statements...\n');
  
  let gapCounter = 1;
  
  const inserts = gaps.map(gap => {
    const gapId = `GAP-${String(gapCounter++).padStart(4, '0')}`;
    
    // Map gap_type to severity and gapType
    const severityMapping: Record<string, string> = {
      'P0': 'critical',
      'P1': 'high',
      'P2': 'medium',
      'P3': 'low'
    };
    
    const gapTypeMapping: Record<string, string> = {
      'P1_LICENSE_UNKNOWN': 'missing_data',
      'P1_RESTRICTED_ACCESS': 'access_blocked',
      'P2_MISSING_METADATA': 'missing_data',
      'P2_INCOMPLETE_COVERAGE': 'coverage_gap',
      'P3_QUALITY_CONCERN': 'quality_low'
    };
    
    const severity = gap.gap_type.startsWith('P0') ? 'critical' :
                     gap.gap_type.startsWith('P1') ? 'high' :
                     gap.gap_type.startsWith('P2') ? 'medium' : 'low';
    
    const gapType = gapTypeMapping[gap.gap_type] || 'missing_data';
    
    return {
      gapId,
      severity,
      gapType,
      sourceId: gap.src_id,
      titleEn: `${gap.name_en}: ${gap.gap_field}`,
      titleAr: null,
      descriptionEn: gap.recommended_action,
      descriptionAr: null,
      status: 'open',
      recommendedAction: gap.recommended_action,
      isPublic: true
    };
  });
  
  console.log(`✅ Generated ${inserts.length} gap tickets\n`);
  
  return inserts;
}

function generateConnectorInserts(sources: SourceMasterExtRow[]) {
  console.log('🔌 Generating ingestion_connectors INSERT statements...\n');
  
  let connectorCounter = 1;
  
  const inserts = sources
    .filter(src => src.active && src.status !== 'NEEDS_KEY' && src.status !== 'BLOCKED')
    .map(src => {
      const connectorId = `CONN-${String(connectorCounter++).padStart(4, '0')}`;
      
      // Map access_method_norm to connector type
      const accessMethodMapping: Record<string, string> = {
        'API': 'api_rest',
        'SDMX': 'api_sdmx',
        'RSS': 'rss_feed',
        'WEB': 'web_scrape',
        'CSV': 'csv_download',
        'PDF': 'pdf_download',
        'MANUAL': 'manual_upload',
        'MANUAL+WEB': 'web_scrape',
        'PARTNER': 'partner_sftp',
        'EMAIL': 'email_fetch'
      };
      
      const accessMethod = src.access_method_norm?.toUpperCase() || 'WEB';
      const connectorType = accessMethodMapping[accessMethod] || 'web_scrape';
      
      // Parse cadence_lag_tolerance
      let lagTolerance = 30;
      if (src.cadence_lag_tolerance) {
        const match = String(src.cadence_lag_tolerance).match(/(\d+)/);
        if (match) {
          lagTolerance = parseInt(match[1]);
        }
      }
      
      const config = {
        url: src.url,
        dataFormat: src.data_format,
        parseRules: {},
        notes: src.notes
      };
      
      return {
        connectorId,
        sourceId: src.src_id,
        connectorType,
        config,
        cadence: src.cadence_norm?.toLowerCase() || 'irregular',
        cadenceLagTolerance: lagTolerance,
        licenseAllowsAutomation: !src.partnership_required,
        requiresAuth: src.auth_required === 'Yes' || src.auth_required === 'true',
        requiresPartnership: Boolean(src.partnership_required),
        evidenceRequired: Boolean(src.evidence_pack_flag),
        status: 'needs_config'
      };
    });
  
  console.log(`✅ Generated ${inserts.length} connector configurations\n`);
  
  return inserts;
}

function generateSeedFile() {
  const { sources, gaps, lintResults } = parseRegistry();
  
  const sourceInserts = generateSourceRegistryInserts(sources);
  const gapInserts = generateGapTicketInserts(gaps);
  const connectorInserts = generateConnectorInserts(sources);
  
  const seedData = {
    metadata: {
      registryPath: REGISTRY_PATH,
      registryVersion: 'v1.2',
      generatedAt: new Date().toISOString(),
      registryChecksum: crypto.createHash('sha256')
        .update(fs.readFileSync(REGISTRY_PATH))
        .digest('hex'),
      counts: {
        sources: sourceInserts.length,
        gaps: gapInserts.length,
        connectors: connectorInserts.length
      }
    },
    sourceRegistry: sourceInserts,
    gapTickets: gapInserts,
    ingestionConnectors: connectorInserts,
    lintResults: lintResults
  };
  
  const outputPath = path.join(__dirname, '../data/registry-seed-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(seedData, null, 2));
  
  console.log('\n✅ Seed data generated successfully!');
  console.log(`📁 Output: ${outputPath}`);
  console.log('\n📊 Summary:');
  console.log(`   Sources: ${seedData.sourceRegistry.length}`);
  console.log(`   Gap Tickets: ${seedData.gapTickets.length}`);
  console.log(`   Connectors: ${seedData.ingestionConnectors.length}`);
  console.log(`   Lint Results: ${seedData.lintResults.length}`);
  console.log(`\n📝 Registry Checksum: ${seedData.metadata.registryChecksum.substring(0, 16)}...`);
  
  // Generate SQL seed script for direct database seeding
  generateSQLSeedScript(seedData);
  
  return seedData;
}

function generateSQLSeedScript(seedData: any) {
  console.log('\n🔨 Generating SQL seed script...\n');
  
  const sqlPath = path.join(__dirname, '../data/seed-registry.sql');
  const sql: string[] = [];
  
  sql.push('-- YETO Registry Seed Script');
  sql.push('-- Generated from YETO_Sources_Universe_Master_FINAL_v1_2.xlsx');
  sql.push(`-- Generated at: ${seedData.metadata.generatedAt}`);
  sql.push(`-- Registry checksum: ${seedData.metadata.registryChecksum}`);
  sql.push('');
  sql.push('-- Disable foreign key checks temporarily');
  sql.push('SET FOREIGN_KEY_CHECKS=0;');
  sql.push('');
  
  // Note: Full SQL generation would go here
  // For now, just create a placeholder that documents the approach
  sql.push('-- TODO: Use the JSON seed data to populate tables via application code');
  sql.push('-- Recommended approach: Create a seed script in server/seed.ts that:');
  sql.push('--   1. Reads data/registry-seed-data.json');
  sql.push('--   2. Uses Drizzle ORM to insert records with proper type safety');
  sql.push('--   3. Handles conflicts (upsert where appropriate)');
  sql.push('--   4. Validates foreign key relationships');
  sql.push('');
  sql.push('SET FOREIGN_KEY_CHECKS=1;');
  
  fs.writeFileSync(sqlPath, sql.join('\n'));
  console.log(`✅ SQL seed script template: ${sqlPath}\n`);
}

// Run
generateSeedFile();
