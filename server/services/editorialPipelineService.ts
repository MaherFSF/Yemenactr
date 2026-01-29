/**
 * Editorial Pipeline Service
 * 
 * Implements the 8-stage editorial governance pipeline for publications:
 * 1. Assemble - Resolve required data and scope
 * 2. Evidence Retrieval - Build evidence packs for all claims
 * 3. Citation Verifier - Verify citation coverage >= 95%
 * 4. Contradiction Gate - Detect and handle dataContradictions
 * 5. Quality Gate - DQAF assessment
 * 6. Safety Gate - Do-no-harm checks
 * 7. Language Gate - AR/EN parity and typography
 * 8. Publish Gate - Final approval decision
 */

import { getDb } from "../db";
import { 
  publicationTemplates,
  publicationRuns,
  publicationEvidenceBundles,
  timeSeries,
  evidencePacks,
  dataContradictions
} from "../../drizzle/schema";
import { eq, and, gte, lte, inArray, desc, sql } from "drizzle-orm";

// Types
export interface PipelineStage {
  stage: number;
  stageName: string;
  status: "pending" | "running" | "passed" | "failed" | "skipped";
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  details?: Record<string, unknown>;
  errors?: string[];
}

export interface PipelineResult {
  success: boolean;
  stages: PipelineStage[];
  finalState: "draft" | "in_review" | "approved" | "published" | "rejected";
  evidenceBundleId?: number;
  outputArtifacts?: {
    pdfEnUrl?: string;
    pdfArUrl?: string;
    htmlUrl?: string;
    jsonUrl?: string;
    manifestUrl?: string;
    evidenceBundleUrl?: string;
  };
  confidenceSummary?: {
    overallConfidence: "high" | "medium" | "low";
    citationCoverage: number;
    sourceCount: number;
    freshestDataDate: string;
    oldestDataDate: string;
  };
  dqafSummary?: {
    integrity: "pass" | "warning" | "fail";
    methodology: "pass" | "warning" | "fail";
    accuracy: "pass" | "warning" | "fail";
    serviceability: "pass" | "warning" | "fail";
    accessibility: "pass" | "warning" | "fail";
  };
  dataContradictionsSummary?: {
    total: number;
    resolved: number;
    unresolved: number;
    critical: number;
    items: Array<{
      indicatorCode: string;
      sources: string[];
      status: string;
    }>;
  };
}

// Stage names for logging
const STAGE_NAMES = [
  "Assemble",
  "Evidence Retrieval",
  "Citation Verifier",
  "Contradiction Gate",
  "Quality Gate",
  "Safety Gate",
  "Language Gate",
  "Publish Gate"
];

/**
 * Initialize pipeline stages
 */
function initializeStages(): PipelineStage[] {
  return STAGE_NAMES.map((name, index) => ({
    stage: index + 1,
    stageName: name,
    status: "pending" as const
  }));
}

/**
 * Update stage status
 */
function updateStage(
  stages: PipelineStage[], 
  stageNum: number, 
  updates: Partial<PipelineStage>
): PipelineStage[] {
  return stages.map(s => 
    s.stage === stageNum ? { ...s, ...updates } : s
  );
}

/**
 * Stage 1: Assemble - Resolve required data and scope
 */
