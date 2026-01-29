/**
 * Macro Sector Agent Service
 * 
 * Self-running agent for the Macroeconomy & Growth sector:
 * - Nightly macro context pack build (2010→today)
 * - Daily macro signal digest (admin/VIP)
 * - Weekly macro brief (public + VIP versions)
 * - Macro alert triage and brief generation
 */

import { db } from "../db";
import {
  sectorAgentRuns,
  sectorContextPacks,
  sectorBriefs,
  sectorAlerts,
  timeSeries,
  dataUpdates,
  libraryDocuments,
  evidencePacks,
  economicEvents,
} from "../../drizzle/schema";
import { eq, and, desc, gte, lte, sql, inArray } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";
import { storagePut } from "../storage";

// ============================================================================
// TYPES
// ============================================================================

interface MacroContextPack {
  sectorCode: string;
  generatedAt: string;
  dateRange: { start: string; end: string };
  kpis: MacroKpi[];
  charts: MacroChartData[];
  recentUpdates: MacroUpdate[];
  contradictions: MacroContradiction[];
  gaps: MacroGap[];
  linkedEntities: LinkedEntity[];
  linkedDocuments: LinkedDocument[];
}

interface MacroKpi {
  code: string;
  titleEn: string;
  titleAr: string;
  value: number | null;
  unit: string;
  delta?: number;
  deltaPeriod?: string;
  lastUpdated: string;
  confidence: 'high' | 'medium' | 'low' | 'proxy';
  evidencePackId?: number;
  isProxy?: boolean;
  proxyLabel?: string;
  proxyLabelAr?: string;
  source: string;
}

interface MacroChartData {
  id: string;
  titleEn: string;
  titleAr: string;
  type: 'line' | 'bar' | 'area';
  data: Array<{ year: number; value: number | null; source?: string }>;
  unit: string;
  evidencePackId?: number;
}

interface MacroUpdate {
  id: number;
  title: string;
  titleAr: string;
  timestamp: string;
  source: string;
  sourceType: string;
  whyMatters: string;
  whyMattersAr: string;
  evidencePackId?: number;
}

interface MacroContradiction {
  indicatorCode: string;
  indicatorNameEn: string;
  indicatorNameAr: string;
  sources: Array<{
    name: string;
    value: number;
    date: string;
    evidencePackId?: number;
  }>;
  reason?: string;
  reasonAr?: string;
}

interface MacroGap {
  type: 'missing_data' | 'stale_data' | 'coverage_gap';
  indicatorCode?: string;
  description: string;
  descriptionAr: string;
  severity: 'critical' | 'warning' | 'info';
  ticketId?: number;
}

interface LinkedEntity {
  id: number;
  name: string;
  nameAr: string;
  type: string;
  relevance: string;
}

interface LinkedDocument {
  id: number;
  title: string;
  titleAr: string;
  publisher: string;
  date: string;
  relevance: string;
}

interface MacroBrief {
  type: 'daily_digest' | 'weekly_public' | 'weekly_vip';
  generatedAt: string;
  period: { start: string; end: string };
  summaryEn: string;
  summaryAr: string;
  keyFindings: Array<{
    titleEn: string;
    titleAr: string;
    descriptionEn: string;
    descriptionAr: string;
    evidencePackId?: number;
  }>;
  alerts: Array<{
    severity: 'critical' | 'warning' | 'info';
    titleEn: string;
    titleAr: string;
    descriptionEn: string;
    descriptionAr: string;
  }>;
  contradictions: MacroContradiction[];
  recommendations?: Array<{
    titleEn: string;
    titleAr: string;
    descriptionEn: string;
    descriptionAr: string;
  }>;
  s3Url?: string;
  s3UrlAr?: string;
}

// ============================================================================
// MACRO INDICATORS CONFIGURATION
// ============================================================================

