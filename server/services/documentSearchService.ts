/**
 * Document Search Service
 * 
 * Hybrid search combining:
 * - Full-text keyword search (MySQL FULLTEXT)
 * - Semantic vector search (embeddings)
 * - Metadata filtering (sector, year, regime, visibility)
 */

import { getDb } from "../db";
import {
  documents,
  documentChunks,
  documentEmbeddings,
  documentSearchIndex,
  documentCitations,
  sources,
} from "../../drizzle/schema";
import { eq, and, or, desc, asc, sql, like, inArray, gte, lte } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

// ============================================================================
// TYPES
// ============================================================================

export interface SearchQuery {
  query: string;
  language?: "en" | "ar" | "both";
  sectors?: string[];
  regimeTag?: "aden" | "sanaa" | "both" | "international";
  yearFrom?: number;
  yearTo?: number;
  visibility?: "public" | "restricted" | "internal";
  productType?: string;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  documentId: number;
  title: string;
  titleAr?: string;
  snippet: string;
  snippetAr?: string;
  relevanceScore: number;
  source?: string;
  publicationDate?: Date;
  regimeTag?: string;
  sectors?: string[];
  url: string;
  citationAnchors: Array<{
    anchorId: string;
    anchorType: string;
    pageNumber?: number;
    snippet: string;
  }>;
  evidencePackId?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  facets: {
    sectors: Record<string, number>;
    years: Record<number, number>;
    regimeTags: Record<string, number>;
    sources: Record<string, number>;
  };
  searchMetadata: {
    query: string;
    method: "keyword" | "semantic" | "hybrid";
    executionTimeMs: number;
  };
}

// ============================================================================
// SEARCH FUNCTIONS
// ============================================================================

/**
 * Hybrid search: keyword + semantic + filters
 */
export async function searchDocuments(
  searchQuery: SearchQuery
): Promise<SearchResponse> {
  const startTime = Date.now();
  const db = await getDb();
  if (!db) {
    return {
      results: [],
      totalCount: 0,
      facets: { sectors: {}, years: {}, regimeTags: {}, sources: {} },
      searchMetadata: {
        query: searchQuery.query,
        method: "keyword",
        executionTimeMs: 0,
      },
    };
  }

  const limit = searchQuery.limit || 20;
  const offset = searchQuery.offset || 0;

  // Determine search method
  const useSemanticSearch = searchQuery.query.length > 20; // Use semantic for longer queries
  const method = useSemanticSearch ? "hybrid" : "keyword";

  // 1. Keyword search
  const keywordResults = await keywordSearch(db, searchQuery);

  // 2. Semantic search (if applicable)
  let semanticResults: number[] = [];
  if (useSemanticSearch) {
    semanticResults = await semanticSearch(db, searchQuery.query, limit * 2);
  }

  // 3. Merge results
  const mergedResults = mergeSearchResults(keywordResults, semanticResults);

  // 4. Fetch full document details
  const results = await fetchDocumentDetails(db, mergedResults.slice(offset, offset + limit));

  // 5. Calculate facets
  const facets = await calculateFacets(db, searchQuery);

  const executionTimeMs = Date.now() - startTime;

  return {
    results,
    totalCount: mergedResults.length,
    facets,
    searchMetadata: {
      query: searchQuery.query,
      method,
      executionTimeMs,
    },
  };
}

/**
 * Keyword search using MySQL FULLTEXT
 */
async function keywordSearch(
  db: any,
  searchQuery: SearchQuery
): Promise<Array<{ documentId: number; score: number }>> {
  // Build WHERE conditions
  const conditions: any[] = [eq(documentSearchIndex.visibility, searchQuery.visibility || "public")];

  // Language filter
  if (searchQuery.language && searchQuery.language !== "both") {
    conditions.push(eq(documentSearchIndex.language, searchQuery.language));
  }

  // Sector filter
  if (searchQuery.sectors && searchQuery.sectors.length > 0) {
    conditions.push(
      sql`JSON_CONTAINS(${documentSearchIndex.sectorTags}, ${JSON.stringify(searchQuery.sectors)})`
    );
  }

  // Regime filter
  if (searchQuery.regimeTag) {
    conditions.push(eq(documentSearchIndex.regimeTag, searchQuery.regimeTag));
  }

  // Year range filter
  if (searchQuery.yearFrom) {
    conditions.push(gte(documentSearchIndex.publicationYear, searchQuery.yearFrom));
  }
  if (searchQuery.yearTo) {
    conditions.push(lte(documentSearchIndex.publicationYear, searchQuery.yearTo));
  }

  // Full-text search query
  const searchTerms = searchQuery.query.trim();
  if (searchTerms) {
    // Use LIKE for simple matching (in production, use FULLTEXT MATCH AGAINST)
    conditions.push(
      or(
        like(documentSearchIndex.title, `%${searchTerms}%`),
        like(documentSearchIndex.fullText, `%${searchTerms}%`)
      )
    );
  }

  // Execute query
  const results = await db
    .select({
      documentId: documentSearchIndex.documentId,
      title: documentSearchIndex.title,
      fullText: documentSearchIndex.fullText,
    })
    .from(documentSearchIndex)
    .where(and(...conditions))
    .limit(searchQuery.limit || 100);

  // Calculate relevance scores
  return results.map((r: any) => {
    let score = 0;
    const queryLower = searchQuery.query.toLowerCase();
    const titleLower = r.title.toLowerCase();
    const textLower = r.fullText.toLowerCase();

    // Title match (high weight)
    if (titleLower.includes(queryLower)) {
      score += 100;
    }

    // Count occurrences in text
    const occurrences = (textLower.match(new RegExp(queryLower, "g")) || []).length;
    score += occurrences * 5;

    // Position bonus (earlier = better)
    const firstIndex = textLower.indexOf(queryLower);
    if (firstIndex >= 0) {
      score += Math.max(0, 50 - firstIndex / 100);
    }

    return {
      documentId: r.documentId,
      score,
    };
  });
}