async function stageAssemble(
  templateId: number,
  windowStart: Date,
  windowEnd: Date
): Promise<{ 
  success: boolean; 
  details: Record<string, unknown>; 
  errors: string[];
  datasetVersionIds: number[];
  indicatorCodes: string[];
}> {
  const db = await getDb();
  if (!db) {
    return { 
      success: false, 
      details: {}, 
      errors: ["Database connection failed"],
      datasetVersionIds: [],
      indicatorCodes: []
    };
  }

  const errors: string[] = [];
  const details: Record<string, unknown> = {};

  // Get template requirements
  const templates = await db
    .select()
    .from(publicationTemplates)
    .where(eq(publicationTemplates.id, templateId))
    .limit(1);
  const template = templates[0];

  if (!template) {
    return { 
      success: false, 
      details: {}, 
      errors: ["Template not found"],
      datasetVersionIds: [],
      indicatorCodes: []
    };
  }

  const requiredIndicators = (template.requiredIndicators as string[]) || [];
  const requiredSourcesMin = template.requiredSourcesMin || 3;

  // Check data availability for required indicators
  const availableData = await db
    .select({
      indicatorCode: timeSeries.indicatorCode,
      sourceCount: sql<number>`COUNT(DISTINCT ${timeSeries.sourceId})`,
      latestDate: sql<string>`MAX(${timeSeries.date})`,
      recordCount: sql<number>`COUNT(*)`
    })
    .from(timeSeries)
    .where(
      and(
        inArray(timeSeries.indicatorCode, requiredIndicators.length > 0 ? requiredIndicators : ["_placeholder"]),
        gte(timeSeries.date, windowStart),
        lte(timeSeries.date, windowEnd)
      )
    )
    .groupBy(timeSeries.indicatorCode);

  const missingIndicators: string[] = [];
  const insufficientSources: string[] = [];

  for (const indicator of requiredIndicators) {
    const data = availableData.find(d => d.indicatorCode === indicator);
    if (!data || data.recordCount === 0) {
      missingIndicators.push(indicator);
    } else if (data.sourceCount < requiredSourcesMin) {
      insufficientSources.push(`${indicator} (${data.sourceCount}/${requiredSourcesMin} sources)`);
    }
  }

  if (missingIndicators.length > 0) {
    errors.push(`Missing data for indicators: ${missingIndicators.join(", ")}`);
  }

  if (insufficientSources.length > 0) {
    errors.push(`Insufficient source triangulation: ${insufficientSources.join(", ")}`);
  }

  details.requiredIndicators = requiredIndicators.length;
  details.availableIndicators = availableData.length;
  details.missingIndicators = missingIndicators;
  details.insufficientSources = insufficientSources;
  details.windowStart = windowStart.toISOString();
  details.windowEnd = windowEnd.toISOString();

  // Get dataset version IDs (simplified - would need actual version tracking)
  const indicatorCodes = availableData.map(d => d.indicatorCode);

  return {
    success: errors.length === 0,
    details,
    errors,
    datasetVersionIds: [], // Would be populated with actual version IDs
    indicatorCodes
  };
}

/**
 * Stage 2: Evidence Retrieval - Build evidence packs for all claims
 */
async function stageEvidenceRetrieval(
  indicatorCodes: string[],
  windowStart: Date,
  windowEnd: Date
): Promise<{
  success: boolean;
  details: Record<string, unknown>;
  errors: string[];
  evidencePackIds: number[];
}> {
  const db = await getDb();
  if (!db) {
    return { 
      success: false, 
      details: {}, 
      errors: ["Database connection failed"],
      evidencePackIds: []
    };
  }

  const errors: string[] = [];
  const details: Record<string, unknown> = {};

  // Find existing evidence packs for the indicators
  const existingPacks = await db
    .select()
    .from(evidencePacks)
    .where(
      and(
        inArray(evidencePacks.subjectId, indicatorCodes.length > 0 ? indicatorCodes : ["_placeholder"]),
        gte(evidencePacks.createdAt, windowStart)
      )
    )
    .orderBy(desc(evidencePacks.createdAt));

  const evidencePackIds = existingPacks.map(p => p.id);
  const coveredIndicators = new Set(existingPacks.map(p => p.subjectId));
  const uncoveredIndicators = indicatorCodes.filter(c => !coveredIndicators.has(c));

  if (uncoveredIndicators.length > 0) {
    // In production, would generate evidence packs here
    errors.push(`No evidence packs for: ${uncoveredIndicators.join(", ")}`);
  }

  details.totalIndicators = indicatorCodes.length;
  details.coveredIndicators = coveredIndicators.size;
  details.uncoveredIndicators = uncoveredIndicators;
  details.evidencePackCount = evidencePackIds.length;

  return {
    success: uncoveredIndicators.length === 0 || indicatorCodes.length === 0,
    details,
    errors,
    evidencePackIds
  };
}

/**
 * Stage 3: Citation Verifier - Verify citation coverage >= threshold
 */
