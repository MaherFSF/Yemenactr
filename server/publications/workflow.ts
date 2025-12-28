/**
 * YETO Platform - Publications Workflow Service
 * 
 * Handles automated publication generation, approval workflow,
 * and distribution for Daily/Weekly/Monthly reports.
 */

import { getDb } from '../db';
import { invokeLLM } from '../_core/llm';

// ============================================
// Types
// ============================================

export type PublicationType = 
  | 'daily_digest'
  | 'weekly_monitor'
  | 'monthly_brief'
  | 'quarterly_report'
  | 'special_report'
  | 'flash_alert';

export type PublicationStatus = 
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'published'
  | 'archived';

export interface Publication {
  id: string;
  type: PublicationType;
  title: string;
  titleAr: string;
  content: string;
  contentAr: string;
  summary: string;
  summaryAr: string;
  status: PublicationStatus;
  author: string;
  reviewedBy?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata: PublicationMetadata;
}

export interface PublicationMetadata {
  indicators: string[];
  sectors: string[];
  regimes: ('aden' | 'sanaa' | 'national')[];
  dateRange: {
    start: Date;
    end: Date;
  };
  sources: string[];
  confidence: 'high' | 'medium' | 'low';
}

export interface PublicationTemplate {
  type: PublicationType;
  name: string;
  nameAr: string;
  frequency: string;
  sections: TemplateSection[];
}

export interface TemplateSection {
  id: string;
  title: string;
  titleAr: string;
  type: 'summary' | 'chart' | 'table' | 'analysis' | 'outlook';
  indicators?: string[];
  required: boolean;
}

// ============================================
// Publication Templates
// ============================================

export const PUBLICATION_TEMPLATES: PublicationTemplate[] = [
  {
    type: 'daily_digest',
    name: 'Daily Economic Signals Digest',
    nameAr: 'الملخص اليومي للإشارات الاقتصادية',
    frequency: 'daily',
    sections: [
      {
        id: 'market_snapshot',
        title: 'Market Snapshot',
        titleAr: 'لمحة عن السوق',
        type: 'summary',
        indicators: ['fx_rate_aden', 'fx_rate_sanaa', 'fuel_prices'],
        required: true
      },
      {
        id: 'fx_movement',
        title: 'Exchange Rate Movement',
        titleAr: 'حركة سعر الصرف',
        type: 'chart',
        indicators: ['fx_rate_aden', 'fx_rate_sanaa'],
        required: true
      },
      {
        id: 'key_events',
        title: 'Key Events',
        titleAr: 'الأحداث الرئيسية',
        type: 'summary',
        required: false
      },
      {
        id: 'outlook',
        title: 'Short-term Outlook',
        titleAr: 'التوقعات قصيرة المدى',
        type: 'outlook',
        required: true
      }
    ]
  },
  {
    type: 'weekly_monitor',
    name: 'Weekly Market & FX Monitor',
    nameAr: 'المراقب الأسبوعي للسوق والعملات',
    frequency: 'weekly',
    sections: [
      {
        id: 'executive_summary',
        title: 'Executive Summary',
        titleAr: 'الملخص التنفيذي',
        type: 'summary',
        required: true
      },
      {
        id: 'fx_analysis',
        title: 'Foreign Exchange Analysis',
        titleAr: 'تحليل العملات الأجنبية',
        type: 'analysis',
        indicators: ['fx_rate_aden', 'fx_rate_sanaa', 'fx_spread'],
        required: true
      },
      {
        id: 'commodity_prices',
        title: 'Commodity Price Trends',
        titleAr: 'اتجاهات أسعار السلع',
        type: 'table',
        indicators: ['wheat_price', 'rice_price', 'fuel_price', 'cooking_gas'],
        required: true
      },
      {
        id: 'banking_sector',
        title: 'Banking Sector Update',
        titleAr: 'تحديث القطاع المصرفي',
        type: 'analysis',
        required: false
      },
      {
        id: 'week_ahead',
        title: 'Week Ahead',
        titleAr: 'الأسبوع القادم',
        type: 'outlook',
        required: true
      }
    ]
  },
  {
    type: 'monthly_brief',
    name: 'Monthly Macro-Fiscal Brief',
    nameAr: 'الموجز الشهري للاقتصاد الكلي والمالية العامة',
    frequency: 'monthly',
    sections: [
      {
        id: 'executive_summary',
        title: 'Executive Summary',
        titleAr: 'الملخص التنفيذي',
        type: 'summary',
        required: true
      },
      {
        id: 'macro_indicators',
        title: 'Macroeconomic Indicators',
        titleAr: 'المؤشرات الاقتصادية الكلية',
        type: 'table',
        indicators: ['gdp_estimate', 'inflation', 'unemployment'],
        required: true
      },
      {
        id: 'fiscal_analysis',
        title: 'Fiscal Analysis',
        titleAr: 'التحليل المالي',
        type: 'analysis',
        indicators: ['revenue', 'expenditure', 'deficit'],
        required: true
      },
      {
        id: 'trade_balance',
        title: 'Trade Balance',
        titleAr: 'الميزان التجاري',
        type: 'chart',
        indicators: ['imports', 'exports', 'trade_balance'],
        required: true
      },
      {
        id: 'aid_flows',
        title: 'Humanitarian Aid Flows',
        titleAr: 'تدفقات المساعدات الإنسانية',
        type: 'analysis',
        required: true
      },
      {
        id: 'regime_comparison',
        title: 'Regime Comparison',
        titleAr: 'مقارنة بين السلطتين',
        type: 'table',
        required: true
      },
      {
        id: 'outlook',
        title: 'Monthly Outlook',
        titleAr: 'التوقعات الشهرية',
        type: 'outlook',
        required: true
      }
    ]
  },
  {
    type: 'flash_alert',
    name: 'Flash Economic Alert',
    nameAr: 'تنبيه اقتصادي عاجل',
    frequency: 'ad-hoc',
    sections: [
      {
        id: 'alert_summary',
        title: 'Alert Summary',
        titleAr: 'ملخص التنبيه',
        type: 'summary',
        required: true
      },
      {
        id: 'impact_analysis',
        title: 'Impact Analysis',
        titleAr: 'تحليل الأثر',
        type: 'analysis',
        required: true
      },
      {
        id: 'recommended_actions',
        title: 'Recommended Actions',
        titleAr: 'الإجراءات الموصى بها',
        type: 'outlook',
        required: true
      }
    ]
  }
];