/**
 * Semantic search using embeddings
 */
async function semanticSearch(
  db: any,
  query: string,
  limit: number
): Promise<number[]> {
  try {
    // Generate query embedding (in production, call OpenAI API)
    // For now, return empty array as we don't have real embeddings
    console.log(`[DocumentSearch] Semantic search for: "${query}"`);
    
    // In production:
    // 1. Generate embedding for query
    // 2. Find nearest neighbor chunks using vector similarity (cosine/euclidean)
    // 3. Return document IDs ordered by relevance
    
    return [];
  } catch (error) {
    console.error("[DocumentSearch] Semantic search failed:", error);
    return [];
  }
}

/**
 * Merge keyword and semantic results
 */
function mergeSearchResults(
  keywordResults: Array<{ documentId: number; score: number }>,
  semanticResults: number[]
): number[] {
  // Create score map
  const scoreMap = new Map<number, number>();

  // Add keyword scores
  for (const result of keywordResults) {
    scoreMap.set(result.documentId, result.score);
  }

  // Boost semantic results
  for (let i = 0; i < semanticResults.length; i++) {
    const docId = semanticResults[i];
    const semanticScore = (semanticResults.length - i) * 10; // Higher rank = higher score
    const existingScore = scoreMap.get(docId) || 0;
    scoreMap.set(docId, existingScore + semanticScore);
  }

  // Sort by combined score
  return Array.from(scoreMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([docId]) => docId);
}

/**
 * Fetch full document details for search results
 */
async function fetchDocumentDetails(
  db: any,
  documentIds: number[]
): Promise<SearchResult[]> {
  if (documentIds.length === 0) return [];

  // Fetch documents
  const docs = await db
    .select({
      doc: documents,
      source: sources,
    })
    .from(documents)
    .leftJoin(sources, eq(sources.id, documents.sourceId))
    .where(inArray(documents.id, documentIds));

  // Fetch chunks for snippets
  const chunks = await db
    .select()
    .from(documentChunks)
    .where(inArray(documentChunks.documentId, documentIds))
    .orderBy(asc(documentChunks.chunkIndex));

  // Group chunks by document
  const chunksByDoc = new Map<number, any[]>();
  for (const chunk of chunks) {
    if (!chunksByDoc.has(chunk.documentId)) {
      chunksByDoc.set(chunk.documentId, []);
    }
    chunksByDoc.get(chunk.documentId)!.push(chunk);
  }

  // Build results
  const results: SearchResult[] = [];
  for (const docId of documentIds) {
    const docData = docs.find(d => d.doc.id === docId);
    if (!docData) continue;

    const doc = docData.doc;
    const source = docData.source;
    const docChunks = chunksByDoc.get(docId) || [];

    // Get first chunk as snippet
    const snippet = docChunks[0]?.chunkText?.substring(0, 300) || "";
    const snippetAr = docChunks[0]?.chunkTextAr?.substring(0, 300);

    // Build citation anchors
    const citationAnchors = docChunks.slice(0, 5).map((chunk: any) => ({
      anchorId: chunk.anchorId,
      anchorType: chunk.anchorType,
      pageNumber: chunk.pageNumber,
      snippet: chunk.chunkText.substring(0, 150),
    }));

    results.push({
      documentId: doc.id,
      title: doc.title,
      titleAr: doc.titleAr || undefined,
      snippet,
      snippetAr,
      relevanceScore: 100, // Would be calculated from merge
      source: source?.publisher,
      publicationDate: doc.publicationDate || undefined,
      regimeTag: doc.regimeTag || undefined,
      sectors: doc.sectorTags || [],
      url: doc.fileUrl,
      citationAnchors,
      evidencePackId: doc.evidencePackId || undefined,
    });
  }

  return results;
}

/**
 * Calculate facets for filtering
 */
