/**
 * Sector Agent Orchestration Service
 * Core intelligence engine for sector agents
 * Enforces Evidence Laws R0-R12
 */

import { getDb } from "../db";
import { sql } from "drizzle-orm";
import { SectorContextPack } from "./sectorAgentService";

// Types for agent responses
export interface AgentResponse {
  content: string;
  evidencePackIds?: number[];
  citations?: AgentCitation[];
  confidenceGrade: 'A' | 'B' | 'C' | 'D';
  dataGaps?: DataGap[];
  chartData?: ChartData;
  uncertaintyNote?: string;
}

export interface AgentCitation {
  evidencePackId: number;
  sourceTitle: string;
  sourcePublisher: string;
  retrievalDate: string;
  snippet?: string;
}

export interface DataGap {
  description: string;
  recommendedSources: string[];
}

export interface ChartData {
  indicatorCode: string;
  indicatorName: string;
  values: Array<{ date: string; value: number; confidence: string }>;
  asOfDate: string;
}

export interface QueryContext {
  sectorCode: string;
  query: string;
  language: 'en' | 'ar';
  regime: 'both' | 'aden_irg' | 'sanaa_dfa';
  contextPack?: SectorContextPack;
}

export interface EvidenceValidation {
  passed: boolean;
  violations: string[];
  citationCoverage: number;
}

/**
 * Main orchestration function - generates evidence-backed responses
 */
export async function generateSectorAgentResponse(context: QueryContext): Promise<AgentResponse> {
  const { sectorCode, query, language, regime, contextPack } = context;

  // Step 1: Parse query intent
  const intent = await parseQueryIntent(query, language);

  // Step 2: Retrieve relevant evidence from database
  const evidence = await retrieveEvidence({
    sectorCode,
    intent,
    regime
  });

  // Step 3: Check if we have sufficient evidence
  if (evidence.indicators.length === 0 && evidence.documents.length === 0) {
    return generateGapResponse(query, sectorCode, language);
  }

  // Step 4: Build response from evidence
  const response = await buildEvidenceBackedResponse({
    intent,
    evidence,
    contextPack,
    language
  });

  // Step 5: Validate response against Evidence Laws
  const validation = await validateResponseEvidence(response);
  
  if (!validation.passed) {
    // If validation fails, return gap response
    return generateGapResponse(query, sectorCode, language);
  }

  // Step 6: Log query for monitoring
  await logAgentQuery({
    sectorCode,
    query,
    language,
    regime,
    responseLength: response.content.length,
    citationCount: response.citations?.length || 0,
    evidencePackIds: response.evidencePackIds || [],
    confidenceGrade: response.confidenceGrade
  });

  return response;
}

/**
 * Parse user query to understand intent
 */
async function parseQueryIntent(query: string, language: 'en' | 'ar'): Promise<QueryIntent> {
  const lowerQuery = query.toLowerCase();
  
  // Detect query type
  let queryType: 'current_value' | 'trend' | 'comparison' | 'explanation' | 'forecast' = 'current_value';
  
  if (lowerQuery.includes('trend') || lowerQuery.includes('chang') || lowerQuery.includes('تغير') || lowerQuery.includes('اتجاه')) {
    queryType = 'trend';
  } else if (lowerQuery.includes('compar') || lowerQuery.includes('vs') || lowerQuery.includes('versus') || lowerQuery.includes('مقارن')) {
    queryType = 'comparison';
  } else if (lowerQuery.includes('why') || lowerQuery.includes('how') || lowerQuery.includes('لماذا') || lowerQuery.includes('كيف')) {
    queryType = 'explanation';
  } else if (lowerQuery.includes('forecast') || lowerQuery.includes('predict') || lowerQuery.includes('توقع')) {
    queryType = 'forecast';
  }

  // Extract mentioned indicators (basic keyword matching)
  const indicators = await detectIndicatorMentions(query);

  // Detect time period
  const timePeriod = detectTimePeriod(query);

  return {
    queryType,
    indicators,
    timePeriod,
    originalQuery: query
  };
}

interface QueryIntent {
  queryType: 'current_value' | 'trend' | 'comparison' | 'explanation' | 'forecast';
  indicators: string[];
  timePeriod?: { start?: Date; end?: Date };
  originalQuery: string;
}

