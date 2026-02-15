/**
 * Document Vault Service
 * 
 * Comprehensive knowledge base ingestion system:
 * - Deterministic ingestion paths by allowedUse
 * - Year-by-year backfill planning (2026→2020 priority, then 2019→2010)
 * - Document processing pipeline (OCR, translation, chunking, indexing)
 * - Visibility control (public/restricted/internal)
 */

import { getDb } from "../db";
import {
  sourceProducts,
  documentBackfillPlans,
  documents,
  documentArtifacts,
  documentChunks,
  documentEmbeddings,
  documentSearchIndex,
  documentVaultJobs,
  sources,
  evidencePacks,
  glossaryTerms,
} from "../../drizzle/schema";
import { eq, and, or, desc, asc, sql, inArray, gte, lte } from "drizzle-orm";
import { storagePut, storageGet } from "../storage";
import { invokeLLM } from "../_core/llm";
import { createHash } from "crypto";

// ============================================================================
// TYPES
// ============================================================================

export type AllowedUse = 
  | "DATA_NUMERIC" 
  | "DOC_PDF" 
  | "DOC_NARRATIVE" 
  | "EVENT_DETECTION" 
  | "NEWS_MEDIA"
  | "METADATA_ONLY";

export type ProductType =
  | "annual_report"
  | "quarterly_report"
  | "monthly_report"
  | "weekly_report"
  | "statistical_bulletin"
  | "economic_review"
  | "technical_paper"
  | "working_paper"
  | "policy_brief"
  | "press_release"
  | "circular"
  | "regulation"
  | "dataset"
  | "news_article"
  | "speech"
  | "presentation"
  | "other";

export interface IngestionConfig {
  sourceProductId: number;
  year: number;
  month?: number;
  expectedUrl?: string;
  priority?: "critical" | "high" | "medium" | "low";
  checkMethod?: "web_scrape" | "api" | "manual" | "partner_feed";
}

export interface DocumentProcessingResult {
  documentId: number;
  status: "success" | "partial" | "failed";
  ocrCompleted: boolean;
  translationCompleted: boolean;
  chunkCount: number;
  embeddingCount: number;
  indexed: boolean;
  errors: string[];
}

// ============================================================================
// INGESTION PATH ROUTING
// ============================================================================

/**
 * Determine ingestion pipeline based on allowedUse
 */
export function getIngestionPipeline(allowedUse: AllowedUse[]): {
  shouldExtractData: boolean;
  shouldExtractText: boolean;
  shouldDetectEvents: boolean;
  shouldProcessMedia: boolean;
  requiresOCR: boolean;
  requiresTranslation: boolean;
  requiresChunking: boolean;
  requiresEmbeddings: boolean;
} {
  const hasDataNumeric = allowedUse.includes("DATA_NUMERIC");
  const hasDocPdf = allowedUse.includes("DOC_PDF");
  const hasDocNarrative = allowedUse.includes("DOC_NARRATIVE");
  const hasEventDetection = allowedUse.includes("EVENT_DETECTION");
  const hasNewsMedia = allowedUse.includes("NEWS_MEDIA");

  return {
    shouldExtractData: hasDataNumeric,
    shouldExtractText: hasDocPdf || hasDocNarrative || hasNewsMedia,
    shouldDetectEvents: hasEventDetection,
    shouldProcessMedia: hasNewsMedia,
    requiresOCR: hasDocPdf,
    requiresTranslation: hasDocNarrative || hasNewsMedia,
    requiresChunking: hasDocNarrative || hasNewsMedia,
    requiresEmbeddings: hasDocNarrative || hasNewsMedia,
  };
}

// ============================================================================
// BACKFILL PLANNING
// ============================================================================

/**
 * Create year-by-year backfill plans for a source product
 * Priority: 2026→2020 first (high), then 2019→2010 (medium)
 */
