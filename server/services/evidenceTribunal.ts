/**
 * Evidence Tribunal - Multi-Agent Adjudication System
 * 
 * Implements a 5-agent tribunal that adjudicates every claim before publication:
 * 1. Analyst Agent - Produces claims from evidence
 * 2. Skeptic Agent - Finds contradictions and weak inferences
 * 3. Methodologist Agent - Checks time scope, units, regime tagging
 * 4. Citation Auditor Agent - Verifies sentence-to-evidence mapping
 * 5. Judge Agent - Makes final PASS/PASS_WARN/FAIL decision
 */

import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

// Types
export type TribunalVerdict = 'PASS' | 'PASS_WARN' | 'FAIL';

export interface EvidenceItem {
  id: number;
  itemType: string;
  sourceOrg: string;
  sourceDate: string;
  textContent: string;
  pageRef?: string;
  documentUrl?: string;
  confidenceGrade: 'A' | 'B' | 'C' | 'D';
}

export interface ClaimInput {
  claimId: number;
  claimType: string;
  content: string;
  subject?: string;
  pageContext?: string;
  yearContext?: number;
  regimeTag?: 'aden' | 'sanaa' | 'both';
}

export interface TribunalResult {
  verdict: TribunalVerdict;
  citationCoveragePercent: number;
  contradictionScore: number;
  evidenceStrength: number;
  uncertaintyScore: number;
  publishableText: string;
  warnings: string[];
  whatWouldChange: string;
  analystOutput: string;
  skepticOutput: string;
  methodologistOutput: string;
  citationAuditorOutput: string;
  judgeOutput: string;
  reasons: Record<string, any>;
  dataGapTickets: Array<{
    missingField: string;
    suggestedSources: string[];
    priority: 'high' | 'medium' | 'low';
  }>;
}

// Agent prompts
const ANALYST_PROMPT = `You are the Analyst Agent in the YETO Evidence Tribunal.
Your role is to produce the best possible claim/answer using ONLY the retrieved evidence provided.
You must NOT use any external knowledge - only what is in the evidence.

Evidence Items:
{evidence}

Claim to analyze:
{claim}

Instructions:
1. Review all evidence items carefully
2. Identify which evidence items support the claim
3. Note any gaps in the evidence
4. Produce a refined, evidence-grounded version of the claim
5. List all citations used (evidence item IDs)

Output format (JSON):
{
  "refinedClaim": "The evidence-grounded version of the claim",
  "supportingEvidence": [{"id": 1, "relevance": "high/medium/low", "quote": "relevant excerpt"}],
  "evidenceGaps": ["list of missing information"],
  "citationsUsed": [1, 2, 3],
  "confidence": "high/medium/low"
}`;

const SKEPTIC_PROMPT = `You are the Skeptic Agent in the YETO Evidence Tribunal.
Your role is to find contradictions, weak inferences, and missing evidence.
Be rigorous and critical - your job is to stress-test the claim.

Evidence Items:
{evidence}

Claim being analyzed:
{claim}

Analyst's assessment:
{analystOutput}

Instructions:
1. Look for contradictions between evidence items
2. Identify weak or unsupported inferences
3. Find missing critical evidence
4. Check for logical fallacies
5. Identify potential biases in sources

Output format (JSON):
{
  "contradictions": [{"description": "...", "sources": [1, 2], "severity": "high/medium/low"}],
  "weakInferences": [{"statement": "...", "reason": "..."}],
  "missingEvidence": ["list of critical missing information"],
  "biasFlags": [{"source": "...", "concern": "..."}],
  "overallConcern": "high/medium/low",
  "recommendation": "proceed/caution/reject"
}`;

const METHODOLOGIST_PROMPT = `You are the Methodologist Agent in the YETO Evidence Tribunal.
Your role is to check time scope, unit consistency, regime tagging (Aden/Sana'a), transformations, and statistical validity.

Evidence Items:
{evidence}

Claim being analyzed:
{claim}

Context:
- Year context: {yearContext}
- Regime tag: {regimeTag}
- Page context: {pageContext}

Instructions:
1. Verify time periods match between claim and evidence
2. Check unit consistency (currency, percentages, etc.)
3. Verify regime tagging is correct (Aden vs Sana'a vs Both)
4. Check any data transformations are valid
5. Assess statistical validity of any aggregations

Output format (JSON):
{
  "timeConsistency": {"valid": true/false, "issues": []},
  "unitConsistency": {"valid": true/false, "issues": []},
  "regimeTagging": {"valid": true/false, "issues": []},
  "transformations": {"valid": true/false, "issues": []},
  "statisticalValidity": {"valid": true/false, "issues": []},
  "overallValid": true/false,
  "corrections": ["list of required corrections"]
}`;

