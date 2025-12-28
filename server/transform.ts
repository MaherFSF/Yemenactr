/**
 * YETO Platform - Data Transformation & Validation Layer
 * Yemen Economic Transparency Observatory
 * 
 * Implements data quality checks, normalization, and validation
 * per master prompt Section 6.3 requirements
 */

import type { NormalizedSeries, Observation, QAReport } from './connectors';

// ============================================
// Types
// ============================================

export interface ValidationResult {
  passed: boolean;
  score: number; // 0-100
  checks: ValidationCheck[];
  warnings: string[];
  errors: string[];
}

export interface ValidationCheck {
  name: string;
  passed: boolean;
  severity: 'error' | 'warning' | 'info';
  details?: string;
}

export interface TransformationLog {
  timestamp: Date;
  operation: string;
  inputHash: string;
  outputHash: string;
  parameters: Record<string, any>;
}

// ============================================
// Schema Validation
// ============================================

export function validateSchema(series: NormalizedSeries): ValidationCheck {
  const requiredFields = ['indicatorCode', 'indicatorName', 'sourceId', 'unit', 'observations'];
  const missingFields = requiredFields.filter(field => !(field in series) || !series[field as keyof NormalizedSeries]);
  
  return {
    name: 'Schema Validation',
    passed: missingFields.length === 0,
    severity: missingFields.length > 0 ? 'error' : 'info',
    details: missingFields.length > 0 
      ? `Missing required fields: ${missingFields.join(', ')}`
      : 'All required fields present',
  };
}

// ============================================
// Units Normalization
// ============================================

const UNIT_MAPPINGS: Record<string, string> = {
  'percent': '%',
  'percentage': '%',
  'pct': '%',
  'usd': 'USD',
  'us$': 'USD',
  'us dollars': 'USD',
  'yer': 'YER',
  'yemeni rial': 'YER',
  'yemeni rials': 'YER',
  'persons': 'people',
  'people': 'people',
  'population': 'people',
  'million': 'M',
  'billion': 'B',
  'thousand': 'K',
};

export function normalizeUnit(unit: string): string {
  const normalized = unit.toLowerCase().trim();
  return UNIT_MAPPINGS[normalized] || unit;
}

export function validateUnits(series: NormalizedSeries): ValidationCheck {
  const normalizedUnit = normalizeUnit(series.unit);
  const isStandard = Object.values(UNIT_MAPPINGS).includes(normalizedUnit) || 
                     ['USD', '%', 'YER', 'people', 'M', 'B', 'K', 'units', 'index'].includes(normalizedUnit);
  
  return {
    name: 'Units Validation',
    passed: isStandard,
    severity: isStandard ? 'info' : 'warning',
    details: isStandard 
      ? `Unit '${series.unit}' is standardized`
      : `Non-standard unit '${series.unit}' - consider normalizing`,
  };
}

// ============================================
// Currency Normalization
// ============================================

const VALID_CURRENCIES = ['USD', 'YER', 'EUR', 'GBP', 'SAR', 'AED'];

export function validateCurrency(series: NormalizedSeries): ValidationCheck {
  if (!series.currency) {
    return {
      name: 'Currency Validation',
      passed: true,
      severity: 'info',
      details: 'No currency specified (non-monetary indicator)',
    };
  }
  
  const isValid = VALID_CURRENCIES.includes(series.currency.toUpperCase());
  
  return {
    name: 'Currency Validation',
    passed: isValid,
    severity: isValid ? 'info' : 'warning',
    details: isValid 
      ? `Currency '${series.currency}' is valid`
      : `Unknown currency '${series.currency}'`,
  };
}

// ============================================
// Time Series Continuity Check
// ============================================