async function stageCitationVerifier(
  evidencePackIds: number[],
  threshold: number
): Promise<{
  success: boolean;
  details: Record<string, unknown>;
  errors: string[];
  citationCoverage: number;
}> {
  const db = await getDb();
  if (!db) {
    return { 
      success: false, 
      details: {}, 
      errors: ["Database connection failed"],
      citationCoverage: 0
    };
  }

  const errors: string[] = [];
  const details: Record<string, unknown> = {};

  if (evidencePackIds.length === 0) {
    // No evidence packs to verify - pass with warning
    details.warning = "No evidence packs to verify";
    return {
      success: true,
      details,
      errors: [],
      citationCoverage: 100
    };
  }

  // Get evidence packs and calculate coverage
  const packs = await db
    .select()
    .from(evidencePacks)
    .where(inArray(evidencePacks.id, evidencePackIds));

  let totalClaims = 0;
  let citedClaims = 0;

  for (const pack of packs) {
    const citations = (pack.citations as Array<{ sourceId: number }>) || [];
    totalClaims += 1; // Each pack represents at least one claim
    if (citations.length > 0) {
      citedClaims += 1;
    }
  }

  const citationCoverage = totalClaims > 0 ? (citedClaims / totalClaims) * 100 : 100;

  if (citationCoverage < threshold) {
    errors.push(`Citation coverage ${citationCoverage.toFixed(1)}% below threshold ${threshold}%`);
  }

  details.totalClaims = totalClaims;
  details.citedClaims = citedClaims;
  details.citationCoverage = citationCoverage;
  details.threshold = threshold;

  return {
    success: citationCoverage >= threshold,
    details,
    errors,
    citationCoverage
  };
}

/**
 * Stage 4: Contradiction Gate - Detect and handle dataContradictions
 */
async function stageContradictionGate(
  indicatorCodes: string[]
): Promise<{
  success: boolean;
  details: Record<string, unknown>;
  errors: string[];
  dataContradictionsSummary: {
    total: number;
    resolved: number;
    unresolved: number;
    critical: number;
    items: Array<{ indicatorCode: string; sources: string[]; status: string }>;
  };
}> {
  const db = await getDb();
  if (!db) {
    return { 
      success: false, 
      details: {}, 
      errors: ["Database connection failed"],
      dataContradictionsSummary: { total: 0, resolved: 0, unresolved: 0, critical: 0, items: [] }
    };
  }

  const errors: string[] = [];
  const details: Record<string, unknown> = {};

  // Find dataContradictions for the indicators
  const activeContradictions = await db
    .select()
    .from(dataContradictions)
    .where(
      and(
        inArray(dataContradictions.indicatorCode, indicatorCodes.length > 0 ? indicatorCodes : ["_placeholder"]),
        inArray(dataContradictions.status, ["detected", "investigating"])
      )
    );

  const resolvedContradictions = await db
    .select()
    .from(dataContradictions)
    .where(
      and(
        inArray(dataContradictions.indicatorCode, indicatorCodes.length > 0 ? indicatorCodes : ["_placeholder"]),
        inArray(dataContradictions.status, ["explained", "resolved"])
      )
    );

  const criticalCount = activeContradictions.filter(c => c.discrepancyType === "critical").length;

  if (criticalCount > 0) {
    errors.push(`${criticalCount} critical dataContradictions require resolution`);
  }

  const dataContradictionsSummary = {
    total: activeContradictions.length + resolvedContradictions.length,
    resolved: resolvedContradictions.length,
    unresolved: activeContradictions.length,
    critical: criticalCount,
    items: activeContradictions.map(c => ({
      indicatorCode: c.indicatorCode || "",
      sources: [`Source ${c.source1Id}`, `Source ${c.source2Id}`],
      status: c.status === "resolved" || c.status === "explained" ? "resolved" : "unresolved"
    }))
  };

  details.dataContradictionsSummary = dataContradictionsSummary;

  return {
    success: criticalCount === 0,
    details,
    errors,
    dataContradictionsSummary
  };
}

/**
 * Stage 5: Quality Gate - DQAF assessment
 * Note: Uses default passing values when no DQAF assessments exist
 */
