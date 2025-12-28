/**
 * YETO Platform - Public Changelog Service
 * Section 8E: Data Governance - Corrections Policy + Public Changelog
 * 
 * Implements corrections workflow and public changelog:
 * - Public changelog showing datasets updated
 * - Documents added and methodology changes
 * - No secrets in public changelog
 */

import { getDb } from '../db';
import { publicChangelog, users } from '../../drizzle/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';

// Types for public changelog
export interface ChangelogInput {
  changeType: 'dataset_added' | 'dataset_updated' | 'document_added' | 'methodology_change' | 'correction' | 'source_added' | 'indicator_added';
  affectedDatasetIds?: number[];
  affectedIndicatorCodes?: string[];
  affectedDocumentIds?: number[];
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  impactLevel: 'low' | 'medium' | 'high';
  affectedDateRange?: { start: string; end: string };
  isPublic?: boolean;
  publishedBy?: number;
}

export interface ChangelogEntry {
  id: number;
  changeType: string;
  affectedDatasetIds: number[];
  affectedIndicatorCodes: string[];
  affectedDocumentIds: number[];
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  impactLevel: 'low' | 'medium' | 'high';
  affectedDateRange?: { start: string; end: string };
  isPublic: boolean;
  publishedAt: Date;
  publishedByName?: string;
}

// Change type labels
const CHANGE_TYPE_LABELS = {
  dataset_added: {
    en: 'New Dataset Added',
    ar: 'تمت إضافة مجموعة بيانات جديدة',
    icon: '📊',
  },
  dataset_updated: {
    en: 'Dataset Updated',
    ar: 'تم تحديث مجموعة البيانات',
    icon: '🔄',
  },
  document_added: {
    en: 'New Document Added',
    ar: 'تمت إضافة وثيقة جديدة',
    icon: '📄',
  },
  methodology_change: {
    en: 'Methodology Change',
    ar: 'تغيير في المنهجية',
    icon: '📐',
  },
  correction: {
    en: 'Data Correction',
    ar: 'تصحيح البيانات',
    icon: '✏️',
  },
  source_added: {
    en: 'New Source Added',
    ar: 'تمت إضافة مصدر جديد',
    icon: '🔗',
  },
  indicator_added: {
    en: 'New Indicator Added',
    ar: 'تمت إضافة مؤشر جديد',
    icon: '📈',
  },
};

// Impact level badges
const IMPACT_BADGES = {
  low: {
    en: 'Minor Update',
    ar: 'تحديث طفيف',
    color: '#107040',
    bgColor: '#e6f4ec',
  },
  medium: {
    en: 'Moderate Impact',
    ar: 'تأثير متوسط',
    color: '#C0A030',
    bgColor: '#faf6e6',
  },
  high: {
    en: 'Significant Change',
    ar: 'تغيير كبير',
    color: '#c53030',
    bgColor: '#fde8e8',
  },
};

export class PublicChangelogService {
  
  /**
   * Add a new entry to the public changelog
   */
  async addEntry(input: ChangelogInput): Promise<ChangelogEntry> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    
    const result = await db.insert(publicChangelog).values({
      changeType: input.changeType,
      affectedDatasetIds: input.affectedDatasetIds || [],
      affectedIndicatorCodes: input.affectedIndicatorCodes || [],
      affectedDocumentIds: input.affectedDocumentIds || [],
      titleEn: input.titleEn,
      titleAr: input.titleAr,
      descriptionEn: input.descriptionEn,
      descriptionAr: input.descriptionAr,
      impactLevel: input.impactLevel,
      affectedDateRange: input.affectedDateRange,
      isPublic: input.isPublic ?? true,
      publishedBy: input.publishedBy,
    });
    
    const insertId = Number((result as unknown as { insertId: number }).insertId);
    
    // Get publisher name if applicable
    let publishedByName: string | undefined;
    if (input.publishedBy) {
      const userResults = await db.select().from(users).where(eq(users.id, input.publishedBy));
      publishedByName = userResults[0]?.name ?? undefined;
    }
    