export function checkContinuity(observations: Observation[], frequency: string): ValidationCheck {
  if (observations.length < 2) {
    return {
      name: 'Continuity Check',
      passed: true,
      severity: 'info',
      details: 'Insufficient data points for continuity check',
    };
  }
  
  const sortedObs = [...observations].sort((a, b) => a.date.localeCompare(b.date));
  const gaps: string[] = [];
  
  for (let i = 1; i < sortedObs.length; i++) {
    const prevDate = new Date(sortedObs[i - 1].date);
    const currDate = new Date(sortedObs[i].date);
    
    let expectedGap: number;
    switch (frequency) {
      case 'daily':
        expectedGap = 1;
        break;
      case 'weekly':
        expectedGap = 7;
        break;
      case 'monthly':
        expectedGap = 28; // Approximate
        break;
      case 'quarterly':
        expectedGap = 90;
        break;
      case 'annual':
        expectedGap = 365;
        break;
      default:
        expectedGap = 365;
    }
    
    const actualGap = Math.abs(currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Allow 50% tolerance
    if (actualGap > expectedGap * 1.5) {
      gaps.push(`${sortedObs[i - 1].date} → ${sortedObs[i].date}`);
    }
  }
  
  return {
    name: 'Continuity Check',
    passed: gaps.length === 0,
    severity: gaps.length > 0 ? 'warning' : 'info',
    details: gaps.length > 0 
      ? `Data gaps detected: ${gaps.slice(0, 3).join(', ')}${gaps.length > 3 ? ` and ${gaps.length - 3} more` : ''}`
      : 'No significant gaps detected',
  };
}

// ============================================
// Duplicate Detection
// ============================================

export function checkDuplicates(observations: Observation[]): ValidationCheck {
  const seen = new Set<string>();
  const duplicates: string[] = [];
  
  for (const obs of observations) {
    const key = `${obs.date}:${obs.geoId || 'default'}`;
    if (seen.has(key)) {
      duplicates.push(obs.date);
    }
    seen.add(key);
  }
  
  return {
    name: 'Duplicate Detection',
    passed: duplicates.length === 0,
    severity: duplicates.length > 0 ? 'error' : 'info',
    details: duplicates.length > 0 
      ? `${duplicates.length} duplicate entries found`
      : 'No duplicates detected',
  };
}

// ============================================
// Outlier Detection
// ============================================

export function detectOutliers(observations: Observation[], threshold: number = 3): ValidationCheck {
  const values = observations
    .map(o => o.value)
    .filter((v): v is number => v !== null && !isNaN(v));
  
  if (values.length < 3) {
    return {
      name: 'Outlier Detection',
      passed: true,
      severity: 'info',
      details: 'Insufficient data points for outlier detection',
    };
  }
  
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
  );
  
  const outliers = values.filter(v => Math.abs(v - mean) > threshold * stdDev);
  
  return {
    name: 'Outlier Detection',
    passed: true, // Outliers are flagged but don't fail validation
    severity: outliers.length > 0 ? 'warning' : 'info',
    details: outliers.length > 0 
      ? `${outliers.length} potential outliers detected (>${threshold}σ from mean)`
      : 'No significant outliers detected',
  };
}

// ============================================
// Provenance Completeness
// ============================================

export function checkProvenance(series: NormalizedSeries): ValidationCheck {
  const required = ['sourceUrl', 'retrievalDate'];
  const missing = required.filter(field => !series.metadata[field as keyof typeof series.metadata]);
  
  return {
    name: 'Provenance Completeness',
    passed: missing.length === 0,
    severity: missing.length > 0 ? 'error' : 'info',
    details: missing.length > 0 
      ? `Missing provenance fields: ${missing.join(', ')}`
      : 'Provenance information complete',
  };
}

// ============================================
// Confidence Rating Validation
// ============================================

export function validateConfidence(series: NormalizedSeries): ValidationCheck {
  const validRatings = ['A', 'B', 'C', 'D'];
  const isValid = validRatings.includes(series.confidence);
  
  return {
    name: 'Confidence Rating',
    passed: isValid,
    severity: isValid ? 'info' : 'warning',
    details: isValid 
      ? `Confidence rating '${series.confidence}' is valid`
      : `Invalid confidence rating '${series.confidence}'`,
  };
}

// ============================================
// Full Validation Pipeline
// ============================================

export function validateSeries(series: NormalizedSeries): ValidationResult {
  const checks: ValidationCheck[] = [
    validateSchema(series),
    validateUnits(series),
    validateCurrency(series),
    checkContinuity(series.observations, series.frequency),
    checkDuplicates(series.observations),
    detectOutliers(series.observations),
    checkProvenance(series),
    validateConfidence(series),
  ];
  
  const errors = checks.filter(c => c.severity === 'error' && !c.passed);
  const warnings = checks.filter(c => c.severity === 'warning' && !c.passed);
  
  const passedChecks = checks.filter(c => c.passed).length;
  const score = Math.round((passedChecks / checks.length) * 100);
  
  return {
    passed: errors.length === 0,
    score,
    checks,
    warnings: warnings.map(w => w.details || w.name),
    errors: errors.map(e => e.details || e.name),
  };
}

// ============================================
// Data Transformations
// ============================================

/**
 * Convert currency values
 */
export function convertCurrency(
  value: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRate: number
): number {
  if (fromCurrency === toCurrency) return value;
  return value * exchangeRate;
}

/**
 * Calculate year-over-year change
 */
export function calculateYoYChange(observations: Observation[]): Observation[] {
  const sorted = [...observations].sort((a, b) => a.date.localeCompare(b.date));
  const result: Observation[] = [];
  
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    
    if (prev.value !== null && curr.value !== null && prev.value !== 0) {
      const change = ((curr.value - prev.value) / prev.value) * 100;
      result.push({
        date: curr.date,
        value: Math.round(change * 100) / 100,
        geoId: curr.geoId,
        flags: { ...curr.flags, transformation: 'yoy_change' },
      });
    }
  }
  
  return result;
}

