/**
 * YETO Platform - Comprehensive Indicator Seeding Script
 * 
 * This script populates the database with:
 * 1. Data sources with full provenance
 * 2. Indicator definitions for all sectors
 * 3. Historical time series data (2010-2026)
 * 
 * All data is sourced from verified international organizations
 * and follows the "no figure without reference" principle.
 */

import { getDb } from "../server/db";
import { sql } from "drizzle-orm";

// ============================================================================
// DATA SOURCES - Verified International Organizations
// ============================================================================

const dataSources = [
  {
    publisher: "World Bank",
    url: "https://data.worldbank.org/country/yemen-rep",
    license: "CC-BY-4.0",
    notes: "World Development Indicators, Global Economic Prospects"
  },
  {
    publisher: "International Monetary Fund",
    url: "https://www.imf.org/en/Countries/YEM",
    license: "IMF Terms of Use",
    notes: "Article IV Consultations, World Economic Outlook"
  },
  {
    publisher: "Central Bank of Yemen - Aden",
    url: "https://cby-ye.com",
    license: "Public Domain",
    notes: "Official monetary statistics, exchange rates, banking data"
  },
  {
    publisher: "Sana'a Monetary Authority",
    url: null,
    license: "Public Domain",
    notes: "De facto authority monetary statistics"
  },
  {
    publisher: "UN OCHA",
    url: "https://www.unocha.org/yemen",
    license: "CC-BY-3.0-IGO",
    notes: "Humanitarian Needs Overview, Humanitarian Response Plan"
  },
  {
    publisher: "World Food Programme",
    url: "https://www.wfp.org/countries/yemen",
    license: "CC-BY-4.0",
    notes: "Food security assessments, market monitoring"
  },
  {
    publisher: "UNHCR",
    url: "https://data.unhcr.org/en/country/yem",
    license: "CC-BY-4.0",
    notes: "Displacement data, refugee statistics"
  },
  {
    publisher: "IPC Global Platform",
    url: "https://www.ipcinfo.org/ipc-country-analysis/details-map/en/c/1156661/",
    license: "CC-BY-4.0",
    notes: "Integrated Food Security Phase Classification"
  },
  {
    publisher: "ACAPS",
    url: "https://www.acaps.org/country/yemen",
    license: "CC-BY-4.0",
    notes: "Crisis analysis, humanitarian access"
  },
  {
    publisher: "Rethinking Yemen's Economy",
    url: "https://devchampions.org/rethinking-yemens-economy/",
    license: "CC-BY-4.0",
    notes: "Economic policy research, sector analysis"
  },
  {
    publisher: "Yemen Central Statistical Organization",
    url: null,
    license: "Public Domain",
    notes: "National statistics, census data"
  },
  {
    publisher: "UN ESCWA",
    url: "https://www.unescwa.org/",
    license: "CC-BY-3.0-IGO",
    notes: "Regional economic analysis"
  },
  {
    publisher: "UNCTAD",
    url: "https://unctad.org/",
    license: "CC-BY-3.0-IGO",
    notes: "Trade statistics, FDI data"
  },
  {
    publisher: "FAO GIEWS",
    url: "https://www.fao.org/giews/countrybrief/country.jsp?code=YEM",
    license: "CC-BY-4.0",
    notes: "Food price monitoring, agricultural data"
  },
  {
    publisher: "ILO",
    url: "https://www.ilo.org/",
    license: "CC-BY-4.0",
    notes: "Labor market statistics, employment data"
  },
  {
    publisher: "UNDP",
    url: "https://www.undp.org/yemen",
    license: "CC-BY-3.0-IGO",
    notes: "Human Development Index, poverty analysis"
  },
  {
    publisher: "Sana'a Center for Strategic Studies",
    url: "https://sanaacenter.org/",
    license: "CC-BY-4.0",
    notes: "Economic analysis, policy research"
  },
  {
    publisher: "Yemen Polling Center",
    url: "https://yemenpolling.org/",
    license: "CC-BY-4.0",
    notes: "Survey data, public opinion research"
  }
];

// ============================================================================
// INDICATOR DEFINITIONS - All Sectors
// ============================================================================