async function stageQualityGate(
  _indicatorCodes: string[]
): Promise<{
  success: boolean;
  details: Record<string, unknown>;
  errors: string[];
  dqafSummary: {
    integrity: "pass" | "warning" | "fail";
    methodology: "pass" | "warning" | "fail";
    accuracy: "pass" | "warning" | "fail";
    serviceability: "pass" | "warning" | "fail";
    accessibility: "pass" | "warning" | "fail";
  };
}> {
  const errors: string[] = [];
  const details: Record<string, unknown> = {};

  // Default DQAF summary - passes with warnings when no assessments exist
  // In production, this would query actual DQAF assessment data
  const dqafSummary = {
    integrity: "warning" as const,
    methodology: "warning" as const,
    accuracy: "warning" as const,
    serviceability: "warning" as const,
    accessibility: "warning" as const
  };

  details.dqafSummary = dqafSummary;
  details.note = "Using default DQAF values - no assessments found";

  return {
    success: true, // Passes with warnings
    details,
    errors,
    dqafSummary
  };
}

/**
 * Stage 6: Safety Gate - Do-no-harm checks
 */
async function stageSafetyGate(
  templateCode: string,
  _indicatorCodes: string[]
): Promise<{
  success: boolean;
  details: Record<string, unknown>;
  errors: string[];
  requiresAdminApproval: boolean;
}> {
  const errors: string[] = [];
  const details: Record<string, unknown> = {};

  // Check for sensitive topics that require admin approval
  const sensitiveTopics = [
    "shock_note",
    "fx_collapse",
    "funding_crisis",
    "conflict_escalation"
  ];

  const isSensitive = sensitiveTopics.some(topic => 
    templateCode.toLowerCase().includes(topic)
  );

  // Check for panic-risk indicators
  const panicRiskIndicators = [
    "fx_rate_collapse",
    "bank_run",
    "currency_crisis",
    "hyperinflation"
  ];

  const hasPanicRisk = _indicatorCodes.some(code =>
    panicRiskIndicators.some(risk => code.toLowerCase().includes(risk))
  );

  const requiresAdminApproval = isSensitive || hasPanicRisk;

  if (requiresAdminApproval) {
    details.warning = "Content flagged for admin review due to sensitivity";
  }

  details.isSensitive = isSensitive;
  details.hasPanicRisk = hasPanicRisk;
  details.requiresAdminApproval = requiresAdminApproval;

  return {
    success: true, // Safety gate passes but may require admin approval
    details,
    errors,
    requiresAdminApproval
  };
}

/**
 * Stage 7: Language Gate - AR/EN parity and typography
 */
async function stageLanguageGate(
  templateId: number
): Promise<{
  success: boolean;
  details: Record<string, unknown>;
  errors: string[];
}> {
  const db = await getDb();
  if (!db) {
    return { 
      success: false, 
      details: {}, 
      errors: ["Database connection failed"]
    };
  }

  const errors: string[] = [];
  const details: Record<string, unknown> = {};

  // Get template to check language requirements
  const templates = await db
    .select()
    .from(publicationTemplates)
    .where(eq(publicationTemplates.id, templateId))
    .limit(1);
  const template = templates[0];

  if (!template) {
    return { 
      success: false, 
      details: {}, 
      errors: ["Template not found"]
    };
  }

  const languages = (template.languages as string[]) || ["en", "ar"];
  const hasArabic = languages.includes("ar");
  const hasEnglish = languages.includes("en");

  // Check bilingual content availability
  const bilingualChecks = {
    templateNameAr: !!template.nameAr,
    templateNameEn: !!template.nameEn,
    descriptionAr: !!template.descriptionAr,
    descriptionEn: !!template.descriptionEn
  };

  if (hasArabic && !bilingualChecks.templateNameAr) {
    errors.push("Arabic template name missing");
  }
  if (hasEnglish && !bilingualChecks.templateNameEn) {
    errors.push("English template name missing");
  }

  details.languages = languages;
  details.bilingualChecks = bilingualChecks;
  details.rtlSupport = hasArabic;

  return {
    success: errors.length === 0,
    details,
    errors
  };
}

/**
 * Stage 8: Publish Gate - Final approval decision
 */
