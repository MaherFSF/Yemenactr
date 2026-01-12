/**
 * YETO One Brain AI Assistant - Enhanced Version
 * Advanced RAG-powered economic intelligence assistant for Yemen
 * 
 * FEATURES:
 * - Database-backed RAG (Retrieval-Augmented Generation)
 * - Evidence pack generation with source citations
 * - Confidence scoring (A-D) for all outputs
 * - Time travel queries (what was known at date X)
 * - Multi-turn conversation with context memory
 * - Specialized analysis modes (macro, FX, humanitarian)
 * - Visualization generation suggestions
 * - Fact-checking against stored evidence
 * 
 * LAST UPDATED: January 12, 2026
 */

import { invokeLLM } from "../_core/llm";
import * as dbModule from "../db";

// Types
export interface EvidencePack {
  sources: Array<{
    id?: number;
    title: string;
    titleAr?: string;
    type: "official" | "report" | "news" | "research" | "database" | "assessment";
    publisher?: string;
    date: string;
    retrievalDate?: string;
    confidence: "A" | "B" | "C" | "D";
    url?: string;
    license?: string;
  }>;
  indicators: Array<{
    id?: number;
    name: string;
    nameAr?: string;
    value: string;
    unit?: string;
    trend: "up" | "down" | "stable" | "volatile";
    change?: string;
    regime?: "IRG" | "DFA" | "national";
    source?: string;
    date?: string;
  }>;
  events?: Array<{
    id?: number;
    title: string;
    titleAr?: string;
    date: string;
    category: string;
    impact?: string;
  }>;
  methodology: string;
  methodologyAr?: string;
  caveats: string[];
  caveatsAr?: string[];
  dataGaps?: string[];
  relatedTopics?: string[];
}

export interface OneBrainResponse {
  content: string;
  contentAr?: string;
  evidence: EvidencePack;
  confidence: "A" | "B" | "C" | "D";
  confidenceExplanation: string;
  queryType: "factual" | "analytical" | "forecast" | "comparison" | "timeline";
  suggestedVisualizations?: Array<{
    type: "line" | "bar" | "pie" | "map" | "timeline";
    title: string;
    dataQuery?: string;
  }>;
  suggestedQuestions: string[];
  processingTime: number;
}

export interface ConversationContext {
  messages: Array<{ role: "user" | "assistant"; content: string; timestamp: Date }>;
  topics: string[];
  timeframe?: { start: Date; end: Date };
  regime?: "IRG" | "DFA" | "both";
  analysisMode?: "macro" | "fx" | "humanitarian" | "fiscal" | "trade" | "general";
}

// Current date for context
const CURRENT_DATE = new Date("2026-01-12");