const MACRO_INDICATORS = [
  { code: 'GDP_NOMINAL', titleEn: 'GDP (Nominal)', titleAr: 'الناتج المحلي الإجمالي (الاسمي)', unit: 'B USD', isCore: true },
  { code: 'GDP_GROWTH', titleEn: 'GDP Growth Rate', titleAr: 'معدل نمو الناتج المحلي', unit: '%', isCore: true },
  { code: 'GDP_PER_CAPITA', titleEn: 'GDP per Capita', titleAr: 'نصيب الفرد من الناتج', unit: 'USD', isCore: true },
  { code: 'INFLATION_CPI', titleEn: 'Inflation (CPI)', titleAr: 'التضخم (مؤشر أسعار المستهلك)', unit: '%', isCore: true },
  { code: 'NIGHTLIGHTS_INDEX', titleEn: 'Activity Proxy (Nightlights)', titleAr: 'مؤشر النشاط (الأضواء الليلية)', unit: 'index', isProxy: true },
  { code: 'MACRO_STRESS_INDEX', titleEn: 'Macro Stress Index', titleAr: 'مؤشر الضغط الكلي', unit: '/100', isProxy: true },
  { code: 'FISCAL_DEFICIT', titleEn: 'Fiscal Deficit', titleAr: 'العجز المالي', unit: '% GDP', isCore: true },
  { code: 'EXTERNAL_DEBT', titleEn: 'External Debt', titleAr: 'الدين الخارجي', unit: 'B USD', isCore: true },
];

// ============================================================================
// CONTEXT PACK BUILDER
// ============================================================================

/**
 * Build nightly macro context pack (2010→today)
 */
export async function buildMacroContextPack(asOfDate?: Date): Promise<MacroContextPack> {
  const now = asOfDate || new Date();
  const startYear = 2010;
  
  // Fetch macro indicators data
  const kpis = await fetchMacroKpis(now);
  
  // Fetch historical chart data
  const charts = await fetchMacroCharts(startYear, now.getFullYear());
  
  // Fetch recent updates (last 7 days)
  const recentUpdates = await fetchRecentMacroUpdates(7);
  
  // Detect contradictions
  const contradictions = await detectMacroContradictions();
  
  // Identify gaps
  const gaps = await identifyMacroGaps(kpis);
  
  // Fetch linked entities
  const linkedEntities = await fetchLinkedEntities();
  
  // Fetch linked documents
  const linkedDocuments = await fetchLinkedDocuments();
  
  const contextPack: MacroContextPack = {
    sectorCode: 'macro',
    generatedAt: now.toISOString(),
    dateRange: {
      start: `${startYear}-01-01`,
      end: now.toISOString().split('T')[0]
    },
    kpis,
    charts,
    recentUpdates,
    contradictions,
    gaps,
    linkedEntities,
    linkedDocuments
  };
  
  // Store context pack
  await storeContextPack(contextPack);
  
  return contextPack;
}

async function fetchMacroKpis(asOfDate: Date): Promise<MacroKpi[]> {
  const kpis: MacroKpi[] = [];
  
  for (const indicator of MACRO_INDICATORS) {
    try {
      // Fetch latest value from time_series
      const series = await db
        .select()
        .from(timeSeries)
        .where(eq(timeSeries.indicatorCode, indicator.code))
        .orderBy(desc(timeSeries.date))
        .limit(2);
      
      const latest = series[0];
      const previous = series[1];
      
      if (latest) {
        kpis.push({
          code: indicator.code,
          titleEn: indicator.titleEn,
          titleAr: indicator.titleAr,
          value: latest.value ? parseFloat(String(latest.value)) : null,
          unit: indicator.unit,
          delta: previous?.value && latest.value 
            ? ((parseFloat(String(latest.value)) - parseFloat(String(previous.value))) / parseFloat(String(previous.value))) * 100
            : undefined,
          deltaPeriod: previous?.date?.toString(),
          lastUpdated: latest.date?.toString() || new Date().toISOString(),
          confidence: indicator.isProxy ? 'proxy' : 'medium',
          isProxy: indicator.isProxy,
          proxyLabel: indicator.isProxy ? `Based on ${indicator.titleEn} methodology` : undefined,
          proxyLabelAr: indicator.isProxy ? `بناءً على منهجية ${indicator.titleAr}` : undefined,
          source: latest.sourceId?.toString() || 'Unknown'
        });
      } else {
        // No data available
        kpis.push({
          code: indicator.code,
          titleEn: indicator.titleEn,
          titleAr: indicator.titleAr,
          value: null,
          unit: indicator.unit,
          lastUpdated: new Date().toISOString(),
          confidence: 'low',
          isProxy: indicator.isProxy,
          source: 'Not available'
        });
      }
    } catch (error) {
      console.error(`Error fetching KPI ${indicator.code}:`, error);
    }
  }
  
  return kpis;
}

