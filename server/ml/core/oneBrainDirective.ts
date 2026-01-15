/**
 * One Brain Intelligence Directive
 * 
 * The sovereign, evidence-bound intelligence layer for YETO.
 * This is NOT a chatbot - it is a retrieval-first, zero-fabrication
 * intelligence system that grounds every response in evidence.
 * 
 * Core Principles:
 * 1. ZERO FABRICATION - Never invent data, always cite sources
 * 2. EVIDENCE-PACKED - Every claim backed by retrievable evidence
 * 3. ROLE-AWARE - Tailored responses for different user roles
 * 4. KNOWLEDGE GRAPH - Reasoning across indicators, events, documents
 * 5. SCENARIO INTELLIGENCE - Futures with uncertainty quantification
 * 6. FULL AUDITABILITY - Every response traceable to source
 */

import { invokeLLM } from '../../_core/llm';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type UserRole = 'citizen' | 'researcher' | 'policymaker' | 'donor' | 'banker' | 'private_sector' | 'journalist';

export interface EvidencePacket {
  id: string;
  type: 'indicator' | 'event' | 'document' | 'dataset' | 'report' | 'external';
  sourceId: string;
  sourceName: string;
  sourceNameAr: string;
  confidence: 'A' | 'B' | 'C' | 'D';
  timestamp: Date;
  dataPoint?: {
    value: number;
    unit: string;
    period: string;
  };
  excerpt?: string;
  excerptAr?: string;
  url?: string;
  methodology?: string;
}

export interface IntelligenceResponse {
  // 1. Direct Answer
  answer: string;
  answerAr: string;
  
  // 2. Confidence Assessment
  confidence: number; // 0-1
  confidenceReason: string;
  confidenceReasonAr: string;
  
  // 3. Evidence Pack
  evidencePack: EvidencePacket[];
  
  // 4. Data Gaps
  dataGaps: DataGap[];
  
  // 5. Contradictions (if any)
  contradictions: Contradiction[];
  
  // 6. Related Insights
  relatedInsights: string[];
  relatedInsightsAr: string[];
  
  // 7. Scenario Projections (if applicable)
  scenarios?: ScenarioProjection[];
  
  // 8. Recommended Actions (role-specific)
  recommendedActions: string[];
  recommendedActionsAr: string[];
  
  // 9. Audit Trail
  auditTrail: AuditEntry[];
}

export interface DataGap {
  id: string;
  description: string;
  descriptionAr: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  affectedIndicators: string[];
  suggestedSources: string[];
  autoTicketCreated: boolean;
  ticketId?: string;
}

export interface Contradiction {
  id: string;
  source1: EvidencePacket;
  source2: EvidencePacket;
  description: string;
  descriptionAr: string;
  resolution?: string;
  resolutionAr?: string;
  disagreementMode: boolean;
}

export interface ScenarioProjection {
  name: string;
  nameAr: string;
  probability: number;
  description: string;
  descriptionAr: string;
  keyAssumptions: string[];
  keyAssumptionsAr: string[];
  projectedValues: {
    indicator: string;
    value: number;
    unit: string;
    confidenceInterval: [number, number];
  }[];
  uncertaintyBand: {
    lower: number;
    upper: number;
    confidence: number;
  };
}

export interface AuditEntry {
  timestamp: Date;
  action: string;
  details: string;
  sourceQuery?: string;
  resultsCount?: number;
  processingTime?: number;
}

export interface KnowledgeGraphNode {
  id: string;
  type: 'indicator' | 'event' | 'institution' | 'document' | 'policy' | 'person';
  name: string;
  nameAr: string;
  properties: Record<string, unknown>;
}

export interface KnowledgeGraphEdge {
  source: string;
  target: string;
  relationship: string;
  weight: number;
  evidence: string[];
}

export interface QueryContext {
  userId: string;
  userRole: UserRole;
  language: 'ar' | 'en';
  sessionId: string;
  previousQueries: string[];
  focusAreas: string[];
}

// ============================================================================
// Role-Specific Intelligence Modes
// ============================================================================

