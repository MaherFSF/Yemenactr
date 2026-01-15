/**
 * AI Validation Agents for Cross-Triangulation
 * 
 * A comprehensive system of specialized AI agents that validate, verify,
 * and cross-check all data in the YETO platform to ensure highest accuracy.
 * 
 * Following best practices from:
 * - IMF Data Quality Assessment Framework (DQAF)
 * - World Bank Statistical Capacity Indicators
 * - BIS Data Validation Standards
 * 
 * Agent Types:
 * 1. DataValidationAgent - Cross-triangulates data from multiple sources
 * 2. SourceVerificationAgent - Validates source credibility and reliability
 * 3. ConsistencyAgent - Ensures regime data alignment and temporal consistency
 * 4. AnomalyDetectionAgent - Identifies outliers and suspicious patterns
 * 5. AccuracyCoachAgent - Self-improving agent that learns from corrections
 */

// Types for validation results
export interface ValidationResult {
  valid: boolean;
  confidence: number; // 0-100
  issues: ValidationIssue[];
  recommendations: string[];
  triangulationSources: string[];
  timestamp: Date;
}

export interface ValidationIssue {
  severity: "critical" | "high" | "medium" | "low";
  type: string;
  message: string;
  messageAr: string;
  field?: string;
  suggestedFix?: string;
}

export interface DataPoint {
  indicator: string;
  value: number;
  date: Date;
  source: string;
  regime?: "aden" | "sanaa" | "mixed";
  metadata?: Record<string, any>;
}

export interface SourceCredibility {
  sourceId: string;
  name: string;
  tier: 1 | 2 | 3 | 4; // 1 = highest credibility
  reliabilityScore: number; // 0-100
  lastVerified: Date;
  knownBiases?: string[];
}

// Source credibility tiers
const SOURCE_TIERS: Record<number, { name: string; weight: number }> = {
  1: { name: "Official Primary", weight: 1.0 },
  2: { name: "Verified Secondary", weight: 0.85 },
  3: { name: "Reputable Third-Party", weight: 0.7 },
  4: { name: "Unverified", weight: 0.5 },
};

// Known sources and their credibility
const SOURCE_REGISTRY: Record<string, SourceCredibility> = {
  "cby_aden": {
    sourceId: "cby_aden",
    name: "Central Bank of Yemen - Aden",
    tier: 1,
    reliabilityScore: 95,
    lastVerified: new Date(),
    knownBiases: ["May underreport inflation in IRG areas"],
  },
  "cby_sanaa": {
    sourceId: "cby_sanaa",
    name: "Central Bank of Yemen - Sana'a",
    tier: 1,
    reliabilityScore: 90,
    lastVerified: new Date(),
    knownBiases: ["May underreport economic hardship"],
  },
  "world_bank": {
    sourceId: "world_bank",
    name: "World Bank",
    tier: 1,
    reliabilityScore: 98,
    lastVerified: new Date(),
  },
  "imf": {
    sourceId: "imf",
    name: "International Monetary Fund",
    tier: 1,
    reliabilityScore: 98,
    lastVerified: new Date(),
  },
  "un_ocha": {
    sourceId: "un_ocha",
    name: "UN OCHA",
    tier: 1,
    reliabilityScore: 95,
    lastVerified: new Date(),
  },
  "money_exchangers": {
    sourceId: "money_exchangers",
    name: "Money Exchangers Network",
    tier: 2,
    reliabilityScore: 80,
    lastVerified: new Date(),
    knownBiases: ["May have regional variations"],
  },
};

/**
 * DataValidationAgent
 * Cross-triangulates data from multiple sources to verify accuracy
 */
export class DataValidationAgent {
  private name = "DataValidationAgent";
  private validationHistory: ValidationResult[] = [];

  /**
   * Validate a data point by cross-referencing with other sources
   */
  async validate(dataPoint: DataPoint, compareSources: DataPoint[]): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    const recommendations: string[] = [];
    const triangulationSources: string[] = [dataPoint.source];

    // Calculate variance across sources
    const values = [dataPoint.value, ...compareSources.map(s => s.value)];
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = (stdDev / mean) * 100;

    // Check for significant variance
    if (coefficientOfVariation > 20) {
      issues.push({
        severity: "high",
        type: "high_variance",
        message: `High variance (${coefficientOfVariation.toFixed(1)}%) detected across sources`,
        messageAr: `تباين عالٍ (${coefficientOfVariation.toFixed(1)}%) تم اكتشافه عبر المصادر`,
        suggestedFix: "Review source data and investigate discrepancies",
      });
    }

