/**
 * YETO Platform - Comprehensive Audit Logger
 * 
 * Provides detailed audit logging for all sensitive operations.
 * Ensures compliance with security requirements and governance neutrality.
 */

import { getDb } from "../db";

// ============================================
// Types
// ============================================

export type AuditAction =
  | "USER_LOGIN"
  | "USER_LOGOUT"
  | "USER_CREATED"
  | "USER_UPDATED"
  | "USER_DELETED"
  | "ROLE_CHANGED"
  | "DATA_VIEWED"
  | "DATA_EXPORTED"
  | "DATA_CREATED"
  | "DATA_UPDATED"
  | "DATA_DELETED"
  | "INGESTION_STARTED"
  | "INGESTION_COMPLETED"
  | "INGESTION_FAILED"
  | "REPORT_GENERATED"
  | "API_KEY_CREATED"
  | "API_KEY_REVOKED"
  | "SETTINGS_CHANGED"
  | "ADMIN_ACTION"
  | "SECURITY_EVENT";

export type AuditSeverity = "info" | "warning" | "critical";

export interface AuditLogEntry {
  id?: string;
  timestamp: Date;
  action: AuditAction;
  severity: AuditSeverity;
  userId: string | null;
  userRole: string | null;
  resourceType: string;
  resourceId: string | null;
  details: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  correlationId: string | null;
  success: boolean;
  errorMessage: string | null;
}

// ============================================
// Audit Logger Class
// ============================================

class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private maxInMemoryLogs = 1000;
  
  /**
   * Log an audit event
   */
  async log(entry: Omit<AuditLogEntry, "id" | "timestamp">): Promise<void> {
    const fullEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date(),
      id: this.generateId(),
    };
    
    // Store in memory
    this.logs.push(fullEntry);
    if (this.logs.length > this.maxInMemoryLogs) {
      this.logs = this.logs.slice(-this.maxInMemoryLogs);
    }
    
    // Log to console in development
    if (process.env.NODE_ENV !== "production") {
      console.log(`[AUDIT] ${fullEntry.action} - ${fullEntry.resourceType}/${fullEntry.resourceId} by ${fullEntry.userId || "anonymous"}`);
    }
    
    // Persist to database
    try {
      await this.persistToDatabase(fullEntry);
    } catch (error) {
      console.error("[AUDIT] Failed to persist audit log:", error);
    }
  }
  
  /**
   * Log a user action
   */
  async logUserAction(
    action: AuditAction,
    userId: string | null,
    userRole: string | null,
    resourceType: string,
    resourceId: string | null,
    details: Record<string, unknown> = {},
    options: {
      ipAddress?: string;
      userAgent?: string;
      correlationId?: string;
      success?: boolean;
      errorMessage?: string;
      severity?: AuditSeverity;
    } = {}
  ): Promise<void> {
    await this.log({
      action,
      severity: options.severity || this.getSeverityForAction(action),
      userId,
      userRole,
      resourceType,
      resourceId,
      details,
      ipAddress: options.ipAddress || null,
      userAgent: options.userAgent || null,
      correlationId: options.correlationId || null,
      success: options.success ?? true,
      errorMessage: options.errorMessage || null,
    });
  }
  
  /**
   * Log a security event
   */
  async logSecurityEvent(
    eventType: string,
    details: Record<string, unknown>,
    severity: AuditSeverity = "warning"
  ): Promise<void> {
    await this.log({
      action: "SECURITY_EVENT",
      severity,
      userId: null,
      userRole: null,
      resourceType: "security",
      resourceId: eventType,
      details,
      ipAddress: null,
      userAgent: null,
      correlationId: null,
      success: true,
      errorMessage: null,
    });
  }
  
  /**
   * Log data access
   */
  async logDataAccess(
    userId: string | null,
    userRole: string | null,
    dataType: string,
    dataId: string,
    accessType: "view" | "export" | "download",
    details: Record<string, unknown> = {}
  ): Promise<void> {
    const action: AuditAction = accessType === "view" ? "DATA_VIEWED" : "DATA_EXPORTED";
    
    await this.log({
      action,
      severity: "info",
      userId,
      userRole,
      resourceType: dataType,
      resourceId: dataId,
      details: { accessType, ...details },
      ipAddress: null,
      userAgent: null,
      correlationId: null,
      success: true,
      errorMessage: null,
    });
  }
  
  /**
   * Log admin action
   */
  async logAdminAction(
    userId: string,
    userRole: string,
    actionDescription: string,
    targetResource: string,
    targetId: string,
    details: Record<string, unknown> = {}
  ): Promise<void> {
    await this.log({
      action: "ADMIN_ACTION",
      severity: "warning",
      userId,
      userRole,
      resourceType: targetResource,
      resourceId: targetId,
      details: { actionDescription, ...details },
      ipAddress: null,
      userAgent: null,
      correlationId: null,
      success: true,
      errorMessage: null,
    });
  }
  
  /**
   * Get recent audit logs
   */
  getRecentLogs(limit: number = 100): AuditLogEntry[] {
    return this.logs.slice(-limit);
  }
  
  /**
   * Get logs by action type
   */
  getLogsByAction(action: AuditAction, limit: number = 100): AuditLogEntry[] {
    return this.logs
      .filter(log => log.action === action)
      .slice(-limit);
  }
  
  /**
   * Get logs by user
   */
  getLogsByUser(userId: string, limit: number = 100): AuditLogEntry[] {
    return this.logs
      .filter(log => log.userId === userId)
      .slice(-limit);
  }
  
  /**
   * Get security events
   */
  getSecurityEvents(severity?: AuditSeverity, limit: number = 100): AuditLogEntry[] {
    let filtered = this.logs.filter(log => log.action === "SECURITY_EVENT");
    
    if (severity) {
      filtered = filtered.filter(log => log.severity === severity);
    }
    
    return filtered.slice(-limit);
  }
  
  /**
   * Get logs for a specific resource
   */
  getLogsForResource(resourceType: string, resourceId: string, limit: number = 100): AuditLogEntry[] {
    return this.logs
      .filter(log => log.resourceType === resourceType && log.resourceId === resourceId)
      .slice(-limit);
  }
  
  /**
   * Generate audit report
   */
  generateReport(startDate: Date, endDate: Date): {
    totalEvents: number;
    byAction: Record<string, number>;
    bySeverity: Record<string, number>;
    byUser: Record<string, number>;
    securityEvents: number;
    failedOperations: number;
  } {
    const filtered = this.logs.filter(
      log => log.timestamp >= startDate && log.timestamp <= endDate
    );
    
    const byAction: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const byUser: Record<string, number> = {};
    let securityEvents = 0;
    let failedOperations = 0;
    
    filtered.forEach(log => {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
      bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1;
      
      if (log.userId) {
        byUser[log.userId] = (byUser[log.userId] || 0) + 1;
      }
      
      if (log.action === "SECURITY_EVENT") {
        securityEvents++;
      }
      
      if (!log.success) {
        failedOperations++;
      }
    });
    
    return {
      totalEvents: filtered.length,
      byAction,
      bySeverity,
      byUser,
      securityEvents,
      failedOperations,
    };
  }
  
  // ============================================
  // Private Methods
  // ============================================
  
  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private getSeverityForAction(action: AuditAction): AuditSeverity {
    const criticalActions: AuditAction[] = [
      "USER_DELETED",
      "ROLE_CHANGED",
      "API_KEY_REVOKED",
      "SECURITY_EVENT",
    ];
    
    const warningActions: AuditAction[] = [
      "DATA_DELETED",
      "SETTINGS_CHANGED",
      "ADMIN_ACTION",
      "INGESTION_FAILED",
    ];
    
    if (criticalActions.includes(action)) return "critical";
    if (warningActions.includes(action)) return "warning";
    return "info";
  }
  
  private async persistToDatabase(entry: AuditLogEntry): Promise<void> {
    // In production, this would persist to the database
    // For now, we just store in memory
    // The actual implementation would use the auditLogs table
  }
}