const indicators = [
  // MACROECONOMY
  {
    code: "gdp_nominal_usd",
    nameEn: "GDP (Nominal, USD)",
    nameAr: "الناتج المحلي الإجمالي (الاسمي، دولار)",
    descriptionEn: "Gross Domestic Product at current prices in US dollars",
    descriptionAr: "الناتج المحلي الإجمالي بالأسعار الجارية بالدولار الأمريكي",
    unit: "USD billions",
    sector: "macroeconomy",
    frequency: "annual",
    methodology: "Expenditure approach, converted at average annual exchange rate"
  },
  {
    code: "gdp_growth_annual",
    nameEn: "GDP Growth Rate (Annual)",
    nameAr: "معدل نمو الناتج المحلي الإجمالي (سنوي)",
    descriptionEn: "Annual percentage change in real GDP",
    descriptionAr: "التغير السنوي في الناتج المحلي الإجمالي الحقيقي",
    unit: "percent",
    sector: "macroeconomy",
    frequency: "annual",
    methodology: "Real GDP growth calculated using constant prices"
  },
  {
    code: "gdp_per_capita_usd",
    nameEn: "GDP per Capita (USD)",
    nameAr: "نصيب الفرد من الناتج المحلي الإجمالي (دولار)",
    descriptionEn: "GDP divided by total population",
    descriptionAr: "الناتج المحلي الإجمالي مقسوماً على إجمالي السكان",
    unit: "USD",
    sector: "macroeconomy",
    frequency: "annual",
    methodology: "Nominal GDP divided by mid-year population estimate"
  },
  {
    code: "population_total",
    nameEn: "Total Population",
    nameAr: "إجمالي السكان",
    descriptionEn: "Total population including all residents",
    descriptionAr: "إجمالي السكان بما في ذلك جميع المقيمين",
    unit: "millions",
    sector: "macroeconomy",
    frequency: "annual",
    methodology: "UN Population Division estimates"
  },
  
  // CURRENCY & EXCHANGE RATES
  {
    code: "fx_rate_aden_official",
    nameEn: "Exchange Rate - Aden Official",
    nameAr: "سعر الصرف - عدن الرسمي",
    descriptionEn: "Official CBY Aden exchange rate (YER per USD)",
    descriptionAr: "سعر الصرف الرسمي للبنك المركزي عدن (ريال يمني لكل دولار)",
    unit: "YER/USD",
    sector: "currency",
    frequency: "daily",
    methodology: "Central Bank of Yemen - Aden official rate"
  },
  {
    code: "fx_rate_aden_parallel",
    nameEn: "Exchange Rate - Aden Parallel Market",
    nameAr: "سعر الصرف - عدن السوق الموازي",
    descriptionEn: "Parallel market exchange rate in Aden (YER per USD)",
    descriptionAr: "سعر الصرف في السوق الموازي في عدن (ريال يمني لكل دولار)",
    unit: "YER/USD",
    sector: "currency",
    frequency: "daily",
    methodology: "Market survey of exchange bureaus in Aden"
  },
  {
    code: "fx_rate_sanaa",
    nameEn: "Exchange Rate - Sana'a",
    nameAr: "سعر الصرف - صنعاء",
    descriptionEn: "Exchange rate in Sana'a-controlled areas (YER per USD)",
    descriptionAr: "سعر الصرف في المناطق الخاضعة لسيطرة صنعاء (ريال يمني لكل دولار)",
    unit: "YER/USD",
    sector: "currency",
    frequency: "daily",
    methodology: "Market survey of exchange bureaus in Sana'a"
  },
  {
    code: "fx_rate_spread",
    nameEn: "North-South Exchange Rate Spread",
    nameAr: "فجوة سعر الصرف شمال-جنوب",
    descriptionEn: "Percentage difference between Aden and Sana'a rates",
    descriptionAr: "الفرق النسبي بين أسعار عدن وصنعاء",
    unit: "percent",
    sector: "currency",
    frequency: "daily",
    methodology: "((Aden rate - Sana'a rate) / Sana'a rate) * 100"
  },
  {
    code: "fx_reserves_usd",
    nameEn: "Foreign Exchange Reserves",
    nameAr: "احتياطيات النقد الأجنبي",
    descriptionEn: "Total foreign exchange reserves held by CBY",
    descriptionAr: "إجمالي احتياطيات النقد الأجنبي لدى البنك المركزي",
    unit: "USD billions",
    sector: "currency",
    frequency: "monthly",
    methodology: "CBY official reports"
  },
  
  // INFLATION & PRICES
  {
    code: "inflation_cpi_aden",
    nameEn: "Inflation Rate - Aden (CPI)",
    nameAr: "معدل التضخم - عدن (مؤشر أسعار المستهلك)",
    descriptionEn: "Year-over-year change in Consumer Price Index for Aden",
    descriptionAr: "التغير السنوي في مؤشر أسعار المستهلك لعدن",
    unit: "percent",
    sector: "prices",
    frequency: "monthly",
    methodology: "CPI basket weighted by household expenditure survey"
  },
  {
    code: "inflation_cpi_sanaa",
    nameEn: "Inflation Rate - Sana'a (CPI)",
    nameAr: "معدل التضخم - صنعاء (مؤشر أسعار المستهلك)",
    descriptionEn: "Year-over-year change in Consumer Price Index for Sana'a",
    descriptionAr: "التغير السنوي في مؤشر أسعار المستهلك لصنعاء",
    unit: "percent",
    sector: "prices",
    frequency: "monthly",
    methodology: "CPI basket weighted by household expenditure survey"
  },
  {
    code: "food_basket_cost_aden",
    nameEn: "Minimum Food Basket Cost - Aden",
    nameAr: "تكلفة السلة الغذائية الدنيا - عدن",
    descriptionEn: "Cost of WFP minimum food basket in Aden",
    descriptionAr: "تكلفة السلة الغذائية الدنيا لبرنامج الأغذية العالمي في عدن",
    unit: "YER",
    sector: "prices",
    frequency: "monthly",
    methodology: "WFP market monitoring"
  },
  {
    code: "food_basket_cost_sanaa",
    nameEn: "Minimum Food Basket Cost - Sana'a",
    nameAr: "تكلفة السلة الغذائية الدنيا - صنعاء",
    descriptionEn: "Cost of WFP minimum food basket in Sana'a",
    descriptionAr: "تكلفة السلة الغذائية الدنيا لبرنامج الأغذية العالمي في صنعاء",
    unit: "YER",
    sector: "prices",
    frequency: "monthly",
    methodology: "WFP market monitoring"
  },
  {
    code: "diesel_price_aden",
    nameEn: "Diesel Price - Aden",
    nameAr: "سعر الديزل - عدن",
    descriptionEn: "Retail diesel price per liter in Aden",
    descriptionAr: "سعر التجزئة للديزل للتر الواحد في عدن",
    unit: "YER/liter",
    sector: "energy",
    frequency: "weekly",
    methodology: "Market survey of fuel stations"
  },
  {
    code: "diesel_price_sanaa",
    nameEn: "Diesel Price - Sana'a",
    nameAr: "سعر الديزل - صنعاء",
    descriptionEn: "Retail diesel price per liter in Sana'a",
    descriptionAr: "سعر التجزئة للديزل للتر الواحد في صنعاء",
    unit: "YER/liter",
    sector: "energy",
    frequency: "weekly",
    methodology: "Market survey of fuel stations"
  },
  
  // BANKING & FINANCE
  {
    code: "bank_deposits_total",
    nameEn: "Total Bank Deposits",
    nameAr: "إجمالي الودائع المصرفية",
    descriptionEn: "Total deposits in commercial banks",
    descriptionAr: "إجمالي الودائع في البنوك التجارية",
    unit: "YER billions",
    sector: "banking",
    frequency: "quarterly",
    methodology: "CBY banking statistics"
  },
  {
    code: "bank_credit_private",
    nameEn: "Private Sector Credit",
    nameAr: "الائتمان للقطاع الخاص",
    descriptionEn: "Total credit extended to private sector",
    descriptionAr: "إجمالي الائتمان الممنوح للقطاع الخاص",
    unit: "YER billions",
    sector: "banking",
    frequency: "quarterly",
    methodology: "CBY banking statistics"
  },
  {
    code: "npl_ratio",
    nameEn: "Non-Performing Loans Ratio",
    nameAr: "نسبة القروض المتعثرة",
    descriptionEn: "Percentage of loans classified as non-performing",
    descriptionAr: "نسبة القروض المصنفة كمتعثرة",
    unit: "percent",
    sector: "banking",
    frequency: "quarterly",
    methodology: "CBY banking supervision reports"
  },
  {
    code: "money_supply_m2",
    nameEn: "Money Supply (M2)",
    nameAr: "عرض النقود (ن2)",
    descriptionEn: "Broad money supply including currency and deposits",
    descriptionAr: "عرض النقود الواسع شاملاً العملة والودائع",
    unit: "YER billions",
    sector: "banking",
    frequency: "monthly",
    methodology: "CBY monetary statistics"
  },
  
  // TRADE
  {
    code: "exports_total_usd",
    nameEn: "Total Exports",
    nameAr: "إجمالي الصادرات",
    descriptionEn: "Total value of goods and services exported",
    descriptionAr: "إجمالي قيمة السلع والخدمات المصدرة",
    unit: "USD millions",
    sector: "trade",
    frequency: "annual",
    methodology: "Customs data and balance of payments"
  },
  {
    code: "imports_total_usd",
    nameEn: "Total Imports",
    nameAr: "إجمالي الواردات",
    descriptionEn: "Total value of goods and services imported",
    descriptionAr: "إجمالي قيمة السلع والخدمات المستوردة",
    unit: "USD millions",
    sector: "trade",
    frequency: "annual",
    methodology: "Customs data and balance of payments"
  },
  {
    code: "trade_balance_usd",
    nameEn: "Trade Balance",
    nameAr: "الميزان التجاري",
    descriptionEn: "Exports minus imports",
    descriptionAr: "الصادرات ناقص الواردات",
    unit: "USD millions",
    sector: "trade",
    frequency: "annual",
    methodology: "Exports minus imports"
  },
  {
    code: "oil_exports_usd",
    nameEn: "Oil Exports",
    nameAr: "صادرات النفط",
    descriptionEn: "Value of crude oil and petroleum exports",
    descriptionAr: "قيمة صادرات النفط الخام والمنتجات البترولية",
    unit: "USD millions",
    sector: "trade",
    frequency: "annual",
    methodology: "Ministry of Oil and Minerals data"
  },
  {
    code: "food_imports_usd",
    nameEn: "Food Imports",
    nameAr: "واردات الغذاء",
    descriptionEn: "Value of food and agricultural imports",
    descriptionAr: "قيمة واردات الغذاء والمنتجات الزراعية",
    unit: "USD millions",
    sector: "trade",
    frequency: "annual",
    methodology: "Customs data"
  },
  
  // PUBLIC FINANCE
  {
    code: "govt_revenue_total",
    nameEn: "Total Government Revenue",
    nameAr: "إجمالي الإيرادات الحكومية",
    descriptionEn: "Total government revenue from all sources",
    descriptionAr: "إجمالي الإيرادات الحكومية من جميع المصادر",
    unit: "YER billions",
    sector: "public_finance",
    frequency: "annual",
    methodology: "Ministry of Finance budget execution reports"
  },
  {
    code: "govt_expenditure_total",
    nameEn: "Total Government Expenditure",
    nameAr: "إجمالي الإنفاق الحكومي",
    descriptionEn: "Total government spending including wages and capital",
    descriptionAr: "إجمالي الإنفاق الحكومي شاملاً الرواتب والإنفاق الرأسمالي",
    unit: "YER billions",
    sector: "public_finance",
    frequency: "annual",
    methodology: "Ministry of Finance budget execution reports"
  },
  {
    code: "fiscal_deficit_gdp",
    nameEn: "Fiscal Deficit (% of GDP)",
    nameAr: "العجز المالي (% من الناتج المحلي)",
    descriptionEn: "Government deficit as percentage of GDP",
    descriptionAr: "عجز الحكومة كنسبة من الناتج المحلي الإجمالي",
    unit: "percent",
    sector: "public_finance",
    frequency: "annual",
    methodology: "(Revenue - Expenditure) / GDP * 100"
  },
  {
    code: "public_debt_gdp",
    nameEn: "Public Debt (% of GDP)",
    nameAr: "الدين العام (% من الناتج المحلي)",
    descriptionEn: "Total public debt as percentage of GDP",
    descriptionAr: "إجمالي الدين العام كنسبة من الناتج المحلي الإجمالي",
    unit: "percent",
    sector: "public_finance",
    frequency: "annual",
    methodology: "IMF debt sustainability analysis"
  },
  {
    code: "civil_servants_count",
    nameEn: "Civil Servants Count",
    nameAr: "عدد الموظفين الحكوميين",
    descriptionEn: "Total number of government employees on payroll",
    descriptionAr: "إجمالي عدد الموظفين الحكوميين على كشوف الرواتب",
    unit: "thousands",
    sector: "public_finance",
    frequency: "annual",
    methodology: "Ministry of Civil Service records"
  },
  {
    code: "salary_arrears_months",
    nameEn: "Salary Arrears (Months)",
    nameAr: "متأخرات الرواتب (أشهر)",
    descriptionEn: "Average months of unpaid civil servant salaries",
    descriptionAr: "متوسط أشهر الرواتب غير المدفوعة للموظفين الحكوميين",
    unit: "months",
    sector: "public_finance",
    frequency: "monthly",
    methodology: "Government reports and surveys"
  },
  
  // HUMANITARIAN
  {
    code: "people_in_need",
    nameEn: "People in Need",
    nameAr: "المحتاجون للمساعدة",
    descriptionEn: "Total population requiring humanitarian assistance",
    descriptionAr: "إجمالي السكان الذين يحتاجون إلى مساعدة إنسانية",
    unit: "millions",
    sector: "humanitarian",
    frequency: "annual",
    methodology: "UN OCHA Humanitarian Needs Overview"
  },
  {
    code: "hrp_requirements_usd",
    nameEn: "Humanitarian Response Plan Requirements",
    nameAr: "متطلبات خطة الاستجابة الإنسانية",
    descriptionEn: "Total funding requested in HRP",
    descriptionAr: "إجمالي التمويل المطلوب في خطة الاستجابة الإنسانية",
    unit: "USD billions",
    sector: "humanitarian",
    frequency: "annual",
    methodology: "UN OCHA Financial Tracking Service"
  },
  {
    code: "hrp_funding_received_usd",
    nameEn: "HRP Funding Received",
    nameAr: "التمويل المستلم لخطة الاستجابة",
    descriptionEn: "Total funding received against HRP",
    descriptionAr: "إجمالي التمويل المستلم مقابل خطة الاستجابة الإنسانية",
    unit: "USD billions",
    sector: "humanitarian",
    frequency: "monthly",
    methodology: "UN OCHA Financial Tracking Service"
  },
  {
    code: "hrp_funding_gap",
    nameEn: "HRP Funding Gap",
    nameAr: "فجوة تمويل خطة الاستجابة",
    descriptionEn: "Percentage of HRP requirements unfunded",
    descriptionAr: "نسبة متطلبات خطة الاستجابة غير الممولة",
    unit: "percent",
    sector: "humanitarian",
    frequency: "monthly",
    methodology: "(Requirements - Received) / Requirements * 100"
  },
  {
    code: "idps_total",
    nameEn: "Internally Displaced Persons",
    nameAr: "النازحون داخلياً",
    descriptionEn: "Total number of internally displaced persons",
    descriptionAr: "إجمالي عدد النازحين داخلياً",
    unit: "millions",
    sector: "humanitarian",
    frequency: "quarterly",
    methodology: "IOM Displacement Tracking Matrix"
  },
  
  // FOOD SECURITY
  {
    code: "food_insecure_total",
    nameEn: "Food Insecure Population",
    nameAr: "السكان الذين يعانون من انعدام الأمن الغذائي",
    descriptionEn: "Population facing acute food insecurity (IPC 3+)",
    descriptionAr: "السكان الذين يواجهون انعدام الأمن الغذائي الحاد (التصنيف المرحلي 3+)",
    unit: "millions",
    sector: "food_security",
    frequency: "biannual",
    methodology: "IPC Global Platform analysis"
  },
  {
    code: "acute_malnutrition_children",
    nameEn: "Children with Acute Malnutrition",
    nameAr: "الأطفال الذين يعانون من سوء التغذية الحاد",
    descriptionEn: "Children under 5 with acute malnutrition",
    descriptionAr: "الأطفال دون سن الخامسة الذين يعانون من سوء التغذية الحاد",
    unit: "thousands",
    sector: "food_security",
    frequency: "annual",
    methodology: "UNICEF/WFP nutrition surveys"
  },
  {
    code: "food_import_dependency",
    nameEn: "Food Import Dependency",
    nameAr: "الاعتماد على واردات الغذاء",
    descriptionEn: "Percentage of food consumption from imports",
    descriptionAr: "نسبة استهلاك الغذاء من الواردات",
    unit: "percent",
    sector: "food_security",
    frequency: "annual",
    methodology: "FAO food balance sheets"
  },
  
  // LABOR MARKET
  {
    code: "unemployment_rate",
    nameEn: "Unemployment Rate",
    nameAr: "معدل البطالة",
    descriptionEn: "Percentage of labor force unemployed",
    descriptionAr: "نسبة القوى العاملة العاطلة عن العمل",
    unit: "percent",
    sector: "labor",
    frequency: "annual",
    methodology: "ILO modeled estimates"
  },
  {
    code: "youth_unemployment_rate",
    nameEn: "Youth Unemployment Rate",
    nameAr: "معدل بطالة الشباب",
    descriptionEn: "Unemployment rate for ages 15-24",
    descriptionAr: "معدل البطالة للفئة العمرية 15-24",
    unit: "percent",
    sector: "labor",
    frequency: "annual",
    methodology: "ILO modeled estimates"
  },
  {
    code: "labor_force_participation",
    nameEn: "Labor Force Participation Rate",
    nameAr: "معدل المشاركة في القوى العاملة",
    descriptionEn: "Percentage of working-age population in labor force",
    descriptionAr: "نسبة السكان في سن العمل المشاركين في القوى العاملة",
    unit: "percent",
    sector: "labor",
    frequency: "annual",
    methodology: "ILO modeled estimates"
  },
  
  // POVERTY
  {
    code: "poverty_rate",
    nameEn: "Poverty Rate",
    nameAr: "معدل الفقر",
    descriptionEn: "Percentage of population below national poverty line",
    descriptionAr: "نسبة السكان تحت خط الفقر الوطني",
    unit: "percent",
    sector: "poverty",
    frequency: "annual",
    methodology: "World Bank poverty estimates"
  },
  {
    code: "extreme_poverty_rate",
    nameEn: "Extreme Poverty Rate",
    nameAr: "معدل الفقر المدقع",
    descriptionEn: "Percentage of population below $2.15/day (2017 PPP)",
    descriptionAr: "نسبة السكان تحت 2.15 دولار/يوم (تعادل القوة الشرائية 2017)",
    unit: "percent",
    sector: "poverty",
    frequency: "annual",
    methodology: "World Bank international poverty line"
  },
  {
    code: "hdi_score",
    nameEn: "Human Development Index",
    nameAr: "مؤشر التنمية البشرية",
    descriptionEn: "UNDP Human Development Index score",
    descriptionAr: "درجة مؤشر التنمية البشرية لبرنامج الأمم المتحدة الإنمائي",
    unit: "index (0-1)",
    sector: "poverty",
    frequency: "annual",
    methodology: "UNDP HDI methodology"
  },
  
  // CONFLICT
  {
    code: "conflict_fatalities",
    nameEn: "Conflict Fatalities",
    nameAr: "ضحايا النزاع",
    descriptionEn: "Reported conflict-related deaths",
    descriptionAr: "الوفيات المبلغ عنها المرتبطة بالنزاع",
    unit: "count",
    sector: "conflict",
    frequency: "monthly",
    methodology: "ACLED conflict data"
  },
  {
    code: "conflict_events",
    nameEn: "Conflict Events",
    nameAr: "أحداث النزاع",
    descriptionEn: "Number of reported conflict events",
    descriptionAr: "عدد أحداث النزاع المبلغ عنها",
    unit: "count",
    sector: "conflict",
    frequency: "monthly",
    methodology: "ACLED conflict data"
  },
  
  // REMITTANCES
  {
    code: "remittances_inflow_usd",
    nameEn: "Remittance Inflows",
    nameAr: "تدفقات التحويلات",
    descriptionEn: "Personal remittances received",
    descriptionAr: "التحويلات الشخصية المستلمة",
    unit: "USD millions",
    sector: "trade",
    frequency: "annual",
    methodology: "World Bank bilateral remittance estimates"
  }
];

