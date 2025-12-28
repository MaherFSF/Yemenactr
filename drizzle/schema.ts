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
  role: mysqlEnum("role", ["user", "admin", "analyst", "partner_contributor"]).default("user").notNull(),
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
