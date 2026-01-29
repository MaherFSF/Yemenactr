/**
 * Partner Validation Service
 * 3-layer validation pipeline for partner data submissions
 * 
 * Layer 1: Format & Schema validation
 * Layer 2: Continuity & Duplicate detection
 * Layer 3: Contradiction scan against existing data
 */

import { getDb } from "../db";
import { 
  dataContracts, 
  partnerSubmissions, 
  submissionValidations,
  timeSeries,
  dataContradictions
} from "../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

// Types
interface ValidationError {
  field: string;
  error: string;
  severity: "error" | "warning";
}

interface ContinuityIssue {
  type: "duplicate" | "gap" | "outlier" | "missing_period";
  description: string;
  affectedRecords: number[];
}

interface ContradictionFound {
  indicator: string;
  period: string;
  existingValue: number;
  submittedValue: number;
  existingSource: string;
  resolution: "pending" | "accepted" | "rejected";
}

interface ValidationResult {
  layer1: {
    passed: boolean;
    errors: ValidationError[];
  };
  layer2: {
    passed: boolean;
    issues: ContinuityIssue[];
  };
  layer3: {
    passed: boolean;
    contradictions: ContradictionFound[];
  };
  overall: {
    passed: boolean;
    score: number;
  };
}

interface SubmissionData {
  records: Array<Record<string, unknown>>;
  metadata?: {
    sourceStatement?: string;
    methodDescription?: string;
    coverageWindow?: string;
    license?: string;
    contactInfo?: string;
  };
}

/**
 * Run full 3-layer validation on a submission
 */
export async function validateSubmission(
  submissionId: number,
  contractId: number
): Promise<ValidationResult> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get submission and contract
  const [submission] = await db
    .select()
    .from(partnerSubmissions)
    .where(eq(partnerSubmissions.id, submissionId))
    .limit(1);

  const [contract] = await db
    .select()
    .from(dataContracts)
    .where(eq(dataContracts.id, contractId))
    .limit(1);

  if (!submission || !contract) {
    throw new Error("Submission or contract not found");
  }

  const data = (submission.rawData || { records: [] }) as SubmissionData;

  // Run all 3 layers
  const layer1 = await runLayer1Validation(data, contract);
  const layer2 = await runLayer2Validation(data, contract);
  const layer3 = await runLayer3Validation(data, contract, db);

  // Calculate overall score
  const score = calculateValidationScore(layer1, layer2, layer3);
  const overall = {
    passed: layer1.passed && layer2.passed && layer3.passed,
    score
  };

  // Store validation results
  await db.insert(submissionValidations).values({
    submissionId,
    contractId,
    layer1Passed: layer1.passed,
    layer1Errors: layer1.errors,
    layer2Passed: layer2.passed,
    layer2Issues: layer2.issues,
    layer3Passed: layer3.passed,
    contradictionsFound: layer3.contradictions,
    overallPassed: overall.passed,
    validationScore: score.toString()
  });

  return { layer1, layer2, layer3, overall };
}

/**
 * Layer 1: Format & Schema Validation
 */