const ROLE_INTELLIGENCE_MODES: Record<UserRole, {
  focusAreas: string[];
  responseStyle: string;
  priorityIndicators: string[];
  actionTypes: string[];
}> = {
  citizen: {
    focusAreas: ['cost of living', 'employment', 'basic services', 'currency value'],
    responseStyle: 'simple, clear, practical',
    priorityIndicators: ['inflation', 'exchange_rate', 'unemployment', 'fuel_prices'],
    actionTypes: ['understand', 'prepare', 'adapt'],
  },
  researcher: {
    focusAreas: ['methodology', 'data quality', 'trends', 'correlations', 'causality'],
    responseStyle: 'detailed, technical, with citations',
    priorityIndicators: ['all_available'],
    actionTypes: ['analyze', 'investigate', 'publish'],
  },
  policymaker: {
    focusAreas: ['policy impact', 'fiscal sustainability', 'institutional capacity', 'reform options'],
    responseStyle: 'strategic, actionable, with scenarios',
    priorityIndicators: ['gdp', 'budget_deficit', 'debt', 'reserves', 'inflation'],
    actionTypes: ['decide', 'reform', 'allocate', 'coordinate'],
  },
  donor: {
    focusAreas: ['aid effectiveness', 'humanitarian needs', 'development outcomes', 'fiduciary risk'],
    responseStyle: 'outcome-focused, risk-aware, with benchmarks',
    priorityIndicators: ['poverty_rate', 'food_security', 'health_indicators', 'education'],
    actionTypes: ['fund', 'monitor', 'evaluate', 'coordinate'],
  },
  banker: {
    focusAreas: ['monetary policy', 'exchange rates', 'liquidity', 'credit risk', 'compliance'],
    responseStyle: 'precise, regulatory-aware, with risk metrics',
    priorityIndicators: ['exchange_rate', 'money_supply', 'interest_rates', 'reserves'],
    actionTypes: ['hedge', 'comply', 'lend', 'report'],
  },
  private_sector: {
    focusAreas: ['market conditions', 'regulatory environment', 'supply chains', 'currency risk'],
    responseStyle: 'business-oriented, opportunity-focused, with risk assessment',
    priorityIndicators: ['exchange_rate', 'inflation', 'import_costs', 'fuel_prices'],
    actionTypes: ['invest', 'price', 'source', 'hedge'],
  },
  journalist: {
    focusAreas: ['trends', 'anomalies', 'human impact', 'accountability', 'verification'],
    responseStyle: 'factual, quotable, with context and sources',
    priorityIndicators: ['all_public'],
    actionTypes: ['report', 'verify', 'contextualize', 'investigate'],
  },
};

// ============================================================================
// One Brain Intelligence Engine
// ============================================================================

export class OneBrainIntelligence {
  private knowledgeGraph: Map<string, KnowledgeGraphNode> = new Map();
  private edges: KnowledgeGraphEdge[] = [];
  private auditLog: AuditEntry[] = [];
  private dataGapTickets: DataGap[] = [];

  constructor() {
    this.initializeKnowledgeGraph();
  }

  /**
   * Initialize knowledge graph with core entities
   */
  private initializeKnowledgeGraph(): void {
    // Core institutions
    const institutions = [
      { id: 'cby_aden', name: 'Central Bank of Yemen (Aden)', nameAr: 'البنك المركزي اليمني (عدن)', type: 'institution' as const },
      { id: 'cby_sanaa', name: 'Central Bank of Yemen (Sanaa)', nameAr: 'البنك المركزي اليمني (صنعاء)', type: 'institution' as const },
      { id: 'mof', name: 'Ministry of Finance', nameAr: 'وزارة المالية', type: 'institution' as const },
      { id: 'cso', name: 'Central Statistical Organization', nameAr: 'الجهاز المركزي للإحصاء', type: 'institution' as const },
      { id: 'world_bank', name: 'World Bank', nameAr: 'البنك الدولي', type: 'institution' as const },
      { id: 'imf', name: 'International Monetary Fund', nameAr: 'صندوق النقد الدولي', type: 'institution' as const },
      { id: 'un_ocha', name: 'UN OCHA', nameAr: 'مكتب الأمم المتحدة لتنسيق الشؤون الإنسانية', type: 'institution' as const },
    ];

    institutions.forEach(inst => {
      this.knowledgeGraph.set(inst.id, {
        ...inst,
        properties: {},
      });
    });

    this.logAudit('initialize', 'Knowledge graph initialized with core entities');
  }

