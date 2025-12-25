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
