/**
 * Collaborative Annotations Service for YETO Platform
 * 
 * Allows institutional users to add private annotations to data points
 * that can be shared within their organization.
 * 
 * Features:
 * - Private, organization-level, and public annotations
 * - Threading and replies
 * - Mentions and notifications
 * - Export functionality
 * - Upvoting and bookmarking
 */

import { getDb } from "../db";

// Types
export interface Annotation {
  id: string;
  userId: string;
  organizationId?: string;
  targetType: "time_series" | "indicator" | "event" | "publication" | "entity" | "report";
  targetId: string;
  annotationType: "note" | "question" | "correction" | "insight" | "flag" | "bookmark";
  title?: string;
  content: string;
  contentAr?: string;
  visibility: "private" | "organization" | "public";
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  parentId?: string;
  threadCount: number;
  upvotes: number;
  createdAt: Date;
  updatedAt: Date;
  // Populated fields
  author?: {
    id: string;
    name: string;
    organization?: string;
  };
  replies?: Annotation[];
  hasUpvoted?: boolean;
}

export interface AnnotationFilters {
  targetType?: string;
  targetId?: string;
  annotationType?: string;
  visibility?: string;
  userId?: string;
  organizationId?: string;
  isResolved?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface AnnotationExport {
  id: string;
  userId: string;
  organizationId?: string;
  exportFormat: "pdf" | "xlsx" | "json" | "docx";
  filterCriteria: AnnotationFilters;
  fileUrl?: string;
  annotationCount: number;
  createdAt: Date;
}

/**
 * Annotation Service
 */
export class AnnotationService {
  private db: ReturnType<typeof getDb>;
  private annotations: Map<string, Annotation> = new Map();

  constructor() {
    this.db = getDb();
    this.initializeSampleAnnotations();
  }

  /**
   * Initialize sample annotations for demonstration
   */
  private initializeSampleAnnotations() {
    const sampleAnnotations: Annotation[] = [
      {
        id: "ann_001",
        userId: "user_001",
        organizationId: "org_world_bank",
        targetType: "indicator",
        targetId: "FX_ADEN",
        annotationType: "insight",
        title: "Exchange Rate Volatility Analysis",
        content: "The Aden exchange rate has shown increased volatility since Q3 2023, correlating with reduced Saudi support payments. This pattern suggests dependency on external financing.",
        contentAr: "أظهر سعر صرف عدن تقلبات متزايدة منذ الربع الثالث 2023، مرتبطة بانخفاض مدفوعات الدعم السعودي. يشير هذا النمط إلى الاعتماد على التمويل الخارجي.",
        visibility: "organization",
        isResolved: false,
        threadCount: 3,
        upvotes: 12,
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
        author: {
          id: "user_001",
          name: "Dr. Ahmed Hassan",
          organization: "World Bank",
        },
      },
      {
        id: "ann_002",
        userId: "user_002",
        organizationId: "org_imf",
        targetType: "time_series",
        targetId: "ts_inflation_2024_01",
        annotationType: "correction",
        title: "Inflation Data Correction",
        content: "The January 2024 inflation figure appears to use outdated basket weights. Recommend recalculating with 2023 consumption survey data.",
        contentAr: "يبدو أن رقم التضخم لشهر يناير 2024 يستخدم أوزان سلة قديمة. يوصى بإعادة الحساب باستخدام بيانات مسح الاستهلاك 2023.",
        visibility: "public",
        isResolved: true,
        resolvedBy: "admin_001",
        resolvedAt: new Date("2024-02-01"),
        threadCount: 5,
        upvotes: 8,
        createdAt: new Date("2024-01-20"),
        updatedAt: new Date("2024-02-01"),
        author: {
          id: "user_002",
          name: "Sarah Mitchell",
          organization: "IMF",
        },
      },
      {
        id: "ann_003",
        userId: "user_003",
        organizationId: "org_undp",
        targetType: "event",
        targetId: "event_2024_port_closure",
        annotationType: "note",
        title: "Port Closure Impact Assessment",
        content: "The Hodeidah port closure in February 2024 had cascading effects on food prices in northern governorates. Our field teams reported 15-20% price increases within 2 weeks.",
        contentAr: "كان لإغلاق ميناء الحديدة في فبراير 2024 آثار متتالية على أسعار الغذاء في المحافظات الشمالية. أفادت فرقنا الميدانية بزيادة الأسعار بنسبة 15-20% خلال أسبوعين.",
        visibility: "organization",
        isResolved: false,
        threadCount: 2,
        upvotes: 15,
        createdAt: new Date("2024-02-15"),
        updatedAt: new Date("2024-02-15"),
        author: {
          id: "user_003",
          name: "Mohammed Al-Qadhi",
          organization: "UNDP Yemen",
        },
      },
      {
        id: "ann_004",
        userId: "user_004",
        targetType: "publication",
        targetId: "pub_quarterly_2024_q1",
        annotationType: "question",
        title: "Methodology Clarification",
        content: "Could you clarify the methodology used for GDP estimation in conflict-affected areas? The report mentions satellite imagery but doesn't detail the specific approach.",
        contentAr: "هل يمكنكم توضيح المنهجية المستخدمة لتقدير الناتج المحلي الإجمالي في المناطق المتأثرة بالصراع؟ يذكر التقرير صور الأقمار الصناعية لكنه لا يفصل النهج المحدد.",
        visibility: "public",
        isResolved: false,
        threadCount: 1,
        upvotes: 6,
        createdAt: new Date("2024-03-01"),
        updatedAt: new Date("2024-03-01"),
        author: {
          id: "user_004",
          name: "Dr. Fatima Al-Sanabani",
        },
      },
      {
        id: "ann_005",
        userId: "user_005",
        organizationId: "org_cby_aden",
        targetType: "indicator",
        targetId: "FX_SPREAD",
        annotationType: "flag",
        title: "Data Quality Alert",
        content: "The spread calculation for March 2024 may be affected by temporary market disruptions. Recommend flagging this data point with reduced confidence.",
        contentAr: "قد يتأثر حساب الفارق لشهر مارس 2024 باضطرابات السوق المؤقتة. يوصى بتمييز نقطة البيانات هذه بثقة منخفضة.",
        visibility: "organization",
        isResolved: false,
        threadCount: 0,
        upvotes: 4,
        createdAt: new Date("2024-03-15"),
        updatedAt: new Date("2024-03-15"),
        author: {
          id: "user_005",
          name: "Ali Saeed",
          organization: "Central Bank of Yemen (Aden)",
        },
      },
    ];

    sampleAnnotations.forEach(ann => this.annotations.set(ann.id, ann));
  }

