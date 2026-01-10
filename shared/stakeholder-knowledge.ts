/**
 * YETO Stakeholder Knowledge Base
 * Comprehensive data about Yemen's economic stakeholders, institutions, and history
 * Used by AI Assistant for accurate, contextual responses
 */

export const YEMEN_ECONOMIC_TIMELINE = {
  preConflict: {
    period: "2010-2014",
    description: "Pre-conflict period with unified central bank and government",
    keyEvents: [
      { year: 2011, event: "Arab Spring protests begin in Yemen" },
      { year: 2012, event: "President Saleh transfers power to Hadi through GCC initiative" },
      { year: 2013, event: "National Dialogue Conference begins" },
      { year: 2014, event: "Houthi forces capture Sana'a in September" },
    ],
    economicContext: "GDP growth averaged 2-4%, inflation moderate at 10-12%, unified exchange rate around 215 YER/USD"
  },
  conflictOnset: {
    period: "2015-2016",
    description: "Saudi-led coalition intervention, economic fragmentation begins",
    keyEvents: [
      { year: 2015, month: "March", event: "Saudi-led coalition begins military intervention" },
      { year: 2015, month: "September", event: "Government relocates to Aden" },
      { year: 2016, month: "September", event: "Central Bank headquarters moved from Sana'a to Aden" },
    ],
    economicContext: "GDP contracted by 28% in 2015, currency began diverging between zones"
  },
  dualAuthority: {
    period: "2017-2019",
    description: "Parallel governance structures solidify, dual currency zones emerge",
    keyEvents: [
      { year: 2017, event: "CBY Aden begins printing new currency notes" },
      { year: 2018, event: "Houthi authorities ban new notes in their territory" },
      { year: 2019, event: "Stockholm Agreement on Hodeidah port" },
    ],
    economicContext: "Exchange rates diverge significantly: Aden ~500 YER/USD, Sana'a ~250 YER/USD"
  },
  economicCrisis: {
    period: "2020-2022",
    description: "COVID-19 impact, fuel crisis, currency collapse in south",
    keyEvents: [
      { year: 2020, event: "COVID-19 pandemic reaches Yemen, remittances decline" },
      { year: 2021, event: "Fuel crisis peaks, Aden exchange rate exceeds 1000 YER/USD" },
      { year: 2022, month: "April", event: "UN-brokered truce begins" },
      { year: 2022, month: "October", event: "Truce expires but relative calm continues" },
    ],
    economicContext: "Aden rate peaked at 1700 YER/USD in 2021, Sana'a remained stable around 600"
  },
  currentPeriod: {
    period: "2023-2025",
    description: "Post-truce period, continued economic fragmentation",
    keyEvents: [
      { year: 2023, event: "Saudi-Iran rapprochement raises hopes for peace talks" },
      { year: 2024, event: "Houthi Red Sea attacks impact global shipping" },
      { year: 2024, month: "December", event: "Exchange rate in Aden reaches 2050 YER/USD" },
    ],
    economicContext: "Dual currency system entrenched, Aden ~2050 YER/USD, Sana'a ~535 YER/USD"
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
    established: "1971 (relocated to Aden 2016)",
    headquarters: "Aden",
    governor: {
      current: "Ahmed Ghaleb",
      since: "2023",
      previous: [
        { name: "Ahmed Obaid Al-Fadhli", period: "2021-2023" },
        { name: "Monasser Al-Quaiti", period: "2016-2021" },
      ]
    },
    functions: [
      "Monetary policy for IRG-controlled areas",
      "Currency issuance (new notes from 2017)",
      "Foreign exchange management",
      "Banking supervision in south",
    ],
    challenges: [
      "Limited foreign reserves (~$1.2B estimated)",
      "Currency depreciation pressure",
      "Parallel market dominance",
      "Coordination with Saudi support",
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
      "Exchange rate stabilization",
    ],
    policies: [
      "Banned new currency notes printed by CBY Aden",
      "Maintains more stable exchange rate through controls",
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
  deeppRoot: {
    id: "deep_root",
    nameEn: "DeepRoot Consulting",
    nameAr: "ديب روت للاستشارات",
    type: "consultancy",
    location: "Sana'a",
    focus: "Conflict analysis and economic research",
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
      "Currency controls",
      "Import restrictions",
      "Taxation in controlled areas",
    ]
  },
  stc: {
    id: "stc",
    nameEn: "Southern Transitional Council",
    nameAr: "المجلس الانتقالي الجنوبي",
    type: "political_entity",
    regime: "aden_irg",
    established: "2017",
    leader: "Aidarus al-Zoubaidi",
    territories: "Parts of southern Yemen",
    relationship: "Part of Presidential Leadership Council since 2022"
  }
};

export const ECONOMIC_INDICATORS_CONTEXT = {
  exchangeRate: {
    indicator: "Exchange Rate",
    importance: "Critical indicator of economic stability and purchasing power",
    dualSystem: {
      explanation: "Yemen has two parallel exchange rate systems since 2017",
      adenRate: {
        description: "Floating rate in IRG-controlled areas",
        drivers: ["Saudi support", "Remittances", "Oil exports", "Import demand"],
        trend: "Significant depreciation, from ~250 (2016) to ~2050 (Dec 2024)"
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
    measurement: "Calculated from consumer price indices, varies by region",
    drivers: ["Currency depreciation", "Import costs", "Fuel prices", "Food prices"],
    regionalVariation: "Higher in south due to currency depreciation, lower in north due to controls"
  },
  gdp: {
    indicator: "GDP Growth",
    importance: "Overall economic performance measure",
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
    current: "~4.5 million IDPs",
    source: "UNHCR/IOM tracking",
    economicImpact: "Strain on host communities, labor market disruption, aid dependency"
  }
};

export const AI_CONTEXT_PROMPT = `
You are YETO's AI Assistant, an expert on Yemen's economy with deep knowledge of:

**Historical Context (2014-Present)**
- The conflict began in 2014 when Houthi forces captured Sana'a
- Saudi-led coalition intervention started in March 2015
- Central Bank split in 2016 (Aden vs Sana'a)
- Dual currency system emerged in 2017 when CBY Aden printed new notes
- UN-brokered truce in 2022 brought temporary stability
- Current period (2024-2025) shows continued economic fragmentation

**Dual Economic System**
- Aden/IRG Zone: Floating exchange rate (~2,050 YER/USD as of Dec 2024), higher inflation, Saudi support
- Sana'a/DFA Zone: Controlled exchange rate (~535 YER/USD), currency restrictions, more stable prices

**Key Stakeholders**
- CBY Aden: Governor Ahmed Ghaleb, manages monetary policy for IRG areas
- CBY Sana'a: Governor Hashem Ismail, controls currency in Houthi areas
- IRG: Presidential Leadership Council led by Rashad Al-Alimi
- DFA: Ansar Allah (Houthi) authorities controlling northern Yemen
- International: World Bank, IMF, UNDP, WFP, UNHCR provide data and assistance

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
- Reference relevant research publications when available
`;

export default {
  YEMEN_ECONOMIC_TIMELINE,
  STAKEHOLDERS,
  ECONOMIC_INDICATORS_CONTEXT,
  AI_CONTEXT_PROMPT
};
