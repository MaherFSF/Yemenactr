/**
 * YETO Data Pipeline - ML Models
 * Forecasting and Anomaly Detection services
 */

import { TimeSeriesPoint } from './storage';

// ============================================
// FORECASTING SERVICE
// ============================================

export interface ForecastResult {
  predictions: { date: Date; value: number; confidence: number }[];
  model: string;
  accuracy: number;
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  seasonality?: { period: number; strength: number };
}

export interface ForecastConfig {
  horizon: number; // Number of periods to forecast
  method: 'linear' | 'exponential' | 'arima' | 'prophet';
  confidenceLevel: number; // 0.8, 0.9, 0.95
  includeSeasonality: boolean;
}

/**
 * Linear Regression Forecasting
 */
function linearForecast(
  data: TimeSeriesPoint[],
  horizon: number
): { predictions: { date: Date; value: number; confidence: number }[]; slope: number; intercept: number } {
  if (data.length < 2) {
    return { predictions: [], slope: 0, intercept: 0 };
  }
  
  // Convert to numeric indices
  const n = data.length;
  const xValues = data.map((_, i) => i);
  const yValues = data.map(d => d.value);
  
  // Calculate means
  const xMean = xValues.reduce((a, b) => a + b, 0) / n;
  const yMean = yValues.reduce((a, b) => a + b, 0) / n;
  
  // Calculate slope and intercept
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    numerator += (xValues[i] - xMean) * (yValues[i] - yMean);
    denominator += Math.pow(xValues[i] - xMean, 2);
  }
  
  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;
  
  // Calculate R-squared for confidence
  const predictions: { date: Date; value: number; confidence: number }[] = [];
  let ssRes = 0;
  let ssTot = 0;
  
  for (let i = 0; i < n; i++) {
    const predicted = slope * i + intercept;
    ssRes += Math.pow(yValues[i] - predicted, 2);
    ssTot += Math.pow(yValues[i] - yMean, 2);
  }
  
  const rSquared = ssTot !== 0 ? 1 - (ssRes / ssTot) : 0;
  const confidence = Math.max(0.5, Math.min(0.99, rSquared));
  
  // Generate predictions
  const lastDate = data[data.length - 1].timestamp;
  const avgInterval = n > 1 
    ? (data[n - 1].timestamp.getTime() - data[0].timestamp.getTime()) / (n - 1)
    : 24 * 60 * 60 * 1000; // Default to 1 day
  
  for (let i = 1; i <= horizon; i++) {
    const predictedValue = slope * (n + i - 1) + intercept;
    const predictedDate = new Date(lastDate.getTime() + avgInterval * i);
    
    // Confidence decreases with distance
    const adjustedConfidence = confidence * Math.pow(0.95, i);
    
    predictions.push({
      date: predictedDate,
      value: predictedValue,
      confidence: adjustedConfidence
    });
  }
  
  return { predictions, slope, intercept };
}

/**
 * Exponential Smoothing Forecasting
 */
function exponentialForecast(
  data: TimeSeriesPoint[],
  horizon: number,
  alpha: number = 0.3
): { predictions: { date: Date; value: number; confidence: number }[]; level: number } {
  if (data.length < 2) {
    return { predictions: [], level: 0 };
  }
  
  const values = data.map(d => d.value);
  
  // Simple exponential smoothing
  let level = values[0];
  for (let i = 1; i < values.length; i++) {
    level = alpha * values[i] + (1 - alpha) * level;
  }
  
  // Generate predictions
  const predictions: { date: Date; value: number; confidence: number }[] = [];
  const lastDate = data[data.length - 1].timestamp;
  const avgInterval = data.length > 1
    ? (data[data.length - 1].timestamp.getTime() - data[0].timestamp.getTime()) / (data.length - 1)
    : 24 * 60 * 60 * 1000;
  
  // Calculate variance for confidence
  const residuals = values.map((v, i) => {
    let smoothed = values[0];
    for (let j = 1; j <= i; j++) {
      smoothed = alpha * values[j] + (1 - alpha) * smoothed;
    }
    return v - smoothed;
  });
  
  const variance = residuals.reduce((sum, r) => sum + r * r, 0) / residuals.length;
  const stdDev = Math.sqrt(variance);
  const baseConfidence = Math.max(0.5, 1 - (stdDev / Math.abs(level || 1)));
  
  for (let i = 1; i <= horizon; i++) {
    const predictedDate = new Date(lastDate.getTime() + avgInterval * i);
    const adjustedConfidence = baseConfidence * Math.pow(0.9, i);
    
    predictions.push({
      date: predictedDate,
      value: level,
      confidence: adjustedConfidence
    });
  }
  
  return { predictions, level };
}