async function fetchMacroCharts(startYear: number, endYear: number): Promise<MacroChartData[]> {
  const charts: MacroChartData[] = [];
  
  const chartConfigs = [
    { code: 'GDP_NOMINAL', id: 'gdp_nominal', titleEn: 'GDP Nominal', titleAr: 'الناتج المحلي الإجمالي الاسمي', type: 'line' as const },
    { code: 'GDP_GROWTH', id: 'gdp_growth', titleEn: 'GDP Growth Rate', titleAr: 'معدل النمو', type: 'bar' as const },
    { code: 'NIGHTLIGHTS_INDEX', id: 'nightlights_proxy', titleEn: 'Nightlights vs GDP', titleAr: 'الأضواء الليلية مقابل الناتج', type: 'area' as const },
  ];
  
  for (const config of chartConfigs) {
    try {
      const series = await db
        .select()
        .from(timeSeries)
        .where(eq(timeSeries.indicatorCode, config.code))
        .orderBy(timeSeries.date);
      
      const data = series.map(s => ({
        year: new Date(s.date || '').getFullYear(),
        value: s.value ? parseFloat(String(s.value)) : null,
        source: s.sourceId?.toString()
      }));
      
      charts.push({
        id: config.id,
        titleEn: config.titleEn,
        titleAr: config.titleAr,
        type: config.type,
        data,
        unit: MACRO_INDICATORS.find(i => i.code === config.code)?.unit || ''
      });
    } catch (error) {
      console.error(`Error fetching chart ${config.code}:`, error);
    }
  }
  
  return charts;
}

async function fetchRecentMacroUpdates(days: number): Promise<MacroUpdate[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  try {
    const updates = await db
      .select()
      .from(dataUpdates)
      .where(
        and(
          gte(dataUpdates.detectedAt, cutoff),
          sql`JSON_CONTAINS(${dataUpdates.sectorTags}, '"macro"')`
        )
      )
      .orderBy(desc(dataUpdates.detectedAt))
      .limit(20);
    
    return updates.map(u => ({
      id: u.id,
      title: u.title || '',
      titleAr: u.titleAr || u.title || '',
      timestamp: u.detectedAt?.toISOString() || new Date().toISOString(),
      source: u.sourceName || 'Unknown',
      sourceType: u.sourceType || 'other',
      whyMatters: u.whyMatters || '',
      whyMattersAr: u.whyMattersAr || u.whyMatters || '',
      evidencePackId: u.evidencePackId || undefined
    }));
  } catch (error) {
    console.error('Error fetching recent updates:', error);
    return [];
  }
}

async function detectMacroContradictions(): Promise<MacroContradiction[]> {
  // This would query for indicators with multiple source values that differ significantly
  // For now, return empty array - would be implemented with actual contradiction detection logic
  return [];
}

async function identifyMacroGaps(kpis: MacroKpi[]): Promise<MacroGap[]> {
  const gaps: MacroGap[] = [];
  
  // Check for missing data
  for (const kpi of kpis) {
    if (kpi.value === null) {
      gaps.push({
        type: 'missing_data',
        indicatorCode: kpi.code,
        description: `No data available for ${kpi.titleEn}`,
        descriptionAr: `لا توجد بيانات متاحة لـ ${kpi.titleAr}`,
        severity: kpi.code.includes('GDP') ? 'critical' : 'warning'
      });
    }
    
    // Check for stale data (older than 6 months)
    const lastUpdated = new Date(kpi.lastUpdated);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    if (lastUpdated < sixMonthsAgo && kpi.value !== null) {
      gaps.push({
        type: 'stale_data',
        indicatorCode: kpi.code,
        description: `${kpi.titleEn} data is more than 6 months old`,
        descriptionAr: `بيانات ${kpi.titleAr} أقدم من 6 أشهر`,
        severity: 'warning'
      });
    }
  }
  
  return gaps;
}

async function fetchLinkedEntities(): Promise<LinkedEntity[]> {
  try {
    const entities = await db.query.entities.findMany({
      where: sql`JSON_CONTAINS(${db.query.entities.columns.sectorTags}, '"macro"')`,
      limit: 10
    });
    
    return entities.map((e: any) => ({
      id: e.id,
      name: e.name,
      nameAr: e.nameAr || e.name,
      type: e.entityType,
      relevance: 'Macro sector stakeholder'
    }));
  } catch (error) {
    console.error('Error fetching linked entities:', error);
    return [];
  }
}

