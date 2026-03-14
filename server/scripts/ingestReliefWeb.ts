/**
 * ReliefWeb API Ingestion - Humanitarian Reports on Yemen since 2010
 */
import { db } from '../db';
import { sql } from 'drizzle-orm';

async function safeFetch(url: string, retries = 2): Promise<any> {
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) { if (i === retries) return null; await new Promise(r => setTimeout(r, 2000)); continue; }
      return await res.json();
    } catch { if (i === retries) return null; await new Promise(r => setTimeout(r, 2000)); }
  }
  return null;
}

async function main() {
  console.log('=== RELIEFWEB INGESTION ===');
  let inserted = 0;
  
  for (let year = 2010; year <= 2025; year++) {
    const url = `https://api.reliefweb.int/v1/reports?appname=yeto&query[value]=yemen&query[operator]=AND&filter[field]=date.original&filter[value][from]=${year}-01-01T00:00:00%2B00:00&filter[value][to]=${year}-12-31T23:59:59%2B00:00&fields[include][]=title&fields[include][]=date.original&fields[include][]=source&fields[include][]=url_alias&fields[include][]=format&limit=200&sort[]=date.original:desc`;
    
    const data = await safeFetch(url);
    if (data && data.data) {
      for (const report of data.data) {
        const fields = report.fields || {};
        const title = fields.title || '';
        if (!title || title.length < 10) continue;
        
        const pubDate = fields.date?.original ? new Date(fields.date.original) : new Date(`${year}-06-15`);
        const sourceNames = (fields.source || []).map((s: any) => s.name).join(', ');
        const formats = (fields.format || []).map((f: any) => f.name).join(', ');
        
        let category = 'humanitarian_finance';
        const lt = title.toLowerCase();
        if (lt.includes('food') || lt.includes('famine') || lt.includes('nutrition')) category = 'food_security';
        if (lt.includes('econom') || lt.includes('market') || lt.includes('gdp')) category = 'macroeconomic_analysis';
        if (lt.includes('bank') || lt.includes('financ') || lt.includes('monetary')) category = 'banking_sector';
        if (lt.includes('conflict') || lt.includes('war') || lt.includes('violence')) category = 'conflict_economics';
        if (lt.includes('trade') || lt.includes('export') || lt.includes('import')) category = 'trade_external';
        if (lt.includes('labor') || lt.includes('employ')) category = 'labor_market';
        if (lt.includes('poverty') || lt.includes('development')) category = 'poverty_development';
        if (lt.includes('sanction')) category = 'sanctions_compliance';
        
        let pubType = 'evaluation_report';
        if (formats.includes('Situation Report')) pubType = 'statistical_bulletin';
        if (formats.includes('Assessment')) pubType = 'survey_report';
        if (formats.includes('Analysis')) pubType = 'policy_brief';
        
        try {
          await db.execute(sql`
            INSERT INTO research_publications (title, abstract, publicationType, researchCategory, publicationDate, publicationYear, organizationId, externalId, sourceUrl, language, status)
            VALUES (${title.substring(0, 500)}, ${`Source: ${sourceNames}. Format: ${formats}`.substring(0, 2000)}, ${pubType}, ${category}, ${pubDate}, ${year}, ${5}, ${`RW-${report.id}`}, ${fields.url_alias ? `https://reliefweb.int${fields.url_alias}` : ''}, ${'en'}, ${'published'})
            ON DUPLICATE KEY UPDATE updatedAt = NOW()
          `);
          inserted++;
        } catch { /* skip duplicates */ }
      }
      console.log(`  ${year}: ${data.data.length} reports found, ${inserted} total`);
    } else {
      console.log(`  ${year}: no data`);
    }
    
    await new Promise(r => setTimeout(r, 1500));
  }
  
  console.log(`\nReliefWeb total: ${inserted} publications`);
  process.exit(0);
}

main().catch(e => { console.error(e.message); process.exit(1); });
