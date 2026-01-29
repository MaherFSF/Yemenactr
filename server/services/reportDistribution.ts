/**
 * YETO Report Distribution Service
 * 
 * Handles email distribution of generated reports to subscribers
 * Supports tiered access (public, premium, vip)
 * Tracks delivery status and errors
 */

import { getDb } from "../db";
import { notifyOwner } from "../_core/notification";

// Types for distribution
export interface DistributionInput {
  reportId: number;
  language: "en" | "ar";
  s3Url: string;
  periodLabel: string;
  reportTitle: string;
}

export interface DistributionResult {
  success: boolean;
  totalSubscribers: number;
  emailsSent: number;
  emailsFailed: number;
  errors: string[];
}

export interface Subscriber {
  id: number;
  email: string;
  nameEn: string | null;
  nameAr: string | null;
  organization: string | null;
  tier: "public" | "premium" | "vip";
  preferredLanguage: "en" | "ar";
  subscribedTemplates: string[] | null;
  isActive: boolean;
  isVerified: boolean;
}

/**
 * Get all active subscribers for a report template
 */
export async function getSubscribersForReport(
  templateSlug: string,
  tier?: "public" | "premium" | "vip"
): Promise<Subscriber[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Query subscribers from the new table
  const result = await db.execute(`
    SELECT * FROM report_subscribers_new 
    WHERE isActive = 1 AND isVerified = 1
    ${tier ? `AND tier = '${tier}'` : ""}
    ORDER BY subscribedAt DESC
  `) as unknown as any[][];
  const rows = result[0] || [];
  
  // Filter by subscribed templates if specified
  const subscribers = rows.filter((sub: any) => {
    if (!sub.subscribedTemplates) return true; // Subscribe to all if not specified
    const templates = typeof sub.subscribedTemplates === "string" 
      ? JSON.parse(sub.subscribedTemplates) 
      : sub.subscribedTemplates;
    return templates.includes(templateSlug) || templates.length === 0;
  });
  
  return subscribers.map(sub => ({
    id: sub.id,
    email: sub.email,
    nameEn: sub.nameEn,
    nameAr: sub.nameAr,
    organization: sub.organization,
    tier: sub.tier,
    preferredLanguage: sub.preferredLanguage,
    subscribedTemplates: sub.subscribedTemplates,
    isActive: sub.isActive,
    isVerified: sub.isVerified,
  }));
}

/**
 * Generate email HTML content for report distribution
 */
function generateEmailHTML(
  subscriber: Subscriber,
  input: DistributionInput
): { subject: string; html: string } {
  const isArabic = subscriber.preferredLanguage === "ar";
  const name = isArabic 
    ? (subscriber.nameAr || subscriber.nameEn || subscriber.email)
    : (subscriber.nameEn || subscriber.email);
  
  const subject = isArabic
    ? `تقرير جديد من YETO: ${input.periodLabel}`
    : `New YETO Report: ${input.periodLabel}`;
  
  const html = `
<!DOCTYPE html>
<html lang="${subscriber.preferredLanguage}" dir="${isArabic ? "rtl" : "ltr"}">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: ${isArabic ? "'Noto Sans Arabic', Arial" : "'Inter', Arial"}, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .header .subtitle {
      opacity: 0.9;
      margin-top: 8px;
    }
    .content {
      background: #ffffff;
      padding: 30px;
      border: 1px solid #e0e0e0;
      border-top: none;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
    }
    .report-card {
      background: #f5f7fa;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      border-${isArabic ? "right" : "left"}: 4px solid #1e3a5f;
    }
    .report-title {
      font-size: 18px;
      font-weight: bold;
      color: #1e3a5f;
      margin-bottom: 8px;
    }
    .report-period {
      color: #666;
      margin-bottom: 16px;
    }
    .download-btn {
      display: inline-block;
      background: #1e3a5f;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
    }
    .download-btn:hover {
      background: #2d5a87;
    }
    .footer {
      background: #f5f7fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-radius: 0 0 8px 8px;
      border: 1px solid #e0e0e0;
      border-top: none;
    }
    .unsubscribe {
      color: #888;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${isArabic ? "مرصد اليمن للشفافية الاقتصادية" : "Yemen Economic Transparency Observatory"}</h1>
    <div class="subtitle">YETO</div>
  </div>
  
  <div class="content">
    <div class="greeting">
      ${isArabic ? `مرحباً ${name}،` : `Hello ${name},`}
    </div>
    
    <p>
      ${isArabic 
        ? "يسعدنا أن نرسل لك أحدث تقرير اقتصادي من YETO. يتضمن هذا التقرير تحليلاً شاملاً للوضع الاقتصادي في اليمن."
        : "We are pleased to send you the latest economic report from YETO. This report includes a comprehensive analysis of Yemen's economic situation."
      }
    </p>
    
    <div class="report-card">
      <div class="report-title">${input.reportTitle}</div>
      <div class="report-period">${input.periodLabel}</div>
      <a href="${input.s3Url}" class="download-btn">
        ${isArabic ? "تحميل التقرير" : "Download Report"}
      </a>
    </div>
    
    <p>
      ${isArabic
        ? "شكراً لاهتمامك بالشفافية الاقتصادية في اليمن. إذا كانت لديك أي أسئلة أو ملاحظات، لا تتردد في التواصل معنا."
        : "Thank you for your interest in economic transparency in Yemen. If you have any questions or feedback, please don't hesitate to contact us."
      }
    </p>
    
    <p>
      ${isArabic ? "مع أطيب التحيات،" : "Best regards,"}
      <br>
      ${isArabic ? "فريق YETO" : "The YETO Team"}
    </p>
  </div>
  
  <div class="footer">
    <p>
      ${isArabic 
        ? "© 2026 مرصد اليمن للشفافية الاقتصادية. جميع الحقوق محفوظة."
        : "© 2026 Yemen Economic Transparency Observatory. All rights reserved."
      }
    </p>
    <p>
      <a href="#" class="unsubscribe">
        ${isArabic ? "إلغاء الاشتراك" : "Unsubscribe"}
      </a>
    </p>
  </div>
</body>
</html>
  `;
  
  return { subject, html };
}

