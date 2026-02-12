/**
 * YETO v1.6 PHASE 1: DATABASE SCHEMA ENHANCEMENTS
 * MySQL/TiDB Compatible Drizzle Migrations
 * 
 * Enhancements:
 * - Calendar table for 2010-2026 daily timeline
 * - Source registry with 225+ connectors
 * - Ingestion run tracking with detailed logging
 * - Gap ticket system for automated gap detection
 * - Multi-agent approval engine
 * - Content evidence tracking
 * - Document text chunks with embeddings
 * - Bilingual glossary
 * - Audit logging
 */

import {
  mysqlTable,
  mysqlEnum,
  int,
  varchar,
  text,
  timestamp,
  date,
  decimal,
  json,
  index,
  uniqueIndex,
  boolean,
} from "drizzle-orm/mysql-core";

// ============================================================================
// CALENDAR TABLE (2010-2026 DAILY TIMELINE)
// ============================================================================

export const calendarDay = mysqlTable(
  "calendar_day",
  {
    day: date("day").primaryKey().notNull(),
    isoYear: int("iso_year").notNull(),
    isoWeek: int("iso_week").notNull(),
    month: int("month").notNull(),
    quarter: int("quarter").notNull(),
    dayOfWeek: int("day_of_week").notNull(),
    isWeekend: boolean("is_weekend").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    yearIdx: index("idx_calendar_year").on(table.isoYear),
    monthIdx: index("idx_calendar_month").on(table.isoYear, table.month),
    quarterIdx: index("idx_calendar_quarter").on(table.isoYear, table.quarter),
  })
);

export type CalendarDay = typeof calendarDay.$inferSelect;
export type InsertCalendarDay = typeof calendarDay.$inferInsert;

// ============================================================================
// SOURCE REGISTRY — USE THE CANONICAL DEFINITION IN schema.ts
// ============================================================================
// IMPORTANT: The sourceRegistry table is defined in drizzle/schema.ts (line ~7412).
// That is the SINGLE canonical definition with T0-T4 tiers, 40+ fields.
// This file previously had a duplicate, simpler definition that has been removed
// to prevent schema conflicts. Import sourceRegistry from schema.ts instead.
//
// Re-export from canonical schema for backward compatibility:
import { sourceRegistry } from "./schema";
export { sourceRegistry };
export type SourceRegistry = typeof sourceRegistry.$inferSelect;
export type InsertSourceRegistry = typeof sourceRegistry.$inferInsert;

// ============================================================================
// INGESTION RUN TRACKING
// ============================================================================

export const ingestionRun = mysqlTable(
  "ingestion_run",
  {
    id: int("id").autoincrement().primaryKey(),
    sourceId: int("source_id").notNull().references(() => sourceRegistry.id),
    runDate: date("run_date").notNull(),
    runTime: timestamp("run_time").defaultNow().notNull(),
    status: mysqlEnum("status", ["RUNNING", "SUCCESS", "FAILED", "PARTIAL"]).default("RUNNING").notNull(),
    recordsProcessed: int("records_processed").default(0),
    recordsInserted: int("records_inserted").default(0),
    recordsUpdated: int("records_updated").default(0),
    recordsFailed: int("records_failed").default(0),
    errorMessage: text("error_message"),
    executionTimeSeconds: decimal("execution_time_seconds", { precision: 10, scale: 2 }),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    sourceIdx: index("idx_ingestion_source").on(table.sourceId),
    dateIdx: index("idx_ingestion_date").on(table.runDate),
    statusIdx: index("idx_ingestion_status").on(table.status),
  })
);

export type IngestionRun = typeof ingestionRun.$inferSelect;
export type InsertIngestionRun = typeof ingestionRun.$inferInsert;

// ============================================================================
// GAP TICKET SYSTEM
// ============================================================================

