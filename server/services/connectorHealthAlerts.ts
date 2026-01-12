/**
 * Connector Health Alert Service
 * Monitors data connector health and sends alerts for failures and stale data
 */

import { getDb } from "../db";
import { schedulerJobs, alerts } from "../../drizzle/schema";
import { eq, and, lt, sql, desc } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

// ============================================
// Types
// ============================================

export interface ConnectorHealthStatus {
  connectorId: string;
  connectorName: string;
  status: "healthy" | "warning" | "critical";
  lastSuccessfulFetch: Date | null;
  daysSinceLastFetch: number | null;
  lastError: string | null;
  recordCount: number;
}

export interface HealthAlertConfig {
  staleDataThresholdDays: number;
  criticalThresholdDays: number;
  enableEmailAlerts: boolean;
}

// Default configuration
const DEFAULT_CONFIG: HealthAlertConfig = {
  staleDataThresholdDays: 7,
  criticalThresholdDays: 14,
  enableEmailAlerts: true,
};

// Connector definitions
const CONNECTORS = [
  { id: "world-bank", name: "World Bank WDI", critical: true },
  { id: "unhcr", name: "UNHCR", critical: true },
  { id: "who-gho", name: "WHO GHO", critical: true },
  { id: "ocha-fts", name: "OCHA FTS", critical: true },
  { id: "hdx", name: "HDX CKAN", critical: false },
  { id: "fews-net", name: "FEWS NET", critical: true },
  { id: "unicef", name: "UNICEF", critical: false },
  { id: "wfp-vam", name: "WFP VAM", critical: true },
  { id: "reliefweb", name: "ReliefWeb", critical: false },
];

// ============================================
// Health Check Functions
// ============================================

/**
 * Check health status of all connectors
 */
export async function checkConnectorHealth(
  config: HealthAlertConfig = DEFAULT_CONFIG
): Promise<ConnectorHealthStatus[]> {
  const db = await getDb();
  if (!db) return [];

  const results: ConnectorHealthStatus[] = [];
  const now = new Date();

  for (const connector of CONNECTORS) {
    try {
      // Get last successful job run for this connector
      const jobName = `${connector.id.replace(/-/g, "_")}_daily`;
      const jobResult = await db.select()
        .from(schedulerJobs)
        .where(eq(schedulerJobs.jobName, jobName))
        .limit(1);

      let lastSuccessfulFetch: Date | null = null;
      let lastError: string | null = null;

      if (jobResult.length > 0) {
        const job = jobResult[0];
        if (job.lastRunStatus === "success" && job.lastRunAt) {
          lastSuccessfulFetch = new Date(job.lastRunAt);
        }
        if (job.lastRunStatus === "failed" && job.lastRunError) {
          lastError = job.lastRunError;
        }
      }

      // Calculate days since last fetch
      let daysSinceLastFetch: number | null = null;
      if (lastSuccessfulFetch) {
        daysSinceLastFetch = Math.floor(
          (now.getTime() - lastSuccessfulFetch.getTime()) / (1000 * 60 * 60 * 24)
        );
      }

      // Determine health status
      let status: "healthy" | "warning" | "critical" = "healthy";
      if (lastError) {
        status = "critical";
      } else if (daysSinceLastFetch === null) {
        status = "warning"; // Never fetched
      } else if (daysSinceLastFetch >= config.criticalThresholdDays) {
        status = "critical";
      } else if (daysSinceLastFetch >= config.staleDataThresholdDays) {
        status = "warning";
      }

      // Get record count (approximate based on indicator prefix)
      const recordCountResult = await db.execute(sql`
        SELECT COUNT(*) as count FROM time_series 
        WHERE indicatorCode LIKE ${connector.id.replace(/-/g, "_").toUpperCase() + "_%"}
      `);
      const recordCount = Number((recordCountResult as any[])[0]?.count) || 0;

      results.push({
        connectorId: connector.id,
        connectorName: connector.name,
        status,
        lastSuccessfulFetch,
        daysSinceLastFetch,
        lastError,
        recordCount,
      });
    } catch (error) {
      console.error(`[HealthAlerts] Error checking ${connector.name}:`, error);
      results.push({
        connectorId: connector.id,
        connectorName: connector.name,
        status: "critical",
        lastSuccessfulFetch: null,
        daysSinceLastFetch: null,
        lastError: `Health check failed: ${error}`,
        recordCount: 0,
      });
    }
  }

  return results;
}

/**
 * Send alert notification for connector issues
 */
export async function sendConnectorAlert(
  connectorName: string,
  alertType: "failure" | "stale_data",
  details: string
): Promise<boolean> {
  const title = alertType === "failure"
    ? `🚨 YETO Data Connector Failed: ${connectorName}`
    : `⚠️ YETO Stale Data Alert: ${connectorName}`;

  const content = `
**Alert Type:** ${alertType === "failure" ? "Connector Failure" : "Stale Data Warning"}
**Connector:** ${connectorName}
**Time:** ${new Date().toISOString()}

**Details:**
${details}

**Action Required:**
${alertType === "failure" 
  ? "Please check the connector configuration and API availability. Review the error logs in the Admin Dashboard."
  : "Data has not been updated in over 7 days. Please verify the data source is accessible and the scheduled job is running."}

---
View the API Health Dashboard: /admin/api-health
  `.trim();

  try {
    const sent = await notifyOwner({ title, content });
    console.log(`[HealthAlerts] Alert sent for ${connectorName}: ${sent}`);
    return sent;
  } catch (error) {
    console.error(`[HealthAlerts] Failed to send alert for ${connectorName}:`, error);
    return false;
  }
}

