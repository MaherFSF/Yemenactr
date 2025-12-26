import { eq, and, gte, lte, desc, asc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  timeSeries,
  geospatialData,
  economicEvents,
  sources,
  datasets,
  documents,
  glossaryTerms,
  dataGapTickets,
  stakeholders,
  type TimeSeries,
  type GeospatialData,
  type EconomicEvent,
  type Source,
  type Dataset,
  type Document,
  type GlossaryTerm,
  type DataGapTicket,
  type Stakeholder,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// TIME SERIES DATA
// ============================================================================

export async function getTimeSeriesByIndicator(
  indicatorCode: string,
  regimeTag: "aden_irg" | "sanaa_defacto" | "mixed" | "unknown",
  startDate?: Date,
  endDate?: Date
): Promise<TimeSeries[]> {
  const db = await getDb();
  if (!db) return [];

  const conditions = [
    eq(timeSeries.indicatorCode, indicatorCode),
    eq(timeSeries.regimeTag, regimeTag),
  ];

  if (startDate) {
    conditions.push(gte(timeSeries.date, startDate));
  }
  if (endDate) {
    conditions.push(lte(timeSeries.date, endDate));
  }

  const results = await db
    .select()
    .from(timeSeries)
    .where(and(...conditions))
    .orderBy(asc(timeSeries.date));
  return results;
}

export async function getLatestTimeSeriesValue(
  indicatorCode: string,
  regimeTag: "aden_irg" | "sanaa_defacto" | "mixed" | "unknown"
): Promise<TimeSeries | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const results = await db
    .select()
    .from(timeSeries)
    .where(
      and(
        eq(timeSeries.indicatorCode, indicatorCode),
        eq(timeSeries.regimeTag, regimeTag)
      )
    )
    .orderBy(desc(timeSeries.date))
    .limit(1);

  return results.length > 0 ? results[0] : undefined;
}

export async function getAllIndicators(): Promise<Array<{ indicatorCode: string; regimeTag: string }>> {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .selectDistinct({
      indicatorCode: timeSeries.indicatorCode,
      regimeTag: timeSeries.regimeTag,
    })
    .from(timeSeries);

  return results;
}

// ============================================================================
// GEOSPATIAL DATA
// ============================================================================

export async function getGeospatialDataByIndicator(
  indicatorCode: string,
  regimeTag: "aden_irg" | "sanaa_defacto" | "mixed" | "unknown",
  date?: Date
): Promise<GeospatialData[]> {
  const db = await getDb();
  if (!db) return [];

  const conditions = [
    eq(geospatialData.indicatorCode, indicatorCode),
    eq(geospatialData.regimeTag, regimeTag),
  ];

  if (date) {
    conditions.push(eq(geospatialData.date, date));
  }

  return await db
    .select()
    .from(geospatialData)
    .where(and(...conditions));
}

// ============================================================================
// ECONOMIC EVENTS
// ============================================================================

export async function getEconomicEvents(
  regimeTag?: "aden_irg" | "sanaa_defacto" | "mixed" | "unknown",
  startDate?: Date,
  endDate?: Date,
  limit: number = 50
): Promise<EconomicEvent[]> {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (regimeTag) {
    conditions.push(eq(economicEvents.regimeTag, regimeTag));
  }
  if (startDate) {
    conditions.push(gte(economicEvents.eventDate, startDate));
  }
  if (endDate) {
    conditions.push(lte(economicEvents.eventDate, endDate));
  }

  if (conditions.length > 0) {
    return await db
      .select()
      .from(economicEvents)
      .where(and(...conditions))
      .orderBy(desc(economicEvents.eventDate))
      .limit(limit);
  }

  return await db
    .select()
    .from(economicEvents)
    .orderBy(desc(economicEvents.eventDate))
    .limit(limit);
}

// ============================================================================
// SOURCES & DATASETS
// ============================================================================

export async function getSourceById(id: number): Promise<Source | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const results = await db.select().from(sources).where(eq(sources.id, id)).limit(1);
  return results.length > 0 ? results[0] : undefined;
}

export async function getDatasetById(id: number): Promise<Dataset | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const results = await db.select().from(datasets).where(eq(datasets.id, id)).limit(1);
  return results.length > 0 ? results[0] : undefined;
}

