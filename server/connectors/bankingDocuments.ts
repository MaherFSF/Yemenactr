/**
 * YETO Banking Documents Connector
 * 
 * Automatic ingestion of:
 * - Bank annual audit reports
 * - CBY-Aden circulars and directives
 * - CBY-Sana'a publications
 * - Financial statements
 * - Regulatory filings
 * 
 * This connector feeds:
 * - Research Library (research_publications table)
 * - Evidence Graph (evidence_documents table)
 * - AI Knowledge Base (for Governor/Deputy AI assistants)
 * - Claims Ledger (for data provenance)
 */

import mysql from 'mysql2/promise';

interface BankingDocument {
  title: string;
  titleAr: string;
  documentType: 'annual_report' | 'audit_report' | 'circular' | 'directive' | 'financial_statement' | 'regulatory_filing' | 'policy_document';
  sourceOrganization: string;
  sourceOrganizationAr: string;
  publishDate: string;
  documentUrl: string | null;
  pdfPath: string | null;
  summary: string | null;
  summaryAr: string | null;
  bankId: number | null;
  jurisdiction: 'aden' | 'sanaa' | 'both';
  language: 'en' | 'ar' | 'both';
  confidenceRating: 'A' | 'B' | 'C' | 'D';
  isVerified: boolean;
  tags: string[];
}

// CBY-Aden Official Circulars (from uploaded PDFs)
const cbyAdenCirculars: BankingDocument[] = [
  // 2024 Circulars
  {
    title: "CBY Circular No. 1/2024 - Foreign Exchange Regulations",
    titleAr: "تعميم البنك المركزي رقم 1/2024 - لوائح الصرف الأجنبي",
    documentType: "circular",
    sourceOrganization: "Central Bank of Yemen - Aden",
    sourceOrganizationAr: "البنك المركزي اليمني - عدن",
    publishDate: "2024-01-15",
    documentUrl: "https://english.cby-ye.com/circulars",
    pdfPath: "/documents/cby/circular_1_2024.pdf",
    summary: "Updated foreign exchange regulations for commercial banks operating under CBY-Aden supervision.",
    summaryAr: "لوائح الصرف الأجنبي المحدثة للبنوك التجارية العاملة تحت إشراف البنك المركزي - عدن",
    bankId: null,
    jurisdiction: "aden",
    language: "both",
    confidenceRating: "A",
    isVerified: true,
    tags: ["forex", "regulation", "compliance", "2024"]
  },
  {
    title: "CBY Circular No. 2/2024 - Capital Adequacy Requirements",
    titleAr: "تعميم البنك المركزي رقم 2/2024 - متطلبات كفاية رأس المال",
    documentType: "circular",
    sourceOrganization: "Central Bank of Yemen - Aden",
    sourceOrganizationAr: "البنك المركزي اليمني - عدن",
    publishDate: "2024-02-20",
    documentUrl: "https://english.cby-ye.com/circulars",
    pdfPath: "/documents/cby/circular_2_2024.pdf",
    summary: "Updated Basel III capital adequacy requirements for Yemeni banks.",
    summaryAr: "متطلبات كفاية رأس المال المحدثة وفق بازل 3 للبنوك اليمنية",
    bankId: null,
    jurisdiction: "aden",
    language: "both",
    confidenceRating: "A",
    isVerified: true,
    tags: ["capital", "basel", "regulation", "2024"]
  },
  {
    title: "CBY Annual Report 2023",
    titleAr: "التقرير السنوي للبنك المركزي 2023",
    documentType: "annual_report",
    sourceOrganization: "Central Bank of Yemen - Aden",
    sourceOrganizationAr: "البنك المركزي اليمني - عدن",
    publishDate: "2024-06-30",
    documentUrl: "https://english.cby-ye.com/annual-reports",
    pdfPath: "/documents/cby/annual_report_2023.pdf",
    summary: "Comprehensive annual report covering monetary policy, banking sector performance, and economic indicators for 2023.",
    summaryAr: "تقرير سنوي شامل يغطي السياسة النقدية وأداء القطاع المصرفي والمؤشرات الاقتصادية لعام 2023",
    bankId: null,
    jurisdiction: "aden",
    language: "both",
    confidenceRating: "A",
    isVerified: true,
    tags: ["annual_report", "monetary_policy", "banking", "2023"]
  },
  {
    title: "CBY Circular No. 3/2024 - AML/CFT Guidelines Update",
    titleAr: "تعميم البنك المركزي رقم 3/2024 - تحديث إرشادات مكافحة غسل الأموال وتمويل الإرهاب",
    documentType: "circular",
    sourceOrganization: "Central Bank of Yemen - Aden",
    sourceOrganizationAr: "البنك المركزي اليمني - عدن",
    publishDate: "2024-03-15",
    documentUrl: "https://english.cby-ye.com/circulars",
    pdfPath: "/documents/cby/circular_3_2024.pdf",
    summary: "Updated anti-money laundering and counter-terrorism financing guidelines aligned with FATF recommendations.",
    summaryAr: "إرشادات محدثة لمكافحة غسل الأموال وتمويل الإرهاب متوافقة مع توصيات مجموعة العمل المالي",
    bankId: null,
    jurisdiction: "aden",
    language: "both",
    confidenceRating: "A",
    isVerified: true,
    tags: ["aml", "cft", "fatf", "compliance", "2024"]
  },
  {
    title: "Licensed Banks List - December 2024",
    titleAr: "قائمة البنوك المرخصة - ديسمبر 2024",
    documentType: "regulatory_filing",
    sourceOrganization: "Central Bank of Yemen - Aden",
    sourceOrganizationAr: "البنك المركزي اليمني - عدن",
    publishDate: "2024-12-01",
    documentUrl: "https://english.cby-ye.com/files/670f66ad9ce87.pdf",
    pdfPath: "/documents/cby/licensed_banks_dec_2024.pdf",
    summary: "Official list of 31 banks licensed to operate under CBY-Aden supervision.",
    summaryAr: "القائمة الرسمية لـ 31 بنكاً مرخصاً للعمل تحت إشراف البنك المركزي - عدن",
    bankId: null,
    jurisdiction: "aden",
    language: "both",
    confidenceRating: "A",
    isVerified: true,
    tags: ["licensed_banks", "regulation", "2024"]
  }
];

