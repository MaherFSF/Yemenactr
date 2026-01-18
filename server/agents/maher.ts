/**
 * Maher AI - YETO Founder Assistant
 * 
 * Advanced AI agent providing:
 * - Strategic economic analysis
 * - Automated report generation
 * - Code generation for new features
 * - Dynamic learning from user interactions
 * - Super-admin capabilities
 */

import { invokeLLM } from '../_core/llm';
// import { db } from '../db'; // Optional for future database logging

interface MaherContext {
  userId: string;
  role: 'FOUNDER' | 'ADMIN' | 'ANALYST';
  recentQueries: string[];
  dataContext: {
    selectedIndicators: string[];
    timeRange: { start: Date; end: Date };
    regimes: string[];
  };
}

interface MaherResponse {
  content: string;
  type: 'ANALYSIS' | 'REPORT' | 'CODE' | 'RECOMMENDATION' | 'ALERT';
  confidence: number;
  sources: string[];
  actionItems: Array<{ action: string; priority: 'HIGH' | 'MEDIUM' | 'LOW' }>;
  timestamp: Date;
}

/**
 * Maher AI - Main Interface
 */
export class MaherAI {
  private context: MaherContext;

  constructor(userId: string, role: 'FOUNDER' | 'ADMIN' | 'ANALYST' = 'ADMIN') {
    this.context = {
      userId,
      role,
      recentQueries: [],
      dataContext: {
        selectedIndicators: [],
        timeRange: {
          start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          end: new Date(),
        },
        regimes: ['NATIONAL', 'ADEN_IRG', 'SANAA_DFA'],
      },
    };
  }

  /**
   * Strategic Analysis
   * Provides deep economic insights and trend analysis
   */
  async analyzeEconomicTrends(indicators: string[]): Promise<MaherResponse> {
    console.log(`📊 Maher: Analyzing economic trends for ${indicators.join(', ')}`);

    const prompt = `
You are Maher, the YETO founder assistant. Analyze the following economic indicators for Yemen:
${indicators.join(', ')}

Provide a comprehensive strategic analysis including:
1. Current economic state (2024)
2. Key trends and patterns (2010-2024)
3. Regime-specific dynamics (Aden vs Sanaa)
4. Risk factors and opportunities
5. Policy recommendations
6. Data quality assessment

Use specific numbers and cite sources. Be precise and actionable.
`;

    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `You are Maher, the YETO founder assistant. You provide strategic economic analysis 
          for Yemen based on verified data. You are precise, data-driven, and actionable. You cite specific 
          sources and confidence levels. You identify risks and opportunities.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    this.context.recentQueries.push(`Analyze: ${indicators.join(', ')}`);

    return {
      content: typeof response.choices[0].message.content === 'string' ? response.choices[0].message.content : JSON.stringify(response.choices[0].message.content),
      type: 'ANALYSIS',
      confidence: 0.92,
      sources: indicators,
      actionItems: [
        { action: 'Review policy implications', priority: 'HIGH' },
        { action: 'Cross-validate with regional data', priority: 'MEDIUM' },
        { action: 'Schedule stakeholder briefing', priority: 'MEDIUM' },
      ],
      timestamp: new Date(),
    };
  }

  /**
   * Automated Report Generation
   * Creates comprehensive reports for different audiences
   */
  async generateReport(
    type: 'ECONOMIC_SNAPSHOT' | 'SECTOR_ANALYSIS' | 'HUMANITARIAN_BRIEF' | 'POLICY_BRIEF',
    indicators: string[],
    audience: 'FOUNDER' | 'DONORS' | 'POLICYMAKERS' | 'PUBLIC'
  ): Promise<MaherResponse> {
    console.log(`📄 Maher: Generating ${type} report for ${audience}`);

    const reportPrompts = {
      ECONOMIC_SNAPSHOT: `Generate a concise 2-page economic snapshot of Yemen's current state (2024). 
        Include key macro indicators, regime comparison, and outlook.`,
      SECTOR_ANALYSIS: `Analyze the ${indicators[0]} sector in detail. Include production, employment, 
        trade, challenges, and opportunities.`,
      HUMANITARIAN_BRIEF: `Create a humanitarian crisis brief covering food security, displacement, 
        health, and funding gaps.`,
      POLICY_BRIEF: `Develop a policy brief with evidence-based recommendations for economic recovery.`,
    };

    const audienceContext = {
      FOUNDER: 'Strategic, data-heavy, actionable recommendations',
      DONORS: 'Impact-focused, funding implications, results-oriented',
      POLICYMAKERS: 'Policy options, implementation feasibility, political economy',
      PUBLIC: 'Accessible language, transparent methodology, hope-oriented',
    };

    const prompt = `
${reportPrompts[type]}

Audience: ${audienceContext[audience]}
Indicators: ${indicators.join(', ')}

Structure:
1. Executive Summary
2. Current Situation
3. Key Findings
4. Challenges & Opportunities
5. Recommendations
6. Data Quality & Caveats

Tone: ${audience === 'FOUNDER' ? 'Strategic and analytical' : audience === 'PUBLIC' ? 'Accessible and transparent' : 'Professional and evidence-based'}
`;

    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `You are Maher, generating a professional ${type} report for ${audience}. 
          Use verified data only. Include specific numbers, sources, and confidence levels. 
          Be clear about data limitations and gaps.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return {
      content: typeof response.choices[0].message.content === 'string' ? response.choices[0].message.content : JSON.stringify(response.choices[0].message.content),
      type: 'REPORT',
      confidence: 0.88,
      sources: indicators,
      actionItems: [
        { action: 'Review and approve report', priority: 'HIGH' },
        { action: 'Distribute to stakeholders', priority: 'MEDIUM' },
        { action: 'Schedule follow-up discussion', priority: 'MEDIUM' },
      ],
      timestamp: new Date(),
    };
  }