export async function getAllSources(limit: number = 100): Promise<Source[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(sources).orderBy(desc(sources.createdAt)).limit(limit);
}

// ============================================================================
// DOCUMENTS
// ============================================================================

export async function getDocumentsByCategory(
  category: string,
  limit: number = 50
): Promise<Document[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(documents)
    .where(eq(documents.category, category))
    .orderBy(desc(documents.uploadDate))
    .limit(limit);
}

export async function searchDocuments(searchTerm: string, limit: number = 50): Promise<Document[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(documents)
    .where(
      sql`${documents.title} LIKE ${`%${searchTerm}%`} OR ${documents.titleAr} LIKE ${`%${searchTerm}%`}`
    )
    .orderBy(desc(documents.uploadDate))
    .limit(limit);
}

// ============================================================================
// GLOSSARY
// ============================================================================

export async function getGlossaryTerms(category?: string): Promise<GlossaryTerm[]> {
  const db = await getDb();
  if (!db) return [];

  if (category) {
    return await db
      .select()
      .from(glossaryTerms)
      .where(eq(glossaryTerms.category, category))
      .orderBy(asc(glossaryTerms.termEn));
  }

  return await db
    .select()
    .from(glossaryTerms)
    .orderBy(asc(glossaryTerms.termEn));
}

export async function searchGlossaryTerms(searchTerm: string): Promise<GlossaryTerm[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(glossaryTerms)
    .where(
      sql`${glossaryTerms.termEn} LIKE ${`%${searchTerm}%`} OR ${glossaryTerms.termAr} LIKE ${`%${searchTerm}%`}`
    )
    .limit(50);
}

// ============================================================================
// DATA GAP TICKETS
// ============================================================================

export async function getDataGapTickets(
  status?: "open" | "in_progress" | "resolved" | "closed",
  priority?: "low" | "medium" | "high"
): Promise<DataGapTicket[]> {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (status) {
    conditions.push(eq(dataGapTickets.status, status));
  }
  if (priority) {
    conditions.push(eq(dataGapTickets.priority, priority));
  }

  if (conditions.length > 0) {
    return await db
      .select()
      .from(dataGapTickets)
      .where(and(...conditions))
      .orderBy(desc(dataGapTickets.createdAt));
  }

  return await db
    .select()
    .from(dataGapTickets)
    .orderBy(desc(dataGapTickets.createdAt));
}

// ============================================================================
// STAKEHOLDERS
// ============================================================================

export async function getStakeholders(
  type?: "government" | "ngo" | "international_org" | "research_institution" | "private_sector"
): Promise<Stakeholder[]> {
  const db = await getDb();
  if (!db) return [];

  if (type) {
    return await db
      .select()
      .from(stakeholders)
      .where(eq(stakeholders.type, type))
      .orderBy(asc(stakeholders.name));
  }

  return await db
    .select()
    .from(stakeholders)
    .orderBy(asc(stakeholders.name));
}


// ============================================================================
// SECTOR ANALYTICS
// ============================================================================

export interface SectorMetrics {
  sectorCode: string;
  sectorName: string;
  sectorNameAr: string;
  indicatorCount: number;
  latestUpdate: Date | null;
  dataQuality: "high" | "medium" | "low";
}

