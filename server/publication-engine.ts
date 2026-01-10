/**
 * YETO Auto-Publication Engine
 * Automatically generates and publishes economic reports:
 * - Daily Economic Signals (exchange rates, prices)
 * - Weekly Market Monitor
 * - Monthly Macro Brief
 * - Quarterly Deep Dive
 * - Alert-triggered Special Reports
 */

import { invokeLLM } from "./_core/llm";
import { 
  detectAnomaly, 
  forecastTimeSeries, 
  analyzeRegimeDivergence,
  generateSmartInsights,
  type SmartInsight,
  type DataPoint
} from "./analytics-engine";

// Types
export interface PublicationConfig {
  id: string;
  type: "daily" | "weekly" | "monthly" | "quarterly" | "alert";
  name: string;
  nameAr: string;
  description: string;
  schedule?: string; // cron expression
  indicators: string[];
  template: string;
  enabled: boolean;
}

export interface GeneratedPublication {
  id: string;
  configId: string;
  type: PublicationConfig["type"];
  title: string;
  titleAr: string;
  summary: string;
  summaryAr: string;
  content: string;
  contentAr: string;
  highlights: Array<{
    indicator: string;
    value: number;
    change: number;
    trend: string;
  }>;
  charts: Array<{
    type: string;
    indicator: string;
    data: DataPoint[];
  }>;
  insights: SmartInsight[];
  generatedAt: string;
  periodStart: string;
  periodEnd: string;
  confidence: "A" | "B" | "C";
  status: "draft" | "review" | "published";
}

// Publication configurations
export const PUBLICATION_CONFIGS: PublicationConfig[] = [
  {
    id: "daily-signals",
    type: "daily",
    name: "Daily Economic Signals",
    nameAr: "الإشارات الاقتصادية اليومية",
    description: "Daily update on exchange rates, fuel prices, and market movements",
    schedule: "0 8 * * *", // 8 AM daily
    indicators: ["exchange_rate_aden", "exchange_rate_sanaa", "fuel_price", "food_price_index"],
    template: "daily-signals",
    enabled: true
  },
  {
    id: "weekly-monitor",
    type: "weekly",
    name: "Weekly Market Monitor",
    nameAr: "مراقب السوق الأسبوعي",
    description: "Weekly analysis of market trends and economic indicators",
    schedule: "0 9 * * 0", // 9 AM Sunday
    indicators: ["exchange_rate_aden", "exchange_rate_sanaa", "inflation", "remittances", "trade_balance"],
    template: "weekly-monitor",
    enabled: true
  },
  {
    id: "monthly-brief",
    type: "monthly",
    name: "Monthly Macro Brief",
    nameAr: "الموجز الاقتصادي الشهري",
    description: "Comprehensive monthly macroeconomic analysis",
    schedule: "0 10 1 * *", // 10 AM 1st of month
    indicators: ["gdp_growth", "inflation", "exchange_rate_aden", "foreign_reserves", "humanitarian_funding", "food_insecurity"],
    template: "monthly-brief",
    enabled: true
  },
  {
    id: "quarterly-deep-dive",
    type: "quarterly",
    name: "Quarterly Economic Deep Dive",
    nameAr: "التحليل الاقتصادي الفصلي المعمق",
    description: "In-depth quarterly analysis with forecasts and policy implications",
    schedule: "0 10 1 1,4,7,10 *", // 10 AM 1st of Jan, Apr, Jul, Oct
    indicators: ["gdp_growth", "inflation", "exchange_rate_aden", "exchange_rate_sanaa", "foreign_reserves", "trade_balance", "remittances", "humanitarian_funding", "food_insecurity", "unemployment"],
    template: "quarterly-deep-dive",
    enabled: true
  }
];

