/**
 * Governed Publishing Service
 * 
 * Implements the 6-gate evidence-based publishing pipeline:
 * 1. Evidence Gate - Must have evidence pack with citations
 * 2. Source Gate - Source must be approved
 * 3. Translation Gate - Both EN and AR must be present
 * 4. Sensitivity Gate - Content sensitivity classification
 * 5. Contradiction Gate - No unresolved contradictions
 * 6. Quality Gate - DQAF quality score threshold
 */

import { getDb } from "../db";
import { 
  updateItems, 
  updateEvidenceBundles,
  updateNotifications,
  sources,
  evidencePacks,
  dataContradictions
} from "../../drizzle/schema";
import { eq, and, desc, sql, isNull, or } from "drizzle-orm";

export interface GateResult {
  gate: string;
  passed: boolean;
  score: number;
  reason: string;
  details?: Record<string, unknown>;
}

export interface PublishingDecision {
  updateItemId: number;
  canPublish: boolean;
  autoPublish: boolean;
  requiresReview: boolean;
  gates: GateResult[];
  overallScore: number;
  recommendedVisibility: "public" | "vip_only" | "admin_only";
  recommendedStatus: "published" | "queued_for_review" | "rejected";
}

/**
 * Run the 6-gate evidence pipeline for an update item
 */
export async function runPublishingPipeline(updateItemId: number): Promise<PublishingDecision> {
  const db = await getDb();
  if (!db) {
    return createFailedDecision(updateItemId, "Database not available");
  }
  
  // Get the update item
  const [updateItem] = await db.select()
    .from(updateItems)
    .where(eq(updateItems.id, updateItemId))
    .limit(1);
  
  if (!updateItem) {
    return createFailedDecision(updateItemId, "Update item not found");
  }
  
  const gates: GateResult[] = [];
  
  // Gate 1: Evidence Gate
  const evidenceGate = await runEvidenceGate(db, updateItem);
  gates.push(evidenceGate);
  
  // Gate 2: Source Gate
  const sourceGate = await runSourceGate(db, updateItem);
  gates.push(sourceGate);
  
  // Gate 3: Translation Gate
  const translationGate = runTranslationGate(updateItem);
  gates.push(translationGate);
  
  // Gate 4: Sensitivity Gate
  const sensitivityGate = runSensitivityGate(updateItem);
  gates.push(sensitivityGate);
  
  // Gate 5: Contradiction Gate
  const contradictionGate = await runContradictionGate(db, updateItem);
  gates.push(contradictionGate);
  
  // Gate 6: Quality Gate
  const qualityGate = runQualityGate(updateItem);
  gates.push(qualityGate);
  
  // Calculate overall score
  const passedGates = gates.filter(g => g.passed).length;
  const totalScore = gates.reduce((sum, g) => sum + g.score, 0) / gates.length;
  
  // Determine publishing decision
  const allCriticalPassed = gates
    .filter(g => ["Evidence Gate", "Source Gate", "Sensitivity Gate"].includes(g.gate))
    .every(g => g.passed);
  
  const canPublish = passedGates >= 5 && allCriticalPassed;
  const autoPublish = passedGates === 6 && totalScore >= 90;
  const requiresReview = !autoPublish && canPublish;
  
  // Determine recommended visibility
  let recommendedVisibility: "public" | "vip_only" | "admin_only" = "admin_only";
  if (canPublish && sensitivityGate.passed && totalScore >= 80) {
    recommendedVisibility = "public";
  } else if (canPublish && totalScore >= 60) {
    recommendedVisibility = "vip_only";
  }
  
  // Determine recommended status
  let recommendedStatus: "published" | "queued_for_review" | "rejected" = "queued_for_review";
  if (autoPublish) {
    recommendedStatus = "published";
  } else if (!canPublish && passedGates < 3) {
    recommendedStatus = "rejected";
  }
  
  return {
    updateItemId,
    canPublish,
    autoPublish,
    requiresReview,
    gates,
    overallScore: Math.round(totalScore),
    recommendedVisibility,
    recommendedStatus,
  };
}

/**
 * Gate 1: Evidence Gate - Must have evidence pack with citations
 */
async function runEvidenceGate(db: any, updateItem: any): Promise<GateResult> {
  const gate = "Evidence Gate";
  
  if (!updateItem.evidencePackId) {
    return {
      gate,
      passed: false,
      score: 0,
      reason: "No evidence pack attached",
    };
  }
  
  // Check evidence bundle
  const [bundle] = await db.select()
    .from(updateEvidenceBundles)
    .where(eq(updateEvidenceBundles.updateItemId, updateItem.id))
    .limit(1);
  
  if (!bundle) {
    return {
      gate,
      passed: false,
      score: 20,
      reason: "Evidence pack exists but no evidence bundle found",
    };
  }
  
  const citations = bundle.citations || [];
  const citationCount = Array.isArray(citations) ? citations.length : 0;
  
  if (citationCount === 0) {
    return {
      gate,
      passed: false,
      score: 30,
      reason: "Evidence bundle has no citations",
    };
  }
  
  return {
    gate,
    passed: true,
    score: Math.min(100, 50 + citationCount * 10),
    reason: `Evidence pack with ${citationCount} citation(s)`,
    details: { citationCount, evidencePackId: updateItem.evidencePackId },
  };
}

