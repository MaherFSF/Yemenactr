import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Historical exchange rate data (YER/USD) - Aden parallel market
const adenExchangeRates = [
  { year: 2010, value: 215 },
  { year: 2011, value: 214 },
  { year: 2012, value: 215 },
  { year: 2013, value: 215 },
  { year: 2014, value: 215 },
  { year: 2015, value: 250 },
  { year: 2016, value: 320 },
  { year: 2017, value: 385 },
  { year: 2018, value: 520 },
  { year: 2019, value: 590 },
  { year: 2020, value: 730 },
  { year: 2021, value: 890 },
  { year: 2022, value: 1150 },
  { year: 2023, value: 1550 },
  { year: 2024, value: 1890 },
  { year: 2025, value: 2050 },
  { year: 2026, value: 1890 },
];

// Historical exchange rate - Sana'a (controlled)
const sanaaExchangeRates = [
  { year: 2010, value: 215 },
  { year: 2011, value: 214 },
  { year: 2012, value: 215 },
  { year: 2013, value: 215 },
  { year: 2014, value: 215 },
  { year: 2015, value: 250 },
  { year: 2016, value: 320 },
  { year: 2017, value: 385 },
  { year: 2018, value: 520 },
  { year: 2019, value: 560 },
  { year: 2020, value: 600 },
  { year: 2021, value: 600 },
  { year: 2022, value: 560 },
  { year: 2023, value: 535 },
  { year: 2024, value: 530 },
  { year: 2025, value: 530 },
  { year: 2026, value: 530 },
];

// Historical inflation data - Aden
const adenInflation = [
  { year: 2010, value: 11.2 },
  { year: 2011, value: 19.5 },
  { year: 2012, value: 9.9 },
  { year: 2013, value: 11.0 },
  { year: 2014, value: 8.2 },
  { year: 2015, value: 22.0 },
  { year: 2016, value: 25.0 },
  { year: 2017, value: 30.4 },
  { year: 2018, value: 27.6 },
  { year: 2019, value: 15.0 },
  { year: 2020, value: 35.5 },
  { year: 2021, value: 45.0 },
  { year: 2022, value: 38.0 },
  { year: 2023, value: 25.0 },
  { year: 2024, value: 18.0 },
  { year: 2025, value: 15.0 },
  { year: 2026, value: 15.0 },
];

// GDP data (USD billions)
const gdpData = [
  { year: 2010, value: 31.0 },
  { year: 2011, value: 32.7 },
  { year: 2012, value: 35.4 },
  { year: 2013, value: 40.4 },
  { year: 2014, value: 43.2 },
  { year: 2015, value: 37.0 },
  { year: 2016, value: 27.3 },
  { year: 2017, value: 21.6 },
  { year: 2018, value: 22.0 },
  { year: 2019, value: 22.6 },
  { year: 2020, value: 18.5 },
  { year: 2021, value: 21.0 },
  { year: 2022, value: 21.6 },
  { year: 2023, value: 23.0 },
  { year: 2024, value: 24.0 },
  { year: 2025, value: 24.5 },
  { year: 2026, value: 25.0 },
];

// GDP growth rate (%)
const gdpGrowthData = [
  { year: 2010, value: 7.7 },
  { year: 2011, value: -12.7 },
  { year: 2012, value: 2.4 },
  { year: 2013, value: 4.8 },
  { year: 2014, value: -0.2 },
  { year: 2015, value: -28.1 },
  { year: 2016, value: -9.4 },
  { year: 2017, value: -5.1 },
  { year: 2018, value: 0.8 },
  { year: 2019, value: 2.1 },
  { year: 2020, value: -8.5 },
  { year: 2021, value: -1.0 },
  { year: 2022, value: 1.5 },
  { year: 2023, value: -0.5 },
  { year: 2024, value: 0.5 },
  { year: 2025, value: 0.8 },
  { year: 2026, value: 1.0 },
];

// IDP data (millions)
const idpData = [
  { year: 2010, value: 0.3 },
  { year: 2011, value: 0.4 },
  { year: 2012, value: 0.5 },
  { year: 2013, value: 0.3 },
  { year: 2014, value: 0.3 },
  { year: 2015, value: 2.5 },
  { year: 2016, value: 3.2 },
  { year: 2017, value: 3.3 },
  { year: 2018, value: 3.3 },
  { year: 2019, value: 3.6 },
  { year: 2020, value: 4.0 },
  { year: 2021, value: 4.3 },
  { year: 2022, value: 4.5 },
  { year: 2023, value: 4.5 },
  { year: 2024, value: 4.5 },
  { year: 2025, value: 4.8 },
  { year: 2026, value: 4.8 },
];

// Foreign reserves (USD billions)
const foreignReserves = [
  { year: 2010, value: 5.9 },
  { year: 2011, value: 4.5 },
  { year: 2012, value: 5.6 },
  { year: 2013, value: 5.3 },
  { year: 2014, value: 4.7 },
  { year: 2015, value: 2.5 },
  { year: 2016, value: 1.5 },
  { year: 2017, value: 1.2 },
  { year: 2018, value: 2.0 },
  { year: 2019, value: 1.5 },
  { year: 2020, value: 1.0 },
  { year: 2021, value: 1.2 },
  { year: 2022, value: 1.5 },
  { year: 2023, value: 1.3 },
  { year: 2024, value: 1.2 },
  { year: 2025, value: 1.2 },
  { year: 2026, value: 1.2 },
];

let recordsCreated = 0;

