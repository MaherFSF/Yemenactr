/**
 * YETO Platform - Visualization Engine & Reporting Schema Extensions
 * 
 * This file adds tables for:
 * 1. Visualization specifications (chart configs stored in DB)
 * 2. Report templates (JSON/YAML specs for live reports)
 * 3. Editorial workflow for reports
 * 4. Sanctions/compliance tracking
 */

import { mysqlTable, int, varchar, text, timestamp, json, boolean, mysqlEnum, decimal, index, unique } from "drizzle-orm/mysql-core";
import { users, sources, indicators, economicEvents } from "./schema";

// ============================================================================
// VISUALIZATION ENGINE
// ============================================================================

/**
 * Visualization Specifications - stores chart configurations
 * Supports: line, bar, scatter, heatmap, network, sankey, timeline
 */
export const visualizationSpecs = mysqlTable("visualization_specs", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  
  // Chart type and configuration
  chartType: mysqlEnum("chartType", [
    "line", "bar", "scatter", "heatmap", 
    "network", "sankey", "timeline", "area",
    "pie", "donut", "treemap", "choropleth"
  ]).notNull(),
  
  // JSON configuration for the chart
  config: json("config").notNull().$type<{
    // Data source configuration
    dataSource: {
      type: "indicator" | "timeSeries" | "geospatial" | "custom";
      indicatorCodes?: string[];
      regimeTags?: string[];
      dateRange?: { start: string; end: string };
      aggregation?: "sum" | "avg" | "min" | "max" | "count";
    };
    // Visual styling
    style: {
      colors?: string[];
      showLegend?: boolean;
      showGrid?: boolean;
      showTooltip?: boolean;
      animation?: boolean;
    };
    // Axes configuration
    axes?: {
      x?: { label?: string; labelAr?: string; format?: string };
      y?: { label?: string; labelAr?: string; format?: string; min?: number; max?: number };
    };
    // Network/Sankey specific
    nodes?: { id: string; label: string; labelAr?: string; group?: string }[];
    links?: { source: string; target: string; value: number }[];
  }>(),
  
  // Evidence pack metadata
  evidencePackRequired: boolean("evidencePackRequired").default(true).notNull(),
  confidenceRating: mysqlEnum("confidenceRating", ["A", "B", "C", "D"]),
  transformationLog: json("transformationLog").$type<{
    step: string;
    formula?: string;
    appliedAt: string;
  }[]>(),
  
  // Source tracking
  sourceIds: json("sourceIds").$type<number[]>(),
  datasetIds: json("datasetIds").$type<number[]>(),
  
  // Usage tracking
  usedOnPages: json("usedOnPages").$type<string[]>(),
  isPublic: boolean("isPublic").default(true).notNull(),
  
  // Metadata
  createdBy: int("createdBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  chartTypeIdx: index("chart_type_idx").on(table.chartType),
  nameIdx: index("name_idx").on(table.name),
}));

export type VisualizationSpec = typeof visualizationSpecs.$inferSelect;
export type InsertVisualizationSpec = typeof visualizationSpecs.$inferInsert;

/**
 * Visual Suggestions - AI-generated or deterministic chart recommendations
 */
export const visualSuggestions = mysqlTable("visual_suggestions", {
  id: int("id").autoincrement().primaryKey(),
  
  // What triggered this suggestion
  triggerType: mysqlEnum("triggerType", ["data_update", "user_query", "scheduled", "manual"]).notNull(),
  triggerContext: json("triggerContext").$type<{
    indicatorCodes?: string[];
    dateRange?: { start: string; end: string };
    userQuery?: string;
  }>(),
  
  // Suggested visualization
  suggestedChartType: mysqlEnum("suggestedChartType", [
    "line", "bar", "scatter", "heatmap", 
    "network", "sankey", "timeline", "area"
  ]).notNull(),
  suggestedConfig: json("suggestedConfig").notNull(),
  
  // AI annotation (grounded in evidence)
  aiAnnotation: text("aiAnnotation"),
  aiAnnotationAr: text("aiAnnotationAr"),
  annotationSources: json("annotationSources").$type<number[]>(),
  
  // Status
  status: mysqlEnum("status", ["pending", "approved", "rejected", "implemented"]).default("pending").notNull(),
  reviewedBy: int("reviewedBy").references(() => users.id),
  reviewedAt: timestamp("reviewedAt"),
  reviewNotes: text("reviewNotes"),
  
  // If implemented, link to the visualization
  implementedSpecId: int("implementedSpecId").references(() => visualizationSpecs.id),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  statusIdx: index("status_idx").on(table.status),
  triggerTypeIdx: index("trigger_type_idx").on(table.triggerType),
}));

