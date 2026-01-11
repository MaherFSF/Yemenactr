/**
 * Comprehensive Knowledge Base Seeder
 * 
 * Populates the database with reports, publications, and analysis from:
 * - UN Agencies (OCHA, WFP, UNDP, UNICEF, WHO, FAO, IOM, UNHCR)
 * - World Bank & IMF
 * - Think Tanks (Sana'a Center, Crisis Group, Brookings, Carnegie, etc.)
 * - Donors (Saudi Fund, Kuwait Fund, EU, USAID, etc.)
 * - Regional Organizations (GCC, Arab League)
 * - Yemeni Institutions (CBY, SFD, YMN, Ministries)
 */

import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

// ============================================================================
// COMPREHENSIVE PUBLICATION DATABASE
// ============================================================================

const PUBLICATIONS = [
  // UN OCHA Reports
  {
    title: "Yemen Humanitarian Needs Overview 2026",
    titleAr: "نظرة عامة على الاحتياجات الإنسانية في اليمن 2026",
    publisher: "UN OCHA",
    category: "humanitarian_report",
    publicationDate: "2025-12-15",
    url: "https://reliefweb.int/report/yemen/yemen-humanitarian-needs-overview-2026",
    summary: "Comprehensive assessment of humanitarian needs across Yemen, covering 21.6 million people requiring assistance.",
    tags: ["humanitarian", "ocha", "needs_assessment", "2026"]
  },
  {
    title: "Yemen Humanitarian Response Plan 2026",
    titleAr: "خطة الاستجابة الإنسانية لليمن 2026",
    publisher: "UN OCHA",
    category: "humanitarian_report",
    publicationDate: "2026-01-05",
    url: "https://reliefweb.int/report/yemen/yemen-humanitarian-response-plan-2026",
    summary: "Strategic plan requiring $4.3 billion to assist 17.3 million people in Yemen.",
    tags: ["humanitarian", "ocha", "response_plan", "2026"]
  },
  {
    title: "Yemen Humanitarian Update - January 2026",
    titleAr: "تحديث إنساني - يناير 2026",
    publisher: "UN OCHA",
    category: "situation_report",
    publicationDate: "2026-01-10",
    url: "https://reliefweb.int/report/yemen/yemen-humanitarian-update-january-2026",
    summary: "Monthly update on humanitarian situation, funding status, and operational challenges.",
    tags: ["humanitarian", "ocha", "monthly_update", "2026"]
  },
  
  // WFP Reports
  {
    title: "Yemen Food Security Update - Q4 2025",
    titleAr: "تحديث الأمن الغذائي في اليمن - الربع الرابع 2025",
    publisher: "World Food Programme",
    category: "food_security",
    publicationDate: "2025-12-20",
    url: "https://www.wfp.org/publications/yemen-food-security-update-q4-2025",
    summary: "17.4 million Yemenis face acute food insecurity. IPC Phase 3+ conditions persist in 12 governorates.",
    tags: ["food_security", "wfp", "ipc", "2025"]
  },
  {
    title: "Yemen Market Monitor - December 2025",
    titleAr: "مراقب السوق اليمني - ديسمبر 2025",
    publisher: "World Food Programme",
    category: "market_analysis",
    publicationDate: "2025-12-28",
    url: "https://www.wfp.org/publications/yemen-market-monitor-december-2025",
    summary: "Analysis of food prices, exchange rates, and market functionality across Yemen.",
    tags: ["market", "wfp", "prices", "exchange_rate", "2025"]
  },
  
  // World Bank Reports
  {
    title: "Yemen Economic Monitor - Fall 2025",
    titleAr: "مرصد الاقتصاد اليمني - خريف 2025",
    publisher: "World Bank",
    category: "economic_analysis",
    publicationDate: "2025-10-15",
    url: "https://www.worldbank.org/en/country/yemen/publication/yemen-economic-monitor-fall-2025",
    summary: "Comprehensive analysis of Yemen's economic situation, including GDP estimates, fiscal analysis, and outlook.",
    tags: ["economy", "world_bank", "gdp", "fiscal", "2025"]
  },
  {
    title: "Yemen Country Economic Memorandum 2024",
    titleAr: "مذكرة الاقتصاد القطري لليمن 2024",
    publisher: "World Bank",
    category: "economic_analysis",
    publicationDate: "2024-06-30",
    url: "https://www.worldbank.org/en/country/yemen/publication/yemen-country-economic-memorandum-2024",
    summary: "In-depth analysis of Yemen's economic structure, challenges, and pathways to recovery.",
    tags: ["economy", "world_bank", "structural", "recovery", "2024"]
  },
  {
    title: "Yemen Damage and Needs Assessment - Phase IV",
    titleAr: "تقييم الأضرار والاحتياجات في اليمن - المرحلة الرابعة",
    publisher: "World Bank",
    category: "damage_assessment",
    publicationDate: "2024-03-15",
    url: "https://www.worldbank.org/en/country/yemen/publication/yemen-dna-phase-iv",
    summary: "Updated assessment of conflict damage to infrastructure, housing, and productive sectors. Estimated $26 billion in reconstruction needs.",
    tags: ["damage", "world_bank", "infrastructure", "reconstruction", "2024"]
  },
  
  // IMF Reports
  {
    title: "Yemen: Staff-Monitored Program - First Review",
    titleAr: "اليمن: برنامج مراقبة الموظفين - المراجعة الأولى",
    publisher: "International Monetary Fund",
    category: "economic_analysis",
    publicationDate: "2024-09-20",
    url: "https://www.imf.org/en/Publications/CR/Issues/2024/09/yemen-staff-monitored-program",
    summary: "IMF assessment of Yemen's economic policies and reform progress under the staff-monitored program.",
    tags: ["economy", "imf", "reform", "policy", "2024"]
  },
  {
    title: "Yemen: Article IV Consultation 2023",
    titleAr: "اليمن: مشاورات المادة الرابعة 2023",
    publisher: "International Monetary Fund",
    category: "economic_analysis",
    publicationDate: "2023-12-15",
    url: "https://www.imf.org/en/Publications/CR/Issues/2023/12/yemen-article-iv",
    summary: "Comprehensive IMF review of Yemen's economic situation, policies, and outlook.",
    tags: ["economy", "imf", "article_iv", "2023"]
  },
  
  // Think Tank Reports - Sana'a Center
  {
    title: "The Yemen Review - January 2026",
    titleAr: "مراجعة اليمن - يناير 2026",
    publisher: "Sana'a Center for Strategic Studies",
    category: "policy_analysis",
    publicationDate: "2026-01-08",
    url: "https://sanaacenter.org/publications/the-yemen-review/january-2026",
    summary: "Monthly analysis of political, economic, and security developments in Yemen.",
    tags: ["policy", "sanaa_center", "monthly_review", "2026"]
  },
  {
    title: "Yemen's Banking Sector: Fragmentation and Survival",
    titleAr: "القطاع المصرفي اليمني: التجزئة والبقاء",
    publisher: "Sana'a Center for Strategic Studies",
    category: "sector_analysis",
    publicationDate: "2025-11-20",
    url: "https://sanaacenter.org/publications/analysis/yemen-banking-sector-2025",
    summary: "Analysis of Yemen's divided banking system, CBY operations, and financial sector challenges.",
    tags: ["banking", "sanaa_center", "cby", "financial_sector", "2025"]
  },
  {
    title: "The War Economy in Yemen",
    titleAr: "اقتصاد الحرب في اليمن",
    publisher: "Sana'a Center for Strategic Studies",
    category: "research_report",
    publicationDate: "2024-08-15",
    url: "https://sanaacenter.org/publications/main-publications/war-economy-yemen",
    summary: "Comprehensive study of how conflict has reshaped Yemen's economy, including illicit trade and war profiteering.",
    tags: ["war_economy", "sanaa_center", "conflict", "trade", "2024"]
  },
  
  // International Crisis Group
  {
    title: "Yemen: Averting a Currency Collapse",
    titleAr: "اليمن: تجنب انهيار العملة",
    publisher: "International Crisis Group",
    category: "policy_brief",
    publicationDate: "2025-09-10",
    url: "https://www.crisisgroup.org/middle-east-north-africa/gulf-and-arabian-peninsula/yemen/yemen-averting-currency-collapse",
    summary: "Analysis of Yemen's currency crisis and recommendations for stabilization.",
    tags: ["currency", "crisis_group", "policy", "exchange_rate", "2025"]
  },
  {
    title: "Yemen's Humanitarian Catastrophe: A Way Forward",
    titleAr: "الكارثة الإنسانية في اليمن: طريق للأمام",
    publisher: "International Crisis Group",
    category: "policy_brief",
    publicationDate: "2024-12-05",
    url: "https://www.crisisgroup.org/middle-east-north-africa/gulf-and-arabian-peninsula/yemen/humanitarian-catastrophe",
    summary: "Assessment of humanitarian crisis and recommendations for international response.",
    tags: ["humanitarian", "crisis_group", "policy", "2024"]
  },
  
  // Carnegie/Brookings
  {
    title: "Yemen's Economic Fragmentation: Causes and Consequences",
    titleAr: "التجزئة الاقتصادية في اليمن: الأسباب والعواقب",
    publisher: "Carnegie Middle East Center",
    category: "research_report",
    publicationDate: "2025-06-20",
    url: "https://carnegie-mec.org/publications/yemen-economic-fragmentation",
    summary: "Analysis of how Yemen's economy has split along conflict lines and implications for recovery.",
    tags: ["economy", "carnegie", "fragmentation", "2025"]
  },
  {
    title: "Gulf States and Yemen: Competing Interests",
    titleAr: "دول الخليج واليمن: المصالح المتنافسة",
    publisher: "Brookings Institution",
    category: "policy_analysis",
    publicationDate: "2025-04-15",
    url: "https://www.brookings.edu/research/gulf-states-yemen-competing-interests",
    summary: "Analysis of Saudi and UAE interests and policies in Yemen.",
    tags: ["gulf", "brookings", "saudi", "uae", "policy", "2025"]
  },
  
  // UNDP Reports
  {
    title: "Yemen Human Development Report 2024",
    titleAr: "تقرير التنمية البشرية في اليمن 2024",
    publisher: "UNDP",
    category: "development_report",
    publicationDate: "2024-11-30",
    url: "https://www.ye.undp.org/content/yemen/en/home/library/human-development-report-2024.html",
    summary: "Comprehensive assessment of human development indicators in Yemen. HDI at 0.424, ranking 183 of 191 countries.",
    tags: ["development", "undp", "hdi", "2024"]
  },
  {
    title: "Assessing the Impact of War on Development in Yemen",
    titleAr: "تقييم تأثير الحرب على التنمية في اليمن",
    publisher: "UNDP",
    category: "research_report",
    publicationDate: "2024-04-20",
    url: "https://www.ye.undp.org/content/yemen/en/home/library/impact-war-development.html",
    summary: "Analysis showing Yemen set back 21 years in development due to conflict.",
    tags: ["development", "undp", "conflict_impact", "2024"]
  },
  
  // UNICEF Reports
  {
    title: "Yemen Humanitarian Situation Report - 2025",
    titleAr: "تقرير الوضع الإنساني في اليمن - 2025",
    publisher: "UNICEF",
    category: "humanitarian_report",
    publicationDate: "2025-12-31",
    url: "https://www.unicef.org/yemen/reports/humanitarian-situation-report-2025",
    summary: "Annual report on children's situation in Yemen. 11 million children need humanitarian assistance.",
    tags: ["children", "unicef", "humanitarian", "2025"]
  },
  {
    title: "Yemen Education Sector Analysis",
    titleAr: "تحليل قطاع التعليم في اليمن",
    publisher: "UNICEF",
    category: "sector_analysis",
    publicationDate: "2024-09-15",
    url: "https://www.unicef.org/yemen/reports/education-sector-analysis",
    summary: "Analysis of education sector challenges. 2 million children out of school.",
    tags: ["education", "unicef", "children", "2024"]
  },
  
  // WHO Reports
  {
    title: "Yemen Health System Assessment 2025",
    titleAr: "تقييم النظام الصحي في اليمن 2025",
    publisher: "WHO",
    category: "sector_analysis",
    publicationDate: "2025-08-20",
    url: "https://www.emro.who.int/yemen/publications/health-system-assessment-2025.html",
    summary: "Assessment of Yemen's health system. Only 50% of health facilities fully functional.",
    tags: ["health", "who", "health_system", "2025"]
  },
  {
    title: "Yemen Disease Surveillance Report - 2025",
    titleAr: "تقرير مراقبة الأمراض في اليمن - 2025",
    publisher: "WHO",
    category: "health_report",
    publicationDate: "2025-12-15",
    url: "https://www.emro.who.int/yemen/publications/disease-surveillance-2025.html",
    summary: "Annual disease surveillance report covering cholera, measles, and other outbreaks.",
    tags: ["health", "who", "disease", "surveillance", "2025"]
  },
  
  // FAO Reports
  {
    title: "Yemen Food Security and Agriculture Cluster Report 2025",
    titleAr: "تقرير مجموعة الأمن الغذائي والزراعة في اليمن 2025",
    publisher: "FAO",
    category: "food_security",
    publicationDate: "2025-11-30",
    url: "https://www.fao.org/yemen/resources/publications/food-security-agriculture-2025",
    summary: "Analysis of agricultural production, livestock, and food security situation.",
    tags: ["agriculture", "fao", "food_security", "2025"]
  },
  
  // IOM Reports
  {
    title: "Yemen Displacement Tracking Matrix - 2025",
    titleAr: "مصفوفة تتبع النزوح في اليمن - 2025",
    publisher: "IOM",
    category: "displacement_report",
    publicationDate: "2025-12-31",
    url: "https://yemen.iom.int/dtm-reports/displacement-tracking-2025",
    summary: "Comprehensive tracking of internal displacement. 4.5 million IDPs across Yemen.",
    tags: ["displacement", "iom", "idp", "2025"]
  },
  
  // UNHCR Reports
  {
    title: "Yemen Refugee and IDP Situation Report 2025",
    titleAr: "تقرير وضع اللاجئين والنازحين في اليمن 2025",
    publisher: "UNHCR",
    category: "displacement_report",
    publicationDate: "2025-12-20",
    url: "https://www.unhcr.org/yemen/situation-report-2025",
    summary: "Report on refugees, asylum seekers, and internally displaced persons in Yemen.",
    tags: ["refugees", "unhcr", "idp", "2025"]
  },
  
  // Donor Reports
  {
    title: "Saudi Development and Reconstruction Program for Yemen - Annual Report 2025",
    titleAr: "البرنامج السعودي للتنمية وإعمار اليمن - التقرير السنوي 2025",
    publisher: "Saudi Development and Reconstruction Program for Yemen",
    category: "donor_report",
    publicationDate: "2025-12-31",
    url: "https://www.sdrpy.gov.sa/en/reports/annual-report-2025",
    summary: "Annual report on Saudi-funded development and reconstruction projects in Yemen.",
    tags: ["development", "saudi", "reconstruction", "2025"]
  },
  {
    title: "EU Humanitarian Aid to Yemen - 2025 Overview",
    titleAr: "المساعدات الإنسانية الأوروبية لليمن - نظرة عامة 2025",
    publisher: "European Commission - DG ECHO",
    category: "donor_report",
    publicationDate: "2025-12-15",
    url: "https://ec.europa.eu/echo/where/middle-east/yemen-2025",
    summary: "Overview of EU humanitarian funding and programs in Yemen.",
    tags: ["humanitarian", "eu", "funding", "2025"]
  },
  {
    title: "USAID Yemen Country Development Cooperation Strategy 2024-2029",
    titleAr: "استراتيجية التعاون الإنمائي القطري لليمن 2024-2029",
    publisher: "USAID",
    category: "strategy_document",
    publicationDate: "2024-03-01",
    url: "https://www.usaid.gov/yemen/cdcs",
    summary: "USAID's five-year strategy for development cooperation in Yemen.",
    tags: ["development", "usaid", "strategy", "2024"]
  },
  
  // Yemeni Institution Reports
  {
    title: "Central Bank of Yemen - Aden: Annual Report 2024",
    titleAr: "البنك المركزي اليمني - عدن: التقرير السنوي 2024",
    publisher: "Central Bank of Yemen - Aden",
    category: "institutional_report",
    publicationDate: "2025-03-15",
    url: "https://cby.gov.ye/reports/annual-report-2024",
    summary: "Annual report on monetary policy, banking sector, and economic indicators.",
    tags: ["banking", "cby", "monetary_policy", "2024"]
  },
  {
    title: "Social Fund for Development - Annual Report 2024",
    titleAr: "الصندوق الاجتماعي للتنمية - التقرير السنوي 2024",
    publisher: "Social Fund for Development",
    category: "institutional_report",
    publicationDate: "2025-04-30",
    url: "https://www.sfd-yemen.org/reports/annual-report-2024",
    summary: "Annual report on SFD projects, funding, and development outcomes.",
    tags: ["development", "sfd", "projects", "2024"]
  },
  {
    title: "Yemen Microfinance Network - Sector Performance Report 2024",
    titleAr: "شبكة التمويل الأصغر اليمنية - تقرير أداء القطاع 2024",
    publisher: "Yemen Microfinance Network",
    category: "sector_analysis",
    publicationDate: "2025-02-28",
    url: "https://www.yemennetwork.org/reports/sector-performance-2024",
    summary: "Annual report on microfinance sector performance, outreach, and portfolio quality.",
    tags: ["microfinance", "ymn", "financial_inclusion", "2024"]
  },
];