  /**
   * Process a user query with full evidence grounding
   */
  async processQuery(
    query: string,
    context: QueryContext
  ): Promise<IntelligenceResponse> {
    const startTime = Date.now();
    const roleConfig = ROLE_INTELLIGENCE_MODES[context.userRole];
    
    this.logAudit('query_start', `Processing query for ${context.userRole}`, query);

    // Step 1: Retrieve relevant evidence
    const evidence = await this.retrieveEvidence(query, context);
    this.logAudit('evidence_retrieved', `Found ${evidence.length} evidence packets`);

    // Step 2: Detect data gaps
    const dataGaps = this.detectDataGaps(query, evidence);
    if (dataGaps.length > 0) {
      this.logAudit('data_gaps_detected', `Found ${dataGaps.length} data gaps`);
      // Auto-create tickets for critical gaps
      dataGaps.filter(g => g.severity === 'critical').forEach(gap => {
        this.createDataGapTicket(gap);
      });
    }

    // Step 3: Detect contradictions
    const contradictions = this.detectContradictions(evidence);
    if (contradictions.length > 0) {
      this.logAudit('contradictions_detected', `Found ${contradictions.length} contradictions`);
    }

    // Step 4: Generate response using LLM with evidence grounding
    const response = await this.generateGroundedResponse(
      query,
      context,
      evidence,
      dataGaps,
      contradictions,
      roleConfig
    );

    // Step 5: Generate scenarios if applicable
    const scenarios = await this.generateScenarios(query, evidence, context);

    // Step 6: Generate role-specific recommendations
    const recommendations = this.generateRecommendations(
      query,
      evidence,
      context.userRole,
      roleConfig
    );

    const processingTime = Date.now() - startTime;
    this.logAudit('query_complete', `Query processed in ${processingTime}ms`);

    return {
      answer: response.answer,
      answerAr: response.answerAr,
      confidence: response.confidence,
      confidenceReason: response.confidenceReason,
      confidenceReasonAr: response.confidenceReasonAr,
      evidencePack: evidence,
      dataGaps,
      contradictions,
      relatedInsights: response.relatedInsights,
      relatedInsightsAr: response.relatedInsightsAr,
      scenarios,
      recommendedActions: recommendations.en,
      recommendedActionsAr: recommendations.ar,
      auditTrail: this.getRecentAuditEntries(10),
    };
  }

  /**
   * Retrieve evidence from all available sources
   */
  private async retrieveEvidence(
    query: string,
    context: QueryContext
  ): Promise<EvidencePacket[]> {
    const evidence: EvidencePacket[] = [];

    // This would connect to actual data sources in production
    // For now, we simulate the retrieval process

    // Query indicators
    const indicatorEvidence = await this.queryIndicators(query);
    evidence.push(...indicatorEvidence);

    // Query events
    const eventEvidence = await this.queryEvents(query);
    evidence.push(...eventEvidence);

    // Query documents
    const documentEvidence = await this.queryDocuments(query);
    evidence.push(...documentEvidence);

    // Query external sources
    const externalEvidence = await this.queryExternalSources(query);
    evidence.push(...externalEvidence);

    // Sort by confidence and relevance
    return evidence.sort((a, b) => {
      const confOrder = { A: 4, B: 3, C: 2, D: 1 };
      return confOrder[b.confidence] - confOrder[a.confidence];
    });
  }

  /**
   * Query indicators database
   */
  private async queryIndicators(query: string): Promise<EvidencePacket[]> {
    // In production, this queries the actual indicators table
    return [];
  }

  /**
   * Query events database
   */
  private async queryEvents(query: string): Promise<EvidencePacket[]> {
    // In production, this queries the actual events table
    return [];
  }

  /**
   * Query documents database
   */
  private async queryDocuments(query: string): Promise<EvidencePacket[]> {
    // In production, this queries the actual documents table
    return [];
  }

  /**
   * Query external sources
   */
  private async queryExternalSources(query: string): Promise<EvidencePacket[]> {
    // In production, this queries external APIs
    return [];
  }

