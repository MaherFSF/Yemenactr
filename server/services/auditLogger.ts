/**
 * Audit Logger Service
 * 
 * Provides comprehensive audit logging for all admin actions
 * Tracks user actions, resource changes, and security events
 */

import { getDb } from "../db";
import { auditLogs } from "../../drizzle/schema";

export type AuditAction = 
  | 'user.login'
  | 'user.logout'
  | 'user.create'
  | 'user.update'
  | 'user.delete'
  | 'user.role_change'
  | 'data.create'
  | 'data.update'
  | 'data.delete'
  | 'data.import'
  | 'data.export'
  | 'settings.change'
  | 'api_key.create'
  | 'api_key.revoke'
  | 'webhook.create'
  | 'webhook.update'
  | 'webhook.delete'
  | 'connector.enable'
  | 'connector.disable'
  | 'connector.configure'
  | 'report.generate'
  | 'report.publish'
  | 'security.access_denied'
  | 'security.suspicious_activity'
  | 'admin.action';

export type AuditStatus = 'success' | 'failure' | 'warning';

export interface AuditLogEntry {
  userId?: number;
  userEmail?: string;
  userRole?: string;
  action: AuditAction | string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  status?: AuditStatus;
}

/**
 * Log an audit event
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn('[AuditLogger] Database not available');
      return;
    }
    await db.insert(auditLogs).values({
      userId: entry.userId ?? null,
      userEmail: entry.userEmail ?? null,
      userRole: entry.userRole ?? null,
      action: entry.action,
      resourceType: entry.resourceType ?? null,
      resourceId: entry.resourceId ?? null,
      details: entry.details ? JSON.stringify(entry.details) : null,
      ipAddress: entry.ipAddress ?? null,
      userAgent: entry.userAgent ?? null,
      status: entry.status ?? 'success',
    });
  } catch (error) {
    // Log to console but don't throw - audit logging should not break main operations
    console.error('[AuditLogger] Failed to log audit event:', error);
  }
}

/**
 * Log a user action with context from tRPC context
 */
export async function logUserAction(
  ctx: { user?: { id: number; email?: string | null; role: string } | null; req?: { ip?: string; headers?: { 'user-agent'?: string } } },
  action: AuditAction | string,
  resourceType?: string,
  resourceId?: string,
  details?: Record<string, unknown>,
  status: AuditStatus = 'success'
): Promise<void> {
  await logAuditEvent({
    userId: ctx.user?.id,
    userEmail: ctx.user?.email ?? undefined,
    userRole: ctx.user?.role,
    action,
    resourceType,
    resourceId,
    details,
    ipAddress: ctx.req?.ip,
    userAgent: ctx.req?.headers?.['user-agent'],
    status,
  });
}

/**
 * Log a security event (access denied, suspicious activity, etc.)
 */
export async function logSecurityEvent(
  action: 'security.access_denied' | 'security.suspicious_activity',
  details: Record<string, unknown>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAuditEvent({
    action,
    details,
    ipAddress,
    userAgent,
    status: 'warning',
  });
}

/**
 * Get recent audit logs for admin dashboard
 */
export async function getRecentAuditLogs(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  const { desc } = await import('drizzle-orm');
  return db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}

/**
 * Get audit logs for a specific user
 */
export async function getUserAuditLogs(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  const { desc, eq } = await import('drizzle-orm');
  return db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.userId, userId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}

/**
 * Get audit logs for a specific resource
 */
export async function getResourceAuditLogs(
  resourceType: string,
  resourceId: string,
  limit: number = 50
) {
  const db = await getDb();
  if (!db) return [];
  const { desc, eq, and } = await import('drizzle-orm');
  return db
    .select()
    .from(auditLogs)
    .where(
      and(
        eq(auditLogs.resourceType, resourceType),
        eq(auditLogs.resourceId, resourceId)
      )
    )
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}

/**
 * Get audit logs by action type
 */
export async function getAuditLogsByAction(action: string, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  const { desc, eq } = await import('drizzle-orm');
  return db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.action, action))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}
