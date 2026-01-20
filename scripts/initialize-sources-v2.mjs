/**
 * Initialize YETO Source Registry - Version 2
 * 
 * Loads all 225+ data sources from CSV and generates connector configuration
 * Uses correct CSV headers from sources_seed_225_revised.csv
 * Usage: node scripts/initialize-sources-v2.mjs
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const values = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''));

    const record = {};
    headers.forEach((header, idx) => {
      record[header] = values[idx] || '';
    });
    records.push(record);
  }

  return records;
}

async function initializeSources() {
  console.log('🚀 Initializing YETO Source Registry (v2)...\n');

  const csvPath = path.join(__dirname, '../data/sources-registry.csv');

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found: ${csvPath}`);
    process.exit(1);
  }

  try {
    // Read and parse CSV
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parseCSV(fileContent);

    console.log(`📊 Loaded ${records.length} sources from CSV\n`);

    // Analyze sources
    const byTier = {};
    const byStatus = {};
    const byFrequency = {};
    const byAccessMethod = {};
    const byModule = {};

    for (const row of records) {
      const tier = row['tier'] || 'T2';
      const status = row['status'] || 'PENDING';
      const cadence = row['cadence'] || 'ANNUAL';
      const method = row['access_method'] || 'WEB';
      const module = row['yeto_module'] || 'OTHER';

      byTier[tier] = (byTier[tier] || 0) + 1;
      byStatus[status] = (byStatus[status] || 0) + 1;
      byFrequency[cadence] = (byFrequency[cadence] || 0) + 1;
      byAccessMethod[method] = (byAccessMethod[method] || 0) + 1;
      byModule[module] = (byModule[module] || 0) + 1;
    }

    console.log('📈 Distribution by Tier:');
    Object.entries(byTier).forEach(([tier, count]) => {
      console.log(`   ${tier}: ${count} sources`);
    });

    console.log('\n📊 Distribution by Status:');
    Object.entries(byStatus).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} sources`);
    });

    console.log('\n⏱️  Distribution by Update Frequency:');
    Object.entries(byFrequency).forEach(([freq, count]) => {
      console.log(`   ${freq}: ${count} sources`);
    });

    console.log('\n🔌 Distribution by Access Method:');
    Object.entries(byAccessMethod).forEach(([method, count]) => {
      console.log(`   ${method}: ${count} sources`);
    });

    console.log('\n📦 Distribution by YETO Module:');
    Object.entries(byModule).forEach(([module, count]) => {
      console.log(`   ${module}: ${count} sources`);
    });

    // Generate connector configuration
    const connectorConfig = {
      version: '2.0',
      timestamp: new Date().toISOString(),
      totalSources: records.length,
      byTier,
      byStatus,
      byFrequency,
      byAccessMethod,
      byModule,
      sources: records.map((row, index) => ({
        id: row['src_id'] || `SRC-${String(index + 1).padStart(3, '0')}`,
        numericId: parseInt(row['src_numeric_id'] || '999'),
        nameEn: row['name_en'],
        nameAr: row['name_ar'],
        category: row['category'],
        tier: row['tier'] || 'T2',
        institution: row['institution'],
        url: row['url'],
        urlRaw: row['url_raw'],
        accessMethod: row['access_method'] || 'WEB',
        updateFrequency: row['update_frequency'],
        cadence: row['cadence'] || 'ANNUAL',
        license: row['license'],
        reliabilityScore: parseInt(row['reliability_score'] || '75'),
        geographicCoverage: row['geographic_coverage'],
        coverage: row['coverage'],
        typicalLagDays: parseInt(row['typical_lag_days'] || '0'),
        typicalLagText: row['typical_lag_text'],
        requiresAuth: row['auth'] === 'true' || row['auth'] === 'True',
        dataFields: (row['data_fields'] || '')
          .split(',')
          .map(f => f.trim())
          .filter(f => f),
        ingestionMethod: row['ingestion_method'],
        yetoUsage: row['yeto_usage'],
        yetoModule: row['yeto_module'],
        granularityCaveats: row['granularity_caveats'],
        notes: row['notes'],
        tags: (row['tags'] || '')
          .split(',')
          .map(t => t.trim())
          .filter(t => t),
        origin: row['origin'],
        status: row['status'] || 'PENDING',
        active: row['active'] === 'true' || row['active'] === 'True',
        coverage: {
          start: '2010-01-01',
          end: '2026-12-31',
        },
      })),
    };

    // Save to file
    const configPath = path.join(__dirname, '../server/connectors/sources-config.json');
    fs.writeFileSync(configPath, JSON.stringify(connectorConfig, null, 2));

    console.log(`\n✅ Generated connector configuration: ${configPath}`);
    console.log(`   Total connectors: ${connectorConfig.sources.length}`);
    console.log(
      `   Active connectors: ${connectorConfig.sources.filter(s => s.active).length}`
    );

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('✅ Source Registry Initialization Complete');
    console.log('='.repeat(80));
    console.log(`\n📦 Registry Summary:`);
    console.log(`   Total Sources: ${records.length}`);
    console.log(`   Active: ${records.filter(r => r['active'] === 'true' || r['active'] === 'True').length}`);
    console.log(`   Pending: ${records.filter(r => r['status'] === 'PENDING').length}`);
    console.log(`   Tier 1 (Priority): ${byTier['T1'] || 0}`);
    console.log(`   Tier 2 (High): ${byTier['T2'] || 0}`);
    console.log(`   Tier 3 (Medium): ${byTier['T3'] || 0}`);
    console.log(`   Tier 4 (Low): ${byTier['T4'] || 0}`);
    console.log(`\n⏱️  Update Frequencies:`);
    Object.entries(byFrequency).forEach(([freq, count]) => {
      console.log(`   ${freq}: ${count}`);
    });
    console.log(`\n🔌 Access Methods:`);
    Object.entries(byAccessMethod).forEach(([method, count]) => {
      console.log(`   ${method}: ${count}`);
    });

    // Show sample sources
    console.log('\n📋 Sample Sources (first 5):');
    connectorConfig.sources.slice(0, 5).forEach(src => {
      console.log(`   - ${src.id}: ${src.nameEn} (${src.tier}, ${src.status})`);
    });

    console.log('\n✅ Next steps:');
    console.log('   1. Review sources-config.json for accuracy');
    console.log('   2. Integrate with connector registry');
    console.log('   3. Start ingestion: await orchestrator.start()');
  } catch (error) {
    console.error('❌ Error initializing sources:', error);
    process.exit(1);
  }
}

// Run initialization
initializeSources().catch(console.error);
