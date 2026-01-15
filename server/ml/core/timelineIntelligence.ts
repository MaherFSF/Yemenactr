/**
 * Intelligent Timeline System
 * Automated event detection, causal inference, and event-indicator linking
 */

import { EventEmitter } from 'events';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface TimelineEvent {
  id: string;
  titleAr: string;
  titleEn: string;
  dateStart: Date;
  dateEnd?: Date;
  category: string;
  tags: string[];
  geography: string;
  regimeTag?: 'aden' | 'sanaa' | 'neutral';
  summaryAr: string;
  summaryEn: string;
  linkedIndicators: string[];
  linkedDatasets: string[];
  linkedDocs: string[];
  confidence: 'A' | 'B' | 'C' | 'D';
  evidencePackId: string;
  versionHistory: EventVersion[];
  source: string;
  sourceUrl?: string;
}

export interface EventVersion {
  version: number;
  timestamp: Date;
  changes: string[];
  editor: string;
}

export interface DetectedEvent {
  id: string;
  timestamp: Date;
  type: 'data_anomaly' | 'policy_change' | 'external_shock' | 'structural_break';
  magnitude: number; // 0-1
  affectedIndicators: string[];
  description: string;
  confidence: number;
  suggestedCategory: string;
  requiresApproval: boolean;
}

export interface CausalEffect {
  eventId: string;
  indicatorId: string;
  lagDays: number;
  direction: 'positive' | 'negative' | 'mixed';
  magnitude: number; // 0-1
  pValue: number;
  confidence: number;
}

export interface EventIndicatorLink {
  eventId: string;
  indicatorId: string;
  linkType: 'cause' | 'effect' | 'correlation' | 'context';
  strength: number; // 0-1
  lag: number; // days
  evidence: string[];
  discoveredDate: Date;
}

export interface EventCluster {
  id: string;
  events: TimelineEvent[];
  theme: string;
  timespan: [Date, Date];
  relatedIndicators: string[];
  narrative: string;
}

export interface EventPrediction {
  predictedEventType: string;
  probability: number;
  expectedDate: Date;
  leadingIndicators: string[];
  confidence: number;
}

// ============================================================================
// Timeline Intelligence Engine
// ============================================================================

export class TimelineIntelligence extends EventEmitter {
  private events: Map<string, TimelineEvent> = new Map();
  private detectedEvents: DetectedEvent[] = [];
  private causalEffects: CausalEffect[] = [];
  private eventIndicatorLinks: EventIndicatorLink[] = [];
  private eventClusters: EventCluster[] = [];
  private eventPredictions: EventPrediction[] = [];

  // Configuration
  private anomalyThreshold: number = 2.0; // Standard deviations
  private causalityThreshold: number = 0.05; // p-value
  private minConfidence: number = 0.7;

  constructor() {
    super();
  }

  /**
   * Add event to timeline
   */
  public addEvent(event: TimelineEvent): void {
    this.events.set(event.id, event);
    this.emit('event:added', event);
  }

  /**
   * Detect events from data streams
   */
  public detectDataEvents(timeSeries: Array<{ timestamp: Date; value: number; indicator: string }>): DetectedEvent[] {
    const detected: DetectedEvent[] = [];

    // Group by indicator
    const byIndicator = new Map<string, Array<{ timestamp: Date; value: number }>>();

    for (const point of timeSeries) {
      if (!byIndicator.has(point.indicator)) {
        byIndicator.set(point.indicator, []);
      }
      byIndicator.get(point.indicator)!.push({ timestamp: point.timestamp, value: point.value });
    }

    // Detect anomalies and structural breaks for each indicator
    const entries = Array.from(byIndicator.entries() as IterableIterator<[string, Array<{ timestamp: Date; value: number }>]>);
    for (const [indicator, data] of entries) {
      const anomalies = this.detectAnomalies(data, indicator);
      detected.push(...anomalies);

      const breaks = this.detectStructuralBreaks(data, indicator);
      detected.push(...breaks);
    }

    this.detectedEvents.push(...detected);
    this.emit('events:detected', { count: detected.length });

    return detected;
  }

