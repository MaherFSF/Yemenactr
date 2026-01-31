/**
 * Ingest year-by-year backfill data into the time_series table
 * Part of STEP 2: Year-by-Year Backfill (2026→2020)
 */

import * as mysql from 'mysql2/promise';
import * as fs from 'fs';

interface BackfillResult {
  input: string;
  output: {
    year: string;
    category: string;
    data_points: number;
    indicators_covered: number;
    gdp_value: string;
    inflation_rate: string;
    exchange_rate: string;
    population: string;
    idp_count: string;
    humanitarian_funding: string;
    food_insecurity: string;
    ipc_phase3_plus: string;
    under5_mortality: string;
    conflict_fatalities: string;
    sources_used: string;
  };
  error: string;
}

function parseNumeric(value: string): number | null {
  if (!value || value === 'N/A' || value === '') return null;
  const cleaned = value.replace(/[%,]/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

async function main() {
  console.log('=== Year-by-Year Backfill Ingestion ===\n');
  
  // Read backfill results
  const backfillPath = '/home/ubuntu/year_by_year_backfill.json';
  const backfillData = JSON.parse(fs.readFileSync(backfillPath, 'utf-8'));
  const results: BackfillResult[] = backfillData.results;
  
  console.log(`Found ${results.length} backfill batches\n`);
  
  // Connect to database
  const conn = await mysql.createConnection(process.env.DATABASE_URL!);
  
  let inserted = 0;
  let skipped = 0;
  let errors = 0;
  
  // Define indicator mappings for each category
  const indicatorMappings: Record<string, { code: string; name: string; unit: string; field: keyof BackfillResult['output'] }[]> = {
    'MACRO': [
      { code: 'GDP_CURRENT_USD', name: 'GDP (Current USD)', unit: 'billion USD', field: 'gdp_value' },
      { code: 'INFLATION_CPI', name: 'Inflation Rate (CPI)', unit: '%', field: 'inflation_rate' },
      { code: 'EXCHANGE_RATE_YER_USD', name: 'Exchange Rate (YER/USD)', unit: 'YER/USD', field: 'exchange_rate' },
      { code: 'POPULATION_TOTAL', name: 'Total Population', unit: 'million', field: 'population' },
    ],
    'HUMANITARIAN': [
      { code: 'IDP_COUNT', name: 'Internally Displaced Persons', unit: 'million', field: 'idp_count' },
      { code: 'HUMANITARIAN_FUNDING', name: 'Humanitarian Funding Received', unit: 'billion USD', field: 'humanitarian_funding' },
      { code: 'POPULATION_TOTAL', name: 'Total Population', unit: 'million', field: 'population' },
    ],
    'FOOD_SECURITY': [
      { code: 'FOOD_INSECURITY_RATE', name: 'Food Insecurity Rate', unit: '%', field: 'food_insecurity' },
      { code: 'IPC_PHASE3_PLUS', name: 'IPC Phase 3+ Population', unit: 'million', field: 'ipc_phase3_plus' },
    ],
    'HEALTH': [
      { code: 'UNDER5_MORTALITY', name: 'Under-5 Mortality Rate', unit: 'per 1,000', field: 'under5_mortality' },
    ],
    'CONFLICT': [
      { code: 'CONFLICT_FATALITIES', name: 'Conflict Fatalities', unit: 'count', field: 'conflict_fatalities' },
    ],
  };
  
  for (const result of results) {
    if (result.error || !result.output) {
      console.log(`⚠️ Skipping ${result.input} - has error`);
      skipped++;
      continue;
    }
    
    const { output } = result;
    const year = parseInt(output.year);
    const category = output.category;
    const sources = output.sources_used || 'Multiple Sources';
    
    const mappings = indicatorMappings[category] || [];
    
    for (const mapping of mappings) {
      const rawValue = output[mapping.field];
      const value = parseNumeric(rawValue as string);
      
      if (value === null) continue;
      
      const indicatorCode = `${category}_${mapping.code}`;
      
      try {
        // Check if record exists
        const [existing] = await conn.execute(
          `SELECT id FROM time_series WHERE indicatorCode = ? AND YEAR(date) = ? LIMIT 1`,
          [indicatorCode, year]
        ) as any;
        
        if (existing.length > 0) {
          // Update existing record
          await conn.execute(
            `UPDATE time_series SET value = ?, sourceId = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
            [value, sources, existing[0].id]
          );
        } else {
          // Insert new record
          await conn.execute(
            `INSERT INTO time_series (indicatorCode, date, value, sourceId, regimeTag, createdAt, updatedAt)
             VALUES (?, CONCAT(?, '-01-01'), ?, ?, 'national', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [indicatorCode, year, value, sources]
          );
        }
        inserted++;
      } catch (err: any) {
        console.error(`❌ Error inserting ${indicatorCode} for ${year}: ${err.message}`);
        errors++;
      }
    }
    
    console.log(`✅ ${output.year} ${category}: ${mappings.length} indicators processed`);
  }
  
  await conn.end();
  
  console.log('\n=== Summary ===');
  console.log(`Batches processed: ${results.length}`);
  console.log(`Records inserted/updated: ${inserted}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);
}

main().catch(console.error);