    // Check if value is within expected range
    const rangeCheck = this.checkValueRange(dataPoint);
    if (!rangeCheck.valid) {
      issues.push(rangeCheck.issue!);
    }

    // Check temporal consistency
    const temporalCheck = this.checkTemporalConsistency(dataPoint, compareSources);
    if (!temporalCheck.valid) {
      issues.push(temporalCheck.issue!);
    }

    // Calculate confidence score
    const confidence = this.calculateConfidence(issues, compareSources.length);

    // Generate recommendations
    if (issues.length > 0) {
      recommendations.push("Cross-verify with additional sources");
      recommendations.push("Check for data entry errors");
      if (issues.some(i => i.type === "high_variance")) {
        recommendations.push("Investigate source methodology differences");
      }
    }

    // Add comparison sources to triangulation list
    compareSources.forEach(s => triangulationSources.push(s.source));

    const result: ValidationResult = {
      valid: issues.filter(i => i.severity === "critical").length === 0,
      confidence,
      issues,
      recommendations,
      triangulationSources,
      timestamp: new Date(),
    };

    this.validationHistory.push(result);
    return result;
  }

  /**
   * Check if value is within expected range for the indicator
   */
  private checkValueRange(dataPoint: DataPoint): { valid: boolean; issue?: ValidationIssue } {
    const ranges: Record<string, { min: number; max: number }> = {
      "exchange_rate_aden": { min: 500, max: 3000 },
      "exchange_rate_sanaa": { min: 200, max: 1000 },
      "inflation_rate": { min: -10, max: 100 },
      "gdp_growth": { min: -50, max: 50 },
      "unemployment_rate": { min: 0, max: 100 },
    };

    const range = ranges[dataPoint.indicator];
    if (range && (dataPoint.value < range.min || dataPoint.value > range.max)) {
      return {
        valid: false,
        issue: {
          severity: "high",
          type: "out_of_range",
          message: `Value ${dataPoint.value} is outside expected range [${range.min}, ${range.max}]`,
          messageAr: `القيمة ${dataPoint.value} خارج النطاق المتوقع [${range.min}, ${range.max}]`,
          field: dataPoint.indicator,
          suggestedFix: "Verify data entry and source accuracy",
        },
      };
    }

    return { valid: true };
  }

  /**
   * Check temporal consistency with historical data
   */
  private checkTemporalConsistency(
    dataPoint: DataPoint, 
    historicalData: DataPoint[]
  ): { valid: boolean; issue?: ValidationIssue } {
    if (historicalData.length < 2) return { valid: true };

    // Sort by date
    const sorted = [...historicalData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate average change
    let totalChange = 0;
    for (let i = 1; i < sorted.length; i++) {
      totalChange += Math.abs(sorted[i].value - sorted[i-1].value);
    }
    const avgChange = totalChange / (sorted.length - 1);

    // Check if current change is abnormal (>3x average)
    const lastValue = sorted[sorted.length - 1].value;
    const currentChange = Math.abs(dataPoint.value - lastValue);

    if (currentChange > avgChange * 3) {
      return {
        valid: false,
        issue: {
          severity: "medium",
          type: "temporal_anomaly",
          message: `Unusual change detected: ${currentChange.toFixed(2)} vs average ${avgChange.toFixed(2)}`,
          messageAr: `تغيير غير عادي: ${currentChange.toFixed(2)} مقابل المتوسط ${avgChange.toFixed(2)}`,
          suggestedFix: "Verify if this represents a real economic event",
        },
      };
    }

    return { valid: true };
  }

  /**
   * Calculate confidence score based on issues and source count
   */
  private calculateConfidence(issues: ValidationIssue[], sourceCount: number): number {
    let confidence = 100;

    // Deduct for issues
    issues.forEach(issue => {
      switch (issue.severity) {
        case "critical": confidence -= 30; break;
        case "high": confidence -= 20; break;
        case "medium": confidence -= 10; break;
        case "low": confidence -= 5; break;
      }
    });

    // Bonus for multiple sources
    confidence += Math.min(sourceCount * 5, 15);

    return Math.max(0, Math.min(100, confidence));
  }
}

/**
 * SourceVerificationAgent
 * Validates source credibility and reliability
 */
export class SourceVerificationAgent {
  private name = "SourceVerificationAgent";