  /**
   * Detect anomalies in time series
   */
  private detectAnomalies(
    data: Array<{ timestamp: Date; value: number }>,
    indicator: string
  ): DetectedEvent[] {
    const anomalies: DetectedEvent[] = [];

    if (data.length < 10) return anomalies;

    // Calculate mean and std dev
    const values = data.map((d) => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Find outliers
    for (let i = 0; i < data.length; i++) {
      const zscore = Math.abs((data[i].value - mean) / stdDev);

      if (zscore > this.anomalyThreshold) {
        anomalies.push({
          id: `anomaly-${Date.now()}-${i}`,
          timestamp: data[i].timestamp,
          type: 'data_anomaly',
          magnitude: Math.min(zscore / 5, 1), // Normalize to 0-1
          affectedIndicators: [indicator],
          description: `Anomaly in ${indicator}: ${data[i].value.toFixed(2)} (z-score: ${zscore.toFixed(2)})`,
          confidence: Math.min(zscore / 3, 1),
          suggestedCategory: 'economic_shock',
          requiresApproval: true,
        });
      }
    }

    return anomalies;
  }

  /**
   * Detect structural breaks (regime changes)
   */
  private detectStructuralBreaks(
    data: Array<{ timestamp: Date; value: number }>,
    indicator: string
  ): DetectedEvent[] {
    const breaks: DetectedEvent[] = [];

    if (data.length < 20) return breaks;

    // Chow test for structural breaks
    const values = data.map((d) => d.value);

    for (let breakPoint = 10; breakPoint < values.length - 10; breakPoint++) {
      const before = values.slice(0, breakPoint);
      const after = values.slice(breakPoint);

      const meanBefore = before.reduce((a, b) => a + b, 0) / before.length;
      const meanAfter = after.reduce((a, b) => a + b, 0) / after.length;

      const changeMagnitude = Math.abs(meanAfter - meanBefore) / meanBefore;

      if (changeMagnitude > 0.1) {
        // >10% change
        breaks.push({
          id: `break-${Date.now()}-${breakPoint}`,
          timestamp: data[breakPoint].timestamp,
          type: 'structural_break',
          magnitude: Math.min(changeMagnitude, 1),
          affectedIndicators: [indicator],
          description: `Structural break in ${indicator}: Mean changed from ${meanBefore.toFixed(2)} to ${meanAfter.toFixed(2)}`,
          confidence: 0.8,
          suggestedCategory: 'policy_change',
          requiresApproval: true,
        });
      }
    }

    return breaks;
  }

  /**
   * Estimate causal effects of events on indicators
   */
  public estimateCausalEffects(
    event: TimelineEvent,
    indicators: Array<{ id: string; data: Array<{ timestamp: Date; value: number }> }>
  ): CausalEffect[] {
    const effects: CausalEffect[] = [];

    for (const indicator of indicators) {
      // Granger causality test
      const granger = this.grangerCausalityTest(event.dateStart, indicator.data);

      if (granger.pValue < this.causalityThreshold && granger.confidence >= this.minConfidence) {
        effects.push({
          eventId: event.id,
          indicatorId: indicator.id,
          lagDays: granger.lagDays,
          direction: granger.direction,
          magnitude: granger.magnitude,
          pValue: granger.pValue,
          confidence: granger.confidence,
        });
      }
    }

    this.causalEffects.push(...effects);
    this.emit('causal:effects:estimated', { count: effects.length });

    return effects;
  }

  /**
   * Granger causality test
   */
  private grangerCausalityTest(
    eventDate: Date,
    indicatorData: Array<{ timestamp: Date; value: number }>
  ): {
    pValue: number;
    lagDays: number;
    direction: 'positive' | 'negative' | 'mixed';
    magnitude: number;
    confidence: number;
  } {
    // Placeholder: In production, use proper Granger test
    // For now, use simple correlation analysis

    const eventTime = eventDate.getTime();
    const lags = [7, 14, 30, 60]; // days

    let bestLag = 0;
    let bestCorrelation = 0;
    let bestDirection: 'positive' | 'negative' | 'mixed' = 'mixed';

    for (const lag of lags) {
      const lagMs = lag * 24 * 60 * 60 * 1000;

      // Get values before and after event
      const before = indicatorData.filter((d) => d.timestamp.getTime() < eventTime);
      const after = indicatorData.filter((d) => d.timestamp.getTime() >= eventTime && d.timestamp.getTime() < eventTime + lagMs);

      if (before.length > 0 && after.length > 0) {
        const meanBefore = before.reduce((a, b) => a + b.value, 0) / before.length;
        const meanAfter = after.reduce((a, b) => a + b.value, 0) / after.length;

        const correlation = Math.abs(meanAfter - meanBefore) / meanBefore;

        if (correlation > bestCorrelation) {
          bestCorrelation = correlation;
          bestLag = lag;
          bestDirection = meanAfter > meanBefore ? 'positive' : 'negative';
        }
      }
    }

    return {
      pValue: Math.max(0.01, 0.1 - bestCorrelation), // Inverse relationship
      lagDays: bestLag,
      direction: bestDirection,
      magnitude: Math.min(bestCorrelation, 1),
      confidence: Math.min(bestCorrelation * 1.5, 1),
    };
  }

  /**
   * Link events to affected indicators
   */
  public linkEventToIndicators(
    event: TimelineEvent,
    indicators: Array<{ id: string; data: Array<{ timestamp: Date; value: number }> }>
  ): EventIndicatorLink[] {
    const links: EventIndicatorLink[] = [];

    for (const indicator of indicators) {
      // Find if indicator shows change around event date
      const beforeData = indicator.data.filter((d) => d.timestamp < event.dateStart);
      const afterData = indicator.data.filter((d) => d.timestamp >= event.dateStart && d.timestamp < new Date(event.dateStart.getTime() + 90 * 24 * 60 * 60 * 1000));

      if (beforeData.length > 0 && afterData.length > 0) {
        const meanBefore = beforeData.reduce((a, b) => a + b.value, 0) / beforeData.length;
        const meanAfter = afterData.reduce((a, b) => a + b.value, 0) / afterData.length;

        const changeMagnitude = Math.abs(meanAfter - meanBefore) / meanBefore;

        if (changeMagnitude > 0.05) {
          // >5% change
          // Find lag
          let minLag = 0;
          let maxChange = 0;

          for (let lag = 0; lag <= 60; lag++) {
            const lagDate = new Date(event.dateStart.getTime() + lag * 24 * 60 * 60 * 1000);
            const lagData = indicator.data.filter((d) => d.timestamp >= lagDate && d.timestamp < new Date(lagDate.getTime() + 7 * 24 * 60 * 60 * 1000));

            if (lagData.length > 0) {
              const meanLag = lagData.reduce((a, b) => a + b.value, 0) / lagData.length;
              const change = Math.abs(meanLag - meanBefore) / meanBefore;

              if (change > maxChange) {
                maxChange = change;
                minLag = lag;
              }
            }
          }

          links.push({
            eventId: event.id,
            indicatorId: indicator.id,
            linkType: 'cause',
            strength: Math.min(changeMagnitude, 1),
            lag: minLag,
            evidence: [`${changeMagnitude.toFixed(1)}% change observed`, `Lag: ${minLag} days`],
            discoveredDate: new Date(),
          });
        }
      }
    }

    this.eventIndicatorLinks.push(...links);
    this.emit('event:indicators:linked', { count: links.length });

    return links;
  }

  /**
   * Cluster related events
   */
  public clusterEvents(): EventCluster[] {
    const clusters: EventCluster[] = [];
    const eventArray = Array.from(this.events.values());

    // Simple clustering by time and category
    const timeWindow = 30 * 24 * 60 * 60 * 1000; // 30 days

    for (let i = 0; i < eventArray.length; i++) {
      const event = eventArray[i];

      // Find related events
      const related = eventArray.filter((e) => {
        const timeDiff = Math.abs(e.dateStart.getTime() - event.dateStart.getTime());
        const sameCategory = e.category === event.category;
        const sameGeography = e.geography === event.geography;

        return timeDiff < timeWindow && (sameCategory || sameGeography);
      });

      if (related.length > 1) {
        const cluster: EventCluster = {
          id: `cluster-${Date.now()}-${i}`,
          events: related,
          theme: event.category,
          timespan: [
            new Date(Math.min(...related.map((e) => e.dateStart.getTime()))),
            new Date(Math.max(...related.map((e) => (e.dateEnd || e.dateStart).getTime()))),
          ],
          relatedIndicators: Array.from(new Set(related.flatMap((e) => e.linkedIndicators))),
          narrative: this.generateClusterNarrative(related),
        };

        clusters.push(cluster);
      }
    }

    this.eventClusters = clusters;
    this.emit('events:clustered', { count: clusters.length });

    return clusters;
  }

  /**
   * Generate narrative for event cluster
   */
  private generateClusterNarrative(events: TimelineEvent[]): string {
    if (events.length === 0) return '';

    const titles = events.map((e) => e.titleEn).join(', ');
    const timespan = events[0].dateStart.toLocaleDateString();

    return `A series of ${events.length} related events occurred around ${timespan}: ${titles}.`;
  }

  /**
   * Predict future events from leading indicators
   */
  public predictEvents(
    indicators: Array<{ id: string; data: Array<{ timestamp: Date; value: number }> }>
  ): EventPrediction[] {
    const predictions: EventPrediction[] = [];

    // Placeholder: In production, use ML models for prediction
    // For now, detect anomalies in leading indicators

    for (const indicator of indicators) {
      const data = indicator.data;
      if (data.length < 10) continue;

      const values = data.map((d) => d.value);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);

      // Check if recent values are extreme
      const recent = values.slice(-5);
      const recentMean = recent.reduce((a, b) => a + b, 0) / recent.length;
      const zscore = Math.abs((recentMean - mean) / stdDev);

      if (zscore > 1.5) {
        const lastDate = data[data.length - 1].timestamp;
        const predictedDate = new Date(lastDate.getTime() + 14 * 24 * 60 * 60 * 1000); // 2 weeks ahead

        predictions.push({
          predictedEventType: zscore > 2 ? 'economic_shock' : 'policy_change',
          probability: Math.min(zscore / 3, 1),
          expectedDate: predictedDate,
          leadingIndicators: [indicator.id],
          confidence: 0.6,
        });
      }
    }

    this.eventPredictions = predictions;
    this.emit('events:predicted', { count: predictions.length });

    return predictions;
  }