    return {
      id: insertId,
      changeType: input.changeType,
      affectedDatasetIds: input.affectedDatasetIds || [],
      affectedIndicatorCodes: input.affectedIndicatorCodes || [],
      affectedDocumentIds: input.affectedDocumentIds || [],
      titleEn: input.titleEn,
      titleAr: input.titleAr,
      descriptionEn: input.descriptionEn,
      descriptionAr: input.descriptionAr,
      impactLevel: input.impactLevel,
      affectedDateRange: input.affectedDateRange,
      isPublic: input.isPublic ?? true,
      publishedAt: new Date(),
      publishedByName,
    };
  }
  
  /**
   * Get public changelog entries
   */
  async getPublicEntries(options?: {
    limit?: number;
    offset?: number;
    changeType?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<ChangelogEntry[]> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    
    let query = db.select()
      .from(publicChangelog)
      .where(eq(publicChangelog.isPublic, true))
      .orderBy(desc(publicChangelog.publishedAt));
    
    if (options?.limit) {
      query = query.limit(options.limit) as typeof query;
    }
    if (options?.offset) {
      query = query.offset(options.offset) as typeof query;
    }
    
    const results = await query;
    
    // Filter by change type and date range in memory (simpler than complex SQL)
    let filtered = results;
    if (options?.changeType) {
      filtered = filtered.filter(r => r.changeType === options.changeType);
    }
    if (options?.startDate) {
      filtered = filtered.filter(r => r.publishedAt >= options.startDate!);
    }
    if (options?.endDate) {
      filtered = filtered.filter(r => r.publishedAt <= options.endDate!);
    }
    
    const entries: ChangelogEntry[] = [];
    
    for (const row of filtered) {
      let publishedByName: string | undefined;
      if (row.publishedBy) {
        const userResults = await db.select().from(users).where(eq(users.id, row.publishedBy));
        publishedByName = userResults[0]?.name ?? undefined;
      }
      
      entries.push({
        id: row.id,
        changeType: row.changeType,
        affectedDatasetIds: (row.affectedDatasetIds as number[]) || [],
        affectedIndicatorCodes: (row.affectedIndicatorCodes as string[]) || [],
        affectedDocumentIds: (row.affectedDocumentIds as number[]) || [],
        titleEn: row.titleEn,
        titleAr: row.titleAr,
        descriptionEn: row.descriptionEn,
        descriptionAr: row.descriptionAr,
        impactLevel: row.impactLevel,
        affectedDateRange: row.affectedDateRange as { start: string; end: string } | undefined,
        isPublic: row.isPublic,
        publishedAt: row.publishedAt,
        publishedByName,
      });
    }
    
    return entries;
  }
  
  /**
   * Get changelog entry by ID
   */
  async getEntry(id: number): Promise<ChangelogEntry | null> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    
    const results = await db.select()
      .from(publicChangelog)
      .where(eq(publicChangelog.id, id));
    
    if (results.length === 0) return null;
    
    const row = results[0];
    let publishedByName: string | undefined;
    if (row.publishedBy) {
      const userResults = await db.select().from(users).where(eq(users.id, row.publishedBy));
      publishedByName = userResults[0]?.name ?? undefined;
    }
    
    return {
      id: row.id,
      changeType: row.changeType,
      affectedDatasetIds: (row.affectedDatasetIds as number[]) || [],
      affectedIndicatorCodes: (row.affectedIndicatorCodes as string[]) || [],
      affectedDocumentIds: (row.affectedDocumentIds as number[]) || [],
      titleEn: row.titleEn,
      titleAr: row.titleAr,
      descriptionEn: row.descriptionEn,
      descriptionAr: row.descriptionAr,
      impactLevel: row.impactLevel,
      affectedDateRange: row.affectedDateRange as { start: string; end: string } | undefined,
      isPublic: row.isPublic,
      publishedAt: row.publishedAt,
      publishedByName,
    };
  }
  
  /**
   * Update entry visibility
   */
  async setVisibility(id: number, isPublic: boolean): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    
    await db.update(publicChangelog)
      .set({ isPublic })
      .where(eq(publicChangelog.id, id));
  }
  
  /**
   * Get changelog statistics
   */
  async getStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    byImpact: Record<string, number>;
    recentCount: number;
    thisMonth: number;
  }> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    
    const all = await db.select()
      .from(publicChangelog)
      .where(eq(publicChangelog.isPublic, true));
    
    const byType: Record<string, number> = {};
    const byImpact: Record<string, number> = { low: 0, medium: 0, high: 0 };
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    let recentCount = 0;
    let thisMonth = 0;
    
    for (const row of all) {
      byType[row.changeType] = (byType[row.changeType] || 0) + 1;
      byImpact[row.impactLevel]++;
      
      if (row.publishedAt >= oneWeekAgo) recentCount++;
      if (row.publishedAt >= startOfMonth) thisMonth++;
    }
    
    return {
      total: all.length,
      byType,
      byImpact,
      recentCount,
      thisMonth,
    };
  }
  
  /**
   * Get change type label
   */
  getChangeTypeLabel(changeType: string, language: 'en' | 'ar' = 'en'): {
    label: string;
    icon: string;
  } {
    const labels = CHANGE_TYPE_LABELS[changeType as keyof typeof CHANGE_TYPE_LABELS];
    if (!labels) {
      return { label: changeType, icon: '📋' };
    }
    return {
      label: labels[language],
      icon: labels.icon,
    };
  }
  
  /**
   * Get impact badge info
   */
  getImpactBadge(impactLevel: 'low' | 'medium' | 'high', language: 'en' | 'ar' = 'en'): {
    label: string;
    color: string;
    bgColor: string;
  } {
    const badge = IMPACT_BADGES[impactLevel];
    return {
      label: badge[language],
      color: badge.color,
      bgColor: badge.bgColor,
    };
  }
  
  /**
   * Generate RSS feed content
   */
  async generateRSSFeed(): Promise<string> {
    const entries = await this.getPublicEntries({ limit: 50 });
    
    const items = entries.map(entry => `
    <item>
      <title>${this.escapeXml(entry.titleEn)}</title>
      <description>${this.escapeXml(entry.descriptionEn)}</description>
      <pubDate>${entry.publishedAt.toUTCString()}</pubDate>
      <guid>yeto-changelog-${entry.id}</guid>
      <category>${entry.changeType}</category>
    </item>`).join('\n');
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>YETO Platform - Data Changelog</title>
    <link>https://yeto.causewaygrp.com/changelog</link>
    <description>Updates to datasets, documents, and methodologies on the Yemen Economic Transparency Observatory</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;
  }
  
  /**
   * Escape XML special characters
   */
  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
  
  /**
   * Auto-generate changelog entry for common operations
   */
  async autoGenerateEntry(
    operation: 'dataset_added' | 'dataset_updated' | 'document_added' | 'correction',
    details: {
      datasetId?: number;
      documentId?: number;
      indicatorCode?: string;
      name: string;
      nameAr?: string;
      description?: string;
      descriptionAr?: string;
    },
    publishedBy?: number
  ): Promise<ChangelogEntry> {
    const labels = CHANGE_TYPE_LABELS[operation];
    
    const titleEn = `${labels.en}: ${details.name}`;
    const titleAr = `${labels.ar}: ${details.nameAr || details.name}`;
    
    const descriptionEn = details.description || `${details.name} has been ${operation.replace('_', ' ')}.`;
    const descriptionAr = details.descriptionAr || descriptionEn;
    
    return this.addEntry({
      changeType: operation,
      affectedDatasetIds: details.datasetId ? [details.datasetId] : [],
      affectedDocumentIds: details.documentId ? [details.documentId] : [],
      affectedIndicatorCodes: details.indicatorCode ? [details.indicatorCode] : [],
      titleEn,
      titleAr,
      descriptionEn,
      descriptionAr,
      impactLevel: operation === 'correction' ? 'medium' : 'low',
      publishedBy,
    });
  }
}

// Export singleton instance
export const publicChangelogService = new PublicChangelogService();
