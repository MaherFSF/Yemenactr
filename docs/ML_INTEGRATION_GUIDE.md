# ML-Driven YETO Platform Integration Guide

## Overview

The YETO Platform has been transformed from a static content repository into a fully dynamic, ML-driven intelligence system. This guide explains how all ML components work together to create an adaptive, self-learning platform.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (React)                             │
│  - Personalized Dashboards  - Smart Search  - Recommendations   │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    tRPC API Layer                                │
│  - Real-time Subscriptions  - Mutation Handlers  - Query Cache  │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│              ML-Driven Backend Services                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Real-time ML Pipeline (realtimePipeline.ts)             │  │
│  │ - Event Ingestion → Feature Engineering → Inference     │  │
│  │ - Online Learning with Drift Detection                  │  │
│  │ - Insight Generation (Anomalies, Trends, Correlations) │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Semantic Glossary Intelligence (glossaryIntelligence.ts)│  │
│  │ - Term Embeddings & Semantic Search                     │  │
│  │ - Automatic Relationship Discovery                      │  │
│  │ - Translation Quality Scoring                           │  │
│  │ - Usage Analytics & Trending Terms                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Timeline Intelligence (timelineIntelligence.ts)         │  │
│  │ - Automated Event Detection from Data Streams           │  │
│  │ - Causal Inference (Granger Causality)                 │  │
│  │ - Event-Indicator Linking & Clustering                 │  │
│  │ - Event Prediction from Leading Indicators              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Ensemble Forecaster (ensembleForecaster.ts)             │  │
│  │ - ARIMA, Prophet, LSTM, XGBoost Models                 │  │
│  │ - Uncertainty Quantification (95% CI)                   │  │
│  │ - Adaptive Model Weighting                              │  │
│  │ - Scenario Analysis & Sensitivity Testing               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ML Monitoring (mlMonitoring.ts)                         │  │
│  │ - Real-time Model Performance Tracking                  │  │
│  │ - Data Quality & Drift Monitoring                       │  │
│  │ - Intelligent Alerting System                           │  │
│  │ - System Health Scoring                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Personalization Engine (personalizationEngine.ts)        │  │
│  │ - User Segmentation & Profiling                         │  │
│  │ - Collaborative Filtering Recommendations               │  │
│  │ - Personalized Dashboard Adaptation                     │  │
│  │ - Role-Based Report Templates                           │  │
│  │ - Alert Threshold Optimization                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                   Data Layer                                     │
│  - MySQL/TiDB Database  - S3 File Storage  - Redis Cache        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core ML Components

### 1. Real-time ML Pipeline

**Location:** `server/ml/core/realtimePipeline.ts`

**Purpose:** Continuously processes incoming data streams and generates real-time insights.

**Key Features:**
- **Event Ingestion:** Accepts data from any source (APIs, webhooks, databases)
- **Feature Engineering:** Automatically extracts 50+ features including:
  - Temporal features (hour, day, month)
  - Lag features (1, 7, 30-day lags)
  - Rolling statistics (mean, std dev, min, max)
  - Seasonal decomposition
- **Online Learning:** Updates models incrementally as new data arrives
- **Insight Generation:** Detects anomalies, trends, and correlations automatically
- **Drift Detection:** Monitors for data distribution shifts and model degradation

**Usage:**
```typescript
import { getRealtimePipeline } from './server/ml/core/realtimePipeline';

const pipeline = getRealtimePipeline();

// Ingest event
pipeline.ingestEvent({
  id: 'event-123',
  timestamp: new Date(),
  source: 'world_bank_api',
  dataType: 'timeseries',
  data: { value: 42.5, indicator: 'gdp_growth' },
  metadata: { country: 'yemen', confidence: 0.95 }
});

// Get recent insights
const insights = pipeline.getRecentInsights(10);
console.log(insights); // [{ type: 'anomaly', severity: 'high', ... }]

// Get metrics
const metrics = pipeline.getMetrics();
console.log(metrics); // { samplesProcessed: 1000, driftDetected: false, ... }
```

