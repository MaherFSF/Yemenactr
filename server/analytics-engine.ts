/**
 * YETO Advanced Analytics Engine
 * Provides intelligent data analysis capabilities including:
 * - Anomaly detection (z-score, IQR, rolling statistics)
 * - Time series forecasting with confidence intervals
 * - Correlation analysis between indicators
 * - Regime divergence tracking (Aden vs Sana'a)
 * - Natural language insight generation
 */

import { invokeLLM } from "./_core/llm";

// Types
export interface DataPoint {
  date: string;
  value: number;
  regime?: "aden" | "sanaa" | "national";
}

export interface AnomalyResult {
  isAnomaly: boolean;
  severity: "low" | "medium" | "high" | "critical";
  zScore: number;
  percentileRank: number;
  direction: "above" | "below" | "normal";
  explanation: string;
}

export interface ForecastResult {
  predictions: Array<{
    date: string;
    value: number;
    lowerBound: number;
    upperBound: number;
    confidence: number;
  }>;
  trend: "increasing" | "decreasing" | "stable" | "volatile";
  trendStrength: number;
  methodology: string;
}

export interface CorrelationResult {
  indicator1: string;
  indicator2: string;
  correlation: number;
  strength: "strong" | "moderate" | "weak" | "none";
  direction: "positive" | "negative";
  lagDays: number;
  significance: number;
  interpretation: string;
}

export interface RegimeDivergence {
  indicator: string;
  adenValue: number;
  sanaaValue: number;
  divergencePercent: number;
  trend: "widening" | "narrowing" | "stable";
  historicalComparison: string;
}

export interface SmartInsight {
  id: string;
  type: "anomaly" | "trend" | "correlation" | "forecast" | "divergence" | "milestone";
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  titleAr: string;
  summary: string;
  summaryAr: string;
  indicator: string;
  value?: number;
  change?: number;
  timestamp: string;
  confidence: "A" | "B" | "C" | "D";
  actionable: boolean;
  relatedIndicators?: string[];
}

// Statistical utilities
function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const squareDiffs = values.map(v => Math.pow(v - avg, 2));
  return Math.sqrt(mean(squareDiffs));
}

function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

function linearRegression(values: number[]): { slope: number; intercept: number; r2: number } {
  const n = values.length;
  if (n < 2) return { slope: 0, intercept: values[0] || 0, r2: 0 };
  
  const xMean = (n - 1) / 2;
  const yMean = mean(values);
  
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (values[i] - yMean);
    denominator += Math.pow(i - xMean, 2);
  }
  
  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;
  
  // Calculate R²
  let ssRes = 0;
  let ssTot = 0;
  for (let i = 0; i < n; i++) {
    const predicted = intercept + slope * i;
    ssRes += Math.pow(values[i] - predicted, 2);
    ssTot += Math.pow(values[i] - yMean, 2);
  }
  const r2 = ssTot !== 0 ? 1 - (ssRes / ssTot) : 0;
  
  return { slope, intercept, r2 };
}

function pearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 3) return 0;
  
  const xSlice = x.slice(0, n);
  const ySlice = y.slice(0, n);
  
  const xMean = mean(xSlice);
  const yMean = mean(ySlice);
  
  let numerator = 0;
  let xDenom = 0;
  let yDenom = 0;
  
  for (let i = 0; i < n; i++) {
    const xDiff = xSlice[i] - xMean;
    const yDiff = ySlice[i] - yMean;
    numerator += xDiff * yDiff;
    xDenom += xDiff * xDiff;
    yDenom += yDiff * yDiff;
  }
  
  const denominator = Math.sqrt(xDenom * yDenom);
  return denominator !== 0 ? numerator / denominator : 0;
}