// Bank Annual Reports (to be fetched dynamically)
const bankAnnualReports: BankingDocument[] = [
  {
    title: "Tadhamon International Islamic Bank - Annual Report 2023",
    titleAr: "بنك التضامن الإسلامي الدولي - التقرير السنوي 2023",
    documentType: "annual_report",
    sourceOrganization: "Tadhamon International Islamic Bank",
    sourceOrganizationAr: "بنك التضامن الإسلامي الدولي",
    publishDate: "2024-04-30",
    documentUrl: "https://www.tadhamonbank.com/annual-reports",
    pdfPath: null,
    summary: "Annual financial report including audited financial statements, board report, and performance analysis.",
    summaryAr: "التقرير المالي السنوي متضمناً القوائم المالية المدققة وتقرير مجلس الإدارة وتحليل الأداء",
    bankId: 7, // TIIB
    jurisdiction: "both",
    language: "both",
    confidenceRating: "A",
    isVerified: true,
    tags: ["annual_report", "financial_statements", "tiib", "2023"]
  },
  {
    title: "Al-Kuraimi Islamic Microfinance Bank - Annual Report 2023",
    titleAr: "بنك الكريمي الإسلامي للتمويل الأصغر - التقرير السنوي 2023",
    documentType: "annual_report",
    sourceOrganization: "Al-Kuraimi Islamic Microfinance Bank",
    sourceOrganizationAr: "بنك الكريمي الإسلامي للتمويل الأصغر",
    publishDate: "2024-05-15",
    documentUrl: "http://alkuraimi.com/reports",
    pdfPath: null,
    summary: "Annual report covering microfinance operations, financial inclusion metrics, and social impact.",
    summaryAr: "التقرير السنوي الذي يغطي عمليات التمويل الأصغر ومؤشرات الشمول المالي والأثر الاجتماعي",
    bankId: 17, // KIMB
    jurisdiction: "both",
    language: "both",
    confidenceRating: "A",
    isVerified: true,
    tags: ["annual_report", "microfinance", "financial_inclusion", "2023"]
  },
  {
    title: "Yemen Bank for Reconstruction & Development - Annual Report 2023",
    titleAr: "البنك اليمني للإنشاء والتعمير - التقرير السنوي 2023",
    documentType: "annual_report",
    sourceOrganization: "Yemen Bank for Reconstruction & Development",
    sourceOrganizationAr: "البنك اليمني للإنشاء والتعمير",
    publishDate: "2024-06-30",
    documentUrl: "https://www.ybrd.com.ye/reports",
    pdfPath: null,
    summary: "Annual report of Yemen's oldest state bank covering reconstruction financing and development projects.",
    summaryAr: "التقرير السنوي لأقدم بنك حكومي يمني يغطي تمويل إعادة الإعمار ومشاريع التنمية",
    bankId: 1, // YBRD
    jurisdiction: "both",
    language: "both",
    confidenceRating: "B",
    isVerified: false,
    tags: ["annual_report", "state_bank", "reconstruction", "2023"]
  }
];