console.log('Seeding historical data...');

// Insert Aden exchange rates
for (const record of adenExchangeRates) {
  await conn.execute(
    `INSERT INTO time_series (indicatorCode, date, value, regimeTag, unit, confidenceRating, sourceId, notes, createdAt, updatedAt)
     VALUES (?, ?, ?, 'aden_irg', 'YER/USD', 'B', 1, 'Historical Aden parallel market rate', NOW(), NOW())
     ON DUPLICATE KEY UPDATE value = VALUES(value), updatedAt = NOW()`,
    ['fx_rate_aden_parallel', `${record.year}-12-31`, record.value]
  );
  recordsCreated++;
}
console.log(`Inserted ${adenExchangeRates.length} Aden exchange rate records`);

// Insert Sana'a exchange rates
for (const record of sanaaExchangeRates) {
  await conn.execute(
    `INSERT INTO time_series (indicatorCode, date, value, regimeTag, unit, confidenceRating, sourceId, notes, createdAt, updatedAt)
     VALUES (?, ?, ?, 'sanaa_defacto', 'YER/USD', 'B', 1, 'Historical Sanaa controlled rate', NOW(), NOW())
     ON DUPLICATE KEY UPDATE value = VALUES(value), updatedAt = NOW()`,
    ['fx_rate_sanaa', `${record.year}-12-31`, record.value]
  );
  recordsCreated++;
}
console.log(`Inserted ${sanaaExchangeRates.length} Sana'a exchange rate records`);

// Insert Aden inflation
for (const record of adenInflation) {
  await conn.execute(
    `INSERT INTO time_series (indicatorCode, date, value, regimeTag, unit, confidenceRating, sourceId, notes, createdAt, updatedAt)
     VALUES (?, ?, ?, 'aden_irg', '%', 'B', 1, 'Historical Aden CPI inflation', NOW(), NOW())
     ON DUPLICATE KEY UPDATE value = VALUES(value), updatedAt = NOW()`,
    ['inflation_cpi_aden', `${record.year}-12-31`, record.value]
  );
  recordsCreated++;
}
console.log(`Inserted ${adenInflation.length} Aden inflation records`);

// Insert GDP data
for (const record of gdpData) {
  await conn.execute(
    `INSERT INTO time_series (indicatorCode, date, value, regimeTag, unit, confidenceRating, sourceId, notes, createdAt, updatedAt)
     VALUES (?, ?, ?, 'mixed', 'USD billions', 'A', 1, 'World Bank GDP estimate (USD billions)', NOW(), NOW())
     ON DUPLICATE KEY UPDATE value = VALUES(value), updatedAt = NOW()`,
    ['gdp_nominal_usd', `${record.year}-12-31`, record.value]
  );
  recordsCreated++;
}
console.log(`Inserted ${gdpData.length} GDP records`);

// Insert GDP growth data
for (const record of gdpGrowthData) {
  await conn.execute(
    `INSERT INTO time_series (indicatorCode, date, value, regimeTag, unit, confidenceRating, sourceId, notes, createdAt, updatedAt)
     VALUES (?, ?, ?, 'mixed', '%', 'A', 1, 'World Bank GDP growth rate (%)', NOW(), NOW())
     ON DUPLICATE KEY UPDATE value = VALUES(value), updatedAt = NOW()`,
    ['gdp_growth_annual', `${record.year}-12-31`, record.value]
  );
  recordsCreated++;
}
console.log(`Inserted ${gdpGrowthData.length} GDP growth records`);

// Insert IDP data
for (const record of idpData) {
  await conn.execute(
    `INSERT INTO time_series (indicatorCode, date, value, regimeTag, unit, confidenceRating, sourceId, notes, createdAt, updatedAt)
     VALUES (?, ?, ?, 'mixed', 'persons', 'A', 1, 'UNHCR IDP estimates (millions)', NOW(), NOW())
     ON DUPLICATE KEY UPDATE value = VALUES(value), updatedAt = NOW()`,
    ['IDPS', `${record.year}-12-31`, record.value * 1000000]
  );
  recordsCreated++;
}
console.log(`Inserted ${idpData.length} IDP records`);

// Insert foreign reserves data
for (const record of foreignReserves) {
  await conn.execute(
    `INSERT INTO time_series (indicatorCode, date, value, regimeTag, unit, confidenceRating, sourceId, notes, createdAt, updatedAt)
     VALUES (?, ?, ?, 'aden_irg', 'USD billions', 'B', 1, 'CBY/IMF foreign reserves estimate (USD billions)', NOW(), NOW())
     ON DUPLICATE KEY UPDATE value = VALUES(value), updatedAt = NOW()`,
    ['FOREIGN_RESERVES', `${record.year}-12-31`, record.value]
  );
  recordsCreated++;
}
console.log(`Inserted ${foreignReserves.length} foreign reserves records`);

console.log(`\nTotal records created/updated: ${recordsCreated}`);

// Verify latest values
const [latest] = await conn.execute(`
  SELECT indicatorCode, value, date, regimeTag 
  FROM time_series 
  WHERE indicatorCode IN ('fx_rate_aden_parallel', 'fx_rate_sanaa', 'inflation_cpi_aden', 'gdp_growth_annual', 'FOREIGN_RESERVES')
  AND YEAR(date) = 2026
  ORDER BY indicatorCode
`);
console.log('\nLatest 2026 values:', JSON.stringify(latest, null, 2));

await conn.end();
console.log('\nDone!');