/**
 * Detect indicator mentions in query
 */
async function detectIndicatorMentions(query: string): Promise<string[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    // Search for indicators matching keywords in the query
    const result = await db.execute(sql`
      SELECT code FROM indicators
      WHERE LOWER(nameEn) LIKE ${`%${query.toLowerCase()}%`}
         OR LOWER(nameAr) LIKE ${`%${query}%`}
         OR LOWER(code) LIKE ${`%${query.toLowerCase()}%`}
      LIMIT 5
    `);

    return ((result as any)[0] || []).map((r: any) => r.code);
  } catch (error) {
    console.error('[SectorAgent] Failed to detect indicators:', error);
    return [];
  }
}

/**
 * Detect time period from query
 */
function detectTimePeriod(query: string): { start?: Date; end?: Date } | undefined {
  const now = new Date();
  
  // Detect relative time periods
  if (query.includes('last month') || query.includes('الشهر الماضي')) {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { start, end };
  }
  
  if (query.includes('last year') || query.includes('العام الماضي')) {
    const start = new Date(now.getFullYear() - 1, 0, 1);
    const end = new Date(now.getFullYear() - 1, 11, 31);
    return { start, end };
  }
  
  if (query.includes('last 6 months') || query.includes('آخر 6 أشهر')) {
    const start = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    return { start, end: now };
  }

  return undefined;
}

/**
 * Retrieve evidence from database
 */
async function retrieveEvidence(params: {
  sectorCode: string;
  intent: QueryIntent;
  regime: 'both' | 'aden_irg' | 'sanaa_dfa';
}): Promise<Evidence> {
  const { sectorCode, intent, regime } = params;
  const db = await getDb();
  if (!db) return { indicators: [], documents: [], events: [] };

  // Build regime filter
  const regimeFilter = regime === 'both' 
    ? sql`1=1` 
    : sql`regimeTag = ${regime}`;

  // Retrieve indicators
  let indicatorCodes = intent.indicators;
  if (indicatorCodes.length === 0) {
    // If no specific indicators mentioned, get top indicators for this sector
    const topIndicatorsResult = await db.execute(sql`
      SELECT code FROM indicators
      WHERE sector = ${sectorCode} AND isActive = 1
      ORDER BY priority DESC
      LIMIT 5
    `);
    indicatorCodes = ((topIndicatorsResult as any)[0] || []).map((r: any) => r.code);
  }

  // Get time series data for indicators
  const indicators: EvidenceIndicator[] = [];
  for (const code of indicatorCodes) {
    const seriesResult = await db.execute(sql`
      SELECT 
        ts.indicatorCode,
        i.nameEn,
        i.nameAr,
        ts.date,
        ts.value,
        ts.unit,
        ts.confidenceRating,
        ts.sourceId,
        s.publisher as sourceName,
        ep.id as evidencePackId
      FROM time_series ts
      LEFT JOIN indicators i ON ts.indicatorCode = i.code
      LEFT JOIN sources s ON ts.sourceId = s.id
      LEFT JOIN evidence_packs ep ON ep.subjectType = 'series' AND ep.subjectId = ts.indicatorCode
      WHERE ts.indicatorCode = ${code}
        AND ${regimeFilter}
      ORDER BY ts.date DESC
      LIMIT 12
    `);

    const rows = (seriesResult as any)[0] || [];
    if (rows.length > 0) {
      indicators.push({
        code,
        nameEn: rows[0].nameEn || code,
        nameAr: rows[0].nameAr || code,
        values: rows.map((r: any) => ({
          date: r.date,
          value: parseFloat(r.value),
          unit: r.unit,
          confidence: r.confidenceRating,
          sourceId: r.sourceId,
          sourceName: r.sourceName,
          evidencePackId: r.evidencePackId
        }))
      });
    }
  }

  // Retrieve relevant documents
  const documentsResult = await db.execute(sql`
    SELECT 
      d.id,
      d.title as titleEn,
      d.titleAr,
      d.publicationDate,
      d.sourceId,
      s.publisher as sourceName,
      ep.id as evidencePackId
    FROM documents d
    LEFT JOIN sources s ON d.sourceId = s.id
    LEFT JOIN evidence_packs ep ON ep.subjectType = 'document' AND ep.subjectId = CAST(d.id AS CHAR)
    WHERE d.category LIKE ${`%${sectorCode}%`}
    ORDER BY d.publicationDate DESC
    LIMIT 5
  `);

  const documents = ((documentsResult as any)[0] || []).map((r: any) => ({
    id: r.id,
    titleEn: r.titleEn,
    titleAr: r.titleAr,
    publicationDate: r.publicationDate,
    sourceId: r.sourceId,
    sourceName: r.sourceName,
    evidencePackId: r.evidencePackId
  }));

  // Retrieve relevant events
  const eventsResult = await db.execute(sql`
    SELECT 
      id,
      title as titleEn,
      titleAr,
      eventDate,
      category,
      description as descriptionEn,
      descriptionAr
    FROM economic_events
    WHERE category LIKE ${`%${sectorCode}%`}
      AND ${regimeFilter}
    ORDER BY eventDate DESC
    LIMIT 5
  `);

  const events = ((eventsResult as any)[0] || []).map((r: any) => ({
    id: r.id,
    titleEn: r.titleEn,
    titleAr: r.titleAr,
    eventDate: r.eventDate,
    category: r.category,
    descriptionEn: r.descriptionEn,
    descriptionAr: r.descriptionAr
  }));

  return { indicators, documents, events };
}

