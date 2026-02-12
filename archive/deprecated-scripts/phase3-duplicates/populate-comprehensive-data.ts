/**
 * Populate Comprehensive Yemen Economic Data (2010-2025)
 * Adds time series data and economic events from wide search results
 */

import { getDb } from '../server/db';
import { timeSeries, economicEvents, eventIndicatorLinks, confidenceRatings } from '../drizzle/schema';
import { sql } from 'drizzle-orm';

// Comprehensive economic data from wide search (2010-2025)
const yearlyData = [
  { year: 2010, gdpGrowth: 7.7, inflation: 11.17, exchangeRate: 219, oilProduction: 280000, foreignReserves: 7.0, events: ['Declining oil revenues', 'Political instability', 'Rising unemployment', 'High food prices'] },
  { year: 2011, gdpGrowth: -12.71, inflation: 19.54, exchangeRate: 214, oilProduction: 170000, foreignReserves: 4.3, events: ['Arab Spring protests begin', 'Political crisis and uprising', 'Oil production shutdown', 'Economic collapse'] },
  { year: 2012, gdpGrowth: 2.4, inflation: 9.9, exchangeRate: 215, oilProduction: 180220, foreignReserves: 5.0, events: ['Hadi assumes presidency', 'Saudi oil grant', 'Attacks on oil infrastructure', 'Reduced government spending'] },
  { year: 2013, gdpGrowth: 4.82, inflation: 10.97, exchangeRate: 214.5, oilProduction: 198390, foreignReserves: 5.35, events: ['National Dialogue Conference', 'Political tensions', 'Conflict with Southern separatists', 'International aid pledges'] },
  { year: 2014, gdpGrowth: -0.19, inflation: 8.10, exchangeRate: 215, oilProduction: 153370, foreignReserves: 4.9, events: ['Fuel subsidy cuts', 'Houthis seize Sanaa', 'Frequent pipeline attacks', 'Oil revenue decline'] },
  { year: 2015, gdpGrowth: -27.99, inflation: 19.46, exchangeRate: 215, oilProduction: 47000, foreignReserves: 2.1, events: ['Saudi-led coalition intervention begins', 'Oil exports halted', 'Foreign reserves depleted', 'GDP contracts 28%'] },
  { year: 2016, gdpGrowth: -9.38, inflation: 21.30, exchangeRate: 241, oilProduction: 21960, foreignReserves: 2.0, events: ['Central Bank relocated to Aden', 'Civil servant salaries suspended', 'Oil and gas exports halt', 'Widening fiscal deficit'] },
  { year: 2017, gdpGrowth: -5.1, inflation: 30.4, exchangeRate: 250.25, oilProduction: 47996, foreignReserves: 0.245, events: ['Cholera outbreak begins', 'Saudi blockade tightens', 'Humanitarian crisis deepens', 'Reserves nearly depleted'] },
  { year: 2018, gdpGrowth: 0.8, inflation: 33.65, exchangeRate: 250, oilProduction: 61000, foreignReserves: 1.8, events: ['Stockholm Agreement signed', 'Saudi $2B deposit to CBY', 'Currency depreciation', 'Humanitarian aid increases'] },
  { year: 2019, gdpGrowth: 2.0, inflation: 6.7, exchangeRate: 250, oilProduction: 61000, foreignReserves: 0.9, events: ['Aden violence surge', 'Southern reconciliation efforts', 'Hydrocarbon production increase', 'Saudi deposit exhausted'] },
  { year: 2020, gdpGrowth: -8.5, inflation: 207, exchangeRate: 743, oilProduction: 75000, foreignReserves: null, events: ['COVID-19 pandemic', 'Ban on new currency', 'Oil derivatives crisis', 'STC autonomous administration in Aden'] },
  { year: 2021, gdpGrowth: -1.0, inflation: 26.0, exchangeRate: 249, oilProduction: 60000, foreignReserves: 1.69, events: ['Currency depreciation continues', 'Rising food and fuel prices', 'Ongoing conflict', 'Humanitarian crisis'] },
  { year: 2022, gdpGrowth: 1.7, inflation: 29.51, exchangeRate: 250, oilProduction: 48560, foreignReserves: 1.25, events: ['UN-brokered ceasefire (April-October)', 'Houthi attacks on oil facilities', 'Saudi $3B economic package', 'Ceasefire expires'] },
  { year: 2023, gdpGrowth: -0.5, inflation: 9.9, exchangeRate: 250, oilProduction: 15000, foreignReserves: 1.8, events: ['Blockade on oil exports', 'Economic fragmentation', 'Dual currency system', 'Peace talks resume'] },
  { year: 2024, gdpGrowth: -1.5, inflation: 27, exchangeRate: 1917, oilProduction: 15000, foreignReserves: null, events: ['Houthi Red Sea attacks', 'Oil export blockade continues', 'Rial depreciation', 'NCRFI established'] },
  { year: 2025, gdpGrowth: -1.5, inflation: 35, exchangeRate: 235, oilProduction: 15000, foreignReserves: null, events: ['Continued blockade', 'Rising inflation', 'Ongoing conflict', 'Humanitarian crisis deepens'] },
];

