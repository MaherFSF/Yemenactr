/**
 * YETO Research Data Ingestion Script
 * Processes parallel research results and populates time_series, indicators, and library_documents tables
 */

import { db } from "../server/db";
import { timeSeries, indicators, libraryDocuments, economicEvents } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import * as fs from "fs";

interface ResearchResult {
  input: string;
  output: {
    source_category: string;
    total_data_points: number;
    years_covered: string;
    key_datasets: string;
    macro_data: string;
    trade_data: string;
    humanitarian_data: string;
    financial_data: string;
    social_data: string;
    source_urls: string;
    data_quality_notes: string;
  };
}

// Map source category to sector code
function mapSectorCode(source: string): string {
  const lower = source.toLowerCase();
  if (lower.includes("world bank") || lower.includes("imf") || lower.includes("macro")) return "macro";
  if (lower.includes("ocha") || lower.includes("humanitarian") || lower.includes("hdx")) return "humanitarian";
  if (lower.includes("wfp") || lower.includes("fao") || lower.includes("food")) return "food-security";
  if (lower.includes("central bank") || lower.includes("currency") || lower.includes("exchange")) return "currency";
  if (lower.includes("trade") || lower.includes("unctad") || lower.includes("customs")) return "trade";
  if (lower.includes("who") || lower.includes("health")) return "health";
  if (lower.includes("unicef") || lower.includes("education")) return "education";
  if (lower.includes("ilo") || lower.includes("labor") || lower.includes("employment")) return "labor";
  if (lower.includes("unhcr") || lower.includes("refugee") || lower.includes("displacement")) return "humanitarian";
  if (lower.includes("acled") || lower.includes("conflict")) return "conflict";
  if (lower.includes("microfinance") || lower.includes("bank")) return "banking";
  return "general";
}

// Parse JSON data safely
function parseJsonData(data: string): any[] {
  if (!data || data === "N/A" || data === "null") return [];
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}

// Generate indicator code
function generateIndicatorCode(name: string, sector: string): string {
  const prefix = sector.toUpperCase().substring(0, 3);
  const suffix = name.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 20).toUpperCase();
  return `${prefix}_${suffix}`;
}

