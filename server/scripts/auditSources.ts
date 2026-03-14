import { db } from '../db';
import { sql } from 'drizzle-orm';

async function audit() {
  const sources = await db.execute(sql`
    SELECT id, name, tier, apiUrl, status, accessType, apiKeyRequired, updateFrequency, historicalStart
    FROM source_registry 
    ORDER BY tier, name
  `);
  
  const rows = (sources as any).rows || sources;
  
  const hasApi = rows.filter((s: any) => s.apiUrl && String(s.apiUrl).length > 5);
  const noApi = rows.filter((s: any) => !s.apiUrl || String(s.apiUrl).length <= 5);
  const apiSources = rows.filter((s: any) => s.accessType === 'API' || s.accessType === 'SDMX');
  
  console.log('=== SOURCE REGISTRY AUDIT ===');
  console.log('Total sources:', rows.length);
  console.log('Has apiUrl populated:', hasApi.length);
  console.log('No apiUrl:', noApi.length);
  console.log('Access type API/SDMX:', apiSources.length);
  
  // By tier
  const tiers: Record<string, number> = {};
  for (const s of rows) {
    const t = (s as any).tier || 'UNKNOWN';
    tiers[t] = (tiers[t] || 0) + 1;
  }
  console.log('\n=== BY TIER ===');
  for (const [k, v] of Object.entries(tiers).sort()) {
    console.log(`${k}: ${v}`);
  }
  
  // By status
  const statuses: Record<string, number> = {};
  for (const s of rows) {
    const st = (s as any).status || 'UNKNOWN';
    statuses[st] = (statuses[st] || 0) + 1;
  }
  console.log('\n=== BY STATUS ===');
  for (const [k, v] of Object.entries(statuses).sort()) {
    console.log(`${k}: ${v}`);
  }
  
  // By access type
  const types: Record<string, number> = {};
  for (const s of rows) {
    const t = (s as any).accessType || 'UNKNOWN';
    types[t] = (types[t] || 0) + 1;
  }
  console.log('\n=== BY ACCESS TYPE ===');
  for (const [k, v] of Object.entries(types).sort()) {
    console.log(`${k}: ${v}`);
  }
  
  // Sources WITH API URLs
  console.log('\n=== SOURCES WITH API URLs ===');
  for (const s of hasApi) {
    const src = s as any;
    console.log(`[${src.tier}] ${src.name} | ${String(src.apiUrl).substring(0, 80)} | status:${src.status}`);
  }
  
  // API/SDMX sources WITHOUT URLs (these need fixing)
  console.log('\n=== API/SDMX SOURCES MISSING URLs ===');
  const apiNoUrl = apiSources.filter((s: any) => !s.apiUrl || String(s.apiUrl).length <= 5);
  for (const s of apiNoUrl) {
    const src = s as any;
    console.log(`[${src.tier}] ${src.name} | accessType:${src.accessType} | keyReq:${src.apiKeyRequired}`);
  }
  
  // Check research_publications
  try {
    const pubs = await db.execute(sql`SELECT COUNT(*) as cnt FROM research_publications`);
    const pubRows = (pubs as any).rows || pubs;
    console.log('\n=== RESEARCH PUBLICATIONS ===');
    console.log('Total:', pubRows[0]?.cnt);
  } catch {
    console.log('\nresearch_publications: error or not found');
  }
  
  // Time series by source
  try {
    const ts = await db.execute(sql`
      SELECT source, COUNT(*) as cnt 
      FROM time_series 
      GROUP BY source 
      ORDER BY cnt DESC 
      LIMIT 30
    `);
    const tsRows = (ts as any).rows || ts;
    console.log('\n=== TIME SERIES BY SOURCE (top 30) ===');
    for (const r of tsRows) {
      console.log(`${(r as any).source}: ${(r as any).cnt}`);
    }
  } catch {
    console.log('Error querying time_series');
  }
  
  // Total time series
  try {
    const total = await db.execute(sql`SELECT COUNT(*) as cnt FROM time_series`);
    const totalRows = (total as any).rows || total;
    console.log('\nTotal time series records:', totalRows[0]?.cnt);
  } catch {
    console.log('Error counting time_series');
  }
  
  process.exit(0);
}

audit().catch(e => { console.error(e.message); process.exit(1); });