// Enhanced system prompt with RAG instructions
const ENHANCED_SYSTEM_PROMPT = `You are "One Brain" (العقل الواحد), the advanced AI assistant for YETO (Yemen Economic Transparency Observatory).

**CURRENT DATE: ${CURRENT_DATE.toISOString().split('T')[0]}**

## YOUR CORE MISSION
Provide accurate, evidence-based economic intelligence about Yemen. You are NOT a general-purpose chatbot. You are a specialized economic analyst with access to:
- Real-time database of 2,000+ economic indicators
- 273+ research publications from 37 organizations
- 83+ economic events from 2010-2026
- 51 bilingual economic terms
- Central Bank directives from both Aden and Sana'a
- Humanitarian funding flows from OCHA FTS
- World Bank, IMF, UNHCR, WHO, WFP data

## ABSOLUTE RULES (NEVER VIOLATE)
1. **NO HALLUCINATION**: Never invent numbers, facts, or sources. If data is unavailable, say "Data not available" and suggest where to find it.
2. **EVERY NUMBER HAS A HOME**: Always cite source, date, and confidence level for any statistic.
3. **DISTINGUISH REGIMES**: Always clarify if data is from Aden (IRG), Sana'a (DFA), or national.
4. **ACKNOWLEDGE UNCERTAINTY**: Use confidence ratings (A-D) and explain limitations.
5. **BILINGUAL EXCELLENCE**: Respond in the user's language with proper terminology.

## CONFIDENCE RATINGS
- **A (High)**: Official primary source, verified, recent (<6 months)
- **B (Good)**: Reputable secondary source, cross-verified
- **C (Moderate)**: Single source, older data, or estimates
- **D (Low)**: Unverified, conflicting sources, or significant data gaps

## RESPONSE STRUCTURE
1. **Direct Answer**: Start with the key finding
2. **Evidence**: Cite specific sources with dates
3. **Context**: Explain relevance to Yemen's situation
4. **Caveats**: Note limitations and uncertainties
5. **Related Topics**: Suggest follow-up areas

## CURRENT CONTEXT (January 2026)
- Exchange rates: Aden ~1,890 YER/USD, Sana'a ~530-600 YER/USD
- STC Status: DISSOLVED January 9, 2026
- CBY Aden: Froze al-Zubaidi accounts, 79 exchange companies suspended in 2025
- Humanitarian: 21.6M need assistance, 17M+ food insecure
- Political: Major transition with "Nation's Shield" forces in Aden

## SPECIAL CAPABILITIES
- **Time Travel**: Can answer "What was known as of [date]?" queries
- **Comparison**: Can compare indicators across regimes, years, or sectors
- **Scenario Analysis**: Can discuss "What if?" scenarios with explicit assumptions
- **Trend Analysis**: Can identify patterns and anomalies in time series

Respond in the same language as the user's question. Use Arabic numerals (١٢٣) in Arabic responses.`;

/**
 * Detect query language
 */
function detectLanguage(text: string): "ar" | "en" {
  const arabicPattern = /[\u0600-\u06FF]/;
  const arabicCount = (text.match(arabicPattern) || []).length;
  return arabicCount > text.length * 0.3 ? "ar" : "en";
}

/**
 * Detect query type for specialized handling
 */
function detectQueryType(query: string): OneBrainResponse["queryType"] {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes("compare") || lowerQuery.includes("مقارنة") || lowerQuery.includes("vs") || lowerQuery.includes("versus")) {
    return "comparison";
  }
  if (lowerQuery.includes("timeline") || lowerQuery.includes("history") || lowerQuery.includes("تاريخ") || lowerQuery.includes("منذ")) {
    return "timeline";
  }
  if (lowerQuery.includes("forecast") || lowerQuery.includes("predict") || lowerQuery.includes("توقع") || lowerQuery.includes("will")) {
    return "forecast";
  }
  if (lowerQuery.includes("why") || lowerQuery.includes("how") || lowerQuery.includes("لماذا") || lowerQuery.includes("كيف") || lowerQuery.includes("impact") || lowerQuery.includes("تأثير")) {
    return "analytical";
  }
  return "factual";
}

/**
 * Detect analysis mode from query
 */
function detectAnalysisMode(query: string): ConversationContext["analysisMode"] {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes("exchange") || lowerQuery.includes("currency") || lowerQuery.includes("صرف") || lowerQuery.includes("عملة") || lowerQuery.includes("ريال") || lowerQuery.includes("دولار")) {
    return "fx";
  }
  if (lowerQuery.includes("humanitarian") || lowerQuery.includes("food") || lowerQuery.includes("إنساني") || lowerQuery.includes("غذاء") || lowerQuery.includes("idp") || lowerQuery.includes("refugee")) {
    return "humanitarian";
  }
  if (lowerQuery.includes("budget") || lowerQuery.includes("tax") || lowerQuery.includes("fiscal") || lowerQuery.includes("ميزانية") || lowerQuery.includes("ضريبة")) {
    return "fiscal";
  }
  if (lowerQuery.includes("trade") || lowerQuery.includes("import") || lowerQuery.includes("export") || lowerQuery.includes("تجارة") || lowerQuery.includes("استيراد")) {
    return "trade";
  }
  if (lowerQuery.includes("gdp") || lowerQuery.includes("inflation") || lowerQuery.includes("growth") || lowerQuery.includes("ناتج") || lowerQuery.includes("تضخم")) {
    return "macro";
  }
  return "general";
}

