/**
 * YETO Source Registry Ingestion Script
 * Imports 292 sources from YETO_Sources_Universe_Master into the database
 */

import { db } from "../server/db";
import { sourceRegistry } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import * as fs from "fs";

interface SourceData {
  src_id: string;
  src_numeric_id: number;
  name_en: string;
  name_ar: string | null;
  domain: string | null;
  institution: string | null;
  category: string | null;
  source_type: string | null;
  source_class: string | null;
  sector_category: string | null;
  sub_sector_tag: string | null;
  geographic_coverage: string | null;
  time_coverage_start: number | null;
  time_coverage_end: number | null;
  access_method: string | null;
  access_method_norm: string | null;
  auth_required: string | null;
  data_format: string | null;
  update_frequency: string | null;
  update_frequency_norm: string | null;
  cadence: string | null;
  cadence_norm: string | null;
  tier: string | null;
  reliability_score: string | null;
  license: string | null;
  partnership_required: boolean | null;
  ingestion_method: string | null;
  ingestion_owner_agent: string | null;
  notes: string | null;
  tags: string | null;
  status: string | null;
  active: boolean | null;
  url: string | null;
  ai_coach_prompt: string | null;
}

// Map access methods to schema enum
function mapAccessType(accessMethod: string | null): "API" | "PDF" | "WEB" | "MANUAL" | "HYBRID" {
  if (!accessMethod) return "WEB";
  const upper = accessMethod.toUpperCase();
  if (upper.includes("API")) return "API";
  if (upper.includes("PDF")) return "PDF";
  if (upper.includes("MANUAL")) return "MANUAL";
  if (upper.includes("HYBRID") || upper.includes("+")) return "HYBRID";
  return "WEB";
}

// Map tier to schema enum
function mapTier(tier: string | null): "T1" | "T2" | "T3" {
  if (!tier) return "T3";
  if (tier === "T1") return "T1";
  if (tier === "T2") return "T2";
  return "T3";
}

// Map status to schema enum
function mapStatus(status: string | null): "ACTIVE" | "INACTIVE" | "NEEDS_KEY" | "DEPRECATED" {
  if (!status) return "ACTIVE";
  const upper = status.toUpperCase();
  if (upper.includes("NEEDS_KEY") || upper.includes("KEY")) return "NEEDS_KEY";
  if (upper.includes("INACTIVE") || upper.includes("DISABLED")) return "INACTIVE";
  if (upper.includes("DEPRECATED")) return "DEPRECATED";
  return "ACTIVE";
}

// Map update frequency to schema enum
function mapFrequency(freq: string | null): "REALTIME" | "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUAL" | "IRREGULAR" {
  if (!freq) return "IRREGULAR";
  const upper = freq.toUpperCase();
  if (upper.includes("REAL") || upper.includes("LIVE")) return "REALTIME";
  if (upper.includes("DAILY") || upper.includes("DAY")) return "DAILY";
  if (upper.includes("WEEK")) return "WEEKLY";
  if (upper.includes("MONTH")) return "MONTHLY";
  if (upper.includes("QUARTER")) return "QUARTERLY";
  if (upper.includes("ANNUAL") || upper.includes("YEAR")) return "ANNUAL";
  return "IRREGULAR";
}

// Map geographic scope
function mapGeoScope(geo: string | null): "National" | "Governorate" | "District" | "Global" {
  if (!geo) return "National";
  const lower = geo.toLowerCase();
  if (lower.includes("global") || lower.includes("international")) return "Global";
  if (lower.includes("governorate") || lower.includes("province")) return "Governorate";
  if (lower.includes("district") || lower.includes("local")) return "District";
  return "National";
}

// Map regime applicability
function mapRegime(geo: string | null): "IRG" | "DFA" | "MIXED" | "GLOBAL" {
  if (!geo) return "MIXED";
  const lower = geo.toLowerCase();
  if (lower.includes("global") || lower.includes("international")) return "GLOBAL";
  if (lower.includes("aden") || lower.includes("irg")) return "IRG";
  if (lower.includes("sanaa") || lower.includes("dfa") || lower.includes("houthi")) return "DFA";
  return "MIXED";
}