export async function getSectorMetrics(): Promise<SectorMetrics[]> {
  // Return sample sector metrics for now
  // In production, this would aggregate from the database
  return [
    { sectorCode: "banking", sectorName: "Banking & Finance", sectorNameAr: "القطاع المصرفي", indicatorCount: 45, latestUpdate: new Date(), dataQuality: "high" },
    { sectorCode: "trade", sectorName: "Trade & Commerce", sectorNameAr: "التجارة", indicatorCount: 38, latestUpdate: new Date(), dataQuality: "medium" },
    { sectorCode: "macroeconomy", sectorName: "Macroeconomy", sectorNameAr: "الاقتصاد الكلي", indicatorCount: 52, latestUpdate: new Date(), dataQuality: "high" },
    { sectorCode: "prices", sectorName: "Prices & Inflation", sectorNameAr: "الأسعار والتضخم", indicatorCount: 67, latestUpdate: new Date(), dataQuality: "high" },
    { sectorCode: "currency", sectorName: "Currency & Exchange", sectorNameAr: "العملة والصرف", indicatorCount: 28, latestUpdate: new Date(), dataQuality: "high" },
    { sectorCode: "public_finance", sectorName: "Public Finance", sectorNameAr: "المالية العامة", indicatorCount: 35, latestUpdate: new Date(), dataQuality: "low" },
    { sectorCode: "energy", sectorName: "Energy & Fuel", sectorNameAr: "الطاقة والوقود", indicatorCount: 42, latestUpdate: new Date(), dataQuality: "medium" },
    { sectorCode: "food_security", sectorName: "Food Security", sectorNameAr: "الأمن الغذائي", indicatorCount: 58, latestUpdate: new Date(), dataQuality: "high" },
    { sectorCode: "aid_flows", sectorName: "Aid Flows", sectorNameAr: "تدفقات المساعدات", indicatorCount: 31, latestUpdate: new Date(), dataQuality: "high" },
    { sectorCode: "labor", sectorName: "Labor Market", sectorNameAr: "سوق العمل", indicatorCount: 24, latestUpdate: new Date(), dataQuality: "low" },
    { sectorCode: "conflict", sectorName: "Conflict Economy", sectorNameAr: "اقتصاد الصراع", indicatorCount: 19, latestUpdate: new Date(), dataQuality: "medium" },
    { sectorCode: "infrastructure", sectorName: "Infrastructure", sectorNameAr: "البنية التحتية", indicatorCount: 33, latestUpdate: new Date(), dataQuality: "low" },
    { sectorCode: "agriculture", sectorName: "Agriculture", sectorNameAr: "الزراعة", indicatorCount: 41, latestUpdate: new Date(), dataQuality: "medium" },
    { sectorCode: "investment", sectorName: "Investment", sectorNameAr: "الاستثمار", indicatorCount: 22, latestUpdate: new Date(), dataQuality: "low" },
    { sectorCode: "poverty", sectorName: "Poverty & Development", sectorNameAr: "الفقر والتنمية", indicatorCount: 47, latestUpdate: new Date(), dataQuality: "medium" },
  ];
}

// ============================================================================
// COMPARISON DATA
// ============================================================================

export interface RegimeComparison {
  indicatorCode: string;
  indicatorName: string;
  indicatorNameAr: string;
  adenValue: number | null;
  sanaaValue: number | null;
  adenDate: Date | null;
  sanaaDate: Date | null;
  unit: string;
  gap: number | null;
  gapPercentage: number | null;
}

export async function getRegimeComparison(indicatorCodes: string[]): Promise<RegimeComparison[]> {
  // Sample comparison data - in production this would query the database
  const comparisons: RegimeComparison[] = [
    {
      indicatorCode: "fx_rate_usd",
      indicatorName: "Exchange Rate (USD)",
      indicatorNameAr: "سعر الصرف (دولار)",
      adenValue: 2070,
      sanaaValue: 535,
      adenDate: new Date(),
      sanaaDate: new Date(),
      unit: "YER/USD",
      gap: 1535,
      gapPercentage: 287
    },
    {
      indicatorCode: "inflation_cpi",
      indicatorName: "Inflation Rate",
      indicatorNameAr: "معدل التضخم",
      adenValue: 35.2,
      sanaaValue: 12.5,
      adenDate: new Date(),
      sanaaDate: new Date(),
      unit: "%",
      gap: 22.7,
      gapPercentage: 182
    },
    {
      indicatorCode: "fuel_price_petrol",
      indicatorName: "Petrol Price",
      indicatorNameAr: "سعر البنزين",
      adenValue: 1250,
      sanaaValue: 850,
      adenDate: new Date(),
      sanaaDate: new Date(),
      unit: "YER/L",
      gap: 400,
      gapPercentage: 47
    },
    {
      indicatorCode: "food_basket_cost",
      indicatorName: "Food Basket Cost",
      indicatorNameAr: "تكلفة سلة الغذاء",
      adenValue: 285000,
      sanaaValue: 245000,
      adenDate: new Date(),
      sanaaDate: new Date(),
      unit: "YER/month",
      gap: 40000,
      gapPercentage: 16
    },
  ];

  if (indicatorCodes.length > 0) {
    return comparisons.filter(c => indicatorCodes.includes(c.indicatorCode));
  }
  return comparisons;
}