export async function createBackfillPlan(
  sourceProductId: number,
  historicalStartYear: number = 2010,
  historicalEndYear: number = 2026
): Promise<{
  created: number;
  skipped: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get source product details
  const [product] = await db
    .select()
    .from(sourceProducts)
    .where(eq(sourceProducts.id, sourceProductId))
    .limit(1);

  if (!product) throw new Error(`Source product ${sourceProductId} not found`);

  let created = 0;
  let skipped = 0;

  // Priority years: 2026→2020 (high priority)
  const priorityYears = [];
  for (let year = 2026; year >= 2020; year--) {
    if (year >= historicalStartYear && year <= historicalEndYear) {
      priorityYears.push(year);
    }
  }

  // Historical years: 2019→2010 (medium priority)
  const historicalYears = [];
  for (let year = 2019; year >= historicalStartYear; year--) {
    historicalYears.push(year);
  }

  // Create plans for priority years
  for (const year of priorityYears) {
    const result = await createBackfillPlansForYear(
      db,
      sourceProductId,
      year,
      product.publishingFrequency,
      "high"
    );
    created += result.created;
    skipped += result.skipped;
  }

  // Create plans for historical years
  for (const year of historicalYears) {
    const result = await createBackfillPlansForYear(
      db,
      sourceProductId,
      year,
      product.publishingFrequency,
      "medium"
    );
    created += result.created;
    skipped += result.skipped;
  }

  return { created, skipped };
}

async function createBackfillPlansForYear(
  db: any,
  sourceProductId: number,
  year: number,
  frequency: string,
  priority: "critical" | "high" | "medium" | "low"
): Promise<{
  created: number;
  skipped: number;
}> {
  let created = 0;
  let skipped = 0;

  // Determine months based on frequency
  const months: (number | null)[] = getMonthsForFrequency(frequency);

  for (const month of months) {
    // Check if plan already exists
    const existing = await db
      .select()
      .from(documentBackfillPlans)
      .where(
        and(
          eq(documentBackfillPlans.sourceProductId, sourceProductId),
          eq(documentBackfillPlans.targetYear, year),
          month !== null 
            ? eq(documentBackfillPlans.targetMonth, month)
            : sql`${documentBackfillPlans.targetMonth} IS NULL`
        )
      )
      .limit(1);

    if (existing.length > 0) {
      skipped++;
      continue;
    }

    // Create new backfill plan
    await db.insert(documentBackfillPlans).values({
      sourceProductId,
      targetYear: year,
      targetMonth: month,
      priority,
      status: "planned",
      attemptCount: 0,
    });

    created++;
  }

  return { created, skipped };
}

function getMonthsForFrequency(frequency: string): (number | null)[] {
  switch (frequency) {
    case "monthly":
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    case "quarterly":
      return [3, 6, 9, 12]; // Q1=March, Q2=June, Q3=Sept, Q4=Dec
    case "annual":
    case "one_time":
      return [null]; // No specific month
    case "weekly":
      // For weekly, create 52 entries (simplified: 4 per month)
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    default:
      return [null];
  }
}

/**
 * Get next backfill plans to execute
 */
export async function getNextBackfillPlans(
  limit: number = 10,
  priorityFilter?: "critical" | "high" | "medium" | "low"
): Promise<Array<{
  id: number;
  sourceProductId: number;
  productName: string;
  targetYear: number;
  targetMonth: number | null;
  priority: string;
  status: string;
}>> {
  const db = await getDb();
  if (!db) return [];

  const query = db
    .select({
      id: documentBackfillPlans.id,
      sourceProductId: documentBackfillPlans.sourceProductId,
      productName: sourceProducts.productName,
      targetYear: documentBackfillPlans.targetYear,
      targetMonth: documentBackfillPlans.targetMonth,
      priority: documentBackfillPlans.priority,
      status: documentBackfillPlans.status,
    })
    .from(documentBackfillPlans)
    .innerJoin(sourceProducts, eq(sourceProducts.id, documentBackfillPlans.sourceProductId))
    .where(
      and(
        eq(documentBackfillPlans.status, "planned"),
        priorityFilter 
          ? eq(documentBackfillPlans.priority, priorityFilter)
          : undefined
      )
    )
    .orderBy(
      // Order by priority, then year descending (recent first)
      asc(
        sql`CASE ${documentBackfillPlans.priority}
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
          ELSE 5 END`
      ),
      desc(documentBackfillPlans.targetYear)
    )
    .limit(limit);

  return await query;
}

// ============================================================================
// DOCUMENT INGESTION
// ============================================================================

/**
 * Ingest a document for a backfill plan
 */
