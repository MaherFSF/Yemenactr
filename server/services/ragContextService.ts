/**
 * RAG Context Pack Service
 * Builds context packs from library documents for AI agents
 */

import { getDb } from '../db';
import { sql } from 'drizzle-orm';
import * as literatureService from './literatureService';
import * as citationAnchorService from './citationAnchorService';

// Types
export interface ContextPackRequest {
  sector?: string;
  entityId?: number;
  indicatorCode?: string;
  eventId?: number;
  query?: string;
  maxDocuments?: number;
  maxTokens?: number;
  includeAnchors?: boolean;
  includeTables?: boolean;
  regimeTag?: string;
}

export interface ContextPackDocument {
  docId: string;
  title: string;
  titleAr?: string;
  publisher: string;
  publishedAt?: Date;
  docType: string;
  summary?: string;
  summaryAr?: string;
  relevanceScore: number;
  anchors?: Array<{
    anchorId: string;
    snippetText: string;
    snippetTextAr?: string;
    pageNumber?: number;
    confidence: string;
  }>;
  tables?: Array<{
    tableId: string;
    title?: string;
    rowCount?: number;
    columnCount?: number;
  }>;
}

export interface ContextPack {
  packId: string;
  createdAt: Date;
  request: ContextPackRequest;
  documents: ContextPackDocument[];
  totalDocuments: number;
  estimatedTokens: number;
  coverageScore: number;
  metadata: {
    sectors: string[];
    years: number[];
    publishers: string[];
    docTypes: string[];
  };
}

/**
 * Build a context pack for AI agents
 */
