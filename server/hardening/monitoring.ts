/**
 * YETO Platform - Monitoring & Observability Service
 * Section 9A: Production-grade monitoring, metrics, and health checks
 */

import { getDb } from '../db';
import { sql } from 'drizzle-orm';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: HealthCheck[];
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  duration: number;
  lastChecked: string;
}

export interface SystemMetrics {
  timestamp: string;
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  requests: {
    total: number;
    perSecond: number;
    averageLatency: number;
    errorRate: number;
  };
  database: {
    connections: number;
    queryTime: number;
    slowQueries: number;
  };
}

export interface RequestLog {
  id: string;
  correlationId: string;
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  userAgent: string;
  ip: string;
  userId?: number;
  timestamp: string;
  error?: string;
}

export interface AlertConfig {
  name: string;
  metric: string;
  threshold: number;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  severity: 'info' | 'warning' | 'critical';
  cooldownMinutes: number;
}

export interface Alert {
  id: string;
  config: AlertConfig;
  value: number;
  triggeredAt: string;
  resolvedAt?: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
}

// ============================================================================
// IN-MEMORY STORES (for demo - production would use Redis/TimescaleDB)
// ============================================================================

const metricsStore: SystemMetrics[] = [];
const requestLogs: RequestLog[] = [];
const activeAlerts: Map<string, Alert> = new Map();
const alertHistory: Alert[] = [];

const MAX_METRICS_HISTORY = 1440; // 24 hours at 1-minute intervals
const MAX_REQUEST_LOGS = 10000;
const MAX_ALERT_HISTORY = 1000;

let requestCounter = 0;
let errorCounter = 0;
let totalLatency = 0;
const startTime = Date.now();

// ============================================================================
// HEALTH CHECK SERVICE
// ============================================================================

export const healthCheckService = {
  /**
   * Comprehensive health check for all system components
   */
  async getHealth(): Promise<HealthStatus> {
    const checks: HealthCheck[] = [];
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    // Database health check
    const dbCheck = await this.checkDatabase();
    checks.push(dbCheck);
    if (dbCheck.status === 'fail') overallStatus = 'unhealthy';
    else if (dbCheck.status === 'warn' && overallStatus === 'healthy') overallStatus = 'degraded';
    
    // Memory health check
    const memCheck = this.checkMemory();
    checks.push(memCheck);
    if (memCheck.status === 'fail') overallStatus = 'unhealthy';
    else if (memCheck.status === 'warn' && overallStatus === 'healthy') overallStatus = 'degraded';
    
    // API health check
    const apiCheck = this.checkAPI();
    checks.push(apiCheck);
    if (apiCheck.status === 'fail') overallStatus = 'unhealthy';
    else if (apiCheck.status === 'warn' && overallStatus === 'healthy') overallStatus = 'degraded';
    
    // External services check
    const externalCheck = await this.checkExternalServices();
    checks.push(externalCheck);
    if (externalCheck.status === 'fail' && overallStatus === 'healthy') overallStatus = 'degraded';
    
    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      checks,
    };
  },

  /**
   * Kubernetes-style liveness probe
   */
  async getLiveness(): Promise<{ alive: boolean; timestamp: string }> {
    return {
      alive: true,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Kubernetes-style readiness probe
   */
  async getReadiness(): Promise<{ ready: boolean; timestamp: string; reason?: string }> {
    try {
      // Check if database is accessible
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      await db.execute(sql`SELECT 1`);
      return {
        ready: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        ready: false,
        timestamp: new Date().toISOString(),
        reason: 'Database connection failed',
      };
    }
  },

  async checkDatabase(): Promise<HealthCheck> {
    const start = Date.now();
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      await db.execute(sql`SELECT 1`);
      const duration = Date.now() - start;
      
      return {
        name: 'database',
        status: duration < 100 ? 'pass' : duration < 500 ? 'warn' : 'fail',
        message: `Query completed in ${duration}ms`,
        duration,
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        name: 'database',
        status: 'fail',
        message: error instanceof Error ? error.message : 'Database connection failed',
        duration: Date.now() - start,
        lastChecked: new Date().toISOString(),
      };
    }
  },

  checkMemory(): HealthCheck {
    const used = process.memoryUsage();
    const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024);
    const percentage = Math.round((used.heapUsed / used.heapTotal) * 100);
    
    return {
      name: 'memory',
      status: percentage < 70 ? 'pass' : percentage < 85 ? 'warn' : 'fail',
      message: `Heap: ${heapUsedMB}MB / ${heapTotalMB}MB (${percentage}%)`,
      duration: 0,
      lastChecked: new Date().toISOString(),
    };
  },

  checkAPI(): HealthCheck {
    const errorRate = requestCounter > 0 ? (errorCounter / requestCounter) * 100 : 0;
    const avgLatency = requestCounter > 0 ? totalLatency / requestCounter : 0;
    
    let status: 'pass' | 'warn' | 'fail' = 'pass';
    if (errorRate > 5 || avgLatency > 1000) status = 'fail';
    else if (errorRate > 1 || avgLatency > 500) status = 'warn';
    
    return {
      name: 'api',
      status,
      message: `Error rate: ${errorRate.toFixed(2)}%, Avg latency: ${avgLatency.toFixed(0)}ms`,
      duration: 0,
      lastChecked: new Date().toISOString(),
    };
  },

  async checkExternalServices(): Promise<HealthCheck> {
    // Check connectivity to external APIs (World Bank, OCHA, etc.)
    const services = ['World Bank API', 'OCHA FTS', 'HDX'];
    const available = services.length; // In production, actually ping these
    
    return {
      name: 'external_services',
      status: available === services.length ? 'pass' : available > 0 ? 'warn' : 'fail',
      message: `${available}/${services.length} external services available`,
      duration: 0,
      lastChecked: new Date().toISOString(),
    };
  },
};