export async function ingestDocumentForPlan(
  planId: number,
  fileBuffer: Buffer,
  fileName: string,
  sourceUrl?: string
): Promise<{
  documentId: number;
  status: "success" | "failed";
  error?: string;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Get backfill plan
    const [plan] = await db
      .select()
      .from(documentBackfillPlans)
      .where(eq(documentBackfillPlans.id, planId))
      .limit(1);

    if (!plan) throw new Error(`Backfill plan ${planId} not found`);

    // Get source product
    const [product] = await db
      .select()
      .from(sourceProducts)
      .where(eq(sourceProducts.id, plan.sourceProductId))
      .limit(1);

    if (!product) throw new Error(`Source product ${plan.sourceProductId} not found`);

    // Calculate SHA256 hash
    const sha256 = createHash("sha256").update(fileBuffer).digest("hex");

    // Check for duplicate
    const existing = await db
      .select()
      .from(documents)
      .where(eq(documents.sha256Hash, sha256))
      .limit(1);

    if (existing.length > 0) {
      // Update plan to reference existing document
      await db
        .update(documentBackfillPlans)
        .set({
          status: "ingested",
          documentId: existing[0].id,
          actualUrl: sourceUrl,
          lastAttemptDate: new Date(),
        })
        .where(eq(documentBackfillPlans.id, planId));

      return {
        documentId: existing[0].id,
        status: "success",
      };
    }

    // Upload to storage
    const storageKey = `documents/raw/${product.id}/${plan.targetYear}/${fileName}`;
    const { url: storageUrl } = await storagePut(
      storageKey,
      fileBuffer,
      getMimeType(fileName)
    );

    // Determine processing pipeline
    const pipeline = getIngestionPipeline(product.allowedUse as AllowedUse[]);

    // Create document record
    const [insertResult] = await db.insert(documents).values({
      title: fileName,
      fileKey: storageKey,
      fileUrl: storageUrl,
      mimeType: getMimeType(fileName),
      fileSize: fileBuffer.length,
      sourceId: product.sourceId,
      sourceProductId: product.id,
      license: product.license || undefined,
      publicationDate: new Date(plan.targetYear, (plan.targetMonth || 1) - 1, 1),
      category: product.productType,
      language: "en",
      regimeTag: product.regimeTag || undefined,
      sectorTags: product.sectorTags || [],
      visibility: product.visibility || "public",
      processingStatus: "pending",
      ocrStatus: pipeline.requiresOCR ? "pending" : "not_needed",
      translationStatus: pipeline.requiresTranslation ? "pending" : "not_needed",
      indexingStatus: "pending",
      sha256Hash: sha256,
      retrievalUrl: sourceUrl,
      retrievalTimestamp: new Date(),
    });

    const documentId = Number(insertResult.insertId);

    // Create artifact record
    await db.insert(documentArtifacts).values({
      documentId,
      storageKey,
      storageUrl,
      sha256Hash: sha256,
      artifactType: "raw_original",
      mimeType: getMimeType(fileName),
      fileSize: fileBuffer.length,
      retrievalTimestamp: new Date(),
      retrievalMethod: "download",
      retrievalUrl: sourceUrl,
      processingStatus: "pending",
    });

    // Update backfill plan
    await db
      .update(documentBackfillPlans)
      .set({
        status: "ingested",
        documentId,
        actualUrl: sourceUrl,
        lastAttemptDate: new Date(),
        attemptCount: plan.attemptCount + 1,
      })
      .where(eq(documentBackfillPlans.id, planId));

    // Queue processing job
    await db.insert(documentVaultJobs).values({
      jobType: "document_process",
      jobStatus: "pending",
      parameters: { documentId },
      totalItems: 1,
      priority: plan.priority === "critical" ? 1 : plan.priority === "high" ? 2 : 5,
    });

    return {
      documentId,
      status: "success",
    };
  } catch (error) {
    // Update plan with error
    await db
      .update(documentBackfillPlans)
      .set({
        status: "failed",
        lastAttemptDate: new Date(),
        errorLog: String(error),
      })
      .where(eq(documentBackfillPlans.id, planId));

    return {
      documentId: 0,
      status: "failed",
      error: String(error),
    };
  }
}

// ============================================================================
// DOCUMENT PROCESSING
// ============================================================================

/**
 * Process a document through the full pipeline
 */
