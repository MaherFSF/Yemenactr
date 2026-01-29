/**
 * Teamwork Engine Service
 * Implements multi-agent orchestration patterns and tribunal gates for quality assurance
 */

import { getDb } from '../db';
import { agentTasks } from '../../drizzle/schema';
import { eq, desc, and } from 'drizzle-orm';
import crypto from 'crypto';

// Agent roles in the teamwork system
export const AGENT_ROLES = {
  PLANNER: 'planner',
  RESEARCHER: 'researcher',
  ANALYST: 'analyst',
  WRITER: 'writer',
  TRANSLATOR: 'translator',
  VERIFIER: 'verifier',
  TRIBUNAL: 'tribunal',
} as const;

// Orchestration patterns
export const ORCHESTRATION_PATTERNS = {
  // Planner → Specialists → Verifier
  STANDARD_RESEARCH: {
    name: 'Standard Research',
    stages: [
      { role: 'planner', action: 'decompose_task' },
      { role: 'researcher', action: 'gather_data', parallel: true },
      { role: 'analyst', action: 'analyze_data' },
      { role: 'writer', action: 'draft_output' },
      { role: 'translator', action: 'translate_ar', parallel: true },
      { role: 'verifier', action: 'verify_citations' },
    ],
    requiresTribunal: true,
  },
  
  // Quick lookup without full tribunal
  QUICK_LOOKUP: {
    name: 'Quick Lookup',
    stages: [
      { role: 'researcher', action: 'quick_search' },
      { role: 'verifier', action: 'verify_citations' },
    ],
    requiresTribunal: false,
  },
  
  // VIP Options with multi-agent handoffs
  VIP_OPTIONS: {
    name: 'VIP Options',
    stages: [
      { role: 'planner', action: 'identify_options' },
      { role: 'analyst', action: 'evaluate_options', parallel: true },
      { role: 'writer', action: 'format_options' },
      { role: 'verifier', action: 'verify_all_options' },
    ],
    requiresTribunal: true,
  },
  
  // Full report generation
  FULL_REPORT: {
    name: 'Full Report',
    stages: [
      { role: 'planner', action: 'outline_report' },
      { role: 'researcher', action: 'gather_all_data', parallel: true },
      { role: 'analyst', action: 'deep_analysis' },
      { role: 'writer', action: 'write_sections', parallel: true },
      { role: 'translator', action: 'translate_full_ar' },
      { role: 'verifier', action: 'comprehensive_verify' },
    ],
    requiresTribunal: true,
  },
};

