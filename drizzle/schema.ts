import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json, boolean, index, unique, uniqueIndex, date } from "drizzle-orm/mysql-core";

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
  role: mysqlEnum("role", ["user", "admin", "editor", "viewer", "analyst", "partner_contributor"]).default("user").notNull(),
  subscriptionTier: mysqlEnum("subscriptionTier", ["free", "researcher", "institutional"]).default("free").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Session tokens for timeout management
export const sessionTokens = mysqlTable("session_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  lastActivityAt: timestamp("lastActivityAt").defaultNow().notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("session_user_idx").on(table.userId),
  tokenIdx: index("session_token_idx").on(table.token),
  expiresIdx: index("session_expires_idx").on(table.expiresAt),
}));

export type SessionToken = typeof sessionTokens.$inferSelect;
export type InsertSessionToken = typeof sessionTokens.$inferInsert;

// Audit logs for tracking admin actions
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  userEmail: varchar("userEmail", { length: 320 }),
  userRole: varchar("userRole", { length: 50 }),
  action: varchar("action", { length: 100 }).notNull(), // e.g., "user.create", "data.update", "settings.change"
  resourceType: varchar("resourceType", { length: 100 }), // e.g., "user", "dataset", "indicator"
  resourceId: varchar("resourceId", { length: 100 }), // ID of affected resource
  details: text("details"), // JSON with additional context
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  status: mysqlEnum("status", ["success", "failure", "warning"]).default("success").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("audit_user_idx").on(table.userId),
  actionIdx: index("audit_action_idx").on(table.action),
  resourceIdx: index("audit_resource_idx").on(table.resourceType, table.resourceId),
  createdAtIdx: index("audit_created_idx").on(table.createdAt),
}));

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

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


// ============================================================================
// PARTNER SUBMISSIONS
// ============================================================================

export const partnerSubmissions = mysqlTable("partner_submissions", {
  id: int("id").autoincrement().primaryKey(),
  partnerId: int("partnerId").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  indicatorCode: varchar("indicatorCode", { length: 100 }),
  regimeTag: mysqlEnum("regimeTag", ["aden_irg", "sanaa_defacto", "mixed", "unknown"]),
  dataType: mysqlEnum("dataType", ["time_series", "geospatial", "document", "report"]).notNull(),
  fileKey: varchar("fileKey", { length: 255 }), // S3 key if file upload
  fileUrl: text("fileUrl"),
  rawData: json("rawData"), // JSON data if direct submission
  sourceDescription: text("sourceDescription").notNull(),
  methodology: text("methodology"),
  confidenceRating: mysqlEnum("confidenceRating", ["A", "B", "C", "D"]),
  status: mysqlEnum("status", ["pending", "under_review", "approved", "rejected", "needs_revision"]).default("pending").notNull(),
  reviewNotes: text("reviewNotes"),
  reviewedBy: int("reviewedBy").references(() => users.id),
  reviewedAt: timestamp("reviewedAt"),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  partnerIdx: index("partner_idx").on(table.partnerId),
  statusIdx: index("status_idx").on(table.status),
  submittedAtIdx: index("submitted_at_idx").on(table.submittedAt),
}));

export type PartnerSubmission = typeof partnerSubmissions.$inferSelect;
export type InsertPartnerSubmission = typeof partnerSubmissions.$inferInsert;

// ============================================================================
// SUBSCRIPTIONS & BILLING
// ============================================================================

export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  tier: mysqlEnum("tier", ["free", "professional", "enterprise"]).default("free").notNull(),
  status: mysqlEnum("status", ["active", "cancelled", "expired", "trial"]).default("active").notNull(),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate"),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  statusIdx: index("status_idx").on(table.status),
}));

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// ============================================================================
// API ACCESS LOGS
// ============================================================================

export const apiAccessLogs = mysqlTable("api_access_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  statusCode: int("statusCode"),
  responseTimeMs: int("responseTimeMs"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  requestedAt: timestamp("requestedAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  endpointIdx: index("endpoint_idx").on(table.endpoint),
  requestedAtIdx: index("requested_at_idx").on(table.requestedAt),
}));

export type ApiAccessLog = typeof apiAccessLogs.$inferSelect;
export type InsertApiAccessLog = typeof apiAccessLogs.$inferInsert;

// ============================================================================
// AI QUERY LOGS (for One Brain)
// ============================================================================

export const aiQueryLogs = mysqlTable("ai_query_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  query: text("query").notNull(),
  response: text("response"),
  confidenceLevel: mysqlEnum("confidenceLevel", ["high", "medium", "low"]),
  sourcesUsed: json("sourcesUsed").$type<number[]>(), // IDs of sources referenced
  indicatorsUsed: json("indicatorsUsed").$type<string[]>(), // Indicator codes referenced
  feedback: mysqlEnum("feedback", ["positive", "negative"]),
  feedbackNotes: text("feedbackNotes"),
  processingTimeMs: int("processingTimeMs"),
  queriedAt: timestamp("queriedAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  queriedAtIdx: index("queried_at_idx").on(table.queriedAt),
}));

export type AiQueryLog = typeof aiQueryLogs.$inferSelect;
export type InsertAiQueryLog = typeof aiQueryLogs.$inferInsert;

// ============================================================================
// SAVED REPORTS
// ============================================================================

export const savedReports = mysqlTable("saved_reports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  reportConfig: json("reportConfig").notNull(), // JSON config for report builder
  generatedFileKey: varchar("generatedFileKey", { length: 255 }), // S3 key if PDF generated
  generatedFileUrl: text("generatedFileUrl"),
  isPublic: boolean("isPublic").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  isPublicIdx: index("is_public_idx").on(table.isPublic),
}));

export type SavedReport = typeof savedReports.$inferSelect;
export type InsertSavedReport = typeof savedReports.$inferInsert;

// ============================================================================
// INDICATOR DEFINITIONS
// ============================================================================

export const indicators = mysqlTable("indicators", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 100 }).notNull().unique(), // e.g., "inflation_cpi_aden"
  nameEn: varchar("nameEn", { length: 255 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }).notNull(),
  descriptionEn: text("descriptionEn"),
  descriptionAr: text("descriptionAr"),
  unit: varchar("unit", { length: 50 }).notNull(),
  sector: varchar("sector", { length: 100 }).notNull(), // e.g., "banking", "trade", "prices"
  frequency: mysqlEnum("frequency", ["daily", "weekly", "monthly", "quarterly", "annual"]).notNull(),
  methodology: text("methodology"),
  primarySourceId: int("primarySourceId").references(() => sources.id),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  codeIdx: index("code_idx").on(table.code),
  sectorIdx: index("sector_idx").on(table.sector),
}));

export type Indicator = typeof indicators.$inferSelect;
export type InsertIndicator = typeof indicators.$inferInsert;

// ============================================================================
// EVENT-INDICATOR LINKS
// ============================================================================

export const eventIndicatorLinks = mysqlTable("event_indicator_links", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull().references(() => economicEvents.id),
  indicatorCode: varchar("indicatorCode", { length: 100 }).notNull(),
  impactDescription: text("impactDescription"),
  impactDirection: mysqlEnum("impactDirection", ["positive", "negative", "neutral", "mixed"]),
  lagDays: int("lagDays"), // How many days after event the impact was observed
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  eventIdx: index("event_idx").on(table.eventId),
  indicatorIdx: index("indicator_idx").on(table.indicatorCode),
}));

export type EventIndicatorLink = typeof eventIndicatorLinks.$inferSelect;
export type InsertEventIndicatorLink = typeof eventIndicatorLinks.$inferInsert;


// ============================================================================
// NOTIFICATION PREFERENCES
// ============================================================================

export const notificationPreferences = mysqlTable("notification_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  emailDailyDigest: boolean("emailDailyDigest").default(false).notNull(),
  emailWeeklyMonitor: boolean("emailWeeklyMonitor").default(true).notNull(),
  emailMonthlyBrief: boolean("emailMonthlyBrief").default(true).notNull(),
  emailSpecialReports: boolean("emailSpecialReports").default(true).notNull(),
  emailDataAlerts: boolean("emailDataAlerts").default(false).notNull(),
  emailCorrectionNotices: boolean("emailCorrectionNotices").default(true).notNull(),
  watchlistAlerts: boolean("watchlistAlerts").default(true).notNull(),
  preferredLanguage: mysqlEnum("preferredLanguage", ["en", "ar", "both"]).default("both").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
}));

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;

// ============================================================================
// EMAIL SUBSCRIPTIONS (for non-registered users)
// ============================================================================

export const emailSubscriptions = mysqlTable("email_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  nameEn: varchar("nameEn", { length: 255 }),
  nameAr: varchar("nameAr", { length: 255 }),
  organization: varchar("organization", { length: 255 }),
  subscribedToDaily: boolean("subscribedToDaily").default(false).notNull(),
  subscribedToWeekly: boolean("subscribedToWeekly").default(true).notNull(),
  subscribedToMonthly: boolean("subscribedToMonthly").default(true).notNull(),
  subscribedToSpecial: boolean("subscribedToSpecial").default(true).notNull(),
  preferredLanguage: mysqlEnum("preferredLanguage", ["en", "ar", "both"]).default("both").notNull(),
  isVerified: boolean("isVerified").default(false).notNull(),
  verificationToken: varchar("verificationToken", { length: 64 }),
  unsubscribeToken: varchar("unsubscribeToken", { length: 64 }).notNull(),
  subscribedAt: timestamp("subscribedAt").defaultNow().notNull(),
  verifiedAt: timestamp("verifiedAt"),
  lastEmailSentAt: timestamp("lastEmailSentAt"),
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
  verificationTokenIdx: index("verification_token_idx").on(table.verificationToken),
}));

export type EmailSubscription = typeof emailSubscriptions.$inferSelect;
export type InsertEmailSubscription = typeof emailSubscriptions.$inferInsert;

// ============================================================================
// USER WATCHLIST
// ============================================================================

export const userWatchlist = mysqlTable("user_watchlist", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  indicatorCode: varchar("indicatorCode", { length: 100 }).notNull(),
  alertThreshold: decimal("alertThreshold", { precision: 20, scale: 6 }),
  alertDirection: mysqlEnum("alertDirection", ["above", "below", "any_change"]).default("any_change").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  indicatorIdx: index("indicator_idx").on(table.indicatorCode),
}));

export type UserWatchlistItem = typeof userWatchlist.$inferSelect;
export type InsertUserWatchlistItem = typeof userWatchlist.$inferInsert;

// ============================================================================
// SAVED SEARCHES
// ============================================================================

export const savedSearches = mysqlTable("saved_searches", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  searchQuery: text("searchQuery").notNull(),
  filters: json("filters").$type<Record<string, any>>(),
  resultCount: int("resultCount"),
  lastRunAt: timestamp("lastRunAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
}));

export type SavedSearch = typeof savedSearches.$inferSelect;
export type InsertSavedSearch = typeof savedSearches.$inferInsert;

// ============================================================================
// PUBLICATION DRAFTS
// ============================================================================

export const publicationDrafts = mysqlTable("publication_drafts", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["daily_digest", "weekly_monitor", "monthly_brief", "special_report"]).notNull(),
  titleEn: varchar("titleEn", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }).notNull(),
  contentEn: text("contentEn").notNull(),
  contentAr: text("contentAr").notNull(),
  status: mysqlEnum("status", ["draft", "pending_review", "approved", "published", "archived"]).default("draft").notNull(),
  scheduledFor: timestamp("scheduledFor"),
  publishedAt: timestamp("publishedAt"),
  createdBy: int("createdBy").references(() => users.id),
  approvedBy: int("approvedBy").references(() => users.id),
  indicatorsIncluded: json("indicatorsIncluded").$type<string[]>(),
  eventsIncluded: json("eventsIncluded").$type<number[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  typeIdx: index("type_idx").on(table.type),
  statusIdx: index("status_idx").on(table.status),
  scheduledForIdx: index("scheduled_for_idx").on(table.scheduledFor),
}));

export type PublicationDraft = typeof publicationDrafts.$inferSelect;
export type InsertPublicationDraft = typeof publicationDrafts.$inferInsert;

// ============================================================================
// SENT EMAILS LOG
// ============================================================================

export const sentEmails = mysqlTable("sent_emails", {
  id: int("id").autoincrement().primaryKey(),
  recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
  recipientUserId: int("recipientUserId").references(() => users.id),
  emailType: mysqlEnum("emailType", ["daily_digest", "weekly_monitor", "monthly_brief", "special_report", "alert", "correction_notice"]).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  publicationDraftId: int("publicationDraftId").references(() => publicationDrafts.id),
  status: mysqlEnum("status", ["queued", "sent", "delivered", "bounced", "failed"]).default("queued").notNull(),
  externalId: varchar("externalId", { length: 255 }), // SendGrid/Mailchimp message ID
  sentAt: timestamp("sentAt"),
  deliveredAt: timestamp("deliveredAt"),
  openedAt: timestamp("openedAt"),
  clickedAt: timestamp("clickedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  recipientIdx: index("recipient_idx").on(table.recipientEmail),
  emailTypeIdx: index("email_type_idx").on(table.emailType),
  statusIdx: index("status_idx").on(table.status),
  sentAtIdx: index("sent_at_idx").on(table.sentAt),
}));

export type SentEmail = typeof sentEmails.$inferSelect;
export type InsertSentEmail = typeof sentEmails.$inferInsert;


// ============================================================================
// DATA GOVERNANCE - PROVENANCE LEDGER (Section 8)
// ============================================================================

export const provenanceLedgerFull = mysqlTable("provenance_ledger_full", {
  id: int("id").autoincrement().primaryKey(),
  
  // Data point reference
  sourceId: int("sourceId").notNull().references(() => sources.id),
  datasetId: int("datasetId").references(() => datasets.id),
  documentId: int("documentId").references(() => documents.id),
  seriesId: int("seriesId").references(() => timeSeries.id),
  
  // Access tracking
  accessMethod: mysqlEnum("accessMethod", ["api", "scrape", "manual", "partner_upload", "file_import"]).notNull(),
  retrievalTime: timestamp("retrievalTime").notNull(),
  retrievalDuration: int("retrievalDuration"), // milliseconds
  rawDataHash: varchar("rawDataHash", { length: 64 }).notNull(), // SHA-256
  rawDataLocation: text("rawDataLocation"), // S3 path
  
  // License and terms
  licenseType: varchar("licenseType", { length: 100 }).notNull(),
  licenseUrl: text("licenseUrl"),
  termsAccepted: boolean("termsAccepted").default(false).notNull(),
  attributionRequired: boolean("attributionRequired").default(true).notNull(),
  attributionText: text("attributionText"),
  commercialUseAllowed: boolean("commercialUseAllowed").default(false).notNull(),
  derivativesAllowed: boolean("derivativesAllowed").default(true).notNull(),
  
  // Transformations (JSON array)
  transformations: json("transformations").$type<{
    order: number;
    type: string;
    description: string;
    formula?: string;
    inputFields: string[];
    outputFields: string[];
    parameters?: Record<string, unknown>;
    timestamp: string;
    executedBy: string;
  }[]>(),
  
  // QA checks (JSON array)
  qaChecks: json("qaChecks").$type<{
    checkType: string;
    checkName: string;
    passed: boolean;
    severity: string;
    message: string;
    details?: Record<string, unknown>;
    timestamp: string;
  }[]>(),
  qaScore: int("qaScore").default(0).notNull(), // 0-100
  qaPassedAt: timestamp("qaPassedAt"),
  
  // Limitations and caveats (JSON arrays)
  limitations: json("limitations").$type<string[]>(),
  caveats: json("caveats").$type<string[]>(),
  knownIssues: json("knownIssues").$type<string[]>(),
  
  // Update cadence
  expectedUpdateFrequency: mysqlEnum("expectedUpdateFrequency", ["realtime", "daily", "weekly", "monthly", "quarterly", "annual", "irregular"]).notNull(),
  lastUpdated: timestamp("lastUpdated").notNull(),
  nextExpectedUpdate: timestamp("nextExpectedUpdate"),
  updateDelayDays: int("updateDelayDays"),
  
  // Metadata
  createdBy: varchar("createdBy", { length: 255 }).notNull(),
  version: int("version").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  sourceIdx: index("source_idx").on(table.sourceId),
  datasetIdx: index("dataset_idx").on(table.datasetId),
  seriesIdx: index("series_idx").on(table.seriesId),
  qaScoreIdx: index("qa_score_idx").on(table.qaScore),
  retrievalTimeIdx: index("retrieval_time_idx").on(table.retrievalTime),
}));

export type ProvenanceLedgerFull = typeof provenanceLedgerFull.$inferSelect;
export type InsertProvenanceLedgerFull = typeof provenanceLedgerFull.$inferInsert;

// ============================================================================
// DATA GOVERNANCE - CONFIDENCE RATINGS (Section 8B)
// ============================================================================

export const confidenceRatings = mysqlTable("confidence_ratings", {
  id: int("id").autoincrement().primaryKey(),
  dataPointId: int("dataPointId").notNull(),
  dataPointType: varchar("dataPointType", { length: 50 }).notNull(), // time_series, geospatial, document
  
  // Rating (A-D)
  rating: mysqlEnum("rating", ["A", "B", "C", "D"]).notNull(),
  
  // Rating criteria scores (0-100)
  sourceCredibility: int("sourceCredibility").notNull(), // Official, credible, proxy, disputed
  dataCompleteness: int("dataCompleteness").notNull(), // Full, partial, sparse
  timeliness: int("timeliness").notNull(), // Current, lagged, outdated
  consistency: int("consistency").notNull(), // Consistent, minor discrepancies, major issues
  methodology: int("methodology").notNull(), // Audited, documented, unclear, unknown
  
  // Explanation
  ratingJustification: text("ratingJustification").notNull(),
  
  // Warnings for D-rated data
  displayWarning: text("displayWarning"),
  
  // Audit trail
  ratedBy: varchar("ratedBy", { length: 255 }).notNull(),
  ratedAt: timestamp("ratedAt").defaultNow().notNull(),
  previousRating: mysqlEnum("previousRating", ["A", "B", "C", "D"]),
  ratingChangeReason: text("ratingChangeReason"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  dataPointIdx: index("data_point_idx").on(table.dataPointId, table.dataPointType),
  ratingIdx: index("rating_idx").on(table.rating),
}));

export type ConfidenceRating = typeof confidenceRatings.$inferSelect;
export type InsertConfidenceRating = typeof confidenceRatings.$inferInsert;

// ============================================================================
// DATA GOVERNANCE - CONTRADICTION DETECTOR (Section 8C)
// ============================================================================

export const dataContradictions = mysqlTable("data_contradictions", {
  id: int("id").autoincrement().primaryKey(),
  
  // Indicator and time reference
  indicatorCode: varchar("indicatorCode", { length: 100 }).notNull(),
  date: timestamp("date").notNull(),
  regimeTag: mysqlEnum("regimeTag", ["aden_irg", "sanaa_defacto", "mixed", "unknown"]).notNull(),
  
  // Conflicting values
  value1: decimal("value1", { precision: 20, scale: 6 }).notNull(),
  source1Id: int("source1Id").notNull().references(() => sources.id),
  value2: decimal("value2", { precision: 20, scale: 6 }).notNull(),
  source2Id: int("source2Id").notNull().references(() => sources.id),
  
  // Discrepancy analysis
  discrepancyPercent: decimal("discrepancyPercent", { precision: 10, scale: 2 }).notNull(),
  discrepancyType: mysqlEnum("discrepancyType", ["minor", "significant", "major", "critical"]).notNull(),
  
  // Explanation
  plausibleReasons: json("plausibleReasons").$type<string[]>(),
  resolutionNotes: text("resolutionNotes"),
  
  // Status
  status: mysqlEnum("status", ["detected", "investigating", "explained", "resolved"]).default("detected").notNull(),
  resolvedValue: decimal("resolvedValue", { precision: 20, scale: 6 }),
  resolvedSourceId: int("resolvedSourceId").references(() => sources.id),
  
  // Audit
  detectedAt: timestamp("detectedAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
  resolvedBy: int("resolvedBy").references(() => users.id),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  indicatorIdx: index("indicator_idx").on(table.indicatorCode),
  dateIdx: index("date_idx").on(table.date),
  statusIdx: index("status_idx").on(table.status),
}));

export type DataContradiction = typeof dataContradictions.$inferSelect;
export type InsertDataContradiction = typeof dataContradictions.$inferInsert;

// ============================================================================
// DATA GOVERNANCE - VERSIONING & VINTAGES (Section 8D)
// ============================================================================

export const dataVintages = mysqlTable("data_vintages", {
  id: int("id").autoincrement().primaryKey(),
  
  // Data point reference
  dataPointId: int("dataPointId").notNull(),
  dataPointType: varchar("dataPointType", { length: 50 }).notNull(),
  
  // Vintage information
  vintageDate: timestamp("vintageDate").notNull(), // "As of" date
  value: decimal("value", { precision: 20, scale: 6 }).notNull(),
  previousValue: decimal("previousValue", { precision: 20, scale: 6 }),
  
  // Change tracking
  changeType: mysqlEnum("changeType", ["initial", "revision", "correction", "restatement"]).notNull(),
  changeReason: text("changeReason"),
  changeMagnitude: decimal("changeMagnitude", { precision: 10, scale: 4 }), // Percent change
  
  // Metadata
  sourceId: int("sourceId").references(() => sources.id),
  confidenceRating: mysqlEnum("confidenceRating", ["A", "B", "C", "D"]),
  
  // Audit
  createdBy: varchar("createdBy", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  dataPointIdx: index("data_point_idx").on(table.dataPointId, table.dataPointType),
  vintageDateIdx: index("vintage_date_idx").on(table.vintageDate),
  changeTypeIdx: index("change_type_idx").on(table.changeType),
}));

export type DataVintage = typeof dataVintages.$inferSelect;
export type InsertDataVintage = typeof dataVintages.$inferInsert;

// ============================================================================
// DATA GOVERNANCE - PUBLIC CHANGELOG (Section 8E)
// ============================================================================

export const publicChangelog = mysqlTable("public_changelog", {
  id: int("id").autoincrement().primaryKey(),
  
  // Change type
  changeType: mysqlEnum("changeType", ["dataset_added", "dataset_updated", "document_added", "methodology_change", "correction", "source_added", "indicator_added"]).notNull(),
  
  // Affected items
  affectedDatasetIds: json("affectedDatasetIds").$type<number[]>(),
  affectedIndicatorCodes: json("affectedIndicatorCodes").$type<string[]>(),
  affectedDocumentIds: json("affectedDocumentIds").$type<number[]>(),
  
  // Description (bilingual)
  titleEn: varchar("titleEn", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }).notNull(),
  descriptionEn: text("descriptionEn").notNull(),
  descriptionAr: text("descriptionAr").notNull(),
  
  // Impact assessment
  impactLevel: mysqlEnum("impactLevel", ["low", "medium", "high"]).notNull(),
  affectedDateRange: json("affectedDateRange").$type<{ start: string; end: string }>(),
  
  // Visibility
  isPublic: boolean("isPublic").default(true).notNull(),
  
  // Audit
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
  publishedBy: int("publishedBy").references(() => users.id),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  changeTypeIdx: index("change_type_idx").on(table.changeType),
  publishedAtIdx: index("published_at_idx").on(table.publishedAt),
  isPublicIdx: index("is_public_idx").on(table.isPublic),
}));

export type PublicChangelogEntry = typeof publicChangelog.$inferSelect;
export type InsertPublicChangelogEntry = typeof publicChangelog.$inferInsert;


// ============================================================================
// SIGNAL ALERTS
// ============================================================================

export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  type: varchar("type", { length: 50 }).notNull(), // 'info', 'warning', 'critical'
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }),
  description: text("description"),
  indicatorCode: varchar("indicatorCode", { length: 100 }),
  severity: varchar("severity", { length: 20 }).default("info").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  acknowledgedBy: int("acknowledgedBy").references(() => users.id),
  acknowledgedAt: timestamp("acknowledgedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  typeIdx: index("type_idx").on(table.type),
  severityIdx: index("severity_idx").on(table.severity),
  isReadIdx: index("is_read_idx").on(table.isRead),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

// ============================================================================
// SCHEDULER JOBS
// ============================================================================

export const schedulerJobs = mysqlTable("scheduler_jobs", {
  id: int("id").autoincrement().primaryKey(),
  jobName: varchar("jobName", { length: 100 }).notNull().unique(),
  jobType: mysqlEnum("jobType", ["data_refresh", "signal_detection", "publication", "backup", "cleanup"]).notNull(),
  cronExpression: varchar("cronExpression", { length: 50 }).notNull(),
  isEnabled: boolean("isEnabled").default(true).notNull(),
  lastRunAt: timestamp("lastRunAt"),
  lastRunStatus: mysqlEnum("lastRunStatus", ["success", "failed", "running", "skipped"]),
  lastRunDuration: int("lastRunDuration"), // milliseconds
  lastRunError: text("lastRunError"),
  nextRunAt: timestamp("nextRunAt"),
  runCount: int("runCount").default(0).notNull(),
  failCount: int("failCount").default(0).notNull(),
  config: json("config").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  jobNameIdx: index("job_name_idx").on(table.jobName),
  jobTypeIdx: index("job_type_idx").on(table.jobType),
  nextRunAtIdx: index("next_run_at_idx").on(table.nextRunAt),
}));

export type SchedulerJob = typeof schedulerJobs.$inferSelect;
export type InsertSchedulerJob = typeof schedulerJobs.$inferInsert;

// ============================================================================
// SCHEDULER RUN HISTORY
// ============================================================================

export const schedulerRunHistory = mysqlTable("scheduler_run_history", {
  id: int("id").autoincrement().primaryKey(),
  jobId: int("jobId").notNull().references(() => schedulerJobs.id),
  jobName: varchar("jobName", { length: 100 }).notNull(),
  status: mysqlEnum("status", ["success", "failed", "running", "skipped"]).notNull(),
  startedAt: timestamp("startedAt").notNull(),
  completedAt: timestamp("completedAt"),
  duration: int("duration"), // milliseconds
  recordsProcessed: int("recordsProcessed").default(0).notNull(),
  errorMessage: text("errorMessage"),
  details: json("details").$type<Record<string, unknown>>(),
}, (table) => ({
  jobIdIdx: index("job_id_idx").on(table.jobId),
  statusIdx: index("status_idx").on(table.status),
  startedAtIdx: index("started_at_idx").on(table.startedAt),
}));

export type SchedulerRunHistory = typeof schedulerRunHistory.$inferSelect;
export type InsertSchedulerRunHistory = typeof schedulerRunHistory.$inferInsert;


// ============================================================================
// RESEARCH PORTAL - ENHANCED SCHEMA
// ============================================================================

// Research Authors
export const researchAuthors = mysqlTable("research_authors", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }),
  affiliation: varchar("affiliation", { length: 255 }),
  affiliationAr: varchar("affiliationAr", { length: 255 }),
  orcid: varchar("orcid", { length: 50 }), // ORCID identifier
  email: varchar("email", { length: 320 }),
  bio: text("bio"),
  bioAr: text("bioAr"),
  profileUrl: text("profileUrl"),
  publicationCount: int("publicationCount").default(0).notNull(),
  citationCount: int("citationCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  nameIdx: index("name_idx").on(table.name),
  affiliationIdx: index("affiliation_idx").on(table.affiliation),
}));

export type ResearchAuthor = typeof researchAuthors.$inferSelect;
export type InsertResearchAuthor = typeof researchAuthors.$inferInsert;

// Research Organizations
export const researchOrganizations = mysqlTable("research_organizations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }),
  acronym: varchar("acronym", { length: 50 }),
  type: mysqlEnum("type", [
    "ifi", // International Financial Institution
    "un_agency",
    "bilateral_donor",
    "gulf_fund",
    "think_tank",
    "academic",
    "government",
    "central_bank",
    "ngo",
    "private_sector",
    "other"
  ]).notNull(),
  country: varchar("country", { length: 100 }),
  website: text("website"),
  logoUrl: text("logoUrl"),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  publicationCount: int("publicationCount").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  nameIdx: index("name_idx").on(table.name),
  typeIdx: index("type_idx").on(table.type),
  acronymIdx: index("acronym_idx").on(table.acronym),
}));

export type ResearchOrganization = typeof researchOrganizations.$inferSelect;
export type InsertResearchOrganization = typeof researchOrganizations.$inferInsert;

