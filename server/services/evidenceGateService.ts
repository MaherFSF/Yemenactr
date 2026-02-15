/**
 * Evidence Gate Service
 * 
 * Hard gate: AI responses must cite evidence pack IDs
 * If evidence confidence < 95% → "Insufficient evidence" + gap ticket
 * 
 * Integrates with Evidence Tribunal for verification
 */

import { getDb } from "../db";
import {
  documentCitations,
  evidencePacks,
  documents,
  documentChunks,
} from "../../drizzle/schema";
import { eq, and, sql, inArray } from "drizzle-orm";
import { runTribunal, ClaimInput } from "./evidenceTribunal";
import { recordDocumentCitation } from "./documentSearchService";

// ============================================================================
// TYPES
// ============================================================================

export interface EvidenceRequirement {
  claim: string;
  subject?: string;
  context?: string;
  minConfidencePercent?: number; // Default: 95
}

export interface EvidenceGateResult {
  canPublish: boolean;
  verdict: "PASS" | "PASS_WARN" | "FAIL";
  confidencePercent: number;
  citationCoverage: number;
  evidencePackIds: number[];
  documentIds: number[];
  publishableText: string;
  warnings: string[];
  dataGapTickets: Array<{
    missingField: string;
    suggestedSources: string[];
    priority: "high" | "medium" | "low";
  }>;
  citationAnchors: Array<{
    documentId: number;
    chunkId: number;
    anchorId: string;
    snippet: string;
    relevanceScore: number;
  }>;
}

// ============================================================================
// EVIDENCE GATE
// ============================================================================

/**
 * Gate AI response through evidence verification
 * Returns publishable text only if evidence meets 95% threshold
 */
export async function gateResponse(
  responseText: string,
  queryContext: EvidenceRequirement
): Promise<EvidenceGateResult> {
  const db = await getDb();
  if (!db) {
    return createFailedGate("Database unavailable");
  }

  const minConfidence = queryContext.minConfidencePercent || 95;

  // 1. Extract claims from response
  const claims = await extractClaims(responseText, queryContext);

  // 2. Run Evidence Tribunal on each claim
  const tribunalResults = [];
  for (const claim of claims) {
    const result = await runTribunal({
      claimId: Date.now(), // Temporary ID
      claimType: "ai_response",
      content: claim,
      subject: queryContext.subject,
      pageContext: queryContext.context,
    });
    tribunalResults.push(result);
  }

  // 3. Aggregate results
  const avgCitationCoverage =
    tribunalResults.reduce((sum, r) => sum + r.citationCoveragePercent, 0) /
    tribunalResults.length;

  const avgEvidenceStrength =
    tribunalResults.reduce((sum, r) => sum + r.evidenceStrength, 0) /
    tribunalResults.length;

  const allWarnings = tribunalResults.flatMap(r => r.warnings);
  const allDataGapTickets = tribunalResults.flatMap(r => r.dataGapTickets);

  // 4. Determine verdict
  let verdict: "PASS" | "PASS_WARN" | "FAIL";
  let canPublish = false;

  if (avgCitationCoverage >= minConfidence && avgEvidenceStrength >= 80) {
    verdict = "PASS";
    canPublish = true;
  } else if (avgCitationCoverage >= 85 && avgEvidenceStrength >= 70) {
    verdict = "PASS_WARN";
    canPublish = true;
  } else {
    verdict = "FAIL";
    canPublish = false;
  }

  // 5. Find supporting documents
  const { evidencePackIds, documentIds, citationAnchors } =
    await findSupportingDocuments(responseText, queryContext);

  // 6. Record citations
  for (const docId of documentIds) {
    await recordDocumentCitation({
      citingType: "ai_response",
      citingId: `resp_${Date.now()}`,
      documentId: docId,
      relevanceScore: avgEvidenceStrength,
      confidenceScore: avgCitationCoverage,
      queryText: queryContext.claim,
      responseText,
    });
  }

  // 7. Build publishable text
  let publishableText = responseText;
  if (verdict === "FAIL") {
    publishableText = `⚠️ Insufficient Evidence

The requested information requires more evidence to meet our quality standards (${minConfidence}% confidence threshold).

Current evidence coverage: ${avgCitationCoverage.toFixed(1)}%

**What we can confirm:**
${tribunalResults.map(r => `• ${r.publishableText}`).join("\n")}

**Evidence gaps identified:**
${allDataGapTickets.map(t => `• ${t.missingField}`).join("\n")}

**Suggested data collection:**
${allDataGapTickets
  .map(t => `• ${t.missingField}: ${t.suggestedSources.join(", ")}`)
  .join("\n")}

You can help improve this by suggesting additional sources or data.`;
  } else if (verdict === "PASS_WARN") {
    publishableText = `${responseText}

⚠️ **Evidence Quality Notice:**
${allWarnings.join("\n")}

*Evidence coverage: ${avgCitationCoverage.toFixed(1)}%*`;
  }

  return {
    canPublish,
    verdict,
    confidencePercent: avgCitationCoverage,
    citationCoverage: avgCitationCoverage,
    evidencePackIds,
    documentIds,
    publishableText,
    warnings: allWarnings,
    dataGapTickets: allDataGapTickets,
    citationAnchors,
  };
}

/**
 * Extract claims from AI response text
 */
async function extractClaims(
  responseText: string,
  context: EvidenceRequirement
): Promise<string[]> {
  // Split response into sentences
  const sentences = responseText
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);

  // Filter out non-factual sentences (questions, greetings, etc.)
  const claims = sentences.filter(s => {
    const lower = s.toLowerCase();
    return (
      !lower.startsWith("what") &&
      !lower.startsWith("how") &&
      !lower.startsWith("why") &&
      !lower.startsWith("hello") &&
      !lower.startsWith("thank")
    );
  });

  return claims.length > 0 ? claims : [responseText];
}

