/**
 * Signal Detector Service
 * Monitors key economic indicators and triggers alerts when thresholds are crossed
 */

import { getDb } from "../db";
import { timeSeries, economicEvents, alerts } from "../../drizzle/schema";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

// ============================================
// Types
// ============================================

export interface SignalThreshold {
  id: string;
  name: string;
  nameAr: string;
  indicatorCode: string;
  condition: 'above' | 'below' | 'change_above' | 'change_below' | 'spike';
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
  description: string;
  descriptionAr: string;
  enabled: boolean;
}

export interface DetectedSignal {
  thresholdId: string;
  indicatorCode: string;
  currentValue: number;
  previousValue: number | null;
  changePercent: number | null;
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  messageAr: string;
  detectedAt: Date;
}

// ============================================
// Default Signal Thresholds
// ============================================

export const DEFAULT_THRESHOLDS: SignalThreshold[] = [
  // Exchange Rate Signals
  {
    id: 'fx_spike_5pct',
    name: 'Exchange Rate Spike (5%)',
    nameAr: 'ارتفاع سعر الصرف (5%)',
    indicatorCode: 'FX_ADEN_PARALLEL',
    condition: 'change_above',
    threshold: 5,
    severity: 'warning',
    description: 'Exchange rate increased by more than 5% in a single day',
    descriptionAr: 'ارتفع سعر الصرف بأكثر من 5% في يوم واحد',
    enabled: true,
  },
  {
    id: 'fx_spike_10pct',
    name: 'Exchange Rate Spike (10%)',
    nameAr: 'ارتفاع حاد في سعر الصرف (10%)',
    indicatorCode: 'FX_ADEN_PARALLEL',
    condition: 'change_above',
    threshold: 10,
    severity: 'critical',
    description: 'Exchange rate increased by more than 10% in a single day',
    descriptionAr: 'ارتفع سعر الصرف بأكثر من 10% في يوم واحد',
    enabled: true,
  },
  {
    id: 'fx_above_2000',
    name: 'Exchange Rate Above 2000 YER/USD',
    nameAr: 'سعر الصرف فوق 2000 ريال/دولار',
    indicatorCode: 'FX_ADEN_PARALLEL',
    condition: 'above',
    threshold: 2000,
    severity: 'warning',
    description: 'Exchange rate exceeded 2000 YER per USD',
    descriptionAr: 'تجاوز سعر الصرف 2000 ريال للدولار',
    enabled: true,
  },
  {
    id: 'fx_above_2500',
    name: 'Exchange Rate Above 2500 YER/USD',
    nameAr: 'سعر الصرف فوق 2500 ريال/دولار',
    indicatorCode: 'FX_ADEN_PARALLEL',
    condition: 'above',
    threshold: 2500,
    severity: 'critical',
    description: 'Exchange rate exceeded 2500 YER per USD - severe depreciation',
    descriptionAr: 'تجاوز سعر الصرف 2500 ريال للدولار - انخفاض حاد',
    enabled: true,
  },
  
  // Inflation Signals
  {
    id: 'inflation_above_20',
    name: 'Inflation Above 20%',
    nameAr: 'التضخم فوق 20%',
    indicatorCode: 'INFLATION_CPI',
    condition: 'above',
    threshold: 20,
    severity: 'warning',
    description: 'Annual inflation rate exceeded 20%',
    descriptionAr: 'تجاوز معدل التضخم السنوي 20%',
    enabled: true,
  },
  {
    id: 'inflation_above_30',
    name: 'Inflation Above 30%',
    nameAr: 'التضخم فوق 30%',
    indicatorCode: 'INFLATION_CPI',
    condition: 'above',
    threshold: 30,
    severity: 'critical',
    description: 'Annual inflation rate exceeded 30% - hyperinflation risk',
    descriptionAr: 'تجاوز معدل التضخم السنوي 30% - خطر التضخم المفرط',
    enabled: true,
  },
  
  // Food Security Signals
  {
    id: 'food_insecurity_50pct',
    name: 'Food Insecurity Above 50%',
    nameAr: 'انعدام الأمن الغذائي فوق 50%',
    indicatorCode: 'FEWS_FOOD_INSECURITY_RATE',
    condition: 'above',
    threshold: 50,
    severity: 'warning',
    description: 'More than 50% of population in food crisis or worse',
    descriptionAr: 'أكثر من 50% من السكان في أزمة غذائية أو أسوأ',
    enabled: true,
  },
  {
    id: 'food_insecurity_60pct',
    name: 'Food Insecurity Above 60%',
    nameAr: 'انعدام الأمن الغذائي فوق 60%',
    indicatorCode: 'FEWS_FOOD_INSECURITY_RATE',
    condition: 'above',
    threshold: 60,
    severity: 'critical',
    description: 'More than 60% of population in food crisis - famine risk',
    descriptionAr: 'أكثر من 60% من السكان في أزمة غذائية - خطر المجاعة',
    enabled: true,
  },
  
  // Humanitarian Funding Signals
  {
    id: 'funding_gap_50pct',
    name: 'Humanitarian Funding Gap Above 50%',
    nameAr: 'فجوة التمويل الإنساني فوق 50%',
    indicatorCode: 'OCHA_FUNDING_GAP',
    condition: 'above',
    threshold: 50,
    severity: 'warning',
    description: 'Humanitarian response plan is less than 50% funded',
    descriptionAr: 'خطة الاستجابة الإنسانية ممولة بأقل من 50%',
    enabled: true,
  },
  
  // IDP/Refugee Signals
  {
    id: 'idp_increase_10pct',
    name: 'IDP Increase Above 10%',
    nameAr: 'زيادة النازحين فوق 10%',
    indicatorCode: 'UNHCR_IDPS',
    condition: 'change_above',
    threshold: 10,
    severity: 'warning',
    description: 'Number of internally displaced persons increased by more than 10%',
    descriptionAr: 'زاد عدد النازحين داخلياً بأكثر من 10%',
    enabled: true,
  },
  
  // GDP Signals
  {
    id: 'gdp_decline_5pct',
    name: 'GDP Decline Above 5%',
    nameAr: 'انخفاض الناتج المحلي فوق 5%',
    indicatorCode: 'GDP_GROWTH',
    condition: 'below',
    threshold: -5,
    severity: 'warning',
    description: 'GDP growth fell below -5% (severe contraction)',
    descriptionAr: 'انخفض نمو الناتج المحلي إلى أقل من -5% (انكماش حاد)',
    enabled: true,
  },
  
  // Sanctions Signals
  {
    id: 'sanctions_intensity_high',
    name: 'Sanctions Intensity High',
    nameAr: 'شدة العقوبات مرتفعة',
    indicatorCode: 'SANCTIONS_INTENSITY_INDEX',
    condition: 'above',
    threshold: 70,
    severity: 'warning',
    description: 'Sanctions Intensity Index exceeded 70 - high economic pressure',
    descriptionAr: 'تجاوز مؤشر شدة العقوبات 70 - ضغط اقتصادي مرتفع',
    enabled: true,
  },
];

