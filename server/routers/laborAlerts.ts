/**
 * Labor Sector Alerts Router
 * Handles alerts and admin controls for labor market monitoring
 */

import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { db } from '../db';
import { alerts, timeSeries, indicators } from '../../drizzle/schema';
import { eq, and, desc, like, gte, lte } from 'drizzle-orm';

// Labor alert types
const LABOR_ALERT_TYPES = [
  'wage_adequacy_drop',
  'salary_payment_delay',
  'transfer_program_change',
  'remittance_cost_spike',
  'labor_force_shift',
  'unemployment_change',
  'food_basket_spike'
] as const;

export const laborAlertsRouter = router({
  // Get all labor sector alerts
  getAlerts: publicProcedure
    .input(z.object({
      limit: z.number().optional().default(20),
      status: z.enum(['active', 'acknowledged', 'resolved']).optional()
    }))
    .query(async ({ input }) => {
      try {
        const conditions = [like(alerts.type, '%labor%')];
        if (input.status) {
          // Map status to isRead boolean
          const isRead = input.status === 'acknowledged' || input.status === 'resolved';
          conditions.push(eq(alerts.isRead, isRead));
        }
        
        const results = await db.select()
          .from(alerts)
          .where(and(...conditions))
          .orderBy(desc(alerts.createdAt))
          .limit(input.limit);
        
        return results;
      } catch (error) {
        console.error('Error fetching labor alerts:', error);
        return [];
      }
    }),

  // Get wage adequacy trend
  getWageAdequacyTrend: publicProcedure
    .input(z.object({
      startYear: z.number().optional().default(2010),
      endYear: z.number().optional().default(2026)
    }))
    .query(async ({ input }) => {
      try {
        const results = await db.select()
          .from(timeSeries)
          .where(and(
            eq(timeSeries.indicatorCode, 'WAGE_ADEQUACY_RATIO'),
            gte(timeSeries.date, new Date(`${input.startYear}-01-01`)),
            lte(timeSeries.date, new Date(`${input.endYear}-12-31`))
          ))
          .orderBy(timeSeries.date);
        
        return results.map(r => ({
          date: r.date,
          value: parseFloat(r.value),
          confidence: r.confidenceRating
        }));
      } catch (error) {
        console.error('Error fetching wage adequacy trend:', error);
        return [];
      }
    }),

  // Get labor indicators summary
  getLaborIndicatorsSummary: publicProcedure.query(async () => {
    try {
      const laborIndicators = await db.select()
        .from(indicators)
        .where(eq(indicators.sector, 'labor_wages'));
      
      const summary = await Promise.all(laborIndicators.map(async (ind) => {
        const latestValue = await db.select()
          .from(timeSeries)
          .where(eq(timeSeries.indicatorCode, ind.code))
          .orderBy(desc(timeSeries.date))
          .limit(1);
        
        return {
          code: ind.code,
          nameEn: ind.nameEn,
          nameAr: ind.nameAr,
          unit: ind.unit,
          latestValue: latestValue.length > 0 ? parseFloat(latestValue[0].value) : null,
          latestDate: latestValue.length > 0 ? latestValue[0].date : null,
          confidence: latestValue.length > 0 ? latestValue[0].confidenceRating : null
        };
      }));
      
      return summary;
    } catch (error) {
      console.error('Error fetching labor indicators summary:', error);
      return [];
    }
  }),

  // Create labor alert (admin only)
  createAlert: protectedProcedure
    .input(z.object({
      titleEn: z.string(),
      titleAr: z.string(),
      descriptionEn: z.string(),
      descriptionAr: z.string().optional(),
      alertType: z.enum(['threshold_breach', 'staleness', 'contradiction_detected', 'significant_change', 'data_gap', 'source_update']),
      severity: z.enum(['critical', 'warning', 'info']),
      indicatorCode: z.string().optional(),
      thresholdValue: z.number().optional(),
      currentValue: z.number().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Use the alerts table which has a simpler schema
        const result = await db.insert(alerts).values({
          type: input.alertType,
          title: input.titleEn,
          titleAr: input.titleAr,
          description: input.descriptionEn,
          indicatorCode: input.indicatorCode,
          severity: input.severity,
          isRead: false
        });
        
        return { success: true, id: result[0].insertId };
      } catch (error) {
        console.error('Error creating labor alert:', error);
        return { success: false, error: 'Failed to create alert' };
      }
    }),

  // Acknowledge alert (admin only)
  acknowledgeAlert: protectedProcedure
    .input(z.object({
      alertId: z.number()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        await db.update(alerts)
          .set({ 
            isRead: true,
            acknowledgedAt: new Date(),
            acknowledgedBy: ctx.user.id
          })
          .where(eq(alerts.id, input.alertId));
        
        return { success: true };
      } catch (error) {
        console.error('Error acknowledging alert:', error);
        return { success: false };
      }
    }),

  // Resolve alert (admin only)
  resolveAlert: protectedProcedure
    .input(z.object({
      alertId: z.number(),
      resolution: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        await db.update(alerts)
          .set({ 
            isRead: true,
            acknowledgedAt: new Date(),
            description: `Resolved: ${input.resolution}`
          })
          .where(eq(alerts.id, input.alertId));
        
        return { success: true };
      } catch (error) {
        console.error('Error resolving alert:', error);
        return { success: false };
      }
    }),

  // Get data gaps for labor sector
  getDataGaps: publicProcedure.query(async () => {
    try {
      const laborIndicators = await db.select()
        .from(indicators)
        .where(eq(indicators.sector, 'labor_wages'));
      
      const gaps = [];
      
      for (const ind of laborIndicators) {
        const latestData = await db.select()
          .from(timeSeries)
          .where(eq(timeSeries.indicatorCode, ind.code))
          .orderBy(desc(timeSeries.date))
          .limit(1);
        
        const lastYear = latestData.length > 0 
          ? new Date(latestData[0].date).getFullYear() 
          : null;
        
        // If no data or data is more than 2 years old, it's a gap
        if (!lastYear || lastYear < 2024) {
          gaps.push({
            indicatorCode: ind.code,
            nameEn: ind.nameEn,
            nameAr: ind.nameAr,
            lastAvailableYear: lastYear,
            priority: !lastYear ? 'critical' : lastYear < 2020 ? 'high' : 'medium',
            accessWorkflow: getAccessWorkflow(ind.code)
          });
        }
      }
      
      return gaps;
    } catch (error) {
      console.error('Error fetching data gaps:', error);
      return [];
    }
  })
});

// Helper function to determine access workflow for data gaps
function getAccessWorkflow(indicatorCode: string): string {
  const workflows: Record<string, string> = {
    'UNEMPLOYMENT_RATE': 'Request from Yemen CSO or ILO modeled estimates',
    'LABOR_FORCE_TOTAL': 'Request from Yemen CSO or World Bank WDI',
    'WAGE_NOMINAL_AVG': 'Request from Ministry of Finance or UNDP surveys',
    'WAGE_PUBLIC_SECTOR': 'Request from Ministry of Finance payroll data',
    'BASKET_COST_FOOD': 'Available from WFP/FAO market bulletins',
    'REMITTANCE_INFLOWS': 'Request from Central Bank or World Bank estimates',
    'CASUAL_LABOR_WAGE': 'Available from WFP/FAO market bulletins'
  };
  
  return workflows[indicatorCode] || 'Contact relevant ministry or UN agency';
}

export default laborAlertsRouter;
