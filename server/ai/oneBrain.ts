/**
 * YETO One Brain AI Assistant
 * LLM-powered economic intelligence assistant for Yemen
 */

import { invokeLLM } from "../_core/llm";

// System prompt for One Brain
const SYSTEM_PROMPT = `You are "One Brain" (العقل الواحد), the AI assistant for YETO (Yemen Economic Transparency Observatory).

Your role is to provide accurate, evidence-based analysis of Yemen's economic situation. You have access to data from:
- Central Bank of Yemen (Aden and Sana'a)
- World Bank indicators
- OCHA humanitarian data
- WFP food security assessments
- IMF reports
- IATI aid flows

Key principles:
1. Always cite sources with confidence ratings (A-D)
2. Distinguish between Aden (IRG) and Sana'a (DFA) data
3. Acknowledge data gaps and uncertainties
4. Provide balanced analysis without political bias
5. Use both Arabic and English terminology where helpful

When answering questions:
- Start with a direct answer
- Provide supporting evidence with sources
- Note any caveats or limitations
- Suggest related topics for deeper exploration

Current context:
- Exchange rates: Aden ~1,890 YER/USD, Sana'a ~535 YER/USD
- Humanitarian needs: 21.6 million people require assistance
- Food insecurity: 17+ million facing acute food insecurity
- Conflict status: Ongoing since 2015, fragile truce periods

Respond in the same language as the user's question.`;

// Evidence pack structure
export interface EvidencePack {
  sources: Array<{
    title: string;
    type: string;
    date: string;
    confidence: string;
    url?: string;
  }>;
  indicators: Array<{
    name: string;
    value: string;
    trend: "up" | "down" | "stable";
    regime?: string;
  }>;
  methodology?: string;
  caveats?: string[];
}

