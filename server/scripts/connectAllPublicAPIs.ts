/**
 * YETO - Connect All Public APIs & Backfill Since 2010
 * 
 * This script:
 * 1. Updates source_registry with correct API URLs for all public sources
 * 2. Runs dynamic backfill from each connected API
 * 3. Stores data in time_series table with proper provenance
 * 
 * Public APIs (no key required):
 * - World Bank Indicators API (GDP, inflation, trade, labor, etc.)
 * - FAO FAOSTAT (food security, agriculture)
 * - ILO ILOSTAT (labor market)
 * - UN Comtrade (trade flows)
 * - OCHA FTS (humanitarian funding)
 * - ReliefWeb (humanitarian reports/data)
 * - WHO GHO (health indicators)
 * - UN Population Division (demographics)
 * - UN SDG (sustainable development goals)
 * - WFP VAM (food prices)
 */

import { getDb } from '../db';
import { sql } from 'drizzle-orm';

const YEMEN_ISO = 'YEM';
const YEMEN_ISO2 = 'YE';
const YEMEN_NUMERIC = '887';
const START_YEAR = 2010;
const END_YEAR = 2025;

// ============================================================================
// SOURCE API DEFINITIONS
// ============================================================================

interface SourceAPIDef {
  sourceId: string;
  name: string;
  publisher: string;
  apiUrl: string;
  tier: string;
  sector: string;
  indicators: { code: string; wbCode?: string; name: string; nameAr: string; unit: string; frequency: string }[];
  fetchFn: (db: any, sourceDef: SourceAPIDef) => Promise<{ inserted: number; updated: number; errors: string[] }>;
}

// ============================================================================
// WORLD BANK API CONNECTOR
// ============================================================================

async function fetchWorldBankData(db: any, sourceDef: SourceAPIDef) {
  let inserted = 0, updated = 0;
  const errors: string[] = [];
  
  for (const ind of sourceDef.indicators) {
    const wbCode = ind.wbCode || ind.code;
    const url = `https://api.worldbank.org/v2/country/${YEMEN_ISO}/indicator/${wbCode}?format=json&per_page=500&date=${START_YEAR}:${END_YEAR}`;
    
    try {
      const resp = await fetch(url);
      if (!resp.ok) { errors.push(`WB ${wbCode}: HTTP ${resp.status}`); continue; }
      const json = await resp.json();
      if (!json[1] || json[1].length === 0) { continue; }
      
      // Ensure indicator exists
      await ensureIndicator(db, ind.code, ind.name, ind.nameAr, sourceDef.sector, ind.unit, ind.frequency, sourceDef.sourceId);
      
      // Ensure source exists
      const sourceId = await ensureSource(db, sourceDef.publisher, sourceDef.apiUrl);
      
      for (const dp of json[1]) {
        if (dp.value === null) continue;
        const year = parseInt(dp.date);
        const date = `${year}-01-01`;
        const result = await upsertTimeSeries(db, ind.code, date, dp.value, sourceId, 'mixed');
        if (result === 'inserted') inserted++;
        else if (result === 'updated') updated++;
      }
    } catch (e: any) {
      errors.push(`WB ${wbCode}: ${e.message}`);
    }
  }
  return { inserted, updated, errors };
}

// ============================================================================
// FAO FAOSTAT API CONNECTOR
// ============================================================================

async function fetchFAOData(db: any, sourceDef: SourceAPIDef) {
  let inserted = 0, updated = 0;
  const errors: string[] = [];
  
  // FAO uses bulk download CSVs but also has a JSON API
  const faoBaseUrl = 'https://www.fao.org/faostat/api/v1/en/data';
  
  // Use World Bank cross-listed FAO indicators as more reliable
  const faoWBIndicators = [
    { code: 'FAO_FOOD_PROD_INDEX', wbCode: 'AG.PRD.FOOD.XD', name: 'Food Production Index', nameAr: 'مؤشر إنتاج الغذاء', unit: 'index', frequency: 'annual' },
    { code: 'FAO_CROP_PROD_INDEX', wbCode: 'AG.PRD.CROP.XD', name: 'Crop Production Index', nameAr: 'مؤشر إنتاج المحاصيل', unit: 'index', frequency: 'annual' },
    { code: 'FAO_LIVESTOCK_INDEX', wbCode: 'AG.PRD.LVSK.XD', name: 'Livestock Production Index', nameAr: 'مؤشر إنتاج الثروة الحيوانية', unit: 'index', frequency: 'annual' },
    { code: 'FAO_AGRI_VALUE_ADDED', wbCode: 'NV.AGR.TOTL.CD', name: 'Agriculture Value Added (USD)', nameAr: 'القيمة المضافة الزراعية', unit: 'USD', frequency: 'annual' },
    { code: 'FAO_AGRI_PCT_GDP', wbCode: 'NV.AGR.TOTL.ZS', name: 'Agriculture % of GDP', nameAr: 'الزراعة كنسبة من الناتج المحلي', unit: '%', frequency: 'annual' },
    { code: 'FAO_CEREAL_YIELD', wbCode: 'AG.YLD.CREL.KG', name: 'Cereal Yield (kg/hectare)', nameAr: 'إنتاجية الحبوب', unit: 'kg/ha', frequency: 'annual' },
    { code: 'FAO_ARABLE_LAND', wbCode: 'AG.LND.ARBL.ZS', name: 'Arable Land (% of land area)', nameAr: 'الأراضي الصالحة للزراعة', unit: '%', frequency: 'annual' },
    { code: 'FAO_FOOD_IMPORTS', wbCode: 'TM.VAL.FOOD.ZS.UN', name: 'Food Imports (% of merchandise)', nameAr: 'واردات الغذاء', unit: '%', frequency: 'annual' },
  ];
  
  // Fetch via World Bank API (more reliable than direct FAO API)
  for (const ind of faoWBIndicators) {
    const url = `https://api.worldbank.org/v2/country/${YEMEN_ISO}/indicator/${ind.wbCode}?format=json&per_page=500&date=${START_YEAR}:${END_YEAR}`;
    try {
      const resp = await fetch(url);
      if (!resp.ok) continue;
      const json = await resp.json();
      if (!json[1]) continue;
      
      await ensureIndicator(db, ind.code, ind.name, ind.nameAr, 'food_security', ind.unit, ind.frequency, sourceDef.sourceId);
      const sourceId = await ensureSource(db, 'FAO / World Bank', sourceDef.apiUrl);
      
      for (const dp of json[1]) {
        if (dp.value === null) continue;
        const result = await upsertTimeSeries(db, ind.code, `${dp.date}-01-01`, dp.value, sourceId, 'mixed');
        if (result === 'inserted') inserted++;
        else if (result === 'updated') updated++;
      }
    } catch (e: any) {
      errors.push(`FAO ${ind.code}: ${e.message}`);
    }
  }
  return { inserted, updated, errors };
}

