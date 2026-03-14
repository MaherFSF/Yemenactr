/**
 * OpenAlex Academic Research Ingestion - Yemen Economy Publications since 2010
 * OpenAlex is free, no API key needed, and has 19,000+ results for Yemen economy
 */
import { db } from '../db';
import { sql } from 'drizzle-orm';

async function safeFetch(url: string, retries = 2): Promise<any> {
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'YETO/1.0 (mailto:admin@yeto.org)' } });
      clearTimeout(timeout);
      if (!res.ok) { if (i === retries) return null; await new Promise(r => setTimeout(r, 3000)); continue; }
      return await res.json();
    } catch { if (i === retries) return null; await new Promise(r => setTimeout(r, 3000)); }
  }
  return null;
}

async function main() {
  console.log('=== OPENALEX RESEARCH INGESTION ===');
  let inserted = 0;
  
  const searchTerms = [
    'Yemen economy GDP growth',
    'Yemen banking sector central bank',
    'Yemen humanitarian crisis food security',
    'Yemen conflict economics war impact',
    'Yemen remittances diaspora',
    'Yemen trade imports exports',
    'Yemen poverty inequality development',
    'Yemen currency exchange rate inflation',
    'Yemen labor market employment',
    'Yemen energy oil sector',
    'Yemen agriculture water scarcity',
    'Yemen public finance debt fiscal',
    'Yemen aid donor humanitarian funding',
    'Yemen sanctions compliance',
    'Yemen microfinance financial inclusion',
  ];
  
  for (const term of searchTerms) {
    console.log(`\nSearching: "${term}"`);
    
    // Fetch up to 100 results per search term
    for (let page = 1; page <= 2; page++) {
      const url = `https://api.openalex.org/works?search=${encodeURIComponent(term)}&filter=from_publication_date:2010-01-01,to_publication_date:2026-12-31&sort=relevance_score:desc&per_page=50&page=${page}`;
      const data = await safeFetch(url);
      
      if (!data || !data.results || data.results.length === 0) break;
      
      for (const work of data.results) {
        const title = work.title || work.display_name || '';
        if (!title || title.length < 15) continue;
        
        const pubYear = work.publication_year || 2024;
        const pubDate = work.publication_date ? new Date(work.publication_date) : new Date(`${pubYear}-06-15`);
        
        // Classify research category
        let category = 'macroeconomic_analysis';
        const lt = title.toLowerCase();
        if (lt.includes('bank') || lt.includes('financ') || lt.includes('monetary') || lt.includes('credit')) category = 'banking_sector';
        if (lt.includes('food') || lt.includes('famine') || lt.includes('hunger') || lt.includes('nutrition') || lt.includes('malnutrition')) category = 'food_security';
        if (lt.includes('humanitarian') || lt.includes('aid') || lt.includes('relief') || lt.includes('donor')) category = 'humanitarian_finance';
        if (lt.includes('conflict') || lt.includes('war') || lt.includes('violence') || lt.includes('military')) category = 'conflict_economics';
        if (lt.includes('trade') || lt.includes('export') || lt.includes('import') || lt.includes('tariff')) category = 'trade_external';
        if (lt.includes('labor') || lt.includes('employ') || lt.includes('unemployment') || lt.includes('wage')) category = 'labor_market';
        if (lt.includes('poverty') || lt.includes('inequality') || lt.includes('development')) category = 'poverty_development';
        if (lt.includes('sanction') || lt.includes('compliance')) category = 'sanctions_compliance';
        if (lt.includes('energy') || lt.includes('oil') || lt.includes('fuel') || lt.includes('electricity')) category = 'energy_infrastructure';
        if (lt.includes('currency') || lt.includes('exchange rate') || lt.includes('inflation') || lt.includes('price')) category = 'monetary_policy';
        if (lt.includes('fiscal') || lt.includes('debt') || lt.includes('budget') || lt.includes('tax')) category = 'fiscal_policy';
        
        // Determine publication type
        let pubType = 'research_paper';
        const workType = work.type || '';
        if (workType === 'report') pubType = 'evaluation_report';
        if (workType === 'book-chapter') pubType = 'working_paper';
        if (workType === 'review') pubType = 'policy_brief';
        if (workType === 'dataset') pubType = 'statistical_bulletin';
        
        // Get DOI or URL
        const doi = work.doi || '';
        const sourceUrl = doi ? doi : (work.id || '');
        const externalId = `OA-${(work.id || '').replace('https://openalex.org/', '')}`;
        
        // Get abstract snippet if available
        let abstractText = '';
        if (work.abstract_inverted_index) {
          // Reconstruct abstract from inverted index (first 500 chars)
          const words: [string, number][] = [];
          for (const [word, positions] of Object.entries(work.abstract_inverted_index as Record<string, number[]>)) {
            for (const pos of positions) {
              words.push([word, pos]);
            }
          }
          words.sort((a, b) => a[1] - b[1]);
          abstractText = words.map(w => w[0]).join(' ').substring(0, 2000);
        }
        
        // Get source/journal name
        const sourceName = work.primary_location?.source?.display_name || '';
        const isOpenAccess = work.open_access?.is_oa || false;
        
        try {
          await db.execute(sql`
            INSERT INTO research_publications (title, abstract, publicationType, researchCategory, publicationDate, publicationYear, organizationId, externalId, sourceUrl, language, status)
            VALUES (${title.substring(0, 500)}, ${(abstractText || `Source: ${sourceName}. Open Access: ${isOpenAccess}`).substring(0, 2000)}, ${pubType}, ${category}, ${pubDate}, ${pubYear}, ${10}, ${externalId}, ${sourceUrl.substring(0, 500)}, ${work.language || 'en'}, ${'published'})
            ON DUPLICATE KEY UPDATE updatedAt = NOW()
          `);
          inserted++;
        } catch { /* skip duplicates */ }
      }
      
      console.log(`  Page ${page}: ${data.results.length} results (${inserted} total inserted)`);
      await new Promise(r => setTimeout(r, 1500));
    }
  }
  
  // Final count
  const pubCnt = await db.execute(sql`SELECT COUNT(*) as cnt FROM research_publications`);
  console.log(`\nOpenAlex total: ${inserted} publications ingested`);
  console.log(`Total publications in DB: ${(pubCnt[0] as unknown as any[])[0]?.cnt}`);
  
  process.exit(0);
}

main().catch(e => { console.error(e.message); process.exit(1); });
