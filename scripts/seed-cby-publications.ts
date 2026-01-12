/**
 * Seed Central Bank of Yemen Publications
 * Processes all PDF files from the extracted zip and:
 * 1. Uploads to S3 storage
 * 2. Extracts metadata (year, type, title)
 * 3. Seeds into research_publications table
 * 4. Creates timeline events for key directives
 */

import { db } from "../server/db";
import { storagePut } from "../server/storage";
import * as fs from "fs";
import * as path from "path";

const CBY_PUBLICATIONS_DIR = "/home/ubuntu/yeto-platform/cby-publications";

// Publication type mapping from Arabic
const TYPE_MAPPING: Record<string, { en: string; ar: string; category: string }> = {
  "منشور دوري": { en: "Circular Directive", ar: "منشور دوري", category: "regulatory" },
  "قرار المحافظ": { en: "Governor Decision", ar: "قرار المحافظ", category: "regulatory" },
  "قرار مجلس الوزراء": { en: "Cabinet Decision", ar: "قرار مجلس الوزراء", category: "regulatory" },
  "قانون": { en: "Law", ar: "قانون", category: "legal" },
  "تعميم": { en: "Instruction", ar: "تعميم", category: "regulatory" },
  "قرار جمهوري": { en: "Presidential Decree", ar: "قرار جمهوري", category: "legal" },
  "ارشادات": { en: "Guidelines", ar: "إرشادات", category: "guidance" },
  "اعمال الصرافة": { en: "Exchange Operations", ar: "أعمال الصرافة", category: "regulatory" },
};

interface PublicationMetadata {
  title: string;
  titleAr: string;
  year: number;
  type: string;
  typeAr: string;
  category: string;
  number?: string;
  filePath: string;
}

function extractMetadata(filePath: string): PublicationMetadata | null {
  const fileName = path.basename(filePath, ".pdf");
  const dirPath = path.dirname(filePath);
  
  // Extract year from directory path
  const yearMatch = dirPath.match(/\/(19\d{2}|20\d{2})\/?/);
  const year = yearMatch ? parseInt(yearMatch[1]) : 2020;
  
  // Detect publication type
  let type = "Circular Directive";
  let typeAr = "منشور دوري";
  let category = "regulatory";
  
  for (const [arabicType, mapping] of Object.entries(TYPE_MAPPING)) {
    if (fileName.includes(arabicType) || filePath.includes(arabicType)) {
      type = mapping.en;
      typeAr = mapping.ar;
      category = mapping.category;
      break;
    }
  }
  
  // Extract number if present
  const numberMatch = fileName.match(/رقم\s*(\d+)/);
  const number = numberMatch ? numberMatch[1] : undefined;
  
  // Generate English title
  const titleEn = number 
    ? `CBY ${type} No. ${number} (${year})`
    : `CBY ${type} (${year})`;
  
  return {
    title: titleEn,
    titleAr: fileName,
    year,
    type,
    typeAr,
    category,
    number,
    filePath,
  };
}

async function getAllPdfFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  function walkDir(currentDir: string) {
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          walkDir(fullPath);
        } else if (entry.name.endsWith(".pdf")) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${currentDir}:`, error);
    }
  }
  
  walkDir(dir);
  return files;
}

async function uploadToS3(filePath: string, metadata: PublicationMetadata): Promise<string | null> {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const sanitizedName = `cby-${metadata.year}-${metadata.type.toLowerCase().replace(/\s+/g, "-")}${metadata.number ? `-${metadata.number}` : ""}-${Date.now()}.pdf`;
    
    const result = await storagePut(
      `publications/cby/${sanitizedName}`,
      fileBuffer,
      "application/pdf"
    );
    
    return result.url;
  } catch (error) {
    console.error(`Error uploading ${filePath}:`, error);
    return null;
  }
}

async function seedPublication(metadata: PublicationMetadata, s3Url: string) {
  const insertQuery = `
    INSERT INTO research_publications 
    (title, title_ar, abstract, abstract_ar, organization_id, publication_type, category, 
     publication_date, year, language, url, pdf_url, is_bilingual, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ON DUPLICATE KEY UPDATE updated_at = NOW()
  `;
  
  const abstract = `Central Bank of Yemen ${metadata.type} issued in ${metadata.year}. This document contains official banking regulations and directives.`;
  const abstractAr = `${metadata.typeAr} صادر عن البنك المركزي اليمني في عام ${metadata.year}. يحتوي هذا المستند على اللوائح والتوجيهات المصرفية الرسمية.`;
  
  // Get CBY organization ID (assuming it exists)
  const orgResult = await db.execute("SELECT id FROM research_organizations WHERE code = 'CBY' OR name LIKE '%Central Bank%' LIMIT 1");
  const orgId = (orgResult as any)[0]?.[0]?.id || 1;
  
  await db.execute(insertQuery, [
    metadata.title,
    metadata.titleAr,
    abstract,
    abstractAr,
    orgId,
    metadata.type,
    metadata.category,
    `${metadata.year}-01-01`,
    metadata.year,
    "ar",
    s3Url,
    s3Url,
    true,
  ]);
}

async function createTimelineEvent(metadata: PublicationMetadata) {
  // Only create timeline events for significant directives
  if (!["Law", "Presidential Decree", "Cabinet Decision", "Governor Decision"].includes(metadata.type)) {
    return;
  }
  
  const insertQuery = `
    INSERT INTO economic_events 
    (title, title_ar, description, description_ar, event_date, category, impact_level, 
     source, source_url, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ON DUPLICATE KEY UPDATE updated_at = NOW()
  `;
  
  const description = `Central Bank of Yemen issued ${metadata.type}${metadata.number ? ` No. ${metadata.number}` : ""} in ${metadata.year}.`;
  const descriptionAr = `أصدر البنك المركزي اليمني ${metadata.typeAr}${metadata.number ? ` رقم ${metadata.number}` : ""} في عام ${metadata.year}.`;
  
  await db.execute(insertQuery, [
    metadata.title,
    metadata.titleAr,
    description,
    descriptionAr,
    `${metadata.year}-06-01`,
    "banking",
    metadata.type === "Law" || metadata.type === "Presidential Decree" ? "critical" : "moderate",
    "Central Bank of Yemen",
    "",
  ]);
}

async function main() {
  console.log("Starting CBY Publications Seeding...");
  console.log(`Scanning directory: ${CBY_PUBLICATIONS_DIR}`);
  
  const pdfFiles = await getAllPdfFiles(CBY_PUBLICATIONS_DIR);
  console.log(`Found ${pdfFiles.length} PDF files`);
  
  let uploaded = 0;
  let seeded = 0;
  let errors = 0;
  
  for (const filePath of pdfFiles) {
    try {
      const metadata = extractMetadata(filePath);
      if (!metadata) {
        console.log(`Skipping ${filePath} - could not extract metadata`);
        continue;
      }
      
      console.log(`Processing: ${metadata.title}`);
      
      // Upload to S3
      const s3Url = await uploadToS3(filePath, metadata);
      if (!s3Url) {
        errors++;
        continue;
      }
      uploaded++;
      
      // Seed to database
      await seedPublication(metadata, s3Url);
      seeded++;
      
      // Create timeline event for significant directives
      await createTimelineEvent(metadata);
      
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
      errors++;
    }
  }
  
  console.log("\n=== CBY Publications Seeding Complete ===");
  console.log(`Total files: ${pdfFiles.length}`);
  console.log(`Uploaded to S3: ${uploaded}`);
  console.log(`Seeded to database: ${seeded}`);
  console.log(`Errors: ${errors}`);
}

main().catch(console.error);
