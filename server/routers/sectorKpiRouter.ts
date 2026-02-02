/**
 * Sector KPI Router - Live Database Queries for Intelligence Walls
 * Provides real-time KPIs for all sector pages from the database
 */

import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { 
  timeSeries, 
  datasets,
  sources,
  economicEvents,
  evidencePacks
} from "../../drizzle/schema";
import { sql, desc, eq, and, gte, lte, like, or } from "drizzle-orm";

// Helper to calculate year-over-year change
function calculateYoYChange(current: number, previous: number): string {
  if (!previous || previous === 0) return "N/A";
  const change = ((current - previous) / Math.abs(previous)) * 100;
  return change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
}

// Helper to format large numbers
function formatNumber(num: number, decimals: number = 1): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
  return num.toFixed(decimals);
}

// Get latest observation for an indicator
async function getLatestIndicatorValue(db: any, indicatorCode: string) {
  const result = await db
    .select({
      value: timeSeries.value,
      date: timeSeries.date,
      indicatorCode: timeSeries.indicatorCode,
    })
    .from(timeSeries)
    .where(eq(timeSeries.indicatorCode, indicatorCode))
    .orderBy(desc(timeSeries.date))
    .limit(1);
  
  return result[0] || null;
}

// Get historical data for charts
async function getHistoricalData(db: any, indicatorCode: string, startYear: number = 2010) {
  const startDate = new Date(`${startYear}-01-01`);
  
  const result = await db
    .select({
      value: timeSeries.value,
      date: timeSeries.date,
    })
    .from(timeSeries)
    .where(
      and(
        eq(timeSeries.indicatorCode, indicatorCode),
        gte(timeSeries.date, startDate)
      )
    )
    .orderBy(timeSeries.date);
  
  return result.map((r: any) => ({
    date: r.date,
    value: parseFloat(r.value) || 0,
  }));
}

// Get year-over-year comparison
async function getYoYComparison(db: any, indicatorCode: string) {
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;
  
  const results = await db
    .select({
      value: timeSeries.value,
      date: timeSeries.date,
    })
    .from(timeSeries)
    .where(eq(timeSeries.indicatorCode, indicatorCode))
    .orderBy(desc(timeSeries.date))
    .limit(24); // Get last 2 years of monthly data
  
  const current = results[0];
  const previous = results.find((r: any) => {
    const date = new Date(r.date);
    return date.getFullYear() === lastYear;
  });
  
  return {
    current: current ? parseFloat(current.value) : null,
    previous: previous ? parseFloat(previous.value) : null,
    change: current && previous 
      ? calculateYoYChange(parseFloat(current.value), parseFloat(previous.value))
      : "N/A",
  };
}

