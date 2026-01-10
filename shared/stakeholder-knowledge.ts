/**
 * YETO Stakeholder Knowledge Base
 * Comprehensive data about Yemen's economic stakeholders, institutions, and history
 * Used by AI Assistant for accurate, contextual responses
 * 
 * LAST UPDATED: January 10, 2026
 */

export const CURRENT_DATE = "January 10, 2026";

export const YEMEN_ECONOMIC_TIMELINE = {
  preConflict: {
    period: "2010-2014",
    description: "Pre-conflict period with unified central bank and government",
    keyEvents: [
      { year: 2010, event: "Yemen's economy growing at 7.7% GDP growth, oil production at 260,000 bpd" },
      { year: 2011, event: "Arab Spring protests begin in Yemen, GDP contracts 12.7%" },
      { year: 2012, event: "President Saleh transfers power to Hadi through GCC initiative" },
      { year: 2013, event: "National Dialogue Conference begins" },
      { year: 2014, month: "September", event: "Houthi forces capture Sana'a" },
    ],
    economicContext: "GDP growth averaged 2-4%, inflation moderate at 10-12%, unified exchange rate around 215 YER/USD"
  },
  conflictOnset: {
    period: "2015-2016",
    description: "Saudi-led coalition intervention, economic fragmentation begins",
    keyEvents: [
      { year: 2015, month: "March", event: "Saudi-led coalition begins military intervention (Operation Decisive Storm)" },
      { year: 2015, month: "September", event: "Government relocates to Aden" },
      { year: 2015, event: "GDP contracted by 28%, worst single-year decline" },
      { year: 2016, month: "September", event: "Central Bank headquarters moved from Sana'a to Aden" },
      { year: 2016, event: "Saudi Arabia deposits $2 billion in CBY Aden" },
    ],
    economicContext: "GDP contracted by 28% in 2015, currency began diverging between zones"
  },
  dualAuthority: {
    period: "2017-2019",
    description: "Parallel governance structures solidify, dual currency zones emerge",
    keyEvents: [
      { year: 2017, event: "CBY Aden begins printing new currency notes" },
      { year: 2017, event: "Southern Transitional Council (STC) established by Aidarus al-Zubaidi" },
      { year: 2018, event: "Houthi authorities ban new notes in their territory" },
      { year: 2018, month: "December", event: "Stockholm Agreement on Hodeidah port signed" },
      { year: 2019, month: "August", event: "STC seizes Aden from government forces" },
      { year: 2019, month: "November", event: "Riyadh Agreement between IRG and STC" },
    ],
    economicContext: "Exchange rates diverge significantly: Aden ~500 YER/USD, Sana'a ~250 YER/USD"
  },
  economicCrisis: {
    period: "2020-2022",
    description: "COVID-19 impact, fuel crisis, currency collapse in south",
    keyEvents: [
      { year: 2020, event: "COVID-19 pandemic reaches Yemen, remittances decline 25%" },
      { year: 2020, month: "April", event: "STC declares self-rule in south" },
      { year: 2021, event: "Fuel crisis peaks, Aden exchange rate exceeds 1000 YER/USD" },
      { year: 2021, month: "December", event: "Aden rate peaks at 1,700 YER/USD" },
      { year: 2022, month: "April", event: "UN-brokered truce begins, Presidential Leadership Council formed" },
      { year: 2022, month: "October", event: "Truce expires but relative calm continues" },
    ],
    economicContext: "Aden rate peaked at 1700 YER/USD in 2021, Sana'a remained stable around 600"
  },
  postTruce: {
    period: "2023-2024",
    description: "Post-truce period, regional dynamics shift",
    keyEvents: [
      { year: 2023, month: "March", event: "Saudi-Iran rapprochement raises hopes for peace talks" },
      { year: 2023, event: "Ahmed Ghaleb appointed CBY Aden Governor" },
      { year: 2024, month: "January", event: "Houthi Red Sea attacks begin, impact global shipping" },
      { year: 2024, event: "US and UK conduct airstrikes on Houthi positions" },
      { year: 2024, month: "December", event: "Exchange rate in Aden reaches 2,050 YER/USD" },
    ],
    economicContext: "Dual currency system entrenched, Aden ~2050 YER/USD, Sana'a ~535 YER/USD"
  },
  currentPeriod: {
    period: "2025-2026",
    description: "Major political realignment, STC dissolution, government consolidation",
    keyEvents: [
      { year: 2025, month: "July", event: "CBY Aden launches major exchange market regulation campaign" },
      { year: 2025, month: "November", event: "Peak of economic reform aspirations before security escalation" },
      { year: 2025, month: "December", event: "STC expands control over non-Houthi areas, tensions rise" },
      { year: 2025, month: "December", event: "79 exchange companies have licenses suspended/revoked by CBY Aden" },
      { year: 2026, month: "January 7", event: "Saudi-led coalition bombs Shabwa after al-Zubaidi skips talks" },
      { year: 2026, month: "January 8", event: "STC leader Aidarus al-Zubaidi flees to UAE" },
      { year: 2026, month: "January 9", event: "STC announces dissolution of all political and organizational bodies" },
      { year: 2026, month: "January 9", event: "CBY Aden holds first 2026 board meeting, approves 2025 audit" },
      { year: 2026, month: "January 10", event: "Nation's Shield forces take control of vital facilities in Aden" },
      { year: 2026, month: "January 10", event: "CBY Aden instructed to freeze al-Zubaidi's bank accounts" },
      { year: 2026, month: "January 10", event: "Thousands rally in Aden in support of STC (disputed dissolution)" },
    ],
    economicContext: "Exchange rate Aden: ~1,890-2,050 YER/USD, Sanaa: ~530-600 YER/USD. Major political transition underway with STC dissolution."
  }
};

