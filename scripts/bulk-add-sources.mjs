// Bulk add sources from CSV files to the database
import { createConnection } from 'mysql2/promise';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

const DATABASE_URL = process.env.DATABASE_URL;

async function main() {
  // Parse DATABASE_URL
  const url = new URL(DATABASE_URL);
  const connection = await createConnection({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    ssl: { rejectUnauthorized: false }
  });

  console.log('Connected to database');

  // Read CSV file
  const csvContent = readFileSync('/home/ubuntu/upload/3(1).csv', 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true
  });

  console.log(`Found ${records.length} sources in CSV`);

  // Get existing sources
  const [existingSources] = await connection.query('SELECT code FROM sources');
  const existingCodes = new Set(existingSources.map(s => s.code));

  let added = 0;
  let skipped = 0;

  for (const record of records) {
    const srcId = record.src_id || record.src_numeric_id;
    if (!srcId) continue;

    const code = `SRC-${String(srcId).padStart(3, '0')}`;
    
    if (existingCodes.has(code)) {
      skipped++;
      continue;
    }

    // Map tier
    let tier = 'T2';
    if (record.tier === 'T1') tier = 'T1';
    else if (record.tier === 'T0') tier = 'T0';
    else if (record.tier === 'T3') tier = 'T3';

    // Map category to sector
    const category = record.category || '';
    let sectorCode = 'macroeconomy';
    if (category.toLowerCase().includes('poverty')) sectorCode = 'poverty';
    else if (category.toLowerCase().includes('debt') || category.toLowerCase().includes('fiscal')) sectorCode = 'public-finance';
    else if (category.toLowerCase().includes('trade')) sectorCode = 'trade';
    else if (category.toLowerCase().includes('food') || category.toLowerCase().includes('agriculture')) sectorCode = 'food-security';
    else if (category.toLowerCase().includes('bank') || category.toLowerCase().includes('finance')) sectorCode = 'banking';
    else if (category.toLowerCase().includes('labor') || category.toLowerCase().includes('employ')) sectorCode = 'labor-market';
    else if (category.toLowerCase().includes('energy') || category.toLowerCase().includes('fuel')) sectorCode = 'energy';
    else if (category.toLowerCase().includes('health')) sectorCode = 'poverty';
    else if (category.toLowerCase().includes('aid') || category.toLowerCase().includes('humanitarian')) sectorCode = 'aid-flows';

    // Map access method
    let accessMethod = 'WEB';
    if (record.access_method?.toUpperCase().includes('API')) accessMethod = 'API';
    else if (record.access_method?.toUpperCase().includes('CSV')) accessMethod = 'CSV';

    // Map update frequency
    let updateFrequency = 'ANNUAL';
    if (record.update_frequency?.toLowerCase().includes('daily')) updateFrequency = 'DAILY';
    else if (record.update_frequency?.toLowerCase().includes('week')) updateFrequency = 'WEEKLY';
    else if (record.update_frequency?.toLowerCase().includes('month')) updateFrequency = 'MONTHLY';
    else if (record.update_frequency?.toLowerCase().includes('quarter')) updateFrequency = 'QUARTERLY';

    try {
      await connection.query(`
        INSERT INTO sources (
          code, name_en, name_ar, institution, url, tier, 
          sector_code, access_method, update_frequency, 
          license, reliability_grade, geographic_coverage,
          notes, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        code,
        record.name_en || record.name || `Source ${srcId}`,
        record.name_ar || '',
        record.institution || record.institution_en || '',
        record.url || '',
        tier,
        sectorCode,
        accessMethod,
        updateFrequency,
        record.license || 'Public',
        record.reliability_grade || 'B',
        record.geographic_coverage || 'Global',
        record.notes || record.yeto_usage || '',
        'ACTIVE',
      ]);
      added++;
      console.log(`Added: ${code} - ${record.name_en || record.name}`);
    } catch (err) {
      console.error(`Error adding ${code}:`, err.message);
    }
  }

  console.log(`\nSummary: Added ${added}, Skipped ${skipped} (already exist)`);

  // Now add additional high-priority sources from the document
  const additionalSources = [
    { code: 'SRC-WB-WDI', name_en: 'World Bank WDI', name_ar: 'مؤشرات التنمية العالمية', institution: 'World Bank', url: 'https://data.worldbank.org/country/yemen', tier: 'T1', sector_code: 'macroeconomy', access_method: 'API', update_frequency: 'ANNUAL' },
    { code: 'SRC-IMF-WEO', name_en: 'IMF World Economic Outlook', name_ar: 'آفاق الاقتصاد العالمي', institution: 'IMF', url: 'https://www.imf.org/en/Publications/WEO', tier: 'T1', sector_code: 'macroeconomy', access_method: 'API', update_frequency: 'BIANNUAL' },
    { code: 'SRC-OCHA-FTS', name_en: 'OCHA Financial Tracking Service', name_ar: 'خدمة التتبع المالي', institution: 'UN OCHA', url: 'https://fts.unocha.org/countries/248/summary/2024', tier: 'T1', sector_code: 'aid-flows', access_method: 'API', update_frequency: 'DAILY' },
    { code: 'SRC-WFP-VAM', name_en: 'WFP Vulnerability Analysis', name_ar: 'تحليل الضعف', institution: 'WFP', url: 'https://dataviz.vam.wfp.org/economic_explorer/prices', tier: 'T1', sector_code: 'food-security', access_method: 'API', update_frequency: 'MONTHLY' },
    { code: 'SRC-FAO-GIEWS', name_en: 'FAO GIEWS Food Prices', name_ar: 'أسعار الغذاء', institution: 'FAO', url: 'https://www.fao.org/giews/food-prices', tier: 'T1', sector_code: 'food-security', access_method: 'WEB', update_frequency: 'MONTHLY' },
    { code: 'SRC-FEWSNET', name_en: 'FEWS NET Yemen', name_ar: 'شبكة نظم الإنذار المبكر', institution: 'FEWS NET', url: 'https://fews.net/east-africa/yemen', tier: 'T1', sector_code: 'food-security', access_method: 'WEB', update_frequency: 'MONTHLY' },
    { code: 'SRC-IPC', name_en: 'IPC Food Security Classification', name_ar: 'تصنيف الأمن الغذائي', institution: 'IPC', url: 'https://www.ipcinfo.org/ipc-country-analysis/details-map/en/c/1156858/', tier: 'T1', sector_code: 'food-security', access_method: 'WEB', update_frequency: 'QUARTERLY' },
    { code: 'SRC-UNHCR', name_en: 'UNHCR Yemen Operations', name_ar: 'عمليات المفوضية السامية', institution: 'UNHCR', url: 'https://data.unhcr.org/en/country/yem', tier: 'T1', sector_code: 'aid-flows', access_method: 'API', update_frequency: 'MONTHLY' },
    { code: 'SRC-IOM-DTM', name_en: 'IOM Displacement Tracking', name_ar: 'تتبع النزوح', institution: 'IOM', url: 'https://dtm.iom.int/yemen', tier: 'T1', sector_code: 'conflict-economy', access_method: 'WEB', update_frequency: 'MONTHLY' },
    { code: 'SRC-IATI', name_en: 'IATI Aid Transparency', name_ar: 'شفافية المعونات', institution: 'IATI', url: 'https://d-portal.org/ctrack.html?country=YE', tier: 'T1', sector_code: 'aid-flows', access_method: 'API', update_frequency: 'CONTINUOUS' },
    { code: 'SRC-CBY-ADEN', name_en: 'Central Bank of Yemen (Aden)', name_ar: 'البنك المركزي اليمني (عدن)', institution: 'CBY Aden', url: 'http://cby-ye.com', tier: 'T1', sector_code: 'banking', access_method: 'WEB', update_frequency: 'WEEKLY' },
    { code: 'SRC-CBY-SANAA', name_en: 'Central Bank of Yemen (Sanaa)', name_ar: 'البنك المركزي اليمني (صنعاء)', institution: 'CBY Sanaa', url: 'https://www.centralbank.gov.ye', tier: 'T2', sector_code: 'banking', access_method: 'WEB', update_frequency: 'MONTHLY' },
    { code: 'SRC-YEMEN-CSO', name_en: 'Yemen Central Statistical Organization', name_ar: 'الجهاز المركزي للإحصاء', institution: 'CSO Yemen', url: 'https://cso-yemen.org', tier: 'T1', sector_code: 'macroeconomy', access_method: 'WEB', update_frequency: 'ANNUAL' },
    { code: 'SRC-SANAACENTER', name_en: 'Sana\'a Center for Strategic Studies', name_ar: 'مركز صنعاء للدراسات الاستراتيجية', institution: 'Sana\'a Center', url: 'https://sanaacenter.org', tier: 'T2', sector_code: 'conflict-economy', access_method: 'WEB', update_frequency: 'WEEKLY' },
    { code: 'SRC-RELIEFWEB', name_en: 'ReliefWeb Yemen', name_ar: 'ريليف ويب اليمن', institution: 'UN OCHA', url: 'https://reliefweb.int/country/yem', tier: 'T1', sector_code: 'aid-flows', access_method: 'API', update_frequency: 'DAILY' },
    { code: 'SRC-ACLED', name_en: 'ACLED Conflict Data', name_ar: 'بيانات النزاع', institution: 'ACLED', url: 'https://acleddata.com/data-export-tool/', tier: 'T1', sector_code: 'conflict-economy', access_method: 'API', update_frequency: 'WEEKLY' },
    { code: 'SRC-SEMC', name_en: 'SEMC Yemen Economic Media', name_ar: 'مركز الإعلام الاقتصادي', institution: 'SEMC', url: 'https://economicmedia.net', tier: 'T2', sector_code: 'prices', access_method: 'WEB', update_frequency: 'MONTHLY' },
    { code: 'SRC-KSRELIEF', name_en: 'KSrelief Saudi Aid', name_ar: 'مركز الملك سلمان للإغاثة', institution: 'KSrelief', url: 'https://www.ksrelief.org', tier: 'T2', sector_code: 'aid-flows', access_method: 'WEB', update_frequency: 'MONTHLY' },
    { code: 'SRC-COMTRADE', name_en: 'UN Comtrade', name_ar: 'قاعدة بيانات التجارة', institution: 'UN', url: 'https://comtradeplus.un.org', tier: 'T1', sector_code: 'trade', access_method: 'API', update_frequency: 'ANNUAL' },
    { code: 'SRC-UNCTAD', name_en: 'UNCTAD Statistics', name_ar: 'إحصاءات الأونكتاد', institution: 'UNCTAD', url: 'https://unctadstat.unctad.org', tier: 'T1', sector_code: 'trade', access_method: 'API', update_frequency: 'ANNUAL' },
  ];

  for (const source of additionalSources) {
    if (existingCodes.has(source.code)) {
      console.log(`Skipping existing: ${source.code}`);
      continue;
    }

    try {
      await connection.query(`
        INSERT INTO sources (
          code, name_en, name_ar, institution, url, tier, 
          sector_code, access_method, update_frequency, 
          license, reliability_grade, geographic_coverage,
          notes, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        source.code,
        source.name_en,
        source.name_ar,
        source.institution,
        source.url,
        source.tier,
        source.sector_code,
        source.access_method,
        source.update_frequency,
        'Public',
        'A',
        'Yemen',
        `Key source for ${source.sector_code} sector`,
        'ACTIVE',
      ]);
      console.log(`Added high-priority: ${source.code} - ${source.name_en}`);
      added++;
    } catch (err) {
      console.error(`Error adding ${source.code}:`, err.message);
    }
  }

  // Get final count
  const [finalCount] = await connection.query('SELECT COUNT(*) as count FROM sources');
  console.log(`\nTotal sources in database: ${finalCount[0].count}`);

  await connection.end();
}

main().catch(console.error);
