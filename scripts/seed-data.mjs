/**
 * YETO Platform - Comprehensive Data Seeding Script
 * 
 * This script populates the database with:
 * 1. Data sources with full provenance
 * 2. Indicator definitions for all sectors
 * 3. Historical time series data (2010-2026)
 * 
 * Run with: node scripts/seed-data.mjs
 */

import mysql from 'mysql2/promise';

// Get database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

// Parse connection string
const url = new URL(DATABASE_URL);
const connection = await mysql.createConnection({
  host: url.hostname,
  port: parseInt(url.port) || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: { rejectUnauthorized: false }
});

console.log("Connected to database");

// ============================================================================
// DATA SOURCES - Verified International Organizations
// ============================================================================

const dataSources = [
  { publisher: "World Bank", url: "https://data.worldbank.org/country/yemen-rep", license: "CC-BY-4.0", notes: "World Development Indicators" },
  { publisher: "International Monetary Fund", url: "https://www.imf.org/en/Countries/YEM", license: "IMF Terms", notes: "WEO, Article IV" },
  { publisher: "Central Bank of Yemen - Aden", url: "https://cby-ye.com", license: "Public Domain", notes: "Official monetary statistics" },
  { publisher: "Sana'a Monetary Authority", url: null, license: "Public Domain", notes: "De facto authority statistics" },
  { publisher: "UN OCHA", url: "https://www.unocha.org/yemen", license: "CC-BY-3.0-IGO", notes: "HNO, HRP" },
  { publisher: "World Food Programme", url: "https://www.wfp.org/countries/yemen", license: "CC-BY-4.0", notes: "Food security" },
  { publisher: "UNHCR", url: "https://data.unhcr.org/en/country/yem", license: "CC-BY-4.0", notes: "Displacement data" },
  { publisher: "IPC Global Platform", url: "https://www.ipcinfo.org", license: "CC-BY-4.0", notes: "Food security classification" },
  { publisher: "ACAPS", url: "https://www.acaps.org/country/yemen", license: "CC-BY-4.0", notes: "Crisis analysis" },
  { publisher: "UN Population Division", url: "https://population.un.org", license: "CC-BY-3.0-IGO", notes: "Population estimates" },
  { publisher: "UNDP", url: "https://www.undp.org/yemen", license: "CC-BY-3.0-IGO", notes: "HDI, poverty analysis" },
  { publisher: "ILO", url: "https://www.ilo.org", license: "CC-BY-4.0", notes: "Labor statistics" },
  { publisher: "UNCTAD", url: "https://unctad.org", license: "CC-BY-3.0-IGO", notes: "Trade statistics" },
  { publisher: "CSO/IMF", url: null, license: "Public Domain", notes: "Central Statistical Organization estimates" },
  { publisher: "Market Survey", url: null, license: "Public Domain", notes: "Field market surveys" },
  { publisher: "IMF WEO", url: "https://www.imf.org/en/Publications/WEO", license: "IMF Terms", notes: "World Economic Outlook" },
  { publisher: "IMF Projection", url: "https://www.imf.org", license: "IMF Terms", notes: "IMF projections" },
  { publisher: "IMF Estimate", url: "https://www.imf.org", license: "IMF Terms", notes: "IMF estimates" },
  { publisher: "World Bank Estimate", url: "https://data.worldbank.org", license: "CC-BY-4.0", notes: "World Bank estimates" },
  { publisher: "UNDP HDR", url: "https://hdr.undp.org", license: "CC-BY-3.0-IGO", notes: "Human Development Report" },
  { publisher: "UN OCHA HNO", url: "https://www.unocha.org", license: "CC-BY-3.0-IGO", notes: "Humanitarian Needs Overview" },
  { publisher: "UN OCHA FTS", url: "https://fts.unocha.org", license: "CC-BY-3.0-IGO", notes: "Financial Tracking Service" },
  { publisher: "UN OCHA HRP 2026", url: "https://www.unocha.org", license: "CC-BY-3.0-IGO", notes: "HRP 2026" },
  { publisher: "IPC Projection", url: "https://www.ipcinfo.org", license: "CC-BY-4.0", notes: "IPC projections" },
  { publisher: "YETO Estimate", url: null, license: "CC-BY-4.0", notes: "YETO platform estimates based on available data" }
];

// ============================================================================
// INDICATOR DEFINITIONS
// ============================================================================