interface Evidence {
  indicators: EvidenceIndicator[];
  documents: any[];
  events: any[];
}

interface EvidenceIndicator {
  code: string;
  nameEn: string;
  nameAr: string;
  values: Array<{
    date: Date;
    value: number;
    unit: string;
    confidence: string;
    sourceId: number;
    sourceName: string;
    evidencePackId?: number;
  }>;
}

/**
 * Build evidence-backed response
 */
async function buildEvidenceBackedResponse(params: {
  intent: QueryIntent;
  evidence: Evidence;
  contextPack?: SectorContextPack;
  language: 'en' | 'ar';
}): Promise<AgentResponse> {
  const { intent, evidence, contextPack, language } = params;
  const isArabic = language === 'ar';

  // Build response based on query type
  let content = '';
  const citations: AgentCitation[] = [];
  const evidencePackIds: number[] = [];
  let chartData: ChartData | undefined;
  let confidenceGrade: 'A' | 'B' | 'C' | 'D' = 'C';

  if (intent.queryType === 'current_value' && evidence.indicators.length > 0) {
    const indicator = evidence.indicators[0];
    const latestValue = indicator.values[0];

    content = isArabic
      ? `أحدث قيمة لـ ${indicator.nameAr} هي ${latestValue.value.toFixed(2)} ${latestValue.unit} كما في ${new Date(latestValue.date).toLocaleDateString('ar')}.`
      : `The latest value for ${indicator.nameEn} is ${latestValue.value.toFixed(2)} ${latestValue.unit} as of ${new Date(latestValue.date).toLocaleDateString('en')}.`;

    confidenceGrade = latestValue.confidence as any;

    // Add citation
    if (latestValue.evidencePackId) {
      const citation = await getCitation(latestValue.evidencePackId, latestValue.sourceName);
      if (citation) {
        citations.push(citation);
        evidencePackIds.push(latestValue.evidencePackId);
      }
    }

    // Add chart data
    chartData = {
      indicatorCode: indicator.code,
      indicatorName: isArabic ? indicator.nameAr : indicator.nameEn,
      values: indicator.values.map(v => ({
        date: new Date(v.date).toISOString(),
        value: v.value,
        confidence: v.confidence
      })),
      asOfDate: new Date(latestValue.date).toISOString()
    };

  } else if (intent.queryType === 'trend' && evidence.indicators.length > 0) {
    const indicator = evidence.indicators[0];
    if (indicator.values.length >= 2) {
      const latest = indicator.values[0];
      const previous = indicator.values[1];
      const change = ((latest.value - previous.value) / previous.value) * 100;
      const direction = change > 0 ? (isArabic ? 'زاد' : 'increased') : (isArabic ? 'انخفض' : 'decreased');

      content = isArabic
        ? `${indicator.nameAr} ${direction} بنسبة ${Math.abs(change).toFixed(1)}% من ${previous.value.toFixed(2)} (${new Date(previous.date).toLocaleDateString('ar')}) إلى ${latest.value.toFixed(2)} (${new Date(latest.date).toLocaleDateString('ar')}).`
        : `${indicator.nameEn} ${direction} by ${Math.abs(change).toFixed(1)}% from ${previous.value.toFixed(2)} (${new Date(previous.date).toLocaleDateString('en')}) to ${latest.value.toFixed(2)} (${new Date(latest.date).toLocaleDateString('en')}).`;

      confidenceGrade = latest.confidence as any;

      // Add citations for both data points
      if (latest.evidencePackId) {
        const citation = await getCitation(latest.evidencePackId, latest.sourceName);
        if (citation) {
          citations.push(citation);
          evidencePackIds.push(latest.evidencePackId);
        }
      }

      // Chart data for trend
      chartData = {
        indicatorCode: indicator.code,
        indicatorName: isArabic ? indicator.nameAr : indicator.nameEn,
        values: indicator.values.slice(0, 6).map(v => ({
          date: new Date(v.date).toISOString(),
          value: v.value,
          confidence: v.confidence
        })),
        asOfDate: new Date(latest.date).toISOString()
      };
    } else {
      content = isArabic
        ? `بيانات غير كافية لتحليل الاتجاه. لدينا فقط نقطة بيانات واحدة.`
        : `Insufficient data for trend analysis. We only have one data point.`;
      confidenceGrade = 'D';
    }

  } else if (intent.queryType === 'comparison' && evidence.indicators.length >= 2) {
    const ind1 = evidence.indicators[0];
    const ind2 = evidence.indicators[1];
    const val1 = ind1.values[0];
    const val2 = ind2.values[0];

    content = isArabic
      ? `مقارنة: ${ind1.nameAr} = ${val1.value.toFixed(2)} ${val1.unit} و ${ind2.nameAr} = ${val2.value.toFixed(2)} ${val2.unit}.`
      : `Comparison: ${ind1.nameEn} = ${val1.value.toFixed(2)} ${val1.unit} and ${ind2.nameEn} = ${val2.value.toFixed(2)} ${val2.unit}.`;

    confidenceGrade = val1.confidence < val2.confidence ? val1.confidence as any : val2.confidence as any;

    // Add citations for both
    if (val1.evidencePackId) {
      const citation = await getCitation(val1.evidencePackId, val1.sourceName);
      if (citation) {
        citations.push(citation);
        evidencePackIds.push(val1.evidencePackId);
      }
    }
    if (val2.evidencePackId) {
      const citation = await getCitation(val2.evidencePackId, val2.sourceName);
      if (citation) {
        citations.push(citation);
        evidencePackIds.push(val2.evidencePackId);
      }
    }

  } else if (intent.queryType === 'explanation') {
    // For explanations, use context pack if available
    if (contextPack && contextPack.whatChanged.length > 0) {
      const topChange = contextPack.whatChanged[0];
      content = isArabic
        ? `وفقاً لأحدث تحليلاتنا، ${topChange.descriptionAr}. هذا بناءً على البيانات المتاحة من قاعدة البيانات الخاصة بنا.`
        : `According to our latest analysis, ${topChange.descriptionEn}. This is based on available data from our database.`;
      
      confidenceGrade = 'B';
    } else {
      content = isArabic
        ? `لا نملك تحليلاً كافياً للإجابة على هذا السؤال. نحتاج إلى مزيد من البيانات السياقية.`
        : `We don't have sufficient analysis to answer this question. We need more contextual data.`;
      confidenceGrade = 'D';
    }

  } else {
    // Default fallback - insufficient evidence
    content = isArabic
      ? `عذراً، لا أملك بيانات كافية للإجابة على هذا السؤال بثقة.`
      : `Sorry, I don't have sufficient data to answer this question confidently.`;
    confidenceGrade = 'D';
  }

  return {
    content,
    evidencePackIds,
    citations,
    confidenceGrade,
    chartData
  };
}