// Enhanced Research Publications (extends documents concept)
export const researchPublications = mysqlTable("research_publications", {
  id: int("id").autoincrement().primaryKey(),
  
  // Basic Info
  title: varchar("title", { length: 500 }).notNull(),
  titleAr: varchar("titleAr", { length: 500 }),
  abstract: text("abstract"),
  abstractAr: text("abstractAr"),
  
  // Publication Details
  publicationType: mysqlEnum("publicationType", [
    "research_paper",
    "working_paper",
    "policy_brief",
    "technical_note",
    "case_study",
    "statistical_bulletin",
    "sanctions_notice",
    "presentation",
    "evaluation_report",
    "journal_article",
    "book_chapter",
    "thesis",
    "dataset_documentation",
    "methodology_note",
    "survey_report",
    "market_bulletin",
    "economic_monitor",
    "article_iv",
    "country_report"
  ]).notNull(),
  
  // Research Category
  researchCategory: mysqlEnum("researchCategory", [
    "macroeconomic_analysis",
    "banking_sector",
    "monetary_policy",
    "fiscal_policy",
    "trade_external",
    "poverty_development",
    "conflict_economics",
    "humanitarian_finance",
    "split_system_analysis",
    "labor_market",
    "food_security",
    "energy_sector",
    "infrastructure",
    "agriculture",
    "health_sector",
    "education",
    "governance",
    "sanctions_compliance"
  ]).notNull(),
  
  // Data Category
  dataCategory: mysqlEnum("dataCategory", [
    "economic_growth",
    "inflation",
    "employment",
    "fiscal_policy",
    "monetary_policy",
    "trade_investment",
    "social_indicators",
    "humanitarian_aid",
    "exchange_rates",
    "banking_finance",
    "public_debt",
    "remittances",
    "commodity_prices"
  ]),
  
  // Data Type
  dataType: mysqlEnum("dataType", [
    "time_series",
    "survey",
    "spatial",
    "qualitative",
    "cross_sectional",
    "panel",
    "mixed_methods"
  ]),
  
  // Geographic Scope
  geographicScope: mysqlEnum("geographicScope", [
    "national",
    "governorate",
    "district",
    "regional_comparison",
    "international_comparison"
  ]).default("national"),
  
  // Time Coverage
  publicationDate: timestamp("publicationDate"),
  publicationYear: int("publicationYear").notNull(),
  publicationMonth: int("publicationMonth"),
  publicationQuarter: int("publicationQuarter"),
  timeCoverageStart: int("timeCoverageStart"), // Year
  timeCoverageEnd: int("timeCoverageEnd"), // Year
  
  // Source Organization
  organizationId: int("organizationId").references(() => researchOrganizations.id),
  externalId: varchar("externalId", { length: 255 }), // External system ID
  
  // File Info
  fileKey: varchar("fileKey", { length: 255 }),
  fileUrl: text("fileUrl"),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"),
  
  // External Links
  sourceUrl: text("sourceUrl"), // Original publication URL
  doi: varchar("doi", { length: 255 }), // Digital Object Identifier
  isbn: varchar("isbn", { length: 50 }),
  issn: varchar("issn", { length: 50 }),
  
  // Language
  language: mysqlEnum("language", ["en", "ar", "fr", "other"]).default("en"),
  hasArabicVersion: boolean("hasArabicVersion").default(false),
  
  // Quality Indicators
  isPeerReviewed: boolean("isPeerReviewed").default(false),
  hasDataset: boolean("hasDataset").default(false),
  linkedDatasetIds: json("linkedDatasetIds").$type<number[]>(),
  
  // Engagement Metrics
  downloadCount: int("downloadCount").default(0).notNull(),
  viewCount: int("viewCount").default(0).notNull(),
  citationCount: int("citationCount").default(0).notNull(),
  altmetricScore: decimal("altmetricScore", { precision: 10, scale: 2 }),
  
  // Tags and Keywords
  keywords: json("keywords").$type<string[]>(),
  keywordsAr: json("keywordsAr").$type<string[]>(),
  tags: json("tags").$type<string[]>(),
  
  // Citation Info
  citationText: text("citationText"),
  bibtex: text("bibtex"),
  
  // Status
  status: mysqlEnum("status", ["draft", "pending_review", "published", "archived"]).default("published").notNull(),
  isFeatured: boolean("isFeatured").default(false),
  isRecurring: boolean("isRecurring").default(false), // e.g., monthly bulletin
  recurringFrequency: varchar("recurringFrequency", { length: 50 }), // "monthly", "quarterly", "annual"
  
  // Audit
  uploaderId: int("uploaderId").references(() => users.id),
  reviewerId: int("reviewerId").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  titleIdx: index("title_idx").on(table.title),
  publicationTypeIdx: index("publication_type_idx").on(table.publicationType),
  researchCategoryIdx: index("research_category_idx").on(table.researchCategory),
  publicationYearIdx: index("publication_year_idx").on(table.publicationYear),
  organizationIdx: index("organization_idx").on(table.organizationId),
  statusIdx: index("status_idx").on(table.status),
  isPeerReviewedIdx: index("is_peer_reviewed_idx").on(table.isPeerReviewed),
  hasDatasetIdx: index("has_dataset_idx").on(table.hasDataset),
  languageIdx: index("language_idx").on(table.language),
}));

export type ResearchPublication = typeof researchPublications.$inferSelect;
export type InsertResearchPublication = typeof researchPublications.$inferInsert;

// Publication-Author Junction
export const publicationAuthors = mysqlTable("publication_authors", {
  id: int("id").autoincrement().primaryKey(),
  publicationId: int("publicationId").notNull().references(() => researchPublications.id),
  authorId: int("authorId").notNull().references(() => researchAuthors.id),
  authorOrder: int("authorOrder").default(1).notNull(),
  isCorresponding: boolean("isCorresponding").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  publicationIdx: index("publication_idx").on(table.publicationId),
  authorIdx: index("author_idx").on(table.authorId),
}));

export type PublicationAuthor = typeof publicationAuthors.$inferSelect;
export type InsertPublicationAuthor = typeof publicationAuthors.$inferInsert;

// User Reading Lists
export const userReadingLists = mysqlTable("user_reading_lists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isPublic: boolean("isPublic").default(false),
  itemCount: int("itemCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
}));

export type UserReadingList = typeof userReadingLists.$inferSelect;
export type InsertUserReadingList = typeof userReadingLists.$inferInsert;

// Reading List Items
export const readingListItems = mysqlTable("reading_list_items", {
  id: int("id").autoincrement().primaryKey(),
  readingListId: int("readingListId").notNull().references(() => userReadingLists.id),
  publicationId: int("publicationId").notNull().references(() => researchPublications.id),
  notes: text("notes"),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
}, (table) => ({
  readingListIdx: index("reading_list_idx").on(table.readingListId),
  publicationIdx: index("publication_idx").on(table.publicationId),
}));

export type ReadingListItem = typeof readingListItems.$inferSelect;
export type InsertReadingListItem = typeof readingListItems.$inferInsert;

// User Bookmarks
export const userBookmarks = mysqlTable("user_bookmarks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  publicationId: int("publicationId").notNull().references(() => researchPublications.id),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  publicationIdx: index("publication_idx").on(table.publicationId),
  uniqueBookmark: index("unique_bookmark").on(table.userId, table.publicationId),
}));

export type UserBookmark = typeof userBookmarks.$inferSelect;
export type InsertUserBookmark = typeof userBookmarks.$inferInsert;

// Topic Alerts
export const topicAlerts = mysqlTable("topic_alerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  keywords: json("keywords").$type<string[]>().notNull(),
  categories: json("categories").$type<string[]>(),
  organizations: json("organizations").$type<number[]>(),
  frequency: mysqlEnum("frequency", ["immediate", "daily", "weekly"]).default("daily").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  lastTriggeredAt: timestamp("lastTriggeredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  isActiveIdx: index("is_active_idx").on(table.isActive),
}));

export type TopicAlert = typeof topicAlerts.$inferSelect;
export type InsertTopicAlert = typeof topicAlerts.$inferInsert;

// Research Completeness Audit
export const researchCompletenessAudit = mysqlTable("research_completeness_audit", {
  id: int("id").autoincrement().primaryKey(),
  year: int("year").notNull(),
  organizationId: int("organizationId").references(() => researchOrganizations.id),
  expectedPublicationType: varchar("expectedPublicationType", { length: 100 }).notNull(),
  expectedTitle: varchar("expectedTitle", { length: 500 }),
  isFound: boolean("isFound").default(false).notNull(),
  publicationId: int("publicationId").references(() => researchPublications.id),
  notes: text("notes"),
  lastCheckedAt: timestamp("lastCheckedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  yearIdx: index("year_idx").on(table.year),
  organizationIdx: index("organization_idx").on(table.organizationId),
  isFoundIdx: index("is_found_idx").on(table.isFound),
}));

export type ResearchCompletenessAudit = typeof researchCompletenessAudit.$inferSelect;
export type InsertResearchCompletenessAudit = typeof researchCompletenessAudit.$inferInsert;

// Research Ingestion Sources
export const researchIngestionSources = mysqlTable("research_ingestion_sources", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  organizationId: int("organizationId").references(() => researchOrganizations.id),
  sourceType: mysqlEnum("sourceType", ["api", "rss", "scrape", "oai_pmh", "manual"]).notNull(),
  endpoint: text("endpoint"),
  apiKey: varchar("apiKey", { length: 255 }),
  config: json("config").$type<Record<string, unknown>>(),
  isActive: boolean("isActive").default(true).notNull(),
  lastFetchAt: timestamp("lastFetchAt"),
  lastFetchStatus: mysqlEnum("lastFetchStatus", ["success", "failed", "partial"]),
  lastFetchCount: int("lastFetchCount"),
  totalIngested: int("totalIngested").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  nameIdx: index("name_idx").on(table.name),
  sourceTypeIdx: index("source_type_idx").on(table.sourceType),
  isActiveIdx: index("is_active_idx").on(table.isActive),
}));

export type ResearchIngestionSource = typeof researchIngestionSources.$inferSelect;
export type InsertResearchIngestionSource = typeof researchIngestionSources.$inferInsert;


// ============================================================================
// WEBHOOKS & NOTIFICATIONS
// ============================================================================

export const webhooks = mysqlTable("webhooks", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["slack", "discord", "email", "custom"]).notNull(),
  url: text("url").notNull(), // Webhook URL or email address
  enabled: boolean("enabled").default(true).notNull(),
  events: json("events").$type<string[]>().notNull(), // Array of event types to subscribe to
  headers: json("headers").$type<Record<string, string>>(), // Custom headers for HTTP webhooks
  lastTriggered: timestamp("lastTriggered"),
  failureCount: int("failureCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy").references(() => users.id),
}, (table) => ({
  typeIdx: index("type_idx").on(table.type),
  enabledIdx: index("enabled_idx").on(table.enabled),
}));

export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = typeof webhooks.$inferInsert;

export const webhookEventTypes = mysqlTable("webhook_event_types", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["alerts", "data", "system", "publications"]).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
});

export type WebhookEventType = typeof webhookEventTypes.$inferSelect;
export type InsertWebhookEventType = typeof webhookEventTypes.$inferInsert;

export const webhookDeliveryLogs = mysqlTable("webhook_delivery_logs", {
  id: int("id").autoincrement().primaryKey(),
  webhookId: int("webhookId").notNull().references(() => webhooks.id),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  payload: json("payload").$type<Record<string, unknown>>().notNull(),
  responseStatus: int("responseStatus"),
  responseBody: text("responseBody"),
  success: boolean("success").notNull(),
  errorMessage: text("errorMessage"),
  deliveredAt: timestamp("deliveredAt").defaultNow().notNull(),
  duration: int("duration"), // milliseconds
}, (table) => ({
  webhookIdx: index("webhook_idx").on(table.webhookId),
  eventTypeIdx: index("event_type_idx").on(table.eventType),
  deliveredAtIdx: index("delivered_at_idx").on(table.deliveredAt),
}));

export type WebhookDeliveryLog = typeof webhookDeliveryLogs.$inferSelect;
export type InsertWebhookDeliveryLog = typeof webhookDeliveryLogs.$inferInsert;

// ============================================================================
// CONNECTOR THRESHOLDS
// ============================================================================

export const connectorThresholds = mysqlTable("connector_thresholds", {
  id: int("id").autoincrement().primaryKey(),
  connectorCode: varchar("connectorCode", { length: 100 }).notNull().unique(),
  warningDays: int("warningDays").default(7).notNull(),
  criticalDays: int("criticalDays").default(14).notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updatedBy").references(() => users.id),
});

export type ConnectorThreshold = typeof connectorThresholds.$inferSelect;
export type InsertConnectorThreshold = typeof connectorThresholds.$inferInsert;

// ============================================================================
// EMAIL NOTIFICATIONS
// ============================================================================

export const emailNotificationQueue = mysqlTable("email_notification_queue", {
  id: int("id").autoincrement().primaryKey(),
  recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
  recipientName: varchar("recipientName", { length: 255 }),
  subject: varchar("subject", { length: 500 }).notNull(),
  htmlBody: text("htmlBody").notNull(),
  textBody: text("textBody"),
  priority: mysqlEnum("priority", ["low", "normal", "high", "critical"]).default("normal").notNull(),
  status: mysqlEnum("status", ["pending", "sending", "sent", "failed"]).default("pending").notNull(),
  attempts: int("attempts").default(0).notNull(),
  lastAttempt: timestamp("lastAttempt"),
  sentAt: timestamp("sentAt"),
  errorMessage: text("errorMessage"),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  statusIdx: index("status_idx").on(table.status),
  priorityIdx: index("priority_idx").on(table.priority),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type EmailNotification = typeof emailNotificationQueue.$inferSelect;
export type InsertEmailNotification = typeof emailNotificationQueue.$inferInsert;


// ============================================================================
// BANKING SECTOR - COMMERCIAL BANKS
// ============================================================================

export const commercialBanks = mysqlTable("commercial_banks", {
  id: int("id").autoincrement().primaryKey(),
  
  // Basic Info
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }),
  acronym: varchar("acronym", { length: 50 }),
  swiftCode: varchar("swiftCode", { length: 20 }),
  licenseNumber: varchar("licenseNumber", { length: 100 }),
  
  // Classification
  bankType: mysqlEnum("bankType", ["commercial", "islamic", "specialized", "microfinance"]).notNull(),
  jurisdiction: mysqlEnum("jurisdiction", ["aden", "sanaa", "both"]).notNull(),
  ownership: mysqlEnum("ownership", ["state", "private", "mixed", "foreign"]).default("private").notNull(),
  
  // Status
  operationalStatus: mysqlEnum("operationalStatus", ["operational", "limited", "distressed", "suspended", "liquidation"]).default("operational").notNull(),
  sanctionsStatus: mysqlEnum("sanctionsStatus", ["none", "ofac", "un", "eu", "multiple"]).default("none").notNull(),
  
  // Financial Metrics (latest available)
  totalAssets: decimal("totalAssets", { precision: 20, scale: 2 }), // in USD millions
  capitalAdequacyRatio: decimal("capitalAdequacyRatio", { precision: 5, scale: 2 }), // percentage
  nonPerformingLoans: decimal("nonPerformingLoans", { precision: 5, scale: 2 }), // percentage
  liquidityRatio: decimal("liquidityRatio", { precision: 5, scale: 2 }), // percentage
  returnOnAssets: decimal("returnOnAssets", { precision: 5, scale: 2 }), // percentage
  returnOnEquity: decimal("returnOnEquity", { precision: 5, scale: 2 }), // percentage
  branchCount: int("branchCount"),
  employeeCount: int("employeeCount"),
  
  // Data Quality
  metricsAsOf: timestamp("metricsAsOf"), // Date of financial metrics
  confidenceRating: mysqlEnum("confidenceRating", ["A", "B", "C", "D"]).default("C").notNull(),
  sourceId: int("sourceId").references(() => sources.id),
  
  // Contact & Details
  headquarters: varchar("headquarters", { length: 255 }),
  website: text("website"),
  logoUrl: text("logoUrl"),
  foundedYear: int("foundedYear"),
  notes: text("notes"),
  
  // Metadata
  isUnderWatch: boolean("isUnderWatch").default(false).notNull(),
  watchReason: text("watchReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  nameIdx: index("bank_name_idx").on(table.name),
  jurisdictionIdx: index("bank_jurisdiction_idx").on(table.jurisdiction),
  bankTypeIdx: index("bank_type_idx").on(table.bankType),
  statusIdx: index("bank_status_idx").on(table.operationalStatus),
  sanctionsIdx: index("bank_sanctions_idx").on(table.sanctionsStatus),
}));

export type CommercialBank = typeof commercialBanks.$inferSelect;
export type InsertCommercialBank = typeof commercialBanks.$inferInsert;

// ============================================================================
// BANKING SECTOR - CBY DIRECTIVES
// ============================================================================

export const cbyDirectives = mysqlTable("cby_directives", {
  id: int("id").autoincrement().primaryKey(),
  
  // Basic Info
  directiveNumber: varchar("directiveNumber", { length: 100 }).notNull(), // e.g., "Circular No. 54/2021"
  title: varchar("title", { length: 500 }).notNull(),
  titleAr: varchar("titleAr", { length: 500 }),
  
  // Classification
  directiveType: mysqlEnum("directiveType", [
    "circular",
    "regulation",
    "law",
    "decree",
    "instruction",
    "guideline",
    "notice",
    "amendment"
  ]).notNull(),
  category: varchar("category", { length: 100 }), // e.g., "exchange_rate", "compliance", "licensing"
  
  // Issuing Authority
  issuingAuthority: mysqlEnum("issuingAuthority", ["cby_aden", "cby_sanaa", "government", "parliament"]).notNull(),
  issueDate: timestamp("issueDate").notNull(),
  effectiveDate: timestamp("effectiveDate"),
  expiryDate: timestamp("expiryDate"),
  
  // Content
  summary: text("summary"),
  summaryAr: text("summaryAr"),
  fullTextUrl: text("fullTextUrl"), // Link to PDF
  pdfFileKey: varchar("pdfFileKey", { length: 255 }), // S3 key
  
  // Status
  status: mysqlEnum("status", ["active", "superseded", "expired", "draft"]).default("active").notNull(),
  supersededBy: int("supersededBy"), // FK to another directive
  
  // Impact
  affectedEntities: json("affectedEntities").$type<string[]>(), // e.g., ["banks", "exchange_companies"]
  impactLevel: mysqlEnum("impactLevel", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  
  // Metadata
  sourceId: int("sourceId").references(() => sources.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  directiveNumberIdx: index("directive_number_idx").on(table.directiveNumber),
  typeIdx: index("directive_type_idx").on(table.directiveType),
  authorityIdx: index("issuing_authority_idx").on(table.issuingAuthority),
  issueDateIdx: index("issue_date_idx").on(table.issueDate),
  statusIdx: index("directive_status_idx").on(table.status),
  categoryIdx: index("directive_category_idx").on(table.category),
}));

export type CbyDirective = typeof cbyDirectives.$inferSelect;
export type InsertCbyDirective = typeof cbyDirectives.$inferInsert;

// ============================================================================
// BANKING SECTOR - AGGREGATE METRICS
// ============================================================================

export const bankingSectorMetrics = mysqlTable("banking_sector_metrics", {
  id: int("id").autoincrement().primaryKey(),
  
  // Time & Scope
  date: timestamp("date").notNull(),
  jurisdiction: mysqlEnum("jurisdiction", ["aden", "sanaa", "national"]).notNull(),
  
  // Aggregate Metrics
  totalBanks: int("totalBanks"),
  totalAssets: decimal("totalAssets", { precision: 20, scale: 2 }), // USD millions
  totalDeposits: decimal("totalDeposits", { precision: 20, scale: 2 }),
  totalLoans: decimal("totalLoans", { precision: 20, scale: 2 }),
  loanToDepositRatio: decimal("loanToDepositRatio", { precision: 5, scale: 2 }),
  averageCAR: decimal("averageCAR", { precision: 5, scale: 2 }),
  averageNPL: decimal("averageNPL", { precision: 5, scale: 2 }),
  
  // Reserves
  foreignReserves: decimal("foreignReserves", { precision: 20, scale: 2 }), // USD millions
  
  // Data Quality
  confidenceRating: mysqlEnum("confidenceRating", ["A", "B", "C", "D"]).default("C").notNull(),
  sourceId: int("sourceId").references(() => sources.id),
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  dateIdx: index("sector_date_idx").on(table.date),
  jurisdictionIdx: index("sector_jurisdiction_idx").on(table.jurisdiction),
  dateJurisdictionUnique: unique("date_jurisdiction_unique").on(table.date, table.jurisdiction),
}));

export type BankingSectorMetric = typeof bankingSectorMetrics.$inferSelect;
export type InsertBankingSectorMetric = typeof bankingSectorMetrics.$inferInsert;

// ============================================================================
// EXECUTIVE PROFILES (Governor, Deputy Governor, etc.)
// ============================================================================

export const executiveProfiles = mysqlTable("executive_profiles", {
  id: int("id").autoincrement().primaryKey(),
  
  // Basic Info
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }),
  
  // Position
  institution: varchar("institution", { length: 255 }).notNull(), // e.g., "Central Bank of Yemen - Aden"
  institutionAr: varchar("institutionAr", { length: 255 }),
  position: mysqlEnum("position", [
    "governor",
    "deputy_governor",
    "board_member",
    "director",
    "minister",
    "deputy_minister",
    "advisor"
  ]).notNull(),
  department: varchar("department", { length: 255 }), // e.g., "Bank Supervision"
  
  // Tenure
  appointmentDate: timestamp("appointmentDate"),
  endDate: timestamp("endDate"),
  isActive: boolean("isActive").default(true).notNull(),
  
  // Profile
  photoUrl: text("photoUrl"),
  biography: text("biography"),
  biographyAr: text("biographyAr"),
  education: json("education").$type<Array<{degree: string, institution: string, year?: number}>>(),
  previousPositions: json("previousPositions").$type<Array<{title: string, institution: string, startYear?: number, endYear?: number}>>(),
  
  // Focus Areas
  policyFocus: json("policyFocus").$type<string[]>(), // e.g., ["monetary_policy", "financial_stability"]
  keyInitiatives: json("keyInitiatives").$type<Array<{title: string, description: string, status: string}>>(),
  
  // Contact
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  
  // Metadata
  sourceId: int("sourceId").references(() => sources.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  nameIdx: index("exec_name_idx").on(table.name),
  institutionIdx: index("exec_institution_idx").on(table.institution),
  positionIdx: index("exec_position_idx").on(table.position),
  isActiveIdx: index("exec_is_active_idx").on(table.isActive),
}));

export type ExecutiveProfile = typeof executiveProfiles.$inferSelect;
export type InsertExecutiveProfile = typeof executiveProfiles.$inferInsert;

// ============================================================================
// EXECUTIVE DASHBOARD WIDGETS (Customizable)
// ============================================================================

export const executiveDashboardWidgets = mysqlTable("executive_dashboard_widgets", {
  id: int("id").autoincrement().primaryKey(),
  executiveId: int("executiveId").notNull().references(() => executiveProfiles.id),
  
  // Widget Config
  widgetType: mysqlEnum("widgetType", [
    "kpi_card",
    "chart",
    "table",
    "alert_feed",
    "news_feed",
    "calendar",
    "report_generator",
    "ai_assistant",
    "quick_actions"
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }),
  
  // Layout
  gridColumn: int("gridColumn").default(1).notNull(),
  gridRow: int("gridRow").default(1).notNull(),
  gridWidth: int("gridWidth").default(1).notNull(),
  gridHeight: int("gridHeight").default(1).notNull(),
  
  // Data Config
  dataSource: varchar("dataSource", { length: 255 }), // e.g., "banking_sector_metrics"
  filters: json("filters").$type<Record<string, unknown>>(),
  refreshInterval: int("refreshInterval").default(300), // seconds
  
  // Display
  isVisible: boolean("isVisible").default(true).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  executiveIdx: index("widget_executive_idx").on(table.executiveId),
  typeIdx: index("widget_type_idx").on(table.widgetType),
}));

export type ExecutiveDashboardWidget = typeof executiveDashboardWidgets.$inferSelect;
export type InsertExecutiveDashboardWidget = typeof executiveDashboardWidgets.$inferInsert;

// ============================================================================
// PARTNER ORGANIZATIONS (for Contribution Portal)
// ============================================================================

export const partnerOrganizations = mysqlTable("partner_organizations", {
  id: int("id").autoincrement().primaryKey(),
  
  // Basic Info
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }),
  acronym: varchar("acronym", { length: 50 }),
  
  // Type & Status
  organizationType: mysqlEnum("organizationType", [
    "central_bank",
    "commercial_bank",
    "ministry",
    "statistical_office",
    "international_org",
    "research_institution",
    "ngo",
    "other"
  ]).notNull(),
  partnershipStatus: mysqlEnum("partnershipStatus", ["active", "pending", "suspended", "expired"]).default("pending").notNull(),
  partnershipStartDate: timestamp("partnershipStartDate"),
  partnershipEndDate: timestamp("partnershipEndDate"),
  
  // Contact
  primaryContactName: varchar("primaryContactName", { length: 255 }),
  primaryContactEmail: varchar("primaryContactEmail", { length: 320 }),
  primaryContactPhone: varchar("primaryContactPhone", { length: 50 }),
  
  // Contribution Stats
  totalContributions: int("totalContributions").default(0).notNull(),
  publishedContributions: int("publishedContributions").default(0).notNull(),
  pendingContributions: int("pendingContributions").default(0).notNull(),
  rejectedContributions: int("rejectedContributions").default(0).notNull(),
  
  // Agreement
  agreementFileKey: varchar("agreementFileKey", { length: 255 }),
  agreementFileUrl: text("agreementFileUrl"),
  dataCategories: json("dataCategories").$type<string[]>(), // Types of data they can submit
  
  // Metadata
  logoUrl: text("logoUrl"),
  website: text("website"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  nameIdx: index("partner_org_name_idx").on(table.name),
  typeIdx: index("partner_org_type_idx").on(table.organizationType),
  statusIdx: index("partner_org_status_idx").on(table.partnershipStatus),
}));

export type PartnerOrganization = typeof partnerOrganizations.$inferSelect;
export type InsertPartnerOrganization = typeof partnerOrganizations.$inferInsert;

// ============================================================================
// PARTNER CONTRIBUTION SUBMISSIONS (Enhanced)
// ============================================================================

export const partnerContributions = mysqlTable("partner_contributions", {
  id: int("id").autoincrement().primaryKey(),
  
  // Submitter
  organizationId: int("organizationId").notNull().references(() => partnerOrganizations.id),
  submittedByUserId: int("submittedByUserId").notNull().references(() => users.id),
  
  // Contribution Details
  title: varchar("title", { length: 500 }).notNull(),
  titleAr: varchar("titleAr", { length: 500 }),
  description: text("description"),
  
  // Data Classification
  dataCategory: mysqlEnum("dataCategory", [
    "exchange_rates",
    "monetary_reserves",
    "banking_statistics",
    "fiscal_data",
    "trade_data",
    "price_indices",
    "employment_data",
    "sector_reports",
    "regulatory_updates",
    "other"
  ]).notNull(),
  timePeriod: varchar("timePeriod", { length: 100 }), // e.g., "Q3 2024", "November 2024"
  
  // File Info
  fileType: mysqlEnum("fileType", ["excel", "csv", "pdf", "api", "json", "other"]).notNull(),
  fileKey: varchar("fileKey", { length: 255 }),
  fileUrl: text("fileUrl"),
  fileName: varchar("fileName", { length: 255 }),
  fileSize: int("fileSize"),
  
  // Review Status
  status: mysqlEnum("status", [
    "draft",
    "submitted",
    "under_review",
    "clarification_needed",
    "approved",
    "published",
    "rejected"
  ]).default("draft").notNull(),
  
  // Review Process
  reviewedByUserId: int("reviewedByUserId").references(() => users.id),
  reviewedAt: timestamp("reviewedAt"),
  reviewNotes: text("reviewNotes"),
  rejectionReason: text("rejectionReason"),
  
  // Publishing
  publishedAt: timestamp("publishedAt"),
  publishedDatasetId: int("publishedDatasetId").references(() => datasets.id),
  
  // Metadata
  submittedAt: timestamp("submittedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  organizationIdx: index("contribution_org_idx").on(table.organizationId),
  submitterIdx: index("contribution_submitter_idx").on(table.submittedByUserId),
  statusIdx: index("contribution_status_idx").on(table.status),
  categoryIdx: index("contribution_category_idx").on(table.dataCategory),
  submittedAtIdx: index("contribution_submitted_at_idx").on(table.submittedAt),
}));

export type PartnerContribution = typeof partnerContributions.$inferSelect;
export type InsertPartnerContribution = typeof partnerContributions.$inferInsert;


// ============================================================================
// TRUTH LAYER - EVIDENCE GRAPH
// ============================================================================

/**
 * Evidence Sources - Registry of whitelisted data publishers
 * Categories: humanitarian, IFI, sanctions, domestic, partner
 */
export const evidenceSources = mysqlTable("evidence_sources", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }),
  acronym: varchar("acronym", { length: 50 }),
  category: mysqlEnum("category", [
    "humanitarian",      // OCHA, UNHCR, WFP, etc.
    "ifi",              // World Bank, IMF
    "un_agency",        // UN agencies
    "sanctions",        // OFAC, EU, UK sanctions
    "domestic_aden",    // CBY Aden, IRG ministries
    "domestic_sanaa",   // CBY Sana'a, DFA authorities
    "academic",         // Universities, research institutes
    "think_tank",       // Policy research organizations
    "media",            // Verified news sources
    "partner",          // Verified partner contributors
    "other"
  ]).notNull(),
  isWhitelisted: boolean("isWhitelisted").default(true).notNull(),
  trustLevel: mysqlEnum("trustLevel", ["high", "medium", "low", "unverified"]).default("medium").notNull(),
  baseUrl: text("baseUrl"),
  apiEndpoint: text("apiEndpoint"),
  apiType: mysqlEnum("apiType", ["rest", "graphql", "sdmx", "ckan", "manual", "none"]),
  updateFrequency: mysqlEnum("updateFrequency", ["realtime", "daily", "weekly", "monthly", "quarterly", "annual", "irregular"]),
  lastVerifiedAt: timestamp("lastVerifiedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  nameIdx: index("evidence_source_name_idx").on(table.name),
  categoryIdx: index("evidence_source_category_idx").on(table.category),
  whitelistIdx: index("evidence_source_whitelist_idx").on(table.isWhitelisted),
}));

export type EvidenceSource = typeof evidenceSources.$inferSelect;
export type InsertEvidenceSource = typeof evidenceSources.$inferInsert;

// Import backfill infrastructure tables
export * from "./schema-backfill";
export * from "./schema-source-registry";

/**
 * Evidence Documents - PDFs, reports, publications with storage and hashing
 */
