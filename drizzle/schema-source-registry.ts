/**
 * Source Registry - Contact information and API registration instructions
 */

import { mysqlTable, int, varchar, text, timestamp, boolean, mysqlEnum, json, index } from "drizzle-orm/mysql-core";
import { sourceRegistry } from "./schema";

// ============================================================================
// SOURCE CONTACTS - Contact information for each data source
// ============================================================================

export const sourceContacts = mysqlTable("source_contacts", {
  id: int("id").autoincrement().primaryKey(),
  sourceId: int("sourceId").notNull().references(() => sourceRegistry.id),
  contactType: mysqlEnum("contactType", ["api_support", "data_team", "general", "partnership"]).notNull(),
  contactName: varchar("contactName", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  department: varchar("department", { length: 255 }),
  role: varchar("role", { length: 255 }),
  notes: text("notes"),
  isPrimary: boolean("isPrimary").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  sourceIdx: index("source_contact_source_idx").on(table.sourceId),
  emailIdx: index("source_contact_email_idx").on(table.email),
  primaryIdx: index("source_contact_primary_idx").on(table.isPrimary),
}));

export type SourceContact = typeof sourceContacts.$inferSelect;
export type InsertSourceContact = typeof sourceContacts.$inferInsert;

// ============================================================================
// API REGISTRATION INSTRUCTIONS - Step-by-step guides for obtaining API keys
// ============================================================================

export const apiRegistrationInstructions = mysqlTable("api_registration_instructions", {
  id: int("id").autoincrement().primaryKey(),
  sourceId: int("sourceId").notNull().references(() => sourceRegistry.id),
  registrationUrl: text("registrationUrl").notNull(), // URL to API registration page
  documentationUrl: text("documentationUrl"), // API documentation URL
  credentialType: mysqlEnum("credentialType", ["api_key", "oauth_token", "basic_auth", "certificate"]).notNull(),
  
  // Step-by-step instructions (stored as JSON array of steps)
  steps: json("steps").$type<Array<{
    stepNumber: number;
    title: string;
    description: string;
    screenshot?: string; // S3 URL to screenshot
    tips?: string[];
  }>>().notNull(),
  
  // Requirements
  requiresInstitutionalEmail: boolean("requiresInstitutionalEmail").default(false).notNull(),
  requiresApproval: boolean("requiresApproval").default(false).notNull(),
  approvalTimeline: varchar("approvalTimeline", { length: 100 }), // e.g., "1-3 business days"
  requiresPayment: boolean("requiresPayment").default(false).notNull(),
  pricingInfo: text("pricingInfo"),
  
  // Key characteristics
  keyFormat: varchar("keyFormat", { length: 255 }), // e.g., "Bearer token", "API key in header"
  keyLocation: varchar("keyLocation", { length: 100 }), // e.g., "header", "query_param"
  keyHeaderName: varchar("keyHeaderName", { length: 100 }), // e.g., "X-API-Key", "Authorization"
  exampleRequest: text("exampleRequest"), // cURL example
  
  // Rate limits
  defaultRateLimit: int("defaultRateLimit"),
  rateLimitPeriod: varchar("rateLimitPeriod", { length: 50 }), // 'day', 'hour', 'minute'
  rateLimitNotes: text("rateLimitNotes"),
  
  // Additional info
  commonIssues: json("commonIssues").$type<Array<{
    issue: string;
    solution: string;
  }>>(),
  tipsAndTricks: json("tipsAndTricks").$type<string[]>(),
  lastVerifiedAt: timestamp("lastVerifiedAt"),
  verifiedBy: varchar("verifiedBy", { length: 64 }), // User openId
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  sourceIdx: index("api_reg_source_idx").on(table.sourceId),
  credTypeIdx: index("api_reg_cred_type_idx").on(table.credentialType),
}));

export type ApiRegistrationInstruction = typeof apiRegistrationInstructions.$inferSelect;
export type InsertApiRegistrationInstruction = typeof apiRegistrationInstructions.$inferInsert;
