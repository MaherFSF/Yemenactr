/**
 * Partner Moderation Service
 * Dual-lane publishing workflow for partner data
 * 
 * Lane A: Public aggregate publishing (requires QA signoff + evidence coverage)
 * Lane B: Restricted internal use (faster path, admin review only)
 */

import { getDb } from "../db";
import { 
  moderationQueue, 
  partnerSubmissions,
  submissionValidations,
  governancePolicies,
  adminAuditLog
} from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { validateSubmission } from "./partnerValidationService";

// Types
type ModerationStatus = 
  | "received"
  | "validating"
  | "failed_validation"
  | "quarantined"
  | "pending_review"
  | "approved_restricted"
  | "approved_public_aggregate"
  | "published"
  | "rejected";

type PublishingLane = "lane_a_public" | "lane_b_restricted" | "none";

interface ModerationDecision {
  status: ModerationStatus;
  lane: PublishingLane;
  notes?: string;
  rejectionReason?: string;
}

interface PolicyValue {
  value?: number;
  enabled?: boolean;
}

/**
 * Start moderation workflow for a submission
 */
export async function startModerationWorkflow(submissionId: number, contractId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Create moderation queue entry
  const [entry] = await db.insert(moderationQueue).values({
    submissionId,
    status: "received"
  }).$returningId();

  // Update to validating status
  await db.update(moderationQueue)
    .set({ status: "validating" })
    .where(eq(moderationQueue.id, entry.id));

  // Run validation
  try {
    const validationResult = await validateSubmission(submissionId, contractId);

    // Get validation record
    const [validation] = await db
      .select()
      .from(submissionValidations)
      .where(eq(submissionValidations.submissionId, submissionId))
      .orderBy(desc(submissionValidations.validatedAt))
      .limit(1);

    if (!validationResult.overall.passed) {
      // Failed validation - check if should quarantine
      const shouldQuarantine = await checkQuarantinePolicy();
      
      await db.update(moderationQueue)
        .set({
          status: shouldQuarantine ? "quarantined" : "failed_validation",
          validationId: validation?.id
        })
        .where(eq(moderationQueue.id, entry.id));

      return {
        success: false,
        status: shouldQuarantine ? "quarantined" : "failed_validation",
        validationResult
      };
    }

    // Validation passed - move to pending review
    await db.update(moderationQueue)
      .set({
        status: "pending_review",
        validationId: validation?.id
      })
      .where(eq(moderationQueue.id, entry.id));

    return {
      success: true,
      status: "pending_review",
      validationResult
    };
  } catch (error) {
    await db.update(moderationQueue)
      .set({ status: "failed_validation" })
      .where(eq(moderationQueue.id, entry.id));

    throw error;
  }
}

/**
 * Review and make moderation decision
 */
export async function reviewSubmission(
  queueId: number,
  decision: ModerationDecision,
  reviewerId: number,
  reviewerName?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get current queue entry
  const [entry] = await db
    .select()
    .from(moderationQueue)
    .where(eq(moderationQueue.id, queueId))
    .limit(1);

  if (!entry) throw new Error("Queue entry not found");

  // Update moderation queue
  await db.update(moderationQueue)
    .set({
      status: decision.status,
      publishingLane: decision.lane,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      reviewNotes: decision.notes,
      rejectionReason: decision.rejectionReason,
      updatedAt: new Date()
    })
    .where(eq(moderationQueue.id, queueId));

  // Log audit entry
  await db.insert(adminAuditLog).values({
    userId: reviewerId,
    userName: reviewerName,
    action: "moderation_review",
    actionCategory: "moderation",
    targetType: "submission",
    targetId: String(entry.submissionId),
    newValue: decision
  });

  return { success: true };
}

/**
 * QA signoff for public publishing (Lane A)
 */
export async function qaSignoff(
  queueId: number,
  qaUserId: number,
  qaUserName?: string,
  notes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get current queue entry
  const [entry] = await db
    .select()
    .from(moderationQueue)
    .where(eq(moderationQueue.id, queueId))
    .limit(1);

  if (!entry) throw new Error("Queue entry not found");

  // Check evidence coverage requirement
  const evidenceCoverageThreshold = await getPolicyValue("evidence_coverage_threshold");
  const currentCoverage = Number(entry.evidenceCoverage) || 0;

  if (currentCoverage < (evidenceCoverageThreshold?.value || 95)) {
    throw new Error(`Evidence coverage (${currentCoverage}%) below threshold (${evidenceCoverageThreshold?.value || 95}%)`);
  }

  // Update with QA signoff
  await db.update(moderationQueue)
    .set({
      qaSignoffBy: qaUserId,
      qaSignoffAt: new Date(),
      qaSignoffNotes: notes,
      status: "approved_public_aggregate",
      publishingLane: "lane_a_public",
      updatedAt: new Date()
    })
    .where(eq(moderationQueue.id, queueId));

  // Log audit entry
  await db.insert(adminAuditLog).values({
    userId: qaUserId,
    userName: qaUserName,
    action: "qa_signoff",
    actionCategory: "moderation",
    targetType: "submission",
    targetId: String(entry.submissionId),
    newValue: { notes, evidenceCoverage: currentCoverage }
  });

  return { success: true };
}