// ============================================
// Singleton Instance
// ============================================

let auditLoggerInstance: AuditLogger | null = null;

export function getAuditLogger(): AuditLogger {
  if (!auditLoggerInstance) {
    auditLoggerInstance = new AuditLogger();
  }
  return auditLoggerInstance;
}

// ============================================
// Convenience Functions
// ============================================

export async function logUserLogin(
  userId: string,
  userRole: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await getAuditLogger().logUserAction(
    "USER_LOGIN",
    userId,
    userRole,
    "auth",
    userId,
    {},
    { ipAddress, userAgent }
  );
}

export async function logUserLogout(userId: string, userRole: string): Promise<void> {
  await getAuditLogger().logUserAction(
    "USER_LOGOUT",
    userId,
    userRole,
    "auth",
    userId
  );
}

export async function logDataExport(
  userId: string | null,
  userRole: string | null,
  dataType: string,
  format: string,
  recordCount: number
): Promise<void> {
  await getAuditLogger().logDataAccess(
    userId,
    userRole,
    dataType,
    "export",
    "export",
    { format, recordCount }
  );
}

export async function logIngestionEvent(
  connectorId: string,
  status: "started" | "completed" | "failed",
  details: Record<string, unknown> = {}
): Promise<void> {
  const action: AuditAction = 
    status === "started" ? "INGESTION_STARTED" :
    status === "completed" ? "INGESTION_COMPLETED" : "INGESTION_FAILED";
  
  await getAuditLogger().logUserAction(
    action,
    "system",
    "system",
    "connector",
    connectorId,
    details,
    { success: status !== "failed" }
  );
}

export async function logSecurityViolation(
  violationType: string,
  details: Record<string, unknown>,
  ipAddress?: string
): Promise<void> {
  await getAuditLogger().logSecurityEvent(
    violationType,
    { ...details, ipAddress },
    "critical"
  );
}

export default {
  getAuditLogger,
  logUserLogin,
  logUserLogout,
  logDataExport,
  logIngestionEvent,
  logSecurityViolation,
};