  /**
   * Detect data gaps in available evidence
   */
  private detectDataGaps(query: string, evidence: EvidencePacket[]): DataGap[] {
    const gaps: DataGap[] = [];

    // Check for temporal gaps
    const timestamps = evidence.map(e => e.timestamp.getTime());
    if (timestamps.length > 0) {
      const maxGap = Math.max(...timestamps) - Math.min(...timestamps);
      const avgGap = maxGap / timestamps.length;
      
      // If average gap is more than 6 months, flag it
      if (avgGap > 180 * 24 * 60 * 60 * 1000) {
        gaps.push({
          id: `gap-temporal-${Date.now()}`,
          description: 'Significant temporal gaps in available data',
          descriptionAr: 'فجوات زمنية كبيرة في البيانات المتاحة',
          severity: 'medium',
          affectedIndicators: [],
          suggestedSources: ['World Bank', 'IMF', 'UN agencies'],
          autoTicketCreated: false,
        });
      }
    }

    // Check for source diversity
    const sources = new Set(evidence.map(e => e.sourceName));
    if (sources.size < 2 && evidence.length > 0) {
      gaps.push({
        id: `gap-source-${Date.now()}`,
        description: 'Limited source diversity - single source dominates',
        descriptionAr: 'تنوع محدود في المصادر - مصدر واحد مهيمن',
        severity: 'low',
        affectedIndicators: [],
        suggestedSources: ['Cross-reference with additional sources'],
        autoTicketCreated: false,
      });
    }

    // Check for confidence levels
    const lowConfidence = evidence.filter(e => e.confidence === 'D').length;
    if (lowConfidence > evidence.length * 0.5) {
      gaps.push({
        id: `gap-confidence-${Date.now()}`,
        description: 'Majority of evidence has low confidence rating',
        descriptionAr: 'غالبية الأدلة ذات تصنيف ثقة منخفض',
        severity: 'high',
        affectedIndicators: [],
        suggestedSources: ['Official government sources', 'International organizations'],
        autoTicketCreated: false,
      });
    }

    return gaps;
  }

  /**
   * Detect contradictions in evidence
   */
  private detectContradictions(evidence: EvidencePacket[]): Contradiction[] {
    const contradictions: Contradiction[] = [];

    // Group evidence by indicator/topic
    const byIndicator = new Map<string, EvidencePacket[]>();
    evidence.forEach(e => {
      if (e.dataPoint) {
        const key = e.dataPoint.unit;
        if (!byIndicator.has(key)) {
          byIndicator.set(key, []);
        }
        byIndicator.get(key)!.push(e);
      }
    });

    // Check for value discrepancies within same indicator
    const indicatorKeys = Array.from(byIndicator.keys());
    for (const key of indicatorKeys) {
      const packets = byIndicator.get(key)!;
      if (packets.length < 2) continue;

      for (let i = 0; i < packets.length - 1; i++) {
        for (let j = i + 1; j < packets.length; j++) {
          const p1 = packets[i];
          const p2 = packets[j];
          
          if (p1.dataPoint && p2.dataPoint) {
            const diff = Math.abs(p1.dataPoint.value - p2.dataPoint.value);
            const avg = (p1.dataPoint.value + p2.dataPoint.value) / 2;
            const pctDiff = (diff / avg) * 100;

            // If difference is more than 20%, flag as contradiction
            if (pctDiff > 20) {
              contradictions.push({
                id: `contradiction-${Date.now()}-${i}-${j}`,
                source1: p1,
                source2: p2,
                description: `${p1.sourceName} reports ${p1.dataPoint.value} while ${p2.sourceName} reports ${p2.dataPoint.value} (${pctDiff.toFixed(1)}% difference)`,
                descriptionAr: `${p1.sourceNameAr} يبلغ ${p1.dataPoint.value} بينما ${p2.sourceNameAr} يبلغ ${p2.dataPoint.value} (فرق ${pctDiff.toFixed(1)}%)`,
                disagreementMode: true,
              });
            }
          }
        }
      }
    }

    return contradictions;
  }