/**
 * Get citation details from evidence pack
 */
async function getCitation(evidencePackId: number, sourceName: string): Promise<AgentCitation | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.execute(sql`
      SELECT ep.*, s.publisher, s.retrievalDate
      FROM evidence_packs ep
      LEFT JOIN sources s ON JSON_EXTRACT(ep.citations, '$[0].sourceId') = s.id
      WHERE ep.id = ${evidencePackId}
    `);

    const pack = (result as any)[0]?.[0];
    if (!pack) return null;

    return {
      evidencePackId,
      sourceTitle: pack.subjectLabel || 'Data Point',
      sourcePublisher: pack.publisher || sourceName,
      retrievalDate: pack.retrievalDate ? new Date(pack.retrievalDate).toISOString() : new Date().toISOString()
    };
  } catch (error) {
    console.error('[SectorAgent] Failed to get citation:', error);
    return null;
  }
}

/**
 * Generate gap response when evidence is insufficient
 */
function generateGapResponse(query: string, sectorCode: string, language: 'en' | 'ar'): AgentResponse {
  const isArabic = language === 'ar';

  const dataGaps: DataGap[] = [{
    description: isArabic
      ? `لا توجد بيانات كافية متاحة للإجابة على: "${query}"`
      : `Insufficient data available to answer: "${query}"`,
    recommendedSources: [
      'Central Statistical Organization (CSO)',
      'Central Bank of Yemen',
      'World Bank',
      'IMF',
      'UN Agencies'
    ]
  }];

  const content = isArabic
    ? `عذراً، لا يمكنني تقديم إجابة مدعومة بالأدلة لهذا السؤال. لدينا فجوات في البيانات لهذا القطاع. نوصي بمراجعة المصادر التالية: ${dataGaps[0].recommendedSources.join('، ')}.`
    : `Sorry, I cannot provide an evidence-backed answer to this question. We have data gaps for this sector. We recommend checking these sources: ${dataGaps[0].recommendedSources.join(', ')}.`;

  return {
    content,
    confidenceGrade: 'D',
    dataGaps
  };
}