interface TaskContext {
  taskId: string;
  pattern: keyof typeof ORCHESTRATION_PATTERNS;
  input: Record<string, unknown>;
  currentStage: number;
  stageResults: Record<string, unknown>[];
  status: 'pending' | 'in_progress' | 'awaiting_tribunal' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

interface TribunalDecision {
  taskId: string;
  reviewers: string[];
  votes: { reviewer: string; vote: 'approve' | 'reject' | 'revise'; reason: string }[];
  decision: 'approved' | 'rejected' | 'needs_revision';
  revisionNotes?: string;
  decidedAt: Date;
}

/**
 * Create a new multi-agent task
 */
export async function createTask(
  pattern: keyof typeof ORCHESTRATION_PATTERNS,
  input: Record<string, unknown>,
  userId?: number
): Promise<TaskContext> {
  const db = await getDb();
  if (!db) throw new Error('Database connection failed');
  
  const taskId = `task_${crypto.randomBytes(8).toString('hex')}`;
  const now = new Date();
  
  const task: TaskContext = {
    taskId,
    pattern,
    input,
    currentStage: 0,
    stageResults: [],
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };
  
  // Save to database
  await db.insert(agentTasks).values({
    taskId,
    taskType: 'multi_agent',
    orchestrationPattern: pattern === 'STANDARD_RESEARCH' ? 'planner_specialists_verifier' :
                          pattern === 'VIP_OPTIONS' ? 'parallel_merge_tribunal' :
                          pattern === 'QUICK_LOOKUP' ? 'sequential_handoff' : 'peer_review',
    inputData: input,
    status: 'pending',
    createdAt: now,
  });
  
  return task;
}

/**
 * Execute the next stage of a task
 */
export async function executeNextStage(taskId: string): Promise<{
  completed: boolean;
  currentStage: number;
  stageResult: Record<string, unknown>;
  needsTribunal: boolean;
}> {
  const db = await getDb();
  if (!db) throw new Error('Database connection failed');
  
  // Fetch task from database
  const [task] = await db
    .select()
    .from(agentTasks)
    .where(eq(agentTasks.taskId, taskId))
    .limit(1);
  
  if (!task) throw new Error(`Task ${taskId} not found`);
  
  const pattern = ORCHESTRATION_PATTERNS[task.orchestrationPattern as keyof typeof ORCHESTRATION_PATTERNS];
  if (!pattern) throw new Error(`Unknown pattern: ${task.orchestrationPattern}`);
  
  // Use assignedAgents to track current stage
  const assignedAgents = (task.assignedAgents as any[]) || [];
  const currentStageIndex = assignedAgents.filter(a => a.status === 'completed').length;
  
  if (currentStageIndex >= pattern.stages.length) {
    // All stages completed, check if tribunal needed
    return {
      completed: !pattern.requiresTribunal,
      currentStage: currentStageIndex,
      stageResult: {},
      needsTribunal: pattern.requiresTribunal,
    };
  }
  
  const stage = pattern.stages[currentStageIndex];
  
  // Simulate stage execution (in production, this would call actual agent functions)
  const stageResult = await simulateStageExecution(stage.role, stage.action, task.inputData as Record<string, unknown>);
  
  // Update task in database
  const newStageIndex = currentStageIndex + 1;
  const isLastStage = newStageIndex >= pattern.stages.length;
  const newStatus = isLastStage && pattern.requiresTribunal ? 'tribunal' : 
                    isLastStage ? 'completed' : 'in_progress';
  
  await db
    .update(agentTasks)
    .set({
      status: newStatus,
    })
    .where(eq(agentTasks.taskId, taskId));
  
  return {
    completed: isLastStage && !pattern.requiresTribunal,
    currentStage: newStageIndex,
    stageResult,
    needsTribunal: isLastStage && pattern.requiresTribunal,
  };
}

/**
 * Simulate stage execution (placeholder for actual agent calls)
 */
async function simulateStageExecution(
  role: string,
  action: string,
  input: Record<string, unknown>
): Promise<Record<string, unknown>> {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    role,
    action,
    timestamp: new Date().toISOString(),
    success: true,
    output: {
      summary: `${role} completed ${action}`,
      citations: [],
      confidence: 0.85,
    },
  };
}

// In-memory tribunal storage (in production, use a dedicated table)
const tribunalStore = new Map<string, {
  reviewId: string;
  taskId: string;
  reviewers: string[];
  votes: { reviewer: string; vote: string; reason: string; timestamp: string }[];
  status: string;
  decision?: string;
  createdAt: Date;
}>();

/**
 * Submit task for tribunal review
 * Rule: No single agent can publish - requires tribunal approval
 */
export async function submitToTribunal(taskId: string): Promise<{
  reviewId: string;
  assignedReviewers: string[];
}> {
  const reviewId = `review_${crypto.randomBytes(8).toString('hex')}`;
  
  // Assign 3 reviewers for tribunal
  const assignedReviewers = ['reviewer_1', 'reviewer_2', 'reviewer_3'];
  
  tribunalStore.set(reviewId, {
    reviewId,
    taskId,
    reviewers: assignedReviewers,
    votes: [],
    status: 'pending',
    createdAt: new Date(),
  });
  
  return { reviewId, assignedReviewers };
}

/**
 * Submit a tribunal vote
 */
export async function submitTribunalVote(
  reviewId: string,
  reviewer: string,
  vote: 'approve' | 'reject' | 'revise',
  reason: string
): Promise<{
  votesReceived: number;
  votesRequired: number;
  canDecide: boolean;
}> {
  const review = tribunalStore.get(reviewId);
  if (!review) throw new Error(`Review ${reviewId} not found`);
  
  // Add vote to existing votes
  review.votes.push({ reviewer, vote, reason, timestamp: new Date().toISOString() });
  
  const votesRequired = Math.ceil(review.reviewers.length / 2) + 1; // Majority
  
  return {
    votesReceived: review.votes.length,
    votesRequired,
    canDecide: review.votes.length >= votesRequired,
  };
}

/**
 * Finalize tribunal decision
 */