/**
 * Detect seasonality in time series
 */
function detectSeasonality(data: TimeSeriesPoint[]): { period: number; strength: number } | null {
  if (data.length < 12) return null;
  
  const values = data.map(d => d.value);
  const n = values.length;
  
  // Try common periods: 7 (weekly), 12 (monthly), 30 (daily-monthly)
  const periods = [7, 12, 30, 52];
  let bestPeriod = 0;
  let bestStrength = 0;
  
  for (const period of periods) {
    if (n < period * 2) continue;
    
    // Calculate autocorrelation at this lag
    const mean = values.reduce((a, b) => a + b, 0) / n;
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n - period; i++) {
      numerator += (values[i] - mean) * (values[i + period] - mean);
    }
    
    for (let i = 0; i < n; i++) {
      denominator += Math.pow(values[i] - mean, 2);
    }
    
    const autocorr = denominator !== 0 ? numerator / denominator : 0;
    
    if (autocorr > bestStrength) {
      bestStrength = autocorr;
      bestPeriod = period;
    }
  }
  
  if (bestStrength > 0.3) {
    return { period: bestPeriod, strength: bestStrength };
  }
  
  return null;
}

/**
 * Main forecasting function
 */
export function forecast(
  data: TimeSeriesPoint[],
  config: ForecastConfig
): ForecastResult {
  if (data.length < 3) {
    return {
      predictions: [],
      model: 'insufficient_data',
      accuracy: 0,
      trend: 'stable'
    };
  }
  
  let predictions: { date: Date; value: number; confidence: number }[];
  let model: string;
  let accuracy: number;
  
  switch (config.method) {
    case 'exponential':
      const expResult = exponentialForecast(data, config.horizon);
      predictions = expResult.predictions;
      model = 'exponential_smoothing';
      accuracy = predictions.length > 0 ? predictions[0].confidence : 0;
      break;
    
    case 'linear':
    default:
      const linResult = linearForecast(data, config.horizon);
      predictions = linResult.predictions;
      model = 'linear_regression';
      accuracy = predictions.length > 0 ? predictions[0].confidence : 0;
      break;
  }
  
  // Determine trend
  const values = data.map(d => d.value);
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  let trend: ForecastResult['trend'];
  const change = firstAvg !== 0 ? (secondAvg - firstAvg) / Math.abs(firstAvg) : 0;
  
  // Check volatility
  const variance = values.reduce((sum, v) => sum + Math.pow(v - (values.reduce((a, b) => a + b, 0) / values.length), 2), 0) / values.length;
  const cv = Math.sqrt(variance) / Math.abs(values.reduce((a, b) => a + b, 0) / values.length);
  
  if (cv > 0.5) {
    trend = 'volatile';
  } else if (change > 0.1) {
    trend = 'increasing';
  } else if (change < -0.1) {
    trend = 'decreasing';
  } else {
    trend = 'stable';
  }
  
  // Detect seasonality
  const seasonality = config.includeSeasonality ? detectSeasonality(data) : undefined;
  
  return {
    predictions,
    model,
    accuracy,
    trend,
    seasonality: seasonality || undefined
  };
}

// ============================================
// ANOMALY DETECTION SERVICE
// ============================================

export interface AnomalyResult {
  isAnomaly: boolean;
  score: number; // 0-1, higher = more anomalous
  type: 'spike' | 'drop' | 'trend_break' | 'level_shift' | 'none';
  severity: 'low' | 'medium' | 'high' | 'critical';
  expectedValue: number;
  actualValue: number;
  deviation: number;
  explanation: string;
}

export interface AnomalyConfig {
  method: 'zscore' | 'iqr' | 'isolation_forest' | 'moving_average';
  sensitivity: 'low' | 'medium' | 'high';
  windowSize?: number;
}

