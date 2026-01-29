/**
 * Auto-Brief Service
 * 
 * Generates automated daily/weekly intelligence briefs for VIP users:
 * - Template-based brief generation
 * - Subscription management
 * - Delivery tracking
 * - Brief history and archival
 */

import { getDb } from "../db";
import { 
  autoBriefTemplates, 
  autoBriefInstances, 
  autoBriefSubscriptions,
  vipRoleProfiles,
  users
} from "../../drizzle/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { getCockpitData, type CockpitData } from "./vipCockpitService";

// Types
export interface BriefSection {
  sectionCode: string;
  title: string;
  titleAr: string;
  content: string;
  contentAr: string;
  signalCount?: number;
  criticalCount?: number;
}

export interface BriefTemplate {
  id: number;
  templateCode: string;
  templateName: string;
  templateNameAr: string;
  roleProfileId?: number;
  frequency: "daily" | "weekly" | "monthly" | "on_demand";
  sections: Array<{
    sectionCode: string;
    title: string;
    titleAr: string;
    type: "signals" | "changes" | "drivers" | "options" | "watchlist" | "custom";
    config?: Record<string, unknown>;
    order: number;
  }>;
  deliveryChannels: Array<"email" | "dashboard" | "api">;
  deliveryTime: string;
  timezone: string;
  isActive: boolean;
}

export interface BriefInstance {
  id: number;
  templateId: number;
  userId?: number;
  briefCode: string;
  periodStart: Date;
  periodEnd: Date;
  title: string;
  titleAr: string;
  executiveSummary: string;
  executiveSummaryAr: string;
  sectionsContent: BriefSection[];
  totalSignals: number;
  criticalSignals: number;
  warningSignals: number;
  newDrivers: number;
  activeOptions: number;
  evidencePackIds: number[];
  deliveryStatus: "pending" | "sent" | "failed" | "read";
  sentAt?: Date;
  readAt?: Date;
  generatedAt: Date;
  generationDurationMs?: number;
}

/**
 * Get all brief templates
 */
export async function getBriefTemplates(roleProfileId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [eq(autoBriefTemplates.isActive, true)];
  if (roleProfileId) {
    conditions.push(eq(autoBriefTemplates.roleProfileId, roleProfileId));
  }

  return db.select()
    .from(autoBriefTemplates)
    .where(and(...conditions))
    .orderBy(autoBriefTemplates.templateName);
}

/**
 * Get a specific brief template
 */
export async function getBriefTemplate(templateId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [template] = await db.select()
    .from(autoBriefTemplates)
    .where(eq(autoBriefTemplates.id, templateId))
    .limit(1);

  return template;
}

/**
 * Create a new brief template
 */
