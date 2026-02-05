/**
 * Literature Service - Core service for document management
 * Handles document CRUD, versioning, deduplication, and metadata management
 */

import { getDb } from '../db';
import { sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// Types
export interface LibraryDocumentInput {
  titleEn: string;
  titleAr?: string;
  publisherName: string;
  publisherEntityId?: number;
  sourceId?: number;
  canonicalUrl?: string;
  publishedAt?: Date;
  licenseFlag?: 'open' | 'restricted_metadata_only' | 'unknown_requires_review';
  licenseDetails?: string;
  languageOriginal?: 'en' | 'ar' | 'both' | 'other';
  docType: string;
  sectors?: string[];
  entityIds?: number[];
  geographies?: string[];
  regimeTagApplicability?: string;
  importanceScore?: number;
  summaryEn?: string;
  summaryAr?: string;
  summaryIsAiGenerated?: boolean;
  metadata?: Record<string, unknown>;
  createdBy?: number;
}

export interface DocumentVersionInput {
  documentId: number;
  contentHash: string;
  s3OriginalKey?: string;
  s3OriginalUrl?: string;
  mimeType?: string;
  fileSize?: number;
  pageCount?: number;
  extractionMethod?: string;
}

export interface LibraryDocument {
  id: number;
  docId: string;
  titleEn: string;
  titleAr?: string;
  publisherName: string;
  publisherEntityId?: number;
  sourceId?: number;
  canonicalUrl?: string;
  publishedAt?: Date;
  retrievedAt: Date;
  licenseFlag: string;
  licenseDetails?: string;
  languageOriginal: string;
  docType: string;
  sectors: string[];
  entityIds: number[];
  geographies: string[];
  regimeTagApplicability?: string;
  currentVersionId?: number;
  status: string;
  importanceScore: number;
  summaryEn?: string;
  summaryAr?: string;
  summaryIsAiGenerated: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: number;
}

export interface DocumentVersion {
  id: number;
  documentId: number;
  versionNumber: number;
  contentHash: string;
  s3OriginalKey?: string;
  s3OriginalUrl?: string;
  mimeType?: string;
  fileSize?: number;
  pageCount?: number;
  extractionStatus: string;
  extractionMethod?: string;
  extractionQualityScore?: number;
  extractionNotes?: string;
  extractedTextKey?: string;
  extractedTextUrl?: string;
  translationStatus: string;
  indexStatus: string;
  vectorEmbeddingKey?: string;
  createdAt: Date;
  processedAt?: Date;
}

export interface SearchFilters {
  sectors?: string[];
  years?: number[];
  publishers?: string[];
  docTypes?: string[];
  languages?: string[];
  licenseFlags?: string[];
  status?: string[];
  regimeTags?: string[];
  query?: string;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  documents: LibraryDocument[];
  total: number;
  hasMore: boolean;
}

/**
 * Generate content hash for deduplication
 */
export function generateContentHash(content: Buffer | string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Create a new library document
 */
export async function createDocument(input: LibraryDocumentInput): Promise<LibraryDocument | null> {
  const db = await getDb();
  if (!db) return null;

  const docId = `doc_${uuidv4().replace(/-/g, '').substring(0, 16)}`;
  
  try {
    const result = await db.execute(sql`
      INSERT INTO library_documents (
        docId, titleEn, titleAr, publisherName, publisherEntityId, sourceId,
        canonicalUrl, publishedAt, retrievedAt, licenseFlag, licenseDetails,
        languageOriginal, docType, sectors, entityIds, geographies,
        regimeTagApplicability, status, importanceScore, summaryEn, summaryAr,
        summaryIsAiGenerated, metadata, createdBy
      ) VALUES (
        ${docId}, ${input.titleEn}, ${input.titleAr || null}, ${input.publisherName},
        ${input.publisherEntityId || null}, ${input.sourceId || null},
        ${input.canonicalUrl || null}, ${input.publishedAt || null}, NOW(),
        ${input.licenseFlag || 'unknown_requires_review'}, ${input.licenseDetails || null},
        ${input.languageOriginal || 'en'}, ${input.docType},
        ${JSON.stringify(input.sectors || [])}, ${JSON.stringify(input.entityIds || [])},
        ${JSON.stringify(input.geographies || [])}, ${input.regimeTagApplicability || 'unknown'},
        'draft', ${input.importanceScore || 50}, ${input.summaryEn || null},
        ${input.summaryAr || null}, ${input.summaryIsAiGenerated || false},
        ${JSON.stringify(input.metadata || {})}, ${input.createdBy || null}
      )
    `);

    const insertId = (result as any)[0]?.insertId;
    if (insertId) {
      return getDocumentById(insertId);
    }
    return null;
  } catch (error) {
    console.error('[LiteratureService] Failed to create document:', error);
    return null;
  }
}

/**
 * Get document by ID with signed URL for access
 */
export async function getDocumentById(id: number, options?: {
  includeSignedUrl?: boolean;
  userId?: number;
  userTier?: string;
}): Promise<LibraryDocument | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.execute(sql`
      SELECT * FROM library_documents WHERE id = ${id}
    `);

    const rows = (result as any)[0] || [];
    if (rows.length === 0) return null;

    const doc = mapRowToDocument(rows[0]);

    // Add signed URL if requested
    if (options?.includeSignedUrl) {
      const { generateDocumentSignedUrl } = await import('./s3SignedUrlService');
      const signedUrlResult = await generateDocumentSignedUrl({
        documentId: id,
        userId: options.userId,
        userSubscriptionTier: options.userTier as any,
        purpose: 'view'
      });

      if ('url' in signedUrlResult) {
        (doc as any).signedUrl = signedUrlResult.url;
        (doc as any).licenseNotice = signedUrlResult.licenseNotice;
        (doc as any).canDownload = signedUrlResult.canDownload;
      }
    }

    return doc;
  } catch (error) {
    console.error('[LiteratureService] Failed to get document:', error);
    return null;
  }
}