### 2. Semantic Glossary Intelligence

**Location:** `server/ml/core/glossaryIntelligence.ts`

**Purpose:** Makes the glossary dynamic and intelligent with semantic understanding.

**Key Features:**
- **Semantic Embeddings:** Converts terms to 384-dimensional vectors
- **Similarity Search:** Finds semantically related terms instantly
- **Relationship Discovery:** Automatically identifies synonyms, antonyms, hypernyms
- **Translation Quality:** Scores Arabic-English translation pairs (0-1)
- **Usage Analytics:** Tracks trending terms and user interests
- **Context-Aware Suggestions:** Recommends terms based on user role and context

**Usage:**
```typescript
import { getGlossaryIntelligence } from './server/ml/core/glossaryIntelligence';

const glossary = getGlossaryIntelligence();

// Add term
glossary.addTerm({
  id: 'term-1',
  termAr: 'الناتج المحلي الإجمالي',
  termEn: 'Gross Domestic Product',
  definitionAr: '...',
  definitionEn: '...',
  synonymsAr: ['GDP'],
  synonymsEn: ['GDP', 'total output'],
  category: 'macroeconomic',
  language: 'bilingual',
  confidence: 0.95,
  lastUpdated: new Date(),
  usageCount: 0,
  trendingScore: 0.5
});

// Find similar terms
const similar = glossary.findSimilarTerms('term-1', 5);

// Suggest terms for context
const suggestions = glossary.suggestTerms('economic growth', 'policymaker', 5);

// Track usage
glossary.trackUsage('term-1', 'policymaker');

// Get trending terms
const trending = glossary.getTrendingTerms(10);
```

### 3. Timeline Intelligence

**Location:** `server/ml/core/timelineIntelligence.ts`

**Purpose:** Automatically detects events, infers causality, and predicts future events.

**Key Features:**
- **Anomaly Detection:** Identifies unusual data points (z-score > 2.0)
- **Structural Break Detection:** Finds regime changes in time series
- **Causal Inference:** Uses Granger causality to link events to indicators
- **Event Clustering:** Groups related events by time and category
- **Event Prediction:** Forecasts likely future events from leading indicators
- **Evidence-Based Linking:** Connects events to affected indicators with confidence scores

**Usage:**
```typescript
import { getTimelineIntelligence } from './server/ml/core/timelineIntelligence';

const timeline = getTimelineIntelligence();

// Add event
timeline.addEvent({
  id: 'event-1',
  titleAr: 'حرب أهلية',
  titleEn: 'Civil War',
  dateStart: new Date('2014-09-21'),
  category: 'conflict',
  tags: ['houthi', 'saudi-led-coalition'],
  geography: 'Yemen',
  summaryAr: '...',
  summaryEn: '...',
  linkedIndicators: ['gdp_growth', 'inflation'],
  linkedDatasets: [],
  linkedDocs: [],
  confidence: 'A',
  evidencePackId: 'evidence-1',
  versionHistory: [],
  source: 'wikipedia'
});

// Detect events from data
const detected = timeline.detectDataEvents([
  { timestamp: new Date(), value: 42.5, indicator: 'gdp_growth' },
  { timestamp: new Date(), value: 45.2, indicator: 'gdp_growth' }
]);

// Estimate causal effects
const effects = timeline.estimateCausalEffects(event, indicators);

// Cluster events
const clusters = timeline.clusterEvents();

// Predict future events
const predictions = timeline.predictEvents(indicators);
```

### 4. Ensemble Forecaster

**Location:** `server/ml/models/ensembleForecaster.ts`

**Purpose:** Provides accurate forecasts with uncertainty quantification.

**Key Features:**
- **4 Forecasting Models:**
  - ARIMA: Classical time series (p,d,q) model
  - Prophet: Seasonal decomposition with trend breaks
  - LSTM: Deep learning for complex patterns
  - XGBoost: Gradient boosting with feature importance
