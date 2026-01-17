/**
 * Email Notification Service
 * Handles sending email notifications for alerts, webhooks, and system events
 */

import { getDb } from "../db";
import { sql } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

export interface EmailNotificationPayload {
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  priority?: "low" | "normal" | "high" | "critical";
  metadata?: Record<string, unknown>;
}

export interface EmailTemplate {
  subject: string;
  htmlBody: string;
  textBody: string;
}

/**
 * Queue an email for delivery
 */
export async function queueEmail(payload: EmailNotificationPayload): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.execute(sql`
    INSERT INTO email_notification_queue 
    (recipientEmail, recipientName, subject, htmlBody, textBody, priority, metadata, status)
    VALUES (
      ${payload.recipientEmail},
      ${payload.recipientName || null},
      ${payload.subject},
      ${payload.htmlBody},
      ${payload.textBody || null},
      ${payload.priority || "normal"},
      ${payload.metadata ? JSON.stringify(payload.metadata) : null},
      'pending'
    )
  `);
  
  return (result as any).insertId;
}

/**
 * Process pending emails in the queue
 */
export async function processEmailQueue(batchSize: number = 10): Promise<{ sent: number; failed: number }> {
  const db = await getDb();
  if (!db) return { sent: 0, failed: 0 };
  let sent = 0;
  let failed = 0;
  
  // Get pending emails ordered by priority and creation time
  const pendingEmails = await db.execute(sql`
    SELECT * FROM email_notification_queue 
    WHERE status = 'pending' AND attempts < 3
    ORDER BY 
      FIELD(priority, 'critical', 'high', 'normal', 'low'),
      createdAt ASC
    LIMIT ${batchSize}
  `);
  
  for (const email of pendingEmails as any[]) {
    try {
      // Mark as sending
      await db.execute(sql`
        UPDATE email_notification_queue 
        SET status = 'sending', lastAttempt = NOW(), attempts = attempts + 1
        WHERE id = ${email.id}
      `);
      
      // Use the built-in notification system to send
      // This leverages the Manus platform's notification capabilities
      const success = await notifyOwner({
        title: email.subject,
        content: email.textBody || stripHtml(email.htmlBody),
      });
      
      if (success) {
        await db.execute(sql`
          UPDATE email_notification_queue 
          SET status = 'sent', sentAt = NOW()
          WHERE id = ${email.id}
        `);
        sent++;
      } else {
        throw new Error("Notification service returned false");
      }
    } catch (error: any) {
      await db.execute(sql`
        UPDATE email_notification_queue 
        SET status = ${email.attempts >= 2 ? 'failed' : 'pending'}, 
            errorMessage = ${error.message}
        WHERE id = ${email.id}
      `);
      failed++;
    }
  }
  
  return { sent, failed };
}

/**
 * Strip HTML tags from content
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Generate email template for connector failure alert
 */