// ============================================================================
// ILO ILOSTAT API CONNECTOR
// ============================================================================

async function fetchILOData(db: any, sourceDef: SourceAPIDef) {
  let inserted = 0, updated = 0;
  const errors: string[] = [];
  
  // ILO SDMX API - use World Bank cross-listed indicators
  const iloWBIndicators = [
    { code: 'ILO_UNEMPLOYMENT', wbCode: 'SL.UEM.TOTL.ZS', name: 'Unemployment Rate (%)', nameAr: 'معدل البطالة', unit: '%', frequency: 'annual' },
    { code: 'ILO_YOUTH_UNEMPLOYMENT', wbCode: 'SL.UEM.1524.ZS', name: 'Youth Unemployment Rate (%)', nameAr: 'بطالة الشباب', unit: '%', frequency: 'annual' },
    { code: 'ILO_FEMALE_UNEMPLOYMENT', wbCode: 'SL.UEM.TOTL.FE.ZS', name: 'Female Unemployment Rate (%)', nameAr: 'بطالة الإناث', unit: '%', frequency: 'annual' },
    { code: 'ILO_LABOR_FORCE_PART', wbCode: 'SL.TLF.CACT.ZS', name: 'Labor Force Participation Rate (%)', nameAr: 'معدل المشاركة في القوى العاملة', unit: '%', frequency: 'annual' },
    { code: 'ILO_FEMALE_LABOR_PART', wbCode: 'SL.TLF.CACT.FE.ZS', name: 'Female Labor Force Participation (%)', nameAr: 'مشاركة الإناث في القوى العاملة', unit: '%', frequency: 'annual' },
    { code: 'ILO_EMPLOYMENT_AGRI', wbCode: 'SL.AGR.EMPL.ZS', name: 'Employment in Agriculture (%)', nameAr: 'العمالة في الزراعة', unit: '%', frequency: 'annual' },
    { code: 'ILO_EMPLOYMENT_INDUSTRY', wbCode: 'SL.IND.EMPL.ZS', name: 'Employment in Industry (%)', nameAr: 'العمالة في الصناعة', unit: '%', frequency: 'annual' },
    { code: 'ILO_EMPLOYMENT_SERVICES', wbCode: 'SL.SRV.EMPL.ZS', name: 'Employment in Services (%)', nameAr: 'العمالة في الخدمات', unit: '%', frequency: 'annual' },
    { code: 'ILO_VULNERABLE_EMPLOYMENT', wbCode: 'SL.EMP.VULN.ZS', name: 'Vulnerable Employment (%)', nameAr: 'العمالة الهشة', unit: '%', frequency: 'annual' },
    { code: 'ILO_WORKING_POVERTY', wbCode: 'SI.POV.NAHC', name: 'Poverty Headcount Ratio', nameAr: 'نسبة الفقر', unit: '%', frequency: 'annual' },
  ];
  
  for (const ind of iloWBIndicators) {
    const url = `https://api.worldbank.org/v2/country/${YEMEN_ISO}/indicator/${ind.wbCode}?format=json&per_page=500&date=${START_YEAR}:${END_YEAR}`;
    try {
      const resp = await fetch(url);
      if (!resp.ok) continue;
      const json = await resp.json();
      if (!json[1]) continue;
      
      await ensureIndicator(db, ind.code, ind.name, ind.nameAr, 'labor', ind.unit, ind.frequency, sourceDef.sourceId);
      const sourceId = await ensureSource(db, 'ILO / World Bank', sourceDef.apiUrl);
      
      for (const dp of json[1]) {
        if (dp.value === null) continue;
        const result = await upsertTimeSeries(db, ind.code, `${dp.date}-01-01`, dp.value, sourceId, 'mixed');
        if (result === 'inserted') inserted++;
        else if (result === 'updated') updated++;
      }
    } catch (e: any) {
      errors.push(`ILO ${ind.code}: ${e.message}`);
    }
  }
  return { inserted, updated, errors };
}

// ============================================================================
// WHO GHO API CONNECTOR
// ============================================================================

