/**
 * YETO Webhook Schema
 * 
 * Drizzle ORM schema for webhook endpoints, deliveries, and audit logs
 */

import {
  pgTable,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  json,
  index,
  uniqueIndex,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * Webhook Endpoints Table
 * Stores webhook configurations and metadata
 */
export const webhookEndpoints = pgTable(
  'webhook_endpoints',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    url: varchar('url', { length: 2048 }).notNull().unique(),
    name: varchar('name', { length: 255 }),
    description: text('description'),
    events: json('events').default([]).notNull(),
    active: boolean('active').default(true).notNull(),
    headers: json('headers'),
    authType: varchar('auth_type', { length: 50 }),
    authToken: varchar('auth_token', { length: 1024 }),
    retryMaxAttempts: integer('retry_max_attempts').default(3).notNull(),
    retryBackoffBase: integer('retry_backoff_base').default(2).notNull(),
    timeoutMs: integer('timeout_ms').default(10000).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    createdBy: varchar('created_by', { length: 36 }),
  },
  (table) => ({
    activeIdx: index('idx_webhook_endpoints_active').on(table.active),
    createdAtIdx: index('idx_webhook_endpoints_created_at').on(table.createdAt),
    urlUniqueIdx: uniqueIndex('idx_webhook_endpoints_url_unique').on(table.url),
  })
);

/**
 * Webhook Deliveries Table
 * Tracks webhook delivery attempts and results
 */
export const webhookDeliveries = pgTable(
  'webhook_deliveries',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    webhookId: varchar('webhook_id', { length: 36 }).notNull(),
    eventType: varchar('event_type', { length: 50 }).notNull(),
    sourceId: varchar('source_id', { length: 255 }).notNull(),
    sourceName: varchar('source_name', { length: 255 }),
    status: varchar('status', { length: 50 }).notNull(),
    httpStatusCode: integer('http_status_code'),
    responseTimeMs: integer('response_time_ms'),
    attemptNumber: integer('attempt_number').default(1).notNull(),
    errorMessage: text('error_message'),
    payload: json('payload'),
    responseBody: text('response_body'),
    nextRetryAt: timestamp('next_retry_at'),
    deliveredAt: timestamp('delivered_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    webhookIdIdx: index('idx_webhook_deliveries_webhook_id').on(table.webhookId),
    eventTypeIdx: index('idx_webhook_deliveries_event_type').on(table.eventType),
    sourceIdIdx: index('idx_webhook_deliveries_source_id').on(table.sourceId),
    statusIdx: index('idx_webhook_deliveries_status').on(table.status),
    createdAtIdx: index('idx_webhook_deliveries_created_at').on(table.createdAt),
    nextRetryAtIdx: index('idx_webhook_deliveries_next_retry_at').on(table.nextRetryAt),
    webhookStatusIdx: index('idx_webhook_deliveries_webhook_status').on(table.webhookId, table.status),
    eventSourceIdx: index('idx_webhook_deliveries_event_source').on(table.eventType, table.sourceId),
  })
);

/**
 * Webhook Event Log Table
 * Logs all webhook events for auditing
 */
export const webhookEventLog = pgTable(
  'webhook_event_log',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    webhookId: varchar('webhook_id', { length: 36 }),
    eventType: varchar('event_type', { length: 50 }).notNull(),
    sourceId: varchar('source_id', { length: 255 }).notNull(),
    sourceName: varchar('source_name', { length: 255 }),
    eventData: json('event_data'),
    processed: boolean('processed').default(false).notNull(),
    processedAt: timestamp('processed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    webhookIdIdx: index('idx_webhook_event_log_webhook_id').on(table.webhookId),
    eventTypeIdx: index('idx_webhook_event_log_event_type').on(table.eventType),
    sourceIdIdx: index('idx_webhook_event_log_source_id').on(table.sourceId),
    processedIdx: index('idx_webhook_event_log_processed').on(table.processed),
    createdAtIdx: index('idx_webhook_event_log_created_at').on(table.createdAt),
  })
);

/**
 * Webhook Audit Log Table
 * Tracks configuration changes for compliance
 */
export const webhookAuditLog = pgTable(
  'webhook_audit_log',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    webhookId: varchar('webhook_id', { length: 36 }),
    action: varchar('action', { length: 50 }).notNull(),
    oldValue: json('old_value'),
    newValue: json('new_value'),
    changedBy: varchar('changed_by', { length: 36 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    webhookIdIdx: index('idx_webhook_audit_log_webhook_id').on(table.webhookId),
    actionIdx: index('idx_webhook_audit_log_action').on(table.action),
    createdAtIdx: index('idx_webhook_audit_log_created_at').on(table.createdAt),
  })
);

/**
 * Relations
 */
export const webhookEndpointsRelations = relations(webhookEndpoints, ({ many }) => ({
  deliveries: many(webhookDeliveries),
  eventLogs: many(webhookEventLog),
  auditLogs: many(webhookAuditLog),
}));

export const webhookDeliveriesRelations = relations(webhookDeliveries, ({ one }) => ({
  endpoint: one(webhookEndpoints, {
    fields: [webhookDeliveries.webhookId],
    references: [webhookEndpoints.id],
  }),
}));

export const webhookEventLogRelations = relations(webhookEventLog, ({ one }) => ({
  endpoint: one(webhookEndpoints, {
    fields: [webhookEventLog.webhookId],
    references: [webhookEndpoints.id],
  }),
}));

export const webhookAuditLogRelations = relations(webhookAuditLog, ({ one }) => ({
  endpoint: one(webhookEndpoints, {
    fields: [webhookAuditLog.webhookId],
    references: [webhookEndpoints.id],
  }),
}));

export type WebhookEndpoint = typeof webhookEndpoints.$inferSelect;
export type NewWebhookEndpoint = typeof webhookEndpoints.$inferInsert;
export type WebhookDelivery = typeof webhookDeliveries.$inferSelect;
export type NewWebhookDelivery = typeof webhookDeliveries.$inferInsert;
export type WebhookEventLog = typeof webhookEventLog.$inferSelect;
export type NewWebhookEventLog = typeof webhookEventLog.$inferInsert;
export type WebhookAuditLog = typeof webhookAuditLog.$inferSelect;
export type NewWebhookAuditLog = typeof webhookAuditLog.$inferInsert;
