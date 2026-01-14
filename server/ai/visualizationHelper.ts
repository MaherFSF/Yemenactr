/**
 * YETO One Brain AI - Visualization Helper
 * Generates chart configurations and diagram specifications for AI responses
 */

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'radar' | 'heatmap' | 'sankey' | 'treemap';
  title: string;
  titleAr: string;
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      labelAr: string;
      data: number[];
      color?: string;
      borderColor?: string;
      backgroundColor?: string;
    }>;
  };
  options?: {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    scales?: Record<string, any>;
    plugins?: Record<string, any>;
  };
}

export interface DiagramConfig {
  type: 'flowchart' | 'timeline' | 'comparison' | 'hierarchy' | 'process';
  title: string;
  titleAr: string;
  nodes: Array<{
    id: string;
    label: string;
    labelAr: string;
    type?: 'start' | 'end' | 'process' | 'decision' | 'data';
    color?: string;
  }>;
  edges: Array<{
    from: string;
    to: string;
    label?: string;
    labelAr?: string;
  }>;
}

export interface TableConfig {
  title: string;
  titleAr: string;
  headers: Array<{
    key: string;
    label: string;
    labelAr: string;
    align?: 'left' | 'center' | 'right';
  }>;
  rows: Array<Record<string, string | number>>;
  footer?: Array<Record<string, string | number>>;
}

/**
 * Generate a time series chart configuration
 */
export function generateTimeSeriesChart(
  title: string,
  titleAr: string,
  data: Array<{ date: string; value: number; series?: string }>,
  options?: { showTrend?: boolean; compareRegimes?: boolean }
): ChartConfig {
  const uniqueDates = Array.from(new Set(data.map(d => d.date))).sort();
  const uniqueSeries = Array.from(new Set(data.map(d => d.series || 'default')));

  const datasets = uniqueSeries.map((series, idx) => {
    const seriesData = data.filter(d => (d.series || 'default') === series);
    const colors = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];
    
    return {
      label: series,
      labelAr: series,
      data: uniqueDates.map(date => {
        const point = seriesData.find(d => d.date === date);
        return point?.value || 0;
      }),
      borderColor: colors[idx % colors.length],
      backgroundColor: colors[idx % colors.length] + '20',
    };
  });

  return {
    type: 'line',
    title,
    titleAr,
    data: {
      labels: uniqueDates,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: title },
      },
    },
  };
}

/**
 * Generate a comparison chart between regimes
 */