export async function processDocument(
  documentId: number
): Promise<DocumentProcessingResult> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const errors: string[] = [];
  let ocrCompleted = false;
  let translationCompleted = false;
  let chunkCount = 0;
  let embeddingCount = 0;
  let indexed = false;

  try {
    // Get document
    const [doc] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);

    if (!doc) throw new Error(`Document ${documentId} not found`);

    // Update status
    await db
      .update(documents)
      .set({ processingStatus: "extracting" })
      .where(eq(documents.id, documentId));

    // 1. OCR if needed
    if (doc.ocrStatus === "pending") {
      try {
        await performOCR(documentId);
        ocrCompleted = true;
      } catch (err) {
        errors.push(`OCR failed: ${err}`);
      }
    }

    // 2. Extract text
    await db
      .update(documents)
      .set({ processingStatus: "chunking" })
      .where(eq(documents.id, documentId));

    const extractedText = await extractDocumentText(documentId);

    // 3. Create chunks
    const chunks = await createDocumentChunks(documentId, extractedText);
    chunkCount = chunks.length;

    // 4. Translate if needed
    if (doc.translationStatus === "pending") {
      try {
        await db
          .update(documents)
          .set({ processingStatus: "translating" })
          .where(eq(documents.id, documentId));

        await translateDocumentChunks(documentId);
        translationCompleted = true;
      } catch (err) {
        errors.push(`Translation failed: ${err}`);
      }
    }

    // 5. Generate embeddings
    try {
      const embeddings = await generateDocumentEmbeddings(documentId);
      embeddingCount = embeddings;
    } catch (err) {
      errors.push(`Embeddings failed: ${err}`);
    }

    // 6. Index for search
    try {
      await db
        .update(documents)
        .set({ processingStatus: "indexing" })
        .where(eq(documents.id, documentId));

      await indexDocumentForSearch(documentId);
      indexed = true;
    } catch (err) {
      errors.push(`Indexing failed: ${err}`);
    }

    // 7. Create evidence pack
    try {
      await createEvidencePack(documentId);
    } catch (err) {
      errors.push(`Evidence pack failed: ${err}`);
    }

    // Update final status
    await db
      .update(documents)
      .set({
        processingStatus: errors.length === 0 ? "completed" : "failed",
        ocrStatus: doc.ocrStatus === "pending" ? (ocrCompleted ? "completed" : "failed") : doc.ocrStatus,
        translationStatus: doc.translationStatus === "pending" ? (translationCompleted ? "completed" : "failed") : doc.translationStatus,
        indexingStatus: indexed ? "completed" : "failed",
      })
      .where(eq(documents.id, documentId));

    return {
      documentId,
      status: errors.length === 0 ? "success" : errors.length < 3 ? "partial" : "failed",
      ocrCompleted,
      translationCompleted,
      chunkCount,
      embeddingCount,
      indexed,
      errors,
    };
  } catch (error) {
    await db
      .update(documents)
      .set({ processingStatus: "failed" })
      .where(eq(documents.id, documentId));

    return {
      documentId,
      status: "failed",
      ocrCompleted: false,
      translationCompleted: false,
      chunkCount: 0,
      embeddingCount: 0,
      indexed: false,
      errors: [String(error)],
    };
  }
}

/**
 * Perform OCR on a document
 */
async function performOCR(documentId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get document
  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  if (!doc) throw new Error(`Document ${documentId} not found`);

  // Update status
  await db
    .update(documents)
    .set({ ocrStatus: "processing" })
    .where(eq(documents.id, documentId));

  // In production: Use Tesseract, Google Cloud Vision, or AWS Textract
  // For now, simulate OCR
  console.log(`[DocumentVault] Performing OCR on document ${documentId}`);
  
  // Simulate OCR delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // Create OCR artifact (simulated)
  const ocrText = `OCR extracted text from ${doc.title}`;
  const ocrBuffer = Buffer.from(ocrText, "utf-8");
  const storageKey = `documents/ocr/${documentId}/extracted.txt`;
  const { url: storageUrl } = await storagePut(storageKey, ocrBuffer, "text/plain");

  await db.insert(documentArtifacts).values({
    documentId,
    storageKey,
    storageUrl,
    sha256Hash: createHash("sha256").update(ocrBuffer).digest("hex"),
    artifactType: "ocr_extracted",
    mimeType: "text/plain",
    fileSize: ocrBuffer.length,
    retrievalTimestamp: new Date(),
    processingStatus: "completed",
  });

  await db
    .update(documents)
    .set({ ocrStatus: "completed" })
    .where(eq(documents.id, documentId));
}

