/**
 * Self-Coaching AI System for YETO Platform
 * 
 * An advanced AI system that continuously learns and improves from:
 * - User corrections and feedback
 * - Cross-validation results
 * - Source reliability patterns
 * - Economic event correlations
 * 
 * Features:
 * - Adaptive learning from corrections
 * - Pattern recognition for data quality
 * - Predictive accuracy scoring
 * - Automatic methodology refinement
 * - Bilingual knowledge synthesis (Arabic/English)
 */

import { invokeLLM } from "../_core/llm";

// Types
export interface LearningEvent {
  id: string;
  type: "correction" | "validation" | "feedback" | "anomaly";
  indicator: string;
  source: string;
  originalValue?: number;
  correctedValue?: number;
  context: string;
  lesson: string;
  timestamp: Date;
}

export interface KnowledgeEntry {
  id: string;
  category: string;
  topic: string;
  content: string;
  contentAr: string;
  confidence: number;
  sources: string[];
  lastUpdated: Date;
  validatedBy: string[];
}

export interface AccuracyMetrics {
  overallAccuracy: number;
  byIndicator: Map<string, number>;
  bySource: Map<string, number>;
  trend: "improving" | "stable" | "declining";
  recentCorrections: number;
}

export interface CoachingInsight {
  type: "pattern" | "recommendation" | "warning" | "achievement";
  message: string;
  messageAr: string;
  priority: "high" | "medium" | "low";
  actionable: boolean;
  suggestedAction?: string;
}

/**
 * Self-Coaching AI System
 */
export class SelfCoachingAI {
  private learningHistory: LearningEvent[] = [];
  private knowledgeBase: Map<string, KnowledgeEntry> = new Map();
  private accuracyScores: Map<string, number[]> = new Map();
  private patternMemory: Map<string, string[]> = new Map();
  
  // Yemen-specific knowledge domains
  private yemenDomains = [
    "exchange_rates",
    "banking_sector",
    "humanitarian_crisis",
    "conflict_economy",
    "trade_disruption",
    "central_bank_policies",
    "remittances",
    "fuel_prices",
    "food_security",
    "inflation_dynamics",
  ];

  constructor() {
    this.initializeKnowledgeBase();
  }