export function generateRegimeComparisonChart(
  title: string,
  titleAr: string,
  indicators: Array<{
    name: string;
    nameAr: string;
    adenValue: number;
    sanaaValue: number;
    unit?: string;
  }>
): ChartConfig {
  return {
    type: 'bar',
    title,
    titleAr,
    data: {
      labels: indicators.map(i => i.name),
      datasets: [
        {
          label: 'Aden (IRG)',
          labelAr: 'عدن (الشرعية)',
          data: indicators.map(i => i.adenValue),
          backgroundColor: '#3b82f6',
        },
        {
          label: "Sana'a (DFA)",
          labelAr: 'صنعاء (الأمر الواقع)',
          data: indicators.map(i => i.sanaaValue),
          backgroundColor: '#ef4444',
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
      },
      scales: {
        y: { beginAtZero: true },
      },
    },
  };
}

/**
 * Generate a funding flow sankey diagram
 */
export function generateFundingFlowDiagram(
  title: string,
  titleAr: string,
  flows: Array<{
    source: string;
    target: string;
    value: number;
  }>
): DiagramConfig {
  const uniqueNodes = Array.from(new Set([
    ...flows.map(f => f.source),
    ...flows.map(f => f.target),
  ]));

  return {
    type: 'flowchart',
    title,
    titleAr,
    nodes: uniqueNodes.map(node => ({
      id: node,
      label: node,
      labelAr: node,
      type: 'process',
    })),
    edges: flows.map(f => ({
      from: f.source,
      to: f.target,
      label: `$${(f.value / 1000000).toFixed(1)}M`,
      labelAr: `$${(f.value / 1000000).toFixed(1)}M`,
    })),
  };
}

/**
 * Generate a comparison table
 */
export function generateComparisonTable(
  title: string,
  titleAr: string,
  items: Array<{
    indicator: string;
    indicatorAr: string;
    adenValue: string;
    sanaaValue: string;
    source?: string;
    confidence?: 'A' | 'B' | 'C' | 'D';
  }>
): TableConfig {
  return {
    title,
    titleAr,
    headers: [
      { key: 'indicator', label: 'Indicator', labelAr: 'المؤشر', align: 'left' },
      { key: 'aden', label: 'Aden (IRG)', labelAr: 'عدن (الشرعية)', align: 'center' },
      { key: 'sanaa', label: "Sana'a (DFA)", labelAr: 'صنعاء (الأمر الواقع)', align: 'center' },
      { key: 'confidence', label: 'Confidence', labelAr: 'الثقة', align: 'center' },
    ],
    rows: items.map(item => ({
      indicator: item.indicator,
      aden: item.adenValue,
      sanaa: item.sanaaValue,
      confidence: item.confidence || 'B',
    })),
  };
}

/**
 * Generate an economic timeline diagram
 */
export function generateTimelineDiagram(
  title: string,
  titleAr: string,
  events: Array<{
    date: string;
    title: string;
    titleAr: string;
    description?: string;
    descriptionAr?: string;
    type?: 'positive' | 'negative' | 'neutral';
  }>
): DiagramConfig {
  const sortedEvents = events.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return {
    type: 'timeline',
    title,
    titleAr,
    nodes: sortedEvents.map((event, idx) => ({
      id: `event_${idx}`,
      label: `${event.date}: ${event.title}`,
      labelAr: `${event.date}: ${event.titleAr}`,
      type: event.type === 'positive' ? 'data' : event.type === 'negative' ? 'decision' : 'process',
      color: event.type === 'positive' ? '#22c55e' : event.type === 'negative' ? '#ef4444' : '#6b7280',
    })),
    edges: sortedEvents.slice(0, -1).map((_, idx) => ({
      from: `event_${idx}`,
      to: `event_${idx + 1}`,
    })),
  };
}

/**
 * Detect if a query would benefit from visualization
 */
export function shouldGenerateVisualization(query: string): {
  shouldVisualize: boolean;
  suggestedType: 'chart' | 'table' | 'diagram' | 'none';
  reason: string;
} {
  const lowerQuery = query.toLowerCase();

  // Chart triggers
  if (
    lowerQuery.includes('trend') ||
    lowerQuery.includes('over time') ||
    lowerQuery.includes('historical') ||
    lowerQuery.includes('اتجاه') ||
    lowerQuery.includes('تاريخ')
  ) {
    return { shouldVisualize: true, suggestedType: 'chart', reason: 'Time series data detected' };
  }

  // Table triggers
  if (
    lowerQuery.includes('compare') ||
    lowerQuery.includes('comparison') ||
    lowerQuery.includes('vs') ||
    lowerQuery.includes('مقارنة') ||
    lowerQuery.includes('بين')
  ) {
    return { shouldVisualize: true, suggestedType: 'table', reason: 'Comparison data detected' };
  }

  // Diagram triggers
  if (
    lowerQuery.includes('flow') ||
    lowerQuery.includes('process') ||
    lowerQuery.includes('timeline') ||
    lowerQuery.includes('تدفق') ||
    lowerQuery.includes('جدول زمني')
  ) {
    return { shouldVisualize: true, suggestedType: 'diagram', reason: 'Flow or process data detected' };
  }

  return { shouldVisualize: false, suggestedType: 'none', reason: 'No visualization needed' };
}

export default {
  generateTimeSeriesChart,
  generateRegimeComparisonChart,
  generateFundingFlowDiagram,
  generateComparisonTable,
  generateTimelineDiagram,
  shouldGenerateVisualization,
};