const CITATION_AUDITOR_PROMPT = `You are the Citation Auditor Agent in the YETO Evidence Tribunal.
Your role is to verify that EVERY sentence in the claim maps to at least one evidence item.
Flag any "citation drift" where citations don't actually support the statement.

Evidence Items:
{evidence}

Claim text to audit:
{claim}

Instructions:
1. Break the claim into individual sentences
2. For each sentence, identify supporting evidence items
3. Flag sentences without evidence support
4. Flag "citation drift" - where cited evidence doesn't actually support the statement
5. Calculate citation coverage percentage

Output format (JSON):
{
  "sentences": [
    {
      "text": "sentence text",
      "evidenceIds": [1, 2],
      "supported": true/false,
      "citationDrift": false,
      "notes": "any issues"
    }
  ],
  "coveragePercent": 95.5,
  "unsupportedSentences": ["list of unsupported sentences"],
  "citationDriftFlags": ["list of drift issues"],
  "recommendation": "pass/warn/fail"
}`;

const JUDGE_PROMPT = `You are the Judge Agent in the YETO Evidence Tribunal.
Your role is to make the final PASS/PASS_WARN/FAIL decision based on all agent outputs.

Claim:
{claim}

Agent Outputs:
Analyst: {analystOutput}
Skeptic: {skepticOutput}
Methodologist: {methodologistOutput}
Citation Auditor: {citationAuditorOutput}

Decision Criteria:
- PASS: Citation coverage ≥95%, no unresolved contradictions, methodology valid
- PASS_WARN: Citation coverage 85-95%, minor issues flagged
- FAIL: Citation coverage <85%, unresolved contradictions, or methodology invalid

Instructions:
1. Weigh all agent outputs
2. Make final verdict
3. Produce publishable text with any required warnings
4. List what would change this conclusion
5. Create data gap tickets for missing information

Output format (JSON):
{
  "verdict": "PASS/PASS_WARN/FAIL",
  "publishableText": "The final text safe to publish",
  "mandatoryWarnings": ["list of warnings to display"],
  "limitations": ["list of limitations"],
  "whatWouldChange": "Description of what evidence would change this verdict",
  "dataGapTickets": [
    {
      "missingField": "description",
      "suggestedSources": ["source1", "source2"],
      "priority": "high/medium/low"
    }
  ],
  "scores": {
    "citationCoverage": 95.5,
    "contradictionScore": 10,
    "evidenceStrength": 85,
    "uncertainty": 15
  },
  "reasoning": "Detailed reasoning for the verdict"
}`;

/**
 * Run a single agent with the LLM
 */
async function runAgent(
  prompt: string,
  variables: Record<string, string>
): Promise<string> {
  let filledPrompt = prompt;
  for (const [key, value] of Object.entries(variables)) {
    filledPrompt = filledPrompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "You are an expert agent in the YETO Evidence Tribunal. Always respond with valid JSON." },
      { role: "user", content: filledPrompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "agent_response",
        strict: false,
        schema: {
          type: "object",
          additionalProperties: true
        }
      }
    }
  });

  const content = response.choices[0]?.message?.content;
  return typeof content === 'string' ? content : '{}';
}

/**
 * Collect evidence for a claim from the database
 */
export async function collectEvidence(claimId: number): Promise<EvidenceItem[]> {
  const db = await getDb();
  if (!db) return [];
  
  // Check if evidence_sets and evidence_items tables exist and have data
  try {
    const evidenceSet = await db.execute(sql`
      SELECT id FROM evidence_sets WHERE claimId = ${claimId} ORDER BY createdAt DESC LIMIT 1
    `);
    
    const setRows = (evidenceSet as any)[0] || [];
    if (setRows.length === 0) {
      // Create a new evidence set
      await db.execute(sql`
        INSERT INTO evidence_sets (claimId) VALUES (${claimId})
      `);
      return [];
    }
    
    const setId = setRows[0].id;
    
    const items = await db.execute(sql`
      SELECT id, itemType, sourceOrg, sourceDate, textContent, pageRef, documentUrl, confidenceGrade
      FROM evidence_items WHERE evidenceSetId = ${setId}
    `);
    
    const itemRows = (items as any)[0] || [];
    return itemRows.map((row: any) => ({
      id: row.id,
      itemType: row.itemType,
      sourceOrg: row.sourceOrg,
      sourceDate: row.sourceDate,
      textContent: row.textContent,
      pageRef: row.pageRef,
      documentUrl: row.documentUrl,
      confidenceGrade: row.confidenceGrade
    }));
  } catch (error) {
    console.error('Error collecting evidence:', error);
    return [];
  }
}

