/**
 * Drift Monitoring Service
 * Tracks quality drift across retrieval, evidence, translation, dashboard, and model metrics
 */

import { getDb } from '../db';
import { driftMetrics, dataGapTickets } from '../../drizzle/schema';
import { eq, desc, and, gte } from 'drizzle-orm';

// Drift thresholds for auto-ticketing
const DRIFT_THRESHOLDS = {
  retrieval: {
    recallAtK: { warning: 0.05, critical: 0.10 },
    precisionAtK: { warning: 0.05, critical: 0.10 },
    latency: { warning: 500, critical: 1000 }, // ms
  },
  evidence: {
    coverage: { warning: 0.03, critical: 0.05 },
    staleness: { warning: 7, critical: 14 }, // days
    contradictionRate: { warning: 0.05, critical: 0.10 },
  },
  translation: {
    parityScore: { warning: 0.05, critical: 0.10 },
    missingTranslations: { warning: 10, critical: 50 },
  },
  dashboard: {
    loadTime: { warning: 2000, critical: 5000 }, // ms
    errorRate: { warning: 0.01, critical: 0.05 },
    dataFreshness: { warning: 24, critical: 72 }, // hours
  },
  model: {
    responseQuality: { warning: 0.05, critical: 0.10 },
    hallucination: { warning: 0.02, critical: 0.05 },
    citationAccuracy: { warning: 0.03, critical: 0.05 },
  },
};

interface DriftMetricRecord {
  driftType: 'retrieval' | 'evidence' | 'translation' | 'dashboard' | 'model';
  metricName: string;
  metricValue: number;
  previousValue?: number;
  baselineValue?: number;
  thresholdValue?: number;
  isBreached: boolean;
  breachSeverity?: 'warning' | 'critical';
  details?: Record<string, unknown>;
}

/**
 * Record a drift metric and check for threshold breach
 */
export async function recordDriftMetric(metric: DriftMetricRecord): Promise<{
  id: number;
  breached: boolean;
  ticketCreated: boolean;
  ticketId?: number;
}> {
  const db = await getDb();
  if (!db) throw new Error('Database connection failed');
  
  const metricDate = new Date();
  
  // Insert metric record
  const [result] = await db.insert(driftMetrics).values({
    metricDate,
    driftType: metric.driftType,
    metricName: metric.metricName,
    metricValue: metric.metricValue.toFixed(4),
    previousValue: metric.previousValue?.toFixed(4),
    baselineValue: metric.baselineValue?.toFixed(4),
    thresholdValue: metric.thresholdValue?.toFixed(4),
    isBreached: metric.isBreached,
    breachSeverity: metric.breachSeverity,
    details: metric.details,
  });
  
  let ticketCreated = false;
  let ticketId: number | undefined;
  
  // Auto-create ticket on critical breach
  if (metric.isBreached && metric.breachSeverity === 'critical') {
    const [ticket] = await db.insert(dataGapTickets).values({
      missingItem: `Drift Alert: ${metric.driftType} - ${metric.metricName}`,
      whyItMatters: `Critical drift detected. Current value: ${metric.metricValue}, Threshold: ${metric.thresholdValue}`,
      priority: 'high',
      status: 'open',
    });
    ticketCreated = true;
    ticketId = ticket.insertId;
    
    // Update metric with ticket reference
    // Note: In production, update the drift metric record with ticketId
  }
  
  return {
    id: result.insertId,
    breached: metric.isBreached,
    ticketCreated,
    ticketId,
  };
}

/**
 * Check retrieval drift metrics
 */