/**
 * Get document by docId
 */
export async function getDocumentByDocId(docId: string): Promise<LibraryDocument | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.execute(sql`
      SELECT * FROM library_documents WHERE docId = ${docId}
    `);

    const rows = (result as any)[0] || [];
    if (rows.length === 0) return null;

    return mapRowToDocument(rows[0]);
  } catch (error) {
    console.error('[LiteratureService] Failed to get document by docId:', error);
    return null;
  }
}

/**
 * Check for duplicate document by URL and content hash
 */
export async function checkDuplicate(
  canonicalUrl?: string,
  contentHash?: string,
  titleEn?: string,
  publisherName?: string,
  publishedAt?: Date
): Promise<LibraryDocument | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    // Check by canonical URL first
    if (canonicalUrl) {
      const urlResult = await db.execute(sql`
        SELECT * FROM library_documents WHERE canonicalUrl = ${canonicalUrl} LIMIT 1
      `);
      const urlRows = (urlResult as any)[0] || [];
      if (urlRows.length > 0) {
        return mapRowToDocument(urlRows[0]);
      }
    }

    // Check by content hash
    if (contentHash) {
      const hashResult = await db.execute(sql`
        SELECT ld.* FROM library_documents ld
        JOIN document_versions dv ON ld.currentVersionId = dv.id
        WHERE dv.contentHash = ${contentHash} LIMIT 1
      `);
      const hashRows = (hashResult as any)[0] || [];
      if (hashRows.length > 0) {
        return mapRowToDocument(hashRows[0]);
      }
    }

    // Check by title + publisher + date (fuzzy match)
    if (titleEn && publisherName) {
      const fuzzyResult = await db.execute(sql`
        SELECT * FROM library_documents 
        WHERE titleEn = ${titleEn} 
        AND publisherName = ${publisherName}
        ${publishedAt ? sql`AND DATE(publishedAt) = DATE(${publishedAt})` : sql``}
        LIMIT 1
      `);
      const fuzzyRows = (fuzzyResult as any)[0] || [];
      if (fuzzyRows.length > 0) {
        return mapRowToDocument(fuzzyRows[0]);
      }
    }

    return null;
  } catch (error) {
    console.error('[LiteratureService] Failed to check duplicate:', error);
    return null;
  }
}

/**
 * Create a new document version
 */