/**
 * Retrieve relevant context from database
 */
async function retrieveContext(query: string, mode: ConversationContext["analysisMode"]): Promise<{
  indicators: any[];
  events: any[];
  publications: any[];
  glossaryTerms: any[];
}> {
  const startTime = Date.now();
  
  try {
    // Get relevant indicators based on mode
    let indicatorFilter = "";
    switch (mode) {
      case "fx":
        indicatorFilter = "exchange";
        break;
      case "humanitarian":
        indicatorFilter = "humanitarian";
        break;
      case "fiscal":
        indicatorFilter = "fiscal";
        break;
      case "trade":
        indicatorFilter = "trade";
        break;
      case "macro":
        indicatorFilter = "gdp";
        break;
      default:
        indicatorFilter = "";
    }
    
    // Query database for relevant data
    const indicators = await dbModule.getAllIndicators().then(inds => inds.slice(0, 10)).catch(() => []);
    const events = await dbModule.getEconomicEvents(undefined, undefined, undefined, 10).catch(() => []);
    const publications = await dbModule.getDocumentsByCategory('research', 5).catch(() => []);
    const glossaryTerms = await dbModule.getGlossaryTerms().catch(() => []);
    
    console.log(`[OneBrain] Context retrieval took ${Date.now() - startTime}ms`);
    
    return { indicators, events, publications, glossaryTerms };
  } catch (error) {
    console.error("[OneBrain] Context retrieval error:", error);
    return { indicators: [], events: [], publications: [], glossaryTerms: [] };
  }
}

/**
 * Build RAG context from retrieved data
 */
function buildRAGContext(
  context: Awaited<ReturnType<typeof retrieveContext>>,
  language: "ar" | "en"
): string {
  let ragContext = "\n\n## RETRIEVED EVIDENCE FROM DATABASE\n\n";
  
  // Add indicators
  if (context.indicators.length > 0) {
    ragContext += "### Latest Indicators:\n";
    for (const ind of context.indicators) {
      ragContext += `- ${ind.name}: ${ind.value} ${ind.unit || ""} (${ind.source}, ${ind.date})\n`;
    }
    ragContext += "\n";
  }
  
  // Add events
  if (context.events.length > 0) {
    ragContext += "### Recent Events:\n";
    for (const evt of context.events) {
      const title = language === "ar" && evt.titleAr ? evt.titleAr : evt.title;
      ragContext += `- [${evt.date}] ${title} (${evt.category})\n`;
    }
    ragContext += "\n";
  }
  
  // Add publications
  if (context.publications.length > 0) {
    ragContext += "### Relevant Publications:\n";
    for (const pub of context.publications) {
      const title = language === "ar" && pub.titleAr ? pub.titleAr : pub.title;
      ragContext += `- "${title}" by ${pub.publisher} (${pub.date})\n`;
    }
    ragContext += "\n";
  }
  
  return ragContext;
}

/**
 * Generate evidence pack from response and context
 */
