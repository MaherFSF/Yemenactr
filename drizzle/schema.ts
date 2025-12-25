import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json, boolean, index, unique } from "drizzle-orm/mysql-core";

/**
 * YETO Platform Database Schema
 * 
 * Core principles:
 * 1. Every data point has complete provenance (source, confidence, regime_tag)
 * 2. Split-system enforcement (Aden vs Sana'a regimes never merged without explicit consent)
 * 3. No hallucination (missing data = "Not available yet", never fabricated)
 * 4. Versioning and correction tracking for transparency
 */

// ============================================================================
// USERS & ACCESS CONTROL
// ============================================================================

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "partner_contributor"]).default("user").notNull(),
  subscriptionTier: mysqlEnum("subscriptionTier", ["free", "researcher", "institutional"]).default("free").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================================
// PROVENANCE & SOURCES
// ============================================================================

export const sources = mysqlTable("sources", {
  id: int("id").autoincrement().primaryKey(),
  publisher: varchar("publisher", { length: 255 }).notNull(), // e.g., "Central Bank of Yemen - Aden"
  url: text("url"), // Persistent link to source
  license: varchar("license", { length: 100 }), // e.g., "CC-BY-4.0", "unknown"
  retrievalDate: timestamp("retrievalDate").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  publisherIdx: index("publisher_idx").on(table.publisher),
}));

export type Source = typeof sources.$inferSelect;
export type InsertSource = typeof sources.$inferInsert;

export const datasets = mysqlTable("datasets", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "CPI Monthly Series 2010-2024"
  sourceId: int("sourceId").notNull().references(() => sources.id),
  publicationDate: timestamp("publicationDate"),
  timeCoverageStart: timestamp("timeCoverageStart"),
  timeCoverageEnd: timestamp("timeCoverageEnd"),
  geographicScope: varchar("geographicScope", { length: 100 }), // e.g., "National", "Aden", "Sana'a"
  confidenceRating: mysqlEnum("confidenceRating", ["A", "B", "C", "D"]).notNull(), // A=highest, D=lowest
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  sourceIdx: index("source_idx").on(table.sourceId),
  nameIdx: index("name_idx").on(table.name),
}));

export type Dataset = typeof datasets.$inferSelect;
export type InsertDataset = typeof datasets.$inferInsert;

export const provenanceLog = mysqlTable("provenance_log", {
  id: int("id").autoincrement().primaryKey(),
  dataPointId: int("dataPointId").notNull(), // FK to time_series or other data tables
  dataPointType: varchar("dataPointType", { length: 50 }).notNull(), // e.g., "time_series", "geospatial"
  transformationType: varchar("transformationType", { length: 100 }), // e.g., "deflation", "currency_conversion"
  formula: text("formula"), // e.g., "nominal / cpi_base_2015 * 100"
  performedAt: timestamp("performedAt").defaultNow().notNull(),
  performedByUserId: int("performedByUserId").references(() => users.id),
}, (table) => ({
  dataPointIdx: index("data_point_idx").on(table.dataPointId, table.dataPointType),
}));

export type ProvenanceLog = typeof provenanceLog.$inferSelect;
export type InsertProvenanceLog = typeof provenanceLog.$inferInsert;

// ============================================================================
// ECONOMIC DATA - TIME SERIES
// ============================================================================