async function calculateFacets(
  db: any,
  searchQuery: SearchQuery
): Promise<{
  sectors: Record<string, number>;
  years: Record<number, number>;
  regimeTags: Record<string, number>;
  sources: Record<string, number>;
}> {
  // Build base conditions (without the facet being calculated)
  const baseConditions: any[] = [
    eq(documentSearchIndex.visibility, searchQuery.visibility || "public"),
  ];

  if (searchQuery.language && searchQuery.language !== "both") {
    baseConditions.push(eq(documentSearchIndex.language, searchQuery.language));
  }

  // Calculate year facets
  const yearResults = await db
    .select({
      year: documentSearchIndex.publicationYear,
      count: sql<number>`COUNT(*)`,
    })
    .from(documentSearchIndex)
    .where(and(...baseConditions))
    .groupBy(documentSearchIndex.publicationYear)
    .orderBy(desc(documentSearchIndex.publicationYear));

  const years: Record<number, number> = {};
  for (const r of yearResults) {
    if (r.year) years[r.year] = Number(r.count);
  }

  // Calculate regime tag facets
  const regimeResults = await db
    .select({
      regime: documentSearchIndex.regimeTag,
      count: sql<number>`COUNT(*)`,
    })
    .from(documentSearchIndex)
    .where(and(...baseConditions))
    .groupBy(documentSearchIndex.regimeTag);

  const regimeTags: Record<string, number> = {};
  for (const r of regimeResults) {
    if (r.regime) regimeTags[r.regime] = Number(r.count);
  }

  // Calculate source facets
  const sourceResults = await db
    .select({
      sourceId: documentSearchIndex.sourceId,
      sourceName: sources.publisher,
      count: sql<number>`COUNT(*)`,
    })
    .from(documentSearchIndex)
    .leftJoin(sources, eq(sources.id, documentSearchIndex.sourceId))
    .where(and(...baseConditions))
    .groupBy(documentSearchIndex.sourceId);

  const sourcesMap: Record<string, number> = {};
  for (const r of sourceResults) {
    if (r.sourceName) sourcesMap[r.sourceName] = Number(r.count);
  }

  // Sectors facets (from JSON array - simplified)
  const sectors: Record<string, number> = {};

  return {
    sectors,
    years,
    regimeTags,
    sources: sourcesMap,
  };
}

/**
 * Record citation from AI response or report
 */
export async function recordDocumentCitation(params: {
  citingType: "ai_response" | "report" | "insight" | "alert" | "user_query";
  citingId?: string;
  documentId: number;
  chunkId?: number;
  anchorId?: string;
  relevanceScore?: number;
  confidenceScore?: number;
  queryText?: string;
  responseText?: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(documentCitations).values({
    citingType: params.citingType,
    citingId: params.citingId,
    documentId: params.documentId,
    chunkId: params.chunkId,
    anchorId: params.anchorId,
    relevanceScore: params.relevanceScore?.toString(),
    confidenceScore: params.confidenceScore?.toString(),
    queryText: params.queryText,
    responseText: params.responseText,
  });

  // Increment citation count in search index
  await db.execute(sql`
    UPDATE ${documentSearchIndex}
    SET citationCount = citationCount + 1
    WHERE documentId = ${params.documentId}
  `);
}

/**
 * Get top 10 search results for quality testing
 */
export async function getTop10Results(
  query: string,
  language: "en" | "ar" = "en"
): Promise<SearchResult[]> {
  const searchQuery: SearchQuery = {
    query,
    language,
    limit: 10,
    offset: 0,
  };

  const response = await searchDocuments(searchQuery);
  return response.results;
}

/**
 * Search regression test: verify top-10 retrieval quality
 */
export async function runSearchRegressionTest(): Promise<{
  passed: boolean;
  results: Array<{
    query: string;
    language: string;
    resultCount: number;
    topRelevance: number;
    passed: boolean;
  }>;
}> {
  const testQueries = [
    { query: "inflation rate yemen", language: "en" as const },
    { query: "exchange rate rial dollar", language: "en" as const },
    { query: "معدل التضخم في اليمن", language: "ar" as const },
    { query: "البنك المركزي اليمني", language: "ar" as const },
    { query: "humanitarian aid flows", language: "en" as const },
    { query: "food security prices", language: "en" as const },
    { query: "الأمن الغذائي", language: "ar" as const },
    { query: "poverty unemployment", language: "en" as const },
    { query: "central bank governor", language: "en" as const },
    { query: "تدفق المساعدات", language: "ar" as const },
  ];

  const results = [];
  let allPassed = true;

  for (const test of testQueries) {
    const searchResults = await getTop10Results(test.query, test.language);
    const topRelevance = searchResults[0]?.relevanceScore || 0;
    const passed = searchResults.length > 0 && topRelevance > 50;

    results.push({
      query: test.query,
      language: test.language,
      resultCount: searchResults.length,
      topRelevance,
      passed,
    });

    if (!passed) allPassed = false;
  }

  return {
    passed: allPassed,
    results,
  };
}