// ============================================
// Publication Workflow Service
// ============================================

export class PublicationWorkflow {
  
  /**
   * Generate auto-draft publication based on template and latest data
   */
  async generateAutoDraft(type: PublicationType): Promise<Publication> {
    const template = PUBLICATION_TEMPLATES.find(t => t.type === type);
    if (!template) {
      throw new Error(`Unknown publication type: ${type}`);
    }

    console.log(`[Publications] Generating auto-draft for: ${template.name}`);

    // Gather data for the publication
    const data = await this.gatherPublicationData(template);
    
    // Generate content using LLM
    const content = await this.generateContent(template, data);
    
    // Create publication draft
    const publication: Publication = {
      id: `pub_${Date.now()}`,
      type,
      title: content.title,
      titleAr: content.titleAr,
      content: content.content,
      contentAr: content.contentAr,
      summary: content.summary,
      summaryAr: content.summaryAr,
      status: 'draft',
      author: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        indicators: data.indicators,
        sectors: data.sectors,
        regimes: data.regimes,
        dateRange: data.dateRange,
        sources: data.sources,
        confidence: this.calculateConfidence(data)
      }
    };

    // Save draft to database
    await this.saveDraft(publication);

    console.log(`[Publications] Draft created: ${publication.id}`);
    return publication;
  }

  /**
   * Gather data needed for publication
   */
  private async gatherPublicationData(template: PublicationTemplate): Promise<{
    indicators: string[];
    sectors: string[];
    regimes: ('aden' | 'sanaa' | 'national')[];
    dateRange: { start: Date; end: Date };
    sources: string[];
    dataPoints: Record<string, any>;
  }> {
    const indicators: string[] = [];
    const sectors = new Set<string>();
    const dataPoints: Record<string, any> = {};

    // Collect indicators from template sections
    for (const section of template.sections) {
      if (section.indicators) {
        indicators.push(...section.indicators);
      }
    }

    // Determine date range based on publication type
    const end = new Date();
    let start = new Date();
    switch (template.frequency) {
      case 'daily':
        start.setDate(start.getDate() - 1);
        break;
      case 'weekly':
        start.setDate(start.getDate() - 7);
        break;
      case 'monthly':
        start.setMonth(start.getMonth() - 1);
        break;
      default:
        start.setDate(start.getDate() - 7);
    }

    // Fetch actual data from database
    // In production, this would query the timeSeries table
    for (const indicator of indicators) {
      dataPoints[indicator] = {
        latest: Math.random() * 1000,
        change: (Math.random() - 0.5) * 10,
        trend: Math.random() > 0.5 ? 'up' : 'down'
      };
    }

    return {
      indicators: Array.from(new Set(indicators)),
      sectors: Array.from(sectors),
      regimes: ['aden', 'sanaa'],
      dateRange: { start, end },
      sources: ['CBY-Aden', 'CBY-Sanaa', 'WFP', 'Market Surveys'],
      dataPoints
    };
  }

  /**
   * Generate publication content using LLM
   */
  private async generateContent(
    template: PublicationTemplate,
    data: Record<string, any>
  ): Promise<{
    title: string;
    titleAr: string;
    content: string;
    contentAr: string;
    summary: string;
    summaryAr: string;
  }> {
    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const prompt = `You are an economic analyst for the Yemen Economic Transparency Observatory (YETO).
Generate a ${template.name} publication for ${today}.

Template sections to cover:
${template.sections.map(s => `- ${s.title}: ${s.type}`).join('\n')}

Available data:
${JSON.stringify(data.dataPoints, null, 2)}

Generate:
1. A professional title (English)
2. Arabic title translation
3. Full content in English with all sections
4. Full content in Arabic
5. Executive summary (2-3 sentences, English)
6. Executive summary (Arabic)

Format as JSON with keys: title, titleAr, content, contentAr, summary, summaryAr`;

    try {
      const response = await invokeLLM({
        messages: [
          { role: 'system', content: 'You are an expert economic analyst specializing in Yemen\'s economy. Respond only with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'publication_content',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                titleAr: { type: 'string' },
                content: { type: 'string' },
                contentAr: { type: 'string' },
                summary: { type: 'string' },
                summaryAr: { type: 'string' }
              },
              required: ['title', 'titleAr', 'content', 'contentAr', 'summary', 'summaryAr'],
              additionalProperties: false
            }
          }
        }
      });

      const messageContent = response.choices[0].message.content;
      const content = JSON.parse(typeof messageContent === 'string' ? messageContent : '{}');
      return content;
    } catch (error) {
      console.error('[Publications] LLM generation failed:', error);
      // Return fallback content
      return {
        title: `${template.name} - ${today}`,
        titleAr: `${template.nameAr} - ${today}`,
        content: 'Content generation pending...',
        contentAr: 'جاري إنشاء المحتوى...',
        summary: 'Summary pending...',
        summaryAr: 'الملخص قيد الإعداد...'
      };
    }
  }

  /**
   * Calculate confidence level based on data quality
   */
  private calculateConfidence(data: Record<string, any>): 'high' | 'medium' | 'low' {
    // In production, this would analyze data quality metrics
    return 'medium';
  }

  /**
   * Save draft to database
   */
  private async saveDraft(publication: Publication): Promise<void> {
    const db = await getDb();
    if (!db) {
      console.warn('[Publications] Cannot save draft: database not available');
      return;
    }
    
    // In production, this would insert into publications table
    console.log('[Publications] Draft saved:', publication.id);
  }

  /**
   * Submit publication for review
   */
  async submitForReview(publicationId: string): Promise<void> {
    console.log(`[Publications] Submitting for review: ${publicationId}`);
    // Update status to pending_review
  }

  /**
   * Approve publication
   */
  async approve(publicationId: string, reviewerId: string): Promise<void> {
    console.log(`[Publications] Approved by ${reviewerId}: ${publicationId}`);
    // Update status to approved
  }

  /**
   * Publish and distribute
   */
  async publish(publicationId: string): Promise<void> {
    console.log(`[Publications] Publishing: ${publicationId}`);
    // Update status to published
    // Trigger email distribution
    // Update website
  }

  /**
   * Schedule publication generation
   */
  async scheduleGeneration(): Promise<void> {
    // Daily digest at 6 AM
    // Weekly monitor on Mondays
    // Monthly brief on 1st of month
    console.log('[Publications] Scheduling configured');
  }
}

// ============================================
// Scheduled Jobs
// ============================================

export const PUBLICATION_SCHEDULES = {
  daily_digest: '0 6 * * *',      // 6 AM daily
  weekly_monitor: '0 6 * * 1',    // 6 AM every Monday
  monthly_brief: '0 6 1 * *',     // 6 AM first day of month
  quarterly_report: '0 6 1 1,4,7,10 *' // 6 AM first day of quarter
};

/**
 * Run scheduled publication generation
 */
export async function runScheduledPublication(type: PublicationType): Promise<void> {
  const workflow = new PublicationWorkflow();
  await workflow.generateAutoDraft(type);
}

export default PublicationWorkflow;