export async function createDocumentVersion(input: DocumentVersionInput): Promise<DocumentVersion | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    // Get current max version number
    const versionResult = await db.execute(sql`
      SELECT MAX(versionNumber) as maxVersion FROM document_versions WHERE documentId = ${input.documentId}
    `);
    const maxVersion = (versionResult as any)[0]?.[0]?.maxVersion || 0;
    const newVersionNumber = maxVersion + 1;

    const result = await db.execute(sql`
      INSERT INTO document_versions (
        documentId, versionNumber, contentHash, s3OriginalKey, s3OriginalUrl,
        mimeType, fileSize, pageCount, extractionStatus, extractionMethod,
        translationStatus, indexStatus
      ) VALUES (
        ${input.documentId}, ${newVersionNumber}, ${input.contentHash},
        ${input.s3OriginalKey || null}, ${input.s3OriginalUrl || null},
        ${input.mimeType || null}, ${input.fileSize || null}, ${input.pageCount || null},
        'pending', ${input.extractionMethod || null}, 'pending', 'pending'
      )
    `);

    const insertId = (result as any)[0]?.insertId;
    if (insertId) {
      // Update document's current version
      await db.execute(sql`
        UPDATE library_documents SET currentVersionId = ${insertId} WHERE id = ${input.documentId}
      `);
      
      return getDocumentVersionById(insertId);
    }
    return null;
  } catch (error) {
    console.error('[LiteratureService] Failed to create document version:', error);
    return null;
  }
}

/**
 * Get document version by ID
 */
export async function getDocumentVersionById(id: number): Promise<DocumentVersion | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.execute(sql`
      SELECT * FROM document_versions WHERE id = ${id}
    `);

    const rows = (result as any)[0] || [];
    if (rows.length === 0) return null;

    return mapRowToVersion(rows[0]);
  } catch (error) {
    console.error('[LiteratureService] Failed to get document version:', error);
    return null;
  }
}

/**
 * Get all versions of a document
 */
export async function getDocumentVersions(documentId: number): Promise<DocumentVersion[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db.execute(sql`
      SELECT * FROM document_versions WHERE documentId = ${documentId} ORDER BY versionNumber DESC
    `);

    const rows = (result as any)[0] || [];
    return rows.map(mapRowToVersion);
  } catch (error) {
    console.error('[LiteratureService] Failed to get document versions:', error);
    return [];
  }
}

/**
 * Update document status
 */
export async function updateDocumentStatus(
  id: number,
  status: 'draft' | 'queued_for_review' | 'published' | 'archived'
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.execute(sql`
      UPDATE library_documents SET status = ${status}, updatedAt = NOW() WHERE id = ${id}
    `);
    return true;
  } catch (error) {
    console.error('[LiteratureService] Failed to update document status:', error);
    return false;
  }
}

/**
 * Update version extraction status
 */
export async function updateExtractionStatus(
  versionId: number,
  status: 'pending' | 'ok' | 'failed' | 'partial',
  qualityScore?: number,
  notes?: string,
  extractedTextKey?: string,
  extractedTextUrl?: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.execute(sql`
      UPDATE document_versions SET 
        extractionStatus = ${status},
        extractionQualityScore = ${qualityScore || null},
        extractionNotes = ${notes || null},
        extractedTextKey = ${extractedTextKey || null},
        extractedTextUrl = ${extractedTextUrl || null},
        processedAt = NOW()
      WHERE id = ${versionId}
    `);
    return true;
  } catch (error) {
    console.error('[LiteratureService] Failed to update extraction status:', error);
    return false;
  }
}

/**
 * Update version translation status
 */
export async function updateTranslationStatus(
  versionId: number,
  status: 'pending' | 'en_done' | 'ar_done' | 'both_done' | 'needs_review'
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.execute(sql`
      UPDATE document_versions SET translationStatus = ${status} WHERE id = ${versionId}
    `);
    return true;
  } catch (error) {
    console.error('[LiteratureService] Failed to update translation status:', error);
    return false;
  }
}

/**
 * Update version index status
 */
export async function updateIndexStatus(
  versionId: number,
  status: 'pending' | 'keyword_indexed' | 'vector_indexed' | 'both_indexed' | 'failed',
  vectorEmbeddingKey?: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.execute(sql`
      UPDATE document_versions SET 
        indexStatus = ${status},
        vectorEmbeddingKey = ${vectorEmbeddingKey || null}
      WHERE id = ${versionId}
    `);
    return true;
  } catch (error) {
    console.error('[LiteratureService] Failed to update index status:', error);
    return false;
  }
}

/**
 * Search documents with filters
 */