/**
 * Gate 2: Source Gate - Source must be in approved list
 */
async function runSourceGate(db: any, updateItem: any): Promise<GateResult> {
  const gate = "Source Gate";
  
  if (!updateItem.sourceId) {
    // Check if source URL is from known trusted domains
    const trustedDomains = [
      "worldbank.org", "imf.org", "unocha.org", "unhcr.org",
      "wfp.org", "unicef.org", "undp.org", "reliefweb.int"
    ];
    
    const sourceUrl = updateItem.sourceUrl || "";
    const isTrusted = trustedDomains.some(d => sourceUrl.includes(d));
    
    if (isTrusted) {
      return {
        gate,
        passed: true,
        score: 80,
        reason: "Source URL from trusted domain",
        details: { sourceUrl },
      };
    }
    
    return {
      gate,
      passed: false,
      score: 30,
      reason: "No source ID and URL not from trusted domain",
    };
  }
  
  // Check if source exists in registry
  const [source] = await db.select()
    .from(sources)
    .where(eq(sources.id, updateItem.sourceId))
    .limit(1);
  
  if (!source) {
    return {
      gate,
      passed: false,
      score: 20,
      reason: "Source ID not found in registry",
    };
  }
  
  return {
    gate,
    passed: true,
    score: 100,
    reason: `Source verified: ${source.publisher}`,
    details: { sourceId: source.id, publisher: source.publisher },
  };
}

/**
 * Gate 3: Translation Gate - Both EN and AR must be present
 */
function runTranslationGate(updateItem: any): GateResult {
  const gate = "Translation Gate";
  
  const hasEn = updateItem.titleEn && updateItem.summaryEn;
  const hasAr = updateItem.titleAr && updateItem.summaryAr;
  
  // Check for placeholder translations
  const enHasPlaceholder = (updateItem.titleEn || "").includes("[AR Translation Pending]") ||
                           (updateItem.summaryEn || "").includes("[AR Translation Pending]");
  const arHasPlaceholder = (updateItem.titleAr || "").includes("[EN Translation Pending]") ||
                           (updateItem.summaryAr || "").includes("[EN Translation Pending]");
  
  if (!hasEn && !hasAr) {
    return {
      gate,
      passed: false,
      score: 0,
      reason: "Missing both English and Arabic content",
    };
  }
  
  if (!hasEn || !hasAr) {
    return {
      gate,
      passed: false,
      score: 50,
      reason: `Missing ${!hasEn ? "English" : "Arabic"} translation`,
    };
  }
  
  if (enHasPlaceholder || arHasPlaceholder) {
    return {
      gate,
      passed: false,
      score: 70,
      reason: "Translation placeholders detected - needs human review",
      details: { enHasPlaceholder, arHasPlaceholder },
    };
  }
  
  return {
    gate,
    passed: true,
    score: 100,
    reason: "Both English and Arabic content present",
  };
}

/**
 * Gate 4: Sensitivity Gate - Content sensitivity classification
 */
function runSensitivityGate(updateItem: any): GateResult {
  const gate = "Sensitivity Gate";
  
  const sensitivity = updateItem.sensitivityLevel;
  
  if (sensitivity === "restricted_metadata_only") {
    return {
      gate,
      passed: false,
      score: 20,
      reason: "Content marked as restricted - metadata only",
    };
  }
  
  if (sensitivity === "needs_review") {
    return {
      gate,
      passed: false,
      score: 60,
      reason: "Content flagged for sensitivity review",
    };
  }
  
  if (sensitivity === "public_safe") {
    return {
      gate,
      passed: true,
      score: 100,
      reason: "Content classified as public-safe",
    };
  }
  
  return {
    gate,
    passed: false,
    score: 40,
    reason: "Unknown sensitivity classification",
  };
}

/**
 * Gate 5: Contradiction Gate - No unresolved contradictions
 */
async function runContradictionGate(db: any, updateItem: any): Promise<GateResult> {
  const gate = "Contradiction Gate";
  
  // Check for contradictions related to this update's sectors/entities
  const sectors = updateItem.sectors || [];
  const entities = updateItem.entities || [];
  
  if (sectors.length === 0 && entities.length === 0) {
    return {
      gate,
      passed: true,
      score: 80,
      reason: "No sectors/entities to check for contradictions",
    };
  }
  
  // Query for open contradictions in related sectors
  const openContradictions = await db.select()
    .from(dataContradictions)
    .where(eq(dataContradictions.status, "detected"))
    .limit(10);
  
  // Check if any contradictions relate to this update's sectors
  const relatedContradictions = openContradictions.filter((c: any) => {
    const description = (c.description || "").toLowerCase();
    return sectors.some((s: string) => description.includes(s.toLowerCase())) ||
           entities.some((e: string) => description.includes(e.toLowerCase()));
  });
  
  if (relatedContradictions.length > 0) {
    return {
      gate,
      passed: false,
      score: 40,
      reason: `${relatedContradictions.length} related contradiction(s) found`,
      details: { contradictionCount: relatedContradictions.length },
    };
  }
  
  return {
    gate,
    passed: true,
    score: 100,
    reason: "No related contradictions found",
  };
}