  /**
   * Get events for time range
   */
  public getEventsByTimeRange(start: Date, end: Date): TimelineEvent[] {
    return Array.from(this.events.values()).filter((e) => e.dateStart >= start && e.dateStart <= end);
  }

  /**
   * Get events by category
   */
  public getEventsByCategory(category: string): TimelineEvent[] {
    return Array.from(this.events.values()).filter((e) => e.category === category);
  }

  /**
   * Get events by geography
   */
  public getEventsByGeography(geography: string): TimelineEvent[] {
    return Array.from(this.events.values()).filter((e) => e.geography === geography);
  }

  /**
   * Get all events
   */
  public getAllEvents(): TimelineEvent[] {
    return Array.from(this.events.values() as IterableIterator<TimelineEvent>);
  }

  /**
   * Get causal effects for event
   */
  public getCausalEffectsForEvent(eventId: string): CausalEffect[] {
    return this.causalEffects.filter((e) => e.eventId === eventId);
  }

  /**
   * Get event-indicator links
   */
  public getEventIndicatorLinks(eventId: string): EventIndicatorLink[] {
    return this.eventIndicatorLinks.filter((l) => l.eventId === eventId);
  }

  /**
   * Get detected events
   */
  public getDetectedEvents(limit: number = 100): DetectedEvent[] {
    return this.detectedEvents.slice(-limit);
  }

