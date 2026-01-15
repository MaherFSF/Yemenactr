/**
 * YETO Comprehensive Entity Seeding Script
 * Seeds all organizations, data sources, and commercial entities
 */

import mysql from 'mysql2/promise';

async function seedEntities() {
  console.log('🏢 Starting comprehensive entity seed...');
  
  const conn = await mysql.createConnection(process.env.DATABASE_URL!);
  
  // Create organizations table if not exists
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS organizations (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      nameAr VARCHAR(255),
      acronym VARCHAR(50),
      type ENUM('un', 'ingo', 'ngo', 'government', 'donor', 'bank', 'company', 'research', 'media', 'other') DEFAULT 'other',
      category VARCHAR(100),
      country VARCHAR(100),
      headquarters VARCHAR(255),
      yemenPresence ENUM('national', 'regional', 'limited', 'none') DEFAULT 'none',
      website VARCHAR(500),
      dataTypes TEXT,
      apiEndpoint VARCHAR(500),
      contactEmail VARCHAR(255),
      isActive BOOLEAN DEFAULT true,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  
  // Create data_sources table if not exists
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS data_sources (
      id INT PRIMARY KEY AUTO_INCREMENT,
      organizationId INT,
      name VARCHAR(255) NOT NULL,
      nameAr VARCHAR(255),
      type ENUM('api', 'report', 'database', 'survey', 'news') DEFAULT 'report',
      url VARCHAR(500),
      frequency ENUM('realtime', 'daily', 'weekly', 'monthly', 'quarterly', 'annual') DEFAULT 'monthly',
      dataFormat VARCHAR(50),
      accessLevel ENUM('public', 'restricted', 'subscription') DEFAULT 'public',
      lastUpdated TIMESTAMP NULL,
      isActive BOOLEAN DEFAULT true,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create commercial_entities table if not exists
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS commercial_entities (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      nameAr VARCHAR(255),
      type ENUM('bank', 'exchange', 'telecom', 'oil_gas', 'port', 'airline', 'insurance', 'trading', 'other') DEFAULT 'other',
      sector VARCHAR(100),
      headquarters VARCHAR(255),
      jurisdiction ENUM('aden', 'sanaa', 'both', 'international') DEFAULT 'both',
      ownership VARCHAR(500),
      status ENUM('operational', 'limited', 'suspended', 'liquidation') DEFAULT 'operational',
      employees INT,
      revenue DECIMAL(20,2),
      assets DECIMAL(20,2),
      website VARCHAR(500),
      notes TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  
  // Seed UN Organizations
  console.log('  📘 Seeding UN organizations...');
  const unOrgs = [
    { name: 'UN Office for the Coordination of Humanitarian Affairs', nameAr: 'مكتب الأمم المتحدة لتنسيق الشؤون الإنسانية', acronym: 'OCHA', type: 'un', category: 'Humanitarian', website: 'https://www.unocha.org/yemen' },
    { name: 'World Food Programme', nameAr: 'برنامج الأغذية العالمي', acronym: 'WFP', type: 'un', category: 'Food Security', website: 'https://www.wfp.org/countries/yemen' },
    { name: 'UN High Commissioner for Refugees', nameAr: 'المفوضية السامية للأمم المتحدة لشؤون اللاجئين', acronym: 'UNHCR', type: 'un', category: 'Protection', website: 'https://www.unhcr.org/yemen.html' },
    { name: 'UN Children\'s Fund', nameAr: 'منظمة الأمم المتحدة للطفولة', acronym: 'UNICEF', type: 'un', category: 'Child Protection', website: 'https://www.unicef.org/yemen' },
    { name: 'World Health Organization', nameAr: 'منظمة الصحة العالمية', acronym: 'WHO', type: 'un', category: 'Health', website: 'https://www.emro.who.int/yemen' },
    { name: 'UN Development Programme', nameAr: 'برنامج الأمم المتحدة الإنمائي', acronym: 'UNDP', type: 'un', category: 'Development', website: 'https://www.ye.undp.org' },
    { name: 'Food and Agriculture Organization', nameAr: 'منظمة الأغذية والزراعة', acronym: 'FAO', type: 'un', category: 'Agriculture', website: 'https://www.fao.org/yemen' },
    { name: 'International Organization for Migration', nameAr: 'المنظمة الدولية للهجرة', acronym: 'IOM', type: 'un', category: 'Migration', website: 'https://yemen.iom.int' },
    { name: 'UN Population Fund', nameAr: 'صندوق الأمم المتحدة للسكان', acronym: 'UNFPA', type: 'un', category: 'Population', website: 'https://yemen.unfpa.org' },
    { name: 'UN Office for Project Services', nameAr: 'مكتب الأمم المتحدة لخدمات المشاريع', acronym: 'UNOPS', type: 'un', category: 'Infrastructure', website: 'https://www.unops.org' },
    { name: 'UN Women', nameAr: 'هيئة الأمم المتحدة للمرأة', acronym: 'UN Women', type: 'un', category: 'Gender', website: 'https://arabstates.unwomen.org' },
    { name: 'International Labour Organization', nameAr: 'منظمة العمل الدولية', acronym: 'ILO', type: 'un', category: 'Labor', website: 'https://www.ilo.org' },
  ];
  
  for (const org of unOrgs) {
    await conn.execute(
      `INSERT IGNORE INTO organizations (name, nameAr, acronym, type, category, website, yemenPresence, isActive) 
       VALUES (?, ?, ?, ?, ?, ?, 'national', true)`,
      [org.name, org.nameAr, org.acronym, org.type, org.category, org.website]
    );
  }
  console.log(`    ✅ Seeded ${unOrgs.length} UN organizations`);
  
  // Seed INGOs
  console.log('  📗 Seeding INGOs...');
  const ingos = [
    { name: 'International Committee of the Red Cross', nameAr: 'اللجنة الدولية للصليب الأحمر', acronym: 'ICRC', category: 'Protection', website: 'https://www.icrc.org' },
    { name: 'Médecins Sans Frontières', nameAr: 'أطباء بلا حدود', acronym: 'MSF', category: 'Health', website: 'https://www.msf.org' },
    { name: 'Save the Children', nameAr: 'إنقاذ الطفولة', acronym: 'SC', category: 'Child Protection', website: 'https://www.savethechildren.org' },
    { name: 'CARE International', nameAr: 'كير الدولية', acronym: 'CARE', category: 'Food Security', website: 'https://www.care.org' },
    { name: 'Oxfam', nameAr: 'أوكسفام', acronym: 'Oxfam', category: 'Livelihoods', website: 'https://www.oxfam.org' },
    { name: 'Norwegian Refugee Council', nameAr: 'المجلس النرويجي للاجئين', acronym: 'NRC', category: 'Protection', website: 'https://www.nrc.no' },
    { name: 'International Rescue Committee', nameAr: 'لجنة الإنقاذ الدولية', acronym: 'IRC', category: 'Health', website: 'https://www.rescue.org' },
    { name: 'Action Against Hunger', nameAr: 'العمل ضد الجوع', acronym: 'ACF', category: 'Nutrition', website: 'https://www.actionagainsthunger.org' },
    { name: 'Mercy Corps', nameAr: 'ميرسي كور', acronym: 'MC', category: 'Livelihoods', website: 'https://www.mercycorps.org' },
    { name: 'Danish Refugee Council', nameAr: 'المجلس الدنماركي للاجئين', acronym: 'DRC', category: 'Protection', website: 'https://drc.ngo' },
    { name: 'Islamic Relief', nameAr: 'الإغاثة الإسلامية', acronym: 'IR', category: 'Multi-sector', website: 'https://www.islamic-relief.org' },
    { name: 'World Vision', nameAr: 'الرؤية العالمية', acronym: 'WV', category: 'Child-focused', website: 'https://www.worldvision.org' },
  ];
  
  for (const org of ingos) {
    await conn.execute(
      `INSERT IGNORE INTO organizations (name, nameAr, acronym, type, category, website, yemenPresence, isActive) 
       VALUES (?, ?, ?, 'ingo', ?, ?, 'national', true)`,
      [org.name, org.nameAr, org.acronym, org.category, org.website]
    );
  }
  console.log(`    ✅ Seeded ${ingos.length} INGOs`);
  
  // Seed Donors
  console.log('  💰 Seeding donors...');
  const donors = [
    { name: 'World Bank', nameAr: 'البنك الدولي', acronym: 'WB', country: 'International', website: 'https://www.worldbank.org/en/country/yemen' },
    { name: 'International Monetary Fund', nameAr: 'صندوق النقد الدولي', acronym: 'IMF', country: 'International', website: 'https://www.imf.org/en/Countries/YEM' },
    { name: 'Islamic Development Bank', nameAr: 'البنك الإسلامي للتنمية', acronym: 'IsDB', country: 'Saudi Arabia', website: 'https://www.isdb.org' },
    { name: 'USAID', nameAr: 'الوكالة الأمريكية للتنمية الدولية', acronym: 'USAID', country: 'United States', website: 'https://www.usaid.gov/yemen' },
    { name: 'UK Foreign, Commonwealth & Development Office', nameAr: 'مكتب الخارجية والتنمية البريطاني', acronym: 'FCDO', country: 'United Kingdom', website: 'https://www.gov.uk/world/yemen' },
    { name: 'German Agency for International Cooperation', nameAr: 'الوكالة الألمانية للتعاون الدولي', acronym: 'GIZ', country: 'Germany', website: 'https://www.giz.de' },
    { name: 'European Union', nameAr: 'الاتحاد الأوروبي', acronym: 'EU', country: 'Europe', website: 'https://ec.europa.eu' },
    { name: 'King Salman Humanitarian Aid and Relief Centre', nameAr: 'مركز الملك سلمان للإغاثة والأعمال الإنسانية', acronym: 'KSrelief', country: 'Saudi Arabia', website: 'https://www.ksrelief.org' },
    { name: 'Saudi Development and Reconstruction Program for Yemen', nameAr: 'البرنامج السعودي لتنمية وإعمار اليمن', acronym: 'SDRPY', country: 'Saudi Arabia', website: 'https://www.sdrpy.gov.sa' },
    { name: 'UAE Aid', nameAr: 'المساعدات الإماراتية', acronym: 'UAE Aid', country: 'UAE', website: 'https://www.uaeaid.ae' },
    { name: 'Japan International Cooperation Agency', nameAr: 'الوكالة اليابانية للتعاون الدولي', acronym: 'JICA', country: 'Japan', website: 'https://www.jica.go.jp' },
    { name: 'Kuwait Fund for Arab Economic Development', nameAr: 'الصندوق الكويتي للتنمية الاقتصادية العربية', acronym: 'KFAED', country: 'Kuwait', website: 'https://www.kuwait-fund.org' },
  ];
  
  for (const org of donors) {
    await conn.execute(
      `INSERT IGNORE INTO organizations (name, nameAr, acronym, type, category, country, website, yemenPresence, isActive) 
       VALUES (?, ?, ?, 'donor', 'Development Finance', ?, ?, 'national', true)`,
      [org.name, org.nameAr, org.acronym, org.country, org.website]
    );
  }
  console.log(`    ✅ Seeded ${donors.length} donors`);
  
  // Seed Research/Think Tanks
  console.log('  🔬 Seeding research organizations...');
  const research = [
    { name: 'Sana\'a Center for Strategic Studies', nameAr: 'مركز صنعاء للدراسات الاستراتيجية', acronym: 'SCSS', website: 'https://sanaacenter.org' },
    { name: 'Yemen Policy Center', nameAr: 'مركز اليمن للسياسات', acronym: 'YPC', website: 'https://www.yemenpolicy.org' },
    { name: 'Studies and Economic Media Center', nameAr: 'مركز الدراسات والإعلام الاقتصادي', acronym: 'SEMC', website: 'https://economicmedia.net' },
    { name: 'Abaad Studies & Research Center', nameAr: 'مركز أبعاد للدراسات والبحوث', acronym: 'Abaad', website: 'https://abaadstudies.org' },
    { name: 'DeepRoot Consulting', nameAr: 'ديب روت للاستشارات', acronym: 'DeepRoot', website: 'https://www.deeproot.consulting' },
    { name: 'Chatham House', nameAr: 'تشاتام هاوس', acronym: 'CH', website: 'https://www.chathamhouse.org' },
    { name: 'International Crisis Group', nameAr: 'مجموعة الأزمات الدولية', acronym: 'ICG', website: 'https://www.crisisgroup.org' },
    { name: 'Carnegie Middle East Center', nameAr: 'مركز كارنيغي للشرق الأوسط', acronym: 'Carnegie', website: 'https://carnegie-mec.org' },
    { name: 'Middle East Institute', nameAr: 'معهد الشرق الأوسط', acronym: 'MEI', website: 'https://www.mei.edu' },
    { name: 'Brookings Institution', nameAr: 'معهد بروكينغز', acronym: 'Brookings', website: 'https://www.brookings.edu' },
  ];
  
  for (const org of research) {
    await conn.execute(
      `INSERT IGNORE INTO organizations (name, nameAr, acronym, type, category, website, yemenPresence, isActive) 
       VALUES (?, ?, ?, 'research', 'Policy Research', ?, 'regional', true)`,
      [org.name, org.nameAr, org.acronym, org.website]
    );
  }
  console.log(`    ✅ Seeded ${research.length} research organizations`);
  
  // Seed Commercial Entities - Banks
  console.log('  🏦 Seeding commercial banks...');
  const banks = [
    { name: 'Yemen Bank for Reconstruction and Development', nameAr: 'بنك اليمن للإنشاء والتعمير', type: 'bank', jurisdiction: 'both', status: 'operational' },
    { name: 'National Bank of Yemen', nameAr: 'البنك الأهلي اليمني', type: 'bank', jurisdiction: 'aden', status: 'operational' },
    { name: 'Yemen Kuwait Bank', nameAr: 'بنك اليمن والكويت', type: 'bank', jurisdiction: 'both', status: 'operational' },
    { name: 'International Bank of Yemen', nameAr: 'البنك الدولي اليمني', type: 'bank', jurisdiction: 'both', status: 'operational' },
    { name: 'Cooperative and Agricultural Credit Bank', nameAr: 'البنك التعاوني الزراعي', type: 'bank', jurisdiction: 'both', status: 'operational' },
    { name: 'Housing Credit Bank', nameAr: 'بنك التسليف للإسكان', type: 'bank', jurisdiction: 'both', status: 'operational' },
    { name: 'Yemen Commercial Bank', nameAr: 'البنك التجاري اليمني', type: 'bank', jurisdiction: 'both', status: 'operational' },
    { name: 'Saba Islamic Bank', nameAr: 'بنك سبأ الإسلامي', type: 'bank', jurisdiction: 'both', status: 'operational' },
    { name: 'Shamil Bank of Yemen', nameAr: 'بنك شامل اليمن', type: 'bank', jurisdiction: 'both', status: 'operational' },
    { name: 'Tadhamon International Islamic Bank', nameAr: 'بنك التضامن الإسلامي الدولي', type: 'bank', jurisdiction: 'both', status: 'operational' },
    { name: 'Al-Kuraimi Islamic Microfinance Bank', nameAr: 'بنك الكريمي الإسلامي للتمويل الأصغر', type: 'bank', jurisdiction: 'both', status: 'operational' },
    { name: 'CAC Bank', nameAr: 'بنك كاك', type: 'bank', jurisdiction: 'aden', status: 'operational' },
    { name: 'Al-Amal Microfinance Bank', nameAr: 'بنك الأمل للتمويل الأصغر', type: 'bank', jurisdiction: 'both', status: 'operational' },
  ];
  
  for (const entity of banks) {
    await conn.execute(
      `INSERT IGNORE INTO commercial_entities (name, nameAr, type, sector, jurisdiction, status) 
       VALUES (?, ?, ?, 'Banking', ?, ?)`,
      [entity.name, entity.nameAr, entity.type, entity.jurisdiction, entity.status]
    );
  }
  console.log(`    ✅ Seeded ${banks.length} banks`);
  
  // Seed Commercial Entities - Money Exchangers
  console.log('  💱 Seeding money exchangers...');
  const exchangers = [
    { name: 'Al-Kuraimi Exchange', nameAr: 'صرافة الكريمي', jurisdiction: 'both' },
    { name: 'Al-Amoudi Exchange', nameAr: 'صرافة العمودي', jurisdiction: 'aden' },
    { name: 'Al-Nashiri Exchange', nameAr: 'صرافة النشيري', jurisdiction: 'sanaa' },
    { name: 'Al-Zubairi Exchange', nameAr: 'صرافة الزبيري', jurisdiction: 'sanaa' },
    { name: 'Al-Rowaishan Exchange', nameAr: 'صرافة الرويشان', jurisdiction: 'sanaa' },
    { name: 'Al-Saeedi Exchange', nameAr: 'صرافة السعيدي', jurisdiction: 'both' },
    { name: 'Al-Mutawakkil Exchange', nameAr: 'صرافة المتوكل', jurisdiction: 'sanaa' },
    { name: 'Yemen Exchange', nameAr: 'صرافة اليمن', jurisdiction: 'both' },
    { name: 'Al-Jabali Exchange', nameAr: 'صرافة الجبلي', jurisdiction: 'sanaa' },
    { name: 'Al-Hamdi Exchange', nameAr: 'صرافة الحمدي', jurisdiction: 'both' },
  ];
  
  for (const entity of exchangers) {
    await conn.execute(
      `INSERT IGNORE INTO commercial_entities (name, nameAr, type, sector, jurisdiction, status) 
       VALUES (?, ?, 'exchange', 'Financial Services', ?, 'operational')`,
      [entity.name, entity.nameAr, entity.jurisdiction]
    );
  }
  console.log(`    ✅ Seeded ${exchangers.length} money exchangers`);
  
  // Seed Commercial Entities - Telecom
  console.log('  📱 Seeding telecom companies...');
  const telecoms = [
    { name: 'Yemen Mobile (Sabafon)', nameAr: 'يمن موبايل (سبأفون)', jurisdiction: 'both' },
    { name: 'MTN Yemen', nameAr: 'إم تي إن اليمن', jurisdiction: 'both' },
    { name: 'Y Telecom', nameAr: 'واي تيليكوم', jurisdiction: 'both' },
    { name: 'TeleYemen', nameAr: 'تيليمن', jurisdiction: 'both' },
    { name: 'Aden Net', nameAr: 'عدن نت', jurisdiction: 'aden' },
    { name: 'Yemen Net', nameAr: 'يمن نت', jurisdiction: 'both' },
  ];
  
  for (const entity of telecoms) {
    await conn.execute(
      `INSERT IGNORE INTO commercial_entities (name, nameAr, type, sector, jurisdiction, status) 
       VALUES (?, ?, 'telecom', 'Telecommunications', ?, 'operational')`,
      [entity.name, entity.nameAr, entity.jurisdiction]
    );
  }
  console.log(`    ✅ Seeded ${telecoms.length} telecom companies`);
  
  // Seed Commercial Entities - Oil & Gas
  console.log('  🛢️ Seeding oil & gas companies...');
  const oilGas = [
    { name: 'Yemen LNG', nameAr: 'يمن إل إن جي', status: 'suspended' },
    { name: 'PetroMasila', nameAr: 'بترومسيلة', status: 'operational' },
    { name: 'Safer Exploration', nameAr: 'صافر للاستكشاف', status: 'operational' },
    { name: 'Yemen Oil & Gas Corporation', nameAr: 'شركة النفط والغاز اليمنية', status: 'operational' },
    { name: 'OMV Yemen', nameAr: 'أو إم في اليمن', status: 'limited' },
    { name: 'Total Yemen', nameAr: 'توتال اليمن', status: 'limited' },
    { name: 'DNO Yemen', nameAr: 'دي إن أو اليمن', status: 'operational' },
    { name: 'Aden Refinery Company', nameAr: 'شركة مصافي عدن', status: 'operational' },
    { name: 'Marib Refinery', nameAr: 'مصفاة مأرب', status: 'operational' },
  ];
  
  for (const entity of oilGas) {
    await conn.execute(
      `INSERT IGNORE INTO commercial_entities (name, nameAr, type, sector, jurisdiction, status) 
       VALUES (?, ?, 'oil_gas', 'Oil & Gas', 'both', ?)`,
      [entity.name, entity.nameAr, entity.status]
    );
  }
  console.log(`    ✅ Seeded ${oilGas.length} oil & gas companies`);
  
  // Seed Commercial Entities - Ports
  console.log('  ⚓ Seeding ports...');
  const ports = [
    { name: 'Aden Container Terminal', nameAr: 'محطة حاويات عدن', jurisdiction: 'aden', status: 'operational' },
    { name: 'Hodeidah Port', nameAr: 'ميناء الحديدة', jurisdiction: 'sanaa', status: 'operational' },
    { name: 'Mukalla Port', nameAr: 'ميناء المكلا', jurisdiction: 'aden', status: 'operational' },
    { name: 'Saleef Port', nameAr: 'ميناء الصليف', jurisdiction: 'sanaa', status: 'operational' },
    { name: 'Ras Isa Oil Terminal', nameAr: 'محطة رأس عيسى النفطية', jurisdiction: 'sanaa', status: 'limited' },
    { name: 'Balhaf LNG Terminal', nameAr: 'محطة بلحاف للغاز المسال', jurisdiction: 'aden', status: 'suspended' },
  ];
  
  for (const entity of ports) {
    await conn.execute(
      `INSERT IGNORE INTO commercial_entities (name, nameAr, type, sector, jurisdiction, status) 
       VALUES (?, ?, 'port', 'Ports & Logistics', ?, ?)`,
      [entity.name, entity.nameAr, entity.jurisdiction, entity.status]
    );
  }
  console.log(`    ✅ Seeded ${ports.length} ports`);
  
  // Seed Media Organizations
  console.log('  📰 Seeding media organizations...');
  const media = [
    { name: 'Al Jazeera', nameAr: 'الجزيرة', country: 'Qatar', website: 'https://www.aljazeera.net' },
    { name: 'Al Arabiya', nameAr: 'العربية', country: 'UAE', website: 'https://www.alarabiya.net' },
    { name: 'BBC Arabic', nameAr: 'بي بي سي عربي', country: 'UK', website: 'https://www.bbc.com/arabic' },
    { name: 'Reuters', nameAr: 'رويترز', country: 'UK', website: 'https://www.reuters.com' },
    { name: 'Al-Masirah', nameAr: 'المسيرة', country: 'Yemen', website: 'https://www.almasirah.net' },
    { name: 'Saba News Agency', nameAr: 'وكالة سبأ للأنباء', country: 'Yemen', website: 'https://www.saba.ye' },
    { name: 'Belqees TV', nameAr: 'قناة بلقيس', country: 'Yemen', website: 'https://www.belqees.net' },
    { name: 'South24', nameAr: 'جنوب24', country: 'Yemen', website: 'https://south24.net' },
    { name: 'Aden Al-Ghad', nameAr: 'عدن الغد', country: 'Yemen', website: 'https://adengd.net' },
    { name: 'Al-Masdar Online', nameAr: 'المصدر أونلاين', country: 'Yemen', website: 'https://almasdaronline.com' },
  ];
  
  for (const org of media) {
    await conn.execute(
      `INSERT IGNORE INTO organizations (name, nameAr, type, category, country, website, yemenPresence, isActive) 
       VALUES (?, ?, 'media', 'News', ?, ?, 'national', true)`,
      [org.name, org.nameAr, org.country, org.website]
    );
  }
  console.log(`    ✅ Seeded ${media.length} media organizations`);
  
  await conn.end();
  
  console.log('✅ Comprehensive entity seed completed!');
  console.log('Summary:');
  console.log(`  - UN organizations: ${unOrgs.length}`);
  console.log(`  - INGOs: ${ingos.length}`);
  console.log(`  - Donors: ${donors.length}`);
  console.log(`  - Research organizations: ${research.length}`);
  console.log(`  - Banks: ${banks.length}`);
  console.log(`  - Money exchangers: ${exchangers.length}`);
  console.log(`  - Telecom companies: ${telecoms.length}`);
  console.log(`  - Oil & gas companies: ${oilGas.length}`);
  console.log(`  - Ports: ${ports.length}`);
  console.log(`  - Media organizations: ${media.length}`);
}

seedEntities().catch(console.error);