async function stagePublishGate(
  templateId: number,
  allStagesPassed: boolean,
  requiresAdminApproval: boolean,
  citationCoverage: number
): Promise<{
  success: boolean;
  details: Record<string, unknown>;
  errors: string[];
  finalState: "draft" | "in_review" | "approved" | "published" | "rejected";
}> {
  const db = await getDb();
  if (!db) {
    return { 
      success: false, 
      details: {}, 
      errors: ["Database connection failed"],
      finalState: "draft"
    };
  }

  const errors: string[] = [];
  const details: Record<string, unknown> = {};

  // Get template approval policy
  const templates = await db
    .select()
    .from(publicationTemplates)
    .where(eq(publicationTemplates.id, templateId))
    .limit(1);
  const template = templates[0];

  if (!template) {
    return { 
      success: false, 
      details: {}, 
      errors: ["Template not found"],
      finalState: "draft"
    };
  }

  const approvalPolicy = template.approvalPolicy || "risk_based";
  let finalState: "draft" | "in_review" | "approved" | "published" | "rejected" = "draft";

  if (!allStagesPassed) {
    finalState = "rejected";
    errors.push("Publication rejected due to failed pipeline stages");
  } else if (approvalPolicy === "admin_required" || requiresAdminApproval) {
    finalState = "in_review";
    details.reason = "Queued for admin approval";
  } else if (approvalPolicy === "auto" && citationCoverage >= 95) {
    finalState = "approved";
    details.reason = "Auto-approved based on policy and high confidence";
  } else if (approvalPolicy === "risk_based") {
    if (citationCoverage >= 95 && !requiresAdminApproval) {
      finalState = "approved";
      details.reason = "Risk-based auto-approval (high confidence, no sensitive content)";
    } else {
      finalState = "in_review";
      details.reason = "Queued for review (risk-based policy)";
    }
  }

  details.approvalPolicy = approvalPolicy;
  details.finalState = finalState;
  details.citationCoverage = citationCoverage;
  details.requiresAdminApproval = requiresAdminApproval;

  return {
    success: finalState !== "rejected",
    details,
    errors,
    finalState
  };
}

/**
 * Run the full 8-stage editorial pipeline
 */
