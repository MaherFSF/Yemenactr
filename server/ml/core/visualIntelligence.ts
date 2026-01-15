/**
 * Visual Intelligence Module for One Brain
 * Generates charts, timelines, and visualizations from evidence
 */

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'timeline' | 'comparison';
  title: string;
  titleAr: string;
  subtitle?: string;
  subtitleAr?: string;
  data: ChartDataPoint[];
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  annotations?: ChartAnnotation[];
  uncertaintyBands?: UncertaintyBand[];
  sources: string[];
  confidenceLevel: 'A' | 'B' | 'C' | 'D';
}

export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
  labelAr?: string;
  category?: string;
  regime?: 'aden' | 'sanaa' | 'unified';
  confidence?: number;
  upperBound?: number;
  lowerBound?: number;
}

export interface AxisConfig {
  label: string;
  labelAr: string;
  unit?: string;
  unitAr?: string;
  min?: number;
  max?: number;
}

export interface ChartAnnotation {
  x: string | number;
  y?: number;
  text: string;
  textAr: string;
  type: 'event' | 'threshold' | 'trend' | 'insight';
  importance: 'high' | 'medium' | 'low';
}

export interface UncertaintyBand {
  label: string;
  labelAr: string;
  upperBound: number[];
  lowerBound: number[];
  confidenceLevel: number; // 0-100
}

export interface TimelineVisualization {
  events: TimelineEvent[];
  indicators: TimelineIndicator[];
  annotations: TimelineAnnotation[];
}

export interface TimelineEvent {
  id: string;
  date: Date;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  impact: 'high' | 'medium' | 'low';
  regime?: 'aden' | 'sanaa' | 'both';
}

export interface TimelineIndicator {
  id: string;
  name: string;
  nameAr: string;
  dataPoints: { date: Date; value: number }[];
  unit: string;
  unitAr: string;
}

export interface TimelineAnnotation {
  date: Date;
  text: string;
  textAr: string;
  linkedEventId?: string;
  linkedIndicatorId?: string;
}

export interface ComparisonVisualization {
  title: string;
  titleAr: string;
  items: ComparisonItem[];
  dimensions: ComparisonDimension[];
}

export interface ComparisonItem {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  values: Record<string, number | string>;
}

export interface ComparisonDimension {
  key: string;
  label: string;
  labelAr: string;
  type: 'number' | 'percentage' | 'text' | 'rating';
  unit?: string;
  unitAr?: string;
}

export interface VisualInsight {
  type: 'chart' | 'timeline' | 'comparison' | 'map' | 'table';
  config: ChartConfig | TimelineVisualization | ComparisonVisualization;
  narrative: string;
  narrativeAr: string;
  keyTakeaways: string[];
  keyTakeawaysAr: string[];
}

/**
 * Visual Intelligence Engine
 * Determines appropriate visualizations and generates configurations
 */
export class VisualIntelligenceEngine {
  /**
   * Analyze query and evidence to determine best visualization
   */
  determineVisualization(
    query: string,
    evidence: any[],
    language: 'en' | 'ar'
  ): VisualInsight | null {
    const queryLower = query.toLowerCase();
    
    // Detect visualization type from query patterns
    if (this.isTimeSeriesQuery(queryLower)) {
      return this.generateTimeSeriesChart(evidence, language);
    }
    
    if (this.isComparisonQuery(queryLower)) {
      return this.generateComparisonChart(evidence, language);
    }
    
    if (this.isTimelineQuery(queryLower)) {
      return this.generateTimelineVisualization(evidence, language);
    }
    
    if (this.isDistributionQuery(queryLower)) {
      return this.generatePieChart(evidence, language);
    }
    
    // Default: try to infer from evidence structure
    return this.inferVisualizationFromEvidence(evidence, language);
  }

