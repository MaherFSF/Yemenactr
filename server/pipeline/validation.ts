/**
 * YETO Data Pipeline - Processing & Validation
 * Schema validation, QA checks, outlier detection, contradiction detection
 */

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  qualityScore: number;
  confidence: 'A' | 'B' | 'C' | 'D';
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  value?: unknown;
}

export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
  suggestion?: string;
}

export interface DataRecord {
  id?: string;
  sourceId: string;
  indicator: string;
  value: number;
  unit: string;
  date: Date;
  regime?: 'aden' | 'sanaa' | 'both' | 'international';
  governorate?: string;
  metadata?: Record<string, unknown>;
}

export interface OutlierResult {
  isOutlier: boolean;
  zscore: number;
  expectedRange: { min: number; max: number };
  severity: 'low' | 'medium' | 'high';
}

export interface ContradictionResult {
  hasContradiction: boolean;
  conflictingSources: string[];
  values: { sourceId: string; value: number }[];
  variance: number;
  recommendation: string;
}

/**
 * Schema Validation - Validates record structure and data types
 */
export function validateSchema(record: Partial<DataRecord>): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Required fields
  if (!record.sourceId) {
    errors.push({
      field: 'sourceId',
      code: 'REQUIRED',
      message: 'Source ID is required'
    });
  }
  
  if (!record.indicator) {
    errors.push({
      field: 'indicator',
      code: 'REQUIRED',
      message: 'Indicator name is required'
    });
  }
  
  if (record.value === undefined || record.value === null) {
    errors.push({
      field: 'value',
      code: 'REQUIRED',
      message: 'Value is required'
    });
  } else if (typeof record.value !== 'number' || isNaN(record.value)) {
    errors.push({
      field: 'value',
      code: 'INVALID_TYPE',
      message: 'Value must be a valid number',
      value: record.value
    });
  }
  
  if (!record.unit) {
    warnings.push({
      field: 'unit',
      code: 'MISSING',
      message: 'Unit is not specified',
      suggestion: 'Add unit for clarity (e.g., USD, YER, %)'
    });
  }
  
  if (!record.date) {
    errors.push({
      field: 'date',
      code: 'REQUIRED',
      message: 'Date is required'
    });
  } else if (!(record.date instanceof Date) && isNaN(Date.parse(String(record.date)))) {
    errors.push({
      field: 'date',
      code: 'INVALID_TYPE',
      message: 'Date must be a valid date',
      value: record.date
    });
  }
  
  // Regime validation for Yemen-specific data
  if (record.regime && !['aden', 'sanaa', 'both', 'international'].includes(record.regime)) {
    errors.push({
      field: 'regime',
      code: 'INVALID_VALUE',
      message: 'Regime must be aden, sanaa, both, or international',
      value: record.regime
    });
  }
  
  const qualityScore = calculateQualityScore(errors.length, warnings.length);
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    qualityScore,
    confidence: qualityScoreToConfidence(qualityScore)
  };
}

/**
 * Data Quality Checks - Validates data quality and completeness
 */
export function runQualityChecks(records: DataRecord[]): {
  passed: boolean;
  checks: { name: string; passed: boolean; details: string }[];
  overallScore: number;
} {
  const checks: { name: string; passed: boolean; details: string }[] = [];
  
  // Check 1: Completeness
  const completeRecords = records.filter(r => 
    r.sourceId && r.indicator && r.value !== undefined && r.date
  );
  const completenessRatio = records.length > 0 ? completeRecords.length / records.length : 0;
  checks.push({
    name: 'Completeness',
    passed: completenessRatio >= 0.95,
    details: `${(completenessRatio * 100).toFixed(1)}% of records are complete`
  });
  
  // Check 2: Consistency (no duplicate records)
  const uniqueKeys = new Set(records.map(r => `${r.sourceId}_${r.indicator}_${r.date}`));
  const uniquenessRatio = records.length > 0 ? uniqueKeys.size / records.length : 1;
  checks.push({
    name: 'Uniqueness',
    passed: uniquenessRatio >= 0.99,
    details: `${(uniquenessRatio * 100).toFixed(1)}% unique records`
  });
  
  // Check 3: Timeliness (data is recent)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentRecords = records.filter(r => new Date(r.date) >= thirtyDaysAgo);
  const timelinessRatio = records.length > 0 ? recentRecords.length / records.length : 0;
  checks.push({
    name: 'Timeliness',
    passed: timelinessRatio >= 0.1,
    details: `${(timelinessRatio * 100).toFixed(1)}% of records from last 30 days`
  });
  
  // Check 4: Value range validity
  const validRangeRecords = records.filter(r => 
    typeof r.value === 'number' && !isNaN(r.value) && isFinite(r.value)
  );
  const validityRatio = records.length > 0 ? validRangeRecords.length / records.length : 0;
  checks.push({
    name: 'Value Validity',
    passed: validityRatio >= 0.99,
    details: `${(validityRatio * 100).toFixed(1)}% of values are valid numbers`
  });
  
  // Check 5: Source diversity
  const uniqueSources = new Set(records.map(r => r.sourceId));
  checks.push({
    name: 'Source Diversity',
    passed: uniqueSources.size >= 2,
    details: `Data from ${uniqueSources.size} different sources`
  });
  
  const passedChecks = checks.filter(c => c.passed).length;
  const overallScore = (passedChecks / checks.length) * 100;
  
  return {
    passed: passedChecks === checks.length,
    checks,
    overallScore
  };
}

