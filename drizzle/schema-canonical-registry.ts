/**
 * CANONICAL SOURCE REGISTRY SCHEMA
 * 
 * This is THE source of truth for all data sources in YETO.
 * DO NOT create parallel source tracking systems.
 * 
 * Tables:
 * - source_registry: Main registry (292 sources)
 * - source_endpoints: API/Web endpoints per source (1-to-many)
 * - source_products: Data products per source (1-to-many)
 * - ingestion_work_queue: Crash-safe job queue
 * - registry_diff_log: Track import changes
 */

import { mysqlTable, int, varchar, text, timestamp, boolean, mysqlEnum, json, index, foreignKey } from "drizzle-orm/mysql-core";

// Note: source_registry is defined in drizzle/0024_loving_wind_dancer.sql
// We reference it here for TypeScript types

// ============================================================================
// SOURCE ENDPOINTS (1-to-many by sourceRegistryId)
// ============================================================================
export const sourceEndpoints = mysqlTable("source_endpoints", {
  id: int("id").autoincrement().primaryKey(),
  sourceRegistryId: int("sourceRegistryId").notNull(),
  endpointType: mysqlEnum("endpointType", [
    "API", "SDMX", "RSS", "WEB", "PDF", "CSV", "XLSX", 
    "FTP", "EMAIL", "MANUAL", "PARTNER", "REMOTE_SENSING", "WEBHOOK"
  ]).notNull().default("WEB"),
  url: text("url"),
  authRequired: boolean("authRequired").notNull().default(false),
  authScheme: mysqlEnum("authScheme", [
    "API_KEY", "BEARER_TOKEN", "BASIC_AUTH", "OAUTH2", "CERTIFICATE", "NONE"
  ]).default("NONE"),
  authNotes: text("authNotes"),
  rateLimit: int("rateLimit"),
  rateLimitPeriod: mysqlEnum("rateLimitPeriod", ["SECOND", "MINUTE", "HOUR", "DAY", "MONTH"]).default("DAY"),
  documentation: text("documentation"),
  notes: text("notes"),
  isActive: boolean("isActive").notNull().default(true),
  lastVerified: timestamp("lastVerified"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  sourceIdx: index("source_endpoints_source_idx").on(table.sourceRegistryId),
  typeIdx: index("source_endpoints_type_idx").on(table.endpointType),
  activeIdx: index("source_endpoints_active_idx").on(table.isActive),
}));

export type SourceEndpoint = typeof sourceEndpoints.$inferSelect;
export type InsertSourceEndpoint = typeof sourceEndpoints.$inferInsert;

// ============================================================================
// SOURCE PRODUCTS (1-to-many by sourceRegistryId)
// ============================================================================
export const sourceProducts = mysqlTable("source_products", {
  id: int("id").autoincrement().primaryKey(),
  sourceRegistryId: int("sourceRegistryId").notNull(),
  productName: varchar("productName", { length: 500 }).notNull(),
  productType: mysqlEnum("productType", [
    "DATA_NUMERIC", "DATA_GEOSPATIAL", "DOC_PDF", "DOC_NARRATIVE", 
    "DOC_EXCEL", "NEWS_MEDIA", "SANCTIONS_LIST", "REGISTRY", 
    "EVENT_DATA", "PRICE_DATA", "FORECAST", "OTHER"
  ]).notNull(),
  coverage: text("coverage"),
  updateFrequency: mysqlEnum("updateFrequency", [
    "REALTIME", "DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "ANNUAL", "IRREGULAR"
  ]).default("IRREGULAR"),
  keywords: json("keywords").$type<string[]>(),
  sectors: json("sectors").$type<string[]>(),
  dataFormat: varchar("dataFormat", { length: 100 }),
  historicalStart: int("historicalStart"),
  historicalEnd: int("historicalEnd"),
  notes: text("notes"),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  sourceIdx: index("source_products_source_idx").on(table.sourceRegistryId),
  typeIdx: index("source_products_type_idx").on(table.productType),
  activeIdx: index("source_products_active_idx").on(table.isActive),
}));

export type SourceProduct = typeof sourceProducts.$inferSelect;
export type InsertSourceProduct = typeof sourceProducts.$inferInsert;

// ============================================================================
// INGESTION WORK QUEUE (crash-safe execution)
// ============================================================================
export const ingestionWorkQueue = mysqlTable("ingestion_work_queue", {
  id: int("id").autoincrement().primaryKey(),
  jobType: mysqlEnum("jobType", [
    "IMPORT_REGISTRY", "INGEST_SOURCE", "INGEST_ENDPOINT", 
    "INGEST_PRODUCT", "BACKFILL", "REFRESH"
  ]).notNull(),
  sourceRegistryId: int("sourceRegistryId"),
  endpointId: int("endpointId"),
  productId: int("productId"),
  state: mysqlEnum("state", [
    "PENDING", "RUNNING", "PAUSED", "COMPLETED", "FAILED", "CANCELLED"
  ]).notNull().default("PENDING"),
  priority: int("priority").notNull().default(50),
  attemptCount: int("attemptCount").notNull().default(0),
  maxAttempts: int("maxAttempts").notNull().default(3),
  progressJson: json("progressJson").$type<{
    step?: string;
    itemsProcessed?: number;
    itemsTotal?: number;
    percentComplete?: number;
    checkpoint?: any;
  }>(),
  lastError: text("lastError"),
  lastErrorAt: timestamp("lastErrorAt"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  stateIdx: index("work_queue_state_idx").on(table.state),
  jobTypeIdx: index("work_queue_job_type_idx").on(table.jobType),
  priorityIdx: index("work_queue_priority_idx").on(table.priority),
  sourceIdx: index("work_queue_source_idx").on(table.sourceRegistryId),
  createdIdx: index("work_queue_created_idx").on(table.createdAt),
}));

export type IngestionWorkQueueJob = typeof ingestionWorkQueue.$inferSelect;
export type InsertIngestionWorkQueueJob = typeof ingestionWorkQueue.$inferInsert;

// ============================================================================
// REGISTRY DIFF LOG (track changes between imports)
// ============================================================================
export const registryDiffLog = mysqlTable("registry_diff_log", {
  id: int("id").autoincrement().primaryKey(),
  importRunId: varchar("importRunId", { length: 50 }),
  changeType: mysqlEnum("changeType", ["ADD", "EDIT", "DELETE", "NO_CHANGE"]).notNull(),
  sourceId: varchar("sourceId", { length: 50 }).notNull(),
  tableName: varchar("tableName", { length: 50 }).notNull(),
  fieldName: varchar("fieldName", { length: 100 }),
  oldValue: text("oldValue"),
  newValue: text("newValue"),
  changeMetadata: json("changeMetadata").$type<Record<string, any>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  importIdx: index("registry_diff_import_idx").on(table.importRunId),
  sourceIdx: index("registry_diff_source_idx").on(table.sourceId),
  typeIdx: index("registry_diff_type_idx").on(table.changeType),
  createdIdx: index("registry_diff_created_idx").on(table.createdAt),
}));

export type RegistryDiffLogEntry = typeof registryDiffLog.$inferSelect;
export type InsertRegistryDiffLogEntry = typeof registryDiffLog.$inferInsert;