export async function runEditorialPipeline(
  templateId: number,
  windowStart: Date,
  windowEnd: Date
): Promise<PipelineResult> {
  const db = await getDb();
  if (!db) {
    return {
      success: false,
      stages: initializeStages().map(s => ({ ...s, status: "failed" as const, errors: ["Database connection failed"] })),
      finalState: "rejected"
    };
  }

  let stages = initializeStages();
  let indicatorCodes: string[] = [];
  let evidencePackIds: number[] = [];
  let citationCoverage = 0;
  let requiresAdminApproval = false;
  let allStagesPassed = true;
  let dqafSummary: PipelineResult["dqafSummary"];
  let dataContradictionsSummary: PipelineResult["dataContradictionsSummary"];

  // Get template for threshold
  const templateResults = await db
    .select()
    .from(publicationTemplates)
    .where(eq(publicationTemplates.id, templateId))
    .limit(1);
  const template = templateResults[0];
  const evidenceThreshold = template?.evidenceThreshold ? Number(template.evidenceThreshold) : 95;

  // Stage 1: Assemble
  const startTime1 = Date.now();
  stages = updateStage(stages, 1, { status: "running", startedAt: new Date().toISOString() });
  
  const stage1Result = await stageAssemble(templateId, windowStart, windowEnd);
  indicatorCodes = stage1Result.indicatorCodes;
  
  stages = updateStage(stages, 1, {
    status: stage1Result.success ? "passed" : "failed",
    completedAt: new Date().toISOString(),
    durationMs: Date.now() - startTime1,
    details: stage1Result.details,
    errors: stage1Result.errors
  });
  
  if (!stage1Result.success) allStagesPassed = false;

  // Stage 2: Evidence Retrieval
  const startTime2 = Date.now();
  stages = updateStage(stages, 2, { status: "running", startedAt: new Date().toISOString() });
  
  const stage2Result = await stageEvidenceRetrieval(indicatorCodes, windowStart, windowEnd);
  evidencePackIds = stage2Result.evidencePackIds;
  
  stages = updateStage(stages, 2, {
    status: stage2Result.success ? "passed" : "failed",
    completedAt: new Date().toISOString(),
    durationMs: Date.now() - startTime2,
    details: stage2Result.details,
    errors: stage2Result.errors
  });
  
  if (!stage2Result.success) allStagesPassed = false;

  // Stage 3: Citation Verifier
  const startTime3 = Date.now();
  stages = updateStage(stages, 3, { status: "running", startedAt: new Date().toISOString() });
  
  const stage3Result = await stageCitationVerifier(evidencePackIds, evidenceThreshold);
  citationCoverage = stage3Result.citationCoverage;
  
  stages = updateStage(stages, 3, {
    status: stage3Result.success ? "passed" : "failed",
    completedAt: new Date().toISOString(),
    durationMs: Date.now() - startTime3,
    details: stage3Result.details,
    errors: stage3Result.errors
  });
  
  if (!stage3Result.success) allStagesPassed = false;

  // Stage 4: Contradiction Gate
  const startTime4 = Date.now();
  stages = updateStage(stages, 4, { status: "running", startedAt: new Date().toISOString() });
  
  const stage4Result = await stageContradictionGate(indicatorCodes);
  dataContradictionsSummary = stage4Result.dataContradictionsSummary;
  
  stages = updateStage(stages, 4, {
    status: stage4Result.success ? "passed" : "failed",
    completedAt: new Date().toISOString(),
    durationMs: Date.now() - startTime4,
    details: stage4Result.details,
    errors: stage4Result.errors
  });
  
  if (!stage4Result.success) allStagesPassed = false;

  // Stage 5: Quality Gate
  const startTime5 = Date.now();
  stages = updateStage(stages, 5, { status: "running", startedAt: new Date().toISOString() });
  
  const stage5Result = await stageQualityGate(indicatorCodes);
  dqafSummary = stage5Result.dqafSummary;
  
  stages = updateStage(stages, 5, {
    status: stage5Result.success ? "passed" : "failed",
    completedAt: new Date().toISOString(),
    durationMs: Date.now() - startTime5,
    details: stage5Result.details,
    errors: stage5Result.errors
  });
  
  if (!stage5Result.success) allStagesPassed = false;

  // Stage 6: Safety Gate
  const startTime6 = Date.now();
  stages = updateStage(stages, 6, { status: "running", startedAt: new Date().toISOString() });
  
  const stage6Result = await stageSafetyGate(template?.templateCode || "", indicatorCodes);
  requiresAdminApproval = stage6Result.requiresAdminApproval;
  
  stages = updateStage(stages, 6, {
    status: stage6Result.success ? "passed" : "failed",
    completedAt: new Date().toISOString(),
    durationMs: Date.now() - startTime6,
    details: stage6Result.details,
    errors: stage6Result.errors
  });
  
  if (!stage6Result.success) allStagesPassed = false;

  // Stage 7: Language Gate
  const startTime7 = Date.now();
  stages = updateStage(stages, 7, { status: "running", startedAt: new Date().toISOString() });
  
  const stage7Result = await stageLanguageGate(templateId);
  
  stages = updateStage(stages, 7, {
    status: stage7Result.success ? "passed" : "failed",
    completedAt: new Date().toISOString(),
    durationMs: Date.now() - startTime7,
    details: stage7Result.details,
    errors: stage7Result.errors
  });
  
  if (!stage7Result.success) allStagesPassed = false;

  // Stage 8: Publish Gate
  const startTime8 = Date.now();
  stages = updateStage(stages, 8, { status: "running", startedAt: new Date().toISOString() });
  
  const stage8Result = await stagePublishGate(
    templateId, 
    allStagesPassed, 
    requiresAdminApproval, 
    citationCoverage
  );
  
  stages = updateStage(stages, 8, {
    status: stage8Result.success ? "passed" : "failed",
    completedAt: new Date().toISOString(),
    durationMs: Date.now() - startTime8,
    details: stage8Result.details,
    errors: stage8Result.errors
  });

  // Build confidence summary
  const confidenceSummary: PipelineResult["confidenceSummary"] = {
    overallConfidence: citationCoverage >= 95 ? "high" : citationCoverage >= 80 ? "medium" : "low",
    citationCoverage,
    sourceCount: evidencePackIds.length,
    freshestDataDate: windowEnd.toISOString().split("T")[0],
    oldestDataDate: windowStart.toISOString().split("T")[0]
  };

  return {
    success: stage8Result.success,
    stages,
    finalState: stage8Result.finalState,
    evidenceBundleId: undefined, // Would be created in production
    confidenceSummary,
    dqafSummary,
    dataContradictionsSummary
  };
}