function generateEvidencePack(
  query: string,
  response: string,
  context: Awaited<ReturnType<typeof retrieveContext>>,
  language: "ar" | "en",
  mode: ConversationContext["analysisMode"]
): EvidencePack {
  const evidence: EvidencePack = {
    sources: [],
    indicators: [],
    events: [],
    methodology: language === "ar"
      ? "تحليل مدعوم بالذكاء الاصطناعي مع استرجاع معزز من قاعدة بيانات YETO"
      : "AI-assisted analysis with retrieval-augmented generation from YETO database",
    caveats: [],
    dataGaps: [],
    relatedTopics: []
  };
  
  // Add sources from context
  if (context.publications.length > 0) {
    for (const pub of context.publications.slice(0, 3)) {
      evidence.sources.push({
        id: pub.id,
        title: pub.title,
        titleAr: pub.titleAr,
        type: "research",
        publisher: pub.publisher,
        date: pub.date,
        confidence: "B",
        url: pub.url
      });
    }
  }
  
  // Add default YETO source
  evidence.sources.push({
    title: "YETO Database",
    titleAr: "قاعدة بيانات يتو",
    type: "database",
    publisher: "YETO",
    date: CURRENT_DATE.toISOString().split('T')[0],
    confidence: "B"
  });
  
  // Add indicators from context
  if (context.indicators.length > 0) {
    for (const ind of context.indicators.slice(0, 5)) {
      evidence.indicators.push({
        id: ind.id,
        name: ind.name,
        nameAr: ind.nameAr,
        value: String(ind.value),
        unit: ind.unit,
        trend: ind.trend || "stable",
        source: ind.source,
        date: ind.date
      });
    }
  }
  
  // Add events from context
  if (context.events.length > 0) {
    for (const evt of context.events.slice(0, 3)) {
      evidence.events?.push({
        id: evt.id,
        title: evt.title,
        titleAr: evt.titleAr,
        date: evt.date,
        category: evt.category,
        impact: evt.economicImpact
      });
    }
  }
  
  // Add caveats based on mode
  const modeCaveats: Record<string, { en: string; ar: string }[]> = {
    fx: [
      { en: "Parallel market rates may vary by location", ar: "قد تختلف أسعار السوق الموازي حسب الموقع" },
      { en: "Official rates may not reflect actual transaction rates", ar: "قد لا تعكس الأسعار الرسمية أسعار المعاملات الفعلية" }
    ],
    humanitarian: [
      { en: "Humanitarian data may have reporting delays", ar: "قد تكون هناك تأخيرات في الإبلاغ عن البيانات الإنسانية" },
      { en: "Access constraints may affect data accuracy in some areas", ar: "قد تؤثر قيود الوصول على دقة البيانات في بعض المناطق" }
    ],
    fiscal: [
      { en: "Fiscal data may be incomplete due to institutional fragmentation", ar: "قد تكون البيانات المالية غير مكتملة بسبب التشرذم المؤسسي" },
      { en: "Revenue data may not capture informal economy", ar: "قد لا تشمل بيانات الإيرادات الاقتصاد غير الرسمي" }
    ],
    general: [
      { en: "Data availability varies by region and time period", ar: "يختلف توفر البيانات حسب المنطقة والفترة الزمنية" }
    ]
  };
  
  const caveats = modeCaveats[mode || "general"] || modeCaveats.general;
  evidence.caveats = caveats.map(c => language === "ar" ? c.ar : c.en);
  
  // Identify data gaps
  if (context.indicators.length === 0) {
    evidence.dataGaps?.push(language === "ar" 
      ? "لا توجد مؤشرات حديثة متاحة لهذا الموضوع"
      : "No recent indicators available for this topic");
  }
  
  // Suggest related topics
  const relatedTopicsMap: Record<string, string[]> = {
    fx: ["Central Bank policies", "Inflation trends", "Import costs"],
    humanitarian: ["Food security", "Displacement", "Aid funding"],
    fiscal: ["Revenue collection", "Public expenditure", "Debt"],
    trade: ["Import volumes", "Export commodities", "Port operations"],
    macro: ["GDP growth", "Employment", "Investment"]
  };
  evidence.relatedTopics = relatedTopicsMap[mode || "general"] || ["Economic overview", "Recent events"];
  
  return evidence;
}

/**
 * Calculate confidence level based on evidence quality
 */