export const evidenceDocuments = mysqlTable("evidence_documents", {
  id: int("id").autoincrement().primaryKey(),
  sourceId: int("sourceId").notNull().references(() => evidenceSources.id),
  title: varchar("title", { length: 500 }).notNull(),
  titleAr: varchar("titleAr", { length: 500 }),
  documentType: mysqlEnum("documentType", [
    "report",
    "circular",
    "law",
    "decree",
    "statistical_bulletin",
    "press_release",
    "dataset_metadata",
    "academic_paper",
    "news_article",
    "other"
  ]).notNull(),
  publicationDate: timestamp("publicationDate"),
  retrievalDate: timestamp("retrievalDate").notNull(),
  sourceUrl: text("sourceUrl"),
  storageKey: varchar("storageKey", { length: 255 }), // S3 key
  storageUrl: text("storageUrl"), // S3 URL
  contentHash: varchar("contentHash", { length: 64 }), // SHA-256 for reproducibility
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"),
  pageCount: int("pageCount"),
  language: mysqlEnum("language", ["en", "ar", "both"]).default("en").notNull(),
  regimeTag: mysqlEnum("regimeTag", ["aden_irg", "sanaa_defacto", "mixed", "unknown"]),
  license: varchar("license", { length: 100 }),
  isProcessed: boolean("isProcessed").default(false).notNull(),
  processingStatus: mysqlEnum("processingStatus", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  extractedText: text("extractedText"),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  sourceIdx: index("evidence_doc_source_idx").on(table.sourceId),
  typeIdx: index("evidence_doc_type_idx").on(table.documentType),
  pubDateIdx: index("evidence_doc_pub_date_idx").on(table.publicationDate),
  hashIdx: index("evidence_doc_hash_idx").on(table.contentHash),
}));

export type EvidenceDocument = typeof evidenceDocuments.$inferSelect;
export type InsertEvidenceDocument = typeof evidenceDocuments.$inferInsert;

/**
 * Evidence Excerpts - Anchored passages/snippets from documents
 */
export const evidenceExcerpts = mysqlTable("evidence_excerpts", {
  id: int("id").autoincrement().primaryKey(),
  documentId: int("documentId").notNull().references(() => evidenceDocuments.id),
  excerptText: text("excerptText").notNull(),
  excerptTextAr: text("excerptTextAr"),
  pageNumber: int("pageNumber"),
  startOffset: int("startOffset"), // Character offset in document
  endOffset: int("endOffset"),
  highlightCoordinates: json("highlightCoordinates").$type<{ x: number; y: number; width: number; height: number }[]>(),
  extractionMethod: mysqlEnum("extractionMethod", ["manual", "ocr", "llm", "api"]).default("manual").notNull(),
  extractedByUserId: int("extractedByUserId").references(() => users.id),
  verifiedByUserId: int("verifiedByUserId").references(() => users.id),
  verifiedAt: timestamp("verifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  documentIdx: index("excerpt_document_idx").on(table.documentId),
  pageIdx: index("excerpt_page_idx").on(table.pageNumber),
}));

export type EvidenceExcerpt = typeof evidenceExcerpts.$inferSelect;
export type InsertEvidenceExcerpt = typeof evidenceExcerpts.$inferInsert;

/**
 * Evidence Datasets - Dataset metadata with schema and update tracking
 */
export const evidenceDatasets = mysqlTable("evidence_datasets", {
  id: int("id").autoincrement().primaryKey(),
  sourceId: int("sourceId").notNull().references(() => evidenceSources.id),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  datasetType: mysqlEnum("datasetType", [
    "time_series",
    "cross_section",
    "panel",
    "geospatial",
    "event_log",
    "registry",
    "other"
  ]).notNull(),
  schema: json("schema").$type<{ columns: { name: string; type: string; description: string }[] }>(),
  timeCoverageStart: timestamp("timeCoverageStart"),
  timeCoverageEnd: timestamp("timeCoverageEnd"),
  geographicScope: varchar("geographicScope", { length: 100 }),
  regimeTag: mysqlEnum("regimeTag", ["aden_irg", "sanaa_defacto", "mixed", "unknown"]),
  updateFrequency: mysqlEnum("updateFrequency", ["realtime", "daily", "weekly", "monthly", "quarterly", "annual", "irregular"]),
  lastUpdatedAt: timestamp("lastUpdatedAt"),
  recordCount: int("recordCount"),
  apiEndpoint: text("apiEndpoint"),
  downloadUrl: text("downloadUrl"),
  license: varchar("license", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  sourceIdx: index("evidence_dataset_source_idx").on(table.sourceId),
  typeIdx: index("evidence_dataset_type_idx").on(table.datasetType),
  nameIdx: index("evidence_dataset_name_idx").on(table.name),
}));

export type EvidenceDataset = typeof evidenceDatasets.$inferSelect;
export type InsertEvidenceDataset = typeof evidenceDatasets.$inferInsert;

/**
 * Evidence Observations - Individual data points from datasets
 */
export const evidenceObservations = mysqlTable("evidence_observations", {
  id: int("id").autoincrement().primaryKey(),
  datasetId: int("datasetId").notNull().references(() => evidenceDatasets.id),
  indicatorCode: varchar("indicatorCode", { length: 100 }).notNull(),
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd"),
  value: decimal("value", { precision: 20, scale: 6 }),
  valueText: varchar("valueText", { length: 255 }), // For non-numeric values
  unit: varchar("unit", { length: 50 }),
  regimeTag: mysqlEnum("regimeTag", ["aden_irg", "sanaa_defacto", "mixed", "unknown"]),
  geography: varchar("geography", { length: 100 }),
  ingestionJobId: int("ingestionJobId"),
  rawValue: text("rawValue"), // Original value before transformation
  transformationApplied: text("transformationApplied"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  datasetIdx: index("observation_dataset_idx").on(table.datasetId),
  indicatorIdx: index("observation_indicator_idx").on(table.indicatorCode),
  periodIdx: index("observation_period_idx").on(table.periodStart),
  regimeIdx: index("observation_regime_idx").on(table.regimeTag),
}));

export type EvidenceObservation = typeof evidenceObservations.$inferSelect;
export type InsertEvidenceObservation = typeof evidenceObservations.$inferInsert;

// ============================================================================
// TRUTH LAYER - CLAIM LEDGER
// ============================================================================

/**
 * Claims - The atomic truth objects
 * Every factual statement displayed must be a Claim with provenance
 */
export const claims = mysqlTable("claims", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID for stable references
  claimType: mysqlEnum("claimType", [
    "metric_value",        // Numeric indicator value
    "event_statement",     // Something happened
    "regulation_statement", // A rule/law/directive
    "narrative_statement", // Descriptive text
    "model_parameter"      // Simulation parameter
  ]).notNull(),
  
  // Subject-Predicate-Object structure
  subjectType: mysqlEnum("subjectType", ["indicator", "entity", "event", "regulation", "geography"]).notNull(),
  subjectId: varchar("subjectId", { length: 100 }).notNull(), // Reference to indicator_code, entity_id, etc.
  subjectLabel: varchar("subjectLabel", { length: 255 }), // Human-readable label
  subjectLabelAr: varchar("subjectLabelAr", { length: 255 }),
  
  predicate: mysqlEnum("predicate", [
    "equals",
    "increased_by",
    "decreased_by",
    "changed_to",
    "announced",
    "implemented",
    "estimated_at",
    "reported_as",
    "projected_to",
    "other"
  ]).notNull(),
  
  // Object (the value)
  objectValue: decimal("objectValue", { precision: 20, scale: 6 }),
  objectText: text("objectText"), // For non-numeric claims
  objectUnit: varchar("objectUnit", { length: 50 }),
  objectFrequency: varchar("objectFrequency", { length: 50 }), // e.g., "monthly", "annual"
  objectBaseYear: int("objectBaseYear"),
  
  // Geography and regime
  geography: varchar("geography", { length: 100 }),
  regimeTag: mysqlEnum("regimeTag", ["aden_irg", "sanaa_defacto", "mixed", "unknown"]).notNull(),
  
  // Time dimension
  timeStart: timestamp("timeStart"),
  timeEnd: timestamp("timeEnd"),
  asOfDate: timestamp("asOfDate"), // When this claim was valid
  
  // Computation lineage
  computationLineage: json("computationLineage").$type<{
    steps: { operation: string; input: string; output: string }[];
    rawValue?: string;
    transformations?: string[];
  }>(),
  
  // Confidence
  confidenceGrade: mysqlEnum("confidenceGrade", ["A", "B", "C", "D"]).notNull(),
  confidenceRationale: text("confidenceRationale"),
  
  // Conflict status
  conflictStatus: mysqlEnum("conflictStatus", ["none", "disputed", "resolved"]).default("none").notNull(),
  conflictNotes: text("conflictNotes"),
  
  // Visibility
  visibility: mysqlEnum("visibility", ["public", "registered", "pro", "admin"]).default("public").notNull(),
  
  // Audit
  createdBy: mysqlEnum("createdBy", ["system_ingestion", "contributor", "analyst", "admin"]).notNull(),
  createdByUserId: int("createdByUserId").references(() => users.id),
  verifiedByUserId: int("verifiedByUserId").references(() => users.id),
  verifiedAt: timestamp("verifiedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  typeIdx: index("claim_type_idx").on(table.claimType),
  subjectIdx: index("claim_subject_idx").on(table.subjectType, table.subjectId),
  regimeIdx: index("claim_regime_idx").on(table.regimeTag),
  timeIdx: index("claim_time_idx").on(table.timeStart, table.timeEnd),
  confidenceIdx: index("claim_confidence_idx").on(table.confidenceGrade),
  conflictIdx: index("claim_conflict_idx").on(table.conflictStatus),
}));

export type Claim = typeof claims.$inferSelect;
export type InsertClaim = typeof claims.$inferInsert;

/**
 * Claim Evidence Links - Links claims to their evidence
 */
export const claimEvidenceLinks = mysqlTable("claim_evidence_links", {
  id: int("id").autoincrement().primaryKey(),
  claimId: varchar("claimId", { length: 36 }).notNull().references(() => claims.id),
  evidenceType: mysqlEnum("evidenceType", ["document", "excerpt", "dataset", "observation"]).notNull(),
  evidenceId: int("evidenceId").notNull(), // FK to evidence_documents, evidence_excerpts, etc.
  relevanceScore: decimal("relevanceScore", { precision: 3, scale: 2 }), // 0.00 to 1.00
  isPrimary: boolean("isPrimary").default(false).notNull(), // Primary source for this claim
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  claimIdx: index("claim_evidence_claim_idx").on(table.claimId),
  evidenceIdx: index("claim_evidence_evidence_idx").on(table.evidenceType, table.evidenceId),
}));

export type ClaimEvidenceLink = typeof claimEvidenceLinks.$inferSelect;
export type InsertClaimEvidenceLink = typeof claimEvidenceLinks.$inferInsert;

/**
 * Claim Sets - Groups of claims used in views/reports
 */
export const claimSets = mysqlTable("claim_sets", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  purpose: mysqlEnum("purpose", ["page_view", "report", "export", "api_response"]).notNull(),
  pageRoute: varchar("pageRoute", { length: 255 }), // e.g., "/sectors/banking"
  evidenceSetHash: varchar("evidenceSetHash", { length: 64 }), // Hash of all evidence used
  claimIds: json("claimIds").$type<string[]>(),
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
  generatedByUserId: int("generatedByUserId").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  purposeIdx: index("claim_set_purpose_idx").on(table.purpose),
  pageIdx: index("claim_set_page_idx").on(table.pageRoute),
}));

export type ClaimSet = typeof claimSets.$inferSelect;
export type InsertClaimSet = typeof claimSets.$inferInsert;

/**
 * Conflicts - When multiple sources disagree
 */
export const conflicts = mysqlTable("conflicts", {
  id: int("id").autoincrement().primaryKey(),
  conflictType: mysqlEnum("conflictType", [
    "value_mismatch",
    "date_mismatch",
    "source_contradiction",
    "methodology_difference"
  ]).notNull(),
  subjectType: varchar("subjectType", { length: 50 }).notNull(),
  subjectId: varchar("subjectId", { length: 100 }).notNull(),
  description: text("description").notNull(),
  descriptionAr: text("descriptionAr"),
  
  // Conflicting claims
  claimIds: json("claimIds").$type<string[]>(),
  
  // Resolution
  status: mysqlEnum("status", ["detected", "under_review", "resolved", "accepted"]).default("detected").notNull(),
  resolution: text("resolution"),
  resolvedClaimId: varchar("resolvedClaimId", { length: 36 }),
  resolvedByUserId: int("resolvedByUserId").references(() => users.id),
  resolvedAt: timestamp("resolvedAt"),
  
  // Severity
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  typeIdx: index("conflict_type_idx").on(table.conflictType),
  subjectIdx: index("conflict_subject_idx").on(table.subjectType, table.subjectId),
  statusIdx: index("conflict_status_idx").on(table.status),
  severityIdx: index("conflict_severity_idx").on(table.severity),
}));

export type Conflict = typeof conflicts.$inferSelect;
export type InsertConflict = typeof conflicts.$inferInsert;

/**
 * Confidence Scores - Detailed confidence computation
 */
export const confidenceScores = mysqlTable("confidence_scores", {
  id: int("id").autoincrement().primaryKey(),
  claimId: varchar("claimId", { length: 36 }).notNull().references(() => claims.id),
  
  // Score components
  sourceReliability: decimal("sourceReliability", { precision: 3, scale: 2 }), // 0.00 to 1.00
  dataRecency: decimal("dataRecency", { precision: 3, scale: 2 }),
  methodologyClarity: decimal("methodologyClarity", { precision: 3, scale: 2 }),
  corroborationLevel: decimal("corroborationLevel", { precision: 3, scale: 2 }),
  
  // Overall
  overallScore: decimal("overallScore", { precision: 3, scale: 2 }).notNull(),
  grade: mysqlEnum("grade", ["A", "B", "C", "D"]).notNull(),
  
  // Computation
  computationMethod: varchar("computationMethod", { length: 100 }),
  computationDetails: json("computationDetails").$type<Record<string, unknown>>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  claimIdx: index("confidence_claim_idx").on(table.claimId),
  gradeIdx: index("confidence_grade_idx").on(table.grade),
}));

export type ConfidenceScore = typeof confidenceScores.$inferSelect;
export type InsertConfidenceScore = typeof confidenceScores.$inferInsert;

// ============================================================================
// TRUTH LAYER - ENTITIES & REGULATIONS
// ============================================================================

/**
 * Entities - All actors/organizations/banks/regions
 */
export const entities = mysqlTable("entities", {
  id: int("id").autoincrement().primaryKey(),
  entityType: mysqlEnum("entityType", [
    "central_bank",
    "commercial_bank",
    "mfi",
    "exchange_company",
    "government_ministry",
    "customs_authority",
    "tax_authority",
    "un_agency",
    "ingo",
    "donor",
    "company",
    "political_party",
    "armed_group",
    "governorate",
    "city",
    "other"
  ]).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }),
  acronym: varchar("acronym", { length: 50 }),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  
  // Affiliation
  regimeTag: mysqlEnum("regimeTag", ["aden_irg", "sanaa_defacto", "mixed", "neutral", "unknown"]),
  parentEntityId: int("parentEntityId"), // For hierarchical relationships
  
  // Contact/Location
  headquarters: varchar("headquarters", { length: 255 }),
  website: text("website"),
  
  // Status
  status: mysqlEnum("status", ["active", "inactive", "dissolved", "sanctioned", "unknown"]).default("active").notNull(),
  establishedDate: timestamp("establishedDate"),
  dissolvedDate: timestamp("dissolvedDate"),
  
  // Metadata
  logoUrl: text("logoUrl"),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  typeIdx: index("entity_type_idx").on(table.entityType),
  nameIdx: index("entity_name_idx").on(table.name),
  regimeIdx: index("entity_regime_idx").on(table.regimeTag),
  statusIdx: index("entity_status_idx").on(table.status),
}));

export type Entity = typeof entities.$inferSelect;
export type InsertEntity = typeof entities.$inferInsert;

/**
 * Entity Links - Relationships between entities
 */
export const entityLinks = mysqlTable("entity_links", {
  id: int("id").autoincrement().primaryKey(),
  sourceEntityId: int("sourceEntityId").notNull().references(() => entities.id),
  targetEntityId: int("targetEntityId").notNull().references(() => entities.id),
  relationshipType: mysqlEnum("relationshipType", [
    "parent_of",
    "subsidiary_of",
    "partner_with",
    "regulates",
    "funds",
    "contracts_with",
    "competes_with",
    "affiliated_with",
    "other"
  ]).notNull(),
  description: text("description"),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  sourceIdx: index("entity_link_source_idx").on(table.sourceEntityId),
  targetIdx: index("entity_link_target_idx").on(table.targetEntityId),
  typeIdx: index("entity_link_type_idx").on(table.relationshipType),
}));

export type EntityLink = typeof entityLinks.$inferSelect;
export type InsertEntityLink = typeof entityLinks.$inferInsert;

/**
 * Regulations - Directives/laws/circulars
 */
export const regulations = mysqlTable("regulations", {
  id: int("id").autoincrement().primaryKey(),
  regulationType: mysqlEnum("regulationType", [
    "law",
    "decree",
    "circular",
    "directive",
    "resolution",
    "guideline",
    "memorandum",
    "other"
  ]).notNull(),
  
  // Identification
  referenceNumber: varchar("referenceNumber", { length: 100 }), // e.g., "Circular No. 54 of 2021"
  title: varchar("title", { length: 500 }).notNull(),
  titleAr: varchar("titleAr", { length: 500 }),
  
  // Content
  summary: text("summary"),
  summaryAr: text("summaryAr"),
  fullText: text("fullText"),
  fullTextAr: text("fullTextAr"),
  
  // Issuing authority
  issuingEntityId: int("issuingEntityId").references(() => entities.id),
  issuingAuthority: varchar("issuingAuthority", { length: 255 }),
  
  // Dates
  issuedDate: timestamp("issuedDate"),
  effectiveDate: timestamp("effectiveDate"),
  expiryDate: timestamp("expiryDate"),
  
  // Scope
  regimeTag: mysqlEnum("regimeTag", ["aden_irg", "sanaa_defacto", "mixed", "unknown"]),
  affectedSectors: json("affectedSectors").$type<string[]>(),
  affectedIndicators: json("affectedIndicators").$type<string[]>(),
  
  // Status
  status: mysqlEnum("status", ["draft", "active", "superseded", "repealed", "expired"]).default("active").notNull(),
  supersededById: int("supersededById"),
  
  // Evidence
  documentId: int("documentId").references(() => evidenceDocuments.id),
  sourceUrl: text("sourceUrl"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  typeIdx: index("regulation_type_idx").on(table.regulationType),
  refIdx: index("regulation_ref_idx").on(table.referenceNumber),
  issuedIdx: index("regulation_issued_idx").on(table.issuedDate),
  regimeIdx: index("regulation_regime_idx").on(table.regimeTag),
  statusIdx: index("regulation_status_idx").on(table.status),
}));

export type Regulation = typeof regulations.$inferSelect;
export type InsertRegulation = typeof regulations.$inferInsert;

// ============================================================================
// AUTOPILOT OS - COVERAGE & TICKETS
// ============================================================================

/**
 * Coverage Cells - Track completeness by year × sector × governorate × actor
 */
export const coverageCells = mysqlTable("coverage_cells", {
  id: int("id").autoincrement().primaryKey(),
  year: int("year").notNull(),
  sector: varchar("sector", { length: 100 }).notNull(),
  governorate: varchar("governorate", { length: 100 }),
  actorType: varchar("actorType", { length: 100 }),
  regimeTag: mysqlEnum("regimeTag", ["aden_irg", "sanaa_defacto", "mixed", "unknown"]),
  
  // Coverage metrics
  totalExpectedItems: int("totalExpectedItems").default(0).notNull(),
  totalAvailableItems: int("totalAvailableItems").default(0).notNull(),
  coverageScore: decimal("coverageScore", { precision: 5, scale: 2 }), // 0.00 to 100.00
  
  // Breakdown
  indicatorsCovered: int("indicatorsCovered").default(0).notNull(),
  indicatorsExpected: int("indicatorsExpected").default(0).notNull(),
  eventsCovered: int("eventsCovered").default(0).notNull(),
  eventsExpected: int("eventsExpected").default(0).notNull(),
  documentsCovered: int("documentsCovered").default(0).notNull(),
  documentsExpected: int("documentsExpected").default(0).notNull(),
  regulationsCovered: int("regulationsCovered").default(0).notNull(),
  regulationsExpected: int("regulationsExpected").default(0).notNull(),
  
  // Quality
  averageConfidence: decimal("averageConfidence", { precision: 3, scale: 2 }),
  lastUpdatedAt: timestamp("lastUpdatedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  yearIdx: index("coverage_year_idx").on(table.year),
  sectorIdx: index("coverage_sector_idx").on(table.sector),
  govIdx: index("coverage_gov_idx").on(table.governorate),
  regimeIdx: index("coverage_regime_idx").on(table.regimeTag),
  scoreIdx: index("coverage_score_idx").on(table.coverageScore),
}));

export type CoverageCell = typeof coverageCells.$inferSelect;
export type InsertCoverageCell = typeof coverageCells.$inferInsert;

/**
 * Coverage Items - Individual items tracked in coverage
 */
export const coverageItems = mysqlTable("coverage_items", {
  id: int("id").autoincrement().primaryKey(),
  cellId: int("cellId").notNull().references(() => coverageCells.id),
  itemType: mysqlEnum("itemType", ["indicator", "event", "document", "regulation", "actor", "page"]).notNull(),
  itemId: varchar("itemId", { length: 100 }).notNull(),
  itemLabel: varchar("itemLabel", { length: 255 }),
  
  // Status
  status: mysqlEnum("status", ["available", "missing", "partial", "outdated"]).notNull(),
  lastAvailableDate: timestamp("lastAvailableDate"),
  
  // Quality
  confidenceGrade: mysqlEnum("confidenceGrade", ["A", "B", "C", "D"]),
  dataGapTicketId: int("dataGapTicketId"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  cellIdx: index("coverage_item_cell_idx").on(table.cellId),
  typeIdx: index("coverage_item_type_idx").on(table.itemType),
  statusIdx: index("coverage_item_status_idx").on(table.status),
}));

export type CoverageItem = typeof coverageItems.$inferSelect;
export type InsertCoverageItem = typeof coverageItems.$inferInsert;

/**
 * Fix Tickets - Issues found by QA that need fixing
 */
export const fixTickets = mysqlTable("fix_tickets", {
  id: int("id").autoincrement().primaryKey(),
  ticketType: mysqlEnum("ticketType", [
    "hardcoded_value",
    "broken_link",
    "missing_provenance",
    "export_failure",
    "translation_missing",
    "ui_inconsistency",
    "performance_issue",
    "security_issue",
    "other"
  ]).notNull(),
  
  // Location
  filePath: varchar("filePath", { length: 500 }),
  lineNumber: int("lineNumber"),
  pageRoute: varchar("pageRoute", { length: 255 }),
  componentName: varchar("componentName", { length: 100 }),
  
  // Details
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  detectedValue: text("detectedValue"),
  expectedBehavior: text("expectedBehavior"),
  
  // Severity
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  
  // Status
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "wont_fix", "duplicate"]).default("open").notNull(),
  
  // Resolution
  resolvedByUserId: int("resolvedByUserId").references(() => users.id),
  resolvedAt: timestamp("resolvedAt"),
  resolutionNotes: text("resolutionNotes"),
  
  // Detection
  detectedByJobId: int("detectedByJobId"),
  detectedAt: timestamp("detectedAt").defaultNow().notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  typeIdx: index("fix_ticket_type_idx").on(table.ticketType),
  severityIdx: index("fix_ticket_severity_idx").on(table.severity),
  statusIdx: index("fix_ticket_status_idx").on(table.status),
  pageIdx: index("fix_ticket_page_idx").on(table.pageRoute),
}));

export type FixTicket = typeof fixTickets.$inferSelect;
export type InsertFixTicket = typeof fixTickets.$inferInsert;

// ============================================================================
// AUTOPILOT OS - JOBS & RUNS
// ============================================================================

/**
 * Ingestion Runs - Track data ingestion jobs
 */
export const ingestionRuns = mysqlTable("ingestion_runs", {
  id: int("id").autoincrement().primaryKey(),
  sourceId: int("sourceId").notNull().references(() => evidenceSources.id),
  connectorName: varchar("connectorName", { length: 100 }).notNull(),
  
  // Timing
  startedAt: timestamp("startedAt").notNull(),
  completedAt: timestamp("completedAt"),
  duration: int("duration"), // milliseconds
  
  // Results
  status: mysqlEnum("status", ["running", "success", "partial", "failed"]).notNull(),
  recordsFetched: int("recordsFetched").default(0).notNull(),
  recordsCreated: int("recordsCreated").default(0).notNull(),
  recordsUpdated: int("recordsUpdated").default(0).notNull(),
  recordsSkipped: int("recordsSkipped").default(0).notNull(),
  claimsCreated: int("claimsCreated").default(0).notNull(),
  
  // Errors
  errorMessage: text("errorMessage"),
  errorDetails: json("errorDetails").$type<Record<string, unknown>>(),
  
  // Coverage impact
  coverageCellsUpdated: int("coverageCellsUpdated").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  sourceIdx: index("ingestion_source_idx").on(table.sourceId),
  connectorIdx: index("ingestion_connector_idx").on(table.connectorName),
  statusIdx: index("ingestion_status_idx").on(table.status),
  startedIdx: index("ingestion_started_idx").on(table.startedAt),
}));

export type IngestionRun = typeof ingestionRuns.$inferSelect;
export type InsertIngestionRun = typeof ingestionRuns.$inferInsert;

/**
 * QA Runs - Track QA/integrity check runs
 */
export const qaRuns = mysqlTable("qa_runs", {
  id: int("id").autoincrement().primaryKey(),
  runType: mysqlEnum("runType", [
    "full_scan",
    "hardcode_detection",
    "click_audit",
    "provenance_check",
    "export_integrity",
    "translation_check"
  ]).notNull(),
  
  // Timing
  startedAt: timestamp("startedAt").notNull(),
  completedAt: timestamp("completedAt"),
  duration: int("duration"),
  
  // Results
  status: mysqlEnum("status", ["running", "pass", "pass_warn", "fail"]).notNull(),
  totalChecks: int("totalChecks").default(0).notNull(),
  passedChecks: int("passedChecks").default(0).notNull(),
  warningChecks: int("warningChecks").default(0).notNull(),
  failedChecks: int("failedChecks").default(0).notNull(),
  
  // Tickets created
  ticketsCreated: int("ticketsCreated").default(0).notNull(),
  
  // Report
  reportPath: varchar("reportPath", { length: 255 }), // e.g., "/qa/integrity-report.json"
  reportSummary: json("reportSummary").$type<Record<string, unknown>>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  typeIdx: index("qa_type_idx").on(table.runType),
  statusIdx: index("qa_status_idx").on(table.status),
  startedIdx: index("qa_started_idx").on(table.startedAt),
}));

export type QaRun = typeof qaRuns.$inferSelect;
export type InsertQaRun = typeof qaRuns.$inferInsert;

/**
 * Publish Runs - Track publishing events
 */
export const publishRuns = mysqlTable("publish_runs", {
  id: int("id").autoincrement().primaryKey(),
  
  // Timing
  startedAt: timestamp("startedAt").notNull(),
  completedAt: timestamp("completedAt"),
  
  // Status
  status: mysqlEnum("status", ["pending", "running", "success", "failed", "blocked"]).notNull(),
  blockedReason: text("blockedReason"),
  
  // QA Gate
  qaRunId: int("qaRunId").references(() => qaRuns.id),
  qaStatus: mysqlEnum("qaStatus", ["pass", "pass_warn", "fail"]),
  
  // Changes
  pagesUpdated: int("pagesUpdated").default(0).notNull(),
  claimsPublished: int("claimsPublished").default(0).notNull(),
  
  // Changelog
  changelogSummary: text("changelogSummary"),
  changelogDetails: json("changelogDetails").$type<{
    newPages: string[];
    updatedPages: string[];
    newClaims: number;
    updatedClaims: number;
  }>(),
  
  // Approval
  approvedByUserId: int("approvedByUserId").references(() => users.id),
  approvedAt: timestamp("approvedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  statusIdx: index("publish_status_idx").on(table.status),
  startedIdx: index("publish_started_idx").on(table.startedAt),
}));

export type PublishRun = typeof publishRuns.$inferSelect;
export type InsertPublishRun = typeof publishRuns.$inferInsert;

/**
 * Page Build Runs - Track auto-generated page builds
 */
export const pageBuildRuns = mysqlTable("page_build_runs", {
  id: int("id").autoincrement().primaryKey(),
  pageType: mysqlEnum("pageType", [
    "year_page",
    "sector_page",
    "actor_page",
    "regulation_page",
    "governorate_page",
    "report_page"
  ]).notNull(),
  pageIdentifier: varchar("pageIdentifier", { length: 255 }).notNull(), // e.g., "2024", "banking", "cby-aden"
  pageRoute: varchar("pageRoute", { length: 255 }),
  
  // Timing
  startedAt: timestamp("startedAt").notNull(),
  completedAt: timestamp("completedAt"),
  
  // Status
  status: mysqlEnum("status", ["running", "success", "failed", "skipped"]).notNull(),
  
  // Content
  claimsUsed: int("claimsUsed").default(0).notNull(),
  evidenceSetHash: varchar("evidenceSetHash", { length: 64 }),
  
  // Errors
  errorMessage: text("errorMessage"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  typeIdx: index("page_build_type_idx").on(table.pageType),
  identifierIdx: index("page_build_identifier_idx").on(table.pageIdentifier),
  statusIdx: index("page_build_status_idx").on(table.status),
}));

export type PageBuildRun = typeof pageBuildRuns.$inferSelect;
export type InsertPageBuildRun = typeof pageBuildRuns.$inferInsert;

/**
 * Translation Jobs - Track translation work
 */
