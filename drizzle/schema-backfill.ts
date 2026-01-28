/**
 * Backfill Infrastructure Schema
 * Tables for managing historical data backfill operations
 */

import { mysqlTable, int, varchar, text, timestamp, boolean, mysqlEnum, json, index } from "drizzle-orm/mysql-core";
import { evidenceSources } from "./schema";

// ============================================================================
// SOURCE CREDENTIALS - Secure storage for API keys and auth tokens
// ============================================================================

export const sourceCredentials = mysqlTable("source_credentials", {
  id: int("id").autoincrement().primaryKey(),
  sourceId: int("sourceId").notNull().references(() => evidenceSources.id),
  credentialType: mysqlEnum("credentialType", ["api_key", "oauth_token", "basic_auth", "certificate"]).notNull(),
  apiKey: text("apiKey"), // For simple API keys (encrypted at application level)
  encryptedKey: text("encryptedKey"), // For encrypted storage
  username: varchar("username", { length: 255 }),
  password: text("password"), // Encrypted
  oauthAccessToken: text("oauthAccessToken"),
  oauthRefreshToken: text("oauthRefreshToken"),
  oauthExpiresAt: timestamp("oauthExpiresAt"),
  certificatePath: varchar("certificatePath", { length: 500 }),
  isActive: boolean("isActive").default(true).notNull(),
  lastValidatedAt: timestamp("lastValidatedAt"),
  validationStatus: mysqlEnum("validationStatus", ["valid", "invalid", "expired", "untested"]).default("untested").notNull(),
  validationMessage: text("validationMessage"), // Error message or success details
  expiresAt: timestamp("expiresAt"), // For time-limited keys
  rateLimit: int("rateLimit"), // Requests per day/hour
  rateLimitPeriod: varchar("rateLimitPeriod", { length: 50 }), // 'day', 'hour', 'minute'
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: varchar("createdBy", { length: 64 }), // User openId
}, (table) => ({
  sourceIdx: index("source_cred_source_idx").on(table.sourceId),
  activeIdx: index("source_cred_active_idx").on(table.isActive),
  expiryIdx: index("source_cred_expiry_idx").on(table.expiresAt),
}));

export type SourceCredential = typeof sourceCredentials.$inferSelect;
export type InsertSourceCredential = typeof sourceCredentials.$inferInsert;

// ============================================================================
// BACKFILL CHECKPOINTS - Resumable backfill progress tracking
// ============================================================================

export const backfillCheckpoints = mysqlTable("backfill_checkpoints", {
  id: varchar("id", { length: 255 }).primaryKey(), // bf_{datasetId}_{indicatorCode}_{timestamp}
  datasetId: varchar("datasetId", { length: 255 }).notNull(),
  indicatorCode: varchar("indicatorCode", { length: 100 }).notNull(),
  sourceId: int("sourceId").references(() => evidenceSources.id),
  lastProcessedDate: timestamp("lastProcessedDate").notNull(),
  totalDays: int("totalDays").notNull().default(0),
  processedDays: int("processedDays").notNull().default(0),
  insertedRecords: int("insertedRecords").notNull().default(0),
  skippedRecords: int("skippedRecords").notNull().default(0),
  errorCount: int("errorCount").notNull().default(0),
  status: mysqlEnum("status", ["running", "paused", "completed", "failed"]).notNull().default("running"),
  startedAt: timestamp("startedAt").notNull(),
  lastUpdatedAt: timestamp("lastUpdatedAt").notNull(),
  completedAt: timestamp("completedAt"),
  errors: json("errors").$type<string[]>().default([]),
  metadata: json("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  datasetIdx: index("backfill_dataset_idx").on(table.datasetId),
  indicatorIdx: index("backfill_indicator_idx").on(table.indicatorCode),
  statusIdx: index("backfill_status_idx").on(table.status),
  startedIdx: index("backfill_started_idx").on(table.startedAt),
}));

export type BackfillCheckpoint = typeof backfillCheckpoints.$inferSelect;
export type InsertBackfillCheckpoint = typeof backfillCheckpoints.$inferInsert;

// ============================================================================
// BACKFILL REQUESTS - Track user-initiated backfill requests
// ============================================================================

export const backfillRequests = mysqlTable("backfill_requests", {
  id: varchar("id", { length: 255 }).primaryKey(),
  sourceId: int("sourceId").notNull().references(() => evidenceSources.id),
  indicatorCodes: json("indicatorCodes").$type<string[]>().notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  regimeTag: mysqlEnum("regimeTag", ["aden_irg", "sanaa_defacto", "mixed"]),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "running", "completed", "failed", "cancelled"]).default("pending").notNull(),
  strategy: varchar("strategy", { length: 100 }), // api_public, api_key_required, etc.
  estimatedDataPoints: int("estimatedDataPoints"),
  estimatedDuration: varchar("estimatedDuration", { length: 100 }),
  requestedBy: varchar("requestedBy", { length: 64 }).notNull(), // User openId
  approvedBy: varchar("approvedBy", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  notes: text("notes"),
}, (table) => ({
  sourceIdx: index("backfill_req_source_idx").on(table.sourceId),
  statusIdx: index("backfill_req_status_idx").on(table.status),
  requestedByIdx: index("backfill_req_user_idx").on(table.requestedBy),
  createdIdx: index("backfill_req_created_idx").on(table.createdAt),
}));

export type BackfillRequest = typeof backfillRequests.$inferSelect;
export type InsertBackfillRequest = typeof backfillRequests.$inferInsert;

// ============================================================================
// PARTNERSHIP REQUESTS - Track partnership negotiations for data access
// ============================================================================

export const partnershipRequests = mysqlTable("partnership_requests", {
  id: int("id").autoincrement().primaryKey(),
  sourceId: int("sourceId").notNull().references(() => evidenceSources.id),
  organizationName: varchar("organizationName", { length: 255 }).notNull(),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactName: varchar("contactName", { length: 255 }),
  requestType: mysqlEnum("requestType", ["data_access", "api_key", "partnership_mou", "bulk_download"]).notNull(),
  status: mysqlEnum("status", [
    "draft",
    "sent",
    "in_negotiation",
    "approved",
    "rejected",
    "on_hold"
  ]).default("draft").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  proposalText: text("proposalText"),
  responseReceived: boolean("responseReceived").default(false).notNull(),
  responseText: text("responseText"),
  estimatedTimeline: varchar("estimatedTimeline", { length: 100 }), // e.g., "2-6 months"
  requestedBy: varchar("requestedBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  sentAt: timestamp("sentAt"),
  respondedAt: timestamp("respondedAt"),
  notes: text("notes"),
}, (table) => ({
  sourceIdx: index("partnership_req_source_idx").on(table.sourceId),
  statusIdx: index("partnership_req_status_idx").on(table.status),
  createdIdx: index("partnership_req_created_idx").on(table.createdAt),
}));

export type PartnershipRequest = typeof partnershipRequests.$inferSelect;
export type InsertPartnershipRequest = typeof partnershipRequests.$inferInsert;