// Generate Daily Economic Signals
export async function generateDailySignals(
  indicatorData: Map<string, DataPoint[]>
): Promise<GeneratedPublication> {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const highlights: GeneratedPublication["highlights"] = [];
  const insights: SmartInsight[] = [];
  
  // Process each indicator
  indicatorData.forEach((data, indicator) => {
    if (data.length < 2) return;
    
    const latest = data[data.length - 1];
    const previous = data[data.length - 2];
    const change = previous.value !== 0 
      ? ((latest.value - previous.value) / previous.value) * 100 
      : 0;
    
    // Detect anomalies
    const anomaly = detectAnomaly(latest.value, data.slice(0, -1).map(d => d.value), indicator);
    
    let trend = "stable";
    if (change > 1) trend = "up";
    else if (change < -1) trend = "down";
    
    highlights.push({
      indicator,
      value: latest.value,
      change,
      trend
    });
    
    if (anomaly.isAnomaly) {
      insights.push({
        id: `daily-${indicator}-${Date.now()}`,
        type: "anomaly",
        priority: anomaly.severity === "critical" ? "critical" : "high",
        title: `${indicator} shows unusual movement`,
        titleAr: `${indicator} يظهر حركة غير عادية`,
        summary: anomaly.explanation,
        summaryAr: anomaly.explanation,
        indicator,
        value: latest.value,
        change,
        timestamp: now.toISOString(),
        confidence: "B",
        actionable: true
      });
    }
  });
  
  // Generate content using LLM
  const contentPrompt = `Generate a brief daily economic signals report for Yemen (2-3 paragraphs).
Key data points:
${highlights.map(h => `- ${h.indicator}: ${h.value.toLocaleString()} (${h.change > 0 ? '+' : ''}${h.change.toFixed(1)}% ${h.trend})`).join('\n')}

Focus on:
1. Exchange rate movements in Aden vs Sana'a
2. Any significant price changes
3. Market sentiment

Keep it professional and data-driven.`;

  let content = "";
  let contentAr = "";
  
  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a Yemen economic analyst writing daily market reports." },
        { role: "user", content: contentPrompt }
      ]
    });
    const responseContent = response.choices[0]?.message?.content;
    content = typeof responseContent === 'string' ? responseContent : "";
    
    // Generate Arabic version
    const arResponse = await invokeLLM({
      messages: [
        { role: "system", content: "You are a Yemen economic analyst. Translate and adapt the following report to Arabic, maintaining professional economic terminology." },
        { role: "user", content: content }
      ]
    });
    const arContent = arResponse.choices[0]?.message?.content;
    contentAr = typeof arContent === 'string' ? arContent : "";
  } catch (error) {
    console.error("LLM generation error:", error);
    content = `Daily Economic Signals for ${now.toDateString()}\n\n` +
      highlights.map(h => `${h.indicator}: ${h.value.toLocaleString()} (${h.change > 0 ? '+' : ''}${h.change.toFixed(1)}%)`).join('\n');
    contentAr = content;
  }
  
  return {
    id: `daily-signals-${now.toISOString().split('T')[0]}`,
    configId: "daily-signals",
    type: "daily",
    title: `Daily Economic Signals - ${now.toLocaleDateString()}`,
    titleAr: `الإشارات الاقتصادية اليومية - ${now.toLocaleDateString('ar-YE')}`,
    summary: `Key market movements for ${now.toLocaleDateString()}`,
    summaryAr: `حركات السوق الرئيسية ليوم ${now.toLocaleDateString('ar-YE')}`,
    content,
    contentAr,
    highlights,
    charts: [],
    insights,
    generatedAt: now.toISOString(),
    periodStart: yesterday.toISOString(),
    periodEnd: now.toISOString(),
    confidence: "B",
    status: "draft"
  };
}

