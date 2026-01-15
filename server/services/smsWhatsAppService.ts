/**
 * SMS/WhatsApp Notification Service for YETO Platform
 * 
 * Provides critical exchange rate alerts via SMS and WhatsApp
 * for users in areas with limited internet access.
 * 
 * Features:
 * - Multi-provider support (Twilio, WhatsApp Business API)
 * - Rate limiting to prevent abuse
 * - Bilingual message templates (Arabic/English)
 * - Critical alert triggers based on thresholds
 * - Delivery tracking and analytics
 */

import { getDb } from "../db";
import { notifyOwner } from "../_core/notification";

// Types
export interface SMSConfig {
  provider: "twilio" | "vonage" | "messagebird";
  accountSid?: string;
  authToken?: string;
  fromNumber: string;
  rateLimitPerHour: number;
  rateLimitPerDay: number;
}

export interface WhatsAppConfig {
  provider: "twilio" | "meta_business";
  accountSid?: string;
  authToken?: string;
  fromNumber: string;
  templateNamespace?: string;
  rateLimitPerHour: number;
  rateLimitPerDay: number;
}

export interface AlertRecipient {
  userId: string;
  phoneNumber: string;
  countryCode: string;
  preferredChannel: "sms" | "whatsapp" | "both";
  language: "ar" | "en";
  isVerified: boolean;
  alertPreferences: {
    exchangeRateAlerts: boolean;
    criticalThreshold: number; // Percentage change to trigger alert
    dailyDigest: boolean;
    weeklyReport: boolean;
  };
}

export interface AlertMessage {
  id: string;
  type: "exchange_rate" | "critical_event" | "daily_digest" | "weekly_report";
  channel: "sms" | "whatsapp";
  recipient: string;
  content: {
    en: string;
    ar: string;
  };
  priority: "critical" | "high" | "normal";
  sentAt?: Date;
  deliveredAt?: Date;
  status: "pending" | "sent" | "delivered" | "failed";
  retryCount: number;
}

// Message templates
const MESSAGE_TEMPLATES = {
  exchange_rate_alert: {
    en: (data: any) => `🔔 YETO Alert: YER/USD rate changed ${data.direction} ${data.changePercent}% to ${data.newRate} (${data.regime}). Previous: ${data.oldRate}. Time: ${data.timestamp}`,
    ar: (data: any) => `🔔 تنبيه يتو: سعر الصرف ${data.direction === 'up' ? 'ارتفع' : 'انخفض'} ${data.changePercent}% إلى ${data.newRate} ريال (${data.regime === 'aden' ? 'عدن' : 'صنعاء'}). السابق: ${data.oldRate}. الوقت: ${data.timestamp}`,
  },
  critical_spread_alert: {
    en: (data: any) => `⚠️ CRITICAL: Aden-Sana'a spread reached ${data.spread}%. Aden: ${data.adenRate}, Sana'a: ${data.sanaaRate}. This indicates significant market stress.`,
    ar: (data: any) => `⚠️ تحذير: الفارق بين عدن وصنعاء وصل ${data.spread}%. عدن: ${data.adenRate}، صنعاء: ${data.sanaaRate}. هذا يشير إلى ضغط كبير في السوق.`,
  },
  daily_digest: {
    en: (data: any) => `📊 YETO Daily: Aden ${data.adenRate} (${data.adenChange}%), Sana'a ${data.sanaaRate} (${data.sanaaChange}%). Spread: ${data.spread}%. ${data.eventCount} economic events today.`,
    ar: (data: any) => `📊 يتو اليومي: عدن ${data.adenRate} (${data.adenChange}%)، صنعاء ${data.sanaaRate} (${data.sanaaChange}%). الفارق: ${data.spread}%. ${data.eventCount} أحداث اقتصادية اليوم.`,
  },
  weekly_summary: {
    en: (data: any) => `📈 YETO Weekly: Aden ${data.adenWeekChange}%, Sana'a ${data.sanaaWeekChange}%. Key events: ${data.topEvents}. Full report: ${data.reportUrl}`,
    ar: (data: any) => `📈 يتو الأسبوعي: عدن ${data.adenWeekChange}%، صنعاء ${data.sanaaWeekChange}%. أهم الأحداث: ${data.topEvents}. التقرير الكامل: ${data.reportUrl}`,
  },
  verification_code: {
    en: (data: any) => `Your YETO verification code is: ${data.code}. Valid for 10 minutes. Do not share this code.`,
    ar: (data: any) => `رمز التحقق من يتو: ${data.code}. صالح لمدة 10 دقائق. لا تشارك هذا الرمز.`,
  },
};

// Rate limiting storage
const rateLimitStore = new Map<string, { hourly: number; daily: number; lastReset: Date }>();