/**
 * Publish approved submission
 */
export async function publishSubmission(queueId: number, publisherId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get current queue entry
  const [entry] = await db
    .select()
    .from(moderationQueue)
    .where(eq(moderationQueue.id, queueId))
    .limit(1);

  if (!entry) throw new Error("Queue entry not found");

  // Verify approval status
  if (entry.status !== "approved_restricted" && entry.status !== "approved_public_aggregate") {
    throw new Error("Submission must be approved before publishing");
  }

  // For Lane A (public), verify QA signoff
  if (entry.publishingLane === "lane_a_public" && !entry.qaSignoffBy) {
    throw new Error("QA signoff required for public publishing");
  }

  // Update status to published
  await db.update(moderationQueue)
    .set({
      status: "published",
      updatedAt: new Date()
    })
    .where(eq(moderationQueue.id, queueId));

  // Update submission status
  await db.update(partnerSubmissions)
    .set({
      status: "approved",
      reviewedAt: new Date()
    })
    .where(eq(partnerSubmissions.id, entry.submissionId));

  // Log audit entry
  await db.insert(adminAuditLog).values({
    userId: publisherId,
    action: "publish_submission",
    actionCategory: "publication",
    targetType: "submission",
    targetId: String(entry.submissionId),
    newValue: { lane: entry.publishingLane }
  });

  return { success: true, lane: entry.publishingLane };
}

/**
 * Get moderation queue with filters
 */
export async function getModerationQueue(filters?: {
  status?: ModerationStatus;
  lane?: PublishingLane;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db
    .select({
      queue: moderationQueue,
      submission: partnerSubmissions,
      validation: submissionValidations
    })
    .from(moderationQueue)
    .leftJoin(partnerSubmissions, eq(moderationQueue.submissionId, partnerSubmissions.id))
    .leftJoin(submissionValidations, eq(moderationQueue.validationId, submissionValidations.id))
    .orderBy(desc(moderationQueue.createdAt))
    .$dynamic();

  if (filters?.status) {
    query = query.where(eq(moderationQueue.status, filters.status));
  }

  if (filters?.lane) {
    query = query.where(eq(moderationQueue.publishingLane, filters.lane));
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.offset(filters.offset);
  }

  return query;
}

/**
 * Get moderation statistics
 */
export async function getModerationStats() {
  const db = await getDb();
  if (!db) return null;

  const stats = await db
    .select({
      status: moderationQueue.status,
      count: sql<number>`COUNT(*)`.as("count")
    })
    .from(moderationQueue)
    .groupBy(moderationQueue.status);

  const laneStats = await db
    .select({
      lane: moderationQueue.publishingLane,
      count: sql<number>`COUNT(*)`.as("count")
    })
    .from(moderationQueue)
    .where(eq(moderationQueue.status, "published"))
    .groupBy(moderationQueue.publishingLane);

  return {
    byStatus: stats.reduce((acc, s) => ({ ...acc, [s.status]: s.count }), {}),
    byLane: laneStats.reduce((acc, l) => ({ ...acc, [l.lane || 'none']: l.count }), {} as Record<string, number>)
  };
}

/**
 * Check if auto-quarantine policy is enabled
 */
async function checkQuarantinePolicy(): Promise<boolean> {
  const policy = await getPolicyValue("contradiction_auto_quarantine");
  return policy?.enabled ?? true;
}

/**
 * Get policy value by key
 */
async function getPolicyValue(policyKey: string): Promise<PolicyValue | null> {
  const db = await getDb();
  if (!db) return null;

  const [policy] = await db
    .select()
    .from(governancePolicies)
    .where(eq(governancePolicies.policyKey, policyKey))
    .limit(1);

  return policy?.policyValue as PolicyValue || null;
}

/**
 * Update evidence coverage for a queue entry
 */
export async function updateEvidenceCoverage(queueId: number, coverage: number, evidencePackId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(moderationQueue)
    .set({
      evidenceCoverage: coverage.toString(),
      evidencePackId,
      updatedAt: new Date()
    })
    .where(eq(moderationQueue.id, queueId));

  return { success: true };
}