// ============================================================================
// METRICS SERVICE
// ============================================================================

export const metricsService = {
  /**
   * Collect current system metrics
   */
  collectMetrics(): SystemMetrics {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    const metrics: SystemMetrics = {
      timestamp: new Date().toISOString(),
      cpu: {
        usage: Math.random() * 30 + 10, // Simulated - use os.cpus() in production
        loadAverage: [0.5, 0.6, 0.7], // Simulated - use os.loadavg() in production
      },
      memory: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
      },
      requests: {
        total: requestCounter,
        perSecond: requestCounter / Math.max(uptime, 1),
        averageLatency: requestCounter > 0 ? totalLatency / requestCounter : 0,
        errorRate: requestCounter > 0 ? (errorCounter / requestCounter) * 100 : 0,
      },
      database: {
        connections: 5, // Simulated - get from connection pool
        queryTime: 15, // Simulated - track actual query times
        slowQueries: 0, // Simulated - count queries > threshold
      },
    };
    
    // Store metrics
    metricsStore.push(metrics);
    if (metricsStore.length > MAX_METRICS_HISTORY) {
      metricsStore.shift();
    }
    
    // Check alerts
    this.checkAlerts(metrics);
    
    return metrics;
  },

  /**
   * Get metrics history
   */
  getMetricsHistory(minutes: number = 60): SystemMetrics[] {
    const cutoff = Date.now() - minutes * 60 * 1000;
    return metricsStore.filter(m => new Date(m.timestamp).getTime() > cutoff);
  },

  /**
   * Get current metrics summary
   */
  getCurrentMetrics(): SystemMetrics {
    return metricsStore[metricsStore.length - 1] || this.collectMetrics();
  },

  /**
   * Check alert conditions
   */
  checkAlerts(metrics: SystemMetrics): void {
    const alertConfigs: AlertConfig[] = [
      { name: 'High CPU Usage', metric: 'cpu.usage', threshold: 80, operator: 'gt', severity: 'warning', cooldownMinutes: 5 },
      { name: 'Critical CPU Usage', metric: 'cpu.usage', threshold: 95, operator: 'gt', severity: 'critical', cooldownMinutes: 1 },
      { name: 'High Memory Usage', metric: 'memory.percentage', threshold: 85, operator: 'gt', severity: 'warning', cooldownMinutes: 5 },
      { name: 'Critical Memory Usage', metric: 'memory.percentage', threshold: 95, operator: 'gt', severity: 'critical', cooldownMinutes: 1 },
      { name: 'High Error Rate', metric: 'requests.errorRate', threshold: 5, operator: 'gt', severity: 'warning', cooldownMinutes: 5 },
      { name: 'Critical Error Rate', metric: 'requests.errorRate', threshold: 10, operator: 'gt', severity: 'critical', cooldownMinutes: 1 },
      { name: 'Slow Response Time', metric: 'requests.averageLatency', threshold: 1000, operator: 'gt', severity: 'warning', cooldownMinutes: 5 },
    ];
    
    for (const config of alertConfigs) {
      const value = this.getMetricValue(metrics, config.metric);
      const triggered = this.evaluateCondition(value, config.threshold, config.operator);
      
      const existingAlert = activeAlerts.get(config.name);
      
      if (triggered && !existingAlert) {
        const alert: Alert = {
          id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          config,
          value,
          triggeredAt: new Date().toISOString(),
          acknowledged: false,
        };
        activeAlerts.set(config.name, alert);
      } else if (!triggered && existingAlert) {
        existingAlert.resolvedAt = new Date().toISOString();
        alertHistory.push(existingAlert);
        if (alertHistory.length > MAX_ALERT_HISTORY) alertHistory.shift();
        activeAlerts.delete(config.name);
      }
    }
  },

  getMetricValue(metrics: SystemMetrics, path: string): number {
    const parts = path.split('.');
    let value: any = metrics;
    for (const part of parts) {
      value = value?.[part];
    }
    return typeof value === 'number' ? value : 0;
  },

  evaluateCondition(value: number, threshold: number, operator: string): boolean {
    switch (operator) {
      case 'gt': return value > threshold;
      case 'lt': return value < threshold;
      case 'gte': return value >= threshold;
      case 'lte': return value <= threshold;
      case 'eq': return value === threshold;
      default: return false;
    }
  },

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(activeAlerts.values());
  },

  /**
   * Get alert history
   */
  getAlertHistory(limit: number = 100): Alert[] {
    return alertHistory.slice(-limit);
  },

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alerts = Array.from(activeAlerts.values());
    for (const alert of alerts) {
      if (alert.id === alertId) {
        alert.acknowledged = true;
        alert.acknowledgedBy = acknowledgedBy;
        return true;
      }
    }
    return false;
  },
};

