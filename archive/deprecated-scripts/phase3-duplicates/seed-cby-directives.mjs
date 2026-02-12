// Script to seed CBY directives and link PDFs to database
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const DATABASE_URL = process.env.DATABASE_URL;

async function main() {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  console.log('Seeding CBY Directives...');
  
  // Get the CBY organization ID
  const [orgs] = await connection.execute(
    "SELECT id FROM research_organizations WHERE name LIKE '%Central Bank%Aden%' OR nameAr LIKE '%البنك المركزي%عدن%' LIMIT 1"
  );
  
  let cbyOrgId = orgs.length > 0 ? orgs[0].id : null;
  
  if (!cbyOrgId) {
    // Create CBY organization if not exists
    const [result] = await connection.execute(
      `INSERT INTO research_organizations (id, name, nameAr, acronym, type, country, website, description, descriptionAr, createdAt, updatedAt)
       VALUES (UUID(), 'Central Bank of Yemen - Aden', 'البنك المركزي اليمني - عدن', 'CBY-Aden', 'central_bank', 'Yemen', 'https://cby.gov.ye', 
               'The internationally recognized Central Bank of Yemen based in Aden', 
               'البنك المركزي اليمني المعترف به دولياً ومقره عدن',
               NOW(), NOW())`
    );
    const [newOrg] = await connection.execute("SELECT id FROM research_organizations WHERE acronym = 'CBY-Aden' LIMIT 1");
    cbyOrgId = newOrg[0]?.id;
    console.log('Created CBY-Aden organization:', cbyOrgId);
  } else {
    console.log('Found existing CBY organization:', cbyOrgId);
  }
  
  // CBY Directives data - comprehensive list of circulars, laws, and regulations
  const directives = [
    // 2021 Circulars
    { number: '5', year: 2021, type: 'circular', title_ar: 'تعميم بخصوص ارسال البيانات', title_en: 'Circular on Data Submission', category: 'reporting', status: 'active' },
    { number: '14', year: 2021, type: 'circular', title_ar: 'تعميم بشأن المشتقات النفطية', title_en: 'Circular on Petroleum Derivatives', category: 'operations', status: 'active' },
    { number: '42', year: 2021, type: 'circular', title_ar: 'تعميم بخصوص التعاقد مع المحاسب القانوني', title_en: 'Circular on Legal Accountant Contracts', category: 'compliance', status: 'active' },
    { number: '54', year: 2021, type: 'circular', title_ar: 'تعميم بخصوص تعليمات الحوالات', title_en: 'Circular on Remittance Instructions', category: 'remittances', status: 'active' },
    { number: '57', year: 2021, type: 'circular', title_ar: 'تعميم موجه الى البنوك', title_en: 'Circular Addressed to Banks', category: 'banking', status: 'active' },
    { number: '63', year: 2021, type: 'circular', title_ar: 'تعميم رفع مدينين من قائمة الإشعار', title_en: 'Circular on Removing Debtors from Notice List', category: 'credit', status: 'active' },
    { number: '66', year: 2021, type: 'circular', title_ar: 'تعميم لشركات الصرافة', title_en: 'Circular for Exchange Companies', category: 'exchange', status: 'active' },
    { number: '68', year: 2021, type: 'circular', title_ar: 'تعميم الخاص بعدم التعامل مع بنك كاك فرع عدن', title_en: 'Circular on Non-Dealing with CAC Bank Aden Branch', category: 'sanctions', status: 'active' },
    { number: '70', year: 2021, type: 'circular', title_ar: 'تعييم بخصوص عدم التعامل مع كاك بنك فرع عدن', title_en: 'Circular on CAC Bank Aden Branch', category: 'sanctions', status: 'active' },
    { number: '83', year: 2021, type: 'circular', title_ar: 'تعميم المحاسب القانوني لعام 2021م', title_en: 'Legal Accountant Circular for 2021', category: 'compliance', status: 'active' },
    { number: '87', year: 2021, type: 'circular', title_ar: 'تعميم رقم 87 لعام 2021م', title_en: 'Circular No. 87 for 2021', category: 'general', status: 'active' },
    
    // 2019-2020 Circulars
    { number: '12', year: 2019, type: 'circular', title_ar: 'تعميم بشأن مكافحة غسل الأموال', title_en: 'AML Compliance Circular', category: 'aml', status: 'active' },
    { number: '15', year: 2019, type: 'circular', title_ar: 'تعميم بشأن الحوالات الخارجية', title_en: 'External Remittances Circular', category: 'remittances', status: 'active' },
    { number: '23', year: 2020, type: 'circular', title_ar: 'تعميم بشأن تحديث بيانات العملاء', title_en: 'Customer Data Update Circular', category: 'kyc', status: 'active' },
    
    // Laws and Regulations
    { number: '35', year: 2003, type: 'law', title_ar: 'قانون غسل الأموال رقم 35 لسنة 2003', title_en: 'Anti-Money Laundering Law No. 35 of 2003', category: 'aml', status: 'active' },
    { number: '39', year: 2006, type: 'law', title_ar: 'قانون مكافحة الفساد رقم 39 لسنة 2006', title_en: 'Anti-Corruption Law No. 39 of 2006', category: 'compliance', status: 'active' },
    { number: '30', year: 2006, type: 'law', title_ar: 'قانون اقرار الذمة المالية رقم 30 لسنة 2006', title_en: 'Financial Disclosure Law No. 30 of 2006', category: 'disclosure', status: 'active' },
    { number: '89', year: 2006, type: 'decree', title_ar: 'قرار جمهوري رقم 89 لسنة 2006 بشأن قانون غسل الأموال', title_en: 'Presidential Decree No. 89 of 2006 on AML Law', category: 'aml', status: 'active' },
    { number: '21', year: 2008, type: 'law', title_ar: 'قانون مؤسسة ضمان الودائع المصرفية رقم 21 لسنة 2008', title_en: 'Deposit Insurance Corporation Law No. 21 of 2008', category: 'deposit_insurance', status: 'active' },
    
    // Periodic Circulars
    { number: '2', year: 1995, type: 'circular', title_ar: 'منشور دوري رقم 2 لعام 1995', title_en: 'Periodic Circular No. 2 of 1995', category: 'general', status: 'superseded' },
    { number: '3', year: 2001, type: 'circular', title_ar: 'منشور دوري رقم 3 لعام 2001 شطب الديون ذوي العلاقة', title_en: 'Periodic Circular No. 3 of 2001 on Related Party Debt Write-off', category: 'credit', status: 'superseded' },
    { number: '2', year: 2008, type: 'circular', title_ar: 'منشور دوري رقم 2 لعام 2008 تعيين محاسبين قانونيين معتمدين', title_en: 'Periodic Circular No. 2 of 2008 on Appointing Certified Accountants', category: 'compliance', status: 'active' },
    { number: '3', year: 2008, type: 'circular', title_ar: 'منشور دوري رقم 3 لعام 2008 تنظيم وتسجيل عمليات الشراء والبيع', title_en: 'Periodic Circular No. 3 of 2008 on Regulating Purchase and Sale Operations', category: 'operations', status: 'active' },
    { number: '4', year: 2008, type: 'circular', title_ar: 'منشور دوري رقم 4 لعام 2008 تعيين مسؤول الالتزام', title_en: 'Periodic Circular No. 4 of 2008 on Appointing Compliance Officer', category: 'compliance', status: 'active' },
    
    // Payment Systems Regulations
    { number: '1', year: 2006, type: 'regulation', title_ar: 'قانون أنظمة الدفع 2006', title_en: 'Payment Systems Law 2006', category: 'payments', status: 'active' },
  ];
  
  // Insert directives
  let insertedCount = 0;
  for (const directive of directives) {
    try {
      await connection.execute(
        `INSERT INTO cby_directives (id, directive_number, year, type, title_ar, title_en, category, status, issued_by, created_at, updated_at)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, 'CBY-Aden', NOW(), NOW())
         ON DUPLICATE KEY UPDATE title_ar = VALUES(title_ar), title_en = VALUES(title_en)`,
        [directive.number, directive.year, directive.type, directive.title_ar, directive.title_en, directive.category, directive.status]
      );
      insertedCount++;
    } catch (err) {
      console.log(`Skipping duplicate: ${directive.title_en}`);
    }
  }
  
  console.log(`Inserted ${insertedCount} CBY directives`);
  
  // Now update research_publications with PDF links for CBY documents
  console.log('\nLinking CBY PDFs to research publications...');
  
  // Get all CBY publications from database
  const [publications] = await connection.execute(
    "SELECT id, title, titleAr FROM research_publications WHERE title LIKE '%CBY%' OR title LIKE '%Central Bank%' OR title LIKE '%Circular%' OR titleAr LIKE '%البنك المركزي%' OR titleAr LIKE '%تعميم%'"
  );
  
  console.log(`Found ${publications.length} CBY publications in database`);
  
  // Update publications with download URLs
  // Since the PDFs have Arabic filenames, we'll create a mapping based on circular numbers
  const pdfBaseUrl = '/documents/cby/';
  
  // Update publications to have a generic CBY document link
  let linkedCount = 0;
  for (const pub of publications) {
    // Extract circular number from title if possible
    const circularMatch = pub.title?.match(/Circular\s+No\.?\s*(\d+)/i) || 
                          pub.titleAr?.match(/تعميم\s+رقم\s*(\d+)/);
    
    if (circularMatch) {
      const circularNum = circularMatch[1];
      // Create a download URL - we'll serve these through a special route
      const downloadUrl = `/api/cby/circular/${circularNum}`;
      
      await connection.execute(
        "UPDATE research_publications SET fileUrl = ? WHERE id = ?",
        [downloadUrl, pub.id]
      );
      linkedCount++;
    }
  }
  
  console.log(`Linked ${linkedCount} publications to download URLs`);
  
  // Verify counts
  const [directiveCount] = await connection.execute("SELECT COUNT(*) as count FROM cby_directives");
  const [pubCount] = await connection.execute("SELECT COUNT(*) as count FROM research_publications WHERE fileUrl IS NOT NULL");
  
  console.log(`\nFinal counts:`);
  console.log(`- CBY Directives: ${directiveCount[0].count}`);
  console.log(`- Publications with download URLs: ${pubCount[0].count}`);
  
  await connection.end();
  console.log('\nDone!');
}

main().catch(console.error);