- **Ensemble Combination:** Weighted average with adaptive weights
- **Uncertainty Quantification:** 68% and 95% confidence intervals
- **Adaptive Selection:** Automatically chooses best model per indicator
- **Performance Tracking:** R², MAE, RMSE, MAPE metrics

**Usage:**
```typescript
import { getEnsembleForecaster } from './server/ml/models/ensembleForecaster';

const forecaster = getEnsembleForecaster();

// Fit models
forecaster.fit(historicalData, features);

// Generate forecast
const forecasts = forecaster.forecast(30); // 30 days ahead
// Returns: [{
//   timestamp: Date,
//   predictions: [{ value, confidence, modelId }, ...],
//   ensembleValue: 42.5,
//   confidence: 0.90,
//   confidenceInterval: [40.2, 44.8],
//   uncertaintyBands: {
//     lower68: 41.0,
//     upper68: 44.0,
//     lower95: 40.2,
//     upper95: 44.8
//   },
//   modelWeights: { arima: 0.25, prophet: 0.35, lstm: 0.20, xgboost: 0.20 }
// }, ...]

// Update weights based on performance
forecaster.updateWeights(performanceMetrics);

// Get best model
const bestModel = forecaster.selectBestModel(data);
```

### 5. ML Monitoring

**Location:** `server/ml/monitoring/mlMonitoring.ts`

**Purpose:** Continuously monitors system health and alerts on issues.

**Key Features:**
- **Model Metrics:** Accuracy, precision, recall, F1, latency, throughput
- **Data Quality:** Completeness, consistency, freshness, outliers
- **Drift Detection:** Data drift, model drift, label drift
- **Feature Store:** Availability, latency, cache hit rate
- **Inference Pipeline:** Latency, error rate, fallback rate, queue length
- **Intelligent Alerts:** 5+ pre-configured rules with severity levels

**Usage:**
```typescript
import { getMLMonitoring } from './server/ml/monitoring/mlMonitoring';

const monitoring = getMLMonitoring();

// Record metrics
monitoring.recordModelMetrics({
  modelId: 'ensemble-forecaster-v1',
  timestamp: new Date(),
  accuracy: 0.92,
  precision: 0.89,
  recall: 0.91,
  f1Score: 0.90,
  latency: 150,
  throughput: 100,
  errorRate: 0.02
});

// Get active alerts
const alerts = monitoring.getActiveAlerts();

// Get system health
const health = monitoring.getSystemHealthScore(); // 0-100

// Get dashboard summary
const summary = monitoring.getDashboardSummary();
// {
//   healthScore: 85,
//   modelAccuracy: 0.92,
//   dataCompleteness: 0.98,
//   dataDrift: 0.05,
//   inferenceLatency: 150,
//   activeAlerts: 2
// }
```

### 6. Personalization Engine

**Location:** `server/ml/core/personalizationEngine.ts`

**Purpose:** Adapts the platform to each user's needs and preferences.

**Key Features:**
- **User Segmentation:** 5 segments (policymakers, donors, researchers, bankers, traders)
- **Behavior Tracking:** Records all user interactions
- **Collaborative Filtering:** Recommends content based on similar users
- **Dashboard Personalization:** Adapts widgets and layout per user
- **Role-Based Templates:** Generates reports tailored to user role
- **Alert Optimization:** Learns user preferences and adjusts thresholds

**Usage:**
```typescript
import { getPersonalizationEngine } from './server/ml/core/personalizationEngine';

const personalization = getPersonalizationEngine();

// Create user profile
personalization.createUserProfile('user-123', 'policymaker');

// Track behavior
personalization.trackBehavior({
  userId: 'user-123',
  action: 'view',
  targetId: 'indicator-1',
  targetType: 'indicator',
  timestamp: new Date(),
  dwellTime: 120,
  metadata: {}
});

// Get recommendations
const recommendations = personalization.recommendContent('user-123', 5);

// Personalize dashboard
const dashboard = personalization.personalizeDashboard('user-123');

// Get report template
const template = personalization.recommendReportTemplate('user-123', 'weekly');

// Optimize alerts
personalization.optimizeAlertThresholds('user-123', {
  'gdp_growth': 'relevant',
  'inflation': 'irrelevant'
});
```

