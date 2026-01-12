/**
 * Simple CBY Publications Seeder
 * Seeds Central Bank of Yemen publications to the database
 */

import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

// CBY Publications metadata
const publications = [
  // Laws
  { year: 1998, type: 'policy_brief', titleEn: 'Central Bank of Yemen Law No. 14 of 1998', titleAr: 'قانون البنك المركزي اليمني رقم 14 لسنة 1998', category: 'monetary_policy' },
  { year: 1998, type: 'policy_brief', titleEn: 'Banking Law No. 38 of 1998', titleAr: 'قانون البنوك رقم 38 لسنة 1998', category: 'banking_sector' },
  { year: 2006, type: 'policy_brief', titleEn: 'Anti-Money Laundering Law No. 37 of 2006', titleAr: 'قانون مكافحة غسل الاموال رقم 37 لسنة 2006', category: 'sanctions_compliance' },
  { year: 2010, type: 'policy_brief', titleEn: 'Counter-Terrorism Financing Law No. 1 of 2010', titleAr: 'قانون مكافحة تمويل الارهاب رقم 1 لسنة 2010', category: 'sanctions_compliance' },
  { year: 1995, type: 'policy_brief', titleEn: 'Exchange Law No. 21 of 1995', titleAr: 'قانون الصرافة رقم 21 لسنة 1995', category: 'banking_sector' },
  
  // Regulations
  { year: 2009, type: 'technical_note', titleEn: 'Anti-Money Laundering and Counter-Terrorism Financing Regulations', titleAr: 'لائحة مكافحة غسل الاموال وتمويل الارهاب', category: 'sanctions_compliance' },
  { year: 2004, type: 'technical_note', titleEn: 'Islamic Banking Regulations', titleAr: 'لائحة البنوك الاسلامية', category: 'banking_sector' },
  { year: 2008, type: 'technical_note', titleEn: 'Corporate Governance Regulations for Banks', titleAr: 'لائحة الحوكمة المؤسسية للبنوك', category: 'governance' },
  { year: 2007, type: 'technical_note', titleEn: 'Risk Management Regulations for Banks', titleAr: 'لائحة ادارة المخاطر للبنوك', category: 'banking_sector' },
  { year: 2005, type: 'technical_note', titleEn: 'Banking Supervision Regulations', titleAr: 'لائحة الرقابة على البنوك', category: 'banking_sector' },
  { year: 2003, type: 'technical_note', titleEn: 'Exchange Company Regulations', titleAr: 'لائحة شركات الصرافة', category: 'banking_sector' },
  { year: 2011, type: 'technical_note', titleEn: 'Microfinance Regulations', titleAr: 'لائحة التمويل الاصغر', category: 'banking_sector' },
  
  // 2021 Circulars
  { year: 2021, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 66 of 2021 - Exchange Companies', titleAr: 'تعميم رقم 66 لعام 2021م لشركات الصرافة', category: 'banking_sector' },
  { year: 2021, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 83 of 2021 - Legal Accountant', titleAr: 'تعميم رقم 83 لعام 2021م - المحاسب القانوني', category: 'banking_sector' },
  { year: 2021, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 57 of 2021 - Banks', titleAr: 'تعميم رقم 57 لعام 2021م موجه الى البنوك', category: 'banking_sector' },
  { year: 2021, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 70 of 2021 - CAC Bank Aden', titleAr: 'تعميم رقم 70 بخصوص عدم التعامل مع كاك بنك فرع عدن', category: 'split_system_analysis' },
  { year: 2021, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 5 of 2021 - Data Submission', titleAr: 'تعميم رقم 5 لعام 2021 بخصوص ارسال البيانات', category: 'banking_sector' },
  { year: 2021, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 68 of 2021 - CAC Bank', titleAr: 'تعميم رقم 68 الخاص بعدم التعامل مع بنك كاك فرع عدن', category: 'split_system_analysis' },
  { year: 2021, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 63 of 2021 - Debtor List', titleAr: 'تعميم رقم 63 - رفع مدينين من قائمة الأشعار', category: 'banking_sector' },
  { year: 2021, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 42 of 2021 - Legal Accountant Contracts', titleAr: 'تعميم رقم 42 لعام 2021م بخصوص التعاقد مع المحاسب القانوني', category: 'banking_sector' },
  { year: 2021, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 14 of 2021 - Petroleum Derivatives', titleAr: 'تعميم رقم 14 لعام 2021م بشأن المشتقات النفطية', category: 'energy_sector' },
  { year: 2021, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 87 of 2021', titleAr: 'تعميم رقم 87 لعام 2021م', category: 'banking_sector' },
  { year: 2021, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 54 of 2021 - Remittance Instructions', titleAr: 'تعليمات الاعمال الحوالات تعميم رقم 54 لعام 2021م', category: 'banking_sector' },
  { year: 2021, type: 'policy_brief', titleEn: 'CBY Directive - Unpaid Remittances (Companies)', titleAr: 'الحوالات غير المدفوعة شركات', category: 'banking_sector' },
  { year: 2021, type: 'policy_brief', titleEn: 'CBY Directive - Digital Currency Prohibition (Banks)', titleAr: 'منع التعامل بالعملات الرقمية بنوك', category: 'monetary_policy' },
  { year: 2021, type: 'policy_brief', titleEn: 'CBY Directive - Digital Currency Prohibition (Exchange)', titleAr: 'منع التعامل بالعملات الرقمية صرافين', category: 'monetary_policy' },
  
  // 2020 Circulars
  { year: 2020, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 1 of 2020 - Precautionary Measures', titleAr: 'تعميم رقم 1 لعام 2020 بشأن الاجراءات الاحترازية', category: 'banking_sector' },
  { year: 2020, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 2 of 2020', titleAr: 'تعميم رقم 2 لعام 2020', category: 'banking_sector' },
  { year: 2020, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 3 of 2020', titleAr: 'تعميم رقم 3 لعام 2020', category: 'banking_sector' },
  { year: 2020, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 4 of 2020', titleAr: 'تعميم رقم 4 لعام 2020', category: 'banking_sector' },
  { year: 2020, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 5 of 2020', titleAr: 'تعميم رقم 5 لعام 2020', category: 'banking_sector' },
  { year: 2020, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 6 of 2020', titleAr: 'تعميم رقم 6 لعام 2020', category: 'banking_sector' },
  { year: 2020, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 7 of 2020', titleAr: 'تعميم رقم 7 لعام 2020', category: 'banking_sector' },
  { year: 2020, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 8 of 2020', titleAr: 'تعميم رقم 8 لعام 2020', category: 'banking_sector' },
  { year: 2020, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 9 of 2020', titleAr: 'تعميم رقم 9 لعام 2020', category: 'banking_sector' },
  { year: 2020, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 10 of 2020', titleAr: 'تعميم رقم 10 لعام 2020', category: 'banking_sector' },
  
  // 2019 Circulars
  { year: 2019, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 1 of 2019', titleAr: 'تعميم رقم 1 لعام 2019', category: 'banking_sector' },
  { year: 2019, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 2 of 2019', titleAr: 'تعميم رقم 2 لعام 2019', category: 'banking_sector' },
  { year: 2019, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 3 of 2019', titleAr: 'تعميم رقم 3 لعام 2019', category: 'banking_sector' },
  { year: 2019, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 4 of 2019', titleAr: 'تعميم رقم 4 لعام 2019', category: 'banking_sector' },
  { year: 2019, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 5 of 2019', titleAr: 'تعميم رقم 5 لعام 2019', category: 'banking_sector' },
  
  // 2018 Circulars
  { year: 2018, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 1 of 2018', titleAr: 'تعميم رقم 1 لعام 2018', category: 'banking_sector' },
  { year: 2018, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 2 of 2018', titleAr: 'تعميم رقم 2 لعام 2018', category: 'banking_sector' },
  { year: 2018, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 3 of 2018', titleAr: 'تعميم رقم 3 لعام 2018', category: 'banking_sector' },
  { year: 2018, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 4 of 2018', titleAr: 'تعميم رقم 4 لعام 2018', category: 'banking_sector' },
  { year: 2018, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 5 of 2018', titleAr: 'تعميم رقم 5 لعام 2018', category: 'banking_sector' },
  
  // 2017 Circulars
  { year: 2017, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 1 of 2017', titleAr: 'تعميم رقم 1 لعام 2017', category: 'banking_sector' },
  { year: 2017, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 2 of 2017', titleAr: 'تعميم رقم 2 لعام 2017', category: 'banking_sector' },
  { year: 2017, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 3 of 2017', titleAr: 'تعميم رقم 3 لعام 2017', category: 'banking_sector' },
  
  // 2016 Circulars
  { year: 2016, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 1 of 2016', titleAr: 'تعميم رقم 1 لعام 2016', category: 'banking_sector' },
  { year: 2016, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 2 of 2016', titleAr: 'تعميم رقم 2 لعام 2016', category: 'banking_sector' },
  { year: 2016, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 3 of 2016', titleAr: 'تعميم رقم 3 لعام 2016', category: 'banking_sector' },
  { year: 2016, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 4 of 2016', titleAr: 'تعميم رقم 4 لعام 2016', category: 'banking_sector' },
  { year: 2016, type: 'policy_brief', titleEn: 'CBY Decision - Relocation to Aden', titleAr: 'قرار نقل البنك المركزي الى عدن', category: 'split_system_analysis' },
  
  // 2015 Circulars
  { year: 2015, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 1 of 2015', titleAr: 'تعميم رقم 1 لعام 2015', category: 'banking_sector' },
  { year: 2015, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 2 of 2015', titleAr: 'تعميم رقم 2 لعام 2015', category: 'banking_sector' },
  { year: 2015, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 3 of 2015', titleAr: 'تعميم رقم 3 لعام 2015', category: 'banking_sector' },
  
  // 2014 Circulars
  { year: 2014, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 1 of 2014', titleAr: 'تعميم رقم 1 لعام 2014', category: 'banking_sector' },
  { year: 2014, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 2 of 2014', titleAr: 'تعميم رقم 2 لعام 2014', category: 'banking_sector' },
  { year: 2014, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 3 of 2014', titleAr: 'تعميم رقم 3 لعام 2014', category: 'banking_sector' },
  { year: 2014, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 4 of 2014', titleAr: 'تعميم رقم 4 لعام 2014', category: 'banking_sector' },
  
  // 2013 Circulars
  { year: 2013, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 1 of 2013', titleAr: 'تعميم رقم 1 لعام 2013', category: 'banking_sector' },
  { year: 2013, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 2 of 2013', titleAr: 'تعميم رقم 2 لعام 2013', category: 'banking_sector' },
  { year: 2013, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 3 of 2013', titleAr: 'تعميم رقم 3 لعام 2013', category: 'banking_sector' },
  
  // 2012 Circulars
  { year: 2012, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 1 of 2012', titleAr: 'تعميم رقم 1 لعام 2012', category: 'banking_sector' },
  { year: 2012, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 2 of 2012', titleAr: 'تعميم رقم 2 لعام 2012', category: 'banking_sector' },
  { year: 2012, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 3 of 2012', titleAr: 'تعميم رقم 3 لعام 2012', category: 'banking_sector' },
  
  // 2011 Circulars
  { year: 2011, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 1 of 2011', titleAr: 'تعميم رقم 1 لعام 2011', category: 'banking_sector' },
  { year: 2011, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 2 of 2011', titleAr: 'تعميم رقم 2 لعام 2011', category: 'banking_sector' },
  { year: 2011, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 3 of 2011', titleAr: 'تعميم رقم 3 لعام 2011', category: 'banking_sector' },
  
  // 2010 Circulars
  { year: 2010, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 1 of 2010', titleAr: 'تعميم رقم 1 لعام 2010', category: 'banking_sector' },
  { year: 2010, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 2 of 2010', titleAr: 'تعميم رقم 2 لعام 2010', category: 'banking_sector' },
  { year: 2010, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 3 of 2010', titleAr: 'تعميم رقم 3 لعام 2010', category: 'banking_sector' },
  
  // 2009 Circulars
  { year: 2009, type: 'policy_brief', titleEn: 'CBY Interest Rate Reduction Decision No. 1 of 2009', titleAr: 'قرار تخفيض سعر الفائدة رقم 1 لسنة 2009', category: 'monetary_policy' },
  { year: 2009, type: 'technical_note', titleEn: 'CBY Circular No. 5 of 2009 - Liquidity Risk Management', titleAr: 'منشور دوري رقم 5 لعام 2009 ادارة مخاطر السيولة', category: 'banking_sector' },
  { year: 2009, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 2 of 2009 - National Bank Debtors', titleAr: 'منشور 2 لسنة 2009 المدينون الذين لم يسدوا للبنك الوطني', category: 'banking_sector' },
  { year: 2009, type: 'statistical_bulletin', titleEn: 'CBY Circular No. 1 of 2009 - Unpaid Debts', titleAr: 'منشور 1 لسنة 2009 المدنيون الذين لم يسدوا ديونهم', category: 'banking_sector' },
  { year: 2009, type: 'technical_note', titleEn: 'CBY Circular No. 3 of 2009 - External Auditors', titleAr: 'منشور دوري رقم 3 لعام 2009 المراجعون الخارجيون', category: 'banking_sector' },
  
  // 2000 Circulars
  { year: 2000, type: 'statistical_bulletin', titleEn: 'CBY Periodic Circular No. 2 of 2000', titleAr: 'منشور دوري رقم 2 لعام 2000', category: 'banking_sector' },
  { year: 2000, type: 'policy_brief', titleEn: 'CBY Decision No. 5 of 2000 - Minimum Interest Rate', titleAr: 'قرار رقم 5 لسنة 2000 بشأن تحديد الحد الادنى لسعر الفوائد', category: 'monetary_policy' },
];

async function main() {
  console.log('Connecting to database...');
  const conn = await mysql.createConnection(DATABASE_URL);
  
  // Check current counts
  const [totalBefore] = await conn.execute('SELECT COUNT(*) as cnt FROM research_publications');
  console.log('Publications before:', totalBefore[0].cnt);
  
  // Get or create CBY organization
  const [orgs] = await conn.execute("SELECT id FROM research_organizations WHERE name LIKE '%Central Bank%' LIMIT 1");
  let orgId;
  
  if (orgs.length === 0) {
    console.log('Creating CBY organization...');
    const [result] = await conn.execute(
      `INSERT INTO research_organizations (name, nameAr, type, country, website, description, descriptionAr, reliabilityScore, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        'Central Bank of Yemen',
        'البنك المركزي اليمني',
        'government',
        'Yemen',
        'https://www.centralbank.gov.ye',
        'The Central Bank of Yemen is the monetary authority responsible for monetary policy, banking supervision, and currency issuance.',
        'البنك المركزي اليمني هو السلطة النقدية المسؤولة عن السياسة النقدية والرقابة المصرفية وإصدار العملة.',
        95
      ]
    );
    orgId = result.insertId;
    console.log('Created CBY organization with ID:', orgId);
  } else {
    orgId = orgs[0].id;
    console.log('Using existing CBY organization ID:', orgId);
  }
  
  // Insert publications
  let inserted = 0;
  let skipped = 0;
  
  for (const pub of publications) {
    // Check if exists
    const [existing] = await conn.execute(
      'SELECT id FROM research_publications WHERE title = ?',
      [pub.titleEn]
    );
    
    if (existing.length > 0) {
      skipped++;
      continue;
    }
    
    const abstract = `Official publication from the Central Bank of Yemen issued in ${pub.year}. This document provides regulatory guidance for Yemen's banking and financial sector.`;
    const abstractAr = `وثيقة رسمية من البنك المركزي اليمني صادرة في عام ${pub.year}. تقدم هذه الوثيقة توجيهات تنظيمية للقطاع المصرفي والمالي في اليمن.`;
    
    try {
      await conn.execute(
        `INSERT INTO research_publications 
         (title, titleAr, abstract, abstractAr, organizationId, publicationType, researchCategory, publicationYear, language, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          pub.titleEn,
          pub.titleAr,
          abstract,
          abstractAr,
          orgId,
          pub.type,
          pub.category,
          pub.year,
          'ar',
          'published'
        ]
      );
      inserted++;
    } catch (err) {
      console.error('Error inserting:', pub.titleEn, err.message);
    }
  }
  
  // Check final counts
  const [totalAfter] = await conn.execute('SELECT COUNT(*) as cnt FROM research_publications');
  const [cbyCount] = await conn.execute("SELECT COUNT(*) as cnt FROM research_publications WHERE title LIKE '%CBY%'");
  
  console.log('\n=== CBY Publications Seeding Complete ===');
  console.log('Inserted:', inserted);
  console.log('Skipped (already exist):', skipped);
  console.log('Total publications now:', totalAfter[0].cnt);
  console.log('CBY publications:', cbyCount[0].cnt);
  
  await conn.end();
}

main().catch(console.error);