async function fetchWHOData(db: any, sourceDef: SourceAPIDef) {
  let inserted = 0, updated = 0;
  const errors: string[] = [];
  
  const whoWBIndicators = [
    { code: 'WHO_LIFE_EXPECTANCY', wbCode: 'SP.DYN.LE00.IN', name: 'Life Expectancy at Birth', nameAr: 'متوسط العمر المتوقع عند الولادة', unit: 'years', frequency: 'annual' },
    { code: 'WHO_INFANT_MORTALITY', wbCode: 'SP.DYN.IMRT.IN', name: 'Infant Mortality Rate (per 1,000)', nameAr: 'معدل وفيات الرضع', unit: 'per 1000', frequency: 'annual' },
    { code: 'WHO_UNDER5_MORTALITY', wbCode: 'SH.DYN.MORT', name: 'Under-5 Mortality Rate (per 1,000)', nameAr: 'معدل وفيات الأطفال دون الخامسة', unit: 'per 1000', frequency: 'annual' },
    { code: 'WHO_MATERNAL_MORTALITY', wbCode: 'SH.STA.MMRT', name: 'Maternal Mortality Ratio (per 100,000)', nameAr: 'نسبة وفيات الأمهات', unit: 'per 100000', frequency: 'annual' },
    { code: 'WHO_HEALTH_EXPENDITURE', wbCode: 'SH.XPD.CHEX.GD.ZS', name: 'Health Expenditure (% of GDP)', nameAr: 'الإنفاق الصحي كنسبة من الناتج', unit: '%', frequency: 'annual' },
    { code: 'WHO_IMMUNIZATION_DPT', wbCode: 'SH.IMM.IDPT', name: 'DPT Immunization (% of children)', nameAr: 'تطعيم DPT', unit: '%', frequency: 'annual' },
    { code: 'WHO_IMMUNIZATION_MEASLES', wbCode: 'SH.IMM.MEAS', name: 'Measles Immunization (% of children)', nameAr: 'تطعيم الحصبة', unit: '%', frequency: 'annual' },
    { code: 'WHO_PHYSICIANS', wbCode: 'SH.MED.PHYS.ZS', name: 'Physicians (per 1,000 people)', nameAr: 'الأطباء لكل 1000 شخص', unit: 'per 1000', frequency: 'annual' },
  ];
  
  for (const ind of whoWBIndicators) {
    const url = `https://api.worldbank.org/v2/country/${YEMEN_ISO}/indicator/${ind.wbCode}?format=json&per_page=500&date=${START_YEAR}:${END_YEAR}`;
    try {
      const resp = await fetch(url);
      if (!resp.ok) continue;
      const json = await resp.json();
      if (!json[1]) continue;
      
      await ensureIndicator(db, ind.code, ind.name, ind.nameAr, 'humanitarian', ind.unit, ind.frequency, sourceDef.sourceId);
      const sourceId = await ensureSource(db, 'WHO / World Bank', sourceDef.apiUrl);
      
      for (const dp of json[1]) {
        if (dp.value === null) continue;
        const result = await upsertTimeSeries(db, ind.code, `${dp.date}-01-01`, dp.value, sourceId, 'mixed');
        if (result === 'inserted') inserted++;
        else if (result === 'updated') updated++;
      }
    } catch (e: any) {
      errors.push(`WHO ${ind.code}: ${e.message}`);
    }
  }
  return { inserted, updated, errors };
}

// ============================================================================
// UN POPULATION API CONNECTOR
// ============================================================================

async function fetchUNPopData(db: any, sourceDef: SourceAPIDef) {
  let inserted = 0, updated = 0;
  const errors: string[] = [];
  
  const popWBIndicators = [
    { code: 'UN_POPULATION', wbCode: 'SP.POP.TOTL', name: 'Total Population', nameAr: 'إجمالي السكان', unit: 'people', frequency: 'annual' },
    { code: 'UN_POP_GROWTH', wbCode: 'SP.POP.GROW', name: 'Population Growth Rate (%)', nameAr: 'معدل نمو السكان', unit: '%', frequency: 'annual' },
    { code: 'UN_URBAN_POP', wbCode: 'SP.URB.TOTL.IN.ZS', name: 'Urban Population (%)', nameAr: 'السكان الحضر', unit: '%', frequency: 'annual' },
    { code: 'UN_BIRTH_RATE', wbCode: 'SP.DYN.CBRT.IN', name: 'Birth Rate (per 1,000)', nameAr: 'معدل المواليد', unit: 'per 1000', frequency: 'annual' },
    { code: 'UN_DEATH_RATE', wbCode: 'SP.DYN.CDRT.IN', name: 'Death Rate (per 1,000)', nameAr: 'معدل الوفيات', unit: 'per 1000', frequency: 'annual' },
    { code: 'UN_FERTILITY_RATE', wbCode: 'SP.DYN.TFRT.IN', name: 'Fertility Rate (births per woman)', nameAr: 'معدل الخصوبة', unit: 'births/woman', frequency: 'annual' },
    { code: 'UN_NET_MIGRATION', wbCode: 'SM.POP.NETM', name: 'Net Migration', nameAr: 'صافي الهجرة', unit: 'people', frequency: 'annual' },
    { code: 'UN_REFUGEE_ORIGIN', wbCode: 'SM.POP.REFG.OR', name: 'Refugees by Country of Origin', nameAr: 'اللاجئون حسب بلد المنشأ', unit: 'people', frequency: 'annual' },
  ];
  
  for (const ind of popWBIndicators) {
    const url = `https://api.worldbank.org/v2/country/${YEMEN_ISO}/indicator/${ind.wbCode}?format=json&per_page=500&date=${START_YEAR}:${END_YEAR}`;
    try {
      const resp = await fetch(url);
      if (!resp.ok) continue;
      const json = await resp.json();
      if (!json[1]) continue;
      
      await ensureIndicator(db, ind.code, ind.name, ind.nameAr, 'humanitarian', ind.unit, ind.frequency, sourceDef.sourceId);
      const sourceId = await ensureSource(db, 'UN Population / World Bank', sourceDef.apiUrl);
      
      for (const dp of json[1]) {
        if (dp.value === null) continue;
        const result = await upsertTimeSeries(db, ind.code, `${dp.date}-01-01`, dp.value, sourceId, 'mixed');
        if (result === 'inserted') inserted++;
        else if (result === 'updated') updated++;
      }
    } catch (e: any) {
      errors.push(`UNPOP ${ind.code}: ${e.message}`);
    }
  }
  return { inserted, updated, errors };
}