export type VisualSuggestion = typeof visualSuggestions.$inferSelect;
export type InsertVisualSuggestion = typeof visualSuggestions.$inferInsert;

// ============================================================================
// LIVE REPORTING ENGINE
// ============================================================================

/**
 * Report Templates - JSON/YAML specifications for recurring reports
 */
export const reportTemplates = mysqlTable("report_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  
  // Template type
  templateType: mysqlEnum("templateType", [
    "monthly_pulse",      // YETO Pulse
    "quarterly_outlook",  // Outlook & Risk Monitor
    "annual_review",      // Year-in-Review
    "ad_hoc",            // Custom reports
    "executive_brief",   // Executive briefings
    "sector_report"      // Sector-specific reports
  ]).notNull(),
  
  // Template specification (JSON/YAML)
  templateSpec: json("templateSpec").notNull().$type<{
    // Report structure
    sections: {
      id: string;
      title: string;
      titleAr?: string;
      type: "text" | "chart" | "table" | "kpi" | "timeline" | "map";
      content?: string;
      contentAr?: string;
      visualizationSpecId?: number;
      dataQuery?: {
        indicatorCodes?: string[];
        dateRange?: { type: "relative" | "absolute"; value: string };
      };
    }[];
    // Styling
    style: {
      theme: "light" | "dark" | "yeto";
      headerLogo?: string;
      footerText?: string;
      footerTextAr?: string;
    };
    // Evidence requirements
    evidenceAppendix: boolean;
    confidenceThreshold?: "A" | "B" | "C" | "D";
  }>(),
  
  // Schedule for recurring reports
  schedule: mysqlEnum("schedule", ["daily", "weekly", "monthly", "quarterly", "annual", "manual"]).default("manual").notNull(),
  cronExpression: varchar("cronExpression", { length: 100 }),
  nextRunAt: timestamp("nextRunAt"),
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  
  createdBy: int("createdBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  templateTypeIdx: index("template_type_idx").on(table.templateType),
  scheduleIdx: index("schedule_idx").on(table.schedule),
}));

export type ReportTemplate = typeof reportTemplates.$inferSelect;
export type InsertReportTemplate = typeof reportTemplates.$inferInsert;

/**
 * Report Instances - generated reports from templates
 */
export const reportInstances = mysqlTable("report_instances", {
  id: int("id").autoincrement().primaryKey(),
  templateId: int("templateId").notNull().references(() => reportTemplates.id),
  
  // Report metadata
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }),
  reportingPeriod: varchar("reportingPeriod", { length: 100 }), // e.g., "January 2026", "Q1 2026"
  
  // Generated content
  htmlContent: text("htmlContent"),
  htmlContentAr: text("htmlContentAr"),
  
  // Generated files
  pdfFileKey: varchar("pdfFileKey", { length: 255 }),
  pdfFileUrl: text("pdfFileUrl"),
  pdfFileKeyAr: varchar("pdfFileKeyAr", { length: 255 }),
  pdfFileUrlAr: text("pdfFileUrlAr"),
  
  // Evidence appendix
  evidenceAppendix: json("evidenceAppendix").$type<{
    sources: { id: number; publisher: string; url?: string; retrievalDate: string }[];
    datasets: { id: number; name: string; confidenceRating: string }[];
    transformations: { step: string; formula?: string }[];
  }>(),
  
  // Editorial workflow status
  workflowStatus: mysqlEnum("workflowStatus", [
    "draft",
    "under_review",
    "needs_edit",
    "pending_approval",
    "approved",
    "published",
    "archived"
  ]).default("draft").notNull(),
  
  // Workflow tracking
  draftedBy: int("draftedBy").references(() => users.id),
  draftedAt: timestamp("draftedAt"),
  reviewedBy: int("reviewedBy").references(() => users.id),
  reviewedAt: timestamp("reviewedAt"),
  reviewNotes: text("reviewNotes"),
  editedBy: int("editedBy").references(() => users.id),
  editedAt: timestamp("editedAt"),
  approvedBy: int("approvedBy").references(() => users.id),
  approvedAt: timestamp("approvedAt"),
  publishedAt: timestamp("publishedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  templateIdx: index("template_idx").on(table.templateId),
  workflowStatusIdx: index("workflow_status_idx").on(table.workflowStatus),
  reportingPeriodIdx: index("reporting_period_idx").on(table.reportingPeriod),
}));

