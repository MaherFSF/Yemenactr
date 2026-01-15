/**
 * Real-time ML Pipeline Core
 * Handles streaming data, feature engineering, and online learning
 * 
 * Architecture:
 * Data Stream → Feature Engineering → Model Inference → Insight Generation → Feedback
 */

import { EventEmitter } from 'events';

// Types are defined locally to avoid circular dependencies
type TimeSeries = unknown;
type Indicator = unknown;
type DataPoint = unknown;

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface StreamEvent {
  id: string;
  timestamp: Date;
  source: string;
  dataType: 'timeseries' | 'event' | 'document' | 'indicator';
  data: unknown;
  metadata: Record<string, unknown>;
}

export interface Feature {
  name: string;
  value: number;
  timestamp: Date;
  source: string;
  confidence: number;
}

export interface FeatureVector {
  timestamp: Date;
  features: Feature[];
  rawData: unknown;
}

export interface ModelInference {
  timestamp: Date;
  modelId: string;
  modelVersion: string;
  input: FeatureVector;
  prediction: number;
  confidence: number;
  uncertainty: {
    lower: number;
    upper: number;
  };
  featureImportance: Record<string, number>;
}

export interface Insight {
  id: string;
  timestamp: Date;
  type: 'anomaly' | 'trend' | 'forecast' | 'correlation' | 'causality';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  evidence: string[];
  relatedIndicators: string[];
  relatedEvents: string[];
  actionItems: string[];
  confidence: number;
}

export interface OnlineLearningMetrics {
  samplesProcessed: number;
  modelsUpdated: number;
  driftDetected: boolean;
  performanceMetrics: {
    mae: number;
    rmse: number;
    mape: number;
  };
  lastUpdateTime: Date;
}

// ============================================================================
// Real-time Pipeline
// ============================================================================

export class RealtimePipeline extends EventEmitter {
  private streamBuffer: StreamEvent[] = [];
  private featureCache: Map<string, FeatureVector[]> = new Map();
  private modelInferences: ModelInference[] = [];
  private insights: Insight[] = [];
  private metrics: OnlineLearningMetrics = {
    samplesProcessed: 0,
    modelsUpdated: 0,
    driftDetected: false,
    performanceMetrics: { mae: 0, rmse: 0, mape: 0 },
    lastUpdateTime: new Date(),
  };

