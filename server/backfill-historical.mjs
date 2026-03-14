/**
 * Historical Document Backfill (2010-2022)
 * Fetches Yemen-specific academic papers from OpenAlex with strict filtering
 */

import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';

const DATABASE_URL = process.env.DATABASE_URL;

const YEMEN_KEYWORDS = ['yemen', 'yemeni', 'sanaa', "sana'a", 'aden', 'houthi', 'ansar allah', 
  'riyal', 'taiz', 'hodeidah', 'hudaydah', 'marib', 'hadramaut', 'socotra', 'cby'];

const SECTOR_KEYWORDS = {
  banking_finance: ['bank', 'banking', 'financial', 'credit', 'monetary', 'central bank', 'microfinance', 'remittance'],
  macroeconomic: ['gdp', 'economic growth', 'macroeconom', 'inflation', 'fiscal', 'economic development', 'economic crisis'],
  currency_fx: ['exchange rate', 'currency', 'riyal', 'devaluation', 'dollarization'],
  trade: ['trade', 'export', 'import', 'tariff', 'customs', 'port', 'shipping'],
  food_security: ['food security', 'famine', 'hunger', 'malnutrition', 'food price', 'food crisis'],
  humanitarian: ['humanitarian', 'aid', 'refugee', 'displacement', 'idp', 'crisis response'],
  energy: ['energy', 'fuel', 'oil', 'gas', 'electricity', 'solar', 'power'],
  labor_market: ['employment', 'unemployment', 'labor', 'labour', 'wage', 'workforce'],
  poverty: ['poverty', 'inequality', 'living standards', 'welfare', 'social protection'],
  conflict: ['conflict', 'war', 'violence', 'peace', 'ceasefire', 'political economy'],
  infrastructure: ['infrastructure', 'transport', 'water', 'sanitation', 'reconstruction'],
  agriculture: ['agriculture', 'farming', 'crop', 'livestock', 'rural', 'irrigation'],
  health: ['health', 'cholera', 'disease', 'hospital', 'medical', 'healthcare'],
  education: ['education', 'school', 'university', 'literacy', 'student'],
  governance: ['governance', 'corruption', 'institution', 'government', 'public sector'],
};

function classifySectors(title, abstract) {
  const text = `${title} ${abstract || ''}`.toLowerCase();
  const sectors = [];
  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) sectors.push(sector);
  }
  if (sectors.length === 0) sectors.push('macroeconomic');
  return sectors;
}

function classifyDocType(type) {
  const map = { 'journal-article': 'academic_paper', 'book-chapter': 'academic_paper', 'proceedings-article': 'academic_paper', 'dissertation': 'thesis', 'posted-content': 'working_paper' };
  return map[type] || 'report';
}

function isYemenRelated(title, abstract) {
  const text = `${title} ${abstract || ''}`.toLowerCase();
  return YEMEN_KEYWORDS.some(kw => text.includes(kw));
}

function reconstructAbstract(invertedIndex) {
  if (!invertedIndex) return null;
  return Object.entries(invertedIndex)
    .flatMap(([word, positions]) => positions.map(pos => ({ word, pos })))
    .sort((a, b) => a.pos - b.pos)
    .map(x => x.word)
    .join(' ');
}

async function fetchOpenAlex(query, yearFrom, yearTo, page = 1) {
  const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&filter=from_publication_date:${yearFrom}-01-01,to_publication_date:${yearTo}-12-31&sort=cited_by_count:desc&page=${page}&per_page=50&mailto=yeto@causewaygrp.com`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function main() {
  console.log('📚 Historical backfill (2010-2022)...\n');
  const conn = await mysql.createConnection(DATABASE_URL);
  
  const [existing] = await conn.execute('SELECT title FROM library_documents');
  const existingTitles = new Set(existing.map(r => r.title.toLowerCase().trim()));
  console.log(`Existing: ${existingTitles.size}\n`);
  
  const queries = [
    'Yemen economy', 'Yemen economic development', 'Yemen conflict economy',
    'Yemen food crisis famine', 'Yemen humanitarian aid', 'Yemen banking finance',
    'Yemen trade port', 'Yemen poverty inequality', 'Yemen labor employment',
    'Yemen agriculture rural', 'Yemen energy oil', 'Yemen infrastructure water',
    'Yemen health system', 'Yemen education', 'Yemen governance corruption',
    'Yemen currency exchange', 'Yemen remittances', 'Yemen fiscal policy',
    'Yemen reconstruction', 'Yemen private sector',
  ];
  
  // Search across year ranges for better coverage
  const yearRanges = [
    ['2010', '2014'],
    ['2015', '2018'],
    ['2019', '2022'],
  ];
  
  let inserted = 0, skipped = 0;
  
  for (const query of queries) {
    for (const [yearFrom, yearTo] of yearRanges) {
      console.log(`🔍 "${query}" (${yearFrom}-${yearTo})...`);
      
      for (let page = 1; page <= 2; page++) {
        const data = await fetchOpenAlex(query, yearFrom, yearTo, page);
        if (!data?.results?.length) break;
        
        for (const work of data.results) {
          const title = work.title?.trim();
          if (!title) continue;
          if (existingTitles.has(title.toLowerCase().trim())) { skipped++; continue; }
          
          const abstract = reconstructAbstract(work.abstract_inverted_index);
          if (!isYemenRelated(title, abstract)) { skipped++; continue; }
          
          const sectors = classifySectors(title, abstract);
          const docType = classifyDocType(work.type);
          const publisher = work.primary_location?.source?.display_name 
            || work.authorships?.[0]?.institutions?.[0]?.display_name || 'Unknown';
          const pubDate = work.publication_date || null;
          const url = work.doi ? `https://doi.org/${work.doi.replace('https://doi.org/', '')}` : work.primary_location?.landing_page_url || null;
          const license = work.open_access?.is_oa ? 'open' : 'restricted_metadata_only';
          const id = uuidv4();
          const cleanAbstract = abstract?.replace(/<[^>]+>/g, '').substring(0, 2000) || null;
          
          try {
            await conn.execute(
              `INSERT INTO library_documents (id, title, publisher, doc_type, sectors, entities, license_flag, 
               content_hash, extraction_status, publication_date, status, importance_score, summary_en, canonical_url, language_original)
               VALUES (?, ?, ?, ?, ?, '[]', ?, ?, 'pending', ?, 'published', ?, ?, ?, 'en')`,
              [id, title.substring(0, 500), publisher.substring(0, 255), docType, JSON.stringify(sectors),
               license, id, pubDate, Math.min(100, Math.max(10, (work.cited_by_count || 0) + 20)),
               cleanAbstract, url]
            );
            existingTitles.add(title.toLowerCase().trim());
            inserted++;
          } catch (err) {
            if (err.code !== 'ER_DUP_ENTRY') console.error(`  Error: ${err.message.substring(0, 80)}`);
          }
        }
        await new Promise(r => setTimeout(r, 200));
      }
    }
  }
  
  const [count] = await conn.execute('SELECT COUNT(*) as cnt FROM library_documents');
  const [years] = await conn.execute('SELECT YEAR(publication_date) as yr, COUNT(*) as cnt FROM library_documents WHERE publication_date IS NOT NULL GROUP BY yr ORDER BY yr');
  
  console.log(`\n✅ Done! Inserted: ${inserted}, Skipped: ${skipped}`);
  console.log(`Total documents: ${count[0].cnt}`);
  console.log('Year distribution:');
  years.forEach(r => console.log(`  ${r.yr}: ${r.cnt}`));
  
  await conn.end();
}

main().catch(err => { console.error(err); process.exit(1); });