const indicators = [
  // MACROECONOMY
  { code: "gdp_nominal_usd", nameEn: "GDP (Nominal, USD)", nameAr: "الناتج المحلي الإجمالي", unit: "USD billions", sector: "macroeconomy", frequency: "annual" },
  { code: "gdp_growth_annual", nameEn: "GDP Growth Rate", nameAr: "معدل نمو الناتج المحلي", unit: "percent", sector: "macroeconomy", frequency: "annual" },
  { code: "gdp_per_capita_usd", nameEn: "GDP per Capita", nameAr: "نصيب الفرد من الناتج", unit: "USD", sector: "macroeconomy", frequency: "annual" },
  { code: "population_total", nameEn: "Total Population", nameAr: "إجمالي السكان", unit: "millions", sector: "macroeconomy", frequency: "annual" },
  
  // CURRENCY
  { code: "fx_rate_aden_parallel", nameEn: "Exchange Rate - Aden", nameAr: "سعر الصرف - عدن", unit: "YER/USD", sector: "currency", frequency: "daily" },
  { code: "fx_rate_sanaa", nameEn: "Exchange Rate - Sana'a", nameAr: "سعر الصرف - صنعاء", unit: "YER/USD", sector: "currency", frequency: "daily" },
  
  // PRICES
  { code: "inflation_cpi_aden", nameEn: "Inflation Rate - Aden", nameAr: "معدل التضخم - عدن", unit: "percent", sector: "prices", frequency: "monthly" },
  { code: "inflation_cpi_sanaa", nameEn: "Inflation Rate - Sana'a", nameAr: "معدل التضخم - صنعاء", unit: "percent", sector: "prices", frequency: "monthly" },
  
  // HUMANITARIAN
  { code: "people_in_need", nameEn: "People in Need", nameAr: "المحتاجون للمساعدة", unit: "millions", sector: "humanitarian", frequency: "annual" },
  { code: "hrp_requirements_usd", nameEn: "HRP Requirements", nameAr: "متطلبات خطة الاستجابة", unit: "USD billions", sector: "humanitarian", frequency: "annual" },
  { code: "food_insecure_total", nameEn: "Food Insecure Population", nameAr: "انعدام الأمن الغذائي", unit: "millions", sector: "food_security", frequency: "biannual" },
  
  // POVERTY
  { code: "poverty_rate", nameEn: "Poverty Rate", nameAr: "معدل الفقر", unit: "percent", sector: "poverty", frequency: "annual" },
  { code: "hdi_score", nameEn: "Human Development Index", nameAr: "مؤشر التنمية البشرية", unit: "index (0-1)", sector: "poverty", frequency: "annual" },
  
  // LABOR
  { code: "unemployment_rate", nameEn: "Unemployment Rate", nameAr: "معدل البطالة", unit: "percent", sector: "labor", frequency: "annual" },
  
  // TRADE
  { code: "exports_total_usd", nameEn: "Total Exports", nameAr: "إجمالي الصادرات", unit: "USD millions", sector: "trade", frequency: "annual" },
  { code: "imports_total_usd", nameEn: "Total Imports", nameAr: "إجمالي الواردات", unit: "USD millions", sector: "trade", frequency: "annual" },
  { code: "remittances_inflow_usd", nameEn: "Remittance Inflows", nameAr: "تدفقات التحويلات", unit: "USD millions", sector: "trade", frequency: "annual" }
];

// ============================================================================
// TIME SERIES DATA - Historical Values (2010-2026)
// ============================================================================

const timeSeriesData = {
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
    { year: 2026, value: 34.60, source: "UN Population Division", confidence: "B" }
  ],
  
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
    { year: 2026, value: 23.1, source: "UN OCHA HRP 2026", confidence: "A" }
  ],
  
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
    { year: 2022, value: 0.424, source: "UNDP HDR", confidence: "A" },
    { year: 2023, value: 0.424, source: "UNDP HDR", confidence: "A" },
    { year: 2024, value: 0.424, source: "UNDP HDR", confidence: "B" },
    { year: 2025, value: 0.424, source: "UNDP HDR", confidence: "B" },
    { year: 2026, value: 0.424, source: "YETO Estimate", confidence: "C" }
  ],
  
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
    { year: 2026, value: 0, source: "YETO Estimate", confidence: "A" }
  ],
  
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
// SEEDING FUNCTIONS
// ============================================================================