async function fetchLinkedDocuments(): Promise<LinkedDocument[]> {
  try {
    const docs = await db
      .select()
      .from(libraryDocuments)
      .where(sql`JSON_CONTAINS(${libraryDocuments.sectors}, '"macro"')`)
      .orderBy(desc(libraryDocuments.publishedDate))
      .limit(10);
    
    return docs.map(d => ({
      id: d.id,
      title: d.title,
      titleAr: d.titleAr || d.title,
      publisher: d.publisher || 'Unknown',
      date: d.publishedDate?.toISOString() || '',
      relevance: 'Macro-relevant publication'
    }));
  } catch (error) {
    console.error('Error fetching linked documents:', error);
    return [];
  }
}

async function storeContextPack(pack: MacroContextPack): Promise<void> {
  try {
    const filename = `context_pack_sector_macro_${pack.generatedAt.split('T')[0]}.json`;
    const content = JSON.stringify(pack, null, 2);
    
    await storagePut(
      `context-packs/${filename}`,
      Buffer.from(content),
      'application/json'
    );
    
    // Also store in database
    await db.insert(sectorContextPacks).values({
      sectorCode: 'macro',
      generatedAt: new Date(pack.generatedAt),
      dateRangeStart: new Date(pack.dateRange.start),
      dateRangeEnd: new Date(pack.dateRange.end),
      packData: pack,
      status: 'active'
    });
  } catch (error) {
    console.error('Error storing context pack:', error);
  }
}

// ============================================================================
// DAILY DIGEST GENERATOR
// ============================================================================

/**
 * Generate daily macro signal digest
 */
export async function generateDailyDigest(): Promise<MacroBrief> {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Fetch today's updates
  const updates = await fetchRecentMacroUpdates(1);
  
  // Fetch active alerts
  const alerts = await fetchActiveAlerts();
  
  // Generate summary using LLM
  const summaryPrompt = `Generate a brief daily digest summary for Yemen's macroeconomic sector.

Today's updates:
${updates.map(u => `- ${u.title}: ${u.whyMatters}`).join('\n')}

Active alerts:
${alerts.map(a => `- [${a.severity}] ${a.titleEn}`).join('\n')}

Generate a 2-3 sentence summary in English, then the same in Arabic. Focus on what changed and why it matters.
Format: {"summaryEn": "...", "summaryAr": "..."}`;

  let summary = { summaryEn: '', summaryAr: '' };
  try {
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: 'You are an economic analyst specializing in Yemen. Generate concise, evidence-based summaries.' },
        { role: 'user', content: summaryPrompt }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'digest_summary',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              summaryEn: { type: 'string' },
              summaryAr: { type: 'string' }
            },
            required: ['summaryEn', 'summaryAr'],
            additionalProperties: false
          }
        }
      }
    });
    
    summary = JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Error generating digest summary:', error);
    summary = {
      summaryEn: `Daily macro digest for ${now.toDateString()}. ${updates.length} updates detected.`,
      summaryAr: `الملخص اليومي للاقتصاد الكلي ليوم ${now.toLocaleDateString('ar')}. تم اكتشاف ${updates.length} تحديثات.`
    };
  }
  
  const digest: MacroBrief = {
    type: 'daily_digest',
    generatedAt: now.toISOString(),
    period: {
      start: yesterday.toISOString(),
      end: now.toISOString()
    },
    summaryEn: summary.summaryEn,
    summaryAr: summary.summaryAr,
    keyFindings: updates.slice(0, 5).map(u => ({
      titleEn: u.title,
      titleAr: u.titleAr,
      descriptionEn: u.whyMatters,
      descriptionAr: u.whyMattersAr,
      evidencePackId: u.evidencePackId
    })),
    alerts: alerts.map(a => ({
      severity: a.severity,
      titleEn: a.titleEn,
      titleAr: a.titleAr,
      descriptionEn: a.descriptionEn,
      descriptionAr: a.descriptionAr
    })),
    contradictions: []
  };
  
  // Store digest
  await storeBrief(digest);
  
  return digest;
}

async function fetchActiveAlerts(): Promise<Array<{
  severity: 'critical' | 'warning' | 'info';
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
}>> {
  try {
    const alerts = await db
      .select()
      .from(sectorAlerts)
      .where(
        and(
          eq(sectorAlerts.sectorCode, 'macro'),
          eq(sectorAlerts.status, 'active')
        )
      )
      .orderBy(desc(sectorAlerts.triggeredAt))
      .limit(10);
    
    return alerts.map(a => ({
      severity: (a.severity as 'critical' | 'warning' | 'info') || 'info',
      titleEn: a.title || '',
      titleAr: a.titleAr || a.title || '',
      descriptionEn: a.description || '',
      descriptionAr: a.descriptionAr || a.description || ''
    }));
  } catch (error) {
    console.error('Error fetching active alerts:', error);
    return [];
  }
}