export const translationJobs = mysqlTable("translation_jobs", {
  id: int("id").autoincrement().primaryKey(),
  targetType: mysqlEnum("targetType", ["claim", "document", "page", "regulation", "entity"]).notNull(),
  targetId: varchar("targetId", { length: 100 }).notNull(),
  sourceLanguage: mysqlEnum("sourceLanguage", ["en", "ar"]).notNull(),
  targetLanguage: mysqlEnum("targetLanguage", ["en", "ar"]).notNull(),
  
  // Status
  status: mysqlEnum("status", ["pending", "in_progress", "review", "completed", "failed"]).default("pending").notNull(),
  
  // Content
  sourceText: text("sourceText"),
  translatedText: text("translatedText"),
  
  // Quality
  translationMethod: mysqlEnum("translationMethod", ["human", "machine", "hybrid"]),
  reviewedByUserId: int("reviewedByUserId").references(() => users.id),
  reviewedAt: timestamp("reviewedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  targetIdx: index("translation_target_idx").on(table.targetType, table.targetId),
  statusIdx: index("translation_status_idx").on(table.status),
}));

export type TranslationJob = typeof translationJobs.$inferSelect;
export type InsertTranslationJob = typeof translationJobs.$inferInsert;

// ============================================================================
// AUTOPILOT OS - SETTINGS & EVENTS
// ============================================================================

/**
 * Autopilot Settings - Configuration for autopilot behavior
 */
export const autopilotSettings = mysqlTable("autopilot_settings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 100 }).notNull().unique(),
  settingValue: text("settingValue").notNull(),
  settingType: mysqlEnum("settingType", ["boolean", "number", "string", "json"]).notNull(),
  description: text("description"),
  category: mysqlEnum("category", [
    "ingestion",
    "qa",
    "publishing",
    "coverage",
    "notifications",
    "general"
  ]).notNull(),
  updatedByUserId: int("updatedByUserId").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  keyIdx: index("autopilot_setting_key_idx").on(table.settingKey),
  categoryIdx: index("autopilot_setting_category_idx").on(table.category),
}));

export type AutopilotSetting = typeof autopilotSettings.$inferSelect;
export type InsertAutopilotSetting = typeof autopilotSettings.$inferInsert;

/**
 * Autopilot Events - Log of autopilot activities
 */
export const autopilotEvents = mysqlTable("autopilot_events", {
  id: int("id").autoincrement().primaryKey(),
  eventType: mysqlEnum("eventType", [
    "ingestion_started",
    "ingestion_completed",
    "qa_started",
    "qa_completed",
    "page_generated",
    "report_generated",
    "publish_started",
    "publish_completed",
    "ticket_created",
    "ticket_resolved",
    "setting_changed",
    "autopilot_paused",
    "autopilot_resumed",
    "error"
  ]).notNull(),
  
  // Details
  summary: varchar("summary", { length: 500 }).notNull(),
  details: json("details").$type<Record<string, unknown>>(),
  
  // Related entities
  relatedJobId: int("relatedJobId"),
  relatedTicketId: int("relatedTicketId"),
  relatedPageRoute: varchar("relatedPageRoute", { length: 255 }),
  
  // User
  triggeredByUserId: int("triggeredByUserId").references(() => users.id),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  typeIdx: index("autopilot_event_type_idx").on(table.eventType),
  createdIdx: index("autopilot_event_created_idx").on(table.createdAt),
}));

export type AutopilotEvent = typeof autopilotEvents.$inferSelect;
export type InsertAutopilotEvent = typeof autopilotEvents.$inferInsert;

// ============================================================================
// TRUTH LAYER - INTEGRITY REPORTS
// ============================================================================

/**
 * Integrity Reports - Store QA scan results
 */
export const integrityReports = mysqlTable("integrity_reports", {
  id: int("id").autoincrement().primaryKey(),
  qaRunId: int("qaRunId").references(() => qaRuns.id),
  reportType: mysqlEnum("reportType", [
    "hardcode_scan",
    "provenance_coverage",
    "click_audit",
    "export_integrity",
    "full_integrity"
  ]).notNull(),
  
  // Scores
  overallScore: decimal("overallScore", { precision: 5, scale: 2 }), // 0-100
  provenanceCoverage: decimal("provenanceCoverage", { precision: 5, scale: 2 }),
  hardcodeViolations: int("hardcodeViolations").default(0).notNull(),
  brokenClicks: int("brokenClicks").default(0).notNull(),
  exportFailures: int("exportFailures").default(0).notNull(),
  translationGaps: int("translationGaps").default(0).notNull(),
  
  // Details
  reportJson: json("reportJson").$type<{
    summary: Record<string, unknown>;
    violations: Array<{
      type: string;
      severity: string;
      location: string;
      details: string;
    }>;
  }>(),
  
  // File paths
  jsonReportPath: varchar("jsonReportPath", { length: 255 }),
  markdownReportPath: varchar("markdownReportPath", { length: 255 }),
  
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
}, (table) => ({
  qaRunIdx: index("integrity_qa_run_idx").on(table.qaRunId),
  typeIdx: index("integrity_type_idx").on(table.reportType),
  generatedIdx: index("integrity_generated_idx").on(table.generatedAt),
}));

export type IntegrityReport = typeof integrityReports.$inferSelect;
export type InsertIntegrityReport = typeof integrityReports.$inferInsert;


// ============================================================================
// RE-EXPORT VISUALIZATION & REPORTING SCHEMA
// ============================================================================
export * from "./schema-visualization";


// ============================================================================
// TIME-TRAVEL WHAT-IF SYSTEM (Step 5)
// ============================================================================

/**
 * Key Historical Events - Stores significant events that influence economic indicators
 * Used for the Time-Travel slider event markers and causality visualization
 */
export const keyEvents = mysqlTable("key_events", {
  id: int("id").autoincrement().primaryKey(),
  eventDate: timestamp("eventDate").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }),
  description: text("description").notNull(),
  descriptionAr: text("descriptionAr"),
  category: mysqlEnum("category", [
    "political",
    "economic",
    "military",
    "humanitarian",
    "monetary",
    "fiscal",
    "trade",
    "infrastructure",
    "social"
  ]).notNull(),
  impactLevel: int("impactLevel").notNull(), // 1-5 (Low to Critical)
  regimeTag: mysqlEnum("regimeTag", ["aden_irg", "sanaa_defacto", "all", "international"]).notNull(),
  affectedIndicators: json("affectedIndicators").$type<string[]>(), // Indicator codes affected by this event
  sourceCitation: text("sourceCitation").notNull(),
  sourceUrl: text("sourceUrl"),
  isNeutralizable: boolean("isNeutralizable").default(true).notNull(), // Can be disabled in what-if scenarios
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  dateIdx: index("key_event_date_idx").on(table.eventDate),
  categoryIdx: index("key_event_category_idx").on(table.category),
  regimeIdx: index("key_event_regime_idx").on(table.regimeTag),
  impactIdx: index("key_event_impact_idx").on(table.impactLevel),
}));

export type KeyEvent = typeof keyEvents.$inferSelect;
export type InsertKeyEvent = typeof keyEvents.$inferInsert;

/**
 * AI Projections Cache - Stores AI-generated projections for "what-if" scenarios
 * Caches results to avoid repeated LLM calls for the same scenario
 */
export const aiProjections = mysqlTable("ai_projections", {
  id: int("id").autoincrement().primaryKey(),
  scenarioHash: varchar("scenarioHash", { length: 64 }).notNull().unique(), // SHA256 hash of (timestamp + neutralized_event_ids)
  timestamp: timestamp("timestamp").notNull(), // The point in time for this projection
  neutralizedEventIds: json("neutralizedEventIds").$type<number[]>().notNull(), // IDs of events that were "disabled"
  projectionData: json("projectionData").$type<{
    projectedIndicators: Array<{
      indicatorCode: string;
      originalValue: number;
      projectedValue: number;
      confidence: number; // 0-1
      reasoning: string;
    }>;
    narrativeSummary: string;
    narrativeSummaryAr: string;
    methodology: string;
    caveats: string[];
  }>().notNull(),
  modelUsed: varchar("modelUsed", { length: 100 }).notNull(),
  generationTimeMs: int("generationTimeMs"),
  requestedBy: int("requestedBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"), // Cache expiration
}, (table) => ({
  hashIdx: index("ai_projection_hash_idx").on(table.scenarioHash),
  timestampIdx: index("ai_projection_timestamp_idx").on(table.timestamp),
  createdIdx: index("ai_projection_created_idx").on(table.createdAt),
}));

export type AiProjection = typeof aiProjections.$inferSelect;
export type InsertAiProjection = typeof aiProjections.$inferInsert;

/**
 * Historical State Snapshots - Pre-computed snapshots for fast time-travel queries
 * Stores aggregated state at key points in time
 */
export const historicalSnapshots = mysqlTable("historical_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  snapshotDate: timestamp("snapshotDate").notNull(),
  snapshotType: mysqlEnum("snapshotType", ["monthly", "quarterly", "annual", "event_triggered"]).notNull(),
  
  // Aggregated indicator values at this point
  indicatorValues: json("indicatorValues").$type<Array<{
    indicatorCode: string;
    regimeTag: string;
    value: number;
    unit: string;
    confidenceRating: string;
  }>>().notNull(),
  
  // Events that occurred up to this point
  eventCount: int("eventCount").notNull(),
  
  // Summary statistics
  summaryStats: json("summaryStats").$type<{
    fxRateAden: number | null;
    fxRateSanaa: number | null;
    inflationAden: number | null;
    inflationSanaa: number | null;
    gdpEstimate: number | null;
    tradeBalance: number | null;
    humanitarianNeed: number | null;
  }>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  dateIdx: index("snapshot_date_idx").on(table.snapshotDate),
  typeIdx: index("snapshot_type_idx").on(table.snapshotType),
}));

export type HistoricalSnapshot = typeof historicalSnapshots.$inferSelect;
export type InsertHistoricalSnapshot = typeof historicalSnapshots.$inferInsert;


// ============================================================================
// STEP 6: SELF-PRODUCTION REPORT ENGINE
// ============================================================================

/**
 * Report Templates - Stores metadata about each report type
 * Supports quarterly, annual, and on-demand report generation
 */
export const reportTemplates = mysqlTable("report_templates", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  nameEn: varchar("nameEn", { length: 255 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }).notNull(),
  descriptionEn: text("descriptionEn"),
  descriptionAr: text("descriptionAr"),
  frequency: mysqlEnum("frequency", ["quarterly", "annual", "monthly", "on_demand"]).notNull(),
  templateComponentPath: varchar("templateComponentPath", { length: 255 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  
  // Report configuration
  config: json("config").$type<{
    sections: string[];
    indicators: string[];
    includeCharts: boolean;
    includeDataTables: boolean;
    pageSize: "A4" | "Letter";
    orientation: "portrait" | "landscape";
  }>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  slugIdx: index("report_template_slug_idx").on(table.slug),
  frequencyIdx: index("report_template_frequency_idx").on(table.frequency),
}));

export type ReportTemplate = typeof reportTemplates.$inferSelect;
export type InsertReportTemplate = typeof reportTemplates.$inferInsert;

/**
 * Report Subscribers - Users who subscribe to receive reports
 * Supports tiered access (public, premium, vip)
 */
export const reportSubscribers = mysqlTable("report_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  nameEn: varchar("nameEn", { length: 255 }),
  nameAr: varchar("nameAr", { length: 255 }),
  organization: varchar("organization", { length: 255 }),
  tier: mysqlEnum("tier", ["public", "premium", "vip"]).default("public").notNull(),
  preferredLanguage: mysqlEnum("preferredLanguage", ["en", "ar"]).default("en").notNull(),
  
  // Subscription preferences
  subscribedTemplates: json("subscribedTemplates").$type<string[]>(), // Template slugs
  
  isActive: boolean("isActive").default(true).notNull(),
  subscribedAt: timestamp("subscribedAt").defaultNow().notNull(),
  unsubscribedAt: timestamp("unsubscribedAt"),
  
  // Verification
  verificationToken: varchar("verificationToken", { length: 100 }),
  isVerified: boolean("isVerified").default(false).notNull(),
  verifiedAt: timestamp("verifiedAt"),
}, (table) => ({
  emailIdx: index("subscriber_email_idx").on(table.email),
  tierIdx: index("subscriber_tier_idx").on(table.tier),
}));

export type ReportSubscriber = typeof reportSubscribers.$inferSelect;
export type InsertReportSubscriber = typeof reportSubscribers.$inferInsert;

/**
 * Generated Reports - Stores metadata about each generated report instance
 * Tracks generation status, S3 storage, and distribution
 */
export const generatedReports = mysqlTable("generated_reports", {
  id: int("id").autoincrement().primaryKey(),
  templateId: int("templateId").notNull().references(() => reportTemplates.id),
  
  // Report period
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  periodLabel: varchar("periodLabel", { length: 50 }).notNull(), // e.g., "Q1 2026", "2025 Annual"
  
  // Generation status
  status: mysqlEnum("status", ["pending", "generating", "success", "failed"]).default("pending").notNull(),
  
  // S3 storage
  s3KeyEn: varchar("s3KeyEn", { length: 512 }),
  s3KeyAr: varchar("s3KeyAr", { length: 512 }),
  s3UrlEn: varchar("s3UrlEn", { length: 1024 }),
  s3UrlAr: varchar("s3UrlAr", { length: 1024 }),
  
  // File metadata
  fileSizeBytesEn: int("fileSizeBytesEn"),
  fileSizeBytesAr: int("fileSizeBytesAr"),
  pageCountEn: int("pageCountEn"),
  pageCountAr: int("pageCountAr"),
  
  // Generation metrics
  generationDurationMs: int("generationDurationMs"),
  errorMessage: text("errorMessage"),
  
  // Content summary
  summary: json("summary").$type<{
    keyFindings: string[];
    keyFindingsAr: string[];
    dataPointsIncluded: number;
    chartsIncluded: number;
    sourcesCount: number;
  }>(),
  
  generatedAt: timestamp("generatedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  
  // Who triggered it
  triggeredBy: mysqlEnum("triggeredBy", ["scheduled", "admin", "api"]).default("scheduled").notNull(),
  triggeredByUserId: int("triggeredByUserId").references(() => users.id),
}, (table) => ({
  templateIdx: index("generated_report_template_idx").on(table.templateId),
  statusIdx: index("generated_report_status_idx").on(table.status),
  periodIdx: index("generated_report_period_idx").on(table.periodStart, table.periodEnd),
  createdIdx: index("generated_report_created_idx").on(table.createdAt),
}));

export type GeneratedReport = typeof generatedReports.$inferSelect;
export type InsertGeneratedReport = typeof generatedReports.$inferInsert;

/**
 * Report Distribution Log - Audit trail for every report email sent
 * Tracks delivery status and errors
 */
export const reportDistributionLog = mysqlTable("report_distribution_log", {
  id: int("id").autoincrement().primaryKey(),
  reportId: int("reportId").notNull().references(() => generatedReports.id, { onDelete: "cascade" }),
  subscriberId: int("subscriberId").notNull().references(() => reportSubscribers.id, { onDelete: "cascade" }),
  
  // Delivery details
  emailAddress: varchar("emailAddress", { length: 255 }).notNull(),
  language: mysqlEnum("language", ["en", "ar"]).notNull(),
  
  // Status tracking
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  emailStatus: mysqlEnum("emailStatus", ["queued", "sent", "delivered", "bounced", "failed"]).default("queued").notNull(),
  
  // External tracking
  sesMessageId: varchar("sesMessageId", { length: 255 }),
  
  // Error handling
  errorMessage: text("errorMessage"),
  retryCount: int("retryCount").default(0).notNull(),
  lastRetryAt: timestamp("lastRetryAt"),
}, (table) => ({
  reportIdx: index("distribution_report_idx").on(table.reportId),
  subscriberIdx: index("distribution_subscriber_idx").on(table.subscriberId),
  statusIdx: index("distribution_status_idx").on(table.emailStatus),
  sentIdx: index("distribution_sent_idx").on(table.sentAt),
}));

export type ReportDistributionLog = typeof reportDistributionLog.$inferSelect;
export type InsertReportDistributionLog = typeof reportDistributionLog.$inferInsert;

/**
 * Report Generation Schedule - Tracks scheduled report generation jobs
 */
export const reportSchedule = mysqlTable("report_schedule", {
  id: int("id").autoincrement().primaryKey(),
  templateId: int("templateId").notNull().references(() => reportTemplates.id),
  
  // Schedule configuration
  cronExpression: varchar("cronExpression", { length: 100 }).notNull(), // e.g., "0 0 1 1,4,7,10 *" for quarterly
  timezone: varchar("timezone", { length: 50 }).default("UTC").notNull(),
  
  // Next run
  nextRunAt: timestamp("nextRunAt").notNull(),
  lastRunAt: timestamp("lastRunAt"),
  lastRunStatus: mysqlEnum("lastRunStatus", ["success", "failed", "skipped"]),
  
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  templateIdx: index("schedule_template_idx").on(table.templateId),
  nextRunIdx: index("schedule_next_run_idx").on(table.nextRunAt),
}));

export type ReportSchedule = typeof reportSchedule.$inferSelect;
export type InsertReportSchedule = typeof reportSchedule.$inferInsert;


// ============================================================================
// EVIDENCE TRIBUNAL - EVIDENCE PACKS (PROMPT 2/3)
// ============================================================================

/**
 * Evidence Packs - Canonical schema for all evidence in the system
 * Every KPI, chart, table cell, report paragraph, and AI claim must have an evidence pack
 */
export const evidencePacks = mysqlTable("evidence_packs", {
  id: int("id").autoincrement().primaryKey(),
  
  // Subject reference - what this evidence pack is for
  subjectType: mysqlEnum("subjectType", [
    "metric", "series", "document", "claim", "alert", "report", "chart", "kpi", "table_cell"
  ]).notNull(),
  subjectId: varchar("subjectId", { length: 255 }).notNull(), // ID of the subject
  subjectLabel: varchar("subjectLabel", { length: 500 }), // Human-readable label
  
  // Citations array (JSON)
  citations: json("citations").$type<{
    sourceId: number;
    title: string;
    publisher: string;
    url?: string;
    retrievalDate: string;
    licenseFlag: string;
    anchor?: string; // page/section/table reference
    rawObjectRef?: string; // S3 key or internal URI
  }[]>().notNull(),
  
  // Transforms array (JSON)
  transforms: json("transforms").$type<{
    formula?: string;
    parameters?: Record<string, unknown>;
    codeRef?: string;
    assumptions?: string[];
    description?: string;
  }[]>(),
  
  // Geographic and temporal scope
  regimeTags: json("regimeTags").$type<string[]>().notNull(), // ["aden_irg", "sanaa_defacto", etc.]
  geoScope: varchar("geoScope", { length: 255 }).notNull(), // "National", "Aden", "Sana'a", etc.
  timeCoverageStart: timestamp("timeCoverageStart"),
  timeCoverageEnd: timestamp("timeCoverageEnd"),
  missingRanges: json("missingRanges").$type<{ start: string; end: string; reason?: string }[]>(),
  
  // Contradictions (if any)
  contradictions: json("contradictions").$type<{
    altSourceId: number;
    altSourceName: string;
    altValue: string;
    ourValue: string;
    methodNotes?: string;
    whyDifferent?: string;
  }[]>(),
  hasContradictions: boolean("hasContradictions").default(false).notNull(),
  
  // DQAF Quality Panel (5 dimensions)
  dqafIntegrity: mysqlEnum("dqafIntegrity", ["pass", "needs_review", "unknown"]).default("unknown").notNull(),
  dqafMethodology: mysqlEnum("dqafMethodology", ["pass", "needs_review", "unknown"]).default("unknown").notNull(),
  dqafAccuracyReliability: mysqlEnum("dqafAccuracyReliability", ["pass", "needs_review", "unknown"]).default("unknown").notNull(),
  dqafServiceability: mysqlEnum("dqafServiceability", ["pass", "needs_review", "unknown"]).default("unknown").notNull(),
  dqafAccessibility: mysqlEnum("dqafAccessibility", ["pass", "needs_review", "unknown"]).default("unknown").notNull(),
  
  // Uncertainty
  uncertaintyInterval: varchar("uncertaintyInterval", { length: 100 }), // e.g., "±5%"
  uncertaintyNote: text("uncertaintyNote"), // "not published by source" if unknown
  
  // Confidence grade
  confidenceGrade: mysqlEnum("confidenceGrade", ["A", "B", "C", "D"]).notNull(),
  confidenceExplanation: text("confidenceExplanation").notNull(),
  
  // What would change this assessment
  whatWouldChange: json("whatWouldChange").$type<string[]>(),
  
  // Metadata
  promptVersion: varchar("promptVersion", { length: 50 }),
  modelVersion: varchar("modelVersion", { length: 50 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  subjectIdx: index("evidence_subject_idx").on(table.subjectType, table.subjectId),
  confidenceIdx: index("evidence_confidence_idx").on(table.confidenceGrade),
  contradictionsIdx: index("evidence_contradictions_idx").on(table.hasContradictions),
  createdAtIdx: index("evidence_created_idx").on(table.createdAt),
}));

export type EvidencePack = typeof evidencePacks.$inferSelect;
export type InsertEvidencePack = typeof evidencePacks.$inferInsert;

// ============================================================================
// EVIDENCE TRIBUNAL - DATASET VERSIONS (VINTAGES)
// ============================================================================

/**
 * Dataset Versions - Track every version/vintage of a dataset
 * Corrections append, never overwrite
 */
export const datasetVersions = mysqlTable("dataset_versions", {
  id: int("id").autoincrement().primaryKey(),
  datasetId: int("datasetId").notNull().references(() => datasets.id),
  
  // Version info
  versionNumber: int("versionNumber").notNull(),
  vintageDate: timestamp("vintageDate").notNull(), // "As of" date
  
  // Change tracking
  changeType: mysqlEnum("changeType", ["initial", "revision", "correction", "restatement", "methodology_change"]).notNull(),
  changeDescription: text("changeDescription"),
  changeSummary: json("changeSummary").$type<{
    recordsAdded: number;
    recordsModified: number;
    recordsDeleted: number;
    affectedIndicators: string[];
    affectedDateRange?: { start: string; end: string };
  }>(),
  
  // Diff storage (S3)
  diffFileKey: varchar("diffFileKey", { length: 512 }),
  diffFileUrl: text("diffFileUrl"),
  
  // Snapshot storage (S3)
  snapshotFileKey: varchar("snapshotFileKey", { length: 512 }),
  snapshotFileUrl: text("snapshotFileUrl"),
  
  // Metadata
  sourceId: int("sourceId").references(() => sources.id),
  confidenceRating: mysqlEnum("confidenceRating", ["A", "B", "C", "D"]),
  
  // Audit
  createdBy: int("createdBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  datasetIdx: index("version_dataset_idx").on(table.datasetId),
  vintageDateIdx: index("version_vintage_idx").on(table.vintageDate),
  versionNumberIdx: index("version_number_idx").on(table.datasetId, table.versionNumber),
}));

export type DatasetVersion = typeof datasetVersions.$inferSelect;
export type InsertDatasetVersion = typeof datasetVersions.$inferInsert;

// Note: ingestionRuns table already exists above - using existing definition
// Extended fields for provenance chain tracking are handled via the existing table

// ============================================================================
// EVIDENCE TRIBUNAL - EXPORT MANIFESTS
// ============================================================================

/**
 * Export Manifests - Track every export with full evidence
 * Every export writes: manifest.json, evidence_pack.json, license_summary.json
 */
export const exportManifests = mysqlTable("export_manifests", {
  id: int("id").autoincrement().primaryKey(),
  
  // Export info
  exportType: mysqlEnum("exportType", ["csv", "json", "xlsx", "pdf", "png", "svg", "markdown"]).notNull(),
  exportName: varchar("exportName", { length: 255 }).notNull(),
  
  // User and context
  userId: int("userId").references(() => users.id),
  userRole: varchar("userRole", { length: 50 }),
  sessionId: varchar("sessionId", { length: 255 }),
  
  // Filters applied
  filters: json("filters").$type<{
    indicators?: string[];
    regimeTags?: string[];
    dateRange?: { start: string; end: string };
    geoScope?: string[];
    confidenceMin?: string;
    [key: string]: unknown;
  }>(),
  
  // S3 storage - main export file
  exportFileKey: varchar("exportFileKey", { length: 512 }).notNull(),
  exportFileUrl: text("exportFileUrl").notNull(),
  exportFileSize: int("exportFileSize"),
  
  // S3 storage - manifest.json
  manifestFileKey: varchar("manifestFileKey", { length: 512 }).notNull(),
  manifestFileUrl: text("manifestFileUrl").notNull(),
  
  // S3 storage - evidence_pack.json
  evidencePackFileKey: varchar("evidencePackFileKey", { length: 512 }).notNull(),
  evidencePackFileUrl: text("evidencePackFileUrl").notNull(),
  
  // S3 storage - license_summary.json
  licenseSummaryFileKey: varchar("licenseSummaryFileKey", { length: 512 }).notNull(),
  licenseSummaryFileUrl: text("licenseSummaryFileUrl").notNull(),
  
  // Content summary
  dataCoverageWindow: json("dataCoverageWindow").$type<{ start: string; end: string }>(),
  recordCount: int("recordCount").notNull(),
  sourceCount: int("sourceCount").notNull(),
  evidencePackIds: json("evidencePackIds").$type<number[]>(),
  
  // Confidence and limitations
  overallConfidence: mysqlEnum("overallConfidence", ["A", "B", "C", "D"]),
  limitations: json("limitations").$type<string[]>(),
  
  // Signed URL expiry
  signedUrlExpiresAt: timestamp("signedUrlExpiresAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("export_user_idx").on(table.userId),
  exportTypeIdx: index("export_type_idx").on(table.exportType),
  createdAtIdx: index("export_created_idx").on(table.createdAt),
}));

export type ExportManifest = typeof exportManifests.$inferSelect;
export type InsertExportManifest = typeof exportManifests.$inferInsert;

// ============================================================================
// EVIDENCE TRIBUNAL - RELEASE GATE CHECKS
// ============================================================================

/**
 * Release Gate Checks - Track admin release gate validations
 * Block publish if any check fails
 */
export const releaseGateChecks = mysqlTable("release_gate_checks", {
  id: int("id").autoincrement().primaryKey(),
  
  // Check info
  checkName: varchar("checkName", { length: 100 }).notNull(),
  checkCategory: mysqlEnum("checkCategory", [
    "evidence_coverage", "placeholder_scan", "contradiction_ui", "vintages", 
    "exports", "bilingual_parity", "security"
  ]).notNull(),
  
  // Result
  status: mysqlEnum("status", ["pass", "fail", "warning", "skipped"]).notNull(),
  score: int("score"), // 0-100 where applicable
  threshold: int("threshold"), // Required score to pass
  
  // Details
  details: json("details").$type<{
    itemsChecked: number;
    itemsPassed: number;
    itemsFailed: number;
    failures?: { item: string; reason: string }[];
    warnings?: { item: string; reason: string }[];
  }>(),
  
  // Messages
  message: text("message"),
  recommendation: text("recommendation"),
  
  // Run context
  runId: varchar("runId", { length: 64 }).notNull(), // UUID for the gate check run
  runAt: timestamp("runAt").defaultNow().notNull(),
  runBy: int("runBy").references(() => users.id),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  runIdIdx: index("gate_run_idx").on(table.runId),
  checkNameIdx: index("gate_check_name_idx").on(table.checkName),
  statusIdx: index("gate_status_idx").on(table.status),
  runAtIdx: index("gate_run_at_idx").on(table.runAt),
}));

export type ReleaseGateCheck = typeof releaseGateChecks.$inferSelect;
export type InsertReleaseGateCheck = typeof releaseGateChecks.$inferInsert;

/**
 * Release Gate Runs - Summary of each release gate validation run
 */
export const releaseGateRuns = mysqlTable("release_gate_runs", {
  id: int("id").autoincrement().primaryKey(),
  runId: varchar("runId", { length: 64 }).notNull().unique(), // UUID
  
  // Overall result
  overallStatus: mysqlEnum("overallStatus", ["pass", "fail"]).notNull(),
  checksTotal: int("checksTotal").notNull(),
  checksPassed: int("checksPassed").notNull(),
  checksFailed: int("checksFailed").notNull(),
  checksWarning: int("checksWarning").notNull(),
  
  // Blocking issues
  blockingIssues: json("blockingIssues").$type<string[]>(),
  
  // Timing
  startedAt: timestamp("startedAt").notNull(),
  completedAt: timestamp("completedAt"),
  durationMs: int("durationMs"),
  
  // Audit
  runBy: int("runBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  runIdIdx: index("gate_runs_run_idx").on(table.runId),
  statusIdx: index("gate_runs_status_idx").on(table.overallStatus),
  createdAtIdx: index("gate_runs_created_idx").on(table.createdAt),
}));

export type ReleaseGateRun = typeof releaseGateRuns.$inferSelect;
export type InsertReleaseGateRun = typeof releaseGateRuns.$inferInsert;


// ============================================================================
// LIVING KNOWLEDGE SPINE (PROMPT 4/∞)
// ============================================================================

// TimeSpineDay: One record per day from 2010-01-01 to today (auto-extends daily)
export const timeSpineDay = mysqlTable("time_spine_day", {
  id: int("id").autoincrement().primaryKey(),
  day: date("day").notNull().unique(),
  dayOfWeek: int("dayOfWeek").notNull(), // 0-6 (Sunday-Saturday)
  weekNumber: int("weekNumber").notNull(),
  monthNumber: int("monthNumber").notNull(),
  quarterNumber: int("quarterNumber").notNull(),
  yearNumber: int("yearNumber").notNull(),
  
  // Regime context for that day
  regimeTag: mysqlEnum("regimeTag", ["aden", "sanaa", "national", "pre_split"]),
  geoScope: varchar("geoScope", { length: 100 }),
  
  // References (JSON arrays of IDs)
  eventRefs: json("eventRefs").$type<number[]>(),
  datasetRefs: json("datasetRefs").$type<number[]>(),
  docRefs: json("docRefs").$type<number[]>(),
  alerts: json("alerts").$type<{
    type: string;
    severity: string;
    message: string;
    messageAr: string;
  }[]>(),
  notes: text("notes"),
  notesAr: text("notesAr"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  dayIdx: index("time_spine_day_idx").on(table.day),
  yearIdx: index("time_spine_year_idx").on(table.yearNumber),
  regimeIdx: index("time_spine_regime_idx").on(table.regimeTag),
}));

