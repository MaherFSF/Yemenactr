/**
 * Historical Data Backfill Runner
 *
 * Executes complete historical backfill for all connectors.
 *
 * Usage examples:
 *   npx tsx scripts/run-backfill.ts
 *   npx tsx scripts/run-backfill.ts --backfill-start-year=2010 --backfill-end-year=2026
 *   npx tsx scripts/run-backfill.ts --refresh-window-years=4
 */

import backfillModule from "../server/scheduler/historicalBackfill";

const { runFullBackfill, CONNECTOR_REGISTRY } = backfillModule;

type CliOptions = {
  backfillStartYear?: number;
  backfillEndYear?: number;
  refreshWindowYears: number;
};

function parseCliOptions(argv: string[]): CliOptions {
  const parsed: CliOptions = {
    refreshWindowYears: 4,
  };

  for (const arg of argv) {
    if (arg.startsWith("--backfill-start-year=")) {
      const value = Number.parseInt(arg.split("=")[1] ?? "", 10);
      if (!Number.isNaN(value)) parsed.backfillStartYear = value;
    }

    if (arg.startsWith("--backfill-end-year=")) {
      const value = Number.parseInt(arg.split("=")[1] ?? "", 10);
      if (!Number.isNaN(value)) parsed.backfillEndYear = value;
    }

    if (arg.startsWith("--refresh-window-years=")) {
      const value = Number.parseInt(arg.split("=")[1] ?? "", 10);
      if (!Number.isNaN(value) && value > 0) parsed.refreshWindowYears = value;
    }
  }

  return parsed;
}

function resolveYearRange(options: CliOptions): { startYear: number; endYear: number } {
  const currentYear = new Date().getFullYear();
  const requestedStartYear = options.backfillStartYear;
  const requestedEndYear = options.backfillEndYear ?? currentYear;

  const defaultRefreshWindowStartYear = Math.max(2010, currentYear - options.refreshWindowYears);

  // IMPORTANT: when caller explicitly requests --backfill-start-year,
  // use it directly instead of clamping to the refresh window.
  const startYear = requestedStartYear ?? defaultRefreshWindowStartYear;

  return {
    startYear,
    endYear: Math.max(startYear, requestedEndYear),
  };
}

async function main() {
  const options = parseCliOptions(process.argv.slice(2));
  const { startYear, endYear } = resolveYearRange(options);

  console.log("=".repeat(60));
  console.log("YETO Historical Data Backfill");
  console.log("=".repeat(60));
  console.log(`Start Time: ${new Date().toISOString()}`);
  console.log(`Date Range: January 1, ${startYear} - December 31, ${endYear}`);
  console.log(`Connectors: ${Object.keys(CONNECTOR_REGISTRY).length}`);
  console.log(`Refresh Window (fallback only): ${options.refreshWindowYears} years`);
  console.log("=".repeat(60));
  console.log("");

  try {
    const result = await runFullBackfill({
      startYear,
      endYear,
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

    console.log("=".repeat(60));
    console.log(`Completed at: ${new Date().toISOString()}`);

    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error("Fatal error during backfill:", error);
    process.exit(1);
  }
}

main();