/**
 * Calculate moving average
 */
export function calculateMovingAverage(observations: Observation[], window: number = 3): Observation[] {
  const sorted = [...observations].sort((a, b) => a.date.localeCompare(b.date));
  const result: Observation[] = [];
  
  for (let i = window - 1; i < sorted.length; i++) {
    const windowObs = sorted.slice(i - window + 1, i + 1);
    const values = windowObs.map(o => o.value).filter((v): v is number => v !== null);
    
    if (values.length === window) {
      const avg = values.reduce((a, b) => a + b, 0) / window;
      result.push({
        date: sorted[i].date,
        value: Math.round(avg * 100) / 100,
        geoId: sorted[i].geoId,
        flags: { ...sorted[i].flags, transformation: `ma_${window}` },
      });
    }
  }
  
  return result;
}

/**
 * Interpolate missing values
 */
export function interpolateMissing(observations: Observation[]): Observation[] {
  const sorted = [...observations].sort((a, b) => a.date.localeCompare(b.date));
  const result: Observation[] = [];
  
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].value !== null) {
      result.push(sorted[i]);
    } else {
      // Find previous and next non-null values
      let prevIdx = i - 1;
      let nextIdx = i + 1;
      
      while (prevIdx >= 0 && sorted[prevIdx].value === null) prevIdx--;
      while (nextIdx < sorted.length && sorted[nextIdx].value === null) nextIdx++;
      
      if (prevIdx >= 0 && nextIdx < sorted.length) {
        const prevVal = sorted[prevIdx].value!;
        const nextVal = sorted[nextIdx].value!;
        const interpolated = prevVal + (nextVal - prevVal) * ((i - prevIdx) / (nextIdx - prevIdx));
        
        result.push({
          ...sorted[i],
          value: Math.round(interpolated * 100) / 100,
          flags: { ...sorted[i].flags, interpolated: true },
        });
      } else {
        result.push(sorted[i]);
      }
    }
  }
  
  return result;
}

// ============================================
// Contradiction Detection
// ============================================

export interface Contradiction {
  indicatorCode: string;
  date: string;
  geoId: string;
  sources: Array<{
    sourceId: string;
    value: number;
    confidence: string;
  }>;
  variance: number;
  severity: 'low' | 'medium' | 'high';
}

export function detectContradictions(
  seriesA: NormalizedSeries,
  seriesB: NormalizedSeries
): Contradiction[] {
  const contradictions: Contradiction[] = [];
  
  // Build lookup for series B
  const bLookup = new Map<string, Observation>();
  for (const obs of seriesB.observations) {
    const key = `${obs.date}:${obs.geoId || 'default'}`;
    bLookup.set(key, obs);
  }
  
  // Compare with series A
  for (const obsA of seriesA.observations) {
    const key = `${obsA.date}:${obsA.geoId || 'default'}`;
    const obsB = bLookup.get(key);
    
    if (obsB && obsA.value !== null && obsB.value !== null) {
      const variance = Math.abs(obsA.value - obsB.value) / Math.max(Math.abs(obsA.value), Math.abs(obsB.value));
      
      // Flag if variance > 10%
      if (variance > 0.1) {
        let severity: 'low' | 'medium' | 'high' = 'low';
        if (variance > 0.5) severity = 'high';
        else if (variance > 0.25) severity = 'medium';
        
        contradictions.push({
          indicatorCode: seriesA.indicatorCode,
          date: obsA.date,
          geoId: obsA.geoId || 'default',
          sources: [
            { sourceId: seriesA.sourceId, value: obsA.value, confidence: seriesA.confidence },
            { sourceId: seriesB.sourceId, value: obsB.value, confidence: seriesB.confidence },
          ],
          variance: Math.round(variance * 100),
          severity,
        });
      }
    }
  }
  
  return contradictions;
}

// ============================================
// Export utilities
// ============================================

export function seriesToCSV(series: NormalizedSeries): string {
  const headers = ['date', 'value', 'geoId', 'unit', 'confidence', 'source'];
  const rows = series.observations.map(obs => [
    obs.date,
    obs.value?.toString() || '',
    obs.geoId || '',
    series.unit,
    series.confidence,
    series.sourceId,
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function seriesToJSON(series: NormalizedSeries): string {
  return JSON.stringify({
    indicator: {
      code: series.indicatorCode,
      name: series.indicatorName,
      unit: series.unit,
      currency: series.currency,
      frequency: series.frequency,
    },
    metadata: series.metadata,
    confidence: series.confidence,
    observations: series.observations,
  }, null, 2);
}