export type TimeSpineDay = typeof timeSpineDay.$inferSelect;
export type InsertTimeSpineDay = typeof timeSpineDay.$inferInsert;

// EntitySpine: Stakeholder entities (WB, IMF, EU, OCHA, UN agencies, CBY branches, etc.)
export const entitySpine = mysqlTable("entity_spine", {
  id: int("id").autoincrement().primaryKey(),
  entityCode: varchar("entityCode", { length: 50 }).notNull().unique(),
  nameEn: varchar("nameEn", { length: 255 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }),
  
  // Entity type
  entityType: mysqlEnum("entityType", [
    "international_org",
    "un_agency",
    "development_bank",
    "bilateral_donor",
    "central_bank",
    "ministry",
    "local_ngo",
    "international_ngo",
    "private_bank",
    "microfinance",
    "chamber_of_commerce",
    "think_tank",
    "research_institution",
    "media_outlet",
    "other"
  ]).notNull(),
  
  // Affiliation
  regimeAffiliation: mysqlEnum("regimeAffiliation", ["aden", "sanaa", "neutral", "international"]),
  countryCode: varchar("countryCode", { length: 3 }),
  
  // Contact and links
  website: text("website"),
  dataPortalUrl: text("dataPortalUrl"),
  apiEndpoint: text("apiEndpoint"),
  
  // Profile
  descriptionEn: text("descriptionEn"),
  descriptionAr: text("descriptionAr"),
  keyFunctions: json("keyFunctions").$type<string[]>(),
  keyPublications: json("keyPublications").$type<number[]>(),
  keyDatasets: json("keyDatasets").$type<number[]>(),
  
  // Data quality assessment
  reliabilityTier: mysqlEnum("reliabilityTier", ["tier1_official", "tier2_credible", "tier3_proxy", "tier4_disputed"]),
  lastVerified: timestamp("lastVerified"),
  verificationNotes: text("verificationNotes"),
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  codeIdx: index("entity_code_idx").on(table.entityCode),
  typeIdx: index("entity_type_idx").on(table.entityType),
  reliabilityIdx: index("entity_reliability_idx").on(table.reliabilityTier),
}));

export type EntitySpine = typeof entitySpine.$inferSelect;
export type InsertEntitySpine = typeof entitySpine.$inferInsert;

// SectorSpine: One per sector page with indicators, definitions, contradictions
export const sectorSpine = mysqlTable("sector_spine", {
  id: int("id").autoincrement().primaryKey(),
  sectorCode: varchar("sectorCode", { length: 50 }).notNull().unique(),
  nameEn: varchar("nameEn", { length: 255 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }),
  
  // Key indicators for this sector
  keyIndicators: json("keyIndicators").$type<{
    indicatorId: number;
    indicatorCode: string;
    nameEn: string;
    nameAr: string;
    importance: "primary" | "secondary" | "contextual";
  }[]>(),
  
  // Definitions and mechanisms
  definitionsEn: json("definitionsEn").$type<Record<string, string>>(),
  definitionsAr: json("definitionsAr").$type<Record<string, string>>(),
  mechanismsEn: text("mechanismsEn"),
  mechanismsAr: text("mechanismsAr"),
  
  // Key documents for this sector
  keyDocRefs: json("keyDocRefs").$type<number[]>(),
  
  // Known contradictions in this sector
  knownContradictions: json("knownContradictions").$type<{
    indicatorCode: string;
    sources: string[];
    description: string;
    descriptionAr: string;
    resolution: string;
  }[]>(),
  
  // Quality notes
  qualityNotes: text("qualityNotes"),
  qualityNotesAr: text("qualityNotesAr"),
  dataCoveragePercent: int("dataCoveragePercent"),
  lastQualityReview: timestamp("lastQualityReview"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  codeIdx: index("sector_code_idx").on(table.sectorCode),
}));

export type SectorSpine = typeof sectorSpine.$inferSelect;
export type InsertSectorSpine = typeof sectorSpine.$inferInsert;

// PolicyEventSpine: Key events timeline with citations
export const policyEventSpine = mysqlTable("policy_event_spine", {
  id: int("id").autoincrement().primaryKey(),
  eventCode: varchar("eventCode", { length: 100 }).notNull().unique(),
  
  // Event details
  titleEn: varchar("titleEn", { length: 500 }).notNull(),
  titleAr: varchar("titleAr", { length: 500 }),
  descriptionEn: text("descriptionEn"),
  descriptionAr: text("descriptionAr"),
  
  // Timing
  eventDate: date("eventDate").notNull(),
  eventEndDate: date("eventEndDate"), // For events spanning multiple days
  precision: mysqlEnum("precision", ["exact", "month", "quarter", "year"]).default("exact"),
  
  // Classification
  eventType: mysqlEnum("eventType", [
    "policy_change",
    "central_bank_action",
    "fiscal_measure",
    "conflict_event",
    "humanitarian_crisis",
    "international_intervention",
    "sanctions_action",
    "market_event",
    "political_event",
    "natural_disaster",
    "infrastructure_event",
    "other"
  ]).notNull(),
  
  // Impact
  impactSectors: json("impactSectors").$type<string[]>(),
  impactRegimes: json("impactRegimes").$type<("aden" | "sanaa" | "national")[]>(),
  impactSeverity: mysqlEnum("impactSeverity", ["low", "medium", "high", "critical"]),
  
  // Citations (REQUIRED)
  citations: json("citations").$type<{
    sourceId: number;
    sourceType: string;
    url: string;
    accessDate: string;
    quote?: string;
  }[]>().notNull(),
  
  // Related data
  relatedIndicators: json("relatedIndicators").$type<number[]>(),
  relatedDocuments: json("relatedDocuments").$type<number[]>(),
  
  // Verification
  verificationStatus: mysqlEnum("verificationStatus", ["unverified", "verified", "disputed"]).default("unverified"),
  verifiedBy: int("verifiedBy").references(() => users.id),
  verifiedAt: timestamp("verifiedAt"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  codeIdx: index("event_code_idx").on(table.eventCode),
  dateIdx: index("event_date_idx").on(table.eventDate),
  typeIdx: index("event_type_idx").on(table.eventType),
}));

export type PolicyEventSpine = typeof policyEventSpine.$inferSelect;
export type InsertPolicyEventSpine = typeof policyEventSpine.$inferInsert;

// PublicationSpine: All system-generated briefs/reports + their evidence appendices
export const publicationSpine = mysqlTable("publication_spine", {
  id: int("id").autoincrement().primaryKey(),
  publicationCode: varchar("publicationCode", { length: 100 }).notNull().unique(),
  
  // Publication details
  titleEn: varchar("titleEn", { length: 500 }).notNull(),
  titleAr: varchar("titleAr", { length: 500 }),
  abstractEn: text("abstractEn"),
  abstractAr: text("abstractAr"),
  
  // Type and status
  publicationType: mysqlEnum("publicationType", [
    "daily_brief",
    "weekly_digest",
    "monthly_report",
    "quarterly_outlook",
    "annual_review",
    "sector_analysis",
    "special_report",
    "data_release",
    "methodology_note",
    "correction_notice"
  ]).notNull(),
  status: mysqlEnum("status", ["draft", "review", "approved", "published", "archived"]).default("draft"),
  
  // Content files
  contentEnUrl: text("contentEnUrl"),
  contentArUrl: text("contentArUrl"),
  contentEnFileKey: varchar("contentEnFileKey", { length: 255 }),
  contentArFileKey: varchar("contentArFileKey", { length: 255 }),
  
  // Evidence appendix (REQUIRED for published)
  evidencePackId: int("evidencePackId").references(() => evidencePacks.id),
  evidenceAppendixUrl: text("evidenceAppendixUrl"),
  citationCount: int("citationCount").default(0),
  
  // Coverage
  coveragePeriodStart: date("coveragePeriodStart"),
  coveragePeriodEnd: date("coveragePeriodEnd"),
  sectors: json("sectors").$type<string[]>(),
  regimes: json("regimes").$type<("aden" | "sanaa" | "national")[]>(),
  
  // Quality
  confidenceGrade: mysqlEnum("confidenceGrade", ["A", "B", "C", "D"]),
  tribunalApproved: boolean("tribunalApproved").default(false),
  tribunalApprovedAt: timestamp("tribunalApprovedAt"),
  tribunalNotes: text("tribunalNotes"),
  
  // Publishing
  publishedAt: timestamp("publishedAt"),
  publishedBy: int("publishedBy").references(() => users.id),
  version: int("version").default(1).notNull(),
  
  // Engagement
  viewCount: int("viewCount").default(0),
  downloadCount: int("downloadCount").default(0),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  codeIdx: index("pub_code_idx").on(table.publicationCode),
  typeIdx: index("pub_type_idx").on(table.publicationType),
  statusIdx: index("pub_status_idx").on(table.status),
  publishedIdx: index("pub_published_idx").on(table.publishedAt),
}));

export type PublicationSpine = typeof publicationSpine.$inferSelect;
export type InsertPublicationSpine = typeof publicationSpine.$inferInsert;

// ============================================================================
// CONTINUOUS LEARNING & EVAL HARNESS (PROMPT 4/∞)
// ============================================================================

// Context Packs: Nightly build artifacts for agent context
export const contextPacks = mysqlTable("context_packs", {
  id: int("id").autoincrement().primaryKey(),
  packCode: varchar("packCode", { length: 100 }).notNull(),
  packDate: date("packDate").notNull(),
  
  // Pack type
  packType: mysqlEnum("packType", ["global", "sector", "role", "entity"]).notNull(),
  targetCode: varchar("targetCode", { length: 100 }), // sector code, role code, or entity code
  
  // Content hash for verification
  contentHash: varchar("contentHash", { length: 64 }).notNull(),
  
  // Storage
  s3Key: varchar("s3Key", { length: 255 }).notNull(),
  s3Url: text("s3Url"),
  fileSizeBytes: int("fileSizeBytes"),
  
  // Content summary
  topIndicatorsCount: int("topIndicatorsCount"),
  eventsCount: int("eventsCount"),
  contradictionsCount: int("contradictionsCount"),
  gapsCount: int("gapsCount"),
  glossaryDeltasCount: int("glossaryDeltasCount"),
  
  // Metadata
  generatedAt: timestamp("generatedAt").notNull(),
  generationDurationMs: int("generationDurationMs"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  packCodeIdx: index("pack_code_idx").on(table.packCode),
  packDateIdx: index("pack_date_idx").on(table.packDate),
  packTypeIdx: index("pack_type_idx").on(table.packType),
}));

export type ContextPack = typeof contextPacks.$inferSelect;
export type InsertContextPack = typeof contextPacks.$inferInsert;

// Eval Runs: Track evaluation suite executions
export const evalRuns = mysqlTable("eval_runs", {
  id: int("id").autoincrement().primaryKey(),
  runId: varchar("runId", { length: 100 }).notNull().unique(),
  
  // Run type
  evalType: mysqlEnum("evalType", ["retrieval", "generation", "citation", "skills", "regression"]).notNull(),
  targetScope: varchar("targetScope", { length: 100 }), // role, sector, or global
  
  // Results
  totalTests: int("totalTests").notNull(),
  passedTests: int("passedTests").notNull(),
  failedTests: int("failedTests").notNull(),
  skippedTests: int("skippedTests").default(0),
  
  // Metrics
  recallAtK: decimal("recallAtK", { precision: 5, scale: 4 }),
  precisionAtK: decimal("precisionAtK", { precision: 5, scale: 4 }),
  ndcg: decimal("ndcg", { precision: 5, scale: 4 }),
  citationCoverage: decimal("citationCoverage", { precision: 5, scale: 4 }),
  
  // Baseline comparison
  baselineRunId: varchar("baselineRunId", { length: 100 }),
  isRegression: boolean("isRegression").default(false),
  regressionDetails: json("regressionDetails").$type<{
    metric: string;
    baseline: number;
    current: number;
    delta: number;
  }[]>(),
  
  // Report
  reportS3Key: varchar("reportS3Key", { length: 255 }),
  reportUrl: text("reportUrl"),
  
  // Timing
  startedAt: timestamp("startedAt").notNull(),
  completedAt: timestamp("completedAt"),
  durationMs: int("durationMs"),
  
  // Metadata
  triggeredBy: varchar("triggeredBy", { length: 100 }), // nightly, ci, manual
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  runIdIdx: index("eval_run_id_idx").on(table.runId),
  evalTypeIdx: index("eval_type_idx").on(table.evalType),
  createdAtIdx: index("eval_created_idx").on(table.createdAt),
}));

export type EvalRun = typeof evalRuns.$inferSelect;
export type InsertEvalRun = typeof evalRuns.$inferInsert;

// Drift Metrics: Track quality drift over time
export const driftMetrics = mysqlTable("drift_metrics", {
  id: int("id").autoincrement().primaryKey(),
  metricDate: date("metricDate").notNull(),
  
  // Drift type
  driftType: mysqlEnum("driftType", [
    "retrieval",
    "evidence",
    "translation",
    "dashboard",
    "model"
  ]).notNull(),
  
  // Metric values
  metricName: varchar("metricName", { length: 100 }).notNull(),
  metricValue: decimal("metricValue", { precision: 10, scale: 4 }).notNull(),
  previousValue: decimal("previousValue", { precision: 10, scale: 4 }),
  baselineValue: decimal("baselineValue", { precision: 10, scale: 4 }),
  
  // Threshold breach
  thresholdValue: decimal("thresholdValue", { precision: 10, scale: 4 }),
  isBreached: boolean("isBreached").default(false),
  breachSeverity: mysqlEnum("breachSeverity", ["warning", "critical"]),
  
  // Auto-generated ticket
  ticketId: int("ticketId"),
  
  // Details
  details: json("details").$type<Record<string, unknown>>(),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  dateIdx: index("drift_date_idx").on(table.metricDate),
  typeIdx: index("drift_type_idx").on(table.driftType),
  breachedIdx: index("drift_breached_idx").on(table.isBreached),
}));

export type DriftMetric = typeof driftMetrics.$inferSelect;
export type InsertDriftMetric = typeof driftMetrics.$inferInsert;

// ============================================================================
// TEAMWORK ENGINE (PROMPT 4/∞)
// ============================================================================

// Agent Tasks: Track agent task assignments and handoffs
export const agentTasks = mysqlTable("agent_tasks", {
  id: int("id").autoincrement().primaryKey(),
  taskId: varchar("taskId", { length: 100 }).notNull().unique(),
  
  // Task details
  taskType: varchar("taskType", { length: 100 }).notNull(),
  description: text("description"),
  inputData: json("inputData").$type<Record<string, unknown>>(),
  
  // Orchestration
  orchestrationPattern: mysqlEnum("orchestrationPattern", [
    "planner_specialists_verifier",
    "parallel_merge_tribunal",
    "sequential_handoff",
    "peer_review"
  ]).notNull(),
  
  // Assignment
  assignedAgents: json("assignedAgents").$type<{
    agentCode: string;
    role: string;
    order: number;
    status: "pending" | "in_progress" | "completed" | "failed";
    startedAt?: string;
    completedAt?: string;
    output?: Record<string, unknown>;
  }[]>(),
  
  // Status
  status: mysqlEnum("status", ["pending", "in_progress", "review", "tribunal", "completed", "failed"]).default("pending"),
  currentAgentCode: varchar("currentAgentCode", { length: 50 }),
  
  // Tribunal gate
  requiresTribunal: boolean("requiresTribunal").default(true),
  tribunalStatus: mysqlEnum("tribunalStatus", ["pending", "passed", "failed", "appealed"]),
  tribunalVotes: json("tribunalVotes").$type<{
    agentCode: string;
    vote: "pass" | "fail" | "abstain";
    reason: string;
    timestamp: string;
  }[]>(),
  
  // Output
  finalOutput: json("finalOutput").$type<Record<string, unknown>>(),
  outputQuality: decimal("outputQuality", { precision: 5, scale: 4 }),
  citationCoverage: decimal("citationCoverage", { precision: 5, scale: 4 }),
  
  // Timing
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  durationMs: int("durationMs"),
}, (table) => ({
  taskIdIdx: index("task_id_idx").on(table.taskId),
  statusIdx: index("task_status_idx").on(table.status),
  tribunalIdx: index("task_tribunal_idx").on(table.tribunalStatus),
}));

export type AgentTask = typeof agentTasks.$inferSelect;
export type InsertAgentTask = typeof agentTasks.$inferInsert;

// Nightly Job Runs: Track nightly job executions
export const nightlyJobRuns = mysqlTable("nightly_job_runs", {
  id: int("id").autoincrement().primaryKey(),
  runId: varchar("runId", { length: 100 }).notNull().unique(),
  runDate: date("runDate").notNull(),
  
  // Job steps status
  connectorsStatus: mysqlEnum("connectorsStatus", ["pending", "running", "completed", "failed"]).default("pending"),
  connectorsDetails: json("connectorsDetails").$type<{
    connector: string;
    status: string;
    recordsProcessed: number;
    errors: string[];
  }[]>(),
  
  indexingStatus: mysqlEnum("indexingStatus", ["pending", "running", "completed", "failed"]).default("pending"),
  indexingDetails: json("indexingDetails").$type<{
    indexType: string;
    documentsIndexed: number;
    durationMs: number;
  }[]>(),
  
  contextPacksStatus: mysqlEnum("contextPacksStatus", ["pending", "running", "completed", "failed"]).default("pending"),
  contextPacksGenerated: int("contextPacksGenerated").default(0),
  
  evalsStatus: mysqlEnum("evalsStatus", ["pending", "running", "completed", "failed"]).default("pending"),
  evalRunId: varchar("evalRunId", { length: 100 }),
  
  driftStatus: mysqlEnum("driftStatus", ["pending", "running", "completed", "failed"]).default("pending"),
  driftBreaches: int("driftBreaches").default(0),
  
  // Overall status
  overallStatus: mysqlEnum("overallStatus", ["pending", "running", "completed", "partial", "failed"]).default("pending"),
  
  // Admin digest
  digestEnUrl: text("digestEnUrl"),
  digestArUrl: text("digestArUrl"),
  digestSentAt: timestamp("digestSentAt"),
  
  // Summary metrics
  evidenceCoveragePercent: decimal("evidenceCoveragePercent", { precision: 5, scale: 2 }),
  newContradictions: int("newContradictions").default(0),
  alertsGenerated: int("alertsGenerated").default(0),
  ticketsCreated: int("ticketsCreated").default(0),
  
  // Timing
  startedAt: timestamp("startedAt").notNull(),
  completedAt: timestamp("completedAt"),
  durationMs: int("durationMs"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  runIdIdx: index("nightly_run_id_idx").on(table.runId),
  runDateIdx: index("nightly_run_date_idx").on(table.runDate),
  statusIdx: index("nightly_status_idx").on(table.overallStatus),
}));

export type NightlyJobRun = typeof nightlyJobRuns.$inferSelect;
export type InsertNightlyJobRun = typeof nightlyJobRuns.$inferInsert;

// Prompt Versions: Track prompt versioning for regression tests
export const promptVersions = mysqlTable("prompt_versions", {
  id: int("id").autoincrement().primaryKey(),
  promptCode: varchar("promptCode", { length: 100 }).notNull(),
  version: varchar("version", { length: 20 }).notNull(), // Semantic version
  
  // Content
  promptContent: text("promptContent").notNull(),
  contentHash: varchar("contentHash", { length: 64 }).notNull(),
  
  // Target
  agentCode: varchar("agentCode", { length: 50 }),
  roleCode: varchar("roleCode", { length: 50 }),
  sectorCode: varchar("sectorCode", { length: 50 }),
  
  // Status
  status: mysqlEnum("status", ["draft", "testing", "baseline", "active", "deprecated"]).default("draft"),
  
  // Eval results
  lastEvalRunId: varchar("lastEvalRunId", { length: 100 }),
  evalScore: decimal("evalScore", { precision: 5, scale: 4 }),
  isRegressing: boolean("isRegressing").default(false),
  
  // Promotion
  promotedAt: timestamp("promotedAt"),
  promotedBy: int("promotedBy").references(() => users.id),
  promotionNotes: text("promotionNotes"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  promptCodeIdx: index("prompt_code_idx").on(table.promptCode),
  versionIdx: index("prompt_version_idx").on(table.version),
  statusIdx: index("prompt_status_idx").on(table.status),
}));

export type PromptVersion = typeof promptVersions.$inferSelect;
export type InsertPromptVersion = typeof promptVersions.$inferInsert;


// ============================================================================
// VIP COCKPITS (ROLELENS) - PROMPT 7/∞
// ============================================================================

/**
 * VIP Cockpit System: Role-based decision support dashboards
 * 
 * 5-Part Decision Support Structure:
 * 1. What Changed - Key signals and changes since last update
 * 2. Why - Drivers with evidence and citations
 * 3. Options - Possible actions with tradeoffs
 * 4. What to Do Next - Prioritized recommendations
 * 5. Confidence Level - Data quality and coverage assessment
 */

// VIP Role Profiles: Define stakeholder roles and their focus areas
export const vipRoleProfiles = mysqlTable("vip_role_profiles", {
  id: int("id").autoincrement().primaryKey(),
  roleCode: varchar("roleCode", { length: 50 }).notNull().unique(), // e.g., "vip_president", "vip_finance_minister"
  roleName: varchar("roleName", { length: 255 }).notNull(),
  roleNameAr: varchar("roleNameAr", { length: 255 }).notNull(),
  roleDescription: text("roleDescription"),
  roleDescriptionAr: text("roleDescriptionAr"),
  
  // Focus configuration
  primarySectors: json("primarySectors").$type<string[]>(), // Sectors this role cares about
  primaryIndicators: json("primaryIndicators").$type<string[]>(), // Key indicators to track
  primaryEntities: json("primaryEntities").$type<string[]>(), // Entities to watch
  regimeFocus: mysqlEnum("regimeFocus", ["IRG", "DFA", "both"]).default("both"),
  timeHorizon: mysqlEnum("timeHorizon", ["short", "medium", "long", "all"]).default("all"),
  
  // Dashboard configuration
  dashboardLayout: json("dashboardLayout").$type<Record<string, unknown>>(), // Custom layout config
  alertThresholds: json("alertThresholds").$type<Record<string, number>>(), // Custom alert levels
  
  // Access control
  requiredRole: mysqlEnum("requiredRole", ["user", "admin", "editor", "viewer", "analyst", "partner_contributor"]).default("analyst"),
  isActive: boolean("isActive").default(true),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  roleCodeIdx: index("vip_role_code_idx").on(table.roleCode),
  activeIdx: index("vip_active_idx").on(table.isActive),
}));

export type VIPRoleProfile = typeof vipRoleProfiles.$inferSelect;
export type InsertVIPRoleProfile = typeof vipRoleProfiles.$inferInsert;

// VIP User Assignments: Map users to VIP roles
export const vipUserAssignments = mysqlTable("vip_user_assignments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  roleProfileId: int("roleProfileId").notNull().references(() => vipRoleProfiles.id),
  
  // Customization
  customWatchlist: json("customWatchlist").$type<string[]>(), // User's custom watchlist items
  customAlertThresholds: json("customAlertThresholds").$type<Record<string, number>>(),
  notificationPreferences: json("notificationPreferences").$type<Record<string, boolean>>(),
  
  // Status
  isActive: boolean("isActive").default(true),
  lastAccessedAt: timestamp("lastAccessedAt"),
  
  // Metadata
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
  assignedBy: int("assignedBy").references(() => users.id),
}, (table) => ({
  userIdx: index("vip_user_idx").on(table.userId),
  roleIdx: index("vip_role_profile_idx").on(table.roleProfileId),
  userRoleIdx: index("vip_user_role_idx").on(table.userId, table.roleProfileId),
}));

export type VIPUserAssignment = typeof vipUserAssignments.$inferSelect;
export type InsertVIPUserAssignment = typeof vipUserAssignments.$inferInsert;

// VIP Cockpit Signals: Real-time signals for cockpit displays
export const vipCockpitSignals = mysqlTable("vip_cockpit_signals", {
  id: int("id").autoincrement().primaryKey(),
  roleProfileId: int("roleProfileId").notNull().references(() => vipRoleProfiles.id),
  
  // Signal identification
  signalCode: varchar("signalCode", { length: 100 }).notNull(),
  indicatorCode: varchar("indicatorCode", { length: 100 }),
  indicatorName: varchar("indicatorName", { length: 255 }).notNull(),
  indicatorNameAr: varchar("indicatorNameAr", { length: 255 }).notNull(),
  
  // Current values
  currentValue: decimal("currentValue", { precision: 20, scale: 4 }),
  previousValue: decimal("previousValue", { precision: 20, scale: 4 }),
  unit: varchar("unit", { length: 50 }),
  
  // Change metrics
  change: decimal("change", { precision: 20, scale: 4 }),
  changePercent: decimal("changePercent", { precision: 10, scale: 4 }),
  trend: mysqlEnum("trend", ["up", "down", "stable"]).default("stable"),
  
  // Status
  status: mysqlEnum("status", ["normal", "warning", "critical"]).default("normal"),
  significance: mysqlEnum("significance", ["high", "medium", "low"]).default("medium"),
  
  // Evidence
  evidencePackId: int("evidencePackId").references(() => evidencePacks.id),
  
  // Timing
  periodStart: timestamp("periodStart"),
  periodEnd: timestamp("periodEnd"),
  lastUpdatedAt: timestamp("lastUpdatedAt").defaultNow().notNull(),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  roleIdx: index("signal_role_idx").on(table.roleProfileId),
  signalCodeIdx: index("signal_code_idx").on(table.signalCode),
  statusIdx: index("signal_status_idx").on(table.status),
  updatedIdx: index("signal_updated_idx").on(table.lastUpdatedAt),
}));

export type VIPCockpitSignal = typeof vipCockpitSignals.$inferSelect;
export type InsertVIPCockpitSignal = typeof vipCockpitSignals.$inferInsert;

// VIP Cockpit Drivers: Explanatory factors for changes
export const vipCockpitDrivers = mysqlTable("vip_cockpit_drivers", {
  id: int("id").autoincrement().primaryKey(),
  roleProfileId: int("roleProfileId").notNull().references(() => vipRoleProfiles.id),
  signalId: int("signalId").references(() => vipCockpitSignals.id),
  
  // Driver identification
  driverCode: varchar("driverCode", { length: 100 }).notNull(),
  factor: varchar("factor", { length: 255 }).notNull(),
  factorAr: varchar("factorAr", { length: 255 }).notNull(),
  
  // Impact assessment
  impact: mysqlEnum("impact", ["positive", "negative", "mixed"]).default("mixed"),
  confidence: mysqlEnum("confidence", ["high", "medium", "low"]).default("medium"),
  
  // Explanation
  explanation: text("explanation").notNull(),
  explanationAr: text("explanationAr").notNull(),
  
  // Evidence
  evidencePackId: int("evidencePackId").references(() => evidencePacks.id),
  citations: json("citations").$type<string[]>(),
  
  // Timing
  identifiedAt: timestamp("identifiedAt").defaultNow().notNull(),
  validUntil: timestamp("validUntil"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  roleIdx: index("driver_role_idx").on(table.roleProfileId),
  signalIdx: index("driver_signal_idx").on(table.signalId),
  driverCodeIdx: index("driver_code_idx").on(table.driverCode),
}));

export type VIPCockpitDriver = typeof vipCockpitDrivers.$inferSelect;
export type InsertVIPCockpitDriver = typeof vipCockpitDrivers.$inferInsert;

// VIP Cockpit Options: Policy/action options with tradeoffs
export const vipCockpitOptions = mysqlTable("vip_cockpit_options", {
  id: int("id").autoincrement().primaryKey(),
  roleProfileId: int("roleProfileId").notNull().references(() => vipRoleProfiles.id),
  
  // Option identification
  optionCode: varchar("optionCode", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }).notNull(),
  
  // Description
  mechanism: text("mechanism").notNull(),
  mechanismAr: text("mechanismAr").notNull(),
  
  // Requirements
  preconditions: json("preconditions").$type<string[]>(),
  preconditionsAr: json("preconditionsAr").$type<string[]>(),
  
  // Risks
  risks: json("risks").$type<string[]>(),
  risksAr: json("risksAr").$type<string[]>(),
  
  // Assessment
  timeframe: varchar("timeframe", { length: 50 }),
  confidence: mysqlEnum("confidence", ["high", "medium", "low"]).default("medium"),
  priority: int("priority").default(0),
  
  // Evidence
  evidencePackId: int("evidencePackId").references(() => evidencePacks.id),
  
  // Status
  status: mysqlEnum("status", ["active", "implemented", "rejected", "expired"]).default("active"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  roleIdx: index("option_role_idx").on(table.roleProfileId),
  optionCodeIdx: index("option_code_idx").on(table.optionCode),
  statusIdx: index("option_status_idx").on(table.status),
}));

export type VIPCockpitOption = typeof vipCockpitOptions.$inferSelect;
export type InsertVIPCockpitOption = typeof vipCockpitOptions.$inferInsert;