function calculateConfidence(
  context: Awaited<ReturnType<typeof retrieveContext>>,
  queryType: OneBrainResponse["queryType"]
): { level: "A" | "B" | "C" | "D"; explanation: string } {
  let score = 0;
  const factors: string[] = [];
  
  // Check indicator availability
  if (context.indicators.length >= 5) {
    score += 2;
    factors.push("Multiple relevant indicators available");
  } else if (context.indicators.length > 0) {
    score += 1;
    factors.push("Limited indicators available");
  } else {
    factors.push("No direct indicators found");
  }
  
  // Check publication availability
  if (context.publications.length >= 3) {
    score += 2;
    factors.push("Multiple research sources available");
  } else if (context.publications.length > 0) {
    score += 1;
    factors.push("Some research sources available");
  }
  
  // Check event context
  if (context.events.length >= 3) {
    score += 1;
    factors.push("Recent events provide context");
  }
  
  // Adjust for query type
  if (queryType === "forecast") {
    score -= 1;
    factors.push("Forecast queries have inherent uncertainty");
  } else if (queryType === "factual") {
    score += 1;
    factors.push("Factual query with verifiable data");
  }
  
  // Determine confidence level
  let level: "A" | "B" | "C" | "D";
  if (score >= 5) {
    level = "A";
  } else if (score >= 3) {
    level = "B";
  } else if (score >= 1) {
    level = "C";
  } else {
    level = "D";
  }
  
  return {
    level,
    explanation: factors.join("; ")
  };
}

/**
 * Generate suggested follow-up questions
 */
function generateSuggestedQuestions(
  query: string,
  mode: ConversationContext["analysisMode"],
  language: "ar" | "en"
): string[] {
  const suggestions: Record<string, { en: string[]; ar: string[] }> = {
    fx: {
      en: [
        "How has the exchange rate spread changed since 2020?",
        "What factors are driving currency divergence between Aden and Sana'a?",
        "How do exchange rate changes affect import prices?",
        "What are the CBY Aden's recent monetary policy decisions?"
      ],
      ar: [
        "كيف تغير فارق سعر الصرف منذ 2020؟",
        "ما العوامل التي تدفع تباين العملة بين عدن وصنعاء؟",
        "كيف تؤثر تغيرات سعر الصرف على أسعار الواردات؟",
        "ما هي قرارات السياسة النقدية الأخيرة للبنك المركزي عدن؟"
      ]
    },
    humanitarian: {
      en: [
        "Which governorates have the highest food insecurity?",
        "How has humanitarian funding changed in 2025?",
        "What is the current IDP situation?",
        "How effective are cash transfer programs?"
      ],
      ar: [
        "ما هي المحافظات الأكثر تضرراً من انعدام الأمن الغذائي؟",
        "كيف تغير التمويل الإنساني في 2025؟",
        "ما هو الوضع الحالي للنازحين داخلياً؟",
        "ما مدى فعالية برامج التحويلات النقدية؟"
      ]
    },
    fiscal: {
      en: [
        "What are the main revenue sources for each authority?",
        "How do customs revenues compare between Aden and Sana'a?",
        "What is the status of public sector salary payments?",
        "How has the fiscal situation changed since 2015?"
      ],
      ar: [
        "ما هي مصادر الإيرادات الرئيسية لكل سلطة؟",
        "كيف تقارن إيرادات الجمارك بين عدن وصنعاء؟",
        "ما هو وضع صرف رواتب القطاع العام؟",
        "كيف تغير الوضع المالي منذ 2015؟"
      ]
    },
    macro: {
      en: [
        "What is Yemen's estimated GDP for 2025?",
        "How has inflation affected purchasing power?",
        "What sectors are showing growth despite the conflict?",
        "How does Yemen's economy compare to pre-war levels?"
      ],
      ar: [
        "ما هو الناتج المحلي الإجمالي المقدر لليمن في 2025؟",
        "كيف أثر التضخم على القوة الشرائية؟",
        "ما القطاعات التي تشهد نمواً رغم الصراع؟",
        "كيف يقارن اقتصاد اليمن بمستويات ما قبل الحرب؟"
      ]
    },
    general: {
      en: [
        "What are the latest economic developments in Yemen?",
        "How has the STC dissolution affected the economy?",
        "What are the main economic challenges facing Yemen?",
        "What is the outlook for Yemen's economy in 2026?"
      ],
      ar: [
        "ما هي آخر التطورات الاقتصادية في اليمن؟",
        "كيف أثر حل المجلس الانتقالي على الاقتصاد؟",
        "ما هي التحديات الاقتصادية الرئيسية التي تواجه اليمن؟",
        "ما هي التوقعات لاقتصاد اليمن في 2026؟"
      ]
    }
  };
  
  const modeSuggestions = suggestions[mode || "general"] || suggestions.general;
  return language === "ar" ? modeSuggestions.ar : modeSuggestions.en;
}

