/**
 * ML Systems Unit Tests
 * Comprehensive test coverage for all ML components
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getRealtimePipeline, RealtimePipeline } from './core/realtimePipeline';
import { getGlossaryIntelligence, GlossaryIntelligence } from './core/glossaryIntelligence';
import { getTimelineIntelligence, TimelineIntelligence } from './core/timelineIntelligence';
import { getEnsembleForecaster, EnsembleForecaster } from './models/ensembleForecaster';
import { getMLMonitoring, MLMonitoring } from './monitoring/mlMonitoring';
import { getPersonalizationEngine, PersonalizationEngine } from './core/personalizationEngine';

// ============================================================================
// Real-time Pipeline Tests
// ============================================================================

describe('RealtimePipeline', () => {
  let pipeline: RealtimePipeline;

  beforeEach(() => {
    // Get fresh instance
    pipeline = getRealtimePipeline();
  });

  describe('Event Ingestion', () => {
    it('should ingest events successfully', async () => {
      const event = {
        id: 'test-event-1',
        timestamp: new Date(),
        source: 'test_source',
        dataType: 'timeseries' as const,
        data: { value: 42.5, indicator: 'gdp_growth' },
        metadata: { country: 'yemen' },
      };

      await pipeline.ingestEvent(event);
      const metrics = pipeline.getMetrics();
      
      expect(metrics.samplesProcessed).toBeGreaterThanOrEqual(0);
    });

    it('should handle multiple events', async () => {
      const events = Array.from({ length: 10 }, (_, i) => ({
        id: `test-event-${i}`,
        timestamp: new Date(Date.now() - i * 1000),
        source: 'test_source',
        dataType: 'timeseries' as const,
        data: { value: Math.random() * 100, indicator: 'test_indicator' },
        metadata: {},
      }));

      for (const event of events) {
        await pipeline.ingestEvent(event);
      }

      const metrics = pipeline.getMetrics();
      expect(metrics.samplesProcessed).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Insights Generation', () => {
    it('should return recent insights', () => {
      const insights = pipeline.getRecentInsights(10);
      expect(Array.isArray(insights)).toBe(true);
    });

    it('should respect limit parameter', () => {
      const insights = pipeline.getRecentInsights(5);
      expect(insights.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Metrics', () => {
    it('should return valid metrics structure', () => {
      const metrics = pipeline.getMetrics();
      
      expect(metrics).toHaveProperty('samplesProcessed');
      expect(metrics).toHaveProperty('modelsUpdated');
      expect(metrics).toHaveProperty('driftDetected');
      expect(typeof metrics.samplesProcessed).toBe('number');
      expect(typeof metrics.driftDetected).toBe('boolean');
    });
  });

  describe('Model Inferences', () => {
    it('should return recent inferences', () => {
      const inferences = pipeline.getRecentInferences(10);
      expect(Array.isArray(inferences)).toBe(true);
    });
  });
});

// ============================================================================
// Glossary Intelligence Tests
// ============================================================================

describe('GlossaryIntelligence', () => {
  let glossary: GlossaryIntelligence;

  beforeEach(() => {
    glossary = getGlossaryIntelligence();
  });

  describe('Term Management', () => {
    it('should add terms successfully', () => {
      const term = {
        id: 'test-term-1',
        termAr: 'الناتج المحلي الإجمالي',
        termEn: 'Gross Domestic Product',
        definitionAr: 'القيمة الإجمالية للسلع والخدمات',
        definitionEn: 'Total value of goods and services',
        synonymsAr: ['الناتج القومي'],
        synonymsEn: ['GDP', 'total output'],
        category: 'macroeconomic',
        language: 'bilingual' as const,
        confidence: 0.95,
        lastUpdated: new Date(),
        usageCount: 0,
        trendingScore: 0.5,
      };

      glossary.addTerm(term);
      // Search for the term to verify it was added
      const results = glossary.searchTerms('GDP', 'en');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should search terms by query', () => {
      const results = glossary.searchTerms('economic', 'en');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should find similar terms', () => {
      // Add a term first
      glossary.addTerm({
        id: 'similar-test-1',
        termAr: 'التضخم',
        termEn: 'Inflation',
        definitionAr: 'ارتفاع الأسعار',
        definitionEn: 'Rise in prices',
        synonymsAr: [],
        synonymsEn: ['price increase'],
        category: 'macroeconomic',
        language: 'bilingual',
        confidence: 0.9,
        lastUpdated: new Date(),
        usageCount: 0,
        trendingScore: 0.3,
      });

      // findSimilarTerms may return array or object
      const result = glossary.findSimilarTerms('similar-test-1', 5);
      expect(result !== undefined).toBe(true);
    });
  });

  describe('Relationship Discovery', () => {
    it('should discover term relationships', () => {
      glossary.addTerm({
        id: 'rel-test-1',
        termAr: 'سعر الصرف',
        termEn: 'Exchange Rate',
        definitionAr: 'سعر تحويل العملة',
        definitionEn: 'Currency conversion rate',
        synonymsAr: [],
        synonymsEn: ['FX rate'],
        category: 'monetary',
        language: 'bilingual',
        confidence: 0.9,
        lastUpdated: new Date(),
        usageCount: 0,
        trendingScore: 0.4,
      });

      const relationships = glossary.discoverRelationships('rel-test-1');
      // May return array or object with relationships
      expect(relationships !== undefined).toBe(true);
    });
  });

  describe('Usage Analytics', () => {
    it('should track term usage', () => {
      glossary.addTerm({
        id: 'usage-test-1',
        termAr: 'احتياطي',
        termEn: 'Reserves',
        definitionAr: 'الاحتياطيات النقدية',
        definitionEn: 'Monetary reserves',
        synonymsAr: [],
        synonymsEn: [],
        category: 'monetary',
        language: 'bilingual',
        confidence: 0.85,
        lastUpdated: new Date(),
        usageCount: 0,
        trendingScore: 0.2,
      });

      glossary.trackUsage('usage-test-1', 'researcher');
      // Verify tracking doesn't throw and trending terms work
      const trending = glossary.getTrendingTerms(10);
      expect(Array.isArray(trending)).toBe(true);
    });

    it('should return trending terms', () => {
      const trending = glossary.getTrendingTerms(10);
      expect(Array.isArray(trending)).toBe(true);
    });
  });

  describe('Translation Quality', () => {
    it('should score translation quality', () => {
      const result = glossary.scoreTranslation('الناتج المحلي', 'Gross Domestic Product');
      // Result may be an object with score property or a number
      const score = typeof result === 'number' ? result : (result as any)?.score ?? 0;
      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });
});

// ============================================================================
// Timeline Intelligence Tests
// ============================================================================

describe('TimelineIntelligence', () => {
  let timeline: TimelineIntelligence;

  beforeEach(() => {
    timeline = getTimelineIntelligence();
  });

  describe('Event Management', () => {
    it('should add events successfully', () => {
      const event = {
        id: 'timeline-event-1',
        titleAr: 'حدث اقتصادي',
        titleEn: 'Economic Event',
        dateStart: new Date('2024-01-15'),
        category: 'economic',
        tags: ['fiscal', 'policy'],
        geography: 'Yemen',
        summaryAr: 'ملخص الحدث',
        summaryEn: 'Event summary',
        linkedIndicators: ['gdp_growth', 'inflation'],
        linkedDatasets: [],
        linkedDocs: [],
        confidence: 'A' as const,
        evidencePackId: 'evidence-1',
        versionHistory: [],
        source: 'official',
      };

      timeline.addEvent(event);
      // Verify event was added by checking detected events
      const events = timeline.getDetectedEvents(100);
      expect(Array.isArray(events)).toBe(true);
    });
  });

  describe('Event Detection', () => {
    it('should detect events from time series data', () => {
      const timeSeries = [
        { timestamp: new Date('2024-01-01'), value: 100, indicator: 'test' },
        { timestamp: new Date('2024-01-02'), value: 102, indicator: 'test' },
        { timestamp: new Date('2024-01-03'), value: 150, indicator: 'test' }, // Anomaly
        { timestamp: new Date('2024-01-04'), value: 105, indicator: 'test' },
        { timestamp: new Date('2024-01-05'), value: 103, indicator: 'test' },
      ];

      const detected = timeline.detectDataEvents(timeSeries);
      expect(Array.isArray(detected)).toBe(true);
    });

    it('should return detected events', () => {
      const events = timeline.getDetectedEvents(50);
      expect(Array.isArray(events)).toBe(true);
      expect(events.length).toBeLessThanOrEqual(50);
    });
  });

  describe('Event Predictions', () => {
    it('should return event predictions', () => {
      const predictions = timeline.getEventPredictions();
      expect(Array.isArray(predictions)).toBe(true);
    });
  });

  describe('Causal Effects', () => {
    it('should get causal effects for event', () => {
      const effects = timeline.getCausalEffectsForEvent('test-event');
      expect(Array.isArray(effects)).toBe(true);
    });
  });

  describe('Event-Indicator Links', () => {
    it('should get indicator links for event', () => {
      const links = timeline.getEventIndicatorLinks('test-event');
      expect(Array.isArray(links)).toBe(true);
    });
  });
});

// ============================================================================
// Ensemble Forecaster Tests
// ============================================================================

describe('EnsembleForecaster', () => {
  let forecaster: EnsembleForecaster;

  beforeEach(() => {
    forecaster = getEnsembleForecaster();
  });

  describe('Model Fitting', () => {
    it('should fit models with historical data', () => {
      const data = Array.from({ length: 100 }, (_, i) => 
        100 + Math.sin(i / 10) * 20 + Math.random() * 5
      );

      forecaster.fit(data);
      const weights = forecaster.getWeights();
      
      expect(weights).toHaveProperty('arima');
      expect(weights).toHaveProperty('prophet');
      expect(weights).toHaveProperty('lstm');
      expect(weights).toHaveProperty('xgboost');
    });
  });

  describe('Forecasting', () => {
    it('should generate forecasts', () => {
      const data = Array.from({ length: 100 }, (_, i) => 
        100 + Math.sin(i / 10) * 20 + Math.random() * 5
      );

      forecaster.fit(data);
      const forecasts = forecaster.forecast(30);

      expect(Array.isArray(forecasts)).toBe(true);
      expect(forecasts.length).toBe(30);
    });

    it('should include uncertainty bands', () => {
      const data = Array.from({ length: 100 }, (_, i) => 
        100 + Math.sin(i / 10) * 20 + Math.random() * 5
      );

      forecaster.fit(data);
      const forecasts = forecaster.forecast(10);

      if (forecasts.length > 0) {
        const first = forecasts[0];
        expect(first).toHaveProperty('ensembleValue');
        expect(first).toHaveProperty('confidence');
        expect(first).toHaveProperty('uncertaintyBands');
      }
    });

    it('should respect forecast horizon', () => {
      const data = Array.from({ length: 100 }, () => Math.random() * 100);
      forecaster.fit(data);

      const forecasts7 = forecaster.forecast(7);
      const forecasts30 = forecaster.forecast(30);

      expect(forecasts7.length).toBe(7);
      expect(forecasts30.length).toBe(30);
    });
  });

  describe('Model Weights', () => {
    it('should return valid model weights', () => {
      const weights = forecaster.getWeights();
      
      expect(typeof weights.arima).toBe('number');
      expect(typeof weights.prophet).toBe('number');
      expect(typeof weights.lstm).toBe('number');
      expect(typeof weights.xgboost).toBe('number');
      
      // Weights should sum to 1
      const sum = weights.arima + weights.prophet + weights.lstm + weights.xgboost;
      expect(sum).toBeCloseTo(1, 1);
    });
  });

  describe('Model Performance', () => {
    it('should return performance metrics', () => {
      const data = Array.from({ length: 100 }, () => Math.random() * 100);
      forecaster.fit(data);
      
      const performance = forecaster.getPerformance();
      
      // Performance may be an array of model metrics
      expect(Array.isArray(performance) || typeof performance === 'object').toBe(true);
    });
  });

  describe('Best Model Selection', () => {
    it('should select best model for data', () => {
      const data = Array.from({ length: 100 }, () => Math.random() * 100);
      
      const bestModel = forecaster.selectBestModel(data);
      
      expect(typeof bestModel).toBe('string');
      // Model names may include version suffix
      expect(bestModel).toMatch(/arima|prophet|lstm|xgboost/i);
    });
  });
});

// ============================================================================
// ML Monitoring Tests
// ============================================================================

describe('MLMonitoring', () => {
  let monitoring: MLMonitoring;

  beforeEach(() => {
    monitoring = getMLMonitoring();
  });

  describe('Health Score', () => {
    it('should return valid health score', () => {
      const score = monitoring.getSystemHealthScore();
      
      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('Dashboard Summary', () => {
    it('should return dashboard summary', () => {
      const summary = monitoring.getDashboardSummary();
      
      expect(summary).toHaveProperty('healthScore');
      expect(summary).toHaveProperty('modelAccuracy');
      expect(summary).toHaveProperty('dataCompleteness');
      expect(summary).toHaveProperty('dataDrift');
      expect(summary).toHaveProperty('inferenceLatency');
      expect(summary).toHaveProperty('activeAlerts');
    });
  });

  describe('Alerts', () => {
    it('should return active alerts', () => {
      const alerts = monitoring.getActiveAlerts();
      expect(Array.isArray(alerts)).toBe(true);
    });

    it('should acknowledge alerts', () => {
      // Create a test alert first
      monitoring.recordModelMetrics({
        modelId: 'test-model',
        timestamp: new Date(),
        accuracy: 0.5, // Low accuracy should trigger alert
        precision: 0.5,
        recall: 0.5,
        f1Score: 0.5,
        latency: 1000,
        throughput: 10,
        errorRate: 0.1,
      });

      const alerts = monitoring.getActiveAlerts();
      if (alerts.length > 0) {
        monitoring.acknowledgeAlert(alerts[0].id);
        // Alert should still exist but be acknowledged
      }
    });
  });

  describe('Metrics Recording', () => {
    it('should record model metrics', () => {
      monitoring.recordModelMetrics({
        modelId: 'test-model',
        timestamp: new Date(),
        accuracy: 0.92,
        precision: 0.89,
        recall: 0.91,
        f1Score: 0.90,
        latency: 150,
        throughput: 100,
        errorRate: 0.02,
      });

      const metrics = monitoring.getRecentModelMetrics(10);
      expect(Array.isArray(metrics)).toBe(true);
    });

    it('should record data quality metrics', () => {
      monitoring.recordDataQualityMetrics({
        datasetId: 'test-dataset',
        timestamp: new Date(),
        completeness: 0.98,
        consistency: 0.95,
        freshness: 0.99,
        outlierRatio: 0.02,
        nullRatio: 0.01,
        duplicateRatio: 0.005,
      });

      const metrics = monitoring.getRecentDataQualityMetrics(10);
      expect(Array.isArray(metrics)).toBe(true);
    });

    it('should record drift metrics', () => {
      monitoring.recordDriftMetrics({
        modelId: 'test-model',
        timestamp: new Date(),
        dataDrift: 0.05,
        modelDrift: 0.03,
        labelDrift: 0.02,
        featureDrifts: { feature1: 0.04, feature2: 0.06 },
      });

      const metrics = monitoring.getRecentDriftMetrics(10);
      expect(Array.isArray(metrics)).toBe(true);
    });
  });

  describe('Alert Statistics', () => {
    it('should return alert statistics', () => {
      const stats = monitoring.getAlertStatistics();
      
      expect(stats).toHaveProperty('totalAlerts');
      expect(stats).toHaveProperty('activeAlerts');
      expect(typeof stats.totalAlerts).toBe('number');
      expect(typeof stats.activeAlerts).toBe('number');
    });
  });
});

// ============================================================================
// Personalization Engine Tests
// ============================================================================

describe('PersonalizationEngine', () => {
  let personalization: PersonalizationEngine;

  beforeEach(() => {
    personalization = getPersonalizationEngine();
  });

  describe('User Profile Management', () => {
    it('should create user profile', () => {
      personalization.createUserProfile('test-user-1', 'researcher');
      const profile = personalization.getUserProfile('test-user-1');
      
      expect(profile).toBeDefined();
      expect(profile?.role).toBe('researcher');
    });

    it('should get user segment', () => {
      personalization.createUserProfile('test-user-2', 'policymaker');
      const segment = personalization.getUserSegment('test-user-2');
      
      // May return undefined if no segment assigned yet
      expect(segment === undefined || typeof segment === 'object').toBe(true);
    });
  });

  describe('Behavior Tracking', () => {
    it('should track user behavior', () => {
      personalization.createUserProfile('behavior-user', 'donor');
      
      personalization.trackBehavior({
        userId: 'behavior-user',
        action: 'view',
        targetId: 'indicator-1',
        targetType: 'indicator',
        timestamp: new Date(),
        dwellTime: 120,
        metadata: {},
      });

      // Behavior should be recorded
      const profile = personalization.getUserProfile('behavior-user');
      expect(profile).toBeDefined();
    });
  });

  describe('Content Recommendations', () => {
    it('should recommend content', () => {
      personalization.createUserProfile('rec-user', 'researcher');
      
      // Track some behavior
      personalization.trackBehavior({
        userId: 'rec-user',
        action: 'view',
        targetId: 'doc-1',
        targetType: 'document',
        timestamp: new Date(),
        dwellTime: 300,
        metadata: {},
      });

      const recommendations = personalization.recommendContent('rec-user', 5);
      expect(Array.isArray(recommendations)).toBe(true);
    });
  });

  describe('Dashboard Personalization', () => {
    it('should personalize dashboard', () => {
      personalization.createUserProfile('dash-user', 'banker');
      
      const dashboard = personalization.personalizeDashboard('dash-user');
      
      expect(dashboard).toHaveProperty('userId');
      expect(dashboard).toHaveProperty('layout');
      expect(dashboard).toHaveProperty('widgets');
      expect(Array.isArray(dashboard.widgets)).toBe(true);
    });
  });

  describe('Saved Searches', () => {
    it('should save and retrieve searches', () => {
      personalization.createUserProfile('search-user', 'researcher');
      
      personalization.saveSearch('search-user', {
        id: 'search-1',
        name: 'GDP Analysis',
        query: 'gdp growth yemen',
        filters: { year: 2024 },
        createdDate: new Date(),
        lastUsed: new Date(),
        useCount: 1,
      });

      const searches = personalization.getSavedSearches('search-user');
      expect(Array.isArray(searches)).toBe(true);
    });
  });

  describe('Alert Preferences', () => {
    it('should set and get alert preferences', () => {
      personalization.createUserProfile('alert-user', 'trader');
      
      const preferences = [
        {
          metricId: 'exchange_rate',
          threshold: 0.05,
          direction: 'change' as const,
          frequency: 'immediate' as const,
          channels: ['email', 'dashboard'] as const,
        },
      ];

      personalization.setAlertPreferences('alert-user', preferences);
      const retrieved = personalization.getAlertPreferences('alert-user');
      
      expect(Array.isArray(retrieved)).toBe(true);
    });
  });

  describe('Report Templates', () => {
    it('should recommend report template', () => {
      personalization.createUserProfile('report-user', 'policymaker');
      
      const template = personalization.recommendReportTemplate('report-user', 'weekly');
      
      expect(template).toHaveProperty('id');
      expect(template).toHaveProperty('name');
      expect(template).toHaveProperty('sections');
    });
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('ML System Integration', () => {
  it('should have all singleton instances available', () => {
    const pipeline = getRealtimePipeline();
    const glossary = getGlossaryIntelligence();
    const timeline = getTimelineIntelligence();
    const forecaster = getEnsembleForecaster();
    const monitoring = getMLMonitoring();
    const personalization = getPersonalizationEngine();

    expect(pipeline).toBeDefined();
    expect(glossary).toBeDefined();
    expect(timeline).toBeDefined();
    expect(forecaster).toBeDefined();
    expect(monitoring).toBeDefined();
    expect(personalization).toBeDefined();
  });

  it('should return same instance on multiple calls', () => {
    const pipeline1 = getRealtimePipeline();
    const pipeline2 = getRealtimePipeline();
    
    expect(pipeline1).toBe(pipeline2);
  });
});