// VIP Watchlist Items: Items being monitored by VIP users
export const vipWatchlistItems = mysqlTable("vip_watchlist_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  roleProfileId: int("roleProfileId").references(() => vipRoleProfiles.id),
  
  // Item identification
  itemType: mysqlEnum("itemType", ["indicator", "entity", "event", "sector"]).notNull(),
  itemCode: varchar("itemCode", { length: 100 }).notNull(),
  itemName: varchar("itemName", { length: 255 }).notNull(),
  itemNameAr: varchar("itemNameAr", { length: 255 }).notNull(),
  
  // Current status
  status: mysqlEnum("status", ["normal", "warning", "critical"]).default("normal"),
  currentValue: decimal("currentValue", { precision: 20, scale: 4 }),
  
  // Change tracking
  change7d: decimal("change7d", { precision: 10, scale: 4 }),
  change30d: decimal("change30d", { precision: 10, scale: 4 }),
  change90d: decimal("change90d", { precision: 10, scale: 4 }),
  
  // Alert configuration
  alertThreshold: decimal("alertThreshold", { precision: 10, scale: 4 }),
  alertDirection: mysqlEnum("alertDirection", ["above", "below", "both"]).default("both"),
  lastAlertAt: timestamp("lastAlertAt"),
  
  // Evidence
  evidencePackId: int("evidencePackId").references(() => evidencePacks.id),
  
  // Metadata
  addedAt: timestamp("addedAt").defaultNow().notNull(),
  lastCheckedAt: timestamp("lastCheckedAt"),
}, (table) => ({
  userIdx: index("watchlist_user_idx").on(table.userId),
  roleIdx: index("watchlist_role_idx").on(table.roleProfileId),
  itemTypeIdx: index("watchlist_type_idx").on(table.itemType),
  statusIdx: index("watchlist_status_idx").on(table.status),
}));

export type VIPWatchlistItem = typeof vipWatchlistItems.$inferSelect;
export type InsertVIPWatchlistItem = typeof vipWatchlistItems.$inferInsert;

// ============================================================================
// DECISION JOURNAL
// ============================================================================

// Decision Journal Entries: Track decisions made by VIP users
export const decisionJournalEntries = mysqlTable("decision_journal_entries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  roleProfileId: int("roleProfileId").references(() => vipRoleProfiles.id),
  
  // Decision identification
  decisionCode: varchar("decisionCode", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }),
  
  // Context at decision time
  contextSummary: text("contextSummary").notNull(), // What was the situation?
  contextSummaryAr: text("contextSummaryAr"),
  keySignals: json("keySignals").$type<string[]>(), // What signals influenced this?
  keyDrivers: json("keyDrivers").$type<string[]>(), // What drivers were considered?
  
  // The decision
  decision: text("decision").notNull(), // What was decided?
  decisionAr: text("decisionAr"),
  rationale: text("rationale").notNull(), // Why was this decided?
  rationaleAr: text("rationaleAr"),
  
  // Alternatives considered
  alternativesConsidered: json("alternativesConsidered").$type<Array<{
    title: string;
    titleAr?: string;
    whyRejected: string;
    whyRejectedAr?: string;
  }>>(),
  
  // Expected outcomes
  expectedOutcomes: json("expectedOutcomes").$type<Array<{
    outcome: string;
    outcomeAr?: string;
    metric?: string;
    targetValue?: number;
    timeframe?: string;
  }>>(),
  
  // Risk assessment at decision time
  identifiedRisks: json("identifiedRisks").$type<Array<{
    risk: string;
    riskAr?: string;
    likelihood: "high" | "medium" | "low";
    impact: "high" | "medium" | "low";
    mitigation?: string;
  }>>(),
  
  // Confidence
  confidenceLevel: mysqlEnum("confidenceLevel", ["high", "medium", "low"]).default("medium"),
  confidenceExplanation: text("confidenceExplanation"),
  
  // Evidence
  evidencePackId: int("evidencePackId").references(() => evidencePacks.id),
  supportingDocuments: json("supportingDocuments").$type<string[]>(),
  
  // Status
  status: mysqlEnum("status", ["draft", "active", "implemented", "abandoned", "superseded"]).default("draft"),
  
  // Timing
  decisionDate: timestamp("decisionDate").notNull(),
  implementationDeadline: timestamp("implementationDeadline"),
  reviewDate: timestamp("reviewDate"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("decision_user_idx").on(table.userId),
  roleIdx: index("decision_role_idx").on(table.roleProfileId),
  decisionCodeIdx: index("decision_code_idx").on(table.decisionCode),
  statusIdx: index("decision_status_idx").on(table.status),
  dateIdx: index("decision_date_idx").on(table.decisionDate),
}));

export type DecisionJournalEntry = typeof decisionJournalEntries.$inferSelect;
export type InsertDecisionJournalEntry = typeof decisionJournalEntries.$inferInsert;

// Decision Outcome Tracking: Track actual outcomes vs expected
export const decisionOutcomes = mysqlTable("decision_outcomes", {
  id: int("id").autoincrement().primaryKey(),
  decisionId: int("decisionId").notNull().references(() => decisionJournalEntries.id),
  
  // Outcome identification
  outcomeCode: varchar("outcomeCode", { length: 100 }).notNull(),
  expectedOutcomeIndex: int("expectedOutcomeIndex"), // Links to expectedOutcomes array
  
  // Actual outcome
  actualOutcome: text("actualOutcome").notNull(),
  actualOutcomeAr: text("actualOutcomeAr"),
  actualValue: decimal("actualValue", { precision: 20, scale: 4 }),
  
  // Assessment
  outcomeStatus: mysqlEnum("outcomeStatus", ["achieved", "partially_achieved", "not_achieved", "unexpected"]).default("partially_achieved"),
  variancePercent: decimal("variancePercent", { precision: 10, scale: 4 }),
  
  // Analysis
  analysisNotes: text("analysisNotes"),
  analysisNotesAr: text("analysisNotesAr"),
  lessonsLearned: text("lessonsLearned"),
  lessonsLearnedAr: text("lessonsLearnedAr"),
  
  // Evidence
  evidencePackId: int("evidencePackId").references(() => evidencePacks.id),
  
  // Timing
  observedAt: timestamp("observedAt").notNull(),
  
  // Metadata
  recordedBy: int("recordedBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  decisionIdx: index("outcome_decision_idx").on(table.decisionId),
  statusIdx: index("outcome_status_idx").on(table.outcomeStatus),
  observedIdx: index("outcome_observed_idx").on(table.observedAt),
}));

export type DecisionOutcome = typeof decisionOutcomes.$inferSelect;
export type InsertDecisionOutcome = typeof decisionOutcomes.$inferInsert;

// Decision Follow-ups: Track follow-up actions and reviews
export const decisionFollowUps = mysqlTable("decision_follow_ups", {
  id: int("id").autoincrement().primaryKey(),
  decisionId: int("decisionId").notNull().references(() => decisionJournalEntries.id),
  
  // Follow-up identification
  followUpType: mysqlEnum("followUpType", ["review", "action", "update", "escalation"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }),
  
  // Content
  description: text("description").notNull(),
  descriptionAr: text("descriptionAr"),
  
  // Assignment
  assignedTo: int("assignedTo").references(() => users.id),
  
  // Status
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "cancelled"]).default("pending"),
  priority: mysqlEnum("priority", ["high", "medium", "low"]).default("medium"),
  
  // Timing
  dueDate: timestamp("dueDate"),
  completedAt: timestamp("completedAt"),
  
  // Metadata
  createdBy: int("createdBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  decisionIdx: index("followup_decision_idx").on(table.decisionId),
  typeIdx: index("followup_type_idx").on(table.followUpType),
  statusIdx: index("followup_status_idx").on(table.status),
  dueIdx: index("followup_due_idx").on(table.dueDate),
}));

export type DecisionFollowUp = typeof decisionFollowUps.$inferSelect;
export type InsertDecisionFollowUp = typeof decisionFollowUps.$inferInsert;

// ============================================================================
// AUTO-BRIEFS
// ============================================================================

// Auto-Brief Templates: Define brief templates for different roles/frequencies
export const autoBriefTemplates = mysqlTable("auto_brief_templates", {
  id: int("id").autoincrement().primaryKey(),
  templateCode: varchar("templateCode", { length: 100 }).notNull().unique(),
  templateName: varchar("templateName", { length: 255 }).notNull(),
  templateNameAr: varchar("templateNameAr", { length: 255 }).notNull(),
  
  // Target
  roleProfileId: int("roleProfileId").references(() => vipRoleProfiles.id),
  frequency: mysqlEnum("frequency", ["daily", "weekly", "monthly", "on_demand"]).default("daily"),
  
  // Content configuration
  sections: json("sections").$type<Array<{
    sectionCode: string;
    title: string;
    titleAr: string;
    type: "signals" | "changes" | "drivers" | "options" | "watchlist" | "custom";
    config?: Record<string, unknown>;
    order: number;
  }>>(),
  
  // Delivery configuration
  deliveryChannels: json("deliveryChannels").$type<Array<"email" | "dashboard" | "api">>(),
  deliveryTime: varchar("deliveryTime", { length: 10 }), // HH:MM format
  timezone: varchar("timezone", { length: 50 }).default("Asia/Aden"),
  
  // Status
  isActive: boolean("isActive").default(true),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  templateCodeIdx: index("brief_template_code_idx").on(table.templateCode),
  roleIdx: index("brief_template_role_idx").on(table.roleProfileId),
  frequencyIdx: index("brief_template_freq_idx").on(table.frequency),
}));

export type AutoBriefTemplate = typeof autoBriefTemplates.$inferSelect;
export type InsertAutoBriefTemplate = typeof autoBriefTemplates.$inferInsert;

// Auto-Brief Instances: Generated brief instances
export const autoBriefInstances = mysqlTable("auto_brief_instances", {
  id: int("id").autoincrement().primaryKey(),
  templateId: int("templateId").notNull().references(() => autoBriefTemplates.id),
  userId: int("userId").references(() => users.id), // Null for role-wide briefs
  
  // Brief identification
  briefCode: varchar("briefCode", { length: 100 }).notNull().unique(),
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  
  // Content
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }).notNull(),
  executiveSummary: text("executiveSummary").notNull(),
  executiveSummaryAr: text("executiveSummaryAr").notNull(),
  
  // Sections content (JSON with rendered sections)
  sectionsContent: json("sectionsContent").$type<Array<{
    sectionCode: string;
    title: string;
    titleAr: string;
    content: string;
    contentAr: string;
    signalCount?: number;
    criticalCount?: number;
  }>>(),
  
  // Metrics
  totalSignals: int("totalSignals").default(0),
  criticalSignals: int("criticalSignals").default(0),
  warningSignals: int("warningSignals").default(0),
  newDrivers: int("newDrivers").default(0),
  activeOptions: int("activeOptions").default(0),
  
  // Evidence
  evidencePackIds: json("evidencePackIds").$type<number[]>(),
  
  // Delivery status
  deliveryStatus: mysqlEnum("deliveryStatus", ["pending", "sent", "failed", "read"]).default("pending"),
  sentAt: timestamp("sentAt"),
  readAt: timestamp("readAt"),
  
  // Generation metadata
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
  generationDurationMs: int("generationDurationMs"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  templateIdx: index("brief_instance_template_idx").on(table.templateId),
  userIdx: index("brief_instance_user_idx").on(table.userId),
  briefCodeIdx: index("brief_instance_code_idx").on(table.briefCode),
  periodIdx: index("brief_instance_period_idx").on(table.periodStart, table.periodEnd),
  statusIdx: index("brief_instance_status_idx").on(table.deliveryStatus),
}));

export type AutoBriefInstance = typeof autoBriefInstances.$inferSelect;
export type InsertAutoBriefInstance = typeof autoBriefInstances.$inferInsert;

// Auto-Brief Subscriptions: User subscriptions to briefs
export const autoBriefSubscriptions = mysqlTable("auto_brief_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  templateId: int("templateId").notNull().references(() => autoBriefTemplates.id),
  
  // Customization
  customDeliveryTime: varchar("customDeliveryTime", { length: 10 }),
  customTimezone: varchar("customTimezone", { length: 50 }),
  customSections: json("customSections").$type<string[]>(), // Override which sections to include
  
  // Delivery preferences
  emailEnabled: boolean("emailEnabled").default(true),
  dashboardEnabled: boolean("dashboardEnabled").default(true),
  
  // Status
  isActive: boolean("isActive").default(true),
  pausedUntil: timestamp("pausedUntil"),
  
  // Metadata
  subscribedAt: timestamp("subscribedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("brief_sub_user_idx").on(table.userId),
  templateIdx: index("brief_sub_template_idx").on(table.templateId),
  userTemplateIdx: index("brief_sub_user_template_idx").on(table.userId, table.templateId),
}));

export type AutoBriefSubscription = typeof autoBriefSubscriptions.$inferSelect;
export type InsertAutoBriefSubscription = typeof autoBriefSubscriptions.$inferInsert;

// ============================================================================
// VIP COCKPIT SNAPSHOTS (for historical comparison)
// ============================================================================

// Cockpit Snapshots: Daily snapshots of cockpit state for trend analysis
export const cockpitSnapshots = mysqlTable("cockpit_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  roleProfileId: int("roleProfileId").notNull().references(() => vipRoleProfiles.id),
  snapshotDate: timestamp("snapshotDate").notNull(),
  
  // Aggregated metrics
  totalSignals: int("totalSignals").default(0),
  criticalSignals: int("criticalSignals").default(0),
  warningSignals: int("warningSignals").default(0),
  normalSignals: int("normalSignals").default(0),
  
  // Coverage metrics
  overallCoverage: decimal("overallCoverage", { precision: 5, scale: 2 }),
  dataFreshness: decimal("dataFreshness", { precision: 5, scale: 2 }),
  contradictionCount: int("contradictionCount").default(0),
  gapCount: int("gapCount").default(0),
  
  // Snapshot data (full cockpit state)
  signalsSnapshot: json("signalsSnapshot").$type<unknown[]>(),
  driversSnapshot: json("driversSnapshot").$type<unknown[]>(),
  optionsSnapshot: json("optionsSnapshot").$type<unknown[]>(),
  watchlistSnapshot: json("watchlistSnapshot").$type<unknown[]>(),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  roleIdx: index("snapshot_role_idx").on(table.roleProfileId),
  dateIdx: index("snapshot_date_idx").on(table.snapshotDate),
  roleDateIdx: index("snapshot_role_date_idx").on(table.roleProfileId, table.snapshotDate),
}));

export type CockpitSnapshot = typeof cockpitSnapshots.$inferSelect;
export type InsertCockpitSnapshot = typeof cockpitSnapshots.$inferInsert;


// ============================================================================
// SECTOR INTELLIGENCE PRODUCTS (PROMPT 8/∞)
// ============================================================================

// Sector Definitions: Master configuration for each sector page
export const sectorDefinitions = mysqlTable("sector_definitions", {
  id: int("id").autoincrement().primaryKey(),
  sectorCode: varchar("sectorCode", { length: 50 }).notNull().unique(),
  
  // Display names
  nameEn: varchar("nameEn", { length: 255 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }).notNull(),
  
  // Mission statements (1-2 lines)
  missionEn: text("missionEn"),
  missionAr: text("missionAr"),
  
  // Navigation and ordering
  displayOrder: int("displayOrder").default(0),
  navLabelEn: varchar("navLabelEn", { length: 100 }),
  navLabelAr: varchar("navLabelAr", { length: 100 }),
  iconName: varchar("iconName", { length: 50 }), // Lucide icon name
  heroImageUrl: varchar("heroImageUrl", { length: 500 }),
  heroColor: varchar("heroColor", { length: 50 }), // Primary color for hero gradient
  
  // Flagship indicator (primary chart)
  flagshipIndicatorCode: varchar("flagshipIndicatorCode", { length: 100 }),
  
  // Core dataset list (what must exist for coverage)
  coreDatasets: json("coreDatasets").$type<{
    datasetCode: string;
    nameEn: string;
    nameAr: string;
    required: boolean;
    sourceId?: number;
  }[]>(),
  
  // Regime relevance
  hasRegimeSplit: boolean("hasRegimeSplit").default(false),
  defaultRegime: mysqlEnum("defaultRegime", ["both", "aden_irg", "sanaa_dfa"]).default("both"),
  
  // Status
  isActive: boolean("isActive").default(true),
  isPublished: boolean("isPublished").default(false),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  codeIdx: index("sector_def_code_idx").on(table.sectorCode),
  orderIdx: index("sector_def_order_idx").on(table.displayOrder),
}));

export type SectorDefinition = typeof sectorDefinitions.$inferSelect;
export type InsertSectorDefinition = typeof sectorDefinitions.$inferInsert;

// Sector KPIs: Top 5 KPIs for "Sector in 60 Seconds"
export const sectorKpis = mysqlTable("sector_kpis", {
  id: int("id").autoincrement().primaryKey(),
  sectorCode: varchar("sectorCode", { length: 50 }).notNull(),
  
  // KPI definition
  indicatorCode: varchar("indicatorCode", { length: 100 }).notNull(),
  displayOrder: int("displayOrder").default(0),
  
  // Display configuration
  titleEn: varchar("titleEn", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }).notNull(),
  unitEn: varchar("unitEn", { length: 50 }),
  unitAr: varchar("unitAr", { length: 50 }),
  formatType: mysqlEnum("formatType", ["number", "percent", "currency", "index"]).default("number"),
  decimalPlaces: int("decimalPlaces").default(1),
  
  // Thresholds for status
  warningThreshold: decimal("warningThreshold", { precision: 15, scale: 4 }),
  criticalThreshold: decimal("criticalThreshold", { precision: 15, scale: 4 }),
  thresholdDirection: mysqlEnum("thresholdDirection", ["above", "below"]).default("above"),
  
  // Regime specificity
  regimeTag: mysqlEnum("regimeTag", ["both", "aden_irg", "sanaa_dfa"]).default("both"),
  
  // Status
  isActive: boolean("isActive").default(true),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  sectorIdx: index("sector_kpi_sector_idx").on(table.sectorCode),
  indicatorIdx: index("sector_kpi_indicator_idx").on(table.indicatorCode),
  orderIdx: index("sector_kpi_order_idx").on(table.sectorCode, table.displayOrder),
}));

export type SectorKpi = typeof sectorKpis.$inferSelect;
export type InsertSectorKpi = typeof sectorKpis.$inferInsert;

// Sector Mechanism Explainers: Evidence-locked explanations
export const sectorMechanisms = mysqlTable("sector_mechanisms", {
  id: int("id").autoincrement().primaryKey(),
  sectorCode: varchar("sectorCode", { length: 50 }).notNull(),
  
  // Content
  sectionOrder: int("sectionOrder").default(0),
  headingEn: varchar("headingEn", { length: 255 }).notNull(),
  headingAr: varchar("headingAr", { length: 255 }).notNull(),
  contentEn: text("contentEn").notNull(),
  contentAr: text("contentAr").notNull(),
  
  // Evidence requirement
  contentType: mysqlEnum("contentType", ["evidence_backed", "conceptual"]).default("evidence_backed"),
  
  // Citations (for evidence_backed content)
  citations: json("citations").$type<{
    citationId: string;
    sourceId: number;
    documentId?: number;
    pageRef?: string;
    quote?: string;
  }[]>(),
  
  // Gap tracking (if evidence insufficient)
  hasGap: boolean("hasGap").default(false),
  gapTicketId: int("gapTicketId"),
  
  // Status
  isActive: boolean("isActive").default(true),
  lastReviewedAt: timestamp("lastReviewedAt"),
  reviewedBy: int("reviewedBy"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  sectorIdx: index("sector_mech_sector_idx").on(table.sectorCode),
  orderIdx: index("sector_mech_order_idx").on(table.sectorCode, table.sectionOrder),
}));

export type SectorMechanism = typeof sectorMechanisms.$inferSelect;
export type InsertSectorMechanism = typeof sectorMechanisms.$inferInsert;

// Sector Watchlist Items: What to watch next
export const sectorWatchlistItems = mysqlTable("sector_watchlist_items", {
  id: int("id").autoincrement().primaryKey(),
  sectorCode: varchar("sectorCode", { length: 50 }).notNull(),
  
  // Item type and reference
  itemType: mysqlEnum("itemType", ["indicator", "entity", "project", "event", "risk"]).notNull(),
  itemId: varchar("itemId", { length: 100 }).notNull(), // Reference to the actual item
  
  // Display
  titleEn: varchar("titleEn", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }).notNull(),
  descriptionEn: text("descriptionEn"),
  descriptionAr: text("descriptionAr"),
  
  // Importance
  importance: mysqlEnum("importance", ["critical", "high", "medium", "low"]).default("medium"),
  displayOrder: int("displayOrder").default(0),
  
  // Role visibility (public vs VIP)
  visibilityLevel: mysqlEnum("visibilityLevel", ["public", "vip_only"]).default("public"),
  vipRoles: json("vipRoles").$type<string[]>(), // Which VIP roles see this
  
  // Reason for watching
  reasonEn: text("reasonEn"),
  reasonAr: text("reasonAr"),
  evidencePackId: int("evidencePackId"),
  
  // Status
  isActive: boolean("isActive").default(true),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  sectorIdx: index("sector_watch_sector_idx").on(table.sectorCode),
  typeIdx: index("sector_watch_type_idx").on(table.itemType),
  visibilityIdx: index("sector_watch_visibility_idx").on(table.visibilityLevel),
}));

export type SectorWatchlistItem = typeof sectorWatchlistItems.$inferSelect;
export type InsertSectorWatchlistItem = typeof sectorWatchlistItems.$inferInsert;

// Sector FAQs: Auto-generated but evidence-only
export const sectorFaqs = mysqlTable("sector_faqs", {
  id: int("id").autoincrement().primaryKey(),
  sectorCode: varchar("sectorCode", { length: 50 }).notNull(),
  
  // Question and answer
  questionEn: text("questionEn").notNull(),
  questionAr: text("questionAr").notNull(),
  answerEn: text("answerEn").notNull(),
  answerAr: text("answerAr").notNull(),
  
  // Evidence
  citations: json("citations").$type<{
    citationId: string;
    sourceId: number;
    documentId?: number;
    quote?: string;
  }[]>(),
  
  // If evidence insufficient
  isRefusalAnswer: boolean("isRefusalAnswer").default(false),
  refusalReasonEn: text("refusalReasonEn"),
  refusalReasonAr: text("refusalReasonAr"),
  
  // Display
  displayOrder: int("displayOrder").default(0),
  isActive: boolean("isActive").default(true),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  sectorIdx: index("sector_faq_sector_idx").on(table.sectorCode),
  orderIdx: index("sector_faq_order_idx").on(table.sectorCode, table.displayOrder),
}));

export type SectorFaq = typeof sectorFaqs.$inferSelect;
export type InsertSectorFaq = typeof sectorFaqs.$inferInsert;

// Sector Alerts: Sector-specific alerts
export const sectorAlerts = mysqlTable("sector_alerts", {
  id: int("id").autoincrement().primaryKey(),
  sectorCode: varchar("sectorCode", { length: 50 }).notNull(),
  
  // Alert details
  alertType: mysqlEnum("alertType", [
    "threshold_breach",
    "staleness",
    "contradiction_detected",
    "significant_change",
    "data_gap",
    "source_update"
  ]).notNull(),
  
  severity: mysqlEnum("severity", ["critical", "warning", "info"]).default("info"),
  
  // Content
  titleEn: varchar("titleEn", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }).notNull(),
  descriptionEn: text("descriptionEn"),
  descriptionAr: text("descriptionAr"),
  
  // Related indicator/entity
  indicatorCode: varchar("indicatorCode", { length: 100 }),
  entityId: int("entityId"),
  
  // Evidence
  evidencePackId: int("evidencePackId"),
  
  // Status
  status: mysqlEnum("status", ["active", "acknowledged", "resolved"]).default("active"),
  acknowledgedAt: timestamp("acknowledgedAt"),
  acknowledgedBy: int("acknowledgedBy"),
  resolvedAt: timestamp("resolvedAt"),
  
  // Metadata
  triggeredAt: timestamp("triggeredAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  sectorIdx: index("sector_alert_sector_idx").on(table.sectorCode),
  typeIdx: index("sector_alert_type_idx").on(table.alertType),
  statusIdx: index("sector_alert_status_idx").on(table.status),
  severityIdx: index("sector_alert_severity_idx").on(table.severity),
}));

export type SectorAlert = typeof sectorAlerts.$inferSelect;
export type InsertSectorAlert = typeof sectorAlerts.$inferInsert;

// Sector Context Packs: Generated by sector agents
export const sectorContextPacks = mysqlTable("sector_context_packs", {
  id: int("id").autoincrement().primaryKey(),
  sectorCode: varchar("sectorCode", { length: 50 }).notNull(),
  
  // Pack metadata
  packDate: timestamp("packDate").notNull(),
  packVersion: int("packVersion").default(1),
  
  // Content sections
  keyIndicators: json("keyIndicators").$type<{
    indicatorCode: string;
    nameEn: string;
    nameAr: string;
    currentValue: number;
    previousValue?: number;
    changePercent?: number;
    confidence: string;
    sourceId: number;
    lastUpdated: string;
  }[]>(),
  
  topEvents: json("topEvents").$type<{
    eventId: number;
    titleEn: string;
    titleAr: string;
    date: string;
    evidencePackId?: number;
  }[]>(),
  
  topDocuments: json("topDocuments").$type<{
    documentId: number;
    titleEn: string;
    titleAr: string;
    sourceId: number;
    publishDate: string;
  }[]>(),
  
  contradictions: json("contradictions").$type<{
    indicatorCode: string;
    sources: string[];
    descriptionEn: string;
    descriptionAr: string;
  }[]>(),
  
  gaps: json("gaps").$type<{
    gapType: string;
    descriptionEn: string;
    descriptionAr: string;
    ticketId?: number;
  }[]>(),
  
  whatChanged: json("whatChanged").$type<{
    indicatorCode: string;
    changeType: string;
    descriptionEn: string;
    descriptionAr: string;
    evidencePackId?: number;
  }[]>(),
  
  whatToWatch: json("whatToWatch").$type<{
    itemType: string;
    itemId: string;
    titleEn: string;
    titleAr: string;
    reasonEn: string;
    reasonAr: string;
  }[]>(),
  
  // Quality metrics
  dataCoveragePercent: decimal("dataCoveragePercent", { precision: 5, scale: 2 }),
  dataFreshnessPercent: decimal("dataFreshnessPercent", { precision: 5, scale: 2 }),
  contradictionCount: int("contradictionCount").default(0),
  gapCount: int("gapCount").default(0),
  
  // Storage
  s3Key: varchar("s3Key", { length: 500 }),
  
  // Metadata
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  sectorIdx: index("sector_ctx_sector_idx").on(table.sectorCode),
  dateIdx: index("sector_ctx_date_idx").on(table.packDate),
  sectorDateIdx: index("sector_ctx_sector_date_idx").on(table.sectorCode, table.packDate),
}));

export type SectorContextPack = typeof sectorContextPacks.$inferSelect;
export type InsertSectorContextPack = typeof sectorContextPacks.$inferInsert;

// Sector Briefs: Weekly briefs (public + VIP)
export const sectorBriefs = mysqlTable("sector_briefs", {
  id: int("id").autoincrement().primaryKey(),
  sectorCode: varchar("sectorCode", { length: 50 }).notNull(),
  
  // Brief metadata
  briefType: mysqlEnum("briefType", ["public", "vip"]).notNull(),
  weekStart: timestamp("weekStart").notNull(),
  weekEnd: timestamp("weekEnd").notNull(),
  
  // Content
  titleEn: varchar("titleEn", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }).notNull(),
  summaryEn: text("summaryEn"),
  summaryAr: text("summaryAr"),
  
  // Sections
  sections: json("sections").$type<{
    sectionType: string;
    titleEn: string;
    titleAr: string;
    contentEn: string;
    contentAr: string;
    citations?: { citationId: string; sourceId: number }[];
  }[]>(),
  
  // Evidence appendix
  evidenceAppendix: json("evidenceAppendix").$type<{
    citationId: string;
    sourceId: number;
    sourceName: string;
    documentId?: number;
    pageRef?: string;
    quote?: string;
  }[]>(),
  
  // Storage
  pdfUrlEn: varchar("pdfUrlEn", { length: 500 }),
  pdfUrlAr: varchar("pdfUrlAr", { length: 500 }),
  s3KeyEn: varchar("s3KeyEn", { length: 500 }),
  s3KeyAr: varchar("s3KeyAr", { length: 500 }),
  
  // Status
  status: mysqlEnum("status", ["draft", "review", "published"]).default("draft"),
  publishedAt: timestamp("publishedAt"),
  
  // Metadata
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  sectorIdx: index("sector_brief_sector_idx").on(table.sectorCode),
  typeIdx: index("sector_brief_type_idx").on(table.briefType),
  weekIdx: index("sector_brief_week_idx").on(table.weekStart),
  statusIdx: index("sector_brief_status_idx").on(table.status),
}));

export type SectorBrief = typeof sectorBriefs.$inferSelect;
export type InsertSectorBrief = typeof sectorBriefs.$inferInsert;

// Sector Release Gates: Per-sector quality gates
export const sectorReleaseGates = mysqlTable("sector_release_gates", {
  id: int("id").autoincrement().primaryKey(),
  sectorCode: varchar("sectorCode", { length: 50 }).notNull(),
  
  // Gate checks
  evidenceCoveragePercent: decimal("evidenceCoveragePercent", { precision: 5, scale: 2 }),
  evidenceCoveragePassed: boolean("evidenceCoveragePassed").default(false),
  
  exportsWorking: boolean("exportsWorking").default(false),
  contradictionsVisible: boolean("contradictionsVisible").default(false),
  bilingualParityPassed: boolean("bilingualParityPassed").default(false),
  noPlaceholdersPassed: boolean("noPlaceholdersPassed").default(false),
  
  // Overall status
  allGatesPassed: boolean("allGatesPassed").default(false),
  lastCheckedAt: timestamp("lastCheckedAt"),
  
  // Notes
  notes: text("notes"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  sectorIdx: index("sector_gate_sector_idx").on(table.sectorCode),
  passedIdx: index("sector_gate_passed_idx").on(table.allGatesPassed),
}));

export type SectorReleaseGate = typeof sectorReleaseGates.$inferSelect;
export type InsertSectorReleaseGate = typeof sectorReleaseGates.$inferInsert;