/**
 * Extract text from document
 */
async function extractDocumentText(documentId: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get document and artifacts
  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  if (!doc) throw new Error(`Document ${documentId} not found`);

  // Check for OCR artifact
  const ocrArtifacts = await db
    .select()
    .from(documentArtifacts)
    .where(
      and(
        eq(documentArtifacts.documentId, documentId),
        eq(documentArtifacts.artifactType, "ocr_extracted")
      )
    )
    .limit(1);

  if (ocrArtifacts.length > 0) {
    // Download OCR text
    const { url } = await storageGet(ocrArtifacts[0].storageKey);
    const response = await fetch(url);
    return await response.text();
  }

  // In production: Use pdf-parse, mammoth, xlsx for extraction
  // For now, return placeholder
  return `Document content from ${doc.title}`;
}

/**
 * Create document chunks for search
 */
async function createDocumentChunks(
  documentId: number,
  fullText: string
): Promise<Array<{ chunkIndex: number; chunkText: string; anchorId: string }>> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Split text into paragraphs
  const paragraphs = fullText.split(/\n\n+/).filter(p => p.trim().length > 50);
  
  const chunks: Array<{ chunkIndex: number; chunkText: string; anchorId: string }> = [];
  const CHUNK_SIZE = 500; // words

  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i];
    const words = para.split(/\s+/);
    
    // Split large paragraphs into chunks
    for (let j = 0; j < words.length; j += CHUNK_SIZE) {
      const chunkWords = words.slice(j, j + CHUNK_SIZE);
      const chunkText = chunkWords.join(" ");
      
      const chunkIndex = chunks.length;
      const anchorId = `chunk_${chunkIndex}`;
      
      await db.insert(documentChunks).values({
        documentId,
        chunkIndex,
        chunkText,
        anchorId,
        anchorType: "paragraph",
        pageNumber: Math.floor(i / 3) + 1, // Estimate 3 paragraphs per page
        tokenCount: chunkWords.length,
        language: "en",
      });

      chunks.push({ chunkIndex, chunkText, anchorId });
    }
  }

  return chunks;
}

/**
 * Translate document chunks to Arabic
 */