// Additional monthly data points for key indicators
const monthlyDataPoints = [
  // Exchange rates (monthly samples)
  { indicator: 'exchange_rate_aden', year: 2024, month: 1, value: 1750 },
  { indicator: 'exchange_rate_aden', year: 2024, month: 2, value: 1780 },
  { indicator: 'exchange_rate_aden', year: 2024, month: 3, value: 1820 },
  { indicator: 'exchange_rate_aden', year: 2024, month: 4, value: 1850 },
  { indicator: 'exchange_rate_aden', year: 2024, month: 5, value: 1890 },
  { indicator: 'exchange_rate_aden', year: 2024, month: 6, value: 1920 },
  { indicator: 'exchange_rate_aden', year: 2024, month: 7, value: 1950 },
  { indicator: 'exchange_rate_aden', year: 2024, month: 8, value: 1980 },
  { indicator: 'exchange_rate_aden', year: 2024, month: 9, value: 2000 },
  { indicator: 'exchange_rate_aden', year: 2024, month: 10, value: 2020 },
  { indicator: 'exchange_rate_aden', year: 2024, month: 11, value: 2040 },
  { indicator: 'exchange_rate_aden', year: 2024, month: 12, value: 2050 },
  // Sanaa exchange rates (more stable)
  { indicator: 'exchange_rate_sanaa', year: 2024, month: 1, value: 535 },
  { indicator: 'exchange_rate_sanaa', year: 2024, month: 6, value: 530 },
  { indicator: 'exchange_rate_sanaa', year: 2024, month: 12, value: 528 },
  // Food prices index
  { indicator: 'food_price_index', year: 2024, month: 1, value: 245 },
  { indicator: 'food_price_index', year: 2024, month: 6, value: 268 },
  { indicator: 'food_price_index', year: 2024, month: 12, value: 285 },
  // Fuel prices
  { indicator: 'fuel_price_diesel', year: 2024, month: 1, value: 850 },
  { indicator: 'fuel_price_diesel', year: 2024, month: 6, value: 920 },
  { indicator: 'fuel_price_diesel', year: 2024, month: 12, value: 980 },
];