/**
 * SMS/WhatsApp Notification Service
 */
export class SMSWhatsAppService {
  private smsConfig: SMSConfig;
  private whatsAppConfig: WhatsAppConfig;
  private messageQueue: AlertMessage[] = [];
  private deliveryLog: Map<string, AlertMessage> = new Map();

  constructor() {
    // Default configuration (would be loaded from env in production)
    this.smsConfig = {
      provider: "twilio",
      fromNumber: "+1234567890",
      rateLimitPerHour: 10,
      rateLimitPerDay: 50,
    };

    this.whatsAppConfig = {
      provider: "twilio",
      fromNumber: "whatsapp:+1234567890",
      rateLimitPerHour: 20,
      rateLimitPerDay: 100,
    };
  }

  /**
   * Send exchange rate alert
   */
  async sendExchangeRateAlert(
    recipient: AlertRecipient,
    data: {
      oldRate: number;
      newRate: number;
      changePercent: number;
      direction: "up" | "down";
      regime: "aden" | "sanaa";
      timestamp: string;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Check if alert threshold is met
    if (Math.abs(data.changePercent) < recipient.alertPreferences.criticalThreshold) {
      return { success: false, error: "Change below threshold" };
    }

    // Check rate limits
    const rateLimitCheck = this.checkRateLimit(recipient.userId);
    if (!rateLimitCheck.allowed) {
      return { success: false, error: `Rate limit exceeded: ${rateLimitCheck.reason}` };
    }

    // Generate message
    const template = MESSAGE_TEMPLATES.exchange_rate_alert;
    const content = {
      en: template.en(data),
      ar: template.ar(data),
    };

    // Determine channel
    const channel = recipient.preferredChannel === "both" ? "whatsapp" : recipient.preferredChannel;

    // Create message
    const message: AlertMessage = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "exchange_rate",
      channel,
      recipient: recipient.phoneNumber,
      content,
      priority: Math.abs(data.changePercent) > 5 ? "critical" : "high",
      status: "pending",
      retryCount: 0,
    };

    // Send message
    return this.sendMessage(message, recipient.language);
  }