/**
 * Outlier Detection - Identifies statistical outliers using Z-score
 */
export function detectOutlier(
  value: number,
  historicalValues: number[],
  threshold: number = 3
): OutlierResult {
  if (historicalValues.length < 3) {
    return {
      isOutlier: false,
      zscore: 0,
      expectedRange: { min: value, max: value },
      severity: 'low'
    };
  }
  
  const mean = historicalValues.reduce((a, b) => a + b, 0) / historicalValues.length;
  const variance = historicalValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / historicalValues.length;
  const stdDev = Math.sqrt(variance);
  
  if (stdDev === 0) {
    return {
      isOutlier: value !== mean,
      zscore: value !== mean ? Infinity : 0,
      expectedRange: { min: mean, max: mean },
      severity: value !== mean ? 'high' : 'low'
    };
  }
  
  const zscore = Math.abs((value - mean) / stdDev);
  const isOutlier = zscore > threshold;
  
  let severity: 'low' | 'medium' | 'high' = 'low';
  if (zscore > 4) severity = 'high';
  else if (zscore > 3) severity = 'medium';
  
  return {
    isOutlier,
    zscore,
    expectedRange: {
      min: mean - threshold * stdDev,
      max: mean + threshold * stdDev
    },
    severity
  };
}

/**
 * Contradiction Detection - Identifies conflicting data from different sources
 */
export function detectContradiction(
  records: { sourceId: string; value: number }[],
  tolerancePercent: number = 10
): ContradictionResult {
  if (records.length < 2) {
    return {
      hasContradiction: false,
      conflictingSources: [],
      values: records,
      variance: 0,
      recommendation: 'Need at least 2 sources to detect contradictions'
    };
  }
  
  const values = records.map(r => r.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const coefficientOfVariation = mean !== 0 ? (Math.sqrt(variance) / Math.abs(mean)) * 100 : 0;
  
  const hasContradiction = coefficientOfVariation > tolerancePercent;
  
  // Find conflicting sources (those deviating more than tolerance from mean)
  const conflictingSources: string[] = [];
  records.forEach(r => {
    const deviation = mean !== 0 ? Math.abs((r.value - mean) / mean) * 100 : 0;
    if (deviation > tolerancePercent) {
      conflictingSources.push(r.sourceId);
    }
  });
  
  let recommendation = '';
  if (hasContradiction) {
    recommendation = `High variance detected (${coefficientOfVariation.toFixed(1)}%). ` +
      `Review data from: ${conflictingSources.join(', ')}. ` +
      `Consider using weighted average based on source confidence.`;
  } else {
    recommendation = 'Data sources are consistent within tolerance.';
  }
  
  return {
    hasContradiction,
    conflictingSources,
    values: records,
    variance,
    recommendation
  };
}

/**
 * Regime Tagging - Tags data with appropriate regime (Aden/Sana'a)
 */
export function tagRegime(
  record: DataRecord,
  governorateToRegime: Record<string, 'aden' | 'sanaa'>
): DataRecord {
  if (record.regime) return record;
  
  if (record.governorate && governorateToRegime[record.governorate]) {
    return { ...record, regime: governorateToRegime[record.governorate] };
  }
  
  // Default mapping based on common governorates
  const defaultMapping: Record<string, 'aden' | 'sanaa'> = {
    'aden': 'aden',
    'lahj': 'aden',
    'abyan': 'aden',
    'shabwah': 'aden',
    'hadramawt': 'aden',
    'marib': 'aden',
    'sanaa': 'sanaa',
    'amran': 'sanaa',
    'dhamar': 'sanaa',
    'ibb': 'sanaa',
    'taiz': 'sanaa',
    'hodeidah': 'sanaa',
    'hajjah': 'sanaa',
    'saada': 'sanaa'
  };
  
  if (record.governorate) {
    const normalizedGov = record.governorate.toLowerCase().trim();
    if (defaultMapping[normalizedGov]) {
      return { ...record, regime: defaultMapping[normalizedGov] };
    }
  }
  
  return { ...record, regime: 'both' };
}

/**
 * Provenance Tracking - Creates audit trail for data
 */
export interface ProvenanceEntry {
  id: string;
  recordId: string;
  sourceId: string;
  action: 'created' | 'updated' | 'validated' | 'transformed' | 'published';
  timestamp: Date;
  userId?: string;
  details: Record<string, unknown>;
  previousValue?: unknown;
  newValue?: unknown;
}

export function createProvenanceEntry(
  recordId: string,
  sourceId: string,
  action: ProvenanceEntry['action'],
  details: Record<string, unknown>,
  userId?: string
): ProvenanceEntry {
  return {
    id: `prov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    recordId,
    sourceId,
    action,
    timestamp: new Date(),
    userId,
    details
  };
}

// Helper functions
function calculateQualityScore(errorCount: number, warningCount: number): number {
  const baseScore = 100;
  const errorPenalty = 20;
  const warningPenalty = 5;
  
  return Math.max(0, baseScore - (errorCount * errorPenalty) - (warningCount * warningPenalty));
}

function qualityScoreToConfidence(score: number): 'A' | 'B' | 'C' | 'D' {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 50) return 'C';
  return 'D';
}