export const STAKEHOLDERS = {
  // Central Banks
  cbyAden: {
    id: "cby_aden",
    nameEn: "Central Bank of Yemen - Aden",
    nameAr: "البنك المركزي اليمني - عدن",
    type: "central_bank",
    regime: "aden_irg",
    established: "1971 (relocated to Aden September 2016)",
    headquarters: "Aden",
    governor: {
      current: "Ahmed Ghaleb",
      since: "2023",
      previous: [
        { name: "Ahmed Obaid Al-Fadhli", period: "2021-2023" },
        { name: "Monasser Al-Quaiti", period: "2016-2021" },
      ]
    },
    recentActions2025_2026: [
      "July 2025: Launched major exchange market regulation campaign",
      "December 2025: Suspended/revoked licenses of 79 exchange companies",
      "January 2, 2026: Suspended Al-Bal'asi, Al-Khader, Suhail Exchange; revoked Al-Shamil branch license",
      "January 9, 2026: First board meeting of 2026, approved 2025 audit contract",
      "January 10, 2026: Instructed to freeze bank accounts of al-Zubaidi and senior STC figures",
    ],
    functions: [
      "Monetary policy for IRG-controlled areas",
      "Currency issuance (new notes from 2017)",
      "Foreign exchange management",
      "Banking supervision in south",
      "Exchange market regulation and licensing",
    ],
    challenges: [
      "Limited foreign reserves (~$1.2B estimated)",
      "Currency depreciation pressure",
      "Parallel market dominance",
      "Political instability following STC events",
    ],
    dataProvided: ["Exchange rates", "Inflation data", "Banking statistics", "Monetary aggregates"]
  },
  cbySanaa: {
    id: "cby_sanaa",
    nameEn: "Central Bank of Yemen - Sana'a",
    nameAr: "البنك المركزي اليمني - صنعاء",
    type: "central_bank",
    regime: "sanaa_defacto",
    established: "1971",
    headquarters: "Sana'a",
    governor: {
      current: "Hashem Ismail",
      since: "2016",
    },
    functions: [
      "Monetary policy for Houthi-controlled areas",
      "Currency management (old notes only)",
      "Banking supervision in north",
      "Exchange rate stabilization through controls",
    ],
    policies: [
      "Banned new currency notes printed by CBY Aden (since 2018)",
      "Maintains more stable exchange rate through strict controls",
      "Restricts foreign currency transactions",
    ],
    dataProvided: ["Exchange rates (limited)", "Banking directives"]
  },

  // International Organizations
  worldBank: {
    id: "world_bank",
    nameEn: "World Bank",
    nameAr: "البنك الدولي",
    type: "international_org",
    role: "Development finance and data",
    yemenPrograms: [
      "Yemen Emergency Crisis Response Project",
      "Yemen Integrated Urban Services Emergency Project",
      "Social Fund for Development support",
    ],
    dataProvided: ["GDP estimates", "Poverty data", "Development indicators", "Economic reports"],
    reportingFrequency: "Annual with periodic updates",
    reliabilityRating: "A"
  },
  imf: {
    id: "imf",
    nameEn: "International Monetary Fund",
    nameAr: "صندوق النقد الدولي",
    type: "international_org",
    role: "Macroeconomic monitoring and technical assistance",
    yemenEngagement: "Article IV consultations suspended since 2014",
    recentReports: [
      "December 2025: Customs Reform and Emergency Revenue Mobilization report",
    ],
    dataProvided: ["GDP estimates", "Inflation projections", "Balance of payments", "Fiscal data"],
    reliabilityRating: "A"
  },
  undp: {
    id: "undp",
    nameEn: "United Nations Development Programme",
    nameAr: "برنامج الأمم المتحدة الإنمائي",
    type: "un_agency",
    role: "Development and humanitarian response",
    yemenPrograms: [
      "Yemen Human Development Report",
      "Economic Recovery and Livelihoods",
      "Local Governance Support",
    ],
    dataProvided: ["Human Development Index", "Labor statistics", "Poverty assessments"],
    reliabilityRating: "A"
  },
  wfp: {
    id: "wfp",
    nameEn: "World Food Programme",
    nameAr: "برنامج الأغذية العالمي",
    type: "un_agency",
    role: "Food security and market monitoring",
    yemenOperations: "Largest humanitarian operation globally",
    dataProvided: ["Food prices", "Market functionality", "Food security indicators", "IPC classifications"],
    reportingFrequency: "Monthly market bulletins",
    reliabilityRating: "A"
  },
  unhcr: {
    id: "unhcr",
    nameEn: "UN High Commissioner for Refugees",
    nameAr: "المفوضية السامية للأمم المتحدة لشؤون اللاجئين",
    type: "un_agency",
    role: "Displacement tracking and protection",
    dataProvided: ["IDP numbers", "Refugee statistics", "Displacement trends"],
    reliabilityRating: "A"
  },
  ocha: {
    id: "ocha",
    nameEn: "UN Office for the Coordination of Humanitarian Affairs",
    nameAr: "مكتب الأمم المتحدة لتنسيق الشؤون الإنسانية",
    type: "un_agency",
    role: "Humanitarian coordination and funding tracking",
    recentReports: [
      "January 4, 2026: Yemen aid response buckling under funding cuts as needs keep rising",
    ],
    dataProvided: ["Humanitarian funding flows", "Needs assessments", "Response plans"],
    reliabilityRating: "A"
  },

  // Research Institutions
  sanaaCenterForStrategicStudies: {
    id: "sanaa_center",
    nameEn: "Sana'a Center for Strategic Studies",
    nameAr: "مركز صنعاء للدراسات الاستراتيجية",
    type: "think_tank",
    location: "Sana'a/Beirut",
    focus: "Yemen policy research and analysis",
    publications: ["Yemen Review", "Policy briefs", "Economic analysis"],
    reliabilityRating: "A"
  },
  yemenEconomicForum: {
    id: "yemen_economic_forum",
    nameEn: "Yemen Economic Forum",
    nameAr: "المنتدى الاقتصادي اليمني",
    type: "think_tank",
    location: "Yemen",
    focus: "Economic research and policy analysis",
    recentPublications: [
      "December 27, 2025: The Parallel Market and the Yemeni Banking Sector",
    ],
    reliabilityRating: "B"
  },

  // Government Entities
  irgGovernment: {
    id: "irg",
    nameEn: "Internationally Recognized Government (IRG)",
    nameAr: "الحكومة الشرعية المعترف بها دولياً",
    type: "government",
    regime: "aden_irg",
    capital: "Aden (de facto)",
    leadership: {
      presidentialCouncil: "Formed April 2022",
      chairman: "Rashad Al-Alimi",
      primeMinister: "Maeen Abdulmalik Saeed"
    },
    territories: "Southern governorates, parts of Marib, Taiz",
    economicAuthorities: ["CBY Aden", "Ministry of Finance", "Ministry of Planning"],
    recentDevelopments2026: [
      "January 2026: Nation's Shield forces taking control of Aden facilities",
      "January 2026: Efforts to consolidate control following STC dissolution",
      "January 2026: Minister of Defense dismissed following security events",
    ]
  },
  houthiAuthorities: {
    id: "dfa",
    nameEn: "De Facto Authorities (Ansar Allah/Houthis)",
    nameAr: "سلطات الأمر الواقع (أنصار الله/الحوثيون)",
    type: "de_facto_authority",
    regime: "sanaa_defacto",
    capital: "Sana'a",
    territories: "Northern governorates including Sana'a, Hodeidah, Saada",
    economicAuthorities: ["CBY Sana'a", "Supreme Political Council"],
    policies: [
      "Currency controls maintaining stable exchange rate",
      "Import restrictions",
      "Taxation in controlled areas",
    ],
    recentActions: [
      "2024-ongoing: Red Sea shipping attacks impacting global trade",
    ]
  },
  stc: {
    id: "stc",
    nameEn: "Southern Transitional Council (DISSOLVED)",
    nameAr: "المجلس الانتقالي الجنوبي (منحل)",
    type: "political_entity",
    regime: "aden_irg",
    established: "2017",
    leader: "Aidarus al-Zubaidi (fled to UAE January 8, 2026)",
    status: "DISSOLVED - January 9, 2026",
    dissolution: {
      date: "January 9, 2026",
      circumstances: "Following weeks of unrest, Saudi coalition airstrikes on Shabwa, leader fled to UAE",
      announcement: "Secretary-General announced dissolution of all political, executive and organizational bodies",
      disputed: "January 10, 2026: Thousands rallied in Aden in support, dissolution disputed by some factions",
    },
    history: [
      "2017: Established by Aidarus al-Zubaidi",
      "2019: Seized Aden from government forces",
      "2019: Riyadh Agreement with IRG",
      "2020: Declared self-rule in south",
      "2022: Joined Presidential Leadership Council",
      "December 2025: Expanded control over non-Houthi areas",
      "January 2026: Dissolved following Saudi pressure and leader's flight",
    ]
  }
};