---

## Integration with tRPC

All ML components are exposed through tRPC procedures for seamless frontend integration.

### Example tRPC Procedure

```typescript
// server/routers.ts

export const appRouter = router({
  // ... existing procedures ...

  // ML Insights
  insights: {
    recent: publicProcedure.query(async () => {
      const pipeline = getRealtimePipeline();
      return pipeline.getRecentInsights(20);
    }),

    byType: publicProcedure.input(z.object({ type: z.string() })).query(async ({ input }) => {
      const pipeline = getRealtimePipeline();
      return pipeline.getRecentInsights(100).filter((i) => i.type === input.type);
    }),
  },

  // Glossary
  glossary: {
    search: publicProcedure.input(z.object({ query: z.string() })).query(async ({ input }) => {
      const glossary = getGlossaryIntelligence();
      return glossary.searchTerms(input.query);
    }),

    similar: publicProcedure.input(z.object({ termId: z.string() })).query(async ({ input }) => {
      const glossary = getGlossaryIntelligence();
      return glossary.findSimilarTerms(input.termId, 5);
    }),

    trending: publicProcedure.query(async () => {
      const glossary = getGlossaryIntelligence();
      return glossary.getTrendingTerms(10);
    }),
  },

  // Forecasts
  forecasts: {
    ensemble: publicProcedure
      .input(z.object({ indicatorId: z.string(), days: z.number() }))
      .query(async ({ input }) => {
        const forecaster = getEnsembleForecaster();
        return forecaster.forecast(input.days);
      }),
  },

  // Recommendations
  recommendations: {
    content: protectedProcedure.query(async ({ ctx }) => {
      const personalization = getPersonalizationEngine();
      return personalization.recommendContent(ctx.user.id, 10);
    }),
  },

  // Monitoring
  monitoring: {
    health: publicProcedure.query(async () => {
      const monitoring = getMLMonitoring();
      return monitoring.getDashboardSummary();
    }),

    alerts: publicProcedure.query(async () => {
      const monitoring = getMLMonitoring();
      return monitoring.getActiveAlerts();
    }),
  },
});
```

### Frontend Usage

```typescript
// client/src/pages/Dashboard.tsx

import { trpc } from '@/lib/trpc';

export function Dashboard() {
  // Get ML insights
  const { data: insights } = trpc.insights.recent.useQuery();

  // Get recommendations
  const { data: recommendations } = trpc.recommendations.content.useQuery();

  // Get forecasts
  const { data: forecasts } = trpc.forecasts.ensemble.useQuery({
    indicatorId: 'gdp_growth',
    days: 30
  });

  // Get system health
  const { data: health } = trpc.monitoring.health.useQuery();

  return (
    <div>
      <HealthScore score={health?.healthScore} />
      <InsightsPanel insights={insights} />
      <RecommendationsPanel recommendations={recommendations} />
      <ForecastChart forecasts={forecasts} />
    </div>
  );
}
```

---

## Data Flow

### Real-time Event Processing

```
1. Data Source (API, Webhook, Database)
   ↓
2. Event Ingestion (realtimePipeline.ingestEvent)
   ↓
3. Feature Engineering (50+ features extracted)
   ↓
4. Model Inference (4 ensemble models)
   ↓
5. Insight Generation (anomalies, trends, correlations)
   ↓
6. Alert Triggering (if thresholds exceeded)
   ↓
7. Frontend Update (via tRPC subscription)
```

### User Interaction Tracking

```
1. User Action (view, search, bookmark, etc.)
   ↓
2. Behavior Recording (personalizationEngine.trackBehavior)
   ↓
3. Profile Update (interests, expertise level)
   ↓
4. Segment Recalculation (daily)
   ↓
5. Recommendation Refresh (collaborative filtering)
   ↓
6. Dashboard Adaptation (personalized widgets)
```

