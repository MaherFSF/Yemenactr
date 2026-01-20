/**
 * Initialize YETO Source Registry
 * 
 * Loads all 225 data sources from CSV and activates connectors
 * Usage: pnpm ts-node scripts/initialize-sources.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

interface SourceRow {
  'SRC-ID': string;
  'Rank': string;
  'Name': string;
  'Alias': string;
  'Category': string;
  'Type': string;
  'Tier': string;
  'Status': string;
  'URL': string;
  'API_Endpoint': string;
  'Access_Method': string;
  'Update_Cadence': string;
  'Data_Format': string;
  'Indicators': string;
  'Description': string;
  'Notes': string;
  'Requires_Auth': string;
  'API_Key_Env': string;
  'Reliability_Score': string;
  'Active': string;
}

async function initializeSources(): Promise<void> {
  console.log('🚀 Initializing YETO Source Registry...\n');

  const csvPath = path.join(__dirname, '../data/sources-registry.csv');

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found: ${csvPath}`);
    process.exit(1);
  }

  try {
    // Read and parse CSV
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as SourceRow[];

    console.log(`📊 Loaded ${records.length} sources from CSV\n`);

    // Analyze sources by tier
    const byTier: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byFrequency: Record<string, number> = {};
    const byAccessMethod: Record<string, number> = {};

    for (const row of records) {
      const tier = row['Tier'] || 'T2';
      const status = row['Status'] || 'PENDING_REVIEW';
      const cadence = row['Update_Cadence'] || 'ANNUAL';
      const method = row['Access_Method'] || 'WEB';

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
    const connectorConfig = generateConnectorConfig(records);

    // Save to file
    const configPath = path.join(__dirname, '../server/connectors/sources-config.json');
    fs.writeFileSync(configPath, JSON.stringify(connectorConfig, null, 2));

    console.log(`\n✅ Generated connector configuration: ${configPath}`);
    console.log(`   Total connectors: ${connectorConfig.sources.length}`);
    console.log(`   Active connectors: ${connectorConfig.sources.filter((s: any) => s.active).length}`);

    // Generate initialization code
    const initCode = generateInitializationCode(records);
    const initPath = path.join(__dirname, '../server/connectors/sources-init.ts');
    fs.writeFileSync(initPath, initCode);

    console.log(`✅ Generated initialization code: ${initPath}`);

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
    console.log(`   Real-time/Continuous: ${byFrequency['CONTINUOUS'] || 0}`);
    console.log(`   Daily: ${byFrequency['DAILY'] || 0}`);
    console.log(`   Weekly: ${byFrequency['WEEKLY'] || 0}`);
    console.log(`   Monthly: ${byFrequency['MONTHLY'] || 0}`);
    console.log(`   Quarterly: ${byFrequency['QUARTERLY'] || 0}`);
    console.log(`   Annual: ${byFrequency['ANNUAL'] || 0}`);
    console.log(`\n🔌 Access Methods:`);
    Object.entries(byAccessMethod).forEach(([method, count]) => {
      console.log(`   ${method}: ${count}`);
    });

    console.log('\n✅ Next steps:');
    console.log('   1. Review sources-config.json for accuracy');
    console.log('   2. Run: pnpm ts-node scripts/test-connectors.ts');
    console.log('   3. Start ingestion: await orchestrator.start()');
  } catch (error) {
    console.error('❌ Error initializing sources:', error);
    process.exit(1);
  }
}

function generateConnectorConfig(records: SourceRow[]): any {
  return {
    version: '1.0',
    timestamp: new Date().toISOString(),
    totalSources: records.length,
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
      apiEndpoint: row['API_Endpoint'],
      accessMethod: row['Access_Method'] || 'WEB',
      updateCadence: row['Update_Cadence'] || 'ANNUAL',
      dataFormat: row['Data_Format'] || 'JSON',
      indicators: (row['Indicators'] || '').split(',').filter((i: string) => i.trim()),
      description: row['Description'],
      notes: row['Notes'],
      requiresAuth: row['Requires_Auth'] === 'true',
      apiKeyEnv: row['API_Key_Env'],
      reliabilityScore: parseInt(row['Reliability_Score'] || '75'),
      active: row['Active'] === 'true' || row['Status'] === 'ACTIVE',
      coverage: {
        start: '2010-01-01',
        end: '2026-12-31',
      },
    })),
  };
}

function generateInitializationCode(records: SourceRow[]): string {
  const activeSources = records.filter(r => r['Status'] === 'ACTIVE' || r['Active'] === 'true');

  return `/**
 * Auto-generated YETO Source Initialization
 * Generated: ${new Date().toISOString()}
 * Total Sources: ${records.length}
 * Active Sources: ${activeSources.length}
 */

import { registry } from './universal-connector';

export async function initializeAllSources(): Promise<void> {
  console.log('🚀 Initializing ${records.length} YETO data sources...');

  // Register all sources
  const sources = [
${records
  .map(
    (row, idx) => `    {
      sourceId: '${row['SRC-ID'] || `SRC-${String(idx + 1).padStart(3, '0')}`}',
      sourceName: '${row['Name'].replace(/'/g, "\\'")}',
      category: '${row['Category']}',
      url: '${row['URL']}',
      apiEndpoint: '${row['API_Endpoint'] || ''}',
      accessMethod: '${row['Access_Method'] || 'WEB'}',
      updateFrequency: '${row['Update_Cadence'] || 'ANNUAL'}',
      tier: '${row['Tier'] || 'T2'}',
      requiresAuth: ${row['Requires_Auth'] === 'true'},
      requiresKey: '${row['API_Key_Env'] || ''}',
      dataFormat: '${row['Data_Format'] || 'JSON'}',
      indicators: [${(row['Indicators'] || '')
        .split(',')
        .filter((i: string) => i.trim())
        .map((i: string) => `'${i.trim()}'`)
        .join(', ')}],
      coverage: { start: new Date('2010-01-01'), end: new Date('2026-12-31') },
      reliabilityScore: ${parseInt(row['Reliability_Score'] || '75')},
    },`
  )
  .join('\n')}
  ];

  for (const config of sources) {
    try {
      registry.registerSource(config);
    } catch (error) {
      console.error(\`Failed to register \${config.sourceId}:\`, error);
    }
  }

  console.log(\`✅ Registered \${sources.length} sources\`);
  console.log(\`   Active: \${sources.filter(s => s.tier === 'T1').length} Tier 1\`);
  console.log(\`   High: \${sources.filter(s => s.tier === 'T2').length} Tier 2\`);
  console.log(\`   Medium: \${sources.filter(s => s.tier === 'T3').length} Tier 3\`);
  console.log(\`   Low: \${sources.filter(s => s.tier === 'T4').length} Tier 4\`);
}

export default initializeAllSources;
`;
}

// Run initialization
initializeSources().catch(console.error);