export async function checkRetrievalDrift(
  currentRecall: number,
  currentPrecision: number,
  currentLatency: number,
  baselineRecall: number = 0.85,
  baselinePrecision: number = 0.80,
  baselineLatency: number = 200
): Promise<DriftMetricRecord[]> {
  const metrics: DriftMetricRecord[] = [];
  
  // Recall drift
  const recallDelta = baselineRecall - currentRecall;
  const recallThreshold = DRIFT_THRESHOLDS.retrieval.recallAtK;
  metrics.push({
    driftType: 'retrieval',
    metricName: 'recallAtK',
    metricValue: currentRecall,
    previousValue: baselineRecall,
    baselineValue: baselineRecall,
    thresholdValue: recallThreshold.warning,
    isBreached: recallDelta > recallThreshold.warning,
    breachSeverity: recallDelta > recallThreshold.critical ? 'critical' : 
                    recallDelta > recallThreshold.warning ? 'warning' : undefined,
    details: { delta: recallDelta },
  });
  
  // Precision drift
  const precisionDelta = baselinePrecision - currentPrecision;
  const precisionThreshold = DRIFT_THRESHOLDS.retrieval.precisionAtK;
  metrics.push({
    driftType: 'retrieval',
    metricName: 'precisionAtK',
    metricValue: currentPrecision,
    previousValue: baselinePrecision,
    baselineValue: baselinePrecision,
    thresholdValue: precisionThreshold.warning,
    isBreached: precisionDelta > precisionThreshold.warning,
    breachSeverity: precisionDelta > precisionThreshold.critical ? 'critical' :
                    precisionDelta > precisionThreshold.warning ? 'warning' : undefined,
    details: { delta: precisionDelta },
  });
  
  // Latency drift
  const latencyDelta = currentLatency - baselineLatency;
  const latencyThreshold = DRIFT_THRESHOLDS.retrieval.latency;
  metrics.push({
    driftType: 'retrieval',
    metricName: 'latency',
    metricValue: currentLatency,
    previousValue: baselineLatency,
    baselineValue: baselineLatency,
    thresholdValue: latencyThreshold.warning,
    isBreached: latencyDelta > latencyThreshold.warning,
    breachSeverity: latencyDelta > latencyThreshold.critical ? 'critical' :
                    latencyDelta > latencyThreshold.warning ? 'warning' : undefined,
    details: { delta: latencyDelta },
  });
  
  return metrics;
}

/**
 * Check evidence drift metrics
 */
export async function checkEvidenceDrift(
  currentCoverage: number,
  currentStaleness: number,
  currentContradictionRate: number,
  baselineCoverage: number = 0.95,
  baselineStaleness: number = 3,
  baselineContradictionRate: number = 0.02
): Promise<DriftMetricRecord[]> {
  const metrics: DriftMetricRecord[] = [];
  
  // Coverage drift
  const coverageDelta = baselineCoverage - currentCoverage;
  const coverageThreshold = DRIFT_THRESHOLDS.evidence.coverage;
  metrics.push({
    driftType: 'evidence',
    metricName: 'coverage',
    metricValue: currentCoverage,
    previousValue: baselineCoverage,
    baselineValue: baselineCoverage,
    thresholdValue: coverageThreshold.warning,
    isBreached: coverageDelta > coverageThreshold.warning,
    breachSeverity: coverageDelta > coverageThreshold.critical ? 'critical' :
                    coverageDelta > coverageThreshold.warning ? 'warning' : undefined,
    details: { delta: coverageDelta },
  });
  
  // Staleness drift
  const stalenessDelta = currentStaleness - baselineStaleness;
  const stalenessThreshold = DRIFT_THRESHOLDS.evidence.staleness;
  metrics.push({
    driftType: 'evidence',
    metricName: 'staleness',
    metricValue: currentStaleness,
    previousValue: baselineStaleness,
    baselineValue: baselineStaleness,
    thresholdValue: stalenessThreshold.warning,
    isBreached: stalenessDelta > stalenessThreshold.warning,
    breachSeverity: stalenessDelta > stalenessThreshold.critical ? 'critical' :
                    stalenessDelta > stalenessThreshold.warning ? 'warning' : undefined,
    details: { delta: stalenessDelta },
  });
  
  // Contradiction rate drift
  const contradictionDelta = currentContradictionRate - baselineContradictionRate;
  const contradictionThreshold = DRIFT_THRESHOLDS.evidence.contradictionRate;
  metrics.push({
    driftType: 'evidence',
    metricName: 'contradictionRate',
    metricValue: currentContradictionRate,
    previousValue: baselineContradictionRate,
    baselineValue: baselineContradictionRate,
    thresholdValue: contradictionThreshold.warning,
    isBreached: contradictionDelta > contradictionThreshold.warning,
    breachSeverity: contradictionDelta > contradictionThreshold.critical ? 'critical' :
                    contradictionDelta > contradictionThreshold.warning ? 'warning' : undefined,
    details: { delta: contradictionDelta },
  });
  
  return metrics;
}

/**
 * Check translation drift metrics
 */
