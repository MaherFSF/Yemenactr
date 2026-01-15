/**
 * ML Monitoring & Observability System
 * Real-time tracking of model performance, data quality, and system health
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface ModelMetrics {
  modelId: string;
  timestamp: Date;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  latency: number; // milliseconds
  throughput: number; // predictions/second
  errorRate: number;
}

export interface DataQualityMetrics {
  timestamp: Date;
  completeness: number; // 0-1
  consistency: number; // 0-1
  freshness: number; // 0-1 (1 = latest)
  outlierCount: number;
  missingValues: number;
  duplicates: number;
}

export interface DriftMetrics {
  timestamp: Date;
  dataDrift: number; // 0-1
  modelDrift: number; // 0-1
  labelDrift: number; // 0-1
  driftDetected: boolean;
  affectedFeatures: string[];
}

export interface FeatureStoreMetrics {
  timestamp: Date;
  featureAvailability: number; // 0-1
  featureLatency: number; // milliseconds
  cacheHitRate: number; // 0-1
  staleFeaturesCount: number;
}

export interface InferencePipelineMetrics {
  timestamp: Date;
  inferenceLatency: number; // milliseconds
  errorRate: number;
  fallbackRate: number; // % of requests using fallback
  queueLength: number;
  throughput: number; // requests/second
}

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  threshold: number;
  operator: '>' | '<' | '==' | '!=';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
}

export interface Alert {
  id: string;
  ruleId: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  value: number;
  threshold: number;
  acknowledged: boolean;
}

// ============================================================================
// ML Monitoring System
// ============================================================================

export class MLMonitoring {
  private modelMetrics: ModelMetrics[] = [];
  private dataQualityMetrics: DataQualityMetrics[] = [];
  private driftMetrics: DriftMetrics[] = [];
  private featureStoreMetrics: FeatureStoreMetrics[] = [];
  private inferencePipelineMetrics: InferencePipelineMetrics[] = [];
  private alerts: Alert[] = [];
  private alertRules: Map<string, AlertRule> = new Map();

  // Configuration
  private metricsRetentionDays: number = 30;
  private alertRetentionDays: number = 7;
  private checkInterval: number = 60000; // 1 minute

  constructor() {
    this.initializeDefaultAlertRules();
    this.startMonitoring();
  }

  /**
   * Initialize default alert rules
   */
  private initializeDefaultAlertRules(): void {
    const rules: AlertRule[] = [
      {
        id: 'model-accuracy-low',
        name: 'Model Accuracy Low',
        metric: 'accuracy',
        threshold: 0.85,
        operator: '<',
        severity: 'high',
        enabled: true,
      },
      {
        id: 'data-drift-detected',
        name: 'Data Drift Detected',
        metric: 'dataDrift',
        threshold: 0.3,
        operator: '>',
        severity: 'high',
        enabled: true,
      },
      {
        id: 'inference-latency-high',
        name: 'Inference Latency High',
        metric: 'inferenceLatency',
        threshold: 1000,
        operator: '>',
        severity: 'medium',
        enabled: true,
      },
      {
        id: 'data-quality-low',
        name: 'Data Quality Low',
        metric: 'completeness',
        threshold: 0.9,
        operator: '<',
        severity: 'medium',
        enabled: true,
      },
      {
        id: 'feature-store-latency-high',
        name: 'Feature Store Latency High',
        metric: 'featureLatency',
        threshold: 500,
        operator: '>',
        severity: 'low',
        enabled: true,
      },
    ];

    for (const rule of rules) {
      this.alertRules.set(rule.id, rule);
    }
  }

  /**
   * Record model metrics
   */
  public recordModelMetrics(metrics: ModelMetrics): void {
    this.modelMetrics.push(metrics);
    this.checkAlerts('accuracy', metrics.accuracy);
    this.checkAlerts('inferenceLatency', metrics.latency);
    this.cleanup();
  }

  /**
   * Record data quality metrics
   */
  public recordDataQualityMetrics(metrics: DataQualityMetrics): void {
    this.dataQualityMetrics.push(metrics);
    this.checkAlerts('completeness', metrics.completeness);
    this.cleanup();
  }

  /**
   * Record drift metrics
   */
  public recordDriftMetrics(metrics: DriftMetrics): void {
    this.driftMetrics.push(metrics);
    this.checkAlerts('dataDrift', metrics.dataDrift);
    this.cleanup();
  }

  /**
   * Record feature store metrics
   */
  public recordFeatureStoreMetrics(metrics: FeatureStoreMetrics): void {
    this.featureStoreMetrics.push(metrics);
    this.checkAlerts('featureLatency', metrics.featureLatency);
    this.cleanup();
  }

  /**
   * Record inference pipeline metrics
   */
  public recordInferencePipelineMetrics(metrics: InferencePipelineMetrics): void {
    this.inferencePipelineMetrics.push(metrics);
    this.checkAlerts('inferenceLatency', metrics.inferenceLatency);
    this.cleanup();
  }

  /**
   * Check alert rules
   */
  private checkAlerts(metric: string, value: number): void {
    const entries = Array.from(this.alertRules.entries() as IterableIterator<[string, AlertRule]>);
    for (const [ruleId, rule] of entries) {
      if (!rule.enabled || rule.metric !== metric) continue;

      let triggered = false;

      if (rule.operator === '>') {
        triggered = value > rule.threshold;
      } else if (rule.operator === '<') {
        triggered = value < rule.threshold;
      } else if (rule.operator === '==') {
        triggered = value === rule.threshold;
      } else if (rule.operator === '!=') {
        triggered = value !== rule.threshold;
      }

      if (triggered) {
        this.createAlert(ruleId, rule, value);
      }
    }
  }

  /**
   * Create alert
   */
  private createAlert(ruleId: string, rule: AlertRule, value: number): void {
    // Check if similar alert already exists
    const recentAlert = this.alerts.find(
      (a) => a.ruleId === ruleId && a.timestamp.getTime() > Date.now() - 5 * 60 * 1000
    );

    if (recentAlert) return; // Don't create duplicate alerts

    const alert: Alert = {
      id: `alert-${Date.now()}`,
      ruleId,
      timestamp: new Date(),
      severity: rule.severity,
      message: `${rule.name}: ${value.toFixed(2)} ${rule.operator} ${rule.threshold}`,
      value,
      threshold: rule.threshold,
      acknowledged: false,
    };

    this.alerts.push(alert);
  }

  /**
   * Get recent model metrics
   */
  public getRecentModelMetrics(limit: number = 100): ModelMetrics[] {
    return this.modelMetrics.slice(-limit);
  }

  /**
   * Get recent data quality metrics
   */
  public getRecentDataQualityMetrics(limit: number = 100): DataQualityMetrics[] {
    return this.dataQualityMetrics.slice(-limit);
  }

  /**
   * Get recent drift metrics
   */
  public getRecentDriftMetrics(limit: number = 100): DriftMetrics[] {
    return this.driftMetrics.slice(-limit);
  }

  /**
   * Get model performance trend
   */
  public getModelPerformanceTrend(modelId: string, days: number = 7): ModelMetrics[] {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return this.modelMetrics.filter((m) => m.modelId === modelId && m.timestamp > cutoff);
  }

  /**
   * Get data quality trend
   */
  public getDataQualityTrend(days: number = 7): DataQualityMetrics[] {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return this.dataQualityMetrics.filter((m) => m.timestamp > cutoff);
  }

  /**
   * Get active alerts
   */
  public getActiveAlerts(): Alert[] {
    return this.alerts.filter((a) => !a.acknowledged);
  }

  /**
   * Acknowledge alert
   */
  public acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }

  /**
   * Get alert statistics
   */
  public getAlertStatistics(): {
    totalAlerts: number;
    activeAlerts: number;
    byServer: Record<string, number>;
  } {
    const byServer: Record<string, number> = {};

    for (const alert of this.alerts) {
      byServer[alert.severity] = (byServer[alert.severity] || 0) + 1;
    }

    return {
      totalAlerts: this.alerts.length,
      activeAlerts: this.getActiveAlerts().length,
      byServer,
    };
  }

  /**
   * Get system health score
   */
  public getSystemHealthScore(): number {
    let score = 100;

    // Check recent metrics
    const recentModel = this.modelMetrics[this.modelMetrics.length - 1];
    if (recentModel && recentModel.accuracy < 0.85) {
      score -= 20;
    }

    const recentData = this.dataQualityMetrics[this.dataQualityMetrics.length - 1];
    if (recentData && recentData.completeness < 0.9) {
      score -= 15;
    }

    const recentDrift = this.driftMetrics[this.driftMetrics.length - 1];
    if (recentDrift && recentDrift.driftDetected) {
      score -= 10;
    }

    const recentInference = this.inferencePipelineMetrics[this.inferencePipelineMetrics.length - 1];
    if (recentInference && recentInference.errorRate > 0.05) {
      score -= 15;
    }

    // Check active alerts
    const activeAlerts = this.getActiveAlerts();
    const criticalAlerts = activeAlerts.filter((a) => a.severity === 'critical');
    const highAlerts = activeAlerts.filter((a) => a.severity === 'high');

    score -= criticalAlerts.length * 10;
    score -= highAlerts.length * 5;

    return Math.max(0, score);
  }

  /**
   * Get dashboard summary
   */
  public getDashboardSummary(): {
    healthScore: number;
    modelAccuracy: number;
    dataCompleteness: number;
    dataDrift: number;
    inferenceLatency: number;
    activeAlerts: number;
  } {
    const recentModel = this.modelMetrics[this.modelMetrics.length - 1];
    const recentData = this.dataQualityMetrics[this.dataQualityMetrics.length - 1];
    const recentDrift = this.driftMetrics[this.driftMetrics.length - 1];
    const recentInference = this.inferencePipelineMetrics[this.inferencePipelineMetrics.length - 1];

    return {
      healthScore: this.getSystemHealthScore(),
      modelAccuracy: recentModel?.accuracy || 0,
      dataCompleteness: recentData?.completeness || 0,
      dataDrift: recentDrift?.dataDrift || 0,
      inferenceLatency: recentInference?.inferenceLatency || 0,
      activeAlerts: this.getActiveAlerts().length,
    };
  }

  /**
   * Start monitoring loop
   */
  private startMonitoring(): void {
    setInterval(() => {
      this.cleanup();
    }, this.checkInterval);
  }

  /**
   * Clean up old metrics and alerts
   */
  private cleanup(): void {
    const metricsAge = new Date(Date.now() - this.metricsRetentionDays * 24 * 60 * 60 * 1000);
    const alertAge = new Date(Date.now() - this.alertRetentionDays * 24 * 60 * 60 * 1000);

    this.modelMetrics = this.modelMetrics.filter((m) => m.timestamp > metricsAge);
    this.dataQualityMetrics = this.dataQualityMetrics.filter((m) => m.timestamp > metricsAge);
    this.driftMetrics = this.driftMetrics.filter((m) => m.timestamp > metricsAge);
    this.featureStoreMetrics = this.featureStoreMetrics.filter((m) => m.timestamp > metricsAge);
    this.inferencePipelineMetrics = this.inferencePipelineMetrics.filter((m) => m.timestamp > metricsAge);
    this.alerts = this.alerts.filter((a) => a.timestamp > alertAge);
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let monitoringInstance: MLMonitoring | null = null;

export function getMLMonitoring(): MLMonitoring {
  if (!monitoringInstance) {
    monitoringInstance = new MLMonitoring();
  }
  return monitoringInstance;
}

export function resetMLMonitoring(): void {
  if (monitoringInstance) {
    monitoringInstance = null;
  }
}
