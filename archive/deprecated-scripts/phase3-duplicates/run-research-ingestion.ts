/**
 * Research Publication Ingestion Script
 * 
 * Runs all research connectors to ingest publications from:
 * - World Bank Open Knowledge Repository
 * - IMF eLibrary
 * - UNDP Publications
 * - WFP Market Bulletins
 * - Think Tanks (Brookings, CSIS, Chatham House, Sana'a Center)
 * - Central Bank of Yemen
 */

import { ingestAllResearchPublications } from "../server/connectors/researchConnectors";

async function main() {
  console.log("=".repeat(60));
  console.log("YETO Research Publication Ingestion");
  console.log("=".repeat(60));
  console.log("");
  
  const startYear = 2010;
  const endYear = 2025;
  
  console.log(`Ingesting publications from ${startYear} to ${endYear}...`);
  console.log("");
  
  try {
    const results = await ingestAllResearchPublications(startYear, endYear);
    
    console.log("");
    console.log("=".repeat(60));
    console.log("INGESTION RESULTS");
    console.log("=".repeat(60));
    console.log("");
    
    let totalFound = 0;
    let totalIngested = 0;
    let totalErrors = 0;
    
    for (const result of results) {
      console.log(`${result.source}:`);
      console.log(`  Found: ${result.recordsFound}`);
      console.log(`  Ingested: ${result.recordsIngested}`);
      console.log(`  Duration: ${result.duration}ms`);
      if (result.errors.length > 0) {
        console.log(`  Errors: ${result.errors.length}`);
        result.errors.slice(0, 3).forEach(e => console.log(`    - ${e}`));
      }
      console.log("");
      
      totalFound += result.recordsFound;
      totalIngested += result.recordsIngested;
      totalErrors += result.errors.length;
    }
    
    console.log("=".repeat(60));
    console.log("SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total Found: ${totalFound}`);
    console.log(`Total Ingested: ${totalIngested}`);
    console.log(`Total Errors: ${totalErrors}`);
    console.log("");
    
    process.exit(0);
  } catch (error) {
    console.error("Fatal error during ingestion:", error);
    process.exit(1);
  }
}

main();