export const gapTicket = mysqlTable(
  "gap_ticket",
  {
    id: int("id").autoincrement().primaryKey(),
    gapType: varchar("gap_type", { length: 100 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    severity: mysqlEnum("severity", ["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM").notNull(),
    status: mysqlEnum("status", ["OPEN", "IN_PROGRESS", "RESOLVED", "WONT_FIX"]).default("OPEN").notNull(),
    relatedSourceId: int("related_source_id").references(() => sourceRegistry.id),
    relatedIndicatorId: int("related_indicator_id"),
    relatedSeriesId: int("related_series_id"),
    assignedToUserId: int("assigned_to_user_id"),
    createdByUserId: int("created_by_user_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    resolvedAt: timestamp("resolved_at"),
    resolutionNotes: text("resolution_notes"),
  },
  (table) => ({
    statusIdx: index("idx_gap_status").on(table.status),
    severityIdx: index("idx_gap_severity").on(table.severity),
    sourceIdx: index("idx_gap_source").on(table.relatedSourceId),
    createdIdx: index("idx_gap_created").on(table.createdAt),
  })
);

export type GapTicket = typeof gapTicket.$inferSelect;
export type InsertGapTicket = typeof gapTicket.$inferInsert;

// ============================================================================
// MULTI-AGENT APPROVAL ENGINE
// ============================================================================

export const agent = mysqlTable(
  "agent",
  {
    id: int("id").autoincrement().primaryKey(),
    agentKey: varchar("agent_key", { length: 100 }).notNull().unique(),
    nameEn: varchar("name_en", { length: 255 }).notNull(),
    nameAr: varchar("name_ar", { length: 255 }),
    description: text("description"),
    stage: mysqlEnum("stage", [
      "DRAFTING",
      "EVIDENCE",
      "CONSISTENCY",
      "SAFETY",
      "AR_COPY",
      "EN_COPY",
      "STANDARDS",
      "FINAL_APPROVAL",
    ]).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    config: json("config").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    agentKeyIdx: uniqueIndex("idx_agent_key").on(table.agentKey),
    stageIdx: index("idx_agent_stage").on(table.stage),
  })
);

export type Agent = typeof agent.$inferSelect;
export type InsertAgent = typeof agent.$inferInsert;

export const agentRun = mysqlTable(
  "agent_run",
  {
    id: int("id").autoincrement().primaryKey(),
    agentId: int("agent_id").notNull().references(() => agent.id),
    contentItemId: int("content_item_id"),
    stage: mysqlEnum("stage", [
      "DRAFTING",
      "EVIDENCE",
      "CONSISTENCY",
      "SAFETY",
      "AR_COPY",
      "EN_COPY",
      "STANDARDS",
      "FINAL_APPROVAL",
    ]).notNull(),
    result: mysqlEnum("result", ["PASS", "FAIL", "NEEDS_HUMAN", "SKIPPED"]).default("SKIPPED").notNull(),
    score: decimal("score", { precision: 5, scale: 2 }).default("0"),
    notes: text("notes"),
    output: json("output").$type<Record<string, unknown>>().default({}),
    runStartedAt: timestamp("run_started_at").defaultNow().notNull(),
    runEndedAt: timestamp("run_ended_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    stageIdx: index("idx_agent_run_stage").on(table.stage),
    resultIdx: index("idx_agent_run_result").on(table.result),
    createdIdx: index("idx_agent_run_created").on(table.createdAt),
  })
);

export type AgentRun = typeof agentRun.$inferSelect;
export type InsertAgentRun = typeof agentRun.$inferInsert;

// ============================================================================
// CONTENT EVIDENCE TRACKING
// ============================================================================

export const contentEvidence = mysqlTable(
  "content_evidence",
  {
    id: int("id").autoincrement().primaryKey(),
    contentItemId: int("content_item_id"),
    claimText: text("claim_text").notNull(),
    lang: mysqlEnum("lang", ["EN", "AR"]).notNull(),
    sourceId: int("source_id").references(() => sourceRegistry.id),
    documentId: int("document_id"),
    url: text("url"),
    pageRef: varchar("page_ref", { length: 50 }),
    extractedQuote: text("extracted_quote"),
    confidence: decimal("confidence", { precision: 3, scale: 2 }).default("1"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    sourceIdx: index("idx_evidence_source").on(table.sourceId),
    createdIdx: index("idx_evidence_created").on(table.createdAt),
  })
);

export type ContentEvidence = typeof contentEvidence.$inferSelect;
export type InsertContentEvidence = typeof contentEvidence.$inferInsert;

// ============================================================================
// DOCUMENT TEXT CHUNKS WITH EMBEDDINGS
// ============================================================================

export const documentTextChunk = mysqlTable(
  "document_text_chunk",
  {
    id: int("id").autoincrement().primaryKey(),
    documentId: int("document_id"),
    chunkIndex: int("chunk_index").notNull(),
    pageStart: int("page_start"),
    pageEnd: int("page_end"),
    textEn: text("text_en"),
    textAr: text("text_ar"),
    embedding: varchar("embedding", { length: 4000 }), // Serialized vector
    citations: json("citations").$type<unknown[]>().default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    documentIdx: index("idx_chunk_document").on(table.documentId),
    chunkIdx: uniqueIndex("idx_chunk_unique").on(table.documentId, table.chunkIndex),
  })
);

export type DocumentTextChunk = typeof documentTextChunk.$inferSelect;
export type InsertDocumentTextChunk = typeof documentTextChunk.$inferInsert;

// ============================================================================
// BILINGUAL GLOSSARY
// ============================================================================

export const glossaryTerm = mysqlTable(
  "glossary_term",
  {
    id: int("id").autoincrement().primaryKey(),
    termEn: varchar("term_en", { length: 255 }).notNull().unique(),
    termAr: varchar("term_ar", { length: 255 }).notNull().unique(),
    definitionEn: text("definition_en").notNull(),
    definitionAr: text("definition_ar").notNull(),
    category: varchar("category", { length: 100 }),
    context: text("context"),
    relatedTerms: varchar("related_terms", { length: 500 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    categoryIdx: index("idx_glossary_category").on(table.category),
  })
);

export type GlossaryTerm = typeof glossaryTerm.$inferSelect;
export type InsertGlossaryTerm = typeof glossaryTerm.$inferInsert;

// ============================================================================
// AUDIT LOGGING
// ============================================================================

export const auditLog = mysqlTable(
  "audit_log",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id"),
    action: varchar("action", { length: 100 }).notNull(),
    entityType: varchar("entity_type", { length: 100 }),
    entityId: int("entity_id"),
    oldValues: json("old_values").$type<Record<string, unknown>>(),
    newValues: json("new_values").$type<Record<string, unknown>>(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("idx_audit_user").on(table.userId),
    entityIdx: index("idx_audit_entity").on(table.entityType, table.entityId),
    createdIdx: index("idx_audit_created").on(table.createdAt),
  })
);

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;

// ============================================================================
// ENHANCED OBSERVATION TABLE COLUMNS
// ============================================================================

/**
 * The observation table should be enhanced with these columns:
 * - vintage_date: date (DEFAULT CURRENT_DATE) - Version date for "as-of" snapshots
 * - revision_no: int (DEFAULT 0) - Revision number for corrections
 * - confidence: decimal (DEFAULT 1.0) - Confidence level (0-1)
 * - is_estimate: boolean (DEFAULT false) - Whether value is estimated
 * - quality_score: decimal (DEFAULT 0) - Quality score (0-100)
 * - notes: text - Additional notes
 * 
 * These should be added via migration:
 * ALTER TABLE observation ADD COLUMN vintage_date DATE DEFAULT CURRENT_DATE;
 * ALTER TABLE observation ADD COLUMN revision_no INT DEFAULT 0;
 * ALTER TABLE observation ADD COLUMN confidence DECIMAL(3,2) DEFAULT 1.0;
 * ALTER TABLE observation ADD COLUMN is_estimate BOOLEAN DEFAULT false;
 * ALTER TABLE observation ADD COLUMN quality_score DECIMAL(5,2) DEFAULT 0;
 * ALTER TABLE observation ADD COLUMN notes TEXT;
 * CREATE UNIQUE INDEX idx_observation_versioning ON observation(series_id, obs_date, vintage_date, revision_no);
 */

// ============================================================================
// SEED DATA FOR AGENTS
// ============================================================================

export const seedAgents = [
  {
    agentKey: "evidence_agent",
    nameEn: "Evidence Validator",
    nameAr: "مدقق الأدلة",
    stage: "EVIDENCE" as const,
    description: "Validates all claims against sources",
  },
  {
    agentKey: "consistency_agent",
    nameEn: "Consistency Checker",
    nameAr: "مدقق التناسق",
    stage: "CONSISTENCY" as const,
    description: "Checks for contradictions",
  },
  {
    agentKey: "safety_agent",
    nameEn: "Safety Screener",
    nameAr: "فاحص الأمان",
    stage: "SAFETY" as const,
    description: "Screens for harmful content",
  },
  {
    agentKey: "ar_translator",
    nameEn: "Arabic Translator",
    nameAr: "المترجم العربي",
    stage: "AR_COPY" as const,
    description: "Validates Arabic translation",
  },
  {
    agentKey: "en_translator",
    nameEn: "English Translator",
    nameAr: "المترجم الإنجليزي",
    stage: "EN_COPY" as const,
    description: "Validates English translation",
  },
  {
    agentKey: "format_agent",
    nameEn: "Format Checker",
    nameAr: "فاحص الصيغة",
    stage: "STANDARDS" as const,
    description: "Checks formatting and style",
  },
  {
    agentKey: "uniqueness_agent",
    nameEn: "Uniqueness Detector",
    nameAr: "كاشف التفرد",
    stage: "CONSISTENCY" as const,
    description: "Detects plagiarism",
  },
  {
    agentKey: "quality_agent",
    nameEn: "Quality Scorer",
    nameAr: "مقيم الجودة",
    stage: "FINAL_APPROVAL" as const,
    description: "Scores content quality",
  },
];

// seedSources removed — source data comes exclusively from the canonical xlsx
// imported via scripts/import-registry.ts → source_registry table.
// See: archive/README.md for details on the cleanup.