async function runLayer1Validation(
  data: SubmissionData,
  contract: typeof dataContracts.$inferSelect
): Promise<{ passed: boolean; errors: ValidationError[] }> {
  const errors: ValidationError[] = [];
  const requiredFields = (contract.requiredFields || []) as Array<{
    name: string;
    type: string;
    description: string;
    required: boolean;
    validation?: string;
  }>;

  // Check each record against schema
  for (let i = 0; i < data.records.length; i++) {
    const record = data.records[i];

    for (const field of requiredFields) {
      // Check required fields
      if (field.required && (record[field.name] === undefined || record[field.name] === null || record[field.name] === "")) {
        errors.push({
          field: `records[${i}].${field.name}`,
          error: `Required field "${field.name}" is missing`,
          severity: "error"
        });
        continue;
      }

      // Type validation
      if (record[field.name] !== undefined && record[field.name] !== null) {
        const value = record[field.name];
        
        switch (field.type) {
          case "number":
            if (typeof value !== "number" && isNaN(Number(value))) {
              errors.push({
                field: `records[${i}].${field.name}`,
                error: `Field "${field.name}" must be a number`,
                severity: "error"
              });
            }
            break;
          case "date":
            if (isNaN(Date.parse(String(value)))) {
              errors.push({
                field: `records[${i}].${field.name}`,
                error: `Field "${field.name}" must be a valid date`,
                severity: "error"
              });
            }
            break;
          case "boolean":
            if (typeof value !== "boolean" && value !== "true" && value !== "false") {
              errors.push({
                field: `records[${i}].${field.name}`,
                error: `Field "${field.name}" must be a boolean`,
                severity: "error"
              });
            }
            break;
        }
      }
    }
  }

  // Check metadata requirements
  const requiredMetadata = (contract.requiredMetadata || {}) as Record<string, boolean>;
  if (requiredMetadata.sourceStatement && !data.metadata?.sourceStatement) {
    errors.push({
      field: "metadata.sourceStatement",
      error: "Source statement is required",
      severity: "error"
    });
  }
  if (requiredMetadata.methodDescription && !data.metadata?.methodDescription) {
    errors.push({
      field: "metadata.methodDescription",
      error: "Method description is required",
      severity: "error"
    });
  }

  return {
    passed: errors.filter(e => e.severity === "error").length === 0,
    errors
  };
}

/**
 * Layer 2: Continuity & Duplicate Detection
 */