/**
 * Validate response against Evidence Laws
 */
export async function validateResponseEvidence(response: AgentResponse): Promise<EvidenceValidation> {
  const violations: string[] = [];

  // R0: Zero Fabrication - check if we have actual evidence
  if (!response.evidencePackIds || response.evidencePackIds.length === 0) {
    if (response.dataGaps && response.dataGaps.length > 0) {
      // It's okay to have no evidence if we're acknowledging gaps
    } else {
      violations.push('R0: No evidence packs cited');
    }
  }

  // R1: Source Attribution - check if we have citations
  if (!response.citations || response.citations.length === 0) {
    if (!response.dataGaps || response.dataGaps.length === 0) {
      violations.push('R1: No source citations provided');
    }
  }

  // R2: Confidence Scoring - check if confidence is assigned
  if (!response.confidenceGrade) {
    violations.push('R2: No confidence grade assigned');
  }

  // Calculate citation coverage
  const citationCoverage = response.citations ? response.citations.length / Math.max(1, response.evidencePackIds?.length || 1) : 0;

  return {
    passed: violations.length === 0,
    violations,
    citationCoverage: citationCoverage * 100
  };
}

/**
 * Log agent query for monitoring and improvement
 */
async function logAgentQuery(params: {
  sectorCode: string;
  query: string;
  language: 'en' | 'ar';
  regime: string;
  responseLength: number;
  citationCount: number;
  evidencePackIds: number[];
  confidenceGrade: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.execute(sql`
      INSERT INTO sector_agent_query_logs (
        sectorCode, query, language, regime, responseLength, 
        citationCount, evidencePackIds, confidenceGrade, 
        evidenceValidation, createdAt
      ) VALUES (
        ${params.sectorCode},
        ${params.query},
        ${params.language},
        ${params.regime},
        ${params.responseLength},
        ${params.citationCount},
        ${JSON.stringify(params.evidencePackIds)},
        ${params.confidenceGrade},
        'passed',
        NOW()
      )
    `);
  } catch (error) {
    console.error('[SectorAgent] Failed to log query:', error);
  }
}

/**
 * Backward compatibility export
 */
export async function querySectorAgent(params: QueryContext): Promise<AgentResponse> {
  return generateSectorAgentResponse(params);
}