/**
 * Log distribution attempt to database
 */
async function logDistribution(
  reportId: number,
  subscriberId: number,
  email: string,
  language: "en" | "ar",
  status: "queued" | "sent" | "delivered" | "bounced" | "failed",
  errorMessage?: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.execute(`
    INSERT INTO report_distribution_log_new 
    (reportId, subscriberId, emailAddress, language, emailStatus, errorMessage)
    VALUES (
      ${reportId},
      ${subscriberId},
      '${email}',
      '${language}',
      '${status}',
      ${errorMessage ? `'${errorMessage}'` : 'NULL'}
    )
  `);
}

/**
 * Send email to a single subscriber (placeholder - integrate with email service)
 */
async function sendEmail(
  subscriber: Subscriber,
  subject: string,
  html: string
): Promise<{ success: boolean; error?: string }> {
  // In production, integrate with SES, SendGrid, or similar
  // For now, log the email and return success
  console.log(`[ReportDistribution] Sending email to ${subscriber.email}: ${subject}`);
  
  // Simulate email sending (90% success rate for demo)
  const success = Math.random() > 0.1;
  
  if (!success) {
    return { success: false, error: "Simulated email delivery failure" };
  }
  
  return { success: true };
}

/**
 * Distribute report to all eligible subscribers
 */
export async function distributeReport(
  input: DistributionInput
): Promise<DistributionResult> {
  const errors: string[] = [];
  let emailsSent = 0;
  let emailsFailed = 0;
  
  try {
    // Get all active subscribers
    const subscribers = await getSubscribersForReport("quarterly-economic-outlook");
    
    console.log(`[ReportDistribution] Distributing report to ${subscribers.length} subscribers`);
    
    for (const subscriber of subscribers) {
      try {
        // Generate email content
        const { subject, html } = generateEmailHTML(subscriber, input);
        
        // Log as queued
        await logDistribution(
          input.reportId,
          subscriber.id,
          subscriber.email,
          subscriber.preferredLanguage,
          "queued"
        );
        
        // Send email
        const result = await sendEmail(subscriber, subject, html);
        
        if (result.success) {
          emailsSent++;
          // Update log to sent
          await logDistribution(
            input.reportId,
            subscriber.id,
            subscriber.email,
            subscriber.preferredLanguage,
            "sent"
          );
        } else {
          emailsFailed++;
          errors.push(`Failed to send to ${subscriber.email}: ${result.error}`);
          // Update log to failed
          await logDistribution(
            input.reportId,
            subscriber.id,
            subscriber.email,
            subscriber.preferredLanguage,
            "failed",
            result.error
          );
        }
      } catch (err) {
        emailsFailed++;
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        errors.push(`Error processing ${subscriber.email}: ${errorMsg}`);
      }
    }
    
    // Notify owner of distribution results
    await notifyOwner({
      title: `Report Distribution Complete: ${input.periodLabel}`,
      content: `Distributed "${input.reportTitle}" to ${subscribers.length} subscribers.\n\nSent: ${emailsSent}\nFailed: ${emailsFailed}${errors.length > 0 ? `\n\nErrors:\n${errors.slice(0, 5).join("\n")}` : ""}`,
    });
    
    return {
      success: emailsFailed === 0,
      totalSubscribers: subscribers.length,
      emailsSent,
      emailsFailed,
      errors,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    errors.push(`Distribution failed: ${errorMsg}`);
    
    return {
      success: false,
      totalSubscribers: 0,
      emailsSent,
      emailsFailed,
      errors,
    };
  }
}

/**
 * Add a new subscriber
 */
export async function addSubscriber(
  email: string,
  options: {
    nameEn?: string;
    nameAr?: string;
    organization?: string;
    tier?: "public" | "premium" | "vip";
    preferredLanguage?: "en" | "ar";
    subscribedTemplates?: string[];
  } = {}
): Promise<{ success: boolean; subscriberId?: number; error?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    // Check if email already exists
    const existing = await db.execute(
      `SELECT id FROM report_subscribers_new WHERE email = '${email}'`
    ) as unknown as any[][];
    
    if (existing[0]?.length > 0) {
      return { success: false, error: "Email already subscribed" };
    }
    
    // Generate verification token
    const verificationToken = Math.random().toString(36).substring(2, 15) + 
      Math.random().toString(36).substring(2, 15);
    
    // Insert new subscriber
    const subscribedTemplatesJson = options.subscribedTemplates ? JSON.stringify(options.subscribedTemplates) : null;
    const result = await db.execute(`
      INSERT INTO report_subscribers_new 
      (email, nameEn, nameAr, organization, tier, preferredLanguage, subscribedTemplates, verificationToken)
      VALUES (
        '${email}',
        ${options.nameEn ? `'${options.nameEn}'` : 'NULL'},
        ${options.nameAr ? `'${options.nameAr}'` : 'NULL'},
        ${options.organization ? `'${options.organization}'` : 'NULL'},
        '${options.tier || "public"}',
        '${options.preferredLanguage || "en"}',
        ${subscribedTemplatesJson ? `'${subscribedTemplatesJson}'` : 'NULL'},
        '${verificationToken}'
      )
    `);
    
    const subscriberId = (result as any).insertId || 1;
    
    // TODO: Send verification email
    console.log(`[ReportDistribution] New subscriber added: ${email} (ID: ${subscriberId})`);
    
    return { success: true, subscriberId };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMsg };
  }
}

