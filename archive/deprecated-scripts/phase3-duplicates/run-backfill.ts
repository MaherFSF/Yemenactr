/**
 * Historical Data Backfill Runner
 * 
 * Executes complete historical backfill for all connectors (2010-2025)
 * Run with: npx tsx scripts/run-backfill.ts
 */

import backfillModule from "../server/scheduler/historicalBackfill";

const { runFullBackfill, getBackfillProgress, CONNECTOR_REGISTRY } = backfillModule;

async function main() {
  console.log("=".repeat(60));
  console.log("YETO Historical Data Backfill");
  console.log("=".repeat(60));
  console.log(`Start Time: ${new Date().toISOString()}`);
  console.log(`Date Range: January 1, 2010 - December 20, 2025`);
  console.log(`Connectors: ${Object.keys(CONNECTOR_REGISTRY).length}`);
  console.log("=".repeat(60));
  console.log("");

  try {
    // Run full backfill for all connectors
    const result = await runFullBackfill({
      startYear: 2010,
      endYear: 2025,
      skipExisting: true,
      validateData: true,
      batchSize: 100,
    });

    console.log("");
    console.log("=".repeat(60));
    console.log("BACKFILL COMPLETE");
    console.log("=".repeat(60));
    console.log(`Success: ${result.success}`);
    console.log(`Total Records: ${result.totalRecords.toLocaleString()}`);
    console.log(`Duration: ${(result.duration / 1000).toFixed(2)}s`);
    console.log("");
    
    // Print per-connector results
    console.log("Per-Connector Results:");
    console.log("-".repeat(60));
    
    for (const [connector, data] of Object.entries(result.connectorResults)) {
      console.log(`  ${connector}:`);
      console.log(`    Records: ${data.records.toLocaleString()}`);
      console.log(`    Years: ${data.years.join(", ") || "None"}`);
      console.log(`    Duration: ${(data.duration / 1000).toFixed(2)}s`);
      if (data.errors.length > 0) {
        console.log(`    Errors: ${data.errors.length}`);
        data.errors.slice(0, 3).forEach(e => console.log(`      - ${e}`));
        if (data.errors.length > 3) {
          console.log(`      ... and ${data.errors.length - 3} more`);
        }
      }
      console.log("");
    }

    // Final summary
    console.log("=".repeat(60));
    console.log(`Completed at: ${new Date().toISOString()}`);
    
    process.exit(result.success ? 0 : 1);
    
  } catch (error) {
    console.error("Fatal error during backfill:", error);
    process.exit(1);
  }
}

main();