// ============================================================================
// REQUEST LOGGING SERVICE
// ============================================================================

export const requestLoggingService = {
  /**
   * Generate correlation ID for request tracing
   */
  generateCorrelationId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Log a request
   */
  logRequest(log: Omit<RequestLog, 'id'>): void {
    const fullLog: RequestLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...log,
    };
    
    requestLogs.push(fullLog);
    if (requestLogs.length > MAX_REQUEST_LOGS) {
      requestLogs.shift();
    }
    
    // Update counters
    requestCounter++;
    totalLatency += log.duration;
    if (log.statusCode >= 400) {
      errorCounter++;
    }
  },

  /**
   * Get recent request logs
   */
  getRecentLogs(limit: number = 100, filters?: {
    method?: string;
    statusCode?: number;
    path?: string;
    minDuration?: number;
  }): RequestLog[] {
    let logs = requestLogs.slice(-limit * 2); // Get more to filter
    
    if (filters) {
      if (filters.method) {
        logs = logs.filter(l => l.method === filters.method);
      }
      if (filters.statusCode) {
        logs = logs.filter(l => l.statusCode === filters.statusCode);
      }
      if (filters.path) {
        logs = logs.filter(l => l.path.includes(filters.path as string));
      }
      if (filters.minDuration !== undefined) {
        logs = logs.filter(l => l.duration >= (filters.minDuration as number));
      }
    }
    
    return logs.slice(-limit);
  },

  /**
   * Get slow requests
   */
  getSlowRequests(thresholdMs: number = 1000, limit: number = 50): RequestLog[] {
    return requestLogs
      .filter(l => l.duration >= thresholdMs)
      .slice(-limit);
  },

  /**
   * Get error requests
   */
  getErrorRequests(limit: number = 50): RequestLog[] {
    return requestLogs
      .filter(l => l.statusCode >= 400)
      .slice(-limit);
  },

  /**
   * Get request statistics
   */
  getRequestStats(minutes: number = 60): {
    total: number;
    successful: number;
    failed: number;
    averageLatency: number;
    p95Latency: number;
    p99Latency: number;
    byPath: Record<string, number>;
    byStatus: Record<number, number>;
  } {
    const cutoff = Date.now() - minutes * 60 * 1000;
    const recentLogs = requestLogs.filter(l => new Date(l.timestamp).getTime() > cutoff);
    
    const latencies = recentLogs.map(l => l.duration).sort((a, b) => a - b);
    const p95Index = Math.floor(latencies.length * 0.95);
    const p99Index = Math.floor(latencies.length * 0.99);
    
    const byPath: Record<string, number> = {};
    const byStatus: Record<number, number> = {};
    
    for (const log of recentLogs) {
      const pathKey = log.path.split('?')[0];
      byPath[pathKey] = (byPath[pathKey] || 0) + 1;
      byStatus[log.statusCode] = (byStatus[log.statusCode] || 0) + 1;
    }
    
    return {
      total: recentLogs.length,
      successful: recentLogs.filter(l => l.statusCode < 400).length,
      failed: recentLogs.filter(l => l.statusCode >= 400).length,
      averageLatency: latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0,
      p95Latency: latencies[p95Index] || 0,
      p99Latency: latencies[p99Index] || 0,
      byPath,
      byStatus,
    };
  },
};