/**
 * Store alert in database for tracking
 */
export async function storeHealthAlert(
  connectorId: string,
  alertType: "connector_failure" | "stale_data",
  details: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(alerts).values({
      type: "system",
      severity: alertType === "connector_failure" ? "critical" : "warning",
      title: alertType === "connector_failure" 
        ? `Connector Failed: ${connectorId}`
        : `Stale Data: ${connectorId}`,
      description: details,
      indicatorCode: connectorId,
      isRead: false,
    });
  } catch (error) {
    console.error(`[HealthAlerts] Failed to store alert:`, error);
  }
}

/**
 * Run full health check and send alerts for issues
 */
export async function runHealthCheckAndAlert(
  config: HealthAlertConfig = DEFAULT_CONFIG
): Promise<{
  totalConnectors: number;
  healthy: number;
  warning: number;
  critical: number;
  alertsSent: number;
}> {
  console.log("[HealthAlerts] Running connector health check...");
  
  const healthStatuses = await checkConnectorHealth(config);
  let alertsSent = 0;

  const summary = {
    totalConnectors: healthStatuses.length,
    healthy: 0,
    warning: 0,
    critical: 0,
    alertsSent: 0,
  };

  for (const status of healthStatuses) {
    switch (status.status) {
      case "healthy":
        summary.healthy++;
        break;
      case "warning":
        summary.warning++;
        if (config.enableEmailAlerts && status.daysSinceLastFetch !== null) {
          const sent = await sendConnectorAlert(
            status.connectorName,
            "stale_data",
            `Data has not been updated for ${status.daysSinceLastFetch} days.`
          );
          if (sent) alertsSent++;
          await storeHealthAlert(
            status.connectorId,
            "stale_data",
            `Data stale for ${status.daysSinceLastFetch} days`
          );
        }
        break;
      case "critical":
        summary.critical++;
        if (config.enableEmailAlerts) {
          const details = status.lastError 
            ? `Error: ${status.lastError}`
            : status.daysSinceLastFetch !== null
              ? `Data has not been updated for ${status.daysSinceLastFetch} days (critical threshold exceeded).`
              : "Connector has never successfully fetched data.";
          
          const sent = await sendConnectorAlert(
            status.connectorName,
            "failure",
            details
          );
          if (sent) alertsSent++;
          await storeHealthAlert(
            status.connectorId,
            "connector_failure",
            details
          );
        }
        break;
    }
  }

  summary.alertsSent = alertsSent;
  console.log(`[HealthAlerts] Health check complete: ${summary.healthy} healthy, ${summary.warning} warning, ${summary.critical} critical, ${alertsSent} alerts sent`);
  
  return summary;
}

/**
 * Get data freshness info for homepage KPIs
 */
export async function getDataFreshnessInfo(): Promise<{
  lastUpdated: Date | null;
  hoursAgo: number | null;
  freshnessLabel: string;
  freshnessStatus: "fresh" | "recent" | "stale" | "unknown";
}> {
  const db = await getDb();
  if (!db) {
    return {
      lastUpdated: null,
      hoursAgo: null,
      freshnessLabel: "Unknown",
      freshnessStatus: "unknown",
    };
  }

  try {
    // Get the most recent data update across all time series
    const result = await db.execute(sql`
      SELECT MAX(updatedAt) as lastUpdate FROM time_series
    `);
    
    const lastUpdate = (result as any[])[0]?.lastUpdate;
    if (!lastUpdate) {
      return {
        lastUpdated: null,
        hoursAgo: null,
        freshnessLabel: "No data",
        freshnessStatus: "unknown",
      };
    }

    const lastUpdated = new Date(lastUpdate);
    const now = new Date();
    const hoursAgo = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60));
    
    let freshnessLabel: string;
    let freshnessStatus: "fresh" | "recent" | "stale" | "unknown";

    if (hoursAgo < 1) {
      freshnessLabel = "Just now";
      freshnessStatus = "fresh";
    } else if (hoursAgo < 24) {
      freshnessLabel = `${hoursAgo}h ago`;
      freshnessStatus = "fresh";
    } else if (hoursAgo < 48) {
      freshnessLabel = "Yesterday";
      freshnessStatus = "recent";
    } else if (hoursAgo < 168) { // 7 days
      const days = Math.floor(hoursAgo / 24);
      freshnessLabel = `${days}d ago`;
      freshnessStatus = "recent";
    } else {
      const days = Math.floor(hoursAgo / 24);
      freshnessLabel = `${days}d ago`;
      freshnessStatus = "stale";
    }

    return {
      lastUpdated,
      hoursAgo,
      freshnessLabel,
      freshnessStatus,
    };
  } catch (error) {
    console.error("[HealthAlerts] Error getting data freshness:", error);
    return {
      lastUpdated: null,
      hoursAgo: null,
      freshnessLabel: "Unknown",
      freshnessStatus: "unknown",
    };
  }
}

// Export for use in scheduler
export { DEFAULT_CONFIG as HEALTH_ALERT_CONFIG };
