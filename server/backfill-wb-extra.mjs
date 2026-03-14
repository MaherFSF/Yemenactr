/**
 * World Bank Extra Indicators Backfill
 * Fetches additional Yemen indicators from World Bank API to boost sector coverage
 */

import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';

const DATABASE_URL = process.env.DATABASE_URL;

// Additional World Bank indicators organized by sector
const WB_INDICATORS = [
  // Trade & Exports
  { code: 'NE.EXP.GNFS.ZS', name: 'Exports of goods and services (% of GDP)', sector: 'trade' },
  { code: 'NE.IMP.GNFS.ZS', name: 'Imports of goods and services (% of GDP)', sector: 'trade' },
  { code: 'TM.VAL.MRCH.CD.WT', name: 'Merchandise imports (current US$)', sector: 'trade' },
  { code: 'TX.VAL.MRCH.CD.WT', name: 'Merchandise exports (current US$)', sector: 'trade' },
  { code: 'BN.CAB.XOKA.CD', name: 'Current account balance (BoP, current US$)', sector: 'trade' },
  { code: 'BN.CAB.XOKA.GD.ZS', name: 'Current account balance (% of GDP)', sector: 'trade' },
  
  // Public Finance & Fiscal
  { code: 'GC.DOD.TOTL.GD.ZS', name: 'Central government debt, total (% of GDP)', sector: 'public_finance' },
  { code: 'GC.REV.XGRT.GD.ZS', name: 'Revenue, excluding grants (% of GDP)', sector: 'public_finance' },
  { code: 'GC.XPN.TOTL.GD.ZS', name: 'Expense (% of GDP)', sector: 'public_finance' },
  { code: 'GC.TAX.TOTL.GD.ZS', name: 'Tax revenue (% of GDP)', sector: 'public_finance' },
  { code: 'GC.NFN.TOTL.GD.ZS', name: 'Net investment in nonfinancial assets (% of GDP)', sector: 'public_finance' },
  { code: 'DT.DOD.DECT.CD', name: 'External debt stocks, total (DOD, current US$)', sector: 'public_finance' },
  
  // Banking & Finance
  { code: 'FM.LBL.BMNY.GD.ZS', name: 'Broad money (% of GDP)', sector: 'banking' },
  { code: 'FM.LBL.BMNY.CN', name: 'Broad money (current LCU)', sector: 'banking' },
  { code: 'FD.AST.PRVT.GD.ZS', name: 'Domestic credit to private sector (% of GDP)', sector: 'banking' },
  { code: 'FB.CBK.BRCH.P5', name: 'Commercial bank branches (per 100,000 adults)', sector: 'banking' },
  { code: 'FB.ATM.TOTL.P5', name: 'ATMs (per 100,000 adults)', sector: 'banking' },
  
  // Energy
  { code: 'EG.USE.ELEC.KH.PC', name: 'Electric power consumption (kWh per capita)', sector: 'energy' },
  { code: 'EG.ELC.ACCS.ZS', name: 'Access to electricity (% of population)', sector: 'energy' },
  { code: 'EG.ELC.ACCS.RU.ZS', name: 'Access to electricity, rural (% of rural population)', sector: 'energy' },
  { code: 'EG.FEC.RNEW.ZS', name: 'Renewable energy consumption (% of total)', sector: 'energy' },
  { code: 'EG.USE.PCAP.KG.OE', name: 'Energy use (kg of oil equivalent per capita)', sector: 'energy' },
  
  // Agriculture
  { code: 'NV.AGR.TOTL.ZS', name: 'Agriculture, forestry, and fishing, value added (% of GDP)', sector: 'agriculture' },
  { code: 'AG.LND.ARBL.ZS', name: 'Arable land (% of land area)', sector: 'agriculture' },
  { code: 'AG.LND.IRIG.AG.ZS', name: 'Agricultural irrigated land (% of total agricultural land)', sector: 'agriculture' },
  { code: 'SL.AGR.EMPL.ZS', name: 'Employment in agriculture (% of total employment)', sector: 'agriculture' },
  { code: 'AG.PRD.FOOD.XD', name: 'Food production index (2014-2016 = 100)', sector: 'agriculture' },
  
  // Health
  { code: 'SH.XPD.CHEX.GD.ZS', name: 'Current health expenditure (% of GDP)', sector: 'health' },
  { code: 'SH.MED.PHYS.ZS', name: 'Physicians (per 1,000 people)', sector: 'health' },
  { code: 'SH.MED.BEDS.ZS', name: 'Hospital beds (per 1,000 people)', sector: 'health' },
  { code: 'SP.DYN.LE00.IN', name: 'Life expectancy at birth, total (years)', sector: 'health' },
  { code: 'SH.DYN.MORT', name: 'Mortality rate, under-5 (per 1,000 live births)', sector: 'health' },
  { code: 'SH.STA.MMRT', name: 'Maternal mortality ratio (per 100,000 live births)', sector: 'health' },
  
  // Education
  { code: 'SE.XPD.TOTL.GD.ZS', name: 'Government expenditure on education, total (% of GDP)', sector: 'education' },
  { code: 'SE.PRM.ENRR', name: 'School enrollment, primary (% gross)', sector: 'education' },
  { code: 'SE.SEC.ENRR', name: 'School enrollment, secondary (% gross)', sector: 'education' },
  { code: 'SE.ADT.LITR.ZS', name: 'Literacy rate, adult total (% of people ages 15 and above)', sector: 'education' },
  { code: 'SE.ADT.LITR.FE.ZS', name: 'Literacy rate, adult female (% of females ages 15+)', sector: 'education' },
  
  // Infrastructure
  { code: 'IT.CEL.SETS.P2', name: 'Mobile cellular subscriptions (per 100 people)', sector: 'infrastructure' },
  { code: 'IT.NET.USER.ZS', name: 'Individuals using the Internet (% of population)', sector: 'infrastructure' },
  { code: 'SH.H2O.BASW.ZS', name: 'People using at least basic drinking water services (% of population)', sector: 'infrastructure' },
  { code: 'SH.STA.BASS.ZS', name: 'People using at least basic sanitation services (% of population)', sector: 'infrastructure' },
  
  // Poverty & Development
  { code: 'SI.POV.NAHC', name: 'Poverty headcount ratio at national poverty lines (% of population)', sector: 'poverty' },
  { code: 'SI.POV.DDAY', name: 'Poverty headcount ratio at $2.15 a day (2017 PPP) (% of population)', sector: 'poverty' },
  { code: 'SI.POV.GINI', name: 'Gini index', sector: 'poverty' },
  { code: 'NY.GNP.PCAP.CD', name: 'GNI per capita, Atlas method (current US$)', sector: 'poverty' },
  
  // Consumer Prices
  { code: 'FP.CPI.TOTL', name: 'Consumer price index (2010 = 100)', sector: 'prices' },
  { code: 'FP.CPI.TOTL.ZG', name: 'Inflation, consumer prices (annual %)', sector: 'prices' },
  { code: 'FP.WPI.TOTL', name: 'Wholesale price index (2010 = 100)', sector: 'prices' },
  
  // Labor Market
  { code: 'SL.UEM.TOTL.ZS', name: 'Unemployment, total (% of total labor force)', sector: 'labor' },
  { code: 'SL.UEM.TOTL.FE.ZS', name: 'Unemployment, female (% of female labor force)', sector: 'labor' },
  { code: 'SL.UEM.1524.ZS', name: 'Unemployment, youth total (% of total labor force ages 15-24)', sector: 'labor' },
  { code: 'SL.TLF.CACT.ZS', name: 'Labor force participation rate, total (% of total population ages 15+)', sector: 'labor' },
  { code: 'SL.TLF.CACT.FE.ZS', name: 'Labor force participation rate, female (% of female population ages 15+)', sector: 'labor' },
  
  // Macroeconomic
  { code: 'NY.GDP.MKTP.KD.ZG', name: 'GDP growth (annual %)', sector: 'macro' },
  { code: 'NY.GDP.MKTP.CD', name: 'GDP (current US$)', sector: 'macro' },
  { code: 'NY.GDP.PCAP.CD', name: 'GDP per capita (current US$)', sector: 'macro' },
  { code: 'NV.IND.TOTL.ZS', name: 'Industry (including construction), value added (% of GDP)', sector: 'macro' },
  { code: 'NV.SRV.TOTL.ZS', name: 'Services, value added (% of GDP)', sector: 'macro' },
  { code: 'NE.GDI.TOTL.ZS', name: 'Gross capital formation (% of GDP)', sector: 'macro' },
  { code: 'BX.KLT.DINV.CD.WD', name: 'Foreign direct investment, net inflows (BoP, current US$)', sector: 'investment' },
  { code: 'BX.TRF.PWKR.CD.DT', name: 'Personal remittances, received (current US$)', sector: 'macro' },
  
  // Aid Flows
  { code: 'DT.ODA.ODAT.CD', name: 'Net official development assistance received (current US$)', sector: 'aid' },
  { code: 'DT.ODA.ODAT.GN.ZS', name: 'Net ODA received (% of GNI)', sector: 'aid' },
  { code: 'DT.ODA.ALLD.CD', name: 'Net official development assistance and official aid received (current US$)', sector: 'aid' },
  
  // Demographics (cross-cutting)
  { code: 'SP.POP.TOTL', name: 'Population, total', sector: 'macro' },
  { code: 'SP.POP.GROW', name: 'Population growth (annual %)', sector: 'macro' },
  { code: 'SP.URB.TOTL.IN.ZS', name: 'Urban population (% of total population)', sector: 'macro' },
  { code: 'SP.DYN.TFRT.IN', name: 'Fertility rate, total (births per woman)', sector: 'health' },
];