export async function finalizeTribunalDecision(reviewId: string): Promise<TribunalDecision> {
  const db = await getDb();
  if (!db) throw new Error('Database connection failed');
  
  const review = tribunalStore.get(reviewId);
  if (!review) throw new Error(`Review ${reviewId} not found`);
  
  const votes = review.votes;
  
  // Count votes
  const approveCount = votes.filter(v => v.vote === 'approve').length;
  const rejectCount = votes.filter(v => v.vote === 'reject').length;
  const reviseCount = votes.filter(v => v.vote === 'revise').length;
  
  // Determine decision
  let decision: 'approved' | 'rejected' | 'needs_revision';
  if (approveCount > rejectCount && approveCount > reviseCount) {
    decision = 'approved';
  } else if (rejectCount > approveCount && rejectCount > reviseCount) {
    decision = 'rejected';
  } else {
    decision = 'needs_revision';
  }
  
  // Update review status
  review.status = decision === 'approved' ? 'approved' : decision === 'rejected' ? 'rejected' : 'revision_requested';
  review.decision = decision;
  
  // Update task status
  const taskStatus = decision === 'approved' ? 'completed' : 
                     decision === 'rejected' ? 'failed' : 'in_progress';
  
  await db
    .update(agentTasks)
    .set({
      status: taskStatus,
    })
    .where(eq(agentTasks.taskId, review.taskId));
  
  return {
    taskId: review.taskId,
    reviewers: review.reviewers,
    votes: votes.map(v => ({ reviewer: v.reviewer, vote: v.vote as any, reason: v.reason })),
    decision,
    revisionNotes: decision === 'needs_revision' ? 
      votes.filter(v => v.vote === 'revise').map(v => v.reason).join('; ') : undefined,
    decidedAt: new Date(),
  };
}

/**
 * Get task status with full history
 */
export async function getTaskStatus(taskId: string): Promise<{
  task: typeof agentTasks.$inferSelect | null;
  tribunalReview: ReturnType<typeof tribunalStore.get> | null;
  pattern: typeof ORCHESTRATION_PATTERNS[keyof typeof ORCHESTRATION_PATTERNS] | null;
}> {
  const db = await getDb();
  if (!db) throw new Error('Database connection failed');
  
  const [task] = await db
    .select()
    .from(agentTasks)
    .where(eq(agentTasks.taskId, taskId))
    .limit(1);
  
  if (!task) return { task: null, tribunalReview: null, pattern: null };
  
  // Find tribunal review for this task
  let review: ReturnType<typeof tribunalStore.get> | null = null;
  const reviews = Array.from(tribunalStore.values());
  for (let i = 0; i < reviews.length; i++) {
    if (reviews[i].taskId === taskId) {
      review = reviews[i];
      break;
    }
  }
  
  const pattern = ORCHESTRATION_PATTERNS[task.orchestrationPattern as keyof typeof ORCHESTRATION_PATTERNS] || null;
  
  return { task, tribunalReview: review, pattern };
}

/**
 * Execute full task with automatic tribunal submission
 */
export async function executeFullTask(
  pattern: keyof typeof ORCHESTRATION_PATTERNS,
  input: Record<string, unknown>,
  userId?: number
): Promise<{
  taskId: string;
  status: string;
  stageResults: Record<string, unknown>[];
  tribunalRequired: boolean;
  reviewId?: string;
}> {
  // Create task
  const task = await createTask(pattern, input, userId);
  
  const stageResults: Record<string, unknown>[] = [];
  let needsTribunal = false;
  
  // Execute all stages
  while (true) {
    const result = await executeNextStage(task.taskId);
    stageResults.push(result.stageResult);
    
    if (result.completed) {
      return {
        taskId: task.taskId,
        status: 'completed',
        stageResults,
        tribunalRequired: false,
      };
    }
    
    if (result.needsTribunal) {
      needsTribunal = true;
      break;
    }
  }
  
  // Submit to tribunal if required
  if (needsTribunal) {
    const { reviewId } = await submitToTribunal(task.taskId);
    return {
      taskId: task.taskId,
      status: 'awaiting_tribunal',
      stageResults,
      tribunalRequired: true,
      reviewId,
    };
  }
  
  return {
    taskId: task.taskId,
    status: 'completed',
    stageResults,
    tribunalRequired: false,
  };
}