// OFAC Sanctions Documents
const sanctionsDocuments: BankingDocument[] = [
  {
    title: "OFAC SDN Designation - International Bank of Yemen",
    titleAr: "تصنيف مكتب مراقبة الأصول الأجنبية - البنك اليمني الدولي",
    documentType: "regulatory_filing",
    sourceOrganization: "U.S. Department of Treasury - OFAC",
    sourceOrganizationAr: "وزارة الخزانة الأمريكية - مكتب مراقبة الأصول الأجنبية",
    publishDate: "2025-04-17",
    documentUrl: "https://ofac.treasury.gov/recent-actions",
    pdfPath: null,
    summary: "OFAC designation of International Bank of Yemen for providing financial services to Ansarallah (Houthis).",
    summaryAr: "تصنيف البنك اليمني الدولي لتقديم خدمات مالية لأنصار الله (الحوثيين)",
    bankId: 4, // IBY
    jurisdiction: "sanaa",
    language: "en",
    confidenceRating: "A",
    isVerified: true,
    tags: ["sanctions", "ofac", "houthis", "2025"]
  },
  {
    title: "OFAC SDN Designation - Yemen Kuwait Bank",
    titleAr: "تصنيف مكتب مراقبة الأصول الأجنبية - بنك اليمن والكويت",
    documentType: "regulatory_filing",
    sourceOrganization: "U.S. Department of Treasury - OFAC",
    sourceOrganizationAr: "وزارة الخزانة الأمريكية - مكتب مراقبة الأصول الأجنبية",
    publishDate: "2025-01-17",
    documentUrl: "https://ofac.treasury.gov/recent-actions",
    pdfPath: null,
    summary: "OFAC designation of Yemen Kuwait Bank for financial support to Ansarallah. GL32 wind-down authorized.",
    summaryAr: "تصنيف بنك اليمن والكويت لدعمه المالي لأنصار الله. تم الترخيص بالتصفية التدريجية",
    bankId: 3, // YKB
    jurisdiction: "both",
    language: "en",
    confidenceRating: "A",
    isVerified: true,
    tags: ["sanctions", "ofac", "houthis", "wind_down", "2025"]
  },
  {
    title: "OFAC General License 32 - Yemen Wind-Down Authorization",
    titleAr: "الترخيص العام 32 - تفويض التصفية التدريجية في اليمن",
    documentType: "regulatory_filing",
    sourceOrganization: "U.S. Department of Treasury - OFAC",
    sourceOrganizationAr: "وزارة الخزانة الأمريكية - مكتب مراقبة الأصول الأجنبية",
    publishDate: "2025-01-17",
    documentUrl: "https://ofac.treasury.gov/faqs/topic/1796",
    pdfPath: null,
    summary: "General License authorizing wind-down of transactions with sanctioned Yemeni banks through specified date.",
    summaryAr: "ترخيص عام يجيز التصفية التدريجية للمعاملات مع البنوك اليمنية المصنفة حتى تاريخ محدد",
    bankId: null,
    jurisdiction: "both",
    language: "en",
    confidenceRating: "A",
    isVerified: true,
    tags: ["sanctions", "ofac", "general_license", "wind_down", "2025"]
  }
];

