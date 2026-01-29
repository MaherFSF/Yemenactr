/**
 * Email Notification Service
 * Handles email delivery for alerts, reports, and subscriptions
 */

import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq, inArray } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

export interface EmailTemplate {
  subject: string;
  body: string;
  bodyHtml?: string;
}

export interface EmailRecipient {
  email: string;
  name?: string;
  language?: "en" | "ar";
}

export interface EmailNotification {
  template: EmailTemplate;
  recipients: EmailRecipient[];
  category: "alert" | "report" | "subscription" | "system";
  priority: "high" | "normal" | "low";
  metadata?: Record<string, any>;
}

// Email templates for different notification types
export const EMAIL_TEMPLATES = {
  // Alert notifications
  dataAlert: {
    en: {
      subject: "[YETO Alert] {{alertType}}: {{indicatorName}}",
      body: `Dear {{recipientName}},

An alert has been triggered for {{indicatorName}}:

Alert Type: {{alertType}}
Current Value: {{currentValue}}
Threshold: {{threshold}}
Change: {{changePercent}}%

Regime: {{regime}}
Date: {{date}}

Evidence Pack:
{{evidenceSummary}}

View full details: {{alertUrl}}

---
Yemen Economic Transparency Observatory (YETO)
This is an automated notification. To manage your subscriptions, visit {{settingsUrl}}`
    },
    ar: {
      subject: "[يتو تنبيه] {{alertType}}: {{indicatorName}}",
      body: `عزيزي {{recipientName}}،

تم تفعيل تنبيه لـ {{indicatorName}}:

نوع التنبيه: {{alertType}}
القيمة الحالية: {{currentValue}}
الحد: {{threshold}}
التغيير: {{changePercent}}%

النظام: {{regime}}
التاريخ: {{date}}

حزمة الأدلة:
{{evidenceSummary}}

عرض التفاصيل الكاملة: {{alertUrl}}

---
مرصد الشفافية الاقتصادية اليمني (يتو)
هذا إشعار آلي. لإدارة اشتراكاتك، قم بزيارة {{settingsUrl}}`
    }
  },

  // Weekly digest
  weeklyDigest: {
    en: {
      subject: "[YETO] Weekly Economic Digest - {{weekRange}}",
      body: `Dear {{recipientName}},

Here is your weekly economic digest for Yemen:

KEY HIGHLIGHTS:
{{highlights}}

SECTOR UPDATES:
{{sectorUpdates}}

DATA QUALITY:
- New data points: {{newDataPoints}}
- Sources updated: {{sourcesUpdated}}
- Coverage: {{coveragePercent}}%

ALERTS TRIGGERED:
{{alertsSummary}}

View full report: {{reportUrl}}

---
Yemen Economic Transparency Observatory (YETO)`
    },
    ar: {
      subject: "[يتو] الملخص الاقتصادي الأسبوعي - {{weekRange}}",
      body: `عزيزي {{recipientName}}،

إليك ملخصك الاقتصادي الأسبوعي لليمن:

أبرز النقاط:
{{highlights}}

تحديثات القطاعات:
{{sectorUpdates}}

جودة البيانات:
- نقاط بيانات جديدة: {{newDataPoints}}
- المصادر المحدثة: {{sourcesUpdated}}
- التغطية: {{coveragePercent}}%

التنبيهات المفعلة:
{{alertsSummary}}

عرض التقرير الكامل: {{reportUrl}}

---
مرصد الشفافية الاقتصادية اليمني (يتو)`
    }
  },

  // Report ready notification
  reportReady: {
    en: {
      subject: "[YETO] Your {{reportType}} Report is Ready",
      body: `Dear {{recipientName}},

Your {{reportType}} report has been generated and is ready for download.

Report: {{reportTitle}}
Period: {{reportPeriod}}
Generated: {{generatedDate}}

Download links:
- PDF: {{pdfUrl}}
- Excel: {{excelUrl}}

Evidence pack included: {{evidencePackUrl}}

---
Yemen Economic Transparency Observatory (YETO)`
    },
    ar: {
      subject: "[يتو] تقريرك {{reportType}} جاهز",
      body: `عزيزي {{recipientName}}،

تم إنشاء تقريرك {{reportType}} وهو جاهز للتحميل.

التقرير: {{reportTitle}}
الفترة: {{reportPeriod}}
تاريخ الإنشاء: {{generatedDate}}

روابط التحميل:
- PDF: {{pdfUrl}}
- Excel: {{excelUrl}}

حزمة الأدلة المضمنة: {{evidencePackUrl}}

---
مرصد الشفافية الاقتصادية اليمني (يتو)`
    }
  }
};

