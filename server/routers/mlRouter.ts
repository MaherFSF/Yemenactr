/**
 * ML Router - Exposes all ML systems as tRPC procedures
 * Integrates with One Brain Intelligence Directive
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure, adminProcedure } from "../_core/trpc";
import { getRealtimePipeline } from "../ml/core/realtimePipeline";
import { getGlossaryIntelligence } from "../ml/core/glossaryIntelligence";
import { getTimelineIntelligence } from "../ml/core/timelineIntelligence";
import { getEnsembleForecaster } from "../ml/models/ensembleForecaster";
import { getMLMonitoring } from "../ml/monitoring/mlMonitoring";
import { getPersonalizationEngine } from "../ml/core/personalizationEngine";

// ============================================================================
// ML Router
// ============================================================================

export const mlRouter = router({
  // ==========================================================================
  // REAL-TIME PIPELINE
  // ==========================================================================
  
  pipeline: router({
    /**
     * Ingest a new data event into the ML pipeline
     */
    ingestEvent: protectedProcedure
      .input(z.object({
        source: z.string(),
        dataType: z.enum(['timeseries', 'event', 'document', 'indicator']),
        data: z.record(z.string(), z.unknown()),
        metadata: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(async ({ input }) => {
        const pipeline = getRealtimePipeline();
        
        await pipeline.ingestEvent({
          id: `event-${Date.now()}`,
          timestamp: new Date(),
          source: input.source,
          dataType: input.dataType,
          data: input.data as Record<string, unknown>,
          metadata: (input.metadata || {}) as Record<string, unknown>,
        });
        
        return { success: true, message: 'Event ingested successfully' };
      }),
    
    /**
     * Get recent insights from the ML pipeline
     */
    getInsights: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(20),
        type: z.enum(['anomaly', 'trend', 'forecast', 'correlation', 'causality']).optional(),
        severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      }))
      .query(async ({ input }) => {
        const pipeline = getRealtimePipeline();
        let insights = pipeline.getRecentInsights(input.limit);
        
        if (input.type) {
          insights = insights.filter((i) => i.type === input.type);
        }
        
        if (input.severity) {
          insights = insights.filter((i) => i.severity === input.severity);
        }
        
        return insights;
      }),
    
    /**
     * Get pipeline metrics
     */
    getMetrics: publicProcedure.query(async () => {
      const pipeline = getRealtimePipeline();
      return pipeline.getMetrics();
    }),
    
    /**
     * Get recent model inferences
     */
    getInferences: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(20),
      }))
      .query(async ({ input }) => {
        const pipeline = getRealtimePipeline();
        return pipeline.getRecentInferences(input.limit);
      }),
  }),
  
  // ==========================================================================
  // GLOSSARY INTELLIGENCE
  // ==========================================================================
  
  glossary: router({
    /**
     * Search terms semantically
     */
    search: publicProcedure
      .input(z.object({
        query: z.string(),
        language: z.enum(['ar', 'en', 'both']).default('both'),
      }))
      .query(async ({ input }) => {
        const glossary = getGlossaryIntelligence();
        return glossary.searchTerms(input.query, input.language);
      }),
    
    /**
     * Find semantically similar terms
     */
    findSimilar: publicProcedure
      .input(z.object({
        termId: z.string(),
        topK: z.number().min(1).max(20).default(5),
      }))
      .query(async ({ input }) => {
        const glossary = getGlossaryIntelligence();
        return glossary.findSimilarTerms(input.termId, input.topK);
      }),
    
    /**
     * Get term relationships
     */
    getRelationships: publicProcedure
      .input(z.object({
        termId: z.string(),
      }))
      .query(async ({ input }) => {
        const glossary = getGlossaryIntelligence();
        return glossary.discoverRelationships(input.termId);
      }),
    
    /**
     * Suggest terms based on context
     */
    suggest: protectedProcedure
      .input(z.object({
        context: z.string(),
        topK: z.number().min(1).max(10).default(5),
      }))
      .query(async ({ input, ctx }) => {
        const glossary = getGlossaryIntelligence();
        const userRole = (ctx.user as any)?.role || 'public';
        return glossary.suggestTerms(input.context, userRole, input.topK);
      }),
    
    /**
     * Get trending terms
     */
    getTrending: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(20).default(10),
      }))
      .query(async ({ input }) => {
        const glossary = getGlossaryIntelligence();
        return glossary.getTrendingTerms(input.limit);
      }),
    
    /**
     * Track term usage
     */
    trackUsage: protectedProcedure
      .input(z.object({
        termId: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const glossary = getGlossaryIntelligence();
        const userRole = (ctx.user as any)?.role || 'public';
        glossary.trackUsage(input.termId, userRole);
        return { success: true };
      }),
    
    /**
     * Score translation quality
     */
    scoreTranslation: publicProcedure
      .input(z.object({
        termAr: z.string(),
        termEn: z.string(),
      }))
      .query(async ({ input }) => {
        const glossary = getGlossaryIntelligence();
        return glossary.scoreTranslation(input.termAr, input.termEn);
      }),
  }),
  
  // ==========================================================================
  // TIMELINE INTELLIGENCE
  // ==========================================================================
  
  timeline: router({
    /**
     * Detect events from time series data
     */
    detectEvents: protectedProcedure
      .input(z.object({
        timeSeries: z.array(z.object({
          timestamp: z.date(),
          value: z.number(),
          indicator: z.string(),
        })),
      }))
      .mutation(async ({ input }) => {
        const timeline = getTimelineIntelligence();
        return timeline.detectDataEvents(input.timeSeries);
      }),
    
    /**
     * Get detected events
     */
    getDetectedEvents: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
      }))
      .query(async ({ input }) => {
        const timeline = getTimelineIntelligence();
        return timeline.getDetectedEvents(input.limit);
      }),
    
    /**
     * Get event predictions
     */
    getPredictions: publicProcedure.query(async () => {
      const timeline = getTimelineIntelligence();
      return timeline.getEventPredictions();
    }),
    
    /**
     * Get causal effects for an event
     */
    getCausalEffects: publicProcedure
      .input(z.object({
        eventId: z.string(),
      }))
      .query(async ({ input }) => {
        const timeline = getTimelineIntelligence();
        return timeline.getCausalEffectsForEvent(input.eventId);
      }),
    
    /**
     * Get event-indicator links
     */
    getIndicatorLinks: publicProcedure
      .input(z.object({
        eventId: z.string(),
      }))
      .query(async ({ input }) => {
        const timeline = getTimelineIntelligence();
        return timeline.getEventIndicatorLinks(input.eventId);
      }),
    
    /**
     * Approve a detected event
     */
    approveEvent: adminProcedure
      .input(z.object({
        detectedEventId: z.string(),
        category: z.string(),
      }))
      .mutation(async ({ input }) => {
        const timeline = getTimelineIntelligence();
        return timeline.approveDetectedEvent(input.detectedEventId, input.category);
      }),
  }),
  
  // ==========================================================================
  // ENSEMBLE FORECASTING
  // ==========================================================================
  
  forecasting: router({
    /**
     * Generate ensemble forecast
     */
    forecast: publicProcedure
      .input(z.object({
        data: z.array(z.number()),
        steps: z.number().min(1).max(365).default(30),
        features: z.array(z.array(z.number())).optional(),
      }))
      .query(async ({ input }) => {
        const forecaster = getEnsembleForecaster();
        forecaster.fit(input.data, input.features);
        return forecaster.forecast(input.steps, input.features);
      }),
    
    /**
     * Get model weights
     */
    getWeights: publicProcedure.query(async () => {
      const forecaster = getEnsembleForecaster();
      return forecaster.getWeights();
    }),
    
    /**
     * Get model performance
     */
    getPerformance: publicProcedure.query(async () => {
      const forecaster = getEnsembleForecaster();
      return forecaster.getPerformance();
    }),
    
    /**
     * Select best model for data
     */
    selectBestModel: publicProcedure
      .input(z.object({
        data: z.array(z.number()),
      }))
      .query(async ({ input }) => {
        const forecaster = getEnsembleForecaster();
        return forecaster.selectBestModel(input.data);
      }),
  }),
  
  // ==========================================================================
  // ML MONITORING
  // ==========================================================================
  
  monitoring: router({
    /**
     * Get system health score
     */
    getHealthScore: publicProcedure.query(async () => {
      const monitoring = getMLMonitoring();
      return monitoring.getSystemHealthScore();
    }),
    
    /**
     * Get dashboard summary
     */
    getDashboardSummary: publicProcedure.query(async () => {
      const monitoring = getMLMonitoring();
      return monitoring.getDashboardSummary();
    }),
    
    /**
     * Get active alerts
     */
    getActiveAlerts: publicProcedure.query(async () => {
      const monitoring = getMLMonitoring();
      return monitoring.getActiveAlerts();
    }),
    
    /**
     * Acknowledge an alert
     */
    acknowledgeAlert: adminProcedure
      .input(z.object({
        alertId: z.string(),
      }))
      .mutation(async ({ input }) => {
        const monitoring = getMLMonitoring();
        monitoring.acknowledgeAlert(input.alertId);
        return { success: true };
      }),
    
    /**
     * Get model metrics
     */
    getModelMetrics: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
      }))
      .query(async ({ input }) => {
        const monitoring = getMLMonitoring();
        return monitoring.getRecentModelMetrics(input.limit);
      }),
    
    /**
     * Get data quality metrics
     */
    getDataQualityMetrics: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
      }))
      .query(async ({ input }) => {
        const monitoring = getMLMonitoring();
        return monitoring.getRecentDataQualityMetrics(input.limit);
      }),
    
    /**
     * Get drift metrics
     */
    getDriftMetrics: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
      }))
      .query(async ({ input }) => {
        const monitoring = getMLMonitoring();
        return monitoring.getRecentDriftMetrics(input.limit);
      }),
    
    /**
     * Get alert statistics
     */
    getAlertStatistics: publicProcedure.query(async () => {
      const monitoring = getMLMonitoring();
      return monitoring.getAlertStatistics();
    }),
    
    /**
     * Record model metrics (admin only)
     */
    recordModelMetrics: adminProcedure
      .input(z.object({
        modelId: z.string(),
        accuracy: z.number(),
        precision: z.number(),
        recall: z.number(),
        f1Score: z.number(),
        latency: z.number(),
        throughput: z.number(),
        errorRate: z.number(),
      }))
      .mutation(async ({ input }) => {
        const monitoring = getMLMonitoring();
        monitoring.recordModelMetrics({
          ...input,
          timestamp: new Date(),
        });
        return { success: true };
      }),
  }),
  
  // ==========================================================================
  // PERSONALIZATION
  // ==========================================================================
  
  personalization: router({
    /**
     * Get content recommendations
     */
    getRecommendations: protectedProcedure
      .input(z.object({
        topK: z.number().min(1).max(20).default(10),
      }))
      .query(async ({ input, ctx }) => {
        const personalization = getPersonalizationEngine();
        const userId = (ctx.user as any)?.id || 'anonymous';
        return personalization.recommendContent(userId, input.topK);
      }),
    
    /**
     * Get user profile
     */
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const personalization = getPersonalizationEngine();
      const userId = (ctx.user as any)?.id || 'anonymous';
      return personalization.getUserProfile(userId);
    }),
    
    /**
     * Get user segment
     */
    getSegment: protectedProcedure.query(async ({ ctx }) => {
      const personalization = getPersonalizationEngine();
      const userId = (ctx.user as any)?.id || 'anonymous';
      return personalization.getUserSegment(userId);
    }),
    
    /**
     * Get personalized dashboard
     */
    getDashboard: protectedProcedure.query(async ({ ctx }) => {
      const personalization = getPersonalizationEngine();
      const userId = (ctx.user as any)?.id || 'anonymous';
      return personalization.personalizeDashboard(userId);
    }),
    
    /**
     * Track user behavior
     */
    trackBehavior: protectedProcedure
      .input(z.object({
        action: z.enum(['view', 'search', 'export', 'share', 'bookmark', 'comment']),
        targetId: z.string(),
        targetType: z.enum(['indicator', 'event', 'document', 'report', 'term']),
        dwellTime: z.number().optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const personalization = getPersonalizationEngine();
        const userId = (ctx.user as any)?.id || 'anonymous';
        
        personalization.trackBehavior({
          userId,
          action: input.action,
          targetId: input.targetId,
          targetType: input.targetType,
          timestamp: new Date(),
          dwellTime: input.dwellTime || 0,
          metadata: input.metadata || {},
        });
        
        return { success: true };
      }),
    
    /**
     * Get saved searches
     */
    getSavedSearches: protectedProcedure.query(async ({ ctx }) => {
      const personalization = getPersonalizationEngine();
      const userId = (ctx.user as any)?.id || 'anonymous';
      return personalization.getSavedSearches(userId);
    }),
    
    /**
     * Save a search
     */
    saveSearch: protectedProcedure
      .input(z.object({
        name: z.string(),
        query: z.string(),
        filters: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const personalization = getPersonalizationEngine();
        const userId = (ctx.user as any)?.id || 'anonymous';
        
        personalization.saveSearch(userId, {
          id: `search-${Date.now()}`,
          name: input.name,
          query: input.query,
          filters: input.filters || {},
          createdDate: new Date(),
          lastUsed: new Date(),
          useCount: 1,
        });
        
        return { success: true };
      }),
    
    /**
     * Get alert preferences
     */
    getAlertPreferences: protectedProcedure.query(async ({ ctx }) => {
      const personalization = getPersonalizationEngine();
      const userId = (ctx.user as any)?.id || 'anonymous';
      return personalization.getAlertPreferences(userId);
    }),
    
    /**
     * Set alert preferences
     */
    setAlertPreferences: protectedProcedure
      .input(z.object({
        preferences: z.array(z.object({
          metricId: z.string(),
          threshold: z.number(),
          direction: z.enum(['above', 'below', 'change']),
          frequency: z.enum(['immediate', 'daily', 'weekly']),
          channels: z.array(z.enum(['email', 'push', 'sms', 'dashboard'])),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        const personalization = getPersonalizationEngine();
        const userId = (ctx.user as any)?.id || 'anonymous';
        personalization.setAlertPreferences(userId, input.preferences);
        return { success: true };
      }),
    
    /**
     * Optimize alert thresholds based on feedback
     */
    optimizeAlerts: protectedProcedure
      .input(z.object({
        feedback: z.record(z.string(), z.enum(['relevant', 'irrelevant'])),
      }))
      .mutation(async ({ input, ctx }) => {
        const personalization = getPersonalizationEngine();
        const userId = (ctx.user as any)?.id || 'anonymous';
        personalization.optimizeAlertThresholds(userId, input.feedback);
        return { success: true };
      }),
    
    /**
     * Get recommended report template
     */
    getReportTemplate: protectedProcedure
      .input(z.object({
        context: z.string().optional(),
      }))
      .query(async ({ input, ctx }) => {
        const personalization = getPersonalizationEngine();
        const userId = (ctx.user as any)?.id || 'anonymous';
        return personalization.recommendReportTemplate(userId, input.context || '');
      }),
  }),
});

export type MLRouter = typeof mlRouter;
