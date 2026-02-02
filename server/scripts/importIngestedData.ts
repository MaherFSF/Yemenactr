/**
 * Import Ingested Data Script
 * 
 * Processes all parallel ingestion results and stores them in the database.
 * This script is host-independent and can be run on any platform.
 */

import * as fs from 'fs';
import * as path from 'path';
import { db } from '../db';
import { timeSeries, indicators, datasets, sources } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

// ============================================================================
// DATA FILES
// ============================================================================

const DATA_FILES = {
  worldBank: '/home/ubuntu/world_bank_full_ingestion.json',
  imf: '/home/ubuntu/imf_full_ingestion.json',
  humanitarian: '/home/ubuntu/humanitarian_full_ingestion.json',
  tradeFinance: '/home/ubuntu/trade_finance_ingestion.json',
  foodPrices: '/home/ubuntu/food_prices_ingestion.json',
  energy: '/home/ubuntu/energy_infrastructure_ingestion.json',
  banking: '/home/ubuntu/banking_finance_ingestion.json',
  social: '/home/ubuntu/social_development_ingestion.json',
};

// ============================================================================
// INDICATOR MAPPINGS
// ============================================================================

const INDICATOR_MAPPINGS = {
  // World Bank indicators
  gdp_current_usd: { code: 'NY.GDP.MKTP.CD', name: 'GDP (current US$)', sector: 'macro', unit: 'USD' },
  gdp_growth: { code: 'NY.GDP.MKTP.KD.ZG', name: 'GDP growth (annual %)', sector: 'macro', unit: '%' },
  population: { code: 'SP.POP.TOTL', name: 'Population, total', sector: 'social', unit: 'people' },
  inflation_rate: { code: 'FP.CPI.TOTL.ZG', name: 'Inflation, consumer prices', sector: 'prices', unit: '%' },
  exports_usd: { code: 'NE.EXP.GNFS.CD', name: 'Exports of goods and services', sector: 'trade', unit: 'USD' },
  imports_usd: { code: 'NE.IMP.GNFS.CD', name: 'Imports of goods and services', sector: 'trade', unit: 'USD' },
  external_debt: { code: 'DT.DOD.DECT.CD', name: 'External debt stocks, total', sector: 'fiscal', unit: 'USD' },
  poverty_rate: { code: 'SI.POV.NAHC', name: 'Poverty headcount ratio', sector: 'social', unit: '%' },
  life_expectancy: { code: 'SP.DYN.LE00.IN', name: 'Life expectancy at birth', sector: 'social', unit: 'years' },
  
  // IMF indicators
  real_gdp_growth: { code: 'IMF.WEO.NGDP_RPCH', name: 'Real GDP growth', sector: 'macro', unit: '%' },
  gdp_current_prices: { code: 'IMF.WEO.NGDPD', name: 'GDP, current prices', sector: 'macro', unit: 'USD billion' },
  gdp_per_capita: { code: 'IMF.WEO.NGDPDPC', name: 'GDP per capita', sector: 'macro', unit: 'USD' },
  inflation_avg: { code: 'IMF.WEO.PCPIPCH', name: 'Inflation, average consumer prices', sector: 'prices', unit: '%' },
  current_account_gdp: { code: 'IMF.WEO.BCA_NGDPD', name: 'Current account balance', sector: 'fiscal', unit: '% of GDP' },
  govt_debt_gdp: { code: 'IMF.WEO.GGXWDG_NGDP', name: 'Government gross debt', sector: 'fiscal', unit: '% of GDP' },
  govt_revenue_gdp: { code: 'IMF.WEO.GGR_NGDP', name: 'Government revenue', sector: 'fiscal', unit: '% of GDP' },
  govt_expenditure_gdp: { code: 'IMF.WEO.GGX_NGDP', name: 'Government expenditure', sector: 'fiscal', unit: '% of GDP' },
  unemployment_rate: { code: 'IMF.WEO.LUR', name: 'Unemployment rate', sector: 'labor', unit: '%' },
  
  // Humanitarian indicators
  humanitarian_funding: { code: 'OCHA.FTS.FUNDING', name: 'Humanitarian funding received', sector: 'humanitarian', unit: 'USD' },
  funding_requirements: { code: 'OCHA.FTS.REQUIREMENTS', name: 'Humanitarian funding requirements', sector: 'humanitarian', unit: 'USD' },
  people_in_need: { code: 'OCHA.HNO.PIN', name: 'People in need', sector: 'humanitarian', unit: 'people' },
  idps: { code: 'UNHCR.IDP', name: 'Internally displaced persons', sector: 'humanitarian', unit: 'people' },
  conflict_events: { code: 'ACLED.EVENTS', name: 'Conflict events', sector: 'conflict', unit: 'events' },
  conflict_fatalities: { code: 'ACLED.FATALITIES', name: 'Conflict fatalities', sector: 'conflict', unit: 'people' },
  food_insecurity: { code: 'IPC.ACUTE', name: 'Food insecurity (IPC Phase 3+)', sector: 'food', unit: 'people' },
  refugees: { code: 'UNHCR.REFUGEES', name: 'Refugees', sector: 'humanitarian', unit: 'people' },
  
  // Trade and finance indicators
  total_exports: { code: 'UN.COMTRADE.EXPORTS', name: 'Total merchandise exports', sector: 'trade', unit: 'USD' },
  total_imports: { code: 'UN.COMTRADE.IMPORTS', name: 'Total merchandise imports', sector: 'trade', unit: 'USD' },
  trade_balance: { code: 'UN.COMTRADE.BALANCE', name: 'Trade balance', sector: 'trade', unit: 'USD' },
  exchange_rate_official: { code: 'CBY.FX.OFFICIAL', name: 'Official exchange rate', sector: 'currency', unit: 'YER/USD' },
  exchange_rate_parallel: { code: 'CBY.FX.PARALLEL', name: 'Parallel exchange rate', sector: 'currency', unit: 'YER/USD' },
  foreign_reserves: { code: 'CBY.RESERVES', name: 'Foreign reserves', sector: 'banking', unit: 'USD' },
  remittances: { code: 'WB.REMITTANCES', name: 'Personal remittances received', sector: 'trade', unit: 'USD' },
  fdi_inflows: { code: 'UNCTAD.FDI.INFLOWS', name: 'FDI inflows', sector: 'trade', unit: 'USD' },
  oil_exports: { code: 'YEM.OIL.EXPORTS', name: 'Oil export revenues', sector: 'energy', unit: 'USD' },
  
  // Food prices indicators
  wheat_flour_price: { code: 'WFP.PRICE.WHEAT', name: 'Wheat flour price', sector: 'prices', unit: 'YER/kg' },
  rice_price: { code: 'WFP.PRICE.RICE', name: 'Rice price', sector: 'prices', unit: 'YER/kg' },
  cooking_oil_price: { code: 'WFP.PRICE.OIL', name: 'Cooking oil price', sector: 'prices', unit: 'YER/L' },
  sugar_price: { code: 'WFP.PRICE.SUGAR', name: 'Sugar price', sector: 'prices', unit: 'YER/kg' },
  fuel_price: { code: 'WFP.PRICE.FUEL', name: 'Fuel price', sector: 'prices', unit: 'YER/L' },
  food_basket_cost: { code: 'WFP.BASKET.COST', name: 'Food basket cost', sector: 'prices', unit: 'YER/month' },
  cpi_index: { code: 'CSO.CPI', name: 'Consumer Price Index', sector: 'prices', unit: 'index' },
  food_inflation: { code: 'WFP.INFLATION.FOOD', name: 'Food price inflation', sector: 'prices', unit: '%' },
  
  // Energy indicators
  oil_production: { code: 'IEA.OIL.PRODUCTION', name: 'Oil production', sector: 'energy', unit: 'bpd' },
  gas_production: { code: 'IEA.GAS.PRODUCTION', name: 'Gas production', sector: 'energy', unit: 'bcm' },
  electricity_capacity: { code: 'WB.ELEC.CAPACITY', name: 'Electricity capacity', sector: 'energy', unit: 'MW' },
  electricity_access: { code: 'WB.ELEC.ACCESS', name: 'Electricity access', sector: 'energy', unit: '%' },
  
  // Banking indicators
  money_supply_m2: { code: 'CBY.M2', name: 'Money supply M2', sector: 'banking', unit: 'YER' },
  cb_reserves: { code: 'CBY.RESERVES.USD', name: 'Central bank reserves', sector: 'banking', unit: 'USD' },
  bank_deposits: { code: 'CBY.DEPOSITS', name: 'Bank deposits', sector: 'banking', unit: 'YER' },
  private_credit: { code: 'CBY.CREDIT.PRIVATE', name: 'Private sector credit', sector: 'banking', unit: 'YER' },
  interest_rate: { code: 'CBY.RATE.INTEREST', name: 'Interest rate', sector: 'banking', unit: '%' },
  npl_ratio: { code: 'CBY.NPL.RATIO', name: 'Non-performing loans ratio', sector: 'banking', unit: '%' },
  
  // Social indicators
  child_mortality: { code: 'WHO.MORTALITY.CHILD', name: 'Under-5 mortality rate', sector: 'social', unit: 'per 1000' },
  maternal_mortality: { code: 'WHO.MORTALITY.MATERNAL', name: 'Maternal mortality ratio', sector: 'social', unit: 'per 100k' },
  primary_enrollment: { code: 'UNESCO.ENROLLMENT.PRIMARY', name: 'Primary school enrollment', sector: 'social', unit: '%' },
  literacy_rate: { code: 'UNESCO.LITERACY', name: 'Adult literacy rate', sector: 'social', unit: '%' },
  unemployment: { code: 'ILO.UNEMPLOYMENT', name: 'Unemployment rate', sector: 'labor', unit: '%' },
  youth_unemployment: { code: 'ILO.UNEMPLOYMENT.YOUTH', name: 'Youth unemployment rate', sector: 'labor', unit: '%' },
  hdi: { code: 'UNDP.HDI', name: 'Human Development Index', sector: 'social', unit: 'index' },
  water_access: { code: 'WHO.WATER.ACCESS', name: 'Access to safe water', sector: 'social', unit: '%' },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function parseNumericValue(value: string): number | null {
  if (!value || value === 'N/A' || value === 'n/a') return null;
  
  // Remove common suffixes and parse
  const cleaned = value
    .replace(/[,%]/g, '')
    .replace(/billion/gi, 'e9')
    .replace(/million/gi, 'e6')
    .replace(/trillion/gi, 'e12')
    .replace(/YER|USD|bpd|bcm|MW|MT/gi, '')
    .replace(/\s+/g, '')
    .trim();
  
  // Handle ranges (take first value)
  const rangeMatch = cleaned.match(/^([\d.e+-]+)/);
  if (rangeMatch) {
    const num = parseFloat(rangeMatch[1]);
    return isNaN(num) ? null : num;
  }
  
  return null;
}

function getSourceFromDataSources(dataSources: string): string {
  if (dataSources.includes('World Bank')) return 'World Bank';
  if (dataSources.includes('IMF')) return 'IMF';
  if (dataSources.includes('OCHA')) return 'OCHA';
  if (dataSources.includes('WFP')) return 'WFP';
  if (dataSources.includes('ACLED')) return 'ACLED';
  if (dataSources.includes('UNHCR')) return 'UNHCR';
  if (dataSources.includes('FAO')) return 'FAO';
  if (dataSources.includes('IEA')) return 'IEA';
  if (dataSources.includes('UNDP')) return 'UNDP';
  if (dataSources.includes('WHO')) return 'WHO';
  if (dataSources.includes('UNESCO')) return 'UNESCO';
  if (dataSources.includes('ILO')) return 'ILO';
  if (dataSources.includes('Comtrade')) return 'UN Comtrade';
  if (dataSources.includes('CBY') || dataSources.includes('Central Bank')) return 'Central Bank of Yemen';
  return 'Multiple Sources';
}

// ============================================================================
// MAIN IMPORT FUNCTION
// ============================================================================

export async function importAllIngestedData(): Promise<{
  totalRecords: number;
  bySource: Record<string, number>;
  byYear: Record<number, number>;
  errors: string[];
}> {
  const stats = {
    totalRecords: 0,
    bySource: {} as Record<string, number>,
    byYear: {} as Record<number, number>,
    errors: [] as string[],
  };

  console.log('Starting data import...');

  // Process each data file
  for (const [fileKey, filePath] of Object.entries(DATA_FILES)) {
    try {
      if (!fs.existsSync(filePath)) {
        console.log(`Skipping ${fileKey}: file not found`);
        continue;
      }

      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      console.log(`Processing ${fileKey}: ${data.results.length} records`);

      for (const result of data.results) {
        const year = result.output.year;
        const dataSources = result.output.data_sources || '';
        const sourceName = getSourceFromDataSources(dataSources);

        // Process each indicator in the result
        for (const [key, value] of Object.entries(result.output)) {
          if (key === 'year' || key === 'data_sources' || key === 'error') continue;
          
          const mapping = INDICATOR_MAPPINGS[key as keyof typeof INDICATOR_MAPPINGS];
          if (!mapping) continue;

          const numericValue = parseNumericValue(value as string);
          if (numericValue === null) continue;

          try {
            // Insert or update time series data
            // Check if record exists first
            const existing = await db.select().from(timeSeries)
              .where(and(
                eq(timeSeries.indicatorCode, mapping.code),
                eq(timeSeries.date, new Date(year, 0, 1)),
                eq(timeSeries.regimeTag, 'mixed')
              ))
              .limit(1);
            
            if (existing.length === 0) {
              await db.insert(timeSeries).values({
                indicatorCode: mapping.code,
                date: new Date(year, 0, 1), // January 1st of the year
                value: String(numericValue),
                unit: mapping.unit,
                regimeTag: 'mixed',
                confidenceRating: 'C',
                sourceId: 1, // Default source
                notes: JSON.stringify({
                  originalValue: value,
                  sector: mapping.sector,
                  importedAt: new Date().toISOString(),
                  dataFile: fileKey,
                }),
              });
            } else {
              await db.update(timeSeries)
                .set({
                  value: String(numericValue),
                  notes: JSON.stringify({
                    originalValue: value,
                    sector: mapping.sector,
                    updatedAt: new Date().toISOString(),
                    dataFile: fileKey,
                  }),
                })
                .where(eq(timeSeries.id, existing[0].id));
            }

            stats.totalRecords++;
            stats.bySource[sourceName] = (stats.bySource[sourceName] || 0) + 1;
            stats.byYear[year] = (stats.byYear[year] || 0) + 1;
          } catch (error) {
            stats.errors.push(`Error inserting ${mapping.code} for ${year}: ${(error as Error).message}`);
          }
        }
      }
    } catch (error) {
      stats.errors.push(`Error processing ${fileKey}: ${(error as Error).message}`);
    }
  }

  console.log(`Import complete: ${stats.totalRecords} records`);
  console.log('By source:', stats.bySource);
  console.log('By year:', stats.byYear);
  if (stats.errors.length > 0) {
    console.log('Errors:', stats.errors.slice(0, 10));
  }

  return stats;
}

// Run if called directly
if (require.main === module) {
  importAllIngestedData()
    .then(stats => {
      console.log('Import completed successfully');
      console.log(JSON.stringify(stats, null, 2));
      process.exit(0);
    })
    .catch(error => {
      console.error('Import failed:', error);
      process.exit(1);
    });
}
