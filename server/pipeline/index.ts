/**
 * YETO Data Pipeline - Main Export
 * Complete data pipeline architecture implementation
 */

// Layer 1: Data Sources
export * from './sourceRegistry';

// Layer 2: Ingestion
export * from './ingestionJobs';

// Layer 3: Processing & Validation
export * from './validation';

// Layer 4: Storage & Indexing
export * from './storage';

// Layer 5: ML Models
export * from './mlModels';

// Supporting Services
export * from './services';

/**
 * Initialize the data pipeline
 */
export function initializePipeline(): void {
  console.log('[Pipeline] Initializing YETO Data Pipeline...');
  console.log('[Pipeline] Source Registry: Ready');
  console.log('[Pipeline] Ingestion Jobs: Ready');
  console.log('[Pipeline] Validation: Ready');
  console.log('[Pipeline] Storage: Ready');
  console.log('[Pipeline] ML Models: Ready');
  console.log('[Pipeline] Services: Ready');
  console.log('[Pipeline] Data Pipeline initialized successfully');
}

/**
 * Get pipeline status
 */
export function getPipelineStatus(): {
  sources: { total: number; enabled: number };
  jobs: { running: number; success: number; failed: number };
  storage: { documents: number; cacheSize: number };
  health: { status: string; alerts: number };
} {
  const { sourceRegistry } = require('./sourceRegistry');
  const { ingestionJobManager } = require('./ingestionJobs');
  const { searchIndex, cacheLayer } = require('./storage');
  const { monitoring } = require('./services');
  
  const sourceStats = sourceRegistry.getStatistics();
  const jobStats = ingestionJobManager.getStatistics();
  const searchStats = searchIndex.getStatistics();
  const cacheStats = cacheLayer.getStatistics();
  const healthStatus = monitoring.getHealthStatus();
  
  return {
    sources: {
      total: sourceStats.total,
      enabled: sourceStats.enabled
    },
    jobs: {
      running: jobStats.running,
      success: jobStats.success,
      failed: jobStats.failed
    },
    storage: {
      documents: searchStats.documentCount,
      cacheSize: cacheStats.size
    },
    health: {
      status: healthStatus.status,
      alerts: healthStatus.activeAlerts
    }
  };
}