  /**
   * Verify a source's credibility
   */
  async verifySource(sourceId: string): Promise<{
    credibility: SourceCredibility | null;
    verified: boolean;
    warnings: string[];
  }> {
    const warnings: string[] = [];
    const credibility = SOURCE_REGISTRY[sourceId];

    if (!credibility) {
      return {
        credibility: null,
        verified: false,
        warnings: ["Source not found in registry"],
      };
    }

    // Check if verification is stale
    const daysSinceVerification = (Date.now() - credibility.lastVerified.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceVerification > 30) {
      warnings.push(`Source verification is ${Math.round(daysSinceVerification)} days old`);
    }

    // Add known bias warnings
    if (credibility.knownBiases && credibility.knownBiases.length > 0) {
      credibility.knownBiases.forEach(bias => {
        warnings.push(`Known bias: ${bias}`);
      });
    }

    return {
      credibility,
      verified: true,
      warnings,
    };
  }

  /**
   * Calculate weighted average from multiple sources
   */
  calculateWeightedValue(dataPoints: Array<{ value: number; sourceId: string }>): {
    weightedValue: number;
    confidence: number;
    sourcesUsed: string[];
  } {
    let totalWeight = 0;
    let weightedSum = 0;
    const sourcesUsed: string[] = [];

    dataPoints.forEach(dp => {
      const credibility = SOURCE_REGISTRY[dp.sourceId];
      const weight = credibility ? SOURCE_TIERS[credibility.tier].weight : 0.5;
      
      weightedSum += dp.value * weight;
      totalWeight += weight;
      sourcesUsed.push(dp.sourceId);
    });

    const weightedValue = totalWeight > 0 ? weightedSum / totalWeight : 0;
    const confidence = Math.min(100, (totalWeight / dataPoints.length) * 100);

    return {
      weightedValue,
      confidence,
      sourcesUsed,
    };
  }
}

/**
 * ConsistencyAgent
 * Ensures regime data alignment and temporal consistency
 */
export class ConsistencyAgent {
  private name = "ConsistencyAgent";