export async function searchDocuments(filters: SearchFilters): Promise<SearchResult> {
  const db = await getDb();
  if (!db) return { documents: [], total: 0, hasMore: false };

  const limit = filters.limit || 20;
  const offset = filters.offset || 0;

  try {
    // Build WHERE clauses
    let whereConditions: string[] = [];
    
    if (filters.status && filters.status.length > 0) {
      whereConditions.push(`status IN (${filters.status.map(s => `'${s}'`).join(',')})`);
    } else {
      whereConditions.push(`status = 'published'`);
    }

    if (filters.docTypes && filters.docTypes.length > 0) {
      whereConditions.push(`docType IN (${filters.docTypes.map(t => `'${t}'`).join(',')})`);
    }

    if (filters.languages && filters.languages.length > 0) {
      whereConditions.push(`languageOriginal IN (${filters.languages.map(l => `'${l}'`).join(',')})`);
    }

    if (filters.licenseFlags && filters.licenseFlags.length > 0) {
      whereConditions.push(`licenseFlag IN (${filters.licenseFlags.map(l => `'${l}'`).join(',')})`);
    }

    if (filters.regimeTags && filters.regimeTags.length > 0) {
      whereConditions.push(`regimeTagApplicability IN (${filters.regimeTags.map(r => `'${r}'`).join(',')})`);
    }

    if (filters.years && filters.years.length > 0) {
      whereConditions.push(`YEAR(publishedAt) IN (${filters.years.join(',')})`);
    }

    if (filters.publishers && filters.publishers.length > 0) {
      const publisherConditions = filters.publishers.map(p => `publisherName LIKE '%${p}%'`).join(' OR ');
      whereConditions.push(`(${publisherConditions})`);
    }

    if (filters.query) {
      whereConditions.push(`(titleEn LIKE '%${filters.query}%' OR titleAr LIKE '%${filters.query}%' OR summaryEn LIKE '%${filters.query}%')`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await db.execute(sql.raw(`
      SELECT COUNT(*) as total FROM library_documents ${whereClause}
    `));
    const total = (countResult as any)[0]?.[0]?.total || 0;

    // Get documents
    const docsResult = await db.execute(sql.raw(`
      SELECT * FROM library_documents ${whereClause}
      ORDER BY publishedAt DESC, importanceScore DESC
      LIMIT ${limit} OFFSET ${offset}
    `));

    const rows = (docsResult as any)[0] || [];
    const documents = rows.map(mapRowToDocument);

    return {
      documents,
      total,
      hasMore: offset + documents.length < total
    };
  } catch (error) {
    console.error('[LiteratureService] Failed to search documents:', error);
    return { documents: [], total: 0, hasMore: false };
  }
}

/**
 * Get documents by sector
 */
export async function getDocumentsBySector(sectorCode: string, limit: number = 10): Promise<LibraryDocument[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db.execute(sql`
      SELECT * FROM library_documents 
      WHERE JSON_CONTAINS(sectors, ${JSON.stringify(sectorCode)}) AND status = 'published'
      ORDER BY publishedAt DESC, importanceScore DESC
      LIMIT ${limit}
    `);

    const rows = (result as any)[0] || [];
    return rows.map(mapRowToDocument);
  } catch (error) {
    console.error('[LiteratureService] Failed to get documents by sector:', error);
    return [];
  }
}

/**
 * Get documents by entity
 */
export async function getDocumentsByEntity(entityId: number, limit: number = 10): Promise<LibraryDocument[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db.execute(sql`
      SELECT * FROM library_documents 
      WHERE (JSON_CONTAINS(entityIds, ${JSON.stringify(entityId)}) OR publisherEntityId = ${entityId})
      AND status = 'published'
      ORDER BY publishedAt DESC, importanceScore DESC
      LIMIT ${limit}
    `);

    const rows = (result as any)[0] || [];
    return rows.map(mapRowToDocument);
  } catch (error) {
    console.error('[LiteratureService] Failed to get documents by entity:', error);
    return [];
  }
}

/**
 * Get recent documents
 */
export async function getRecentDocuments(limit: number = 10): Promise<LibraryDocument[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db.execute(sql`
      SELECT * FROM library_documents 
      WHERE status = 'published'
      ORDER BY retrievedAt DESC
      LIMIT ${limit}
    `);

    const rows = (result as any)[0] || [];
    return rows.map(mapRowToDocument);
  } catch (error) {
    console.error('[LiteratureService] Failed to get recent documents:', error);
    return [];
  }
}

/**
 * Get document statistics
 */
