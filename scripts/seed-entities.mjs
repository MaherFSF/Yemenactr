/**
 * YETO Platform - Comprehensive Entities Seed Script
 * Populates the entities table with all major economic actors in Yemen
 */

import mysql from 'mysql2/promise';

const entities = [
  // ============================================================================
  // CENTRAL BANKS
  // ============================================================================
  {
    entityType: 'central_bank',
    name: 'Central Bank of Yemen - Aden',
    nameAr: 'البنك المركزي اليمني - عدن',
    acronym: 'CBY-Aden',
    description: 'The internationally recognized Central Bank of Yemen, relocated to Aden in 2016 following the conflict. Manages monetary policy for IRG-controlled areas.',
    descriptionAr: 'البنك المركزي اليمني المعترف به دولياً، انتقل إلى عدن في 2016 بعد الصراع. يدير السياسة النقدية للمناطق الخاضعة للحكومة الشرعية.',
    regimeTag: 'aden_irg',
    headquarters: 'Aden, Yemen',
    website: 'https://cby-ye.com',
    status: 'active',
    establishedDate: new Date('1971-01-01'),
  },
  {
    entityType: 'central_bank',
    name: 'Central Bank of Yemen - Sanaa',
    nameAr: 'البنك المركزي اليمني - صنعاء',
    acronym: 'CBY-Sanaa',
    description: 'The de facto Central Bank operating in Houthi-controlled areas. Issues separate currency and manages monetary policy for northern Yemen.',
    descriptionAr: 'البنك المركزي الفعلي العامل في المناطق الخاضعة للحوثيين. يصدر عملة منفصلة ويدير السياسة النقدية لشمال اليمن.',
    regimeTag: 'sanaa_defacto',
    headquarters: 'Sanaa, Yemen',
    website: null,
    status: 'active',
    establishedDate: new Date('1971-01-01'),
  },

  // ============================================================================
  // GOVERNMENT MINISTRIES - IRG (Aden)
  // ============================================================================
  {
    entityType: 'government_ministry',
    name: 'Ministry of Finance - IRG',
    nameAr: 'وزارة المالية - الحكومة الشرعية',
    acronym: 'MoF-IRG',
    description: 'The internationally recognized Ministry of Finance, responsible for fiscal policy, budget, and public finance management.',
    descriptionAr: 'وزارة المالية المعترف بها دولياً، مسؤولة عن السياسة المالية والميزانية وإدارة المالية العامة.',
    regimeTag: 'aden_irg',
    headquarters: 'Aden, Yemen',
    status: 'active',
  },
  {
    entityType: 'government_ministry',
    name: 'Ministry of Planning and International Cooperation - IRG',
    nameAr: 'وزارة التخطيط والتعاون الدولي - الحكومة الشرعية',
    acronym: 'MoPIC-IRG',
    description: 'Coordinates development planning and international donor relations for the IRG government.',
    descriptionAr: 'تنسق التخطيط التنموي والعلاقات مع المانحين الدوليين للحكومة الشرعية.',
    regimeTag: 'aden_irg',
    headquarters: 'Aden, Yemen',
    status: 'active',
  },
  {
    entityType: 'government_ministry',
    name: 'Ministry of Oil and Minerals - IRG',
    nameAr: 'وزارة النفط والمعادن - الحكومة الشرعية',
    acronym: 'MoOM-IRG',
    description: 'Manages oil and gas sector, mineral resources, and energy policy for IRG-controlled areas.',
    descriptionAr: 'تدير قطاع النفط والغاز والموارد المعدنية وسياسة الطاقة للمناطق الخاضعة للحكومة الشرعية.',
    regimeTag: 'aden_irg',
    headquarters: 'Aden, Yemen',
    status: 'active',
  },
  {
    entityType: 'government_ministry',
    name: 'Ministry of Trade and Industry - IRG',
    nameAr: 'وزارة التجارة والصناعة - الحكومة الشرعية',
    acronym: 'MoTI-IRG',
    description: 'Oversees trade policy, industrial development, and commercial regulations.',
    descriptionAr: 'تشرف على السياسة التجارية والتنمية الصناعية واللوائح التجارية.',
    regimeTag: 'aden_irg',
    headquarters: 'Aden, Yemen',
    status: 'active',
  },

  // ============================================================================
  // GOVERNMENT AUTHORITIES
  // ============================================================================
  {
    entityType: 'customs_authority',
    name: 'Yemen Customs Authority - Aden',
    nameAr: 'مصلحة الجمارك اليمنية - عدن',
    acronym: 'YCA-Aden',
    description: 'Manages customs operations at IRG-controlled ports including Aden and Mukalla.',
    descriptionAr: 'تدير العمليات الجمركية في الموانئ الخاضعة للحكومة الشرعية بما في ذلك عدن والمكلا.',
    regimeTag: 'aden_irg',
    headquarters: 'Aden, Yemen',
    status: 'active',
  },
  {
    entityType: 'customs_authority',
    name: 'Yemen Customs Authority - Sanaa',
    nameAr: 'مصلحة الجمارك اليمنية - صنعاء',
    acronym: 'YCA-Sanaa',
    description: 'Manages customs operations at Houthi-controlled ports including Hodeidah.',
    descriptionAr: 'تدير العمليات الجمركية في الموانئ الخاضعة للحوثيين بما في ذلك الحديدة.',
    regimeTag: 'sanaa_defacto',
    headquarters: 'Sanaa, Yemen',
    status: 'active',
  },
  {
    entityType: 'tax_authority',
    name: 'Tax Authority - IRG',
    nameAr: 'مصلحة الضرائب - الحكومة الشرعية',
    acronym: 'TA-IRG',
    description: 'Collects taxes and manages revenue in IRG-controlled areas.',
    descriptionAr: 'تجمع الضرائب وتدير الإيرادات في المناطق الخاضعة للحكومة الشرعية.',
    regimeTag: 'aden_irg',
    headquarters: 'Aden, Yemen',
    status: 'active',
  },

  // ============================================================================
  // COMMERCIAL BANKS - Major Yemeni Banks
  // ============================================================================
  {
    entityType: 'commercial_bank',
    name: 'Yemen Bank for Reconstruction and Development',
    nameAr: 'البنك اليمني للإنشاء والتعمير',
    acronym: 'YBRD',
    description: 'One of the largest commercial banks in Yemen, established in 1962. Operates across both regime areas.',
    descriptionAr: 'أحد أكبر البنوك التجارية في اليمن، تأسس عام 1962. يعمل في مناطق كلا النظامين.',
    regimeTag: 'mixed',
    headquarters: 'Sanaa, Yemen',
    status: 'active',
    establishedDate: new Date('1962-01-01'),
  },
  {
    entityType: 'commercial_bank',
    name: 'National Bank of Yemen',
    nameAr: 'البنك الأهلي اليمني',
    acronym: 'NBY',
    description: 'Major state-owned commercial bank, originally the central bank of South Yemen before unification.',
    descriptionAr: 'بنك تجاري حكومي رئيسي، كان البنك المركزي لجنوب اليمن قبل الوحدة.',
    regimeTag: 'aden_irg',
    headquarters: 'Aden, Yemen',
    status: 'active',
    establishedDate: new Date('1970-01-01'),
  },
  {
    entityType: 'commercial_bank',
    name: 'Cooperative and Agricultural Credit Bank',
    nameAr: 'البنك التعاوني والزراعي',
    acronym: 'CAC Bank',
    description: 'Largest bank in Yemen by branch network, focused on agricultural and cooperative lending.',
    descriptionAr: 'أكبر بنك في اليمن من حيث شبكة الفروع، يركز على الإقراض الزراعي والتعاوني.',
    regimeTag: 'mixed',
    headquarters: 'Sanaa, Yemen',
    status: 'active',
    establishedDate: new Date('1982-01-01'),
  },
  {
    entityType: 'commercial_bank',
    name: 'International Bank of Yemen',
    nameAr: 'البنك الدولي اليمني',
    acronym: 'IBY',
    description: 'Private commercial bank offering retail and corporate banking services.',
    descriptionAr: 'بنك تجاري خاص يقدم خدمات مصرفية للأفراد والشركات.',
    regimeTag: 'mixed',
    headquarters: 'Sanaa, Yemen',
    status: 'active',
    establishedDate: new Date('1979-01-01'),
  },
  {
    entityType: 'commercial_bank',
    name: 'Yemen Commercial Bank',
    nameAr: 'البنك التجاري اليمني',
    acronym: 'YCB',
    description: 'One of the oldest private banks in Yemen, established in 1993.',
    descriptionAr: 'أحد أقدم البنوك الخاصة في اليمن، تأسس عام 1993.',
    regimeTag: 'mixed',
    headquarters: 'Sanaa, Yemen',
    status: 'active',
    establishedDate: new Date('1993-01-01'),
  },
  {
    entityType: 'commercial_bank',
    name: 'Shamil Bank of Yemen and Bahrain',
    nameAr: 'بنك شامل اليمن والبحرين',
    acronym: 'Shamil',
    description: 'Islamic bank offering Sharia-compliant banking services.',
    descriptionAr: 'بنك إسلامي يقدم خدمات مصرفية متوافقة مع الشريعة.',
    regimeTag: 'mixed',
    headquarters: 'Sanaa, Yemen',
    status: 'active',
    establishedDate: new Date('2002-01-01'),
  },
  {
    entityType: 'commercial_bank',
    name: 'Tadhamon International Islamic Bank',
    nameAr: 'بنك التضامن الإسلامي الدولي',
    acronym: 'TIIB',
    description: 'Major Islamic bank in Yemen offering Sharia-compliant products.',
    descriptionAr: 'بنك إسلامي رئيسي في اليمن يقدم منتجات متوافقة مع الشريعة.',
    regimeTag: 'mixed',
    headquarters: 'Sanaa, Yemen',
    status: 'active',
    establishedDate: new Date('1995-01-01'),
  },
  {
    entityType: 'commercial_bank',
    name: 'Saba Islamic Bank',
    nameAr: 'بنك سبأ الإسلامي',
    acronym: 'SIB',
    description: 'Islamic commercial bank providing Sharia-compliant financial services.',
    descriptionAr: 'بنك تجاري إسلامي يقدم خدمات مالية متوافقة مع الشريعة.',
    regimeTag: 'mixed',
    headquarters: 'Sanaa, Yemen',
    status: 'active',
    establishedDate: new Date('1996-01-01'),
  },

  // ============================================================================
  // MICROFINANCE INSTITUTIONS
  // ============================================================================
  {
    entityType: 'mfi',
    name: 'Al-Amal Microfinance Bank',
    nameAr: 'بنك الأمل للتمويل الأصغر',
    acronym: 'Al-Amal',
    description: 'Leading microfinance institution in Yemen, providing small loans to entrepreneurs and SMEs.',
    descriptionAr: 'مؤسسة تمويل أصغر رائدة في اليمن، تقدم قروضاً صغيرة لرواد الأعمال والمنشآت الصغيرة.',
    regimeTag: 'mixed',
    headquarters: 'Sanaa, Yemen',
    status: 'active',
    establishedDate: new Date('2009-01-01'),
  },
  {
    entityType: 'mfi',
    name: 'Small and Micro Enterprise Promotion Service',
    nameAr: 'خدمة تنمية المنشآت الصغيرة والأصغر',
    acronym: 'SMEPS',
    description: 'Provides business development services and microfinance to small enterprises.',
    descriptionAr: 'تقدم خدمات تطوير الأعمال والتمويل الأصغر للمنشآت الصغيرة.',
    regimeTag: 'mixed',
    headquarters: 'Sanaa, Yemen',
    status: 'active',
  },

  // ============================================================================
  // EXCHANGE COMPANIES
  // ============================================================================
  {
    entityType: 'exchange_company',
    name: 'Al-Kuraimi Islamic Microfinance Bank',
    nameAr: 'بنك الكريمي الإسلامي للتمويل الأصغر',
    acronym: 'Al-Kuraimi',
    description: 'Major money transfer and microfinance institution with extensive branch network.',
    descriptionAr: 'مؤسسة رئيسية للتحويلات المالية والتمويل الأصغر مع شبكة فروع واسعة.',
    regimeTag: 'mixed',
    headquarters: 'Sanaa, Yemen',
    status: 'active',
    establishedDate: new Date('2010-01-01'),
  },

  // ============================================================================
  // UN AGENCIES
  // ============================================================================
  {
    entityType: 'un_agency',
    name: 'United Nations Office for the Coordination of Humanitarian Affairs',
    nameAr: 'مكتب الأمم المتحدة لتنسيق الشؤون الإنسانية',
    acronym: 'OCHA',
    description: 'Coordinates humanitarian response in Yemen, manages the Yemen Humanitarian Response Plan.',
    descriptionAr: 'ينسق الاستجابة الإنسانية في اليمن، يدير خطة الاستجابة الإنسانية لليمن.',
    regimeTag: 'neutral',
    headquarters: 'Sanaa, Yemen',
    website: 'https://www.unocha.org/yemen',
    status: 'active',
  },
  {
    entityType: 'un_agency',
    name: 'World Food Programme',
    nameAr: 'برنامج الأغذية العالمي',
    acronym: 'WFP',
    description: 'Provides food assistance to millions of Yemenis, largest humanitarian operation in Yemen.',
    descriptionAr: 'يقدم المساعدات الغذائية لملايين اليمنيين، أكبر عملية إنسانية في اليمن.',
    regimeTag: 'neutral',
    headquarters: 'Sanaa, Yemen',
    website: 'https://www.wfp.org/countries/yemen',
    status: 'active',
  },
  {
    entityType: 'un_agency',
    name: 'United Nations Development Programme',
    nameAr: 'برنامج الأمم المتحدة الإنمائي',
    acronym: 'UNDP',
    description: 'Supports development and resilience programs in Yemen.',
    descriptionAr: 'يدعم برامج التنمية والصمود في اليمن.',
    regimeTag: 'neutral',
    headquarters: 'Sanaa, Yemen',
    website: 'https://www.ye.undp.org',
    status: 'active',
  },
  {
    entityType: 'un_agency',
    name: 'United Nations Children\'s Fund',
    nameAr: 'منظمة الأمم المتحدة للطفولة',
    acronym: 'UNICEF',
    description: 'Provides humanitarian assistance for children in Yemen including health, nutrition, and education.',
    descriptionAr: 'تقدم المساعدات الإنسانية للأطفال في اليمن بما في ذلك الصحة والتغذية والتعليم.',
    regimeTag: 'neutral',
    headquarters: 'Sanaa, Yemen',
    website: 'https://www.unicef.org/yemen',
    status: 'active',
  },
  {
    entityType: 'un_agency',
    name: 'World Health Organization',
    nameAr: 'منظمة الصحة العالمية',
    acronym: 'WHO',
    description: 'Coordinates health response and disease surveillance in Yemen.',
    descriptionAr: 'تنسق الاستجابة الصحية ومراقبة الأمراض في اليمن.',
    regimeTag: 'neutral',
    headquarters: 'Sanaa, Yemen',
    website: 'https://www.emro.who.int/yemen',
    status: 'active',
  },
  {
    entityType: 'un_agency',
    name: 'Food and Agriculture Organization',
    nameAr: 'منظمة الأغذية والزراعة',
    acronym: 'FAO',
    description: 'Supports agricultural livelihoods and food security in Yemen.',
    descriptionAr: 'تدعم سبل العيش الزراعية والأمن الغذائي في اليمن.',
    regimeTag: 'neutral',
    headquarters: 'Sanaa, Yemen',
    website: 'https://www.fao.org/yemen',
    status: 'active',
  },
  {
    entityType: 'un_agency',
    name: 'International Organization for Migration',
    nameAr: 'المنظمة الدولية للهجرة',
    acronym: 'IOM',
    description: 'Provides assistance to migrants and internally displaced persons in Yemen.',
    descriptionAr: 'تقدم المساعدة للمهاجرين والنازحين داخلياً في اليمن.',
    regimeTag: 'neutral',
    headquarters: 'Sanaa, Yemen',
    website: 'https://www.iom.int/countries/yemen',
    status: 'active',
  },
  {
    entityType: 'un_agency',
    name: 'United Nations High Commissioner for Refugees',
    nameAr: 'المفوضية السامية للأمم المتحدة لشؤون اللاجئين',
    acronym: 'UNHCR',
    description: 'Protects refugees and internally displaced persons in Yemen.',
    descriptionAr: 'تحمي اللاجئين والنازحين داخلياً في اليمن.',
    regimeTag: 'neutral',
    headquarters: 'Sanaa, Yemen',
    website: 'https://www.unhcr.org/yemen',
    status: 'active',
  },

  // ============================================================================
  // INTERNATIONAL ORGANIZATIONS
  // ============================================================================
  {
    entityType: 'donor',
    name: 'World Bank',
    nameAr: 'البنك الدولي',
    acronym: 'WB',
    description: 'Major development finance institution providing data and analysis on Yemen\'s economy.',
    descriptionAr: 'مؤسسة تمويل تنموي رئيسية تقدم البيانات والتحليلات حول اقتصاد اليمن.',
    regimeTag: 'neutral',
    headquarters: 'Washington, DC, USA',
    website: 'https://www.worldbank.org/en/country/yemen',
    status: 'active',
  },
  {
    entityType: 'donor',
    name: 'International Monetary Fund',
    nameAr: 'صندوق النقد الدولي',
    acronym: 'IMF',
    description: 'Provides macroeconomic analysis and technical assistance to Yemen.',
    descriptionAr: 'يقدم التحليل الاقتصادي الكلي والمساعدة الفنية لليمن.',
    regimeTag: 'neutral',
    headquarters: 'Washington, DC, USA',
    website: 'https://www.imf.org/en/Countries/YEM',
    status: 'active',
  },
  {
    entityType: 'donor',
    name: 'Saudi Development and Reconstruction Program for Yemen',
    nameAr: 'البرنامج السعودي لتنمية وإعمار اليمن',
    acronym: 'SDRPY',
    description: 'Saudi-funded program for development and reconstruction projects in Yemen.',
    descriptionAr: 'برنامج سعودي لمشاريع التنمية والإعمار في اليمن.',
    regimeTag: 'aden_irg',
    headquarters: 'Riyadh, Saudi Arabia',
    website: 'https://www.sdrpy.gov.sa',
    status: 'active',
  },
  {
    entityType: 'donor',
    name: 'United States Agency for International Development',
    nameAr: 'الوكالة الأمريكية للتنمية الدولية',
    acronym: 'USAID',
    description: 'Major donor providing humanitarian and development assistance to Yemen.',
    descriptionAr: 'مانح رئيسي يقدم المساعدات الإنسانية والتنموية لليمن.',
    regimeTag: 'neutral',
    headquarters: 'Washington, DC, USA',
    website: 'https://www.usaid.gov/yemen',
    status: 'active',
  },
  {
    entityType: 'donor',
    name: 'European Union',
    nameAr: 'الاتحاد الأوروبي',
    acronym: 'EU',
    description: 'Major donor providing humanitarian assistance and development support to Yemen.',
    descriptionAr: 'مانح رئيسي يقدم المساعدات الإنسانية ودعم التنمية لليمن.',
    regimeTag: 'neutral',
    headquarters: 'Brussels, Belgium',
    website: 'https://ec.europa.eu/echo/where/middle-east/yemen_en',
    status: 'active',
  },
  {
    entityType: 'donor',
    name: 'United Kingdom Foreign, Commonwealth & Development Office',
    nameAr: 'مكتب الخارجية والكومنولث والتنمية البريطاني',
    acronym: 'FCDO',
    description: 'UK government department providing aid and diplomatic support to Yemen.',
    descriptionAr: 'دائرة حكومية بريطانية تقدم المساعدات والدعم الدبلوماسي لليمن.',
    regimeTag: 'neutral',
    headquarters: 'London, UK',
    website: 'https://www.gov.uk/world/yemen',
    status: 'active',
  },
  {
    entityType: 'donor',
    name: 'Kuwait Fund for Arab Economic Development',
    nameAr: 'الصندوق الكويتي للتنمية الاقتصادية العربية',
    acronym: 'KFAED',
    description: 'Kuwaiti development fund providing loans and grants for Yemen projects.',
    descriptionAr: 'صندوق تنمية كويتي يقدم قروضاً ومنحاً لمشاريع اليمن.',
    regimeTag: 'neutral',
    headquarters: 'Kuwait City, Kuwait',
    website: 'https://www.kuwait-fund.org',
    status: 'active',
  },

  // ============================================================================
  // INTERNATIONAL NGOs
  // ============================================================================
  {
    entityType: 'ingo',
    name: 'International Committee of the Red Cross',
    nameAr: 'اللجنة الدولية للصليب الأحمر',
    acronym: 'ICRC',
    description: 'Provides humanitarian protection and assistance in Yemen conflict zones.',
    descriptionAr: 'تقدم الحماية والمساعدة الإنسانية في مناطق الصراع اليمنية.',
    regimeTag: 'neutral',
    headquarters: 'Sanaa, Yemen',
    website: 'https://www.icrc.org/en/where-we-work/middle-east/yemen',
    status: 'active',
  },
  {
    entityType: 'ingo',
    name: 'Médecins Sans Frontières',
    nameAr: 'أطباء بلا حدود',
    acronym: 'MSF',
    description: 'Provides emergency medical care in Yemen, operates hospitals and clinics.',
    descriptionAr: 'تقدم الرعاية الطبية الطارئة في اليمن، تدير مستشفيات وعيادات.',
    regimeTag: 'neutral',
    headquarters: 'Sanaa, Yemen',
    website: 'https://www.msf.org/yemen',
    status: 'active',
  },
  {
    entityType: 'ingo',
    name: 'Save the Children',
    nameAr: 'منظمة إنقاذ الطفولة',
    acronym: 'SCI',
    description: 'Provides humanitarian assistance for children in Yemen.',
    descriptionAr: 'تقدم المساعدات الإنسانية للأطفال في اليمن.',
    regimeTag: 'neutral',
    headquarters: 'Sanaa, Yemen',
    website: 'https://www.savethechildren.org/us/where-we-work/yemen',
    status: 'active',
  },
  {
    entityType: 'ingo',
    name: 'CARE International',
    nameAr: 'منظمة كير الدولية',
    acronym: 'CARE',
    description: 'Provides humanitarian assistance including food, water, and livelihoods support.',
    descriptionAr: 'تقدم المساعدات الإنسانية بما في ذلك الغذاء والمياه ودعم سبل العيش.',
    regimeTag: 'neutral',
    headquarters: 'Sanaa, Yemen',
    website: 'https://www.care.org/our-work/where-we-work/yemen',
    status: 'active',
  },
  {
    entityType: 'ingo',
    name: 'Oxfam',
    nameAr: 'أوكسفام',
    acronym: 'Oxfam',
    description: 'Provides water, sanitation, and livelihood support in Yemen.',
    descriptionAr: 'تقدم دعم المياه والصرف الصحي وسبل العيش في اليمن.',
    regimeTag: 'neutral',
    headquarters: 'Sanaa, Yemen',
    website: 'https://www.oxfam.org/en/what-we-do/countries/yemen',
    status: 'active',
  },
  {
    entityType: 'ingo',
    name: 'Norwegian Refugee Council',
    nameAr: 'المجلس النرويجي للاجئين',
    acronym: 'NRC',
    description: 'Provides protection and assistance to displaced persons in Yemen.',
    descriptionAr: 'تقدم الحماية والمساعدة للنازحين في اليمن.',
    regimeTag: 'neutral',
    headquarters: 'Sanaa, Yemen',
    website: 'https://www.nrc.no/countries/middle-east/yemen',
    status: 'active',
  },
  {
    entityType: 'ingo',
    name: 'Action Against Hunger',
    nameAr: 'العمل ضد الجوع',
    acronym: 'ACF',
    description: 'Provides nutrition and food security programs in Yemen.',
    descriptionAr: 'تقدم برامج التغذية والأمن الغذائي في اليمن.',
    regimeTag: 'neutral',
    headquarters: 'Sanaa, Yemen',
    website: 'https://www.actionagainsthunger.org/countries/middle-east/yemen',
    status: 'active',
  },

  // ============================================================================
  // MAJOR COMPANIES
  // ============================================================================
  {
    entityType: 'company',
    name: 'Yemen LNG Company',
    nameAr: 'شركة الغاز الطبيعي المسال اليمنية',
    acronym: 'YLNG',
    description: 'Operates the Balhaf LNG terminal, Yemen\'s largest industrial project (currently suspended).',
    descriptionAr: 'تشغل محطة بلحاف للغاز المسال، أكبر مشروع صناعي في اليمن (معلق حالياً).',
    regimeTag: 'aden_irg',
    headquarters: 'Balhaf, Shabwah, Yemen',
    status: 'inactive',
    establishedDate: new Date('2005-01-01'),
  },
  {
    entityType: 'company',
    name: 'Yemen Mobile',
    nameAr: 'يمن موبايل',
    acronym: 'YM',
    description: 'Major mobile telecommunications operator in Yemen.',
    descriptionAr: 'مشغل اتصالات متنقلة رئيسي في اليمن.',
    regimeTag: 'mixed',
    headquarters: 'Sanaa, Yemen',
    status: 'active',
  },
  {
    entityType: 'company',
    name: 'MTN Yemen',
    nameAr: 'إم تي إن اليمن',
    acronym: 'MTN',
    description: 'Mobile telecommunications operator, part of MTN Group.',
    descriptionAr: 'مشغل اتصالات متنقلة، جزء من مجموعة إم تي إن.',
    regimeTag: 'mixed',
    headquarters: 'Sanaa, Yemen',
    status: 'active',
  },
  {
    entityType: 'company',
    name: 'Safer Exploration and Production Operations Company',
    nameAr: 'شركة صافر للاستكشاف والإنتاج',
    acronym: 'SEPOC',
    description: 'State oil company managing oil production in Marib and other areas.',
    descriptionAr: 'شركة نفط حكومية تدير إنتاج النفط في مأرب ومناطق أخرى.',
    regimeTag: 'aden_irg',
    headquarters: 'Sanaa, Yemen',
    status: 'active',
  },
  {
    entityType: 'company',
    name: 'Aden Refinery Company',
    nameAr: 'شركة مصافي عدن',
    acronym: 'ARC',
    description: 'Operates the Aden oil refinery, one of the largest in the region.',
    descriptionAr: 'تشغل مصفاة عدن للنفط، إحدى أكبر المصافي في المنطقة.',
    regimeTag: 'aden_irg',
    headquarters: 'Aden, Yemen',
    status: 'active',
  },

  // ============================================================================
  // GOVERNORATES
  // ============================================================================
  {
    entityType: 'governorate',
    name: 'Aden Governorate',
    nameAr: 'محافظة عدن',
    description: 'Temporary capital of Yemen, major port city and economic hub.',
    descriptionAr: 'العاصمة المؤقتة لليمن، مدينة ميناء رئيسية ومركز اقتصادي.',
    regimeTag: 'aden_irg',
    status: 'active',
  },
  {
    entityType: 'governorate',
    name: 'Sanaa Governorate',
    nameAr: 'محافظة صنعاء',
    description: 'Includes the capital city Sanaa, under Houthi control since 2014.',
    descriptionAr: 'تشمل العاصمة صنعاء، تحت سيطرة الحوثيين منذ 2014.',
    regimeTag: 'sanaa_defacto',
    status: 'active',
  },
  {
    entityType: 'governorate',
    name: 'Marib Governorate',
    nameAr: 'محافظة مأرب',
    description: 'Major oil-producing region, key battleground in the conflict.',
    descriptionAr: 'منطقة رئيسية لإنتاج النفط، ساحة معركة رئيسية في الصراع.',
    regimeTag: 'aden_irg',
    status: 'active',
  },
  {
    entityType: 'governorate',
    name: 'Hadramaut Governorate',
    nameAr: 'محافظة حضرموت',
    description: 'Largest governorate by area, includes Mukalla port.',
    descriptionAr: 'أكبر محافظة من حيث المساحة، تشمل ميناء المكلا.',
    regimeTag: 'aden_irg',
    status: 'active',
  },
  {
    entityType: 'governorate',
    name: 'Hodeidah Governorate',
    nameAr: 'محافظة الحديدة',
    description: 'Major Red Sea port, critical for humanitarian imports.',
    descriptionAr: 'ميناء رئيسي على البحر الأحمر، حيوي للواردات الإنسانية.',
    regimeTag: 'sanaa_defacto',
    status: 'active',
  },
  {
    entityType: 'governorate',
    name: 'Taiz Governorate',
    nameAr: 'محافظة تعز',
    description: 'Third largest city, contested between rival forces.',
    descriptionAr: 'ثالث أكبر مدينة، متنازع عليها بين القوى المتنافسة.',
    regimeTag: 'mixed',
    status: 'active',
  },
  {
    entityType: 'governorate',
    name: 'Shabwah Governorate',
    nameAr: 'محافظة شبوة',
    description: 'Oil and gas producing region, includes Balhaf LNG terminal.',
    descriptionAr: 'منطقة منتجة للنفط والغاز، تشمل محطة بلحاف للغاز المسال.',
    regimeTag: 'aden_irg',
    status: 'active',
  },

  // ============================================================================
  // POLITICAL ENTITIES
  // ============================================================================
  {
    entityType: 'political_party',
    name: 'General People\'s Congress',
    nameAr: 'المؤتمر الشعبي العام',
    acronym: 'GPC',
    description: 'Largest political party in Yemen, founded by former President Saleh.',
    descriptionAr: 'أكبر حزب سياسي في اليمن، أسسه الرئيس السابق صالح.',
    regimeTag: 'mixed',
    status: 'active',
    establishedDate: new Date('1982-08-24'),
  },
  {
    entityType: 'political_party',
    name: 'Yemeni Socialist Party',
    nameAr: 'الحزب الاشتراكي اليمني',
    acronym: 'YSP',
    description: 'Former ruling party of South Yemen, now part of opposition.',
    descriptionAr: 'الحزب الحاكم السابق لجنوب اليمن، الآن جزء من المعارضة.',
    regimeTag: 'aden_irg',
    status: 'active',
    establishedDate: new Date('1978-10-11'),
  },
  {
    entityType: 'political_party',
    name: 'Islah Party',
    nameAr: 'حزب التجمع اليمني للإصلاح',
    acronym: 'Islah',
    description: 'Major Islamist political party, part of the IRG coalition.',
    descriptionAr: 'حزب سياسي إسلامي رئيسي، جزء من تحالف الحكومة الشرعية.',
    regimeTag: 'aden_irg',
    status: 'active',
    establishedDate: new Date('1990-09-13'),
  },
  {
    entityType: 'armed_group',
    name: 'Ansar Allah (Houthis)',
    nameAr: 'أنصار الله (الحوثيون)',
    acronym: 'Houthis',
    description: 'Armed movement controlling northern Yemen since 2014.',
    descriptionAr: 'حركة مسلحة تسيطر على شمال اليمن منذ 2014.',
    regimeTag: 'sanaa_defacto',
    status: 'active',
    establishedDate: new Date('2004-01-01'),
  },
  {
    entityType: 'armed_group',
    name: 'Southern Transitional Council',
    nameAr: 'المجلس الانتقالي الجنوبي',
    acronym: 'STC',
    description: 'Southern separatist movement, controls parts of southern Yemen.',
    descriptionAr: 'حركة انفصالية جنوبية، تسيطر على أجزاء من جنوب اليمن.',
    regimeTag: 'aden_irg',
    status: 'active',
    establishedDate: new Date('2017-05-11'),
  },
];

