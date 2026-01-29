/**
 * Citation Anchor Service
 * Handles creation and management of citation anchors for documents
 */

import { getDb } from '../db';
import { sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// Types
export interface CitationAnchorInput {
  versionId: number;
  anchorType: 'page_text' | 'page_bbox' | 'table_cell' | 'figure_caption' | 'section_header' | 'paragraph' | 'footnote';
  pageNumber?: number;
  sectionNumber?: string;
  bboxX?: number;
  bboxY?: number;
  bboxWidth?: number;
  bboxHeight?: number;
  charStart?: number;
  charEnd?: number;
  snippetText: string;
  snippetTextAr?: string;
  confidence?: 'high' | 'medium' | 'low';
  s3PageImageKey?: string;
  s3PageImageUrl?: string;
}

export interface CitationAnchor {
  id: number;
  anchorId: string;
  versionId: number;
  anchorType: string;
  pageNumber?: number;
  sectionNumber?: string;
  bboxX?: number;
  bboxY?: number;
  bboxWidth?: number;
  bboxHeight?: number;
  charStart?: number;
  charEnd?: number;
  snippetText: string;
  snippetTextAr?: string;
  snippetHash: string;
  confidence: string;
  s3PageImageKey?: string;
  s3PageImageUrl?: string;
  createdAt: Date;
}

export interface ExtractedTableInput {
  versionId: number;
  pageNumber?: number;
  tableIndex?: number;
  titleEn?: string;
  titleAr?: string;
  schemaGuess?: Array<{
    columnName: string;
    columnNameAr?: string;
    dataType: 'string' | 'number' | 'date' | 'boolean' | 'unknown';
    unit?: string;
  }>;
  rowCount?: number;
  columnCount?: number;
  s3TableCsvKey?: string;
  s3TableJsonKey?: string;
  s3TableImageKey?: string;
  extractionMethod?: 'camelot' | 'tabula' | 'ocr' | 'manual' | 'api';
  extractionQuality?: 'high' | 'medium' | 'low' | 'needs_review';
  extractionNotes?: string;
}

export interface ExtractedTable {
  id: number;
  tableId: string;
  versionId: number;
  pageNumber?: number;
  tableIndex: number;
  titleEn?: string;
  titleAr?: string;
  schemaGuess?: Array<{
    columnName: string;
    columnNameAr?: string;
    dataType: string;
    unit?: string;
  }>;
  rowCount?: number;
  columnCount?: number;
  s3TableCsvKey?: string;
  s3TableJsonKey?: string;
  s3TableImageKey?: string;
  extractionMethod: string;
  extractionQuality: string;
  extractionNotes?: string;
  promotionStatus: string;
  promotedDatasetId?: number;
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: number;
}

/**
 * Generate snippet hash for integrity
 */
export function generateSnippetHash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex').substring(0, 64);
}

/**
 * Create a citation anchor
 */
