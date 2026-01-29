/**
 * Library Router - API endpoints for Literature & Knowledge Base
 */

import { router, publicProcedure, protectedProcedure, adminProcedure } from '../_core/trpc';
import { z } from 'zod';
import * as literatureService from '../services/literatureService';
import * as literatureIngestionService from '../services/literatureIngestionService';
import * as citationAnchorService from '../services/citationAnchorService';
import * as translationService from '../services/translationService';

export const libraryRouter = router({
  // ============================================================================
  // PUBLIC ENDPOINTS
  // ============================================================================

  /**
   * Search documents with filters
   */
  searchDocuments: publicProcedure
    .input(z.object({
      query: z.string().optional(),
      sectors: z.array(z.string()).optional(),
      years: z.array(z.number()).optional(),
      publishers: z.array(z.string()).optional(),
      docTypes: z.array(z.string()).optional(),
      languages: z.array(z.string()).optional(),
      licenseFlags: z.array(z.string()).optional(),
      regimeTags: z.array(z.string()).optional(),
      status: z.array(z.string()).optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0)
    }))
    .query(async ({ input }) => {
      return literatureService.searchDocuments({
        query: input.query,
        sectors: input.sectors,
        years: input.years,
        publishers: input.publishers,
        docTypes: input.docTypes,
        languages: input.languages,
        licenseFlags: input.licenseFlags,
        regimeTags: input.regimeTags,
        status: input.status || ['published'],
        limit: input.limit,
        offset: input.offset
      });
    }),

  /**
   * Get document by ID
   */
  getDocument: publicProcedure
    .input(z.object({
      id: z.number().optional(),
      docId: z.string().optional()
    }))
    .query(async ({ input }) => {
      if (input.id) {
        return literatureService.getDocumentById(input.id);
      } else if (input.docId) {
        return literatureService.getDocumentByDocId(input.docId);
      }
      return null;
    }),

  /**
   * Get document versions
   */
  getDocumentVersions: publicProcedure
    .input(z.object({
      documentId: z.number()
    }))
    .query(async ({ input }) => {
      return literatureService.getDocumentVersions(input.documentId);
    }),

  /**
   * Get documents by sector
   */
  getDocumentsBySector: publicProcedure
    .input(z.object({
      sectorCode: z.string(),
      limit: z.number().min(1).max(50).default(10)
    }))
    .query(async ({ input }) => {
      return literatureService.getDocumentsBySector(input.sectorCode, input.limit);
    }),

  /**
   * Get documents by entity
   */
  getDocumentsByEntity: publicProcedure
    .input(z.object({
      entityId: z.number(),
      limit: z.number().min(1).max(50).default(10)
    }))
    .query(async ({ input }) => {
      return literatureService.getDocumentsByEntity(input.entityId, input.limit);
    }),

  /**
   * Get recent documents
   */
  getRecentDocuments: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10)
    }))
    .query(async ({ input }) => {
      return literatureService.getRecentDocuments(input.limit);
    }),

  /**
   * Get document statistics
   */
  getDocumentStatistics: publicProcedure
    .query(async () => {
      return literatureService.getDocumentStatistics();
    }),

  /**
   * Get citation anchors for a document version
   */
  getAnchorsForVersion: publicProcedure
    .input(z.object({
      versionId: z.number()
    }))
    .query(async ({ input }) => {
      return citationAnchorService.getAnchorsForVersion(input.versionId);
    }),

  /**
   * Get anchor by ID
   */
  getAnchor: publicProcedure
    .input(z.object({
      id: z.number().optional(),
      anchorId: z.string().optional()
    }))
    .query(async ({ input }) => {
      if (input.id) {
        return citationAnchorService.getAnchorById(input.id);
      } else if (input.anchorId) {
        return citationAnchorService.getAnchorByAnchorId(input.anchorId);
      }
      return null;
    }),

  /**
   * Get extracted tables for a document version
   */
  getTablesForVersion: publicProcedure
    .input(z.object({
      versionId: z.number()
    }))
    .query(async ({ input }) => {
      return citationAnchorService.getTablesForVersion(input.versionId);
    }),

  /**
   * Get glossary terms
   */
  getGlossaryTerms: publicProcedure
    .input(z.object({
      sector: z.string().optional()
    }))
    .query(async ({ input }) => {
      if (input.sector) {
        return translationService.getGlossaryTermsBySector(input.sector);
      }
      return translationService.getGlossaryTerms();
    }),

  /**
   * Get document links for an indicator
   */
  getDocumentLinksForIndicator: publicProcedure
    .input(z.object({
      seriesId: z.number()
    }))
    .query(async ({ input }) => {
      return citationAnchorService.getDocumentLinksForIndicator(input.seriesId);
    }),

  /**
   * Get document links for an event
   */
  getDocumentLinksForEvent: publicProcedure
    .input(z.object({
      eventId: z.number()
    }))
    .query(async ({ input }) => {
      return citationAnchorService.getDocumentLinksForEvent(input.eventId);
    }),

  // ============================================================================
  // ADMIN ENDPOINTS
  // ============================================================================

  /**
   * Create a new document (admin only)
   */
  createDocument: adminProcedure
    .input(z.object({
      titleEn: z.string(),
      titleAr: z.string().optional(),
      publisherName: z.string(),
      publisherEntityId: z.number().optional(),
      sourceId: z.number().optional(),
      canonicalUrl: z.string().optional(),
      publishedAt: z.string().optional(),
      licenseFlag: z.enum(['open', 'restricted_metadata_only', 'unknown_requires_review']).optional(),
      licenseDetails: z.string().optional(),
      languageOriginal: z.enum(['en', 'ar', 'both', 'other']).optional(),
      docType: z.string(),
      sectors: z.array(z.string()).optional(),
      entityIds: z.array(z.number()).optional(),
      geographies: z.array(z.string()).optional(),
      regimeTagApplicability: z.string().optional(),
      importanceScore: z.number().min(0).max(100).optional(),
      summaryEn: z.string().optional(),
      summaryAr: z.string().optional(),
      summaryIsAiGenerated: z.boolean().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      return literatureService.createDocument({
        ...input,
        publishedAt: input.publishedAt ? new Date(input.publishedAt) : undefined,
        createdBy: ctx.user?.id
      });
    }),

  /**
   * Update document status (admin only)
   */
  updateDocumentStatus: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(['draft', 'queued_for_review', 'published', 'archived'])
    }))
    .mutation(async ({ input }) => {
      return literatureService.updateDocumentStatus(input.id, input.status);
    }),

  /**
   * Create document version (admin only)
   */
  createDocumentVersion: adminProcedure
    .input(z.object({
      documentId: z.number(),
      contentHash: z.string(),
      s3OriginalKey: z.string().optional(),
      s3OriginalUrl: z.string().optional(),
      mimeType: z.string().optional(),
      fileSize: z.number().optional(),
      pageCount: z.number().optional(),
      extractionMethod: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      return literatureService.createDocumentVersion(input);
    }),

  /**
   * Update extraction status (admin only)
   */
  updateExtractionStatus: adminProcedure
    .input(z.object({
      versionId: z.number(),
      status: z.enum(['pending', 'ok', 'failed', 'partial']),
      qualityScore: z.number().optional(),
      notes: z.string().optional(),
      extractedTextKey: z.string().optional(),
      extractedTextUrl: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      return literatureService.updateExtractionStatus(
        input.versionId,
        input.status,
        input.qualityScore,
        input.notes,
        input.extractedTextKey,
        input.extractedTextUrl
      );
    }),

  /**
   * Create citation anchor (admin only)
   */
  createCitationAnchor: adminProcedure
    .input(z.object({
      versionId: z.number(),
      anchorType: z.enum(['page_text', 'page_bbox', 'table_cell', 'figure_caption', 'section_header', 'paragraph', 'footnote']),
      pageNumber: z.number().optional(),
      sectionNumber: z.string().optional(),
      bboxX: z.number().optional(),
      bboxY: z.number().optional(),
      bboxWidth: z.number().optional(),
      bboxHeight: z.number().optional(),
      charStart: z.number().optional(),
      charEnd: z.number().optional(),
      snippetText: z.string(),
      snippetTextAr: z.string().optional(),
      confidence: z.enum(['high', 'medium', 'low']).optional(),
      s3PageImageKey: z.string().optional(),
      s3PageImageUrl: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      return citationAnchorService.createCitationAnchor(input);
    }),

  /**
   * Create extracted table (admin only)
   */
  createExtractedTable: adminProcedure
    .input(z.object({
      versionId: z.number(),
      pageNumber: z.number().optional(),
      tableIndex: z.number().optional(),
      titleEn: z.string().optional(),
      titleAr: z.string().optional(),
      schemaGuess: z.array(z.object({
        columnName: z.string(),
        columnNameAr: z.string().optional(),
        dataType: z.enum(['string', 'number', 'date', 'boolean', 'unknown']),
        unit: z.string().optional()
      })).optional(),
      rowCount: z.number().optional(),
      columnCount: z.number().optional(),
      s3TableCsvKey: z.string().optional(),
      s3TableJsonKey: z.string().optional(),
      s3TableImageKey: z.string().optional(),
      extractionMethod: z.enum(['camelot', 'tabula', 'ocr', 'manual', 'api']).optional(),
      extractionQuality: z.enum(['high', 'medium', 'low', 'needs_review']).optional(),
      extractionNotes: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      return citationAnchorService.createExtractedTable(input);
    }),

  /**
   * Update table promotion status (admin only)
   */
  updateTablePromotionStatus: adminProcedure
    .input(z.object({
      tableId: z.number(),
      status: z.enum(['not_promoted', 'pending_review', 'promoted', 'rejected']),
      promotedDatasetId: z.number().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      return citationAnchorService.updateTablePromotionStatus(
        input.tableId,
        input.status,
        input.promotedDatasetId,
        ctx.user?.id
      );
    }),

  /**
   * Get tables pending review (admin only)
   */
  getTablesPendingReview: adminProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20)
    }))
    .query(async ({ input }) => {
      return citationAnchorService.getTablesPendingReview(input.limit);
    }),

  /**
   * Create document-indicator link (admin only)
   */
  createDocumentIndicatorLink: adminProcedure
    .input(z.object({
      documentId: z.number(),
      seriesId: z.number(),
      relationType: z.enum(['source', 'methodology', 'analysis', 'forecast', 'validation', 'contradiction']),
      evidenceAnchorId: z.number().optional(),
      notes: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      return citationAnchorService.createDocumentIndicatorLink(
        input.documentId,
        input.seriesId,
        input.relationType,
        input.evidenceAnchorId,
        input.notes,
        ctx.user?.id
      );
    }),

  /**
   * Create document-event link (admin only)
   */
  createDocumentEventLink: adminProcedure
    .input(z.object({
      documentId: z.number(),
      eventId: z.number(),
      evidenceAnchorId: z.number().optional(),
      notes: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      return citationAnchorService.createDocumentEventLink(
        input.documentId,
        input.eventId,
        input.evidenceAnchorId,
        input.notes,
        ctx.user?.id
      );
    }),

  /**
   * Add glossary term (admin only)
   */
  addGlossaryTerm: adminProcedure
    .input(z.object({
      termEn: z.string(),
      termAr: z.string(),
      definitionEn: z.string().optional(),
      definitionAr: z.string().optional(),
      category: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      return translationService.addGlossaryTerm(
        input.termEn,
        input.termAr,
        input.definitionEn,
        input.definitionAr,
        input.category,
        ctx.user?.id
      );
    }),

  /**
   * Translate text (admin only)
   */
  translateText: adminProcedure
    .input(z.object({
      text: z.string(),
      sourceLang: z.enum(['en', 'ar']),
      targetLang: z.enum(['en', 'ar']),
      sector: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      return translationService.translateText(
        input.text,
        input.sourceLang,
        input.targetLang,
        input.sector
      );
    }),

  /**
   * Get translations needing review (admin only)
   */
  getTranslationsNeedingReview: adminProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20)
    }))
    .query(async ({ input }) => {
      return translationService.getTranslationsNeedingReview(input.limit);
    }),

  /**
   * Update translation status (admin only)
   */
  updateTranslationStatus: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(['pending', 'ok', 'needs_review', 'rejected']),
      reviewNotes: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      return translationService.updateTranslationStatus(
        input.id,
        input.status,
        ctx.user?.id,
        input.reviewNotes
      );
    }),

  /**
   * Get translation statistics (admin only)
   */
  getTranslationStatistics: adminProcedure
    .query(async () => {
      return translationService.getTranslationStatistics();
    }),

  /**
   * Get anchor statistics (admin only)
   */
  getAnchorStatistics: adminProcedure
    .query(async () => {
      return citationAnchorService.getAnchorStatistics();
    }),

  // ============================================================================
  // INGESTION ENDPOINTS (Admin only)
  // ============================================================================

  /**
   * Get ingestion sources
   */
  getIngestionSources: adminProcedure
    .query(async () => {
      return literatureIngestionService.getIngestionSources();
    }),

  /**
   * Run World Bank ingestion
   */
  ingestWorldBank: adminProcedure
    .input(z.object({
      query: z.string().optional(),
      fromDate: z.string().optional(),
      toDate: z.string().optional(),
      limit: z.number().min(1).max(100).default(50)
    }))
    .mutation(async ({ input, ctx }) => {
      return literatureIngestionService.ingestWorldBankDocuments({
        ...input,
        triggeredBy: ctx.user?.id
      });
    }),

  /**
   * Run ReliefWeb ingestion
   */
  ingestReliefWeb: adminProcedure
    .input(z.object({
      query: z.string().optional(),
      fromDate: z.string().optional(),
      toDate: z.string().optional(),
      limit: z.number().min(1).max(100).default(50)
    }))
    .mutation(async ({ input, ctx }) => {
      return literatureIngestionService.ingestReliefWebDocuments({
        ...input,
        triggeredBy: ctx.user?.id
      });
    }),

  /**
   * Run all ingestion sources
   */
  runAllIngestion: adminProcedure
    .input(z.object({
      fromDate: z.string().optional(),
      limit: z.number().min(1).max(100).default(50)
    }))
    .mutation(async ({ input, ctx }) => {
      return literatureIngestionService.runAllIngestion({
        ...input,
        triggeredBy: ctx.user?.id
      });
    }),

  /**
   * Get recent ingestion runs
   */
  getRecentIngestionRuns: adminProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20)
    }))
    .query(async ({ input }) => {
      return literatureIngestionService.getRecentIngestionRuns(input.limit);
    }),

  /**
   * Get ingestion statistics
   */
  getIngestionStatistics: adminProcedure
    .query(async () => {
      return literatureIngestionService.getIngestionStatistics();
    })
});