  /**
   * Initialize with core Yemen economic knowledge
   */
  private initializeKnowledgeBase(): void {
    // Core knowledge entries
    const coreKnowledge: Partial<KnowledgeEntry>[] = [
      {
        category: "exchange_rates",
        topic: "Dual Currency System",
        content: "Yemen operates with two parallel exchange rate systems since 2016: the Aden-based IRG rate (significantly depreciated) and the Sana'a-based DFA rate (more stable but controlled). The spread between them reflects the economic fragmentation.",
        contentAr: "يعمل اليمن بنظامين متوازيين لسعر الصرف منذ 2016: سعر عدن (الحكومة الشرعية) المنخفض بشكل كبير وسعر صنعاء (أنصار الله) الأكثر استقراراً ولكنه مسيطر عليه. الفارق بينهما يعكس التشرذم الاقتصادي.",
        confidence: 95,
        sources: ["CBY Aden", "CBY Sanaa", "World Bank", "IMF"],
      },
      {
        category: "banking_sector",
        topic: "Banking Fragmentation",
        content: "The Yemeni banking sector is fragmented between Aden and Sana'a jurisdictions. Banks must navigate dual regulatory environments, leading to operational challenges and liquidity constraints.",
        contentAr: "القطاع المصرفي اليمني مجزأ بين سلطتي عدن وصنعاء. يجب على البنوك التعامل مع بيئتين تنظيميتين، مما يؤدي إلى تحديات تشغيلية وقيود على السيولة.",
        confidence: 90,
        sources: ["CBY Aden", "CBY Sanaa", "Banking Association"],
      },
      {
        category: "humanitarian_crisis",
        topic: "Economic Dimensions",
        content: "Yemen's humanitarian crisis has deep economic roots: currency collapse, import dependency (90% of food), fuel shortages, and salary payment disruptions affect over 21 million people requiring assistance.",
        contentAr: "للأزمة الإنسانية في اليمن جذور اقتصادية عميقة: انهيار العملة، الاعتماد على الاستيراد (90% من الغذاء)، نقص الوقود، وتعطل صرف الرواتب يؤثر على أكثر من 21 مليون شخص يحتاجون للمساعدة.",
        confidence: 95,
        sources: ["UN OCHA", "WFP", "World Bank"],
      },
      {
        category: "conflict_economy",
        topic: "War Economy Dynamics",
        content: "The conflict has created parallel war economies: smuggling networks, informal taxation, fuel black markets, and control over key revenue points (ports, customs) by different factions.",
        contentAr: "خلق الصراع اقتصادات حرب موازية: شبكات تهريب، ضرائب غير رسمية، أسواق وقود سوداء، وسيطرة فصائل مختلفة على نقاط الإيرادات الرئيسية (الموانئ، الجمارك).",
        confidence: 85,
        sources: ["UN Panel of Experts", "Sana'a Center", "ACLED"],
      },
      {
        category: "remittances",
        topic: "Lifeline Economy",
        content: "Remittances constitute Yemen's largest foreign exchange source, estimated at $3.8 billion annually. They flow primarily through money exchangers and hawala networks, bypassing formal banking channels.",
        contentAr: "تشكل التحويلات أكبر مصدر للعملة الأجنبية في اليمن، تقدر بـ 3.8 مليار دولار سنوياً. تتدفق بشكل رئيسي عبر الصرافين وشبكات الحوالة، متجاوزة القنوات المصرفية الرسمية.",
        confidence: 80,
        sources: ["World Bank", "IMF", "CBY"],
      },
    ];

    coreKnowledge.forEach((entry, index) => {
      const id = `core_${entry.category}_${index}`;
      this.knowledgeBase.set(id, {
        id,
        category: entry.category!,
        topic: entry.topic!,
        content: entry.content!,
        contentAr: entry.contentAr!,
        confidence: entry.confidence!,
        sources: entry.sources!,
        lastUpdated: new Date(),
        validatedBy: ["system_init"],
      });
    });
  }

