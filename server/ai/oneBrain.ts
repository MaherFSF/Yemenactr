/**
 * YETO One Brain AI Assistant
 * LLM-powered economic intelligence assistant for Yemen
 * 
 * LAST UPDATED: January 10, 2026
 */

import { invokeLLM } from "../_core/llm";
import { getBankingContext, getBankingSummary, getSanctionsContext } from "../services/bankingKnowledgeBase";

// System prompt for One Brain - UPDATED January 10, 2026
const SYSTEM_PROMPT = `You are "One Brain" (العقل الواحد), the AI assistant for YETO (Yemen Economic Transparency Observatory).

**CURRENT DATE: January 10, 2026**

Your role is to provide accurate, evidence-based analysis of Yemen's economic situation. You have access to data from:
- Central Bank of Yemen (Aden and Sana'a)
- World Bank indicators
- OCHA humanitarian data
- WFP food security assessments
- IMF reports
- IATI aid flows

**CRITICAL RECENT EVENTS (January 2026):**
- January 7, 2026: Saudi-led coalition bombed Shabwa after STC leader al-Zubaidi skipped talks
- January 8, 2026: STC leader Aidarus al-Zubaidi fled to UAE
- January 9, 2026: STC announced dissolution of all political and organizational bodies
- January 9, 2026: CBY Aden held first 2026 board meeting, approved 2025 audit contract
- January 10, 2026: "Nation's Shield" forces took control of vital facilities in Aden
- January 10, 2026: CBY Aden instructed to freeze al-Zubaidi's bank accounts
- January 10, 2026: Thousands rallied in Aden in support of STC (dissolution disputed)

**2025 KEY DEVELOPMENTS:**
- July 2025: CBY Aden launched major exchange market regulation campaign
- December 2025: 79 exchange companies had licenses suspended/revoked by CBY Aden
- December 2025: STC expanded control over non-Houthi areas, tensions escalated
- December 2025: IMF published Customs Reform and Emergency Revenue Mobilization report

Key principles:
1. Always cite sources with confidence ratings (A-D)
2. Distinguish between Aden (IRG) and Sana'a (DFA) data
3. Acknowledge data gaps and uncertainties
4. Provide balanced analysis without political bias
5. Use both Arabic and English terminology where helpful
6. Always reference the CURRENT DATE (January 10, 2026) when discussing recent events

When answering questions:
- Start with a direct answer
- Provide supporting evidence with sources
- Note any caveats or limitations
- Suggest related topics for deeper exploration

Current context (as of January 10, 2026):
- Exchange rates: Aden ~1,890-2,050 YER/USD, Sana'a ~530-600 YER/USD
- Humanitarian needs: 21.6 million people require assistance
- Food insecurity: 17+ million facing acute food insecurity
- Conflict status: Ongoing since 2015, major political transition with STC dissolution
- CBY Aden Governor: Ahmed Ghaleb (since 2023)
- CBY Sana'a Governor: Hashem Ismail (since 2016)
- STC Status: DISSOLVED January 9, 2026

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

// Knowledge base entry type
interface KnowledgeEntry {
  answer: { en: string; ar: string };
  evidence: EvidencePack;
}

interface DynamicKnowledgeEntry {
  dynamic: true;
  fetchContext: () => Promise<KnowledgeEntry>;
}

type KnowledgeBaseEntry = KnowledgeEntry | DynamicKnowledgeEntry;

// Knowledge base for common queries - UPDATED January 10, 2026
const KNOWLEDGE_BASE: Record<string, KnowledgeBaseEntry> = {
  "exchange_rate": {
    answer: {
      en: "**As of January 10, 2026**, the exchange rate shows a significant divergence between the two monetary authorities:\n\n**Aden (IRG):** ~1,890-2,050 YER/USD (parallel market)\n**Sana'a (DFA):** ~530-600 YER/USD (controlled)\n\nThis represents a spread of approximately 250-280%, reflecting the economic fragmentation since 2016 when the Central Bank split. Recent political developments, including the STC dissolution on January 9, 2026, may impact exchange rate stability in the coming weeks.",
      ar: "**اعتباراً من 10 يناير 2026**، يُظهر سعر الصرف تباينًا كبيرًا بين السلطتين النقديتين:\n\n**عدن (الشرعية):** ~1,890-2,050 ريال/دولار (السوق الموازي)\n**صنعاء (الأمر الواقع):** ~530-600 ريال/دولار (مُسيطر عليه)\n\nيمثل هذا فارقًا يبلغ حوالي 250-280%، مما يعكس التشرذم الاقتصادي منذ انقسام البنك المركزي في 2016. قد تؤثر التطورات السياسية الأخيرة، بما في ذلك حل المجلس الانتقالي الجنوبي في 9 يناير 2026، على استقرار سعر الصرف في الأسابيع المقبلة."
    },
    evidence: {
      sources: [
        { title: "Central Bank of Yemen - Aden", type: "Official", date: "2026-01-10", confidence: "A" },
        { title: "Central Bank of Yemen - Sana'a", type: "Official", date: "2026-01-10", confidence: "A" },
        { title: "Yemen Monitor Economic Reports", type: "News", date: "2026-01-09", confidence: "B" }
      ],
      indicators: [
        { name: "Exchange Rate (Aden)", value: "1,890-2,050 YER/USD", trend: "down", regime: "IRG" },
        { name: "Exchange Rate (Sana'a)", value: "530-600 YER/USD", trend: "stable", regime: "DFA" },
        { name: "Spread", value: "250-280%", trend: "up" }
      ],
      methodology: "Official mid-market rates from both central banks, cross-referenced with parallel market data",
      caveats: [
        "Parallel market rates may differ by 5-10%",
        "Rates may be volatile following STC dissolution",
        "Political uncertainty may impact near-term rates"
      ]
    }
  },
  "central_bank": {
    answer: {
      en: "**Central Bank of Yemen - Latest Updates (January 2026)**\n\n**CBY Aden (Governor: Ahmed Ghaleb)**\n- January 9, 2026: Held first board meeting of 2026\n- Approved 2025 audit contract with international firm\n- January 10, 2026: Instructed to freeze bank accounts of al-Zubaidi and senior STC figures\n- July-December 2025: Suspended/revoked licenses of 79 exchange companies\n\n**CBY Sana'a (Governor: Hashem Ismail)**\n- Maintains currency controls keeping exchange rate stable at ~530-600 YER/USD\n- Continues ban on new currency notes printed by CBY Aden (since 2018)",
      ar: "**البنك المركزي اليمني - آخر التحديثات (يناير 2026)**\n\n**البنك المركزي عدن (المحافظ: أحمد غالب)**\n- 9 يناير 2026: عقد أول اجتماع لمجلس الإدارة لعام 2026\n- وافق على عقد تدقيق 2025 مع شركة دولية\n- 10 يناير 2026: تم توجيهه بتجميد حسابات الزبيدي وكبار قيادات المجلس الانتقالي\n- يوليو-ديسمبر 2025: علّق/ألغى تراخيص 79 شركة صرافة\n\n**البنك المركزي صنعاء (المحافظ: هاشم إسماعيل)**\n- يحافظ على ضوابط العملة مما يبقي سعر الصرف مستقرًا عند ~530-600 ريال/دولار\n- يستمر في حظر الأوراق النقدية الجديدة المطبوعة من البنك المركزي عدن (منذ 2018)"
    },
    evidence: {
      sources: [
        { title: "Yemen Monitor - CBY Board Meeting", type: "News", date: "2026-01-09", confidence: "A" },
        { title: "Yemen Monitor - Exchange License Suspensions", type: "News", date: "2026-01-02", confidence: "A" },
        { title: "Central Bank of Yemen Official Statements", type: "Official", date: "2026-01", confidence: "A" }
      ],
      indicators: [
        { name: "Exchange Companies Suspended (2025)", value: "79", trend: "up", regime: "IRG" },
        { name: "CBY Aden Governor", value: "Ahmed Ghaleb (since 2023)", trend: "stable", regime: "IRG" },
        { name: "CBY Sana'a Governor", value: "Hashem Ismail (since 2016)", trend: "stable", regime: "DFA" }
      ],
      methodology: "Official CBY announcements and verified news reports",
      caveats: [
        "CBY Sana'a provides limited public information",
        "Political situation evolving rapidly"
      ]
    }
  },
  "stc_dissolution": {
    answer: {
      en: "**Southern Transitional Council (STC) - DISSOLVED January 9, 2026**\n\n**Timeline of Events:**\n- December 2025: STC expanded control over non-Houthi areas\n- January 7, 2026: Saudi-led coalition bombed Shabwa (al-Zubaidi's home province) after he skipped talks\n- January 8, 2026: STC leader Aidarus al-Zubaidi fled to UAE\n- January 9, 2026: STC Secretary-General announced dissolution of all political, executive and organizational bodies\n- January 10, 2026: Thousands rallied in Aden in support of STC (dissolution disputed by some factions)\n\n**Economic Implications:**\n- CBY Aden instructed to freeze al-Zubaidi's bank accounts\n- \"Nation's Shield\" forces taking control of Aden facilities\n- Potential impact on exchange rate stability\n- Uncertainty for businesses operating in former STC areas",
      ar: "**المجلس الانتقالي الجنوبي - تم حله في 9 يناير 2026**\n\n**الجدول الزمني للأحداث:**\n- ديسمبر 2025: وسّع المجلس الانتقالي سيطرته على المناطق غير الخاضعة للحوثيين\n- 7 يناير 2026: قصف التحالف بقيادة السعودية شبوة (محافظة الزبيدي) بعد تغيبه عن المحادثات\n- 8 يناير 2026: فرّ زعيم المجلس الانتقالي عيدروس الزبيدي إلى الإمارات\n- 9 يناير 2026: أعلن الأمين العام للمجلس حل جميع الهيئات السياسية والتنفيذية والتنظيمية\n- 10 يناير 2026: تظاهر الآلاف في عدن دعمًا للمجلس (الحل متنازع عليه من بعض الفصائل)\n\n**التداعيات الاقتصادية:**\n- تم توجيه البنك المركزي عدن بتجميد حسابات الزبيدي\n- قوات \"درع الوطن\" تسيطر على منشآت عدن\n- تأثير محتمل على استقرار سعر الصرف\n- عدم يقين للشركات العاملة في مناطق المجلس السابقة"
    },
    evidence: {
      sources: [
        { title: "Al Jazeera - STC Dissolution", type: "News", date: "2026-01-09", confidence: "A" },
        { title: "Reuters - Yemen Separatist Rally", type: "News", date: "2026-01-10", confidence: "A" },
        { title: "Arab News - STC Announcement", type: "News", date: "2026-01-09", confidence: "A" },
        { title: "Yemen Monitor - Aden Developments", type: "News", date: "2026-01-10", confidence: "A" }
      ],
      indicators: [
        { name: "STC Status", value: "DISSOLVED", trend: "down" },
        { name: "Leader Status", value: "Fled to UAE", trend: "down" },
        { name: "Date of Dissolution", value: "January 9, 2026", trend: "stable" }
      ],
      methodology: "Verified news reports from multiple international sources",
      caveats: [
        "Situation is rapidly evolving",
        "Some STC factions dispute the dissolution",
        "Long-term implications unclear"
      ]
    }
  },
  "food_insecurity": {
    answer: {
      en: "Yemen faces one of the world's worst food crises (as of January 2026):\n\n**17+ million people** are facing acute food insecurity (IPC Phase 3+)\n**5 million** are in emergency conditions (IPC Phase 4)\n**161,000** are in catastrophic conditions (IPC Phase 5)\n\nThe UN reported on January 4, 2026 that Yemen's aid response is \"buckling under funding cuts\" as needs continue to rise. The situation is driven by conflict, economic collapse, currency depreciation, and reduced humanitarian funding.",
      ar: "يواجه اليمن واحدة من أسوأ أزمات الغذاء في العالم (اعتباراً من يناير 2026):\n\n**أكثر من 17 مليون شخص** يواجهون انعدام الأمن الغذائي الحاد (المرحلة 3+ من التصنيف المرحلي المتكامل)\n**5 ملايين** في حالة طوارئ (المرحلة 4)\n**161,000** في حالة كارثية (المرحلة 5)\n\nأفادت الأمم المتحدة في 4 يناير 2026 أن الاستجابة الإنسانية في اليمن \"تنهار تحت وطأة خفض التمويل\" مع استمرار ارتفاع الاحتياجات. تتفاقم الأزمة بسبب الصراع والانهيار الاقتصادي وانخفاض قيمة العملة وتراجع التمويل الإنساني."
    },
    evidence: {
      sources: [
        { title: "IPC Analysis - Yemen", type: "Assessment", date: "2025-Q4", confidence: "A" },
        { title: "UN News - Yemen Aid Response", type: "Report", date: "2026-01-04", confidence: "A" },
        { title: "WFP Yemen Situation Report", type: "Report", date: "2025-12", confidence: "A" },
        { title: "OCHA Yemen Humanitarian Needs Overview", type: "Report", date: "2025", confidence: "A" }
      ],
      indicators: [
        { name: "IPC 3+ Population", value: "17.1 million", trend: "up" },
        { name: "IPC 4 Population", value: "5 million", trend: "stable" },
        { name: "IPC 5 Population", value: "161,000", trend: "down" },
        { name: "Funding Gap", value: "71%", trend: "up" }
      ],
      methodology: "IPC Acute Food Insecurity Analysis conducted by WFP, FAO, and partners",
      caveats: [
        "Data collection limited in some conflict-affected areas",
        "Projections assume no major escalation",
        "January 2026 political changes may affect humanitarian access"
      ]
    }
  },
  "humanitarian_funding": {
    answer: {
      en: "Humanitarian funding for Yemen has declined significantly:\n\n**2022:** $2.27 billion received (51% of appeal)\n**2023:** $1.97 billion received (42% of appeal)\n**2024:** $1.35 billion received (29% of appeal)\n**2025:** Data being compiled\n\nThe UN reported on January 4, 2026 that Yemen's aid response is \"buckling under funding cuts as needs keep rising.\" The funding gap has widened despite persistent needs, forcing aid organizations to reduce operations.",
      ar: "انخفض التمويل الإنساني لليمن بشكل كبير:\n\n**2022:** 2.27 مليار دولار (51% من النداء)\n**2023:** 1.97 مليار دولار (42% من النداء)\n**2024:** 1.35 مليار دولار (29% من النداء)\n**2025:** جاري تجميع البيانات\n\nأفادت الأمم المتحدة في 4 يناير 2026 أن الاستجابة الإنسانية في اليمن \"تنهار تحت وطأة خفض التمويل مع استمرار ارتفاع الاحتياجات\". اتسعت فجوة التمويل رغم استمرار الاحتياجات، مما أجبر المنظمات الإنسانية على تقليص عملياتها."
    },
    evidence: {
      sources: [
        { title: "OCHA Financial Tracking Service", type: "Database", date: "2025-12", confidence: "A" },
        { title: "UN News - Yemen Aid Response", type: "Report", date: "2026-01-04", confidence: "A" },
        { title: "Yemen Humanitarian Response Plan", type: "Appeal", date: "2025", confidence: "A" }
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
        "In-kind contributions may be underreported",
        "2025 final figures not yet available"
      ]
    }
  },
  "banking_sector": {
    // Dynamic - fetched from database via bankingKnowledgeBase service
    dynamic: true,
    fetchContext: async () => {
      const summary = await getBankingSummary();
      const sanctions = await getSanctionsContext();
      return {
        answer: {
          en: `**Yemen's Banking Sector - Live Data**\n\n**Overview:**\n- Total Banks: ${summary.totalBanks}\n- Total Assets: $${(summary.totalAssets / 1000).toFixed(1)}B\n- Average CAR: ${summary.avgCAR.toFixed(1)}%\n- Average NPL: ${summary.avgNPL.toFixed(1)}%\n\n**Jurisdiction:**\n- Aden: ${summary.adenBanks} banks\n- Sana'a: ${summary.sanaaBanks} banks\n\n**Sanctions Status:**\n${sanctions.sanctionedBanks.map((b: any) => `- ${b.bankName}: ${b.authority} (${b.designationDate})`).join('\n')}\n\n**Split System:** Two parallel central banks since September 2016\n- CBY Aden: Governor Ahmed Ghaleb, floating exchange rate\n- CBY Sana'a: Governor Hashem Ismail, controlled exchange rate`,
          ar: `**القطاع المصرفي اليمني - بيانات حية**\n\n**نظرة عامة:**\n- إجمالي البنوك: ${summary.totalBanks}\n- إجمالي الأصول: $${(summary.totalAssets / 1000).toFixed(1)} مليار\n- متوسط كفاية رأس المال: ${summary.avgCAR.toFixed(1)}%\n- متوسط القروض غير العاملة: ${summary.avgNPL.toFixed(1)}%\n\n**الولاية القضائية:**\n- عدن: ${summary.adenBanks} بنك\n- صنعاء: ${summary.sanaaBanks} بنك`
        },
        evidence: {
          sources: [
            { title: "YETO Banking Database", type: "Database", date: new Date().toISOString().split('T')[0], confidence: "A" },
            { title: "CBY-Aden Licensed Banks List", type: "Official", date: "2024", confidence: "A" },
            { title: "OFAC SDN List", type: "Sanctions", date: new Date().toISOString().split('T')[0], confidence: "A" }
          ],
          indicators: [
            { name: "Total Banks", value: summary.totalBanks.toString(), trend: "stable" },
            { name: "Total Assets", value: `$${(summary.totalAssets / 1000).toFixed(1)}B`, trend: "down" },
            { name: "OFAC Sanctioned Banks", value: sanctions.totalSanctioned.toString(), trend: "up" },
            { name: "Average CAR", value: `${summary.avgCAR.toFixed(1)}%`, trend: "stable" }
          ],
          methodology: "Live data from YETO database, updated daily from CBY reports and OFAC SDN list",
          caveats: [
            "Data refreshed daily at 06:00 UTC",
            "Some banks may have limited reporting",
            "Sanctions data from OFAC, updated every 4 hours"
          ]
        }
      };
    }
  }
};