async function runLayer2Validation(
  data: SubmissionData,
  contract: typeof dataContracts.$inferSelect
): Promise<{ passed: boolean; issues: ContinuityIssue[] }> {
  const issues: ContinuityIssue[] = [];

  // Check for duplicates
  const seen = new Map<string, number[]>();
  for (let i = 0; i < data.records.length; i++) {
    const record = data.records[i];
    // Create a key from date + indicator fields
    const key = `${record.date || record.period || record.survey_date}-${record.indicator_code || record.indicator || ""}`;
    
    if (seen.has(key)) {
      const existing = seen.get(key)!;
      existing.push(i);
      issues.push({
        type: "duplicate",
        description: `Duplicate record found for ${key}`,
        affectedRecords: [...existing]
      });
    } else {
      seen.set(key, [i]);
    }
  }

  // Check for gaps in time series (for time-based data)
  if (data.records.length > 1) {
    const dates = data.records
      .map(r => new Date(String(r.date || r.period || r.survey_date)))
      .filter(d => !isNaN(d.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());

    if (dates.length > 1) {
      const frequency = contract.frequency;
      const expectedGap = getExpectedGapMs(frequency);
      
      for (let i = 1; i < dates.length; i++) {
        const gap = dates[i].getTime() - dates[i - 1].getTime();
        if (gap > expectedGap * 1.5) {
          issues.push({
            type: "gap",
            description: `Time gap detected between ${dates[i - 1].toISOString()} and ${dates[i].toISOString()}`,
            affectedRecords: [i - 1, i]
          });
        }
      }
    }
  }

  // Check for outliers (simple IQR method for numeric fields)
  const numericValues: number[] = [];
  for (const record of data.records) {
    const value = record.value || record.amount_yer || record.value_usd || record.price_yer;
    if (typeof value === "number") {
      numericValues.push(value);
    }
  }

  if (numericValues.length > 4) {
    const sorted = [...numericValues].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    for (let i = 0; i < data.records.length; i++) {
      const value = data.records[i].value || data.records[i].amount_yer || data.records[i].value_usd || data.records[i].price_yer;
      if (typeof value === "number" && (value < lowerBound || value > upperBound)) {
        issues.push({
          type: "outlier",
          description: `Potential outlier detected: ${value} (expected range: ${lowerBound.toFixed(2)} - ${upperBound.toFixed(2)})`,
          affectedRecords: [i]
        });
      }
    }
  }

  return {
    passed: issues.filter(i => i.type === "duplicate").length === 0,
    issues
  };
}

/**
 * Layer 3: Contradiction Scan
 */
async function runLayer3Validation(
  data: SubmissionData,
  contract: typeof dataContracts.$inferSelect,
  db: Awaited<ReturnType<typeof getDb>>
): Promise<{ passed: boolean; contradictions: ContradictionFound[] }> {
  const contradictions: ContradictionFound[] = [];
  
  if (!db) return { passed: true, contradictions };

  // Check each record against existing data
  for (const record of data.records) {
    const indicator = String(record.indicator_code || record.indicator || "");
    const date = String(record.date || record.period || record.survey_date || "");
    const value = Number(record.value || record.amount_yer || record.value_usd || record.price_yer || 0);

    if (!indicator || !date || !value) continue;

    // Query existing time series data
    const existing = await db
      .select()
      .from(timeSeries)
      .where(
        and(
          eq(timeSeries.indicatorCode, indicator),
          sql`DATE(${timeSeries.date}) = DATE(${date})`
        )
      )
      .limit(1);

    if (existing.length > 0) {
      const existingValue = Number(existing[0].value);
      const tolerance = 0.05; // 5% tolerance
      
      if (Math.abs(existingValue - value) / existingValue > tolerance) {
        contradictions.push({
          indicator,
          period: date,
          existingValue,
          submittedValue: value,
          existingSource: String(existing[0].sourceId) || "unknown",
          resolution: "pending"
        });

        // Log contradiction to database (skip if sources not available)
        // Note: Full contradiction logging requires source IDs which may not be available
        // in all submission contexts. The contradiction is still tracked in the validation result.
      }
    }
  }

  return {
    passed: contradictions.length === 0,
    contradictions
  };
}

/**
 * Calculate overall validation score
 */
function calculateValidationScore(
  layer1: { passed: boolean; errors: ValidationError[] },
  layer2: { passed: boolean; issues: ContinuityIssue[] },
  layer3: { passed: boolean; contradictions: ContradictionFound[] }
): number {
  let score = 100;

  // Deduct for Layer 1 errors
  const l1Errors = layer1.errors.filter(e => e.severity === "error").length;
  const l1Warnings = layer1.errors.filter(e => e.severity === "warning").length;
  score -= l1Errors * 10;
  score -= l1Warnings * 2;

  // Deduct for Layer 2 issues
  const duplicates = layer2.issues.filter(i => i.type === "duplicate").length;
  const gaps = layer2.issues.filter(i => i.type === "gap").length;
  const outliers = layer2.issues.filter(i => i.type === "outlier").length;
  score -= duplicates * 15;
  score -= gaps * 5;
  score -= outliers * 3;

  // Deduct for Layer 3 contradictions
  score -= layer3.contradictions.length * 20;

  return Math.max(0, Math.min(100, score));
}

/**
 * Get expected gap in milliseconds based on frequency
 */
function getExpectedGapMs(frequency: string): number {
  const day = 24 * 60 * 60 * 1000;
  switch (frequency) {
    case "daily": return day;
    case "weekly": return 7 * day;
    case "monthly": return 30 * day;
    case "quarterly": return 90 * day;
    case "annual": return 365 * day;
    default: return 30 * day;
  }
}

/**
 * Get validation status for a submission
 */
export async function getValidationStatus(submissionId: number) {
  const db = await getDb();
  if (!db) return null;

  const [validation] = await db
    .select()
    .from(submissionValidations)
    .where(eq(submissionValidations.submissionId, submissionId))
    .limit(1);

  return validation;
}

/**
 * Get all contracts
 */
export async function getDataContracts() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(dataContracts).where(eq(dataContracts.status, "active"));
}

/**
 * Get contract by ID
 */
export async function getContractById(contractId: number) {
  const db = await getDb();
  if (!db) return null;

  const [contract] = await db
    .select()
    .from(dataContracts)
    .where(eq(dataContracts.id, contractId))
    .limit(1);

  return contract;
}