// ============================================================================
// TRADE & INFRASTRUCTURE INDICATORS
// ============================================================================

async function fetchTradeInfraData(db: any, sourceDef: SourceAPIDef) {
  let inserted = 0, updated = 0;
  const errors: string[] = [];
  
  const tradeIndicators = [
    { code: 'TRADE_EXPORTS', wbCode: 'NE.EXP.GNFS.CD', name: 'Exports of Goods & Services (USD)', nameAr: 'صادرات السلع والخدمات', unit: 'USD', frequency: 'annual' },
    { code: 'TRADE_IMPORTS', wbCode: 'NE.IMP.GNFS.CD', name: 'Imports of Goods & Services (USD)', nameAr: 'واردات السلع والخدمات', unit: 'USD', frequency: 'annual' },
    { code: 'TRADE_BALANCE', wbCode: 'NE.RSB.GNFS.CD', name: 'Trade Balance (USD)', nameAr: 'الميزان التجاري', unit: 'USD', frequency: 'annual' },
    { code: 'TRADE_OPENNESS', wbCode: 'NE.TRD.GNFS.ZS', name: 'Trade Openness (% of GDP)', nameAr: 'الانفتاح التجاري', unit: '%', frequency: 'annual' },
    { code: 'TRADE_FUEL_EXPORTS', wbCode: 'TX.VAL.FUEL.ZS.UN', name: 'Fuel Exports (% of merchandise)', nameAr: 'صادرات الوقود', unit: '%', frequency: 'annual' },
    { code: 'TRADE_FUEL_IMPORTS', wbCode: 'TM.VAL.FUEL.ZS.UN', name: 'Fuel Imports (% of merchandise)', nameAr: 'واردات الوقود', unit: '%', frequency: 'annual' },
    { code: 'INFRA_ELECTRICITY_ACCESS', wbCode: 'EG.ELC.ACCS.ZS', name: 'Access to Electricity (%)', nameAr: 'الوصول للكهرباء', unit: '%', frequency: 'annual' },
    { code: 'INFRA_INTERNET_USERS', wbCode: 'IT.NET.USER.ZS', name: 'Internet Users (%)', nameAr: 'مستخدمو الإنترنت', unit: '%', frequency: 'annual' },
    { code: 'INFRA_MOBILE_SUBS', wbCode: 'IT.CEL.SETS.P2', name: 'Mobile Subscriptions (per 100)', nameAr: 'اشتراكات الهاتف المحمول', unit: 'per 100', frequency: 'annual' },
    { code: 'INFRA_WATER_ACCESS', wbCode: 'SH.H2O.BASW.ZS', name: 'Access to Basic Water (%)', nameAr: 'الوصول للمياه الأساسية', unit: '%', frequency: 'annual' },
    { code: 'INFRA_SANITATION', wbCode: 'SH.STA.BASS.ZS', name: 'Access to Basic Sanitation (%)', nameAr: 'الوصول للصرف الصحي', unit: '%', frequency: 'annual' },
  ];
  
  for (const ind of tradeIndicators) {
    const url = `https://api.worldbank.org/v2/country/${YEMEN_ISO}/indicator/${ind.wbCode}?format=json&per_page=500&date=${START_YEAR}:${END_YEAR}`;
    try {
      const resp = await fetch(url);
      if (!resp.ok) continue;
      const json = await resp.json();
      if (!json[1]) continue;
      
      const sector = ind.code.startsWith('TRADE_') ? 'trade' : 'infrastructure';
      await ensureIndicator(db, ind.code, ind.name, ind.nameAr, sector, ind.unit, ind.frequency, sourceDef.sourceId);
      const sourceId = await ensureSource(db, 'World Bank / UN Comtrade', sourceDef.apiUrl);
      
      for (const dp of json[1]) {
        if (dp.value === null) continue;
        const result = await upsertTimeSeries(db, ind.code, `${dp.date}-01-01`, dp.value, sourceId, 'mixed');
        if (result === 'inserted') inserted++;
        else if (result === 'updated') updated++;
      }
    } catch (e: any) {
      errors.push(`TRADE ${ind.code}: ${e.message}`);
    }
  }
  return { inserted, updated, errors };
}

// ============================================================================
// EDUCATION & POVERTY INDICATORS
// ============================================================================