/**
 * Run the full Evidence Tribunal on a claim
 */
export async function runTribunal(claim: ClaimInput): Promise<TribunalResult> {
  const startTime = Date.now();
  
  // Collect evidence
  const evidence = await collectEvidence(claim.claimId);
  const evidenceStr = evidence.length > 0 
    ? JSON.stringify(evidence, null, 2)
    : 'No evidence items found. This claim lacks supporting evidence.';
  
  const claimStr = JSON.stringify({
    type: claim.claimType,
    content: claim.content,
    subject: claim.subject
  }, null, 2);

  // Run all agents
  console.log(`[Tribunal] Running Analyst Agent for claim ${claim.claimId}`);
  const analystOutput = await runAgent(ANALYST_PROMPT, {
    evidence: evidenceStr,
    claim: claimStr
  });

  console.log(`[Tribunal] Running Skeptic Agent for claim ${claim.claimId}`);
  const skepticOutput = await runAgent(SKEPTIC_PROMPT, {
    evidence: evidenceStr,
    claim: claimStr,
    analystOutput
  });

  console.log(`[Tribunal] Running Methodologist Agent for claim ${claim.claimId}`);
  const methodologistOutput = await runAgent(METHODOLOGIST_PROMPT, {
    evidence: evidenceStr,
    claim: claimStr,
    yearContext: String(claim.yearContext || 'unknown'),
    regimeTag: claim.regimeTag || 'both',
    pageContext: claim.pageContext || 'general'
  });

  console.log(`[Tribunal] Running Citation Auditor Agent for claim ${claim.claimId}`);
  const citationAuditorOutput = await runAgent(CITATION_AUDITOR_PROMPT, {
    evidence: evidenceStr,
    claim: claim.content
  });

  console.log(`[Tribunal] Running Judge Agent for claim ${claim.claimId}`);
  const judgeOutput = await runAgent(JUDGE_PROMPT, {
    claim: claimStr,
    analystOutput,
    skepticOutput,
    methodologistOutput,
    citationAuditorOutput
  });

  // Parse judge output
  let judgeResult: any;
  try {
    judgeResult = JSON.parse(judgeOutput);
  } catch (e) {
    judgeResult = {
      verdict: 'FAIL',
      publishableText: claim.content,
      mandatoryWarnings: ['Failed to parse tribunal result'],
      limitations: [],
      whatWouldChange: 'Valid tribunal run',
      dataGapTickets: [],
      scores: { citationCoverage: 0, contradictionScore: 100, evidenceStrength: 0, uncertainty: 100 },
      reasoning: 'Tribunal parsing failed'
    };
  }

  const runDuration = Date.now() - startTime;

  // Store tribunal run in database
  const db = await getDb();
  if (db) {
    try {
      await db.execute(sql`
      INSERT INTO tribunal_runs (
        claimId, verdict, reasonsJson, citationCoveragePercent, contradictionScore,
        evidenceStrength, uncertaintyScore, analystOutput, skepticOutput,
        methodologistOutput, citationAuditorOutput, judgeOutput, publishableText,
        warningsJson, whatWouldChange, runDurationMs
      ) VALUES (
        ${claim.claimId}, ${judgeResult.verdict || 'FAIL'}, ${JSON.stringify(judgeResult.reasoning || {})},
        ${judgeResult.scores?.citationCoverage || 0}, ${judgeResult.scores?.contradictionScore || 100},
        ${judgeResult.scores?.evidenceStrength || 0}, ${judgeResult.scores?.uncertainty || 100},
        ${analystOutput}, ${skepticOutput}, ${methodologistOutput}, ${citationAuditorOutput},
        ${judgeOutput}, ${judgeResult.publishableText || claim.content},
        ${JSON.stringify(judgeResult.mandatoryWarnings || [])},
        ${judgeResult.whatWouldChange || ''}, ${runDuration}
      )
    `);
  } catch (error) {
    console.error('Error storing tribunal run:', error);
  }

    // Create data gap tickets if needed
    if (judgeResult.dataGapTickets && judgeResult.dataGapTickets.length > 0) {
      for (const ticket of judgeResult.dataGapTickets) {
        try {
          await db.execute(sql`
            INSERT INTO fix_tickets (ticketType, title, description, severity, status, pageContext)
            VALUES ('data_gap', ${ticket.missingField}, ${JSON.stringify(ticket.suggestedSources)}, 
                    ${ticket.priority}, 'open', ${claim.pageContext || 'general'})
          `);
        } catch (error) {
          console.error('Error creating data gap ticket:', error);
        }
      }
    }
  }

  return {
    verdict: judgeResult.verdict || 'FAIL',
    citationCoveragePercent: judgeResult.scores?.citationCoverage || 0,
    contradictionScore: judgeResult.scores?.contradictionScore || 100,
    evidenceStrength: judgeResult.scores?.evidenceStrength || 0,
    uncertaintyScore: judgeResult.scores?.uncertainty || 100,
    publishableText: judgeResult.publishableText || claim.content,
    warnings: judgeResult.mandatoryWarnings || [],
    whatWouldChange: judgeResult.whatWouldChange || '',
    analystOutput,
    skepticOutput,
    methodologistOutput,
    citationAuditorOutput,
    judgeOutput,
    reasons: judgeResult.reasoning || {},
    dataGapTickets: judgeResult.dataGapTickets || []
  };
}