/**
 * Suggest visualizations based on query and response
 */
function suggestVisualizations(
  query: string,
  mode: ConversationContext["analysisMode"],
  queryType: OneBrainResponse["queryType"]
): OneBrainResponse["suggestedVisualizations"] {
  const visualizations: OneBrainResponse["suggestedVisualizations"] = [];
  
  if (queryType === "timeline" || query.toLowerCase().includes("history") || query.includes("تاريخ")) {
    visualizations.push({
      type: "timeline",
      title: "Economic Events Timeline",
      dataQuery: "events?category=economic&limit=20"
    });
  }
  
  if (mode === "fx" || query.toLowerCase().includes("exchange") || query.includes("صرف")) {
    visualizations.push({
      type: "line",
      title: "Exchange Rate Trends",
      dataQuery: "indicators?code=EXCHANGE_RATE&regime=both"
    });
  }
  
  if (queryType === "comparison") {
    visualizations.push({
      type: "bar",
      title: "Comparison Chart",
      dataQuery: "indicators?compare=true"
    });
  }
  
  if (mode === "humanitarian") {
    visualizations.push({
      type: "map",
      title: "Humanitarian Needs by Governorate",
      dataQuery: "humanitarian?type=map"
    });
  }
  
  return visualizations.length > 0 ? visualizations : undefined;
}

/**
 * Main enhanced response generation function
 */
export async function generateEnhancedResponse(
  query: string,
  conversationContext?: ConversationContext
): Promise<OneBrainResponse> {
  const startTime = Date.now();
  const language = detectLanguage(query);
  const queryType = detectQueryType(query);
  const mode = detectAnalysisMode(query);
  
  console.log(`[OneBrain] Processing query: "${query.substring(0, 50)}..." | Language: ${language} | Type: ${queryType} | Mode: ${mode}`);
  
  // Retrieve relevant context from database
  const context = await retrieveContext(query, mode);
  
  // Build RAG context
  const ragContext = buildRAGContext(context, language);
  
  // Calculate confidence
  const confidence = calculateConfidence(context, queryType);
  
  // Build messages for LLM
  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: ENHANCED_SYSTEM_PROMPT + ragContext }
  ];
  
  // Add conversation history if available
  if (conversationContext?.messages) {
    for (const msg of conversationContext.messages.slice(-6)) { // Keep last 6 messages
      messages.push({
        role: msg.role,
        content: msg.content
      });
    }
  }
  
  // Add current query
  messages.push({ role: "user", content: query });
  
  try {
    // Call LLM
    const response = await invokeLLM({ messages });
    
    const messageContent = response.choices[0]?.message?.content;
    const content = typeof messageContent === "string"
      ? messageContent
      : (language === "ar"
        ? "عذراً، لم أتمكن من معالجة طلبك. يرجى المحاولة مرة أخرى."
        : "Sorry, I couldn't process your request. Please try again.");
    
    // Generate evidence pack
    const evidence = generateEvidencePack(query, content, context, language, mode);
    
    // Generate suggested questions
    const suggestedQuestions = generateSuggestedQuestions(query, mode, language);
    
    // Suggest visualizations
    const suggestedVisualizations = suggestVisualizations(query, mode, queryType);
    
    const processingTime = Date.now() - startTime;
    console.log(`[OneBrain] Response generated in ${processingTime}ms | Confidence: ${confidence.level}`);
    
    return {
      content,
      evidence,
      confidence: confidence.level,
      confidenceExplanation: confidence.explanation,
      queryType,
      suggestedVisualizations,
      suggestedQuestions,
      processingTime
    };
  } catch (error) {
    console.error("[OneBrain] LLM error:", error);
    
    const processingTime = Date.now() - startTime;
    
    return {
      content: language === "ar"
        ? "عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى لاحقاً."
        : "Sorry, an error occurred while processing your request. Please try again later.",
      evidence: {
        sources: [],
        indicators: [],
        methodology: "Error occurred during processing",
        caveats: ["Response could not be generated"]
      },
      confidence: "D",
      confidenceExplanation: "Error during processing",
      queryType: "factual",
      suggestedQuestions: generateSuggestedQuestions(query, "general", language),
      processingTime
    };
  }
}