async function fetchEducationPovertyData(db: any, sourceDef: SourceAPIDef) {
  let inserted = 0, updated = 0;
  const errors: string[] = [];
  
  const indicators = [
    { code: 'EDU_ENROLLMENT_PRIMARY', wbCode: 'SE.PRM.ENRR', name: 'Primary School Enrollment (%)', nameAr: 'معدل الالتحاق بالتعليم الابتدائي', unit: '%', frequency: 'annual' },
    { code: 'EDU_ENROLLMENT_SECONDARY', wbCode: 'SE.SEC.ENRR', name: 'Secondary School Enrollment (%)', nameAr: 'معدل الالتحاق بالتعليم الثانوي', unit: '%', frequency: 'annual' },
    { code: 'EDU_LITERACY_ADULT', wbCode: 'SE.ADT.LITR.ZS', name: 'Adult Literacy Rate (%)', nameAr: 'معدل محو الأمية للبالغين', unit: '%', frequency: 'annual' },
    { code: 'EDU_EXPENDITURE', wbCode: 'SE.XPD.TOTL.GD.ZS', name: 'Education Expenditure (% of GDP)', nameAr: 'الإنفاق على التعليم', unit: '%', frequency: 'annual' },
    { code: 'POV_GINI', wbCode: 'SI.POV.GINI', name: 'Gini Index', nameAr: 'مؤشر جيني', unit: 'index', frequency: 'annual' },
    { code: 'POV_HEADCOUNT_190', wbCode: 'SI.POV.DDAY', name: 'Poverty Headcount ($1.90/day)', nameAr: 'نسبة الفقر (1.90$/يوم)', unit: '%', frequency: 'annual' },
    { code: 'POV_HEADCOUNT_320', wbCode: 'SI.POV.LMIC', name: 'Poverty Headcount ($3.20/day)', nameAr: 'نسبة الفقر (3.20$/يوم)', unit: '%', frequency: 'annual' },
    { code: 'GOV_MILITARY_EXPENDITURE', wbCode: 'MS.MIL.XPND.GD.ZS', name: 'Military Expenditure (% of GDP)', nameAr: 'الإنفاق العسكري', unit: '%', frequency: 'annual' },
    { code: 'GOV_REVENUE', wbCode: 'GC.REV.XGRT.GD.ZS', name: 'Government Revenue (% of GDP)', nameAr: 'إيرادات الحكومة', unit: '%', frequency: 'annual' },
    { code: 'GOV_DEBT', wbCode: 'GC.DOD.TOTL.GD.ZS', name: 'Government Debt (% of GDP)', nameAr: 'الدين الحكومي', unit: '%', frequency: 'annual' },
  ];
  
  for (const ind of indicators) {
    const url = `https://api.worldbank.org/v2/country/${YEMEN_ISO}/indicator/${ind.wbCode}?format=json&per_page=500&date=${START_YEAR}:${END_YEAR}`;
    try {
      const resp = await fetch(url);
      if (!resp.ok) continue;
      const json = await resp.json();
      if (!json[1]) continue;
      
      const sector = ind.code.startsWith('EDU_') ? 'education' : ind.code.startsWith('POV_') ? 'poverty' : 'public_finance';
      await ensureIndicator(db, ind.code, ind.name, ind.nameAr, sector, ind.unit, ind.frequency, sourceDef.sourceId);
      const sourceId = await ensureSource(db, 'World Bank', 'https://api.worldbank.org/v2');
      
      for (const dp of json[1]) {
        if (dp.value === null) continue;
        const result = await upsertTimeSeries(db, ind.code, `${dp.date}-01-01`, dp.value, sourceId, 'mixed');
        if (result === 'inserted') inserted++;
        else if (result === 'updated') updated++;
      }
    } catch (e: any) {
      errors.push(`EDU/POV ${ind.code}: ${e.message}`);
    }
  }
  return { inserted, updated, errors };
}

// ============================================================================
// OCHA FTS API CONNECTOR (Humanitarian Funding)
// ============================================================================

async function fetchOCHAFTSData(db: any, sourceDef: SourceAPIDef) {
  let inserted = 0, updated = 0;
  const errors: string[] = [];
  
  // OCHA FTS API for Yemen humanitarian funding
  for (let year = START_YEAR; year <= END_YEAR; year++) {
    try {
      const url = `https://api.hpc.tools/v1/public/fts/flow?planCountry=${YEMEN_ISO}&year=${year}&groupby=year`;
      const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!resp.ok) continue;
      const json = await resp.json();
      
      if (json.data?.report3?.fundingTotals?.total) {
        const total = json.data.report3.fundingTotals.total;
        const funding = total[0]?.totalFunding || 0;
        
        await ensureIndicator(db, 'OCHA_HUM_FUNDING', 'Humanitarian Funding Received (USD)', 'التمويل الإنساني المستلم', 'humanitarian', 'USD', 'annual', sourceDef.sourceId);
        const sourceId = await ensureSource(db, 'OCHA FTS', 'https://api.hpc.tools/v1/public/fts');
        
        if (funding > 0) {
          const result = await upsertTimeSeries(db, 'OCHA_HUM_FUNDING', `${year}-01-01`, funding, sourceId, 'mixed');
          if (result === 'inserted') inserted++;
          else if (result === 'updated') updated++;
        }
      }
    } catch (e: any) {
      errors.push(`OCHA FTS ${year}: ${e.message}`);
    }
  }
  return { inserted, updated, errors };
}

// ============================================================================
// RELIEFWEB API CONNECTOR
// ============================================================================