export function generateConnectorFailureEmail(
  connectorName: string,
  errorMessage: string,
  timestamp: Date
): EmailTemplate {
  const subject = `[YETO Alert] Connector Failure: ${connectorName}`;
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Connector Failure Alert</h1>
      </div>
      <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="color: #374151; font-size: 16px; margin-bottom: 16px;">
          A data connector has failed to fetch data from its source.
        </p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Connector:</td>
            <td style="padding: 8px 0; color: #111827; font-weight: 600;">${connectorName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Error:</td>
            <td style="padding: 8px 0; color: #dc2626;">${errorMessage}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Time:</td>
            <td style="padding: 8px 0; color: #111827;">${timestamp.toISOString()}</td>
          </tr>
        </table>
        <a href="https://yeto.org/admin/api-health" style="display: inline-block; background: #107040; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
          View API Health Dashboard
        </a>
      </div>
      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 16px;">
        YETO - Yemen Economic Transparency Observatory
      </p>
    </div>
  `;
  
  const textBody = `
CONNECTOR FAILURE ALERT

Connector: ${connectorName}
Error: ${errorMessage}
Time: ${timestamp.toISOString()}

View the API Health Dashboard at: https://yeto.org/admin/api-health

---
YETO - Yemen Economic Transparency Observatory
  `.trim();
  
  return { subject, htmlBody, textBody };
}

/**
 * Generate email template for stale data warning
 */
export function generateStaleDataEmail(
  connectorName: string,
  daysSinceUpdate: number,
  threshold: number,
  severity: "warning" | "critical"
): EmailTemplate {
  const isCritical = severity === "critical";
  const subject = `[YETO ${isCritical ? "Critical" : "Warning"}] Stale Data: ${connectorName}`;
  
  const gradientColor = isCritical ? "#dc2626, #ef4444" : "#f59e0b, #fbbf24";
  const emoji = isCritical ? "🚨" : "⚠️";
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, ${gradientColor}); padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">${emoji} Stale Data ${severity === "critical" ? "Critical" : "Warning"}</h1>
      </div>
      <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="color: #374151; font-size: 16px; margin-bottom: 16px;">
          Data from <strong>${connectorName}</strong> has not been updated in ${daysSinceUpdate} days, 
          exceeding the ${threshold}-day ${severity} threshold.
        </p>
        <div style="background: ${isCritical ? "#fef2f2" : "#fffbeb"}; border: 1px solid ${isCritical ? "#fecaca" : "#fde68a"}; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
          <p style="margin: 0; color: ${isCritical ? "#991b1b" : "#92400e"}; font-weight: 500;">
            ${isCritical 
              ? "Immediate action required. Users may be viewing outdated information."
              : "Please investigate and refresh the data source when possible."}
          </p>
        </div>
        <a href="https://yeto.org/admin/connector-thresholds" style="display: inline-block; background: #107040; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
          Manage Connector Thresholds
        </a>
      </div>
      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 16px;">
        YETO - Yemen Economic Transparency Observatory
      </p>
    </div>
  `;
  
  const textBody = `
STALE DATA ${severity.toUpperCase()}

Connector: ${connectorName}
Days since update: ${daysSinceUpdate}
Threshold: ${threshold} days

${isCritical 
  ? "Immediate action required. Users may be viewing outdated information."
  : "Please investigate and refresh the data source when possible."}

Manage thresholds at: https://yeto.org/admin/connector-thresholds

---
YETO - Yemen Economic Transparency Observatory
  `.trim();
  
  return { subject, htmlBody, textBody };
}

/**
 * Generate email template for new publication notification
 */
export function generateNewPublicationEmail(
  publicationType: string,
  title: string,
  summary: string,
  url: string
): EmailTemplate {
  const subject = `[YETO] New ${publicationType}: ${title}`;
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #107040, #059669); padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">📊 New ${publicationType} Available</h1>
      </div>
      <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <h2 style="color: #111827; font-size: 20px; margin-top: 0;">${title}</h2>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          ${summary}
        </p>
        <a href="${url}" style="display: inline-block; background: #107040; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; margin-top: 16px;">
          Read Full Report
        </a>
      </div>
      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 16px;">
        YETO - Yemen Economic Transparency Observatory
      </p>
    </div>
  `;
  
  const textBody = `
NEW ${publicationType.toUpperCase()} AVAILABLE

${title}

${summary}

Read the full report at: ${url}

---
YETO - Yemen Economic Transparency Observatory
  `.trim();
  
  return { subject, htmlBody, textBody };
}

/**
 * Send email notification for a webhook event
 */
export async function sendEmailNotification(
  recipientEmail: string,
  template: EmailTemplate,
  priority: "low" | "normal" | "high" | "critical" = "normal"
): Promise<number> {
  return queueEmail({
    recipientEmail,
    subject: template.subject,
    htmlBody: template.htmlBody,
    textBody: template.textBody,
    priority,
  });
}

export const emailNotificationService = {
  queueEmail,
  processEmailQueue,
  sendEmailNotification,
  generateConnectorFailureEmail,
  generateStaleDataEmail,
  generateNewPublicationEmail,
};