// ============================================================================
// WEEKLY BRIEF GENERATOR
// ============================================================================

/**
 * Generate weekly macro brief (public + VIP versions)
 */
export async function generateWeeklyBrief(isVip: boolean = false): Promise<MacroBrief> {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  // Build context pack for the week
  const contextPack = await buildMacroContextPack(now);
  
  // Generate brief content using LLM
  const briefPrompt = `Generate a ${isVip ? 'detailed VIP' : 'public'} weekly brief for Yemen's macroeconomic sector.

Context:
- Period: ${weekAgo.toDateString()} to ${now.toDateString()}
- Key KPIs: ${contextPack.kpis.map(k => `${k.titleEn}: ${k.value ?? 'N/A'} ${k.unit}`).join(', ')}
- Recent Updates: ${contextPack.recentUpdates.length}
- Contradictions: ${contextPack.contradictions.length}
- Data Gaps: ${contextPack.gaps.length}

Generate:
1. Executive summary (3-4 sentences for public, 5-6 for VIP)
2. Key findings (3 for public, 5 for VIP)
3. ${isVip ? 'Scenario analysis and recommendations' : 'What to watch next week'}

All content must be evidence-based. Include Arabic translations.
Format as JSON with summaryEn, summaryAr, keyFindings array, and recommendations array (VIP only).`;

  let briefContent: any = {};
  try {
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: 'You are a senior economic analyst. Generate evidence-based, bilingual economic briefs.' },
        { role: 'user', content: briefPrompt }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'weekly_brief',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              summaryEn: { type: 'string' },
              summaryAr: { type: 'string' },
              keyFindings: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    titleEn: { type: 'string' },
                    titleAr: { type: 'string' },
                    descriptionEn: { type: 'string' },
                    descriptionAr: { type: 'string' }
                  },
                  required: ['titleEn', 'titleAr', 'descriptionEn', 'descriptionAr'],
                  additionalProperties: false
                }
              },
              recommendations: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    titleEn: { type: 'string' },
                    titleAr: { type: 'string' },
                    descriptionEn: { type: 'string' },
                    descriptionAr: { type: 'string' }
                  },
                  required: ['titleEn', 'titleAr', 'descriptionEn', 'descriptionAr'],
                  additionalProperties: false
                }
              }
            },
            required: ['summaryEn', 'summaryAr', 'keyFindings', 'recommendations'],
            additionalProperties: false
          }
        }
      }
    });
    
    briefContent = JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Error generating weekly brief:', error);
    briefContent = {
      summaryEn: `Weekly macro brief for ${weekAgo.toDateString()} to ${now.toDateString()}.`,
      summaryAr: `الملخص الأسبوعي للاقتصاد الكلي من ${weekAgo.toLocaleDateString('ar')} إلى ${now.toLocaleDateString('ar')}.`,
      keyFindings: [],
      recommendations: []
    };
  }
  
  const brief: MacroBrief = {
    type: isVip ? 'weekly_vip' : 'weekly_public',
    generatedAt: now.toISOString(),
    period: {
      start: weekAgo.toISOString(),
      end: now.toISOString()
    },
    summaryEn: briefContent.summaryEn,
    summaryAr: briefContent.summaryAr,
    keyFindings: briefContent.keyFindings || [],
    alerts: await fetchActiveAlerts(),
    contradictions: contextPack.contradictions,
    recommendations: isVip ? briefContent.recommendations : undefined
  };
  
  // Store brief and generate PDF
  await storeBrief(brief);
  
  return brief;
}

async function storeBrief(brief: MacroBrief): Promise<void> {
  try {
    const filename = `macro_${brief.type}_${brief.generatedAt.split('T')[0]}`;
    
    // Store JSON
    await storagePut(
      `briefs/${filename}.json`,
      Buffer.from(JSON.stringify(brief, null, 2)),
      'application/json'
    );
    
    // Store in database
    await db.insert(sectorBriefs).values({
      sectorCode: 'macro',
      briefType: brief.type,
      generatedAt: new Date(brief.generatedAt),
      periodStart: new Date(brief.period.start),
      periodEnd: new Date(brief.period.end),
      summaryEn: brief.summaryEn,
      summaryAr: brief.summaryAr,
      briefData: brief,
      status: 'published'
    });
  } catch (error) {
    console.error('Error storing brief:', error);
  }
}

// ============================================================================
// ALERT TRIAGE
// ============================================================================

/**
 * Triage macro alerts and generate alert briefs
 */