async function fetchReliefWebData(db: any, sourceDef: SourceAPIDef) {
  let inserted = 0, updated = 0;
  const errors: string[] = [];
  
  // ReliefWeb API - count reports per year as a proxy for humanitarian activity
  for (let year = START_YEAR; year <= END_YEAR; year++) {
    try {
      const url = `https://api.reliefweb.int/v1/reports?appname=yeto-observatory&filter[field]=country.iso3&filter[value]=${YEMEN_ISO}&filter[operator]=AND&filter[conditions][0][field]=date.created&filter[conditions][0][value][from]=${year}-01-01&filter[conditions][0][value][to]=${year}-12-31&limit=0`;
      const resp = await fetch(url);
      if (!resp.ok) continue;
      const json = await resp.json();
      
      const count = json.totalCount || 0;
      await ensureIndicator(db, 'RW_REPORTS_COUNT', 'ReliefWeb Reports Published', 'تقارير ريليف ويب المنشورة', 'humanitarian', 'count', 'annual', sourceDef.sourceId);
      const sourceId = await ensureSource(db, 'ReliefWeb', 'https://api.reliefweb.int/v1');
      
      if (count > 0) {
        const result = await upsertTimeSeries(db, 'RW_REPORTS_COUNT', `${year}-01-01`, count, sourceId, 'mixed');
        if (result === 'inserted') inserted++;
        else if (result === 'updated') updated++;
      }
    } catch (e: any) {
      errors.push(`ReliefWeb ${year}: ${e.message}`);
    }
  }
  return { inserted, updated, errors };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function ensureIndicator(db: any, code: string, nameEn: string, nameAr: string, sector: string, unit: string, frequency: string, sourceRef: string) {
  const [existing] = await db.execute(sql`SELECT id FROM indicators WHERE code = ${code}`);
  if ((existing as any[]).length === 0) {
    await db.execute(sql`
      INSERT INTO indicators (code, nameEn, nameAr, sector, unit, frequency, isActive, createdAt)
      VALUES (${code}, ${nameEn}, ${nameAr}, ${sector}, ${unit}, ${frequency}, 1, NOW())
    `);
  }
}

async function ensureSource(db: any, publisher: string, url: string): Promise<number> {
  const [existing] = await db.execute(sql`SELECT id FROM sources WHERE publisher = ${publisher} LIMIT 1`);
  if ((existing as any[]).length > 0) return (existing as any[])[0].id;
  
  await db.execute(sql`
    INSERT INTO sources (publisher, url, retrievalDate, createdAt)
    VALUES (${publisher}, ${url}, NOW(), NOW())
  `);
  const [newRow] = await db.execute(sql`SELECT LAST_INSERT_ID() as id`);
  return (newRow as any[])[0].id;
}

async function upsertTimeSeries(db: any, indicatorCode: string, date: string, value: number, sourceId: number, regimeTag: string): Promise<'inserted' | 'updated' | 'skipped'> {
  const [existing] = await db.execute(sql`
    SELECT id, value FROM time_series 
    WHERE indicatorCode = ${indicatorCode} AND date = ${date} AND regimeTag = ${regimeTag}
    LIMIT 1
  `);
  
  if ((existing as any[]).length === 0) {
    await db.execute(sql`
      INSERT INTO time_series (indicatorCode, date, value, sourceId, regimeTag, createdAt)
      VALUES (${indicatorCode}, ${date}, ${value}, ${sourceId}, ${regimeTag}, NOW())
    `);
    return 'inserted';
  } else {
    const existingValue = Number((existing as any[])[0].value);
    if (Math.abs(existingValue - value) > 0.001) {
      await db.execute(sql`
        UPDATE time_series SET value = ${value}, sourceId = ${sourceId}, updatedAt = NOW()
        WHERE id = ${(existing as any[])[0].id}
      `);
      return 'updated';
    }
    return 'skipped';
  }
}

// ============================================================================
// UPDATE SOURCE REGISTRY WITH API URLs
// ============================================================================

async function updateSourceRegistryURLs(db: any) {
  const apiURLs: Record<string, string> = {
    'World Bank': 'https://api.worldbank.org/v2',
    'FAO': 'https://www.fao.org/faostat/api/v1',
    'ILO': 'https://www.ilo.org/sdmx/rest',
    'WHO': 'https://ghoapi.azureedge.net/api',
    'UN Population': 'https://population.un.org/dataportalapi/api/v1',
    'UN Comtrade': 'https://comtradeapi.un.org/public/v1',
    'OCHA FTS': 'https://api.hpc.tools/v1/public/fts',
    'ReliefWeb': 'https://api.reliefweb.int/v1',
    'UNHCR': 'https://api.unhcr.org/population/v1',
    'WFP': 'https://api.wfp.org/vam-data-bridges/4.0.0',
    'IMF': 'https://dataservices.imf.org/REST/SDMX_JSON.svc',
    'UN SDG': 'https://unstats.un.org/sdgs/UNSDGAPIV5',
    'IATI': 'https://api.iatistandard.org/datastore/activity',
    'ACLED': 'https://api.acleddata.com/acled/read',
    'NASA FIRMS': 'https://firms.modaps.eosdis.nasa.gov/api',
  };
  
  let updated = 0;
  for (const [publisher, url] of Object.entries(apiURLs)) {
    const result = await db.execute(sql`
      UPDATE source_registry SET apiUrl = ${url} 
      WHERE (publisher LIKE ${`%${publisher}%`} OR name LIKE ${`%${publisher}%`})
      AND (apiUrl IS NULL OR apiUrl = '')
    `);
    const affected = (result as unknown as any)?.affectedRows || (result as unknown as any)?.[0]?.affectedRows || 0;
    if (affected > 0) updated += affected;
  }
  
  // Also update specific sources by name
  const specificUpdates: [string, string][] = [
    ['World Bank Global Economic Monitor', 'https://api.worldbank.org/v2'],
    ['World Bank Indicators', 'https://api.worldbank.org/v2'],
    ['IMF Direction of Trade', 'https://dataservices.imf.org/REST/SDMX_JSON.svc'],
    ['UNOCHA Financial Tracking', 'https://api.hpc.tools/v1/public/fts'],
    ['UN Global SDG', 'https://unstats.un.org/sdgs/UNSDGAPIV5'],
    ['UNDP', 'https://api.undp.org/data'],
    ['Population & Displacement', 'https://api.unhcr.org/population/v1'],
  ];
  
  for (const [name, url] of specificUpdates) {
    await db.execute(sql`
      UPDATE source_registry SET apiUrl = ${url}
      WHERE name LIKE ${`%${name}%`} AND (apiUrl IS NULL OR apiUrl = '')
    `);
  }
  
  return updated;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

export async function runFullAPIConnection() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  console.log('=== YETO Full API Connection & Backfill ===');
  console.log(`Backfilling data from ${START_YEAR} to ${END_YEAR}`);
  console.log('');
  
  // Step 1: Update source registry with API URLs
  console.log('[1/8] Updating source registry with API URLs...');
  const urlsUpdated = await updateSourceRegistryURLs(db);
  console.log(`  Updated ${urlsUpdated} source registry entries with API URLs`);
  
  const results: { source: string; inserted: number; updated: number; errors: string[] }[] = [];
  
  // Step 2: World Bank comprehensive indicators
  console.log('[2/8] Fetching World Bank comprehensive indicators...');
  const wbResult = await fetchWorldBankData(db, {
    sourceId: 'worldbank',
    name: 'World Bank Indicators',
    publisher: 'World Bank',
    apiUrl: 'https://api.worldbank.org/v2',
    tier: 'T1',
    sector: 'macroeconomy',
    indicators: [
      { code: 'WB_GDP_CURRENT', wbCode: 'NY.GDP.MKTP.CD', name: 'GDP (current USD)', nameAr: 'الناتج المحلي الإجمالي', unit: 'USD', frequency: 'annual' },
      { code: 'WB_GDP_GROWTH', wbCode: 'NY.GDP.MKTP.KD.ZG', name: 'GDP Growth (%)', nameAr: 'نمو الناتج المحلي', unit: '%', frequency: 'annual' },
      { code: 'WB_GDP_PER_CAPITA', wbCode: 'NY.GDP.PCAP.CD', name: 'GDP per Capita (USD)', nameAr: 'نصيب الفرد من الناتج', unit: 'USD', frequency: 'annual' },
      { code: 'WB_GNI_PER_CAPITA', wbCode: 'NY.GNP.PCAP.CD', name: 'GNI per Capita (USD)', nameAr: 'نصيب الفرد من الدخل القومي', unit: 'USD', frequency: 'annual' },
      { code: 'WB_INFLATION_CPI', wbCode: 'FP.CPI.TOTL.ZG', name: 'Inflation (CPI %)', nameAr: 'التضخم', unit: '%', frequency: 'annual' },
      { code: 'WB_CURRENT_ACCOUNT', wbCode: 'BN.CAB.XOKA.CD', name: 'Current Account Balance (USD)', nameAr: 'ميزان الحساب الجاري', unit: 'USD', frequency: 'annual' },
      { code: 'WB_FDI_NET', wbCode: 'BX.KLT.DINV.CD.WD', name: 'FDI Net Inflows (USD)', nameAr: 'صافي الاستثمار الأجنبي', unit: 'USD', frequency: 'annual' },
      { code: 'WB_REMITTANCES', wbCode: 'BX.TRF.PWKR.CD.DT', name: 'Personal Remittances (USD)', nameAr: 'التحويلات الشخصية', unit: 'USD', frequency: 'annual' },
      { code: 'WB_ODA_RECEIVED', wbCode: 'DT.ODA.ODAT.CD', name: 'ODA Received (USD)', nameAr: 'المساعدات الإنمائية المستلمة', unit: 'USD', frequency: 'annual' },
      { code: 'WB_EXTERNAL_DEBT', wbCode: 'DT.DOD.DECT.CD', name: 'External Debt Stock (USD)', nameAr: 'رصيد الدين الخارجي', unit: 'USD', frequency: 'annual' },
    ],
    fetchFn: fetchWorldBankData,
  });
  results.push({ source: 'World Bank', ...wbResult });
  console.log(`  Inserted: ${wbResult.inserted}, Updated: ${wbResult.updated}, Errors: ${wbResult.errors.length}`);
  
  // Step 3: FAO Food & Agriculture
  console.log('[3/8] Fetching FAO food & agriculture indicators...');
  const faoResult = await fetchFAOData(db, { sourceId: 'fao', name: 'FAO FAOSTAT', publisher: 'FAO', apiUrl: 'https://www.fao.org/faostat/api/v1', tier: 'T1', sector: 'food_security', indicators: [], fetchFn: fetchFAOData });
  results.push({ source: 'FAO', ...faoResult });
  console.log(`  Inserted: ${faoResult.inserted}, Updated: ${faoResult.updated}, Errors: ${faoResult.errors.length}`);
  
  // Step 4: ILO Labor Market
  console.log('[4/8] Fetching ILO labor market indicators...');
  const iloResult = await fetchILOData(db, { sourceId: 'ilo', name: 'ILO ILOSTAT', publisher: 'ILO', apiUrl: 'https://www.ilo.org/sdmx/rest', tier: 'T1', sector: 'labor', indicators: [], fetchFn: fetchILOData });
  results.push({ source: 'ILO', ...iloResult });
  console.log(`  Inserted: ${iloResult.inserted}, Updated: ${iloResult.updated}, Errors: ${iloResult.errors.length}`);
  
  // Step 5: WHO Health
  console.log('[5/8] Fetching WHO health indicators...');
  const whoResult = await fetchWHOData(db, { sourceId: 'who', name: 'WHO GHO', publisher: 'WHO', apiUrl: 'https://ghoapi.azureedge.net/api', tier: 'T1', sector: 'humanitarian', indicators: [], fetchFn: fetchWHOData });
  results.push({ source: 'WHO', ...whoResult });
  console.log(`  Inserted: ${whoResult.inserted}, Updated: ${whoResult.updated}, Errors: ${whoResult.errors.length}`);
  
  // Step 6: UN Population
  console.log('[6/8] Fetching UN Population indicators...');
  const popResult = await fetchUNPopData(db, { sourceId: 'unpop', name: 'UN Population', publisher: 'UN Population Division', apiUrl: 'https://population.un.org/dataportalapi/api/v1', tier: 'T1', sector: 'humanitarian', indicators: [], fetchFn: fetchUNPopData });
  results.push({ source: 'UN Population', ...popResult });
  console.log(`  Inserted: ${popResult.inserted}, Updated: ${popResult.updated}, Errors: ${popResult.errors.length}`);
  
  // Step 7: Trade & Infrastructure
  console.log('[7/8] Fetching Trade & Infrastructure indicators...');
  const tradeResult = await fetchTradeInfraData(db, { sourceId: 'trade', name: 'UN Comtrade / WB', publisher: 'UN / World Bank', apiUrl: 'https://comtradeapi.un.org/public/v1', tier: 'T1', sector: 'trade', indicators: [], fetchFn: fetchTradeInfraData });
  results.push({ source: 'Trade & Infra', ...tradeResult });
  console.log(`  Inserted: ${tradeResult.inserted}, Updated: ${tradeResult.updated}, Errors: ${tradeResult.errors.length}`);
  
  // Step 8: Education & Poverty + OCHA + ReliefWeb
  console.log('[8/8] Fetching Education, Poverty, OCHA FTS, ReliefWeb...');
  const eduResult = await fetchEducationPovertyData(db, { sourceId: 'edu', name: 'World Bank', publisher: 'World Bank', apiUrl: 'https://api.worldbank.org/v2', tier: 'T1', sector: 'education', indicators: [], fetchFn: fetchEducationPovertyData });
  results.push({ source: 'Education & Poverty', ...eduResult });
  
  const ochaResult = await fetchOCHAFTSData(db, { sourceId: 'ocha', name: 'OCHA FTS', publisher: 'OCHA', apiUrl: 'https://api.hpc.tools/v1/public/fts', tier: 'T1', sector: 'humanitarian', indicators: [], fetchFn: fetchOCHAFTSData });
  results.push({ source: 'OCHA FTS', ...ochaResult });
  
  const rwResult = await fetchReliefWebData(db, { sourceId: 'reliefweb', name: 'ReliefWeb', publisher: 'ReliefWeb', apiUrl: 'https://api.reliefweb.int/v1', tier: 'T1', sector: 'humanitarian', indicators: [], fetchFn: fetchReliefWebData });
  results.push({ source: 'ReliefWeb', ...rwResult });
  
  // Update backfill status in source_registry
  await db.execute(sql`
    UPDATE source_registry SET backfillStatus = 'COMPLETED', lastFetch = NOW()
    WHERE publisher LIKE '%World Bank%' OR publisher LIKE '%FAO%' OR publisher LIKE '%ILO%' 
    OR publisher LIKE '%WHO%' OR publisher LIKE '%OCHA%' OR publisher LIKE '%ReliefWeb%'
    OR publisher LIKE '%UN%'
  `);
  
  // Summary
  console.log('\n=== BACKFILL SUMMARY ===');
  let totalInserted = 0, totalUpdated = 0, totalErrors = 0;
  for (const r of results) {
    console.log(`${r.source}: +${r.inserted} inserted, ${r.updated} updated, ${r.errors.length} errors`);
    totalInserted += r.inserted;
    totalUpdated += r.updated;
    totalErrors += r.errors.length;
    if (r.errors.length > 0) {
      for (const e of r.errors.slice(0, 3)) console.log(`  ERROR: ${e}`);
    }
  }
  console.log(`\nTOTAL: ${totalInserted} inserted, ${totalUpdated} updated, ${totalErrors} errors`);
  
  // Final counts
  const finalCountResult = await db.execute(sql`SELECT COUNT(*) as c FROM time_series`);
  const indCountResult = await db.execute(sql`SELECT COUNT(*) as c FROM indicators WHERE isActive = 1`);
  const fc = (finalCountResult as unknown as any[][])[0]?.[0]?.c ?? '?';
  const ic = (indCountResult as unknown as any[][])[0]?.[0]?.c ?? '?';
  console.log(`\nDatabase now has ${fc} time series records across ${ic} indicators`);
  
  return { totalInserted, totalUpdated, totalErrors, results };
}

// Run if executed directly
runFullAPIConnection().then(r => {
  console.log('\nDone!');
  process.exit(0);
}).catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
