/**
 * Ingest Parallel Research Results
 * 
 * Processes the yemen_research_sources.json file from parallel research
 * and ingests all publications into the research_publications table
 */

import * as fs from 'fs';
import * as path from 'path';
import { getDb } from '../server/db';
import { researchPublications, researchOrganizations } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

interface Publication {
  title: string;
  year: number | string;
  type: string;
  url?: string;
  description?: string;
}

interface ResearchResult {
  input: string;
  output: {
    source_name: string;
    publications_found: number | string;
    publications_json: string;
    search_notes: string;
  };
  error: string;
}

// Map source names to organization types
const orgTypeMap: Record<string, "ifi" | "un_agency" | "bilateral_donor" | "gulf_fund" | "think_tank" | "academic" | "government" | "central_bank" | "ngo" | "private_sector" | "other"> = {
  "World Bank": "ifi",
  "International Monetary Fund": "ifi",
  "United Nations Development Programme": "un_agency",
  "World Food Programme": "un_agency",
  "UNICEF Publications": "un_agency",
  "UNICEF": "un_agency",
  "World Health Organization": "un_agency",
  "Islamic Development Bank": "ifi",
  "Brookings Institution": "think_tank",
  "Center for Strategic and International Studies (CSIS)": "think_tank",
  "Chatham House": "think_tank",
  "Sana'a Center for Strategic Studies": "think_tank",
  "Carnegie Endowment for International Peace": "think_tank",
  "International Crisis Group": "ngo",
  "ACLED (Armed Conflict Location & Event Data)": "academic",
  "Central Bank of Yemen": "central_bank",
};