  private bufferSize: number = 1000;
  private flushInterval: number = 5000; // 5 seconds
  private featureWindow: number = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    super();
    this.startFlushTimer();
  }

  /**
   * Ingest streaming data
   */
  public ingestEvent(event: StreamEvent): void {
    this.streamBuffer.push(event);
    this.emit('event:ingested', event);

    // Auto-flush if buffer is full
    if (this.streamBuffer.length >= this.bufferSize) {
      this.flush();
    }
  }

  /**
   * Process buffered events
   */
  public flush(): void {
    if (this.streamBuffer.length === 0) return;

    const events = this.streamBuffer.splice(0, this.bufferSize);

    // Extract features from events
    const featureVectors = this.extractFeatures(events);

    // Run model inference
    const inferences = this.runInference(featureVectors);

    // Generate insights
    const newInsights = this.generateInsights(inferences);

    // Update online learning
    this.updateOnlineLearning(featureVectors, inferences);

    // Emit results
    this.emit('pipeline:flushed', {
      eventsProcessed: events.length,
      featuresExtracted: featureVectors.length,
      inferencesGenerated: inferences.length,
      insightsGenerated: newInsights.length,
    });
  }

  /**
   * Extract features from raw events
   */
  private extractFeatures(events: StreamEvent[]): FeatureVector[] {
    const featureVectors: FeatureVector[] = [];

    for (const event of events) {
      const features: Feature[] = [];

      // Time-based features
      const timestamp = event.timestamp;
      features.push({
        name: 'hour_of_day',
        value: timestamp.getHours(),
        timestamp,
        source: event.source,
        confidence: 1.0,
      });

      features.push({
        name: 'day_of_week',
        value: timestamp.getDay(),
        timestamp,
        source: event.source,
        confidence: 1.0,
      });

      features.push({
        name: 'day_of_month',
        value: timestamp.getDate(),
        timestamp,
        source: event.source,
        confidence: 1.0,
      });

      // Data-specific features
      if (event.dataType === 'timeseries' && typeof event.data === 'object') {
        const data = event.data as Record<string, unknown>;
        for (const [key, value] of Object.entries(data)) {
          if (typeof value === 'number') {
            features.push({
              name: key,
              value,
              timestamp,
              source: event.source,
              confidence: 0.9,
            });
          }
        }
      }

      // Lag features (from cache)
      const lagFeatures = this.computeLagFeatures(event.source, timestamp);
      features.push(...lagFeatures);

      // Rolling statistics
      const rollingFeatures = this.computeRollingFeatures(event.source, timestamp);
      features.push(...rollingFeatures);

      featureVectors.push({
        timestamp,
        features,
        rawData: event.data,
      });

      // Cache features for lag computation
      if (!this.featureCache.has(event.source)) {
        this.featureCache.set(event.source, []);
      }
      this.featureCache.get(event.source)!.push({
        timestamp,
        features,
        rawData: event.data,
      });

      // Clean old cache entries
      const cache = this.featureCache.get(event.source)!;
      const cutoff = new Date(timestamp.getTime() - this.featureWindow);
      this.featureCache.set(
        event.source,
        cache.filter((fv) => fv.timestamp > cutoff)
      );
    }

    return featureVectors;
  }

  /**
   * Compute lag features
   */
  private computeLagFeatures(source: string, timestamp: Date): Feature[] {
    const features: Feature[] = [];
    const cache = this.featureCache.get(source) || [];

    if (cache.length === 0) return features;

    // Get previous values (lag-1, lag-7, lag-30)
    const lags = [1, 7, 30];

    for (const lag of lags) {
      const lagIndex = Math.max(0, cache.length - lag - 1);
      if (lagIndex >= 0 && lagIndex < cache.length) {
        const lagVector = cache[lagIndex];
        const valueFeature = lagVector.features.find((f) => f.name === 'value');

        if (valueFeature) {
          features.push({
            name: `lag_${lag}`,
            value: valueFeature.value,
            timestamp,
            source,
            confidence: 0.8,
          });
        }
      }
    }

    return features;
  }

  /**
   * Compute rolling statistics
   */
  private computeRollingFeatures(source: string, timestamp: Date): Feature[] {
    const features: Feature[] = [];
    const cache = this.featureCache.get(source) || [];

    if (cache.length < 7) return features;

    // Get values for rolling windows
    const windows = [7, 30, 90]; // days

    for (const window of windows) {
      const windowStart = new Date(timestamp.getTime() - window * 24 * 60 * 60 * 1000);
      const windowValues = cache
        .filter((fv) => fv.timestamp >= windowStart)
        .flatMap((fv) => {
          const valueFeature = fv.features.find((f) => f.name === 'value');
          return valueFeature ? [valueFeature.value] : [];
        });

      if (windowValues.length > 0) {
        // Mean
        const mean = windowValues.reduce((a, b) => a + b, 0) / windowValues.length;
        features.push({
          name: `rolling_mean_${window}d`,
          value: mean,
          timestamp,
          source,
          confidence: 0.85,
        });

        // Std Dev
        const variance =
          windowValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / windowValues.length;
        const stdDev = Math.sqrt(variance);
        features.push({
          name: `rolling_std_${window}d`,
          value: stdDev,
          timestamp,
          source,
          confidence: 0.85,
        });

        // Min/Max
        features.push({
          name: `rolling_min_${window}d`,
          value: Math.min(...windowValues),
          timestamp,
          source,
          confidence: 0.85,
        });

        features.push({
          name: `rolling_max_${window}d`,
          value: Math.max(...windowValues),
          timestamp,
          source,
          confidence: 0.85,
        });
      }
    }

    return features;
  }

  /**
   * Run model inference
   */
  private runInference(featureVectors: FeatureVector[]): ModelInference[] {
    const inferences: ModelInference[] = [];

    for (const fv of featureVectors) {
      // Placeholder: In production, call actual ML models
      const prediction = this.predictValue(fv);
      const uncertainty = this.computeUncertainty(fv);
      const importance = this.computeFeatureImportance(fv);

      inferences.push({
        timestamp: fv.timestamp,
        modelId: 'ensemble-forecaster-v1',
        modelVersion: '1.0.0',
        input: fv,
        prediction,
        confidence: 0.92,
        uncertainty,
        featureImportance: importance,
      });
    }

    this.modelInferences.push(...inferences);
    this.emit('inference:completed', { count: inferences.length });

    return inferences;
  }

  /**
   * Predict value using ensemble approach
   */
  private predictValue(fv: FeatureVector): number {
    // Placeholder: Combine multiple models
    const valueFeature = fv.features.find((f) => f.name === 'value');
    if (!valueFeature) return 0;

    // Simple moving average as baseline
    const lagFeatures = fv.features.filter((f) => f.name.startsWith('lag_'));
    if (lagFeatures.length === 0) return valueFeature.value;

    const avgLag = lagFeatures.reduce((sum, f) => sum + f.value, 0) / lagFeatures.length;
    const trend = valueFeature.value - avgLag;

    return valueFeature.value + trend * 0.1; // Simple extrapolation
  }

  /**
   * Compute uncertainty bounds
   */
  private computeUncertainty(fv: FeatureVector): { lower: number; upper: number } {
    const prediction = this.predictValue(fv);
    const stdDevFeature = fv.features.find((f) => f.name.includes('rolling_std'));
    const stdDev = stdDevFeature?.value || 0.1;

    // 95% confidence interval
    const margin = 1.96 * stdDev;

    return {
      lower: prediction - margin,
      upper: prediction + margin,
    };
  }

  /**
   * Compute feature importance
   */
  private computeFeatureImportance(fv: FeatureVector): Record<string, number> {
    const importance: Record<string, number> = {};

    // Placeholder: In production, use SHAP or similar
    for (const feature of fv.features) {
      // Simple correlation-based importance
      importance[feature.name] = Math.abs(feature.value) / 100;
    }

    return importance;
  }

  /**
   * Generate insights from inferences
   */
  private generateInsights(inferences: ModelInference[]): Insight[] {
    const newInsights: Insight[] = [];

    for (const inference of inferences) {
      // Detect anomalies
      if (this.isAnomaly(inference)) {
        newInsights.push(this.createAnomalyInsight(inference));
      }

      // Detect trends
      if (this.isTrend(inference)) {
        newInsights.push(this.createTrendInsight(inference));
      }

      // Detect correlations
      if (this.isCorrelation(inference)) {
        newInsights.push(this.createCorrelationInsight(inference));
      }
    }

    this.insights.push(...newInsights);
    this.emit('insights:generated', { count: newInsights.length });

    return newInsights;
  }

  /**
   * Check if inference is anomalous
   */
  private isAnomaly(inference: ModelInference): boolean {
    const prediction = inference.prediction;
    const { lower, upper } = inference.uncertainty;

    // Check if prediction is outside uncertainty bounds
    const actualValue = (inference.input.rawData as Record<string, unknown>)['value'] as number;
    return actualValue < lower || actualValue > upper;
  }

  /**
   * Create anomaly insight
   */
  private createAnomalyInsight(inference: ModelInference): Insight {
    return {
      id: `anomaly-${Date.now()}`,
      timestamp: inference.timestamp,
      type: 'anomaly',
      severity: 'high',
      title: 'Unusual Data Point Detected',
      description: `Data point ${inference.prediction.toFixed(2)} deviates from expected range [${inference.uncertainty.lower.toFixed(2)}, ${inference.uncertainty.upper.toFixed(2)}]`,
      evidence: [
        `Model: ${inference.modelId}`,
        `Confidence: ${(inference.confidence * 100).toFixed(1)}%`,
      ],
      relatedIndicators: [],
      relatedEvents: [],
      actionItems: ['Review data source', 'Check for external events', 'Investigate root cause'],
      confidence: inference.confidence,
    };
  }

  /**
   * Check if inference indicates a trend
   */
  private isTrend(inference: ModelInference): boolean {
    const lagFeatures = inference.input.features.filter((f) => f.name.startsWith('lag_'));
    if (lagFeatures.length < 2) return false;

    const recent = lagFeatures[lagFeatures.length - 1].value;
    const older = lagFeatures[0].value;

    return Math.abs(recent - older) > older * 0.05; // >5% change
  }

  /**
   * Create trend insight
   */
  private createTrendInsight(inference: ModelInference): Insight {
    return {
      id: `trend-${Date.now()}`,
      timestamp: inference.timestamp,
      type: 'trend',
      severity: 'medium',
      title: 'Trend Detected',
      description: `Data shows consistent directional movement`,
      evidence: [`Model: ${inference.modelId}`],
      relatedIndicators: [],
      relatedEvents: [],
      actionItems: ['Monitor continuation', 'Investigate drivers'],
      confidence: inference.confidence * 0.8,
    };
  }

  /**
   * Check if inference indicates correlation
   */
  private isCorrelation(inference: ModelInference): boolean {
    const importance = Object.values(inference.featureImportance);
    return importance.some((imp) => imp > 0.5);
  }

  /**
   * Create correlation insight
   */
  private createCorrelationInsight(inference: ModelInference): Insight {
    return {
      id: `correlation-${Date.now()}`,
      timestamp: inference.timestamp,
      type: 'correlation',
      severity: 'low',
      title: 'Strong Feature Correlation',
      description: 'Multiple features show strong correlation with target',
      evidence: Object.entries(inference.featureImportance)
        .filter(([, imp]) => imp > 0.5)
        .map(([name, imp]) => `${name}: ${(imp * 100).toFixed(1)}%`),
      relatedIndicators: [],
      relatedEvents: [],
      actionItems: ['Investigate relationships', 'Update models'],
      confidence: inference.confidence * 0.7,
    };
  }

  /**
   * Update online learning system
   */
  private updateOnlineLearning(
    featureVectors: FeatureVector[],
    inferences: ModelInference[]
  ): void {
    this.metrics.samplesProcessed += featureVectors.length;
    this.metrics.modelsUpdated += 1;
    this.metrics.lastUpdateTime = new Date();

    // Compute performance metrics
    if (inferences.length > 0) {
      const errors = inferences.map((inf) => {
        const actual = (inf.input.rawData as Record<string, unknown>)['value'] as number;
        return Math.abs(actual - inf.prediction);
      });

      this.metrics.performanceMetrics.mae = errors.reduce((a, b) => a + b, 0) / errors.length;
      this.metrics.performanceMetrics.rmse = Math.sqrt(
        errors.reduce((a, b) => a + b * b, 0) / errors.length
      );

      const mapeErrors = inferences.map((inf) => {
        const actual = (inf.input.rawData as Record<string, unknown>)['value'] as number;
        return Math.abs((actual - inf.prediction) / actual);
      });
      this.metrics.performanceMetrics.mape =
        (mapeErrors.reduce((a, b) => a + b, 0) / mapeErrors.length) * 100;
    }

    // Detect drift
    if (this.metrics.performanceMetrics.mae > 0.2) {
      this.metrics.driftDetected = true;
      this.emit('drift:detected', this.metrics);
    }

    this.emit('learning:updated', this.metrics);
  }

  /**
   * Start periodic flush timer
   */
  private startFlushTimer(): void {
    setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Get current metrics
   */
  public getMetrics(): OnlineLearningMetrics {
    return { ...this.metrics };
  }

  /**
   * Get recent insights
   */
  public getRecentInsights(limit: number = 100): Insight[] {
    return this.insights.slice(-limit);
  }

  /**
   * Get recent inferences
   */
  public getRecentInferences(limit: number = 100): ModelInference[] {
    return this.modelInferences.slice(-limit);
  }

  /**
   * Clear old data
   */
  private cleanup(): void {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days

    this.insights = this.insights.filter((i) => i.timestamp > cutoff);
    this.modelInferences = this.modelInferences.filter((i) => i.timestamp > cutoff);

    const entries = Array.from(this.featureCache.entries());
    for (const [source, cache] of entries) {
      const filtered = cache.filter((fv: FeatureVector) => fv.timestamp > cutoff);
      this.featureCache.set(source, filtered);
    }
  }}

// ============================================================================
// Singleton Instance
// ============================================================================

let pipelineInstance: RealtimePipeline | null = null;

export function getRealtimePipeline(): RealtimePipeline {
  if (!pipelineInstance) {
    pipelineInstance = new RealtimePipeline();
  }
  return pipelineInstance;
}

export function resetRealtimePipeline(): void {
  if (pipelineInstance) {
    pipelineInstance.removeAllListeners();
  }
  pipelineInstance = null;
}