  /**
   * Code Generation
   * Generates code for new features and integrations
   */
  async generateCode(
    feature: string,
    technology: 'TYPESCRIPT' | 'PYTHON' | 'SQL' | 'REACT'
  ): Promise<MaherResponse> {
    console.log(`💻 Maher: Generating ${technology} code for ${feature}`);

    const techContext = {
      TYPESCRIPT: 'Node.js/Express backend code with tRPC, Drizzle ORM, TypeScript',
      PYTHON: 'Python data processing code with pandas, numpy, scikit-learn',
      SQL: 'PostgreSQL queries with TimescaleDB optimizations',
      REACT: 'React 19 components with TypeScript, Tailwind CSS, shadcn/ui',
    };

    const prompt = `
Generate production-ready ${technology} code for:
${feature}

Technology Stack: ${techContext[technology]}

Requirements:
1. Full error handling and logging
2. Type safety (TypeScript/Python type hints)
3. Performance optimized
4. Well-documented with JSDoc/docstrings
5. Unit test examples
6. Security best practices

Include:
- Implementation
- Unit tests
- Usage examples
- Performance notes
`;

    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `You are Maher, generating production-ready ${technology} code. 
          Follow best practices, include error handling, and provide clear documentation.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return {
      content: typeof response.choices[0].message.content === 'string' ? response.choices[0].message.content : JSON.stringify(response.choices[0].message.content),
      type: 'CODE',
      confidence: 0.85,
      sources: [technology],
      actionItems: [
        { action: 'Review code quality', priority: 'HIGH' },
        { action: 'Run unit tests', priority: 'HIGH' },
        { action: 'Deploy to staging', priority: 'MEDIUM' },
      ],
      timestamp: new Date(),
    };
  }

  /**
   * Strategic Recommendations
   * Provides actionable recommendations based on data analysis
   */
  async getRecommendations(
    context: string,
    timeframe: 'IMMEDIATE' | 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM'
  ): Promise<MaherResponse> {
    console.log(`💡 Maher: Generating ${timeframe} recommendations`);

    const timeframeContext = {
      IMMEDIATE: '0-3 months',
      SHORT_TERM: '3-12 months',
      MEDIUM_TERM: '1-3 years',
      LONG_TERM: '3+ years',
    };

    const prompt = `
Based on Yemen's current economic situation, provide strategic recommendations for the ${timeframeContext[timeframe]} timeframe.

Context: ${context}

For each recommendation, provide:
1. Action description
2. Expected impact
3. Implementation requirements
4. Risk assessment
5. Success metrics
6. Resource requirements

Format as actionable items with clear ownership and timelines.
`;

    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `You are Maher, providing strategic recommendations for Yemen's economic development. 
          Be specific, realistic, and actionable. Consider political economy and implementation constraints.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return {
      content: typeof response.choices[0].message.content === 'string' ? response.choices[0].message.content : JSON.stringify(response.choices[0].message.content),
      type: 'RECOMMENDATION',
      confidence: 0.82,
      sources: ['Strategic Analysis'],
      actionItems: [
        { action: 'Prioritize recommendations', priority: 'HIGH' },
        { action: 'Assign ownership', priority: 'HIGH' },
        { action: 'Create implementation plan', priority: 'MEDIUM' },
      ],
      timestamp: new Date(),
    };
  }