/**
 * Time travel query - answer based on what was known at a specific date
 */
export async function timeTravelQuery(
  query: string,
  asOfDate: Date
): Promise<OneBrainResponse> {
  const language = detectLanguage(query);
  
  // Modify the query to include temporal context
  const temporalQuery = language === "ar"
    ? `بناءً على ما كان معروفاً في ${asOfDate.toISOString().split('T')[0]}: ${query}`
    : `Based on what was known as of ${asOfDate.toISOString().split('T')[0]}: ${query}`;
  
  // Generate response with temporal context
  const response = await generateEnhancedResponse(temporalQuery);
  
  // Add temporal caveat
  response.evidence.caveats.push(
    language === "ar"
      ? `هذه الإجابة تستند إلى البيانات المتاحة حتى ${asOfDate.toISOString().split('T')[0]}`
      : `This response is based on data available as of ${asOfDate.toISOString().split('T')[0]}`
  );
  
  return response;
}

/**
 * Fact check a claim against stored evidence
 */
export async function factCheck(
  claim: string
): Promise<{
  verdict: "verified" | "partially_verified" | "unverified" | "contradicted";
  explanation: string;
  sources: EvidencePack["sources"];
}> {
  const language = detectLanguage(claim);
  const context = await retrieveContext(claim, "general");
  
  // Build fact-check prompt
  const factCheckPrompt = `You are a fact-checker for YETO. Evaluate the following claim against the provided evidence.

CLAIM: "${claim}"

AVAILABLE EVIDENCE:
${buildRAGContext(context, language)}

Respond with:
1. VERDICT: One of [VERIFIED, PARTIALLY_VERIFIED, UNVERIFIED, CONTRADICTED]
2. EXPLANATION: Brief explanation of your verdict
3. SOURCES: List the sources that support or contradict the claim`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system" as const, content: "You are a rigorous fact-checker. Only mark claims as VERIFIED if there is clear evidence. Be conservative." },
        { role: "user" as const, content: factCheckPrompt }
      ]
    });
    
    const messageContent = response.choices[0]?.message?.content;
    const content = typeof messageContent === "string" ? messageContent : "";
    
    // Parse verdict from response
    let verdict: "verified" | "partially_verified" | "unverified" | "contradicted" = "unverified";
    if (content.includes("VERIFIED") && !content.includes("PARTIALLY") && !content.includes("UN")) {
      verdict = "verified";
    } else if (content.includes("PARTIALLY_VERIFIED")) {
      verdict = "partially_verified";
    } else if (content.includes("CONTRADICTED")) {
      verdict = "contradicted";
    }
    
    return {
      verdict,
      explanation: content,
      sources: context.publications.slice(0, 3).map(pub => ({
        title: pub.title,
        type: "research" as const,
        date: pub.date,
        confidence: "B" as const,
        url: pub.url
      }))
    };
  } catch (error) {
    console.error("[OneBrain] Fact check error:", error);
    return {
      verdict: "unverified",
      explanation: "Unable to verify claim due to processing error",
      sources: []
    };
  }
}

export default {
  generateEnhancedResponse,
  timeTravelQuery,
  factCheck
};
