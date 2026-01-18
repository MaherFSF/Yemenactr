/**
 * AI Safety Gates & Validation Checks
 * 
 * Implements Rule 0 (No Hallucination) and Rule 4 (Do No Harm)
 * Every AI response must pass these gates before being shown to users
 */

import { invokeLLM } from "./_core/llm";

export interface SafetyCheckResult {
  passed: boolean;
  violations: SafetyViolation[];
  confidence: number;
  timestamp: Date;
}

export interface SafetyViolation {
  type: "hallucination" | "harmful_intent" | "pii_exposure" | "unsubstantiated_claim" | "panic_inducing" | "bias_detected";
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  location?: string;
  suggestedFix?: string;
}

/**
 * Gate 1: Hallucination Detection
 * Checks if AI response contains fabricated facts or unsupported claims
 */
export async function checkHallucination(response: string, context: string): Promise<SafetyCheckResult> {
  // Note: LLM check is optional; if unavailable, skip to pattern-based checks
  const violations: SafetyViolation[] = [];
  
  // Check 1: Every factual claim must have a citation
  const factualClaimPattern = /(?:^|\s)(?:The|According to|Studies show|Data indicates|Research suggests|It is known that|Experts agree|The evidence shows)([^.!?]*[.!?])/gi;
  const claims = response.match(factualClaimPattern) || [];
  
  for (const claim of claims) {
    if (!claim.includes("[") && !claim.includes("(source:") && !claim.includes("dataset_id:")) {
      violations.push({
        type: "unsubstantiated_claim",
        severity: "high",
        description: `Claim without citation: "${claim.substring(0, 100)}..."`,
        suggestedFix: "Add citation: [source: dataset_id or URL]"
      });
    }
  }
  
  // Check 2: Specific numbers must have sources
  const numberPattern = /(\d+(?:\.\d+)?)\s*(?:%|million|billion|trillion|YER|USD|thousand)?/g;
  const numbers = response.match(numberPattern) || [];
  
  for (const number of numbers) {
    const contextBefore = response.substring(Math.max(0, response.indexOf(number) - 200), response.indexOf(number));
    if (!contextBefore.includes("(source:") && !contextBefore.includes("[") && !contextBefore.includes("dataset")) {
      violations.push({
        type: "unsubstantiated_claim",
        severity: "high",
        description: `Number without source: ${number}`,
        suggestedFix: "Add source reference before the number"
      });
    }
  }
  
  // Check 3: Use AI to detect subtle hallucinations
  const hallucCheck = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a hallucination detector. Analyze the following AI response for fabricated facts, made-up statistics, or unsupported claims. 
        
        Return JSON: { "hallucinations": [{"claim": "...", "reason": "..."}], "confidence": 0.0-1.0 }`
      },
      {
        role: "user",
        content: `Check this response for hallucinations:\n\n${response}\n\nContext: ${context}`
      }
    ]
  });
  
  try {
    const content = hallucCheck.choices[0].message.content;
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const result = JSON.parse(contentStr || "{}");
    if (result.hallucinations && result.hallucinations.length > 0) {
      for (const halluc of result.hallucinations) {
        violations.push({
          type: "hallucination",
          severity: "critical",
          description: `Potential hallucination: ${halluc.claim}`,
          suggestedFix: `Reason: ${halluc.reason}`
        });
      }
    }
  } catch (e) {
    // If AI detection fails, continue with other checks
  }
  
  return {
    passed: violations.length === 0,
    violations,
    confidence: 1 - (violations.length * 0.1),
    timestamp: new Date()
  };
}

/**
 * Gate 2: Harmful Intent Detection
 * Checks for content that could facilitate violence, sanctions evasion, or market manipulation
 */
export async function checkHarmfulIntent(response: string): Promise<SafetyCheckResult> {
  const violations: SafetyViolation[] = [];
  
  // Harmful keywords to check
  const harmfulPatterns = [
    { pattern: /(?:how to|instructions for|guide to)\s+(?:evade|bypass|circumvent)\s+(?:sanctions|embargoes|restrictions)/i, type: "sanctions_evasion" },
    { pattern: /(?:pump and dump|market manipulation|insider trading|price fixing)/i, type: "market_manipulation" },
    { pattern: /(?:bomb|explosive|weapon|attack|kill|assassinate|poison)/i, type: "violence_instruction" },
    { pattern: /(?:hack|exploit|vulnerability|breach|ransomware)/i, type: "cyber_attack" }
  ];
  
  for (const { pattern } of harmfulPatterns) {
    if (pattern.test(response)) {
      violations.push({
        type: "harmful_intent",
        severity: "critical",
        description: `Potentially harmful content detected`,
        suggestedFix: "Remove or rephrase the harmful content"
      });
    }
  }
  
  return {
    passed: violations.length === 0,
    violations,
    confidence: 1 - (violations.length * 0.5),
    timestamp: new Date()
  };
}

/**
 * Gate 3: PII (Personally Identifiable Information) Detection
 * Checks for exposure of private information
 */
export function checkPIIExposure(response: string): SafetyCheckResult {
  const violations: SafetyViolation[] = [];
  
  // PII patterns
  const piiPatterns = [
    { pattern: /\b\d{3}-\d{2}-\d{4}\b/, type: "SSN" },
    { pattern: /\b\d{16}\b/, type: "credit_card" },
    { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, type: "email" },
    { pattern: /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/, type: "phone" },
    { pattern: /(?:passport|driver.?s?.?license|national.?id).*?[A-Z0-9]{6,}/i, type: "document_id" }
  ];
  
  for (const { pattern, type } of piiPatterns) {
    if (pattern.test(response)) {
      violations.push({
        type: "pii_exposure",
        severity: "critical",
        description: `PII detected: ${type}`,
        suggestedFix: "Remove or redact the personal information"
      });
    }
  }
  
  return {
    passed: violations.length === 0,
    violations,
    confidence: 1 - (violations.length * 0.5),
    timestamp: new Date()
  };
}

/**
 * Gate 4: Panic-Inducing Language Detection
 * Checks for alarmist framing on sensitive economic topics
 */
export function checkPanicInducingLanguage(response: string, topic?: string): SafetyCheckResult {
  const violations: SafetyViolation[] = [];
  
  // Only apply this gate to sensitive topics
  const sensitiveTopics = ["currency", "bank", "collapse", "crisis", "emergency", "panic", "run"];
  const isSensitive = !topic || sensitiveTopics.some(t => topic.toLowerCase().includes(t));
  
  if (!isSensitive) {
    return { passed: true, violations: [], confidence: 1.0, timestamp: new Date() };
  }
  
  // Panic-inducing patterns
  const panicPatterns = [
    { pattern: /(?:imminent|immediate|urgent|emergency|crisis|collapse|catastrophe|disaster)\s+(?:currency|bank|economy|financial)/i, severity: "high" },
    { pattern: /(?:will|must|definitely|certainly)\s+(?:crash|collapse|fail|bankrupt)/i, severity: "high" },
    { pattern: /(?:all|everyone|everyone must)\s+(?:withdraw|sell|flee|escape)/i, severity: "critical" }
  ];
  
  for (const { pattern, severity } of panicPatterns) {
    if (pattern.test(response)) {
      violations.push({
        type: "panic_inducing",
        severity: severity as "critical" | "high",
        description: "Alarmist language detected on sensitive economic topic",
        suggestedFix: "Use measured language and include uncertainty ranges"
      });
    }
  }
  
  // Check for missing uncertainty qualifiers
  if (isSensitive && !response.includes("may") && !response.includes("could") && !response.includes("range") && !response.includes("uncertainty")) {
    violations.push({
      type: "panic_inducing",
      severity: "medium",
      description: "Missing uncertainty qualifiers on sensitive topic",
      suggestedFix: "Add phrases like 'may', 'could', 'range', or 'uncertainty'"
    });
  }
  
  return {
    passed: violations.length === 0,
    violations,
    confidence: 1 - (violations.length * 0.15),
    timestamp: new Date()
  };
}

/**
 * Gate 5: Bias Detection
 * Checks for potential biases in framing or interpretation
 */
export async function checkBias(response: string, context: string): Promise<SafetyCheckResult> {
  const violations: SafetyViolation[] = [];
  
  // Use AI to detect subtle biases
  const biasCheck = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a bias detector. Analyze the following response for potential biases in framing, language, or interpretation.
        
        Return JSON: { "biases": [{"bias": "...", "example": "..."}], "severity": "high|medium|low" }`
      },
      {
        role: "user",
        content: `Check this response for biases:\n\n${response}\n\nContext: ${context}`
      }
    ]
  });
  
  try {
    const content = biasCheck.choices[0].message.content;
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const result = JSON.parse(contentStr || "{}");
    if (result.biases && result.biases.length > 0) {
      for (const bias of result.biases) {
        violations.push({
          type: "bias_detected",
          severity: result.severity || "medium",
          description: `Potential bias: ${bias.bias}`,
          location: bias.example
        });
      }
    }
  } catch (e) {
    // If AI detection fails, continue
  }
  
  return {
    passed: violations.length === 0,
    violations,
    confidence: 1 - (violations.length * 0.2),
    timestamp: new Date()
  };
}

