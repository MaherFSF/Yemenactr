/**
 * Document Backfill Script
 * Fetches academic papers and reports about Yemen's economy from OpenAlex API
 * and inserts them into the library_documents table
 */

import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';

const DATABASE_URL = process.env.DATABASE_URL;

// Sector mapping based on keywords in titles/abstracts
const SECTOR_KEYWORDS = {
  banking_finance: ['bank', 'banking', 'financial', 'credit', 'monetary policy', 'central bank', 'microfinance', 'remittance'],
  macroeconomic: ['gdp', 'economic growth', 'macroeconom', 'inflation', 'fiscal', 'economic development', 'economic crisis'],
  currency_fx: ['exchange rate', 'currency', 'riyal', 'devaluation', 'dollarization'],
  trade: ['trade', 'export', 'import', 'tariff', 'customs', 'port', 'shipping'],
  food_security: ['food security', 'famine', 'hunger', 'malnutrition', 'food price', 'food crisis', 'food aid'],
  humanitarian: ['humanitarian', 'aid', 'refugee', 'displacement', 'idp', 'crisis response', 'relief'],
  energy: ['energy', 'fuel', 'oil', 'gas', 'electricity', 'solar', 'power'],
  labor_market: ['employment', 'unemployment', 'labor', 'labour', 'wage', 'workforce', 'job'],
  poverty: ['poverty', 'inequality', 'living standards', 'welfare', 'social protection'],
  conflict: ['conflict', 'war', 'violence', 'peace', 'ceasefire', 'political economy'],
  infrastructure: ['infrastructure', 'transport', 'water', 'sanitation', 'reconstruction'],
  agriculture: ['agriculture', 'farming', 'crop', 'livestock', 'rural', 'irrigation'],
  health: ['health', 'cholera', 'disease', 'hospital', 'medical', 'healthcare'],
  education: ['education', 'school', 'university', 'literacy', 'student'],
  governance: ['governance', 'corruption', 'institution', 'government', 'public sector', 'state building'],
};

function classifySectors(title, abstract) {
  const text = `${title} ${abstract || ''}`.toLowerCase();
  const sectors = [];
  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) {
      sectors.push(sector);
    }
  }
  // Default to macroeconomic if no sector matched
  if (sectors.length === 0) sectors.push('macroeconomic');
  return sectors;
}

function classifyDocType(type) {
  const typeMap = {
    'journal-article': 'academic_paper',
    'book-chapter': 'academic_paper',
    'proceedings-article': 'academic_paper',
    'book': 'report',
    'dissertation': 'thesis',
    'report': 'report',
    'dataset': 'dataset_doc',
    'posted-content': 'working_paper',
    'monograph': 'report',
    'review': 'academic_paper',
  };
  return typeMap[type] || 'report';
}

async function fetchOpenAlexWorks(query, page = 1, perPage = 50) {
  const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&filter=from_publication_date:2010-01-01&sort=publication_date:desc&page=${page}&per_page=${perPage}&mailto=yeto@causewaygrp.com`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`OpenAlex API error: ${response.status}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error.message);
    return null;
  }
}