// ============================================================================
// PLATFORM STATISTICS
// ============================================================================

export interface PlatformStats {
  totalIndicators: number;
  totalSources: number;
  totalDocuments: number;
  totalEvents: number;
  coverageStartYear: number;
  coverageEndYear: number;
  lastUpdated: Date;
  dataPointsCount: number;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const db = await getDb();
  
  // Return sample stats - in production this would aggregate from the database
  return {
    totalIndicators: 500,
    totalSources: 100,
    totalDocuments: 250,
    totalEvents: 180,
    coverageStartYear: 2014,
    coverageEndYear: new Date().getFullYear(),
    lastUpdated: new Date(),
    dataPointsCount: 15000,
  };
}

// ============================================================================
// DATA EXPORT
// ============================================================================

export interface ExportOptions {
  format: "csv" | "xlsx" | "json";
  indicatorCodes?: string[];
  regimeTag?: "aden_irg" | "sanaa_defacto" | "both";
  startDate?: Date;
  endDate?: Date;
}

export async function prepareDataExport(options: ExportOptions): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  // In production, this would query and format the data based on options
  // For now, return sample data structure
  return [];
}


// ============================================================================
// DATA EXPORT FUNCTIONS (Extended)
// ============================================================================

export interface ExtendedExportOptions {
  indicatorCode?: string;
  regimeTag?: "aden_irg" | "sanaa_defacto" | "mixed" | "unknown";
  startDate?: Date;
  endDate?: Date;
  sector?: string;
}

export async function getExportData(options: ExtendedExportOptions): Promise<{
  timeSeries: Array<{
    date: string;
    indicatorCode: string;
    indicatorName: string;
    value: string;
    unit: string;
    regime: string;
    confidence: string;
    source: string;
  }>;
  metadata: {
    exportDate: string;
    totalRecords: number;
    dateRange: { start: string; end: string };
    indicators: string[];
  };
}> {
  const db = await getDb();
  if (!db) {
    return {
      timeSeries: [],
      metadata: {
        exportDate: new Date().toISOString(),
        totalRecords: 0,
        dateRange: { start: "", end: "" },
        indicators: [],
      },
    };
  }

  // Fetch time series data
  let results = await db
    .select({
      date: timeSeries.date,
      indicatorCode: timeSeries.indicatorCode,
      value: timeSeries.value,
      regimeTag: timeSeries.regimeTag,
      confidenceRating: timeSeries.confidenceRating,
    })
    .from(timeSeries)
    .orderBy(desc(timeSeries.date))
    .limit(10000);

  // Apply filters in memory for simplicity
  if (options.indicatorCode) {
    results = results.filter(r => r.indicatorCode === options.indicatorCode);
  }
  
  if (options.regimeTag) {
    results = results.filter(r => r.regimeTag === options.regimeTag);
  }
  
  if (options.startDate) {
    results = results.filter(r => r.date && r.date >= options.startDate!);
  }
  
  if (options.endDate) {
    results = results.filter(r => r.date && r.date <= options.endDate!);
  }

  // Transform results for export
  const exportData = results.map((row) => ({
    date: row.date ? row.date.toISOString().split("T")[0] : "",
    indicatorCode: row.indicatorCode,
    indicatorName: row.indicatorCode, // Would be joined from indicators table
    value: row.value || "",
    unit: "", // Would be joined from indicators table
    regime: row.regimeTag,
    confidence: row.confidenceRating || "C",
    source: "", // Would be joined from sources table
  }));

  // Calculate metadata
  const dates = exportData.map((d) => d.date).filter(Boolean);
  const indicatorSet = new Set(exportData.map((d) => d.indicatorCode));
  const indicators = Array.from(indicatorSet);

  return {
    timeSeries: exportData,
    metadata: {
      exportDate: new Date().toISOString(),
      totalRecords: exportData.length,
      dateRange: {
        start: dates.length > 0 ? dates[dates.length - 1] : "",
        end: dates.length > 0 ? dates[0] : "",
      },
      indicators,
    },
  };
}

export function convertToCSV(data: Array<Record<string, unknown>>): string {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma
          const stringValue = String(value ?? "");
          if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(",")
    ),
  ];

  return csvRows.join("\n");
}

export function convertToJSON(data: unknown): string {
  return JSON.stringify(data, null, 2);
}