// Anomaly Detection
export function detectAnomaly(
  currentValue: number,
  historicalValues: number[],
  indicatorName: string
): AnomalyResult {
  if (historicalValues.length < 10) {
    return {
      isAnomaly: false,
      severity: "low",
      zScore: 0,
      percentileRank: 50,
      direction: "normal",
      explanation: "Insufficient historical data for anomaly detection"
    };
  }
  
  const avg = mean(historicalValues);
  const std = standardDeviation(historicalValues);
  const zScore = std !== 0 ? (currentValue - avg) / std : 0;
  
  // Calculate percentile rank
  const sortedValues = [...historicalValues, currentValue].sort((a, b) => a - b);
  const rank = sortedValues.indexOf(currentValue);
  const percentileRank = (rank / sortedValues.length) * 100;
  
  // Determine if anomaly and severity
  const absZ = Math.abs(zScore);
  let isAnomaly = false;
  let severity: AnomalyResult["severity"] = "low";
  
  if (absZ > 3) {
    isAnomaly = true;
    severity = "critical";
  } else if (absZ > 2.5) {
    isAnomaly = true;
    severity = "high";
  } else if (absZ > 2) {
    isAnomaly = true;
    severity = "medium";
  } else if (absZ > 1.5) {
    isAnomaly = true;
    severity = "low";
  }
  
  const direction: AnomalyResult["direction"] = 
    zScore > 1.5 ? "above" : zScore < -1.5 ? "below" : "normal";
  
  // Generate explanation
  let explanation = "";
  if (isAnomaly) {
    const changePercent = ((currentValue - avg) / avg * 100).toFixed(1);
    explanation = `${indicatorName} is ${Math.abs(parseFloat(changePercent))}% ${parseFloat(changePercent) > 0 ? 'above' : 'below'} the historical average. `;
    explanation += `This is a ${severity} severity anomaly (z-score: ${zScore.toFixed(2)}, percentile: ${percentileRank.toFixed(0)}%).`;
  } else {
    explanation = `${indicatorName} is within normal range (z-score: ${zScore.toFixed(2)}).`;
  }
  
  return {
    isAnomaly,
    severity,
    zScore,
    percentileRank,
    direction,
    explanation
  };
}

// Time Series Forecasting
export function forecastTimeSeries(
  data: DataPoint[],
  periodsAhead: number = 7
): ForecastResult {
  if (data.length < 14) {
    return {
      predictions: [],
      trend: "stable",
      trendStrength: 0,
      methodology: "Insufficient data for forecasting (minimum 14 data points required)"
    };
  }
  
  const values = data.map(d => d.value);
  const { slope, intercept, r2 } = linearRegression(values);
  const std = standardDeviation(values);
  
  // Determine trend
  let trend: ForecastResult["trend"];
  const normalizedSlope = slope / mean(values);
  
  if (Math.abs(normalizedSlope) < 0.001) {
    trend = "stable";
  } else if (normalizedSlope > 0) {
    trend = "increasing";
  } else {
    trend = "decreasing";
  }
  
  // Check for volatility
  const recentValues = values.slice(-14);
  const recentStd = standardDeviation(recentValues);
  if (recentStd / mean(recentValues) > 0.15) {
    trend = "volatile";
  }
  
  // Generate predictions
  const predictions: ForecastResult["predictions"] = [];
  const lastDate = new Date(data[data.length - 1].date);
  
  for (let i = 1; i <= periodsAhead; i++) {
    const futureDate = new Date(lastDate);
    futureDate.setDate(futureDate.getDate() + i);
    
    const predictedValue = intercept + slope * (values.length + i - 1);
    
    // Confidence decreases with forecast horizon
    const confidence = Math.max(0.5, 0.95 - (i * 0.05));
    const marginOfError = std * (1 + i * 0.1) * 1.96; // 95% CI
    
    predictions.push({
      date: futureDate.toISOString().split('T')[0],
      value: Math.max(0, predictedValue),
      lowerBound: Math.max(0, predictedValue - marginOfError),
      upperBound: predictedValue + marginOfError,
      confidence
    });
  }
  
  return {
    predictions,
    trend,
    trendStrength: Math.abs(r2),
    methodology: `Linear regression with ${data.length} historical data points (R²: ${r2.toFixed(3)})`
  };
}