/**
 * Master Safety Check: Run all gates
 */
export async function runAllSafetyGates(
  response: string,
  context: string,
  topic?: string
): Promise<{
  allPassed: boolean;
  results: Record<string, SafetyCheckResult>;
  overallConfidence: number;
  recommendations: string[];
}> {
  const results: Record<string, SafetyCheckResult> = {};
  const recommendations: string[] = [];
  
  // Run all gates
  results.hallucination = await checkHallucination(response, context);
  results.harmfulIntent = await checkHarmfulIntent(response);
  results.piiExposure = checkPIIExposure(response);
  results.panicInducing = checkPanicInducingLanguage(response, topic);
  results.bias = await checkBias(response, context);
  
  // Aggregate results
  const allPassed = Object.values(results).every(r => r.passed);
  const overallConfidence = Object.values(results).reduce((sum, r) => sum + r.confidence, 0) / Object.keys(results).length;
  
  // Generate recommendations
  for (const [gate, result] of Object.entries(results)) {
    for (const violation of result.violations) {
      if (violation.severity === "critical") {
        recommendations.push(`[${gate}] CRITICAL: ${violation.description}`);
      } else if (violation.severity === "high") {
        recommendations.push(`[${gate}] HIGH: ${violation.description}`);
      }
    }
  }
  
  return {
    allPassed,
    results,
    overallConfidence,
    recommendations
  };
}

/**
 * Format safety check results for user display
 */
export function formatSafetyCheckForDisplay(check: Awaited<ReturnType<typeof runAllSafetyGates>>): string {
  if (check.allPassed) {
    return `✓ Safety check passed (confidence: ${(check.overallConfidence * 100).toFixed(0)}%)`;
  }
  
  let output = `⚠ Safety check found issues (confidence: ${(check.overallConfidence * 100).toFixed(0)}%):\n`;
  for (const rec of check.recommendations) {
    output += `  • ${rec}\n`;
  }
  
  return output;
}

export default {
  checkHallucination,
  checkHarmfulIntent,
  checkPIIExposure,
  checkPanicInducingLanguage,
  checkBias,
  runAllSafetyGates,
  formatSafetyCheckForDisplay
};