/**
 * Z-Score based anomaly detection
 */
function zscoreAnomaly(
  value: number,
  historicalValues: number[],
  threshold: number
): { isAnomaly: boolean; zscore: number; mean: number; stdDev: number } {
  if (historicalValues.length < 3) {
    return { isAnomaly: false, zscore: 0, mean: value, stdDev: 0 };
  }
  
  const mean = historicalValues.reduce((a, b) => a + b, 0) / historicalValues.length;
  const variance = historicalValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / historicalValues.length;
  const stdDev = Math.sqrt(variance);
  
  if (stdDev === 0) {
    return { isAnomaly: value !== mean, zscore: value !== mean ? Infinity : 0, mean, stdDev };
  }
  
  const zscore = Math.abs((value - mean) / stdDev);
  
  return {
    isAnomaly: zscore > threshold,
    zscore,
    mean,
    stdDev
  };
}

/**
 * IQR (Interquartile Range) based anomaly detection
 */
function iqrAnomaly(
  value: number,
  historicalValues: number[],
  multiplier: number = 1.5
): { isAnomaly: boolean; iqr: number; lowerBound: number; upperBound: number } {
  if (historicalValues.length < 4) {
    return { isAnomaly: false, iqr: 0, lowerBound: value, upperBound: value };
  }
  
  const sorted = [...historicalValues].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  
  const lowerBound = q1 - multiplier * iqr;
  const upperBound = q3 + multiplier * iqr;
  
  return {
    isAnomaly: value < lowerBound || value > upperBound,
    iqr,
    lowerBound,
    upperBound
  };
}

/**
 * Moving average based anomaly detection
 */
function movingAverageAnomaly(
  values: number[],
  windowSize: number,
  threshold: number
): { anomalies: number[]; movingAvg: number[] } {
  const anomalies: number[] = [];
  const movingAvg: number[] = [];
  
  for (let i = 0; i < values.length; i++) {
    if (i < windowSize - 1) {
      movingAvg.push(values[i]);
      continue;
    }
    
    const window = values.slice(i - windowSize + 1, i + 1);
    const avg = window.reduce((a, b) => a + b, 0) / windowSize;
    movingAvg.push(avg);
    
    const deviation = Math.abs(values[i] - avg) / Math.abs(avg || 1);
    if (deviation > threshold) {
      anomalies.push(i);
    }
  }
  
  return { anomalies, movingAvg };
}

/**
 * Main anomaly detection function
 */
export function detectAnomaly(
  currentValue: number,
  historicalData: TimeSeriesPoint[],
  config: AnomalyConfig
): AnomalyResult {
  const historicalValues = historicalData.map(d => d.value);
  
  if (historicalValues.length < 5) {
    return {
      isAnomaly: false,
      score: 0,
      type: 'none',
      severity: 'low',
      expectedValue: currentValue,
      actualValue: currentValue,
      deviation: 0,
      explanation: 'Insufficient historical data for anomaly detection'
    };
  }
  
  // Set threshold based on sensitivity
  let threshold: number;
  switch (config.sensitivity) {
    case 'high':
      threshold = 2;
      break;
    case 'low':
      threshold = 4;
      break;
    case 'medium':
    default:
      threshold = 3;
  }
  
  let isAnomaly = false;
  let score = 0;
  let expectedValue: number;
  
  switch (config.method) {
    case 'iqr':
      const iqrResult = iqrAnomaly(currentValue, historicalValues);
      isAnomaly = iqrResult.isAnomaly;
      expectedValue = (iqrResult.lowerBound + iqrResult.upperBound) / 2;
      score = isAnomaly ? Math.min(1, Math.abs(currentValue - expectedValue) / iqrResult.iqr) : 0;
      break;
    
    case 'moving_average':
      const windowSize = config.windowSize || 7;
      const maResult = movingAverageAnomaly(historicalValues, windowSize, threshold / 10);
      isAnomaly = maResult.anomalies.includes(historicalValues.length - 1);
      expectedValue = maResult.movingAvg[maResult.movingAvg.length - 1];
      score = isAnomaly ? 0.8 : 0;
      break;
    
    case 'zscore':
    default:
      const zResult = zscoreAnomaly(currentValue, historicalValues, threshold);
      isAnomaly = zResult.isAnomaly;
      expectedValue = zResult.mean;
      score = Math.min(1, zResult.zscore / (threshold * 2));
      break;
  }
  
  // Determine anomaly type
  let type: AnomalyResult['type'] = 'none';
  const deviation = expectedValue !== 0 ? (currentValue - expectedValue) / Math.abs(expectedValue) : 0;
  
  if (isAnomaly) {
    if (deviation > 0.5) type = 'spike';
    else if (deviation < -0.5) type = 'drop';
    else if (Math.abs(deviation) > 0.2) type = 'level_shift';
    else type = 'trend_break';
  }
  
  // Determine severity
  let severity: AnomalyResult['severity'] = 'low';
  if (score > 0.9) severity = 'critical';
  else if (score > 0.7) severity = 'high';
  else if (score > 0.4) severity = 'medium';
  
  // Generate explanation
  let explanation = '';
  if (isAnomaly) {
    explanation = `Detected ${type} anomaly. Current value (${currentValue.toFixed(2)}) ` +
      `deviates ${(Math.abs(deviation) * 100).toFixed(1)}% from expected (${expectedValue.toFixed(2)}). ` +
      `Severity: ${severity}.`;
  } else {
    explanation = 'Value is within normal range.';
  }
  
  return {
    isAnomaly,
    score,
    type,
    severity,
    expectedValue,
    actualValue: currentValue,
    deviation,
    explanation
  };
}