/**
 * Ingest banking documents into the database
 */
export async function ingestBankingDocuments(): Promise<{
  success: boolean;
  documentsIngested: number;
  errors: string[];
}> {
  const conn = await mysql.createConnection(process.env.DATABASE_URL!);
  const errors: string[] = [];
  let documentsIngested = 0;
  
  try {
    const allDocuments = [
      ...cbyAdenCirculars,
      ...bankAnnualReports,
      ...sanctionsDocuments
    ];
    
    for (const doc of allDocuments) {
      try {
        // Insert into research_publications
        await conn.execute(`
          INSERT INTO research_publications (
            title, titleAr, category, sourceOrganization, sourceOrganizationAr,
            publishDate, documentUrl, summary, summaryAr, language,
            confidenceRating, isVerified, tags, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
          ON DUPLICATE KEY UPDATE
            title = VALUES(title),
            summary = VALUES(summary),
            isVerified = VALUES(isVerified)
        `, [
          doc.title,
          doc.titleAr,
          doc.documentType,
          doc.sourceOrganization,
          doc.sourceOrganizationAr,
          doc.publishDate,
          doc.documentUrl || doc.pdfPath,
          doc.summary,
          doc.summaryAr,
          doc.language,
          doc.confidenceRating,
          doc.isVerified ? 1 : 0,
          JSON.stringify(doc.tags)
        ]);
        
        // Also insert into evidence_documents for Truth Layer
        await conn.execute(`
          INSERT INTO evidence_documents (
            title, titleAr, documentType, sourceUrl, localPath,
            publishedAt, jurisdiction, language, verificationStatus,
            contentHash, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
          ON DUPLICATE KEY UPDATE
            verificationStatus = VALUES(verificationStatus)
        `, [
          doc.title,
          doc.titleAr,
          doc.documentType,
          doc.documentUrl,
          doc.pdfPath,
          doc.publishDate,
          doc.jurisdiction,
          doc.language,
          doc.isVerified ? 'verified' : 'pending',
          null // contentHash to be computed when PDF is downloaded
        ]);
        
        documentsIngested++;
      } catch (err: any) {
        errors.push(`Failed to ingest ${doc.title}: ${err.message}`);
      }
    }
    
    return { success: errors.length === 0, documentsIngested, errors };
  } finally {
    await conn.end();
  }
}

/**
 * Fetch latest CBY circulars from official website
 */
export async function fetchCBYCirculars(): Promise<BankingDocument[]> {
  // This would scrape/API call to CBY website
  // For now, return the static list
  return cbyAdenCirculars;
}

/**
 * Fetch OFAC sanctions updates for Yemen
 */
export async function fetchOFACSanctions(): Promise<BankingDocument[]> {
  // This would call OFAC API
  // For now, return the static list
  return sanctionsDocuments;
}

/**
 * Create claims from banking documents for Truth Layer
 */