// Extract sectors from category/tags
function extractSectors(source: SourceData): string[] {
  const sectors: string[] = [];
  const text = `${source.category || ""} ${source.sector_category || ""} ${source.tags || ""} ${source.sub_sector_tag || ""}`.toLowerCase();
  
  if (text.includes("macro") || text.includes("gdp") || text.includes("growth")) sectors.push("macroeconomy");
  if (text.includes("bank") || text.includes("financ") || text.includes("monetary")) sectors.push("banking");
  if (text.includes("trade") || text.includes("export") || text.includes("import") || text.includes("commerce")) sectors.push("trade");
  if (text.includes("currency") || text.includes("exchange") || text.includes("forex")) sectors.push("currency");
  if (text.includes("food") || text.includes("security") || text.includes("hunger") || text.includes("nutrition")) sectors.push("food-security");
  if (text.includes("humanitarian") || text.includes("aid") || text.includes("relief")) sectors.push("humanitarian");
  if (text.includes("health") || text.includes("medical") || text.includes("disease")) sectors.push("health");
  if (text.includes("education") || text.includes("school") || text.includes("literacy")) sectors.push("education");
  if (text.includes("labor") || text.includes("employment") || text.includes("wage") || text.includes("job")) sectors.push("labor");
  if (text.includes("agriculture") || text.includes("farm") || text.includes("crop") || text.includes("livestock")) sectors.push("agriculture");
  if (text.includes("energy") || text.includes("fuel") || text.includes("oil") || text.includes("power")) sectors.push("energy");
  if (text.includes("infrastructure") || text.includes("transport") || text.includes("road")) sectors.push("infrastructure");
  if (text.includes("telecom") || text.includes("communication") || text.includes("internet")) sectors.push("telecommunications");
  if (text.includes("water") || text.includes("sanitation") || text.includes("wash")) sectors.push("water");
  if (text.includes("conflict") || text.includes("security") || text.includes("violence")) sectors.push("conflict");
  if (text.includes("population") || text.includes("demographic") || text.includes("census")) sectors.push("demographics");
  
  return sectors.length > 0 ? sectors : ["general"];
}

async function ingestSources() {
  console.log("Starting YETO Source Registry Ingestion...");
  
  // Read the JSON file
  const sourcesJson = fs.readFileSync("data/sources_master_292.json", "utf-8");
  const sources: SourceData[] = JSON.parse(sourcesJson);
  
  console.log(`Total sources to process: ${sources.length}`);
  
  let inserted = 0;
  let updated = 0;
  let errors = 0;
  
  for (const source of sources) {
    try {
      // Check if source exists
      const existing = await db
        .select()
        .from(sourceRegistry)
        .where(eq(sourceRegistry.sourceId, source.src_id))
        .limit(1);
      
      const sectors = extractSectors(source);
      
      const sourceData = {
        sourceId: source.src_id,
        name: source.name_en || "Unknown",
        altName: source.name_ar || null,
        publisher: source.institution || source.domain || "Unknown",
        apiUrl: source.url?.includes("api") ? source.url : null,
        webUrl: source.url || null,
        accessType: mapAccessType(source.access_method),
        tier: mapTier(source.tier),
        status: mapStatus(source.status),
        updateFrequency: mapFrequency(source.update_frequency),
        geographicScope: mapGeoScope(source.geographic_coverage),
        regimeApplicability: mapRegime(source.geographic_coverage),
        historicalStart: source.time_coverage_start || 2010,
        historicalEnd: source.time_coverage_end || null,
        description: source.notes || `${source.category || ""} - ${source.sector_category || ""}`,
        sectorsFed: JSON.stringify(sectors),
        isPrimary: source.tier === "T1",
        isMedia: source.source_class?.toLowerCase().includes("media") || false,
        updatedAt: new Date(),
      };
      
      if (existing.length > 0) {
        // Update existing
        await db
          .update(sourceRegistry)
          .set(sourceData)
          .where(eq(sourceRegistry.sourceId, source.src_id));
        updated++;
      } else {
        // Insert new
        await db.insert(sourceRegistry).values({
          ...sourceData,
          createdAt: new Date(),
        });
        inserted++;
      }
      
      if ((inserted + updated) % 50 === 0) {
        console.log(`Progress: ${inserted} inserted, ${updated} updated`);
      }
    } catch (error) {
      console.error(`Error processing ${source.src_id} (${source.name_en}):`, error);
      errors++;
    }
  }
  
  console.log("\n=== Source Registry Ingestion Complete ===");
  console.log(`Inserted: ${inserted}`);
  console.log(`Updated: ${updated}`);
  console.log(`Errors: ${errors}`);
  console.log(`Total processed: ${inserted + updated}`);
}

// Run the ingestion
ingestSources()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