  /**
   * Check consistency between regime data
   */
  async checkRegimeConsistency(
    adenData: DataPoint[],
    sanaaData: DataPoint[]
  ): Promise<{
    consistent: boolean;
    issues: ValidationIssue[];
    spreadAnalysis: {
      averageSpread: number;
      maxSpread: number;
      trend: "widening" | "narrowing" | "stable";
    };
  }> {
    const issues: ValidationIssue[] = [];
    const spreads: number[] = [];

    // Match data points by date
    adenData.forEach(aden => {
      const matchingSanaa = sanaaData.find(s => 
        new Date(s.date).toDateString() === new Date(aden.date).toDateString()
      );

      if (matchingSanaa) {
        const spread = ((aden.value - matchingSanaa.value) / matchingSanaa.value) * 100;
        spreads.push(spread);

        // Check for unreasonable spreads
        if (spread > 300) {
          issues.push({
            severity: "high",
            type: "excessive_spread",
            message: `Excessive spread (${spread.toFixed(1)}%) on ${new Date(aden.date).toLocaleDateString()}`,
            messageAr: `فارق مفرط (${spread.toFixed(1)}%) في ${new Date(aden.date).toLocaleDateString('ar-YE')}`,
          });
        }
      }
    });

    // Calculate spread statistics
    const averageSpread = spreads.length > 0 
      ? spreads.reduce((a, b) => a + b, 0) / spreads.length 
      : 0;
    const maxSpread = spreads.length > 0 ? Math.max(...spreads) : 0;

    // Determine trend
    let trend: "widening" | "narrowing" | "stable" = "stable";
    if (spreads.length >= 2) {
      const firstHalf = spreads.slice(0, Math.floor(spreads.length / 2));
      const secondHalf = spreads.slice(Math.floor(spreads.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      if (secondAvg > firstAvg * 1.1) trend = "widening";
      else if (secondAvg < firstAvg * 0.9) trend = "narrowing";
    }

    return {
      consistent: issues.filter(i => i.severity === "critical" || i.severity === "high").length === 0,
      issues,
      spreadAnalysis: {
        averageSpread,
        maxSpread,
        trend,
      },
    };
  }
}

/**
 * AnomalyDetectionAgent
 * Identifies outliers and suspicious patterns
 */
export class AnomalyDetectionAgent {
  private name = "AnomalyDetectionAgent";

  /**
   * Detect anomalies in a dataset
   */
  async detectAnomalies(dataPoints: DataPoint[]): Promise<{
    anomalies: Array<{
      dataPoint: DataPoint;
      anomalyType: string;
      severity: "critical" | "high" | "medium" | "low";
      explanation: string;
    }>;
    overallHealth: number; // 0-100
  }> {
    const anomalies: Array<{
      dataPoint: DataPoint;
      anomalyType: string;
      severity: "critical" | "high" | "medium" | "low";
      explanation: string;
    }> = [];

    if (dataPoints.length < 3) {
      return { anomalies, overallHealth: 100 };
    }

    // Calculate statistics
    const values = dataPoints.map(d => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
    );

    // Detect outliers using Z-score
    dataPoints.forEach(dp => {
      const zScore = Math.abs((dp.value - mean) / stdDev);
      
      if (zScore > 3) {
        anomalies.push({
          dataPoint: dp,
          anomalyType: "statistical_outlier",
          severity: "high",
          explanation: `Value is ${zScore.toFixed(1)} standard deviations from mean`,
        });
      } else if (zScore > 2) {
        anomalies.push({
          dataPoint: dp,
          anomalyType: "potential_outlier",
          severity: "medium",
          explanation: `Value is ${zScore.toFixed(1)} standard deviations from mean`,
        });
      }
    });

    // Detect sudden changes
    for (let i = 1; i < dataPoints.length; i++) {
      const change = Math.abs(dataPoints[i].value - dataPoints[i-1].value);
      const percentChange = (change / dataPoints[i-1].value) * 100;
      
      if (percentChange > 50) {
        anomalies.push({
          dataPoint: dataPoints[i],
          anomalyType: "sudden_change",
          severity: "high",
          explanation: `${percentChange.toFixed(1)}% change from previous value`,
        });
      }
    }

    // Calculate overall health
    const criticalCount = anomalies.filter(a => a.severity === "critical").length;
    const highCount = anomalies.filter(a => a.severity === "high").length;
    const mediumCount = anomalies.filter(a => a.severity === "medium").length;
    
    const overallHealth = Math.max(0, 100 - (criticalCount * 30) - (highCount * 15) - (mediumCount * 5));

    return { anomalies, overallHealth };
  }
}

/**
 * AccuracyCoachAgent
 * Self-improving agent that learns from corrections
 */
export class AccuracyCoachAgent {
  private name = "AccuracyCoachAgent";
  private correctionHistory: Array<{
    original: DataPoint;
    corrected: DataPoint;
    reason: string;
    timestamp: Date;
  }> = [];
  private learnings: Map<string, string[]> = new Map();

  /**
   * Record a correction for learning
   */
  recordCorrection(original: DataPoint, corrected: DataPoint, reason: string): void {
    this.correctionHistory.push({
      original,
      corrected,
      reason,
      timestamp: new Date(),
    });

    // Extract learning
    const key = `${original.indicator}_${original.source}`;
    const existingLearnings = this.learnings.get(key) || [];
    existingLearnings.push(reason);
    this.learnings.set(key, existingLearnings);

    console.log(`[${this.name}] Recorded correction for ${key}: ${reason}`);
  }

  /**
   * Get recommendations based on past corrections
   */
  getRecommendations(indicator: string, source: string): string[] {
    const key = `${indicator}_${source}`;
    const learnings = this.learnings.get(key) || [];
    
    // Deduplicate and return top recommendations
    const uniqueLearnings = Array.from(new Set(learnings));
    return uniqueLearnings.slice(0, 5);
  }

  /**
   * Calculate accuracy score for a source/indicator combination
   */
  getAccuracyScore(indicator: string, source: string): {
    score: number;
    totalCorrections: number;
    commonIssues: string[];
  } {
    const relevantCorrections = this.correctionHistory.filter(
      c => c.original.indicator === indicator && c.original.source === source
    );

    const totalCorrections = relevantCorrections.length;
    const score = Math.max(0, 100 - (totalCorrections * 5));
    
    // Find common issues
    const reasons = relevantCorrections.map(c => c.reason);
    const reasonCounts = new Map<string, number>();
    reasons.forEach(r => {
      reasonCounts.set(r, (reasonCounts.get(r) || 0) + 1);
    });
    
    const commonIssues = Array.from(reasonCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([reason]) => reason);

    return { score, totalCorrections, commonIssues };
  }

  /**
   * Generate coaching report
   */
  generateCoachingReport(): {
    totalCorrections: number;
    accuracyTrend: "improving" | "declining" | "stable";
    topIssues: Array<{ issue: string; count: number }>;
    recommendations: string[];
  } {
    const totalCorrections = this.correctionHistory.length;
    
    // Calculate accuracy trend (compare first half vs second half)
    const halfPoint = Math.floor(this.correctionHistory.length / 2);
    const firstHalf = this.correctionHistory.slice(0, halfPoint);
    const secondHalf = this.correctionHistory.slice(halfPoint);
    
    let accuracyTrend: "improving" | "declining" | "stable" = "stable";
    if (secondHalf.length < firstHalf.length * 0.8) {
      accuracyTrend = "improving";
    } else if (secondHalf.length > firstHalf.length * 1.2) {
      accuracyTrend = "declining";
    }

    // Find top issues
    const issueCounts = new Map<string, number>();
    this.correctionHistory.forEach(c => {
      issueCounts.set(c.reason, (issueCounts.get(c.reason) || 0) + 1);
    });
    
    const topIssues = Array.from(issueCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([issue, count]) => ({ issue, count }));

    // Generate recommendations
    const recommendations: string[] = [];
    if (accuracyTrend === "declining") {
      recommendations.push("Review data collection methodology");
      recommendations.push("Increase source verification frequency");
    }
    topIssues.forEach(({ issue }) => {
      recommendations.push(`Address recurring issue: ${issue}`);
    });

    return {
      totalCorrections,
      accuracyTrend,
      topIssues,
      recommendations,
    };
  }
}

/**
 * Master Validation Orchestrator
 * Coordinates all validation agents
 */
export class ValidationOrchestrator {
  private dataAgent: DataValidationAgent;
  private sourceAgent: SourceVerificationAgent;
  private consistencyAgent: ConsistencyAgent;
  private anomalyAgent: AnomalyDetectionAgent;
  private coachAgent: AccuracyCoachAgent;

  constructor() {
    this.dataAgent = new DataValidationAgent();
    this.sourceAgent = new SourceVerificationAgent();
    this.consistencyAgent = new ConsistencyAgent();
    this.anomalyAgent = new AnomalyDetectionAgent();
    this.coachAgent = new AccuracyCoachAgent();
  }

  /**
   * Run comprehensive validation on a dataset
   */
  async runComprehensiveValidation(
    dataPoints: DataPoint[],
    options: {
      checkRegimeConsistency?: boolean;
      detectAnomalies?: boolean;
      verifyAllSources?: boolean;
    } = {}
  ): Promise<{
    overallValid: boolean;
    overallConfidence: number;
    validationResults: ValidationResult[];
    anomalyReport?: Awaited<ReturnType<AnomalyDetectionAgent["detectAnomalies"]>>;
    consistencyReport?: Awaited<ReturnType<ConsistencyAgent["checkRegimeConsistency"]>>;
    coachingReport: ReturnType<AccuracyCoachAgent["generateCoachingReport"]>;
  }> {
    const validationResults: ValidationResult[] = [];

    // Validate each data point
    for (const dp of dataPoints) {
      const compareSources = dataPoints.filter(
        d => d.indicator === dp.indicator && d.source !== dp.source
      );
      const result = await this.dataAgent.validate(dp, compareSources);
      validationResults.push(result);
    }

    // Detect anomalies if requested
    let anomalyReport;
    if (options.detectAnomalies) {
      anomalyReport = await this.anomalyAgent.detectAnomalies(dataPoints);
    }

    // Check regime consistency if requested
    let consistencyReport;
    if (options.checkRegimeConsistency) {
      const adenData = dataPoints.filter(d => d.regime === "aden");
      const sanaaData = dataPoints.filter(d => d.regime === "sanaa");
      if (adenData.length > 0 && sanaaData.length > 0) {
        consistencyReport = await this.consistencyAgent.checkRegimeConsistency(adenData, sanaaData);
      }
    }

    // Get coaching report
    const coachingReport = this.coachAgent.generateCoachingReport();

    // Calculate overall metrics
    const overallValid = validationResults.every(r => r.valid);
    const overallConfidence = validationResults.length > 0
      ? validationResults.reduce((sum, r) => sum + r.confidence, 0) / validationResults.length
      : 100;

    return {
      overallValid,
      overallConfidence,
      validationResults,
      anomalyReport,
      consistencyReport,
      coachingReport,
    };
  }

  /**
   * Record a correction for learning
   */
  recordCorrection(original: DataPoint, corrected: DataPoint, reason: string): void {
    this.coachAgent.recordCorrection(original, corrected, reason);
  }
}

// Export singleton instance
export const validationOrchestrator = new ValidationOrchestrator();

export default {
  DataValidationAgent,
  SourceVerificationAgent,
  ConsistencyAgent,
  AnomalyDetectionAgent,
  AccuracyCoachAgent,
  ValidationOrchestrator,
  validationOrchestrator,
};