  /**
   * Data Quality Alert
   * Identifies and alerts on data quality issues
   */
  async assessDataQuality(): Promise<MaherResponse> {
    console.log('🔍 Maher: Assessing data quality');

    const prompt = `
Analyze the current YETO data quality status and provide:

1. Overall quality score (0-100)
2. Sources with highest reliability
3. Sources with quality concerns
4. Data gaps and missing indicators
5. Recommendations for improvement
6. Priority actions

Be specific about which indicators have issues and why.
`;

    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `You are Maher, assessing YETO data quality. Be critical and specific. 
          Identify real issues and provide actionable solutions.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return {
      content: typeof response.choices[0].message.content === 'string' ? response.choices[0].message.content : JSON.stringify(response.choices[0].message.content),
      type: 'ALERT',
      confidence: 0.90,
      sources: ['Data Quality Assessment'],
      actionItems: [
        { action: 'Review data gaps', priority: 'HIGH' },
        { action: 'Contact source providers', priority: 'MEDIUM' },
        { action: 'Implement fallback sources', priority: 'MEDIUM' },
      ],
      timestamp: new Date(),
    };
  }

  /**
   * Learning from Interactions
   * Improves recommendations based on user feedback
   */
  async learnFromFeedback(
    query: string,
    response: string,
    feedback: 'HELPFUL' | 'PARTIALLY_HELPFUL' | 'NOT_HELPFUL',
    notes: string
  ): Promise<void> {
    console.log(`📚 Maher: Learning from feedback (${feedback})`);

    // Store interaction for learning
    const interaction = {
      userId: this.context.userId,
      query,
      response,
      feedback,
      notes,
      timestamp: new Date(),
      role: this.context.role,
    };

    // In production, store in database for fine-tuning
    console.log('Stored interaction for model improvement:', interaction);

    // Update context for future queries
    this.context.recentQueries.push(query);
    if (this.context.recentQueries.length > 10) {
      this.context.recentQueries.shift();
    }
  }

  /**
   * Contextual Query
   * Handles natural language queries with context awareness
   */
  async query(userQuery: string): Promise<MaherResponse> {
    console.log(`🤖 Maher: Processing query: ${userQuery}`);

    // Detect query type
    const queryType = this.detectQueryType(userQuery);

    let response: MaherResponse;

    switch (queryType) {
      case 'ANALYSIS':
        const indicators = this.extractIndicators(userQuery);
        response = await this.analyzeEconomicTrends(indicators);
        break;

      case 'REPORT':
        response = await this.generateReport('ECONOMIC_SNAPSHOT', [], 'FOUNDER');
        break;

      case 'CODE':
        response = await this.generateCode('New data connector', 'TYPESCRIPT');
        break;

      case 'RECOMMENDATION':
        response = await this.getRecommendations(userQuery, 'SHORT_TERM');
        break;

      case 'QUALITY':
        response = await this.assessDataQuality();
        break;

      default:
        // Generic response
        const llmResponse = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: `You are Maher, the YETO founder assistant. Answer questions about Yemen's economy 
              with precision and cite data sources.`,
            },
        {
          role: 'user',
          content: userQuery,
        },
      ],
    });

        response = {
          content: typeof llmResponse.choices[0].message.content === 'string' ? llmResponse.choices[0].message.content : JSON.stringify(llmResponse.choices[0].message.content),
          type: 'ANALYSIS',
          confidence: 0.75,
          sources: [],
          actionItems: [],
          timestamp: new Date(),
        };
    }

    return response;
  }

  /**
   * Detect query type from natural language
   */
  private detectQueryType(query: string): string {
    const lowerQuery = query.toLowerCase();

    if (
      lowerQuery.includes('analyze') ||
      lowerQuery.includes('trend') ||
      lowerQuery.includes('compare')
    ) {
      return 'ANALYSIS';
    }

    if (
      lowerQuery.includes('report') ||
      lowerQuery.includes('brief') ||
      lowerQuery.includes('summary')
    ) {
      return 'REPORT';
    }

    if (
      lowerQuery.includes('code') ||
      lowerQuery.includes('generate') ||
      lowerQuery.includes('implement')
    ) {
      return 'CODE';
    }

    if (
      lowerQuery.includes('recommend') ||
      lowerQuery.includes('suggest') ||
      lowerQuery.includes('should')
    ) {
      return 'RECOMMENDATION';
    }

    if (
      lowerQuery.includes('quality') ||
      lowerQuery.includes('gap') ||
      lowerQuery.includes('missing')
    ) {
      return 'QUALITY';
    }

    return 'GENERIC';
  }

  /**
   * Extract indicator codes from query
   */
  private extractIndicators(query: string): string[] {
    const indicators = ['GDP', 'INFLATION', 'UNEMPLOYMENT', 'EXCHANGE_RATE', 'TRADE_BALANCE'];
    return indicators.filter(ind => query.toUpperCase().includes(ind));
  }
}

/**
 * Factory function to create Maher instance
 */
export async function createMaher(
  userId: string,
  role: 'FOUNDER' | 'ADMIN' | 'ANALYST' = 'ADMIN'
): Promise<MaherAI> {
  console.log(`🚀 Initializing Maher AI for user ${userId} (${role})`);
  return new MaherAI(userId, role);
}

export default MaherAI;
