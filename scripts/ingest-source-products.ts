/**
 * Ingest discovered source products into the source_products table
 * Part of STEP 1: Source Product Discovery
 */

import * as mysql from 'mysql2/promise';
import * as fs from 'fs';

interface ProductDiscovery {
  input: string;
  output: {
    source_id: string;
    products_found: number;
    product_1_type: string;
    product_1_url: string;
    product_1_access: string;
    product_1_frequency: string;
    product_2_type: string;
    product_2_url: string;
    product_2_access: string;
    product_3_type: string;
    product_3_url: string;
    needs_api_key: boolean | string;
    needs_partnership: boolean | string;
    yemen_data_available: boolean;
    years_covered: string;
  };
  error: string;
}

const VALID_PRODUCT_TYPES = ['API', 'SDMX', 'RSS', 'PDF_ARCHIVE', 'HTML_PORTAL', 'CSV_DOWNLOAD', 'XLSX_DOWNLOAD', 'DEPARTMENT_PAGE', 'ANNUAL_REPORT', 'CIRCULAR', 'BULLETIN', 'DATABASE', 'DASHBOARD'];
const VALID_ACCESS_METHODS = ['PUBLIC', 'API_KEY', 'LOGIN', 'PARTNERSHIP', 'SCRAPE'];
const VALID_FREQUENCIES = ['REALTIME', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL', 'IRREGULAR'];

function normalizeProductType(type: string): string {
  const normalized = type?.toUpperCase().trim();
  if (VALID_PRODUCT_TYPES.includes(normalized)) return normalized;
  // Map common variations
  if (normalized === 'WEB' || normalized === 'PORTAL') return 'HTML_PORTAL';
  if (normalized === 'CSV' || normalized === 'EXCEL') return 'CSV_DOWNLOAD';
  if (normalized === 'PDF' || normalized === 'REPORT') return 'PDF_ARCHIVE';
  return 'HTML_PORTAL'; // Default
}

function normalizeAccessMethod(access: string): string {
  const normalized = access?.toUpperCase().trim();
  if (VALID_ACCESS_METHODS.includes(normalized)) return normalized;
  if (normalized === 'KEY' || normalized === 'APIKEY') return 'API_KEY';
  if (normalized === 'AUTH' || normalized === 'AUTHENTICATED') return 'LOGIN';
  return 'PUBLIC'; // Default
}

function normalizeFrequency(freq: string): string {
  const normalized = freq?.toUpperCase().trim();
  if (VALID_FREQUENCIES.includes(normalized)) return normalized;
  if (normalized === 'YEARLY') return 'ANNUAL';
  if (normalized === 'BIANNUAL' || normalized === 'SEMIANNUAL') return 'QUARTERLY';
  return 'IRREGULAR'; // Default
}

async function main() {
  console.log('=== Source Products Ingestion ===\n');
  
  // Read discovery results
  const discoveryPath = '/home/ubuntu/discover_source_products.json';
  const discoveryData = JSON.parse(fs.readFileSync(discoveryPath, 'utf-8'));
  const discoveries: ProductDiscovery[] = discoveryData.results;
  
  console.log(`Found ${discoveries.length} source discoveries\n`);
  
  // Connect to database
  const conn = await mysql.createConnection(process.env.DATABASE_URL!);
  
  let inserted = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const discovery of discoveries) {
    if (discovery.error || !discovery.output) {
      console.log(`⚠️ Skipping ${discovery.input} - has error`);
      skipped++;
      continue;
    }
    
    const { output } = discovery;
    const sourceId = output.source_id;
    
    // Process up to 3 products per source
    const products = [
      { type: output.product_1_type, url: output.product_1_url, access: output.product_1_access, freq: output.product_1_frequency },
      { type: output.product_2_type, url: output.product_2_url, access: output.product_2_access, freq: '' },
      { type: output.product_3_type, url: output.product_3_url, access: '', freq: '' }
    ];
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      if (!product.type || !product.url) continue;
      
      const productId = `${sourceId}-P${i + 1}`;
      const productType = normalizeProductType(product.type);
      const accessMethod = normalizeAccessMethod(product.access);
      const frequency = normalizeFrequency(product.freq);
      const needsKey = output.needs_api_key === true || output.needs_api_key === 'true';
      const needsPartnership = output.needs_partnership === true || output.needs_partnership === 'true';
      
      try {
        await conn.execute(
          `INSERT INTO source_products 
           (sourceId, productId, productType, endpointUrl, accessMethod, expectedFrequency, needsKey, partnershipRequired, status, metadata)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
           ON DUPLICATE KEY UPDATE
           productType = VALUES(productType),
           endpointUrl = VALUES(endpointUrl),
           accessMethod = VALUES(accessMethod),
           expectedFrequency = VALUES(expectedFrequency),
           needsKey = VALUES(needsKey),
           partnershipRequired = VALUES(partnershipRequired),
           status = 'ACTIVE',
           lastChecked = CURRENT_TIMESTAMP`,
          [
            sourceId,
            productId,
            productType,
            product.url,
            accessMethod,
            frequency,
            needsKey,
            needsPartnership,
            JSON.stringify({
              yemen_data_available: output.yemen_data_available,
              years_covered: output.years_covered,
              discovered_at: new Date().toISOString()
            })
          ]
        );
        inserted++;
      } catch (err: any) {
        console.error(`❌ Error inserting ${productId}: ${err.message}`);
        errors++;
      }
    }
    
    console.log(`✅ ${sourceId}: ${output.products_found} products processed`);
  }
  
  await conn.end();
  
  console.log('\n=== Summary ===');
  console.log(`Sources processed: ${discoveries.length}`);
  console.log(`Products inserted/updated: ${inserted}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);
}

main().catch(console.error);