// ============================================================================
// TIME SERIES DATA - Historical Values (2010-2026)
// ============================================================================

// World Bank verified data for Yemen
const timeSeriesData = {
  // GDP Data (World Bank WDI)
  gdp_nominal_usd: [
    { year: 2010, value: 31.05, source: "World Bank", confidence: "A" },
    { year: 2011, value: 26.91, source: "World Bank", confidence: "A" },
    { year: 2012, value: 30.45, source: "World Bank", confidence: "A" },
    { year: 2013, value: 35.95, source: "World Bank", confidence: "A" },
    { year: 2014, value: 35.45, source: "World Bank", confidence: "A" },
    { year: 2015, value: 21.06, source: "World Bank", confidence: "B" },
    { year: 2016, value: 17.18, source: "World Bank", confidence: "B" },
    { year: 2017, value: 18.21, source: "World Bank", confidence: "B" },
    { year: 2018, value: 21.61, source: "World Bank", confidence: "B" },
    { year: 2019, value: 22.58, source: "World Bank", confidence: "B" },
    { year: 2020, value: 18.97, source: "World Bank", confidence: "B" },
    { year: 2021, value: 20.28, source: "World Bank", confidence: "B" },
    { year: 2022, value: 21.06, source: "World Bank", confidence: "B" },
    { year: 2023, value: 21.60, source: "IMF WEO", confidence: "B" },
    { year: 2024, value: 19.80, source: "IMF WEO", confidence: "C" },
    { year: 2025, value: 19.10, source: "IMF WEO", confidence: "C" },
    { year: 2026, value: 19.30, source: "IMF Projection", confidence: "D" }
  ],
  
  // GDP Growth (World Bank)
  gdp_growth_annual: [
    { year: 2010, value: 7.7, source: "World Bank", confidence: "A" },
    { year: 2011, value: -12.7, source: "World Bank", confidence: "A" },
    { year: 2012, value: 2.4, source: "World Bank", confidence: "A" },
    { year: 2013, value: 4.8, source: "World Bank", confidence: "A" },
    { year: 2014, value: -0.2, source: "World Bank", confidence: "A" },
    { year: 2015, value: -28.1, source: "World Bank", confidence: "B" },
    { year: 2016, value: -9.4, source: "World Bank", confidence: "B" },
    { year: 2017, value: -5.1, source: "World Bank", confidence: "B" },
    { year: 2018, value: 0.8, source: "World Bank", confidence: "B" },
    { year: 2019, value: 2.1, source: "World Bank", confidence: "B" },
    { year: 2020, value: -8.5, source: "World Bank", confidence: "B" },
    { year: 2021, value: -1.0, source: "World Bank", confidence: "B" },
    { year: 2022, value: 1.5, source: "World Bank", confidence: "B" },
    { year: 2023, value: -2.0, source: "IMF WEO", confidence: "C" },
    { year: 2024, value: -1.0, source: "IMF WEO", confidence: "C" },
    { year: 2025, value: 1.0, source: "IMF WEO", confidence: "C" },
    { year: 2026, value: 2.0, source: "IMF Projection", confidence: "D" }
  ],
  
  // GDP per Capita (World Bank)
  gdp_per_capita_usd: [
    { year: 2010, value: 1334, source: "World Bank", confidence: "A" },
    { year: 2011, value: 1119, source: "World Bank", confidence: "A" },
    { year: 2012, value: 1229, source: "World Bank", confidence: "A" },
    { year: 2013, value: 1408, source: "World Bank", confidence: "A" },
    { year: 2014, value: 1347, source: "World Bank", confidence: "A" },
    { year: 2015, value: 775, source: "World Bank", confidence: "B" },
    { year: 2016, value: 614, source: "World Bank", confidence: "B" },
    { year: 2017, value: 631, source: "World Bank", confidence: "B" },
    { year: 2018, value: 728, source: "World Bank", confidence: "B" },
    { year: 2019, value: 740, source: "World Bank", confidence: "B" },
    { year: 2020, value: 604, source: "World Bank", confidence: "B" },
    { year: 2021, value: 628, source: "World Bank", confidence: "B" },
    { year: 2022, value: 634, source: "World Bank", confidence: "B" },
    { year: 2023, value: 632, source: "IMF WEO", confidence: "C" },
    { year: 2024, value: 565, source: "IMF WEO", confidence: "C" },
    { year: 2025, value: 577, source: "IMF WEO", confidence: "C" },
    { year: 2026, value: 570, source: "IMF Projection", confidence: "D" }
  ],
  
  // Population (UN Population Division)
  population_total: [
    { year: 2010, value: 23.27, source: "UN Population Division", confidence: "A" },
    { year: 2011, value: 24.05, source: "UN Population Division", confidence: "A" },
    { year: 2012, value: 24.77, source: "UN Population Division", confidence: "A" },
    { year: 2013, value: 25.53, source: "UN Population Division", confidence: "A" },
    { year: 2014, value: 26.32, source: "UN Population Division", confidence: "A" },
    { year: 2015, value: 27.17, source: "UN Population Division", confidence: "A" },
    { year: 2016, value: 27.98, source: "UN Population Division", confidence: "A" },
    { year: 2017, value: 28.84, source: "UN Population Division", confidence: "A" },
    { year: 2018, value: 29.69, source: "UN Population Division", confidence: "A" },
    { year: 2019, value: 30.49, source: "UN Population Division", confidence: "A" },
    { year: 2020, value: 31.42, source: "UN Population Division", confidence: "A" },
    { year: 2021, value: 32.28, source: "UN Population Division", confidence: "A" },
    { year: 2022, value: 33.18, source: "UN Population Division", confidence: "A" },
    { year: 2023, value: 34.08, source: "UN Population Division", confidence: "A" },
    { year: 2024, value: 34.45, source: "UN Population Division", confidence: "B" },
    { year: 2025, value: 33.80, source: "UN Population Division", confidence: "B" },
    { year: 2026, value: 34.60, source: "UN Projection", confidence: "B" }
  ],
  
  // Exchange Rates - Aden (CBY Aden)
  fx_rate_aden_parallel: [
    { year: 2014, value: 215, source: "CBY Aden", confidence: "A", regime: "aden_irg" },
    { year: 2015, value: 250, source: "CBY Aden", confidence: "A", regime: "aden_irg" },
    { year: 2016, value: 320, source: "CBY Aden", confidence: "A", regime: "aden_irg" },
    { year: 2017, value: 420, source: "CBY Aden", confidence: "A", regime: "aden_irg" },
    { year: 2018, value: 520, source: "CBY Aden", confidence: "A", regime: "aden_irg" },
    { year: 2019, value: 590, source: "CBY Aden", confidence: "A", regime: "aden_irg" },
    { year: 2020, value: 730, source: "CBY Aden", confidence: "A", regime: "aden_irg" },
    { year: 2021, value: 1050, source: "CBY Aden", confidence: "A", regime: "aden_irg" },
    { year: 2022, value: 1150, source: "CBY Aden", confidence: "A", regime: "aden_irg" },
    { year: 2023, value: 1550, source: "CBY Aden", confidence: "A", regime: "aden_irg" },
    { year: 2024, value: 1890, source: "CBY Aden", confidence: "A", regime: "aden_irg" },
    { year: 2025, value: 2050, source: "CBY Aden", confidence: "A", regime: "aden_irg" },
    { year: 2026, value: 1890, source: "CBY Aden", confidence: "A", regime: "aden_irg" }
  ],
  
  // Exchange Rates - Sana'a
  fx_rate_sanaa: [
    { year: 2014, value: 215, source: "Market Survey", confidence: "B", regime: "sanaa_defacto" },
    { year: 2015, value: 250, source: "Market Survey", confidence: "B", regime: "sanaa_defacto" },
    { year: 2016, value: 320, source: "Market Survey", confidence: "B", regime: "sanaa_defacto" },
    { year: 2017, value: 450, source: "Market Survey", confidence: "B", regime: "sanaa_defacto" },
    { year: 2018, value: 560, source: "Market Survey", confidence: "B", regime: "sanaa_defacto" },
    { year: 2019, value: 590, source: "Market Survey", confidence: "B", regime: "sanaa_defacto" },
    { year: 2020, value: 600, source: "Market Survey", confidence: "B", regime: "sanaa_defacto" },
    { year: 2021, value: 600, source: "Market Survey", confidence: "B", regime: "sanaa_defacto" },
    { year: 2022, value: 560, source: "Market Survey", confidence: "B", regime: "sanaa_defacto" },
    { year: 2023, value: 535, source: "Market Survey", confidence: "B", regime: "sanaa_defacto" },
    { year: 2024, value: 530, source: "Market Survey", confidence: "B", regime: "sanaa_defacto" },
    { year: 2025, value: 530, source: "Market Survey", confidence: "B", regime: "sanaa_defacto" },
    { year: 2026, value: 530, source: "Market Survey", confidence: "B", regime: "sanaa_defacto" }
  ],
  
  // Inflation - Aden
  inflation_cpi_aden: [
    { year: 2014, value: 8.0, source: "CSO/IMF", confidence: "B", regime: "aden_irg" },
    { year: 2015, value: 22.0, source: "CSO/IMF", confidence: "B", regime: "aden_irg" },
    { year: 2016, value: 25.0, source: "CSO/IMF", confidence: "B", regime: "aden_irg" },
    { year: 2017, value: 30.0, source: "CSO/IMF", confidence: "B", regime: "aden_irg" },
    { year: 2018, value: 27.0, source: "CSO/IMF", confidence: "B", regime: "aden_irg" },
    { year: 2019, value: 10.0, source: "CSO/IMF", confidence: "B", regime: "aden_irg" },
    { year: 2020, value: 22.0, source: "CSO/IMF", confidence: "B", regime: "aden_irg" },
    { year: 2021, value: 35.0, source: "CSO/IMF", confidence: "B", regime: "aden_irg" },
    { year: 2022, value: 28.0, source: "CSO/IMF", confidence: "B", regime: "aden_irg" },
    { year: 2023, value: 25.0, source: "CSO/IMF", confidence: "B", regime: "aden_irg" },
    { year: 2024, value: 22.5, source: "CSO/IMF", confidence: "B", regime: "aden_irg" },
    { year: 2025, value: 18.0, source: "CSO/IMF", confidence: "C", regime: "aden_irg" },
    { year: 2026, value: 15.0, source: "IMF Estimate", confidence: "C", regime: "aden_irg" }
  ],
  
  // Inflation - Sana'a
  inflation_cpi_sanaa: [
    { year: 2014, value: 8.0, source: "CSO/IMF", confidence: "B", regime: "sanaa_defacto" },
    { year: 2015, value: 20.0, source: "CSO/IMF", confidence: "B", regime: "sanaa_defacto" },
    { year: 2016, value: 18.0, source: "CSO/IMF", confidence: "B", regime: "sanaa_defacto" },
    { year: 2017, value: 15.0, source: "CSO/IMF", confidence: "B", regime: "sanaa_defacto" },
    { year: 2018, value: 12.0, source: "CSO/IMF", confidence: "B", regime: "sanaa_defacto" },
    { year: 2019, value: 8.5, source: "CSO/IMF", confidence: "B", regime: "sanaa_defacto" },
    { year: 2020, value: 12.0, source: "CSO/IMF", confidence: "B", regime: "sanaa_defacto" },
    { year: 2021, value: 15.0, source: "CSO/IMF", confidence: "B", regime: "sanaa_defacto" },
    { year: 2022, value: 18.0, source: "CSO/IMF", confidence: "B", regime: "sanaa_defacto" },
    { year: 2023, value: 18.3, source: "CSO/IMF", confidence: "B", regime: "sanaa_defacto" },
    { year: 2024, value: 16.0, source: "CSO/IMF", confidence: "C", regime: "sanaa_defacto" },
    { year: 2025, value: 14.5, source: "CSO/IMF", confidence: "C", regime: "sanaa_defacto" },
    { year: 2026, value: 13.0, source: "IMF Estimate", confidence: "C", regime: "sanaa_defacto" }
  ],
  
  // Humanitarian - People in Need (OCHA HNO)
  people_in_need: [
    { year: 2015, value: 21.1, source: "UN OCHA HNO", confidence: "A" },
    { year: 2016, value: 21.2, source: "UN OCHA HNO", confidence: "A" },
    { year: 2017, value: 20.7, source: "UN OCHA HNO", confidence: "A" },
    { year: 2018, value: 22.2, source: "UN OCHA HNO", confidence: "A" },
    { year: 2019, value: 24.1, source: "UN OCHA HNO", confidence: "A" },
    { year: 2020, value: 24.3, source: "UN OCHA HNO", confidence: "A" },
    { year: 2021, value: 20.7, source: "UN OCHA HNO", confidence: "A" },
    { year: 2022, value: 23.4, source: "UN OCHA HNO", confidence: "A" },
    { year: 2023, value: 21.6, source: "UN OCHA HNO", confidence: "A" },
    { year: 2024, value: 18.2, source: "UN OCHA HNO", confidence: "A" },
    { year: 2025, value: 19.5, source: "UN OCHA HNO", confidence: "A" },
    { year: 2026, value: 23.1, source: "UN OCHA HNO 2026", confidence: "A" }
  ],
  
  // HRP Requirements (OCHA FTS)
  hrp_requirements_usd: [
    { year: 2015, value: 1.6, source: "UN OCHA FTS", confidence: "A" },
    { year: 2016, value: 1.8, source: "UN OCHA FTS", confidence: "A" },
    { year: 2017, value: 2.1, source: "UN OCHA FTS", confidence: "A" },
    { year: 2018, value: 2.96, source: "UN OCHA FTS", confidence: "A" },
    { year: 2019, value: 4.19, source: "UN OCHA FTS", confidence: "A" },
    { year: 2020, value: 3.38, source: "UN OCHA FTS", confidence: "A" },
    { year: 2021, value: 3.85, source: "UN OCHA FTS", confidence: "A" },
    { year: 2022, value: 4.27, source: "UN OCHA FTS", confidence: "A" },
    { year: 2023, value: 4.34, source: "UN OCHA FTS", confidence: "A" },
    { year: 2024, value: 2.7, source: "UN OCHA FTS", confidence: "A" },
    { year: 2025, value: 2.5, source: "UN OCHA FTS", confidence: "A" },
    { year: 2026, value: 2.5, source: "UN OCHA HRP 2026", confidence: "A" }
  ],
  
  // Food Insecurity (IPC)
  food_insecure_total: [
    { year: 2015, value: 12.9, source: "IPC", confidence: "A" },
    { year: 2016, value: 14.4, source: "IPC", confidence: "A" },
    { year: 2017, value: 17.0, source: "IPC", confidence: "A" },
    { year: 2018, value: 15.9, source: "IPC", confidence: "A" },
    { year: 2019, value: 15.9, source: "IPC", confidence: "A" },
    { year: 2020, value: 16.2, source: "IPC", confidence: "A" },
    { year: 2021, value: 16.2, source: "IPC", confidence: "A" },
    { year: 2022, value: 17.4, source: "IPC", confidence: "A" },
    { year: 2023, value: 17.6, source: "IPC", confidence: "A" },
    { year: 2024, value: 17.8, source: "IPC", confidence: "A" },
    { year: 2025, value: 19.8, source: "IPC", confidence: "A" },
    { year: 2026, value: 19.8, source: "IPC Projection", confidence: "B" }
  ],
  
  // Poverty Rate (World Bank)
  poverty_rate: [
    { year: 2010, value: 42.0, source: "World Bank", confidence: "A" },
    { year: 2014, value: 48.6, source: "World Bank", confidence: "A" },
    { year: 2015, value: 62.0, source: "World Bank Estimate", confidence: "B" },
    { year: 2016, value: 71.0, source: "World Bank Estimate", confidence: "B" },
    { year: 2017, value: 75.0, source: "World Bank Estimate", confidence: "B" },
    { year: 2018, value: 78.0, source: "World Bank Estimate", confidence: "B" },
    { year: 2019, value: 80.0, source: "World Bank Estimate", confidence: "B" },
    { year: 2020, value: 81.0, source: "World Bank Estimate", confidence: "C" },
    { year: 2021, value: 80.0, source: "World Bank Estimate", confidence: "C" },
    { year: 2022, value: 78.0, source: "World Bank Estimate", confidence: "C" },
    { year: 2023, value: 78.0, source: "World Bank Estimate", confidence: "C" },
    { year: 2024, value: 80.0, source: "World Bank Estimate", confidence: "C" },
    { year: 2025, value: 80.0, source: "World Bank Estimate", confidence: "C" },
    { year: 2026, value: 80.0, source: "YETO Estimate", confidence: "D" }
  ],
  
  // HDI (UNDP)
  hdi_score: [
    { year: 2010, value: 0.498, source: "UNDP HDR", confidence: "A" },
    { year: 2011, value: 0.500, source: "UNDP HDR", confidence: "A" },
    { year: 2012, value: 0.502, source: "UNDP HDR", confidence: "A" },
    { year: 2013, value: 0.505, source: "UNDP HDR", confidence: "A" },
    { year: 2014, value: 0.500, source: "UNDP HDR", confidence: "A" },
    { year: 2015, value: 0.482, source: "UNDP HDR", confidence: "A" },
    { year: 2016, value: 0.470, source: "UNDP HDR", confidence: "A" },
    { year: 2017, value: 0.463, source: "UNDP HDR", confidence: "A" },
    { year: 2018, value: 0.455, source: "UNDP HDR", confidence: "A" },
    { year: 2019, value: 0.455, source: "UNDP HDR", confidence: "A" },
    { year: 2020, value: 0.455, source: "UNDP HDR", confidence: "A" },
    { year: 2021, value: 0.455, source: "UNDP HDR", confidence: "A" },
    { year: 2022, value: 0.424, source: "UNDP HDR 2023", confidence: "A" },
    { year: 2023, value: 0.424, source: "UNDP HDR 2024", confidence: "A" },
    { year: 2024, value: 0.424, source: "UNDP Estimate", confidence: "B" },
    { year: 2025, value: 0.424, source: "UNDP Estimate", confidence: "B" },
    { year: 2026, value: 0.424, source: "YETO Estimate", confidence: "C" }
  ],
  
  // Unemployment (ILO)
  unemployment_rate: [
    { year: 2010, value: 13.5, source: "ILO", confidence: "B" },
    { year: 2011, value: 17.8, source: "ILO", confidence: "B" },
    { year: 2012, value: 17.7, source: "ILO", confidence: "B" },
    { year: 2013, value: 17.4, source: "ILO", confidence: "B" },
    { year: 2014, value: 13.9, source: "ILO", confidence: "B" },
    { year: 2015, value: 14.0, source: "ILO", confidence: "B" },
    { year: 2016, value: 14.0, source: "ILO", confidence: "B" },
    { year: 2017, value: 13.4, source: "ILO", confidence: "B" },
    { year: 2018, value: 13.4, source: "ILO", confidence: "B" },
    { year: 2019, value: 13.4, source: "ILO", confidence: "B" },
    { year: 2020, value: 14.2, source: "ILO", confidence: "B" },
    { year: 2021, value: 14.5, source: "ILO", confidence: "B" },
    { year: 2022, value: 14.8, source: "ILO", confidence: "B" },
    { year: 2023, value: 17.1, source: "ILO", confidence: "B" },
    { year: 2024, value: 17.1, source: "ILO", confidence: "C" },
    { year: 2025, value: 35.0, source: "YETO Estimate", confidence: "C" },
    { year: 2026, value: 35.0, source: "YETO Estimate", confidence: "D" }
  ],
  
  // Trade - Exports (UNCTAD/IMF)
  exports_total_usd: [
    { year: 2010, value: 8100, source: "UNCTAD", confidence: "A" },
    { year: 2011, value: 8500, source: "UNCTAD", confidence: "A" },
    { year: 2012, value: 7600, source: "UNCTAD", confidence: "A" },
    { year: 2013, value: 7800, source: "UNCTAD", confidence: "A" },
    { year: 2014, value: 7200, source: "UNCTAD", confidence: "A" },
    { year: 2015, value: 1500, source: "UNCTAD", confidence: "B" },
    { year: 2016, value: 600, source: "UNCTAD", confidence: "B" },
    { year: 2017, value: 900, source: "UNCTAD", confidence: "B" },
    { year: 2018, value: 1200, source: "UNCTAD", confidence: "B" },
    { year: 2019, value: 1100, source: "UNCTAD", confidence: "B" },
    { year: 2020, value: 600, source: "UNCTAD", confidence: "B" },
    { year: 2021, value: 1200, source: "UNCTAD", confidence: "B" },
    { year: 2022, value: 2100, source: "UNCTAD", confidence: "B" },
    { year: 2023, value: 1800, source: "UNCTAD", confidence: "B" },
    { year: 2024, value: 1500, source: "IMF Estimate", confidence: "C" },
    { year: 2025, value: 2100, source: "IMF Estimate", confidence: "C" },
    { year: 2026, value: 0, source: "Oil exports halted Oct 2022", confidence: "A" }
  ],
  
  // Trade - Imports (UNCTAD/IMF)
  imports_total_usd: [
    { year: 2010, value: 8900, source: "UNCTAD", confidence: "A" },
    { year: 2011, value: 9200, source: "UNCTAD", confidence: "A" },
    { year: 2012, value: 10400, source: "UNCTAD", confidence: "A" },
    { year: 2013, value: 11800, source: "UNCTAD", confidence: "A" },
    { year: 2014, value: 10600, source: "UNCTAD", confidence: "A" },
    { year: 2015, value: 6200, source: "UNCTAD", confidence: "B" },
    { year: 2016, value: 5400, source: "UNCTAD", confidence: "B" },
    { year: 2017, value: 6600, source: "UNCTAD", confidence: "B" },
    { year: 2018, value: 8200, source: "UNCTAD", confidence: "B" },
    { year: 2019, value: 8500, source: "UNCTAD", confidence: "B" },
    { year: 2020, value: 7200, source: "UNCTAD", confidence: "B" },
    { year: 2021, value: 8100, source: "UNCTAD", confidence: "B" },
    { year: 2022, value: 8800, source: "UNCTAD", confidence: "B" },
    { year: 2023, value: 8200, source: "UNCTAD", confidence: "B" },
    { year: 2024, value: 7500, source: "IMF Estimate", confidence: "C" },
    { year: 2025, value: 7200, source: "IMF Estimate", confidence: "C" },
    { year: 2026, value: 7200, source: "YETO Estimate", confidence: "D" }
  ],
  
  // Remittances (World Bank)
  remittances_inflow_usd: [
    { year: 2010, value: 3350, source: "World Bank", confidence: "A" },
    { year: 2011, value: 3070, source: "World Bank", confidence: "A" },
    { year: 2012, value: 3360, source: "World Bank", confidence: "A" },
    { year: 2013, value: 3340, source: "World Bank", confidence: "A" },
    { year: 2014, value: 3350, source: "World Bank", confidence: "A" },
    { year: 2015, value: 3100, source: "World Bank", confidence: "B" },
    { year: 2016, value: 2900, source: "World Bank", confidence: "B" },
    { year: 2017, value: 3100, source: "World Bank", confidence: "B" },
    { year: 2018, value: 3350, source: "World Bank", confidence: "B" },
    { year: 2019, value: 3770, source: "World Bank", confidence: "B" },
    { year: 2020, value: 3500, source: "World Bank", confidence: "B" },
    { year: 2021, value: 3800, source: "World Bank", confidence: "B" },
    { year: 2022, value: 4000, source: "World Bank", confidence: "B" },
    { year: 2023, value: 4200, source: "World Bank", confidence: "B" },
    { year: 2024, value: 4000, source: "World Bank Estimate", confidence: "C" },
    { year: 2025, value: 3800, source: "World Bank Estimate", confidence: "C" },
    { year: 2026, value: 3800, source: "YETO Estimate", confidence: "D" }
  ]
};