export async function checkTranslationDrift(
  currentParityScore: number,
  currentMissingTranslations: number,
  baselineParityScore: number = 0.98,
  baselineMissingTranslations: number = 5
): Promise<DriftMetricRecord[]> {
  const metrics: DriftMetricRecord[] = [];
  
  // Parity score drift
  const parityDelta = baselineParityScore - currentParityScore;
  const parityThreshold = DRIFT_THRESHOLDS.translation.parityScore;
  metrics.push({
    driftType: 'translation',
    metricName: 'parityScore',
    metricValue: currentParityScore,
    previousValue: baselineParityScore,
    baselineValue: baselineParityScore,
    thresholdValue: parityThreshold.warning,
    isBreached: parityDelta > parityThreshold.warning,
    breachSeverity: parityDelta > parityThreshold.critical ? 'critical' :
                    parityDelta > parityThreshold.warning ? 'warning' : undefined,
    details: { delta: parityDelta },
  });
  
  // Missing translations drift
  const missingDelta = currentMissingTranslations - baselineMissingTranslations;
  const missingThreshold = DRIFT_THRESHOLDS.translation.missingTranslations;
  metrics.push({
    driftType: 'translation',
    metricName: 'missingTranslations',
    metricValue: currentMissingTranslations,
    previousValue: baselineMissingTranslations,
    baselineValue: baselineMissingTranslations,
    thresholdValue: missingThreshold.warning,
    isBreached: missingDelta > missingThreshold.warning,
    breachSeverity: missingDelta > missingThreshold.critical ? 'critical' :
                    missingDelta > missingThreshold.warning ? 'warning' : undefined,
    details: { delta: missingDelta },
  });
  
  return metrics;
}

/**
 * Check dashboard drift metrics
 */
export async function checkDashboardDrift(
  currentLoadTime: number,
  currentErrorRate: number,
  currentDataFreshness: number,
  baselineLoadTime: number = 1000,
  baselineErrorRate: number = 0.005,
  baselineDataFreshness: number = 12
): Promise<DriftMetricRecord[]> {
  const metrics: DriftMetricRecord[] = [];
  
  // Load time drift
  const loadTimeDelta = currentLoadTime - baselineLoadTime;
  const loadTimeThreshold = DRIFT_THRESHOLDS.dashboard.loadTime;
  metrics.push({
    driftType: 'dashboard',
    metricName: 'loadTime',
    metricValue: currentLoadTime,
    previousValue: baselineLoadTime,
    baselineValue: baselineLoadTime,
    thresholdValue: loadTimeThreshold.warning,
    isBreached: loadTimeDelta > loadTimeThreshold.warning,
    breachSeverity: loadTimeDelta > loadTimeThreshold.critical ? 'critical' :
                    loadTimeDelta > loadTimeThreshold.warning ? 'warning' : undefined,
    details: { delta: loadTimeDelta },
  });
  
  // Error rate drift
  const errorDelta = currentErrorRate - baselineErrorRate;
  const errorThreshold = DRIFT_THRESHOLDS.dashboard.errorRate;
  metrics.push({
    driftType: 'dashboard',
    metricName: 'errorRate',
    metricValue: currentErrorRate,
    previousValue: baselineErrorRate,
    baselineValue: baselineErrorRate,
    thresholdValue: errorThreshold.warning,
    isBreached: errorDelta > errorThreshold.warning,
    breachSeverity: errorDelta > errorThreshold.critical ? 'critical' :
                    errorDelta > errorThreshold.warning ? 'warning' : undefined,
    details: { delta: errorDelta },
  });
  
  // Data freshness drift
  const freshnessDelta = currentDataFreshness - baselineDataFreshness;
  const freshnessThreshold = DRIFT_THRESHOLDS.dashboard.dataFreshness;
  metrics.push({
    driftType: 'dashboard',
    metricName: 'dataFreshness',
    metricValue: currentDataFreshness,
    previousValue: baselineDataFreshness,
    baselineValue: baselineDataFreshness,
    thresholdValue: freshnessThreshold.warning,
    isBreached: freshnessDelta > freshnessThreshold.warning,
    breachSeverity: freshnessDelta > freshnessThreshold.critical ? 'critical' :
                    freshnessDelta > freshnessThreshold.warning ? 'warning' : undefined,
    details: { delta: freshnessDelta },
  });
  
  return metrics;
}

/**
 * Check model drift metrics
 */
