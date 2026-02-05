/**
 * Document Vault API Router
 * 
 * Endpoints for document ingestion, search, and management
 */

import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import {
  createBackfillPlan,
  getNextBackfillPlans,
  ingestDocumentForPlan,
  processDocument,
} from "../services/documentVaultService";
import {
  searchDocuments,
  getTop10Results,
  runSearchRegressionTest,
} from "../services/documentSearchService";
import {
  gateResponse,
  addCitationFootnotes,
  verifyReportEvidence,
  getEvidenceQualityMetrics,
} from "../services/evidenceGateService";
import { getDb } from "../db";
import {
  sourceProducts,
  documentBackfillPlans,
  documents,
  documentVaultJobs,
} from "../../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

// ============================================================================
// SOURCE PRODUCTS
// ============================================================================

/**
 * GET /api/document-vault/source-products
 * List all source products
 */
router.get("/source-products", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) return res.status(500).json({ error: "Database unavailable" });

    const products = await db
      .select()
      .from(sourceProducts)
      .orderBy(desc(sourceProducts.createdAt))
      .limit(100);

    res.json({ products });
  } catch (error) {
    console.error("[DocumentVault] Error fetching source products:", error);
    res.status(500).json({ error: String(error) });
  }
});

/**
 * POST /api/document-vault/source-products
 * Create a new source product
 */
router.post("/source-products", async (req, res) => {
  try {
    const schema = z.object({
      sourceId: z.number(),
      productType: z.string(),
      productName: z.string(),
      productNameAr: z.string().optional(),
      allowedUse: z.array(z.string()),
      publishingFrequency: z.string(),
      historicalStartYear: z.number().optional(),
      historicalEndYear: z.number().optional(),
      sectorTags: z.array(z.string()).optional(),
      regimeTag: z.string().optional(),
      visibility: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const db = await getDb();
    if (!db) return res.status(500).json({ error: "Database unavailable" });

    const [result] = await db.insert(sourceProducts).values(data as any);
    const productId = Number(result.insertId);

    // Create backfill plan if historical years specified
    if (data.historicalStartYear) {
      await createBackfillPlan(
        productId,
        data.historicalStartYear,
        data.historicalEndYear || new Date().getFullYear()
      );
    }

    res.json({ productId, message: "Source product created" });
  } catch (error) {
    console.error("[DocumentVault] Error creating source product:", error);
    res.status(400).json({ error: String(error) });
  }
});

// ============================================================================
// BACKFILL PLANS
// ============================================================================

/**
 * GET /api/document-vault/backfill-plans
 * Get next backfill plans to execute
 */
router.get("/backfill-plans", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const priority = req.query.priority as string;

    const plans = await getNextBackfillPlans(
      limit,
      priority as any
    );

    res.json({ plans });
  } catch (error) {
    console.error("[DocumentVault] Error fetching backfill plans:", error);
    res.status(500).json({ error: String(error) });
  }
});

/**
 * POST /api/document-vault/backfill-plans/:planId/ingest
 * Ingest a document for a backfill plan
 */
router.post("/backfill-plans/:planId/ingest", upload.single("file"), async (req, res) => {
  try {
    const planId = parseInt(req.params.planId);
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const sourceUrl = req.body.sourceUrl;

    const result = await ingestDocumentForPlan(
      planId,
      req.file.buffer,
      req.file.originalname,
      sourceUrl
    );

    if (result.status === "success") {
      res.json({
        message: "Document ingested successfully",
        documentId: result.documentId,
      });
    } else {
      res.status(500).json({
        error: result.error,
        message: "Document ingestion failed",
      });
    }
  } catch (error) {
    console.error("[DocumentVault] Error ingesting document:", error);
    res.status(500).json({ error: String(error) });
  }
});

// ============================================================================
// DOCUMENTS
// ============================================================================

/**
 * GET /api/document-vault/documents
 * Search documents
 */
router.get("/documents", async (req, res) => {
  try {
    const query = req.query.q as string || "";
    const language = req.query.language as any;
    const sectors = req.query.sectors
      ? (req.query.sectors as string).split(",")
      : undefined;
    const regimeTag = req.query.regimeTag as any;
    const yearFrom = req.query.yearFrom
      ? parseInt(req.query.yearFrom as string)
      : undefined;
    const yearTo = req.query.yearTo
      ? parseInt(req.query.yearTo as string)
      : undefined;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const results = await searchDocuments({
      query,
      language,
      sectors,
      regimeTag,
      yearFrom,
      yearTo,
      limit,
      offset,
    });

    res.json(results);
  } catch (error) {
    console.error("[DocumentVault] Error searching documents:", error);
    res.status(500).json({ error: String(error) });
  }
});

/**
 * GET /api/document-vault/documents/:id
 * Get document details
 */
router.get("/documents/:id", async (req, res) => {
  try {
    const documentId = parseInt(req.params.id);
    const db = await getDb();
    if (!db) return res.status(500).json({ error: "Database unavailable" });

    const [doc] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);

    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.json({ document: doc });
  } catch (error) {
    console.error("[DocumentVault] Error fetching document:", error);
    res.status(500).json({ error: String(error) });
  }
});

/**
 * POST /api/document-vault/documents/:id/process
 * Trigger document processing
 */