export type ReportInstance = typeof reportInstances.$inferSelect;
export type InsertReportInstance = typeof reportInstances.$inferInsert;

/**
 * Insight Miner - nightly proposed storylines (never auto-published)
 */
export const insightMinerProposals = mysqlTable("insight_miner_proposals", {
  id: int("id").autoincrement().primaryKey(),
  
  // Proposed storyline
  headline: varchar("headline", { length: 255 }).notNull(),
  headlineAr: varchar("headlineAr", { length: 255 }),
  summary: text("summary").notNull(),
  summaryAr: text("summaryAr"),
  
  // Supporting evidence
  supportingIndicators: json("supportingIndicators").$type<string[]>(),
  supportingEvents: json("supportingEvents").$type<number[]>(),
  supportingSources: json("supportingSources").$type<number[]>(),
  
  // Confidence and categorization
  confidenceScore: decimal("confidenceScore", { precision: 5, scale: 2 }),
  category: mysqlEnum("category", [
    "trend_alert",
    "anomaly_detection",
    "correlation_discovery",
    "forecast_update",
    "risk_signal"
  ]).notNull(),
  
  // Status (never auto-published)
  status: mysqlEnum("status", ["pending_review", "approved", "rejected", "incorporated"]).default("pending_review").notNull(),
  reviewedBy: int("reviewedBy").references(() => users.id),
  reviewedAt: timestamp("reviewedAt"),
  reviewNotes: text("reviewNotes"),
  
  // If incorporated into a report
  incorporatedInReportId: int("incorporatedInReportId").references(() => reportInstances.id),
  
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
}, (table) => ({
  statusIdx: index("status_idx").on(table.status),
  categoryIdx: index("category_idx").on(table.category),
}));

export type InsightMinerProposal = typeof insightMinerProposals.$inferSelect;
export type InsertInsightMinerProposal = typeof insightMinerProposals.$inferInsert;

// ============================================================================
// SANCTIONS & COMPLIANCE MODULE
// ============================================================================

/**
 * Sanctions Lists - ingested official lists (where legally permitted)
 */
export const sanctionsLists = mysqlTable("sanctions_lists", {
  id: int("id").autoincrement().primaryKey(),
  
  // List identification
  listName: varchar("listName", { length: 255 }).notNull(), // e.g., "OFAC SDN", "EU Consolidated", "UK Sanctions"
  listNameAr: varchar("listNameAr", { length: 255 }),
  issuingAuthority: varchar("issuingAuthority", { length: 255 }).notNull(),
  
  // Source and legal basis
  sourceUrl: text("sourceUrl").notNull(),
  legalBasis: text("legalBasis"),
  
  // Ingestion metadata
  lastIngestedAt: timestamp("lastIngestedAt"),
  entryCount: int("entryCount").default(0).notNull(),
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  listNameIdx: index("list_name_idx").on(table.listName),
}));

export type SanctionsList = typeof sanctionsLists.$inferSelect;
export type InsertSanctionsList = typeof sanctionsLists.$inferInsert;

/**
 * Sanctions Entries - individual entries from sanctions lists
 */