// Knowledge base for common queries
const KNOWLEDGE_BASE: Record<string, {
  answer: { en: string; ar: string };
  evidence: EvidencePack;
}> = {
  "exchange_rate": {
    answer: {
      en: "The current exchange rate shows a significant divergence between the two monetary authorities:\n\n**Aden (IRG):** ~1,890 YER/USD\n**Sana'a (DFA):** ~535 YER/USD\n\nThis represents a spread of approximately 253%, reflecting the economic fragmentation since 2016 when the Central Bank split.",
      ar: "يُظهر سعر الصرف الحالي تباينًا كبيرًا بين السلطتين النقديتين:\n\n**عدن (الشرعية):** ~1,890 ريال/دولار\n**صنعاء (الأمر الواقع):** ~535 ريال/دولار\n\nيمثل هذا فارقًا يبلغ حوالي 253%، مما يعكس التشرذم الاقتصادي منذ انقسام البنك المركزي في 2016."
    },
    evidence: {
      sources: [
        { title: "Central Bank of Yemen - Aden", type: "Official", date: "2024-12-28", confidence: "A" },
        { title: "Central Bank of Yemen - Sana'a", type: "Official", date: "2024-12-28", confidence: "A" },
        { title: "World Bank Yemen Economic Monitor", type: "Report", date: "2024-Q3", confidence: "A" }
      ],
      indicators: [
        { name: "Exchange Rate (Aden)", value: "1,890 YER/USD", trend: "down", regime: "IRG" },
        { name: "Exchange Rate (Sana'a)", value: "535 YER/USD", trend: "stable", regime: "DFA" },
        { name: "Spread", value: "253%", trend: "up" }
      ],
      methodology: "Official mid-market rates from both central banks, cross-referenced with parallel market data",
      caveats: [
        "Parallel market rates may differ by 5-10%",
        "Rates fluctuate daily based on remittance flows"
      ]
    }
  },
  "food_insecurity": {
    answer: {
      en: "Yemen faces one of the world's worst food crises:\n\n**17+ million people** are facing acute food insecurity (IPC Phase 3+)\n**5 million** are in emergency conditions (IPC Phase 4)\n**161,000** are in catastrophic conditions (IPC Phase 5)\n\nThe situation is driven by conflict, economic collapse, and reduced humanitarian funding.",
      ar: "يواجه اليمن واحدة من أسوأ أزمات الغذاء في العالم:\n\n**أكثر من 17 مليون شخص** يواجهون انعدام الأمن الغذائي الحاد (المرحلة 3+ من التصنيف المرحلي المتكامل)\n**5 ملايين** في حالة طوارئ (المرحلة 4)\n**161,000** في حالة كارثية (المرحلة 5)\n\nتتفاقم الأزمة بسبب الصراع والانهيار الاقتصادي وتراجع التمويل الإنساني."
    },
    evidence: {
      sources: [
        { title: "IPC Analysis - Yemen", type: "Assessment", date: "2024-10", confidence: "A" },
        { title: "WFP Yemen Situation Report", type: "Report", date: "2024-12", confidence: "A" },
        { title: "OCHA Yemen Humanitarian Needs Overview", type: "Report", date: "2024", confidence: "A" }
      ],
      indicators: [
        { name: "IPC 3+ Population", value: "17.1 million", trend: "up" },
        { name: "IPC 4 Population", value: "5 million", trend: "stable" },
        { name: "IPC 5 Population", value: "161,000", trend: "down" },
        { name: "Funding Gap", value: "58%", trend: "up" }
      ],
      methodology: "IPC Acute Food Insecurity Analysis conducted by WFP, FAO, and partners",
      caveats: [
        "Data collection limited in some conflict-affected areas",
        "Projections assume no major escalation"
      ]
    }
  },
  "humanitarian_funding": {
    answer: {
      en: "Humanitarian funding for Yemen has declined significantly:\n\n**2022:** $2.27 billion received (51% of appeal)\n**2023:** $1.97 billion received (42% of appeal)\n**2024:** $1.35 billion received (as of Dec, 29% of appeal)\n\nThe funding gap has widened despite persistent needs, forcing aid organizations to reduce operations.",
      ar: "انخفض التمويل الإنساني لليمن بشكل كبير:\n\n**2022:** 2.27 مليار دولار (51% من النداء)\n**2023:** 1.97 مليار دولار (42% من النداء)\n**2024:** 1.35 مليار دولار (حتى ديسمبر، 29% من النداء)\n\nاتسعت فجوة التمويل رغم استمرار الاحتياجات، مما أجبر المنظمات الإنسانية على تقليص عملياتها."
    },
    evidence: {
      sources: [
        { title: "OCHA Financial Tracking Service", type: "Database", date: "2024-12", confidence: "A" },
        { title: "Yemen Humanitarian Response Plan", type: "Appeal", date: "2024", confidence: "A" },
        { title: "UN OCHA Yemen Overview", type: "Report", date: "2024-12", confidence: "A" }
      ],
      indicators: [
        { name: "2024 Requirements", value: "$4.65 billion", trend: "stable" },
        { name: "2024 Received", value: "$1.35 billion", trend: "down" },
        { name: "Funding Gap", value: "71%", trend: "up" },
        { name: "YoY Change", value: "-31%", trend: "down" }
      ],
      methodology: "OCHA Financial Tracking Service aggregated donor contributions",
      caveats: [
        "Some bilateral aid not reported to FTS",
        "In-kind contributions may be underreported"
      ]
    }
  },
  "banking_sector": {
    answer: {
      en: "Yemen's banking sector faces multiple challenges:\n\n**Split System:** Two parallel central banks since 2016\n**Liquidity Crisis:** Limited access to foreign currency\n**Correspondent Banking:** Most international relationships severed\n**Digital Gap:** Limited electronic banking infrastructure\n\nDespite challenges, mobile money services have expanded significantly.",
      ar: "يواجه القطاع المصرفي اليمني تحديات متعددة:\n\n**نظام منقسم:** بنكان مركزيان متوازيان منذ 2016\n**أزمة سيولة:** محدودية الوصول للعملة الأجنبية\n**المراسلة المصرفية:** قطع معظم العلاقات الدولية\n**الفجوة الرقمية:** محدودية البنية التحتية للخدمات المصرفية الإلكترونية\n\nرغم التحديات، توسعت خدمات الأموال عبر الهاتف المحمول بشكل كبير."
    },
    evidence: {
      sources: [
        { title: "World Bank Financial Sector Assessment", type: "Report", date: "2024-Q2", confidence: "B" },
        { title: "IMF Article IV Consultation", type: "Report", date: "2023", confidence: "A" },
        { title: "Central Bank of Yemen Reports", type: "Official", date: "2024", confidence: "B" }
      ],
      indicators: [
        { name: "Active Banks", value: "18", trend: "stable" },
        { name: "Mobile Money Users", value: "2.1 million", trend: "up" },
        { name: "NPL Ratio (est.)", value: "45%+", trend: "up" },
        { name: "Deposit Base", value: "Declining", trend: "down" }
      ],
      methodology: "Compiled from central bank reports and international assessments",
      caveats: [
        "Limited transparency from both central banks",
        "NPL data is estimated due to reporting gaps"
      ]
    }
  }
};

/**
 * Detect query topic for knowledge base lookup
 */
function detectTopic(query: string): string | null {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes("exchange rate") || lowerQuery.includes("سعر الصرف") || 
      lowerQuery.includes("currency") || lowerQuery.includes("عملة") ||
      lowerQuery.includes("rial") || lowerQuery.includes("ريال")) {
    return "exchange_rate";
  }
  
  if (lowerQuery.includes("food") || lowerQuery.includes("غذاء") ||
      lowerQuery.includes("hunger") || lowerQuery.includes("جوع") ||
      lowerQuery.includes("ipc") || lowerQuery.includes("insecurity")) {
    return "food_insecurity";
  }
  
  if (lowerQuery.includes("funding") || lowerQuery.includes("تمويل") ||
      lowerQuery.includes("humanitarian") || lowerQuery.includes("إنساني") ||
      lowerQuery.includes("aid") || lowerQuery.includes("مساعدات")) {
    return "humanitarian_funding";
  }
  
  if (lowerQuery.includes("bank") || lowerQuery.includes("مصرف") ||
      lowerQuery.includes("financial") || lowerQuery.includes("مالي")) {
    return "banking_sector";
  }
  
  return null;
}