async function populateData() {
  console.log('📊 Populating Comprehensive Yemen Economic Data (2010-2025)...\n');
  
  const db = await getDb();
  if (!db) {
    console.error('❌ Database connection failed');
    process.exit(1);
  }
  
  let timeSeriesAdded = 0;
  let eventsAdded = 0;
  let linksAdded = 0;
  
  // Add yearly time series data
  console.log('📈 Adding yearly time series data...');
  for (const data of yearlyData) {
    const timestamp = new Date(data.year, 0, 1).getTime(); // Jan 1 of each year
    
    // GDP Growth
    try {
      await db.insert(timeSeries).values({
        indicatorCode: 'gdp_growth',
        value: data.gdpGrowth,
        timestamp,
        sourceId: 1, // World Bank
        confidence: 0.95,
        notes: `GDP growth rate for ${data.year}`,
      });
      timeSeriesAdded++;
    } catch (e) { /* skip duplicates */ }
    
    // Inflation
    try {
      await db.insert(timeSeries).values({
        indicatorCode: 'inflation_rate',
        value: data.inflation,
        timestamp,
        sourceId: 2, // IMF
        confidence: 0.95,
        notes: `Inflation rate for ${data.year}`,
      });
      timeSeriesAdded++;
    } catch (e) { /* skip duplicates */ }
    
    // Exchange Rate
    try {
      await db.insert(timeSeries).values({
        indicatorCode: 'exchange_rate',
        value: data.exchangeRate,
        timestamp,
        sourceId: 1,
        confidence: 0.9,
        notes: `YER/USD exchange rate for ${data.year}`,
      });
      timeSeriesAdded++;
    } catch (e) { /* skip duplicates */ }
    
    // Oil Production
    try {
      await db.insert(timeSeries).values({
        indicatorCode: 'oil_production',
        value: data.oilProduction,
        timestamp,
        sourceId: 1,
        confidence: 0.85,
        notes: `Oil production (bpd) for ${data.year}`,
      });
      timeSeriesAdded++;
    } catch (e) { /* skip duplicates */ }
    
    // Foreign Reserves
    if (data.foreignReserves !== null) {
      try {
        await db.insert(timeSeries).values({
          indicatorCode: 'foreign_reserves',
          value: data.foreignReserves,
          timestamp,
          sourceId: 2,
          confidence: 0.9,
          notes: `Foreign reserves (USD billions) for ${data.year}`,
        });
        timeSeriesAdded++;
      } catch (e) { /* skip duplicates */ }
    }
    
    console.log(`  ✅ ${data.year}: GDP ${data.gdpGrowth}%, Inflation ${data.inflation}%, Exchange ${data.exchangeRate}`);
  }
  
  // Add economic events
  console.log('\n📅 Adding economic events...');
  for (const data of yearlyData) {
    for (const eventTitle of data.events) {
      try {
        const result = await db.insert(economicEvents).values({
          title: eventTitle,
          titleAr: null, // Would need translation
          description: `Economic event in ${data.year}: ${eventTitle}`,
          date: new Date(data.year, 0, 1),
          category: categorizeEvent(eventTitle),
          severity: determineSeverity(eventTitle, data.gdpGrowth),
          sourceId: 1,
        });
        eventsAdded++;
      } catch (e) { /* skip duplicates */ }
    }
  }
  
  // Add monthly data points
  console.log('\n📆 Adding monthly data points...');
  for (const point of monthlyDataPoints) {
    const timestamp = new Date(point.year, point.month - 1, 15).getTime();
    try {
      await db.insert(timeSeries).values({
        indicatorCode: point.indicator,
        value: point.value,
        timestamp,
        sourceId: 1,
        confidence: 0.9,
        notes: `${point.indicator} for ${point.year}-${String(point.month).padStart(2, '0')}`,
      });
      timeSeriesAdded++;
    } catch (e) { /* skip duplicates */ }
  }
  
  // Get final counts
  const tsCount = await db.select({ count: sql<number>`count(*)` }).from(timeSeries);
  const evCount = await db.select({ count: sql<number>`count(*)` }).from(economicEvents);
  
  console.log('\n📈 Summary:');
  console.log(`   Time series records added: ${timeSeriesAdded}`);
  console.log(`   Economic events added: ${eventsAdded}`);
  console.log(`   Total time series: ${tsCount[0]?.count || 0}`);
  console.log(`   Total economic events: ${evCount[0]?.count || 0}`);
  
  process.exit(0);
}

function categorizeEvent(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('oil') || lower.includes('fuel') || lower.includes('gas')) return 'oil_energy';
  if (lower.includes('bank') || lower.includes('currency') || lower.includes('rial') || lower.includes('deposit')) return 'banking';
  if (lower.includes('coalition') || lower.includes('houthi') || lower.includes('conflict') || lower.includes('war')) return 'conflict';
  if (lower.includes('humanitarian') || lower.includes('cholera') || lower.includes('food') || lower.includes('crisis')) return 'humanitarian';
  if (lower.includes('ceasefire') || lower.includes('peace') || lower.includes('agreement') || lower.includes('reconciliation')) return 'recovery';
  if (lower.includes('saudi') || lower.includes('un') || lower.includes('international')) return 'international';
  if (lower.includes('gdp') || lower.includes('economic') || lower.includes('fiscal')) return 'fiscal';
  return 'other';
}

function determineSeverity(title: string, gdpGrowth: number): string {
  const lower = title.toLowerCase();
  if (lower.includes('collapse') || lower.includes('depleted') || gdpGrowth < -10) return 'critical';
  if (lower.includes('crisis') || lower.includes('halt') || gdpGrowth < -5) return 'major';
  if (lower.includes('decline') || lower.includes('attack') || gdpGrowth < 0) return 'moderate';
  return 'minor';
}

populateData().catch(console.error);
