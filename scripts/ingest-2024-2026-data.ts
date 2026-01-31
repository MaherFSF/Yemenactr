/**
 * Comprehensive Data Ingestion Script for 2024-2026 Yemen Economic Data
 * 
 * This script ingests data from parallel research results covering:
 * - Macroeconomic indicators
 * - Currency & Exchange rates
 * - Trade statistics
 * - Humanitarian data
 * - Banking & Finance
 * - Energy & Fuel
 * - Food prices
 * - Health indicators
 * - Population & Demographics
 * - Conflict economic impact
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as fs from "fs";
import * as path from "path";

// Database connection
const DATABASE_URL = process.env.DATABASE_URL || "";

interface DataPoint {
  indicator_name: string;
  year: number;
  month?: number | null;
  value: number | string;
  unit: string;
  source: string;
  confidence: string;
  notes?: string;
}

// Map confidence levels to database ratings
function mapConfidence(confidence: string): "A" | "B" | "C" | "D" {
  const conf = confidence?.toLowerCase() || "medium";
  if (conf === "high") return "A";
  if (conf === "medium") return "B";
  if (conf === "low") return "C";
  return "D";
}

// Map indicator names to codes
function generateIndicatorCode(name: string, category: string): string {
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 50);
  
  const prefixes: Record<string, string> = {
    macro: "MACRO",
    currency: "FX",
    trade: "TRADE",
    humanitarian: "HUMANITARIAN",
    banking: "BANKING",
    energy: "ENERGY",
    food: "FOOD",
    health: "HEALTH",
    population: "POP",
    conflict: "CONFLICT"
  };
  
  return `${prefixes[category] || "DATA"}_${cleanName}`;
}

// Determine regime tag based on source and indicator
function determineRegimeTag(source: string, indicator: string): "aden_irg" | "sanaa_defacto" | "mixed" | "unknown" {
  const lowerSource = source.toLowerCase();
  const lowerIndicator = indicator.toLowerCase();
  
  if (lowerSource.includes("aden") || lowerIndicator.includes("aden") || lowerIndicator.includes("irg")) {
    return "aden_irg";
  }
  if (lowerSource.includes("sanaa") || lowerSource.includes("sana'a") || lowerIndicator.includes("sanaa")) {
    return "sanaa_defacto";
  }
  if (lowerSource.includes("world bank") || lowerSource.includes("imf") || lowerSource.includes("un")) {
    return "mixed"; // International sources typically cover both
  }
  return "unknown";
}

async function main() {
  console.log("=== Yemen 2024-2026 Data Ingestion ===\n");
  
  // Connect to database
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);
  
  // Data files mapping
  const dataFiles: { file: string; category: string }[] = [
    { file: "/home/ubuntu/data_2024_2026/0_nzbuNUf99oafzZEXPfckZF_1769877538202_na1fn_L2hvbWUvdWJ1bnR1L3llbWVuX21hY3JvZWNvbm9taWNfZGF0YQ.json", category: "macro" },
    { file: "/home/ubuntu/yemen_exchange_rate_data.json", category: "currency" },
    { file: "/home/ubuntu/data_2024_2026/2_mIPqFqUU9CaNmBNRIu0y09_1769877702542_na1fn_L2hvbWUvdWJ1bnR1L3llbWVuX3RyYWRlX2RhdGE.json", category: "trade" },
    { file: "/home/ubuntu/data_2024_2026/3_DhkvqYBzvjbHgahyMz26nA_1769877639916_na1fn_L2hvbWUvdWJ1bnR1L3llbWVuX2h1bWFuaXRhcmlhbl9kYXRh.json", category: "humanitarian" },
    { file: "/home/ubuntu/data_2024_2026/4_QpQvtWNGEqW0Ua5nTtVbZR_1769877891082_na1fn_L2hvbWUvdWJ1bnR1L3llbWVuX2ZpbmFuY2lhbF9kYXRh.json", category: "banking" },
    { file: "/home/ubuntu/yemen_energy_data.json", category: "energy" },
    { file: "/home/ubuntu/data_2024_2026/6_SCBty4kVNHzMDpUTTeQ7zS_1769877659703_na1fn_L2hvbWUvdWJ1bnR1L3llbWVuX2Zvb2RfZGF0YQ.json", category: "food" },
    { file: "/home/ubuntu/data_2024_2026/7_SplwioLLRT87Bt2PdN9Z8S_1769877828535_na1fn_L2hvbWUvdWJ1bnR1L3llbWVuX2hlYWx0aF9kYXRh.json", category: "health" },
    { file: "/home/ubuntu/data_2024_2026/8_ug98m82fydCRcc9WvafR9V_1769877590549_na1fn_L2hvbWUvdWJ1bnR1L3llbWVuX3BvcHVsYXRpb25fZGF0YQ.json", category: "population" },
    { file: "/home/ubuntu/data_2024_2026/9_UAEZt3EDGfMto27fz4x0gD_1769878094494_na1fn_L2hvbWUvdWJ1bnR1L3llbWVuX2Vjb25vbWljX2RhdGE.json", category: "conflict" }
  ];
  
  let totalIngested = 0;
  let totalErrors = 0;
  const categoryStats: Record<string, { ingested: number; errors: number }> = {};
  
  for (const { file, category } of dataFiles) {
    console.log(`\n--- Processing ${category.toUpperCase()} data ---`);
    categoryStats[category] = { ingested: 0, errors: 0 };
    
    // Check if file exists
    if (!fs.existsSync(file)) {
      console.log(`  File not found: ${file}`);
      continue;
    }
    
    try {
      const rawContent = fs.readFileSync(file, "utf-8");
      // Handle both array and malformed JSON
      let data: DataPoint[];
      try {
        data = JSON.parse(rawContent);
      } catch {
        // Try to fix common JSON issues
        const fixedContent = rawContent
          .replace(/,\s*{/g, ", {")
          .replace(/}\s*{/g, "}, {");
        data = JSON.parse(`[${fixedContent.replace(/^\[/, "").replace(/\]$/, "")}]`);
      }
      
      if (!Array.isArray(data)) {
        data = [data];
      }
      
      console.log(`  Found ${data.length} data points`);
      
      for (const point of data) {
        try {
          const indicatorCode = generateIndicatorCode(point.indicator_name, category);
          const regimeTag = determineRegimeTag(point.source, point.indicator_name);
          const confidenceRating = mapConfidence(point.confidence);
          
          // Parse value
          let numericValue: number;
          if (typeof point.value === "string") {
            numericValue = parseFloat(point.value.replace(/[^0-9.-]/g, ""));
          } else {
            numericValue = point.value;
          }
          
          if (isNaN(numericValue)) {
            console.log(`  Skipping invalid value for ${point.indicator_name}: ${point.value}`);
            categoryStats[category].errors++;
            totalErrors++;
            continue;
          }
          
          // Create date from year and month
          const month = point.month || 1;
          const date = new Date(point.year, month - 1, 1);
          
          // First, ensure source exists
          const [sourceResult] = await connection.execute(
            `INSERT INTO sources (publisher, url, license, retrievalDate, notes)
             VALUES (?, ?, 'unknown', NOW(), ?)
             ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
            [point.source, point.notes || "", `Ingested from ${category} data 2024-2026`]
          );
          const sourceId = (sourceResult as any).insertId || 1;
          
          // Insert time series data
          await connection.execute(
            `INSERT INTO time_series (indicatorCode, regimeTag, date, value, unit, confidenceRating, sourceId, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE value = VALUES(value), notes = VALUES(notes)`,
            [
              indicatorCode,
              regimeTag,
              date,
              numericValue,
              point.unit || "units",
              confidenceRating,
              sourceId,
              point.notes || ""
            ]
          );
          
          categoryStats[category].ingested++;
          totalIngested++;
          
        } catch (err: any) {
          console.log(`  Error ingesting ${point.indicator_name}: ${err.message}`);
          categoryStats[category].errors++;
          totalErrors++;
        }
      }
      
      console.log(`  Ingested: ${categoryStats[category].ingested}, Errors: ${categoryStats[category].errors}`);
      
    } catch (err: any) {
      console.log(`  Error reading file: ${err.message}`);
    }
  }
  
  console.log("\n=== INGESTION SUMMARY ===");
  console.log(`Total Records Ingested: ${totalIngested}`);
  console.log(`Total Errors: ${totalErrors}`);
  console.log(`Success Rate: ${((totalIngested / (totalIngested + totalErrors)) * 100).toFixed(1)}%`);
  console.log("\nBy Category:");
  for (const [cat, stats] of Object.entries(categoryStats)) {
    console.log(`  ${cat.toUpperCase()}: ${stats.ingested} ingested, ${stats.errors} errors`);
  }
  
  await connection.end();
  console.log("\nDatabase connection closed.");
}

main().catch(console.error);
