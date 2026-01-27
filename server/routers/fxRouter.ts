/**
 * FX Router - Exchange Rate API Endpoints
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

type RegimeTag = "IRG" | "DFA" | "PAR";

async function getFxRates(options: {
  regimeTag?: RegimeTag;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { regimeTag, startDate, endDate, limit = 1000 } = options;
  
  let query = `SELECT * FROM fx_rates WHERE 1=1`;
  if (regimeTag) query += ` AND regimeTag = '${regimeTag}'`;
  if (startDate) query += ` AND date >= '${startDate}'`;
  if (endDate) query += ` AND date <= '${endDate}'`;
  query += ` ORDER BY date DESC LIMIT ${limit}`;
  
  const result = await db.execute(sql.raw(query));
  const rows = ((result as any)[0] || []) as any[];
  
  return rows.map(row => ({
    ...row,
    date: row.date instanceof Date ? row.date : new Date(row.date),
  }));
}

export const fxRouter = router({
  getRates: publicProcedure
    .input(z.object({
      regimeTag: z.enum(["IRG", "DFA", "PAR"]).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      limit: z.number().min(1).max(5000).default(1000),
    }))
    .query(async ({ input }) => {
      const rates = await getFxRates({
        regimeTag: input.regimeTag as RegimeTag | undefined,
        startDate: input.startDate,
        endDate: input.endDate,
        limit: input.limit,
      });
      
      return {
        rates: rates.map(r => ({
          id: r.id,
          date: r.date.toISOString(),
          rateUsd: parseFloat(r.rateUsd),
          regimeTag: r.regimeTag,
          confidenceRating: r.confidenceRating,
          labelEn: r.labelEn,
          labelAr: r.labelAr,
        })),
        count: rates.length,
      };
    }),

  getLatestRates: publicProcedure.query(async () => {
    const [aden, sanaa, parallel] = await Promise.all([
      getFxRates({ regimeTag: "IRG", limit: 1 }),
      getFxRates({ regimeTag: "DFA", limit: 1 }),
      getFxRates({ regimeTag: "PAR", limit: 1 }),
    ]);
    
    return {
      aden: aden[0] ? { date: aden[0].date.toISOString(), rate: parseFloat(aden[0].rateUsd), labelEn: "Aden (IRG)", labelAr: "عدن (الحكومة المعترف بها)" } : null,
      sanaa: sanaa[0] ? { date: sanaa[0].date.toISOString(), rate: parseFloat(sanaa[0].rateUsd), labelEn: "Sana'a (DFA)", labelAr: "صنعاء (سلطة الأمر الواقع)" } : null,
      parallel: parallel[0] ? { date: parallel[0].date.toISOString(), rate: parseFloat(parallel[0].rateUsd), labelEn: "Parallel Market", labelAr: "السوق الموازي" } : null,
    };
  }),

  getChartData: publicProcedure
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      regimes: z.array(z.enum(["IRG", "DFA", "PAR"])).default(["IRG", "DFA", "PAR"]),
    }))
    .query(async ({ input }) => {
      const seriesData = await Promise.all(
        input.regimes.map(async (regime) => {
          const rates = await getFxRates({
            regimeTag: regime as RegimeTag,
            startDate: input.startDate,
            endDate: input.endDate,
            limit: 5000,
          });
          return {
            regime,
            data: rates.map(r => ({ date: r.date.toISOString().split('T')[0], rate: parseFloat(r.rateUsd) })).reverse(),
          };
        })
      );
      return { series: seriesData, splitDate: "2016-08-01" };
    }),

  getGapTickets: publicProcedure
    .input(z.object({
      regimeTag: z.enum(["IRG", "DFA", "PAR"]).optional(),
      status: z.enum(["open", "resolved", "ignored"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      let query = `SELECT * FROM fx_gap_tickets WHERE 1=1`;
      if (input.regimeTag) query += ` AND regimeTag = '${input.regimeTag}'`;
      if (input.status) query += ` AND status = '${input.status}'`;
      query += ` ORDER BY createdAt DESC LIMIT 100`;
      const result = await db.execute(sql.raw(query));
      return ((result as any)[0] || []) as any[];
    }),

  getSourceRegistry: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.execute(sql.raw(`SELECT * FROM fx_source_registry ORDER BY id`));
    return ((result as any)[0] || []) as any[];
  }),
});