/**
 * Replace template variables with actual values
 */
function renderTemplate(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
}

/**
 * Send email notification (uses Manus notification service for owner, logs for others)
 */
export async function sendEmailNotification(notification: EmailNotification): Promise<{
  success: boolean;
  sent: number;
  failed: number;
  errors: string[];
}> {
  const results = {
    success: true,
    sent: 0,
    failed: 0,
    errors: [] as string[]
  };

  for (const recipient of notification.recipients) {
    try {
      // For now, use the Manus notification service for owner notifications
      // In production, this would integrate with an SMTP service
      const sent = await notifyOwner({
        title: notification.template.subject,
        content: notification.template.body
      });

      if (sent) {
        results.sent++;
      } else {
        results.failed++;
        results.errors.push(`Failed to send to ${recipient.email}`);
      }
    } catch (error) {
      results.failed++;
      results.errors.push(`Error sending to ${recipient.email}: ${error}`);
    }
  }

  results.success = results.failed === 0;
  return results;
}

/**
 * Send alert notification to subscribed users
 */
export async function sendAlertNotification(params: {
  alertType: string;
  indicatorName: string;
  currentValue: string;
  threshold: string;
  changePercent: number;
  regime: string;
  evidenceSummary: string;
  alertUrl: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Get all users (simplified - in production would filter by subscription preferences)
  const usersData = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
  })
  .from(users)
  .limit(100);

  if (usersData.length === 0) return;

  const template = EMAIL_TEMPLATES.dataAlert.en;
    
  for (const user of usersData) {
    if (!user.email) continue;
    
    const variables: Record<string, string> = {
      recipientName: user.name || "User",
      alertType: params.alertType,
      indicatorName: params.indicatorName,
      currentValue: params.currentValue,
      threshold: params.threshold,
      changePercent: params.changePercent.toString(),
      regime: params.regime,
      evidenceSummary: params.evidenceSummary,
      alertUrl: params.alertUrl,
      date: new Date().toISOString().split('T')[0],
      settingsUrl: "/settings/notifications"
    };

    await sendEmailNotification({
      template: {
        subject: renderTemplate(template.subject, variables),
        body: renderTemplate(template.body, variables)
      },
      recipients: [{ email: user.email, name: user.name || undefined }],
      category: "alert",
      priority: "high"
    });
  }
}

/**
 * Send weekly digest to subscribed users
 */
export async function sendWeeklyDigest(params: {
  weekRange: string;
  highlights: string;
  sectorUpdates: string;
  newDataPoints: number;
  sourcesUpdated: number;
  coveragePercent: number;
  alertsSummary: string;
  reportUrl: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Get all users (simplified - in production would filter by subscription preferences)
  const usersData = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
  })
  .from(users)
  .limit(100);

  if (usersData.length === 0) return;

  for (const user of usersData) {
    if (!user.email) continue;
    const lang = "en";
    const template = EMAIL_TEMPLATES.weeklyDigest[lang as "en" | "ar"] || EMAIL_TEMPLATES.weeklyDigest.en;

    const variables = {
      recipientName: user.name || "User",
      weekRange: params.weekRange,
      highlights: params.highlights,
      sectorUpdates: params.sectorUpdates,
      newDataPoints: params.newDataPoints.toString(),
      sourcesUpdated: params.sourcesUpdated.toString(),
      coveragePercent: params.coveragePercent.toString(),
      alertsSummary: params.alertsSummary,
      reportUrl: params.reportUrl
    };

    await sendEmailNotification({
      template: {
        subject: renderTemplate(template.subject, variables),
        body: renderTemplate(template.body, variables)
      },
      recipients: [{ email: user.email || "", name: user.name || undefined }],
      category: "subscription",
      priority: "normal"
    });
  }
}

export default {
  sendEmailNotification,
  sendAlertNotification,
  sendWeeklyDigest,
  EMAIL_TEMPLATES,
  renderTemplate
};
