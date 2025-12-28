/**
 * YETO Platform - Hardening Services Index
 * Section 9: Production-grade monitoring, backup, performance, and security
 */

// Monitoring & Observability (9A)
export {
  healthCheckService,
  metricsService,
  requestLoggingService,
  errorTrackingService,
  monitoringDashboardService,
  type HealthStatus,
  type HealthCheck,
  type SystemMetrics,
  type RequestLog,
  type Alert,
  type AlertConfig,
} from './monitoring';

// Backup & Recovery (9B)
export {
  backupService,
  recoveryService,
  integrityService,
  type BackupConfig,
  type BackupRecord,
  type RecoveryPoint,
  type RecoveryOperation,
} from './backup';

// Performance Optimization (9C)
export {
  cacheService,
  rateLimitService,
  rateLimitConfigs,
  queryOptimizationService,
  compressionService,
  benchmarkService,
  lazyLoadService,
  type CacheEntry,
  type CacheStats,
  type RateLimitConfig,
  type RateLimitResult,
  type QueryMetrics,
  type BenchmarkResult,
} from './performance';

// Security Hardening (9D)
export {
  securityHeadersService,
  csrfService,
  sanitizationService,
  auditService,
  bruteForceService,
  apiKeyService,
  securityScannerService,
  type SecurityHeaders,
  type CSRFToken,
  type SecurityAuditLog,
  type SecurityEventType,
  type BruteForceRecord,
  type APIKey,
  type SecurityScanResult,
} from './security';

// Default export with all services grouped
export default {
  monitoring: {
    healthCheck: () => import('./monitoring').then(m => m.healthCheckService),
    metrics: () => import('./monitoring').then(m => m.metricsService),
    requestLogging: () => import('./monitoring').then(m => m.requestLoggingService),
    errorTracking: () => import('./monitoring').then(m => m.errorTrackingService),
    dashboard: () => import('./monitoring').then(m => m.monitoringDashboardService),
  },
  backup: {
    backup: () => import('./backup').then(m => m.backupService),
    recovery: () => import('./backup').then(m => m.recoveryService),
    integrity: () => import('./backup').then(m => m.integrityService),
  },
  performance: {
    cache: () => import('./performance').then(m => m.cacheService),
    rateLimit: () => import('./performance').then(m => m.rateLimitService),
    queryOptimization: () => import('./performance').then(m => m.queryOptimizationService),
    compression: () => import('./performance').then(m => m.compressionService),
    benchmark: () => import('./performance').then(m => m.benchmarkService),
    lazyLoad: () => import('./performance').then(m => m.lazyLoadService),
  },
  security: {
    headers: () => import('./security').then(m => m.securityHeadersService),
    csrf: () => import('./security').then(m => m.csrfService),
    sanitization: () => import('./security').then(m => m.sanitizationService),
    audit: () => import('./security').then(m => m.auditService),
    bruteForce: () => import('./security').then(m => m.bruteForceService),
    apiKey: () => import('./security').then(m => m.apiKeyService),
    scanner: () => import('./security').then(m => m.securityScannerService),
  },
};