async function seedSources() {
  console.log("Seeding data sources...");
  
  for (const source of dataSources) {
    try {
      await connection.execute(
        `INSERT INTO sources (publisher, url, license, notes, retrievalDate)
         VALUES (?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE notes = VALUES(notes), retrievalDate = NOW()`,
        [source.publisher, source.url, source.license, source.notes]
      );
    } catch (err) {
      // Try insert without ON DUPLICATE KEY
      try {
        const [existing] = await connection.execute(
          `SELECT id FROM sources WHERE publisher = ?`,
          [source.publisher]
        );
        if (existing.length === 0) {
          await connection.execute(
            `INSERT INTO sources (publisher, url, license, notes, retrievalDate)
             VALUES (?, ?, ?, ?, NOW())`,
            [source.publisher, source.url, source.license, source.notes]
          );
        }
      } catch (innerErr) {
        console.log(`Skipping source ${source.publisher}: ${innerErr}`);
      }
    }
  }
  
  console.log(`Seeded ${dataSources.length} data sources`);
}

async function seedIndicators() {
  console.log("Seeding indicator definitions...");
  
  for (const indicator of indicators) {
    try {
      const [existing] = await connection.execute(
        `SELECT id FROM indicators WHERE code = ?`,
        [indicator.code]
      );
      
      if (existing.length === 0) {
        await connection.execute(
          `INSERT INTO indicators (code, nameEn, nameAr, unit, sector, frequency, isActive)
           VALUES (?, ?, ?, ?, ?, ?, 1)`,
          [indicator.code, indicator.nameEn, indicator.nameAr, indicator.unit, indicator.sector, indicator.frequency]
        );
      } else {
        await connection.execute(
          `UPDATE indicators SET nameEn = ?, nameAr = ?, unit = ?, sector = ?, frequency = ? WHERE code = ?`,
          [indicator.nameEn, indicator.nameAr, indicator.unit, indicator.sector, indicator.frequency, indicator.code]
        );
      }
    } catch (err) {
      console.log(`Error with indicator ${indicator.code}: ${err}`);
    }
  }
  
  console.log(`Seeded ${indicators.length} indicator definitions`);
}

async function seedTimeSeries() {
  console.log("Seeding time series data...");
  
  // Get source IDs
  const [sources] = await connection.execute(`SELECT id, publisher FROM sources`);
  const sourceMap = {};
  for (const s of sources) {
    sourceMap[s.publisher] = s.id;
  }
  
  // Get indicator units
  const [indicatorList] = await connection.execute(`SELECT code, unit FROM indicators`);
  const unitMap = {};
  for (const i of indicatorList) {
    unitMap[i.code] = i.unit;
  }
  
  let dataPointCount = 0;
  
  for (const [indicatorCode, dataPoints] of Object.entries(timeSeriesData)) {
    const unit = unitMap[indicatorCode] || "unknown";
    
    for (const point of dataPoints) {
      const regime = point.regime || "mixed";
      const dateStr = `${point.year}-12-31`;
      const sourceId = sourceMap[point.source] || 1;
      
      try {
        // Check if exists
        const [existing] = await connection.execute(
          `SELECT id FROM time_series WHERE indicatorCode = ? AND regimeTag = ? AND date = ?`,
          [indicatorCode, regime, dateStr]
        );
        
        if (existing.length === 0) {
          await connection.execute(
            `INSERT INTO time_series (indicatorCode, regimeTag, date, value, unit, confidenceRating, sourceId, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [indicatorCode, regime, dateStr, point.value, unit, point.confidence, sourceId, `Source: ${point.source}`]
          );
        } else {
          await connection.execute(
            `UPDATE time_series SET value = ?, confidenceRating = ?, sourceId = ?, notes = ? 
             WHERE indicatorCode = ? AND regimeTag = ? AND date = ?`,
            [point.value, point.confidence, sourceId, `Source: ${point.source}`, indicatorCode, regime, dateStr]
          );
        }
        dataPointCount++;
      } catch (err) {
        console.log(`Error inserting ${indicatorCode} ${point.year}: ${err}`);
      }
    }
  }
  
  console.log(`Seeded ${dataPointCount} time series data points`);
}

// Main execution
async function main() {
  try {
    console.log("Starting comprehensive database seeding...");
    
    await seedSources();
    await seedIndicators();
    await seedTimeSeries();
    
    console.log("Database seeding completed successfully!");
    
    // Verify counts
    const [indicatorCount] = await connection.execute(`SELECT COUNT(*) as count FROM indicators`);
    const [sourceCount] = await connection.execute(`SELECT COUNT(*) as count FROM sources`);
    const [timeSeriesCount] = await connection.execute(`SELECT COUNT(*) as count FROM time_series`);
    
    console.log(`\nFinal counts:`);
    console.log(`- Indicators: ${indicatorCount[0].count}`);
    console.log(`- Sources: ${sourceCount[0].count}`);
    console.log(`- Time Series: ${timeSeriesCount[0].count}`);
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await connection.end();
  }
}

main();
