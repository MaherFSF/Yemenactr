/**
 * Citation Verification and Contradiction Detection Service
 * 
 * Implements strict citation verification:
 * - Every sentence must reference at least one evidence item
 * - PASS requires ≥95% coverage for high-stakes outputs
 * - PASS-WARN if 85-95% with explicit warnings
 * - FAIL if <85% or if contradictions are unresolved
 */

import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

export interface CitationResult {
  sentence: string;
  evidenceIds: number[];
  supported: boolean;
  citationDrift: boolean;
  confidence: 'high' | 'medium' | 'low';
  notes: string;
}

export interface ContradictionResult {
  description: string;
  sourceA: { id: number; org: string; value: string };
  sourceB: { id: number; org: string; value: string };
  severity: 'high' | 'medium' | 'low';
  likelyCause: string;
  resolution: 'resolved' | 'contested' | 'pending';
}

export interface VerificationResult {
  coveragePercent: number;
  sentences: CitationResult[];
  unsupportedSentences: string[];
  citationDriftFlags: string[];
  contradictions: ContradictionResult[];
  recommendation: 'pass' | 'warn' | 'fail';
  reasons: string[];
}

/**
 * Split text into sentences for citation verification
 */
function splitIntoSentences(text: string): string[] {
  // Handle Arabic and English sentence boundaries
  const sentences = text
    .split(/(?<=[.!?؟。])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 10); // Filter out very short fragments
  
  return sentences;
}

/**
 * Verify citations for a piece of text against evidence items
 */
export async function verifyCitations(
  text: string,
  evidenceItems: Array<{
    id: number;
    textContent: string;
    sourceOrg: string;
    confidenceGrade: string;
  }>
): Promise<VerificationResult> {
  const sentences = splitIntoSentences(text);
  
  if (sentences.length === 0) {
    return {
      coveragePercent: 0,
      sentences: [],
      unsupportedSentences: [],
      citationDriftFlags: [],
      contradictions: [],
      recommendation: 'fail',
      reasons: ['No sentences found in text']
    };
  }

  if (evidenceItems.length === 0) {
    return {
      coveragePercent: 0,
      sentences: sentences.map(s => ({
        sentence: s,
        evidenceIds: [],
        supported: false,
        citationDrift: false,
        confidence: 'low' as const,
        notes: 'No evidence items available'
      })),
      unsupportedSentences: sentences,
      citationDriftFlags: [],
      contradictions: [],
      recommendation: 'fail',
      reasons: ['No evidence items provided']
    };
  }

  // Use LLM to map sentences to evidence
  const mappingPrompt = `You are a citation auditor. For each sentence, identify which evidence items (by ID) support it.

Sentences to verify:
${sentences.map((s, i) => `${i + 1}. "${s}"`).join('\n')}

Evidence items available:
${evidenceItems.map(e => `ID ${e.id} (${e.sourceOrg}): "${e.textContent?.substring(0, 200)}..."`).join('\n')}

For each sentence, respond with:
- The sentence number
- List of evidence IDs that support it (empty if none)
- Whether there's "citation drift" (evidence cited but doesn't actually support the statement)
- Confidence level (high/medium/low)

Output JSON format:
{
  "mappings": [
    {
      "sentenceNum": 1,
      "evidenceIds": [1, 2],
      "supported": true,
      "citationDrift": false,
      "confidence": "high",
      "notes": "any issues"
    }
  ]
}`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a strict citation auditor. Only mark sentences as supported if the evidence directly supports the claim. Be conservative." },
        { role: "user", content: mappingPrompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "citation_mapping",
          strict: false,
          schema: {
            type: "object",
            properties: {
              mappings: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    sentenceNum: { type: "number" },
                    evidenceIds: { type: "array", items: { type: "number" } },
                    supported: { type: "boolean" },
                    citationDrift: { type: "boolean" },
                    confidence: { type: "string" },
                    notes: { type: "string" }
                  }
                }
              }
            }
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    const result = JSON.parse(typeof content === 'string' ? content : '{"mappings":[]}');
    
    const citationResults: CitationResult[] = sentences.map((sentence, i) => {
      const mapping = result.mappings?.find((m: any) => m.sentenceNum === i + 1) || {
        evidenceIds: [],
        supported: false,
        citationDrift: false,
        confidence: 'low',
        notes: 'No mapping found'
      };
      
      return {
        sentence,
        evidenceIds: mapping.evidenceIds || [],
        supported: mapping.supported || false,
        citationDrift: mapping.citationDrift || false,
        confidence: mapping.confidence || 'low',
        notes: mapping.notes || ''
      };
    });

    const supportedCount = citationResults.filter(r => r.supported).length;
    const coveragePercent = (supportedCount / sentences.length) * 100;
    
    const unsupportedSentences = citationResults
      .filter(r => !r.supported)
      .map(r => r.sentence);
    
    const citationDriftFlags = citationResults
      .filter(r => r.citationDrift)
      .map(r => `"${r.sentence}" - ${r.notes}`);

    // Determine recommendation
    let recommendation: 'pass' | 'warn' | 'fail';
    const reasons: string[] = [];
    
    if (coveragePercent >= 95 && citationDriftFlags.length === 0) {
      recommendation = 'pass';
      reasons.push(`Citation coverage ${coveragePercent.toFixed(1)}% meets threshold`);
    } else if (coveragePercent >= 85) {
      recommendation = 'warn';
      reasons.push(`Citation coverage ${coveragePercent.toFixed(1)}% is below 95% threshold`);
      if (citationDriftFlags.length > 0) {
        reasons.push(`${citationDriftFlags.length} citation drift issues detected`);
      }
    } else {
      recommendation = 'fail';
      reasons.push(`Citation coverage ${coveragePercent.toFixed(1)}% is below 85% minimum`);
      if (unsupportedSentences.length > 0) {
        reasons.push(`${unsupportedSentences.length} sentences lack evidence support`);
      }
    }

    return {
      coveragePercent,
      sentences: citationResults,
      unsupportedSentences,
      citationDriftFlags,
      contradictions: [], // Contradictions handled separately
      recommendation,
      reasons
    };
  } catch (error) {
    console.error('Error in citation verification:', error);
    return {
      coveragePercent: 0,
      sentences: sentences.map(s => ({
        sentence: s,
        evidenceIds: [],
        supported: false,
        citationDrift: false,
        confidence: 'low' as const,
        notes: 'Verification failed'
      })),
      unsupportedSentences: sentences,
      citationDriftFlags: [],
      contradictions: [],
      recommendation: 'fail',
      reasons: ['Citation verification process failed']
    };
  }
}