export const ECONOMIC_INDICATORS_CONTEXT = {
  exchangeRate: {
    indicator: "Exchange Rate",
    importance: "Critical indicator of economic stability and purchasing power",
    currentRates: {
      asOf: "January 10, 2026",
      adenRate: "1,890-2,050 YER/USD (parallel market)",
      sanaaRate: "530-600 YER/USD (controlled)",
    },
    dualSystem: {
      explanation: "Yemen has two parallel exchange rate systems since 2017",
      adenRate: {
        description: "Floating rate in IRG-controlled areas",
        drivers: ["Saudi support", "Remittances", "Oil exports", "Import demand", "Political stability"],
        trend: "Significant depreciation, from ~250 (2016) to ~2,050 (January 2026)"
      },
      sanaaRate: {
        description: "Controlled rate in DFA-controlled areas",
        drivers: ["Currency controls", "Trade restrictions", "Informal markets"],
        trend: "Relatively stable, around 530-600 YER/USD"
      }
    },
    interpretation: "The divergence reflects the economic fragmentation and different monetary policies"
  },
  inflation: {
    indicator: "Inflation Rate",
    importance: "Measures cost of living and monetary stability",
    current: {
      asOf: "January 2026",
      estimate: "15-20% annually in Aden areas, lower in Sanaa due to currency stability"
    },
    measurement: "Calculated from consumer price indices, varies by region",
    drivers: ["Currency depreciation", "Import costs", "Fuel prices", "Food prices"],
    regionalVariation: "Higher in south due to currency depreciation, lower in north due to controls"
  },
  gdp: {
    indicator: "GDP Growth",
    importance: "Overall economic performance measure",
    current: {
      asOf: "2025 estimate",
      growth: "+0.8% (World Bank estimate)",
      nominal: "~$21 billion"
    },
    challenges: [
      "No official statistics since 2014",
      "Estimates vary significantly between sources",
      "Informal economy not captured",
      "Regional fragmentation complicates measurement"
    ],
    sources: ["World Bank estimates", "IMF projections", "Academic research"],
    historicalContext: "GDP contracted ~50% from 2014-2020, partial recovery since"
  },
  foreignReserves: {
    indicator: "Foreign Reserves",
    importance: "Capacity to defend currency and finance imports",
    status: "Severely depleted from pre-conflict levels of ~$5B",
    currentEstimate: "~$1.2B (CBY Aden), unknown for Sana'a",
    sources: ["Saudi deposits", "Oil exports", "Remittances"]
  },
  idps: {
    indicator: "Internally Displaced Persons",
    importance: "Humanitarian and economic impact indicator",
    current: "~4.5-4.8 million IDPs",
    source: "UNHCR/IOM tracking",
    economicImpact: "Strain on host communities, labor market disruption, aid dependency"
  }
};