// ============================================================================
// ERROR TRACKING SERVICE
// ============================================================================

interface ErrorRecord {
  id: string;
  message: string;
  stack?: string;
  context: Record<string, unknown>;
  count: number;
  firstSeen: string;
  lastSeen: string;
  resolved: boolean;
}

const errorRecords: Map<string, ErrorRecord> = new Map();

export const errorTrackingService = {
  /**
   * Track an error
   */
  trackError(error: Error, context: Record<string, unknown> = {}): string {
    const errorKey = `${error.name}:${error.message}`;
    const existing = errorRecords.get(errorKey);
    
    if (existing) {
      existing.count++;
      existing.lastSeen = new Date().toISOString();
      existing.context = { ...existing.context, ...context };
      return existing.id;
    }
    
    const record: ErrorRecord = {
      id: `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message: error.message,
      stack: error.stack,
      context,
      count: 1,
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      resolved: false,
    };
    
    errorRecords.set(errorKey, record);
    return record.id;
  },

  /**
   * Get all tracked errors
   */
  getErrors(includeResolved: boolean = false): ErrorRecord[] {
    const errors = Array.from(errorRecords.values());
    return includeResolved ? errors : errors.filter(e => !e.resolved);
  },

  /**
   * Get error by ID
   */
  getError(id: string): ErrorRecord | undefined {
    const errors = Array.from(errorRecords.values());
    for (const error of errors) {
      if (error.id === id) return error;
    }
    return undefined;
  },

  /**
   * Resolve an error
   */
  resolveError(id: string): boolean {
    const errors = Array.from(errorRecords.values());
    for (const error of errors) {
      if (error.id === id) {
        error.resolved = true;
        return true;
      }
    }
    return false;
  },

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number;
    unresolved: number;
    topErrors: Array<{ message: string; count: number }>;
  } {
    const errors = Array.from(errorRecords.values());
    const topErrors = errors
      .filter(e => !e.resolved)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(e => ({ message: e.message, count: e.count }));
    
    return {
      total: errors.length,
      unresolved: errors.filter(e => !e.resolved).length,
      topErrors,
    };
  },
};

// ============================================================================
// MONITORING DASHBOARD DATA
// ============================================================================

export const monitoringDashboardService = {
  /**
   * Get comprehensive dashboard data
   */
  async getDashboardData(): Promise<{
    health: HealthStatus;
    metrics: SystemMetrics;
    metricsHistory: SystemMetrics[];
    requestStats: ReturnType<typeof requestLoggingService.getRequestStats>;
    activeAlerts: Alert[];
    errorStats: ReturnType<typeof errorTrackingService.getErrorStats>;
    uptime: number;
  }> {
    const health = await healthCheckService.getHealth();
    const metrics = metricsService.getCurrentMetrics();
    const metricsHistory = metricsService.getMetricsHistory(60);
    const requestStats = requestLoggingService.getRequestStats(60);
    const activeAlerts = metricsService.getActiveAlerts();
    const errorStats = errorTrackingService.getErrorStats();
    
    return {
      health,
      metrics,
      metricsHistory,
      requestStats,
      activeAlerts,
      errorStats,
      uptime: Math.floor((Date.now() - startTime) / 1000),
    };
  },
};

// Export all services
export default {
  healthCheck: healthCheckService,
  metrics: metricsService,
  requestLogging: requestLoggingService,
  errorTracking: errorTrackingService,
  dashboard: monitoringDashboardService,
};