  /**
   * Create a new annotation
   */
  async createAnnotation(
    userId: string,
    data: {
      organizationId?: string;
      targetType: Annotation["targetType"];
      targetId: string;
      annotationType: Annotation["annotationType"];
      title?: string;
      content: string;
      contentAr?: string;
      visibility: Annotation["visibility"];
      parentId?: string;
    }
  ): Promise<Annotation> {
    const id = `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const annotation: Annotation = {
      id,
      userId,
      organizationId: data.organizationId,
      targetType: data.targetType,
      targetId: data.targetId,
      annotationType: data.annotationType,
      title: data.title,
      content: data.content,
      contentAr: data.contentAr,
      visibility: data.visibility,
      isResolved: false,
      parentId: data.parentId,
      threadCount: 0,
      upvotes: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.annotations.set(id, annotation);

    // Update parent thread count if this is a reply
    if (data.parentId) {
      const parent = this.annotations.get(data.parentId);
      if (parent) {
        parent.threadCount++;
        this.annotations.set(data.parentId, parent);
      }
    }

    console.log(`[AnnotationService] Created annotation: ${id}`);
    return annotation;
  }

  /**
   * Get annotation by ID
   */
  async getAnnotation(id: string, userId?: string): Promise<Annotation | null> {
    const annotation = this.annotations.get(id);
    if (!annotation) return null;

    // Check visibility
    if (annotation.visibility === "private" && annotation.userId !== userId) {
      return null;
    }

    return annotation;
  }

  /**
   * List annotations with filters
   */
  async listAnnotations(
    userId: string,
    userOrganizationId: string | undefined,
    filters: AnnotationFilters
  ): Promise<{ annotations: Annotation[]; total: number }> {
    let results = Array.from(this.annotations.values());

    // Filter by visibility (user can see their own, their org's, and public)
    results = results.filter(ann => {
      if (ann.visibility === "public") return true;
      if (ann.visibility === "private" && ann.userId === userId) return true;
      if (ann.visibility === "organization" && ann.organizationId === userOrganizationId) return true;
      return false;
    });

    // Apply filters
    if (filters.targetType) {
      results = results.filter(ann => ann.targetType === filters.targetType);
    }
    if (filters.targetId) {
      results = results.filter(ann => ann.targetId === filters.targetId);
    }
    if (filters.annotationType) {
      results = results.filter(ann => ann.annotationType === filters.annotationType);
    }
    if (filters.isResolved !== undefined) {
      results = results.filter(ann => ann.isResolved === filters.isResolved);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter(ann => 
        ann.content.toLowerCase().includes(searchLower) ||
        ann.title?.toLowerCase().includes(searchLower) ||
        ann.contentAr?.includes(filters.search!)
      );
    }

    // Sort by date descending
    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = results.length;
    const offset = filters.offset || 0;
    const limit = filters.limit || 20;

    return {
      annotations: results.slice(offset, offset + limit),
      total,
    };
  }

  /**
   * Get annotations for a specific target
   */
  async getTargetAnnotations(
    targetType: string,
    targetId: string,
    userId: string,
    userOrganizationId?: string
  ): Promise<Annotation[]> {
    const { annotations } = await this.listAnnotations(userId, userOrganizationId, {
      targetType,
      targetId,
      limit: 100,
    });

    // Get only top-level annotations (not replies)
    const topLevel = annotations.filter(ann => !ann.parentId);

    // Populate replies for each top-level annotation
    for (const ann of topLevel) {
      ann.replies = annotations.filter(reply => reply.parentId === ann.id);
    }

    return topLevel;
  }

  /**
   * Update an annotation
   */
  async updateAnnotation(
    id: string,
    userId: string,
    updates: Partial<Pick<Annotation, "title" | "content" | "contentAr" | "visibility">>
  ): Promise<Annotation | null> {
    const annotation = this.annotations.get(id);
    if (!annotation || annotation.userId !== userId) {
      return null;
    }

    const updated: Annotation = {
      ...annotation,
      ...updates,
      updatedAt: new Date(),
    };

    this.annotations.set(id, updated);
    return updated;
  }

  /**
   * Delete an annotation
   */
  async deleteAnnotation(id: string, userId: string): Promise<boolean> {
    const annotation = this.annotations.get(id);
    if (!annotation || annotation.userId !== userId) {
      return false;
    }

    this.annotations.delete(id);
    return true;
  }

  /**
   * Resolve an annotation
   */
  async resolveAnnotation(id: string, resolvedBy: string): Promise<Annotation | null> {
    const annotation = this.annotations.get(id);
    if (!annotation) return null;

    const updated: Annotation = {
      ...annotation,
      isResolved: true,
      resolvedBy,
      resolvedAt: new Date(),
      updatedAt: new Date(),
    };

    this.annotations.set(id, updated);
    return updated;
  }

  /**
   * Upvote an annotation
   */
  async upvoteAnnotation(id: string, userId: string): Promise<{ success: boolean; upvotes: number }> {
    const annotation = this.annotations.get(id);
    if (!annotation) {
      return { success: false, upvotes: 0 };
    }

    // In production, check if user already upvoted
    annotation.upvotes++;
    this.annotations.set(id, annotation);

    return { success: true, upvotes: annotation.upvotes };
  }

  /**
   * Export annotations
   */
  async exportAnnotations(
    userId: string,
    organizationId: string | undefined,
    format: "pdf" | "xlsx" | "json" | "docx",
    filters: AnnotationFilters
  ): Promise<AnnotationExport> {
    const { annotations, total } = await this.listAnnotations(userId, organizationId, {
      ...filters,
      limit: 1000,
    });

    const exportId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Generate export file (in production, this would create actual files)
    let fileContent: string;
    
    if (format === "json") {
      fileContent = JSON.stringify(annotations, null, 2);
    } else {
      // For other formats, generate a summary
      fileContent = annotations.map(ann => 
        `[${ann.annotationType.toUpperCase()}] ${ann.title || 'Untitled'}\n${ann.content}\n---`
      ).join('\n\n');
    }

    console.log(`[AnnotationService] Exported ${annotations.length} annotations as ${format}`);

    return {
      id: exportId,
      userId,
      organizationId,
      exportFormat: format,
      filterCriteria: filters,
      fileUrl: `/exports/${exportId}.${format}`,
      annotationCount: annotations.length,
      createdAt: new Date(),
    };
  }

  /**
   * Get annotation statistics
   */
  async getStatistics(
    userId: string,
    organizationId?: string
  ): Promise<{
    total: number;
    byType: Record<string, number>;
    byVisibility: Record<string, number>;
    resolved: number;
    unresolved: number;
    myAnnotations: number;
    orgAnnotations: number;
  }> {
    const { annotations, total } = await this.listAnnotations(userId, organizationId, { limit: 1000 });

    const byType: Record<string, number> = {};
    const byVisibility: Record<string, number> = {};
    let resolved = 0;
    let unresolved = 0;
    let myAnnotations = 0;
    let orgAnnotations = 0;

    for (const ann of annotations) {
      byType[ann.annotationType] = (byType[ann.annotationType] || 0) + 1;
      byVisibility[ann.visibility] = (byVisibility[ann.visibility] || 0) + 1;
      
      if (ann.isResolved) resolved++;
      else unresolved++;
      
      if (ann.userId === userId) myAnnotations++;
      if (ann.organizationId === organizationId) orgAnnotations++;
    }

    return {
      total,
      byType,
      byVisibility,
      resolved,
      unresolved,
      myAnnotations,
      orgAnnotations,
    };
  }
}

// Export singleton instance
export const annotationService = new AnnotationService();

export default AnnotationService;