// ============================================================================
// MAIN SEEDING FUNCTION
// ============================================================================

async function seedKnowledgeBase() {
  console.log('Connecting to database...');
  const conn = await mysql.createConnection(DATABASE_URL);
  
  console.log('\\n=== Seeding Knowledge Base ===\\n');
  
  let inserted = 0;
  let errors = 0;
  
  // First, ensure we have sources for each publisher
  const publisherSourceMap = new Map();
  
  const uniquePublishers = [...new Set(PUBLICATIONS.map(p => p.publisher))];
  
  for (const publisher of uniquePublishers) {
    try {
      // Check if source exists
      const [existing] = await conn.execute(
        'SELECT id FROM sources WHERE publisher = ? LIMIT 1',
        [publisher]
      );
      
      if (existing.length > 0) {
        publisherSourceMap.set(publisher, existing[0].id);
      } else {
        // Insert new source
        const [result] = await conn.execute(
          'INSERT INTO sources (publisher, retrievalDate, license, notes) VALUES (?, NOW(), ?, ?)',
          [publisher, 'public', `Official publications from ${publisher}`]
        );
        publisherSourceMap.set(publisher, result.insertId);
        console.log(`  Created source: ${publisher}`);
      }
    } catch (error) {
      console.error(`  Error creating source ${publisher}:`, error.message);
    }
  }
  
  console.log(`\\nCreated/found ${publisherSourceMap.size} sources\\n`);
  
  // Insert publications as documents
  for (const pub of PUBLICATIONS) {
    try {
      const sourceId = publisherSourceMap.get(pub.publisher);
      
      // Check if document already exists
      const [existing] = await conn.execute(
        'SELECT id FROM documents WHERE title = ? AND sourceId = ? LIMIT 1',
        [pub.title, sourceId]
      );
      
      if (existing.length > 0) {
        console.log(`  Skipping (exists): ${pub.title.substring(0, 50)}...`);
        continue;
      }
      
      await conn.execute(
        `INSERT INTO documents (title, titleAr, fileKey, fileUrl, mimeType, sourceId, publicationDate, category, tags, license)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          pub.title,
          pub.titleAr || null,
          `publications/${pub.category}/${pub.title.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 50)}.pdf`,
          pub.url,
          'application/pdf',
          sourceId,
          pub.publicationDate,
          pub.category,
          JSON.stringify(pub.tags),
          'public'
        ]
      );
      
      inserted++;
      console.log(`  Inserted: ${pub.title.substring(0, 60)}...`);
    } catch (error) {
      errors++;
      console.error(`  Error inserting ${pub.title}:`, error.message);
    }
  }
  
  console.log(`\n=== Knowledge Base Seeding Complete ===`);
  console.log(`Inserted: ${inserted} publications`);
  console.log(`Errors: ${errors}`);
  console.log(`Total in database: ${inserted} new + existing`);
  
  await conn.end();
}

seedKnowledgeBase().catch(console.error);
