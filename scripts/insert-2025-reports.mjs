/**
 * Insert 2025 Reports Script
 * Run with: node scripts/insert-2025-reports.mjs
 */

import mysql from 'mysql2/promise';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('🚀 Inserting 2025 Reports...\n');
  
  let inserted = 0;
  
  // Insert 12 Monthly Reports
  console.log('📅 Inserting Monthly Economic Monitors...');
  for (let month = 1; month <= 12; month++) {
    const monthName = MONTHS[month - 1];
    const monthNameAr = MONTHS_AR[month - 1];
    const id = crypto.randomUUID();
    
    try {
      await connection.execute(
        `INSERT INTO research_publications (id, title, titleAr, abstract, abstractAr, publicationYear, language, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          id,
          `YETO Monthly Economic Monitor - ${monthName} 2025`,
          `مرصد يتو الاقتصادي الشهري - ${monthNameAr} 2025`,
          `Monthly analysis of Yemen economic conditions for ${monthName} 2025 including exchange rates, inflation, fuel prices, and humanitarian funding flows.`,
          `تحليل شهري للأوضاع الاقتصادية في اليمن لشهر ${monthNameAr} 2025 بما في ذلك أسعار الصرف والتضخم وأسعار الوقود وتدفقات التمويل الإنساني.`,
          2025,
          'bilingual'
        ]
      );
      console.log(`   ✅ ${monthName} 2025`);
      inserted++;
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        console.log(`   ⏭️  Skipped (exists): ${monthName} 2025`);
      } else {
        console.error(`   ❌ Error: ${err.message}`);
      }
    }
  }
  
  // Insert 4 Quarterly Reports
  console.log('\n📊 Inserting Quarterly Outlooks...');
  const quarters = [
    { q: 1, name: 'Q1 (Jan-Mar)', nameAr: 'الربع الأول (يناير-مارس)' },
    { q: 2, name: 'Q2 (Apr-Jun)', nameAr: 'الربع الثاني (أبريل-يونيو)' },
    { q: 3, name: 'Q3 (Jul-Sep)', nameAr: 'الربع الثالث (يوليو-سبتمبر)' },
    { q: 4, name: 'Q4 (Oct-Dec)', nameAr: 'الربع الرابع (أكتوبر-ديسمبر)' }
  ];
  
  for (const { q, name, nameAr } of quarters) {
    const id = crypto.randomUUID();
    
    try {
      await connection.execute(
        `INSERT INTO research_publications (id, title, titleAr, abstract, abstractAr, publicationYear, language, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          id,
          `YETO Quarterly Economic Outlook - ${name} 2025`,
          `توقعات يتو الاقتصادية الفصلية - ${nameAr} 2025`,
          `Quarterly outlook analyzing Yemen economic trajectory during ${name} 2025. Covers macroeconomic trends, sectoral performance, humanitarian conditions, and scenario projections.`,
          `توقعات فصلية تحلل المسار الاقتصادي لليمن خلال ${nameAr} 2025. تغطي الاتجاهات الاقتصادية الكلية والأداء القطاعي والأوضاع الإنسانية وتوقعات السيناريوهات.`,
          2025,
          'bilingual'
        ]
      );
      console.log(`   ✅ ${name} 2025`);
      inserted++;
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        console.log(`   ⏭️  Skipped (exists): ${name} 2025`);
      } else {
        console.error(`   ❌ Error: ${err.message}`);
      }
    }
  }
  
  // Insert Annual Report
  console.log('\n📈 Inserting Annual Year-in-Review...');
  try {
    const id = crypto.randomUUID();
    await connection.execute(
      `INSERT INTO research_publications (id, title, titleAr, abstract, abstractAr, publicationYear, language, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        id,
        'YETO Annual Year-in-Review - 2025',
        'مراجعة يتو السنوية - 2025',
        'Comprehensive annual report analyzing Yemen economic conditions throughout 2025. Covers GDP, inflation, exchange rates, trade, banking, humanitarian funding, and conflict economy impacts with year-over-year comparisons and 2026 projections.',
        'تقرير سنوي شامل يحلل الأوضاع الاقتصادية في اليمن طوال عام 2025. يغطي الناتج المحلي الإجمالي والتضخم وأسعار الصرف والتجارة والقطاع المصرفي والتمويل الإنساني وتأثيرات اقتصاد الصراع مع مقارنات سنوية وتوقعات 2026.',
        2025,
        'bilingual'
      ]
    );
    console.log('   ✅ Annual Year-in-Review 2025');
    inserted++;
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.log('   ⏭️  Skipped (exists): Annual Year-in-Review 2025');
    } else {
      console.error(`   ❌ Error: ${err.message}`);
    }
  }
  
  console.log(`\n✨ Complete! Inserted ${inserted} reports.`);
  
  // Verify count
  const [rows] = await connection.execute(
    `SELECT COUNT(*) as count FROM research_publications WHERE title LIKE '%2025%' AND title LIKE '%YETO%'`
  );
  console.log(`📚 Total 2025 YETO reports in database: ${rows[0].count}`);
  
  await connection.end();
}

main().catch(console.error);