export const timeSeries = mysqlTable("time_series", {
  id: int("id").autoincrement().primaryKey(),
  indicatorCode: varchar("indicatorCode", { length: 100 }).notNull(), // e.g., "inflation_cpi_aden", "fx_rate_sanaa"
  regimeTag: mysqlEnum("regimeTag", ["aden_irg", "sanaa_defacto", "mixed", "unknown"]).notNull(),
  date: timestamp("date").notNull(),
  value: decimal("value", { precision: 20, scale: 6 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(), // e.g., "YER", "percent", "USD millions"
  confidenceRating: mysqlEnum("confidenceRating", ["A", "B", "C", "D"]).notNull(),
  sourceId: int("sourceId").notNull().references(() => sources.id),
  datasetId: int("datasetId").references(() => datasets.id),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  indicatorIdx: index("indicator_idx").on(table.indicatorCode),
  regimeIdx: index("regime_idx").on(table.regimeTag),
  dateIdx: index("date_idx").on(table.date),
  indicatorRegimeDateIdx: unique("indicator_regime_date_unique").on(table.indicatorCode, table.regimeTag, table.date),
}));

export type TimeSeries = typeof timeSeries.$inferSelect;
export type InsertTimeSeries = typeof timeSeries.$inferInsert;

// ============================================================================
// ECONOMIC DATA - GEOSPATIAL
// ============================================================================

export const geospatialData = mysqlTable("geospatial_data", {
  id: int("id").autoincrement().primaryKey(),
  indicatorCode: varchar("indicatorCode", { length: 100 }).notNull(), // e.g., "poverty_rate", "unemployment"
  regimeTag: mysqlEnum("regimeTag", ["aden_irg", "sanaa_defacto", "mixed", "unknown"]).notNull(),
  governorate: varchar("governorate", { length: 100 }).notNull(), // e.g., "Aden", "Sana'a", "Hadramaut"
  date: timestamp("date").notNull(),
  value: decimal("value", { precision: 20, scale: 6 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  confidenceRating: mysqlEnum("confidenceRating", ["A", "B", "C", "D"]).notNull(),
  sourceId: int("sourceId").notNull().references(() => sources.id),
  datasetId: int("datasetId").references(() => datasets.id),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  indicatorIdx: index("indicator_idx").on(table.indicatorCode),
  governorateIdx: index("governorate_idx").on(table.governorate),
  regimeIdx: index("regime_idx").on(table.regimeTag),
}));

export type GeospatialData = typeof geospatialData.$inferSelect;
export type InsertGeospatialData = typeof geospatialData.$inferInsert;

// ============================================================================
// ECONOMIC EVENTS & TIMELINE
// ============================================================================

export const economicEvents = mysqlTable("economic_events", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }),
  description: text("description").notNull(),
  descriptionAr: text("descriptionAr"),
  eventDate: timestamp("eventDate").notNull(),
  regimeTag: mysqlEnum("regimeTag", ["aden_irg", "sanaa_defacto", "mixed", "unknown"]).notNull(),
  category: varchar("category", { length: 100 }), // e.g., "policy", "crisis", "reform"
  impactLevel: mysqlEnum("impactLevel", ["low", "medium", "high", "critical"]),
  sourceId: int("sourceId").references(() => sources.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  dateIdx: index("event_date_idx").on(table.eventDate),
  categoryIdx: index("category_idx").on(table.category),
}));

export type EconomicEvent = typeof economicEvents.$inferSelect;
export type InsertEconomicEvent = typeof economicEvents.$inferInsert;

// ============================================================================
// DOCUMENTS & REPORTS
// ============================================================================

export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }),
  fileKey: varchar("fileKey", { length: 255 }).notNull(), // S3 key
  fileUrl: text("fileUrl").notNull(), // Public S3 URL
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  fileSize: int("fileSize"), // bytes
  sourceId: int("sourceId").references(() => sources.id),
  license: varchar("license", { length: 100 }),
  publicationDate: timestamp("publicationDate"),
  uploadDate: timestamp("uploadDate").defaultNow().notNull(),
  uploaderId: int("uploaderId").references(() => users.id),
  category: varchar("category", { length: 100 }), // e.g., "report", "policy_brief", "dataset"
  tags: json("tags").$type<string[]>(), // Searchable tags
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  categoryIdx: index("category_idx").on(table.category),
  uploadDateIdx: index("upload_date_idx").on(table.uploadDate),
}));

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

// ============================================================================
// IMAGES & ATTRIBUTION
// ============================================================================