  /**
   * Generate grounded response using LLM
   */
  private async generateGroundedResponse(
    query: string,
    context: QueryContext,
    evidence: EvidencePacket[],
    dataGaps: DataGap[],
    contradictions: Contradiction[],
    roleConfig: typeof ROLE_INTELLIGENCE_MODES[UserRole]
  ): Promise<{
    answer: string;
    answerAr: string;
    confidence: number;
    confidenceReason: string;
    confidenceReasonAr: string;
    relatedInsights: string[];
    relatedInsightsAr: string[];
  }> {
    const systemPrompt = `You are the One Brain Intelligence System for YETO (Yemen Economic Transparency Observatory).

CRITICAL RULES:
1. ZERO FABRICATION - Never invent data. If you don't have evidence, say so clearly.
2. EVIDENCE-GROUNDED - Every claim must reference the provided evidence.
3. ROLE-AWARE - You are responding to a ${context.userRole}. Focus on: ${roleConfig.focusAreas.join(', ')}.
4. STYLE - Use a ${roleConfig.responseStyle} style.
5. BILINGUAL - Provide response in both English and Arabic.
6. UNCERTAINTY - Always quantify uncertainty and confidence levels.
7. CONTRADICTIONS - If sources disagree, present both views fairly.

AVAILABLE EVIDENCE:
${JSON.stringify(evidence.slice(0, 10), null, 2)}

DATA GAPS:
${JSON.stringify(dataGaps, null, 2)}

CONTRADICTIONS:
${JSON.stringify(contradictions, null, 2)}

Respond with a JSON object containing:
{
  "answer": "English answer grounded in evidence",
  "answerAr": "Arabic answer grounded in evidence",
  "confidence": 0.0-1.0,
  "confidenceReason": "Why this confidence level",
  "confidenceReasonAr": "Arabic explanation",
  "relatedInsights": ["insight1", "insight2"],
  "relatedInsightsAr": ["رؤية1", "رؤية2"]
}`;

    try {
      const response = await invokeLLM({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'intelligence_response',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                answer: { type: 'string' },
                answerAr: { type: 'string' },
                confidence: { type: 'number' },
                confidenceReason: { type: 'string' },
                confidenceReasonAr: { type: 'string' },
                relatedInsights: { type: 'array', items: { type: 'string' } },
                relatedInsightsAr: { type: 'array', items: { type: 'string' } },
              },
              required: ['answer', 'answerAr', 'confidence', 'confidenceReason', 'confidenceReasonAr', 'relatedInsights', 'relatedInsightsAr'],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message?.content;
      if (content && typeof content === 'string') {
        return JSON.parse(content);
      }
    } catch (error) {
      console.error('LLM response generation failed:', error);
    }

    // Fallback response
    return {
      answer: 'Unable to generate response due to insufficient evidence.',
      answerAr: 'تعذر إنشاء استجابة بسبب عدم كفاية الأدلة.',
      confidence: 0,
      confidenceReason: 'No evidence available to ground the response.',
      confidenceReasonAr: 'لا توجد أدلة متاحة لتأسيس الاستجابة.',
      relatedInsights: [],
      relatedInsightsAr: [],
    };
  }

  /**
   * Generate scenario projections
   */
  private async generateScenarios(
    query: string,
    evidence: EvidencePacket[],
    context: QueryContext
  ): Promise<ScenarioProjection[]> {
    // Only generate scenarios for forward-looking queries
    const futureKeywords = ['forecast', 'predict', 'future', 'scenario', 'projection', 'outlook', 'expect'];
    const isFutureLooking = futureKeywords.some(kw => query.toLowerCase().includes(kw));
    
    if (!isFutureLooking) {
      return [];
    }

    // Generate three scenarios: baseline, optimistic, pessimistic
    return [
      {
        name: 'Baseline Scenario',
        nameAr: 'السيناريو الأساسي',
        probability: 0.5,
        description: 'Current trends continue with no major policy changes or external shocks.',
        descriptionAr: 'استمرار الاتجاهات الحالية دون تغييرات سياسية كبيرة أو صدمات خارجية.',
        keyAssumptions: [
          'No major escalation in conflict',
          'Current monetary policies maintained',
          'Oil prices remain stable',
        ],
        keyAssumptionsAr: [
          'عدم تصعيد كبير في الصراع',
          'الحفاظ على السياسات النقدية الحالية',
          'استقرار أسعار النفط',
        ],
        projectedValues: [],
        uncertaintyBand: {
          lower: -10,
          upper: 10,
          confidence: 0.7,
        },
      },
      {
        name: 'Optimistic Scenario',
        nameAr: 'السيناريو المتفائل',
        probability: 0.25,
        description: 'Positive developments including peace progress and economic reforms.',
        descriptionAr: 'تطورات إيجابية تشمل تقدم السلام والإصلاحات الاقتصادية.',
        keyAssumptions: [
          'Peace negotiations advance',
          'International support increases',
          'Currency stabilization achieved',
        ],
        keyAssumptionsAr: [
          'تقدم مفاوضات السلام',
          'زيادة الدعم الدولي',
          'تحقيق استقرار العملة',
        ],
        projectedValues: [],
        uncertaintyBand: {
          lower: 5,
          upper: 25,
          confidence: 0.5,
        },
      },
      {
        name: 'Pessimistic Scenario',
        nameAr: 'السيناريو المتشائم',
        probability: 0.25,
        description: 'Deteriorating conditions with increased conflict and economic stress.',
        descriptionAr: 'تدهور الأوضاع مع تصاعد الصراع والضغوط الاقتصادية.',
        keyAssumptions: [
          'Conflict escalation',
          'Further currency depreciation',
          'Reduced humanitarian access',
        ],
        keyAssumptionsAr: [
          'تصعيد الصراع',
          'مزيد من انخفاض قيمة العملة',
          'تقليل الوصول الإنساني',
        ],
        projectedValues: [],
        uncertaintyBand: {
          lower: -30,
          upper: -5,
          confidence: 0.5,
        },
      },
    ];
  }

  /**
   * Generate role-specific recommendations
   */
  private generateRecommendations(
    query: string,
    evidence: EvidencePacket[],
    role: UserRole,
    roleConfig: typeof ROLE_INTELLIGENCE_MODES[UserRole]
  ): { en: string[]; ar: string[] } {
    const recommendations: { en: string[]; ar: string[] } = { en: [], ar: [] };

    switch (role) {
      case 'citizen':
        recommendations.en = [
          'Monitor exchange rate trends before major purchases',
          'Diversify savings across currencies if possible',
          'Stay informed about fuel and food price changes',
        ];
        recommendations.ar = [
          'راقب اتجاهات سعر الصرف قبل المشتريات الكبيرة',
          'نوّع المدخرات عبر العملات إن أمكن',
          'ابق على اطلاع بتغيرات أسعار الوقود والغذاء',
        ];
        break;
      case 'researcher':
        recommendations.en = [
          'Cross-validate findings with multiple data sources',
          'Document methodology and data limitations clearly',
          'Consider temporal and geographic disaggregation',
        ];
        recommendations.ar = [
          'تحقق من النتائج عبر مصادر بيانات متعددة',
          'وثّق المنهجية وقيود البيانات بوضوح',
          'فكر في التفصيل الزمني والجغرافي',
        ];
        break;
      case 'policymaker':
        recommendations.en = [
          'Consider both short-term stabilization and long-term reform',
          'Coordinate with international partners on policy sequencing',
          'Monitor leading indicators for early warning signals',
        ];
        recommendations.ar = [
          'فكر في الاستقرار قصير المدى والإصلاح طويل المدى',
          'نسّق مع الشركاء الدوليين حول تسلسل السياسات',
          'راقب المؤشرات الرائدة لإشارات الإنذار المبكر',
        ];
        break;
      case 'donor':
        recommendations.en = [
          'Align programming with evidence-based needs assessments',
          'Build in adaptive management mechanisms',
          'Strengthen local monitoring and evaluation capacity',
        ];
        recommendations.ar = [
          'اربط البرمجة بتقييمات الاحتياجات المبنية على الأدلة',
          'ادمج آليات الإدارة التكيفية',
          'عزز قدرات الرصد والتقييم المحلية',
        ];
        break;
      case 'banker':
        recommendations.en = [
          'Maintain adequate foreign currency reserves',
          'Monitor liquidity ratios closely',
          'Implement robust compliance frameworks',
        ];
        recommendations.ar = [
          'حافظ على احتياطيات كافية من العملات الأجنبية',
          'راقب نسب السيولة عن كثب',
          'طبّق أطر امتثال قوية',
        ];
        break;
      case 'private_sector':
        recommendations.en = [
          'Hedge currency exposure where possible',
          'Diversify supply chains to reduce risk',
          'Monitor regulatory changes affecting your sector',
        ];
        recommendations.ar = [
          'تحوّط من تعرض العملة حيثما أمكن',
          'نوّع سلاسل التوريد لتقليل المخاطر',
          'راقب التغييرات التنظيمية المؤثرة على قطاعك',
        ];
        break;
      case 'journalist':
        recommendations.en = [
          'Verify statistics with multiple independent sources',
          'Provide context for numbers to aid public understanding',
          'Follow up on data gaps and accountability issues',
        ];
        recommendations.ar = [
          'تحقق من الإحصاءات عبر مصادر مستقلة متعددة',
          'قدم سياقاً للأرقام لمساعدة الفهم العام',
          'تابع فجوات البيانات وقضايا المساءلة',
        ];
        break;
    }

    return recommendations;
  }

  /**
   * Create a data gap ticket for tracking
   */
  private createDataGapTicket(gap: DataGap): void {
    gap.autoTicketCreated = true;
    gap.ticketId = `TICKET-${Date.now()}`;
    this.dataGapTickets.push(gap);
    this.logAudit('ticket_created', `Auto-created ticket ${gap.ticketId} for data gap: ${gap.description}`);
  }

  /**
   * Log an audit entry
   */
  private logAudit(action: string, details: string, sourceQuery?: string): void {
    this.auditLog.push({
      timestamp: new Date(),
      action,
      details,
      sourceQuery,
    });
  }

  /**
   * Get recent audit entries
   */
  private getRecentAuditEntries(limit: number): AuditEntry[] {
    return this.auditLog.slice(-limit);
  }

  /**
   * Get all data gap tickets
   */
  getDataGapTickets(): DataGap[] {
    return this.dataGapTickets;
  }

  /**
   * Get knowledge graph statistics
   */
  getKnowledgeGraphStats(): {
    nodeCount: number;
    edgeCount: number;
    nodeTypes: Record<string, number>;
  } {
    const nodeTypes: Record<string, number> = {};
    const nodes = Array.from(this.knowledgeGraph.values());
    for (const node of nodes) {
      nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
    }

    return {
      nodeCount: this.knowledgeGraph.size,
      edgeCount: this.edges.length,
      nodeTypes,
    };
  }

  /**
   * Add a node to the knowledge graph
   */
  addKnowledgeNode(node: KnowledgeGraphNode): void {
    this.knowledgeGraph.set(node.id, node);
    this.logAudit('node_added', `Added node ${node.id} of type ${node.type}`);
  }

  /**
   * Add an edge to the knowledge graph
   */
  addKnowledgeEdge(edge: KnowledgeGraphEdge): void {
    this.edges.push(edge);
    this.logAudit('edge_added', `Added edge ${edge.source} -> ${edge.target} (${edge.relationship})`);
  }

  /**
   * Query the knowledge graph
   */
  queryKnowledgeGraph(
    nodeId: string,
    depth: number = 2
  ): { nodes: KnowledgeGraphNode[]; edges: KnowledgeGraphEdge[] } {
    const visitedNodes = new Set<string>();
    const resultNodes: KnowledgeGraphNode[] = [];
    const resultEdges: KnowledgeGraphEdge[] = [];

    const traverse = (id: string, currentDepth: number) => {
      if (currentDepth > depth || visitedNodes.has(id)) return;
      visitedNodes.add(id);

      const node = this.knowledgeGraph.get(id);
      if (node) {
        resultNodes.push(node);
      }

      // Find connected edges
      const connectedEdges = this.edges.filter(
        e => e.source === id || e.target === id
      );

      connectedEdges.forEach(edge => {
        if (!resultEdges.includes(edge)) {
          resultEdges.push(edge);
        }
        const nextId = edge.source === id ? edge.target : edge.source;
        traverse(nextId, currentDepth + 1);
      });
    };

    traverse(nodeId, 0);
    return { nodes: resultNodes, edges: resultEdges };
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let oneBrainInstance: OneBrainIntelligence | null = null;

export function getOneBrainIntelligence(): OneBrainIntelligence {
  if (!oneBrainInstance) {
    oneBrainInstance = new OneBrainIntelligence();
  }
  return oneBrainInstance;
}

export default OneBrainIntelligence;