export async function getDocumentStatistics(): Promise<{
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byLicense: Record<string, number>;
  byYear: Record<number, number>;
}> {
  const db = await getDb();
  if (!db) return { total: 0, byStatus: {}, byType: {}, byLicense: {}, byYear: {} };

  try {
    // Total count
    const totalResult = await db.execute(sql`SELECT COUNT(*) as total FROM library_documents`);
    const total = (totalResult as any)[0]?.[0]?.total || 0;

    // By status
    const statusResult = await db.execute(sql`
      SELECT status, COUNT(*) as count FROM library_documents GROUP BY status
    `);
    const byStatus: Record<string, number> = {};
    for (const row of (statusResult as any)[0] || []) {
      byStatus[row.status] = row.count;
    }

    // By type
    const typeResult = await db.execute(sql`
      SELECT docType, COUNT(*) as count FROM library_documents GROUP BY docType
    `);
    const byType: Record<string, number> = {};
    for (const row of (typeResult as any)[0] || []) {
      byType[row.docType] = row.count;
    }

    // By license
    const licenseResult = await db.execute(sql`
      SELECT licenseFlag, COUNT(*) as count FROM library_documents GROUP BY licenseFlag
    `);
    const byLicense: Record<string, number> = {};
    for (const row of (licenseResult as any)[0] || []) {
      byLicense[row.licenseFlag] = row.count;
    }

    // By year
    const yearResult = await db.execute(sql`
      SELECT YEAR(publishedAt) as year, COUNT(*) as count FROM library_documents 
      WHERE publishedAt IS NOT NULL GROUP BY YEAR(publishedAt) ORDER BY year DESC
    `);
    const byYear: Record<number, number> = {};
    for (const row of (yearResult as any)[0] || []) {
      if (row.year) byYear[row.year] = row.count;
    }

    return { total, byStatus, byType, byLicense, byYear };
  } catch (error) {
    console.error('[LiteratureService] Failed to get document statistics:', error);
    return { total: 0, byStatus: {}, byType: {}, byLicense: {}, byYear: {} };
  }
}

// Helper functions
function mapRowToDocument(row: any): LibraryDocument {
  return {
    id: row.id,
    docId: row.docId,
    titleEn: row.titleEn,
    titleAr: row.titleAr,
    publisherName: row.publisherName,
    publisherEntityId: row.publisherEntityId,
    sourceId: row.sourceId,
    canonicalUrl: row.canonicalUrl,
    publishedAt: row.publishedAt ? new Date(row.publishedAt) : undefined,
    retrievedAt: new Date(row.retrievedAt),
    licenseFlag: row.licenseFlag,
    licenseDetails: row.licenseDetails,
    languageOriginal: row.languageOriginal,
    docType: row.docType,
    sectors: typeof row.sectors === 'string' ? JSON.parse(row.sectors) : (row.sectors || []),
    entityIds: typeof row.entityIds === 'string' ? JSON.parse(row.entityIds) : (row.entityIds || []),
    geographies: typeof row.geographies === 'string' ? JSON.parse(row.geographies) : (row.geographies || []),
    regimeTagApplicability: row.regimeTagApplicability,
    currentVersionId: row.currentVersionId,
    status: row.status,
    importanceScore: row.importanceScore || 50,
    summaryEn: row.summaryEn,
    summaryAr: row.summaryAr,
    summaryIsAiGenerated: row.summaryIsAiGenerated || false,
    metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : (row.metadata || {}),
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
    createdBy: row.createdBy
  };
}

function mapRowToVersion(row: any): DocumentVersion {
  return {
    id: row.id,
    documentId: row.documentId,
    versionNumber: row.versionNumber,
    contentHash: row.contentHash,
    s3OriginalKey: row.s3OriginalKey,
    s3OriginalUrl: row.s3OriginalUrl,
    mimeType: row.mimeType,
    fileSize: row.fileSize,
    pageCount: row.pageCount,
    extractionStatus: row.extractionStatus,
    extractionMethod: row.extractionMethod,
    extractionQualityScore: row.extractionQualityScore,
    extractionNotes: row.extractionNotes,
    extractedTextKey: row.extractedTextKey,
    extractedTextUrl: row.extractedTextUrl,
    translationStatus: row.translationStatus,
    indexStatus: row.indexStatus,
    vectorEmbeddingKey: row.vectorEmbeddingKey,
    createdAt: new Date(row.createdAt),
    processedAt: row.processedAt ? new Date(row.processedAt) : undefined
  };
}