export const images = mysqlTable("images", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  creator: varchar("creator", { length: 255 }),
  sourceUrl: text("sourceUrl"),
  license: varchar("license", { length: 100 }).notNull(),
  fileKey: varchar("fileKey", { length: 255 }).notNull(), // S3 key
  fileUrl: text("fileUrl").notNull(), // Public S3 URL
  usageLocations: json("usageLocations").$type<string[]>(), // Pages where image is used
  retrievalDate: timestamp("retrievalDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Image = typeof images.$inferSelect;
export type InsertImage = typeof images.$inferInsert;

// ============================================================================
// DATA GAPS & CORRECTIONS
// ============================================================================

export const dataGapTickets = mysqlTable("data_gap_tickets", {
  id: int("id").autoincrement().primaryKey(),
  missingItem: varchar("missingItem", { length: 255 }).notNull(), // e.g., "Monthly FX rates for Sana'a 2022"
  whyItMatters: text("whyItMatters").notNull(),
  candidateSources: text("candidateSources"), // Potential sources to check
  acquisitionMethod: varchar("acquisitionMethod", { length: 100 }), // e.g., "FOIA", "scraping", "partnership"
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed"]).default("open").notNull(),
  assignedTo: int("assignedTo").references(() => users.id),
  createdBy: int("createdBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  statusIdx: index("status_idx").on(table.status),
  priorityIdx: index("priority_idx").on(table.priority),
}));

export type DataGapTicket = typeof dataGapTickets.$inferSelect;
export type InsertDataGapTicket = typeof dataGapTickets.$inferInsert;

export const corrections = mysqlTable("corrections", {
  id: int("id").autoincrement().primaryKey(),
  dataPointId: int("dataPointId").notNull(),
  dataPointType: varchar("dataPointType", { length: 50 }).notNull(), // e.g., "time_series", "geospatial"
  oldValue: decimal("oldValue", { precision: 20, scale: 6 }).notNull(),
  newValue: decimal("newValue", { precision: 20, scale: 6 }).notNull(),
  reason: text("reason").notNull(),
  correctedAt: timestamp("correctedAt").defaultNow().notNull(),
  correctedBy: int("correctedBy").notNull().references(() => users.id),
}, (table) => ({
  dataPointIdx: index("data_point_idx").on(table.dataPointId, table.dataPointType),
  correctedAtIdx: index("corrected_at_idx").on(table.correctedAt),
}));

export type Correction = typeof corrections.$inferSelect;
export type InsertCorrection = typeof corrections.$inferInsert;

// ============================================================================
// GLOSSARY
// ============================================================================

export const glossaryTerms = mysqlTable("glossary_terms", {
  id: int("id").autoincrement().primaryKey(),
  termEn: varchar("termEn", { length: 255 }).notNull(),
  termAr: varchar("termAr", { length: 255 }).notNull(),
  definitionEn: text("definitionEn").notNull(),
  definitionAr: text("definitionAr").notNull(),
  category: varchar("category", { length: 100 }), // e.g., "monetary_policy", "fiscal_policy"
  relatedTerms: json("relatedTerms").$type<number[]>(), // IDs of related terms
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  termEnIdx: index("term_en_idx").on(table.termEn),
  termArIdx: index("term_ar_idx").on(table.termAr),
  categoryIdx: index("category_idx").on(table.category),
}));

export type GlossaryTerm = typeof glossaryTerms.$inferSelect;
export type InsertGlossaryTerm = typeof glossaryTerms.$inferInsert;

// ============================================================================
// STAKEHOLDER REGISTRY
// ============================================================================

export const stakeholders = mysqlTable("stakeholders", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }),
  type: mysqlEnum("type", ["government", "ngo", "international_org", "research_institution", "private_sector"]).notNull(),
  country: varchar("country", { length: 100 }),
  website: text("website"),
  contactEmail: varchar("contactEmail", { length: 320 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  typeIdx: index("type_idx").on(table.type),
}));

export type Stakeholder = typeof stakeholders.$inferSelect;
export type InsertStakeholder = typeof stakeholders.$inferInsert;