async function fetchWBData(indicatorCode) {
  const url = `https://api.worldbank.org/v2/country/YEM/indicator/${indicatorCode}?format=json&per_page=100&date=2000:2025`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data[1]) return [];
    return data[1].filter(d => d.value !== null).map(d => ({
      year: parseInt(d.date),
      value: d.value,
      date: `${d.date}-12-31`,
    }));
  } catch { return []; }
}

async function main() {
  console.log('📊 World Bank Extra Indicators Backfill...\n');
  const conn = await mysql.createConnection(DATABASE_URL);
  
  // Check existing indicator codes
  const [existing] = await conn.execute('SELECT DISTINCT indicatorCode FROM time_series');
  const existingCodes = new Set(existing.map(r => r.indicatorCode));
  console.log(`Existing indicator codes: ${existingCodes.size}\n`);
  
  let inserted = 0, skipped = 0, errors = 0;
  
  for (const indicator of WB_INDICATORS) {
    const wbCode = `WB_${indicator.code.replace(/\./g, '_')}`;
    
    if (existingCodes.has(wbCode)) {
      console.log(`  ⏭ ${indicator.name} — already exists`);
      skipped++;
      continue;
    }
    
    console.log(`  📥 ${indicator.name}...`);
    const data = await fetchWBData(indicator.code);
    
    if (data.length === 0) {
      console.log(`    ⚠ No data available`);
      continue;
    }
    
    for (const point of data) {
      try {
        await conn.execute(
          `INSERT INTO time_series (id, indicatorCode, regimeTag, date, value, unit, confidenceRating, sourceId, notes, createdAt, updatedAt)
           VALUES (?, ?, 'unified', ?, ?, ?, 'A', 'world-bank', ?, NOW(), NOW())`,
          [
            uuidv4(),
            wbCode,
            point.date,
            point.value,
            indicator.name.includes('%') ? 'percent' : indicator.name.includes('US$') ? 'usd' : 'index',
            `${indicator.name} | Source: World Bank WDI`
          ]
        );
        inserted++;
      } catch (err) {
        if (err.code !== 'ER_DUP_ENTRY') errors++;
      }
    }
    
    console.log(`    ✅ ${data.length} data points (${data[0]?.year || '?'}-${data[data.length-1]?.year || '?'})`);
    
    // Also ensure indicator exists in indicators table
    try {
      await conn.execute(
        `INSERT IGNORE INTO indicators (id, code, nameEn, nameAr, sector, unit, frequency, sourceId, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, 'annual', 'world-bank', NOW(), NOW())`,
        [
          uuidv4(),
          wbCode,
          indicator.name,
          indicator.name, // Arabic translation would be ideal but using English for now
          indicator.sector,
          indicator.name.includes('%') ? 'percent' : indicator.name.includes('US$') ? 'usd' : 'index',
        ]
      );
    } catch {}
    
    await new Promise(r => setTimeout(r, 100));
  }
  
  const [total] = await conn.execute('SELECT COUNT(*) as cnt FROM time_series');
  const [distInd] = await conn.execute('SELECT COUNT(DISTINCT indicatorCode) as cnt FROM time_series');
  
  console.log(`\n✅ Done! Inserted: ${inserted}, Skipped: ${skipped}, Errors: ${errors}`);
  console.log(`Total time series: ${total[0].cnt}`);
  console.log(`Distinct indicators: ${distInd[0].cnt}`);
  
  await conn.end();
}

main().catch(err => { console.error(err); process.exit(1); });