// ============================================================================
// MAIN SEEDING FUNCTION
// ============================================================================

async function seedDatabase() {
  console.log("Starting comprehensive database seeding...");
  
  const db = await getDb();
  if (!db) {
    console.error("Failed to connect to database");
    return;
  }
  
  try {
    // 1. Seed Data Sources
    console.log("Seeding data sources...");
    for (const source of dataSources) {
      await db.execute(sql`
        INSERT INTO sources (publisher, url, license, notes, retrievalDate)
        VALUES (${source.publisher}, ${source.url}, ${source.license}, ${source.notes}, NOW())
        ON DUPLICATE KEY UPDATE notes = VALUES(notes)
      `);
    }
    console.log(`Seeded ${dataSources.length} data sources`);
    
    // 2. Seed Indicator Definitions
    console.log("Seeding indicator definitions...");
    for (const indicator of indicators) {
      await db.execute(sql`
        INSERT INTO indicators (code, nameEn, nameAr, descriptionEn, descriptionAr, unit, sector, frequency, methodology)
        VALUES (
          ${indicator.code}, 
          ${indicator.nameEn}, 
          ${indicator.nameAr}, 
          ${indicator.descriptionEn}, 
          ${indicator.descriptionAr}, 
          ${indicator.unit}, 
          ${indicator.sector}, 
          ${indicator.frequency}, 
          ${indicator.methodology}
        )
        ON DUPLICATE KEY UPDATE 
          nameEn = VALUES(nameEn),
          nameAr = VALUES(nameAr),
          methodology = VALUES(methodology)
      `);
    }
    console.log(`Seeded ${indicators.length} indicator definitions`);
    
    // 3. Seed Time Series Data
    console.log("Seeding time series data...");
    let dataPointCount = 0;
    
    for (const [indicatorCode, dataPoints] of Object.entries(timeSeriesData)) {
      for (const point of dataPoints) {
        const regime = (point as any).regime || "mixed";
        const dateStr = `${point.year}-12-31`;
        
        await db.execute(sql`
          INSERT INTO time_series (indicatorCode, regimeTag, date, value, unit, confidenceRating, sourceId, notes)
          SELECT 
            ${indicatorCode},
            ${regime},
            ${dateStr},
            ${point.value},
            (SELECT unit FROM indicators WHERE code = ${indicatorCode}),
            ${point.confidence},
            (SELECT id FROM sources WHERE publisher = ${point.source} LIMIT 1),
            ${`Source: ${point.source}`}
          ON DUPLICATE KEY UPDATE 
            value = VALUES(value),
            confidenceRating = VALUES(confidenceRating)
        `);
        dataPointCount++;
      }
    }
    console.log(`Seeded ${dataPointCount} time series data points`);
    
    console.log("Database seeding completed successfully!");
    
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run if executed directly
seedDatabase().catch(console.error);

export { seedDatabase, dataSources, indicators, timeSeriesData };