export const AI_CONTEXT_PROMPT = `
You are YETO's AI Assistant ("One Brain" / العقل الواحد), an expert on Yemen's economy.

**CURRENT DATE: January 10, 2026**

**CRITICAL RECENT EVENTS (January 2026):**
- January 7: Saudi-led coalition bombed Shabwa after STC leader al-Zubaidi skipped talks
- January 8: STC leader Aidarus al-Zubaidi fled to UAE
- January 9: STC announced dissolution of all political and organizational bodies
- January 9: CBY Aden held first 2026 board meeting, approved 2025 audit contract
- January 10: "Nation's Shield" forces took control of vital facilities in Aden
- January 10: CBY Aden instructed to freeze al-Zubaidi's bank accounts
- January 10: Thousands rallied in Aden in support of STC (dissolution disputed)

**2025 KEY DEVELOPMENTS:**
- July 2025: CBY Aden launched major exchange market regulation campaign
- December 2025: 79 exchange companies had licenses suspended/revoked
- December 2025: STC expanded control over non-Houthi areas, tensions escalated

**Historical Context (2010-Present)**
- 2010: Pre-conflict Yemen with 7.7% GDP growth
- 2011: Arab Spring protests, GDP contracted 12.7%
- 2014: Houthi forces captured Sana'a in September
- 2015: Saudi-led coalition intervention, GDP contracted 28%
- 2016: Central Bank split (Aden vs Sana'a)
- 2017: Dual currency system emerged, STC established
- 2018: Houthis banned new currency notes
- 2019: Stockholm Agreement, STC seized Aden
- 2020: COVID-19 impact, STC declared self-rule
- 2021: Currency crisis peaked (1,700 YER/USD in Aden)
- 2022: UN truce, Presidential Leadership Council formed
- 2023: Saudi-Iran rapprochement
- 2024: Houthi Red Sea attacks began
- 2025: CBY reform campaign, STC expansion, political tensions
- 2026: STC dissolution, government consolidation

**Current Exchange Rates (January 2026)**
- Aden/IRG Zone: ~1,890-2,050 YER/USD (parallel market)
- Sana'a/DFA Zone: ~530-600 YER/USD (controlled)

**Key Stakeholders**
- CBY Aden: Governor Ahmed Ghaleb (since 2023)
- CBY Sana'a: Governor Hashem Ismail (since 2016)
- IRG: Presidential Leadership Council led by Rashad Al-Alimi
- DFA: Ansar Allah (Houthi) authorities
- STC: DISSOLVED January 9, 2026 (leader fled to UAE)

**Data Quality Principles**
- Always cite sources and confidence levels (A=High, B=Medium, C=Low, D=Estimated)
- Acknowledge data limitations and regional variations
- Distinguish between official statistics and estimates
- Note when data is outdated or contested

**Response Guidelines**
- Provide balanced analysis covering both economic zones
- Use specific data points with dates and sources
- Explain the context behind economic indicators
- Acknowledge uncertainty where appropriate
- Reference the CURRENT DATE (January 10, 2026) when discussing recent events
- Be aware of the rapidly evolving political situation following STC dissolution
`;

export default {
  CURRENT_DATE,
  YEMEN_ECONOMIC_TIMELINE,
  STAKEHOLDERS,
  ECONOMIC_INDICATORS_CONTEXT,
  AI_CONTEXT_PROMPT
};