  private isTimeSeriesQuery(query: string): boolean {
    const patterns = [
      'over time', 'trend', 'history', 'since', 'from', 'to',
      'growth', 'decline', 'change', 'evolution', 'trajectory',
      'عبر الزمن', 'اتجاه', 'تاريخ', 'منذ', 'نمو', 'تغير'
    ];
    return patterns.some(p => query.includes(p));
  }

  private isComparisonQuery(query: string): boolean {
    const patterns = [
      'compare', 'versus', 'vs', 'difference', 'between',
      'aden', 'sanaa', 'north', 'south', 'regime',
      'مقارنة', 'مقابل', 'فرق', 'بين', 'عدن', 'صنعاء'
    ];
    return patterns.some(p => query.includes(p));
  }

  private isTimelineQuery(query: string): boolean {
    const patterns = [
      'timeline', 'events', 'happened', 'when', 'sequence',
      'chronology', 'history of', 'what happened',
      'جدول زمني', 'أحداث', 'متى', 'تسلسل', 'تاريخ'
    ];
    return patterns.some(p => query.includes(p));
  }

  private isDistributionQuery(query: string): boolean {
    const patterns = [
      'breakdown', 'distribution', 'share', 'percentage',
      'composition', 'allocation', 'split',
      'توزيع', 'نسبة', 'حصة', 'تقسيم'
    ];
    return patterns.some(p => query.includes(p));
  }

  private generateTimeSeriesChart(
    evidence: any[],
    language: 'en' | 'ar'
  ): VisualInsight | null {
    // Extract time series data from evidence
    const timeSeriesData = this.extractTimeSeriesData(evidence);
    
    if (timeSeriesData.length < 2) {
      return null;
    }

    const config: ChartConfig = {
      type: 'line',
      title: 'Trend Analysis',
      titleAr: 'تحليل الاتجاه',
      data: timeSeriesData,
      xAxis: {
        label: 'Date',
        labelAr: 'التاريخ',
      },
      yAxis: {
        label: 'Value',
        labelAr: 'القيمة',
      },
      annotations: this.generateAnnotations(evidence, language),
      sources: this.extractSources(evidence),
      confidenceLevel: this.calculateConfidenceLevel(evidence),
    };

    return {
      type: 'chart',
      config,
      narrative: this.generateNarrative(config, 'en'),
      narrativeAr: this.generateNarrative(config, 'ar'),
      keyTakeaways: this.generateTakeaways(config, 'en'),
      keyTakeawaysAr: this.generateTakeaways(config, 'ar'),
    };
  }

  private generateComparisonChart(
    evidence: any[],
    language: 'en' | 'ar'
  ): VisualInsight | null {
    const comparisonData = this.extractComparisonData(evidence);
    
    if (comparisonData.length < 2) {
      return null;
    }

    const config: ChartConfig = {
      type: 'bar',
      title: 'Comparison Analysis',
      titleAr: 'تحليل مقارن',
      data: comparisonData,
      xAxis: {
        label: 'Category',
        labelAr: 'الفئة',
      },
      yAxis: {
        label: 'Value',
        labelAr: 'القيمة',
      },
      sources: this.extractSources(evidence),
      confidenceLevel: this.calculateConfidenceLevel(evidence),
    };

    return {
      type: 'chart',
      config,
      narrative: this.generateNarrative(config, 'en'),
      narrativeAr: this.generateNarrative(config, 'ar'),
      keyTakeaways: this.generateTakeaways(config, 'en'),
      keyTakeawaysAr: this.generateTakeaways(config, 'ar'),
    };
  }

  private generateTimelineVisualization(
    evidence: any[],
    language: 'en' | 'ar'
  ): VisualInsight | null {
    const events = this.extractEvents(evidence);
    
    if (events.length < 2) {
      return null;
    }

    const config: TimelineVisualization = {
      events,
      indicators: [],
      annotations: [],
    };

    return {
      type: 'timeline',
      config,
      narrative: language === 'en' 
        ? `Timeline showing ${events.length} key events`
        : `جدول زمني يظهر ${events.length} أحداث رئيسية`,
      narrativeAr: `جدول زمني يظهر ${events.length} أحداث رئيسية`,
      keyTakeaways: events.slice(0, 3).map(e => e.title),
      keyTakeawaysAr: events.slice(0, 3).map(e => e.titleAr),
    };
  }