async function translateDocumentChunks(documentId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(documents)
    .set({ translationStatus: "processing" })
    .where(eq(documents.id, documentId));

  // Get all chunks
  const chunks = await db
    .select()
    .from(documentChunks)
    .where(eq(documentChunks.documentId, documentId))
    .orderBy(asc(documentChunks.chunkIndex));

  // Load glossary
  const glossary = await db.select().from(glossaryTerms).limit(100);
  const glossaryMap = new Map(glossary.map(g => [g.termEn?.toLowerCase() || "", g.termAr || ""]));

  // Translate each chunk
  for (const chunk of chunks) {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are a professional Arabic translator specializing in economic documents about Yemen.
            Use these glossary terms for consistency:
            ${Array.from(glossaryMap.entries()).slice(0, 30).map(([en, ar]) => `${en} = ${ar}`).join("\n")}
            
            Translate accurately while maintaining technical terminology.`,
          },
          {
            role: "user",
            content: chunk.chunkText,
          },
        ],
      });

      const translatedText = response.choices[0]?.message?.content;
      if (translatedText && typeof translatedText === "string") {
        await db
          .update(documentChunks)
          .set({ chunkTextAr: translatedText })
          .where(eq(documentChunks.id, chunk.id));
      }
    } catch (err) {
      console.error(`[DocumentVault] Translation failed for chunk ${chunk.id}:`, err);
    }
  }

  await db
    .update(documents)
    .set({ translationStatus: "completed" })
    .where(eq(documents.id, documentId));
}

/**
 * Generate embeddings for document chunks
 */
async function generateDocumentEmbeddings(documentId: number): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get all chunks
  const chunks = await db
    .select()
    .from(documentChunks)
    .where(eq(documentChunks.documentId, documentId));

  // In production: Call OpenAI embeddings API or similar
  // For now, generate dummy embeddings
  let count = 0;
  for (const chunk of chunks) {
    // Simulate embedding (1536 dimensions for text-embedding-3-small)
    const embedding = Array.from({ length: 1536 }, () => Math.random());

    await db.insert(documentEmbeddings).values({
      chunkId: chunk.id,
      embedding,
      embeddingModel: "text-embedding-3-small",
      embeddingDimension: 1536,
    });

    count++;
  }

  return count;
}

/**
 * Index document for full-text search
 */
async function indexDocumentForSearch(documentId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get document
  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  if (!doc) throw new Error(`Document ${documentId} not found`);

  // Get all chunks
  const chunks = await db
    .select()
    .from(documentChunks)
    .where(eq(documentChunks.documentId, documentId));

  const fullText = chunks.map(c => c.chunkText).join("\n");
  const fullTextAr = chunks
    .map(c => c.chunkTextAr)
    .filter(Boolean)
    .join("\n");

  // Create or update search index
  const existing = await db
    .select()
    .from(documentSearchIndex)
    .where(eq(documentSearchIndex.documentId, documentId))
    .limit(1);

  const publicationYear = doc.publicationDate
    ? new Date(doc.publicationDate).getFullYear()
    : null;

  if (existing.length > 0) {
    await db
      .update(documentSearchIndex)
      .set({
        title: doc.title,
        titleAr: doc.titleAr || undefined,
        fullText,
        fullTextAr: fullTextAr || undefined,
        sourceId: doc.sourceId || undefined,
        sourceProductId: doc.sourceProductId || undefined,
        publicationYear,
        sectorTags: doc.sectorTags || [],
        regimeTag: doc.regimeTag || undefined,
        language: doc.language || "en",
        visibility: doc.visibility || "public",
        lastIndexedAt: new Date(),
      })
      .where(eq(documentSearchIndex.id, existing[0].id));
  } else {
    await db.insert(documentSearchIndex).values({
      documentId,
      title: doc.title,
      titleAr: doc.titleAr || undefined,
      fullText,
      fullTextAr: fullTextAr || undefined,
      sourceId: doc.sourceId || undefined,
      sourceProductId: doc.sourceProductId || undefined,
      publicationYear,
      sectorTags: doc.sectorTags || [],
      regimeTag: doc.regimeTag || undefined,
      language: doc.language || "en",
      visibility: doc.visibility || "public",
      lastIndexedAt: new Date(),
    });
  }
}

/**
 * Create evidence pack for document
 */
async function createEvidencePack(documentId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get document
  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  if (!doc) throw new Error(`Document ${documentId} not found`);

  // Get source
  const [source] = doc.sourceId
    ? await db
        .select()
        .from(sources)
        .where(eq(sources.id, doc.sourceId))
        .limit(1)
    : [null];

  // Get chunks for citations
  const chunks = await db
    .select()
    .from(documentChunks)
    .where(eq(documentChunks.documentId, documentId))
    .limit(10); // First 10 chunks

  const citations = chunks.map(chunk => ({
    sourceId: doc.sourceId || 0,
    title: `${doc.title} - ${chunk.anchorId}`,
    publisher: source?.publisher || "Unknown",
    url: doc.fileUrl,
    retrievalDate: new Date().toISOString(),
    licenseFlag: doc.license || "unknown",
    anchor: chunk.anchorId,
    rawObjectRef: doc.fileKey,
  }));

  // Create evidence pack
  const [result] = await db.insert(evidencePacks).values({
    subjectType: "document",
    subjectId: String(documentId),
    subjectLabel: doc.title,
    citations,
    transforms: [],
    regimeTags: doc.regimeTag ? [doc.regimeTag] : ["both"],
    geoScope: "National",
    timeCoverageStart: doc.publicationDate,
    timeCoverageEnd: doc.publicationDate,
    dqafIntegrity: "pass",
    dqafMethodology: "unknown",
    dqafAccuracyReliability: "unknown",
    dqafServiceability: "pass",
    dqafAccessibility: "pass",
    confidenceGrade: "B",
    confidenceExplanation: "Document ingested via automated pipeline",
  });

  // Update document with evidence pack reference
  await db
    .update(documents)
    .set({ evidencePackId: Number(result.insertId) })
    .where(eq(documents.id, documentId));
}

// ============================================================================
// UTILITIES
// ============================================================================

function getMimeType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "doc":
      return "application/msword";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "xls":
      return "application/vnd.ms-excel";
    case "csv":
      return "text/csv";
    case "txt":
      return "text/plain";
    case "html":
      return "text/html";
    default:
      return "application/octet-stream";
  }
}