export const sanctionsEntries = mysqlTable("sanctions_entries", {
  id: int("id").autoincrement().primaryKey(),
  listId: int("listId").notNull().references(() => sanctionsLists.id),
  
  // Entry identification
  entryType: mysqlEnum("entryType", ["individual", "entity", "vessel", "aircraft"]).notNull(),
  primaryName: varchar("primaryName", { length: 500 }).notNull(),
  primaryNameAr: varchar("primaryNameAr", { length: 500 }),
  aliases: json("aliases").$type<string[]>(),
  
  // Additional identifiers
  identifiers: json("identifiers").$type<{
    type: string; // e.g., "passport", "national_id", "registration"
    value: string;
    country?: string;
  }[]>(),
  
  // Designation details
  designationDate: timestamp("designationDate"),
  programs: json("programs").$type<string[]>(), // e.g., ["YEMEN", "IRGC"]
  remarks: text("remarks"),
  remarksAr: text("remarksAr"),
  
  // Source reference
  sourceEntryId: varchar("sourceEntryId", { length: 255 }), // Original ID from source
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  listIdx: index("list_idx").on(table.listId),
  entryTypeIdx: index("entry_type_idx").on(table.entryType),
  primaryNameIdx: index("primary_name_idx").on(table.primaryName),
}));

export type SanctionsEntry = typeof sanctionsEntries.$inferSelect;
export type InsertSanctionsEntry = typeof sanctionsEntries.$inferInsert;

/**
 * Entity Matches - matches between platform entities and sanctions entries
 */
export const entityMatches = mysqlTable("entity_matches", {
  id: int("id").autoincrement().primaryKey(),
  
  // Platform entity reference
  platformEntityType: mysqlEnum("platformEntityType", ["bank", "company", "individual", "organization"]).notNull(),
  platformEntityId: int("platformEntityId").notNull(),
  platformEntityName: varchar("platformEntityName", { length: 500 }).notNull(),
  
  // Sanctions entry reference
  sanctionsEntryId: int("sanctionsEntryId").notNull().references(() => sanctionsEntries.id),
  
  // Match details
  matchType: mysqlEnum("matchType", ["exact", "fuzzy", "alias", "identifier"]).notNull(),
  matchConfidence: decimal("matchConfidence", { precision: 5, scale: 2 }).notNull(), // 0-100
  matchExplanation: text("matchExplanation").notNull(), // Explainable matching
  matchExplanationAr: text("matchExplanationAr"),
  
  // Verification status
  verificationStatus: mysqlEnum("verificationStatus", [
    "unverified",
    "confirmed_match",
    "false_positive",
    "disputed",
    "under_review"
  ]).default("unverified").notNull(),
  verifiedBy: int("verifiedBy").references(() => users.id),
  verifiedAt: timestamp("verifiedAt"),
  verificationNotes: text("verificationNotes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  platformEntityIdx: index("platform_entity_idx").on(table.platformEntityType, table.platformEntityId),
  sanctionsEntryIdx: index("sanctions_entry_idx").on(table.sanctionsEntryId),
  verificationStatusIdx: index("verification_status_idx").on(table.verificationStatus),
}));

export type EntityMatch = typeof entityMatches.$inferSelect;
export type InsertEntityMatch = typeof entityMatches.$inferInsert;

/**
 * Compliance Disputes - disputes and corrections workflow with audit log
 */
export const complianceDisputes = mysqlTable("compliance_disputes", {
  id: int("id").autoincrement().primaryKey(),
  
  // What is being disputed
  disputeType: mysqlEnum("disputeType", ["match_accuracy", "data_error", "outdated_info", "defamation_concern"]).notNull(),
  relatedMatchId: int("relatedMatchId").references(() => entityMatches.id),
  relatedEntityType: varchar("relatedEntityType", { length: 100 }),
  relatedEntityId: int("relatedEntityId"),
  
  // Dispute details
  disputeDescription: text("disputeDescription").notNull(),
  disputeDescriptionAr: text("disputeDescriptionAr"),
  supportingEvidence: text("supportingEvidence"),
  
  // Submitter (can be anonymous)
  submittedBy: int("submittedBy").references(() => users.id),
  submitterEmail: varchar("submitterEmail", { length: 320 }),
  submitterOrganization: varchar("submitterOrganization", { length: 255 }),
  
  // Status and resolution
  status: mysqlEnum("status", [
    "submitted",
    "under_review",
    "additional_info_requested",
    "resolved_accepted",
    "resolved_rejected",
    "escalated"
  ]).default("submitted").notNull(),
  
  // Resolution details
  resolution: text("resolution"),
  resolutionAr: text("resolutionAr"),
  resolvedBy: int("resolvedBy").references(() => users.id),
  resolvedAt: timestamp("resolvedAt"),
  
  // Audit trail
  auditLog: json("auditLog").$type<{
    timestamp: string;
    action: string;
    userId?: number;
    details: string;
  }[]>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  statusIdx: index("status_idx").on(table.status),
  disputeTypeIdx: index("dispute_type_idx").on(table.disputeType),
}));