/**
 * Batch anomaly detection for time series
 */
export function detectAnomaliesInSeries(
  data: TimeSeriesPoint[],
  config: AnomalyConfig
): { point: TimeSeriesPoint; result: AnomalyResult }[] {
  const results: { point: TimeSeriesPoint; result: AnomalyResult }[] = [];
  
  for (let i = 5; i < data.length; i++) {
    const historical = data.slice(0, i);
    const current = data[i];
    
    const result = detectAnomaly(current.value, historical, config);
    results.push({ point: current, result });
  }
  
  return results;
}

// ============================================
// MODEL MONITORING
// ============================================

export interface ModelMetrics {
  modelId: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastUpdated: Date;
  predictions: number;
  correctPredictions: number;
  drift: number;
}

class ModelMonitor {
  private metrics: Map<string, ModelMetrics> = new Map();
  
  /**
   * Record a prediction
   */
  recordPrediction(modelId: string, predicted: number, actual: number): void {
    let metrics = this.metrics.get(modelId);
    
    if (!metrics) {
      metrics = {
        modelId,
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0,
        lastUpdated: new Date(),
        predictions: 0,
        correctPredictions: 0,
        drift: 0
      };
      this.metrics.set(modelId, metrics);
    }
    
    metrics.predictions++;
    
    // Consider prediction correct if within 10% of actual
    const error = Math.abs(predicted - actual) / Math.abs(actual || 1);
    if (error < 0.1) {
      metrics.correctPredictions++;
    }
    
    metrics.accuracy = metrics.correctPredictions / metrics.predictions;
    metrics.lastUpdated = new Date();
    
    // Calculate drift (change in accuracy over time)
    // Simplified: compare recent accuracy to overall
    if (metrics.predictions > 10) {
      const recentAccuracy = metrics.correctPredictions / metrics.predictions;
      metrics.drift = Math.abs(recentAccuracy - metrics.accuracy);
    }
  }
  
  /**
   * Get metrics for a model
   */
  getMetrics(modelId: string): ModelMetrics | undefined {
    return this.metrics.get(modelId);
  }
  
  /**
   * Get all model metrics
   */
  getAllMetrics(): ModelMetrics[] {
    return Array.from(this.metrics.values());
  }
  
  /**
   * Check if model needs retraining
   */
  needsRetraining(modelId: string, driftThreshold: number = 0.1): boolean {
    const metrics = this.metrics.get(modelId);
    if (!metrics) return false;
    
    return metrics.drift > driftThreshold || metrics.accuracy < 0.7;
  }
}

export const modelMonitor = new ModelMonitor();