/**
 * Quick verification for simple claims (KPIs, metrics)
 * Returns true if the claim can be published
 */
export async function quickVerify(claimId: number): Promise<{
  canPublish: boolean;
  verdict: TribunalVerdict;
  warnings: string[];
}> {
  const db = await getDb();
  if (!db) {
    return {
      canPublish: false,
      verdict: 'FAIL',
      warnings: ['Database connection failed']
    };
  }
  
  try {
    // Check for existing recent tribunal run
    const recentRun = await db.execute(sql`
      SELECT verdict, warningsJson FROM tribunal_runs 
      WHERE claimId = ${claimId} 
      AND createdAt > DATE_SUB(NOW(), INTERVAL 24 HOUR)
      ORDER BY createdAt DESC LIMIT 1
    `);
    
    const rows = (recentRun as any)[0] || [];
    if (rows.length > 0) {
      const run = rows[0];
      const warnings = JSON.parse(run.warningsJson || '[]');
      return {
        canPublish: run.verdict === 'PASS' || run.verdict === 'PASS_WARN',
        verdict: run.verdict,
        warnings
      };
    }
  } catch (error) {
    console.error('Error in quickVerify:', error);
  }
  
  // No recent run - need full tribunal
  return {
    canPublish: false,
    verdict: 'FAIL',
    warnings: ['No recent tribunal verification found']
  };
}

/**
 * Get tribunal statistics
 */
export async function getTribunalStats(): Promise<{
  totalRuns: number;
  passRate: number;
  avgCitationCoverage: number;
  avgContradictionScore: number;
  recentRuns: Array<{
    claimId: number;
    verdict: string;
    createdAt: Date;
  }>;
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalRuns: 0,
      passRate: 0,
      avgCitationCoverage: 0,
      avgContradictionScore: 0,
      recentRuns: []
    };
  }
  
  try {
    const stats = await db.execute(sql`
      SELECT 
        COUNT(*) as totalRuns,
        AVG(CASE WHEN verdict = 'PASS' THEN 1 WHEN verdict = 'PASS_WARN' THEN 0.5 ELSE 0 END) * 100 as passRate,
        AVG(citationCoveragePercent) as avgCitationCoverage,
        AVG(contradictionScore) as avgContradictionScore
      FROM tribunal_runs
    `);
    
    const recentRuns = await db.execute(sql`
      SELECT claimId, verdict, createdAt FROM tribunal_runs
      ORDER BY createdAt DESC LIMIT 10
    `);
    
    const statsRows = (stats as any)[0] || [];
    const row = statsRows[0] || {};
    const recentRows = (recentRuns as any)[0] || [];
    
    return {
      totalRuns: Number(row.totalRuns) || 0,
      passRate: Number(row.passRate) || 0,
      avgCitationCoverage: Number(row.avgCitationCoverage) || 0,
      avgContradictionScore: Number(row.avgContradictionScore) || 0,
      recentRuns: recentRows.map((r: any) => ({
        claimId: r.claimId,
        verdict: r.verdict,
        createdAt: r.createdAt
      }))
    };
  } catch (error) {
    console.error('Error getting tribunal stats:', error);
    return {
      totalRuns: 0,
      passRate: 0,
      avgCitationCoverage: 0,
      avgContradictionScore: 0,
      recentRuns: []
    };
  }
}