// ============================================
// Signal Detection Functions
// ============================================

/**
 * Get the latest value for an indicator
 */
async function getLatestValue(indicatorCode: string): Promise<{ value: number; date: Date } | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select()
    .from(timeSeries)
    .where(eq(timeSeries.indicatorCode, indicatorCode))
    .orderBy(desc(timeSeries.date))
    .limit(1);
  
  if (result.length === 0) return null;
  
  return {
    value: parseFloat(result[0].value),
    date: result[0].date,
  };
}

/**
 * Get the previous value for an indicator (before the latest)
 */
async function getPreviousValue(indicatorCode: string): Promise<{ value: number; date: Date } | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select()
    .from(timeSeries)
    .where(eq(timeSeries.indicatorCode, indicatorCode))
    .orderBy(desc(timeSeries.date))
    .limit(2);
  
  if (result.length < 2) return null;
  
  return {
    value: parseFloat(result[1].value),
    date: result[1].date,
  };
}

/**
 * Check if a threshold is triggered
 */
function checkThreshold(
  threshold: SignalThreshold,
  currentValue: number,
  previousValue: number | null
): boolean {
  switch (threshold.condition) {
    case 'above':
      return currentValue > threshold.threshold;
    
    case 'below':
      return currentValue < threshold.threshold;
    
    case 'change_above':
      if (previousValue === null || previousValue === 0) return false;
      const changeUp = ((currentValue - previousValue) / previousValue) * 100;
      return changeUp > threshold.threshold;
    
    case 'change_below':
      if (previousValue === null || previousValue === 0) return false;
      const changeDown = ((currentValue - previousValue) / previousValue) * 100;
      return changeDown < -threshold.threshold;
    
    case 'spike':
      if (previousValue === null || previousValue === 0) return false;
      const absChange = Math.abs((currentValue - previousValue) / previousValue) * 100;
      return absChange > threshold.threshold;
    
    default:
      return false;
  }
}

/**
 * Run signal detection for all enabled thresholds
 */