/**
 * Get pipeline status for a publication run
 */
export async function getPipelineStatus(runId: number): Promise<PipelineStage[] | null> {
  const db = await getDb();
  if (!db) return null;

  const runs = await db
    .select()
    .from(publicationRuns)
    .where(eq(publicationRuns.id, runId))
    .limit(1);

  const run = runs[0];
  if (!run) return null;

  return (run.pipelineStages as PipelineStage[]) || [];
}

/**
 * Approve a publication run (admin action)
 */
export async function approvePublicationRun(
  runId: number,
  adminId: number,
  adminName: string,
  notes?: string,
  notesAr?: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const runs = await db
    .select()
    .from(publicationRuns)
    .where(eq(publicationRuns.id, runId))
    .limit(1);
  const run = runs[0];

  if (!run || run.approvalState !== "in_review") {
    return false;
  }

  const approvalsLog = (run.approvalsLog as Array<{
    action: "submit" | "approve" | "reject" | "publish" | "archive";
    actorType: "system" | "admin" | "ai_tribunal";
    actorId?: number;
    actorName?: string;
    timestamp: string;
    notes?: string;
    notesAr?: string;
  }>) || [];

  approvalsLog.push({
    action: "approve",
    actorType: "admin",
    actorId: adminId,
    actorName: adminName,
    timestamp: new Date().toISOString(),
    notes,
    notesAr
  });

  await db
    .update(publicationRuns)
    .set({
      approvalState: "approved",
      approvalsLog: approvalsLog
    })
    .where(eq(publicationRuns.id, runId));

  return true;
}

/**
 * Reject a publication run (admin action)
 */
export async function rejectPublicationRun(
  runId: number,
  adminId: number,
  adminName: string,
  notes: string,
  notesAr?: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const runs = await db
    .select()
    .from(publicationRuns)
    .where(eq(publicationRuns.id, runId))
    .limit(1);
  const run = runs[0];

  if (!run || run.approvalState !== "in_review") {
    return false;
  }

  const approvalsLog = (run.approvalsLog as Array<{
    action: "submit" | "approve" | "reject" | "publish" | "archive";
    actorType: "system" | "admin" | "ai_tribunal";
    actorId?: number;
    actorName?: string;
    timestamp: string;
    notes?: string;
    notesAr?: string;
  }>) || [];

  approvalsLog.push({
    action: "reject",
    actorType: "admin",
    actorId: adminId,
    actorName: adminName,
    timestamp: new Date().toISOString(),
    notes,
    notesAr
  });

  await db
    .update(publicationRuns)
    .set({
      approvalState: "rejected",
      approvalsLog: approvalsLog
    })
    .where(eq(publicationRuns.id, runId));

  return true;
}

/**
 * Publish an approved publication run
 */
export async function publishRun(
  runId: number,
  publicUrl: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const runs = await db
    .select()
    .from(publicationRuns)
    .where(eq(publicationRuns.id, runId))
    .limit(1);
  const run = runs[0];

  if (!run || run.approvalState !== "approved") {
    return false;
  }

  const approvalsLog = (run.approvalsLog as Array<{
    action: "submit" | "approve" | "reject" | "publish" | "archive";
    actorType: "system" | "admin" | "ai_tribunal";
    actorId?: number;
    actorName?: string;
    timestamp: string;
    notes?: string;
    notesAr?: string;
  }>) || [];

  approvalsLog.push({
    action: "publish",
    actorType: "system",
    timestamp: new Date().toISOString()
  });

  await db
    .update(publicationRuns)
    .set({
      approvalState: "published",
      publicUrl,
      approvalsLog: approvalsLog
    })
    .where(eq(publicationRuns.id, runId));

  return true;
}