/**
 * Detect contradictions between evidence items
 */
export async function detectContradictions(
  evidenceItems: Array<{
    id: number;
    textContent: string;
    sourceOrg: string;
    sourceDate: string;
    confidenceGrade: string;
  }>
): Promise<ContradictionResult[]> {
  if (evidenceItems.length < 2) {
    return [];
  }

  const prompt = `You are a contradiction detector for economic data. Analyze these evidence items and identify any contradictions.

Evidence items:
${evidenceItems.map(e => `
ID ${e.id} (${e.sourceOrg}, ${e.sourceDate}, Grade ${e.confidenceGrade}):
"${e.textContent?.substring(0, 500)}"
`).join('\n---\n')}

Look for:
1. Different values for the same metric (e.g., different GDP figures)
2. Conflicting statements about the same event
3. Inconsistent time periods or definitions
4. Different methodologies producing different results

For each contradiction found, explain the likely cause (different definitions, different time periods, different coverage, data errors, etc.)

Output JSON format:
{
  "contradictions": [
    {
      "description": "Description of the contradiction",
      "sourceAId": 1,
      "sourceBId": 2,
      "valueA": "value from source A",
      "valueB": "value from source B",
      "severity": "high/medium/low",
      "likelyCause": "explanation of why they differ"
    }
  ]
}`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are an expert at detecting data contradictions. Be thorough but avoid flagging minor differences that can be explained by rounding or timing." },
        { role: "user", content: prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "contradiction_detection",
          strict: false,
          schema: {
            type: "object",
            properties: {
              contradictions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    description: { type: "string" },
                    sourceAId: { type: "number" },
                    sourceBId: { type: "number" },
                    valueA: { type: "string" },
                    valueB: { type: "string" },
                    severity: { type: "string" },
                    likelyCause: { type: "string" }
                  }
                }
              }
            }
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    const result = JSON.parse(typeof content === 'string' ? content : '{"contradictions":[]}');
    
    return (result.contradictions || []).map((c: any) => {
      const sourceA = evidenceItems.find(e => e.id === c.sourceAId);
      const sourceB = evidenceItems.find(e => e.id === c.sourceBId);
      
      return {
        description: c.description,
        sourceA: {
          id: c.sourceAId,
          org: sourceA?.sourceOrg || 'Unknown',
          value: c.valueA
        },
        sourceB: {
          id: c.sourceBId,
          org: sourceB?.sourceOrg || 'Unknown',
          value: c.valueB
        },
        severity: c.severity || 'medium',
        likelyCause: c.likelyCause || 'Unknown cause',
        resolution: 'pending' as const
      };
    });
  } catch (error) {
    console.error('Error detecting contradictions:', error);
    return [];
  }
}