export async function checkModelDrift(
  currentResponseQuality: number,
  currentHallucination: number,
  currentCitationAccuracy: number,
  baselineResponseQuality: number = 0.90,
  baselineHallucination: number = 0.01,
  baselineCitationAccuracy: number = 0.95
): Promise<DriftMetricRecord[]> {
  const metrics: DriftMetricRecord[] = [];
  
  // Response quality drift
  const qualityDelta = baselineResponseQuality - currentResponseQuality;
  const qualityThreshold = DRIFT_THRESHOLDS.model.responseQuality;
  metrics.push({
    driftType: 'model',
    metricName: 'responseQuality',
    metricValue: currentResponseQuality,
    previousValue: baselineResponseQuality,
    baselineValue: baselineResponseQuality,
    thresholdValue: qualityThreshold.warning,
    isBreached: qualityDelta > qualityThreshold.warning,
    breachSeverity: qualityDelta > qualityThreshold.critical ? 'critical' :
                    qualityDelta > qualityThreshold.warning ? 'warning' : undefined,
    details: { delta: qualityDelta },
  });
  
  // Hallucination drift
  const hallucinationDelta = currentHallucination - baselineHallucination;
  const hallucinationThreshold = DRIFT_THRESHOLDS.model.hallucination;
  metrics.push({
    driftType: 'model',
    metricName: 'hallucination',
    metricValue: currentHallucination,
    previousValue: baselineHallucination,
    baselineValue: baselineHallucination,
    thresholdValue: hallucinationThreshold.warning,
    isBreached: hallucinationDelta > hallucinationThreshold.warning,
    breachSeverity: hallucinationDelta > hallucinationThreshold.critical ? 'critical' :
                    hallucinationDelta > hallucinationThreshold.warning ? 'warning' : undefined,
    details: { delta: hallucinationDelta },
  });
  
  // Citation accuracy drift
  const citationDelta = baselineCitationAccuracy - currentCitationAccuracy;
  const citationThreshold = DRIFT_THRESHOLDS.model.citationAccuracy;
  metrics.push({
    driftType: 'model',
    metricName: 'citationAccuracy',
    metricValue: currentCitationAccuracy,
    previousValue: baselineCitationAccuracy,
    baselineValue: baselineCitationAccuracy,
    thresholdValue: citationThreshold.warning,
    isBreached: citationDelta > citationThreshold.warning,
    breachSeverity: citationDelta > citationThreshold.critical ? 'critical' :
                    citationDelta > citationThreshold.warning ? 'warning' : undefined,
    details: { delta: citationDelta },
  });
  
  return metrics;
}

/**
 * Run full drift check across all dimensions
 */
export async function runFullDriftCheck(): Promise<{
  totalMetrics: number;
  breachedMetrics: number;
  criticalBreaches: number;
  warningBreaches: number;
  ticketsCreated: number;
  metrics: DriftMetricRecord[];
}> {
  const allMetrics: DriftMetricRecord[] = [];
  let ticketsCreated = 0;
  
  // Simulated current values (in production, these would come from actual measurements)
  const retrievalMetrics = await checkRetrievalDrift(0.83, 0.78, 250);
  const evidenceMetrics = await checkEvidenceDrift(0.94, 5, 0.03);
  const translationMetrics = await checkTranslationDrift(0.96, 12);
  const dashboardMetrics = await checkDashboardDrift(1500, 0.008, 18);
  const modelMetrics = await checkModelDrift(0.88, 0.015, 0.93);
  
  allMetrics.push(
    ...retrievalMetrics,
    ...evidenceMetrics,
    ...translationMetrics,
    ...dashboardMetrics,
    ...modelMetrics
  );
  
  // Record all metrics
  for (const metric of allMetrics) {
    const result = await recordDriftMetric(metric);
    if (result.ticketCreated) ticketsCreated++;
  }
  
  const breachedMetrics = allMetrics.filter(m => m.isBreached).length;
  const criticalBreaches = allMetrics.filter(m => m.breachSeverity === 'critical').length;
  const warningBreaches = allMetrics.filter(m => m.breachSeverity === 'warning').length;
  
  return {
    totalMetrics: allMetrics.length,
    breachedMetrics,
    criticalBreaches,
    warningBreaches,
    ticketsCreated,
    metrics: allMetrics,
  };
}

/**
 * Get drift history for a specific metric
 */
export async function getDriftHistory(
  driftType: 'retrieval' | 'evidence' | 'translation' | 'dashboard' | 'model',
  metricName: string,
  days: number = 30
): Promise<typeof driftMetrics.$inferSelect[]> {
  const db = await getDb();
  if (!db) throw new Error('Database connection failed');
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return db
    .select()
    .from(driftMetrics)
    .where(
      and(
        eq(driftMetrics.driftType, driftType),
        eq(driftMetrics.metricName, metricName),
        gte(driftMetrics.metricDate, startDate)
      )
    )
    .orderBy(desc(driftMetrics.metricDate));
}