async function main() {
  console.log('🔬 Starting document backfill from OpenAlex...\n');
  
  const conn = await mysql.createConnection(DATABASE_URL);
  
  // Get existing document titles to avoid duplicates
  const [existing] = await conn.execute('SELECT title FROM library_documents');
  const existingTitles = new Set(existing.map(r => r.title.toLowerCase().trim()));
  console.log(`Found ${existingTitles.size} existing documents\n`);
  
  // Search queries covering all Yemen economic sectors
  const queries = [
    'Yemen economy',
    'Yemen economic crisis',
    'Yemen food security',
    'Yemen humanitarian crisis',
    'Yemen banking financial system',
    'Yemen currency exchange rate',
    'Yemen trade exports',
    'Yemen poverty development',
    'Yemen conflict economic impact',
    'Yemen aid humanitarian funding',
    'Yemen labor market employment',
    'Yemen agriculture rural',
    'Yemen energy fuel crisis',
    'Yemen infrastructure reconstruction',
    'Yemen fiscal policy public finance',
    'Yemen monetary policy central bank',
    'Yemen remittances diaspora',
    'Yemen microfinance',
    'Yemen governance institutions',
    'Yemen health system',
    'Yemen education crisis',
    'Yemen water sanitation',
    'Yemen private sector investment',
    'Yemen Houthi economy',
    'Yemen Aden economy',
    'Yemen reconstruction',
  ];
  
  let totalInserted = 0;
  let totalSkipped = 0;
  
  for (const query of queries) {
    console.log(`\n📚 Searching: "${query}"...`);
    
    // Fetch 2 pages per query (100 results)
    for (let page = 1; page <= 2; page++) {
      const data = await fetchOpenAlexWorks(query, page, 50);
      if (!data || !data.results || data.results.length === 0) {
        break;
      }
      
      console.log(`  Page ${page}: ${data.results.length} results`);
      
      for (const work of data.results) {
        const title = work.title?.trim();
        if (!title) continue;
        
        // Skip duplicates
        if (existingTitles.has(title.toLowerCase().trim())) {
          totalSkipped++;
          continue;
        }
        
        // Skip non-English titles that are clearly not about Yemen
        if (!title.match(/[a-zA-Z]/)) continue;
        
        const abstract = work.abstract_inverted_index 
          ? Object.entries(work.abstract_inverted_index)
              .flatMap(([word, positions]) => positions.map(pos => ({ word, pos })))
              .sort((a, b) => a.pos - b.pos)
              .map(x => x.word)
              .join(' ')
          : null;
        
        const sectors = classifySectors(title, abstract);
        const docType = classifyDocType(work.type);
        const publisherName = work.primary_location?.source?.display_name 
          || work.authorships?.[0]?.institutions?.[0]?.display_name 
          || 'Unknown Publisher';
        
        const pubDate = work.publication_date || null;
        const canonicalUrl = work.doi ? `https://doi.org/${work.doi.replace('https://doi.org/', '')}` : (work.primary_location?.landing_page_url || null);
        
        // Determine license
        let licenseFlag = 'unknown_requires_review';
        if (work.open_access?.is_oa) {
          licenseFlag = 'open';
        } else if (work.primary_location?.is_oa) {
          licenseFlag = 'open';
        }
        
        const id = uuidv4();
        
        try {
          await conn.execute(
            `INSERT INTO library_documents (id, title, title_ar, publisher, doc_type, sectors, entities, license_flag, 
             s3_key, content_hash, extraction_status, publication_date, status, importance_score, summary_en, canonical_url, language_original)
             VALUES (?, ?, NULL, ?, ?, ?, '[]', ?, NULL, ?, 'pending', ?, 'published', ?, ?, ?, 'en')`,
            [
              id,
              title.substring(0, 500),
              publisherName.substring(0, 255),
              docType,
              JSON.stringify(sectors),
              licenseFlag === 'open' ? 'open' : 'restricted_metadata_only',
              id, // Use UUID as content hash for uniqueness
              pubDate,
              Math.min(100, Math.max(10, (work.cited_by_count || 0) + 30)),
              abstract ? abstract.substring(0, 2000) : null,
              canonicalUrl,
            ]
          );
          
          existingTitles.add(title.toLowerCase().trim());
          totalInserted++;
        } catch (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            totalSkipped++;
          } else {
            console.error(`  Error inserting "${title.substring(0, 50)}...":`, err.message);
          }
        }
      }
      
      // Rate limiting - be polite to OpenAlex
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  // Get final count
  const [countResult] = await conn.execute('SELECT COUNT(*) as cnt FROM library_documents');
  
  console.log(`\n✅ Backfill complete!`);
  console.log(`   Inserted: ${totalInserted}`);
  console.log(`   Skipped (duplicates): ${totalSkipped}`);
  console.log(`   Total documents now: ${countResult[0].cnt}`);
  
  await conn.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
