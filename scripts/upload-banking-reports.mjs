#!/usr/bin/env node
/**
 * Upload banking sector reports to S3 storage
 * Run with: node scripts/upload-banking-reports.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get environment variables
const FORGE_API_URL = process.env.BUILT_IN_FORGE_API_URL;
const FORGE_API_KEY = process.env.BUILT_IN_FORGE_API_KEY;

if (!FORGE_API_URL || !FORGE_API_KEY) {
  console.error('Missing BUILT_IN_FORGE_API_URL or BUILT_IN_FORGE_API_KEY');
  process.exit(1);
}

const baseUrl = FORGE_API_URL.replace(/\/+$/, '') + '/';

async function uploadFile(filePath, s3Key) {
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  
  const uploadUrl = new URL('v1/storage/upload', baseUrl);
  uploadUrl.searchParams.set('path', s3Key);
  
  const formData = new FormData();
  const blob = new Blob([fileBuffer], { type: 'application/pdf' });
  formData.append('file', blob, fileName);
  
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${FORGE_API_KEY}` },
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Upload failed: ${response.status} - ${error}`);
  }
  
  const result = await response.json();
  return result.url;
}

const reports = [
  {
    localPath: '../public/documents/banking/world-bank-yemen-financial-sector-diagnostics-2024.pdf',
    s3Key: 'banking/world-bank-yemen-financial-sector-diagnostics-2024.pdf',
    title: 'World Bank - Yemen Financial Sector Diagnostics 2024',
    titleAr: 'البنك الدولي - تشخيص القطاع المالي اليمني 2024'
  },
  {
    localPath: '../public/documents/banking/acaps-yemen-financial-sector-2022.pdf',
    s3Key: 'banking/acaps-yemen-financial-sector-2022.pdf',
    title: 'ACAPS - Yemen Financial Sector Analysis 2022',
    titleAr: 'أكابس - تحليل القطاع المالي اليمني 2022'
  },
  {
    localPath: '../public/documents/banking/odi-impact-conflict-financial-sector-yemen.pdf',
    s3Key: 'banking/odi-impact-conflict-financial-sector-yemen.pdf',
    title: 'ODI - Impact of Conflict on Financial Sector in Yemen',
    titleAr: 'معهد التنمية الخارجية - تأثير الصراع على القطاع المالي في اليمن'
  },
  {
    localPath: '../public/documents/banking/world-bank-yemen-economic-monitor-2024.pdf',
    s3Key: 'banking/world-bank-yemen-economic-monitor-2024.pdf',
    title: 'World Bank - Yemen Economic Monitor 2024',
    titleAr: 'البنك الدولي - مرصد الاقتصاد اليمني 2024'
  }
];

async function main() {
  console.log('Uploading banking sector reports to S3...\n');
  
  const results = [];
  
  for (const report of reports) {
    const fullPath = path.resolve(__dirname, report.localPath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️ File not found: ${report.localPath}`);
      continue;
    }
    
    try {
      console.log(`📤 Uploading: ${report.title}`);
      const url = await uploadFile(fullPath, report.s3Key);
      console.log(`✅ Uploaded: ${url}\n`);
      results.push({
        ...report,
        s3Url: url
      });
    } catch (error) {
      console.error(`❌ Failed to upload ${report.title}: ${error.message}\n`);
    }
  }
  
  // Output results as JSON for database seeding
  console.log('\n--- Upload Results ---');
  console.log(JSON.stringify(results, null, 2));
  
  // Save results to file
  fs.writeFileSync(
    path.resolve(__dirname, '../docs/banking-reports-s3-urls.json'),
    JSON.stringify(results, null, 2)
  );
  console.log('\nResults saved to docs/banking-reports-s3-urls.json');
}

main().catch(console.error);