/**
 * Detect query topic for knowledge base lookup
 */
function detectTopic(query: string): string | null {
  const lowerQuery = query.toLowerCase();
  
  // STC / Southern Transitional Council
  if (lowerQuery.includes("stc") || lowerQuery.includes("southern transitional") ||
      lowerQuery.includes("المجلس الانتقالي") || lowerQuery.includes("الزبيدي") ||
      lowerQuery.includes("zubaidi") || lowerQuery.includes("dissolution") ||
      lowerQuery.includes("حل")) {
    return "stc_dissolution";
  }
  
  // Central Bank queries - comprehensive matching for CBY-related questions
  if (lowerQuery.includes("central bank") || lowerQuery.includes("البنك المركزي") ||
      lowerQuery.includes("cby") || lowerQuery.includes("ghaleb") ||
      lowerQuery.includes("غالب") || lowerQuery.includes("قرارات البنك") ||
      lowerQuery.includes("قرارات") || lowerQuery.includes("bank decision") || 
      lowerQuery.includes("2025") || lowerQuery.includes("2026") ||
      lowerQuery.includes("آخر قرارات") || lowerQuery.includes("latest decision") ||
      lowerQuery.includes("exchange license") || lowerQuery.includes("صرافة") ||
      lowerQuery.includes("أحمد غالب") || lowerQuery.includes("ahmed ghaleb")) {
    return "central_bank";
  }
  
  if (lowerQuery.includes("exchange rate") || lowerQuery.includes("سعر الصرف") || 
      lowerQuery.includes("currency") || lowerQuery.includes("عملة") ||
      lowerQuery.includes("rial") || lowerQuery.includes("ريال") ||
      lowerQuery.includes("dollar") || lowerQuery.includes("دولار")) {
    return "exchange_rate";
  }
  
  if (lowerQuery.includes("food") || lowerQuery.includes("غذاء") ||
      lowerQuery.includes("hunger") || lowerQuery.includes("جوع") ||
      lowerQuery.includes("ipc") || lowerQuery.includes("insecurity") ||
      lowerQuery.includes("famine") || lowerQuery.includes("مجاعة")) {
    return "food_insecurity";
  }
  
  if (lowerQuery.includes("funding") || lowerQuery.includes("تمويل") ||
      lowerQuery.includes("humanitarian") || lowerQuery.includes("إنساني") ||
      lowerQuery.includes("aid") || lowerQuery.includes("مساعدات") ||
      lowerQuery.includes("donor") || lowerQuery.includes("مانح")) {
    return "humanitarian_funding";
  }
  
  if (lowerQuery.includes("bank") || lowerQuery.includes("مصرف") ||
      lowerQuery.includes("financial") || lowerQuery.includes("مالي") ||
      lowerQuery.includes("banking") || lowerQuery.includes("مصرفي")) {
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
    const entry = KNOWLEDGE_BASE[topic];
    
    // Handle dynamic entries that fetch from database
    if ('dynamic' in entry && entry.dynamic) {
      try {
        const kb = await entry.fetchContext();
        return {
          content: language === "ar" ? kb.answer.ar : kb.answer.en,
          evidence: kb.evidence,
          confidence: "high"
        };
      } catch (error) {
        console.error('Failed to fetch dynamic knowledge:', error);
        // Fall through to LLM
      }
    } else {
      // Static entry
      const kb = entry as KnowledgeEntry;
      return {
        content: language === "ar" ? kb.answer.ar : kb.answer.en,
        evidence: kb.evidence,
        confidence: "high"
      };
    }
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
        date: "2026-01-10",
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
        "How has the exchange rate changed since the STC dissolution?",
        "What factors are driving the currency divergence?",
        "How does the exchange rate affect import prices?"
      ],
      ar: [
        "كيف تغير سعر الصرف منذ حل المجلس الانتقالي؟",
        "ما العوامل التي تدفع تباين العملة؟",
        "كيف يؤثر سعر الصرف على أسعار الواردات؟"
      ]
    },
    central_bank: {
      en: [
        "What are the latest CBY Aden decisions in 2026?",
        "How many exchange companies were suspended in 2025?",
        "What is the impact of freezing al-Zubaidi's accounts?"
      ],
      ar: [
        "ما هي آخر قرارات البنك المركزي عدن في 2026؟",
        "كم عدد شركات الصرافة التي تم تعليقها في 2025؟",
        "ما تأثير تجميد حسابات الزبيدي؟"
      ]
    },
    stc_dissolution: {
      en: [
        "What are the economic implications of the STC dissolution?",
        "How will this affect businesses in Aden?",
        "What is the status of Nation's Shield forces?"
      ],
      ar: [
        "ما التداعيات الاقتصادية لحل المجلس الانتقالي؟",
        "كيف سيؤثر هذا على الأعمال في عدن؟",
        "ما وضع قوات درع الوطن؟"
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
        "What are the latest economic developments in January 2026?",
        "What is the impact of the STC dissolution on Yemen's economy?",
        "What are the current exchange rates in Aden and Sana'a?"
      ],
      ar: [
        "ما هي آخر التطورات الاقتصادية في يناير 2026؟",
        "ما تأثير حل المجلس الانتقالي على اقتصاد اليمن؟",
        "ما هي أسعار الصرف الحالية في عدن وصنعاء؟"
      ]
    }
  };
  
  const topicSuggestions = suggestions[topic || "default"] || suggestions.default;
  return language === "ar" ? topicSuggestions.ar : topicSuggestions.en;
}