// Methodology Notes: Public changelog entries
export const methodologyNotes = mysqlTable("methodology_notes", {
  id: int("id").autoincrement().primaryKey(),
  
  // Content
  titleEn: varchar("titleEn", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }).notNull(),
  contentEn: text("contentEn").notNull(),
  contentAr: text("contentAr").notNull(),
  
  // Categorization
  category: mysqlEnum("category", [
    "data_collection",
    "contradiction_handling",
    "confidence_grades",
    "revisions_vintages",
    "uncertainty_interpretation",
    "missing_data",
    "data_licenses",
    "general"
  ]).default("general"),
  
  // Scope
  sectorCode: varchar("sectorCode", { length: 50 }), // null = global
  
  // Status
  isPublished: boolean("isPublished").default(false),
  publishedAt: timestamp("publishedAt"),
  
  // Author
  authorId: int("authorId"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  categoryIdx: index("method_note_category_idx").on(table.category),
  sectorIdx: index("method_note_sector_idx").on(table.sectorCode),
  publishedIdx: index("method_note_published_idx").on(table.isPublished),
}));

export type MethodologyNote = typeof methodologyNotes.$inferSelect;
export type InsertMethodologyNote = typeof methodologyNotes.$inferInsert;

// Credibility Metrics: Track credibility indicators
export const credibilityMetrics = mysqlTable("credibility_metrics", {
  id: int("id").autoincrement().primaryKey(),
  
  // Scope
  sectorCode: varchar("sectorCode", { length: 50 }), // null = platform-wide
  
  // Metrics
  metricDate: timestamp("metricDate").notNull(),
  
  // Source tiers
  tier1SourceCount: int("tier1SourceCount").default(0),
  tier2SourceCount: int("tier2SourceCount").default(0),
  tier3SourceCount: int("tier3SourceCount").default(0),
  
  // License flags
  openLicenseCount: int("openLicenseCount").default(0),
  restrictedLicenseCount: int("restrictedLicenseCount").default(0),
  
  // Contradictions
  contradictionCount: int("contradictionCount").default(0),
  resolvedContradictionCount: int("resolvedContradictionCount").default(0),
  
  // Revisions
  revisionCount: int("revisionCount").default(0),
  vintageCount: int("vintageCount").default(0),
  
  // Citation coverage
  citationCoveragePercent: decimal("citationCoveragePercent", { precision: 5, scale: 2 }),
  
  // Evaluation results
  evalPassRate: decimal("evalPassRate", { precision: 5, scale: 2 }),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  sectorIdx: index("cred_metric_sector_idx").on(table.sectorCode),
  dateIdx: index("cred_metric_date_idx").on(table.metricDate),
}));

export type CredibilityMetric = typeof credibilityMetrics.$inferSelect;
export type InsertCredibilityMetric = typeof credibilityMetrics.$inferInsert;


// ============================================================================
// PUBLICATION FACTORY (Prompt 9/∞)
// ============================================================================

// Publication Templates: Define publication types and their requirements
export const publicationTemplates = mysqlTable("publication_templates", {
  id: int("id").autoincrement().primaryKey(),
  
  // Identity
  templateCode: varchar("templateCode", { length: 50 }).notNull().unique(),
  nameEn: varchar("nameEn", { length: 200 }).notNull(),
  nameAr: varchar("nameAr", { length: 200 }).notNull(),
  descriptionEn: text("descriptionEn"),
  descriptionAr: text("descriptionAr"),
  
  // Type and audience
  publicationType: mysqlEnum("publicationType", [
    "daily", "weekly", "monthly", "quarterly", "annual", "shock_note"
  ]).notNull(),
  audience: mysqlEnum("audience", ["public", "vip", "both"]).notNull().default("both"),
  languages: json("languages").$type<string[]>().default(["en", "ar"]),
  
  // Content structure
  sections: json("sections").$type<Array<{
    sectionCode: string;
    titleEn: string;
    titleAr: string;
    type: "executive_summary" | "kpis" | "charts" | "analysis" | "watchlist" | "methodology" | "evidence_appendix";
    order: number;
    isRequired: boolean;
    config?: Record<string, unknown>;
  }>>(),
  
  // Requirements for generation
  requiredIndicators: json("requiredIndicators").$type<string[]>().default([]),
  requiredDatasets: json("requiredDatasets").$type<string[]>().default([]),
  requiredEntities: json("requiredEntities").$type<string[]>().default([]),
  requiredSourcesMin: int("requiredSourcesMin").default(3),
  
  // Quality thresholds
  evidenceThreshold: decimal("evidenceThreshold", { precision: 5, scale: 2 }).default("95.00"),
  contradictionPolicy: mysqlEnum("contradictionPolicy", ["show_always", "show_resolved_only", "hide"]).default("show_always"),
  uncertaintyPolicy: mysqlEnum("uncertaintyPolicy", ["show_if_published", "disclose_not_published", "hide"]).default("show_if_published"),
  
  // Layout
  layoutTheme: json("layoutTheme").$type<{
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    logoUrl?: string;
    headerStyle?: string;
  }>(),
  
  // Approval and scheduling
  approvalPolicy: mysqlEnum("approvalPolicy", ["auto", "admin_required", "risk_based"]).default("risk_based"),
  schedule: varchar("schedule", { length: 100 }), // cron expression
  
  // Status
  isActive: boolean("isActive").default(true),
  lastGeneratedAt: timestamp("lastGeneratedAt"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  typeIdx: index("pub_template_type_idx").on(table.publicationType),
  audienceIdx: index("pub_template_audience_idx").on(table.audience),
  activeIdx: index("pub_template_active_idx").on(table.isActive),
}));
export type PublicationTemplate = typeof publicationTemplates.$inferSelect;
export type InsertPublicationTemplate = typeof publicationTemplates.$inferInsert;

// Publication Runs: Track each generation attempt with 8-stage pipeline
export const publicationRuns = mysqlTable("publication_runs", {
  id: int("id").autoincrement().primaryKey(),
  
  // Template reference
  templateId: int("templateId").notNull(),
  templateCode: varchar("templateCode", { length: 50 }).notNull(),
  
  // Run window
  runWindowStart: timestamp("runWindowStart").notNull(),
  runWindowEnd: timestamp("runWindowEnd").notNull(),
  generatedAt: timestamp("generatedAt"),
  
  // Input snapshots
  inputsSnapshotRefs: json("inputsSnapshotRefs").$type<{
    datasetVersionIds: number[];
    documentIds: number[];
    indicatorCodes: string[];
    entityIds: number[];
  }>(),
  
  // Output artifacts
  outputArtifacts: json("outputArtifacts").$type<{
    pdfEnUrl?: string;
    pdfArUrl?: string;
    htmlUrl?: string;
    jsonUrl?: string;
    manifestUrl?: string;
    evidenceBundleUrl?: string;
  }>(),
  
  // Evidence bundle
  evidencePackBundleId: int("evidencePackBundleId"),
  
  // Quality summaries
  contradictionsSummary: json("contradictionsSummary").$type<{
    total: number;
    resolved: number;
    unresolved: number;
    critical: number;
    items: Array<{
      indicatorCode: string;
      sources: string[];
      status: string;
    }>;
  }>(),
  dqafQualitySummary: json("dqafQualitySummary").$type<{
    integrity: "pass" | "warning" | "fail";
    methodology: "pass" | "warning" | "fail";
    accuracy: "pass" | "warning" | "fail";
    serviceability: "pass" | "warning" | "fail";
    accessibility: "pass" | "warning" | "fail";
  }>(),
  confidenceSummary: json("confidenceSummary").$type<{
    overallConfidence: "high" | "medium" | "low";
    citationCoverage: number;
    sourceCount: number;
    freshestDataDate: string;
    oldestDataDate: string;
  }>(),
  
  // 8-Stage Pipeline Status
  pipelineStages: json("pipelineStages").$type<Array<{
    stage: number;
    stageName: string;
    status: "pending" | "running" | "passed" | "failed" | "skipped";
    startedAt?: string;
    completedAt?: string;
    durationMs?: number;
    details?: Record<string, unknown>;
    errors?: string[];
  }>>(),
  
  // Approval state
  approvalState: mysqlEnum("approvalState", [
    "draft", "in_review", "approved", "published", "rejected", "archived"
  ]).default("draft"),
  approvalsLog: json("approvalsLog").$type<Array<{
    action: "submit" | "approve" | "reject" | "publish" | "archive";
    actorType: "system" | "admin" | "ai_tribunal";
    actorId?: number;
    actorName?: string;
    timestamp: string;
    notes?: string;
    notesAr?: string;
  }>>(),
  
  // Public URL (if published)
  publicUrl: varchar("publicUrl", { length: 500 }),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  templateIdx: index("pub_run_template_idx").on(table.templateId),
  stateIdx: index("pub_run_state_idx").on(table.approvalState),
  windowIdx: index("pub_run_window_idx").on(table.runWindowStart, table.runWindowEnd),
}));
export type PublicationRun = typeof publicationRuns.$inferSelect;
export type InsertPublicationRun = typeof publicationRuns.$inferInsert;

// Publication Evidence Bundles: Package all evidence for a publication
export const publicationEvidenceBundles = mysqlTable("publication_evidence_bundles", {
  id: int("id").autoincrement().primaryKey(),
  
  // Publication reference
  publicationRunId: int("publicationRunId").notNull(),
  
  // Evidence pack IDs used
  evidencePackIds: json("evidencePackIds").$type<number[]>().default([]),
  
  // Per-section citation coverage
  sectionCoverage: json("sectionCoverage").$type<Array<{
    sectionCode: string;
    citationCount: number;
    coveragePercent: number;
    uncitedClaims: string[];
  }>>(),
  
  // Top contradictions
  topContradictions: json("topContradictions").$type<Array<{
    indicatorCode: string;
    sources: string[];
    descriptionEn: string;
    descriptionAr: string;
    impact: "high" | "medium" | "low";
  }>>(),
  
  // What would change conclusions
  sensitivityAnalysis: json("sensitivityAnalysis").$type<Array<{
    assumption: string;
    assumptionAr: string;
    impact: string;
    impactAr: string;
    likelihood: "high" | "medium" | "low";
  }>>(),
  
  // License summary
  licenseSummary: json("licenseSummary").$type<{
    openLicense: number;
    restrictedLicense: number;
    unknownLicense: number;
    attributionRequired: string[];
  }>(),
  
  // S3 URLs
  bundleUrl: varchar("bundleUrl", { length: 500 }),
  manifestUrl: varchar("manifestUrl", { length: 500 }),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  runIdx: index("pub_evidence_run_idx").on(table.publicationRunId),
}));
export type PublicationEvidenceBundle = typeof publicationEvidenceBundles.$inferSelect;
export type InsertPublicationEvidenceBundle = typeof publicationEvidenceBundles.$inferInsert;

// Publication Changelog: Track corrections, revisions, retractions
export const publicationChangelog = mysqlTable("publication_changelog", {
  id: int("id").autoincrement().primaryKey(),
  
  // Publication reference
  publicationRunId: int("publicationRunId").notNull(),
  
  // Change type
  changeType: mysqlEnum("changeType", [
    "correction", "revision", "retraction", "update", "clarification"
  ]).notNull(),
  
  // Change details
  titleEn: varchar("titleEn", { length: 200 }).notNull(),
  titleAr: varchar("titleAr", { length: 200 }).notNull(),
  descriptionEn: text("descriptionEn").notNull(),
  descriptionAr: text("descriptionAr").notNull(),
  
  // What changed
  affectedSections: json("affectedSections").$type<string[]>().default([]),
  previousValue: text("previousValue"),
  newValue: text("newValue"),
  
  // Reason
  reasonEn: text("reasonEn"),
  reasonAr: text("reasonAr"),
  
  // Evidence for change
  evidencePackId: int("evidencePackId"),
  
  // Visibility
  isPublic: boolean("isPublic").default(true),
  
  // Actor
  changedBy: int("changedBy"),
  changedByName: varchar("changedByName", { length: 100 }),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  runIdx: index("pub_changelog_run_idx").on(table.publicationRunId),
  typeIdx: index("pub_changelog_type_idx").on(table.changeType),
}));
export type PublicationChangelogEntry = typeof publicationChangelog.$inferSelect;
export type InsertPublicationChangelogEntry = typeof publicationChangelog.$inferInsert;

// Publication Metrics: Track publication performance
export const publicationMetrics = mysqlTable("publication_metrics", {
  id: int("id").autoincrement().primaryKey(),
  
  // Scope
  templateId: int("templateId"),
  metricDate: timestamp("metricDate").notNull(),
  
  // Generation metrics
  runsAttempted: int("runsAttempted").default(0),
  runsSucceeded: int("runsSucceeded").default(0),
  runsFailed: int("runsFailed").default(0),
  
  // Quality metrics
  avgCitationCoverage: decimal("avgCitationCoverage", { precision: 5, scale: 2 }),
  avgContradictionRate: decimal("avgContradictionRate", { precision: 5, scale: 2 }),
  avgFreshnessLagDays: decimal("avgFreshnessLagDays", { precision: 5, scale: 2 }),
  
  // Approval metrics
  autoApproved: int("autoApproved").default(0),
  adminApproved: int("adminApproved").default(0),
  rejected: int("rejected").default(0),
  
  // Delivery metrics
  onTimeRate: decimal("onTimeRate", { precision: 5, scale: 2 }),
  avgGenerationTimeMs: int("avgGenerationTimeMs"),
  
  // Engagement metrics
  totalViews: int("totalViews").default(0),
  totalDownloads: int("totalDownloads").default(0),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  templateIdx: index("pub_metrics_template_idx").on(table.templateId),
  dateIdx: index("pub_metrics_date_idx").on(table.metricDate),
}));
export type PublicationMetric = typeof publicationMetrics.$inferSelect;
export type InsertPublicationMetric = typeof publicationMetrics.$inferInsert;


// ============================================================================
// PARTNER ENGINE TABLES (Prompt 10/∞)
// ============================================================================

// Data Contracts: Schema governance for partner data submissions
export const dataContracts = mysqlTable("data_contracts", {
  id: int("id").autoincrement().primaryKey(),
  
  // Identity
  contractId: varchar("contractId", { length: 50 }).notNull().unique(),
  nameEn: varchar("nameEn", { length: 200 }).notNull(),
  nameAr: varchar("nameAr", { length: 200 }),
  
  // Classification
  datasetFamily: varchar("datasetFamily", { length: 100 }).notNull(),
  schemaVersion: varchar("schemaVersion", { length: 20 }).default("1.0").notNull(),
  
  // Schema definition
  requiredFields: json("requiredFields").$type<Array<{
    name: string;
    type: "string" | "number" | "date" | "boolean" | "geo";
    description: string;
    required: boolean;
    validation?: string;
  }>>(),
  allowedUnits: json("allowedUnits").$type<string[]>(),
  frequency: mysqlEnum("frequency", ["daily", "weekly", "monthly", "quarterly", "annual", "irregular"]).notNull(),
  geoLevel: mysqlEnum("geoLevel", ["national", "governorate", "district", "locality"]).default("national"),
  
  // Governance
  regimeTagRules: json("regimeTagRules").$type<{
    required: boolean;
    allowedValues: string[];
    splitRequired: boolean;
  }>(),
  validationRules: json("validationRules").$type<Array<{
    rule: string;
    severity: "error" | "warning";
    message: string;
  }>>(),
  
  // Metadata requirements
  requiredMetadata: json("requiredMetadata").$type<{
    sourceStatement: boolean;
    methodDescription: boolean;
    coverageWindow: boolean;
    license: boolean;
    contactInfo: boolean;
  }>(),
  
  // Privacy & access
  privacyClassification: mysqlEnum("privacyClassification", ["public", "restricted", "confidential"]).default("restricted").notNull(),
  publicAggregationRule: text("publicAggregationRule"),
  minimumCellSize: int("minimumCellSize").default(5),
  
  // Format
  allowedFormats: json("allowedFormats").$type<string[]>().default(["csv", "xlsx", "json"]),
  templateFileUrl: varchar("templateFileUrl", { length: 500 }),
  
  // Status
  status: mysqlEnum("status", ["draft", "active", "deprecated"]).default("draft").notNull(),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  createdBy: int("createdBy"),
}, (table) => ({
  contractIdIdx: index("contract_id_idx").on(table.contractId),
  familyIdx: index("contract_family_idx").on(table.datasetFamily),
  statusIdx: index("contract_status_idx").on(table.status),
}));
export type DataContract = typeof dataContracts.$inferSelect;
export type InsertDataContract = typeof dataContracts.$inferInsert;

// Partner Submission Validation: 3-layer validation results
export const submissionValidations = mysqlTable("submission_validations", {
  id: int("id").autoincrement().primaryKey(),
  
  // References
  submissionId: int("submissionId").notNull().references(() => partnerSubmissions.id),
  contractId: int("contractId").references(() => dataContracts.id),
  
  // Layer 1: Format/Schema
  layer1Passed: boolean("layer1Passed").default(false),
  layer1Errors: json("layer1Errors").$type<Array<{
    field: string;
    error: string;
    severity: "error" | "warning";
  }>>(),
  
  // Layer 2: Continuity/Duplicates
  layer2Passed: boolean("layer2Passed").default(false),
  layer2Issues: json("layer2Issues").$type<Array<{
    type: "duplicate" | "gap" | "outlier" | "missing_period";
    description: string;
    affectedRecords: number[];
  }>>(),
  
  // Layer 3: Contradiction scan
  layer3Passed: boolean("layer3Passed").default(false),
  contradictionsFound: json("contradictionsFound").$type<Array<{
    indicator: string;
    period: string;
    existingValue: number;
    submittedValue: number;
    existingSource: string;
    resolution: "pending" | "accepted" | "rejected";
  }>>(),
  
  // Overall result
  overallPassed: boolean("overallPassed").default(false),
  validationScore: decimal("validationScore", { precision: 5, scale: 2 }),
  
  // Report
  validationReportUrl: varchar("validationReportUrl", { length: 500 }),
  
  // Metadata
  validatedAt: timestamp("validatedAt").defaultNow().notNull(),
  validatedBy: varchar("validatedBy", { length: 50 }).default("system"),
}, (table) => ({
  submissionIdx: index("validation_submission_idx").on(table.submissionId),
  contractIdx: index("validation_contract_idx").on(table.contractId),
}));
export type SubmissionValidation = typeof submissionValidations.$inferSelect;
export type InsertSubmissionValidation = typeof submissionValidations.$inferInsert;

// Moderation Queue: Approval workflow tracking
export const moderationQueue = mysqlTable("moderation_queue", {
  id: int("id").autoincrement().primaryKey(),
  
  // References
  submissionId: int("submissionId").notNull().references(() => partnerSubmissions.id),
  validationId: int("validationId").references(() => submissionValidations.id),
  
  // Status tracking
  status: mysqlEnum("status", [
    "received",
    "validating",
    "failed_validation",
    "quarantined",
    "pending_review",
    "approved_restricted",
    "approved_public_aggregate",
    "published",
    "rejected"
  ]).default("received").notNull(),
  
  // Lane assignment
  publishingLane: mysqlEnum("publishingLane", ["lane_a_public", "lane_b_restricted", "none"]).default("none"),
  
  // Review details
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  reviewNotes: text("reviewNotes"),
  
  // QA signoff (for public publishing)
  qaSignoffBy: int("qaSignoffBy"),
  qaSignoffAt: timestamp("qaSignoffAt"),
  qaSignoffNotes: text("qaSignoffNotes"),
  
  // Evidence coverage (for public publishing)
  evidenceCoverage: decimal("evidenceCoverage", { precision: 5, scale: 2 }),
  evidencePackId: int("evidencePackId"),
  
  // Rejection details
  rejectionReason: text("rejectionReason"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  submissionIdx: index("moderation_submission_idx").on(table.submissionId),
  statusIdx: index("moderation_status_idx").on(table.status),
  laneIdx: index("moderation_lane_idx").on(table.publishingLane),
}));
export type ModerationQueueItem = typeof moderationQueue.$inferSelect;
export type InsertModerationQueueItem = typeof moderationQueue.$inferInsert;

// Access Needed Items: Track sources needing partnership/keys
export const accessNeededItems = mysqlTable("access_needed_items", {
  id: int("id").autoincrement().primaryKey(),
  
  // Source reference
  sourceId: varchar("sourceId", { length: 100 }).notNull(),
  sourceName: varchar("sourceName", { length: 200 }).notNull(),
  
  // Access type
  accessType: mysqlEnum("accessType", ["needs_key", "partnership_required", "subscription", "restricted"]).notNull(),
  
  // Organization contact
  organizationName: varchar("organizationName", { length: 200 }),
  organizationEmail: varchar("organizationEmail", { length: 200 }),
  organizationWebsite: varchar("organizationWebsite", { length: 500 }),
  
  // Blocked datasets
  blockedDatasets: json("blockedDatasets").$type<Array<{
    datasetId: string;
    name: string;
    importance: "critical" | "high" | "medium" | "low";
  }>>(),
  
  // Benefits framing (RoleLens)
  benefitsForYeto: text("benefitsForYeto"),
  benefitsForPartner: text("benefitsForPartner"),
  
  // Outreach status
  outreachStatus: mysqlEnum("outreachStatus", ["queued", "draft_ready", "sent", "responded", "successful", "failed"]).default("queued"),
  
  // Email draft
  emailDraftId: int("emailDraftId"),
  
  // Priority
  priority: mysqlEnum("priority", ["critical", "high", "medium", "low"]).default("medium"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  createdBy: int("createdBy"),
}, (table) => ({
  sourceIdx: index("access_source_idx").on(table.sourceId),
  statusIdx: index("access_status_idx").on(table.outreachStatus),
  typeIdx: index("access_type_idx").on(table.accessType),
}));
export type AccessNeededItem = typeof accessNeededItems.$inferSelect;
export type InsertAccessNeededItem = typeof accessNeededItems.$inferInsert;

// Admin Outbox: Email drafts for partnership outreach
export const adminOutbox = mysqlTable("admin_outbox", {
  id: int("id").autoincrement().primaryKey(),
  
  // Email details
  toEmail: varchar("toEmail", { length: 200 }).notNull(),
  toName: varchar("toName", { length: 200 }),
  subject: varchar("subject", { length: 500 }).notNull(),
  bodyHtml: text("bodyHtml").notNull(),
  bodyText: text("bodyText"),
  
  // Template used
  templateType: mysqlEnum("templateType", ["initial_outreach", "follow_up", "data_sharing_agreement", "thank_you"]).default("initial_outreach"),
  
  // Reference
  accessNeededItemId: int("accessNeededItemId").references(() => accessNeededItems.id),
  
  // Status
  status: mysqlEnum("status", ["draft", "queued", "sent", "failed", "bounced"]).default("draft").notNull(),
  
  // Send details
  sentAt: timestamp("sentAt"),
  sentBy: int("sentBy"),
  failureReason: text("failureReason"),
  
  // Response tracking
  responseReceived: boolean("responseReceived").default(false),
  responseReceivedAt: timestamp("responseReceivedAt"),
  responseNotes: text("responseNotes"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  createdBy: int("createdBy"),
}, (table) => ({
  statusIdx: index("outbox_status_idx").on(table.status),
  accessItemIdx: index("outbox_access_item_idx").on(table.accessNeededItemId),
}));
export type AdminOutboxItem = typeof adminOutbox.$inferSelect;
export type InsertAdminOutboxItem = typeof adminOutbox.$inferInsert;

// Admin Incidents: Incident log for platform issues
export const adminIncidents = mysqlTable("admin_incidents", {
  id: int("id").autoincrement().primaryKey(),
  
  // Incident details
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  severity: mysqlEnum("severity", ["critical", "high", "medium", "low"]).default("medium").notNull(),
  category: mysqlEnum("category", ["pipeline_outage", "data_anomaly", "security", "performance", "integration", "other"]).default("other"),
  
  // Status
  status: mysqlEnum("status", ["open", "investigating", "mitigating", "resolved", "closed"]).default("open").notNull(),
  
  // Impact
  affectedDatasets: json("affectedDatasets").$type<string[]>(),
  affectedPublications: json("affectedPublications").$type<string[]>(),
  affectedVipAlerts: json("affectedVipAlerts").$type<string[]>(),
  
  // Timeline
  detectedAt: timestamp("detectedAt").defaultNow().notNull(),
  acknowledgedAt: timestamp("acknowledgedAt"),
  resolvedAt: timestamp("resolvedAt"),
  closedAt: timestamp("closedAt"),
  
  // Assignment
  assignedTo: int("assignedTo"),
  
  // Post-mortem
  postMortemUrl: varchar("postMortemUrl", { length: 500 }),
  rootCause: text("rootCause"),
  preventionMeasures: text("preventionMeasures"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  createdBy: int("createdBy"),
}, (table) => ({
  severityIdx: index("incident_severity_idx").on(table.severity),
  statusIdx: index("incident_status_idx").on(table.status),
  categoryIdx: index("incident_category_idx").on(table.category),
}));
export type AdminIncident = typeof adminIncidents.$inferSelect;
export type InsertAdminIncident = typeof adminIncidents.$inferInsert;

// Admin Audit Log: Track admin actions
export const adminAuditLog = mysqlTable("admin_audit_log", {
  id: int("id").autoincrement().primaryKey(),
  
  // Actor
  userId: int("userId").notNull(),
  userName: varchar("userName", { length: 100 }),
  userRole: varchar("userRole", { length: 50 }),
  
  // Action
  action: varchar("action", { length: 100 }).notNull(),
  actionCategory: mysqlEnum("actionCategory", [
    "user_management",
    "data_management",
    "publication",
    "moderation",
    "configuration",
    "security",
    "incident",
    "other"
  ]).default("other"),
  
  // Target
  targetType: varchar("targetType", { length: 50 }),
  targetId: varchar("targetId", { length: 100 }),
  targetName: varchar("targetName", { length: 200 }),
  
  // Change details
  previousValue: json("previousValue"),
  newValue: json("newValue"),
  
  // Context
  ipAddress: varchar("ipAddress", { length: 50 }),
  userAgent: varchar("userAgent", { length: 500 }),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("audit_user_idx").on(table.userId),
  actionIdx: index("audit_action_idx").on(table.action),
  categoryIdx: index("audit_category_idx").on(table.actionCategory),
  targetIdx: index("audit_target_idx").on(table.targetType, table.targetId),
  createdAtIdx: index("audit_created_idx").on(table.createdAt),
}));
export type AdminAuditLogEntry = typeof adminAuditLog.$inferSelect;
export type InsertAdminAuditLogEntry = typeof adminAuditLog.$inferInsert;

// Governance Policies: Configurable policy settings
export const governancePolicies = mysqlTable("governance_policies", {
  id: int("id").autoincrement().primaryKey(),
  
  // Policy identity
  policyKey: varchar("policyKey", { length: 100 }).notNull().unique(),
  policyName: varchar("policyName", { length: 200 }).notNull(),
  description: text("description"),
  
  // Policy value
  policyValue: json("policyValue").notNull(),
  defaultValue: json("defaultValue"),
  
  // Constraints
  minValue: json("minValue"),
  maxValue: json("maxValue"),
  allowedValues: json("allowedValues"),
  
  // Category
  category: mysqlEnum("category", [
    "evidence",
    "publication",
    "moderation",
    "security",
    "freshness",
    "quality",
    "other"
  ]).default("other"),
  
  // Status
  isActive: boolean("isActive").default(true),
  
  // Metadata
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  updatedBy: int("updatedBy"),
}, (table) => ({
  keyIdx: index("policy_key_idx").on(table.policyKey),
  categoryIdx: index("policy_category_idx").on(table.category),
}));
export type GovernancePolicy = typeof governancePolicies.$inferSelect;
export type InsertGovernancePolicy = typeof governancePolicies.$inferInsert;


// ============================================================================
// NOW LAYER: Updates + Signals + Governed Publishing (Prompt 13)
// ============================================================================

// UpdateItem - First-class evidence object for updates/news
export const updateItems = mysqlTable("update_items", {
  id: int("id").autoincrement().primaryKey(),
  
  // Bilingual content
  titleEn: varchar("titleEn", { length: 500 }).notNull(),
  titleAr: varchar("titleAr", { length: 500 }).notNull(),
  summaryEn: text("summaryEn").notNull(),
  summaryAr: text("summaryAr").notNull(),
  bodyEn: text("bodyEn"), // Optional - only if licensed
  bodyAr: text("bodyAr"),
  
  // Source information
  sourceId: int("sourceId").references(() => sources.id),
  sourcePublisher: varchar("sourcePublisher", { length: 255 }),
  sourceUrl: varchar("sourceUrl", { length: 1000 }).notNull(),
  publishedAt: timestamp("publishedAt").notNull(),
  retrievedAt: timestamp("retrievedAt").defaultNow().notNull(),
  
  // Deduplication
  contentHash: varchar("contentHash", { length: 64 }).notNull(), // SHA-256
  seenCount: int("seenCount").default(1),
  
  // Classification tags (JSON arrays)
  sectors: json("sectors").$type<string[]>().default([]),
  themes: json("themes").$type<string[]>().default([]),
  entities: json("entities").$type<string[]>().default([]),
  geography: json("geography").$type<string[]>().default([]),
  regimeTag: mysqlEnum("regimeTag", ["aden", "sanaa", "both", "neutral"]),
  
  // Sensitivity and confidence
  sensitivityLevel: mysqlEnum("sensitivityLevel", [
    "public_safe",
    "needs_review",
    "restricted_metadata_only"
  ]).default("needs_review").notNull(),
  confidenceGrade: mysqlEnum("confidenceGrade", ["A", "B", "C", "D"]).default("B"),
  confidenceReason: text("confidenceReason"),
  
  // DQAF quality summary
  dqafSummary: json("dqafSummary").$type<{
    accuracy: string;
    timeliness: string;
    coherence: string;
    accessibility: string;
  }>(),
  
  // Evidence (MANDATORY for publishable items)
  evidencePackId: int("evidencePackId").references(() => evidencePacks.id),
  
  // Status and visibility
  status: mysqlEnum("status", [
    "draft",
    "queued_for_review",
    "published",
    "rejected",
    "archived"
  ]).default("draft").notNull(),
  visibility: mysqlEnum("visibility", [
    "public",
    "vip_only",
    "admin_only"
  ]).default("admin_only").notNull(),
  
  // Update type
  updateType: mysqlEnum("updateType", [
    "publication",
    "funding",
    "policy",
    "data_release",
    "report",
    "announcement",
    "other"
  ]).default("other"),
  
  // Review metadata
  reviewedBy: int("reviewedBy").references(() => users.id),
  reviewedAt: timestamp("reviewedAt"),
  rejectionReason: text("rejectionReason"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  contentHashIdx: uniqueIndex("update_content_hash_idx").on(table.contentHash),
  sourceUrlIdx: index("update_source_url_idx").on(table.sourceUrl),
  statusIdx: index("update_status_idx").on(table.status),
  publishedAtIdx: index("update_published_at_idx").on(table.publishedAt),
  sourceIdIdx: index("update_source_id_idx").on(table.sourceId),
}));
export type UpdateItem = typeof updateItems.$inferSelect;
export type InsertUpdateItem = typeof updateItems.$inferInsert;

// UpdateEvidenceBundle - Evidence pack for update items
export const updateEvidenceBundles = mysqlTable("update_evidence_bundles", {
  id: int("id").autoincrement().primaryKey(),
  updateItemId: int("updateItemId").notNull().references(() => updateItems.id),
  
  // Citations
  citations: json("citations").$type<Array<{
    text: string;
    sourceUrl: string;
    anchor: string;
    pageNumber?: number;
    section?: string;
  }>>().default([]),
  
  // License information
  licenseType: varchar("licenseType", { length: 100 }),
  licenseUrl: varchar("licenseUrl", { length: 500 }),
  licensePermissions: json("licensePermissions").$type<{
    fullText: boolean;
    metadataOnly: boolean;
    derivative: boolean;
    commercial: boolean;
  }>(),
  
  // What changed extraction
  whatChanged: json("whatChanged").$type<Array<{
    claim: string;
    evidence: string;
    sourceAnchor: string;
  }>>().default([]),
  
  // Raw artifact storage
  rawArtifactUrl: varchar("rawArtifactUrl", { length: 1000 }),
  rawArtifactHash: varchar("rawArtifactHash", { length: 64 }),
  
  // Extraction anchors
  extractionAnchors: json("extractionAnchors").$type<Array<{
    type: "page" | "section" | "table" | "figure";
    reference: string;
    content: string;
  }>>().default([]),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  updateItemIdx: index("evidence_update_item_idx").on(table.updateItemId),
}));
export type UpdateEvidenceBundle = typeof updateEvidenceBundles.$inferSelect;
export type InsertUpdateEvidenceBundle = typeof updateEvidenceBundles.$inferInsert;

// UpdateSignal - Internal signals derived from updates
export const updateSignals = mysqlTable("update_signals", {
  id: int("id").autoincrement().primaryKey(),
  updateItemId: int("updateItemId").notNull().references(() => updateItems.id),
  
  // Signal type
  signalType: mysqlEnum("signalType", [
    "timeline_event",
    "sector_signal",
    "vip_alert",
    "admin_alert",
    "entity_update"
  ]).notNull(),
  
  // Target
  targetType: mysqlEnum("targetType", [
    "timeline",
    "sector",
    "vip_cockpit",
    "admin_dashboard",
    "entity_page"
  ]).notNull(),
  targetId: varchar("targetId", { length: 100 }), // sector code, entity id, etc.
  
  // Signal content
  signalTitleEn: varchar("signalTitleEn", { length: 255 }).notNull(),
  signalTitleAr: varchar("signalTitleAr", { length: 255 }).notNull(),
  signalSummaryEn: text("signalSummaryEn"),
  signalSummaryAr: text("signalSummaryAr"),
  
  // Priority
  priority: mysqlEnum("priority", ["critical", "high", "medium", "low"]).default("medium"),
  
  // Status
  status: mysqlEnum("status", [
    "pending",
    "approved",
    "rejected",
    "processed"
  ]).default("pending"),
  
  // Evidence
  evidencePackId: int("evidencePackId").references(() => evidencePacks.id),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  processedAt: timestamp("processedAt"),
}, (table) => ({
  updateItemIdx: index("signal_update_item_idx").on(table.updateItemId),
  signalTypeIdx: index("signal_type_idx").on(table.signalType),
  statusIdx: index("signal_status_idx").on(table.status),
}));
export type UpdateSignal = typeof updateSignals.$inferSelect;
export type InsertUpdateSignal = typeof updateSignals.$inferInsert;

// UpdateIngestionCheckpoint - Track ingestion progress per source
export const updateIngestionCheckpoints = mysqlTable("update_ingestion_checkpoints", {
  id: int("id").autoincrement().primaryKey(),
  sourceId: int("sourceId").notNull().references(() => sources.id),
  
  // Checkpoint state
  lastCursor: varchar("lastCursor", { length: 500 }),
  lastSeenDate: timestamp("lastSeenDate"),
  lastHash: varchar("lastHash", { length: 64 }),
  lastSuccessfulRun: timestamp("lastSuccessfulRun"),
  
  // Statistics
  totalIngested: int("totalIngested").default(0),
  totalDuplicates: int("totalDuplicates").default(0),
  totalErrors: int("totalErrors").default(0),
  
  // Rate limiting
  rateLimitRemaining: int("rateLimitRemaining"),
  rateLimitResetAt: timestamp("rateLimitResetAt"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  sourceIdIdx: uniqueIndex("checkpoint_source_id_idx").on(table.sourceId),
}));
export type UpdateIngestionCheckpoint = typeof updateIngestionCheckpoints.$inferSelect;
export type InsertUpdateIngestionCheckpoint = typeof updateIngestionCheckpoints.$inferInsert;

// UpdateNotification - Notifications triggered by updates
export const updateNotifications = mysqlTable("update_notifications", {
  id: int("id").autoincrement().primaryKey(),
  updateItemId: int("updateItemId").references(() => updateItems.id),
  updateSignalId: int("updateSignalId").references(() => updateSignals.id),
  
  // Notification type
  notificationType: mysqlEnum("notificationType", [
    "high_importance_update",
    "funding_shift",
    "new_report",
    "staleness_breach",
    "translation_qa_failure",
    "contradiction_detected"
  ]).notNull(),
  
  // Target audience
  targetRole: mysqlEnum("targetRole", [
    "admin",
    "data_steward",
    "vip_president",
    "vip_finance_minister",
    "vip_central_bank_governor",
    "vip_humanitarian_coordinator",
    "vip_donor_analyst",
    "partner",
    "public"
  ]),
  targetUserId: int("targetUserId").references(() => users.id),
  
  // Content
  titleEn: varchar("titleEn", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }).notNull(),
  bodyEn: text("bodyEn"),
  bodyAr: text("bodyAr"),
  
  // Channel
  channel: mysqlEnum("channel", ["in_app", "email", "webhook"]).default("in_app"),
  
  // Status
  status: mysqlEnum("status", [
    "pending",
    "sent",
    "failed",
    "read"
  ]).default("pending"),
  sentAt: timestamp("sentAt"),
  readAt: timestamp("readAt"),
  failureReason: text("failureReason"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  updateItemIdx: index("notification_update_item_idx").on(table.updateItemId),
  statusIdx: index("notification_status_idx").on(table.status),
  targetRoleIdx: index("notification_target_role_idx").on(table.targetRole),
}));
export type UpdateNotification = typeof updateNotifications.$inferSelect;
export type InsertUpdateNotification = typeof updateNotifications.$inferInsert;