export async function buildContextPack(request: ContextPackRequest): Promise<ContextPack> {
  const maxDocs = request.maxDocuments || 10;
  const maxTokens = request.maxTokens || 8000;
  
  // Build search filters based on request
  const filters: literatureService.SearchFilters = {
    status: ['published'],
    limit: maxDocs * 2 // Fetch more to allow for filtering
  };

  if (request.sector) {
    filters.sectors = [request.sector];
  }

  if (request.regimeTag) {
    filters.regimeTags = [request.regimeTag];
  }

  if (request.query) {
    filters.query = request.query;
  }

  // Search for relevant documents
  const searchResult = await literatureService.searchDocuments(filters);
  
  // If entity specified, also get entity-specific documents
  let entityDocs: literatureService.LibraryDocument[] = [];
  if (request.entityId) {
    entityDocs = await literatureService.getDocumentsByEntity(request.entityId, maxDocs);
  }

  // Combine and deduplicate
  const allDocs = [...searchResult.documents];
  for (const doc of entityDocs) {
    if (!allDocs.find(d => d.id === doc.id)) {
      allDocs.push(doc);
    }
  }

  // Score and rank documents
  const scoredDocs = allDocs.map(doc => ({
    doc,
    score: calculateRelevanceScore(doc, request)
  }));

  scoredDocs.sort((a, b) => b.score - a.score);

  // Build context pack documents with token budget
  const packDocuments: ContextPackDocument[] = [];
  let totalTokens = 0;
  const tokenBudgetPerDoc = Math.floor(maxTokens / maxDocs);

  for (const { doc, score } of scoredDocs.slice(0, maxDocs)) {
    const packDoc: ContextPackDocument = {
      docId: doc.docId,
      title: doc.titleEn,
      titleAr: doc.titleAr,
      publisher: doc.publisherName,
      publishedAt: doc.publishedAt,
      docType: doc.docType,
      summary: doc.summaryEn,
      summaryAr: doc.summaryAr,
      relevanceScore: score
    };

    // Estimate tokens for this document
    let docTokens = estimateTokens(packDoc.title + (packDoc.summary || ''));

    // Add anchors if requested and within budget
    if (request.includeAnchors && doc.currentVersionId) {
      const anchors = await citationAnchorService.getAnchorsForVersion(doc.currentVersionId);
      const relevantAnchors = anchors
        .filter(a => a.confidence === 'high' || a.confidence === 'medium')
        .slice(0, 5);
      
      packDoc.anchors = relevantAnchors.map(a => ({
        anchorId: a.anchorId,
        snippetText: a.snippetText,
        snippetTextAr: a.snippetTextAr,
        pageNumber: a.pageNumber,
        confidence: a.confidence
      }));

      docTokens += relevantAnchors.reduce((sum, a) => sum + estimateTokens(a.snippetText), 0);
    }

    // Add tables if requested
    if (request.includeTables && doc.currentVersionId) {
      const tables = await citationAnchorService.getTablesForVersion(doc.currentVersionId);
      packDoc.tables = tables.slice(0, 3).map(t => ({
        tableId: t.tableId,
        title: t.titleEn,
        rowCount: t.rowCount,
        columnCount: t.columnCount
      }));
    }

    // Check token budget
    if (totalTokens + docTokens <= maxTokens) {
      packDocuments.push(packDoc);
      totalTokens += docTokens;
    }

    if (packDocuments.length >= maxDocs) break;
  }

  // Calculate coverage score
  const coverageScore = calculateCoverageScore(packDocuments, request);

  // Build metadata
  const metadata = {
    sectors: Array.from(new Set(allDocs.flatMap(d => d.sectors || []))),
    years: Array.from(new Set(allDocs.map(d => d.publishedAt ? new Date(d.publishedAt).getFullYear() : null).filter(Boolean) as number[])),
    publishers: Array.from(new Set(allDocs.map(d => d.publisherName))),
    docTypes: Array.from(new Set(allDocs.map(d => d.docType)))
  };

  return {
    packId: `pack_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    createdAt: new Date(),
    request,
    documents: packDocuments,
    totalDocuments: packDocuments.length,
    estimatedTokens: totalTokens,
    coverageScore,
    metadata
  };
}

/**
 * Build context pack for a specific sector
 */
export async function buildSectorContextPack(
  sectorCode: string,
  options: {
    maxDocuments?: number;
    maxTokens?: number;
    includeAnchors?: boolean;
    regimeTag?: string;
  } = {}
): Promise<ContextPack> {
  return buildContextPack({
    sector: sectorCode,
    maxDocuments: options.maxDocuments || 15,
    maxTokens: options.maxTokens || 12000,
    includeAnchors: options.includeAnchors ?? true,
    includeTables: true,
    regimeTag: options.regimeTag
  });
}

/**
 * Build context pack for an entity
 */
export async function buildEntityContextPack(
  entityId: number,
  options: {
    maxDocuments?: number;
    maxTokens?: number;
  } = {}
): Promise<ContextPack> {
  return buildContextPack({
    entityId,
    maxDocuments: options.maxDocuments || 10,
    maxTokens: options.maxTokens || 8000,
    includeAnchors: true,
    includeTables: true
  });
}

/**
 * Build context pack for a query
 */
export async function buildQueryContextPack(
  query: string,
  options: {
    sector?: string;
    maxDocuments?: number;
    maxTokens?: number;
  } = {}
): Promise<ContextPack> {
  return buildContextPack({
    query,
    sector: options.sector,
    maxDocuments: options.maxDocuments || 8,
    maxTokens: options.maxTokens || 6000,
    includeAnchors: true
  });
}

/**
 * Format context pack for LLM prompt
 */
export function formatContextPackForPrompt(pack: ContextPack): string {
  const lines: string[] = [];
  
  lines.push('## Research Context');
  lines.push(`Based on ${pack.totalDocuments} documents from YETO Research Library`);
  lines.push('');

  for (const doc of pack.documents) {
    lines.push(`### ${doc.title}`);
    lines.push(`**Publisher:** ${doc.publisher}`);
    if (doc.publishedAt) {
      lines.push(`**Date:** ${new Date(doc.publishedAt).toLocaleDateString()}`);
    }
    lines.push(`**Type:** ${doc.docType}`);
    lines.push(`**Relevance:** ${(doc.relevanceScore * 100).toFixed(0)}%`);
    lines.push('');

    if (doc.summary) {
      lines.push(doc.summary);
      lines.push('');
    }

    if (doc.anchors && doc.anchors.length > 0) {
      lines.push('**Key Excerpts:**');
      for (const anchor of doc.anchors) {
        lines.push(`> "${anchor.snippetText}" (p.${anchor.pageNumber || 'N/A'}, ${anchor.confidence} confidence)`);
        lines.push(`> [Citation: ${anchor.anchorId}]`);
      }
      lines.push('');
    }

    if (doc.tables && doc.tables.length > 0) {
      lines.push('**Available Tables:**');
      for (const table of doc.tables) {
        lines.push(`- ${table.title || 'Untitled'} (${table.rowCount}×${table.columnCount})`);
      }
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  }

  lines.push('## Citation Guidelines');
  lines.push('When referencing information from these documents:');
  lines.push('1. Use the anchor IDs provided for specific claims');
  lines.push('2. Include publisher and date for context');
  lines.push('3. Note confidence levels when available');

  return lines.join('\n');
}

/**
 * Get literature coverage for a sector
 */
export async function getLiteratureCoverage(sectorCode: string): Promise<{
  totalDocuments: number;
  byYear: Record<number, number>;
  byType: Record<string, number>;
  byPublisher: Record<string, number>;
  recentDocuments: number;
  coverageGaps: string[];
}> {
  const docs = await literatureService.getDocumentsBySector(sectorCode, 100);
  
  const byYear: Record<number, number> = {};
  const byType: Record<string, number> = {};
  const byPublisher: Record<string, number> = {};
  let recentDocuments = 0;
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  for (const doc of docs) {
    // By year
    if (doc.publishedAt) {
      const year = new Date(doc.publishedAt).getFullYear();
      byYear[year] = (byYear[year] || 0) + 1;
      
      if (new Date(doc.publishedAt) > oneYearAgo) {
        recentDocuments++;
      }
    }

    // By type
    byType[doc.docType] = (byType[doc.docType] || 0) + 1;

    // By publisher
    byPublisher[doc.publisherName] = (byPublisher[doc.publisherName] || 0) + 1;
  }

  // Identify coverage gaps
  const coverageGaps: string[] = [];
  const currentYear = new Date().getFullYear();
  
  // Check for missing recent years
  for (let year = currentYear - 2; year <= currentYear; year++) {
    if (!byYear[year] || byYear[year] < 3) {
      coverageGaps.push(`Limited coverage for ${year}`);
    }
  }

  // Check for missing document types
  const expectedTypes = ['report', 'working_paper', 'policy_brief', 'sitrep'];
  for (const type of expectedTypes) {
    if (!byType[type]) {
      coverageGaps.push(`No ${type.replace(/_/g, ' ')} documents`);
    }
  }

  return {
    totalDocuments: docs.length,
    byYear,
    byType,
    byPublisher,
    recentDocuments,
    coverageGaps
  };
}

/**
 * Record context pack usage for analytics
 */
export async function recordContextPackUsage(
  packId: string,
  agentType: string,
  usageContext: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.execute(sql`
      INSERT INTO context_packs (packId, agentType, usageContext, usedAt)
      VALUES (${packId}, ${agentType}, ${usageContext}, NOW())
    `);
  } catch (error) {
    console.error('[RAGContextService] Failed to record usage:', error);
  }
}

