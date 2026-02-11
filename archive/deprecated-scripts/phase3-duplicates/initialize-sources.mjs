/**
 * Initialize YETO Source Registry
 * 
 * Loads all 225 data sources from CSV and generates connector configuration
 * Usage: node scripts/initialize-sources.mjs
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
  console.log('🚀 Initializing YETO Source Registry...\n');

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

    // Analyze sources by tier
    const byTier = {};
    const byStatus = {};
    const byFrequency = {};
    const byAccessMethod = {};

    for (const row of records) {
      const tier = row['Tier'] || 'T2';
      const status = row['Status'] || 'PENDING_REVIEW';
      const cadence = row['Update Cadence'] || 'ANNUAL';
      const method = row['Access Method'] || 'WEB';

      byTier[tier] = (byTier[tier] || 0) + 1;
      byStatus[status] = (byStatus[status] || 0) + 1;
      byFrequency[cadence] = (byFrequency[cadence] || 0) + 1;
      byAccessMethod[method] = (byAccessMethod[method] || 0) + 1;
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

    // Generate connector configuration
    const connectorConfig = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      totalSources: records.length,
      byTier,
      byStatus,
      byFrequency,
      byAccessMethod,
      sources: records.map((row, index) => ({
        id: row['SRC-ID'] || `SRC-${String(index + 1).padStart(3, '0')}`,
        rank: parseInt(row['Rank'] || '999'),
        name: row['Name'],
        alias: row['Alias'],
        category: row['Category'],
        type: row['Type'],
        tier: row['Tier'] || 'T2',
        status: row['Status'] || 'PENDING_REVIEW',
        url: row['URL'],
        apiEndpoint: row['API Endpoint'],
        accessMethod: row['Access Method'] || 'WEB',
        updateCadence: row['Update Cadence'] || 'ANNUAL',
        dataFormat: row['Data Format'] || 'JSON',
        indicators: (row['Indicators'] || '')
          .split(',')
          .map(i => i.trim())
          .filter(i => i),
        description: row['Description'],
        notes: row['Notes'],
        requiresAuth: row['Requires Auth'] === 'true',
        apiKeyEnv: row['API Key Env'],
        reliabilityScore: parseInt(row['Reliability Score'] || '75'),
        active: row['Active'] === 'true' || row['Status'] === 'ACTIVE',
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
    console.log(`   Active (ACTIVE): ${byStatus['ACTIVE'] || 0}`);
    console.log(`   Pending Review: ${byStatus['PENDING_REVIEW'] || 0}`);
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
