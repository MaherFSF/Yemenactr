/**
 * Decision Journal Service
 * 
 * Provides decision tracking and outcome analysis for VIP users:
 * - Create and manage decision entries
 * - Track expected vs actual outcomes
 * - Generate lessons learned
 * - Follow-up management
 */

import { getDb } from "../db";
import { 
  decisionJournalEntries, 
  decisionOutcomes, 
  decisionFollowUps,
  users
} from "../../drizzle/schema";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";

// Types
export interface DecisionEntry {
  id: number;
  decisionCode: string;
  title: string;
  titleAr?: string;
  contextSummary: string;
  contextSummaryAr?: string;
  keySignals?: string[];
  keyDrivers?: string[];
  decision: string;
  decisionAr?: string;
  rationale: string;
  rationaleAr?: string;
  alternativesConsidered?: Array<{
    title: string;
    titleAr?: string;
    whyRejected: string;
    whyRejectedAr?: string;
  }>;
  expectedOutcomes?: Array<{
    outcome: string;
    outcomeAr?: string;
    metric?: string;
    targetValue?: number;
    timeframe?: string;
  }>;
  identifiedRisks?: Array<{
    risk: string;
    riskAr?: string;
    likelihood: "high" | "medium" | "low";
    impact: "high" | "medium" | "low";
    mitigation?: string;
  }>;
  confidenceLevel: "high" | "medium" | "low";
  confidenceExplanation?: string;
  evidencePackId?: number;
  supportingDocuments?: string[];
  status: "draft" | "active" | "implemented" | "abandoned" | "superseded";
  decisionDate: Date;
  implementationDeadline?: Date;
  reviewDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Outcome {
  id: number;
  decisionId: number;
  outcomeCode: string;
  expectedOutcomeIndex?: number;
  actualOutcome: string;
  actualOutcomeAr?: string;
  actualValue?: number;
  outcomeStatus: "achieved" | "partially_achieved" | "not_achieved" | "unexpected";
  variancePercent?: number;
  analysisNotes?: string;
  analysisNotesAr?: string;
  lessonsLearned?: string;
  lessonsLearnedAr?: string;
  evidencePackId?: number;
  observedAt: Date;
  recordedBy?: number;
  createdAt: Date;
}

export interface FollowUp {
  id: number;
  decisionId: number;
  followUpType: "review" | "action" | "update" | "escalation";
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  assignedTo?: number;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "high" | "medium" | "low";
  dueDate?: Date;
  completedAt?: Date;
  createdBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a new decision journal entry
 */
export async function createDecisionEntry(
  userId: number,
  roleProfileId: number | null,
  data: {
    title: string;
    titleAr?: string;
    contextSummary: string;
    contextSummaryAr?: string;
    keySignals?: string[];
    keyDrivers?: string[];
    decision: string;
    decisionAr?: string;
    rationale: string;
    rationaleAr?: string;
    alternativesConsidered?: DecisionEntry["alternativesConsidered"];
    expectedOutcomes?: DecisionEntry["expectedOutcomes"];
    identifiedRisks?: DecisionEntry["identifiedRisks"];
    confidenceLevel?: "high" | "medium" | "low";
    confidenceExplanation?: string;
    evidencePackId?: number;
    supportingDocuments?: string[];
    decisionDate?: Date;
    implementationDeadline?: Date;
    reviewDate?: Date;
  }
): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const decisionCode = `DEC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const [result] = await db.insert(decisionJournalEntries).values({
    userId,
    roleProfileId,
    decisionCode,
    title: data.title,
    titleAr: data.titleAr,
    contextSummary: data.contextSummary,
    contextSummaryAr: data.contextSummaryAr,
    keySignals: data.keySignals,
    keyDrivers: data.keyDrivers,
    decision: data.decision,
    decisionAr: data.decisionAr,
    rationale: data.rationale,
    rationaleAr: data.rationaleAr,
    alternativesConsidered: data.alternativesConsidered,
    expectedOutcomes: data.expectedOutcomes,
    identifiedRisks: data.identifiedRisks,
    confidenceLevel: data.confidenceLevel || "medium",
    confidenceExplanation: data.confidenceExplanation,
    evidencePackId: data.evidencePackId,
    supportingDocuments: data.supportingDocuments,
    status: "draft",
    decisionDate: data.decisionDate || new Date(),
    implementationDeadline: data.implementationDeadline,
    reviewDate: data.reviewDate,
  }).$returningId();

  return result;
}

/**
 * Get decision entries for a user
 */
export async function getUserDecisions(
  userId: number,
  options?: {
    roleProfileId?: number;
    status?: DecisionEntry["status"];
    limit?: number;
    offset?: number;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [eq(decisionJournalEntries.userId, userId)];
  
  if (options?.roleProfileId) {
    conditions.push(eq(decisionJournalEntries.roleProfileId, options.roleProfileId));
  }
  
  if (options?.status) {
    conditions.push(eq(decisionJournalEntries.status, options.status));
  }

  const entries = await db.select()
    .from(decisionJournalEntries)
    .where(and(...conditions))
    .orderBy(desc(decisionJournalEntries.decisionDate))
    .limit(options?.limit || 50)
    .offset(options?.offset || 0);

  return entries;
}

/**
 * Get a single decision entry by ID
 */
export async function getDecisionEntry(decisionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [entry] = await db.select()
    .from(decisionJournalEntries)
    .where(eq(decisionJournalEntries.id, decisionId))
    .limit(1);

  return entry;
}

/**
 * Update a decision entry
 */
export async function updateDecisionEntry(
  decisionId: number,
  userId: number,
  data: Partial<{
    title: string;
    titleAr: string;
    contextSummary: string;
    contextSummaryAr: string;
    decision: string;
    decisionAr: string;
    rationale: string;
    rationaleAr: string;
    alternativesConsidered: DecisionEntry["alternativesConsidered"];
    expectedOutcomes: DecisionEntry["expectedOutcomes"];
    identifiedRisks: DecisionEntry["identifiedRisks"];
    confidenceLevel: "high" | "medium" | "low";
    confidenceExplanation: string;
    status: DecisionEntry["status"];
    implementationDeadline: Date;
    reviewDate: Date;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verify ownership
  const [existing] = await db.select()
    .from(decisionJournalEntries)
    .where(and(
      eq(decisionJournalEntries.id, decisionId),
      eq(decisionJournalEntries.userId, userId)
    ))
    .limit(1);

  if (!existing) {
    throw new Error("Decision not found or access denied");
  }

  await db.update(decisionJournalEntries)
    .set(data)
    .where(eq(decisionJournalEntries.id, decisionId));

  return { success: true };
}

/**
 * Record an outcome for a decision
 */
export async function recordOutcome(
  decisionId: number,
  recordedBy: number,
  data: {
    expectedOutcomeIndex?: number;
    actualOutcome: string;
    actualOutcomeAr?: string;
    actualValue?: number;
    outcomeStatus: Outcome["outcomeStatus"];
    variancePercent?: number;
    analysisNotes?: string;
    analysisNotesAr?: string;
    lessonsLearned?: string;
    lessonsLearnedAr?: string;
    evidencePackId?: number;
    observedAt?: Date;
  }
): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const outcomeCode = `OUT-${decisionId}-${Date.now()}`;

  const [result] = await db.insert(decisionOutcomes).values({
    decisionId,
    outcomeCode,
    expectedOutcomeIndex: data.expectedOutcomeIndex,
    actualOutcome: data.actualOutcome,
    actualOutcomeAr: data.actualOutcomeAr,
    actualValue: data.actualValue?.toString(),
    outcomeStatus: data.outcomeStatus,
    variancePercent: data.variancePercent?.toString(),
    analysisNotes: data.analysisNotes,
    analysisNotesAr: data.analysisNotesAr,
    lessonsLearned: data.lessonsLearned,
    lessonsLearnedAr: data.lessonsLearnedAr,
    evidencePackId: data.evidencePackId,
    observedAt: data.observedAt || new Date(),
    recordedBy,
  }).$returningId();

  return result;
}

/**
 * Get outcomes for a decision
 */
export async function getDecisionOutcomes(decisionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select()
    .from(decisionOutcomes)
    .where(eq(decisionOutcomes.decisionId, decisionId))
    .orderBy(desc(decisionOutcomes.observedAt));
}

/**
 * Create a follow-up for a decision
 */
export async function createFollowUp(
  decisionId: number,
  createdBy: number,
  data: {
    followUpType: FollowUp["followUpType"];
    title: string;
    titleAr?: string;
    description: string;
    descriptionAr?: string;
    assignedTo?: number;
    priority?: FollowUp["priority"];
    dueDate?: Date;
  }
): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(decisionFollowUps).values({
    decisionId,
    followUpType: data.followUpType,
    title: data.title,
    titleAr: data.titleAr,
    description: data.description,
    descriptionAr: data.descriptionAr,
    assignedTo: data.assignedTo,
    status: "pending",
    priority: data.priority || "medium",
    dueDate: data.dueDate,
    createdBy,
  }).$returningId();

  return result;
}

/**
 * Get follow-ups for a decision
 */
export async function getDecisionFollowUps(decisionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select()
    .from(decisionFollowUps)
    .where(eq(decisionFollowUps.decisionId, decisionId))
    .orderBy(desc(decisionFollowUps.createdAt));
}

/**
 * Update a follow-up status
 */
export async function updateFollowUpStatus(
  followUpId: number,
  status: FollowUp["status"],
  completedAt?: Date
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(decisionFollowUps)
    .set({
      status,
      completedAt: status === "completed" ? (completedAt || new Date()) : undefined,
    })
    .where(eq(decisionFollowUps.id, followUpId));

  return { success: true };
}

/**
 * Get pending follow-ups for a user
 */
export async function getPendingFollowUps(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select({
    followUp: decisionFollowUps,
    decision: decisionJournalEntries,
  })
    .from(decisionFollowUps)
    .innerJoin(decisionJournalEntries, eq(decisionFollowUps.decisionId, decisionJournalEntries.id))
    .where(and(
      eq(decisionJournalEntries.userId, userId),
      eq(decisionFollowUps.status, "pending")
    ))
    .orderBy(decisionFollowUps.dueDate);
}

/**
 * Get decision statistics for a user
 */
export async function getDecisionStats(userId: number, roleProfileId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [eq(decisionJournalEntries.userId, userId)];
  if (roleProfileId) {
    conditions.push(eq(decisionJournalEntries.roleProfileId, roleProfileId));
  }

  const decisions = await db.select()
    .from(decisionJournalEntries)
    .where(and(...conditions));

  const outcomes = await db.select()
    .from(decisionOutcomes)
    .innerJoin(decisionJournalEntries, eq(decisionOutcomes.decisionId, decisionJournalEntries.id))
    .where(and(...conditions));

  const totalDecisions = decisions.length;
  const activeDecisions = decisions.filter(d => d.status === "active").length;
  const implementedDecisions = decisions.filter(d => d.status === "implemented").length;
  
  const totalOutcomes = outcomes.length;
  const achievedOutcomes = outcomes.filter(o => o.decision_outcomes.outcomeStatus === "achieved").length;
  const partialOutcomes = outcomes.filter(o => o.decision_outcomes.outcomeStatus === "partially_achieved").length;

  return {
    totalDecisions,
    activeDecisions,
    implementedDecisions,
    abandonedDecisions: decisions.filter(d => d.status === "abandoned").length,
    totalOutcomes,
    achievedOutcomes,
    partialOutcomes,
    notAchievedOutcomes: outcomes.filter(o => o.decision_outcomes.outcomeStatus === "not_achieved").length,
    successRate: totalOutcomes > 0 ? Math.round(((achievedOutcomes + partialOutcomes * 0.5) / totalOutcomes) * 100) : 0,
  };
}