export async function createBriefTemplate(data: {
  templateName: string;
  templateNameAr: string;
  roleProfileId?: number;
  frequency?: BriefTemplate["frequency"];
  sections?: BriefTemplate["sections"];
  deliveryChannels?: string[];
  deliveryTime?: string;
  timezone?: string;
}): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const templateCode = `BRIEF-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const defaultSections: BriefTemplate["sections"] = [
    { sectionCode: "signals", type: "signals", title: "Key Signals", titleAr: "المؤشرات الرئيسية", order: 1 },
    { sectionCode: "changes", type: "changes", title: "Notable Changes", titleAr: "التغييرات الملحوظة", order: 2 },
    { sectionCode: "drivers", type: "drivers", title: "Key Drivers", titleAr: "المحركات الرئيسية", order: 3 },
    { sectionCode: "options", type: "options", title: "Policy Options", titleAr: "خيارات السياسة", order: 4 },
    { sectionCode: "watchlist", type: "watchlist", title: "Watchlist Updates", titleAr: "تحديثات قائمة المراقبة", order: 5 },
  ];

  const [result] = await db.insert(autoBriefTemplates).values({
    templateCode,
    templateName: data.templateName,
    templateNameAr: data.templateNameAr,
    roleProfileId: data.roleProfileId,
    frequency: data.frequency || "daily",
    sections: data.sections || defaultSections,
    deliveryChannels: (data.deliveryChannels || ["dashboard"]) as Array<"email" | "dashboard" | "api">,
    deliveryTime: data.deliveryTime || "08:00",
    timezone: data.timezone || "Asia/Aden",
    isActive: true,
  }).$returningId();

  return result;
}

/**
 * Generate a brief instance from cockpit data
 */
export async function generateBrief(
  templateId: number,
  roleCode: string,
  userId?: number,
  periodStart?: Date,
  periodEnd?: Date
): Promise<{ id: number; brief: BriefInstance }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const startTime = Date.now();

  // Get template
  const template = await getBriefTemplate(templateId);
  if (!template) {
    throw new Error(`Brief template not found: ${templateId}`);
  }

  // Get cockpit data
  const cockpitData = await getCockpitData(roleCode, userId);

  // Determine period
  const now = new Date();
  const end = periodEnd || now;
  const start = periodStart || new Date(end.getTime() - 24 * 60 * 60 * 1000); // Default: last 24 hours

  // Generate sections content
  const sectionsContent: BriefSection[] = [];
  const templateSections = (template.sections as BriefTemplate["sections"]) || [];

  for (const section of templateSections) {
    const content = generateSectionContent(section.type, cockpitData);
    sectionsContent.push({
      sectionCode: section.sectionCode,
      title: section.title,
      titleAr: section.titleAr,
      content: content.content,
      contentAr: content.contentAr,
      signalCount: content.signalCount,
      criticalCount: content.criticalCount,
    });
  }

  // Generate executive summary
  const summary = generateExecutiveSummary(cockpitData);

  // Create brief instance
  const briefCode = `BRIEF-${templateId}-${Date.now()}`;
  const title = `${template.templateName} - ${formatDate(start)} to ${formatDate(end)}`;
  const titleAr = `${template.templateNameAr} - ${formatDateAr(start)} إلى ${formatDateAr(end)}`;

  const [result] = await db.insert(autoBriefInstances).values({
    templateId,
    userId,
    briefCode,
    periodStart: start,
    periodEnd: end,
    title,
    titleAr,
    executiveSummary: summary.en,
    executiveSummaryAr: summary.ar,
    sectionsContent,
    totalSignals: cockpitData.signals.length,
    criticalSignals: cockpitData.signals.filter(s => s.status === "critical").length,
    warningSignals: cockpitData.signals.filter(s => s.status === "warning").length,
    newDrivers: cockpitData.drivers.length,
    activeOptions: cockpitData.options.length,
    evidencePackIds: collectEvidencePackIds(cockpitData),
    deliveryStatus: "pending",
    generationDurationMs: Date.now() - startTime,
  }).$returningId();

  // Fetch the created brief
  const [brief] = await db.select()
    .from(autoBriefInstances)
    .where(eq(autoBriefInstances.id, result.id))
    .limit(1);

  return { id: result.id, brief: brief as unknown as BriefInstance };
}

/**
 * Generate content for a specific section type
 */
function generateSectionContent(
  type: string,
  data: CockpitData
): { content: string; contentAr: string; signalCount?: number; criticalCount?: number } {
  switch (type) {
    case "signals":
      return {
        content: data.signals.length > 0
          ? `${data.signals.length} key indicators tracked. ${data.signals.filter(s => s.status === "critical").length} critical, ${data.signals.filter(s => s.status === "warning").length} warning.`
          : "No signals currently tracked.",
        contentAr: data.signals.length > 0
          ? `${data.signals.length} مؤشرات رئيسية متتبعة. ${data.signals.filter(s => s.status === "critical").length} حرجة، ${data.signals.filter(s => s.status === "warning").length} تحذيرية.`
          : "لا توجد مؤشرات متتبعة حالياً.",
        signalCount: data.signals.length,
        criticalCount: data.signals.filter(s => s.status === "critical").length,
      };

    case "changes":
      return {
        content: data.changes.length > 0
          ? `${data.changes.length} significant changes detected in the reporting period.`
          : "No significant changes detected.",
        contentAr: data.changes.length > 0
          ? `${data.changes.length} تغييرات ملحوظة تم رصدها في فترة التقرير.`
          : "لم يتم رصد تغييرات ملحوظة.",
        signalCount: data.changes.length,
        criticalCount: data.changes.filter(c => c.significance === "high").length,
      };

    case "drivers":
      return {
        content: data.drivers.length > 0
          ? `${data.drivers.length} key drivers identified affecting current conditions.`
          : "No key drivers identified.",
        contentAr: data.drivers.length > 0
          ? `${data.drivers.length} محركات رئيسية تم تحديدها تؤثر على الأوضاع الحالية.`
          : "لم يتم تحديد محركات رئيسية.",
        signalCount: data.drivers.length,
        criticalCount: data.drivers.filter(d => d.impact === "negative").length,
      };

    case "options":
      return {
        content: data.options.length > 0
          ? `${data.options.length} policy options available for consideration.`
          : "No policy options currently available.",
        contentAr: data.options.length > 0
          ? `${data.options.length} خيارات سياسية متاحة للنظر.`
          : "لا توجد خيارات سياسية متاحة حالياً.",
        signalCount: data.options.length,
      };

    case "watchlist":
      return {
        content: data.watchlist.length > 0
          ? `${data.watchlist.length} items on your watchlist. ${data.watchlist.filter(w => w.status === "critical").length} require attention.`
          : "No items on your watchlist.",
        contentAr: data.watchlist.length > 0
          ? `${data.watchlist.length} عناصر في قائمة المراقبة. ${data.watchlist.filter(w => w.status === "critical").length} تتطلب اهتماماً.`
          : "لا توجد عناصر في قائمة المراقبة.",
        signalCount: data.watchlist.length,
        criticalCount: data.watchlist.filter(w => w.status === "critical").length,
      };

    default:
      return {
        content: "Custom section content.",
        contentAr: "محتوى القسم المخصص.",
      };
  }
}

/**
 * Generate executive summary from cockpit data
 */
function generateExecutiveSummary(data: CockpitData): { en: string; ar: string } {
  const criticalCount = data.signals.filter(s => s.status === "critical").length;
  const warningCount = data.signals.filter(s => s.status === "warning").length;
  const significantChanges = data.changes.filter(c => c.significance === "high").length;

  let enSummary = `This brief covers ${data.signals.length} key indicators for the ${data.roleName} role. `;
  let arSummary = `يغطي هذا الموجز ${data.signals.length} مؤشرات رئيسية لدور ${data.roleNameAr}. `;

  if (criticalCount > 0) {
    enSummary += `ALERT: ${criticalCount} critical indicator(s) require immediate attention. `;
    arSummary += `تنبيه: ${criticalCount} مؤشر(ات) حرجة تتطلب اهتماماً فورياً. `;
  }

  if (warningCount > 0) {
    enSummary += `${warningCount} indicator(s) are in warning status. `;
    arSummary += `${warningCount} مؤشر(ات) في حالة تحذير. `;
  }

  if (significantChanges > 0) {
    enSummary += `${significantChanges} significant change(s) detected. `;
    arSummary += `تم رصد ${significantChanges} تغيير(ات) ملحوظة. `;
  }

  enSummary += `Data coverage: ${data.confidence.overallCoverage}%, freshness: ${data.confidence.dataFreshness}%.`;
  arSummary += `تغطية البيانات: ${data.confidence.overallCoverage}%، حداثة البيانات: ${data.confidence.dataFreshness}%.`;

  return { en: enSummary, ar: arSummary };
}

/**
 * Collect all evidence pack IDs from cockpit data
 */
function collectEvidencePackIds(data: CockpitData): number[] {
  const ids: number[] = [];
  
  data.signals.forEach(s => s.evidencePackId && ids.push(s.evidencePackId));
  data.changes.forEach(c => c.evidencePackId && ids.push(c.evidencePackId));
  data.drivers.forEach(d => d.evidencePackId && ids.push(d.evidencePackId));
  data.options.forEach(o => o.evidencePackId && ids.push(o.evidencePackId));
  data.watchlist.forEach(w => w.evidencePackId && ids.push(w.evidencePackId));

  return Array.from(new Set(ids));
}

/**
 * Format date for English display
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "short", 
    day: "numeric" 
  });
}

/**
 * Format date for Arabic display
 */
function formatDateAr(date: Date): string {
  return date.toLocaleDateString("ar-YE", { 
    year: "numeric", 
    month: "short", 
    day: "numeric" 
  });
}

/**
 * Get user's brief subscriptions
 */
export async function getUserSubscriptions(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select({
    subscription: autoBriefSubscriptions,
    template: autoBriefTemplates,
  })
    .from(autoBriefSubscriptions)
    .innerJoin(autoBriefTemplates, eq(autoBriefSubscriptions.templateId, autoBriefTemplates.id))
    .where(and(
      eq(autoBriefSubscriptions.userId, userId),
      eq(autoBriefSubscriptions.isActive, true)
    ));
}

/**
 * Subscribe user to a brief template
 */
export async function subscribeToBrief(
  userId: number,
  templateId: number,
  options?: {
    customDeliveryTime?: string;
    customTimezone?: string;
    emailEnabled?: boolean;
    dashboardEnabled?: boolean;
  }
): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check for existing subscription
  const [existing] = await db.select()
    .from(autoBriefSubscriptions)
    .where(and(
      eq(autoBriefSubscriptions.userId, userId),
      eq(autoBriefSubscriptions.templateId, templateId)
    ))
    .limit(1);

  if (existing) {
    // Reactivate if inactive
    if (!existing.isActive) {
      await db.update(autoBriefSubscriptions)
        .set({ isActive: true, ...options })
        .where(eq(autoBriefSubscriptions.id, existing.id));
    }
    return { id: existing.id };
  }

  const [result] = await db.insert(autoBriefSubscriptions).values({
    userId,
    templateId,
    customDeliveryTime: options?.customDeliveryTime,
    customTimezone: options?.customTimezone,
    emailEnabled: options?.emailEnabled ?? true,
    dashboardEnabled: options?.dashboardEnabled ?? true,
    isActive: true,
  }).$returningId();

  return result;
}

/**
 * Unsubscribe user from a brief template
 */
export async function unsubscribeFromBrief(userId: number, subscriptionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(autoBriefSubscriptions)
    .set({ isActive: false })
    .where(and(
      eq(autoBriefSubscriptions.id, subscriptionId),
      eq(autoBriefSubscriptions.userId, userId)
    ));

  return { success: true };
}

/**
 * Get brief history for a user
 */
export async function getUserBriefHistory(
  userId: number,
  options?: {
    templateId?: number;
    limit?: number;
    offset?: number;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [eq(autoBriefInstances.userId, userId)];
  if (options?.templateId) {
    conditions.push(eq(autoBriefInstances.templateId, options.templateId));
  }

  return db.select()
    .from(autoBriefInstances)
    .where(and(...conditions))
    .orderBy(desc(autoBriefInstances.generatedAt))
    .limit(options?.limit || 20)
    .offset(options?.offset || 0);
}

/**
 * Mark a brief as read
 */
export async function markBriefAsRead(briefId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(autoBriefInstances)
    .set({ 
      deliveryStatus: "read",
      readAt: new Date(),
    })
    .where(and(
      eq(autoBriefInstances.id, briefId),
      eq(autoBriefInstances.userId, userId)
    ));

  return { success: true };
}

/**
 * Get a specific brief instance
 */
export async function getBriefInstance(briefId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [brief] = await db.select()
    .from(autoBriefInstances)
    .where(eq(autoBriefInstances.id, briefId))
    .limit(1);

  return brief;
}