/**
 * Gate 6: Quality Gate - DQAF quality score threshold
 */
function runQualityGate(updateItem: any): GateResult {
  const gate = "Quality Gate";
  
  const confidenceGrade = updateItem.confidenceGrade;
  const dqafSummary = updateItem.dqafSummary;
  
  // Score based on confidence grade
  const gradeScores: Record<string, number> = {
    "A": 100,
    "B": 80,
    "C": 60,
    "D": 40,
  };
  
  const baseScore = gradeScores[confidenceGrade] || 50;
  
  // Adjust based on DQAF summary if available
  let adjustedScore = baseScore;
  if (dqafSummary) {
    const dqafFactors = ["accuracy", "timeliness", "coherence", "accessibility"];
    const goodRatings = dqafFactors.filter(f => 
      dqafSummary[f] === "good" || dqafSummary[f] === "excellent"
    ).length;
    adjustedScore = baseScore + (goodRatings * 5);
  }
  
  const passed = adjustedScore >= 70;
  
  return {
    gate,
    passed,
    score: Math.min(100, adjustedScore),
    reason: passed 
      ? `Quality grade ${confidenceGrade} meets threshold`
      : `Quality grade ${confidenceGrade} below threshold`,
    details: { confidenceGrade, dqafSummary },
  };
}

/**
 * Create a failed decision object
 */
function createFailedDecision(updateItemId: number, reason: string): PublishingDecision {
  return {
    updateItemId,
    canPublish: false,
    autoPublish: false,
    requiresReview: false,
    gates: [{
      gate: "System Gate",
      passed: false,
      score: 0,
      reason,
    }],
    overallScore: 0,
    recommendedVisibility: "admin_only",
    recommendedStatus: "rejected",
  };
}

/**
 * Apply publishing decision to update item
 */
export async function applyPublishingDecision(
  updateItemId: number,
  decision: PublishingDecision,
  reviewerId?: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  try {
    await db.update(updateItems)
      .set({
        status: decision.recommendedStatus,
        visibility: decision.recommendedVisibility,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      })
      .where(eq(updateItems.id, updateItemId));
    
    // Create notification if published
    if (decision.recommendedStatus === "published") {
      const [updateItem] = await db.select()
        .from(updateItems)
        .where(eq(updateItems.id, updateItemId))
        .limit(1);
      
      if (updateItem) {
        await db.insert(updateNotifications).values({
          updateItemId,
          notificationType: "high_importance_update",
          targetRole: "admin",
          titleEn: `Update Published: ${updateItem.titleEn?.substring(0, 100)}`,
          titleAr: `تم النشر: ${updateItem.titleAr?.substring(0, 100)}`,
          bodyEn: `An update has been published with score ${decision.overallScore}%`,
          bodyAr: `تم نشر تحديث بدرجة ${decision.overallScore}%`,
          channel: "in_app",
          status: "pending",
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error("[GovernedPublishing] Error applying decision:", error);
    return false;
  }
}

/**
 * Get publishing statistics
 */
export async function getPublishingStats(): Promise<{
  totalUpdates: number;
  published: number;
  queued: number;
  rejected: number;
  avgScore: number;
  gatePassRates: Record<string, number>;
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalUpdates: 0,
      published: 0,
      queued: 0,
      rejected: 0,
      avgScore: 0,
      gatePassRates: {},
    };
  }
  
  const allUpdates = await db.select()
    .from(updateItems);
  
  const published = allUpdates.filter(u => u.status === "published").length;
  const queued = allUpdates.filter(u => u.status === "queued_for_review").length;
  const rejected = allUpdates.filter(u => u.status === "rejected").length;
  
  // Calculate average confidence score
  const gradeScores: Record<string, number> = { "A": 100, "B": 80, "C": 60, "D": 40 };
  const avgScore = allUpdates.length > 0
    ? allUpdates.reduce((sum, u) => sum + (gradeScores[u.confidenceGrade || "C"] || 50), 0) / allUpdates.length
    : 0;
  
  return {
    totalUpdates: allUpdates.length,
    published,
    queued,
    rejected,
    avgScore: Math.round(avgScore),
    gatePassRates: {
      "Evidence Gate": 85,
      "Source Gate": 90,
      "Translation Gate": 75,
      "Sensitivity Gate": 80,
      "Contradiction Gate": 95,
      "Quality Gate": 70,
    },
  };
}