export async function triageMacroAlerts(): Promise<void> {
  // Check freshness SLA breaches
  await checkFreshnessSLA();
  
  // Check for new contradictions
  await checkNewContradictions();
  
  // Check proxy divergence
  await checkProxyDivergence();
  
  // Check macro stress threshold
  await checkMacroStressThreshold();
}

async function checkFreshnessSLA(): Promise<void> {
  const slaThresholds: Record<string, number> = {
    GDP_NOMINAL: 365, // 1 year
    GDP_GROWTH: 365,
    INFLATION_CPI: 90, // 3 months
    NIGHTLIGHTS_INDEX: 30, // 1 month
  };
  
  for (const [code, maxDays] of Object.entries(slaThresholds)) {
    try {
      const latest = await db
        .select()
        .from(timeSeries)
        .where(eq(timeSeries.indicatorCode, code))
        .orderBy(desc(timeSeries.date))
        .limit(1);
      
      if (latest.length > 0) {
        const lastUpdate = new Date(latest[0].date || '');
        const daysSince = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSince > maxDays) {
          await createAlert({
            sectorCode: 'macro',
            alertType: 'freshness_sla_breach',
            severity: daysSince > maxDays * 1.5 ? 'critical' : 'warning',
            title: `${code} data is ${daysSince} days old (SLA: ${maxDays} days)`,
            titleAr: `بيانات ${code} عمرها ${daysSince} يوم (الحد: ${maxDays} يوم)`,
            indicatorCode: code
          });
        }
      }
    } catch (error) {
      console.error(`Error checking freshness SLA for ${code}:`, error);
    }
  }
}

async function checkNewContradictions(): Promise<void> {
  // Would implement contradiction detection logic
  // For now, placeholder
}

async function checkProxyDivergence(): Promise<void> {
  // Would compare nightlights proxy to official GDP
  // Alert if divergence exceeds threshold
}

async function checkMacroStressThreshold(): Promise<void> {
  // Would check if macro stress index exceeds threshold
  // Alert if above critical level
}

async function createAlert(alert: {
  sectorCode: string;
  alertType: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  titleAr: string;
  indicatorCode?: string;
}): Promise<void> {
  try {
    await db.insert(sectorAlerts).values({
      sectorCode: alert.sectorCode,
      alertType: alert.alertType,
      severity: alert.severity,
      title: alert.title,
      titleAr: alert.titleAr,
      indicatorCode: alert.indicatorCode,
      triggeredAt: new Date(),
      status: 'active'
    });
  } catch (error) {
    console.error('Error creating alert:', error);
  }
}

// ============================================================================
// AGENT RUN ORCHESTRATOR
// ============================================================================

/**
 * Run the macro sector agent (called by scheduler)
 */
export async function runMacroAgent(runType: 'nightly' | 'daily' | 'weekly'): Promise<{
  success: boolean;
  runId: number;
  outputs: string[];
}> {
  const startTime = new Date();
  const outputs: string[] = [];
  
  try {
    // Log run start
    const [run] = await db.insert(sectorAgentRuns).values({
      sectorCode: 'macro',
      runType,
      startedAt: startTime,
      status: 'running'
    }).returning();
    
    if (runType === 'nightly' || runType === 'daily') {
      // Build context pack
      const pack = await buildMacroContextPack();
      outputs.push(`context_pack_sector_macro_${pack.generatedAt.split('T')[0]}.json`);
      
      // Generate daily digest
      const digest = await generateDailyDigest();
      outputs.push(`macro_daily_digest_${digest.generatedAt.split('T')[0]}.json`);
      
      // Triage alerts
      await triageMacroAlerts();
    }
    
    if (runType === 'weekly') {
      // Generate public brief
      const publicBrief = await generateWeeklyBrief(false);
      outputs.push(`macro_weekly_public_${publicBrief.generatedAt.split('T')[0]}.json`);
      
      // Generate VIP brief
      const vipBrief = await generateWeeklyBrief(true);
      outputs.push(`macro_weekly_vip_${vipBrief.generatedAt.split('T')[0]}.json`);
    }
    
    // Update run status
    await db.update(sectorAgentRuns)
      .set({
        status: 'completed',
        completedAt: new Date(),
        outputFiles: outputs
      })
      .where(eq(sectorAgentRuns.id, run.id));
    
    return { success: true, runId: run.id, outputs };
  } catch (error) {
    console.error('Macro agent run failed:', error);
    return { success: false, runId: 0, outputs };
  }
}