export async function detectSignals(thresholds?: SignalThreshold[]): Promise<DetectedSignal[]> {
  const activeThresholds = (thresholds || DEFAULT_THRESHOLDS).filter(t => t.enabled);
  const detectedSignals: DetectedSignal[] = [];
  
  for (const threshold of activeThresholds) {
    try {
      const latest = await getLatestValue(threshold.indicatorCode);
      if (!latest) continue;
      
      const previous = await getPreviousValue(threshold.indicatorCode);
      const previousValue = previous?.value ?? null;
      
      const isTriggered = checkThreshold(threshold, latest.value, previousValue);
      
      if (isTriggered) {
        const changePercent = previousValue !== null && previousValue !== 0
          ? ((latest.value - previousValue) / previousValue) * 100
          : null;
        
        detectedSignals.push({
          thresholdId: threshold.id,
          indicatorCode: threshold.indicatorCode,
          currentValue: latest.value,
          previousValue,
          changePercent,
          threshold: threshold.threshold,
          severity: threshold.severity,
          message: `${threshold.name}: Current value ${latest.value.toFixed(2)} ${threshold.condition === 'above' ? 'exceeds' : threshold.condition === 'below' ? 'is below' : 'changed by'} threshold ${threshold.threshold}`,
          messageAr: threshold.descriptionAr,
          detectedAt: new Date(),
        });
      }
    } catch (error) {
      console.error(`[SignalDetector] Error checking threshold ${threshold.id}:`, error);
    }
  }
  
  return detectedSignals;
}

/**
 * Store detected signals as alerts in the database
 */
export async function storeAlerts(signals: DetectedSignal[]): Promise<number> {
  const db = await getDb();
  if (!db || signals.length === 0) return 0;
  
  let stored = 0;
  
  for (const signal of signals) {
    try {
      await db.insert(alerts).values({
        type: signal.severity,
        title: signal.message.substring(0, 255),
        titleAr: signal.messageAr.substring(0, 255),
        description: JSON.stringify({
          thresholdId: signal.thresholdId,
          indicatorCode: signal.indicatorCode,
          currentValue: signal.currentValue,
          previousValue: signal.previousValue,
          changePercent: signal.changePercent,
          threshold: signal.threshold,
        }),
        indicatorCode: signal.indicatorCode,
        severity: signal.severity,
        isRead: false,
        createdAt: signal.detectedAt,
      });
      stored++;
    } catch (error) {
      // Ignore duplicate alerts
    }
  }
  
  return stored;
}

/**
 * Send notifications for critical alerts
 */
export async function notifyCriticalAlerts(signals: DetectedSignal[]): Promise<void> {
  const criticalSignals = signals.filter(s => s.severity === 'critical');
  
  if (criticalSignals.length === 0) return;
  
  const title = `🚨 YETO Critical Alert: ${criticalSignals.length} signal(s) detected`;
  const content = criticalSignals.map(s => 
    `• ${s.message}\n  Current: ${s.currentValue.toFixed(2)}, Threshold: ${s.threshold}`
  ).join('\n\n');
  
  try {
    await notifyOwner({ title, content });
    console.log(`[SignalDetector] Sent notification for ${criticalSignals.length} critical alerts`);
  } catch (error) {
    console.error('[SignalDetector] Failed to send notification:', error);
  }
}

/**
 * Run full signal detection cycle
 */
export async function runSignalDetection(): Promise<{
  signalsDetected: number;
  alertsStored: number;
  criticalCount: number;
}> {
  console.log('[SignalDetector] Starting signal detection cycle...');
  
  const signals = await detectSignals();
  console.log(`[SignalDetector] Detected ${signals.length} signals`);
  
  const alertsStored = await storeAlerts(signals);
  console.log(`[SignalDetector] Stored ${alertsStored} new alerts`);
  
  await notifyCriticalAlerts(signals);
  
  const criticalCount = signals.filter(s => s.severity === 'critical').length;
  
  return {
    signalsDetected: signals.length,
    alertsStored,
    criticalCount,
  };
}

/**
 * Get recent alerts from database
 */
export async function getRecentAlerts(limit: number = 50): Promise<Array<{
  id: number;
  type: string;
  title: string;
  severity: string;
  indicatorCode: string | null;
  isRead: boolean;
  createdAt: Date;
}>> {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select()
    .from(alerts)
    .orderBy(desc(alerts.createdAt))
    .limit(limit);
  
  return result.map(r => ({
    id: r.id,
    type: r.type,
    title: r.title,
    severity: r.severity || 'info',
    indicatorCode: r.indicatorCode,
    isRead: r.isRead,
    createdAt: r.createdAt,
  }));
}

/**
 * Mark alert as read
 */
export async function markAlertRead(alertId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  await db.update(alerts)
    .set({ isRead: true })
    .where(eq(alerts.id, alertId));
  
  return true;
}

// Export for scheduler
export const signalDetector = {
  detect: detectSignals,
  run: runSignalDetection,
  getAlerts: getRecentAlerts,
  markRead: markAlertRead,
  thresholds: DEFAULT_THRESHOLDS,
};