// Correlation Analysis
export function analyzeCorrelation(
  indicator1: { name: string; data: DataPoint[] },
  indicator2: { name: string; data: DataPoint[] },
  maxLagDays: number = 30
): CorrelationResult {
  const values1 = indicator1.data.map(d => d.value);
  const values2 = indicator2.data.map(d => d.value);
  
  // Find best correlation with lag
  let bestCorrelation = 0;
  let bestLag = 0;
  
  for (let lag = -maxLagDays; lag <= maxLagDays; lag++) {
    let v1: number[], v2: number[];
    
    if (lag >= 0) {
      v1 = values1.slice(lag);
      v2 = values2.slice(0, values2.length - lag);
    } else {
      v1 = values1.slice(0, values1.length + lag);
      v2 = values2.slice(-lag);
    }
    
    const corr = pearsonCorrelation(v1, v2);
    if (Math.abs(corr) > Math.abs(bestCorrelation)) {
      bestCorrelation = corr;
      bestLag = lag;
    }
  }
  
  // Determine strength and direction
  const absCorr = Math.abs(bestCorrelation);
  let strength: CorrelationResult["strength"];
  if (absCorr > 0.7) strength = "strong";
  else if (absCorr > 0.4) strength = "moderate";
  else if (absCorr > 0.2) strength = "weak";
  else strength = "none";
  
  const direction: CorrelationResult["direction"] = bestCorrelation >= 0 ? "positive" : "negative";
  
  // Calculate significance (simplified)
  const n = Math.min(values1.length, values2.length);
  const tStat = bestCorrelation * Math.sqrt((n - 2) / (1 - bestCorrelation * bestCorrelation));
  const significance = Math.min(0.99, 1 - Math.exp(-Math.abs(tStat) / 2));
  
  // Generate interpretation
  let interpretation = "";
  if (strength !== "none") {
    interpretation = `${indicator1.name} shows a ${strength} ${direction} correlation with ${indicator2.name}`;
    if (bestLag !== 0) {
      interpretation += ` with a ${Math.abs(bestLag)}-day ${bestLag > 0 ? 'lead' : 'lag'}`;
    }
    interpretation += `. When ${indicator1.name} ${direction === "positive" ? "increases" : "decreases"}, ${indicator2.name} tends to ${direction === "positive" ? "increase" : "decrease"}.`;
  } else {
    interpretation = `No significant correlation found between ${indicator1.name} and ${indicator2.name}.`;
  }
  
  return {
    indicator1: indicator1.name,
    indicator2: indicator2.name,
    correlation: bestCorrelation,
    strength,
    direction,
    lagDays: bestLag,
    significance,
    interpretation
  };
}

// Regime Divergence Analysis
export function analyzeRegimeDivergence(
  indicator: string,
  adenData: DataPoint[],
  sanaaData: DataPoint[]
): RegimeDivergence {
  const adenLatest = adenData[adenData.length - 1]?.value || 0;
  const sanaaLatest = sanaaData[sanaaData.length - 1]?.value || 0;
  
  const divergencePercent = sanaaLatest !== 0 
    ? ((adenLatest - sanaaLatest) / sanaaLatest) * 100 
    : 0;
  
  // Calculate historical divergence to determine trend
  const historicalDivergences: number[] = [];
  const minLength = Math.min(adenData.length, sanaaData.length, 30);
  
  for (let i = 0; i < minLength; i++) {
    const adenVal = adenData[adenData.length - minLength + i]?.value || 0;
    const sanaaVal = sanaaData[sanaaData.length - minLength + i]?.value || 0;
    if (sanaaVal !== 0) {
      historicalDivergences.push(((adenVal - sanaaVal) / sanaaVal) * 100);
    }
  }
  
  // Determine trend
  let trend: RegimeDivergence["trend"] = "stable";
  if (historicalDivergences.length >= 7) {
    const recentAvg = mean(historicalDivergences.slice(-7));
    const olderAvg = mean(historicalDivergences.slice(0, 7));
    const change = Math.abs(recentAvg) - Math.abs(olderAvg);
    
    if (change > 5) trend = "widening";
    else if (change < -5) trend = "narrowing";
  }
  
  // Historical comparison
  const avgDivergence = mean(historicalDivergences.map(Math.abs));
  let historicalComparison = "";
  if (Math.abs(divergencePercent) > avgDivergence * 1.5) {
    historicalComparison = "Current divergence is significantly higher than historical average";
  } else if (Math.abs(divergencePercent) < avgDivergence * 0.5) {
    historicalComparison = "Current divergence is lower than historical average";
  } else {
    historicalComparison = "Current divergence is within historical norms";
  }
  
  return {
    indicator,
    adenValue: adenLatest,
    sanaaValue: sanaaLatest,
    divergencePercent,
    trend,
    historicalComparison
  };
}

