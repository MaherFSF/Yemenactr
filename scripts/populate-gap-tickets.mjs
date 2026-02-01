#!/usr/bin/env node
/**
 * Populate gap_tickets table with real data gaps identified in the platform
 */

import mysql from 'mysql2/promise';
import { randomUUID } from 'crypto';

const GAP_TICKETS = [
  // Banking sector gaps
  {
    title: 'Missing CBY Aden Balance Sheet Data 2025',
    titleAr: 'بيانات الميزانية العمومية للبنك المركزي عدن 2025 مفقودة',
    domain: 'banking',
    priority: 'high',
    description: 'Central Bank of Yemen (Aden) balance sheet data for 2025 is not available. Last available data is from Q4 2024.',
    descriptionAr: 'بيانات الميزانية العمومية للبنك المركزي اليمني (عدن) لعام 2025 غير متوفرة. آخر بيانات متاحة من الربع الرابع 2024.',
    indicatorId: 'IND-CBY-ASSETS',
    entityId: 'ENT-CBY-ADEN',
    sourceId: 'SRC-189'
  },
  {
    title: 'Missing Commercial Bank NPL Ratios',
    titleAr: 'نسب القروض المتعثرة للبنوك التجارية مفقودة',
    domain: 'banking',
    priority: 'high',
    description: 'Non-performing loan ratios for major commercial banks are not reported since 2023.',
    descriptionAr: 'نسب القروض المتعثرة للبنوك التجارية الرئيسية غير متوفرة منذ 2023.',
    indicatorId: 'IND-NPL-RATIO',
    entityId: null,
    sourceId: 'SRC-135'
  },
  {
    title: 'Missing Microfinance Loan Portfolio Data',
    titleAr: 'بيانات محفظة قروض التمويل الأصغر مفقودة',
    domain: 'banking',
    priority: 'medium',
    description: 'Microfinance institution loan portfolio data is incomplete for 2025.',
    descriptionAr: 'بيانات محفظة قروض مؤسسات التمويل الأصغر غير مكتملة لعام 2025.',
    indicatorId: 'IND-MFI-LOANS',
    entityId: null,
    sourceId: 'SRC-031'
  },
  // Macroeconomy gaps
  {
    title: 'Missing GDP Estimates 2025',
    titleAr: 'تقديرات الناتج المحلي الإجمالي 2025 مفقودة',
    domain: 'macroeconomy',
    priority: 'critical',
    description: 'No official or estimated GDP figures available for Yemen in 2025.',
    descriptionAr: 'لا توجد أرقام رسمية أو تقديرية للناتج المحلي الإجمالي لليمن في 2025.',
    indicatorId: 'IND-GDP',
    entityId: null,
    sourceId: 'SRC-001'
  },
  {
    title: 'Missing Inflation Rate - Sana\'a Zone',
    titleAr: 'معدل التضخم - منطقة صنعاء مفقود',
    domain: 'macroeconomy',
    priority: 'high',
    description: 'Consumer price inflation data for Sana\'a-controlled areas is not systematically collected.',
    descriptionAr: 'بيانات تضخم أسعار المستهلك للمناطق الخاضعة لسيطرة صنعاء غير متوفرة بشكل منهجي.',
    indicatorId: 'IND-CPI-SANAA',
    entityId: null,
    sourceId: 'SRC-127'
  },
  // Trade gaps
  {
    title: 'Missing Port of Aden Import Data',
    titleAr: 'بيانات واردات ميناء عدن مفقودة',
    domain: 'trade',
    priority: 'high',
    description: 'Detailed import statistics from Port of Aden are not available for 2025.',
    descriptionAr: 'إحصائيات الواردات التفصيلية من ميناء عدن غير متوفرة لعام 2025.',
    indicatorId: 'IND-IMPORTS-ADEN',
    entityId: 'ENT-PORT-ADEN',
    sourceId: 'SRC-127'
  },
  {
    title: 'Missing Fuel Import Volumes',
    titleAr: 'أحجام واردات الوقود مفقودة',
    domain: 'energy',
    priority: 'critical',
    description: 'Monthly fuel import volumes through Hodeidah port are not reported.',
    descriptionAr: 'أحجام واردات الوقود الشهرية عبر ميناء الحديدة غير متوفرة.',
    indicatorId: 'IND-FUEL-IMPORTS',
    entityId: null,
    sourceId: 'SRC-128'
  },
  // Humanitarian gaps
  {
    title: 'Missing IPC Phase Classification - Q1 2026',
    titleAr: 'تصنيف مراحل IPC - الربع الأول 2026 مفقود',
    domain: 'food_security',
    priority: 'critical',
    description: 'Integrated Food Security Phase Classification for Q1 2026 not yet released.',
    descriptionAr: 'تصنيف مراحل الأمن الغذائي المتكامل للربع الأول 2026 لم يصدر بعد.',
    indicatorId: 'IND-IPC-PHASE',
    entityId: null,
    sourceId: 'SRC-004'
  },
  // Entity-specific gaps
  {
    title: 'Missing Yemen LNG Production Data 2024-2025',
    titleAr: 'بيانات إنتاج الغاز الطبيعي المسال اليمني 2024-2025 مفقودة',
    domain: 'energy',
    priority: 'medium',
    description: 'Yemen LNG production and export data not available since operations suspended.',
    descriptionAr: 'بيانات إنتاج وتصدير الغاز الطبيعي المسال اليمني غير متوفرة منذ تعليق العمليات.',
    indicatorId: 'IND-LNG-PROD',
    entityId: 'ENT-YLNG',
    sourceId: 'SRC-124'
  },
  {
    title: 'Missing Aden Refinery Output Data',
    titleAr: 'بيانات إنتاج مصفاة عدن مفقودة',
    domain: 'energy',
    priority: 'high',
    description: 'Aden Refinery Company production output data not reported since 2023.',
    descriptionAr: 'بيانات إنتاج شركة مصافي عدن غير متوفرة منذ 2023.',
    indicatorId: 'IND-REFINERY-OUTPUT',
    entityId: 'ENT-ARC',
    sourceId: 'SRC-128'
  }
];

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('=== Populating gap_tickets ===\n');
  
  // Get gap_tickets columns
  const [cols] = await conn.query('SHOW COLUMNS FROM gap_tickets');
  console.log('gap_tickets columns:');
  cols.forEach(c => console.log('  ' + c.Field));
  
  let created = 0;
  
  for (const gap of GAP_TICKETS) {
    const id = randomUUID();
    const ticketId = `GAP-${gap.domain.toUpperCase().substring(0, 4)}-${Date.now().toString(36).toUpperCase()}`;
    
    try {
      // Map priority to severity
      const severityMap = { critical: 'critical', high: 'high', medium: 'medium', low: 'low' };
      const severity = severityMap[gap.priority] || 'medium';
      
      await conn.query(`
        INSERT INTO gap_tickets 
        (gapId, severity, gapType, sectorCode, indicatorCode, titleEn, titleAr, descriptionEn, descriptionAr, status, isPublic, createdAt, updatedAt)
        VALUES (?, ?, 'missing_data', ?, ?, ?, ?, ?, ?, 'open', true, NOW(), NOW())
      `, [
        ticketId,
        severity,
        gap.domain,
        gap.indicatorId,
        gap.title,
        gap.titleAr,
        gap.description,
        gap.descriptionAr
      ]);
      
      created++;
      console.log(`✓ Created: ${ticketId} - ${gap.title.substring(0, 40)}...`);
    } catch (err) {
      console.log(`✗ Error: ${err.message}`);
    }
  }
  
  console.log(`\n=== Gap Tickets Created: ${created} ===`);
  
  // Verify count
  const [count] = await conn.query('SELECT COUNT(*) as total FROM gap_tickets');
  console.log(`Total gap_tickets: ${count[0].total}`);
  
  await conn.end();
}

main().catch(console.error);