router.post("/documents/:id/process", async (req, res) => {
  try {
    const documentId = parseInt(req.params.id);

    const result = await processDocument(documentId);

    res.json(result);
  } catch (error) {
    console.error("[DocumentVault] Error processing document:", error);
    res.status(500).json({ error: String(error) });
  }
});

/**
 * POST /api/document-vault/upload
 * Upload a document manually
 */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const schema = z.object({
      title: z.string(),
      sourceId: z.number().optional(),
      sourceProductId: z.number().optional(),
      category: z.string().optional(),
      visibility: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const db = await getDb();
    if (!db) return res.status(500).json({ error: "Database unavailable" });

    // TODO: Process upload similar to ingestDocumentForPlan
    res.json({ message: "Upload endpoint not fully implemented yet" });
  } catch (error) {
    console.error("[DocumentVault] Error uploading document:", error);
    res.status(400).json({ error: String(error) });
  }
});

// ============================================================================
// SEARCH
// ============================================================================

/**
 * GET /api/document-vault/search/top10
 * Get top 10 results for a query (for testing)
 */
router.get("/search/top10", async (req, res) => {
  try {
    const query = req.query.q as string;
    const language = (req.query.language as any) || "en";

    if (!query) {
      return res.status(400).json({ error: "Query parameter 'q' required" });
    }

    const results = await getTop10Results(query, language);
    res.json({ results });
  } catch (error) {
    console.error("[DocumentVault] Error in top10 search:", error);
    res.status(500).json({ error: String(error) });
  }
});

/**
 * POST /api/document-vault/search/regression-test
 * Run search regression test
 */
router.post("/search/regression-test", async (req, res) => {
  try {
    const results = await runSearchRegressionTest();
    res.json(results);
  } catch (error) {
    console.error("[DocumentVault] Error in regression test:", error);
    res.status(500).json({ error: String(error) });
  }
});

// ============================================================================
// EVIDENCE GATE
// ============================================================================

/**
 * POST /api/document-vault/evidence-gate
 * Gate an AI response through evidence verification
 */
router.post("/evidence-gate", async (req, res) => {
  try {
    const schema = z.object({
      responseText: z.string(),
      claim: z.string(),
      subject: z.string().optional(),
      context: z.string().optional(),
      minConfidencePercent: z.number().optional(),
    });

    const data = schema.parse(req.body);

    const result = await gateResponse(data.responseText, {
      claim: data.claim,
      subject: data.subject,
      context: data.context,
      minConfidencePercent: data.minConfidencePercent,
    });

    res.json(result);
  } catch (error) {
    console.error("[DocumentVault] Error in evidence gate:", error);
    res.status(400).json({ error: String(error) });
  }
});

/**
 * POST /api/document-vault/verify-report
 * Verify evidence for a full report
 */
router.post("/verify-report", async (req, res) => {
  try {
    const schema = z.object({
      reportContent: z.string(),
      sectionBreakdown: z.array(
        z.object({
          section: z.string(),
          claims: z.array(z.string()),
        })
      ),
    });

    const data = schema.parse(req.body);

    const result = await verifyReportEvidence(
      data.reportContent,
      data.sectionBreakdown
    );

    res.json(result);
  } catch (error) {
    console.error("[DocumentVault] Error verifying report:", error);
    res.status(400).json({ error: String(error) });
  }
});

/**
 * GET /api/document-vault/evidence-metrics
 * Get evidence quality metrics
 */
router.get("/evidence-metrics", async (req, res) => {
  try {
    const metrics = await getEvidenceQualityMetrics();
    res.json(metrics);
  } catch (error) {
    console.error("[DocumentVault] Error fetching evidence metrics:", error);
    res.status(500).json({ error: String(error) });
  }
});

// ============================================================================
// JOBS & MONITORING
// ============================================================================

/**
 * GET /api/document-vault/jobs
 * List background jobs
 */
router.get("/jobs", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) return res.status(500).json({ error: "Database unavailable" });

    const jobs = await db
      .select()
      .from(documentVaultJobs)
      .orderBy(desc(documentVaultJobs.createdAt))
      .limit(50);

    res.json({ jobs });
  } catch (error) {
    console.error("[DocumentVault] Error fetching jobs:", error);
    res.status(500).json({ error: String(error) });
  }
});

/**
 * GET /api/document-vault/stats
 * Get vault statistics
 */
router.get("/stats", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) return res.status(500).json({ error: "Database unavailable" });

    // Count documents by status
    const docStats = await db.execute(sql`
      SELECT 
        processingStatus,
        COUNT(*) as count
      FROM ${documents}
      GROUP BY processingStatus
    `);

    // Count backfill plans by status
    const planStats = await db.execute(sql`
      SELECT 
        status,
        COUNT(*) as count
      FROM ${documentBackfillPlans}
      GROUP BY status
    `);

    // Count source products
    const [productCount] = await db.execute(sql`
      SELECT COUNT(*) as count FROM ${sourceProducts}
    `);

    const stats = {
      documents: docStats,
      backfillPlans: planStats,
      sourceProducts: (productCount as any)[0]?.count || 0,
    };

    res.json(stats);
  } catch (error) {
    console.error("[DocumentVault] Error fetching stats:", error);
    res.status(500).json({ error: String(error) });
  }
});

export default router;