export async function createCitationAnchor(input: CitationAnchorInput): Promise<CitationAnchor | null> {
  const db = await getDb();
  if (!db) return null;

  const anchorId = `anchor_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
  const snippetHash = generateSnippetHash(input.snippetText);

  try {
    const result = await db.execute(sql`
      INSERT INTO citation_anchors (
        anchorId, versionId, anchorType, pageNumber, sectionNumber,
        bboxX, bboxY, bboxWidth, bboxHeight, charStart, charEnd,
        snippetText, snippetTextAr, snippetHash, confidence,
        s3PageImageKey, s3PageImageUrl
      ) VALUES (
        ${anchorId}, ${input.versionId}, ${input.anchorType},
        ${input.pageNumber || null}, ${input.sectionNumber || null},
        ${input.bboxX || null}, ${input.bboxY || null},
        ${input.bboxWidth || null}, ${input.bboxHeight || null},
        ${input.charStart || null}, ${input.charEnd || null},
        ${input.snippetText}, ${input.snippetTextAr || null},
        ${snippetHash}, ${input.confidence || 'medium'},
        ${input.s3PageImageKey || null}, ${input.s3PageImageUrl || null}
      )
    `);

    const insertId = (result as any)[0]?.insertId;
    if (insertId) {
      return getAnchorById(insertId);
    }
    return null;
  } catch (error) {
    console.error('[CitationAnchorService] Failed to create anchor:', error);
    return null;
  }
}

/**
 * Get anchor by ID
 */
export async function getAnchorById(id: number): Promise<CitationAnchor | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.execute(sql`
      SELECT * FROM citation_anchors WHERE id = ${id}
    `);

    const rows = (result as any)[0] || [];
    if (rows.length === 0) return null;

    return mapRowToAnchor(rows[0]);
  } catch (error) {
    console.error('[CitationAnchorService] Failed to get anchor:', error);
    return null;
  }
}

/**
 * Get anchor by anchorId
 */
export async function getAnchorByAnchorId(anchorId: string): Promise<CitationAnchor | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.execute(sql`
      SELECT * FROM citation_anchors WHERE anchorId = ${anchorId}
    `);

    const rows = (result as any)[0] || [];
    if (rows.length === 0) return null;

    return mapRowToAnchor(rows[0]);
  } catch (error) {
    console.error('[CitationAnchorService] Failed to get anchor by anchorId:', error);
    return null;
  }
}

/**
 * Get all anchors for a document version
 */
export async function getAnchorsForVersion(versionId: number): Promise<CitationAnchor[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db.execute(sql`
      SELECT * FROM citation_anchors WHERE versionId = ${versionId}
      ORDER BY pageNumber ASC, charStart ASC
    `);

    const rows = (result as any)[0] || [];
    return rows.map(mapRowToAnchor);
  } catch (error) {
    console.error('[CitationAnchorService] Failed to get anchors for version:', error);
    return [];
  }
}

/**
 * Get anchors by page number
 */
export async function getAnchorsByPage(versionId: number, pageNumber: number): Promise<CitationAnchor[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db.execute(sql`
      SELECT * FROM citation_anchors 
      WHERE versionId = ${versionId} AND pageNumber = ${pageNumber}
      ORDER BY charStart ASC
    `);

    const rows = (result as any)[0] || [];
    return rows.map(mapRowToAnchor);
  } catch (error) {
    console.error('[CitationAnchorService] Failed to get anchors by page:', error);
    return [];
  }
}

/**
 * Search anchors by text
 */
export async function searchAnchors(
  query: string,
  limit: number = 20
): Promise<CitationAnchor[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db.execute(sql`
      SELECT * FROM citation_anchors 
      WHERE snippetText LIKE ${`%${query}%`} OR snippetTextAr LIKE ${`%${query}%`}
      ORDER BY createdAt DESC
      LIMIT ${limit}
    `);

    const rows = (result as any)[0] || [];
    return rows.map(mapRowToAnchor);
  } catch (error) {
    console.error('[CitationAnchorService] Failed to search anchors:', error);
    return [];
  }
}

/**
 * Create an extracted table record
 */
export async function createExtractedTable(input: ExtractedTableInput): Promise<ExtractedTable | null> {
  const db = await getDb();
  if (!db) return null;

  const tableId = `table_${uuidv4().replace(/-/g, '').substring(0, 12)}`;

  try {
    const result = await db.execute(sql`
      INSERT INTO extracted_tables (
        tableId, versionId, pageNumber, tableIndex, titleEn, titleAr,
        schemaGuess, rowCount, columnCount, s3TableCsvKey, s3TableJsonKey,
        s3TableImageKey, extractionMethod, extractionQuality, extractionNotes,
        promotionStatus
      ) VALUES (
        ${tableId}, ${input.versionId}, ${input.pageNumber || null},
        ${input.tableIndex || 0}, ${input.titleEn || null}, ${input.titleAr || null},
        ${JSON.stringify(input.schemaGuess || [])}, ${input.rowCount || null},
        ${input.columnCount || null}, ${input.s3TableCsvKey || null},
        ${input.s3TableJsonKey || null}, ${input.s3TableImageKey || null},
        ${input.extractionMethod || 'manual'}, ${input.extractionQuality || 'needs_review'},
        ${input.extractionNotes || null}, 'not_promoted'
      )
    `);

    const insertId = (result as any)[0]?.insertId;
    if (insertId) {
      return getTableById(insertId);
    }
    return null;
  } catch (error) {
    console.error('[CitationAnchorService] Failed to create extracted table:', error);
    return null;
  }
}

/**
 * Get extracted table by ID
 */
export async function getTableById(id: number): Promise<ExtractedTable | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.execute(sql`
      SELECT * FROM extracted_tables WHERE id = ${id}
    `);

    const rows = (result as any)[0] || [];
    if (rows.length === 0) return null;

    return mapRowToTable(rows[0]);
  } catch (error) {
    console.error('[CitationAnchorService] Failed to get table:', error);
    return null;
  }
}

/**
 * Get all tables for a document version
 */
export async function getTablesForVersion(versionId: number): Promise<ExtractedTable[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db.execute(sql`
      SELECT * FROM extracted_tables WHERE versionId = ${versionId}
      ORDER BY pageNumber ASC, tableIndex ASC
    `);

    const rows = (result as any)[0] || [];
    return rows.map(mapRowToTable);
  } catch (error) {
    console.error('[CitationAnchorService] Failed to get tables for version:', error);
    return [];
  }
}

/**
 * Get tables pending review
 */
export async function getTablesPendingReview(limit: number = 20): Promise<ExtractedTable[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db.execute(sql`
      SELECT * FROM extracted_tables 
      WHERE extractionQuality = 'needs_review' OR promotionStatus = 'pending_review'
      ORDER BY createdAt DESC
      LIMIT ${limit}
    `);

    const rows = (result as any)[0] || [];
    return rows.map(mapRowToTable);
  } catch (error) {
    console.error('[CitationAnchorService] Failed to get tables pending review:', error);
    return [];
  }
}

/**
 * Update table promotion status
 */
export async function updateTablePromotionStatus(
  tableId: number,
  status: 'not_promoted' | 'pending_review' | 'promoted' | 'rejected',
  promotedDatasetId?: number,
  reviewedBy?: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.execute(sql`
      UPDATE extracted_tables SET
        promotionStatus = ${status},
        promotedDatasetId = ${promotedDatasetId || null},
        reviewedAt = NOW(),
        reviewedBy = ${reviewedBy || null}
      WHERE id = ${tableId}
    `);
    return true;
  } catch (error) {
    console.error('[CitationAnchorService] Failed to update table promotion status:', error);
    return false;
  }
}

/**
 * Create document-indicator link
 */
export async function createDocumentIndicatorLink(
  documentId: number,
  seriesId: number,
  relationType: 'source' | 'methodology' | 'analysis' | 'forecast' | 'validation' | 'contradiction',
  evidenceAnchorId?: number,
  notes?: string,
  createdBy?: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.execute(sql`
      INSERT INTO document_indicator_links (
        documentId, seriesId, relationType, evidenceAnchorId, notes, createdBy
      ) VALUES (
        ${documentId}, ${seriesId}, ${relationType},
        ${evidenceAnchorId || null}, ${notes || null}, ${createdBy || null}
      )
    `);
    return true;
  } catch (error) {
    console.error('[CitationAnchorService] Failed to create document-indicator link:', error);
    return false;
  }
}

/**
 * Create document-event link
 */
export async function createDocumentEventLink(
  documentId: number,
  eventId: number,
  evidenceAnchorId?: number,
  notes?: string,
  createdBy?: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.execute(sql`
      INSERT INTO document_event_links (
        documentId, eventId, evidenceAnchorId, notes, createdBy
      ) VALUES (
        ${documentId}, ${eventId}, ${evidenceAnchorId || null},
        ${notes || null}, ${createdBy || null}
      )
    `);
    return true;
  } catch (error) {
    console.error('[CitationAnchorService] Failed to create document-event link:', error);
    return false;
  }
}

/**
 * Get document links for an indicator
 */
export async function getDocumentLinksForIndicator(seriesId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db.execute(sql`
      SELECT dil.*, ld.titleEn, ld.titleAr, ld.publisherName, ld.publishedAt
      FROM document_indicator_links dil
      JOIN library_documents ld ON dil.documentId = ld.id
      WHERE dil.seriesId = ${seriesId}
      ORDER BY ld.publishedAt DESC
    `);

    return (result as any)[0] || [];
  } catch (error) {
    console.error('[CitationAnchorService] Failed to get document links for indicator:', error);
    return [];
  }
}

/**
 * Get document links for an event
 */
export async function getDocumentLinksForEvent(eventId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db.execute(sql`
      SELECT del.*, ld.titleEn, ld.titleAr, ld.publisherName, ld.publishedAt
      FROM document_event_links del
      JOIN library_documents ld ON del.documentId = ld.id
      WHERE del.eventId = ${eventId}
      ORDER BY ld.publishedAt DESC
    `);

    return (result as any)[0] || [];
  } catch (error) {
    console.error('[CitationAnchorService] Failed to get document links for event:', error);
    return [];
  }
}

/**
 * Get anchor statistics
 */
export async function getAnchorStatistics(): Promise<{
  totalAnchors: number;
  byType: Record<string, number>;
  byConfidence: Record<string, number>;
  totalTables: number;
  tablesByStatus: Record<string, number>;
}> {
  const db = await getDb();
  if (!db) return { totalAnchors: 0, byType: {}, byConfidence: {}, totalTables: 0, tablesByStatus: {} };

  try {
    // Anchor stats
    const anchorResult = await db.execute(sql`
      SELECT 
        COUNT(*) as total,
        anchorType,
        confidence
      FROM citation_anchors
      GROUP BY anchorType, confidence
    `);

    let totalAnchors = 0;
    const byType: Record<string, number> = {};
    const byConfidence: Record<string, number> = {};

    for (const row of (anchorResult as any)[0] || []) {
      totalAnchors += row.total;
      byType[row.anchorType] = (byType[row.anchorType] || 0) + row.total;
      byConfidence[row.confidence] = (byConfidence[row.confidence] || 0) + row.total;
    }

    // Table stats
    const tableResult = await db.execute(sql`
      SELECT promotionStatus, COUNT(*) as count
      FROM extracted_tables
      GROUP BY promotionStatus
    `);

    let totalTables = 0;
    const tablesByStatus: Record<string, number> = {};

    for (const row of (tableResult as any)[0] || []) {
      totalTables += row.count;
      tablesByStatus[row.promotionStatus] = row.count;
    }

    return { totalAnchors, byType, byConfidence, totalTables, tablesByStatus };
  } catch (error) {
    console.error('[CitationAnchorService] Failed to get anchor statistics:', error);
    return { totalAnchors: 0, byType: {}, byConfidence: {}, totalTables: 0, tablesByStatus: {} };
  }
}

// Helper functions
function mapRowToAnchor(row: any): CitationAnchor {
  return {
    id: row.id,
    anchorId: row.anchorId,
    versionId: row.versionId,
    anchorType: row.anchorType,
    pageNumber: row.pageNumber,
    sectionNumber: row.sectionNumber,
    bboxX: row.bboxX ? parseFloat(row.bboxX) : undefined,
    bboxY: row.bboxY ? parseFloat(row.bboxY) : undefined,
    bboxWidth: row.bboxWidth ? parseFloat(row.bboxWidth) : undefined,
    bboxHeight: row.bboxHeight ? parseFloat(row.bboxHeight) : undefined,
    charStart: row.charStart,
    charEnd: row.charEnd,
    snippetText: row.snippetText,
    snippetTextAr: row.snippetTextAr,
    snippetHash: row.snippetHash,
    confidence: row.confidence,
    s3PageImageKey: row.s3PageImageKey,
    s3PageImageUrl: row.s3PageImageUrl,
    createdAt: new Date(row.createdAt)
  };
}

function mapRowToTable(row: any): ExtractedTable {
  return {
    id: row.id,
    tableId: row.tableId,
    versionId: row.versionId,
    pageNumber: row.pageNumber,
    tableIndex: row.tableIndex || 0,
    titleEn: row.titleEn,
    titleAr: row.titleAr,
    schemaGuess: typeof row.schemaGuess === 'string' ? JSON.parse(row.schemaGuess) : row.schemaGuess,
    rowCount: row.rowCount,
    columnCount: row.columnCount,
    s3TableCsvKey: row.s3TableCsvKey,
    s3TableJsonKey: row.s3TableJsonKey,
    s3TableImageKey: row.s3TableImageKey,
    extractionMethod: row.extractionMethod,
    extractionQuality: row.extractionQuality,
    extractionNotes: row.extractionNotes,
    promotionStatus: row.promotionStatus,
    promotedDatasetId: row.promotedDatasetId,
    createdAt: new Date(row.createdAt),
    reviewedAt: row.reviewedAt ? new Date(row.reviewedAt) : undefined,
    reviewedBy: row.reviewedBy
  };
}