// ============================================================================
// LITERATURE & KNOWLEDGE BASE TABLES (Prompt 14/31)
// ============================================================================

/**
 * Library Documents - First-class evidence objects with full provenance
 * Extends the concept of evidenceDocuments with comprehensive metadata
 */
export const libraryDocuments = mysqlTable("library_documents", {
  id: int("id").autoincrement().primaryKey(),
  
  // Identity
  docId: varchar("docId", { length: 50 }).notNull().unique(), // UUID or canonical ID
  
  // Titles (bilingual)
  titleEn: varchar("titleEn", { length: 500 }).notNull(),
  titleAr: varchar("titleAr", { length: 500 }),
  
  // Publisher (entity reference if resolvable)
  publisherName: varchar("publisherName", { length: 255 }).notNull(),
  publisherEntityId: int("publisherEntityId").references(() => entities.id),
  
  // Source reference
  sourceId: int("sourceId").references(() => sources.id),
  
  // URLs
  canonicalUrl: text("canonicalUrl"),
  
  // Dates
  publishedAt: timestamp("publishedAt"), // From publisher
  retrievedAt: timestamp("retrievedAt").notNull(), // System retrieval date
  
  // License classification
  licenseFlag: mysqlEnum("licenseFlag", [
    "open",
    "restricted_metadata_only",
    "unknown_requires_review"
  ]).default("unknown_requires_review").notNull(),
  licenseDetails: varchar("licenseDetails", { length: 255 }),
  
  // Original language
  languageOriginal: mysqlEnum("languageOriginal", ["en", "ar", "both", "other"]).default("en").notNull(),
  
  // Document type
  docType: mysqlEnum("docType", [
    "report",
    "working_paper",
    "policy_brief",
    "dataset_doc",
    "sitrep",
    "evaluation",
    "annex",
    "law_regulation",
    "bulletin",
    "circular",
    "press_release",
    "academic_paper",
    "thesis",
    "methodology_note",
    "other"
  ]).notNull(),
  
  // Sector associations
  sectors: json("sectors").$type<string[]>().default([]),
  
  // Entity associations
  entityIds: json("entityIds").$type<number[]>().default([]),
  
  // Geography references
  geographies: json("geographies").$type<string[]>().default([]),
  
  // Regime applicability
  regimeTagApplicability: mysqlEnum("regimeTagApplicability", [
    "aden_irg",
    "sanaa_defacto",
    "both",
    "mixed",
    "unknown"
  ]).default("unknown"),
  
  // Current version reference
  currentVersionId: int("currentVersionId"),
  
  // Status
  status: mysqlEnum("status", [
    "draft",
    "queued_for_review",
    "published",
    "archived"
  ]).default("draft").notNull(),
  
  // Importance ranking (for prioritization)
  importanceScore: int("importanceScore").default(50), // 0-100
  
  // Summary (evidence-only or AI-generated with label)
  summaryEn: text("summaryEn"),
  summaryAr: text("summaryAr"),
  summaryIsAiGenerated: boolean("summaryIsAiGenerated").default(false),
  
  // Metadata
  metadata: json("metadata").$type<Record<string, unknown>>(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy").references(() => users.id),
}, (table) => ({
  docIdIdx: uniqueIndex("lib_doc_id_idx").on(table.docId),
  sourceIdx: index("lib_doc_source_idx").on(table.sourceId),
  publisherIdx: index("lib_doc_publisher_idx").on(table.publisherEntityId),
  typeIdx: index("lib_doc_type_idx").on(table.docType),
  statusIdx: index("lib_doc_status_idx").on(table.status),
  publishedAtIdx: index("lib_doc_published_at_idx").on(table.publishedAt),
  licenseIdx: index("lib_doc_license_idx").on(table.licenseFlag),
}));
export type LibraryDocument = typeof libraryDocuments.$inferSelect;
export type InsertLibraryDocument = typeof libraryDocuments.$inferInsert;

/**
 * Document Versions - Track versions and content changes
 */
export const documentVersions = mysqlTable("document_versions", {
  id: int("id").autoincrement().primaryKey(),
  
  // Document reference
  documentId: int("documentId").notNull().references(() => libraryDocuments.id),
  
  // Version info
  versionNumber: int("versionNumber").default(1).notNull(),
  
  // Content hash for dedupe
  contentHash: varchar("contentHash", { length: 64 }).notNull(), // SHA-256
  
  // S3 storage (if licensed to store)
  s3OriginalKey: varchar("s3OriginalKey", { length: 500 }),
  s3OriginalUrl: text("s3OriginalUrl"),
  
  // File info
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"),
  pageCount: int("pageCount"),
  
  // Extraction status
  extractionStatus: mysqlEnum("extractionStatus", [
    "pending",
    "ok",
    "failed",
    "partial"
  ]).default("pending").notNull(),
  extractionMethod: mysqlEnum("extractionMethod", [
    "pdf_text",
    "table_parser",
    "ocr",
    "html_parse",
    "api_text",
    "manual"
  ]),
  extractionQualityScore: int("extractionQualityScore"), // 0-100, null if unknown
  extractionNotes: text("extractionNotes"),
  
  // Extracted text storage
  extractedTextKey: varchar("extractedTextKey", { length: 500 }), // S3 key for extracted text
  extractedTextUrl: text("extractedTextUrl"),
  
  // Translation status
  translationStatus: mysqlEnum("translationStatus", [
    "pending",
    "en_done",
    "ar_done",
    "both_done",
    "needs_review"
  ]).default("pending").notNull(),
  
  // Indexing status
  indexStatus: mysqlEnum("indexStatus", [
    "pending",
    "keyword_indexed",
    "vector_indexed",
    "both_indexed",
    "failed"
  ]).default("pending").notNull(),
  vectorEmbeddingKey: varchar("vectorEmbeddingKey", { length: 500 }),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  processedAt: timestamp("processedAt"),
}, (table) => ({
  documentIdx: index("doc_version_document_idx").on(table.documentId),
  hashIdx: index("doc_version_hash_idx").on(table.contentHash),
  extractionIdx: index("doc_version_extraction_idx").on(table.extractionStatus),
  translationIdx: index("doc_version_translation_idx").on(table.translationStatus),
  indexIdx: index("doc_version_index_idx").on(table.indexStatus),
}));
export type DocumentVersion = typeof documentVersions.$inferSelect;
export type InsertDocumentVersion = typeof documentVersions.$inferInsert;

/**
 * Citation Anchors - Quoteable anchors within documents
 */
export const citationAnchors = mysqlTable("citation_anchors", {
  id: int("id").autoincrement().primaryKey(),
  
  // Anchor ID
  anchorId: varchar("anchorId", { length: 50 }).notNull().unique(),
  
  // Version reference
  versionId: int("versionId").notNull().references(() => documentVersions.id),
  
  // Anchor type
  anchorType: mysqlEnum("anchorType", [
    "page_text",
    "page_bbox",
    "table_cell",
    "figure_caption",
    "section_header",
    "paragraph",
    "footnote"
  ]).notNull(),
  
  // Location info
  pageNumber: int("pageNumber"),
  sectionNumber: varchar("sectionNumber", { length: 50 }),
  
  // Bounding box (if available)
  bboxX: decimal("bboxX", { precision: 10, scale: 2 }),
  bboxY: decimal("bboxY", { precision: 10, scale: 2 }),
  bboxWidth: decimal("bboxWidth", { precision: 10, scale: 2 }),
  bboxHeight: decimal("bboxHeight", { precision: 10, scale: 2 }),
  
  // Character offsets (if text-based)
  charStart: int("charStart"),
  charEnd: int("charEnd"),
  
  // Snippet text (small, licensed excerpt only)
  snippetText: text("snippetText"),
  snippetTextAr: text("snippetTextAr"), // Translated snippet
  snippetHash: varchar("snippetHash", { length: 64 }), // Integrity check
  
  // Page image reference (for evidence drawer preview)
  s3PageImageKey: varchar("s3PageImageKey", { length: 500 }),
  s3PageImageUrl: text("s3PageImageUrl"),
  
  // Confidence
  confidence: mysqlEnum("confidence", ["high", "medium", "low"]).default("medium"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  anchorIdIdx: uniqueIndex("citation_anchor_id_idx").on(table.anchorId),
  versionIdx: index("citation_anchor_version_idx").on(table.versionId),
  typeIdx: index("citation_anchor_type_idx").on(table.anchorType),
  pageIdx: index("citation_anchor_page_idx").on(table.pageNumber),
}));
export type CitationAnchor = typeof citationAnchors.$inferSelect;
export type InsertCitationAnchor = typeof citationAnchors.$inferInsert;

/**
 * Extracted Tables - Tables extracted from documents
 */
export const extractedTables = mysqlTable("extracted_tables", {
  id: int("id").autoincrement().primaryKey(),
  
  // Table ID
  tableId: varchar("tableId", { length: 50 }).notNull().unique(),
  
  // Version reference
  versionId: int("versionId").notNull().references(() => documentVersions.id),
  
  // Location
  pageNumber: int("pageNumber"),
  tableIndex: int("tableIndex").default(0), // Index on page if multiple tables
  
  // Table metadata
  titleEn: varchar("titleEn", { length: 255 }),
  titleAr: varchar("titleAr", { length: 255 }),
  
  // Schema guess
  schemaGuess: json("schemaGuess").$type<Array<{
    columnName: string;
    columnNameAr?: string;
    dataType: "string" | "number" | "date" | "boolean" | "unknown";
    unit?: string;
  }>>(),
  
  // Row/column counts
  rowCount: int("rowCount"),
  columnCount: int("columnCount"),
  
  // S3 storage
  s3TableCsvKey: varchar("s3TableCsvKey", { length: 500 }),
  s3TableJsonKey: varchar("s3TableJsonKey", { length: 500 }),
  s3TableImageKey: varchar("s3TableImageKey", { length: 500 }),
  
  // Extraction notes
  extractionMethod: mysqlEnum("extractionMethod", [
    "camelot",
    "tabula",
    "ocr",
    "manual",
    "api"
  ]).default("manual"),
  extractionQuality: mysqlEnum("extractionQuality", [
    "high",
    "medium",
    "low",
    "needs_review"
  ]).default("needs_review"),
  extractionNotes: text("extractionNotes"),
  
  // Promotion status (to dataset)
  promotionStatus: mysqlEnum("promotionStatus", [
    "not_promoted",
    "pending_review",
    "promoted",
    "rejected"
  ]).default("not_promoted"),
  promotedDatasetId: int("promotedDatasetId"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  reviewedAt: timestamp("reviewedAt"),
  reviewedBy: int("reviewedBy").references(() => users.id),
}, (table) => ({
  tableIdIdx: uniqueIndex("extracted_table_id_idx").on(table.tableId),
  versionIdx: index("extracted_table_version_idx").on(table.versionId),
  promotionIdx: index("extracted_table_promotion_idx").on(table.promotionStatus),
}));
export type ExtractedTable = typeof extractedTables.$inferSelect;
export type InsertExtractedTable = typeof extractedTables.$inferInsert;

/**
 * Translation Records - Track translations with quality metrics
 */
export const translationRecords = mysqlTable("translation_records", {
  id: int("id").autoincrement().primaryKey(),
  
  // Translation ID
  translationId: varchar("translationId", { length: 50 }).notNull().unique(),
  
  // Version reference
  versionId: int("versionId").notNull().references(() => documentVersions.id),
  
  // Target language
  targetLang: mysqlEnum("targetLang", ["en", "ar"]).notNull(),
  
  // Method (stored but not shown publicly)
  method: mysqlEnum("method", [
    "human",
    "machine",
    "hybrid",
    "api"
  ]).default("machine").notNull(),
  modelVersion: varchar("modelVersion", { length: 100 }), // Internal tracking only
  
  // Quality metrics
  glossaryAdherenceScore: decimal("glossaryAdherenceScore", { precision: 5, scale: 2 }), // 0-100
  numericIntegrityPass: boolean("numericIntegrityPass").default(false),
  
  // Glossary issues found
  glossaryIssues: json("glossaryIssues").$type<Array<{
    term: string;
    expected: string;
    found: string;
    location: string;
  }>>(),
  
  // Numeric issues found
  numericIssues: json("numericIssues").$type<Array<{
    original: string;
    translated: string;
    location: string;
  }>>(),
  
  // Status
  status: mysqlEnum("status", [
    "pending",
    "ok",
    "needs_review",
    "rejected"
  ]).default("pending").notNull(),
  
  // S3 storage for translated text
  s3TranslatedKey: varchar("s3TranslatedKey", { length: 500 }),
  s3TranslatedUrl: text("s3TranslatedUrl"),
  
  // Review info
  reviewedBy: int("reviewedBy").references(() => users.id),
  reviewedAt: timestamp("reviewedAt"),
  reviewNotes: text("reviewNotes"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  translationIdIdx: uniqueIndex("translation_record_id_idx").on(table.translationId),
  versionIdx: index("translation_record_version_idx").on(table.versionId),
  statusIdx: index("translation_record_status_idx").on(table.status),
  langIdx: index("translation_record_lang_idx").on(table.targetLang),
}));
export type TranslationRecord = typeof translationRecords.$inferSelect;
export type InsertTranslationRecord = typeof translationRecords.$inferInsert;

/**
 * Document-Indicator Links - Connect documents to indicator series
 */
export const documentIndicatorLinks = mysqlTable("document_indicator_links", {
  id: int("id").autoincrement().primaryKey(),
  
  // Document reference
  documentId: int("documentId").notNull().references(() => libraryDocuments.id),
  
  // Series reference
  seriesId: int("seriesId").notNull().references(() => timeSeries.id),
  
  // Relation type
  relationType: mysqlEnum("relationType", [
    "source",
    "methodology",
    "analysis",
    "forecast",
    "validation",
    "contradiction"
  ]).notNull(),
  
  // Evidence anchor
  evidenceAnchorId: int("evidenceAnchorId").references(() => citationAnchors.id),
  
  // Notes
  notes: text("notes"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").references(() => users.id),
}, (table) => ({
  documentIdx: index("doc_indicator_link_doc_idx").on(table.documentId),
  seriesIdx: index("doc_indicator_link_series_idx").on(table.seriesId),
  relationIdx: index("doc_indicator_link_relation_idx").on(table.relationType),
}));
export type DocumentIndicatorLink = typeof documentIndicatorLinks.$inferSelect;
export type InsertDocumentIndicatorLink = typeof documentIndicatorLinks.$inferInsert;

/**
 * Document-Event Links - Connect documents to events
 */
export const documentEventLinks = mysqlTable("document_event_links", {
  id: int("id").autoincrement().primaryKey(),
  
  // Document reference
  documentId: int("documentId").notNull().references(() => libraryDocuments.id),
  
  // Event reference
  eventId: int("eventId").notNull().references(() => economicEvents.id),
  
  // Evidence anchor
  evidenceAnchorId: int("evidenceAnchorId").references(() => citationAnchors.id),
  
  // Notes
  notes: text("notes"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").references(() => users.id),
}, (table) => ({
  documentIdx: index("doc_event_link_doc_idx").on(table.documentId),
  eventIdx: index("doc_event_link_event_idx").on(table.eventId),
}));
export type DocumentEventLink = typeof documentEventLinks.$inferSelect;
export type InsertDocumentEventLink = typeof documentEventLinks.$inferInsert;

/**
 * Literature Gap Tickets - Track missing literature
 */
export const literatureGapTickets = mysqlTable("literature_gap_tickets", {
  id: int("id").autoincrement().primaryKey(),
  
  // Ticket ID
  ticketId: varchar("ticketId", { length: 50 }).notNull().unique(),
  
  // Gap description
  titleEn: varchar("titleEn", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }),
  descriptionEn: text("descriptionEn").notNull(),
  descriptionAr: text("descriptionAr"),
  
  // Gap scope
  yearStart: int("yearStart"),
  yearEnd: int("yearEnd"),
  sectors: json("sectors").$type<string[]>().default([]),
  publishers: json("publishers").$type<string[]>().default([]),
  
  // Why it matters
  impactEn: text("impactEn"),
  impactAr: text("impactAr"),
  
  // Candidate sources
  candidateSources: json("candidateSources").$type<Array<{
    name: string;
    url?: string;
    notes?: string;
  }>>(),
  
  // Acquisition plan
  acquisitionPlan: text("acquisitionPlan"),
  
  // Priority
  priority: mysqlEnum("priority", ["critical", "high", "medium", "low"]).default("medium"),
  
  // Status
  status: mysqlEnum("status", [
    "open",
    "in_progress",
    "resolved",
    "wont_fix"
  ]).default("open").notNull(),
  
  // Resolution
  resolvedBy: int("resolvedBy").references(() => users.id),
  resolvedAt: timestamp("resolvedAt"),
  resolutionNotes: text("resolutionNotes"),
  resolvedDocumentId: int("resolvedDocumentId").references(() => libraryDocuments.id),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy").references(() => users.id),
}, (table) => ({
  ticketIdIdx: uniqueIndex("lit_gap_ticket_id_idx").on(table.ticketId),
  statusIdx: index("lit_gap_status_idx").on(table.status),
  priorityIdx: index("lit_gap_priority_idx").on(table.priority),
}));
export type LiteratureGapTicket = typeof literatureGapTickets.$inferSelect;
export type InsertLiteratureGapTicket = typeof literatureGapTickets.$inferInsert;

/**
 * Literature Ingestion Runs - Track ingestion pipeline runs
 */
export const literatureIngestionRuns = mysqlTable("literature_ingestion_runs", {
  id: int("id").autoincrement().primaryKey(),
  
  // Run ID
  runId: varchar("runId", { length: 50 }).notNull().unique(),
  
  // Source
  sourceId: int("sourceId").references(() => sources.id),
  sourceName: varchar("sourceName", { length: 255 }).notNull(),
  
  // Run type
  runType: mysqlEnum("runType", [
    "scheduled",
    "manual",
    "backfill"
  ]).default("scheduled").notNull(),
  
  // Time window
  windowStart: timestamp("windowStart"),
  windowEnd: timestamp("windowEnd"),
  
  // Statistics
  documentsFound: int("documentsFound").default(0),
  documentsNew: int("documentsNew").default(0),
  documentsUpdated: int("documentsUpdated").default(0),
  documentsDuplicate: int("documentsDuplicate").default(0),
  documentsFailed: int("documentsFailed").default(0),
  
  // Extraction stats
  extractionsAttempted: int("extractionsAttempted").default(0),
  extractionsSucceeded: int("extractionsSucceeded").default(0),
  extractionsFailed: int("extractionsFailed").default(0),
  
  // Translation stats
  translationsAttempted: int("translationsAttempted").default(0),
  translationsSucceeded: int("translationsSucceeded").default(0),
  translationsFailed: int("translationsFailed").default(0),
  
  // Indexing stats
  indexingAttempted: int("indexingAttempted").default(0),
  indexingSucceeded: int("indexingSucceeded").default(0),
  indexingFailed: int("indexingFailed").default(0),
  
  // Status
  status: mysqlEnum("status", [
    "running",
    "completed",
    "failed",
    "partial"
  ]).default("running").notNull(),
  
  // Error info
  errorMessage: text("errorMessage"),
  errorDetails: json("errorDetails").$type<Record<string, unknown>>(),
  
  // Timestamps
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  
  // Triggered by
  triggeredBy: int("triggeredBy").references(() => users.id),
}, (table) => ({
  runIdIdx: uniqueIndex("lit_ingestion_run_id_idx").on(table.runId),
  sourceIdx: index("lit_ingestion_source_idx").on(table.sourceId),
  statusIdx: index("lit_ingestion_status_idx").on(table.status),
  startedAtIdx: index("lit_ingestion_started_at_idx").on(table.startedAt),
}));
export type LiteratureIngestionRun = typeof literatureIngestionRuns.$inferSelect;
export type InsertLiteratureIngestionRun = typeof literatureIngestionRuns.$inferInsert;

/**
 * Literature Coverage Map - Track coverage by year/sector/publisher
 */
export const literatureCoverageMap = mysqlTable("literature_coverage_map", {
  id: int("id").autoincrement().primaryKey(),
  
  // Dimensions
  year: int("year").notNull(),
  sector: varchar("sector", { length: 100 }).notNull(),
  publisherEntityId: int("publisherEntityId").references(() => entities.id),
  publisherName: varchar("publisherName", { length: 255 }),
  
  // Coverage metrics
  documentCount: int("documentCount").default(0),
  expectedDocumentCount: int("expectedDocumentCount"),
  coveragePercent: decimal("coveragePercent", { precision: 5, scale: 2 }),
  
  // Quality metrics
  avgExtractionQuality: decimal("avgExtractionQuality", { precision: 5, scale: 2 }),
  avgTranslationQuality: decimal("avgTranslationQuality", { precision: 5, scale: 2 }),
  
  // Gap status
  hasGap: boolean("hasGap").default(false),
  gapTicketId: int("gapTicketId").references(() => literatureGapTickets.id),
  
  // Last updated
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  yearIdx: index("lit_coverage_year_idx").on(table.year),
  sectorIdx: index("lit_coverage_sector_idx").on(table.sector),
  publisherIdx: index("lit_coverage_publisher_idx").on(table.publisherEntityId),
  yearSectorIdx: index("lit_coverage_year_sector_idx").on(table.year, table.sector),
}));
export type LiteratureCoverageMapEntry = typeof literatureCoverageMap.$inferSelect;
export type InsertLiteratureCoverageMapEntry = typeof literatureCoverageMap.$inferInsert;

/**
 * Document Search Index - For keyword search
 */
export const documentSearchIndex = mysqlTable("document_search_index", {
  id: int("id").autoincrement().primaryKey(),
  
  // Document reference
  documentId: int("documentId").notNull().references(() => libraryDocuments.id),
  versionId: int("versionId").notNull().references(() => documentVersions.id),
  
  // Language
  language: mysqlEnum("language", ["en", "ar"]).notNull(),
  
  // Searchable content
  titleText: text("titleText"),
  bodyText: text("bodyText"),
  
  // Keywords extracted
  keywords: json("keywords").$type<string[]>().default([]),
  
  // Named entities extracted
  namedEntities: json("namedEntities").$type<Array<{
    text: string;
    type: string;
    count: number;
  }>>(),
  
  // Last indexed
  indexedAt: timestamp("indexedAt").defaultNow().notNull(),
}, (table) => ({
  documentIdx: index("doc_search_document_idx").on(table.documentId),
  versionIdx: index("doc_search_version_idx").on(table.versionId),
  languageIdx: index("doc_search_language_idx").on(table.language),
}));
export type DocumentSearchIndexEntry = typeof documentSearchIndex.$inferSelect;
export type InsertDocumentSearchIndexEntry = typeof documentSearchIndex.$inferInsert;