async function ingestResearchData() {
  console.log("Starting research data ingestion...");
  
  // Read the research results
  const resultsJson = fs.readFileSync("data/yemen_comprehensive_data_ingestion.json", "utf-8");
  const data = JSON.parse(resultsJson);
  const results: ResearchResult[] = data.results || [];
  
  console.log(`Processing ${results.length} research results...`);
  
  let timeSeriesInserted = 0;
  let indicatorsInserted = 0;
  let documentsInserted = 0;
  let eventsInserted = 0;
  let errors = 0;
  
  for (const result of results) {
    const { output } = result;
    const source = output.source_category || "Unknown";
    const sectorCode = mapSectorCode(source);
    
    console.log(`\nProcessing: ${source} (sector: ${sectorCode})`);
    
    // Process macro data
    const macroData = parseJsonData(output.macro_data);
    for (const item of macroData) {
      try {
        if (item.year && item.value !== undefined) {
          const indicatorCode = generateIndicatorCode(item.indicator || "GDP", sectorCode);
          
          // Insert time series data
          await db.insert(timeSeries).values({
            indicatorCode,
            sectorCode,
            date: new Date(item.year, 0, 1),
            value: String(item.value),
            unit: item.unit || "USD",
            sourceId: `SRC-${source.substring(0, 10)}`,
            regime: "MIXED",
            confidence: 0.8,
            createdAt: new Date(),
          }).onDuplicateKeyUpdate({ set: { value: String(item.value), updatedAt: new Date() } });
          
          timeSeriesInserted++;
        }
      } catch (e) {
        errors++;
      }
    }
    
    // Process trade data
    const tradeData = parseJsonData(output.trade_data);
    for (const item of tradeData) {
      try {
        if (item.year) {
          if (item.exports !== undefined) {
            await db.insert(timeSeries).values({
              indicatorCode: "TRD_EXPORTS",
              sectorCode: "trade",
              date: new Date(item.year, 0, 1),
              value: String(item.exports),
              unit: "USD Million",
              sourceId: `SRC-${source.substring(0, 10)}`,
              regime: "MIXED",
              confidence: 0.8,
              createdAt: new Date(),
            }).onDuplicateKeyUpdate({ set: { value: String(item.exports), updatedAt: new Date() } });
            timeSeriesInserted++;
          }
          if (item.imports !== undefined) {
            await db.insert(timeSeries).values({
              indicatorCode: "TRD_IMPORTS",
              sectorCode: "trade",
              date: new Date(item.year, 0, 1),
              value: String(item.imports),
              unit: "USD Million",
              sourceId: `SRC-${source.substring(0, 10)}`,
              regime: "MIXED",
              confidence: 0.8,
              createdAt: new Date(),
            }).onDuplicateKeyUpdate({ set: { value: String(item.imports), updatedAt: new Date() } });
            timeSeriesInserted++;
          }
        }
      } catch (e) {
        errors++;
      }
    }
    
    // Process humanitarian data
    const humanitarianData = parseJsonData(output.humanitarian_data);
    for (const item of humanitarianData) {
      try {
        if (item.year && item.value !== undefined) {
          const indicatorCode = generateIndicatorCode(item.indicator || "HUM_INDICATOR", "humanitarian");
          
          await db.insert(timeSeries).values({
            indicatorCode,
            sectorCode: "humanitarian",
            date: new Date(item.year, 0, 1),
            value: String(item.value),
            unit: item.unit || "People",
            sourceId: `SRC-${source.substring(0, 10)}`,
            regime: "MIXED",
            confidence: 0.75,
            createdAt: new Date(),
          }).onDuplicateKeyUpdate({ set: { value: String(item.value), updatedAt: new Date() } });
          
          timeSeriesInserted++;
        }
      } catch (e) {
        errors++;
      }
    }
    
    // Process financial data
    const financialData = parseJsonData(output.financial_data);
    for (const item of financialData) {
      try {
        if (item.year && item.value !== undefined) {
          const indicatorCode = generateIndicatorCode(item.indicator || "FIN_INDICATOR", "banking");
          
          await db.insert(timeSeries).values({
            indicatorCode,
            sectorCode: "banking",
            date: new Date(item.year, 0, 1),
            value: String(item.value),
            unit: item.unit || "YER",
            sourceId: `SRC-${source.substring(0, 10)}`,
            regime: "MIXED",
            confidence: 0.7,
            createdAt: new Date(),
          }).onDuplicateKeyUpdate({ set: { value: String(item.value), updatedAt: new Date() } });
          
          timeSeriesInserted++;
        }
      } catch (e) {
        errors++;
      }
    }
    
    // Process social data
    const socialData = parseJsonData(output.social_data);
    for (const item of socialData) {
      try {
        if (item.year && item.value !== undefined) {
          const indicatorCode = generateIndicatorCode(item.indicator || "SOC_INDICATOR", "labor");
          
          await db.insert(timeSeries).values({
            indicatorCode,
            sectorCode: "labor",
            date: new Date(item.year, 0, 1),
            value: String(item.value),
            unit: item.unit || "Percent",
            sourceId: `SRC-${source.substring(0, 10)}`,
            regime: "MIXED",
            confidence: 0.75,
            createdAt: new Date(),
          }).onDuplicateKeyUpdate({ set: { value: String(item.value), updatedAt: new Date() } });
          
          timeSeriesInserted++;
        }
      } catch (e) {
        errors++;
      }
    }
    
    // Create library documents from key datasets
    const datasets = (output.key_datasets || "").split(",").filter(d => d.trim());
    for (const dataset of datasets.slice(0, 10)) { // Limit to 10 per source
      try {
        const title = dataset.trim();
        if (title.length > 5) {
          await db.insert(libraryDocuments).values({
            title,
            titleAr: title, // Would need translation
            documentType: "report",
            sourceId: `SRC-${source.substring(0, 10)}`,
            sectorCode,
            publishDate: new Date(),
            language: "en",
            fileUrl: output.source_urls?.split("\n")[0] || "",
            summary: `${source} - ${title}`,
            status: "published",
            createdAt: new Date(),
          }).onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });
          
          documentsInserted++;
        }
      } catch (e) {
        errors++;
      }
    }
    
    // Create economic event for data update
    try {
      await db.insert(economicEvents).values({
        titleEn: `Data Update: ${source}`,
        titleAr: `تحديث البيانات: ${source}`,
        descriptionEn: `New data ingested from ${source} covering ${output.years_covered || "multiple years"}. Total data points: ${output.total_data_points || 0}.`,
        descriptionAr: `تم استيعاب بيانات جديدة من ${source}`,
        eventDate: new Date(),
        sectorCode,
        eventType: "data_release",
        impactLevel: "medium",
        sourceId: `SRC-${source.substring(0, 10)}`,
        createdAt: new Date(),
      });
      eventsInserted++;
    } catch (e) {
      errors++;
    }
    
    console.log(`  Time series: ${timeSeriesInserted}, Documents: ${documentsInserted}, Events: ${eventsInserted}`);
  }
  
  console.log("\n=== Research Data Ingestion Complete ===");
  console.log(`Time series records: ${timeSeriesInserted}`);
  console.log(`Library documents: ${documentsInserted}`);
  console.log(`Economic events: ${eventsInserted}`);
  console.log(`Errors: ${errors}`);
}

// Run the ingestion
ingestResearchData()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