export const sectorKpiRouter = router({
  // ==================== MACRO SECTOR KPIs ====================
  getMacroKpis: publicProcedure
    .input(z.object({
      asOfDate: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      
      // Define macro indicators to fetch
      const macroIndicators = [
        { code: "NY.GDP.MKTP.CD", name: "GDP", nameAr: "الناتج المحلي الإجمالي", unit: "$", format: "B" },
        { code: "NY.GDP.MKTP.KD.ZG", name: "Growth Rate", nameAr: "معدل النمو", unit: "%", format: "pct" },
        { code: "NY.GDP.PCAP.CD", name: "GDP Per Capita", nameAr: "نصيب الفرد", unit: "$", format: "K" },
        { code: "FP.CPI.TOTL.ZG", name: "Inflation", nameAr: "التضخم", unit: "%", format: "pct" },
        { code: "GC.BAL.CASH.GD.ZS", name: "Fiscal Balance", nameAr: "الرصيد المالي", unit: "% GDP", format: "pct" },
        { code: "DT.DOD.DECT.GN.ZS", name: "External Debt", nameAr: "الدين الخارجي", unit: "% GNI", format: "pct" },
        { code: "BN.CAB.XOKA.GD.ZS", name: "Current Account", nameAr: "الحساب الجاري", unit: "% GDP", format: "pct" },
        { code: "SL.UEM.TOTL.ZS", name: "Unemployment", nameAr: "البطالة", unit: "%", format: "pct" },
      ];
      
      const kpis = await Promise.all(
        macroIndicators.map(async (indicator) => {
          const latest = await getLatestIndicatorValue(db, indicator.code);
          const yoy = await getYoYComparison(db, indicator.code);
          
          return {
            id: indicator.code,
            name: indicator.name,
            nameAr: indicator.nameAr,
            value: latest ? parseFloat(latest.value) : null,
            formattedValue: latest 
              ? indicator.format === "B" 
                ? formatNumber(parseFloat(latest.value), 1)
                : indicator.format === "K"
                  ? formatNumber(parseFloat(latest.value), 0)
                  : `${parseFloat(latest.value).toFixed(1)}${indicator.unit}`
              : "N/A",
            unit: indicator.unit,
            change: yoy.change,
            date: latest?.date || null,
            confidence: "high",
            evidencePackId: null,
          };
        })
      );
      
      return { kpis, asOfDate: input?.asOfDate || new Date().toISOString() };
    }),

  getMacroChartData: publicProcedure
    .input(z.object({
      indicator: z.string(),
      startYear: z.number().default(2010),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      const data = await getHistoricalData(db, input.indicator, input.startYear);
      return { data, indicator: input.indicator };
    }),

  // ==================== BANKING SECTOR KPIs ====================
  getBankingKpis: publicProcedure
    .input(z.object({
      asOfDate: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      
      const bankingIndicators = [
        { code: "FI.RES.TOTL.CD", name: "CBY Reserves", nameAr: "احتياطيات البنك المركزي", unit: "$", format: "B" },
        { code: "FM.LBL.BMNY.GD.ZS", name: "Broad Money", nameAr: "المعروض النقدي", unit: "% GDP", format: "pct" },
        { code: "FB.BNK.CAPA.ZS", name: "Bank Capital", nameAr: "رأس مال البنوك", unit: "%", format: "pct" },
        { code: "FB.AST.NPER.ZS", name: "NPL Ratio", nameAr: "نسبة القروض المتعثرة", unit: "%", format: "pct" },
        { code: "FR.INR.LEND", name: "Lending Rate", nameAr: "سعر الإقراض", unit: "%", format: "pct" },
        { code: "FR.INR.DPST", name: "Deposit Rate", nameAr: "سعر الإيداع", unit: "%", format: "pct" },
        { code: "FS.AST.DOMS.GD.ZS", name: "Domestic Credit", nameAr: "الائتمان المحلي", unit: "% GDP", format: "pct" },
        { code: "FS.AST.PRVT.GD.ZS", name: "Private Credit", nameAr: "الائتمان الخاص", unit: "% GDP", format: "pct" },
      ];
      
      const kpis = await Promise.all(
        bankingIndicators.map(async (indicator) => {
          const latest = await getLatestIndicatorValue(db, indicator.code);
          const yoy = await getYoYComparison(db, indicator.code);
          
          return {
            id: indicator.code,
            name: indicator.name,
            nameAr: indicator.nameAr,
            value: latest ? parseFloat(latest.value) : null,
            formattedValue: latest 
              ? indicator.format === "B" 
                ? formatNumber(parseFloat(latest.value), 1)
                : `${parseFloat(latest.value).toFixed(1)}${indicator.unit}`
              : "N/A",
            unit: indicator.unit,
            change: yoy.change,
            date: latest?.date || null,
            confidence: "high",
            evidencePackId: null,
          };
        })
      );
      
      return { kpis, asOfDate: input?.asOfDate || new Date().toISOString() };
    }),

  // ==================== TRADE SECTOR KPIs ====================
  getTradeKpis: publicProcedure
    .input(z.object({
      asOfDate: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      
      const tradeIndicators = [
        { code: "NE.EXP.GNFS.CD", name: "Exports", nameAr: "الصادرات", unit: "$", format: "B" },
        { code: "NE.IMP.GNFS.CD", name: "Imports", nameAr: "الواردات", unit: "$", format: "B" },
        { code: "NE.TRD.GNFS.ZS", name: "Trade/GDP", nameAr: "التجارة/الناتج", unit: "%", format: "pct" },
        { code: "BN.GSR.GNFS.CD", name: "Trade Balance", nameAr: "الميزان التجاري", unit: "$", format: "B" },
        { code: "TX.VAL.FUEL.ZS.UN", name: "Fuel Exports", nameAr: "صادرات الوقود", unit: "%", format: "pct" },
        { code: "TM.VAL.FOOD.ZS.UN", name: "Food Imports", nameAr: "واردات الغذاء", unit: "%", format: "pct" },
        { code: "LP.LPI.OVRL.XQ", name: "Logistics Index", nameAr: "مؤشر اللوجستيات", unit: "", format: "num" },
        { code: "IC.CUS.DURS.EX", name: "Export Time", nameAr: "وقت التصدير", unit: "days", format: "num" },
      ];
      
      const kpis = await Promise.all(
        tradeIndicators.map(async (indicator) => {
          const latest = await getLatestIndicatorValue(db, indicator.code);
          const yoy = await getYoYComparison(db, indicator.code);
          
          return {
            id: indicator.code,
            name: indicator.name,
            nameAr: indicator.nameAr,
            value: latest ? parseFloat(latest.value) : null,
            formattedValue: latest 
              ? indicator.format === "B" 
                ? formatNumber(parseFloat(latest.value), 1)
                : indicator.format === "pct"
                  ? `${parseFloat(latest.value).toFixed(1)}%`
                  : parseFloat(latest.value).toFixed(1)
              : "N/A",
            unit: indicator.unit,
            change: yoy.change,
            date: latest?.date || null,
            confidence: "high",
            evidencePackId: null,
          };
        })
      );
      
      return { kpis, asOfDate: input?.asOfDate || new Date().toISOString() };
    }),

  // ==================== HUMANITARIAN SECTOR KPIs ====================
  getHumanitarianKpis: publicProcedure
    .input(z.object({
      asOfDate: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      
      const humanitarianIndicators = [
        { code: "SM.POP.REFG", name: "Refugees", nameAr: "اللاجئون", unit: "", format: "M" },
        { code: "VC.IDP.TOTL.HE", name: "IDPs", nameAr: "النازحون داخلياً", unit: "", format: "M" },
        { code: "SN.ITK.DEFC.ZS", name: "Undernourished", nameAr: "نقص التغذية", unit: "%", format: "pct" },
        { code: "SH.STA.MALN.ZS", name: "Malnutrition", nameAr: "سوء التغذية", unit: "%", format: "pct" },
        { code: "SH.H2O.SMDW.ZS", name: "Safe Water", nameAr: "المياه الآمنة", unit: "%", format: "pct" },
        { code: "SH.STA.SMSS.ZS", name: "Sanitation", nameAr: "الصرف الصحي", unit: "%", format: "pct" },
        { code: "SH.XPD.CHEX.PC.CD", name: "Health Spending", nameAr: "الإنفاق الصحي", unit: "$", format: "num" },
        { code: "SE.PRM.NENR", name: "School Enrollment", nameAr: "الالتحاق بالمدارس", unit: "%", format: "pct" },
      ];
      
      const kpis = await Promise.all(
        humanitarianIndicators.map(async (indicator) => {
          const latest = await getLatestIndicatorValue(db, indicator.code);
          const yoy = await getYoYComparison(db, indicator.code);
          
          return {
            id: indicator.code,
            name: indicator.name,
            nameAr: indicator.nameAr,
            value: latest ? parseFloat(latest.value) : null,
            formattedValue: latest 
              ? indicator.format === "M" 
                ? formatNumber(parseFloat(latest.value), 1)
                : indicator.format === "pct"
                  ? `${parseFloat(latest.value).toFixed(1)}%`
                  : parseFloat(latest.value).toFixed(1)
              : "N/A",
            unit: indicator.unit,
            change: yoy.change,
            date: latest?.date || null,
            confidence: "medium",
            evidencePackId: null,
          };
        })
      );
      
      return { kpis, asOfDate: input?.asOfDate || new Date().toISOString() };
    }),

  // ==================== PRICES SECTOR KPIs ====================
  getPricesKpis: publicProcedure
    .input(z.object({
      asOfDate: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      
      const pricesIndicators = [
        { code: "FP.CPI.TOTL.ZG", name: "CPI Inflation", nameAr: "تضخم المستهلك", unit: "%", format: "pct" },
        { code: "FP.WPI.TOTL", name: "Wholesale Prices", nameAr: "أسعار الجملة", unit: "index", format: "num" },
        { code: "FOOD_PRICE_INDEX", name: "Food Prices", nameAr: "أسعار الغذاء", unit: "index", format: "num" },
        { code: "FUEL_PRICE_INDEX", name: "Fuel Prices", nameAr: "أسعار الوقود", unit: "index", format: "num" },
        { code: "PA.NUS.FCRF", name: "Exchange Rate", nameAr: "سعر الصرف", unit: "YER/$", format: "num" },
        { code: "WHEAT_PRICE", name: "Wheat Price", nameAr: "سعر القمح", unit: "$/kg", format: "num" },
        { code: "RICE_PRICE", name: "Rice Price", nameAr: "سعر الأرز", unit: "$/kg", format: "num" },
        { code: "COOKING_OIL_PRICE", name: "Cooking Oil", nameAr: "زيت الطبخ", unit: "$/L", format: "num" },
      ];
      
      const kpis = await Promise.all(
        pricesIndicators.map(async (indicator) => {
          const latest = await getLatestIndicatorValue(db, indicator.code);
          const yoy = await getYoYComparison(db, indicator.code);
          
          return {
            id: indicator.code,
            name: indicator.name,
            nameAr: indicator.nameAr,
            value: latest ? parseFloat(latest.value) : null,
            formattedValue: latest 
              ? indicator.format === "pct"
                  ? `${parseFloat(latest.value).toFixed(1)}%`
                  : parseFloat(latest.value).toFixed(1)
              : "N/A",
            unit: indicator.unit,
            change: yoy.change,
            date: latest?.date || null,
            confidence: "high",
            evidencePackId: null,
          };
        })
      );
      
      return { kpis, asOfDate: input?.asOfDate || new Date().toISOString() };
    }),

  // ==================== ENERGY SECTOR KPIs ====================
  getEnergyKpis: publicProcedure
    .input(z.object({
      asOfDate: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      
      const energyIndicators = [
        { code: "EG.USE.PCAP.KG.OE", name: "Energy Use", nameAr: "استخدام الطاقة", unit: "kg oil eq", format: "num" },
        { code: "EG.ELC.ACCS.ZS", name: "Electricity Access", nameAr: "الوصول للكهرباء", unit: "%", format: "pct" },
        { code: "EG.USE.ELEC.KH.PC", name: "Electricity Use", nameAr: "استهلاك الكهرباء", unit: "kWh", format: "num" },
        { code: "EG.ELC.LOSS.ZS", name: "Power Losses", nameAr: "فقد الطاقة", unit: "%", format: "pct" },
        { code: "EG.FEC.RNEW.ZS", name: "Renewable Energy", nameAr: "الطاقة المتجددة", unit: "%", format: "pct" },
        { code: "EP.PMP.SGAS.CD", name: "Gasoline Price", nameAr: "سعر البنزين", unit: "$/L", format: "num" },
        { code: "EP.PMP.DESL.CD", name: "Diesel Price", nameAr: "سعر الديزل", unit: "$/L", format: "num" },
        { code: "EG.ELC.PROD.KH", name: "Power Generation", nameAr: "توليد الكهرباء", unit: "GWh", format: "num" },
      ];
      
      const kpis = await Promise.all(
        energyIndicators.map(async (indicator) => {
          const latest = await getLatestIndicatorValue(db, indicator.code);
          const yoy = await getYoYComparison(db, indicator.code);
          
          return {
            id: indicator.code,
            name: indicator.name,
            nameAr: indicator.nameAr,
            value: latest ? parseFloat(latest.value) : null,
            formattedValue: latest 
              ? indicator.format === "pct"
                  ? `${parseFloat(latest.value).toFixed(1)}%`
                  : parseFloat(latest.value).toFixed(1)
              : "N/A",
            unit: indicator.unit,
            change: yoy.change,
            date: latest?.date || null,
            confidence: "medium",
            evidencePackId: null,
          };
        })
      );
      
      return { kpis, asOfDate: input?.asOfDate || new Date().toISOString() };
    }),

  // ==================== FOOD SECURITY SECTOR KPIs ====================
  getFoodSecurityKpis: publicProcedure
    .input(z.object({
      asOfDate: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      
      const foodSecurityIndicators = [
        { code: "SN.ITK.DEFC.ZS", name: "Undernourishment", nameAr: "نقص التغذية", unit: "%", format: "pct" },
        { code: "SN.ITK.SVFI.ZS", name: "Severe Food Insecurity", nameAr: "انعدام أمن غذائي حاد", unit: "%", format: "pct" },
        { code: "AG.PRD.FOOD.XD", name: "Food Production", nameAr: "إنتاج الغذاء", unit: "index", format: "num" },
        { code: "AG.LND.ARBL.ZS", name: "Arable Land", nameAr: "الأراضي الصالحة", unit: "%", format: "pct" },
        { code: "AG.YLD.CREL.KG", name: "Cereal Yield", nameAr: "إنتاجية الحبوب", unit: "kg/ha", format: "num" },
        { code: "TM.VAL.FOOD.ZS.UN", name: "Food Imports", nameAr: "واردات الغذاء", unit: "%", format: "pct" },
        { code: "SH.STA.STNT.ZS", name: "Child Stunting", nameAr: "تقزم الأطفال", unit: "%", format: "pct" },
        { code: "SH.STA.WAST.ZS", name: "Child Wasting", nameAr: "هزال الأطفال", unit: "%", format: "pct" },
      ];
      
      const kpis = await Promise.all(
        foodSecurityIndicators.map(async (indicator) => {
          const latest = await getLatestIndicatorValue(db, indicator.code);
          const yoy = await getYoYComparison(db, indicator.code);
          
          return {
            id: indicator.code,
            name: indicator.name,
            nameAr: indicator.nameAr,
            value: latest ? parseFloat(latest.value) : null,
            formattedValue: latest 
              ? indicator.format === "pct"
                  ? `${parseFloat(latest.value).toFixed(1)}%`
                  : parseFloat(latest.value).toFixed(1)
              : "N/A",
            unit: indicator.unit,
            change: yoy.change,
            date: latest?.date || null,
            confidence: "high",
            evidencePackId: null,
          };
        })
      );
      
      return { kpis, asOfDate: input?.asOfDate || new Date().toISOString() };
    }),

  // ==================== LABOR MARKET SECTOR KPIs ====================
  getLaborMarketKpis: publicProcedure
    .input(z.object({
      asOfDate: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      
      const laborIndicators = [
        { code: "SL.UEM.TOTL.ZS", name: "Unemployment", nameAr: "البطالة", unit: "%", format: "pct" },
        { code: "SL.UEM.1524.ZS", name: "Youth Unemployment", nameAr: "بطالة الشباب", unit: "%", format: "pct" },
        { code: "SL.TLF.CACT.ZS", name: "Labor Force", nameAr: "القوى العاملة", unit: "%", format: "pct" },
        { code: "SL.TLF.CACT.FE.ZS", name: "Female Labor", nameAr: "عمالة الإناث", unit: "%", format: "pct" },
        { code: "SL.EMP.TOTL.SP.ZS", name: "Employment", nameAr: "التوظيف", unit: "%", format: "pct" },
        { code: "SL.EMP.VULN.ZS", name: "Vulnerable Employment", nameAr: "العمالة الهشة", unit: "%", format: "pct" },
        { code: "SL.AGR.EMPL.ZS", name: "Agriculture Jobs", nameAr: "وظائف الزراعة", unit: "%", format: "pct" },
        { code: "SL.SRV.EMPL.ZS", name: "Services Jobs", nameAr: "وظائف الخدمات", unit: "%", format: "pct" },
      ];
      
      const kpis = await Promise.all(
        laborIndicators.map(async (indicator) => {
          const latest = await getLatestIndicatorValue(db, indicator.code);
          const yoy = await getYoYComparison(db, indicator.code);
          
          return {
            id: indicator.code,
            name: indicator.name,
            nameAr: indicator.nameAr,
            value: latest ? parseFloat(latest.value) : null,
            formattedValue: latest 
              ? `${parseFloat(latest.value).toFixed(1)}%`
              : "N/A",
            unit: indicator.unit,
            change: yoy.change,
            date: latest?.date || null,
            confidence: "medium",
            evidencePackId: null,
          };
        })
      );
      
      return { kpis, asOfDate: input?.asOfDate || new Date().toISOString() };
    }),

  // ==================== GENERIC CHART DATA ====================
  getChartData: publicProcedure
    .input(z.object({
      indicators: z.array(z.string()),
      startYear: z.number().default(2010),
      endYear: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      const endYear = input.endYear || new Date().getFullYear();
      
      const chartData = await Promise.all(
        input.indicators.map(async (indicatorCode) => {
          const data = await getHistoricalData(db, indicatorCode, input.startYear);
          return {
            indicator: indicatorCode,
            data: data.filter((d: any) => {
              const year = new Date(d.date).getFullYear();
              return year <= endYear;
            }),
          };
        })
      );
      
      return { chartData };
    }),

  // ==================== RECENT UPDATES/NEWS ====================
  getSectorUpdates: publicProcedure
    .input(z.object({
      sector: z.string(),
      limit: z.number().default(5),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { updates: [] };
      
      // Try to get updates from economic_events table
      const events = await db
        .select()
        .from(economicEvents)
        .where(like(economicEvents.category, `%${input.sector}%`))
        .orderBy(desc(economicEvents.eventDate))
        .limit(input.limit);
      
      return {
        updates: events.map((e: any) => ({
          id: e.id,
          title: e.title,
          titleAr: e.titleAr || e.title,
          source: e.source || "YETO",
          date: e.date,
          category: e.category,
          severity: e.severity || "medium",
          summary: e.description,
        })),
      };
    }),

  // ==================== CONTRADICTIONS ====================
  getSectorContradictions: publicProcedure
    .input(z.object({
      sector: z.string(),
    }))
    .query(async ({ input }) => {
      // Return mock contradictions for now - will be wired to real data
      const contradictions = [
        {
          indicator: "GDP Growth",
          sources: [
            { name: "World Bank", value: "2.1%", date: "2024" },
            { name: "IMF", value: "1.8%", date: "2024" },
            { name: "CBY", value: "2.5%", date: "2024" },
          ],
          explanation: "Different methodologies for calculating GDP in conflict-affected areas",
        },
      ];
      
      return { contradictions };
    }),
});

export type SectorKpiRouter = typeof sectorKpiRouter;