/**
 * Verify subscriber email
 */
export async function verifySubscriber(
  token: string
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const result = await db.execute(`
      UPDATE report_subscribers_new 
      SET isVerified = 1, verifiedAt = NOW(), verificationToken = NULL
      WHERE verificationToken = '${token}' AND isVerified = 0
    `);
    
    if ((result as any).affectedRows === 0) {
      return { success: false, error: "Invalid or expired verification token" };
    }
    
    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMsg };
  }
}

/**
 * Unsubscribe a subscriber
 */
export async function unsubscribe(
  email: string
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const result = await db.execute(`
      UPDATE report_subscribers_new 
      SET isActive = 0, unsubscribedAt = NOW()
      WHERE email = '${email}'
    `);
    
    if ((result as any).affectedRows === 0) {
      return { success: false, error: "Email not found" };
    }
    
    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMsg };
  }
}

/**
 * Get distribution statistics
 */
export async function getDistributionStats(): Promise<{
  totalSubscribers: number;
  activeSubscribers: number;
  verifiedSubscribers: number;
  tierDistribution: Record<string, number>;
  languageDistribution: Record<string, number>;
  recentDistributions: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const totalResult = await db.execute(
    `SELECT COUNT(*) as count FROM report_subscribers_new`
  ) as unknown as any[][];
  const activeResult = await db.execute(
    `SELECT COUNT(*) as count FROM report_subscribers_new WHERE isActive = 1`
  ) as unknown as any[][];
  const verifiedResult = await db.execute(
    `SELECT COUNT(*) as count FROM report_subscribers_new WHERE isVerified = 1`
  ) as unknown as any[][];
  const tierResult = await db.execute(
    `SELECT tier, COUNT(*) as count FROM report_subscribers_new GROUP BY tier`
  ) as unknown as any[][];
  const langResult = await db.execute(
    `SELECT preferredLanguage, COUNT(*) as count FROM report_subscribers_new GROUP BY preferredLanguage`
  ) as unknown as any[][];
  const recentResult = await db.execute(
    `SELECT COUNT(*) as count FROM report_distribution_log_new WHERE sentAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
  ) as unknown as any[][];
  
  const tierDistribution: Record<string, number> = {};
  for (const row of (tierResult[0] || [])) {
    tierDistribution[row.tier] = Number(row.count);
  }
  
  const languageDistribution: Record<string, number> = {};
  for (const row of (langResult[0] || [])) {
    languageDistribution[row.preferredLanguage] = Number(row.count);
  }
  
  return {
    totalSubscribers: Number(totalResult[0]?.[0]?.count) || 0,
    activeSubscribers: Number(activeResult[0]?.[0]?.count) || 0,
    verifiedSubscribers: Number(verifiedResult[0]?.[0]?.count) || 0,
    tierDistribution,
    languageDistribution,
    recentDistributions: Number(recentResult[0]?.[0]?.count) || 0,
  };
}

export default {
  distributeReport,
  addSubscriber,
  verifySubscriber,
  unsubscribe,
  getSubscribersForReport,
  getDistributionStats,
};