// Map publication types to schema enum values
function mapPublicationType(type: string): string {
  const typeMap: Record<string, string> = {
    "Report": "country_report",
    "report": "country_report",
    "Working Paper": "working_paper",
    "working_paper": "working_paper",
    "Economic Memorandum": "country_report",
    "IMF Staff Country Report": "country_report",
    "Staff Report": "country_report",
    "Mission Concluding Statement": "policy_brief",
    "Country Information": "country_report",
    "Technical Assistance Report": "technical_report",
    "Policy Brief": "policy_brief",
    "policy_brief": "policy_brief",
    "Research Paper": "research_paper",
    "research_paper": "research_paper",
    "Article": "journal_article",
    "article": "journal_article",
    "Brief": "policy_brief",
    "brief": "policy_brief",
    "Survey": "survey_report",
    "survey": "survey_report",
    "Assessment": "country_report",
    "assessment": "country_report",
    "Bulletin": "market_bulletin",
    "bulletin": "market_bulletin",
    "Annual Report": "annual_report",
    "annual_report": "annual_report",
    "Data Report": "data_report",
    "data_report": "data_report",
    "Commentary": "commentary",
    "commentary": "commentary",
    "Analysis": "research_paper",
    "analysis": "research_paper",
  };
  
  for (const [key, value] of Object.entries(typeMap)) {
    if (type.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  return "research_paper";
}

// Map to research category based on content
function inferResearchCategory(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();
  
  if (text.includes("food") || text.includes("nutrition") || text.includes("hunger")) return "food_security";
  if (text.includes("health") || text.includes("medical") || text.includes("disease")) return "health";
  if (text.includes("education") || text.includes("school") || text.includes("learning")) return "education";
  if (text.includes("poverty") || text.includes("welfare") || text.includes("inequality")) return "poverty";
  if (text.includes("conflict") || text.includes("war") || text.includes("violence") || text.includes("crisis")) return "conflict";
  if (text.includes("humanitarian") || text.includes("aid") || text.includes("relief")) return "humanitarian";
  if (text.includes("governance") || text.includes("institution") || text.includes("reform")) return "governance";
  if (text.includes("trade") || text.includes("export") || text.includes("import")) return "trade";
  if (text.includes("fiscal") || text.includes("budget") || text.includes("tax")) return "fiscal_policy";
  if (text.includes("monetary") || text.includes("inflation") || text.includes("exchange")) return "monetary_policy";
  if (text.includes("development") || text.includes("growth") || text.includes("economic")) return "economic_development";
  if (text.includes("climate") || text.includes("environment") || text.includes("water")) return "environment";
  if (text.includes("gender") || text.includes("women") || text.includes("youth")) return "social_development";
  
  return "economic_development";
}

async function getOrCreateOrganization(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, name: string): Promise<number> {
  // Normalize name
  const normalizedName = name.replace(" Publications", "").trim();
  
  const existing = await db.select()
    .from(researchOrganizations)
    .where(eq(researchOrganizations.name, normalizedName))
    .limit(1);
  
  if (existing.length > 0) {
    return existing[0].id;
  }
  
  const orgType = orgTypeMap[name] || orgTypeMap[normalizedName] || "other";
  
  const result = await db.insert(researchOrganizations).values({
    name: normalizedName,
    type: orgType,
  });
  
  return result[0].insertId;
}

async function main() {
  console.log("=".repeat(60));
  console.log("YETO Research Ingestion from Parallel Research");
  console.log("=".repeat(60));
  console.log("");
  
  // Read the JSON file
  const jsonPath = path.join('/home/ubuntu', 'yemen_research_sources.json');
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const results: ResearchResult[] = jsonData.results;
  
  const db = await getDb();
  if (!db) {
    console.error("Failed to connect to database");
    process.exit(1);
  }
  
  let totalIngested = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  
  for (const result of results) {
    if (!result.output || result.error) {
      console.log(`Skipping ${result.input}: ${result.error || 'No output'}`);
      continue;
    }
    
    const sourceName = result.output.source_name;
    console.log(`\nProcessing: ${sourceName}`);
    
    let publications: Publication[] = [];
    try {
      const jsonStr = result.output.publications_json;
      if (jsonStr && jsonStr.trim()) {
        publications = JSON.parse(jsonStr);
      }
    } catch (e) {
      console.log(`  Error parsing publications JSON: ${e}`);
      totalErrors++;
      continue;
    }
    
    if (!Array.isArray(publications) || publications.length === 0) {
      console.log(`  No publications to process`);
      continue;
    }
    
    const orgId = await getOrCreateOrganization(db, sourceName);
    console.log(`  Organization ID: ${orgId}`);
    
    for (const pub of publications) {
      try {
        // Parse year
        let year = typeof pub.year === 'string' ? parseInt(pub.year) : pub.year;
        if (isNaN(year) || year < 2000 || year > 2030) {
          year = 2020; // Default year
        }
        
        // Generate external ID
        const externalId = `parallel-${sourceName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${pub.title.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 50)}-${year}`;
        
        // Check if already exists
        const existing = await db.select()
          .from(researchPublications)
          .where(eq(researchPublications.externalId, externalId))
          .limit(1);
        
        if (existing.length > 0) {
          totalSkipped++;
          continue;
        }
        
        // Insert publication
        await db.insert(researchPublications).values({
          title: pub.title.substring(0, 500),
          abstract: pub.description?.substring(0, 2000),
          publicationType: mapPublicationType(pub.type) as any,
          researchCategory: inferResearchCategory(pub.title, pub.description || "") as any,
          dataCategory: "social_indicators" as any,
          dataType: "report" as any,
          publicationYear: year,
          sourceUrl: pub.url,
          language: "en",
          isPeerReviewed: false,
          hasDataset: false,
          keywords: ["yemen", sourceName.toLowerCase()],
          organizationId: orgId,
          externalId: externalId,
          status: "published",
        });
        
        totalIngested++;
      } catch (e) {
        console.log(`  Error ingesting "${pub.title}": ${e}`);
        totalErrors++;
      }
    }
    
    console.log(`  Ingested: ${publications.length} publications`);
  }
  
  console.log("");
  console.log("=".repeat(60));
  console.log("SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total Ingested: ${totalIngested}`);
  console.log(`Total Skipped (duplicates): ${totalSkipped}`);
  console.log(`Total Errors: ${totalErrors}`);
  console.log("");
  
  // Get final count
  const finalCount = await db.select().from(researchPublications);
  console.log(`Total publications in database: ${finalCount.length}`);
  
  process.exit(0);
}

main().catch(console.error);