// Generate Weekly Market Monitor
export async function generateWeeklyMonitor(
  indicatorData: Map<string, DataPoint[]>
): Promise<GeneratedPublication> {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const highlights: GeneratedPublication["highlights"] = [];
  const charts: GeneratedPublication["charts"] = [];
  
  // Process indicators
  indicatorData.forEach((data, indicator) => {
    const weekData = data.filter((d: DataPoint) => new Date(d.date) >= weekAgo);
    if (weekData.length < 2) return;
    
    const latest = weekData[weekData.length - 1];
    const weekStart = weekData[0];
    const change = weekStart.value !== 0 
      ? ((latest.value - weekStart.value) / weekStart.value) * 100 
      : 0;
    
    const forecast = forecastTimeSeries(data, 7);
    
    highlights.push({
      indicator,
      value: latest.value,
      change,
      trend: forecast.trend
    });
    
    charts.push({
      type: "line",
      indicator,
      data: weekData
    });
  });
  
  // Analyze regime divergence for exchange rates
  const adenData = indicatorData.get("exchange_rate_aden") || [];
  const sanaaData = indicatorData.get("exchange_rate_sanaa") || [];
  
  let divergenceAnalysis = "";
  if (adenData.length > 0 && sanaaData.length > 0) {
    const divergence = analyzeRegimeDivergence("Exchange Rate", adenData, sanaaData);
    divergenceAnalysis = `Exchange rate divergence: ${divergence.divergencePercent.toFixed(1)}% (${divergence.trend})`;
  }
  
  // Generate content
  const contentPrompt = `Generate a weekly market monitor report for Yemen (4-5 paragraphs).

Weekly highlights:
${highlights.map(h => `- ${h.indicator}: ${h.value.toLocaleString()} (${h.change > 0 ? '+' : ''}${h.change.toFixed(1)}% week-over-week, trend: ${h.trend})`).join('\n')}

${divergenceAnalysis}

Include:
1. Executive summary of the week
2. Exchange rate analysis (Aden vs Sana'a dynamics)
3. Price and inflation trends
4. Outlook for next week

Professional tone, data-driven analysis.`;

  let content = "";
  let contentAr = "";
  
  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a senior Yemen economic analyst writing weekly market reports." },
        { role: "user", content: contentPrompt }
      ]
    });
    const responseContent = response.choices[0]?.message?.content;
    content = typeof responseContent === 'string' ? responseContent : "";
    
    const arResponse = await invokeLLM({
      messages: [
        { role: "system", content: "Translate to Arabic maintaining economic terminology." },
        { role: "user", content: content }
      ]
    });
    const arContent = arResponse.choices[0]?.message?.content;
    contentAr = typeof arContent === 'string' ? arContent : "";
  } catch (error) {
    console.error("LLM generation error:", error);
    content = `Weekly Market Monitor - Week of ${weekAgo.toLocaleDateString()}\n\n` +
      highlights.map(h => `${h.indicator}: ${h.value.toLocaleString()}`).join('\n');
    contentAr = content;
  }
  
  // Generate insights
  const indicatorsList: Array<{name: string; nameAr: string; data: DataPoint[]}> = [];
  indicatorData.forEach((data, name) => {
    indicatorsList.push({ name, nameAr: name, data });
  });
  const insights = await generateSmartInsights(indicatorsList);
  
  return {
    id: `weekly-monitor-${now.toISOString().split('T')[0]}`,
    configId: "weekly-monitor",
    type: "weekly",
    title: `Weekly Market Monitor - Week of ${weekAgo.toLocaleDateString()}`,
    titleAr: `مراقب السوق الأسبوعي - أسبوع ${weekAgo.toLocaleDateString('ar-YE')}`,
    summary: `Market analysis for the week ending ${now.toLocaleDateString()}`,
    summaryAr: `تحليل السوق للأسبوع المنتهي في ${now.toLocaleDateString('ar-YE')}`,
    content,
    contentAr,
    highlights,
    charts,
    insights,
    generatedAt: now.toISOString(),
    periodStart: weekAgo.toISOString(),
    periodEnd: now.toISOString(),
    confidence: "B",
    status: "draft"
  };
}

// Generate Monthly Macro Brief
export async function generateMonthlyBrief(
  indicatorData: Map<string, DataPoint[]>
): Promise<GeneratedPublication> {
  const now = new Date();
  const monthAgo = new Date(now);
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  
  const highlights: GeneratedPublication["highlights"] = [];
  const charts: GeneratedPublication["charts"] = [];
  
  // Process all indicators
  indicatorData.forEach((data, indicator) => {
    const monthData = data.filter((d: DataPoint) => new Date(d.date) >= monthAgo);
    if (monthData.length < 2) return;
    
    const latest = monthData[monthData.length - 1];
    const monthStart = monthData[0];
    const change = monthStart.value !== 0 
      ? ((latest.value - monthStart.value) / monthStart.value) * 100 
      : 0;
    
    const forecast = forecastTimeSeries(data, 30);
    
    highlights.push({
      indicator,
      value: latest.value,
      change,
      trend: forecast.trend
    });
    
    charts.push({
      type: "line",
      indicator,
      data: monthData
    });
  });
  
  // Generate comprehensive content
  const contentPrompt = `Generate a comprehensive monthly macroeconomic brief for Yemen (6-8 paragraphs).

Monthly data:
${highlights.map(h => `- ${h.indicator}: ${h.value.toLocaleString()} (${h.change > 0 ? '+' : ''}${h.change.toFixed(1)}% MoM, trend: ${h.trend})`).join('\n')}

Structure:
1. Executive Summary (key takeaways)
2. Macroeconomic Overview (GDP, inflation)
3. Currency & Exchange Rate Analysis (dual system dynamics)
4. External Sector (trade, remittances, aid)
5. Humanitarian-Economic Nexus (food security, displacement)
6. Outlook & Risks

Professional, analytical tone with specific data references.`;

  let content = "";
  let contentAr = "";
  
  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a chief economist writing monthly macroeconomic briefs on Yemen." },
        { role: "user", content: contentPrompt }
      ]
    });
    const responseContent = response.choices[0]?.message?.content;
    content = typeof responseContent === 'string' ? responseContent : "";
    
    const arResponse = await invokeLLM({
      messages: [
        { role: "system", content: "Translate to formal Arabic maintaining economic and policy terminology." },
        { role: "user", content: content }
      ]
    });
    const arContent = arResponse.choices[0]?.message?.content;
    contentAr = typeof arContent === 'string' ? arContent : "";
  } catch (error) {
    console.error("LLM generation error:", error);
    content = `Monthly Macro Brief - ${monthAgo.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}\n\n` +
      highlights.map(h => `${h.indicator}: ${h.value.toLocaleString()}`).join('\n');
    contentAr = content;
  }
  
  const indicatorsList: Array<{name: string; nameAr: string; data: DataPoint[]}> = [];
  indicatorData.forEach((data, name) => {
    indicatorsList.push({ name, nameAr: name, data });
  });
  const insights = await generateSmartInsights(indicatorsList);
  
  return {
    id: `monthly-brief-${now.toISOString().slice(0, 7)}`,
    configId: "monthly-brief",
    type: "monthly",
    title: `Monthly Macro Brief - ${monthAgo.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
    titleAr: `الموجز الاقتصادي الشهري - ${monthAgo.toLocaleDateString('ar-YE', { month: 'long', year: 'numeric' })}`,
    summary: `Comprehensive macroeconomic analysis for ${monthAgo.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
    summaryAr: `تحليل اقتصادي شامل لشهر ${monthAgo.toLocaleDateString('ar-YE', { month: 'long', year: 'numeric' })}`,
    content,
    contentAr,
    highlights,
    charts,
    insights,
    generatedAt: now.toISOString(),
    periodStart: monthAgo.toISOString(),
    periodEnd: now.toISOString(),
    confidence: "A",
    status: "draft"
  };
}