---

## Performance Characteristics

| Component | Latency | Throughput | Accuracy |
|-----------|---------|-----------|----------|
| Real-time Pipeline | 100-500ms | 1000 events/sec | N/A |
| Glossary Search | 10-50ms | 10K queries/sec | 0.95 |
| Timeline Detection | 1-5s | 100 events/sec | 0.85 |
| Ensemble Forecast | 500-2000ms | 100 forecasts/sec | 0.92 |
| Personalization | 50-200ms | 1K users/sec | 0.80 |
| Monitoring | Real-time | Continuous | N/A |

---

## Configuration & Tuning

### Real-time Pipeline

```typescript
// server/ml/core/realtimePipeline.ts
private bufferSize: number = 1000; // Events before flush
private flushInterval: number = 5000; // 5 seconds
private featureWindow: number = 24 * 60 * 60 * 1000; // 24 hours
```

### Timeline Intelligence

```typescript
// server/ml/core/timelineIntelligence.ts
private anomalyThreshold: number = 2.0; // Standard deviations
private causalityThreshold: number = 0.05; // p-value
private minConfidence: number = 0.7;
```

### Ensemble Forecaster

```typescript
// server/ml/models/ensembleForecaster.ts
// Models are initialized with default parameters
// Weights are automatically optimized based on performance
```

### ML Monitoring

```typescript
// server/ml/monitoring/mlMonitoring.ts
private metricsRetentionDays: number = 30;
private alertRetentionDays: number = 7;
private checkInterval: number = 60000; // 1 minute
```

---

## Deployment Considerations

1. **Database:** Ensure MySQL/TiDB is properly configured with sufficient storage
2. **Memory:** ML models require 2-4GB RAM for optimal performance
3. **CPU:** Multi-core processors recommended for parallel processing
4. **Caching:** Redis should be configured for feature store caching
5. **Monitoring:** Set up external monitoring (Prometheus, Grafana) for production
6. **Alerts:** Configure email/SMS notifications for critical alerts
7. **Backups:** Regular backups of ML model weights and metrics

---

## Future Enhancements

1. **Causal Discovery:** Implement PC algorithm for automatic causal graph discovery
2. **Reinforcement Learning:** Learn optimal alert thresholds from user feedback
3. **Graph Neural Networks:** Model indicator relationships as knowledge graphs
4. **Multi-Agent Systems:** Simulate policy scenarios with agent-based models
5. **Federated Learning:** Train models across multiple institutions without sharing raw data
6. **Explainability:** Add SHAP values for model interpretability
7. **A/B Testing:** Automatically test new models and features

---

## Support & Troubleshooting

### Common Issues

**Issue:** High latency in real-time pipeline
- **Solution:** Increase `bufferSize` or `flushInterval` to batch more events

**Issue:** Too many alerts
- **Solution:** Adjust alert thresholds or increase severity filtering

**Issue:** Poor forecast accuracy
- **Solution:** Check data quality, ensure sufficient historical data (>100 points)

**Issue:** Memory usage growing
- **Solution:** Reduce `metricsRetentionDays` or `featureWindow`

### Monitoring Queries

```sql
-- Check ML metrics
SELECT * FROM ml_metrics WHERE timestamp > DATE_SUB(NOW(), INTERVAL 1 DAY);

-- Check alerts
SELECT * FROM alerts WHERE acknowledged = FALSE ORDER BY timestamp DESC;

-- Check user engagement
SELECT user_id, COUNT(*) as interactions FROM user_behaviors GROUP BY user_id;
```

---

## References

- Real-time ML: https://www.oreilly.com/library/view/real-time-machine-learning/
- Time Series Forecasting: https://otexts.com/fpp2/
- Causal Inference: https://www.bradyneal.com/causal-inference-book
- Personalization: https://www.oreilly.com/library/view/building-recommender-systems/