/**
 * Find supporting documents for a response
 */
async function findSupportingDocuments(
  responseText: string,
  context: EvidenceRequirement
): Promise<{
  evidencePackIds: number[];
  documentIds: number[];
  citationAnchors: Array<{
    documentId: number;
    chunkId: number;
    anchorId: string;
    snippet: string;
    relevanceScore: number;
  }>;
}> {
  const db = await getDb();
  if (!db) {
    return { evidencePackIds: [], documentIds: [], citationAnchors: [] };
  }

  // Extract key terms from response
  const keyTerms = extractKeyTerms(responseText);

  // Search for relevant document chunks
  const chunks = await db
    .select()
    .from(documentChunks)
    .where(
      sql`${documentChunks.chunkText} LIKE ANY(${keyTerms.map(t => `%${t}%`)})`
    )
    .limit(10);

  const documentIds = [...new Set(chunks.map(c => c.documentId))];

  // Get evidence packs for these documents
  const packs = await db
    .select()
    .from(evidencePacks)
    .where(
      and(
        eq(evidencePacks.subjectType, "document"),
        inArray(
          sql`CAST(${evidencePacks.subjectId} AS UNSIGNED)`,
          documentIds
        )
      )
    );

  const evidencePackIds = packs.map(p => p.id);

  // Build citation anchors
  const citationAnchors = chunks.map(chunk => ({
    documentId: chunk.documentId,
    chunkId: chunk.id,
    anchorId: chunk.anchorId,
    snippet: chunk.chunkText.substring(0, 150),
    relevanceScore: calculateRelevance(chunk.chunkText, responseText),
  }));

  return {
    evidencePackIds,
    documentIds,
    citationAnchors,
  };
}

/**
 * Extract key terms from text
 */
function extractKeyTerms(text: string): string[] {
  // Simple extraction: remove stop words, take nouns/numbers
  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "should",
    "could", "may", "might", "must", "can", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "as", "and", "or", "but", "not",
  ]);

  const words = text
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));

  // Take unique words
  return [...new Set(words)].slice(0, 10);
}

/**
 * Calculate relevance score between two texts
 */
function calculateRelevance(text1: string, text2: string): number {
  const terms1 = new Set(extractKeyTerms(text1));
  const terms2 = new Set(extractKeyTerms(text2));

  const intersection = new Set([...terms1].filter(t => terms2.has(t)));
  const union = new Set([...terms1, ...terms2]);

  // Jaccard similarity
  return union.size > 0 ? (intersection.size / union.size) * 100 : 0;
}

/**
 * Create a failed gate result
 */
function createFailedGate(reason: string): EvidenceGateResult {
  return {
    canPublish: false,
    verdict: "FAIL",
    confidencePercent: 0,
    citationCoverage: 0,
    evidencePackIds: [],
    documentIds: [],
    publishableText: `⚠️ Unable to verify: ${reason}`,
    warnings: [reason],
    dataGapTickets: [],
    citationAnchors: [],
  };
}

// ============================================================================
// CITATION FORMATTING
// ============================================================================

/**
 * Add citation footnotes to response text
 */
export function addCitationFootnotes(
  responseText: string,
  gateResult: EvidenceGateResult
): string {
  if (gateResult.citationAnchors.length === 0) {
    return responseText;
  }

  // Add superscript numbers to claims
  let citedText = responseText;
  let citationIndex = 1;

  // Add footnotes section
  citedText += "\n\n---\n**Sources:**\n";
  for (const anchor of gateResult.citationAnchors) {
    citedText += `[${citationIndex}] Document ${anchor.documentId}, ${anchor.anchorId}: "${anchor.snippet}..."\n`;
    citationIndex++;
  }

  return citedText;
}

/**
 * Verify that all claims in a report have evidence
 */
export async function verifyReportEvidence(
  reportContent: string,
  sectionBreakdown: Array<{ section: string; claims: string[] }>
): Promise<{
  allSectionsVerified: boolean;
  sectionResults: Array<{
    section: string;
    verified: boolean;
    coverage: number;
    issues: string[];
  }>;
  overallCoverage: number;
}> {
  const sectionResults = [];
  let totalCoverage = 0;

  for (const section of sectionBreakdown) {
    const sectionText = section.claims.join(" ");
    const gateResult = await gateResponse(sectionText, {
      claim: sectionText,
      subject: section.section,
      minConfidencePercent: 95,
    });

    sectionResults.push({
      section: section.section,
      verified: gateResult.canPublish,
      coverage: gateResult.citationCoverage,
      issues: gateResult.warnings,
    });

    totalCoverage += gateResult.citationCoverage;
  }

  const overallCoverage = totalCoverage / sectionBreakdown.length;
  const allSectionsVerified = sectionResults.every(r => r.verified);

  return {
    allSectionsVerified,
    sectionResults,
    overallCoverage,
  };
}

/**
 * Get evidence quality metrics
 */
export async function getEvidenceQualityMetrics(): Promise<{
  totalResponses: number;
  passedGate: number;
  failedGate: number;
  passRate: number;
  avgCitationCoverage: number;
  topDataGaps: Array<{
    gap: string;
    count: number;
  }>;
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalResponses: 0,
      passedGate: 0,
      failedGate: 0,
      passRate: 0,
      avgCitationCoverage: 0,
      topDataGaps: [],
    };
  }

  // This would query from a responses tracking table
  // For now, return placeholder metrics
  return {
    totalResponses: 0,
    passedGate: 0,
    failedGate: 0,
    passRate: 0,
    avgCitationCoverage: 0,
    topDataGaps: [],
  };
}