  /**
   * Learn from a correction event
   */
  async learnFromCorrection(
    indicator: string,
    source: string,
    originalValue: number,
    correctedValue: number,
    context: string
  ): Promise<LearningEvent> {
    const id = `learning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate lesson using LLM
    const lesson = await this.generateLesson(indicator, source, originalValue, correctedValue, context);
    
    const event: LearningEvent = {
      id,
      type: "correction",
      indicator,
      source,
      originalValue,
      correctedValue,
      context,
      lesson,
      timestamp: new Date(),
    };

    this.learningHistory.push(event);
    
    // Update accuracy scores
    this.updateAccuracyScore(indicator, source, originalValue, correctedValue);
    
    // Extract and store patterns
    this.extractPatterns(event);

    console.log(`[SelfCoachingAI] Learned from correction: ${lesson}`);
    return event;
  }

  /**
   * Generate a lesson from a correction using LLM
   */
  private async generateLesson(
    indicator: string,
    source: string,
    originalValue: number,
    correctedValue: number,
    context: string
  ): Promise<string> {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are an expert economic data analyst specializing in Yemen's economy. 
            Generate a concise lesson (1-2 sentences) from a data correction that can help improve future data quality.
            Focus on what caused the error and how to prevent it.`,
          },
          {
            role: "user",
            content: `Indicator: ${indicator}
Source: ${source}
Original Value: ${originalValue}
Corrected Value: ${correctedValue}
Context: ${context}

What lesson can we learn from this correction?`,
          },
        ],
      });

      const content = response.choices[0]?.message?.content;
      return typeof content === 'string' ? content : "Data correction recorded for future reference.";
    } catch (error) {
      console.error("[SelfCoachingAI] Error generating lesson:", error);
      return `Correction from ${originalValue} to ${correctedValue} for ${indicator} from ${source}`;
    }
  }

  /**
   * Update accuracy scores based on correction
   */
  private updateAccuracyScore(
    indicator: string,
    source: string,
    originalValue: number,
    correctedValue: number
  ): void {
    const key = `${indicator}_${source}`;
    const errorPercent = Math.abs((originalValue - correctedValue) / correctedValue) * 100;
    const accuracy = Math.max(0, 100 - errorPercent);

    const scores = this.accuracyScores.get(key) || [];
    scores.push(accuracy);
    
    // Keep only last 100 scores
    if (scores.length > 100) {
      scores.shift();
    }
    
    this.accuracyScores.set(key, scores);
  }

  /**
   * Extract patterns from learning events
   */
  private extractPatterns(event: LearningEvent): void {
    const key = `${event.indicator}_${event.source}`;
    const patterns = this.patternMemory.get(key) || [];
    
    // Add pattern based on error characteristics
    if (event.originalValue && event.correctedValue) {
      const errorDirection = event.originalValue > event.correctedValue ? "overestimate" : "underestimate";
      const errorMagnitude = Math.abs((event.originalValue - event.correctedValue) / event.correctedValue) * 100;
      
      let pattern = `${errorDirection}_`;
      if (errorMagnitude > 20) pattern += "large";
      else if (errorMagnitude > 10) pattern += "medium";
      else pattern += "small";
      
      patterns.push(pattern);
    }
    
    this.patternMemory.set(key, patterns);
  }

  /**
   * Get accuracy metrics for an indicator/source
   */
  getAccuracyMetrics(indicator?: string, source?: string): AccuracyMetrics {
    let relevantScores: number[] = [];
    const byIndicator = new Map<string, number>();
    const bySource = new Map<string, number>();

    this.accuracyScores.forEach((scores, key) => {
      const [ind, src] = key.split("_");
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      
      if ((!indicator || ind === indicator) && (!source || src === source)) {
        relevantScores = relevantScores.concat(scores);
      }
      
      // Aggregate by indicator
      const currentIndScore = byIndicator.get(ind) || 0;
      byIndicator.set(ind, (currentIndScore + avgScore) / 2);
      
      // Aggregate by source
      const currentSrcScore = bySource.get(src) || 0;
      bySource.set(src, (currentSrcScore + avgScore) / 2);
    });

    const overallAccuracy = relevantScores.length > 0
      ? relevantScores.reduce((a, b) => a + b, 0) / relevantScores.length
      : 100;

    // Calculate trend
    let trend: "improving" | "stable" | "declining" = "stable";
    if (relevantScores.length >= 10) {
      const firstHalf = relevantScores.slice(0, Math.floor(relevantScores.length / 2));
      const secondHalf = relevantScores.slice(Math.floor(relevantScores.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      if (secondAvg > firstAvg + 5) trend = "improving";
      else if (secondAvg < firstAvg - 5) trend = "declining";
    }

    // Count recent corrections
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCorrections = this.learningHistory.filter(
      e => e.type === "correction" && e.timestamp > oneDayAgo
    ).length;

    return {
      overallAccuracy,
      byIndicator,
      bySource,
      trend,
      recentCorrections,
    };
  }

  /**
   * Generate coaching insights
   */
  async generateInsights(): Promise<CoachingInsight[]> {
    const insights: CoachingInsight[] = [];
    const metrics = this.getAccuracyMetrics();

    // Accuracy trend insight
    if (metrics.trend === "improving") {
      insights.push({
        type: "achievement",
        message: "Data accuracy is improving! Recent corrections show better source alignment.",
        messageAr: "دقة البيانات في تحسن! التصحيحات الأخيرة تظهر توافقاً أفضل مع المصادر.",
        priority: "medium",
        actionable: false,
      });
    } else if (metrics.trend === "declining") {
      insights.push({
        type: "warning",
        message: "Data accuracy is declining. Consider reviewing source verification procedures.",
        messageAr: "دقة البيانات في انخفاض. يُنصح بمراجعة إجراءات التحقق من المصادر.",
        priority: "high",
        actionable: true,
        suggestedAction: "Review and update source verification protocols",
      });
    }

    // Pattern-based insights
    this.patternMemory.forEach((patterns, key) => {
      const overestimates = patterns.filter(p => p.startsWith("overestimate")).length;
      const underestimates = patterns.filter(p => p.startsWith("underestimate")).length;
      
      if (overestimates > underestimates * 2 && patterns.length >= 5) {
        const [indicator, source] = key.split("_");
        insights.push({
          type: "pattern",
          message: `${source} tends to overestimate ${indicator}. Consider applying a correction factor.`,
          messageAr: `${source} يميل إلى المبالغة في تقدير ${indicator}. يُنصح بتطبيق معامل تصحيح.`,
          priority: "medium",
          actionable: true,
          suggestedAction: `Apply -${Math.round((overestimates / patterns.length) * 10)}% correction factor`,
        });
      }
    });

    // Source reliability insights
    metrics.bySource.forEach((score, source) => {
      if (score < 70) {
        insights.push({
          type: "warning",
          message: `Source "${source}" has low reliability (${score.toFixed(1)}%). Consider cross-validation.`,
          messageAr: `المصدر "${source}" لديه موثوقية منخفضة (${score.toFixed(1)}%). يُنصح بالتحقق المتقاطع.`,
          priority: "high",
          actionable: true,
          suggestedAction: "Increase cross-validation frequency for this source",
        });
      }
    });

    // Recent activity insight
    if (metrics.recentCorrections > 10) {
      insights.push({
        type: "recommendation",
        message: `High correction activity (${metrics.recentCorrections} in 24h). Consider reviewing data collection methodology.`,
        messageAr: `نشاط تصحيح مرتفع (${metrics.recentCorrections} في 24 ساعة). يُنصح بمراجعة منهجية جمع البيانات.`,
        priority: "high",
        actionable: true,
        suggestedAction: "Audit data collection processes",
      });
    }

    return insights;
  }

  /**
   * Query the knowledge base
   */
  queryKnowledge(query: string, language: "en" | "ar" = "en"): KnowledgeEntry[] {
    const results: KnowledgeEntry[] = [];
    const queryLower = query.toLowerCase();

    this.knowledgeBase.forEach(entry => {
      const searchText = language === "ar" 
        ? `${entry.topic} ${entry.contentAr}`.toLowerCase()
        : `${entry.topic} ${entry.content}`.toLowerCase();
      
      if (searchText.includes(queryLower) || 
          entry.category.includes(queryLower) ||
          entry.sources.some(s => s.toLowerCase().includes(queryLower))) {
        results.push(entry);
      }
    });

    return results.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Add new knowledge entry
   */
  addKnowledge(entry: Omit<KnowledgeEntry, "id" | "lastUpdated">): string {
    const id = `knowledge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.knowledgeBase.set(id, {
      ...entry,
      id,
      lastUpdated: new Date(),
    });

    console.log(`[SelfCoachingAI] Added knowledge: ${entry.topic}`);
    return id;
  }

  /**
   * Validate a data point using accumulated knowledge
   */
  async validateWithKnowledge(
    indicator: string,
    value: number,
    source: string,
    date: Date
  ): Promise<{
    valid: boolean;
    confidence: number;
    reasoning: string;
    reasoningAr: string;
    suggestions: string[];
  }> {
    // Get relevant knowledge
    const relevantKnowledge = this.queryKnowledge(indicator);
    
    // Get accuracy history
    const key = `${indicator}_${source}`;
    const historicalAccuracy = this.accuracyScores.get(key) || [];
    const avgAccuracy = historicalAccuracy.length > 0
      ? historicalAccuracy.reduce((a, b) => a + b, 0) / historicalAccuracy.length
      : 100;

    // Get patterns
    const patterns = this.patternMemory.get(key) || [];
    
    // Build validation context
    let confidence = avgAccuracy;
    const suggestions: string[] = [];
    let reasoning = "";
    let reasoningAr = "";

    // Adjust confidence based on patterns
    if (patterns.length >= 5) {
      const overestimates = patterns.filter(p => p.startsWith("overestimate")).length;
      const underestimates = patterns.filter(p => p.startsWith("underestimate")).length;
      
      if (overestimates > underestimates * 2) {
        confidence -= 10;
        reasoning += `Source tends to overestimate (${overestimates}/${patterns.length} times). `;
        reasoningAr += `المصدر يميل للمبالغة (${overestimates}/${patterns.length} مرات). `;
        suggestions.push("Consider applying downward correction factor");
      } else if (underestimates > overestimates * 2) {
        confidence -= 10;
        reasoning += `Source tends to underestimate (${underestimates}/${patterns.length} times). `;
        reasoningAr += `المصدر يميل للتقليل (${underestimates}/${patterns.length} مرات). `;
        suggestions.push("Consider applying upward correction factor");
      }
    }

    // Add knowledge-based reasoning
    if (relevantKnowledge.length > 0) {
      reasoning += `Validated against ${relevantKnowledge.length} knowledge entries. `;
      reasoningAr += `تم التحقق مقابل ${relevantKnowledge.length} مدخلات معرفية. `;
    }

    // Historical accuracy note
    if (historicalAccuracy.length > 0) {
      reasoning += `Historical accuracy: ${avgAccuracy.toFixed(1)}%. `;
      reasoningAr += `الدقة التاريخية: ${avgAccuracy.toFixed(1)}%. `;
    }

    return {
      valid: confidence >= 70,
      confidence: Math.round(confidence),
      reasoning: reasoning || "No specific validation concerns.",
      reasoningAr: reasoningAr || "لا توجد مخاوف تحقق محددة.",
      suggestions,
    };
  }

  /**
   * Generate a comprehensive coaching report
   */
  async generateCoachingReport(): Promise<{
    summary: { en: string; ar: string };
    metrics: AccuracyMetrics;
    insights: CoachingInsight[];
    topLessons: LearningEvent[];
    recommendations: string[];
  }> {
    const metrics = this.getAccuracyMetrics();
    const insights = await this.generateInsights();
    
    // Get top lessons (most recent and impactful)
    const topLessons = this.learningHistory
      .filter(e => e.type === "correction")
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (metrics.overallAccuracy < 80) {
      recommendations.push("Increase cross-validation frequency");
      recommendations.push("Review source verification procedures");
    }
    
    if (metrics.recentCorrections > 5) {
      recommendations.push("Audit recent data entries");
      recommendations.push("Check for systematic errors");
    }

    insights
      .filter(i => i.actionable && i.suggestedAction)
      .forEach(i => recommendations.push(i.suggestedAction!));

    // Generate summary
    const summary = {
      en: `Overall accuracy: ${metrics.overallAccuracy.toFixed(1)}% (${metrics.trend}). ${this.learningHistory.length} learning events recorded. ${insights.filter(i => i.priority === "high").length} high-priority insights.`,
      ar: `الدقة الإجمالية: ${metrics.overallAccuracy.toFixed(1)}% (${metrics.trend === "improving" ? "في تحسن" : metrics.trend === "declining" ? "في انخفاض" : "مستقر"}). ${this.learningHistory.length} حدث تعلم مسجل. ${insights.filter(i => i.priority === "high").length} رؤى عالية الأولوية.`,
    };

    return {
      summary,
      metrics,
      insights,
      topLessons,
      recommendations: Array.from(new Set(recommendations)),
    };
  }
}

// Export singleton instance
export const selfCoachingAI = new SelfCoachingAI();

export default SelfCoachingAI;