// Generate Alert-Triggered Special Report
export async function generateAlertReport(
  trigger: SmartInsight,
  relatedData: Map<string, DataPoint[]>
): Promise<GeneratedPublication> {
  const now = new Date();
  
  const contentPrompt = `Generate a special alert report for Yemen economic observatory.

Alert: ${trigger.title}
Details: ${trigger.summary}
Indicator: ${trigger.indicator}
Current Value: ${trigger.value}
Change: ${trigger.change}%

Write a focused analysis (3-4 paragraphs) covering:
1. What happened and why it matters
2. Historical context
3. Potential implications
4. What to watch next

Urgent but professional tone.`;

  let content = "";
  let contentAr = "";
  
  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are an economic analyst writing urgent market alerts." },
        { role: "user", content: contentPrompt }
      ]
    });
    const responseContent = response.choices[0]?.message?.content;
    content = typeof responseContent === 'string' ? responseContent : "";
    
    const arResponse = await invokeLLM({
      messages: [
        { role: "system", content: "Translate to Arabic maintaining urgency and economic terminology." },
        { role: "user", content: content }
      ]
    });
    const arContent = arResponse.choices[0]?.message?.content;
    contentAr = typeof arContent === 'string' ? arContent : "";
  } catch (error) {
    console.error("LLM generation error:", error);
    content = `ALERT: ${trigger.title}\n\n${trigger.summary}`;
    contentAr = content;
  }
  
  return {
    id: `alert-${trigger.id}`,
    configId: "alert",
    type: "alert",
    title: `ALERT: ${trigger.title}`,
    titleAr: `تنبيه: ${trigger.titleAr}`,
    summary: trigger.summary,
    summaryAr: trigger.summaryAr,
    content,
    contentAr,
    highlights: [{
      indicator: trigger.indicator,
      value: trigger.value || 0,
      change: trigger.change || 0,
      trend: "alert"
    }],
    charts: [],
    insights: [trigger],
    generatedAt: now.toISOString(),
    periodStart: now.toISOString(),
    periodEnd: now.toISOString(),
    confidence: trigger.confidence === "D" ? "C" : trigger.confidence,
    status: "review"
  };
}

// Auto-Publication Engine Class
export class AutoPublicationEngine {
  private configs: PublicationConfig[];
  
  constructor(configs: PublicationConfig[] = PUBLICATION_CONFIGS) {
    this.configs = configs.filter(c => c.enabled);
    console.log(`[AutoPublicationEngine] Initialized with ${this.configs.length} publication configs`);
  }
  
  async generatePublication(
    configId: string,
    indicatorData: Map<string, DataPoint[]>
  ): Promise<GeneratedPublication | null> {
    const config = this.configs.find(c => c.id === configId);
    if (!config) {
      console.error(`[AutoPublicationEngine] Config not found: ${configId}`);
      return null;
    }
    
    switch (config.type) {
      case "daily":
        return generateDailySignals(indicatorData);
      case "weekly":
        return generateWeeklyMonitor(indicatorData);
      case "monthly":
        return generateMonthlyBrief(indicatorData);
      default:
        console.error(`[AutoPublicationEngine] Unknown publication type: ${config.type}`);
        return null;
    }
  }
  
  getConfigs(): PublicationConfig[] {
    return this.configs;
  }
  
  getConfig(id: string): PublicationConfig | undefined {
    return this.configs.find(c => c.id === id);
  }
}

export default AutoPublicationEngine;