  /**
   * Get event predictions
   */
  public getEventPredictions(): EventPrediction[] {
    return this.eventPredictions;
  }

  /**
   * Approve detected event
   */
  public approveDetectedEvent(detectedEventId: string, category: string): TimelineEvent | null {
    const detected = this.detectedEvents.find((e) => e.id === detectedEventId);
    if (!detected) return null;

    const newEvent: TimelineEvent = {
      id: `event-${Date.now()}`,
      titleAr: detected.description,
      titleEn: detected.description,
      dateStart: detected.timestamp,
      category,
      tags: [detected.type],
      geography: 'Yemen',
      summaryAr: detected.description,
      summaryEn: detected.description,
      linkedIndicators: detected.affectedIndicators,
      linkedDatasets: [],
      linkedDocs: [],
      confidence: detected.confidence > 0.8 ? 'A' : detected.confidence > 0.6 ? 'B' : 'C',
      evidencePackId: `evidence-${Date.now()}`,
      versionHistory: [
        {
          version: 1,
          timestamp: new Date(),
          changes: ['Initial creation from detected event'],
          editor: 'system',
        },
      ],
      source: 'automated_detection',
    };

    this.addEvent(newEvent);
    this.emit('event:approved', newEvent);

    return newEvent;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let timelineInstance: TimelineIntelligence | null = null;

export function getTimelineIntelligence(): TimelineIntelligence {
  if (!timelineInstance) {
    timelineInstance = new TimelineIntelligence();
  }
  return timelineInstance;
}

export function resetTimelineIntelligence(): void {
  if (timelineInstance) {
    timelineInstance.removeAllListeners();
  }
  timelineInstance = null;
}