// Helper functions

function calculateRelevanceScore(
  doc: literatureService.LibraryDocument,
  request: ContextPackRequest
): number {
  let score = 0.5; // Base score

  // Boost for matching sector
  if (request.sector && doc.sectors?.includes(request.sector)) {
    score += 0.2;
  }

  // Boost for recency
  if (doc.publishedAt) {
    const ageInYears = (Date.now() - new Date(doc.publishedAt).getTime()) / (365 * 24 * 60 * 60 * 1000);
    if (ageInYears < 1) score += 0.15;
    else if (ageInYears < 2) score += 0.1;
    else if (ageInYears < 3) score += 0.05;
  }

  // Boost for importance score
  score += (doc.importanceScore / 100) * 0.1;

  // Boost for open license
  if (doc.licenseFlag === 'open') {
    score += 0.05;
  }

  // Boost for having summary
  if (doc.summaryEn) {
    score += 0.05;
  }

  // Boost for query match (simple keyword matching)
  if (request.query) {
    const queryLower = request.query.toLowerCase();
    const titleLower = doc.titleEn.toLowerCase();
    const summaryLower = (doc.summaryEn || '').toLowerCase();
    
    if (titleLower.includes(queryLower)) score += 0.15;
    if (summaryLower.includes(queryLower)) score += 0.1;
  }

  return Math.min(1, score);
}

function calculateCoverageScore(
  documents: ContextPackDocument[],
  request: ContextPackRequest
): number {
  if (documents.length === 0) return 0;

  let score = 0;

  // Score based on document count
  const targetDocs = request.maxDocuments || 10;
  score += (documents.length / targetDocs) * 0.3;

  // Score based on relevance distribution
  const avgRelevance = documents.reduce((sum, d) => sum + d.relevanceScore, 0) / documents.length;
  score += avgRelevance * 0.3;

  // Score based on source diversity
  const uniquePublishers = new Set(documents.map(d => d.publisher)).size;
  score += Math.min(uniquePublishers / 5, 1) * 0.2;

  // Score based on recency
  const recentDocs = documents.filter(d => {
    if (!d.publishedAt) return false;
    const ageInYears = (Date.now() - new Date(d.publishedAt).getTime()) / (365 * 24 * 60 * 60 * 1000);
    return ageInYears < 2;
  }).length;
  score += (recentDocs / documents.length) * 0.2;

  return Math.min(1, score);
}

function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token
  return Math.ceil(text.length / 4);
}