  /**
   * Send critical spread alert
   */
  async sendCriticalSpreadAlert(
    recipient: AlertRecipient,
    data: {
      adenRate: number;
      sanaaRate: number;
      spread: number;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Only send if spread exceeds critical threshold (200%)
    if (data.spread < 200) {
      return { success: false, error: "Spread below critical threshold" };
    }

    const template = MESSAGE_TEMPLATES.critical_spread_alert;
    const content = {
      en: template.en(data),
      ar: template.ar(data),
    };

    const message: AlertMessage = {
      id: `spread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "critical_event",
      channel: "both" as any, // Send via both channels for critical alerts
      recipient: recipient.phoneNumber,
      content,
      priority: "critical",
      status: "pending",
      retryCount: 0,
    };

    return this.sendMessage(message, recipient.language);
  }

  /**
   * Send daily digest
   */
  async sendDailyDigest(
    recipient: AlertRecipient,
    data: {
      adenRate: number;
      adenChange: number;
      sanaaRate: number;
      sanaaChange: number;
      spread: number;
      eventCount: number;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!recipient.alertPreferences.dailyDigest) {
      return { success: false, error: "Daily digest not enabled" };
    }

    const template = MESSAGE_TEMPLATES.daily_digest;
    const content = {
      en: template.en(data),
      ar: template.ar(data),
    };

    const message: AlertMessage = {
      id: `digest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "daily_digest",
      channel: recipient.preferredChannel === "both" ? "whatsapp" : recipient.preferredChannel,
      recipient: recipient.phoneNumber,
      content,
      priority: "normal",
      status: "pending",
      retryCount: 0,
    };

    return this.sendMessage(message, recipient.language);
  }

  /**
   * Send verification code for phone number verification
   */
  async sendVerificationCode(
    phoneNumber: string,
    countryCode: string,
    language: "ar" | "en"
  ): Promise<{ success: boolean; code?: string; error?: string }> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    const template = MESSAGE_TEMPLATES.verification_code;
    const content = {
      en: template.en({ code }),
      ar: template.ar({ code }),
    };

    const message: AlertMessage = {
      id: `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "critical_event",
      channel: "sms", // Always use SMS for verification
      recipient: `${countryCode}${phoneNumber}`,
      content,
      priority: "critical",
      status: "pending",
      retryCount: 0,
    };

    const result = await this.sendMessage(message, language);
    
    if (result.success) {
      return { success: true, code };
    }
    return { success: false, error: result.error };
  }

  /**
   * Send message via appropriate channel
   */
  private async sendMessage(
    message: AlertMessage,
    language: "ar" | "en"
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const messageContent = language === "ar" ? message.content.ar : message.content.en;

    try {
      if (message.channel === "sms") {
        return await this.sendSMS(message.recipient, messageContent, message.id);
      } else if (message.channel === "whatsapp") {
        return await this.sendWhatsApp(message.recipient, messageContent, message.id);
      } else {
        // Send via both channels
        const smsResult = await this.sendSMS(message.recipient, messageContent, message.id);
        const whatsAppResult = await this.sendWhatsApp(message.recipient, messageContent, message.id);
        
        return {
          success: smsResult.success || whatsAppResult.success,
          messageId: message.id,
          error: smsResult.success ? undefined : `SMS: ${smsResult.error}, WhatsApp: ${whatsAppResult.error}`,
        };
      }
    } catch (error) {
      console.error(`[SMSWhatsApp] Error sending message:`, error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Send SMS via provider
   */
  private async sendSMS(
    to: string,
    body: string,
    messageId: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // In production, this would call the actual SMS provider API
    console.log(`[SMS] Sending to ${to}: ${body.substring(0, 50)}...`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Log delivery
    this.deliveryLog.set(messageId, {
      id: messageId,
      type: "exchange_rate",
      channel: "sms",
      recipient: to,
      content: { en: body, ar: body },
      priority: "normal",
      sentAt: new Date(),
      status: "sent",
      retryCount: 0,
    });

    // Notify owner for critical alerts (in production)
    // await notifyOwner({ title: "SMS Alert Sent", content: `To: ${to}` });

    return { success: true, messageId };
  }

  /**
   * Send WhatsApp message via provider
   */
  private async sendWhatsApp(
    to: string,
    body: string,
    messageId: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // In production, this would call the WhatsApp Business API
    console.log(`[WhatsApp] Sending to ${to}: ${body.substring(0, 50)}...`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Log delivery
    this.deliveryLog.set(messageId, {
      id: messageId,
      type: "exchange_rate",
      channel: "whatsapp",
      recipient: to,
      content: { en: body, ar: body },
      priority: "normal",
      sentAt: new Date(),
      status: "sent",
      retryCount: 0,
    });

    return { success: true, messageId };
  }

  /**
   * Check rate limits for a user
   */
  private checkRateLimit(userId: string): { allowed: boolean; reason?: string } {
    const now = new Date();
    let userLimits = rateLimitStore.get(userId);

    if (!userLimits || now.getTime() - userLimits.lastReset.getTime() > 24 * 60 * 60 * 1000) {
      // Reset daily limits
      userLimits = { hourly: 0, daily: 0, lastReset: now };
      rateLimitStore.set(userId, userLimits);
    }

    // Check hourly limit
    if (userLimits.hourly >= this.smsConfig.rateLimitPerHour) {
      return { allowed: false, reason: "Hourly limit exceeded" };
    }

    // Check daily limit
    if (userLimits.daily >= this.smsConfig.rateLimitPerDay) {
      return { allowed: false, reason: "Daily limit exceeded" };
    }

    // Increment counters
    userLimits.hourly++;
    userLimits.daily++;
    rateLimitStore.set(userId, userLimits);

    return { allowed: true };
  }

  /**
   * Get delivery statistics
   */
  getDeliveryStats(): {
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    byChannel: { sms: number; whatsapp: number };
    byType: Record<string, number>;
  } {
    let totalSent = 0;
    let totalDelivered = 0;
    let totalFailed = 0;
    const byChannel = { sms: 0, whatsapp: 0 };
    const byType: Record<string, number> = {};

    this.deliveryLog.forEach(msg => {
      if (msg.status === "sent" || msg.status === "delivered") {
        totalSent++;
        if (msg.status === "delivered") totalDelivered++;
        byChannel[msg.channel]++;
        byType[msg.type] = (byType[msg.type] || 0) + 1;
      } else if (msg.status === "failed") {
        totalFailed++;
      }
    });

    return { totalSent, totalDelivered, totalFailed, byChannel, byType };
  }

  /**
   * Process alert queue (called by scheduler)
   */
  async processAlertQueue(): Promise<{ processed: number; failed: number }> {
    let processed = 0;
    let failed = 0;

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()!;
      const result = await this.sendMessage(message, "en");
      
      if (result.success) {
        processed++;
      } else {
        failed++;
        // Retry logic
        if (message.retryCount < 3) {
          message.retryCount++;
          this.messageQueue.push(message);
        }
      }
    }

    return { processed, failed };
  }
}

// Export singleton instance
export const smsWhatsAppService = new SMSWhatsAppService();

export default SMSWhatsAppService;