  private generatePieChart(
    evidence: any[],
    language: 'en' | 'ar'
  ): VisualInsight | null {
    const distributionData = this.extractDistributionData(evidence);
    
    if (distributionData.length < 2) {
      return null;
    }

    const config: ChartConfig = {
      type: 'pie',
      title: 'Distribution Analysis',
      titleAr: 'تحليل التوزيع',
      data: distributionData,
      sources: this.extractSources(evidence),
      confidenceLevel: this.calculateConfidenceLevel(evidence),
    };

    return {
      type: 'chart',
      config,
      narrative: this.generateNarrative(config, 'en'),
      narrativeAr: this.generateNarrative(config, 'ar'),
      keyTakeaways: this.generateTakeaways(config, 'en'),
      keyTakeawaysAr: this.generateTakeaways(config, 'ar'),
    };
  }

  private inferVisualizationFromEvidence(
    evidence: any[],
    language: 'en' | 'ar'
  ): VisualInsight | null {
    // Check if evidence contains numeric data suitable for visualization
    const hasNumericData = evidence.some(e => 
      typeof e.value === 'number' || 
      (e.data && Array.isArray(e.data))
    );

    if (!hasNumericData) {
      return null;
    }

    // Default to bar chart for simple comparisons
    return this.generateComparisonChart(evidence, language);
  }

  private extractTimeSeriesData(evidence: any[]): ChartDataPoint[] {
    const dataPoints: ChartDataPoint[] = [];
    
    for (const item of evidence) {
      if (item.timeSeries && Array.isArray(item.timeSeries)) {
        for (const point of item.timeSeries) {
          dataPoints.push({
            x: point.date || point.period,
            y: point.value,
            label: point.label,
            labelAr: point.labelAr,
            regime: point.regime,
          });
        }
      } else if (item.date && item.value !== undefined) {
        dataPoints.push({
          x: item.date,
          y: item.value,
          label: item.label,
          labelAr: item.labelAr,
        });
      }
    }

    return dataPoints.sort((a, b) => {
      const dateA = new Date(a.x as string).getTime();
      const dateB = new Date(b.x as string).getTime();
      return dateA - dateB;
    });
  }

  private extractComparisonData(evidence: any[]): ChartDataPoint[] {
    const dataPoints: ChartDataPoint[] = [];
    
    for (const item of evidence) {
      if (item.category && item.value !== undefined) {
        dataPoints.push({
          x: item.category,
          y: item.value,
          label: item.label || item.category,
          labelAr: item.labelAr,
          regime: item.regime,
        });
      }
    }

    return dataPoints;
  }

  private extractDistributionData(evidence: any[]): ChartDataPoint[] {
    const dataPoints: ChartDataPoint[] = [];
    
    for (const item of evidence) {
      if (item.share !== undefined || item.percentage !== undefined) {
        dataPoints.push({
          x: item.category || item.name,
          y: item.share || item.percentage,
          label: item.label || item.name,
          labelAr: item.labelAr,
        });
      }
    }

    return dataPoints;
  }