/**
 * Store contradiction in database
 */
export async function storeContradiction(
  claimId: number,
  contradiction: ContradictionResult
): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.execute(sql`
      INSERT INTO conflicts (
        claimId, description, sourceAId, sourceAOrg, sourceAValue,
        sourceBId, sourceBOrg, sourceBValue, severity, likelyCause, resolution
      ) VALUES (
        ${claimId}, ${contradiction.description},
        ${contradiction.sourceA.id}, ${contradiction.sourceA.org}, ${contradiction.sourceA.value},
        ${contradiction.sourceB.id}, ${contradiction.sourceB.org}, ${contradiction.sourceB.value},
        ${contradiction.severity}, ${contradiction.likelyCause}, ${contradiction.resolution}
      )
    `);
    
    const rows = (result as any)[0];
    return rows?.insertId || null;
  } catch (error) {
    console.error('Error storing contradiction:', error);
    return null;
  }
}

/**
 * Get contradictions for a claim
 */
export async function getContradictions(claimId: number): Promise<ContradictionResult[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db.execute(sql`
      SELECT * FROM conflicts WHERE claimId = ${claimId}
    `);
    
    const rows = (result as any)[0] || [];
    return rows.map((row: any) => ({
      description: row.description,
      sourceA: {
        id: row.sourceAId,
        org: row.sourceAOrg,
        value: row.sourceAValue
      },
      sourceB: {
        id: row.sourceBId,
        org: row.sourceBOrg,
        value: row.sourceBValue
      },
      severity: row.severity,
      likelyCause: row.likelyCause,
      resolution: row.resolution
    }));
  } catch (error) {
    console.error('Error getting contradictions:', error);
    return [];
  }
}

/**
 * Full verification pipeline combining citation and contradiction checks
 */
export async function fullVerification(
  claimId: number,
  text: string,
  evidenceItems: Array<{
    id: number;
    textContent: string;
    sourceOrg: string;
    sourceDate: string;
    confidenceGrade: string;
  }>
): Promise<VerificationResult> {
  // Run citation verification
  const citationResult = await verifyCitations(text, evidenceItems);
  
  // Run contradiction detection
  const contradictions = await detectContradictions(evidenceItems);
  
  // Store any contradictions found
  for (const contradiction of contradictions) {
    await storeContradiction(claimId, contradiction);
  }
  
  // Adjust recommendation based on contradictions
  let finalRecommendation = citationResult.recommendation;
  const finalReasons = [...citationResult.reasons];
  
  const unresolvedContradictions = contradictions.filter(c => c.resolution !== 'resolved');
  const highSeverityContradictions = unresolvedContradictions.filter(c => c.severity === 'high');
  
  if (highSeverityContradictions.length > 0) {
    finalRecommendation = 'fail';
    finalReasons.push(`${highSeverityContradictions.length} high-severity unresolved contradictions`);
  } else if (unresolvedContradictions.length > 0 && finalRecommendation === 'pass') {
    finalRecommendation = 'warn';
    finalReasons.push(`${unresolvedContradictions.length} unresolved contradictions require attention`);
  }
  
  return {
    ...citationResult,
    contradictions,
    recommendation: finalRecommendation,
    reasons: finalReasons
  };
}