async function seedEntities() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('=== Seeding Entities Table ===\n');
  
  let inserted = 0;
  let skipped = 0;
  
  for (const entity of entities) {
    try {
      // Check if entity already exists
      const [existing] = await conn.query(
        'SELECT id FROM entities WHERE name = ? LIMIT 1',
        [entity.name]
      );
      
      if (existing.length > 0) {
        console.log(`Skipped (exists): ${entity.name}`);
        skipped++;
        continue;
      }
      
      // Insert entity
      await conn.query(
        `INSERT INTO entities (
          entityType, name, nameAr, acronym, description, descriptionAr,
          regimeTag, headquarters, website, status, establishedDate
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          entity.entityType,
          entity.name,
          entity.nameAr || null,
          entity.acronym || null,
          entity.description || null,
          entity.descriptionAr || null,
          entity.regimeTag || 'unknown',
          entity.headquarters || null,
          entity.website || null,
          entity.status || 'active',
          entity.establishedDate || null
        ]
      );
      
      console.log(`Inserted: ${entity.name}`);
      inserted++;
    } catch (error) {
      console.error(`Error inserting ${entity.name}:`, error.message);
    }
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`Inserted: ${inserted}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Total entities: ${entities.length}`);
  
  // Get final count
  const [count] = await conn.query('SELECT COUNT(*) as cnt FROM entities');
  console.log(`\nEntities in database: ${count[0].cnt}`);
  
  await conn.end();
}

seedEntities().catch(console.error);