/**
 * Detect language of query
 */
function detectLanguage(text: string): "ar" | "en" {
  const arabicPattern = /[\u0600-\u06FF]/;
  return arabicPattern.test(text) ? "ar" : "en";
}

/**
 * Generate AI response using LLM
 */
export async function generateResponse(
  query: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>
): Promise<{
  content: string;
  evidence?: EvidencePack;
  confidence: "high" | "medium" | "low";
}> {
  const language = detectLanguage(query);
  const topic = detectTopic(query);
  
  // Check knowledge base first for common queries
  if (topic && KNOWLEDGE_BASE[topic]) {
    const kb = KNOWLEDGE_BASE[topic];
    return {
      content: language === "ar" ? kb.answer.ar : kb.answer.en,
      evidence: kb.evidence,
      confidence: "high"
    };
  }
  
  // Use LLM for other queries
  try {
    const messages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...conversationHistory.map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content
      })),
      { role: "user" as const, content: query }
    ];
    
    const response = await invokeLLM({ messages });
    
    const messageContent = response.choices[0]?.message?.content;
    const content = typeof messageContent === "string" 
      ? messageContent 
      : (language === "ar" 
        ? "عذراً، لم أتمكن من معالجة طلبك. يرجى المحاولة مرة أخرى."
        : "Sorry, I couldn't process your request. Please try again.");
    
    // Generate evidence pack based on response
    const evidence = generateEvidencePack(query, content, language);
    
    return {
      content,
      evidence,
      confidence: "medium"
    };
  } catch (error) {
    console.error("[OneBrain] LLM error:", error);
    
    return {
      content: language === "ar"
        ? "عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى لاحقاً."
        : "Sorry, an error occurred while processing your request. Please try again later.",
      confidence: "low"
    };
  }
}

/**
 * Generate evidence pack from response
 */
function generateEvidencePack(query: string, response: string, language: "ar" | "en"): EvidencePack {
  // Default evidence pack structure
  const evidence: EvidencePack = {
    sources: [
      {
        title: language === "ar" ? "قاعدة بيانات YETO" : "YETO Database",
        type: language === "ar" ? "قاعدة بيانات" : "Database",
        date: new Date().toISOString().split("T")[0],
        confidence: "B"
      }
    ],
    indicators: [],
    methodology: language === "ar" 
      ? "تحليل مدعوم بالذكاء الاصطناعي استناداً إلى مصادر متعددة"
      : "AI-assisted analysis based on multiple sources",
    caveats: [
      language === "ar"
        ? "قد تكون بعض البيانات تقديرية"
        : "Some data may be estimated"
    ]
  };
  
  // Extract numbers from response for indicators
  const numberPattern = /(\d+(?:,\d+)*(?:\.\d+)?)\s*(%|million|billion|YER|USD|ريال|مليون|مليار)/gi;
  const matches = Array.from(response.matchAll(numberPattern));
  
  for (const match of matches) {
    evidence.indicators.push({
      name: language === "ar" ? "مؤشر" : "Indicator",
      value: match[0],
      trend: "stable"
    });
    
    if (evidence.indicators.length >= 4) break;
  }
  
  return evidence;
}

/**
 * Get suggested follow-up questions
 */
export function getSuggestedQuestions(topic: string | null, language: "ar" | "en"): string[] {
  const suggestions: Record<string, { en: string[]; ar: string[] }> = {
    exchange_rate: {
      en: [
        "How has the exchange rate changed over the past year?",
        "What factors are driving the currency divergence?",
        "How does the exchange rate affect import prices?"
      ],
      ar: [
        "كيف تغير سعر الصرف خلال العام الماضي؟",
        "ما العوامل التي تدفع تباين العملة؟",
        "كيف يؤثر سعر الصرف على أسعار الواردات؟"
      ]
    },
    food_insecurity: {
      en: [
        "Which governorates are most affected?",
        "How has food insecurity changed since 2020?",
        "What is the impact of reduced humanitarian funding?"
      ],
      ar: [
        "ما هي المحافظات الأكثر تضرراً؟",
        "كيف تغير انعدام الأمن الغذائي منذ 2020؟",
        "ما تأثير تراجع التمويل الإنساني؟"
      ]
    },
    default: {
      en: [
        "What is the current economic situation in Yemen?",
        "How are humanitarian needs being addressed?",
        "What are the main economic challenges?"
      ],
      ar: [
        "ما هو الوضع الاقتصادي الحالي في اليمن؟",
        "كيف تتم معالجة الاحتياجات الإنسانية؟",
        "ما هي التحديات الاقتصادية الرئيسية؟"
      ]
    }
  };
  
  const topicSuggestions = suggestions[topic || "default"] || suggestions.default;
  return language === "ar" ? topicSuggestions.ar : topicSuggestions.en;
}