export async function createBankingClaims(): Promise<{
  success: boolean;
  claimsCreated: number;
}> {
  const conn = await mysql.createConnection(process.env.DATABASE_URL!);
  let claimsCreated = 0;
  
  try {
    // Get all banks
    const [banks] = await conn.execute('SELECT * FROM commercial_banks');
    
    for (const bank of banks as any[]) {
      // Create claim for total assets
      if (bank.totalAssets) {
        await conn.execute(`
          INSERT INTO claims (
            claimType, subject, subjectType, predicate, objectValue, objectUnit,
            jurisdiction, asOfDate, confidenceScore, status, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
          ON DUPLICATE KEY UPDATE
            objectValue = VALUES(objectValue),
            asOfDate = VALUES(asOfDate)
        `, [
          'metric',
          bank.name,
          'bank',
          'total_assets',
          bank.totalAssets,
          'USD_millions',
          bank.jurisdiction,
          bank.metricsAsOf,
          bank.confidenceRating === 'A' ? 0.95 : bank.confidenceRating === 'B' ? 0.85 : 0.70,
          'verified'
        ]);
        claimsCreated++;
      }
      
      // Create claim for NPL ratio
      if (bank.nonPerformingLoans) {
        await conn.execute(`
          INSERT INTO claims (
            claimType, subject, subjectType, predicate, objectValue, objectUnit,
            jurisdiction, asOfDate, confidenceScore, status, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
          ON DUPLICATE KEY UPDATE
            objectValue = VALUES(objectValue),
            asOfDate = VALUES(asOfDate)
        `, [
          'metric',
          bank.name,
          'bank',
          'npl_ratio',
          bank.nonPerformingLoans,
          'percent',
          bank.jurisdiction,
          bank.metricsAsOf,
          bank.confidenceRating === 'A' ? 0.95 : bank.confidenceRating === 'B' ? 0.85 : 0.70,
          'verified'
        ]);
        claimsCreated++;
      }
      
      // Create claim for sanctions status
      if (bank.sanctionsStatus !== 'none') {
        await conn.execute(`
          INSERT INTO claims (
            claimType, subject, subjectType, predicate, objectValue, objectUnit,
            jurisdiction, asOfDate, confidenceScore, status, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
          ON DUPLICATE KEY UPDATE
            objectValue = VALUES(objectValue)
        `, [
          'status',
          bank.name,
          'bank',
          'sanctions_status',
          bank.sanctionsStatus.toUpperCase(),
          null,
          bank.jurisdiction,
          new Date().toISOString().split('T')[0],
          0.99, // Sanctions are highly verified
          'verified'
        ]);
        claimsCreated++;
      }
    }
    
    return { success: true, claimsCreated };
  } finally {
    await conn.end();
  }
}

/**
 * Seed banking-related sources into source_registry.
 * These sources should already exist from the canonical xlsx import.
 * This function ensures they exist as a fallback.
 */
export async function seedBankingEvidenceSources(): Promise<void> {
  const conn = await mysql.createConnection(process.env.DATABASE_URL!);

  const bankingSources = [
    { sourceId: 'BANK-CBY-ADEN', name: 'Central Bank of Yemen - Aden', tier: 'T0', status: 'ACTIVE', accessType: 'WEB', webUrl: 'https://english.cby-ye.com', description: 'Official central bank of the internationally recognized government' },
    { sourceId: 'BANK-CBY-SANAA', name: 'Central Bank of Yemen - Sana\'a', tier: 'T0', status: 'ACTIVE', accessType: 'WEB', webUrl: 'https://www.centralbank.gov.ye', description: 'De facto central bank in Houthi-controlled areas' },
    { sourceId: 'BANK-OFAC', name: 'U.S. Department of Treasury - OFAC', tier: 'T1', status: 'ACTIVE', accessType: 'WEB', webUrl: 'https://ofac.treasury.gov', description: 'Office of Foreign Assets Control - sanctions authority' },
    { sourceId: 'BANK-WORLD-BANK', name: 'World Bank - Yemen', tier: 'T1', status: 'ACTIVE', accessType: 'API', webUrl: 'https://www.worldbank.org/en/country/yemen', description: 'International financial institution providing development data' },
    { sourceId: 'BANK-IMF', name: 'International Monetary Fund', tier: 'T1', status: 'ACTIVE', accessType: 'API', webUrl: 'https://www.imf.org/en/Countries/YEM', description: 'IMF Article IV consultations and economic assessments' },
  ];

  try {
    for (const source of bankingSources) {
      await conn.execute(`
        INSERT INTO source_registry (
          sourceId, name, tier, status, accessType, webUrl, description, updateFrequency, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'QUARTERLY', NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          webUrl = VALUES(webUrl)
      `, [
        source.sourceId,
        source.name,
        source.tier,
        source.status,
        source.accessType,
        source.webUrl,
        source.description,
      ]);
    }
  } finally {
    await conn.end();
  }
}

export {
  cbyAdenCirculars,
  bankAnnualReports,
  sanctionsDocuments,
  BankingDocument
};