  private extractEvents(evidence: any[]): TimelineEvent[] {
    const events: TimelineEvent[] = [];
    
    for (const item of evidence) {
      if (item.eventDate || item.date) {
        events.push({
          id: item.id || `event-${events.length}`,
          date: new Date(item.eventDate || item.date),
          title: item.title || item.name || 'Event',
          titleAr: item.titleAr || item.nameAr || 'حدث',
          description: item.description || '',
          descriptionAr: item.descriptionAr || '',
          category: item.category || 'general',
          impact: item.impact || 'medium',
          regime: item.regime,
        });
      }
    }

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private extractSources(evidence: any[]): string[] {
    const sources = new Set<string>();
    
    for (const item of evidence) {
      if (item.source) {
        sources.add(item.source);
      }
      if (item.sources && Array.isArray(item.sources)) {
        for (const s of item.sources) {
          sources.add(typeof s === 'string' ? s : s.name);
        }
      }
    }

    return Array.from(sources);
  }

  private calculateConfidenceLevel(evidence: any[]): 'A' | 'B' | 'C' | 'D' {
    if (evidence.length === 0) return 'D';
    
    const avgConfidence = evidence.reduce((sum, e) => {
      const conf = e.confidence || e.confidenceLevel || 0.5;
      return sum + (typeof conf === 'number' ? conf : 0.5);
    }, 0) / evidence.length;

    if (avgConfidence >= 0.9) return 'A';
    if (avgConfidence >= 0.7) return 'B';
    if (avgConfidence >= 0.5) return 'C';
    return 'D';
  }

  private generateAnnotations(
    evidence: any[],
    language: 'en' | 'ar'
  ): ChartAnnotation[] {
    const annotations: ChartAnnotation[] = [];
    
    // Look for significant events or thresholds in evidence
    for (const item of evidence) {
      if (item.significance === 'high' || item.isKeyEvent) {
        annotations.push({
          x: item.date || item.x,
          y: item.value || item.y,
          text: item.annotation || item.title || 'Key point',
          textAr: item.annotationAr || item.titleAr || 'نقطة رئيسية',
          type: 'event',
          importance: 'high',
        });
      }
    }

    return annotations;
  }

  private generateNarrative(config: ChartConfig, language: 'en' | 'ar'): string {
    const dataCount = config.data.length;
    
    if (language === 'ar') {
      switch (config.type) {
        case 'line':
          return `يعرض هذا الرسم البياني ${dataCount} نقطة بيانات توضح الاتجاه عبر الزمن.`;
        case 'bar':
          return `يقارن هذا الرسم البياني ${dataCount} فئات مختلفة.`;
        case 'pie':
          return `يوضح هذا الرسم البياني توزيع ${dataCount} عناصر.`;
        default:
          return `يعرض هذا التصور ${dataCount} نقطة بيانات.`;
      }
    }

    switch (config.type) {
      case 'line':
        return `This chart displays ${dataCount} data points showing the trend over time.`;
      case 'bar':
        return `This chart compares ${dataCount} different categories.`;
      case 'pie':
        return `This chart shows the distribution of ${dataCount} items.`;
      default:
        return `This visualization displays ${dataCount} data points.`;
    }
  }

  private generateTakeaways(config: ChartConfig, language: 'en' | 'ar'): string[] {
    const takeaways: string[] = [];
    
    if (config.data.length === 0) {
      return language === 'ar' 
        ? ['لا توجد بيانات كافية للتحليل']
        : ['Insufficient data for analysis'];
    }

    // Calculate basic statistics
    const values = config.data.map(d => d.y);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    if (language === 'ar') {
      takeaways.push(`أعلى قيمة: ${max.toLocaleString('ar-EG')}`);
      takeaways.push(`أدنى قيمة: ${min.toLocaleString('ar-EG')}`);
      takeaways.push(`المتوسط: ${avg.toLocaleString('ar-EG', { maximumFractionDigits: 2 })}`);
    } else {
      takeaways.push(`Highest value: ${max.toLocaleString()}`);
      takeaways.push(`Lowest value: ${min.toLocaleString()}`);
      takeaways.push(`Average: ${avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}`);
    }

    return takeaways;
  }
}

// Singleton instance
let visualIntelligenceInstance: VisualIntelligenceEngine | null = null;

export function getVisualIntelligence(): VisualIntelligenceEngine {
  if (!visualIntelligenceInstance) {
    visualIntelligenceInstance = new VisualIntelligenceEngine();
  }
  return visualIntelligenceInstance;
}