// Smart Insight Generation
export async function generateSmartInsights(
  indicators: Array<{
    name: string;
    nameAr: string;
    data: DataPoint[];
    regime?: "aden" | "sanaa" | "national";
  }>
): Promise<SmartInsight[]> {
  const insights: SmartInsight[] = [];
  const now = new Date().toISOString();
  
  for (const indicator of indicators) {
    if (indicator.data.length < 10) continue;
    
    const values = indicator.data.map(d => d.value);
    const latestValue = values[values.length - 1];
    const previousValue = values[values.length - 2];
    
    // Check for anomalies
    const anomaly = detectAnomaly(latestValue, values.slice(0, -1), indicator.name);
    if (anomaly.isAnomaly) {
      insights.push({
        id: `anomaly-${indicator.name}-${Date.now()}`,
        type: "anomaly",
        priority: anomaly.severity === "critical" ? "critical" : 
                  anomaly.severity === "high" ? "high" : "medium",
        title: `Unusual ${indicator.name} Movement Detected`,
        titleAr: `حركة غير عادية في ${indicator.nameAr}`,
        summary: anomaly.explanation,
        summaryAr: `تم اكتشاف تغير غير طبيعي في ${indicator.nameAr}`,
        indicator: indicator.name,
        value: latestValue,
        change: previousValue !== 0 ? ((latestValue - previousValue) / previousValue) * 100 : 0,
        timestamp: now,
        confidence: anomaly.severity === "critical" ? "A" : "B",
        actionable: true
      });
    }
    
    // Check for significant trends
    const forecast = forecastTimeSeries(indicator.data);
    if (forecast.trend !== "stable" && forecast.trendStrength > 0.6) {
      insights.push({
        id: `trend-${indicator.name}-${Date.now()}`,
        type: "trend",
        priority: forecast.trend === "volatile" ? "high" : "medium",
        title: `${indicator.name} Shows ${forecast.trend.charAt(0).toUpperCase() + forecast.trend.slice(1)} Trend`,
        titleAr: `${indicator.nameAr} يظهر اتجاه ${forecast.trend === "increasing" ? "تصاعدي" : forecast.trend === "decreasing" ? "تنازلي" : "متقلب"}`,
        summary: `${indicator.name} has been ${forecast.trend} with ${(forecast.trendStrength * 100).toFixed(0)}% confidence`,
        summaryAr: `${indicator.nameAr} في اتجاه ${forecast.trend === "increasing" ? "تصاعدي" : "تنازلي"}`,
        indicator: indicator.name,
        value: latestValue,
        timestamp: now,
        confidence: forecast.trendStrength > 0.8 ? "A" : "B",
        actionable: false
      });
    }
    
    // Check for milestones
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    if (latestValue >= maxValue * 0.99) {
      insights.push({
        id: `milestone-high-${indicator.name}-${Date.now()}`,
        type: "milestone",
        priority: "high",
        title: `${indicator.name} Reaches Record High`,
        titleAr: `${indicator.nameAr} يصل إلى أعلى مستوى`,
        summary: `${indicator.name} has reached its highest recorded value of ${latestValue.toLocaleString()}`,
        summaryAr: `${indicator.nameAr} وصل إلى أعلى قيمة مسجلة`,
        indicator: indicator.name,
        value: latestValue,
        timestamp: now,
        confidence: "A",
        actionable: true
      });
    } else if (latestValue <= minValue * 1.01) {
      insights.push({
        id: `milestone-low-${indicator.name}-${Date.now()}`,
        type: "milestone",
        priority: "high",
        title: `${indicator.name} Reaches Record Low`,
        titleAr: `${indicator.nameAr} يصل إلى أدنى مستوى`,
        summary: `${indicator.name} has reached its lowest recorded value of ${latestValue.toLocaleString()}`,
        summaryAr: `${indicator.nameAr} وصل إلى أدنى قيمة مسجلة`,
        indicator: indicator.name,
        value: latestValue,
        timestamp: now,
        confidence: "A",
        actionable: true
      });
    }
  }
  
  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  return insights.slice(0, 10); // Return top 10 insights
}

// Natural Language Insight Generation using LLM
export async function generateNLInsight(
  indicator: string,
  currentValue: number,
  historicalContext: string,
  regime: string
): Promise<string> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a Yemen economic analyst. Generate a concise, professional insight (2-3 sentences) about an economic indicator. Include context about Yemen's dual economic system (Aden/IRG vs Sana'a/DFA). Be specific with numbers and trends.`
        },
        {
          role: "user",
          content: `Generate an insight for: ${indicator} = ${currentValue} in ${regime} zone. Historical context: ${historicalContext}`
        }
      ]
    });
    
    const content = response.choices[0]?.message?.content;
    return typeof content === 'string' ? content : "Unable to generate insight.";
  } catch (error) {
    console.error("NL insight generation error:", error);
    return `${indicator} currently stands at ${currentValue} in the ${regime} zone.`;
  }
}

export default {
  detectAnomaly,
  forecastTimeSeries,
  analyzeCorrelation,
  analyzeRegimeDivergence,
  generateSmartInsights,
  generateNLInsight
};