export type ComplianceDispute = typeof complianceDisputes.$inferSelect;
export type InsertComplianceDispute = typeof complianceDisputes.$inferInsert;

// ============================================================================
// GLOSSARY ENHANCEMENTS
// ============================================================================

/**
 * Glossary Versions - versioned edits for glossary terms
 */
export const glossaryVersions = mysqlTable("glossary_versions", {
  id: int("id").autoincrement().primaryKey(),
  termId: int("termId").notNull(), // References glossaryTerms.id
  
  // Version content
  version: int("version").notNull(),
  termEn: varchar("termEn", { length: 255 }).notNull(),
  termAr: varchar("termAr", { length: 255 }).notNull(),
  definitionEn: text("definitionEn").notNull(),
  definitionAr: text("definitionAr").notNull(),
  
  // Yemen-specific examples
  yemenExampleEn: text("yemenExampleEn"),
  yemenExampleAr: text("yemenExampleAr"),
  
  // Mini chart reference
  relatedChartSpecId: int("relatedChartSpecId").references(() => visualizationSpecs.id),
  
  // Cross-links
  crossLinks: json("crossLinks").$type<number[]>(), // IDs of related terms
  
  // Change tracking
  changeReason: text("changeReason"),
  changedBy: int("changedBy").references(() => users.id),
  changedAt: timestamp("changedAt").defaultNow().notNull(),
}, (table) => ({
  termVersionIdx: unique("term_version_unique").on(table.termId, table.version),
}));

export type GlossaryVersion = typeof glossaryVersions.$inferSelect;
export type InsertGlossaryVersion = typeof glossaryVersions.$inferInsert;

// ============================================================================
// TIMELINE ENHANCEMENTS
// ============================================================================

/**
 * Timeline Evidence Packs - evidence attached to timeline events
 */
export const timelineEvidencePacks = mysqlTable("timeline_evidence_packs", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull().references(() => economicEvents.id),
  
  // Evidence sources
  sourceIds: json("sourceIds").$type<number[]>().notNull(),
  documentIds: json("documentIds").$type<number[]>(),
  
  // Key data points before/after event
  beforeAfterData: json("beforeAfterData").$type<{
    indicatorCode: string;
    indicatorName: string;
    indicatorNameAr?: string;
    beforeValue: number;
    beforeDate: string;
    afterValue: number;
    afterDate: string;
    percentChange: number;
  }[]>(),
  
  // Confidence and notes
  confidenceRating: mysqlEnum("confidenceRating", ["A", "B", "C", "D"]).notNull(),
  notes: text("notes"),
  notesAr: text("notesAr"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  eventIdx: index("event_idx").on(table.eventId),
}));

export type TimelineEvidencePack = typeof timelineEvidencePacks.$inferSelect;
export type InsertTimelineEvidencePack = typeof timelineEvidencePacks.$inferInsert;

/**
 * Chart Overlays - timeline events overlaid on charts
 */
export const chartOverlays = mysqlTable("chart_overlays", {
  id: int("id").autoincrement().primaryKey(),
  visualizationSpecId: int("visualizationSpecId").notNull().references(() => visualizationSpecs.id),
  eventId: int("eventId").notNull().references(() => economicEvents.id),
  
  // Overlay configuration
  overlayType: mysqlEnum("overlayType", ["vertical_line", "shaded_region", "annotation"]).notNull(),
  config: json("config").$type<{
    color?: string;
    opacity?: number;
    label?: string;
    labelAr?: string;
    showInLegend?: boolean;
  }>(),
  
  // Display settings
  isEnabled: boolean("isEnabled").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  vizSpecIdx: index("viz_spec_idx").on(table.visualizationSpecId),
  eventIdx: index("event_idx").on(table.eventId),
}));

export type ChartOverlay = typeof chartOverlays.$inferSelect;
export type InsertChartOverlay = typeof chartOverlays.$inferInsert;
